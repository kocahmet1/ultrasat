/**
 * Express router for concept detail operations
 * Provides endpoints for getting detailed explanations and associated questions
 */

const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const { chatWithAssistant } = require('./aiService');

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
    return res.status(500).json({ error: 'Server error during authentication' });
  }
};

/**
 * POST /api/concepts/detailed-explanation
 * Generate a detailed explanation for a concept using LLM
 * 
 * Request body:
 * {
 *   conceptName: string,     // Name of the concept
 *   basicDefinition: string, // Basic definition from concept bank
 *   subcategory: string      // Subcategory for context
 * }
 * 
 * Response:
 * {
 *   explanation: string,     // Detailed HTML explanation
 *   cached: boolean,         // Whether this was retrieved from cache
 *   source: string          // 'cache' or 'llm'
 * }
 */
router.post('/detailed-explanation', verifyFirebaseToken, async (req, res) => {
  try {
    const { conceptName, basicDefinition, subcategory } = req.body;
    
    if (!conceptName || !basicDefinition) {
      return res.status(400).json({ error: 'conceptName and basicDefinition are required' });
    }

    // Check cache first
    const cachedExplanation = await getCachedExplanation(req.db, conceptName, subcategory);
    if (cachedExplanation) {
      return res.json({
        explanation: cachedExplanation.detailedExplanation,
        cached: true,
        source: 'cache'
      });
    }

    // Generate using LLM
    const detailedExplanation = await generateDetailedExplanation({
      conceptName,
      basicDefinition,
      subcategory
    });

    // Cache for future use
    await cacheExplanation(req.db, conceptName, subcategory, detailedExplanation);

    res.json({
      explanation: detailedExplanation,
      cached: false,
      source: 'llm'
    });

  } catch (error) {
    console.error('Error getting detailed explanation:', error);
    res.status(500).json({ error: error.message || 'Failed to generate detailed explanation' });
  }
});

/**
 * POST /api/concepts/questions
 * Get questions associated with a concept
 * 
 * Request body:
 * {
 *   conceptName: string,     // Name of the concept
 *   subcategory: string,     // Subcategory to search in
 *   limit: number           // Maximum number of questions (default: 5)
 * }
 * 
 * Response:
 * {
 *   questions: Array,        // Array of question objects
 *   total: number           // Total questions found
 * }
 */
router.post('/questions', verifyFirebaseToken, async (req, res) => {
  try {
    const { conceptName, subcategory, limit = 5 } = req.body;

    if (!conceptName) {
      return res.status(400).json({ error: 'conceptName is required' });
    }

    const questions = await findQuestionsByConceptName(req.db, conceptName, subcategory, limit);

    res.json({
      questions,
      total: questions.length
    });

  } catch (error) {
    console.error('Error getting questions by concept:', error);
    res.status(500).json({ error: error.message || 'Failed to get questions' });
  }
});

/**
 * POST /api/concepts/cache-explanation
 * Cache a detailed explanation (internal use)
 */
router.post('/cache-explanation', verifyFirebaseToken, async (req, res) => {
  try {
    const { conceptName, subcategory, explanation } = req.body;

    if (!conceptName || !explanation) {
      return res.status(400).json({ error: 'conceptName and explanation are required' });
    }

    await cacheExplanation(req.db, conceptName, subcategory, explanation);

    res.json({ success: true });

  } catch (error) {
    console.error('Error caching explanation:', error);
    res.status(500).json({ error: error.message || 'Failed to cache explanation' });
  }
});

// Helper Functions

/**
 * Generate detailed explanation using LLM
 */
async function generateDetailedExplanation({ conceptName, basicDefinition, subcategory }) {
  const prompt = `You are an expert SAT tutor. Generate a comprehensive, detailed explanation of the concept "${conceptName}" in the context of ${subcategory}.

Basic Definition: ${basicDefinition}

Please provide a detailed explanation that includes:

1. **Core Concept**: Expand on the basic definition with more depth and clarity
2. **Key Components**: Break down the main elements or parts of this concept
3. **How It Works**: Explain the mechanism, process, or application of this concept
4. **Common Examples**: Provide 2-3 concrete examples that illustrate the concept
5. **SAT Context**: Explain how this concept typically appears in SAT questions
6. **Common Mistakes**: Highlight 2-3 common errors students make with this concept
7. **Study Tips**: Provide practical advice for mastering this concept

Format your response in clean HTML with appropriate headings (h3, h4), paragraphs, lists, and emphasis. Make it engaging and educational for high school students preparing for the SAT.

Avoid personal statements or greetings and do not address the reader directly. Present the explanation in a lecture style aimed at a general audience.

Do not include any markdown formatting - use HTML only. Start directly with the content without any introductory text.`;

  try {
    const response = await chatWithAssistant({
      question: { text: prompt },
      history: [],
      summariseRequested: false,
      tipRequested: false,
      primingCall: false
    });

    return response.message;
  } catch (error) {
    console.error('Error generating detailed explanation:', error);
    throw new Error('Failed to generate detailed explanation');
  }
}

/**
 * Get cached explanation from database
 */
async function getCachedExplanation(db, conceptName, subcategory) {
  try {
    const cacheRef = db.collection('conceptExplanationCache');
    const cacheKey = `${conceptName}_${subcategory}`.toLowerCase().replace(/[^a-z0-9_]/g, '_');
    
    const doc = await cacheRef.doc(cacheKey).get();
    
    if (doc.exists) {
      const data = doc.data();
      const thirtyDaysAgo = new Date(Date.now() - (30 * 24 * 60 * 60 * 1000));
      if (data.createdAt && data.createdAt.toDate() > thirtyDaysAgo) {
        return data;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error getting cached explanation:', error);
    return null;
  }
}

/**
 * Cache explanation in database
 */
async function cacheExplanation(db, conceptName, subcategory, explanation) {
  try {
    const cacheRef = db.collection('conceptExplanationCache');
    const cacheKey = `${conceptName}_${subcategory}`.toLowerCase().replace(/[^a-z0-9_]/g, '_');
    
    await cacheRef.doc(cacheKey).set({
      conceptName,
      subcategory,
      detailedExplanation: explanation,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  } catch (error) {
    console.error('Error caching explanation:', error);
  }
}

/**
 * Find questions associated with a concept name
 */
async function findQuestionsByConceptName(db, conceptName, subcategory, limit) {
  try {
    const questions = [];
    
    // Method 1: Search through predefined concepts and associations
    if (subcategory) {
      const predefinedConceptsQuery = db.collection('predefinedConcepts')
        .where('name', '==', conceptName)
        .where('subcategoryId', '==', subcategory)
        .where('active', '==', true);
      
      const predefinedSnapshot = await predefinedConceptsQuery.get();
      
      if (!predefinedSnapshot.empty) {
        const conceptDoc = predefinedSnapshot.docs[0];
        const conceptId = conceptDoc.data().conceptId;
        
        const associationsQuery = db.collection('questionConceptAssociations')
          .where('conceptIds', 'array-contains', conceptId)
          .limit(limit);
        
        const associationsSnapshot = await associationsQuery.get();
        
        for (const assocDoc of associationsSnapshot.docs) {
          const questionId = assocDoc.data().questionId;
          
          try {
            const questionDoc = await db.collection('questions').doc(questionId).get();
            if (questionDoc.exists) {
              const questionData = questionDoc.data();
              questions.push({
                id: questionDoc.id,
                text: questionData.text,
                options: questionData.options,
                correctAnswer: questionData.correctAnswer,
                explanation: questionData.explanation,
                subcategory: questionData.subcategory,
                difficulty: questionData.difficulty || 1
              });
            }
          } catch (questionError) {
            console.warn(`Failed to fetch question ${questionId}:`, questionError.message);
          }
        }
      }
    }
    
    // Method 2: Fallback text search if needed
    if (questions.length < limit) {
      const remainingLimit = limit - questions.length;
      
      const questionsQuery = db.collection('questions')
        .where('subcategory', '==', subcategory)
        .limit(remainingLimit * 2);
      
      const questionsSnapshot = await questionsQuery.get();
      const conceptKeywords = conceptName.toLowerCase().split(' ');
      
      questionsSnapshot.docs.forEach(doc => {
        if (questions.length >= limit) return;
        
        const questionData = doc.data();
        const questionText = (questionData.text || '').toLowerCase();
        const explanation = (questionData.explanation || '').toLowerCase();
        
        const hasConceptKeywords = conceptKeywords.some(keyword => 
          questionText.includes(keyword) || explanation.includes(keyword)
        );
        
        if (hasConceptKeywords) {
          const isDuplicate = questions.some(q => q.id === doc.id);
          if (!isDuplicate) {
            questions.push({
              id: doc.id,
              text: questionData.text,
              options: questionData.options,
              correctAnswer: questionData.correctAnswer,
              explanation: questionData.explanation,
              subcategory: questionData.subcategory,
              difficulty: questionData.difficulty || 1
            });
          }
        }
      });
    }
    
    return questions.slice(0, limit);
    
  } catch (error) {
    console.error('Error finding questions by concept name:', error);
    return [];
  }
}

module.exports = router; 