/**
 * Atomically replace Exam 9's Math modules with practiceTest9Math.json.
 *
 * Safety properties:
 *   - identifies Math modules by moduleNumber, never moduleIds order;
 *   - validates the full payload before any Firestore write;
 *   - writes a full, timestamp-safe backup before the transaction;
 *   - creates 44 questions, repoints both modules, repairs module metadata,
 *     retires outgoing unshared questions, and invalidates publication in one
 *     transaction;
 *   - never deletes a question document;
 *   - refuses a second deployment of the same provenance unless --force;
 *   - rollback restores exact mutable module/exam fields and exact prior
 *     retirement fields, then soft-retires the replacement docs.
 *
 * Usage:
 *   node scripts/validatePracticeTest9Math.js
 *   node scripts/replaceExam9Math.js --dry-run
 *   node scripts/replaceExam9Math.js
 *   node scripts/replaceExam9Math.js --rollback scripts/backups/<backup>.json
 */

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');
const { initFirebaseAdmin } = require('./lib/firestoreUploader');
const { resolveSubcategory } = require('./lib/subcategoryMap');

const EXAM_ID = 'LOafADEJwRWqNz4lrEGx';
const RETIRE_REASON = 'replaced by exam9-math-v1 (Practice Test 9 Math rebuild, 2026-08)';
const ROLLBACK_RETIRE_REASON = 'retired because exam9-math-v1 deployment was rolled back';
const INVALIDATION_REASON = 'Math modules 3 and 4 were replaced after quality control.';
const DATA_FILE = path.resolve(__dirname, 'data/practiceTest9Math.json');
const ASSETS_DIR = path.resolve(__dirname, 'data/practiceTest9Math-assets');
const data = require(DATA_FILE);
const payloadHasher = crypto.createHash('sha256');
payloadHasher.update('practiceTest9Math.json\0');
payloadHasher.update(fs.readFileSync(DATA_FILE));
for (const assetName of fs.readdirSync(ASSETS_DIR).filter((name) => name.endsWith('.svg')).sort()) {
  payloadHasher.update(`\0${assetName}\0`);
  payloadHasher.update(fs.readFileSync(path.join(ASSETS_DIR, assetName)));
}
const PAYLOAD_SHA256 = payloadHasher.digest('hex');
const BACKUP_FIELDS = [
  'title', 'description', 'section', 'calculatorAllowed', 'timeLimit',
  'questionIds', 'questionCount', 'updatedAt',
];
const EXAM_BACKUP_FIELDS = ['isPublic', 'qualityControl', 'updatedAt'];
const RETIREMENT_FIELDS = [
  'retired', 'retiredAt', 'retiredReason', 'originalUsageContext', 'usageContext', 'updatedAt',
];

const DRY_RUN = process.argv.includes('--dry-run');
const FORCE = process.argv.includes('--force');
const ROLLBACK_INDEX = process.argv.indexOf('--rollback');
let latestBackupFile = null;

function arraysEqual(a, b) {
  return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((value, index) => value === b[index]);
}

function stableObject(value) {
  if (Array.isArray(value)) return value.map(stableObject);
  if (!value || typeof value !== 'object') return value;
  return Object.keys(value).sort().reduce((output, key) => {
    output[key] = stableObject(value[key]);
    return output;
  }, {});
}

function stableSerialized(value) {
  return JSON.stringify(stableObject(serializeValue(value)));
}

function referenceMapSignature(referenceMap) {
  return JSON.stringify([...referenceMap.entries()]
    .map(([id, moduleIds]) => [id, [...moduleIds].sort()])
    .sort(([a], [b]) => a.localeCompare(b)));
}

function serializeValue(value) {
  if (value === undefined) return { __type: 'undefined' };
  if (value === null || typeof value !== 'object') return value;
  if (typeof value.toMillis === 'function') return { __type: 'timestamp', millis: value.toMillis() };
  if (typeof value.latitude === 'number' && typeof value.longitude === 'number') {
    return { __type: 'geopoint', latitude: value.latitude, longitude: value.longitude };
  }
  if (Array.isArray(value)) return value.map(serializeValue);
  const output = {};
  for (const [key, nested] of Object.entries(value)) output[key] = serializeValue(nested);
  return output;
}

function deserializeValue(value, admin) {
  if (value === null || typeof value !== 'object') return value;
  if (value.__type === 'undefined') return undefined;
  if (value.__type === 'timestamp') return admin.firestore.Timestamp.fromMillis(value.millis);
  if (value.__type === 'geopoint') return new admin.firestore.GeoPoint(value.latitude, value.longitude);
  if (Array.isArray(value)) return value.map((nested) => deserializeValue(nested, admin));
  const output = {};
  for (const [key, nested] of Object.entries(value)) output[key] = deserializeValue(nested, admin);
  return output;
}

function captureFields(documentData, fields) {
  const captured = {};
  for (const field of fields) {
    captured[field] = Object.prototype.hasOwnProperty.call(documentData, field)
      ? { present: true, value: serializeValue(documentData[field]) }
      : { present: false };
  }
  return captured;
}

function restoreFields(captured, fields, admin) {
  const patch = {};
  for (const field of fields) {
    const state = captured[field];
    patch[field] = state?.present
      ? deserializeValue(state.value, admin)
      : admin.firestore.FieldValue.delete();
  }
  return patch;
}

function svgToDataUri(assetName) {
  const file = path.join(ASSETS_DIR, assetName);
  const svg = fs.readFileSync(file, 'utf8');
  return `data:image/svg+xml;base64,${Buffer.from(svg, 'utf8').toString('base64')}`;
}

function buildMathQuestionDoc(question, moduleNumber) {
  const subcategory = resolveSubcategory(question.subcategory);
  if (!subcategory) throw new Error(`Unresolvable subcategory ${question.subcategory}`);
  if (subcategory.id !== question.subcategoryId) {
    throw new Error(`M${moduleNumber}Q${question.originalQuestionNumber}: subcategoryId mismatch`);
  }
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
    payloadHash: PAYLOAD_SHA256,
    originalQuestionNumber: question.originalQuestionNumber,
    originalModuleNumber: moduleNumber,
    hasImage,
    graphUrl: hasImage ? svgToDataUri(question.graphAsset) : null,
    graphDescription: hasImage ? question.graphDescription : null,
    passage: question.passage || null,
    skillTags: [],
  };
}

function runLocalValidator() {
  const validator = path.resolve(__dirname, 'validatePracticeTest9Math.js');
  const result = spawnSync(process.execPath, [validator], { cwd: path.resolve(__dirname, '..'), encoding: 'utf8' });
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  if (result.status !== 0) throw new Error('Local publication validator failed; Firestore was not touched.');
}

async function getExamAndMathModules(db) {
  const examRef = db.collection('practiceExams').doc(EXAM_ID);
  const examSnap = await examRef.get();
  if (!examSnap.exists) throw new Error(`Exam ${EXAM_ID} does not exist`);
  const exam = examSnap.data();
  if (exam.title !== data.targetExamTitle) {
    throw new Error(`Exam title mismatch: Firestore has ${exam.title}; payload targets ${data.targetExamTitle}`);
  }
  const moduleSnaps = await Promise.all((exam.moduleIds || []).map((id) => db.collection('examModules').doc(id).get()));
  const foundMath = { 3: [], 4: [] };
  const untouchedModules = [];
  for (const snap of moduleSnaps) {
    if (!snap.exists) continue;
    const moduleData = snap.data();
    if (moduleData.moduleNumber === 3 || moduleData.moduleNumber === 4) {
      foundMath[moduleData.moduleNumber].push({ id: snap.id, ref: snap.ref, data: moduleData });
    } else {
      untouchedModules.push({ id: snap.id, ref: snap.ref, data: moduleData });
    }
  }
  if (foundMath[3].length !== 1 || foundMath[4].length !== 1) {
    throw new Error(`Expected exactly one M3 and one M4; found M3=${foundMath[3].length}, M4=${foundMath[4].length}`);
  }
  const math = { 3: foundMath[3][0], 4: foundMath[4][0] };
  return { examRef, exam, math, untouchedModules };
}

async function buildPreflight(db) {
  const { examRef, exam, math, untouchedModules } = await getExamAndMathModules(db);
  for (const moduleNumber of [3, 4]) {
    const ids = math[moduleNumber].data.questionIds || [];
    if (ids.length !== 22 || new Set(ids).size !== 22) {
      throw new Error(`M${moduleNumber} must have 22 unique outgoing question IDs; found ${ids.length}/${new Set(ids).size}`);
    }
  }
  const oldIds = [...new Set([...(math[3].data.questionIds || []), ...(math[4].data.questionIds || [])])];
  if (oldIds.length !== 44) throw new Error(`Expected 44 distinct outgoing question IDs, found ${oldIds.length}`);
  const oldSnaps = await db.getAll(...oldIds.map((id) => db.collection('questions').doc(id)));
  const missing = oldSnaps.filter((snap) => !snap.exists).map((snap) => snap.id);
  if (missing.length) throw new Error(`Outgoing question docs are missing: ${missing.join(', ')}`);

  const existingProvenance = await db.collection('questions').where('originalExam', '==', data.examSlug).get();
  if (!existingProvenance.empty && !FORCE) {
    throw new Error(`Found ${existingProvenance.size} question doc(s) with originalExam=${data.examSlug}. Refusing a duplicate deployment; inspect them or rerun with --force.`);
  }

  const allModules = await db.collection('examModules').get();
  const targetModuleIds = new Set([math[3].id, math[4].id]);
  const sharedElsewhere = new Map();
  for (const moduleSnap of allModules.docs) {
    if (targetModuleIds.has(moduleSnap.id)) continue;
    for (const id of moduleSnap.data().questionIds || []) {
      if (oldIds.includes(id)) {
        if (!sharedElsewhere.has(id)) sharedElsewhere.set(id, []);
        sharedElsewhere.get(id).push(moduleSnap.id);
      }
    }
  }
  const oldQuestions = new Map(oldSnaps.map((snap) => [snap.id, snap.data()]));
  const inactive = [...oldQuestions.entries()]
    .filter(([, question]) => question.retired === true || question.usageContext === 'retired')
    .map(([id]) => id);
  if (inactive.length) throw new Error(`Outgoing module questions are already retired/inactive: ${inactive.join(', ')}`);
  return { examRef, exam, math, untouchedModules, oldIds, oldQuestions, sharedElsewhere };
}

function makeBackup(preflight, newQuestionIds) {
  const backup = {
    version: 2,
    kind: 'exam9-math-replacement',
    createdAt: new Date().toISOString(),
    exam: {
      id: EXAM_ID,
      title: preflight.exam.title,
      moduleIds: [...(preflight.exam.moduleIds || [])],
      fields: captureFields(preflight.exam, EXAM_BACKUP_FIELDS),
    },
    replacement: {
      examSlug: data.examSlug,
      payloadSha256: PAYLOAD_SHA256,
      questionIds: newQuestionIds,
      retireReason: RETIRE_REASON,
    },
    modules: {},
    sharedQuestionIds: [...preflight.sharedElsewhere.entries()].map(([id, moduleIds]) => ({ id, moduleIds })),
    untouchedModules: preflight.untouchedModules.map((module) => ({
      id: module.id,
      moduleNumber: module.data.moduleNumber,
      fullDocument: serializeValue(module.data),
    })),
  };
  for (const moduleNumber of [3, 4]) {
    const current = preflight.math[moduleNumber];
    backup.modules[moduleNumber] = {
      moduleDocId: current.id,
      fields: captureFields(current.data, BACKUP_FIELDS),
      previousQuestionIds: [...current.data.questionIds],
      previousQuestions: current.data.questionIds.map((id) => ({
        id,
        fullDocument: serializeValue(preflight.oldQuestions.get(id)),
        retirementFields: captureFields(preflight.oldQuestions.get(id), RETIREMENT_FIELDS),
      })),
    };
  }
  return backup;
}

async function rollback(db, admin, backupFile) {
  const backup = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
  if (backup.version !== 2 || backup.kind !== 'exam9-math-replacement' || backup.exam?.id !== EXAM_ID) {
    throw new Error('Backup is not a supported Exam 9 Math replacement backup');
  }
  if (!Array.isArray(backup.exam.moduleIds)) throw new Error('Backup exam topology is missing');
  if (![3, 4].every((number) => backup.modules?.[number]?.moduleDocId && backup.modules[number].previousQuestions?.length === 22)) {
    throw new Error('Backup module schema is incomplete');
  }
  if (![3, 4].every((number) => (backup.replacement?.questionIds?.[number] || []).length === 22)) {
    throw new Error('Backup replacement-ID schema is incomplete');
  }
  const examRef = db.collection('practiceExams').doc(EXAM_ID);
  const moduleEntries = [3, 4].map((number) => [number, backup.modules[number]]);

  await db.runTransaction(async (transaction) => {
    const moduleRefs = moduleEntries.map(([, module]) => db.collection('examModules').doc(module.moduleDocId));
    const [examSnap, ...moduleSnaps] = await transaction.getAll(examRef, ...moduleRefs);
    if (!examSnap.exists || examSnap.data().title !== backup.exam.title) throw new Error('Exam changed or is missing during rollback');
    const currentExam = examSnap.data();
    const targetModuleIds = moduleEntries.map(([, module]) => module.moduleDocId);
    if (!arraysEqual(currentExam.moduleIds || [], backup.exam.moduleIds) ||
        !targetModuleIds.every((id) => (currentExam.moduleIds || []).includes(id))) {
      throw new Error('Exam topology changed after deployment; refusing rollback');
    }
    if (!FORCE && (currentExam.isPublic !== false ||
        currentExam.qualityControl?.status !== 'stale' ||
        currentExam.qualityControl?.invalidationReason !== INVALIDATION_REASON)) {
      throw new Error('Exam publication/QC state changed after deployment; refusing rollback without --force');
    }
    for (let index = 0; index < moduleSnaps.length; index += 1) {
      const current = moduleSnaps[index];
      const moduleNumber = moduleEntries[index][0];
      if (!current.exists) throw new Error(`Module ${moduleNumber} is missing during rollback`);
      const expectedReplacement = backup.replacement.questionIds[moduleNumber];
      if (!FORCE && !arraysEqual(current.data().questionIds || [], expectedReplacement)) {
        throw new Error(`Module ${moduleNumber} no longer points to this backup's replacement questions; refusing rollback without --force`);
      }
    }

    const allModuleSnaps = await transaction.get(db.collection('examModules'));
    const targetModuleIdSet = new Set(targetModuleIds);
    const replacementIdSet = new Set(Object.values(backup.replacement.questionIds).flat());
    const externalReferences = [];
    for (const moduleSnap of allModuleSnaps.docs) {
      if (targetModuleIdSet.has(moduleSnap.id)) continue;
      const used = (moduleSnap.data().questionIds || []).filter((id) => replacementIdSet.has(id));
      if (used.length) externalReferences.push({ moduleId: moduleSnap.id, questionIds: used });
    }
    if (externalReferences.length) {
      throw new Error(`Rollback would retire replacement questions referenced elsewhere: ${JSON.stringify(externalReferences)}`);
    }

    for (const [, module] of moduleEntries) {
      const moduleRef = db.collection('examModules').doc(module.moduleDocId);
      transaction.update(moduleRef, restoreFields(module.fields, BACKUP_FIELDS, admin));
      for (const question of module.previousQuestions) {
        transaction.update(
          db.collection('questions').doc(question.id),
          restoreFields(question.retirementFields, RETIREMENT_FIELDS, admin),
        );
      }
    }
    transaction.update(examRef, restoreFields(backup.exam.fields, EXAM_BACKUP_FIELDS, admin));
    for (const ids of Object.values(backup.replacement.questionIds || {})) {
      for (const id of ids) {
        transaction.update(db.collection('questions').doc(id), {
          retired: true,
          retiredAt: admin.firestore.FieldValue.serverTimestamp(),
          retiredReason: ROLLBACK_RETIRE_REASON,
          originalUsageContext: 'exam',
          usageContext: 'retired',
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    }
  });
  console.log('Rollback complete: original pointers, metadata, publication state, and retirement fields restored.');
  console.log('Replacement question docs were preserved and soft-retired; nothing was deleted.');
}

async function verifyDeployment(db, backup, expectedDocs) {
  const { exam, math } = await getExamAndMathModules(db);
  if (!arraysEqual(exam.moduleIds || [], backup.exam.moduleIds || [])) {
    throw new Error('Post-write verification: Exam 9 moduleIds changed');
  }
  if (exam.isPublic !== false) throw new Error('Post-write verification: Exam 9 should be unpublished after QC invalidation');
  if (exam.qualityControl?.status !== 'stale') throw new Error('Post-write verification: qualityControl.status is not stale');
  for (const moduleNumber of [3, 4]) {
    const module = math[moduleNumber].data;
    const payloadModule = data.modules.find((entry) => entry.moduleNumber === moduleNumber);
    const expectedIds = backup.replacement.questionIds[moduleNumber];
    if (!arraysEqual(module.questionIds, expectedIds)) throw new Error(`Post-write verification: M${moduleNumber} pointer mismatch`);
    if (module.questionCount !== 22 || module.calculatorAllowed !== true || module.timeLimit !== 2100 || module.section !== 'Math' ||
        module.title !== payloadModule.title || module.description !== payloadModule.description) {
      throw new Error(`Post-write verification: M${moduleNumber} metadata mismatch`);
    }
    const snaps = await db.getAll(...expectedIds.map((id) => db.collection('questions').doc(id)));
    snaps.forEach((snap, index) => {
      if (!snap.exists) throw new Error(`Post-write verification: missing replacement doc at M${moduleNumber}Q${index + 1}`);
      const question = snap.data();
      const expected = expectedDocs[moduleNumber][index];
      for (const [field, expectedValue] of Object.entries(expected)) {
        if (stableSerialized(question[field]) !== stableSerialized(expectedValue)) {
          throw new Error(`Post-write verification: M${moduleNumber}Q${index + 1} field ${field} differs from payload`);
        }
      }
    });
  }
  let retired = 0;
  for (const moduleNumber of [3, 4]) {
    const oldEntries = backup.modules[moduleNumber].previousQuestions;
    const oldIds = oldEntries.map((entry) => entry.id);
    const snaps = await db.getAll(...oldIds.map((id) => db.collection('questions').doc(id)));
    for (let index = 0; index < snaps.length; index += 1) {
      const snap = snaps[index];
      if (!snap.exists) throw new Error(`Post-write verification: outgoing doc ${snap.id} was deleted`);
      const shared = backup.sharedQuestionIds.some((entry) => entry.id === snap.id);
      if (shared) {
        const before = JSON.stringify(stableObject(oldEntries[index].fullDocument));
        if (stableSerialized(snap.data()) !== before) throw new Error(`Post-write verification: shared outgoing doc ${snap.id} changed`);
      } else {
        const question = snap.data();
        if (question.retired !== true || question.usageContext !== 'retired' || question.retiredReason !== RETIRE_REASON || !question.retiredAt) {
          throw new Error(`Post-write verification: outgoing doc ${snap.id} is not canonically retired`);
        }
        retired += 1;
      }
    }
  }
  const expectedRetired = 44 - backup.sharedQuestionIds.length;
  if (retired !== expectedRetired) throw new Error(`Post-write verification: retired ${retired}, expected ${expectedRetired}`);

  const allModules = await db.collection('examModules').get();
  const outgoingSet = new Set([3, 4].flatMap((number) => backup.modules[number].previousQuestionIds));
  const postReferenceMap = new Map();
  for (const moduleSnap of allModules.docs) {
    for (const id of moduleSnap.data().questionIds || []) {
      if (!outgoingSet.has(id)) continue;
      if (!postReferenceMap.has(id)) postReferenceMap.set(id, []);
      postReferenceMap.get(id).push(moduleSnap.id);
    }
  }
  const expectedReferenceMap = new Map(backup.sharedQuestionIds.map((entry) => [entry.id, entry.moduleIds]));
  if (referenceMapSignature(postReferenceMap) !== referenceMapSignature(expectedReferenceMap)) {
    throw new Error('Post-write verification: outgoing-question reference map differs from the guarded plan');
  }

  if (backup.untouchedModules?.length) {
    const snaps = await db.getAll(...backup.untouchedModules.map((module) => db.collection('examModules').doc(module.id)));
    snaps.forEach((snap, index) => {
      if (!snap.exists || stableSerialized(snap.data()) !== JSON.stringify(stableObject(backup.untouchedModules[index].fullDocument))) {
        throw new Error(`Post-write verification: untouched module ${backup.untouchedModules[index].id} changed`);
      }
    });
  }
  console.log(`Verified: 44 replacement questions live in their modules; ${retired} outgoing questions soft-retired.`);
  console.log('Exam 9 is unpublished and QC is stale, matching the application safety contract.');
}

async function main() {
  const knownFlags = new Set(['--dry-run', '--force', '--rollback']);
  const unknownFlags = process.argv.slice(2).filter((arg) => arg.startsWith('--') && !knownFlags.has(arg));
  if (unknownFlags.length) throw new Error(`Unknown option(s): ${unknownFlags.join(', ')}`);
  if (DRY_RUN && ROLLBACK_INDEX !== -1) throw new Error('--dry-run and --rollback cannot be combined');
  const admin = initFirebaseAdmin();
  const db = admin.firestore();
  if (ROLLBACK_INDEX !== -1) {
    const file = process.argv[ROLLBACK_INDEX + 1];
    if (!file) throw new Error('--rollback requires a backup file path');
    return rollback(db, admin, path.resolve(file));
  }

  runLocalValidator();
  const preflight = await buildPreflight(db);
  const replacementDocs = {};
  const replacementRefs = {};
  const replacementIds = {};
  for (const module of data.modules) {
    replacementDocs[module.moduleNumber] = module.questions.map((question) => buildMathQuestionDoc(question, module.moduleNumber));
    replacementRefs[module.moduleNumber] = module.questions.map(() => db.collection('questions').doc());
    replacementIds[module.moduleNumber] = replacementRefs[module.moduleNumber].map((ref) => ref.id);
  }

  const backup = makeBackup(preflight, replacementIds);
  console.log(`Exam ${EXAM_ID} (${preflight.exam.title}); Math docs M3=${preflight.math[3].id}, M4=${preflight.math[4].id}`);
  console.log(`Outgoing: ${preflight.oldIds.length} distinct questions; shared elsewhere: ${preflight.sharedElsewhere.size}`);
  console.log(`Replacement: 44 original questions; M3 has 22, M4 has 22; module metadata -> Math / calculator / 2100 seconds`);
  console.log(`Content package SHA-256: ${PAYLOAD_SHA256}`);
  console.log(`Publication safety: isPublic ${preflight.exam.isPublic} -> false; qualityControl -> stale`);
  if (DRY_RUN) {
    console.log('[dry-run] No backup or Firestore write was made.');
    return;
  }

  const backupDir = path.resolve(__dirname, 'backups');
  fs.mkdirSync(backupDir, { recursive: true });
  const backupFile = path.join(backupDir, `exam9_math_backup_${Date.now()}.json`);
  fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2), 'utf8');
  latestBackupFile = backupFile;
  console.log(`Backup written: ${backupFile}`);

  await db.runTransaction(async (transaction) => {
    const examRef = preflight.examRef;
    const allModuleQuery = db.collection('examModules');
    const oldQuestionRefs = preflight.oldIds.map((id) => db.collection('questions').doc(id));
    const [examSnap, module3Snap, module4Snap, ...oldQuestionSnaps] = await transaction.getAll(
      examRef,
      preflight.math[3].ref,
      preflight.math[4].ref,
      ...oldQuestionRefs,
    );
    const allModuleSnaps = await transaction.get(allModuleQuery);
    if (!examSnap.exists || examSnap.data().title !== data.targetExamTitle) throw new Error('Exam changed during deployment');
    const currentExam = examSnap.data();
    if (!arraysEqual(currentExam.moduleIds || [], preflight.exam.moduleIds || []) ||
        !(currentExam.moduleIds || []).includes(preflight.math[3].id) ||
        !(currentExam.moduleIds || []).includes(preflight.math[4].id)) {
      throw new Error('Exam moduleIds changed after backup; deployment aborted');
    }
    if (stableSerialized(captureFields(currentExam, EXAM_BACKUP_FIELDS)) !==
        stableSerialized(captureFields(preflight.exam, EXAM_BACKUP_FIELDS))) {
      throw new Error('Exam publication/QC metadata changed after backup; deployment aborted');
    }
    for (const [number, snap] of [[3, module3Snap], [4, module4Snap]]) {
      if (!snap.exists) throw new Error(`Module ${number} disappeared during deployment`);
      if (!arraysEqual(snap.data().questionIds || [], preflight.math[number].data.questionIds || [])) {
        throw new Error(`Module ${number} pointers changed during deployment`);
      }
      if (stableSerialized(captureFields(snap.data(), BACKUP_FIELDS)) !==
          stableSerialized(captureFields(preflight.math[number].data, BACKUP_FIELDS))) {
        throw new Error(`Module ${number} metadata changed after backup; deployment aborted`);
      }
    }
    const currentOldQuestions = new Map();
    oldQuestionSnaps.forEach((snap, index) => {
      const id = preflight.oldIds[index];
      if (!snap.exists) throw new Error(`Outgoing question ${id} disappeared during deployment`);
      if (stableSerialized(snap.data()) !== stableSerialized(preflight.oldQuestions.get(id))) {
        throw new Error(`Outgoing question ${id} changed after backup; deployment aborted`);
      }
      currentOldQuestions.set(id, snap.data());
    });
    const transactionModules = new Map(allModuleSnaps.docs.map((snap) => [snap.id, snap.data()]));
    for (const untouched of preflight.untouchedModules) {
      const current = transactionModules.get(untouched.id);
      if (!current || stableSerialized(current) !== stableSerialized(untouched.data)) {
        throw new Error(`Untouched Exam 9 module ${untouched.id} changed after backup; deployment aborted`);
      }
    }
    const oldIdSet = new Set(preflight.oldIds);
    const targetIds = new Set([preflight.math[3].id, preflight.math[4].id]);
    const transactionShared = new Map();
    for (const moduleSnap of allModuleSnaps.docs) {
      if (targetIds.has(moduleSnap.id)) continue;
      for (const id of moduleSnap.data().questionIds || []) {
        if (!oldIdSet.has(id)) continue;
        if (!transactionShared.has(id)) transactionShared.set(id, []);
        transactionShared.get(id).push(moduleSnap.id);
      }
    }
    if (referenceMapSignature(transactionShared) !== referenceMapSignature(preflight.sharedElsewhere)) {
      throw new Error('Outgoing-question reference plan changed after backup; deployment aborted');
    }

    const timestamp = admin.firestore.FieldValue.serverTimestamp();
    for (const module of data.modules) {
      const number = module.moduleNumber;
      replacementDocs[number].forEach((question, index) => {
        transaction.create(replacementRefs[number][index], { ...question, createdAt: timestamp, updatedAt: timestamp });
      });
      transaction.update(preflight.math[number].ref, {
        title: module.title,
        description: module.description,
        section: module.section,
        calculatorAllowed: module.calculatorAllowed,
        timeLimit: module.timeLimit,
        questionIds: replacementIds[number],
        questionCount: replacementIds[number].length,
        updatedAt: timestamp,
      });
    }
    for (const id of preflight.oldIds) {
      if (transactionShared.has(id)) continue;
      const old = currentOldQuestions.get(id);
      if (old.retired === true) continue;
      transaction.update(db.collection('questions').doc(id), {
        retired: true,
        retiredAt: timestamp,
        retiredReason: RETIRE_REASON,
        originalUsageContext: old.usageContext ?? 'exam',
        usageContext: 'retired',
        updatedAt: timestamp,
      });
    }
    const examData = examSnap.data();
    transaction.update(examRef, {
      isPublic: false,
      qualityControl: {
        ...(examData.qualityControl || {}),
        status: 'stale',
        invalidationReason: INVALIDATION_REASON,
        invalidatedAt: timestamp,
      },
      updatedAt: timestamp,
    });
  });

  await verifyDeployment(db, backup, replacementDocs);
  console.log(`Rollback command: node scripts/replaceExam9Math.js --rollback "${backupFile}"`);
}

main().then(() => process.exit(0)).catch((error) => {
  console.error(`FAILED: ${error.stack || error.message}`);
  if (latestBackupFile) {
    console.error('Firestore may have committed before a verification failure. Inspect state, then roll back if needed:');
    console.error(`node scripts/replaceExam9Math.js --rollback "${latestBackupFile}"`);
  }
  process.exit(1);
});
