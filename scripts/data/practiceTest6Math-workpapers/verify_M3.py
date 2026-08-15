#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
verify_M3.py — full mathematical + structural verification of ULTRASAT PT6 Math Module 3.

For every item it
  (a) recomputes the key from the givens (sympy, exact arithmetic),
  (b) re-derives each distractor from its named error recipe and proves it differs from the key,
  (c) proves no non-keyed option is also defensible — EXHAUSTIVELY (over every admissible
      data set / every integer load / every real x, as the item type requires), never by
      spot check,
  (d) checks numeric MC option sets are strictly ascending,
  (e) checks every acceptedAnswers entry is a correct value inside the app's 5-character
      rule (6 with a leading minus), and that the enumeration omits no legal entry,
  (f) checks the blueprint: domain/skill/format quotas, difficulty ramp with exactly one
      dip, SPR positions and answer-form census, key-letter balance, visual quota, applied
      share, trap census, stem-length caps, rationale liturgy and length, the app format
      contract, and the four SVG figures (parsed and re-measured from their geometry).

Run:  python3 verify_M3.py      (exit 0 and "ALL CHECKS PASSED" on success)
Requires sympy:  pip install sympy --break-system-packages
"""
import json, math, os, re, sys, itertools, xml.etree.ElementTree as ET
from fractions import Fraction

try:
    import sympy as sp
except ImportError:                                              # pragma: no cover
    print("sympy not installed — run: pip install sympy --break-system-packages")
    sys.exit(2)

HERE = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.join(HERE, "assets")
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


def opt_nums(item):
    return [float(o.replace(",", "")) for o in item["options"]]


def strictly_ascending(vals):
    return all(a < b for a, b in zip(vals, vals[1:]))


x, y, z, t, a_, b_ = sp.symbols("x y z t a b", real=True)

# --------------------------------------------------------------------------- rulers
STRIP_TAGS = re.compile(r"</?[A-Za-z][^>]*>")
DISPLAY_EQ = re.compile(r"<div style=\"text-align:center[^\"]*\">.*?</div>", re.S)
DATA_TABLE = re.compile(r"<table.*?</table>", re.S)


def toks(s):
    return [tok for tok in re.split(r"\s+", s.strip()) if tok]


def rat_words(s):
    """Rationale length, ALL-TOKEN RULER: every whitespace-delimited token counts —
    numerals, operators and bare '=' included. A ruler that keeps only tokens
    containing [A-Za-z] silently hides ~20% of a derivation-heavy rationale."""
    return len(toks(s))


def stem_words(item):
    """Spec 2b stem length, ALL-TOKEN RULER (round 3 correction).

    EVERY whitespace-delimited token of `passage + text`, after tag-stripping, is counted:
    prose words, numerals, operators, and the tokens of a centered displayed equation or of
    an HTML data table. Nothing is dropped.

    Round 2 shipped a ruler that subtracted the displayed equation before counting. That is
    why Q20's stem read 32/35 here while the auditors' all-token ruler read 43/35 and the
    item was over cap: the instrument, not the item, was hiding the breach."""
    blob = (item.get("passage") or "") + " " + (item.get("text") or "")
    return len(toks(STRIP_TAGS.sub(" ", blob)))


print("== Length rulers (instrument self-test) ==")
check(rat_words("Adding a + b = 9 yields 2a = 6.") == 10,
      "rat_words counts every whitespace token (operators and numerals included)")
check(stem_words({"passage": None, "text": "If 3 + 4 = 7, what is 2x?"}) == 9,
      "stem_words counts every whitespace token (numerals and operators included)")
check(stem_words({"passage": "<div style=\"text-align:center; margin:8px 0;\">4(x + 8) = 52</div>",
                  "text": "What is the solution to the given equation?"}) == 13,
      "stem_words COUNTS the centered displayed equation: 5 equation tokens + 8 prose tokens")
check(stem_words({"passage": "<table><tr><th>x</th><td>7</td></tr></table>",
                  "text": "What is x?"}) == 5,
      "stem_words COUNTS HTML table cells too — the ruler drops nothing at all")
check(DISPLAY_EQ.search(q(20)["passage"]) and stem_words(q(20)) == 34,
      "instrument regression: Q20 (a displayed equation) now measures 34 all-token, not 32")

# --------------------------------------------------------------------------- SPR enumerator
def spr_enumerate(exact, canonical=None):
    """Every legal student-produced-response entry for an exact value under the app
    grader rules: at most 5 characters, 6 when a leading minus sign is present.
    Order: integer form, every equivalent fraction that fits (unreduced included),
    then decimals (all zero-padded expansions when terminating; maximum-precision
    truncation AND half-up rounding when repeating, with and without a leading zero)."""
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
    for den in range(1, 10000):
        p = a * den
        if p.denominator == 1:
            add("%d/%d" % (p.numerator, den))
    rem = a.denominator
    for f2 in (2, 5):
        while rem % f2 == 0:
            rem //= f2
    if rem == 1:                                                  # terminating
        dmin, tt = 0, a
        while tt.denominator != 1:
            tt, dmin = tt * 10, dmin + 1
        for d in range(max(dmin, 1), 8):
            digits = str((a * 10 ** d).numerator).rjust(d + 1, "0")
            add("%s.%s" % (digits[:-d], digits[-d:]))
            if a < 1:
                add(".%s" % digits[-d:])
    else:                                                         # repeating
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


# --------------------------------------------------------------------------- module shell
print("== Module shell ==")
check(MOD["moduleNumber"] == 3 and MOD["section"] == "Math", "moduleNumber 3 / section Math")
check(MOD["title"] == "Exam 6, Module 3", "title 'Exam 6, Module 3'")
check(MOD["description"] == "Practice Test 6 - Math, Module 1 (22 questions)", "description string")
check(MOD["calculatorAllowed"] is True and MOD["timeLimit"] == 2100,
      "calculatorAllowed true, timeLimit 2100")
check(len(MOD["questions"]) == 22, "22 questions")
check([it["originalQuestionNumber"] for it in MOD["questions"]] == list(range(1, 23)),
      "originalQuestionNumber 1..22 in order")

FIELDS = ["originalQuestionNumber", "passage", "text", "questionType", "options",
          "correctAnswer", "acceptedAnswers", "difficulty", "subcategory", "subcategoryId",
          "explanation", "graphAsset", "graphDescription",
          "_archetype", "_trap", "_distractorLogic", "_sprForms"]
check(all(list(it.keys()) == FIELDS for it in MOD["questions"]),
      "every item carries exactly the 13 app fields plus the 4 authoring fields, in order")

spr = [it["originalQuestionNumber"] for it in MOD["questions"] if it["questionType"] == "user-input"]
check(spr == [5, 6, 12, 13, 19, 22], f"SPR positions {spr} == [5, 6, 12, 13, 19, 22]")
mc = [it for it in MOD["questions"] if it["questionType"] == "multiple-choice"]
check(len(mc) == 16, "16 MC + 6 SPR")
check(all(len(it["options"]) == 4 for it in mc), "every MC has exactly 4 options")
check(all(it["options"] == [] and it["acceptedAnswers"] for it in MOD["questions"]
          if it["questionType"] == "user-input"), "every SPR has no options and an accepted set")

diffs = [it["difficulty"] for it in MOD["questions"]]
expected_curve = ["easy"] * 8 + ["medium"] + ["easy"] + ["medium"] * 6 + ["hard"] * 6
check(diffs == expected_curve,
      "difficulty ramp: E x8 (Q1-8), M at Q9, E straggler at Q10, M x6 (Q11-16), H x6 (Q17-22)")
check(diffs[8] == "medium" and diffs[9] == "easy",
      "ramp carries exactly ONE dip, the blueprint's easy item at position 10")
check(sum(d == "easy" for d in diffs) == 9 and sum(d == "medium" for d in diffs) == 7
      and sum(d == "hard" for d in diffs) == 6, "difficulty mix 9E / 7M / 6H")
check([q(n)["difficulty"] for n in spr] == ["easy", "easy", "medium", "medium", "hard", "hard"],
      "SPR difficulty by position E/E/M/M/H/H")

tally = {L: 0 for L in "ABCD"}
for it in mc:
    tally["ABCD"[it["correctAnswer"]]] += 1
check(all(tally[L] == 4 for L in "ABCD"), f"key-letter tally {tally} == 4/4/4/4")

# --------------------------------------------------------------------------- blueprint quotas
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
check(dom == {"ALG": 8, "ADV": 7, "PSDA": 3, "GEO": 4},
      f"domain quota {dom} == ALG 8 / ADV 7 / PSDA 3 / GEO 4 (PT6 M3 row)")
skills = {}
for it in MOD["questions"]:
    skills[it["subcategory"]] = skills.get(it["subcategory"], 0) + 1
EXPECT_SKILLS = {"linear-equations-one-variable": 2, "linear-functions": 2,
                 "linear-equations-two-variables": 2, "systems-linear-equations": 1,
                 "linear-inequalities": 1, "nonlinear-functions": 4, "nonlinear-equations": 2,
                 "equivalent-expressions": 1, "ratios-rates-proportions": 1,
                 "one-variable-data": 1, "two-variable-data": 1, "area-volume": 1,
                 "lines-angles-triangles": 1, "right-triangles-trigonometry": 1, "circles": 1}
check(skills == EXPECT_SKILLS, f"skill quota matches the blueprint row-by-row ({len(skills)} skills)")
check("probability" not in skills, "no probability item (Module 4 only)")
check("evaluating-statistical-claims" not in skills,
      "no evaluating-statistical-claims item (absent from all measured forms)")
check(skills.get("circles", 0) >= 1, "at least one circles item")

BP_SLOTS = {1: ("linear-equations-one-variable", "easy", "multiple-choice"),
            2: ("linear-functions", "easy", "multiple-choice"),
            3: ("ratios-rates-proportions", "easy", "multiple-choice"),
            4: ("equivalent-expressions", "easy", "multiple-choice"),
            5: ("linear-equations-two-variables", "easy", "user-input"),
            6: ("nonlinear-functions", "easy", "user-input"),
            7: ("one-variable-data", "easy", "multiple-choice"),
            8: ("lines-angles-triangles", "easy", "multiple-choice"),
            9: ("area-volume", "medium", "multiple-choice"),
            10: ("linear-functions", "easy", "multiple-choice"),
            11: ("linear-inequalities", "medium", "multiple-choice"),
            12: ("systems-linear-equations", "medium", "user-input"),
            13: ("nonlinear-equations", "medium", "user-input"),
            14: ("two-variable-data", "medium", "multiple-choice"),
            15: ("nonlinear-functions", "medium", "multiple-choice"),
            16: ("linear-equations-two-variables", "medium", "multiple-choice"),
            17: ("nonlinear-functions", "hard", "multiple-choice"),
            18: ("right-triangles-trigonometry", "hard", "multiple-choice"),
            19: ("linear-equations-one-variable", "hard", "user-input"),
            20: ("circles", "hard", "multiple-choice"),
            21: ("nonlinear-equations", "hard", "multiple-choice"),
            22: ("nonlinear-functions", "hard", "user-input")}
for n, (sk, df, ft) in BP_SLOTS.items():
    it = q(n)
    check((it["subcategory"], it["difficulty"], it["questionType"]) == (sk, df, ft),
          f"Q{n} slot == blueprint ({sk} / {df} / {ft})")

vis = [(it["originalQuestionNumber"], it["graphAsset"]) for it in MOD["questions"] if it["graphAsset"]]
check(vis == [(7, "PT6-M3-Q07.svg"), (8, "PT6-M3-Q08.svg"),
              (10, "PT6-M3-Q10.svg"), (14, "PT6-M3-Q14.svg")],
      f"visual quota = 4: {vis} (bar graph, geometry, line graph, scatter)")
check(all("<table" not in (it["passage"] or "") for it in MOD["questions"]),
      "no HTML table in this module (M3's four visuals are all SVG)")
check(q(18)["graphAsset"] is None and q(20)["graphAsset"] is None,
      "hard geometry (Q18 right triangle, Q20 circle) is deliberately figure-less")

APPLIED_MARKERS = ["warehouse", "tide pool", "aquarium", "kayak", "Anika", "wind turbine",
                   "ski rental"]
applied = [it["originalQuestionNumber"] for it in MOD["questions"]
           if any(w.lower() in ((it["passage"] or "") + " " + it["text"]).lower()
                  for w in APPLIED_MARKERS)]
check(applied == [3, 7, 9, 11, 12, 14, 15],
      f"applied slots {applied} == 7/22 (blueprint Q5 converted to abstract, as licensed)")
check(stem_words(q(5)) == 22 and "co-op" not in json.dumps(MOD, ensure_ascii=False),
      "Q5 is the converted slot: bare ax + by = c, no food co-op context")

# --------------------------------------------------------------------------- app format contract
print("== App format contract ==")
tagish = re.compile(r"</?[A-Za-z]")
check(all(not tagish.search(o) for it in mc for o in it["options"]), "options contain no HTML tags")
check(all("&" not in o for it in mc for o in it["options"]), "options contain no HTML entities")
check(all("$" not in o and "\\" not in o for it in mc for o in it["options"]),
      "options contain no LaTeX / dollar-math")
check(all("−" not in o for it in mc for o in it["options"]),
      "options use the ASCII hyphen for minus, never U+2212")
for it in MOD["questions"]:
    n = it["originalQuestionNumber"]
    for field in ("passage", "text", "explanation"):
        v = it[field]
        if not v:
            continue
        bare = STRIP_TAGS.sub("", v)
        check("<" not in bare and ">" not in bare,
              f"Q{n} {field} has no unescaped angle bracket")
check(all("$" not in (it["text"] or "") for it in MOD["questions"]), "no LaTeX in stems")
for it in MOD["questions"]:
    if it["passage"] and "<div" in it["passage"]:
        check("text-align:center" in it["passage"] and "margin:8px 0" in it["passage"],
              f"Q{it['originalQuestionNumber']} displayed equation is centered with house margin")
check(q(21)["passage"].count("<div") == 2, "Q21 system stacks two centered equation divs")
check("<i>Littorina fuscopunctata</i>" in q(7)["passage"],
      "Q7 carries the form's one Latin binomial, italicised in the passage only")
binomials = re.findall(r"<i>([A-Z][a-z]+ [a-z]+)</i>", json.dumps(MOD, ensure_ascii=False))
check(binomials == ["Littorina fuscopunctata"], f"exactly one Latin binomial in the module {binomials}")
for it in MOD["questions"]:
    n = it["originalQuestionNumber"]
    if it["graphAsset"]:
        check(bool(it["graphDescription"]), f"Q{n} figure has alt text")
    else:
        check(it["graphDescription"] is None, f"Q{n} has no stray graphDescription")
# ALT-TEXT POLICY (corrected 2026-08-14, matching CB_Math_Style_Spec.md and both shipped forms):
# graphDescription states the figure's data COMPLETELY and factually — every bar height, plotted
# point, labelled measure and axis range a sighted student can read — so that a screen-reader user
# can answer the item. It must not interpret the figure or announce the answer as a conclusion.
DATA_COMPLETE = {
    7: ["Pool 1", "Pool 5", "Number of snails", "Tide pool", "18", "30", "12", "24", "6",
        "increments of 5"],
    8: ["68 degrees", "x degrees", "parallel", "not drawn to scale", "right of line t",
        "below line r", "above line s"],
    10: ["(0, 8)", "(2, 2)", "(4, -4)", "increments of 1", "increments of 2"],
    14: ["(4, 75)", "(6, 125)", "(8, 225)", "(10, 300)", "(12, 325)", "(14, 350)", "(16, 375)",
         "(18, 400)", "(20, 500)", "(22, 575)", "(2, 50)", "(23, 575)",
         "Wind speed (meters per second)", "Power output (kilowatts)"],
}
INTERPRETIVE = re.compile(r"\b(therefore|so the|the answer|which means|greatest number of snails|"
                          r"predicted|the equation of|represents the line|the value of x is)\b", re.I)
for n in (7, 8, 10, 14):
    it = q(n)
    desc = it["graphDescription"]
    missing = [d for d in DATA_COMPLETE[n] if d not in desc]
    check(not missing, f"Q{n} alt text is data-complete (missing {missing})")
    check(not INTERPRETIVE.search(desc),
          f"Q{n} alt text states data only — it does not interpret the figure or announce the answer")
    check(desc.count(".") >= 2 and len(desc.split()) <= 130,
          f"Q{n} alt text is factual prose of workable length ({len(desc.split())} words)")

# --------------------------------------------------------------------------- rationale liturgy
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
    check("Therefore," in e, f"Q{n} closes with a 'Therefore,' sentence")
    check(not re.search(r"\b(we|our|you|your|let's)\b", e, re.I), f"Q{n} has no first/second person")
    check("!" not in e, f"Q{n} has no exclamation point")
for n in spr:
    e = q(n)["explanation"]
    check(e.startswith("The correct answer is "), f"Q{n} SPR opens 'The correct answer is ...'")
    check("is incorrect" not in e, f"Q{n} SPR has no dismissals")
    check("Therefore," in e, f"Q{n} SPR closes with 'Therefore,'")
NONINT = {13, 22}
for n in spr:
    note = "examples of ways to enter a correct answer" in q(n)["explanation"]
    check(note == (n in NONINT), f"Q{n} entry-forms note present iff the answer is non-integer")
check(sum("It’s given that" in it["explanation"] for it in MOD["questions"]) >= 12,
      "'It’s given that' (curly apostrophe) used on at least 12 items")
YIELDS = sum(it["explanation"].count("yields") for it in MOD["questions"])
check(YIELDS >= 40, f"'yields' narrates the derivations throughout ({YIELDS} uses)")
noyield = [it["originalQuestionNumber"] for it in MOD["questions"] if "yields" not in it["explanation"]]
check(noyield == [7, 14, 16, 18],
      f"the only rationales without 'yields' are the figure reads and definition-only items {noyield}")
check("It’s" in q(1)["explanation"] and "It's" not in json.dumps(MOD, ensure_ascii=False),
      "the contraction is always the curly apostrophe, never a straight one")

NORM_MC = {"easy": 110, "medium": 135, "hard": 170}
NORM_SPR = {"easy": 40, "medium": 100, "hard": 130}
for it in MOD["questions"]:
    n = it["originalQuestionNumber"]
    w = rat_words(it["explanation"])
    norm = (NORM_SPR if it["questionType"] == "user-input" else NORM_MC)[it["difficulty"]]
    lo, hi = int(0.55 * norm), int(1.36 * norm)     # E2: ceiling tightened from 1.45 to 1.36
    check(lo <= w <= hi,
          f"Q{n} rationale {w} words within [{lo}, {hi}] (norm {norm}, ratio {w / norm:.2f})")
band = {}
for it in MOD["questions"]:
    if it["questionType"] == "multiple-choice":
        band.setdefault(it["difficulty"], []).append(rat_words(it["explanation"]) / NORM_MC[it["difficulty"]])
for dfc, ratios in band.items():
    m = sum(ratios) / len(ratios)
    check(m <= 1.30, f"MC {dfc} band mean rationale ratio {m:.2f} <= 1.30 (spec section 7 norms)")

STEMCAP = {1: 35, 2: 35, 3: 55, 4: 15, 5: 35, 6: 35, 7: 55, 8: 35, 9: 55, 10: 35, 11: 55,
           12: 55, 13: 35, 14: 55, 15: 55, 16: 35, 17: 35, 18: 35, 19: 35, 20: 35, 21: 35,
           22: 35}
for it in MOD["questions"]:
    n = it["originalQuestionNumber"]
    w = stem_words(it)
    check(w <= STEMCAP[n], f"Q{n} stem prose {w} words within cap {STEMCAP[n]}")
check(stem_words(q(4)) <= 15, "Q4 (equivalent expressions) inside the 15-word cap")

blob_all = json.dumps(MOD, ensure_ascii=False)
check(not re.search(r"\b(Nadia|Mateo|Idris)\b", blob_all),
      "no PT4/PT5 name (Nadia, Mateo, Idris) reused")
names = set(re.findall(r"\b(Anika|Soren|Priya|Yusuf|Camila|Halima|Tomas|Lucia)\b", blob_all))
check(names == {"Anika"}, f"named people {sorted(names)}: exactly one, within the cap of 2")
check(not re.search(r"\bFind\b|\byou\b", (q(1)["text"] + q(9)["text"])), "no imperatives, no 'you'")

# --------------------------------------------------------------------------- SPR entry forms
print("== SPR acceptedAnswers (complete legal-entry enumeration) ==")
SPR_EXACT = {5: Fraction(7), 6: Fraction(89), 12: Fraction(16),
             13: Fraction(7, 3), 19: Fraction(126), 22: Fraction(-41, 3)}


def entry_value_ok(entry, exact):
    if "/" in entry:
        return Fraction(entry) == Fraction(exact)
    v = Fraction(entry)
    if "." not in entry:
        return v == Fraction(exact)
    d = len(entry.split(".")[1])
    return abs(v - Fraction(exact)) < Fraction(1, 10 ** d)


for n, val in SPR_EXACT.items():
    it = q(n)
    check(isinstance(it["correctAnswer"], str), f"Q{n} correctAnswer is a string")
    check(Fraction(it["correctAnswer"]) == val, f"Q{n} canonical answer evaluates to the key value")
    full = spr_enumerate(val, it["correctAnswer"])
    check(it["acceptedAnswers"] == full,
          f"Q{n} acceptedAnswers == complete legal-entry set ({len(full)} forms)")
    check(it["acceptedAnswers"][0] == it["correctAnswer"], f"Q{n} canonical form listed first")
    for e in it["acceptedAnswers"]:
        limit = 6 if e.startswith("-") else 5
        check(len(e) <= limit, f"Q{n} entry '{e}' within the {limit}-character rule")
        check(entry_value_ok(e, val), f"Q{n} entry '{e}' is a correct value")
# no legal equivalent fraction may be missing from any list
for n, val in SPR_EXACT.items():
    got = set(q(n)["acceptedAnswers"])
    limit = 6 if val < 0 else 5
    missing = set()
    for den in range(1, 500):
        p = val * den
        if p.denominator == 1:
            s = "%d/%d" % (p.numerator, den)
            if len(s) <= limit:
                missing.add(s)
    check(missing <= got, f"Q{n} no legal equivalent fraction missing (gap {sorted(missing - got)})")

ints = [n for n in spr if "/" not in q(n)["correctAnswer"] and "." not in q(n)["correctAnswer"]]
fracs = [n for n in spr if "/" in q(n)["correctAnswer"]]
negs = [n for n in spr if q(n)["correctAnswer"].startswith("-")]
check(ints == [5, 6, 12, 19] and fracs == [13, 22],
      f"M3 SPR census: 4 integers {ints}, 2 fractions {fracs}")
check(negs == [22], "exactly one negative SPR, at Q22 (the form's only negative)")
check(len(q(19)["correctAnswer"]) == 3, "Q19 is the engineered 3-digit integer")
for n in fracs:
    fr = Fraction(q(n)["correctAnswer"])
    check(math.gcd(abs(fr.numerator), fr.denominator) == 1, f"Q{n} fraction is in lowest terms")

# =========================================================================== ITEMS
print("== Q1 bare solve with one distribution step ==")
it = q(1)
sol = sp.solve(sp.Eq(4 * (x + 8), 52), x)
check(sol == [5], "recompute: 4(x + 8) = 52 gives x = 5")
d_echo = 8                                   # verbatim echo of the in-parenthesis constant
d_nodist = sp.solve(sp.Eq(4 * x + 8, 52), x)[0]      # distributed to x only
d_partial = 5 + 8                            # value of x + 8, one step early
check((d_echo, d_nodist, d_partial) == (8, 11, 13), "recipes: 8 echo, 11 no-distribution, 13 x + 8")
check(len({5, d_echo, d_nodist, d_partial}) == 4, "key and all three distractors distinct")
check(it["options"] == ["5", "8", "11", "13"] and it["correctAnswer"] == 0, "options / key index A")
check(strictly_ascending(opt_nums(it)), "numeric options strictly ascending")
for o in it["options"][1:]:
    check(sp.simplify(4 * (sp.Integer(o) + 8) - 52) != 0, f"option {o} fails the given equation")

print("== Q2 evaluate a linear function ==")
it = q(2)
f2 = lambda v: 9 * v + 14
check(f2(6) == 68, "f(6) = 9(6) + 14 = 68")
check((6, f2(0), 9 * 6) == (6, 14, 54), "recipes: input 6, f(0) = 14, fragment 9(6) = 54")
check(len({68, 6, 14, 54}) == 4, "key and distractors distinct")
check(it["options"] == ["6", "14", "54", "68"] and it["correctAnswer"] == 3, "options / key index D")
check(strictly_ascending(opt_nums(it)), "ascending")

print("== Q3 aggregate per batch: divide then multiply ==")
it = q(3)
TOT3, N3, M3_ = 3900, 12, 20
per = Fraction(TOT3, N3)
key3 = per * M3_
check(per == 325 and key3 == 6500, "3,900 bolts / 12 cartons = 325 per carton; 325 x 20 = 6,500")
check((Fraction(TOT3, M3_), TOT3 + M3_, TOT3 * M3_) == (195, 3920, 78000),
      "recipes: 3,900/20 = 195 (reciprocal), 3,900 + 20 = 3,920, 3,900 x 20 = 78,000 (step-skip)")
check(len({6500, 195, 3920, 78000}) == 4, "key and distractors distinct")
check(it["options"] == ["195", "3,920", "6,500", "78,000"] and it["correctAnswer"] == 2,
      "options / key index C")
check(strictly_ascending(opt_nums(it)), "ascending")
# the pipeline is genuinely two-step: no single operation on the givens reaches the key
singles = {TOT3 * M3_, TOT3 + M3_, TOT3 - M3_, Fraction(TOT3, M3_), TOT3 * N3, TOT3 + N3,
           Fraction(TOT3, N3), N3 * M3_, N3 + M3_}
check(6500 not in singles,
      "key is unreachable by any single operation on the givens (divide-then-multiply required)")
visible = " ".join((it.get("passage") or "") + " " + (it.get("text") or "") + " "
                   + it["explanation"] + " " + " ".join(it["options"]) for it in MOD["questions"])
check(not re.search(r"\b(print shop|printer|printing|press|paper|sheets?)\b", visible, re.I),
      "Q3 rewrite: no printing/paper/press scenario anywhere in the module")
check(not re.search(r"\b(2,520|2520|420|42)\b", visible),
      "Q3 rewrite: the collided values 2,520, 420 and 42 appear nowhere a student can see")
keys = [it["options"][it["correctAnswer"]] if it["questionType"] == "multiple-choice"
        else it["correctAnswer"] for it in MOD["questions"]]
check(not any(k.replace(",", "") in {"2520", "420", "42"} for k in keys),
      f"no key in the module is 2,520, 420 or 42 ({keys})")
dupe = sorted({k for k in keys if keys.count(k) > 1})
check(dupe == [],
      f"no key value repeats anywhere in the module — the Q9/Q12 echo on 12 is gone (F5) ({dupe})")
check(q(12)["correctAnswer"] != "12" and q(9)["options"][q(9)["correctAnswer"]] == "12",
      "Q12's key is no longer 12: it neither ties Q9 nor equals its own question number")

print("== Q4 difference of squares — EXHAUSTIVE over all x ==")
it = q(4)
given4 = 49 * x ** 2 - 25
prods = {"(7x - 5)(7x - 5)": (7 * x - 5) * (7 * x - 5),
         "(7x + 5)(7x - 5)": (7 * x + 5) * (7 * x - 5),
         "(7x + 5)(7x + 5)": (7 * x + 5) * (7 * x + 5),
         "(49x + 5)(49x - 5)": (49 * x + 5) * (49 * x - 5)}
check(it["options"] == list(prods), "option strings match the parsed products, single-slot template")
eq_flags = [sp.expand(prods[o] - given4) == 0 for o in it["options"]]
check(eq_flags == [False, True, False, False],
      "polynomial identity holds for exactly one option (identity = exhaustive over every x)")
check(it["correctAnswer"] == 1 and eq_flags[1], "key index B is the equivalent expression")
check(sp.expand(prods["(7x - 5)(7x - 5)"]) == 49 * x ** 2 - 70 * x + 25, "A expands to 49x^2 - 70x + 25")
check(sp.expand(prods["(7x + 5)(7x + 5)"]) == 49 * x ** 2 + 70 * x + 25, "C expands to 49x^2 + 70x + 25")
check(sp.expand(prods["(49x + 5)(49x - 5)"]) == 2401 * x ** 2 - 25, "D expands to 2401x^2 - 25")

print("== Q5 SPR ax + by = c ==")
it = q(5)
check(sp.solve(sp.Eq(9 * x + 4 * 6, 87), x) == [7], "9x + 4(6) = 87 gives x = 7")
check(9 * 7 + 4 * 6 == 87, "back-substitution confirms (7, 6) satisfies 9x + 4y = 87")

print("== Q6 SPR evaluate an exponential function ==")
it = q(6)
f6 = lambda v: 5 * 2 ** v + 9
check(f6(4) == 89, "f(4) = 5(2)^4 + 9 = 5(16) + 9 = 89")
check("5(2)<sup>x</sup>" in it["passage"] and "f(4)" in it["text"],
      "Q6 stimulus is an exponential function, evaluated at a small input")
check("x<sup>2</sup>" not in it["passage"],
      "Q6 is no longer the evaluate-a-quadratic archetype shipped at PT4 M3.06")

print("== Q7 bar graph read-off ==")
it = q(7)
BARS = {1: 18, 2: 30, 3: 12, 4: 24, 5: 6}
check(max(BARS.values()) == 30 and max(BARS, key=BARS.get) == 2,
      "tallest bar is pool 2, height 30")
check(sorted(BARS.values())[-2] == 24, "the greatest bar is unique (next tallest is 24)")
check((2, len(BARS), sum(BARS.values())) == (2, 5, 90),
      "recipes: pool label 2, 5 categories, category total 90")
check(len({30, 2, 5, 90}) == 4, "key and distractors distinct")
check(it["options"] == ["2", "5", "30", "90"] and it["correctAnswer"] == 2, "options / key index C")
check(strictly_ascending(opt_nums(it)), "ascending")

print("== Q8 parallel lines and a transversal ==")
it = q(8)
given8 = 68
key8 = 180 - given8
check(key8 == 112, "same-side interior angles are supplementary: x = 180 - 68 = 112")
check((90 - given8, given8, 180 - (90 - given8)) == (22, 68, 158),
      "recipes: complement 22, the other marked angle 68, 180 - 22 = 158")
check(len({112, 22, 68, 158}) == 4, "key and distractors distinct")
check(it["options"] == ["22", "68", "112", "158"] and it["correctAnswer"] == 2, "options / key index C")
check(strictly_ascending(opt_nums(it)), "ascending")
check(all(v + given8 != 180 for v in (22, 68, 158)), "no distractor also supplements 68")
check("not-to-scale doubt" in (it["_trap"] or ""),
      "Q8 carries the form's new trap family: not-to-scale doubt (it is the module's figure item)")
check(it["options"][1] == "68" and "drawn as an acute angle" in it["explanation"],
      "Q8 the eyeball answer (the drawn acute angle, 68) is an option and its dismissal names the drawing")
check(key8 == 180 - given8,
      "Q8 the key follows from the GIVEN measures alone, so the misleading drawing cannot change it")

print("== Q9 inverse volume formula ==")
it = q(9)
V, L, W = 4320, 24, 15
h = sp.solve(sp.Eq(L * W * sp.Symbol("h"), V), sp.Symbol("h"))[0]
check(h == 12, "V = lwh gives h = 4,320/(24)(15) = 12")
check((Fraction(V, L), Fraction(V, W), L * W) == (180, 288, 360),
      "recipes: V/l = 180, V/w = 288, base area = 360")
check(len({12, 180, 288, 360}) == 4, "key and distractors distinct")
check(it["options"] == ["12", "180", "288", "360"] and it["correctAnswer"] == 0, "options / key index A")
check(strictly_ascending(opt_nums(it)), "ascending")
check(L * W * 12 == V, "back-check: (24)(15)(12) = 4,320")

print("== Q10 equation of a shown line — EXHAUSTIVE over the plotted points ==")
it = q(10)
PTS10 = [(0, 8), (2, 2), (4, -4)]
cands = {"y = -3x - 8": -3 * x - 8, "y = -3x + 8": -3 * x + 8,
         "y = 3x + 8": 3 * x + 8, "y = 8x - 3": 8 * x - 3}
check(it["options"] == list(cands), "option strings match the parsed equations")
ok = [all(sp.simplify(cands[o].subs(x, px) - py) == 0 for px, py in PTS10) for o in it["options"]]
check(ok == [False, True, False, False], "exactly one option passes through every plotted point")
check(it["correctAnswer"] == 1 and ok[1], "key index B")
slopes = [sp.Poly(cands[o], x).all_coeffs()[0] for o in it["options"]]
check(slopes == sorted(slopes), "equation options ordered by slope, ascending")

print("== Q11 integer optimization under a TIME budget — EXHAUSTIVE over every integer count ==")
it = q(11)
BUDGET, SINGLES, TS, TT = 900, 5, 45, 75          # minutes; 5 single kayaks at 45 min, tandems at 75
feasible = lambda n_: SINGLES * TS + TT * n_ <= BUDGET
greatest = [n_ for n_ in range(0, 201) if feasible(n_) and not feasible(n_ + 1)]
check(greatest == [9], f"exactly one integer is the greatest feasible count: {greatest}")
check(SINGLES * TS + TT * 9 == 900 and SINGLES * TS + TT * 10 == 975,
      "boundary is exact: 9 tandems take exactly 900 minutes, 10 would take 975 minutes")
defensible = [v for v in (8, 9, 12, 20) if feasible(v) and not feasible(v + 1)]
check(defensible == [9], f"of the four options only the key is 'the greatest' ({defensible})")
check((9 - 1, Fraction(BUDGET, TT), Fraction(BUDGET, TS)) == (8, 12, 20),
      "recipes: strict-boundary 8, 900/75 = 12, 900/45 = 20")
check(it["options"] == ["8", "9", "12", "20"] and it["correctAnswer"] == 1, "options / key index B")
check(strictly_ascending(opt_nums(it)), "ascending")
blob11 = (it["passage"] + " " + it["text"] + " " + it["explanation"]).lower()
check("minutes" in blob11 and "preparation" in blob11,
      "Q11 constrains a TIME budget (minutes of preparation time)")
check(not re.search(r"\b(pound|pounds|weigh|weight|carry|capacity|load)\b", blob11),
      "Q11 carries no weight-cap language — it cannot duplicate M4's capacity item")

print("== Q12 SPR two-totals system — EXHAUSTIVE over every integer split of the trays ==")
it = q(12)
TRAYS12, ROLLS12, SMALL12, LARGE12 = 22, 368, 8, 20
xs, ys = sp.symbols("xs ys")
solu = sp.solve([sp.Eq(xs + ys, TRAYS12), sp.Eq(SMALL12 * xs + LARGE12 * ys, ROLLS12)],
                [xs, ys], dict=True)[0]
check(solu[ys] == 16 and solu[xs] == 6, "system gives 6 small trays and 16 large trays")
check(6 * 8 + 16 * 20 == 368 and 6 + 16 == 22, "back-check: 48 + 320 = 368 rolls on 22 trays")
# EXHAUSTIVE: enumerate every non-negative integer split of the 22 trays and keep the ones
# that hold exactly 368 rolls. Exactly one split does, so the answer is unique over the integers.
splits = [(s, TRAYS12 - s) for s in range(0, TRAYS12 + 1)
          if SMALL12 * s + LARGE12 * (TRAYS12 - s) == ROLLS12]
check(splits == [(6, 16)], f"exactly one integer split of 22 trays holds 368 rolls: {splits}")
check(str(splits[0][1]) == it["correctAnswer"], "that unique split's large-tray count is the key")
# and the key is a clean integer that ties nothing else in the module
check(it["correctAnswer"] == "16" and it["correctAnswer"] != str(12),
      "F5: the key is the clean integer 16, breaking the Q9/Q12/M4-Q16 tie on 12")

print("== Q13 SPR literal rearrangement ==")
it = q(13)
zsol = sp.solve(sp.Eq(4 * 21, 6 ** 2 * z), z)[0]
check(sp.Rational(zsol) == sp.Rational(7, 3), "4y = x^2 z with x = 6, y = 21 gives z = 7/3")
check(Fraction(84, 36) == Fraction(7, 3), "84/36 reduces to 7/3, lowest terms")
check(4 * 21 == 36 * Fraction(7, 3), "back-check: 84 = 36(7/3)")

print("== Q14 line-of-best-fit prediction — re-measured from the SVG ==")
it = q(14)
FITSLOPE, XQ = 25, 18
check(FITSLOPE * XQ == 450, "line of best fit y = 25x predicts 450 kW at 18 m/s")
check(len({450, 18, 25, 400}) == 4, "key and distractors (input, slope, observed) distinct")
check(it["options"] == ["18", "25", "400", "450"] and it["correctAnswer"] == 3, "options / key index D")
check(strictly_ascending(opt_nums(it)), "ascending")

print("== Q15 exponential model selection — EXHAUSTIVE over the model conditions ==")
it = q(15)
bases = [sp.Rational(15, 100), sp.Rational(85, 100), sp.Rational(115, 100), sp.Rational(185, 100)]
strs = ["f(t) = 24,000(0.15)ᵗ", "f(t) = 24,000(0.85)ᵗ",
        "f(t) = 24,000(1.15)ᵗ", "f(t) = 24,000(1.85)ᵗ"]
check(it["options"] == strs, "options are the single-slot base template 0.15 / 0.85 / 1.15 / 1.85")
check(sorted(bases) == bases, "option bases ascending")
# A model is defensible iff f(0) = 24,000 AND f(t+1) = f(t) - 0.15 f(t) for EVERY t (symbolic).
good = []
for i, bb in enumerate(bases):
    f = 24000 * bb ** t
    cond0 = sp.simplify(f.subs(t, 0) - 24000) == 0
    condr = sp.simplify(f.subs(t, t + 1) - f * sp.Rational(85, 100)) == 0
    if cond0 and condr:
        good.append(i)
check(good == [1], f"exactly one option satisfies both model conditions for all t: {good}")
check(it["correctAnswer"] == 1, "key index B")
check(sp.simplify(24000 * bases[0] ** 1 - 24000 * sp.Rational(15, 100)) == 0,
      "A is a decrease of 85% per year, not 15%")
check(sp.simplify(bases[2] - sp.Rational(115, 100)) == 0, "C is a 15% increase per year")
check(sp.simplify(bases[3] - sp.Rational(185, 100)) == 0, "D is an 85% increase per year")

print("== Q16 perpendicular slope ==")
it = q(16)
mk = sp.Rational(5, 8)
key16 = -1 / mk
check(key16 == sp.Rational(-8, 5), "negative reciprocal of 5/8 is -8/5")
check([sp.Rational(-8, 5), -mk, mk, 1 / mk] == [sp.Rational(-8, 5), sp.Rational(-5, 8),
                                                sp.Rational(5, 8), sp.Rational(8, 5)],
      "standing trio: plain negative, original slope, reciprocal")
check(it["options"] == ["-8/5", "-5/8", "5/8", "8/5"] and it["correctAnswer"] == 0,
      "options / key index A")
vals = [float(sp.Rational(o.replace("-", "-"))) if "/" in o else float(o) for o in
        [o.replace("-", "-") for o in it["options"]]]
vals = [float(Fraction(o)) for o in it["options"]]
check(strictly_ascending(vals), "fraction options strictly ascending by value")
check(all(sp.simplify(mk * v + 1) != 0 for v in [sp.Rational(-5, 8), mk, sp.Rational(8, 5)]),
      "no distractor slope is perpendicular to 5/8 (product with 5/8 is never -1)")

print("== Q17 minimum VALUE of a quadratic — EXHAUSTIVE over all real x ==")
it = q(17)
f17 = 3 * x ** 2 - 30 * x + 92
xv = sp.solve(sp.diff(f17, x), x)
check(xv == [5], "the vertex is at x = 5 (an INTERMEDIATE result, not the answer)")
check(sp.simplify(f17 - (3 * (x - 5) ** 2 + 17)) == 0, "vertex form f(x) = 3(x - 5)^2 + 17")
check(sp.expand(f17 - 17 - 3 * (x - 5) ** 2) == 0,
      "f(x) - 17 is identically 3(x - 5)^2, a square: nonnegative for every real x")
check(sp.solve(sp.Eq(f17 - 17, 0), x) == [5],
      "that difference vanishes only at x = 5, so 17 is attained and is the global minimum")
check(sp.minimum(f17, x, sp.S.Reals) == 17 and sp.solve(sp.Eq(f17, 17), x) == [5],
      "sympy's global minimum over the reals is 17 (exhaustive over the reals)")
check(f17.subs(x, 5) == 17, "the minimum VALUE is 17, the asked quantity")
check((3 * 25 - 30 * 5, f17.subs(x, 0)) == (-75, 92),
      "recipes: constant term dropped = -75, f(0) = 92")
check(it["options"] == ["-75", "5", "17", "92"] and it["correctAnswer"] == 2, "options / key index C")
check(strictly_ascending(opt_nums(it)), "ascending")
for v in (-75, 5, 92):
    check(sp.minimum(f17, x, sp.S.Reals) != v, f"option {v} is not the minimum value of f")
check(sp.solve(sp.Eq(f17, -75), x) == [] or all(not s.is_real for s in sp.solve(sp.Eq(f17, -75), x)),
      "-75 is below the range of f, so it is not a value of f at all")
check(sp.solve(sp.Eq(f17, 5), x) == [] or all(not s.is_real for s in sp.solve(sp.Eq(f17, 5), x)),
      "5 is below the range of f: it is the vertex's x-coordinate, not a value of f")
check(sp.simplify(f17.subs(x, 0) - 92) == 0, "92 is f(0), a genuine value of f but not its minimum")

print("== Q18 30-60-90 triangle, figure-less ==")
it = q(18)
hyp = 16
short = sp.Rational(hyp, 2)
long_ = short * sp.sqrt(3)
check(short == 8 and sp.simplify(long_ - 8 * sp.sqrt(3)) == 0, "EF = 8, DE = 8*sqrt(3)")
check(sp.simplify(short ** 2 + long_ ** 2 - hyp ** 2) == 0, "Pythagorean check: 8^2 + (8sqrt3)^2 = 16^2")
check(sp.simplify(long_ - hyp * sp.cos(sp.rad(30))) == 0, "DE = DF cos(30 deg), the adjacent leg")
opts18 = [4 * sp.sqrt(3), sp.Integer(8), 8 * sp.sqrt(2), 8 * sp.sqrt(3)]
check(it["options"] == ["4√3", "8", "8√2", "8√3"], "radical option strings")
check(strictly_ascending([float(v) for v in opts18]), "radical options ascending by value")
check(it["correctAnswer"] == 3 and sp.simplify(opts18[3] - long_) == 0, "key index D is 8*sqrt(3)")
# F3 — the trap is now "the special-triangle side ratio applied to the WRONG SIDE": the 2:1
# hypotenuse relation used on DE, the side actually asked for. Each distractor is re-derived
# from that mechanism rather than from a leg/hypotenuse interchange (M4 Q11 owns that one).
check(sp.simplify(opts18[0] - (sp.Rational(hyp, 4)) * sp.sqrt(3)) == 0,
      "A = 16 halved twice (16 -> 8 -> 4) before the sqrt(3) ratio is attached")
check(sp.simplify(opts18[1] - sp.Rational(hyp, 2)) == 0,
      "B = the 2:1 relation applied to the WRONG side: DF halved and reported as DE")
check(sp.simplify(opts18[2] - short * sp.sqrt(2)) == 0,
      "C = the 45-45-90 ratio used in place of the 30-60-90 ratio (legs assumed congruent)")
check(all(sp.simplify(v - long_) != 0 for v in opts18[:3]), "no distractor equals the key value")
check(q(18)["graphAsset"] is None, "Q18 ships no figure (hard geometry is verbal)")
check("wrong side" in (q(18)["_trap"] or "") and "ratio" in (q(18)["_trap"] or ""),
      "Q18 carries the re-pitched trap: special-triangle side ratio applied to the wrong side")
check("hypotenuse interchange" not in (q(18)["_trap"] or "")
      and "leg versus hypotenuse" not in (q(18)["_trap"] or ""),
      "Q18 no longer duplicates M4 Q11's leg-versus-hypotenuse mechanism (F3)")
check("not-to-scale" not in (q(18)["_trap"] or "")
      and "scale" not in json.dumps(q(18), ensure_ascii=False),
      "Q18 makes no appeal to a drawing it does not have")
for L, frag in (("A", "halving 16 twice"), ("B", "halving 16"),
                ("C", "two legs of triangle DEF have equal lengths")):
    check(frag in it["explanation"], f"Q18 dismissal {L} names the re-pitched mechanism ({frag})")

print("== Q19 SPR infinitely many solutions — EXHAUSTIVE over all real a ==")
it = q(19)
lhs19 = sp.expand(7 * (a_ * x + 15))
rhs19 = sp.expand(3 * a_ * x + 504 * x + a_ - 21)
check(sp.expand(lhs19 - (7 * a_ * x + 105)) == 0, "left side distributes to 7ax + 105")
check(sp.expand(rhs19 - ((3 * a_ + 504) * x + a_ - 21)) == 0,
      "right side collects to (3a + 504)x + a - 21 — the parameter sits on BOTH sides")
coefs = sp.Poly(sp.expand(lhs19 - rhs19), x).all_coeffs()
check(len(coefs) == 2, "the difference of the two sides is linear in x")
xcond = sp.solve(sp.Eq(coefs[0], 0), a_)
ccond = sp.solve(sp.Eq(coefs[1], 0), a_)
check(xcond == [126], f"matching the COEFFICIENT of x forces a = 126 ({xcond})")
check(ccond == [126], f"matching the CONSTANT terms independently forces a = 126 ({ccond})")
check(sp.expand((lhs19 - rhs19).subs(a_, 126)) == 0,
      "at a = 126 the two sides are identical for every x (infinitely many solutions)")
bad = [v for v in range(-500, 501) if sp.expand((lhs19 - rhs19).subs(a_, v)) == 0]
check(bad == [126], f"brute force over a in [-500, 500]: infinitely many solutions only at a = 126 ({bad})")
nosol = [v for v in range(-500, 501)
         if sp.Poly(sp.expand((lhs19 - rhs19).subs(a_, v)), x).all_coeffs()[0] == 0
         and sp.expand((lhs19 - rhs19).subs(a_, v)) != 0]
check(nosol == [], "no value of a produces the no-solution case, so the condition is unambiguous")
check(len(it["correctAnswer"]) == 3, "engineered 3-digit integer")

print("== Q20 point on a circle recovers the general-form constant ==")
it = q(20)
c_ = sp.Symbol("c", real=True)
circ20 = x ** 2 + y ** 2 + 10 * x - 16 * y - c_
key20 = sp.solve(circ20.subs({x: 4, y: 20}), c_)
check(key20 == [136], f"substituting (4, 20) gives c = 136 ({key20})")
check(16 + 400 + 40 - 320 == 136, "arithmetic: 4^2 + 20^2 + 10(4) - 16(20) = 136")
check(sp.expand((x ** 2 + y ** 2 + 10 * x - 16 * y - 136)
                - ((x + 5) ** 2 + (y - 8) ** 2 - 225)) == 0,
      "completing the square: (x + 5)^2 + (y - 8)^2 = 225, so the centre is (-5, 8) and r = 15")
check(sp.simplify(sp.sqrt((4 + 5) ** 2 + (20 - 8) ** 2) - 15) == 0,
      "cross-check: the distance from (-5, 8) to (4, 20) is exactly the radius 15")
check((225, 4 ** 2 + 20 ** 2, 16 + 400 - 40 + 320) == (225, 416, 696),
      "recipes: r^2 = c + 89 = 225, linear terms omitted = 416, both linear signs flipped = 696")
check(len({136, 225, 416, 696}) == 4, "key and distractors distinct")
check(it["options"] == ["136", "225", "416", "696"] and it["correctAnswer"] == 0,
      "options / key index A")
check(strictly_ascending(opt_nums(it)), "ascending")
# EXHAUSTIVE: c is determined, so no other option can put (4, 20) on the circle
for v in (225, 416, 696):
    check(sp.simplify(circ20.subs({x: 4, y: 20, c_: v})) != 0,
          f"option {v}: the point (4, 20) does NOT satisfy the equation, so {v} is not defensible")
    check(sp.simplify(v + 89 - 225) != 0 or v == 136, f"option {v} is not c under any reading")
check(all(sp.simplify(136 + 89) == 225 for _ in (0,)),
      "the completed-square constant is exactly 89 more than the key, so B is a real stopping point")
check("radius" not in it["text"] and "complet" not in it["text"],
      "Q20 no longer asks for a radius and does not require completing the square (PT4 M4.20 retired)")
# F1 — the stem was 43 all-token against the 35-token abstract cap; it is trimmed, not re-mathed.
check(stem_words(it) <= 35, f"Q20 stem {stem_words(it)} all-token tokens inside the 35-token cap")
check("(4, 20)" in it["text"] and "where c is a constant" in it["text"],
      "Q20 still supplies the point and still declares its constant (voice fingerprint 2a)")
check("the graph of the given equation is a circle" not in it["text"],
      "Q20 no longer reproduces the 12-gram frame it shared with PT4 M4.20")

print("== Q21 linear-nonlinear system — EXHAUSTIVE over both intersection points ==")
it = q(21)
sols = sp.solve([sp.Eq(y, x ** 2 - 3 * x - 10), sp.Eq(y, 2 * x - 4)], [x, y], dict=True)
pts = sorted([(s[x], s[y]) for s in sols], key=lambda p: p[0])
check(pts == [(-1, -6), (6, 8)], f"the system's two solutions are {pts}")
pos = [p for p in pts if p[0] > 0]
check(len(pos) == 1 and pos[0] == (6, 8), "exactly one solution has positive x; its y is 8")
check(it["options"] == ["-6", "2", "6", "8"] and it["correctAnswer"] == 3, "options / key index D")
check(strictly_ascending(opt_nums(it)), "ascending")
defens = [v for v in (-6, 2, 6, 8) if any(p[1] == v and p[0] > 0 for p in pts)]
check(defens == [8], f"only the key is the y-value of a positive-x solution ({defens})")
slip = sp.solve(sp.Eq(0, x ** 2 - x - 6), x)
check(sorted(slip) == [-2, 3], "sign slip (adding 2x) yields roots -2 and 3")
check(2 * 3 - 4 == 2, "the slip's positive root gives y = 2, distractor B")
check(pts[0][1] == -6 and pts[1][0] == 6, "distractors A and C are the other y and the x")

print("== Q22 SPR two constants jointly constrained ==")
it = q(22)
sol22 = sp.solve([sp.Eq(9 * a_ + b_, 7), sp.Eq(36 * a_ + b_, -11)], [a_, b_], dict=True)[0]
A22, B22 = sol22[a_], sol22[b_]
check(A22 == sp.Rational(-2, 3) and B22 == 13, f"a = {A22}, b = {B22}")
check(sp.simplify(A22 * 3 ** 2 + B22 - 7) == 0 and sp.simplify(A22 * 6 ** 2 + B22 + 11) == 0,
      "back-check: f(3) = 7 and f(6) = -11")
# F4 — the composite target is the DIFFERENCE a - b. "ab" (PT4 M4.19, PT5 M4.22) and
# "f at a new input" (PT5 M3.19) are both retired; neither recurs anywhere in PT6.
KEY22 = sp.Rational(A22 - B22)
check(KEY22 == sp.Rational(-41, 3), f"a - b = -41/3, the composite target ({KEY22})")
check(Fraction(-41, 3) < 0 and Fraction(-41, 3).denominator != 1,
      "the answer is a NEGATIVE fraction in lowest terms, as the blueprint requires")
check(Fraction(it["correctAnswer"]) == Fraction(-41, 3) and it["correctAnswer"] == "-41/3",
      "the shipped canonical answer is the lowest-terms -41/3")
wrong_targets = {"a": A22, "b": B22, "a + b": A22 + B22, "ab": A22 * B22,
                 "b - a": B22 - A22, "b/a": B22 / A22}
check(all(sp.Rational(v) != KEY22 for v in wrong_targets.values()),
      f"no wrong target coincides with a - b ({ {k: str(v) for k, v in wrong_targets.items()} })")
check(sp.Rational(A22 * B22) == sp.Rational(-26, 3),
      "the retired target ab = -26/3 is now itself a live wrong-target bait, named in _trap")
check("value of a − b?" in it["text"] and "value of ab" not in it["text"],
      "Q22 asks for a - b; the three-form 'value of ab' house habit is retired")
check("wrong target" in (it["_trap"] or "") and "difference" in (it["_trap"] or ""),
      "Q22 keeps the answer-the-wrong-target mechanism, re-pointed at the difference")

# =========================================================================== figures
print("== SVG figures (parsed and re-measured) ==")
roots = {}
for n, fname in ((7, "PT6-M3-Q07.svg"), (8, "PT6-M3-Q08.svg"),
                 (10, "PT6-M3-Q10.svg"), (14, "PT6-M3-Q14.svg")):
    p = os.path.join(ASSETS, fname)
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

# Q07 bar graph: recover the bar heights from rect geometry (baseline 250, 6 px per snail)
rects = [el for el in roots["PT6-M3-Q07.svg"].iter() if el.tag.endswith("rect")]
heights = [round((250 - float(el.get("y"))) / 6) for el in sorted(rects, key=lambda e: float(e.get("x")))]
check(len(rects) == 5, "Q07 draws exactly 5 bars")
check(heights == [18, 30, 12, 24, 6], f"Q07 bars re-measure to {heights} == authored counts")
check(all(round(float(el.get("height"))) == 6 * h for el, h in
          zip(sorted(rects, key=lambda e: float(e.get("x"))), heights)),
      "Q07 each rect height equals 6 px per snail (bars start at the axis)")
q7 = open(os.path.join(ASSETS, "PT6-M3-Q07.svg"), encoding="utf-8").read()
check('fill="#999999"' in q7, "Q07 bars are gray-filled")
check("Number of snails" in q7 and "Tide pool" in q7, "Q07 carries roman axis titles")
check(all(f"Pool {i}" in q7 for i in range(1, 6)), "Q07 carries the five category labels")
check("#cccccc" in q7, "Q07 gridlines are #cccccc")
check("not drawn to scale" not in q7, "Q07 (data display) carries no scale note")
check(max(heights) == 30 and heights.count(30) == 1, "Q07 the tallest bar is unique")

# Q08 geometry: r and s parallel, transversal crosses both, and the DRAWN angles deliberately
# contradict the labels — this is what instantiates the "not-to-scale doubt" trap family.
q8root = roots["PT6-M3-Q08.svg"]
lines8 = [el for el in q8root.iter() if el.tag.endswith("line")]
check(len(lines8) == 3, "Q08 draws exactly three lines (r, s, t)")
rl, sl, tl = lines8
check(float(rl.get("y1")) == float(rl.get("y2")) and float(sl.get("y1")) == float(sl.get("y2")),
      "Q08 lines r and s are horizontal, hence exactly parallel as the stem states")
ry, sy = float(rl.get("y1")), float(sl.get("y1"))
tx1, ty1, tx2, ty2 = (float(tl.get(k)) for k in ("x1", "y1", "x2", "y2"))
dxt, dyt = tx2 - tx1, ty2 - ty1                       # direction of t, pointing downward
check(dyt > 0 and abs(dyt / dxt) > 1, "Q08 the transversal is genuinely transverse")
check(dxt < 0, "Q08 the transversal runs from upper right to lower left")
xat = lambda yy: tx1 + dxt * (yy - ty1) / dyt
Vr, Vs = (xat(ry), ry), (xat(sy), sy)
dots8 = [(float(el.get("cx")), float(el.get("cy")))
         for el in q8root.iter() if el.tag.endswith("circle")]
check(len(dots8) == 2 and all(any(abs(dx - V[0]) < 1.0 and abs(dy - V[1]) < 1e-9 for dx, dy in dots8)
                              for V in (Vr, Vs)),
      "Q08 the two drawn dots sit on the computed intersections of t with r and s")


def wedge_deg(w):
    """drawn angle between the east ray along the parallel line and the ray w, in degrees"""
    return math.degrees(math.acos(w[0] / math.hypot(w[0], w[1])))


def inside_wedge(V, w, P):
    """P - V = alpha*(1, 0) + beta*w with alpha, beta > 0 (the wedge is convex)"""
    px, py = P[0] - V[0], P[1] - V[1]
    beta = py / w[1]
    return (px - beta * w[0]) > 0 and beta > 0


t68 = [el for el in q8root.iter()
       if el.tag.endswith("text") and (el.text or "").strip() == "68°"][0]
txel = [el for el in q8root.iter()
        if el.tag.endswith("text") and any(ch.tag.endswith("tspan") for ch in el)][0]
P68 = (float(t68.get("x")), float(t68.get("y")))
PX = (float(txel.get("x")), float(txel.get("y")))
w_down, w_up = (dxt, dyt), (-dxt, -dyt)
drawn68, drawnx = wedge_deg(w_down), wedge_deg(w_up)
check(inside_wedge(Vr, w_down, P68),
      "Q08 the 68° label lies strictly inside the wedge right of t and below r")
check(inside_wedge(Vs, w_up, PX),
      "Q08 the x° label lies strictly inside the wedge right of t and above s")
check(abs(drawn68 + drawnx - 180) < 1e-9,
      "Q08 the drawing respects r ∥ s: the two marked interior angles are drawn supplementary")
check(drawn68 > 100 and abs(drawn68 - 112.06) < 0.5,
      f"Q08 NOT TO SCALE: the angle LABELLED 68° is drawn at {drawn68:.2f}°, an obtuse angle")
check(drawnx < 80 and abs(drawnx - 67.94) < 0.5,
      f"Q08 NOT TO SCALE: the angle labelled x° (true value 112) is drawn at {drawnx:.2f}°, acute")
check(abs(drawnx - 68) < 3,
      "Q08 the drawn x° wedge measures about 68°, so eyeballing the figure yields option B, not the key")
q8 = open(os.path.join(ASSETS, "PT6-M3-Q08.svg"), encoding="utf-8").read()
check("Note: Figure not drawn to scale." in q8, "Q08 geometry figure carries the scale note")
check("68°" in q8, "Q08 shows the 68-degree angle")
check('font-style="italic"' in q8, "Q08 uses italic line labels and italic x")
check(q8.count("not drawn to scale") == 1, "Q08 has exactly one scale note")
for fname in ("PT6-M3-Q07.svg", "PT6-M3-Q10.svg", "PT6-M3-Q14.svg"):
    txt = open(os.path.join(ASSETS, fname), encoding="utf-8").read()
    check("not drawn to scale" not in txt, f"{fname} carries no scale note (only geometry figures do)")

# Q10 line graph: recover the data<->pixel map from the tick labels, then re-measure the line
q10root = roots["PT6-M3-Q10.svg"]
xt, yt = {}, {}
for el in q10root.iter():
    if el.tag.endswith("text") and (el.text or "").strip().lstrip("-").isdigit():
        val, xx, yy = int(el.text), float(el.get("x")), float(el.get("y"))
        if abs(yy - 228) < 1:
            xt[val] = xx
        elif el.get("text-anchor") == "end" and xx == 152:
            yt[val] = yy
check(len(xt) >= 4 and len(yt) >= 6, f"Q10 tick labels recovered ({len(xt)} x, {len(yt)} y)")
# scales come from tick-label SPACING (text baseline offsets cancel in a difference);
# the origin comes from the two arrowed axis lines themselves.
kx, ky = sorted(xt), sorted(yt)
SX = (xt[kx[-1]] - xt[kx[0]]) / (kx[-1] - kx[0])
SY = (yt[ky[0]] - yt[ky[-1]]) / (ky[-1] - ky[0])
axes10 = [el for el in q10root.iter() if el.tag.endswith("line") and el.get("marker-start")]
check(len(axes10) == 2, "Q10 has exactly two double-arrowed axis lines")
hax = [el for el in axes10 if float(el.get("y1")) == float(el.get("y2"))][0]
vax = [el for el in axes10 if float(el.get("x1")) == float(el.get("x2"))][0]
OY, OX = float(hax.get("y1")), float(vax.get("x1"))
check(abs(SX - 30) < 1e-9 and abs(OX - 160) < 1e-9, f"Q10 x-map px = {OX:g} + {SX:g}x")
check(abs(SY - 17.5) < 1e-9 and abs(OY - 215) < 1e-9, f"Q10 y-map py = {OY:g} - {SY:g}y")
check(all(abs((xt[k] - OX) / SX - k) < 1e-9 for k in xt),
      "Q10 every x tick label sits at its own coordinate (map cross-checked against the labels)")
check(all(abs((OY - (yt[k] - 4)) / SY - k) < 1e-9 for k in yt),
      "Q10 every y tick label sits at its own coordinate (4px text baseline offset accounted for)")
seg = [el for el in q10root.iter() if el.tag.endswith("line") and el.get("stroke-width") == "2"]
check(len(seg) == 1, "Q10 draws exactly one data line")
p1 = ((float(seg[0].get("x1")) - OX) / SX, (OY - float(seg[0].get("y1"))) / SY)
p2 = ((float(seg[0].get("x2")) - OX) / SX, (OY - float(seg[0].get("y2"))) / SY)
m10 = (p2[1] - p1[1]) / (p2[0] - p1[0])
b10 = p1[1] - m10 * p1[0]
check(abs(m10 + 3) < 1e-9 and abs(b10 - 8) < 1e-9,
      f"Q10 the drawn line re-measures to y = {m10:g}x + {b10:g} == the keyed equation")
for px, py in PTS10:
    check(abs((m10 * px + b10) - py) < 1e-9, f"Q10 drawn line passes through ({px}, {py})")
q10 = open(os.path.join(ASSETS, "PT6-M3-Q10.svg"), encoding="utf-8").read()
check(">O<" in q10 and ">x<" in q10 and ">y<" in q10, "Q10 marks origin O and italic x/y at the tips")
check(q10.count("marker-start") >= 2 and q10.count("marker-end") >= 2, "Q10 axes arrowed both ends")
check("#cccccc" in q10, "Q10 gridlines are #cccccc")

# Q14 scatter: re-measure the dots and prove the drawn fit line is their least-squares line
q14root = roots["PT6-M3-Q14.svg"]
dots = [((float(el.get("cx")) - 60) / 11.25, (300 - float(el.get("cy"))) / 0.4)
        for el in q14root.iter() if el.tag.endswith("circle")]
check(len(dots) == 10, f"Q14 plots exactly 10 data points ({len(dots)})")
xb = sum(p[0] for p in dots) / 10
yb = sum(p[1] for p in dots) / 10
ls_m = sum((p[0] - xb) * (p[1] - yb) for p in dots) / sum((p[0] - xb) ** 2 for p in dots)
ls_b = yb - ls_m * xb
check(abs(ls_m - 25) < 1e-9 and abs(ls_b) < 1e-9,
      f"Q14 least-squares line of the plotted dots is y = {ls_m:g}x + {ls_b:g} — the drawn fit line")
fit = [el for el in q14root.iter() if el.tag.endswith("line") and el.get("stroke-width") == "1.6"]
check(len(fit) == 1, "Q14 draws exactly one line of best fit")
fx1 = (float(fit[0].get("x1")) - 60) / 11.25
fy1 = (300 - float(fit[0].get("y1"))) / 0.4
fx2 = (float(fit[0].get("x2")) - 60) / 11.25
fy2 = (300 - float(fit[0].get("y2"))) / 0.4
fm = (fy2 - fy1) / (fx2 - fx1)
fb = fy1 - fm * fx1
check(abs(fm - 25) < 1e-6 and abs(fb) < 1e-6, f"Q14 drawn line re-measures to y = {fm:g}x + {fb:g}")
check(abs((fm * 18 + fb) - 450) < 1e-6, "Q14 the drawn line reads 450 kW at a wind speed of 18")
obs18 = [p for p in dots if abs(p[0] - 18) < 1e-9]
check(len(obs18) == 1 and abs(obs18[0][1] - 400) < 1e-9,
      "Q14 the plotted turbine at 18 m/s has an observed output of 400 kW (distractor C)")
check(abs(sum(p[1] - (25 * p[0]) for p in dots)) < 1e-9,
      "Q14 residuals sum to zero — the drawn line really is the best fit, not an eyeballed line")
q14 = open(os.path.join(ASSETS, "PT6-M3-Q14.svg"), encoding="utf-8").read()
check("Wind speed (meters per second)" in q14 and "Power output (kilowatts)" in q14,
      "Q14 axis titles are roman with units in parentheses")
check(">O<" in q14, "Q14 marks the origin O")
i = q14.find(">O<")
check('font-style="italic"' in q14[max(0, i - 260):i], "Q14 origin O is italic (house convention)")

nograph = [it["originalQuestionNumber"] for it in MOD["questions"]
           if it["graphAsset"] is None and it["graphDescription"] is None]
check(len(nograph) == 18, "the other 18 items carry null graphAsset/graphDescription")

# =========================================================================== traps
print("== Trap census (exactly one mechanism per item) ==")
TRAPS = {n: q(n)["_trap"] for n in range(1, 23)}
check([n for n in TRAPS if TRAPS[n] is None] == [5, 6, 12, 13, 19],
      "the five trap-free slots are the blueprint's SPRs at 5, 6, 12, 13, 19")
present = [t for t in TRAPS.values() if t]
check(len(present) == 17 and len(set(present)) == 17,
      f"17 items carry a trap and all 17 mechanisms are distinct ({len(set(present))})")
check("not-to-scale doubt" in (TRAPS[8] or ""),
      "the form's new trap family (not-to-scale doubt) sits on Q8, the item that HAS a figure")
check(q(8)["graphAsset"] and "not drawn to scale" in q8,
      "the not-to-scale trap is carried by a figure that ships the scale note")
check("wrong side" in (TRAPS[18] or ""),
      "Q18 (figure-less) carries the re-pitched special-triangle trap: ratio applied to the wrong side")
# FORM-LEVEL: no trap mechanism may repeat ACROSS the two modules either. Round 2 shipped
# leg-versus-hypotenuse at both M3 Q18 and M4 Q11 — the form's only two right-triangle items.
# The blueprint deliberately repeats some families across the form (slope/intercept x3,
# ordered-pair x2, solution-count x2, wrong-target x2), so this is NOT a blanket cross-module
# uniqueness test. It is the specific guard the round-2 audit asked for: the leg-versus-
# hypotenuse mechanism may sit on ONE item form-wide, and the form's two right-triangle items
# (M3 Q18, M4 Q11) may not share a mechanism.
M4PATH = os.path.join(HERE, "M4.json")
if os.path.exists(M4PATH):
    with open(M4PATH, encoding="utf-8") as f4:
        M4ITEMS = json.load(f4)["questions"]
    M4TRAPS = {it4["originalQuestionNumber"]: (it4["_trap"] or "") for it4 in M4ITEMS}
    leghyp = ([n for n, t in TRAPS.items() if t and "leg" in t.lower() and "hypotenuse" in t.lower()],
              [n for n, t in M4TRAPS.items() if "leg" in t.lower() and "hypotenuse" in t.lower()])
    check(leghyp == ([], [11]),
          f"leg-versus-hypotenuse is carried by exactly one item form-wide, M4 Q11 {leghyp}")
    rtt3 = [it3["originalQuestionNumber"] for it3 in MOD["questions"]
            if it3["subcategory"] == "right-triangles-trigonometry"]
    rtt4 = [it4["originalQuestionNumber"] for it4 in M4ITEMS
            if it4["subcategory"] == "right-triangles-trigonometry"]
    check(rtt3 == [18] and rtt4 == [11], f"the form's two RTT items are M3 Q{rtt3} and M4 Q{rtt4}")
    words = lambda s: set(re.findall(r"[a-z]{4,}", (s or "").lower()))
    check(TRAPS[18] != M4TRAPS[11], "the two right-triangle items carry different trap strings")
    check(not (words(TRAPS[18]) >= {"hypotenuse", "interchanged"})
          and not (words(TRAPS[18]) >= {"hypotenuse", "interchange"}),
          "M3 Q18 does not run M4 Q11's interchange-the-hypotenuse mechanism")
    check("wrong side" not in M4TRAPS[11].lower() and "ratio" not in M4TRAPS[11].lower(),
          "M4 Q11 does not run M3 Q18's wrong-side ratio mechanism either")
check("r²" in (TRAPS[20] or ""), "Q20 keeps the blueprint's r-squared mechanism, new archetype")
check("verbatim-number echo" in (TRAPS[1] or ""), "Q1 verbatim-number echo")
check("slope/intercept" in (TRAPS[10] or ""), "Q10 slope/intercept role swap")
check("reciprocal" in (TRAPS[16] or "") and "reciprocal" in (TRAPS[3] or ""),
      "Q3 reciprocal rate and Q16 reciprocal-versus-negative-reciprocal")
check("ordered-pair" in (TRAPS[17] or ""), "Q17 ordered-pair / x-versus-y reversal")
check("wrong target" in (TRAPS[22] or ""), "Q22 answer-the-wrong-target composite")
check("exponent-structure" in (TRAPS[15] or ""), "Q15 exponent-structure conversion")
check("formula-fragment" in (TRAPS[9] or ""), "Q9 formula-fragment omission")
check("sign" in (TRAPS[4] or "") and "sign" in (TRAPS[21] or ""), "Q4 and Q21 sign mechanisms")
for it in MOD["questions"]:
    n = it["originalQuestionNumber"]
    if it["questionType"] == "multiple-choice":
        wrong = sorted(L for L in "ABCD" if L != "ABCD"[it["correctAnswer"]])
        check(sorted(it["_distractorLogic"].keys()) == wrong,
              f"Q{n} _distractorLogic covers exactly the three wrong letters")
        check(all(it["_distractorLogic"][L].strip() for L in wrong),
              f"Q{n} every distractor carries a named recipe")
    else:
        check(it["_distractorLogic"] is None and it["_sprForms"],
              f"Q{n} SPR metadata shape (no distractors, entry-form note present)")

# =========================================================================== originality firewall
print("== Originality firewall (PT4 and PT5 contexts must not recur) ==")
PT4 = ["pottery", "seed packet", "recycling", "nature center", "ferry", "storage crate",
       "greenhouse", "seedling", "marsh bird", "freight elevator", "furlong", "library",
       "kiln", "canopy", "banner", "bus route", "robotics", "used bicycle", "Nadia"]
PT5 = ["orchard", "cistern", "chess club", "creamery", "solar array", "gondola", "test plot",
       "parking garage", "weather balloon", "grain silo", "museum", "textile", "trail crew",
       "lichen", "thallus", "courier", "Mateo", "Idris"]
blob = json.dumps(MOD, ensure_ascii=False).lower()
for w in PT4 + PT5:
    check(w.lower() not in blob, f"prior-form context '{w}' absent")
check("porzana" not in blob and "rhizocarpon" not in blob,
      "no prior-form Latin binomial reused")

# =========================================================================== instrument report
print("== Length report under the corrected all-token ruler (F7) ==")
print("   Q  stem/cap   rationale/norm  ratio")
over_stem, over_rat = [], []
for it in MOD["questions"]:
    n = it["originalQuestionNumber"]
    sw = stem_words(it)
    w = rat_words(it["explanation"])
    norm = (NORM_SPR if it["questionType"] == "user-input" else NORM_MC)[it["difficulty"]]
    if sw > STEMCAP[n]:
        over_stem.append((n, sw, STEMCAP[n]))
    if w >= 1.45 * norm:
        over_rat.append((n, w, norm))
    print("  %2d  %3d/%-3d     %3d/%-3d       %.2f" % (n, sw, STEMCAP[n], w, norm, w / norm))
check(over_stem == [], f"no stem exceeds its section 2b cap on the all-token ruler {over_stem}")
check(over_rat == [], f"no rationale runs 45%+ over its section 7 norm {over_rat}")
print("  max stem ratio %.2f · max rationale ratio %.2f · mean rationale ratio %.2f"
      % (max(stem_words(i) / STEMCAP[i["originalQuestionNumber"]] for i in MOD["questions"]),
         max(rat_words(i["explanation"])
             / (NORM_SPR if i["questionType"] == "user-input" else NORM_MC)[i["difficulty"]]
             for i in MOD["questions"]),
         sum(rat_words(i["explanation"])
             / (NORM_SPR if i["questionType"] == "user-input" else NORM_MC)[i["difficulty"]]
             for i in MOD["questions"]) / 22))

# =========================================================================== summary
print()
if FAIL:
    print(f"{len(FAIL)} CHECK(S) FAILED:")
    for f_ in FAIL:
        print("  -", f_)
    sys.exit(1)
print("ALL CHECKS PASSED — M3.json verified clean.")
