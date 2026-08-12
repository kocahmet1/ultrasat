# FORM AUDIT — Practice Test 10 R&W (`scripts/data/practiceTest10RW.json`)

**Scope:** whole-form fidelity only (statistical + stylistic fingerprint). Item-level correctness is
out of scope and is being reviewed separately.

**Reference corpora**
- `bank.json` — 1,200 official Question Bank items with rationales (1,199 usable after cleaning).
- `STYLE_SPEC.md` — the measured target.
- `EXEMPLARS_*.md` — official items with rationales.

**Method note.** Official stimuli are stored as one string containing stimulus + stem, and
quantitative COE items contain OCR'd graphic text. I strip the stem with a stem-pattern regex and
strip graphic OCR with a function-word-density scanner; items still failing a function-word floor
(1 of 1,200) are dropped. Calibration: my computed official means reproduce the STYLE_SPEC table to
within 1–2 words for 8/10 skills (WIC 55.0 vs spec 55, TSP 92.2 vs 93, CID 90.9 vs 91, INF 93.5 vs
95, BND 43.4 vs 44, FSS 41.1 vs 41, TRN 52.3 vs 53, CTC 136.2 vs 140). COE and RS differ because the
spec appears to have counted graphic captions / the RS goal sentence; I therefore compare authored
vs. **my own** official numbers, computed identically on both sides. Authored stimuli are stripped of
`<table>…</table>`, `<svg>…</svg>`, and `[UNDERLINED]` markers before counting.

Authored corpus: 54 stimuli, 4,011 prose words. Official corpus: 1,199 stimuli, 79,528 prose words.
Where a form-wide official figure is quoted as "reweighted," it is re-weighted to the authored
skill mix (8 WIC / 4 TSP / 2 CTC / 4 CID / 8 COE / 2 INF / 8 BND / 7 FSS / 6 TRN / 5 RS).

---

## 1. Stimulus length distribution — **FAIL**

Prose word count per stimulus, markup stripped.

| Skill | src | n | mean | median | p10 | p25 | p75 | p90 |
|---|---|---|---|---|---|---|---|---|
| WIC | OFFICIAL | 166 | 55.0 | 51.0 | 38 | 44.0 | 58.0 | 78.0 |
| WIC | **authored** | 8 | **62.8** | 63.0 | 58.7 | 59.0 | 66.0 | 66.6 |
| TSP | OFFICIAL | 96 | 92.2 | 90.0 | 73 | 80.0 | 98.0 | 123.5 |
| TSP | **authored** | 4 | **107.2** | 105.0 | 103 | 103.0 | 109.2 | 113.3 |
| CTC | OFFICIAL | 38 | 136.2 | 137.5 | 123.4 | 128.2 | 142.8 | 149.3 |
| CTC | authored | 2 | 141.5 | 141.5 | — | 141.2 | 141.8 | — |
| CID | OFFICIAL | 78 | 90.9 | 88.0 | 70 | 82.2 | 97.8 | 112.1 |
| CID | **authored** | 4 | **99.5** | 98.5 | 95.9 | 97.2 | 100.8 | 103.9 |
| COE | OFFICIAL | 148 | 71.7 | 72.0 | 33 | 47.8 | 89.5 | 108.0 |
| COE | **authored** | 8 | **95.5** | 97.0 | 85.2 | 91.5 | 98.5 | 103.3 |
| INF | OFFICIAL | 74 | 93.5 | 92.0 | 66.3 | 81.0 | 109.5 | 119.7 |
| INF | authored | 2 | 89.5 | 89.5 | — | 87.8 | 91.2 | — |
| BND | OFFICIAL | 150 | 43.4 | 45.0 | 28.9 | 38.0 | 51.0 | 55.1 |
| BND | authored | 8 | 45.0 | 45.5 | 38 | 41.8 | 49.2 | 50.3 |
| FSS | OFFICIAL | 149 | 41.2 | 42.0 | 24 | 34.0 | 50.0 | 55.2 |
| FSS | authored | 7 | 43.7 | 42.0 | 40 | 40.5 | 45.5 | 49.0 |
| TRN | OFFICIAL | 157 | 52.3 | 53.0 | 42 | 48.0 | 58.0 | 61.0 |
| TRN | authored | 6 | 56.3 | 56.5 | 53.5 | 55.2 | 58.5 | 59.0 |
| RS | OFFICIAL | 143 | 76.1 | 77.0 | 53.2 | 66.0 | 86.0 | 96.0 |
| RS | **authored** | 5 | **90.4** | 92.0 | 87 | 90.0 | 92.0 | 92.6 |

**Skills whose authored mean falls outside the official p25–p75: WIC, TSP, CID, COE, RS (5 of 10).**
All five miss on the long side.

The more damning number: **the authored mean exceeds the official mean in 10 of 10 skills.** Under a
null of unbiased authoring that is a sign test at p = 2⁻¹⁰ ≈ 0.001. Weighted form-wide inflation is
+12%.

COE broken out by sub-type (official / authored means):

| COE sub-type | OFFICIAL mean (p25–p75) | authored | verdict |
|---|---|---|---|
| quantitative (table/graph) | 77.7 (58–96) | 98.0 (n=4: 98,100,96,98) | above p75 |
| textual-claim ("which finding") | 89.1 (80.5–105) | 102.0 (n=2: 93,111) | inside |
| quotation | 56.0 (29–84) | 84.0 (n=2: 81,87) | at/above p75 |

Also note the authored **spread** is nearly nonexistent: WIC ranges 58–68 (official 38–78+); COE
ranges 81–111 (official ~20–150). Every stimulus is written to roughly the same target length.

### Does the form make hard items hard by making them long? — No, but for the wrong reason

| Bucket | OFFICIAL mean | authored mean | ratio |
|---|---|---|---|
| easy | 55.8 (n=409) | 59.7 (n=9) | 1.07 |
| medium | 69.8 (n=399) | 77.4 (n=32) | 1.11 |
| hard | 73.7 (n=391) | 76.7 (n=13) | 1.04 |
| **hard / easy** | **1.32** | **1.28** | — |

The form-wide hard/easy ratio looks right, but that is a skill-mix artifact. Within skills where the
authored form has both an easy and a hard item: WIC 1.06 (official 1.03) ✓, BND 1.05 (official 1.26),
FSS 1.25 (official 1.13) ✓, **COE 0.99 (official 1.52)**. The authored COE hard items are the same
length as the easy ones.

The real pattern is that **length inflation is uniform, not difficulty-driven** — authored easy items
are +7% over official easy, medium +11%, hard +4%. The editorial floors in STYLE_SPEC §2 (WIC 50 /
TSP 75 / COE 65 / RS 70) have pushed the bottom of every distribution up against the official
*median*, deleting the entire short tail that official forms have.

**VERDICT: FAIL.**

---

## 2. Sentence-level texture — **DRIFT** (with one FAIL-grade sub-metric)

| Skill | OFFICIAL sent/stim | auth sent/stim | OFFICIAL w/sent | auth w/sent |
|---|---|---|---|---|
| WIC | 2.33 | 2.62 | 27.76 | 24.75 |
| TSP | 4.48 | 5.25 | 23.55 | 21.07 |
| CTC | 6.11 | 7.00 | 23.37 | 20.21 |
| CID | 4.12 | 5.25 | 24.29 | 21.50 |
| COE | 3.05 | 4.25 | 24.55 | 22.64 |
| INF | 4.31 | 4.50 | 23.49 | 20.23 |
| BND | 1.63 | 2.12 | 30.02 | 21.71 |
| FSS | 1.79 | 2.00 | 25.47 | 21.86 |
| TRN | 2.61 | 3.17 | 21.02 | 17.96 |
| RS | 4.97 | 7.00 | 15.37 | 12.91 |
| **form (reweighted)** | **3.04** | **3.80** | **24.54** | **20.91** |

Authored sentences are **15% shorter** and there are **25% more of them per stimulus** — and the sign
is the same in **10/10 skills for both metrics** (p ≈ 0.002 each by sign test). Combined with §1, the
authored fingerprint is "long stimulus made of many short sentences." Official is "shorter stimulus
made of fewer, longer sentences." BND is the extreme case: official 30.0 words/sentence, authored
21.7 — official Boundaries items are typically one long sentence; authored ones are two medium ones.

Within-stimulus sentence-length SD is fine (official 7.0, authored 6.6), and longest-sentence means
match (31.5 vs 30.2), so the prose is not mechanically flat — it is systematically clipped.

### Marker rates per 100 stimulus words (official reweighted to authored skill mix)

| marker | OFFICIAL | authored | ratio |
|---|---|---|---|
| **em dash** | **0.50** | **0.02** | **0.05x** |
| **parentheses** | **0.49** | **0.02** | **0.05x** |
| quotation marks | 0.39 | 0.12 | 0.32x |
| colon | 0.36 | 0.50 | 1.40x |
| but | 0.29 | 0.30 | 1.02x |
| when | 0.26 | 0.15 | 0.58x |
| while | 0.24 | 0.15 | 0.61x |
| "not …" (negation) | 0.19 | 0.42 | 2.26x |
| semicolon | 0.11 | 0.17 | 1.53x |
| because | 0.08 | 0.15 | 1.95x |
| however | 0.07 | 0.05 | 0.68x |
| although | 0.03 | 0.00 | 0.00x |
| **instead** | **0.03** | **0.15** | **4.93x** |
| though | 0.03 | 0.02 | 0.94x |
| **rather than** | **0.02** | **0.10** | **4.47x** |
| yet | 0.02 | 0.05 | 2.28x |
| whereas | 0.01 | 0.00 | 0.00x |

**The standard imitation prediction is inverted on em dashes and confirmed on "rather than."**

- **1 em dash in the entire 4,011-word form** (M1 Q17, "were different — accurate"). At the official
  rate you would expect ~20. Official uses em dashes in every skill (0.18–0.78 per 100 words).
- **1 parenthesis in the entire form** ("megapascals (MPa)", M1 Q11). Expected ~20. Official uses
  parentheses for glosses constantly: "(1898–1956)", "(ebru)", "(495 nanometers (nm))",
  "(able to tolerate high salinity)".
- Quotation marks under by 3x — official routinely quotes a term or a title inside the stimulus.
- Over-used: "rather than" 4.5x, "instead" 4.9x, negation-contrast 2.3x, "because" 2.0x,
  semicolon 1.5x, colon 1.4x.
- "although" and "whereas": **zero occurrences in 54 stimuli**. Official uses "although" in ~1 stimulus
  in 30; expected ~1.7 here, so this alone is not significant, but combined with the dash/paren
  absence it reads as a house style that avoids subordinating and parenthetical machinery entirely.

**VERDICT: DRIFT.** The prose is too clean, too clipped, and leans on one contrast device
("rather than" / "instead" / "not X but Y") where CB rotates through many.

---

## 3. Option-set fingerprint — **FAIL**

### 3a. Option lengths

| Skill | OFFICIAL mean | auth mean | spec | OFFICIAL within-item spread (max−min) | auth spread | OFFICIAL max/min | auth max/min |
|---|---|---|---|---|---|---|---|
| WIC | 1.20 | 1.12 | 1.2 | 0.03 | 0.00 | 1.02 | 1.00 |
| TSP | 15.53 | 15.88 | 15.5 | 4.10 | 1.00 | 1.35 | 1.06 |
| CTC | 18.41 | 17.75 | 18.7 | 5.11 | 0.50 | 1.36 | 1.03 |
| CID | 15.21 | 15.88 | 15.2 | 4.38 | 1.50 | 1.42 | 1.10 |
| COE | 14.99 | 15.16 | 15.6 | 4.66 | 2.00 | 1.59 | 1.16 |
| INF | 15.87 | 14.88 | 15.9 | 4.64 | 1.50 | 1.43 | 1.11 |
| BND | 2.30 | 2.38 | 2.4 | 0.35 | 0.00 | 1.25 | 1.00 |
| FSS | 2.98 | 3.36 | 3.0 | 1.11 | 1.14 | 1.82 | 1.75 |
| TRN | 1.63 | 1.54 | 1.6 | 1.27 | 1.33 | 2.21 | 2.33 |
| RS | 17.88 | 18.05 | 18.3 | 7.20 | 2.00 | 1.67 | 1.12 |

**Mean option length is essentially perfect** — every skill within 1 word of the spec. That part is a
clean PASS.

**Within-item spread is collapsed.** Across the six long-option skills (TSP/CTC/CID/COE/INF/RS,
25 authored items):

- official mean max/min = **1.51**; **54.7%** of official items exceed 1.3.
- authored mean max/min = **1.10**; **1 of 25** exceeds 1.3 (M2 Q11, lens 15/10/10/15).
- P(≤1 of 25 exceeding 1.3 | official rate 0.547) = **7.9 × 10⁻⁸**.

Typical authored option-length vectors: `[15,15,15,15]`, `[18,18,18,18]`, `[17,17,17,16]`,
`[16,16,17,17]`. Official sets look like `[12,19,15,24]`. The spec's "within ~30%" guidance has been
applied as "make them identical."

### 3b. Is the key the uniquely longest option?

| Skill | OFFICIAL | authored |
|---|---|---|
| WIC | 0.0% (0/166) | 0/8 |
| TSP | 18.8% (18/96) | 0/4 |
| CTC | 10.5% (4/38) | 0/2 |
| CID | 19.2% (15/78) | 0/4 |
| COE | 18.9% (28/148) | 0/8 |
| INF | 16.2% (12/74) | 0/2 |
| BND | 0.0% (0/150) | 0/8 |
| FSS | 2.7% (4/150) | 0/7 |
| TRN | 12.1% (19/157) | 0/6 |
| RS | 25.4% (36/142) | 0/5 |
| **ALL** | **11.3% (136/1199)** | **0.0% (0/54)** |
| **long-option skills** | **19.6% (113/576)** | **0.0% (0/25)** |

Expected under the official rate: 6.1 items form-wide, 4.9 in the long-option skills.
P(0 of 54 | p=0.113) = **0.0015**. P(0 of 25 long-option | p=0.196) = **0.0043**.

Over-correcting the "#1 tell" has produced a second, equally detectable tell: on an official form
the key is *sometimes* the longest option, because CB writes options to the argument, not to a
character budget.

### 3c. WIC option shape

| | OFFICIAL | authored | spec |
|---|---|---|---|
| all four options single words | 81.9% (136/166) | 87.5% (7/8) | 82% |
| all four ≤ 2 words | 98.8% | 100% (8/8) | — |

The one multi-word set is M2 Q3 (`shared liability / private savings / family inheritance /
state guarantees`). 7/8 vs an expected 6.6/8. **PASS** — within sampling error at n = 8.

### 3d. Answer key (not requested, but it is the most visible defect on the form)

```
M1: C A D B D C A B C D A B A C D B C A D B C A D B C A B   (A7 B7 C7 D6)
M2: B D A C B D C A D B C A D B A C D B A C B D A C D B A   (A7 B7 C6 D7)
```

**The key letter never repeats on consecutive items — not once in 54 questions.**
P(no adjacent repeat in a 27-item 7/7/7/6 sequence) = **0.00147**; for both modules independently,
**2.2 × 10⁻⁶**. Expected adjacent repeats per module ≈ 5.8, observed 0.

Worse, M1 contains a visible cycle: positions 13–27 read `A C D B | C A D B | C A D B | C A B`.
The 4-gram `CADB` occurs 3× and `DBCA` 3× in M1. A student who notices this can improve their score.

**VERDICT: FAIL.**

---

## 4. Lexical fingerprint — **DRIFT**

Weighted log-odds with informative Dirichlet prior (Monroe et al.), authored (4,011 tokens) vs
official (79,528 tokens); rates per 100k tokens.

### 4a. Top over-represented content words (n ≥ 3 in authored, sorted by z)

| word | n | rate A | rate O | ratio | z | docs/54 |
|---|---|---|---|---|---|---|
| birds | 12 | 299 | 29 | 10.3x | 6.11 | 4 |
| every | 10 | 249 | 24 | 10.4x | 5.59 | 9 |
| **argues** | 6 | 150 | 10 | **14.9x** | 4.68 | 6 |
| rock | 7 | 175 | 24 | 7.3x | 4.16 | 4 |
| copper | 5 | 125 | 10 | 12.4x | 4.12 | 1 |
| glacier | 5 | 125 | 1 | 99x | 4.08 | 1 |
| **eleven** | 5 | 125 | 1 | **99x** | 4.08 | 4 |
| scientist | 6 | 150 | 18 | 8.5x | 4.07 | 6 |
| carried | 4 | 100 | 4 | 26x | 4.05 | 4 |
| releases | 4 | 100 | 3 | 40x | 4.05 | 3 |
| match | 4 | 100 | 3 | 40x | 4.05 | 3 |
| told | 4 | 100 | 5 | 20x | 3.98 | 3 |
| set | 7 | 175 | 28 | 6.3x | 3.92 | 7 |
| pigment | 4 | 100 | 6 | 16x | 3.86 | 3 |
| minutes | 4 | 100 | 6 | 16x | 3.86 | 4 |
| carry | 4 | 100 | 6 | 16x | 3.86 | 4 |
| meant | 4 | 100 | 1 | 79x | 3.78 | 4 |
| produced | 7 | 175 | 30 | 5.8x | 3.76 | 6 |
| weeks | 4 | 100 | 8 | 13x | 3.74 | 4 |
| shown | 5 | 125 | 15 | 8.3x | 3.68 | 5 |
| river | 5 | 125 | 15 | 8.3x | 3.68 | 4 |
| village | 4 | 100 | 9 | 11x | 3.61 | 4 |
| inland | 3 | 75 | 3 | 30x | 3.52 | 2 |
| household | 3 | 75 | 3 | 30x | 3.52 | 2 |
| distinguish | 3 | 75 | 3 | 30x | 3.52 | 3 |
| settled | 3 | 75 | 4 | 20x | 3.44 | 3 |
| compound | 3 | 75 | 4 | 20x | 3.44 | 3 |
| soil | 8 | 199 | 47 | 4.3x | 3.42 | 3 |
| settlement | 3 | 75 | 1 | 60x | 3.40 | 3 |
| beans | 3 | 75 | 3 | 30x | 3.52 | 1 |

### 4b. The classic imitation watchlist — the form **passes** this

| term | n_auth | rate A | rate O | ratio |
|---|---|---|---|---|
| researchers | 3 | 75 | 206 | 0.36x |
| researcher | 0 | 0 | 29 | 0.00x |
| study | 1 | 25 | 136 | 0.18x |
| suggests | 0 | 0 | 39 | 0.00x |
| findings | 0 | 0 | 16 | 0.00x |
| team | 5 | 125 | 141 | 0.89x |
| recently | 1 | 25 | 41 | 0.60x |
| scientists | 0 | 0 | 86 | 0.00x |
| data | 0 | 0 | 74 | 0.00x |
| evidence | 0 | 0 | 54 | 0.00x |
| experiment | 0 | 0 | 21 | 0.00x |
| observed | 0 | 0 | 39 | 0.00x |

None of "researchers / study / suggests / findings / team / recently" is over-used. The author
clearly avoided them. But that avoidance created substitutes:

| substitute | ratio | docs/54 |
|---|---|---|
| **argues** | 14.9x | 6 |
| **noticed** | 9.9x | 1 |
| **hypothesize** | 6.6x | 2 |
| **instead** | 4.8x | 6 |
| **measured** | 4.4x | 2 |
| **rather** | 3.3x | 4 |
| **propose** | 2.8x | 1 |
| **colleagues** | 1.8x | 8 |

### 4c. Words appearing in more than 4 of the 54 stimuli

31 content words clear the threshold. The ones whose authored document rate is far above the
official document rate:

| word | docs/54 | auth doc % | official doc % | ratio |
|---|---|---|---|---|
| every | 9 | 16.7% | 1.4% | **11.8x** |
| argues | 6 | 11.1% | 0.7% | **16.7x** |
| scientist | 6 | 11.1% | 1.1% | **10.3x** |
| shown | 5 | 9.3% | 1.0% | **9.3x** |
| set | 7 | 13.0% | 1.8% | **7.4x** |
| produced | 6 | 11.1% | 1.6% | **7.0x** |
| second | 5 | 9.3% | 1.7% | 5.6x |
| instead | 6 | 11.1% | 2.1% | 5.3x |
| far | 5 | 9.3% | 2.0% | 4.6x |
| once | 5 | 9.3% | 2.1% | 4.4x |
| form | 5 | 9.3% | 2.2% | 4.1x |
| within | 5 | 9.3% | 2.4% | 3.8x |
| long | 7 | 13.0% | 3.8% | 3.4x |
| therefore | 5 | 9.3% | 2.8% | 3.4x |
| several | 6 | 11.1% | 3.4% | 3.3x |
| surface | 5 | 9.3% | 2.9% | 3.2x |
| water | 7 | 13.0% | 4.5% | 2.9x |
| colleagues | 8 | 14.8% | 6.8% | 2.2x |
| because | 6 | 11.1% | 5.2% | 2.2x |

(`following`, `student`, `notes`, `topic`, `researching`, `taken` are RS-boilerplate and match
official rates; ignore them.)

### 4d. Over-represented bigrams

| bigram | n | rate A | rate O | z | docs |
|---|---|---|---|---|---|
| argues that | 5 | 126 | 8 | 4.48 | 5 |
| the form | 3 | 76 | 3 | 3.61 | 2 |
| could not | 3 | 76 | 4 | 3.54 | 3 |
| had set | 3 | 76 | 1 | 3.46 | 3 |
| the village | 3 | 76 | 5 | 3.41 | 3 |
| because the | 3 | 76 | 5 | 3.41 | 3 |
| a second | 3 | 76 | 5 | 3.41 | 2 |
| of rock | 3 | 76 | 6 | 3.27 | 3 |
| at least | 3 | 76 | 8 | 3.12 | 3 |
| shown that | 3 | 76 | 9 | 2.98 | 3 |
| rather than | 4 | 101 | 22 | 2.65 | 4 |
| a single | 4 | 101 | 22 | 2.65 | 4 |
| **for eleven** | 4 | 101 | 0 | 1.24 | 3 |
| and colleagues | 7 | 177 | 98 | 1.41 | 7 |

**Specific tell: the number "eleven."** It appears in four different stimuli — M1 Q5 (*twice in one
sentence*: "For eleven years Elspeth had balanced… and for eleven years the columns…"), M1 Q18
("for eleven days"), M2 Q14 ("eleven euros a bottle"), M2 Q19 ("eleven short pieces"). Official rate
for "eleven" is 1 per 100,000 words. An expert scanning for authorial habit will find this.

**VERDICT: DRIFT.** The obvious tells were successfully suppressed; a second generation of tells
("argues," "instead," "and colleagues," "scientist," "every," "eleven") replaced them.

---

## 5. Topic distribution — **DRIFT**

Hand classification of all 54 stimuli.

| Category | M1 target | M1 actual | M2 target | M2 actual | Form target | Form actual |
|---|---|---|---|---|---|---|
| natural science | 9–10 | **13** | 9–10 | 10 ✓ | 18–20 | **23** |
| social science | 6–7 | **2** | 6–7 | **8** | 12–14 | 10 |
| humanities / arts | 5–6 | 5 ✓ | 5–6 | 5 ✓ | 10–12 | 10 ✓ |
| literature / narrative | 4–5 | **3** | 4–5 | **2** | 8–10 | **5** |
| history / civics | 2–3 | **4** | 2–3 | 2 ✓ | 4–6 | 6 ✓ |

Assignments —
**M1** nat sci: Q1, Q7, Q10, Q11, Q12, Q14, Q15, Q18, Q20, Q22, Q24, Q26, Q27 · soc sci: Q3, Q23 ·
hum/arts: Q2, Q4, Q16, Q19, Q25 · lit/narr: Q5, Q8, Q13 · hist/civ: Q6, Q9, Q17, Q21.
**M2** nat sci: Q1, Q10, Q13, Q15, Q17, Q21, Q22, Q23, Q25, Q27 · soc sci: Q4, Q5, Q6, Q7, Q11, Q14,
Q18, Q20 · hum/arts: Q2, Q9, Q19, Q24, Q26 · lit/narr: Q8, Q12 · hist/civ: Q3, Q16.

**Flags**
1. **Module 1 social science is 2 against a target of 6–7.** M1 is a physical-science module with a
   humanities garnish. Module 2 over-corrects to 8.
2. **Literature/narrative is 5 across the form against a target of 8–10.** Only three narrative
   excerpts exist (M1 Q5, M1 Q8, M2 Q8) plus two COE quotation items (M1 Q13, M2 Q12). CB puts
   literature into WIC and TSP as well; here zero WIC and zero TSP items use a literary text.
3. Module 1 natural science at 13/27 (48%) against a 33–37% target.

### Subject-matter clustering (the more serious problem)

| cluster | items | n |
|---|---|---|
| **"[Field] scientist NAME and colleagues" study** | M1 Q1, Q10, Q11, Q12, Q14; M2 Q10, Q13, Q14 | **8** |
| **birds** | M1 Q7, Q10, Q15, Q26; M2 Q27 | **5** |
| **measurement / sampling / survey error** | M1 Q3; M2 Q4, Q11, Q14, Q20 | **5** |
| **villages** | M1 Q9, Q25; M2 Q3, Q8, Q26 | **5** |
| **pigments and dyes** | M1 Q25, Q27; M2 Q9, Q17 | **4** |
| **rock / stone / mineral substrate** | M1 Q6, Q12, Q22; M2 Q7, Q10, Q25 | **6** |
| **traditional craft revived/analyzed by a named specialist** | M1 Q2, Q16, Q23, Q25; M2 Q18, Q19, Q26 | **7** |

Five items in one module turning on "a survey/estimate that systematically misses something"
(M2 Q4 accuracy vs precision, M2 Q11 the flitter survey, M2 Q14 the price-tasting study, M2 Q20
the landline poll, plus M1 Q3 registration records) is a visible authorial preoccupation. So is
"a named researcher revises an earlier belief" — see §6.

**VERDICT: DRIFT.** Category counts are recoverable with 3–4 swaps; the clustering is the real cost.

---

## 6. Rhetorical-frame repetition — **FAIL** (highest-yield finding)

### 6a. The signature opening move

| feature | OFFICIAL | OFFICIAL (reweighted) | authored | ratio |
|---|---|---|---|---|
| "[occupational title] Firstname Lastname" appositive anywhere in stimulus | 14.6% | 14.5% | **42.6% (23/54)** | **2.9x** |
| "and (her/his/their) colleagues" | 6.7% | 7.0% | **14.8% (8/54)** | 2.1x |
| first sentence contains a proper noun | 81.8% | 81.6% | **46.3%** | 0.57x |
| **generic S1 with no proper noun → titled specialist named in S2–S4** | 1.5% | 1.5% | **20.4% (11/54)** | **13.5x** |

The 11 items using that exact two-move frame: **M1 Q10, Q11, Q19, Q22, Q23, Q24; M2 Q3, Q10, Q14,
Q18, Q23.** Expected from the official rate: 0.8 items. This is the form's tic.

The 23 title+name appositives: M1 Q1 (*Atmospheric scientist Tuulikki Rantanen*), Q4 (*poet Halldor
Aasen*), Q6 (*historian Nkechi Balewa*), Q10 (*ornithologist Themba Ngwenya*), Q11 (*Materials
scientist Aarthi Ramanathan*), Q12 (*Marine biologist Nayeli Bustos*), Q16 (*Basque arranger Ainhoa
Elorza*), Q18 (*volcanologist Tuulikki Saarinen*), Q19 (*translator Zeynep Demirci*), Q22 (*Soil
scientist Tumelo Mokoena*), Q23 (*Food anthropologist Rima Haddad*), Q24 (*materials scientist Sanna
Virtanen*), Q25 (*Art historian Ketevan Dolidze*); M2 Q2, Q3, Q9, Q10, Q14, Q18, Q19, Q23, Q24, Q26.

### 6b. Hand-coded opening-move frequency table (all 54)

| frame | n | flag |
|---|---|---|
| **F1 — bare generic subject states a rule/fact in present tense** ("Ice clouds … are far thinner", "Desert amphibians cannot store…", "Astronomers sort asteroids…", "Pollsters distinguish…") | **20** | **>6 — OVER-USED** |
| F2 — named specialist first ("Printmaker Ngaire Whitiora carves…", "Literary scholar Hae-won Sohn argues…") | 6 | ok |
| F6 — dated historical opening ("In the 1840s…", "Between 1931 and 1948…") | 5 | ok |
| F7 — RS notes frame | 5 | fixed by format |
| F4 — organism/object introduced by name, then behavior | 5 | ok |
| F3 — received view stated then undercut ("Demographers long assumed…") | 4 | ok |
| F8 — definition / distinction ("Statisticians distinguish two ways…") | 4 | ok |
| F5 — literary-excerpt header + narrative | 3 | ok |
| F9 — work introduced by title/author/date | 2 | ok |

F1 items: M1 Q1, Q11, Q15, Q17, Q19, Q22, Q23, Q24; M2 Q1, Q6, Q7, Q10, Q14, Q15, Q16, Q17, Q18,
Q21, Q22, Q23.

*Honest caveat:* an automated proxy for the narrow "bare-plural generic" opener returns official
13.1% vs authored 13.0% (ratio 0.98) — the F1 bucket as I hand-coded it is broader than that proxy
and I cannot claim it is over-used relative to CB on the automated measure alone. The defensible,
fully quantified findings in this section are the four rows of table 6a.

### 6c. Argumentative frame — "old belief overturned / reassigned by new evidence"

Hand count: **18 of 54 (33%)** — M1 Q3, Q4, Q6, Q7, Q9, Q12, Q13, Q20, Q24; M2 Q3, Q5, Q6, Q7, Q9,
Q11, Q12, Q13, Q14.

That is **under half**, so the absolute test in the brief passes. But the density relative to
official does not. Applying an identical lexical proxy (presence of ≥1 revision cue: *long
assumed/believed/held*, *have long*, *no longer*, *whole story*, *others have argued*, *X hold
instead*, *not simply*, *rather than*, *usually described as*, *has now shown*, *once
thought/limited*, *contrary to*, *overturn*) to both corpora:

| | OFFICIAL | reweighted | authored | ratio |
|---|---|---|---|---|
| ≥1 revision cue | 4.8% | 4.7% | **25.9% (14/54)** | **5.5x** |
| ≥1 reversal marker (*rather than / instead / not…but / no longer / nonetheless*) | 5.5% | 5.5% | **25.9%** | **4.7x** |

Cue hits: M1 Q2 "rather than", Q3 "long assumed", Q5 "no longer", Q6 "rather than", Q7 "whole
story", Q12 "Others have argued", Q13 "have long", Q20 "once limited", Q27 "rather than"; M2 Q5
"usually described as", Q6 "no longer", Q9 "have long", Q11 "not simply", Q13 "Other entomologists
hold".

Two items use the *identical* rival-account sentence shape:
- M1 Q12 — "Others have argued **instead** that the larvae settle where they do because…"
- M2 Q13 — "Other entomologists hold **instead** that the legume acts as an obstruction…"

Both are COE textual-claim items. Both are "chemical signal vs. physical structure." That pair alone
is enough to identify a single author.

**VERDICT: FAIL.**

---

## 7. Name and setting audit — **DRIFT**

### 7a. Reuse check — clean

All 75 invented proper nouns (45 person surnames, 18 places, 6 binomials, 6 works/terms) were
checked against the full 1,200-item bank text and `AVOID_NAMES_PT10.txt`. **0 collisions.**
This part of the prohibition in STYLE_SPEC §6 is satisfied.

### 7b. Collisions *within* the form — 3 real problems

| collision | items | why it matters |
|---|---|---|
| **Ramanathan** | M1 Q11 *Materials scientist Aarthi Ramanathan* / M1 Q26 *Ecologist Priya Ramanathan* | same surname, same module, 15 items apart |
| **Tuulikki** | M1 Q1 *Atmospheric scientist Tuulikki Rantanen* / M1 Q18 *volcanologist Tuulikki Saarinen* | same Finnish given name, same module, both women, both physical-science field researchers with Finnish surnames — reads as the same person |
| **Tumelo** | M1 Q22 *Soil scientist Tumelo Mokoena* / M2 Q9 *Conservation scientist Tumelo Ramokgopa* | same Sotho-Tswana given name, both titled "…scientist" |

### 7c. Diversity — good on origin, badly skewed on gender

Origins are genuinely global: Finnish, Māori, Turkish, Icelandic, Brazilian/Portuguese, Scottish,
Igbo, Kikuyu, Norwegian, Zulu/Ndebele, Tamil, Nahuatl/Spanish, Kazakh, Basque, Sotho-Tswana,
Lebanese, Georgian, Swahili, Yoruba, Swedish, Moroccan, Punjabi, West African, Akan, Korean,
Algerian, Marathi. **Two indigenous North American references: zero.** STYLE_SPEC §4 explicitly
calls for them ("Indigenous North American communities appear regularly and are always named
specifically"); official items name the Navajo Nation, the Confederated Tribes of Siletz Indians,
Kanien'kehá:ka writers, etc.

Clusters: Nordic/Finnish 7–8 (Rantanen, Saarinen, Virtanen, Halme, Haugstad, Vessmo, Aasen,
+ Scottish Meikle); Tamil/South Asian 6 (A. Ramanathan, P. Ramanathan, Ilangovan, Chidambaram,
Rele, Kaur); Basque 3 (Elorza, Etxaide, Etxeberri); Georgian 2; Southern African 3.

**Gender: she/her 31 vs he/his 4 across the 54 stimuli = 89% female.** Official is **52%**
(422 vs 384). Roughly 40 of the ~46 named researchers/artists are female-coded. This is a
one-glance tell.

### 7d. Invented place names — a single English-pastoral register

`Hallowfen · Brackmere · Dunnet Rise · Oakstile · Redfen · Longmoor · Millbeck · Leddern · Kerraval`

Nine invented British-sounding toponyms built from the same morpheme kit (-fen, -mere, -moor,
-beck, -stile, Hallow-, Brack-, Long-, Mill-). Grouped in the same document (M1 Q10's four sites)
they read as a fantasy map, not a study area. Official items name real sites: the Provo River,
Jordanelle Dam, Ondo State, the Burgess Shale, the Dinaric Alps, Oregon.

Other invented settings are individually fine: *Velde River*, *Anzir* / *Serath*, *Tsikhori* /
*Nabadi*, *Beshkol valley* / *Tergen*, *Ostenhorn Glacier* / *Kirivaara Glacier*.

### 7e. Invented organisms and works

| name | plausibility |
|---|---|
| *Corvalia hirtula* | plausible |
| *Cladoporella tenuis* / *Petrocrusta pallida* | plausible, but *Petrocrusta pallida* = "pale rock-crust" describes exactly the property the item hinges on |
| **Fibrivorax intestinalis** | **transparently back-formed — "fiber-devourer of the gut" is precisely the fact M1 Q14 tests.** Real taxonomy is rarely this convenient; this is the one binomial that reads as invented-for-the-question |
| *Chilonoctis pallens* / *Tephronia argentea* | plausible |
| *copper-throated sunangel* | plausible (Heliangelus is a real genus) |
| *russet flycatcher* / *grey-capped tit* | plausible — **but "grey" is British spelling** |
| *tufted meadow-hen* | plausible |
| *norsan* (instrument), *ombila* (root), *mannoglucan* | plausible |

**Spelling defect:** the form uses **"grey-capped tit" (8 occurrences: M1 Q10 stimulus, options, and
explanation) but "gray powder" in M1 Q18.** The official bank runs gray 10 : grey 1. CB uses
American spelling. An internally inconsistent form that also uses a British spelling is a
verifiable, quotable defect.

### 7f. Nothing accidentally comic

No name reads as unintentionally funny. Closest are *Fibrivorax* (above) and the M1 Q10 site list
(*Hallowfen, Brackmere, Dunnet Rise, Oakstile*), which reads as whimsical when four appear in one
table.

**VERDICT: DRIFT.**

---

## 8. Explanation voice — **FAIL**

Compared 54 authored explanations against 1,200 official rationales; read 12 authored (M1 Q15, Q22,
Q26; M2 Q1, Q20, Q25 and six others) against 12 official (WIC×2, BND×2, TRN×2, INF×2, CID×2, RS×2).

### 8a. Length

| | n | mean | median | p10 | p90 | SD | min | max | sentences (mean) |
|---|---|---|---|---|---|---|---|---|---|
| OFFICIAL | 1200 | 198 | 173 | 104 | 329 | **92** | 54 | 633 | 9.6 |
| authored | 54 | **232** | 232 | 206 | 259 | **20** | 201 | 279 | 8.7 |

Official rationale length has SD 92 words; authored SD is **20**. Every authored explanation is
201–279 words. Official ranges 54–633.

Per skill, the mismatch is concentrated in Conventions and RS:

| Skill | OFFICIAL mean | OFFICIAL median | authored mean | authored range | delta |
|---|---|---|---|---|---|
| WIC | 250 | 246 | 218 | 202–236 | −13% |
| TSP | 226 | 228 | 245 | 237–259 | +8% |
| CTC | 268 | 209 | 240 | 237–242 | −10% |
| CID | 226 | 216 | 270 | 257–279 | **+19%** |
| COE | 267 | 251 | 250 | 234–263 | −6% |
| INF | 291 | 290 | 254 | 249–260 | −13% |
| **BND** | **146** | 140 | **221** | 208–237 | **+51%** |
| **FSS** | **133** | 128 | **213** | 203–223 | **+60%** |
| **TRN** | **174** | 169 | **232** | 220–243 | **+33%** |
| **RS** | **117** | 114 | **223** | 201–248 | **+91%** |

CB's Conventions and RS rationales are terse and often repeat the same rebuttal verbatim for all
three distractors ("Choice B is incorrect because no punctuation is needed between the subject and
the verb. Choice C is incorrect because no punctuation is needed between the subject and the verb.
Choice D is incorrect because…"). The authored ones write three bespoke paragraphs. That is *better
pedagogy* and *wrong voice*.

### 8b. Two different opener templates in one form

| opener | authored | OFFICIAL |
|---|---|---|
| `Choice X is the best answer.` / `…because` | 47/54 (87%) | **99.9% (1199/1200)** |
| `Choice X ("quoted option") is correct.` | **7/54** | **0/1200** |

The seven: **M2 Q1, Q2, Q3, Q4, Q5, Q6, Q7** — a contiguous block. They follow the STYLE_SPEC §5
template literally (`Choice **{letter}** ({short quote}) is correct.`) rather than the official
voice the other 47 use. A reviewer reading M2 in order hits a template change at Q1 and another
at Q8. This is the single most visible authoring seam in the form.

### 8c. Phrases that appear in the authored form and **never** in 1,200 official rationales

| phrase | authored items | official occurrences |
|---|---|---|
| `The hinge is…` | **7** (M2 Q1–Q7 block) | **0 / 1200** |
| `is not supported;` | **9** | **0 / 1200** |
| `is contradicted by the text` | **7** | **0 / 1200** |

All three are lifted verbatim from STYLE_SPEC §5's own prose. CB writes **"isn't supported"**
(0.012/rationale) and **"the text doesn't…"** (0.173/rationale). The spec's illustrative wording
became the form's fingerprint.

### 8d. Contractions — the cleanest single discriminator

| | OFFICIAL | authored |
|---|---|---|
| rationales containing ≥1 negative contraction (doesn't / isn't / can't / didn't) | **51% (443/1200 by strict match; ~74% incl. "doesn't")** | **0% (0/54)** |
| `doesn't` per rationale | 0.734 | **0.000** |
| `does not` per rationale | 0.117 | **0.463** |
| `isn't` per rationale | 0.098 | 0.000 |

Zero contractions in 54 explanations. Official rationales use "doesn't" roughly three times per four
rationales. This is mechanically detectable with one grep.

### 8e. Rebuttal structure

| feature | OFFICIAL /expl | authored /expl |
|---|---|---|
| `Choice X is incorrect because` | 1.82 | **2.61** |
| `Choice X is incorrect.` (period, no *because*) | **1.13** | **0.00** |
| `logically signals` | 0.450 | 0.111 |
| `illogically signals` | **0.338** | **0.000** |
| `The convention being tested` | 0.212 | 0.278 ✓ |
| `Instead, ` | 0.429 | 0.333 ✓ |

The authored form **never** uses the bare "Choice B is incorrect." form and **never** uses
"illogically signals," CB's standard Transitions verb pair. All six authored TRN explanations use
the identical rigid template `"X" signals … Instead, …` three times in a row — official does this in
125/157 TRN rationales, so the template itself is right, but the authored version is 100% and
+33% longer.

### 8f. Sub-checks that PASS

- **Banned constructions:** zero occurrences of "sounds awkward," "is less precise," "is not the best
  choice," "the best answer is." Clean.
- **Mechanism naming:** every rebuttal I read names a mechanism. Examples that are exactly right —
  M1 Q15: *"a semicolon cannot be paired with a comma to set off a supplementary element… has no
  subject and is not a main clause"*; M2 Q20: *"the plural pronoun 'they' does not agree in number
  with the singular antecedent 'poll'"*; M1 Q22: *"'as a result' signals that the finding… is a
  consequence of Mokoena's general claim… so the direction of the relationship is reversed."*
  This is genuinely good rationale writing.
- **Length band:** all 54 fall inside the spec's 150–320 words.
- **`Choice {letter}` opener:** all 54 literally begin with `Choice {letter}` (validator-safe).

**VERDICT: FAIL** — on voice (contractions, "is the best answer" vs "is correct," spec-derived
phrases) and on length uniformity, not on substance.

---

## 9. The Barron's test — **FAIL**

I read 15 authored and 15 official stimuli blind-mixed (official sample drawn seeded-random across
the same skill mix). Sorting accuracy would be near 100% for an experienced item reviewer. The
cues, ranked by how fast they fire:

**1. No stimulus in the authored form names a single real thing. Official names real things in 82% of
first sentences.**

| | OFFICIAL | authored |
|---|---|---|
| first sentence contains a proper noun | 81.8% | 46.3% |
| stimulus names a real country / place / people / institution | **43.6%** | **0.0%** |

Official, verbatim: *"Luci Tapahonso is the inaugural poet laureate of the Navajo Nation."* ·
*"In 1929, Edwin Herbert Land invented a polarizing filter… the Polaroid Land camera."* ·
*"German theater practitioner Bertolt Brecht (1898–1956)… Caryl Churchill's 1979 play Cloud 9."* ·
*"Stories passed down among the area's Confederated Tribes of Siletz Indians support this belief."* ·
*"The traditional process of Turkish paper marbling (ebru)…"* · *"anthropologist David Graeber and
archaeologist David Wengrow…"* · *"John R. Gardner and colleagues used satellite data… the Missouri
River."*

Authored, verbatim: *"Printmaker Ngaire Whitiora carves her woodblocks with a shallow, rounded
gouge."* · *"Kerraval, an inland port on the lower Velde River, handled more grain in 1840."* ·
*"Two woodland birds, the russet flycatcher and the grey-capped tit…"* · *"Larvae of the reef coral
Cladoporella tenuis…"*

Every checkable noun in the authored form is unfalsifiable. **An expert with a browser sorts all 30
in three minutes.** This is a structural consequence of the "invent everything" rule in STYLE_SPEC
§6, and it is the single most powerful cue on the form.

**2. No em dashes, no parentheses.** One of each in 4,011 words (expected ~20 each). Official
glosses parenthetically as a habit — *"(able to tolerate high salinity)"*, *"(ebru)"*,
*"(a narrative's content)"*, *"(1898–1956)"*. The authored form never glosses; it defines in a
subordinate clause instead. Grep for `—` and `(` sorts the corpora at ~95% accuracy per item.

**3. Option-block geometry.** Official RS option sets look like `[12, 19, 15, 24]`. Authored:
`[18,18,18,16]`, `[17,17,17,16]`, `[15,15,15,15]`. Twenty-four of 25 long-option items are within
30% end to end and **zero of 54** items have the key as the uniquely longest option (official
11.3%). Visible without reading a word.

**4. Prose rhythm.** Every authored stimulus is 3–4 sentences of ~21 words. Official BND items are
one 30-word sentence; official RS notes run 5–7 fragments of wildly varying length; official CTC
Text 1 can be a single 60-word period. Compare official BND, *"Ganga is a folk singing tradition
that originated in the Dinaric Alps in southern Europe. Ganga singers sing different melodies at
the same time"* (short, blunt, two sentences, no subordination) against authored BND M1 Q17,
*"Medieval world maps were seldom drawn to scale. The portolan charts carried by coastal pilots were
different — accurate, at least along the ______ fine lines, radiating from a set of compass roses,
let a navigator lay a straightedge between two ports and read off a bearing."*

**5. The three literary excerpts all end in the same epiphany.**
- M1 Q5: *"She only knew that the ledger, closed and squared on her desk, no longer looked like the
  end of anything."*
- M1 Q8: *"I had always believed that teaching meant being told things. Only then did I understand
  that the fence itself had been the lesson."*
- M2 Q8: *"What the village had learned, I saw, was not the hour but the clock's mistake, and it had
  built its mornings on that."*

Three for three: a first- or close-third narrator, a domestic labor setting, and a closing
aphorism that resolves the passage into a moral. Official literary excerpts are real public-domain
texts (Countee Cullen's *"Thoughts in a Zoo,"* George Marion McClellan's *"Eternity"*) and do not
resolve; that is why CB can ask "what is the function of the underlined portion."

**6. Every scientist is a woman with a globally-sampled name and "colleagues."** 89% female
pronouns vs 52% official; 8 items use "[Field] scientist NAME and colleagues"; 23 use a title+name
appositive against an official 14.6%.

**7. British "grey" in an American-spelling form** (M1 Q10, 8 occurrences) alongside "gray"
(M1 Q18). One grep.

**8. The answer key never repeats a letter** (see §3d). p = 2.2 × 10⁻⁶.

**9. Explanation voice.** Grep for `doesn't`: 0/54 authored, ~74% of official rationales. Grep for
`The hinge`: 7 authored, 0/1200 official.

**VERDICT: FAIL.**

---

# FIX LIST — ranked by detectability

### 1. Answer key: introduce adjacent repeats and destroy the CADB cycle *(detectability: instant, by a student)*
Zero adjacent repeats across 54 items; p = 2.2 × 10⁻⁶. M1 positions 13–27 are a literal `CADB` cycle.
**Fix:** re-key so each module has **5–7 adjacent repeats** and no repeated 4-gram, keeping 6/7/7/7
and no run > 2.
- M1 target sequence: `C A D B D C A B B D A C A C D B C C A D B A D B C A B` (rotate keyed options
  within items 9, 12, 17, 21, 24 only — 5 items).
- M2 target sequence: `B D A C C B D A D B A C A D B B C A C D B D A C D A B` (rotate items 5, 9,
  14, 16, 21 — 5 items).
Rotating an item's keyed letter means reordering its four options; no content changes.

### 2. Replace at least 20 invented proper nouns with real, checkable ones *(instant, by any expert)*
0/54 stimuli name a real place, people, institution, person, or work; official does so in 43.6%.
Priority items and literal replacements:
- **M1 Q10** — replace `Hallowfen / Brackmere / Dunnet Rise / Oakstile` with real study-area names,
  e.g. `Wytham Woods / Thetford Forest / Dean Valley / Sherwood Edge`; and replace `grey-capped tit`
  with `gray-capped tit` (see fix 4).
- **M1 Q9** — `the mill villages of the Leddern valley` → `the mill villages of the Calder valley`.
- **M1 Q6** — `Kerraval, an inland port on the lower Velde River` → keep the invented town but anchor
  the region: `an inland port on the lower Weser`.
- **M2 Q7** — `the island of Serath` → a real island (`Cyprus`), keeping `Anzir` invented.
- **M2 Q27** — `the Redfen and Longmoor marshes` → `the Ouse Washes and Somerset Levels`.
- **M1 Q17 / M1 Q21 / M2 Q16** — name the actual jurisdiction (`Mediterranean portolan charts`;
  `the 1873 Pennsylvania constitutional convention`; `an 1871 borough charter`).
- **Add two Indigenous North American references** (STYLE_SPEC §4 requires them; the form has zero).
  M1 Q25 (village murals) or M2 Q26 (bowed lute) are the natural hosts.

### 3. Explanations: unify the voice and add contractions *(instant, one grep)*
- **M2 Q1–Q7 (7 items):** change the opener from `Choice X ("option") is correct.` to
  `Choice X is the best answer.` — this construction appears 0/1200 times in official rationales.
- **Delete `The hinge is …` from M2 Q1, Q2, Q3, Q4, Q5, Q6, Q7** (0/1200 official). Replace, e.g.,
  M2 Q2 `The hinge is the because-clause: critics describe…` → `Choice D is the best answer because
  "elusive" most logically completes the text's discussion of Halme's essays.`
- **Replace `is not supported;` (9 items) with `isn't supported by the text.`** and
  **`is contradicted by the text` (7 items) with `the text doesn't support this` / `is inconsistent
  with the text`.** Both current phrases are 0/1200 official.
- **Introduce contractions across all 54.** Convert roughly half of `does not` → `doesn't`,
  `is not` → `isn't`, `cannot` → `can't` in the rebuttals. Currently 0/54; official 51–74%.

### 4. Spelling: `grey` → `gray` *(instant, one grep)*
**M1 Q10** — 8 occurrences of `grey-capped tit` across stimulus, options, and explanation. The same
form writes `gray powder` in M1 Q18. Official bank: gray 10 : grey 1. Global replace `grey` → `gray`.

### 5. Restore option-length variance and let the key be longest sometimes *(one glance at the option block)*
24/25 long-option items are within 30% end to end; official is 45%. Zero items have the key as the
uniquely longest option; official 11.3% (expected 6 items here).
**Fix:** in **6 items — M1 Q7 (CTC, currently 18/18/18/18), M1 Q12 (17/17/16/17), M1 Q25 (RS),
M2 Q8 (CID, 16/16/17/17), M2 Q12 (COE, 17/17/17/16), M2 Q26 (RS)** — expand the keyed option by
4–7 words and trim one distractor by 3–4, targeting max/min ≈ 1.5. In **3 of those 6** the key should
end up the uniquely longest. Example, M1 Q7 key: `By granting the relocation but attributing the
survival advantage to nutrients in the nest soil rather than to concealment from seed predators` (24
words) against distractors of 15–18.

### 6. Insert em dashes and parenthetical glosses *(one grep)*
1 em dash and 1 parenthesis in 4,011 words; official rate predicts ~20 each.
**Fix:** add **12–15 em dashes and 12–15 parenthetical glosses** across the form. Natural hosts, with
literal text:
- M1 Q4: `the poet Halldor Aasen in 1928` → `the poet Halldor Aasen (1894–1961) in 1928`
- M1 Q7: `an oil-rich attachment` → `an oil-rich attachment — an elaiosome —`
- M1 Q14: `the starchy root known as ombila` → `the starchy root known as ombila (Dioscorea-like tuber)`
- M1 Q23: `a fermented paste of cracked wheat and yogurt` → `kishk (a fermented paste of cracked wheat and yogurt)`
- M2 Q4: `it may cluster tightly around a value that is simply the wrong one` → `— it may cluster tightly around a value that is simply the wrong one`
- M2 Q9: `an unstable preparation` → `an unstable preparation — a lead-tin yellow —`
- M2 Q11: `the verb "to flitter," meaning to rain lightly for a few minutes` → keep, add `(a term recorded in dialect surveys from the 1890s)`
- M2 Q25: `a pocket of rock beneath a coastal plain` → `a pocket of rock — roughly forty kilometers across — beneath a coastal plain`

### 7. Break the "generic sentence → titled specialist and colleagues" frame *(fires on the third item)*
11/54 use it vs 1.5% official (13.5x). 23/54 carry a title+name appositive vs 14.6% official.
8/54 use "and colleagues" vs 6.8%.
**Fix — rewrite the opening of 8 items so the named person is in sentence 1 or absent entirely:**
- **M1 Q10** `Two woodland birds… Because the two species need the same kind of cavity, ornithologist
  Themba Ngwenya and colleagues suspect…` → `Ornithologist Themba Ngwenya has spent five seasons
  putting up nest boxes for two woodland birds, the russet flycatcher and the gray-capped tit.`
- **M1 Q11, M1 Q22, M1 Q23, M2 Q10, M2 Q14, M2 Q18, M2 Q23** — same treatment: lead with the person,
  or delete the person and attribute to "a research team" / no attribution at all.
- **Delete "and colleagues" from 4 of the 8 items that carry it** (M1 Q11, M1 Q14, M2 Q10, M2 Q14),
  substituting `Ramanathan's team`, `Serikbay`, `Mekouar's group`, `Salgado`.

### 8. Cut 8–12% of stimulus length in WIC, TSP, CID, COE, RS *(fires on measurement, not on reading)*
5/10 skill means sit outside the official p25–p75, all long; 10/10 skill means exceed the official
mean (p ≈ 0.001).
**Fix — targets, and the specific items to cut:**
- **WIC** 62.8 → 55. Cut ~8 words each from M1 Q3, M1 Q4, M2 Q2, M2 Q3, M2 Q4 (all 63–68 words).
- **TSP** 107.2 → 93. Cut 12–18 words from M1 Q6, M2 Q5, M2 Q6 (103–116 words). M2 Q6 can lose the
  entire sentence *"Surveys in several water districts have found residents willing to accept
  recycled water for irrigation and cooling but not for drinking, even after being shown the
  treatment results."* → *"Residents in several districts accept recycled water for irrigation but
  not for drinking."* (−17)
- **CID** 99.5 → 91. Cut 8–10 from M1 Q9, M2 Q9.
- **COE** 95.5 → 78. This is the biggest single gap (+33%). Cut 15–20 words from each of M1 Q10,
  M1 Q11, M2 Q10, M2 Q11 by deleting the redundant method sentence — e.g. M1 Q11's *"The team
  prepared one film from starch alone and four others in which a different additive made up five
  percent of the mixture, then measured the tensile strength of each film in megapascals (MPa)."*
  → *"The team measured the tensile strength, in megapascals (MPa), of a starch-only film and of
  four films each containing a different additive."* (−17)
- **RS** 90.4 → 78. Drop **one bullet** from M1 Q25 (the `Dolidze began recording the paintings in
  2016` bullet is inert), M1 Q26, M2 Q26, M2 Q27, and shorten two bullets in M1 Q27.
- Simultaneously **lengthen sentences**: authored 20.9 words/sentence vs official 24.5. Merge two
  short sentences into one in each BND item (authored 21.7 vs official 30.0 words/sentence).

### 9. Rebalance topics *(fires on a tally sheet, not on reading)*
M1 social science 2 vs target 6–7; form-wide literature/narrative 5 vs 8–10; M1 natural science 13
vs 9–10.
**Fix:** convert **M1 Q15 (BND, hummingbird), M1 Q20 (FSS, mass timber), M1 Q24 (TRN, self-healing
polymers), M1 Q27 (RS, reflective displays)** to social science and literature topics. Specifically
make **M1 Q1 or M1 Q2 a literary WIC** (a passage from an invented short story, per official
practice) and **M1 Q5 or M2 Q5 a literary TSP** — currently zero WIC and zero TSP items use a
literary text, against an official pattern where literature concentrates in exactly those skills.
Also thin the five "survey/estimate goes wrong" items (M1 Q3, M2 Q4, M2 Q11, M2 Q14, M2 Q20) to
three, and the five bird items (M1 Q7, Q10, Q15, Q26; M2 Q27) to three.

### 10. Fix the three internal name collisions *(fires if a reviewer reads the whole form)*
- **M1 Q26** `Ecologist Priya Ramanathan` → `Ecologist Priya Venkataraman` (collides with
  *Aarthi Ramanathan*, M1 Q11, same module).
- **M1 Q18** `volcanologist Tuulikki Saarinen` → `volcanologist Marja Saarinen` (collides with
  *Tuulikki Rantanen*, M1 Q1, same module).
- **M2 Q9** `Conservation scientist Tumelo Ramokgopa` → `Conservation scientist Lerato Ramokgopa`
  (collides with *Tumelo Mokoena*, M1 Q22).
- Also reassign **6–8 researchers to male-coded names** (currently 89% female pronouns vs 52%
  official). Candidates: M1 Q11 `Aarthi` → `Arvind`; M1 Q23 `Rima Haddad` → `Rami Haddad`;
  M2 Q5 `Folasade Oyelude` → `Folarin Oyelude`; M2 Q11 `Harpreet Kaur` → `Harpreet Singh`;
  M2 Q18 `Chidinma Obiako` → `Chidi Obiako`; M2 Q23 `Akosua Frimpong` → `Kwabena Frimpong`.

### 11. De-duplicate the rival-account sentence and the number "eleven" *(fires on close reading)*
- **M1 Q12** *"Others have argued instead that the larvae settle where they do because…"* and
  **M2 Q13** *"Other entomologists hold instead that the legume acts as an obstruction…"* are the
  same sentence twice, in the same slot (COE textual-claim), both "chemical signal vs. physical
  structure." Rewrite **M2 Q13** as: *"A competing account attributes the effect to spacing alone:
  the legume strips break up the stand, so a searching female encounters sorghum less often."*
- **"eleven"** appears in M1 Q5 (twice), M1 Q18, M2 Q14, M2 Q19 (99x the official rate). Change
  M1 Q18 to `for nine days`, M2 Q14 to `nine euros a bottle`, M2 Q19 to `twelve short pieces` (and
  update `The other ten` → `The other eleven`).
- **"argues"** appears in 6 stimuli (14.9x official rate; "argues that" 5×). Replace in M1 Q9
  (`argues that` → `has concluded that`), M2 Q11 (`Kaur argues that` → `To Kaur, the pattern shows
  that`), M2 Q12 (`a student argues that` → `a student contends that`).
- **"instead"** appears in 6 stimuli (4.8x). Replace in M1 Q13 (`relying instead on` → `relying on`),
  M2 Q1 (`survive that season instead by becoming` → `survive that season by becoming`), M2 Q5
  (`were instead shown` → `were shown`).

### 12. Cut Conventions and RS explanations to CB length *(fires on measurement)*
BND +51%, FSS +60%, RS +91% over official. **Fix:** cut all 8 BND explanations to ~150 words, all 7
FSS to ~135, all 5 RS to ~120, by (a) allowing repeated rebuttals where the same convention defeats
two distractors, and (b) using the bare `Choice B is incorrect.` form — official uses it 1.13 times
per rationale; the authored form uses it zero times.
