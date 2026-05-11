/**
 * Upload Script: Words in Context Learning Content
 * Run with: node src/scripts/upload_words_in_context.js
 * Requires firebase-admin and ultrasat-5e4c4-369f564bdaef.json at project root
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
if (!admin.apps.length) {
  const serviceAccount = require(path.resolve(__dirname, '../../../../ultrasat-5e4c4-369f564bdaef.json'));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

const content = {
  subcategoryId: 'words-in-context',
  difficulty: 'Foundational — Vocabulary and Contextual Logic',
  estimatedStudyTime: '1 – 1.5 Hours',

  overview: `
<h2>Words in Context: The Hollow Core</h2>

<p>Every SAT "Words in Context" question is an exercise in structural reverse-engineering. 
You are given a paragraph with a <strong style="color: var(--learn-accent-blue)">hollow core</strong> — 
a missing word. The SAT is testing whether you can deduce the exact shape of that missing piece 
by analyzing the <strong style="color: var(--learn-accent-teal)">clues left on the perimeter</strong>.</p>

<div style="text-align: center; margin: 48px 0;">
  <!-- Placeholder for words_in_context_concept.png (Quota exceeded, to be generated later) -->
  <img src="/assets/images/words_in_context_concept.png" alt="Words in Context: The Hollow Core Concept" style="max-width: 80%; margin: 40px auto; display: block; border-radius: 12px; border: 1px solid var(--learn-border); box-shadow: 0 4px 16px rgba(0,0,0,0.05);" onerror="this.style.display='none'" />
  <p style="font-size: 0.85rem; color: var(--learn-text-muted); margin-top: 12px; font-style: italic;">The Hollow Core: Don't look at the answers until you define what shape must fit in the blank.</p>
</div>

<h2>The Anatomy of Context Clues</h2>

<p>The SAT never asks you to guess a word blindly. The text surrounding the blank will always 
contain the precise logical instructions required to select the answer. These instructions 
usually appear in two forms:</p>

<div class="highlight-box">
  <ul style="margin-bottom: 0;">
    <li style="margin-bottom: 12px"><strong>1. Tone Markers:</strong> Words that establish the emotional temperature or polarity of the sentence (e.g., "unfortunately," "celebrated," "disastrous").</li>
    <li><strong>2. Structural Anchors:</strong> Conjunctions and transitions that dictate direction. Contrast markers (<em>however, despite, although</em>) mean the blank must be the opposite of the preceding clue. Support markers (<em>furthermore, as a result, similarly</em>) mean the blank must align with the clue.</li>
  </ul>
</div>

<p>If you plug an answer choice in and it "sounds right," but it ignores a structural anchor 
like "although," you have fallen into the trap. Sounding right is a distraction; logical 
fit is the only truth.</p>

<h2>The Perimeter-First Framework</h2>

<div style="text-align: center; margin: 48px 0;">
  <!-- Placeholder for words_in_context_framework.png -->
  <img src="/assets/images/words_in_context_framework.png" alt="Words in Context: Perimeter-First Framework" style="max-width: 80%; margin: 40px auto; display: block; border-radius: 12px; border: 1px solid var(--learn-border); box-shadow: 0 4px 16px rgba(0,0,0,0.05);" onerror="this.style.display='none'" />
  <p style="font-size: 0.85rem; color: var(--learn-text-muted); margin-top: 12px; font-style: italic;">The 3-Step Perimeter Framework prevents the answer choices from manipulating your interpretation.</p>
</div>

<p>To eliminate subjective guessing, use the three-step Perimeter-First Framework:</p>

<p><strong style="color: var(--learn-accent-teal)">1. Blind the Options:</strong> 
Physically or mentally cover the answer choices. The text is objective; the choices are engineered to trick you. Do not let the traps influence your first impression of the sentence.</p>

<p><strong style="color: var(--learn-accent-blue)">2. Find the Perimeter:</strong> 
Read the sentence and find the clues. Identify the subject and the tone. Is the author praising the subject or criticizing it? Is there a shift?</p>

<p><strong style="color: var(--learn-accent-purple)">3. Guess and Match:</strong> 
Predict your own simple word for the blank. It doesn't have to be a SAT-level vocabulary word; "bad," "stop," or "copy" work perfectly. Once you have your simple word, uncover the choices and pick the one that matches your prediction.</p>

<h2>Vocabulary Trap Anatomy</h2>

<div style="text-align: center; margin: 48px 0;">
  <!-- Placeholder for words_in_context_traps.png -->
  <img src="/assets/images/words_in_context_traps.png" alt="Vocabulary Trap Anatomy: The Secondary Definition, The Sophisticated Distractor, The Tone Mismatch" style="max-width: 80%; margin: 40px auto; display: block; border-radius: 12px; border: 1px solid var(--learn-border); box-shadow: 0 4px 16px rgba(0,0,0,0.05);" onerror="this.style.display='none'" />
  <p style="font-size: 0.85rem; color: var(--learn-text-muted); margin-top: 12px; font-style: italic;">The SAT engineers vocabulary traps to catch students who rely on sound over structure.</p>
</div>

<p>Wrong answers in this section are rarely randomized. They fall into specific traps:</p>

<p>The <strong style="color: var(--learn-accent-rose)">Primary Definition Trap</strong> uses a word that you know, but the passage requires its secondary or tertiary meaning. For example, the text might refer to "compromising" a security system (weakening it), while a trap answer implies "compromising" in an argument (reaching an agreement).</p>

<p>The <strong style="color: var(--learn-accent-rose)">Sophisticated Distractor</strong> introduces a highly complex, "smart-sounding" word that fits the general topic but breaks the specific sentence logic. It preys on vocabulary insecurity.</p>

<p>The <strong style="color: var(--learn-accent-rose)">Opposite Tone Trap</strong> provides a word that makes perfect grammatical sense but requires a positive tone where the context demands a negative one. You missed the "however."</p>
`,

  keyStrategies: [
    "The 'Blind' Prediction: Never read the answer choices until you have predicted your own generic word for the blank (e.g., 'good', 'change', 'argue'). If you let the SAT's words implant in your mind first, you will rationalize the wrong answer.",
    "Hunting for the Pivot: Always scan the sentence for structural anchors: 'but', 'however', 'rather', 'furthermore', 'consequently'. These words act like mathematical signs (+ or -) that dictate the polarity of the missing word.",
    "The Secondary Meaning Check: The SAT loves common words used in uncommon ways (e.g., 'table' a discussion, 'champion' a cause). Evaluate a word based on its function in the sentence, not just your first association with it.",
    "Eliminate the 'Sound-Alikes': If a word sounds great when you read the sentence aloud but doesn't actually mean what the context requires, it's a trap. The SAT tests logic, not poetry.",
    "Positive/Negative Sorting: Quickly classify the required word as positive (+), negative (-), or neutral. If the blank requires a negative word, immediately cross out the positive options before even defining them."
  ],

  commonMistakes: [
    "The 'Smart Word' Magnet: Choosing the most difficult vocabulary word simply because it looks like a 'SAT word,' even when a simpler option fits the context perfectly.",
    "Ignoring the Surrounding Sentences: Focusing so intently on the sentence with the blank that you ignore the preceding or following sentences, which actually contain the definition or context clue required.",
    "The Thesaurus Fallacy: Assuming that because two words are synonyms in a thesaurus, they are interchangeable. Nuance matters—'stubborn' and 'persistent' are synonyms, but one is negative and the other is positive.",
    "Plugging and Rereading: The worst possible strategy. Plugging each word into the blank and rereading the sentence four times wastes time and makes wrong answers sound artificially correct due to repetition."
  ],

  studyTips: [
    "The Blank-Out Drill: Take any complex article (like the NYT or The Atlantic), black out adjectives and verbs, and try to guess what type of word belongs there based purely on sentence structure.",
    "Learn Word Roots: Don't just memorize definitions. Learn Latin and Greek prefixes (e.g., 'bene-', 'mal-', 'circum-'). If you don't know a word on test day, its root can often reveal its positive or negative polarity.",
    "Secondary Definition Journal: Keep a running list of common words that have entirely different secondary meanings (e.g., 'pedestrian' meaning boring, 'plastic' meaning moldable).",
    "Pre-phrasing Practice: Do 10 Words in Context questions without looking at the choices. Write your predicted word in the margin. Only then check the options. See how closely your predictions align with the correct answer."
  ]
};

async function uploadContent() {
  try {
    await db.collection('learningContent').doc('words-in-context').set({
      ...content,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('✅ Words in Context content uploaded successfully to Firestore.');
  } catch (error) {
    console.error('❌ Upload failed:', error);
    process.exit(1);
  }
}

uploadContent();
