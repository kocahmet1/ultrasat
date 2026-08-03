import React from 'react';
import DOMPurify from 'dompurify';
import { processTextMarkup } from '../../utils/textProcessing';
import {
  RuleBox,
  AnnotatedExample,
  CheckCrossPair,
  WorkedSteps,
  ThingsToRemember,
} from './LessonBlocks';

/**
 * LessonBlockRenderer — P2-D block renderer.
 *
 * Contract: takes `blocks`, an array of plain objects with a `type`
 * discriminator, and renders each through a registry:
 *
 *   { type: 'rule',              title?, text }                          → RuleBox
 *   { type: 'annotated-example', title?, intro?, segments, markers, note? } → AnnotatedExample
 *   { type: 'check-cross',       title?, wrong: {text, why}, correct: {text, why} } → CheckCrossPair
 *   { type: 'steps',             title?, intro?, steps: [{label, content, note?}] } → WorkedSteps
 *   { type: 'remember',          title?, items: [string] }               → ThingsToRemember
 *   { type: 'html',              html }                                  → sanitized passthrough
 *
 * Unknown types render null and log a console.warn (forward-compatible with
 * new block types shipping in data before code).
 *
 * The 'html' type exists so legacy lesson HTML can be interleaved between
 * structured blocks during migration. It is the ONLY block that renders raw
 * HTML, and it goes through the app's existing sanitize path (DOMPurify +
 * processTextMarkup — same as components/Question.jsx). All other block text
 * is MathText-rendered plain text with $...$ KaTeX support.
 */

const sanitizeHtml = (html) => DOMPurify.sanitize(processTextMarkup(html) || '');

const HtmlBlock = ({ html }) => {
  if (!html || typeof html !== 'string') return null;
  return (
    <div
      className="lb-html learn-prose"
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}
    />
  );
};

const BLOCK_REGISTRY = {
  rule: RuleBox,
  'annotated-example': AnnotatedExample,
  'check-cross': CheckCrossPair,
  steps: WorkedSteps,
  remember: ThingsToRemember,
  html: HtmlBlock,
};

export default function LessonBlockRenderer({ blocks }) {
  if (!Array.isArray(blocks) || blocks.length === 0) return null;
  return (
    <div className="lesson-blocks">
      {blocks.map((block, i) => {
        if (!block || typeof block !== 'object') return null;
        const Component = BLOCK_REGISTRY[block.type];
        if (!Component) {
          console.warn(`[LessonBlockRenderer] unknown block type "${block?.type}" at index ${i} — skipped`);
          return null;
        }
        const { type, ...payload } = block;
        return <Component key={i} {...payload} />;
      })}
    </div>
  );
}
