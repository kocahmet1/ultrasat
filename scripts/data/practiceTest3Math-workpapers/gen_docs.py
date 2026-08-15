"""Render the three human-facing markdown docs from practiceTest3Math.json.

Output format is byte-for-byte the same shape as practice-test-5/*.md so the
review workflow the team already uses keeps working.
"""
import json
import re
import sys

SUP = {'0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
       '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
       'n': 'ⁿ', 'x': 'ˣ', 't': 'ᵗ', '-': '⁻', '+': '⁺'}


def sup(m):
    body = m.group(1)
    if all(c in SUP for c in body):
        return ''.join(SUP[c] for c in body)
    return '^' + body


def to_text(html):
    """Plain-text rendering of a passage that carries no table."""
    s = re.sub(r'<sup>(.*?)</sup>', sup, html)
    s = re.sub(r'<br\s*/?>', '\n', s)
    s = re.sub(r'</(p|div)>', '\n', s)
    s = re.sub(r'<[^>]+>', '', s)
    s = s.replace('&nbsp;', ' ').replace('&amp;', '&').replace('&lt;', '<').replace('&gt;', '>')
    lines = [ln.strip() for ln in s.split('\n')]
    return '\n\n'.join(ln for ln in lines if ln)


def render_module(mod, test_no, mod_index):
    head = (f'# SAT Practice Test {test_no} — Math Module {mod_index} '
            f'(moduleNumber {mod["moduleNumber"]})\n\n'
            f'_{len(mod["questions"])} questions · 35 minutes · calculator allowed_\n\n\n---\n\n')
    chunks = []
    for q in mod['questions']:
        blocks = [f'### Question {q["originalQuestionNumber"]}  \n'
                  f'*{q["difficulty"]} · {q["subcategory"]}*']
        if q.get('graphAsset'):
            blocks.append(f'> **[Figure: {q["graphAsset"]}]** {q["graphDescription"]}')
        if q.get('passage'):
            p = q['passage']
            body = p if '<table' in p.lower() else to_text(p)
            blocks.append('\n' + body + '\n')
        blocks.append(to_text(q['text']))
        if q['questionType'] == 'user-input':
            blocks.append('_Student-produced response_')
        else:
            blocks.append('\n\n'.join(f'{"ABCD"[i]}) {o}' for i, o in enumerate(q['options'])))
        chunks.append('\n\n\n'.join(blocks))
    return head + '\n\n\n\n---\n\n'.join(chunks) + '\n'


def render_key(data, test_no):
    out = [f'# SAT Practice Test {test_no} — Math: Answer Key and Rationales\n']
    for i, mod in enumerate(data['modules'], start=1):
        out.append(f'\n\n## Module {i} (moduleNumber {mod["moduleNumber"]})\n')
        for q in mod['questions']:
            n = q['originalQuestionNumber']
            if q['questionType'] == 'user-input':
                acc = ', '.join(q['acceptedAnswers'])
                head = (f'**Q{n}.** `{q["correctAnswer"]}`  ({q["difficulty"]}, '
                        f'{q["subcategory"]}, accepts: {acc})')
            else:
                head = (f'**Q{n}.** `{"ABCD"[q["correctAnswer"]]}`  ({q["difficulty"]}, '
                        f'{q["subcategory"]})')
            out.append(f'\n{head}\n\n{to_text(q["explanation"])}\n')
    return '\n'.join(out) + '\n'


if __name__ == '__main__':
    src, outdir, test_no = sys.argv[1], sys.argv[2], sys.argv[3]
    data = json.load(open(src, encoding='utf-8'))
    for i, mod in enumerate(data['modules'], start=1):
        p = f'{outdir}/SAT-Practice-Test-{test_no}-Math-Module-{i}.md'
        open(p, 'w', encoding='utf-8').write(render_module(mod, test_no, i))
        print('wrote', p)
    p = f'{outdir}/SAT-Practice-Test-{test_no}-Math-Answer-Key-and-Rationales.md'
    open(p, 'w', encoding='utf-8').write(render_key(data, test_no))
    print('wrote', p)
