#!/usr/bin/env python3
"""
Apply the editorial and final question-by-question QA findings to the authored
part_*.json files. Idempotent: each replacement is asserted present before it is
applied, and the script reports every change it makes.

Run:  python3 scripts/output/pt5-build/apply_critic_fixes.py
Then: python3 scripts/output/pt5-build/assemble.py
"""
import json, glob, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
parts = {f: json.load(open(f, encoding='utf-8')) for f in glob.glob(os.path.join(HERE, 'part_*.json'))}
index = {}
for f, arr in parts.items():
    for x in arr:
        index[(x['module'], x['q'])] = x

applied, skipped = [], []


def _flex(s):
    """Regex that matches `s` with either straight or curly quote characters.

    The authored part files use ASCII apostrophes; assemble.py converts them to
    typographic ones. Matching on either keeps this script runnable against both.
    """
    out = []
    for ch in s:
        if ch in "'’":
            out.append("['’]")
        elif ch in '"“”':
            out.append('["“”]')
        else:
            out.append(re.escape(ch))
    return ''.join(out)


def sub(m, q, field, old, new, opt_i=None, required=True):
    """Replace `old` with `new` in one field of one item (quote-style agnostic)."""
    x = index[(m, q)]
    tgt = x['options'][opt_i] if opt_i is not None else x[field]
    label = 'M%dQ%d.%s%s' % (m, q, field, '[%s]' % 'ABCD'[opt_i] if opt_i is not None else '')
    # Idempotence must be checked before looking for the old text: in a few
    # edits, the new phrase contains the old phrase as a prefix (for example,
    # “38 percent” -> “57 percent”), and searching old first would reapply it.
    new_pat = re.compile(_flex(new))
    if new_pat.search(tgt):
        skipped.append(label + ' (already applied)')
        return
    pat = re.compile(_flex(old))
    if not pat.search(tgt):
        if required:
            sys.exit('MISS %s: could not find %r' % (label, old[:90]))
        skipped.append(label + ' (not found, optional)')
        return
    res = pat.sub(lambda _: new, tgt, count=0)
    if opt_i is not None:
        x['options'][opt_i] = res
    else:
        x[field] = res
    applied.append(label)


# ---------------------------------------------------------------- MODULE 1 ----

# M1Q10 SOFT: "rusted over N percent" reads as "more than N percent". Restate so the
# option's truth value does not depend on disambiguating its own verb.
sub(1, 10, 'options',
    'coatings F-1 and F-3 differed in thickness by one micrometer yet rusted over 22 percent and 5 percent of their area.',
    "coatings F-1 and F-3 differed in thickness by one micrometer, yet 22 percent of F-1’s surface had rusted and only 5 percent of F-3’s had.",
    opt_i=2)
sub(1, 10, 'options',
    'coating F-4 rusted over a larger share of its area than F-3 did despite containing three percentage points more silica.',
    'coating F-4 rusted across a larger share of its area than F-3 did despite containing three percentage points more silica.',
    opt_i=3, required=False)
sub(1, 10, 'explanation',
    'yet F-1 rusted over 22 percent of its surface after 2,000 hours while F-3 rusted over only 5 percent.',
    'yet 22 percent of F-1’s surface had rusted after 2,000 hours while only 5 percent of F-3’s had.')

# M1Q11: "of the five nights" attached to a decline; five nights give four intervals.
sub(1, 11, 'options',
    'its steepest one-night decline of the five nights.',
    'the largest single-night decline it showed.',
    opt_i=0)
sub(1, 11, 'explanation',
    'a 14-point drop that is its steepest single-night decline.',
    'the largest single-night decline it showed.')

# M1Q13 SOFT: nothing in the claim forced a dramatized scene, leaving A defensible.
# Naming the "stranger" element makes C the only quotation that satisfies the claim.
sub(1, 13, 'passage',
    'Sulev uses that walk to convey Ilona’s discovery that the village has gone on changing in ways that take no account of her.',
    'Sulev uses that walk to convey Ilona’s discovery that the village has gone on changing in ways that leave her a stranger in it.',
    required=False)
sub(1, 13, 'explanation',
    'The claim is that Sulev conveys Ilona’s discovery that Halvern has gone on changing in ways that take no account of her, so the quotation must do two things at once: register a change in the village and show that the change has proceeded without reference to Ilona herself.',
    'The claim is that Sulev conveys Ilona’s discovery that Halvern has gone on changing in ways that leave her a stranger in it, so the quotation must do two things at once: register a change in the village and show Ilona being treated as a stranger there.',
    required=False)
sub(1, 13, 'explanation',
    'but the quotation supplies no scene, no altered thing, and no moment in which the village fails to acknowledge her.',
    'but the quotation supplies no scene, no altered thing, and no moment in which anyone in Halvern treats her as a stranger.',
    required=False)
sub(1, 13, 'explanation',
    'rather than any change in the actual village or any indifference on the village’s part.',
    'rather than any change in the actual village or any moment in which she is taken for a stranger.',
    required=False)

# M1Q12: name spelled two ways between stimulus and rationale.
sub(1, 12, 'explanation', 'Cisse’s', 'Cissé’s', required=False)
sub(1, 12, 'explanation', "Cisse's", 'Cissé’s', required=False)

# M1Q16: the rationale misidentifies the noun the plural verb agrees with.
sub(1, 16, 'explanation',
    'it agrees only with the nearest noun, “lanternfish,” which belongs to an intervening modifier.',
    'it agrees instead with the plural nouns “copepods, krill, and lanternfish,” which sit inside an intervening relative clause rather than serving as the subject.',
    required=False)

# M1Q27: "three endings she drafted" — ambiguous antecedent (Vaziri or Pryimak).
sub(1, 27, 'options', 'three endings she drafted', 'three endings Pryimak drafted', opt_i=2, required=False)

# ---------------------------------------------------------------- MODULE 2 ----

# M2Q11 SOFT: the over-60 column fell steeply toward Ardeny, which is evidence for the
# very proposition Baek's caution denies. Flatten that column so only the under-30
# column varies with distance; the keyed within-town comparison is unaffected.
sub(2, 11, 'passage', '<td>38</td>', '<td>57</td>')
sub(2, 11, 'passage', '<td>52</td>', '<td>59</td>')
sub(2, 11, 'passage', 'and 38 percent', 'and 57 percent', required=False)
for i in range(4):
    sub(2, 11, 'options', '38 percent', '57 percent', opt_i=i, required=False)
sub(2, 11, 'explanation', '38 percent', '57 percent', required=False)

# M2Q18: rivers do not erode a hilltop site.
sub(2, 18, 'passage', 'the hilltop settlement of Ardu Kelan', 'the riverside settlement of Ardu Kelan')
sub(2, 18, 'explanation', 'hilltop settlement', 'riverside settlement', required=False)

# M2Q15 / M2Q17: definite noun phrases with no antecedent.
sub(2, 15, 'passage', 'buries its eggs in loose soil at the edge of a floodplain',
    'buries its eggs in a low mound of loose soil at the edge of a floodplain', required=False)
sub(2, 17, 'passage', 'Rust does not spread evenly across a bar of iron.',
    'Rust does not spread evenly across a wet bar of iron.', required=False)

# M2Q6: keyed option's relative clause attaches to the wrong noun.
sub(2, 6, 'options',
    'It qualifies an earlier claim about return rates that the text then illustrates with evidence',
    'It qualifies an earlier claim about return rates, and the text then illustrates that qualification with evidence',
    opt_i=1, required=False)

# M2Q10: keyed option reads as though both hoverfly figures come from one planting.
sub(2, 10, 'options',
    'while hoverfly visits fell from 18 to 15 in the six-species mix',
    'while hoverfly visits fell from 18 in the two-species planting to 15 in the six-species mix',
    opt_i=1, required=False)

# M2Q12: a poem called "The Hour Before Rain" described as covering twenty minutes.
sub(2, 12, 'passage', 'twenty minutes', 'hour', required=False)
sub(2, 12, 'text', 'twenty minutes', 'hour', required=False)
sub(2, 12, 'explanation', 'twenty minutes', 'hour', required=False)

# ------------------------------------------------------ FORM-WIDE NAME FIXES ----
# College Board never repeats a given name inside a module. Three Nadèges, three
# Aigerims, two Ileanas and two Baeks appeared across the form.
RENAMES = {
    (2, 10): [('Nadège Kouassi', 'Lucía Otamendi'), ('Kouassi', 'Otamendi'), ('Nadège', 'Lucía')],
    (2, 14): [('Nadège Kouadio', 'Priya Ramanathan'), ('Kouadio', 'Ramanathan'), ('Nadège', 'Priya')],
    (2, 12): [('Aigerim Zhaksybek', 'Saule Mukhamedova'), ('Zhaksybek', 'Mukhamedova'), ('Aigerim', 'Saule')],
    (2, 8):  [('Aigerim Dosanova', 'Marjeta Dosanova'), ('Aigerim', 'Marjeta')],
    (2, 6):  [('Ileana Bacescu', 'Corina Bacescu'), ('Ileana', 'Corina')],
    (2, 11): [('Hyeon-ju Baek', 'Hyeon-ju Yun'), ('Baek', 'Yun')],
}
for (m, q), pairs in RENAMES.items():
    x = index[(m, q)]
    for old, new in pairs:
        for field in ('passage', 'text', 'explanation'):
            if old in x[field]:
                x[field] = x[field].replace(old, new)
                applied.append('M%dQ%d.%s rename %s->%s' % (m, q, field, old, new))
        for i, o in enumerate(x['options']):
            if old in o:
                x['options'][i] = o.replace(old, new)
                applied.append('M%dQ%d.options[%s] rename %s->%s' % (m, q, 'ABCD'[i], old, new))

# --------------------------------------------------------- FINAL QA REVISIONS ----
# A question-by-question publication audit found two invalid conventions items,
# one fuzzy transition distractor, several passages whose evidence or scientific
# framing needed tightening, fictional-source labels that sounded historical,
# and a handful of form-level repetitions. Set whole fields here so this script
# remains the reproducible source of the editorial fixes.

def set_field(m, q, field, value):
    x = index[(m, q)]
    if x[field] == value:
        skipped.append('M%dQ%d.%s (already set)' % (m, q, field))
        return
    x[field] = value
    applied.append('M%dQ%d.%s final-QA revision' % (m, q, field))


def set_options(m, q, values):
    if len(values) != 4:
        sys.exit('M%dQ%d: expected exactly four options' % (m, q))
    set_field(m, q, 'options', values)


# M1Q5 / M1Q13: identify newly written literary material honestly.
set_field(1, 5, 'passage', '''The following text is from “The Whistling Gate,” an original short story written for this practice test. Signy has been left alone to mind her family's roadside inn.

Signy set the lamp on the sill and counted the coins a second time, though she had counted them at the door. The tally was the same. Still she counted, and while she counted she listened for the gate, which whistled when the wind crossed the field and whistled also when a traveler pushed it open. She had always believed she could tell the two whistles apart. Now, with the road gone black, she found that she could not. Twice she set the kettle on, and twice she took it off again before the water could boil.''')
set_field(1, 5, 'explanation', '''Choice B is correct. Signy repeatedly performs unsettled actions: although she has already counted the coins and confirms that the tally is unchanged, she counts them again. She listens for the gate but can no longer distinguish the whistle made by the wind from the whistle made by a traveler, and she twice puts the kettle on only to remove it before the water boils. Together, these details convey her nervousness as she waits alone for someone to arrive. Choice A is incorrect because the gate's whistle is presented as a sound Signy is trying to interpret, not as a customary way travelers announce themselves. Choice C is incorrect because the text does not describe a list of chores or say that the inn is about to close; Signy's repeated handling of the kettle shows agitation rather than steady completion of a task. Choice D is incorrect because nothing in the text indicates that Signy resents being responsible for the inn. Her behavior reveals anxiety about a possible arrival, not dissatisfaction with having been left in charge.''')

# M1Q6: estimate deposition with tracked movement plus measured retention time,
# instead of treating a bird's later perch as a seed-deposition location.
set_field(1, 6, 'passage', '''Surveys of seed dispersal usually work outward from a fruiting tree, mapping every seed of that species found on the ground within a fixed radius. [UNDERLINED]No seed carried past the edge of that circle can appear in the resulting figures, so the longest distance a survey reports is set in advance by the size of the plot searched.[/UNDERLINED] To estimate how far crested thrushes move kaluri palm seeds, ecologist Tashi Lhendren and colleagues instead radio-tracked thrushes after they ate kaluri palm fruit and measured seed-retention times in controlled feeding trials. Combining the birds' locations with those retention times, the team's model placed a quarter of predicted seed-deposition events beyond the widest radius any previous survey had searched.''')
set_options(1, 6, [
    'It notes a rare exception to the description of dispersal surveys given in the previous sentence',
    "It reports the outcome of the tracking and feeding study that Lhendren's team carried out",
    "It identifies a limitation of the standard method that Lhendren's approach was designed to avoid",
    'It argues that the seed counts produced by earlier dispersal surveys were recorded incorrectly',
])
set_field(1, 6, 'explanation', '''Choice C is correct. The first sentence describes a standard survey that searches for seeds within a fixed radius of a fruiting tree. The underlined sentence explains an inherent limit of that method: a seed outside the search circle cannot be counted, so the plot's size fixes the greatest distance the survey can report. The next sentence introduces Lhendren's alternative, which combines bird tracking with measured seed-retention times and can therefore estimate deposition beyond a predetermined ground-search boundary. The final result shows why avoiding that boundary matters. Choice A is incorrect because the underlined sentence describes a limitation that applies to every fixed-radius survey, not a rare exception. Choice B is incorrect because the outcome of Lhendren's study appears in the final sentence; the underlined sentence precedes the study and discusses only the standard method. Choice D is incorrect because the sentence does not claim that earlier researchers recorded the seeds inside their plots inaccurately. It explains that seeds outside those plots were excluded from the resulting figures.''')
set_field(1, 6, 'authorNote', "Hard function item. The underlined sentence identifies the built-in ceiling of fixed-radius surveys; Lhendren's movement-plus-retention model is designed to avoid that ceiling. A mislabels a general limitation as a rare exception, B relocates the study result, and D confuses incomplete coverage with inaccurate recording.")

# M1Q12: independently manipulate noise, calls, and sac motion, and measure the
# female response that defines whether the visual display substitutes for a call.
set_field(1, 12, 'passage', '''Male Vantaro treefrogs call from leaves overhanging fast-flowing streams, and the rush of the water masks much of the frequency range their calls occupy. Zoologist Fatoumata Cissé and her colleagues noticed that males beside the loudest rapids inflate and wave a bright yellow vocal sac between calls, whereas males beside quiet pools rarely do. The team hypothesizes that the waving is not an independent signal with a different function but a substitute channel: when noise masks a male's call, the moving yellow sac conveys the same mate-location message to females. To test this hypothesis, the researchers presented females with robotic males whose calls, sac movements, and background-noise levels could be varied independently.''')
set_options(1, 12, [
    'Males exposed to recorded noise from rapids raised both pitch and volume of their calls, even when an opaque screen hid their vocal sacs from nearby females.',
    'In quiet conditions, females approached a calling model more often than an otherwise identical model displaying only a waving yellow sac.',
    'Males whose yellow sacs were experimentally dulled continued calling at the same rate as males whose sacs retained their natural color.',
    'With noise from rapids masking the call, adding sac movement restored female approach rates to those elicited by the same call without that noise.',
])
set_field(1, 12, 'explanation', '''Choice D is correct. The hypothesis predicts that the visual signal should compensate specifically when noise prevents females from receiving the call and should produce the same mate-directed response that an audible call produces. Choice D reports exactly that pattern: when noise from rapids masks the call, adding sac movement restores female approach to the level elicited by the call without that noise. This result directly links the visual display to acoustic masking and to the call's function. Choice A is incorrect because changing pitch and volume would show an adjustment within the acoustic channel; it would not show that the waving sac can substitute for a masked call. Choice B is incorrect because it compares the two signals only in quiet conditions and indicates that the call is more effective there, so it does not test the predicted compensatory role under noise. Choice C is incorrect because an unchanged male calling rate after the sac is dulled says nothing about how females respond to the visual signal or whether that signal restores communication when stream noise masks the call.''')
set_field(1, 12, 'authorNote', 'Textual-claim item, key D. The correct finding independently manipulates masking noise and sac motion and measures the same female approach response produced by an audible call. A changes only the acoustic channel, B uses the wrong noise condition, and C does not measure receiver response.')

set_field(1, 13, 'passage', '''The Weir at Halvern is an original work of fiction written for this practice test. Its narrator, Ilona, has spent eleven years working in a city two hundred kilometers away and returns to Halvern, the village where she grew up, expecting to find it as she left it. Much of the novel's first section follows her on a single walk from the station to her mother's house. The walk conveys Ilona's discovery that the village has gone on changing in ways that leave her a stranger in it.''')
set_field(1, 13, 'explanation', '''Choice C is correct. The claim has two parts: Halvern has changed, and those changes leave Ilona feeling like a stranger. The bakery's new name establishes a change in the village, while the woman's question suggests that she does not recognize Ilona as someone who belongs there. The quotation therefore illustrates both parts of the claim in a single scene. Choice A is incorrect because it expresses Ilona's general realization that Halvern has changed but does not show anyone treating her as a stranger. Choice B is incorrect because it concerns the idealized version of the village that Ilona maintained in her memory, not a change in the actual village or Ilona's reception upon returning. Choice D is incorrect because it shows that the hedge and gate remain exactly as Ilona remembers them. It therefore illustrates continuity rather than change and gives no indication that Ilona has become a stranger in Halvern.''')
set_field(1, 13, 'authorNote', 'Quotation item, key C. The fictional source is explicitly labeled original. C alone both registers a physical change and shows Ilona being treated as an outsider; A states only the change theme, B concerns memory, and D shows continuity.')

# M1Q22: remove “Similarly,”, which can naturally compare Belmora with the many
# departments in the preceding generalization.
set_options(1, 22, ['For instance,', 'However,', 'In conclusion,', 'As a result,'])
set_field(1, 22, 'explanation', '''Choice A is correct. “For instance” signals that the final sentence provides a specific example of the general practice described in the preceding sentence. The phrase “many departments” states a broad pattern, and the Belmora County health department is one named department that fits it. Offering blood pressure checks at a laundromat is a concrete case of bringing a basic screening into an ordinary neighborhood space. Choice B is incorrect because “however” signals a contrast, but the Belmora County program illustrates rather than opposes the practice just described. Choice C is incorrect because “in conclusion” introduces a summary or final judgment, whereas the last sentence narrows the discussion from a broad trend to one concrete program. Choice D is incorrect because “as a result” signals a cause-and-effect relationship. The Belmora County program is not presented as a consequence of other departments' programs; it is a member of the same general category.''')
set_field(1, 22, 'authorNote', 'relation: example. A broad pattern is followed by one concrete program. The distractors now test contrast, conclusion, and cause-result; none can also express the general-to-example relation.')

# M2Q2: replace a wood-kiln scenario that closely repeated another local form.
set_field(2, 2, 'passage', '''Textile artist Danica Vukotić colors silk in an indigo vat whose chemistry shifts as air enters during dyeing. She has learned to accept that her results will be ______: two scarves cut from the same bolt and dipped for the same length of time may emerge from one vat in noticeably different shades of blue.''')
set_field(2, 2, 'explanation', '''Choice D (unpredictable) is correct. The example after the colon defines the missing word: two scarves made from the same bolt, dipped for the same amount of time, and colored in the same vat can emerge in noticeably different shades. Because those controlled similarities do not guarantee the same result, Vukotić cannot reliably foresee the exact shade of a scarf before dyeing it. The changing chemistry of the vat explains this variability, so “unpredictable” is precise. Choice A (identical) is incorrect because the passage explicitly says the scarves may emerge in different shades rather than matching each other. Choice B (fragile) is incorrect because nothing in the passage concerns whether the silk tears or is easily damaged; the described difference is in color. Choice C (inexpensive) is incorrect because the text provides no information about the cost of the silk, dye, or process. It describes variation in the outcome of dyeing, not its price.''')
set_field(2, 2, 'authorNote', 'Easy words-in-context item. The colon supplies controlled similarities followed by visibly different color outcomes, making “unpredictable” exact. The textile-dyeing scenario replaces a wood-kiln setup that was too close to another local form.')

# M2Q7: retain the rival moisture-source mechanism without making a categorical
# claim that stalagmite growth rate itself measures total rainfall.
set_field(2, 7, 'passage', '''Text 1
A stalagmite from Qorimay Cave preserves a continuous climate record spanning the past nine thousand years. The ratio of oxygen isotopes locked into its calcite falls sharply at a layer dated to about five thousand years ago and never returns to earlier values. [UNDERLINED]The plateau above the cave must therefore have become markedly drier at that time and must have remained so ever since.[/UNDERLINED]

Text 2
Rainfall is only one influence on the oxygen isotopes in cave calcite; the isotopic signature of the rain itself depends on where the moisture originated. Paleoclimatologist Aigerim Zhaksybek analyzed water trapped inside the same Qorimay stalagmite and found that, five thousand years ago, the plateau's rain began arriving from a distant ocean basin rather than a nearby sea. Thus, the isotope shift does not by itself reveal whether the amount of rainfall changed.''')
set_field(2, 7, 'explanation', '''Choice C is correct. The underlined claim in Text 1 infers that the plateau became permanently drier because the oxygen-isotope ratio in the stalagmite changed about five thousand years ago. Text 2 challenges that inference rather than the isotope measurement itself. It explains that the isotopic signature of rain depends partly on where its moisture originated, and Zhaksybek's analysis indicates that the plateau's moisture source shifted from a nearby sea to a distant ocean basin at the same time as the isotope change. She would therefore note that a change in moisture source could produce the pattern that Text 1 attributes to declining rainfall. Choice A is incorrect because Zhaksybek does not concede that the plateau grew drier, and she dates the moisture-source shift to the same time Text 1 identifies rather than to an earlier period. Choice B is incorrect because Text 2 treats cave records as informative; it argues only that oxygen isotopes can reflect more than rainfall amount. Choice D is incorrect because Text 2 neither establishes that rainfall declined nor mentions vegetation as a possible cause.''')
set_field(2, 7, 'authorNote', 'Hard cross-text item. Text 2 preserves the measured isotope shift but supplies a rival cause, moisture-source change, so it undercuts the aridity inference without relying on a categorical stalagmite-growth proxy.')

# M2Q8 / M2Q12: identify original literary material rather than presenting it as
# an actual publication from 2018 or 1918.
set_field(2, 8, 'passage', '''The Bread Ovens of Karagai is an original work of fiction written for this practice test. The narrator is eleven and is helping her grandmother bake for a village wedding.

Grandmother handed me the long wooden paddle without a word, and my stomach dropped. I had watched her slide loaves into that oven a hundred times but had never held it myself. My first loaf went in crooked and scorched along one edge. Nobody laughed. By the fourth, my wrists had learned the small flick that sets a loaf down flat, and I caught myself counting under my breath, impatient for the next one. When the last tray was empty, I did not want to give the paddle back.''')
set_field(2, 8, 'explanation', '''Choice A is correct. The text traces a change in the narrator's response to an unfamiliar task. At first, receiving the paddle makes her stomach drop, and her first loaf goes in crooked and scorches. By the fourth loaf, however, she has learned the necessary motion, is impatient for another turn, and does not want to return the paddle when the work ends. These details show nervousness giving way to enjoyment. Choice B is incorrect because the grandmother's silence is only an opening detail; it does not capture the narrator's subsequent change. Choice C is incorrect because it reverses the ending. The narrator does not feel relieved to return the paddle—she does not want to give it back. Choice D is incorrect because the text never compares the narrator's bread-making skill with her grandmother's. Learning to set a loaf down flat does not imply that the narrator has surpassed her.''')
set_field(2, 8, 'authorNote', 'Original fiction, explicitly labeled as written for this practice test. The passage moves from apprehension through an imperfect first attempt to growing skill and enjoyment. B elevates one detail, C reverses the ending, and D invents a comparison.')
set_field(2, 12, 'passage', '''The following original poem, “The Hour Before Rain,” was written for this practice test. It is set in a small market town on a July afternoon, in the hour between the first darkening of the sky and the first drop of rain. The poem gives most of that hour to the townspeople rather than to the weather, presenting the storm as something the town has already begun to make room for.''')
set_field(2, 12, 'explanation', '''Choice D is correct. The claim says that the town begins making room for the storm before the rain arrives. Choice D shows precisely that anticipatory response: the baker brings in her trays, and shutters close one street at a time. Those actions involve the townspeople rather than merely the weather, and they occur during the hour before the first drop. Choice A is incorrect because it describes the darkening sky but shows no resident preparing for the storm. Choice B is incorrect because it offers the speaker's general judgment about nine summers; it does not depict the town responding to the approaching rain. Choice C is incorrect because it takes place after the rain has begun. Its opening word, “Afterward,” along with the running gutters and children standing in the water, places the scene outside the interval named in the claim. Only choice D illustrates the town collectively accommodating the storm in advance.''')
set_field(2, 12, 'authorNote', 'Quotation item using an original poem explicitly labeled as written for this practice test. D shows collective preparation before rainfall; A depicts weather only, B gives a general judgment, and C occurs after the rain begins.')

# M2Q9: layer order establishes “after,” not the size of the interval; the pigment
# date is approximate, and the evidence concerns only the sky layer.
set_field(2, 9, 'passage', '''The oak panel known as The Weighing of the Nets has long been dated to about 1610 on the basis of the clothing its figures wear. Conservation scientist Zsuzsanna Halasz recently sampled pigments from several areas of the painting. The garments and the boats contain azurite, a blue mineral pigment European painters had used for centuries. The sky, however, contains Prussian blue, a synthetic pigment developed around 1706. Moreover, the sky's paint layer sits directly on top of the varnish that seals the garments and boats below it.''')
set_options(2, 9, [
    "It contains azurite, the same blue pigment that appears in the panel's garments and boats.",
    'It was painted after the figures and boats beneath it and no earlier than about 1706.',
    'Its color has faded more severely than the colors of the garments and boats have.',
    'It shows that the entire panel was produced much later than art historians have believed.',
])
set_field(2, 9, 'explanation', '''Choice B is correct. The text gives two reasons to date the sky separately from the figures and boats. First, the sky contains Prussian blue, “a synthetic pigment developed around 1706,” so that layer could not have been painted before approximately that date. Second, “the sky's paint layer sits directly on top of the varnish that seals the garments and boats below it,” showing that the figures and boats had already been painted and varnished when the sky was added. Choice B accurately combines those two points. Choice A is incorrect because the text assigns azurite to the garments and boats but Prussian blue to the sky. Choice C is incorrect because the text compares the areas' pigments and the order of their paint layers, not how severely their colors have faded. Choice D is incorrect because it goes beyond what the evidence supports. The analysis dates the sky as a later addition; it does not establish that every part of the panel was produced after 1706.''')
set_field(2, 9, 'authorNote', 'The pigment date and layer order establish that the sky was added after the varnished figures and no earlier than about 1706. They do not establish a “long” interval or re-date the entire panel.')

# M2Q10: describe the observed visitation pattern without inferring a causal
# richness effect from four plantings whose species identities also differ.
q210 = index[(2, 10)]
svg, sep, _prose = q210['passage'].partition('\n\n')
if not sep or not svg.lstrip().startswith('<svg'):
    sys.exit('M2Q10: expected SVG followed by prose')
set_field(2, 10, 'passage', svg + '''

Flowering strips are often sown along field edges to support the insects that pollinate nearby crops. Pollination ecologist Lucía Otamendi sowed four kinds of strip on a research farm: a grass-only control, a single-species clover strip, a two-species clover-and-yarrow strip, and a six-species wildflower mix. Over one summer she counted visits by solitary bees and by hoverflies during repeated 15-minute surveys. Otamendi reports that, across plantings with successively more flowering species, solitary bee visits rose more consistently than hoverfly visits did, noting that ______''')
set_field(2, 10, 'explanation', '''Choice B is correct. The claim is comparative: across plantings with successively more flowering species, solitary bee visits rose more consistently than hoverfly visits did. The graph shows solitary bee visits increasing at every step, from 5 visits per survey in the grass-only control to 16 in the single-species clover strip, 24 in the two-species clover-and-yarrow strip, and 33 in the six-species wildflower mix. Hoverfly visits increase from 7 to 10 to 18 but then decrease to 15 in the six-species mix. Choice B accurately describes both patterns and therefore directly supports the claim. Choice A is incorrect because, although it accurately reports the bee value for the control, one value for one insect group cannot establish a comparative pattern across the four plantings. Choice C is incorrect because it reverses the two series: bee visits rise from 5 to 33, while hoverfly visits fall from 18 to 15 between the final two plantings. Choice D is incorrect because, although it accurately reports an increase in hoverfly visits, it says nothing about bee visits and does not compare how consistently the two groups' visits changed.''')

# M2Q15: the old colon could also join the clauses. A semicolon is now the sole
# correct boundary; the period distractor has an intentionally lowercase start.
set_options(2, 15, ['weeks, the', 'weeks; the', 'weeks the', 'weeks. the'])
set_field(2, 15, 'explanation', '''Choice B is correct. The convention being tested is punctuation between two main clauses. The first clause, “Once the clutch is covered, the female guards the site for nearly six weeks,” can stand on its own as a sentence. The second clause, “the male, in the meantime, patrols a wide circle around the mound, driving away smaller lizards that would dig up the eggs,” can also stand on its own. A semicolon correctly marks the boundary between these closely related main clauses, and the word following a semicolon remains lowercase. Choice A is incorrect because a comma without a coordinating conjunction cannot join two main clauses; the result is a comma splice. Choice C is incorrect because placing no punctuation between the clauses creates a fused sentence. Choice D is incorrect because a period can separate two main clauses only when the following sentence begins with a capital letter. The lowercase “the” after the period makes this choice nonstandard.''')
set_field(2, 15, 'authorNote', 'Boundary between two independent clauses. B uses a semicolon and lowercase continuation. A is a comma splice, C is fused, and D incorrectly begins a new sentence with lowercase “the.”')

# M2Q16: all option pronouns must be lowercase after the introductory comma.
set_options(2, 16, ['they', 'these', 'it', 'them'])
set_field(2, 16, 'explanation', '''Choice C is correct. The convention being tested is pronoun-antecedent agreement. The singular subject pronoun “it” agrees in number with its antecedent, the singular noun phrase “a petition bearing more than four thousand signatures,” and correctly indicates that the petition asked for three improvements. The nearby plural nouns “signatures” and “clauses” occur inside phrases that modify or describe the petition; neither is the document making the requests. Because the blank follows an introductory phrase and comma within the sentence, the pronoun also correctly begins with a lowercase letter. Choice A is incorrect because the plural pronoun “they” does not agree in number with the singular antecedent “a petition.” Choice B is incorrect because the plural demonstrative pronoun “these” likewise does not agree with the singular antecedent and does not clearly identify the document. Choice D is incorrect because “them” is an objective-case pronoun and cannot serve as the subject of the verb “asked”; it is also plural.''')
set_field(2, 16, 'authorNote', 'Pronoun agreement and case: singular subject “it” refers to “a petition.” Every option is lowercase because the blank follows a comma within a continuous sentence.')

# M2Q25: replace a transparent restatement with a genuine synthesis item. The
# conclusion depends on combining the survey channel with the demographic gap.
set_field(2, 25, 'passage', '''A city survey of commuting habits reported a three-point margin of error, but it was administered only through a smartphone app. Census records show that commuters over sixty make up nearly a quarter of the city's workforce, whereas only 4 percent of the survey's respondents were over sixty. ______ the survey's narrow margin of error does not establish that its estimate represents all of the city's commuters.''')
set_options(2, 25, ['Taken together,', 'For example,', 'Nevertheless,', 'In other words,'])
set_field(2, 25, 'difficulty', 'hard')
set_field(2, 25, 'explanation', '''Choice A is correct. “Taken together” signals that the final sentence draws a conclusion by combining two pieces of information. The survey used only a smartphone app, and commuters over sixty make up nearly a quarter of the workforce but only 4 percent of the respondents. Together, those facts reveal a substantial representation problem that a narrow margin of error does not address. Choice B is incorrect because “for example” would introduce an instance of a preceding general claim, whereas the final sentence is a conclusion drawn from the specific evidence already presented. Choice C is incorrect because “nevertheless” signals that the final sentence contrasts with or holds despite the earlier information. Instead, the conclusion follows from that information. Choice D is incorrect because “in other words” introduces a restatement. The final sentence does not merely rephrase the census comparison or the survey method; it combines them to evaluate what the margin of error can establish.''')
set_field(2, 25, 'authorNote', 'Hard synthesis transition. The final sentence follows only when the app-only survey method and the severe age underrepresentation are considered together. The distractors test example, concession, and restatement relationships.')

# Move Q27 away from a repeated grid-storage scenario while preserving the
# phase-change mechanism and the key's full mechanism-versus-purpose distinction.
set_field(2, 27, 'passage', '''While researching a topic, a student has taken the following notes:
• Greenhouse growers in cold climates need inexpensive ways to save daytime heat for cold nights.
• Materials scientist Arpine Sarkisyan builds porous ceramic blocks filled with ordinary mineral salt for use in greenhouses.
• Collected sunlight melts the salt inside each block.
• Melting absorbs substantial heat without raising the salt's temperature.
• At night, the salt hardens and releases stored heat into the greenhouse.''')
set_field(2, 27, 'text', 'The student wants to explain the complete process by which the salt takes in heat during the day and makes that heat available at night, for an audience unfamiliar with the technology. Which choice most effectively uses relevant information from the notes to accomplish this goal?')
set_options(2, 27, [
    'Sunlight melts the salt in a block; melting absorbs heat, which the salt releases when it hardens at night.',
    'As the salt melts, it absorbs heat without becoming hotter, allowing each block to collect substantial daytime heat.',
    'When the salt hardens at night, it releases stored heat from the block into the greenhouse.',
    "Sarkisyan's blocks use an ordinary mineral salt to help greenhouse growers save daytime heat for cold nights.",
])
set_field(2, 27, 'difficulty', 'hard')
set_field(2, 27, 'explanation', '''Choice A is correct. The goal requires the complete process: how the salt takes in heat during the day and how it makes that heat available at night. Choice A supplies both halves. Sunlight melts the salt, melting absorbs heat, and the salt releases that heat when it hardens at night. Choice B is incorrect because it accurately explains only the daytime half of the process: melting allows the salt to absorb heat. It omits how the stored heat becomes available later. Choice C is incorrect because it accurately explains only the nighttime half: hardening releases heat into the greenhouse. It omits how the salt took that heat in. Choice D is incorrect because it accurately states the blocks' material and purpose but describes neither phase of the storage mechanism. Thus, although every choice uses the notes accurately, only choice A fulfills the request for the complete process in language an unfamiliar audience can follow.''')
set_field(2, 27, 'authorNote', 'Hard rhetorical-synthesis item. Key A gives the complete melt/absorb and harden/release process. B and C are accurate half-mechanisms, and D gives composition plus purpose. Five notes match the dominant official note-set length.')

# Remove exact name reuse elsewhere in the local practice-test suite.
FINAL_RENAMES = {
    (1, 11): [('Camila Restrepo', 'Amaya Iturriaga'), ('Restrepo', 'Iturriaga')],
    (1, 16): [('Malia Fonoti', 'Mele Taufa'), ('Fonoti', 'Taufa')],
    (2, 14): [('Priya Ramanathan', 'Ananya Ghoshal'), ('Ramanathan', 'Ghoshal')],
}
for (m, q), pairs in FINAL_RENAMES.items():
    x = index[(m, q)]
    for old, new in pairs:
        for field in ('passage', 'text', 'explanation', 'authorNote'):
            if old in x.get(field, ''):
                x[field] = x[field].replace(old, new)
                applied.append('M%dQ%d.%s final rename %s->%s' % (m, q, field, old, new))
        for i, option in enumerate(x['options']):
            if old in option:
                x['options'][i] = option.replace(old, new)
                applied.append('M%dQ%d.options[%s] final rename %s->%s' % (m, q, 'ABCD'[i], old, new))

# Five-note RS sets are far more representative than making all five questions
# use the seven-note maximum. Merge only facts already represented by options.
set_field(1, 25, 'passage', '''While researching a topic, a student has taken the following notes:
• Odile Ranaivo, an anthropologist, compares two long-established regional coiled-basketry traditions in lowland Nangela and highland Tsiroa.
• Ranaivo spent two years in each community documenting the work.
• Nangela makers coil marsh sedge, whereas Tsiroa makers coil split willow.
• Nangela baskets are dyed black, whereas Tsiroa baskets are left undyed.
• In both communities, apprentices learn by watching, never by spoken instruction.''')
set_field(1, 26, 'passage', '''While researching a topic, a student has taken the following notes:
• Andrius Jankauskas, an engineer, designed a strain sensor for highway bridges.
• Existing bridge sensors need battery replacement every two years, requiring a maintenance crew and lane closure.
• Jankauskas's sensor draws power from the bridge's vibrations and transmits a strain reading hourly by radio.
• Prototypes have been installed on four bridges since 2021.
• Needing no battery, the sensor can remain in place unattended for decades.''')
set_field(1, 27, 'passage', '''While researching a topic, a student has taken the following notes:
• Halyna Pryimak wrote the 1871 novel The Quarry Wife in eleven months while working as a schoolteacher.
• Pryimak destroyed most of her papers before her death in 1903.
• In 2022, literary scholar Rukhsana Vaziri found Pryimak's surviving notebooks, which contain three discarded endings for the novel.
• Vaziri's 2024 study Endings Withheld analyzes all three endings.
• Vaziri argues that the endings show Pryimak steadily revising her view of the heroine.''')
set_field(2, 26, 'passage', '''While researching a topic, a student has taken the following notes:
• Sleep researcher Wanjiru Kamau studies how different kinds of evening light affect how quickly people fall asleep.
• Kamau recruited sixty adults who reported trouble falling asleep.
• For two weeks each adult spent the final evening hour under dim amber light.
• For another two weeks each spent that hour under ordinary room light.
• Under amber light, participants fell asleep about seventeen minutes sooner on average.''')

# Conventions explanations should teach the tested rule without making students
# work through 200–250 words of repeated analysis. These retain the evidence and
# one explicit disqualifier for every distractor.
CONCISE_CONVENTIONS = {
    (1, 15): '''Choice A is correct. The convention being tested is punctuation between a subject and its verb. In this clause, the complete grammatical subject is “the small, tightly rolled leaves clustered along each stem,” and the main verb is “lose.” The words “clustered along each stem” modify “leaves” and remain part of the subject, so no punctuation should separate “stem” from the main verb that follows in this clause. The subject must connect directly to its predicate. Choice B is incorrect because the comma improperly separates the complete subject from its main verb and falsely treats the required predicate as supplementary. Choice C is incorrect because a semicolon can join main clauses, but the words before the blank contain only a subject and its modifiers, not a complete clause. Choice D is incorrect because the dash improperly interrupts the connection between the subject and verb and suggests that the sentence is opening a supplementary element where none exists.''',
    (1, 16): '''Choice C is correct. The convention being tested is subject-verb agreement. The subject of the main clause in this sentence is the singular noun phrase “the daily migration,” so it requires the singular verb “transports.” The plural nouns “copepods, krill, and lanternfish” appear inside a prepositional phrase modifying “migration,” and the plural verb “make” belongs to the relative clause beginning with “that”; neither changes the number of the main subject. Agreement is controlled by the head noun, not by nearby plurals. Choice A is incorrect because the plural verb “transport” agrees with the nearby animal names rather than with the singular subject “migration.” Choice B is incorrect because the plural auxiliary “have” in “have transported” does not agree with the singular subject “migration,” regardless of the participle that follows. Choice D is incorrect because the plural auxiliary “are” in “are transporting” also fails to agree with “migration,” even though “animals” is the nearest preceding noun.''',
    (1, 17): '''Choice A is correct. The convention being tested is punctuation of a supplementary element. The dash after “Aramburu” opens the supplementary description “trained as a violinist and hired by her first orchestra at seventeen,” so a matching dash must follow “seventeen” to close it. Removing the description leaves the complete sentence “The Argentine composer Sofía Aramburu was among the first arrangers to write the players' improvised parts down on paper,” confirming that the enclosed material is supplementary. Choice B is incorrect because a comma cannot pair with the opening dash to mark the two boundaries of the same supplementary element. Choice C is incorrect because a colon cannot close an element opened by a dash and, in any case, cannot follow material that does not form a complete main clause. Choice D is incorrect because using no punctuation leaves the opening dash unmatched and runs the supplementary description directly into the main verb “was.”''',
    (1, 18): '''Choice C is correct. The convention being tested is the use of a finite verb in a main clause. The subject in this independent clause is “The 200 closely spaced prints exposed on a limestone slab at Tolquin Ridge,” and it needs a finite main verb to complete the statement grammatically. “Exposed” is a participle modifying “prints,” not the clause's main verb; “form” supplies the required present-tense main verb and agrees with the plural subject. Choice A is incorrect because the infinitive “to form” is nonfinite and therefore leaves the sentence without a main verb. Choice B is incorrect because the participle “forming” can introduce a modifying phrase but cannot serve as the finite verb required by this clause. Choice D is incorrect because the perfect participial phrase “having formed” is also nonfinite and consequently leaves the words beginning with “The 200 closely spaced prints” as a sentence fragment.''',
    (1, 19): '''Choice D is correct. The convention being tested is coordination of two main clauses. The first clause, “Weaver Yayra Ahiabu taught herself the technique by studying nineteenth-century fragments,” and the second, “she has never managed to reproduce the fine ribbed border that appears on several of them,” can each stand alone as a sentence. To join them while signaling their contrast, the coordinating conjunction “but” should be preceded by a comma, as it is in choice D. The punctuation and conjunction work together at the clause boundary. Choice A is incorrect because a comma alone cannot join the two main clauses and therefore creates a comma splice. Choice B is incorrect because placing no punctuation or conjunction between the clauses creates a run-on sentence. Choice C is incorrect because the comma appears after “but” instead of before it, separating the conjunction from the clause it introduces while failing to mark the boundary between the two main clauses correctly.''',
    (1, 20): '''Choice D is correct. The convention being tested is subject-modifier placement. The introductory phrase “Selected over four decades by agronomist Bilal Yeşilkaya for roots strong enough to break that crust apart” must immediately precede the noun it logically modifies in this sentence. The barley variety Tessuran is the entity selected over time and the entity that has roots, so placing “the barley variety Tessuran” directly after the modifier creates a clear and logical sentence. Choice A is incorrect because placing “growers” after the introductory phrase illogically suggests that the growers were selected for the strength of their roots. Choice B is incorrect because placing “the region's compacted fields” after the phrase illogically identifies the fields as having been selected for strong roots. Choice C is incorrect because the gerund phrase “planting the barley variety Tessuran” makes an activity the apparent recipient of selection and the illogical possessor of the roots.''',
    (1, 21): '''Choice B is correct. The convention being tested is punctuation in a complex series. The sentence lists three groups, and each group includes an internal comma before a supplementary relative clause: “the merchant guilds, which sent four delegates each”; “the parish churches, which sent two”; and “the resident householders, who sent one delegate for each district.” Semicolons should separate such complex items, while a comma should separate “the parish churches” from the supplementary clause that describes them. Choice A is incorrect because a colon does not conventionally separate parallel items in a series and conflicts with the semicolon used before the third item. Choice C is incorrect because a comma after “each” fails to distinguish the boundary between series items from the commas within those items. Choice D is incorrect because the second semicolon wrongly separates the noun phrase “the parish churches” from its supplementary relative clause “which sent two,” a boundary that requires a comma.''',
    (2, 17): '''Choice D is correct. The convention being tested is the use of a colon to introduce an explanation. With choice D, the words before the colon form a complete independent clause: “Chemist Rusudan Kiknadze tells students to think of the process as electrochemical.” The independent clause after the colon then explains what “electrochemical” means in this situation by contrasting a patch that gives up electrons with a neighboring patch that accepts them. Choice A is incorrect because it places only a comma between two independent clauses, creating a comma splice. Choice B is incorrect because it places no punctuation between the complete clause ending in “electrochemical” and the following clause beginning with “one patch,” creating a fused sentence. Choice C is incorrect because the words before its colon end with the preposition “as” and therefore do not form a complete clause. It also wrongly separates “as” from its complement, “electrochemical.” Thus, only choice D creates a complete sentence and accurately signals the explanation that follows.''',
    (2, 18): '''Choice B is correct. The convention being tested is the use of verb tense to show the order of past events. The excavation began in 1968, continued for three seasons, and reached a point when the last trench was opened. The erosion had already removed nearly a third of the mound by that past reference point. The past perfect construction “had carried” clearly places the carrying away before the opening of the last trench. Choice A is incorrect because the present-tense verb “carries” conflicts with the passage's established past-time setting and does not show that the erosion occurred earlier. Choice C is incorrect because “will carry” refers to a future action, even though the passage describes completed events in the past. Choice D is likewise incorrect because the future perfect “will have carried” locates the completed action before a future reference point, not before the past opening of the trench. Therefore, the past perfect in choice B precisely expresses the intended sequence of events.''',
    (2, 19): '''Choice A is correct. The convention being tested is whether a relative clause is restrictive or nonrestrictive. The passage says that four dancers have performed the solo and that their performances differ. The phrase “the dancer” by itself therefore does not identify which of those four dancers the next sentence describes. The relative clause “who first performed it” is essential because it selects one dancer from that larger group. An essential, or restrictive, clause is not set off with commas, as in choice A. Choice B is incorrect because its pair of commas presents the clause as nonessential, even though removing the clause would leave “the dancer” without a clear referent. Choice C is also incorrect because it introduces the clause with a comma but supplies no matching closing comma. Choice D is incorrect because it adds a comma only after the restrictive clause; that comma needlessly separates the complete subject from its verb, “is.” Thus, choice A alone clearly and grammatically identifies the intended dancer.''',
    (2, 20): '''Choice B is correct. The convention being tested is the formation of singular possessive and plural nouns. The passage describes one glacier, the Sanduvik Glacier, so the noun modifying “crevasses” must be the singular possessive “glacier's.” The sentence also refers to multiple fractures that “run deepest and widest,” so the head noun must be the ordinary plural “crevasses,” with no apostrophe. Choice A is incorrect because “glaciers” is plural rather than singular possessive, and “crevasse's” is singular possessive rather than plural. Choice C is incorrect because “glaciers'” is a plural possessive, which would indicate that the crevasses belong to more than one glacier; the passage identifies only one. Choice D begins correctly with “glacier's” but incorrectly makes “crevasse's” possessive and singular. That form cannot serve as the plural subject of the verb “run.” Choice B is therefore the only option that shows both the ownership relationship and the required number correctly: one glacier has multiple crevasses.''',
    (2, 21): '''Choice C is correct. The convention being tested is subject-verb agreement in an inverted sentence. The opening prepositional phrase, “Among the additions engineer Wiktoria Zaremba made to the arm and its two rubber-tipped fingers,” comes before the verb, but its plural noun “additions” is not the grammatical subject. The true subject appears after the blank: “a strain gauge.” Because that subject is singular, the singular verb “was” correctly completes the sentence. The past tense also fits the earlier verb “made,” which locates Zaremba's modifications in the past. Choice A is incorrect because “were” is plural and does not agree with the singular subject “a strain gauge.” Choice B is incorrect because “have been” is also plural; its present-perfect tense is additionally unnecessary in this past-tense context. Choice D is incorrect because “are” is plural and present tense. Reordering the sentence as “A strain gauge was among the additions” makes the agreement especially clear. Thus, only choice C agrees with the actual subject.''',
    (2, 22): '''Choice A is correct. The convention being tested is punctuation at the boundary between a main clause and a supplementary noun phrase. The words “The promenade now carries twice the foot traffic it did in 2016” form a complete independent clause. The phrase “a change the planners credit to the shade overhead” then renames and comments on the increase just described, so a comma appropriately sets off that supplementary information. No comma belongs between the preposition “in” and its object, “2016.” Choice B is incorrect because it wrongly places a comma after “in,” separating the preposition from its object. Choice C makes the same error and also fails to place the needed comma after “2016” to mark the start of the supplementary phrase. Choice D keeps “in 2016” intact but provides no punctuation between the completed clause and “a change,” causing the elements to run together. Choice A therefore preserves the prepositional phrase and clearly signals the explanatory noun phrase that follows.''',
}
for (m, q), explanation in CONCISE_CONVENTIONS.items():
    set_field(m, q, 'explanation', explanation)

# ------------------------------------------------------ FORM-WIDE TYPOGRAPHY ----
# House style (practiceTest4RW.json): curly apostrophes, closed-up em dashes.
# Boundaries/Form items are exempt from the dash rule: their option strings ARE the
# punctuation under test and must keep the spacing the item presents.
DASH_EXEMPT = {'boundaries', 'form-structure-sense'}
typo_n = 0
for x in index.values():
    if x['subcategory'] in DASH_EXEMPT:
        continue
    for field in ('passage', 'text', 'explanation'):
        s2 = re.sub(r'(?<=\S)\s+\u2014\s+(?=\S)', '\u2014', x[field])
        if s2 != x[field]:
            x[field] = s2
            typo_n += 1
    for i, o in enumerate(x['options']):
        o2 = re.sub(r'(?<=\S)\s+\u2014\s+(?=\S)', '\u2014', o)
        if o2 != o:
            x['options'][i] = o2
            typo_n += 1

for f, arr in parts.items():
    with open(f, 'w', encoding='utf-8') as fh:
        json.dump(arr, fh, ensure_ascii=False, indent=1)
        fh.write('\n')

print('applied %d targeted edits, %d typographic normalizations' % (len(applied), typo_n))
for a in applied:
    print('  +', a)
if skipped:
    print('skipped:')
    for s in skipped:
        print('  -', s)
