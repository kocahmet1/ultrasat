# Authored-source item schema

Each `fss-NN-*.json` file is a JSON array of item objects. `build.js` reads them, rotates
options to balance the answer key, composes the final rationale, validates, and emits
`form-structure-sense-100.json`.

```jsonc
{
  "id": "fss-sv-01",              // unique, kebab, prefix per file
  "convention": "subject-verb",   // subject-verb | verb-form | tense | modifier | noun-possessive | pronoun
  "difficulty": "easy",           // easy | medium | hard
  "topic": "oceanography",        // for collision checking only
  "passage": "The vest frottoir ______ a wearable washboard that is played by rubbing spoons against it.",
  "options": ["is", "have been", "were", "are"],
  "key": 0,                       // index into options, 0-3
  "conventionLabel": "subject-verb agreement",   // exact CB wording, see spec §5
  "why": "The singular verb \"is\" agrees in number with the singular subject \"the vest frottoir.\"",
  "wrong": {
    "have been": "The plural verb \"have been\" doesn't agree in number with the singular subject \"the vest frottoir.\"",
    "were":      "The plural verb \"were\" doesn't agree in number with the singular subject \"the vest frottoir.\"",
    "are":       "The plural verb \"are\" doesn't agree in number with the singular subject \"the vest frottoir.\""
  },
  "remember": [
    "Find the head noun of the subject, not the noun nearest the verb.",
    "A prepositional phrase between the subject and the verb never changes the subject's number."
  ]
}
```

## Rules the build enforces

- `wrong` must have exactly 3 keys, and they must be the exact strings of the three
  non-key options. **Rebuttals are keyed by option text, never by letter** — the build
  rotates options to balance the key spread, so letters are not stable.
- `why` and every `wrong` value must quote at least one span from the passage using
  escaped double quotes, and must state a *structural* reason. Never "awkward" / "wordy" /
  "unclear" / "less concise".
- `passage` contains exactly one `______` (six underscores). Do **not** include the stem
  prompt — the build appends it.
- `remember`: 2–3 short imperative rules a student could carry to the next item.
- Word-count envelopes (passage only): easy 26–56, medium 28–58, hard 26–66.
  Sentence count ≤ 4.
- Options: either all four ≤ 3 words, or all four ≥ 6 words. Never mixed.
- Use curly apostrophes (’) and curly quotes (“ ”) inside passages, as College Board does.
