/**
 * Upload Script: Form, Structure, and Sense Learning Content
 * Run with: node src/scripts/upload_form_structure_sense.js
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
  subcategoryId: 'form-structure-sense',
  difficulty: 'Foundational — Verbs, Pronouns, and Modifiers',
  estimatedStudyTime: '2 – 2.5 Hours',

  overview: `
<h2>Form, Structure, & Sense: The Gears of the Sentence</h2>

<p>While "Boundaries" tests how you connect sentences together, <strong style="color: var(--learn-accent-blue)">Form, 
Structure, and Sense</strong> tests how the gears <em>inside</em> the sentence operate. This category covers 
the mechanical rules of English grammar: Subject-Verb Agreement, Verb Tense consistency, Pronoun 
Agreement, and Modifier placement. The SAT treats these as rigid mathematical formulas.</p>

<div style="text-align: center; margin: 48px 0;">
  <!-- Placeholder for form_structure_sense_concept.png -->
  <img src="/assets/images/form_structure_sense_concept.png" alt="Form, Structure, and Sense: Matching Subjects to Verbs and Pronouns" style="max-width: 80%; margin: 40px auto; display: block; border-radius: 12px; border: 1px solid var(--learn-border); box-shadow: 0 4px 16px rgba(0,0,0,0.05);" onerror="this.style.display='none'" />
  <p style="font-size: 0.85rem; color: var(--learn-text-muted); margin-top: 12px; font-style: italic;">Grammar is gear-matching. A singular subject gear requires a singular verb gear to turn correctly.</p>
</div>

<h2>The Three Main Danger Zones</h2>

<p>Almost all questions in this category fall into one of three specific grammatical arenas.</p>

<div class="highlight-box">
  <ul style="margin-bottom: 0;">
    <li style="margin-bottom: 12px"><strong>1. Subject-Verb Agreement:</strong> Singular nouns need singular verbs (The <em>car runs</em>). Plural nouns need plural verbs (The <em>cars run</em>). The SAT makes this hard by putting massive distances between the subject and the verb.</li>
    <li style="margin-bottom: 12px"><strong>2. Verb Tense & Consistency:</strong> Does the action happen in the past, present, or future? The key rule: keep the tense identical to the other verbs in the surrounding context unless a specific time-word dictates a shift.</li>
    <li><strong>3. Pronoun-Antecedent Agreement:</strong> If a pronoun (<em>it, they, them</em>) is used, it must perfectly match the number (singular/plural) of the specific noun it refers to.</li>
  </ul>
</div>

<h2>The 'Subject Isolation' Framework</h2>

<div style="text-align: center; margin: 48px 0;">
  <!-- Placeholder for form_structure_sense_framework.png -->
  <img src="/assets/images/form_structure_sense_framework.png" alt="Subject Isolation Framework: Cross out prep phrases, Identify the true noun, Match the verb" style="max-width: 80%; margin: 40px auto; display: block; border-radius: 12px; border: 1px solid var(--learn-border); box-shadow: 0 4px 16px rgba(0,0,0,0.05);" onerror="this.style.display='none'" />
  <p style="font-size: 0.85rem; color: var(--learn-text-muted); margin-top: 12px; font-style: italic;">Sentence cleanup: Eliminate prepositional phrases before matching subjects to verbs.</p>
</div>

<p>The SAT deliberately engineers sentences to sound correct even when they are grammatically broken. 
To bypass this auditory trap, use Subject Isolation:</p>

<p><strong style="color: var(--learn-accent-teal)">1. Spot the Seam:</strong> 
Look at the answer choices. If the options are <em>is / are / were / has been</em>, the question is testing Subject-Verb agreement. You need to find the subject.</p>

<p><strong style="color: var(--learn-accent-blue)">2. Slash the Prepositions:</strong> 
Prepositional phrases (e.g., "of the students", "in the lab", "with the complex algorithms") are the SAT's favorite camouflage. A subject is almost NEVER inside a prepositional phrase. Mentally cross them out.</p>

<p><strong style="color: var(--learn-accent-purple)">3. Match the Naked Noun:</strong> 
Once the fluff is gone, you are left with "A cluster [of stars] <em>was/were</em> discovered." Since "stars" is crossed out, the subject is the singular "cluster." The answer is singular: <em>was</em>.</p>

<h2>Advanced Structural Traps</h2>

<div style="text-align: center; margin: 48px 0;">
  <!-- Placeholder for form_structure_sense_traps.png -->
  <img src="/assets/images/form_structure_sense_traps.png" alt="Form and Structure Traps: The Dangling Modifier, The Pronoun Ambiguity, The False Plural" style="max-width: 80%; margin: 40px auto; display: block; border-radius: 12px; border: 1px solid var(--learn-border); box-shadow: 0 4px 16px rgba(0,0,0,0.05);" onerror="this.style.display='none'" />
  <p style="font-size: 0.85rem; color: var(--learn-text-muted); margin-top: 12px; font-style: italic;">The SAT hides false plurals and dangling modifiers right in plain sight.</p>
</div>

<p>The <strong style="color: var(--learn-accent-rose)">Dangling Modifier Trap</strong>: 
If a sentence starts with a descriptive phrase followed by a comma (e.g., "Exhausted from the long hike,"), the very next noun MUST be the thing being described. "Exhausted from the hike, the <em>backpack</em> was dropped" is illegal because backpacks don't get exhausted. The person must come immediately after the comma.</p>

<p>The <strong style="color: var(--learn-accent-rose)">Plural Decoy Trap</strong>: 
The SAT will place a plural noun directly next to the verb to trick your ear. Example: "The list of requirements <em>are</em> demanding." Because "requirements are" sounds correct to the ear, students pick it. But the true subject is the singular "list." It should be "The list... <em>is</em> demanding."</p>

<p>The <strong style="color: var(--learn-accent-rose)">They vs. It Trap</strong>: 
Collective nouns like <em>company, team, government, committee,</em> and <em>group</em> are SINGULAR. "The government passed their new law" is grammatically wrong on the SAT. It must be "The government passed <em>its</em> new law."</p>
`,

  keyStrategies: [
    "Preposition Purge: The fastest way to elevate your grammar score is to aggressively draw lines through prepositional phrases ('of', 'in', 'to', 'for', 'with', 'on', 'at', 'from'). The true subject is always hiding to the left of the preposition.",
    "Look at the Verbs in the Options: If the answer choices transition between singular (has, is) and plural (have, are), it is a Subject-Verb agreement question. Stop reading for context and start hunting for the specific noun.",
    "The Subject Hug Rule: For modifier questions (introductory phrases ending in a comma), the subject must 'hug' the comma. Check the noun immediately following the comma. If it isn't the entity doing the action described in the intro phrase, the answer is wrong.",
    "Look for Surrounding Tense Anchors: If checking for verb tense, don't read the sentence in isolation. Look at the sentence before it. If the previous sentence says 'In 1999, researchers *discovered*...', your current verb generally must also live in the past tense, unless a new time-marker jumps you forward."
  ],

  commonMistakes: [
    "Trusting the Ear Over the Eye: English allows a lot of sloppy grammar in spoken language (like 'Every one of the teams have a mascot'). On the SAT, strict written rules apply ('Every one... HAS'). Do not trust what 'sounds okay'.",
    "Missing the 'Each'/'Every' Rule: Words like 'each', 'every', 'neither', and 'either' are unconditionally singular, even when followed by a plural word. 'Every one of the birds is...' not 'Every one of the birds are...'",
    "The 'Who/Which/That' Confusion: 'Who' refers to people. 'Which' and 'that' refer to things. The SAT will try to use 'which' for a person ('the scientist which discovered') to see if you catch it."
  ],

  studyTips: [
    "The Naked Sentence Drill: Take SAT paragraphs and cross out all adjectives, adverbs, and prepositional phrases until only the raw Subject-Verb pairs remain. Validate that they align perfectly.",
    "Identify the Decoys: When reviewing Subject-Verb wrong answers, find the exact noun that tricked you. Was it a plural prepositional phrase next to the blank? Highlight it.",
    "Modifier Checking: On any question with an introductory phrase, physically draw an arrow from the comma to the first word of the main clause. Ensure the connection makes logical sense."
  ]
};

async function uploadContent() {
  try {
    await db.collection('learningContent').doc('form-structure-sense').set({
      ...content,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('✅ Form, Structure, and Sense content uploaded successfully.');
  } catch (error) {
    console.error('❌ Upload failed:', error);
    process.exit(1);
  }
}

uploadContent();
