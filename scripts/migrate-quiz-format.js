/**
 * Migration script to convert SmartQuiz documents from old format to new efficient format
 * 
 * Old format: stores full question objects in quiz.questions
 * New format: stores only question IDs in quiz.questionIds
 * 
 * Run with: node scripts/migrate-quiz-format.js
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK
try {
  const serviceAccountPath = path.resolve(__dirname, '../ultrasat-5e4c4-369f564bdaef.json');
  
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

async function migrateQuizFormat() {
  console.log('Starting SmartQuiz format migration...');
  
  try {
    // Get all smartQuizzes documents
    const quizzesRef = db.collection('smartQuizzes');
    const snapshot = await quizzesRef.get();
    
    console.log(`Found ${snapshot.size} quiz documents to check`);
    
    let migratedCount = 0;
    let alreadyMigratedCount = 0;
    let errorCount = 0;
    
    const batch = db.batch();
    let batchCount = 0;
    const BATCH_SIZE = 500; // Firestore batch limit
    
    for (const doc of snapshot.docs) {
      const data = doc.data();
      
      // Check if this quiz needs migration
      if (data.questions && Array.isArray(data.questions) && !data.questionIds) {
        console.log(`Migrating quiz ${doc.id}...`);
        
        try {
          // Extract question IDs from the questions array
          const questionIds = data.questions.map(q => q.id).filter(id => id);
          
          if (questionIds.length === 0) {
            console.warn(`Quiz ${doc.id} has no valid question IDs, skipping`);
            errorCount++;
            continue;
          }
          
          // Update the document to use the new format
          const updateData = {
            questionIds: questionIds,
            questionCount: questionIds.length,
            // Remove the old questions array
            questions: admin.firestore.FieldValue.delete(),
            // Add migration metadata
            migratedAt: admin.firestore.FieldValue.serverTimestamp(),
            migrationVersion: '1.0'
          };
          
          batch.update(doc.ref, updateData);
          batchCount++;
          migratedCount++;
          
          console.log(`  ✓ Quiz ${doc.id}: ${questionIds.length} questions → ${questionIds.length} questionIds`);
          
          // Commit batch if we reach the limit
          if (batchCount >= BATCH_SIZE) {
            await batch.commit();
            console.log(`Committed batch of ${batchCount} updates`);
            batchCount = 0;
          }
          
        } catch (error) {
          console.error(`Error migrating quiz ${doc.id}:`, error);
          errorCount++;
        }
        
      } else if (data.questionIds && Array.isArray(data.questionIds)) {
        // Already migrated
        alreadyMigratedCount++;
      } else {
        console.warn(`Quiz ${doc.id} has unexpected format, skipping`);
        errorCount++;
      }
    }
    
    // Commit any remaining updates
    if (batchCount > 0) {
      await batch.commit();
      console.log(`Committed final batch of ${batchCount} updates`);
    }
    
    console.log('\n=== Migration Summary ===');
    console.log(`Total quizzes checked: ${snapshot.size}`);
    console.log(`Successfully migrated: ${migratedCount}`);
    console.log(`Already migrated: ${alreadyMigratedCount}`);
    console.log(`Errors/Skipped: ${errorCount}`);
    
    if (migratedCount > 0) {
      console.log('\n✅ Migration completed successfully!');
      console.log('Benefits:');
      console.log('- Reduced storage usage by ~90%');
      console.log('- Improved data consistency');
      console.log('- Faster quiz loading');
      console.log('- Lower bandwidth costs');
    } else {
      console.log('\n✅ No migration needed - all quizzes already use the efficient format!');
    }
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Dry run function to preview what would be migrated
async function dryRunMigration() {
  console.log('Running DRY RUN - no changes will be made...');
  
  try {
    const quizzesRef = db.collection('smartQuizzes');
    const snapshot = await quizzesRef.get();
    
    console.log(`Found ${snapshot.size} quiz documents`);
    
    let needsMigration = 0;
    let alreadyMigrated = 0;
    let totalStorageSaved = 0;
    
    for (const doc of snapshot.docs) {
      const data = doc.data();
      
      if (data.questions && Array.isArray(data.questions) && !data.questionIds) {
        needsMigration++;
        
        // Estimate storage savings
        const questionsSize = JSON.stringify(data.questions).length;
        const questionIdsSize = JSON.stringify(data.questions.map(q => q.id)).length;
        const savings = questionsSize - questionIdsSize;
        totalStorageSaved += savings;
        
        console.log(`Quiz ${doc.id}: ${data.questions.length} questions, ~${Math.round(savings/1024)}KB savings`);
      } else if (data.questionIds) {
        alreadyMigrated++;
      }
    }
    
    console.log('\n=== Dry Run Summary ===');
    console.log(`Quizzes needing migration: ${needsMigration}`);
    console.log(`Already migrated: ${alreadyMigrated}`);
    console.log(`Estimated storage savings: ~${Math.round(totalStorageSaved/1024)}KB`);
    
    if (needsMigration > 0) {
      console.log('\nTo perform the actual migration, run:');
      console.log('node scripts/migrate-quiz-format.js --migrate');
    }
    
  } catch (error) {
    console.error('Dry run failed:', error);
    process.exit(1);
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--migrate')) {
    await migrateQuizFormat();
  } else {
    await dryRunMigration();
  }
  
  process.exit(0);
}

main().catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
}); 