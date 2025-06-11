const admin = require('firebase-admin');

// Initialize Firebase Admin (make sure to set your service account key)
const serviceAccount = require('../ultrasat-5e4c4-369f564bdaef.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

/**
 * Initialize stats cache for a single user
 * @param {string} userId - The user ID
 * @returns {Promise<Object>} - The computed stats
 */
async function initializeUserStatsCache(userId) {
  try {
    console.log(`Processing user: ${userId}`);
    
    // Get user's quiz questions from progress subcollection
    const progressRef = db.collection(`users/${userId}/progress`);
    const progressSnapshot = await progressRef.get();
    
    // Count questions from practice exams in userProgress collection
    const userProgressRef = db.collection('userProgress');
    const progressQuery = userProgressRef.where('userId', '==', userId);
    const examProgressSnapshot = await progressQuery.get();
    const examQuestionsCount = examProgressSnapshot.size;
    
    // Calculate total questions and correct answers from quizzes
    let quizQuestionsCount = 0;
    let correctTotal = 0;
    
    progressSnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.totalQuestions) {
        quizQuestionsCount += data.totalQuestions;
      }
      if (data.correctTotal) {
        correctTotal += data.correctTotal;
      }
    });
    
    // Total questions is the sum of quiz questions and exam questions
    const totalQuestions = quizQuestionsCount + examQuestionsCount;
    
    // Accuracy is based primarily on quiz questions since we track that more precisely
    const accuracy = quizQuestionsCount > 0 ? (correctTotal / quizQuestionsCount) * 100 : 0;
    
    // Only create cache entry if user has any progress
    if (totalQuestions > 0) {
      // Cache the computed stats
      const userStatsRef = db.collection('userStatsCache').doc(userId);
      await userStatsRef.set({
        userId,
        totalQuestions,
        accuracy: Math.round(accuracy),
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      
      console.log(`✓ User ${userId}: ${totalQuestions} questions, ${accuracy.toFixed(1)}% accuracy`);
      return { totalQuestions, accuracy: Math.round(accuracy) };
    } else {
      console.log(`⚠ User ${userId}: No progress data found, skipping cache creation`);
      return null;
    }
  } catch (error) {
    console.error(`❌ Error processing user ${userId}:`, error);
    return null;
  }
}

/**
 * Initialize stats cache for all users
 */
async function initializeAllUsersStatsCache() {
  try {
    console.log('🚀 Starting stats cache initialization for all users...');
    
    // Get all users
    const usersSnapshot = await db.collection('users').get();
    console.log(`📊 Found ${usersSnapshot.size} total users`);
    
    let processedCount = 0;
    let cacheCreatedCount = 0;
    let errorCount = 0;
    
    // Process users in batches to avoid overwhelming the database
    const BATCH_SIZE = 10;
    const userDocs = usersSnapshot.docs;
    
    for (let i = 0; i < userDocs.length; i += BATCH_SIZE) {
      const batch = userDocs.slice(i, i + BATCH_SIZE);
      console.log(`\n📦 Processing batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(userDocs.length/BATCH_SIZE)} (${batch.length} users)`);
      
      // Process batch concurrently
      const promises = batch.map(async (userDoc) => {
        const userId = userDoc.id;
        const result = await initializeUserStatsCache(userId);
        processedCount++;
        
        if (result) {
          cacheCreatedCount++;
        }
        
        return result;
      });
      
      try {
        await Promise.all(promises);
      } catch (batchError) {
        console.error(`❌ Error in batch processing:`, batchError);
        errorCount++;
      }
      
      // Add small delay between batches to be gentle on the database
      if (i + BATCH_SIZE < userDocs.length) {
        console.log('⏳ Waiting 2 seconds before next batch...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    console.log('\n🎉 Stats cache initialization completed!');
    console.log(`📈 Summary:`);
    console.log(`   - Total users processed: ${processedCount}`);
    console.log(`   - Cache entries created: ${cacheCreatedCount}`);
    console.log(`   - Users skipped (no progress): ${processedCount - cacheCreatedCount}`);
    console.log(`   - Errors encountered: ${errorCount}`);
    
  } catch (error) {
    console.error('💥 Fatal error during stats cache initialization:', error);
    process.exit(1);
  }
}

/**
 * Clean up and recreate stats cache (useful for debugging or data migration)
 */
async function recreateStatsCache() {
  try {
    console.log('🧹 Cleaning up existing stats cache...');
    
    // Delete all existing cache documents
    const existingCacheSnapshot = await db.collection('userStatsCache').get();
    console.log(`Found ${existingCacheSnapshot.size} existing cache documents`);
    
    if (existingCacheSnapshot.size > 0) {
      const batch = db.batch();
      existingCacheSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      console.log('✓ Cleaned up existing cache documents');
    }
    
    // Now initialize fresh cache
    await initializeAllUsersStatsCache();
    
  } catch (error) {
    console.error('💥 Error during stats cache recreation:', error);
    process.exit(1);
  }
}

// Command line interface
const command = process.argv[2];

if (command === 'recreate') {
  console.log('🔄 Recreating stats cache...');
  recreateStatsCache();
} else if (command === 'init') {
  console.log('🆕 Initializing stats cache...');
  initializeAllUsersStatsCache();
} else {
  console.log('📖 Usage:');
  console.log('  node scripts/initializeStatsCache.js init     - Initialize cache for all users');
  console.log('  node scripts/initializeStatsCache.js recreate - Clean and recreate cache');
  process.exit(1);
} 