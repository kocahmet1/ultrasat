# -*- coding: utf-8 -*-
"""Shared SPR legal-entry enumerator for ULTRASAT PT5 math modules.

Generates EVERY legal student-produced-response entry string for an exact value under
the app grader rules: at most 5 characters (6 when a leading minus sign is present).

Forms produced, in this order:
  1. the integer form (when the value is an integer)
  2. every equivalent fraction p/q, INCLUDING unreduced ones, whose string fits
  3. every decimal form that fits:
       - exact terminating values: all zero-padded expansions
       - repeating values: maximum-precision truncation AND half-up rounding, emitted
         both with the leading zero ("0.882") and without it (".882")
The canonical entry (the module's correctAnswer string) is hoisted to the front.
"""
from fractions import Fraction

__all__ = ["spr_enumerate"]


def spr_enumerate(exact, canonical=None):
    v = Fraction(exact)
    limit = 6 if v < 0 else 5
    sign = "-" if v < 0 else ""
    a = -v if v < 0 else v
    forms = []

    def add(s):
        s2 = sign + s
        if len(s2) <= limit and s2 not in forms:
            forms.append(s2)

    # 1. integer form
    if a.denominator == 1:
        add(str(a.numerator))

    # 2. every equivalent fraction that fits (unreduced included)
    for qq in range(1, 10000):
        p = a * qq
        if p.denominator == 1:
            add("%d/%d" % (p.numerator, qq))

    # 3. decimals
    rem = a.denominator
    for f2 in (2, 5):
        while rem % f2 == 0:
            rem //= f2
    if rem == 1:                                   # terminating
        dmin, t = 0, a
        while t.denominator != 1:
            t, dmin = t * 10, dmin + 1
        for d in range(max(dmin, 1), 8):
            digits = str((a * 10 ** d).numerator).rjust(d + 1, "0")
            add("%s.%s" % (digits[:-d], digits[-d:]))
            if a < 1:
                add(".%s" % digits[-d:])
    else:                                          # repeating
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


if __name__ == "__main__":
    for val, canon in ((Fraction(11), "11"), (Fraction(216), "216"), (Fraction(9), "9"),
                       (Fraction(15, 17), "15/17"), (Fraction(201), "201"), (Fraction(-12), "-12"),
                       (Fraction(13), "13"), (Fraction(107), "107"), (Fraction(12), "12"),
                       (Fraction(25, 2), "12.5"), (Fraction(31), "31"), (Fraction(15, 2), "15/2")):
        forms = spr_enumerate(val, canon)
        print("%-8s %2d  %s" % (canon, len(forms), ", ".join(forms)))
