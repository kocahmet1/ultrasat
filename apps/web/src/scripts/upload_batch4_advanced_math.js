/**
 * Upload Script: Batch 4 Advanced Math Content
 * Run with: node src/scripts/upload_batch4_advanced_math.js
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

const advancedMathContents = [
  {
    subcategoryId: 'nonlinear-functions',
    difficulty: 'Advanced — Behavior of Exponentials and Parabolas',
    estimatedStudyTime: '2 Hours',
    overview: `
<h2>Nonlinear Functions: Curves, Exponentials, and Parabolas</h2>

<p>Linear functions grow by addition. Nonlinear functions grow by <strong style="color: var(--learn-accent-blue)">multiplication 
(exponentials)</strong> or <strong style="color: var(--learn-accent-teal)">exponents (quadratics)</strong>. 
The SAT doesn't typically ask you to perform long, multi-step derivation; they ask you to identify the 
shape of the function based on a word problem or recognize the key features of its graph.</p>

<div style="text-align: center; margin: 48px 0;">
  <!-- Placeholder for nonlinear_functions_concept.png -->
  <img src="/assets/images/nonlinear-functions_concept.png" alt="Concept: Linear addition vs Exponential multiplication vs Quadratic symmetry" style="max-width: 80%; margin: 40px auto; display: block; border-radius: 12px; border: 1px solid var(--learn-border); box-shadow: 0 4px 16px rgba(0,0,0,0.05);" onerror="this.style.display='none'" />
  <p style="font-size: 0.85rem; color: var(--learn-text-muted); margin-top: 12px; font-style: italic;">Identify the growth mechanism: A constant difference means linear. A constant multiplier means exponential.</p>
</div>

<h2>Exponential Functions: The Percentage Engine</h2>

<p>Exponential functions (<code>y = a(b)^x</code>) are the SAT's preferred method for testing compound interest, 
population growth, and radioactive decay. The structure is unvarying:</p>

<div class="highlight-box">
  <ul style="margin-bottom: 0;">
    <li style="margin-bottom: 12px"><strong>Initial Value (a):</strong> The starting amount when x=0.</li>
    <li style="margin-bottom: 12px"><strong>Growth/Decay Factor (b):</strong> The multiplier. If a population grows by 5%, the multiplier is not 0.05, it is <strong>1.05</strong>. If it decays by 5%, the multiplier is <strong>0.95</strong>.</li>
    <li><strong>The Cycle Marker (x):</strong> How often the growth happens. If it grows every 10 years, and 't' represents years, the exponent must be <strong>t/10</strong>, not 10t.</li>
  </ul>
</div>

<h2>Quadratic Form Translation</h2>

<div style="text-align: center; margin: 48px 0;">
  <!-- Placeholder for nonlinear_functions_framework.png -->
  <img src="/assets/images/nonlinear-functions_framework.png" alt="Framework: Standard, Vertex, and Factored form of quadratics" style="max-width: 80%; margin: 40px auto; display: block; border-radius: 12px; border: 1px solid var(--learn-border); box-shadow: 0 4px 16px rgba(0,0,0,0.05);" onerror="this.style.display='none'" />
  <p style="font-size: 0.85rem; color: var(--learn-text-muted); margin-top: 12px; font-style: italic;">Each form of a quadratic equation reveals a different secret about its parabola.</p>
</div>

<p>For parabolas, the SAT tests your fluency in switching between different forms of the same equation depending 
on what the question asks for:</p>
<p><strong style="color: var(--learn-accent-teal)">Standard Form <code>y = ax^2 + bx + c</code>:</strong> Best for finding the y-intercept (which is 'c').</p>
<p><strong style="color: var(--learn-accent-blue)">Factored Form <code>y = a(x - m)(x - n)</code>:</strong> Best for finding the x-intercepts or "roots" (which are m and n).</p>
<p><strong style="color: var(--learn-accent-purple)">Vertex Form <code>y = a(x - h)^2 + k</code>:</strong> Best for finding the absolute maximum or minimum point (the vertex is at h, k).</p>
<p>If a question asks "Which equivalent form reveals the minimum value?", it is telling you to select the Vertex Form answer.</p>

<h2>Nonlinear Engineering Traps</h2>

<div style="text-align: center; margin: 48px 0;">
  <!-- Placeholder for nonlinear_functions_traps.png -->
  <img src="/assets/images/nonlinear-functions_traps.png" alt="Traps: The Multiplier Trap, The Inverse Cycle Trap" style="max-width: 80%; margin: 40px auto; display: block; border-radius: 12px; border: 1px solid var(--learn-border); box-shadow: 0 4px 16px rgba(0,0,0,0.05);" onerror="this.style.display='none'" />
  <p style="font-size: 0.85rem; color: var(--learn-text-muted); margin-top: 12px; font-style: italic;">Rate conversions are the SAT's favorite trick. 12% decay is not a multiplier of .12.</p>
</div>

<p>The <strong style="color: var(--learn-accent-rose)">Base vs. Rate Trap</strong>: 
If a question states "The value drops by 20% each year," the trap answer will use 0.20 as the base inside the parentheses. The correct base must be what REMAINS: <code>1 - 0.20 = 0.80</code>.</p>
<p>The <strong style="color: var(--learn-accent-rose)">Inverse Time Trap</strong>: 
If a cell population doubles every 4 days, and 'd' is days, students often write the exponent as <code>4d</code>. The correct exponent is division: <code>d/4</code>. At d=4 days, the exponent must equal 1.</p>
`,
    keyStrategies: [
      "The '1 + r' Principle: For exponential word problems, always explicitly write out (1 + rate) or (1 - rate) before looking at the answer choices. This inoculates you against the base trap.",
      "Root Symmetry: In a parabola, the x-coordinate of the vertex is always exactly precisely perfectly in the middle of the two x-intercepts. If the roots are at x=2 and x=6, the vertex must be at x=4. No calculus required.",
      "Visualizing with Desmos: Every quadratic and exponential function on the test can and should be typed into Desmos. You can click on the vertex, intercepts, and y-intercept instantly to verify algebraic forms."
    ],
    commonMistakes: [
      "Translating 'doubles every 3 hours' as an exponent of 3t instead of t/3.",
      "Picking Factored Form when the question explicitly asked which equation 'displays the minimum value as a constant'. (The answer had to be Vertex Form).",
      "Treating a 5% increase as a multiplier of 1.5 instead of 1.05."
    ],
    studyTips: [
      "Form Translation Practice: Given a Standard Form quadratic, practice factoring it to find the roots, and completing the square to find the vertex.",
      "Decay Drills: Write out the multipliers for various decay scenarios: 3% loss (0.97), 12% loss (0.88), 99% loss (0.01)."
    ]
  },
  {
    subcategoryId: 'nonlinear-equations',
    difficulty: 'Advanced — Algebraic Deconstruction',
    estimatedStudyTime: '2 Hours',
    overview: `
<h2>Nonlinear Equations: Breaking the Higher Powers</h2>

<p>When an equation involves an <code>x^2</code>, an <code>x^3</code>, a square root, or variables in the denominator, 
the simple rules of linear balance break down. The SAT utilizes <strong style="color: var(--learn-accent-blue)">Nonlinear 
Equations</strong> to test you on factoring, the Quadratic Formula, and identifying extraneous solutions that 
look mathematically sound but fail physical reality.</p>

<div style="text-align: center; margin: 48px 0;">
  <!-- Placeholder -->
  <img src="/assets/images/nonlinear-equations_concept.png" alt="Concept: The toolbox to break down quadratics and higher order roots" style="max-width: 80%; margin: 40px auto; display: block; border-radius: 12px; border: 1px solid var(--learn-border); box-shadow: 0 4px 16px rgba(0,0,0,0.05);" onerror="this.style.display='none'" />
  <p style="font-size: 0.85rem; color: var(--learn-text-muted); margin-top: 12px; font-style: italic;">Before doing math, categorize the equation: Is it a pure quadratic, a rational equation, or a radical equation?</p>
</div>

<h2>The Quadratic Toolkit</h2>

<p>If you see an <code>x^2</code>, you have three primary tools. Choosing the right one saves minutes.</p>

<div class="highlight-box">
  <ul style="margin-bottom: 0;">
    <li style="margin-bottom: 12px"><strong>Tool 1: Factoring.</strong> Only works if the equation is equal to ZERO. Move everything to one side. e.g., <code>x^2 - 5x + 6 = 0</code> factors cleanly into <code>(x-2)(x-3) = 0</code>.</li>
    <li style="margin-bottom: 12px"><strong>Tool 2: The Discriminant (b^2 - 4ac).</strong> Use this when the SAT asks "How many solutions exist?" You don't need to find them, just count them. Positive = 2 solutions. Zero = 1 solution. Negative = No real solutions.</li>
    <li><strong>Tool 3: The Quadratic Formula.</strong> When factoring fails and the answers contain square roots (e.g., <code>3 ± √5</code>), the SAT is screaming at you: USE THE FORMULA!</li>
  </ul>
</div>

<h2>Extraneous Solutions in Radicals and Rationals</h2>

<div style="text-align: center; margin: 48px 0;">
  <!-- Placeholder -->
  <img src="/assets/images/nonlinear-equations_framework.png" alt="Framework: Radical and Rational equation isolation and verification" style="max-width: 80%; margin: 40px auto; display: block; border-radius: 12px; border: 1px solid var(--learn-border); box-shadow: 0 4px 16px rgba(0,0,0,0.05);" onerror="this.style.display='none'" />
  <p style="font-size: 0.85rem; color: var(--learn-text-muted); margin-top: 12px; font-style: italic;">Squaring both sides of an equation creates "ghost" solutions. You must verify them.</p>
</div>

<p>When dealing with square roots (e.g., <code>√x = x - 2</code>), the method is to square both sides, 
resulting in a quadratic. However, doing so mechanically introduces <strong style="color: var(--learn-accent-purple)">extraneous 
solutions</strong>—numbers that solve the quadratic but fail the original square root equation.</p>

<p>If you algebraically solve a radical equation and get x = 1 and x = 4, you MUST plug them back 
into the very original equation. <code>√1 = 1 - 2</code> yields <code>1 = -1</code>, which is false. 
The only valid solution is 4. The SAT heavily engineers traps to see if you skip this verification step.</p>

<h2>The Undefined Denominator Trap</h2>

<div style="text-align: center; margin: 48px 0;">
  <!-- Placeholder -->
  <img src="/assets/images/nonlinear-equations_traps.png" alt="Traps: The Extraneous Root, Dividing by Zero" style="max-width: 80%; margin: 40px auto; display: block; border-radius: 12px; border: 1px solid var(--learn-border); box-shadow: 0 4px 16px rgba(0,0,0,0.05);" onerror="this.style.display='none'" />
  <p style="font-size: 0.85rem; color: var(--learn-text-muted); margin-top: 12px; font-style: italic;">Before solving rational equations, identify the fatal numbers.</p>
</div>

<p>The <strong style="color: var(--learn-accent-rose)">Division by Zero Trap</strong>: 
If an equation features a fraction like <code>1 / (x - 3)</code>, you must instantly recognize that 
x can never, under any circumstances, equal 3. The SAT will offer a complex algebraic setup where 
one of the derived "answers" is 3. Pick it, and you've fallen into the trap. Establish the fatal 
numbers before you solve the math.</p>
`,
    keyStrategies: [
      "The 'How Many' Shortcut: Never solve a quadratic if the question only asks 'How many real solutions are there?'. Just calculate b^2 - 4ac. Positive=2, Zero=1, Negative=0.",
      "The Answer Check Guardrail: For any equation containing a square root or a fraction with 'x' in the denominator, you are administratively required to plug your final answers back to the original equation.",
      "Desmos Root Finding: If the question asks for the sum of solutions to a complex polynomial, type it into Desmos, click the x-intercepts, and manually add them."
    ],
    commonMistakes: [
      "Squaring a binomial incorrectly. (e.g., expanding (x-2)^2 as x^2 - 4 instead of x^2 - 4x + 4).",
      "Forgetting to move all terms to one side of an equation before factoring.",
      "Selecting an extraneous solution because it appeared during the algebraic derivation."
    ],
    studyTips: [
      "Symmetry Formula Practice: Memorize the formula for the sum of roots (-b/a). The SAT loves asking for the sum of solutions precisely to trap students who try to find the roots individually using the full quadratic formula.",
      "Extraneous Drill: Solve 10 radical equations, actively highlighting the step where you check the answers against the original equation."
    ]
  },
  {
    subcategoryId: 'equivalent-expressions',
    difficulty: 'Advanced — Polynomial Manipulation',
    estimatedStudyTime: '1.5 Hours',
    overview: `
<h2>Equivalent Expressions: The Mastery of Disguise</h2>

<p>The SAT recognizes that a single mathematical truth can wear multiple disguises. 
<strong style="color: var(--learn-accent-blue)">Equivalent Expressions</strong> questions present a complex, 
messy polynomial or rational expression and ask you to select an answer choice that represents the exact 
same mathematical value, just written in a different layout. This section is a pure test of your 
algebraic manipulation mechanics.</p>

<div style="text-align: center; margin: 48px 0;">
  <!-- Placeholder -->
  <img src="/assets/images/equivalent-expressions_concept.png" alt="Concept: Polynomial expansion, factoring, and exponent rules" style="max-width: 80%; margin: 40px auto; display: block; border-radius: 12px; border: 1px solid var(--learn-border); box-shadow: 0 4px 16px rgba(0,0,0,0.05);" onerror="this.style.display='none'" />
  <p style="font-size: 0.85rem; color: var(--learn-text-muted); margin-top: 12px; font-style: italic;">Equivalence means that no matter what value of x you plug in, the top expression and the bottom expression yield the same number.</p>
</div>

<h2>The Laws of Exponents</h2>

<p>A massive portion of this category relies on an absolute mastery of exponent mechanics. 
If you hesitate on these rules, you will lose to the clock.</p>

<div class="highlight-box">
  <ul style="margin-bottom: 0;">
    <li style="margin-bottom: 12px"><strong>Multiplication Add Rule:</strong> <code>x^a * x^b = x^(a+b)</code>. (Bases must match.)</li>
    <li style="margin-bottom: 12px"><strong>Power to a Power Rule:</strong> <code>(x^a)^b = x^(ab)</code>. (Exponents multiply.)</li>
    <li><strong>Fractional Exponent Rule:</strong> <code>x^(A/B)</code> is the B-th root of <code>x^A</code>. (The bottom number is in the root's "boot".)</li>
  </ul>
</div>

<h2>Polynomial Long Division (The Bypass Framework)</h2>

<div style="text-align: center; margin: 48px 0;">
  <!-- Placeholder -->
  <img src="/assets/images/equivalent-expressions_framework.png" alt="Framework: Finding equivalence via algebraic manipulation or strategic plugging" style="max-width: 80%; margin: 40px auto; display: block; border-radius: 12px; border: 1px solid var(--learn-border); box-shadow: 0 4px 16px rgba(0,0,0,0.05);" onerror="this.style.display='none'" />
  <p style="font-size: 0.85rem; color: var(--learn-text-muted); margin-top: 12px; font-style: italic;">When the SAT asks for an equivalent expression for a fraction, polynomial long division is the classic route.</p>
</div>

<p>When given a bulky fraction like <code>(x^2 + 5x + 6) / (x + 2)</code>, the SAT is testing your 
ability to factor the numerator and cancel components. If it factors cleanly, great. If not, you are 
required to understand the format of a remainder: <code>Quotient + Remainder/Divisor</code>.</p>

<p>If the algebraic long division is intimidating under pressure, you can use the <strong style="color: var(--learn-accent-teal)">Arbitrary Number Bypass</strong>:</p>
<p>Pick a simple random number for <em>x</em>, like <code>x = 2</code>. Plug it into the terrifying prompt expression. 
Let's say it evaluates to the number 14. Now plug <code>x = 2</code> into the four answer choices. The only 
answer choice that evaluates to 14 is the mathematically equivalent correct answer. (Note: Avoid picking x=0 or x=1, as they can cause accidental overlaps).</p>

<h2>Manipulation Engineering Traps</h2>

<div style="text-align: center; margin: 48px 0;">
  <!-- Placeholder -->
  <img src="/assets/images/equivalent-expressions_traps.png" alt="Traps: The Freshman's Dream, The Incomplete Distribution" style="max-width: 80%; margin: 40px auto; display: block; border-radius: 12px; border: 1px solid var(--learn-border); box-shadow: 0 4px 16px rgba(0,0,0,0.05);" onerror="this.style.display='none'" />
  <p style="font-size: 0.85rem; color: var(--learn-text-muted); margin-top: 12px; font-style: italic;">The SAT designs equivalent expressions that look visually similar but break fundamental arithmetic laws.</p>
</div>

<p>The <strong style="color: var(--learn-accent-rose)">Freshman's Dream Trap</strong>: 
Assuming that <code>(x + y)^2 = x^2 + y^2</code>. The SAT will ALWAYS include an answer choice targeting this specific illusion. The reality is that it must expand via FOIL to <code>x^2 + 2xy + y^2</code>.</p>
<p>The <strong style="color: var(--learn-accent-rose)">Illegal Canceling Trap</strong>: 
When looking at a fraction like <code>(3x + 9) / 3</code>, students will cross out the '3' on the x and ignore the 9. You can only cancel a denominator if it divides evenly into EVERY term in the numerator. The correct equivalence is <code>x + 3</code>.</p>
`,
    keyStrategies: [
      "The Fractional Exponent Translation: Immediately rewrite any fractional exponent as a radical, or any radical as a fractional exponent. They are the exact same thing in two different languages, and the answer choices usually require the translation.",
      "The 'Plug 2' Emergency Exit: If you completely black out on how to factor a polynomial or manipulate exponents, pick x=2, solve the prompt for a number, and find the answer choice that matches that number.",
      "Grouping by Term: When adding or subtracting massive polynomial chains, underline your x^2 terms in red, circle your x terms in blue, and box constants. Combine them separately. Do not try to hold it all in your head."
    ],
    commonMistakes: [
      "Distributing an exponent over addition. (x + 3)^2 is NOT x^2 + 9.",
      "Mismanaging negative exponents. A negative exponent does not make a number negative; it flips it into the denominator.",
      "Failing to distribute a subtraction sign across a second polynomial inside a parenthesis."
    ],
    studyTips: [
      "FOIL and Factor Drills: Practice taking complex quadratics like 3x^2 + 10x + 8, factoring them down, and then FOILing them back up until both directions feel entirely native.",
      "Exponent Rule Mastery Matrix: Fill out a blank grid of the 6 fundamental exponent rules perfectly three days in a row to ensure absolute structural recall."
    ]
  }
];

async function uploadBatch() {
  console.log('Beginning Batch 4 Advanced Math uploads...');
  for (const item of advancedMathContents) {
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
  console.log('Advanced Math batch complete.');
}

uploadBatch();
