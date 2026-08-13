/**
 * WordSaver — select-to-save vocabulary popover.
 *
 * Watches text selections inside elements matching `selector` (works over
 * dangerouslySetInnerHTML content). When the student selects a word or short
 * phrase, a small floating "Add to Word Bank" button appears above the
 * selection. One click saves it via POST /api/bank/define-and-save, which
 * generates a context-aware definition with the AI helper (globally cached)
 * and dedupes against the existing bank.
 *
 * Usage:
 *   <WordSaver
 *     selector=".sqr-passage, .sqr-prompt"
 *     source="smart-quiz"
 *     metadata={{ quizId, questionId, subcategory }}
 *     showDefinition            // show the definition after saving (omit in timed exams)
 *   />
 *
 * Renders nothing inline — the popover is portaled to document.body, so it
 * never affects the host page's layout.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FiBookmark, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { saveWordFromSelection } from '../api/helperClient';
import { logEvent, EVENT_TYPES } from '../coach/events';
import '../styles/WordSaver.css';

const MAX_WORDS = 4;
const MAX_CHARS = 50;
const CONTEXT_RADIUS = 160;

/** Validate the current selection and extract term + surrounding context. */
function getValidSelection(selector) {
  const sel = window.getSelection();
  if (!sel || sel.isCollapsed || sel.rangeCount === 0) return null;

  const rawText = sel.toString().replace(/\s+/g, ' ').trim();
  if (!rawText || rawText.length > MAX_CHARS) return null;

  // Strip surrounding punctuation/quotes
  const term = rawText.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '');
  if (!term || !/\p{L}/u.test(term)) return null;
  if (term.split(' ').length > MAX_WORDS) return null;

  const range = sel.getRangeAt(0);
  const node = range.commonAncestorContainer;
  const el = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
  const container = el && el.closest ? el.closest(selector) : null;
  if (!container) return null;

  // Surrounding text as context for the definition
  const containerText = (container.innerText || container.textContent || '').replace(/\s+/g, ' ');
  let context = '';
  const idx = containerText.toLowerCase().indexOf(rawText.toLowerCase());
  if (idx >= 0) {
    const start = Math.max(0, idx - CONTEXT_RADIUS);
    const end = Math.min(containerText.length, idx + rawText.length + CONTEXT_RADIUS);
    context =
      (start > 0 ? '…' : '') +
      containerText.slice(start, end).trim() +
      (end < containerText.length ? '…' : '');
  } else {
    context = containerText.slice(0, CONTEXT_RADIUS * 2);
  }

  const rect = range.getBoundingClientRect();
  if (!rect || (rect.width === 0 && rect.height === 0)) return null;

  return { term, context, rect };
}

const WordSaver = ({
  selector,
  source = 'highlight',
  metadata = {},
  showDefinition = true,
  enabled = true,
}) => {
  // phase: idle | ready | saving | saved | exists | error
  const [phase, setPhase] = useState('idle');
  const [current, setCurrent] = useState(null); // { term, context, rect }
  const [result, setResult] = useState(null);   // { term, definition, alreadyExists }

  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const metadataRef = useRef(metadata);
  metadataRef.current = metadata;
  const popoverRef = useRef(null);
  const debounceRef = useRef(null);
  const dismissRef = useRef(null);
  // Set when the page scrolls/resizes while a save is in flight — the captured
  // selection rect is stale, so we skip showing the result popover afterwards.
  const staleRectRef = useRef(false);

  const reset = useCallback(() => {
    clearTimeout(dismissRef.current);
    setPhase('idle');
    setCurrent(null);
    setResult(null);
  }, []);

  // Watch selections
  useEffect(() => {
    if (!enabled) return undefined;

    const onSelectionChange = () => {
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        if (phaseRef.current === 'saving') return;
        const found = getValidSelection(selector);
        if (found) {
          clearTimeout(dismissRef.current);
          setResult(null);
          setCurrent(found);
          setPhase('ready');
        } else if (phaseRef.current === 'ready') {
          // Selection collapsed/invalid while the button was showing
          setPhase('idle');
          setCurrent(null);
        }
      }, 200);
    };

    const onPointerDown = (e) => {
      if (popoverRef.current && popoverRef.current.contains(e.target)) return;
      if (phaseRef.current === 'saved' || phaseRef.current === 'exists' || phaseRef.current === 'error') {
        reset();
      }
    };

    const onScrollOrResize = () => {
      if (phaseRef.current === 'saving') {
        staleRectRef.current = true;
      } else if (phaseRef.current !== 'idle') {
        reset();
      }
    };

    document.addEventListener('selectionchange', onSelectionChange);
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('scroll', onScrollOrResize, true);
    window.addEventListener('resize', onScrollOrResize);

    return () => {
      document.removeEventListener('selectionchange', onSelectionChange);
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
      window.removeEventListener('scroll', onScrollOrResize, true);
      window.removeEventListener('resize', onScrollOrResize);
      clearTimeout(debounceRef.current);
      clearTimeout(dismissRef.current);
    };
  }, [enabled, selector, reset]);

  const handleSave = useCallback(async () => {
    if (!current || phaseRef.current === 'saving') return;
    staleRectRef.current = false;
    setPhase('saving');

    // If the user made a NEW selection while the request was in flight,
    // show a fresh popover for it instead of the (now irrelevant) result.
    const pivotToLiveSelection = () => {
      const live = getValidSelection(selector);
      if (live && live.term !== current.term) {
        setResult(null);
        setCurrent(live);
        setPhase('ready');
        return true;
      }
      return false;
    };

    try {
      const meta = metadataRef.current || {};
      const saved = await saveWordFromSelection(current.term, current.context, source, meta);
      if (!saved.alreadyExists) {
        // Keep the AI coach's student model in sync (fire-and-forget)
        logEvent(EVENT_TYPES.WORD_SAVED, {
          term: saved.term,
          source,
          subcategoryId: meta.subcategory,
          sourceQuestionId: meta.questionId,
        });
      }
      if (pivotToLiveSelection()) return;
      try {
        window.getSelection()?.removeAllRanges();
      } catch (_) { /* noop */ }
      if (staleRectRef.current) {
        // Page scrolled during the save — the anchor rect is stale, don't
        // show a detached popover.
        reset();
        return;
      }
      setResult(saved);
      setPhase(saved.alreadyExists ? 'exists' : 'saved');
      clearTimeout(dismissRef.current);
      dismissRef.current = setTimeout(reset, showDefinition ? 8000 : 2500);
    } catch (err) {
      console.error('[WordSaver] save failed:', err);
      if (pivotToLiveSelection()) return;
      if (staleRectRef.current) {
        reset();
        return;
      }
      setPhase('error');
      clearTimeout(dismissRef.current);
      dismissRef.current = setTimeout(reset, 4000);
    }
  }, [current, selector, source, showDefinition, reset]);

  if (!enabled || phase === 'idle' || !current) return null;

  // ---- Positioning (fixed, viewport coords from the selection rect) ----
  const { rect } = current;
  const isCard = (phase === 'saved' || phase === 'exists') && showDefinition && result?.definition;
  const halfWidth = isCard ? 150 : 95;
  const centerX = Math.min(
    Math.max(rect.left + rect.width / 2, halfWidth + 8),
    (window.innerWidth || 1024) - halfWidth - 8
  );
  const spaceAbove = rect.top;
  const placeBelow = spaceAbove < (isCard ? 130 : 56);
  const style = {
    left: `${centerX}px`,
    top: placeBelow ? `${rect.bottom + 8}px` : `${rect.top - 8}px`,
    transform: placeBelow ? 'translateX(-50%)' : 'translate(-50%, -100%)',
  };

  let body;
  if (phase === 'ready') {
    body = (
      <button
        type="button"
        className="word-saver-btn"
        onMouseDown={(e) => e.preventDefault()} /* keep the selection alive */
        onClick={handleSave}
      >
        <FiBookmark aria-hidden="true" />
        <span>Add to Word Bank</span>
      </button>
    );
  } else if (phase === 'saving') {
    body = (
      <div className="word-saver-status">
        <span className="word-saver-spinner" aria-hidden="true" />
        <span>Saving…</span>
      </div>
    );
  } else if (phase === 'error') {
    body = (
      <div className="word-saver-status word-saver-error" role="alert">
        <FiAlertCircle aria-hidden="true" />
        <span>Couldn&apos;t save — try again</span>
      </div>
    );
  } else if (isCard) {
    body = (
      <div className="word-saver-card" role="status">
        <div className="word-saver-card-head">
          <FiCheck aria-hidden="true" />
          <span>{phase === 'exists' ? 'Already in Word Bank' : 'Saved to Word Bank'}</span>
        </div>
        <div className="word-saver-card-term">{result.term}</div>
        <div className="word-saver-card-def">{result.definition}</div>
      </div>
    );
  } else {
    body = (
      <div className="word-saver-status word-saver-success" role="status">
        <FiCheck aria-hidden="true" />
        <span>{phase === 'exists' ? 'Already in Word Bank' : 'Saved to Word Bank'}</span>
      </div>
    );
  }

  return createPortal(
    <div ref={popoverRef} className="word-saver-popover" style={style}>
      {body}
    </div>,
    document.body
  );
};

export default WordSaver;
