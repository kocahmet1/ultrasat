/**
 * ExamHighlighter — Bluebook-style select-to-highlight for the practice exam.
 *
 * Select text in the passage or the question stem and a small toolbar appears
 * with three highlight colors (yellow / blue / pink, like Bluebook), plus the
 * "Add to Word Bank" bookmark that used to be WordSaver's job in the exam
 * (same silent-save API; answer choices remain deliberately excluded).
 * Clicking an existing highlight offers "Remove highlight".
 *
 * Highlights are stored per question as character offsets into the container's
 * text, in a ref that lives as long as the module is mounted — so they survive
 * Back/Next navigation within the module. They are session-only (not saved to
 * exam progress), mirroring Bluebook where highlights don't leave the test.
 *
 * DOM notes: containers render via dangerouslySetInnerHTML; React only resets
 * that innerHTML when the question (the HTML string) changes, so wrapping
 * <mark> elements here survives unrelated re-renders. On question change, the
 * stored offsets are re-applied after React commits the fresh HTML. Offsets
 * are computed with Range.toString(), which ignores element boundaries, so
 * they stay valid no matter how many <mark> wrappers are present.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FiBookmark, FiCheck, FiTrash2 } from 'react-icons/fi';
import { saveWordFromSelection } from '../api/helperClient';
import { logEvent, EVENT_TYPES } from '../coach/events';
import '../styles/ExamHighlighter.css';

const CONTAINER_SELECTOR = '.question-passage, .question-stem';
const FALLBACK_SELECTOR = '.left-column .question-text';
const COLORS = ['yellow', 'blue', 'pink'];
const MAX_WORDS = 4;   // word-bank limits, same as WordSaver
const MAX_CHARS = 50;

let hlCounter = 0;
const nextHlId = () => `hl-${Date.now().toString(36)}-${hlCounter++}`;

/* ---------------- DOM helpers (plain functions, unit-testable) ---------------- */

function resolveContainer(node) {
  const el = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
  if (!el || !el.closest) return null;
  return el.closest(CONTAINER_SELECTOR) || el.closest(FALLBACK_SELECTOR);
}

function containerKeyOf(el) {
  if (el.classList.contains('question-passage')) return 'passage';
  if (el.classList.contains('question-stem')) return 'stem';
  return 'qtext';
}

function findContainerByKey(key) {
  if (key === 'passage') return document.querySelector('.app.exam-bb .question-passage');
  if (key === 'stem') return document.querySelector('.app.exam-bb .question-stem');
  return document.querySelector('.app.exam-bb .left-column .question-text');
}

/** Character offsets of the current selection within `container`. */
export function selectionOffsets(container, range) {
  const pre = document.createRange();
  pre.selectNodeContents(container);
  pre.setEnd(range.startContainer, range.startOffset);
  const start = pre.toString().length;
  const end = start + range.toString().length;
  return end > start ? { start, end } : null;
}

/** Wrap [start, end) character range of `container` in <mark> elements. */
export function applyHighlight(container, { start, end, color, id }) {
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  const targets = [];
  let pos = 0;
  while (walker.nextNode()) {
    const node = walker.currentNode;
    const len = node.textContent.length;
    const nodeStart = pos;
    const nodeEnd = pos + len;
    if (nodeEnd > start && nodeStart < end && len > 0) {
      targets.push({
        node,
        from: Math.max(0, start - nodeStart),
        to: Math.min(len, end - nodeStart),
      });
    }
    pos = nodeEnd;
    if (pos >= end) break;
  }
  targets.forEach(({ node, from, to }) => {
    if (from >= to) return;
    const range = document.createRange();
    range.setStart(node, from);
    range.setEnd(node, to);
    const mark = document.createElement('mark');
    mark.className = `bb-hl bb-hl-${color}`;
    mark.dataset.hlId = id;
    try {
      range.surroundContents(mark); // safe: the range is within one text node
    } catch (_) { /* skip un-wrappable segment rather than crash */ }
  });
}

/** Unwrap every highlight mark inside `container`. */
export function clearHighlights(container) {
  container.querySelectorAll('mark.bb-hl').forEach((m) => {
    const parent = m.parentNode;
    while (m.firstChild) parent.insertBefore(m.firstChild, m);
    parent.removeChild(m);
  });
  container.normalize();
}

/* ------------------------------- component ------------------------------- */

const ExamHighlighter = ({ questionIndex, metadata = {} }) => {
  // toolbar: null | { mode: 'select'|'remove', rect, key, offsets, term, markId }
  const [toolbar, setToolbar] = useState(null);
  const [savePhase, setSavePhase] = useState('idle'); // idle | saving | saved | exists | error

  // Map<questionIndex, Map<containerKey, Array<{start,end,color,id}>>>
  const storeRef = useRef(new Map());
  const metadataRef = useRef(metadata);
  metadataRef.current = metadata;
  const toolbarElRef = useRef(null);
  const debounceRef = useRef(null);

  const entriesFor = useCallback((qIdx, key) => {
    if (!storeRef.current.has(qIdx)) storeRef.current.set(qIdx, new Map());
    const byKey = storeRef.current.get(qIdx);
    if (!byKey.has(key)) byKey.set(key, []);
    return byKey.get(key);
  }, []);

  const repaintContainer = useCallback((qIdx, key) => {
    const container = findContainerByKey(key);
    if (!container) return;
    clearHighlights(container);
    entriesFor(qIdx, key).forEach((entry) => applyHighlight(container, entry));
  }, [entriesFor]);

  const repaintAll = useCallback((qIdx) => {
    ['passage', 'stem', 'qtext'].forEach((key) => repaintContainer(qIdx, key));
  }, [repaintContainer]);

  // Re-apply stored highlights whenever the question changes (after React
  // has committed the new dangerouslySetInnerHTML content).
  useEffect(() => {
    setToolbar(null);
    setSavePhase('idle');
    const raf = requestAnimationFrame(() => repaintAll(questionIndex));
    return () => cancelAnimationFrame(raf);
  }, [questionIndex, repaintAll]);

  /* ---------------- selection → toolbar ---------------- */

  const readSelection = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) return null;
    const range = sel.getRangeAt(0);
    const container = resolveContainer(range.commonAncestorContainer);
    if (!container) return null;
    if (!container.contains(range.startContainer) || !container.contains(range.endContainer)) return null;
    const offsets = selectionOffsets(container, range);
    if (!offsets) return null;
    const rect = range.getBoundingClientRect();
    if (!rect || (rect.width === 0 && rect.height === 0)) return null;

    // Word-bank eligibility (same limits as WordSaver)
    const raw = sel.toString().replace(/\s+/g, ' ').trim();
    const term = raw.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '');
    const termOk =
      term && /\p{L}/u.test(term) && term.length <= MAX_CHARS && term.split(' ').length <= MAX_WORDS;

    // Context for the AI definition (surrounding text)
    let context = '';
    if (termOk) {
      const containerText = (container.innerText || container.textContent || '').replace(/\s+/g, ' ');
      const idx = containerText.toLowerCase().indexOf(raw.toLowerCase());
      if (idx >= 0) {
        const s = Math.max(0, idx - 160);
        const e = Math.min(containerText.length, idx + raw.length + 160);
        context = (s > 0 ? '…' : '') + containerText.slice(s, e).trim() + (e < containerText.length ? '…' : '');
      }
    }

    return {
      mode: 'select',
      rect,
      key: containerKeyOf(container),
      offsets,
      term: termOk ? term : null,
      context,
    };
  }, []);

  useEffect(() => {
    const evaluate = () => {
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        const info = readSelection();
        setSavePhase('idle');
        setToolbar((prev) => {
          // Don't clobber the remove-toolbar with a null selection
          if (!info && prev && prev.mode === 'remove') return prev;
          return info;
        });
      }, 180);
    };

    const onPointerUp = () => evaluate();
    const onSelectionChange = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed) evaluate(); // handles tap-to-dismiss
    };
    const onMarkClick = (e) => {
      const mark = e.target.closest && e.target.closest('mark.bb-hl');
      if (!mark) return;
      const container = resolveContainer(mark);
      if (!container) return;
      e.preventDefault();
      const rect = mark.getBoundingClientRect();
      setToolbar({ mode: 'remove', rect, key: containerKeyOf(container), markId: mark.dataset.hlId });
    };
    const onScroll = () => setToolbar(null); // anchor rect goes stale
    const onDocMouseDown = (e) => {
      // Clicks outside the toolbar & outside marks dismiss the remove-toolbar
      if (toolbarElRef.current && toolbarElRef.current.contains(e.target)) return;
      if (e.target.closest && e.target.closest('mark.bb-hl')) return;
      setToolbar((prev) => (prev && prev.mode === 'remove' ? null : prev));
    };

    document.addEventListener('mouseup', onPointerUp);
    document.addEventListener('touchend', onPointerUp);
    document.addEventListener('selectionchange', onSelectionChange);
    document.addEventListener('click', onMarkClick);
    document.addEventListener('mousedown', onDocMouseDown);
    window.addEventListener('scroll', onScroll, true);
    return () => {
      clearTimeout(debounceRef.current);
      document.removeEventListener('mouseup', onPointerUp);
      document.removeEventListener('touchend', onPointerUp);
      document.removeEventListener('selectionchange', onSelectionChange);
      document.removeEventListener('click', onMarkClick);
      document.removeEventListener('mousedown', onDocMouseDown);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, [readSelection]);

  /* ---------------- actions ---------------- */

  const handleHighlight = (color) => {
    if (!toolbar || toolbar.mode !== 'select') return;
    entriesFor(questionIndex, toolbar.key).push({
      ...toolbar.offsets,
      color,
      id: nextHlId(),
    });
    repaintContainer(questionIndex, toolbar.key);
    try { window.getSelection()?.removeAllRanges(); } catch (_) { /* noop */ }
    setToolbar(null);
  };

  const handleRemove = () => {
    if (!toolbar || toolbar.mode !== 'remove') return;
    const list = entriesFor(questionIndex, toolbar.key);
    const idx = list.findIndex((e) => e.id === toolbar.markId);
    if (idx !== -1) list.splice(idx, 1);
    repaintContainer(questionIndex, toolbar.key);
    setToolbar(null);
  };

  const handleSaveWord = async () => {
    if (!toolbar || !toolbar.term || savePhase === 'saving') return;
    setSavePhase('saving');
    try {
      const meta = metadataRef.current || {};
      const saved = await saveWordFromSelection(toolbar.term, toolbar.context, 'practice-exam', meta);
      if (!saved.alreadyExists) {
        logEvent(EVENT_TYPES.WORD_SAVED, {
          term: saved.term,
          source: 'practice-exam',
          subcategoryId: meta.subcategory,
          sourceQuestionId: meta.questionId,
        });
      }
      setSavePhase(saved.alreadyExists ? 'exists' : 'saved');
      setTimeout(() => setToolbar(null), 1200);
    } catch (err) {
      console.error('[ExamHighlighter] word save failed:', err);
      setSavePhase('error');
    }
  };

  /* ---------------- render ---------------- */

  if (!toolbar) return null;

  const { rect } = toolbar;
  const placeBelow = rect.top < 64;
  const style = {
    left: `${Math.min(Math.max(rect.left + rect.width / 2, 110), (window.innerWidth || 1024) - 110)}px`,
    top: placeBelow ? `${rect.bottom + 10}px` : `${rect.top - 10}px`,
    transform: placeBelow ? 'translateX(-50%)' : 'translate(-50%, -100%)',
  };

  return createPortal(
    <div ref={toolbarElRef} className="exam-hl-toolbar" style={style} role="toolbar" aria-label="Highlight tools">
      {toolbar.mode === 'select' ? (
        <>
          {COLORS.map((color) => (
            <button
              key={color}
              type="button"
              className={`exam-hl-dot exam-hl-dot--${color}`}
              aria-label={`Highlight ${color}`}
              onMouseDown={(e) => e.preventDefault()} /* keep the selection alive */
              onClick={() => handleHighlight(color)}
            />
          ))}
          {toolbar.term && (
            <>
              <span className="exam-hl-sep" />
              <button
                type="button"
                className="exam-hl-book"
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleSaveWord}
                aria-label="Add to Word Bank"
                title="Add to Word Bank"
                disabled={savePhase === 'saving'}
              >
                {savePhase === 'saved' || savePhase === 'exists' ? <FiCheck /> : <FiBookmark />}
                {savePhase === 'saving' && <span className="exam-hl-book-label">Saving…</span>}
                {savePhase === 'saved' && <span className="exam-hl-book-label">Saved</span>}
                {savePhase === 'exists' && <span className="exam-hl-book-label">In bank</span>}
                {savePhase === 'error' && <span className="exam-hl-book-label">Retry</span>}
              </button>
            </>
          )}
        </>
      ) : (
        <button type="button" className="exam-hl-remove" onClick={handleRemove}>
          <FiTrash2 aria-hidden="true" />
          Remove highlight
        </button>
      )}
    </div>,
    document.body
  );
};

export default ExamHighlighter;
