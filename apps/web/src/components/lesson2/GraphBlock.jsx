/* lesson2/GraphBlock — data-driven coordinate-plane figures for Lesson v2.
 *
 * Renders lines and points on an xy-plane as pure inline SVG (no chart
 * library): light grid, arrowed axes, optional numbered ticks, clipped
 * lines with labels, marked points with optional dashed guides to the axes.
 * Used by the `graph` block type (docs/lesson-v2-authoring.md).
 *
 * Block shape:
 * {
 *   "type": "graph",
 *   "width": 340, "height": 300,            // px (SVG viewBox; scales down responsively)
 *   "xMin": -6, "xMax": 6, "yMin": -6, "yMax": 6,
 *   "step": 2,                              // grid/tick spacing (0 = no grid)
 *   "ticks": true,                          // numbered ticks on the axes
 *   "stepX": 2, "stepY": 40,                // per-axis grid/tick spacing (default: step)
 *   "xLabel": "t", "yLabel": "V",           // axis letters (default x / y)
 *   "lines": [{ "m": 2, "b": 6, "tone": "blue", "label": "y = 2x + 6",
 *               "labelAt": 1.5, "labelDx": 6, "labelDy": -8, "dashed": false }],
 *   "segments": [{ "x1": 1, "y1": 1, "x2": 3, "y2": 1, "tone": "amber",
 *                  "dashed": true, "label": "run = 2", "labelDx": 0, "labelDy": 14 }],
 *   "points": [{ "x": -3, "y": 0, "label": "(-3, 0)", "tone": "rose",
 *                "labelDx": 8, "labelDy": -10, "guides": false }],
 *   "caption": "...", "alt": "accessible description"
 * }
 */

import React, { useId } from 'react';
import { renderInline, TONE_HEX } from './inlineMarkup';

const TONE_COLORS = TONE_HEX;

const AXIS_COLOR = '#3d4b5e';
const GRID_COLOR = '#e4ebf2';
const LABEL_COLOR = '#5c6a7d';

/* Evaluate a curve definition at x.
 * { type: "quadratic", a, b, c }  → a·x² + b·x + c
 * { type: "vertex", a, h, k }     → a·(x − h)² + k
 * { type: "exponential", a, base }→ a·baseˣ
 */
function evalCurve(curve, x) {
  if (curve.type === 'exponential') return (curve.a ?? 1) * Math.pow(curve.base, x);
  if (curve.type === 'vertex') return (curve.a ?? 1) * (x - (curve.h || 0)) ** 2 + (curve.k || 0);
  return (curve.a || 0) * x * x + (curve.b || 0) * x + (curve.c || 0);
}

/* Clip the line y = m·x + b to the plot window; returns [[x1,y1],[x2,y2]] or null. */
function clipLine(m, b, xMin, xMax, yMin, yMax) {
  const EPS = 1e-9;
  const pts = [];
  const push = (x, y) => {
    if (x >= xMin - EPS && x <= xMax + EPS && y >= yMin - EPS && y <= yMax + EPS) {
      if (!pts.some(([px, py]) => Math.abs(px - x) < EPS && Math.abs(py - y) < EPS)) {
        pts.push([x, y]);
      }
    }
  };
  push(xMin, m * xMin + b);
  push(xMax, m * xMax + b);
  if (Math.abs(m) > EPS) {
    push((yMin - b) / m, yMin);
    push((yMax - b) / m, yMax);
  }
  if (pts.length < 2) return null;
  pts.sort((p, q) => p[0] - q[0] || p[1] - q[1]);
  return [pts[0], pts[pts.length - 1]];
}

function frange(min, max, step) {
  const out = [];
  if (!step || step <= 0) return out;
  const start = Math.ceil(min / step) * step;
  for (let v = start; v <= max + 1e-9; v += step) {
    out.push(Math.abs(v) < 1e-9 ? 0 : Number(v.toFixed(6)));
  }
  return out;
}

export default function GraphBlock({ block }) {
  const {
    width = 340,
    height = 300,
    xMin = -6,
    xMax = 6,
    yMin = -6,
    yMax = 6,
    step = 2,
    stepX,
    stepY,
    ticks = true,
    grid = true,
    xLabel = 'x',
    yLabel = 'y',
    lines = [],
    curves = [],
    circles = [],
    segments = [],
    points = [],
    caption,
    alt,
  } = block;

  const gx = stepX !== undefined ? stepX : step;
  const gy = stepY !== undefined ? stepY : step;

  const uid = useId().replace(/[^a-zA-Z0-9-]/g, '');
  const M = {
    top: 16,
    right: 18,
    bottom: ticks ? 24 : 16,
    left: ticks ? 30 : 16,
  };
  const pw = width - M.left - M.right;
  const ph = height - M.top - M.bottom;
  const sx = (x) => M.left + ((x - xMin) / (xMax - xMin)) * pw;
  const sy = (y) => M.top + ((yMax - y) / (yMax - yMin)) * ph;

  const showXAxis = yMin <= 0 && yMax >= 0;
  const showYAxis = xMin <= 0 && xMax >= 0;
  const xAxisY = showXAxis ? sy(0) : sy(yMin);
  const yAxisX = showYAxis ? sx(0) : sx(xMin);

  const xTicks = frange(xMin, xMax, gx).filter((v) => v !== 0);
  const yTicks = frange(yMin, yMax, gy).filter((v) => v !== 0);

  return (
    <figure className="lp2-graph" role="img" aria-label={alt || caption || 'Coordinate graph'}>
      <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height}>
        <defs>
          <marker
            id={`arr-${uid}`}
            viewBox="0 0 10 10"
            refX="7"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 8 5 L 0 9 z" fill={AXIS_COLOR} />
          </marker>
          <clipPath id={`clip-${uid}`}>
            <rect x={M.left} y={M.top} width={pw} height={ph} />
          </clipPath>
        </defs>

        {/* shaded half-planes (inequalities): fill: "above" | "below" on a line */}
        {lines
          .filter((ln) => ln.fill === 'above' || ln.fill === 'below')
          .map((ln, i) => {
            const color = TONE_COLORS[ln.tone] || TONE_COLORS.blue;
            const yL = ln.m * xMin + ln.b;
            const yR = ln.m * xMax + ln.b;
            const edgeY = ln.fill === 'above' ? yMax + 1000 : yMin - 1000;
            const pts = [
              `${sx(xMin)},${sy(yL)}`,
              `${sx(xMax)},${sy(yR)}`,
              `${sx(xMax)},${sy(edgeY)}`,
              `${sx(xMin)},${sy(edgeY)}`,
            ].join(' ');
            return (
              <polygon
                key={`fill${i}`}
                points={pts}
                fill={color}
                fillOpacity="0.13"
                clipPath={`url(#clip-${uid})`}
              />
            );
          })}

        {/* grid */}
        {grid &&
          frange(xMin, xMax, gx).map((v) => (
            <line key={`gx${v}`} x1={sx(v)} y1={M.top} x2={sx(v)} y2={M.top + ph} stroke={GRID_COLOR} strokeWidth="1" />
          ))}
        {grid &&
          frange(yMin, yMax, gy).map((v) => (
            <line key={`gy${v}`} x1={M.left} y1={sy(v)} x2={M.left + pw} y2={sy(v)} stroke={GRID_COLOR} strokeWidth="1" />
          ))}

        {/* axes with arrowheads */}
        {showXAxis && (
          <line
            x1={M.left - 4}
            y1={xAxisY}
            x2={M.left + pw + 6}
            y2={xAxisY}
            stroke={AXIS_COLOR}
            strokeWidth="1.4"
            markerEnd={`url(#arr-${uid})`}
            markerStart={`url(#arr-${uid})`}
          />
        )}
        {showYAxis && (
          <line
            x1={yAxisX}
            y1={M.top + ph + 4}
            x2={yAxisX}
            y2={M.top - 6}
            stroke={AXIS_COLOR}
            strokeWidth="1.4"
            markerEnd={`url(#arr-${uid})`}
            markerStart={`url(#arr-${uid})`}
          />
        )}
        {showXAxis && (
          <text x={M.left + pw + 8} y={xAxisY + 4} fontSize="12" fontStyle="italic" fill={AXIS_COLOR}>
            {xLabel}
          </text>
        )}
        {showYAxis && (
          <text x={yAxisX + 6} y={M.top - 6} fontSize="12" fontStyle="italic" fill={AXIS_COLOR}>
            {yLabel}
          </text>
        )}

        {/* numbered ticks */}
        {ticks &&
          xTicks.map((v) => (
            <g key={`tx${v}`}>
              <line x1={sx(v)} y1={xAxisY - 3} x2={sx(v)} y2={xAxisY + 3} stroke={AXIS_COLOR} strokeWidth="1" />
              <text x={sx(v)} y={xAxisY + 14} fontSize="10" fill={LABEL_COLOR} textAnchor="middle">
                {v}
              </text>
            </g>
          ))}
        {ticks &&
          yTicks.map((v) => (
            <g key={`ty${v}`}>
              <line x1={yAxisX - 3} y1={sy(v)} x2={yAxisX + 3} y2={sy(v)} stroke={AXIS_COLOR} strokeWidth="1" />
              <text x={yAxisX - 6} y={sy(v) + 3.5} fontSize="10" fill={LABEL_COLOR} textAnchor="end">
                {v}
              </text>
            </g>
          ))}

        {/* segments (rise/run legs, auxiliary construction lines) */}
        {segments.map((sg, i) => {
          const color = TONE_COLORS[sg.tone] || TONE_COLORS.gray;
          const mx = (sg.x1 + sg.x2) / 2;
          const my = (sg.y1 + sg.y2) / 2;
          return (
            <g key={`sg${i}`}>
              <line
                x1={sx(sg.x1)}
                y1={sy(sg.y1)}
                x2={sx(sg.x2)}
                y2={sy(sg.y2)}
                stroke={color}
                strokeWidth="1.8"
                strokeDasharray={sg.dashed ? '5 4' : undefined}
                strokeLinecap="round"
              />
              {sg.label && (
                <text
                  x={sx(mx) + (sg.labelDx !== undefined ? sg.labelDx : 8)}
                  y={sy(my) + (sg.labelDy !== undefined ? sg.labelDy : -6)}
                  fontSize="11"
                  fontWeight="600"
                  fill={color}
                  textAnchor={sg.labelAnchor || 'start'}
                >
                  {sg.label}
                </text>
              )}
            </g>
          );
        })}

        {/* circles in DATA coordinates (circle equations in the xy-plane) */}
        {circles.map((c, i) => {
          const color = TONE_COLORS[c.tone] || TONE_COLORS.blue;
          return (
            <ellipse
              key={`cc${i}`}
              cx={sx(c.cx)}
              cy={sy(c.cy)}
              rx={(c.r * pw) / (xMax - xMin)}
              ry={(c.r * ph) / (yMax - yMin)}
              fill={c.fill ? color : 'none'}
              fillOpacity={c.fill ? 0.08 : undefined}
              stroke={color}
              strokeWidth="2.2"
              strokeDasharray={c.dashed ? '6 4' : undefined}
              clipPath={`url(#clip-${uid})`}
            />
          );
        })}

        {/* curves (parabolas, exponentials) — sampled paths, clipped to the plot */}
        {curves.map((cv, i) => {
          const color = TONE_COLORS[cv.tone] || TONE_COLORS.blue;
          const STEPS = 160;
          const parts = [];
          for (let s = 0; s <= STEPS; s++) {
            const x = xMin + ((xMax - xMin) * s) / STEPS;
            const y = evalCurve(cv, x);
            if (!Number.isFinite(y)) continue;
            const px = sx(x);
            const py = Math.max(-2000, Math.min(3000, sy(y)));
            parts.push(`${parts.length === 0 ? 'M' : 'L'}${px.toFixed(2)},${py.toFixed(2)}`);
          }
          if (parts.length < 2) return null;
          let label = null;
          if (cv.label) {
            const lx = cv.labelAt !== undefined ? cv.labelAt : xMin + (xMax - xMin) * 0.75;
            const ly = evalCurve(cv, lx);
            label = (
              <text
                x={sx(lx) + (cv.labelDx !== undefined ? cv.labelDx : 8)}
                y={sy(ly) + (cv.labelDy !== undefined ? cv.labelDy : -8)}
                fontSize="11.5"
                fontStyle="italic"
                fill={color}
              >
                {cv.label}
              </text>
            );
          }
          return (
            <g key={`cv${i}`}>
              <path
                d={parts.join(' ')}
                fill="none"
                stroke={color}
                strokeWidth="2.2"
                strokeDasharray={cv.dashed ? '6 4' : undefined}
                strokeLinecap="round"
                clipPath={`url(#clip-${uid})`}
              />
              {label}
            </g>
          );
        })}

        {/* lines */}
        {lines.map((ln, i) => {
          const seg = clipLine(ln.m, ln.b, xMin, xMax, yMin, yMax);
          if (!seg) return null;
          const color = TONE_COLORS[ln.tone] || TONE_COLORS.blue;
          const [[x1, y1], [x2, y2]] = seg;
          let label = null;
          if (ln.label) {
            const lx = ln.labelAt !== undefined ? ln.labelAt : x1 + (x2 - x1) * 0.72;
            const ly = ln.m * lx + ln.b;
            label = (
              <text
                x={sx(lx) + (ln.labelDx !== undefined ? ln.labelDx : 8)}
                y={sy(ly) + (ln.labelDy !== undefined ? ln.labelDy : -8)}
                fontSize="11.5"
                fontStyle="italic"
                fill={color}
              >
                {ln.label}
              </text>
            );
          }
          return (
            <g key={`ln${i}`}>
              <line
                x1={sx(x1)}
                y1={sy(y1)}
                x2={sx(x2)}
                y2={sy(y2)}
                stroke={color}
                strokeWidth="2.2"
                strokeDasharray={ln.dashed ? '6 4' : undefined}
                strokeLinecap="round"
              />
              {label}
            </g>
          );
        })}

        {/* points */}
        {points.map((pt, i) => {
          const color = TONE_COLORS[pt.tone] || TONE_COLORS.rose;
          return (
            <g key={`pt${i}`}>
              {pt.guides && (
                <>
                  <line x1={sx(pt.x)} y1={sy(pt.y)} x2={sx(pt.x)} y2={xAxisY} stroke={color} strokeWidth="1" strokeDasharray="3 3" />
                  <line x1={sx(pt.x)} y1={sy(pt.y)} x2={yAxisX} y2={sy(pt.y)} stroke={color} strokeWidth="1" strokeDasharray="3 3" />
                </>
              )}
              <circle cx={sx(pt.x)} cy={sy(pt.y)} r="4" fill={color} stroke="#fff" strokeWidth="1.4" />
              {pt.label && (
                <text
                  x={sx(pt.x) + (pt.labelDx !== undefined ? pt.labelDx : 8)}
                  y={sy(pt.y) + (pt.labelDy !== undefined ? pt.labelDy : -8)}
                  fontSize="11"
                  fontWeight="600"
                  fill={color}
                >
                  {pt.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      {caption && <figcaption className="lp2-graph__caption">{renderInline(caption)}</figcaption>}
    </figure>
  );
}

/* ---------- NumberLineBlock — one-variable solution sets ----------
 *
 * { "type": "numberline", "min": -2, "max": 8, "step": 1,
 *   "points": [{ "x": 5, "kind": "open" | "closed", "tone": "blue" }],
 *   "rays": [{ "from": 5, "direction": "left" | "right", "tone": "blue" }],
 *   "caption": "...", "alt": "..." }
 */

export function NumberLineBlock({ block }) {
  const {
    min = -5,
    max = 5,
    step = 1,
    width = 380,
    height = 78,
    points = [],
    rays = [],
    caption,
    alt,
  } = block;

  const uid = useId().replace(/[^a-zA-Z0-9-]/g, '');
  const ML = 20;
  const MR = 20;
  const axisY = 30;
  const sx = (x) => ML + ((x - min) / (max - min)) * (width - ML - MR);
  const tones = [...new Set(rays.map((r) => r.tone || 'blue'))];

  return (
    <figure className="lp2-graph" role="img" aria-label={alt || caption || 'Number line'}>
      <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height}>
        <defs>
          <marker
            id={`nlarr-${uid}`}
            viewBox="0 0 10 10"
            refX="7"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 8 5 L 0 9 z" fill={AXIS_COLOR} />
          </marker>
          {tones.map((t) => (
            <marker
              key={t}
              id={`nlarr-${uid}-${t}`}
              viewBox="0 0 10 10"
              refX="7"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 8 5 L 0 9 z" fill={TONE_COLORS[t] || TONE_COLORS.blue} />
            </marker>
          ))}
        </defs>

        {/* axis */}
        <line
          x1={ML - 8}
          y1={axisY}
          x2={width - MR + 8}
          y2={axisY}
          stroke={AXIS_COLOR}
          strokeWidth="1.4"
          markerStart={`url(#nlarr-${uid})`}
          markerEnd={`url(#nlarr-${uid})`}
        />

        {/* ticks + numbers */}
        {frange(min, max, step).map((v) => (
          <g key={`t${v}`}>
            <line x1={sx(v)} y1={axisY - 4} x2={sx(v)} y2={axisY + 4} stroke={AXIS_COLOR} strokeWidth="1" />
            <text x={sx(v)} y={axisY + 20} fontSize="10.5" fill={LABEL_COLOR} textAnchor="middle">
              {v}
            </text>
          </g>
        ))}

        {/* solution rays */}
        {rays.map((r, i) => {
          const color = TONE_COLORS[r.tone || 'blue'] || TONE_COLORS.blue;
          const x2 = r.direction === 'left' ? ML - 4 : width - MR + 4;
          return (
            <line
              key={`r${i}`}
              x1={sx(r.from)}
              y1={axisY}
              x2={x2}
              y2={axisY}
              stroke={color}
              strokeWidth="3.6"
              strokeLinecap="round"
              markerEnd={`url(#nlarr-${uid}-${r.tone || 'blue'})`}
            />
          );
        })}

        {/* endpoints: open (excluded) / closed (included) */}
        {points.map((pt, i) => {
          const color = TONE_COLORS[pt.tone || 'blue'] || TONE_COLORS.blue;
          return pt.kind === 'open' ? (
            <circle key={`p${i}`} cx={sx(pt.x)} cy={axisY} r="5.5" fill="#fff" stroke={color} strokeWidth="2.4" />
          ) : (
            <circle key={`p${i}`} cx={sx(pt.x)} cy={axisY} r="5.5" fill={color} stroke="#fff" strokeWidth="1.4" />
          );
        })}
      </svg>
      {caption && <figcaption className="lp2-graph__caption">{renderInline(caption)}</figcaption>}
    </figure>
  );
}

/* ---------- DotPlotBlock — one-variable data as stacked dots ----------
 *
 * { "type": "dotplot", "min": 0, "max": 6, "step": 1,
 *   "counts": [{ "x": 2, "n": 4 }, ...], "tone": "blue",
 *   "xTitle": "Books read", "caption": "...", "alt": "..." }
 */

export function DotPlotBlock({ block }) {
  const {
    min = 0,
    max = 10,
    step = 1,
    counts = [],
    tone = 'blue',
    width = 360,
    xTitle,
    caption,
    alt,
  } = block;

  const color = TONE_COLORS[tone] || TONE_COLORS.blue;
  const maxN = Math.max(1, ...counts.map((c) => c.n || 0));
  const DOT = 12.5;
  const axisY = 18 + maxN * DOT;
  const height = axisY + (xTitle ? 40 : 26);
  const ML = 20;
  const MR = 20;
  const sx = (x) => ML + ((x - min) / (max - min)) * (width - ML - MR);

  return (
    <figure className="lp2-graph" role="img" aria-label={alt || caption || 'Dot plot'}>
      <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height}>
        <line x1={ML - 6} y1={axisY} x2={width - MR + 6} y2={axisY} stroke={AXIS_COLOR} strokeWidth="1.4" />
        {frange(min, max, step).map((v) => (
          <g key={`t${v}`}>
            <line x1={sx(v)} y1={axisY - 4} x2={sx(v)} y2={axisY + 4} stroke={AXIS_COLOR} strokeWidth="1" />
            <text x={sx(v)} y={axisY + 17} fontSize="10.5" fill={LABEL_COLOR} textAnchor="middle">
              {v}
            </text>
          </g>
        ))}
        {counts.map((c, i) =>
          Array.from({ length: c.n || 0 }).map((_, j) => (
            <circle
              key={`d${i}-${j}`}
              cx={sx(c.x)}
              cy={axisY - 9 - j * DOT}
              r="4.6"
              fill={color}
              fillOpacity="0.85"
            />
          ))
        )}
        {xTitle && (
          <text x={(ML + width - MR) / 2} y={height - 8} fontSize="11" fill={LABEL_COLOR} textAnchor="middle">
            {xTitle}
          </text>
        )}
      </svg>
      {caption && <figcaption className="lp2-graph__caption">{renderInline(caption)}</figcaption>}
    </figure>
  );
}

/* ---------- HistogramBlock — frequencies over intervals ----------
 *
 * { "type": "histogram", "bins": [{ "label": "0–2", "n": 5 }, ...],
 *   "yStep": 2, "tone": "blue", "yTitle": "Frequency", "xTitle": "...",
 *   "caption": "...", "alt": "..." }
 */

export function HistogramBlock({ block }) {
  const {
    bins = [],
    yStep = 2,
    tone = 'blue',
    width = 380,
    height = 250,
    yTitle = 'Frequency',
    xTitle,
    caption,
    alt,
  } = block;

  const color = TONE_COLORS[tone] || TONE_COLORS.blue;
  const maxN = Math.max(1, ...bins.map((b) => b.n || 0));
  const yMax = Math.ceil(maxN / yStep) * yStep;
  const M = { top: 14, right: 14, bottom: xTitle ? 46 : 32, left: 40 };
  const pw = width - M.left - M.right;
  const ph = height - M.top - M.bottom;
  const barW = pw / Math.max(1, bins.length);
  const sy = (n) => M.top + ph - (n / yMax) * ph;

  return (
    <figure className="lp2-graph" role="img" aria-label={alt || caption || 'Histogram'}>
      <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height}>
        {/* gridlines + y labels */}
        {frange(0, yMax, yStep).map((v) => (
          <g key={`g${v}`}>
            <line x1={M.left} y1={sy(v)} x2={M.left + pw} y2={sy(v)} stroke={v === 0 ? AXIS_COLOR : GRID_COLOR} strokeWidth={v === 0 ? 1.4 : 1} />
            <text x={M.left - 7} y={sy(v) + 3.5} fontSize="10" fill={LABEL_COLOR} textAnchor="end">
              {v}
            </text>
          </g>
        ))}
        {/* bars */}
        {bins.map((b, i) => (
          <rect
            key={`b${i}`}
            x={M.left + i * barW}
            y={sy(b.n || 0)}
            width={barW}
            height={M.top + ph - sy(b.n || 0)}
            fill={color}
            fillOpacity="0.28"
            stroke={color}
            strokeWidth="1.4"
          />
        ))}
        {/* x labels */}
        {bins.map((b, i) => (
          <text
            key={`l${i}`}
            x={M.left + i * barW + barW / 2}
            y={M.top + ph + 15}
            fontSize="10"
            fill={LABEL_COLOR}
            textAnchor="middle"
          >
            {b.label}
          </text>
        ))}
        {/* axis titles */}
        <text
          x={12}
          y={M.top + ph / 2}
          fontSize="10.5"
          fill={LABEL_COLOR}
          textAnchor="middle"
          transform={`rotate(-90 12 ${M.top + ph / 2})`}
        >
          {yTitle}
        </text>
        {xTitle && (
          <text x={M.left + pw / 2} y={height - 8} fontSize="11" fill={LABEL_COLOR} textAnchor="middle">
            {xTitle}
          </text>
        )}
        <line x1={M.left} y1={M.top} x2={M.left} y2={M.top + ph} stroke={AXIS_COLOR} strokeWidth="1.4" />
      </svg>
      {caption && <figcaption className="lp2-graph__caption">{renderInline(caption)}</figcaption>}
    </figure>
  );
}

/* ---------- GeometryBlock — labeled geometric figures ----------
 *
 * A free-form figure canvas in raw SVG coordinates (y grows downward).
 * { "type": "geometry", "width": 220, "height": 170, "elements": [
 *     { "kind": "polygon", "points": [[30,30],[170,30],[170,110],[30,110]],
 *       "tone": "blue", "fill": true, "dashed": false },
 *     { "kind": "circle", "cx": 100, "cy": 75, "r": 55, "tone": "blue", "fill": true },
 *     { "kind": "ellipse", "cx": 100, "cy": 50, "rx": 45, "ry": 14, "tone": "blue" },
 *     { "kind": "segment", "x1": 0, "y1": 0, "x2": 10, "y2": 10, "dashed": true },
 *     { "kind": "arc", "x1": 60, "y1": 70, "x2": 140, "y2": 70, "r": 40,
 *       "ry": 14, "sweep": 1, "large": 0, "dashed": false },   // ry → elliptical
 *     { "kind": "label", "x": 100, "y": 128, "text": "b = 12", "anchor": "middle",
 *       "tone": "blue", "size": 12, "italic": true },
 *     { "kind": "rightangle", "x": 120, "y": 120, "size": 10, "rotate": 0 },
 *     { "kind": "tick", "x": 50, "y": 50, "rotate": 30, "size": 9 },
 *     { "kind": "point", "x": 100, "y": 75, "tone": "blue" }
 *   ], "caption": "...", "alt": "..." }
 */

const SHAPE_COLOR = '#3d4b5e';

export function GeometryBlock({ block }) {
  const { width = 260, height = 180, elements = [], caption, alt } = block;

  const colorOf = (el, fallback = SHAPE_COLOR) =>
    el.tone ? TONE_COLORS[el.tone] || fallback : fallback;

  return (
    <figure className="lp2-graph" role="img" aria-label={alt || caption || 'Geometric figure'}>
      <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height}>
        {elements.map((el, i) => {
          const color = colorOf(el);
          const dash = el.dashed ? '6 4' : undefined;
          switch (el.kind) {
            case 'polygon':
              return (
                <polygon
                  key={i}
                  points={(el.points || []).map((p) => p.join(',')).join(' ')}
                  fill={el.fill ? color : 'none'}
                  fillOpacity={el.fill ? 0.13 : undefined}
                  stroke={color}
                  strokeWidth="1.8"
                  strokeDasharray={dash}
                  strokeLinejoin="round"
                />
              );
            case 'circle':
              return (
                <circle
                  key={i}
                  cx={el.cx}
                  cy={el.cy}
                  r={el.r}
                  fill={el.fill ? color : 'none'}
                  fillOpacity={el.fill ? 0.13 : undefined}
                  stroke={color}
                  strokeWidth="1.8"
                  strokeDasharray={dash}
                />
              );
            case 'ellipse':
              return (
                <ellipse
                  key={i}
                  cx={el.cx}
                  cy={el.cy}
                  rx={el.rx}
                  ry={el.ry}
                  fill={el.fill ? color : 'none'}
                  fillOpacity={el.fill ? 0.13 : undefined}
                  stroke={color}
                  strokeWidth="1.8"
                  strokeDasharray={dash}
                />
              );
            case 'segment':
              return (
                <line
                  key={i}
                  x1={el.x1}
                  y1={el.y1}
                  x2={el.x2}
                  y2={el.y2}
                  stroke={color}
                  strokeWidth={el.width || 1.8}
                  strokeDasharray={dash}
                  strokeLinecap="round"
                />
              );
            case 'arc': {
              const rx = el.r;
              const ry = el.ry !== undefined ? el.ry : el.r;
              const d = `M ${el.x1} ${el.y1} A ${rx} ${ry} 0 ${el.large ? 1 : 0} ${el.sweep ? 1 : 0} ${el.x2} ${el.y2}`;
              return (
                <path
                  key={i}
                  d={d}
                  fill="none"
                  stroke={color}
                  strokeWidth="1.8"
                  strokeDasharray={dash}
                  strokeLinecap="round"
                />
              );
            }
            case 'label':
              return (
                <text
                  key={i}
                  x={el.x}
                  y={el.y}
                  fontSize={el.size || 12}
                  fontStyle={el.italic === false ? undefined : 'italic'}
                  fontWeight={el.bold ? 700 : 500}
                  fill={el.tone ? colorOf(el) : '#2a3342'}
                  textAnchor={el.anchor || 'middle'}
                >
                  {el.text}
                </text>
              );
            case 'rightangle': {
              const s = el.size || 10;
              return (
                <path
                  key={i}
                  d={`M ${el.x + s} ${el.y} L ${el.x + s} ${el.y - s} L ${el.x} ${el.y - s}`}
                  fill="none"
                  stroke={color}
                  strokeWidth="1.4"
                  transform={el.rotate ? `rotate(${el.rotate} ${el.x} ${el.y})` : undefined}
                />
              );
            }
            case 'tick': {
              const s = (el.size || 9) / 2;
              return (
                <line
                  key={i}
                  x1={el.x}
                  y1={el.y - s}
                  x2={el.x}
                  y2={el.y + s}
                  stroke={color}
                  strokeWidth="1.6"
                  transform={el.rotate ? `rotate(${el.rotate} ${el.x} ${el.y})` : undefined}
                />
              );
            }
            case 'point':
              return <circle key={i} cx={el.x} cy={el.y} r={el.r || 3.2} fill={color} />;
            case 'sector': {
              // filled pie slice; angles in degrees, screen-clockwise from +x
              const rad = (a) => (a * Math.PI) / 180;
              const p1x = el.cx + el.r * Math.cos(rad(el.start));
              const p1y = el.cy + el.r * Math.sin(rad(el.start));
              const p2x = el.cx + el.r * Math.cos(rad(el.end));
              const p2y = el.cy + el.r * Math.sin(rad(el.end));
              const large = Math.abs(el.end - el.start) > 180 ? 1 : 0;
              return (
                <path
                  key={i}
                  d={`M ${el.cx} ${el.cy} L ${p1x.toFixed(2)} ${p1y.toFixed(2)} A ${el.r} ${el.r} 0 ${large} 1 ${p2x.toFixed(2)} ${p2y.toFixed(2)} Z`}
                  fill={color}
                  fillOpacity={el.fill === false ? 0 : 0.22}
                  stroke={color}
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
              );
            }
            default:
              return null;
          }
        })}
      </svg>
      {caption && <figcaption className="lp2-graph__caption">{renderInline(caption)}</figcaption>}
    </figure>
  );
}

/* ---------- BoxPlotBlock — five-number summary ----------
 *
 * { "type": "boxplot", "min": 55, "max": 100, "step": 5,
 *   "low": 62, "q1": 70, "median": 78, "q3": 86, "high": 94,
 *   "tone": "blue", "caption": "...", "alt": "..." }
 */

export function BoxPlotBlock({ block }) {
  const {
    min = 0,
    max = 10,
    step = 1,
    low,
    q1,
    median,
    q3,
    high,
    tone = 'blue',
    width = 380,
    caption,
    alt,
  } = block;

  const color = TONE_COLORS[tone] || TONE_COLORS.blue;
  const height = 108;
  const ML = 20;
  const MR = 20;
  const axisY = height - 26;
  const boxMid = 40;
  const boxH = 34;
  const sx = (x) => ML + ((x - min) / (max - min)) * (width - ML - MR);

  return (
    <figure className="lp2-graph" role="img" aria-label={alt || caption || 'Box plot'}>
      <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height}>
        {/* axis */}
        <line x1={ML - 6} y1={axisY} x2={width - MR + 6} y2={axisY} stroke={AXIS_COLOR} strokeWidth="1.4" />
        {frange(min, max, step).map((v) => (
          <g key={`t${v}`}>
            <line x1={sx(v)} y1={axisY - 4} x2={sx(v)} y2={axisY + 4} stroke={AXIS_COLOR} strokeWidth="1" />
            <text x={sx(v)} y={axisY + 17} fontSize="10.5" fill={LABEL_COLOR} textAnchor="middle">
              {v}
            </text>
          </g>
        ))}
        {/* whiskers */}
        <line x1={sx(low)} y1={boxMid} x2={sx(q1)} y2={boxMid} stroke={color} strokeWidth="1.8" />
        <line x1={sx(q3)} y1={boxMid} x2={sx(high)} y2={boxMid} stroke={color} strokeWidth="1.8" />
        <line x1={sx(low)} y1={boxMid - 9} x2={sx(low)} y2={boxMid + 9} stroke={color} strokeWidth="1.8" />
        <line x1={sx(high)} y1={boxMid - 9} x2={sx(high)} y2={boxMid + 9} stroke={color} strokeWidth="1.8" />
        {/* box */}
        <rect
          x={sx(q1)}
          y={boxMid - boxH / 2}
          width={sx(q3) - sx(q1)}
          height={boxH}
          fill={color}
          fillOpacity="0.22"
          stroke={color}
          strokeWidth="1.8"
        />
        {/* median */}
        <line x1={sx(median)} y1={boxMid - boxH / 2} x2={sx(median)} y2={boxMid + boxH / 2} stroke={color} strokeWidth="2.6" />
      </svg>
      {caption && <figcaption className="lp2-graph__caption">{renderInline(caption)}</figcaption>}
    </figure>
  );
}
