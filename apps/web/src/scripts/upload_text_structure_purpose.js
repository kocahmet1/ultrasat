/**
 * Upload Script: Text Structure and Purpose Learning Content
 * Run with: node src/scripts/upload_text_structure_purpose.js
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
  subcategoryId: 'text-structure-purpose',
  difficulty: 'Advanced — Architectural Reading',
  estimatedStudyTime: '1.5 – 2 Hours',

  overview: `
<h2>Text Structure & Purpose: The Architect's View</h2>

<p>When you read for pleasure, you look at the wallpaper. When you read for the SAT, you need 
to look at the drywall, the studs, and the foundation. Text Structure and Purpose questions ask 
you to step back and become the architect. You are no longer reading to learn <em>what</em> the 
author is saying; you are reading to map 
<strong style="color: var(--learn-accent-teal)">how they built it</strong> and 
<strong style="color: var(--learn-accent-blue)">why they built it that way</strong>.</p>

<div style="text-align: center; margin: 48px 0;">
  <!-- Placeholder for text_structure_purpose_concept.png -->
  <img src="/assets/images/text_structure_purpose_concept.png" alt="Text Structure & Purpose: Structure is the what, Purpose is the why" style="max-width: 80%; margin: 40px auto; display: block; border-radius: 12px; border: 1px solid var(--learn-border); box-shadow: 0 4px 16px rgba(0,0,0,0.05);" onerror="this.style.display='none'" />
  <p style="font-size: 0.85rem; color: var(--learn-text-muted); margin-top: 12px; font-style: italic;">Structure is the mechanical layout of the text. Purpose is the author's intent.</p>
</div>

<h2>Decoding Structure vs. Purpose</h2>

<p>The SAT splits this category into two very specific flavors, though they rely on the same 
bird's-eye view of reading.</p>

<div class="highlight-box">
  <ul style="margin-bottom: 0;">
    <li style="margin-bottom: 12px"><strong>Structure Questions:</strong> Ask "Which choice best describes the overall structure of the text?" The correct answer is a chronological map. Example: "It introduces a theory, pivot to contradicting evidence, and concludes with a call for more research."</li>
    <li><strong>Purpose Questions:</strong> Ask "Which choice states the main purpose of the text?" The correct answer is an intent. Example: "To criticize a commonly held belief about marine biology."</li>
  </ul>
</div>

<p>For both, reading the details is a trap. If you get bogged down in the specific names of 
the enzymes or the exact dates of the historical event, you lose sight of the floor plan.</p>

<h2>The X-Ray Reading Framework</h2>

<div style="text-align: center; margin: 48px 0;">
  <!-- Placeholder for text_structure_purpose_framework.png -->
  <img src="/assets/images/text_structure_purpose_framework.png" alt="The X-Ray Reading Framework: Identify the Shift, Map the Halves, Match the Verb" style="max-width: 80%; margin: 40px auto; display: block; border-radius: 12px; border: 1px solid var(--learn-border); box-shadow: 0 4px 16px rgba(0,0,0,0.05);" onerror="this.style.display='none'" />
  <p style="font-size: 0.85rem; color: var(--learn-text-muted); margin-top: 12px; font-style: italic;">Use X-Ray Reading to strip away the complex topic and look only at the logical skeleton.</p>
</div>

<p>To succeed here, you must read with x-ray vision:</p>

<p><strong style="color: var(--learn-accent-teal)">1. Identify the Shift:</strong> 
Every SAT passage has a pivot point. The author starts by describing an old idea, then says "However..." The purpose of the text lives precisely at that pivot. Find the transition word; it is the hinge the entire text swings on.</p>

<p><strong style="color: var(--learn-accent-blue)">2. Map the Halves:</strong> 
For Structure questions, chop the paragraph in half. What is the first half doing? (Setting a scene? Stating a problem?) What is the second half doing? (Resolving it? Posing a question?) Match your rough map to the answer choices.</p>

<p><strong style="color: var(--learn-accent-purple)">3. Match the Verb:</strong> 
For Purpose questions, immediately look at the first word of every answer choice. (e.g., A. <em>To argue</em>... B. <em>To celebrate</em>... C. <em>To outline</em>...). If the text is a neutral scientific summary, the author isn't "arguing" or "celebrating." You can kill answers instantly based entirely on the opening verb.</p>

<h2>Trap Engineering for Structure & Purpose</h2>

<div style="text-align: center; margin: 48px 0;">
  <!-- Placeholder for text_structure_purpose_traps.png -->
  <img src="/assets/images/text_structure_purpose_traps.png" alt="Purpose Traps: True Detail/Wrong Purpose, Extreme Intent, The Half-Match" style="max-width: 80%; margin: 40px auto; display: block; border-radius: 12px; border: 1px solid var(--learn-border); box-shadow: 0 4px 16px rgba(0,0,0,0.05);" onerror="this.style.display='none'" />
  <p style="font-size: 0.85rem; color: var(--learn-text-muted); margin-top: 12px; font-style: italic;">Learn to recognize answers that describe parts of the text but fail as an overall structural map.</p>
</div>

<p>The <strong style="color: var(--learn-accent-rose)">True Detail, Wrong Purpose Trap</strong> 
is the most lethal. It offers an answer that is factually 100% correct about a single sentence in the text. Students read it and think, "Yes, the author did say that." But the question didn't ask what the author said—it asked *why* they wrote the whole paragraph. Don't confuse a spoke for the wheel.</p>

<p>The <strong style="color: var(--learn-accent-rose)">Half-Match Trap</strong> 
perfectly describes the first half of the passage's structure, but messes up the ending. For example, the answer implies the passage ends with a solution, but the passage actually ends with a new problem. Check both the front and the back of the answer choice.</p>

<p>The <strong style="color: var(--learn-accent-rose)">Extreme Intent Trap</strong> 
uses heavily polarized verbs. It claims the author wrote the passage to "condemn" a policy when they actually just "questioned" it, or to "prove" a theory when they merely "introduced" it. The SAT prefers moderate, academically defensible intents.</p>
`,

  keyStrategies: [
    "The 3-Word Map: Read the paragraph and force yourself to summarize its structure in 3 words. (e.g., 'Old theory' -> 'New evidence' -> 'Confusion'). Hold that map in your head before looking at the choices.",
    "The Verb Filter: For purpose questions, evaluate the opening verb of every answer choice first (e.g., to argue, to suggest, to refute). Does the tone of the verb match the tone of the passage? If the verb is wrong, the rest of the answer doesn't matter.",
    "Hunting Pivot Words: Circle words like 'However', 'But', 'Recently', or 'Instead'. The transition word is the author planting a flag regarding their true purpose.",
    "Beware the Shiny Detail: If an answer choice focuses entirely on a very specific noun, date, or name mentioned in passing in the text, it is almost certainly a 'True Detail, Wrong Purpose' trap.",
    "The First and Last Sentence Rule: The overall purpose of a paragraph is almost always established in the first sentence (the topic claim) or the last sentence (the conclusion/takeaway). If those two don't align with your answer choice, be suspicious."
  ],

  commonMistakes: [
    "Answering 'What' instead of 'Why': Getting so focused on the fascinating science facts or historical details in the passage that you pick an answer summarizing the plot, rather than identifying the author's intent.",
    "Falling for the Half-Right Answer: Reading the first clause of a structural answer choice, saying 'yep, that happens,' and picking it without verifying that the second clause accurately maps to the end of the text.",
    "Projecting Opinion: Assuming because a topic is highly sensitive or negative, that the author's purpose is to 'condemn' it. The passage might just be an objective historical summary.",
    "Ignoring the Tone: Picking verbs like 'To mock' or 'To defend' for passages that are dry, objective encyclopedia-style entries."
  ],

  studyTips: [
    "The Verb Triage Drill: Take 10 official Purpose questions. Cover the back half of the answer choices so you can only see the first word (the verb). Try to eliminate 2 choices immediately just based on whether the verb feels too extreme or the wrong tone.",
    "Reverse Engineering texts: Read a news article. Don't summarize what it's about. Instead, write down: Paragraph 1 does X. Paragraph 2 does Y. Paragraph 3 concludes Z. Build the architectural map.",
    "Transition Hunt: Go through SAT reading passages and highlight every 'shift' word (However, But, In contrast). Notice how the sentence immediately following the shift is almost always the answer to the 'Purpose' question."
  ]
};

async function uploadContent() {
  try {
    await db.collection('learningContent').doc('text-structure-purpose').set({
      ...content,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('✅ Text Structure and Purpose content uploaded successfully to Firestore.');
  } catch (error) {
    console.error('❌ Upload failed:', error);
    process.exit(1);
  }
}

uploadContent();
