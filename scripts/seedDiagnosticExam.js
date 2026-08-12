/**
 * Seed the 27-question SAT diagnostic exam (15 R&W + 12 Math) into Firestore.
 *
 * Creates: questions → examModules → practiceExam { isDiagnostic: true, isPublic: true }
 * The /predictive-exam page lists every public exam with isDiagnostic: true.
 *
 * Usage:
 *   node scripts/seedDiagnosticExam.js            # seed (skips if diagnostic-v1 already exists)
 *   node scripts/seedDiagnosticExam.js --dry-run  # print what would be created
 *   node scripts/seedDiagnosticExam.js --replace  # delete existing diagnostic-v1 docs, then reseed
 */

const path = require('path');
const { initFirebaseAdmin } = require('./lib/firestoreUploader');
const { buildQuestionDoc, buildModuleDoc, buildExamDoc } = require('./lib/diagnosticDocBuilder');

const data = require(path.resolve(__dirname, 'data/diagnosticExamV1.json'));

const DRY_RUN = process.argv.includes('--dry-run');
const REPLACE = process.argv.includes('--replace');

async function deleteExisting(db) {
  let deleted = 0;
  for (const coll of ['questions', 'examModules', 'practiceExams']) {
    const snap = await db.collection(coll).where('originalExam', '==', data.examSlug).get();
    for (const doc of snap.docs) {
      await doc.ref.delete();
      deleted++;
    }
  }
  console.log(`Deleted ${deleted} existing ${data.examSlug} documents`);
}

async function main() {
  const admin = initFirebaseAdmin();
  const db = admin.firestore();
  const ts = () => admin.firestore.FieldValue.serverTimestamp();

  // Existing-data guard
  const existing = await db
    .collection('practiceExams')
    .where('originalExam', '==', data.examSlug)
    .get();

  if (!existing.empty) {
    if (REPLACE && !DRY_RUN) {
      await deleteExisting(db);
    } else {
      console.log(`A ${data.examSlug} exam already exists (${existing.docs[0].id}). Use --replace to reseed.`);
      return;
    }
  }

  const moduleIds = [];
  let questionCount = 0;

  for (const mod of data.modules) {
    const questionIds = [];

    for (const q of mod.questions) {
      const doc = buildQuestionDoc(q, mod.moduleNumber, data.examSlug);
      if (DRY_RUN) {
        questionIds.push(`dry-run-q${mod.moduleNumber}-${q.originalQuestionNumber}`);
      } else {
        const ref = await db.collection('questions').add({ ...doc, createdAt: ts(), updatedAt: ts() });
        questionIds.push(ref.id);
      }
      questionCount++;
    }

    const moduleDoc = buildModuleDoc(mod, questionIds, data.examSlug);
    if (DRY_RUN) {
      moduleIds.push(`dry-run-module-${mod.moduleNumber}`);
    } else {
      const ref = await db.collection('examModules').add({ ...moduleDoc, createdAt: ts(), updatedAt: ts() });
      moduleIds.push(ref.id);
    }
    console.log(`Module ${mod.moduleNumber} (${mod.title}): ${questionIds.length} questions`);
  }

  const examDoc = buildExamDoc(data, moduleIds);
  let examId = 'dry-run-exam';
  if (!DRY_RUN) {
    const ref = await db.collection('practiceExams').add({ ...examDoc, createdAt: ts(), updatedAt: ts() });
    examId = ref.id;
  }

  console.log(`${DRY_RUN ? '[DRY RUN] Would create' : 'Created'} diagnostic exam ${examId}`);
  console.log(`  ${questionCount} questions, ${moduleIds.length} modules, isPublic: true, isDiagnostic: true`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seeding failed:', err);
    process.exit(1);
  });
