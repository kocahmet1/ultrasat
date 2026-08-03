# Lesson Blocks — Authoring Guide

Structured, UWorld-grade lesson sections without bespoke code. A lesson's Firestore content doc may carry an optional `blocks: []` array; when present, `SubcategoryLearnPage` renders it via `components/lesson/LessonBlockRenderer.jsx`. Lessons without `blocks` render exactly as before.

## Block shapes

**rule** — accent callout stating the rule first (UWorld pattern: rule before examples).
```json
{ "type": "rule", "title": "The colon rule", "text": "Use a colon only after a complete sentence: what follows explains or elaborates it." }
```

**annotated-example** — a specimen sentence/equation with highlighted spans, numbered marker dots, and a caption legend. `segments` is an ordered list of plain strings (unmarked text) and objects `{ "text", "marker"?, "tone"? }` (`tone`: `accent` (default) | `warn` | `plain`). `markers` maps each dot to its caption: `{ "n", "label" }`. Optional `intro` and `note` (e.g. distractor-awareness: "The point (5,7) is extra information").
```json
{ "type": "annotated-example", "title": "Anatomy of a legal colon",
  "segments": [ { "text": "The survey produced a result", "marker": 1 }, { "text": ":", "marker": 2, "tone": "plain" }, " ", { "text": "coral cover increased", "marker": 3 }, "." ],
  "markers": [ { "n": 1, "label": "Independent clause — subject + verb." }, { "n": 2, "label": "Colon: legal only after a complete sentence." }, { "n": 3, "label": "The elaboration the colon promises." } ] }
```

**check-cross** — wrong version (red ✗) directly above corrected version (green ✓), each with its why.
```json
{ "type": "check-cross", "title": "Comma splice vs colon",
  "wrong":   { "text": "The picture amazed Sylvia, she had no idea her aunt painted.", "why": "Two independent clauses joined by only a comma — a comma splice." },
  "correct": { "text": "The picture amazed Sylvia: she had no idea her aunt painted.", "why": "The colon joins them legally; the second clause explains the first." } }
```

**steps** — numbered worked solve; last step is visually emphasized as the answer. Each step: `{ "label", "content", "note"? }`. Math goes in `$...$` (KaTeX via `MathText`).
```json
{ "type": "steps", "title": "Solve it", "intro": "Find the slope of line $p$.",
  "steps": [ { "label": "Compare to slope-intercept form", "content": "$y = mx + b$, so $m$ is the slope." },
             { "label": "Read m from the equation", "content": "$y = -\\tfrac{3}{5}x + \\tfrac{1}{5}$ gives $m = -\\tfrac{3}{5}$.", "note": "Parallel lines share slopes — the point (5,7) is never needed." } ] }
```

**remember** — end-of-lesson summary box.
```json
{ "type": "remember", "items": [ "A colon must follow an independent clause.", "What follows the colon explains what preceded it." ] }
```

**html** — sanitized passthrough for interleaving legacy content: `{ "type": "html", "html": "<p>…</p>" }`.

Unknown types render nothing (console warning) — safe to version forward.

## Previewing

Dev builds only: open `/learn/<subcategoryId>?previewBlocks=<sampleId>` to render `components/lesson/samples/<sampleId>.sample.json` in place of stored content. Working demo: `/learn/boundaries?previewBlocks=boundaries`.

## Generating drafts for the 23 prose lessons

`node scripts/generate-lesson-blocks.js` (needs `.env` Gemini key + service-account json at repo root).
Dry-run by default → drafts land in `scripts/output/lesson-blocks/<subcategoryId>.json` for human review. Flags: `--only=<subcategoryId>` one lesson; `--apply` merge reviewed blocks onto the lesson docs. Review every draft before `--apply` — the model drafts, a human ships.

## Quality checklist (distilled from UWorld)

State the rule before any example. Annotate the actual sentence/equation, not a paraphrase. Every wrong version gets a why, right next to a corrected version. Worked solves end with the answer emphasized, with distractor-awareness notes where relevant. Always close with Things to Remember. Math in `$...$`; no emoji; keep captions one sentence.
