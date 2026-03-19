/**
 * AI Companion Router
 * Express router for SAT Coach AI companion endpoints
 */

const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const companionService = require('./companionService');
const { requireAuth } = require('./middleware/auth');

// Rate limiting for companion endpoints
const companionLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 20, // 20 requests per minute
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests. Please slow down.' }
});

// Apply rate limiting to all companion routes
router.use(companionLimiter);

const verifyAuth = requireAuth({
    missingTokenMessage: 'Unauthorized: No token provided',
    invalidTokenMessage: 'Unauthorized: Invalid token',
    logLabel: 'Auth verification error',
});

/**
 * POST /api/companion/greeting
 * Generate a personalized login greeting
 */
router.post('/greeting', verifyAuth, async (req, res) => {
    try {
        const userId = req.userId;
        const firebaseAdmin = req.firebaseAdmin;

        // Aggregate user context
        const userContext = await companionService.aggregateUserContext(firebaseAdmin, userId);

        // Check if we should return cached greeting (within last hour)
        if (req.body.allowCache) {
            try {
                const db = firebaseAdmin.firestore();
                const cacheDoc = await db.collection('users').doc(userId)
                    .collection('companionCache').doc('lastGreeting').get();

                if (cacheDoc.exists) {
                    const cached = cacheDoc.data();
                    const cacheAge = Date.now() - (cached.generatedAt?.toMillis?.() || 0);

                    // Use cache if less than 1 hour old
                    if (cacheAge < 60 * 60 * 1000) {
                        return res.json({
                            ...cached,
                            cached: true
                        });
                    }
                }
            } catch (cacheError) {
                console.warn('Cache check failed:', cacheError.message);
            }
        }

        // Generate fresh greeting
        const greeting = await companionService.generateGreeting(userContext);

        // Cache the greeting
        try {
            const db = firebaseAdmin.firestore();
            await db.collection('users').doc(userId)
                .collection('companionCache').doc('lastGreeting').set({
                    ...greeting,
                    generatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp()
                });
        } catch (cacheError) {
            console.warn('Failed to cache greeting:', cacheError.message);
        }

        res.json(greeting);
    } catch (error) {
        console.error('Error in /greeting:', error);
        res.status(500).json({
            error: 'Failed to generate greeting',
            fallback: {
                greeting: 'Welcome back! Ready to continue your SAT prep?',
                suggestedAction: {
                    label: 'Start Practice',
                    route: '/smart-quiz-generator',
                    type: 'quiz'
                }
            }
        });
    }
});

/**
 * POST /api/companion/next-steps
 * Get recommended next actions
 */
router.post('/next-steps', verifyAuth, async (req, res) => {
    try {
        const userId = req.userId;
        const firebaseAdmin = req.firebaseAdmin;

        // Aggregate user context
        const userContext = await companionService.aggregateUserContext(firebaseAdmin, userId);

        // Generate recommendations
        const nextSteps = await companionService.getNextSteps(userContext);

        res.json(nextSteps);
    } catch (error) {
        console.error('Error in /next-steps:', error);
        res.status(500).json({
            error: 'Failed to generate recommendations',
            fallback: {
                recommendation: 'Continue practicing to build your skills.',
                action: {
                    label: 'Practice Quiz',
                    route: '/smart-quiz-generator',
                    type: 'quiz'
                },
                priority: 'medium'
            }
        });
    }
});

/**
 * POST /api/companion/voice-token
 * Get ephemeral token for WebRTC voice session
 */
router.post('/voice-token', verifyAuth, async (req, res) => {
    try {
        const userId = req.userId;
        const firebaseAdmin = req.firebaseAdmin;

        // Aggregate user context for voice session
        const userContext = await companionService.aggregateUserContext(firebaseAdmin, userId);

        // Create voice session and get ephemeral token
        const session = await companionService.createVoiceSession(userContext);

        // Log voice session start for analytics
        try {
            const db = firebaseAdmin.firestore();
            await db.collection('users').doc(userId)
                .collection('companionInteractions').add({
                    type: 'voice_session_start',
                    timestamp: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
                    model: session.model
                });
        } catch (logError) {
            console.warn('Failed to log voice session:', logError.message);
        }

        res.json({
            token: session.token,
            expiresAt: session.expiresAt,
            voice: session.voice
        });
    } catch (error) {
        console.error('Error in /voice-token:', error);
        res.status(500).json({
            error: 'Failed to initialize voice session. Please try again.'
        });
    }
});

/**
 * POST /api/companion/onboarding-chat
 * Multi-turn conversational onboarding for first-time users
 */
router.post('/onboarding-chat', verifyAuth, async (req, res) => {
    try {
        const userId = req.userId;
        const firebaseAdmin = req.firebaseAdmin;
        const { messages } = req.body;

        if (!Array.isArray(messages)) {
            return res.status(400).json({ error: 'messages must be an array' });
        }

        // Get basic user context for personalization
        const userContext = await companionService.aggregateUserContext(firebaseAdmin, userId);

        // Get AI response
        const response = await companionService.handleOnboardingChat(messages, userContext);

        // If the AI collected data (target score, exam date), save it
        if (response.collectData) {
            const db = firebaseAdmin.firestore();
            const updates = { updatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp() };

            if (response.collectData.targetScore) {
                updates.targetScore = parseInt(response.collectData.targetScore, 10);
            }
            if (response.collectData.examDate) {
                updates.examDate = new Date(response.collectData.examDate);
            }

            if (Object.keys(updates).length > 1) {
                await db.collection('users').doc(userId).set(updates, { merge: true });
            }
        }

        res.json(response);
    } catch (error) {
        console.error('Error in /onboarding-chat:', error);
        res.status(500).json({
            error: 'Failed to process onboarding chat',
            fallback: {
                message: 'Welcome to UltraSAT Prep! The best way to get started is with our Predictive Test.',
                quickReplies: ['Take Predictive Test', 'Explore on my own'],
                action: null,
                collectData: null
            }
        });
    }
});

/**
 * POST /api/companion/update-profile
 * Update user's companion-related profile settings
 */
router.post('/update-profile', verifyAuth, async (req, res) => {
    try {
        const userId = req.userId;
        const firebaseAdmin = req.firebaseAdmin;
        const { targetScore, examDate, onboardingComplete } = req.body;

        const db = firebaseAdmin.firestore();
        const updates = {};

        if (targetScore !== undefined) {
            updates.targetScore = parseInt(targetScore, 10);
        }

        if (examDate !== undefined) {
            updates.examDate = examDate ? new Date(examDate) : null;
        }

        if (onboardingComplete !== undefined) {
            updates.onboardingComplete = Boolean(onboardingComplete);
        }

        if (Object.keys(updates).length > 0) {
            updates.updatedAt = firebaseAdmin.firestore.FieldValue.serverTimestamp();
            await db.collection('users').doc(userId).set(updates, { merge: true });
        }

        res.json({ success: true, updated: Object.keys(updates) });
    } catch (error) {
        console.error('Error in /update-profile:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

/**
 * GET /api/companion/status
 * Check if companion features are available
 */
router.get('/status', (req, res) => {
    const hasApiKey = Boolean(process.env.OPENAI_API_KEY);

    res.json({
        available: hasApiKey,
        features: {
            greeting: hasApiKey,
            nextSteps: hasApiKey,
            voice: hasApiKey
        },
        model: hasApiKey ? (process.env.COMPANION_MODEL || 'gpt-5-mini') : null
    });
});

module.exports = router;
