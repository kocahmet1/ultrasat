/**
 * AI Companion Service
 * Provides SAT Coach functionality using OpenAI GPT-5-mini and Realtime API
 */

const OpenAI = require('openai');

// Initialize OpenAI client
const getOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is required for AI Companion features');
  }
  return new OpenAI({ apiKey });
};

// Model configuration
const TEXT_MODEL = process.env.COMPANION_MODEL || 'gpt-5-mini';
const REALTIME_MODEL = process.env.REALTIME_MODEL || 'gpt-realtime-mini-2025-12-15';
const REALTIME_VOICE = process.env.REALTIME_VOICE || 'cedar';

// ─── Subcategory reference data (mirror of frontend constants) ───
// Kebab-case doc ID → human-readable name
const SUBCATEGORY_NAME_MAP = {
  'central-ideas-details': 'Central Ideas and Details',
  'inferences': 'Inferences',
  'command-of-evidence': 'Command of Evidence',
  'words-in-context': 'Words in Context',
  'text-structure-purpose': 'Text Structure and Purpose',
  'cross-text-connections': 'Cross-Text Connections',
  'rhetorical-synthesis': 'Rhetorical Synthesis',
  'transitions': 'Transitions',
  'boundaries': 'Boundaries',
  'form-structure-sense': 'Form, Structure, and Sense',
  'linear-equations-one-variable': 'Linear Equations in One Variable',
  'linear-functions': 'Linear Functions',
  'linear-equations-two-variables': 'Linear Equations in Two Variables',
  'systems-linear-equations': 'Systems of Linear Equations',
  'linear-inequalities': 'Linear Inequalities',
  'nonlinear-functions': 'Nonlinear Functions',
  'nonlinear-equations': 'Nonlinear Equations',
  'equivalent-expressions': 'Equivalent Expressions',
  'ratios-rates-proportions': 'Ratios, Rates, and Proportions',
  'percentages': 'Percentages',
  'one-variable-data': 'One-Variable Data',
  'two-variable-data': 'Two-Variable Data',
  'probability': 'Probability',
  'inference-statistics': 'Inference from Statistics',
  'evaluating-statistical-claims': 'Evaluating Statistical Claims',
  'area-volume': 'Area and Volume',
  'lines-angles-triangles': 'Lines, Angles, and Triangles',
  'right-triangles-trigonometry': 'Right Triangles and Trigonometry',
  'circles': 'Circles'
};

// Kebab-case → subject section (1 = R&W, 2 = Math)
const SUBCATEGORY_SECTION = {
  'central-ideas-details': 1, 'inferences': 1, 'command-of-evidence': 1,
  'words-in-context': 1, 'text-structure-purpose': 1, 'cross-text-connections': 1,
  'rhetorical-synthesis': 1, 'transitions': 1, 'boundaries': 1, 'form-structure-sense': 1,
  'linear-equations-one-variable': 2, 'linear-functions': 2,
  'linear-equations-two-variables': 2, 'systems-linear-equations': 2,
  'linear-inequalities': 2, 'nonlinear-functions': 2, 'nonlinear-equations': 2,
  'equivalent-expressions': 2, 'ratios-rates-proportions': 2, 'percentages': 2,
  'one-variable-data': 2, 'two-variable-data': 2, 'probability': 2,
  'inference-statistics': 2, 'evaluating-statistical-claims': 2,
  'area-volume': 2, 'lines-angles-triangles': 2, 'right-triangles-trigonometry': 2,
  'circles': 2
};

/**
 * Build the system prompt for SAT Coach personality
 */
const buildSystemPrompt = () => `You are SAT Coach, a knowledgeable and supportive mentor helping a student prepare for the SAT.

PERSONALITY:
- Warm but not over-the-top—no excessive praise or emojis
- Direct and honest about areas needing improvement
- Encouraging without being sycophantic
- Strategic—always suggest ONE clear next action

TONE EXAMPLES:
✓ "Your algebra is solid. Geometry could use some work—want to start there?"
✓ "Three days in a row—that consistency will pay off."
✗ "Amazing job!!! 🎉🎉🎉 You're doing SO well!!!"
✗ "Great work, superstar! You're absolutely crushing it!"

ALWAYS:
- Be specific with data when available
- Give one clear recommendation, not a list
- Acknowledge the student's effort honestly
- Keep responses concise (2-4 sentences max for greetings)`;

/**
 * Build user context string for AI prompts
 * @param {Object} userContext - Aggregated user data
 * @returns {string} - Formatted context for AI
 */
const buildUserContextString = (userContext) => {
  const parts = [];

  // ── Basic profile ──
  if (userContext.displayName) {
    parts.push(`Student name: ${userContext.displayName}`);
  }

  // ── Most recent activity (placed first so AI prioritizes it) ──
  if (userContext.recentActivity) {
    parts.push(`MOST RECENT ACTIVITY: ${userContext.recentActivity}`);
  }

  if (userContext.targetScore) {
    parts.push(`Target SAT score: ${userContext.targetScore}`);
  }

  if (userContext.examDate) {
    const daysUntil = Math.ceil((new Date(userContext.examDate) - new Date()) / (1000 * 60 * 60 * 24));
    parts.push(`Days until SAT: ${daysUntil}`);
  }

  // ── Estimated SAT score (computed server-side) ──
  if (userContext.estimatedScore) {
    parts.push(`Current estimated SAT score: ${userContext.estimatedScore}`);
    if (userContext.scoreConfidence) {
      parts.push(`Score confidence: ${userContext.scoreConfidence}%`);
    }
    if (userContext.scoreBreakdown) {
      const b = userContext.scoreBreakdown;
      if (b.readingWriting) parts.push(`  Reading & Writing section: ${b.readingWriting.score} (based on ${b.readingWriting.attempts} questions)`);
      if (b.math) parts.push(`  Math section: ${b.math.score} (based on ${b.math.attempts} questions)`);
    }
  }

  // ── Study habits ──
  if (userContext.streak !== undefined) {
    parts.push(`Current study streak: ${userContext.streak} days`);
  }

  if (userContext.lastLoginDaysAgo !== undefined) {
    if (userContext.lastLoginDaysAgo === 0) {
      parts.push('Last login: Today');
    } else if (userContext.lastLoginDaysAgo === 1) {
      parts.push('Last login: Yesterday');
    } else {
      parts.push(`Last login: ${userContext.lastLoginDaysAgo} days ago`);
    }
  }

  // ── Overall questions & accuracy ──
  if (userContext.questionsAttempted !== undefined && userContext.questionsAttempted > 0) {
    parts.push(`Total questions attempted: ${userContext.questionsAttempted}`);
  }

  if (userContext.overallAccuracy !== undefined && userContext.overallAccuracy !== null) {
    parts.push(`Overall accuracy: ${userContext.overallAccuracy}%`);
  }

  // ── Practice exam history ──
  if (userContext.practiceExams && userContext.practiceExams.length > 0) {
    parts.push('');
    parts.push(`PRACTICE EXAM HISTORY (${userContext.practiceExams.length} completed):`);
    userContext.practiceExams.forEach((exam, i) => {
      const dateStr = exam.completedAt ? new Date(exam.completedAt).toLocaleDateString() : 'Unknown date';
      let examLine = `  ${i + 1}. ${exam.examTitle || 'Practice Exam'} — Score: ${exam.overallScore ?? 'N/A'}/${exam.totalQuestions ?? '?'}`;
      if (exam.scores) {
        const rwScore = exam.scores.readingWriting ?? exam.scores['reading-writing'];
        const mathScore = exam.scores.math;
        if (rwScore !== undefined || mathScore !== undefined) {
          examLine += ` (R&W: ${rwScore ?? '?'}, Math: ${mathScore ?? '?'})`;
        }
      }
      examLine += ` — ${dateStr}`;
      if (exam.isDiagnostic) examLine += ' [Diagnostic]';
      parts.push(examLine);
    });
  }

  // ── Recent quiz results ──
  if (userContext.recentQuizzes && userContext.recentQuizzes.length > 0) {
    parts.push('');
    parts.push(`RECENT QUIZ RESULTS (last ${userContext.recentQuizzes.length}):`);
    userContext.recentQuizzes.forEach((quiz, i) => {
      const subcatName = SUBCATEGORY_NAME_MAP[quiz.subcategoryId] || quiz.subcategoryId || 'Unknown';
      const dateStr = quiz.completedAt ? new Date(quiz.completedAt).toLocaleDateString() : '';
      parts.push(`  ${i + 1}. ${subcatName} (Level ${quiz.level ?? '?'}) — ${quiz.score ?? '?'}/${quiz.questionCount ?? '?'} ${quiz.passed ? '✓ Passed' : '✗ Failed'} — ${dateStr}`);
    });
  }

  // ── Per-subcategory progress (Reading & Writing) ──
  if (userContext.subcategoryDetails && userContext.subcategoryDetails.length > 0) {
    const rwSubs = userContext.subcategoryDetails.filter(s => s.section === 1);
    const mathSubs = userContext.subcategoryDetails.filter(s => s.section === 2);

    if (rwSubs.length > 0) {
      parts.push('');
      parts.push('READING & WRITING SUBCATEGORY PROGRESS:');
      rwSubs.forEach(s => {
        const status = s.mastered ? '★ Mastered' : `Level ${s.level}/3`;
        const accStr = s.accuracyLast10 !== null ? `${s.accuracyLast10}% accuracy (last 10)` : 'No data yet';
        const qStr = s.totalQuestions > 0 ? `${s.totalQuestions} questions answered` : '';
        parts.push(`  • ${s.name}: ${status} — ${accStr}${qStr ? ', ' + qStr : ''}`);
      });
    }

    if (mathSubs.length > 0) {
      parts.push('');
      parts.push('MATH SUBCATEGORY PROGRESS:');
      mathSubs.forEach(s => {
        const status = s.mastered ? '★ Mastered' : `Level ${s.level}/3`;
        const accStr = s.accuracyLast10 !== null ? `${s.accuracyLast10}% accuracy (last 10)` : 'No data yet';
        const qStr = s.totalQuestions > 0 ? `${s.totalQuestions} questions answered` : '';
        parts.push(`  • ${s.name}: ${status} — ${accStr}${qStr ? ', ' + qStr : ''}`);
      });
    }
  }

  // ── Weak and strong areas (summary) ──
  if (userContext.weakAreas && userContext.weakAreas.length > 0) {
    parts.push('');
    parts.push(`Weakest areas (below 60% accuracy): ${userContext.weakAreas.join(', ')}`);
  }

  if (userContext.strongAreas && userContext.strongAreas.length > 0) {
    parts.push(`Strongest areas (80%+ accuracy): ${userContext.strongAreas.join(', ')}`);
  }

  // (Recent activity is already included at the top of the context)

  return parts.join('\n');
};

/**
 * Generate a personalized login greeting
 * @param {Object} userContext - User's learning context
 * @returns {Promise<Object>} - Greeting message and suggested actions
 */
exports.generateGreeting = async (userContext) => {
  const openai = getOpenAIClient();

  const contextString = buildUserContextString(userContext);

  const prompt = `Generate a brief, personalized greeting for a returning SAT prep student.

STUDENT CONTEXT:
${contextString}

REQUIREMENTS:
- 2-3 sentences maximum
- ALWAYS reference the student's MOST RECENT ACTIVITY first (the latest quiz or exam they completed). This is the most important thing to acknowledge.
- Then suggest ONE clear next action based on their weakest areas or logical next step
- Be warm but not sycophantic
- Do NOT reference older activity when there is newer activity available

Respond with JSON:
{
  "greeting": "Your greeting message here",
  "suggestedAction": {
    "label": "Button label",
    "route": "/path-to-page",
    "type": "quiz|exam|review|practice"
  }
}`;

  try {
    const response = await openai.responses.create({
      model: TEXT_MODEL,
      input: [
        { role: 'system', content: buildSystemPrompt() },
        { role: 'user', content: prompt }
      ],
      text: { format: { type: 'json_object' } }
    });

    const result = JSON.parse(response.output_text);
    return {
      greeting: result.greeting,
      suggestedAction: result.suggestedAction,
      generatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error generating greeting:', error);

    // Fallback greeting
    return {
      greeting: `Welcome back${userContext.displayName ? ', ' + userContext.displayName : ''}! Ready to continue your SAT prep?`,
      suggestedAction: {
        label: 'Start Practice',
        route: '/smart-quiz-generator',
        type: 'quiz'
      },
      generatedAt: new Date().toISOString(),
      fallback: true
    };
  }
};

/**
 * Generate next step recommendations
 * @param {Object} userContext - User's learning context
 * @returns {Promise<Object>} - Recommended actions
 */
exports.getNextSteps = async (userContext) => {
  const openai = getOpenAIClient();

  const contextString = buildUserContextString(userContext);

  const prompt = `Based on this student's current progress, recommend ONE primary next step for their SAT prep.

STUDENT CONTEXT:
${contextString}

REQUIREMENTS:
- Focus on their biggest opportunity for improvement
- Be specific about what to practice
- Explain briefly why this is the priority

Respond with JSON:
{
  "recommendation": "Your recommendation text (2-3 sentences)",
  "action": {
    "label": "Button label",
    "route": "/path-to-page",
    "type": "quiz|exam|review|lesson"
  },
  "priority": "high|medium|low",
  "reason": "Brief reason why this is important"
}`;

  try {
    const response = await openai.responses.create({
      model: TEXT_MODEL,
      input: [
        { role: 'system', content: buildSystemPrompt() },
        { role: 'user', content: prompt }
      ],
      text: { format: { type: 'json_object' } }
    });

    return JSON.parse(response.output_text);
  } catch (error) {
    console.error('Error generating next steps:', error);

    // Fallback recommendation
    return {
      recommendation: 'Continue practicing to build your skills. Focus on areas where you need the most improvement.',
      action: {
        label: 'Practice Quiz',
        route: '/smart-quiz-generator',
        type: 'quiz'
      },
      priority: 'medium',
      reason: 'Regular practice is key to SAT success',
      fallback: true
    };
  }
};

/**
 * Create an ephemeral token for Realtime API WebRTC connection
 * Uses REST API since SDK doesn't have realtime.sessions.create
 * @param {Object} userContext - User's learning context
 * @returns {Promise<Object>} - Ephemeral token and session config
 */
exports.createVoiceSession = async (userContext) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is required for voice features');
  }

  const contextString = buildUserContextString(userContext);

  const voiceInstructions = `${buildSystemPrompt()}

CURRENT STUDENT CONTEXT:
${contextString}

VOICE-SPECIFIC GUIDELINES:
- Keep responses conversational and natural
- Aim for 15-30 seconds of speech per response
- Listen for the student's specific questions
- If they ask about progress, reference their actual data
- If they ask what to do, give ONE clear suggestion`;

  try {
    // Call OpenAI Realtime sessions endpoint directly via REST
    const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: REALTIME_MODEL,
        voice: REALTIME_VOICE,
        instructions: voiceInstructions,
        input_audio_transcription: { model: 'whisper-1' },
        turn_detection: { type: 'server_vad' }
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Realtime API error:', response.status, errorData);
      throw new Error(`Realtime API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      token: data.client_secret?.value || data.client_secret,
      expiresAt: data.client_secret?.expires_at || data.expires_at,
      model: REALTIME_MODEL,
      voice: REALTIME_VOICE
    };
  } catch (error) {
    console.error('Error creating voice session:', error);
    throw new Error('Failed to initialize voice session. Please try again.');
  }
};

/**
 * Handle multi-turn onboarding chat conversation
 * Guides first-time users through a conversational setup flow
 * @param {Array} messages - Conversation history [{role, content}, ...]
 * @param {Object} userContext - Basic user context (name, etc.)
 * @returns {Promise<Object>} - AI response with message, quickReplies, action, collectData
 */
exports.handleOnboardingChat = async (messages, userContext) => {
  const openai = getOpenAIClient();

  const onboardingSystemPrompt = `You are SAT Coach, warmly welcoming a brand-new student to UltraSAT Prep.

YOUR GOAL: Guide them through a brief, friendly onboarding conversation (3-5 exchanges) to understand their needs and suggest taking a diagnostic Predictive Test.

CONVERSATION FLOW:
1. WELCOME: Greet the student by name if available. Express excitement about helping them. Ask if they've taken the SAT before or if this is their first time preparing.
2. EXPERIENCE: Based on their answer, ask about their target score (if they have one) and when they plan to take the test.
3. GOALS: Acknowledge their goals. Explain that UltraSAT has a Predictive Test that can estimate their current score level and identify their strengths/weaknesses in ~10 minutes.
4. SUGGEST TEST: Strongly recommend taking the Predictive Test as the best first step. Make it sound exciting and low-pressure ("no preparation needed, just see where you stand").
5. WRAP UP: If they agree, provide the action to navigate to the Predictive Test. If they want to explore first, suggest the Practice Exams or Progress Dashboard.

PERSONALITY:
- Warm, encouraging, genuinely excited to help
- Concise — keep each message to 2-4 sentences
- NOT sycophantic or over-the-top with emojis
- Professional mentor energy

STUDENT CONTEXT:
${userContext.displayName ? `Name: ${userContext.displayName}` : 'New student (name unknown)'}

RESPONSE FORMAT (strict JSON):
{
  "message": "Your conversational message here",
  "quickReplies": ["Option 1", "Option 2"],
  "action": null,
  "collectData": null
}

FIELD RULES:
- "quickReplies": Array of 2-4 short suggested replies the student can click. Always provide these.
- "action": Set to {"type": "navigate", "route": "/predictive-exam", "label": "Take Predictive Test"} ONLY when the student agrees to take the test. Otherwise null.
- "collectData": Set to {"targetScore": number, "examDate": "YYYY-MM-DD"} if the student mentions specific goals. Otherwise null. Only include fields they actually mentioned.
- Keep quickReplies short (2-6 words each).`;

  try {
    const aiMessages = [
      { role: 'system', content: onboardingSystemPrompt },
      ...messages
    ];

    const response = await openai.responses.create({
      model: TEXT_MODEL,
      input: aiMessages,
      text: { format: { type: 'json_object' } }
    });

    const result = JSON.parse(response.output_text);
    return {
      message: result.message,
      quickReplies: result.quickReplies || [],
      action: result.action || null,
      collectData: result.collectData || null
    };
  } catch (error) {
    console.error('Error in onboarding chat:', error);

    // Intelligent fallback based on conversation length
    const turnCount = messages.filter(m => m.role === 'user').length;

    if (turnCount === 0) {
      return {
        message: `Welcome to UltraSAT Prep${userContext.displayName ? ', ' + userContext.displayName : ''}! I'm your SAT Coach, and I'm here to help you build a personalized study plan. Have you taken the SAT before, or is this your first time preparing?`,
        quickReplies: ["First time preparing", "I've taken it before", "Just exploring"],
        action: null,
        collectData: null
      };
    } else {
      return {
        message: "Great! The best way to get started is with our Predictive Test — it takes about 10 minutes and gives us a clear picture of where you stand. Ready to give it a try?",
        quickReplies: ["Let's do it!", "Maybe later"],
        action: null,
        collectData: null
      };
    }
  }
};

/**
 * Aggregate user context from Firebase data
 * Pulls ALL available user activity data for comprehensive AI awareness
 * @param {Object} firebaseAdmin - Firebase Admin instance
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Aggregated user context
 */
exports.aggregateUserContext = async (firebaseAdmin, userId) => {
  if (!firebaseAdmin) {
    return { userId, incomplete: true };
  }

  const db = firebaseAdmin.firestore();
  const context = { userId };

  try {
    // ──────────────────────────────────────────────
    // Run all Firestore queries in parallel
    // ──────────────────────────────────────────────
    const [
      userDoc,
      loginSnapshot,
      progressSnapshot,
      practiceExamsSnapshot,
      quizSnapshot,
      questionAttemptsSnapshot
    ] = await Promise.all([
      // 1. User profile
      db.collection('users').doc(userId).get(),

      // 2. Login history (last 2 for streak calculation)
      db.collection('users').doc(userId)
        .collection('loginHistory').orderBy('timestamp', 'desc').limit(2).get(),

      // 3. Subcategory progress (FIXED: was 'subcategoryProgress', now 'progress')
      db.collection('users').doc(userId)
        .collection('progress').get(),

      // 4. Practice exam history (last 10, most recent first)
      db.collection('users').doc(userId)
        .collection('practiceExams').orderBy('completedAt', 'desc').limit(10).get(),

      // 5. Quiz results from smartQuizzes (last 20)
      db.collection('smartQuizzes')
        .where('userId', '==', userId)
        .where('status', '==', 'completed')
        .orderBy('completedAt', 'desc')
        .limit(20).get(),

      // 6. Question attempts for SAT score calculation (last 100)
      db.collection('questionAttempts')
        .where('userId', '==', userId)
        .orderBy('attemptedAt', 'desc')
        .limit(100).get()
    ]);

    // ──────────────────────────────────────────────
    // 1. User profile
    // ──────────────────────────────────────────────
    if (userDoc.exists) {
      const userData = userDoc.data();
      context.displayName = userData.displayName || userData.email?.split('@')[0];
      context.targetScore = userData.targetScore;
      context.examDate = userData.examDate?.toDate?.() || userData.examDate;
      context.onboardingComplete = userData.onboardingComplete || false;
    }

    // ──────────────────────────────────────────────
    // 2. Login history / streak
    // ──────────────────────────────────────────────
    if (!loginSnapshot.empty) {
      const logins = loginSnapshot.docs.map(d => d.data().timestamp?.toDate?.() || new Date(d.data().timestamp));
      if (logins.length > 0) {
        const lastLogin = logins[0];
        const now = new Date();
        context.lastLoginDaysAgo = Math.floor((now - lastLogin) / (1000 * 60 * 60 * 24));
      }
    }

    // ──────────────────────────────────────────────
    // 3. Per-subcategory progress (FIXED field names)
    // ──────────────────────────────────────────────
    const weakAreas = [];
    const strongAreas = [];
    const subcategoryDetails = [];
    let totalQuestions = 0;
    let totalCorrect = 0;

    progressSnapshot.forEach(doc => {
      const data = doc.data();
      const docId = doc.id; // kebab-case like 'central-ideas-details'
      const name = SUBCATEGORY_NAME_MAP[docId] || docId;
      const section = SUBCATEGORY_SECTION[docId] || 0;

      // FIXED: use correct field names that the frontend writes
      const questionsAnswered = data.totalQuestions || 0;
      const correct = data.correctTotal || 0;

      // Calculate accuracy from last10QuestionResults (matches frontend logic)
      const last10Results = data.last10QuestionResults || [];
      const last10Count = last10Results.length;
      const last10Correct = last10Results.filter(r => r === true).length;
      const accuracyLast10 = last10Count > 0 ? Math.round((last10Correct / last10Count) * 100) : null;

      // Overall accuracy from stored fields
      const overallAccuracy = data.accuracy || (questionsAnswered > 0 ? Math.round((correct / questionsAnswered) * 100) : null);

      // Determine weak/strong areas using last-10 accuracy (more indicative) or overall
      const effectiveAccuracy = accuracyLast10 !== null ? accuracyLast10 : overallAccuracy;
      const hasEnoughData = last10Count >= 3 || questionsAnswered >= 3;

      if (hasEnoughData && effectiveAccuracy !== null) {
        if (effectiveAccuracy < 60) {
          weakAreas.push(name);
        } else if (effectiveAccuracy >= 80) {
          strongAreas.push(name);
        }
      }

      totalQuestions += questionsAnswered;
      totalCorrect += correct;

      // Store detailed per-subcategory info for the AI
      subcategoryDetails.push({
        id: docId,
        name,
        section, // 1=R&W, 2=Math
        level: data.level || 1,
        mastered: data.mastered || false,
        accuracyLast10,
        overallAccuracy,
        totalQuestions: questionsAnswered,
        lastScore: data.lastScore,
        attempts: data.attempts || 0
      });
    });

    context.weakAreas = weakAreas;
    context.strongAreas = strongAreas;
    context.subcategoryDetails = subcategoryDetails;
    context.questionsAttempted = totalQuestions;
    context.overallAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : null;

    // ──────────────────────────────────────────────
    // 4. Practice exam history
    // ──────────────────────────────────────────────
    const practiceExams = [];
    practiceExamsSnapshot.forEach(doc => {
      const data = doc.data();
      practiceExams.push({
        id: doc.id,
        examTitle: data.examTitle || data.title || 'Practice Exam',
        overallScore: data.overallScore ?? data.score ?? null,
        totalQuestions: data.totalQuestions ?? null,
        correctAnswers: data.correctAnswers ?? null,
        scores: data.scores || null,
        completedAt: data.completedAt?.toDate?.()?.toISOString() || data.examDate || null,
        isDiagnostic: data.isDiagnostic || false
      });
    });
    context.practiceExams = practiceExams;

    // ──────────────────────────────────────────────
    // 5. Recent quiz results
    // ──────────────────────────────────────────────
    const recentQuizzes = [];
    quizSnapshot.forEach(doc => {
      const data = doc.data();
      recentQuizzes.push({
        id: doc.id,
        subcategoryId: data.subcategoryId || null,
        level: data.level || null,
        score: data.score ?? null,
        questionCount: data.questionCount ?? null,
        passed: data.passed || false,
        completedAt: data.completedAt?.toDate?.()?.toISOString() || null
      });
    });
    context.recentQuizzes = recentQuizzes;

    // ──────────────────────────────────────────────
    // 6. Compute estimated SAT score server-side
    //    (mirrors frontend calculateEstimatedSATScore logic)
    // ──────────────────────────────────────────────
    if (!questionAttemptsSnapshot.empty) {
      const rwAttempts = [];
      const mathAttempts = [];

      questionAttemptsSnapshot.forEach(doc => {
        const data = doc.data();
        const subcatId = data.subcategoryId;
        if (!subcatId) return;

        // Determine section from the subcategory
        let section = 0;
        if (typeof subcatId === 'string') {
          section = SUBCATEGORY_SECTION[subcatId] || 0;
        }
        // Also try numeric lookup
        if (section === 0 && !isNaN(parseInt(subcatId, 10))) {
          const numId = parseInt(subcatId, 10);
          if (numId >= 1 && numId <= 10) section = 1;
          else if (numId >= 11 && numId <= 29) section = 2;
        }

        if (section === 1) rwAttempts.push(data);
        else if (section === 2) mathAttempts.push(data);
      });

      const rwRecent = rwAttempts.slice(0, 54);
      const mathRecent = mathAttempts.slice(0, 44);

      const rwCorrect = rwRecent.filter(a => a.isCorrect === true).length;
      const mathCorrect = mathRecent.filter(a => a.isCorrect === true).length;
      const rwTotal = rwRecent.length;
      const mathTotal = mathRecent.length;

      if (rwTotal > 0 || mathTotal > 0) {
        const rwAccuracy = rwTotal > 0 ? rwCorrect / rwTotal : 0;
        const mathAccuracy = mathTotal > 0 ? mathCorrect / mathTotal : 0;

        const rwEstimate = rwTotal > 0 ? Math.round((200 + rwAccuracy * 600) / 10) * 10 : 200;
        const mathEstimate = mathTotal > 0 ? Math.round((200 + mathAccuracy * 600) / 10) * 10 : 200;
        const estimatedScore = rwEstimate + mathEstimate;

        const rwConfidence = Math.min(1, rwTotal / 54);
        const mathConfidence = Math.min(1, mathTotal / 44);
        const confidence = Math.round(((rwConfidence + mathConfidence) / 2) * 100);

        context.estimatedScore = Math.max(400, Math.min(1600, estimatedScore));
        context.scoreConfidence = confidence;
        context.scoreBreakdown = {
          readingWriting: { score: rwEstimate, attempts: rwTotal },
          math: { score: mathEstimate, attempts: mathTotal }
        };
      }
    }

    // If we didn't get an estimated score from questionAttempts, fall back to progress-based estimate
    if (!context.estimatedScore && subcategoryDetails.length > 0) {
      // Use the per-subcategory accuracy data we already have
      let rwScore = 0, rwWeight = 0, mathScore = 0, mathWeight = 0;
      subcategoryDetails.forEach(s => {
        const acc = s.accuracyLast10 !== null ? s.accuracyLast10 : s.overallAccuracy;
        if (acc === null || s.totalQuestions < 1) return;
        const weight = s.section === 1 ? 4.0 : 2.1;
        const contribution = (acc / 100) * weight;
        if (s.section === 1) { rwScore += contribution; rwWeight += weight; }
        else if (s.section === 2) { mathScore += contribution; mathWeight += weight; }
      });

      if (rwWeight > 0 || mathWeight > 0) {
        const rwEstimate = rwWeight > 0 ? Math.round((200 + (rwScore / rwWeight) * 600) / 10) * 10 : 200;
        const mathEstimate = mathWeight > 0 ? Math.round((200 + (mathScore / mathWeight) * 600) / 10) * 10 : 200;
        context.estimatedScore = Math.max(400, Math.min(1600, rwEstimate + mathEstimate));
        context.scoreBreakdown = {
          readingWriting: { score: rwEstimate, attempts: 0 },
          math: { score: mathEstimate, attempts: 0 }
        };
      }
    }

    // ──────────────────────────────────────────────
    // 7. Recent activity summary
    // ──────────────────────────────────────────────
    const activityParts = [];
    if (recentQuizzes.length > 0) {
      const latestQuiz = recentQuizzes[0];
      const qSubcat = SUBCATEGORY_NAME_MAP[latestQuiz.subcategoryId] || latestQuiz.subcategoryId;
      const scoreStr = (latestQuiz.score !== null && latestQuiz.questionCount !== null)
        ? ` — scored ${latestQuiz.score}/${latestQuiz.questionCount}`
        : '';
      activityParts.push(`Most recent quiz: ${qSubcat} Level ${latestQuiz.level ?? '?'}${scoreStr}, ${latestQuiz.passed ? 'PASSED ✓' : 'DID NOT PASS ✗'}`);
    }
    if (practiceExams.length > 0) {
      const latestExam = practiceExams[0];
      let examStr = `Most recent practice exam: "${latestExam.examTitle}"`;
      if (latestExam.overallScore !== null) examStr += ` — score: ${latestExam.overallScore}/${latestExam.totalQuestions ?? '?'}`;
      if (latestExam.completedAt) examStr += ` (${new Date(latestExam.completedAt).toLocaleDateString()})`;
      activityParts.push(examStr);
    }
    if (activityParts.length > 0) {
      context.recentActivity = activityParts.join('. ');
    }

  } catch (error) {
    console.error('Error aggregating user context:', error);
    context.error = error.message;
  }

  return context;
};
