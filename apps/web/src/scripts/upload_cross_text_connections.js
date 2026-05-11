/**
 * Upload Script: Cross-Text Connections Learning Content
 * Run with: node src/scripts/upload_cross_text_connections.js
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
  subcategoryId: 'cross-text-connections',
  difficulty: 'Advanced — Relational Logic and Perspective Shifting',
  estimatedStudyTime: '1.5 – 2 Hours',

  overview: `
<h2>Cross-Text Connections: Mapping the Conversation</h2>

<p>Most reading comprehension asks you to listen to one isolated speaker. 
<strong style="color: var(--learn-accent-purple)">Cross-Text Connections</strong> asks you 
to eavesdrop on a conversation. You will be given two distinct short texts addressing the 
same topic, and your job is to map the relational logic between them. Do they agree? Do 
they fiercely debate? Or does Text 2 offer a slight qualification to Text 1's sweeping 
claim?</p>

<div style="text-align: center; margin: 48px 0;">
  <!-- Placeholder for cross_text_connections_concept.png -->
  <img src="/assets/images/cross_text_connections_concept.png" alt="Cross-Text Connections: Overlapping circles representing the conversation between two authors" style="max-width: 80%; margin: 40px auto; display: block; border-radius: 12px; border: 1px solid var(--learn-border); box-shadow: 0 4px 16px rgba(0,0,0,0.05);" onerror="this.style.display='none'" />
  <p style="font-size: 0.85rem; color: var(--learn-text-muted); margin-top: 12px; font-style: italic;">You are looking for the Venn Diagram overlap: How does Author 2's specific worldview filter Author 1's specific claim?</p>
</div>

<h2>The Core Question Types</h2>

<p>The SAT generally structures these relational questions in one of two ways. You must know 
which game you are playing before you look at the options.</p>

<div class="highlight-box">
  <ul style="margin-bottom: 0;">
    <li style="margin-bottom: 12px"><strong>Type A: The Response Question.</strong> "Based on the texts, how would the author of Text 2 most likely respond to the claim made in Text 1?" Here, you are role-playing as Author 2. You have to evaluate Author 1's statement using only Author 2's specific beliefs.</li>
    <li><strong>Type B: The Relationship Question.</strong> "Which choice best describes the relationship between the two texts?" Here, you are a neutral referee describing the overlap. (e.g., "Text 2 provides a specific counterexample to the generalization in Text 1.")</li>
  </ul>
</div>

<h2>The Dual-Lens Framework</h2>

<div style="text-align: center; margin: 48px 0;">
  <!-- Placeholder for cross_text_connections_framework.png -->
  <img src="/assets/images/cross_text_connections_framework.png" alt="The Dual-Lens Framework: Isolate Text 1, Isolate Text 2, Run the Hypothetical Response" style="max-width: 80%; margin: 40px auto; display: block; border-radius: 12px; border: 1px solid var(--learn-border); box-shadow: 0 4px 16px rgba(0,0,0,0.05);" onerror="this.style.display='none'" />
  <p style="font-size: 0.85rem; color: var(--learn-text-muted); margin-top: 12px; font-style: italic;">Treat the texts as contaminated spaces. Analyze them independently before allowing them to mix.</p>
</div>

<p>To avoid confusing who believes what, treat the texts cautiously using the Dual-Lens method:</p>

<p><strong style="color: var(--learn-accent-teal)">1. Isolate Text 1:</strong> 
Read Text 1 and immediately write a 3-word summary of Author 1's stance. For example, "Technology = very bad." Do this before your brain is contaminated by Text 2.</p>

<p><strong style="color: var(--learn-accent-blue)">2. Isolate Text 2:</strong> 
Read Text 2 independently. Ask yourself: Is Author 2 nodding along, shaking their head, or saying "Yes, but..."? Write down Author 2's stance. "Technology = okay, but dangerous if unregulated."</p>

<p><strong style="color: var(--learn-accent-purple)">3. The Hypothetical Interaction:</strong> 
Now force them together. If Author 1 says "Technology is inherently evil," how would Author 2 respond? Author 2 would say, "I disagree it's inherently evil; the issue is regulation." That dynamic is your prediction for the correct answer.</p>

<h2>Relational Trap Anatomy</h2>

<div style="text-align: center; margin: 48px 0;">
  <!-- Placeholder for cross_text_connections_traps.png -->
  <img src="/assets/images/cross_text_connections_traps.png" alt="Cross-Text Traps: The Text 1 Decoy, Full Agreement Extreme, The Venn Diagram Miss" style="max-width: 80%; margin: 40px auto; display: block; border-radius: 12px; border: 1px solid var(--learn-border); box-shadow: 0 4px 16px rgba(0,0,0,0.05);" onerror="this.style.display='none'" />
  <p style="font-size: 0.85rem; color: var(--learn-text-muted); margin-top: 12px; font-style: italic;">The SAT exploits cognitive overload. Traps are designed for students who merge the two authors into one voice.</p>
</div>

<p>Because you are juggling two sets of ideas under time pressure, the traps prey on memory failure.</p>

<p>The <strong style="color: var(--learn-accent-rose)">Text 1 Decoy Trap</strong> is brilliant. 
When the question asks how Author 2 would respond to Author 1, the trap answer is a statement that Author 1 completely believes. Time-pressured students read it, recognize it from the passage, and select it—forgetting they were supposed to be speaking for Author 2.</p>

<p>The <strong style="color: var(--learn-accent-rose)">Extreme Shift Trap</strong> ruins the nuance. 
Often, Author 2 generally agrees with Author 1 but offers a minor qualification (e.g., this finding only applies to mammals). The trap answer will violently claim that Author 2 "completely refutes" Author 1.</p>

<p>The <strong style="color: var(--learn-accent-rose)">Venn Diagram Miss Trap</strong> occurs when 
an answer choice describes Author 2 responding to a concept discussed in Text 1 that Author 2 never personally mentioned. You cannot make an author have an opinion on a subject they didn't bring up in their text.</p>
`,

  keyStrategies: [
    "The 3-Word Stance: Never read both passages back-to-back without pausing. Read Passage 1. Stop. State their stance in 3 words. Then read Passage 2. State their stance. This anchors your brain.",
    "Roleplay the Author: If asked 'How would Text 2 respond to Text 1', physically point to Text 2. You are now Author 2. You cannot use any logic, outside knowledge, or facts from Text 1 to form your opinion. You can only use what is written in Text 2.",
    "The Nuance Filter: Be highly suspicious of verbs like 'refute' or 'prove wrong'. SAT authors rarely have all-out brawls. They prefer academic qualifications: Author 2 usually 'points out an exception,' 'narrows the scope,' or 'provides an alternative explanation.'",
    "Identify the Core Disagreement: Often, the passages agree on the facts but disagree on the 'why' (the cause) or the 'what next' (the implication). Identify exactly where the authors diverge.",
    "Filter by Mention: If an answer assumes Author 2 cares deeply about a statistical method mentioned in Text 1, but Author 2 never brings it up, cross it out. An author can't respond to a concept they don't discuss."
  ],

  commonMistakes: [
    "Identity Confusion: The single most common error. Picking an answer that reflects Author 1's beliefs when the question clearly asked 'How would Author 2 respond.'",
    "The General Theme Trap: Picking an answer that broadly addresses the general topic both passages share, but fails to capture the specific friction or agreement between the authors.",
    "Assuming Total Opposition: Assuming that because the texts are paired, they must violently disagree. Often they are complementary: Text 1 states a theory, and Text 2 provides a specific case study that proves it.",
    "Reading Answer Choices Too Early: If you try to compare the two texts by looking at the answer choices, the choices will twist your memory. You must predict their relationship before looking down."
  ],

  studyTips: [
    "The Agree/Disagree Margin Drill: When doing practice tests, write 'Agree', 'Disagree', or 'Qualify' in the margin next to Text 2 before reading the question. Force yourself to establish the baseline relationship instantly.",
    "Argument Synthesis Practice: Read two contrasting op-eds on the same news event. Write a single sentence combining them: 'While X argues that..., Y counters that...' This builds relational muscle.",
    "Map the Turn: In texts that disagree, locate the exact sentence in Text 2 that serves as the counter-point to Text 1. Highlighting this 'point of impact' makes the underlying dynamic visible."
  ]
};

async function uploadContent() {
  try {
    await db.collection('learningContent').doc('cross-text-connections').set({
      ...content,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('✅ Cross-Text Connections content uploaded successfully to Firestore.');
  } catch (error) {
    console.error('❌ Upload failed:', error);
    process.exit(1);
  }
}

uploadContent();
