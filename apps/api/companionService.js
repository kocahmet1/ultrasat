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

  if (userContext.displayName) {
    parts.push(`Student name: ${userContext.displayName}`);
  }

  if (userContext.targetScore) {
    parts.push(`Target SAT score: ${userContext.targetScore}`);
  }

  if (userContext.estimatedScore) {
    parts.push(`Current estimated score: ${userContext.estimatedScore}`);
  }

  if (userContext.examDate) {
    const daysUntil = Math.ceil((new Date(userContext.examDate) - new Date()) / (1000 * 60 * 60 * 24));
    parts.push(`Days until SAT: ${daysUntil}`);
  }

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

  if (userContext.weakAreas && userContext.weakAreas.length > 0) {
    parts.push(`Weak areas: ${userContext.weakAreas.slice(0, 3).join(', ')}`);
  }

  if (userContext.strongAreas && userContext.strongAreas.length > 0) {
    parts.push(`Strong areas: ${userContext.strongAreas.slice(0, 3).join(', ')}`);
  }

  if (userContext.recentActivity) {
    parts.push(`Recent activity: ${userContext.recentActivity}`);
  }

  if (userContext.questionsAttempted !== undefined) {
    parts.push(`Total questions attempted: ${userContext.questionsAttempted}`);
  }

  if (userContext.overallAccuracy !== undefined) {
    parts.push(`Overall accuracy: ${userContext.overallAccuracy}%`);
  }

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
- Reference something specific about their progress or situation
- End with ONE suggested next action (not a list)
- Be warm but not sycophantic

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
    // Get user profile
    const userDoc = await db.collection('users').doc(userId).get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      context.displayName = userData.displayName || userData.email?.split('@')[0];
      context.targetScore = userData.targetScore;
      context.examDate = userData.examDate?.toDate?.() || userData.examDate;
      context.onboardingComplete = userData.onboardingComplete || false;
    }

    // Calculate study streak (simplified)
    const lastLoginDoc = await db.collection('users').doc(userId)
      .collection('loginHistory').orderBy('timestamp', 'desc').limit(2).get();

    if (!lastLoginDoc.empty) {
      const logins = lastLoginDoc.docs.map(d => d.data().timestamp?.toDate?.() || new Date(d.data().timestamp));
      if (logins.length > 0) {
        const lastLogin = logins[0];
        const now = new Date();
        context.lastLoginDaysAgo = Math.floor((now - lastLogin) / (1000 * 60 * 60 * 24));
      }
    }

    // Get subcategory performance summary
    const progressSnapshot = await db.collection('users').doc(userId)
      .collection('subcategoryProgress').get();

    const weakAreas = [];
    const strongAreas = [];
    let totalQuestions = 0;
    let totalCorrect = 0;

    progressSnapshot.forEach(doc => {
      const data = doc.data();
      const accuracy = data.accuracy || (data.correct / data.attempted * 100) || 0;
      const name = data.subcategoryName || doc.id;

      if (accuracy < 60 && data.attempted >= 3) {
        weakAreas.push(name);
      } else if (accuracy >= 80 && data.attempted >= 3) {
        strongAreas.push(name);
      }

      totalQuestions += data.attempted || 0;
      totalCorrect += data.correct || 0;
    });

    context.weakAreas = weakAreas;
    context.strongAreas = strongAreas;
    context.questionsAttempted = totalQuestions;
    context.overallAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : null;

    // Get estimated SAT score if available
    const scoreDoc = await db.collection('users').doc(userId)
      .collection('analytics').doc('estimatedScore').get();

    if (scoreDoc.exists) {
      context.estimatedScore = scoreDoc.data().score;
    }

  } catch (error) {
    console.error('Error aggregating user context:', error);
    context.error = error.message;
  }

  return context;
};
