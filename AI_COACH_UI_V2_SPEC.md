# Coach UI v2 — "The coach is the interface"
*Companion to `AI_COACH_UI_V2_MOCKUP.html` · 2026-08-20 · follows up AI_COACH_DESIGN.md §5*

> **IMPLEMENTED 2026-08-20** (cuts A–D in one change set). Engine: `coach/blocks.js`
> (sanitize + hydrate + shared action validator), block-emitting prompts in
> `coachRoutes.js` (debrief) and `observer.js` (briefing/exam note), structured
> commitments on the notebook meta, `GET /api/coach/briefing`. Web:
> `CoachBlocks.jsx` (one renderer), `BriefingHero.jsx` on Home with the
> mechanical no-LLM fallback, dock peek in `CoachDock.jsx`, staged takeover +
> inline micro-lesson in `CoachDebrief.jsx`, `/coach` rebuilt as HQ
> (trajectory from authoritative `practiceExams`, focus queue, wins/watchlist,
> commitments, journey, memory, ask bar + thread drawer), mission ticks with
> `coach_interaction` events + auto-tick via the `ultrasat:activity` broadcast
> in `coach/events.js`. No schema/rules/index changes required; old
> `{message, actions}` notes render as verdict cards everywhere.

## The problem being solved

The engine (observer triggers, Tier-2 grounding, notebook memory, validated actions, micro-lessons)
is already structured and specific — but every surface renders it as chat bubbles, so the product
*reads* as a generic chatbot. v2 changes the contract between coach and UI, not the engine.

**Principle: the LLM supplies judgment; the UI supplies presentation.** The coach emits **typed
blocks**; each surface renders the blocks it cares about using the existing ut-kit design system.
Prose paragraphs stop being the product.

## Block contract v1

A coach note grows from `{ message, actions[] }` to:

```jsonc
{
  "kind": "briefing" | "debrief" | "exam-note" | "chat-reply",
  "source": "observer" | "debrief" | "chat" | "mechanical-fallback",
  "reasons": ["new_concept_regression", "weekly_summary_due"],   // already computed by observer.js
  "tone": "fix" | "steady" | "win" | "exam",
  "blocks": [
    { "type": "verdict",  "text": "≤280 chars, **bold** allowed", "tone": "fix",
      "evidence": [{ "label": "Q2 · Aug 19 quiz", "ref": "quiz:<id>#2" }] },
    { "type": "plan",     "title": "Today", "minutes": 30, "items": [
        { "id": "m1", "label": "...", "sub": "...", "why": "regression|slipping|stale|new",
          "minutes": 12, "action": { "type": "quiz|lesson|link", "...": "..." } } ] },
    { "type": "focus",    "items": [{ "subcategoryId": "boundaries", "reason": "regression" }] },
    { "type": "stat",     "kind": "pace|streak|estimate", "daysToExam": 28, "estimate": 920, "target": 1400, "note": "..." },
    { "type": "history",  "conceptId": "plural-possessive",
      "nodes": [{ "date": "2026-06-30", "state": "missed" }, { "date": "2026-07-10", "state": "recovered" },
                { "date": "2026-08-19", "state": "regressed" }, { "date": "2026-08-24", "state": "recheck" }] },
    { "type": "lesson",   "...existing micro-lesson shape unchanged..." },
    { "type": "commit",   "label": "Re-check possessives", "dueDate": "2026-08-24", "source": "debrief:<noteId>" },
    { "type": "ask",      "prompt": "...", "choices": ["...", "...", "..."] }
  ]
}
```

Validation rules (extend `sanitizeActions` → `sanitizeBlocks` in `coachRoutes.js`):

- Unknown block types dropped; per-type field whitelists + length clamps, same pattern as today.
- **Numbers are never the model's.** For `stat`, `focus`, `history` the model outputs *selectors*
  (which stat, which concept); the server fills values from Tier-2 / conceptState before storing
  the note. The model cannot mis-state a score by construction.
- `plan.items[].action` passes through the existing action sanitizer (canonical subcategory,
  allow-listed routes).
- A note with only `message` + `actions` (old shape) is auto-wrapped as one `verdict` block —
  **new UI ships without a prompt change; prompt upgrade lands separately.**

## Fallback chain (nothing is ever blank)

1. Fresh note with blocks (observer/debrief).
2. Cached most-recent briefing (until next significant event).
3. **Mechanical brief** — built client-side from Tier-2 the page already loads (weakest last-10
   skills → default plan items; streak/pace stats). Zero model calls; labeled honestly in the UI
   (`auto-brief · no model call`). This also solves the free-tier quota problem: quota exhausted →
   surfaces stay full, just mechanical.

## Surfaces

| Surface | Renders | Notes |
|---|---|---|
| **Home hero** (`Dashboard.jsx`) | `verdict + plan + stat` of latest briefing; tone drives border/accent state (fix/steady/win/exam) | Mission ticks are live: completing the underlying quiz/lesson (existing events) marks the card done. Manual tick allowed for `routine` items. |
| **Coach HQ** (`CoachPage.jsx` rebuilt) | trajectory band (exam sittings + projection vs target), today's brief, coach-ranked focus queue (`focus` + conceptState), wins/watchlist (trend), commitments (`commit` + notebook follow-ups), journey (milestone notes, not scrollback), memory drawer (notebook, per-line "not right?" feedback), **ask bar** with thread drawer | Chat demoted, not removed: one `/chat` endpoint unchanged. |
| **Quiz results** (`SmartQuizResults`) | staged takeover: verdict → tagged question strip → `history` pattern timeline → primary CTA + inline `lesson` | Generate during the scoring transition (already the design intent) so reveal feels instant. |
| **Dock** (`CoachDock.jsx`) | peek ticker: one `verdict` line + ≤2 actions, slides out at boundaries, auto-retracts to badge; tap deep-links to the note's `surfaceHint` surface | Chat panel still reachable inside; never the default tap target. Hidden rules unchanged (guests, timed modules). |

## Implementation cuts

- **A — Re-costume (frontend only).** `CoachBlocks.jsx` renderer; old notes render as verdict
  cards; dock peek; debrief takeover layout + reveal. No backend change.
- **B — Blocks in the engine.** `sanitizeBlocks`; debrief + observer prompts ask for blocks;
  server-side number injection; `history` from conceptState.
- **C — Home hero + HQ.** BriefingHero with tones + mechanical fallback; CoachPage → HQ;
  `CoachContext` gains `latestBriefing` + mission-state selectors.
- **D — Close the loop.** Mission ticks emit `coach_interaction` (advice taken/ignored) so the
  coach learns what lands; `commit` blocks auto-created from notebook follow-ups; **fix the
  exam-score pipe** (`AI_COACH_DATA_FLOW_REPORT`) so the trajectory band is honest.

## Signal-quality gates (added 2026-08-20)

Not every completed sitting is evidence. Verdicts are computed ONCE, client-side, at write time
(`apps/web/src/coach/signalQuality.js`) and stored on the result (`coachSignal` on
`practiceExams` / `smartQuizzes` docs, `lowSignal` on events); the server only renders them.

| Gate | Rule | Effect |
|---|---|---|
| Blank module | 0 questions answered | module excluded (already excluded from scoring too) |
| Mostly-blank module | answered < half | module's attempts never become Tier-2 events |
| Rushed module | active time < 2 min | same |
| Rushed quiz | active time < 1 min | no attempt events; debrief endpoint returns a canned acknowledgment with **no model call and no quota spent** |

A sitting with zero valid modules is `lowSignal` end-to-end: excluded from `stat` estimates,
the HQ trajectory, and skill analysis — but still **acknowledged**: the assembler labels it
`COMPLETED BUT OVERLOOKED (reasons)`, prompts forbid citing its numbers, and the HQ journey
shows "sitting logged — overlooked". Module timing comes from `ExamModule`'s clock
(`timeSpentSeconds` in the completion payload); quiz timing from summed per-question
`timeSpent` with a `startedAt` wall-clock fallback; unknown timing never triggers a gate.
Old results predate the flags — hide any junk ones from the coach via All Results → exclude.

**Progress page + history scrub (same day).** The gates also protect the user-facing
counters: the exam controller's per-module progress update now treats `''` answers as
omissions and skips low-signal modules entirely, and a sub-minute quiz early-exits
`recordSmartQuizResult` after the doc write — no level progression, no progress counters,
no attempt history, no concept mastery, no peer stats (it still emits its flagged
completion event so the coach acknowledges it). Progress bars are tiered by the same
thresholds as the last-10 chip (≥80 green · 50–79 amber · <50 red; neutral blue until
first attempts). Historical inflation is cleaned by `scripts/backfill-coach-events.js`
**v2**: retro verdicts from stored responses (blank answers were backfilled as WRONG
attempts by v1 — the "105 answered · 0%" bug), stale junk events deleted, live junk
excluded at replay, retro `coachSignal` written to old docs, Tier-2 rebuilt, and
`users/{uid}/progress` counters recomputed from the gated replay (level/askedQuestions/
attemptHistory preserved). Dry-run first: `node scripts/backfill-coach-events.js --user <uid>`,
then `--apply`.

Candidate gates deliberately NOT yet implemented: straight-line answering (same option ≥90%
of a module), sub-2s median per-question time on passage questions, retakes of the same exam
(inflated by seen questions), lesson views with dwell < 15s, and level promotion earned by a
low-signal quiz (promotion logic currently still honors it).

## Guardrails carried over

- Every claim keeps evidence refs → rendered as chips linking to real questions/quizzes.
- Coach never navigates/auto-starts; blocks are tappable, not executable.
- Quiet-by-default unchanged — richer surfaces don't mean more speech; the significance gate
  still decides *when*, blocks only change *what it looks like*.
- Token cost: unchanged call count; slightly larger outputs (~+20-30% debrief/observer tokens),
  offset by the mechanical fallback absorbing quiet days that previously spent a call.
