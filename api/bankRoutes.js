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

module.exports = router;
