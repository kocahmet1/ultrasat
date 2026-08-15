"""Apply the adversarial-solver findings to the four bands the fix agents did not reach,
and regenerate every SPR acceptedAnswers list programmatically for all six bands.

Every edit below traces to a finding in findings_<mod>_<from>.json.
"""
import json
import os
from fractions import Fraction

WORK = os.path.dirname(os.path.abspath(__file__)) + '/work'


def load(name):
    with open(f'{WORK}/{name}', encoding='utf-8') as fh:
        d = json.load(fh)
    return d if isinstance(d, list) else d['items']


def by_q(items):
    return {q['originalQuestionNumber']: q for q in items}


# ---------------------------------------------------------------------------
# SPR accepted-answer generation — the house convention, enumerated to the limit
# ---------------------------------------------------------------------------
def spr_entries(answer):
    """Every legal grid entry equal to `answer`, ordered as the shipped forms order them."""
    s = str(answer).strip()
    neg = s.startswith('-')
    limit = 6 if neg else 5
    out = [s]

    if '/' in s:
        p, q = s.split('/')
        f = Fraction(int(p), int(q))
    elif '.' in s:
        f = Fraction(s)
    else:
        f = Fraction(int(s))

    p, q = f.numerator, f.denominator

    # equivalent fractions k*p / k*q
    for k in range(1, 200):
        e = f'{p * k}/{q * k}'
        if len(e) <= limit and e != s:
            out.append(e)

    # decimal surfaces
    if q == 1:
        for pad in range(1, 4):
            e = f'{p}.' + '0' * pad
            if len(e) <= limit and e not in out:
                out.append(e)
    else:
        exact = (10 ** 6) % q == 0 or (10 ** 6 * abs(p)) % q == 0
        val = abs(p) / q
        sign = '-' if p < 0 else ''
        if exact and float(f) == float(f'{float(f):.6f}'):
            base = f'{float(abs(f)):.10f}'.rstrip('0').rstrip('.')
            forms = [base]
            if base.startswith('0.'):
                forms.append(base[1:])
            for pad in range(1, 4):
                forms.append(base + '0' * pad)
                if base.startswith('0.'):
                    forms.append(base[1:] + '0' * pad)
            for e in forms:
                e = sign + e
                if len(e) <= limit and e not in out:
                    out.append(e)
        else:
            # truncated and rounded, with and without the leading zero
            digits = limit - (2 if not neg else 3)
            trunc = f'{val:.10f}'
            cand = []
            for d in (4, 3, 2):
                t = trunc[:trunc.index('.') + 1 + d]
                r = f'{val:.{d}f}'
                for base in (t, r):
                    cand.append(base)
                    if base.startswith('0.'):
                        cand.append(base[1:])
            for e in cand:
                e = sign + e
                if len(e) <= limit and e not in out and abs(float(e) - float(f)) < 10 ** -3:
                    out.append(e)
    # de-dupe, keep order
    seen, res = set(), []
    for e in out:
        if e not in seen:
            seen.add(e)
            res.append(e)
    return res


def fix_spr(items):
    for q in items:
        if q['questionType'] == 'user-input':
            q['acceptedAnswers'] = spr_entries(q['correctAnswer'])
    return items


# ---------------------------------------------------------------------------
# Band M3 Q16-Q22
# ---------------------------------------------------------------------------
def fix_3_16(items):
    d = by_q(items)

    # Q16 — relabel every point (official item uses D, E, BC, DE); null passage; "It's shown that"
    q = d[16]
    q['passage'] = None
    q['text'] = 'In triangle RST shown, segment UV is parallel to side ST. What is the length of segment UV?'
    q['graphDescription'] = ('A triangle has vertices labeled R at the top, S at the lower left, and T at the '
                             'lower right. Point U lies on side RS and point V lies on side RT, and segment UV '
                             'is drawn. The length of segment RU is labeled 6, the length of segment US is '
                             'labeled 9, and the length of side ST is labeled 30.')
    q['explanation'] = (
        'Choice A is correct. It’s given that segment UV is parallel to side ST, so angle RUV and angle RST are '
        'congruent corresponding angles, and triangle RUV and triangle RST share angle R. Two triangles that have '
        'two pairs of congruent corresponding angles are similar, and the lengths of corresponding sides of similar '
        'triangles are proportional. It follows that UV/ST = RU/RS. It’s shown that the length of segment RU is 6, '
        'the length of segment US is 9, and the length of side ST is 30. It follows that the length of side RS is '
        '6 + 9, or 15. Substituting 30 for ST, 6 for RU, and 15 for RS in this proportion yields UV/30 = 6/15. '
        'Multiplying both sides of this equation by 30 yields UV = 12. Therefore, the length of segment UV is 12. '
        'Choice B is incorrect and may result from using the length of segment US, rather than the length of segment '
        'RU, as the numerator of the ratio. Choice C is incorrect and may result from using the length of segment US, '
        'rather than the length of side RS, as the denominator of the ratio. Choice D is incorrect and may result '
        'from using the ratio RS/RU, rather than the ratio RU/RS, in the proportion.')

    # Q17 — anchor the scaled target to the equation's own leading coefficient
    q = d[17]
    q['text'] = 'If x is a solution to the given equation, which of the following is a possible value of 2x?'
    q['options'] = ['4', '8', '14', '20']
    q['correctAnswer'] = 1
    q['distractorLogic'] = ('A: reports x itself rather than 2x; C: reports 2(x + 3), the value one step before the '
                            'final subtraction; D: adds 3 to both sides of x + 3 = 7 rather than subtracting, giving '
                            'x = 10 and 2x = 20.')
    q['explanation'] = (
        'Choice B is correct. It’s given that 2(x + 3)² = 98. Dividing both sides of this equation by 2 yields '
        '(x + 3)² = 49. Taking the square root of both sides of this equation yields x + 3 = 7 or x + 3 = −7. '
        'Subtracting 3 from both sides of each of these equations yields x = 4 or x = −10. Substituting 4 for x in '
        'the expression 2x yields 2(4), or 8. Therefore, 8 is a possible value of 2x. Choice A is incorrect. This is '
        'a possible value of x, not a possible value of 2x. Choice C is incorrect. This is the value of 2(x + 3), '
        'not the value of 2x. Choice D is incorrect and may result from adding, rather than subtracting, 3 to both '
        'sides of the equation x + 3 = 7, which yields x = 10 rather than x = 4.')

    # Q18 — rename the circles off the burned A/B pairing; trim stem and rationale
    q = d[18]
    q['passage'] = ('<div style="text-align:center; margin:8px 0;">x<sup>2</sup> + y<sup>2</sup> + 10x − 24y + 105 = 0'
                    '</div><p>In the xy-plane, the graph of the given equation is circle P. Circle Q has the same '
                    'center as circle P and a radius twice as long.</p>')
    q['text'] = 'Which equation defines circle Q?'
    q['explanation'] = (
        'Choice D is correct. The equation of a circle with center (h, k) and radius r can be written in the form '
        '(x − h)² + (y − k)² = r². It’s given that the graph of x² + y² + 10x − 24y + 105 = 0 is circle P. Completing '
        'the square in x and in y yields (x² + 10x + 25) + (y² − 24y + 144) + 105 − 25 − 144 = 0, or '
        '(x + 5)² + (y − 12)² − 64 = 0. Adding 64 to both sides of this equation yields (x + 5)² + (y − 12)² = 64. '
        'It follows that circle P has center (−5, 12) and radius √64, or 8. Since circle Q has the same center and a '
        'radius twice as long, circle Q has center (−5, 12) and radius 2(8), or 16. It follows that the equation that '
        'defines circle Q is (x + 5)² + (y − 12)² = 16², or (x + 5)² + (y − 12)² = 256. Choice A is incorrect and may '
        'result from using the radius of circle Q, rather than the square of the radius of circle Q, on the '
        'right-hand side. Choice B is incorrect. This is an equation that defines circle P, not circle Q. Choice C is '
        'incorrect and may result from doubling the square of the radius of circle P, rather than doubling the radius.')

    # Q20 — add the hard-tier structural step: neither observation is at t = 0
    q = d[20]
    q['passage'] = ('<p>The water level of a reservoir decreased at a constant rate during a drought. The water level '
                    'was 72 feet 4 weeks after the start of the drought and 60 feet 8 weeks after the start of the '
                    'drought.</p>')
    q['options'] = ['3', '9', '13', '17']
    q['correctAnswer'] = 2
    q['distractorLogic'] = ('A: reports the constant rate of decrease, in feet per week, instead of a number of weeks; '
                            'B: measures the elapsed time from the 4-week observation rather than from the start of '
                            'the drought; D: adds the 4-week offset to the correct answer a second time.')
    q['explanation'] = (
        'Choice C is correct. It’s given that the water level of the reservoir decreased at a constant rate and that '
        'the water level was 72 feet 4 weeks after the start of the drought and 60 feet 8 weeks after the start of '
        'the drought. Subtracting 60 from 72 yields a decrease of 12 feet over these 4 weeks. Dividing 12 by 4 yields '
        'a constant rate of decrease of 3 feet per week. Since the water level was 72 feet 4 weeks after the start of '
        'the drought, the water level at the start of the drought was 72 + 4(3), or 84, feet. It follows that the '
        'water level, in feet, w weeks after the start of the drought is 84 − 3w. Substituting 45 for the water level '
        'yields 84 − 3w = 45. Subtracting 84 from both sides of this equation yields −3w = −39. Dividing both sides '
        'of this equation by −3 yields w = 13. Therefore, the water level was 45 feet 13 weeks after the start of the '
        'drought. Choice A is incorrect. This is the number of feet by which the water level decreased each week, not '
        'a number of weeks. Choice B is incorrect. This is the number of weeks after the water level was 72 feet, not '
        'the number of weeks after the start of the drought. Choice D is incorrect and may result from adding the '
        '4-week offset to the number of weeks after the start of the drought a second time.')

    # Q21 — replace the option that contradicts a stated condition
    q = d[21]
    q['options'] = ['-7', '-6', '-4', '-1']
    q['correctAnswer'] = 0
    q['distractorLogic'] = ('B: takes k² > 48 to be satisfied at k = −6, where k² is 36; C: uses k² − ac rather than '
                            'k² − 4ac as the discriminant; D: requires the discriminant to be negative rather than '
                            'positive for two distinct real solutions.')
    q['explanation'] = (
        'Choice A is correct. A quadratic equation of the form ax² + bx + c = 0, where a, b, and c are constants and '
        'the value of a isn’t 0, has two distinct real solutions if and only if the value of its discriminant, '
        'b² − 4ac, is positive. For the given equation, a = 3, b = k, and c = 4. Substituting 3 for a, k for b, and 4 '
        'for c in b² − 4ac yields k² − 4(3)(4), or k² − 48. It follows that the given equation has two distinct real '
        'solutions if and only if k² − 48 > 0, or k² > 48. It’s given that k is a negative integer constant. If '
        'k = −7, then k² = 49, which is greater than 48. If k is a negative integer greater than −7, the greatest '
        'possible value of k² is (−6)², or 36, which isn’t greater than 48. Therefore, the greatest possible value of '
        'k is −7. Choice B is incorrect. If k = −6, then k² − 4ac = 36 − 48, or −12, so the given equation has no '
        'real solutions. Choice C is incorrect and may result from using k² − ac, rather than k² − 4ac, as the '
        'discriminant. Choice D is incorrect and may result from concluding that the given equation has two distinct '
        'real solutions when the value of its discriminant is negative, rather than positive.')

    # Q22 — move the key off the burned 3/2 while keeping the archetype and the non-integer x
    q = d[22]
    q['passage'] = ('<div style="text-align:center; margin:8px 0;">4x + 10y = 19</div>'
                    '<div style="text-align:center; margin:8px 0;">−4x + 6y = 9</div>')
    q['correctAnswer'] = '7/4'
    q['explanation'] = (
        'The correct answer is 7/4. It’s given that the solution to the system of equations is (x, y), so the values '
        'of x and y satisfy both equations of the system. Adding the left-hand side of the second equation to the '
        'left-hand side of the first equation and the right-hand side of the second equation to the right-hand side '
        'of the first equation yields (4x + 10y) + (−4x + 6y) = 19 + 9, or 16y = 28. Dividing both sides of this '
        'equation by 16 yields y = 28/16, which is equivalent to y = 7/4. Therefore, the value of y is 7/4. Note that '
        '7/4 and 1.75 are examples of ways to enter a correct answer.')
    return items


# ---------------------------------------------------------------------------
# Band M4 Q1-Q8
# ---------------------------------------------------------------------------
def fix_4_1(items):
    d = by_q(items)

    # Q2 — differentiate the rationale from PT5's monomial-power-rule dismissal trio
    q = d[2]
    q['explanation'] = (
        'Choice B is correct. For any positive number a and any integers m and n, the quotient aᵐ/aⁿ is equal to '
        'aᵐ⁻ⁿ. It follows that x¹⁸/x⁶ is equivalent to x¹⁸⁻⁶, or x¹². Therefore, the expression equivalent to x¹⁸/x⁶ '
        'is x¹². Choice A is incorrect. This expression is equivalent to the quotient of the exponents, x¹⁸÷⁶, not to '
        'the quotient of the given powers. Choice C is incorrect and may result from adding, rather than subtracting, '
        'the exponents 18 and 6. Choice D is incorrect and may result from multiplying, rather than subtracting, the '
        'exponents 18 and 6.')

    # Q3 — move off the burned population-density-and-area quantity pair
    q = d[3]
    q['passage'] = None
    q['text'] = ('A quarry has produced a total of 6,300 blocks of stone at a constant rate of 175 blocks per day. '
                 'For how many days has the quarry been producing blocks?')
    q['distractorLogic'] = ('B: subtracts the daily rate from the total rather than dividing; C: adds the daily rate '
                            'to the total; D: multiplies the total by the daily rate rather than dividing.')
    q['explanation'] = (
        'Choice A is correct. It’s given that the quarry has produced a total of 6,300 blocks of stone at a constant '
        'rate of 175 blocks per day. The number of days is the total number of blocks divided by the number of blocks '
        'produced per day. Dividing 6,300 by 175 yields 36. Therefore, the quarry has been producing blocks for 36 '
        'days. Choice B is incorrect and may result from subtracting, rather than dividing by, the number of blocks '
        'produced per day. Choice C is incorrect and may result from adding, rather than dividing by, the number of '
        'blocks produced per day. Choice D is incorrect and may result from multiplying, rather than dividing, the '
        'total number of blocks by the number of blocks produced per day.')

    # Q4 — re-parameterize off PT4 M4 Q4's curve and reword the exhibit sentence
    q = d[4]
    q['passage'] = '<p>The function f is graphed in the xy-plane.</p>'
    q['text'] = 'What is the y-intercept of the graph shown?'
    q['options'] = ['(0, 16)', '(2, 0)', '(8, 0)', '(16, 0)']
    q['correctAnswer'] = 0
    q['graphDescription'] = ('A curve in the xy-plane opens upward, passes through the points (0, 16), (2, 0), and '
                             '(8, 0), and has its lowest point at (5, −9).')
    q['distractorLogic'] = ('B: reports the leftmost x-intercept; C: reports the rightmost x-intercept; D: reports the '
                            'y-coordinate of the y-intercept as an x-coordinate, interchanging the coordinates.')
    q['explanation'] = (
        'Choice A is correct. The y-intercept of a graph in the xy-plane is the point at which the graph crosses the '
        'y-axis, which is the point on the graph with x-coordinate 0. It’s shown that the graph passes through the '
        'point (0, 16) and crosses no other point of the y-axis. Therefore, the y-intercept of the graph shown is '
        '(0, 16). Choice B is incorrect. This is an x-intercept of the graph, not the y-intercept. Choice C is '
        'incorrect. This is the other x-intercept of the graph, not the y-intercept. Choice D is incorrect. This '
        'point has the coordinates of the y-intercept interchanged.')

    # Q6 — move the constant off PT5 M4 Q5's 19
    q = d[6]
    q['passage'] = '<div style="text-align:center; margin:8px 0;">|x + 9| = 22</div>'
    q['explanation'] = (
        'The correct answer is 13. The given equation is equivalent to the two equations x + 9 = 22 and x + 9 = −22. '
        'Subtracting 9 from both sides of the equation x + 9 = 22 yields x = 13. Subtracting 9 from both sides of the '
        'equation x + 9 = −22 yields x = −31. Since −31 isn’t positive, the positive solution to the given equation '
        'is 13.')

    # Q7 — swap the burned crate object noun and unpad the decimal coefficient
    q = d[7]
    q['text'] = ('A shipment contains x cartons of grade A and y cartons of grade B. During an inspection, 15% of the '
                 'grade A cartons and 40% of the grade B cartons are opened, and at least 90 cartons are opened. '
                 'Which inequality represents this situation?')
    q['options'] = ['0.15x + 0.4y ≤ 90', '0.15x + 0.4y ≥ 90', '15x + 40y ≤ 90', '15x + 40y ≥ 90']
    q['correctAnswer'] = 1
    q['explanation'] = (
        'Choice B is correct. It’s given that 15% of the x grade A cartons are opened, so the number of grade A '
        'cartons opened is 0.15x. It’s also given that 40% of the y grade B cartons are opened, so the number of '
        'grade B cartons opened is 0.4y. It follows that the total number of cartons opened is 0.15x + 0.4y. Since at '
        'least 90 cartons are opened, this total is greater than or equal to 90. Therefore, the inequality '
        '0.15x + 0.4y ≥ 90 represents this situation. Choice A is incorrect. This inequality represents a situation '
        'where at most 90 cartons are opened, not at least 90. Choice C is incorrect and may result from not '
        'converting the percentages to decimals and from reversing the direction of the inequality. Choice D is '
        'incorrect and may result from not converting the percentages to decimals.')

    # Q8 — relabel off PT4's JKL/PQR and PT5's ABC/DEF
    q = d[8]
    q['text'] = ('Triangle FGH is congruent to triangle WXY, where the measure of angle F is 37° and the measure of '
                 'angle G is 82°. What is the measure of angle X?')
    q['distractorLogic'] = ('A: reports the measure of angle W, which corresponds to angle F, rather than angle X; '
                            'C: reports the measure of angle Y, the third angle of the triangle; D: reports the sum of '
                            'the measures of angles F and G.')
    q['explanation'] = (
        'Choice C is correct. Corresponding angles of congruent triangles have equal measures. It’s given that '
        'triangle FGH is congruent to triangle WXY, so angle G and angle X are corresponding angles and their '
        'measures are equal. It’s given that the measure of angle G is 82°. Therefore, the measure of angle X is 82°. '
        'Choice A is incorrect. This is the measure of angle W, which corresponds to angle F, not the measure of '
        'angle X. Choice B is incorrect. This is the measure of angle Y, which corresponds to angle H, not the '
        'measure of angle X. Choice D is incorrect. This is the sum of the measures of angle F and angle G, not the '
        'measure of angle X.')
    q['options'] = ['37°', '61°', '82°', '119°']
    q['correctAnswer'] = 2
    return items


# ---------------------------------------------------------------------------
# Band M4 Q9-Q15
# ---------------------------------------------------------------------------
def fix_4_9(items):
    d = by_q(items)

    # Q9 — drop the face-perimeter rung PT4 already shipped; use the sum of the edge lengths
    q = d[9]
    q['options'] = ['81', '108', '486', '729']
    q['correctAnswer'] = 3
    q['distractorLogic'] = ('A: reports the area of one face, 9², rather than the volume; B: reports the sum of the '
                            'lengths of the 12 edges, 12(9); C: reports the surface area, 6(9²).')
    q['explanation'] = (
        'Choice D is correct. The volume V of a cube with edge length e is given by the formula V = e³. It’s given '
        'that the cube has an edge length of 9 inches. Substituting 9 for e in this formula yields V = 9³, or 729. '
        'Therefore, the volume, in cubic inches, of the cube is 729. Choice A is incorrect. This is the area, in '
        'square inches, of one face of the cube, not the volume, in cubic inches, of the cube. Choice B is incorrect. '
        'This is the sum of the lengths, in inches, of the edges of the cube, not the volume, in cubic inches, of the '
        'cube. Choice C is incorrect. This is the surface area, in square inches, of the cube, not the volume, in '
        'cubic inches, of the cube.')

    # Q10 — move off the burned seed/seedling context
    q = d[10]
    q['passage'] = q['passage'].replace(
        'The table summarizes the tray type and the germination result for each of the seeds planted in the seedling '
        'trays at a certain nursery.',
        'The table summarizes the hive type and the overwintering result for each of the colonies at a certain apiary.'
    ).replace('Germinated', 'Survived').replace('Did not germinate', 'Did not survive') \
     .replace('Shallow tray', 'Shallow hive').replace('Deep tray', 'Deep hive')
    q['text'] = ('If one of these colonies is selected at random, what is the probability of selecting a colony that '
                 'was housed in a shallow hive and did not survive?')
    q['explanation'] = (q['explanation']
                        .replace('seeds', 'colonies').replace('seed', 'colony')
                        .replace('planted in a shallow tray', 'housed in a shallow hive')
                        .replace('planted in a deep tray', 'housed in a deep hive')
                        .replace('shallow tray', 'shallow hive').replace('deep tray', 'deep hive')
                        .replace('germinated', 'survived').replace('did not survive', 'did not survive'))

    # Q11 — change the asked ratio off PT5 M4 Q11's cosine
    q = d[11]
    q['text'] = 'What is the value of sin L?'
    q['distractorLogic'] = ('A: reports the ratio of the leg adjacent to angle L to the hypotenuse, which is cos L; '
                            'B: reports the ratio of the two legs, which is tan N; D: reports the reciprocal of the '
                            'ratio of the leg opposite angle L to the hypotenuse.')
    q['explanation'] = (
        'Choice C is correct. In a right triangle, the sine of an acute angle is the ratio of the length of the leg '
        'opposite that angle to the length of the hypotenuse. It’s shown that in right triangle LMN, the right angle '
        'is at vertex M, the length of leg LM is 9, and the length of leg MN is 40. By the Pythagorean theorem, the '
        'length of hypotenuse LN satisfies (LN)² = 9² + 40², or (LN)² = 1,681, which yields LN = 41. The leg opposite '
        'angle L is MN, which has length 40. Therefore, the value of sin L is 40/41. Choice A is incorrect. This is '
        'the ratio of the length of the leg adjacent to angle L to the length of the hypotenuse, which is the value '
        'of cos L, not sin L. Choice B is incorrect. This is the ratio of the length of leg LM to the length of leg '
        'MN, not the value of sin L. Choice D is incorrect. This is the reciprocal of the value of sin L.')

    # Q12 — invert the fact order off PT5 M3 Q11's two-sentence architecture
    q = d[12]
    q['passage'] = ('<p>A quality inspector found that 34 of the ceramic tiles in a batch produced at a certain '
                    'factory were flawed. These 34 flawed tiles were 8% of the tiles in the batch.</p>')
    q['explanation'] = (
        'The correct answer is 425. It’s given that 34 flawed tiles were 8% of the tiles in the batch. Since 8% is '
        'equivalent to 8/100, or 0.08, it follows that 0.08 times the number of tiles in the batch is equal to 34. '
        'Dividing 34 by 0.08 yields 34/0.08, or 425. Therefore, there were 425 tiles in the batch.')

    # Q13 — remove the m/m symbol collision from the rationale
    q = d[13]
    q['explanation'] = (
        'The correct answer is 3/8. It’s given that line k is defined by 8x + 3y = 30. Subtracting 8x from both sides '
        'of this equation yields 3y = −8x + 30. Dividing both sides of this equation by 3 yields y = (−8/3)x + 10, so '
        'the slope of line k is −8/3. In the xy-plane, the slopes of two perpendicular lines are negative reciprocals '
        'of each other. It’s given that line m is perpendicular to line k, so the slope of line m is the negative '
        'reciprocal of −8/3, or 3/8. Therefore, the slope of line m is 3/8. Note that 3/8, .375, and 0.375 are '
        'examples of ways to enter a correct answer.')

    # Q14 — build the system the item is filed under
    q = d[14]
    q['explanation'] = (
        'Choice B is correct. Let x represent the number of cases Tomas packed during the first week and let y '
        'represent the number of cases Tomas packed during the second week. It’s given that Tomas packed a total of '
        '360 cases during the two weeks, so x + y = 360. It’s also given that the number of cases Tomas packed during '
        'the second week was 24 more than 5 times the number of cases Tomas packed during the first week, so '
        'y = 5x + 24. Substituting 5x + 24 for y in the equation x + y = 360 yields x + 5x + 24 = 360, or '
        '6x + 24 = 360. Subtracting 24 from both sides of this equation yields 6x = 336. Dividing both sides of this '
        'equation by 6 yields x = 56. Therefore, Tomas packed 56 cases during the first week. Choice A is incorrect '
        'and may result from dividing the total, 360, by 9 rather than by 6. Choice C is incorrect and may result '
        'from omitting the 24 additional cases before dividing the total by 6. Choice D is incorrect. This is the '
        'number of cases Tomas packed during the second week, not during the first week.')
    q['options'] = ['40', '56', '64', '304']
    q['correctAnswer'] = 1

    # Q15 — make 68% a whole count of the sample and move off "state park"
    q = d[15]
    q['passage'] = (q['passage'].replace('240 visitors', '250 visitors')
                    .replace('a certain state park', 'a certain recreation area')
                    .replace('the park', 'the recreation area'))
    q['text'] = q['text'].replace('the park', 'the recreation area')
    q['options'] = [o.replace('the park', 'the recreation area') for o in q['options']]
    q['explanation'] = (q['explanation'].replace('240 visitors', '250 visitors')
                        .replace('a certain state park', 'a certain recreation area')
                        .replace('the park', 'the recreation area'))
    return items


# ---------------------------------------------------------------------------
# Band M4 Q16-Q22
# ---------------------------------------------------------------------------
def fix_4_16(items):
    d = by_q(items)

    # Q16 — house style: prose variables are not italicized; only the table headers are
    q = d[16]
    for a, b in [('<i>f</i>(<i>x</i>) = <i>a</i>(<i>b</i>)<sup><i>x</i></sup>', 'f(x) = a(b)<sup>x</sup>'),
                 ('where <i>a</i> and <i>b</i> are constants', 'where a and b are constants')]:
        q['passage'] = q['passage'].replace(a, b)

    # Q18 — apply the census's attested hard twist: the complementary region
    q = d[18]
    q['passage'] = '<p>A circle has a radius of 12 inches. A sector of this circle has a central angle of measure 150°.</p>'
    q['text'] = 'What is the area, in square inches, of the larger sector of this circle?'
    q['options'] = ['144π', '84π', '60π', '14π']
    q['correctAnswer'] = 1
    q['distractorLogic'] = ('A: reports the area of the entire circle; C: reports the area of the smaller sector, the '
                            'one with central angle 150°; D: reports the length of the larger arc rather than the area '
                            'of the larger sector.')
    q['explanation'] = (
        'Choice B is correct. The area A of a circle with radius r is given by the formula A = πr². It’s given that '
        'the circle has a radius of 12 inches, so substituting 12 for r in this formula yields A = π(12)², or 144π. '
        'In a circle, the ratio of the measure of a central angle to 360° is equal to the ratio of the area of the '
        'sector determined by that angle to the area of the circle. It’s given that a sector of this circle has a '
        'central angle of measure 150°, so the larger sector is determined by a central angle of measure '
        '360° − 150°, or 210°. Multiplying 144π by 210/360 yields 84π. Therefore, the area, in square inches, of the '
        'larger sector of this circle is 84π. Choice A is incorrect. This is the area, in square inches, of the '
        'entire circle, not of the larger sector. Choice C is incorrect. This is the area, in square inches, of the '
        'smaller sector, not of the larger sector. Choice D is incorrect. This is the length, in inches, of the '
        'larger arc, not the area, in square inches, of the larger sector.')
    q['trap'] = 'adjacent-quantity: the smaller sector and the arc length are both offered against the asked area'

    # Q19 — narrate the two unwarranted steps
    q = d[19]
    q['explanation'] = (
        'The correct answer is −4. It’s given that f(x) = (x − 10)(x + k), so the graph of y = f(x) in the xy-plane '
        'has x-intercepts (10, 0) and (−k, 0). Expanding the right-hand side of the given equation yields '
        'f(x) = x² + (k − 10)x − 10k. Since the coefficient of x² is positive, this graph is a parabola that opens '
        'upward, and the x-coordinate of the minimum of such a parabola is the average of the x-coordinates of its '
        'x-intercepts, or (10 + (−k))/2, which is equivalent to (10 − k)/2. It’s given that the minimum of the graph '
        'occurs at x = 7, so (10 − k)/2 = 7. Multiplying both sides of this equation by 2 yields 10 − k = 14. '
        'Subtracting 10 from both sides of this equation yields −k = 4, and multiplying both sides by −1 yields '
        'k = −4. Therefore, the value of k is −4.')

    # Q21 — move the leading coefficient and denominator off PT5 M3 Q21's number set
    q = d[21]
    q['passage'] = '<div style="text-align:center; margin:8px 0;">4x<sup>2</sup> − 12x − 3 = 0</div>'
    q['options'] = ['(-3 + 2√3)/2', '(3 + 2√3)/8', '(3 + 2√3)/2', '(3 + √192)/2']
    q['correctAnswer'] = 2
    q['distractorLogic'] = ('A: uses b rather than −b in the numerator of the quadratic formula; B: divides only the '
                            'numerator by the common factor 4, leaving the denominator unchanged; D: divides 12 and 8 '
                            'by 4 without also simplifying the radical.')
    q['explanation'] = (
        'Choice C is correct. The solutions to a quadratic equation of the form ax² + bx + c = 0, where a, b, and c '
        'are constants and the value of a isn’t 0, are given by the quadratic formula x = (−b ± √(b² − 4ac))/(2a). '
        'For the given equation, a = 4, b = −12, and c = −3. Substituting 4 for a, −12 for b, and −3 for c in the '
        'quadratic formula yields x = (12 ± √((−12)² − 4(4)(−3)))/(2(4)), or x = (12 ± √(144 + 48))/8, which is '
        'equivalent to x = (12 ± √192)/8. Since 192 = 64(3), the expression √192 is equivalent to 8√3. It follows '
        'that x = (12 ± 8√3)/8. Dividing the numerator and the denominator by their common factor 4 yields '
        'x = (3 ± 2√3)/2. Therefore, (3 + 2√3)/2 is a solution to the given equation. Choice A is incorrect and may '
        'result from using b, rather than −b, in the numerator of the quadratic formula. Choice B is incorrect and '
        'may result from dividing only the numerator, rather than both the numerator and the denominator, by the '
        'common factor 4. Choice D is incorrect and may result from dividing 12 and 8 by 4 without also simplifying '
        'the radical.')

    # Q22 — rename the constants and change the asked composite off PT5 M4 Q22
    q = d[22]
    q['passage'] = ('<div style="text-align:center; margin:8px 0;">r/(x − 1) + t/(x + 3) = '
                    '(13x + 7)/((x − 1)(x + 3))</div>')
    q['text'] = 'The given equation is true for all x > 1, where r and t are constants. What is the value of r/t?'
    q['correctAnswer'] = '5/8'
    q['explanation'] = (
        'The correct answer is 5/8. It’s given that the equation is true for all x > 1. Multiplying both sides of the '
        'given equation by (x − 1)(x + 3) yields r(x + 3) + t(x − 1) = 13x + 7. Applying the distributive property to '
        'the left-hand side of this equation yields rx + 3r + tx − t = 13x + 7, or (r + t)x + (3r − t) = 13x + 7. For '
        'this equation to be true for all x > 1, the coefficients of x must be equal and the constant terms must be '
        'equal. It follows that r + t = 13 and 3r − t = 7. Adding these two equations yields 4r = 20, or r = 5. '
        'Substituting 5 for r in the equation r + t = 13 yields t = 8. Therefore, the value of r/t is 5/8. Note that '
        '5/8, .625, and 0.625 are examples of ways to enter a correct answer.')
    return items


if __name__ == '__main__':
    plan = [('3_1', None), ('3_9', None), ('3_16', fix_3_16),
            ('4_1', fix_4_1), ('4_9', fix_4_9), ('4_16', fix_4_16)]
    for key, fn in plan:
        src = f'fixed_{key}.json' if os.path.exists(f'{WORK}/fixed_{key}.json') else f'band_{key}.json'
        items = load(src)
        if fn:
            items = fn(items)
        items = fix_spr(items)
        with open(f'{WORK}/final_{key}.json', 'w', encoding='utf-8') as fh:
            json.dump(items, fh, ensure_ascii=False, indent=1)
        print(f'{key}: {src} -> final_{key}.json ({len(items)} items)')
