# Stage 2 — Exam 1 Modules 1 & 2: changes prepared (not yet applied)

Exam `IcRvQJmEg0pyW2vTv0pB` · Module 1 `62S6QRLJIRQaR0xfQurX` · Module 2 `COUaD8uRujchbMej3MT1`.
17 question operations. Nothing is written to the database until you run the apply script (below). Module `questionIds` arrays are left untouched — the 5 missing questions are recreated at their original IDs.

## How to apply

From the `ultrasat` folder:

```
node scripts/applyExam1QCFixes.js --dry-run   # checks + writes a backup, no changes
node scripts/applyExam1QCFixes.js             # applies the fixes
```

The script backs up the current state of every touched question to `scripts/output/qc_backup_<timestamp>.json` before writing, so any change can be reverted. Reload the exam afterward to confirm rendering.

## 1. Five missing questions produced (recreated at their dangling IDs)

| Slot | Type | Difficulty | Topic |
|---|---|---|---|
| M1 Q9 | Central Ideas & Details | medium | Antikythera mechanism |
| M1 Q12 | Command of Evidence (table) | medium | Honey-locust seed germination (new table figure) |
| M1 Q21 | Boundaries | easy | Honeybee waggle dance (semicolon) |
| M1 Q23 | Transitions | easy | Octopus squeezing ("For example") |
| M2 Q21 | Form, Structure & Sense | medium | Spacecraft instruments (subject–verb agreement) |

## 2. Two missing graphs built + one broken item fixed

- **M1 Q11** — attached the FTA agricultural-export bar chart the stem refers to. Answer key unchanged (B). Data drawn so B is the only choice that weakens the claim.
- **M2 Q12** — removed the text placeholder, attached a real "Spoiled vs. Unspoiled" bar chart with defined values, re-derived and confirmed the answer (A: *Owl Creek Bridge* has the largest gap, *A Chess Problem* the smallest, so the pair best shows the difference *varying*). Re-tagged as quantitative Command of Evidence.

## 3. Text fixes

- **M2 Q5** — rewrote the incoherent passage as a clean inference item (bare early stages → audiences relied on language + imagination).
- **M2 Q1** — removed the fabricated title "*Enthrace*"; reworded to Houser's abstract vs. realistic works. Options/answer unchanged (D, "identify").
- **M2 Q24 / Q27** — added the missing "While researching a topic, a student has taken the following notes:" stem line. (Q24 also had the fabricated "Dr. Elena Martinez" removed and the crows correctly named New Caledonian crows.)

## 4. De-duplicated 5 cross-module pairs (Module 1 kept, Module 2 regenerated)

| Was duplicating | New Module 2 item |
|---|---|
| M1 Q3 film critics | **M2 Q2** — coral-reef restoration (Words in Context) |
| M1 Q5/Q6 George Eliot passage | **M2 Q6** — Kate Chopin, "The Story of an Hour" (structure) |
| M1 Q14 autobiographical-novel template | **M2 Q14** — shaded seedlings & fungal networks (inference) |
| M1 Q26 Oahu birds | **M2 Q23** — tardigrade cryptobiosis (synthesis) |
| M1 Q27 torsional heating | **M2 Q26** — James Webb Space Telescope (synthesis) |

## 5. Re-tagged (difficulty spread deferred, per your note)

- **M2 Q10** and **M2 Q12** moved from `rhetorical-synthesis` to `command-of-evidence` (quantitative).

## Not done yet (waiting on you)

- Global difficulty spread across both modules (deferred).
- New questions were each given a sensible difficulty (easy/medium/hard) rather than all-medium, so they're ready when the spread pass happens.
