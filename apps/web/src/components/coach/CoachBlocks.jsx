/**
 * AI Coach — typed block renderer (UI v2).
 *
 * ONE component maps coach note blocks → design-system cards. Every surface
 * (Home briefing hero, /coach HQ, results takeover, dock peek) renders through
 * this file, so the coach looks the same everywhere and a new block type is a
 * one-place change. Server contract: apps/api/coach/blocks.js.
 *
 * The model supplies judgment; this file supplies presentation. Numbers inside
 * `stat` / `focus` / `history` blocks were injected server-side from Tier-2 —
 * render them verbatim, never recompute.
 *
 * variant: 'ink' (on the dark hero) | 'light' (on white cards). CSS pairs live
 * in coach.css under the cv2- prefix.
 */

import React from 'react';

/* ------------------------------------------------------------------ utils -- */

/**
 * Legacy note ({message, actions}) → one verdict block, so every consumer can
 * assume `blocks` exists. Mirrors wrapLegacyBlocks() on the server.
 */
export function ensureBlocks(note) {
  if (!note) return [];
  if (Array.isArray(note.blocks) && note.blocks.length) return note.blocks;
  if (note.message) return [{ type: 'verdict', text: note.message, tone: 'steady', evidence: [] }];
  return [];
}

/** First verdict block (for one-line surfaces like the dock peek). */
export const noteVerdict = (note) => ensureBlocks(note).find((b) => b.type === 'verdict') || null;

/**
 * Markdown-lite: only **bold** is honored (the block contract allows nothing
 * else). Rendered as React nodes — no dangerouslySetInnerHTML on model output.
 */
export function mdBold(text) {
  const parts = String(text || '').split(/\*\*(.+?)\*\*/g);
  return parts.map((part, i) => (i % 2 === 1 ? <b key={i}>{part}</b> : part));
}

const WHY_LABEL = {
  regression: 'regression',
  slipping: 'slipping',
  stale: 'idle',
  new: 'next up',
  rehearsal: 'rehearsal',
  review: 'review',
  routine: 'routine',
  win: 'victory lap',
};

/* ----------------------------------------------------------------- pieces -- */

/** Last-10 strip: tall bar = correct, short = miss. Height doubles the color
    so the pattern survives color-vision deficiency and grayscale printing. */
export const Spark = ({ results = [] }) => {
  if (!results.length) return null;
  return (
    <span className="cv2-spark" aria-label={`last ${results.length} answers`}>
      {results.map((r, i) => (
        <i key={i} className={r ? 'hit' : 'miss'} />
      ))}
    </span>
  );
};

const EvidenceChips = ({ evidence }) => {
  if (!evidence || evidence.length === 0) return null;
  return (
    <div className="cv2-evidence">
      {evidence.map((e, i) => (
        <span key={i} className="cv2-evd" title="cited from your actual activity">
          {e.label}
        </span>
      ))}
    </div>
  );
};

/* ----------------------------------------------------------------- blocks -- */

export const VerdictBlock = ({ block, variant }) => (
  <div className={`cv2-verdict cv2-${variant}`}>
    <p className="cv2-verdict-text">{mdBold(block.text)}</p>
    <EvidenceChips evidence={block.evidence} />
  </div>
);

/**
 * Mission rail. `done` = { [itemId]: true }. Clicking the card runs the action;
 * clicking the tick marks it done by hand (both routes emit coach_interaction
 * through CoachContext.markMission).
 */
export const PlanBlock = ({ block, done = {}, onAction, onToggle, variant }) => (
  <div className={`cv2-plan cv2-${variant}`}>
    <div className="cv2-plan-head">
      <span className="cv2-label">
        {block.title || 'Today'} · {block.minutes} min
      </span>
      <span className="cv2-plan-meta">
        {Object.values(done).filter(Boolean).length}/{block.items.length} done
      </span>
    </div>
    <div className="cv2-missions">
      {block.items.map((it) => {
        const isDone = !!done[it.id];
        return (
          <div
            key={it.id}
            className={`cv2-mission ${isDone ? 'done' : ''} ${it.action ? 'actionable' : ''}`}
            role={it.action ? 'button' : undefined}
            tabIndex={it.action ? 0 : undefined}
            onClick={() => it.action && !isDone && onAction && onAction(it.action, it)}
            onKeyDown={(e) => e.key === 'Enter' && it.action && !isDone && onAction && onAction(it.action, it)}
          >
            <span className="cv2-mission-top">
              <button
                type="button"
                className="cv2-tick"
                aria-label={isDone ? 'Mark not done' : 'Mark done'}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggle && onToggle(it, !isDone);
                }}
              >
                {isDone ? '✓' : ''}
              </button>
              <span className="cv2-mission-title">{it.label}</span>
              <span className="cv2-mission-min">{it.minutes} min</span>
            </span>
            {it.sub && <span className="cv2-mission-sub">{it.sub}</span>}
            <span className={`cv2-why ${it.why}`}>{WHY_LABEL[it.why] || it.why}</span>
          </div>
        );
      })}
    </div>
  </div>
);

/** Pace / streak line. All numbers server-injected; anything null is hidden. */
export const StatBlock = ({ block, variant }) => {
  const bits = [];
  if (block.kind === 'streak') {
    if (block.streak != null) bits.push(<span key="s"><b>{block.streak}</b> day streak</span>);
  } else {
    if (block.daysToExam != null) bits.push(<span key="d"><b>{block.daysToExam}</b> days to exam</span>);
    if (block.estimate != null) bits.push(<span key="e">last exam <b>{block.estimate}</b></span>);
    if (block.target != null) bits.push(<span key="t">target <b>{block.target}</b></span>);
  }
  if (!bits.length && !block.note) return null;
  return (
    <div className={`cv2-stat cv2-${variant}`}>
      {bits.length > 0 && (
        <span className="cv2-stat-nums">
          {bits.map((b, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span className="cv2-dot">·</span>}
              {b}
            </React.Fragment>
          ))}
        </span>
      )}
      {block.note && <span className="cv2-stat-note">{block.note}</span>}
    </div>
  );
};

const HISTORY_STATE = {
  missed: { cls: 'bad', mark: '✕', label: 'missed' },
  regressed: { cls: 'bad', mark: '✕', label: 'slipped again' },
  recovered: { cls: 'good', mark: '✓', label: 'recovered' },
  recheck: { cls: 'next', mark: '?', label: 're-check' },
};

const fmtDay = (d) => {
  const ms = Date.parse(d);
  if (Number.isNaN(ms)) return d;
  return new Date(ms).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

/** The concept's missed → recovered → regressed timeline. */
export const HistoryBlock = ({ block, variant }) => (
  <div className={`cv2-history cv2-${variant}`}>
    <span className="cv2-label cv2-label--danger">
      The pattern — {block.label || block.conceptId}
      {block.subcategoryName ? ` · ${block.subcategoryName}` : ''}
    </span>
    <div className="cv2-hnodes">
      {block.nodes.map((n, i) => {
        const s = HISTORY_STATE[n.state] || HISTORY_STATE.missed;
        return (
          <React.Fragment key={i}>
            {i > 0 && <span className="cv2-harrow" aria-hidden="true" />}
            <span className="cv2-hnode">
              <span className={`cv2-hdot ${s.cls}`}>{s.mark}</span>
              <span className="cv2-hdate">{fmtDay(n.date)}</span>
              <span className="cv2-hlabel">{s.label}</span>
            </span>
          </React.Fragment>
        );
      })}
    </div>
    {block.errorPattern && (
      <p className="cv2-hpattern">
        dominant error: <b>{block.errorPattern}</b>
      </p>
    )}
  </div>
);

/** Compact focus chips (hero) — hydrated with real accuracy + trend. */
export const FocusBlock = ({ block, onAction, variant }) => (
  <div className={`cv2-focus cv2-${variant}`}>
    {block.items.map((it) => (
      <button
        key={it.subcategoryId}
        type="button"
        className="cv2-focus-chip"
        onClick={() => onAction && onAction({ type: 'quiz', subcategoryId: it.subcategoryId }, null)}
        title={`Practice ${it.name}`}
      >
        <span className={`cv2-why ${it.reason}`}>{WHY_LABEL[it.reason] || it.reason}</span>
        <span className="cv2-focus-name">{it.name}</span>
        {it.accuracyLast10 != null && <span className="cv2-focus-acc">{it.accuracyLast10}%</span>}
      </button>
    ))}
  </div>
);

/* ------------------------------------------------------------- dispatcher -- */

/**
 * Render a note's blocks.
 * @param onAction  (action, planItem|null) → run a sanitized coach action
 * @param onToggle  (planItem, done) → manual mission tick
 * @param done      { [planItemId]: bool }
 */
const CoachBlocks = ({ blocks = [], variant = 'light', onAction, onToggle, done, only, skip }) => (
  <>
    {blocks.map((b, i) => {
      if (only && !only.includes(b.type)) return null;
      if (skip && skip.includes(b.type)) return null;
      switch (b.type) {
        case 'verdict':
          return <VerdictBlock key={i} block={b} variant={variant} />;
        case 'plan':
          return <PlanBlock key={i} block={b} variant={variant} done={done} onAction={onAction} onToggle={onToggle} />;
        case 'stat':
          return <StatBlock key={i} block={b} variant={variant} />;
        case 'history':
          return <HistoryBlock key={i} block={b} variant={variant} />;
        case 'focus':
          return <FocusBlock key={i} block={b} variant={variant} onAction={onAction} />;
        default:
          return null; // unknown block types are dropped, same as the server
      }
    })}
  </>
);

export default CoachBlocks;
