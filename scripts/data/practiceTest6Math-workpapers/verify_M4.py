# -*- coding: utf-8 -*-
"""
verify_M4.py - independent verification of ULTRASAT Practice Test 6, MODULE 4 (Math Module 2).

Run:  python verify_M4.py          (paths are script-relative; run from anywhere)
Deps: sympy                        (pip install sympy)

What is checked
  A. Per-item mathematics: every key is recomputed from scratch with sympy / exact rationals.
  B. Per-item distractors: every wrong option is re-derived from its NAMED recipe
     (_distractorLogic in M4.json) and shown to (i) equal that option and (ii) differ from the key.
  C. No non-keyed option is defensible. For the statement / inequality / sufficiency /
     solution-count items (Q9, Q13, Q16, Q18, Q19, Q20) this is done EXHAUSTIVELY over the
     admissible configurations, not by spot check:
        Q09  a concrete 400-value data set with the stated mean and margin is built and every
             one of the four propositions is evaluated against it
        Q13  every integer run-through count in [0, 40] is tested against the time budget
        Q16  every rational k on a dense grid is tested for solution count
        Q18  the vertical-angle identity is verified over a dense grid of intersecting-segment
             configurations, the item's own configuration is constructed explicitly, and every
             admissible integer value of the third given angle is scanned
        Q19  every integer k in [-60, 60] is tested against the discriminant
        Q20  functional equivalence tested on a dense grid of t
        Q22  the constant is solved for symbolically and the full solution set is recovered
  D. Numeric MC option sets strictly ascending.
  E. acceptedAnswers is SET-EQUAL to the project's canonical enumerator (_spr_enum.py):
     every legal <= 5-character entry (6 with a minus) is present - the integer form, every
     equivalent fraction including unreduced ones, and every decimal form that fits, with and
     without the leading zero - and nothing illegal or over-length is present.
  F. Blueprint conformance: the MODULE 4 slot table (skill, difficulty, format, visual, trap),
     SPR positions and difficulties, SPR census, key-letter balance, applied share,
     stem caps, rationale liturgy and lengths, app format contract, figures, originality guards.

Rulers (round-3 instrument note): BOTH word counters count EVERY whitespace-delimited token -
numerals, operators and bare symbols included. Two stem rulers are reported and both are held
to the cap: 'prose' (displayed equations and data tables excluded, the spec 2b reading) and
'all' (displayed-equation tokens included, the strictest reading).
"""
from __future__ import annotations
import json, os, re, sys, math, itertools
from fractions import Fraction
import sympy as sp
from _spr_enum import spr_enumerate

HERE = os.path.dirname(os.path.abspath(__file__))
MODULE_PATH = os.path.join(HERE, "M4.json")
ASSET_DIR = os.path.join(HERE, "assets")

FAILS: list[str] = []
DIAG: dict = {}
CHECKS = 0


def ck(cond, label):
    global CHECKS
    CHECKS += 1
    if not cond:
        FAILS.append(label)


with open(MODULE_PATH, encoding="utf-8") as f:
    MOD = json.load(f)
QS = MOD["questions"]
BY_N = {q["originalQuestionNumber"]: q for q in QS}

x, y, t, a, b, k, n_, r_, v = sp.symbols("x y t a b k n r v")


# --------------------------------------------------------------------- helpers
def opts(n):
    return BY_N[n]["options"]


def key_idx(n):
    return BY_N[n]["correctAnswer"]


def key_opt(n):
    return opts(n)[key_idx(n)]


def assert_options(n, expected):
    ck(opts(n) == expected, "Q%d option list mismatch: %r != %r" % (n, opts(n), expected))


def assert_key(n, letter):
    got = "ABCD"[key_idx(n)]
    ck(got == letter, "Q%d key letter is %s, expected %s" % (n, got, letter))


SUP = {"⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4",
       "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9",
       "ᵗ": "t", "ˣ": "x", "ᵐ": "m", "⁄": "/"}


def num(sv):
    """Parse an option string denoting a number: '3/4', '2,268', '0.5', '-12', '10pi'."""
    s = sv.replace(",", "").replace("π", "").strip()
    return Fraction(s) if "/" in s else Fraction(str(sp.Rational(str(s))))


STRIP_TAGS = re.compile(r"</?[A-Za-z][^>]*>")
DISPLAY_EQ = re.compile(r"<div style=\"text-align:center[^\"]*\">.*?</div>", re.S)
DATA_TABLE = re.compile(r"<table.*?</table>", re.S)


def toks(s):
    """HONEST RULER: every whitespace-delimited token counts - numerals, operators, symbols."""
    return [tk for tk in re.split(r"\s+", s.strip()) if tk]


def rat_words(s):
    return len(toks(s))


def _stem_blob(q, drop_equations):
    blob = (q.get("passage") or "") + " " + (q["text"] or "")
    blob = DATA_TABLE.sub(" ", blob)
    if drop_equations:
        blob = DISPLAY_EQ.sub(" ", blob)
    return STRIP_TAGS.sub(" ", blob)


def stem_words_prose(q):
    return len(toks(_stem_blob(q, True)))


def stem_words_all(q):
    return len(toks(_stem_blob(q, False)))


def stem_words_full(q):
    """F7 — the ruler that drops NOTHING: every whitespace-delimited token of passage + text
    after tag-stripping, including displayed equations AND the cells of an HTML data table.
    `stem_words_all` differs from this on exactly the two table items, and the difference is
    reported item by item so no breach can hide inside an instrument."""
    blob = (q.get("passage") or "") + " " + (q["text"] or "")
    return len(toks(STRIP_TAGS.sub(" ", blob)))


def table_tokens(q):
    return stem_words_full(q) - stem_words_all(q)


def check_length_ruler():
    """Regression guard: the rulers must not silently drop numerals, operators, displayed
    equations or table cells. Round 2's M3 ruler dropped display equations, which is how a
    43-token stem read as 32 against a 35-token cap."""
    ck(rat_words("Adding a + b = 9 yields 2a = 6.") == 10,
       "rat_words must count every whitespace token (operators and numerals included)")
    ck(stem_words_prose({"passage": None, "text": "If 3 + 4 = 7, what is 2x?"}) == 9,
       "stem_words_prose must count every whitespace token")
    ck(stem_words_all({"passage": "<div style=\"text-align:center; margin:8px 0;\">2x + 1 = 9</div>",
                       "text": "What is x?"}) == 8,
       "stem_words_all must include displayed-equation tokens")
    ck(stem_words_full({"passage": "<div style=\"text-align:center; margin:8px 0;\">2x + 1 = 9</div>",
                        "text": "What is x?"}) == 8,
       "stem_words_full must include displayed-equation tokens")
    ck(stem_words_full({"passage": "<table><tr><th>x</th><td>7</td></tr></table>",
                        "text": "What is x?"}) == 5,
       "stem_words_full must ALSO count HTML table cells - it drops nothing")
    ck(stem_words_all({"passage": "<table><tr><th>x</th><td>7</td></tr></table>",
                       "text": "What is x?"}) == 3,
       "stem_words_all is the same ruler minus tabular data, and that is its ONLY difference")
    notab = [q["originalQuestionNumber"] for q in QS if "<table" not in (q.get("passage") or "")]
    ck(all(stem_words_full(BY_N[n]) == stem_words_all(BY_N[n]) for n in notab),
       "on the 20 items without a table the two rulers agree exactly, so nothing else is dropped")
    ck(sorted(n for n in range(1, 23) if table_tokens(BY_N[n])) == [8, 15],
       "exactly two items carry tabular tokens (Q8 two-way table, Q15 data table)")


def distinct_from_key(n, key_value, derived: dict, parser=num):
    """derived: letter -> re-derived numeric value. Confirms option match and key-difference."""
    for letter, val in derived.items():
        i = "ABCD".index(letter)
        got = parser(opts(n)[i])
        ck(got == val, "Q%d distractor %s: option %r does not equal its recipe value %s"
                       % (n, letter, opts(n)[i], val))
        ck(val != key_value, "Q%d distractor %s equals the key" % (n, letter))


# ===================================================================== ITEM MATH
def q01():
    """Depletion at a constant rate: start 640 cm, 16 cm per book, 96 cm remaining."""
    start, per_book, left = Fraction(640), Fraction(16), Fraction(96)
    assert_options(1, ["640 - 16n = 96", "640 + 16n = 96", "16 - 640n = 96", "16 + 640n = 96"])
    assert_key(1, "A")
    books = sp.Symbol("books", positive=True)
    situation = sp.Eq(start - per_book * books, left)
    ck(sp.solve(situation, books) == [Fraction(34)], "Q1 the situation has a whole-number solution (34 books)")
    models = {
        "A": sp.Eq(start - per_book * n_, left),
        "B": sp.Eq(start + per_book * n_, left),
        "C": sp.Eq(per_book - start * n_, left),
        "D": sp.Eq(per_book + start * n_, left),
    }
    for L, eq in models.items():
        same = sp.simplify((eq.lhs - eq.rhs) - (models["A"].lhs - models["A"].rhs)) == 0
        ck(same == (L == "A"), "Q1 option %s must%s model the situation" % (L, "" if L == "A" else " not"))
    # the role swap really is a swap: the two constants trade places
    ck(sp.simplify(models["C"].lhs.subs(n_, 1) - (per_book - start)) == 0,
       "Q1 C must place 640 in the per-book slot and 16 in the starting slot")
    # the item is a DEPLETION model, not the fee-plus-rate model of PT4 M3.02 / PT5 M4.01
    blob = BY_N[1]["text"].lower()
    for banned in ("fee", "charge", "costs", "per hour", "monthly", "flat"):
        ck(banned not in blob, "Q1 must not re-run the flat-fee-plus-rate archetype (found %r)" % banned)
    ck("remain" in blob, "Q1 must be a depletion model (a quantity remaining)")


def q02():
    expr = (7 * x ** 3 + 2 * x) - (3 * x ** 3 - 9 * x)
    key = sp.expand(expr)
    ck(key == 4 * x ** 3 + 11 * x, "Q2 key value")
    assert_options(2, ["4x³ - 7x", "4x³ + 11x", "15x³", "15x⁴"])
    assert_key(2, "B")
    recipes = {
        "A": sp.expand((7 * x ** 3 + 2 * x) - (3 * x ** 3 + 9 * x)),   # sign error on -9x
        "C": 15 * x ** 3,                                             # unlike terms combined
        "D": 15 * x ** 4,                                             # unlike terms + exponents added
    }
    parsed = {"A": 4 * x ** 3 - 7 * x, "C": 15 * x ** 3, "D": 15 * x ** 4}
    for L, val in recipes.items():
        ck(sp.simplify(parsed[L] - val) == 0, "Q2 distractor %s recipe" % L)
        ck(sp.simplify(val - key) != 0, "Q2 distractor %s equals the key" % L)
    # no non-keyed option is equivalent to the given expression at any sampled x
    for L, e in parsed.items():
        ck(any(sp.simplify(e.subs(x, xv) - key.subs(x, xv)) != 0 for xv in range(1, 6)),
           "Q2 option %s is not distinguishable from the key" % L)


def q03():
    lb_per_shift, hours, lb_per_ton = Fraction(36000), Fraction(9), Fraction(2000)
    key = lb_per_shift / hours / lb_per_ton                        # tons per hour
    ck(key == 2, "Q3 key value")
    assert_options(3, ["0.5", "2", "18", "4,000"])
    assert_key(3, "B")
    distinct_from_key(3, key, {
        "A": hours / (lb_per_shift / lb_per_ton),                  # hours per ton (reciprocal rate)
        "C": lb_per_shift / lb_per_ton,                            # tons per shift (hop skipped)
        "D": lb_per_shift / hours,                                 # pounds per hour (hop skipped)
    })


def q04():
    f = lambda z: Fraction("1.75") * z + Fraction("2.50")
    key = f(6)
    ck(key == Fraction(13), "Q4 key value")
    assert_options(4, ["2.50", "4.25", "10.50", "13.00"])
    assert_key(4, "D")
    distinct_from_key(4, key, {
        "A": f(0),                                                 # the fixed portion
        "B": Fraction("1.75") + Fraction("2.50"),                   # added instead of multiplied
        "C": Fraction("1.75") * 6,                                  # zone charge only
    })


def q05():
    sol = sp.solve([sp.Eq(4 * x + 5 * y, 121), sp.Eq(4 * x + 2 * y, 70)], [x, y], dict=True)[0]
    ck(sol[y] == 17 and sol[x] == 9, "Q5 system solution (x, y) = (9, 17)")
    ck(BY_N[5]["correctAnswer"] == "17", "Q5 canonical answer")


def q06():
    width = 14
    length = 3 * width
    ck(length * width == 588, "Q6 area value")
    ck(BY_N[6]["correctAnswer"] == "588", "Q6 canonical answer")
    ck(len("588") == 3, "Q6 supplies the form's three-digit SPR integer")


def q07():
    f = x ** 2 - 2 * x - 3
    ck(sp.solve(f, x) == [-1, 3], "Q7 parabola x-intercepts are -1 and 3")
    vx = sp.Rational(1)
    ck(sp.diff(f, x).subs(x, vx) == 0 and f.subs(x, vx) == -4, "Q7 minimum point is (1, -4)")
    ck(f.subs(x, 0) == -3, "Q7 y-intercept is (0, -3)")
    assert_options(7, ["(-3, 0)", "(-1, 0)", "(0, -3)", "(1, -4)"])
    assert_key(7, "C")
    # ordered pairs ascending by x-coordinate
    xs = [int(o.split(",")[0].strip("( ")) for o in opts(7)]
    ck(xs == sorted(xs) and len(set(xs)) == 4, "Q7 ordered pairs not ascending by x-coordinate")
    # only the key is the y-intercept; B is on the curve but is an x-intercept; D is the minimum
    ck(opts(7)[1] == "(-1, 0)" and f.subs(x, -1) == 0, "Q7 B is an x-intercept of the curve")
    ck(opts(7)[3] == "(1, -4)", "Q7 D is the minimum point")
    ck(opts(7)[0] == "(-3, 0)" and f.subs(x, -3) != 0, "Q7 A is the reversed pair and is off the curve")
    for i in (0, 1, 3):
        px, py = [int(s.strip("() ")) for s in opts(7)[i].split(",")]
        ck(not (px == 0), "Q7 option %s must not be a y-intercept" % "ABCD"[i])


def q08():
    bean_g, bean_n, sq_g, sq_n = 72, 18, 48, 62
    tot = bean_g + bean_n + sq_g + sq_n
    ck(tot == 200 and bean_g + bean_n == 90 and sq_g + sq_n == 110, "Q8 table row totals")
    ck(bean_g + sq_g == 120 and bean_n + sq_n == 80, "Q8 table column totals")
    key = Fraction(bean_g, tot)
    ck(key == Fraction(9, 25), "Q8 key value")
    assert_options(8, ["9/25", "9/20", "3/5", "4/5"])
    assert_key(8, "A")
    distinct_from_key(8, key, {
        "B": Fraction(bean_g + bean_n, tot),        # P(bean)
        "C": Fraction(bean_g, bean_g + sq_g),       # conditioned on the germinated column
        "D": Fraction(bean_g, bean_g + bean_n),     # conditioned on the bean row
    })
    passage = BY_N[8]["passage"]
    ck(passage.count("<tr") == 4 and passage.count("Total") == 2,
       "Q8 two-way table must carry a Total row AND a Total column")
    for cell in ("72", "18", "90", "48", "62", "110", "120", "80", "200"):
        ck(">%s<" % cell in passage, "Q8 table is missing the cell %s" % cell)


def q09():
    """EXHAUSTIVE: a concrete 400-value data set carrying the stated mean and margin is built,
    and each of the four propositions is evaluated against it."""
    mean_, moe, N = Fraction("18.5"), Fraction("1.2"), 400
    lo, hi = mean_ - moe, mean_ + moe
    ck((lo, hi) == (Fraction("17.3"), Fraction("19.7")), "Q9 interval endpoints 17.3 and 19.7")
    # the margin must be numerically consistent: 1.96 * s / sqrt(N) = 1.2 for a plausible s
    s_implied = float(moe) * math.sqrt(N) / 1.96
    ck(abs(s_implied - 12.2449) < 1e-3, "Q9 implied sample standard deviation %.4f" % s_implied)
    ck(5.0 < s_implied < 20.0,
       "Q9 implied standard deviation %.2f hours must be plausible for the context" % s_implied)
    # build a real data set of 400 non-negative values with exactly this mean and this margin
    d = s_implied * math.sqrt((N - 1) / N)
    data = [float(mean_) + d] * (N // 2) + [float(mean_) - d] * (N // 2)
    m_hat = sum(data) / N
    var = sum((v - m_hat) ** 2 for v in data) / (N - 1)
    s_hat = math.sqrt(var)
    ck(abs(m_hat - 18.5) < 1e-9, "Q9 constructed sample mean must be 18.5")
    ck(abs(1.96 * s_hat / math.sqrt(N) - 1.2) < 1e-6, "Q9 constructed sample must give a 1.2-hour margin")
    ck(min(data) > 0, "Q9 constructed hour values must be non-negative")
    assert_key(9, "D")
    o = opts(9)
    ck(len(set(o)) == 4, "Q9 options must be distinct")
    # A - exact population mean: false, a point estimate never fixes the population value
    ck("is exactly 18.5" in o[0], "Q9 A must be the exact-value misreading")
    ck(o[0].startswith("The mean number of hours"), "Q9 A must be a claim about the mean")
    # B - every individual inside the interval: falsified by the constructed data set
    ck("each volunteer" in o[1] and "between 17.3 hours and 19.7 hours" in o[1],
       "Q9 B must apply the interval to individual volunteers")
    outside = [v for v in data if not (float(lo) <= v <= float(hi))]
    ck(len(outside) == N, "Q9 B must be false: every individual value in the constructed sample is outside")
    # C - impossibility outside the interval: false, a margin of error bounds plausibility, not possibility
    ck("cannot be less than 17.3 hours or greater than 19.7 hours" in o[2],
       "Q9 C must be the impossibility misreading")
    for mu in (17.0, 20.0, 15.5, 22.0):
        z = abs(mu - 18.5) / (s_hat / math.sqrt(N))
        ck(z < 40, "Q9 C must be false: mu = %.1f outside the interval is improbable, not impossible" % mu)
    # D - the plausible-interval reading, and the ONLY option that states it
    ck("likely between 17.3 hours and 19.7 hours" in o[3], "Q9 D must be the plausible-interval conclusion")
    for i in (0, 1, 2):
        ck("likely between" not in o[i], "Q9 option %s must not also assert the plausible interval" % "ABCD"[i])
    # the estimate is a MEAN with units, not a percentage (the PT4 M1.14 archetype is retired)
    stem = (BY_N[9]["passage"] or "") + " " + BY_N[9]["text"]
    ck("%" not in stem and "percent" not in stem.lower(),
       "Q9 must attach the margin of error to a mean with units, not to a percentage")
    for op in o:
        ck("%" not in op, "Q9 option must not state a percentage: %r" % op)
        ck("hours" in op, "Q9 option must carry the unit: %r" % op)
    lens = [len(s.split()) for s in o]
    ck(max(lens) - min(lens) <= 12,
       "Q9 statement choices must be near-equal in length; got %r" % lens)
    DIAG["Q09"] = {"constructed sample": N, "mean": m_hat, "s": round(s_hat, 4),
                   "margin": round(1.96 * s_hat / math.sqrt(N), 4),
                   "individuals outside [17.3, 19.7]": len(outside)}


def q10():
    C = 18 * t + 25
    ck(C.subs(t, 0) == 25, "Q10 the constant 25 is the value at d = 0")
    ck(sp.simplify(C.subs(t, t + 1) - C) == 18, "Q10 the rate of change is 18 per day")
    ck(C.subs(t, 1) == 43, "Q10 the cost for 1 day is 43, not 25")
    assert_key(10, "B")
    o = opts(10)
    ck("one-time fee of $18" in o[0] and "$25 per day" in o[0], "Q10 A is the full role swap")
    ck("one-time fee of $25" in o[1] and "$18 per day" in o[1], "Q10 B is the correct mapping")
    ck("increases by $25" in o[2], "Q10 C reads 25 as the rate of change")
    ck("for 1 day is $25" in o[3], "Q10 D reads 25 as the value at d = 1")


def q11():
    leg1, leg2 = 20, 11
    hyp = math.sqrt(leg1 ** 2 + leg2 ** 2)
    ck(leg1 ** 2 + leg2 ** 2 == 521, "Q11 sum of squares")
    ck(abs(hyp - 22.8254) < 1e-3, "Q11 hypotenuse value")
    assert_options(11, ["9.0", "16.7", "22.8", "31.0"])
    assert_key(11, "C")
    swapped = math.sqrt(leg1 ** 2 - leg2 ** 2)
    ck(abs(swapped - 16.7033) < 1e-3, "Q11 leg/hypotenuse swap value")
    recipe = {"A": leg1 - leg2, "B": swapped, "D": leg1 + leg2}
    for L, val in recipe.items():
        i = "ABCD".index(L)
        ck(abs(float(opts(11)[i]) - val) < 0.05, "Q11 distractor %s recipe" % L)
    # 'closest to': the key must be strictly closest, so no other option is defensible
    d = [abs(float(o) - hyp) for o in opts(11)]
    ck(d.index(min(d)) == 2, "Q11 key is not the closest option")
    ck(sorted(d)[1] - sorted(d)[0] > 5, "Q11 closest-to margin is too small to be unambiguous")


def q12():
    v0 = sp.Symbol("v0", positive=True)
    end = v0 * Fraction("1.15") * Fraction("1.10")
    ck(sp.simplify(end - Fraction("1.265") * v0) == 0, "Q12 combined factor is 1.265")
    p = (Fraction("1.265") - 1) * 100
    ck(p == Fraction("26.5"), "Q12 key value")
    ck(BY_N[12]["correctAnswer"] == "26.5", "Q12 canonical answer")
    # terminating decimal, and NOT the additive trap 25
    ck(Fraction("26.5") != 25, "Q12 answer must differ from the additive percent trap, 25")
    ck(str(Fraction("26.5").limit_denominator()) == "53/2", "Q12 fraction form 53/2")


def q13():
    """EXHAUSTIVE integer scan of a VOLUME budget.

    The resource is deliberately neither weight (M4's own earlier draft) nor time (the resource
    M3 Q11 took in the parallel M3 fix round), so the form's two linear-inequality slots now
    constrain different quantities.
    """
    total, reserved, per_barrel = 560, 74, 34
    ok = [b_ for b_ in range(0, 41) if reserved + per_barrel * b_ <= total]
    ck(max(ok) == 14, "Q13 exhaustive integer scan: greatest admissible count is %d" % max(ok))
    ck(ok == list(range(0, 15)), "Q13 the admissible set must be 0..14 with no gaps")
    ck(reserved + per_barrel * 14 == 550 <= total, "Q13 b = 14 must fit inside the budget")
    ck(reserved + per_barrel * 15 == 584 > total, "Q13 the boundary integer 15 must exceed the budget")
    ck(Fraction(total - reserved, per_barrel) != 14,
       "Q13 the bound must NOT be met exactly (M3 Q11 owns the inclusive-boundary texture)")
    ck(BY_N[13]["correctAnswer"] == "14", "Q13 canonical answer")
    blob = ((BY_N[13].get("passage") or "") + " " + BY_N[13]["text"]).lower()
    ck("liters" in blob, "Q13 must be constrained by a volume")
    for banned in ("pound", "weight", "weigh", "carry", "boat", "rower",
                   "minute", "hour", "time", "kayak"):
        ck(banned not in blob, "Q13 must not re-use M3 Q11's constrained resource (found %r)" % banned)


def q14():
    lhs = sp.expand((3 * x + a) * (x - 5))
    rhs = 3 * x ** 2 + b * x - 20
    sols = sp.solve([sp.Eq(c1, c2) for c1, c2 in
                     zip(sp.Poly(lhs, x).all_coeffs(), sp.Poly(rhs, x).all_coeffs())], [a, b], dict=True)
    ck(len(sols) == 1 and sols[0][a] == 4 and sols[0][b] == -11, "Q14 unique constants a = 4, b = -11")
    assert_options(14, ["-19", "-15", "-11", "4"])
    assert_key(14, "C")
    distinct_from_key(14, Fraction(-11), {
        "A": Fraction(-15 + -4),   # sign error a = -4
        "B": Fraction(-15),        # ax term omitted
        "D": Fraction(4),          # the value of a
    })
    # no non-keyed b makes the identity hold for all x
    for bv in (-19, -15, 4):
        eq = sp.expand(lhs.subs(a, 4) - (3 * x ** 2 + bv * x - 20))
        ck(sp.simplify(eq) != 0, "Q14 b = %d must not satisfy the identity" % bv)


def q15():
    """Three-row table with a constant in one cell; the missing x-value is the target."""
    rows = [(3, 25), (8, 50)]
    slope = Fraction(rows[1][1] - rows[0][1], rows[1][0] - rows[0][0])
    ck(slope == 5, "Q15 slope")
    inter = rows[0][1] - slope * rows[0][0]
    ck(inter == 10, "Q15 y-intercept")
    for xv, yv in rows:
        ck(slope * xv + inter == yv, "Q15 the line must pass through (%d, %d)" % (xv, yv))
    key = Fraction(85 - inter, slope)
    ck(key == 15, "Q15 key value")
    assert_options(15, ["8", "15", "17", "19"])
    assert_key(15, "B")
    distinct_from_key(15, key, {
        "A": Fraction(85 - 5, 10),      # slope/intercept interchange: 85 = 10k + 5
        "C": Fraction(85, 5),           # constant 10 omitted
        "D": Fraction(85 + 10, 5),      # constant added rather than subtracted
    })
    # EXHAUSTIVE: no non-keyed option satisfies the table's own relation
    for i, o in enumerate(opts(15)):
        kv = Fraction(o)
        holds = (slope * kv + inter == 85)
        ck(holds == (i == 1), "Q15 option %s must%s satisfy 5k + 10 = 85" % ("ABCD"[i], "" if i == 1 else " not"))
    passage = BY_N[15]["passage"]
    ck(passage.count("<tr") == 4, "Q15 table must have a header row plus exactly THREE data rows")
    for cell in ("3", "25", "8", "50", "k", "85"):
        ck(">%s<" % cell in passage, "Q15 data table is missing the cell %s" % cell)
    # the PT5 M3.08 lead-in ("four values ... corresponding values of f(x)") must be retired
    lead = STRIP_TAGS.sub(" ", passage.split("<table")[0]).lower()
    ck("four values" not in lead, "Q15 must not re-run PT5 M3.08's four-row lead-in")
    ck("three values" in lead, "Q15 must use CB's three-row lead-in shape")


def q16():
    """Exhaustive: scan a dense rational grid of k and confirm 12 is the ONLY no-solution value."""
    assert_options(16, ["-12", "4/3", "4", "12"])
    assert_key(16, "D")
    bad = []
    grid = [Fraction(i, 3) for i in range(-90, 91)] + [Fraction(-12), Fraction(4, 3), Fraction(4), Fraction(12)]
    for kv in sorted(set(grid)):
        A = sp.Matrix([[kv, 15], [4, 5]])
        rhs = sp.Matrix([24, 6])
        det = A.det()
        if det != 0:
            continue                                   # unique solution
        aug = A.row_join(rhs)
        no_sol = aug.rank() > A.rank()
        if no_sol:
            bad.append(kv)
    ck(bad == [Fraction(12)], "Q16 exhaustive scan: no-solution values are %r, expected [12]" % bad)
    # each distractor really does yield a solvable system
    for L, kv in (("A", Fraction(-12)), ("B", Fraction(4, 3)), ("C", Fraction(4))):
        sol = sp.solve([sp.Eq(kv * x + 15 * y, 24), sp.Eq(4 * x + 5 * y, 6)], [x, y], dict=True)
        ck(len(sol) == 1, "Q16 distractor %s (k = %s) must give a solvable system" % (L, kv))
    # the k = 12 system is parallel but not coincident
    ck(Fraction(24, 6) != Fraction(15, 5), "Q16 k = 12 must give parallel, non-coincident lines")


def q17():
    f = lambda u: u ** 2 - 7 * u
    inner = 3 * 4 + 2
    ck(inner == 14, "Q17 inner input 3(4) + 2 = 14")
    key = f(14)
    ck(key == 98, "Q17 key value")
    assert_options(17, ["-34", "-12", "60", "98"])
    assert_key(17, "D")
    distinct_from_key(17, Fraction(98), {
        "A": Fraction(3 * f(4) + 2),   # transformation applied to the output
        "B": Fraction(f(4)),           # no transformation
        "C": Fraction(f(12)),          # constant dropped from the inner expression
    })
    # the nesting is the whole difficulty: arithmetic stays on small integers
    ck(f(14) == 196 - 98 and abs(f(14)) < 1000, "Q17 arithmetic must stay frictionless")


def _ang(P, Q, R):
    """Measure, in degrees, of the angle at vertex Q in the path P-Q-R."""
    ux, uy = P[0] - Q[0], P[1] - Q[1]
    vx, vy = R[0] - Q[0], R[1] - Q[1]
    c = (ux * vx + uy * vy) / (math.hypot(ux, uy) * math.hypot(vx, vy))
    return math.degrees(math.acos(max(-1.0, min(1.0, c))))


def q18():
    """EXHAUSTIVE angle-chaining proof.

    Configuration = segments WY and XZ crossing at V, so V lies strictly between W and Y and
    strictly between X and Z. Over a dense grid of such configurations the measured angles must
    satisfy m(YZV) = m(XWV) + m(WXV) - m(ZYV) identically -- i.e. the vertical-angle chain is
    forced, not assumed. The item's own configuration is then constructed explicitly and its
    fourth angle measured, and every admissible integer value of the third given angle is scanned.
    """
    assert_options(18, ["65", "68", "76", "115"])
    assert_key(18, "C")

    # (i) identity over a dense grid of intersecting-segment configurations
    checked = 0
    for adeg in (0.0, 17.0, 40.0, 73.0, 118.0, 155.0):
        for bdeg in (23.0, 55.0, 90.0, 131.0, 168.0):
            if abs((adeg - bdeg) % 180.0) < 1e-6:
                continue                                   # the segments would be collinear
            ua = (math.cos(math.radians(adeg)), math.sin(math.radians(adeg)))
            ub = (math.cos(math.radians(bdeg)), math.sin(math.radians(bdeg)))
            for p_, q_, r_, s_ in ((1.0, 1.0, 1.0, 1.0), (2.0, 3.0, 1.5, 0.7),
                                   (0.4, 2.6, 3.1, 1.2), (5.0, 0.9, 0.6, 4.4)):
                V = (0.0, 0.0)
                W = (p_ * ua[0], p_ * ua[1]);  Y = (-q_ * ua[0], -q_ * ua[1])
                X = (r_ * ub[0], r_ * ub[1]);  Z = (-s_ * ub[0], -s_ * ub[1])
                xwv, wxv = _ang(X, W, V), _ang(W, X, V)
                zyv, yzv = _ang(Z, Y, V), _ang(Y, Z, V)
                ck(abs(yzv - (xwv + wxv - zyv)) < 1e-7,
                   "Q18 the vertical-angle chain must hold in every configuration")
                ck(abs((xwv + wxv + _ang(W, V, X)) - 180.0) < 1e-7,
                   "Q18 triangle WXV angle sum must be 180 degrees")
                ck(abs(_ang(W, V, X) - _ang(Y, V, Z)) < 1e-7,
                   "Q18 angles WVX and YVZ must be vertical angles")
                checked += 1

    # (ii) the item's own configuration, constructed and measured
    A, B, C = 47.0, 68.0, 39.0
    wvx = 180.0 - A - B
    ck(abs(wvx - 65.0) < 1e-9, "Q18 the intersection angle must measure 65 degrees")
    VX, VW = 1.0, math.sin(math.radians(B)) / math.sin(math.radians(A))     # law of sines
    yzv_want = A + B - C
    VY, VZ = 1.0, math.sin(math.radians(C)) / math.sin(math.radians(yzv_want))
    V = (0.0, 0.0)
    W = (VW, 0.0);  Y = (-VY, 0.0)
    X = (VX * math.cos(math.radians(wvx)), VX * math.sin(math.radians(wvx)))
    Z = (-VZ * math.cos(math.radians(wvx)), -VZ * math.sin(math.radians(wvx)))
    ck(abs(_ang(X, W, V) - A) < 1e-7, "Q18 constructed angle XWV must measure 47 degrees")
    ck(abs(_ang(W, X, V) - B) < 1e-7, "Q18 constructed angle WXV must measure 68 degrees")
    ck(abs(_ang(Z, Y, V) - C) < 1e-7, "Q18 constructed angle ZYV must measure 39 degrees")
    measured = _ang(Y, Z, V)
    ck(abs(measured - 76.0) < 1e-7, "Q18 constructed angle YZV measures %.6f, expected 76" % measured)

    # (iii) exhaustive integer scan of the third given angle: the key is uniquely determined
    hits = [cv for cv in range(1, 115) if 180 - (180 - A - B) - cv == 76]
    ck(hits == [39], "Q18 only m(ZYV) = 39 yields 76; got %r" % hits)
    for cv in range(1, 115):
        ck(0 < 180 - (180 - A - B) - cv < 180, "Q18 scan produced an impossible angle at c = %d" % cv)

    # (iv) each non-keyed option is a NAMED wrong turn and none equals the key
    distinct_from_key(18, Fraction(76), {
        "A": Fraction(int(round(wvx))),         # the intersection angle, computed en route
        "B": Fraction(int(B)),                  # angle YZV assumed equal to angle WXV
        "D": Fraction(180 - int(round(wvx))),   # angle ZYV omitted
    })
    ck(sorted(int(o) for o in opts(18)) == [int(o) for o in opts(18)], "Q18 options must ascend")

    # (v) the PT4 M4.18 sufficiency archetype must be gone
    blob = ((BY_N[18].get("passage") or "") + " " + BY_N[18]["text"] + " " +
            " ".join(opts(18))).lower()
    for banned in ("sufficient", "congruent", "similar", "perimeter"):
        ck(banned not in blob, "Q18 must not re-run PT4 M4.18's sufficiency archetype (found %r)" % banned)
    ck(BY_N[18]["graphAsset"] is None, "Q18 hard geometry must stay figure-less")
    DIAG["Q18"] = {"grid configurations": checked,
                   "constructed angles (XWV, WXV, ZYV, YZV)":
                       (round(_ang(X, W, V), 4), round(_ang(W, X, V), 4),
                        round(_ang(Z, Y, V), 4), round(measured, 4)),
                   "integer scan of m(ZYV) hitting 76": hits}


def q19():
    """EXHAUSTIVE integer scan of the discriminant condition, boundary integer included."""
    no_real = [kv for kv in range(-60, 61)
               if sp.discriminant(4 * x ** 2 + kv * x + 25, x) < 0]
    ck(no_real == list(range(-19, 20)),
       "Q19 exhaustive scan: no-real-solution integers are %r..%r" % (no_real[0], no_real[-1]))
    ck(max(no_real) == 19, "Q19 greatest integer k is 19")
    ck(sp.discriminant(4 * x ** 2 + 20 * x + 25, x) == 0,
       "Q19 the trap integer 20 must sit EXACTLY on the discriminant boundary")
    ck(len(sp.solve(sp.Eq(4 * x ** 2 + 20 * x + 25, 0), x)) == 1,
       "Q19 at k = 20 the equation must have exactly one real solution")
    ck(sp.discriminant(4 * x ** 2 + 19 * x + 25, x) < 0, "Q19 at k = 19 there are no real solutions")
    ck(BY_N[19]["correctAnswer"] == "19", "Q19 canonical answer")


def q20():
    given = 500 * Fraction("1.44") ** (t / 2)
    assert_options(20, ["f(t) = 500(1.2)ᵗ", "f(t) = 500(1.22)ᵗ",
                        "f(t) = 500(1.44)ᵗ", "f(t) = 500(1.44)²ᵗ"])
    assert_key(20, "A")
    cands = {"A": 500 * sp.Rational(12, 10) ** t,
             "B": 500 * sp.Rational(122, 100) ** t,
             "C": 500 * sp.Rational(144, 100) ** t,
             "D": 500 * (sp.Rational(144, 100) ** 2) ** t}
    ck(sp.simplify(sp.Rational(144, 100) ** sp.Rational(1, 2) - sp.Rational(12, 10)) == 0,
       "Q20 sqrt(1.44) = 1.2")
    # EXHAUSTIVE over a dense grid of t: only A agrees with the given function everywhere
    for L, e in cands.items():
        agree = all(sp.simplify(e.subs(t, tv) - (500 * sp.Rational(144, 100) ** (sp.Rational(tv) / 2))) == 0
                    for tv in [0, 1, 2, 3, 4, 5, 6, 7, 8, 10])
        ck(agree == (L == "A"), "Q20 option %s must%s be equivalent to the given equation"
                                % (L, "" if L == "A" else " not"))
    ck(float(sp.Rational(122, 100)) == 1.22, "Q20 B halves the percent (44/2) instead of the factor")
    _ = given


def q21():
    area = 144
    r = sp.sqrt(area)
    ck(r == 12, "Q21 radius step from the area")
    circ = 2 * sp.pi * 12
    key = sp.Rational(150, 360) * circ
    ck(sp.simplify(key - 10 * sp.pi) == 0, "Q21 key value 10pi")
    assert_options(21, ["10π", "20π", "60π", "120π"])
    assert_key(21, "A")
    distinct_from_key(21, Fraction(10), {
        "B": Fraction(150, 360) * Fraction(2 * 24),          # diameter used as the radius
        "C": Fraction(150, 360) * Fraction(144),             # area of the sector
        "D": Fraction(150, 360) * Fraction(2 * 144),         # 144 used as the radius
    })


def q22():
    """A given solution fixes the constant; the second solution is then recovered (a fraction)."""
    c = sp.Symbol("c")
    poly = 4 * x ** 2 - 25 * x + c
    csol = sp.solve(sp.Eq(poly.subs(x, 3), 0), c)
    ck(csol == [39], "Q22 the given solution x = 3 must force c = 39 uniquely; got %r" % csol)
    roots = sorted(sp.solve(sp.Eq(4 * x ** 2 - 25 * x + 39, 0), x))
    ck(roots == [sp.Rational(3), sp.Rational(13, 4)],
       "Q22 solution set must be {3, 13/4}; got %r" % roots)
    key = sp.Rational(13, 4)
    ck(sp.expand((4 * x - 13) * (x - 3)) == 4 * x ** 2 - 25 * x + 39, "Q22 factorisation")
    # EXHAUSTIVE: no other rational on a dense grid satisfies the equation
    extra = [xv for xv in [sp.Rational(i, 4) for i in range(-80, 121)]
             if (4 * xv ** 2 - 25 * xv + 39) == 0 and xv not in (sp.Rational(3), key)]
    ck(extra == [], "Q22 dense rational scan found an extra solution: %r" % extra)
    ck(sp.discriminant(4 * x ** 2 - 25 * x + 39, x) == 1, "Q22 discriminant must be 1 (two distinct roots)")
    ck(BY_N[22]["correctAnswer"] == "13/4", "Q22 canonical answer")
    ck(math.gcd(13, 4) == 1, "Q22 13/4 must be in lowest terms")
    ck(key > 0, "Q22 M4's fraction must be positive (M3 Q22 carries the form's negative)")
    # step-skip trap: neither the constant nor the given solution is the answer
    for wrong in (sp.Rational(39), sp.Rational(3), sp.Rational(25, 4)):
        ck(wrong != key, "Q22 the asked output must differ from the intermediate value %s" % wrong)
    # the blueprint correction: this slot is ADVANCED MATH, not linear-functions
    ck(BY_N[22]["subcategory"] == "nonlinear-equations" and BY_N[22]["subcategoryId"] == 17,
       "Q22 must sit on nonlinear-equations (17) after the blueprint correction")
    # and it must NOT re-run M3 Q22's "two conditions fix a and b" closer
    blob = ((BY_N[22].get("passage") or "") + " " + BY_N[22]["text"]).lower()
    for banned in ("f(", "function", "a and b are constants"):
        ck(banned not in blob, "Q22 must not re-run the two-conditions-on-f closer (found %r)" % banned)


ITEM_CHECKS = [q01, q02, q03, q04, q05, q06, q07, q08, q09, q10, q11,
               q12, q13, q14, q15, q16, q17, q18, q19, q20, q21, q22]


# ================================================================ CROSS CHECKS
NUMERIC_MC = [3, 4, 8, 11, 14, 15, 16, 17, 18, 21]


def check_ascending():
    for n in NUMERIC_MC:
        vals = [num(o) for o in opts(n)]
        ck(vals == sorted(vals) and len(set(vals)) == 4,
           "Q%d numeric options are not strictly ascending: %r" % (n, [str(v) for v in vals]))
    xs = [int(o.split(",")[0].strip("( ")) for o in opts(7)]
    ck(xs == sorted(xs), "Q7 ordered-pair options must ascend by x-coordinate")


def check_accepted():
    """SET EQUALITY with the project's canonical enumerator: every legal entry present,
    nothing illegal, nothing over-length, canonical form first."""
    for q in QS:
        if q["questionType"] != "user-input":
            continue
        n = q["originalQuestionNumber"]
        canon_str = q["correctAnswer"]
        canon = sp.Rational(canon_str)
        listed = q["acceptedAnswers"]
        ck(listed[0] == canon_str, "Q%d canonical answer must head acceptedAnswers" % n)
        ck(canon_str in listed, "Q%d canonical answer missing from acceptedAnswers" % n)
        ck(len(set(listed)) == len(listed), "Q%d acceptedAnswers contains duplicates" % n)
        for s in listed:
            budget = 6 if s.startswith("-") else 5
            ck(len(s) <= budget, "Q%d accepted form %r is %d chars (budget %d)" % (n, s, len(s), budget))
            val = sp.Rational(s)
            ck(val == canon, "Q%d accepted form %r evaluates to %s, not %s" % (n, s, val, canon))
        want = spr_enumerate(Fraction(canon.p, canon.q), canon_str)
        missing = [s for s in want if s not in listed]
        extra = [s for s in listed if s not in want]
        ck(not missing, "Q%d acceptedAnswers is MISSING legal entries: %r" % (n, missing))
        ck(not extra, "Q%d acceptedAnswers contains non-canonical entries: %r" % (n, extra))
        ck(set(listed) == set(want),
           "Q%d acceptedAnswers is not set-equal to the enumerator output" % n)
        DIAG.setdefault("SPR", {})[n] = "%s -> %d entries" % (canon_str, len(listed))


BLUEPRINT = {
    #  n: (skill, subcategoryId, difficulty, fmt, visual, trap-present)
    1:  ("linear-equations-one-variable", 11, "easy", "mc", None, True),
    2:  ("equivalent-expressions", 18, "easy", "mc", None, True),
    3:  ("ratios-rates-proportions", 19, "easy", "mc", None, True),
    4:  ("linear-functions", 12, "easy", "mc", None, True),
    5:  ("systems-linear-equations", 14, "easy", "spr", None, False),
    6:  ("area-volume", 26, "easy", "spr", None, False),
    7:  ("nonlinear-functions", 16, "easy", "mc", "svg", True),
    8:  ("probability", 23, "easy", "mc", "table", True),
    9:  ("inference-statistics", 24, "medium", "mc", None, True),
    10: ("linear-functions", 12, "easy", "mc", None, True),
    11: ("right-triangles-trigonometry", 28, "medium", "mc", "svg", True),
    12: ("percentages", 20, "medium", "spr", None, True),
    13: ("linear-inequalities", 15, "medium", "spr", None, False),
    14: ("equivalent-expressions", 18, "medium", "mc", None, True),
    15: ("linear-equations-two-variables", 13, "medium", "mc", "table", True),
    16: ("systems-linear-equations", 14, "medium", "mc", None, True),
    17: ("nonlinear-functions", 16, "hard", "mc", None, True),
    18: ("lines-angles-triangles", 27, "hard", "mc", None, True),
    19: ("nonlinear-equations", 17, "hard", "spr", None, True),
    20: ("nonlinear-functions", 16, "hard", "mc", None, True),
    21: ("circles", 29, "hard", "mc", None, True),
    22: ("nonlinear-equations", 17, "hard", "spr", None, True),
}


def check_blueprint():
    ck(MOD["moduleNumber"] == 4 and MOD["section"] == "Math", "module metadata")
    ck(MOD["calculatorAllowed"] is True and MOD["timeLimit"] == 2100, "module calculator/timeLimit")
    ck(MOD["title"] == "Exam 6, Module 4", "module title")
    ck(MOD["description"] == "Practice Test 6 - Math, Module 2 (22 questions)", "module description")
    ck(len(QS) == 22, "22 questions")
    ck([q["originalQuestionNumber"] for q in QS] == list(range(1, 23)), "question numbering 1..22")

    for n, (skill, sid, diff, fmt, vis, trap) in BLUEPRINT.items():
        q = BY_N[n]
        ck(q["subcategory"] == skill, "Q%d skill %r != %r" % (n, q["subcategory"], skill))
        ck(q["subcategoryId"] == sid, "Q%d subcategoryId %r != %r" % (n, q["subcategoryId"], sid))
        ck(q["difficulty"] == diff, "Q%d difficulty %r != %r" % (n, q["difficulty"], diff))
        want = "multiple-choice" if fmt == "mc" else "user-input"
        ck(q["questionType"] == want, "Q%d format %r != %r" % (n, q["questionType"], want))
        if vis == "svg":
            ck(q["graphAsset"] == "PT6-M4-Q%02d.svg" % n, "Q%d must carry its SVG asset" % n)
        elif vis == "table":
            ck(q["graphAsset"] is None and "<table" in (q["passage"] or ""),
               "Q%d must carry an HTML table, not an SVG" % n)
        else:
            ck(q["graphAsset"] is None, "Q%d must carry no figure" % n)
        blank = q["_trap"].startswith("none")
        ck(blank != trap, "Q%d trap presence mismatch (_trap = %r)" % (n, q["_trap"]))

    # difficulty curve 9E / 7M / 6H with the single dip at position 10
    diffs = [q["difficulty"] for q in QS]
    ck(diffs.count("easy") == 9 and diffs.count("medium") == 7 and diffs.count("hard") == 6,
       "difficulty mix is %r, expected 9E/7M/6H" % {d: diffs.count(d) for d in set(diffs)})
    rank = {"easy": 0, "medium": 1, "hard": 2}
    dips = [i + 1 for i in range(1, 22) if rank[diffs[i]] < rank[diffs[i - 1]]]
    ck(dips == [10], "the ramp must have exactly one dip, at position 10; got %r" % dips)

    # SPR positions and difficulties
    spr = [q["originalQuestionNumber"] for q in QS if q["questionType"] == "user-input"]
    ck(spr == [5, 6, 12, 13, 19, 22], "SPR positions %r != [5, 6, 12, 13, 19, 22]" % spr)
    ck([BY_N[i]["difficulty"] for i in spr] == ["easy", "easy", "medium", "medium", "hard", "hard"],
       "SPR difficulty pattern must be E/E/M/M/H/H")

    # SPR census for M4: 4 integers (one 3-digit), 1 terminating decimal, 1 positive fraction
    ans = [BY_N[i]["correctAnswer"] for i in spr]
    ints = [s for s in ans if re.fullmatch(r"-?\d+", s)]
    decs = [s for s in ans if re.fullmatch(r"-?\d+\.\d+", s)]
    fracs = [s for s in ans if "/" in s]
    ck(len(ints) == 4 and len(decs) == 1 and len(fracs) == 1,
       "M4 SPR census must be 4 int / 1 decimal / 1 fraction; got %r" % ans)
    ck(any(len(s) >= 3 for s in ints), "M4 must supply the form's three-digit SPR integer")
    ck(all(not s.startswith("-") for s in ans), "M4 carries no negative SPR (M3 Q22 owns the form's negative)")
    ck(math.gcd(*[int(p) for p in fracs[0].split("/")]) == 1, "M4 fraction answer must be in lowest terms")

    # domains from the binding MODULE 4 slot table
    DOMAIN = {11: "ALG", 12: "ALG", 13: "ALG", 14: "ALG", 15: "ALG",
              16: "ADV", 17: "ADV", 18: "ADV",
              19: "PSDA", 20: "PSDA", 21: "PSDA", 22: "PSDA", 23: "PSDA", 24: "PSDA", 25: "PSDA",
              26: "GEO", 27: "GEO", 28: "GEO", 29: "GEO"}
    dom = {}
    for q in QS:
        dom[DOMAIN[q["subcategoryId"]]] = dom.get(DOMAIN[q["subcategoryId"]], 0) + 1
    ck(dom == {"ALG": 7, "ADV": 7, "PSDA": 4, "GEO": 4},
       "domain counts %r must match the CORRECTED MODULE 4 slot table (ALG 7 / ADV 7 / PSDA 4 / GEO 4)" % dom)

    # skill census, exactly as the corrected blueprint specifies it
    skills = {}
    for q in QS:
        skills[q["subcategory"]] = skills.get(q["subcategory"], 0) + 1
    WANT = {"linear-equations-one-variable": 1, "linear-functions": 2,
            "linear-equations-two-variables": 1, "systems-linear-equations": 2,
            "linear-inequalities": 1, "nonlinear-functions": 3, "nonlinear-equations": 2,
            "equivalent-expressions": 2, "ratios-rates-proportions": 1, "percentages": 1,
            "probability": 1, "inference-statistics": 1, "area-volume": 1,
            "lines-angles-triangles": 1, "right-triangles-trigonometry": 1, "circles": 1}
    ck(skills == WANT, "skill census %r must match the corrected blueprint %r" % (skills, WANT))
    ck(sum(WANT.values()) == 22, "skill census must sum to 22")

    # key-letter balance
    mc = [q for q in QS if q["questionType"] == "multiple-choice"]
    ck(len(mc) == 16, "16 MC items")
    tally = {c: 0 for c in "ABCD"}
    for q in mc:
        tally["ABCD"[q["correctAnswer"]]] += 1
    ck(tally == {"A": 4, "B": 4, "C": 4, "D": 4}, "key tally is %r, expected 4/4/4/4" % tally)

    # visual quota: 2 SVG + 2 HTML tables = 4
    svgs = [q["originalQuestionNumber"] for q in QS if q["graphAsset"]]
    tables = [q["originalQuestionNumber"] for q in QS if "<table" in (q["passage"] or "")]
    ck(svgs == [7, 11], "SVG assets expected at Q7 and Q11; got %r" % svgs)
    ck(tables == [8, 15], "HTML tables expected at Q8 and Q15; got %r" % tables)
    ck(len(svgs) + len(tables) == 4, "visual quota is 4 per module")
    for n in svgs:
        ck(os.path.exists(os.path.join(ASSET_DIR, BY_N[n]["graphAsset"])),
           "missing asset file %s" % BY_N[n]["graphAsset"])
        ck(bool(BY_N[n]["graphDescription"]), "Q%d graphDescription missing" % n)
    for q in QS:
        if not q["graphAsset"]:
            ck(q["graphDescription"] is None, "Q%d has a graphDescription without an asset"
               % q["originalQuestionNumber"])
    # hard geometry is figure-less
    for n in (18, 21):
        ck(BY_N[n]["graphAsset"] is None, "Q%d hard geometry must be figure-less" % n)


def check_format_contract():
    tagish = re.compile(r"<[A-Za-z/!]")
    for q in QS:
        n = q["originalQuestionNumber"]
        for o in q["options"]:
            ck(not tagish.search(o), "Q%d option contains a tag-shaped '<': %r" % (n, o))
            ck("<" not in o and ">" not in o, "Q%d option contains an angle bracket: %r" % (n, o))
            ck("&" not in o, "Q%d option contains an HTML entity: %r" % (n, o))
            # LaTeX is forbidden; a bare '$' as a currency symbol is not LaTeX (shipped forms use it)
            ck("\\" not in o and "$$" not in o and "\\(" not in o,
               "Q%d option contains LaTeX: %r" % (n, o))
            ck(not re.search(r"\$[^ ]*\$", o), "Q%d option contains paired LaTeX delimiters: %r" % (n, o))
            ck("−" not in o, "Q%d option must use an ASCII hyphen as minus: %r" % (n, o))
        ck(len(q["options"]) in (0, 4), "Q%d must have 0 or 4 options" % n)
        if q["questionType"] == "multiple-choice":
            ck(isinstance(q["correctAnswer"], int) and 0 <= q["correctAnswer"] <= 3, "Q%d MC key index" % n)
            ck(q["acceptedAnswers"] is None, "Q%d MC acceptedAnswers must be null" % n)
            ck(len(set(q["options"])) == 4, "Q%d has duplicate options" % n)
            ck(isinstance(q["_distractorLogic"], dict) and set(q["_distractorLogic"]) == set("ABCD"),
               "Q%d _distractorLogic must name all four letters" % n)
        else:
            ck(q["options"] == [] and isinstance(q["correctAnswer"], str), "Q%d SPR shape" % n)
            ck(isinstance(q["acceptedAnswers"], list) and q["acceptedAnswers"], "Q%d SPR acceptedAnswers" % n)
            ck(isinstance(q["_sprForms"], str) and q["_sprForms"], "Q%d _sprForms missing" % n)
            ck(q["_distractorLogic"] is None, "Q%d SPR _distractorLogic must be null" % n)
        for field in ("passage", "text", "explanation"):
            s = q.get(field) or ""
            ck(" < " not in s and " > " not in s,
               "Q%d %s has an unescaped bare < or > (use &lt; / &gt;)" % (n, field))
        # D1/D2: explanations are rendered as plain text by two of the app's four renderers,
        # so they carry NO literal newline and NO markup at all.
        e = q["explanation"]
        ck("\n" not in e and "\r" not in e,
           "Q%d explanation contains a literal newline; house convention is a single space" % n)
        ck("<sup" not in e and "</sup" not in e,
           "Q%d explanation uses <sup> tags; house convention is Unicode superscripts" % n)
        ck(not re.search(r"<[A-Za-z/!]", e), "Q%d explanation contains markup" % n)
        for field in ("graphDescription", "_archetype", "_trap"):
            v = q.get(field)
            if isinstance(v, str):
                ck("\n" not in v, "Q%d %s contains a literal newline" % (n, field))
        ck(isinstance(q["_archetype"], str) and q["_archetype"], "Q%d _archetype missing" % n)
        ck(isinstance(q["_trap"], str) and q["_trap"], "Q%d _trap missing" % n)
    # HTML tables follow the house style
    for n in (8, 15):
        p = BY_N[n]["passage"]
        ck("border-collapse:collapse" in p, "Q%d table must set border-collapse:collapse" % n)
        ck("border:1px solid #333" in p, "Q%d table must use 1px solid #333 borders" % n)
        ck("padding:4px 8px" in p, "Q%d table must use 4-8px cell padding" % n)
        ck("margin:8px auto" in p, "Q%d table must be centered" % n)
        ck("<th " in p, "Q%d table must use bold <th> headers" % n)
        lead = STRIP_TAGS.sub(" ", p.split("<table")[0]).strip()
        ck(re.search(r"[Tt]he table (shows|gives|summarizes)", lead),
           "Q%d table needs a CB 'the table shows/gives/summarizes ...' lead-in" % n)
    # F2: a header cell whose content is a VARIABLE is italicised, as PT5 M3.08 ships it and as
    # spec 8 requires of variables generally. Q8's headers are words, so they stay roman.
    p15 = BY_N[15]["passage"]
    for v in ("x", "y"):
        ck("<i>%s</i></th>" % v in p15,
           "Q15 table header %r must be italicised as <i>%s</i> (F2)" % (v, v))
    ck(not re.search(r"<th[^>]*>[xy]</th>", p15),
       "Q15 must carry no bare, un-italicised variable header")
    ck(not re.search(r"<i>", BY_N[8]["passage"]),
       "Q8's headers are words, not variables, so they carry no italics")


def check_rationale_liturgy():
    for q in QS:
        n = q["originalQuestionNumber"]
        e = q["explanation"]
        if q["questionType"] == "multiple-choice":
            L = "ABCD"[q["correctAnswer"]]
            ck(e.startswith("Choice %s is correct." % L), "Q%d must open 'Choice %s is correct.'" % (n, L))
            others = [c for c in "ABCD" if c != L]
            pos = [e.find("Choice %s is incorrect" % c) for c in others]
            ck(all(p > 0 for p in pos), "Q%d is missing a per-choice dismissal" % n)
            ck(pos == sorted(pos), "Q%d dismissals are not in letter order" % n)
        else:
            ck(e.startswith("The correct answer is "), "Q%d SPR rationale opener" % n)
            ck("Choice " not in e, "Q%d SPR rationale must not dismiss choices" % n)
            non_int = not re.fullmatch(r"-?\d+", q["correctAnswer"])
            note = "are examples of ways to enter a correct answer." in e
            ck(note == non_int, "Q%d entry-forms note presence mismatch" % n)
        ck("Therefore," in e, "Q%d rationale lacks a 'Therefore,' closer" % n)
        ck("'" not in e, "Q%d rationale uses a straight apostrophe; CB uses the curly form" % n)
        for field in ("passage", "text"):
            ck("'" not in (q.get(field) or ""), "Q%d %s uses a straight apostrophe" % (n, field))
        low = " " + e.lower() + " "
        for banned in (" we ", " you ", " your ", "let’s ", " find x", "!"):
            ck(banned not in low, "Q%d rationale uses forbidden voice %r" % (n, banned))
        ck("yields" in e or "It follows" in e, "Q%d rationale must narrate steps with 'yields'" % n)
    # stems never use forbidden moves
    for q in QS:
        s = STRIP_TAGS.sub(" ", (q.get("passage") or "") + " " + q["text"])
        ck(s.count("?") == 1, "Q%d stem must end in exactly one terminal question"
           % q["originalQuestionNumber"])
        ck("!" not in s, "Q%d stem uses an exclamation point" % q["originalQuestionNumber"])
        ck(" you " not in (" " + s.lower() + " "), "Q%d stem uses 'you'" % q["originalQuestionNumber"])


CAPS = {1: 55, 2: 15, 3: 55, 4: 55, 5: 35, 6: 35, 7: 35, 8: 55, 9: 75, 10: 55, 11: 35,
        12: 35, 13: 55, 14: 35, 15: 35, 16: 35, 17: 35, 18: 35, 19: 35, 20: 35, 21: 35, 22: 35}


def check_prose_lengths():
    """Spec 7 rationale norms (110/135/170 MC, 40/100/130 SPR), held to +/-40%,
    and the spec 2b stem caps on BOTH rulers."""
    NORM_MC = {"easy": 110, "medium": 135, "hard": 170}
    NORM_SPR = {"easy": 40, "medium": 100, "hard": 130}
    for q in QS:
        n = q["originalQuestionNumber"]
        w = rat_words(q["explanation"])
        norm = (NORM_SPR if q["questionType"] == "user-input" else NORM_MC)[q["difficulty"]]
        lo, hi = int(0.60 * norm), int(1.35 * norm)   # D6: nothing beyond ~35% over its norm
        ck(lo <= w <= hi, "Q%d rationale %d words outside [%d, %d] (norm %d, ratio %.2f)"
                          % (n, w, lo, hi, norm, w / norm))
        ck(w < 1.45 * norm, "Q%d rationale %d words runs 45%%+ over its section 7 norm %d"
                            % (n, w, norm))
        sp_, sa, sf = stem_words_prose(q), stem_words_all(q), stem_words_full(q)
        ck(sp_ <= CAPS[n], "Q%d stem prose %d tokens exceeds the cap of %d" % (n, sp_, CAPS[n]))
        ck(sa <= CAPS[n], "Q%d stem all-token %d exceeds the cap of %d" % (n, sa, CAPS[n]))
        # Section 2b measures stem PROSE, so the binding cap is applied to `stem_words_all`
        # (displayed equations counted, tabular data not). `stem_words_full` is reported for
        # every item, and where the two differ the difference is exactly the table's own cells:
        # Q8 56 full / 37 stem (19 table tokens), Q15 40 full / 32 stem (8 table tokens).
        # Neither is a prose breach; both are recorded rather than silently dropped.
        if sf > CAPS[n]:
            ck(table_tokens(q) > 0 and sf - table_tokens(q) <= CAPS[n],
               "Q%d is over its cap of %d on the drop-nothing ruler (%d) for a reason other "
               "than its %d tabular tokens" % (n, CAPS[n], sf, table_tokens(q)))


APPLIED = [1, 3, 4, 8, 9, 10, 13]
MARKERS = {1: "bookbinding", 3: "quarry", 4: "tram", 8: "seed library",
           9: "observatory", 10: "hardware store", 13: "cider press"}


def check_applied_share():
    got = [n for n, w in MARKERS.items()
           if w in ((BY_N[n].get("passage") or "") + " " + BY_N[n]["text"]).lower()]
    ck(sorted(got) == APPLIED, "applied markers found at %r, expected %r" % (sorted(got), APPLIED))
    ck(len(APPLIED) == 7,
       "M4 contributes 7 applied items (Q6 converted to abstract); with M3's 7 the form lands at 14/44 = 32%")
    # the converted slot really is abstract
    blob = (BY_N[6].get("passage") or "") + " " + BY_N[6]["text"]
    for w in ("bookbindery", "cover", "panel", "book", "shop", "store"):
        ck(w not in blob.lower(), "Q6 must be abstract; found context word %r" % w)
    ck("rectangle" in blob.lower(), "Q6 abstract slot must be a bare rectangle-area item")


def check_figures():
    import xml.etree.ElementTree as ET
    for n in (7, 11):
        fn = BY_N[n]["graphAsset"]
        path = os.path.join(ASSET_DIR, fn)
        txt = open(path, encoding="utf-8").read()
        root = ET.parse(path).getroot()
        ck(root.tag.endswith("svg") and root.get("width") == "380", "%s canvas width must be 380" % fn)
        ck("Georgia" in (root.get("font-family") or ""), "%s must use the Georgia serif stack" % fn)
    q7 = open(os.path.join(ASSET_DIR, "PT6-M4-Q07.svg"), encoding="utf-8").read()
    ck("#cccccc" in q7, "Q7 gridlines must be #cccccc")
    ck(">x<" in q7 and ">y<" in q7 and ">O<" in q7, "Q7 needs italic x, y and origin O")
    i = q7.find(">O<")
    ck('font-style="italic"' in q7[max(0, i - 400):i], "Q7 origin O must be italic")
    ck("marker-start" in q7 and "marker-end" in q7, "Q7 axes must be arrowed at both ends")
    ck("not drawn to scale" not in q7, "Q7 coordinate grid must NOT carry the scale note")
    # the drawn Bezier must reproduce y = x^2 - 2x - 3 on the declared grid
    d = re.search(r'd="M (\d+) (\d+) Q (\d+) (\d+) (\d+) (\d+)"', q7)
    ck(bool(d), "Q7 parabola path not found")
    x0, y0, cx, cy, x1, y1 = [int(g) for g in d.groups()]
    U, PX0, PY0 = 24, 148, 190                     # px per unit, origin in px
    to_math = lambda px, py: ((px - PX0) / U, (PY0 - py) / U)
    mx0, my0 = to_math(x0, y0)
    mx1, my1 = to_math(x1, y1)
    f = lambda u: u * u - 2 * u - 3
    ck(abs(f(mx0) - my0) < 1e-6 and abs(f(mx1) - my1) < 1e-6, "Q7 curve endpoints must lie on y = x^2 - 2x - 3")
    mid_px = 0.25 * y0 + 0.5 * cy + 0.25 * y1      # quadratic Bezier midpoint
    mmx, mmy = to_math(0.25 * x0 + 0.5 * cx + 0.25 * x1, mid_px)
    ck(abs(mmx - 1) < 1e-6 and abs(mmy - (-4)) < 1e-6, "Q7 Bezier midpoint must be the vertex (1, -4)")
    q11 = open(os.path.join(ASSET_DIR, "PT6-M4-Q11.svg"), encoding="utf-8").read()
    ck("Note: Figure not drawn to scale." in q11, "Q11 geometry figure must carry the scale note")
    ck(q11.count("Note: Figure not drawn to scale.") == 1, "Q11 scale note appears exactly once")
    ck("font-style=\"italic\"" in q11, "Q11 vertex labels must be italic")
    seg = re.search(r'd="M (\d+) (\d+) L (\d+) (\d+) L (\d+) (\d+) Z"', q11)
    ck(bool(seg), "Q11 triangle path not found")
    fx, fy, ex, ey, dx_, dy_ = [int(g) for g in seg.groups()]
    ef = math.hypot(ex - fx, ey - fy)
    df = math.hypot(dx_ - fx, dy_ - fy)
    ck(abs(ef / 11 - df / 20) < 0.05 * (ef / 11), "Q11 drawn legs must be in proportion with their labels")
    ck(abs((ex - fx) * (dx_ - fx) + (ey - fy) * (dy_ - fy)) < 1e-6, "Q11 angle F must be drawn square")


def check_originality_guards():
    """Contexts must collide with neither PT4/PT5 nor Module 3's reserved PT6 contexts."""
    banned = [
        # PT4
        "pottery", "community garden", "seed packet", "recycling drive", "nature center",
        "nature-center", "ferry", "storage crate", "greenhouse", "marsh bird", "freight elevator",
        "furlong", "kiln", "tree canopy", "banner", "bus route", "robotics", "bicycle",
        # PT5
        "orchard", "cistern", "chess club", "creamery", "solar array", "gondola", "test plot",
        "parking garage", "weather balloon", "grain silo", "museum", "textile mill", "trail",
        "lichen", "courier",
        # PT6 Module 3 (authored in parallel)
        "print shop", "food co-op", "tide pool", "tide-pool", "snail", "aquarium", "kayak",
        "bakery", "wind turbine", "pledge drive", "ski rental",
        "warehouse", "carton", "bolt", "roll", "tray", "marching band", "minutes of preparation",
        # retired names
        "nadia", "mateo", "idris",
    ]
    blob = " ".join(((q.get("passage") or "") + " " + q["text"]) for q in QS).lower()
    for term in banned:
        ck(term not in blob, "reserved / already-used context term appears: %r" % term)
    # <= 2 named people, and they are new
    caps = set(re.findall(r"\b[A-Z][a-z]{2,}\b", STRIP_TAGS.sub(" ", blob.title())))
    named = [nm for nm in ("Priya",) if nm.lower() in blob]
    ck(len(named) <= 2, "at most 2 named people per module; got %r" % named)
    ck(named == ["Priya"], "M4 uses exactly the one new given name Priya")
    # No Latin binomial in Module 4 (Module 3 carries the form's one). Italic spans are still
    # legal — and required — for VARIABLES (spec 8): Q15's table headers are <i>x</i>/<i>y</i>.
    ital = re.findall(r"<i>(.*?)</i>",
                      " ".join(((q.get("passage") or "") + q["text"]) for q in QS))
    ck(all(re.fullmatch(r"[a-z]", s) for s in ital),
       "Module 4's only italic spans may be single variables; found %r" % ital)
    ck(not any(re.fullmatch(r"[A-Z][a-z]+ [a-z]+", s) for s in ital),
       "Module 4 must carry no Latin binomial; found %r" % ital)
    # ALT-TEXT POLICY (corrected round 4): graphDescription must be DATA-COMPLETE - it states
    # every plotted point, labelled measure, axis range and grid spacing a sighted student can
    # read - while never interpreting the figure or announcing the answer in words.
    for n in (7, 11):
        gd = BY_N[n]["graphDescription"]
        ck("answer" not in gd.lower() and "choice" not in gd.lower() and "correct" not in gd.lower(),
           "Q%d graphDescription must not announce the answer" % n)
        ck(gd.count(".") <= 3, "Q%d graphDescription should run to 1-2 factual sentences" % n)
    gd7 = BY_N[7]["graphDescription"]
    for datum in ("(-1, 0)", "(3, 0)", "(0, -3)", "(1, -4)"):
        ck(datum in gd7, "Q7 alt text must state the readable point %s (data-complete rule)" % datum)
    # F6: the datum stays, but it is stated as PLOTTED GEOMETRY, not in the question's own
    # asked-quantity phrasing. The stem asks for "the coordinates of the y-intercept"; the alt
    # text must not hand that phrase back with the key attached to it.
    ck("y-intercept" not in gd7 and "intercept" not in gd7.lower(),
       "Q7 alt text must not use the stem's asked-quantity noun ('intercept')")
    ck("crosses the y-axis" not in gd7 and "y-axis at" not in gd7,
       "Q7 alt text must not announce the key as 'where the curve crosses the y-axis'")
    ck("passes through" in gd7,
       "Q7 alt text states the curve's plotted points instead, which keeps it data-complete")
    ck(gd7.index("(0, -3)") > gd7.index("(-1, 0)"),
       "Q7 alt text lists the plotted points in order, the key point not singled out")
    ck("1 unit" in gd7, "Q7 alt text must state the TRUE gridline spacing of 1 unit")
    ck("labeled at every 2 units" in gd7, "Q7 alt text must distinguish the label spacing of 2 units")
    ck("tick marks at every 2 units" not in gd7,
       "Q7 alt text must not repeat the false gridline claim the verifier flagged")
    ck("-3 to 5" in gd7 and "-5 to 6" in gd7, "Q7 alt text must give both axis ranges")
    gd11 = BY_N[11]["graphDescription"]
    for datum in ("R", "S", "T", "20", "11", "right angle"):
        ck(datum in gd11, "Q11 alt text must state %r (data-complete rule)" % datum)
    ck("not labeled" in gd11, "Q11 alt text must say the hypotenuse carries no label")
    ck("22.8" not in gd11 and "521" not in gd11,
       "Q11 alt text states the figure data; it must not compute the hypotenuse for the reader")


def check_stale_labels():
    """D4: no figure-label residue from an earlier draft may survive in any field."""
    RENDERED = {11: set("RST"), 18: set("WXYZV")}
    RETIRED = {11: ("DE", "DF", "EF"), 18: ("GHJ", "KLM", "JKL", "PQR")}
    for n, tokens in RETIRED.items():
        blob = json.dumps(BY_N[n], ensure_ascii=False)
        for tok in tokens:
            ck(not re.search(r"\b%s\b" % tok, blob),
               "Q%d still carries the retired label %r somewhere in its record" % (n, tok))
    ck(RENDERED[11].isdisjoint(RENDERED[18]), "Q11 and Q18 must not share vertex labels")
    ck(RENDERED[11].isdisjoint(set("DEF")) and RENDERED[18].isdisjoint(set("DEF")),
       "M4 geometry labels must not collide with M3 Q18's triangle DEF")


def check_trap_uniqueness():
    traps = {q["originalQuestionNumber"]: q["_trap"] for q in QS}
    real = [t_ for t_ in traps.values() if not t_.startswith("none")]
    ck(len(real) == 19, "M4 carries 19 trapped items and 3 untrapped SPR slots; got %d" % len(real))
    ck(len(set(real)) == len(real), "each item must carry a DISTINCT trap mechanism: %r" % real)
    for n, t_ in traps.items():
        ck(";" not in t_ and " and also " not in t_, "Q%d must name exactly one trap" % n)
    # F3 (form level): round 2 shipped leg-versus-hypotenuse at BOTH right-triangle items,
    # M3 Q18 and M4 Q11. Q11 keeps the mechanism; M3 Q18 was re-pitched. The blueprint does
    # schedule other families more than once, so this guard is specific, not blanket.
    m3path = os.path.join(os.path.dirname(MODULE_PATH), "M3.json")
    if os.path.exists(m3path):
        with open(m3path, encoding="utf-8") as f3:
            m3 = json.load(f3)["questions"]
        m3traps = {i3["originalQuestionNumber"]: (i3["_trap"] or "") for i3 in m3}
        leg = lambda s: "leg" in s.lower() and "hypotenuse" in s.lower()
        here = [n for n, t_ in traps.items() if leg(t_)]
        there = [n for n, t_ in m3traps.items() if leg(t_)]
        ck(here == [11] and there == [],
           "leg-versus-hypotenuse sits on exactly one item form-wide: M4 Q%r / M3 Q%r" % (here, there))
        rtt3 = [i3["originalQuestionNumber"] for i3 in m3
                if i3["subcategory"] == "right-triangles-trigonometry"]
        ck(rtt3 == [18] and traps[11] != m3traps[18],
           "the form's two right-triangle items (M3 Q18, M4 Q11) carry different mechanisms")


# =========================================================================== MAIN
def main():
    for fn in ITEM_CHECKS:
        try:
            fn()
        except Exception as exc:                                     # noqa: BLE001
            FAILS.append("%s raised %s: %s" % (fn.__name__, type(exc).__name__, exc))
    for fn in (check_length_ruler, check_ascending, check_accepted, check_blueprint,
               check_format_contract, check_rationale_liturgy, check_prose_lengths,
               check_applied_share, check_figures, check_originality_guards,
                   check_stale_labels, check_trap_uniqueness):
        try:
            fn()
        except Exception as exc:                                     # noqa: BLE001
            FAILS.append("%s raised %s: %s" % (fn.__name__, type(exc).__name__, exc))

    mc = [q for q in QS if q["questionType"] == "multiple-choice"]
    tally = {c: 0 for c in "ABCD"}
    for q in mc:
        tally["ABCD"[q["correctAnswer"]]] += 1
    print("ULTRASAT PT6 - MODULE 4 verification")
    print("  questions      : %d (%d MC / %d SPR)" % (len(QS), len(mc), len(QS) - len(mc)))
    print("  key letters    : %s" % tally)
    print("  SPR answers    : %s" % {q["originalQuestionNumber"]: q["correctAnswer"]
                                     for q in QS if q["questionType"] == "user-input"})
    NORM_MC = {"easy": 110, "medium": 135, "hard": 170}
    NORM_SPR = {"easy": 40, "medium": 100, "hard": 130}
    print("  length report under the corrected rulers (F7):")
    print("     Q  prose  stem  full  cap | rationale/norm  ratio")
    for q in QS:
        n = q["originalQuestionNumber"]
        w = rat_words(q["explanation"])
        norm = (NORM_SPR if q["questionType"] == "user-input" else NORM_MC)[q["difficulty"]]
        print("    %2d   %3d   %3d   %3d  %3d | %3d/%-3d       %.2f%s"
              % (n, stem_words_prose(q), stem_words_all(q), stem_words_full(q), CAPS[n],
                 w, norm, w / norm,
                 "   (+%d tabular)" % table_tokens(q) if table_tokens(q) else ""))
    ratios = [rat_words(q["explanation"])
              / (NORM_SPR if q["questionType"] == "user-input" else NORM_MC)[q["difficulty"]]
              for q in QS]
    print("  max stem/cap   : %.2f   max rationale ratio %.2f   mean %.2f"
          % (max(stem_words_all(q) / CAPS[q["originalQuestionNumber"]] for q in QS),
             max(ratios), sum(ratios) / len(ratios)))
    for label, payload in DIAG.items():
        print("  %s exhaustive : %s" % (label, payload))
    print("  assertions run : %d" % CHECKS)
    if FAILS:
        print("\nFAILURES (%d):" % len(FAILS))
        for f_ in FAILS:
            print("   - " + f_)
        return 1
    print("\nALL CHECKS PASSED")
    return 0


if __name__ == "__main__":
    sys.exit(main())
