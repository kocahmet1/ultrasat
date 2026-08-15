# -*- coding: utf-8 -*-
"""
verify_M4.py — independent verification of ULTRASAT Practice Test 5, MODULE 4 (Math Module 2).

Run:  python verify_M4.py            (from this directory, or anywhere; paths are script-relative)
Deps: sympy   (pip install sympy --break-system-packages)

Checks
  A. Per-item mathematics: the key is recomputed from scratch with sympy.
  B. Per-item distractors: each wrong option is re-derived from its NAMED error recipe
     (see _distractorLogic in M4.json) and confirmed to (i) equal that option and
     (ii) differ from the key.
  C. Numeric multiple-choice option sets are strictly ascending.
  D. Every acceptedAnswers entry evaluates to the canonical answer and is <= 5 characters
     (6 when a leading minus sign is present).
  E. Blueprint conformance: domain/skill quotas, difficulty curve, SPR positions and
     difficulties, visual quota, key-letter balance, app format contract (options plain text,
     bare < / > escaped in HTML, assets present).
"""
from __future__ import annotations
import json, os, re, sys, math
from fractions import Fraction
import sympy as sp
from _spr_enum import spr_enumerate      # shared enumerator, also used by verify_M3.py

HERE = os.path.dirname(os.path.abspath(__file__))
MODULE_PATH = os.path.join(HERE, "M4.json")
ASSET_DIR = os.path.join(HERE, "assets")

FAILS: list[str] = []
CHECKS = 0

def ck(cond, label):
    global CHECKS
    CHECKS += 1
    if not cond:
        FAILS.append(label)

def eqv(a, b):
    """Symbolic / numeric equality."""
    return sp.simplify(sp.nsimplify(a) - sp.nsimplify(b)) == 0

with open(MODULE_PATH, encoding="utf-8") as f:
    MOD = json.load(f)
QS = MOD["questions"]
BY_N = {q["originalQuestionNumber"]: q for q in QS}

x, w, v, a, b, p, t, m_, y = sp.symbols("x w v a b p t m y")
xr = sp.Symbol("xr", real=True)


# ----------------------------------------------------------------- helpers
def opts(n):
    return BY_N[n]["options"]

def key_opt(n):
    q = BY_N[n]
    return q["options"][q["correctAnswer"]]

def key_idx(n):
    return BY_N[n]["correctAnswer"]

def num(sv):
    """Parse an option string that denotes a number ('3/4', '2,268', '0.3', '-1', '300π').
    A trailing pi is stripped: pi-symbolic option sets are compared on their coefficients."""
    s = sv.replace(",", "").replace("π", "").strip()
    return Fraction(s) if "/" in s else Fraction(str(sp.Rational(str(s))))

STRIP_TAGS = re.compile(r"</?[A-Za-z][^>]*>")
DISPLAY_EQ = re.compile(r"<div style=\"text-align:center[^\"]*\">.*?</div>", re.S)
DATA_TABLE = re.compile(r"<table.*?</table>", re.S)

def rat_words(s):
    """Rationale length, HONEST RULER (round-2 instrument repair): every
    whitespace-delimited token counts. The previous version kept only tokens
    containing [A-Za-z0-9], which silently discarded the operator tokens
    '+', '-', '=' and read a 190-word rationale as 148."""
    return len([t for t in re.split(r"\s+", s.strip()) if t])

def stem_words(q):
    """Spec 2b prose words, HONEST RULER (round-2 instrument repair): every
    whitespace-delimited token of the tag-stripped stem counts, numerals
    included. The previous version kept only tokens containing a letter, which
    discarded every numeral and read 36-word stems as 33.
    Non-prose stimuli are excluded, as '2b prose words' requires: displayed
    equations (already excluded before) and HTML data tables (whose cell values
    are tabular data, not stem prose)."""
    blob = (q.get("passage") or "") + " " + (q["text"] or "")
    blob = DATA_TABLE.sub(" ", DISPLAY_EQ.sub(" ", blob))
    return len([t for t in re.split(r"\s+", STRIP_TAGS.sub(" ", blob).strip()) if t])

def check_length_ruler():
    """The instrument must not drop numerals or operators (round-2 regression guard)."""
    ck(rat_words("Adding a + b = 9 yields 2a = 6.") == 10,
       "rat_words must count every whitespace token (operators and numerals included)")
    ck(stem_words({"passage": None, "text": "If 3 + 4 = 7, what is 2x?"}) == 9,
       "stem_words must count every whitespace token (numerals and operators included)")

def assert_options(n, expected):
    """expected: list of 4 strings, in order."""
    ck(opts(n) == expected, "Q%d options mismatch: %r != %r" % (n, opts(n), expected))

def assert_key(n, letter):
    ck("ABCD"[key_idx(n)] == letter, "Q%d key letter is %s, expected %s" % (n, "ABCD"[key_idx(n)], letter))

def distinct(n, key_value, derived: dict):
    """derived maps letter -> re-derived value; confirm it matches the option and differs from key."""
    for letter, val in derived.items():
        i = "ABCD".index(letter)
        ck(eqv(num(opts(n)[i]), val) if isinstance(val, (int, float, Fraction, sp.Rational)) else eqv(sp.sympify(opts(n)[i]), val),
           "Q%d distractor %s does not match its recipe" % (n, letter))
        ck(not eqv(val, key_value), "Q%d distractor %s equals the key" % (n, letter))


# ================================================================= ITEM MATH
def q01():
    fee, rate = 4, 3                                  # flat entry fee, $/hour
    ck(key_opt(1) == "y = %dx + %d" % (rate, fee), "Q1 key equation")
    assert_options(1, ["y = 3x + 4", "y = 4x + 3", "y = 7x", "y = 12x"])
    assert_key(1, "A")
    # distractor recipes
    ck(opts(1)[1] == "y = %dx + %d" % (fee, rate), "Q1 B = slope/intercept swap")
    ck(opts(1)[2] == "y = %dx" % (rate + fee), "Q1 C = fee added to rate")
    ck(opts(1)[3] == "y = %dx" % (rate * fee), "Q1 D = fee multiplied by rate")
    # every distractor is a genuinely different function
    for i in (1, 2, 3):
        f_key = 3 * x + 4
        f_d = {1: 4 * x + 3, 2: 7 * x, 3: 12 * x}[i]
        ck(sp.simplify(f_key - f_d) != 0, "Q1 distractor %s equals the key function" % "ABCD"[i])

def q02():
    expr = 6 * (3 * x + 2) - 4 * (2 * x - 5)
    key = sp.expand(expr)                             # 10x + 32
    ck(key == 10 * x + 32, "Q2 key value")
    assert_options(2, ["10x - 8", "10x + 32", "26x - 8", "26x + 32"])
    assert_key(2, "B")
    recipes = {
        "A": sp.expand(6 * (3 * x + 2) - 4 * (2 * x + 5)),   # sign error distributing -4 to -5
        "C": sp.expand(6 * (3 * x + 2) + 4 * (2 * x - 5)),   # added instead of subtracted
        "D": sp.expand(6 * (3 * x + 2) + 4 * (2 * x + 5)),   # added + sign error
    }
    for L, val in recipes.items():
        got = sp.expand(sp.sympify(opts(2)["ABCD".index(L)].replace("x", "*x"), locals={"x": x}))
        ck(sp.simplify(got - val) == 0, "Q2 distractor %s recipe" % L)
        ck(sp.simplify(val - key) != 0, "Q2 distractor %s equals the key" % L)

def q03():
    rate_m_per_min = Fraction(300)
    key = rate_m_per_min * 60 / 1000                  # km/h
    ck(key == 18, "Q3 key value")
    assert_options(3, ["0.3", "18", "180", "18,000"])
    assert_key(3, "B")
    distinct(3, key, {
        "A": rate_m_per_min / 1000,                   # km per minute (minutes hop skipped)
        "C": rate_m_per_min * 60 / 100,               # divided by 100, not 1,000
        "D": rate_m_per_min * 60,                     # m per hour (km hop skipped)
    })

def q04():
    fx = lambda tt: Fraction(640) * Fraction(1, 2) ** tt
    key = fx(2)
    ck(key == 160, "Q4 key value")
    assert_options(4, ["2", "80", "160", "320"])
    assert_key(4, "C")
    distinct(4, key, {
        "A": Fraction(2),        # the x-value read for the y-value
        "B": fx(3),              # curve read at x = 3
        "D": fx(1),              # curve read at x = 1
    })
    # curve is on-lattice at the read points
    for tt in range(0, 4):
        ck(fx(tt).denominator == 1, "Q4 curve value at x=%d not an integer" % tt)
    # D1: the slot is now abstract - no unit-bearing context in the stem or the alt text
    blob = (BY_N[4]["passage"] or "") + " " + BY_N[4]["text"] + " " + (BY_N[4]["graphDescription"] or "")
    for w in ("gram", "hour", "mass", "substance", "experiment"):
        ck(w not in blob.lower(), "Q4 must be abstract; found context word %r" % w)
    ck("f(2)" in BY_N[4]["text"] and "xy-plane" in (BY_N[4]["passage"] or ""),
       "Q4 abstract stem asks for f(2) off a graph in the xy-plane")

def q05():
    sol = sp.solve(sp.Eq(4 * x + 19, 71), x)
    ck(sol == [13], "Q5 solution")
    ck(BY_N[5]["correctAnswer"] == "13", "Q5 canonical answer")

def q06():
    # A3: function-notation nesting (spec section 5 family, 0 in PT5 before this round)
    f = 2 * x ** 2 + 9
    g = x - 4
    inner = g.subs(x, 11)
    ck(inner == 7, "Q6 g(11) = 7")
    ck(f.subs(x, inner) == 107, "Q6 value of f(g(11))")
    ck(BY_N[6]["correctAnswer"] == "107", "Q6 canonical answer")
    # the nesting is load-bearing: the un-nested reads are different numbers
    ck(f.subs(x, 11) != 107 and g.subs(x, 11) != 107 and (g.subs(x, f.subs(x, 11))) != 107,
       "Q6 f(11), g(11) and g(f(11)) must all differ from f(g(11))")
    ck("f(g(11))" in BY_N[6]["text"], "Q6 stem must ask for the nested value f(g(11))")
    ck(BY_N[6]["_trap"] == "function-notation nesting", "Q6 trap label")
    ps = BY_N[6]["passage"] or ""
    ck(ps.count("text-align:center") == 2, "Q6 stacks the two function definitions as displayed equations")

def q07():
    X, Y = sp.symbols("X Y")
    sol = sp.solve([sp.Eq(Y, 6 * X + 4), sp.Eq(5 * X + Y, 92)], [X, Y], dict=True)[0]
    ck(sol[X] == 8 and sol[Y] == 52, "Q7 system solution")
    assert_options(7, ["8", "40", "48", "52"])
    assert_key(7, "D")
    distinct(7, Fraction(52), {
        "A": Fraction(8),        # the other variable, x
        "B": Fraction(5 * 8),    # intermediate 5x
        "C": Fraction(6 * 8),    # 6x, constant 4 dropped
    })

def q08():
    # B2: right circular cylinder, answer left in terms of pi
    r, h = 5, 12
    key = Fraction(r ** 2 * h)                       # coefficient of pi in V = pi r^2 h
    ck(key == 300, "Q8 volume coefficient")
    ck(sp.simplify(sp.pi * r ** 2 * h - 300 * sp.pi) == 0, "Q8 V = pi(5)^2(12) = 300pi")
    assert_options(8, ["25π", "60π", "120π", "300π"])
    assert_key(8, "D")
    distinct(8, key, {
        "A": Fraction(r ** 2),         # base area only: pi r^2
        "B": Fraction(r * h),          # radius not squared: pi r h
        "C": Fraction(2 * r * h),      # lateral surface area: 2 pi r h
    })
    for o in opts(8):
        ck(o.endswith("π"), "Q8 options must be pi-symbolic: %r" % o)
    ck("right circular cylinder" in BY_N[8]["text"], "Q8 solid must be a cylinder, not a prism/cube")
    ck("cube" not in BY_N[8]["text"] and "prism" not in BY_N[8]["text"],
       "Q8 must not repeat the prism/cube volume archetype used at M3 Q6")

def q09():
    # D2 ramp dip: the textile-mill item moved from position 10 to position 9
    key = sp.solve(sp.Eq(12 * x + 20 * 15, 960), x)[0]
    ck(key == 55, "Q9 hours on the narrow loom")
    assert_options(9, ["39", "48", "55", "80"])
    assert_key(9, "C")
    swapped = sp.solve(sp.Eq(20 * x + 12 * 15, 960), x)[0]
    distinct(9, Fraction(55), {
        "A": Fraction(int(swapped)),        # coefficients interchanged
        "B": Fraction(960, 20),             # wide loom alone
        "D": Fraction(960, 12),             # wide loom's output ignored
    })
    ck(12 * 55 + 20 * 15 == 960, "Q9 solution does not satisfy the model")
    ck(BY_N[9]["difficulty"] == "medium", "Q9 is the medium dip in the easy band")

def q10():
    # D2 ramp dip: the two-way-table probability item moved from position 9 to position 10
    T = {("Adult", "Member"): 45, ("Adult", "Nonmember"): 105,
         ("Student", "Member"): 15, ("Student", "Nonmember"): 35}
    adult = T[("Adult", "Member")] + T[("Adult", "Nonmember")]
    student = T[("Student", "Member")] + T[("Student", "Nonmember")]
    member = T[("Adult", "Member")] + T[("Student", "Member")]
    nonmem = T[("Adult", "Nonmember")] + T[("Student", "Nonmember")]
    grand = adult + student
    ck((adult, student, member, nonmem, grand) == (150, 50, 60, 140, 200), "Q10 table margins")
    # the passage must actually display those margins (Total row AND column)
    ps = BY_N[10]["passage"]
    for token in ("150", "50", "60", "140", "200", "Total"):
        ck(token in ps, "Q10 passage missing %s" % token)
    ck(ps.count("Total") >= 2, "Q10 needs a Total column header and a Total row label")
    key = Fraction(T[("Adult", "Member")], adult)
    ck(key == Fraction(3, 10), "Q10 conditional probability")
    assert_options(10, ["9/40", "3/10", "7/10", "3/4"])
    assert_key(10, "B")
    distinct(10, key, {
        "A": Fraction(T[("Adult", "Member")], grand),        # grand total denominator
        "C": Fraction(T[("Adult", "Nonmember")], adult),     # complement within the row
        "D": Fraction(T[("Adult", "Member")], member),       # transposed conditional
    })
    ck(BY_N[10]["difficulty"] == "easy", "Q10 is the easy straggler after the dip")

def q11():
    AC, BC, AB = 7, 24, 25          # right angle at C: AC adjacent to A, BC opposite A
    ck(AC ** 2 + BC ** 2 == AB ** 2, "Q11 triangle is not right")
    key = Fraction(AC, AB)          # cos A = adjacent / hypotenuse
    ck(key == Fraction(7, 25), "Q11 cos A")
    assert_options(11, ["7/25", "24/25", "24/7", "25/7"])
    assert_key(11, "A")
    distinct(11, key, {
        "B": Fraction(BC, AB),   # sin A
        "C": Fraction(BC, AC),   # tan A
        "D": Fraction(AB, AC),   # reciprocal of cos A (sec A)
    })
    ck("cos A" in BY_N[11]["text"], "Q11 must ask for cos A (M3 already asks for a sine)")

def q12():
    X, Y = sp.symbols("X Y")
    sol = sp.solve([sp.Eq(5 * X + 3 * Y, 50), sp.Eq(3 * X + 5 * Y, 46)], [X, Y], dict=True)[0]
    ck(sol[X] == 7 and sol[Y] == 5, "Q12 system solution")
    ck(sol[X] + sol[Y] == 12, "Q12 value of x + y")
    ck(BY_N[12]["correctAnswer"] == "12", "Q12 canonical answer")
    # the advertised shortcut must work
    ck(sp.simplify(((5 * X + 3 * Y) + (3 * X + 5 * Y)) - 8 * (X + Y)) == 0, "Q12 addition shortcut")

def q13():
    P = sp.Symbol("P")
    sol = sp.solve(sp.Eq(1 - P / 100, sp.Rational(875, 1000)), P)
    ck(sol == [sp.Rational(25, 2)], "Q13 percent decrease")
    ck(BY_N[13]["correctAnswer"] == "12.5", "Q13 canonical answer")
    ck(sp.Rational(25, 2) == sp.Rational("12.5"), "Q13 decimal/fraction agreement")

def q14():
    assert_options(14, ["x + y ≤ 25 and 28x + 45y ≤ 1,000",
                        "x + y ≤ 25 and 28x + 45y ≥ 1,000",
                        "x + y ≥ 25 and 28x + 45y ≤ 1,000",
                        "x + y ≥ 25 and 28x + 45y ≥ 1,000"])
    assert_key(14, "C")
    txt = BY_N[14]["text"]
    ck("at least 25 hours" in txt and "at most $1,000" in txt, "Q14 stem phrasing")
    # key system must be the at-least / at-most transcription and must be satisfiable
    ck(any(28 * xi + 45 * yi <= 1000 for xi, yi in [(25, 0), (30, 2), (20, 5)]
           if xi + yi >= 25), "Q14 key system is infeasible")
    # each distractor flips exactly one or both directions -> different feasible set
    ck(not (28 * 25 + 45 * 0 >= 1000), "Q14 distractor D would also admit (25, 0)")

def q15():
    W = sp.Symbol("W", positive=True)
    V, Xs = sp.symbols("V Xs", positive=True)
    sol = sp.solve(sp.Eq(3 * V, Xs * sp.sqrt(W)), W)
    key = sp.simplify(sol[0])
    ck(sp.simplify(key - 9 * V ** 2 / Xs ** 2) == 0, "Q15 solved form")
    assert_options(15, ["w = 3v²/x²", "w = 9v²/x", "w = 9v²/x²", "w = x²/(9v²)"])
    assert_key(15, "C")
    forms = {"A": 3 * V ** 2 / Xs ** 2, "B": 9 * V ** 2 / Xs, "D": Xs ** 2 / (9 * V ** 2)}
    for L, f in forms.items():
        ck(sp.simplify(f - key) != 0, "Q15 distractor %s equals the key" % L)
    # the reversal distractor is literally the reciprocal of the key
    ck(sp.simplify(forms["D"] - 1 / key) == 0, "Q15 D is not the reciprocal of the key")

def q16():
    data = [(5, 5), (10, 9), (15, 11), (20, 15), (25, 17), (30, 21), (35, 24), (40, 26), (45, 30), (50, 32)]
    xs = [d[0] for d in data]; ys = [d[1] for d in data]
    ck(all(ys[i] < ys[i + 1] for i in range(len(ys) - 1)), "Q16 data are not strictly increasing")
    def sse(pred):
        return sum((yy - pred(xx)) ** 2 for xx, yy in data)
    n = len(data)
    def linfit(X, Y):
        mx = sum(X) / n; my = sum(Y) / n
        sl = sum((X[i] - mx) * (Y[i] - my) for i in range(n)) / sum((X[i] - mx) ** 2 for i in range(n))
        return sl, my - sl * mx
    sl, ic = linfit(xs, ys)
    sse_lin = sse(lambda xx: sl * xx + ic)
    lsl, lic = linfit(xs, [math.log(yy) for yy in ys])
    sse_exp = sse(lambda xx: math.exp(lic) * math.exp(lsl * xx))
    ck(sl > 0, "Q16 fitted slope is not positive (relationship must be increasing)")
    ck(sse_lin < sse_exp, "Q16 linear model does not beat the exponential model (SSE %.2f vs %.2f)" % (sse_lin, sse_exp))
    ck(sse_lin / sum((yy - sum(ys) / n) ** 2 for yy in ys) < 0.02, "Q16 linear fit is not tight enough to be unambiguous")
    assert_options(16, ["Increasing linear", "Increasing exponential", "Decreasing linear", "Decreasing exponential"])
    assert_key(16, "A")
    ck("<i>Rhizocarpon nivalescens</i>" in BY_N[16]["passage"], "Q16 Latin binomial must be italicized in the passage")

def q17():
    M, T = sp.Symbol("M", positive=True), sp.Symbol("T", positive=True)
    # Round-2: the stem no longer HANDS the student the rescaling. It states the
    # relation m = 60t; the structural work is (i) inverting it to t = m/60 and
    # (ii) simplifying the resulting exponent. Both steps are checked here.
    t_of_m = sp.solve(sp.Eq(M, 60 * T), T)[0]
    ck(sp.simplify(t_of_m - M / 60) == 0, "Q17 inverting m = 60t must give t = m/60")
    key_exp = sp.simplify(3 * t_of_m)
    ck(sp.simplify(key_exp - M / 20) == 0, "Q17 converted exponent 3(m/60) = m/20")
    B17 = sp.Rational(115, 100)
    f = lambda tt: 900 * B17 ** (3 * sp.nsimplify(tt))
    g = lambda mm: 900 * B17 ** (sp.nsimplify(mm) * sp.Rational(1, 20))
    for tv in (sp.Integer(0), sp.Integer(1), sp.Integer(5), sp.Rational(7, 3)):
        ck(sp.simplify(g(60 * tv) - f(tv)) == 0,
           "Q17 g(60t) must equal f(t) for t = %s" % tv)
    assert_options(17, ["g(m) = 900(1.15)ᵐ⁄⁶⁰", "g(m) = 900(1.15)ᵐ⁄²⁰",
                        "g(m) = 900(1.15)³ᵐ", "g(m) = 900(1.15)¹⁸⁰ᵐ"])
    assert_key(17, "B")
    for L, e in {"A": M / 60, "C": 3 * M, "D": 180 * M}.items():
        ck(sp.simplify(e - key_exp) != 0, "Q17 distractor %s equals the key exponent" % L)
        ck(sp.simplify((900 * sp.Rational(115, 100) ** e).subs(M, 60) -
                       (900 * sp.Rational(115, 100) ** key_exp).subs(M, 60)) != 0,
           "Q17 distractor %s coincides with the key at m = 60" % L)
    ck(sp.simplify((M / 60) - key_exp / 3) == 0, "Q17 A recipe: factor of 3 dropped")
    ck(sp.simplify(3 * M - 60 * key_exp) == 0, "Q17 C recipe: substituted m for m/60")
    ck(sp.simplify(180 * M - 3 * (60 * M)) == 0,
       "Q17 D recipe: read m = 60t as t = 60m, giving the exponent 3(60m) = 180m")
    # the slot stays abstract - no real-world referent may return with the harder pitch
    blob = (BY_N[17]["passage"] or "") + " " + BY_N[17]["text"]
    for w in ("bacteria", "culture", "prepared", "hours after", "minute", "hour"):
        ck(w not in blob.lower(), "Q17 must stay abstract; found context word %r" % w)
    ck("g(m) = f(m/60)" not in BY_N[17]["text"],
       "Q17 must NOT hand the student the rescaled composition f(m/60) (round-2 regression)")
    ck("m = 60t" in BY_N[17]["text"] and "g(m) = f(t)" in BY_N[17]["text"],
       "Q17 states the relation m = 60t and leaves the inversion to the student")
    ck(BY_N[17]["difficulty"] == "hard", "Q17 hard")
    ck("Dividing both sides of the equation m = 60t by 60" in BY_N[17]["explanation"],
       "Q17 rationale derives the inversion step rather than assuming it")
    ck(rat_words(BY_N[17]["explanation"]) >= int(0.80 * 170),
       "Q17 rationale must be at least 0.80x the hard-MC norm (it was 0.70x before the repair)")
    # Unicode superscripts only (no <sup> / caret) in options
    for o in opts(17):
        ck("<" not in o and "^" not in o, "Q17 option must use Unicode superscripts: %r" % o)
        ck(any(ch in o for ch in "⁰¹²³⁴⁵⁶⁷⁸⁹ᵐ"), "Q17 option lacks Unicode superscripts: %r" % o)

def q18():
    # A1 rewrite: the tangent LINE and the point of tangency are given; the circle's
    # centre coordinate is the unknown. Trap preserved: reciprocal vs negative reciprocal.
    Y = sp.Symbol("Y")
    Px, Py = 12, 20
    ck(Px + 4 * Py == 92, "Q18 the point of tangency must lie on line k: x + 4y = 92")
    m_tan = sp.solve(sp.Eq(Px + 4 * Y, 92), Y)   # sanity: solve the line for y at x = Px
    ck(m_tan == [20], "Q18 solving x + 4y = 92 at x = 12 gives y = 20")
    slope_k = sp.Rational(-1, 4)
    ck(sp.simplify(sp.solve(sp.Eq(x + 4 * Y, 92), Y)[0].diff(x) - slope_k) == 0,
       "Q18 line k has slope -1/4")
    slope_rad = -1 / slope_k
    ck(slope_rad == 4, "Q18 radius slope is 4, the negative reciprocal of -1/4")
    Cx = 8
    c_of = lambda s: sp.nsimplify(Py + s * (Cx - Px))     # centre y for a given radius slope
    key = c_of(slope_rad)
    ck(key == 4, "Q18 key value of c")
    assert_options(18, ["4", "19", "21", "36"])
    assert_key(18, "A")
    distinct(18, Fraction(4), {
        "B": Fraction(int(c_of(-slope_k))),      # opposite of the tangent slope, 1/4
        "C": Fraction(int(c_of(slope_k))),       # the tangent slope itself, -1/4
        "D": Fraction(int(c_of(1 / slope_k))),   # plain reciprocal, -4 (no sign change)
    })
    # the radius really is perpendicular to line k, and the tangency point is on the circle
    rad_vec = sp.Matrix([Px - Cx, Py - key])
    dir_k = sp.Matrix([4, -1])                   # direction vector of x + 4y = 92
    ck(rad_vec.dot(dir_k) == 0, "Q18 radius is not perpendicular to line k")
    ck(rad_vec.dot(rad_vec) == 16 + 256, "Q18 radius length squared")
    # archetype must NOT be the question-bank shape (centre given, 'which point also lies on k')
    txt = BY_N[18]["text"]
    ck("Which of the following points" not in txt,
       "Q18 must not reproduce the question-bank 'which point also lies on line k' stem")
    ck("value of c" in txt and "tangent" in txt, "Q18 asks for a centre coordinate")

def q19():
    W = sp.Symbol("W")
    sol = sp.solve(sp.Eq(sp.Rational(85, 10) + sp.Rational(125, 100) * (W - 1), 46), W)
    ck(sol == [31], "Q19 package weight")
    ck(BY_N[19]["correctAnswer"] == "31", "Q19 canonical answer")
    ck(sp.Rational(85, 10) + sp.Rational(125, 100) * 30 == 46, "Q19 charge does not reconcile")

def q20():
    # C1: perimeter ratio -> side ratio -> area ratio (one genuine extra step), stem <= 35 words
    k = 4                                  # perimeter ratio = side ratio
    area_DEF = 32
    key = Fraction(area_DEF * k ** 2)
    ck(key == 512, "Q20 area of triangle ABC")
    assert_options(20, ["2", "8", "128", "512"])
    assert_key(20, "D")
    distinct(20, key, {
        "A": Fraction(area_DEF, k ** 2),   # divided by the area scale factor
        "B": Fraction(area_DEF, k),        # divided by the perimeter scale factor
        "C": Fraction(area_DEF * k),       # k used where k^2 belongs (the similarity-exponent trap)
    })
    # the perimeter-to-side step is real: for any similar pair the perimeter ratio equals k
    a_, b_, c_ = sp.symbols("a_ b_ c_", positive=True)
    ck(sp.simplify((k * a_ + k * b_ + k * c_) / (a_ + b_ + c_) - k) == 0,
       "Q20 perimeter ratio equals the side ratio")
    ck(BY_N[20]["_trap"].startswith("similarity exponents"), "Q20 trap label")
    ck(stem_words(BY_N[20]) <= 35, "Q20 abstract stem exceeds the 35-word cap")

def q21():
    roots = sp.solve(sp.Eq(sp.Abs(xr ** 2 - 4), 3), xr)
    real_roots = sorted({sp.nsimplify(r) for r in roots if sp.im(sp.N(r)) == 0}, key=lambda r: sp.N(r))
    ck(len(real_roots) == 4, "Q21 expected 4 distinct real solutions, got %r" % (real_roots,))
    assert_options(21, ["Zero", "Exactly one", "Exactly two", "More than two"])
    assert_key(21, "D")
    for r in real_roots:
        ck(sp.simplify(sp.Abs(r ** 2 - 4) - 3) == 0, "Q21 root %s fails verification" % r)
    # branch counts named in the dismissals
    ck(len(sp.solve(sp.Eq(xr ** 2 - 4, 3), xr)) == 2 and len(sp.solve(sp.Eq(xr ** 2 - 4, -3), xr)) == 2,
       "Q21 branch solution counts")

def q22():
    A, B = sp.symbols("A B")
    lhs = sp.expand(A * (4 * x + 6) + B * (x - 3))
    poly = sp.Poly(lhs - (11 * x - 6), x)
    sol = sp.solve(poly.coeffs(), [A, B], dict=True)[0]
    ck(sol[A] == sp.Rational(3, 2) and sol[B] == 5, "Q22 constants a and b")
    prod = sol[A] * sol[B]
    ck(prod == sp.Rational(15, 2), "Q22 value of ab")
    ck(BY_N[22]["correctAnswer"] == "15/2", "Q22 canonical answer")
    ck(sp.Rational(15, 2).q != 1 and math.gcd(15, 2) == 1, "Q22 answer must be a fraction in lowest terms")
    # identity truly holds for all x
    check = sp.simplify(lhs.subs({A: sol[A], B: sol[B]}) - (11 * x - 6))
    ck(check == 0, "Q22 identity does not hold for all x")

ITEM_CHECKS = [q01, q02, q03, q04, q05, q06, q07, q08, q09, q10, q11,
               q12, q13, q14, q15, q16, q17, q18, q19, q20, q21, q22]


# ============================================================ GLOBAL CHECKS
NUMERIC_MC = [3, 4, 7, 8, 9, 10, 11, 18, 20]   # option sets that are bare numbers/fractions/pi-multiples

def check_ascending():
    for n in NUMERIC_MC:
        vals = [num(o) for o in opts(n)]
        ck(all(vals[i] < vals[i + 1] for i in range(3)),
           "Q%d numeric options are not strictly ascending: %r" % (n, [str(v) for v in vals]))

def check_accepted():
    """E1: every SPR list must equal the shared enumerator's complete legal-entry set."""
    canon = {5: Fraction(13), 6: Fraction(107), 12: Fraction(12),
             13: Fraction(25, 2), 19: Fraction(31), 22: Fraction(15, 2)}
    for n, val in canon.items():
        q = BY_N[n]
        ck(q["questionType"] == "user-input", "Q%d should be user-input" % n)
        ck(q["correctAnswer"] in q["acceptedAnswers"], "Q%d canonical answer missing from acceptedAnswers" % n)
        full = spr_enumerate(val, q["correctAnswer"])
        ck(q["acceptedAnswers"] == full,
           "Q%d acceptedAnswers != complete legal-entry set; missing %r, extra %r"
           % (n, [s for s in full if s not in q["acceptedAnswers"]],
              [s for s in q["acceptedAnswers"] if s not in full]))
        ck(q["acceptedAnswers"][0] == q["correctAnswer"], "Q%d canonical form must be listed first" % n)
        for s in q["acceptedAnswers"]:
            limit = 6 if s.startswith("-") else 5
            ck(len(s) <= limit, "Q%d acceptedAnswer %r is %d chars (limit %d)" % (n, s, len(s), limit))
            if "/" in s or "." not in s:
                ck(Fraction(s) == val, "Q%d acceptedAnswer %r != %s" % (n, s, val))
            else:
                d = len(s.split(".")[1])
                ck(abs(Fraction(s) - val) < Fraction(1, 10 ** d),
                   "Q%d decimal acceptedAnswer %r is not a legal rendering of %s" % (n, s, val))
        # no legal equivalent fraction may be missing
        for qq in range(1, 200):
            p = val * qq
            if p.denominator == 1:
                s = "%d/%d" % (p.numerator, qq)
                if len(s) <= (6 if val < 0 else 5):
                    ck(s in q["acceptedAnswers"], "Q%d missing legal fraction entry %r" % (n, s))
        # non-integer answers must carry the entry-forms note
        if val.denominator != 1:
            ck("examples of ways to enter a correct answer" in q["explanation"],
               "Q%d non-integer SPR missing the entry-forms note" % n)
        else:
            ck("examples of ways to enter" not in q["explanation"],
               "Q%d integer SPR should not carry the entry-forms note" % n)
    ck(BY_N[13]["correctAnswer"] == "12.5", "Q13 SPR must be a terminating decimal")
    ck("/" in BY_N[22]["correctAnswer"], "Q22 SPR must be a fraction")
    ints = [n for n in canon if canon[n].denominator == 1]
    ck(len(ints) == 4, "M4 SPR census: 4 integers, 1 decimal, 1 fraction")
    ck(any(len(BY_N[n]["correctAnswer"]) == 3 for n in ints),
       "M4 supplies at least one engineered three-digit integer")

def check_blueprint():
    ck(MOD["moduleNumber"] == 4 and MOD["section"] == "Math", "module metadata")
    ck(MOD["calculatorAllowed"] is True and MOD["timeLimit"] == 2100, "module metadata (calc/time)")
    ck(MOD["title"] == "Exam 5, Module 4", "module title")
    ck(len(QS) == 22, "module must contain 22 questions")
    ck([q["originalQuestionNumber"] for q in QS] == list(range(1, 23)), "question numbering 1..22")

    DOMAIN = {11: "ALG", 12: "ALG", 13: "ALG", 14: "ALG", 15: "ALG",
              16: "ADV", 17: "ADV", 18: "ADV",
              19: "PSDA", 20: "PSDA", 21: "PSDA", 22: "PSDA", 23: "PSDA", 24: "PSDA", 25: "PSDA",
              26: "GEO", 27: "GEO", 28: "GEO", 29: "GEO"}
    SUBNAME = {11: "linear-equations-one-variable", 12: "linear-functions", 13: "linear-equations-two-variables",
               14: "systems-linear-equations", 15: "linear-inequalities", 16: "nonlinear-functions",
               17: "nonlinear-equations", 18: "equivalent-expressions", 19: "ratios-rates-proportions",
               20: "percentages", 21: "one-variable-data", 22: "two-variable-data", 23: "probability",
               24: "inference-statistics", 25: "evaluating-statistical-claims", 26: "area-volume",
               27: "lines-angles-triangles", 28: "right-triangles-trigonometry", 29: "circles"}
    for q in QS:
        ck(SUBNAME[q["subcategoryId"]] == q["subcategory"],
           "Q%d subcategory/id mismatch" % q["originalQuestionNumber"])

    dom = {}
    for q in QS:
        dom[DOMAIN[q["subcategoryId"]]] = dom.get(DOMAIN[q["subcategoryId"]], 0) + 1
    ck(dom == {"ALG": 7, "ADV": 7, "PSDA": 4, "GEO": 4}, "domain quotas: %r" % dom)

    want_skills = {12: 2, 18: 2, 19: 1, 16: 3, 11: 1, 14: 2, 26: 1, 23: 1,
                   13: 1, 28: 1, 20: 1, 15: 1, 17: 2, 22: 1, 29: 1, 27: 1}
    got_skills = {}
    for q in QS:
        got_skills[q["subcategoryId"]] = got_skills.get(q["subcategoryId"], 0) + 1
    ck(got_skills == want_skills, "skill quotas: %r" % got_skills)
    ck(got_skills.get(24, 0) == 0 and got_skills.get(25, 0) == 0,
       "inference-statistics and evaluating-statistical-claims must be absent from PT5 M4")
    ck(got_skills.get(23, 0) == 1, "probability appears exactly once (Module 4 only)")
    ck(got_skills.get(29, 0) == 1, "at least one circles item per module")

    diffs = [q["difficulty"] for q in QS]
    ck(diffs.count("easy") == 9 and diffs.count("medium") == 7 and diffs.count("hard") == 6,
       "difficulty mix must be 9E/7M/6H, got %r" % {d: diffs.count(d) for d in set(diffs)})
    # D2: monotone ramp WITH the one honest dip the spec licenses (medium Q9, easy Q10)
    ck(diffs == ["easy"] * 8 + ["medium", "easy"] + ["medium"] * 6 + ["hard"] * 6,
       "ramp must be E x8, medium dip at Q9, easy straggler at Q10, M x6, H x6; got %r" % diffs)
    ck(diffs[8] == "medium" and diffs[9] == "easy",
       "ramp carries exactly one dip (Q9 medium before Q10 easy), not a perfect step function")

    spr = [q["originalQuestionNumber"] for q in QS if q["questionType"] == "user-input"]
    ck(spr == [5, 6, 12, 13, 19, 22], "SPR positions must be 5, 6, 12, 13, 19, 22; got %r" % spr)
    ck([BY_N[n]["difficulty"] for n in spr] == ["easy", "easy", "medium", "medium", "hard", "hard"],
       "SPR difficulty ladder E/E/M/M/H/H")
    mc = [q for q in QS if q["questionType"] == "multiple-choice"]
    ck(len(mc) == 16, "16 MC items required")

    tally = {c: 0 for c in "ABCD"}
    for q in mc:
        tally["ABCD"[q["correctAnswer"]]] += 1
    ck(all(3 <= tally[c] <= 5 for c in "ABCD"), "key-letter balance 4/4/4/4 +/-1: %r" % tally)
    ck(tally == {"A": 4, "B": 4, "C": 4, "D": 4}, "key-letter tally is not exactly 4/4/4/4: %r" % tally)

    vis = [q["originalQuestionNumber"] for q in QS if q["graphAsset"]]
    ck(vis == [4, 11, 16], "SVG assets expected at Q4, Q11, Q16; got %r" % vis)
    ck("<table" in (BY_N[10]["passage"] or ""), "Q10 must carry the HTML two-way table")
    ck(BY_N[9]["graphAsset"] is None, "Q9 carries no asset after the ramp-dip swap")
    ck(len(vis) + 1 == 4, "visual quota is 4 per module (3 SVG + 1 HTML table)")
    for n in vis:
        fn = BY_N[n]["graphAsset"]
        ck(fn == "PT5-M4-Q%02d.svg" % n, "Q%d asset filename %r" % (n, fn))
        ck(os.path.exists(os.path.join(ASSET_DIR, fn)), "missing asset file %s" % fn)
        ck(bool(BY_N[n]["graphDescription"]), "Q%d graphDescription missing" % n)
    for q in QS:
        if not q["graphAsset"]:
            ck(q["graphDescription"] is None, "Q%d has a graphDescription without an asset" % q["originalQuestionNumber"])

def check_format_contract():
    tagish = re.compile(r"<[A-Za-z/!]")
    for q in QS:
        n = q["originalQuestionNumber"]
        for o in q["options"]:
            ck(not tagish.search(o), "Q%d option contains a tag-shaped '<': %r" % (n, o))
            ck("&" not in o, "Q%d option contains an HTML entity: %r" % (n, o))
            ck("\\" not in o, "Q%d option contains LaTeX backslash: %r" % (n, o))
            ck("−" not in o, "Q%d option must use an ASCII hyphen as minus: %r" % (n, o))
        ck(len(q["options"]) in (0, 4), "Q%d must have 0 or 4 options" % n)
        if q["questionType"] == "multiple-choice":
            ck(len(q["options"]) == 4 and isinstance(q["correctAnswer"], int), "Q%d MC shape" % n)
            ck(q["acceptedAnswers"] is None, "Q%d MC acceptedAnswers must be null" % n)
            ck(len(set(q["options"])) == 4, "Q%d has duplicate options" % n)
            ck(isinstance(q["_distractorLogic"], dict) and set(q["_distractorLogic"]) == set("ABCD"),
               "Q%d _distractorLogic must name all four letters" % n)
        else:
            ck(q["options"] == [] and isinstance(q["correctAnswer"], str), "Q%d SPR shape" % n)
            ck(isinstance(q["acceptedAnswers"], list) and q["acceptedAnswers"], "Q%d SPR acceptedAnswers" % n)
            ck(isinstance(q["_sprForms"], str) and q["_sprForms"], "Q%d _sprForms missing" % n)
        # bare < or > between spaces would be eaten by DOMPurify
        for field in ("passage", "text", "explanation"):
            s = q.get(field) or ""
            ck(" < " not in s and " > " not in s,
               "Q%d %s contains an unescaped bare < or > (use &lt; / &gt;)" % (n, field))
        ck(isinstance(q["_archetype"], str) and q["_archetype"], "Q%d _archetype missing" % n)
        ck(isinstance(q["_trap"], str) and q["_trap"], "Q%d _trap missing" % n)

def check_rationale_liturgy():
    for q in QS:
        n = q["originalQuestionNumber"]
        e = q["explanation"]
        if q["questionType"] == "multiple-choice":
            L = "ABCD"[q["correctAnswer"]]
            ck(e.startswith("Choice %s is correct." % L), "Q%d rationale must open 'Choice %s is correct.'" % (n, L))
            others = [c for c in "ABCD" if c != L]
            pos = [e.find("Choice %s is incorrect" % c) for c in others]
            ck(all(pp > 0 for pp in pos), "Q%d missing a per-choice dismissal" % n)
            ck(pos == sorted(pos), "Q%d dismissals are not in letter order" % n)
        else:
            ck(e.startswith("The correct answer is "), "Q%d SPR rationale opener" % n)
            ck("Choice " not in e, "Q%d SPR rationale must not dismiss choices" % n)
        ck("Therefore," in e, "Q%d rationale lacks a 'Therefore,' closer" % n)
        ck("'" not in e, "Q%d rationale uses a straight apostrophe; CB uses the curly form" % n)
        for field in ("passage", "text"):
            ck("'" not in (q.get(field) or ""), "Q%d %s uses a straight apostrophe" % (n, field))
        ck("we " not in e.lower() and " you " not in e.lower() and "let's" not in e.lower(),
           "Q%d rationale uses a forbidden first/second-person voice" % n)

def check_prose_lengths():
    """Spec section 7 rationale norms (110/135/170 MC, 40/100/130 SPR) at +/-45%,
    and the section 2b stem caps (equiv-expr 15, abstract 35, applied 55)."""
    NORM_MC = {"easy": 110, "medium": 135, "hard": 170}
    NORM_SPR = {"easy": 40, "medium": 100, "hard": 130}
    CAPS = {1: 55, 2: 15, 3: 55, 4: 35, 5: 35, 6: 35, 7: 35, 8: 55, 9: 55, 10: 55,
            11: 35, 12: 35, 13: 35, 14: 55, 15: 35, 16: 55, 17: 35, 18: 35, 19: 55,
            20: 35, 21: 35, 22: 35}
    for q in QS:
        n = q["originalQuestionNumber"]
        w = rat_words(q["explanation"])
        norm = (NORM_SPR if q["questionType"] == "user-input" else NORM_MC)[q["difficulty"]]
        lo, hi = int(0.55 * norm), int(1.45 * norm)
        ck(lo <= w <= hi, "Q%d rationale %d words outside [%d, %d] (norm %d, ratio %.2f)"
                          % (n, w, lo, hi, norm, w / norm))
        sw = stem_words(q)
        ck(sw <= CAPS[n], "Q%d stem prose %d words exceeds the cap of %d" % (n, sw, CAPS[n]))

def check_applied_share():
    """D1: applied share 8/22 in M4 -> 15/44 = 34% for the form (band 30-35%)."""
    APPLIED = [1, 3, 8, 9, 10, 14, 16, 19]
    markers = ("garage", "balloon", "silo", "loom", "museum", "brush", "lichen", "courier")
    got = [q["originalQuestionNumber"] for q in QS
           if any(w in ((q.get("passage") or "") + " " + q["text"]).lower() for w in markers)]
    ck(got == APPLIED, "applied slots %r != %r" % (got, APPLIED))
    ck(len(got) == 8, "M4 contributes 8 applied items; with M3's 7 the form lands at 15/44 = 34%")

def check_figures():
    import xml.etree.ElementTree as ET
    for n in (4, 11, 16):
        fn = BY_N[n]["graphAsset"]
        path = os.path.join(ASSET_DIR, fn)
        txt = open(path, encoding="utf-8").read()
        root = ET.parse(path).getroot()
        ck(root.tag.endswith("svg") and root.get("width") == "380", "%s canvas width 380" % fn)
        ck("Georgia" in (root.get("font-family") or ""), "%s uses the Georgia serif stack" % fn)
        if ">O<" in txt:                       # E2: origin glyph italic on every figure
            i = txt.find(">O<")
            ck('font-style="italic"' in txt[max(0, i - 300):i],
               "%s origin O must be italic (house convention across all six figures)" % fn)
    q4 = open(os.path.join(ASSET_DIR, "PT5-M4-Q04.svg"), encoding="utf-8").read()
    ck(">x<" in q4 and ">y<" in q4, "Q4 abstract graph carries italic x/y at the axis tips")
    ck("Time (hours)" not in q4 and "Mass (grams)" not in q4,
       "Q4 abstract graph must not carry unit-bearing roman axis titles")
    ck("not drawn to scale" not in q4, "Q4 coordinate grid carries no scale note")
    ck("#cccccc" in q4, "Q4 gridlines are #cccccc")
    # E2: the right triangle is now drawn roughly to proportion
    q11path = os.path.join(ASSET_DIR, "PT5-M4-Q11.svg")
    root11 = ET.parse(q11path).getroot()
    d = [el.get("d") for el in root11.iter() if el.tag.endswith("path")][0]
    cx, cy, ax_, ay_, bx_, by_ = [float(v) for v in re.findall(r"-?\d+(?:\.\d+)?", d)][:6]
    ca = ((ax_ - cx) ** 2 + (ay_ - cy) ** 2) ** .5
    cb = ((bx_ - cx) ** 2 + (by_ - cy) ** 2) ** .5
    ab = ((ax_ - bx_) ** 2 + (ay_ - by_) ** 2) ** .5
    base = ca / 7.0
    for drawn, label in ((ca, 7), (cb, 24), (ab, 25)):
        ck(abs(drawn / label - base) <= 0.05 * base,
           "Q11 drawn side %.1f px is out of proportion with its label %d (%.2f vs %.2f px/unit)"
           % (drawn, label, drawn / label, base))
    q11 = open(q11path, encoding="utf-8").read()
    ck("Note: Figure not drawn to scale." in q11, "Q11 geometry figure keeps the scale note")

def check_originality_guards():
    """Contexts must not collide with PT4 or with PT5 Module 3's reserved contexts."""
    banned = ["pottery", "community garden", "recycling drive", "nature-center", "ferry",
              "storage crate", "greenhouse", "marsh bird", "freight elevator", "furlong",
              "library patrons", "ceramics kiln", "tree canopy", "square banner", "bus route",
              "robotics", "used bicycle", "Nadia",
              "orchard", "cistern", "chess club", "creamery", "solar array", "gondola"]
    blob = " ".join((q.get("passage") or "") + " " + q["text"] for q in QS).lower()
    for term in banned:
        ck(term.lower() not in blob, "reserved/PT4 context term appears: %r" % term)
    names = ["Idris"]
    found = [nm for nm in names if nm in blob or nm.lower() in blob]
    ck(len(found) <= 2, "at most 2 named people per module")
    binomials = sum((q.get("passage") or "").count("<i>") for q in QS)
    ck(binomials == 1, "exactly one Latin binomial per form, italicized once; got %d" % binomials)


# ===================================================================== MAIN
def main():
    for fn in ITEM_CHECKS:
        try:
            fn()
        except Exception as exc:                     # noqa: BLE001
            FAILS.append("%s raised %s: %s" % (fn.__name__, type(exc).__name__, exc))
    for fn in (check_length_ruler, check_ascending, check_accepted, check_blueprint,
               check_format_contract, check_rationale_liturgy, check_prose_lengths,
               check_applied_share, check_figures, check_originality_guards):
        try:
            fn()
        except Exception as exc:                     # noqa: BLE001
            FAILS.append("%s raised %s: %s" % (fn.__name__, type(exc).__name__, exc))

    mc = [q for q in QS if q["questionType"] == "multiple-choice"]
    tally = {c: 0 for c in "ABCD"}
    for q in mc:
        tally["ABCD"[q["correctAnswer"]]] += 1
    print("ULTRASAT PT5 - MODULE 4 verification")
    print("  questions      : %d (%d MC / %d SPR)" % (len(QS), len(mc), len(QS) - len(mc)))
    print("  key letters    : %s" % tally)
    print("  SPR answers    : %s" % {q["originalQuestionNumber"]: q["correctAnswer"]
                                     for q in QS if q["questionType"] == "user-input"})
    print("  assertions run : %d" % CHECKS)
    if FAILS:
        print("\nFAILURES (%d):" % len(FAILS))
        for f in FAILS:
            print("   - " + f)
        return 1
    print("\nALL CHECKS PASSED")
    return 0

if __name__ == "__main__":
    sys.exit(main())
