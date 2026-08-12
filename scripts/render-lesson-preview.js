/* render-lesson-preview.js — static design preview for Lesson v2 content.
 *
 * Server-renders the real Lesson v2 components (components/lesson2) with a
 * lesson's real JSON into a standalone HTML file — no dev server needed.
 * Useful while authoring: catches runtime render errors and gives a
 * pixel-faithful preview of /learn/:subcategoryId.
 *
 * Usage:  node scripts/render-lesson-preview.js central-ideas-details
 * Output: docs/previews/lesson-v2-<id>.html
 */
const fs = require('fs');
const path = require('path');
const os = require('os');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'apps/web/src');
const babel = require(path.join(ROOT, 'node_modules/@babel/core'));
const React = require(path.join(ROOT, 'node_modules/react'));
const { renderToStaticMarkup } = require(path.join(ROOT, 'node_modules/react-dom/server'));

const id = process.argv[2] || 'central-ideas-details';
const lessonFile = path.join(SRC, `content/lessons/${id}.lesson.json`);
if (!fs.existsSync(lessonFile)) {
  console.error(`No lesson JSON at ${lessonFile}`);
  process.exit(1);
}

const taxonomy = JSON.parse(fs.readFileSync(path.join(SRC, 'data/subcategoryTaxonomy.json'), 'utf8'));
const subMeta = taxonomy.subcategories.find((s) => s.id === id);
const domainMeta = subMeta ? taxonomy.domains[subMeta.domain] : null;
const domainName = domainMeta?.name || '';
const sectionLabel = domainMeta?.section === 'math' ? 'Math' : 'Reading & Writing';

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'lp2-'));

function transform(file, out, patches = []) {
  let code = fs.readFileSync(file, 'utf8');
  code = code.replace(/import\.meta\.env\.DEV/g, 'false');
  for (const [from, to] of patches) code = code.split(from).join(to);
  code = code
    .replace(/from 'react'/g, `from '${ROOT}/node_modules/react'`)
    .replace(/from 'react-icons\/fi'/g, `from '${ROOT}/node_modules/react-icons/fi'`)
    .replace(/from 'react-icons\/hi'/g, `from '${ROOT}/node_modules/react-icons/hi'`);
  const res = babel.transformSync(code, {
    presets: [[path.join(ROOT, 'node_modules/@babel/preset-react'), { runtime: 'classic' }]],
    plugins: [path.join(ROOT, 'node_modules/@babel/plugin-transform-modules-commonjs')],
    filename: file,
  });
  fs.writeFileSync(path.join(tmp, out), res.code);
}

transform(path.join(SRC, 'components/lesson2/inlineMarkup.jsx'), 'inlineMarkup.js');
transform(path.join(SRC, 'components/lesson2/GraphBlock.jsx'), 'GraphBlock.js', [
  ["from './inlineMarkup'", `from '${tmp}/inlineMarkup.js'`],
]);
transform(path.join(SRC, 'components/lesson2/LessonBlocks2.jsx'), 'LessonBlocks2.js', [
  ["from './inlineMarkup'", `from '${tmp}/inlineMarkup.js'`],
  ["from './GraphBlock'", `from '${tmp}/GraphBlock.js'`],
  ['useState(false)', 'useState(true)'], // preview: pre-render reveal bodies; JS toggles visibility
]);

const LessonBlockList = require(path.join(tmp, 'LessonBlocks2.js')).default;
const lesson = JSON.parse(fs.readFileSync(lessonFile, 'utf8'));
const h = React.createElement;

const sheets = lesson.pages.map((page, i) =>
  h(
    'article',
    { key: page.id, id: `lesson-page-${page.id}`, className: 'lp2-sheet', 'data-page-index': i },
    h('div', { className: 'lp2-sheet__corner' },
      h('span', null, domainName),
      h('span', null, i === 0 ? lesson.title : `${lesson.title}: ${page.title}`)
    ),
    i === 0
      ? h('h1', { className: 'lp2-sheet__h1' }, page.title)
      : h('h2', { className: 'lp2-sheet__h2' }, page.title),
    h(LessonBlockList, { blocks: page.blocks })
  )
);

const guideHtml = renderToStaticMarkup(h(React.Fragment, null, sheets));

const navItems = lesson.pages
  .map(
    (p, i) => `
    <li><button type="button" class="lp2-pagenav__item${i === 0 ? ' lp2-pagenav__item--active' : ''}" onclick="document.getElementById('lesson-page-${p.id}').scrollIntoView({behavior:'smooth'})">
      <span class="lp2-pagenav__num">${i + 1}</span><span class="lp2-pagenav__title">${p.navTitle || p.title}</span>
    </button></li>`
  )
  .join('');

const tokensCss = fs.readFileSync(path.join(SRC, 'styles/tokens.css'), 'utf8');
const lessonCss = fs.readFileSync(path.join(SRC, 'styles/LessonPage.css'), 'utf8');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Preview — Lesson v2: ${lesson.title}</title>
<style>${tokensCss}</style>
<style>
  body { margin: 0; background: var(--ut-bg); font-family: var(--ut-font-body); color: var(--ut-text); }
  .ut-btn { display:inline-flex; align-items:center; justify-content:center; gap:8px; border:1px solid transparent; border-radius:var(--ut-radius-sm); font-family:var(--ut-font-body); font-size:13.5px; font-weight:700; line-height:1; padding:10px 16px; cursor:pointer; text-decoration:none; white-space:nowrap; }
  .ut-btn--primary { background: var(--ut-accent); color: var(--ut-on-accent); }
  .ut-btn--primary:hover { background: var(--ut-accent-dark); }
  .preview-note { max-width:1480px; margin:0 auto; padding:10px 28px 0; font-size:12px; color:var(--ut-mono-muted); font-family:var(--ut-font-mono); }
</style>
<style>${lessonCss}</style>
<style>
  .lp2-reveal:not(.lp2-reveal--open) .lp2-reveal__body { display: none; }
</style>
<!-- KaTeX (same CDN + options the app's katexLoader/LessonPage use) -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css" crossorigin="anonymous">
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js" crossorigin="anonymous"></script>
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js" crossorigin="anonymous"></script>
<script>
  window.addEventListener('DOMContentLoaded', function () {
    if (typeof renderMathInElement !== 'function') return;
    renderMathInElement(document.body, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '\\\\[', right: '\\\\]', display: true },
        { left: '\\\\(', right: '\\\\)', display: false },
        { left: '$', right: '$', display: false },
      ],
      // No color macros here: \\blue{...} etc. are pre-expanded to
      // \\textcolor by the renderer ("#" inside a KaTeX macro body is a
      // parameter marker and would break the expression).
      throwOnError: false,
    });
  });
</script>
</head>
<body>
<div class="preview-note">DESIGN PREVIEW — static render of /learn/${id} (Lesson v2)</div>
<div class="lp2">
  <header class="lp2-topbar">
    <nav class="lp2-crumbs" aria-label="Breadcrumb">
      <a class="lp2-crumbs__link" href="#"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg> Lectures</a>
      <svg class="lp2-crumbs__sep" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
      <span class="lp2-crumbs__domain">${domainName}</span>
      <svg class="lp2-crumbs__sep" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
      <span class="lp2-crumbs__current">${lesson.title}</span>
    </nav>
    <div class="lp2-topbar__meta"><span class="lp2-chip"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> ~${lesson.estimatedMinutes} min</span></div>
  </header>
  <div class="lp2-body">
    <aside class="lp2-left">
      <div class="lp2-video lp2-video--placeholder">
        <div class="lp2-video__overlay">
          <span class="lp2-video__playring"><svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1" stroke-linejoin="round"><polygon points="6 4 20 12 6 20 6 4"></polygon></svg></span>
          <span class="lp2-video__coming"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg> Video lesson coming soon</span>
        </div>
      </div>
      <div class="lp2-left-card">
        <div class="lp2-left-card__eyebrow">${sectionLabel} · ${domainName}</div>
        <h2 class="lp2-left-card__title">${lesson.title}</h2>
        <div class="lp2-left-card__difficulty">${lesson.difficulty || ''}</div>
        <nav class="lp2-pagenav"><div class="lp2-pagenav__label">In this lesson</div><ol>${navItems}</ol></nav>
        <button type="button" class="ut-btn ut-btn--primary lp2-practice-cta"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="10 8 16 12 10 16 10 8"></polygon></svg> Practice this skill</button>
      </div>
    </aside>
    <main class="lp2-guide">
      ${guideHtml}
      <section class="lp2-mastery" aria-label="Lesson completion">
        <div class="lp2-mastery__copy">
          <h3>Have you mastered this lesson?</h3>
          <p>Mark this lesson as complete to update your course progress and study plan.</p>
        </div>
        <div class="lp2-mastery__actions">
          <button type="button" class="ut-btn ut-btn--primary lp2-mastery__mark"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> Mark as Complete</button>
        </div>
      </section>
    </main>
  </div>
</div>
<script>
  document.querySelectorAll('.lp2-reveal').forEach(function (r) {
    r.classList.remove('lp2-reveal--open');
    var btn = r.querySelector('.lp2-reveal__toggle');
    if (btn) btn.addEventListener('click', function () { r.classList.toggle('lp2-reveal--open'); });
  });
</script>
</body>
</html>`;

const outDir = path.join(ROOT, 'docs/previews');
fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, `lesson-v2-${id}.html`);
fs.writeFileSync(outFile, html);
console.log('Preview written →', path.relative(ROOT, outFile));

// Authoring lint: unparsed markup tokens surviving into the rendered guide
// usually mean invalid nesting (e.g. bold inside single-asterisk italics).
const visibleText = guideHtml.replace(/<[^>]+>/g, ' ');
const leftovers = ['**', '==', '{blank}', '__', '{blue|', '{teal|', '{rose|', '{green|', '{purple|', '{amber|']
  .filter((tok) => visibleText.includes(tok));
if (leftovers.length > 0) {
  console.warn('⚠ LEFTOVER MARKUP in rendered text:', leftovers.join(' '));
  for (const tok of leftovers) {
    const i = visibleText.indexOf(tok);
    console.warn('   …' + visibleText.slice(Math.max(0, i - 60), i + 60).replace(/\s+/g, ' ') + '…');
  }
  process.exitCode = 2;
} else {
  console.log('Markup lint: clean');
}
