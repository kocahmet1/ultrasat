#!/usr/bin/env python3
"""
Apply the review findings from the two hostile item reviews (Module 1 and Module 2)
to the authored part_*.json files. Idempotent: each replacement is asserted present
before it is applied, and the script reports every change it makes.

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
    pat = re.compile(_flex(old))
    if not pat.search(tgt):
        if re.search(_flex(new), tgt):
            skipped.append(label + ' (already applied)')
            return
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
    opt_i=3)
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
    'Sulev uses that walk to convey Ilona’s discovery that the village has gone on changing in ways that leave her a stranger in it.')
sub(1, 13, 'explanation',
    'The claim is that Sulev conveys Ilona’s discovery that Halvern has gone on changing in ways that take no account of her, so the quotation must do two things at once: register a change in the village and show that the change has proceeded without reference to Ilona herself.',
    'The claim is that Sulev conveys Ilona’s discovery that Halvern has gone on changing in ways that leave her a stranger in it, so the quotation must do two things at once: register a change in the village and show Ilona being treated as a stranger there.')
sub(1, 13, 'explanation',
    'but the quotation supplies no scene, no altered thing, and no moment in which the village fails to acknowledge her.',
    'but the quotation supplies no scene, no altered thing, and no moment in which anyone in Halvern treats her as a stranger.')
sub(1, 13, 'explanation',
    'rather than any change in the actual village or any indifference on the village’s part.',
    'rather than any change in the actual village or any moment in which she is taken for a stranger.')

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
    json.dump(arr, open(f, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

print('applied %d targeted edits, %d typographic normalizations' % (len(applied), typo_n))
for a in applied:
    print('  +', a)
if skipped:
    print('skipped:')
    for s in skipped:
        print('  -', s)
