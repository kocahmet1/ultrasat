/**
 * Stage 4: Upload normalized exam data to Firestore.
 *
 * Creates: questions → examModules → practiceExam
 * Supports --dry-run mode.
 */

const path = require('path');

/**
 * Initialize Firebase Admin SDK.
 * Uses the local service account key file.
 */
function initFirebaseAdmin() {
  const admin = require('firebase-admin');

  if (admin.apps.length > 0) return admin;

  // Look for the service account key in the project root
  const possiblePaths = [
    path.resolve(__dirname, '../../ultrasat-5e4c4-369f564bdaef.json'),
    path.resolve(__dirname, '../../apps/api/ultrasat-5e4c4-369f564bdaef.json'),
  ];

  let serviceAccountPath = null;
  const fs = require('fs');

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      serviceAccountPath = p;
      break;
    }
  }

  if (!serviceAccountPath) {
    throw new Error(
      'Firebase service account key not found. Expected at project root: ultrasat-5e4c4-369f564bdaef.json'
    );
  }

  const serviceAccount = require(serviceAccountPath);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  return admin;
}

/**
 * Check for duplicate questions in Firestore (by originalExam + originalQuestionNumber + originalModuleNumber).
 *
 * @param {object} db - Firestore instance.
 * @param {string} examSlug - The exam slug to check.
 * @returns {Promise<Set<string>>} Set of "moduleNumber-questionNumber" keys that already exist.
 */
async function checkDuplicates(db, examSlug) {
  const existingKeys = new Set();

  try {
    const snapshot = await db
      .collection('questions')
      .where('originalExam', '==', examSlug)
      .get();

    snapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.originalModuleNumber && data.originalQuestionNumber) {
        existingKeys.add(`${data.originalModuleNumber}-${data.originalQuestionNumber}`);
      }
    });
  } catch (err) {
    console.log(`      ⚠️  Duplicate check failed: ${err.message}`);
  }

  return existingKeys;
}

/**
 * Upload a complete exam to Firestore.
 *
 * @param {object} normalizedData - The normalized exam data from Stage 3.
 * @param {object} options
 * @param {boolean} [options.dryRun=false] - If true, don't write to Firestore.
 * @returns {Promise<object>} Upload result with created document IDs.
 */
async function uploadToFirestore(normalizedData, options = {}) {
  const { dryRun = false } = options;

  const admin = initFirebaseAdmin();
  const db = admin.firestore();

  const result = {
    dryRun,
    questionsCreated: 0,
    modulesCreated: 0,
    examCreated: false,
    questionIds: {},     // moduleNumber → [questionId, ...]
    moduleIds: [],       // [moduleDocId, ...]
    examId: null,
    errors: [],
  };

  // Check for existing questions from this exam
  const existingKeys = await checkDuplicates(db, normalizedData.examSlug);
  let duplicatesSkipped = 0;

  if (existingKeys.size > 0) {
    console.log(`      ⚠️  Found ${existingKeys.size} existing questions from this exam — will skip duplicates`);
  }

  // === Upload questions for each module ===
  for (const module of normalizedData.modules) {
    const moduleQuestionIds = [];
    const moduleNum = module.moduleNumber;

    for (const question of module.questions) {
      const key = `${question.originalModuleNumber}-${question.originalQuestionNumber}`;

      if (existingKeys.has(key)) {
        duplicatesSkipped++;
        continue;
      }

      if (dryRun) {
        moduleQuestionIds.push(`dry-run-q-${moduleNum}-${question.originalQuestionNumber}`);
        result.questionsCreated++;
        continue;
      }

      try {
        const docRef = await db.collection('questions').add({
          ...question,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        moduleQuestionIds.push(docRef.id);
        result.questionsCreated++;
      } catch (err) {
        result.errors.push(`Module ${moduleNum}, Q${question.originalQuestionNumber}: ${err.message}`);
      }
    }

    result.questionIds[moduleNum] = moduleQuestionIds;

    // === Create exam module ===
    const moduleData = {
      title: module.title,
      description: module.description,
      questionIds: moduleQuestionIds,
      moduleNumber: moduleNum,
      calculatorAllowed: module.calculatorAllowed,
      timeLimit: module.timeLimit,
      questionCount: moduleQuestionIds.length,
      isOfficial: true,
      originalExam: normalizedData.examSlug,
    };

    if (dryRun) {
      result.moduleIds.push(`dry-run-module-${moduleNum}`);
      result.modulesCreated++;
    } else {
      try {
        const moduleRef = await db.collection('examModules').add({
          ...moduleData,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        result.moduleIds.push(moduleRef.id);
        result.modulesCreated++;
      } catch (err) {
        result.errors.push(`Failed to create module ${moduleNum}: ${err.message}`);
      }
    }
  }

  // === Create practice exam ===
  const examData = {
    title: normalizedData.examName,
    description: `Official College Board SAT exam: ${normalizedData.examName}`,
    moduleIds: result.moduleIds,
    isPublic: true,
    isDiagnostic: false,
    isOfficial: true,
    originalExam: normalizedData.examSlug,
  };

  if (dryRun) {
    result.examId = 'dry-run-exam-id';
    result.examCreated = true;
  } else {
    try {
      const examRef = await db.collection('practiceExams').add({
        ...examData,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      result.examId = examRef.id;
      result.examCreated = true;
    } catch (err) {
      result.errors.push(`Failed to create practice exam: ${err.message}`);
    }
  }

  if (duplicatesSkipped > 0) {
    result.duplicatesSkipped = duplicatesSkipped;
  }

  return result;
}

module.exports = { uploadToFirestore, initFirebaseAdmin };
