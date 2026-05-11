/**
 * Upload Script: Batch 5 Data Analysis Content
 * Run with: node src/scripts/upload_batch5_data_analysis.js
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

const dataAnalysisContents = [
  {
    subcategoryId: 'ratios-rates-proportions',
    difficulty: 'Foundational — Multiplicative Logic',
    estimatedStudyTime: '1.5 Hours',
    overview: `
<h2>Ratios, Rates, and Proportions: The Math of Scaling</h2>

<p>A ratio is not just a fraction; it is a <strong style="color: var(--learn-accent-blue)">recipe</strong>. 
If a recipe calls for 2 cups of water for every 3 cups of flour, that relationship is unbreakable, whether 
you are baking for two people or two hundred. The SAT tests your ability to scale these recipes up or down 
without losing the fundamental relationship.</p>

<div style="text-align: center; margin: 48px 0;">
  <!-- Placeholder -->
  <img src="/assets/images/ratios-rates-proportions_concept.png" alt="Concept: Ratios as unbreakable recipes that scale up" style="max-width: 80%; margin: 40px auto; display: block; border-radius: 12px; border: 1px solid var(--learn-border); box-shadow: 0 4px 16px rgba(0,0,0,0.05);" onerror="this.style.display='none'" />
  <p style="font-size: 0.85rem; color: var(--learn-text-muted); margin-top: 12px; font-style: italic;">Scaling: The internal ratio (A to B) must equal the external ratio (New A to New B).</p>
</div>

<h2>The Part-to-Whole Conversion</h2>

<p>The most devastating mistake students make with ratios is confusing a "part-to-part" ratio with a 
"part-to-whole" ratio. If the ratio of boys to girls in a class is 2:3, the fraction of the class that 
is boys is NOT <code>2/3</code>.</p>

<div class="highlight-box">
  <ul style="margin-bottom: 0;">
    <li style="margin-bottom: 12px"><strong>Part-to-Part:</strong> Boys (2) : Girls (3).</li>
    <li style="margin-bottom: 12px"><strong>The Hidden Whole:</strong> Total Parts = 2 + 3 = 5.</li>
    <li><strong>Part-to-Whole:</strong> Boys are <code>2/5</code> of the total. Girls are <code>3/5</code> of the total.</li>
  </ul>
</div>

<p>If the SAT tells you there are 30 total students, you do not multiply 30 by 2/3. You multiply it by 
the true part-to-whole fraction: <code>30 * (2/5) = 12 boys</code>.</p>

<h2>The Unit Matching Framework</h2>

<div style="text-align: center; margin: 48px 0;">
  <!-- Placeholder -->
  <img src="/assets/images/ratios-rates-proportions_framework.png" alt="Framework: Setting up proportions with matching units" style="max-width: 80%; margin: 40px auto; display: block; border-radius: 12px; border: 1px solid var(--learn-border); box-shadow: 0 4px 16px rgba(0,0,0,0.05);" onerror="this.style.display='none'" />
  <p style="font-size: 0.85rem; color: var(--learn-text-muted); margin-top: 12px; font-style: italic;">Apples over Oranges = Apples over Oranges. Never cross the streams.</p>
</div>

<p>When solving a proportion (e.g., Cross-Multiplication), the algebra never fails, but the setup often does. 
To guarantee success, explicitly write the units next to the numbers before you cross-multiply.</p>
<p><strong style="color: var(--learn-accent-teal)">Correct Setup:</strong> <code>(3 miles / 2 hours) = (x miles / 5 hours)</code></p>
<p><strong style="color: var(--learn-accent-rose)">Fatal Setup:</strong> <code>(3 miles / 2 hours) = (5 hours / x miles)</code></p>
<p>If the units physically match horizontally (miles across from miles, hours across from hours), you cannot get the problem wrong.</p>

<h2>Scale Factor Traps in Geometry</h2>

<div style="text-align: center; margin: 48px 0;">
  <!-- Placeholder -->
  <img src="/assets/images/ratios-rates-proportions_traps.png" alt="Traps: The Square Factor Trap, The Part-to-Part Trap" style="max-width: 80%; margin: 40px auto; display: block; border-radius: 12px; border: 1px solid var(--learn-border); box-shadow: 0 4px 16px rgba(0,0,0,0.05);" onerror="this.style.display='none'" />
  <p style="font-size: 0.85rem; color: var(--learn-text-muted); margin-top: 12px; font-style: italic;">Length scales by 'x'. Area scales by 'x squared'. Volume scales by 'x cubed'.</p>
</div>

<p>The <strong style="color: var(--learn-accent-rose)">Dimensional Scale Trap</strong>: 
If the SAT tells you that Triangle B has side lengths that are 3 times longer than Triangle A, they will ask you for the ratio of their AREAS. The trap answer is 1:3. Because Area is 2-dimensional (length × width), the scale factor must be squared. The true area ratio is 1:9. (Volume would be cubed, 1:27).</p>
`,
    keyStrategies: [
      "The Multiplier Shortcut: If the ratio is 4:7 and you know the '4' group actually has 24 people, find the internal multiplier (4 * 6 = 24). Then immediately multiply the other side by the same multiplier (7 * 6 = 42).",
      "Always Write the 'Total' Column: Whenever given a ratio word problem (Cats, Dogs, Birds = 2:3:5), instantly add a fourth item to your scratchpad: Total = 10. You will almost always need it.",
      "The Label Check: Before crossing multiplying fractional equivalencies, physically draw a line between the top left unit and the top right unit to ensure they match."
    ],
    commonMistakes: [
      "Multiplying a total population by a part-to-part fraction instead of part-to-whole.",
      "Assuming that if a length doubles, its area also doubles.",
      "Setting up a rate equation upside down because the word problem gave the units in reverse alphabetical order."
    ],
    studyTips: [
      "Dimensional Analysis Drills: Practice taking a 1D scale factor (e.g., 'scaled up by 4') and instantly writing down the 2D area scale factor (16) and 3D volume scale factor (64).",
      "Adding the 'X': When given a ratio like 3:5, practice rewriting it immediately as 3x and 5x. This reminds you that 3 and 5 are not absolute numbers, they are scaled amounts."
    ]
  },
  {
    subcategoryId: 'percentages',
    difficulty: 'Intermediate — Compound Growth and Decay',
    estimatedStudyTime: '1.5 Hours',
    overview: `
<h2>Percentages: The Translation of 'Of' and 'Is'</h2>

<p>Percentage word problems are the SAT's most reliable trap mechanisms. They rely on the fact that the human 
brain struggles to process compounded changes intuitively. If a stock drops 50% and then goes up 50%, your 
brain desperately wants the answer to be "back to original." But mathematically, it isn't. You must abandon 
intuition and translate the English purely into algebraic multipliers.</p>

<div style="text-align: center; margin: 48px 0;">
  <!-- Placeholder -->
  <img src="/assets/images/percentages_concept.png" alt="Concept: The '1 + rate' multiplier system" style="max-width: 80%; margin: 40px auto; display: block; border-radius: 12px; border: 1px solid var(--learn-border); box-shadow: 0 4px 16px rgba(0,0,0,0.05);" onerror="this.style.display='none'" />
  <p style="font-size: 0.85rem; color: var(--learn-text-muted); margin-top: 12px; font-style: italic;">Never calculate the 'change' and add it back. Calculate the 'remaining' directly.</p>
</div>

<h2>The Multiplier Translation Framework</h2>

<p>Never tackle percentages in two steps (e.g., finding 20% of 80, then adding it to 80). Every percentage 
change can, and must, be written as a single multiplier:</p>

<div class="highlight-box">
  <ul style="margin-bottom: 0;">
    <li style="margin-bottom: 12px"><strong>To INCREASE by 20%:</strong> Multiply by <code>1.20</code>. (You keep 100% and add 20%).</li>
    <li style="margin-bottom: 12px"><strong>To DECREASE by 20%:</strong> Multiply by <code>0.80</code>. (You lose 20%, so you keep 80%).</li>
    <li><strong>"20% OF X":</strong> Multiply <code>0.20 * X</code>.</li>
  </ul>
</div>

<p>When translating word problems, physically cross out the word <strong style="color: var(--learn-accent-teal)">"is"</strong> 
and write an equals sign (<code>=</code>). Cross out the word <strong style="color: var(--learn-accent-blue)">"of"</strong> 
and write a multiplication sign (<code>*</code>). "40 is 20% of X" becomes <code>40 = 0.20 * X</code>.</p>

<h2>The Compound Event Matrix</h2>

<div style="text-align: center; margin: 48px 0;">
  <!-- Placeholder -->
  <img src="/assets/images/percentages_framework.png" alt="Framework: Chain of multipliers for sequential percentage changes" style="max-width: 80%; margin: 40px auto; display: block; border-radius: 12px; border: 1px solid var(--learn-border); box-shadow: 0 4px 16px rgba(0,0,0,0.05);" onerror="this.style.display='none'" />
  <p style="font-size: 0.85rem; color: var(--learn-text-muted); margin-top: 12px; font-style: italic;">Sequential changes must be chained by multiplication, never addition.</p>
</div>

<p>When multiple percentage changes happen in a row, string the multipliers together. If a $100 jacket is discounted 
by 20%, then taxed at 10%, the equation is not 100 - 10%. It is chained:</p>
<p><code>Final Price = 100 * (0.80) * (1.10)</code></p>
<p>This evaluates to $88. (Notice that 0.80 * 1.10 = 0.88, which is a net 12% drop, not the intuitive 10% drop).</p>

<h2>The Base Reversal Trap</h2>

<div style="text-align: center; margin: 48px 0;">
  <!-- Placeholder -->
  <img src="/assets/images/percentages_traps.png" alt="Traps: Additive Fallacy, The Reverse Base Trap" style="max-width: 80%; margin: 40px auto; display: block; border-radius: 12px; border: 1px solid var(--learn-border); box-shadow: 0 4px 16px rgba(0,0,0,0.05);" onerror="this.style.display='none'" />
  <p style="font-size: 0.85rem; color: var(--learn-text-muted); margin-top: 12px; font-style: italic;">If X is 50% larger than Y, then Y is 33% smaller than X. The base matters.</p>
</div>

<p>The <strong style="color: var(--learn-accent-rose)">Reverse Base Trap</strong> is the hardest concept in this section. 
The question states: "A $60 shirt includes a 20% markup." Students wrongly calculate 20% of $60 ($12) and subtract it to get $48. 
This is algebraically fatal. The 20% markup was applied to the <em>unknown original price</em>, not the final price.</p>
<p>The correct algebra: <code>Original * 1.20 = 60</code>. Therefore, Original = <code>60 / 1.20 = 50</code>.</p>
`,
    keyStrategies: [
      "The 'Of / Is' Translation: The word 'of' mathematically means multiply. The word 'is' means equals. 'What is 15% of 30?' translates exactly to 'X = .15 * 30'.",
      "The Pick-100 Strategy: If a problem has percentages but no actual concrete numbers (e.g., 'If radius increases by 10%, how much does area increase?'), simply invent the number 100 as your starting value. Math it out, and the final difference from 100 is your exact percentage answer.",
      "The Single Multiplier Rule: Never calculate a discount by doing 'Original - (Original * rate)'. Just do 'Original * (1 - rate)'. It saves time and prevents order-of-operation errors."
    ],
    commonMistakes: [
      "Adding sequential percentages (e.g., 20% off plus 10% off = 30% off). In reality, it's 0.80 * 0.90 = 0.72 (28% off).",
      "Applying a discount to the final price instead of the original initial price.",
      "Confusing '50% more than' (multiplier 1.5) with 'is 50% of' (multiplier 0.5)."
    ],
    studyTips: [
      "Algebraic Translation Practice: Write out 20 English sentence structures ('30% less than X is Y', 'Z is 40% of W') and practice converting them instantly into algebra.",
      "Reverse Engineering: Practice dividing by multipliers. Tell yourself: 'If the price with 8% tax is $108, the original price was 108 / 1.08 = 100.'"
    ]
  },
  {
    subcategoryId: 'units-and-quantities',
    difficulty: 'Intermediate — Dimensional Analysis',
    estimatedStudyTime: '1 Hour',
    overview: `
<h2>Units and Quantities: The Cancellation Rail</h2>

<p>Unit conversions can turn into chaotic guesswork if you try to memorize whether to multiply or divide. 
The fool-proof, un-failable method for the SAT is <strong style="color: var(--learn-accent-blue)">Dimensional Analysis</strong> 
(also known as the "Railroad Method"). You don't multiply numbers; you cancel words. Let the units guide the math.</p>

<div style="text-align: center; margin: 48px 0;">
  <!-- Placeholder -->
  <img src="/assets/images/units-and-quantities_concept.png" alt="Concept: Dimensional analysis as a sequence of canceling words" style="max-width: 80%; margin: 40px auto; display: block; border-radius: 12px; border: 1px solid var(--learn-border); box-shadow: 0 4px 16px rgba(0,0,0,0.05);" onerror="this.style.display='none'" />
  <p style="font-size: 0.85rem; color: var(--learn-text-muted); margin-top: 12px; font-style: italic;">If the word 'minutes' is on top and 'minutes' is on bottom, cross them out. The words dictate whether you multiply or divide.</p>
</div>

<h2>The Railroad Framework</h2>

<p>Every complex conversion (e.g., turning miles-per-hour into feet-per-second) can be solved by setting up 
a long fraction multiplication chain.</p>

<div class="highlight-box">
  <ul style="margin-bottom: 0;">
    <li style="margin-bottom: 12px"><strong>Step 1: Write the given.</strong> Example: <code>(60 miles / 1 hour)</code>.</li>
    <li style="margin-bottom: 12px"><strong>Step 2: Kill the top unit.</strong> To get rid of 'miles', the next fraction must have 'miles' on the BOTTOM. <code>* (5280 feet / 1 mile)</code>. The word 'miles' cancels out. You now have feet/hour.</li>
    <li><strong>Step 3: Kill the bottom unit.</strong> To get rid of 'hour', the next fraction must have 'hours' on the TOP. <code>* (1 hour / 60 mins)</code>. Then <code>* (1 min / 60 secs)</code>.</li>
  </ul>
</div>

<p>You never have to guess whether to divide or multiply by 60. The physical placement of the words answers the question for you.</p>

<h2>The Secret Density and Speed Equations</h2>

<div style="text-align: center; margin: 48px 0;">
  <!-- Placeholder -->
  <img src="/assets/images/units-and-quantities_framework.png" alt="Framework: D=RT and Density triangles" style="max-width: 80%; margin: 40px auto; display: block; border-radius: 12px; border: 1px solid var(--learn-border); box-shadow: 0 4px 16px rgba(0,0,0,0.05);" onerror="this.style.display='none'" />
  <p style="font-size: 0.85rem; color: var(--learn-text-muted); margin-top: 12px; font-style: italic;">Memorize the fundamental physics formulas that govern unit questions: Distance = Rate * Time.</p>
</div>

<p>The SAT expects you to have two basic "unit relationship" formulas memorized blindly:</p>
<p><strong style="color: var(--learn-accent-teal)">Distance = Rate × Time (D = RT):</strong> If given a speed and a time, multiply them. Be deeply paranoid about ensuring the 'time' unit matches the rate's time unit (e.g., hours vs minutes).</p>
<p><strong style="color: var(--learn-accent-blue)">Density = Mass / Volume (D = M/V):</strong> If they give you grams and cubic centimeters, you are doing a density problem. Do not flip mass and volume.</p>

<h2>Advanced Dimensional Traps</h2>

<div style="text-align: center; margin: 48px 0;">
  <!-- Placeholder -->
  <img src="/assets/images/units-and-quantities_traps.png" alt="Traps: The Square Area Conversion, The Mismatched Unit, The Unstated Assumption" style="max-width: 80%; margin: 40px auto; display: block; border-radius: 12px; border: 1px solid var(--learn-border); box-shadow: 0 4px 16px rgba(0,0,0,0.05);" onerror="this.style.display='none'" />
  <p style="font-size: 0.85rem; color: var(--learn-text-muted); margin-top: 12px; font-style: italic;">Converting square inches to square feet requires you to divide by 144, not 12.</p>
</div>

<p>The <strong style="color: var(--learn-accent-rose)">Area/Volume Conversion Trap</strong>: 
If 1 yard = 3 feet, students routinely assume 1 square yard = 3 square feet. This is mathematically and hopelessly wrong. Area is 2D. 1 square yard = (3 ft × 3 ft) = 9 square feet. For volume, 1 cubic yard = 27 cubic feet. The SAT will test this ruthlessly.</p>

<p>The <strong style="color: var(--learn-accent-rose)">Mismatched 'D=RT' Trap</strong>: 
A car travels at 60 miles per hour for 45 minutes. How far did it go? The bait answer is <code>60 * 45 = 2700</code>. But the rate is in hours and the time is in minutes. You must convert 45 minutes to 0.75 hours before multiplying.</p>
`,
    keyStrategies: [
      "The Word Cancellation Rule: Never perform a calculation on the SAT without physically writing the units next to the numbers. If the final unit surviving the algebra isn't the unit asked for by the question, your setup was wrong.",
      "The Area Conversion Highlight: Draw a massive star next to any question that asks you to convert square inches, square feet, or cubic dimensions. It is an immediate signal to square the base conversion factor.",
      "The Triangle Shortcut: For D=RT and D=M/V, draw the classic physics triangle with the product on top. If you want Density, cover the D with your thumb; you are left with M over V."
    ],
    commonMistakes: [
      "Dividing when you should multiply, and vice versa, because you tried to 'mental math' a conversion.",
      "Using a 1D length conversion (1 ft = 12 in) for a 2D area problem.",
      "Failing to standardize units (e.g. feet and miles) before plugging them into a single equation."
    ],
    studyTips: [
      "The Railroad Drill: Practice converting absurd fake units. 'If 3 borps = 4 flarps, and 2 flarps = 5 glarps, how many glarps are in 6 borps?' Writing this out forces reliance on the method, not intuition.",
      "Highlight the Target: The moment a question ends with 'in liters', highlight the word 'liters'. Don't calculate the answer in milliliters and move on."
    ]
  },
  {
    subcategoryId: 'two-variable-data',
    difficulty: 'Foundational — Trend Identification',
    estimatedStudyTime: '1 Hour',
    overview: `
<h2>Data and Scatterplots: Reading the Noise</h2>

<p>In life, data is messy. Scatterplots represent the attempt to draw a rigid mathematical line through 
chaotic real-world observation. The SAT uses scatterplots to test your understanding of 
<strong style="color: var(--learn-accent-blue)">Lines of Best Fit</strong>, slope interpretation in 
context, and the critical difference between empirical data points and predictive models.</p>

<div style="text-align: center; margin: 48px 0;">
  <!-- Placeholder -->
  <img src="/assets/images/data-and-scatterplots_concept.png" alt="Concept: Scatterplot with Line of Best Fit highlighting Model vs Reality" style="max-width: 80%; margin: 40px auto; display: block; border-radius: 12px; border: 1px solid var(--learn-border); box-shadow: 0 4px 16px rgba(0,0,0,0.05);" onerror="this.style.display='none'" />
  <p style="font-size: 0.85rem; color: var(--learn-text-muted); margin-top: 12px; font-style: italic;">The dots are reality. The line is a prediction. Do not confuse the two.</p>
</div>

<h2>The Anatomy of the Best Fit Model</h2>

<p>Every scatterplot on the SAT will have a "Line of Best Fit" drawn through it. You must understand 
precisely what this line represents grammatically:</p>

<div class="highlight-box">
  <ul style="margin-bottom: 0;">
    <li style="margin-bottom: 12px"><strong>The Y-Intercept:</strong> The predicted value when the x-axis variable is strictly zero. Often, this is a theoretical concept that might not make logical sense (e.g., a baby predicting to weigh 3 pounds at 0 months gestation).</li>
    <li style="margin-bottom: 12px"><strong>The Slope:</strong> The predicted rate of change. "For every increase of 1 in the x-axis, the model predicts an increase of 'm' in the y-axis."</li>
    <li><strong>The Gap (Residual):</strong> The vertical distance between an actual dot and the solid line. This is the difference between reality and the prediction.</li>
  </ul>
</div>

<h2>The Context Interpretation Framework</h2>

<div style="text-align: center; margin: 48px 0;">
  <!-- Placeholder -->
  <img src="/assets/images/data-and-scatterplots_framework.png" alt="Framework: Finding the slope, verifying the intercept, reading the gap" style="max-width: 80%; margin: 40px auto; display: block; border-radius: 12px; border: 1px solid var(--learn-border); box-shadow: 0 4px 16px rgba(0,0,0,0.05);" onerror="this.style.display='none'" />
  <p style="font-size: 0.85rem; color: var(--learn-text-muted); margin-top: 12px; font-style: italic;">Look closely at the word 'predicted' versus 'actual' in answer choices.</p>
</div>

<p>The SAT frequently provides the equation for the line of best fit (e.g., <code>y = 3.2x + 14</code>) and 
asks you "Which of the following describes the meaning of the number 3.2?"</p>
<p>You must map the math to the english. The slope (3.2) is the <em>change in y</em> over the <em>change in x</em>. 
If Y is dollars and X is hours, then 3.2 means "an increase of 3.2 dollars for every 1 hour added."</p>

<h2>Scatterplot Engineering Traps</h2>

<div style="text-align: center; margin: 48px 0;">
  <!-- Placeholder -->
  <img src="/assets/images/data-and-scatterplots_traps.png" alt="Traps: The Exact vs Predicted Phrase, The Outlier Illusion, Axis Skips" style="max-width: 80%; margin: 40px auto; display: block; border-radius: 12px; border: 1px solid var(--learn-border); box-shadow: 0 4px 16px rgba(0,0,0,0.05);" onerror="this.style.display='none'" />
  <p style="font-size: 0.85rem; color: var(--learn-text-muted); margin-top: 12px; font-style: italic;">The word 'always' is almost universally incorrect when dealing with human or natural data models.</p>
</div>

<p>The <strong style="color: var(--learn-accent-rose)">Certainty Trap</strong>: 
Answer choices that use words like "always", "guarantees", or "proves" are traps. The line of best fit is merely an average prediction. Correct answers use words like "predicts", "estimates", or "tends to".</p>

<p>The <strong style="color: var(--learn-accent-rose)">Actual vs. Predicted Mix-up</strong>: 
The question asks: "According to the line of best fit, what is the value at x=4?" A student looks at the graph, sees an actual dot hovering way above the line at x=4, and picks that dot's value. That is the actual value, NOT the predicted value. You must pull the number exclusively from the line.</p>

<p>The <strong style="color: var(--learn-accent-rose)">Hidden Origin Trap</strong>: 
You try to find the y-intercept by looking at the far left edge of the graph, but you don't notice that the x-axis starts at 10, not 0. You must manually trace or calculate backwards to x=0 to find the true mathematical intercept.</p>
`,
    keyStrategies: [
      "The 'Predicted' Filter: When evaluating answer choices about the line of best fit, instantly eliminate any choice that claims the relationship is exact or guaranteed. The line only 'predicts' or 'estimates'.",
      "Always Check the Axes: Before doing any analysis, explicitly look at the bottom-left corner of the graph. Ensure both the X and Y axes start at zero. If they don't, visual intuition of the y-intercept is compromised.",
      "The Residual Measure: If asked for the difference between actual and expected, draw a perfectly vertical line from the dot to the line of best fit. The length of that line is the answer."
    ],
    commonMistakes: [
      "Selecting an actual data point when the question asked for the model's prediction.",
      "Assuming the slope indicates a rigid, unbending law of physics rather than a statistical trend.",
      "Misreading the slope by counting visual grid squares instead of referencing the numerical scale of the axes."
    ],
    studyTips: [
      "Slope Translation Drills: Find 10 scatterplots. Without looking at the questions, practice verbally stating: 'For every 1 unit increase in [X-axis label], the model predicts a [slope value] unit increase in [Y-axis label].'",
      "Origin Checking: Make it a reflex to draw a red box around the bottom-left corner of a graph to verify the scale starts at 0,0."
    ]
  },
  {
    subcategoryId: 'probability',
    difficulty: 'Intermediate — Conditional Logic',
    estimatedStudyTime: '1 Hour',
    overview: `
<h2>Two-Way Tables and Probability: The Numerator and the Denominator</h2>

<p>Categorical data and basic probability on the SAT are not tests of complex combinatorics. They are 
ruthless tests of <strong style="color: var(--learn-accent-blue)">reading comprehension</strong>. Every 
probability question boils down to a single fraction: <code>Target / Total</code>. The entire difficulty of 
the question lies in manipulating the language to change exactly which "Total" you are allowed to pull from.</p>

<div style="text-align: center; margin: 48px 0;">
  <!-- Placeholder -->
  <img src="/assets/images/two-way-tables-probability_concept.png" alt="Concept: Isolating the Denominator in a Two-Way Table" style="max-width: 80%; margin: 40px auto; display: block; border-radius: 12px; border: 1px solid var(--learn-border); box-shadow: 0 4px 16px rgba(0,0,0,0.05);" onerror="this.style.display='none'" />
  <p style="font-size: 0.85rem; color: var(--learn-text-muted); margin-top: 12px; font-style: italic;">Before you calculate the numerator, you must explicitly circle the denominator in the table.</p>
</div>

<h2>The Denominator Isolation Protocol</h2>

<p>The English language sets the rules for the denominator. Pay attention to the phrases "Given that," "If," or "Of those."</p>

<div class="highlight-box">
  <ul style="margin-bottom: 0;">
    <li style="margin-bottom: 12px"><strong>Global Probability:</strong> "What is the probability that a randomly chosen person is a Left-Handed Male?" The denominator is the absolute Grand Total of everyone.</li>
    <li style="margin-bottom: 12px"><strong>Conditional Probability:</strong> "<strong>Given that</strong> the person chosen is Male, what is the probability they are Left-Handed?" The denominator shrinks. You are now ONLY looking at the 'Male' row total. Ignore everything else in the table.</li>
    <li><strong>Reverse Conditional:</strong> "If a Left-Handed person is chosen, what is the probability they are Male?" The denominator shrinks to the 'Left-Handed' column total.</li>
  </ul>
</div>

<p>Setting the right denominator constitutes 95% of solving the problem.</p>

<h2>The Structural Math of Independence</h2>

<div style="text-align: center; margin: 48px 0;">
  <!-- Placeholder -->
  <img src="/assets/images/two-way-tables-probability_framework.png" alt="Framework: Verifying statistical independence through proportional rows" style="max-width: 80%; margin: 40px auto; display: block; border-radius: 12px; border: 1px solid var(--learn-border); box-shadow: 0 4px 16px rgba(0,0,0,0.05);" onerror="this.style.display='none'" />
  <p style="font-size: 0.85rem; color: var(--learn-text-muted); margin-top: 12px; font-style: italic;">Independence means the internal ratio of the columns remains identical across all rows.</p>
</div>

<p>Occasionally, the SAT asks if two variables in a table are "independent." Two variables are independent 
if being in one category does not change the probability of being in the other.</p>
<p>To check this quickly: Is the ratio of Males to Females the exact same among Left-Handers as it is among Right-Handers? 
If the proportions match, the variables are independent. If they differ, the variables are associated/dependent.</p>

<h2>Conditional Filtering Traps</h2>

<div style="text-align: center; margin: 48px 0;">
  <!-- Placeholder -->
  <img src="/assets/images/two-way-tables-probability_traps.png" alt="Traps: The Grand Total Trap, The Numerator Mix-Up" style="max-width: 80%; margin: 40px auto; display: block; border-radius: 12px; border: 1px solid var(--learn-border); box-shadow: 0 4px 16px rgba(0,0,0,0.05);" onerror="this.style.display='none'" />
  <p style="font-size: 0.85rem; color: var(--learn-text-muted); margin-top: 12px; font-style: italic;">The SAT designs answer choices for students who ignore the conditional "given that" clause.</p>
</div>

<p>The <strong style="color: var(--learn-accent-rose)">Grand Total Trap</strong>: 
A question asks "Of the patients who received the placebo, what fraction recovered?" The student reads "what fraction recovered" and puts the total number of recovered patients over the Grand Total of all participants. But the phrase "Of the patients who received the placebo" limited the universe. The true denominator is just the Placebo Total.</p>

<p>The <strong style="color: var(--learn-accent-rose)">Missing Info Trap</strong>: 
If a table has missing cells, do not panic. Two-way tables are just Sudoku puzzles. Every row must sum to its Row Total, and every column must sum to its Column Total. You can algebraically reconstruct any missing box.</p>
`,
    keyStrategies: [
      "The 'Of' Circle: The moment you read a probability question, draw a circle around the group specified by 'given that', 'if', or 'of the'. Physically trace that column or row on the table. Your denominator lives at the end of that specific trace. Nothing else exists.",
      "The Fraction-to-Decimal Translation: The Digital SAT frequently relies on decimal or percentage answers for probability rather than reduced fractions. If your fraction is 15/45, immediately type it into the calculator to get 0.33.",
      "Sudoku Table Fill: Before answering any questions about a table with empty cells, spend 10 seconds filling in the missing totals using basic addition/subtraction. It provides safety."
    ],
    commonMistakes: [
      "Using the grand total as the denominator for a conditional probability question.",
      "Providing the probability of event A when asked for the probability of A AND B.",
      "Mixing up rows and columns when tracking a highly specific overlapping demographic."
    ],
    studyTips: [
      "The Pre-Highlight Check: Practicing reading probability word problems and highlighting ONLY the constraint (the denominator group) in yellow. Get the foundation right before looking at the target.",
      "Mental Independence Test: Practice looking at small 2x2 grids and verifying whether the relationship is proportional (independent) or skewed (dependent)."
    ]
  },
  {
    subcategoryId: 'one-variable-data',
    difficulty: 'Foundational — Center and Spread',
    estimatedStudyTime: '1 Hour',
    overview: `
<h2>Statistics: Mean, Median, and The Vulnerability to Outliers</h2>

<p>The SAT assesses Descriptive Statistics not through complex calculations, but through conceptual 
understanding. You need to know <strong style="color: var(--learn-accent-blue)">what happens to the Mean and 
the Median when a dataset is disrupted</strong>. The core logic of this section is navigating the vulnerability 
of averages to extreme numbers.</p>

<div style="text-align: center; margin: 48px 0;">
  <!-- Placeholder -->
  <img src="/assets/images/statistics-mean-median-mode_concept.png" alt="Concept: The Mean as a balance scale, the Median as a physical center line" style="max-width: 80%; margin: 40px auto; display: block; border-radius: 12px; border: 1px solid var(--learn-border); box-shadow: 0 4px 16px rgba(0,0,0,0.05);" onerror="this.style.display='none'" />
  <p style="font-size: 0.85rem; color: var(--learn-text-muted); margin-top: 12px; font-style: italic;">The Mean is pulled by gravity (outliers). The Median is an anchored physical position (the middle).</p>
</div>

<h2>The Core Metrics of Center</h2>

<div class="highlight-box">
  <ul style="margin-bottom: 0;">
    <li style="margin-bottom: 12px"><strong>Mean (Average):</strong> The sum of all values divided by the count. It is highly sensitive to outliers. If Bill Gates walks into a room of teachers, the <em>mean</em> income skyrockets.</li>
    <li style="margin-bottom: 12px"><strong>Median:</strong> The physical middle number when ranked from lowest to highest. It is resistant to outliers. If Bill Gates walks into that same room, the <em>median</em> income barely changes.</li>
    <li><strong>Mode:</strong> The most frequently occurring number. Rarely tested heavily, except in bar charts.</li>
  </ul>
</div>

<p>If a frequency table shows a cluster of data around 5, and one extreme data point at 100, the Mean will be significantly higher than the Median. 
<strong style="color: var(--learn-accent-teal)">The Mean always chases the Outlier.</strong></p>

<h2>The Standard Deviation Intuition</h2>

<div style="text-align: center; margin: 48px 0;">
  <!-- Placeholder -->
  <img src="/assets/images/statistics-mean-median-mode_framework.png" alt="Framework: Standard Deviation visualizer: Clustered vs Spread Out" style="max-width: 80%; margin: 40px auto; display: block; border-radius: 12px; border: 1px solid var(--learn-border); box-shadow: 0 4px 16px rgba(0,0,0,0.05);" onerror="this.style.display='none'" />
  <p style="font-size: 0.85rem; color: var(--learn-text-muted); margin-top: 12px; font-style: italic;">Standard deviation is purely a measure of "spread." It does not care about the actual numerical mean.</p>
</div>

<p>You will NEVER have to manually calculate standard deviation on the SAT. You only need to compare it visually.</p>
<p>If Dataset A has points clustered tightly together (e.g., all values are between 10 and 12), its standard deviation is low. 
If Dataset B is spread far apart (e.g., values ranging from 2 to 20), its standard deviation is high. 
If a constant is added to every number in a dataset, the mean increases, but the <strong style="color: var(--learn-accent-purple)">Standard Deviation stays exactly the same</strong> because the "spread" hasn't shifted.</p>

<h2>Frequency Table Traps</h2>

<div style="text-align: center; margin: 48px 0;">
  <!-- Placeholder -->
  <img src="/assets/images/statistics-mean-median-mode_traps.png" alt="Traps: The Frequency Ignorance Trap, The Midpoint Trap" style="max-width: 80%; margin: 40px auto; display: block; border-radius: 12px; border: 1px solid var(--learn-border); box-shadow: 0 4px 16px rgba(0,0,0,0.05);" onerror="this.style.display='none'" />
  <p style="font-size: 0.85rem; color: var(--learn-text-muted); margin-top: 12px; font-style: italic;">Do not average the categories. You must account for how many items are IN each category.</p>
</div>

<p>The <strong style="color: var(--learn-accent-rose)">Frequency Blindness Trap</strong>: 
A table lists scores (70, 80, 90) and their frequencies (1, 5, 2). To find the mean, a student simply adds (70+80+90)/3 = 80. This is fatal. You must multiply the score by its frequency: (70*1 + 80*5 + 90*2) / Total Quantity (8). You must weight the data.</p>

<p>The <strong style="color: var(--learn-accent-rose)">Sum of Differences Trick</strong>: 
Sometimes the SAT will give you the Mean, and state the values of 4 out of 5 data points. To find the missing point, construct the sum. If the average of 5 points is 10, the SUM of those points MUST be 50. Subtract the 4 known points from 50 to find the missing one. Do not try to balance it conceptually.</p>
`,
    keyStrategies: [
      "The Outlier Reflex: When asked to compare the Mean and Median of a dataset, immediately look for an outlier. If there's an outlier on the high end, Mean > Median. If there's an outlier on the low end, Mean < Median.",
      "The Median Position Formula: For a large table of ordered data, find the median by taking the total number of items, adding 1, and dividing by 2 (e.g., for 51 items, the Median is the 26th term). Then simply count up the frequencies until you hit the 26th item.",
      "The Substitution Trick: If the problem says 'If the highest value is removed, what happens to the mean/median?', don't calculate everything again. Intuitively recognize that removing a high outlier drastically lowers the mean, but barely shifts the median."
    ],
    commonMistakes: [
      "Calculating the average of the different categories without weighting them by their actual frequencies.",
      "Assuming Standard Deviation changes when a dataset is simply shifted up or down uniformly.",
      "Failing to put a list of random numbers in ascending numerical order before determining the median."
    ],
    studyTips: [
      "Sum Construction Practice: Practice immediately taking an 'average' and converting it into a 'total pool' (e.g., 'An average of 80 over 5 tests' means 'A total pool of 400 points'). This unlocks almost every missing-variable statistics question.",
      "Visual Spread Judgement: Look at 5 different dot plots and practice ranking them from lowest standard deviation to highest standard deviation in under 10 seconds."
    ]
  },
  {
    subcategoryId: 'evaluating-statistical-claims',
    difficulty: 'Advanced — Margin of Error and Causation',
    estimatedStudyTime: '1 Hour',
    overview: `
<h2>Evaluating Statistical Claims: Logic vs Assumption</h2>

<p>While the previous section tests statistical math, <strong style="color: var(--learn-accent-blue)">Evaluating Claims</strong> 
tests scientific rhetoric and mathematical ethics. You are asked to play the role of a peer-reviewer. The SAT 
presents an experiment, survey, or observational study, and your only job is to find the logical boundary of 
what is legally allowed to be concluded.</p>

<div style="text-align: center; margin: 48px 0;">
  <!-- Placeholder -->
  <img src="/assets/images/evaluating-statistical-claims_concept.png" alt="Concept: The boundary line between Correlation and Causation" style="max-width: 80%; margin: 40px auto; display: block; border-radius: 12px; border: 1px solid var(--learn-border); box-shadow: 0 4px 16px rgba(0,0,0,0.05);" onerror="this.style.display='none'" />
  <p style="font-size: 0.85rem; color: var(--learn-text-muted); margin-top: 12px; font-style: italic;">Just because two things rise together does not mean one caused the other. Observational studies only prove association.</p>
</div>

<h2>The Golden Rules of Inference</h2>

<p>To evaluate a statistical claim on the SAT, subject the study to these three tests:</p>

<div class="highlight-box">
  <ul style="margin-bottom: 0;">
    <li style="margin-bottom: 12px"><strong>1. Random Selection (Generalizability):</strong> If participants were chosen randomly from a specific population (e.g., "Mayor's list of registered voters"), the results ONLY apply to that population. You cannot generalize findings from a single town to the "entire country."</li>
    <li style="margin-bottom: 12px"><strong>2. Random Assignment (Causation):</strong> This is the holy grail. You can only prove CAUSATION if participants were randomly assigned to a Treatment Group and a Control Group in a controlled experiment. If you just observed them naturally, you only have Correlation/Association.</li>
    <li><strong>3. Sample Size vs. Bias:</strong> A small sample size leads to a large margin of error, but it does NOT create bias. Unrandomized selection (e.g., surveying people at a gym about health) creates bias.</li>
  </ul>
</div>

<h2>The Margin of Error Interpretation</h2>

<div style="text-align: center; margin: 48px 0;">
  <!-- Placeholder -->
  <img src="/assets/images/evaluating-statistical-claims_framework.png" alt="Framework: Interpreting the confidence interval using true score + or - the margin of error" style="max-width: 80%; margin: 40px auto; display: block; border-radius: 12px; border: 1px solid var(--learn-border); box-shadow: 0 4px 16px rgba(0,0,0,0.05);" onerror="this.style.display='none'" />
  <p style="font-size: 0.85rem; color: var(--learn-text-muted); margin-top: 12px; font-style: italic;">The margin of error isn't a mistake; it's the statistical "fuzziness" of representing a whole population with a smaller sample.</p>
</div>

<p>When the SAT says "The average was 45% with a margin of error of 3%," you must translate that to a 
<strong style="color: var(--learn-accent-teal)">Confidence Interval</strong>. The true population average 
is highly likely to live somewhere between 42% and 48%.</p>
<p>If an answer choice says "Exactly 45% of the population behaves this way," it is wrong. If it says 
"It is plausible that the true population average lies between 42% and 48%," it is correct.</p>

<h2>The Absolute Fraud Traps</h2>

<div style="text-align: center; margin: 48px 0;">
  <!-- Placeholder -->
  <img src="/assets/images/evaluating-statistical-claims_traps.png" alt="Traps: The Definite Causation Trap, The Generalization Trap" style="max-width: 80%; margin: 40px auto; display: block; border-radius: 12px; border: 1px solid var(--learn-border); box-shadow: 0 4px 16px rgba(0,0,0,0.05);" onerror="this.style.display='none'" />
  <p style="font-size: 0.85rem; color: var(--learn-text-muted); margin-top: 12px; font-style: italic;">The SAT tests if you will fall for bad science reporting.</p>
</div>

<p>The <strong style="color: var(--learn-accent-rose)">Definite Proof Trap</strong>: 
In the realm of statistics, words like "prove," "must," "certainly," and "always" are red flags. Statistical sampling is about probabilities, not absolute cosmic certainty. Always choose the answer with softer, academic hedging: "suggests," "likely," or "is plausible."</p>

<p>The <strong style="color: var(--learn-accent-rose)">Over-Generalization Trap</strong>: 
A researcher randomly selects 50 dogs from a local animal shelter and finds they love brand X food. The trap answer claims: "All dogs prefer brand X." It's wrong because 1) "All" is too extreme, and 2) the sample only represents dogs IN THAT SHELTER, not household pets globally.</p>

<p>The <strong style="color: var(--learn-accent-rose)">Observational Causation Trap</strong>: 
A study observes that people who drink green tea live longer. The trap answer says: "Drinking green tea causes longer life." But it wasn't a controlled, randomized experiment. It was just an observation. Maybe green tea drinkers also eat better diets. The only allowed conclusion is "Green tea drinking is associated with longer life."</p>
`,
    keyStrategies: [
      "The Verb Softener: When evaluating claims, instantly eliminate answer choices that use aggressive absolute verbs ('proves', 'guarantees', 'ensures'). Favor choices using the language of probability ('suggests', 'is likely that').",
      "The Boundary Check: Circle the exact population that was surveyed (e.g., '5th graders at Lincoln Middle School'). Eliminate any answer choice that applies the findings to a broader population (e.g., 'All 5th graders in the country').",
      "The Random Assignment Trigger: The moment you read the words 'randomly assigned into two groups,' mentally flag that causation CAN be established. If you do not see those words, causation is impossible."
    ],
    commonMistakes: [
      "Assuming that a larger sample size eliminates bias. (Even a poll of 1,000,000 people is biased if you only polled them outside of a specific political rally).",
      "Accepting a causal 'A causes B' claim from a survey or observational study.",
      "Misunderstanding Margin of Error as an indicator that the researchers made a mathematical mistake."
    ],
    studyTips: [
      "Methodology Triage: Whenever reading scientific news articles, practice asking: 'Was this observational or an experiment?' and 'Who was the population?' Train your brain to spot experimental flaws in the wild.",
      "Margin of Error Arithmetic: Practice instantly converting a mean and a margin of error into a 'safe zone range' [Mean - Margin, Mean + Margin]. The correct answer must only inhabit this zone."
    ]
  },
  {
    subcategoryId: 'inference-statistics',
    difficulty: 'Advanced — Margin of Error and Causation',
    estimatedStudyTime: '1 Hour',
    overview: `
<h2>Inference from Statistics: Logic vs Assumption</h2>

<p>While the previous section tests statistical math, <strong style="color: var(--learn-accent-blue)">Inference Statistics</strong> 
tests scientific rhetoric and mathematical ethics. You are asked to play the role of a peer-reviewer. The SAT 
presents an experiment, survey, or observational study, and your only job is to find the logical boundary of 
what is legally allowed to be concluded.</p>

<div style="text-align: center; margin: 48px 0;">
  <!-- Placeholder -->
  <img src="/assets/images/evaluating-statistical-claims_concept.png" alt="Concept: The boundary line between Correlation and Causation" style="max-width: 80%; margin: 40px auto; display: block; border-radius: 12px; border: 1px solid var(--learn-border); box-shadow: 0 4px 16px rgba(0,0,0,0.05);" onerror="this.style.display='none'" />
  <p style="font-size: 0.85rem; color: var(--learn-text-muted); margin-top: 12px; font-style: italic;">Just because two things rise together does not mean one caused the other. Observational studies only prove association.</p>
</div>

<h2>The Golden Rules of Inference</h2>

<p>To evaluate a statistical claim on the SAT, subject the study to these three tests:</p>

<div class="highlight-box">
  <ul style="margin-bottom: 0;">
    <li style="margin-bottom: 12px"><strong>1. Random Selection (Generalizability):</strong> If participants were chosen randomly from a specific population (e.g., "Mayor's list of registered voters"), the results ONLY apply to that population. You cannot generalize findings from a single town to the "entire country."</li>
    <li style="margin-bottom: 12px"><strong>2. Random Assignment (Causation):</strong> This is the holy grail. You can only prove CAUSATION if participants were randomly assigned to a Treatment Group and a Control Group in a controlled experiment. If you just observed them naturally, you only have Correlation/Association.</li>
    <li><strong>3. Sample Size vs. Bias:</strong> A small sample size leads to a large margin of error, but it does NOT create bias. Unrandomized selection (e.g., surveying people at a gym about health) creates bias.</li>
  </ul>
</div>

<h2>The Margin of Error Interpretation</h2>

<div style="text-align: center; margin: 48px 0;">
  <!-- Placeholder -->
  <img src="/assets/images/evaluating-statistical-claims_framework.png" alt="Framework: Interpreting the confidence interval using true score + or - the margin of error" style="max-width: 80%; margin: 40px auto; display: block; border-radius: 12px; border: 1px solid var(--learn-border); box-shadow: 0 4px 16px rgba(0,0,0,0.05);" onerror="this.style.display='none'" />
  <p style="font-size: 0.85rem; color: var(--learn-text-muted); margin-top: 12px; font-style: italic;">The margin of error isn't a mistake; it's the statistical "fuzziness" of representing a whole population with a smaller sample.</p>
</div>

<p>When the SAT says "The average was 45% with a margin of error of 3%," you must translate that to a 
<strong style="color: var(--learn-accent-teal)">Confidence Interval</strong>. The true population average 
is highly likely to live somewhere between 42% and 48%.</p>
<p>If an answer choice says "Exactly 45% of the population behaves this way," it is wrong. If it says 
"It is plausible that the true population average lies between 42% and 48%," it is correct.</p>

<h2>The Absolute Fraud Traps</h2>

<div style="text-align: center; margin: 48px 0;">
  <!-- Placeholder -->
  <img src="/assets/images/evaluating-statistical-claims_traps.png" alt="Traps: The Definite Causation Trap, The Generalization Trap" style="max-width: 80%; margin: 40px auto; display: block; border-radius: 12px; border: 1px solid var(--learn-border); box-shadow: 0 4px 16px rgba(0,0,0,0.05);" onerror="this.style.display='none'" />
  <p style="font-size: 0.85rem; color: var(--learn-text-muted); margin-top: 12px; font-style: italic;">The SAT tests if you will fall for bad science reporting.</p>
</div>

<p>The <strong style="color: var(--learn-accent-rose)">Definite Proof Trap</strong>: 
In the realm of statistics, words like "prove," "must," "certainly," and "always" are red flags. Statistical sampling is about probabilities, not absolute cosmic certainty. Always choose the answer with softer, academic hedging: "suggests," "likely," or "is plausible."</p>

<p>The <strong style="color: var(--learn-accent-rose)">Over-Generalization Trap</strong>: 
A researcher randomly selects 50 dogs from a local animal shelter and finds they love brand X food. The trap answer claims: "All dogs prefer brand X." It's wrong because 1) "All" is too extreme, and 2) the sample only represents dogs IN THAT SHELTER, not household pets globally.</p>

<p>The <strong style="color: var(--learn-accent-rose)">Observational Causation Trap</strong>: 
A study observes that people who drink green tea live longer. The trap answer says: "Drinking green tea causes longer life." But it wasn't a controlled, randomized experiment. It was just an observation. Maybe green tea drinkers also eat better diets. The only allowed conclusion is "Green tea drinking is associated with longer life."</p>
`,
    keyStrategies: [
      "The Verb Softener: When evaluating claims, instantly eliminate answer choices that use aggressive absolute verbs ('proves', 'guarantees', 'ensures'). Favor choices using the language of probability ('suggests', 'is likely that').",
      "The Boundary Check: Circle the exact population that was surveyed (e.g., '5th graders at Lincoln Middle School'). Eliminate any answer choice that applies the findings to a broader population (e.g., 'All 5th graders in the country').",
      "The Random Assignment Trigger: The moment you read the words 'randomly assigned into two groups,' mentally flag that causation CAN be established. If you do not see those words, causation is impossible."
    ],
    commonMistakes: [
      "Assuming that a larger sample size eliminates bias. (Even a poll of 1,000,000 people is biased if you only polled them outside of a specific political rally).",
      "Accepting a causal 'A causes B' claim from a survey or observational study.",
      "Misunderstanding Margin of Error as an indicator that the researchers made a mathematical mistake."
    ],
    studyTips: [
      "Methodology Triage: Whenever reading scientific news articles, practice asking: 'Was this observational or an experiment?' and 'Who was the population?' Train your brain to spot experimental flaws in the wild.",
      "Margin of Error Arithmetic: Practice instantly converting a mean and a margin of error into a 'safe zone range' [Mean - Margin, Mean + Margin]. The correct answer must only inhabit this zone."
    ]
  }
];

async function uploadBatch() {
  console.log('Beginning Batch 5 Data Analysis uploads...');
  for (const item of dataAnalysisContents) {
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
  console.log('Batch 5 complete.');
}

uploadBatch();
