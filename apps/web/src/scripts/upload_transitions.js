/**
 * Upload Script: Transitions Learning Content
 * Run with: node src/scripts/upload_transitions.js
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
  subcategoryId: 'transitions',
  difficulty: 'Intermediate — Relational Logic and Flow',
  estimatedStudyTime: '1 – 1.5 Hours',

  overview: `
<h2>Transitions: The Directional Signs of Logic</h2>

<p>Transition questions are purely mathematical. Think of words like <em>however</em>, 
<em>furthermore</em>, and <em>consequently</em> as directional signs or mathematical operators 
(+, -, =, →). The SAT isolates two sentences: <strong style="color: var(--learn-accent-blue)">Sentence 1 
(the setup)</strong> and <strong style="color: var(--learn-accent-teal)">Sentence 2 (the delivery)</strong>. 
Your job is to identify the logical relationship between them and pick the exact mathematical operator 
that connects them.</p>

<div style="text-align: center; margin: 48px 0;">
  <!-- Placeholder for transitions_concept.png -->
  <img src="/assets/images/transitions_concept.png" alt="Transitions: Mathematical operators (+, -, ->) connecting Sentence 1 and Sentence 2" style="max-width: 80%; margin: 40px auto; display: block; border-radius: 12px; border: 1px solid var(--learn-border); box-shadow: 0 4px 16px rgba(0,0,0,0.05);" onerror="this.style.display='none'" />
  <p style="font-size: 0.85rem; color: var(--learn-text-muted); margin-top: 12px; font-style: italic;">Transitions aren't about style; they are strict logic gates (Support, Contrast, Cause/Effect).</p>
</div>

<h2>The Three Categories of Transitions</h2>

<p>Every transition word in the English language can be aggressively sorted into one of three buckets:</p>

<div class="highlight-box">
  <ul style="margin-bottom: 0;">
    <li style="margin-bottom: 12px"><strong>1. Continuators (The + Sign):</strong> They add similar information, provide an example, or emphasize. (e.g., <em>Furthermore, In fact, Specifically, For example, Similarly</em>)</li>
    <li style="margin-bottom: 12px"><strong>2. Contradictors (The - Sign):</strong> They pivot, reverse direction, or introduce an exception. (e.g., <em>However, Regardless, Nevertheless, In contrast, Conversely</em>)</li>
    <li><strong>3. Causals (The → Sign):</strong> They show cause and effect; the first sentence caused the second. (e.g., <em>Therefore, Consequently, As a result, Thus, Accordingly</em>)</li>
  </ul>
</div>

<p>Your task is never to choose between two functional synonyms (like <em>However</em> vs <em>Nevertheless</em>). 
If two choices belong to the exact same bucket, they are both mathematically wrong.</p>

<h2>The Blank-and-Bridge Framework</h2>

<div style="text-align: center; margin: 48px 0;">
  <!-- Placeholder for transitions_framework.png -->
  <img src="/assets/images/transitions_framework.png" alt="Transitions Framework: Isolate Sentences, Categorize the Bridge, Group and Eliminate" style="max-width: 80%; margin: 40px auto; display: block; border-radius: 12px; border: 1px solid var(--learn-border); box-shadow: 0 4px 16px rgba(0,0,0,0.05);" onerror="this.style.display='none'" />
  <p style="font-size: 0.85rem; color: var(--learn-text-muted); margin-top: 12px; font-style: italic;">Do not read the answers first. Decide the relationship (+, -, →) blindly.</p>
</div>

<p>Solving these correctly requires stopping yourself from just reading the sentence four times 
with four different words to see what "sounds right." Use the Blank-and-Bridge method:</p>

<p><strong style="color: var(--learn-accent-teal)">1. Cross Out the Blank:</strong> 
Read the sentence right before the blank. Stop. Summarize it in your head. ("The weather was terrible.")</p>

<p><strong style="color: var(--learn-accent-blue)">2. Read the Target Sentence:</strong> 
Read the sentence with the blank, but <em>skip over the blank completely</em>. Summarize it. ("The picnic was a huge success.")</p>

<p><strong style="color: var(--learn-accent-purple)">3. Build the Bridge:</strong> 
What is the relationship between "Terrible weather" and "Huge success"? It's a contrast (-). Now look at your choices and eliminate any Continuator (+) or Causal (→) words immediately.</p>

<h2>Trap Logic: The Synonyms and the Fake Causals</h2>

<div style="text-align: center; margin: 48px 0;">
  <!-- Placeholder for transitions_traps.png -->
  <img src="/assets/images/transitions_traps.png" alt="Transition Traps: The Synonym Elimination, The Fake Cause/Effect, The Redundant Transition" style="max-width: 80%; margin: 40px auto; display: block; border-radius: 12px; border: 1px solid var(--learn-border); box-shadow: 0 4px 16px rgba(0,0,0,0.05);" onerror="this.style.display='none'" />
  <p style="font-size: 0.85rem; color: var(--learn-text-muted); margin-top: 12px; font-style: italic;">The SAT exploits grammar rules with logical sleight-of-hand.</p>
</div>

<p>The <strong style="color: var(--learn-accent-rose)">Synonym Elimination Trap</strong> 
is actually a gift. If choice A is "Furthermore" and choice B is "Additionally," neither can be the right answer. The SAT cannot have two correct answers, so identical operators eliminate each other immediately.</p>

<p>The <strong style="color: var(--learn-accent-rose)">Fake Cause/Effect Trap</strong> 
(using 'Therefore' or 'Consequently') is highly common. Two sentences will be related, but one didn't strictly CAUSE the other. If Sentence 1 is "Tom likes apples" and Sentence 2 is "Tom likes oranges," he doesn't like oranges <em>because</em> he likes apples. "Similarly" (+) is correct; "Consequently" (→) is a trap.</p>

<p>The <strong style="color: var(--learn-accent-rose)">Time vs. Contrast Confusion</strong> 
often traps students using words like "Meanwhile" or "Subsequently." Make sure you are paying attention to whether the text is telling a chronological story (First... Next... Finally) or making an argument.</p>
`,

  keyStrategies: [
    "The 3-Bucket Sort: When you look at the four answer choices, mentally tag them as (+), (-), or (→). If three are (+), and you need a contrast, the one (-) choice is the answer, no matter how weird it sounds.",
    "The Synonym Strikeout: If two transition words essentially mean the exact same logical thing (e.g., 'However' and 'Nevertheless'), cross them both out. They destroy each other.",
    "Mask and Summarize: Never read the options into the blank. It hacks your auditory processing to make terrible logic sound okay. Read sentence A. Read sentence B. Define the logic. Then, and only then, look at the choices.",
    "Validate 'For Example': If you want to choose 'For example' or 'Specifically', check Sentence 2. Is it a narrower, specific subset of a broader claim made in Sentence 1? If not, it's incorrect."
  ],

  commonMistakes: [
    "The 'Sounds Good' Disease: Plugging in choices to see what 'flows' nicely. 'Consequently' almost always sounds smart and flows well, even when there is absolutely no cause-and-effect relationship.",
    "Ignoring the Previous Sentence: Focusing so much on the sentence that actually contains the blank that you forget the transition is a bridge. A bridge must connect to the landmass behind it.",
    "Misunderstanding 'However': Believing 'however' just means a mild shift. 'However' requires a hard structural pivot. Example: (Expectation vs. Reality) or (Pro vs. Con)."
  ],

  studyTips: [
    "The Bucket List: Write down 20 common SAT transition words and force yourself to categorize them into Continuators (+), Contradictors (-), and Causals (→). Knowing the exact function of 'Indeed' vs 'Instead' is crucial.",
    "The 'Why Not' Drill: When doing practice questions, don't just pick the right transition. Write down precisely why the other three transition buckets logically fail to connect the two sentences.",
    "Chronology vs Logic Practice: Practice differentiating between 'Subsequently' (time order: this happened, then this happened) versus 'Consequently' (causal order: this happened BECAUSE this happened). They are not interchangeable."
  ]
};

async function uploadContent() {
  try {
    await db.collection('learningContent').doc('transitions').set({
      ...content,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('✅ Transitions content uploaded successfully.');
  } catch (error) {
    console.error('❌ Upload failed:', error);
    process.exit(1);
  }
}

uploadContent();
