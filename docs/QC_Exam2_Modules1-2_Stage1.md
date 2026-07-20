# Stage 1 QC — Practice Exam 2, Reading & Writing Modules 1 & 2

**Scope:** English (R&W) Modules 1 and 2 only. Math not reviewed.
**Reference standard:** College Board official SAT Practice Tests 4 & 5 (R&W).
**Data:** Exam 2 = `vxxtBSqnVQUPsXu9Xy4B`. R&W Module 1 doc = `5COidioj5VkQlG22UrY9`. R&W Module 2 doc = `Goq368OvlAGDI4ghw4Jx`. Questions live in `questions`; each module holds an ordered `questionIds` array.

**Findings only. No changes made. Corrections wait for your approval (Stage 2).**

Severity: 🔴 blocker · 🟡 quality/style · 🔵 minor.

---

## Headline

Exam 2's two English modules are in very different shape:

- **Module 1 is not a real second exam — it is a byte-for-byte copy of Exam 1's Module 2.** All 27 of its question documents are the *same database records* as Exam 1 Module 2 (shared IDs, not just similar text). A student who takes Exam 1 and then Exam 2 gets those 27 questions a second time. Because the records are shared, this also means the fixes I just applied to Exam 1 Module 2 (Chopin, tardigrades, JWST, etc.) are now showing inside Exam 2 Module 1 too.
- **Module 2 is genuinely strong and mostly original** — real College Board–style items (hycean planets, Chesapeake waterbirds, Titan's atmosphere, Luis Barragán). No duplication against Exam 1. But it has 26 questions instead of 27 and contains two broken items.
- **The module order for the whole exam is wrong** (a math module currently comes second).

---

## A. Module 1 — full rebuild required (🔴)

Module 1's `questionIds` point to the exact same 27 documents as Exam 1's Module 2:

- Editing those documents to "fix" Exam 2 would silently change Exam 1 as well, so in-place edits are not an option.
- The correct fix is to **author 27 brand-new questions**, save them as new documents, and repoint Exam 2 Module 1's `questionIds` to the new set. This is the one heavy lift in Exam 2.

The 27 new questions would follow the College Board domain layout (Words in Context → Text Structure/Purpose → Cross-Text → Central Ideas → Command of Evidence, textual + one graph + one table → Inferences → Boundaries/Form → Transitions → Rhetorical Synthesis), matched to the reference difficulty range. This includes building 1 graph and 1 table figure, as in Exam 1.

*Note on scale:* this is ~27 new items for Module 1 alone. If you'd rather not generate a whole module in one pass, an alternative is to swap in an existing unused/unique module, but from what I can see every other exam's modules are also cross-shared, so fresh authoring is the clean path. Your call.

---

## B. Module 2 — missing question (🔴)

Module 2 has **26 questions; it needs 27.** Unlike Exam 1 (which had dangling IDs), here the array is simply one short — no placeholder exists. Fix: author **1 new question** and append its ID to the module's `questionIds`. Recommended type to preserve balance: an **Inferences** or **Central Ideas** item (the Information-and-Ideas cluster is otherwise slightly light), difficulty-balanced.

---

## C. Module 2 — broken questions (🔴)

**Q16 (Cy Twombly, "graffiti-like scribbles") is broken three ways and needs full replacement:**

1. **Two answer choices are identical** — both B and C are "scribbles: that."
2. **The keyed answer is wrong.** The clause "that often incorporate words or phrases…" is a restrictive relative clause, so the correct form is "scribbles that" (no punctuation). The item is keyed to "scribbles: that," which is incorrect.
3. **It duplicates Exam 1 Module 1 Q20** — the same Twombly / *Fifty Days at Iliam* sentence. (It also dropped the first name "Cy.")

**Q20 (mitochondrial genomes) has a wrong answer key (🔴).** The sentence's main verb is "offers" ("Such a compensatory measure … offers an evolutionary explanation"), so the blank must be the non-finite "counteracting" (choice D) to avoid two finite verbs with no conjunction. The item is keyed to "counteracts" (choice C), which produces a run-on. The fix is to re-key to D — though the sentence is convoluted enough that I'd recommend a light rewrite for clarity.

---

## D. Module 2 — typos in real names (🟡)

- **Q17:** "Kizonba" should be **Kizomba** (the Angolan dance); "the India dance duo" should be "the **Indian** dance duo." (The competition/performer names may also be invented — worth confirming, though the grammar item itself, answer D, is correct.)
- **Q23:** "Linmocharis fava" should be **Limnocharis flava** (yellow velvetleaf) — misspelled both words, and it appears twice. Grammar/answer (B) is fine.

---

## E. Module 2 — minor (🔵)

- **Q3 (Lucian, *True History*):** missing punctuation after the blank ("is *visionary* featuring tropes…") creates a small run-on; add a colon. Answer (D) is fine.
- **Q24 (currency-name notes):** uses the same template as Exam 1 Module 1 Q25 (there it was dinar/Bahrain; here dollar/Kiribati). Not a duplicate, but a cross-exam template echo; optionally vary it.

---

## F. Exam-level — module order is wrong (🟡)

Exam 2's `moduleIds` are ordered **R&W 1 → Math → R&W 2 → Math**:

```
pos1  R&W Module 1
pos2  Math Module (module 3)   ← should be R&W Module 2
pos3  R&W Module 2
pos4  Math Module (module 4)
```

A test taker currently hits a math module as their second section. The digital SAT order is R&W 1 → R&W 2 → Math 1 → Math 2. Fix is a one-line reorder of the `moduleIds` array on the exam document (`vxxtBSqnVQUPsXu9Xy4B`) — no question content touched. (Exam 1's order is already correct.)

---

## G. Difficulty range (🟡 — deferred, as agreed)

Every Module 2 item is again labelled `medium`. Deferring the global difficulty relabel per your instruction; any new questions I author will carry sensible easy/medium/hard labels so they're ready for that pass.

---

## What's good

Module 2 is close to publishable: the passages are on-style, the quantitative items (Q9 seagrass line graph, Q10 migration table) have correct figures and defensible keys — I verified both against their graphs — and the distractors are constructed the College Board way. The problems are concentrated in the two broken conventions items, the typos, and the missing 27th question.

---

## Proposed Stage 2 work order (on your approval)

1. **Module 1:** author 27 new questions (incl. 1 graph + 1 table), save as new docs, repoint Module 1's `questionIds`. *(Confirm you want a full rebuild.)*
2. **Module 2 Q16:** replace with a new, correctly-keyed Form/Structure item (no duplicate options, distinct from Exam 1).
3. **Module 2 Q20:** re-key to "counteracting" (or rewrite for clarity).
4. **Module 2:** author 1 new question to reach 27; append to array.
5. **Module 2 typos:** fix Q17 (Kizomba / Indian) and Q23 (Limnocharis flava); fix Q3 punctuation.
6. **Exam-level:** reorder `moduleIds` to R&W1 → R&W2 → Math → Math.

Tell me which items you want, and in particular confirm the Module 1 full rebuild (that's the big one).
