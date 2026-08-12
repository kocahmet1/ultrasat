/**
 * Generate the human-readable editorial review for Practice Test 10 R&W.
 *
 * Usage: node scripts/generatePracticeTest10RWReview.js
 */

const fs = require('fs');
const path = require('path');

const data = require(path.resolve(__dirname, 'data/practiceTest10RW.json'));
const outputPath = path.resolve(__dirname, '..', 'PracticeTest10_ReadingWriting_review.html');
const letters = ['A', 'B', 'C', 'D'];

const skillLabels = {
  'words-in-context': 'Words in Context',
  'text-structure-purpose': 'Text Structure & Purpose',
  'cross-text-connections': 'Cross-Text Connections',
  'central-ideas-details': 'Central Ideas & Details',
  'command-of-evidence': 'Command of Evidence',
  inferences: 'Inferences',
  boundaries: 'Boundaries',
  'form-structure-sense': 'Form, Structure & Sense',
  transitions: 'Transitions',
  'rhetorical-synthesis': 'Rhetorical Synthesis',
};

const domainBySkill = {
  'words-in-context': 'Craft and Structure',
  'text-structure-purpose': 'Craft and Structure',
  'cross-text-connections': 'Craft and Structure',
  'central-ideas-details': 'Information and Ideas',
  'command-of-evidence': 'Information and Ideas',
  inferences: 'Information and Ideas',
  boundaries: 'Standard English Conventions',
  'form-structure-sense': 'Standard English Conventions',
  transitions: 'Expression of Ideas',
  'rhetorical-synthesis': 'Expression of Ideas',
};

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

// Passages are trusted authored content and may intentionally contain table/SVG HTML.
function renderPassage(value) {
  return String(value)
    .replace(/\[UNDERLINED\]([\s\S]*?)\[\/UNDERLINED\]/g, '<u>$1</u>')
    .replace(/\r?\n/g, '<br>');
}

function proseWords(value) {
  const plain = String(value || '')
    .replace(/<table\b[\s\S]*?<\/table>/gi, ' ')
    .replace(/<svg\b[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\[\/?UNDERLINED\]/g, ' ');
  return (plain.match(/[A-Za-z0-9]+(?:[’'-][A-Za-z0-9]+)*/g) || []).length;
}

const chunks = [`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Practice Test 10 &mdash; Reading &amp; Writing Editorial Review</title>
<style>
body{font:16px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;max-width:920px;margin:32px auto;padding:0 18px;color:#1a1a1a;background:#fafafa}
h1{font-size:26px;margin-bottom:4px}h2{margin-top:42px;border-bottom:2px solid #333;padding-bottom:6px}
h3{margin-top:28px;color:#444;font-size:17px}
.sub{color:#666;margin-top:0}
.summary{background:#fff;border:1px solid #ddd;border-radius:10px;padding:14px 18px;margin:18px 0}
.summary table{border-collapse:collapse;margin:8px 0}
.summary td,.summary th{border:1px solid #ccc;padding:3px 10px;font-size:14px;text-align:left}
.key{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:13px;letter-spacing:1px;background:#f2f2f5;padding:2px 6px;border-radius:4px}
.q{border:1px solid #ddd;border-radius:10px;padding:16px 18px;margin:18px 0;background:#fff}
.meta{font-size:12px;color:#666;text-transform:uppercase;letter-spacing:.04em;margin-bottom:8px}
.badge{display:inline-block;padding:2px 8px;border-radius:10px;background:#eef;margin-right:6px}
.hard{background:#fde8e8}.medium{background:#fff4e0}.easy{background:#e8f5e9}
.passage{background:#f7f7f9;border-left:3px solid #bbb;padding:10px 14px;margin:10px 0;border-radius:4px}
.stem{font-weight:600;margin:10px 0}.opt{padding:4px 0}.correct{color:#137333;font-weight:700}
.expl{font-size:14px;color:#333;background:#f4faf4;border-radius:6px;padding:10px 12px;margin-top:10px}
table{border-collapse:collapse;margin:12px auto;max-width:100%}th,td{border:1px solid #888;padding:4px 10px}
caption{font-size:13px;color:#555;padding-bottom:6px}
figure{margin:14px 0;overflow-x:auto}svg[role="img"]{display:block;width:100%;max-width:760px;height:auto;margin:0 auto}
</style>
</head>
<body>
<h1>Practice Test 10 &mdash; Reading &amp; Writing</h1>
<p class="sub">Editorial review copy. ${escapeHtml(data.note || '')}</p>`];

// ---- Form summary ----
const allItems = data.modules.flatMap((m) => m.questions.map((q) => ({ ...q, moduleNumber: m.moduleNumber })));
const domainTotals = {};
allItems.forEach((q) => {
  const dm = domainBySkill[q.subcategory];
  domainTotals[dm] = (domainTotals[dm] || 0) + 1;
});

chunks.push('<div class="summary"><h3 style="margin-top:0">Form summary</h3><table><tr><th>Module</th><th>Items</th><th>Easy</th><th>Medium</th><th>Hard</th><th>Answer key</th></tr>');
data.modules.forEach((m) => {
  const diff = { easy: 0, medium: 0, hard: 0 };
  m.questions.forEach((q) => { diff[q.difficulty] += 1; });
  const seq = m.questions.map((q) => letters[q.correctAnswer]).join('');
  chunks.push(`<tr><td>Module ${m.moduleNumber}</td><td>${m.questions.length}</td><td>${diff.easy}</td><td>${diff.medium}</td><td>${diff.hard}</td><td><span class="key">${seq}</span></td></tr>`);
});
chunks.push('</table>');
chunks.push('<p style="font-size:14px;margin-bottom:4px"><strong>Domain totals:</strong> '
  + Object.entries(domainTotals).map(([k, v]) => `${escapeHtml(k)} ${v}`).join(' &middot; ') + '</p>');

// mean prose length per skill
const bySkill = {};
allItems.forEach((q) => {
  (bySkill[q.subcategory] = bySkill[q.subcategory] || []).push(proseWords(q.passage));
});
chunks.push('<p style="font-size:14px;margin-bottom:4px"><strong>Mean stimulus length (prose words):</strong> '
  + Object.entries(bySkill).map(([k, v]) => `${escapeHtml(skillLabels[k])} ${(v.reduce((a, b) => a + b, 0) / v.length).toFixed(0)}`).join(' &middot; ') + '</p>');
chunks.push('</div>');

// ---- Items ----
data.modules.forEach((m) => {
  chunks.push(`<h2>Module ${m.moduleNumber} &mdash; ${escapeHtml(m.description)}</h2>`);
  let lastDomain = null;
  m.questions.forEach((q) => {
    const dm = domainBySkill[q.subcategory];
    if (dm !== lastDomain) { chunks.push(`<h3>${escapeHtml(dm)}</h3>`); lastDomain = dm; }
    const key = letters[q.correctAnswer];
    chunks.push(`<div class="q">
<div class="meta">Q${q.originalQuestionNumber}
 <span class="badge">${escapeHtml(skillLabels[q.subcategory] || q.subcategory)}</span>
 <span class="badge ${q.difficulty}">${escapeHtml(q.difficulty)}</span>
 <span class="badge">key ${key}</span>
 <span class="badge">${proseWords(q.passage)} words</span></div>
<div class="passage">${renderPassage(q.passage)}</div>
<div class="stem">${escapeHtml(q.text)}</div>`);
    q.options.forEach((opt, i) => {
      const cls = i === q.correctAnswer ? 'opt correct' : 'opt';
      chunks.push(`<div class="${cls}">${letters[i]}. ${escapeHtml(opt)}${i === q.correctAnswer ? ' &check;' : ''}</div>`);
    });
    chunks.push(`<div class="expl">${escapeHtml(q.explanation)}</div></div>`);
  });
});

chunks.push('</body></html>');
fs.writeFileSync(outputPath, chunks.join('\n'), 'utf8');
console.log(`Wrote ${outputPath} (${allItems.length} items)`);
