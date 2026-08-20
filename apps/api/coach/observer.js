/**
 * AI Coach — the Observer (Phase 2): the prescience loop.
 *
 * Client surfaces ping `POST /api/coach/observe` at boundaries (session start,
 * exam finished). The Observer:
 *   1. runs MECHANICAL significance rules against Tier-2 state (cheap, no LLM);
 *      insignificant pings cost nothing and return no note;
 *   2. when significant, runs ONE primary-model call that (a) updates the
 *      notebook and (b) writes a proactive Coach Note for the student.
 *
 * Quiz/drill completions are NOT handled here — the debrief route covers those
 * moments (and maintains the notebook in the same single call).
 */

const { complete, parseJsonResponse } = require('./modelAdapter');
const { assembleStudentContext } = require('./contextAssembler');
const { getNotebook, saveNotebook, NOTEBOOK_CONTRACT } = require('./notebook');
const { BLOCKS_GUIDE, sanitizeBlocks, hydrateBlocks, sanitizeCommitments } = require('./blocks');

const DAY = 86400000;
const dayKey = (ms) => new Date(ms).toISOString().slice(0, 10);

/**
 * Mechanical significance check. Returns { significant, reasons[], newRegressions[] }.
 */
async function checkSignificance(db, uid, trigger, data, meta) {
  const reasons = [];
  const now = Date.now();

  const flagged = (data.flaggedConcepts || []).filter((c) => c.regressionFlag);
  const newRegressions = flagged
    .map((c) => c.conceptId)
    .filter((id) => !(meta.acknowledgedRegressions || []).includes(id));

  if (trigger === 'exam_completed') {
    reasons.push('exam_completed');
  }

  if (trigger === 'session_start') {
    if (meta.lastBriefingDay === dayKey(now)) {
      // Already briefed today — only a brand-new regression justifies speaking again.
      if (newRegressions.length === 0) return { significant: false, reasons: [], newRegressions: [] };
    }
    const lastActivity = Math.max(
      ...(data.recentCompletions || []).map((e) => e.clientTs || 0),
      meta.lastObserveAt || 0,
      0
    );
    if (lastActivity && now - lastActivity >= 3 * DAY) reasons.push('returning_after_gap');
    if (!meta.lastWeeklyNoteAt || now - meta.lastWeeklyNoteAt >= 7 * DAY) reasons.push('weekly_summary_due');
    if (newRegressions.length > 0) reasons.push('new_concept_regression');
    if (data.user?.examDate) {
      const examMs = Date.parse(data.user.examDate);
      if (!Number.isNaN(examMs) && examMs > now && examMs - now <= 14 * DAY) reasons.push('exam_approaching');
    }
    // A first-ever briefing for a student with real data is worth one note.
    if (!meta.lastObserveAt && (data.skillStates || []).length > 0) reasons.push('first_briefing');
  }

  return { significant: reasons.length > 0, reasons, newRegressions };
}

/**
 * Run the Observer. Returns { note } or { note: null, skipped: true, reasons }.
 * Caller handles quota + ledger.
 */
async function runObserver(db, uid, trigger, refId, ledger, beforeModel) {
  // At the exam boundary the client sends the practiceExams doc id as refId —
  // pass it through so the assembler reads the authoritative result directly
  // ("## The exam that just finished"). The results page can only fire this
  // ping after that document was saved and re-read, so unlike the
  // fire-and-forget event batch there is no race to lose.
  const surface = trigger === 'exam_completed' && refId ? { examResultId: refId } : {};
  const [{ contextText, data }, notebook] = await Promise.all([
    assembleStudentContext(db, uid, surface),
    getNotebook(db, uid),
  ]);

  const sig = await checkSignificance(db, uid, trigger, data, notebook.meta);
  if (!sig.significant) return { note: null, skipped: true, reasons: [] };

  // Quota gate (insignificant pings never reach here, so they stay free).
  if (beforeModel && !(await beforeModel())) {
    return { note: null, skipped: true, reasons: sig.reasons, quotaExceeded: true };
  }

  const surfaceHint = trigger === 'exam_completed' ? 'exam-results' : 'briefing';
  const taskByTrigger = {
    session_start:
      'Write the session-start BRIEFING for the student (this renders as the Home hero — cards, not chat). Base it on the trigger reasons: surface the single most valuable thing right now (a new regression beats everything; otherwise the weekly picture, a gap, or exam countdown). Blocks: a "verdict" (tone: "fix" for a regression/slip day, "win" when celebrating a level-up or record, "exam" inside the last 14 days, else "steady"), a "plan" with 2-3 items ordered by value (a regression fix first; every item grounded in the data and carrying an action where possible), and a "stat" block (kind "pace" normally, "streak" when the streak is the story). "message" stays 2-4 sentences for legacy surfaces.',
    exam_completed:
      'The student just finished a practice exam. The authoritative result is under "## The exam that just finished" (or, if that section is absent, the newest entry in "## Practice-exam history"). Write the coach note: what the scaled score means against their exam history and target (compare with earlier exams where available; respect any PARTIAL SITTING label), the top thing to fix, and at most 2 actions. 3-5 sentences. Blocks: a "verdict" with evidence citing the exam, a "stat" (kind "pace"), and a "history" block if a Concept alert explains the losses.',
  };

  const result = await complete('primary', {
    // Background job — the student is not waiting on this, and it also
    // rewrites the durable notebook, so give it room to think.
    effort: process.env.COACH_OBSERVE_REASONING_EFFORT || 'medium',
    system:
      `You are the student's SAT coach ("Coach") inside UltraSAT. Warm, direct, specific; second person; never invent facts — reference only the STUDENT CONTEXT and NOTEBOOK.\n\n${BLOCKS_GUIDE}\n\n${NOTEBOOK_CONTRACT}\n\n` +
      `OUTPUT a single JSON object:\n{\n  "note": { "message": "...", "actions": [up to 2 of {"type":"quiz","subcategoryId":"<kebab>","level":1|2|3?,"label":"..."} | {"type":"link","route":"<allow-listed>","label":"..."} | {"type":"lesson","conceptId":"<id>","subcategoryId":"<kebab>?","label":"..."}], "blocks": [...] },\n  "commitments": [full current list of {"label":"...","dueDate":"YYYY-MM-DD","source":"..."} — add dated re-checks you promise, prune done/stale, ≤ 6],\n  "notebook": "<the FULL updated notebook markdown>"\n}`,
    messages: [
      {
        role: 'user',
        content:
          `NOTEBOOK (your memory of this student):\n${notebook.text}\n\n` +
          `CURRENT COMMITMENTS (structured follow-ups you owe the student):\n${JSON.stringify(
            notebook.meta.commitments || []
          )}\n\n` +
          `STUDENT CONTEXT (current, authoritative):\n${contextText}\n\n` +
          `TRIGGER: ${trigger} · significance reasons: ${sig.reasons.join(', ')}` +
          (sig.newRegressions.length ? ` · NEW regressions to address: ${sig.newRegressions.join(', ')}` : '') +
          `\n\nTASK: ${taskByTrigger[trigger] || taskByTrigger.session_start}\nAlso return the full updated notebook (fold in today's state; dated observation lines; prune stale ones).`,
      },
    ],
    json: true,
    maxTokens: 3000,
  });
  if (ledger) await ledger(result);

  const parsed = parseJsonResponse(result.text) || {};
  const noteRaw = parsed.note || {};
  const now = Date.now();
  const commitments = sanitizeCommitments(parsed.commitments);

  // Persist notebook + meta (mechanical acks so we don't re-note the same regression daily)
  await saveNotebook(db, uid, {
    text: typeof parsed.notebook === 'string' ? parsed.notebook : undefined,
    meta: {
      lastObserveAt: now,
      ...(sig.reasons.includes('weekly_summary_due') ? { lastWeeklyNoteAt: now } : {}),
      ...(trigger === 'session_start' ? { lastBriefingDay: dayKey(now) } : {}),
      ...(commitments !== null ? { commitments } : {}),
      acknowledgedRegressions: Array.from(
        new Set([...(notebook.meta.acknowledgedRegressions || []), ...sig.newRegressions])
      ).slice(-50),
    },
  });

  if (!noteRaw.message) return { note: null, skipped: false, reasons: sig.reasons };

  const note = {
    kind: trigger === 'exam_completed' ? 'exam-note' : 'briefing',
    surfaceHint,
    refId: refId || null,
    message: String(noteRaw.message).slice(0, 1200),
    actionsRaw: Array.isArray(noteRaw.actions) ? noteRaw.actions : [],
    // Typed blocks (UI v2): sanitized against the contract, then hydrated with
    // server-owned numbers from the SAME data the prompt was grounded in.
    blocks: hydrateBlocks(sanitizeBlocks(noteRaw.blocks), data),
    reasons: sig.reasons,
    createdAt: new Date(),
    read: false,
  };
  return { note, skipped: false, reasons: sig.reasons };
}

module.exports = { runObserver, checkSignificance };
