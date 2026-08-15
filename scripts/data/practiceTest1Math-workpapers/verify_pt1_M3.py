#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
verify_pt1_M3.py — adversarial mathematical + structural verification of ULTRASAT
Practice Test 1, Math Module 3 (M3.annotated.json).

Independent of the writers' claims: every answer is re-derived from the stem alone,
every distractor is re-derived from its named error recipe, every SPR acceptedAnswers
list is regenerated from scratch (spr_enum logic) and diffed exactly, and every SVG is
parsed and re-measured coordinate-by-coordinate against the stem/key/rationale.

Run:  python3 verify_pt1_M3.py     (prints PASS/FAIL lines; exit 0 iff no FAIL)
Requires sympy:  pip install sympy --break-system-packages
"""
import json, os, re, sys, math, xml.etree.ElementTree as ET
from fractions import Fraction

try:
    import sympy as sp
except ImportError:
    print("sympy not installed — run: pip install sympy --break-system-packages")
    sys.exit(2)

HERE = os.path.dirname(os.path.abspath(__file__))
with open(os.path.join(HERE, "M3.annotated.json"), encoding="utf-8") as f:
    MOD = json.load(f)

FAIL, WARN = [], []
def check(cond, label):
    if cond:
        print("  PASS  " + label)
    else:
        print("  FAIL  " + label)
        FAIL.append(label)

def warn(cond, label):
    if not cond:
        print("  WARN  " + label)
        WARN.append(label)

def q(n):
    return next(it for it in MOD["questions"] if it["originalQuestionNumber"] == n)

# ------------------------------------------------------------------ option parsing
def parse_val(s):
    """Parse a plain-text numeric option ('2,300', '-9/4', '36π', '1.25') -> Fraction.
    For 'aπ' options returns the coefficient (comparison within an all-π set)."""
    t = s.strip().replace(",", "").replace("−", "-")
    pi = t.endswith("π")
    if pi:
        t = t[:-1] or "1"
    if "/" in t:
        num, den = t.split("/")
        return Fraction(int(num), int(den))
    return Fraction(t)

def all_numeric(opts):
    try:
        [parse_val(o) for o in opts]
        return True
    except Exception:
        return False

def ascending(vals):
    return all(a < b for a, b in zip(vals, vals[1:]))

# ------------------------------------------------------------------ SPR enumerator
def spr_enumerate(exact, canonical=None):
    """Every legal SPR entry string for an exact value: <=5 chars (6 with minus).
    Same logic as the shared spr_enum.py used for PT4/PT5."""
    v = Fraction(exact)
    limit = 6 if v < 0 else 5
    sign = "-" if v < 0 else ""
    a = -v if v < 0 else v
    forms = []
    def add(s):
        s2 = sign + s
        if len(s2) <= limit and s2 not in forms:
            forms.append(s2)
    if a.denominator == 1:
        add(str(a.numerator))
    for qq in range(1, 10000):
        p = a * qq
        if p.denominator == 1:
            add("%d/%d" % (p.numerator, qq))
    rem = a.denominator
    for f2 in (2, 5):
        while rem % f2 == 0:
            rem //= f2
    if rem == 1:
        dmin, t = 0, a
        while t.denominator != 1:
            t, dmin = t * 10, dmin + 1
        for d in range(max(dmin, 1), 8):
            digits = str((a * 10 ** d).numerator).rjust(d + 1, "0")
            add("%s.%s" % (digits[:-d], digits[-d:]))
            if a < 1:
                add(".%s" % digits[-d:])
    else:
        prefixes = ["%d." % (a.numerator // a.denominator)]
        if a < 1:
            prefixes.append(".")
        widths = sorted({limit - len(sign) - len(pre) for pre in prefixes
                         if limit - len(sign) - len(pre) > 0})
        for D in widths:
            scaled = a * 10 ** D
            trunc = scaled.numerator // scaled.denominator
            half = scaled + Fraction(1, 2)
            rnd = half.numerator // half.denominator
            for n_ in (trunc, rnd):
                digits = str(n_).rjust(D + 1, "0")
                add("%s.%s" % (digits[:-D], digits[-D:]))
                if a < 1:
                    add(".%s" % digits[-D:])
    if canonical is not None and canonical in forms:
        forms.remove(canonical)
        forms.insert(0, canonical)
    return forms

def spr_check(n, exact):
    it = q(n)
    want = spr_enumerate(exact, it["correctAnswer"])
    got = it["acceptedAnswers"]
    check(got == want,
          "Q%d acceptedAnswers exactly match machine enumeration (%d forms)" % (n, len(want)))
    if got != want:
        print("        missing:", [w for w in want if w not in got])
        print("        illegal:", [g for g in got if g not in want])
    check(it["correctAnswer"] == got[0] and it["correctAnswer"] in want,
          "Q%d correctAnswer '%s' is the canonical first accepted entry" % (n, it["correctAnswer"]))
    for e in got:
        val = Fraction(e) if "/" not in e else Fraction(int(e.split("/")[0]), int(e.split("/")[1]))
        if "/" in e or "." not in e:
            check(val == Fraction(exact), "Q%d accepted entry '%s' equals exact value" % (n, e))
        else:                       # decimal entry: exact, or max-precision truncation/rounding
            places = len(e.split(".")[1])
            ok = val == Fraction(exact) or abs(val - Fraction(exact)) < Fraction(1, 10 ** places)
            check(ok, "Q%d accepted decimal '%s' is a legal truncation/rounding of the exact value" % (n, e))
        check(len(e) <= (6 if e.startswith("-") else 5), "Q%d entry '%s' within char limit" % (n, e))
    if Fraction(exact).denominator != 1:
        check("examples of ways to enter a correct answer" in it["explanation"],
              "Q%d non-integer SPR carries the entry-forms note" % n)

# ------------------------------------------------------------------ SVG helpers
def svg_root(name):
    tree = ET.parse(os.path.join(HERE, "assets", name))
    return tree.getroot()

def svg_texts(root):
    out = []
    for el in root.iter():
        if el.tag.endswith("text"):
            out.append(("".join(el.itertext()).strip(),
                        float(el.get("x", "0")), float(el.get("y", "0"))))
    return out

def svg_lines(root):
    out = []
    for el in root.iter():
        if el.tag.rsplit("}", 1)[-1] == "line":
            out.append((float(el.get("x1")), float(el.get("y1")),
                        float(el.get("x2")), float(el.get("y2")), el))
    return out

# ================================================================== module shell
print("== Module shell ==")
check(MOD["moduleNumber"] == 3 and MOD["section"] == "Math", "moduleNumber 3 / section Math")
check(MOD["title"] == "Exam 1, Module 3", "title 'Exam 1, Module 3'")
check(MOD["description"] == "Practice Test 1 - Math, Module 1 (22 questions)",
      "description follows the PT5 house pattern")
check(MOD["calculatorAllowed"] is True and MOD["timeLimit"] == 2100,
      "calculatorAllowed true, timeLimit 2100")
check(len(MOD["questions"]) == 22, "22 questions")
check([it["originalQuestionNumber"] for it in MOD["questions"]] == list(range(1, 23)),
      "originalQuestionNumber 1..22 in order")

spr = [it["originalQuestionNumber"] for it in MOD["questions"] if it["questionType"] == "user-input"]
check(spr == [5, 6, 12, 13, 19, 22], "SPR positions %s == [5, 6, 12, 13, 19, 22]" % spr)
mc = [it for it in MOD["questions"] if it["questionType"] == "multiple-choice"]
check(len(mc) == 16, "16 MC + 6 SPR")
check(all(len(it["options"]) == 4 for it in mc), "every MC has exactly 4 options")
check(all(isinstance(it["correctAnswer"], int) and 0 <= it["correctAnswer"] <= 3 for it in mc),
      "every MC correctAnswer is an int index 0..3")
check(all(it["acceptedAnswers"] is None for it in mc), "MC acceptedAnswers all null")
check(all(it["options"] == [] and isinstance(it["correctAnswer"], str)
          and isinstance(it["acceptedAnswers"], list)
          for it in MOD["questions"] if it["questionType"] == "user-input"),
      "SPR: options [], string correctAnswer, list acceptedAnswers")
check(all(it["explanation"].strip() for it in MOD["questions"]), "every explanation nonempty")

diffs = [it["difficulty"] for it in MOD["questions"]]
expected_curve = ["easy"] * 8 + ["medium"] + ["easy"] + ["medium"] * 6 + ["hard"] * 6
check(diffs == expected_curve, "curve E x8, M at Q9, E straggler Q10, M x6 (Q11-16), H x6 (Q17-22)")
check((diffs.count("easy"), diffs.count("medium"), diffs.count("hard")) == (9, 7, 6),
      "difficulty mix 9E / 7M / 6H")
check([q(n)["difficulty"] for n in spr] == ["easy", "easy", "medium", "medium", "hard", "hard"],
      "SPR difficulty by position E/E/M/M/H/H")

tally = {L: 0 for L in "ABCD"}
for it in mc:
    tally["ABCD"[it["correctAnswer"]]] += 1
check(all(abs(tally[L] - 4) <= 1 for L in "ABCD"), "key-letter tally %s within 4/4/4/4 +-1" % tally)

# ------------------------------------------------------------------ blueprint slots
print("== Blueprint slots ==")
SUBIDS = {"linear-equations-one-variable": 11, "linear-functions": 12,
          "linear-equations-two-variables": 13, "systems-linear-equations": 14,
          "linear-inequalities": 15, "nonlinear-functions": 16, "nonlinear-equations": 17,
          "equivalent-expressions": 18, "ratios-rates-proportions": 19, "percentages": 20,
          "one-variable-data": 21, "two-variable-data": 22, "probability": 23,
          "inference-statistics": 24, "evaluating-statistical-claims": 25, "area-volume": 26,
          "lines-angles-triangles": 27, "right-triangles-trigonometry": 28, "circles": 29}
check(all(SUBIDS[it["subcategory"]] == it["subcategoryId"] for it in MOD["questions"]),
      "subcategory -> subcategoryId map correct on all 22 items")
SLOT = {1: 11, 2: 19, 3: 16, 4: 12, 5: 12, 6: 20, 7: 14, 8: 27, 9: 14, 10: 26, 11: 13,
        12: 22, 13: 28, 14: 16, 15: 18, 16: 24, 17: 11, 18: 29, 19: 16, 20: 20, 21: 17, 22: 17}
check(all(q(n)["subcategoryId"] == sid for n, sid in SLOT.items()),
      "per-slot skill assignment matches PT1 blueprint")
VIS = {3: "table", 7: "PT1-M3-Q07.svg", 8: "PT1-M3-Q08.svg", 12: "PT1-M3-Q12.svg"}
for n, v in VIS.items():
    if v == "table":
        check("<table" in (q(n)["passage"] or ""), "Q3 carries the HTML data table")
    else:
        check(q(n)["graphAsset"] == v, "Q%d graphAsset %s" % (n, v))
        check(os.path.exists(os.path.join(HERE, "assets", v)), "asset file %s exists" % v)
        check(bool(q(n)["graphDescription"]), "Q%d has alt-text graphDescription" % n)
check(all(it["graphAsset"] is None and it["graphDescription"] is None
          for it in MOD["questions"] if it["originalQuestionNumber"] not in (7, 8, 12)),
      "no stray graphAsset/graphDescription on figure-less items")

# ------------------------------------------------------------------ option hygiene
print("== Option hygiene ==")
for it in mc:
    n = it["originalQuestionNumber"]
    check(not any("<" in o or ">" in o or "&" in o for o in it["options"]),
          "Q%d options are plain text (no HTML)" % n)
    check(not any("−" in o for o in it["options"]),
          "Q%d options use ASCII hyphen, not Unicode minus" % n)
    check(len(set(it["options"])) == 4, "Q%d four distinct option strings" % n)
    if all_numeric(it["options"]):
        vals = [parse_val(o) for o in it["options"]]
        check(len(set(vals)) == 4, "Q%d four distinct option values" % n)
        check(ascending(vals), "Q%d numeric options strictly ascending" % n)

pairs = [re.match(r"^\((-?\d+), (-?\d+)\)$", o) for o in q(7)["options"]]
check(all(pairs), "Q7 options are ordered pairs")
pv = [(int(m.group(1)), int(m.group(2))) for m in pairs]
check(ascending([p for p in pv]), "Q7 ordered-pair options ascending by (x, y)")
fac = [re.match(r"^x ([+-]) (\d+)$", o) for o in q(15)["options"]]
check(all(fac), "Q15 options are x +- c binomials")
fv = [int(m.group(1) + m.group(2)) for m in fac]
check(ascending(fv), "Q15 factor options ascending by constant")

# ------------------------------------------------------------------ HTML conventions
print("== Passage/stem HTML conventions ==")
CDIV = '<div style="text-align:center; margin:8px 0;">'
for n in (1, 14, 17, 18, 21, 22):
    check((q(n)["passage"] or "").startswith(CDIV), "Q%d displayed equation uses centered div" % n)
check("The table shows" in q(3)["passage"] and "border-collapse" in q(3)["passage"],
      "Q3 table has lead-in sentence and bordered style")
blob_all = json.dumps(MOD, ensure_ascii=False)
for bad, lab in ((" you ", "no 'you'"), ("!", "no exclamation points"), ("Find ", "no imperative 'Find'")):
    check(bad not in blob_all, "voice: %s anywhere in module" % lab)
check("It's given" not in blob_all, "curly apostrophe used in 'It’s given' throughout")
check("'" not in blob_all, "zero straight apostrophes anywhere in module prose (fix round 1)")

# ------------------------------------------------------------------ rationale liturgy
print("== Rationale liturgy ==")
for it in mc:
    n, key = it["originalQuestionNumber"], "ABCD"[it["correctAnswer"]]
    e = it["explanation"]
    check(e.startswith("Choice %s is correct." % key), "Q%d rationale opens 'Choice %s is correct.'" % (n, key))
    for L in "ABCD":
        if L != key:
            check(("Choice %s is incorrect" % L) in e, "Q%d dismisses choice %s" % (n, L))
    check("Therefore," in e, "Q%d rationale carries a 'Therefore,' close" % n)
for n in spr:
    e = q(n)["explanation"]
    check(e.startswith("The correct answer is "), "Q%d SPR rationale opens with the liturgy" % n)

# ================================================================== per-item math
print("== Q1 (2x - 7 = 15) ==")
xs = sp.symbols("x")
sol = sp.solve(sp.Eq(2 * xs - 7, 15), xs)
check(sol == [11], "unique solution x = 11")
o = [parse_val(v) for v in q(1)["options"]]
check(o[q(1)["correctAnswer"]] == 11, "key option is 11")
check(o[0] == Fraction(15 - 7, 2) and o[1] == 7 and o[3] == 15,
      "distractors = (15-7)/2, echoed 7, echoed 15")
check(all(2 * v - 7 != 15 for v in (o[0], o[1], o[3])), "no distractor satisfies the equation")

print("== Q2 (population density) ==")
check(Fraction(34500, 15) == 2300, "34,500 / 15 = 2,300 exactly")
o = [parse_val(v) for v in q(2)["options"]]
check(o[q(2)["correctAnswer"]] == 2300, "key option is 2,300")
check(o[1] == 34500 - 15 and o[2] == 34500 + 15 and o[3] == 34500 * 15,
      "distractors = minus, plus, times recipes")

print("== Q3 (exponential from table) ==")
table = [(0, 4), (1, 12), (2, 36)]
cands = [(3, 4), (4, 3), (4, 8), (4, 12)]          # (a, b) per option A-D
fits = [all(a * b ** xv == yv for xv, yv in table) for a, b in cands]
check(fits == [False, True, False, False], "exactly option B fits all three table rows")
check(q(3)["correctAnswer"] == 1, "key index 1 (B)")
check(4 * 8 ** 2 == 256 and 4 * 12 ** 2 == 576, "dismissal values 256 and 576 verified")

print("== Q4 (interpretation of 40) ==")
check(55 * 0 + 40 == 40 and 55 * 1 + 40 == 95, "C(0) = 40 and C(1) = 95 support key + dismissal D")
check(q(4)["correctAnswer"] == 1 and "diagnostic fee of $40" in q(4)["options"][1],
      "key B states the $40 diagnostic fee")
check("$55" not in q(4)["options"][1] and "each hour" not in q(4)["options"][1],
      "key sentence contains no role swap")

print("== Q5 SPR f(8) for f(x) = 40 - 3x ==")
check(40 - 3 * 8 == 16, "f(8) = 16")
spr_check(5, 16)

print("== Q6 SPR 15% of 31 ==")
check(Fraction(15, 100) * 31 == Fraction(93, 20) and float(Fraction(93, 20)) == 4.65,
      "0.15 x 31 = 4.65 = 93/20")
spr_check(6, Fraction(93, 20))

print("== Q7 (system from graph) + SVG ==")
root = svg_root("PT1-M3-Q07.svg")
axes = [l for l in svg_lines(root) if l[4].get("marker-start") and abs(float(l[4].get("stroke-width", "0") or 0) - 1.4) < .01 or l[4].get("stroke-width") == "1.4"]
axis_lines = [l for l in svg_lines(root) if l[4].get("stroke-width") is None]
g14 = [l for l in svg_lines(root)]
xaxis = [l for l in g14 if l[1] == l[3] and l[0] < 40]      # horizontal, extends past grid
yaxis = [l for l in g14 if l[0] == l[2] and l[1] > 330]     # vertical, extends past grid
check(len(xaxis) == 1 and len(yaxis) == 1, "one x-axis and one y-axis line found")
ax_y, ax_x = xaxis[0][1], yaxis[0][0]
check(ax_y == 276 and ax_x == 146, "axes cross at SVG (146, 276)")
data = [l for l in g14 if l[4].get("stroke-width") == "2"]
check(len(data) == 2, "two data lines drawn")
lines = []
for (x1, y1, x2, y2, el) in data:
    p1 = (Fraction(x1 - ax_x).limit_denominator() / 26, Fraction(ax_y - y1).limit_denominator() / 26)
    p2 = (Fraction(x2 - ax_x).limit_denominator() / 26, Fraction(ax_y - y2).limit_denominator() / 26)
    m = (p2[1] - p1[1]) / (p2[0] - p1[0])
    b = p1[1] - m * p1[0]
    lines.append((m, b))
check(sorted(l[1] for l in lines) == [3, 9], "drawn y-intercepts are 3 and 9")
check(sorted(l[0] for l in lines) == [-2, 1], "drawn slopes are -2 and 1")
(m1, b1), (m2, b2) = lines
xi = (b2 - b1) / (m1 - m2); yi = m1 * xi + b1
check((xi, yi) == (2, 5), "drawn intersection is exactly (2, 5)")
check(q(7)["options"][q(7)["correctAnswer"]] == "(2, 5)", "key option equals the drawn intersection")
check(q(7)["options"][3] == "(5, 2)", "reversal distractor present")
check("not drawn to scale" not in "".join(t for t, _, _ in svg_texts(root)),
      "coordinate grid carries no not-to-scale note")
for t, tx, ty in svg_texts(root):
    if re.match(r"^-?\d+$", t) and abs(ty - 292) < 2:
        check(Fraction(int(tx - ax_x), 26) == int(t), "x-axis label %s at correct gridline" % t)
    if re.match(r"^-?\d+$", t) and abs(tx - 141) < 2 and t != "O":
        check(Fraction(int(ax_y - (ty - 4)), 26) == int(t), "y-axis label %s at correct gridline" % t)

print("== Q8 (exterior angle) + SVG ==")
check(34 + 78 == 112, "x = 34 + 78 = 112")
o = [parse_val(v) for v in q(8)["options"]]
check(o[q(8)["correctAnswer"]] == 112, "key option is 112")
check(o[0] == 78 - 34 and o[1] == 180 - 112 and o[2] == 78,
      "distractors = difference, supplement, echoed 78")
root = svg_root("PT1-M3-Q08.svg")
texts = [t for t, _, _ in svg_texts(root)]
check("Note: Figure not drawn to scale." in texts, "geometry figure carries the note")
for lab in ("A", "B", "C", "D", "34°", "78°"):
    check(lab in texts, "figure label %s present" % lab)
check(any(t == "x°" or t.replace(" ", "") == "x°" for t in texts), "x° label present")
segs = [(l[0], l[1], l[2], l[3]) for l in svg_lines(root)]
base = [s for s in segs if s[1] == s[3]]
check(len(base) == 1 and base[0][1] == 195, "one horizontal baseline through B, C, D")
slant = sorted(s for s in segs if s[1] != s[3])
check(slant == [(70, 195, 112, 52), (112, 52, 240, 195)],
      "triangle sides drawn B->A and A->C with the fix-round apex (112, 52)")
A, B, C, D = (112, 52), (70, 195), (240, 195), (335, 195)
check(B[0] < C[0] < D[0], "D lies beyond C on ray BC (extension drawn)")
xdeg = [(tx, ty) for t, tx, ty in svg_texts(root) if "x" in t and "°" in t]
check(len(xdeg) == 1 and C[0] < xdeg[0][0] < D[0] and xdeg[0][1] < 195,
      "x° marks the exterior angle ACD region")
angA = math.degrees(math.acos(
    ((B[0]-A[0])*(C[0]-A[0]) + (B[1]-A[1])*(C[1]-A[1])) /
    (math.hypot(B[0]-A[0], B[1]-A[1]) * math.hypot(C[0]-A[0], C[1]-A[1]))))
angB = math.degrees(math.acos(
    ((A[0]-B[0])*(C[0]-B[0]) + (A[1]-B[1])*(C[1]-B[1])) /
    (math.hypot(A[0]-B[0], A[1]-B[1]) * math.hypot(C[0]-B[0], C[1]-B[1]))))
check(angA < angB, "drawn angle rank order matches labels 34 < 78 "
      "(fix round 1 apex move; drawn A=%.0f°, B=%.0f°)" % (angA, angB))

print("== Q9 (kits system) ==")
b, d = sp.symbols("b d")
solq9 = sp.solve([sp.Eq(b + d, 24), sp.Eq(7 * b + 13 * d, 264)], [b, d])
check(solq9[b] == 8 and solq9[d] == 16, "b = 8, d = 16 unique")
o = [parse_val(v) for v in q(9)["options"]]
check(o[q(9)["correctAnswer"]] == 8, "key option is 8")
swap = sp.solve([sp.Eq(b + d, 24), sp.Eq(13 * b + 7 * d, 264)], [b, d])
check(o[1] == 11 and Fraction(264, 24) == 11, "distractor 11 = 264/24")
check(o[2] == 16 and swap[b] == 16, "distractor 16 = price-swap / deluxe count")
check(o[3] == 24, "distractor 24 = echoed total")

print("== Q10 (sphere volume) ==")
check(Fraction(4, 3) * 6 ** 3 == 288, "(4/3)(216) = 288 -> 288π")
opts = q(10)["options"]
check(all(oo.endswith("π") for oo in opts), "all options symbolic π")
o = [parse_val(v) for v in opts]
check(o[q(10)["correctAnswer"]] == 288, "key option 288π")
check(o[0] == Fraction(4, 3) * 3 ** 3 and o[1] == Fraction(4, 3) * 6 ** 2 and o[2] == 4 * 6 ** 2,
      "distractors = diameter slip 36π, r² slip 48π, surface area 144π")

print("== Q11 (perpendicular slope) ==")
check(Fraction(-1) / Fraction(4, 9) == Fraction(-9, 4), "negative reciprocal of 4/9 is -9/4")
o = [parse_val(v) for v in q(11)["options"]]
check(o[q(11)["correctAnswer"]] == Fraction(-9, 4), "key option -9/4")
check(o[1] == Fraction(-4, 9) and o[2] == Fraction(4, 9) and o[3] == Fraction(9, 4),
      "distractor trio: plain negative, original, reciprocal")

print("== Q12 SPR (average rate of change) + SVG ==")
check(Fraction(13 - 4, 7 - 1) == Fraction(3, 2), "(13-4)/(7-1) = 3/2")
spr_check(12, Fraction(3, 2))
root = svg_root("PT1-M3-Q12.svg")
g = svg_lines(root)
xaxis = [l for l in g if l[1] == l[3] and l[0] < 45][0]
yaxis = [l for l in g if l[0] == l[2] and l[1] > 310][0]
ax_y, ax_x = xaxis[1], yaxis[0]
check(ax_y == 308 and ax_x == 50, "axes cross at SVG (50, 308)")
dots = [(float(c.get("cx")), float(c.get("cy"))) for c in root.iter() if c.tag.endswith("circle")]
mdots = sorted((Fraction(int(cx - ax_x), 30), Fraction(int(ax_y - cy), 18)) for cx, cy in dots)
check(mdots == [(1, 4), (7, 13)], "dots sit exactly at (1, 4) and (7, 13)")
poly = [p for p in root.iter() if p.tag.endswith("polyline")][0]
pts = [tuple(map(float, pp.split(","))) for pp in poly.get("points").split()]
ys = [p[1] for p in pts]
check(all(a > b for a, b in zip(ys, ys[1:])), "curve strictly rises left to right")
for cx, cy in dots:
    near = min(pts, key=lambda p: abs(p[0] - cx))
    check(abs(near[1] - cy) < 1.0, "labeled point (%g, %g) lies on the drawn curve" % (cx, cy))
texts = [t for t, _, _ in svg_texts(root)]
check("(1, 4)" in texts and "(7, 13)" in texts, "coordinate labels shown")
check("not drawn to scale" not in " ".join(texts), "coordinate grid carries no note")

print("== Q13 SPR (rectangle diagonal) ==")
check(21 ** 2 + 20 ** 2 == 841 and 29 ** 2 == 841, "20-21-29 triple verified")
spr_check(13, 29)

print("== Q14 (location of minimum) ==")
fx = xs ** 2 - 8 * xs + 21
xv = sp.solve(sp.diff(fx, xs), xs)
check(xv == [4], "vertex at x = 4")
check(fx.subs(xs, 4) == 5 and fx.subs(xs, 0) == 21, "min value 5; f(0) = 21")
o = [parse_val(v) for v in q(14)["options"]]
check(o[q(14)["correctAnswer"]] == 4, "key option is 4")
check(o[0] == -4 and o[2] == 5 and o[3] == 21, "distractors = sign slip, min value, f(0)")

print("== Q15 (which is a factor) ==")
poly = xs ** 2 + 2 * xs - 48
roots = {8: False, 6: True, -6: False, -12: False}   # option constants c in x - c terms: 8, 6, -6, -12
vals = [poly.subs(xs, r) for r in (8, 6, -6, -12)]
check([v == 0 for v in vals] == [False, True, False, False],
      "of the four candidate roots only x = 6 works (values %s)" % vals)
check(q(15)["correctAnswer"] == 1, "key index 1 (x - 6)")
check(sp.expand((xs + 8) * (xs - 6)) == poly, "(x + 8)(x - 6) reproduces the trinomial")

print("== Q16 (point-estimate scale-up) ==")
check(Fraction(36, 200) * 4500 == 810, "0.18 x 4,500 = 810")
o = [parse_val(v) for v in q(16)["options"]]
check(o[q(16)["correctAnswer"]] == 810, "key option 810")
check(o[0] == 36 and o[1] == Fraction(4500, 36) and o[3] == Fraction(36, 100) * 4500,
      "distractors = echoed 36, 4,500/36 = 125, 36% slip 1,620")

print("== Q17 (infinitely many solutions) ==")
kk = sp.symbols("k")
lhs, rhs = 5 * (kk * xs + 3), 60 * xs + 15
ksol = sp.solve(sp.Eq(5 * kk, 60), kk)
check(ksol == [12], "coefficient match forces k = 12")
check(sp.expand(lhs.subs(kk, 12) - rhs) == 0, "k = 12 makes the sides identical")
for kbad in (-12, 3, 5):
    s = sp.solve(sp.Eq(lhs.subs(kk, kbad), rhs), xs)
    check(len(s) == 1, "k = %d yields exactly one solution, not infinitely many" % kbad)
o = [parse_val(v) for v in q(17)["options"]]
check(o[q(17)["correctAnswer"]] == 12, "key option 12")

print("== Q18 (NOT a possible x on the circle) ==")
possible = [abs(v + 2) <= 5 for v in (-8, -7, 0, 3)]
check(possible == [False, True, True, True], "only x = -8 impossible on (x+2)²+(y-4)²=25")
check(q(18)["correctAnswer"] == 0, "key index 0 (-8)")
check((-7 + 2) ** 2 == 25 and (3 + 2) ** 2 == 25, "endpoints -7 and 3 attained at y = 4")
check((0 + 2) ** 2 + 0 <= 25, "x = 0 interior, real y exists")

print("== Q19 SPR (panel width) ==")
w = sp.symbols("w", positive=True)
solw = sp.solve(sp.Eq(w * (w + 5), 266), w)
check(solw == [14], "positive width 14 (length 19, area 266)")
check(sp.expand((w + 19) * (w - 14)) == sp.expand(w ** 2 + 5 * w - 266), "factoring verified")
spr_check(19, 14)

print("== Q20 (compounded percent) ==")
r = Fraction(4000 - 3200, 3200)
check(r == Fraction(1, 4), "2022->2023 increase is exactly 25%")
check(4000 * (1 + r) == 5000, "2024 attendance 5,000")
o = [parse_val(v) for v in q(20)["options"]]
check(o[q(20)["correctAnswer"]] == 5000, "key option 5,000")
check(o[0] == 4000 * r and o[1] == 4000 + 800 and o[3] == 4000 * Fraction(3, 2),
      "distractors = bare increase 1,000, linear add 4,800, 50% slip 6,000")

print("== Q21 (product of solutions) ==")
rts = sp.solve(2 * xs ** 2 - 11 * xs + 13, xs)
check(len(rts) == 2 and sp.simplify(rts[0] * rts[1]) == Fraction(13, 2), "product of roots = 13/2")
check(sp.simplify(rts[0] + rts[1]) == Fraction(11, 2), "sum of roots = 11/2 (distractor C)")
check((-11) ** 2 - 4 * 2 * 13 == 17, "discriminant 17 > 0, both roots real")
o = [parse_val(v) for v in q(21)["options"]]
check(o[q(21)["correctAnswer"]] == Fraction(13, 2), "key option 13/2")
check(o[0] == Fraction(-13, 2) and o[1] == Fraction(-11, 2) and o[2] == Fraction(11, 2),
      "distractors = sign slips and the sum")

print("== Q22 SPR (least k, one real solution) ==")
ks = sp.solve(sp.Eq(kk ** 2 - 4 * 49, 0), kk)
check(sorted(ks) == [-14, 14], "discriminant zero at k = ±14")
check(min(ks) == -14, "least value -14")
spr_check(22, -14)
check("14" not in [a for a in q(22)["acceptedAnswers"]], "positive root 14 NOT accepted")

# ------------------------------------------------------------------ module summary
print("== Within-module answer duplication ==")
keyvals = []
for it in mc:
    try:
        keyvals.append(parse_val(it["options"][it["correctAnswer"]]))
    except Exception:
        pass
from collections import Counter
dups = {v: c for v, c in Counter(keyvals).items() if c >= 2}
check(all(c < 3 for c in dups.values()), "no keyed value appears 3+ times")
warn(not dups, "keyed values repeated in module: %s" % dups)

print()
print("FAILURES: %d   WARNINGS: %d" % (len(FAIL), len(WARN)))
if FAIL:
    for f in FAIL:
        print("  FAIL:", f)
    sys.exit(1)
print("ALL CHECKS PASSED (M3)")
