"""Assemble the six repaired bands into scripts/data/practiceTest3Math.json."""
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
WORK = HERE + '/work'

BANDS = {3: ['final_3_1.json', 'final_3_9.json', 'final_3_16.json'],
         4: ['final_4_1.json', 'final_4_9.json', 'final_4_16.json']}

KEEP = ['originalQuestionNumber', 'passage', 'text', 'questionType', 'options', 'correctAnswer',
        'acceptedAnswers', 'difficulty', 'subcategory', 'subcategoryId', 'explanation',
        'graphAsset', 'graphDescription']

TITLES = {3: ('Exam 3, Module 3', 'Practice Test 3 - Math, Module 1 (22 questions)'),
          4: ('Exam 3, Module 4', 'Practice Test 3 - Math, Module 2 (22 questions)')}

out = {
    'examSlug': 'exam3-math-v1',
    'targetExamTitle': 'Exam 3',
    'note': ('Math replacement modules for Exam 3 (Practice Test 3), authored to the measured College Board '
             'style spec (docs/CB_Math_Style_Spec.md), its measured addendum '
             '(docs/analysis/CB_Math_C_texture_addendum.md) and the PT3 blueprint '
             '(docs/analysis/PT3_math_blueprint.md). Figures live in practiceTest3Math-assets/ and are '
             'inlined as base64 data URIs by replaceExam3Math.js.'),
    'modules': [],
}

for mod in (3, 4):
    items = []
    for f in BANDS[mod]:
        with open(f'{WORK}/{f}', encoding='utf-8') as fh:
            items.extend(json.load(fh))
    items.sort(key=lambda q: q['originalQuestionNumber'])
    assert [q['originalQuestionNumber'] for q in items] == list(range(1, 23)), mod
    clean = []
    for q in items:
        c = {k: q.get(k) for k in KEEP}
        if c['questionType'] == 'multiple-choice':
            c['acceptedAnswers'] = None
        else:
            c['options'] = []
        clean.append(c)
    title, desc = TITLES[mod]
    out['modules'].append({
        'moduleNumber': mod, 'title': title, 'description': desc,
        'section': 'Math', 'calculatorAllowed': True, 'timeLimit': 2100,
        'questions': clean,
    })

with open(f'{HERE}/practiceTest3Math.json', 'w', encoding='utf-8') as fh:
    json.dump(out, fh, ensure_ascii=False, indent=1)
print('wrote practiceTest3Math.json',
      sum(len(m['questions']) for m in out['modules']), 'questions')
