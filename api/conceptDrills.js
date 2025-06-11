/**
 * API Endpoint for generating concept-based practice drills
 * Creates question sets specifically targeted at concepts identified in wrong answers
 */

const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const { generateConceptDrill } = require('./openaiService');

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
 * POST /api/generate-concept-drill
 * Generates a set of practice questions for a specific concept
 * 
 * Request body:
 * {
 *   conceptId: string,        // ID of the concept to practice (required)
 *   difficulty: number        // Difficulty level 1-3 (defaults to 1)
 * }
 * 
 * Response:
 * {
 *   drillId: string,          // ID of the created concept drill
 *   conceptId: string,        // ID of the concept
 *   conceptName: string,      // Name of the concept
 *   questions: [              // Array of generated questions
 *     {
 *       text: string,         // Question text
 *       options: Array,       // Answer choices
 *       correctAnswer: string, // Correct answer
 *       explanation: string   // Explanation of the answer
 *     }
 *   ],
 *   difficulty: number,       // Difficulty level
 *   subcategory: string       // Parent subcategory
 * }
 */
router.post('/generate-concept-drill', authenticateUser, async (req, res) => {
  try {
    const { conceptId, difficulty = 1 } = req.body;
    const userId = req.user.uid;

    if (!conceptId) {
      return res.status(400).json({ error: 'Invalid request. conceptId is required.' });
    }

    // Check if a drill already exists for this concept and difficulty
    const db = admin.firestore();
    const drillsRef = db.collection('conceptDrills');
    const drillsQuery = drillsRef
      .where('conceptId', '==', conceptId)
      .where('difficulty', '==', difficulty)
      .orderBy('createdAt', 'desc')
      .limit(1);

    const drillsSnapshot = await drillsQuery.get();

    // If we found an existing drill, return it
    if (!drillsSnapshot.empty) {
      const drillDoc = drillsSnapshot.docs[0];
      const drillData = drillDoc.data();
      return res.status(200).json({
        success: true,
        existingDrill: true,
        drillId: drillDoc.id,
        ...drillData
      });
    }

    // Get the concept details
    const conceptRef = db.collection('concepts').doc(conceptId);
    const conceptDoc = await conceptRef.get();

    if (!conceptDoc.exists) {
      return res.status(404).json({ error: 'Concept not found' });
    }

    const concept = conceptDoc.data();
    
    // Generate concept-focused questions
    const drillData = await generateConceptDrill(
      conceptId,
      concept.name,
      concept.explanationHTML,
      difficulty,
      concept.subcategoryId
    );

    // Save the drill to the database
    const drillRef = await drillsRef.add({
      ...drillData,
      userId: userId,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.status(200).json({
      success: true,
      drillId: drillRef.id,
      ...drillData
    });
  } catch (error) {
    console.error('Error generating concept drill:', error);
    res.status(500).json({ error: `Failed to generate concept drill: ${error.message}` });
  }
});

/**
 * GET /api/concept-drill/:conceptId
 * Gets the latest drill for a specific concept and difficulty
 * 
 * URL Parameters:
 * - conceptId: ID of the concept
 * 
 * Query Parameters:
 * - difficulty: Difficulty level (1-3, defaults to 1)
 * 
 * Response:
 * {
 *   drillId: string,          // ID of the concept drill
 *   conceptId: string,        // ID of the concept
 *   questions: Array,         // Array of questions
 *   difficulty: number,       // Difficulty level
 *   subcategory: string       // Parent subcategory
 * }
 */
router.get('/concept-drill/:conceptId', authenticateUser, async (req, res) => {
  try {
    const { conceptId } = req.params;
    const difficulty = parseInt(req.query.difficulty || '1');

    if (!conceptId) {
      return res.status(400).json({ error: 'Invalid request. conceptId is required.' });
    }

    // Find the latest drill for this concept and difficulty
    const db = admin.firestore();
    const drillsRef = db.collection('conceptDrills');
    const drillsQuery = drillsRef
      .where('conceptId', '==', conceptId)
      .where('difficulty', '==', difficulty)
      .orderBy('createdAt', 'desc')
      .limit(1);

    const drillsSnapshot = await drillsQuery.get();

    if (drillsSnapshot.empty) {
      return res.status(404).json({ error: 'No drill found for this concept and difficulty' });
    }

    const drillDoc = drillsSnapshot.docs[0];
    const drillData = drillDoc.data();

    res.status(200).json({
      success: true,
      drillId: drillDoc.id,
      ...drillData
    });
  } catch (error) {
    console.error('Error getting concept drill:', error);
    res.status(500).json({ error: `Failed to get concept drill: ${error.message}` });
  }
});

module.exports = router;
