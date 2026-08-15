"""Apply the final-critique findings (form critic + style critic + both solvers).

Each edit cites the finding it closes. Run apply_fixes.py first; this operates on
work/final_*.json in place and then assemble.py rebuilds the form.
"""
import json
import os

WORK = os.path.dirname(os.path.abspath(__file__)) + '/work'


def load(name):
    with open(f'{WORK}/{name}', encoding='utf-8') as fh:
        return json.load(fh)


def save(name, items):
    with open(f'{WORK}/{name}', 'w', encoding='utf-8') as fh:
        json.dump(items, fh, ensure_ascii=False, indent=1)


def by_q(items):
    return {q['originalQuestionNumber']: q for q in items}


# ===========================================================================
# M3 Q1-Q8
# ===========================================================================
items = load('final_3_1.json')
d = by_q(items)

# Q3 — "printing studio / posters" brushes the burned official "printer producing posters"
q = d[3]
q['passage'] = ('<p>At a bindery, the ratio of the number of notebooks Priya assembles to the number of folders '
                'Priya assembles is 3 to 8. Priya assembles 104 folders.</p>')
q['text'] = 'How many notebooks does Priya assemble?'
q['explanation'] = (
    'Choice B is correct. It’s given that the ratio of the number of notebooks Priya assembles to the number of '
    'folders Priya assembles is 3 to 8 and that Priya assembles 104 folders. Let n represent the number of notebooks '
    'Priya assembles. This ratio can be represented by the proportion n/104 = 3/8. Multiplying both sides of this '
    'equation by 104 yields n = 104(3/8), or n = 39. Therefore, Priya assembles 39 notebooks. Choice A is incorrect. '
    'This is the number of notebooks Priya assembles for every 8 folders Priya assembles, not the number of notebooks '
    'Priya assembles. Choice C is incorrect. This is the number of folders Priya assembles, not the number of '
    'notebooks. Choice D is incorrect. This is the number of notebooks and folders Priya assembles combined, not the '
    'number of notebooks.')

# Q4 — realize the blueprint's adjacent-quantity trap: offer f at a different input
q = d[4]
q['options'] = ['12', '17', '19', '103']
q['correctAnswer'] = 2
q['distractorLogic'] = ('A: omits the coefficient 2, evaluating √49 + 5; B: evaluates f at 36 rather than at 49; '
                        'D: evaluates 2x + 5 rather than 2√x + 5.')
q['trap'] = 'adjacent-quantity: the value of f at a different input is offered'
q['explanation'] = (
    'Choice C is correct. It’s given that the function f is defined by f(x) = 2√x + 5. Substituting 49 for x in this '
    'equation yields f(49) = 2√49 + 5. Since √49 = 7, this equation is equivalent to f(49) = 2(7) + 5, or '
    'f(49) = 14 + 5, which is equivalent to f(49) = 19. Therefore, the value of f(49) is 19. Choice A is incorrect '
    'and may result from omitting the coefficient 2, which yields √49 + 5, or 12, not 2√49 + 5. Choice B is '
    'incorrect. This is the value of f(36), not the value of f(49). Choice D is incorrect and may result from '
    'evaluating 2x + 5, rather than 2√x + 5, at x = 49.')

# Q5, Q6 — easy-SPR rationales run above the shipped easy-SPR band
d[5]['explanation'] = (
    'The correct answer is 25. Substituting 28 for x in the given equation yields f(28) = (3(28) + 16)/4, or '
    'f(28) = 100/4, which is equivalent to f(28) = 25. Therefore, the value of f(28) is 25.')
d[6]['explanation'] = (
    'The correct answer is 35. The area A of a square is related to the side length s of the square by the equation '
    'A = s². Substituting 1,225 for A in this equation yields 1,225 = s². Since a side length is positive, taking the '
    'positive square root of both sides of this equation yields s = 35. Therefore, the side length, in centimeters, '
    'of the square is 35.')
save('final_3_1.json', items)

# ===========================================================================
# M3 Q9-Q15
# ===========================================================================
items = load('final_3_9.json')
d = by_q(items)

# Q9 — the t-vs-12t option grid is PT4 M4 Q11's; vary the RATE instead (census line 134)
q = d[9]
q['text'] = ('Which equation gives the estimated number of audiobook checkouts at the lending library, C(m), '
             'm months after that month?')
q['options'] = ['C(m) = 1,250(0.97)ᵐ', 'C(m) = 1,250(1.003)ᵐ', 'C(m) = 1,250(1.03)ᵐ', 'C(m) = 1,250(1.3)ᵐ']
q['correctAnswer'] = 2
q['trap'] = 'percent-multiplier semantics: each distractor is the growth factor for a different percent'
q['distractorLogic'] = ('A: represents a 3% decrease each month rather than a 3% increase; B: represents 1 + 0.003, '
                        'treating 3% as 0.003; D: represents 1 + 0.3, treating 3% as 0.3.')
q['explanation'] = (
    'Choice C is correct. It’s given that the number of audiobook checkouts at a lending library was 1,250 during a '
    'certain month and that this number is estimated to increase by 3% each month thereafter. Since 3% is equivalent '
    'to 0.03, an increase of 3% each month corresponds to multiplying by 1 + 0.03, or 1.03, each month. It follows '
    'that after m months, the estimated number of checkouts is 1,250 multiplied by 1.03 m times, or 1,250(1.03)ᵐ. '
    'Therefore, the equation C(m) = 1,250(1.03)ᵐ gives the estimated number of audiobook checkouts m months after '
    'that month. Choice A is incorrect. This equation represents a situation where the estimated number of checkouts '
    'decreases by 3% each month, not increases by 3% each month. Choice B is incorrect and may result from '
    'representing 3% as 0.003, rather than as 0.03. Choice D is incorrect and may result from representing 3% as '
    '0.3, rather than as 0.03.')

# Q10 — part/whole textbook jargon in two dismissals
q = d[10]
q['explanation'] = q['explanation'].replace(
    'Choice B is incorrect. This is the given part, 40, not the percentage of 160 that 40 represents.',
    'Choice B is incorrect. This is the value 40 given in the question, not the percentage of 160 that 40 represents.'
).replace(
    'Choice C is incorrect. This is the percentage of 160 that is not 40, not the percentage of 160 that 40 is.',
    'Choice C is incorrect. This is the percentage of 160 that 120 represents, not the percentage of 160 that 40 '
    'represents.')

# Q13 — the form carries no post-question parenthetical clarifier; this SPR is the natural host
q = d[13]
q['text'] = 'What is the solution to the given equation? (Express your answer as a decimal or fraction.)'
save('final_3_9.json', items)

# ===========================================================================
# M3 Q16-Q22
# ===========================================================================
items = load('final_3_16.json')
d = by_q(items)

# Q17 — "subtracting 3 to both sides" does not distribute
q = d[17]
q['explanation'] = q['explanation'].replace(
    'may result from adding, rather than subtracting, 3 to both sides of the equation x + 3 = 7',
    'may result from adding 3 to, rather than subtracting 3 from, both sides of the equation x + 3 = 7')

# Q18 — the derivation never reaches "Therefore,"
q = d[18]
q['explanation'] = d[18]['explanation'].replace(
    'It follows that the equation that defines circle Q is (x + 5)² + (y − 12)² = 16², or '
    '(x + 5)² + (y − 12)² = 256.',
    'Squaring 16 yields 256. Therefore, the equation that defines circle Q is (x + 5)² + (y − 12)² = 256.')

# Q20 — three of the form's applied items were water contexts; move this one off water
q = d[20]
q['passage'] = ('<p>The volume of propane in a tank at a heating plant decreased at a constant rate during a cold '
                'spell. The volume was 72 gallons 4 weeks after the start of the cold spell and 60 gallons 8 weeks '
                'after the start of the cold spell.</p>')
q['text'] = 'How many weeks after the start of the cold spell was the volume of propane 45 gallons?'
q['explanation'] = (
    'Choice C is correct. It’s given that the volume of propane in the tank decreased at a constant rate and that the '
    'volume was 72 gallons 4 weeks after the start of the cold spell and 60 gallons 8 weeks after the start of the '
    'cold spell. Subtracting 60 from 72 yields a decrease of 12 gallons over these 4 weeks. Dividing 12 by 4 yields a '
    'constant rate of decrease of 3 gallons per week. Since the volume was 72 gallons 4 weeks after the start of the '
    'cold spell, the volume at the start of the cold spell was 72 + 4(3), or 84, gallons. It follows that the volume '
    'of propane, in gallons, w weeks after the start of the cold spell is 84 − 3w. Substituting 45 for the volume '
    'yields 84 − 3w = 45. Subtracting 84 from both sides of this equation yields −3w = −39. Dividing both sides of '
    'this equation by −3 yields w = 13. Therefore, the volume of propane was 45 gallons 13 weeks after the start of '
    'the cold spell. Choice A is incorrect. This is the number of gallons by which the volume decreased each week, '
    'not a number of weeks. Choice B is incorrect. This is the number of weeks after the volume was 72 gallons, not '
    'the number of weeks after the start of the cold spell. Choice D is incorrect and may result from adding the '
    '4-week offset to the number of weeks after the start of the cold spell a second time.')

# Q21 — PT4 M4 Q17 runs the bare "ax^2 + bx + k = 0" surface; make the student produce a, b, c first
q = d[21]
q['passage'] = '<div style="text-align:center; margin:8px 0;">x(3x + k) = −4</div>'
q['explanation'] = (
    'Choice A is correct. Applying the distributive property to the left-hand side of the given equation yields '
    '3x² + kx = −4. Adding 4 to both sides of this equation yields 3x² + kx + 4 = 0. A quadratic equation of the form '
    'ax² + bx + c = 0, where a, b, and c are constants and the value of a isn’t 0, has two distinct real solutions if '
    'and only if the value of its discriminant, b² − 4ac, is positive. For this equation, a = 3, b = k, and c = 4. '
    'Substituting 3 for a, k for b, and 4 for c in b² − 4ac yields k² − 4(3)(4), or k² − 48. It follows that the '
    'given equation has two distinct real solutions if and only if k² − 48 > 0, or k² > 48. It’s given that k is a '
    'negative integer constant. If k = −7, then k² = 49, which is greater than 48. If k is a negative integer greater '
    'than −7, the greatest possible value of k² is (−6)², or 36, which isn’t greater than 48. Therefore, the greatest '
    'possible value of k is −7. Choice B is incorrect. If k = −6, then k² − 4ac = 36 − 48, or −12, so the given '
    'equation has no real solutions. Choice C is incorrect and may result from using k² − ac, rather than k² − 4ac, '
    'as the discriminant. Choice D is incorrect and may result from concluding that the given equation has two '
    'distinct real solutions when the value of its discriminant is negative, rather than positive.')

# Q22 — bare elimination is PT5 M4 Q12's medium mechanic; make the target composite (census line 89)
q = d[22]
q['text'] = 'The solution to the given system of equations is (x, y). What is the value of 2x + y?'
q['correctAnswer'] = '5/2'
q['explanation'] = (
    'The correct answer is 5/2. It’s given that the solution to the system of equations is (x, y), so the values of x '
    'and y satisfy both equations of the system. Adding the left-hand side of the second equation to the left-hand '
    'side of the first equation and the right-hand side of the second equation to the right-hand side of the first '
    'equation yields (4x + 10y) + (−4x + 6y) = 19 + 9, or 16y = 28. Dividing both sides of this equation by 16 yields '
    'y = 7/4. Substituting 7/4 for y in the equation 4x + 10y = 19 yields 4x + 10(7/4) = 19, or 4x + 35/2 = 19. '
    'Subtracting 35/2 from both sides of this equation yields 4x = 3/2, and dividing both sides by 4 yields x = 3/8. '
    'Substituting 3/8 for x and 7/4 for y in the expression 2x + y yields 2(3/8) + 7/4, or 3/4 + 7/4, which is '
    'equivalent to 5/2. Therefore, the value of 2x + y is 5/2. Note that 5/2 and 2.5 are examples of ways to enter a '
    'correct answer.')
save('final_3_16.json', items)

# ===========================================================================
# M4 Q1-Q8
# ===========================================================================
items = load('final_4_1.json')
d = by_q(items)

# Q2 — "x¹⁸÷⁶" mixes a baseline division sign with superscripts and renders garbled
q = d[2]
q['explanation'] = q['explanation'].replace(
    'Choice A is incorrect. This expression is equivalent to the quotient of the exponents, x¹⁸÷⁶, not to the '
    'quotient of the given powers.',
    'Choice A is incorrect and may result from dividing, rather than subtracting, the exponents 18 and 6.')

# Q5, Q6 — easy-SPR rationale band; Q6 also never reaches "Therefore,"
d[5]['explanation'] = (
    'The correct answer is 20. Multiplying both sides of the given equation by 4 yields 3x + 60 = 8x − 40. '
    'Subtracting 3x from both sides of this equation and adding 40 to both sides yields 100 = 5x. Dividing both sides '
    'of this equation by 5 yields x = 20. Therefore, the solution to the given equation is 20.')
d[6]['explanation'] = (
    'The correct answer is 13. The given equation is equivalent to the two equations x + 9 = 22 and x + 9 = −22. '
    'Subtracting 9 from both sides of these equations yields x = 13 and x = −31. Since −31 isn’t positive, −31 isn’t '
    'the positive solution. Therefore, the positive solution to the given equation is 13.')

# Q7 — three items shared an inspection frame; drop it here, and restate the premise in full
q = d[7]
q['text'] = ('A shipment contains x cartons of grade A and y cartons of grade B. For a quality check, 15% of the '
             'grade A cartons and 40% of the grade B cartons are weighed, and at least 90 cartons are weighed. '
             'Which inequality represents this situation?')
q['options'] = ['0.15x + 0.4y ≤ 90', '0.15x + 0.4y ≥ 90', '15x + 40y ≤ 90', '15x + 40y ≥ 90']
q['correctAnswer'] = 1
q['explanation'] = (
    'Choice B is correct. It’s given that a shipment contains x cartons of grade A and that 15% of the grade A '
    'cartons are weighed, so the number of grade A cartons weighed is 0.15x. It’s also given that the shipment '
    'contains y cartons of grade B and that 40% of the grade B cartons are weighed, so the number of grade B cartons '
    'weighed is 0.4y. It follows that the total number of cartons weighed is 0.15x + 0.4y. Since at least 90 cartons '
    'are weighed, this total is greater than or equal to 90. Therefore, the inequality 0.15x + 0.4y ≥ 90 represents '
    'this situation. Choice A is incorrect. This inequality represents a situation where at most 90 cartons are '
    'weighed, not at least 90. Choice C is incorrect and may result from not converting the percentages to decimals '
    'and from reversing the direction of the inequality. Choice D is incorrect and may result from not converting '
    'the percentages to decimals.')
save('final_4_1.json', items)

# ===========================================================================
# M4 Q9-Q15
# ===========================================================================
items = load('final_4_9.json')
d = by_q(items)

# Q9 — the attested cube ladder is face perimeter / face area / surface area
q = d[9]
q['options'] = ['36', '81', '486', '729']
q['correctAnswer'] = 3
q['distractorLogic'] = ('A: reports the perimeter of one face, 4(9); B: reports the area of one face, 9²; '
                        'C: reports the surface area, 6(9²).')
q['explanation'] = q['explanation'].replace(
    'Choice A is incorrect. This is the area, in square inches, of one face of the cube, not the volume, in cubic '
    'inches, of the cube. Choice B is incorrect. This is the sum of the lengths, in inches, of the edges of the cube, '
    'not the volume, in cubic inches, of the cube.',
    'Choice A is incorrect. This is the perimeter, in inches, of one face of the cube, not the volume, in cubic '
    'inches, of the cube. Choice B is incorrect. This is the area, in square inches, of one face of the cube, not '
    'the volume, in cubic inches, of the cube.')

# Q11 — PT5 M4 Q11 already ships "labelled right triangle -> which ratio"; make it ratio-after-Pythagoras
q = d[11]
q['text'] = 'What is the value of tan L?'
q['graphDescription'] = ('A right triangle has vertices labeled L at the top, M at the lower left, and N at the '
                         'lower right, with a right angle marked at M. The length of side LM is labeled 9 and the '
                         'length of side LN is labeled 41.')
q['options'] = ['9/41', '9/40', '40/41', '40/9']
q['correctAnswer'] = 3
q['distractorLogic'] = ('A: reports the ratio of the leg adjacent to angle L to the hypotenuse, which is cos L; '
                        'B: reports the reciprocal of the asked ratio, which is tan N; C: reports the ratio of the '
                        'leg opposite angle L to the hypotenuse, which is sin L.')
q['explanation'] = (
    'Choice D is correct. In a right triangle, the tangent of an acute angle is the ratio of the length of the leg '
    'opposite that angle to the length of the leg adjacent to that angle. It’s shown that in right triangle LMN, the '
    'right angle is at vertex M, the length of leg LM is 9, and the length of hypotenuse LN is 41. By the Pythagorean '
    'theorem, the length of leg MN satisfies 9² + (MN)² = 41², or (MN)² = 1,681 − 81, which yields MN = 40. The leg '
    'opposite angle L is MN, which has length 40, and the leg adjacent to angle L is LM, which has length 9. '
    'Therefore, the value of tan L is 40/9. Choice A is incorrect. This is the ratio of the length of the leg '
    'adjacent to angle L to the length of the hypotenuse, which is the value of cos L, not tan L. Choice B is '
    'incorrect. This is the reciprocal of the value of tan L. Choice C is incorrect. This is the ratio of the length '
    'of the leg opposite angle L to the length of the hypotenuse, which is the value of sin L, not tan L.')

# Q12 — reverse percent is PT5 M3 Q11's archetype; use percent-parts-with-a-leftover-count instead
q = d[12]
q['passage'] = ('<p>At a certain factory, 62% of the ceramic tiles in a batch were sorted into grade A and 30% of '
                'the tiles in the batch were sorted into grade B. The remaining 34 tiles in the batch were sorted '
                'into grade C.</p>')
q['text'] = 'How many tiles were in the batch?'
q['trap'] = 'percent-multiplier semantics: the leftover percent must be recovered before the total can be found'
q['explanation'] = (
    'The correct answer is 425. It’s given that 62% of the tiles in the batch were sorted into grade A and 30% of the '
    'tiles in the batch were sorted into grade B. Since the percentages of the tiles in the three grades have a sum '
    'of 100%, the percentage of the tiles sorted into grade C is 100% − 62% − 30%, or 8%. It’s given that 34 tiles '
    'were sorted into grade C, so 8% of the number of tiles in the batch is equal to 34. Since 8% is equivalent to '
    '0.08, it follows that 0.08 times the number of tiles in the batch is equal to 34. Dividing 34 by 0.08 yields '
    '34/0.08, or 425. Therefore, there were 425 tiles in the batch.')

# Q15 — the interpretation menu was a monotone length ladder with the key longest
q = d[15]
q['options'] = [
    'About 68% of all residents of the state in which the recreation area is located have visited the recreation '
    'area at least once before.',
    'About 68% of all visitors arriving at trailheads in the state in which the recreation area is located have '
    'visited the recreation area at least once before.',
    'About 68% of all visitors arriving at the four trailheads of the recreation area have visited the recreation '
    'area at least once before.',
    'About 68% of all visitors arriving at the north trailhead of the recreation area have visited the recreation '
    'area at least once before.']
q['explanation'] = q['explanation'].replace(
    'not from all visitors arriving at trailheads in the state.',
    'not from all visitors arriving at trailheads in the state in which the recreation area is located.')
save('final_4_9.json', items)

# ===========================================================================
# M4 Q16-Q22
# ===========================================================================
items = load('final_4_16.json')
d = by_q(items)

# Q16 — Advanced Math carried only one applied item; dress this table in a context
q = d[16]
head, table = q['passage'].split('<table', 1)
q['passage'] = ('<p>The function f gives the estimated number of shipping containers, in hundreds, handled by a '
                'certain port x years after 2015, where f(x) = a(b)<sup>x</sup> and a and b are constants. The table '
                'gives four values of x and the corresponding values of f(x).</p><table' + table)
q['explanation'] = q['explanation'].replace(
    'Therefore, the value of f(5) is 3,072.',
    'Therefore, the value of f(5) is 3,072.')

# Q18 — the blueprint's own invariant is ascending numeric options
q = d[18]
q['options'] = ['14π', '60π', '84π', '144π']
q['correctAnswer'] = 2
q['distractorLogic'] = ('A: reports the length of the larger arc rather than the area of the larger sector; '
                        'B: reports the area of the smaller sector; D: reports the area of the entire circle.')
q['explanation'] = (
    'Choice C is correct. The area A of a circle with radius r is given by the formula A = πr². It’s given that the '
    'circle has a radius of 12 inches, so substituting 12 for r in this formula yields A = π(12)², or 144π. In a '
    'circle, the ratio of the measure of a central angle to 360° is equal to the ratio of the area of the sector '
    'determined by that angle to the area of the circle. It’s given that the smaller sector has a central angle of '
    'measure 150°, so the larger sector has a central angle of measure 360° − 150°, or 210°. Multiplying 144π by '
    '210/360 yields 84π. Therefore, the area, in square inches, of the larger of these two sectors is 84π. Choice A '
    'is incorrect. This is the length, in inches, of the larger arc, not the area, in square inches, of the larger '
    'sector. Choice B is incorrect. This is the area, in square inches, of the smaller sector, not of the larger '
    'sector. Choice D is incorrect. This is the area, in square inches, of the entire circle, not of the larger '
    'sector.')
q['text'] = 'What is the area, in square inches, of the larger of these two sectors?'

# Q19 — both modules put a parabola-minimum hard SPR at Q19; hook this one on the y-intercept
q = d[19]
q['text'] = ('The function f is defined by the given equation, where k is a constant. The y-intercept of the graph '
             'of y = f(x) in the xy-plane is (0, 40). What is the value of k?')
q['explanation'] = (
    'The correct answer is −4. It’s given that f(x) = (x − 10)(x + k). The y-intercept of the graph of y = f(x) in '
    'the xy-plane is the point on the graph with x-coordinate 0. Substituting 0 for x in the given equation yields '
    'f(0) = (0 − 10)(0 + k), or f(0) = −10k. It’s given that the y-intercept of the graph is (0, 40), so f(0) = 40. '
    'It follows that −10k = 40. Dividing both sides of this equation by −10 yields k = −4. Therefore, the value of k '
    'is −4.')

# Q20 — "subtracting ... to" does not distribute; and the appositive drops the unit interpolation
q = d[20]
q['explanation'] = q['explanation'].replace(
    'may result from adding, rather than subtracting, the product of 3 and 4 to the length 26 centimeters.',
    'may result from adding, rather than subtracting, the product of 3 and 4 when finding the value of b, which '
    'yields 26 + 12, or 38.')

# Q22 — family echo of PT5 M4 Q22; rename the constants and change the reported combination
q = d[22]
q['passage'] = ('<div style="text-align:center; margin:8px 0;">c/(x − 1) + d/(x + 3) = '
                '(13x + 7)/((x − 1)(x + 3))</div><p>The given equation is true for all x > 1, where c and d are '
                'constants.</p>')
q['text'] = 'What is the value of c/(c + d)?'
q['correctAnswer'] = '5/13'
q['explanation'] = (
    'The correct answer is 5/13. It’s given that the equation is true for all x > 1. Multiplying both sides of the '
    'given equation by (x − 1)(x + 3) yields c(x + 3) + d(x − 1) = 13x + 7. Applying the distributive property to '
    'the left-hand side of this equation yields cx + 3c + dx − d = 13x + 7, or (c + d)x + (3c − d) = 13x + 7. For '
    'this equation to be true for all x > 1, the coefficients of x must be equal and the constant terms must be '
    'equal. It follows that c + d = 13 and 3c − d = 7. Adding these two equations yields 4c = 20, or c = 5. '
    'Therefore, the value of c/(c + d) is 5/13. Note that 5/13, .3846, and 0.384 are examples of ways to enter a '
    'correct answer.')
save('final_4_16.json', items)

print('final-critique edits applied')
