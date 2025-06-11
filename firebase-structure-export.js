// firebase-structure-export.js
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Firebase project configuration
const firebaseConfig = {
  projectId: "ultrasat-5e4c4"
};

// Function to check if the service account file exists
function getServiceAccountPath() {
  // Check for the existing service account key file first
  const existingKeyPath = path.join(__dirname, 'ultrasat-5e4c4-369f564bdaef.json');
  if (fs.existsSync(existingKeyPath)) {
    return existingKeyPath;
  }
  
  // Fallback to the generic name if it exists
  const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
  if (fs.existsSync(serviceAccountPath)) {
    return serviceAccountPath;
  }
  
  return null;
}

// Initialize Firebase Admin SDK
const serviceAccountPath = getServiceAccountPath();

if (serviceAccountPath) {
  // Initialize with service account if available
  console.log(`Initializing Firebase Admin with service account from: ${serviceAccountPath}`);
  admin.initializeApp({
    credential: admin.credential.cert(require(serviceAccountPath))
  });
} else {
  console.log(`Service account file not found. Please download your service account key file.`);
  console.log(`Follow these steps to get a service account key file:`);
  console.log(`1. Go to: https://console.firebase.google.com/project/${firebaseConfig.projectId}/settings/serviceaccounts/adminsdk`);
  console.log(`2. Click "Generate new private key"`);
  console.log(`3. Save the file as "serviceAccountKey.json" in the same directory as this script`);
  console.log(`4. Run this script again`);
  process.exit(1);
}

const db = admin.firestore();

async function exportFirestoreStructure() {
  console.log('Starting Firestore structure export...');
  
  const base64Regex = /^data:[a-zA-Z0-9\/;,+=]+base64,/;

  function processDataRecursive(data) {
    if (typeof data !== 'object' || data === null) {
      return data; // Not an object or array, or is null
    }

    if (Array.isArray(data)) {
      return data.map(item => processDataRecursive(item));
    }

    const processedObject = {};
    for (const [key, value] of Object.entries(data)) {
      if (key === 'text' && typeof value === 'string') {
        processedObject[key] = '[TEXT_CONTENT]';
      } else if (key === 'explanation' && typeof value === 'string') {
        processedObject[key] = '[EXPLANATION_CONTENT]';
      } else if (typeof value === 'string' && base64Regex.test(value)) {
        processedObject[key] = '[BASE64_IMAGE_DATA]';
      } else if (typeof value === 'object' && value !== null) {
        processedObject[key] = processDataRecursive(value);
      } else {
        processedObject[key] = value;
      }
    }
    return processedObject;
  }

  const collections = await db.listCollections();
  const dbStructure = {};
  
  console.log(`Found ${collections.length} collections`);
  
  for (const collection of collections) {
    const collectionName = collection.id;
    console.log(`Processing collection: ${collectionName}`);
    
    dbStructure[collectionName] = { 
      sampleDocuments: [],
      fieldTypes: {},
      documentCount: 0
    };
    
    try {
      // Get total document count for the collection
      const countSnapshot = await db.collection(collectionName).count().get();
      dbStructure[collectionName].documentCount = countSnapshot.data().count;

      // Get sample documents (limited to 5)
      const sampleSnapshot = await db.collection(collectionName).limit(5).get();
      
      let processedDocsCount = 0;
      for (const doc of sampleSnapshot.docs) {
        const originalData = doc.data();
        const processedData = processDataRecursive(originalData);
        
        // Track field types from originalData
        for (const [k, v] of Object.entries(originalData)) {
          const valueType = Array.isArray(v) ? 'array' : (v === null ? 'null' : typeof v);
          if (!dbStructure[collectionName].fieldTypes[k]) {
            dbStructure[collectionName].fieldTypes[k] = new Set();
          }
          dbStructure[collectionName].fieldTypes[k].add(valueType);
        }
        
        dbStructure[collectionName].sampleDocuments.push({
          id: doc.id,
          data: processedData
        });
        processedDocsCount++;
      }
      console.log(`Processed ${processedDocsCount} sample documents from collection ${collectionName}`);

      // Convert Sets to arrays for JSON serialization for fieldTypes
      Object.keys(dbStructure[collectionName].fieldTypes).forEach(fieldTypeKey => {
        dbStructure[collectionName].fieldTypes[fieldTypeKey] = 
          Array.from(dbStructure[collectionName].fieldTypes[fieldTypeKey]);
      });

    } catch (error) {
      console.error(`Error processing collection ${collectionName}:`, error);
      dbStructure[collectionName].error = `Failed to process: ${error.message}`;
    }
  }
  
  dbStructure._schemaInfo = {
    generatedAt: new Date().toISOString(),
    appInfo: "BlueBook SAT Practice App",
    notes: [
      "This structure was auto-generated and shows sample documents (up to 5) from each collection.",
      "Base64 image data (e.g., 'graphUrl') has been replaced with '[BASE64_IMAGE_DATA]' placeholder.",
      "Long text fields (e.g., 'text', 'explanation') have been replaced with placeholders like '[TEXT_CONTENT]'.",
      "Field types reflect the types found in the sample documents.",
      "Note that subcategories may appear in both human-readable and kebab-case formats."
    ]
  };
  
  const outputFile = path.join(__dirname, 'firebase-structure.json');
  fs.writeFileSync(outputFile, JSON.stringify(dbStructure, null, 2));
  console.log(`Firestore structure exported to ${outputFile}`);
}

exportFirestoreStructure()
  .then(() => {
    console.log('Export completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error exporting Firestore structure:', error);
    process.exit(1);
  });
