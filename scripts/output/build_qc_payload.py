# Builds the Stage-2 QC payload for Exam 1 Modules 1 & 2.
# Emits qc_payload.json consumed by applyExam1QCFixes.js
import json, os
HERE = os.path.dirname(os.path.abspath(__file__))
imgs = json.load(open(os.path.join(HERE, 'qc_images.json')))

def q(text, options, correct, expl, sub, subid, diff,
      graph=None, gdesc=None):
    return {
        "text": text, "options": options, "correctAnswer": correct,
        "explanation": expl, "difficulty": diff,
        "subcategory": sub, "subCategory": sub, "subcategoryId": subid,
        "source": "import", "usageContext": "exam", "skillTags": [],
        "graphUrl": graph, "graphDescription": gdesc, "passage": None,
    }

# ============================================================= RECREATE (missing docs) — .set() at same id
recreate = {}

# M1 Q9 — Central Ideas & Details (Antikythera)
recreate["DQEjlzeyhcwKmAnq4SqS"] = q(
 "In 1901, divers exploring an ancient shipwreck off the Greek island of Antikythera "
 "recovered a corroded lump of bronze that has intrigued researchers ever since. Now known "
 "as the Antikythera mechanism and dated to roughly the second century BCE, the device holds "
 "dozens of interlocking gears that, when a crank was turned, modeled the movements of the Sun "
 "and Moon, predicted eclipses, and even tracked the four-year cycle of Greek athletic games. "
 "No geared device of comparable intricacy is known to have been built for more than a thousand "
 "years afterward.\n\nWhich choice best states the main idea of the text?",
 ["The Antikythera mechanism is a strikingly sophisticated ancient device whose complexity would not be matched again for over a millennium.",
  "The divers who explored the Antikythera shipwreck in 1901 were chiefly interested in recovering objects made of bronze.",
  "Ancient Greek astronomers relied on the Antikythera mechanism to settle disagreements about when athletic games should be held.",
  "Researchers have determined that intricate geared devices were widely used throughout the ancient Mediterranean world."],
 0,
 "Step 1: The passage describes the mechanism, lists what its gears could do (model the Sun and Moon, predict eclipses, track games), and stresses that nothing so intricate appeared again for over 1,000 years.\n"
 "Step 2: Choice A captures both parts—the device's sophistication and its unmatched complexity. Correct.\n"
 "Choice B focuses on a minor detail (the divers' motives), which the text does not actually state.\n"
 "Choice C overreaches: the text says the device tracked the games' cycle, not that it settled disputes.\n"
 "Choice D contradicts the final sentence, which says no comparable device existed for a millennium.",
 "central-ideas-details", 1, "medium")

# M1 Q12 — Command of Evidence, quantitative (TABLE)
recreate["qOKK86nOp5cEkPQnejPM"] = q(
 "A student studied seed dormancy in the honey locust (Gleditsia triacanthos), a tree whose "
 "hard, water-resistant seed coat can prevent seeds from sprouting. The student pretreated "
 "50 seeds by each of four methods, then recorded how many germinated and the average height "
 "of the resulting seedlings. The student concluded that breaching the seed coat—whether "
 "mechanically or chemically—promotes germination far more effectively than leaving the coat "
 "intact does.\n\nWhich choice most effectively uses data from the table to support the student's conclusion?",
 ["Whereas only 9 of the 50 untreated seeds germinated, 38 germinated after mechanical scarification and 44 after acid scarification.",
  "Seeds given a hot-water soak produced seedlings averaging 6.2 cm in height, taller than the seedlings from seeds that received no scarification.",
  "Acid scarification produced the tallest seedlings of any treatment, at an average of 7.8 cm.",
  "Mechanical scarification caused more seeds to germinate than any other treatment did."],
 0,
 "Step 1: The conclusion is that breaching the coat (mechanical or acid scarification) boosts germination far more than leaving it intact (no scarification).\n"
 "Step 2: Choice A compares the untreated seeds (9 germinated) with both coat-breaching methods (38 and 44), directly supporting the conclusion. Correct.\n"
 "Choice B is about seedling height, not germination rate, and so does not support a claim about germination.\n"
 "Choice C misreads the table: mechanical scarification, not acid, produced the tallest seedlings (7.8 cm vs. 7.5 cm).\n"
 "Choice D misreads the table: acid scarification produced more germination (44) than mechanical (38).",
 "command-of-evidence", 3, "medium",
 graph=imgs["m1q12"],
 gdesc=("Table titled 'Germination of Honey Locust Seeds by Pretreatment Method.' Columns: Seed "
        "treatment; Seeds that germinated (of 50); Average seedling height (cm). Rows: No "
        "scarification, 9, 4.1; Mechanical scarification, 38, 7.8; Acid scarification, 44, 7.5; "
        "Hot-water soak, 21, 6.2."))

# M1 Q21 — Boundaries (punctuation between two independent clauses)
recreate["vppzeudePma4yTmj7RlL"] = q(
 "When a honeybee returns to the hive after finding food, it performs a looping movement called "
 "the waggle ______ the angle of the dance tells the other bees the direction of the food relative "
 "to the Sun.\n\nWhich choice completes the text so that it conforms to the conventions of Standard English?",
 ["dance,", "dance;", "dance and,", "dance"],
 1,
 "Step 1: Both 'When a honeybee...the waggle dance' and 'the angle of the dance tells the other bees...' are independent clauses.\n"
 "Step 2: Two independent clauses cannot be joined by a comma alone (a comma splice), which eliminates A. A semicolon correctly joins them, so B is correct.\n"
 "Choice C misplaces the comma after 'and' and creates a faulty construction.\n"
 "Choice D runs the two clauses together with no punctuation (a run-on).",
 "boundaries", 9, "easy")

# M1 Q23 — Transitions
recreate["6ggs5FUyaHiu40nMLiWh"] = q(
 "Octopuses are famous for their ability to squeeze through remarkably small spaces. Because an "
 "octopus has no bones, it can compress its entire body to fit through any opening larger than its "
 "beak, the only hard part of its anatomy. ______ in one well-documented case, an aquarium "
 "octopus escaped its enclosure overnight by slipping through a narrow drainage pipe.\n\n"
 "Which choice completes the text with the most logical transition?",
 ["For example,", "In contrast,", "Nevertheless,", "Similarly,"],
 0,
 "Step 1: The first sentences state a general capacity—an octopus can squeeze through any gap larger than its beak. The final sentence gives a specific, real instance of that capacity.\n"
 "Step 2: A specific case that illustrates a general point calls for 'For example.' Correct.\n"
 "Choice B ('In contrast') is wrong because the escape agrees with, rather than opposes, the prior point.\n"
 "Choice C ('Nevertheless') wrongly signals a concession.\n"
 "Choice D ('Similarly') wrongly signals a parallel second case, but only one case is given.",
 "transitions", 8, "easy")

# M2 Q21 — Form, Structure, and Sense (subject-verb agreement)
recreate["9uTnBz3o08WiQZKNL8FI"] = q(
 "The collection of instruments aboard the spacecraft, which includes cameras, spectrometers, and "
 "a magnetometer, ______ data back to mission scientists on Earth throughout the flyby.\n\n"
 "Which choice completes the text so that it conforms to the conventions of Standard English?",
 ["transmit", "transmits", "have transmitted", "are transmitting"],
 1,
 "Step 1: The subject of the verb is the singular noun 'collection,' not the plural 'instruments,' which sits inside an interrupting phrase.\n"
 "Step 2: A singular subject takes the singular verb 'transmits.' Correct is B.\n"
 "Choices A, C, and D are all plural verb forms that would agree with 'instruments' rather than with the true subject, 'collection.'",
 "form-structure-sense", 10, "medium")

# ============================================================= UPDATE existing docs (dedup replacements + edits + retags)
updates = {}

# ---- Dedup replacements (regenerate the Module 2 side) ----

# M2 Q2 — Words in Context (replaces film-critics duplicate)
updates["ebDigyy8lWI7ekh3hItC"] = q(
 "Restoring a badly degraded coral reef is slow work, but marine biologist Ruth Gates believed the "
 "process could be ______ by breeding corals for heat tolerance: reefs seeded with these hardier "
 "corals bounce back from bleaching events far faster than untreated reefs do.\n\n"
 "Which choice completes the text with the most logical and precise word or phrase?",
 ["accelerated", "postponed", "documented", "complicated"],
 0,
 "Step 1: The colon introduces evidence that hardier corals help reefs 'bounce back...far faster,' so the missing word must mean sped up.\n"
 "Step 2: 'Accelerated' means made faster, matching the evidence. Correct.\n"
 "Choice B ('postponed') is the opposite of speeding up.\n"
 "Choice C ('documented') means recorded, which the sentence's logic does not support.\n"
 "Choice D ('complicated') suggests a problem, contradicting the faster recovery described.",
 "words-in-context", 4, "medium")

# M2 Q6 — Text Structure & Purpose (replaces reused George Eliot passage)
updates["TxaimibvkiPCNZVPxYwb"] = q(
 "The following text is adapted from Kate Chopin's 1894 short story “The Story of an Hour.” "
 "Louise Mallard has just been told that her husband has died in a railroad accident.\n\n"
 "She wept at once, with sudden, wild abandonment, in her sister's arms. When the storm of grief "
 "had spent itself she went away to her room alone. There, sinking into a roomy armchair that "
 "faced an open window, she felt pressed down by a physical exhaustion that seemed to reach into "
 "her soul. But she could not stop the faint, elusive whisper that came to her from the world "
 "outside—and slowly something was creeping toward her that she waited for, half in fear. It "
 "was too subtle to name, yet she began to recognize it as the first stirring of a strange new "
 "freedom.\n\nWhich choice best describes the overall structure of the text?",
 ["It depicts a character's initial outpouring of grief and then traces the emergence of an unexpected, contrary feeling.",
  "It contrasts one character's reaction to distressing news with another character's far calmer response.",
  "It presents a character's private reasoning and then reveals that her reasoning rested on a mistake.",
  "It describes a tranquil domestic scene that is gradually ruined by an intrusion from outside."],
 0,
 "Step 1: The passage moves from Louise's violent weeping to a quiet room, where a nameless feeling approaches and is recognized as a 'strange new freedom.'\n"
 "Step 2: Choice A tracks that movement—from grief to an unexpected, opposite feeling. Correct.\n"
 "Choice B is wrong: the sister is barely present and is not contrasted with Louise.\n"
 "Choice C is wrong: no reasoning is shown to be mistaken within the excerpt.\n"
 "Choice D misreads the 'whisper' from outside, which brings freedom rather than ruin.",
 "text-structure-purpose", 5, "hard")

# M2 Q14 — Inferences (replaces autobiographical-novel template)
updates["QqPuQMIlF1LGHMiWuXFg"] = q(
 "Ecologists once assumed that the tallest trees in a forest capture most of the available sunlight, "
 "leaving too little for seedlings on the shaded forest floor to survive. Yet many such seedlings "
 "persist for years. Recent studies show that mature trees can channel sugars to nearby seedlings "
 "through shared underground fungal networks. This suggests that a shaded seedling's survival may "
 "depend less on the sunlight it captures on its own than on ______.\n\n"
 "Which choice most logically completes the text?",
 ["the resources it receives from the larger trees around it.",
  "the total number of seedlings competing on the forest floor.",
  "the height it will eventually reach once it matures.",
  "the speed at which sunlight reaches the top of the forest canopy."],
 0,
 "Step 1: The puzzle is how shaded seedlings survive on little sunlight; the resolution offered is that mature trees send them sugars through fungal networks.\n"
 "Step 2: Choice A follows directly—survival depends on resources from larger trees, not just captured sunlight. Correct.\n"
 "Choice B introduces competition, which the text never connects to survival.\n"
 "Choice C concerns the seedling's future height, not its present survival in shade.\n"
 "Choice D is illogical: light reaching the canopy does not explain a shaded seedling's survival.",
 "inferences", 2, "hard")

# M2 Q23 — Rhetorical Synthesis (replaces reused Oahu-birds notes)
updates["PICfpO3bO7V6IYqK9jV7"] = q(
 "While researching a topic, a student has taken the following notes:\n\n"
 "• Tardigrades are microscopic animals often called water bears.\n"
 "• When their environment dries out, they can enter a dormant state called cryptobiosis.\n"
 "• In cryptobiosis, a tardigrade's metabolism slows to less than 0.01% of its normal rate.\n"
 "• Tardigrades in cryptobiosis have survived exposure to the vacuum of space.\n"
 "• A tardigrade can stay in cryptobiosis for years and then revive when water returns.\n\n"
 "The student wants to explain what happens to a tardigrade's metabolism during cryptobiosis. "
 "Which choice most effectively uses relevant information from the notes to accomplish this goal?",
 ["During cryptobiosis—a dormant state tardigrades enter when their environment dries out—a tardigrade's metabolism slows to less than 0.01% of its normal rate.",
  "Tardigrades, microscopic animals often called water bears, have survived exposure to the vacuum of space.",
  "A tardigrade can remain in cryptobiosis for years and then revive once water returns to its environment.",
  "Tardigrades are microscopic animals that are sometimes referred to as water bears."],
 0,
 "Step 1: The goal is to explain what happens to the metabolism during cryptobiosis.\n"
 "Step 2: Choice A names cryptobiosis and states the metabolic change (below 0.01% of normal). Correct.\n"
 "Choice B is about surviving space, not metabolism.\n"
 "Choice C is about duration and revival, not the metabolic change.\n"
 "Choice D only defines what a tardigrade is.",
 "rhetorical-synthesis", 7, "easy")

# M2 Q26 — Rhetorical Synthesis (replaces reused torsional-heating notes)
updates["93MLjmpS0KB3HmnAUnUz"] = q(
 "While researching a topic, a student has taken the following notes:\n\n"
 "• The James Webb Space Telescope (JWST) launched in December 2021.\n"
 "• It observes primarily in the infrared part of the spectrum.\n"
 "• The Hubble Space Telescope observes mainly in visible and ultraviolet light.\n"
 "• Observing in infrared lets JWST detect light from some of the earliest galaxies.\n"
 "• Light from those early galaxies has been stretched to infrared wavelengths by the expansion of the universe.\n\n"
 "The student wants to explain why JWST is able to detect light from some of the earliest galaxies. "
 "Which choice most effectively uses relevant information from the notes to accomplish this goal?",
 ["Because the expansion of the universe has stretched light from the earliest galaxies to infrared wavelengths, JWST, which observes in infrared, is able to detect it.",
  "The James Webb Space Telescope, which launched in December 2021, observes primarily in the infrared part of the spectrum.",
  "Unlike the James Webb Space Telescope, the Hubble Space Telescope observes mainly in visible and ultraviolet light.",
  "The James Webb Space Telescope observes in infrared light, while the Hubble Space Telescope observes in visible and ultraviolet light."],
 0,
 "Step 1: The goal is to explain WHY JWST can detect the earliest galaxies' light.\n"
 "Step 2: Choice A links the cause (expansion stretched the light to infrared) with JWST's infrared observing. Correct.\n"
 "Choice B states JWST observes in infrared but omits why that lets it see early galaxies.\n"
 "Choice C is about Hubble and gives no explanation.\n"
 "Choice D contrasts the two telescopes but does not explain the detection.",
 "rhetorical-synthesis", 7, "medium")

# ---- Targeted edits (keep item, fix the specific problem) ----

# M2 Q1 — replace fabricated title 'Enthrace'; keep options + answer (D/identify)
updates["idlNdUB8tIM21ZbsIT8Z"] = q(
 "In some of his sculptures, Apache artist Allan Houser uses abstract geometric shapes to depict "
 "his subjects rather than portraying them in realistic detail. His later bronzes, in particular, "
 "are often so highly abstract that they differ strikingly from earlier pieces in which the viewer "
 "can easily ______ familiar objects.\n\n"
 "Which choice completes the text with the most logical and precise word or phrase?",
 ["reveal", "remember", "ignore", "identify"],
 3,
 "Step 1: The contrast is between highly abstract works and earlier, realistic pieces in which figures are easy to make out.\n"
 "Step 2: 'Identify' means to recognize, fitting pieces in which familiar objects are easy to recognize. Correct is D.\n"
 "Choice A ('reveal') would be done by the artwork, not the viewer.\n"
 "Choice B ('remember') wrongly implies recalling objects from memory.\n"
 "Choice C ('ignore') is the opposite of what a realistic depiction invites.",
 "words-in-context", 4, "medium")

# M2 Q5 — rewrite the incoherent passage as a clean inference item
updates["Naq0WcS7nfiqv0MUfMWe"] = q(
 "For centuries, theater relied on little more than a bare platform; the elaborately detailed stage "
 "set did not become common until the seventeenth century. Yet audiences before then still followed "
 "plays set in forests, palaces, and distant lands. Because the stage itself offered almost no visual "
 "cues, these earlier audiences must have depended heavily on a play's language and on their own "
 "______.\n\nWhich choice most logically completes the text?",
 ["imagination to picture where the action was taking place.",
  "memory of earlier performances of the same play.",
  "familiarity with the actors appearing on the stage.",
  "knowledge of how modern stage sets are designed."],
 0,
 "Step 1: The passage says early stages gave 'almost no visual cues,' yet audiences still followed plays set in vivid locations.\n"
 "Step 2: With no scenery to show the setting, audiences would rely on language and their own imagination. Correct is A.\n"
 "Choice B is unsupported; nothing links survival of the scene to prior performances.\n"
 "Choice C is irrelevant to picturing a play's setting.\n"
 "Choice D is anachronistic and illogical for audiences of earlier centuries.",
 "inferences", 2, "medium")

# M2 Q24 — add the missing standard stem line (content unchanged)
q24_body = (
 "• Some birds use tools to obtain food.\n"
 "• A 2020 study observed New Caledonian crows fashioning hooks from twigs.\n"
 "• The crows used these hooks to extract grubs, reducing their foraging time considerably.\n"
 "• In the same study, parrots were observed using pebbles to crack open nuts, though this method was less efficient.\n\n"
 "The student wants to emphasize a difference between the crows and the parrots in the study. "
 "Which choice most effectively uses relevant information from the notes to accomplish this goal?")
updates["tudxpJpEXVh5HloikCFz"] = q(
 "While researching a topic, a student has taken the following notes:\n\n" + q24_body,
 ["The 2020 study revealed that both crows and parrots use tools, but the crows fashioned hooks while the parrots used pebbles.",
  "New Caledonian crows are highly intelligent, as shown by their ability to fashion tools from twigs.",
  "In the 2020 study, the parrots' method of using tools was less efficient than the crows' method was.",
  "Tool use among birds, such as hook-making by crows, demonstrates advanced problem-solving skills."],
 2,
 "Step 1: The goal is to emphasize a DIFFERENCE between the crows and the parrots.\n"
 "Step 2: Choice C contrasts the two directly—the parrots' method was less efficient than the crows'. Correct.\n"
 "Choice A notes both use tools but frames it as a similarity as much as a difference and is less pointed than C.\n"
 "Choice B discusses only the crows.\n"
 "Choice D makes a general claim about birds and draws no contrast.",
 "rhetorical-synthesis", 7, "medium")

# M2 Q27 — add the missing standard stem line (content unchanged)
q27_body = (
 "• In a 2003 study, Alexander and Schrag tested the effect of plant litter on seedling emergence in a grassland setting.\n"
 "• The test site was a mesic grassland in a dry midlatitude climate in the United States.\n"
 "• In these conditions, the presence of plant litter had a positive effect on seedling emergence.\n"
 "• Seedling emergence is when a seedling sprouts above ground and begins photosynthesis.\n\n"
 "The student wants to present the study's findings to an audience already familiar with the concept "
 "of seedling emergence. Which choice most effectively uses relevant information from the notes to accomplish this goal?")
updates["HE4mqhoOcuCxTuQSySTz"] = q(
 "While researching a topic, a student has taken the following notes:\n\n" + q27_body,
 ["The findings of Alexander and Schrag's study were published in 2003.",
  "In a 2003 study, Alexander and Schrag found that plant litter has a positive effect on seedling emergence, which is when a seedling sprouts and begins photosynthesis.",
  "Plant litter, which includes dead leaves and other plant matter, has been the subject of scientific study.",
  "In a mesic grassland in a dry midlatitude climate, Alexander and Schrag found that the presence of plant litter had a positive effect on seedling emergence."],
 3,
 "Step 1: The audience already knows what seedling emergence is, so the answer should report the finding without re-defining that term.\n"
 "Step 2: Choice D states the finding and its conditions without defining seedling emergence. Correct.\n"
 "Choice B wastes words re-defining seedling emergence for an audience that already knows it.\n"
 "Choice A gives only the publication year, not the finding.\n"
 "Choice C describes the topic generally and reports no finding.",
 "rhetorical-synthesis", 7, "medium")

# ---- Graph attach + retag (partial updates, keep text/options/answer unless noted) ----
partial = {}

# M1 Q11 — attach the missing FTA bar graph (answer already B / index 1)
partial["qHPUIUjltUUHA2VbH7uG"] = {
  "graphUrl": imgs["m1q11"],
  "graphDescription": ("Grouped bar chart titled 'Average Total Agricultural Export Growth Rate, "
    "Five Years Before and After Entering an FTA with the United States.' For each country a "
    "'5 years before FTA' bar and a '5 years after FTA' bar are shown. Mexico (NAFTA): before "
    "-3.0%, after 8.0%. Nicaragua (CAFTA-DR): before 24.0%, after 12.0%. El Salvador (CAFTA-DR): "
    "before 15.0%, after 21.8%.")
}

# M2 Q10 — retag from rhetorical-synthesis to quantitative command of evidence
partial["FH0Fxb2xNmZ9tpUv9v9P"] = {
  "subcategory": "command-of-evidence", "subCategory": "command-of-evidence", "subcategoryId": 3
}

# M2 Q12 — clean the placeholder text, attach real graph, retag CoE (answer already A / index 0)
partial["SJnM8VL7NsU3onT3IWw9"] = {
  "text": ("Researchers investigated how enjoyment of a story is affected when it has been "
    "spoiled—that is, when the reader already knows an important plot development in advance. "
    "Participants rated their enjoyment of one story that had been spoiled for them beforehand and "
    "one story that had not. For every story, participants who had received a spoiler reported "
    "greater enjoyment, on average, than those who had not. But the size of this difference varied "
    "from story to story, as is best illustrated by the enjoyment ratings for ______.\n\n"
    "Which choice most effectively uses data from the graph to complete the statement?"),
  "options": ["“Owl Creek Bridge” and “A Chess Problem.”",
              "“The Calm” and “Plumbing.”",
              "“Blitzed” and “A Chess Problem.”",
              "“Blitzed” and “Plumbing.”"],
  "correctAnswer": 0,
  "explanation": ("Step 1: The claim is that the spoiler-versus-unspoiled gap VARIED from story to story, "
    "so the best illustration pairs a very large gap with a very small one.\n"
    "Step 2: In the graph, 'Owl Creek Bridge' shows the largest gap (4.6 to 7.6, a 3.0-point jump) and "
    "'A Chess Problem' the smallest (6.9 to 7.2, a 0.3-point jump). Together they span the full range of "
    "variation, so A is correct.\n"
    "Choices B and D pair stories with nearly identical gaps, which illustrates little variation. Choice C "
    "includes the small-gap story but pairs it with 'Blitzed,' whose gap is only moderate, so it spans a "
    "narrower range than A."),
  "subcategory": "command-of-evidence", "subCategory": "command-of-evidence", "subcategoryId": 3,
  "graphUrl": imgs["m2q12"],
  "graphDescription": ("Grouped bar chart titled 'Story Enjoyment Ratings: Spoiled vs. Unspoiled,' y-axis "
    "'Average enjoyment rating (1 = lowest; 10 = highest).' Unspoiled then Spoiled values: A Dark Brown "
    "Dog 5.0/6.2; Owl Creek Bridge 4.6/7.6; Blitzed 5.4/6.9; The Calm 5.2/6.5; A Chess Problem 6.9/7.2; "
    "Plumbing 5.1/6.4.")
}

payload = {"examId": "IcRvQJmEg0pyW2vTv0pB",
           "module1Id": "62S6QRLJIRQaR0xfQurX",
           "module2Id": "COUaD8uRujchbMej3MT1",
           "recreate": recreate, "updates": updates, "partial": partial}

out = os.path.join(HERE, 'qc_payload.json')
json.dump(payload, open(out, 'w'), ensure_ascii=False, indent=1)
print("recreate:", len(recreate), "| full updates:", len(updates), "| partial:", len(partial))
print("wrote", out)
