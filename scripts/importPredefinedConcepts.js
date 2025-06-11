/**
 * Bulk Import Utility for Predefined Concepts
 * 
 * This script imports predefined concepts from JSON files into Firestore.
 * Each JSON file should contain concepts for a specific subcategory.
 * 
 * Usage:
 * node scripts/importPredefinedConcepts.js <subcategoryId> <jsonFilePath>
 * 
 * Example:
 * node scripts/importPredefinedConcepts.js linear-equations-one-variable ./concepts/linear-equations-concepts.json
 * 
 * JSON file format:
 * [
 *   {
 *     "conceptId": "solvingLinearEquations",
 *     "name": "Solving Linear Equations",
 *     "description": "Methods for isolating variables in linear equations using algebraic operations."
 *   },
 *   ...
 * ]
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin
const serviceAccount = require('../serviceAccountKey.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

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
    console.error(`Invalid concept ${concept.conceptId || 'unknown'}:`, errors);
    return null;
  }
  
  return {
    subcategoryId,
    conceptId: concept.conceptId.trim(),
    name: concept.name.trim(),
    description: concept.description.trim(),
    difficulty: difficulty,
    source: concept.source || CONCEPT_SOURCES.COLLEGEBOARD,
    active: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };
}

/**
 * Checks if a concept already exists in Firestore
 * @param {string} subcategoryId - The subcategory ID
 * @param {string} conceptId - The concept ID
 * @returns {Promise<boolean>} True if concept exists
 */
async function conceptExists(subcategoryId, conceptId) {
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
 * Imports concepts from a JSON file
 * @param {string} subcategoryId - Target subcategory ID
 * @param {string} jsonFilePath - Path to the JSON file
 * @param {Object} options - Import options
 */
async function importConcepts(subcategoryId, jsonFilePath, options = {}) {
  const { skipExisting = true, dryRun = false } = options;
  
  try {
    // Validate file path
    if (!fs.existsSync(jsonFilePath)) {
      throw new Error(`File not found: ${jsonFilePath}`);
    }
    
    // Read and parse JSON file
    const jsonContent = fs.readFileSync(jsonFilePath, 'utf8');
    let concepts;
    
    try {
      concepts = JSON.parse(jsonContent);
    } catch (parseError) {
      throw new Error(`Invalid JSON in file ${jsonFilePath}: ${parseError.message}`);
    }
    
    if (!Array.isArray(concepts)) {
      throw new Error('JSON file must contain an array of concepts');
    }
    
    console.log(`📁 Processing ${concepts.length} concepts from ${jsonFilePath}`);
    console.log(`🎯 Target subcategory: ${subcategoryId}`);
    
    if (dryRun) {
      console.log('🧪 DRY RUN MODE - No changes will be made to the database');
    }
    
    const results = {
      total: concepts.length,
      valid: 0,
      invalid: 0,
      skipped: 0,
      imported: 0,
      errors: []
    };
    
    // Process each concept
    for (let i = 0; i < concepts.length; i++) {
      const concept = concepts[i];
      console.log(`\n📝 Processing concept ${i + 1}/${concepts.length}: ${concept.name || concept.conceptId || 'unnamed'}`);
      
      // Validate concept
      const validatedConcept = validateConcept(concept, subcategoryId);
      if (!validatedConcept) {
        results.invalid++;
        results.errors.push(`Concept ${i + 1}: Validation failed`);
        continue;
      }
      
      results.valid++;
      
      // Check if concept already exists
      if (skipExisting) {
        const exists = await conceptExists(subcategoryId, validatedConcept.conceptId);
        if (exists) {
          console.log(`  ⏭️  Skipping existing concept: ${validatedConcept.conceptId}`);
          results.skipped++;
          continue;
        }
      }
      
      // Import concept (unless dry run)
      if (!dryRun) {
        try {
          const docRef = await db.collection('predefinedConcepts').add(validatedConcept);
          console.log(`  ✅ Imported concept: ${validatedConcept.conceptId} (${docRef.id})`);
          results.imported++;
        } catch (importError) {
          console.error(`  ❌ Failed to import concept: ${validatedConcept.conceptId}`, importError);
          results.errors.push(`Concept ${validatedConcept.conceptId}: ${importError.message}`);
        }
      } else {
        console.log(`  🧪 Would import: ${validatedConcept.conceptId}`);
        results.imported++;
      }
    }
    
    // Print summary
    console.log(`\n📊 Import Summary:`);
    console.log(`   Total concepts: ${results.total}`);
    console.log(`   Valid concepts: ${results.valid}`);
    console.log(`   Invalid concepts: ${results.invalid}`);
    console.log(`   Skipped (existing): ${results.skipped}`);
    console.log(`   Successfully imported: ${results.imported}`);
    
    if (results.errors.length > 0) {
      console.log(`\n❌ Errors encountered:`);
      results.errors.forEach(error => console.log(`   - ${error}`));
    }
    
    if (dryRun) {
      console.log(`\n🧪 This was a dry run - no changes were made to the database`);
    } else if (results.imported > 0) {
      console.log(`\n🎉 Import completed successfully!`);
    }
    
    return results;
    
  } catch (error) {
    console.error('❌ Import failed:', error.message);
    throw error;
  }
}

/**
 * Lists all predefined concepts for a subcategory
 * @param {string} subcategoryId - The subcategory ID
 */
async function listConcepts(subcategoryId) {
  try {
    const query = db.collection('predefinedConcepts')
      .where('subcategoryId', '==', subcategoryId)
      .orderBy('name');
    
    const snapshot = await query.get();
    
    if (snapshot.empty) {
      console.log(`No concepts found for subcategory: ${subcategoryId}`);
      return;
    }
    
    console.log(`\n📋 Concepts for ${subcategoryId} (${snapshot.size} total):`);
    snapshot.forEach((doc, index) => {
      const data = doc.data();
      console.log(`${index + 1}. ${data.name} (${data.conceptId})`);
      console.log(`   Description: ${data.description}`);
      console.log(`   Difficulty: ${data.difficulty}, Keywords: [${data.keywords.join(', ')}]`);
    });
    
  } catch (error) {
    console.error('Error listing concepts:', error);
  }
}

/**
 * Deletes all concepts for a subcategory (use with caution!)
 * @param {string} subcategoryId - The subcategory ID
 * @param {boolean} confirm - Confirmation flag
 */
async function deleteAllConcepts(subcategoryId, confirm = false) {
  if (!confirm) {
    console.log('⚠️  To delete all concepts, run with --confirm flag');
    return;
  }
  
  try {
    console.log(`🗑️  Deleting all concepts for subcategory: ${subcategoryId}`);
    
    const query = db.collection('predefinedConcepts')
      .where('subcategoryId', '==', subcategoryId);
    
    const snapshot = await query.get();
    
    if (snapshot.empty) {
      console.log('No concepts found to delete');
      return;
    }
    
    console.log(`Found ${snapshot.size} concepts to delete`);
    
    const batch = db.batch();
    snapshot.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    console.log(`✅ Deleted ${snapshot.size} concepts`);
    
  } catch (error) {
    console.error('Error deleting concepts:', error);
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (!command) {
    console.log('Predefined Concepts Import Utility');
    console.log('');
    console.log('Usage:');
    console.log('  Import concepts: node importPredefinedConcepts.js import <subcategoryId> <jsonFile> [--dry-run] [--force]');
    console.log('  List concepts:   node importPredefinedConcepts.js list <subcategoryId>');
    console.log('  Delete concepts: node importPredefinedConcepts.js delete <subcategoryId> [--confirm]');
    console.log('');
    console.log('Examples:');
    console.log('  node importPredefinedConcepts.js import linear-equations-one-variable ./concepts/algebra.json');
    console.log('  node importPredefinedConcepts.js list linear-equations-one-variable');
    console.log('  node importPredefinedConcepts.js delete linear-equations-one-variable --confirm');
    process.exit(0);
  }
  
  try {
    switch (command) {
      case 'import': {
        const subcategoryId = args[1];
        const jsonFilePath = args[2];
        const dryRun = args.includes('--dry-run');
        const force = args.includes('--force');
        
        if (!subcategoryId || !jsonFilePath) {
          throw new Error('Missing required arguments: subcategoryId and jsonFilePath');
        }
        
        await importConcepts(subcategoryId, jsonFilePath, {
          dryRun,
          skipExisting: !force
        });
        break;
      }
      
      case 'list': {
        const subcategoryId = args[1];
        if (!subcategoryId) {
          throw new Error('Missing required argument: subcategoryId');
        }
        await listConcepts(subcategoryId);
        break;
      }
      
      case 'delete': {
        const subcategoryId = args[1];
        const confirm = args.includes('--confirm');
        if (!subcategoryId) {
          throw new Error('Missing required argument: subcategoryId');
        }
        await deleteAllConcepts(subcategoryId, confirm);
        break;
      }
      
      default:
        throw new Error(`Unknown command: ${command}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    // Close Firebase connection
    process.exit(0);
  }
}

// Run the CLI
if (require.main === module) {
  main();
}

module.exports = {
  importConcepts,
  listConcepts,
  deleteAllConcepts
}; 