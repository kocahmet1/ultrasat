# Authoring brief — output schema and shared rules

Read `COE_STYLE_SPEC.md` in full first. It is measured from 226 official items and is binding.
This file only specifies the output format and the rules that cut across all batches.

## Output

One JSON file per batch, an **array** of item objects, in `src/`. UTF-8, curly quotes in prose
(`’ “ ”`), straight quotes only inside JSON syntax.

```jsonc
{
  "id": "COE-001",                    // exactly as assigned; do not renumber
  "family": "quant",                  // quant | finding | quote
  "subtype": "table",                 // table | graph | finding | literary | sourced
  "difficulty": "easy",               // easy | medium | hard
  "lane": "natural-science",
  "polarity": "support",              // support | weaken
  "stemType": "complete",             // quant only: complete | describe | use-support
  "figure": { ... },                  // quant only — see below
  "passage": "<p>…</p>",              // HTML, one or more <p>; <u>…</u> for underlined claims
  "stem": "Which choice most effectively uses data from the table to complete the statement?",
  "options": ["…", "…", "…", "…"],    // NO "A." prefixes — the app adds them
  "key": 2,                           // 0-indexed; MUST match the assigned key letter
  "why": "Choice C is the best answer because …",   // key rationale
  "rebuttals": { "A": "…", "B": "…", "D": "…" },     // the three non-key letters
  "remember": "One line the student should take away."
}
```

### `figure` for tables

```jsonc
"figure": {
  "kind": "table",
  "title": "Average Daily Foraging Distance of Three Bat Species, Wet and Dry Seasons (kilometers)",
  "columns": ["Species", "Wet season", "Dry season"],
  "rows": [["Long-eared", "4.1", "9.6"], ["Fruit", "2.8", "3.0"], ["Nectar", "6.5", "6.2"]]
}
```

Max **5 data rows and 5 columns**. Units in the title or the header, never repeated in cells
(except `%` and `$`). Non-numeric cells (`yes`, `no`, `N/A`, `not detected`) are allowed.

### `figure` for graphs

```jsonc
"figure": {
  "kind": "grouped-bar",              // bar | grouped-bar | line
  "title": "Germination Rate of Three Seed Coatings after 14 Days",
  "xLabel": "Seed coating",           // may be "" if categories are self-explanatory
  "yLabel": "Seeds germinated (%)",
  "categories": ["clay", "cellulose", "none"],
  "series": [
    { "name": "watered daily", "values": [72, 64, 41] },
    { "name": "watered weekly", "values": [55, 60, 12] }
  ]
}
```

`bar` = one series. `grouped-bar` = 2–4 series. `line` = 3–11 x-points, 2–4 series.
**No scatter plots, no error bars, no trend lines.** Y-axis title carries the unit in
parentheses. Legend names are lowercase and prose-like. Values must be readable off a chart —
i.e. distinguishable at the resolution a bar chart affords.

## Rules that cut across every batch

1. **The assigned key letter is fixed.** `key` is the 0-index of that letter (A=0, B=1, C=2, D=3).
   Write the item, then place the correct answer at that position and order the distractors
   around it. Never reorder to make the key "feel" right.
2. **Everything is invented.** All researchers, studies, findings, datasets, institutions,
   literary authors and literary works. No real living people. No real named studies. No real
   author attributed with an invented work.
3. **Nothing from the official export.** `avoid_terms.txt` lists 1,350 proper nouns extracted
   from the 226 official items. Grep your topics against it before you commit. Also avoid the
   *subject matter* of official items even under different names — no octopus transposons, no
   Neanderthal clamshell tools, no Large Magellanic Cloud velocity, no ochre sea stars, no
   hip-hop pedagogy, no bicycle-share depletion, no Gemini mission menus, no municipal
   incentives-before-election study.
4. **Topic territory.** Your batch assignment names topic areas reserved for you. Stay inside
   them so batches don't collide. Every item in your batch must be on a distinct topic.
5. **One defensible answer.** Before you emit an item, argue the case for each distractor as if
   you were a bright student. If you can build a real case for one, fix the item.
6. **Distractor mechanics.** Every rebuttal names a *mechanism* from the spec's distractor
   families — "cites only one arm of the comparison", "measures perception rather than
   accuracy", "reads the 2019 row rather than the 2014 row", "true of the topic but silent on
   the mechanism". Never "is less precise" or "is not the best choice".
7. **Rationale register.** 75% long register, 25% terse. Terse concentrated in easy quantitative.
   Key rationale restates the claim verbatim from the passage before evaluating anything.
   Irrelevance rebuttals open with a concession of accuracy ("Although this choice accurately
   describes data in the table, …"). Misread rebuttals relocate the wrong value ("…which is the
   figure for 2019, not 2014").
8. **`remember`** is one sentence of transferable strategy, in the voice of a good tutor. Not a
   restatement of the answer.
9. **Prose discipline.** No second person, no rhetorical questions, no humour, no hedging about
   the topic's importance. Present tense for standing claims, simple past for studies. Diverse,
   plausible invented names — draw globally, and vary the naming style per the spec (full name /
   "Name and colleagues" / "Name and her team" / bare disciplinary title in apposition).
10. **Self-check before emitting.** Word counts inside the spec's bands for your family and
    difficulty. Option lengths inside the bands. Four options same part of speech and same
    syntactic shape. Valid JSON.
