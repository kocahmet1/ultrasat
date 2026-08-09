/* lesson2/LessonBlocks2 — block components for Lesson v2 study guides.
 *
 * Renders the JSON block schema documented in docs/lesson-v2-authoring.md.
 * Everything is built as React elements from constrained markup
 * (inlineMarkup.jsx) — no dangerouslySetInnerHTML anywhere on this path.
 * Styles live in styles/LessonPage.css under the .lp2- prefix.
 */

import React, { useState } from 'react';
import {
  FiCheck,
  FiX,
  FiChevronDown,
  FiAlertTriangle,
  FiInfo,
} from 'react-icons/fi';
import { HiOutlineLightBulb } from 'react-icons/hi';
import { renderInline, expandMathTones } from './inlineMarkup';
import GraphBlock, {
  NumberLineBlock,
  DotPlotBlock,
  HistogramBlock,
  BoxPlotBlock,
  GeometryBlock,
} from './GraphBlock';

/* ---------- leaf blocks ---------- */

function Paragraph({ block }) {
  return <p className="lp2-p">{renderInline(block.text)}</p>;
}

function Heading3({ block }) {
  return <h3 className="lp2-h3">{renderInline(block.text)}</h3>;
}

function Heading4({ block }) {
  return <h4 className="lp2-h4">{renderInline(block.text)}</h4>;
}

function List({ block }) {
  const items = (block.items || []).map((item, i) => (
    <li key={i}>{renderInline(item)}</li>
  ));
  return block.style === 'number' ? (
    <ol className="lp2-list lp2-list--number">{items}</ol>
  ) : (
    <ul className="lp2-list">{items}</ul>
  );
}

function Table({ block }) {
  const align = block.align || [];
  const alignClass = (i) =>
    align[i] === 'center' ? 'lp2-td--center' : undefined;
  return (
    <div className="lp2-table-wrap">
      <table className={`lp2-table${block.compact ? ' lp2-table--compact' : ''}`}>
        {block.headers && (
          <thead>
            <tr>
              {block.headers.map((h, i) => (
                <th key={i} className={alignClass(i)}>{renderInline(h)}</th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {(block.rows || []).map((row, r) => (
            <tr key={r}>
              {row.map((cell, c) => (
                <td key={c} className={alignClass(c)}>{renderInline(cell)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {block.caption && <div className="lp2-table-caption">{renderInline(block.caption)}</div>}
    </div>
  );
}

function RuleBox({ block }) {
  return (
    <p className="lp2-rule">
      <strong className="lp2-rule__label">{block.label || 'Rule'}: </strong>
      <em>{renderInline(block.text)}</em>
    </p>
  );
}

const CALLOUT_ICONS = {
  tip: HiOutlineLightBulb,
  note: FiInfo,
  warning: FiAlertTriangle,
};

function Callout({ block }) {
  const variant = block.variant || 'tip';
  const Icon = CALLOUT_ICONS[variant] || HiOutlineLightBulb;
  return (
    <div className={`lp2-callout lp2-callout--${variant}`}>
      <Icon className="lp2-callout__icon" aria-hidden="true" />
      <div className="lp2-callout__text">{renderInline(block.text)}</div>
    </div>
  );
}

function Passage({ block }) {
  const paragraphs = String(block.text || '').split(/\n\n+/);
  return (
    <div className="lp2-passage">
      {block.label && <div className="lp2-passage__label">{renderInline(block.label)}</div>}
      <div className="lp2-passage__body">
        {paragraphs.map((para, i) => (
          <p key={i}>{renderInline(para)}</p>
        ))}
      </div>
    </div>
  );
}

const CHOICE_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

function Question({ block }) {
  return (
    <div className="lp2-question">
      {block.stem && <p className="lp2-question__stem">{renderInline(block.stem)}</p>}
      {Array.isArray(block.choices) && block.choices.length > 0 && (
        <ol className="lp2-choices">
          {block.choices.map((choice, i) => (
            <li key={i}>
              <span className="lp2-choices__letter">{CHOICE_LETTERS[i]})</span>
              <span className="lp2-choices__text">{renderInline(choice)}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function Verdict({ verdict }) {
  return verdict === 'correct' ? (
    <span className="lp2-verdict lp2-verdict--correct" aria-label="Correct">
      <FiCheck aria-hidden="true" />
    </span>
  ) : (
    <span className="lp2-verdict lp2-verdict--incorrect" aria-label="Incorrect">
      <FiX aria-hidden="true" />
    </span>
  );
}

function Poe({ block }) {
  return (
    <div className="lp2-poe">
      <div className="lp2-poe__intro">{renderInline(block.intro || 'Process of Elimination:')}</div>
      <ul className="lp2-poe__list">
        {(block.items || []).map((item, i) => (
          <li key={i} className="lp2-poe__item">
            <Verdict verdict={item.verdict} />
            <div className="lp2-poe__text">
              {item.choice && <strong>Choice {item.choice}: </strong>}
              {renderInline(item.text)}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CheckCross({ block }) {
  return (
    <ul className="lp2-checkcross">
      {(block.items || []).map((item, i) => (
        <li key={i} className="lp2-checkcross__item">
          <Verdict verdict={item.verdict} />
          <div className="lp2-checkcross__body">
            <div className="lp2-checkcross__text">{renderInline(item.text)}</div>
            {item.note && <div className="lp2-checkcross__note">{renderInline(item.note)}</div>}
          </div>
        </li>
      ))}
    </ul>
  );
}

function Reveal({ block }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`lp2-reveal${open ? ' lp2-reveal--open' : ''}`}>
      <button
        type="button"
        className="lp2-reveal__toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {block.label || 'Answer'}
        <FiChevronDown className="lp2-reveal__chevron" aria-hidden="true" />
      </button>
      {open && (
        <div className="lp2-reveal__body">
          <LessonBlockList blocks={block.blocks} />
        </div>
      )}
    </div>
  );
}

function Example({ block }) {
  return (
    <section className="lp2-example">
      <div className="lp2-example__band">{renderInline(block.title || 'Example')}</div>
      <div className="lp2-example__body">
        <LessonBlockList blocks={block.blocks} />
      </div>
    </section>
  );
}

function Practice({ block }) {
  return (
    <section className="lp2-practice">
      <div className="lp2-practice__band">{renderInline(block.title || 'Practice')}</div>
      <ol className="lp2-practice__list">
        {(block.items || []).map((item, i) => (
          <li key={i} className="lp2-practice__item">
            <div className="lp2-practice__number">{i + 1}.</div>
            <div className="lp2-practice__content">
              <LessonBlockList blocks={item.blocks} />
              {Array.isArray(item.answer) && item.answer.length > 0 && (
                <Reveal block={{ label: 'Answer', blocks: item.answer }} />
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Remember({ block }) {
  return (
    <section className="lp2-remember">
      <h3 className="lp2-remember__title">{renderInline(block.title || 'Things to Remember')}</h3>
      <ul className="lp2-list">
        {(block.items || []).map((item, i) => (
          <li key={i}>{renderInline(item)}</li>
        ))}
      </ul>
    </section>
  );
}

function Legend({ block }) {
  return (
    <div className="lp2-legend">
      {(block.items || []).map((item, i) => (
        <span key={i} className="lp2-legend__item">
          <span className={`lp2-legend__swatch lp2-legend__swatch--${item.tone || 'yellow'}`} aria-hidden="true" />
          {renderInline(item.label)}
        </span>
      ))}
    </div>
  );
}

function Strip({ block }) {
  return (
    <div className="lp2-strip" role="img" aria-label={block.alt || undefined}>
      {(block.segments || []).map((seg, i) =>
        seg.tone === 'op' ? (
          <span key={i} className="lp2-strip__op">{seg.text}</span>
        ) : (
          <span key={i} className={`lp2-strip__seg${seg.tone ? ` lp2-strip__seg--${seg.tone}` : ''}`}>
            {renderInline(seg.text)}
          </span>
        )
      )}
    </div>
  );
}

function Figure({ block }) {
  return (
    <figure className="lp2-figure">
      <img
        src={block.src}
        alt={block.alt || ''}
        loading="lazy"
        style={block.width ? { maxWidth: `${block.width}px` } : undefined}
      />
      {block.caption && <figcaption>{renderInline(block.caption)}</figcaption>}
    </figure>
  );
}

/* ---------- math blocks ----------
 * Math strings are TeX. They are emitted into the DOM wrapped in $/$$
 * delimiters and typeset client-side by KaTeX auto-render (LessonPage
 * loads it via utils/katexLoader and re-runs it when reveals open). */

function Steps({ block }) {
  return (
    <div className="lp2-steps">
      {block.title && <div className="lp2-steps__title">{renderInline(block.title)}</div>}
      <div className="lp2-steps__rows">
        {(block.items || []).map((item, i) => (
          <div key={i} className="lp2-steps__row">
            <div className="lp2-steps__eq">
              {item.math ? `$$${expandMathTones(item.math)}$$` : renderInline(item.text)}
            </div>
            <div className="lp2-steps__note">
              {item.note ? renderInline(item.note) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MathBlock({ block }) {
  return (
    <div className={`lp2-math${block.boxed ? ' lp2-math--boxed' : ''}`}>
      <div className="lp2-math__tex">{`$$${expandMathTones(block.tex)}$$`}</div>
      {block.caption && <div className="lp2-math__caption">{renderInline(block.caption)}</div>}
    </div>
  );
}

function Columns({ block }) {
  return (
    <div className="lp2-columns">
      {(block.items || []).map((col, i) => (
        <div key={i} className="lp2-columns__col">
          {col.title && <div className="lp2-columns__title">{renderInline(col.title)}</div>}
          <LessonBlockList blocks={col.blocks} />
        </div>
      ))}
    </div>
  );
}

/* ---------- dispatcher ---------- */

const BLOCK_COMPONENTS = {
  p: Paragraph,
  h3: Heading3,
  h4: Heading4,
  list: List,
  table: Table,
  rule: RuleBox,
  callout: Callout,
  example: Example,
  passage: Passage,
  question: Question,
  poe: Poe,
  'check-cross': CheckCross,
  reveal: Reveal,
  practice: Practice,
  remember: Remember,
  legend: Legend,
  strip: Strip,
  figure: Figure,
  steps: Steps,
  math: MathBlock,
  columns: Columns,
  graph: GraphBlock,
  numberline: NumberLineBlock,
  dotplot: DotPlotBlock,
  histogram: HistogramBlock,
  boxplot: BoxPlotBlock,
  geometry: GeometryBlock,
};

export function LessonBlockList({ blocks }) {
  if (!Array.isArray(blocks) || blocks.length === 0) return null;
  return (
    <>
      {blocks.map((block, i) => {
        const Component = BLOCK_COMPONENTS[block?.type];
        if (!Component) {
          if (import.meta.env.DEV) {
            console.warn(`[lesson2] unknown block type "${block?.type}"`);
          }
          return null;
        }
        return <Component key={i} block={block} />;
      })}
    </>
  );
}

export default LessonBlockList;
