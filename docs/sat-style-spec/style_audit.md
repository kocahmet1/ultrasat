# Style-Fidelity Audit — `practiceTest9RW.json` (Exam 9, 54 items)

**Auditor:** test-development lead, style fidelity only (not key correctness).
**Target:** `/sessions/nifty-epic-maxwell/mnt/ultrasat/scripts/data/practiceTest9RW.json`
**References:** `spec/01`–`spec/04` (measured on 1,200 bank items + 264 practice-test items) and the
parsed corpus `/tmp/allq.json` (n = 1,198 usable items), queried directly for every figure below.

**Verdict.** The items are individually competent and the form is *original* (max token-Jaccard against
the official bank = 0.141, below the official bank's own internal baseline of 0.220 — see §8). But the
form has a consistent authorial fingerprint that is not College Board's: it writes **short, plain,
proper-noun-free, two-sentence prose**, it **uses passage length as a difficulty knob where CB does not**,
it **never uses the parenthetical gloss**, and its **answer key and Conventions block are machine-tidy in
ways no official module is**. An experienced tutor would flag it inside two minutes, and the first thing
they would notice is the Conventions and Transitions block.

---

## 1. Stimulus length vs the official per-skill bands

Prose-only word counts (HTML table/SVG stripped). Official p10/median/p90 from
`02_stimulus_texture.md`, re-derived from `/tmp/allq.json` and confirmed to within ±2 words.

| skill | n | new median | official median | new mean | official mean | new IQR | official IQR | items outside p10–p90 |
|---|---|---|---|---|---|---|---|---|
| Words in Context | 9 | **72** | 53 | 73.9 | 55.7 | 17 | 15 | **3 above p90** (M1Q05 112, M2Q01 88, M2Q04 82) |
| Text Structure and Purpose | 4 | **110** | 91 | 111.0 | 92.9 | 10 | 20 | 0 |
| Cross-Text Connections | 2 | 144 | 142 | 144.5 | 140.1 | 2 | 17 | 0 |
| Central Ideas and Details | 4 | **106** | 90 | 103.0 | 93.3 | 13 | 20 | 0 |
| Command of Evidence | 6 | **78** | 105 | 83.8 | 105.4 | 21 | 48 | 0 |
| Inferences | 3 | **125** | 94 | 122.3 | 94.6 | 10 | 29 | **2 above p90** (M1Q14 125, M2Q14 131) |
| Boundaries | 8 | 47 | 46 | 46.4 | 44.2 | 8 | 14 | 0 |
| Form, Structure, and Sense | 7 | 42 | 43 | 42.9 | 41.8 | 4 | 18 | 0 |
| Transitions | 6 | 56 | 54 | 55.7 | 53.2 | 5 | 11 | 0 |
| Rhetorical Synthesis | 5 | 87 | 92 | 86.0 | 91.2 | 4 | 22 | 0 |

**Five items sit above p90; zero sit below p10.** Under a correctly calibrated length distribution you
would expect ~5.4 on each side. P(0 items below p10 | 54 items) = 0.9^54 = **0.0034**. The form never
writes a short passage.

**IQR is compressed in 9 of 10 skills** — Text Structure 10 vs 20, Rhetorical Synthesis 4 vs 22,
Command of Evidence 21 vs 48, Inferences 10 vs 29, Transitions 5 vs 11. CB's forms contain a 54-word
Text Structure item next to a 187-word one. This form does not.

### 1b. Length-by-difficulty ramp (median words) — the Words in Context problem

| skill | new E | off E | new M | off M | new H | off H |
|---|---|---|---|---|---|---|
| **Words in Context** | 53 | 51 | **69** | 49 | **97** | 55 |
| Command of Evidence | 69 | 86 | 88 | 95 | **95** | 120 |
| Rhetorical Synthesis | 87 | 72 | 85 | 93 | 86 | 98 |
| Inferences | – | 94 | 111 | 85 | 128 | 105 |
| Text Structure and Purpose | – | 90 | 110 | 90 | 112 | 91 |
| Boundaries | 38 | 38 | 49 | 47 | 53 | 49 |
| Form, Structure, and Sense | 39 | 40 | 43 | 45 | 53 | 47 |
| Transitions | 52 | 50 | 58 | 55 | 58 | 59 |

Officially, Words in Context is **flat** across difficulty (51/49/55): CB makes a WiC item hard with a
rarer word and a tighter inference, not with a longer passage. This form ramps it 53 → 69 → 97 (+83%).
Rhetorical Synthesis is the mirror error: CB ramps 72 → 93 → 98; this form is flat at 87/85/86.
Command of Evidence, which officially has the steepest ramp of all (86 → 95 → **120**), is here
short and shallow (69 → 88 → 95).

---

## 2. Sentence architecture

| skill | new sent/stim | official | new words/sent | official |
|---|---|---|---|---|
| Words in Context | **4.0** | 2.3 | **20.8** | 28.3 |
| Text Structure and Purpose | 6.5 | 4.4 | 21.9 | 24.6 |
| Cross-Text Connections | 6.5 | 6.1 | 22.3 | 24.4 |
| Central Ideas and Details | 4.8 | 4.1 | 23.5 | 25.4 |
| Command of Evidence | 3.5 | 3.4 | **24.7** | 33.8 |
| Inferences | 5.3 | 4.2 | 23.0 | 25.2 |
| Boundaries | 1.9 | 1.7 | 26.0 | 30.3 |
| Form, Structure, and Sense | 2.0 | 1.8 | **21.4** | 26.3 |
| Transitions | 3.0 | 2.6 | 18.6 | 21.8 |
| Rhetorical Synthesis | 6.0 | 5.6 | 14.3 | 17.0 |
| **aggregate** | — | — | **19.8** | **22.6** |

**Words per sentence is below official in all ten skills without exception.** That is not noise; it is a
register. The prose is chopped where CB's is subordinated.

### 2b. The Conventions template lock

| sentences per stimulus | official Boundaries | official FSS | official Transitions | **this form** |
|---|---|---|---|---|
| 1 | 64 (43%) | 56 (37%) | 2 (1%) | Boundaries 1, FSS 0, Trans 0 |
| 2 | 74 (49%) | 73 (49%) | 67 (43%) | **Boundaries 7, FSS 7**, Trans 0 |
| 3 | 11 (7%) | 18 (12%) | 75 (48%) | **Transitions 6** |
| 4+ | 1 (1%) | 5 (3%) | 13 (9%) | 0 |

**14 of 15 SEC items are exactly two sentences; 6 of 6 Transitions items are exactly three.**
Under the official proportions, P(≥14 of 15 SEC items = 2 sentences | p = 0.49) = **3.7 × 10⁻⁴**;
P(6 of 6 Transitions = 3 sentences | p = 0.48) = 0.48⁶ = **0.012**. Jointly ≈ **4.6 × 10⁻⁶**. The spec's headline observation — *"Conventions items are 1–2 long
sentences… one architecturally complex sentence containing the blank"* — is only half implemented:
the vendor took the "2" and dropped the "1". CB writes 43% of Boundaries items as a **single**
40–55-word sentence with the blank inside it. This form does that once (M2Q20).

Blank placement itself is correct: 100% of SEC blanks in the final sentence (official 89%/91%),
Transitions blank is the first word of the final sentence 6/6 (official 82%), mean relative position
within the blank sentence 0.51 vs official 0.47–0.50.

### 2c. Rhetorical Synthesis bullets

| | bullets/item | bullet words: median | p10 | p90 | range |
|---|---|---|---|---|---|
| official | ~5 (5.6 lines) | 14 | 8 | 20 | — |
| **this form** | **5, 5, 5, 5, 5** | 15 | 13 | 16 | **12–17** |

Every note block is exactly five bullets and every bullet is 12–17 words. CB's bullets swing from
8 to 20 words and the block length ramps with difficulty. This form's bullets have essentially zero
variance — the visual signature of a generator, not a writer.

---

## 3. Register — punctuation per 1,000 words of stimulus prose

New form: 4,115 words. Official: 87,784 words.

| mark | official (spec) | official (recomputed) | **this form** | ratio | verdict |
|---|---|---|---|---|---|
| comma `,` | 48.25 | 48.80 | **38.88** | 0.81× | under — consequence of short sentences |
| parenthesis `(` | 5.25 | 5.31 | **0.24** | **0.05×** | **severely under — 1 gloss in 54 items** |
| colon `:` | 3.70 | 3.74 | 4.37 | 1.18× | mildly over |
| em dash `—` | 3.67 | 3.70 | 3.65 | 0.99× | **correct** |
| double quote `“` | 3.35 | 3.39 | **0.97** | **0.29×** | under |
| semicolon `;` | 1.07 | 1.08 | **2.43** | **2.27×** | **over** |

Item-level: **1 of 54 stimuli contains a parenthetical gloss** (M1Q09, "the ropewalks (long sheds in
which rope is spun)"); officially **25%** of stimuli (301/1,198) contain parentheses. Em-dash usage is
correctly calibrated both in rate (3.65 vs 3.70) and in shape (50% paired vs official 43%) — the
predicted "vendor over-uses em dashes" tell is **absent**. The predicted semicolon tell **is present**,
and the vendor is clearly substituting semicolons and colons for the parenthetical gloss CB would use.

Ten semicolons appear in eight stimuli: M1Q05, M1Q13, M1Q26, M1Q27, M2Q08 (×2), M2Q14 (×2), M2Q20,
M2Q25. Only M2Q20 (complex series, Boundaries) is a structurally necessary one.

### 3b. Lexical register

| measure | official | this form |
|---|---|---|
| mean word length (chars) | 5.09 | **4.80** |
| words ≥ 8 characters | 20.4% | **14.5%** |
| proper-noun tokens / 1,000 words | 101.9 | **27.1** |
| numerals / 1,000 words | 20.5 | **8.1** |
| stimuli with **zero** proper nouns | 8.3% | **29.6%** |
| stimuli invoking research framing | 34.6% | **13.0%** |
| passive-voice proxy / 1,000 | 8.62 | 6.32 |

Top-400 official content words that appear **zero** times in this form: `study, research, however,
example, according, thus, claim, information, support, different, people, world, history, university`.

---

## 4. Option length and shape

| skill | new median option words | official | new mean | official | official p90 |
|---|---|---|---|---|---|
| Words in Context | 1.0 | 1.0 | 1.0 | 1.2 | 2 |
| Text Structure and Purpose | **20.0** | 15.0 | 21.0 | 16.8 | 27 |
| Cross-Text Connections | 22.5 | 20.0 | 22.9 | 21.2 | 31 |
| Central Ideas and Details | **19.0** | 15.0 | 18.6 | 16.6 | 26 |
| Command of Evidence | 20.5 | 21.0 | 19.2 | 22.5 | 39 |
| Inferences | 18.0 | 16.0 | 17.6 | 17.6 | 28 |
| Boundaries | 1.0 | 2.0 | 1.8 | 2.4 | 5 |
| Form, Structure, and Sense | 2.0 | 2.0 | **3.8** | 3.1 | 8 |
| Transitions | 1.0 | 1.0 | 1.5 | 1.6 | 3 |
| Rhetorical Synthesis | **21.5** | 19.0 | 23.6 | 19.8 | 28 |

Cross-check against the 264 official **practice-test** items, where "stimulus words" in
`01_form_architecture.md` includes stem + options. Ratio of this form's full-item word count to the
official practice-test median:

| skill | new full-item median | official PT median | ratio |
|---|---|---|---|
| text-structure-purpose | 198 | 131 | **1.51×** |
| cross-text-connections | 257 | 188 | 1.37× |
| words-in-context | 90 | 66 | **1.36×** |
| central-ideas-details | 196 | 145 | 1.35× |
| inferences | 211 | 159 | 1.33× |
| rhetorical-synthesis | 210 | 161 | 1.30× |
| command-of-evidence | 200 | 176 | 1.14× |
| transitions | 72 | 65 | 1.11× |
| boundaries | 72 | 66 | 1.09× |
| form-structure-sense | 64 | 61 | 1.05× |

The Conventions/Transitions items are dead-on; **every reading skill is 1.3–1.5× oversized.**

**Length cue.** Key is uniquely longest in 5/54 (9.3%) vs official 11.7% — fine. Mean length-rank of
the key 1.815 vs official 1.929 — fine. M2Q26 correctly pads a distractor (35 / 33 / 18 / 17).

**Boundaries option shape.** 6 of 8 are a clean punctuation sweep over identical wording
(M1Q16, M1Q20, M1Q22, M2Q18, M2Q20, M2Q21). Two are not: M1Q18 varies `but` in/out
(`measurements,` / `measurements` / `measurements but` / `measurements, but`) and M2Q16 varies
subject–auxiliary inversion (`do these bursts` / `these bursts`). Both patterns exist officially, so
this is acceptable, but 2/8 is a higher rate of "not a pure sweep" than the spec's description implies.

**Form/Structure/Sense.** 6 of 7 are ~1–3-word options, correct. **M2Q19 is off-inventory**: four
15–17-word clause rewrites testing modifier attachment / word order. Official FSS options run median 2
words, p75 2, p90 8; only 9 of 150 official FSS items have a mean option ≥14 words, and
`05_SCHEMA_RULES.md` explicitly bans parallel-structure and illogical-comparison rewrites. This one
item is 4× the p90 option length for its skill.

**Text Structure option grammar.**

| pattern | official | this form |
|---|---|---|
| main-purpose options beginning `To` + infinitive | 108/136 (79%) | **8/8 (100%)** |
| structure/function options beginning `It` + verb | 216/248 (87%) | **4/8 (50%)** |
| `The speaker …` structure options | 8/248 (3.2%) | 4/8 (50%) — all of M1Q07 |

M1Q07 is a poem, and CB does use `The speaker` on poems (8/248), so this is defensible; but it means
the form's only two structure items split 50/50 between the two shapes rather than 87/13.
Verb choice is off: **`To evaluate` occurs once in 1,198 official items and `To report` zero times**,
yet this form uses `To evaluate` twice and `To report` once out of only eight purpose options. CB's
purpose verbs are dominated by `describe` (16), `explain` (14), `discuss` (8), `compare` (6).

**Subtype coverage gap.** The four Text Structure items are 2 main-purpose + 2 overall-structure +
**0 function-of-the-underlined**. Officially that subtype is 31 of 80 (39%) — and it is the only
legitimate use of the `[UNDERLINED]` markers outside Cross-Text. A form with zero of them reads thin.

---

## 5. Stem fidelity

All 21 distinct stems match official boilerplate **except for quote characters**:

| item | stem as written | issue |
|---|---|---|
| M1Q12 | `Which quotation from "The Winter Sessions" most effectively illustrates the claim?` | straight `"` |
| M2Q12 | `Which quotation from "The Weighbridge" most effectively illustrates the claim?` | straight `"` |
| M2Q01 | `As used in the text, what does the word "wanted" most nearly mean?` | straight `"` |

**The official prompt corpus contains 0 straight double-quote characters** (`"` count = 0 across 1,198
prompts) and uses curly `“ ”` (3 occurrences). The file is otherwise curly throughout — 148 `“ ”` pairs
in explanations, 36 curly apostrophes in options, 31 in passages, **zero straight apostrophes anywhere**.
So the file mixes conventions in exactly three places, all of them stems, all of them visible.

Whole-file quote inventory (SVG/HTML attribute quotes excluded from the judgment):

| field | `'` | `’` | `"` | `“`/`”` |
|---|---|---|---|---|
| passage | 0 | 31 | 1,066 (all inside `<svg>`/`<table>` attributes) | 4 / 4 |
| text (stems) | 0 | 4 | **6 (3 stems)** | 0 / 0 |
| options | 0 | 36 | 0 | 7 / 7 |
| explanation | 0 | 58 | 0 | 148 / 148 |

Other stem notes (not defects): `Based on the text, what can be concluded about ironworking in the
Tanbara district?` matches an attested official skeleton; `Which finding, if true, would most directly
support the researchers’ hypothesis?` is byte-exact. Both quotation-illustration stems use the same
one of the nine official shapes; CB varies (`from a work by a historian`, `from a researcher`,
`from a scholarly article`, `Which choice most effectively uses a quotation from …`).

---

## 6. Lexical tells and explanation scaffolding

### 6a. Opening-sentence shape diversity — *not* the expected failure

| opener shape | official (n=1,198) | random official 54 | **this form** |
|---|---|---|---|
| OTHER (varied) | 41.6% | 51.9% | 35.2% |
| fronted adverbial (`In 1889 …`, `Before …`) | 17.2% | 7.4% | 11.1% |
| notes lead-in | 11.9% | 11.1% | 9.3% |
| **bare researcher name** (`Marta Coll and colleagues …`) | **8.9%** | 11.1% | **0.0%** |
| definite NP (`The …`) | 6.9% | 5.6% | 7.4% |
| plural agents (`Historians have …`) | 3.8% | 5.6% | 5.6% |
| literary preamble | 3.2% | 9.3% | 7.4% |
| `Text 1` | 3.0% | 0.0% | 3.7% |
| **indefinite NP (`A team of …`)** | **2.7%** | 0.0% | **18.5%** |
| title + name (`Ecologist X …`) | 0.8% | 0.0% | 1.9% |

Shannon entropy of shape: new **2.721**, official full bank 2.590, official 54-item bootstrap mean
2.467 (p05 2.159, p95 2.753). **Diversity is fine** — the predicted "every passage opens with a named
researcher" tell is absent. What is present is the opposite, and it is worse:

- **Indefinite-NP openers: 10/54 (18.5%) vs official 2.7%.** P(X ≥ 10 | p = 0.0267, n = 54) = **1.5 × 10⁻⁶**.
  The offenders: M1Q02 *A team of engineers*, M1Q11 *A student is writing*, M1Q17 *A public library's*,
  M1Q18 *A stream gauge*, M1Q21 *A sprinter*, M2Q14 *A utility company*, M2Q15 *A lava dome*,
  M2Q18 *A map projection*, M2Q20 *A radio array*, M2Q22 *A mill weir*.
- **Bare-name openers: 0/54 vs official 8.9%.** P(X = 0) = 0.909⁵⁴ = **0.0064**.
- **Research framing anywhere in the stimulus: 13.0% vs official 34.6%.**

Read together: this vendor systematically replaces CB's *named agent doing a dated thing* with a
*generic indefinite noun phrase*. `researchers found` 0/54, `Which is to say` 0/54, `In other words`
0/54 — the classic AI phrasal tells are all clean. The tell is structural, not phrasal.

### 6b. Proper-noun starvation, by skill — the single loudest signal

| skill | new proper nouns /1k | official | new % items with **zero** | official | new numerals /1k | official |
|---|---|---|---|---|---|---|
| **Transitions** | **0.0** | 93.0 | **100%** | 13% | 3.2 | 14.8 |
| **Boundaries** | **15.3** | 125.8 | **62%** | 11% | 0.0 | 16.0 |
| **Form, Structure, and Sense** | **13.0** | 130.4 | **57%** | 10% | 7.0 | 16.4 |
| Inferences | 19.1 | 59.3 | 0% | 9% | 15.8 | 9.0 |
| Text Structure and Purpose | 32.0 | 83.9 | 0% | 5% | 13.7 | 10.1 |
| Central Ideas and Details | 33.7 | 74.2 | 0% | 6% | 4.7 | 9.3 |
| Cross-Text Connections | 34.5 | 62.6 | 0% | 0% | 13.8 | 23.3 |
| Command of Evidence | 40.7 | 122.7 | 0% | 2% | 17.3 | 63.8 * |
| Words in Context | 43.8 | 86.3 | 11% | 16% | 6.4 | 11.3 |
| Rhetorical Synthesis | 44.3 | 112.5 | 0% | 1% | 11.8 | 20.0 |

\* Command-of-Evidence numeral rate is confounded: official quantitative stimuli carry the table values
inline as text, while this form's live in `<table>`/`<svg>` markup that was stripped before counting.

Official Conventions items are *about named things*: Samuel Coleridge-Taylor, the Alaska Highway, the
prime meridian in 1884. This form's are about *wool fibers*, *a stream gauge*, *a map projection*.
That is the difference a tutor feels immediately, even without being able to name it.

### 6c. Explanation scaffolding

| measure | official (n=1,192) | **this form** |
|---|---|---|
| opener `Choice X is the best answer …` | **100%** | **0%** |
| opener `Choice X is correct …` | 0% | **100%** |
| opener `Choice X (word) is …` (parenthetical restatement) | **0 / 1,192** | **9 / 54** |
| share of rationale sentences beginning `Choice X` | 41.0% | **64.5%** |
| free (non-`Choice`) explanatory sentences per rationale | 5.45 | **2.17** |
| distinct opening trigrams among those free sentences | 4.50 | 2.17 |
| rationale words, median | 176 | 156 |
| rationale sentences, mean | 8.9 | 6.0 |
| — Words in Context rationale, median words | **246** | **155** |
| — Inferences | 290 | 203 |
| — Command of Evidence | 264 | 176 |
| — Text Structure and Purpose | 228 | 188 |
| banned words (`tricky`, `trap`, `you`, `misstates`, `distorts`) | — | **0** ✔ |

The rationales are correct in content and clean of the forbidden vocabulary, but they are **36% shorter
than CB's and 1.6× more scaffolded**. Where CB writes five free sentences of textual reasoning per
rationale and opens them five different ways, this form writes two. The `Choice A (diverse) is correct`
parenthetical restatement appears **nowhere** in 1,192 official rationales.

Note for the record: `is correct` is the *repo* house style (Tests 3, 4, 5, 6, 8 all use it; Test 10
uses the official `is the best answer`). So this is a house-vs-CB conflict, not vendor sloppiness — but
it is still the thing that makes a printed page not look like a printed CB page.

---

## 7. Topic and voice diversity

Domain mix, by hand classification of all 54 stimuli:

| domain | items | share |
|---|---|---|
| natural science (eco, materials, planetary, hydro, glacio, volcano, ornith, sleep, entomo, astro, fisheries, biomech, paleoclim, myco) | 27 | 50% |
| social science (archaeology, econ, linguistics, library/museum/cartography, behavioural econ) | 13 | 24% |
| humanities / art history (jazz, Korean ceramics, dance notation, textile) | 6 | 11% |
| history / primary source (labour, port trades, ropewalks) | 3 | 6% |
| literature | 5 | 9% |

Balanced, international, Global-South-inclusive, and no official topic is reused. **Literary placement
is correct**: exactly four `The following text is …` preambles at M1Q05 (novel), M1Q07 (**poem** ✔),
M2Q01 (short story), M2Q08 (short story), plus two literary Command-of-Evidence quotation items
(M1Q12, M2Q12) — the official pattern. No literary passage appears in Conventions, Transitions, or
Rhetorical Synthesis. ✔

**But every topic is used exactly twice.** Hand-traced pairs: urban ecology (M1Q01/M1Q10), materials
(M1Q02/M1Q13), planetary (M1Q03/M1Q08), labour history (M1Q04/M1Q09/M1Q11 — a *triple*), Andes
archaeology (M1Q06/M1Q14), mycology (M1Q15/M1Q23), textile history (M1Q16/M1Q24), library science
(M1Q17/M1Q27), hydrology (M1Q18/M1Q25), biomechanics (M1Q21/M1Q26), ornithology (M2Q02/M2Q13),
Sahel metallurgy (M2Q03/M2Q09), behavioural economics (M2Q04/M2Q14), museum studies (M2Q05/M2Q10),
glaciology (M2Q06/M2Q11), volcanology (M2Q15/M2Q23), sleep science (M2Q16/M2Q24), cartography
(M2Q18/M2Q25), Korean ceramics (M2Q21/M2Q26), freshwater fisheries (M2Q22/M2Q27).

Quantified: pairs of stimuli in the same form sharing ≥3 content words that are rare in the official
corpus (document frequency < 12/1,198):

| | pairs with ≥3 shared rare words |
|---|---|
| **this form** | **7** |
| official 54-item sample (300 draws) | mean 0.6, median 0, p95 **2**, max 4 |

The worst: M2Q22 ~ M2Q27 share `gravel, lake, reservoir, spawn, spawning`; M2Q15 ~ M2Q23 share
`eruption, survey, swelling`; M2Q03 ~ M2Q09 share `belt, furnaces, mounds, savanna`. A student sitting
this form meets the same reservoir, the same lava dome, and the same Sahelian smelting furnaces twice.

---

## 8. Originality — clean

Max token-Jaccard of each new stimulus against all 1,198 official stimuli (content tokens, stop-listed):

| rank | new item | max Jaccard | nearest official neighbour (qid / skill) |
|---|---|---|---|
| 1 | M1Q27 | 0.141 | `4f9ee1dc` / Rhetorical Synthesis |
| 2 | M1Q26 | 0.139 | `b44141cf` / Rhetorical Synthesis |
| 3 | M1Q11 | 0.138 | `0147b080` / Command of Evidence |
| 4 | M2Q27 | 0.128 | `49fe306b` / Rhetorical Synthesis |
| 5 | M2Q26 | 0.119 | `064c8999` / Rhetorical Synthesis |
| 6 | M1Q05 | 0.117 | `3bd32343` / Words in Context |
| 7 | M2Q10 | 0.115 | `0147b080` / Command of Evidence |
| 8 | M2Q25 | 0.113 | `e6b57c9b` / Rhetorical Synthesis |
| 9 | M1Q03 | 0.105 | `a40c7aa3` / Transitions |
| 10 | M2Q01 | 0.100 | `1d9a09c0` / Text Structure and Purpose |

Mean max-Jaccard across the 54 = **0.072**; the official bank's own internal baseline (54 random items
vs the rest) is **0.089**, max 0.220. Every top-10 hit is boilerplate overlap (`While researching a
topic, a student has taken the following notes`, `A student is writing … and wants to`), not content
overlap. **No stimulus reuses an official topic, finding, name, or distinctive phrase.** Fail threshold
0.52 is not approached. Transition option pool: all 24 options drawn from the attested official pool,
no invented connectives. No collisions with `/tmp/avoid_names.txt`.

Within-form near-duplication is also below threshold (max pairwise 0.135, M2Q22 ~ M2Q27), though the
mean is elevated (0.0123 vs official 54-sample 0.0088) — the signature of the topic pairing in §7,
not of copying.

---

## 9. Form architecture (checked in passing)

✔ Domain order C&S → I&I → SEC → EOI, both modules, no interleaving.
✔ Skill order inside C&S, I&I, EOI.
✔ SEC opens FSS, closes Boundaries (M1 and M2).
✔ Difficulty monotone non-decreasing inside every skill block and across the SEC domain.
✔ Longest same-letter run 2 (spec target ≤2).
✘ Difficulty totals: M1 8E/10M/9H and M2 7E/11M/9H vs blueprint 6/15/6 and 5/14/8.
✘ Answer key over-balanced (below).
✘ SEC alternation too perfect (below).

| module | SEC sequence | alternations | alternation rate |
|---|---|---|---|
| PT2 M1 | `FFBFFBBFB` | 5 | 0.62 |
| PT2 M2 | `FBFBFBBBB` | 5 | 0.62 |
| PT3 M1 | `FBBBFBB` | 3 | 0.50 |
| PT3 M2 | `FFFBBBFFBB` | 3 | 0.33 |
| PT4 M1 | `FFBFBFBB` | 5 | 0.71 |
| PT4 M2 | `FBBBBFFB` | 3 | 0.43 |
| PT5 M1 | `FFFFBB` | 1 | 0.20 |
| PT5 M2 | `FBFBBBFF` | 4 | 0.57 |
| **Exam 9 M1** | **`FBFBFBFB`** | **7** | **1.00** |
| **Exam 9 M2** | **`FBFBFBB`** | **5** | **0.83** |

Official alternation rate spans 0.20–0.71 across eight modules. Exam 9 M1 alternates **perfectly** —
never observed in any official module.

| module | key string | A/B/C/D | longest run | runs ≥ 2 |
|---|---|---|---|---|
| official range (33 items) | — | A 6–14, B 3–13, C 4–11, D 6–10 | 4 in 4/8 modules | 4–10 (mean 6.5) |
| **Exam 9 M1** | `ADADBDCACBDACBBCADBDCBBDCAC` | **6/7/7/7** | **2** | **2** |
| **Exam 9 M2** | `CAABDACBDBCADBBCDBDCDACBDAC` | **6/7/7/7** | **2** | **2** |

Under random assignment of 27 items: P(letter counts = {6,7,7,7}) = 0.026 → **0.00068** for both
modules; P(longest run ≤ 2) = 0.26 → **0.068** for both; P(runs ≥2 count ≤ 2) = 0.046 → **0.0021**
for both. The spec's own note is explicit: *"There is clearly no per-module key-balancing constraint —
balance emerges only at pool level."* This key was balanced by machine and it looks it.

---

# RANKED STYLE TELLS, with surgical fixes

Ranked by how fast an experienced SAT tutor would notice.

### 1. Conventions and Transitions stimuli have no proper nouns and no dates
**Evidence.** Transitions 0.0 proper nouns/1k vs official 93.0; 6/6 items have zero (official 13%).
Boundaries 15.3 vs 125.8, 62% zero vs 11%. FSS 13.0 vs 130.4, 57% zero vs 10%. Numerals: Transitions
3.2 vs 14.8, Boundaries 0.0 vs 16.0.
**Why it gives the form away.** Real CB Conventions items are miniature nonfiction paragraphs about a
named person, place, work, or institution with a date attached. A whole block of "wool fibers / a
stream gauge / a map projection" reads like a grammar workbook.
**Fix — name the agent in at least 5 of 6 Transitions and 5 of 8 Boundaries items.** Exact replacements
(names checked clear against `/tmp/avoid_names.txt`):

- **M1Q23** → `Fungi that live inside plant leaves without harming them are called endophytes.
  Mycologist Rufaro Chigwedere has catalogued more than four hundred of them in the cool-season
  pasture grasses of the Eastern Highlands. ______ one endophyte she recovered from a fescue in 2019
  produces alkaloids that make the grass unpalatable to the insects that feed on it.`
- **M1Q24** → replace sentence 2 with `The fullers of Ypres exploited that behavior from the thirteenth
  century on, shrinking loose-woven cloth into the dense, weatherproof fabric they sold across northern
  Europe.`
- **M1Q25** → replace sentence 1 with `The water level in an irrigation well on the Konya Plain climbs
  back to nearly its former height within hours after the pump shuts off.` and sentence 2 with
  `Most of the water around that well, hydrologist Emine Doğanay reports, sits in clay layers that
  surrender it over years.`
- **M1Q17** → replace sentence 1 with `The local-history room of the Nyeri Municipal Library holds
  items no other institution has: parish registers, shop ledgers, election posters from 1963.`
- **M1Q18** → replace sentence 1 with `A gauge installed on the Ellerby in 1974 records how high the
  water stands at one fixed point on the bank.`
- **M1Q19** → open `In Malawi and Zambia, the cost of a market basket rises sharply …`
- **M1Q22** → `Caves are among the few places on land where a continuous record of past climate
  survives. The oxygen locked in the calcite layers of a stalagmite taken from Bramble Hole …`
- **M2Q15** → `The lava dome that has been growing in the crater of Mount Sarangan since 2011 rises by
  slow extrusion rather than explosive eruption …`
- **M2Q18** → `A navigator plotting an ocean crossing wants the Mercator ______ sailors have relied on
  since the sixteenth century …`
- **M2Q23** → `Before an eruption, magma rising into a volcano's plumbing pushes the ground surface
  outward by a few centimeters. The Sentinel-1 satellites can measure that swelling across a whole
  mountain from orbit, at a cost far below that of a ground survey.`

Target after the fix: Transitions ≥ 60 proper nouns/1k, Boundaries and FSS ≥ 80, zero-proper-noun rate
across the form ≤ 15%.

---

### 2. Words in Context uses passage length as its difficulty knob
**Evidence.** Median 72 words vs official 53 (+36%); by difficulty 53 / 69 / **97** vs official
51 / 49 / **55**. Three of nine items above p90 (M1Q05 112, M2Q01 88, M2Q04 82). 4.0 sentences per
stimulus vs 2.3 official; 20.8 words per sentence vs 28.3.
**Why it gives the form away.** Every tutor teaches that hard vocabulary-in-context items are *short*.
A 112-word hard WiC item is not a College Board item.
**Fix.**
- **M1Q05** (112 w): cut the second and third narrative sentences; keep the preamble, one scene
  sentence, and the sentence containing the blank. Target 58–62 words.
- **M2Q01** (88 w): drop the orienting gloss sentence about the stationer's shop and merge the two
  descriptive sentences. Target 55 words.
- **M2Q04** (82 w): compress the two set-up sentences into one 26–28-word subordinated sentence.
  Target 58 words.
- **M1Q03 / M1Q04 / M2Q02 / M2Q03** (66/72/65/75 w): each is currently three or four short sentences.
  Merge to two, each 24–28 words. Target 52–58 words.
- Rule for the rewrite: **two sentences, not four**; put the blank at the end of a subordinated second
  sentence.

---

### 3. The parenthetical gloss is missing
**Evidence.** `(` at 0.24 per 1,000 words vs official 5.25 — a **22× deficit**. One glossed term in 54
items (M1Q09) versus 25% of official stimuli. Meanwhile semicolons run 2.27× official and colons 1.18×.
**Why it gives the form away.** The inline parenthetical gloss is CB's most recognizable prose habit:
`logging (cutting down trees for commercial and other uses)`, `the Burgess Shale, a site in the
Canadian Rockies that is rich in fossils`.
**Fix — convert ten existing appositives/dashes to parenthetical glosses.** Add roughly 21 `(`
characters across the form (4,115 words × 5.25/1,000 ≈ 22).

| item | current | replace with |
|---|---|---|
| M1Q06 | `small stone storehouses, or qollqa, along the ridges` | `small stone storehouses (qollqa) along the ridges` |
| M1Q13 | `Creep — the slow deformation of a solid held under load at high temperature — occurs` | `Creep (the slow deformation of a solid held under load at high temperature) occurs` |
| M1Q15 | `plant them in limed soil` | `plant them in limed soil (soil dosed with ground limestone to raise its pH)` |
| M1Q19 | `the cost of a market basket` | `the cost of a market basket (the fixed set of staples used to track food prices)` |
| M1Q22 | `a stalagmite's calcite layers` | `the calcite layers of a stalagmite (a column built up from a cave floor by dripping water)` |
| M1Q23 | `Botanists call these fungi endophytes` | `these fungi (endophytes)` |
| M2Q03 | `Smelters in the savanna belt of the western Sahel` | `Smelters in the savanna belt (the band of dry grassland south of the Sahara)` |
| M2Q11 | `shields the ice beneath it` | `cumulative mass balance (a running total of a glacier's yearly gains and losses of ice)` in the lead sentence |
| M2Q21 | `Buncheong ware, the stoneware made in Korean village kilns during the fifteenth century, is admired` | `Buncheong ware (a stoneware made in Korean village kilns during the fifteenth century) is admired` |
| M2Q23 | `a volcano's plumbing` | `a volcano's plumbing (the network of cracks and chambers beneath the summit)` |

---

### 4. Conventions locked to two sentences, Transitions locked to three
**Evidence.** 14/15 SEC items are exactly two sentences (official 43% one-sentence / 49% two);
6/6 Transitions are exactly three (official 43% two / 48% three). Words per sentence below official in
**all ten** skills; aggregate 19.8 vs 22.6.
**Fix — convert six SEC items to a single architecturally complex sentence** (the CB signature), and
two Transitions items to two sentences.
- **M1Q16** → `Before synthetic dyes reached the mills of the Scottish Borders in the 1860s, weavers
  there drew their reds and purples from lichens scraped off rocks, and cloth colored with these
  lichen ______ kept a faint smell of ammonia for months.` (one sentence, 46 words)
- **M1Q18, M2Q18, M2Q16, M1Q15, M2Q17** — same treatment: subordinate the first sentence into the
  second with `Because …,` / `Although …,` / `Since …,` so the blank sits inside one 40–52-word period.
- **M1Q23 and M2Q22** → collapse the first two sentences into one 26–30-word sentence, keeping the
  blank at the head of a second sentence (Transitions two-sentence form, 43% of official items).

---

### 5. Rationale house style is not CB's
**Evidence.** `Choice X is correct` in 54/54; **`Choice X is the best answer` in 1,192/1,192 official**.
`Choice A (diverse) is correct` parenthetical in 9/54; **0/1,192 official**. 64.5% of rationale
sentences begin `Choice X` vs 41.0% official. 2.17 free explanatory sentences per rationale vs 5.45.
Words-in-Context rationales 155 words vs 246.
**Fix.**
- Global replace `Choice A is correct.` → `Choice A is the best answer because …` (and B/C/D), and
  `Choice A (diverse) is correct.` → `Choice A is the best answer because as used in the text,
  "diverse" most nearly means …`. *Caveat:* Tests 3–8 in this repo all use `is correct`; only Test 10
  uses the CB form. Decide once, at repo level, and make Exam 9 match whichever is chosen — but the
  CB-faithful choice is `is the best answer`.
- Add **two to three free explanatory sentences** per rationale before the `Choice B is incorrect`
  block, varying their openings across the form. CB's most common free openers, in proportion:
  `The text indicates that …` (1.2%), `According to the text, …` (0.7%), `The text states that …`
  (0.6%), `This choice uses a …` (0.5%), `The text explains that …` (0.5%), `The text begins by …`
  (0.4%), `The text goes on to …` (0.3%). Target: ≥ 4.5 free sentences per rationale, ≥ 4 distinct
  opening trigrams, WiC rationales ≥ 220 words.

---

### 6. The answer key is machine-balanced
**Evidence.** 6/7/7/7 in **both** modules (P = 0.026 each, 0.00068 jointly); longest run 2 in both
(P = 0.068 jointly); only 2 runs of length ≥2 per module against an official 4–10 (mean 6.5 per 33
items, ≈5.3 scaled to 27). Official per-module letter counts range A 6–14, B 3–13, C 4–11, D 6–10.
**Fix.** Re-letter to introduce realistic lumpiness. Concrete: in M1, swap the option order of Q13 and
Q14 so the key reads `…D A C C B B C…` (creating one run of 3), and re-letter Q19/Q20 to give the
module counts A 8 / B 6 / C 7 / D 6. In M2, re-letter Q4, Q11 and Q17 to produce one run of 3 and
counts A 6 / B 9 / C 6 / D 6. Target per module: one run of 3 or 4, five to six runs of ≥2, and a
letter spread of at least 3 between the most and least frequent letter.

---

### 7. Semicolon over-use with quotation under-use
**Evidence.** Semicolon 2.43/1k vs 1.07 (2.27×); double quote 0.97/1k vs 3.35 (0.29×); comma 38.9 vs
48.3 (0.81×); colon 4.37 vs 3.70.
**Fix.** Remove six of the ten semicolons — the two in **M2Q08**, the two in **M2Q14**, one of
{M1Q26, M1Q27}, and the one in **M1Q05** — replacing each with a period or a comma-plus-conjunction.
Keep M2Q20 (complex series, structurally required). Then add quoted material to reach ~14 `“`:
- **M1Q04**: `Historians have long treated the strike fund … as a “war chest,” money kept in reserve …`
- **M1Q20**: name and quote the drummer's phrase for the fills.
- **M2Q05**: quote one museum label verbatim (`the label now reads “maker unrecorded”`).
- **M2Q07**: quote the rising particle itself in Text 1.
- **M1Q06**: quote the colonial administrator's term for the storehouse contents.

---

### 8. The Conventions block alternates too perfectly
**Evidence.** M1 `FBFBFBFB` — alternation rate 1.00; M2 `FBFBFBB` — 0.83. Official range across eight
modules 0.20–0.71 (`FFBFFBBFB`, `FFFFBB`, `FFFBBBFFBB`).
**Fix.** Reorder M1's SEC block to `FFBFBFBB` (PT4 M1's actual sequence) by moving Q17 (FSS, easy)
to slot 16 and Q16 (Boundaries, easy) to slot 17 — difficulty monotonicity is preserved because both
are Easy. Reorder M2 to `FFBFBBB` by swapping Q16 and Q17. Both still open FSS and close Boundaries.

---

### 9. Every topic is used exactly twice
**Evidence.** 20 topic pairs across 54 items, including a labour-history triple (M1Q04/M1Q09/M1Q11).
Seven pairs share ≥3 rare content words; the official 54-item expectation is 0.6 (p95 = 2, max 4).
**Fix.** Break the eight most lexically visible pairs by re-topicking the *second* member of each,
which is always a Conventions/Transitions/RS item and therefore cheapest to rewrite:
M2Q27 (fisheries → freshwater mussel translocation), M2Q23 (volcanology → tide-gauge geodesy),
M2Q09 (Sahel metallurgy → Swahili-coast coral masonry), M1Q25 (hydrology → soil-moisture remote
sensing), M1Q24 (textile → parchment preparation), M1Q27 (library science → archival provenance is
fine, but change the named institution), M2Q26 (Korean ceramics → Japanese lacquer), M1Q26
(biomechanics → rowing-shell rigging). Retest: pairs with ≥3 shared rare words must fall to ≤ 2.

---

### 10. Straight quotes in three stems
**Evidence.** M1Q12, M2Q12, M2Q01 use `"`; the rest of the file (148 explanation quote pairs, 36
option apostrophes) is curly; the official prompt corpus contains **zero** straight double quotes.
**Fix.** Byte-exact replacements:
- M1Q12 → `Which quotation from “The Winter Sessions” most effectively illustrates the claim?`
- M2Q12 → `Which quotation from “The Weighbridge” most effectively illustrates the claim?`
- M2Q01 → `As used in the text, what does the word “wanted” most nearly mean?`
Also vary one of the two quotation-illustration stems to a second attested official shape, e.g.
M2Q12 → `Which choice most effectively uses a quotation from “The Weighbridge” to illustrate the claim?`

---

### 11. Generic indefinite-NP openers replace CB's named agents
**Evidence.** `A …` openers 10/54 (18.5%) vs official 2.7%, P = 1.5 × 10⁻⁶. Bare-name openers 0/54 vs
8.9%, P = 0.0064. Research framing anywhere 13.0% vs 34.6%.
**Fix.** Convert four of the ten to CB's canonical bare-name opener (`<Full Name> and colleagues
<verb-past> …`) and three to fronted adverbials:
- M1Q02 → `Nadira Solmaz and colleagues coated steel plates with a thin ceramic film …`
- M2Q14 → `In 2019 a utility company serving 60,000 households printed on each customer's monthly bill …`
- M2Q20 → `Astronomers building the Kestrel Array for low frequencies must overcome three obstacles at once …`
- M1Q21 → already has `Biomechanist Yohanna Adeyemi`; move the name to the head of the passage.
- M2Q22 → `For sixty years a mill weir stood across the only cold tributary …`
- M1Q17, M1Q18, M2Q15, M2Q18 — covered by fix #1.
Target: indefinite-NP openers ≤ 4/54, bare-name openers 4–6/54, research framing 30–38%.

---

### 12. Reading options and reading stimuli are 1.3–1.5× oversized
**Evidence.** Full-item word count vs the official practice-test median: Text Structure 1.51×, Words in
Context 1.36×, Cross-Text 1.37×, Central Ideas 1.35×, Inferences 1.33×, Rhetorical Synthesis 1.30× —
against Conventions at 1.05–1.11×. Option medians: TSP 20 vs 15, CID 19 vs 15, RS 21.5 vs 19.
**Fix.** Trim every Text Structure and Central Ideas option to ≤ 17 words (cut the trailing
qualifying clause; CB's structure options carry three verbs and no adjunct). Trim Rhetorical Synthesis
options to 18–20 words except the deliberately padded pair in M2Q26.

---

### 13. Command of Evidence is short and flat
**Evidence.** Median 78 vs 105; hard items 95 vs official hard median 120; IQR 21 vs 48; words per
sentence 24.7 vs official 33.8 — CB's densest prose type is here its second-thinnest.
**Fix.** Lengthen M1Q13 (111 → 130) and M2Q12 (79 → 110) by adding the claim-plus-qualification clause
CB uses (`…, a result that would follow only if …`). Lengthen M2Q10's lead-in from 72 to ~95 words.
Add one 30+-word sentence to each of the three quantitative items.

---

### 14. Within-skill variance is compressed everywhere
**Evidence.** Standard deviation of stimulus length, new vs official: Text Structure 5.8 vs 19.9,
Rhetorical Synthesis 2.6 vs 17.6, Transitions 2.7 vs 9.1, Inferences 8.4 vs 20.3, Command of Evidence
15.9 vs 36.4, FSS 4.8 vs 12.4.
**Fix.** Deliberately place one short and one long outlier per skill: one 60-word Text Structure item,
one 150-word Command of Evidence item, one 66-word and one 110-word Rhetorical Synthesis note block,
one 30-word FSS item. CB's forms are lumpy; this one is extruded.

---

### 15. M2Q19 is an off-inventory Form/Structure/Sense item
**Evidence.** Four 15–17-word clause rewrites testing modifier attachment and word order. Official FSS
options: median 2 words, p75 2, p90 8; only 9/150 items have mean option ≥14 words. `05_SCHEMA_RULES`
bans parallel-structure and illogical-comparison rewrites outright.
**Fix.** Replace with a subject–verb agreement item on the same topic and the official option shape —
plant a number-mismatched noun immediately before the blank:
`Movement can be written down in symbols much as music is, but the notation systems in use disagree
about what a score should record. In the Kósa system the three planes of movement, each given a column
of its own, ______ read left to right across the page.` — options `are` / `is` / `has been` / `was`
(key `are`).

---

### 16. No "function of the underlined portion" item
**Evidence.** The four Text Structure items are 2 purpose + 2 structure + **0 function**; officially
that subtype is 31/80 (39%) and it is the only legitimate use of `[UNDERLINED]` outside Cross-Text.
**Fix.** Convert M2Q05 to `Which choice best describes the function of the underlined sentence in the
text as a whole?`, mark the museum-label sentence with `[UNDERLINED]…[/UNDERLINED]`, and re-cut the
four options to `It …` + verb.

---

### 17. Purpose-option verbs are off-distribution
**Evidence.** `To evaluate` appears **1 time in 1,198** official items; `To report` **0 times**. This
form uses `To evaluate` twice and `To report` once in only eight purpose options. CB's distribution:
`describe` 16, `explain` 14, `discuss` 8, `compare` 6, `argue` 5, `show` 5.
**Fix.** M1Q06 distractor `To evaluate the colonial documents …` → `To assess the colonial documents …`
is not enough; use `To compare the colonial documents historians have relied on with the evidence
recovered from the storehouse floors`. M2Q05 key `To report a study of visitor behavior …` →
`To describe a study of visitor behavior bearing on how museums can acknowledge gaps in their records`.
M2Q05 distractor `To evaluate a curator's decision …` → `To explain why a curator rewrote the labels
in one part of a museum's permanent collection`.

---

### 18. Rhetorical Synthesis note blocks have no variance
**Evidence.** 5/5 items have exactly five bullets; every bullet is 12–17 words (official median 14,
p10 8, p90 20). Block length flat at 87/85/86 words across Easy/Medium/Hard vs official 72/93/98.
**Fix.** M2Q25 (Easy) → four bullets, two of them 8–10 words, total 70 words. M1Q27 and M2Q27 (Hard)
→ six bullets, one of them 20–22 words, total ~100 words. Leave the Medium items at five.

---

### 19. Prose register is measurably plainer than CB's
**Evidence.** Mean word length 4.80 vs 5.09; words ≥8 characters 14.5% vs 20.4%; sentence-initial
`And`/`Yet`/`So`/`Instead` 0.00/1k vs 0.26/1k combined; `however` absent entirely.
**Fix.** Largely follows from fixes 1, 3 and 4 (proper nouns, glossed technical terms and subordinated
sentences all raise word length). Additionally, allow two or three sentence-initial `But` / `Instead`
constructions in the reading stimuli, and restore the technical register in Command of Evidence.

---

### 20. Blueprint difficulty totals not met
**Evidence.** M1 is 8 Easy / 10 Medium / 9 Hard against the blueprint's 6/15/6; M2 is 7/11/9 against
5/14/8. Ordering, monotonicity and domain totals are all correct.
**Fix.** Re-band two M1 Easy items to Medium (M1Q02, M1Q17) and three M1 Hard to Medium (M1Q07,
M1Q13, M1Q22), and equivalently in M2, or update the blueprint. This is a metadata edit, not a rewrite,
but it changes the difficulty ramp the adaptive engine sees.

---

## What is *right* — do not touch

- Originality: max Jaccard 0.141 against 1,198 official stimuli; no name, topic or finding reused.
- Em-dash rate (3.65 vs 3.67) and paired/single split (50% vs 43%).
- Blank placement in Conventions and Transitions (final sentence, first word for Transitions, mean
  relative position 0.51 vs 0.47–0.50).
- Transition option pool: all 24 options attested in the official bank; six distinct keyed relations,
  no repeats, no conditionals.
- Boundaries punctuation-sweep architecture in 6 of 8 items.
- Length cue: key uniquely longest in 9.3% vs official 11.7%; mean key length-rank 1.815 vs 1.929.
- Domain order, skill order, SEC opening/closing skill, difficulty monotonicity, literary placement
  (four preambles including one poem, none in Conventions/Transitions/RS).
- Explanation vocabulary: zero uses of `tricky`, `trap`, second-person `you`, `misstates`, `distorts`.
- Opening-sentence-shape entropy 2.721 — inside the official 54-item bootstrap band (p05 2.159,
  p95 2.753).
