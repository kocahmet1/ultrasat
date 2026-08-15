import React, { useState } from 'react';
import { FiMaximize2, FiMinimize2 } from 'react-icons/fi';
import ExamToolPanel from './ExamToolPanel';

/**
 * ReferenceSheetPanel — Bluebook-style floating panel with the official
 * digital SAT math reference sheet, recreated as inline SVG line art
 * (no image assets, crisp at any size).
 */

const PANEL_SIZE = {
  normal: { width: 730, height: 600 },
  expanded: { width: 1010, height: 720 },
};

// Shared visual constants for the line art
const stroke = { stroke: '#1E1E1E', strokeWidth: 1.4, fill: 'none', strokeLinejoin: 'round' };
const dashed = { ...stroke, strokeDasharray: '4 3' };
const label = {
  fontSize: 11.5,
  fontStyle: 'italic',
  fontFamily: "Georgia, 'Times New Roman', serif",
  fill: '#1E1E1E',
};
const angleLabel = { ...label, fontStyle: 'normal', fontSize: 9.5 };

const Frac = ({ n, d }) => (
  <span className="frac" aria-label={`${n}/${d}`}>
    <span>{n}</span>
    <span>{d}</span>
  </span>
);

const Fig = ({ wide = false, formulas, caption, children }) => (
  <div className={`ref-fig ${wide ? 'ref-fig-wide' : ''}`}>
    <div className="ref-art">{children}</div>
    {formulas ? <div className="ref-formulas">{formulas}</div> : null}
    {caption ? <div className="ref-caption">{caption}</div> : null}
  </div>
);

function ReferenceSheetPanel({ isOpen, onClose }) {
  const [expanded, setExpanded] = useState(false);
  const size = expanded ? PANEL_SIZE.expanded : PANEL_SIZE.normal;

  const expandButton = (
    <button
      type="button"
      className="etp-icon-btn"
      onClick={() => setExpanded((value) => !value)}
      aria-label={expanded ? 'Shrink reference sheet' : 'Expand reference sheet'}
    >
      {expanded ? <FiMinimize2 aria-hidden="true" /> : <FiMaximize2 aria-hidden="true" />}
      <span className="etp-icon-btn-label">{expanded ? 'Shrink' : 'Expand'}</span>
    </button>
  );

  return (
    <ExamToolPanel
      title="Reference Sheet"
      isOpen={isOpen}
      onClose={onClose}
      width={size.width}
      height={size.height}
      defaultPosition={({ vw, w }) => ({ x: Math.max(8, vw - w - 22), y: 86 })}
      headerRight={expandButton}
      dark
      className="reference-panel"
    >
      <div className="ref-body">
        <div className="ref-grid">
          {/* Circle */}
          <Fig
            formulas={
              <>
                <div>A = πr<sup>2</sup></div>
                <div>C = 2πr</div>
              </>
            }
          >
            <svg viewBox="0 0 120 92" role="img" aria-label="Circle with radius r">
              <circle cx="57" cy="42" r="27" {...stroke} />
              <circle cx="57" cy="42" r="2" fill="#1E1E1E" stroke="none" />
              <line x1="57" y1="42" x2="84" y2="42" {...stroke} />
              <text x="66" y="36" {...label}>r</text>
            </svg>
          </Fig>

          {/* Rectangle */}
          <Fig formulas={<div>A = ℓw</div>}>
            <svg viewBox="0 0 120 92" role="img" aria-label="Rectangle with length ℓ and width w">
              <rect x="24" y="27" width="68" height="38" {...stroke} />
              <text x="55" y="19" {...label}>ℓ</text>
              <text x="98" y="50" {...label}>w</text>
            </svg>
          </Fig>

          {/* Triangle */}
          <Fig
            formulas={
              <div>
                A = <Frac n="1" d="2" />bh
              </div>
            }
          >
            <svg viewBox="0 0 120 92" role="img" aria-label="Triangle with base b and height h">
              <polygon points="26,70 96,70 60,20" {...stroke} />
              <line x1="60" y1="20" x2="60" y2="70" {...dashed} />
              <path d="M60,63 h7 v7" {...stroke} strokeWidth="1" />
              <text x="65" y="48" {...label}>h</text>
              <text x="59" y="82" {...label}>b</text>
            </svg>
          </Fig>

          {/* Right triangle (Pythagorean theorem) */}
          <Fig
            formulas={
              <div>
                c<sup>2</sup> = a<sup>2</sup> + b<sup>2</sup>
              </div>
            }
          >
            <svg viewBox="0 0 120 92" role="img" aria-label="Right triangle with legs a and b and hypotenuse c">
              <polygon points="30,70 30,24 94,70" {...stroke} />
              <path d="M30,62 h8 v8" {...stroke} strokeWidth="1" />
              <text x="20" y="50" {...label}>b</text>
              <text x="66" y="42" {...label}>c</text>
              <text x="60" y="82" {...label}>a</text>
            </svg>
          </Fig>

          {/* Special right triangles */}
          <Fig wide caption="Special Right Triangles">
            <svg
              viewBox="0 0 250 92"
              role="img"
              aria-label="Special right triangles: 30-60-90 with sides x, x root 3 and 2x; 45-45-90 with sides s, s and s root 2"
            >
              {/* 30–60–90 */}
              <polygon points="6,70 118,70 118,22" {...stroke} />
              <path d="M110,70 v-8 h8" {...stroke} strokeWidth="1" />
              <text x="33" y="67" {...angleLabel}>30°</text>
              <text x="98" y="40" {...angleLabel}>60°</text>
              <text x="48" y="38" {...label}>2x</text>
              <text x="123" y="50" {...label}>x</text>
              <text x="55" y="83" {...label}>x√3</text>
              {/* 45–45–90 */}
              <polygon points="158,70 232,70 158,22" {...stroke} />
              <path d="M158,62 h8 v8" {...stroke} strokeWidth="1" />
              <text x="161" y="43" {...angleLabel}>45°</text>
              <text x="204" y="65" {...angleLabel}>45°</text>
              <text x="148" y="50" {...label}>s</text>
              <text x="203" y="41" {...label}>s√2</text>
              <text x="190" y="83" {...label}>s</text>
            </svg>
          </Fig>

          {/* Rectangular box */}
          <Fig formulas={<div>V = ℓwh</div>}>
            <svg viewBox="0 0 120 92" role="img" aria-label="Rectangular box with length ℓ, width w, and height h">
              <rect x="20" y="34" width="56" height="32" {...stroke} />
              <line x1="20" y1="34" x2="38" y2="22" {...stroke} />
              <line x1="76" y1="34" x2="94" y2="22" {...stroke} />
              <line x1="76" y1="66" x2="94" y2="54" {...stroke} />
              <line x1="38" y1="22" x2="94" y2="22" {...stroke} />
              <line x1="94" y1="22" x2="94" y2="54" {...stroke} />
              <text x="46" y="79" {...label}>ℓ</text>
              <text x="90" y="67" {...label}>w</text>
              <text x="100" y="43" {...label}>h</text>
            </svg>
          </Fig>

          {/* Cylinder */}
          <Fig
            formulas={
              <div>
                V = πr<sup>2</sup>h
              </div>
            }
          >
            <svg viewBox="0 0 120 92" role="img" aria-label="Cylinder with radius r and height h">
              <ellipse cx="58" cy="26" rx="26" ry="9" {...stroke} />
              <line x1="32" y1="26" x2="32" y2="64" {...stroke} />
              <line x1="84" y1="26" x2="84" y2="64" {...stroke} />
              <path d="M32,64 A26 9 0 0 0 84,64" {...stroke} />
              <circle cx="58" cy="26" r="2" fill="#1E1E1E" stroke="none" />
              <line x1="58" y1="26" x2="84" y2="26" {...stroke} />
              <text x="66" y="21" {...label}>r</text>
              <text x="90" y="49" {...label}>h</text>
            </svg>
          </Fig>

          {/* Sphere */}
          <Fig
            formulas={
              <div>
                V = <Frac n="4" d="3" />πr<sup>3</sup>
              </div>
            }
          >
            <svg viewBox="0 0 120 92" role="img" aria-label="Sphere with radius r">
              <circle cx="58" cy="44" r="27" {...stroke} />
              <ellipse cx="58" cy="44" rx="27" ry="9" {...dashed} />
              <circle cx="58" cy="44" r="2" fill="#1E1E1E" stroke="none" />
              <line x1="58" y1="44" x2="85" y2="44" {...stroke} />
              <text x="67" y="39" {...label}>r</text>
            </svg>
          </Fig>

          {/* Cone */}
          <Fig
            formulas={
              <div>
                V = <Frac n="1" d="3" />πr<sup>2</sup>h
              </div>
            }
          >
            <svg viewBox="0 0 120 92" role="img" aria-label="Cone with radius r and height h">
              <line x1="58" y1="18" x2="31" y2="66" {...stroke} />
              <line x1="58" y1="18" x2="85" y2="66" {...stroke} />
              <path d="M31,66 A27 9 0 0 0 85,66" {...stroke} />
              <path d="M31,66 A27 9 0 0 1 85,66" {...dashed} />
              <line x1="58" y1="18" x2="58" y2="66" {...dashed} />
              <path d="M58,59 h7 v7" {...stroke} strokeWidth="1" />
              <line x1="58" y1="66" x2="85" y2="66" {...stroke} />
              <text x="63" y="44" {...label}>h</text>
              <text x="69" y="62" {...label}>r</text>
            </svg>
          </Fig>

          {/* Pyramid */}
          <Fig
            formulas={
              <div>
                V = <Frac n="1" d="3" />ℓwh
              </div>
            }
          >
            <svg viewBox="0 0 120 92" role="img" aria-label="Pyramid with base length ℓ, base width w, and height h">
              <line x1="60" y1="16" x2="26" y2="70" {...stroke} />
              <line x1="60" y1="16" x2="80" y2="70" {...stroke} />
              <line x1="60" y1="16" x2="98" y2="56" {...stroke} />
              <line x1="60" y1="16" x2="44" y2="56" {...dashed} />
              <line x1="26" y1="70" x2="80" y2="70" {...stroke} />
              <line x1="80" y1="70" x2="98" y2="56" {...stroke} />
              <line x1="98" y1="56" x2="44" y2="56" {...dashed} />
              <line x1="44" y1="56" x2="26" y2="70" {...dashed} />
              <line x1="60" y1="16" x2="62" y2="63" {...dashed} />
              <text x="66" y="44" {...label}>h</text>
              <text x="50" y="81" {...label}>ℓ</text>
              <text x="93" y="69" {...label}>w</text>
            </svg>
          </Fig>
        </div>

        <div className="ref-notes">
          <p>The number of degrees of arc in a circle is 360.</p>
          <p>The number of radians of arc in a circle is 2π.</p>
          <p>The sum of the measures in degrees of the angles of a triangle is 180.</p>
        </div>
      </div>
    </ExamToolPanel>
  );
}

export default ReferenceSheetPanel;
