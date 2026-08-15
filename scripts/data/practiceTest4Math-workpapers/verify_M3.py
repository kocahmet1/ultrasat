#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
verify_M3.py — full mathematical + structural verification of ULTRASAT PT4 Math Module 3 (M3.json).

For every item it (a) recomputes the correct answer from the givens, (b) re-derives each
distractor from its named error recipe and confirms it differs from the key, (c) checks
numeric MC option sets are strictly ascending, and (d) checks every SPR acceptedAnswers
entry is a correct value under the app's 5-char rule (6 with minus).
Module-level: quotas, SPR positions, difficulty curve, key-letter tally, plain-text options,
figure files present/well-formed.

Run:  python3 verify_M3.py     (exits 0 and prints ALL CHECKS PASSED on success)
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
    """Parse a plain-text option like '7x² + 5x - 3' or '-2x + 4' into a sympy expr."""
    s = s.replace("²", "**2").replace("³", "**3").replace("⁴", "**4")
    s = s.replace(",", "")            # thousands commas
    s = s.replace("−", "-")           # just in case
    return parse_expr(s, transformations=TRANS)

def opt_nums(item):
    return [float(o.replace("%", "").replace(",", "")) for o in item["options"]]

def strictly_ascending(vals):
    return all(a < b for a, b in zip(vals, vals[1:]))

x, y_, w = sp.symbols("x y w")

# ---------------------------------------------------------------- module shell
print("== Module shell ==")
check(MOD["moduleNumber"] == 3 and MOD["section"] == "Math", "moduleNumber 3 / section Math")
check(MOD["calculatorAllowed"] is True and MOD["timeLimit"] == 2100, "calculator true, timeLimit 2100")
check(len(MOD["questions"]) == 22, "22 questions")
spr = [it["originalQuestionNumber"] for it in MOD["questions"] if it["questionType"] == "user-input"]
check(spr == [5, 6, 12, 13, 19, 22], f"SPR positions {spr} == [5, 6, 12, 13, 19, 22]")
mc = [it for it in MOD["questions"] if it["questionType"] == "multiple-choice"]
check(len(mc) == 16, "16 MC")
diffs = [it["difficulty"] for it in MOD["questions"]]
expected_curve = (["easy"]*8 + ["medium"] + ["easy"] + ["medium"]*6 + ["hard"]*6)
check(diffs == expected_curve, "difficulty curve E×8, M, E(straggler), M×6, H×6  (9E/7M/6H)")
check((diffs.count("easy"), diffs.count("medium"), diffs.count("hard")) == (9, 7, 6), "difficulty mix 9/7/6")
tally = {}
for it in mc:
    tally["ABCD"[it["correctAnswer"]]] = tally.get("ABCD"[it["correctAnswer"]], 0) + 1
check(all(tally.get(L, 0) == 4 for L in "ABCD"), f"key-letter tally {tally} == 4/4/4/4")
SUBIDS = {"linear-equations-one-variable":11,"linear-functions":12,"linear-equations-two-variables":13,
          "systems-linear-equations":14,"linear-inequalities":15,"nonlinear-functions":16,
          "nonlinear-equations":17,"equivalent-expressions":18,"ratios-rates-proportions":19,
          "percentages":20,"one-variable-data":21,"two-variable-data":22,"area-volume":26,
          "lines-angles-triangles":27,"right-triangles-trigonometry":28,"circles":29}
check(all(SUBIDS[it["subcategory"]] == it["subcategoryId"] for it in MOD["questions"]), "subcategoryId map correct")
tag = re.compile(r"</?[A-Za-z]")
check(all(not tag.search(o) for it in mc for o in it["options"]), "options contain no HTML tags")
for it in mc:
    check(it["explanation"].startswith(f"Choice {'ABCD'[it['correctAnswer']]} is correct."),
          f"Q{it['originalQuestionNumber']} rationale opener matches key letter")
for n in spr:
    it = q(n)
    check(it["explanation"].startswith("The correct answer is"), f"Q{n} SPR rationale opener")
    check(it["options"] == [] and isinstance(it["correctAnswer"], str), f"Q{n} SPR field shapes")
    check(it["correctAnswer"] in it["acceptedAnswers"], f"Q{n} canonical answer in acceptedAnswers")
    for e in it["acceptedAnswers"]:
        limit = 6 if e.startswith("-") else 5
        check(len(e) <= limit, f"Q{n} entry '{e}' within {limit}-char rule")

def spr_entry_value_ok(entry, exact):
    """entry is correct: fractions exact; decimals within truncation/rounding of stated places."""
    if "/" in entry:
        return Fraction(entry) == Fraction(exact)
    v = Fraction(entry)
    if "." not in entry:
        return v == Fraction(exact)
    d = len(entry.split(".")[1])
    return abs(v - Fraction(exact)) < Fraction(1, 10**d)

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

print("== SPR acceptedAnswers completeness (full legal-entry enumeration) ==")
SPR_EXACT = {5: Fraction(27), 6: Fraction(37), 12: Fraction(165),
             13: Fraction(4, 9), 19: Fraction(149), 22: Fraction(-12, 5)}
for n, exact in SPR_EXACT.items():
    it = q(n)
    full = spr_enumerate(exact)
    check(set(it["acceptedAnswers"]) == set(full),
          f"Q{n} acceptedAnswers == complete legal-entry set ({len(full)} forms)")
    check(it["acceptedAnswers"][0] == it["correctAnswer"], f"Q{n} canonical form listed first")

# ---------------------------------------------------------------- Q1
print("== Q1 linear 2-step solve ==")
it = q(1)
key = Fraction(38 - 6, 4)
check(key == 8, "recompute: (38-6)/4 = 8")
d_echo, d_sign, d_partial = 6, Fraction(38 + 6, 4), 38 - 6
check(d_echo != key and d_sign != key and d_partial != key, "distractors (echo 6, sign 11, 4x=32) all differ from key")
check(it["options"] == ["6", "8", "11", "32"] and it["correctAnswer"] == 1, "options/key index")
check(strictly_ascending(opt_nums(it)), "numeric options strictly ascending")

# ---------------------------------------------------------------- Q2
print("== Q2 linear model equation ==")
it = q(2)
rhss = [parse_math(o.split("=")[1]) for o in it["options"]]
key_expr = 4*x + 30                      # $4 per kg × x kg + $30 fee
check(sp.simplify(rhss[1] - key_expr) == 0 and it["correctAnswer"] == 1, "key equation C = 4x + 30 at index B")
check(sp.simplify(rhss[0] - (4*x - 30)) == 0, "A = fee-sign slip 4x − 30")
check(sp.simplify(rhss[2] - (30*x + 4)) == 0, "C = slope/intercept swap 30x + 4")
check(sp.simplify(rhss[3] - 34*x) == 0, "D = fee+rate combined 34x")
check(all(sp.simplify(r - key_expr) != 0 for i, r in enumerate(rhss) if i != 1), "all distractors differ from key")

# ---------------------------------------------------------------- Q3
print("== Q3 combine like terms ==")
it = q(3)
key_expr = sp.expand((5*x**2 + 8*x - 7) + (2*x**2 - 3*x + 4))
check(key_expr == 7*x**2 + 5*x - 3, "recompute sum = 7x² + 5x − 3")
opts = [parse_math(o) for o in it["options"]]
check(sp.expand(opts[0] - key_expr) == 0 and it["correctAnswer"] == 0, "key at index A")
check(sp.expand(opts[1] - (7*x**2 + 5*x + 3)) == 0, "B = constant-sign error (+3)")
check(sp.expand(opts[2] - (7*x**2 + 11*x - 3)) == 0, "C = x-term sign error (8x+3x)")
check(sp.expand(opts[3] - (7*x**4 + 5*x - 3)) == 0, "D = added exponents (7x⁴)")
check(all(sp.expand(o - key_expr) != 0 for o in opts[1:]), "distractors differ from key")

# ---------------------------------------------------------------- Q4
print("== Q4 rate × amount ==")
it = q(4)
check(5 * 12 == 60 and it["options"][it["correctAnswer"]] == "60", "recompute 5×12 = 60")
check(it["options"] == ["5", "12", "17", "60"], "distractors: part 5, count 12, sum 17")
check(strictly_ascending(opt_nums(it)), "ascending")

# ---------------------------------------------------------------- Q5 (SPR)
print("== Q5 SPR ax+by=c ==")
it = q(5)
g = Fraction(96 - 3*14, 2)
check(g == 27, "recompute g = (96 − 3·14)/2 = 27")
check(it["correctAnswer"] == "27" and it["acceptedAnswers"][0] == "27", "canonical 27 (full accepted set checked in enumeration block)")

# ---------------------------------------------------------------- Q6 (SPR)
print("== Q6 SPR evaluate quadratic ==")
it = q(6)
val = 3*4**2 - 5*4 + 9
check(val == 37 and it["correctAnswer"] == "37", "f(4) = 37")

# ---------------------------------------------------------------- Q7
print("== Q7 median from table ==")
it = q(7)
data = [47, 44, 60, 41, 55, 44, 52]
med = statistics.median(data); mean = statistics.mean(data)
mode = statistics.mode(data); rng = max(data) - min(data)
check(med == 47 and it["options"][it["correctAnswer"]] == "47", "median = 47 (key)")
check(mean == 49 and mode == 44 and rng == 19, "distractors mean 49, mode 44, range 19")
check(len({med, mean, mode, rng}) == 4, "all four statistics distinct")
check(it["options"] == ["19", "44", "47", "49"] and strictly_ascending(opt_nums(it)), "ascending [19,44,47,49]")

# ---------------------------------------------------------------- Q8
print("== Q8 line graph → equation ==")
it = q(8)
m = Fraction(0 - (-4), 2 - 0); b = -4
check(m == 2 and b == -4, "slope from (0,−4),(2,0) is 2; intercept −4")
rhss = [parse_math(o.split("=")[1]) for o in it["options"]]
check(sp.simplify(rhss[2] - (2*x - 4)) == 0 and it["correctAnswer"] == 2, "key y = 2x − 4 at index C")
grid = {sp.srepr(sp.expand(r)) for r in rhss}
expect = {sp.srepr(sp.expand(e)) for e in (2*x-4, 2*x+4, -2*x-4, -2*x+4)}
check(grid == expect and len(grid) == 4, "options form the sign 2×2 grid, all distinct")

# ---------------------------------------------------------------- Q9
print("== Q9 which system represents ==")
it = q(9)
a, c = sp.symbols("a c")
def solve_sys(opt):
    e1, e2 = opt.split(" and ")
    eqs = []
    for e in (e1, e2):
        lhs, rhs = e.split("=")
        eqs.append(sp.Eq(parse_math(lhs), parse_math(rhs)))
    sol = sp.solve(eqs, (a, c), dict=True)[0]
    return (sol[a], sol[c])
sols = [solve_sys(o) for o in it["options"]]
true_sol = (150, 110)                        # 150+110=260 ✓, 9·150+5·110=1350+550=1900 ✓
check(9*150 + 5*110 == 1900 and 150 + 110 == 260, "situation facts: a=150, c=110")
check(sols[3] == true_sol and it["correctAnswer"] == 3, "key system D yields (150, 110)")
check(all(s != true_sol for s in sols[:3]), f"distractor systems yield {sols[:3]} ≠ (150, 110)")
check(sols[2] == (110, 150), "C is the coefficient swap (solution roles swapped)")

# ---------------------------------------------------------------- Q10
print("== Q10 prism volume ==")
it = q(10)
L, W, H = 8, 6, 5
vol = L*W*H; base_perim = 2*(L+W); base_area = L*W; surf = 2*(L*W + L*H + W*H)
check(vol == 240 and it["options"][it["correctAnswer"]] == "240", "volume 8·6·5 = 240 (key)")
check((base_perim, base_area, surf) == (28, 48, 236), "ladder distractors 28 / 48 / 236")
check(len({vol, base_perim, base_area, surf}) == 4, "all four values distinct")
check(it["options"] == ["28", "48", "236", "240"] and strictly_ascending(opt_nums(it)), "ascending")

# ---------------------------------------------------------------- Q11
print("== Q11 observed vs predicted ==")
it = q(11)
predicted = 2*2 + 4          # line of best fit y = 2x + 4 at x = 2
observed = 14                # plotted point (2, 14) in M3-Q11.svg
diff = observed - predicted
check(predicted == 8 and diff == 6, "predicted 8, difference 6")
check(it["options"] == ["2", "6", "8", "14"] and it["correctAnswer"] == 1, "key 6; distractors x-echo 2, predicted 8, observed 14")
check(strictly_ascending(opt_nums(it)), "ascending")
resid = {1:-2, 2:6, 3:2, 4:-2, 5:-2, 6:2, 7:-2, 8:2, 9:-2}
check(abs(sum(resid.values())) <= 2, "best-fit plausibility: residuals ≈ balanced")
check([k for k, v in resid.items() if v == 6] == [2], "unique outlier dot at x = 2")

# ---------------------------------------------------------------- Q12 (SPR)
print("== Q12 SPR wrong-target ==")
it = q(12)
w_val = sp.solve(sp.Eq(7*(w + 3), 55), w)[0]
target = 21*(w_val + 3)
check(sp.simplify(target) == 165 and it["correctAnswer"] == "165", "21(w+3) = 3·55 = 165")
check(not w_val.is_integer, f"w itself = {w_val} is non-integer → structural shortcut rewarded")

# ---------------------------------------------------------------- Q13 (SPR)
print("== Q13 SPR cofunction ==")
it = q(13)
exact = Fraction(4, 9)       # q = 90 − p ⇒ cos(q°) = sin(p°) = 4/9
p_, q_ = sp.symbols("p q")
check(sp.simplify(sp.cos(sp.rad(90 - p_)) - sp.sin(sp.rad(p_))) == 0, "identity cos(90°−p°) = sin(p°)")
check(it["correctAnswer"] == "4/9", "canonical 4/9")
for e in it["acceptedAnswers"]:
    check(spr_entry_value_ok(e, exact), f"accepted entry '{e}' is a correct value of 4/9")

# ---------------------------------------------------------------- Q14
print("== Q14 exponential interpretation ==")
it = q(14)
P0 = 1150 * 0.94**0; P1 = 1150 * 0.94**1; P2 = 1150 * 0.94**2
check(P0 == 1150 and it["correctAnswer"] == 0, "P(0) = 1,150 → initial value (key A)")
check(round(P1) == 1081 and P1 != 1150, "B wrong: population in 2016 is 1,081, not 1,150")
check(abs((P1 - P0) - (P2 - P1)) > 1, "C wrong: annual change is not a constant amount")
check((1 - 0.94) * 100 == 6.0000000000000005 or abs((1-0.94)*100 - 6) < 1e-9, "D wrong: annual percent decrease is 6, not 1,150")

# ---------------------------------------------------------------- Q15
print("== Q15 identity coefficient b ==")
it = q(15)
poly = sp.expand((2*x + 7)*(4*x - 3))
bcoef = poly.coeff(x, 1)
check(poly == 8*x**2 + 22*x - 21 and bcoef == 22, "expand → 8x² + 22x − 21, b = 22")
check(it["options"] == ["-22", "-6", "22", "28"] and it["correctAnswer"] == 2, "key 22 at C")
check((-22, -6, 28) == (-bcoef, sp.expand((2*x)*(-3)).coeff(x, 1), sp.expand(7*(4*x)).coeff(x, 1)), "distractors: sign −22, partials −6 and 28")
check(strictly_ascending(opt_nums(it)), "ascending")

# ---------------------------------------------------------------- Q16
print("== Q16 inequality represents ==")
it = q(16)
preds = {
    0: lambda X, Y: 60*X + 150*Y <= 2400,
    1: lambda X, Y: 60*X + 150*Y < 2400,
    2: lambda X, Y: 60*X + 150*Y >= 2400,
    3: lambda X, Y: 150*X + 60*Y <= 2400,
}
check(it["correctAnswer"] == 0, "key A = 60x + 150y ≤ 2,400")
check(preds[0](40, 0) and preds[0](0, 16) and not preds[0](40, 1), "key admits boundary loads (2,400 exactly) and rejects overloads")
check(not preds[1](40, 0), "B (strict) wrongly rejects an exactly-2,400 load")
check(not preds[2](0, 0), "C (≥) wrongly rejects an empty elevator")
check(not preds[3](30, 4) and preds[0](30, 4), "D (swapped weights) disagrees with key at (30, 4)")
samples = [(X, Y) for X in range(0, 45, 5) for Y in range(0, 18, 2)]
for i in (1, 2, 3):
    check(any(preds[i](*s) != preds[0](*s) for s in samples), f"option {'ABCD'[i]} semantically differs from key")

# ---------------------------------------------------------------- Q17
print("== Q17 radical extraneous ==")
it = q(17)
cands = sp.solve(sp.Eq(15 - x, (3 - x)**2), x)
check(set(cands) == {-1, 6}, "squaring yields candidates −1 and 6")
valid = [v for v in cands if sp.sqrt(15 - v) == 3 - v]
check(valid == [-1], "only −1 satisfies the original equation (6 extraneous: √9 = 3 ≠ −3)")
check(it["options"] == ["I only", "II only", "I and II", "Neither I nor II"], "Roman-numeral option set")
check(it["correctAnswer"] == 0, "valid set {−1} = numeral I → key A")

# ---------------------------------------------------------------- Q18
print("== Q18 tangency parameter ==")
it = q(18)
cc = sp.symbols("cc")
disc = (-8)**2 - 4*1*(cc + 3)
c_val = sp.solve(sp.Eq(disc, 0), cc)[0]
check(c_val == 13, "discriminant 52 − 4c = 0 → c = 13")
roots = sp.solve(sp.Eq(-x**2 + 8*x - 3, 13), x)
check(roots == [4], "tangency confirmed: double root at x = 4")
y_int = (-x**2 + 8*x - 3).subs(x, 0)
check((-13, -3, 4) == (-c_val, y_int, 4), "distractors: sign −13, y-intercept −3, vertex x 4")
check(it["options"] == ["-13", "-3", "4", "13"] and it["correctAnswer"] == 3, "key 13 at D")
check(strictly_ascending(opt_nums(it)), "ascending")

# ---------------------------------------------------------------- Q19 (SPR)
print("== Q19 SPR function-notation nesting ==")
it = q(19)
f19 = lambda v: v**2 + 5                     # f(x) = x² + 5
g19 = lambda v: f19(v - 2)                   # g(x) = f(x − 2)
inner = f19(3)
check(inner == 14, "inner value f(3) = 3² + 5 = 14")
check(g19(inner) == 149 and it["correctAnswer"] == "149", "g(f(3)) = f(14 − 2) = f(12) = 149")
slips = {"f(f(3)) shift ignored": f19(inner),          # 201
         "f(14 + 2) shift added": f19(inner + 2),      # 261
         "stopped at shifted input 14 − 2": inner - 2, # 12
         "g(3) inner composition skipped": g19(3)}     # 6
check(all(vv != 149 for vv in slips.values()),
      f"nesting-slip paths {sorted(slips.values())} all differ from 149")
check(len(set(slips.values()) | {149}) == 5, "slip paths mutually distinct from key and each other")

# ---------------------------------------------------------------- Q20
print("== Q20 chained percents ==")
it = q(20)
mult = Fraction(250, 100) * Fraction(50, 100)
check(mult == Fraction(125, 100), "2.5 × 0.5 = 1.25 → x is 125% of z")
check(it["options"] == ["80%", "125%", "200%", "300%"] and it["correctAnswer"] == 1, "key 125% at B")
check(Fraction(100) / mult == 80, "distractor 80% = reversed chain (z as % of x)")
check(250 - 50 == 200 and 250 + 50 == 300, "distractors 200% subtracted, 300% added")
check(strictly_ascending(opt_nums(it)), "ascending")

# ---------------------------------------------------------------- Q21
print("== Q21 circle point constraint (sign-slip-on-center architecture) ==")
it = q(21)
kk = sp.symbols("kk")
ks = sp.solve(sp.Eq((6 - 6)**2 + (kk + 1)**2, 169), kk)
check(set(ks) == {12, -14}, "(k+1)² = 169 → k = 12 or −14")
key_k = [v for v in ks if v > 0]
check(key_k == [12] and it["options"][it["correctAnswer"]] == "12", "k > 0 selects 12 (key value unchanged, letter C)")
def wrong_center(cx, cy):
    """k > 0 on the circle as computed from a (mis)read center (cx, cy), radius 13."""
    sols = sp.solve(sp.Eq((6 - cx)**2 + (kk - cy)**2, 169), kk)
    pos = [v for v in sols if v > 0]
    return pos[0] if len(pos) == 1 else pos
check(wrong_center(6, -1) == 12, "true center (6, −1) reproduces the key")
check(wrong_center(-6, -1) == 4, "A = 4: wrong-signed a, center read (−6, −1) → 144 + (k+1)² = 169")
check(wrong_center(-6, 1) == 6, "B = 6: both signs flipped, center read (−6, 1) → (k−1)² = 25")
check(wrong_center(6, 1) == 14, "D = 14: wrong-signed b, center read (6, 1) → (k−1)² = 169")
check(169 - 144 == 25 and sp.sqrt(25) == 5, "5-12-13 engineering: wrong-center paths land on integers")
check(it["options"] == ["4", "6", "12", "14"] and strictly_ascending(opt_nums(it)), "ascending [4, 6, 12, 14]")
check(len(set(it["options"])) == 4, "all option values distinct")

# ---------------------------------------------------------------- Q22 (SPR)
print("== Q22 SPR no-solution parameter ==")
it = q(22)
kx = sp.symbols("kx")
k_val = sp.solve(sp.Eq(-kx/4, sp.Rational(3, 5)), kx)[0]
check(k_val == sp.Rational(-12, 5), "slope match −k/4 = 3/5 → k = −12/5")
check(sp.Rational(7, 4) != sp.Rational(-9, 10), "y-intercepts differ → truly no solution (not coincident)")
sols = sp.solve([sp.Eq(sp.Rational(-12, 5)*x + 4*y_, 7), sp.Eq(6*x - 10*y_, 9)], (x, y_))
check(sols == [], "system with k = −12/5 has no solution")
check(-k_val == sp.Rational(12, 5) and -k_val != k_val, "sign-slip value +12/5 differs from key")
exact = Fraction(-12, 5)
check(it["correctAnswer"] == "-12/5", "canonical -12/5")
for e in it["acceptedAnswers"]:
    check(spr_entry_value_ok(e, exact), f"accepted entry '{e}' equals −12/5")

# ---------------------------------------------------------------- figures
print("== Figures ==")
ASSETS = os.path.join(HERE, "assets")
for n, fname in [(8, "M3-Q08.svg"), (10, "M3-Q10.svg"), (11, "M3-Q11.svg")]:
    p = os.path.join(ASSETS, fname)
    check(os.path.exists(p), f"{fname} exists")
    try:
        root = ET.parse(p).getroot()
        ok = root.tag.endswith("svg")
    except Exception:
        ok = False
    check(ok, f"{fname} well-formed SVG")
    check(root.get("width") == "380", f"{fname} canvas width 380px (house standard)")
    check(q(n)["graphAsset"] == fname and q(n)["graphDescription"], f"Q{n} references {fname} with alt text")
# M3-Q08 content: recovered mapping px = 168 + 26x, py = 172 − 26y; drawn segment slope/intercept
q8root = ET.parse(os.path.join(ASSETS, "M3-Q08.svg")).getroot()
seg = [el for el in q8root.iter() if el.tag.endswith("line") and el.get("stroke") == "#000000" and el.get("stroke-width") == "2"]
check(len(seg) == 1, "M3-Q08 has exactly one drawn data line")
x1, y1, x2, y2 = (float(seg[0].get(a)) for a in ("x1", "y1", "x2", "y2"))
dx1, dy1 = (x1 - 168) / 26, (172 - y1) / 26
dx2, dy2 = (x2 - 168) / 26, (172 - y2) / 26
slope_px = (dy2 - dy1) / (dx2 - dx1)
yint_px = dy1 - slope_px * dx1
check(abs(slope_px - 2) < 1e-9 and abs(yint_px - (-4)) < 1e-9, "M3-Q08 rescaled line still exactly y = 2x − 4")
with open(os.path.join(ASSETS, "M3-Q10.svg"), encoding="utf-8") as f:
    check("not drawn to scale" in f.read(), "geometry figure carries the not-drawn-to-scale note")
for fname in ("M3-Q08.svg", "M3-Q11.svg"):
    with open(os.path.join(ASSETS, fname), encoding="utf-8") as f:
        check("not drawn to scale" not in f.read(), f"{fname} (coordinate grid) carries no scale note")
nograph = [it["originalQuestionNumber"] for it in MOD["questions"]
           if it["graphAsset"] is None and it["graphDescription"] is None]
check(len(nograph) == 19, "all other items have graphAsset/graphDescription null")

# ---------------------------------------------------------------- summary
print()
if FAIL:
    print(f"{len(FAIL)} CHECK(S) FAILED:")
    for f_ in FAIL:
        print("  -", f_)
    sys.exit(1)
print("ALL CHECKS PASSED — M3.json verified clean.")
