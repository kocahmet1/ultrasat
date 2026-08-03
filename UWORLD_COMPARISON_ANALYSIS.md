# UWorld SAT vs UltraSAT — Competitive Analysis (Phase 1)

**Date:** 2026-07-30 · **Method:** 18 UWorld screenshots (dashboard, study planner, course TOC, 6 lesson pages, question review ×3, practice results, create-practice, overall performance, trial checklist) analyzed against a full audit of our codebase (4 parallel deep-dives: IA/dashboard/monetization, question experience, lessons, design system). Every claim about our side was verified in code; file paths included for Phase 2.

---

## 1. The shopper's verdict

A student comparing both products over a 15-minute browse would conclude UWorld is the safer purchase — not because its ideas are better (ours are often more advanced), but because **UWorld never breaks character**. Every screen is the same card-based light UI, one accent blue, one icon set, every metric has an ⓘ tooltip, every locked item shows exactly what you'd unlock ("1250 🔒"), and the copyright footer sits on every page. It reads as an institution.

Our product reads as two products stitched together. The token-based redesign (`tokens.css` + `ut-kit.css`) covers ~19% of stylesheets; the moment a prospect crosses into the other 81% — and **the paywall and checkout are both on the old side** — the seam shows. The single worst screen to be under-designed is the one that asks for money, and ours renders the literal string "LOCKED" as its icon (`components/membership/MembershipGate.jsx:42`).

The user's two instincts are confirmed and quantified below: their explanations are structurally better (we store one text blob where they render ~6 structured parts — and we *discard* per-choice reasoning at ingest), and their lesson pages are better *on average* (our best 6 lessons beat theirs; the other 23 are template prose). The biggest thing the screenshots reveal that we're missing entirely: **the study planner**, which is the spine of their whole product — dashboard, overdue nagging, and daily engagement all hang off it.

---

## 2. Scorecard

| Area | UWorld (screenshots) | UltraSAT (verified) | Verdict |
|---|---|---|---|
| Study planner | Full calendar, auto plan from test date, overdue tracking, time budgets | **Absent** (no planner, no tasks, no calendar) | **Their biggest win** |
| Question explanations | Rule → annotated walkthrough → per-choice rebuttals → Things to Remember → tags | Single blob; hidden when you answer correctly; per-choice reasoning destroyed at ingest | **Their win (structural)** |
| Tutor mode | Explanation after each question, per-question | No post-answer feedback at all until quiz end | **Their win** |
| Peer statistics | % chose each option, % answered correctly, your time vs avg | None (timeSpent captured, never shown; no aggregates) | **Their win** |
| Practice builder | Pools (unused/incorrect/marked/omitted/correct), difficulty w/ counts, topic tree w/ counts, tutor/timed, N questions | Headless 5-question generator; difficulty select w/o counts; mixed-quiz modal only | **Their win** |
| Lesson pages (avg) | Video + searchable guide + annotated examples + practice + Mark as Complete, uniformly | 6/29 topics world-class animated infographics; 23/29 template prose; no video, no completion state | **Their win on consistency, ours on ceiling** |
| Course TOC | Progress, last-viewed, resume, locks, preview badges, search | Flat list; progress sets hardcoded empty; route-level gate only | **Their win** |
| Trial funnel | Days-left banner, gamified 5-task checklist, locked counts everywhere, expiration date pinned | Freemium quotas, no trial mechanics, no checklist, text-only "Pro" chips | **Their win** |
| Analytics | Donuts, answer-changes, practices created/completed/suspended, print | Est. SAT score w/ confidence (they lack), per-skill accuracy; no omitted concept, no history list | **Split** |
| AI tutoring | None visible | Grounded coach w/ memory, debriefs, micro-lessons, hint/choice-analysis actions | **Our win, decisively** |
| Adaptivity | None visible (static difficulty filters) | 3-level ladder w/ promotion; concept-grain mastery model | **Our win** |
| Taxonomy | Domain→unit→sub-unit | Machine-verified 8-domain/29-subcategory CB-exact map + concept grain below it | **Our win** |
| Design coherence | One language everywhere | Two languages, 973 distinct hex colors, 4 icon libs + emoji, 88 button classes | **Their win** |
| Trust chrome | Footers, tooltips, designed locked states | No footer legal links, self-dating legal pages, "no account needed" claim that's false | **Their win** |

---

## 3. What UWorld does better (the gaps)

### 3.1 Study planner — the structural gap ⚠️ biggest
Their screenshots show a week calendar where every lesson/practice-set is a scheduled task with a type chip (pink "Practice Questions" / purple "Review Course"), per-task minutes, per-day totals ("15 hrs 39 mins"), an **Overdue tab with a red count badge (40)**, completed tasks struck through with date, days markable "Not Available", and a dashboard ring showing "2/8 · 7 days remaining · Completed 1 / Overdue 40 / Incomplete 155".

Why it sells: it converts a content library into a *daily obligation*. The overdue badge is a guilt engine; the ring makes the purchase feel like enrolling in a program, not buying access to a pile of questions.

Us: nothing. Verified zero planner/calendar/task code in student-facing pages. Worse, **`examDate` is unwritable** — the dashboard countdown and coach `exam_approaching` nudges depend on a field only two *orphaned* components ever set (`TargetScoreModal.jsx`, `OnboardingPage.jsx`). And `membershipUtils.js:60` *advertises* "Custom study plans" as a paid feature that doesn't exist.

### 3.2 Explanations & tutor mode — confirmed, and the root cause is schema
What their explanation contains (from the review screenshots): (1) rule stated first ("Unless a shift in time is clearly indicated, verb tenses should agree"), (2) the passage re-rendered with every relevant verb highlighted and labeled, (3) color-coded step math with boxed result, (4) **a separate paragraph per wrong choice** ("Choice B… Choice C… Choice D…"), (5) a "Things to remember" summary, (6) Domain/Unit tags, (7) even distractor-awareness notes ("The given point (5,7) is extra information not needed").

Us — three compounding problems, all verified:
1. **No tutor mode.** `SmartQuiz.jsx` `handleSelect` records the answer silently; no reveal, no explanation until the results page. UWorld shows feedback per-question.
2. **Explanations suppressed on correct answers** — `SmartQuizResults.jsx:288` `{!isCorrect && q.explanation && …}`. A student who guessed right learns nothing.
3. **We already generate per-choice reasoning and then destroy it.** The generation contract (`docs/question_generation_prompt.md`) produces an array including "Option B is incorrect because…" — and `apps/api/questionsAPI.js:380` does `explanation.join('\n')` into one blob. Schema (`firebase/schema.js:33`) has one field where UWorld renders six.

Also absent: KaTeX/MathJax (no LaTeX lib in `package.json` — math must be hand-coded HTML), annotated-passage rendering, "Things to remember".

Mitigant: our AI can produce UWorld-grade choice-by-choice analysis live (`SmartQuiz.jsx` coach actions) — but it's Pro-gated, only available *during* the quiz (not on results, where it's needed), and sees no student context.

### 3.3 Peer context — cheap trust, we have zero
Every UWorld answer choice shows the % of students who picked it (81%/1%/9%/6%); every question shows "% answered correctly" and "your time 7 sec vs avg 53 sec". This is social proof *inside the product* — it proves thousands of students are in here with you, and turns every miss into "37% get this wrong too."
Us: `timeSpent` is captured per answer and never displayed; no aggregation collection exists at all.

### 3.4 Practice builder
Theirs: quick-start N questions; Tutor/Timed toggle; pool filters **by prior status** (Unused 28 / Incorrect / Marked / Omitted / Correct) with live counts; difficulty checkboxes with counts *plus locked counts* (Low 1 + 327🔒); full domain/unit tree with per-node counts; question-count input.
Ours: no configuration screen at all — entry points auto-create a fixed 5-question quiz (`QUESTIONS_PER_QUIZ = 5`). Difficulty select exists but shows no counts and **silently falls back to all difficulties when a bucket is empty** (student thinks they chose Hard). Our reuse logic (prefer unseen, re-inject misses) is actually smart — but invisible, so it earns no credit.

### 3.5 Lesson & course experience
- **Coverage cliff:** 6/29 lessons have our cinematic animated infographics (better than anything UWorld shows); 23/29 are hero + generic strategy filler. UWorld is uniformly good — consistency beats ceiling for a shopper who samples randomly.
- **No completion loop:** UWorld ends every lesson with "Have you mastered this Lesson?" + Mark as Complete, feeding "0/38 complete" progress and resume state. Our `LecturesPage.jsx:23-25` has `COMPLETED_SUBCATEGORY_IDS = new Set([])` — hardcoded empty; filters that can never match; a "Next up" that's identical for every user.
- **No per-lesson question bank stats** ("0 Correct / 1 Attempted of 4" per row in their TOC).
- **No video** anywhere (their instructor videos with position memory are a major perceived-value anchor; heavy to replicate — see §7).
- **No in-lesson search / page-width control / side panel** (flashcards·notebook·annotations tabs next to every lesson and question).
- **Remediation links are built but unmounted:** `SkillReviewChips.jsx` / `ReviewTile.jsx` (wrong answer → "Review lesson X") exist as dead code. Cheapest big win in this section.
- Bug: lesson CTAs launch quizzes with `accuracyRate: 0` hardcoded, ignoring the student's real level.

### 3.6 Trial & monetization funnel
Theirs: persistent days-left banner ("You have 5̲ days left… Upgrade Now"), a gamified **Free Trial Checklist** (5 tasks, progress bar, completion celebration + upsell), Preview badges on free content, lock icons with **exact locked inventory counts** on every filter, Unlock Full Access buttons in context, expiration date pinned bottom-of-sidebar.
Ours: honest freemium (3 free exams, coach quotas) but no urgency mechanics, no onboarding checklist (static 3-step list, untracked, vanishes), text "Pro" chips instead of lock icons, **zero locked-count teasing**, and — the worst miss — **coach quota-exceeded messages carry no upgrade CTA** (the single highest-intent moment we have). Plus 4 duplicate upgrade modals with different benefit lists.

### 3.7 Practice history & review
Theirs: Previous Practices list, per-practice results page (score bar, settings chips, sortable table w/ domain/unit/peer %/times, per-row review chevron), Practice Analysis tab, suspended-practice resume, Custom Practice Id (support-friendly), print.
Ours: results route is deep-linkable but **nothing links to it** — a student cannot find a finished quiz again. No omitted state (Next is blocked until you answer — you literally can't skip a question, which also breaks exam realism). Exams do have solid suspend/resume.

### 3.8 Analytics depth
Theirs: correct/incorrect/omitted donuts, QBank usage %, practices created/completed/suspended, **Answer Changes** (correct→incorrect etc. — students love this), per-subject tabs, print.
Ours: Est. SAT score with confidence (they have nothing comparable), per-skill accuracy bars. Missing: omitted as a concept, usage %, answer-change tracking, domain roll-ups, any global trend chart.

### 3.9 In-question tools parity (two engines problem)
Exam engine has cross-out, navigator grid, mark-for-review, countdown; SmartQuiz has AI actions, confidence rating, timer — **neither inherited the other's tools**. SmartQuiz's bookmark is a toast that saves nothing. Neither has highlighter, notes, calculator (Desmos), or reference sheet — all visible in UWorld's toolbar.

---

## 4. What we do better (protect these in Phase 2)

1. **The AI coach** — persistent memory, grounded debriefs, micro-lessons from *your* misses, student-readable notebook ("what I know about you"). UWorld has nothing in this class.
2. **Predicted SAT score with confidence** (`utils/scoring.js`, ProgressDashboard) — their dashboards show usage, not outcomes. This is the number a buyer actually cares about.
3. **The 6 animated lesson infographics** — step-through solves with per-distractor failure tags beat UWorld's static prose. The problem is quantity, not quality.
4. **Adaptive level ladder + concept-grain mastery** below subcategory level — invisible today, but real.
5. **Machine-verified CB-exact taxonomy** binding questions/lessons/events/analytics.
6. **Modern shell** — single nav source (`config/navigation.js`), good mobile top-bar, honest empty states, real error boundaries. UWorld's UI is consistent but visually dated; our token-based pages look *newer* than UWorld.

---

## 5. Coherence, professionalism, trust — would a student pull the trigger?

UWorld earns the purchase through *relentless sameness* plus data density. Our specific trust breakers, in order of damage:

1. **Paywall & checkout are the least-designed screens** — "LOCKED" string-as-icon, "Premium Feature" title contradicting our "Pro" naming, checkout CSS with 46 hardcoded hexes / 0 tokens, `alert()` on checkout errors.
2. **No footer, no reachable legal pages** — Privacy/Terms/Cookies routes exist but are linked from nowhere; they render with zero navigation (stranded user); and each stamps `Last updated: {new Date()}` — **a policy that always says it was updated today reads as fabricated**. For a site taking recurring card payments, this is compliance-grade, not cosmetic.
3. **A false claim on the landing page** — "Free · no account needed" (`LandingPageV3.jsx:331,671`) but every guest hits the auth modal. First click breaks the first promise.
4. **Design seam** — 973 distinct hex colors, 9 competing accent blues (342 uses of official green vs 323 of rogue blues), `--primary-color` defined 5× with 3 values (winner depends on chunk order), 4 icon libraries + emoji-as-UI in 38 files, 25+ font stacks, purple `#667eea→#764ba2` gradient in 13 files.
5. **No skeletons** — 40+ hand-rolled spinners and a plain "Loading…" div; perceived speed is a large share of why UWorld feels expensive.
6. **No social proof anywhere** — no testimonials, counts, score-improvement stats, logos. UWorld's product *itself* is social proof via peer percentages (§3.3).
7. Brand split UltraSAT vs UltraSATPrep (87 vs 44 refs), `theme-color #000000`, no og/twitter meta, robots.txt advertising a sitemap that doesn't exist, suppressed focus outlines (52 `outline:none` vs 13 `:focus-visible`).

---

## 6. Design details worth stealing from UWorld

Cheap, high-yield patterns visible in the screenshots:

- **ⓘ tooltips beside every metric** (they explain "Average Time Spent", "Answer Changes"…). We show Est. SAT/accuracy/level with no explanation anywhere.
- **Locked-inventory counts**: `Medium ☑ 12 (688 🔒)` — every filter doubles as an ad. Adapt to our real counts.
- **Status chips**: Tutored/Untimed/Unused as small gray chips on results; pink/purple task-type chips on the planner.
- **Progress ring with legend** (Completed/Overdue/Incomplete) and per-subject KPI stat cards with icon chips.
- **✓/✗ paired examples** in lessons (wrong sentence with red ✗ directly above corrected sentence with green ✓) and **"Things to Remember"** end boxes.
- **Annotated sentence/equation diagrams** — labeled arrows mapping "General idea → colon → Related details". (Our 6 infographics already out-do this; the pattern needs templating to all 29.)
- **"Have you mastered this Lesson?" + Mark as Complete** end-of-lesson band.
- **Days-left pill in a persistent banner**; **expiration date pinned** at sidebar bottom.
- **Per-choice selection %** rendered right on the answer cards in review.
- **Copyright footer on every page**; Custom Practice Id on results (support ergonomics); Print on analytics.
- Page-position indicator (4/5) and in-guide search on lesson pages.

---

## 7. Phase 2 priority stack

> **Status (2026-07-31, later):** ✅ PALETTE RE-THEME — "Scholar Blue". `tokens.css` is now a light-first navy/blue system with **dedicated semantic families**: `--ut-accent*` = blue (brand/actions/links/focus ONLY), `--ut-success*` = green (correct/completed/mastered ONLY), `--ut-danger*` = red, `--ut-warn*` = amber, plus `--ut-font-serif` for reading passages. This fixes the root cause of the old palette's incoherence: green was doing double duty as both brand and correctness, so nothing could signal "you got it right" distinctly. ~60 stylesheets re-themed across the app shell, landing, core loop, study surfaces, exam/quiz/results, checkout, and every static/legal page reachable from the footer. Obsolete green literals: **0 outside admin**. Purple `#667eea→#764ba2`: **gone**. Rogue accents: eliminated from all student-facing CSS. Icons: consolidated to `react-icons/fi` across ~25 student files (the ~12 remaining FontAwesome icons are documented cases where Feather has no glyph — brain, rocket, calculator, square-root, sort). Fonts: normalized to the 4 tokens. Spinners: 6 more page-level loading branches became `.ut-skeleton`. Also fixed along the way: several real semantic bugs (correct-answer states rendering as brand color in `Results.css`/`LessonBlocks.css`/`coach.css`, "mastered" chips in `BankItem.css`, the payment-success icon), and two missing `:focus-visible` indicators where `outline:none` had no replacement. Deferred by design: admin-only CSS (`ConceptImport`, `GraphGeneration`, `Admin*`, `ExamIngestion`, `PracticeExamManager`) — internal tools, not customer-facing.
>
> **Status (2026-07-31):** ✅ P2 items 11–14 SHIPPED — study planner (`/planner`: generate from test date + availability, weakest-first lesson→practice pairing, review days, Upcoming/Overdue tabs, auto-reconciliation from real lesson/quiz completions, replan, dashboard widget); peer-stats pipeline (`questionStats` aggregates on quiz completion, % correct + per-option % + your-time-vs-average in tutor reveal and results, 5-attempt noise floor, `scripts/backfill-question-stats.js`); lesson block template kit (`components/lesson/` — rule / annotated-example / check-cross / steps / remember, renderer wired into `/learn/:id`, demo at `/learn/boundaries?previewBlocks=boundaries` in dev, `scripts/generate-lesson-blocks.js` + `docs/lesson-blocks-authoring.md`); design-debt burn-down (core-loop + checkout CSS tokenized ~266→28 hexes, `--primary-color` defined once, purple gradients gone from student surfaces, emoji swept from 10 student pages). Owner to-dos: `npm run build` on Windows; `firebase deploy --only firestore:rules` (new `studyPlan` + `questionStats` + `lessonProgress` rules); run backfills at leisure (question-stats, lesson-blocks, structured-explanations — all dry-run by default).
>
> **Status (2026-07-30):** ✅ P0 items 1–5 SHIPPED. ✅ P1 items 6–10 SHIPPED (structured explanation schema + ingestion + ExplanationCard w/ KaTeX + results overhaul; tutor mode w/ omit + timed mode + persistent bookmarks; /practice builder w/ pools/difficulty/topic counts + free-tier lock teasing; /practice/history + saved questions; lesson completion loop + real LecturesPage progress + accuracyRate fix). Owner to-dos: run `npm run build` on Windows; `firebase deploy --only firestore:rules` (new lessonProgress rule); optionally run `node scripts/backfill-structured-explanations.js` (dry-run first) to structure legacy explanations; create the smartQuizzes composite index (userId+createdAt) if the history page reports local sorting. P2 (items 11–14) remains open.

**P0 — Revenue & trust (days, not weeks)**
1. Rebuild `MembershipGate` on ut-kit (real lock icon, "Pro" naming, benefits + price) and make it the *single* upgrade surface; delete the 4 duplicate modals. Add upgrade CTA to coach quota-exceeded messages.
2. `<SiteFooter>` on landing + static pages: copyright, Privacy/Terms/Cookies/Accessibility/About/Contact. Hardcode real legal dates. Give static pages the landing chrome.
3. Fix the false "no account needed" claim (make guest exam real, or fix copy).
4. Test-date capture: a small dashboard prompt writing `examDate`/`targetScore` (revives countdown + coach nudges). 
5. `ut-skeleton` classes + replace top 6 spinners; run `cleanup-dead-code.js --apply`.

**P1 — Close the headline gaps (the two the user spotted + the engine behind them)**
6. **Structured explanations**: extend schema (`rule`, `steps[]`, `choiceRebuttals{}`, `thingsToRemember[]`, tags), stop the `join('\n')` flattening, backfill via our existing generation pipeline; render UWorld-style on results. Show explanations on correct answers too. Add KaTeX.
7. **Tutor mode**: post-answer reveal in SmartQuiz (correct/incorrect state, explanation card, coach actions available at the moment of the miss). Add omit/skip support.
8. **Practice builder page**: N questions, pools (unused/incorrect/marked), difficulty + topic tree with live counts (+ locked counts for free users), tutor/timed toggle.
9. **Practice history**: "Previous practice" list (query exists, UI doesn't) + link results pages; persist mark-for-review; saved-questions list (reader for `studyPlanItems`, already written).
10. **Lesson completion loop**: Mark as Complete → real progress on `LecturesPage` + resume + "x/29 complete"; build wrong-answer→lesson remediation links (the old dead `SkillReviewChips`/`ReviewTile` components were removed in the P0 dead-code purge — rebuild on ut-kit, recoverable from git history if wanted); fix `accuracyRate: 0` bug; per-lesson attempted/correct counts.

**P2 — The program layer (bigger builds)**
11. **Study planner**: auto-generate day-by-day plan from test date + availability; overdue tracking; dashboard ring + upcoming/overdue tabs. Our differentiator: let the AI coach *own* the plan (UWorld's planner is dumb; ours can replan from performance).
12. **Peer stats pipeline**: aggregate per-question selection counts + times (data already captured); render % per choice, % correct, time vs avg.
13. Design-debt burn-down in traffic order: SmartQuiz.css (184 hexes) → results → checkout; kill 9 rogue accents, 1 icon set, sweep emoji.
14. Template the infographic system so all 29 lessons get annotated worked examples + ✓/✗ pairs + Things to Remember; evaluate short video or animated-explainer strategy last (highest cost, UWorld's moat).

---

*Verified evidence anchors: `SmartQuiz.jsx` handleSelect (no reveal) · `SmartQuizResults.jsx:288` (`!isCorrect &&`) · `apps/api/questionsAPI.js:380` (`explanation.join`) · `MembershipGate.jsx:42` ("LOCKED") · `LecturesPage.jsx:23-25` (empty progress sets) · `PrivacyPage.jsx:9` (`new Date()`) · no katex/mathjax in `apps/web/package.json` · no tutorMode/timedMode/percentCorrect/answerDistribution matches repo-wide.*
