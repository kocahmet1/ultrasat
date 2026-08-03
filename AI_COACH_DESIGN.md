# UltraSAT AI Coach — System Design
*v1 draft for review · 2026-07-26 · Companion mockup: `AI_COACH_MOCKUP.html`*

**Decisions already made**: provider-agnostic model core · freemium access · boundary-speaker proactivity · replaces (not extends) the current AICoachPage / AICompanionPanel / SmartQuizAssistant.

---

## 1. Vision & design principles

One coach. It meets the student at onboarding, remembers everything they do, speaks at the right moments, and can *act* — generate a quiz, write a micro-lesson, adjust the plan — with one tap. It should feel like a tutor who has been in the room for every session, not a chatbot bolted onto a website.

**Principles (these resolve most future design arguments):**

1. **Grounded, never generic.** Every claim the coach makes about the student must trace to real events ("you missed 2 of 3 plural-possessive questions today; same pattern on Jun 30"). The context assembler only feeds it real data; the prompt forbids invented history.
2. **Every observation carries an action.** No commentary without a next step the student can tap: a drill, a micro-lesson, a plan item.
3. **Quiet by default.** The coach never interrupts active work. Proactive speech happens only at boundaries (session start, quiz/exam finished, lesson ended). Otherwise: a small presence with a badge. Student-initiated questions are always allowed, anywhere.
4. **One identity, one memory, one thread.** Same name, avatar, tone, and conversation history on every surface. (Today there are six names and three disconnected chats — all retired.)
5. **Transparent.** The student can open "What my coach knows about me" and see the goals, trajectory, and notes driving the advice. Builds trust; also our answer to parents of minors.
6. **The LLM narrates; the system computes.** Trend detection, accuracy math, and regression flags are mechanical (cheap, reliable, testable). The model turns them into insight and prose. This keeps prescience honest and cost low.

**Persona**: warm, direct, specific; a tutor, not a cheerleader. Second person, plain sentences, references concrete evidence, at most one suggestion per message unless asked. Working name in this doc and the mockup: **"Coach"** — swap in a brand name anytime; it's one constant.

---

## 2. The worked example (your possessives scenario, end to end)

This is the loop the whole architecture exists to close:

1. **Jun 30** — Student takes a Boundaries quiz. Two misses are on questions tagged `concept: plural-possessive`. Each wrong answer is classified by a cheap model: `error_pattern: "apostrophe placed before -s on plural noun"`. Events logged.
2. `conceptState/plural-possessive` updates mechanically: missStreak 2, rollingAccuracy drops, `lastMissed: Jun 30`.
3. **Jul 10** — Student goes 5/5 on the same concept. State flips: `recoveredAt: Jul 10`. The Observer notes recovery in the notebook: *"Jun 30: struggled with plural possessives (2 misses, apostrophe-before-s). Jul 10: recovered, 5/5."*
4. **Jul 25** — Latest quiz: 3/5, both misses again `plural-possessive`. The mechanical trend check raises `regressionFlag: true` (was recovered, now missing again). That flag passes the Observer's significance filter → LLM pass runs with the notebook + fresh events.
5. The Observer writes a **Coach Note**: *"You're not 100% on singular vs plural possessives yet. You were missing these in late June, got them down by July 10, and today they slipped again — both misses were the same pattern: apostrophe before the -s on a plural noun. Want to fix this for good?"* — with two attached actions: `[Read the 60-second lesson]` `[5-question possessives drill]`, plus evidence chips linking to the three actual questions.
6. The note appears **inline on the quiz results page** ("Coach's read") and in the dock badge. The micro-lesson, if tapped, is generated grounded in *their* misses (uses the actual sentences they got wrong as examples). The drill button calls the existing SmartQuiz engine filtered to that concept's questions.
7. The interaction (advice given, action taken or ignored) is itself an event — so next week the coach knows whether the fix stuck *and* whether its suggestion was followed.

Every architectural piece below exists to make step 5 sayable — truthfully — at scale.

---

## 3. The Student Model (three tiers)

The "all-knowing" requirement cannot be met by either raw events (too big for every call) or current aggregates (too lossy — a single `accuracy` number can't say "you recovered, then regressed"). Three tiers, each derived from the one below:

### Tier 1 — Activity Event Stream (ground truth)
Append-only, one schema, one writer API. **Every** surface emits; this replaces today's fragmented writes (`questionAttempts` written only by exams, `attemptHistory` only by quizzes, flashcards/word-quizzes/lessons writing nothing).

| Event | Key payload |
|---|---|
| `question_attempt` | questionId, source (`smartquiz`\|`exam`\|`drill`\|`lesson_quiz`), subcategoryId (kebab, canonical), conceptIds[], difficulty, correct, chosenAnswer, timeSpentMs, parentId (quizId/examId), `errorPattern` (async-classified on misses) |
| `quiz_completed` / `exam_completed` | aggregate scores, per-subcategory breakdown, duration, (exam: module/section scaled scores) |
| `lesson_viewed` | subcategoryId, dwellSeconds, sectionsReached, completedEmbeddedQuiz |
| `flashcard_session` | deckId, cardsReviewed, againCount/goodCount, durationMs |
| `word_saved` / `concept_saved` | itemId, sourceQuestionId |
| `coach_interaction` | noteId/messageId, adviceSummary, actionOffered, actionTaken (bool) |
| `session_start` / `session_end` | entry route, device |

Storage: `activityEvents` top-level collection (userId indexed, immutable) + client SDK `logEvent()` with server-side validation. Server ingestion also triggers Tier-2 updates.

### Tier 2 — Derived State (mechanical, no LLM, updated on ingest)
- **`skillState/{uid}/{subcategoryId}`** — rollingAccuracy (EWMA), last10, attempts, level, `trend` (improving/stable/declining via two-window comparison), lastPracticed, exposure by source, avgTimePerQuestion vs benchmark.
- **`conceptState/{uid}/{conceptId}`** — same, finer grain, plus `missStreak`, `recoveredAt`, `regressionFlag` (recovered→missing-again detector), dominant `errorPattern`. *This is the granularity your possessives example lives at — below subcategory.*
- **`habits/{uid}`** — streak, study days/times, minutes per week, sessions.
- **`vocabState/{uid}`** — words saved, reviewed last 7d, decks touched, review-debt estimate.
- **`examReadiness/{uid}`** — one canonical estimated score per section (single formula — retires the five competing ones), gap-to-target, pacing profile, last-exam deltas.

All numbers any UI shows should come from Tier 2 — dashboards and coach read the same state, so the coach never contradicts the page it's sitting on.

### Tier 3 — Coach Notebook (narrative memory)
`coachNotebook/{uid}` — a compact, LLM-maintained document (~2–4k tokens), the coach's actual "memory of you":

- **Goals & logistics** — target score, exam date, hours/week, constraints (seeded at onboarding).
- **Story so far** — 2–3 paragraph arc of the student's journey.
- **Working observations** — dated, per concept/skill: `plural-possessive: Jun 30 struggled (apostrophe-before-s) → Jul 10 recovered → Jul 25 regressed`. Pruned when resolved.
- **Commitments & follow-ups** — what the coach suggested, what the student accepted/ignored, what's due ("check possessives again ~Aug 1").
- **Preferences** — responds well to short drills, dislikes timed pressure, studies evenings.

Updated by the Observer after significant events; a consolidation pass merges/prunes when it grows. The notebook + Tier-2 slices is what makes "I remember you were missing those a few weeks ago" possible in a single cheap read, without replaying 10,000 events.

### Prerequisite: concept tagging on questions
Concept-level memory requires questions tagged with `conceptIds`. Plan: (a) per-subcategory concept lists already exist in the `concepts` collection — curate/extend them; (b) **AI backfill pipeline** in admin tags the existing bank (batch, cheap model, human spot-check queue — same pattern as your existing question-audit tooling); (c) the generation pipeline tags at creation going forward; (d) on wrong answers, an async cheap-model call classifies the `errorPattern`. Without this layer the coach can only speak at subcategory grain — this is the single highest-leverage content investment in the plan.

---

## 4. The Coach Engine (backend)

One service — `apps/api/coach/` — retiring `companionService`, `assistant.js`/`aiService`, and the orphaned next-steps/quiz-analysis endpoints (their good parts absorbed).

### 4.1 Model Adapter Layer (provider-agnostic)
`modelRegistry` with **roles**, not hardcoded names: `coach.primary` (flagship, large context, tool-calling — Claude/GPT/Gemini pluggable per env config), `coach.classifier` (cheap/fast: error patterns, significance checks, tag backfill), `coach.voice` (optional realtime, later phase). The adapter normalizes messages, tool schemas, streaming, and token accounting. Kills the seven hardcoded model strings and dual API hosts found in the audit.

### 4.2 Context Assembler
Builds each call's context: notebook (always) + Tier-2 slices relevant to the moment + **surface context** (current route, question on screen, the quiz that just finished — with full per-question detail) + conversation tail. Typical budget 10–20k tokens; deep dives (full exam debrief with 98 attempts) fit comfortably in a large-context model. One assembler for chat, observer, and micro-lessons — one place to test grounding.

### 4.3 The Observer (the prescience loop)
Async pipeline on event ingestion:

1. **Tier-2 update** — always, mechanical.
2. **Significance filter** — cheap rules, no LLM: regression flag raised? level changed? exam completed? first session in ≥3 days? commitment follow-up due? weekly summary due? If none → stop (this is the cost gate).
3. **LLM pass** — with assembled context: (a) update the notebook, (b) optionally emit a **Coach Note**: `{text, evidenceRefs[], suggestedActions[], priority, surfaceHint, expiresAt}`.

Notes land in the student's feed; the dock badge lights; high-priority notes also render inline at their `surfaceHint` (e.g. results page). Low-priority observations batch into the session-start briefing instead of pinging immediately — this is how "everpresent" stays un-suffocating.

### 4.4 Interaction API (chat with tools)
One streaming endpoint; the model can call:

| Tool | Effect |
|---|---|
| `create_practice_quiz({subcategoryId? , conceptIds?, difficulty?, count})` | Wraps the existing SmartQuiz engine (already tool-shaped); returns a deep link rendered as a start button |
| `generate_micro_lesson({conceptId, groundEventIds[]})` | Paragraph-length lesson card (see 4.5) |
| `get_student_data({query})` | Structured Tier-1/2 lookups beyond the assembled context ("show my last 5 boundaries quizzes") |
| `add_flashcards({words[]})` / `add_plan_item({...})` | Writes to word bank / weekly plan |
| `link_to({route})` | **Allow-listed** routes only — fixes the current invented-route bug |

The coach **never auto-navigates or auto-starts anything** — every action is a button the student taps. Tool results render as structured cards in the thread, not prose.

### 4.5 Micro-lesson generator ("lesson snippets on the go")
Fixed shape, always grounded: **hook** (the student's actual situation: "twice today you put the apostrophe before the -s on a plural noun") → **core explanation** with a contrast pair (`the student's book` vs `the students' books`) → **their own missed sentence, corrected** → **one check question** → **CTA** (3–5 question drill on the concept). Rendered as an expandable card (panel, results page, or coach page). Generated fresh (personalization is the point); a per-(concept, errorPattern) cached generic version serves as fallback under quota. Saveable to the student's notes/concept bank.

### 4.6 One conversation store
`coachThreads/{uid}` — a single thread per student, messages annotated with surface origin; dock panel, results-page chat, and `/coach` page all read/write the same thread. Continuity = thread tail + notebook. (Replaces three divergent, write-only chat stores.)

### 4.7 Cost, quotas, ledger
Per-call token accounting into a real `tokenLedger` (the current admin dashboard reads a collection nothing writes — point it here). Per-tier daily budgets enforced centrally (see §7). Caching: notebook is small by design; briefings cached until next significant event; micro-lesson fallback cache. Rough envelope at gpt/claude-flagship pricing: an active student triggering ~6 significant events + 10 interactions/day ≈ 200–400k tokens/day worst case — freemium caps and the significance gate keep the median far below this; the ledger gives real numbers by week two.

---

## 5. The Interface

**One system, four presentations.** The mockup (`AI_COACH_MOCKUP.html`) shows all four with the possessives scenario.

### 5.1 Coach Dock (global presence)
A small, fixed element on every authenticated page (bottom-right pill: avatar + status). States: **idle** (just present, fully quiet), **has-note** (badge + a one-line peek that slides out once and auto-retracts: "I noticed something in that quiz"), **thinking** (subtle pulse while a debrief generates). Clicking opens the Panel. Hard rules: never auto-opens; never covers interactive controls; **completely hidden during timed exam modules** (returns at intermission and after submission); hidden for guests (the coach is an account feature — its absence is part of the signup pitch).

### 5.2 Coach Panel (primary interaction)
- **Desktop**: right-side panel, ~400px. On wide screens it *pushes* the content (docks into the layout — integrates with study surfaces rather than floating over them); overlays with scrim only on narrow windows.
- **Mobile**: bottom sheet, half-height → draggable to full.
- **Contents**: context chip (what the coach can currently see: "Boundaries quiz · just finished"), then the **feed** — coach notes and cards, newest first — then the chat input.
- **Card types**: Observation (text + evidence chips that link to the actual questions), Micro-lesson (collapsed → expandable), Action (primary button: "Start 5-question drill"), Briefing (session start), Plan. Cards, not walls of text — scannable in five seconds, expandable when the student cares.

### 5.3 Inline Coach Moments (the coach occupying parts of pages)
Rendered from the same feed (a note with a `surfaceHint` shows in-page *and* lives in panel history):
- **Quiz/exam results**: "Coach's read" block at the top — 2–3 sentences + actions. Generated during the scoring transition so it's ready when the page paints (hides latency). This is the natural home of your possessives paragraph.
- **Dashboard / Progress**: "Today" briefing card — the session-start boundary.
- **Lesson exit**: one-line follow-up strip ("Want 3 questions on what you just read?").

### 5.4 Coach Page (`/coach`)
The dedicated page: **left** — the full conversation (same thread); **right** — "What I know about you": goals & exam countdown, current focus list (from notebook), per-skill trajectory sparklines (Tier 2), recent notes, commitments. Plus settings: proactivity dial (quiet / normal / chatty — student-adjustable within the boundary-speaker frame) and the transparency view. Replaces `AICoachPage` at the same route the whole nav already points to — the links finally lead somewhere real.

### 5.5 Session choreography (a day in the life)
Login → dock shows badge; dashboard shows briefing card ("You're 6/10 on this week's plan. Boundaries needs a look — yesterday's quiz slipped.") → student takes a quiz; dock silent; student can still ask "why is B wrong?" anytime (student-initiated ≠ interruption; in-quiz answers are hint-constrained, full explanations after submission) → results page paints with Coach's read + actions → student taps the drill; completes it → coach: one line: "5/5. That's the pattern fixed — I'll check again next week." (commitment logged) → lesson exit strip, flashcard nudge only if review-debt is high, weekly summary lands as a note, not a popup.

---

## 6. Surface integration map

| Surface | Emits (Tier 1) | Receives from coach | Change required |
|---|---|---|---|
| **Onboarding** | goals, self-assessment → seeds notebook | Coach *conducts* onboarding (conversation: target, date, hours/week, strengths self-report, then walks them into the diagnostic) | Replaces both current onboardings + TargetScoreModal; single flow, exit to dashboard |
| SmartQuiz | question_attempts, quiz_completed | silent presence; in-quiz Q&A; results debrief | Emit events; remove SmartQuizAssistant modal; keep vocab/concept helper as a coach tool |
| Practice exams | attempts, exam_completed | hidden during modules; full debrief after (section trends, pacing, top-3 fixes) | Emit events; debrief block on results |
| Lessons (`/learn`) | lesson_viewed (dwell, sections) | exit follow-up; coach can *recommend* lessons with reasons | **Add dwell tracking (doesn't exist)** |
| Flashcards | flashcard_session | weekly vocab guidance ("120 words saved, 14 reviewed — 15 mins would clear the backlog") | **Add session persistence (doesn't exist)** |
| Word/Concept bank | word_saved, concept_saved | coach saves words via tool; micro-lessons saveable here | Minor |
| Dashboard | session_start | briefing card | Replace fake data with Tier-2 + coach card |
| Progress | — | notes contextualized per skill; "ask coach about this skill" on each card | Reads same Tier-2 as coach |
| Guest surfaces | — | none — coach absence is the signup pitch ("create an account and I'll start remembering you") | Copy only |

---

## 7. Freemium shape

| | Free | Plus |
|---|---|---|
| Coach onboarding | ✓ | ✓ |
| Session briefings | weekly summary only | daily |
| Post-quiz debrief | short form (2 sentences, 1 action) | full, with evidence + micro-lesson |
| Chat interactions | ~3/day | high cap |
| Micro-lessons | 2/week taste | on demand |
| Coach-generated drills | 1/week | unlimited |
| Exam debrief | section scores only | full analysis |

Paywall moments happen **in the coach's own voice, inline** ("I can write you the 60-second fix for this — that's a Plus feature. [See Plus]") — one upgrade component, retiring the four inconsistent modals. Quotas enforced server-side in the coach service (finally, real gating).

---

## 8. Structural changes required (you approved; ordered)

1. **Taxonomy unification first** — one kebab-case subcategory module shared by web + api; migration script re-attributes existing progress docs. *The coach must not learn from corrupted attribution (audit §3.1). Non-negotiable prerequisite.*
2. **Event stream + SDK** — and retrofit every surface to emit (also fixes the audit's "flows that don't feed tracking").
3. **Concept tagging backfill** — admin pipeline + error-pattern classification.
4. **Lesson dwell + flashcard session persistence** — new, small.
5. **One API base URL** — collapse the two Render hosts.
6. **Decommission**: AICoachPage (route stays, new page), AICompanionPanel + context, SmartQuizAssistant, AIOnboardingSidePanel, companion/assistant endpoints. **Absorb**: `aggregateUserContext` (→ context assembler), next-steps logic (→ Observer), quiz-analysis (→ error-pattern classifier), SmartQuiz creation utils (→ tool), helper cache (kept), realtime voice plumbing (→ Phase 4 behind adapter).

## 9. Build phases (each shippable)

- **Phase 0 — Foundations (no visible AI).** Taxonomy fix, event stream + emitters, Tier-2 derivations, canonical score formula, concept backfill started. *Bonus: fixes a third of the audit on the way.*
- **Phase 1 — Coach v1.** Model adapter, context assembler, single thread, dock + panel, post-quiz debrief (Tier-2-grounded, pre-notebook), chat, `create_practice_quiz` tool, results-page inline block, `/coach` page skeleton, token ledger + quotas.
- **Phase 2 — Memory & prescience.** Notebook, Observer + significance rules + coach notes, regression detection surfaced, micro-lessons, session briefings, coach-led onboarding. *The possessives scenario works end-to-end here.*
- **Phase 3 — Full breadth.** Exam debriefs, lesson/flashcard loops, weekly plan + commitments, transparency page, freemium paywall moments, notification digests.
- **Phase 4 — Delight.** Voice mode (realtime adapter role), email re-engagement, tone A/B, parent-facing progress letter.

## 10. Risks & guardrails

- **Hallucinated memory** is the killer risk: mitigated by assembler-only data, evidence refs on every note (UI renders them as chips), and an eval set of student histories with expected/forbidden claims run against prompt changes.
- **Cost blowout**: significance gate + tier quotas + ledger dashboards from day one; classifier work on cheap models.
- **Latency**: debriefs pre-generated during score transitions; streaming everywhere else.
- **Tag quality gates prescience**: concept backfill needs a human spot-check queue before the coach speaks at concept grain; until then it speaks at subcategory grain (still useful).
- **Minors & trust**: notebook fully user-visible; deletion path (delete events → rebuild Tier 2 → regenerate notebook); coach tone guidelines reviewed for teen audience.
- **Provider swap**: adapter tested against two providers in CI so "agnostic" stays true.

---

*Next steps after your review: (1) agree/adjust the interface direction in the mockup, (2) lock the coach's name, (3) I spec the event schema + Tier-2 documents in detail and we start Phase 0.*
