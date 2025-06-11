/**
 * Script to initialize helper types for all subcategories
 * Run this script once to set default values
 */
const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();
const ALL_SUBCATEGORIES = require('../src/utils/subcategoryUtils').getAllSubcategories();

// Math subcategories that should use concept helpers
const CONCEPT_HELPER_SUBCATEGORIES = [
  // Math subcategories
  'algebra', 'advanced-math', 'problem-solving-and-data-analysis', 'geometry', 'trigonometry',
  'coordinate-geometry', 'quadratics', 'functions', 'statistics-and-probability',
  // Some reading/writing subcategories that are more about concepts than vocabulary
  'punctuation', 'transitions', 'sentence-structure', 'standard-english-conventions',
  'command-of-evidence'
];

async function initializeHelperTypes() {
  const subcategoriesCollection = db.collection('subcategories');
  const batch = db.batch();
  let docCount = 0;
  let batchCount = 0;
  
  console.log(`Processing ${Object.keys(ALL_SUBCATEGORIES).length} subcategories...`);
  
  // Get existing subcategories to avoid duplicates
  const existingDocs = await subcategoriesCollection.get();
  const existingIds = new Set();
  existingDocs.forEach(doc => existingIds.add(doc.id));
  
  for (const [subcategoryId, subcategory] of Object.entries(ALL_SUBCATEGORIES)) {
    const helperType = CONCEPT_HELPER_SUBCATEGORIES.includes(subcategoryId) ? 'concept' : 'vocabulary';
    
    // Check if this subcategory already exists
    if (existingIds.has(subcategoryId)) {
      // Update existing document
      batch.update(subcategoriesCollection.doc(subcategoryId), { 
        helperType, 
        lastUpdated: admin.firestore.FieldValue.serverTimestamp() 
      });
    } else {
      // Create new document
      batch.set(subcategoriesCollection.doc(subcategoryId), {
        id: subcategoryId,
        name: subcategory.name,
        color: subcategory.color,
        section: subcategory.section || 'unknown',
        helperType,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    
    docCount++;
    
    // Commit batch if we've reached 500 operations
    if (docCount >= 500) {
      console.log(`Committing batch ${++batchCount} with ${docCount} operations`);
      await batch.commit();
      batch = db.batch();
      docCount = 0;
    }
  }
  
  // Commit any remaining operations
  if (docCount > 0) {
    console.log(`Committing final batch with ${docCount} operations`);
    await batch.commit();
  }
  
  console.log('Subcategory helper types initialized successfully');
}

// Run the function
initializeHelperTypes()
  .then(() => {
    console.log('Helper type initialization complete');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error initializing helper types:', error);
    process.exit(1);
  });
