/**
 * Upload Script: Boundaries Learning Content
 * Run with: node src/scripts/upload_boundaries.js
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

const content = {
  subcategoryId: 'boundaries',
  difficulty: 'Foundational — Grammar and Punctuation Rules',
  estimatedStudyTime: '2 – 3 Hours',

  overview: `
<h2>Boundaries: Punctuation is Engineering</h2>

<p>You probably learned punctuation as "pauses for breath." The SAT does not care about your breathing. 
On the SAT, punctuation marks are structural beams that hold clauses together. 
<strong style="color: var(--learn-accent-blue)">Boundaries</strong> questions test whether you can identify 
when a sentence is legally finished (Independent Clause) and when it is merely holding extra information 
(Dependent Clause or Phrase).</p>

<div style="text-align: center; margin: 48px 0;">
  <!-- Placeholder for boundaries_concept.png -->
  <img src="/assets/images/boundaries_concept.png" alt="Boundaries: Punctuation as structural beams connecting Independent and Dependent clauses" style="max-width: 80%; margin: 40px auto; display: block; border-radius: 12px; border: 1px solid var(--learn-border); box-shadow: 0 4px 16px rgba(0,0,0,0.05);" onerror="this.style.display='none'" />
  <p style="font-size: 0.85rem; color: var(--learn-text-muted); margin-top: 12px; font-style: italic;">Think of an Independent Clause as a complete car. A Dependent Clause is a trailer. You need specific hitches (punctuation) to connect them.</p>
</div>

<h2>The Core Clause Concept</h2>

<p>Every Boundary question hinges on your ability to recognize an <strong style="color: var(--learn-accent-teal)">Independent Clause (IC)</strong>. 
An IC has a subject, a working verb, and represents a complete thought. "The dog barked." is an IC. 
"Because the dog barked" is a <strong style="color: var(--learn-accent-purple)">Dependent Clause (DC)</strong>.</p>

<p>Most Boundary errors are simply illegal connections between these pieces.</p>

<div class="highlight-box">
  <ul style="margin-bottom: 0;">
    <li style="margin-bottom: 12px"><strong>The Comma Splice:</strong> [IC] , [IC]. (Illegal. You cannot glue two cars together with just a comma.)</li>
    <li style="margin-bottom: 12px"><strong>The Period/Semicolon Correction:</strong> [IC] . [IC] OR [IC] ; [IC]. (Legal. This separates the cars.)</li>
    <li><strong>The FANBOYS Fix:</strong> [IC] , and [IC]. (Legal. Comma + For, And, Nor, But, Or, Yet, So = a valid hitch.)</li>
  </ul>
</div>

<h2>The 'Identify the Seam' Framework</h2>

<div style="text-align: center; margin: 48px 0;">
  <!-- Placeholder for boundaries_framework.png -->
  <img src="/assets/images/boundaries_framework.png" alt="Boundaries Framework: Find the Subject/Verb, Test Left/Right, Identify the Legal Connector" style="max-width: 80%; margin: 40px auto; display: block; border-radius: 12px; border: 1px solid var(--learn-border); box-shadow: 0 4px 16px rgba(0,0,0,0.05);" onerror="this.style.display='none'" />
  <p style="font-size: 0.85rem; color: var(--learn-text-muted); margin-top: 12px; font-style: italic;">Don't read the passage for flow; scan it for verbs to figure out the structural math.</p>
</div>

<p>Solve these questions mechanically, not audibly:</p>

<p><strong style="color: var(--learn-accent-teal)">1. Locate the Seam:</strong> 
The spot where the varied punctuation options appear in your answer choices is the "seam." Look at the word before the punctuation and the word after.</p>

<p><strong style="color: var(--learn-accent-blue)">2. Test Left and Right:</strong> 
Cover the seam. Look left: Is everything before the seam a complete Independent Clause? Look right: Is everything after the seam a complete Independent Clause?</p>

<p><strong style="color: var(--learn-accent-purple)">3. Apply the Rule:</strong> 
If it is [IC] on the left and [IC] on the right, you MUST use a Period, a Semicolon, or a (Comma + FANBOYS). If one side is a [DC] or phrase, you generally just need a single Comma. A semicolon between an [IC] and a [DC] is always illegal.</p>

<h2>Advanced Boundary Traps</h2>

<div style="text-align: center; margin: 48px 0;">
  <!-- Placeholder for boundaries_traps.png -->
  <img src="/assets/images/boundaries_traps.png" alt="Boundary Traps: The Colon/Dash Trap, The Non-Essential Clause Trick, The Run-On Illusion" style="max-width: 80%; margin: 40px auto; display: block; border-radius: 12px; border: 1px solid var(--learn-border); box-shadow: 0 4px 16px rgba(0,0,0,0.05);" onerror="this.style.display='none'" />
  <p style="font-size: 0.85rem; color: var(--learn-text-muted); margin-top: 12px; font-style: italic;">The SAT hides clause boundaries by stuffing them with non-essential descriptions.</p>
</div>

<p>The <strong style="color: var(--learn-accent-rose)">Colon Setup Trap</strong>: 
A colon ( : ) or a single dash ( — ) acts as an "equals sign" or a drumroll. The rule is absolute: the text BEFORE the colon MUST be a complete Independent Clause. What comes after can be a fragment, a list, or another sentence, but the setup must stand alone. Trap answers put colons after verbs (e.g., "The results showed:"). This is illegal.</p>

<p>The <strong style="color: var(--learn-accent-rose)">Missing Bracket Trap (Non-Essential Clauses)</strong>: 
When a phrase interrupts a sentence to add extra info (e.g., "The CEO, a Harvard graduate, resigned"), it acts like parentheses. It must have a comma on BOTH sides, or dashes on BOTH sides. Trap answers will use one comma and one dash, or drop the second comma entirely.</p>

<p>The <strong style="color: var(--learn-accent-rose)">Subject-Verb Separation Trap</strong>: 
Never put a single comma between a subject and its principal verb (e.g., "The large, angry bear, roared"). The SAT will try to separate them to see if you mistake the noun logic.</p>
`,

  keyStrategies: [
    "The Semicolon/Period Equality Rule: On the SAT, a semicolon (;) and a period (.) function identically. They both separate two Independent Clauses. If two answer choices are identical except one uses a period and one uses a semicolon, cross them BOTH out. They can't both be the singular right answer.",
    "The Bracket Test: For non-essential phrases (appositives) bordered by commas or dashes, mentally cross them out. If the remaining sentence still forms a complete, grammatically correct thought, the commas/dashes were used correctly.",
    "The FANBOYS Check: If you see a comma followed by 'and' (, and), confirm that what follows is a full Independent Clause. If it's just a verb ('The dog barked, and ran away'), the comma is illegal. No comma is needed before 'and' if it's just connecting two verbs for the same subject.",
    "Colons Demand Completeness: Before picking any answer with a colon, ensure the sentence immediately preceding it is an independent clause. 'Including:' or 'Such as:' are almost always wrong because the preceding clause is usually unfinished."
  ],

  commonMistakes: [
    "The 'Breathing' Fallacy: Placing a comma somewhere just because the sentence 'feels long' and you want to take a breath. Commas require grammatical rules, not lung capacity.",
    "Mismatched Appositives: Starting a non-essential interrupting phrase with a dash and ending it with a comma. Punctuation brackets must match: (comma + comma) OR (dash + dash).",
    "Ignoring the Dependent Word: Thinking 'Because the dog barked' is a complete sentence just because it has a noun and a verb. Subordinating conjunctions (Because, Although, Since, While) turn Independent Clauses into Dependent Clauses."
  ],

  studyTips: [
    "The IC/DC Highlighting Drill: Take an SAT text and use a green highlighter for Independent Clauses, and a pink highlighter for Dependent Clauses. Pay intense attention to the punctuation at the exact border where green meets pink.",
    "FANBOYS Memorization: Memorize the coordinators (For, And, Nor, But, Or, Yet, So). They are the only words that can legally follow a comma to join two full sentences.",
    "Appositive Crossing-Out: Practice physically drawing a line through non-essential informational phrases bordered by commas. Train your eye to read the core sentence without the 'fluff' to check subject-verb agreement."
  ]
};

async function uploadContent() {
  try {
    await db.collection('learningContent').doc('boundaries').set({
      ...content,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('✅ Boundaries content uploaded successfully.');
  } catch (error) {
    console.error('❌ Upload failed:', error);
    process.exit(1);
  }
}

uploadContent();
