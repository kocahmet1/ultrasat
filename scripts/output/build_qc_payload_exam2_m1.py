# Builds Stage-2 rebuild payload for Exam 2, R&W Module 1 (27 brand-new questions).
# Emits qc_payload_exam2_m1.json consumed by rebuildExam2Module1.js
import json, os
HERE = os.path.dirname(os.path.abspath(__file__))
imgs = json.load(open(os.path.join(HERE, 'qc_images_e2m1.json')))
d = json.load(open(os.path.join(HERE, 'practiceExams_english_export.json')))
e2 = [x for x in d['exams'] if x['title'] == 'Exam 2'][0]
mod1 = e2['modules'][0]
old_ids = mod1['questionIds']

SUBID = {'words-in-context':4,'text-structure-purpose':5,'cross-text-connections':6,
         'central-ideas-details':1,'command-of-evidence':3,'inferences':2,
         'boundaries':9,'form-structure-sense':10,'transitions':8,'rhetorical-synthesis':7}

def q(text, options, correct, expl, sub, diff, graph=None, gdesc=None):
    return {"text":text,"options":options,"correctAnswer":correct,"explanation":expl,
            "difficulty":diff,"subcategory":sub,"subCategory":sub,"subcategoryId":SUBID[sub],
            "source":"import","usageContext":"exam","skillTags":[],
            "graphUrl":graph,"graphDescription":gdesc,"passage":None}

Q=[]

# 1 — WiC medium
Q.append(q(
 "The composer Florence Price drew on both European classical traditions and African American "
 "spirituals, a combination that struck some early critics as ______; today, however, this blending "
 "of influences is widely regarded as one of the most distinctive features of her work.\n\n"
 "Which choice completes the text with the most logical and precise word or phrase?",
 ["incongruous","conventional","tentative","melodic"],0,
 "Step 1: The word describes how critics reacted to a blend of two very different traditions, and it is "
 "contrasted with 'today...distinctive.'\nStep 2: 'Incongruous' (out of place, mismatched) fits critics "
 "who found the combination jarring. Correct.\n'Conventional' (B) is the opposite of an unusual blend; "
 "'tentative' (C) describes hesitancy, not a mismatch; 'melodic' (D) is unrelated to the critics' reaction.",
 "words-in-context","medium"))

# 2 — WiC easy
Q.append(q(
 "Elephants can communicate over long distances using low-frequency sounds too deep for humans to hear. "
 "These calls can ______ several kilometers, allowing separated members of a herd to stay in contact.\n\n"
 "Which choice completes the text with the most logical and precise word or phrase?",
 ["travel","collapse","hesitate","return"],0,
 "Step 1: The sentence explains that the calls reach herd members far away.\nStep 2: 'Travel' fits sounds "
 "that move across a distance. Correct.\n'Collapse' (B), 'hesitate' (C), and 'return' (D) do not describe "
 "sound covering distance.",
 "words-in-context","easy"))

# 3 — WiC medium
Q.append(q(
 "Advances in 3D printing have made it possible to produce prosthetic limbs far more ______ than "
 "traditional methods allow: a device that once cost thousands of dollars and took weeks to make can now "
 "be printed in a single day for a small fraction of the price.\n\n"
 "Which choice completes the text with the most logical and precise word or phrase?",
 ["cheaply","cautiously","elaborately","reluctantly"],0,
 "Step 1: The colon explains that the new method is both faster and much less expensive.\nStep 2: 'Cheaply' "
 "captures the lower cost emphasized after the colon. Correct.\n'Cautiously' (B), 'elaborately' (C), and "
 "'reluctantly' (D) do not match a reduction in cost and time.",
 "words-in-context","medium"))

# 4 — WiC hard
Q.append(q(
 "Economic historians have long debated whether the rapid industrialization of the nineteenth century was "
 "______ by the expansion of railroads or merely accelerated by it. Some argue that railroads were the "
 "primary engine of growth, while others contend that industrialization would have proceeded regardless, "
 "if more slowly.\n\n"
 "Which choice completes the text with the most logical and precise word or phrase?",
 ["precipitated","postponed","chronicled","exaggerated"],0,
 "Step 1: The blank is contrasted with 'merely accelerated'; the stronger claim is that railroads actually "
 "caused industrialization ('the primary engine of growth').\nStep 2: 'Precipitated' (brought about, caused) "
 "is the strong causal claim being contrasted with mere acceleration. Correct.\n'Postponed' (B) reverses the "
 "meaning; 'chronicled' (C) means recorded; 'exaggerated' (D) does not fit a debate about causation.",
 "words-in-context","hard"))

# 5 — Text Structure & Purpose (medium, literary)
Q.append(q(
 "The following text is adapted from Sarah Orne Jewett's 1896 novel The Country of the Pointed Firs. The "
 "narrator is describing her elderly landlady, Mrs. Todd, who gathers and sells herbs.\n\n"
 "Mrs. Todd's kitchen was crowded with drying bunches of herbs, and the whole house smelled of their sharp, "
 "sweet fragrance. Neighbors came to her door at all hours—not only for the remedies she brewed, but for her "
 "counsel, which she gave freely and with an air of quiet authority. She would listen to a visitor's troubles "
 "while her hands went on steadily sorting leaves, and when at last she spoke, her few words were remembered "
 "long after the visit had ended.\n\n"
 "Which choice best describes the overall structure of the text?",
 ["It establishes an impression of a character's surroundings and then develops that impression into an account of her influence on others.",
  "It presents a detailed description of a setting and then dismisses that setting as unimportant.",
  "It contrasts a character's public reputation with her private disappointments.",
  "It traces a single conversation from its beginning to an unexpected conclusion."],0,
 "Step 1: The passage opens with Mrs. Todd's herb-filled kitchen, then turns to how neighbors seek her "
 "remedies and counsel and remember her words.\nStep 2: Choice A tracks that movement from setting to her "
 "influence on others. Correct.\nChoice B is wrong—the setting is never dismissed. Choice C invents private "
 "disappointments not in the text. Choice D describes one specific conversation, but the text describes her "
 "habitual manner, not a single exchange.",
 "text-structure-purpose","medium"))

# 6 — Text Structure & Purpose (hard, informational, underlined-sentence function)
Q.append(q(
 "The brilliant blue of a Morpho butterfly's wings is one of the most intense colors in nature. "
 "Surprisingly, the wings contain no blue pigment at all. Instead, each wing scale is covered with "
 "microscopic ridged structures arranged in precise, repeating layers; when light strikes them, most "
 "wavelengths cancel out through interference while blue wavelengths are reflected and intensified. "
 "[u]Because the color arises from structure rather than pigment, it does not fade over time as pigments do.[/u]\n\n"
 "Which choice best describes the function of the underlined sentence in the text as a whole?",
 ["It identifies a practical advantage that follows from the structural basis of the color described earlier.",
  "It introduces an objection to the explanation offered earlier in the text.",
  "It provides an example of another butterfly species with unusually vivid coloring.",
  "It concedes a limitation of the scientific account given in the preceding sentences."],0,
 "Step 1: The earlier sentences explain that the blue comes from structure, not pigment. The underlined "
 "sentence adds that, as a result, the color does not fade.\nStep 2: Choice A correctly identifies this as a "
 "consequence/advantage of the structural mechanism. Correct.\nChoice B is wrong—it agrees with, not objects "
 "to, the explanation. Choice C introduces no second species. Choice D frames a benefit as a limitation.",
 "text-structure-purpose","hard"))

# 7 — Cross-Text Connections (hard)
Q.append(q(
 "Text 1\nIn 2018, a team led by Dirk Hoffmann reported that cave paintings in Spain were about 65,000 years "
 "old—older than the earliest known arrival of modern humans in Europe. The researchers concluded that the "
 "paintings must therefore have been made by Neanderthals, evidence that Neanderthals were capable of "
 "symbolic art.\n\nText 2\nSome scientists have challenged this conclusion. The method Hoffmann's team used "
 "dated thin mineral crusts that had formed on top of the paintings, not the paint itself. These critics "
 "note that such crusts can form long after a painting is made, so the paintings could be considerably "
 "younger than 65,000 years—and thus potentially the work of modern humans.\n\n"
 "Based on the texts, how would the scientists described in Text 2 most likely respond to the conclusion in Text 1?",
 ["By arguing that the dating method may not accurately reflect when the paintings themselves were created",
  "By agreeing that Neanderthals made the paintings but denying that the paintings are symbolic",
  "By insisting that modern humans reached Europe far earlier than had been thought",
  "By proposing that Neanderthals and modern humans created the paintings together"],0,
 "Step 1: Text 1 concludes the art is Neanderthal because it is ~65,000 years old. Text 2 objects that the "
 "dated crusts formed on top of the paint, so the paintings may be younger.\nStep 2: Choice A captures that "
 "objection—the dating may not reflect the paintings' true age. Correct.\nChoice B concedes Neanderthal "
 "authorship, which Text 2 disputes. Choice C is not claimed in Text 2. Choice D is unsupported.",
 "cross-text-connections","hard"))

# 8 — Central Ideas & Details (medium, literary)
Q.append(q(
 "The following text is adapted from Willa Cather's 1913 novel O Pioneers! Alexandra manages her family's "
 "farm on the Nebraska prairie.\n\nAlexandra had never known the land to look as it did that autumn. For "
 "years she had studied it, arguing with the stubborn soil, and now at last the fields seemed to answer her. "
 "The wheat stood thick and even to the horizon. She had believed in this country when almost no one else "
 "would, buying more land on credit while her neighbors sold theirs and moved away. Now the harvest proved "
 "her right.\n\nWhich choice best states the main idea of the text?",
 ["Alexandra's long-held faith in the land has finally been rewarded by a successful harvest.",
  "Alexandra regrets the financial risks she took in order to expand her farm.",
  "Alexandra finds farming less rewarding than she had expected it to be.",
  "Alexandra's neighbors have begun asking her for advice about their own farms."],0,
 "Step 1: The passage stresses that Alexandra believed in the land when others did not and expanded when "
 "they retreated, and that 'now the harvest proved her right.'\nStep 2: Choice A states that rewarded faith. "
 "Correct.\nChoice B contradicts the vindication described. Choice C is the opposite of the text's tone. "
 "Choice D adds neighbors seeking advice, which the text does not mention.",
 "central-ideas-details","medium"))

# 9 — Central Ideas & Details (easy, informational)
Q.append(q(
 "The Voynich manuscript is a hand-written book whose pages have been carbon-dated to the early 1400s. Its "
 "pages are filled with drawings of unfamiliar plants and astronomical charts, along with text written in a "
 "script that appears nowhere else. Despite more than a century of effort by professional codebreakers and "
 "linguists, no one has managed to read a single word of it.\n\n"
 "Which choice best states the main idea of the text?",
 ["The Voynich manuscript is a centuries-old book that has so far resisted every attempt to decipher its writing.",
  "The drawings in the Voynich manuscript are considered more valuable than its text.",
  "Professional codebreakers seldom devote attention to historical documents.",
  "The Voynich manuscript was written in a script also found in several other medieval books."],0,
 "Step 1: The text describes an old book in an unreadable, unique script that no expert has decoded.\nStep 2: "
 "Choice A captures both its age and its resistance to decipherment. Correct.\nChoice B compares value, which "
 "the text does not do. Choice C is unsupported. Choice D contradicts 'a script that appears nowhere else.'",
 "central-ideas-details","easy"))

# 10 — Command of Evidence, textual (medium, support hypothesis)
Q.append(q(
 "Certain desert ants find their way back to the nest by keeping track of how many steps they take, a "
 "strategy known as step counting. To test whether the ants rely on step count rather than on familiar "
 "landmarks, researchers hypothesized that artificially lengthening an ant's legs would cause it to walk "
 "past its nest, because longer legs would cover more ground in the same number of steps.\n\n"
 "Which finding, if true, would most directly support the researchers' hypothesis?",
 ["Ants whose legs were extended with tiny stilts walked past their nests before stopping to search for the entrance.",
  "Ants whose legs were extended returned to their nests just as accurately as untreated ants did.",
  "Ants used the position of the sun to choose a direction when they first left the nest.",
  "Ants with shortened legs took more steps than usual to reach a food source."],0,
 "Step 1: The hypothesis predicts that longer legs → more distance per step → overshooting the nest.\nStep 2: "
 "Choice A reports exactly that overshoot, supporting the hypothesis. Correct.\nChoice B shows no overshoot, "
 "which would weaken the hypothesis. Choice C concerns direction, not distance. Choice D involves shortened "
 "legs and a food source, not the predicted overshoot on the return trip.",
 "command-of-evidence","medium"))

# 11 — Command of Evidence, quantitative GRAPH (medium)
Q.append(q(
 "To investigate how vegetation affects city temperatures, a student measured the afternoon air temperature "
 "in five neighborhoods that differ in the percentage of ground shaded by tree canopy. The student claims "
 "that neighborhoods with greater tree-canopy coverage tend to have lower afternoon temperatures.\n\n"
 "Which choice most effectively uses data from the graph to support the student's claim?",
 ["Neighborhood E, with the greatest canopy coverage (70%), had the lowest afternoon temperature (26°C), while Neighborhood A, with the least coverage (10%), had the highest (35°C).",
  "Neighborhood C had a canopy coverage of 40% and an afternoon temperature of 31°C.",
  "Neighborhood A had a higher afternoon temperature than Neighborhood B did, though both had less than 30% canopy coverage.",
  "Every neighborhood with more than 50% canopy coverage had an afternoon temperature above 28°C."],0,
 "Step 1: The claim is that more canopy goes with lower temperature.\nStep 2: Choice A pairs the highest-"
 "canopy neighborhood (lowest temperature) with the lowest-canopy neighborhood (highest temperature), "
 "directly supporting the trend. Correct.\nChoice B reports a single data point and shows no relationship. "
 "Choice C compares only two low-canopy neighborhoods. Choice D misreads the graph: Neighborhood E (70% "
 "canopy) is 26°C, which is below 28°C, so the statement is false.",
 "command-of-evidence","medium",graph=imgs['e2m1_q11'],
 gdesc=("Bar graph titled 'Afternoon Temperature and Tree-Canopy Coverage in Five Neighborhoods.' Average "
        "afternoon temperature by neighborhood (percent canopy in parentheses): A (10%) 35°C, B (25%) 33°C, "
        "C (40%) 31°C, D (55%) 29°C, E (70%) 26°C.")))

# 12 — Command of Evidence, quantitative TABLE (medium)
Q.append(q(
 "A student researching batteries for a solar-power project compiled data on four rechargeable battery "
 "types, recording each type's energy density and the number of charge cycles it could complete while still "
 "retaining at least 80% of its original capacity. The student concluded that the battery type with the "
 "highest energy density is not necessarily the one that lasts the greatest number of charge cycles.\n\n"
 "Which choice most effectively uses data from the table to support the student's conclusion?",
 ["Lithium-ion had the highest energy density (250 Wh/kg), yet lithium iron phosphate completed the most charge cycles (3,000).",
  "Lead-acid had both the lowest energy density (40 Wh/kg) and the fewest charge cycles (300).",
  "Nickel-metal hydride had a higher energy density than lead-acid did but completed fewer charge cycles than lithium iron phosphate did.",
  "Lithium iron phosphate had a higher energy density than both nickel-metal hydride and lead-acid did."],0,
 "Step 1: The conclusion is that the highest-energy-density battery is not the longest-lasting.\nStep 2: "
 "Choice A shows lithium-ion leads in energy density but lithium iron phosphate leads in charge cycles, "
 "directly supporting the conclusion. Correct.\nChoice B shows density and cycles moving together, which does "
 "not support the conclusion. Choices C and D report true comparisons that do not address the mismatch "
 "between highest density and most cycles.",
 "command-of-evidence","medium",graph=imgs['e2m1_q12'],
 gdesc=("Table titled 'Comparison of Four Rechargeable Battery Types.' Columns: Battery type; Energy density "
        "(Wh/kg); Charge cycles to 80% capacity. Rows: Lithium-ion 250, 1,000; Lithium iron phosphate 120, "
        "3,000; Nickel-metal hydride 100, 500; Lead-acid 40, 300.")))

# 13 — Command of Evidence, textual (hard, undermine one of two hypotheses)
Q.append(q(
 "Some paleontologists propose that the long neck of the sauropod dinosaur Mamenchisaurus evolved mainly to "
 "let the animal reach leaves high in tall trees. A competing hypothesis holds that the long neck instead "
 "let the animal stand in one spot and sweep its head across a wide area of low-lying plants, saving the "
 "energy of walking.\n\n"
 "Which finding, if true, would most directly undermine the first hypothesis while leaving the second intact?",
 ["Fossil evidence indicates that Mamenchisaurus held its neck low and nearly horizontal and could not raise it steeply upward.",
  "The tallest trees in Mamenchisaurus's habitat rarely exceeded the height the animal could reach with its neck fully raised.",
  "Mamenchisaurus had a comparatively small head relative to the great length of its neck.",
  "Other sauropods living at the same time had necks even longer than that of Mamenchisaurus."],0,
 "Step 1: The first hypothesis needs the neck to reach high; the second needs it to sweep low, wide areas.\n"
 "Step 2: Choice A—an unraisable, horizontal neck—makes high browsing impossible (undermining the first) but "
 "is fully consistent with low, sweeping browsing (leaving the second intact). Correct.\nChoice B is "
 "ambiguous and does not directly rule out high browsing. Choices C and D are irrelevant to which feeding "
 "strategy the neck served.",
 "command-of-evidence","hard"))

# 14 — Inferences (medium)
Q.append(q(
 "The axolotl, a salamander that spends its entire life in water, can regrow lost limbs, portions of its "
 "heart, and even parts of its brain. Most other salamanders lose much of this regenerative ability once "
 "they mature and begin living on land. Because the axolotl keeps many juvenile features throughout its "
 "life, some biologists suspect that its remarkable powers of regeneration are tied to ______.\n\n"
 "Which choice most logically completes the text?",
 ["its never fully making the transition to a land-dwelling adult form.",
  "the comparatively small size of its brain relative to other salamanders.",
  "the variety of prey available to it in its watery habitat.",
  "the number of predators it must escape once it reaches adulthood."],0,
 "Step 1: The text links two facts: other salamanders lose regeneration when they mature onto land, and the "
 "axolotl keeps juvenile traits for life.\nStep 2: Choice A infers that the axolotl's regeneration is tied to "
 "its not completing that maturation. Correct.\nChoices B, C, and D introduce brain size, prey, and predators, "
 "none of which the text connects to regeneration.",
 "inferences","medium"))

# 15 — Inferences (hard)
Q.append(q(
 "When economists measure a nation's output using its own currency at current prices, they can overstate "
 "growth during periods of inflation, because rising prices alone can make output look larger even when the "
 "quantity of goods produced has not changed. To correct for this, economists often re-express the figures "
 "using a fixed set of prices from a single base year. A country that has just been through a period of high "
 "inflation is therefore likely to report ______.\n\nWhich choice most logically completes the text?",
 ["a smaller increase in output after its figures are adjusted to constant prices than before the adjustment.",
  "a greater quantity of goods produced than any country with low inflation.",
  "identical output figures whether or not prices are held constant.",
  "a decline in output that disappears once inflation is taken into account."],0,
 "Step 1: The text says current-price figures overstate growth during inflation and that constant-price "
 "adjustment removes that overstatement.\nStep 2: For a high-inflation country, the adjustment strips out "
 "inflated gains, so adjusted growth is smaller than unadjusted—Choice A. Correct.\nChoice B compares "
 "quantities across countries, which the text does not support. Choice C contradicts the point that "
 "adjustment changes the figures. Choice D reverses the direction of the effect.",
 "inferences","hard"))

# 16 — Boundaries (easy, appositive comma)
Q.append(q(
 "Kintsugi ______ the Japanese art of repairing broken pottery with gold, treats an object's cracks as part "
 "of its history rather than as flaws to hide.\n\n"
 "Which choice completes the text so that it conforms to the conventions of Standard English?",
 [",",";",":","—"],0,
 "Step 1: 'the Japanese art of repairing broken pottery with gold' is a nonrestrictive appositive renaming "
 "Kintsugi; it already closes with a comma after 'gold.'\nStep 2: The opening of the appositive must match "
 "with a comma. Correct is A.\nA semicolon (B) or colon (C) cannot open an appositive here, and a dash (D) "
 "would not match the closing comma.",
 "boundaries","easy"))

# 17 — Boundaries (medium, paired dashes)
Q.append(q(
 "The quipu ______ a system of knotted cords used by the Inca to record numbers and possibly other "
 "information — has fascinated researchers for generations.\n\n"
 "Which choice completes the text so that it conforms to the conventions of Standard English?",
 ["—",",",":",";"],0,
 "Step 1: The supplementary phrase describing the quipu closes with a dash before 'has fascinated,' so it "
 "must open with a matching dash.\nStep 2: Paired dashes set off the supplement. Correct is A.\nA comma (B), "
 "colon (C), or semicolon (D) would not match the closing dash.",
 "boundaries","medium"))

# 18 — Boundaries (medium, semicolon between independent clauses)
Q.append(q(
 "The northern lights are not silent to everyone ______ some observers report faint crackling or hissing "
 "sounds, a phenomenon scientists have only recently begun to explain.\n\n"
 "Which choice completes the text so that it conforms to the conventions of Standard English?",
 ["everyone,","everyone;","everyone","everyone, and,"],1,
 "Step 1: 'The northern lights are not silent to everyone' and 'some observers report faint crackling or "
 "hissing sounds...' are both independent clauses.\nStep 2: A semicolon correctly joins two independent "
 "clauses. Correct is B.\nA comma alone (A) makes a comma splice; no punctuation (C) makes a run-on; "
 "'and,' with a trailing comma (D) is not standard.",
 "boundaries","medium"))

# 19 — Form/Structure/Sense (easy, verb tense)
Q.append(q(
 "Last summer, a team of volunteers ______ more than two hundred trees along the eroded riverbank in an "
 "effort to stabilize the soil.\n\n"
 "Which choice completes the text so that it conforms to the conventions of Standard English?",
 ["plants","will plant","planted","is planting"],2,
 "Step 1: 'Last summer' places the action firmly in the past.\nStep 2: The simple past 'planted' matches. "
 "Correct is C.\nThe present 'plants' (A), the future 'will plant' (B), and the present progressive 'is "
 "planting' (D) all conflict with 'last summer.'",
 "form-structure-sense","easy"))

# 20 — Form/Structure/Sense (medium, future perfect)
Q.append(q(
 "By the time the archaeologists finish cataloging the artifacts next spring, they ______ at the site for "
 "nearly a decade.\n\n"
 "Which choice completes the text so that it conforms to the conventions of Standard English?",
 ["will have worked","worked","have worked","work"],0,
 "Step 1: The action continues up to a point in the future ('next spring'), covering a span of nearly ten "
 "years.\nStep 2: The future perfect 'will have worked' expresses an action completed by a future time. "
 "Correct is A.\nThe past 'worked' (B), present perfect 'have worked' (C), and present 'work' (D) do not fit "
 "the future reference point.",
 "form-structure-sense","medium"))

# 21 — Form/Structure/Sense (medium, pronoun agreement + its/it's)
Q.append(q(
 "After months of deliberation, the committee released ______ final report, which recommended sweeping "
 "changes to the city's recycling program.\n\n"
 "Which choice completes the text so that it conforms to the conventions of Standard English?",
 ["their","its","it's","their's"],1,
 "Step 1: 'Committee' is a singular collective noun, so a singular possessive pronoun is needed.\nStep 2: "
 "'Its' is the singular possessive. Correct is B.\n'Their' (A) is plural; 'it's' (C) means 'it is'; "
 "'their's' (D) is not a word.",
 "form-structure-sense","medium"))

# 22 — Form/Structure/Sense (hard, parallelism)
Q.append(q(
 "The naturalist John Muir spent much of his life exploring wilderness, ______ its beauty in vivid "
 "journals, and campaigning for its protection.\n\n"
 "Which choice completes the text so that it conforms to the conventions of Standard English?",
 ["he recorded","recording","to record","records"],1,
 "Step 1: The sentence lists three parallel activities: 'exploring...,' the blank, 'and campaigning....'\n"
 "Step 2: To match 'exploring' and 'campaigning,' the blank needs the gerund 'recording.' Correct is B.\n"
 "The clause 'he recorded' (A), the infinitive 'to record' (C), and the finite 'records' (D) all break the "
 "parallel structure.",
 "form-structure-sense","hard"))

# 23 — Transitions (easy, contrast)
Q.append(q(
 "Most cacti store water in their thick stems to survive long droughts. ______ the leafless ocotillo relies "
 "on quickly growing and then shedding small leaves whenever rain happens to fall.\n\n"
 "Which choice completes the text with the most logical transition?",
 ["By contrast,","As a result,","For example,","Similarly,"],0,
 "Step 1: The ocotillo's strategy is set against the water-storing strategy of most cacti.\nStep 2: 'By "
 "contrast' signals that opposition. Correct is A.\n'As a result' (B) marks a consequence, 'For example' (C) "
 "an illustration, and 'Similarly' (D) a likeness—none of which fits the contrast.",
 "transitions","easy"))

# 24 — Transitions (medium, consequence)
Q.append(q(
 "The new bridge was engineered with a slight, deliberate flexibility so that it could sway a few "
 "centimeters in strong winds. ______ gusts that might have cracked a perfectly rigid structure instead "
 "pass by harmlessly, leaving the bridge undamaged.\n\n"
 "Which choice completes the text with the most logical transition?",
 ["As a result,","Nevertheless,","However,","In contrast,"],0,
 "Step 1: The harmless passing of gusts is a direct outcome of the bridge's designed flexibility.\nStep 2: "
 "'As a result' marks that cause-and-effect. Correct is A.\n'Nevertheless' (B), 'However' (C), and 'In "
 "contrast' (D) all signal opposition, which does not fit a consequence.",
 "transitions","medium"))

# 25 — Rhetorical Synthesis (easy, example of)
Q.append(q(
 "While researching a topic, a student has taken the following notes:\n\n"
 "• The kora is a stringed instrument from West Africa.\n"
 "• It has 21 strings and is built from a large gourd covered with cowhide.\n"
 "• Traditionally, it is played by musicians and storytellers known as griots.\n"
 "• The Malian musician Toumani Diabaté was a celebrated kora player.\n\n"
 "The student wants to give an example of a well-known kora player. Which choice most effectively uses "
 "relevant information from the notes to accomplish this goal?",
 ["Toumani Diabaté, a musician from Mali, was a celebrated player of the kora.",
  "The kora, an instrument from West Africa, has 21 strings and is built from a gourd covered with cowhide.",
  "The kora is traditionally played by musicians and storytellers known as griots.",
  "With its 21 strings, the kora is a stringed instrument from West Africa."],0,
 "Step 1: The goal is to name a well-known kora player.\nStep 2: Choice A gives a specific celebrated "
 "player, Toumani Diabaté. Correct.\nChoices B, C, and D describe the instrument itself and name no "
 "individual player.",
 "rhetorical-synthesis","easy"))

# 26 — Rhetorical Synthesis (medium, emphasize a difference)
Q.append(q(
 "While researching a topic, a student has taken the following notes:\n\n"
 "• Stalactites and stalagmites are mineral formations found in caves.\n"
 "• Both form as water containing dissolved minerals drips inside a cave.\n"
 "• Stalactites hang down from the ceiling of a cave.\n"
 "• Stalagmites rise up from the floor of a cave.\n\n"
 "The student wants to emphasize a difference between stalactites and stalagmites. Which choice most "
 "effectively uses relevant information from the notes to accomplish this goal?",
 ["Stalactites hang down from a cave's ceiling, whereas stalagmites rise up from its floor.",
  "Stalactites and stalagmites are both mineral formations found in caves.",
  "Both stalactites and stalagmites form as mineral-rich water drips inside a cave.",
  "Stalactites and stalagmites both form from water that contains dissolved minerals."],0,
 "Step 1: The goal is to emphasize a difference.\nStep 2: Choice A contrasts where each forms—ceiling versus "
 "floor. Correct.\nChoices B, C, and D all emphasize similarities rather than a difference.",
 "rhetorical-synthesis","medium"))

# 27 — Rhetorical Synthesis (medium, explain to unfamiliar audience)
Q.append(q(
 "While researching a topic, a student has taken the following notes:\n\n"
 "• The Rosetta Stone is a stone slab discovered in Egypt in 1799.\n"
 "• It is inscribed with the same decree written in three scripts: hieroglyphic, Demotic, and ancient Greek.\n"
 "• Scholars of the time could already read ancient Greek.\n"
 "• By comparing the Greek text with the hieroglyphs, Jean-François Champollion deciphered Egyptian "
 "hieroglyphic writing in 1822.\n\n"
 "The student wants to explain to an audience unfamiliar with the Rosetta Stone how it helped scholars read "
 "hieroglyphs. Which choice most effectively uses relevant information from the notes to accomplish this goal?",
 ["Because the Rosetta Stone repeats one decree in hieroglyphic, Demotic, and Greek, scholars who could already read Greek were able to work out the hieroglyphs—a feat completed by Champollion in 1822.",
  "The Rosetta Stone, a stone slab inscribed with three different scripts, was discovered in Egypt in 1799.",
  "In 1822, Jean-François Champollion deciphered Egyptian hieroglyphic writing.",
  "The Rosetta Stone is inscribed with the same decree written in hieroglyphic, Demotic, and ancient Greek."],0,
 "Step 1: The goal is to explain how the stone helped scholars read hieroglyphs.\nStep 2: Choice A explains "
 "the mechanism—the repeated decree let readers of Greek decode the hieroglyphs—and notes Champollion's "
 "success. Correct.\nChoice B gives only discovery details, Choice C states the outcome without the "
 "mechanism, and Choice D describes the inscription without explaining how it aided decipherment.",
 "rhetorical-synthesis","medium"))

payload={"examId":"vxxtBSqnVQUPsXu9Xy4B","module1Id":"5COidioj5VkQlG22UrY9",
         "oldQuestionIds":old_ids,"questions":Q}
out=os.path.join(HERE,'qc_payload_exam2_m1.json')
json.dump(payload,open(out,'w'),ensure_ascii=False,indent=1)
from collections import Counter
print("questions:",len(Q))
print("domains:",dict(Counter(x['subcategory'] for x in Q)))
print("difficulty:",dict(Counter(x['difficulty'] for x in Q)))
print("with graph:",sum(1 for x in Q if x['graphUrl']))
print("wrote",out)
