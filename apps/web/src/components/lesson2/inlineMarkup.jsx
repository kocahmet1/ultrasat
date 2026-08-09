/* lesson2/inlineMarkup — safe inline rich-text for Lesson v2 content.
 *
 * Parses the constrained markup documented in docs/lesson-v2-authoring.md
 * into React elements (never innerHTML — content stays XSS-proof by
 * construction):
 *
 *   **bold**   *italic*   __underline__   ==yellow highlight==
 *   {blue|term} {teal|term} {rose|term} {green|term} {purple|term} {amber|term}
 *
 * Marks nest ({blue|**term**}, ==**key**==). Authoring note: don't wrap
 * `**bold**` inside single-asterisk italics.
 */

import React from 'react';

const TONES = ['blue', 'teal', 'rose', 'green', 'purple', 'amber', 'gray'];

/* Tone palette shared by inline terms, math coloring, and GraphBlock.
 * Keep in sync with the --lp-term-* variables in LessonPage.css. */
export const TONE_HEX = {
  blue: '#0f6cbd',
  teal: '#0e8a7e',
  rose: '#c0392f',
  green: '#157f4b',
  purple: '#6d3fc4',
  amber: '#a8621a',
  gray: '#5c6a7d',
};

/* TeX color shorthands: \blue{...} → \textcolor{#0f6cbd}{...}.
 * Expanded here in JS — NOT as KaTeX macros — because a literal "#" inside
 * a KaTeX macro body is read as a parameter marker (#0, #1, …) and makes
 * the whole expression error out to raw red text. */
const MATH_TONE_RE = /\\(blue|teal|rose|green|purple|amber|gray)\{/g;

export function expandMathTones(tex) {
  if (tex === null || tex === undefined) return tex;
  return String(tex).replace(MATH_TONE_RE, (full, tone) => `\\textcolor{${TONE_HEX[tone]}}{`);
}

const PATTERNS = [
  {
    re: /\{blank\}/,
    literal: true,
    wrap: (children, key) => (
      <span className="lp2-blank" key={key} aria-label="blank" />
    ),
  },
  {
    re: /\*\*([\s\S]+?)\*\*/,
    wrap: (children, key) => <strong key={key}>{children}</strong>,
  },
  {
    // inner may not start with "_" so literal runs of underscores pass through
    re: /__([^_][\s\S]*?)__/,
    wrap: (children, key) => <u key={key}>{children}</u>,
  },
  {
    re: /==([\s\S]+?)==/,
    wrap: (children, key) => (
      <mark className="lp2-hl" key={key}>{children}</mark>
    ),
  },
  {
    re: new RegExp(`\\{(${TONES.join('|')})\\|([^{}]+?)\\}`),
    tone: true,
    wrap: (children, key, m) => (
      <strong className={`lp2-term lp2-term--${m[1]}`} key={key}>
        {children}
      </strong>
    ),
  },
  {
    re: /\*([^*\n][\s\S]*?)\*/,
    wrap: (children, key) => <em key={key}>{children}</em>,
  },
];

/**
 * Render a markup string to an array of React nodes.
 * @param {string} text
 * @returns {React.ReactNode}
 */
export function renderInline(text) {
  if (text === null || text === undefined || text === '') return null;
  return parse(expandMathTones(String(text)), 0);
}

function parse(text, depth) {
  if (depth > 6) return [text]; // hard stop against pathological nesting
  const nodes = [];
  let rest = text;
  let key = 0;

  while (rest.length > 0) {
    let best = null;
    for (const pattern of PATTERNS) {
      const match = pattern.re.exec(rest);
      if (match && (best === null || match.index < best.match.index)) {
        best = { pattern, match };
      }
    }
    if (!best) {
      nodes.push(rest);
      break;
    }
    const { pattern, match } = best;
    if (match.index > 0) nodes.push(rest.slice(0, match.index));
    if (pattern.literal) {
      nodes.push(pattern.wrap(null, `m${key++}`, match));
    } else {
      const innerText = pattern.tone ? match[2] : match[1];
      const children = parse(innerText, depth + 1);
      nodes.push(pattern.wrap(children, `m${key++}`, match));
    }
    rest = rest.slice(match.index + match[0].length);
  }
  return nodes;
}

export default renderInline;
