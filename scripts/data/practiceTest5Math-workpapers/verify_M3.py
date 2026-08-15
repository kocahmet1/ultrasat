#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
verify_M3.py — full mathematical + structural verification of ULTRASAT PT5 Math Module 3 (M3.json).

For every item it (a) recomputes the correct answer from the givens, (b) re-derives each
distractor from its named error recipe and confirms it differs from the key, (c) checks
numeric MC option sets are strictly ascending, and (d) checks every SPR acceptedAnswers
entry is a correct value under the app's 5-character rule (6 with a minus sign).
Module level: blueprint quotas (domain/skill/format/visual/applied), SPR positions and the
SPR answer-form census, the difficulty curve, key-letter balance, plain-text options,
DOMPurify-safe HTML, rationale liturgy, and the three SVG figures (parsed and re-measured).

Run:  python3 verify_M3.py     (exits 0 and prints ALL CHECKS PASSED on success)
Requires sympy:  pip install sympy --break-system-packages
"""
import json, os, re, sys, statistics, xml.etree.ElementTree as ET
from fractions import Fraction

try:
    import sympy as sp
except ImportError:
    print("sympy not installed — run: pip install sympy --break-system-packages")
    sys.exit(2)

from sympy.parsing.sympy_parser import (parse_expr, standard_transformations,
                                        implicit_multiplication_application)
TRANS = standard_transformations + (implicit_multiplication_application,)

HERE = os.path.dirname(os.path.abspath(__file__))
with open(os.path.join(HERE, "M3.json"), encoding="utf-8") as f:
    MOD = json.load(f)

FAIL = []
def check(cond, label):
    if cond:
        print(f"  PASS  {label}")
    else:
        print(f"  FAIL  {label}")
        FAIL.append(label)

def q(n):
    return next(it for it in MOD["questions"] if it["originalQuestionNumber"] == n)

def parse_math(s):
    """Parse a plain-text option like '18x⁸' or '-(3/2)x + 22' into a sympy expression."""
    sup = {"⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4",
           "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9"}
    out, i = [], 0
    while i < len(s):
        ch = s[i]
        if ch in sup:
            digits = ""
            while i < len(s) and s[i] in sup:
                digits += sup[s[i]]
                i += 1
            out.append("**" + digits)
            continue
        out.append(ch)
        i += 1
    t = "".join(out).replace(",", "").replace("−", "-")
    return parse_expr(t, transformations=TRANS)

def opt_nums(item):
    return [float(o.replace("%", "").replace(",", "").replace("π", "")) for o in item["options"]]

def strictly_ascending(vals):
    return all(a < b for a, b in zip(vals, vals[1:]))

STRIP_TAGS = re.compile(r"</?[A-Za-z][^>]*>")
DISPLAY_EQ = re.compile(r"<div style=\"text-align:center[^\"]*\">.*?</div>", re.S)
DATA_TABLE = re.compile(r"<table.*?</table>", re.S)

def rat_words(s):
    """Rationale length, HONEST RULER (round-2 instrument repair): every
    whitespace-delimited token counts. The previous version kept only tokens
    containing [A-Za-z0-9], which silently discarded the operator tokens
    '+', '-', '=' and read a 190-word rationale as 148."""
    return len([t for t in re.split(r"\s+", s.strip()) if t])

def stem_words(item):
    """Spec 2b prose words, HONEST RULER (round-2 instrument repair): every
    whitespace-delimited token of the tag-stripped stem counts, numerals
    included. The previous version kept only tokens containing a letter, which
    discarded every numeral and read 36-word stems as 33.
    Non-prose stimuli are excluded, as '2b prose words' requires: displayed
    equations (already excluded before) and HTML data tables (whose cell values
    are tabular data, not stem prose)."""
    blob = (item.get("passage") or "") + " " + (item.get("text") or "")
    blob = DATA_TABLE.sub(" ", DISPLAY_EQ.sub(" ", blob))
    return len([t for t in re.split(r"\s+", STRIP_TAGS.sub(" ", blob).strip()) if t])

# instrument self-test: the ruler must not drop numerals or operators
print("== Length ruler (instrument self-test) ==")
check(rat_words("Adding a + b = 9 yields 2a = 6.") == 10,
      "rat_words counts every whitespace token (operators and numerals included)")
check(stem_words({"passage": None, "text": "If 3 + 4 = 7, what is 2x?"}) == 9,
      "stem_words counts every whitespace token (numerals and operators included)")

x, y_, k_ = sp.symbols("x y k")

# ---------------------------------------------------------------- module shell
print("== Module shell ==")
check(MOD["moduleNumber"] == 3 and MOD["section"] == "Math", "moduleNumber 3 / section Math")
check(MOD["title"] == "Exam 5, Module 3", "title 'Exam 5, Module 3'")
check(MOD["calculatorAllowed"] is True and MOD["timeLimit"] == 2100, "calculatorAllowed true, timeLimit 2100")
check(len(MOD["questions"]) == 22, "22 questions")
check([it["originalQuestionNumber"] for it in MOD["questions"]] == list(range(1, 23)),
      "originalQuestionNumber 1..22 in order")

spr = [it["originalQuestionNumber"] for it in MOD["questions"] if it["questionType"] == "user-input"]
check(spr == [5, 6, 12, 13, 19, 22], f"SPR positions {spr} == [5, 6, 12, 13, 19, 22]")
mc = [it for it in MOD["questions"] if it["questionType"] == "multiple-choice"]
check(len(mc) == 16, "16 MC + 6 SPR")
check(all(len(it["options"]) == 4 for it in mc), "every MC has exactly 4 options")

diffs = [it["difficulty"] for it in MOD["questions"]]
# monotone ramp WITH the one honest dip the spec licenses (medium at Q8, easy straggler at Q9)
expected_curve = ["easy"]*7 + ["medium"] + ["easy"] + ["medium"]*7 + ["hard"]*6
check(diffs == expected_curve,
      "difficulty ramp E x7, M at Q8, E straggler at Q9, M x7 (Q10-16), H x6 (Q17-22)")
check(diffs[7] == "medium" and diffs[8] == "easy",
      "ramp carries exactly one dip (Q8 medium before Q9 easy), not a perfect step function")
check((diffs.count("easy"), diffs.count("medium"), diffs.count("hard")) == (8, 8, 6),
      "PT5 M3 difficulty mix 8E / 8M / 6H")
check([q(n)["difficulty"] for n in spr] == ["easy", "easy", "medium", "medium", "hard", "hard"],
      "SPR difficulty by position E/E/M/M/H/H")

tally = {L: 0 for L in "ABCD"}
for it in mc:
    tally["ABCD"[it["correctAnswer"]]] += 1
check(all(tally[L] == 4 for L in "ABCD"), f"key-letter tally {tally} == 4/4/4/4")

# ---------------------------------------------------------------- blueprint quotas
print("== Blueprint quotas ==")
SUBIDS = {"linear-equations-one-variable": 11, "linear-functions": 12,
          "linear-equations-two-variables": 13, "systems-linear-equations": 14,
          "linear-inequalities": 15, "nonlinear-functions": 16, "nonlinear-equations": 17,
          "equivalent-expressions": 18, "ratios-rates-proportions": 19, "percentages": 20,
          "one-variable-data": 21, "two-variable-data": 22, "probability": 23,
          "inference-statistics": 24, "evaluating-statistical-claims": 25, "area-volume": 26,
          "lines-angles-triangles": 27, "right-triangles-trigonometry": 28, "circles": 29}
DOMAIN = {11: "ALG", 12: "ALG", 13: "ALG", 14: "ALG", 15: "ALG",
          16: "ADV", 17: "ADV", 18: "ADV",
          19: "PSDA", 20: "PSDA", 21: "PSDA", 22: "PSDA", 23: "PSDA", 24: "PSDA", 25: "PSDA",
          26: "GEO", 27: "GEO", 28: "GEO", 29: "GEO"}
check(all(SUBIDS[it["subcategory"]] == it["subcategoryId"] for it in MOD["questions"]),
      "subcategory -> subcategoryId map correct on all 22 items")
dom = {}
for it in MOD["questions"]:
    d = DOMAIN[it["subcategoryId"]]
    dom[d] = dom.get(d, 0) + 1
check(dom == {"ALG": 7, "ADV": 7, "PSDA": 4, "GEO": 4},
      f"domain quota {dom} == ALG 7 / ADV 7 / PSDA 4 / GEO 4")
skills = {}
for it in MOD["questions"]:
    skills[it["subcategory"]] = skills.get(it["subcategory"], 0) + 1
EXPECT_SKILLS = {"linear-equations-one-variable": 2, "linear-functions": 2,
                 "linear-equations-two-variables": 1, "systems-linear-equations": 1,
                 "linear-inequalities": 1, "nonlinear-functions": 4, "nonlinear-equations": 2,
                 "equivalent-expressions": 1, "ratios-rates-proportions": 1, "percentages": 1,
                 "one-variable-data": 2, "area-volume": 1, "lines-angles-triangles": 1,
                 "right-triangles-trigonometry": 1, "circles": 1}
check(skills == EXPECT_SKILLS, f"skill quota matches blueprint row-by-row ({len(skills)} skills)")
check("probability" not in skills, "no probability item (Module 4 only)")
check("evaluating-statistical-claims" not in skills and "inference-statistics" not in skills,
      "no evaluating-statistical-claims and no inference-statistics (PT5 sets inference to 0)")
check(skills.get("circles", 0) >= 1, "at least one circles item per module")

BP_SLOTS = {1: ("linear-equations-one-variable", "easy", "multiple-choice"),
            2: ("ratios-rates-proportions", "easy", "multiple-choice"),
            3: ("equivalent-expressions", "easy", "multiple-choice"),
            4: ("nonlinear-functions", "easy", "multiple-choice"),
            5: ("linear-functions", "easy", "user-input"),
            6: ("area-volume", "easy", "user-input"),
            7: ("one-variable-data", "easy", "multiple-choice"),
            8: ("linear-functions", "medium", "multiple-choice"),
            9: ("lines-angles-triangles", "easy", "multiple-choice"),
            10: ("linear-inequalities", "medium", "multiple-choice"),
            11: ("percentages", "medium", "multiple-choice"),
            12: ("nonlinear-equations", "medium", "user-input"),
            13: ("right-triangles-trigonometry", "medium", "user-input"),
            14: ("nonlinear-functions", "medium", "multiple-choice"),
            15: ("nonlinear-functions", "medium", "multiple-choice"),
            16: ("circles", "medium", "multiple-choice"),
            17: ("systems-linear-equations", "hard", "multiple-choice"),
            18: ("one-variable-data", "hard", "multiple-choice"),
            19: ("nonlinear-functions", "hard", "user-input"),
            20: ("linear-equations-one-variable", "hard", "multiple-choice"),
            21: ("nonlinear-equations", "hard", "multiple-choice"),
            22: ("linear-equations-two-variables", "hard", "user-input")}
for n, (sk, df, ft) in BP_SLOTS.items():
    it = q(n)
    check((it["subcategory"], it["difficulty"], it["questionType"]) == (sk, df, ft),
          f"Q{n} slot == blueprint ({sk} / {df} / {ft})")

vis = [(it["originalQuestionNumber"], it["graphAsset"]) for it in MOD["questions"] if it["graphAsset"]]
check(vis == [(7, "PT5-M3-Q07.svg"), (9, "PT5-M3-Q09.svg"), (15, "PT5-M3-Q15.svg")],
      f"SVG-stimulus items {vis} == Q7 dot plot, Q9 geometry, Q15 parabola")
check("<table" in (q(8)["passage"] or ""), "Q8 carries the HTML data table (not an SVG)")
check(q(8)["graphAsset"] is None, "Q8 graphAsset is null (table lives in the passage)")
check(len(vis) + 1 == 4, "visual quota = 4 (3 SVGs + 1 HTML table)")

APPLIED = [2, 6, 7, 10, 11, 14, 18]
def has_context(it):
    blob = ((it["passage"] or "") + " " + it["text"]).lower()
    return any(w in blob for w in ["orchard", "cistern", "chess", "creamery", "solar",
                                   "gondola", "test plot"])
check([it["originalQuestionNumber"] for it in MOD["questions"] if has_context(it)] == APPLIED,
      f"applied slots {APPLIED} exactly (7/22 = 32%)")

# ---------------------------------------------------------------- app format contract
print("== App format contract ==")
tagish = re.compile(r"</?[A-Za-z]")
check(all(not tagish.search(o) for it in mc for o in it["options"]), "options contain no HTML tags")
check(all("&" not in o for it in mc for o in it["options"]), "options contain no HTML entities")
check(all("$" not in o and "\\" not in o for it in mc for o in it["options"]),
      "options contain no LaTeX / dollar-math")
check(all("−" not in o for it in mc for o in it["options"]),
      "options use the ASCII hyphen for minus, never U+2212")
strip_tags = re.compile(r"</?[A-Za-z][^>]*>")
for it in MOD["questions"]:
    for field in ("passage", "text", "explanation"):
        v = it[field]
        if not v:
            continue
        bare = strip_tags.sub("", v)
        check("<" not in bare and ">" not in bare,
              f"Q{it['originalQuestionNumber']} {field} has no unescaped angle bracket")
check(all("$" not in (it["text"] or "") for it in MOD["questions"]), "no LaTeX in stems")
for it in MOD["questions"]:
    if it["passage"] and "<div" in it["passage"]:
        check("text-align:center" in it["passage"],
              f"Q{it['originalQuestionNumber']} displayed equation is centered")
check(q(17)["passage"].count("<div") == 2, "Q17 system stacks two centered equation divs")
tbl = q(8)["passage"]
check("border-collapse:collapse" in tbl and "border:1px solid #333" in tbl and "<th" in tbl,
      "Q8 table: border-collapse, 1px #333 borders, bold <th> headers")
check("The table shows" in tbl, "Q8 table has a lead-in sentence")
for it in MOD["questions"]:
    n = it["originalQuestionNumber"]
    if it["graphAsset"]:
        check(bool(it["graphDescription"]), f"Q{n} figure has alt text")
    else:
        check(it["graphDescription"] is None, f"Q{n} has no stray graphDescription")
for it in MOD["questions"]:
    n = it["originalQuestionNumber"]
    check(("_archetype" in it) and ("_trap" in it) and ("_distractorLogic" in it)
          and ("_sprForms" in it), f"Q{n} carries the authoring metadata fields")

# ---------------------------------------------------------------- rationale liturgy
print("== Rationale liturgy (spec section 7) ==")
for it in mc:
    n = it["originalQuestionNumber"]
    L = "ABCD"[it["correctAnswer"]]
    e = it["explanation"]
    check(e.startswith(f"Choice {L} is correct."), f"Q{n} opens 'Choice {L} is correct.'")
    others = [c for c in "ABCD" if c != L]
    pos = [e.find(f"Choice {c} is incorrect") for c in others]
    check(all(p > 0 for p in pos) and pos == sorted(pos),
          f"Q{n} dismisses {''.join(others)} in letter order")
    check("Therefore," in e, f"Q{n} rationale closes with a 'Therefore,' sentence")
    check("we " not in e.lower() and " you " not in e.lower() and "let's" not in e.lower(),
          f"Q{n} rationale has no first/second person")
for n in spr:
    it = q(n)
    e = it["explanation"]
    check(e.startswith("The correct answer is "), f"Q{n} SPR opens 'The correct answer is ...'")
    check("is incorrect" not in e, f"Q{n} SPR has no dismissals")
    check("Therefore," in e, f"Q{n} SPR closes with 'Therefore,'")
NONINT = {13}
for n in spr:
    note = "examples of ways to enter a correct answer" in q(n)["explanation"]
    check(note == (n in NONINT), f"Q{n} entry-forms note present iff the answer is non-integer")
check(sum("It’s given that" in it["explanation"] for it in MOD["questions"]) >= 13,
      "'It’s given that' (curly apostrophe) used on at least 13 items")
check(sum(it["explanation"].count("yields") for it in MOD["questions"]) >= 40,
      "'yields' used throughout the derivations")
# spec section 7 norms 110/135/170 (MC) and 40/100/130 (SPR), enforced at +/-45%
NORM_MC = {"easy": 110, "medium": 135, "hard": 170}
NORM_SPR = {"easy": 40, "medium": 100, "hard": 130}
for it in MOD["questions"]:
    n = it["originalQuestionNumber"]
    w = rat_words(it["explanation"])
    norm = (NORM_SPR if it["questionType"] == "user-input" else NORM_MC)[it["difficulty"]]
    lo, hi = int(0.55 * norm), int(1.45 * norm)
    check(lo <= w <= hi,
          f"Q{n} rationale {w} words within [{lo}, {hi}] (norm {norm}, ratio {w/norm:.2f})")

STEMCAP = {1: 35, 2: 55, 3: 15, 4: 35, 5: 35, 6: 55, 7: 55, 8: 35, 9: 35, 10: 55, 11: 55,
           12: 35, 13: 35, 14: 55, 15: 35, 16: 35, 17: 35, 18: 75, 19: 35, 20: 35, 21: 35, 22: 35}
for it in MOD["questions"]:
    n = it["originalQuestionNumber"]
    w = stem_words(it)
    check(w <= STEMCAP[n], f"Q{n} stem prose {w} words within cap {STEMCAP[n]}")

names = set()
for it in MOD["questions"]:
    for nm in re.findall(r"\b(Mateo|Nadia|Hector|Sofia|Amaya|Priya|Leo|Rosa|Hana|Isabel)\b",
                         (it["passage"] or "") + it["text"]):
        names.add(nm)
check(len(names) <= 2, f"named people {sorted(names)} within the 2-per-module cap")
check(not re.search(r"<i>[A-Z][a-z]+ [a-z]+</i>", json.dumps(MOD, ensure_ascii=False)),
      "no Latin binomial in Module 3 (the form's one binomial belongs to Module 4)")

# ---------------------------------------------------------------- SPR entry forms
print("== SPR acceptedAnswers (full legal-entry enumeration) ==")
def spr_entry_value_ok(entry, exact):
    if "/" in entry:
        return Fraction(entry) == Fraction(exact)
    v = Fraction(entry)
    if "." not in entry:
        return v == Fraction(exact)
    d = len(entry.split(".")[1])
    return abs(v - Fraction(exact)) < Fraction(1, 10**d)

from _spr_enum import spr_enumerate   # shared enumerator, also used by verify_M4.py

SPR_EXACT = {5: Fraction(11), 6: Fraction(216), 12: Fraction(9),
             13: Fraction(15, 17), 19: Fraction(201), 22: Fraction(-12)}
for n, val in SPR_EXACT.items():
    it = q(n)
    check(it["options"] == [] and isinstance(it["correctAnswer"], str), f"Q{n} SPR field shapes")
    full = spr_enumerate(val, it["correctAnswer"])
    check(it["acceptedAnswers"] == full,
          f"Q{n} acceptedAnswers == complete legal-entry set ({len(full)} forms)")
    check(it["acceptedAnswers"][0] == it["correctAnswer"], f"Q{n} canonical form listed first")
    check(Fraction(it["correctAnswer"]) == val, f"Q{n} canonical answer evaluates to the key value")
    for e in it["acceptedAnswers"]:
        limit = 6 if e.startswith("-") else 5
        check(len(e) <= limit, f"Q{n} entry '{e}' within the {limit}-character rule")
        check(spr_entry_value_ok(e, val), f"Q{n} entry '{e}' is a correct value")
# the enumerator is exhaustive: no legal string of the right length is missing
for n, val in SPR_EXACT.items():
    got = set(q(n)["acceptedAnswers"])
    extra = set()
    for qq in range(1, 200):
        p = val * qq
        if p.denominator == 1:
            s = f"{p.numerator}/{qq}"
            if len(s.lstrip('-')) + (1 if val < 0 else 0) <= (6 if val < 0 else 5) and len(s) <= (6 if val < 0 else 5):
                extra.add(s)
    check(extra <= got, f"Q{n} no legal equivalent fraction is missing (gap {sorted(extra - got)})")

ints = [n for n in spr if "/" not in q(n)["correctAnswer"] and "." not in q(n)["correctAnswer"]]
fracs = [n for n in spr if "/" in q(n)["correctAnswer"]]
negs = [n for n in spr if q(n)["correctAnswer"].startswith("-")]
check(len(ints) == 5 and len(fracs) == 1, f"M3 SPR census: {len(ints)} integers, {len(fracs)} fraction")
check(negs == [22], "exactly one negative SPR, at Q22 (the form's only negative)")
check(any(len(q(n)["correctAnswer"]) == 3 for n in ints), "at least one engineered 3-digit integer")
check(all("/" not in q(n)["correctAnswer"] and "." not in q(n)["correctAnswer"] for n in (5, 6, 12, 19)),
      "Q5, Q6, Q12 and Q19 are plain integers (the retired multi-root SPR is now a single integer)")

# ---------------------------------------------------------------- Q1
print("== Q1 linear solve, variable on both sides ==")
it = q(1)
sol = sp.solve(sp.Eq(7*x + 12, 3*x + 40), x)
check(sol == [7], "recompute: 7x + 12 = 3x + 40 gives x = 7")
d_echo, d_sign, d_partial = 12, Fraction(40 + 12, 4), 40 - 12
check(d_sign == 13 and d_partial == 28, "recipes: sign error (40+12)/4 = 13, 4x = 28")
check(len({7, d_echo, int(d_sign), d_partial}) == 4, "key and all three distractors distinct")
check(it["options"] == ["7", "12", "13", "28"] and it["correctAnswer"] == 0, "options / key index A")
check(strictly_ascending(opt_nums(it)), "numeric options strictly ascending")

# ---------------------------------------------------------------- Q2
print("== Q2 proportion solve ==")
it = q(2)
unit = Fraction(96, 4)
key = unit * 7
check(unit == 24 and key == 168, "96/4 = 24 apples per crate; 24 x 7 = 168")
d_unit, d_other, d_add = 24, 7*4, 96 + 7
check((d_unit, d_other, d_add) == (24, 28, 103), "recipes: unit rate 24, other member 7x4 = 28, sum 103")
check(len({int(key), d_unit, d_other, d_add}) == 4, "key and distractors distinct")
check(it["options"] == ["24", "28", "103", "168"] and it["correctAnswer"] == 3, "options / key index D")
check(strictly_ascending(opt_nums(it)), "ascending")

# ---------------------------------------------------------------- Q3
print("== Q3 product of powers ==")
it = q(3)
key_expr = sp.expand((2*x**5)*(9*x**3))
check(key_expr == 18*x**8, "recompute (2x^5)(9x^3) = 18x^8")
opts = [parse_math(o) for o in it["options"]]
check(sp.expand(opts[2] - key_expr) == 0 and it["correctAnswer"] == 2, "key 18x^8 at index C")
check(sp.expand(opts[0] - (11*x**8)) == 0, "A = added coefficients (2 + 9)")
check(sp.expand(opts[1] - (18*x**2)) == 0, "B = subtracted exponents (5 - 3)")
check(sp.expand(opts[3] - (18*x**15)) == 0, "D = multiplied exponents (5 x 3)")
check(all(sp.expand(o - key_expr) != 0 for i, o in enumerate(opts) if i != 2),
      "all distractors differ from the key")
coef_exp = [(sp.LC(o, x), sp.degree(o, x)) for o in opts]
check(coef_exp == sorted(coef_exp), "options ordered by coefficient, then exponent")

# ---------------------------------------------------------------- Q4
print("== Q4 evaluate an exponential ==")
it = q(4)
f4 = lambda v: 3*5**v
check(f4(2) == 75, "f(2) = 3(5)^2 = 75")
d_frag, d_mult, d_swap = 5**2, 3*5*2, 5*3**2
check((d_frag, d_mult, d_swap) == (25, 30, 45), "recipes: 5^2 = 25, 3x5x2 = 30, swap 5(3)^2 = 45")
check(len({75, d_frag, d_mult, d_swap}) == 4, "key and distractors distinct")
check(it["options"] == ["25", "30", "45", "75"] and it["correctAnswer"] == 3, "options / key index D")
check(strictly_ascending(opt_nums(it)), "ascending")

# ---------------------------------------------------------------- Q5 (SPR)
print("== Q5 SPR invert a linear function ==")
it = q(5)
sol = sp.solve(sp.Eq(6*x - 19, 47), x)
check(sol == [11] and it["correctAnswer"] == "11", "6x - 19 = 47 gives x = 11")
check(6*11 - 19 == 47, "back-substitution confirms f(11) = 47")

# ---------------------------------------------------------------- Q6 (SPR)
print("== Q6 SPR prism volume ==")
it = q(6)
L, W, H = 9, 4, 6
check(L*W*H == 216 and it["correctAnswer"] == "216", "V = (9)(4)(6) = 216")
check(2*(L*W + L*H + W*H) == 228 and 2*(L + W) == 26 and L*W == 36,
      "adjacent quantities (surface area 228, base perimeter 26, base area 36) differ from 216")

# ---------------------------------------------------------------- Q7
print("== Q7 dot plot read-off ==")
it = q(7)
DOTS = {2: 3, 3: 5, 4: 7, 5: 4, 6: 3, 7: 2}
check(sum(DOTS.values()) == 24, "dot plot totals the 24 stated members")
check(DOTS[5] == 4, "frequency at 5 games is 4 (key)")
at_least, fewer = sum(v for k, v in DOTS.items() if k >= 5), sum(v for k, v in DOTS.items() if k < 5)
check((at_least, fewer) == (9, 15), "recipes: 5 or more = 9, fewer than 5 = 15")
check(len({4, 5, at_least, fewer}) == 4, "key and distractors distinct")
check(it["options"] == ["4", "5", "9", "15"] and it["correctAnswer"] == 0, "options / key index A")
check(strictly_ascending(opt_nums(it)), "ascending")

# ---------------------------------------------------------------- Q8 (was Q9 before the ramp-dip swap)
print("== Q8 linear function from a table ==")
it = q(8)
TAB = [(2, 19), (6, 13), (10, 7), (14, 1)]
m = Fraction(TAB[1][1] - TAB[0][1], TAB[1][0] - TAB[0][0])
b = Fraction(TAB[0][1]) - m*TAB[0][0]
check(m == Fraction(-3, 2) and b == 22, "slope -3/2, y-intercept 22")
check(all(Fraction(yy) == m*xx + b for xx, yy in TAB), "all four table rows satisfy f(x) = -(3/2)x + 22")
rhss = [parse_math(o.split("=", 1)[1]) for o in it["options"]]
key_expr = sp.Rational(-3, 2)*x + 22
check(sp.simplify(rhss[0] - key_expr) == 0 and it["correctAnswer"] == 0, "key at index A")
check(sp.simplify(rhss[1] - (sp.Rational(-2, 3)*x + 22)) == 0, "B = reciprocal slope (dx/dy)")
check(sp.simplify(rhss[2] - (sp.Rational(3, 2)*x + 22)) == 0, "C = sign error on the slope")
check(sp.simplify(rhss[3] - (22*x - sp.Rational(3, 2))) == 0, "D = slope/intercept swap")
for i, r in enumerate(rhss):
    if i == 0:
        continue
    bad = [(xx, yy) for xx, yy in TAB if sp.simplify(r.subs(x, xx) - yy) != 0]
    check(len(bad) > 0, f"option {'ABCD'[i]} fails the table at {bad[:1]}")
slopes = [sp.Poly(r, x).all_coeffs()[0] for r in rhss]
check(slopes == sorted(slopes), "equation options ordered by slope, ascending")

# ---------------------------------------------------------------- Q9 (was Q8 before the ramp-dip swap)
print("== Q9 isosceles triangle angles ==")
it = q(9)
vertex = 80
base = Fraction(180 - vertex, 2)
check(base == 50, "base angles = (180 - 80)/2 = 50")
d_other, d_skip, d_supp = vertex, 180 - vertex, 180 - int(base)
check((d_other, d_skip, d_supp) == (80, 100, 130),
      "recipes: other angle 80, undivided sum 100, supplement 130")
check(len({int(base), d_other, d_skip, d_supp}) == 4, "key and distractors distinct")
check(it["options"] == ["50", "80", "100", "130"] and it["correctAnswer"] == 0, "options / key index A")
check(strictly_ascending(opt_nums(it)), "ascending")
check(vertex + 2*int(base) == 180, "angle sum verified: 80 + 50 + 50 = 180")

# ---------------------------------------------------------------- Q10
print("== Q10 bounded range — EXHAUSTIVE key-uniqueness proof ==")
it = q(10)
check(it["options"] == ["0 ≤ t ≤ 47", "47 ≤ t ≤ 51", "47 < t < 55", "47 ≤ t ≤ 55"],
      "option set varies the BOUNDS, not only the strictness symbols")
preds = {0: lambda t: 0 <= t <= 47, 1: lambda t: 47 <= t <= 51,
         2: lambda t: 47 < t < 55, 3: lambda t: 47 <= t <= 55}
check(it["correctAnswer"] == 3, "key D = 47 <= t <= 55")

# ---------------------------------------------------------------------------
# The stem asks which inequality is TRUE FOR ALL VALUES OF t, where t ranges over
# the recorded temperatures.  It fixes exactly this much: the recorded set T is a
# finite set with min(T) = 47 and max(T) = 55, i.e. {47, 55} <= T <= [47, 55].
# An option is defensible iff its predicate holds at EVERY member of T.
#
# The round-1 test here was unsound: it asked only whether an option ADMITS a
# non-recorded value (preds[1](12)), which does not falsify a statement
# universally quantified over the recorded values.  It is replaced by an
# exhaustive enumeration plus a closure argument over the reals.
#
# (1) GRID-EXHAUSTIVE.  Enumerate EVERY admissible data set drawn from the
#     half-degree grid on [47, 55]: 2^15 = 32,768 sets, the complete power set of
#     the 15 optional values, not a sample.  Count how many options each makes true.
GRID = [47.0 + 0.5 * i for i in range(17)]           # 47.0, 47.5, ..., 55.0 (exact in binary)
FREE = GRID[1:-1]                                     # the 15 values a data set may or may not contain
n_sets, bad, sig = 0, [], {}
for mask in range(1 << len(FREE)):
    T = [47.0, 55.0]
    m = mask
    j = 0
    while m:
        if m & 1:
            T.append(FREE[j])
        m >>= 1
        j += 1
    true_opts = tuple(i for i in range(4) if all(preds[i](t) for t in T))
    n_sets += 1
    sig[true_opts] = sig.get(true_opts, 0) + 1
    if true_opts != (3,):
        bad.append((sorted(T), true_opts))
print("        exhaustive: %d admissible data sets; true-option signatures %s"
      % (n_sets, {("".join("ABCD"[i] for i in k) or "none"): v for k, v in sorted(sig.items())}))
check(n_sets == 32768, f"enumerated all 2^15 = 32,768 half-degree admissible data sets (got {n_sets})")
check(not bad, f"exactly ONE option is true of every admissible data set (counterexamples: {bad[:3]})")
check(set(sig) == {(3,)}, "the single true option is D on every one of the 32,768 data sets")

# (2) INTEGER-EXHAUSTIVE: the same sweep over integer-valued data sets (2^7 = 128 sets).
IFREE = list(range(48, 55))
ibad = []
for mask in range(1 << len(IFREE)):
    T = [47, 55] + [v for j, v in enumerate(IFREE) if mask >> j & 1]
    if tuple(i for i in range(4) if all(preds[i](t) for t in T)) != (3,):
        ibad.append(sorted(T))
check(not ibad, f"exactly one option true on all 128 integer-valued data sets ({ibad[:3]})")

# (3) REAL-VALUED CLOSURE.  The grid results extend to ALL real-valued data sets:
#     an option can be defensible iff it holds on the WHOLE interval [47, 55]
#     (a data set may contain any point of it), and an option is safely wrong iff it
#     already fails at 47 or at 55 -- the two values every admissible data set contains.
dense = [47 + i / 1000 for i in range(8001)]          # 47.000 ... 55.000
holds_everywhere = [i for i in range(4) if all(preds[i](t) for t in dense)]
fails_on_forced = sorted(i for i in range(4) if not (preds[i](47) and preds[i](55)))
check(holds_everywhere == [3],
      "only D holds at every point of [47, 55], so no other option can be true of every data set")
check(fails_on_forced == [0, 1, 2],
      "A, B and C each fail at 47 or at 55 -- values EVERY admissible data set must contain")
check(not preds[0](55) and not preds[1](55) and not preds[2](47) and not preds[2](55),
      "each dismissal's counterexample is a RECORDED value: A and B fail at 55, C at 47 and at 55")
check(preds[3](47) and preds[3](55) and preds[3](51), "key admits both recorded extremes")
check(not preds[3](46) and not preds[3](56), "key excludes values outside the recorded range")

bounds = {i: tuple(int(v) for v in re.findall(r"\d+", o)) for i, o in enumerate(it["options"])}
check(len({b for b in bounds.values()}) == 3,
      f"three distinct bound pairs across the four options {sorted(set(bounds.values()))}")
strictness_only = [i for i in (0, 1, 2) if bounds[i] == bounds[3]]
check(strictness_only == [2],
      "the strict/inclusive distinction is load-bearing in exactly one distractor (C)")
samples = [12, 46, 47, 48, 51, 54, 55, 56]
for i in (0, 1, 2):
    check(any(preds[i](t) != preds[3](t) for t in samples),
          f"option {'ABCD'[i]} semantically differs from the key")
check([bounds[i] for i in range(4)] == [(0, 47), (47, 51), (47, 55), (47, 55)]
      and [bounds[i] for i in range(4)] == sorted(bounds.values()),
      "options ordered by lower bound, then upper bound, then strictness")
check(Fraction(47 + 55, 2) == 51,
      "B's upper bound 51 is the average of the two recorded extremes (its named recipe)")
for L, tok in (("A", "47, as the upper bound"), ("B", "51, as the upper bound")):
    check(tok in it["explanation"], f"Q10 dismissal {L} names its recipe")
check(it["explanation"].count("is false when t is") == 3,
      "all three dismissals name a RECORDED value on which the option is false")

# ---------------------------------------------------------------- Q11
print("== Q11 reverse percent ==")
it = q(11)
total = Fraction(52) / Fraction(4, 100)
check(total == 1300, "52 / 0.04 = 1,300")
check(Fraction(4, 100)*1300 == 52, "check: 4% of 1,300 is 52")
d_div4, d_dec, d_mul4 = Fraction(52, 4), Fraction(52)/Fraction(4, 10), 52*4
check((d_div4, d_dec, d_mul4) == (13, 130, 208), "recipes: 52/4 = 13, 52/0.4 = 130, 52x4 = 208")
check(len({int(total), int(d_div4), int(d_dec), d_mul4}) == 4, "key and distractors distinct")
check(it["options"] == ["13", "130", "208", "1,300"] and it["correctAnswer"] == 3, "options / key index D")
check(strictly_ascending(opt_nums(it)), "ascending (thousands comma stripped)")

# ---------------------------------------------------------------- Q12 (SPR)
print("== Q12 SPR radical equation with an extraneous candidate ==")
it = q(12)
xr = sp.Symbol("xr", real=True)
cands = sorted(sp.solve(sp.Eq(xr**2 - 11*xr + 18, 0), xr))
check(cands == [2, 9], "squaring gives x^2 - 11x + 18 = 0, whose roots are 2 and 9")
check(sp.expand((xr - 2)*(xr - 9)) == xr**2 - 11*xr + 18, "factorization (x-2)(x-9) verified")
check(sp.sqrt(sp.Integer(2 + 7)) != 2 - 5, "x = 2 is extraneous: sqrt(9) = 3 but 2 - 5 = -3")
check(sp.sqrt(sp.Integer(9 + 7)) == 9 - 5, "x = 9 satisfies sqrt(x + 7) = x - 5")
sols = sp.solve(sp.Eq(sp.sqrt(xr + 7), xr - 5), xr)
check(sols == [9], f"sympy confirms the equation has the single real solution 9 (got {sols})")
check(it["correctAnswer"] == "9" and "9" in it["acceptedAnswers"], "canonical answer 9")
check("2" not in it["acceptedAnswers"], "the extraneous candidate 2 is NOT accepted")
check("√" in it["passage"] and "isn’t a true statement" in it["explanation"],
      "radical displayed in the passage; the rationale rejects the extraneous candidate by substitution")

# ---------------------------------------------------------------- Q13 (SPR)
print("== Q13 SPR trig ratio ==")
it = q(13)
AB, BC = 8, 15
AC = sp.sqrt(AB**2 + BC**2)
check(AC == 17, "Pythagorean theorem: hypotenuse = sqrt(64 + 225) = 17")
exact = Fraction(BC, int(AC))
check(exact == Fraction(15, 17) and it["correctAnswer"] == "15/17", "sin(a) = opposite/hypotenuse = 15/17")
check(sp.gcd(15, 17) == 1, "fraction is in lowest terms")
check(Fraction(AB, int(AC)) != exact and Fraction(BC, AB) != exact,
      "cos(a) = 8/17 and tan(a) = 15/8 differ from the key")

# ---------------------------------------------------------------- Q14
print("== Q14 exponential-base interpretation ==")
it = q(14)
R = lambda t: 620*sp.Rational(108, 100)**t
check(it["correctAnswer"] == 2, "key C = increases by 8% each year")
check(sp.simplify(R(1)/R(0) - sp.Rational(108, 100)) == 0, "year-over-year factor is exactly 1.08")
check(sp.Rational(108, 100) - 1 == sp.Rational(8, 100), "1.08 - 1 = 0.08, an 8% increase")
check(1 + sp.Rational(108, 100) == sp.Rational(208, 100), "B wrong: a 108% increase is a factor of 2.08")
check(1 - sp.Rational(8, 100) == sp.Rational(92, 100), "D wrong: an 8% decrease is a factor of 0.92")
check(sp.simplify(R(1) - R(0)) != sp.simplify(R(2) - R(1)),
      "A wrong: the yearly change is not a constant number of riders")
check(len({len(o.split()) for o in it["options"]}) <= 2, "interpretation options are near-parallel in length")

# ---------------------------------------------------------------- Q15
print("== Q15 vertex of a translated parabola ==")
it = q(15)
f15 = -x**2 - 2*x + 8                     # round-2 re-roll (was -x^2 - 4x + 5)
SHIFT = 3
g15 = f15 + SHIFT                          # y = f(x) + 3, the graph the question asks about
h15 = f15.subs(x, x + SHIFT)               # y = f(x + 3), the confusion behind choice A
vx, vy = sp.solve(sp.diff(f15, x), x)[0], None
vy = f15.subs(x, vx)
check((vx, vy) == (-1, 9), "vertex of y = -x^2 - 2x + 8 is (-1, 9) and the parabola opens downward")
check(sp.LC(f15, x) < 0, "leading coefficient negative (orientation differs from PT4's parabola)")
check(sorted(sp.solve(f15, x)) == [-4, 2] and f15.subs(x, 0) == 8,
      "x-intercepts (-4, 0) and (2, 0); y-intercept (0, 8)")
kvx = sp.solve(sp.diff(g15, x), x)[0]
kvy = g15.subs(x, kvx)
check((kvx, kvy) == (-1, 12), "vertex of y = f(x) + 3 is (-1, 12) -- the key, a two-step read")
# PT4 M4.04 was y = x^2 - 6x + 5: vertex (3, -4), roots 1 and 5, y-intercept (0, 5)
PT4_M404 = {(3, -4), (1, 0), (5, 0), (0, 5)}
check((kvx, kvy) not in PT4_M404,
      "key (-1, 12) is none of PT4 M4.04's features (its (0, 5) y-intercept included)")
check(f15.subs(x, 0) != 5 and sp.Poly(f15, x).all_coeffs()[-1] != 5,
      "the re-rolled parabola no longer shares PT4 M4.04's constant term 5")
check(it["options"] == ["(-4, 9)", "(-1, 9)", "(-1, 12)", "(12, -1)"] and it["correctAnswer"] == 2,
      "options / key index C")
pairs = [tuple(int(v) for v in re.findall(r"-?\d+", o)) for o in it["options"]]
check(pairs == sorted(pairs), "ordered pairs ascending by first coordinate, then second")
hvx = sp.solve(sp.diff(h15, x), x)[0]
check((hvx, h15.subs(x, hvx)) == (-4, 9),
      "A = the vertex of y = f(x + 3): the f(x)+3 vs f(x+3) confusion, one nameable error")
check(pairs[1] == (int(vx), int(vy)), "B = the untranslated vertex (the translation not applied)")
check(pairs[3] == (int(kvy), int(kvx)), "D is the key with its coordinates reversed (the trap)")
check(g15.subs(x, 12) != -1 and f15.subs(x, 12) != -1,
      "the reversal distractor (12, -1) is on neither the drawn nor the translated graph")
check(len({p for p in pairs}) == 4, "all four ordered pairs distinct")
check("vertex" in it["text"] and "f(x) + 3" in it["text"] and "y-intercept" not in it["text"],
      "asked target is the vertex of a TRANSLATED graph: read two features, then translate")
check(it["difficulty"] == "medium", "Q15 medium is now earned by the added translation step")
check(it["_trap"] == "ordered-pair reversal", "Q15 trap unchanged: ordered-pair reversal")
gd = it["graphDescription"]
check(it["options"][2] not in gd, "Q15 alt text does not disclose the key")
check(sum(o in gd for o in it["options"]) <= 1,
      "Q15 alt text names at most one option (the figure's own vertex) -- it never enumerates the set")
for feat in ("(-1, 9)", "(-4, 0)", "(2, 0)", "(0, 8)", "opens downward"):
    check(feat in gd, f"Q15 alt text describes the figure: {feat}")

# ---------------------------------------------------------------- Q16
print("== Q16 arc length proportionality ==")
it = q(16)
angle, arc = 45, 18
circ = arc * Fraction(360, angle)
r = circ / 2
check(circ == 144 and r == 72, "circumference 144pi; radius 72")
check(Fraction(angle, 360) * circ == arc, "check: 45/360 of 144pi is 18pi")
d_arc = arc
d_180 = arc * Fraction(180, angle) / 2
d_diam = 2*r
check((d_arc, d_180, d_diam) == (18, 36, 144), "recipes: arc 18, 180-degree slip 36, diameter 144")
check(len({int(r), d_arc, int(d_180), int(d_diam)}) == 4, "key and distractors distinct")
check(it["options"] == ["18", "36", "72", "144"] and it["correctAnswer"] == 2, "options / key index C")
check(strictly_ascending(opt_nums(it)), "ascending")

# ---------------------------------------------------------------- Q17
print("== Q17 parameter for infinitely many solutions ==")
it = q(17)
a_ = sp.symbols("a")
a_val = sp.solve(sp.Eq(3*a_, 6), a_)[0]
check(a_val == 2, "coefficient matching: 3a = 6 gives a = 2")
check(sp.simplify(sp.expand(3*(2*x - 5*y_ - 7)) - sp.expand(6*x - 15*y_ - 21)) == 0,
      "with a = 2 the second equation is exactly 1/3 of the first (same line)")
for cand in (-2, 6, 18):
    sol = sp.solve([sp.Eq(6*x - 15*y_, 21), sp.Eq(cand*x - 5*y_, 7)], (x, y_), dict=True)
    check(len(sol) == 1 and all(v.free_symbols == set() for v in sol[0].values()),
          f"a = {cand} gives exactly one solution, not infinitely many")
check(it["options"] == ["-2", "2", "6", "18"] and it["correctAnswer"] == 1, "options / key index B")
check(strictly_ascending(opt_nums(it)), "ascending")

# ---------------------------------------------------------------- Q18
print("== Q18 perturbation: mean versus median ==")
it = q(18)
import random
random.seed(11)
for _ in range(400):
    others = sorted(random.randint(5, 31) for _ in range(14))
    before = others + [32]
    after = others + [47]
    check_mean = statistics.mean(after) > statistics.mean(before)
    check_med = statistics.median(after) == statistics.median(before)
    if not (check_mean and check_med):
        check(False, "randomized 15-value data sets: mean increases and median is unchanged")
        break
else:
    check(True, "400 randomized 15-value data sets: mean strictly increases, median unchanged")
check(Fraction(sum([1]*14 + [47]), 15) - Fraction(sum([1]*14 + [32]), 15) == 1,
      "mean increases by exactly (47 - 32)/15 = 1")
check(it["correctAnswer"] == 1 and it["options"][1] == "The mean is greater, and the median is the same.",
      "key B = mean greater, median the same")
check(len(set(it["options"])) == 4, "the four statements form a distinct 2 x 2 menu")

# ---------------------------------------------------------------- Q19 (SPR)
print("== Q19 SPR two conditions, composite target ==")
it = q(19)
aa, bb = sp.symbols("aa bb")
sol = sp.solve([sp.Eq(aa + bb + 12, 21), sp.Eq(aa - bb + 12, 9)], (aa, bb), dict=True)[0]
check((sol[aa], sol[bb]) == (3, 6), "f(1) = 21 and f(-1) = 9 give a = 3, b = 6")
f19 = lambda v: sol[aa]*v**2 + sol[bb]*v + 12
check(f19(1) == 21 and f19(-1) == 9, "both stated conditions verified")
check(f19(7) == 201 and it["correctAnswer"] == "201", "f(7) = 147 + 42 + 12 = 201")
wrong_targets = {"a": 3, "b": 6, "a+b": 9, "ab": 18, "f(1)": 21}
check(all(v != 201 for v in wrong_targets.values()),
      f"wrong-target values {sorted(wrong_targets.values())} all differ from 201")
check(len(str(201)) == 3, "engineered 3-digit integer")

# ---------------------------------------------------------------- Q20
print("== Q20 CANNOT be the value of k ==")
it = q(20)
lhs, rhs = k_*x + 9, sp.expand(6*(2*x + 1) - 5*x)
check(rhs == 7*x + 6, "right-hand side simplifies to 7x + 6")
resid = sp.expand(lhs - rhs)
check(sp.simplify(resid - ((k_ - 7)*x + 3)) == 0, "equation reduces to (k - 7)x = -3")
bad = sp.solve(sp.Eq(k_ - 7, 0), k_)
check(bad == [7], "no solution exactly when k = 7")
check(sp.solve(sp.Eq(7*x + 9, 7*x + 6), x) == [], "k = 7 truly yields no solution")
for cand in (5, 12, 17):
    s = sp.solve(sp.Eq(cand*x + 9, 7*x + 6), x)
    check(len(s) == 1, f"k = {cand} gives exactly one solution (x = {s[0]}), so it CAN be the value of k")
check(it["options"] == ["5", "7", "12", "17"] and it["correctAnswer"] == 1, "options / key index B")
check(strictly_ascending(opt_nums(it)), "ascending")
check("CANNOT" in it["text"], "negation capitalized in the stem")

# ---------------------------------------------------------------- Q21
print("== Q21 structured solution, radicand matching ==")
it = q(21)
A, B, C = 2, -14, 5
disc = B**2 - 4*A*C
check(disc == 156, "b^2 - 4ac = 196 - 40 = 156")
cand = (14 + sp.sqrt(156))/4
check(sp.simplify(A*cand**2 + B*cand + C) == 0, "(14 + sqrt(156))/4 satisfies the given equation")
check(sp.simplify(-B) == 14 and 2*A == 4, "the stated form (14 + sqrt(q))/4 matches -b and 2a exactly")
d_4ac, d_b2, d_sign = 4*A*C, B**2, B**2 + 4*A*C
check((d_4ac, d_b2, d_sign) == (40, 196, 236), "recipes: 4ac = 40, b^2 = 196, sign slip 236")
check(len({disc, d_4ac, d_b2, d_sign}) == 4, "key and distractors distinct")
for w in (40, 196, 236):
    cw = (14 + sp.sqrt(w))/4
    check(sp.simplify(A*cw**2 + B*cw + C) != 0, f"q = {w} does not produce a solution")
check(it["options"] == ["40", "156", "196", "236"] and it["correctAnswer"] == 1, "options / key index B")
check(strictly_ascending(opt_nums(it)), "ascending")

# ---------------------------------------------------------------- Q22 (SPR)
print("== Q22 SPR translated line, new x-intercept ==")
it = q(22)
y_orig = sp.solve(sp.Eq(3*x - 4*y_, 24), y_)[0]
check(sp.simplify(y_orig - (sp.Rational(3, 4)*x - 6)) == 0, "3x - 4y = 24 is y = (3/4)x - 6")
y_new = y_orig + 15
check(sp.simplify(y_new - (sp.Rational(3, 4)*x + 9)) == 0, "translated up 15 units: y = (3/4)x + 9")
a_val = sp.solve(sp.Eq(y_new, 0), x)[0]
check(a_val == -12 and it["correctAnswer"] == "-12", "x-intercept of the translated graph is (-12, 0)")
down = sp.solve(sp.Eq(y_orig - 15, 0), x)[0]
none = sp.solve(sp.Eq(y_orig, 0), x)[0]
check(down == 28 and none == 8, "sign-slip paths (translated down: 28; no translation: 8) differ from -12")
check(a_val < 0 and a_val == int(a_val), "answer is a negative integer")

# ---------------------------------------------------------------- figures
print("== Figures ==")
ASSETS = os.path.join(HERE, "assets")
FIGS = [(7, "PT5-M3-Q07.svg"), (9, "PT5-M3-Q09.svg"), (15, "PT5-M3-Q15.svg")]
roots = {}
for n, fname in FIGS:
    p = os.path.join(ASSETS, fname)
    check(os.path.exists(p), f"{fname} exists")
    try:
        root = ET.parse(p).getroot()
        ok = root.tag.endswith("svg")
    except Exception:
        ok = False
    check(ok, f"{fname} well-formed SVG")
    roots[fname] = root
    check(root.get("width") == "380", f"{fname} canvas width 380px (house standard)")
    check("Georgia" in (root.get("font-family") or ""), f"{fname} uses the Georgia serif stack")
    check(q(n)["graphAsset"] == fname and q(n)["graphDescription"], f"Q{n} references {fname} with alt text")

# Q07: recover the dot plot from the SVG geometry (value = (cx - 24)/36)
circles = [el for el in roots["PT5-M3-Q07.svg"].iter() if el.tag.endswith("circle")]
freq = {}
for el in circles:
    v = round((float(el.get("cx")) - 24) / 36)
    freq[v] = freq.get(v, 0) + 1
check(freq == DOTS, f"Q07 SVG dots re-measure to {dict(sorted(freq.items()))} == authored frequencies")
check(len(circles) == 24, "Q07 SVG contains exactly 24 dots")
axis = [el for el in roots["PT5-M3-Q07.svg"].iter()
        if el.tag.endswith("line") and el.get("marker-start")][0]
base = float(axis.get("y1"))
ys = sorted({round(float(el.get("cy"))) for el in circles if round((float(el.get("cx")) - 24)/36) == 4})
check(len(ys) == 7 and {b - a for a, b in zip(ys, ys[1:])} == {15},
      "Q07 tallest stack has 7 evenly spaced dots")
check(base - max(ys) == 14, "Q07 lowest dot of each stack sits just above the number line")
q7txt = open(os.path.join(ASSETS, "PT5-M3-Q07.svg"), encoding="utf-8").read()
check("Games Won by Chess Club Members" in q7txt, "Q07 carries a title above the plot")
check("Number of games won" in q7txt, "Q07 carries a roman axis title")
check("not drawn to scale" not in q7txt, "Q07 (data display) carries no scale note")

# Q09: geometry figure conventions (the triangle moved to position 9 with the ramp-dip swap)
q9txt = open(os.path.join(ASSETS, "PT5-M3-Q09.svg"), encoding="utf-8").read()
check("Note: Figure not drawn to scale." in q9txt, "Q09 geometry figure carries the scale note")
check("80°" in q9txt, "Q09 shows the 80-degree vertex angle")
check("font-style=\"italic\"" in q9txt, "Q09 uses italic vertex/variable labels")
ticks = [el for el in roots["PT5-M3-Q09.svg"].iter() if el.tag.endswith("line")]
check(len(ticks) == 2, "Q09 marks the two congruent sides with tick marks (2 line elements)")
tri = [el for el in roots["PT5-M3-Q09.svg"].iter() if el.tag.endswith("path")]
check(len(tri) == 1 and tri[0].get("d").strip().endswith("Z"), "Q09 draws one closed triangle path")

# Q15: recover the affine data<->pixel map from the tick labels alone, then re-measure
# the plotted parabola against y = -x^2 - 2x + 8 (the round-2 re-roll).
q15root = roots["PT5-M3-Q15.svg"]
xticks = {}
for el in q15root.iter():
    if el.tag.endswith("text") and (el.text or "").strip().lstrip("-").isdigit() \
       and abs(float(el.get("y")) - 263) < 1:
        xticks[int(el.text)] = float(el.get("x"))
check(len(xticks) >= 4, f"Q15 x-axis tick labels recovered from the SVG ({len(xticks)} found)")
tk = sorted(xticks)
S = (xticks[tk[-1]] - xticks[tk[0]]) / (tk[-1] - tk[0])
OX = xticks[tk[0]] - S * tk[0]
OY = 250.0
check(abs(S - 22.0) < 1e-9 and abs(OX - 223.0) < 1e-9,
      f"Q15 map recovered from tick labels: px = {OX:g} + {S:g}x")
poly = [el for el in q15root.iter() if el.tag.endswith("polyline")][0]
pts = [tuple(float(v) for v in p.split(",")) for p in poly.get("points").split()]
errs = []
for pxv, pyv in pts:
    dx, dy = (pxv - OX)/S, (OY - pyv)/S
    errs.append(abs(dy - (-dx*dx - 2*dx + 8)))
check(max(errs) < 0.02, f"Q15 all {len(pts)} plotted points satisfy y = -x^2 - 2x + 8 (max err {max(errs):.4f})")
hi = min(pts, key=lambda p: p[1])
check(abs((hi[0] - OX)/S + 1) < 0.02 and abs((OY - hi[1])/S - 9) < 0.02,
      "Q15 highest plotted point re-measures to the vertex (-1, 9)")
seg = [(a, b) for a, b in zip(pts, pts[1:]) if (a[0] - OX) <= 0 <= (b[0] - OX)]
check(len(seg) == 1, "Q15 the plotted curve crosses the y-axis exactly once")
(ax_, ay_), (bx_, by_) = seg[0]
tt = (OX - ax_) / (bx_ - ax_)
yint = (OY - (ay_ + tt*(by_ - ay_))) / S
check(abs(yint - 8) < 0.02, f"Q15 drawn y-intercept re-measures to (0, {yint:.3f}) == the alt text's (0, 8)")
xcross = sorted((a[0] + (b[0]-a[0])*(OY-a[1])/(b[1]-a[1]) - OX)/S
                for a, b in zip(pts, pts[1:]) if (a[1] - OY)*(b[1] - OY) < 0)
check(len(xcross) == 2 and abs(xcross[0] + 4) < 0.02 and abs(xcross[1] - 2) < 0.02,
      f"Q15 drawn x-intercepts re-measure to {[round(v, 3) for v in xcross]} == (-4, 0) and (2, 0)")
check(min(abs((pxv - OX)/S + 1) + abs((OY - pyv)/S - 12) for pxv, pyv in pts) > 0.5,
      "Q15 the key (-1, 12) is NOT a plotted point -- the translation must be performed")
check(min(abs((pxv - OX)/S + 4) + abs((OY - pyv)/S - 9) for pxv, pyv in pts) > 0.5,
      "Q15 distractor A (-4, 9) is NOT a plotted point either")
q15txt = open(os.path.join(ASSETS, "PT5-M3-Q15.svg"), encoding="utf-8").read()
check("not drawn to scale" not in q15txt, "Q15 (coordinate grid) carries no scale note")
check("#cccccc" in q15txt, "Q15 gridlines are #cccccc")
check(">O<" in q15txt and ">x<" in q15txt and ">y<" in q15txt, "Q15 marks origin O and italic x/y at the axis tips")
for fname in ("PT5-M3-Q15.svg",):
    txt = open(os.path.join(ASSETS, fname), encoding="utf-8").read()
    i = txt.find(">O<")
    check("font-style=\"italic\"" in txt[max(0, i-260):i],
          f"{fname} origin O is italic (house convention across all six figures)")

nograph = [it["originalQuestionNumber"] for it in MOD["questions"]
           if it["graphAsset"] is None and it["graphDescription"] is None]
check(len(nograph) == 19, "the other 19 items have graphAsset/graphDescription null")

# ---------------------------------------------------------------- traps
print("== Trap census (exactly one mechanism per item) ==")
TRAPS = {n: q(n)["_trap"] for n in range(1, 23)}
check([n for n in TRAPS if TRAPS[n] is None] == [5, 6, 13],
      "the three trap-free slots are the E/E/M SPRs at 5, 6, 13")
check(len({t for t in TRAPS.values() if t}) == 19, "all 19 trap mechanisms are distinct")
check("must-be" in (TRAPS[20] or ""), "Q20 carries the must-be/could-be trap (a PT4 gap)")
check("robust" in (TRAPS[18] or ""), "Q18 carries the statistical-robustness trap (a PT4 gap)")
check("extraneous" in (TRAPS[12] or ""),
      "Q12 carries the extraneous/nonreal-solution trap (spec section 5 family, 0 before this round)")
for n, it in ((n, q(n)) for n in range(1, 23)):
    if it["questionType"] == "multiple-choice":
        wrong = [L for L in "ABCD" if L != "ABCD"[it["correctAnswer"]]]
        check(sorted(it["_distractorLogic"].keys()) == sorted(wrong),
              f"Q{n} _distractorLogic covers exactly the three wrong letters")

# ---------------------------------------------------------------- PT4 context firewall
print("== Originality firewall (PT4 contexts must not recur) ==")
PT4 = ["pottery", "seed packet", "recycling", "nature center", "ferry", "storage crate",
       "greenhouse", "seedling", "marsh bird", "freight elevator", "furlong", "library",
       "kiln", "canopy", "banner", "bus-route", "robotics", "used bicycle", "Nadia"]
blob = json.dumps(MOD, ensure_ascii=False).lower()
for w in PT4:
    check(w.lower() not in blob, f"PT4 context '{w}' absent")

# ---------------------------------------------------------------- summary
print()
if FAIL:
    print(f"{len(FAIL)} CHECK(S) FAILED:")
    for f_ in FAIL:
        print("  -", f_)
    sys.exit(1)
print("ALL CHECKS PASSED — M3.json verified clean.")
