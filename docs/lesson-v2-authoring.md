# Lesson v2 authoring guide

Lesson v2 is the redesigned, UWorld-style study guide served by
`apps/web/src/pages/LessonPage.jsx` at `/learn/:subcategoryId`. Content is a
single JSON file per subcategory in `apps/web/src/content/lessons/`,
registered in `content/lessons/index.js`. Legacy pages remain reachable at
`/admin/legacy-learn/:subcategoryId` (admin only).

## Document shape

```json
{
  "schemaVersion": 2,
  "subcategoryId": "central-ideas-details",   // canonical kebab id (taxonomy)
  "title": "Central Ideas and Details",
  "estimatedMinutes": 25,
  "difficulty": "Foundational",               // free label shown in meta
  "video": { "url": null, "poster": null, "durationLabel": null },
  "pages": [
    { "id": "kebab-anchor", "title": "Sheet title", "blocks": [ ... ] }
  ]
}
```

Each entry in `pages` renders as one white "sheet" (a page of the study
guide) and one row in the left-panel page navigator. Aim for 4–6 pages.
`video.url` may be an .mp4 (rendered with `<video>`) or a YouTube/Vimeo URL
(rendered as an embed). `null` shows the "video coming soon" placeholder.

## Inline markup

Any `text`, list item, or table cell accepts:

| Markup | Renders as |
|---|---|
| `**bold**` | bold |
| `*italic*` | italic |
| `__underline__` | underline |
| `==text==` | yellow exam-style highlight |
| `{blue|text}` | bold steel-blue key term |
| `{teal|text}` | bold teal key term |
| `{rose|text}` | bold red/rose term (wrong/trap) |
| `{green|text}` | bold green term (correct) |
| `{purple|text}` | bold purple term |
| `{amber|text}` | bold amber term |
| `{blank}` | a fill-in blank line (use for “most logically completes” passages — never type literal underscores) |

Marks nest: `==**bold inside highlight**==`, `{blue|**bold blue**}`.
Colors are meaningful, not decorative — keep one color per concept within a
lesson (e.g. blue = the skill's key object, teal = its counterpart, rose =
traps/wrong, green = correct).

## Block types

| type | props | Use for |
|---|---|---|
| `p` | `text` | body paragraph |
| `h3` | `text` | steel-blue section heading with rule |
| `h4` | `text` | small bold run-in heading (e.g. "Text 1") |
| `list` | `style: "bullet"\|"number"`, `items[]` | strategy/summary lists |
| `table` | `headers[]`, `rows[][]`, optional `align[]` (`"left"\|"center"`), optional `compact` | question-language tables, trap taxonomies |
| `rule` | `label?` (default "Rule"), `text` | the blue italic Rule statement |
| `callout` | `variant: "tip"\|"note"\|"warning"`, `text` | lightbulb/pointer asides |
| `example` | `title?` (default "Example"), `blocks[]` | bordered worked-example box; nest any blocks |
| `passage` | `label?` (e.g. "Text 1"), `text` | indented serif passage block |
| `question` | `stem?`, `choices[]` | lettered A–D choices |
| `poe` | `intro?` (default "Process of Elimination:"), `items[]` of `{choice, verdict: "correct"\|"incorrect", text}` | choice-by-choice ✓/✗ walkthrough |
| `check-cross` | `items[]` of `{verdict, text, note?}` | ✗/✓ sentence pairs |
| `reveal` | `label?` (default "Answer"), `blocks[]` | expandable answer (UWorld practice style) |
| `practice` | `title?` (default "Practice"), `items[]` of `{blocks[], answer[]}` | dark-banded practice section; items auto-numbered; `answer` renders inside a `reveal` |
| `remember` | `title?` (default "Things to Remember"), `items[]` | end-of-lesson summary box |
| `legend` | `items[]` of `{tone: "yellow"\|"blue"\|"teal"\|"rose"\|"green"\|"purple"\|"amber", label}` | key for annotation colors used in a passage |
| `strip` | `segments[]` of `{text, tone?}` — tone `"op"` renders as plain operator | equation-style concept strip (Topic + Point = Main idea) |
| `figure` | `src`, `alt`, `caption?`, `width?` | images/diagrams from `/assets/images/` |

### Math blocks (math lessons)

| type | props | Use for |
|---|---|---|
| `steps` | `title?`, `items[]` of `{math (TeX, display), note? (inline markup + $TeX$)}` | worked solutions: centered equation lines with gray side annotations ("Subtract $7$ from both sides") |
| `math` | `tex`, `boxed?`, `caption?` | standalone display equation; `boxed: true` frames key formulas |
| `graph` | `width?, height?, xMin, xMax, yMin, yMax, step?, stepX?, stepY?, ticks?, grid?, xLabel?, yLabel?, lines[] ({m, b, tone?, label?, labelAt?, dashed?}), segments[] ({x1, y1, x2, y2, tone?, dashed?, label?}), points[] ({x, y, tone?, label?, guides?}), caption?, alt` | coordinate-plane figures (pure SVG, no images); `segments` for rise/run legs, `stepX`/`stepY` for real-world scales |
| `columns` | `items[]` of `{title?, blocks[]}` | side-by-side comparisons (shortcut vs. long way, case-by-case graphs); stacks on mobile |
| `numberline` | `min, max, step?, points[] ({x, kind: "open"\|"closed", tone?}), rays[] ({from, direction: "left"\|"right", tone?}), caption?, alt` | one-variable solution sets (inequalities) |
| `dotplot` | `min, max, step?, counts[] ({x, n}), tone?, xTitle?, caption?, alt` | one-variable data as stacked dots |
| `histogram` | `bins[] ({label, n}), yStep?, tone?, yTitle?, xTitle?, caption?, alt` | frequencies over intervals (touching bars) |
| `boxplot` | `min, max, step?, low, q1, median, q3, high, tone?, caption?, alt` | five-number summary on a number line |
| `geometry` | `width, height, elements[] (kinds: polygon, circle, ellipse, segment, arc (x1,y1→x2,y2, r, ry?, sweep, large), label, rightangle, tick, point — each with tone?/fill?/dashed?), caption?, alt` | labeled geometric figures in raw SVG coordinates (y down); 3D solids via polygons + ellipses + dashed hidden edges |

Curves on a `graph`: `curves[]` of `{type: "quadratic" (a, b, c) | "vertex"
(a, h, k) | "exponential" (a, base), tone?, dashed?, label?, labelAt?}` —
sampled smooth paths for parabolas and exponential growth/decay.

Inequality regions: give a `graph` line `"fill": "above"` or `"fill": "below"`
(translucent half-plane shading, clipped to the plot; combine two filled lines
for a system's overlap region). Use `"dashed": true` for strict boundaries.

## Math notation

- Inline math: `$...$` in any text field (`$5x + 7 = 42$`). Display math is
  emitted automatically by `steps`/`math` blocks. KaTeX is lazy-loaded from
  CDN only when a lesson contains `$`, and re-typesets expandable answers
  when they open.
- **Currency: never leave a bare `$` in prose** — two of them become a math
  region. Write amounts as math: `$\\$40$` renders as $40.
- Color inside equations with macros matching the tone palette:
  `\\blue{...} \\teal{...} \\rose{...} \\green{...} \\purple{...} \\amber{...} \\gray{...}`
  (e.g. `"tex": "\\green{380} = \\blue{55} + \\teal{65}\\purple{h}"`).
- In JSON, every TeX backslash is escaped: `\\frac{x}{5}`, `\\$`.
- Don't mix inline markup (`**`, `{blue|...}`) *inside* a `$...$` region.

## Content style (match this on every lesson)

- Voice: second person, direct, plain — "The question will ask you to…".
  Explain like UWorld: definition → strategy → table → annotated example →
  worked example with POE → practice → Things to Remember.
- Passages are **original** and factually accurate, 25–110 words, Bluebook
  register. Question stems use verbatim DSAT phrasing ("Which choice best
  states the main idea of the text?", "According to the text, …").
- Every wrong choice in a POE gets a named reason (too broad, too narrow,
  distortion, not in the text…).
- A lesson ends with `practice` (2–3 items, expandable answers) then
  `remember`.

## Previewing while authoring

```
node scripts/render-lesson-preview.js <subcategory-id>
```

renders the real components + real JSON to `docs/previews/lesson-v2-<id>.html`
(no dev server needed) — open it in a browser to check design and content.
