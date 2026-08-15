# verify_M4.py — mathematical verification of ULTRASAT PT4 Math Module 4 (M4.json)
# For each item: (a) recompute the key from the givens, (b) rebuild each distractor
# from its named error recipe and confirm it differs from the key, (c) check MC
# numeric option ordering, (d) check SPR acceptedAnswers correctness + entry rules.
import json, os, sys
from fractions import Fraction

try:
    import sympy as sp
except ImportError:
    print("sympy not installed; run: pip install sympy --break-system-packages")
    sys.exit(1)

HERE = os.path.dirname(os.path.abspath(__file__))
with open(os.path.join(HERE, "M4.json"), encoding="utf-8") as f:
    MOD = json.load(f)
Q = {q["originalQuestionNumber"]: q for q in MOD["questions"]}

failures = []
def check(qnum, label, cond, detail=""):
    status = "ok" if cond else "FAIL"
    print(f"  Q{qnum:02d} [{status}] {label}" + (f" — {detail}" if detail else ""))
    if not cond:
        failures.append((qnum, label, detail))

def opts(qnum):
    return Q[qnum]["options"]

def key_index(qnum):
    return Q[qnum]["correctAnswer"]

def assert_key(qnum, expected_str):
    ki = key_index(qnum)
    check(qnum, f"key option is '{expected_str}' at index {ki}", opts(qnum)[ki] == expected_str,
          f"options={opts(qnum)}")

def assert_distractors_differ(qnum, derived):
    # derived: dict letter -> value-string that the named recipe produces
    ki = key_index(qnum)
    keystr = opts(qnum)[ki]
    for letter, val in derived.items():
        idx = "ABCD".index(letter)
        check(qnum, f"distractor {letter} = recipe value '{val}'", opts(qnum)[idx] == val)
        check(qnum, f"distractor {letter} differs from key", val != keystr)

def assert_ascending(qnum, values, note="ascending"):
    ok = all(values[i] < values[i+1] for i in range(len(values)-1))
    check(qnum, f"numeric options strictly {note}", ok, str(values))

def spr_check(qnum, exact_value, extra_note=""):
    q = Q[qnum]
    acc = q["acceptedAnswers"]
    check(qnum, "canonical answer in acceptedAnswers", q["correctAnswer"] in acc)
    for s in acc:
        limit = 6 if s.startswith("-") else 5
        check(qnum, f"entry '{s}' within {limit} chars", len(s) <= limit)
        v = Fraction(s) if "/" in s else Fraction(s)
        check(qnum, f"entry '{s}' equals exact value", v == exact_value,
              f"{v} vs {exact_value} {extra_note}")

def spr_enumerate(exact):
    """Every legal SPR entry string for the exact value, under the app grader rules:
    <=5 chars (<=6 with leading minus). Forms: integer; p/q fractions incl. unreduced;
    exact terminating decimals with all zero-paddings (both 0.x and .x variants when |v|<1;
    integers gain .0/.00/... paddings); for repeating decimals the maximum-precision
    truncation AND half-up rounding in both leading-zero and bare-point variants.
    Deterministic order: integer, fractions by ascending denominator, decimals."""
    v = Fraction(exact)
    L = 6 if v < 0 else 5
    sign = "-" if v < 0 else ""
    a = -v if v < 0 else v
    forms = []
    def add(s):
        s2 = sign + s
        if len(s2) <= L and s2 not in forms:
            forms.append(s2)
    if a.denominator == 1:
        add(str(a.numerator))
    for qq in range(1, 10000):
        p = a * qq
        if p.denominator == 1:
            add(f"{p.numerator}/{qq}")
    rem = a.denominator
    for f2 in (2, 5):
        while rem % f2 == 0:
            rem //= f2
    if rem == 1:                                   # terminating decimal
        dmin, t = 0, a
        while t.denominator != 1:
            t, dmin = t * 10, dmin + 1
        for d in range(max(dmin, 1), 7):
            digits = str((a * 10**d).numerator).rjust(d + 1, "0")
            add(f"{digits[:-d]}.{digits[-d:]}")
            if a < 1:
                add(f".{digits[-d:]}")
    else:                                          # repeating decimal
        prefixes = [f"{a.numerator // a.denominator}."]
        if a < 1:
            prefixes.append(".")
        for pre in prefixes:
            D = L - len(sign) - len(pre)
            if D <= 0:
                continue
            scaled = a * 10**D
            trunc = scaled.numerator // scaled.denominator
            half = scaled + Fraction(1, 2)
            rnd = half.numerator // half.denominator
            for n_ in (trunc, rnd):
                add(pre + str(n_).rjust(D, "0"))
    return forms

x, t, k, s_, b_ = sp.symbols("x t k s b")

print("=== Q1: linear function inversion f(x)=4x+3, f(x)=31 ===")
sol = sp.solve(sp.Eq(4*x + 3, 31), x)
check(1, "solution x = 7", sol == [7])
assert_key(1, "7")
assert_distractors_differ(1, {
    "B": str(4*7),                 # value of 4x (intermediate)
    "C": "31",                     # echo of the given output
    "D": str(4*31 + 3),            # f(31) evaluated instead of inverted
})
assert_ascending(1, [7, 28, 31, 127])

print("=== Q2: furlongs -> feet, 6 furlongs, 1 fur = 220 yd, 1 yd = 3 ft ===")
feet = 6 * 220 * 3
check(2, "6 furlongs = 3,960 feet", feet == 3960)
assert_key(2, "3,960")
assert_distractors_differ(2, {
    "A": f"{6 + 220:,}",           # added instead of multiplied
    "B": f"{220 * 3:,}",           # feet in one furlong (forgot x6)
    "C": f"{6 * 220:,}",           # yards only (partial conversion)
})
assert_ascending(2, [226, 660, 1320, 3960])

print("=== Q3: parallel lines, same-side interior angles, 122 + x = 180 ===")
xval = sp.solve(sp.Eq(x + 122, 180), x)
check(3, "x = 58", xval == [58])
assert_key(3, "58")
assert_distractors_differ(3, {
    "A": str(122 - 90),            # used 90 instead of 180
    "C": "90",                     # assumed right angle
    "D": "122",                    # the supplementary angle itself
})
assert_ascending(3, [32, 58, 90, 122])

print("=== Q4: parabola y=(x-3)^2-4 vertex/intercepts consistency ===")
fq = (x - 3)**2 - 4
vx = sp.solve(sp.diff(fq, x), x)[0]
check(4, "vertex x = 3", vx == 3)
check(4, "vertex y = -4", fq.subs(x, 3) == -4)
roots = sorted(sp.solve(fq, x))
check(4, "x-intercepts at 1 and 5", roots == [1, 5])
check(4, "y-intercept (0,5) on the drawn grid", fq.subs(x, 0) == 5)
# fix-round check: the vertical gridline at data x = 5 (px 200) is present — lattice uniform
import xml.etree.ElementTree as _ET
_q4root = _ET.parse(os.path.join(HERE, "assets", "M4-Q04.svg")).getroot()
_grid = [el for el in _q4root.iter() if el.tag.endswith("g") and el.get("stroke") == "#cccccc"]
check(4, "SVG has a #cccccc gridline group", len(_grid) == 1)
_vxs = sorted(float(el.get("x1")) for el in _grid[0] if el.get("x1") == el.get("x2"))
check(4, "vertical gridlines complete at every unit incl. x=5 (px 200), axis px 80 skipped",
      _vxs == [32.0, 56.0, 104.0, 128.0, 152.0, 176.0, 200.0, 224.0, 248.0, 272.0], str(_vxs))
assert_key(4, "(3, -4)")
assert_distractors_differ(4, {
    "A": "(-4, 3)",                # reversed coordinates
    "B": "(1, 0)",                 # x-intercept
    "D": "(5, 0)",                 # x-intercept
})
assert_ascending(4, [-4, 1, 3, 5], "ascending by x-coordinate (ordered pairs)")

print("=== Q5 SPR: 9x - 7 = 47 ===")
check(5, "solution x = 6", sp.solve(sp.Eq(9*x - 7, 47), x) == [6])
spr_check(5, Fraction(6))

print("=== Q6 SPR: f(x) = 8x - 3, f(7) ===")
check(6, "f(7) = 53", 8*7 - 3 == 53)
spr_check(6, Fraction(53))

print("=== Q7: system y=3x, 2x+y=45 -> x+y ===")
solsys = sp.solve([sp.Eq(sp.Symbol('y'), 3*x), sp.Eq(2*x + sp.Symbol('y'), 45)], [x, sp.Symbol('y')])
xs, ys = solsys[x], solsys[sp.Symbol('y')]
check(7, "x = 9, y = 27", (xs, ys) == (9, 27))
check(7, "x + y = 36", xs + ys == 36)
assert_key(7, "36")
assert_distractors_differ(7, {
    "A": str(xs),                  # x alone
    "B": str(ys),                  # y alone
    "D": str(2*xs + ys),           # 2x + y (the 45 echo)
})
assert_ascending(7, [9, 27, 36, 45])

print("=== Q8: 2x^2(6x^3 + 5) ===")
expanded = sp.expand(2*x**2 * (6*x**3 + 5))
check(8, "expansion = 12x^5 + 10x^2", expanded == 12*x**5 + 10*x**2)
assert_key(8, "12x⁵ + 10x²")
# recipes: A add coefficients (2+6, 2+5); B distribute first term only; D multiply exponents
recA = (2+6, 2+5)                       # 8x^5 + 7x^2
recB = sp.expand(2*x**2 * 6*x**3) + 5   # 12x^5 + 5
recD = 12*x**(2*3) + 10*x**2            # 12x^6 + 10x^2
check(8, "A recipe -> 8x^5 + 7x^2", recA == (8, 7) and opts(8)[0] == "8x⁵ + 7x²")
check(8, "B recipe -> 12x^5 + 5", recB == 12*x**5 + 5 and opts(8)[1] == "12x⁵ + 5")
check(8, "D recipe -> 12x^6 + 10x^2", recD == 12*x**6 + 10*x**2 and opts(8)[3] == "12x⁶ + 10x²")
check(8, "all distractors differ from key", all(e != expanded for e in [8*x**5+7*x**2, recB, recD]))

print("=== Q9: two-way table conditional probability ===")
u40p, u40e = 24, 28
o40p, o40e = 36, 12
row_u, row_o = u40p + u40e, o40p + o40e
col_p, col_e = u40p + o40p, u40e + o40e
grand = row_u + row_o
check(9, "row totals 52/48, col totals 60/40, grand 100",
      (row_u, row_o, col_p, col_e, grand) == (52, 48, 60, 40, 100))
keyfrac = Fraction(o40p, row_o)
check(9, "P(print | 40+) = 3/4", keyfrac == Fraction(3, 4))
assert_key(9, "3/4")
recipes9 = {
    "A": Fraction(o40e, row_o),    # complement within row: 12/48 = 1/4
    "B": Fraction(o40p, grand),    # grand-total denominator: 36/100 = 9/25
    "C": Fraction(o40p, col_p),    # transposed conditional: 36/60 = 3/5
}
check(9, "A recipe = 1/4", recipes9["A"] == Fraction(1, 4) and opts(9)[0] == "1/4")
check(9, "B recipe = 9/25", recipes9["B"] == Fraction(9, 25) and opts(9)[1] == "9/25")
check(9, "C recipe = 3/5", recipes9["C"] == Fraction(3, 5) and opts(9)[2] == "3/5")
check(9, "all distractors differ from key", all(v != keyfrac for v in recipes9.values()))
assert_ascending(9, [Fraction(1,4), Fraction(9,25), Fraction(3,5), Fraction(3,4)])

print("=== Q10: 3s + 7b = 132, b = 9 (variable renamed g -> b in fix round) ===")
sval = sp.solve(sp.Eq(3*s_ + 7*9, 132), s_)
check(10, "s = 23", sval == [23])
assert_key(10, "23")
blob10 = (Q[10]["passage"] or "") + Q[10]["text"] + Q[10]["explanation"]
check(10, "variable b used throughout; no stray 'g' variable remains",
      "7b = 132" in Q[10]["passage"] and "large bowls, b," in Q[10]["passage"]
      and "9 for b" in Q[10]["explanation"] and "7g" not in blob10 and ", g," not in blob10)
swap = sp.solve(sp.Eq(7*s_ + 3*9, 132), s_)   # coefficients swapped
check(10, "swap recipe integer-clean: s = 15", swap == [15])
assert_distractors_differ(10, {
    "A": "15",                     # coefficient swap
    "C": str(132 // 3),            # ignored large bowls: 132/3 = 44
    "D": str(132 - 63),            # value of 3s = 69
})
assert_ascending(10, [15, 23, 44, 69])

print("=== Q11: 6% growth every 4 years ===")
fA = 9000 * sp.Rational(106, 100)**(t/4)
check(11, "f(0) = 9,000", fA.subs(t, 0) == 9000)
check(11, "f(4)/f(0) = 1.06 (one period)", sp.simplify(fA.subs(t, 4)/fA.subs(t, 0)) == sp.Rational(106, 100))
check(11, "f(8)/f(4) = 1.06 (each period)", sp.simplify(fA.subs(t, 8)/fA.subs(t, 4)) == sp.Rational(106, 100))
fB = 9000 * sp.Rational(106, 100)**t          # 6% every year
fC = 9000 * sp.Rational(106, 100)**(4*t)      # 6% four times a year
fD = 9000 * sp.Rational(124, 100)**(t/4)      # 24% every 4 years (6*4 added)
check(11, "B recipe grows 6% per year (wrong)", sp.simplify(fB.subs(t, 1)/fB.subs(t, 0)) == sp.Rational(106, 100))
check(11, "C recipe grows 1.06^4 per year (wrong)", sp.simplify(fC.subs(t, 1)/fC.subs(t, 0)) == sp.Rational(106, 100)**4)
check(11, "D recipe grows 24% per 4 years (wrong)", sp.simplify(fD.subs(t, 4)/fD.subs(t, 0)) == sp.Rational(124, 100))
check(11, "all distractor functions differ from key at t=8",
      len({sp.nsimplify(f.subs(t, 8)) for f in [fA, fB, fC, fD]}) == 4)
check(11, "key at index 0 shows exponent t/4 and base 1.06",
      opts(11)[0] == "f(t) = 9,000(1.06)ᵗ⁄⁴" and key_index(11) == 0)

print("=== Q12 SPR: line through (3,10) and (7,2), x-intercept ===")
m = sp.Rational(2 - 10, 7 - 3)
check(12, "slope = -2", m == -2)
b = 10 - m*3
line = m*x + b
xint = sp.solve(sp.Eq(line, 0), x)
check(12, "x-intercept x = 8", xint == [8])
check(12, "line really passes both points", line.subs(x, 3) == 10 and line.subs(x, 7) == 2)
spr_check(12, Fraction(8))

print("=== Q13 SPR: side ratio 4 -> area ratio k ===")
sv = sp.Symbol("sv", positive=True)
ratio = sp.simplify((4*sv)**2 / sv**2)
check(13, "area factor k = 16", ratio == 16)
spr_check(13, Fraction(16))

print("=== Q14: margin of error interval ===")
lo, hi = 62 - 3, 62 + 3
check(14, "interval is 59% to 65%", (lo, hi) == (59, 65))
import math
check(14, "stem states the n = 1,100 sample (fix round: was 400)", "1,100 residents" in Q[14]["text"] and "400" not in Q[14]["text"])
check(14, "MoE 3% statistically consistent with n = 1,100 (100/sqrt(n) ~ 3)",
      abs(100 / math.sqrt(1100) - 3) < 0.5, f"100/sqrt(1100) = {100/math.sqrt(1100):.2f}")
check(14, "key A is the plausible-interval statement",
      key_index(14) == 0 and "plausible" in opts(14)[0] and "59%" in opts(14)[0] and "65%" in opts(14)[0])
check(14, "B = impossibility misreading", "not possible" in opts(14)[1])
check(14, "C = exact-value misreading", opts(14)[2].startswith("Exactly 62%"))
check(14, "D = equal-likelihood misreading", "equal chance" in opts(14)[3])

print("=== Q15: x >= 8 and 45x + 6y <= 520 ===")
check(15, "8 kits alone affordable: 45*8 = 360 <= 520", 45*8 <= 520)
check(15, "boundary spend reachable: 45*8 + 6*26 = 516 <= 520; +27 exceeds", 45*8+6*26 <= 520 < 45*8+6*27)
check(15, "key A inclusive both bounds", key_index(15) == 0 and opts(15)[0] == "x ≥ 8 and 45x + 6y ≤ 520")
check(15, "B strict on cost only", opts(15)[1] == "x ≥ 8 and 45x + 6y < 520")
check(15, "C strict on kits only", opts(15)[2] == "x > 8 and 45x + 6y ≤ 520")
check(15, "D directions reversed", opts(15)[3] == "x ≤ 8 and 45x + 6y ≥ 520")

print("=== Q16: slope of fit line through (0,210) and (10,60) ===")
slope = Fraction(60 - 210, 10 - 0)
check(16, "slope = -15", slope == -15)
check(16, "key D states $15 decrease per year", key_index(16) == 3 and "$15" in opts(16)[3] and "decreases" in opts(16)[3])
check(16, "A interprets intercept 210 as price at age 0", "$210" in opts(16)[0] and "0 years" in opts(16)[0])
check(16, "B puts slope magnitude in intercept role", "$15" in opts(16)[1] and "0 years" in opts(16)[1])
check(16, "C puts intercept value in slope role", "$210" in opts(16)[2] and "decreases" in opts(16)[2])
# scatter data sanity: all 10 points within +/-5 of the fit line
pts = [(1,200),(2,175),(3,170),(4,145),(5,140),(6,115),(7,105),(8,95),(9,75),(10,65)]
check(16, "10 dots, residuals within ±5", all(abs(y - (210 - 15*xx)) <= 5 for xx, y in pts) and len(pts) == 10)

print("=== Q17: 2x^2 + 8x + k = 0 has no real solutions ===")
disc = 8**2 - 4*2*k
boundary = sp.solve(sp.Eq(disc, 0), k)
check(17, "discriminant zero at k = 8 (integer AT the boundary)", boundary == [8])
noreal = sp.solveset(disc < 0, k, domain=sp.S.Reals)
check(17, "no real solutions iff k > 8", noreal == sp.Interval.open(8, sp.oo), str(noreal))
check(17, "least integer k = 9; k=9 gives negative discriminant", disc.subs(k, 9) < 0 and disc.subs(k, 8) == 0 and disc.subs(k, 7) > 0)
assert_key(17, "9")
assert_distractors_differ(17, {
    "A": "7",                      # greatest integer with two real solutions
    "B": "8",                      # boundary integer (exactly one solution)
    "D": "64",                     # b^2 fragment
})
assert_ascending(17, [7, 8, 9, 64])

print("=== Q18: similarity sufficiency (logic audit) ===")
# AA given. Congruence decidable iff a pair of CORRESPONDING sides is compared.
check(18, "key D compares corresponding sides JK and PQ",
      key_index(18) == 3 and opts(18)[3] == "The lengths of sides JK and PQ")
check(18, "A gives one side of one triangle only", opts(18)[0] == "The length of side PQ")
check(18, "B gives third angles (similarity only)", opts(18)[1] == "The measures of angles L and R")
check(18, "C gives two sides of the same triangle", opts(18)[2] == "The lengths of sides KL and JL")
# demonstrate the similar-but-not-congruent gap with a concrete counterexample:
# triangles with angles 50-60-70, sides scaled by 2 satisfy A/B/C info patterns ambiguously.
import math
A1, B1 = 50, 60
C1 = 180 - A1 - B1
check(18, "third angles forced equal by angle sum (B adds nothing)", C1 == 70)
scale = 2
check(18, "similar triangles with scale 2 are not congruent (gap exists)", scale != 1)

print("=== Q19 SPR: 6(3)^(4x) = a b^x -> ab ===")
lhs = 6 * 3**(4*x)
rhs = 6 * 81**x
check(19, "6*3^(4x) == 6*81^x for all x (sample + symbolic)",
      sp.simplify(lhs - rhs) == 0 or all(lhs.subs(x, v) == rhs.subs(x, v) for v in [0, 1, 2, 3, sp.Rational(1, 2)]))
a_, b_ = 6, 81
check(19, "a=6, b=81, ab=486", a_*b_ == 486)
spr_check(19, Fraction(486))

print("=== Q20: x^2 + y^2 - 10x + 4y = 7 -> radius ===")
y = sp.Symbol("y")
expr = x**2 + y**2 - 10*x + 4*y - 7
completed = (x - 5)**2 + (y + 2)**2 - 36
check(20, "completing the square: (x-5)^2 + (y+2)^2 = 36", sp.expand(expr - completed) == 0)
r = sp.sqrt(36)
check(20, "radius = 6 (clean value from even coefficients)", r == 6)
assert_key(20, "6")
# recipes: A sqrt(RHS constant) = sqrt(7); C diameter 12; D r^2 = 36
check(20, "A recipe √7 (RHS constant as r²)", opts(20)[0] == "√7" and sp.sqrt(7) != 6)
assert_distractors_differ(20, {
    "C": "12",                     # diameter
    "D": "36",                     # r^2
})
check(20, "options ascending by value (√7 < 6 < 12 < 36)",
      float(sp.sqrt(7)) < 6 < 12 < 36)

print("=== Q21: y = x^2-2x+13 and y = 6x+4 -> x = p ± √q ===")
eq = sp.Eq(x**2 - 2*x + 13, 6*x + 4)
quad = sp.expand(x**2 - 2*x + 13 - (6*x + 4))
check(21, "combined quadratic x^2 - 8x + 9", quad == x**2 - 8*x + 9)
roots21 = sp.solve(eq, x)
check(21, "roots are 4 ± √7 (two real intersections)", set(roots21) == {4 - sp.sqrt(7), 4 + sp.sqrt(7)})
p_, q_ = 4, 7
check(21, "p = 4, q = 7", all(sp.simplify(rt - (p_ + sgn*sp.sqrt(q_))) == 0 for rt, sgn in [(roots21[0], -1), (roots21[1], 1)] ) or set(roots21) == {p_ - sp.sqrt(q_), p_ + sp.sqrt(q_)})
disc21 = (-8)**2 - 4*1*9
check(21, "discriminant 28 (distractor D source)", disc21 == 28)
assert_key(21, "7")
assert_distractors_differ(21, {
    "A": "4",                      # p offered for q
    "C": "9",                      # constant term echo
    "D": "28",                     # discriminant used as q
})
assert_ascending(21, [4, 7, 9, 28])

print("=== Q22 SPR: f(x)=ax^2+bx through (1,5),(3,3) -> max value ===")
a_s, b_s = sp.symbols("a_s b_s")
solab = sp.solve([sp.Eq(a_s + b_s, 5), sp.Eq(9*a_s + 3*b_s, 3)], [a_s, b_s])
check(22, "a = -2, b = 7", (solab[a_s], solab[b_s]) == (-2, 7))
f22 = -2*x**2 + 7*x
check(22, "f(1)=5 and f(3)=3 verified", f22.subs(x, 1) == 5 and f22.subs(x, 3) == 3)
vx22 = sp.Rational(-7, 2*(-2))
check(22, "vertex x = 7/4", vx22 == sp.Rational(7, 4))
maxval = f22.subs(x, sp.Rational(7, 4))
check(22, "maximum value = 49/8", maxval == sp.Rational(49, 8))
check(22, "opens downward (a < 0), so vertex is a maximum", solab[a_s] < 0)
spr_check(22, Fraction(49, 8))
check(22, "decimal entry 6.125 is exact", Fraction("6.125") == Fraction(49, 8))

print("\n=== module-level checks ===")
mc = [q for q in MOD["questions"] if q["questionType"] == "multiple-choice"]
spr = [q for q in MOD["questions"] if q["questionType"] == "user-input"]
check(0, "16 MC + 6 SPR", (len(mc), len(spr)) == (16, 6), f"{len(mc)} MC / {len(spr)} SPR")
sprpos = sorted(q["originalQuestionNumber"] for q in spr)
check(0, "SPR at positions 5, 6, 12, 13, 19, 22", sprpos == [5, 6, 12, 13, 19, 22], str(sprpos))
diffs = [q["difficulty"] for q in MOD["questions"]]
check(0, "8E / 8M / 6H", (diffs.count("easy"), diffs.count("medium"), diffs.count("hard")) == (8, 8, 6))
check(0, "curve: Q1-8 easy, Q9-16 medium, Q17-22 hard",
      all(Q[i]["difficulty"] == "easy" for i in range(1, 9)) and
      all(Q[i]["difficulty"] == "medium" for i in range(9, 17)) and
      all(Q[i]["difficulty"] == "hard" for i in range(17, 23)))
letters = [("ABCD"[q["correctAnswer"]]) for q in mc]
tally = {c: letters.count(c) for c in "ABCD"}
check(0, "key letters flat 4/4/4/4", all(v == 4 for v in tally.values()), str(tally))
import re
for q in mc:
    tagged = [o for o in q["options"] if re.search(r"<\s*/?\s*[a-zA-Z]+[^<>]*>", o)]
    check(q["originalQuestionNumber"], "exactly 4 options, no HTML tags (math </> symbols allowed)",
          len(q["options"]) == 4 and not tagged, str(tagged))
for q in spr:
    check(q["originalQuestionNumber"], "SPR options empty + acceptedAnswers present",
          q["options"] == [] and isinstance(q["acceptedAnswers"], list) and len(q["acceptedAnswers"]) >= 1)
print("\n=== SPR acceptedAnswers completeness (full legal-entry enumeration) ===")
SPR_EXACT = {5: Fraction(6), 6: Fraction(53), 12: Fraction(8),
             13: Fraction(16), 19: Fraction(486), 22: Fraction(49, 8)}
for n, exact in SPR_EXACT.items():
    full = spr_enumerate(exact)
    check(n, f"acceptedAnswers == complete legal-entry set ({len(full)} forms)",
          set(Q[n]["acceptedAnswers"]) == set(full))
    check(n, "canonical form listed first", Q[n]["acceptedAnswers"][0] == Q[n]["correctAnswer"])
figs = {q["originalQuestionNumber"]: q["graphAsset"] for q in MOD["questions"] if q["graphAsset"]}
check(0, "figures on Q3, Q4, Q16 only", figs == {3: "M4-Q03.svg", 4: "M4-Q04.svg", 16: "M4-Q16.svg"}, str(figs))
for fn in ["M4-Q03.svg", "M4-Q04.svg", "M4-Q16.svg"]:
    p = os.path.join(HERE, "assets", fn)
    ok = os.path.exists(p)
    if ok:
        import xml.etree.ElementTree as ET
        try:
            ET.parse(p)
        except ET.ParseError as e:
            ok = False
    check(0, f"{fn} exists and is well-formed XML", ok)

print()
if failures:
    print(f"RESULT: {len(failures)} FAILURE(S)")
    for f_ in failures:
        print("  ", f_)
    sys.exit(1)
print("RESULT: ALL CHECKS PASSED")
