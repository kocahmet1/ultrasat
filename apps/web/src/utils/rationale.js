/* parseRationale — split a formulaic SAT rationale into display blocks
 * WITHOUT altering a single character of the content.
 *
 * Recognizes the standard voice:
 *   "Choice C is correct. … Choice A is incorrect and may result from …"
 *   "Choice B (soft) is correct …" / "Choice B is the best answer because …"
 *   "Choices C and D are also incorrect …"
 *   loose per-choice sentences: "Choice B misreads the table: …"
 *   grid-ins: "The correct answer is 16. … Note that 16 and 16/1 are examples …"
 *
 * Returns { blocks: [{ kind, verdict, letters, leadLength, text }] }
 *   kind: 'intro' | 'choice' | 'note'
 *   verdict (choice blocks): 'correct' | 'incorrect'
 *   leadLength: characters of the lead-in phrase (for bolding)
 * Concatenating block texts in order reproduces the original string exactly —
 * the parser only decides where to CUT, never rewrites.
 */

const CANDIDATE = /Choices?\s+[A-D]\b/g;

// Strict: the clause soon declares a verdict (correct / incorrect / best answer).
const VERDICT_AHEAD =
  /^(Choices?\s+[A-D](?:\s*(?:,|and)\s*[A-D])*\s*(?:\([^)]{0,60}\))?\s+(?:is|are|was|were)(?:\s+(?:also|both|all|each))?(?:\s+not)?\s+[^.]{0,60}?(?:\bcorrect\b|\bincorrect\b|\bbest\s+answer\b|\bwrong\b))/;

// Loose: a sentence that simply BEGINS by naming a choice ("Choice B misreads …").
const LOOSE_AHEAD =
  /^(Choices?\s+[A-D](?:\s*(?:,|and)\s*[A-D])*\s*(?:\([^)]{0,60}\))?),?\s+[a-z“"'‘]/;

const GRIDIN_LEAD = /^The\s+correct\s+answer\s+is\s+[^.]{1,60}\./;

const NOTE_SEAM = /(?:^|[.!?…]\s+)(Note\s+that\s+)/;

const lettersIn = (lead) =>
  (lead.replace(/^Choices?\s+/, '').replace(/\([^)]*\)/g, '').match(/\b[A-D]\b/g) || []).slice(0, 4);

export function parseRationale(raw) {
  const text = typeof raw === 'string' ? raw : '';
  if (!text.trim()) return { blocks: [] };

  /* ---- find seams ---- */
  const seams = [];
  let match;
  CANDIDATE.lastIndex = 0;
  while ((match = CANDIDATE.exec(text))) {
    const index = match.index;
    // sentence boundary before the seam (or start of text)
    const before = text.slice(0, index);
    if (before.trim() !== '' && !/[.!?…:"”’)\]]\s*$/.test(before)) continue;

    const ahead = text.slice(index, index + 200);
    const strict = ahead.match(VERDICT_AHEAD);
    if (strict) {
      seams.push({
        index,
        leadLength: strict[1].length,
        verdict: /\bincorrect\b|\bwrong\b|\bnot\s+correct\b/i.test(strict[1])
          ? 'incorrect'
          : 'correct',
        letters: lettersIn(strict[1]),
      });
      continue;
    }
    const loose = ahead.match(LOOSE_AHEAD);
    if (loose) {
      seams.push({
        index,
        leadLength: loose[1].length,
        verdict: null, // resolved below
        letters: lettersIn(loose[1]),
      });
    }
  }

  const blocks = [];

  const pushNoteSplit = (chunkText, base) => {
    // Peel a trailing "Note that …" sentence into a footnote block.
    const noteMatch = chunkText.match(NOTE_SEAM);
    if (noteMatch && noteMatch.index !== undefined) {
      const cut = noteMatch.index + noteMatch[0].length - noteMatch[1].length;
      const before = chunkText.slice(0, cut);
      const note = chunkText.slice(cut);
      if (before.trim()) blocks.push({ ...base, text: before });
      blocks.push({ kind: 'note', verdict: null, letters: [], leadLength: 0, text: note });
    } else {
      blocks.push({ ...base, text: chunkText });
    }
  };

  if (seams.length === 0) {
    // No choice structure — grid-in voice or free prose.
    const gridin = text.match(GRIDIN_LEAD);
    pushNoteSplit(text, {
      kind: 'intro',
      verdict: null,
      letters: [],
      leadLength: gridin ? gridin[0].length : 0,
    });
    return { blocks };
  }

  /* ---- resolve loose verdicts ----
   * The correct choice is explained first in this voice; a later loose seam
   * naming the same letter stays 'correct', all other loose seams are the
   * per-choice eliminations. */
  const correctLetters = new Set();
  seams.forEach((seam) => {
    if (seam.verdict === 'correct') seam.letters.forEach((l) => correctLetters.add(l));
  });
  seams.forEach((seam, i) => {
    if (seam.verdict !== null) return;
    if (i === 0 && correctLetters.size === 0) {
      seam.verdict = 'correct';
      seam.letters.forEach((l) => correctLetters.add(l));
    } else {
      seam.verdict =
        seam.letters.length > 0 && seam.letters.every((l) => correctLetters.has(l))
          ? 'correct'
          : 'incorrect';
    }
  });

  /* ---- cut into blocks ---- */
  if (seams[0].index > 0) {
    const intro = text.slice(0, seams[0].index);
    if (intro.trim()) {
      blocks.push({ kind: 'intro', verdict: null, letters: [], leadLength: 0, text: intro });
    } else {
      seams[0].glue = intro; // pure whitespace — keep integrity
    }
  }

  seams.forEach((seam, i) => {
    const end = i + 1 < seams.length ? seams[i + 1].index : text.length;
    const chunkText = (seam.glue || '') + text.slice(seam.index, end);
    const base = {
      kind: 'choice',
      verdict: seam.verdict,
      letters: seam.letters,
      leadLength: (seam.glue || '').length + seam.leadLength,
    };
    if (i === seams.length - 1) pushNoteSplit(chunkText, base);
    else blocks.push({ ...base, text: chunkText });
  });

  return { blocks };
}

export default parseRationale;

