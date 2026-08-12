#!/usr/bin/env node
/**
 * Patch pass 2 — defects found by three independent adversarial audits of the
 * authored Boundaries set (easy / medium / hard reviewed separately).
 *
 * Categories fixed here:
 *   A. DOUBLE-KEY (item had two defensible answers)      — H29, M25, M40, H04
 *   B. BOUNDARY-MENU CAPITALIZATION (period option left  — H01, H06, H11, H22
 *      a lowercase word starting the new sentence)
 *   C. BROKEN KEY / GARBLED SYNTAX                        — M14, M15, M23, M35, M39
 *   D. FACTUAL CLAIMS ABOUT THE REAL WORLD                — E10, E11, E16, E18, E21,
 *                                                            E22, M06, M22, M28, M29,
 *                                                            H14, H19, H21
 *   E. RATIONALE / QUOTE / COUNT ERRORS                   — E04, M05, M19, M37,
 *                                                            H06, H11, H16, H22, H30
 *
 * Raw-text edits so formatting is preserved. Every edit must match exactly once.
 */
const fs = require('fs');
const path = require('path');
const SRC = path.join(__dirname, 'src');

const E = [];
const edit = (file, find, replace) => E.push([file, find, replace]);

const EASY_A = 'bnd-01-easy-a.json';
const EASY_B = 'bnd-02-easy-b.json';
const MED_A = 'bnd-03-medium-a.json';
const MED_B = 'bnd-04-medium-b.json';
const MED_C = 'bnd-05-medium-c.json';
const HARD_A = 'bnd-06-hard-a.json';
const HARD_B = 'bnd-07-hard-b.json';

/* ============================== EASY ============================== */

// E04 — rebuttals misdescribed the distractors: with "how much water" outside the
// blank, the declarative-order options are fragments, not declarative sentences.
edit(EASY_A,
  '"A": "the context requires an interrogative sentence that the next sentence can be understood as answering, not a declarative clause introduced by \\"But how much water.\\"",',
  '"A": "it results in a rhetorically unacceptable sentence fragment: \\"But how much water a single cactus pad can supply\\" has no main clause.",');
edit(EASY_A,
  '"D": "it\'s unconventional to use a question mark to punctuate a clause in declarative word order (\\"a single cactus pad can supply\\")."',
  '"D": "in addition to using a question mark, it results in a sentence fragment, since \\"But how much water a single cactus pad can supply\\" has no main clause."');

// E10 — "the province" had no antecedent anywhere in the passage.
edit(EASY_A, 'The oldest surviving map of the province — a linen sheet',
  'The oldest surviving survey map of the delta — a linen sheet');
edit(EASY_A, 'pairs with the dash after \\"province\\"', 'pairs with the dash after \\"delta\\"');

// E11 — resurrection ferns are desiccation-tolerant epiphytes, not heat-tolerant
// soil plants; the original premise was false.
edit(EASY_A,
  'The spores of the resurrection fern can survive temperatures that would sterilize ordinary soil, and they can wait years for rain. In a greenhouse trial',
  'Some ferns can survive months of complete desiccation, reviving within hours of a rain. In a greenhouse trial');

// E16 — leafcutter fungus chambers are not confined to the top meter of soil.
edit(EASY_B,
  'Although the tunnels that leafcutter ants dig can extend more than five meters below the ______ the colony keeps its fungus gardens within the top meter of soil, where the temperature, even in midsummer, stays nearly constant.',
  'Although the foraging trails that leafcutter ants clear can run more than a hundred meters from the ______ the workers carrying leaf fragments almost never stray from them, even when a shorter route across open ground is available.');
edit(EASY_B,
  'between the subordinate clause (\\"Although…surface\\") and the main clause that follows it (\\"the colony…constant\\")',
  'between the subordinate clause (\\"Although…nest\\") and the main clause that follows it (\\"the workers…available\\")');
edit(EASY_B, '"options": ["surface,", "surface", "surface;", "surface:"],',
  '"options": ["nest,", "nest", "nest;", "nest:"],');
edit(EASY_B, '"D": "a colon can\'t be used in this way, since the text that precedes it (\\"Although…surface\\") is a subordinate clause rather than a main clause."\n    },\n    "remember": "\\"Although,\\"',
  '"D": "a colon can\'t be used in this way, since the text that precedes it (\\"Although…nest\\") is a subordinate clause rather than a main clause."\n    },\n    "remember": "\\"Although,\\"');

// E18 — Karviná is a real, identifiable city; the medieval-guild history is invented.
edit(EASY_B, 'raised by the masons\' guild at Karvina between 1490 and ______',
  'raised by the masons\' guild at Vrenholm between 1490 and ______');
edit(EASY_B, '(\\"The stone bridges raised by the masons\' guild at Karvina between 1490 and 1520\\")',
  '(\\"The stone bridges raised by the masons\' guild at Vrenholm between 1490 and 1520\\")');

// E21 — pigment is the colorant; linseed oil is the vehicle. "Paints" is the correct term.
edit(EASY_B, 'once ground their own pigments from mineral dust and boiled linseed ______',
  'once mixed their own paints from ground mineral dust and boiled linseed ______');

// E22 — cuckoo bees are named FOR brood parasitism, so "despite" inverted the logic.
edit(EASY_B, 'A cuckoo bee, despite its name, never builds a nest of its own.',
  'A cuckoo bee, true to its name, never builds a nest of its own.');

/* ============================= MEDIUM ============================= */

// M05 / M37 — the rationale called a two-clause span "the main clause."
edit(MED_A, 'and the main clause that follows (\\"she restored…change\\")',
  'and the coordinated main clauses that follow (\\"she restored…change\\")');
edit(MED_C, 'and the main clause that follows (\\"a granddaughter…money\\")',
  'and the coordinated main clauses that follow (\\"a granddaughter…money\\")');

// M06 — Bombus alpinus is an extant, IUCN-assessed species; the extinction story was false.
edit(MED_A, 'The alpine bumblebee — a species that forages at altitudes',
  'A bumblebee known only from a few high Pyrenean ridges — a species that forages at altitudes');
edit(MED_A, 'pairs with the dash after \\"bumblebee\\"', 'pairs with the dash after \\"ridges\\"');

// M14 — "the hours just after midnight, which is…" mismatched its antecedent.
edit(MED_A, 'Several species of woodland fungi glow most brightly in the hours just after ______ which is also when',
  'Several species of woodland fungi glow most brightly around ______ which is also when');
edit(MED_A, 'This choice correctly uses a comma to separate the supplementary relative clause beginning with \\"which\\" from the main clause that it comments on.',
  'This choice correctly uses a comma to separate the supplementary relative clause beginning with \\"which\\" from the rest of the sentence.');
edit(MED_A, '"remember": "A \\"which\\" clause that comments on the whole preceding clause is supplementary, so it takes a comma — never a semicolon."',
  '"remember": "A \\"which\\" clause that adds information about something already named is supplementary, so it takes a comma — never a semicolon."');

// M15 — patch-01 had wedged a supplement between "carbon" and its restrictive "that" clause.
edit(MED_B, 'Thawing permafrost releases carbon, much of it from ancient plant tissue, that has been locked underground for millennia.',
  'Thawing permafrost releases carbon that has been locked underground, in some places, for tens of thousands of years.');
edit(MED_B, 'breaks down within weeks once the soil warms above freezing.',
  'breaks down within weeks, sometimes within days, once the soil warms above freezing.');

// M19 — the rationale quoted the wrong endpoint of the second main clause.
edit(MED_B, 'and the second main clause (\\"the paper group…afterward\\")',
  'and the second main clause (\\"the paper group…about equally\\")');

// M22 — cold stratification is an above-freezing requirement; the passage
// contradicted its own second sentence.
edit(MED_B, 'will not sprout until they have spent a winter below freezing, a requirement',
  'will not sprout until they have spent a winter in cold, damp ground, a requirement');

// M23 — "at Aelia Nova on thin strips of birch" had no licensed attachment.
edit(MED_B, 'The letters that remain from the garrison at Aelia Nova on thin strips of birch discarded in a rubbish ______',
  'The letters written at the garrison at Aelia Nova on thin strips of birch and discarded in a rubbish ______');
edit(MED_B, '(\\"The letters that remain…rubbish heap\\")', '(\\"The letters written…rubbish heap\\")');

// M25 — a definite title NP invited a defensible dash- or comma-appositive reading.
// A bare (article-less) title is the official pattern and admits neither.
edit(MED_B, 'Scholars now attribute it to the translator ______ Ines Baltar,',
  'Scholars now attribute it to ______ Ines Baltar,');
edit(MED_B, 'from the title that precedes it (\\"the translator and critic\\")',
  'from the title that precedes it (\\"translator and critic\\")');
edit(MED_B, '"remember": "\\"The translator and critic Ines Baltar\\" is one noun phrase. A title that identifies which person is meant never takes a comma."',
  '"remember": "\\"Translator and critic Ines Baltar\\" is one noun phrase. A title that identifies which person is meant never takes a comma."');

// M28 — monarchs are diurnal migrants; they do not cross the Gulf overnight.
edit(MED_C, 'can cross the Gulf of Mexico in a single night when a tailwind holds, though most of the population takes the longer route around the western coast.',
  'can cover more than a hundred kilometers in a day when a tailwind holds, though most of the eastern population drifts south far more slowly than that.');

// M29 — plural agreement for "data" in a research context.
edit(MED_C, 'Accelerometer data gathered from the same respondents tells a blunter ______',
  'Accelerometer data gathered from the same respondents tell a blunter ______');

// M35 — restrictive "which" contradicted the very distinction M27 tests.
edit(MED_C, 'the households which recovered fastest from the flood',
  'the households that recovered fastest from the flood');

// M39 — patch-01 gave one series item an internal comma, which would trigger the
// complex-series rule and undercut the comma key. Revert; add the comma elsewhere.
edit(MED_C, 'and a plane, kept oiled, no wider than a thumbnail.',
  'and a plane no wider than a thumbnail.');
edit(MED_C, 'A workshop inventory from 1723 lists the tools',
  'A workshop inventory from 1723, drawn up for a probate court, lists the tools');

// M40 — a comma before a contrastive "but" in a compound predicate is defensible
// (CMOS 6.22–6.23). Rebuild the item around a non-contrastive "and."
edit(MED_C, 'A gliding possum does not flap or steer in the way a bird ______ but launches itself along a fixed trajectory and adjusts only by shifting the tension in the membrane, thinner than paper, stretched between its wrists and its ankles.',
  'A gliding possum launches itself along a fixed ______ and adjusts its course only by shifting the tension in the membrane, thinner than paper, that is stretched between its wrists and its ankles. It cannot flap, and it cannot steer the way a bird does.');
edit(MED_C, '"options": ["does,", "does;", "does —", "does"],',
  '"options": ["trajectory,", "trajectory;", "trajectory —", "trajectory"],');
edit(MED_C, 'No punctuation is needed before the coordinating conjunction \\"but\\" when, as in this case, it joins two verb phrases (\\"does not flap…bird does\\" and \\"launches…ankles\\") that share the single subject \\"A gliding possum.\\"',
  'No punctuation is needed before the coordinating conjunction \\"and\\" when, as in this case, it joins two verb phrases (\\"launches…trajectory\\" and \\"adjusts…ankles\\") that share the single subject \\"A gliding possum.\\"');
edit(MED_C, '"B": "a semicolon can\'t be used in this way, since what follows it (\\"but launches…ankles\\") is not a main clause.",',
  '"B": "a semicolon can\'t be used in this way, since what follows it (\\"and adjusts…ankles\\") is not a main clause.",');
edit(MED_C, '"remember": "Before putting a comma in front of \\"but,\\" check whether the words after it have their own subject. Here they don\'t."',
  '"remember": "Before putting a comma in front of \\"and,\\" check whether the words after it have their own subject. Here they don\'t."');

/* ============================== HARD ============================== */

// H01 — boundary menu must carry the capitalized next word with the period option.
edit(HARD_A, 'rested on a single unproven ______ a continuous thread of water,',
  'rested on a single unproven ______ continuous thread of water,');
edit(HARD_A, '"options": ["assumption:", "assumption.", "assumption;", "assumption"],',
  '"options": ["assumption: a", "assumption. A", "assumption; a", "assumption a"],');

// H04 — bare passive "never agreed" is British usage, and the distractor read more
// idiomatically than the key ("never agreed to compensate…").
edit(HARD_A, 'to map the disputed boundary, which had been surveyed twice before and never ______',
  'to map the boundary, which two earlier surveys had left in ______');
edit(HARD_A, '"options": ["agreed,", "agreed", "agreed:", "agreed;"],',
  '"options": ["dispute,", "dispute", "dispute:", "dispute;"],');
edit(HARD_A, 'the semicolon after \\"agreed\\" separates the first duty (\\"to map…agreed\\")',
  'the semicolon after \\"dispute\\" separates the first duty (\\"to map…dispute\\")');
edit(HARD_A, '"A": "a comma after \\"agreed\\" doesn\'t match the semicolon used later to separate the second and third items in the series.",\n      "B": "it fails to use appropriate punctuation to separate the first and second items in the complex series.",\n      "C": "a colon can\'t be used in this way to separate items in a series, and the sentence already uses a colon to introduce the series."\n    },\n    "remember": "The only reliable signal',
  '"A": "a comma after \\"dispute\\" doesn\'t match the semicolon used later to separate the second and third items in the series.",\n      "B": "it fails to use appropriate punctuation to separate the first and second items in the complex series.",\n      "C": "a colon can\'t be used in this way to separate items in a series, and the sentence already uses a colon to introduce the series."\n    },\n    "remember": "The only reliable signal');

// H06 — boundary capitalization, plus the keyed seam produced a "one: one" echo.
edit(HARD_A, 'could account for every marmot on the slope but ______ one female, tagged as a yearling in the very first season, who vanished',
  'could account for every marmot on the slope but ______ female tagged as a yearling in the very first season, one that vanished');
edit(HARD_A, '"options": ["one.", "one;", "one:", "one"],',
  '"options": ["one. A", "one; a", "one: a", "one a"],');
edit(HARD_A, '"A": "placing a period after \\"one\\" results in a rhetorically unacceptable sentence fragment beginning with \\"One female.\\"',
  '"A": "placing a period after \\"one\\" results in a rhetorically unacceptable sentence fragment beginning with \\"A female.\\"');
edit(HARD_A, '"B": "a semicolon can\'t be used in this way, since what follows it (\\"one female…neighbors\\") is a noun phrase rather than a main clause.",',
  '"B": "a semicolon can\'t be used in this way, since what follows it (\\"a female…neighbors\\") is a noun phrase rather than a main clause.",');
edit(HARD_A, '"remember": "\\"Who vanished and reappeared\\" is a relative clause. It cannot supply the main verb the fragment would need."',
  '"remember": "\\"One that vanished and reappeared\\" is a relative clause. It cannot supply the main verb the fragment would need."');

// H11 — boundary capitalization; "so does the explanation" presupposed a prior
// explanation; rebuttal C misquoted the passage; comma count in the note was wrong.
edit(HARD_A, 'Halfway through the manuscript, at the point where the vellum also changes, the handwriting changes, and so does the ______ a second scribe, working perhaps a generation later, who abbreviates freely, spells inconsistently, and omits the marginal glosses that the first scribe had copied out in full.',
  'Halfway through the manuscript, at the point where the vellum also changes, the handwriting changes. The change has an obvious ______ second scribe, working perhaps a generation later, who abbreviates freely, spells inconsistently, and omits the marginal glosses that the first scribe had copied out in full.');
edit(HARD_A, '"options": ["explanation.", "explanation", "explanation;", "explanation:"],',
  '"options": ["explanation. A", "explanation a", "explanation; a", "explanation: a"],');
edit(HARD_A, 'a colon is correctly used after the main clause (\\"Halfway…explanation\\")',
  'a colon is correctly used after the main clause (\\"The change…explanation\\")');
edit(HARD_A, '"C": "a semicolon can\'t be used in this way, since what follows it (\\"a second scribe…altogether\\") is a noun phrase rather than a main clause."',
  '"C": "a semicolon can\'t be used in this way, since what follows it (\\"a second scribe…in full\\") is a noun phrase rather than a main clause."');
edit(HARD_A, '"remember": "Five commas and three verbs on the right, and still no main clause — every one of those verbs sits inside a \\"who\\" clause."',
  '"remember": "Four commas and three verbs on the right, and still no main clause — every one of those verbs sits inside a \\"who\\" clause."');

// H14 — "patience rather than instruments" was contradicted by "under a
// microscope" two lines later; the note miscounted the first clause.
edit(HARD_A, 'Reading it takes patience rather than ______ every centimeter, which represents about forty years, has to be washed, sieved, and counted grain by grain under a microscope.',
  'Reading it takes patience more than ______ every centimeter, which represents about forty years, has to be washed, sieved, and counted grain by grain.');
edit(HARD_A, '"options": ["instruments, every", "instruments. Every", "instruments every", "instruments and every"],',
  '"options": ["ingenuity, every", "ingenuity. Every", "ingenuity every", "ingenuity and every"],');
edit(HARD_A, 'between the first sentence (\\"Reading…instruments\\")', 'between the first sentence (\\"Reading…ingenuity\\")');
edit(HARD_A, '"remember": "A four-word first clause is still a clause. Shortness never turns a sentence into a phrase."',
  '"remember": "The first sentence is short and the second is long. Length has nothing to do with where a sentence ends."');

// H16 — the supplement contains three commas, not four.
edit(HARD_B, '"remember": "Four commas inside the supplement, and none of them closes it. Only the mark that opened the bracket can."',
  '"remember": "Three commas inside the supplement, and none of them closes it. Only the mark that opened the bracket can."');

/* --- HARD_B --- */

// H16 lives in HARD_B; H19 "cores" of a water column is not a thing.
edit(HARD_B, 'The expedition logged its samples in three lots: cores taken above the thermocline, where the water is warm and well ______ cores taken within it, where temperature falls ten degrees in as many meters; and cores taken below, where nothing has changed measurably in a century.',
  'The expedition logged its water samples in three lots: those drawn above the thermocline, where the water is warm and well ______ those drawn within it, where temperature falls ten degrees in as many meters; and those drawn below, where nothing has changed measurably in a century.');
edit(HARD_B, 'separates the first lot (\\"cores taken above the thermocline…well mixed\\") from the second lot (\\"cores taken within it…as many meters\\")',
  'separates the first lot (\\"those drawn above the thermocline…well mixed\\") from the second lot (\\"those drawn within it…as many meters\\")');

// H21 — a single page cannot span eleven years of entries.
edit(HARD_B, 'Only one volume of the guild\'s accounts survives, and it is incomplete. The ledger\'s final page ______ what the guild paid for candles, what it paid the watchman, and what it wrote off as spoiled — but not, anywhere in eleven years of entries, what it charged its own members.',
  'Only one volume of the guild\'s accounts survives, and it is incomplete. Its surviving pages ______ what the guild paid for candles, what it paid the watchman, and what it wrote off as spoiled — but not, anywhere in eleven years of entries, what it charged its own members.');
edit(HARD_B, '"options": ["records,", "records", "records:", "records —"],',
  '"options": ["record,", "record", "record:", "record —"],');
edit(HARD_B, 'a verb (\\"records\\") is immediately followed by its object',
  'a verb (\\"record\\") is immediately followed by its object');
edit(HARD_B, '"C": "a colon can\'t be used in this way, since the text that precedes it (\\"The ledger\'s final page records\\") is not a main clause; the verb \\"records\\" has not yet received its object.",',
  '"C": "a colon can\'t be used in this way, since the text that precedes it (\\"Its surviving pages record\\") is not a main clause; the verb \\"record\\" has not yet received its object.",');

// H22 — boundary capitalization, plus "a different hand" / "a drawing of a hand"
// put the same word on both sides of the tested mark.
edit(HARD_B, 'to a different ______ an apprentice whose only other documented work is a signed drawing of a hand, now in Vienna, that no one has connected to any painting.',
  'to a different ______ apprentice whose only other documented work is a signed drawing, now in Vienna, that no one has connected to any painting.');
edit(HARD_B, '"options": ["hand.", "hand", "hand:", "hand;"],',
  '"options": ["painter. An", "painter an", "painter: an", "painter; an"],');
edit(HARD_B, 'a colon is correctly used after the main clause (\\"The fourth…a different hand\\") to introduce the noun phrase that identifies whose hand is meant.',
  'a colon is correctly used after the main clause (\\"The fourth…a different painter\\") to introduce the noun phrase that identifies the painter.');
edit(HARD_B, '"A": "placing a period after \\"hand\\" results in a rhetorically unacceptable sentence fragment beginning with \\"An apprentice.\\"',
  '"A": "placing a period after \\"painter\\" results in a rhetorically unacceptable sentence fragment beginning with \\"An apprentice.\\"');
edit(HARD_B, '"B": "it fails to use appropriate punctuation to separate the main clause from the noun phrase that identifies the apprentice.",',
  '"B": "it fails to use appropriate punctuation to separate the main clause from the noun phrase that identifies the painter.",');

// H29 — option A was a defensible four-member series of content clauses governed
// by "that," and the "comma splice" rebuttal was false because the left span was
// subordinate. Rebuild with a genuine main clause on the left and one clause right.
edit(HARD_B, 'A minimum-wage increase in one state and not in its neighbor is the closest thing labor economics has to an experiment. The trouble is that the border itself is not ______ workers cross it, firms relocate across it, and the two sides differ in a dozen ways that no statistical control fully absorbs.',
  'A minimum-wage increase in one state and not in its neighbor is the closest thing labor economics has to an experiment. But the border between them is not ______ workers who live on one side and earn on the other, a group the payroll data cannot isolate, blur every comparison drawn across it.');
edit(HARD_B, 'between the first sentence (\\"The trouble…is not neutral\\") and the second sentence (\\"Workers cross it…fully absorbs\\")',
  'between the first sentence (\\"But the border…is not neutral\\") and the second sentence (\\"Workers who live…across it\\")');
edit(HARD_B, '"remember": "\\"Is not\\" looks unfinished, which is the trap. \\"The border itself is not neutral\\" is complete, and the list that follows is a new sentence."',
  '"remember": "\\"Is not\\" looks unfinished, which is the trap. \\"But the border between them is not neutral\\" is complete, and what follows starts a new sentence."');

// H30 — two commas follow the blank, not three.
edit(HARD_B, '"remember": "The three commas after the blank belong to a list of verbs. The one before the verb closes the interruption."',
  '"remember": "The two commas after the blank belong to a list of verbs. The one before the verb closes the interruption."');

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
