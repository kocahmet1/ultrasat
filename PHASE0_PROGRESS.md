# AI Coach — Phase 0 + 1 + 2 + Roadmap Progress
*Sessions of 2026-07-28 · Design refs: `AI_COACH_DESIGN.md`, `SITE_AUDIT_REPORT.md`*

## Session 5 — remaining roadmap

### Concept-tagging backfill — `scripts/backfill-concept-tags.js`
Tags the question bank at concept grain using the cheap classifier model. Per subcategory: loads curated `predefinedConcepts` (with `--generate-concepts` it drafts missing lists, marked `generated:true` for admin review); classifies untagged questions in batches of 10 (1–3 conceptIds each, "unclear" allowed); writes BOTH stores the app reads (`questionConceptAssociations/qca_{id}` + `questions.conceptIds`). Deterministic ids → idempotent. Dry-run default; `--subcategory`, `--limit`, `--retag`, `--apply`. Run on your machine (needs googleapis + model key). Suggested pilot: `node scripts/backfill-concept-tags.js --subcategory boundaries --limit 30 --generate-concepts` then review, then `--apply`, then widen.

### Freemium tier caps (design §7)
`coachRoutes.js`: per-feature daily quotas by membership tier — free `{chat 3, debrief 5, micro_lesson 1, observe 2}`, plus `{60, 40, 12, 10}`, max `{100, 60, 20, 15}` — counters in `coachUsage/{uid}`, tier read server-side (real enforcement, not cosmetic). `/status` returns the limit table.

### The real `/coach` page
`pages/CoachPage.jsx` replaces the static mock at **`/ai-coach`** (every existing nav link now lands on the real coach) + new alias **`/coach`**. Left: the one conversation thread (shared with the dock; lesson cards work here too). Right: goals + exam countdown, "Current focus" (weakest skills from Tier-2, tap-to-practice, live trend arrows), and **"What I know about you"** — the notebook, fully visible (new `GET /api/coach/notebook`). `/ai-coach` removed from the custom-shell list so the normal app chrome shows. `pages/AICoachPage.jsx` is now orphaned (delete when convenient).

### Decommission-lite
- Companion **auto-greeting disabled** — it was firing an LLM call on every login with its panel no longer mounted (pure cost, no UI). The Observer owns session-start now.
- Stale `refreshGreeting()` calls removed from SmartQuizResults + ExamResults (debrief/observe replaced them).
- AICompanionContext remains ONLY for `isFirstTimeUser` (onboarding redirect) until onboarding is migrated to the coach.

### Ship notes
Deploy API + web; run `npm run build` locally as the compile gate (repo mount unavailable in my sandbox — files verified by piped parse checks). Then run the two backfills in order: events (`backfill-coach-events.js`), then concept tags (`backfill-concept-tags.js`).

### Remaining (small, future sessions)
Coach-led onboarding (replace OnboardingPage/TargetScoreModal; retire AICompanionContext fully) · fold the in-quiz helper into the coach (surface `{questionId}` context in /chat) · short-form debrief for free tier · async error-pattern classifier on misses · voice mode (adapter role exists) · admin review UI for `generated:true` concepts.

---

## Session 4 — Phase 2: memory & prescience

### The notebook (Tier 3) — `apps/api/coach/notebook.js`
`coachNotebook/{uid}`: LLM-maintained markdown memory (Goals / Story / **dated Working observations** ("plural-possessive: Jun 30 struggled → Jul 10 recovered → Jul 25 REGRESSED") / Commitments / Preferences), hard-clamped to 7k chars, plus mechanical `meta` (lastBriefingDay, lastWeeklyNoteAt, acknowledgedRegressions) that the significance rules use. Server-only collection.

### The Observer — `apps/api/coach/observer.js` + `POST /api/coach/observe`
Client pings at boundaries; **mechanical significance rules run first — insignificant pings never touch the LLM** (free). Rules: exam completed · returning after ≥3-day gap · weekly summary due · **new concept regression not yet surfaced** · exam ≤14 days away · first-ever briefing. One briefing max per day (regressions can break through). When significant: ONE model call updates the notebook **and** writes a proactive Coach Note (validated actions), which lands in `coachNotes` + the thread; the client badges it. Acknowledged regressions are recorded so the coach never nags about the same one daily.

### Debrief now has memory
`/debrief` includes the notebook in context ("you had this fixed in early July…") and returns the updated notebook in the same single call — no extra cost for memory maintenance at the highest-frequency moment.

### Micro-lessons — `POST /api/coach/micro-lesson`
The "ever-present tutor" moment: title + hook (grounded in *this student's* misses) + explanation with contrast pair + interactive 2-option check question + optional drill CTA. New `lesson` action type (validated) — coach notes and debriefs can now offer "60-second lesson" buttons; the lesson renders as an interactive card in the panel (`LessonCard` in `CoachDock.jsx`).

### Client wiring
- `CoachContext`: `observe()` (auto-fires once per session at login — the session-start boundary), `requestMicroLesson()`, notes → thread + unread badge.
- `ExamResults.jsx`: exam-completed boundary pings the Observer.
- `CoachDock`/`CoachDebrief`: handle `lesson` actions; lesson cards with the interactive check.

### Ship notes
Deploy API + web build (no new env; optional `COACH_*` overrides). Verified by piped parse/syntax checks (repo mount unavailable in sandbox this session) — **run `npm run build` locally as the final compile gate.**

### Still open (next sessions)
Concept-tagging backfill pipeline (widens concept-grain coverage beyond existing associations + drills) · `/coach` full page (thread + "what I know about you" transparency) · decommission remaining AICompanion/assistant stack + fold in-quiz helper into the coach · freemium tier caps per design §7 (current: flat daily quota) · async error-pattern classifier on misses.

---

## Session 3 — Phase 1 v1: the coach is live (backend + UI)

### Backend (`apps/api/coach/`)
- **`modelAdapter.js`** — provider-agnostic model layer. Roles (`primary`, `classifier`) configured by env; OpenAI / Anthropic / Gemini all via plain fetch. **Works with zero new config** (defaults to OpenAI `gpt-5-mini` on your existing `OPENAI_API_KEY`). Swap providers anytime: `COACH_PRIMARY_PROVIDER=anthropic COACH_PRIMARY_MODEL=<model>` etc. JSON-mode outputs (uniform across providers); non-streaming v1.
- **`contextAssembler.js`** — builds the grounded context: profile + habits + vocabState + every skillState (sorted weakest-first) + **concept alerts (regressionFlag / miss streaks — the mechanical cues)** + last 20 activity events + full detail of the quiz under discussion (per-question correct/missed with text snippets). The single audit point for "what can the coach know".
- **`coachRoutes.js`** (mounted at `/api/coach` in `serverApp.js`):
  - `POST /debrief {quizId}` — the "Coach's read" for a finished quiz. Idempotent (one note per quiz, cached in `coachNotes/{uid}/notes`).
  - `POST /chat` — one thread per student (`coachThreads/{uid}/messages`), surface-aware, history included.
  - `GET /thread`, `GET /status`.
  - **Guardrails**: grounded system prompt (only assembled data may be referenced); model-proposed actions validated server-side — quiz actions must resolve to canonical subcategories, links must be on a route allow-list; per-user daily quota (`COACH_DAILY_CALL_QUOTA`, default 60) + per-IP rate limit; **every call written to `tokenLedger`** (the cost dashboard finally has a writer to point at).
  - Coach collections are server-only (admin SDK); client access stays denied by the rules catch-all — no rules changes needed.

### Frontend
- **`api/coachClient.js`** · **`contexts/CoachContext.jsx`** — availability, one thread, unread badge, optimistic chat, debrief cache.
- **`components/coach/CoachDock.jsx` + `coach.css`** — the global dock + panel from the mockup: never auto-opens, badge for unread, hidden for guests and during exam work (`/practice-exam/*`, `/exam/*` except results, `/intermission`). Action buttons: quiz → existing SmartQuiz generator with state; link → allow-listed route.
- **`components/coach/CoachDebrief.jsx`** — inline "Coach's read" on **SmartQuizResults**, with one-tap actions; renders nothing if the coach is unavailable.
- **`App.jsx`** — `CoachProvider` mounted; `CoachDock` global in RootLayout; **old `AICompanionPanel` unmounted** (provider kept temporarily — other pages still import its context; full decommission is a follow-up).

### To ship Phase 1 v1
1. Deploy the API (no new env needed; optional: `COACH_*` vars).
2. Ship the web build.
3. Recommended: create the Firestore composite index `activityEvents(userId asc, clientTs desc)` — the assembler works without it via fallback, but the console link in server logs will hand it to you on first run.
4. Run `npm run build` (or `npm test`) locally once as the final compile gate — my sandbox lost the repo mount near the end, so the last-mile compile check is on you (all new/edited files were parse-verified individually).

### Next (Phase 2 — memory & prescience)
Observer pipeline + significance rules + coach notebook; session-start briefings; micro-lessons; concept-tagging backfill (unlocks concept-grain coaching); decommission remaining AICompanion/assistant stack; `/coach` full page.

---

## Session 2 additions (backfill + remaining emitters)

### Pure reducers extracted — one implementation for live + replay
- **`apps/web/src/coach/tier2Reducers.js`** — all Tier-2 logic (skill/concept/habits/vocab reducers + `replayEvents()`) in a dependency-free module. `coach/tier2.js` is now persistence-only and re-exports the pure API (existing tests/imports unchanged; a dev-mode guard asserts event-type agreement).

### Historical backfill + Tier-2 rebuild — `scripts/backfill-coach-events.js`
- Converts **smartQuizzes** (completed) and **users/{uid}/practiceExams + responses** into canonical `activityEvents` with **corrected subcategory attribution** (the top-level `questionAttempts` mirror is deliberately not read — avoids double counting).
- **Deterministic event IDs** (`bf1_*`) → fully idempotent; re-runs overwrite, never duplicate. Backfilled events carry `backfilled: true, origin: 'backfill-v1'`.
- Rebuilds Tier-2 by loading ALL of a user's events (backfilled + live), sorting chronologically, and replaying through the same `replayEvents()` the app uses.
- **Dry-run is the default** — prints per-user counts, regression detections, and a re-attribution table showing exactly how many historical attempts move off the old wrong numeric map (ids 7-12, 16-18). `--apply` writes; `--user <uid>` pilots one user; `--limit N`, `--rebuild-only`, `--verbose`, `--credentials <path>`.
- Uses REST transport (`preferRest`) + 30s connectivity fail-fast.
- Verified in-session: syntax, credential auto-detection, ESM reducer import from node, and an in-memory replay reproducing the struggle→recovery→regression cycle. **The live Firestore dry-run could not run from my sandbox (googleapis.com blocked) — run on your machine:**
  1. `node scripts/backfill-coach-events.js --limit 5` (dry run, inspect the re-attribution table)
  2. `node scripts/backfill-coach-events.js --user <a-test-uid> --apply` (pilot one account, check `/progress`-relevant data + `users/{uid}/skillState`)
  3. `node scripts/backfill-coach-events.js --apply` (full run; safe to re-run)
  Requires the Firestore rules from session 1 to be deployed first only for the *web* emitters — the admin script itself bypasses rules.

### Remaining emitters wired
- **`session_start`** — `components/AnalyticsTracker.jsx`: gap-detected (4h inactivity), once per session, entry route + device. Feeds habits/streaks.
- **`word_saved` / `concept_saved`** — SmartQuiz save-to-bank flow now logs saves with term, subcategory, and source question.

*(Still open from the Phase 0 list: rebuild admin endpoint (the script covers it operationally for now), concept-tagging backfill pipeline, then Phase 1 — coach service + dock/panel UI.)*

---

## Shipped this session

### 1. Canonical subcategory taxonomy (single source of truth)
- **`apps/web/src/data/subcategoryTaxonomy.json`** — THE taxonomy: 29 subcategories × {kebab id, numericId, display name, domain, section, color, aliases}. Edit only this file.
- **`apps/web/src/utils/subcategoryTaxonomy.js`** — access layer + `toCanonicalSubcategoryId()`: resolves numeric ids, display names, aliases, underscore/space variants → canonical kebab. Deterministic, no keyword guessing.
- **`apps/api/subcategoryTaxonomy.js`** + **`apps/api/data/subcategoryTaxonomy.json`** — CommonJS mirror for the future coach service.
- **`scripts/verify-taxonomy.js`** — drift check (web↔api byte-identical + structural sanity + authoring-intent spot checks). `--fix` re-syncs. Add to CI.
- **`subcategoryUtils.js` and `subcategoryConstants.js` refactored** to derive every map from the canonical taxonomy — export surfaces unchanged, ~100 call sites untouched.

**The corruption bug is fixed:** the old `NUMERIC_ID_TO_KEBAB_CASE` in `subcategoryUtils.js` disagreed with authoring intent for numeric ids **7, 8, 9, 10, 11, 12, 16, 17, 18** (e.g. questions authored as "Rhetorical Synthesis" (7) recorded progress under *form-structure-sense*). Canonical mapping now follows `subcategoryConstants` ordering — verified as authoring truth because the admin QuestionEditor's dropdown reads from it. Bonus fixes that fell out: `getSubcategorySubject/Category/Color` now accept kebab ids too (kills the ExamResults R&W→Math misbucketing and the ProgressDashboard "Uncategorized" flattening at their root), and `normalizeSubcategoryName("Cross-Text Connections")` no longer returns the display name unchanged.

### 2. Tier-1 activity event stream
- **`apps/web/src/coach/eventTypes.js`** — event schema v1: `question_attempt`, `quiz_completed`, `exam_completed`, `drill_completed`, `lesson_viewed`, `flashcard_session`, `word_saved`, `concept_saved`, `coach_interaction`, `session_start` + validation.
- **`apps/web/src/coach/events.js`** — `logEvent()` / `logQuestionAttempts()` SDK: normalizes subcategories at the boundary, never throws into surfaces, batched writes, triggers Tier-2 fold.
- **`firestore.rules`** — new `activityEvents` collection: owner-create only, **no update/delete** (append-only ground truth); type allow-list enforced.

### 3. Tier-2 derived student state
- **`apps/web/src/coach/tier2.js`** — pure reducers + persistence:
  - `users/{uid}/skillState/{subcategoryId}` — lifetime + last-20 window accuracy, EWMA, per-source buckets, avg time, mechanical **trend** (improving/declining/stable).
  - `users/{uid}/conceptState/{conceptId}` — miss streaks, recovery detection, **`regressionFlag`** (recovered → missing again: the "possessives" cue the coach narrates), error-pattern counts.
  - `users/{uid}/habits/summary` — streaks, active days, minutes.
  - `users/{uid}/vocabState/summary` — saves + flashcard sessions.
  - Reducers are pure and exported → incremental updates and full rebuilds share code and can't drift. All percents are integers by construction (the audit's silent-rules-rejection class is structurally gone in the new stores).
- **Rules** added for all four Tier-2 subcollections.

### 4. Event emitters wired into live surfaces
| Surface | File | Emits |
|---|---|---|
| SmartQuiz (single + meta) | `utils/smartQuizUtils.js` → `recordSmartQuizResult` | per-question `question_attempt` (with conceptIds where associations exist) + `quiz_completed` |
| Practice exams / diagnostics | `firebase/userExamServices.js` → `saveComprehensiveExamResult` | `question_attempt` per response + `exam_completed` (timeSpent deliberately omitted — the controller's value is a placeholder) |
| Concept drills | `pages/ConceptPractice.jsx` | `question_attempt` (conceptIds) + `drill_completed` — drills were previously invisible to tracking |
| Flashcards | `components/FlashcardStudy.jsx` | `flashcard_session` (known/unknown, duration) — previously persisted nothing |
| Lessons | `pages/SubcategoryLearnPage.jsx` | `lesson_viewed` with visible dwell seconds (visibility-aware; <5s bounces ignored) — previously invisible |

All emitters are fire-and-forget: an event failure can never break a quiz/exam/lesson.

### 5. Tests + verification
- **`src/utils/__tests__/subcategoryTaxonomy.test.js`** and **`src/coach/__tests__/tier2.test.js`** — permanent Jest regression tests (incl. the full struggle→recovery→regression→cleared cycle and the 1..29 utils/constants agreement sweep).
- Verified in-session: taxonomy structural checks ✓, resolver 9/9 ✓, 58-case consistency sweep ✓, 17 reducer behavior checks ✓, all 10 touched files parse ✓. (The sandbox VM was too slow for a full Jest run over the network mount — run `npm test` locally once; it should be green.)
- Incidental bug fixed: ConceptPractice results screen showed "answered **undefined** out of N" (`correctAnswers` → `correctCount`).

## Deployment notes
1. **Deploy Firestore rules** (`firebase deploy --only firestore:rules`) before shipping the web build — otherwise event writes are denied (harmless: fire-and-forget, but no data collected).
2. Ship the web build. From that moment every quiz, exam, drill, flashcard session, and lesson view builds the student model.
3. No behavior changes visible to students (except the two bug fixes noted).
4. Progress writes for numeric-tagged questions now land under the *correct* subcategory. Historical `users/{uid}/progress` docs written under the wrong kebab ids remain as-is for now — superseded by the rebuild below rather than patched in place.

## Not done yet (next sessions, in order)
1. **Backfill script**: convert historical `questionAttempts` + `smartQuizzes` (userAnswers) + `practiceExams/responses` into `activityEvents` with corrected attribution, then rebuild Tier-2 by replaying through the same reducers. (Deliberately not rushed in this session — it touches production data and deserves a dry-run mode.)
2. `session_start` emitter (app-shell level) + `word_saved`/`concept_saved` emitters in the SmartQuiz save-to-bank flow.
3. Rebuild endpoint/admin tool (replay events → Tier-2) using the exported pure reducers.
4. Concept tagging backfill pipeline (admin, AI-assisted) — unlocks concept-grain coaching; until then the coach speaks at subcategory grain.
5. Phase 1: model adapter + context assembler + coach dock/panel + post-quiz debrief (per `AI_COACH_DESIGN.md` §9).

## Invariants to protect (for future changes)
- Only `toCanonicalSubcategoryId()` converts subcategory formats. Never hand-write a map.
- Events are append-only; schema changes bump `EVENT_SCHEMA_VERSION`, never mutate history.
- Tier-2 changes go through the pure reducers so replay stays equivalent.
- All percent fields are integers.
- `node scripts/verify-taxonomy.js` must pass (wire into CI/pre-commit).
