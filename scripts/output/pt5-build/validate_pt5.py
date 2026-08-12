#!/usr/bin/env python3
"""
Fast Python mirror of scripts/validatePracticeTest5RW.js — same rules, no jsdom dependency.
Used for the authoring fix cycle; the Node validator remains the publication gate.

Usage: python3 scripts/output/pt5-build/validate_pt5.py [--strict]
"""
import json, os, re, sys, collections

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.abspath(os.path.join(HERE, '..', '..', 'data', 'practiceTest5RW.json'))

RW = 'Reading and Writing'
LETTERS = ['A', 'B', 'C', 'D']
errors, warnings = [], []

CANON_ID = {
    'central-ideas-details': 1, 'inferences': 2, 'command-of-evidence': 3,
    'words-in-context': 4, 'text-structure-purpose': 5, 'cross-text-connections': 6,
    'rhetorical-synthesis': 7, 'transitions': 8, 'boundaries': 9, 'form-structure-sense': 10,
}
MIN_STIMULUS_WORDS = {
    'words-in-context': 50, 'text-structure-purpose': 75, 'cross-text-connections': 100,
    'central-ideas-details': 70, 'command-of-evidence': 65, 'inferences': 65,
    'boundaries': 35, 'form-structure-sense': 35, 'transitions': 45, 'rhetorical-synthesis': 70,
}
LENGTH_CUE_EXEMPT = {'words-in-context', 'boundaries', 'form-structure-sense', 'transitions'}
MODULE_BLUEPRINTS = {
    1: {'words-in-context': 4, 'text-structure-purpose': 2, 'cross-text-connections': 1,
        'central-ideas-details': 2, 'command-of-evidence': 4, 'inferences': 1,
        'boundaries': 4, 'form-structure-sense': 3, 'transitions': 3, 'rhetorical-synthesis': 3},
    2: {'words-in-context': 4, 'text-structure-purpose': 2, 'cross-text-connections': 1,
        'central-ideas-details': 2, 'command-of-evidence': 4, 'inferences': 1,
        'boundaries': 4, 'form-structure-sense': 4, 'transitions': 3, 'rhetorical-synthesis': 2},
}
DOMAIN_BY_SKILL = {
    'words-in-context': 'Craft and Structure', 'text-structure-purpose': 'Craft and Structure',
    'cross-text-connections': 'Craft and Structure', 'central-ideas-details': 'Information and Ideas',
    'command-of-evidence': 'Information and Ideas', 'inferences': 'Information and Ideas',
    'boundaries': 'Standard English Conventions', 'form-structure-sense': 'Standard English Conventions',
    'transitions': 'Expression of Ideas', 'rhetorical-synthesis': 'Expression of Ideas',
}
AGGREGATE_DOMAIN_TARGETS = {
    'Information and Ideas': (14, 12, 14), 'Craft and Structure': (14, 13, 15),
    'Expression of Ideas': (11, 8, 12), 'Standard English Conventions': (15, 11, 15),
}
DOMAIN_RANK = {'words-in-context': 1, 'text-structure-purpose': 1, 'cross-text-connections': 1,
               'central-ideas-details': 2, 'command-of-evidence': 2, 'inferences': 2,
               'boundaries': 3, 'form-structure-sense': 3,
               'transitions': 4, 'rhetorical-synthesis': 4}
SKILL_RANK_WITHIN_DOMAIN = {'words-in-context': 1, 'text-structure-purpose': 2, 'cross-text-connections': 3,
                            'central-ideas-details': 1, 'command-of-evidence': 2, 'inferences': 3,
                            'transitions': 1, 'rhetorical-synthesis': 2}
DIFFICULTY_RANK = {'easy': 1, 'medium': 2, 'hard': 3}
BLANK_REQUIRED_SKILLS = {'words-in-context', 'inferences', 'boundaries', 'form-structure-sense', 'transitions'}

TRANSITION_RELATION_BY_TEXT = {
    'accordingly': 'cause-result', 'as a result': 'cause-result', 'consequently': 'cause-result',
    'hence': 'cause-result', 'therefore': 'cause-result', 'thus': 'cause-result',
    'for example': 'example', 'for instance': 'example', 'specifically': 'example',
    'taken together': 'synthesis', 'collectively': 'synthesis', 'in sum': 'synthesis', 'overall': 'synthesis',
    'however': 'contrast-concession', 'nevertheless': 'contrast-concession', 'nonetheless': 'contrast-concession',
    'even so': 'contrast-concession', 'by contrast': 'contrast-concession', 'in contrast': 'contrast-concession',
    'conversely': 'contrast-concession',
    'in addition': 'addition', 'furthermore': 'addition', 'moreover': 'addition',
    'similarly': 'similarity', 'likewise': 'similarity',
    'in other words': 'restatement', 'that is': 'restatement',
    'instead': 'replacement', 'meanwhile': 'temporal', 'subsequently': 'temporal',
    'in fact': 'correction-emphasis', 'indeed': 'correction-emphasis',
}
EXPECTED_TRANSITION_RELATIONSHIPS = {
    '1:22': 'example', '1:23': 'contrast-concession', '1:24': 'cause-result',
    '2:23': 'addition', '2:24': 'similarity', '2:25': 'restatement',
}

WORD_RE = re.compile(r"[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*")
STOPWORDS = set("""about after again also because before being between both could does from have into more most
only other over same such than that their there these they this those through under very were what when where
which while with would your the and for but not are was its has had""".split())


def visible(v):
    s = re.sub(r'<[^>]+>', ' ', str(v or ''))
    s = re.sub(r'\[/?UNDERLINED\]', ' ', s)
    s = re.sub(r'&[a-z]+;', ' ', s, flags=re.I)
    return re.sub(r'\s+', ' ', s).strip()


def wordcount(v):
    return len(WORD_RE.findall(visible(v)))


def stimulus_wordcount(v):
    s = re.sub(r'<table\b.*?</table>', ' ', str(v or ''), flags=re.I | re.S)
    s = re.sub(r'<svg\b.*?</svg>', ' ', s, flags=re.I | re.S)
    return wordcount(s)


def normalize_text(v):
    s = visible(v).lower()
    s = s.replace('while researching a topic, a student has taken the following notes:', ' ')
    s = re.sub(r'[^a-z0-9]+', ' ', s)
    return re.sub(r'\s+', ' ', s).strip()


def token_set(v):
    return {t for t in normalize_text(v).split(' ') if len(t) > 2 and t not in STOPWORDS}


def jaccard(a, b):
    if not a or not b:
        return 0.0
    inter = len(a & b)
    return inter / (len(a) + len(b) - inter)


data = json.load(open(DATA, encoding='utf-8'))
modules = data.get('modules') or []
if len(modules) != 2:
    errors.append('expected 2 modules, got %d' % len(modules))

aggregate = collections.Counter()
all_items = []
graphic_types = collections.Counter()
graphic_items = 0
transition_owner = {}
relationships_seen, relationship_items_seen = set(), set()
form_cue = {'eligible': 0, 'word': 0, 'char': 0}

for mod in modules:
    tag0 = 'M%s' % mod.get('moduleNumber')
    if mod.get('section') != RW:
        errors.append('%s: section must be "%s"' % (tag0, RW))
    if mod.get('timeLimit') != 1920:
        errors.append('%s: timeLimit must be 1920' % tag0)
    if mod.get('calculatorAllowed') is not False:
        errors.append('%s: calculatorAllowed must be false' % tag0)
    questions = mod.get('questions') or []
    if len(questions) != 27:
        errors.append('%s: expected 27 questions, got %d' % (tag0, len(questions)))

    answer_letters, diff_count, skill_count = [], collections.Counter(), collections.Counter()
    last_rank, last_conv_diff = 0, 0
    last_skill_rank, last_diff_by_skill = {}, {}
    passages_seen = set()
    mod_cue = {'eligible': 0, 'word': 0, 'char': 0}

    for i, qq in enumerate(questions):
        n = qq.get('originalQuestionNumber')
        tag = '%s Q%s' % (tag0, n)
        if n != i + 1:
            errors.append('%s: originalQuestionNumber out of sequence (index %d)' % (tag, i))
        if not (qq.get('text') or '').strip():
            errors.append('%s: empty text' % tag)
        expl = qq.get('explanation') or ''
        if len(expl) < 120:
            errors.append('%s: explanation missing/too short' % tag)
        if qq.get('difficulty') not in ('easy', 'medium', 'hard'):
            errors.append('%s: bad difficulty' % tag)
        diff_count[qq.get('difficulty')] += 1
        skill = qq.get('subcategory')
        skill_count[skill] += 1
        domain = DOMAIN_BY_SKILL.get(skill)
        if domain:
            aggregate[domain] += 1
        if skill not in CANON_ID:
            errors.append('%s: subcategory "%s" does not resolve' % (tag, skill))
        elif CANON_ID[skill] != qq.get('subcategoryId'):
            errors.append('%s: subcategoryId %s != canonical %s' % (tag, qq.get('subcategoryId'), CANON_ID[skill]))

        rank = DOMAIN_RANK.get(skill, 0)
        if rank < last_rank:
            errors.append('%s: domain out of official order (%s after rank %d)' % (tag, skill, last_rank))
        last_rank = max(last_rank, rank)

        drank = DIFFICULTY_RANK.get(qq.get('difficulty'), 0)
        if domain == 'Standard English Conventions':
            if drank < last_conv_diff:
                errors.append('%s: Conventions difficulty drops from %d to %d' % (tag, last_conv_diff, drank))
            last_conv_diff = max(last_conv_diff, drank)
        elif domain:
            srank = SKILL_RANK_WITHIN_DOMAIN.get(skill, 0)
            prior = last_skill_rank.get(domain, 0)
            if srank < prior:
                errors.append('%s: %s skill is out of official grouping order' % (tag, domain))
            last_skill_rank[domain] = max(prior, srank)
            k = '%s:%s' % (domain, skill)
            pd = last_diff_by_skill.get(k, 0)
            if drank < pd:
                errors.append('%s: %s difficulty drops from %d to %d' % (tag, skill, pd, drank))
            last_diff_by_skill[k] = max(pd, drank)

        if qq.get('questionType') != 'multiple-choice':
            errors.append('%s: R&W questions must be multiple-choice' % tag)
        opts = qq.get('options')
        if not isinstance(opts, list) or len(opts) != 4:
            errors.append('%s: must have exactly 4 options' % tag)
            opts = []
        else:
            seen = set()
            for oi, opt in enumerate(opts):
                if not isinstance(opt, str) or not opt.strip():
                    errors.append('%s: option %s empty' % (tag, LETTERS[oi]))
                    continue
                if re.match(r'^[A-D][).]\s', opt):
                    errors.append('%s: option %s has a letter prefix' % (tag, LETTERS[oi]))
                if re.search(r'<[a-z]+', opt, re.I):
                    errors.append('%s: option %s contains HTML' % (tag, LETTERS[oi]))
                key = opt.strip().lower()
                if key in seen:
                    errors.append('%s: duplicate option "%s"' % (tag, opt))
                seen.add(key)
        ca = qq.get('correctAnswer')
        if not isinstance(ca, int) or isinstance(ca, bool) or ca < 0 or ca > 3:
            errors.append('%s: correctAnswer must be 0-3' % tag)
            ca = None
        else:
            answer_letters.append(LETTERS[ca])
        if qq.get('acceptedAnswers') is not None:
            errors.append('%s: acceptedAnswers must be null for MC' % tag)

        passage = qq.get('passage') if isinstance(qq.get('passage'), str) else ''
        if not passage.strip():
            errors.append('%s: missing passage/stimulus' % tag)
        sw = stimulus_wordcount(passage)
        floor = MIN_STIMULUS_WORDS.get(skill, 25)
        if sw < floor:
            errors.append('%s: stimulus has %d words; %s editorial floor is %d' % (tag, sw, skill, floor))
        if sw > 150:
            errors.append('%s: stimulus exceeds 150 words (%d)' % (tag, sw))
        blanks = len(re.findall(r'_{6,}', passage))
        # Mirrors validatePracticeTest5RW.js: Command-of-Evidence items written in the
        # completion form end in a blank. 41 of the 61 quantitative items in the official
        # bank do, as do 16 of the 29 quotation-illustration items, so the blank is
        # required for the former and optional for the latter.
        is_quant_completion = (skill == 'command-of-evidence'
                               and re.search(r'uses data from the (table|graph)', qq.get('text') or '', re.I))
        is_quotation_completion = (skill == 'command-of-evidence'
                                   and re.search(r'Which quotation from', qq.get('text') or '', re.I))
        if skill in BLANK_REQUIRED_SKILLS or is_quant_completion:
            if blanks != 1:
                errors.append('%s: %s passage must contain exactly one blank, got %d' % (tag, skill, blanks))
        elif is_quotation_completion:
            if blanks > 1:
                errors.append('%s: quotation item may contain at most one blank, got %d' % (tag, blanks))
        elif blanks != 0:
            errors.append('%s: unexpected blank in %s passage' % (tag, skill))
        if skill == 'cross-text-connections' and ('Text 1' not in passage or 'Text 2' not in passage):
            errors.append('%s: cross-text item must contain both Text 1 and Text 2' % tag)
        if skill == 'rhetorical-synthesis' and passage.count('•') < 5:
            errors.append('%s: rhetorical-synthesis item needs at least 5 notes, got %d' % (tag, passage.count('•')))
        opens = passage.count('[UNDERLINED]')
        closes = passage.count('[/UNDERLINED]')
        stem = qq.get('text') or ''
        is_underlined_item = (
            (skill == 'text-structure-purpose' and re.search(r'function of the underlined', stem, re.I))
            or (skill == 'cross-text-connections' and re.search(r'underlined (claim|portion|assertion)', stem, re.I))
        )
        if is_underlined_item:
            if opens != 1 or closes != 1 or not re.search(r'\[UNDERLINED\][\s\S]+\[/UNDERLINED\]', passage):
                errors.append('%s: underlined-span item needs exactly one nonempty underlined span' % tag)
        elif opens or closes:
            errors.append('%s: underline markers are only allowed in underlined-span items' % tag)

        pkey = normalize_text(passage)
        if pkey and pkey in passages_seen:
            warnings.append('%s: passage opening duplicates an earlier question' % tag)
        passages_seen.add(pkey)
        all_items.append(dict(module=mod.get('moduleNumber'), q=n, tag=tag, subcategory=skill,
                              pnorm=pkey, ptok=token_set(passage),
                              onorm=[normalize_text(o) for o in opts]))

        has_table = bool(re.search(r'<table\b', passage, re.I))
        has_svg = bool(re.search(r'<svg\b', passage, re.I))
        if has_table and has_svg:
            errors.append('%s: use exactly one quantitative graphic per item' % tag)
        if has_table or has_svg:
            graphic_items += 1
            if skill != 'command-of-evidence':
                errors.append('%s: quantitative graphics must be command-of-evidence items' % tag)
        if has_table:
            graphic_types['table'] += 1
            if not re.search(r'<th\b', passage, re.I) or not re.search(r'<td\b', passage, re.I):
                errors.append('%s: table needs <th> and <td> cells' % tag)
        if has_svg:
            m = re.search(r'<svg\b[^>]*\bdata-graph-type=["\'](bar|line)["\']', passage, re.I)
            if not m:
                errors.append('%s: SVG needs data-graph-type="bar" or "line"' % tag)
            else:
                graphic_types[m.group(1).lower()] += 1
            for pat, msg in ((r'<svg\b[^>]*\bviewBox=["\'][^"\']+["\']', 'viewBox'),
                             (r'<title\b[^>]*>\s*[^<]+\s*</title>', 'nonempty title'),
                             (r'<desc\b[^>]*>\s*[^<]+\s*</desc>', 'nonempty desc'),
                             (r'<svg\b[^>]*\brole=["\']img["\']', 'role="img"')):
                if not re.search(pat, passage, re.I):
                    errors.append('%s: SVG needs a %s' % (tag, msg))
            if re.search(r'<script\b|<style\b|xlink:href|\son\w+=', passage, re.I):
                errors.append('%s: SVG contains markup the sanitizer will strip' % tag)

        if skill == 'transitions' and ca is not None and len(opts) == 4:
            keyed = re.sub(r'[,:;.!?]+$', '', opts[ca].strip().lower()).strip()
            prior = transition_owner.get(keyed)
            if prior:
                errors.append('%s: keyed transition "%s" repeats %s' % (tag, keyed, prior))
            else:
                transition_owner[keyed] = tag
            rk = '%s:%s' % (mod.get('moduleNumber'), n)
            expected = EXPECTED_TRANSITION_RELATIONSHIPS.get(rk)
            actual = TRANSITION_RELATION_BY_TEXT.get(keyed)
            relationship_items_seen.add(rk)
            if not expected:
                errors.append('%s: missing maintained transition-relationship mapping' % tag)
            if not actual:
                errors.append('%s: keyed transition "%s" has no relationship mapping' % (tag, keyed))
            if expected and actual and expected != actual:
                errors.append('%s: keyed transition relationship %s != expected %s' % (tag, actual, expected))
            if actual:
                relationships_seen.add(actual)

        if skill not in LENGTH_CUE_EXEMPT and len(opts) == 4 and ca is not None:
            ow = [wordcount(o) for o in opts]
            oc = [len(visible(o)) for o in opts]
            kw = ow[ca]
            dw = [w for j, w in enumerate(ow) if j != ca]
            if kw >= max(dw) * 1.3 and kw - max(dw) >= 4:
                warnings.append('%s: keyed option is conspicuously longer (%s)' % (tag, '/'.join(map(str, ow))))
            if kw <= min(dw) * 0.7 and min(dw) - kw >= 4:
                warnings.append('%s: keyed option is conspicuously shorter (%s)' % (tag, '/'.join(map(str, ow))))
            mod_cue['eligible'] += 1
            form_cue['eligible'] += 1
            if kw == max(ow) and ow.count(max(ow)) == 1:
                mod_cue['word'] += 1
                form_cue['word'] += 1
            if oc[ca] == max(oc) and oc.count(max(oc)) == 1:
                mod_cue['char'] += 1
                form_cue['char'] += 1

        if ca is not None and not re.match(r'^\s*Choice %s\b' % LETTERS[ca], expl):
            errors.append('%s: explanation must begin by naming keyed Choice %s' % (tag, LETTERS[ca]))

    bp = MODULE_BLUEPRINTS.get(mod.get('moduleNumber'), {})
    for sk, want in bp.items():
        got = skill_count.get(sk, 0)
        if got != want:
            errors.append('%s: skill "%s" count %d != authored design %d' % (tag0, sk, got, want))

    seq = ''.join(answer_letters)
    dist = collections.Counter(answer_letters)
    if re.search(r'AAA|BBB|CCC|DDD', seq):
        warnings.append('%s: 3+ identical answer letters in a row (%s)' % (tag0, seq))
    shares = sorted(dist.get(l, 0) for l in LETTERS)
    if shares != [6, 7, 7, 7]:
        errors.append('%s: answer positions must be balanced 6/7/7/7, got %s' % (tag0, dict(dist)))

    if mod_cue['eligible'] and mod_cue['word'] / mod_cue['eligible'] > 0.5:
        warnings.append('%s: keyed option uniquely longest by words in %d/%d items' % (tag0, mod_cue['word'], mod_cue['eligible']))
    if mod_cue['eligible'] and mod_cue['char'] / mod_cue['eligible'] > 0.65:
        warnings.append('%s: keyed option uniquely longest by characters in %d/%d items' % (tag0, mod_cue['char'], mod_cue['eligible']))

    print('\nModule %s: %d q | difficulty %s' % (mod.get('moduleNumber'), len(questions), dict(diff_count)))
    print('  answer positions %s  seq %s' % (dict(dist), seq))
    print('  skills %s' % dict(skill_count))
    print('  keyed unique-longest: words %d/%d, characters %d/%d' % (mod_cue['word'], mod_cue['eligible'], mod_cue['char'], mod_cue['eligible']))

for domain, (target, lo, hi) in AGGREGATE_DOMAIN_TARGETS.items():
    got = aggregate.get(domain, 0)
    if got < lo or got > hi:
        errors.append('form: %s count %d outside official operational range %d-%d' % (domain, got, lo, hi))
    if got != target:
        errors.append('form: %s count %d != authored target %d' % (domain, got, target))

for t in ('table', 'bar', 'line'):
    if not graphic_types.get(t):
        errors.append('form: quantitative graphics must include at least one %s' % t)
if graphic_items < 3:
    errors.append('form: expected at least 3 quantitative graphic items, got %d' % graphic_items)

for k in EXPECTED_TRANSITION_RELATIONSHIPS:
    if k not in relationship_items_seen:
        errors.append('form: transition relationship map entry %s has no matching item' % k)
if len(relationships_seen) < 3:
    errors.append('form: transitions must cover at least 3 relationship categories, got %s' % ', '.join(relationships_seen))

option_overlap_exempt = {'boundaries', 'form-structure-sense', 'transitions'}
for i in range(len(all_items)):
    for j in range(i + 1, len(all_items)):
        a, b = all_items[i], all_items[j]
        if a['module'] == b['module'] or a['subcategory'] != b['subcategory']:
            continue
        if a['pnorm'] and a['pnorm'] == b['pnorm']:
            errors.append('%s/%s: normalized passages are identical' % (a['tag'], b['tag']))
            continue
        sim = jaccard(a['ptok'], b['ptok'])
        if sim >= 0.52:
            warnings.append('%s/%s: passages may be near-duplicates (token Jaccard %.2f)' % (a['tag'], b['tag'], sim))
        if a['subcategory'] not in option_overlap_exempt:
            shared = {o for o in a['onorm'] if o and o in b['onorm']}
            if len(shared) >= 2:
                warnings.append('%s/%s: share %d normalized options' % (a['tag'], b['tag'], len(shared)))

if form_cue['eligible'] and form_cue['word'] / form_cue['eligible'] > 0.5:
    warnings.append('form: keyed option uniquely longest by words in %d/%d items' % (form_cue['word'], form_cue['eligible']))
if form_cue['eligible'] and form_cue['char'] / form_cue['eligible'] > 0.65:
    warnings.append('form: keyed option uniquely longest by characters in %d/%d items' % (form_cue['char'], form_cue['eligible']))

print('\nAggregate domains %s' % dict(aggregate))
print('Graphics %s across %d items' % (dict(graphic_types), graphic_items))
print('Transition relationships %s' % sorted(relationships_seen))
print('Form keyed unique-longest: words %d/%d, characters %d/%d' % (form_cue['word'], form_cue['eligible'], form_cue['char'], form_cue['eligible']))

print('\n' + '=' * 52)
print('Errors: %d' % len(errors))
for e in errors:
    print('  ERROR: ' + e)
print('Warnings: %d' % len(warnings))
for w in warnings:
    print('  WARN: ' + w)
strict = '--strict' in sys.argv
sys.exit(1 if errors or (strict and warnings) else 0)
