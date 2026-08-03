import React from 'react';
import { FiX, FiCheck, FiBookmark, FiBookOpen, FiEye, FiList } from 'react-icons/fi';
import MathText from '../MathText';
import './LessonBlocks.css';

/**
 * LessonBlocks — P2-D reusable lesson block template kit.
 *
 * Five presentational blocks that give every lesson UWorld-grade structure
 * without bespoke code per lesson:
 *   RuleBox            — accent-left-border rule callout
 *   AnnotatedExample   — sentence/equation with inline highlights + numbered
 *                        marker dots and a caption legend (pure CSS/DOM, no
 *                        SVG — survives wrapping and mobile)
 *   CheckCrossPair     — stacked wrong-vs-correct contrast pair
 *   WorkedSteps        — numbered vertical solve, final step = the answer
 *   ThingsToRemember   — end-of-lesson accent recap box
 *
 * Every text field is MathText-capable: $...$ / $$...$$ KaTeX delimiters and
 * the app's [u]...[/u] markup both render. Content strings are expected to be
 * plain text + math (the 'html' block in LessonBlockRenderer is the only
 * sanctioned HTML path).
 */

const toParagraphs = (text) => (Array.isArray(text) ? text : [text]).filter(Boolean);

// ─── RuleBox ────────────────────────────────────────────────────────────────
export function RuleBox({ title, text }) {
  const paragraphs = toParagraphs(text);
  if (paragraphs.length === 0) return null;
  return (
    <div className="lb-rule">
      <p className="lb-eyebrow">
        <FiBookOpen aria-hidden="true" />
        Rule
      </p>
      {title && <h4 className="lb-title">{title}</h4>}
      {paragraphs.map((paragraph, i) => (
        <MathText key={i} block text={paragraph} className="lb-rule-text" />
      ))}
    </div>
  );
}

// ─── AnnotatedExample ───────────────────────────────────────────────────────
/**
 * segments: array of string | { text, marker?: number, tone?: 'accent'|'warn'|'plain' }
 * markers:  array of { n: number, label: string }
 *
 * Marked segments get an inline highlight; the numbered dot sits INSIDE the
 * span, so it wraps with the segment's last word (no absolute positioning,
 * no SVG arrows — mobile- and wrap-safe by construction).
 */
export function AnnotatedExample({ title, intro, segments = [], markers = [], note }) {
  if (!Array.isArray(segments) || segments.length === 0) return null;
  return (
    <div className="lb-annotated">
      <p className="lb-eyebrow">
        <FiEye aria-hidden="true" />
        {title || 'Annotated example'}
      </p>
      {intro && <MathText block text={intro} className="lb-annotated-intro" />}
      <div className="lb-annotated-specimen">
        {segments.map((segment, i) => {
          if (typeof segment === 'string') {
            return <MathText key={i} text={segment} />;
          }
          const tone = segment.tone === 'warn' || segment.tone === 'plain' ? segment.tone : 'accent';
          return (
            <span key={i} className={`lb-seg-mark lb-tone-${tone}`}>
              <MathText text={segment.text} />
              {segment.marker != null && (
                <span className="lb-marker-dot" aria-label={`marker ${segment.marker}`}>
                  {segment.marker}
                </span>
              )}
            </span>
          );
        })}
      </div>
      {Array.isArray(markers) && markers.length > 0 && (
        <ul className="lb-annotated-captions">
          {markers.map((marker) => (
            <li key={marker.n} className="lb-annotated-caption">
              <span className="lb-marker-dot">{marker.n}</span>
              <MathText text={marker.label} />
            </li>
          ))}
        </ul>
      )}
      {note && <MathText block text={note} className="lb-annotated-note" />}
    </div>
  );
}

// ─── CheckCrossPair ─────────────────────────────────────────────────────────
/**
 * wrong:   { text, why }  — red FiX chip + why it's wrong
 * correct: { text, why }  — green FiCheck chip + why it works
 */
export function CheckCrossPair({ title, wrong, correct }) {
  if (!wrong && !correct) return null;
  return (
    <div className="lb-pair">
      {title && <h4 className="lb-title">{title}</h4>}
      {wrong && (
        <div className="lb-pair-item lb-pair-wrong">
          <div className="lb-pair-head">
            <span className="lb-pair-chip" aria-hidden="true">
              <FiX />
            </span>
            <span className="lb-pair-tag">Incorrect</span>
          </div>
          <MathText block text={wrong.text} className="lb-pair-text" />
          {wrong.why && <MathText block text={wrong.why} className="lb-pair-why" />}
        </div>
      )}
      {correct && (
        <div className="lb-pair-item lb-pair-correct">
          <div className="lb-pair-head">
            <span className="lb-pair-chip" aria-hidden="true">
              <FiCheck />
            </span>
            <span className="lb-pair-tag">Correct</span>
          </div>
          <MathText block text={correct.text} className="lb-pair-text" />
          {correct.why && <MathText block text={correct.why} className="lb-pair-why" />}
        </div>
      )}
    </div>
  );
}

// ─── WorkedSteps ────────────────────────────────────────────────────────────
/**
 * steps: array of { label, content, note? }
 * The final step is visually emphasized (accent) as the answer.
 */
export function WorkedSteps({ title, intro, steps = [] }) {
  if (!Array.isArray(steps) || steps.length === 0) return null;
  return (
    <div className="lb-steps">
      <p className="lb-eyebrow">
        <FiList aria-hidden="true" />
        {title || 'Worked example'}
      </p>
      {intro && <MathText block text={intro} className="lb-steps-intro" />}
      <ol className="lb-steps-list">
        {steps.map((step, i) => {
          const isFinal = i === steps.length - 1;
          return (
            <li key={i} className={`lb-step${isFinal ? ' lb-step-final' : ''}`}>
              <span className="lb-step-num" aria-hidden="true">
                {i + 1}
              </span>
              <div className="lb-step-body">
                {step.label && <span className="lb-step-label">{step.label}</span>}
                <MathText block text={step.content} className="lb-step-content" />
                {step.note && <MathText block text={step.note} className="lb-step-note" />}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

// ─── ThingsToRemember ───────────────────────────────────────────────────────
export function ThingsToRemember({ title, items = [] }) {
  if (!Array.isArray(items) || items.length === 0) return null;
  return (
    <div className="lb-remember">
      <p className="lb-eyebrow">
        <FiBookmark aria-hidden="true" />
        {title || 'Things to remember'}
      </p>
      <ul className="lb-remember-list">
        {items.map((item, i) => (
          <li key={i} className="lb-remember-item">
            <MathText text={item} />
          </li>
        ))}
      </ul>
    </div>
  );
}
