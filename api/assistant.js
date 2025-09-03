/**
 * Express router for the SmartQuiz AI Assistant API
 * Provides endpoints for interacting with the assistant during quizzes
 */

const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const { chatWithAssistant } = require('./aiService');
const { getVocabularyDefinitions, getConceptExplanations } = require('./helperService');
// Use Firebase Admin from the req object, initialized in server.js

// Don't initialize Firebase Admin here - use the one already initialized in server.js and attached to req

// Rate limiting configuration
const assistantLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000, // limit each IP to 10000 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests to the assistant API. Please try again later.' }
});

// Apply rate limiting to all assistant routes
router.use('/', assistantLimiter);

// Stricter limiter for public helper cache endpoint
const publicHelperLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 60, // more restrictive limit for public unauthenticated access
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests to public helper endpoint. Please try again later.' }
});

// Middleware to verify Firebase ID token
const verifyFirebaseToken = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized - No token provided' });
    }
    
    const idToken = authHeader.split('Bearer ')[1];
    if (!idToken) {
      return res.status(401).json({ error: 'Unauthorized - Invalid token format' });
    }
    
    // Verify token
    try {
      // Use the admin instance attached to req by the middleware in server.js
      if (!req.admin) {
        return res.status(500).json({ error: 'Firebase Admin not available' });
      }
      
      const decodedToken = await req.admin.auth().verifyIdToken(idToken);
      req.user = decodedToken;
      next();
    } catch (error) {
      console.error('Error verifying token:', error);
      return res.status(401).json({ error: 'Unauthorized - Invalid token' });
    }
  } catch (error) {
    console.error('Error in auth middleware:', error);
    return res.status(500).json({ error: 'Internal server error during authentication' });
  }
};

// Check and update usage quota for a user
const checkUserQuota = async (req, userId) => {
  try {
    // Use the db instance attached to req by the middleware in server.js
    if (!req.db) {
      throw new Error('Firebase Firestore not available');
    }
    
    // Reference to the user's AI assistant usage doc
    const usageRef = req.db.collection('aiAssistantUsage').doc(userId);
    
    // Get current usage
    const usageSnap = await usageRef.get();
    
    if (usageSnap.exists) {
      const usage = usageSnap.data();
      // Check if daily quota is exceeded
      const MAX_DAILY_TOKENS = parseInt(process.env.ASSISTANT_DAILY_QUOTA || '10000', 10);
      
      if (usage.tokensToday >= MAX_DAILY_TOKENS) {
        return {
          quotaExceeded: true,
          message: 'Daily usage quota exceeded. Please try again tomorrow.'
        };
      }
      
      // If we're on a new day, reset the counter
      const lastUpdated = usage.lastUpdated?.toDate() || new Date(0);
      const today = new Date();
      if (lastUpdated.getDate() !== today.getDate() || 
          lastUpdated.getMonth() !== today.getMonth() || 
          lastUpdated.getFullYear() !== today.getFullYear()) {
        await usageRef.update({
          tokensToday: 0,
          lastUpdated: req.admin.firestore.FieldValue.serverTimestamp()
        });
      }
    } else {
      // Create new usage document if it doesn't exist
      await usageRef.set({
        tokensToday: 0,
        lastUpdated: req.admin.firestore.FieldValue.serverTimestamp(),
        userId
      });
    }
    
    return { quotaExceeded: false };
  } catch (error) {
    console.error('Error checking user quota:', error);
    // If there's an error checking quota, we'll allow the request to proceed
    return { quotaExceeded: false };
  }
};

// Update token usage after a successful API call
const updateTokenUsage = async (req, userId, tokens) => {
  try {
    if (!req.db || !req.admin) {
      throw new Error('Firebase not available');
    }
    
    const usageRef = req.db.collection('aiAssistantUsage').doc(userId);
    await usageRef.update({
      tokensToday: req.admin.firestore.FieldValue.increment(tokens),
      lastUpdated: req.admin.firestore.FieldValue.serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating token usage:', error);
    // Non-blocking - we don't want to fail the response if this fails
  }
};

// Optional: Save chat history for analytics and persistence
const saveChatHistory = async (req, userId, quizId, questionId, message) => {
  try {
    if (!req.db || !req.admin) {
      throw new Error('Firebase not available');
    }
    
    const chatRef = req.db.collection('smartQuizzes').doc(quizId).collection('assistantChats').doc(questionId);
    const chatSnap = await chatRef.get();
    
    if (chatSnap.exists) {
      // Add to existing chat history
      await chatRef.update({
        messages: [...chatSnap.data().messages, message],
        updatedAt: req.admin.firestore.FieldValue.serverTimestamp()
      });
    } else {
      // Create new chat history
      await chatRef.set({
        messages: [message],
        quizId,
        questionId,
        userId,
        createdAt: req.admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: req.admin.firestore.FieldValue.serverTimestamp()
      });
    }
  } catch (error) {
    console.error('Error saving chat history:', error);
    // Non-blocking - we don't want to fail the response if this fails
  }
};

/**
 * Fetch quiz question details from Firestore
 * @param {string} quizId - The ID of the quiz
 * @param {string} questionId - The ID of the question within the quiz
 * @returns {Promise<Object|null>} Question object with text, options, correctAnswer, etc. or null if not found
 */
async function fetchQuizQuestionDetailsFromFirestore(req, quizId, questionId) {
  try {
    if (!req.db) {
      throw new Error('Firebase Firestore not available');
    }
    
    console.log(`[Assistant] Fetching quiz ${quizId} and question ${questionId}`);
    
    // Get the quiz document from Firestore
    const quizRef = req.db.collection('smartQuizzes').doc(quizId);
    const quizSnap = await quizRef.get();
    
    if (!quizSnap.exists) {
      console.warn(`[Assistant] Quiz ${quizId} not found in smartQuizzes collection.`);
      
      // Try alternative collections as fallback
      console.log(`[Assistant] Trying alternative collections for quiz ${quizId}`);
      
      // Try adaptiveQuizzes collection
      const adaptiveQuizRef = req.db.collection('adaptiveQuizzes').doc(quizId);
      const adaptiveQuizSnap = await adaptiveQuizRef.get();
      
      if (adaptiveQuizSnap.exists) {
        console.log(`[Assistant] Found quiz ${quizId} in adaptiveQuizzes collection`);
        const adaptiveQuizData = adaptiveQuizSnap.data();
        
        // Handle adaptiveQuizzes format - questions might be embedded differently
        if (adaptiveQuizData.questions && Array.isArray(adaptiveQuizData.questions)) {
          const questionData = adaptiveQuizData.questions.find(q => q.id === questionId);
          if (questionData) {
            console.log(`[Assistant] Found question ${questionId} in adaptiveQuizzes embedded questions`);
            return {
              id: questionData.id,
              text: questionData.text,
              options: questionData.options,
              correctAnswer: questionData.correctAnswer,
              explanation: questionData.explanation || '',
              subcategory: adaptiveQuizData.subcategoryId || '',
              level: adaptiveQuizData.level || 1
            };
          }
        }
      }
      
      // Try targetedQuizzes collection
      const targetedQuizRef = req.db.collection('targetedQuizzes').doc(quizId);
      const targetedQuizSnap = await targetedQuizRef.get();
      
      if (targetedQuizSnap.exists) {
        console.log(`[Assistant] Found quiz ${quizId} in targetedQuizzes collection`);
        const targetedQuizData = targetedQuizSnap.data();
        
        // Handle targetedQuizzes format
        if (targetedQuizData.questionIds && Array.isArray(targetedQuizData.questionIds)) {
          if (targetedQuizData.questionIds.includes(questionId)) {
            console.log(`[Assistant] Question ${questionId} found in targetedQuizzes questionIds, fetching from questions collection`);
            const questionRef = req.db.collection('questions').doc(questionId);
            const questionSnap = await questionRef.get();
            
            if (questionSnap.exists) {
              const questionData = { id: questionSnap.id, ...questionSnap.data() };
              console.log(`[Assistant] Successfully fetched question ${questionId} from questions collection via targetedQuizzes`);
              return {
                id: questionData.id,
                text: questionData.text,
                options: questionData.options,
                correctAnswer: questionData.correctAnswer,
                explanation: questionData.explanation || '',
                subcategory: targetedQuizData.subcategoryId || '',
                level: targetedQuizData.level || 1
              };
            }
          }
        }
      }
      
      console.warn(`[Assistant] Quiz ${quizId} not found in any known collection`);
      return null;
    }
    
    const quizData = quizSnap.data();
    console.log(`[Assistant] Found quiz ${quizId}. Has questionIds: ${!!quizData.questionIds}, Has questions: ${!!quizData.questions}`);
    
    // Handle both new format (questionIds) and legacy format (questions)
    let questionData = null;
    
    if (quizData.questionIds && Array.isArray(quizData.questionIds)) {
      console.log(`[Assistant] Quiz has ${quizData.questionIds.length} questionIds: ${quizData.questionIds.join(', ')}`);
      
      // New format: fetch question from questions collection
      if (quizData.questionIds.includes(questionId)) {
        console.log(`[Assistant] Question ${questionId} found in questionIds, fetching from questions collection`);
        const questionRef = req.db.collection('questions').doc(questionId);
        const questionSnap = await questionRef.get();
        
        if (questionSnap.exists) {
          questionData = { id: questionSnap.id, ...questionSnap.data() };
          console.log(`[Assistant] Successfully fetched question ${questionId} from questions collection`);
        } else {
          console.warn(`[Assistant] Question ${questionId} not found in questions collection`);
        }
      } else {
        console.warn(`[Assistant] Question ${questionId} not found in quiz's questionIds array`);
      }
    } else if (quizData.questions && Array.isArray(quizData.questions)) {
      console.log(`[Assistant] Quiz has ${quizData.questions.length} embedded questions`);
      
      // Legacy format: find question in embedded questions array
      questionData = quizData.questions.find(q => q.id === questionId);
      if (questionData) {
        console.log(`[Assistant] Found question ${questionId} in embedded questions array`);
      } else {
        console.warn(`[Assistant] Question ${questionId} not found in embedded questions array`);
      }
    } else {
      console.warn(`[Assistant] Quiz ${quizId} has no questionIds or questions array`);
    }
    
    if (!questionData) {
      console.warn(`[Assistant] Question ${questionId} not found in quiz ${quizId}.`);
      return null;
    }
    
    console.log(`[Assistant] Successfully found question data for ${questionId}`);
    
    // Return the question data with the expected fields for the AI assistant
    return {
      id: questionData.id,
      text: questionData.text,
      options: questionData.options,
      correctAnswer: questionData.correctAnswer,
      explanation: questionData.explanation || '',
      subcategory: quizData.subcategoryId || '',
      level: quizData.level || 1
    };
  } catch (error) {
    console.error(`[Assistant] Error fetching question ${questionId} from quiz ${quizId}:`, error);
    return null;
  }
}

/**
 * POST /api/assistant
 * Chat with the AI assistant about a quiz question
 */
router.post('/', verifyFirebaseToken, async (req, res) => {
  try {
    const { question: questionObj, history = [], tipRequested = false, summariseRequested = false, quizId, questionId, priming: primingCall = false } = req.body;
    const userId = req.user.uid;

    // Get the actual user message text - if it's a question (not a tip request)
    // The issue is that 'question' sometimes contains the question object and sometimes contains user message
    const userChatMessage = typeof questionObj === 'string' 
      ? questionObj 
      : (history.length > 0 && history[history.length - 1].content) || '';
    
    console.log(`[Assistant] Processing user message:`, { userChatMessage, tipRequested, summariseRequested, primingCall, quizId, questionId });
    console.log(`[Assistant] Question object received:`, questionObj);

    if (!quizId || !questionId) {
      console.error(`[Assistant] Missing required parameters - quizId: ${quizId}, questionId: ${questionId}`);
      return res.status(400).json({ error: 'Missing quizId or questionId.' });
    }
    if (!primingCall && tipRequested === false && summariseRequested === false && !userChatMessage) { // Bypass for priming
      console.error(`[Assistant] Missing userChatMessage for regular request`);
      return res.status(400).json({ error: 'Missing userChatMessage for regular request.' });
    }

    // Fetch the actual quiz question details from Firestore
    console.log(`[Assistant] About to fetch quiz question details for quiz ${quizId}, question ${questionId}`);
    const currentQuizProblem = await fetchQuizQuestionDetailsFromFirestore(req, quizId, questionId);
    if (!currentQuizProblem) {
      console.error(`[Assistant] Failed to fetch quiz question details for quiz ${quizId}, question ${questionId}`);
      
      // For priming calls, we can be more lenient and just return a success response
      if (primingCall) {
        console.log(`[Assistant] Priming call failed but returning success to avoid blocking quiz`);
        return res.json({ message: 'Priming completed (quiz data not found but non-critical)', usage: { total_tokens: 0 } });
      }
      
      // For other requests, try to use the question data from the request body as fallback
      console.log(`[Assistant] Checking fallback conditions - questionObj exists: ${!!questionObj}, is object: ${typeof questionObj === 'object'}, has text: ${!!(questionObj && questionObj.text)}`);
      if (questionObj && typeof questionObj === 'object' && questionObj.text) {
        console.log(`[Assistant] Using question data from request body as fallback`);
        const fallbackQuestion = {
          id: questionId,
          text: questionObj.text,
          options: questionObj.options || [],
          correctAnswer: questionObj.correctAnswer || 0,
          explanation: questionObj.explanation || '',
          subcategory: 'unknown',
          level: 1
        };
        
        // Continue with the fallback question data
        console.log(`[Assistant] Using fallback question data for ${questionId}`);
        
        // Call the AI service with fallback data
        const serviceHistory = history.map(item => {
          const role = (item.role === 'assistant' ? 'model' : 
                       (item.role === 'user' || item.role === 'model') ? item.role : 'user');
          const content = item.content || 
                        (item.parts && item.parts[0] && item.parts[0].text) || 
                        '';
          return { role, content };
        });
        
        let currentMessageContent;
        if (tipRequested) {
          currentMessageContent = "Can I get a tip for this question?";
        } else if (summariseRequested) {
          currentMessageContent = "Can you summarise the text for me?";
        } else {
          currentMessageContent = userChatMessage;
        }
        serviceHistory.push({ role: 'user', content: currentMessageContent });

        const assistantResponseData = await chatWithAssistant({
          question: fallbackQuestion,
          history: serviceHistory,
          tipRequested,
          summariseRequested,
          primingCall: false
        });

        return res.json({
          message: assistantResponseData.message,
          usage: assistantResponseData.usage
        });
      }
      
      return res.status(404).json({ error: 'Quiz question details not found. Cannot provide assistance.' });
    }
    console.log(`[Assistant] Successfully fetched quiz question details for ${questionId}`);

    // Construct history for the AI service
    // The aiService expects history to include the user's latest message.
    // Convert history to a Firebase-safe format (no undefined values)
    const serviceHistory = history.map(item => {
        // Ensure role is valid (default to 'user' if not defined or invalid)
        const role = (item.role === 'assistant' ? 'model' : 
                     (item.role === 'user' || item.role === 'model') ? item.role : 'user');
        
        // Ensure content has a value (empty string if undefined)
        const content = item.content || 
                      (item.parts && item.parts[0] && item.parts[0].text) || 
                      '';
                      
        return { role, content };
    });
    
    let currentMessageContent;
    if (tipRequested) {
      currentMessageContent = "Can I get a tip for this question?";
    } else if (primingCall) {
      currentMessageContent = "System: Priming assistant context."; // Internal message for priming
    } else if (summariseRequested) {
      currentMessageContent = "Can you summarise the text for me?";
    } else {
      currentMessageContent = userChatMessage;
    }
    serviceHistory.push({ role: 'user', content: currentMessageContent });

    // Call the AI service (now Gemini-based)
    const assistantResponseData = await chatWithAssistant({
      question: currentQuizProblem, // Pass the structured quiz problem object
      history: serviceHistory,      // Pass the chat history including the latest user message
      tipRequested,
      summariseRequested,
      primingCall // Pass the primingCall flag
    });

    // Save interaction to Firestore
    if (!req.db || !req.admin) {
      throw new Error('Firebase not available');
    }
    
    const interactionRef = req.db.collection('quizAttempts').doc(quizId)
        .collection('questions').doc(questionId)
        .collection('assistantInteractions').doc();
    
    // Prepare a Firestore-safe interaction data object
    const interactionData = {
        userId,
        timestamp: req.admin.firestore.FieldValue.serverTimestamp(),
        userInput: currentMessageContent || '',
        assistantOutput: assistantResponseData.message || '',
        // For historySnapshot, ensure we sanitize to prevent undefined values
        historySnapshot: serviceHistory.length > 1 ? 
            serviceHistory.slice(0, -1).map(item => ({
                role: item.role || 'user',
                content: item.content || ''
            })) : 
            [],  // Empty array if no history
        tipRequested,
        summariseRequested,
        primingCall, // Log the primingCall status
        usage: assistantResponseData.usage || null,
        apiVersion: 'gemini'
    };
    await interactionRef.set(interactionData);

    // Optionally, update user's daily quota based on response (if Gemini provides token counts)
    // await updateUserQuota(userId, assistantResponseData.usage?.total_tokens || 0);

    res.json({
        message: assistantResponseData.message,
        usage: assistantResponseData.usage
    });

  } catch (error) {
    console.error('Error in /api/assistant POST:', error.message);
    if (error.stack) console.error(error.stack);
    res.status(500).json({ error: error.message || 'Failed to get assistant response' });
  }
});

/**
 * GET /api/assistant/history/:quizId/:questionId
 * Get chat history for a question
 */
router.get('/history/:quizId/:questionId', verifyFirebaseToken, async (req, res) => {
  try {
    const { quizId, questionId } = req.params;

    if (!req.db) {
      throw new Error('Firebase Firestore not available');
    }
    
    // Fetch chat history from smartQuizzes/{quizId}/assistantChats/{questionId}
    const chatDocRef = req.db.collection('smartQuizzes').doc(quizId)
                               .collection('assistantChats').doc(questionId);
    
    const chatDocSnap = await chatDocRef.get();

    if (!chatDocSnap.exists) {
      // No chat history document found for this question, return empty array
      return res.json([]);
    }

    const chatData = chatDocSnap.data();
    const messages = chatData.messages || []; // Get the messages array, default to empty if not present

    // The messages should already be in the correct {role, content} format as saved by saveChatHistory
    return res.json(messages);

  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

/**
 * POST /api/assistant/helper
 * Unified endpoint to get vocabulary definitions OR concept explanations for a question
 * Based on the subcategory's helperType setting
 */
router.post('/helper', verifyFirebaseToken, async (req, res) => {
  try {
    const { quizId, questionId, questionContent, helperType, subcategory } = req.body;
    const userId = req.user.uid;

    if (!quizId || !questionId || !questionContent) {
      return res.status(400).json({ error: 'Missing required parameters.' });
    }

    if (!questionContent.text) {
      return res.status(400).json({ error: 'Question text is required.' });
    }

    // Default to vocabulary if not specified
    const requestedHelperType = helperType || 'vocabulary';

    // Check user quota (reuse the existing function)
    const quotaCheck = await checkUserQuota(req, userId);
    if (quotaCheck.quotaExceeded) {
      return res.status(429).json({ error: quotaCheck.message });
    }
    
    const requestStartTime = Date.now();
    console.log(`[HELPER API] Processing ${requestedHelperType} request for questionId: ${questionId}`);
    
    // First, check if we have cached helper data in Firestore
    // Use dedicated helper cache collection with questionId and helper type as part of the document ID
    const cacheDocId = `${questionId}_${requestedHelperType}`;
    const helperCacheRef = req.db.collection('helperCache').doc(cacheDocId);
    console.log(`[HELPER API] Checking cache in collection: helperCache/${cacheDocId}`);
    
    let helperCacheDoc;
    try {
      helperCacheDoc = await helperCacheRef.get();
      console.log(`[HELPER API] Cache lookup result - exists: ${helperCacheDoc.exists}, took ${Date.now() - requestStartTime}ms`);
    } catch (cacheError) {
      console.error(`[HELPER API] Error fetching from cache:`, cacheError);
      helperCacheDoc = { exists: false };
    }
    
    let helperItems = [];
    let isFromCache = false;
    
    if (helperCacheDoc.exists) {
      // Use cached data
      try {
        const cacheData = helperCacheDoc.data();
        if (cacheData && Array.isArray(cacheData.items) && cacheData.items.length > 0) {
          helperItems = cacheData.items;
          isFromCache = true;
          console.log(`[HELPER API] ✅ SUCCESS: Using cached ${requestedHelperType} data for question: ${questionId}`);
          console.log(`[HELPER API] Found ${helperItems.length} cached items after ${Date.now() - requestStartTime}ms`);
          
          // Update usage statistics in the background (non-blocking)
          setImmediate(() => {
            helperCacheRef.update({
              lastUsedAt: req.admin.firestore.FieldValue.serverTimestamp(),
              useCount: req.admin.firestore.FieldValue.increment(1)
            }).catch(updateError => {
              console.error(`[HELPER API] Non-critical error updating cache stats:`, updateError);
            });
          });
        } else {
          console.error(`[HELPER API] ⚠️ Cache entry exists but has invalid format:`, cacheData);
          isFromCache = false;
        }
      } catch (parseError) {
        console.error(`[HELPER API] ⚠️ Error parsing cache data:`, parseError);
        isFromCache = false;
      }
    }
    
    // If not from cache, get from AI service
    if (!isFromCache) {
      const llmStartTime = Date.now();
      console.log(`[HELPER API] 🔄 Cache miss for question: ${questionId}, generating new ${requestedHelperType} data`);
      
      if (requestedHelperType === 'vocabulary') {
        helperItems = await getVocabularyDefinitions({ questionContent });
      } else if (requestedHelperType === 'concept') {
        helperItems = await getConceptExplanations({ 
          questionContent,
          subcategory: subcategory || 'unknown',
          db: req.db,
          questionId: questionId
        });
      } else {
        throw new Error(`Unknown helper type: ${requestedHelperType}`);
      }
      
      console.log(`[HELPER API] LLM generation took ${Date.now() - llmStartTime}ms`);
      
      // Only cache if we actually got helper items
      if (Array.isArray(helperItems) && helperItems.length > 0) {
        // Cache the helper items for future use
        try {
          const cacheData = {
            questionId,
            helperType: requestedHelperType,
            items: helperItems,
            cachedAt: req.admin.firestore.FieldValue.serverTimestamp(),
            lastUsedAt: req.admin.firestore.FieldValue.serverTimestamp(),
            useCount: 1
          };
          
          // Store minimal question content to save space
          if (questionContent && questionContent.text) {
            cacheData.questionText = questionContent.text.substring(0, 200) + '...'; // Store truncated question text
          }
          
          await helperCacheRef.set(cacheData);
          console.log(`[HELPER API] ✅ Successfully cached ${helperItems.length} ${requestedHelperType} items for question: ${questionId}`);
        } catch (cacheError) {
          console.error(`[HELPER API] ⚠️ Failed to save to cache:`, cacheError);
        }
      } else {
        console.warn(`[HELPER API] ⚠️ Not caching empty ${requestedHelperType} result for question: ${questionId}`);
      }
    }
    
    console.log(`[HELPER API] Total processing time: ${Date.now() - requestStartTime}ms, fromCache: ${isFromCache}`);

    // Record this interaction
    try {
      const interactionRef = req.db.collection('quizAttempts').doc(quizId)
        .collection('questions').doc(questionId)
        .collection('helperInteractions').doc();

      await interactionRef.set({
        userId,
        timestamp: req.admin.firestore.FieldValue.serverTimestamp(),
        helperType: requestedHelperType,
        items: helperItems,
        fromCache: isFromCache,
        questionContentSnapshot: questionContent
      });
    } catch (error) {
      // Non-critical error, just log and continue
      console.error('Error saving helper interaction:', error);
    }

    // Return the helper items to the client with cache status
    const apiResponse = {
      items: helperItems,
      helperType: requestedHelperType,
      fromCache: isFromCache,
      source: isFromCache ? 'cache' : 'llm',
      cacheStats: isFromCache ? { hitTime: Date.now() - requestStartTime } : null
    };
    
    console.log(`[HELPER API] Sending response with fromCache=${isFromCache}:`, 
      JSON.stringify(apiResponse).substring(0, 100) + '...');
      
    res.json(apiResponse);

  } catch (error) {
    console.error('Error in /api/assistant/helper POST:', error.message);
    if (error.stack) console.error(error.stack);
    res.status(500).json({ error: error.message || 'Failed to get helper data' });
  }
});

/**
 * GET /api/assistant/helper/public/:questionId
 * Public, read-only endpoint to fetch cached helper items (no auth, no AI calls)
 * Optional query: ?helperType=vocabulary|concept (defaults to vocabulary)
 */
router.get('/helper/public/:questionId', publicHelperLimiter, async (req, res) => {
  try {
    const { questionId } = req.params;
    const helperTypeRaw = (req.query.helperType || 'vocabulary');
    const requestedHelperType = String(helperTypeRaw).toLowerCase();

    if (!req.db) {
      return res.status(500).json({ error: 'Firebase Firestore not available' });
    }

    if (!questionId) {
      return res.status(400).json({ error: 'Missing questionId' });
    }

    if (!['vocabulary', 'concept'].includes(requestedHelperType)) {
      return res.status(400).json({ error: 'Invalid helperType. Use "vocabulary" or "concept".' });
    }

    const cacheDocId = `${questionId}_${requestedHelperType}`;
    const helperCacheRef = req.db.collection('helperCache').doc(cacheDocId);

    let helperCacheDoc;
    try {
      helperCacheDoc = await helperCacheRef.get();
    } catch (e) {
      console.error('[PUBLIC HELPER] Cache read error:', e);
      return res.status(500).json({ error: 'Cache lookup failed' });
    }

    if (!helperCacheDoc.exists) {
      return res.status(404).json({ error: 'No cached helper data for this question.' });
    }

    const cacheData = helperCacheDoc.data() || {};
    const items = Array.isArray(cacheData.items) ? cacheData.items : [];

    if (!items.length) {
      return res.status(404).json({ error: 'No cached helper data for this question.' });
    }

    // Non-blocking: update simple usage metrics
    try {
      setImmediate(() => {
        helperCacheRef.update({
          lastPublicAccessAt: req.admin?.firestore?.FieldValue?.serverTimestamp?.(),
          publicAccessCount: req.admin?.firestore?.FieldValue?.increment?.(1)
        }).catch(() => {});
      });
    } catch (_) {
      // ignore metric update errors
    }

    return res.json({
      items,
      helperType: requestedHelperType,
      fromCache: true,
      source: 'cache'
    });
  } catch (error) {
    console.error('Error in /api/assistant/helper/public:', error);
    return res.status(500).json({ error: 'Failed to fetch cached helper data' });
  }
});

/**
 * POST /api/assistant/vocabulary
 * Legacy endpoint for vocabulary definitions (redirects to unified helper endpoint)
 */
router.post('/vocabulary', verifyFirebaseToken, async (req, res) => {
  try {
    // Add helperType to the request and forward to the unified endpoint
    req.body.helperType = 'vocabulary';
    
    // Forward to the helper endpoint handler
    return router.handle(req, res);
  } catch (error) {
    console.error('Error in vocabulary endpoint redirect:', error.message);
    res.status(500).json({ error: error.message || 'Failed to get vocabulary definitions' });
  }
});

module.exports = router;
