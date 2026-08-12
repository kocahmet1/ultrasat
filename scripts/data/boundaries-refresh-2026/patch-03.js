#!/usr/bin/env node
/**
 * Patch pass 3 — regression defects found when the 32 items revised in patch-02
 * were re-audited. Six real problems, two of them introduced by patch-02 itself.
 *
 *   M25 — patch-02 deleted "the translator" from the passage but left the options
 *         reading "and critic", so no substitution was grammatical. (introduced)
 *   M40 — "a fixed trajectory" that the animal then "adjusts" is self-contradictory,
 *         and a patagium is not "thinner than paper". (introduced)
 *   M28 — `remember` quoted "can cross" after the passage was changed to "can cover".
 *   H11 — `remember` undercounted the verbs in the right-hand span.
 *   H14 — `why` quoted "…microscope" after that word was removed.
 *   E21 — Valparaíso's mural tradition postdates hand-ground mineral paints, so the
 *         passage attached invented history to a real, identifiable city.
 */
const fs = require('fs');
const path = require('path');
const SRC = path.join(__dirname, 'src');

const E = [];
const edit = (file, find, replace) => E.push([file, find, replace]);

/* E21 — drop the real city; the craft claim is safe for anonymous sign painters. */
edit('bnd-02-easy-b.json',
  'Muralists in Valparaíso, a port city built on hills, once mixed their own paints from ground mineral dust and boiled linseed ______',
  'Sign painters in the old harbor district, working on walls that face the sea, once mixed their own paints from ground mineral dust and boiled linseed ______');
edit('bnd-02-easy-b.json',
  'between the first sentence (\\"Muralists…oil\\") and the second sentence (\\"The practice…store\\")',
  'between the first sentence (\\"Sign painters…oil\\") and the second sentence (\\"The practice…store\\")');

/* M25 — restore the head noun to the options now that the passage no longer carries it. */
edit('bnd-04-medium-b.json',
  '"options": ["and critic", "and critic,", "and critic;", "and critic —"],',
  '"options": ["translator and critic", "translator and critic,", "translator and critic;", "translator and critic —"],');

/* M28 — quote the verb the passage actually uses. */
edit('bnd-05-medium-c.json',
  '"remember": "Closing the bracket puts a comma directly before the verb \\"can cross.\\"',
  '"remember": "Closing the bracket puts a comma directly before the verb \\"can cover.\\"');

/* M40 — rebuild on a non-contradictory compound predicate. */
edit('bnd-05-medium-c.json',
  'A gliding possum launches itself along a fixed ______ and adjusts its course only by shifting the tension in the membrane, thinner than paper, that is stretched between its wrists and its ankles. It cannot flap, and it cannot steer the way a bird does.',
  'A gliding possum steers very little once it is airborne. It leaves the trunk in a shallow ______ and holds that line almost to the ground, correcting only by shifting the tension in the membrane stretched between its wrists and its ankles.');
edit('bnd-05-medium-c.json',
  '"options": ["trajectory,", "trajectory;", "trajectory —", "trajectory"],',
  '"options": ["dive,", "dive;", "dive —", "dive"],');
edit('bnd-05-medium-c.json',
  'it joins two verb phrases (\\"launches…trajectory\\" and \\"adjusts…ankles\\") that share the single subject \\"A gliding possum.\\"',
  'it joins two verb phrases (\\"leaves…dive\\" and \\"holds…ground\\") that share the single subject \\"It.\\"');
edit('bnd-05-medium-c.json',
  '"B": "a semicolon can\'t be used in this way, since what follows it (\\"and adjusts…ankles\\") is not a main clause.",',
  '"B": "a semicolon can\'t be used in this way, since what follows it (\\"and holds…ankles\\") is not a main clause.",');

/* H11 — the right-hand span carries four finite verbs, not three. */
edit('bnd-06-hard-a.json',
  '"remember": "Four commas and three verbs on the right, and still no main clause — every one of those verbs sits inside a \\"who\\" clause."',
  '"remember": "Four commas and a string of verbs on the right, and still no main clause — every one of those verbs sits inside a relative clause."');

/* H14 — the second sentence no longer ends at "microscope". */
edit('bnd-06-hard-a.json',
  'and the second sentence (\\"Every centimeter…microscope\\")',
  'and the second sentence (\\"Every centimeter…grain by grain\\")');

/* ============================== apply ============================== */
const buffers = {};
const load = (f) => (buffers[f] = buffers[f] ?? fs.readFileSync(path.join(SRC, f), 'utf8'));
let bad = 0;
E.forEach(([file, find, replace], i) => {
  const text = load(file);
  const n = text.split(find).length - 1;
  if (n !== 1) { console.error(`✗ edit ${i} in ${file} matched ${n} times:\n   ${find.slice(0, 110)}`); bad++; return; }
  buffers[file] = text.replace(find, replace);
});
if (bad) { console.error(`\n${bad} edit(s) failed. Nothing written.`); process.exit(1); }
Object.entries(buffers).forEach(([f, text]) => {
  JSON.parse(text);
  fs.writeFileSync(path.join(SRC, f), text);
  console.log(`✓ ${f}`);
});
console.log(`\n${E.length} edits applied.`);
