/**
 * Upload Script: Command of Evidence Learning Content
 * Run with: node src/scripts/upload_command_evidence_content.js
 * Requires firebase-admin and serviceAccountKey.json at project root
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
  subcategoryId: 'command-of-evidence',
  difficulty: 'Intermediate — Precision Matching Under Pressure',
  estimatedStudyTime: '1.5 – 2 Hours',

  overview: `
<h2>Command of Evidence: Proving Claims with Precision</h2>

<p>Every argument in the world runs on the same engine: a 
<strong style="color: var(--learn-accent-blue)">claim</strong> paired with 
<strong style="color: var(--learn-accent-teal)">evidence that supports it</strong>. 
The SAT's Command of Evidence questions make this engine visible and then test whether 
you can operate it. Your job is not to evaluate whether the claim is true — your job is 
to identify which specific piece of evidence, if presented, would make the claim most 
directly and powerfully supported. Think of yourself as a lawyer who has already written 
the closing argument and now needs to find the exact exhibit from the case file that 
proves the key point beyond doubt.</p>

<div style="text-align: center; margin: 48px 0;">
  <img src="/assets/images/command_evidence_concept.png" alt="Command of Evidence: two question types — Textual Evidence and Quantitative Evidence" style="max-width: 80%; margin: 40px auto; display: block; border-radius: 12px; border: 1px solid var(--learn-border); box-shadow: 0 4px 16px rgba(0,0,0,0.05);" />
  <p style="font-size: 0.85rem; color: var(--learn-text-muted); margin-top: 12px; font-style: italic;">Command of Evidence splits into two distinct question types. Both test the same core skill: matching evidence to a claim with precision.</p>
</div>

<h2>The Two Question Types You Must Master</h2>

<p>The College Board officially categorizes this skill into two variants, and mastering both 
requires slightly different muscle groups:</p>

<h3>Type A: Textual Evidence</h3>
<p><strong style="color: var(--learn-accent-teal)">Textual Evidence questions</strong> pair 
a student-written claim with four quotations from a passage. You must identify which 
quotation, when read alongside the claim, most effectively illustrates or supports that 
specific claim. The key word here is 
<strong style="color: var(--learn-accent-purple)">"illustrates"</strong> — the correct 
quote doesn't just relate to the topic. It provides concrete, on-point evidence that a 
reasonable person would accept as directly proving the claim.</p>

<h3>Type B: Quantitative Evidence</h3>
<p><strong style="color: var(--learn-accent-blue)">Quantitative Evidence questions</strong> 
present a data table, graph, or chart alongside a student's claim. The question asks which 
data point or finding "most directly supports" or "would most logically complete" the 
student's argument. Unlike textual evidence questions, here you must read numbers — 
percentages, rates, comparisons — and judge whether they show what the claim says they 
show, in the direction the claim requires.</p>

<div class="highlight-box">
  <ul style="margin-bottom: 0;">
    <li style="margin-bottom: 12px"><strong>What both types share:</strong> You are always matching evidence to a pre-existing claim. The claim is the target; the evidence is the arrow. Your job is to find the arrow that hits the bullseye — not the arrows that are close, related, or true.</li>
    <li><strong>The critical distinction:</strong> Evidence that is TRUE but does not support the SPECIFIC claim is always wrong. Truth alone is not enough. Relevance and direction are what separate correct from incorrect.</li>
  </ul>
</div>

<h2>The Claim → Support Framework</h2>

<div style="text-align: center; margin: 48px 0;">
  <img src="/assets/images/command_evidence_framework.png" alt="The 4-step Claim to Support framework: Identify the claim, define what proves it, relevance check, direction check" style="max-width: 80%; margin: 40px auto; display: block; border-radius: 12px; border: 1px solid var(--learn-border); box-shadow: 0 4px 16px rgba(0,0,0,0.05);" />
  <p style="font-size: 0.85rem; color: var(--learn-text-muted); margin-top: 12px; font-style: italic;">The 4-step Claim → Support framework converts every Command of Evidence question into a systematic process with no guesswork.</p>
</div>

<p>The four steps work in sequence. First, 
<strong style="color: var(--learn-accent-teal)">identify the exact claim</strong> — 
paraphrase it in your own words so you know precisely what needs to be proven. Second, 
<strong style="color: var(--learn-accent-blue)">predict the evidence shape</strong> — 
before reading the choices, ask yourself: "What would ideal evidence look like here? 
A direct quote from the researcher? A statistic showing X is higher than Y?" This 
prediction inoculates you against answer-choice manipulation.</p>

<p>Third, apply the 
<strong style="color: var(--learn-accent-purple)">Relevance Check</strong> — does each 
piece of evidence address the topic of the claim, or does it wander to a related but 
different point? Ruthlessly eliminate anything that doesn't directly engage with the 
claim's subject. Fourth, apply the 
<strong style="color: var(--learn-accent-teal)">Direction Check</strong> — does the 
evidence show the relationship in the same direction the claim asserts? If the claim says 
"intervention A reduced rates," the correct evidence must show a reduction, not just a 
change, not just a correlation with rates, and definitely not an increase.</p>

<h2>Wrong Answer Engineering: The Three Traps</h2>

<div style="text-align: center; margin: 48px 0;">
  <img src="/assets/images/command_evidence_traps.png" alt="Three Command of Evidence trap types: True but Irrelevant, Directionally Wrong, Too Vague" style="max-width: 80%; margin: 40px auto; display: block; border-radius: 12px; border: 1px solid var(--learn-border); box-shadow: 0 4px 16px rgba(0,0,0,0.05);" />
  <p style="font-size: 0.85rem; color: var(--learn-text-muted); margin-top: 12px; font-style: italic;">The three trap types cover virtually all Command of Evidence wrong answers. Naming the trap is the first step to eliminating it.</p>
</div>

<p>The 
<strong style="color: var(--learn-accent-rose)">True but Irrelevant</strong> trap is the 
most common and most dangerous. These are quotes or data points that are 100% accurate 
and come from the right passage — but they address a different sub-point than what the 
claim requires. Students select them because they feel "on topic." But feeling on topic is 
not the same as providing direct support. Ask yourself: "Does this evidence specifically 
make this specific claim more believable?"</p>

<p>The 
<strong style="color: var(--learn-accent-rose)">Directionally Wrong</strong> trap targets 
students who are moving fast. The evidence is relevant to the topic, but it shows the 
opposite of what the claim asserts. For quantitative questions especially — watch whether 
numbers go up or down, whether a percentage is higher or lower, whether the comparison 
favors group A or group B. The direction of change is everything.</p>

<p>The 
<strong style="color: var(--learn-accent-rose)">Too Vague</strong> trap presents a quote 
or data point that is technically consistent with the claim but far less specific or 
powerful than the correct answer. The correct answer is usually the most 
<em>precise</em>, most <em>targeted</em> evidence — the one that makes the claim 
obvious rather than just plausible.</p>
`,

  keyStrategies: [
    "Pre-Predict the Evidence Shape: Before reading the four answer choices, decide in your own words what ideal evidence would look like. 'I need a quote where the researcher says X directly' or 'I need data showing Y is higher in group A.' This mental target makes the correct answer obvious and wrong answers obviously wrong.",
    "The Claim Surgeon's Precision: Treat the claim like a surgical target — identify its exact boundaries. It claims X about Y in situation Z. The correct evidence addresses X (not just the topic), addresses Y (not a different subject), and addresses Z (not a different condition or timeframe).",
    "Relevance-Then-Direction: Apply a two-gate system. Gate 1: Is this evidence about the right topic? If no, eliminate. Gate 2 (for survivors only): Does this evidence show the right relationship/direction? If no, eliminate. Only answers that pass both gates are candidates.",
    "Quantitative Questions — Read the Labels First: When a table or graph is involved, read all axis labels, column headers, and footnotes before reading the question. Understanding the data structure before the question prevents misreading what the numbers represent.",
    "The 'So What?' Test: After reading an answer choice, mentally append 'So what?' to the end of it and check whether the 'so what' is exactly the claim. If the 'so what' is a different point, it's not supporting this claim — it's supporting a different one."
  ],

  commonMistakes: [
    "The 'Sounds Related' Trap: Selecting a quote or data point because it's from the right passage and discusses the same general topic, without checking whether it specifically supports the stated claim. Relevance to the topic is necessary but not sufficient.",
    "Skipping the Direction Check on Quantitative Data: Seeing that a data answer is about the right variables but not checking whether the numbers run in the direction the claim requires. If the claim says 'decreased' and the data shows an increase — that contradicts, not supports.",
    "Ignoring the Student Claim Setup: In many Command of Evidence questions, a student's argument is presented in a framing sentence before the quoted evidence. Students often rush past this framing, causing them to lose track of what specific point needs to be proven.",
    "Choosing the Most Dramatic Evidence: Selecting the quote that sounds most impressive or has the strongest language, rather than the one that specifically and directly supports the narrow claim. 'Most directly supports' means most exactly — not most impressively."
  ],

  studyTips: [
    "Claim-Mapping Drill: Take any editorial or argument and underline 5 claims. For each claim, search the text for the best supporting evidence and the worst supporting evidence. Articulate why one works and the other doesn't.",
    "Quantitative Evidence Speed Read: Practice reading simple data tables (2×3 or 3×4) and writing one-sentence summaries: 'This table shows X is higher than Y by Z%.' This trains the fast-read-then-match skill needed on test day.",
    "Do Official SAT Reading Passage Sets: The College Board's official practice tests contain Command of Evidence questions in nearly every module. Work through entire sets (not individual questions) so you see how claim-evidence pairs are constructed in context.",
    "Wrong Answer Anatomy Journal: For every Command of Evidence question you get wrong, categorize the wrong answer you chose: True but Irrelevant / Directionally Wrong / Too Vague. After 20 questions, identify your personal weak spot — and drill that specific trap type.",
    "Two-Step Elimination Out Loud: Practice narrating your elimination process aloud: 'Answer A — is it relevant? Yes. Is it the right direction? It shows an increase, but the claim says decrease — eliminated.' Speaking your logic forces precision and reveals faulty reasoning before it costs you points."
  ]
};

async function uploadContent() {
  try {
    await db.collection('learningContent').doc('command-of-evidence').set({
      ...content,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('✅ Command of Evidence content uploaded successfully to Firestore.');
  } catch (error) {
    console.error('❌ Upload failed:', error);
    process.exit(1);
  }
}

uploadContent();
