/**
 * Publish Exam 10 after the independently reviewed Math-module replacement.
 *
 * This is an explicit, auditable publication override. It intentionally leaves
 * qualityControl.status="stale" and the replacement invalidation fields intact;
 * it does not claim that the unavailable formal reference-library QC passed.
 *
 * Usage:
 *   node scripts/publishExam10ManualOverride.js --dry-run
 *   node scripts/publishExam10ManualOverride.js
 */

'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { initFirebaseAdmin } = require('./lib/firestoreUploader');
const { resolveSubcategory } = require('./lib/subcategoryMap');

const EXAM_ID = 'tV8bmOPkWywuHnSeECmE';
const EXAM_TITLE = 'Exam 10';
const EXAM_SLUG = 'exam10-math-v1';
const EXPECTED_JSON_SHA256 = '7826ba491bcad54eb5b855d17272b705e323421b9f947b69db32840b678f52a7';
const EXPECTED_PACKAGE_SHA256 = '4f7547deb203521d33f42bcf3a87713b93b6fc45b055bb82ae1a2833c4ba5186';
const INVALIDATION_REASON = 'Math modules 3 and 4 were replaced after quality control.';
const OVERRIDE_REASON =
  'Explicit user-authorized publication after independent Practice Test 10 QA; formal reference library unavailable.';
const DEPLOYMENT_BACKUP_FILE = path.resolve(
  __dirname,
  'backups/exam10_math_backup_1786919652356.json',
);
const DATA_FILE = path.resolve(__dirname, 'data/practiceTest10Math.json');
const ASSETS_DIR = path.resolve(__dirname, 'data/practiceTest10Math-assets');
const DRY_RUN = process.argv.includes('--dry-run');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function arraysEqual(a, b) {
  return Array.isArray(a) && Array.isArray(b) &&
    a.length === b.length && a.every((value, index) => value === b[index]);
}

function stableObject(value) {
  if (Array.isArray(value)) return value.map(stableObject);
  if (!value || typeof value !== 'object') return value;
  return Object.keys(value).sort().reduce((output, key) => {
    output[key] = stableObject(value[key]);
    return output;
  }, {});
}

function serializeValue(value) {
  if (value === undefined) return { __type: 'undefined' };
  if (value === null || typeof value !== 'object') return value;
  if (typeof value.toMillis === 'function') {
    return { __type: 'timestamp', millis: value.toMillis() };
  }
  if (typeof value.latitude === 'number' && typeof value.longitude === 'number') {
    return { __type: 'geopoint', latitude: value.latitude, longitude: value.longitude };
  }
  if (Array.isArray(value)) return value.map(serializeValue);
  const output = {};
  for (const [key, nested] of Object.entries(value)) output[key] = serializeValue(nested);
  return output;
}

function stableSerialized(value) {
  return JSON.stringify(stableObject(serializeValue(value)));
}

function stableSerializedBackupValue(value) {
  return JSON.stringify(stableObject(value));
}

function withoutFields(value, fieldNames) {
  const output = { ...value };
  for (const field of fieldNames) delete output[field];
  return output;
}

function runLocalValidator() {
  const validator = path.resolve(__dirname, 'validatePracticeTest10Math.js');
  const result = spawnSync(process.execPath, [validator], {
    cwd: path.resolve(__dirname, '..'),
    encoding: 'utf8',
  });
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  assert(result.status === 0, 'Local PT10 Math publication validator failed.');
}

function computePackageHashes() {
  const jsonBytes = fs.readFileSync(DATA_FILE);
  const jsonSha256 = crypto.createHash('sha256').update(jsonBytes).digest('hex');
  const packageHasher = crypto.createHash('sha256');
  packageHasher.update('practiceTest10Math.json\0');
  packageHasher.update(jsonBytes);
  const assetNames = fs.readdirSync(ASSETS_DIR)
    .filter((name) => name.endsWith('.svg'))
    .sort();
  for (const assetName of assetNames) {
    packageHasher.update(`\0${assetName}\0`);
    packageHasher.update(fs.readFileSync(path.join(ASSETS_DIR, assetName)));
  }
  return { jsonSha256, packageSha256: packageHasher.digest('hex'), assetNames };
}

function svgToDataUri(assetName) {
  const svg = fs.readFileSync(path.join(ASSETS_DIR, assetName), 'utf8');
  return `data:image/svg+xml;base64,${Buffer.from(svg, 'utf8').toString('base64')}`;
}

function buildExpectedQuestionDoc(question, moduleNumber, data) {
  const subcategory = resolveSubcategory(question.subcategory);
  assert(subcategory, `M${moduleNumber}Q${question.originalQuestionNumber}: unknown subcategory`);
  assert(
    subcategory.id === question.subcategoryId,
    `M${moduleNumber}Q${question.originalQuestionNumber}: subcategory ID changed`,
  );
  const isUserInput = question.questionType === 'user-input';
  const hasImage = Boolean(question.graphAsset);
  const canonicalAnswer = String(question.correctAnswer);
  return {
    text: question.text.trim(),
    questionType: question.questionType,
    options: question.options || [],
    correctAnswer: question.correctAnswer,
    acceptedAnswers: isUserInput ? question.acceptedAnswers : null,
    inputType: isUserInput && canonicalAnswer.includes('/') ? 'fraction' : 'number',
    answerFormat: null,
    explanation: question.explanation || '',
    difficulty: question.difficulty,
    subcategory: subcategory.kebab,
    subCategory: subcategory.kebab,
    subcategoryId: subcategory.id,
    categoryPath: `${subcategory.section}/${subcategory.mainCategory}/${subcategory.name}`,
    mainCategory: subcategory.mainCategory,
    subjectArea: subcategory.section,
    source: 'ultrasat-original',
    usageContext: 'exam',
    originalExam: data.examSlug,
    contentVersion: data.examSlug,
    payloadHash: EXPECTED_PACKAGE_SHA256,
    originalQuestionNumber: question.originalQuestionNumber,
    originalModuleNumber: moduleNumber,
    hasImage,
    graphUrl: hasImage ? svgToDataUri(question.graphAsset) : null,
    graphDescription: hasImage ? question.graphDescription : null,
    passage: question.passage || null,
    skillTags: [],
  };
}

function loadAndValidateLocalRelease() {
  const unknown = process.argv.slice(2).filter((arg) => arg !== '--dry-run');
  assert(unknown.length === 0, `Unknown argument(s): ${unknown.join(', ')}`);
  assert(fs.existsSync(DEPLOYMENT_BACKUP_FILE), `Deployment backup is missing: ${DEPLOYMENT_BACKUP_FILE}`);
  runLocalValidator();
  const hashes = computePackageHashes();
  assert(hashes.jsonSha256 === EXPECTED_JSON_SHA256, `JSON hash drift: ${hashes.jsonSha256}`);
  assert(hashes.packageSha256 === EXPECTED_PACKAGE_SHA256, `Package hash drift: ${hashes.packageSha256}`);
  assert(hashes.assetNames.length === 8, `Expected 8 SVG assets, found ${hashes.assetNames.length}`);

  const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  const backup = JSON.parse(fs.readFileSync(DEPLOYMENT_BACKUP_FILE, 'utf8'));
  assert(data.examSlug === EXAM_SLUG && data.targetExamTitle === EXAM_TITLE, 'PT10 payload identity changed');
  assert(backup.version === 2 && backup.kind === 'exam10-math-replacement', 'Unexpected deployment backup schema');
  assert(backup.exam?.id === EXAM_ID && backup.exam?.title === EXAM_TITLE, 'Deployment backup targets another exam');
  assert(backup.replacement?.examSlug === EXAM_SLUG, 'Deployment backup provenance mismatch');
  assert(backup.replacement?.payloadSha256 === EXPECTED_PACKAGE_SHA256, 'Deployment backup package hash mismatch');
  assert(Array.isArray(backup.sharedQuestionIds) && backup.sharedQuestionIds.length === 0, 'Outgoing questions were shared at deployment');
  assert(Array.isArray(backup.exam.moduleIds) && backup.exam.moduleIds.length === 4, 'Deployment backup topology is incomplete');

  const expectedDocs = {};
  for (const module of data.modules) {
    assert([3, 4].includes(module.moduleNumber), `Unexpected payload module ${module.moduleNumber}`);
    assert(module.questions.length === 22, `M${module.moduleNumber} does not contain 22 questions`);
    expectedDocs[module.moduleNumber] = module.questions.map((question) =>
      buildExpectedQuestionDoc(question, module.moduleNumber, data));
  }
  assert(Object.keys(expectedDocs).sort().join(',') === '3,4', 'Payload must contain exactly M3 and M4');

  for (const moduleNumber of [3, 4]) {
    const ids = backup.replacement.questionIds?.[moduleNumber];
    const outgoing = backup.modules?.[moduleNumber]?.previousQuestions;
    assert(Array.isArray(ids) && ids.length === 22 && new Set(ids).size === 22, `Backup M${moduleNumber} replacement IDs are invalid`);
    assert(Array.isArray(outgoing) && outgoing.length === 22, `Backup M${moduleNumber} outgoing snapshot is invalid`);
  }
  const allReplacementIds = [3, 4].flatMap((number) => backup.replacement.questionIds[number]);
  const allOutgoingIds = [3, 4].flatMap((number) => backup.modules[number].previousQuestions.map((entry) => entry.id));
  assert(new Set(allReplacementIds).size === 44, 'Replacement IDs are not 44 distinct documents');
  assert(new Set(allOutgoingIds).size === 44, 'Outgoing IDs are not 44 distinct documents');
  return { backup, data, expectedDocs, hashes, allReplacementIds, allOutgoingIds };
}

function validateModule(moduleData, moduleNumber, payloadModule, expectedQuestionIds) {
  assert(moduleData.moduleNumber === moduleNumber, `M${moduleNumber} moduleNumber drifted`);
  assert(arraysEqual(moduleData.questionIds, expectedQuestionIds), `M${moduleNumber} question pointers drifted`);
  assert(moduleData.questionCount === 22, `M${moduleNumber} questionCount is not 22`);
  assert(moduleData.section === 'Math', `M${moduleNumber} section is not Math`);
  assert(moduleData.calculatorAllowed === true, `M${moduleNumber} calculator setting drifted`);
  assert(moduleData.timeLimit === 2100, `M${moduleNumber} time limit drifted`);
  assert(moduleData.title === payloadModule.title, `M${moduleNumber} title drifted`);
  assert(moduleData.description === payloadModule.description, `M${moduleNumber} description drifted`);
}

async function inspectAndOptionallyPublish({ admin, db, release, write, expectedExamSnapshot }) {
  let result;
  await db.runTransaction(async (transaction) => {
    const examRef = db.collection('practiceExams').doc(EXAM_ID);
    const replacementRefs = release.allReplacementIds.map((id) => db.collection('questions').doc(id));
    const outgoingRefs = release.allOutgoingIds.map((id) => db.collection('questions').doc(id));
    const snapshots = await transaction.getAll(examRef, ...replacementRefs, ...outgoingRefs);
    const allModulesSnapshot = await transaction.get(db.collection('examModules'));
    const readyReferencesSnapshot = await transaction.get(
      db.collection('examQualityReferences').where('status', '==', 'ready'),
    );

    const examSnapshot = snapshots[0];
    assert(examSnapshot.exists, `Exam ${EXAM_ID} no longer exists`);
    const exam = examSnapshot.data();
    if (expectedExamSnapshot) {
      assert(
        stableSerialized(exam) === stableSerializedBackupValue(expectedExamSnapshot),
        'Exam document changed after publication backup; no write was made',
      );
    }
    assert(exam.title === EXAM_TITLE, `Exam title drifted to ${exam.title}`);
    assert(arraysEqual(exam.moduleIds, release.backup.exam.moduleIds), 'Exam 10 module topology drifted');
    assert(readyReferencesSnapshot.empty, 'A ready formal QC reference now exists; use the official QC publish route');

    const qualityControl = exam.qualityControl || {};
    const alreadyPublished = exam.isPublic === true &&
      qualityControl.publicationOverride === true &&
      qualityControl.publicationOverrideReason === OVERRIDE_REASON &&
      qualityControl.publicationOverridePackageHash === EXPECTED_PACKAGE_SHA256;
    if (!alreadyPublished) {
      assert(exam.isPublic === false, 'Exam 10 publication state changed unexpectedly');
      assert(qualityControl.status === 'stale', 'Exam 10 QC status is no longer stale');
      assert(qualityControl.invalidationReason === INVALIDATION_REASON, 'Exam 10 QC invalidation reason drifted');
      assert(qualityControl.invalidatedAt, 'Exam 10 QC invalidation timestamp is missing');
      assert(qualityControl.publicationOverride !== true, 'A previous publication override exists in an unexpected state');
    }

    const moduleSnapshotsById = new Map(allModulesSnapshot.docs.map((snapshot) => [snapshot.id, snapshot]));
    for (const moduleId of release.backup.exam.moduleIds) {
      assert(moduleSnapshotsById.get(moduleId)?.exists, `Referenced module ${moduleId} is missing`);
    }
    for (const untouched of release.backup.untouchedModules) {
      const current = moduleSnapshotsById.get(untouched.id).data();
      assert(
        stableSerialized(current) === stableSerializedBackupValue(untouched.fullDocument),
        `Reading and Writing M${untouched.moduleNumber} changed after the Math deployment`,
      );
    }
    for (const moduleNumber of [3, 4]) {
      const moduleId = release.backup.modules[moduleNumber].moduleDocId;
      const current = moduleSnapshotsById.get(moduleId).data();
      const payloadModule = release.data.modules.find((module) => module.moduleNumber === moduleNumber);
      validateModule(current, moduleNumber, payloadModule, release.backup.replacement.questionIds[moduleNumber]);
    }

    const replacementSnapshots = snapshots.slice(1, 45);
    replacementSnapshots.forEach((snapshot, index) => {
      const moduleNumber = index < 22 ? 3 : 4;
      const questionIndex = index % 22;
      assert(snapshot.exists, `Replacement M${moduleNumber}Q${questionIndex + 1} is missing`);
      const actual = snapshot.data();
      assert(actual.createdAt && actual.updatedAt, `Replacement M${moduleNumber}Q${questionIndex + 1} lacks timestamps`);
      assert(actual.retired !== true && actual.usageContext === 'exam', `Replacement M${moduleNumber}Q${questionIndex + 1} is not active`);
      const comparable = withoutFields(actual, ['createdAt', 'updatedAt']);
      assert(
        stableSerialized(comparable) === stableSerialized(release.expectedDocs[moduleNumber][questionIndex]),
        `Replacement M${moduleNumber}Q${questionIndex + 1} differs from the approved payload`,
      );
    });

    const outgoingSnapshots = snapshots.slice(45);
    const outgoingEntryById = new Map(
      [3, 4].flatMap((number) => release.backup.modules[number].previousQuestions)
        .map((entry) => [entry.id, entry]),
    );
    outgoingSnapshots.forEach((snapshot) => {
      assert(snapshot.exists, `Outgoing question ${snapshot.id} was deleted`);
      const actual = snapshot.data();
      const before = outgoingEntryById.get(snapshot.id).fullDocument;
      assert(actual.retired === true, `Outgoing question ${snapshot.id} is not retired`);
      assert(actual.retiredAt && actual.updatedAt, `Outgoing question ${snapshot.id} lacks retirement timestamps`);
      assert(actual.retiredReason === release.backup.replacement.retireReason, `Outgoing question ${snapshot.id} has the wrong retirement reason`);
      assert(actual.usageContext === 'retired', `Outgoing question ${snapshot.id} is not in retired usage context`);
      assert(
        actual.originalUsageContext === (before.usageContext ?? 'exam'),
        `Outgoing question ${snapshot.id} did not preserve its original usage context`,
      );
      assert(
        actual.retiredAt.toMillis() === actual.updatedAt.toMillis(),
        `Outgoing question ${snapshot.id} changed after retirement`,
      );
      const actualNonRetirement = withoutFields(actual, [
        'retired', 'retiredAt', 'retiredReason', 'originalUsageContext', 'usageContext', 'updatedAt',
      ]);
      const beforeNonRetirement = withoutFields(before, [
        'retired', 'retiredAt', 'retiredReason', 'originalUsageContext', 'usageContext', 'updatedAt',
      ]);
      assert(
        stableSerialized(actualNonRetirement) === stableSerializedBackupValue(beforeNonRetirement),
        `Outgoing question ${snapshot.id} content changed during or after retirement`,
      );
    });

    const outgoingSet = new Set(release.allOutgoingIds);
    const replacementModuleById = new Map();
    for (const moduleNumber of [3, 4]) {
      for (const id of release.backup.replacement.questionIds[moduleNumber]) {
        replacementModuleById.set(id, release.backup.modules[moduleNumber].moduleDocId);
      }
    }
    const replacementReferences = new Map(release.allReplacementIds.map((id) => [id, []]));
    for (const moduleSnapshot of allModulesSnapshot.docs) {
      for (const questionId of moduleSnapshot.data().questionIds || []) {
        assert(!outgoingSet.has(questionId), `Retired outgoing question ${questionId} is still referenced by ${moduleSnapshot.id}`);
        if (replacementReferences.has(questionId)) replacementReferences.get(questionId).push(moduleSnapshot.id);
      }
    }
    for (const [questionId, moduleIds] of replacementReferences) {
      assert(
        moduleIds.length === 1 && moduleIds[0] === replacementModuleById.get(questionId),
        `Replacement question ${questionId} has an unexpected module-reference set`,
      );
    }

    if (write && !alreadyPublished) {
      const timestamp = admin.firestore.FieldValue.serverTimestamp();
      transaction.update(examRef, {
        isPublic: true,
        publishedAt: timestamp,
        'qualityControl.publicationOverride': true,
        'qualityControl.publicationOverrideReason': OVERRIDE_REASON,
        'qualityControl.publicationOverridePackageHash': EXPECTED_PACKAGE_SHA256,
        'qualityControl.publicationOverrideAt': timestamp,
        updatedAt: timestamp,
      });
    }

    result = {
      alreadyPublished,
      examSnapshot: serializeValue(exam),
      replacementCount: replacementSnapshots.length,
      outgoingRetiredCount: outgoingSnapshots.length,
      readyReferenceCount: readyReferencesSnapshot.size,
    };
  });
  return result;
}

async function verifyPublishedState(db, release) {
  const examSnapshot = await db.collection('practiceExams').doc(EXAM_ID).get();
  assert(examSnapshot.exists, 'Post-publication exam read failed');
  const exam = examSnapshot.data();
  const qualityControl = exam.qualityControl || {};
  assert(exam.isPublic === true, 'Post-publication verification: Exam 10 is not public');
  assert(arraysEqual(exam.moduleIds, release.backup.exam.moduleIds), 'Post-publication verification: module topology changed');
  assert(qualityControl.status === 'stale', 'Post-publication verification: QC status was falsely changed');
  assert(qualityControl.invalidationReason === INVALIDATION_REASON, 'Post-publication verification: invalidation reason was lost');
  assert(qualityControl.publicationOverride === true, 'Post-publication verification: override marker is missing');
  assert(qualityControl.publicationOverrideReason === OVERRIDE_REASON, 'Post-publication verification: override reason is wrong');
  assert(qualityControl.publicationOverridePackageHash === EXPECTED_PACKAGE_SHA256, 'Post-publication verification: package hash is wrong');
  assert(qualityControl.publicationOverrideAt && exam.publishedAt && exam.updatedAt, 'Post-publication verification: publication timestamps are missing');

  const publicCatalog = await db.collection('practiceExams').where('isPublic', '==', true).get();
  assert(publicCatalog.docs.some((snapshot) => snapshot.id === EXAM_ID), 'Exam 10 is absent from the public catalog query');
  return exam;
}

async function main() {
  const release = loadAndValidateLocalRelease();
  console.log(`Approved PT10 JSON SHA-256: ${release.hashes.jsonSha256}`);
  console.log(`Approved PT10 package SHA-256: ${release.hashes.packageSha256}`);

  const admin = initFirebaseAdmin();
  const db = admin.firestore();
  const preflight = await inspectAndOptionallyPublish({ admin, db, release, write: false });
  console.log(`Live preflight: ${preflight.replacementCount} replacement questions active; ${preflight.outgoingRetiredCount} outgoing questions retired.`);
  console.log(`Live preflight: R&W M1/M2 unchanged; formal ready-reference count ${preflight.readyReferenceCount}.`);
  if (preflight.alreadyPublished) {
    const exam = await verifyPublishedState(db, release);
    console.log(`Exam 10 was already published with this exact override at ${exam.publishedAt.toDate().toISOString()}.`);
    return;
  }
  if (DRY_RUN) {
    console.log('[dry-run] Publication guards passed. No local backup or Firestore write was made.');
    return;
  }

  const publicationBackup = {
    version: 1,
    kind: 'exam10-manual-publication-override',
    createdAt: new Date().toISOString(),
    examId: EXAM_ID,
    packageSha256: EXPECTED_PACKAGE_SHA256,
    examDocument: preflight.examSnapshot,
  };
  const backupFile = path.resolve(__dirname, 'backups', `exam10_publication_backup_${Date.now()}.json`);
  fs.writeFileSync(backupFile, JSON.stringify(publicationBackup, null, 2), 'utf8');
  console.log(`Publication pre-state backup written: ${backupFile}`);

  const publishResult = await inspectAndOptionallyPublish({
    admin,
    db,
    release,
    write: true,
    expectedExamSnapshot: publicationBackup.examDocument,
  });
  assert(!publishResult.alreadyPublished, 'Exam became public between preflight and publication; no write was made');
  const exam = await verifyPublishedState(db, release);
  console.log(`PUBLISHED: Exam 10 is public as of ${exam.publishedAt.toDate().toISOString()}.`);
  console.log('QC remains honestly marked stale; the user-authorized override reason and approved package hash are recorded.');
}

main().then(() => process.exit(0)).catch((error) => {
  console.error(`FAILED: ${error.stack || error.message}`);
  process.exit(1);
});
