# 01 — Digital SAT Reading & Writing: Form Architecture

**Scope:** form architecture only (item order, domain blocking, difficulty laddering, key balance, stem boilerplate).
**Corpus:** 8 official College Board Reading & Writing modules = **264 items**.

| Form | File (extracted text) | Items |
|---|---|---|
| PT2 RW Module 1 | `SAT-Practice-Test-2-with-Answer-Key-and-Scoring-Info-4-31` (Q1–33) | 33 |
| PT2 RW Module 2 | same file (Q34–66, renumbered 1–33) | 33 |
| PT3 RW Module 1 | `SAT-Practice-Test-3-with-Answer-Key-and-Scoring-Info-4-30` (Q1–33) | 33 |
| PT3 RW Module 2 | same file (Q34–66, renumbered 1–33) | 33 |
| PT4 RW Module 1 | `sat-practice-test-4-digital (2)-4-17` | 33 |
| PT4 RW Module 2 | `sat-practice-test-4-digital (2)-18-30` | 33 |
| PT5 RW Module 1 | `sat-practice-test-5-digital (1)-4-16` | 33 |
| PT5 RW Module 2 | `sat-practice-test-5-digital (1)-18-31` | 33 |

## 0. Method and its validation (read this before trusting the numbers)

**Extraction.** `pdftotext -layout` on the whole page interleaves the two text columns, so page numbering
and stem/passage attribution are unreliable. Every PDF was re-extracted **twice per page** with
`pdftotext -layout -x 0 -W 306` (left column) and `-x 306 -W 306` (right column), then merged
left-column-then-right-column per page. Items flow strictly down the left column, then down the right
column, so the *k*-th `A)` choice block on the merged stream is question *k*. All six PDFs yielded
**exactly 33 (or 66) `A)` blocks**, which is the primary integrity check.

**Answer keys.** Not present in the supplied page ranges. Retrieved from College Board's own answer
explanations: `satsuite.collegeboard.org/media/pdf/sat-practice-test-{4,5}-answers-digital.pdf` for PT4/PT5,
and the complete `SAT-Practice-Test-{2,3}-with-Answer-Key-and-Scoring-Info.pdf` (same document the supplied
excerpts were cut from) for PT2/PT3. Keys parsed from `QUESTION n … Choice X is the best answer`.

**Boundaries vs Form, Structure, and Sense.** These two skills share a *byte-identical* stem, so they
cannot be told apart from the stem. They were separated using College Board's own rationale sentence
**"The convention being tested is …"**, which is present for **66/66** conventions items in the four answer-
explanation documents. The mapping from that phrase to the skill label was not invented — it was mined
from the College Board Question Bank exports, where `Domain / Skill / Difficulty` and the rationale phrase
appear together. Every punctuation-flavoured phrase in the practice tests occurs in the bank under
**Boundaries**; everything else (verb form/tense, subject-verb and pronoun-antecedent agreement,
plural/possessive nouns, subject-modifier placement) is **Form, Structure, and Sense**.

**Independent validation.** 142 of the 264 practice-test items were matched by verbatim text to the
College Board Question Bank exports, which carry official `Skill` and `Difficulty` labels. My stem-based
classification agrees with College Board's own label on **141/142 = 99.3%**. The single disagreement
(PT4 M1 Q22) is a *matcher* artifact: a bleed of the next item's text caused the fuzzy match to land on
the adjacent Boundaries item; College Board's own rationale for Q22 says "subject-verb agreement", which
is what I coded. Effective agreement: **142/142**.

**One printing error found.** PT5 Module 1 Q23 is printed in the College Board PDF with the stem
*"Which choice completes the text with the most logical transition?"* but its four options are
`hand's between the two antenna's / hands between the two antennas / hands' between the two antennas' /
hands' between the two antennas`, and the official rationale reads *"The convention being tested is the
use of plural nouns in a sentence."* It is a **Form, Structure, and Sense** item with the wrong stem
printed. It is coded as form-structure-sense throughout, flagged in the item table. Coding it by its
printed stem would be the **only** ordering-law violation in 264 items; correcting it makes the law exact.

---

## 1. Item-by-item classification tables

Legend — Domain: `C&S` Craft and Structure, `I&I` Information and Ideas, `SEC` Standard English
Conventions, `EOI` Expression of Ideas. "CB difficulty" is College Board's own Easy/Medium/Hard label,
present only where the item was matched into the Question Bank export (142/264 = 53.8%); `—` = not
available, **not** "unknown difficulty by my judgement".

#### PT2 Reading & Writing Module 1 (33 items)

| Q | Domain | Skill | Sub-type / convention tested | Key | CB difficulty | Stimulus words |
|---|--------|-------|------------------------------|-----|---------------|----------------|
| 1 | C&S | words-in-context | blank completion | B | Easy | 88 |
| 2 | C&S | words-in-context | blank completion | C | Easy | 78 |
| 3 | C&S | words-in-context | blank completion | C | Easy | 66 |
| 4 | C&S | words-in-context | blank completion | B | Medium | 68 |
| 5 | C&S | words-in-context | blank completion | D | Hard | 56 |
| 6 | C&S | words-in-context | blank completion | C | Hard | 50 |
| 7 | C&S | words-in-context | blank completion | B | Hard | 63 |
| 8 | C&S | text-structure-purpose | main purpose | D | — | 54 |
| 9 | C&S | text-structure-purpose | function of underlined sentence | D | — | 171 |
| 10 | C&S | cross-text-connections |  | A | Hard | 175 |
| 11 | I&I | central-ideas-details | detail / According to the text | A | Easy | 165 |
| 12 | I&I | central-ideas-details | main idea | A | Medium | 105 |
| 13 | I&I | central-ideas-details | main idea | A | Medium | 135 |
| 14 | I&I | command-of-evidence | quant | D | Hard | 135 |
| 15 | I&I | command-of-evidence | finding | C | — | 203 |
| 16 | I&I | inferences |  | B | Medium | 147 |
| 17 | I&I | inferences |  | B | Medium | 132 |
| 18 | I&I | inferences |  | A | Hard | 175 |
| 19 | I&I | inferences |  | A | Hard | 159 |
| 20 | SEC | form-structure-sense | finite and nonfinite verb forms within a sentence | A | — | 121 |
| 21 | SEC | form-structure-sense | the use of verbs to express tense | B | — | 54 |
| 22 | SEC | boundaries | punctuation use between sentences | A | — | 60 |
| 23 | SEC | form-structure-sense | the use of verbs to express tense | C | — | 67 |
| 24 | SEC | form-structure-sense | the use of plural and possessive nouns | C | — | 64 |
| 25 | SEC | boundaries | punctuation between a main clause and a supplementary noun phrase | C | — | 72 |
| 26 | SEC | boundaries | the coordination of main clauses within a sentence | D | Medium | 67 |
| 27 | SEC | form-structure-sense | the use of plural and possessive nouns | C | — | 58 |
| 28 | SEC | boundaries | punctuation between a subject and a verb | C | Hard | 76 |
| 29 | EOI | rhetorical-synthesis |  | B | — | 88 |
| 30 | EOI | rhetorical-synthesis |  | C | — | 128 |
| 31 | EOI | rhetorical-synthesis |  | C | — | 137 |
| 32 | EOI | rhetorical-synthesis |  | D | Hard | 170 |
| 33 | EOI | rhetorical-synthesis |  | D | Hard | 179 |

#### PT2 Reading & Writing Module 2 (33 items)

| Q | Domain | Skill | Sub-type / convention tested | Key | CB difficulty | Stimulus words |
|---|--------|-------|------------------------------|-----|---------------|----------------|
| 1 | C&S | words-in-context | blank completion | C | Easy | 180 |
| 2 | C&S | words-in-context | blank completion | B | Easy | 92 |
| 3 | C&S | words-in-context | blank completion | D | Medium | 55 |
| 4 | C&S | words-in-context | blank completion | B | — | 68 |
| 5 | C&S | words-in-context | blank completion | C | Hard | 66 |
| 6 | C&S | text-structure-purpose | overall structure | C | — | 73 |
| 7 | C&S | text-structure-purpose | function of underlined portion | A | — | 132 |
| 8 | C&S | text-structure-purpose | function of underlined sentence | D | — | 187 |
| 9 | I&I | central-ideas-details | detail / According to the text | B | Easy | 168 |
| 10 | I&I | command-of-evidence | quant | A | — | 184 |
| 11 | I&I | command-of-evidence | quant | B | — | 164 |
| 12 | I&I | command-of-evidence | finding | A | Hard | 155 |
| 13 | I&I | command-of-evidence | finding | C | Hard | 178 |
| 14 | I&I | command-of-evidence | finding | D | — | 165 |
| 15 | I&I | command-of-evidence | finding | C | — | 186 |
| 16 | I&I | command-of-evidence | quant | B | — | 276 |
| 17 | I&I | command-of-evidence | finding | B | Hard | 192 |
| 18 | SEC | form-structure-sense | finite and nonfinite verb forms within a sentence | B | — | 227 |
| 19 | SEC | boundaries | punctuation between a subordinate clause and a main clause | C | Easy | 58 |
| 20 | SEC | form-structure-sense | the use of verbs to express tense | A | — | 71 |
| 21 | SEC | boundaries | punctuation use between two supplementary phrases | D | Medium | 64 |
| 22 | SEC | form-structure-sense | subject-modifier placement | A | — | 34 |
| 23 | SEC | boundaries | the punctuation of items in a complex series | C | — | 90 |
| 24 | SEC | boundaries | the punctuation of a supplementary element within a sentence | C | — | 76 |
| 25 | SEC | boundaries | the use of a colon within a sentence | A | Hard | 62 |
| 26 | SEC | boundaries | the punctuation of items in a complex series | B | — | 51 |
| 27 | EOI | transitions |  | A | Easy | 73 |
| 28 | EOI | transitions |  | B | Easy | 49 |
| 29 | EOI | transitions |  | D | Medium | 56 |
| 30 | EOI | transitions |  | D | Hard | 68 |
| 31 | EOI | rhetorical-synthesis |  | A | Easy | 62 |
| 32 | EOI | rhetorical-synthesis |  | C | Medium | 153 |
| 33 | EOI | rhetorical-synthesis |  | B | Hard | 156 |

#### PT3 Reading & Writing Module 1 (33 items)

| Q | Domain | Skill | Sub-type / convention tested | Key | CB difficulty | Stimulus words |
|---|--------|-------|------------------------------|-----|---------------|----------------|
| 1 | C&S | words-in-context | blank completion | A | Easy | 99 |
| 2 | C&S | words-in-context | blank completion | A | Easy | 116 |
| 3 | C&S | words-in-context | blank completion | A | — | 59 |
| 4 | C&S | words-in-context | blank completion | D | — | 60 |
| 5 | C&S | words-in-context | blank completion | B | — | 60 |
| 6 | C&S | words-in-context | blank completion | A | Hard | 65 |
| 7 | C&S | words-in-context | blank completion | C | — | 69 |
| 8 | C&S | words-in-context | blank completion | B | — | 67 |
| 9 | C&S | text-structure-purpose | main purpose | D | — | 118 |
| 10 | C&S | text-structure-purpose | overall structure | C | — | 127 |
| 11 | I&I | central-ideas-details | detail / According to the text | D | Easy | 171 |
| 12 | I&I | central-ideas-details | main idea | D | Medium | 110 |
| 13 | I&I | command-of-evidence | quotation | C | — | 123 |
| 14 | I&I | command-of-evidence | quant | C | Hard | 166 |
| 15 | I&I | command-of-evidence | finding | C | Hard | 153 |
| 16 | I&I | command-of-evidence | finding | D | — | 175 |
| 17 | I&I | inferences |  | A | Hard | 135 |
| 18 | I&I | inferences |  | B | Hard | 134 |
| 19 | I&I | inferences |  | C | — | 163 |
| 20 | SEC | form-structure-sense | the use of finite and nonfinite verb forms within a sentence | A | — | 67 |
| 21 | SEC | boundaries | the coordination of clauses within a sentence | A | Easy | 49 |
| 22 | SEC | boundaries | punctuation use between sentences | C | Easy | 57 |
| 23 | SEC | boundaries | punctuation between a verb and a preposition | D | Medium | 72 |
| 24 | SEC | form-structure-sense | subject-verb agreement | A | — | 43 |
| 25 | SEC | boundaries | punctuation use between a main clause and two supplementary elements | C | Hard | 67 |
| 26 | SEC | boundaries | punctuation use between a main clause and a supplementary phrase | B | — | 66 |
| 27 | EOI | transitions |  | A | Easy | 44 |
| 28 | EOI | rhetorical-synthesis |  | A | Medium | 94 |
| 29 | EOI | rhetorical-synthesis |  | C | Medium | 189 |
| 30 | EOI | rhetorical-synthesis |  | C | Medium | 182 |
| 31 | EOI | rhetorical-synthesis |  | B | — | 161 |
| 32 | EOI | rhetorical-synthesis |  | C | — | 177 |
| 33 | EOI | rhetorical-synthesis |  | A | Hard | 195 |

#### PT3 Reading & Writing Module 2 (33 items)

| Q | Domain | Skill | Sub-type / convention tested | Key | CB difficulty | Stimulus words |
|---|--------|-------|------------------------------|-----|---------------|----------------|
| 1 | C&S | words-in-context | blank completion | D | Easy | 182 |
| 2 | C&S | words-in-context | blank completion | B | — | 38 |
| 3 | C&S | words-in-context | blank completion | D | Medium | 89 |
| 4 | C&S | words-in-context | blank completion | B | Medium | 44 |
| 5 | C&S | text-structure-purpose | main purpose | A | — | 95 |
| 6 | C&S | text-structure-purpose | main purpose | A | — | 164 |
| 7 | C&S | text-structure-purpose | overall structure | A | — | 165 |
| 8 | C&S | cross-text-connections |  | C | Hard | 188 |
| 9 | I&I | central-ideas-details | detail / According to the text | A | Medium | 145 |
| 10 | I&I | central-ideas-details | detail / According to the text | D | Hard | 109 |
| 11 | I&I | command-of-evidence | finding | A | Hard | 133 |
| 12 | I&I | command-of-evidence | quotation | A | — | 144 |
| 13 | I&I | command-of-evidence | quant | C | — | 271 |
| 14 | I&I | command-of-evidence | quant | A | — | 307 |
| 15 | I&I | command-of-evidence | quant | C | Hard | 325 |
| 16 | I&I | inferences |  | C | — | 156 |
| 17 | I&I | inferences |  | C | Hard | 176 |
| 18 | SEC | form-structure-sense | the use of verbs to express tense in a sentence | B | — | 95 |
| 19 | SEC | form-structure-sense | the use of finite and nonfinite verb forms within a sentence | A | — | 61 |
| 20 | SEC | form-structure-sense | subject-verb agreement | C | — | 49 |
| 21 | SEC | boundaries | punctuation between a main clause and a subordinate clause | D | — | 53 |
| 22 | SEC | boundaries | punctuation between a supplementary phrase and a main clause | C | Medium | 52 |
| 23 | SEC | boundaries | the coordination of main clauses | D | Medium | 74 |
| 24 | SEC | form-structure-sense | subject-verb agreement | A | — | 49 |
| 25 | SEC | form-structure-sense | subject-modifier placement | A | — | 51 |
| 26 | SEC | boundaries | punctuation use between sentences | A | Hard | 82 |
| 27 | SEC | boundaries | the use of punctuation around noun phrases | D | Hard | 62 |
| 28 | EOI | transitions |  | A | Easy | 74 |
| 29 | EOI | transitions |  | D | Medium | 74 |
| 30 | EOI | transitions |  | D | — | 62 |
| 31 | EOI | transitions |  | A | Hard | 65 |
| 32 | EOI | rhetorical-synthesis |  | D | — | 87 |
| 33 | EOI | rhetorical-synthesis |  | A | — | 190 |

#### PT4 Reading & Writing Module 1 (33 items)

| Q | Domain | Skill | Sub-type / convention tested | Key | CB difficulty | Stimulus words |
|---|--------|-------|------------------------------|-----|---------------|----------------|
| 1 | C&S | words-in-context | blank completion | B | — | 88 |
| 2 | C&S | words-in-context | blank completion | A | Easy | 95 |
| 3 | C&S | words-in-context | blank completion | A | Medium | 55 |
| 4 | C&S | words-in-context | blank completion | C | — | 57 |
| 5 | C&S | text-structure-purpose | main purpose | A | — | 157 |
| 6 | C&S | text-structure-purpose | overall structure | B | — | 113 |
| 7 | C&S | text-structure-purpose | overall structure | D | — | 158 |
| 8 | C&S | text-structure-purpose | overall structure | B | — | 130 |
| 9 | C&S | cross-text-connections |  | B | Hard | 188 |
| 10 | I&I | central-ideas-details | main idea | D | Easy | 144 |
| 11 | I&I | central-ideas-details | detail / According to the text | C | — | 127 |
| 12 | I&I | central-ideas-details | main idea | D | Medium | 139 |
| 13 | I&I | command-of-evidence | quant | A | Easy | 124 |
| 14 | I&I | command-of-evidence | finding | B | — | 142 |
| 15 | I&I | command-of-evidence | quant | C | — | 246 |
| 16 | I&I | command-of-evidence | quotation | A | Hard | 118 |
| 17 | I&I | command-of-evidence | quant | A | — | 292 |
| 18 | I&I | inferences |  | A | Medium | 205 |
| 19 | SEC | form-structure-sense | the use of plural and possessive nouns | A | — | 73 |
| 20 | SEC | form-structure-sense | the use of verbs to express tense | D | — | 51 |
| 21 | SEC | boundaries | punctuation use between sentences | D | Medium | 73 |
| 22 | SEC | form-structure-sense | subject-verb agreement | D | Medium | 70 |
| 23 | SEC | boundaries | the coordination of main clauses within a sentence | B | — | 56 |
| 24 | SEC | form-structure-sense | subject-modifier placement | C | — | 53 |
| 25 | SEC | boundaries | the punctuation of items in a complex series | B | — | 71 |
| 26 | SEC | boundaries | the punctuation of a supplementary word or phrase between two main clauses | A | Hard | 77 |
| 27 | EOI | transitions |  | C | Easy | 83 |
| 28 | EOI | transitions |  | D | Easy | 54 |
| 29 | EOI | transitions |  | A | Easy | 68 |
| 30 | EOI | transitions |  | A | Medium | 88 |
| 31 | EOI | rhetorical-synthesis |  | D | — | 107 |
| 32 | EOI | rhetorical-synthesis |  | D | — | 134 |
| 33 | EOI | rhetorical-synthesis |  | C | Hard | 166 |

#### PT4 Reading & Writing Module 2 (33 items)

| Q | Domain | Skill | Sub-type / convention tested | Key | CB difficulty | Stimulus words |
|---|--------|-------|------------------------------|-----|---------------|----------------|
| 1 | C&S | words-in-context | blank completion | D | Easy | 78 |
| 2 | C&S | words-in-context | blank completion | D | — | 103 |
| 3 | C&S | words-in-context | blank completion | B | Easy | 46 |
| 4 | C&S | words-in-context | blank completion | B | — | 70 |
| 5 | C&S | words-in-context | blank completion | B | Medium | 47 |
| 6 | C&S | words-in-context | blank completion | B | Medium | 70 |
| 7 | C&S | words-in-context | blank completion | A | Medium | 51 |
| 8 | C&S | words-in-context | blank completion | C | — | 62 |
| 9 | C&S | text-structure-purpose | function of underlined sentence | C | — | 85 |
| 10 | I&I | central-ideas-details | detail / According to the text | A | Medium | 164 |
| 11 | I&I | command-of-evidence | finding | A | Hard | 136 |
| 12 | I&I | command-of-evidence | quotation | B | — | 170 |
| 13 | I&I | command-of-evidence | quant | D | Hard | 256 |
| 14 | I&I | command-of-evidence | finding | C | Hard | 199 |
| 15 | I&I | command-of-evidence | quotation | C | — | 124 |
| 16 | I&I | inferences |  | A | Hard | 145 |
| 17 | I&I | inferences |  | B | Hard | 154 |
| 18 | I&I | inferences |  | D | Hard | 141 |
| 19 | SEC | form-structure-sense | the use of plural and possessive nouns | C | — | 107 |
| 20 | SEC | boundaries | punctuation between a preposition and its complement | A | Easy | 68 |
| 21 | SEC | boundaries | the use and punctuation of an integrated relative clause | B | Easy | 64 |
| 22 | SEC | boundaries | the punctuation of a supplementary element within a sentence | D | Medium | 67 |
| 23 | SEC | boundaries | punctuation use between sentences | D | — | 57 |
| 24 | SEC | form-structure-sense | the use of finite and nonfinite verb forms within a sentence | A | — | 55 |
| 25 | SEC | form-structure-sense | subject-modifier placement | B | — | 42 |
| 26 | SEC | boundaries | punctuation use between a main clause and a supplementary phrase | B | — | 115 |
| 27 | EOI | transitions |  | A | — | 64 |
| 28 | EOI | transitions |  | A | Hard | 66 |
| 29 | EOI | rhetorical-synthesis |  | C | — | 107 |
| 30 | EOI | rhetorical-synthesis |  | C | Medium | 167 |
| 31 | EOI | rhetorical-synthesis |  | A | — | 189 |
| 32 | EOI | rhetorical-synthesis |  | A | Hard | 182 |
| 33 | EOI | rhetorical-synthesis |  | B | Hard | 176 |

#### PT5 Reading & Writing Module 1 (33 items)

| Q | Domain | Skill | Sub-type / convention tested | Key | CB difficulty | Stimulus words |
|---|--------|-------|------------------------------|-----|---------------|----------------|
| 1 | C&S | words-in-context | as-used-in-the-text | A | Easy | 148 |
| 2 | C&S | words-in-context | blank completion | B | Easy | 99 |
| 3 | C&S | words-in-context | blank completion | B | Hard | 60 |
| 4 | C&S | words-in-context | blank completion | D | Hard | 68 |
| 5 | C&S | words-in-context | blank completion | B | — | 54 |
| 6 | C&S | text-structure-purpose | main purpose | D | — | 82 |
| 7 | C&S | text-structure-purpose | main purpose | B | — | 118 |
| 8 | C&S | text-structure-purpose | function of underlined sentence | C | — | 160 |
| 9 | C&S | text-structure-purpose | function of underlined portion | B | — | 135 |
| 10 | C&S | text-structure-purpose | overall structure | B | — | 168 |
| 11 | I&I | central-ideas-details | detail / According to the text | D | Medium | 209 |
| 12 | I&I | central-ideas-details | detail / According to the text | A | — | 122 |
| 13 | I&I | command-of-evidence | quotation | D | Easy | 61 |
| 14 | I&I | command-of-evidence | quant | B | Medium | 193 |
| 15 | I&I | command-of-evidence | quotation | C | — | 73 |
| 16 | I&I | command-of-evidence | quant | B | — | 236 |
| 17 | I&I | inferences |  | A | Medium | 224 |
| 18 | I&I | inferences |  | B | Medium | 172 |
| 19 | I&I | inferences |  | A | — | 166 |
| 20 | SEC | form-structure-sense | pronoun-antecedent agreement | C | — | 155 |
| 21 | SEC | form-structure-sense | the use of verb forms within a sentence | A | — | 46 |
| 22 | SEC | form-structure-sense | subject-verb agreement | D | — | 61 |
| 23 | SEC | form-structure-sense **(stem misprinted in PDF)** | the use of plural nouns in a sentence | B | — | 37 |
| 24 | SEC | form-structure-sense | subject-verb agreement | D | — | 75 |
| 25 | SEC | boundaries | the use of punctuation between titles and proper nouns | B | — | 64 |
| 26 | SEC | boundaries | the punctuation of supplementary elements within a sentence | B | Hard | 66 |
| 27 | EOI | transitions |  | D | Easy | 66 |
| 28 | EOI | transitions |  | D | Easy | 56 |
| 29 | EOI | transitions |  | B | Medium | 62 |
| 30 | EOI | transitions |  | D | Hard | 71 |
| 31 | EOI | rhetorical-synthesis |  | A | Medium | 81 |
| 32 | EOI | rhetorical-synthesis |  | C | Medium | 171 |
| 33 | EOI | rhetorical-synthesis |  | D | — | 162 |

#### PT5 Reading & Writing Module 2 (33 items)

| Q | Domain | Skill | Sub-type / convention tested | Key | CB difficulty | Stimulus words |
|---|--------|-------|------------------------------|-----|---------------|----------------|
| 1 | C&S | words-in-context | as-used-in-the-text | C | — | 112 |
| 2 | C&S | words-in-context | blank completion | D | Easy | 105 |
| 3 | C&S | words-in-context | blank completion | A | Medium | 64 |
| 4 | C&S | words-in-context | blank completion | A | — | 63 |
| 5 | C&S | words-in-context | blank completion | C | — | 60 |
| 6 | C&S | text-structure-purpose | function of underlined sentence | C | — | 124 |
| 7 | C&S | text-structure-purpose | function of underlined sentence | B | — | 136 |
| 8 | C&S | cross-text-connections |  | A | Medium | 264 |
| 9 | I&I | central-ideas-details | detail / According to the text | A | — | 170 |
| 10 | I&I | central-ideas-details | detail / According to the text | D | — | 148 |
| 11 | I&I | central-ideas-details | main idea | A | Hard | 161 |
| 12 | I&I | command-of-evidence | quant | D | Easy | 223 |
| 13 | I&I | command-of-evidence | quotation | D | Medium | 180 |
| 14 | I&I | command-of-evidence | quant | D | Hard | 212 |
| 15 | I&I | command-of-evidence | quotation | D | Hard | 122 |
| 16 | I&I | command-of-evidence | quant | B | — | 243 |
| 17 | I&I | inferences |  | A | Medium | 272 |
| 18 | SEC | form-structure-sense | the use of verb forms within a sentence | A | — | 126 |
| 19 | SEC | boundaries | punctuation use between a subject and a verb | B | Easy | 51 |
| 20 | SEC | form-structure-sense | pronoun-antecedent agreement | A | — | 56 |
| 21 | SEC | boundaries | the punctuation of a supplementary element within a sentence | C | Medium | 59 |
| 22 | SEC | boundaries | punctuation between main clauses and a supplementary element | B | Hard | 70 |
| 23 | SEC | boundaries | the use of punctuation around noun phrases | A | Hard | 83 |
| 24 | SEC | form-structure-sense | subject-verb agreement | C | — | 73 |
| 25 | SEC | form-structure-sense | the use of verb forms within a sentence | C | — | 52 |
| 26 | EOI | transitions |  | B | Easy | 58 |
| 27 | EOI | transitions |  | C | Easy | 59 |
| 28 | EOI | transitions |  | D | Easy | 63 |
| 29 | EOI | transitions |  | D | — | 79 |
| 30 | EOI | rhetorical-synthesis |  | A | Medium | 60 |
| 31 | EOI | rhetorical-synthesis |  | D | — | 122 |
| 32 | EOI | rhetorical-synthesis |  | D | Medium | 160 |
| 33 | EOI | rhetorical-synthesis |  | A | Medium | 174 |


### 1.1 Skill counts per module (raw, and as a proportion of the 33-item linear module)

| Skill | PT2M1 | PT2M2 | PT3M1 | PT3M2 | PT4M1 | PT4M2 | PT5M1 | PT5M2 | Total | % of 264 | mean/33-item module | projected /27-item digital module |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| words-in-context | 7 | 5 | 8 | 4 | 4 | 8 | 5 | 5 | 46 | 17.42% | 5.75 | 4.70 |
| text-structure-purpose | 2 | 3 | 2 | 3 | 4 | 1 | 5 | 2 | 22 | 8.33% | 2.75 | 2.25 |
| cross-text-connections | 1 | 0 | 0 | 1 | 1 | 0 | 0 | 1 | 4 | 1.52% | 0.50 | 0.41 |
| central-ideas-details | 3 | 1 | 2 | 2 | 3 | 1 | 2 | 3 | 17 | 6.44% | 2.12 | 1.74 |
| command-of-evidence | 2 | 8 | 4 | 5 | 5 | 5 | 4 | 5 | 38 | 14.39% | 4.75 | 3.89 |
| inferences | 4 | 0 | 3 | 2 | 1 | 3 | 3 | 1 | 17 | 6.44% | 2.12 | 1.74 |
| boundaries | 4 | 6 | 5 | 5 | 4 | 5 | 2 | 4 | 35 | 13.26% | 4.38 | 3.58 |
| form-structure-sense | 5 | 3 | 2 | 5 | 4 | 3 | 5 | 4 | 31 | 11.74% | 3.88 | 3.17 |
| transitions | 0 | 4 | 1 | 4 | 4 | 2 | 4 | 4 | 23 | 8.71% | 2.88 | 2.35 |
| rhetorical-synthesis | 5 | 3 | 6 | 2 | 3 | 5 | 3 | 4 | 31 | 11.74% | 3.88 | 3.17 |
| **TOTAL** | 33 | 33 | 33 | 33 | 33 | 33 | 33 | 33 | 264 | 100% | 33 | 27 |

### 1.2 Domain counts per module

| Domain | PT2M1 | PT2M2 | PT3M1 | PT3M2 | PT4M1 | PT4M2 | PT5M1 | PT5M2 | Total | % of 264 | CB published RW blueprint |
|---|---|---|---|---|---|---|---|---|---|---|---|
| C&S | 10 | 8 | 10 | 8 | 9 | 9 | 10 | 8 | 72 | 27.27% | ~28% |
| I&I | 9 | 9 | 9 | 9 | 9 | 9 | 9 | 9 | 72 | 27.27% | ~26% |
| SEC | 9 | 9 | 7 | 10 | 8 | 8 | 7 | 8 | 66 | 25.00% | ~26% |
| EOI | 5 | 7 | 7 | 6 | 7 | 7 | 7 | 8 | 54 | 20.45% | ~20% |

**Hard invariant found:** **Information and Ideas is exactly 9 items in all 8 modules** (9/33 = 27.27%,
zero variance). No other domain is fixed: C&S ∈ {8,9,10}, SEC ∈ {7,8,9,10}, EOI ∈ {5,6,7,8}.
The complementary rule is just as tight: **C&S + I&I ∈ {17, 18, 19}**, i.e. the Standard English
Conventions block *always* starts at Q18, Q19 or Q20 and never anywhere else.
Observed pairing: C&S=10 ⇒ SEC+EOI=14; C&S=9 ⇒ 15; C&S=8 ⇒ 16.

---

## 2. The ordering law

### 2.1 Verdict

The proposed law is **CONFIRMED, without a single exception, on all 264 items**:

```
Craft & Structure  ->  Information & Ideas  ->  Standard English Conventions  ->  Expression of Ideas
   WIC -> TSP -> CTC        CID -> COE -> INF        (NO within-domain skill order)      TRN -> RS
```

* Domain order C&S → I&I → SEC → EOI: **8/8 modules, 264/264 items**, no interleaving of domains anywhere.
* Within C&S: words-in-context → text-structure-purpose → cross-text-connections: **8/8**.
  Cross-text-connections, when present, is *always the final item of the C&S block* (4/4).
* Within I&I: central-ideas-details → command-of-evidence → inferences: **8/8**. No module ever puts a
  command-of-evidence item before a central-ideas item, or an inference before a command-of-evidence item.
* Within EOI: transitions → rhetorical-synthesis: **8/8** (PT2 M1 vacuously — it has 0 transitions items).
* Within SEC: the law is **REFUTED** — boundaries and form-structure-sense are *deliberately interleaved*
  (see §3.3). This is the single place where the "group by skill" rule does not hold.

A skill may be absent (transitions n=0 in PT2 M1; cross-text n=0 in 4 of 8 modules; inferences n=0 in
PT2 M2), but no skill ever appears out of position.

### 2.2 Domain block boundaries as a fraction of module length (33 items)

| Module | C&S | I&I | SEC | EOI |
|---|---|---|---|---|
| PT2 M1 | Q1–10 (0.000–0.303) | Q11–19 (0.303–0.576) | Q20–28 (0.576–0.848) | Q29–33 (0.848–1.000) |
| PT2 M2 | Q1–8 (0.000–0.242) | Q9–17 (0.242–0.515) | Q18–26 (0.515–0.788) | Q27–33 (0.788–1.000) |
| PT3 M1 | Q1–10 (0.000–0.303) | Q11–19 (0.303–0.576) | Q20–26 (0.576–0.788) | Q27–33 (0.788–1.000) |
| PT3 M2 | Q1–8 (0.000–0.242) | Q9–17 (0.242–0.515) | Q18–27 (0.515–0.818) | Q28–33 (0.818–1.000) |
| PT4 M1 | Q1–9 (0.000–0.273) | Q10–18 (0.273–0.545) | Q19–26 (0.545–0.788) | Q27–33 (0.788–1.000) |
| PT4 M2 | Q1–9 (0.000–0.273) | Q10–18 (0.273–0.545) | Q19–26 (0.545–0.788) | Q27–33 (0.788–1.000) |
| PT5 M1 | Q1–10 (0.000–0.303) | Q11–19 (0.303–0.576) | Q20–26 (0.576–0.788) | Q27–33 (0.788–1.000) |
| PT5 M2 | Q1–8 (0.000–0.242) | Q9–17 (0.242–0.515) | Q18–25 (0.515–0.758) | Q26–33 (0.758–1.000) |

Block-start fractions collapse to three discrete values, i.e. College Board is placing the seams on a
small fixed grid rather than on a continuum:

| Seam | Observed start fractions | Observed item numbers |
|---|---|---|
| I&I starts | 0.242 (×3), 0.273 (×2), 0.303 (×3) | Q9, Q10, Q11 |
| SEC starts | 0.515 (×3), 0.545 (×2), 0.576 (×3) | Q18, Q19, Q20 |
| EOI starts | 0.758 (×1), 0.788 (×6), 0.818 (×1) | Q26, Q27, Q28 |

The I&I seam and the SEC seam are perfectly correlated (SEC start = I&I start + 9, always), which is the
mechanical consequence of the fixed I&I=9 rule.

### 2.3 Within-domain skill sequences, module by module

```
PT2M1: WIC[1-7]  TSP[8-9]  CTC[10]  CID[11-13]  COE[14-15]  INF[16-19]  FSS[20-21]  BND[22]  FSS[23-24]  BND[25-26]  FSS[27]  BND[28]  RS[29-33]
PT2M2: WIC[1-5]  TSP[6-8]  CID[9]  COE[10-17]  FSS[18]  BND[19]  FSS[20]  BND[21]  FSS[22]  BND[23-26]  TRN[27-30]  RS[31-33]
PT3M1: WIC[1-8]  TSP[9-10]  CID[11-12]  COE[13-16]  INF[17-19]  FSS[20]  BND[21-23]  FSS[24]  BND[25-26]  TRN[27]  RS[28-33]
PT3M2: WIC[1-4]  TSP[5-7]  CTC[8]  CID[9-10]  COE[11-15]  INF[16-17]  FSS[18-20]  BND[21-23]  FSS[24-25]  BND[26-27]  TRN[28-31]  RS[32-33]
PT4M1: WIC[1-4]  TSP[5-8]  CTC[9]  CID[10-12]  COE[13-17]  INF[18]  FSS[19-20]  BND[21]  FSS[22]  BND[23]  FSS[24]  BND[25-26]  TRN[27-30]  RS[31-33]
PT4M2: WIC[1-8]  TSP[9]  CID[10]  COE[11-15]  INF[16-18]  FSS[19]  BND[20-23]  FSS[24-25]  BND[26]  TRN[27-28]  RS[29-33]
PT5M1: WIC[1-5]  TSP[6-10]  CID[11-12]  COE[13-16]  INF[17-19]  FSS[20-24]  BND[25-26]  TRN[27-30]  RS[31-33]
PT5M2: WIC[1-5]  TSP[6-7]  CTC[8]  CID[9-11]  COE[12-16]  INF[17]  FSS[18]  BND[19]  FSS[20]  BND[21-23]  FSS[24-25]  TRN[26-29]  RS[30-33]
```

Domain string per module (C=C&S, I=I&I, S=SEC, E=EOI), one character per item:

```
PT2M1: CCCCCCCCCCIIIIIIIIISSSSSSSSSEEEEE
PT2M2: CCCCCCCCIIIIIIIIISSSSSSSSSEEEEEEE
PT3M1: CCCCCCCCCCIIIIIIIIISSSSSSSEEEEEEE
PT3M2: CCCCCCCCIIIIIIIIISSSSSSSSSSEEEEEE
PT4M1: CCCCCCCCCIIIIIIIIISSSSSSSSEEEEEEE
PT4M2: CCCCCCCCCIIIIIIIIISSSSSSSSEEEEEEE
PT5M1: CCCCCCCCCCIIIIIIIIISSSSSSSEEEEEEE
PT5M2: CCCCCCCCIIIIIIIIISSSSSSSSEEEEEEEE
```

---

## 3. The difficulty ladder

### 3.1 Evidence source

College Board's Question Bank exports carry an official `Difficulty` field (Easy / Medium / Hard).
142 of the 264 practice-test items were matched into that bank by verbatim item text, giving a hard,
externally-labelled difficulty value for **53.8%** of the corpus, spread evenly across modules
(16–20 labelled items per module).

Observed difficulty sequences (`.` = item not in the bank export):

```
  PT2M1: EEEMHHH..HEMMH.MMHH......M.H...HH
  PT2M2: EEM.H...E..HH...H.E.M...H.EEMHEMH
  PT3M1: EE...H....EM.HH.HH..EEM.H.EMMM..H
  PT3M2: E.MM...HMHH...H.H....MM..HHEM.H..
  PT4M1: .EM.....HE.ME..H.M..MM...HEEEM..H
  PT4M2: E.E.MMM..MH.HH.HHH.EEM.....H.M.HH
  PT5M1: EEHH......M.EM..MM.......HEEMHMM.
  PT5M2: .EM....M..HEMHH.M.E.MHH..EEE.M.MM
```

### 3.2 Within each skill block: items get monotonically harder. Zero exceptions.

Treating each maximal same-skill run as a block and each labelled item as an observation:

| Skill | blocks with ≥2 labelled items | concordant pairs | **discordant pairs** | tied |
|---|---|---|---|---|
| words-in-context | 8 | 36 | **0** | 15 |
| transitions | 5 | 16 | **0** | 8 |
| rhetorical-synthesis | 6 | 8 | **0** | 9 |
| command-of-evidence | 7 | 7 | **0** | 9 |
| boundaries (runs) | 5 | 6 | **0** | 5 |
| central-ideas-details | 4 | 5 | **0** | 1 |
| inferences | 4 | 4 | **0** | 7 |
| **ALL** | **39** | **82** | **0** | **54** |

Kendall direction = **+1.000**. Not one inversion in 82 informative pairs.

Exact permutation test: for each block, the probability that a random ordering of its observed
difficulty multiset would come out weakly ascending is 1/(distinct permutations). Multiplying across the
39 blocks gives **p ≈ 10⁻¹⁷·²** for the null "items are ordered arbitrarily within a skill block".

First-vs-last item of each skill block (blocks of length ≥3; difficulty scored Easy=1, Medium=2, Hard=3):

| Skill | mean difficulty of FIRST item | mean difficulty of LAST item |
|---|---|---|
| words-in-context | 1.00 (n=6) | 2.67 (n=3) |
| transitions | 1.00 (n=5) | 2.75 (n=4) |
| central-ideas-details | 1.00 (n=2) | 2.33 (n=3) |
| boundaries | 1.33 (n=3) | 2.33 (n=3) |
| rhetorical-synthesis | 1.75 (n=4) | 2.83 (n=6) |
| command-of-evidence | 1.80 (n=5) | 3.00 (n=2) |
| inferences | 2.50 (n=4) | 3.00 (n=2) |

Every block opens Easy and closes Hard. Note the *floor* rises across the module: the first
words-in-context item is Easy in every module, but the first inferences item averages 2.50 — the ladder
resets at each skill boundary but does **not** reset to the same starting height.

A construction-independent proxy over all 264 items (stimulus length in words, by within-block tercile)
agrees for the passage-based skills and is flat for the sentence-level skills:

| Skill | tercile 1 | tercile 2 | tercile 3 |
|---|---|---|---|
| command-of-evidence | 153 w | 194 w | 215 w |
| rhetorical-synthesis | 110 w | 161 w | 174 w |
| text-structure-purpose | 106 w | 154 w | 157 w |
| inferences | 157 w | 159 w | 157 w |
| transitions | 65 w | 62 w | 74 w |
| words-in-context | 99 w | 62 w | 61 w |

(words-in-context runs *backwards* on length because its early items are often the long literary/poetry
stimuli — length is not the difficulty driver there; lexical rarity is.)

### 3.3 The Conventions block: ONE ladder across the whole domain, not one per skill

Three independent lines of evidence.

**(a) Boundaries and Form-Structure-Sense are interleaved, not grouped.** If each skill had its own
ladder, the two skills would appear as two contiguous sub-blocks (1 alternation). They do not:

| Module | SEC span | sequence (B=Boundaries, F=Form/Structure/Sense) | alternations |
|---|---|---|---|
| PT2 M1 | Q20–28 | `FFBFFBBFB` | 5 |
| PT2 M2 | Q18–26 | `FBFBFBBBB` | 5 |
| PT3 M1 | Q20–26 | `FBBBFBB` | 3 |
| PT3 M2 | Q18–27 | `FFFBBBFFBB` | 3 |
| PT4 M1 | Q19–26 | `FFBFBFBB` | 5 |
| PT4 M2 | Q19–26 | `FBBBBFFB` | 3 |
| PT5 M1 | Q20–26 | `FFFFFBB` | 1 |
| PT5 M2 | Q18–25 | `FBFBBBFF` | 4 |

Mean 3.6 alternations; a skill-grouped design would give 1 everywhere. This is the **only** domain in the
whole form where the skills are not blocked — decisive evidence that the SEC ordering criterion is
difficulty, not skill.

Two secondary regularities: **the SEC block opens with a Form-Structure-Sense item in 8/8 modules**, and
closes with a Boundaries item in 7/8 (PT5 M2 closes `FF`).

**(b) The domain-level difficulty sequence is monotone.** Taking the SEC block as one undifferentiated
run and reading off the CB difficulty labels in item order: 7 modules had ≥2 labelled SEC items, and
**0 of 7 contain an inversion** (`23`, `123`, `1123`, `2233`, `223`, `112`, `1233`); 22 concordant / 0
discordant pairs; exact permutation p ≈ **10⁻⁵·⁰**. (This test is Boundaries-dominated because the
Question Bank export supplied contains no Form-Structure-Sense items at all — see §3.4 caveat.)

**(c) Convention *types* sort by position, ignoring skill.** Mean relative position within the SEC block
(0 = first slot, 1 = last slot), pooled over 66 conventions items:

| Convention tested (from CB rationales) | n | mean relative position | skill |
|---|---|---|---|
| verb form / tense | 13 | 0.22 | FSS |
| clause-boundary punctuation | 2 | 0.23 | Boundaries |
| relative-clause punctuation | 1 | 0.29 | Boundaries |
| plurals & possessives | 5 | 0.38 | FSS |
| agreement (subject-verb, pronoun-antecedent) | 9 | 0.46 | FSS |
| sentence boundaries | 5 | 0.47 | Boundaries |
| coordination of main clauses | 4 | 0.51 | Boundaries |
| "no punctuation needed" traps (subject/verb, prep/complement, titles, noun phrases) | 7 | 0.62 | Boundaries |
| supplementary-element punctuation | 12 | 0.70 | Boundaries |
| subject-modifier placement | 4 | 0.71 | FSS |
| complex series (internal punctuation) | 3 | 0.83 | Boundaries |
| colon | 1 | 0.88 | Boundaries |

The gradient runs cleanly from cheap morphological checks (verb form, tense) to expensive syntactic ones
(supplements, complex series, misplaced-modifier rewrites), and it **crosses the skill boundary freely**:
FSS occupies both the cheapest slot (verb form 0.22) and one of the dearest (subject-modifier 0.71).

Corroborating proxy — mean words per answer option within the SEC block:
tercile 1 = **1.75 w**, tercile 2 = **3.46 w**, tercile 3 = **3.77 w**. Early SEC items offer one-word
options (`are / have been / were / is`); late SEC items offer clause-length options.

### 3.4 Caveats

* Difficulty evidence covers 53.8% of items. The remaining 46.2% are unlabelled, so "zero inversions" is
  a statement about the labelled subsample, not a proof over all 264.
* The Question Bank export supplied contains **no Form-Structure-Sense items**, so the SEC domain-level
  monotonicity test in (b) is carried by Boundaries items. Evidence (a) and (c) are what actually
  establish the *domain-level* (rather than skill-level) ladder.

---

## 4. Answer-key distribution

| Module | key string (Q1→Q33) | A | B | C | D | longest same-letter run | number of runs ≥2 |
|---|---|---|---|---|---|---|---|
| PT2 M1 | `BCCBDCBDDAAAADCBBAAABACCCDCCBCCDD` | 8 | 7 | 11 | 7 | **4** (A) | 9 |
| PT2 M2 | `CBDBCCADBABACDCBBBCADACCABABDDACB` | 8 | 10 | 9 | 6 | **3** (B) | 4 |
| PT3 M1 | `AAADBACBDCDDCCCDABCAACDACBAACCBCA` | 11 | 5 | 11 | 6 | **3** (A) | 6 |
| PT3 M2 | `DBDBAAACADAACACCCBACDCDAAADADDADA` | 14 | 3 | 7 | 9 | **3** (A) | 5 |
| PT4 M1 | `BAACABDBBDCDABCAAAADDDBCBACDAADDC` | 11 | 7 | 6 | 9 | **4** (A) | 6 |
| PT4 M2 | `DDBBBBACCAABDCCABDCABDDABBAACCAAB` | 10 | 10 | 7 | 6 | **4** (B) | 10 |
| PT5 M1 | `ABBDBDBCBBDADBCBABACADBDBBDDBDACD` | 6 | 13 | 4 | 10 | **2** (B) | 4 |
| PT5 M2 | `CDAACCBAADADDDDBAABACBACCBCDDADDA` | 11 | 5 | 7 | 10 | **4** (D) | 8 |
| **all 8 modules** | — | **79** | **60** | **62** | **63** | 4 | 52 |

* Grand totals 79 A / 60 B / 62 C / 63 D over 264 items. χ²(3) vs uniform = **3.48** (crit .05 = 7.81):
  the pool is **not** significantly non-uniform, but A is mildly over-represented (29.9% vs 25%).
* **Per module the key is nowhere near balanced.** Range per letter per module:
  A 6–14, B 3–13, C 4–11, D 6–10. PT3 M2 has 14 A's and 3 B's; PT5 M1 has 13 B's and 4 C's.
  There is clearly **no per-module key-balancing constraint** — balance emerges only at pool level.
* **Longest same-letter run is 4** and it occurs in 4 of 8 modules (PT2 M1 `AAAA` at Q10–13,
  PT4 M1 `AAAA` at Q16–19, PT4 M2 `BBBB` at Q3–6, PT5 M2 `DDDD` at Q12–15). Runs of 5+ never occur.
  Number of runs of length ≥2 per module: 4–10 (mean 6.5).
* A safe generation rule: **allow runs up to 4, forbid 5**; target ~25% per letter across a form but do
  not enforce it within a 33-item module.

---

## 5. Cross-text connections

| Module | count | position | fraction of module |
|---|---|---|---|
| PT2 M1 | 1 | Q10 — last item of C&S block (Q1–10) | 0.303 |
| PT2 M2 | 0 | — | — |
| PT3 M1 | 0 | — | — |
| PT3 M2 | 1 | Q8 — last item of C&S block (Q1–8) | 0.242 |
| PT4 M1 | 1 | Q9 — last item of C&S block (Q1–9) | 0.273 |
| PT4 M2 | 0 | — | — |
| PT5 M1 | 0 | — | — |
| PT5 M2 | 1 | Q8 — last item of C&S block (Q1–8) | 0.242 |

**Findings.**
1. **Exactly 0 or 1 per module; never 2.** 4 occurrences in 264 items (1.52%).
2. **Exactly one per test form.** PT2, PT3, PT4 and PT5 each contain exactly one cross-text pair across
   their two RW modules. Which module carries it alternates: PT2→M1, PT3→M2, PT4→M1, PT5→M2.
3. **Position is fully determined:** it is always the *final* item of the Craft & Structure block, i.e.
   the item immediately preceding the first Information & Ideas item. Never anywhere else.
4. The paired stimulus is the longest in the whole form: mean 204 words for the Text 1 + Text 2 pair
   (range 175–264), vs 77 words for a words-in-context stimulus.
5. All four are graded **Hard** where a CB difficulty label exists.

**Verbatim stems (all 4, complete inventory):**

```
Based on the texts, how would Behrenfeld and colleagues (Text 2) most likely respond to the
  "conventional wisdom" discussed in Text 1?                                             [PT2 M1 Q10]
Based on the texts, how would Putirka and Xu (Text 2) most likely characterize the
  conclusion presented in Text 1?                                                        [PT3 M2 Q8]
Based on the texts, how would Graeber and Wengrow (Text 2) most likely respond to the
  "conventional wisdom" presented in Text 1?                                             [PT4 M1 Q9]
Based on the texts, how would the author of Text 2 most likely respond to the overall
  argument presented in Text 1?                                                          [PT5 M2 Q8]
```

Template: `Based on the texts, how would {NAMED AUTHOR(S) (Text 2) | the author of Text 2} most likely
{respond to | characterize} the {"conventional wisdom" | overall argument | conclusion}
{discussed | presented} in Text 1?`
Note the quotation marks around *"conventional wisdom"* are load-bearing: that phrase is quoted because
it appears verbatim in Text 1 (2/4 items).

---

## 6. Rhetorical synthesis — "student notes" items

**n = 31** across 8 modules (3–6 per module; mean 3.88).

**Lead-in.** 31/31 items (100%) use the identical lead-in, on its own line, immediately before the bullets:

```
While researching a topic, a student has taken the following notes:
```

**Bullet counts.**

| bullets | items | share |
|---|---|---|
| 3 | 1 | 3.2% |
| 4 | 6 | 19.4% |
| 5 | 20 | 64.5% |
| 6 | 4 | 12.9% |

min 3, max 6, **mean 4.87, median 5**. Per module: PT2M1 `[5,4,6,5,5]`, PT2M2 `[4,5,5]`,
PT3M1 `[5,5,5,4,6,5]`, PT3M2 `[5,5]`, PT4M1 `[6,4,5]`, PT4M2 `[4,5,5,5,5]`, PT5M1 `[5,5,5]`,
PT5M2 `[3,4,6,5]`. **5 bullets is the modal and median design; 3 and 6 are the hard limits.**

**Bullet length.** 151 bullets measured: min **5** words, max **39**, **mean 14.07, median 14**;
p10 = 8, p25 = 11, p75 = 17, p90 = 20. Bullets are single declarative sentences (no sub-bullets, no
internal semicolons in the great majority); the long tail (>25 w) is always a bullet carrying a
definition or a numeric result. Whole notes block is 60–195 words (mean 145).

**Exact stem wording — complete inventory with frequencies.**

| n | wording |
|---|---|
| 29 | `The student wants to <GOAL>. Which choice most effectively uses relevant information from the notes to accomplish this goal?` |
| 1 | `The student wants to <GOAL-A> and <GOAL-B>. Which choice most effectively uses relevant information from the notes to accomplish these goals?` |
| 1 | `Which choice most effectively uses information from the given sentences to emphasize the relative sizes of the two capitals' populations?` |

* The singular/plural switch is rule-governed, not random: `these goals` is used **iff** the goal
  sentence contains two coordinated goals (PT3 M1 Q29: *"...to emphasize the decline in unique apple
  varieties in the US **and specify** why this decline occurred."*). 1/31.
* The `given sentences` variant (PT2 M1 Q31) is a legacy form: it still carries the standard
  `While researching a topic...` lead-in and 6 bullets, but folds the goal into the stem and omits the
  separate `The student wants to` sentence. 1/31 — treat as deprecated.
* Goal-sentence verb frequencies (n=30): **emphasize 13**, explain 3, introduce 3, present 3,
  describe 2, specify 2, make (a generalization) 1, identify 1, indicate 1, contrast 1.
  `emphasize` alone is 43% of all goals.
* Recurring goal formulas worth copying verbatim: `to emphasize a similarity between X and Y`,
  `to emphasize a difference between X and Y`, `to introduce X to an audience unfamiliar with Y`,
  `to present X to an audience unfamiliar with Y`, `to emphasize the aim of the research study`
  (appears 2×, in PT2 M2 and PT3 M2 — College Board reuses goal sentences across forms).

---

## 7. Command of evidence — the three-way split

**n = 38** across 8 modules (2–8 per module; mean 4.75). The block is always contiguous, always sits
between central-ideas-details and inferences.

| Module | n | span | (a) quantitative (graph/table) | (b) textual quotation | (c) "which finding, if true" | in-block order |
|---|---|---|---|---|---|---|
| PT2 M1 | 2 | Q14–15 | 1 | 0 | 1 | quant–finding |
| PT2 M2 | 8 | Q10–17 | 3 | 0 | 5 | quant–quant–finding–finding–finding–finding–quant–finding |
| PT3 M1 | 4 | Q13–16 | 1 | 1 | 2 | quote–quant–finding–finding |
| PT3 M2 | 5 | Q11–15 | 3 | 1 | 1 | finding–quote–quant–quant–quant |
| PT4 M1 | 5 | Q13–17 | 3 | 1 | 1 | quant–finding–quant–quote–quant |
| PT4 M2 | 5 | Q11–15 | 1 | 2 | 2 | finding–quote–quant–finding–quote |
| PT5 M1 | 4 | Q13–16 | 2 | 2 | 0 | quote–quant–quote–quant |
| PT5 M2 | 5 | Q12–16 | 3 | 2 | 0 | quant–quote–quant–quote–quant |
| **TOTAL** | **38** | — | **17 (44.7%)** | **9 (23.7%)** | **12 (31.6%)** | — |

* Quantitative items split **10 graph / 7 table**.
* The three sub-types are **not ordered relative to each other** inside the block — every arrangement is
  observed, including alternation (PT5 M1/M2) and clustering (PT2 M2). Only difficulty orders the block.
* Note the drift across forms: PT2/PT3 lean on "which finding, if true" (7 of 14 items); PT5 has **zero**
  of them and leans on quotation + quantitative. A modern-form generator should weight roughly
  **quant 45% / quotation 25–35% / finding 20–30%**.

### 7.a Quantitative — verbatim stems (all 17)

```
[2] Which choice most effectively uses data from the table to complete the statement?
[1] Which choice most effectively uses data from the table to complete the example?
[1] Which choice most effectively uses data from the graph to complete the text?
[1] Which choice most effectively uses data from the graph to complete the example?
[1] Which choice most effectively uses data from the graph to complete the statement?
[1] Which choice most effectively uses data from the graph to illustrate the claim?
[1] Which choice most effectively uses data from the graph to support the underlined claim?
[1] Which choice most effectively uses data from the table to support the research team's conclusion?
[1] Which choice best describes data from the graph that support the researchers' conclusion?
[1] Which choice best describes data in the graph that support Charles and Stephens's claim?
[1] Which choice best describes data from the graph that weaken the student's conclusion?
[1] Which choice best describes data from the graph that support Taylor and colleagues' conclusion?
[1] Which choice best describes data from the graph that support Ibanez and colleagues' conclusion?
[1] Which choice best describes data from the table that support Barrett and Rayfield's suggestion?
[1] Which choice best describes data from the table that support the researcher's hypothesis?
[1] Which choice best describes data from the table that support Persad and her colleagues' conclusion?
```

Two skeletons only, 9 + 8:
* `Which choice most effectively uses data from the {graph|table} to {complete|support|illustrate} the {text|statement|example|claim|underlined claim}?` (9) — used when the stimulus ends in a blank the option must fill.
* `Which choice best describes data {from|in} the {graph|table} that {support|weaken} <ATTRIBUTION>'s {conclusion|claim|hypothesis|suggestion}?` (8) — used when the stimulus is complete and the options are standalone descriptions.
  `in the graph` appears once out of 8; `from the` is the default (7/8).

### 7.b Textual quotation — verbatim stems (all 9)

```
[1] Which quotation from "The Young Girl" most effectively illustrates the claim?
[1] Which quotation from "The Bet" most effectively illustrates the claim?
[1] Which quotation from "The Yellow Wallpaper" most effectively illustrates the claim?
[1] Which quotation from "Poetry" most effectively illustrates the claim?
[1] Which quotation from a translation of "The Poet Walt Whitman" most effectively illustrates the claim?
[1] Which quotation from the interviews best illustrates the journalist's claim?
[1] Which quotation from a work by a historian would best illustrate the student's claim?
[1] Which quotation from a researcher would best support the student's assertion?
[1] Which choice most effectively uses a quotation from King Lear to illustrate the claim?
```

Dominant form (5/9): `Which quotation from "<TITLE>" most effectively illustrates the claim?` — note the
bare `the claim`, with the claim stated in the stimulus. When the source is a *person/role* rather than a
titled work the verb softens to `would best illustrate / would best support` and the claim is attributed
(`the student's claim`, `the journalist's claim`, `the student's assertion`). The `uses a quotation from
<PLAY> to illustrate` form (1/9) is used when the options are blank-fillers inside the stimulus sentence
rather than free-standing quotations.

### 7.c "Which finding, if true" — verbatim stems (all 12)

```
[1] Which finding, if true, would most directly support the researchers' hypothesis?
[1] Which finding, if true, would most directly support the journalist's claim?
[1] Which finding, if true, would most directly support Paredes's argument?
[1] Which finding, if true, would most directly support Suarez, Perez-Huerta, and Harrell's claim?
[1] Which finding, if true, would most directly support Gomez-Bahamon and her team's hypothesis?
[1] Which finding, if true, would most directly weaken the astronomers' claim?
[1] Which finding, if true, would most directly weaken the student's hypothesis?
[1] Which finding, if true, would most directly undermine Foster's hypothesis?
[1] Which finding, if true, would most strongly support the team's conclusion?
[1] Which finding, if true, would most strongly support the scholar's claim?
[1] Which finding from the students' study, if true, would most strongly support Tannen's hypothesis?
[1] Which finding from Washington and Mullainathan's study, if true, would most directly weaken the
    claim made by people who favor the traditional view of voter behavior?
```

Skeleton: `Which finding{, if true,| from <STUDY>, if true,} would most {directly|strongly}
{support|weaken|undermine} <ATTRIBUTION>'s {hypothesis|claim|conclusion|argument}?`
Frequencies: `directly` 8 / `strongly` 4; `support` 8 / `weaken` 3 / `undermine` 1;
`hypothesis` 5 / `claim` 4 / `conclusion` 2 / `argument` 1. `, if true,` is present in 12/12 —
**never omit it**. The `from <STUDY>` insertion appears 2/12 and only when the stimulus describes a
specific named study.

---

## 8. Complete verbatim stem inventory (all 264 items)

Frequencies are over the whole 264-item corpus. Anything not in this list did not occur.

### 8.1 Words in Context — n=46
| n | stem |
|---|---|
| 44 | `Which choice completes the text with the most logical and precise word or phrase?` |
| 1 | `As used in the text, what does the word "trace" most nearly mean?` |
| 1 | `As used in the text, what does the phrase "reaching across to" most nearly mean?` |

95.7% blank-completion, 4.3% as-used. Both "as used" items are **Q1 of their module** (PT5 M1 Q1,
PT5 M2 Q1) — i.e. the easiest slot on the form. Template: `As used in the text, what does the
{word|phrase} "<TOKEN>" most nearly mean?` — `word` for single tokens, `phrase` for multi-word spans.

### 8.2 Text Structure and Purpose — n=22
| n | stem |
|---|---|
| 7 | `Which choice best states the main purpose of the text?` |
| 6 | `Which choice best describes the function of the underlined sentence in the text as a whole?` |
| 5 | `Which choice best describes the overall structure of the text?` |
| 2 | `Which choice best describes the function of the underlined portion in the text as a whole?` |
| 1 | `Which choice best describes the function of the second sentence in the overall structure of the text?` |
| 1 | `Which choice best describes the function of the third sentence in the overall structure of the text?` |

Four families: main-purpose (32%), function-of-underlined (36%), overall-structure (23%),
function-of-Nth-sentence (9%). `underlined sentence` (6) vs `underlined portion` (2) is 3:1 —
`portion` is used when the underlining covers less than a full sentence.

### 8.3 Cross-Text Connections — n=4
See §5 for all four verbatim.

### 8.4 Central Ideas and Details — n=17
| n | stem |
|---|---|
| 9 | `According to the text, <WH-QUESTION>?` |
| 6 | `Which choice best states the main idea of the text?` |
| 1 | `Based on the text, in what way is the human mind like a flower?` |
| 1 | `Which choice best describes what is happening in the text?` |

Attested `According to the text, …` completions, verbatim:
```
According to the text, why would a helicopter built for Earth be unable to fly on Mars?
According to the text, what is true about Dorian?
According to the text, what is true about Elinor?
According to the text, why are ecologists worried about Pando?
According to the text, why was Wang and his team's discovery of the Terropterus xiushanensis fossil significant?
According to the text, how did the researchers determine the level of surprise displayed by the cats in the study?
According to the text, what was surprising to scientists studying the seismic activity data from NASA's InSight lander?
According to the text, what do some historians suggest about Maya civilization?
According to the text, why are some critics skeptical of the concept behind Bosco Verticale?
```
`Which choice best describes what is happening in the text?` (1/17) is the literary-narrative variant.
`Based on the text, <WH>?` (1/17) is used for figurative/analogical comprehension of a poem.
Note `What is true about <NAME>?` occurs twice and both times the stimulus is a 19th-century novel excerpt.

### 8.5 Command of Evidence — n=38
See §7 for the complete three-part inventory.

### 8.6 Inferences — n=17
| n | stem |
|---|---|
| **17** | `Which choice most logically completes the text?` |

**100% invariant.** No variants whatsoever across 4 tests. The stimulus always ends with a blank
preceded by a logical connective (`Therefore, …`, `This suggests that …`, `so …`), and the options are
clause-length completions. Mean stimulus 168 words (range 132–272) — the second-longest of any skill.

### 8.7 Boundaries — n=35 &nbsp;&nbsp;/&nbsp;&nbsp; 8.8 Form, Structure, and Sense — n=31
| n | stem |
|---|---|
| **66** | `Which choice completes the text so that it conforms to the conventions of Standard English?` |

**The two skills are stem-identical.** 66/66 items use exactly this sentence — there is no
distinguishing wording of any kind. (The single apparent exception, PT5 M1 Q23, is the printing error
documented in §0.) The skill is determined **only** by what varies across the four options:
options differing solely in punctuation ⇒ Boundaries; options differing in verb form, verb tense,
number agreement, pronoun, apostrophe placement or clause-subject position ⇒ Form, Structure, and Sense.

Attested conventions tested, from College Board's own rationales (all 66):

*Boundaries — all 35, with exact College Board rationale wording and frequency:*

| n | "The convention being tested is …" |
|---|---|
| 5 | punctuation use between sentences |
| 3 | the punctuation of items in a complex series *(one instance adds "(a series including internal punctuation)")* |
| 3 | the punctuation of a supplementary element within a sentence |
| 2 | the coordination of main clauses within a sentence |
| 2 | punctuation use between a main clause and a supplementary phrase |
| 2 | the use of punctuation around noun phrases |
| 1 each (16 further singletons) | punctuation between a main clause and a supplementary noun phrase · punctuation between a subject and a verb · punctuation use between a subject and a verb · punctuation between a subordinate clause and a main clause · punctuation between a main clause and a subordinate clause · punctuation between a supplementary phrase and a main clause · punctuation use between two supplementary phrases · punctuation use between a main clause and two supplementary elements · punctuation between main clauses and a supplementary element · the punctuation of a supplementary word or phrase between two main clauses · the punctuation of supplementary elements within a sentence · the coordination of clauses within a sentence · the coordination of main clauses · punctuation between a verb and a preposition · punctuation between a preposition and its complement · the use and punctuation of an integrated relative clause · the use of a colon within a sentence · the use of punctuation between titles and proper nouns |

Rolled up by mechanism: **supplements/parentheticals 12**, **sentence boundaries 5**, **coordination of
main clauses 4**, **complex series 3**, **"no punctuation needed" traps (subject↔verb, verb↔preposition,
preposition↔complement, title↔proper noun, noun phrases) 7**, **colon 1**, **integrated relative clause 1**,
**subordinate-clause boundary 2**.

*Form, Structure, and Sense — all 31:*

| n | "The convention being tested is …" |
|---|---|
| 7 | subject-verb agreement |
| 4 | the use of verbs to express tense |
| 4 | the use of plural and possessive nouns |
| 4 | subject-modifier placement |
| 3 | the use of finite and nonfinite verb forms within a sentence |
| 3 | the use of verb forms within a sentence |
| 2 | finite and nonfinite verb forms within a sentence |
| 2 | pronoun-antecedent agreement |
| 1 | the use of verbs to express tense in a sentence |
| 1 | the use of plural nouns in a sentence |

Rolled up: **verb form/finiteness 8**, **subject-verb agreement 7**, **verb tense 5**,
**plurals & possessives 5**, **subject-modifier placement 4**, **pronoun-antecedent agreement 2**.

### 8.9 Transitions — n=23
| n | stem |
|---|---|
| **23** | `Which choice completes the text with the most logical transition?` |

**100% invariant.** Stimulus is short (mean 65 w, range 44–88) and always ends `_______` at the head of
the final sentence. Options are single transition words/phrases with the following capitalisation rule:
capitalised + trailing comma when the blank opens a sentence, lowercase when mid-sentence.
Most frequently offered options across the corpus: *For example* (5), *Nevertheless* (4), *Instead* (4),
*Specifically* (4), *For instance* (3), then *Secondly, meanwhile, Thus, Regardless, Still, Subsequently,
Likewise, In addition, However* (2 each).

### 8.10 Rhetorical Synthesis — n=31
See §6.

---

## 9. Generator-facing summary of the architecture

To build a form that is structurally indistinguishable from an official one:

1. **33 slots (linear) / 27 (digital).** Fill in strict domain order C&S → I&I → SEC → EOI. Never interleave domains.
2. **Fix Information & Ideas at exactly 9 items** (linear) — the only hard count in the blueprint.
   Then choose C&S ∈ {8,9,10}; SEC + EOI = 33 − 9 − |C&S|, with SEC ∈ {7..10} and EOI ∈ {5..8}.
3. **Order inside C&S:** WIC block, then TSP block, then (0 or 1) cross-text item as the block's last slot.
   Ship cross-text on exactly one of the two modules per test form.
4. **Order inside I&I:** CID → COE → INF. Any of the three may be as small as 0 or 1.
5. **Inside SEC do NOT block by skill.** Interleave Boundaries and Form-Structure-Sense (3–5 alternations),
   open the block with a Form-Structure-Sense item, close with a Boundaries item, and sort the whole
   block by difficulty: verb form/tense and agreement early; supplements, complex series and
   subject-modifier placement late.
6. **Order inside EOI:** transitions block, then rhetorical-synthesis block.
7. **Sort every other block easy → hard.** Zero inversions is the observed standard.
8. **Keys:** allow same-letter runs up to 4, forbid 5; do not force per-module letter balance.
9. **Stems are boilerplate.** Inferences, Transitions and both Conventions skills have exactly one
   permitted sentence each; Words in Context is 96% one sentence. Any paraphrase is a tell.
