#!/usr/bin/env python3
"""Convert the Practice Test 7 R&W markdown deliverables into
scripts/data/practiceTest7RW.json matching the ultrasat site schema
(established by practiceTest8RW.json / practiceTest10RW.json)."""

import json, re, sys

ROOT = "/sessions/great-charming-tesla/mnt/ultrasat"
PT7 = f"{ROOT}/practice-test-7"

M1 = open(f"{PT7}/SAT-Practice-Test-7-Reading-and-Writing-Module-1.md", encoding="utf-8").read()
M2 = open(f"{PT7}/SAT-Practice-Test-7-Reading-and-Writing-Module-2.md", encoding="utf-8").read()
KEY = open(f"{PT7}/SAT-Practice-Test-7-Answer-Key-and-Rationales.md", encoding="utf-8").read()

SKILL_MAP = {
    "Words in Context": ("words-in-context", 4),
    "Text Structure and Purpose": ("text-structure-purpose", 5),
    "Cross-Text Connections": ("cross-text-connections", 6),
    "Central Ideas and Details": ("central-ideas-details", 1),
    "Command of Evidence (textual)": ("command-of-evidence", 3),
    "Command of Evidence (quantitative)": ("command-of-evidence", 3),
    "Inferences": ("inferences", 2),
    "Boundaries": ("boundaries", 9),
    "Form, Structure, and Sense": ("form-structure-sense", 10),
    "Transitions": ("transitions", 8),
    "Rhetorical Synthesis": ("rhetorical-synthesis", 7),
}

# ---------------- answer key tables ----------------
def parse_key(md):
    out = {}
    secs = re.split(r"### Module (\d)\n", md)
    for i in range(1, len(secs), 2):
        mod = int(secs[i]); body = secs[i + 1]
        for row in re.findall(r"^\| (\d+) \| ([A-D]) \| ([^|]+) \| ([^|]+) \|", body, re.M):
            q, ans, skill, diff = int(row[0]), row[1], row[2].strip(), row[3].strip()
            out[(mod, q)] = {"ans": ans, "skill": skill, "diff": diff.lower()}
    return out

KEYTAB = parse_key(KEY.split("# MODULE 1 RATIONALES")[0])
assert len(KEYTAB) == 54, f"key rows: {len(KEYTAB)}"

# ---------------- rationales ----------------
def parse_rats(md):
    out = {}
    m1_part = md.split("# MODULE 1 RATIONALES")[1].split("# MODULE 2 RATIONALES")[0]
    m2_part = md.split("# MODULE 2 RATIONALES")[1].split("# BLUEPRINT AUDIT")[0]
    for mod, part in ((1, m1_part), (2, m2_part)):
        blocks = re.split(r"### Question (\d+) — [A-D]\n", part)
        for i in range(1, len(blocks), 2):
            q = int(blocks[i]); body = blocks[i + 1].strip()
            body = re.sub(r"\*\*(.+?)\*\*", r"\1", body)          # bold
            body = re.sub(r"(?<![\w*])\*([^*\n]+)\*(?![\w*])", r"\1", body)  # italics
            body = re.sub(r"\n{2,}", "\n", body).strip()
            out[(mod, q)] = body
    return out

RATS = parse_rats(KEY)
assert len(RATS) == 54, f"rationale blocks: {len(RATS)}"

# ---------------- SVG builders ----------------
def esc(s): return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;")

def clustered_bar_svg(qid, title, desc, cats, s1_name, s2_name, s1, s2, ymax, ytick, yfmt, ylabel, xlabel):
    # geometry
    W, H = 640, 430
    L, R, T, B = 84, 20, 46, 96
    plot_w, plot_h = W - L - R, H - T - B
    y0 = T + plot_h
    def y(v): return round(y0 - (v / ymax) * plot_h, 1)
    n = len(cats)
    group_w = plot_w / n
    bar_w = min(34, group_w * 0.28)
    gap = 6
    p = []
    p.append(f'<svg viewBox="0 0 {W} {H}" role="img" xmlns="http://www.w3.org/2000/svg" aria-labelledby="{qid}title {qid}desc" data-graph-type="bar">')
    p.append(f'<title id="{qid}title">{esc(title)}</title>')
    p.append(f'<desc id="{qid}desc">{esc(desc)}</desc>')
    p.append(f'<text x="{W//2}" y="24" font-family="sans-serif" font-size="15" font-weight="bold" text-anchor="middle">{esc(title)}</text>')
    # axes
    p.append(f'<line x1="{L}" y1="{T}" x2="{L}" y2="{y0}" stroke="#222" stroke-width="2"/>')
    p.append(f'<line x1="{L}" y1="{y0}" x2="{W-R}" y2="{y0}" stroke="#222" stroke-width="2"/>')
    v = 0
    while v <= ymax + 1e-9:
        yy = y(v)
        p.append(f'<line x1="{L-6}" y1="{yy}" x2="{L}" y2="{yy}" stroke="#222" stroke-width="2"/>')
        p.append(f'<text x="{L-10}" y="{yy+4}" font-family="sans-serif" font-size="12" text-anchor="end">{yfmt(v)}</text>')
        v += ytick
    # y-axis label
    p.append(f'<text x="20" y="{T + plot_h/2}" font-family="sans-serif" font-size="12" text-anchor="middle" transform="rotate(-90 20 {T + plot_h/2})">{esc(ylabel)}</text>')
    for i, cat in enumerate(cats):
        cx = L + group_w * i + group_w / 2
        x1 = cx - bar_w - gap / 2
        x2 = cx + gap / 2
        for xx, val, fill in ((x1, s1[i], "#4a6fa5"), (x2, s2[i], "#c8a24a")):
            yy = y(val)
            p.append(f'<rect x="{round(xx,1)}" y="{yy}" width="{bar_w}" height="{round(y0-yy,1)}" fill="{fill}" stroke="#222" stroke-width="1"/>')
            p.append(f'<text x="{round(xx+bar_w/2,1)}" y="{yy-5}" font-family="sans-serif" font-size="11" text-anchor="middle">{yfmt(val)}</text>')
        # category label (wrap on space if long)
        words = cat.split()
        if len(cat) > 12 and len(words) > 1:
            mid = len(words) // 2
            p.append(f'<text x="{cx}" y="{y0+18}" font-family="sans-serif" font-size="12" text-anchor="middle">{esc(" ".join(words[:mid]))}</text>')
            p.append(f'<text x="{cx}" y="{y0+33}" font-family="sans-serif" font-size="12" text-anchor="middle">{esc(" ".join(words[mid:]))}</text>')
        else:
            p.append(f'<text x="{cx}" y="{y0+18}" font-family="sans-serif" font-size="12" text-anchor="middle">{esc(cat)}</text>')
    p.append(f'<text x="{L + plot_w/2}" y="{y0+52}" font-family="sans-serif" font-size="12" text-anchor="middle">{esc(xlabel)}</text>')
    # legend
    ly = y0 + 66
    lx = L + plot_w / 2 - 120
    p.append(f'<rect x="{lx}" y="{ly}" width="14" height="14" fill="#4a6fa5" stroke="#222" stroke-width="1"/>')
    p.append(f'<text x="{lx+20}" y="{ly+12}" font-family="sans-serif" font-size="12">{esc(s1_name)}</text>')
    p.append(f'<rect x="{lx+130}" y="{ly}" width="14" height="14" fill="#c8a24a" stroke="#222" stroke-width="1"/>')
    p.append(f'<text x="{lx+150}" y="{ly+12}" font-family="sans-serif" font-size="12">{esc(s2_name)}</text>')
    p.append("</svg>")
    return "".join(p)

SVG_M1Q14 = clustered_bar_svg(
    "e7m1q14",
    "Average Operating Cost per Passenger Trip on Five Bus Corridors, 2018 and 2021",
    'Clustered vertical bar graph showing the average operating cost per passenger trip, in dollars, on five bus corridors in 2018 and in 2021. The horizontal axis is titled "Bus corridor" and lists five corridors from left to right: Delaney Street, Palmetto Way, Kestrel Road, Harbor Avenue, and Sixth Avenue. The vertical axis is titled "Average operating cost per passenger trip (dollars)" and runs from 0 to 7 dollars, with tick marks every 1 dollar. Each corridor has two bars, one for 2018 and one for 2021, and each value is printed above its bar. Delaney Street: 3.90 dollars in 2018 and 3.50 dollars in 2021. Palmetto Way: 4.20 dollars in 2018 and 4.40 dollars in 2021. Kestrel Road: 4.80 dollars in 2018 and 4.20 dollars in 2021. Harbor Avenue: 5.60 dollars in 2018 and 3.90 dollars in 2021. Sixth Avenue: 6.40 dollars in 2018 and 4.30 dollars in 2021.',
    ["Delaney Street", "Palmetto Way", "Kestrel Road", "Harbor Avenue", "Sixth Avenue"],
    "2018", "2021",
    [3.90, 4.20, 4.80, 5.60, 6.40],
    [3.50, 4.40, 4.20, 3.90, 4.30],
    7, 1, lambda v: f"{v:.2f}" if v % 1 else f"{int(v)}",
    "Average operating cost per passenger trip (dollars)", "Bus corridor",
)

SVG_M2Q10 = clustered_bar_svg(
    "e7m2q10",
    "Mean Number of Pollinator Visits per Hour to Four Wildflower Species During Daylight and After Dark",
    'Clustered vertical bar graph showing the mean number of pollinator visits per hour to four wildflower species during daylight and after dark. The horizontal axis is titled "Wildflower species" and lists four species from left to right: wild bergamot, common milkweed, white campion, and evening primrose. The vertical axis is titled "Mean visits per hour" and runs from 0 to 25, with tick marks every 5 visits. Each species has two bars, one for daylight and one for after dark, and each value is printed above its bar. Wild bergamot: 18 visits per hour during daylight and 4 after dark. Common milkweed: 14 visits per hour during daylight and 9 after dark. White campion: 9 visits per hour during daylight and 11 after dark. Evening primrose: 3 visits per hour during daylight and 21 after dark.',
    ["Wild bergamot", "Common milkweed", "White campion", "Evening primrose"],
    "Daylight", "After dark",
    [18, 14, 9, 3],
    [4, 9, 11, 21],
    25, 5, lambda v: f"{int(v)}",
    "Mean visits per hour", "Wildflower species",
)

# ---------------- markdown table -> site HTML table ----------------
def md_table_to_html(caption, md_lines):
    rows = []
    for ln in md_lines:
        cells = [c.strip() for c in ln.strip().strip("|").split("|")]
        rows.append(cells)
    header, data = rows[0], rows[2:]
    h = [f"<table><caption>{esc(caption)}</caption><tr>"]
    h += [f"<th>{esc(c)}</th>" for c in header]
    h.append("</tr>")
    for r in data:
        h.append("<tr>" + "".join(f"<td>{esc(c)}</td>" for c in r) + "</tr>")
    h.append("</table>")
    return "".join(h)

# ---------------- question block parsing ----------------
PROMPT_RE = re.compile(
    r"^(Which choice|As used in the text|Based on the texts?|According to the text|Which quotation|Which finding|The student wants to)\b"
)

def clean_inline(s):
    s = s.replace("<u>", "[UNDERLINED]").replace("</u>", "[/UNDERLINED]")
    s = re.sub(r"(?<![\w*])\*([^*\n]+)\*(?![\w*])", r"\1", s)  # italics
    s = re.sub(r"\*\*(.+?)\*\*", r"\1", s)                      # bold
    return s

def parse_module(md, modnum):
    body = md.split("---", 1)[1]  # drop header/directions
    blocks = re.split(r"\n\*\*(\d+)\*\*\n", body)
    out = []
    for i in range(1, len(blocks), 2):
        qnum = int(blocks[i])
        raw = blocks[i + 1].split("\n---")[0].rstrip()
        lines = raw.split("\n")

        # choices
        ci = next(idx for idx, ln in enumerate(lines) if re.match(r"^A\) ", ln))
        opts = []
        letter_idx = {}
        cur = None
        for ln in lines[ci:]:
            m = re.match(r"^([A-D])\) (.*)$", ln)
            if m:
                cur = m.group(1)
                letter_idx[cur] = len(opts)
                opts.append(m.group(2))
            elif cur and ln.strip():
                opts[-1] += " " + ln.strip()
        assert len(opts) == 4, (modnum, qnum, len(opts))

        # prompt: last prompt-looking paragraph before the choices
        pre = lines[:ci]
        while pre and not pre[-1].strip():
            pre.pop()
        # find prompt start
        pi = None
        for idx in range(len(pre) - 1, -1, -1):
            if PROMPT_RE.match(pre[idx].strip()):
                pi = idx
                break
        assert pi is not None, (modnum, qnum)
        prompt = " ".join(l.strip() for l in pre[pi:] if l.strip())
        passage_lines = pre[:pi]

        # Rhetorical Synthesis: goal sentence is inside the prompt paragraph
        goal = None
        m = re.match(r"^(The student wants to .*?\.)\s+(Which choice most effectively.*)$", prompt)
        if m:
            goal, prompt = m.group(1), m.group(2)

        # figure handling: caption line **...** followed by md table (and optional italic svg note)
        text_parts = []
        j = 0
        while j < len(passage_lines):
            ln = passage_lines[j]
            cm = re.match(r"^\*\*(.+)\*\*$", ln.strip())
            if cm and j + 1 < len(passage_lines):
                # look ahead: markdown table (skipping blank + italic-note lines)
                k = j + 1
                note_seen = False
                while k < len(passage_lines) and (not passage_lines[k].strip() or passage_lines[k].strip().startswith("*(")):
                    if passage_lines[k].strip().startswith("*("):
                        note_seen = True
                    k += 1
                if k < len(passage_lines) and passage_lines[k].strip().startswith("|"):
                    tbl = []
                    while k < len(passage_lines) and passage_lines[k].strip().startswith("|"):
                        tbl.append(passage_lines[k])
                        k += 1
                    if note_seen:  # it's a graph -> SVG placeholder
                        text_parts.append({"GRAPH": cm.group(1)})
                    else:
                        text_parts.append(md_table_to_html(cm.group(1), tbl))
                    j = k
                    continue
            text_parts.append(ln)
            j += 1

        # rebuild passage text
        buf = []
        for part in text_parts:
            if isinstance(part, dict):
                buf.append({"GRAPH": part["GRAPH"]})
            else:
                buf.append(part)
        # join respecting blockquote/verse and paragraphs
        para, chunks = [], []
        def flush():
            nonlocal para
            if para:
                chunks.append("\n".join(para))
                para = []
        for part in buf:
            if isinstance(part, dict):
                flush()
                chunks.append(part)
                continue
            s = part.rstrip()
            if not s.strip():
                flush()
                continue
            if s.strip().startswith(">"):
                para.append(s.strip().lstrip(">").strip())
            elif s.strip().startswith("- "):
                para.append("• " + s.strip()[2:])
            else:
                para.append(s.strip())
        flush()

        final = []
        for c in chunks:
            if isinstance(c, dict):
                cap = c["GRAPH"]
                if "Bus Corridors" in cap:
                    final.append(SVG_M1Q14)
                elif "Pollinator Visits" in cap:
                    final.append(SVG_M2Q10)
                else:
                    raise SystemExit(f"unknown graph caption: {cap}")
            else:
                final.append(clean_inline(c))
        passage = "\n\n".join(final).strip()
        if goal:
            passage = passage + "\n\n" + clean_inline(goal)

        k = KEYTAB[(modnum, qnum)]
        sub, subid = SKILL_MAP[k["skill"]]
        out.append({
            "originalQuestionNumber": qnum,
            "passage": passage if passage else None,
            "text": clean_inline(prompt),
            "questionType": "multiple-choice",
            "options": [clean_inline(o) for o in opts],
            "correctAnswer": letter_idx[k["ans"]],
            "acceptedAnswers": None,
            "difficulty": k["diff"],
            "subcategory": sub,
            "subcategoryId": subid,
            "explanation": RATS[(modnum, qnum)],
        })
    return out

m1q = parse_module(M1, 1)
m2q = parse_module(M2, 2)
assert len(m1q) == 27 and len(m2q) == 27, (len(m1q), len(m2q))

data = {
    "examSlug": "exam7-rw-v1",
    "targetExamTitle": "Exam 7",
    "note": "Original UltraSAT Reading & Writing content for Practice Test 7, authored August 2026. Built to the College Board digital SAT blueprint (54 questions, 27 per module). Literary excerpts are public-domain (pre-1930) and verified against Project Gutenberg: Hardy 1872, Wallace 1869, Crane 1897, Chesnutt 1898, Naidu 1905, McKay 1920, Zitkala-Sa 1921.",
    "modules": [
        {
            "moduleNumber": 1,
            "title": "Exam 7, Module 1",
            "description": "Practice Test 7 - Reading and Writing, Module 1 (27 questions)",
            "section": "Reading and Writing",
            "calculatorAllowed": False,
            "timeLimit": 1920,
            "questions": m1q,
        },
        {
            "moduleNumber": 2,
            "title": "Exam 7, Module 2",
            "description": "Practice Test 7 - Reading and Writing, Module 2 (27 questions)",
            "section": "Reading and Writing",
            "calculatorAllowed": False,
            "timeLimit": 1920,
            "questions": m2q,
        },
    ],
}

out_path = f"{ROOT}/scripts/data/practiceTest7RW.json"
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
print("wrote", out_path)

# ---------------- validation ----------------
from collections import Counter
errors = []
allq = m1q + m2q
diffs = Counter()
subs = Counter()
for mod, qs in ((1, m1q), (2, m2q)):
    md_diffs = Counter(q["difficulty"] for q in qs)
    print(f"module {mod}: {len(qs)} qs; difficulty {dict(md_diffs)}")
for q in allq:
    diffs[q["difficulty"]] += 1
    subs[q["subcategory"]] += 1
    if len(q["options"]) != 4: errors.append(("options", q["originalQuestionNumber"]))
    if not q["text"].endswith("?"): errors.append(("prompt", q["originalQuestionNumber"], q["text"][-40:]))
    if q["correctAnswer"] not in (0, 1, 2, 3): errors.append(("ans", q["originalQuestionNumber"]))
    if not q["explanation"] or len(q["explanation"]) < 200: errors.append(("explanation", q["originalQuestionNumber"]))
    # letter/exp cross-check: explanation names the keyed letter as best
    letter = "ABCD"[q["correctAnswer"]]
    if f"Choice {letter} is the best answer" not in q["explanation"]:
        errors.append(("exp-letter", q["originalQuestionNumber"], letter))
print("difficulty:", dict(diffs))
print("subcategories:", dict(subs))
blank_qs = [q["originalQuestionNumber"] for q in allq if q["passage"] and "______" in q["passage"]]
print("items with blanks:", len(blank_qs))
und = [q["originalQuestionNumber"] for q in allq if q["passage"] and "[UNDERLINED]" in q["passage"]]
print("items with underlines:", und)
svg = [q["originalQuestionNumber"] for q in allq if q["passage"] and "<svg" in q["passage"]]
tab = [q["originalQuestionNumber"] for q in allq if q["passage"] and "<table" in q["passage"]]
print("svg items:", svg, "| table items:", tab)
if errors:
    print("ERRORS:"); [print(" ", e) for e in errors]; sys.exit(1)
print("VALIDATION PASSED")
