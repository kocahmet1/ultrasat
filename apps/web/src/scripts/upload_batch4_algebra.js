/**
 * Upload Script: Batch 4 Algebra Content
 * Run with: node src/scripts/upload_batch4_algebra.js
 * Requires firebase-admin and ultrasat-5e4c4-369f564bdaef.json at project root
 */

const admin = require('firebase-admin');
const path = require('path');

if (!admin.apps.length) {
  const serviceAccount = require(path.resolve(__dirname, '../../../../ultrasat-5e4c4-369f564bdaef.json'));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

const algebraContents = [
  {
    subcategoryId: 'linear-equations-one-variable',
    difficulty: 'Foundational — Algebraic Syntax',
    estimatedStudyTime: '1 Hour',
    overview: `
<h2>Linear Equations in One Variable: The Language of Balance</h2>

<p>A linear equation is not just a math problem; it is a perfectly balanced scale. On the SAT, 
the challenge isn't usually the arithmetic itself—it is the translation. You are tested on your 
ability to read a word problem and translate English into <strong style="color: var(--learn-accent-blue)">Algebraic 
Syntax</strong>, or to take an intimidating equation and strip it down to a single unknown.</p>

<div style="text-align: center; margin: 48px 0;">
  <!-- Placeholder for linear_equations_one_variable_concept.png -->
  <img src="/assets/images/linear-equations-one-variable_concept.png" alt="Concept: The Equation as a Balanced Scale" style="max-width: 80%; margin: 40px auto; display: block; border-radius: 12px; border: 1px solid var(--learn-border); box-shadow: 0 4px 16px rgba(0,0,0,0.05);" onerror="this.style.display='none'" />
  <p style="font-size: 0.85rem; color: var(--learn-text-muted); margin-top: 12px; font-style: italic;">The equal sign represents a fulcrum. Whatever operation you apply to one side must be applied to the other.</p>
</div>

<h2>The Zero, One, or Infinite Framework</h2>

<p>While most linear equations have exactly one solution, the SAT loves to test boundary conditions. 
You must instantly recognize the structural signatures of equations with 
<strong style="color: var(--learn-accent-purple)">no solution</strong> versus those with 
<strong style="color: var(--learn-accent-teal)">infinite solutions</strong>.</p>

<div class="highlight-box">
  <ul style="margin-bottom: 0;">
    <li style="margin-bottom: 12px"><strong>One Solution:</strong> The coefficients of <em>x</em> are different. (e.g., 3x = 2x + 5. Intersects at one point.)</li>
    <li style="margin-bottom: 12px"><strong>No Solution:</strong> The coefficients of <em>x</em> are identical, but the constants are different. (e.g., 2x + 3 = 2x + 5. Parallel lines that never touch.)</li>
    <li><strong>Infinite Solutions:</strong> Both sides are identical after simplification. (e.g., 2(x + 1) = 2x + 2. The equations describe the exact same line.)</li>
  </ul>
</div>

<p>When the SAT asks, "For what value of <em>k</em> does the equation have no solution?", they are 
giving you a structural blueprint. They want you to force the <em>x</em> coefficients to match while 
ensuring the constants do not.</p>

<h2>The Deconstruction Approach</h2>

<div style="text-align: center; margin: 48px 0;">
  <!-- Placeholder for linear_equations_one_variable_framework.png -->
  <img src="/assets/images/linear-equations-one-variable_framework.png" alt="Framework: Isolate, Distribute, Balance" style="max-width: 80%; margin: 40px auto; display: block; border-radius: 12px; border: 1px solid var(--learn-border); box-shadow: 0 4px 16px rgba(0,0,0,0.05);" onerror="this.style.display='none'" />
  <p style="font-size: 0.85rem; color: var(--learn-text-muted); margin-top: 12px; font-style: italic;">Clear the fractions, distribute the parentheses, and group the variables. Execution over intuition.</p>
</div>

<p>Never try to mental-math a complex SAT equation. Instead, use a mechanical, step-by-step 
deactivation process:</p>
<p><strong style="color: var(--learn-accent-teal)">1. Clear the Noise:</strong> Multiply the entire equation by the Least Common Multiple (LCM) to eliminate fractions.</p>
<p><strong style="color: var(--learn-accent-blue)">2. Distribute:</strong> Expand any parentheses completely. Watch out for the deadly negative sign distribution error.</p>
<p><strong style="color: var(--learn-accent-purple)">3. Group and Isolate:</strong> Move all variable terms to one side and constants to the other.</p>

<h2>Classic Trap Mechanics</h2>

<div style="text-align: center; margin: 48px 0;">
  <!-- Placeholder for linear_equations_one_variable_traps.png -->
  <img src="/assets/images/linear-equations-one-variable_traps.png" alt="Traps: The Sign Flip, The Wrong Target, Equation Identity" style="max-width: 80%; margin: 40px auto; display: block; border-radius: 12px; border: 1px solid var(--learn-border); box-shadow: 0 4px 16px rgba(0,0,0,0.05);" onerror="this.style.display='none'" />
  <p style="font-size: 0.85rem; color: var(--learn-text-muted); margin-top: 12px; font-style: italic;">The SAT knows where you will make your arithmetic errors and includes those exact numbers as trap answers.</p>
</div>

<p>The <strong style="color: var(--learn-accent-rose)">Sign Distribution Trap</strong>: 
When evaluating an expression like <code>-(x - 4)</code>, students frequently write <code>-x - 4</code> instead of <code>-x + 4</code>. The SAT will always have that resulting wrong answer waiting for you in option A.</p>
<p>The <strong style="color: var(--learn-accent-rose)">Wrong Target Trap</strong>: 
You flawlessly solve for <em>x = 3</em>. You pick 3. But the question asked for the value of <em>2x + 1</em>. The answer was 7. You did the hard math and failed the reading test.</p>
`,
    keyStrategies: [
      "The Constant Multiplier: If you face an equation dripping in fractions (e.g., x/3 + x/4 = 7), multiply the entire thing by 12 immediately. Working with integers prevents sloppy errors.",
      "The Substitution Bypass: If an equation asks for a complex expression instead of just 'x' (e.g., if 3x - 2 = 10, find 6x - 4), don't solve for x! Notice that 6x - 4 is exactly double 3x - 2. The answer is instantly 20.",
      "The 'Matching Coefficients' Rule: When a question asks for 'no solution' or 'infinite solutions', your ONLY goal is to make the coefficients of the variables equal on both sides."
    ],
    commonMistakes: [
      "Solving for x when the question asked for an expression (like x-1 or 3x).",
      "Failing to distribute a negative sign to the second term inside a parenthesis.",
      "Assuming a messy decimal or fraction answer must be wrong. The Digital SAT frequently has non-integer solutions."
    ],
    studyTips: [
      "The Target Highlight: When you read a math problem, draw a literal box around what the question is asking for (e.g., 'value of 3x'). Do not bubble an answer until you look back at the box.",
      "Distribution Practice: Write out 10 complex distribution expressions with negative signs and practice expanding them flawlessly in under 30 seconds."
    ]
  },
  {
    subcategoryId: 'linear-functions',
    difficulty: 'Intermediate — Slope and Intercept Translation',
    estimatedStudyTime: '1.5 Hours',
    overview: `
<h2>Linear Functions: The Anatomy of y = mx + b</h2>

<p>If linear equations are the vocabulary of algebra, linear functions are the grammar. 
Every linear function on the SAT operates on two critical pieces of DNA: the 
<strong style="color: var(--learn-accent-teal)">rate of change (slope)</strong> and the 
<strong style="color: var(--learn-accent-blue)">starting value (y-intercept)</strong>. 
The SAT will wrap these two concepts in complex word problems, tables, and graphs, but they 
are always asking you to uncover the exact same <em>m</em> and <em>b</em>.</p>

<div style="text-align: center; margin: 48px 0;">
  <!-- Placeholder -->
  <img src="/assets/images/linear-functions_concept.png" alt="Concept: Anatomy of y = mx + b" style="max-width: 80%; margin: 40px auto; display: block; border-radius: 12px; border: 1px solid var(--learn-border); box-shadow: 0 4px 16px rgba(0,0,0,0.05);" onerror="this.style.display='none'" />
  <p style="font-size: 0.85rem; color: var(--learn-text-muted); margin-top: 12px; font-style: italic;">The slope translates to "rate per unit." The intercept translates to "initial state at time zero."</p>
</div>

<h2>Decoding the Word Problem</h2>

<p>Most students can graph a line. The SAT tests if you can interpret one. In a word problem:</p>

<div class="highlight-box">
  <ul style="margin-bottom: 0;">
    <li style="margin-bottom: 12px"><strong>The Slope (m):</strong> Look for triggers like "each," "per," "monthly," or "rate." If a plumber charges $50 per hour, $50 is the slope.</li>
    <li><strong>The Y-Intercept (b):</strong> Look for "flat fee," "initial," "base cost," or "starting at." If the plumber charges a $100 house call fee before doing any work, $100 is the y-intercept.</li>
  </ul>
</div>

<p>The resulting function: <code>Cost = 50(hours) + 100</code>.</p>

<h2>The Graph to Equation Pipeline</h2>

<div style="text-align: center; margin: 48px 0;">
  <!-- Placeholder -->
  <img src="/assets/images/linear-functions_framework.png" alt="Framework: Extracting m and b from coordinates" style="max-width: 80%; margin: 40px auto; display: block; border-radius: 12px; border: 1px solid var(--learn-border); box-shadow: 0 4px 16px rgba(0,0,0,0.05);" onerror="this.style.display='none'" />
  <p style="font-size: 0.85rem; color: var(--learn-text-muted); margin-top: 12px; font-style: italic;">Never trust the visual grid. Trust the coordinate points.</p>
</div>

<p>When presented with a graph, bypass the visual distraction and extract hard data. 
Find two clean coordinate points. Calculate the slope using <code>(y2 - y1) / (x2 - x1)</code>. 
Then, identify where the line crosses the y-axis (where x=0). This gives you your complete function.</p>

<h2>Translation Traps</h2>

<div style="text-align: center; margin: 48px 0;">
  <!-- Placeholder -->
  <img src="/assets/images/linear-functions_traps.png" alt="Traps: Axis Scaling, Swapped Variables, The X-Intercept Trap" style="max-width: 80%; margin: 40px auto; display: block; border-radius: 12px; border: 1px solid var(--learn-border); box-shadow: 0 4px 16px rgba(0,0,0,0.05);" onerror="this.style.display='none'" />
  <p style="font-size: 0.85rem; color: var(--learn-text-muted); margin-top: 12px; font-style: italic;">The SAT engineers graphs with misleading axes to trick students who just "count the boxes."</p>
</div>

<p>The <strong style="color: var(--learn-accent-rose)">Scale Manipulation Trap</strong>: 
A student looks at a line, goes "up one box, right one box," and assumes the slope is 1. But the y-axis counts by 10s and the x-axis counts by 2s. The true slope is 10/2 = 5. Always read the axis labels.</p>
<p>The <strong style="color: var(--learn-accent-rose)">X-Intercept vs Y-Intercept Confusion</strong>: 
The question asks for the initial value (when time = 0, which is the y-intercept). The trap answer provides the x-intercept (when the value = 0).</p>
`,
    keyStrategies: [
      "The English-to-Math Translator: Train yourself to instantly underline the word 'per' or 'each' and write 'm' above it, and underline 'base' or 'initial' and write 'b' above it.",
      "Check the Axes First: Before analyzing any graph, read the x-axis unit, the y-axis unit, and the numerical scale. Never count boxes.",
      "Point Testing: If you are given a table and asked to identify the function, do not do the algebra! Pick a (x,y) pair from the table and plug it into the answer choices. The correct answer must yield a true statement."
    ],
    commonMistakes: [
      "Swapping the components of slope, doing 'change in x over change in y' instead of 'rise over run'.",
      "Treating an x-intercept as a starting value.",
      "Falling for scale traps by not reading the graph's labels."
    ],
    studyTips: [
      "The Table Bypass Drill: Take 5 questions presenting a table of values and write out the function. Focus on finding the difference in 'y' divided by the difference in 'x'.",
      "Word Problem Deconstruction: Keep a list of all vocabulary words the SAT uses to mean 'slope' (rate, speed, depreciation) and 'intercept' (fee, initial, zero-point)."
    ]
  },
  {
    subcategoryId: 'linear-equations-two-variables',
    difficulty: 'Intermediate — Coordinate Geometry',
    estimatedStudyTime: '1 Hour',
    overview: `
<h2>Linear Equations in Two Variables: Standard Form and Graphs</h2>

<p>While <code>y = mx + b</code> is intuitive for graphing, the SAT frequently tests lines written 
in Standard Form: <strong style="color: var(--learn-accent-purple)">Ax + By = C</strong>. 
These equations describe constraints (e.g., buying $A apples and $B bananas with $C total cash). 
To master this section, you must effortlessly toggle between Standard Form and Slope-Intercept Form without hesitation.</p>

<div style="text-align: center; margin: 48px 0;">
  <!-- Placeholder -->
  <img src="/assets/images/linear-equations-two-variables_concept.png" alt="Concept: Standard Form vs Slope-Intercept Form" style="max-width: 80%; margin: 40px auto; display: block; border-radius: 12px; border: 1px solid var(--learn-border); box-shadow: 0 4px 16px rgba(0,0,0,0.05);" onerror="this.style.display='none'" />
  <p style="font-size: 0.85rem; color: var(--learn-text-muted); margin-top: 12px; font-style: italic;">Standard form is best for finding intercepts. Slope-intercept form is best for plotting the line.</p>
</div>

<h2>The Intercept Cover-Up Method</h2>

<p>When given an equation like <code>3x + 4y = 12</code>, do not waste time rewriting it into <code>y = mx + b</code> just to find out where it lives on a graph. Use the <strong style="color: var(--learn-accent-teal)">Cover-Up Method</strong>:</p>

<div class="highlight-box">
  <ul style="margin-bottom: 0;">
    <li style="margin-bottom: 12px"><strong>Find the x-intercept:</strong> Cover up the 'y' term (because y is 0). You see <code>3x = 12</code>. So, x = 4. The point is (4,0).</li>
    <li><strong>Find the y-intercept:</strong> Cover up the 'x' term (because x is 0). You see <code>4y = 12</code>. So, y = 3. The point is (0,3).</li>
  </ul>
</div>

<p>Plot those two points and connect them. You have completely decoded the graph in under 5 seconds.</p>

<h2>The Parallel and Perpendicular Rules</h2>

<div style="text-align: center; margin: 48px 0;">
  <!-- Placeholder -->
  <img src="/assets/images/linear-equations-two-variables_framework.png" alt="Framework: Parallel and Perpendicular Slope Calculations" style="max-width: 80%; margin: 40px auto; display: block; border-radius: 12px; border: 1px solid var(--learn-border); box-shadow: 0 4px 16px rgba(0,0,0,0.05);" onerror="this.style.display='none'" />
  <p style="font-size: 0.85rem; color: var(--learn-text-muted); margin-top: 12px; font-style: italic;">Parallel means identical slopes. Perpendicular means negative reciprocal slopes.</p>
</div>

<p>The SAT heavily tests geometric relationships between two variables:</p>
<p><strong style="color: var(--learn-accent-blue)">Parallel Lines:</strong> Have the exact same slope. If line 'p' is <code>y = 2x + 4</code>, line 'q' might be <code>y = 2x - 10</code>.</p>
<p><strong style="color: var(--learn-accent-purple)">Perpendicular Lines:</strong> Intsect at a 90-degree angle. Their slopes are negative reciprocals. If the first slope is <code>3/4</code>, the perpendicular slope is exactly <code>-4/3</code>.</p>

<h2>Constraint Engineering Traps</h2>

<div style="text-align: center; margin: 48px 0;">
  <!-- Placeholder -->
  <img src="/assets/images/linear-equations-two-variables_traps.png" alt="Traps: The Coefficient Swap, The Interpretation Error" style="max-width: 80%; margin: 40px auto; display: block; border-radius: 12px; border: 1px solid var(--learn-border); box-shadow: 0 4px 16px rgba(0,0,0,0.05);" onerror="this.style.display='none'" />
  <p style="font-size: 0.85rem; color: var(--learn-text-muted); margin-top: 12px; font-style: italic;">Variables must match their units in standard form word problems.</p>
</div>

<p>The <strong style="color: var(--learn-accent-rose)">Coefficient Swap Trap</strong>: 
A word problem says "tents (t) hold 3 people and cabins (c) hold 5 people." The trap answer will be <code>5t + 3c = total</code>. You must carefully pair the rate with its specific variable: <code>3t + 5c = total</code>.</p>
<p>The <strong style="color: var(--learn-accent-rose)">Standard Form Slope Illusion</strong>: 
Looking at <code>2x + 3y = 12</code>, students assume the slope is 2. It is not. The slope derived from standard form <code>Ax + By = C</code> is always <code>-A/B</code>. Here, the slope is <code>-2/3</code>.</p>
`,
    keyStrategies: [
      "The Instant Slope Formula: Immediately memorize that for the form Ax + By = C, the slope is -A/B. This saves the 20 seconds required to rearrange the algebra.",
      "The Cover-Up Method: Always use the cover-up method for finding coordinate intercepts from Standard Form. It is faster and far less error-prone.",
      "Desmos Integration: The Digital SAT includes an embedded graphing calculator. If a question asks which graph matches '4x - 5y = 20', don't do the math. Type the equation directly into Desmos and find the visual match."
    ],
    commonMistakes: [
      "Thinking the 'A' in Ax + By = C is the slope.",
      "Forgetting to flip the sign when finding a perpendicular slope (e.g., using 1/2 instead of -1/2 for a slope of 2).",
      "Confusing the x-intercept value for the y-intercept value when plotting."
    ],
    studyTips: [
      "The -A/B Flashcard Drill: Write down 15 random equations in standard form and practice calculating the slope (-A/B) instantly in your head.",
      "Unit Matching Practice: Practice taking constraints (Cost per item, total budget) and converting them straight into Ax + By = C form without attempting to solve them."
    ]
  },
  {
    subcategoryId: 'systems-linear-equations',
    difficulty: 'Advanced — Intersection Logic',
    estimatedStudyTime: '2 Hours',
    overview: `
<h2>Systems of Linear Equations: Finding the Collision Point</h2>

<p>A system of linear equations asks a simple question: At what exact coordinate (x,y) do 
these two realities collide? The SAT is not testing if you know what a system is—it tests 
whether you can identify the most <strong style="color: var(--learn-accent-purple)">efficient 
algorithmic pathway</strong> to solve it. While substitution and elimination both work, 
picking the wrong one costs you valuable minutes.</p>

<div style="text-align: center; margin: 48px 0;">
  <!-- Placeholder -->
  <img src="/assets/images/systems-linear-equations_concept.png" alt="Concept: Two lines intersecting at a single point vs parallel lines vs identical lines" style="max-width: 80%; margin: 40px auto; display: block; border-radius: 12px; border: 1px solid var(--learn-border); box-shadow: 0 4px 16px rgba(0,0,0,0.05);" onerror="this.style.display='none'" />
  <p style="font-size: 0.85rem; color: var(--learn-text-muted); margin-top: 12px; font-style: italic;">The algebraic solution represents the physical geometric intersection of two lines.</p>
</div>

<h2>The Triage Framework: Substitution vs. Elimination</h2>

<p>Before putting pencil to paper, you must triage the problem.</p>

<div class="highlight-box">
  <ul style="margin-bottom: 0;">
    <li style="margin-bottom: 12px"><strong>Trigger for Substitution:</strong> One equation already has a variable isolated (e.g., <code>x = 3y + 2</code>). Take that entire block and plug it into the 'x' of the other equation.</li>
    <li style="margin-bottom: 12px"><strong>Trigger for Elimination:</strong> Both equations are in Standard Form (Ax + By = C). Stack them vertically. Multiply one or both equations so that a variable cancels out when you add them downward.</li>
    <li><strong>The Desmos Bypass:</strong> In the Digital SAT, if the system is pure numbers (no unknown constants like 'k'), just type both equations into the built-in Desmos calculator and click the intersection point. Done.</li>
  </ul>
</div>

<h2>The Unknown Constant Questions</h2>

<div style="text-align: center; margin: 48px 0;">
  <!-- Placeholder -->
  <img src="/assets/images/systems-linear-equations_framework.png" alt="Framework: Solving for variable constants relying on infinite/no solution rule" style="max-width: 80%; margin: 40px auto; display: block; border-radius: 12px; border: 1px solid var(--learn-border); box-shadow: 0 4px 16px rgba(0,0,0,0.05);" onerror="this.style.display='none'" />
  <p style="font-size: 0.85rem; color: var(--learn-text-muted); margin-top: 12px; font-style: italic;">When the SAT asks for a constant 'c' that results in "no solution," they are demanding parallel lines.</p>
</div>

<p>The hardest questions in this category introduce a dummy variable. "In the system above, 
<em>c</em> is a constant. If the system has no solution, what is the value of <em>c</em>?"</p>
<p>To solve this, rely on the <strong style="color: var(--learn-accent-teal)">Ratio Rule</strong>:</p>
<p>For a system in the form <code>A1x + B1y = C1</code> and <code>A2x + B2y = C2</code>...</p>
<ul>
  <li>If there is <strong>No Solution</strong> (Parallel lines): The ratios of the coefficients must match, but the constant ratio must not. <code>A1/A2 = B1/B2 ≠ C1/C2</code>.</li>
  <li>If there are <strong>Infinite Solutions</strong> (Same line): All ratios must perfectly match. <code>A1/A2 = B1/B2 = C1/C2</code>.</li>
</ul>

<h2>Common System Traps</h2>

<div style="text-align: center; margin: 48px 0;">
  <!-- Placeholder -->
  <img src="/assets/images/systems-linear-equations_traps.png" alt="Traps: The Half-Solution, The Subtraction Error" style="max-width: 80%; margin: 40px auto; display: block; border-radius: 12px; border: 1px solid var(--learn-border); box-shadow: 0 4px 16px rgba(0,0,0,0.05);" onerror="this.style.display='none'" />
  <p style="font-size: 0.85rem; color: var(--learn-text-muted); margin-top: 12px; font-style: italic;">The Half-Solution trap is designed for cognitive fatigue. You finish the hard math and pick the first number you see.</p>
</div>

<p>The <strong style="color: var(--learn-accent-rose)">Half-Solution Trap</strong>: 
You spend 2 minutes solving for <code>x = 5</code>. You see '5' in option A and select it. But the question asked for the value of <code>y</code> (which is 12). Always circle the target variable.</p>

<p>The <strong style="color: var(--learn-accent-rose)">Stack Subtraction Trap</strong>: 
When using elimination, students frequently attempt to subtract equations instead of adding them. Subtracting negative numbers in your head under pressure invariably leads to sign errors. Strategy: multiply the entire bottom equation by a negative, and then ADD the equations together.</p>
`,
    keyStrategies: [
      "Graph It First: The Desmos calculator is the ultimate cheat code for Systems. If there are no unknown constants like 'k' or 'c', throw both equations in the graphing tool and literally point at the intersection.",
      "The Addition-Only Elimination: Never subtract equations. If you need to eliminate '3y' and '3y', distribute a -1 across the entire second equation, and then add vertically.",
      "The Ratio Shortcut: For 'no solution' standard form problems, simply set up a fraction of the x coefficients equal to the fraction of the y coefficients and cross-multiply."
    ],
    commonMistakes: [
      "Solving for x, finding the answer choice that matches x, and forgetting the question asked for x + y.",
      "Making an arithmetic error when distributing a negative sign during substitution.",
      "Forgetting that 'infinite solutions' means the lines are the exact same, meaning all components of the equations must be proportional."
    ],
    studyTips: [
      "Desmos Speed Drills: Practice opening Desmos and typing in two equations to find the intersection in under 20 seconds.",
      "The Ratio Formula Memorization: Memorize A1/A2 = B1/B2 for 'no solution' systems. It transforms the hardest questions on the test into 10-second algebraic fractions."
    ]
  },
  {
    subcategoryId: 'linear-inequalities',
    difficulty: 'Intermediate — Boundary Lines and Shading',
    estimatedStudyTime: '1.5 Hours',
    overview: `
<h2>Linear Inequalities: Managing the Zones</h2>

<p>A standard equation asks "Where is the line?" An inequality asks "Where is the 
<strong style="color: var(--learn-accent-blue)">safe zone</strong>?" Inequalities split the entire 
graph into territory that "works" and territory that fails. On the SAT, inequalities test 
two distinct concepts: <strong style="color: var(--learn-accent-teal)">solving for a range of physical logic</strong> 
(like a maximum budget) and <strong style="color: var(--learn-accent-purple)">graphical shading constraints</strong>.</p>

<div style="text-align: center; margin: 48px 0;">
  <!-- Placeholder -->
  <img src="/assets/images/linear-inequalities_concept.png" alt="Concept: A line that represents a boundary with a shaded region indicating valid solutions" style="max-width: 80%; margin: 40px auto; display: block; border-radius: 12px; border: 1px solid var(--learn-border); box-shadow: 0 4px 16px rgba(0,0,0,0.05);" onerror="this.style.display='none'" />
  <p style="font-size: 0.85rem; color: var(--learn-text-muted); margin-top: 12px; font-style: italic;">An inequality isn't a single answer; it's an infinite landscape of valid coordinates.</p>
</div>

<h2>The Core Rules of Inequality Algebra</h2>

<p>Inequalities behave exactly like equations, requiring identical isolation steps, but with 
one absolutely fatal difference.</p>

<div class="highlight-box">
  <ul style="margin-bottom: 0;">
    <li style="margin-bottom: 12px"><strong>The Fatal Flip:</strong> If you multiply or divide an inequality by a negative number, the inequality sign MUST flip direction. <code>-2x > 10</code> becomes <code>x < -5</code>. (Failure to do this accounts for 80% of algebraic inequality errors.)</li>
    <li><strong>The Inclusion Rule:</strong> The symbols <code><</code> and <code>></code> mean the boundary line is a fence you cannot touch (dashed line). The symbols <code><=</code> and <code>>=</code> mean you can stand directly on the fence (solid line).</li>
  </ul>
</div>

<h2>Word Problem Translation (Budgets and Limits)</h2>

<div style="text-align: center; margin: 48px 0;">
  <!-- Placeholder -->
  <img src="/assets/images/linear-inequalities_framework.png" alt="Framework: Translating 'at least' and 'no more than' into mathematical symbols" style="max-width: 80%; margin: 40px auto; display: block; border-radius: 12px; border: 1px solid var(--learn-border); box-shadow: 0 4px 16px rgba(0,0,0,0.05);" onerror="this.style.display='none'" />
  <p style="font-size: 0.85rem; color: var(--learn-text-muted); margin-top: 12px; font-style: italic;">The English translation of inequality symbols is inherently counter-intuitive. Memorize the mapping.</p>
</div>

<p>The SAT uses specific colloquial English phrases to indicate inequalities. You must translate 
them logically, not phonetically:</p>
<ul>
  <li><strong style="color: var(--learn-accent-teal)">"At least" / "A minimum of":</strong> Translates to <code>>=</code> (Greater than or equal to). "I need at least 5 dollars" means money <code>>= 5</code>.</li>
  <li><strong style="color: var(--learn-accent-blue)">"No more than" / "A maximum of":</strong> Translates to <code><=</code> (Less than or equal to). "The bridge holds a maximum of 2 tons" means weight <code><= 2</code>.</li>
</ul>

<h2>Graphical Shading Traps</h2>

<div style="text-align: center; margin: 48px 0;">
  <!-- Placeholder -->
  <img src="/assets/images/linear-inequalities_traps.png" alt="Traps: Visual Shading Trap, System Overlap, Point Testing" style="max-width: 80%; margin: 40px auto; display: block; border-radius: 12px; border: 1px solid var(--learn-border); box-shadow: 0 4px 16px rgba(0,0,0,0.05);" onerror="this.style.display='none'" />
  <p style="font-size: 0.85rem; color: var(--learn-text-muted); margin-top: 12px; font-style: italic;">Never trust your intuition of "up" and "down" when a line has a negative slope.</p>
</div>

<p>The <strong style="color: var(--learn-accent-rose)">Shading direction trap</strong> happens 
when a student sees <code>></code> and instinctively shades "up" on a graph without ensuring the 
equation is perfectly isolated as <code>y > mx + b</code>. If the equation is in standard form 
(<code>-2x + y > 4</code>), isolating 'y' might trigger a sign flip depending on the coefficients.</p>

<p>The <strong style="color: var(--learn-accent-rose)">System Overlap Trap</strong> asks for a point 
that satisfies a system of inequalities. The answer choices will include a point that works for 
Equation A but fails Equation B. The correct point MUST sit inside the deeply shaded, double-overlapping region.</p>
`,
    keyStrategies: [
      "The 0,0 Test Point: If you are unsure which side of a line to shade or which graph is correct, plug the coordinate (0,0) into the inequality. If it's a true statement (e.g., 0 < 5), shade the side containing the origin. If false, shade the opposite side.",
      "Leveraging Desmos: For system of inequality graphs, type both inequalities into Desmos. It will highlight the overlapping region. Find the intersection point on the screen and pick the matching answer.",
      "The Vocabulary Lock-In: On word problems, immediately cross out 'at least' and physically write '>=' over it before reading the rest of the problem. Lock in the math symbol early."
    ],
    commonMistakes: [
      "Forgetting to flip the > or < sign when dividing by a negative number.",
      "Confusing 'at least' (which feels like 'less') with <=.",
      "Evaluating a point on a dashed line and assuming it is a valid solution. (Dashed lines mean strictly greater/less than, so points ON the line fail)."
    ],
    studyTips: [
      "Sign Flip Awareness: Keep a sticky note on your desk outlining the exact conditions for a sign flip. Practice solving 5 equations designed specifically to force a flip.",
      "Desmos Graphing Practice: Practice typing constraints like '3x + 4y <= 20' into Desmos and visually locating the maximum whole-number integer solution in the shaded region."
    ]
  }
];

async function uploadBatch() {
  console.log('Beginning Batch 4 Algebra uploads...');
  for (const item of algebraContents) {
    try {
      await db.collection('learningContent').doc(item.subcategoryId).set({
        ...item,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`✅ Uploaded content for ${item.subcategoryId}`);
    } catch (error) {
      console.error(`❌ Failed to upload ${item.subcategoryId}:`, error);
    }
  }
  console.log('Algebra batch complete.');
}

uploadBatch();
