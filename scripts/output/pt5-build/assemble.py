#!/usr/bin/env python3
"""Assemble the eight authored part_*.json files into scripts/data/practiceTest5RW.json."""
import json, glob, os, sys, re

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.abspath(os.path.join(HERE, '..', '..', 'data', 'practiceTest5RW.json'))

items = {}
for f in sorted(glob.glob(os.path.join(HERE, 'part_*.json'))):
    for x in json.load(open(f, encoding='utf-8')):
        key = (x['module'], x['q'])
        if key in items:
            sys.exit('duplicate slot %s in %s' % (key, f))
        items[key] = x

missing = [(m, q) for m in (1, 2) for q in range(1, 28) if (m, q) not in items]
if missing:
    sys.exit('missing slots: %s' % missing)

# Curly-quote normalization so the form reads uniformly (matches PT3/PT4 typography).
def typo(s):
    if not isinstance(s, str):
        return s
    s = re.sub(r"(?<=[A-Za-z])'(?=[A-Za-z])", '’', s)          # don't -> don’t
    s = re.sub(r"(?<=[A-Za-z])'(?=\s|$|[.,;:!?)])", '’', s)     # writers' -> writers’
    s = re.sub(r'"([^"]*)"', '“\\1”', s)                   # "x" -> “x”
    return s

SKIP_TYPO_TAGS = re.compile(r'<[^>]+>')

def typo_passage(s):
    """Apply typographic normalization only outside HTML/SVG tags."""
    out, last = [], 0
    for m in SKIP_TYPO_TAGS.finditer(s):
        out.append(typo(s[last:m.start()]))
        out.append(m.group(0))
        last = m.end()
    out.append(typo(s[last:]))
    return ''.join(out)

modules = []
for m in (1, 2):
    qs = []
    for q in range(1, 28):
        x = items[(m, q)]
        qs.append({
            'originalQuestionNumber': q,
            'passage': typo_passage(x['passage']),
            'text': typo(x['text']),
            'questionType': 'multiple-choice',
            'options': [typo(o) for o in x['options']],
            'correctAnswer': x['correctAnswer'],
            'acceptedAnswers': None,
            'difficulty': x['difficulty'],
            'subcategory': x['subcategory'],
            'subcategoryId': x['subcategoryId'],
            'explanation': typo(x['explanation']),
        })
    modules.append({
        'moduleNumber': m,
        'title': 'Exam 5, Module %d' % m,
        'description': 'Practice Test 5 - Reading and Writing, Module %d (27 questions)' % m,
        'section': 'Reading and Writing',
        'calculatorAllowed': False,
        'timeLimit': 1920,
        'questions': qs,
    })

data = {
    'examSlug': 'exam5-rw-v1',
    'targetExamTitle': 'Exam 5',
    'note': 'Reading & Writing replacement modules for Exam 5 (Practice Test 5), authored to the '
            'measured College Board style spec (scripts/output/pt5-build/STYLE_SPEC.md).',
    'modules': modules,
}

with open(OUT, 'w', encoding='utf-8') as fh:
    json.dump(data, fh, ensure_ascii=False, indent=1)
    fh.write('\n')
print('wrote', OUT, os.path.getsize(OUT), 'bytes')
