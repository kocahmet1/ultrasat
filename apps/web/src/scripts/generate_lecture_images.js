/**
 * Bulk Image Generation Script for SAT Lecture Pages
 * Uses the Gemini API directly via @google/genai to bypass tool quotas.
 * 
 * Run with: node src/scripts/generate_lecture_images.js
 * 
 * Requires GEMINI_API_KEY in the root .env file.
 */

const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../../.env') });

const OUTPUT_DIR = path.resolve(__dirname, '../../public/assets/images');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// All remaining images to generate
const IMAGE_QUEUE = [
  // === BATCH 3 REMAINING ===
  {
    filename: 'boundaries_framework.png',
    prompt: 'Educational SAT prep diagram. Dark navy background (#0d1117). Title at top in bold white: "THE IDENTIFY THE SEAM FRAMEWORK". 3-step vertical flowchart. Step 1 (teal circle "1"): "LOCATE THE SEAM" — "The spot where the punctuation options vary in your answer choices is the seam. Look at the word before and after it." Step 2 (blue circle "2"): "TEST LEFT AND RIGHT" — "Cover the seam. Look left: Is everything before the seam a complete sentence (IC)? Look right: Is everything after the seam a complete sentence (IC)?" Step 3 (purple circle "3"): "APPLY THE RULE" — "If IC on BOTH sides: use Period, Semicolon, or Comma+FANBOYS. If one side is a phrase or DC: use a simple Comma." Clean professional dark infographic. All text legible.'
  },
  {
    filename: 'boundaries_traps.png',
    prompt: 'Educational SAT prep diagram. Dark navy background (#0d1117). Title at top in bold white: "BOUNDARY TRAP ENGINEERING". Three trap cards horizontally. Card 1 (red left border): "TRAP 1: COLON SETUP" — Body: "A colon acts as an equals sign. The text BEFORE the colon MUST be a complete sentence. Trap answers put colons after verbs like The results showed: which is illegal." Card 2 (orange left border): "TRAP 2: MISSING BRACKET" — Body: "Non-essential phrases must have matching punctuation on BOTH sides. If it opens with a dash, it must close with a dash." Card 3 (rose left border): "TRAP 3: SUBJECT-VERB SPLIT" — Body: "Never put a single comma between a subject and its verb. The SAT inserts commas between subjects and verbs to trick your ear." Professional dark infographic. Bold headers. All text legible.'
  },
  {
    filename: 'form_structure_sense_concept.png',
    prompt: 'Educational SAT prep diagram. Dark navy background (#0d1117). Title at top in bold white: "FORM, STRUCTURE, AND SENSE: The Gears of the Sentence". Center: Three interlocking mechanical gears. Gear 1 (teal) labeled "SUBJECT" with example "The cluster". Gear 2 (blue) labeled "VERB" with example "was discovered". Gear 3 (purple) labeled "PRONOUN" with example "it (singular)". Below: "A singular subject gear requires a singular verb gear to turn correctly. Mismatched gears jam the sentence." Professional infographic style. High contrast. All text legible.'
  },
  {
    filename: 'form_structure_sense_framework.png',
    prompt: 'Educational SAT prep diagram. Dark navy background (#0d1117). Title at top in bold white: "SUBJECT ISOLATION FRAMEWORK". 3-step vertical flowchart. Step 1 (teal circle "1"): "SPOT THE SEAM" — "Look at the answer choices. If the options are is/are/were/has been, the question is testing Subject-Verb agreement." Step 2 (blue circle "2"): "SLASH THE PREPOSITIONS" — "Cross out all prepositional phrases (of the students, in the lab, with algorithms). The subject is almost NEVER inside a preposition." Step 3 (purple circle "3"): "MATCH THE NAKED NOUN" — "A cluster [of stars] was/were discovered. Stars is crossed out. The subject is singular cluster. Answer: was." Clean professional dark infographic. All text legible.'
  },
  {
    filename: 'form_structure_sense_traps.png',
    prompt: 'Educational SAT prep diagram. Dark navy background (#0d1117). Title at top in bold white: "FORM AND STRUCTURE TRAP ANATOMY". Three trap cards horizontally. Card 1 (red left border): "TRAP 1: DANGLING MODIFIER" — Body: "Exhausted from the hike, the backpack was dropped. Backpacks do not get exhausted. The person must come immediately after the comma." Card 2 (orange left border): "TRAP 2: PLURAL DECOY" — Body: "The list of requirements ARE demanding sounds correct, but list is singular. The true answer is IS demanding." Card 3 (rose left border): "TRAP 3: THEY vs IT" — Body: "Collective nouns like company, team, government are SINGULAR. The government passed THEIR law is wrong. It must be ITS law." Professional dark infographic. Bold headers. All text legible.'
  },

  // === BATCH 4: ALGEBRA ===
  {
    filename: 'linear-equations-one-variable_concept.png',
    prompt: 'Educational SAT math diagram. Dark navy background (#0d1117). Title in bold white: "LINEAR EQUATIONS: The Language of Balance". Center: A balanced scale/fulcrum. Left side shows "3x + 5" and right side shows "14". An equals sign sits on the fulcrum point. Below the scale, three outcome boxes: Box 1 (teal): "ONE SOLUTION: Different x coefficients. Lines cross once." Box 2 (blue): "NO SOLUTION: Same x coefficients, different constants. Parallel lines." Box 3 (purple): "INFINITE: Both sides identical. Same line." Clean professional math infographic. All text legible.'
  },
  {
    filename: 'linear-equations-one-variable_framework.png',
    prompt: 'Educational SAT math diagram. Dark navy background (#0d1117). Title in bold white: "THE DECONSTRUCTION APPROACH". 3-step vertical flowchart. Step 1 (teal): "CLEAR THE NOISE" — "Multiply the entire equation by the LCM to eliminate fractions. x/3 + x/4 = 7 becomes 4x + 3x = 84." Step 2 (blue): "DISTRIBUTE" — "Expand parentheses completely. Watch the deadly negative sign: -(x-4) = -x+4, NOT -x-4." Step 3 (purple): "GROUP AND ISOLATE" — "Move all variable terms to one side and constants to the other. Solve for x." Clean professional dark infographic. All text legible.'
  },
  {
    filename: 'linear-equations-one-variable_traps.png',
    prompt: 'Educational SAT math diagram. Dark navy background (#0d1117). Title in bold white: "LINEAR EQUATION TRAP MECHANICS". Three trap cards horizontally. Card 1 (red left border): "TRAP 1: SIGN DISTRIBUTION" — "-(x - 4) is NOT -x - 4. It is -x + 4. The SAT always includes the wrong sign answer." Card 2 (orange left border): "TRAP 2: WRONG TARGET" — "You solve for x = 3. You pick 3. But the question asked for 2x + 1. The answer was 7." Card 3 (rose left border): "TRAP 3: THE FRACTION FEAR" — "Assuming a fraction or decimal answer must be wrong. The SAT frequently has non-integer solutions." Professional dark infographic. All text legible.'
  },
  {
    filename: 'linear-functions_concept.png',
    prompt: 'Educational SAT math diagram. Dark navy background (#0d1117). Title in bold white: "ANATOMY OF y = mx + b". Center: A coordinate plane with a line drawn on it. The slope (m) is highlighted in teal with label "RATE: the per unit change (e.g., $50 per hour)". The y-intercept (b) is highlighted in blue with label "STARTING VALUE: the initial state at time zero (e.g., $100 flat fee)". The resulting equation "Cost = 50(hours) + 100" shown below. Professional math infographic. High contrast. All text legible.'
  },
  {
    filename: 'linear-functions_framework.png',
    prompt: 'Educational SAT math diagram. Dark navy background (#0d1117). Title in bold white: "GRAPH TO EQUATION PIPELINE". 3-step flowchart. Step 1 (teal): "FIND TWO CLEAN POINTS" — "Pick two points where the line cleanly intersects grid lines. Example: (0, 3) and (2, 9)." Step 2 (blue): "CALCULATE SLOPE" — "m = (y2-y1)/(x2-x1) = (9-3)/(2-0) = 3. Rise over run." Step 3 (purple): "IDENTIFY INTERCEPT" — "Where does the line cross the y-axis (x=0)? That is b. Here, b = 3. Final: y = 3x + 3." Clean professional dark infographic. All text legible.'
  },
  {
    filename: 'linear-functions_traps.png',
    prompt: 'Educational SAT math diagram. Dark navy background (#0d1117). Title in bold white: "LINEAR FUNCTION TRAPS". Three trap cards horizontally. Card 1 (red left border): "TRAP 1: SCALE MANIPULATION" — "Y-axis counts by 10s, X-axis by 2s. Up 1 box, right 1 box is NOT slope 1. True slope = 10/2 = 5. Read axis labels!" Card 2 (orange left border): "TRAP 2: X vs Y INTERCEPT" — "Question asks for initial value (y-intercept at x=0). Trap answer provides the x-intercept (where y=0)." Card 3 (rose left border): "TRAP 3: RISE/RUN SWAP" — "Calculating change in x over change in y instead of the correct rise over run." Professional dark infographic. All text legible.'
  },
  {
    filename: 'linear-equations-two-variables_concept.png',
    prompt: 'Educational SAT math diagram. Dark navy background (#0d1117). Title in bold white: "STANDARD FORM: Ax + By = C". Center: Two boxes side by side. Left box (teal border): "STANDARD FORM: 3x + 4y = 12. Best for finding intercepts using the Cover-Up Method." Right box (blue border): "SLOPE-INTERCEPT: y = -3/4 x + 3. Best for plotting the line directly." An arrow connects them labeled "Toggle freely between forms." Below: "Slope from Standard Form = -A/B" in purple. Professional math infographic. High contrast. All text legible.'
  },
  {
    filename: 'linear-equations-two-variables_framework.png',
    prompt: 'Educational SAT math diagram. Dark navy background (#0d1117). Title in bold white: "PARALLEL AND PERPENDICULAR RULES". Two sections. Left section (teal): "PARALLEL LINES: Identical slopes. y=2x+4 and y=2x-10. Same m, different b. They never intersect." Right section (blue): "PERPENDICULAR LINES: Negative reciprocal slopes. If slope 1 = 3/4, perpendicular slope = -4/3. They intersect at 90 degrees." Below: "The Cover-Up Method: In 3x+4y=12, cover y: x=4. Cover x: y=3. Plot (4,0) and (0,3). Done in 5 seconds." Professional dark infographic. All text legible.'
  },
  {
    filename: 'linear-equations-two-variables_traps.png',
    prompt: 'Educational SAT math diagram. Dark navy background (#0d1117). Title in bold white: "2-VARIABLE EQUATION TRAPS". Three trap cards horizontally. Card 1 (red left border): "TRAP 1: COEFFICIENT SWAP" — "Tents hold 3, cabins hold 5. Trap: 5t+3c. Correct: 3t+5c. Pair the rate with its variable." Card 2 (orange left border): "TRAP 2: SLOPE ILLUSION" — "In 2x+3y=12, the slope is NOT 2. Standard form slope = -A/B = -2/3." Card 3 (rose left border): "TRAP 3: SIGN FLIP" — "Perpendicular slope of 2 is -1/2, not 1/2. Do not forget to flip the sign AND take the reciprocal." Professional dark infographic. All text legible.'
  },
  {
    filename: 'systems-linear-equations_concept.png',
    prompt: 'Educational SAT math diagram. Dark navy background (#0d1117). Title in bold white: "SYSTEMS: Finding the Collision Point". Center: A coordinate plane showing three possible scenarios. Scenario 1 (teal): Two lines crossing at one point, labeled "ONE SOLUTION: Lines intersect." Scenario 2 (blue): Two parallel lines, labeled "NO SOLUTION: Lines are parallel." Scenario 3 (purple): Two lines overlapping perfectly, labeled "INFINITE SOLUTIONS: Lines are identical." Below: "The algebraic solution IS the geometric intersection." Professional math infographic. All text legible.'
  },
  {
    filename: 'systems-linear-equations_framework.png',
    prompt: 'Educational SAT math diagram. Dark navy background (#0d1117). Title in bold white: "TRIAGE: SUBSTITUTION vs ELIMINATION". Two decision paths. Path 1 (teal box): "SUBSTITUTION TRIGGER: One equation already has a variable isolated (x = 3y + 2). Plug the entire block into the other equation." Path 2 (blue box): "ELIMINATION TRIGGER: Both equations in Standard Form (Ax+By=C). Stack vertically. Multiply so a variable cancels when you add." Path 3 (purple box): "DESMOS BYPASS: Pure numbers, no constants like k? Type both equations into the calculator. Click the intersection. Done." Professional dark infographic. All text legible.'
  },
  {
    filename: 'systems-linear-equations_traps.png',
    prompt: 'Educational SAT math diagram. Dark navy background (#0d1117). Title in bold white: "SYSTEMS TRAP MECHANICS". Three trap cards. Card 1 (red left border): "TRAP 1: THE HALF-SOLUTION" — "You solve for x=5 and see 5 in option A. But the question asked for y (which is 12). Always circle the target variable." Card 2 (orange left border): "TRAP 2: SUBTRACTION ERROR" — "Subtracting equations causes sign errors. Instead, multiply the bottom equation by -1, then ADD." Card 3 (rose left border): "TRAP 3: RATIO CONFUSION" — "For no-solution problems: A1/A2 must equal B1/B2 but NOT equal C1/C2. All three equal means infinite solutions." Professional dark infographic. All text legible.'
  },
  {
    filename: 'linear-inequalities_concept.png',
    prompt: 'Educational SAT math diagram. Dark navy background (#0d1117). Title in bold white: "LINEAR INEQUALITIES: Managing the Zones". Center: A coordinate plane with a line. One side is shaded in teal labeled "SAFE ZONE: All solutions live here." The other side is dark labeled "FAIL ZONE." The line itself is shown as dashed with label "Dashed = boundary NOT included (< or >)" and solid with label "Solid = boundary IS included (less than or equal, greater than or equal)." Professional math infographic. All text legible.'
  },
  {
    filename: 'linear-inequalities_framework.png',
    prompt: 'Educational SAT math diagram. Dark navy background (#0d1117). Title in bold white: "INEQUALITY TRANSLATION TABLE". A clean translation table. Row 1: "At least / A minimum of" arrow to ">= (greater than or equal)". Row 2: "No more than / A maximum of" arrow to "<= (less than or equal)". Row 3: "Fewer than" arrow to "< (strictly less than)". Below: "THE FATAL FLIP: If you multiply or divide by a NEGATIVE number, the inequality sign MUST reverse direction. -2x > 10 becomes x < -5." All in teal/blue/purple highlights. Professional dark infographic. All text legible.'
  },
  {
    filename: 'linear-inequalities_traps.png',
    prompt: 'Educational SAT math diagram. Dark navy background (#0d1117). Title in bold white: "INEQUALITY TRAP ENGINEERING". Three trap cards. Card 1 (red left border): "TRAP 1: SHADING DIRECTION" — "Student sees > and shades up without isolating y first. If equation is in standard form, isolating y might flip the sign." Card 2 (orange left border): "TRAP 2: SYSTEM OVERLAP" — "A point works for inequality A but fails inequality B. The correct point must sit in the DOUBLE-shaded overlap region." Card 3 (rose left border): "TRAP 3: THE DASHED LINE" — "A point ON a dashed boundary line is NOT a valid solution. Dashed means strictly greater/less than." Professional dark infographic. All text legible.'
  },

  // === BATCH 4: ADVANCED MATH ===
  {
    filename: 'nonlinear-functions_concept.png',
    prompt: 'Educational SAT math diagram. Dark navy background (#0d1117). Title in bold white: "NONLINEAR FUNCTIONS: Growth Mechanisms". Three columns. Column 1 (teal): "LINEAR: y = 2x + 3. Constant ADDITION. Straight line." Column 2 (blue): "EXPONENTIAL: y = 2^x. Constant MULTIPLICATION. J-curve." Column 3 (purple): "QUADRATIC: y = x^2. Symmetric PARABOLA. Has a vertex." Below: "Identify the growth: constant difference = linear. Constant multiplier = exponential. Symmetric curve = quadratic." Professional math infographic. All text legible.'
  },
  {
    filename: 'nonlinear-functions_framework.png',
    prompt: 'Educational SAT math diagram. Dark navy background (#0d1117). Title in bold white: "THREE FORMS OF A QUADRATIC". Three boxes vertically. Box 1 (teal): "STANDARD FORM: y = ax^2 + bx + c. Reveals: the y-intercept (c)." Box 2 (blue): "FACTORED FORM: y = a(x-m)(x-n). Reveals: the x-intercepts/roots (m and n)." Box 3 (purple): "VERTEX FORM: y = a(x-h)^2 + k. Reveals: the minimum/maximum point (h, k)." Below: "Which form reveals the minimum value? = VERTEX FORM." Professional dark infographic. All text legible.'
  },
  {
    filename: 'nonlinear-functions_traps.png',
    prompt: 'Educational SAT math diagram. Dark navy background (#0d1117). Title in bold white: "NONLINEAR FUNCTION TRAPS". Three trap cards. Card 1 (red left border): "TRAP 1: BASE vs RATE" — "Drops by 20% each year. Trap uses 0.20 as base. Correct base = what REMAINS: 1 - 0.20 = 0.80." Card 2 (orange left border): "TRAP 2: INVERSE TIME" — "Doubles every 4 days. Trap exponent: 4d. Correct exponent: d/4. At d=4, exponent must equal 1." Card 3 (rose left border): "TRAP 3: 5% = 1.05" — "A 5% increase is multiplier 1.05, NOT 1.5. Confusing rate with multiplier is catastrophic." Professional dark infographic. All text legible.'
  },
  {
    filename: 'nonlinear-equations_concept.png',
    prompt: 'Educational SAT math diagram. Dark navy background (#0d1117). Title in bold white: "NONLINEAR EQUATIONS: The Quadratic Toolkit". Three tool boxes arranged horizontally. Tool 1 (teal): "FACTORING: Set equation = 0. Factor into (x-a)(x-b) = 0. Solutions: x=a and x=b." Tool 2 (blue): "DISCRIMINANT: b^2 - 4ac. Positive = 2 solutions. Zero = 1 solution. Negative = No real solutions." Tool 3 (purple): "QUADRATIC FORMULA: x = (-b +/- sqrt(b^2-4ac)) / 2a. Use when factoring fails." Below: "Choose wisely. The right tool saves minutes." Professional dark infographic. All text legible.'
  },
  {
    filename: 'nonlinear-equations_framework.png',
    prompt: 'Educational SAT math diagram. Dark navy background (#0d1117). Title in bold white: "EXTRANEOUS SOLUTIONS: The Verification Rule". A flowchart. Start: "Solve the radical/rational equation algebraically." Arrow to "Get solutions: x=1 and x=4." Arrow splits into two verification paths. Path 1: "Plug x=1 back into ORIGINAL equation. sqrt(1) = 1-2. 1 = -1. FALSE. EXTRANEOUS!" (red X). Path 2: "Plug x=4 back. sqrt(4) = 4-2. 2 = 2. TRUE. VALID!" (green check). Below: "Squaring both sides creates ghost solutions. Always verify." Professional dark infographic. All text legible.'
  },
  {
    filename: 'nonlinear-equations_traps.png',
    prompt: 'Educational SAT math diagram. Dark navy background (#0d1117). Title in bold white: "NONLINEAR EQUATION TRAPS". Three trap cards. Card 1 (red left border): "TRAP 1: THE EXTRANEOUS ROOT" — "Squaring both sides of a radical equation produces solutions that fail the original. Always plug answers back in." Card 2 (orange left border): "TRAP 2: DIVISION BY ZERO" — "In 1/(x-3), x can NEVER equal 3. The SAT offers x=3 as a trap answer after complex algebra." Card 3 (rose left border): "TRAP 3: BINOMIAL SQUARING" — "(x-2)^2 is NOT x^2-4. It MUST expand to x^2-4x+4. The missing middle term is the trap." Professional dark infographic. All text legible.'
  },
  {
    filename: 'equivalent-expressions_concept.png',
    prompt: 'Educational SAT math diagram. Dark navy background (#0d1117). Title in bold white: "EQUIVALENT EXPRESSIONS: The Laws of Exponents". A clean rules table. Row 1: "x^a * x^b = x^(a+b). Multiplication adds exponents." Row 2: "(x^a)^b = x^(ab). Power to a power multiplies exponents." Row 3: "x^(A/B) = B-th root of x^A. The bottom number is in the root." Row 4: "x^(-a) = 1/x^a. Negative exponent flips to denominator." Below: "Equivalence: no matter what x you plug in, both expressions yield the same number." Professional dark infographic. All text legible.'
  },
  {
    filename: 'equivalent-expressions_framework.png',
    prompt: 'Educational SAT math diagram. Dark navy background (#0d1117). Title in bold white: "THE ARBITRARY NUMBER BYPASS". A flowchart. Step 1 (teal): "Pick x = 2 (avoid 0 and 1)." Step 2 (blue): "Plug x=2 into the terrifying prompt expression. Result: 14." Step 3 (purple): "Plug x=2 into all 4 answer choices. Only ONE will equal 14. That is the equivalent expression." Below: "If algebra overwhelms you under pressure, numbers never lie." Professional dark infographic. All text legible.'
  },
  {
    filename: 'equivalent-expressions_traps.png',
    prompt: 'Educational SAT math diagram. Dark navy background (#0d1117). Title in bold white: "EXPRESSION MANIPULATION TRAPS". Three trap cards. Card 1 (red left border): "THE FRESHMAN DREAM" — "(x+y)^2 is NOT x^2+y^2. It MUST be x^2+2xy+y^2. The SAT always includes the wrong expansion." Card 2 (orange left border): "ILLEGAL CANCELING" — "In (3x+9)/3, you cannot just cancel the 3 from 3x. You must divide EVERY term: result is x+3." Card 3 (rose left border): "NEGATIVE EXPONENT" — "x^(-2) does NOT make x negative. It flips x to the denominator: 1/x^2." Professional dark infographic. All text legible.'
  },

  // === BATCH 5: DATA ANALYSIS ===
  {
    filename: 'ratios-rates-proportions_concept.png',
    prompt: 'Educational SAT math diagram. Dark navy background (#0d1117). Title in bold white: "RATIOS: The Math of Scaling". Center: A recipe card showing "Boys : Girls = 2 : 3". Below it, three labeled outputs. Output 1 (teal): "Part-to-Part: Boys(2) to Girls(3)." Output 2 (blue): "Total Parts: 2+3 = 5." Output 3 (purple): "Part-to-Whole: Boys = 2/5 of total. NOT 2/3!" Below: "If 30 total students, boys = 30 * 2/5 = 12. NOT 30 * 2/3 = 20." Professional math infographic. All text legible.'
  },
  {
    filename: 'ratios-rates-proportions_framework.png',
    prompt: 'Educational SAT math diagram. Dark navy background (#0d1117). Title in bold white: "UNIT MATCHING FRAMEWORK". Center: Two fraction setups side by side. Left (teal, green check): "CORRECT: 3 miles / 2 hours = x miles / 5 hours. Units match horizontally. Miles across from miles." Right (red, X mark): "FATAL: 3 miles / 2 hours = 5 hours / x miles. Units are crossed. Wrong answer guaranteed." Below: "If the units physically match horizontally, you cannot get the problem wrong." Professional dark infographic. All text legible.'
  },
  {
    filename: 'ratios-rates-proportions_traps.png',
    prompt: 'Educational SAT math diagram. Dark navy background (#0d1117). Title in bold white: "RATIO AND SCALE TRAPS". Three trap cards. Card 1 (red left border): "TRAP 1: DIMENSIONAL SCALE" — "Triangle B sides are 3x longer than A. Area ratio is NOT 1:3. Area is 2D, so ratio = 1:9 (3 squared)." Card 2 (orange left border): "TRAP 2: PART-TO-PART CONFUSION" — "Ratio boys:girls = 2:3. Fraction of boys is 2/5 of total, NOT 2/3." Card 3 (rose left border): "TRAP 3: VOLUME CUBED" — "Length scales by k. Area by k^2. Volume by k^3. If sides triple, volume increases 27x." Professional dark infographic. All text legible.'
  },
  {
    filename: 'percentages_concept.png',
    prompt: 'Educational SAT math diagram. Dark navy background (#0d1117). Title in bold white: "PERCENTAGES: The Multiplier System". Center: A translation table. Row 1: "INCREASE by 20% = Multiply by 1.20 (keep 100% + add 20%)." Row 2: "DECREASE by 20% = Multiply by 0.80 (keep 80%)." Row 3: "20% OF X = 0.20 * X." Below: "English to Math: Cross out IS, write =. Cross out OF, write *. 40 IS 20% OF X becomes 40 = 0.20 * X." Professional dark infographic. All text legible.'
  },
  {
    filename: 'percentages_framework.png',
    prompt: 'Educational SAT math diagram. Dark navy background (#0d1117). Title in bold white: "COMPOUND PERCENTAGE CHAIN". Center: A chain of multipliers. Starting value $100 arrow through "20% OFF (x0.80)" = $80 arrow through "10% TAX (x1.10)" = $88. Below: "Chain formula: 100 * 0.80 * 1.10 = $88. Net change = 12% decrease, NOT 10%." Warning box: "NEVER add sequential percentages. 20% off + 10% tax is NOT 10% net." Professional dark infographic. All text legible.'
  },
  {
    filename: 'percentages_traps.png',
    prompt: 'Educational SAT math diagram. Dark navy background (#0d1117). Title in bold white: "PERCENTAGE TRAP ENGINEERING". Three trap cards. Card 1 (red left border): "TRAP 1: ADDITIVE FALLACY" — "20% off + 10% off is NOT 30% off. It is 0.80 * 0.90 = 0.72 (28% off)." Card 2 (orange left border): "TRAP 2: REVERSE BASE" — "A $60 shirt includes 20% markup. Trap: 60-12=48. Correct: Original*1.20=60. Original=$50." Card 3 (rose left border): "TRAP 3: MORE THAN vs OF" — "50% more than X (multiplier 1.5) is NOT 50% of X (multiplier 0.5)." Professional dark infographic. All text legible.'
  },
  {
    filename: 'units-and-quantities_concept.png',
    prompt: 'Educational SAT math diagram. Dark navy background (#0d1117). Title in bold white: "DIMENSIONAL ANALYSIS: The Railroad Method". Center: A horizontal chain of fractions showing unit conversion. "60 miles/1 hour" times "5280 feet/1 mile" times "1 hour/60 min" times "1 min/60 sec". Words "miles" cancel between fractions (crossed out in red). Words "hour" and "min" cancel similarly. Final remaining units: "feet/sec". Below: "The words cancel like math. If the unit is on top AND bottom, cross it out." Professional dark infographic. All text legible.'
  },
  {
    filename: 'units-and-quantities_framework.png',
    prompt: 'Educational SAT math diagram. Dark navy background (#0d1117). Title in bold white: "FUNDAMENTAL UNIT FORMULAS". Two formula triangles side by side. Triangle 1 (teal): "D = R * T. Distance = Rate * Time. Cover what you want; see the operation." Triangle 2 (blue): "D = M / V. Density = Mass / Volume." Below in purple warning: "CRITICAL: Ensure time units match the rate units. 60 mph for 45 minutes? Convert 45 min to 0.75 hours first!" Professional dark infographic. All text legible.'
  },
  {
    filename: 'units-and-quantities_traps.png',
    prompt: 'Educational SAT math diagram. Dark navy background (#0d1117). Title in bold white: "UNIT CONVERSION TRAPS". Three trap cards. Card 1 (red left border): "TRAP 1: AREA CONVERSION" — "1 yard = 3 feet. But 1 SQUARE yard = 9 square feet (3^2). 1 CUBIC yard = 27 cubic feet (3^3)." Card 2 (orange left border): "TRAP 2: MISMATCHED D=RT" — "60 mph for 45 minutes? Bait: 60*45=2700. Correct: 60*0.75=45 miles." Card 3 (rose left border): "TRAP 3: INVERTED FRACTION" — "Guessing whether to multiply or divide. Use the Railroad Method: let the WORDS cancel." Professional dark infographic. All text legible.'
  },
  {
    filename: 'data-and-scatterplots_concept.png',
    prompt: 'Educational SAT math diagram. Dark navy background (#0d1117). Title in bold white: "SCATTERPLOTS: Model vs Reality". Center: A scatterplot with scattered dots and a line of best fit drawn through them. One dot is far above the line with a vertical dashed line to the line labeled "RESIDUAL: The gap between reality and prediction." The line is labeled "LINE OF BEST FIT: The prediction model." The dots are labeled "ACTUAL DATA POINTS: Reality." Below: "The dots are reality. The line is a prediction. Do not confuse the two." Professional dark infographic. All text legible.'
  },
  {
    filename: 'data-and-scatterplots_framework.png',
    prompt: 'Educational SAT math diagram. Dark navy background (#0d1117). Title in bold white: "SLOPE INTERPRETATION IN CONTEXT". Center: An equation y = 3.2x + 14 with labels. The 3.2 (teal) labeled: "SLOPE: For every 1 unit increase in X, the model PREDICTS a 3.2 unit increase in Y." The 14 (blue) labeled: "Y-INTERCEPT: The predicted value when X is exactly 0." Below: "Key word: PREDICTS. The line estimates, suggests, tends to. It never proves or guarantees." Professional dark infographic. All text legible.'
  },
  {
    filename: 'data-and-scatterplots_traps.png',
    prompt: 'Educational SAT math diagram. Dark navy background (#0d1117). Title in bold white: "SCATTERPLOT TRAPS". Three trap cards. Card 1 (red left border): "TRAP 1: CERTAINTY LANGUAGE" — "Answers using always, guarantees, proves are wrong. Correct words: predicts, estimates, tends to." Card 2 (orange left border): "TRAP 2: ACTUAL vs PREDICTED" — "Question asks for value at x=4 from the LINE. Student picks the DOT at x=4. Wrong. Read the LINE." Card 3 (rose left border): "TRAP 3: HIDDEN ORIGIN" — "X-axis starts at 10, not 0. You cannot visually read the y-intercept. Calculate backwards to x=0." Professional dark infographic. All text legible.'
  },
  {
    filename: 'two-way-tables-probability_concept.png',
    prompt: 'Educational SAT math diagram. Dark navy background (#0d1117). Title in bold white: "TWO-WAY TABLES: The Denominator Controls Everything". Center: A simple 2x2 table with rows Male/Female, columns Left/Right, and a Total row/column. Three probability examples below. Example 1 (teal): "GLOBAL: P(Left-Handed Male) = cell / GRAND TOTAL." Example 2 (blue): "CONDITIONAL: Given Male, P(Left-Handed) = cell / MALE ROW TOTAL." Example 3 (purple): "REVERSE: Given Left-Handed, P(Male) = cell / LEFT COLUMN TOTAL." Professional dark infographic. All text legible.'
  },
  {
    filename: 'two-way-tables-probability_framework.png',
    prompt: 'Educational SAT math diagram. Dark navy background (#0d1117). Title in bold white: "DENOMINATOR ISOLATION PROTOCOL". Center: A decision flowchart. Question: "Does the prompt say Given that, If, or Of those?" If YES (blue path): "Your denominator SHRINKS to that specific row or column total. Ignore everything else." If NO (teal path): "Your denominator is the GRAND TOTAL of the entire table." Below: "Setting the right denominator = 95% of solving the problem." Professional dark infographic. All text legible.'
  },
  {
    filename: 'two-way-tables-probability_traps.png',
    prompt: 'Educational SAT math diagram. Dark navy background (#0d1117). Title in bold white: "PROBABILITY TRAPS". Three trap cards. Card 1 (red left border): "TRAP 1: GRAND TOTAL TRAP" — "Of placebo patients, what fraction recovered? Student uses ALL recovered / GRAND TOTAL. Correct: recovered placebo / PLACEBO TOTAL." Card 2 (orange left border): "TRAP 2: MISSING CELL" — "Table has empty cells. Do not panic. Rows sum to Row Total. Columns sum to Column Total. Reconstruct like Sudoku." Card 3 (rose left border): "TRAP 3: A AND B vs A OR B" — "P(A and B) uses only the overlapping cell. P(A or B) adds both groups minus the overlap." Professional dark infographic. All text legible.'
  },
  {
    filename: 'statistics-mean-median-mode_concept.png',
    prompt: 'Educational SAT math diagram. Dark navy background (#0d1117). Title in bold white: "MEAN vs MEDIAN: Outlier Vulnerability". Center: A number line showing data points clustered around 5, with one extreme outlier at 100. Two arrows: Arrow 1 (teal) pointing right labeled "MEAN: Gets pulled toward the outlier. Sensitive to extreme values." Arrow 2 (blue) staying near the cluster labeled "MEDIAN: Stays anchored at the physical middle. Resistant to outliers." Below: "If Bill Gates walks into a room, the MEAN income skyrockets. The MEDIAN barely moves." Professional dark infographic. All text legible.'
  },
  {
    filename: 'statistics-mean-median-mode_framework.png',
    prompt: 'Educational SAT math diagram. Dark navy background (#0d1117). Title in bold white: "STANDARD DEVIATION: Spread Not Center". Two dot plots side by side. Left plot (teal): Points tightly clustered between 10-12. Label: "LOW Standard Deviation. Tight cluster." Right plot (blue): Points spread widely from 2-20. Label: "HIGH Standard Deviation. Wide spread." Below in purple: "Adding a constant to every data point: Mean CHANGES. Standard Deviation STAYS THE SAME (spread unchanged)." Professional dark infographic. All text legible.'
  },
  {
    filename: 'statistics-mean-median-mode_traps.png',
    prompt: 'Educational SAT math diagram. Dark navy background (#0d1117). Title in bold white: "STATISTICS TRAPS". Three trap cards. Card 1 (red left border): "TRAP 1: FREQUENCY BLINDNESS" — "Scores 70,80,90 with frequencies 1,5,2. Trap: (70+80+90)/3=80. Correct: (70*1+80*5+90*2)/8=81.25. Weight by frequency!" Card 2 (orange left border): "TRAP 2: SUM CONSTRUCTION" — "Average of 5 tests is 80. Total pool = 400. Find missing score by subtracting known scores from 400." Card 3 (rose left border): "TRAP 3: MEDIAN POSITION" — "For 51 items, median is the 26th value. Count up through the frequencies until you reach position 26." Professional dark infographic. All text legible.'
  },
  {
    filename: 'evaluating-statistical-claims_concept.png',
    prompt: 'Educational SAT math diagram. Dark navy background (#0d1117). Title in bold white: "CORRELATION vs CAUSATION". Center: A clear boundary line. Left side (teal): "OBSERVATIONAL STUDY: Researcher watches naturally. Can only conclude ASSOCIATION/CORRELATION. Green tea drinkers live longer (maybe they also exercise more)." Right side (blue): "CONTROLLED EXPERIMENT: Random assignment to Treatment and Control groups. CAN conclude CAUSATION. The treatment caused the effect." Below in purple: "No random assignment = No causation claim. Period." Professional dark infographic. All text legible.'
  },
  {
    filename: 'evaluating-statistical-claims_framework.png',
    prompt: 'Educational SAT math diagram. Dark navy background (#0d1117). Title in bold white: "MARGIN OF ERROR INTERPRETATION". Center: A number line showing a measured average of 45% with error bars extending to 42% and 48%. Labels: "42% = Lower bound" and "48% = Upper bound". The range is labeled "CONFIDENCE INTERVAL: The true population value is PLAUSIBLY somewhere in this range." Below: "Exact 45% = WRONG answer. Plausibly between 42-48% = CORRECT answer." Professional dark infographic. All text legible.'
  },
  {
    filename: 'evaluating-statistical-claims_traps.png',
    prompt: 'Educational SAT math diagram. Dark navy background (#0d1117). Title in bold white: "STATISTICAL CLAIMS TRAPS". Three trap cards. Card 1 (red left border): "TRAP 1: DEFINITE PROOF" — "Words like proves, must, certainly, always are red flags. Statistics uses suggests, likely, is plausible." Card 2 (orange left border): "TRAP 2: OVER-GENERALIZATION" — "50 dogs from one shelter prefer Brand X. Trap: All dogs prefer Brand X. Correct: Dogs in that shelter tend to prefer Brand X." Card 3 (rose left border): "TRAP 3: OBSERVATIONAL CAUSATION" — "Green tea drinkers live longer. Trap: Tea CAUSES long life. Correct: Tea is ASSOCIATED WITH longer life." Professional dark infographic. All text legible.'
  },

  // === BATCH 6: GEOMETRY ===
  {
    filename: 'area-volume_concept.png',
    prompt: 'Educational SAT math diagram. Dark navy background (#0d1117). Title in bold white: "AREA AND VOLUME: Reverse Engineering". Center: A cylinder with radius r and height h. The formula V = pi*r^2*h shown. An example: "V=45pi, h=5. Find diameter." Steps: "45pi = pi*r^2*5. Divide by 5pi: 9=r^2. r=3. Diameter=6." Below: "The Reference Sheet gives formulas. The SAT asks you to run them BACKWARDS." Professional math infographic. All text legible.'
  },
  {
    filename: 'area-volume_framework.png',
    prompt: 'Educational SAT math diagram. Dark navy background (#0d1117). Title in bold white: "THE SCALE FACTOR LAW". Three boxes vertically with scaling arrows. Box 1 (teal): "LENGTH (1D): Scales by k. Example: k=3, length triples." Arrow down. Box 2 (blue): "AREA (2D): Scales by k^2. Example: k=3, area = 9x." Arrow down. Box 3 (purple): "VOLUME (3D): Scales by k^3. Example: k=3, volume = 27x." Below: "Double the sides of a square: area QUADRUPLES, not doubles." Professional dark infographic. All text legible.'
  },
  {
    filename: 'area-volume_traps.png',
    prompt: 'Educational SAT math diagram. Dark navy background (#0d1117). Title in bold white: "AREA AND VOLUME TRAPS". Three trap cards. Card 1 (red left border): "TRAP 1: RADIUS vs DIAMETER" — "Formulas use radius (r). Word problems give diameter (d). Cut in half before plugging in, or answer is 4x too large." Card 2 (orange left border): "TRAP 2: SURFACE AREA vs VOLUME" — "How much cardboard for a box? That is SURFACE AREA (sum of 6 faces), not Volume (L*W*H)." Card 3 (rose left border): "TRAP 3: SCALING CONFUSION" — "Volume is 8x larger. Trap: sides are 8x larger. Correct: cube root of 8 = sides are 2x larger." Professional dark infographic. All text legible.'
  },
  {
    filename: 'lines-angles-triangles_concept.png',
    prompt: 'Educational SAT math diagram. Dark navy background (#0d1117). Title in bold white: "LINES, ANGLES, AND TRIANGLES: The Rules". Center: Two parallel lines cut by a transversal, creating 8 angles. All acute angles highlighted in teal labeled "ALL SMALL ANGLES EQUAL". All obtuse angles highlighted in blue labeled "ALL BIG ANGLES EQUAL". A note: "Any BIG + Any SMALL = 180 degrees." Below: A triangle with "Interior angles always sum to 180 degrees." Professional math infographic. High contrast. All text legible.'
  },
  {
    filename: 'lines-angles-triangles_framework.png',
    prompt: 'Educational SAT math diagram. Dark navy background (#0d1117). Title in bold white: "TRIANGLE PROPERTIES". Two sections. Section 1 (teal): "SIMILAR TRIANGLES: Same angles, proportional sides. Triangle A is 3-4-5. Similar Triangle B has short side 6. Other sides MUST be 8 and 10." Section 2 (blue): "ISOSCELES GUARANTEE: Two equal sides means two equal opposite angles. And vice versa." Below (purple): "THIRD SIDE RULE: Third side must be LESS than sum and GREATER than difference of other two sides." Professional dark infographic. All text legible.'
  },
  {
    filename: 'lines-angles-triangles_traps.png',
    prompt: 'Educational SAT math diagram. Dark navy background (#0d1117). Title in bold white: "GEOMETRY VISUAL TRAPS". Three trap cards. Card 1 (red left border): "TRAP 1: ASSUMED PARALLEL" — "Lines LOOK parallel but the text never says they are. Without explicit parallel statement, transversal rules do not apply." Card 2 (orange left border): "TRAP 2: NOT DRAWN TO SCALE" — "An angle looks like 90 degrees in the diagram but has no square marker. Never trust your eyes." Card 3 (rose left border): "TRAP 3: THIRD SIDE = SUM" — "Sides 5 and 7. Can third side be 12? NO. It must be STRICTLY less than 12, or the lines lay flat." Professional dark infographic. All text legible.'
  },
  {
    filename: 'right-triangles-trigonometry_concept.png',
    prompt: 'Educational SAT math diagram. Dark navy background (#0d1117). Title in bold white: "SOH CAH TOA: Trigonometry Decoded". Center: A right triangle with angle theta marked. Three sides labeled: "OPPOSITE (across from angle)", "ADJACENT (next to angle)", "HYPOTENUSE (longest, across from 90)". Three formulas: "SOH: Sin = Opposite/Hypotenuse" in teal. "CAH: Cos = Adjacent/Hypotenuse" in blue. "TOA: Tan = Opposite/Adjacent" in purple. Below: "These are just fractions of side lengths. No calculator needed." Professional dark infographic. All text legible.'
  },
  {
    filename: 'right-triangles-trigonometry_framework.png',
    prompt: 'Educational SAT math diagram. Dark navy background (#0d1117). Title in bold white: "THE COMPLEMENTARY ANGLE THEOREM". Center: A right triangle with angles x and (90-x) marked. The opposite and adjacent sides are labeled showing they swap for each angle. The key rule in a highlighted box: "Sin(x) = Cos(90-x). ALWAYS." Example: "If Sin(x) = 4/5, what is Cos(90-x)? Answer: 4/5 instantly." Below: "Pythagorean Triplets: 3-4-5, 5-12-13, 8-15-17, 7-24-25. Memorize these." Professional dark infographic. All text legible.'
  },
  {
    filename: 'right-triangles-trigonometry_traps.png',
    prompt: 'Educational SAT math diagram. Dark navy background (#0d1117). Title in bold white: "RIGHT TRIANGLE TRAPS". Three trap cards. Card 1 (red left border): "TRAP 1: RADIAN vs DEGREE" — "Calculator in Radian mode but you type Sin(45). Garbage answer. Verify your calculator mode FIRST." Card 2 (orange left border): "TRAP 2: TRIPLET IGNORANCE" — "Sides 5 and 12. Spending 45 seconds calculating. Should instantly recognize 5-12-13 triplet." Card 3 (rose left border): "TRAP 3: ADJACENT CONFUSION" — "Mixing up which side is Adjacent (next to the angle) vs Opposite (across from angle). Label O, A, H on the triangle first." Professional dark infographic. All text legible.'
  },
  {
    filename: 'circles_concept.png',
    prompt: 'Educational SAT math diagram. Dark navy background (#0d1117). Title in bold white: "THE EQUATION OF A CIRCLE". Center: A circle on a coordinate plane with center point marked at (h,k) and radius r drawn. The formula: "(x-h)^2 + (y-k)^2 = r^2". Example: "(x-3)^2 + (y+5)^2 = 16. Center = (3,-5). Radius = 4 (NOT 16!)." Key warning in teal: "SIGN FLIP: The signs inside flip. (x-3) means h=+3. (y+5) means k=-5." Professional dark infographic. All text legible.'
  },
  {
    filename: 'circles_framework.png',
    prompt: 'Educational SAT math diagram. Dark navy background (#0d1117). Title in bold white: "ARCS AND SECTORS: The Pizza Slice". Center: A circle with a slice/sector highlighted. The central angle labeled "theta". Formula: "Fraction = theta/360. Arc Length = (theta/360) * 2*pi*r. Sector Area = (theta/360) * pi*r^2." Example (teal): "90 degree angle: 90/360 = 1/4. Arc = 1/4 of circumference. Sector = 1/4 of total area." Below (purple): "In radians: Fraction = theta/(2*pi)." Professional dark infographic. All text legible.'
  },
  {
    filename: 'circles_traps.png',
    prompt: 'Educational SAT math diagram. Dark navy background (#0d1117). Title in bold white: "CIRCLE EQUATION TRAPS". Three trap cards. Card 1 (red left border): "TRAP 1: RADIUS SQUARED" — "(x-2)^2+(y-4)^2=81. Diameter? Trap: 162. The 81 is r SQUARED. r=9. Diameter=18." Card 2 (orange left border): "TRAP 2: SIGN INVERSION" — "(x+2)^2+(y-3)^2=25. Center is NOT (2,3). Signs flip inside parentheses. Center = (-2, 3)." Card 3 (rose left border): "TRAP 3: COMPLETING THE SQUARE" — "x^2+6x+y^2-4y=12 must be converted to standard form. Half of b, squared, added to both sides." Professional dark infographic. All text legible.'
  }
];

async function generateAndSave(item, index, total) {
  const outputPath = path.join(OUTPUT_DIR, item.filename);
  
  // Skip if already exists
  if (fs.existsSync(outputPath)) {
    console.log(`⏭️  [${index+1}/${total}] SKIP (exists): ${item.filename}`);
    return true;
  }

  try {
    console.log(`🎨 [${index+1}/${total}] Generating: ${item.filename}...`);
    
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: item.prompt,
      config: {
        numberOfImages: 1,
      },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      const imageBytes = response.generatedImages[0].image.imageBytes;
      const buffer = Buffer.from(imageBytes, 'base64');
      fs.writeFileSync(outputPath, buffer);
      console.log(`✅ [${index+1}/${total}] Saved: ${item.filename} (${(buffer.length/1024).toFixed(1)}KB)`);
      return true;
    } else {
      console.error(`❌ [${index+1}/${total}] No image returned for: ${item.filename}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ [${index+1}/${total}] Error: ${item.filename}: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log(`\n========================================`);
  console.log(`  SAT Lecture Image Bulk Generator`);
  console.log(`  Total images in queue: ${IMAGE_QUEUE.length}`);
  console.log(`  Output: ${OUTPUT_DIR}`);
  console.log(`========================================\n`);

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  let success = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < IMAGE_QUEUE.length; i++) {
    const item = IMAGE_QUEUE[i];
    const outputPath = path.join(OUTPUT_DIR, item.filename);

    if (fs.existsSync(outputPath)) {
      skipped++;
      console.log(`⏭️  [${i+1}/${IMAGE_QUEUE.length}] SKIP (exists): ${item.filename}`);
      continue;
    }

    const result = await generateAndSave(item, i, IMAGE_QUEUE.length);
    if (result) {
      success++;
    } else {
      failed++;
    }

    // Small delay to avoid rate limits (500ms between requests)
    if (i < IMAGE_QUEUE.length - 1) {
      await new Promise(r => setTimeout(r, 500));
    }
  }

  console.log(`\n========================================`);
  console.log(`  COMPLETE!`);
  console.log(`  ✅ Generated: ${success}`);
  console.log(`  ⏭️  Skipped: ${skipped}`);
  console.log(`  ❌ Failed: ${failed}`);
  console.log(`========================================\n`);
}

main().catch(console.error);
