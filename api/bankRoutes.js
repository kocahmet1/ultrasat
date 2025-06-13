/**
 * Express router for managing user's vocabulary and concept bank
 */

const express = require('express');
const router = express.Router();

// Use Firebase Admin from the req object, initialized in server.js

// Middleware to verify Firebase ID token (reusing from assistant.js)
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
 * POST /api/bank/save
 * Save a word or concept to the user's bank
 */
router.post('/save', verifyFirebaseToken, async (req, res) => {
  try {
    const { term, definition, type = 'word', source = 'quiz', metadata = {} } = req.body;
    const userId = req.user.uid;

    if (!term || !definition) {
      return res.status(400).json({ error: 'Term and definition are required.' });
    }

    if (!['word', 'concept'].includes(type)) {
      return res.status(400).json({ error: 'Type must be either "word" or "concept".' });
    }

    // Add the item to the user's bank (using a single collection for both words and concepts)
    const bankItemRef = req.db.collection('users').doc(userId).collection('bankItems').doc();
    
    await bankItemRef.set({
      term: term.trim(),
      definition: definition.trim(),
      type, // 'word' or 'concept'
      source,
      metadata,
      createdAt: req.admin.firestore.FieldValue.serverTimestamp(),
      lastReviewedAt: null,
      reviewCount: 0,
      mastered: false
    });

    res.status(201).json({ 
      success: true, 
      id: bankItemRef.id,
      message: `${type === 'word' ? 'Word' : 'Concept'} saved successfully.` 
    });
  } catch (error) {
    console.error(`Error in /api/bank/save POST:`, error);
    res.status(500).json({ error: error.message || 'Failed to save item to bank.' });
  }
});

/**
 * GET /api/bank/items
 * Get all items in the user's bank with optional filtering by type
 */
router.get('/items', verifyFirebaseToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { type } = req.query; // Optional filter by type ('word' or 'concept')
    
    let query = req.db.collection('users').doc(userId).collection('bankItems')
      .orderBy('createdAt', 'desc');
    
    // Apply type filter if specified
    if (type && ['word', 'concept'].includes(type)) {
      query = query.where('type', '==', type);
    }
    
    const snapshot = await query.get();
    
    if (snapshot.empty) {
      return res.json({ items: [] });
    }
    
    const items = [];
    snapshot.forEach(doc => {
      items.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt ? doc.data().createdAt.toDate() : null,
        lastReviewedAt: doc.data().lastReviewedAt ? doc.data().lastReviewedAt.toDate() : null
      });
    });
    
    res.json({ items });
  } catch (error) {
    console.error(`Error in /api/bank/items GET:`, error);
    res.status(500).json({ error: error.message || 'Failed to retrieve bank items.' });
  }
});

/**
 * DELETE /api/bank/items/:itemId
 * Remove an item from the user's bank
 */
router.delete('/items/:itemId', verifyFirebaseToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { itemId } = req.params;
    
    if (!itemId) {
      return res.status(400).json({ error: 'Item ID is required.' });
    }
    
    // Check if the item exists and belongs to the user
    const itemRef = req.db.collection('users').doc(userId).collection('bankItems').doc(itemId);
    const itemDoc = await itemRef.get();
    
    if (!itemDoc.exists) {
      return res.status(404).json({ error: 'Item not found.' });
    }
    
    // Delete the item
    await itemRef.delete();
    
    res.json({ 
      success: true, 
      message: 'Item removed successfully.' 
    });
  } catch (error) {
    console.error(`Error in /api/bank/items/:itemId DELETE:`, error);
    res.status(500).json({ error: error.message || 'Failed to delete bank item.' });
  }
});

/**
 * PATCH /api/bank/items/:itemId
 * Update an item in the user's bank (e.g., mark as mastered)
 */
router.patch('/items/:itemId', verifyFirebaseToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { itemId } = req.params;
    const updates = req.body;
    
    if (!itemId) {
      return res.status(400).json({ error: 'Item ID is required.' });
    }
    
    // Sanitize allowed update fields
    const allowedFields = ['mastered', 'definition', 'notes'];
    const sanitizedUpdates = {};
    
    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        sanitizedUpdates[key] = updates[key];
      }
    });
    
    if (Object.keys(sanitizedUpdates).length === 0) {
      return res.status(400).json({ error: 'No valid update fields provided.' });
    }
    
    // Add last updated timestamp
    sanitizedUpdates.updatedAt = req.admin.firestore.FieldValue.serverTimestamp();
    
    // Check if the item exists and belongs to the user
    const itemRef = req.db.collection('users').doc(userId).collection('bankItems').doc(itemId);
    const itemDoc = await itemRef.get();
    
    if (!itemDoc.exists) {
      return res.status(404).json({ error: 'Item not found.' });
    }
    
    // Update the item
    await itemRef.update(sanitizedUpdates);
    
    res.json({ 
      success: true, 
      message: 'Item updated successfully.' 
    });
  } catch (error) {
    console.error(`Error in /api/bank/items/:itemId PATCH:`, error);
    res.status(500).json({ error: error.message || 'Failed to update bank item.' });
  }
});

/**
 * Ensure "Deck 1" exists for a user (default deck) - LEGACY FALLBACK
 * This is a fallback for users who signed up before automatic deck creation was implemented
 */
const ensureDefaultDeck = async (req, userId) => {
  try {
    // Check if user has any decks at all
    const decksQuery = await req.db.collection('users').doc(userId)
      .collection('flashcardDecks')
      .limit(1)
      .get();

    if (decksQuery.empty) {
      // This is likely a legacy user - create "Deck 1" as fallback
      const deckRef = req.db.collection('users').doc(userId).collection('flashcardDecks').doc();
      await deckRef.set({
        name: 'Deck 1',
        description: 'Default flashcard deck',
        createdAt: req.admin.firestore.FieldValue.serverTimestamp(),
        wordCount: 0,
        lastStudiedAt: null
      });
      console.log(`Created fallback "Deck 1" for legacy user ${userId}`);
    }
  } catch (error) {
    console.error('Error ensuring default deck:', error);
    // Don't throw error, just log it - this is not critical
  }
};

/**
 * GET /api/bank/flashcard-decks
 * Get all flashcard decks for the user
 */
router.get('/flashcard-decks', verifyFirebaseToken, async (req, res) => {
  try {
    const userId = req.user.uid;

    // Ensure "Deck 1" exists for this user
    await ensureDefaultDeck(req, userId);

    // Get all flashcard decks for the user
    const decksSnapshot = await req.db.collection('users').doc(userId).collection('flashcardDecks').get();
    
    const decks = [];
    decksSnapshot.forEach(doc => {
      const deckData = doc.data();
      decks.push({
        id: doc.id,
        name: deckData.name,
        description: deckData.description || '',
        createdAt: deckData.createdAt,
        wordCount: deckData.wordCount || 0,
        lastStudiedAt: deckData.lastStudiedAt ? deckData.lastStudiedAt.toDate().toISOString() : null
      });
    });

    // Sort by creation date (newest first), but ensure "Deck 1" is always first
    decks.sort((a, b) => {
      // Always put "Deck 1" first
      if (a.name === 'Deck 1') return -1;
      if (b.name === 'Deck 1') return 1;
      
      // Then sort by creation date
      if (!a.createdAt) return 1;
      if (!b.createdAt) return -1;
      return b.createdAt.toDate() - a.createdAt.toDate();
    });

    res.json({ decks });
  } catch (error) {
    console.error('Error in /api/bank/flashcard-decks GET:', error);
    res.status(500).json({ error: 'Failed to get flashcard decks.' });
  }
});

/**
 * POST /api/bank/flashcard-decks
 * Create a new flashcard deck
 */
router.post('/flashcard-decks', verifyFirebaseToken, async (req, res) => {
  try {
    const { name, description = '' } = req.body;
    const userId = req.user.uid;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Deck name is required.' });
    }

    // Create the deck
    const deckRef = req.db.collection('users').doc(userId).collection('flashcardDecks').doc();
    
    await deckRef.set({
      name: name.trim(),
      description: description.trim(),
      createdAt: req.admin.firestore.FieldValue.serverTimestamp(),
      wordCount: 0,
      lastStudiedAt: null
    });

    res.status(201).json({ 
      success: true, 
      id: deckRef.id,
      message: 'Flashcard deck created successfully.' 
    });
  } catch (error) {
    console.error('Error in /api/bank/flashcard-decks POST:', error);
    res.status(500).json({ error: 'Failed to create flashcard deck.' });
  }
});

/**
 * POST /api/bank/flashcard-decks/:deckId/words
 * Add a word to a flashcard deck
 */
router.post('/flashcard-decks/:deckId/words', verifyFirebaseToken, async (req, res) => {
  try {
    const { deckId } = req.params;
    const { wordId, term, definition } = req.body;
    const userId = req.user.uid;

    if (!term || !definition) {
      return res.status(400).json({ error: 'Term and definition are required.' });
    }

    // Check if deck exists and belongs to user
    const deckRef = req.db.collection('users').doc(userId).collection('flashcardDecks').doc(deckId);
    const deckDoc = await deckRef.get();
    
    if (!deckDoc.exists) {
      return res.status(404).json({ error: 'Flashcard deck not found.' });
    }

    // Check if word is already in the deck
    const existingWordQuery = await req.db.collection('users').doc(userId)
      .collection('flashcardDecks').doc(deckId)
      .collection('words')
      .where('term', '==', term.trim())
      .get();

    if (!existingWordQuery.empty) {
      return res.status(400).json({ error: 'Word is already in this deck.' });
    }

    // Add word to the deck
    const wordRef = req.db.collection('users').doc(userId)
      .collection('flashcardDecks').doc(deckId)
      .collection('words').doc();

    await wordRef.set({
      term: term.trim(),
      definition: definition.trim(),
      wordId: wordId || null, // Reference to the original word in bankItems
      addedAt: req.admin.firestore.FieldValue.serverTimestamp(),
      timesStudied: 0,
      correctCount: 0,
      incorrectCount: 0,
      lastStudiedAt: null,
      difficulty: 'medium' // easy, medium, hard
    });

    // Update deck word count
    await deckRef.update({
      wordCount: req.admin.firestore.FieldValue.increment(1)
    });

    res.status(201).json({ 
      success: true, 
      id: wordRef.id,
      message: 'Word added to flashcard deck successfully.' 
    });
  } catch (error) {
    console.error('Error in /api/bank/flashcard-decks/:deckId/words POST:', error);
    res.status(500).json({ error: 'Failed to add word to flashcard deck.' });
  }
});

/**
 * GET /api/bank/flashcard-decks/:deckId/words
 * Get all words in a flashcard deck
 */
router.get('/flashcard-decks/:deckId/words', verifyFirebaseToken, async (req, res) => {
  try {
    const { deckId } = req.params;
    const userId = req.user.uid;

    // Check if deck exists and belongs to user
    const deckRef = req.db.collection('users').doc(userId).collection('flashcardDecks').doc(deckId);
    const deckDoc = await deckRef.get();
    
    if (!deckDoc.exists) {
      return res.status(404).json({ error: 'Flashcard deck not found.' });
    }

    // Get all words in the deck
    const wordsSnapshot = await req.db.collection('users').doc(userId)
      .collection('flashcardDecks').doc(deckId)
      .collection('words')
      .orderBy('addedAt', 'desc')
      .get();

    const words = [];
    wordsSnapshot.forEach(doc => {
      const wordData = doc.data();
      words.push({
        id: doc.id,
        term: wordData.term,
        definition: wordData.definition,
        wordId: wordData.wordId,
        addedAt: wordData.addedAt,
        timesStudied: wordData.timesStudied || 0,
        correctCount: wordData.correctCount || 0,
        incorrectCount: wordData.incorrectCount || 0,
        lastStudiedAt: wordData.lastStudiedAt,
        difficulty: wordData.difficulty || 'medium'
      });
    });

    res.json({ words });
  } catch (error) {
    console.error('Error in /api/bank/flashcard-decks/:deckId/words GET:', error);
    res.status(500).json({ error: 'Failed to get flashcard deck words.' });
  }
});

/**
 * DELETE /api/bank/flashcard-decks/:deckId/words/:wordId
 * Remove a word from a flashcard deck
 */
router.delete('/flashcard-decks/:deckId/words/:wordId', verifyFirebaseToken, async (req, res) => {
  try {
    const { deckId, wordId } = req.params;
    const userId = req.user.uid;

    // Check if deck exists and belongs to user
    const deckRef = req.db.collection('users').doc(userId).collection('flashcardDecks').doc(deckId);
    const deckDoc = await deckRef.get();
    
    if (!deckDoc.exists) {
      return res.status(404).json({ error: 'Flashcard deck not found.' });
    }

    // Remove word from deck
    const wordRef = req.db.collection('users').doc(userId)
      .collection('flashcardDecks').doc(deckId)
      .collection('words').doc(wordId);

    const wordDoc = await wordRef.get();
    if (!wordDoc.exists) {
      return res.status(404).json({ error: 'Word not found in deck.' });
    }

    await wordRef.delete();

    // Update deck word count
    await deckRef.update({
      wordCount: req.admin.firestore.FieldValue.increment(-1)
    });

    res.json({ 
      success: true, 
      message: 'Word removed from flashcard deck successfully.' 
    });
  } catch (error) {
    console.error('Error in /api/bank/flashcard-decks/:deckId/words/:wordId DELETE:', error);
    res.status(500).json({ error: 'Failed to remove word from flashcard deck.' });
  }
});

/**
 * POST /api/bank/flashcard-decks/:deckId/study
 * Update study statistics for a word
 */
router.post('/flashcard-decks/:deckId/study', verifyFirebaseToken, async (req, res) => {
  try {
    const { deckId } = req.params;
    const { wordId, correct } = req.body;
    const userId = req.user.uid;

    if (typeof correct !== 'boolean') {
      return res.status(400).json({ error: 'Correct status is required.' });
    }

    // Check if deck exists and belongs to user
    const deckRef = req.db.collection('users').doc(userId).collection('flashcardDecks').doc(deckId);
    const deckDoc = await deckRef.get();
    
    if (!deckDoc.exists) {
      return res.status(404).json({ error: 'Flashcard deck not found.' });
    }

    // Update word study statistics
    const wordRef = req.db.collection('users').doc(userId)
      .collection('flashcardDecks').doc(deckId)
      .collection('words').doc(wordId);

    const wordDoc = await wordRef.get();
    if (!wordDoc.exists) {
      return res.status(404).json({ error: 'Word not found in deck.' });
    }

    const updates = {
      timesStudied: req.admin.firestore.FieldValue.increment(1),
      lastStudiedAt: req.admin.firestore.FieldValue.serverTimestamp()
    };

    if (correct) {
      updates.correctCount = req.admin.firestore.FieldValue.increment(1);
    } else {
      updates.incorrectCount = req.admin.firestore.FieldValue.increment(1);
    }

    await wordRef.update(updates);

    // Update deck last studied time
    await deckRef.update({
      lastStudiedAt: req.admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({ 
      success: true, 
      message: 'Study statistics updated successfully.' 
    });
  } catch (error) {
    console.error('Error in /api/bank/flashcard-decks/:deckId/study POST:', error);
    res.status(500).json({ error: 'Failed to update study statistics.' });
  }
});

module.exports = router;
