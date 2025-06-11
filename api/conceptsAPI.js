/**
 * Concepts API Endpoints
 * Handles predefined concept management operations including import, list, and delete
 */

const express = require('express');
const multer = require('multer');
const admin = require('firebase-admin');
const router = express.Router();

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
      
      // Check if user is admin by looking up their document in Firestore
      const userDoc = await req.db.collection('users').doc(req.user.uid).get();
      if (!userDoc.exists || !userDoc.data().isAdmin) {
        return res.status(403).json({ error: 'Unauthorized: Admin access required' });
      }
      
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

// Configure multer for file uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/json') {
      cb(null, true);
    } else {
      cb(new Error('Only JSON files are allowed'), false);
    }
  }
});

// Concept difficulty levels
const DIFFICULTY_LEVELS = {
  BASIC: 1,
  INTERMEDIATE: 2,
  ADVANCED: 3
};

const CONCEPT_SOURCES = {
  COLLEGEBOARD: 'collegeboard',
  ADMIN: 'admin',
  AI_GENERATED: 'ai'
};

/**
 * Validates a concept object
 * @param {Object} concept - The concept to validate
 * @param {string} subcategoryId - The target subcategory
 * @returns {Object} Validated concept or null if invalid
 */
function validateConcept(concept, subcategoryId) {
  const errors = [];
  
  // Required fields
  if (!concept.conceptId || typeof concept.conceptId !== 'string') {
    errors.push('Missing or invalid conceptId');
  }
  
  if (!concept.name || typeof concept.name !== 'string') {
    errors.push('Missing or invalid name');
  }
  
  if (!concept.description || typeof concept.description !== 'string') {
    errors.push('Missing or invalid description');
  }
  
  // Optional fields with defaults
  const difficulty = concept.difficulty || DIFFICULTY_LEVELS.INTERMEDIATE;
  if (concept.difficulty && !Object.values(DIFFICULTY_LEVELS).includes(difficulty)) {
    errors.push(`Invalid difficulty level: ${difficulty}`);
  }
  
  if (errors.length > 0) {
    return { valid: false, errors };
  }
  
  return {
    valid: true,
    concept: {
      subcategoryId,
      conceptId: concept.conceptId.trim(),
      name: concept.name.trim(),
      description: concept.description.trim(),
      difficulty: difficulty,
      source: concept.source || CONCEPT_SOURCES.COLLEGEBOARD,
      active: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }
  };
}

/**
 * Checks if a concept already exists in Firestore
 * @param {Object} db - Firestore database instance
 * @param {string} subcategoryId - The subcategory ID
 * @param {string} conceptId - The concept ID
 * @returns {Promise<boolean>} True if concept exists
 */
async function conceptExists(db, subcategoryId, conceptId) {
  try {
    const query = db.collection('predefinedConcepts')
      .where('subcategoryId', '==', subcategoryId)
      .where('conceptId', '==', conceptId);
    
    const snapshot = await query.get();
    return !snapshot.empty;
  } catch (error) {
    console.error('Error checking concept existence:', error);
    return false;
  }
}

/**
 * Import concepts from uploaded JSON data
 * @param {Object} db - Firestore database instance
 * @param {string} subcategoryId - Target subcategory ID
 * @param {Array} concepts - Array of concept objects
 * @param {Object} options - Import options
 */
async function importConceptsFromData(db, subcategoryId, concepts, options = {}) {
  const { skipExisting = true, dryRun = false, replaceAll = false } = options;
  
  if (!Array.isArray(concepts)) {
    throw new Error('Concepts data must be an array');
  }
  
  const results = {
    total: concepts.length,
    valid: 0,
    invalid: 0,
    skipped: 0,
    imported: 0,
    deleted: 0,
    errors: [],
    dryRun,
    replaceAll
  };
  
  // If replaceAll mode, delete existing concepts first
  if (replaceAll && !dryRun) {
    try {
      console.log(`Deleting existing concepts for subcategory: ${subcategoryId}`);
      const existingQuery = db.collection('predefinedConcepts')
        .where('subcategoryId', '==', subcategoryId);
      
      const existingSnapshot = await existingQuery.get();
      
      if (!existingSnapshot.empty) {
        const batch = db.batch();
        existingSnapshot.forEach(doc => {
          batch.delete(doc.ref);
        });
        
        await batch.commit();
        results.deleted = existingSnapshot.size;
        console.log(`Deleted ${results.deleted} existing concepts`);
      }
    } catch (deleteError) {
      throw new Error(`Failed to delete existing concepts: ${deleteError.message}`);
    }
  } else if (replaceAll && dryRun) {
    // In dry run mode, count what would be deleted
    try {
      const existingQuery = db.collection('predefinedConcepts')
        .where('subcategoryId', '==', subcategoryId);
      
      const existingSnapshot = await existingQuery.get();
      results.deleted = existingSnapshot.size;
    } catch (countError) {
      console.warn('Could not count existing concepts for dry run:', countError);
    }
  }
  
  // Process each concept
  for (let i = 0; i < concepts.length; i++) {
    const concept = concepts[i];
    
    // Validate concept
    const validation = validateConcept(concept, subcategoryId);
    if (!validation.valid) {
      results.invalid++;
      results.errors.push(`Concept ${i + 1} (${concept.name || concept.conceptId || 'unnamed'}): ${validation.errors.join(', ')}`);
      continue;
    }
    
    results.valid++;
    const validatedConcept = validation.concept;
    
    // Check if concept already exists (only if not in replaceAll mode)
    if (!replaceAll && skipExisting) {
      const exists = await conceptExists(db, subcategoryId, validatedConcept.conceptId);
      if (exists) {
        results.skipped++;
        continue;
      }
    }
    
    // Import concept (unless dry run)
    if (!dryRun) {
      try {
        await db.collection('predefinedConcepts').add(validatedConcept);
        results.imported++;
      } catch (importError) {
        console.error('Failed to import concept:', validatedConcept.conceptId, importError);
        results.errors.push(`Concept ${validatedConcept.conceptId}: ${importError.message}`);
      }
    } else {
      results.imported++;
    }
  }
  
  return results;
}

/**
 * POST /api/concepts/import
 * Import concepts from uploaded JSON file
 */
router.post('/import', verifyFirebaseToken, upload.single('conceptsFile'), async (req, res) => {
  try {
    const { subcategoryId, dryRun = false, forceOverwrite = false, replaceAll = false } = req.body;
    
    if (!subcategoryId) {
      return res.status(400).json({ error: 'subcategoryId is required' });
    }
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    let conceptsData;
    try {
      const fileContent = req.file.buffer.toString('utf8');
      conceptsData = JSON.parse(fileContent);
    } catch (parseError) {
      return res.status(400).json({ error: 'Invalid JSON file' });
    }

    const importResults = await importConceptsFromData(
      req.db, 
      subcategoryId, 
      conceptsData,
      { 
        skipExisting: !forceOverwrite && !replaceAll,
        dryRun: dryRun === 'true' || dryRun === true,
        replaceAll: replaceAll === 'true' || replaceAll === true
      }
    );

    res.json(importResults);

  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/concepts/list/:subcategoryId
 * List all concepts for a subcategory
 */
router.get('/list/:subcategoryId', async (req, res) => {
  try {
    // Check authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const token = authHeader.split(' ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    if (!decodedToken) {
      return res.status(401).json({ error: 'Invalid authentication token' });
    }
    
    const subcategoryId = req.params.subcategoryId;
    const db = admin.firestore();
    
    const query = db.collection('predefinedConcepts')
      .where('subcategoryId', '==', subcategoryId)
      .where('active', '==', true)
      .orderBy('name');
    
    const snapshot = await query.get();
    
    const concepts = [];
    snapshot.forEach(doc => {
      concepts.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.json({
      subcategoryId,
      count: concepts.length,
      concepts
    });
    
  } catch (error) {
    console.error('Error listing concepts:', error);
    res.status(500).json({ error: 'Failed to list concepts: ' + error.message });
  }
});

/**
 * DELETE /api/concepts/:subcategoryId
 * Delete all concepts for a subcategory
 */
router.delete('/:subcategoryId', async (req, res) => {
  try {
    // Check authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const token = authHeader.split(' ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    if (!decodedToken) {
      return res.status(401).json({ error: 'Invalid authentication token' });
    }
    
    const subcategoryId = req.params.subcategoryId;
    const confirm = req.query.confirm === 'true';
    
    if (!confirm) {
      return res.status(400).json({ error: 'Confirmation required. Add ?confirm=true to the request.' });
    }
    
    const db = admin.firestore();
    
    const query = db.collection('predefinedConcepts')
      .where('subcategoryId', '==', subcategoryId);
    
    const snapshot = await query.get();
    
    if (snapshot.empty) {
      return res.json({ message: 'No concepts found to delete', deleted: 0 });
    }
    
    const batch = db.batch();
    snapshot.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    
    res.json({
      message: `Deleted ${snapshot.size} concepts for subcategory ${subcategoryId}`,
      deleted: snapshot.size
    });
    
  } catch (error) {
    console.error('Error deleting concepts:', error);
    res.status(500).json({ error: 'Failed to delete concepts: ' + error.message });
  }
});

/**
 * GET /api/concepts/stats
 * Get overall concept statistics
 */
router.get('/stats', async (req, res) => {
  try {
    // Check authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const token = authHeader.split(' ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    if (!decodedToken) {
      return res.status(401).json({ error: 'Invalid authentication token' });
    }
    
    const db = admin.firestore();
    
    // Get all concepts
    const conceptsSnapshot = await db.collection('predefinedConcepts')
      .where('active', '==', true)
      .get();
    
    // Group by subcategory
    const statsBySubcategory = {};
    conceptsSnapshot.forEach(doc => {
      const data = doc.data();
      const subcategoryId = data.subcategoryId;
      
      if (!statsBySubcategory[subcategoryId]) {
        statsBySubcategory[subcategoryId] = {
          count: 0,
          sources: {},
          difficulties: {}
        };
      }
      
      statsBySubcategory[subcategoryId].count++;
      
      // Count by source
      const source = data.source || 'unknown';
      statsBySubcategory[subcategoryId].sources[source] = 
        (statsBySubcategory[subcategoryId].sources[source] || 0) + 1;
      
      // Count by difficulty
      const difficulty = data.difficulty || 'unknown';
      statsBySubcategory[subcategoryId].difficulties[difficulty] = 
        (statsBySubcategory[subcategoryId].difficulties[difficulty] || 0) + 1;
    });
    
    res.json({
      totalConcepts: conceptsSnapshot.size,
      subcategoriesWithConcepts: Object.keys(statsBySubcategory).length,
      statsBySubcategory
    });
    
  } catch (error) {
    console.error('Error getting concept stats:', error);
    res.status(500).json({ error: 'Failed to get statistics: ' + error.message });
  }
});

module.exports = router; 