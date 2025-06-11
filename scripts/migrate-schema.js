/**
 * Migration script to update the Firestore schema for the Unified Learning Track
 * This script should be run once to:
 * 1. Create concepts & conceptDrills collections if missing
 * 2. Add wrongConcepts & analysisComplete fields to existing adaptiveQuizzes
 * 3. Scaffold users/<uid>/progress/<subcategoryId> docs
 * 
 * Run with: node scripts/migrate-schema.js
 */

// Load environment variables
require('dotenv').config();

const admin = require('firebase-admin');
const path = require('path');
const { normalizeSubcategoryName } = require('../src/utils/subcategoryUtils');

// Initialize Firebase Admin SDK
try {
  const serviceAccountPath = path.resolve(__dirname, '../ultrasat-5e4c4-firebase-adminsdk-fbsvc-065332b34c.json');
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountPath),
    databaseURL: 'https://ultrasat-5e4c4.firebaseio.com'
  });
  
  console.log('Firebase Admin SDK initialized successfully');
} catch (error) {
  console.error('Firebase Admin initialization error:', error);
  process.exit(1);
}

const db = admin.firestore();

/**
 * Ensures collections exist and have the correct structure
 */
async function ensureCollectionsExist() {
  console.log('Ensuring required collections exist...');

  // Check if concepts collection exists, create if not
  const conceptsRef = db.collection('concepts');
  const conceptsSnapshot = await conceptsRef.limit(1).get();
  
  if (conceptsSnapshot.empty) {
    console.log('concepts collection does not exist, creating...');
    // We don't actually need to create anything, as Firebase creates collections automatically
    console.log('concepts collection is ready (will be created when documents are added)');
  } else {
    console.log('concepts collection already exists');
  }

  // Check if conceptDrills collection exists, create if not
  const drillsRef = db.collection('conceptDrills');
  const drillsSnapshot = await drillsRef.limit(1).get();
  
  if (drillsSnapshot.empty) {
    console.log('conceptDrills collection does not exist, creating...');
    console.log('conceptDrills collection is ready (will be created when documents are added)');
  } else {
    console.log('conceptDrills collection already exists');
  }
}

/**
 * Updates adaptive quizzes to add wrongConcepts and analysisComplete fields
 */
async function updateAdaptiveQuizzes() {
  console.log('Updating adaptiveQuizzes collection...');
  
  const quizzesRef = db.collection('adaptiveQuizzes');
  const quizzesSnapshot = await quizzesRef.get();
  
  if (quizzesSnapshot.empty) {
    console.log('No adaptive quizzes found');
    return;
  }
  
  let updatedCount = 0;
  let batch = db.batch();
  let batchCount = 0;
  const BATCH_LIMIT = 500; // Firestore batch limit
  
  for (const doc of quizzesSnapshot.docs) {
    const quizData = doc.data();
    
    // Skip if already has these fields
    if (quizData.wrongConcepts !== undefined && quizData.analysisComplete !== undefined) {
      continue;
    }
    
    // Add fields if they don't exist
    const updates = {};
    if (quizData.wrongConcepts === undefined) {
      updates.wrongConcepts = [];
    }
    if (quizData.analysisComplete === undefined) {
      updates.analysisComplete = false;
    }
    
    if (Object.keys(updates).length > 0) {
      batch.update(doc.ref, updates);
      updatedCount++;
      batchCount++;
      
      // If batch limit reached, commit and start new batch
      if (batchCount >= BATCH_LIMIT) {
        await batch.commit();
        console.log(`Batch committed (${batchCount} documents)`);
        batch = db.batch();
        batchCount = 0;
      }
    }
  }
  
  // Commit any remaining updates
  if (batchCount > 0) {
    await batch.commit();
    console.log(`Final batch committed (${batchCount} documents)`);
  }
  
  console.log(`Updated ${updatedCount} adaptive quizzes`);
}

/**
 * Creates progress sub-documents for users based on their existing quiz history
 */
async function createUserProgressDocs() {
  console.log('Creating user progress sub-documents...');
  
  // Get all users
  const usersRef = db.collection('users');
  const usersSnapshot = await usersRef.get();
  
  if (usersSnapshot.empty) {
    console.log('No users found');
    return;
  }
  
  let totalProgressDocs = 0;
  
  for (const userDoc of usersSnapshot.docs) {
    const userId = userDoc.id;
    const userData = userDoc.data();
    
    console.log(`Processing user ${userId}...`);
    
    // Skip if user has no data
    if (!userData) {
      console.log(`No data for user ${userId}, skipping`);
      continue;
    }
    
    // Get user's adaptive quizzes
    const quizzesQuery = db.collection('adaptiveQuizzes')
      .where('userId', '==', userId)
      .where('completed', '==', true);
    
    const quizzesSnapshot = await quizzesQuery.get();
    
    if (quizzesSnapshot.empty) {
      console.log(`No completed adaptive quizzes for user ${userId}`);
      continue;
    }
    
    // Process quizzes to determine subcategory mastery
    const subcategoryProgress = {};
    
    for (const quizDoc of quizzesSnapshot.docs) {
      const quizData = quizDoc.data();
      const subcategory = normalizeSubcategoryName(quizData.subcategory || quizData.subcategoryDisplayName);
      
      if (!subcategory) continue;
      
      // Initialize subcategory progress if not exists
      if (!subcategoryProgress[subcategory]) {
        subcategoryProgress[subcategory] = {
          level: 1,
          mastered: false,
          conceptMastery: {},
          lastUpdated: admin.firestore.FieldValue.serverTimestamp()
        };
      }
      
      // Update level based on completed quizzes
      const quizLevel = quizData.level || quizData.targetLevel || 1;
      subcategoryProgress[subcategory].level = Math.max(
        subcategoryProgress[subcategory].level,
        quizLevel
      );
      
      // Consider mastered if completed a level 3 quiz
      if (quizLevel >= 3) {
        subcategoryProgress[subcategory].mastered = true;
      }
    }
    
    // Write progress documents
    let batch = db.batch();
    let batchCount = 0;
    const BATCH_LIMIT = 500;
    
    for (const [subcategoryId, progress] of Object.entries(subcategoryProgress)) {
      const progressRef = db.collection('users')
        .doc(userId)
        .collection('progress')
        .doc(subcategoryId);
      
      batch.set(progressRef, progress, { merge: true });
      totalProgressDocs++;
      batchCount++;
      
      // If batch limit reached, commit and start new batch
      if (batchCount >= BATCH_LIMIT) {
        await batch.commit();
        console.log(`Batch committed (${batchCount} documents)`);
        batch = db.batch();
        batchCount = 0;
      }
    }
    
    // Commit any remaining updates
    if (batchCount > 0) {
      await batch.commit();
      console.log(`Final batch committed for user ${userId} (${batchCount} documents)`);
    }
  }
  
  console.log(`Created ${totalProgressDocs} progress documents for ${usersSnapshot.size} users`);
}

/**
 * Main migration function
 */
async function runMigration() {
  try {
    console.log('Starting Firestore schema migration...');
    
    // Step 1: Ensure collections exist
    await ensureCollectionsExist();
    
    // Step 2: Update adaptive quizzes
    await updateAdaptiveQuizzes();
    
    // Step 3: Create user progress sub-documents
    await createUserProgressDocs();
    
    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
runMigration();
