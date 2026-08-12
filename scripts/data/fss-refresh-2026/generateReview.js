#!/usr/bin/env node
/**
 * Render form-structure-sense-100.json as a single-file review page.
 *
 *   node scripts/data/fss-refresh-2026/generateReview.js
 *
 * Writes ./FSS_review.html — every item with its passage, options, key, rationale,
 * and the measured stats compared against the 206 official items.
 */

const fs = require('fs');
const path = require('path');

const items = JSON.parse(fs.readFileSync(path.join(__dirname, 'form-structure-sense-100.json'), 'utf8'));
const corpusPath = path.join(__dirname, 'fss_corpus.json');
const corpus = fs.existsSync(corpusPath) ? JSON.parse(fs.readFileSync(corpusPath, 'utf8')) : [];

const LETTERS = ['A', 'B', 'C', 'D'];
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const wc = (s) => s.replace(/_{4,}/g, 'blank').trim().split(/\s+/).filter(Boolean).length;
const mean = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);
const median = (a) => {
  const s = [...a].sort((x, y) => x - y);
  return s.length ? (s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2) : 0;
};

const passageOf = (q) => q.text.split('\n\n')[0];
const convOf = (q) => (q.skillTags.find((t) => t.startsWith('fss-')) || 'fss-?').replace(/^fss-/, '');

// ------------------------------------------------------------------ stats block

const rows = [];
['easy', 'medium', 'hard'].forEach((d) => {
  const ours = items.filter((q) => q.difficulty === d).map((q) => wc(passageOf(q)));
  const off = corpus.filter((c) => c.diff.toLowerCase() === d).map((c) => c.stim.split(/\s+/).length);
  rows.push({
    label: `${d} passage words`,
    ours: `${mean(ours).toFixed(1)} mean / ${median(ours)} median  (n=${ours.length})`,
    off: off.length ? `${mean(off).toFixed(1)} mean / ${median(off)} median  (n=${off.length})` : '—',
  });
});
const feature = (list, f) => `${((100 * list.filter(f).length) / list.length).toFixed(0)}%`;
const ourP = items.map(passageOf);
const offP = corpus.map((c) => c.stim);
[
  ['contains a year', (s) => /\b(1[5-9]\d\d|20[0-2]\d)\b/.test(s)],
  ['contains any digit', (s) => /\d/.test(s)],
  ['em or en dash', (s) => /[—–]/.test(s)],
  ['parenthetical', (s) => s.includes('(')],
  ['colon', (s) => s.includes(':')],
  ['blank in first sentence', (s) => !s.split('______')[0].includes('.')],
].forEach(([label, f]) => rows.push({ label, ours: feature(ourP, f), off: offP.length ? feature(offP, f) : '—' }));

const keyCounts = { A: 0, B: 0, C: 0, D: 0 };
items.forEach((q) => { keyCounts[LETTERS[q.correctAnswer]] += 1; });
rows.push({ label: 'answer key spread', ours: JSON.stringify(keyCounts), off: 'A65 B39 C41 D61' });

// -------------------------------------------------------------------- render

const byConv = {};
items.forEach((q, i) => {
  const c = convOf(q);
  (byConv[c] = byConv[c] || []).push({ q, i });
});

const card = ({ q, i }) => {
  const passage = passageOf(q);
  const opts = q.options
    .map((o, n) => {
      const ok = n === q.correctAnswer;
      return `<li class="${ok ? 'key' : ''}"><b>${LETTERS[n]}.</b> ${esc(o)}${ok ? ' <span class="tag">key</span>' : ''}</li>`;
    })
    .join('');
  const st = q.explanationStructured;
  return `<article id="${esc(q.authoringRef)}">
  <header>
    <span class="num">#${i + 1}</span>
    <code>${esc(q.authoringRef)}</code>
    <span class="pill ${q.difficulty}">${q.difficulty}</span>
    <span class="pill conv">${esc(convOf(q))}</span>
    <span class="wc">${wc(passage)} words</span>
  </header>
  <p class="passage">${esc(passage).replace(/______/g, '<span class="blank">______</span>')}</p>
  <p class="stem">Which choice completes the text so that it conforms to the conventions of Standard English?</p>
  <ol class="opts">${opts}</ol>
  <details><summary>Rationale</summary>
    <p>${esc(q.explanation)}</p>
    <p class="rule"><b>Rule:</b> ${esc(st.rule)}</p>
    <ul class="rem">${st.thingsToRemember.map((r) => `<li>${esc(r)}</li>`).join('')}</ul>
  </details>
</article>`;
};

const html = `<!doctype html><meta charset="utf-8">
<title>Form, Structure, and Sense — 100 new items</title>
<style>
 :root{--fg:#1a1a1a;--mut:#666;--line:#e3e3e3;--acc:#0b5cad}
 *{box-sizing:border-box}
 body{font:15px/1.55 -apple-system,Segoe UI,Roboto,sans-serif;color:var(--fg);max-width:860px;margin:0 auto;padding:32px 20px 80px}
 h1{font-size:24px;margin:0 0 4px} .sub{color:var(--mut);margin:0 0 28px}
 table{border-collapse:collapse;width:100%;margin:0 0 34px;font-size:13.5px}
 th,td{text-align:left;padding:6px 10px;border-bottom:1px solid var(--line)}
 th{color:var(--mut);font-weight:600}
 h2{font-size:15px;text-transform:uppercase;letter-spacing:.06em;color:var(--mut);margin:36px 0 10px;padding-bottom:6px;border-bottom:2px solid var(--line)}
 article{border:1px solid var(--line);border-radius:8px;padding:14px 16px;margin:0 0 14px}
 header{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:10px}
 .num{font-weight:700;color:var(--mut)} code{font-size:12px;color:var(--acc)}
 .pill{font-size:11px;padding:2px 8px;border-radius:20px;background:#f0f0f0;text-transform:uppercase;letter-spacing:.04em}
 .pill.easy{background:#e4f4e6;color:#1d6b2b}.pill.medium{background:#fdf0dc;color:#8a5a10}.pill.hard{background:#fbe4e4;color:#98232a}
 .pill.conv{background:#eaf1fa;color:var(--acc)} .wc{margin-left:auto;font-size:12px;color:var(--mut)}
 .passage{margin:0 0 10px} .blank{background:#fff3b0;padding:0 3px;border-radius:2px;font-weight:700}
 .stem{margin:0 0 10px;font-style:italic;color:var(--mut);font-size:13.5px}
 ol.opts{list-style:none;margin:0;padding:0} ol.opts li{padding:4px 8px;border-radius:4px}
 ol.opts li.key{background:#e9f6ec} .tag{font-size:10px;color:#1d6b2b;text-transform:uppercase;letter-spacing:.05em}
 details{margin-top:10px;font-size:13.5px} summary{cursor:pointer;color:var(--acc);font-weight:600}
 details p{margin:8px 0} .rule{color:var(--mut)} ul.rem{margin:6px 0 0;padding-left:20px;color:var(--mut)}
</style>
<h1>Form, Structure, and Sense — 100 new items</h1>
<p class="sub">30 easy · 40 medium · 30 hard — measured against ${corpus.length} official College Board items.
Content set <code>fss-refresh-2026-08</code>.</p>

<table><tr><th>Measure</th><th>This set</th><th>Official bank</th></tr>
${rows.map((r) => `<tr><td>${esc(r.label)}</td><td>${esc(r.ours)}</td><td>${esc(r.off)}</td></tr>`).join('')}
</table>

${Object.entries(byConv)
    .map(([c, list]) => `<h2>${esc(c)} — ${list.length} items</h2>${list.map(card).join('')}`)
    .join('')}
`;

const outFile = path.join(__dirname, 'FSS_review.html');
fs.writeFileSync(outFile, html, 'utf8');
console.log(`✓ wrote ${outFile} (${items.length} items)`);
