/**
 * Generate the human-readable editorial review for Practice Test 4 R&W.
 *
 * Usage: node scripts/generatePracticeTest4RWReview.js
 */

const fs = require('fs');
const path = require('path');

const data = require(path.resolve(__dirname, 'data/practiceTest4RW.json'));
const outputPath = path.resolve(__dirname, '..', 'PracticeTest4_ReadingWriting_review.html');
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

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

// Passages are trusted authored content and may intentionally contain table HTML.
function renderPassage(value) {
  return String(value)
    .replace(/\[UNDERLINED\]([\s\S]*?)\[\/UNDERLINED\]/g, '<u>$1</u>')
    .replace(/\r?\n/g, '<br>');
}

const chunks = [`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Practice Test 4 — Reading &amp; Writing Editorial Review</title>
<style>
body{font:16px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;max-width:900px;margin:32px auto;padding:0 18px;color:#1a1a1a;background:#fafafa}
h1{font-size:26px}h2{margin-top:38px;border-bottom:2px solid #333;padding-bottom:6px}
.q{border:1px solid #ddd;border-radius:10px;padding:16px 18px;margin:18px 0;background:#fff}
.meta{font-size:12px;color:#666;text-transform:uppercase;letter-spacing:.04em;margin-bottom:8px}
.badge{display:inline-block;padding:2px 8px;border-radius:10px;background:#eef;margin-right:6px}
.hard{background:#fde8e8}.medium{background:#fff4e0}.easy{background:#e8f5e9}
.passage{background:#f7f7f9;border-left:3px solid #bbb;padding:10px 14px;margin:10px 0;border-radius:4px}
.stem{font-weight:600;margin:10px 0}.opt{padding:4px 0}.correct{color:#137333;font-weight:700}
.expl{font-size:14px;color:#333;background:#f4faf4;border-radius:6px;padding:10px 12px;margin-top:10px}
table{border-collapse:collapse;margin:12px auto;max-width:100%}th,td{border:1px solid #888;padding:4px 10px}
figure{margin:14px 0;overflow-x:auto}svg[role="img"]{display:block;width:100%;max-width:760px;height:auto;margin:0 auto}
</style>
</head>
<body>
<h1>Practice Test 4 — Reading &amp; Writing</h1>
<p style="color:#555">${data.modules.reduce((sum, mod) => sum + mod.questions.length, 0)} original questions across two modules. The correct choice is marked ✓. This file is generated directly from <code>scripts/data/practiceTest4RW.json</code> for editorial review; production deployment is a separate step.</p>`];

for (const mod of data.modules) {
  chunks.push(`<h2>Module ${mod.moduleNumber} — ${mod.questions.length} questions</h2>`);
  for (const q of mod.questions) {
    chunks.push(`<div class="q" id="m${mod.moduleNumber}-q${q.originalQuestionNumber}">`);
    chunks.push(`<div class="meta"><span class="badge">Q${q.originalQuestionNumber}</span><span class="badge">${escapeHtml(skillLabels[q.subcategory] || q.subcategory)}</span><span class="badge ${escapeHtml(q.difficulty)}">${escapeHtml(q.difficulty)}</span></div>`);
    chunks.push(`<div class="passage">${renderPassage(q.passage)}</div>`);
    chunks.push(`<div class="stem">${escapeHtml(q.text)}</div>`);
    q.options.forEach((option, index) => {
      const keyed = index === q.correctAnswer;
      chunks.push(`<div class="opt${keyed ? ' correct' : ''}">${letters[index]}. ${escapeHtml(option)}${keyed ? ' ✓' : ''}</div>`);
    });
    chunks.push(`<div class="expl">${escapeHtml(q.explanation)}</div>`);
    chunks.push('</div>');
  }
}

chunks.push('</body>\n</html>\n');
fs.writeFileSync(outputPath, chunks.join('\n'), 'utf8');
console.log(`Wrote ${outputPath}`);
