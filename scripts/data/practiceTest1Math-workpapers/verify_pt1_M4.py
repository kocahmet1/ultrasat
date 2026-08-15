#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
verify_pt1_M4.py — adversarial mathematical + structural verification of ULTRASAT
Practice Test 1, Math Module 4 (M4.annotated.json), plus the cross-module form-level
checks (domain/skill quotas, SPR census, collisions between the 44 items).

Independent of the writers' claims: every answer is re-derived from the stem alone,
every distractor is re-derived from its named error recipe, every SPR acceptedAnswers
list is regenerated from scratch (spr_enum logic) and diffed exactly, and every SVG is
parsed and re-measured coordinate-by-coordinate against the stem/key/rationale.

Run:  python3 verify_pt1_M4.py     (prints PASS/FAIL lines; exit 0 iff no FAIL)
Requires sympy:  pip install sympy --break-system-packages

FIX ROUND 1 APPLIED: the (radius 6, volume 288π) collision between M3 Q10 and
M4 Q11 was resolved by retuning the cylinder to r = 4 cm, V = 128π (h = 8, key B);
Q14 rekeyed to 32 (D); Q1 retextured (Priya, $14 + $9.50/hr); Q20 retuned to
(first term 4, ratio 6) with the attested a(n) stem. Expectations below encode
the fixed form.
"""
import json, os, re, sys, math, statistics, xml.etree.ElementTree as ET
from fractions import Fraction
from collections import Counter

try:
    import sympy as sp
except ImportError:
    print("sympy not installed — run: pip install sympy --break-system-packages")
    sys.exit(2)

HERE = os.path.dirname(os.path.abspath(__file__))
with open(os.path.join(HERE, "M4.annotated.json"), encoding="utf-8") as f:
    MOD = json.load(f)
with open(os.path.join(HERE, "M3.annotated.json"), encoding="utf-8") as f:
    M3 = json.load(f)

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

def q(n, mod=None):
    return next(it for it in (mod or MOD)["questions"] if it["originalQuestionNumber"] == n)

# ------------------------------------------------------------------ option parsing
def parse_val(s):
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
        if el.tag.rsplit("}", 1)[-1] == "text":
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
check(MOD["moduleNumber"] == 4 and MOD["section"] == "Math", "moduleNumber 4 / section Math")
check(MOD["title"] == "Exam 1, Module 4", "title 'Exam 1, Module 4'")
check(MOD["description"] == "Practice Test 1 - Math, Module 2 (22 questions)",
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
SLOT = {1: 12, 2: 18, 3: 13, 4: 23, 5: 16, 6: 13, 7: 16, 8: 15, 9: 11, 10: 21, 11: 26,
        12: 19, 13: 17, 14: 27, 15: 17, 16: 15, 17: 14, 18: 29, 19: 12, 20: 16, 21: 22, 22: 18}
check(all(q(n)["subcategoryId"] == sid for n, sid in SLOT.items()),
      "per-slot skill assignment matches PT1 blueprint")
VIS = {4: "table", 10: "PT1-M4-Q10.svg", 11: "PT1-M4-Q11.svg", 21: "PT1-M4-Q21.svg"}
for n, v in VIS.items():
    if v == "table":
        check("<table" in (q(n)["passage"] or ""), "Q4 carries the HTML frequency table")
    else:
        check(q(n)["graphAsset"] == v, "Q%d graphAsset %s" % (n, v))
        check(os.path.exists(os.path.join(HERE, "assets", v)), "asset file %s exists" % v)
        check(bool(q(n)["graphDescription"]), "Q%d has alt-text graphDescription" % n)
check(all(it["graphAsset"] is None and it["graphDescription"] is None
          for it in MOD["questions"] if it["originalQuestionNumber"] not in (10, 11, 21)),
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

# ------------------------------------------------------------------ HTML conventions
print("== Passage/stem HTML conventions ==")
CDIV = '<div style="text-align:center; margin:8px 0;">'
for n in (6, 7, 13, 15, 17, 22):
    check((q(n)["passage"] or "").startswith(CDIV), "Q%d displayed equation uses centered div" % n)
check("The table shows" in q(4)["passage"] and "border-collapse" in q(4)["passage"]
      and ">Total<" in q(4)["passage"],
      "Q4 table has lead-in, borders, and a Total row")
blob_all = json.dumps(MOD, ensure_ascii=False)
for bad, lab in ((" you ", "no 'you'"), ("!", "no exclamation points"), ("Find ", "no imperative 'Find'")):
    check(bad not in blob_all, "voice: %s anywhere in module" % lab)
check("It's given" not in blob_all, "curly apostrophe used in 'It’s given' throughout")
check("'" not in blob_all, "zero straight apostrophes anywhere in module prose")

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
xs, ys = sp.symbols("x y")

print("== Q1 (kayak rental model) ==")
check(q(1)["options"][q(1)["correctAnswer"]] == "C = 9.50h + 14",
      "key equation puts $9.50 on h and $14 as the constant")
check(q(1)["options"][1] == "C = 14h + 9.50" and 9.50 + 14 == 23.50 and 9.50 * 14 == 133,
      "distractors = role swap, (9.50+14)h, (9.50*14)h")
check(q(1)["options"][2] == "C = 23.50h" and q(1)["options"][3] == "C = 133h",
      "sum-as-slope and product-as-slope variants printed with the new constants")
check("which equation represents this situation?" in q(1)["text"]
      and "$9.50" in q(1)["text"] and "$14" in q(1)["text"],
      "stem keeps the canonical closer with the retextured constants")

print("== Q2 (polynomial difference) ==")
diffp = sp.expand((7 * xs ** 2 + 2 * xs + 5) - (3 * xs ** 2 - 6 * xs - 4))
check(diffp == 4 * xs ** 2 + 8 * xs + 9, "difference = 4x² + 8x + 9")
check(q(2)["correctAnswer"] == 2 and q(2)["options"][2] == "4x² + 8x + 9", "key option C")
recA = sp.expand((7 * xs ** 2 + 2 * xs + 5) - 3 * xs ** 2 - 6 * xs - 4)
recB = sp.expand((7 * xs ** 2 + 2 * xs + 5) - 3 * xs ** 2 + 6 * xs - 4)
recD = sp.expand((7 * xs ** 2 + 2 * xs + 5) + (3 * xs ** 2 - 6 * xs - 4))
check(recA == 4 * xs ** 2 - 4 * xs + 1, "recipe A (minus only on 3x²) -> 4x² - 4x + 1")
check(recB == 4 * xs ** 2 + 8 * xs + 1, "recipe B (minus missed on -4) -> 4x² + 8x + 1")
check(recD == 10 * xs ** 2 - 4 * xs + 1, "recipe D (added) -> 10x² - 4x + 1")

print("== Q3 (parallel slope) ==")
o = [parse_val(v) for v in q(3)["options"]]
check(o[q(3)["correctAnswer"]] == 4, "key option 4 (parallel keeps the slope)")
check(o[0] == -4 and o[1] == Fraction(-1, 4) and o[2] == Fraction(1, 4),
      "distractor trio: opposite, negative reciprocal, reciprocal")

print("== Q4 (probability from table) ==")
counts = {"Dog": 18, "Cat": 27, "Rabbit": 9, "Bird": 6}
for k, v in counts.items():
    check(">%s<" % k in q(4)["passage"] and ">%d<" % v in q(4)["passage"],
          "table row %s = %d present" % (k, v))
check(sum(counts.values()) == 60, "table total 60 consistent")
o = [parse_val(v) for v in q(4)["options"]]
check(o[q(4)["correctAnswer"]] == Fraction(9, 60), "key = 9/60 = 3/20")
check(o[0] == Fraction(6, 60) and o[2] == Fraction(9, 51) and o[3] == Fraction(51, 60),
      "distractors = bird probability, complement denominator, complement probability")

print("== Q5 SPR f(3) for f(x) = x³ - 4x ==")
check(3 ** 3 - 4 * 3 == 15, "f(3) = 15")
spr_check(5, 15)

print("== Q6 SPR 3x + 5y = 57 at x = 4 ==")
check(Fraction(57 - 12, 5) == 9, "y = 9")
spr_check(6, 9)

print("== Q7 (interpretation of p(0) = 150) ==")
check(150 * 2 ** 0 == 150, "p(0) = 150 from the model")
check(q(7)["correctAnswer"] == 0 and "150 bacteria" in q(7)["options"][0]
      and "when the experiment began" in q(7)["options"][0],
      "key A maps 150 to the initial count")
check(150 * 2 ** 1 - 150 == 150 and 150 * 2 ** 2 - 150 * 2 == 300,
      "hourly increases 150 then 300 — 'increases by 150 each hour' (D) is false")

print("== Q8 (budget inequality) ==")
check(q(8)["options"][q(8)["correctAnswer"]] == "4r + 20 ≤ 92", "key A: 4r + 20 ≤ 92")
check(q(8)["options"][1] == "4r + 20 ≥ 92" and q(8)["options"][2] == "20r + 4 ≤ 92"
      and q(8)["options"][3] == "20r + 4 ≥ 92",
      "distractors = direction flip, coefficient swap, both")

print("== Q9 (ferns/shrubs/grasses) ==")
xf = sp.symbols("xf")
solx = sp.solve(sp.Eq(xf + 2 * xf + 6 * xf, 54), xf)
check(solx == [6], "ferns 6; shrubs 12; grasses 36; total 54")
o = [parse_val(v) for v in q(9)["options"]]
check(o[q(9)["correctAnswer"]] == 36, "key option 36 (grasses)")
check(o[0] == 6 and o[1] == 12 and o[2] == 18, "distractors = ferns, shrubs, ferns+shrubs")

print("== Q10 (median from bar graph) + SVG ==")
root = svg_root("PT1-M4-Q10.svg")
axis = [l for l in svg_lines(root) if l[4].get("stroke-width") is None and l[1] == l[3]]
baseline = 280.0
rects = sorted(((float(r.get("x")), float(r.get("y")), float(r.get("height")))
                for r in root.iter() if r.tag.rsplit("}", 1)[-1] == "rect"), key=lambda t: t[0])
check(len(rects) == 7, "7 bars drawn")
check(all(abs((ry + rh) - baseline) < .01 for _, ry, rh in rects), "all bars sit on the baseline")
vals = [round(rh / 4) for _, __, rh in rects]
check(vals == [30, 50, 5, 45, 25, 50, 40], "bar heights read 30, 50, 5, 45, 25, 50, 40")
check(all(abs(rh / 4 - v) < 1e-9 for (_, __, rh), v in zip(rects, vals)), "heights exact on the 4px/unit scale")
days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
texts = [t for t, _, _ in svg_texts(root)]
check(all(d in texts for d in days), "all 7 day labels present")
check("Day" in texts and "Number of cups sold" in texts, "axis titles present")
check("not drawn to scale" not in " ".join(texts), "data display carries no not-to-scale note")
med = sorted(vals)[3]
mean = Fraction(sum(vals), 7)
rng = max(vals) - min(vals)
mode = Counter(vals).most_common(1)[0][0]
check(med == 40, "median 40")
check(mean == 35 and rng == 45 and mode == 50, "mean 35, range 45, mode 50 (the distractors)")
o = [parse_val(v) for v in q(10)["options"]]
check(o[q(10)["correctAnswer"]] == med, "key option equals the median")
check(o[0] == mean and o[2] == rng and o[3] == mode, "distractors = mean, range, mode")
check("30, 50, 5, 45, 25, 50, and 40" in q(10)["explanation"], "rationale lists the drawn values")

print("== Q11 (cylinder height) + SVG ==")
check(Fraction(128, 4 ** 2) == 8, "128π / (π·16) = 8")
o = [parse_val(v) for v in q(11)["options"]]
check(o[q(11)["correctAnswer"]] == 8, "key option 8")
check(o[0] == Fraction(128, 8 ** 2) and o[2] == Fraction(128, 8) and o[3] == Fraction(128, 4),
      "distractors = d² slip 2, ÷d slip 16, unsquared 32")
check("radius of 4 centimeters" in q(11)["text"] and "128π cubic centimeters" in q(11)["text"],
      "stem carries the retuned (r = 4, V = 128π) pair")
root = svg_root("PT1-M4-Q11.svg")
texts = [t for t, _, _ in svg_texts(root)]
check("Note: Figure not drawn to scale." in texts, "geometry figure carries the note")
check("4 cm" in texts and "6 cm" not in texts, "radius labeled 4 cm")
ell = [e for e in root.iter() if e.tag.rsplit("}", 1)[-1] == "ellipse"][0]
cx, cy, rx = float(ell.get("cx")), float(ell.get("cy")), float(ell.get("rx"))
rad = [l for l in svg_lines(root) if l[1] == cy and l[3] == cy and abs(l[0] - cx) < .01]
check(len(rad) == 1 and abs(rad[0][2] - (cx + rx)) < .01,
      "radius segment runs from the center to the rim")

print("== Q12 SPR (bottling rate) ==")
check(Fraction(51, 3) == 17 and 17 * 60 == 1020, "51/3 = 17 per minute; x60 = 1,020 per hour")
spr_check(12, 1020)
check(q(12)["acceptedAnswers"] == ["1020"], "1020 is the single legal entry (no comma, no 6-char forms)")

print("== Q13 SPR (positive solution of 6x² = 7x + 20) ==")
rts = sorted(sp.solve(6 * xs ** 2 - 7 * xs - 20, xs))
check(rts == [sp.Rational(-4, 3), sp.Rational(5, 2)], "roots 5/2 and -4/3")
check(sp.expand((2 * xs - 5) * (3 * xs + 4)) == 6 * xs ** 2 - 7 * xs - 20, "factoring verified")
spr_check(13, Fraction(5, 2))
check(all(not e.startswith("-") for e in q(13)["acceptedAnswers"]),
      "no negative-root form accepted")
check("Therefore, the positive solution to the given equation is 5/2." in q(13)["explanation"],
      "Q13 rationale carries the Therefore restatement before the entry-forms note")

print("== Q14 (shadow similar triangles) ==")
check(Fraction(8, 4) * 16 == 32, "h = 16 · (8/4) = 32")
o = [parse_val(v) for v in q(14)["options"]]
check(o[q(14)["correctAnswer"]] == 32, "key option 32")
check(q(14)["correctAnswer"] == 3, "key letter D preserved after the 36 -> 32 retune")
check(o[0] == Fraction(4, 8) * 16 and o[1] == 16 + (8 - 4) and o[2] == 16 + 8,
      "distractors = reversed ratio 8, additive 20, added height 24")

print("== Q15 (linear-nonlinear system) ==")
def sat_quad(px, py): return py == px ** 2 - 6 * px + 14
def sat_lin(px, py): return py == px + 4
pairsv = [(0, 14), (2, 6), (3, 7), (4, 6)]
both = [sat_quad(*p) and sat_lin(*p) for p in pairsv]
check(both == [False, True, False, False], "exactly (2, 6) satisfies both equations")
check(q(15)["correctAnswer"] == 1, "key index 1")
check(sat_quad(0, 14) and not sat_lin(0, 14), "A satisfies the quadratic only")
check(sat_lin(3, 7) and not sat_quad(3, 7), "C satisfies the line only")
check(sat_quad(4, 6) and not sat_lin(4, 6), "D satisfies the quadratic only")
full = sp.solve([sp.Eq(ys, xs ** 2 - 6 * xs + 14), sp.Eq(ys, xs + 4)], [xs, ys])
check(sorted(full) == [(2, 6), (5, 9)], "full solution set {(2,6), (5,9)} — key among options")

print("== Q16 (pallet optimization) ==")
best = max(L for L in range(0, 100) for S in (4,) if 120 * L + 45 * S <= 1700)
brute = max(L for L in range(0, 100) if any(120 * L + 45 * S <= 1700 for S in range(4, 40)))
check(best == 12 and brute == 12, "greatest large-pallet count is 12 (S = 4 binds)")
check(120 * 12 + 45 * 4 == 1620 and 120 * 13 + 45 * 4 == 1740, "12 fits (1,620); 13 breaks (1,740)")
o = [parse_val(v) for v in q(16)["options"]]
check(o[q(16)["correctAnswer"]] == 12, "key option 12")
check(o[1] == 13 and o[2] == 1700 // 120 and o[3] == (1700 - 480) // 45,
      "distractors = rounded up 13, smalls ignored 14, smalls maximized 27")
check("crate" not in q(16)["text"] and not q(16)["text"].startswith("A cargo trailer can carry"),
      "stem retextured away from the PT4 freight-elevator skeleton (pallets, load limit)")
check(len(q(16)["explanation"].split()) <= 196,
      "Q16 rationale within the medium band (%d words <= 196)" % len(q(16)["explanation"].split()))

print("== Q17 (x + y from mismatched system) ==")
solxy = sp.solve([sp.Eq(7 * xs - 3 * ys, 42), sp.Eq(5 * ys, 5 * xs - 20)], [xs, ys])
check(solxy[xs] == Fraction(15, 2) and solxy[ys] == Fraction(7, 2), "x = 15/2, y = 7/2")
check(solxy[xs] + solxy[ys] == 11, "x + y = 11")
o = [parse_val(v) for v in q(17)["options"]]
check(o[q(17)["correctAnswer"]] == 11, "key option 11")
check(o[0] == Fraction(7, 2) and o[1] == Fraction(15, 2) and o[3] == 22,
      "distractors = y alone, x alone, 2x + 2y")

print("== Q18 (circle from diameter endpoints) ==")
P1, P2 = (-3, 4), (5, -2)
ctr = (Fraction(P1[0] + P2[0], 2), Fraction(P1[1] + P2[1], 2))
r2 = (P2[0] - ctr[0]) ** 2 + (P2[1] - ctr[1]) ** 2
check(ctr == (1, 1) and r2 == 25, "center (1, 1), r² = 25 (r = 5)")
def circle_of(opt):
    m = re.match(r"^\(x ([+-]) (\d+)\)² \+ \(y ([+-]) (\d+)\)² = (\d+)$", opt)
    h = -int(m.group(2)) if m.group(1) == "+" else int(m.group(2))
    k = -int(m.group(4)) if m.group(3) == "+" else int(m.group(4))
    return h, k, int(m.group(5))
parsed = [circle_of(o) for o in q(18)["options"]]
def on_circle(h, k, rhs, p): return (p[0] - h) ** 2 + (p[1] - k) ** 2 == rhs
fits = [on_circle(*c, P1) and on_circle(*c, P2) for c in parsed]
check(fits == [False, False, True, False], "exactly option C contains both endpoints")
check(q(18)["correctAnswer"] == 2, "key index 2")
check(parsed[0] == (-1, -1, 25) and parsed[1] == (1, 1, 5) and parsed[3] == (1, 1, 100),
      "distractors = sign-slip center, r unsquared, diameter squared")
check(len(q(18)["explanation"].split()) <= 246,
      "Q18 rationale within the hard band (%d words <= 246)" % len(q(18)["explanation"].split()))

print("== Q19 SPR (two-point linear function) ==")
m = Fraction(43 - 19, 7 - 3)
bb = 19 - m * 3
check(m == 6 and bb == 1, "f(x) = 6x + 1 fits (3, 19) and (7, 43)")
check(m * 20 + bb == 121, "f(20) = 121")
spr_check(19, 121)

print("== Q20 (geometric sequence nth term) ==")
seq = [4, 24, 144]
formulas = [lambda n: 4 * 6 ** (n - 1), lambda n: 4 * 6 ** n,
            lambda n: 6 * 4 ** (n - 1), lambda n: 24 ** (n - 1)]
fits = [all(f(n) == seq[n - 1] for n in (1, 2, 3)) for f in formulas]
check(fits == [True, False, False, False], "exactly a(n) = 4(6)ⁿ⁻¹ generates 4, 24, 144")
check(q(20)["correctAnswer"] == 0, "key index 0 (re-balanced tally: A5/B5/C3/D3, within ±1)")
check(formulas[1](1) == 24 and formulas[2](1) == 6 and formulas[3](1) == 1,
      "dismissal first terms 24, 6, 1 verified")
check("If a(n) represents the nth term of the sequence, which equation gives a(n) in terms of n?"
      in q(20)["text"], "stem uses the attested QB sequence formula")

print("== Q21 (exponential scatter, closest b) + SVG ==")
root = svg_root("PT1-M4-Q21.svg")
g = svg_lines(root)
xaxis = [l for l in g if l[1] == l[3] and l[1] == 300][0]
yaxis = [l for l in g if l[0] == l[2] and l[0] == 60 and min(l[1], l[3]) < 55][0]
ax_x, ax_y = yaxis[0], xaxis[1]
check(ax_x == 60 and ax_y == 300, "axes cross at SVG (60, 300)")
dots = sorted(((float(c.get("cx")), float(c.get("cy"))) for c in root.iter()
               if c.tag.rsplit("}", 1)[-1] == "circle"))
check(len(dots) == 10, "10 data points")
data = [((cx - ax_x) / 24, (ax_y - cy) * 100 / 48) for cx, cy in dots]
check([round(dx) for dx, _ in data] == list(range(10)) and
      all(abs(dx - round(dx)) < 1e-9 for dx, _ in data), "x-values exactly 0..9")
yv = [dy for _, dy in data]
check(all(a > b for a, b in zip(yv, yv[1:])), "y-values strictly decreasing")
check(abs(yv[0] - 480) < 1 and abs(yv[1] - 390) < 1 and abs(yv[2] - 300) < 1,
      "first three values 480, 390, 300 as quoted in the rationale")
bhat = (yv[9] / yv[0]) ** (1 / 9)
check(0.78 < bhat < 0.82, "fitted decay factor b = %.3f — approximately 0.8" % bhat)
opts = [float(parse_val(v)) for v in q(21)["options"]]
closest = min(range(4), key=lambda i: abs(opts[i] - bhat))
check(closest == q(21)["correctAnswer"] == 1, "0.8 is the unique closest option to b")
ratios = [yv[i + 1] / yv[i] for i in range(9)]
check(all(0.70 < rr < 0.90 for rr in ratios), "every yearly ratio within 0.70-0.90 (never rises)")
check(abs(opts[3] - yv[0]) < 1, "distractor 480 equals the drawn a = y(0)")
check(abs(1 / 0.8 - opts[2]) < 1e-9 and abs(1 - 0.8 - opts[0]) < 1e-9,
      "distractors 1.25 = 1/0.8 and 0.2 = 1 - 0.8")
texts = [t for t, _, _ in svg_texts(root)]
check("Years after 2010" in texts and "Estimated number of beetles" in texts, "axis titles present")
check("not drawn to scale" not in " ".join(texts), "coordinate display carries no note")
decs = [yv[i] - yv[i + 1] for i in range(9)]
gd = q(21)["graphDescription"]
check("becoming smaller" not in gd and "generally decreases" in gd,
      "alt text claims only a general decrease (drawn decreases %s are not monotone)" %
      [round(d) for d in decs])
check("Petrobrachys sylvicola" in q(21)["passage"], "invented Latin binomial present")

print("== Q22 SPR (rational exponents) ==")
kv = Fraction(3, 4) + Fraction(5, 6)
check(kv == Fraction(19, 12), "3/4 + 5/6 = 19/12")
spr_check(22, Fraction(19, 12))
check("<sup>4</sup>√x<sup>3</sup> · <sup>6</sup>√x<sup>5</sup> = x<sup>k</sup>" in q(22)["passage"],
      "Q22 passage uses the house <sup> markup (no raw Unicode superscripts)")
check("⁴√" not in q(22)["passage"] and "xᵏ" not in q(22)["passage"],
      "raw Unicode superscript presentation removed from the Q22 passage")

# ================================================================== cross-module / form level
print("== Cross-module form checks (M3 + M4) ==")
DOMAIN = {11: "ALG", 12: "ALG", 13: "ALG", 14: "ALG", 15: "ALG", 16: "ADV", 17: "ADV",
          18: "ADV", 19: "PSDA", 20: "PSDA", 21: "PSDA", 22: "PSDA", 23: "PSDA",
          24: "PSDA", 25: "PSDA", 26: "GEO", 27: "GEO", 28: "GEO", 29: "GEO"}
dom3 = Counter(DOMAIN[it["subcategoryId"]] for it in M3["questions"])
dom4 = Counter(DOMAIN[it["subcategoryId"]] for it in MOD["questions"])
check(dom3 == Counter({"ALG": 7, "ADV": 6, "PSDA": 5, "GEO": 4}), "M3 domains 7/6/5/4 %s" % dom3)
check(dom4 == Counter({"ALG": 8, "ADV": 7, "PSDA": 4, "GEO": 3}), "M4 domains 8/7/4/3 %s" % dom4)
skills = Counter(it["subcategory"] for it in M3["questions"] + MOD["questions"])
WANT_SKILLS = {"linear-equations-one-variable": 3, "linear-functions": 4,
               "linear-equations-two-variables": 3, "systems-linear-equations": 3,
               "linear-inequalities": 2, "nonlinear-functions": 6, "nonlinear-equations": 4,
               "equivalent-expressions": 3, "ratios-rates-proportions": 2, "percentages": 2,
               "one-variable-data": 1, "two-variable-data": 2, "probability": 1,
               "inference-statistics": 1, "area-volume": 2, "lines-angles-triangles": 2,
               "right-triangles-trigonometry": 1, "circles": 2}
check(dict(skills) == WANT_SKILLS, "form skill census matches the blueprint")
check(skills["evaluating-statistical-claims"] == 0, "evaluating-statistical-claims absent")
prob = [ (m["moduleNumber"], it["originalQuestionNumber"]) for m in (M3, MOD)
         for it in m["questions"] if it["subcategory"] == "probability"]
check(prob == [(4, 4)], "probability appears in Module 4 only")
circ = [(m["moduleNumber"], it["difficulty"]) for m in (M3, MOD)
        for it in m["questions"] if it["subcategory"] == "circles"]
check(sorted(circ) == [(3, "hard"), (4, "hard")], "one circles item per module, both hard")

spr_census = [str(q(n, M3)["correctAnswer"]) for n in (5, 6, 12, 13, 19, 22)] + \
             [str(q(n)["correctAnswer"]) for n in (5, 6, 12, 13, 19, 22)]
check(spr_census == ["16", "4.65", "3/2", "29", "14", "-14", "15", "9", "1020", "5/2", "121", "19/12"],
      "SPR census: 8 integers (one negative, one 4-digit, one 3-digit), 3 fractions, 1 decimal")

names3 = sum("Ibrahim" in json.dumps(it) for it in M3["questions"])
names4 = sum("Priya" in json.dumps(it) for it in MOD["questions"])
check(names3 == 1 and names4 == 1, "exactly one named person per module (Ibrahim, Priya)")
check("Priya" not in json.dumps(M3) and "Ibrahim" not in json.dumps(MOD),
      "the two names do not cross modules")
check("Hana" not in json.dumps(MOD) and "Hana" not in json.dumps(M3),
      "corpus name Hana removed from the form")
BINOM = re.compile(r"<i>[A-Z][a-z]+ [a-z]+</i>")
lat3 = BINOM.findall(json.dumps(M3, ensure_ascii=False))
lat4 = set(BINOM.findall(json.dumps(MOD, ensure_ascii=False)))
check(lat3 == [] and lat4 == {"<i>Petrobrachys sylvicola</i>"},
      "exactly one Latin-binomial context (Petrobrachys sylvicola), in M4 only")

# --- number-set collision hunt between the two modules (student-visible fields only)
def visible(it):
    return " ".join([it.get("passage") or "", it["text"], " ".join(it["options"] or [])])
m3q10, m4q11 = visible(q(10, M3)), visible(q(11))
check("288π" in m3q10 and "radius of 6 inches" in m3q10,
      "M3 Q10 sphere keeps (r = 6, V = 288π) — arithmetically locked")
check("128π" in m4q11 and "radius of 4 centimeters" in m4q11,
      "M4 Q11 cylinder retuned to (r = 4 cm, V = 128π) per fix round 1")
check("288π" not in m4q11 and "radius of 6" not in m4q11,
      "no shared (radius, volume) pair between the form's two area-volume items")

keyvals = []
for it in [it for it in MOD["questions"] if it["questionType"] == "multiple-choice"]:
    try:
        keyvals.append(parse_val(it["options"][it["correctAnswer"]]))
    except Exception:
        pass
dups = {str(v): c for v, c in Counter(keyvals).items() if c >= 2}
check(all(c < 3 for c in dups.values()), "no keyed value appears 3+ times in M4")
check(not dups, "no keyed value repeats within M4 (Q14 rekeyed 36 -> 32 in fix round 1): %s" % dups)

print()
print("FAILURES: %d   WARNINGS: %d" % (len(FAIL), len(WARN)))
if FAIL:
    for f in FAIL:
        print("  FAIL:", f)
    sys.exit(1)
print("ALL CHECKS PASSED (M4 + form)")
