#!/usr/bin/env node
/**
 * One-off patch pass over the authored Boundaries set.
 *
 *  (a) raises comma density in the easy and medium passages toward the measured
 *      official means (easy 2.16, medium 2.69) — see BOUNDARIES_STYLE_SPEC.md §1;
 *  (b) lengthens two hard passages that fell below the measured band;
 *  (c) rebalances three answer keys from C to D to reach 25/25/25/25.
 *
 * Operates on raw file text so JSON formatting is preserved. Every edit must match
 * exactly once or the script aborts without writing.
 */
const fs = require('fs');
const path = require('path');
const SRC = path.join(__dirname, 'src');

const EDITS = [
  // ---------------------------------------------------------------- easy: comma noise
  ['bnd-01-easy-a.json', 'melting into a glaze that no brush could apply so evenly.', 'melting into a glaze that no brush, however steady, could apply so evenly.'],
  ['bnd-01-easy-a.json', 'spent about eleven percent less than customers who had not.', 'spent about eleven percent less, on average, than customers who had not.'],
  ['bnd-01-easy-a.json', 'Wildlife physiologist Tomás Ferreira built a portable press', 'Wildlife physiologist Tomás Ferreira, working alone, built a portable press'],
  ['bnd-01-easy-a.json', 'the volunteer fire company in Ashgrove could assemble', 'the volunteer fire company in Ashgrove, founded that same year, could assemble'],
  ['bnd-01-easy-a.json', 'so that the current will not carry them off.', 'so that the current, even on a rough night, will not carry them off.'],
  ['bnd-01-easy-a.json', 'Sociologist Ingrid Halvorsen argues that this practice', 'Sociologist Ingrid Halvorsen, who studies shift work, argues that this practice'],
  ['bnd-01-easy-a.json', 'can survive temperatures that would sterilize ordinary soil. In a greenhouse trial', 'can survive temperatures that would sterilize ordinary soil, and they can wait years for rain. In a greenhouse trial'],
  ['bnd-01-easy-a.json', 'A museum in Cremona keeps two dozen violins', 'A museum in Cremona, Italy, keeps two dozen violins'],

  ['bnd-02-easy-b.json', 'within the top meter of soil, where the temperature stays nearly constant.', 'within the top meter of soil, where the temperature, even in midsummer, stays nearly constant.'],
  ['bnd-02-easy-b.json', 'Muralists in Valparaíso once ground their own pigments', 'Muralists in Valparaíso, a port city built on hills, once ground their own pigments'],
  ['bnd-02-easy-b.json', 'A cuckoo bee never builds a nest of its own.', 'A cuckoo bee, despite its name, never builds a nest of its own.'],
  ['bnd-02-easy-b.json', 'she had already spent nineteen years inside the same author\'s sentences.', 'she had already spent nineteen years, on and off, inside the same author\'s sentences.'],
  ['bnd-02-easy-b.json', 'it has to estimate how many drivers will use the new lane.', 'it has to estimate how many drivers, current and future, will use the new lane.'],
  ['bnd-02-easy-b.json', 'less salt but arrives at a steeper angle.', 'less salt but arrives, for reasons no one has explained, at a steeper angle.'],
  ['bnd-02-easy-b.json', 'to describe what they had seen an hour after they left the building.', 'to describe what they had seen, in as much detail as they could manage, an hour after they left the building.'],
  ['bnd-02-easy-b.json', 'A first edition of the anthology can be identified by three features', 'A first edition of the anthology, printed in Edinburgh, can be identified by three features'],

  // ---------------------------------------------------------------- medium: comma noise
  ['bnd-03-medium-a.json', 'A study of hiring in three European cities found that résumés', 'A study of hiring in three European cities, conducted over two years, found that résumés'],
  ['bnd-03-medium-a.json', 'and no reviewer remarked on the change.', 'and no reviewer, so far as she could tell, remarked on the change.'],
  ['bnd-03-medium-a.json', 'until a survey team photographed three workers on a single ridge in 2019.', 'until a survey team, working at dusk, photographed three workers on a single ridge in 2019.'],
  ['bnd-03-medium-a.json', 'Restoring a pipe organ is less like repairing a machine than like tuning an orchestra that cannot be moved.', 'Restoring a pipe organ is less like repairing a machine, technicians say, than like tuning an orchestra that cannot be moved.'],
  ['bnd-03-medium-a.json', 'Glass sponges build skeletons from silica needles that interlock into a lattice stiff enough to hold shape in deep-sea currents.', 'Glass sponges build skeletons from silica needles, each thinner than a hair, that interlock into a lattice stiff enough to hold shape in deep-sea currents.'],
  ['bnd-03-medium-a.json', 'and in every case the second draft is shorter, colder, and far easier to quote.', 'and in every case the second draft is shorter, colder, and, for a biographer, far easier to quote.'],
  ['bnd-03-medium-a.json', 'Coral larvae settle by sound as well as by chemistry, drifting toward the crackle of a healthy reef.', 'Coral larvae settle by sound as well as by chemistry, drifting, sometimes for days, toward the crackle of a healthy reef.'],
  ['bnd-03-medium-a.json', 'Mycologist Renata Uribe doubts that the timing is a coincidence.', 'Mycologist Renata Uribe, who has tracked six species, doubts that the timing is a coincidence.'],

  ['bnd-04-medium-b.json', 'Thawing permafrost releases carbon that has been locked underground for millennia.', 'Thawing permafrost releases carbon, much of it from ancient plant tissue, that has been locked underground for millennia.'],
  ['bnd-04-medium-b.json', 'The colonial assembly met in a rented tavern for its first eleven years.', 'The colonial assembly met in a rented tavern, the only heated room in town, for its first eleven years.'],
  ['bnd-04-medium-b.json', 'that collectors now use to distinguish it from the far more common reprint.', 'that collectors now use, more reliably than the binding, to distinguish it from the far more common reprint.'],
  ['bnd-04-medium-b.json', 'though both groups reported valuing the discount about equally when asked afterward.', 'though both groups, when asked afterward, reported valuing the discount about equally.'],
  ['bnd-04-medium-b.json', 'spent two years persuading a symphony orchestra', 'spent two years, and most of a commission fee, persuading a symphony orchestra'],
  ['bnd-04-medium-b.json', 'growers now imitate the cold by holding seed trays in refrigerators for eight to twelve weeks.', 'growers now imitate the cold by holding seed trays in refrigerators, at just above freezing, for eight to twelve weeks.'],
  ['bnd-04-medium-b.json', 'whose marginal corrections appear throughout the printer\'s proofs.', 'whose marginal corrections, in a distinctive violet ink, appear throughout the printer\'s proofs.'],

  ['bnd-05-medium-c.json', 'Surveys that ask people how much they exercise consistently overstate the real figure.', 'Surveys that ask people how much they exercise, whatever the wording, consistently overstate the real figure.'],
  ['bnd-05-medium-c.json', 'The mosaic floor had been walked on for six centuries', 'The mosaic floor, laid over an older one, had been walked on for six centuries'],
  ['bnd-05-medium-c.json', 'Reviewers at the time called the book unclassifiable, and its author did not disagree.', 'Reviewers at the time called the book unclassifiable, and its author, in the one interview he gave, did not disagree.'],
  ['bnd-05-medium-c.json', 'A hummingbird\'s heart beats about twelve hundred times a minute in flight', 'A hummingbird\'s heart beats about twelve hundred times a minute in level flight'],
  ['bnd-05-medium-c.json', 'and no photograph of it in daylight is known to survive.', 'and no photograph of it in daylight, or in any other light, is known to survive.'],
  ['bnd-05-medium-c.json', 'the fish that overwinter in it spend the coldest months', 'the fish that overwinter in it, including several that will not breed elsewhere, spend the coldest months'],
  ['bnd-05-medium-c.json', 'and a plane no wider than a thumbnail.', 'and a plane, kept oiled, no wider than a thumbnail.'],
  ['bnd-05-medium-c.json', 'adjusts only by shifting the tension in the membrane stretched between its wrists and its ankles.', 'adjusts only by shifting the tension in the membrane, thinner than paper, stretched between its wrists and its ankles.'],

  // ---------------------------------------------------------------- hard: length
  ['bnd-06-hard-a.json',
    'Halfway through the manuscript the handwriting changes, and so does the ______ a second scribe, working perhaps a generation later, who abbreviates freely, spells inconsistently, and omits the marginal glosses altogether.',
    'Halfway through the manuscript, at the point where the vellum also changes, the handwriting changes, and so does the ______ a second scribe, working perhaps a generation later, who abbreviates freely, spells inconsistently, and omits the marginal glosses that the first scribe had copied out in full.'],
  ['bnd-07-hard-b.json',
    'The ledger\'s final page ______ what the guild paid for candles, what it paid the watchman, and what it wrote off as spoiled — but not, anywhere in eleven years of entries, what it charged.',
    'Only one volume of the guild\'s accounts survives, and it is incomplete. The ledger\'s final page ______ what the guild paid for candles, what it paid the watchman, and what it wrote off as spoiled — but not, anywhere in eleven years of entries, what it charged its own members.'],

  // ---------------------------------------------------------------- answer-key rebalance C -> D
  ['bnd-01-easy-a.json', '"options": ["light;", "light", "light,", "light:"],\n    "key": 2,', '"options": ["light;", "light", "light:", "light,"],\n    "key": 3,'],
  ['bnd-01-easy-a.json', '      "D": "a colon can\'t be used in this way to separate items in a series."\n    },\n    "remember": "Punctuation inside a series', '      "C": "a colon can\'t be used in this way to separate items in a series."\n    },\n    "remember": "Punctuation inside a series'],
  ['bnd-01-easy-a.json', '"Choice C is the best answer. The convention being tested is the punctuation of items in a series.', '"Choice D is the best answer. The convention being tested is the punctuation of items in a series.'],

  ['bnd-05-medium-c.json', '"options": ["hour", "hour —", "hour,", "hour;"],\n    "key": 2,', '"options": ["hour", "hour —", "hour;", "hour,"],\n    "key": 3,'],
  ['bnd-05-medium-c.json', '      "D": "a semicolon can\'t be paired with a comma in this way to separate the supplementary element from the rest of the sentence."\n    },\n    "remember": "The subject is \\"The 1868 rail bill\\"', '      "C": "a semicolon can\'t be paired with a comma in this way to separate the supplementary element from the rest of the sentence."\n    },\n    "remember": "The subject is \\"The 1868 rail bill\\"'],
  ['bnd-05-medium-c.json', '"Choice C is the best answer. The convention being tested is the punctuation of a supplementary element within a sentence. The comma after \\"hour\\"', '"Choice D is the best answer. The convention being tested is the punctuation of a supplementary element within a sentence. The comma after \\"hour\\"'],

  ['bnd-07-hard-b.json', '"options": ["cabinet,", "cabinet", "cabinet;", "cabinet:"],\n    "key": 2,', '"options": ["cabinet,", "cabinet", "cabinet:", "cabinet;"],\n    "key": 3,'],
  ['bnd-07-hard-b.json', '      "D": "a colon can\'t be used in this way to separate items in a series, and the sentence already uses a colon to introduce the series."\n    },\n    "remember": "There is a list inside a list here.', '      "C": "a colon can\'t be used in this way to separate items in a series, and the sentence already uses a colon to introduce the series."\n    },\n    "remember": "There is a list inside a list here.'],
  ['bnd-07-hard-b.json', '"Choice C is the best answer. The convention being tested is the punctuation of elements in a complex series. It\'s conventional to use a semicolon to separate items in a complex series with internal punctuation, and in this choice the semicolon after \\"cabinet\\"', '"Choice D is the best answer. The convention being tested is the punctuation of elements in a complex series. It\'s conventional to use a semicolon to separate items in a complex series with internal punctuation, and in this choice the semicolon after \\"cabinet\\"'],
];

const buffers = {};
const load = (f) => (buffers[f] = buffers[f] ?? fs.readFileSync(path.join(SRC, f), 'utf8'));

let bad = 0;
EDITS.forEach(([file, find, replace], i) => {
  const text = load(file);
  const n = text.split(find).length - 1;
  if (n !== 1) { console.error(`✗ edit ${i} in ${file} matched ${n} times:\n   ${find.slice(0, 90)}`); bad++; return; }
  buffers[file] = text.replace(find, replace);
});

if (bad) { console.error(`\n${bad} edit(s) failed to match exactly once. Nothing written.`); process.exit(1); }

Object.entries(buffers).forEach(([f, text]) => {
  JSON.parse(text); // abort if any edit broke the JSON
  fs.writeFileSync(path.join(SRC, f), text);
  console.log(`✓ ${f}`);
});
console.log(`\n${EDITS.length} edits applied.`);
