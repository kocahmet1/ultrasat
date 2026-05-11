/**
 * Upload Script: Batch 6 Geometry and Trigonometry Content
 * Run with: node src/scripts/upload_batch6_geometry.js
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

const geometryContents = [
  {
    subcategoryId: 'area-volume',
    difficulty: 'Intermediate — 2D and 3D Modeling',
    estimatedStudyTime: '1 Hour',
    overview: `
<h2>Area and Volume: The Dimensions of Space</h2>

<p>The SAT provides a reference sheet with almost every Area and Volume formula you will ever need. 
Therefore, this section is not testing whether you can memorize <code>V = πr²h</code>. It is testing 
whether you can <strong style="color: var(--learn-accent-blue)">algebraically manipulate</strong> those formulas 
when given the end result rather than the starting pieces. You must run the formulas in reverse.</p>

<div style="text-align: center; margin: 48px 0;">
  <!-- Placeholder -->
  <img src="/assets/images/area-volume_concept.png" alt="Concept: The transition from 1D length to 2D area to 3D volume" style="max-width: 80%; margin: 40px auto; display: block; border-radius: 12px; border: 1px solid var(--learn-border); box-shadow: 0 4px 16px rgba(0,0,0,0.05);" onerror="this.style.display='none'" />
  <p style="font-size: 0.85rem; color: var(--learn-text-muted); margin-top: 12px; font-style: italic;">The Reference Sheet is a dictionary; you still have to know how to write the sentence.</p>
</div>

<h2>The Reverse Engineering Protocol</h2>

<p>Rarely will a question say, "A cylinder has radius 3 and height 5, find the volume." Instead, it will say, 
"A cylinder has a volume of 45π and a height of 5. What is the diameter?"</p>

<p>Your workflow must be absolutely rigid:</p>
<div class="highlight-box">
  <ul style="margin-bottom: 0;">
    <li style="margin-bottom: 12px"><strong>Step 1: Write the blank formula.</strong> <code>V = πr²h</code></li>
    <li style="margin-bottom: 12px"><strong>Step 2: Plug in the knowns.</strong> <code>45π = π(r²)(5)</code></li>
    <li><strong>Step 3: Isolate the unknown.</strong> Divide by 5π to get <code>9 = r²</code>. Therefore, r = 3. The diameter is 6.</li>
  </ul>
</div>

<h2>The Scale Factor Law</h2>

<div style="text-align: center; margin: 48px 0;">
  <!-- Placeholder -->
  <img src="/assets/images/area-volume_framework.png" alt="Framework: Length x, Area x^2, Volume x^3" style="max-width: 80%; margin: 40px auto; display: block; border-radius: 12px; border: 1px solid var(--learn-border); box-shadow: 0 4px 16px rgba(0,0,0,0.05);" onerror="this.style.display='none'" />
  <p style="font-size: 0.85rem; color: var(--learn-text-muted); margin-top: 12px; font-style: italic;">Scaling a physical object up fundamentally changes its geometry mathematically.</p>
</div>

<p>If you double the sides of a square, the area does not double. The area quadruples. 
This is the single most tested concept in 2D/3D geometry. You must memorize the Scale Factor Law:</p>
<ul>
  <li><strong style="color: var(--learn-accent-teal)">Length (1D):</strong> Scales by <em>k</em>. (e.g., k = 3)</li>
  <li><strong style="color: var(--learn-accent-blue)">Area (2D):</strong> Scales by <em>k²</em>. (e.g., k = 9)</li>
  <li><strong style="color: var(--learn-accent-purple)">Volume (3D):</strong> Scales by <em>k³</em>. (e.g., k = 27)</li>
</ul>
<p>If a question tells you a similar cone has 4 times the volume of the original, DO NOT assume the radius is 4 times bigger. To go from Volume (3D) back to Length (1D), you must take the cube root.</p>

<h2>Advanced Dimensional Traps</h2>

<div style="text-align: center; margin: 48px 0;">
  <!-- Placeholder -->
  <img src="/assets/images/area-volume_traps.png" alt="Traps: The Surface Area Illusion, Ignoring Pi, Radius/Diameter Swaps" style="max-width: 80%; margin: 40px auto; display: block; border-radius: 12px; border: 1px solid var(--learn-border); box-shadow: 0 4px 16px rgba(0,0,0,0.05);" onerror="this.style.display='none'" />
  <p style="font-size: 0.85rem; color: var(--learn-text-muted); margin-top: 12px; font-style: italic;">The SAT hides the true variable you need behind a synonym.</p>
</div>

<p>The <strong style="color: var(--learn-accent-rose)">Radius/Diameter Swap</strong>: 
Formulas almost exclusively require the radius (r). Word problems almost exclusively give you the diameter (d). If you don't cut the diameter in half before putting it into <code>πr²</code>, your answer will be four times too large.</p>

<p>The <strong style="color: var(--learn-accent-rose)">Surface Area vs Volume Trap</strong>: 
A question asks how much cardboard is needed to build a box. A student calculates the volume (L × W × H). But cardboard wraps the OUTSIDE of the box. That is Surface Area. You must sum the area of all 6 individual faces.</p>
`,
    keyStrategies: [
      "Explicit Formula Setup: Never mental-math a volume problem. Physically write down the reference sheet formula, plug the given variables into it like puzzle pieces, and use basic algebra to isolate the missing piece.",
      "The 'Pi' Drop: In many geometry algebra problems (like finding the radius of a cylinder given its volume), Pi exists on both sides of the equation (45π = πr²h). Immediately divide both sides by π to cross it out. Ignoring it cleans up the math.",
      "The Rectangular Prism Shortcut: The volume of a box is always Area of the Base × Height. If they tell you the area of the base is 20, don't waste time trying to find the individual length and width. Just multiply 20 by the height."
    ],
    commonMistakes: [
      "Using the diameter instead of the radius in circle/cylinder/sphere volume formulas.",
      "Scaling the volume by 'k' instead of 'k cubed' when a shape's dimensions are increased.",
      "Providing the volume of an object when the question specifically asked for surface area."
    ],
    studyTips: [
      "Volume Reversal Drills: Write out 10 volume answers (e.g., A sphere has volume 36π). Practice solving backwards to find the exact radius.",
      "Dimension Mapping: Associate words with dimensions. Paint, wrapping paper, and fences = Area (2D). Water, dirt, and air = Volume (3D)."
    ]
  },
  {
    subcategoryId: 'lines-angles-triangles',
    difficulty: 'Foundational — Geometric Logic',
    estimatedStudyTime: '1.5 Hours',
    overview: `
<h2>Lines, Angles, and Triangles: The Geometry of Rules</h2>

<p>Basic geometry on the SAT is not about visualization; it is about exploiting strict, interlocking rules. 
If you know one angle in a grid of intersecting parallel lines, you can mathematically deduce every other 
angle. This section tests your ability to act as a 
<strong style="color: var(--learn-accent-blue)">geometric detective</strong>, tracing known values across 
lines and inside triangles.</p>

<div style="text-align: center; margin: 48px 0;">
  <!-- Placeholder -->
  <img src="/assets/images/lines-angles-triangles_concept.png" alt="Concept: Parallel line transversal and interior triangle rules" style="max-width: 80%; margin: 40px auto; display: block; border-radius: 12px; border: 1px solid var(--learn-border); box-shadow: 0 4px 16px rgba(0,0,0,0.05);" onerror="this.style.display='none'" />
  <p style="font-size: 0.85rem; color: var(--learn-text-muted); margin-top: 12px; font-style: italic;">There are only two angle relationships on a straight line: they are exactly equal, or they add to 180.</p>
</div>

<h2>The Laws of the Transversal</h2>

<p>When a line (transversal) cuts through two parallel lines, it creates 8 angles. But there are really 
only TWO measurements in that entire cluster: a big angle and a small angle.</p>
<div class="highlight-box">
  <ul style="margin-bottom: 0;">
    <li style="margin-bottom: 12px"><strong>Rule 1:</strong> All the "big" (obtuse) angles are identical.</li>
    <li style="margin-bottom: 12px"><strong>Rule 2:</strong> All the "small" (acute) angles are identical.</li>
    <li><strong>Rule 3:</strong> Any Big Angle + Any Small Angle = 180 degrees.</li>
  </ul>
</div>
<p>You don't need to memorize terms like "alternate interior" or "consecutive exterior." Just look at them: 
If one looks acute and the other looks obtuse, they add to 180. If they look the same, they are equal.</p>

<h2>The Triangle Corollaries</h2>

<div style="text-align: center; margin: 48px 0;">
  <!-- Placeholder -->
  <img src="/assets/images/lines-angles-triangles_framework.png" alt="Framework: Finding the third angle, Similar triangles, The exterior angle theorem" style="max-width: 80%; margin: 40px auto; display: block; border-radius: 12px; border: 1px solid var(--learn-border); box-shadow: 0 4px 16px rgba(0,0,0,0.05);" onerror="this.style.display='none'" />
  <p style="font-size: 0.85rem; color: var(--learn-text-muted); margin-top: 12px; font-style: italic;">The 180-degree rule dictates the internal logic. The exterior angle is a shortcut.</p>
</div>

<p>Every triangle contains exactly 180 internal degrees. But the SAT tests advanced properties:</p>
<p><strong style="color: var(--learn-accent-teal)">Similar Triangles:</strong> If two triangles have the exact same three angles, they are similar. Their side lengths are perfectly proportional. If Triangle A has sides 3-4-5, and Triangle B is similar with a short side of 6, its other sides MUST be 8 and 10.</p>
<p><strong style="color: var(--learn-accent-purple)">The Isosceles Guarantee:</strong> If two sides of a triangle are equal length, the angles opposite those sides are mathematically guaranteed to be equal. The inverse is also true.</p>

<h2>Visual Deception Traps</h2>

<div style="text-align: center; margin: 48px 0;">
  <!-- Placeholder -->
  <img src="/assets/images/lines-angles-triangles_traps.png" alt="Traps: 'Not Drawn to Scale', Assumed Parallel Lines" style="max-width: 80%; margin: 40px auto; display: block; border-radius: 12px; border: 1px solid var(--learn-border); box-shadow: 0 4px 16px rgba(0,0,0,0.05);" onerror="this.style.display='none'" />
  <p style="font-size: 0.85rem; color: var(--learn-text-muted); margin-top: 12px; font-style: italic;">Never trust your eyes. If the text says 'Not drawn to scale', the angles are lying to you visually.</p>
</div>

<p>The <strong style="color: var(--learn-accent-rose)">Assumed Parallel Trap</strong>: 
A graph clearly shows two lines that look perfectly parallel, with a line cutting through them. You assume the Big+Small=180 rule applies. But the text never EXPLICITLY stated the lines were parallel (e.g., l || m). If it doesn't say they are parallel, none of the transversal rules apply. It's a trap.</p>
<p>The <strong style="color: var(--learn-accent-rose)">Third Side Rule Violation</strong>: 
The SAT asks "Which of the following could be the third side of a triangle with sides 5 and 7?" The rule states a third side must be LESS than their sum (12) and GREATER than their difference (2). The trap answer will be 12 exactly. It must be strictly less than 12, or the lines lay flat.</p>
`,
    keyStrategies: [
      "The 'Big/Small' Translation: When dealing with intersecting parallel lines, just categorize every angle as Big or Small. If they ask to compare two Small angles, they are equal. If they ask to compare a Big and a Small, they add to 180.",
      "The 'Write it In' Directive: The moment you uncover a hidden angle using the 180-degree straight line rule or interior triangle rule, write that number directly onto the diagram. This creates a bridge to the actual target angle.",
      "Similar Triangle Redrawing: When the SAT embeds a small triangle inside a larger triangle, mentally or physically redraw them separately side-by-side. Pointing out the proportional sides becomes vastly easier when they aren't overlapping."
    ],
    commonMistakes: [
      "Assuming an angle is 90 degrees just because it 'looks' like a right angle in a diagram.",
      "Forgetting that vertical angles (the 'X' intersection) are always equal.",
      "Applying parallel line rules (alternate interior angles) to lines that were never stated to be parallel."
    ],
    studyTips: [
      "Angle Tracing Exercises: Print complex webs of intersecting lines. Given only a single angle measurement, practice filling out every single other numeric angle in the entire diagram.",
      "Similarity Setup Drills: Practice setting up the proportion fractions for two similar triangles. Ensure the 'small' triangle sides are always on top, and 'large' triangle sides are always on the bottom."
    ]
  },
  {
    subcategoryId: 'right-triangles-trigonometry',
    difficulty: 'Advanced — SOH CAH TOA',
    estimatedStudyTime: '1 Hour',
    overview: `
<h2>Right Triangles & Trigonometry: The Formulas of the Ancients</h2>

<p>Right triangles are the cheat code of geometry. The moment a 90-degree angle is introduced into a triangle, 
it unlocks a massive arsenal of algebraic tools: the Pythagorean Theorem, the magical Special Right Triangles 
(30-60-90 and 45-45-90), and basic <strong style="color: var(--learn-accent-blue)">Trigonometry (SOH CAH TOA)</strong>. 
The SAT doesn't want you to calculate sines and cosines purely; they want you to manipulate their 
geometric definitions.</p>

<div style="text-align: center; margin: 48px 0;">
  <!-- Placeholder -->
  <img src="/assets/images/right-triangles-trigonometry_concept.png" alt="Concept: SOH CAH TOA framework mapping sides to angles" style="max-width: 80%; margin: 40px auto; display: block; border-radius: 12px; border: 1px solid var(--learn-border); box-shadow: 0 4px 16px rgba(0,0,0,0.05);" onerror="this.style.display='none'" />
  <p style="font-size: 0.85rem; color: var(--learn-text-muted); margin-top: 12px; font-style: italic;">Sin, Cos, and Tan are not magic words; they are simply fractions of side lengths.</p>
</div>

<h2>The SOH CAH TOA Translation</h2>

<p>If you see 'sin', 'cos', or 'tan' on the SAT, do not panic. They are just asking you to build a fraction.</p>
<div class="highlight-box">
  <ul style="margin-bottom: 0;">
    <li style="margin-bottom: 12px"><strong>SOH:</strong> Sin(angle) = Opposite side length / Hypotenuse length</li>
    <li style="margin-bottom: 12px"><strong>CAH:</strong> Cos(angle) = Adjacent side length / Hypotenuse length</li>
    <li><strong>TOA:</strong> Tan(angle) = Opposite side length / Adjacent side length</li>
  </ul>
</div>
<p>If they tell you that a triangle has sides 3, 4, 5, and ask for the Sine of the smallest angle, you simply 
find the smallest angle (across from the 3), identify the opposite side (3), identify the hypotenuse (5), 
and write down <code>3/5</code>. No calculator required.</p>

<h2>The Complementary Angle Theorem</h2>

<div style="text-align: center; margin: 48px 0;">
  <!-- Placeholder -->
  <img src="/assets/images/right-triangles-trigonometry_framework.png" alt="Framework: The theorem that Sin(x) = Cos(90-x)" style="max-width: 80%; margin: 40px auto; display: block; border-radius: 12px; border: 1px solid var(--learn-border); box-shadow: 0 4px 16px rgba(0,0,0,0.05);" onerror="this.style.display='none'" />
  <p style="font-size: 0.85rem; color: var(--learn-text-muted); margin-top: 12px; font-style: italic;">The most highly tested Trig rule on the SAT: The sine of an angle is ALWAYS equal to the cosine of its complement.</p>
</div>

<p>In any right triangle, the two non-90-degree angles add up to 90 (they are complementary). Because of how SOH CAH TOA is 
structured, the "opposite" side of Angle A is the exact same line as the "adjacent" side of Angle B.</p>
<p>Therefore, this rule is absolute testing gold on the SAT: <strong style="color: var(--learn-accent-purple)">Sin(x) = Cos(90 - x)</strong>.</p>
<p>If a question says: "If Sin(x) = 4/5, what is Cos(90 - x)?", the answer is instantly 4/5. You don't need a triangle. You don't need a calculator. It is a definitional law.</p>

<h2>Right Triangle Traps</h2>

<div style="text-align: center; margin: 48px 0;">
  <!-- Placeholder -->
  <img src="/assets/images/right-triangles-trigonometry_traps.png" alt="Traps: The Radian/Degree mismatch, The Hypotenuse Misidentification" style="max-width: 80%; margin: 40px auto; display: block; border-radius: 12px; border: 1px solid var(--learn-border); box-shadow: 0 4px 16px rgba(0,0,0,0.05);" onerror="this.style.display='none'" />
  <p style="font-size: 0.85rem; color: var(--learn-text-muted); margin-top: 12px; font-style: italic;">The Desmos tool will ruin your answer if you are in the wrong unit mode.</p>
</div>

<p>The <strong style="color: var(--learn-accent-rose)">Radian vs. Degree Trap</strong>: 
If you choose to use the Desmos calculator to actually compute a Trig function, you MUST verify whether the question is asking in degrees (e.g., 45°) or radians (e.g., π/4). If Desmos is in Radian mode but you type in Sin(45), it will give you a catastrophic garbage number.</p>

<p>The <strong style="color: var(--learn-accent-rose)">Pythagorean Triplet Ignorance</strong>: 
A triangle has sides 5 and 12. You spend 45 seconds doing 5² + 12² = c², adding 25 + 144 = 169, and square rooting it to get 13. The trap is time. You should have instantly recognized the 5-12-13 Pythagorean Triplet. Memorize the 3-4-5 and 5-12-13 families. The SAT uses them relentlessly.</p>
`,
    keyStrategies: [
      "The Sin(x) = Cos(90-x) Lock: Treat this rule like a reflex. The moment you see 'sin' and 'cos' in the same equation, look to see if the angles involved add up to 90. If they do, the values are identical.",
      "The Triplet Scanner: Before using the Pythagorean theorem, check if the two given sides are multiples of a 3-4-5 triangle (like 6-8-10 or 9-12-15) or a 5-12-13 triangle. 70% of SAT right triangles are built on these templates.",
      "SOH CAH TOA labeling: When given a right triangle and an angle focus (e.g., Angle A), immediately physically write the letters O, A, and H on the three sides of the triangle before doing any math. This prevents 'adjacent' vs 'opposite' mix-ups."
    ],
    commonMistakes: [
      "Confusing the 'Adjacent' side (the leg next to the angle) with the 'Hypotenuse' (the longest side opposite the 90-degree angle).",
      "Using the built-in calculator in Radian mode when the question implies Degrees.",
      "Trying to use Pythagorean theorem on a triangle that does not have a 90-degree angle."
    ],
    studyTips: [
      "Triplet Memorization: Memorize the 3-4-5, 5-12-13, 8-15-17, and 7-24-25 right triangle bases. You will feel like you have superhuman speed on test day.",
      "Special Right Triangle Rehearsal: The reference sheet provides the 45-45-90 and 30-60-90 rules (x, x, x√2 and x, x√3, 2x). Practice taking a square and cutting it in half diagonally to instantly derive the 45-45-90."
    ]
  },
  {
    subcategoryId: 'circles',
    difficulty: 'Advanced — Algebraic Geometry',
    estimatedStudyTime: '1.5 Hours',
    overview: `
<h2>Circles: The Equation of the Infinite Loop</h2>

<p>While middle school math tested your ability to find the area of a circle, the SAT tests your 
fluency in the <strong style="color: var(--learn-accent-blue)">Standard Equation of a Circle</strong> 
and the proportional rules governing <strong style="color: var(--learn-accent-teal)">Arcs and Sectors</strong>. 
You are translating physical curves into algebraic grids.</p>

<div style="text-align: center; margin: 48px 0;">
  <!-- Placeholder -->
  <img src="/assets/images/circles_concept.png" alt="Concept: The equation of a circle on a coordinate plane" style="max-width: 80%; margin: 40px auto; display: block; border-radius: 12px; border: 1px solid var(--learn-border); box-shadow: 0 4px 16px rgba(0,0,0,0.05);" onerror="this.style.display='none'" />
  <p style="font-size: 0.85rem; color: var(--learn-text-muted); margin-top: 12px; font-style: italic;">The circle equation (x-h)² + (y-k)² = r² locks down the center point and the radius radius length.</p>
</div>

<h2>Decoding the Circle Equation</h2>

<p>The standard equation of a circle is <code>(x - h)² + (y - k)² = r²</code>. The SAT will give you 
an equation and ask you to identify the physical features of the circle:</p>
<div class="highlight-box">
  <ul style="margin-bottom: 0;">
    <li style="margin-bottom: 12px"><strong>The Center (h, k):</strong> Notice the negative signs in the formula! If the equation is <code>(x - 3)² + (y + 5)² = 16</code>, the center is NOT (-3, 5). The center is the inverse: <strong>(3, -5)</strong>.</li>
    <li><strong>The Radius (r):</strong> The number at the end of the equation is the radius <em>squared</em>. In the previous example, the radius is not 16. It is <strong>4</strong>.</li>
  </ul>
</div>

<p>If the SAT gives you a massive, messy polynomial (like <code>x² + 6x + y² - 4y = 12</code>), you must use 
the algebraic technique of <strong style="color: var(--learn-accent-purple)">Completing the Square</strong> 
to wrangle it back into the standard circle format.</p>

<h2>The Proportionality of Arcs and Sectors</h2>

<div style="text-align: center; margin: 48px 0;">
  <!-- Placeholder -->
  <img src="/assets/images/circles_framework.png" alt="Framework: Finding arc length and sector area via fractions of 360" style="max-width: 80%; margin: 40px auto; display: block; border-radius: 12px; border: 1px solid var(--learn-border); box-shadow: 0 4px 16px rgba(0,0,0,0.05);" onerror="this.style.display='none'" />
  <p style="font-size: 0.85rem; color: var(--learn-text-muted); margin-top: 12px; font-style: italic;">A sector is just a slice of pizza. Its fraction of 360 degrees dictates its fraction of the total area.</p>
</div>

<p>You do not need unique formulas to find the length of an arc (a piece of the circumference) or the area of 
a sector (a slice of the whole area). It is pure percentage logic based on the central angle:</p>
<p>If the central angle is 90 degrees out of the total 360 degrees, then <code>90/360 = 1/4</code>.</p>
<p>Therefore, the Arc Length is exactly 1/4 of the total Circumference. And the Sector Area is exactly 1/4 of the total Area.</p>

<h2>Radiant Traps in Geometry</h2>

<div style="text-align: center; margin: 48px 0;">
  <!-- Placeholder -->
  <img src="/assets/images/circles_traps.png" alt="Traps: Forgetting to square root the radius, The Radian conversion trap" style="max-width: 80%; margin: 40px auto; display: block; border-radius: 12px; border: 1px solid var(--learn-border); box-shadow: 0 4px 16px rgba(0,0,0,0.05);" onerror="this.style.display='none'" />
  <p style="font-size: 0.85rem; color: var(--learn-text-muted); margin-top: 12px; font-style: italic;">The SAT counts heavily on students forgetting that the equation ends in radius squared, not the radius.</p>
</div>

<p>The <strong style="color: var(--learn-accent-rose)">Radius Squared Trap</strong>: 
A question asks: "What is the diameter of the circle represented by (x-2)² + (y-4)² = 81?" A rushed student sees the 81, assumes it's the radius, and doubles it to get a diameter of 162. The 81 is the radius SQUARED. The radius is 9. The diameter is 18.</p>

<p>The <strong style="color: var(--learn-accent-rose)">Radian Unfamiliarity Trap</strong>: 
Sometimes the central angle of a slice is given in radians (e.g., π/3). Don't panic. The same proportional fraction rule applies. Instead of dividing by 360 degrees, you divide by the total radians in a circle: 2π. <code>(π/3) / 2π = 1/6</code>. The slice is 1/6th of the whole circle.</p>
`,
    keyStrategies: [
      "The Sign Flip Rule: When extracting the center (h,k) from the circle equation, always manually invert the signs you see inside the parentheses. (x+2) means x is -2.",
      "The Desmos Circle Hack: If you are given a messy completed-square equation (x² + 4x + y² = 12) and asked to find its center, just type the entire equation straight into Desmos. It will draw the circle precisely, and you can literally see where the center is.",
      "The Pizza Slice Proportion: For any arc length or sector area question, immediately set up the fraction: Central Angle / 360. That fraction controls the entire problem."
    ],
    commonMistakes: [
      "Forgetting to take the square root of the number at the end of the circle equation to find the radius.",
      "Assuming the variables h and k inside the parenthesis are positive when they have minus signs next to them.",
      "Failing to multiply by BOTH sides of the equation when completing the square."
    ],
    studyTips: [
      "Completing the Square Drills: This algebraically heavy mechanism is highly specific. Practice completing the square on messy x and y polynomials until finding the 'half of b, squared' add-on feels automatic.",
      "Radian-to-Degree Check: Practice instantly converting common radians to degrees in your head. π = 180°. So π/2 is 90°. π/3 is 60°. π/4 is 45°."
    ]
  }
];

async function uploadBatch() {
  console.log('Beginning Batch 6 Geometry uploads...');
  for (const item of geometryContents) {
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
  console.log('Batch 6 complete.');
}

uploadBatch();
