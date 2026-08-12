# QC — Exam 4, Reading & Writing (Modules 1–2)

**Artifact:** `scripts/data/practiceTest4RW.json` (54 items, 27 per module)
**Validator:** `scripts/validatePracticeTest4RW.js` — **0 errors, 0 warnings**
**Review render:** `PracticeTest4_ReadingWriting_review.html`
**Style spec:** `docs/CB_RW_Style_Spec.md` (reusable for Exams 5–10)
**Originality blocklist:** `docs/rw_used_named_entities.txt` (1,992 proper nouns from the official PDFs and Exams 1–3)

---

## 1. How the style target was derived

Rather than imitating the official forms by feel, the 10 supplied PDFs were parsed into a
labeled corpus: **1,050 official Question-Bank items** carrying College Board's own domain,
skill, and difficulty labels plus full rationales, alongside four published practice forms.
Every design parameter below is a measured statistic from that corpus, not a guess.

Measurements that drove authoring:

| Parameter | Measured from the official corpus |
|---|---|
| Stimulus length | Per skill × difficulty (median, p10, p90). E.g. Boundaries easy median 38 w, hard 49 w; Cross-Text 139 w at every difficulty |
| Sentence count | Boundaries 1.6, Transitions 1.8, Words in Context 2.3, Cross-Text 5.9 |
| Stem strings | Verbatim inventory with frequencies (e.g. Text Structure: 40% underlined-function, 32% main purpose, 23% overall structure) |
| Conventions coverage | The 33 distinct "convention being tested" labels and their difficulty profiles |
| Transition keys | 105 distinct choice strings; keyed distribution led by *as a result*, *however*, *by contrast*, *specifically* |
| Words-in-Context options | 82% single word, 18% short phrase |
| Command of Evidence mix | 41% quantitative, 27% support/weaken, 20% literary quotation |
| Quantitative completion form | 41 of 61 quantitative items end in a terminal `______`; 16 of 29 quotation items do |
| Rhetorical Synthesis | 100% use the fixed notes preamble; exactly 5 bullets |

---

## 2. Form design

Blueprint mirrors the shipped Exam 3 design and the official operational domain ranges:

| Domain | Count | Official operational range |
|---|---|---|
| Information and Ideas | 14 | 12–14 |
| Craft and Structure | 14 | 13–15 |
| Expression of Ideas | 11 | 8–12 |
| Standard English Conventions | 15 | 11–15 |

Difficulty: Module 1 = 4 easy / 17 medium / 6 hard; Module 2 = 5 / 15 / 7.
Ordering follows the official grouping (Craft & Structure → Information & Ideas → Conventions
→ Expression of Ideas), non-decreasing difficulty within each non-Conventions skill, and
easier→harder across the Conventions domain.

Coverage guarantees, all validator-enforced:

- 8 Boundaries items testing **8 distinct punctuation conventions**, no repeats.
- 7 Form/Structure/Sense items testing **7 distinct grammar rules**, no repeats.
- 6 Transitions items with **6 distinct keyed transitions spanning 6 relationship categories**
  (example, contrast, cause–result, addition, similarity, emphasis).
- 5 Rhetorical Synthesis items with **5 distinct goals**.
- 4 quantitative Command-of-Evidence items: 2 tables, 1 bar graph, 1 line graph.
- Answer positions balanced 6/7/7/7 per module.

---

## 3. Quality control performed

**Four independent adversarial reviews** of the first draft: a blind test-taker, a
key-and-logic critic, a College Board voice critic, and a scripted originality/duplication
auditor. They produced 3 blockers, 11 risks, 22 style findings, and 9 duplication findings.
Every one was dispatched to a repair pass; a second blind take and a final blind take
confirmed the repairs.

**Calibration control.** To test whether "this form is too easy" complaints were real, a
27-item control module was assembled from **genuine College Board items** matching this form's
blueprint exactly, and given blind to the same class of expert reader under identical
instructions.

| | Score | HIGH conf. | MEDIUM | LOW | easy / medium / hard |
|---|---|---|---|---|---|
| Real College Board control (27 items) | 27/27 | 27 | 0 | 0 | 59% / 33% / 7% |
| Exam 4 draft 1 (54 items) | 52/54 | 50 | 3 | 1 | 63% / 30% / 7% |
| **Exam 4 final (54 items)** | **54/54** | **51** | **3** | **0** | **46% / 46% / 7%** |

The final form is unambiguous (no LOW-confidence item, no miss) while carrying slightly more
genuine friction than the real College Board control — three items where a strong reader has
to weigh a live competitor, versus zero on the control. The draft's two misses (M2 Q13,
M2 Q25) were real construction faults and were rebuilt.

**Originality.**

- 0 hits against the 1,992-entry blocklist of proper nouns from the official PDFs and Exams 1–3.
- 8-gram overlap with the entire official corpus (passages + options): **0 non-formula matches**.
  The only shared spans are the mandated stems and the notes preamble.
- Explanation overlap with official rationales: longest shared run is 12 tokens, and every one
  is a sanctioned rubric label ("The convention being tested is …", "results in a dangling
  modifier"). An earlier draft carried a 50-token verbatim span; it was rewritten.
- Four hard topic collisions with Exam 3 (urban mowing → bees, pottery residue analysis,
  fire-triggered dormancy, artificial light vs. nocturnal fliers) were re-topiced.
- Twelve internal collisions were resolved, including six shared name stems and a "record book"
  motif that appeared in five items.

**Length fidelity vs. the official medians (final):**

| Skill | Ours | Official | Skill | Ours | Official |
|---|---|---|---|---|---|
| Boundaries | 46 | 46 | Inferences | 96 | 95 |
| Form/Structure | 42 | 42 | Rhetorical Synthesis | 83 | 80 |
| Central Ideas | 90 | 89 | Text Structure | 92 | 91 |
| Cross-Text | 144 | 139 | Transitions | 56 | 54 |
| Command of Evidence | 88 | 98 | Words in Context | 61 | 52 |

---

## 4. Deliberate deviations from official practice

1. **Original literary passages are labeled as original.** Items M1 Q6/Q13, M2 Q2/Q6/Q13 carry
   headnotes such as "The following text is from an original short story." College Board
   instead attributes real public-domain literature. This continues the Exam 3 house
   convention: we neither reproduce copyrighted text nor attribute invented text to real
   authors. A reviewer noted this is the single most conspicuous tell on the form. The
   alternative — using genuine public-domain excerpts — is available and would remove it.
2. **All proper nouns are invented.** Real forms use real rivers, cultivars, and researchers.
   Invention is required here to guarantee zero overlap with the official item pool.
3. **54 items rather than 33 per module.** This follows the existing ULTRASAT form design; the
   published forms carry 33 items per module including pretest items that are not scored.

---

## 5. Known residual notes

- Words-in-Context stimuli run about 9 words above the official median (61 vs 52), inside the
  official p90 of 90 but on the long side.
- M1 Q15's `and` distractor is nonstandard rather than structurally broken; it remains the
  softest distractor on the Conventions set.
- Researcher names are more evenly distributed across ethnolinguistic traditions than a real
  sample would be. Partially corrected (common names introduced, one tradition repeated); a
  further pass could push it closer to a natural sample.
