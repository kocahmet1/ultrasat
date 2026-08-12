#!/usr/bin/env node
/**
 * Patch pass 4 — one defect left after pass 3.
 *
 *   M40 — the gliding-possum passage made three false natural-history claims
 *         (gliders do steer; the glide is a steep drop that flattens and ends on a
 *         trunk, not a shallow line held to the ground; steering uses limbs and tail,
 *         not membrane tension alone). Grammar mechanics were sound, so the item is
 *         rebuilt on the same structure — a compound predicate joined by a
 *         non-contrastive "and", keyed to no punctuation — with safe content.
 */
const fs = require('fs');
const path = require('path');
const SRC = path.join(__dirname, 'src');
const FILE = 'bnd-05-medium-c.json';

const E = [
  ['A gliding possum steers very little once it is airborne. It leaves the trunk in a shallow ______ and holds that line almost to the ground, correcting only by shifting the tension in the membrane stretched between its wrists and its ankles.',
   'A harvester ant scouting for seeds leaves the nest along one of several cleared ______ and returns along the same one, a pattern that researchers can map by dusting the workers, a few at a time, with colored powder.'],

  ['"options": ["dive,", "dive;", "dive —", "dive"],',
   '"options": ["trails,", "trails;", "trails —", "trails"],'],

  ['it joins two verb phrases (\\"leaves…dive\\" and \\"holds…ground\\") that share the single subject \\"It.\\"',
   'it joins two verb phrases (\\"leaves…trails\\" and \\"returns…same one\\") that share the single subject \\"A harvester ant scouting for seeds.\\"'],

  ['"B": "a semicolon can\'t be used in this way, since what follows it (\\"and holds…ankles\\") is not a main clause.",',
   '"B": "a semicolon can\'t be used in this way, since what follows it (\\"and returns…powder\\") is not a main clause.",'],
];

let text = fs.readFileSync(path.join(SRC, FILE), 'utf8');
let bad = 0;
E.forEach(([find, replace], i) => {
  const n = text.split(find).length - 1;
  if (n !== 1) { console.error(`✗ edit ${i} matched ${n} times:\n   ${find.slice(0, 110)}`); bad++; return; }
  text = text.replace(find, replace);
});
if (bad) { console.error(`\n${bad} edit(s) failed. Nothing written.`); process.exit(1); }
JSON.parse(text);
fs.writeFileSync(path.join(SRC, FILE), text);
console.log(`✓ ${FILE}\n\n${E.length} edits applied.`);
