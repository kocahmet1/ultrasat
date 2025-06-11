/**
 * API Endpoint for analyzing quiz results
 * Identifies concepts that need improvement based on wrong answers
 */

const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const { generateConceptAnalysis } = require('./openaiService');

// Middleware to ensure requests are authenticated
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized - Missing or invalid token' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Unauthorized - Invalid token' });
  }
};

/**
 * POST /api/analyze-quiz
 * Analyzes wrong answers from an adaptive quiz and identifies concepts that need improvement
 * 
 * Request body:
 * {
 *   quizId: string,            // ID of the adaptive quiz
 *   wrongQuestions: [          // Array of questions the user got wrong
 *     {
 *       id: string,            // Question ID
 *       text: string,          // Question text
 *       subcategory: string,   // Subcategory of the question
 *       userAnswer: string,    // User's incorrect answer
 *       correctAnswer: string  // The correct answer
 *     }
 *   ]
 * }
 * 
 * Response:
 * {
 *   concepts: [                // Array of identified concepts
 *     {
 *       conceptId: string,     // Generated concept ID
 *       name: string,          // Display name for the concept
 *       explanation: string,   // HTML-formatted explanation of the concept
 *       subcategory: string    // Parent subcategory
 *     }
 *   ]
 * }
 */
router.post('/analyze-quiz', authenticateUser, async (req, res) => {
  try {
    const { quizId, wrongQuestions } = req.body;
    const userId = req.user.uid;

    if (!quizId || !wrongQuestions || !Array.isArray(wrongQuestions) || wrongQuestions.length === 0) {
      return res.status(400).json({ error: 'Invalid request. quizId and non-empty wrongQuestions array required.' });
    }

    // Verify that the quiz belongs to the user
    const quizRef = admin.firestore().collection('adaptiveQuizzes').doc(quizId);
    const quizDoc = await quizRef.get();

    if (!quizDoc.exists) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    const quizData = quizDoc.data();
    if (quizData.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized - Quiz does not belong to user' });
    }

    // Generate concept analysis using OpenAI
    const subcategory = quizData.subcategory || wrongQuestions[0].subcategory;
    const conceptAnalysis = await generateConceptAnalysis(wrongQuestions, subcategory);

    // Save identified concepts to the database
    const db = admin.firestore();
    const batch = db.batch();
    const savedConcepts = [];

    for (const concept of conceptAnalysis.concepts) {
      // Generate a camelCase conceptId from the name if not provided
      if (!concept.conceptId) {
        concept.conceptId = concept.name
          .toLowerCase()
          .replace(/[^a-z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
          .replace(/[^a-z0-9]/g, '');
      }

      // Save concept to Firestore
      const conceptRef = db.collection('concepts').doc(concept.conceptId);
      batch.set(conceptRef, {
        subcategoryId: subcategory,
        name: concept.name,
        explanationHTML: concept.explanation,
        createdBy: 'ai',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      savedConcepts.push({
        conceptId: concept.conceptId,
        name: concept.name,
        explanation: concept.explanation,
        subcategory
      });
    }

    // Update the quiz with identified concepts
    const conceptIds = savedConcepts.map(concept => concept.conceptId);
    batch.update(quizRef, {
      wrongConcepts: conceptIds,
      analysisComplete: true,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    await batch.commit();

    res.status(200).json({
      success: true,
      concepts: savedConcepts
    });
  } catch (error) {
    console.error('Error analyzing quiz:', error);
    res.status(500).json({ error: `Failed to analyze quiz: ${error.message}` });
  }
});

module.exports = router;
