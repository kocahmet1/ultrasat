/**
 * Upload Script: Inferences Learning Content
 * Run with: node src/scripts/upload_inferences_content.js
 * Requires firebase-admin and GOOGLE_APPLICATION_CREDENTIALS or serviceAccountKey.json
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
  subcategoryId: 'inferences',
  difficulty: 'Intermediate — High Logical Precision Required',
  estimatedStudyTime: '1.5 – 2 Hours',

  overview: `
<h2>Inferences: Reading the Unseen</h2>

<p>Think of a lighthouse casting its beam across dark water. The lighthouse is 
<strong style="color: var(--learn-accent-teal)">the text itself</strong> — explicit, visible, 
and directly illuminating a factual surface. But what lies beneath that surface? The submerged 
part of the iceberg — the 
<strong style="color: var(--learn-accent-blue)">implicit meaning</strong> — is what an 
inference question asks you to articulate. You are not inventing; you are excavating what the 
evidence logically forces you to conclude.</p>

<div style="text-align: center; margin: 48px 0;">
  <img src="/assets/images/inferences_concept.png" alt="Inference concept: the text as a lighthouse illuminating explicit statements, with implicit meaning beneath the surface" style="max-width: 80%; margin: 40px auto; display: block; border-radius: 12px; border: 1px solid var(--learn-border); box-shadow: 0 4px 16px rgba(0,0,0,0.05);" />
  <p style="font-size: 0.85rem; color: var(--learn-text-muted); margin-top: 12px; font-style: italic;">The Iceberg Model: Valid inferences live just below the waterline — they are implied by the text but never explicitly stated.</p>
</div>

<h2>What the SAT Actually Asks</h2>

<p>Inference questions on the Digital SAT appear with stems like:</p>

<div class="highlight-box">
  <ul style="margin-bottom: 0;">
    <li style="margin-bottom: 10px"><em>"Based on the text, what can most reasonably be inferred about…?"</em></li>
    <li style="margin-bottom: 10px"><em>"Which choice most logically completes the text?"</em></li>
    <li><em>"The passage most strongly suggests that…"</em></li>
  </ul>
</div>

<p>These stems share a critical design principle: the word 
<strong style="color: var(--learn-accent-purple)">"most reasonably"</strong> or 
<strong style="color: var(--learn-accent-purple)">"most strongly suggests"</strong> is not 
permission to speculate. It is a precision instrument. The correct answer is the one that a 
careful, literal-minded reader would identify as the single most logical conclusion — not the 
most interesting or most obvious-sounding one.</p>

<h2>The Architecture of a Valid Inference</h2>

<p>A valid SAT inference has three structural components, each of which must hold:</p>

<div class="highlight-box">
  <ul style="margin-bottom: 0;">
    <li style="margin-bottom: 12px"><strong>1. Anchored:</strong> The inference is traceable back to a specific part of the text — a phrase, a sentence, a data point. It does not float freely.</li>
    <li style="margin-bottom: 12px"><strong>2. Necessary:</strong> The conclusion <em>must</em> follow from the evidence. It is not merely plausible or consistent — it is logically required. The word "must" is the gatekeeper.</li>
    <li><strong>3. Bounded:</strong> The inference does not exceed the scope of what the text discusses. It does not import real-world knowledge, personal opinion, or facts about the topic that were not present in the passage.</li>
  </ul>
</div>

<p>This is the fundamental distinction between 
<strong style="color: var(--learn-accent-teal)">a valid inference</strong> and 
<strong style="color: var(--learn-accent-rose)">an assumption</strong>. An inference is 
forced by the text. An assumption is added on top of it. The SAT tests whether you can tell 
the difference — consistently, under time pressure.</p>

<h2>The 3-Step Framework: From Text to Conclusion</h2>

<div style="text-align: center; margin: 48px 0;">
  <img src="/assets/images/inferences_framework.png" alt="3-step inference framework: Anchor to text, Build the logical bridge, Apply the Must Test" style="max-width: 80%; margin: 40px auto; display: block; border-radius: 12px; border: 1px solid var(--learn-border); box-shadow: 0 4px 16px rgba(0,0,0,0.05);" />
  <p style="font-size: 0.85rem; color: var(--learn-text-muted); margin-top: 12px; font-style: italic;">The 3-Step Framework reduces every inference question to a systematic, repeatable process that eliminates guesswork.</p>
</div>

<p>The three steps are: 
<strong style="color: var(--learn-accent-teal)">Anchor to the Text</strong> → 
<strong style="color: var(--learn-accent-blue)">Build the Logical Bridge</strong> → 
<strong style="color: var(--learn-accent-purple)">Apply the Must Test</strong>. 
The Must Test is the most powerful tool you carry into this question type. Before confirming 
any answer, silently replace the question's hedge word ("suggests," "implies," "can 
reasonably be inferred") with the word 
<strong style="color: var(--learn-accent-purple)">"MUST."</strong> 
If the conclusion only could be true, not must be true — it fails. Eliminate it.</p>

<h2>Wrong Answer Anatomy: How the Test Engineers Failure</h2>

<div style="text-align: center; margin: 48px 0;">
  <img src="/assets/images/inferences_traps.png" alt="Four inference trap types: Too Strong, Outside Knowledge, Opposite Direction, Too Narrow" style="max-width: 80%; margin: 40px auto; display: block; border-radius: 12px; border: 1px solid var(--learn-border); box-shadow: 0 4px 16px rgba(0,0,0,0.05);" />
  <p style="font-size: 0.85rem; color: var(--learn-text-muted); margin-top: 12px; font-style: italic;">Every wrong answer falls into one of four engineering categories. Recognize the pattern and you eliminate it instantly.</p>
</div>

<p>The four trap architectures are deliberately constructed. 
<strong style="color: var(--learn-accent-rose)">Too Strong</strong> answers use absolute 
language ("always," "all," "proves") where the text only supports qualified language 
("often," "many," "suggests"). 
<strong style="color: var(--learn-accent-rose)">Outside Knowledge</strong> traps are 
particularly insidious — they introduce facts that are true in the real world but not 
contained in the passage. They reward students who stop reading carefully and start 
reasoning from memory. 
<strong style="color: var(--learn-accent-rose)">Opposite Direction</strong> traps invert 
the relationship the text establishes, catching fast readers who register that an answer 
is "relevant" without checking whether it says the right thing. And 
<strong style="color: var(--learn-accent-rose)">Too Narrow</strong> answers cite a real 
detail but miss the broader inference the question is asking for.</p>

<p>The good news: once you can name the trap, you can see it coming before you even read the answer choices.</p>
`,

  keyStrategies: [
    "The 'Must Test': Before confirming any answer, silently swap the question's hedge word ('suggests', 'implies') for 'MUST BE TRUE'. If the conclusion only could be true, not must be true, eliminate it. This single filter eliminates roughly 60-70% of wrong answers.",
    "Read the Question Stem First: Before diving into the passage, read the question stem carefully. This primes your brain to watch for the specific evidence needed — you're not reading the whole passage cold, you're on a targeted evidence hunt.",
    "Paraphrase-Then-Match: After identifying the relevant evidence in the text, paraphrase it in your own words before looking at the choices. Then match your paraphrase to the answer choices. This prevents the answer choices from hijacking your interpretation.",
    "The Scope Guard: Actively ask yourself 'Does the text actually discuss this?' before selecting an answer. Any answer that introduces a concept, person, place, or causal claim not present in the passage is automatically wrong — no matter how plausible it sounds.",
    "The Language Thermometer: Check the temperature of the answer's language. Absolute words (always, never, all, proves, demonstrates) are almost always too hot for an inference question. Qualified hedges (often, may, can, suggests) are usually closer to the correct temperature."
  ],

  commonMistakes: [
    "The 'True in Real Life' Error: Students pick an answer that is factually accurate about the world but not supported by the specific passage. The SAT does not care what you know about the topic — it only cares what the passage says. Outside knowledge is always wrong.",
    "The 'Too Absolute' Choice: Selecting an answer with unqualified language ('The study proves that...', 'All scientists agree...') when the text uses qualified language ('The study suggests...', 'Many scientists believe...'). The stronger the claim, the harder it is to prove — so stronger is usually wrong.",
    "The 'Close Enough' Collapse: Choosing an answer that is similar to the correct conclusion but subtly wrong — often by adding one extra causal step the text doesn't support. 'A causes B' in the text gets twisted into 'Therefore A is the only cause of B' in the trap answer.",
    "Skipping the Evidence Re-read: Going straight from the question stem to the answer choices without re-reading the specific evidence. This makes you vulnerable to plausible-sounding traps because you're working from memory, not from the text."
  ],

  studyTips: [
    "The 'Shadow' Drill: Read any short paragraph and immediately write down: 'What can I say for certain follows from this text?' before reading any questions. Practice articulating inferences in your own words before seeing answer choices.",
    "Must vs. Might Contrast Sets: Take inference questions you've gotten wrong and categorize each wrong answer as 'Too Strong', 'Outside Knowledge', 'Opposite Direction', or 'Too Narrow'. Pattern recognition across 20+ questions makes traps visible before you read them.",
    "Slow Read on Evidence: Practice deliberately slowing down when you identify the key evidence sentence. Read it twice. Rephrase it. Only then look at the choices. Speed is the enemy of accuracy on inference questions.",
    "Official SAT Question Bank Mining: Inference questions are among the most abundant in the College Board's free question bank. Work through sets of 10 at a time, flagging any answer where you can't cite the exact line of text that supports your choice.",
    "The 'What Is Forced?' Journal: Keep a small notebook where after each practice session you write: 'This passage FORCES me to conclude ___'. Train yourself to see inference as a logical inevitability, not a guess."
  ]
};

async function uploadContent() {
  try {
    await db.collection('learningContent').doc('inferences').set({
      ...content,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('✅ Inferences content uploaded successfully to Firestore.');
  } catch (error) {
    console.error('❌ Upload failed:', error);
    process.exit(1);
  }
}

uploadContent();
