/**
 * Upload Script: Rhetorical Synthesis Learning Content
 * Run with: node src/scripts/upload_rhetorical_synthesis.js
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
  subcategoryId: 'rhetorical-synthesis',
  difficulty: 'Foundational — Goal-Oriented Filtering',
  estimatedStudyTime: '1 – 1.5 Hours',

  overview: `
<h2>Rhetorical Synthesis: The Goal Filters Everything</h2>

<p>Rhetorical Synthesis questions are unique on the SAT because they hand you all the information 
upfront. You are given a list of loosely connected bullet points (a student's "notes") and asked 
to choose the sentence that best accomplishes a highly specific goal. You are not reading for 
comprehension here; you are acting as an editor. The <strong style="color: var(--learn-accent-blue)">student's 
notes are the raw material</strong>, and the <strong style="color: var(--learn-accent-teal)">bolded goal 
in the question prompt is the blueprint</strong>.</p>

<div style="text-align: center; margin: 48px 0;">
  <!-- Placeholder for rhetorical_synthesis_concept.png -->
  <img src="/assets/images/rhetorical_synthesis_concept.png" alt="Rhetorical Synthesis: Passing notes through a specific goal filter" style="max-width: 80%; margin: 40px auto; display: block; border-radius: 12px; border: 1px solid var(--learn-border); box-shadow: 0 4px 16px rgba(0,0,0,0.05);" onerror="this.style.display='none'" />
  <p style="font-size: 0.85rem; color: var(--learn-text-muted); margin-top: 12px; font-style: italic;">The Goal Filter: Information in the answer choice must match the prompt's specific instructions. Truth is irrelevant if it doesn't serve the goal.</p>
</div>

<h2>The Anatomy of the Synthesis Prompt</h2>

<p>The prompt will always begin: "The student wants to..." followed by a specific rhetorical aim. 
This aim is the only thing that matters.</p>

<div class="highlight-box">
  <ul style="margin-bottom: 0;">
    <li style="margin-bottom: 12px"><strong>Contrast Goals:</strong> "The student wants to emphasize the difference between X and Y." (The answer <em>must</em> mention both X and Y and use a contrast word like 'but' or 'whereas'.)</li>
    <li style="margin-bottom: 12px"><strong>Detail Goals:</strong> "The student wants to provide a specific example of the methodology." (The answer <em>must</em> contain the specific mechanics of how the study was done, not just the results.)</li>
    <li><strong>Introduction Goals:</strong> "The student wants to introduce the scientist to an audience unfamiliar with her field." (The answer <em>must</em> state who she is and define her job or general accomplishment.)</li>
  </ul>
</div>

<p>If an answer choice contains absolutely true information from the bullet points but fails to 
accomplish the exact verb in the prompt, it is wrong. It doesn't matter how well-written it is.</p>

<h2>The 3-Step Information Filter</h2>

<div style="text-align: center; margin: 48px 0;">
  <!-- Placeholder for rhetorical_synthesis_framework.png -->
  <img src="/assets/images/rhetorical_synthesis_framework.png" alt="Rhetorical Synthesis Framework: Read the Goal, Identify Necessary Notes, the Yes/No Test" style="max-width: 80%; margin: 40px auto; display: block; border-radius: 12px; border: 1px solid var(--learn-border); box-shadow: 0 4px 16px rgba(0,0,0,0.05);" onerror="this.style.display='none'" />
  <p style="font-size: 0.85rem; color: var(--learn-text-muted); margin-top: 12px; font-style: italic;">Skip the bullet points initially. The goal is the only lens you need.</p>
</div>

<p>The most efficient way to solve these is backwards:</p>

<p><strong style="color: var(--learn-accent-teal)">1. Read the Goal First:</strong> 
Skip over the bullet points entirely and read the bolded goal at the bottom. Identify the exact action required ("contrast", "introduce", "explain the cause").</p>

<p><strong style="color: var(--learn-accent-blue)">2. Scan the Bullets for Key Ammo:</strong> 
Now look up at the bullet points to find the specific facts that fulfill the goal. Mentally check them off. If the goal is "contrast sizes," find the two size measurements.</p>

<p><strong style="color: var(--learn-accent-purple)">3. The Ruthless Yes/No Checklist:</strong> 
Evaluate the answer choices strictly logically. Does Choice A have the first piece of info? Yes. Does it have the second? No. Cross it out. Do not read them for flow or style; read them like a checklist.</p>

<h2>The Distractor Engineering</h2>

<div style="text-align: center; margin: 48px 0;">
  <!-- Placeholder for rhetorical_synthesis_traps.png -->
  <img src="/assets/images/rhetorical_synthesis_traps.png" alt="Rhetorical Synthesis Traps: The Summary Trap, The Missing Half Trap, The Right Fact/Wrong Goal Trap" style="max-width: 80%; margin: 40px auto; display: block; border-radius: 12px; border: 1px solid var(--learn-border); box-shadow: 0 4px 16px rgba(0,0,0,0.05);" onerror="this.style.display='none'" />
  <p style="font-size: 0.85rem; color: var(--learn-text-muted); margin-top: 12px; font-style: italic;">Trap answers flawlessly summarize information you just read—they just don't answer the prompt.</p>
</div>

<p>The <strong style="color: var(--learn-accent-rose)">Summary Trap</strong> is the most common. 
The answer beautifully combines almost all the bullet points into a single, cohesive sentence. However, the prompt asked to "emphasize a single disadvantage," while the summary focuses heavily on advantages. It's a great sentence, but a wrong answer.</p>

<p>The <strong style="color: var(--learn-accent-rose)">Missing Half Trap</strong> occurs when 
the prompt demands a specific relationship ("contrast X and Y") and the answer choice provides intricate details about X, but entirely fails to mention Y.</p>

<p>The <strong style="color: var(--learn-accent-rose)">Right Fact, Wrong Goal Trap</strong> 
gives you the correct subjects but uses them for the wrong purpose. The prompt wants to "explain the results of the study," and the answer choice tells you "where the study was conducted."</p>
`,

  keyStrategies: [
    "Skip the Notes Initially: Start at the bottom of the question. Reading the 5-6 bulleted notes before you know the goal is a waste of working memory. Read the goal, then hunt for the specific notes that fulfill it.",
    "The Mechanic's Checklist: Break the prompt's goal into a 2-part or 3-part checklist. Example: 'Introduce the painting and its artist.' Checklist: 1. Painting Name? 2. Artist Name? If an answer option lacks either, kill it immediately.",
    "Ignore Writing Quality: The SAT is not grading your aesthetic taste. Often, the correct answer in Rhetorical Synthesis feels slightly clunky or repetitive. If it perfectly satisfies the goal, it is right, no matter how unpoetic it sounds.",
    "Beware of 'True' Statements: Every single answer choice will contain true statements drawn from the notes. Truth is the baseline, not the deciding factor. The only deciding factor is alignment with the prompt's explicit goal."
  ],

  commonMistakes: [
    "Reading the Bullet Points Top-to-Bottom: Trying to memorize the unconnected facts about a random historical figure before reading the question prompt.",
    "Picking the Most Comprehensive Answer: Assuming the longest answer that packs in the most bullet points is automatically correct. 'More info' does not equal 'better fulfillment of a narrow goal.'",
    "Missing 'Audience' Constraints: If the prompt says 'Introduce the topic to an audience unfamiliar with it,' you cannot pick an answer that jumps straight into complex jargon without defining the core topic first."
  ],

  studyTips: [
    "The Highlight Drill: Print out 10 Rhetorical Synthesis questions. Highlight the specific goal in the prompt. Then highlight the exact words in the correct answer that execute that goal. Notice how mechanical the mapping is.",
    "Create Your Own Syntheses: Give yourself 5 random facts about a favorite movie. Write three different sentences that try to achieve three different goals: 1) Contrast it with another movie, 2) Summarize the plot, 3) Highlight its critical reception.",
    "The Elimination Aloud Drill: Look at a wrong answer and say out loud exactly why it fails the prompt. 'Choice B tells me when it was built, but the prompt asked me to explain WHY it was built. Eliminated.'"
  ]
};

async function uploadContent() {
  try {
    await db.collection('learningContent').doc('rhetorical-synthesis').set({
      ...content,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('✅ Rhetorical Synthesis content uploaded successfully.');
  } catch (error) {
    console.error('❌ Upload failed:', error);
    process.exit(1);
  }
}

uploadContent();
