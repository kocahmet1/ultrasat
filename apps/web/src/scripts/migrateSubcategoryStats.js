/**
 * Migration script to convert numeric subcategory IDs to kebab-case in userSubcategoryStats
 * 
 * This script:
 * 1. Finds all documents in userSubcategoryStats with numeric IDs
 * 2. Creates new documents with kebab-case IDs
 * 3. Deletes the old numeric ID documents
 */

import { db } from '../firebase/config';
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc
} from 'firebase/firestore';
import { SUBCATEGORY_KEBAB_CASE } from '../utils/subcategoryConstants';

// Helper function to check if a string is numeric
function isNumeric(str) {
  if (typeof str !== 'string') return false;
  return !isNaN(str) && !isNaN(parseFloat(str));
}

// Function to extract the subcategory ID part from a document ID
function extractSubcategoryId(docId) {
  const parts = docId.split('_');
  if (parts.length < 2) return null;
  
  // The last part should be the subcategory ID
  return parts[parts.length - 1];
}

// Function to extract the user ID part from a document ID
function extractUserId(docId) {
  const parts = docId.split('_');
  if (parts.length < 2) return null;
  
  // The user ID is everything before the last underscore
  return parts.slice(0, parts.length - 1).join('_');
}

// Main migration function
export async function migrateNumericToKebabCase() {
  console.log('Starting migration of numeric subcategory IDs to kebab-case...');
  
  try {
    // Get all documents from the userSubcategoryStats collection
    const statsSnapshot = await getDocs(collection(db, 'userSubcategoryStats'));
    
    // Track stats for reporting
    let totalDocs = 0;
    let numericIdDocs = 0;
    let migratedDocs = 0;
    let errorDocs = 0;
    
    // Process each document
    const migrationPromises = [];
    
    statsSnapshot.forEach(docSnapshot => {
      totalDocs++;
      const docId = docSnapshot.id;
      const subcategoryId = extractSubcategoryId(docId);
      
      // Check if the subcategory part of the ID is numeric
      if (isNumeric(subcategoryId)) {
        numericIdDocs++;
        const numericId = parseInt(subcategoryId, 10);
        const kebabCase = SUBCATEGORY_KEBAB_CASE[numericId];
        
        if (kebabCase) {
          const userId = extractUserId(docId);
          const newDocId = `${userId}_${kebabCase}`;
          const data = docSnapshot.data();
          
          // Create a migration promise
          const migrationPromise = (async () => {
            try {
              // Check if a document with the kebab-case ID already exists
              const newDocRef = doc(db, 'userSubcategoryStats', newDocId);
              const newDocSnapshot = await getDoc(newDocRef);
              
              if (newDocSnapshot.exists()) {
                console.log(`Document already exists with kebab-case ID: ${newDocId}. Merging data...`);
                
                // Merge strategies could be implemented here if needed
                // For now, we'll keep the existing document and delete the numeric one
                console.log(`Deleting numeric ID document: ${docId}`);
                await deleteDoc(doc(db, 'userSubcategoryStats', docId));
              } else {
                // Create new document with kebab-case ID
                await setDoc(newDocRef, {
                  ...data,
                  subcategoryId: kebabCase, // Update the subcategoryId field to kebab-case if it exists
                  migratedAt: new Date(),
                  originalId: numericId // Keep reference to original ID for verification
                });
                
                console.log(`Created new document with kebab-case ID: ${newDocId}`);
                
                // Delete the old document with numeric ID
                await deleteDoc(doc(db, 'userSubcategoryStats', docId));
                console.log(`Deleted old document with numeric ID: ${docId}`);
                
                migratedDocs++;
              }
            } catch (error) {
              console.error(`Error migrating document ${docId}:`, error);
              errorDocs++;
            }
          })();
          
          migrationPromises.push(migrationPromise);
        } else {
          console.warn(`Could not find kebab-case for numeric ID: ${numericId} in document: ${docId}`);
          errorDocs++;
        }
      }
    });
    
    // Wait for all migrations to complete
    await Promise.all(migrationPromises);
    
    // Log results
    console.log(`
      Migration completed:
      - Total documents: ${totalDocs}
      - Documents with numeric IDs: ${numericIdDocs}
      - Successfully migrated: ${migratedDocs}
      - Errors: ${errorDocs}
    `);
    
    return {
      totalDocs,
      numericIdDocs,
      migratedDocs,
      errorDocs
    };
    
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

// For direct execution (e.g., via Node.js)
if (typeof window === 'undefined' && require.main === module) {
  migrateNumericToKebabCase()
    .then(results => {
      console.log('Migration script completed:', results);
      process.exit(0);
    })
    .catch(error => {
      console.error('Migration script failed:', error);
      process.exit(1);
    });
}
