const crypto = require('crypto');
const express = require('express');
const multer = require('multer');
const { toFile } = require('openai');
const { requireAdmin } = require('./middleware/auth');
const {
  POLICY_VERSION,
  PROMPT_VERSION,
  addVerifiedStudentResponseForms,
  createCanonicalKeyRepairCandidate,
  createContentHash,
  createOpenAIClient,
  createVisualOnlyRepairCandidate,
  getExpectedQuestionCount,
  getModel,
  getReasoningEffort,
  getReasoningMode,
  highestSeverity,
  inferQuestionType,
  inspectModuleStructure,
  inspectQuestionDeterministically,
  renderVisualSpecToSvg,
  requireReferenceEvidence,
  retrieveReferenceExcerpts,
  runIndependentVerification,
  runQuestionAudit,
  runRepairEditorialReview,
  runRepairGeneration,
  stripUndefined,
  summarizeRunItems,
  verifyCandidateForApplication,
} = require('./examQualityControlService');

const router = express.Router();
const verifyAdminAccess = requireAdmin({
  authLogLabel: '[ExamQualityControl] Error verifying token',
  adminLogLabel: '[ExamQualityControl] Error checking admin access',
});

const RUNS_COLLECTION = 'examQualityRuns';
const REFERENCES_COLLECTION = 'examQualityReferences';
const parsedAuditConcurrency = Number.parseInt(
  process.env.OPENAI_EXAM_QUALITY_AUDIT_CONCURRENCY || '',
  10,
);
const DEFAULT_AUDIT_CONCURRENCY =
  Number.isFinite(parsedAuditConcurrency) && parsedAuditConcurrency > 0
    ? Math.min(4, parsedAuditConcurrency)
    : 2;
const MAX_REFERENCE_FILE_SIZE = 60 * 1024 * 1024;
const activeJobs = new Map();
const WORKER_INSTANCE_ID = `${process.pid}-${crypto.randomUUID()}`;
const WORKER_LEASE_DURATION_MS = 5 * 60 * 1000;
const WORKER_HEARTBEAT_MS = 30 * 1000;

function timestampToMillis(value) {
  if (!value) return 0;
  if (typeof value.toMillis === 'function') return value.toMillis();
  if (typeof value.toDate === 'function') {
    return value.toDate().getTime();
  }
  if (value instanceof Date) return value.getTime();
  const parsed = Date.parse(String(value));
  return Number.isFinite(parsed) ? parsed : 0;
}

function hasActiveWorkerLease(run, now = Date.now()) {
  return (
    Boolean(run?.workerLease?.ownerId) &&
    timestampToMillis(run.workerLease.expiresAt) > now
  );
}

async function acquireWorkerLease(
  db,
  runId,
  { type, approvalId = null } = {},
) {
  const runRef = db.collection(RUNS_COLLECTION).doc(String(runId));
  const token = crypto.randomUUID();
  let acquired = false;
  await db.runTransaction(async transaction => {
    const snapshot = await transaction.get(runRef);
    if (!snapshot.exists) {
      throw new Error('Exam quality-control run not found');
    }
    const run = snapshot.data();
    if (hasActiveWorkerLease(run)) return;
    const now = new Date();
    transaction.set(
      runRef,
      {
        workerLease: {
          ownerId: WORKER_INSTANCE_ID,
          token,
          type,
          approvalId,
          acquiredAt: now,
          heartbeatAt: now,
          expiresAt: new Date(
            now.getTime() + WORKER_LEASE_DURATION_MS,
          ),
        },
        updatedAt: now,
      },
      { merge: true },
    );
    acquired = true;
  });
  return { acquired, runRef, token };
}

async function renewWorkerLease(db, runId, type, token) {
  const runRef = db.collection(RUNS_COLLECTION).doc(String(runId));
  let renewed = false;
  await db.runTransaction(async transaction => {
    const snapshot = await transaction.get(runRef);
    if (!snapshot.exists) return;
    const lease = snapshot.data().workerLease;
    if (
      lease?.ownerId !== WORKER_INSTANCE_ID ||
      lease?.type !== type ||
      lease?.token !== token
    ) {
      return;
    }
    const now = new Date();
    transaction.set(
      runRef,
      {
        workerLease: {
          ...lease,
          heartbeatAt: now,
          expiresAt: new Date(
            now.getTime() + WORKER_LEASE_DURATION_MS,
          ),
        },
        updatedAt: now,
      },
      { merge: true },
    );
    renewed = true;
  });
  return renewed;
}

async function releaseWorkerLease(db, runId, type, token) {
  const runRef = db.collection(RUNS_COLLECTION).doc(String(runId));
  await db.runTransaction(async transaction => {
    const snapshot = await transaction.get(runRef);
    if (!snapshot.exists) return;
    const lease = snapshot.data().workerLease;
    if (
      lease?.ownerId !== WORKER_INSTANCE_ID ||
      lease?.type !== type ||
      lease?.token !== token
    ) {
      return;
    }
    transaction.set(
      runRef,
      {
        workerLease: null,
        updatedAt: new Date(),
      },
      { merge: true },
    );
  });
}

function startWorkerHeartbeat(db, runId, type, token) {
  const state = { lost: false, renewing: false };
  const interval = setInterval(async () => {
    if (state.renewing || state.lost) return;
    state.renewing = true;
    try {
      state.lost = !(
        await renewWorkerLease(db, runId, type, token)
      );
    } catch (error) {
      console.error(
        `[ExamQualityControl] ${type} lease heartbeat failed:`,
        error,
      );
      state.lost = true;
    } finally {
      state.renewing = false;
    }
  }, WORKER_HEARTBEAT_MS);
  interval.unref?.();
  return {
    assertOwned() {
      if (state.lost) {
        const error = new Error(
          `The durable ${type} worker lease was lost; the run was stopped to prevent duplicate writes.`,
        );
        error.code = 'WORKER_LEASE_LOST';
        throw error;
      }
    },
    pause() {
      clearInterval(interval);
    },
    async release() {
      clearInterval(interval);
      await releaseWorkerLease(
        db,
        runId,
        type,
        token,
      ).catch(() => {});
    },
  };
}

function assertWorkerLeaseData(run, type, token) {
  const lease = run?.workerLease;
  if (
    lease?.ownerId !== WORKER_INSTANCE_ID ||
    lease?.type !== type ||
    lease?.token !== token ||
    timestampToMillis(lease.expiresAt) <= Date.now()
  ) {
    const error = new Error(
      `The durable ${type} worker lease is no longer owned by this job.`,
    );
    error.code = 'WORKER_LEASE_LOST';
    throw error;
  }
}

async function assertWorkerLeaseInTransaction(
  transaction,
  runRef,
  type,
  token,
) {
  const snapshot = await transaction.get(runRef);
  if (!snapshot.exists) {
    const error = new Error('Exam quality-control run not found');
    error.code = 'WORKER_LEASE_LOST';
    throw error;
  }
  assertWorkerLeaseData(snapshot.data(), type, token);
  return snapshot;
}

async function setDocumentWithWorkerLease({
  db,
  runRef,
  documentRef,
  type,
  token,
  data,
  options = { merge: true },
}) {
  await db.runTransaction(async transaction => {
    await assertWorkerLeaseInTransaction(
      transaction,
      runRef,
      type,
      token,
    );
    transaction.set(documentRef, data, options);
  });
}

async function markWorkerFailure({
  db,
  runId,
  type,
  token,
  error,
}) {
  const runRef = db
    .collection(RUNS_COLLECTION)
    .doc(String(runId));
  const eventRef = runRef.collection('events').doc();
  await db.runTransaction(async transaction => {
    await assertWorkerLeaseInTransaction(
      transaction,
      runRef,
      type,
      token,
    );
    const now = new Date();
    transaction.set(
      runRef,
      {
        status: 'failed',
        lastError:
          error.message || `${type} worker failed`,
        updatedAt: now,
      },
      { merge: true },
    );
    transaction.set(eventRef, {
      type: `${type}_failed`,
      detail: {
        error:
          error.message || `${type} worker failed`,
      },
      createdAt: now,
    });
  });
}

const referenceUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_REFERENCE_FILE_SIZE },
  fileFilter: (_req, file, callback) => {
    const extension = String(file.originalname || '')
      .toLowerCase()
      .split('.')
      .pop();
    const supportedExtensions = new Set([
      'pdf',
      'docx',
      'txt',
      'md',
      'json',
    ]);

    if (!supportedExtensions.has(extension)) {
      return callback(
        new Error(
          'Reference files must be PDF, DOCX, TXT, Markdown, or JSON',
        ),
      );
    }
    return callback(null, true);
  },
});

function timestampToIso(value) {
  if (!value) return null;
  if (typeof value.toDate === 'function') {
    return value.toDate().toISOString();
  }
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'string') return value;
  return null;
}

function serializeValue(value) {
  if (Array.isArray(value)) return value.map(serializeValue);
  if (!value || typeof value !== 'object') return value;
  const iso = timestampToIso(value);
  if (iso) return iso;
  return Object.entries(value).reduce((result, [key, nested]) => {
    result[key] = serializeValue(nested);
    return result;
  }, {});
}

function serializeDoc(doc) {
  const data = typeof doc.data === 'function' ? doc.data() : doc;
  return {
    id: doc.id || data.id,
    ...serializeValue(data),
  };
}

function safeFileName(value) {
  return String(value || 'reference')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

function normalizeReferenceId(value) {
  return typeof value === 'string' ? value : '';
}

function isValidDocumentId(value) {
  const id = normalizeReferenceId(value);
  return (
    id.length > 0 &&
    id === id.trim() &&
    !id.includes('/') &&
    Buffer.byteLength(id, 'utf8') <= 1500 &&
    !/^__.*__$/.test(id)
  );
}

function getReferenceEntries(values) {
  return (Array.isArray(values) ? values : []).map(
    (raw, index) => ({
      raw,
      index,
      id: normalizeReferenceId(raw),
      valid: isValidDocumentId(raw),
    }),
  );
}

async function getDocumentsByRefs(db, refs, chunkSize = 200) {
  if (!refs.length) return [];
  const documents = [];

  if (typeof db.getAll === 'function') {
    for (let index = 0; index < refs.length; index += chunkSize) {
      const chunk = refs.slice(index, index + chunkSize);
      const snapshots = await db.getAll(...chunk);
      documents.push(...snapshots);
    }
    return documents;
  }

  return Promise.all(refs.map(ref => ref.get()));
}

async function readCanonicalContentManifest({
  db,
  examId,
  selectedModuleIds,
  transaction = null,
}) {
  const read = reference =>
    transaction
      ? transaction.get(reference)
      : reference.get();
  const examRef = db
    .collection('practiceExams')
    .doc(String(examId));
  const examSnap = await read(examRef);
  if (!examSnap.exists) {
    throw new Error('Practice exam no longer exists');
  }
  const examModuleEntries = getReferenceEntries(
    examSnap.data().moduleIds,
  );
  const examModuleIds = examModuleEntries.map(
    entry => entry.id,
  );
  const normalizedSelectedModuleIds = (
    selectedModuleIds || []
  ).map(String);
  const moduleRefs = normalizedSelectedModuleIds.map(
    moduleId => {
      if (!isValidDocumentId(moduleId)) {
        throw new Error(
          `Cannot read malformed module reference at "${moduleId}".`,
        );
      }
      return db.collection('examModules').doc(moduleId);
    },
  );
  const moduleSnaps = await Promise.all(
    moduleRefs.map(read),
  );
  const questionIds = Array.from(
    new Set(
      moduleSnaps.flatMap(snapshot =>
        snapshot.exists
          ? getReferenceEntries(
              snapshot.data().questionIds,
            )
              .filter(entry => entry.valid)
              .map(entry => entry.id)
          : [],
      ),
    ),
  );
  const questionRefs = questionIds.map(questionId =>
    db.collection('questions').doc(questionId),
  );
  const questionSnaps = await Promise.all(
    questionRefs.map(read),
  );
  const questionById = new Map(
    questionSnaps.map(snapshot => [
      snapshot.id,
      snapshot,
    ]),
  );
  const manifest = {
    examId: examSnap.id,
    exam: {
      moduleIds: examModuleIds,
    },
    selectedModuleIds: normalizedSelectedModuleIds,
    modules: moduleSnaps.map((snapshot, index) => {
      const moduleId =
        normalizedSelectedModuleIds[index];
      if (!snapshot.exists) {
        return { id: moduleId, exists: false };
      }
      const module = snapshot.data();
      const moduleQuestionEntries =
        getReferenceEntries(module.questionIds);
      return {
        id: snapshot.id,
        data: module,
        questionHashes: moduleQuestionEntries.map(
          entry => {
            const questionId = entry.id;
            const questionSnap =
              entry.valid
                ? questionById.get(questionId)
                : null;
            return {
              id: questionId,
              exists: Boolean(questionSnap?.exists),
              hash: questionSnap?.exists
                ? createContentHash(questionSnap.data())
                : null,
            };
          },
        ),
      };
    }),
  };
  return {
    examRef,
    examSnap,
    examModuleIds,
    moduleSnaps,
    moduleById: new Map(
      moduleSnaps.map(snapshot => [
        snapshot.id,
        snapshot,
      ]),
    ),
    questionById,
    manifest,
    hash: createContentHash(manifest),
  };
}

async function getCollectionOrdered(
  collectionRef,
  { orderBy = 'createdAt', direction = 'desc', limit = 25 } = {},
) {
  try {
    return await collectionRef
      .orderBy(orderBy, direction)
      .limit(limit)
      .get();
  } catch (error) {
    const fallback = await collectionRef.get();
    return {
      docs: fallback.docs
        .slice()
        .sort((left, right) => {
          const leftDate =
            timestampToIso(left.data()?.[orderBy]) || '';
          const rightDate =
            timestampToIso(right.data()?.[orderBy]) || '';
          return direction === 'desc'
            ? rightDate.localeCompare(leftDate)
            : leftDate.localeCompare(rightDate);
        })
        .slice(0, limit),
    };
  }
}

async function addRunEvent(runRef, type, detail = {}) {
  const eventRef = runRef.collection('events').doc();
  await eventRef.set({
    type,
    detail: stripUndefined(detail),
    createdAt: new Date(),
  });
  return eventRef.id;
}

async function fetchRunOrThrow(db, runId) {
  const runRef = db.collection(RUNS_COLLECTION).doc(String(runId));
  const runSnap = await runRef.get();
  if (!runSnap.exists) {
    const error = new Error('Exam quality-control run not found');
    error.status = 404;
    throw error;
  }
  return { runRef, runSnap, run: runSnap.data() };
}

async function fetchRunItems(runRef) {
  const snapshot = await runRef.collection('items').get();
  return snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .sort((left, right) => {
      const moduleDifference =
        Number(left.moduleNumber || 0) - Number(right.moduleNumber || 0);
      if (moduleDifference !== 0) return moduleDifference;
      return Number(left.slotIndex ?? 999) - Number(right.slotIndex ?? 999);
    });
}

function createItemId(kind, moduleId, slotIndex, suffix = '') {
  const shortHash = crypto
    .createHash('sha1')
    .update(`${kind}:${moduleId}:${slotIndex}:${suffix}`)
    .digest('hex')
    .slice(0, 14);
  return `${kind.replace(/[^a-z0-9]+/gi, '_')}_${shortHash}`;
}

function createMissingAnalysis({
  moduleNumber,
  reason,
  targetDifficulty = 'medium',
  targetSkill = 'balanced module gap',
}) {
  return {
    outcome: 'needs_repair',
    recommendedAction: 'replace',
    severity: 'critical',
    summary: reason,
    scores: {
      contentAccuracy: 0,
      answerDeterminacy: 0,
      officialStyle: 0,
      stemQuality: 0,
      distractorQuality: 0,
      difficultyCalibration: 0,
      visualIntegrity: 0,
      overall: 0,
    },
    calibratedDifficulty: targetDifficulty,
    answerValidation: {
      singleCorrectAnswer: false,
      solvedAnswer: '',
      matchesStoredKey: false,
      explanation: 'There is no resolvable question to solve.',
    },
    issues: [
      {
        code: 'missing_question',
        severity: 'critical',
        evidence: reason,
        repairInstruction:
          'Generate an original, reference-calibrated question and independently verify it before inserting it at this exact module position.',
      },
    ],
    repairSpecification: {
      preserve: [
        `Module ${moduleNumber} section and Digital SAT blueprint`,
        'Exact module slot',
      ],
      change: ['Create a complete original question'],
      targetSkill,
      targetDifficulty,
      visualRequired: false,
      visualRequirements:
        'Use a visual only when the selected skill genuinely requires one.',
    },
    referenceUseSummary:
      'Reference calibration will occur during approved generation and independent verification.',
    confidence: 'high',
  };
}

function getQuestionPreview(question) {
  const passage = String(question?.passage || '').trim();
  const text = String(question?.text || question?.question || '').trim();
  return [passage, text].filter(Boolean).join(' ').slice(0, 280);
}

function buildModuleProfile(questionDocs) {
  const difficultyDistribution = {};
  const subcategoryDistribution = {};
  const questionPreviews = [];

  questionDocs.forEach(snapshot => {
    if (!snapshot?.exists) return;
    const question = snapshot.data();
    const difficulty = String(question.difficulty || 'medium').toLowerCase();
    const subcategory = String(
      question.subcategory ||
        question.subCategory ||
        question.subcategoryId ||
        'unknown',
    );
    difficultyDistribution[difficulty] =
      (difficultyDistribution[difficulty] || 0) + 1;
    subcategoryDistribution[subcategory] =
      (subcategoryDistribution[subcategory] || 0) + 1;
    questionPreviews.push({
      difficulty,
      subcategory,
      preview: getQuestionPreview(question).slice(0, 140),
    });
  });

  return {
    difficultyDistribution,
    subcategoryDistribution,
    existingQuestionCount: questionPreviews.length,
    existingQuestionPreviews: questionPreviews,
  };
}

async function countQuestionReferences(allModules) {
  const counts = new Map();
  allModules.forEach(module => {
    const uniqueIds = new Set(
      Array.isArray(module.questionIds) ? module.questionIds.map(String) : [],
    );
    uniqueIds.forEach(questionId => {
      counts.set(questionId, (counts.get(questionId) || 0) + 1);
    });
  });
  return counts;
}

async function buildRunInventory(db, examId, requestedModuleIds) {
  const examRef = db.collection('practiceExams').doc(String(examId));
  const examSnap = await examRef.get();
  if (!examSnap.exists) {
    const error = new Error('Practice exam not found');
    error.status = 404;
    throw error;
  }

  const exam = examSnap.data();
  const examModuleEntries = getReferenceEntries(
    exam.moduleIds,
  );
  const examModuleIds = examModuleEntries.map(
    entry => entry.id,
  );
  const validExamModuleIds = examModuleEntries
    .filter(entry => entry.valid)
    .map(entry => entry.id);
  const requestedScope =
    Array.isArray(requestedModuleIds) &&
    requestedModuleIds.length > 0;
  const requestedEntries = getReferenceEntries(
    requestedModuleIds,
  );
  const malformedRequestedEntry = requestedEntries.find(
    entry => !entry.valid,
  );
  if (malformedRequestedEntry) {
    const error = new Error(
      'One of the selected module references is malformed.',
    );
    error.status = 400;
    throw error;
  }
  const selectedModuleIds =
    requestedScope
      ? Array.from(
          new Set(requestedEntries.map(entry => entry.id)),
        )
      : validExamModuleIds;

  const invalidModuleId = selectedModuleIds.find(
    moduleId => !validExamModuleIds.includes(moduleId),
  );
  if (invalidModuleId) {
    const error = new Error(
      `Module ${invalidModuleId} is not part of the selected exam`,
    );
    error.status = 400;
    throw error;
  }
  if (requestedScope && !selectedModuleIds.length) {
    const error = new Error('Select at least one exam module');
    error.status = 400;
    throw error;
  }

  const selectedModuleRefs = selectedModuleIds.map(moduleId =>
    db.collection('examModules').doc(moduleId),
  );
  const selectedModuleSnaps = await getDocumentsByRefs(
    db,
    selectedModuleRefs,
  );
  const allModuleSnapshot = await db.collection('examModules').get();
  const referenceCounts = await countQuestionReferences(
    allModuleSnapshot.docs.map(doc => doc.data()),
  );

  const allQuestionIds = Array.from(
    new Set(
      selectedModuleSnaps.flatMap(snapshot =>
        snapshot.exists
          ? getReferenceEntries(
              snapshot.data().questionIds,
            )
              .filter(entry => entry.valid)
              .map(entry => entry.id)
          : [],
      ),
    ),
  );
  const questionRefs = allQuestionIds.map(questionId =>
    db.collection('questions').doc(questionId),
  );
  const questionSnaps = await getDocumentsByRefs(db, questionRefs);
  const questionById = new Map(
    questionSnaps.map(snapshot => [snapshot.id, snapshot]),
  );

  const moduleSummaries = [];
  const items = [];
  const manifest = {
    examId: examSnap.id,
    exam: {
      moduleIds: examModuleIds,
    },
    selectedModuleIds,
    modules: [],
  };
  const isFullExamScope =
    !requestedScope ||
    (
      selectedModuleIds.length ===
        validExamModuleIds.length &&
      selectedModuleIds.every(moduleId =>
        validExamModuleIds.includes(moduleId),
      )
    );
  if (isFullExamScope) {
    examModuleEntries
      .filter(entry => !entry.valid)
      .forEach(entry => {
        const reason =
          `Exam module slot ${entry.index + 1} contains a malformed module reference.`;
        items.push({
          id: createItemId(
            'malformed_module_reference',
            examSnap.id,
            entry.index,
          ),
          kind: 'malformed_module_reference',
          title: 'Malformed module reference',
          examId: examSnap.id,
          moduleId: null,
          moduleNumber: null,
          slotIndex: entry.index,
          questionNumber: null,
          questionId: null,
          sourceQuestionId: null,
          questionPreview: reason,
          severity: 'critical',
          status: 'manual_review',
          deterministicIssues: [
            {
              code: 'malformed_module_reference',
              severity: 'critical',
              evidence: reason,
              repairInstruction:
                'Replace the malformed reference with the intended module document ID.',
            },
          ],
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      });
  }
  if (isFullExamScope) {
    const moduleNumbers = selectedModuleSnaps
      .filter(snapshot => snapshot?.exists)
      .map(snapshot => Number(snapshot.data()?.moduleNumber));
    const moduleNumberCounts = moduleNumbers.reduce(
      (counts, moduleNumber) => {
        if (Number.isInteger(moduleNumber)) {
          counts.set(
            moduleNumber,
            (counts.get(moduleNumber) || 0) + 1,
          );
        }
        return counts;
      },
      new Map(),
    );
    [1, 2, 3, 4].forEach(moduleNumber => {
      if (moduleNumberCounts.get(moduleNumber) === 1) return;
      const missing =
        !moduleNumberCounts.has(moduleNumber);
      const reason = missing
        ? `The full-length exam has no canonical module ${moduleNumber}.`
        : `The full-length exam has more than one module numbered ${moduleNumber}.`;
      items.push({
        id: createItemId(
          missing
            ? 'missing_canonical_module'
            : 'duplicate_module_number',
          examSnap.id,
          moduleNumber,
        ),
        kind: missing
          ? 'missing_canonical_module'
          : 'duplicate_module_number',
        title: missing
          ? `Missing canonical module ${moduleNumber}`
          : `Duplicate module number ${moduleNumber}`,
        examId: examSnap.id,
        moduleId: null,
        moduleNumber,
        slotIndex: null,
        questionNumber: null,
        questionId: null,
        sourceQuestionId: null,
        questionPreview: reason,
        severity: 'critical',
        status: 'manual_review',
        deterministicIssues: [
          {
            code: missing
              ? 'missing_canonical_module'
              : 'duplicate_module_number',
            severity: 'critical',
            evidence: reason,
            repairInstruction:
              'Restore the intended canonical module structure before this exam can pass quality control.',
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });
  }

  for (let modulePosition = 0; modulePosition < selectedModuleIds.length; modulePosition += 1) {
    const moduleId = selectedModuleIds[modulePosition];
    const moduleSnap = selectedModuleSnaps[modulePosition];

    if (!moduleSnap?.exists) {
      const itemId = createItemId(
        'missing_module',
        moduleId,
        modulePosition,
      );
      items.push({
        id: itemId,
        kind: 'missing_module',
        title: 'Missing module document',
        examId: examSnap.id,
        moduleId,
        moduleNumber: null,
        slotIndex: null,
        questionNumber: null,
        questionId: null,
        sourceQuestionId: null,
        questionPreview: '',
        severity: 'critical',
        status: 'manual_review',
        deterministicIssues: [
          {
            code: 'missing_module',
            severity: 'critical',
            message:
              'The practice exam references a module document that does not exist.',
            repairInstruction:
              'Restore the intended module or remove the reference after human review.',
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      moduleSummaries.push({
        id: moduleId,
        title: 'Missing module',
        moduleNumber: null,
        exists: false,
        expectedQuestionCount: null,
        questionIdsLength: 0,
        resolvedQuestionCount: 0,
        missingQuestionCount: 0,
      });
      manifest.modules.push({ id: moduleId, exists: false });
      continue;
    }

    const module = moduleSnap.data();
    const moduleNumber = Number(module.moduleNumber);
    const questionEntries = getReferenceEntries(
      module.questionIds,
    );
    const questionIds = questionEntries.map(
      entry => entry.id,
    );
    const moduleQuestionIdsHash = createContentHash(questionIds);
    const resolvedQuestionIds = questionEntries
      .filter(
        entry =>
          entry.valid &&
          questionById.get(entry.id)?.exists,
      )
      .map(
        entry => entry.id,
    );
    const structure = inspectModuleStructure(
      { ...module, moduleNumber },
      resolvedQuestionIds,
    );
    const expectedCount =
      getExpectedQuestionCount(moduleNumber) || questionIds.length;
    const seenQuestionIds = new Set();
    const moduleQuestionSnaps = questionEntries.map(entry =>
      entry.valid
        ? questionById.get(entry.id)
        : null,
    );
    const moduleProfile = buildModuleProfile(moduleQuestionSnaps);

    moduleSummaries.push({
      id: moduleSnap.id,
      title: module.title || `Module ${moduleNumber}`,
      moduleNumber,
      exists: true,
      expectedQuestionCount: expectedCount,
      questionCount: module.questionCount ?? null,
      questionIdsLength: questionIds.length,
      resolvedQuestionCount: resolvedQuestionIds.length,
      missingQuestionCount:
        Math.max(0, expectedCount - resolvedQuestionIds.length),
      issues: structure.issues,
    });
    manifest.modules.push({
      id: moduleSnap.id,
      data: module,
      questionHashes: questionIds.map(questionId => {
        const snapshot = isValidDocumentId(questionId)
          ? questionById.get(questionId)
          : null;
        return {
          id: questionId,
          exists: Boolean(snapshot?.exists),
          hash: snapshot?.exists
            ? createContentHash(snapshot.data())
            : null,
        };
      }),
    });

    if (
      Number.isInteger(module.questionCount) &&
      module.questionCount !== questionIds.length
    ) {
      const itemId = createItemId(
        'module_metadata',
        moduleId,
        -1,
        'questionCount',
      );
      items.push({
        id: itemId,
        kind: 'module_metadata',
        title: 'Declared module count is out of sync',
        examId: examSnap.id,
        moduleId,
        moduleNumber,
        slotIndex: null,
        questionNumber: null,
        questionId: null,
        sourceQuestionId: null,
        sourceModuleQuestionIds: questionIds,
        moduleQuestionIdsHash,
        questionPreview: `${module.title || `Module ${moduleNumber}`} declares ${module.questionCount} questions but contains ${questionIds.length} references.`,
        severity: 'medium',
        status: 'needs_repair',
        deterministicIssues: structure.issues.filter(
          issue => issue.code === 'declared_count_mismatch',
        ),
        analysis: {
          outcome: 'needs_repair',
          recommendedAction: 'edit',
          severity: 'medium',
          summary:
            'Synchronize the module questionCount metadata after verified content repairs.',
          repairSpecification: {
            preserve: ['Every module question reference'],
            change: ['questionCount metadata only'],
            targetSkill: 'not applicable',
            targetDifficulty: 'medium',
            visualRequired: false,
            visualRequirements: '',
          },
        },
        moduleProfile,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    if (questionIds.length > expectedCount) {
      const itemId = createItemId(
        'overfull_module',
        moduleId,
        expectedCount,
      );
      items.push({
        id: itemId,
        kind: 'overfull_module',
        title: 'Module exceeds the official blueprint',
        examId: examSnap.id,
        moduleId,
        moduleNumber,
        slotIndex: expectedCount,
        questionNumber: expectedCount + 1,
        questionId: questionIds[expectedCount] || null,
        sourceQuestionId: questionIds[expectedCount] || null,
        sourceModuleQuestionIds: questionIds,
        moduleQuestionIdsHash,
        questionPreview: `${questionIds.length} stored slots exceed the ${expectedCount}-question blueprint.`,
        severity: 'high',
        status: 'manual_review',
        deterministicIssues: structure.issues.filter(
          issue => issue.code === 'module_question_count_mismatch',
        ),
        moduleProfile,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    for (let slotIndex = 0; slotIndex < questionIds.length; slotIndex += 1) {
      const questionId = questionIds[slotIndex];
      const questionEntry = questionEntries[slotIndex];
      const questionSnap = questionEntry.valid
        ? questionById.get(questionId)
        : null;
      const questionNumber = slotIndex + 1;
      const isDuplicate =
        questionEntry.valid &&
        seenQuestionIds.has(questionId);
      if (questionEntry.valid) {
        seenQuestionIds.add(questionId);
      }

      if (
        !questionEntry.valid ||
        !questionSnap?.exists ||
        isDuplicate
      ) {
        const kind = isDuplicate
          ? 'duplicate_question'
          : questionEntry.valid
            ? 'missing_question'
            : 'malformed_question_reference';
        const reason = isDuplicate
          ? `Question ${questionId} is duplicated at module slot ${questionNumber}.`
          : questionEntry.valid
            ? `Module slot ${questionNumber} points to missing question document ${questionId}.`
            : `Module slot ${questionNumber} contains a malformed question reference.`;
        const itemId = createItemId(
          kind,
          moduleId,
          slotIndex,
          questionId,
        );
        items.push({
          id: itemId,
          kind,
          title: isDuplicate
            ? 'Duplicate question slot'
            : 'Missing question document',
          examId: examSnap.id,
          moduleId,
          moduleNumber,
          slotIndex,
          questionNumber,
          questionId:
            questionEntry.valid
              ? questionId
              : null,
          sourceQuestionId:
            questionEntry.valid
              ? questionId
              : null,
          sourceSlotReference: questionId,
          sourceQuestion: questionSnap?.exists
            ? questionSnap.data()
            : null,
          sourceQuestionHash: questionSnap?.exists
            ? createContentHash(questionSnap.data())
            : null,
          sourceModuleQuestionIds: questionIds,
          moduleQuestionIdsHash,
          sharedReferenceCount:
            referenceCounts.get(questionId) || 0,
          questionPreview: questionSnap?.exists
            ? getQuestionPreview(questionSnap.data())
            : '',
          severity: 'critical',
          status: 'needs_repair',
          deterministicIssues: [
            {
              code: kind,
              severity: 'critical',
              message: reason,
              repairInstruction:
                'Create and independently verify an original exam-scoped replacement at this exact slot.',
            },
          ],
          analysis: createMissingAnalysis({
            moduleNumber,
            reason,
            targetDifficulty:
              questionSnap?.exists
                ? String(questionSnap.data().difficulty || 'medium')
                : 'medium',
            targetSkill:
              questionSnap?.exists
                ? String(
                    questionSnap.data().subcategory ||
                      questionSnap.data().subCategory ||
                      'balanced module gap',
                  )
                : 'balanced module gap',
          }),
          moduleProfile,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        continue;
      }

      const question = questionSnap.data();
      const deterministic = inspectQuestionDeterministically(question, {
        moduleNumber,
      });
      const itemId = createItemId(
        'question_quality',
        moduleId,
        slotIndex,
        questionId,
      );
      items.push({
        id: itemId,
        kind: 'question_quality',
        title: `Question ${questionNumber} quality audit`,
        examId: examSnap.id,
        moduleId,
        moduleNumber,
        slotIndex,
        questionNumber,
        questionId,
        sourceQuestionId: questionId,
        sourceQuestion: question,
        sourceQuestionHash: createContentHash(question),
        sourceModuleQuestionIds: questionIds,
        moduleQuestionIdsHash,
        sharedReferenceCount: referenceCounts.get(questionId) || 0,
        questionPreview: getQuestionPreview(question),
        severity: highestSeverity(deterministic.issues),
        status: 'queued',
        deterministicIssues: deterministic.issues,
        deterministicResult: deterministic,
        moduleProfile,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    for (
      let slotIndex = questionIds.length;
      slotIndex < expectedCount;
      slotIndex += 1
    ) {
      const questionNumber = slotIndex + 1;
      const reason = `Module ${moduleNumber} has no question reference at required slot ${questionNumber}.`;
      const itemId = createItemId(
        'missing_question',
        moduleId,
        slotIndex,
        'empty-slot',
      );
      items.push({
        id: itemId,
        kind: 'missing_question',
        title: 'Missing question slot',
        examId: examSnap.id,
        moduleId,
        moduleNumber,
        slotIndex,
        questionNumber,
        questionId: null,
        sourceQuestionId: null,
        sourceQuestion: null,
        sourceQuestionHash: null,
        sourceModuleQuestionIds: questionIds,
        moduleQuestionIdsHash,
        sharedReferenceCount: 0,
        questionPreview: '',
        severity: 'critical',
        status: 'needs_repair',
        deterministicIssues: [
          {
            code: 'missing_question_slot',
            severity: 'critical',
            message: reason,
            repairInstruction:
              'Create and independently verify an original question before appending it at this exact slot.',
          },
        ],
        analysis: createMissingAnalysis({
          moduleNumber,
          reason,
        }),
        moduleProfile,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }

  return {
    exam: { id: examSnap.id, ...exam },
    selectedModuleIds,
    scopeComplete:
      examModuleIds.length === 4 &&
      selectedModuleIds.length === examModuleIds.length &&
      selectedModuleIds.every(moduleId => examModuleIds.includes(moduleId)) &&
      selectedModuleSnaps.every(snapshot => snapshot?.exists) &&
      new Set(
        selectedModuleSnaps.map(snapshot =>
          Number(snapshot.data()?.moduleNumber),
        ),
      ).size === 4 &&
      [1, 2, 3, 4].every(moduleNumber =>
        selectedModuleSnaps.some(
          snapshot =>
            snapshot?.exists &&
            Number(snapshot.data()?.moduleNumber) === moduleNumber,
        ),
      ),
    moduleSummaries,
    items,
    sourceManifestHash: createContentHash(manifest),
  };
}

function enforceAuditGate(
  analysis,
  deterministicIssues,
  { questionType = 'multiple-choice' } = {},
) {
  const gated = {
    ...analysis,
    scores: { ...analysis.scores },
    issues: Array.isArray(analysis.issues)
      ? analysis.issues.slice()
      : [],
  };
  const deterministicSeverity = highestSeverity(deterministicIssues);
  const answerRequiresRepair =
    !gated.answerValidation?.singleCorrectAnswer ||
    !gated.answerValidation?.matchesStoredKey;
  const scoreRequiresRepair =
    Number(gated.scores?.overall || 0) < 90 ||
    Number(gated.scores?.contentAccuracy || 0) < 95 ||
    Number(gated.scores?.officialStyle || 0) < 90 ||
    Number(gated.scores?.answerDeterminacy || 0) < 95 ||
    Number(gated.scores?.stemQuality || 0) < 90 ||
    Number(gated.scores?.difficultyCalibration || 0) < 80 ||
    Number(gated.scores?.visualIntegrity || 0) < 90 ||
    (questionType === 'multiple-choice' &&
      Number(gated.scores?.distractorQuality || 0) < 85);
  const deterministicRequiresRepair = ['high', 'critical'].includes(
    deterministicSeverity,
  );
  const confidenceRequiresReview =
    gated.confidence === 'low';

  if (gated.outcome === 'pass' && confidenceRequiresReview) {
    gated.outcome = 'manual_review';
    gated.summary = `${gated.summary} The server publication gate requires human review because the audit confidence is low.`;
  }

  if (
    gated.outcome === 'pass' &&
    (
      answerRequiresRepair ||
      scoreRequiresRepair ||
      deterministicRequiresRepair
    )
  ) {
    gated.outcome = 'needs_repair';
    if (gated.recommendedAction === 'none') {
      gated.recommendedAction = deterministicIssues.some(
        issue => issue.code === 'missing_required_visual',
      )
        ? 'add_graph'
        : 'rewrite';
    }
    gated.summary = `${gated.summary} The server publication gate requires repair because one or more mandatory score or deterministic thresholds were not met.`;
  }

  gated.severity = highestSeverity([
    { severity: gated.severity },
    { severity: deterministicSeverity },
    {
      severity: answerRequiresRepair
        ? 'critical'
        : scoreRequiresRepair
          ? 'high'
          : 'info',
    },
  ]);
  return gated;
}

async function mapWithConcurrency(values, concurrency, worker) {
  let nextIndex = 0;
  const runners = Array.from(
    { length: Math.min(concurrency, values.length) },
    async () => {
      while (nextIndex < values.length) {
        const currentIndex = nextIndex;
        nextIndex += 1;
        await worker(values[currentIndex], currentIndex);
      }
    },
  );
  await Promise.all(runners);
}

async function finalizeRunSummary(runRef, {
  status,
  phase,
  scopeComplete,
} = {}) {
  const items = await fetchRunItems(runRef);
  const summary = summarizeRunItems(items);
  if (!scopeComplete) summary.publishReady = false;
  await runRef.set(
    {
      status,
      phase,
      summary,
      progress: {
        total: items.length,
        completed: items.filter(
          item => !['queued', 'auditing', 'repairing'].includes(item.status),
        ).length,
        failed: items.filter(
          item =>
            item.status === 'failed' ||
            item.status === 'repair_blocked',
        ).length,
      },
      updatedAt: new Date(),
      completedAt:
        status === 'awaiting_approval' ||
        status.startsWith('repair_completed')
          ? new Date()
          : null,
    },
    { merge: true },
  );
  return { items, summary };
}

async function stampExamQualityControl({
  db,
  runRef,
  summary,
  workerType = null,
  leaseToken = null,
  adoptCurrentManifest = false,
}) {
  let result = null;
  await db.runTransaction(async transaction => {
    const runSnap = workerType
      ? await assertWorkerLeaseInTransaction(
          transaction,
          runRef,
          workerType,
          leaseToken,
        )
      : await transaction.get(runRef);
    if (!runSnap.exists) {
      throw new Error('Exam quality-control run not found');
    }
    const currentRun = runSnap.data();
    const currentManifest =
      await readCanonicalContentManifest({
        db,
        examId: currentRun.examId,
        selectedModuleIds:
          currentRun.selectedModuleIds || [],
        transaction,
      });
    const expectedManifestHash =
      adoptCurrentManifest
        ? currentManifest.hash
        : (
            currentRun.contentManifestHash ||
            currentRun.sourceManifestHash
          );
    const manifestMatches =
      !expectedManifestHash ||
      currentManifest.hash === expectedManifestHash;
    const stampedSummary = {
      ...summary,
      publishReady:
        Boolean(summary.publishReady) &&
        manifestMatches,
    };
    const auditFingerprint = createContentHash({
      contentManifestHash: currentManifest.hash,
      referenceVersionHash:
        currentRun.referenceVersionHash,
      model: currentRun.model,
      reasoningEffort:
        currentRun.reasoningEffort,
      reasoningMode: currentRun.reasoningMode,
      promptVersion: currentRun.promptVersion,
      policyVersion: currentRun.policyVersion,
    });
    transaction.set(
      currentManifest.examRef,
      {
        qualityControl: {
          status: stampedSummary.publishReady
            ? 'passed'
            : 'incomplete',
          runId: runRef.id,
          model: currentRun.model,
          reasoningEffort:
            currentRun.reasoningEffort,
          reasoningMode: currentRun.reasoningMode,
          selectedModuleIds:
            currentRun.selectedModuleIds || [],
          sourceManifestHash:
            currentRun.sourceManifestHash,
          finalManifestHash: currentManifest.hash,
          referenceVersionHash:
            currentRun.referenceVersionHash,
          promptVersion: currentRun.promptVersion,
          policyVersion: currentRun.policyVersion,
          auditFingerprint,
          summary: stampedSummary,
          checkedAt: new Date(),
        },
        updatedAt: new Date(),
      },
      { merge: true },
    );
    transaction.set(
      runRef,
      {
        summary: stampedSummary,
        finalManifestHash: currentManifest.hash,
        ...(adoptCurrentManifest
          ? {
              contentManifestHash:
                currentManifest.hash,
            }
          : {}),
        contentDriftDetected: !manifestMatches,
        auditFingerprint,
        updatedAt: new Date(),
      },
      { merge: true },
    );
    result = {
      summary: stampedSummary,
      manifestHash: currentManifest.hash,
      manifestMatches,
      auditFingerprint,
    };
  });
  return result;
}

async function processAuditItem({
  db,
  runRef,
  run,
  item,
  openai,
  leaseToken,
}) {
  const itemRef = runRef.collection('items').doc(item.id);
  await itemRef.set(
    { status: 'auditing', updatedAt: new Date() },
    { merge: true },
  );

  try {
    const result = await runQuestionAudit({
      client: openai,
      question: item.sourceQuestion,
      moduleNumber: item.moduleNumber,
      questionNumber: item.questionNumber,
      deterministicIssues: item.deterministicIssues || [],
      vectorStoreId: run.referenceVectorStoreId,
      model: run.model,
      reasoningEffort: run.reasoningEffort,
      reasoningMode: run.reasoningMode,
    });
    const analysis = enforceAuditGate(
      result.parsed,
      item.deterministicIssues || [],
      { questionType: inferQuestionType(item.sourceQuestion) },
    );
    const analysisRef = itemRef.collection('analyses').doc();
    const status =
      analysis.outcome === 'pass'
        ? 'passed'
        : analysis.outcome === 'manual_review'
          ? 'manual_review'
          : 'needs_repair';
    const analysisData = {
      result: analysis,
      model: result.model || run.model,
      reasoningEffort: run.reasoningEffort,
      reasoningMode: run.reasoningMode,
      responseId: result.responseId,
      usage: result.usage,
      blindVerification: result.blindVerification,
      referenceEvidence: result.referenceEvidence,
      referenceEvidenceHash: result.referenceEvidenceHash,
      promptVersion: run.promptVersion,
      createdAt: new Date(),
    };

    await db.runTransaction(async transaction => {
      await assertWorkerLeaseInTransaction(
        transaction,
        runRef,
        'audit',
        leaseToken,
      );
      transaction.set(analysisRef, analysisData);
      transaction.set(
        itemRef,
        {
          analysis,
          latestAnalysisId: analysisRef.id,
          status,
          severity: analysis.severity,
          updatedAt: new Date(),
          auditError: null,
        },
        { merge: true },
      );
    });
    return { success: true };
  } catch (error) {
    if (error.code === 'WORKER_LEASE_LOST') throw error;
    await db.runTransaction(async transaction => {
      await assertWorkerLeaseInTransaction(
        transaction,
        runRef,
        'audit',
        leaseToken,
      );
      transaction.set(
        itemRef,
        {
          status: 'failed',
          severity: 'high',
          auditError: error.message || 'Question audit failed',
          updatedAt: new Date(),
        },
        { merge: true },
      );
    });
    return { success: false, error };
  }
}

async function runAuditWorker({
  db,
  runId,
  openai,
}) {
  if (activeJobs.has(runId)) return activeJobs.get(runId);

  const promise = (async () => {
    const lease = await acquireWorkerLease(db, runId, {
      type: 'audit',
    });
    if (!lease.acquired) return;
    const heartbeat = startWorkerHeartbeat(
      db,
      runId,
      'audit',
      lease.token,
    );

    try {
      const { runRef, run } = await fetchRunOrThrow(db, runId);
      const items = await fetchRunItems(runRef);
      const pendingItems = items.filter(
        item =>
          item.kind === 'question_quality' &&
          ['queued', 'failed', 'auditing'].includes(
            item.status,
          ),
      );

      await addRunEvent(runRef, 'audit_started', {
        pendingItemCount: pendingItems.length,
        concurrency: DEFAULT_AUDIT_CONCURRENCY,
        workerInstanceId: WORKER_INSTANCE_ID,
      });
      await runRef.set(
        {
          status: 'auditing',
          phase: 'audit',
          progress: {
            total: items.length,
            completed: items.length - pendingItems.length,
            failed: 0,
          },
          updatedAt: new Date(),
        },
        { merge: true },
      );

      let processedCount = 0;
      let failedCount = 0;
      let consecutiveFailures = 0;
      let circuitError = null;
      await mapWithConcurrency(
        pendingItems,
        DEFAULT_AUDIT_CONCURRENCY,
        async item => {
          heartbeat.assertOwned();
          if (circuitError) return;
          const result = await processAuditItem({
            db,
            runRef,
            run,
            item,
            openai,
            leaseToken: lease.token,
          });
          processedCount += 1;
          if (result.success) {
            consecutiveFailures = 0;
          } else {
            failedCount += 1;
            consecutiveFailures += 1;
            if (consecutiveFailures >= 3) {
              circuitError = new Error(
                'The audit stopped after three consecutive question failures. Check the model, reference corpus, and API configuration before resuming.',
              );
            }
          }
          await runRef.set(
            {
              progress: {
                total: items.length,
                completed:
                  items.length -
                  pendingItems.length +
                  processedCount,
                failed: failedCount,
              },
              updatedAt: new Date(),
            },
            { merge: true },
          );
        },
      );
      if (circuitError) throw circuitError;

      const final = await finalizeRunSummary(runRef, {
        status:
          failedCount > 0
            ? 'audit_completed_with_failures'
            : 'awaiting_approval',
        phase: 'audit',
        scopeComplete: run.scopeComplete,
      });
      const stamp = await stampExamQualityControl({
        db,
        runRef,
        summary: final.summary,
        workerType: 'audit',
        leaseToken: lease.token,
      });
      await addRunEvent(runRef, 'audit_completed', {
        summary: stamp.summary,
        failedCount,
        finalManifestHash: stamp.manifestHash,
      });
    } finally {
      await heartbeat.stop();
    }
  })()
    .catch(async error => {
      if (error.code === 'WORKER_LEASE_LOST') {
        console.warn(
          '[ExamQualityControl] Audit worker stopped after losing its lease.',
        );
        return;
      }
      try {
        const { runRef } = await fetchRunOrThrow(db, runId);
        await runRef.set(
          {
            status: 'failed',
            lastError: error.message,
            updatedAt: new Date(),
          },
          { merge: true },
        );
        await addRunEvent(runRef, 'audit_failed', {
          error: error.message,
        });
      } catch {}
    })
    .finally(() => {
      activeJobs.delete(runId);
    });

  activeJobs.set(runId, promise);
  return promise;
}

async function renderCandidateVisual(question) {
  const visualSpec = question.visualSpec;
  if (!visualSpec || visualSpec.type === 'none') {
    return {
      svg: null,
      png: null,
      dataUrl: null,
      contentHash: null,
    };
  }

  const svg = renderVisualSpecToSvg(visualSpec);
  const sharp = require('sharp');
  const png = await sharp(Buffer.from(svg, 'utf8')).png().toBuffer();
  return {
    svg,
    png,
    dataUrl: `data:image/png;base64,${png.toString('base64')}`,
    contentHash: crypto.createHash('sha256').update(png).digest('hex'),
  };
}

async function uploadGraphAsset({
  firebaseAdmin,
  runId,
  itemId,
  visual,
}) {
  if (!visual.png) return null;
  const bucket = firebaseAdmin.storage().bucket();
  const destination = `exam-quality-artifacts/${runId}/${itemId}/${visual.contentHash}.png`;
  const file = bucket.file(destination);
  await file.save(visual.png, {
    resumable: false,
    contentType: 'image/png',
    metadata: {
      cacheControl: 'public,max-age=31536000,immutable',
      metadata: {
        runId,
        itemId,
        contentHash: visual.contentHash,
      },
    },
  });
  await file.makePublic();
  return {
    storagePath: destination,
    graphUrl: encodeURI(
      `https://storage.googleapis.com/${bucket.name}/${destination}`,
    ),
    contentHash: visual.contentHash,
    contentType: 'image/png',
  };
}

async function getCurrentModuleProfile(db, moduleId) {
  const moduleSnap = await db.collection('examModules').doc(moduleId).get();
  if (!moduleSnap.exists) return {};
  const questionIds = Array.isArray(moduleSnap.data().questionIds)
    ? moduleSnap.data().questionIds.map(String)
    : [];
  const questionSnaps = await getDocumentsByRefs(
    db,
    questionIds.map(questionId =>
      db.collection('questions').doc(questionId),
    ),
  );
  return buildModuleProfile(questionSnaps);
}

async function applyModuleMetadataRepair({
  db,
  runRef,
  run,
  item,
  approvalId,
}) {
  const itemRef = runRef.collection('items').doc(item.id);
  const attemptRef = runRef.collection('applyAttempts').doc();
  const moduleRef = db.collection('examModules').doc(item.moduleId);
  const versionRef = moduleRef.collection('versions').doc();

  await db.runTransaction(async transaction => {
    const moduleSnap = await transaction.get(moduleRef);
    if (!moduleSnap.exists) {
      throw new Error('Module no longer exists');
    }
    const before = moduleSnap.data();
    const questionIds = Array.isArray(before.questionIds)
      ? before.questionIds.map(String)
      : [];

    transaction.set(versionRef, {
      runId: runRef.id,
      itemId: item.id,
      reason: 'exam-quality-control-metadata-repair',
      before: {
        questionCount: before.questionCount ?? null,
        questionIds,
      },
      after: {
        questionCount: questionIds.length,
        questionIds,
      },
      createdAt: new Date(),
    });
    transaction.update(moduleRef, {
      questionCount: questionIds.length,
      updatedAt: new Date(),
    });
    transaction.set(attemptRef, {
      itemId: item.id,
      approvalId,
      status: 'applied',
      kind: item.kind,
      before: { questionCount: before.questionCount ?? null },
      after: { questionCount: questionIds.length },
      createdAt: new Date(),
    });
    transaction.set(
      itemRef,
      {
        status: 'repaired',
        repair: {
          status: 'applied',
          approvalId,
          before: { questionCount: before.questionCount ?? null },
          after: { questionCount: questionIds.length },
          verification: {
            eligible: true,
            blockers: [],
            summary: 'Deterministic metadata-only repair.',
          },
          appliedAt: new Date(),
          applyAttemptId: attemptRef.id,
          moduleVersionId: versionRef.id,
        },
        updatedAt: new Date(),
      },
      { merge: true },
    );
  });
}

async function applyQuestionReplacement({
  db,
  firebaseAdmin,
  runRef,
  run,
  item,
  approvalId,
  candidate,
  verification,
  editorialReview,
  proposalId,
  visual,
}) {
  const itemRef = runRef.collection('items').doc(item.id);
  const attemptRef = runRef.collection('applyAttempts').doc();
  const moduleRef = db.collection('examModules').doc(item.moduleId);
  const replacementRef = db.collection('questions').doc();
  const versionRef = moduleRef.collection('versions').doc();
  const graphAsset = await uploadGraphAsset({
    firebaseAdmin,
    runId: runRef.id,
    itemId: item.id,
    visual,
  });
  const replacementQuestion = stripUndefined({
    ...candidate,
    graphUrl: graphAsset?.graphUrl || candidate.graphUrl || null,
    generatedGraph: Boolean(graphAsset),
    graphGenerationType: graphAsset
      ? 'exam-quality-deterministic-renderer'
      : null,
    source: 'ai-exam-quality-repair',
    usageContext: 'exam',
    examId: run.examId,
    originalExam: run.examTitle,
    originalModuleNumber: item.moduleNumber,
    originalQuestionNumber: item.questionNumber,
    qualityControl: {
      runId: runRef.id,
      itemId: item.id,
      approvalId,
      proposalId,
      model: run.model,
      reasoningEffort: run.reasoningEffort,
      promptVersion: run.promptVersion,
      policyVersion: run.policyVersion,
      sourceQuestionId: item.sourceQuestionId || null,
      independentlyVerified: true,
      verificationResponseId:
        verification.responseId || null,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  await db.runTransaction(async transaction => {
    const moduleSnap = await transaction.get(moduleRef);
    if (!moduleSnap.exists) {
      throw new Error('Module no longer exists');
    }

    const beforeModule = moduleSnap.data();
    const beforeQuestionIds = Array.isArray(beforeModule.questionIds)
      ? beforeModule.questionIds.map(String)
      : [];
    const slotIndex = Number(item.slotIndex);
    if (!Number.isInteger(slotIndex) || slotIndex < 0) {
      throw new Error('Repair item has an invalid module slot');
    }

    if (slotIndex < beforeQuestionIds.length) {
      if (
        beforeQuestionIds[slotIndex] !==
        String(item.sourceQuestionId || '')
      ) {
        throw new Error(
          'The module slot changed after the audit; rerun quality control before applying.',
        );
      }
    } else if (
      slotIndex !== beforeQuestionIds.length ||
      item.sourceQuestionId
    ) {
      throw new Error(
        'The module structure changed after the audit; rerun quality control before applying.',
      );
    }

    if (item.sourceQuestionId && item.sourceQuestionHash) {
      const sourceRef = db
        .collection('questions')
        .doc(item.sourceQuestionId);
      const sourceSnap = await transaction.get(sourceRef);
      if (
        !sourceSnap.exists ||
        createContentHash(sourceSnap.data()) !== item.sourceQuestionHash
      ) {
        throw new Error(
          'The source question changed after the audit; rerun quality control before applying.',
        );
      }
    }

    const afterQuestionIds = beforeQuestionIds.slice();
    if (slotIndex === afterQuestionIds.length) {
      afterQuestionIds.push(replacementRef.id);
    } else {
      afterQuestionIds[slotIndex] = replacementRef.id;
    }

    transaction.set(replacementRef, replacementQuestion);
    transaction.set(versionRef, {
      runId: runRef.id,
      itemId: item.id,
      reason: 'exam-quality-control-question-replacement',
      before: {
        questionIds: beforeQuestionIds,
        questionCount: beforeModule.questionCount ?? null,
      },
      after: {
        questionIds: afterQuestionIds,
        questionCount: afterQuestionIds.length,
      },
      createdAt: new Date(),
    });
    transaction.update(moduleRef, {
      questionIds: afterQuestionIds,
      questionCount: afterQuestionIds.length,
      updatedAt: new Date(),
    });
    transaction.set(attemptRef, {
      itemId: item.id,
      approvalId,
      proposalId,
      status: 'applied',
      kind: item.kind,
      sourceQuestionId: item.sourceQuestionId || null,
      replacementQuestionId: replacementRef.id,
      slotIndex,
      graphAsset,
      createdAt: new Date(),
    });
    transaction.set(
      itemRef,
      {
        status: 'repaired',
        repair: {
          status: 'applied',
          approvalId,
          proposalId,
          before: item.sourceQuestion || null,
          beforeQuestionId: item.sourceQuestionId || null,
          after: replacementQuestion,
          replacementQuestionId: replacementRef.id,
          graphAsset,
          verification: {
            eligible: true,
            blockers: [],
            result: verification.parsed,
            responseId: verification.responseId,
            usage: verification.usage,
            editorialResult: editorialReview.parsed,
            editorialResponseId:
              editorialReview.responseId,
            editorialUsage: editorialReview.usage,
          },
          appliedAt: new Date(),
          applyAttemptId: attemptRef.id,
          moduleVersionId: versionRef.id,
        },
        updatedAt: new Date(),
      },
      { merge: true },
    );
  });

  if (graphAsset) {
    try {
      await itemRef.collection('artifacts').doc().set({
        ...graphAsset,
        type: 'question-visual',
        createdAt: new Date(),
      });
    } catch (error) {
      console.error(
        '[ExamQualityControl] Replacement was applied, but the redundant artifact log could not be written:',
        error,
      );
      await itemRef.set(
        {
          artifactLogError:
            error.message || 'Artifact log write failed after application',
          updatedAt: new Date(),
        },
        { merge: true },
      ).catch(() => {});
    }
  }
}

function buildReplacementQuestionRecord({
  candidate,
  graphAsset,
  run,
  item,
  approvalId,
  proposalId,
  verification,
  editorialReview,
  timestamp = new Date(),
}) {
  return stripUndefined({
    ...candidate,
    graphUrl:
      graphAsset?.graphUrl || candidate.graphUrl || null,
    generatedGraph: Boolean(graphAsset),
    graphGenerationType: graphAsset
      ? 'exam-quality-deterministic-renderer'
      : candidate.graphGenerationType || null,
    source: 'ai-exam-quality-repair',
    usageContext: 'exam',
    examId: run.examId,
    originalExam: run.examTitle,
    originalModuleNumber: item.moduleNumber,
    originalQuestionNumber: item.questionNumber,
    qualityControl: {
      runId: run.id,
      itemId: item.id,
      approvalId,
      proposalId,
      model: run.model,
      reasoningEffort: run.reasoningEffort,
      reasoningMode: run.reasoningMode,
      promptVersion: run.promptVersion,
      policyVersion: run.policyVersion,
      sourceQuestionId: item.sourceQuestionId || null,
      independentlyVerified: true,
      verificationResponseId:
        verification?.responseId || null,
      editorialResponseId:
        editorialReview?.responseId || null,
    },
    createdAt: timestamp,
    updatedAt: timestamp,
  });
}

async function deleteUploadedGraphAssets(
  firebaseAdmin,
  graphAssets,
) {
  const bucket = firebaseAdmin.storage().bucket();
  await Promise.all(
    graphAssets
      .filter(asset => asset?.storagePath)
      .map(asset =>
        bucket
          .file(asset.storagePath)
          .delete({ ignoreNotFound: true })
          .catch(() => {}),
      ),
  );
}

async function applyPreparedRepairBatch({
  db,
  firebaseAdmin,
  runRef,
  run,
  approvalId,
  preparedRepairs,
  allRunItems,
  leaseToken,
}) {
  if (!preparedRepairs.length) return null;

  const preparedWithAssets = [];
  const uploadedAssets = [];
  try {
    for (const prepared of preparedRepairs) {
      const graphAsset =
        prepared.kind === 'module_metadata'
          ? null
          : await uploadGraphAsset({
              firebaseAdmin,
              runId: runRef.id,
              itemId: prepared.item.id,
              visual: prepared.visual,
            });
      if (graphAsset) uploadedAssets.push(graphAsset);
      preparedWithAssets.push({
        ...prepared,
        graphAsset,
      });
    }
  } catch (error) {
    await deleteUploadedGraphAssets(
      firebaseAdmin,
      uploadedAssets,
    );
    throw error;
  }

  const repairsByModule = new Map();
  preparedWithAssets.forEach(prepared => {
    const moduleId = prepared.item.moduleId;
    if (!repairsByModule.has(moduleId)) {
      repairsByModule.set(moduleId, []);
    }
    repairsByModule.get(moduleId).push(prepared);
  });

  const modulePlans = Array.from(repairsByModule.entries()).map(
    ([sourceModuleId, repairs]) => ({
      sourceModuleId,
      sourceRef: db.collection('examModules').doc(sourceModuleId),
      draftRef: db.collection('examModules').doc(),
      versionRef: null,
      repairs: repairs.slice().sort((left, right) => {
        const leftSlot = Number.isInteger(left.item.slotIndex)
          ? left.item.slotIndex
          : Number.MAX_SAFE_INTEGER;
        const rightSlot = Number.isInteger(right.item.slotIndex)
          ? right.item.slotIndex
          : Number.MAX_SAFE_INTEGER;
        return leftSlot - rightSlot;
      }),
    }),
  );
  modulePlans.forEach(plan => {
    plan.versionRef = plan.draftRef
      .collection('versions')
      .doc();
  });

  const questionPlans = preparedWithAssets
    .filter(prepared => prepared.kind !== 'module_metadata')
    .map(prepared => ({
      ...prepared,
      replacementRef: db.collection('questions').doc(),
    }));
  const questionPlanByItemId = new Map(
    questionPlans.map(plan => [plan.item.id, plan]),
  );
  const batchAttemptRef = runRef
    .collection('applyAttempts')
    .doc();
  const examRef = db
    .collection('practiceExams')
    .doc(run.examId);
  const applyTimestamp = new Date();
  let finalManifestHash = null;
  let nextSelectedModuleIds = [];

  try {
    await db.runTransaction(async transaction => {
      await assertWorkerLeaseInTransaction(
        transaction,
        runRef,
        'repair',
        leaseToken,
      );
      const auditedManifest =
        await readCanonicalContentManifest({
          db,
          examId: run.examId,
          selectedModuleIds: run.selectedModuleIds,
          transaction,
        });
      const expectedManifestHash =
        run.contentManifestHash ||
        run.sourceManifestHash;
      if (
        expectedManifestHash &&
        auditedManifest.hash !== expectedManifestHash
      ) {
        const error = new Error(
          'The selected exam content changed after the audited snapshot. Start a new audit before applying repairs.',
        );
        error.code = 'SOURCE_MANIFEST_CHANGED';
        throw error;
      }
      const examSnap = await transaction.get(examRef);
      if (!examSnap.exists) {
        throw new Error('Practice exam no longer exists');
      }
      const currentExam = examSnap.data();
      const currentExamModuleIds = Array.isArray(
        currentExam.moduleIds,
      )
        ? currentExam.moduleIds.map(String)
        : [];

      const moduleSnapshots = await Promise.all(
        modulePlans.map(plan =>
          transaction.get(plan.sourceRef),
        ),
      );
      const sourceQuestionIds = Array.from(
        new Set(
          questionPlans
            .map(plan => plan.item.sourceQuestionId)
            .filter(Boolean),
        ),
      );
      const sourceQuestionRefs = sourceQuestionIds.map(
        questionId =>
          db.collection('questions').doc(questionId),
      );
      const sourceQuestionSnapshots = await Promise.all(
        sourceQuestionRefs.map(ref =>
          transaction.get(ref),
        ),
      );
      const sourceQuestionById = new Map(
        sourceQuestionSnapshots.map(snapshot => [
          snapshot.id,
          snapshot,
        ]),
      );

      modulePlans.forEach((plan, planIndex) => {
        const moduleSnap = moduleSnapshots[planIndex];
        if (!moduleSnap.exists) {
          throw new Error(
            `Module ${plan.sourceModuleId} no longer exists`,
          );
        }
        if (
          !currentExamModuleIds.includes(plan.sourceModuleId)
        ) {
          throw new Error(
            `The exam no longer references audited module ${plan.sourceModuleId}`,
          );
        }

        const sourceModule = moduleSnap.data();
        const firstRepair = plan.repairs[0];
        if (
          Number(sourceModule.moduleNumber) !==
          Number(firstRepair.item.moduleNumber)
        ) {
          throw new Error(
            'The module number changed after the audit',
          );
        }
        const beforeQuestionIds = getReferenceEntries(
          sourceModule.questionIds,
        ).map(entry => entry.id);
        const afterQuestionIds = beforeQuestionIds.slice();

        plan.repairs.forEach(prepared => {
          if (prepared.kind === 'module_metadata') return;
          const questionPlan = questionPlanByItemId.get(
            prepared.item.id,
          );
          const slotIndex = Number(prepared.item.slotIndex);
          if (
            !Number.isInteger(slotIndex) ||
            slotIndex < 0
          ) {
            throw new Error(
              `Repair ${prepared.item.id} has an invalid slot`,
            );
          }

          if (slotIndex < afterQuestionIds.length) {
            if (
              afterQuestionIds[slotIndex] !==
              String(
                prepared.item.sourceSlotReference ??
                  prepared.item.sourceQuestionId ??
                  '',
              )
            ) {
              throw new Error(
                `Module slot ${slotIndex + 1} changed after the audit`,
              );
            }
          } else if (
            slotIndex !== afterQuestionIds.length ||
            prepared.item.sourceQuestionId
          ) {
            throw new Error(
              'The module structure changed after the audit',
            );
          }

          if (
            prepared.item.sourceQuestionId &&
            prepared.item.sourceQuestionHash
          ) {
            const sourceSnapshot = sourceQuestionById.get(
              prepared.item.sourceQuestionId,
            );
            if (
              !sourceSnapshot?.exists ||
              createContentHash(sourceSnapshot.data()) !==
                prepared.item.sourceQuestionHash
            ) {
              throw new Error(
                `Source question ${prepared.item.sourceQuestionId} changed after the audit`,
              );
            }
          }

          if (slotIndex === afterQuestionIds.length) {
            afterQuestionIds.push(
              questionPlan.replacementRef.id,
            );
          } else {
            afterQuestionIds[slotIndex] =
              questionPlan.replacementRef.id;
          }
        });

        plan.beforeQuestionIds = beforeQuestionIds;
        plan.afterQuestionIds = afterQuestionIds;
        plan.sourceModule = sourceModule;
      });

      const moduleIdMap = new Map(
        modulePlans.map(plan => [
          plan.sourceModuleId,
          plan.draftRef.id,
        ]),
      );
      const nextExamModuleIds = currentExamModuleIds.map(
        moduleId => moduleIdMap.get(moduleId) || moduleId,
      );

      questionPlans.forEach(questionPlan => {
        const record = buildReplacementQuestionRecord({
          candidate: questionPlan.candidate,
          graphAsset: questionPlan.graphAsset,
          run: { ...run, id: runRef.id },
          item: questionPlan.item,
          approvalId,
          proposalId: questionPlan.proposalId,
          verification: questionPlan.verification,
          editorialReview:
            questionPlan.editorialReview,
          timestamp: applyTimestamp,
        });
        questionPlan.replacementQuestion = record;
        transaction.set(
          questionPlan.replacementRef,
          record,
        );
      });

      modulePlans.forEach(plan => {
        plan.draftModuleRecord = {
          ...plan.sourceModule,
          questionIds: plan.afterQuestionIds,
          questionCount: plan.afterQuestionIds.length,
          sourceModuleId: plan.sourceModuleId,
          sourceModuleContentHash: createContentHash({
            ...plan.sourceModule,
            questionIds: plan.beforeQuestionIds,
          }),
          qualityControl: {
            runId: runRef.id,
            approvalId,
            immutableDraftSwap: true,
            createdAt: applyTimestamp,
          },
          createdAt: applyTimestamp,
          updatedAt: applyTimestamp,
        };
        transaction.set(
          plan.draftRef,
          plan.draftModuleRecord,
        );
        transaction.set(plan.versionRef, {
          runId: runRef.id,
          approvalId,
          reason:
            'exam-quality-control-atomic-draft-swap',
          sourceModuleId: plan.sourceModuleId,
          before: {
            questionIds: plan.beforeQuestionIds,
            questionCount:
              plan.sourceModule.questionCount ?? null,
          },
          after: {
            questionIds: plan.afterQuestionIds,
            questionCount: plan.afterQuestionIds.length,
          },
          createdAt: applyTimestamp,
        });
      });

      nextSelectedModuleIds = (
        run.selectedModuleIds || []
      ).map(
        moduleId =>
          moduleIdMap.get(moduleId) || moduleId,
      );
      const sourceManifestModuleById = new Map(
        auditedManifest.manifest.modules.map(module => [
          module.id,
          module,
        ]),
      );
      const questionPlanByReplacementId = new Map(
        questionPlans.map(plan => [
          plan.replacementRef.id,
          plan,
        ]),
      );
      const draftPlanById = new Map(
        modulePlans.map(plan => [
          plan.draftRef.id,
          plan,
        ]),
      );
      const finalManifest = {
        examId: run.examId,
        exam: {
          moduleIds: nextExamModuleIds,
        },
        selectedModuleIds: nextSelectedModuleIds,
        modules: nextSelectedModuleIds.map(moduleId => {
          const draftPlan = draftPlanById.get(moduleId);
          if (!draftPlan) {
            const sourceModule =
              sourceManifestModuleById.get(moduleId);
            if (!sourceModule) {
              throw new Error(
                `Manifest source module ${moduleId} is missing`,
              );
            }
            return sourceModule;
          }
          return {
            id: moduleId,
            data: draftPlan.draftModuleRecord,
            questionHashes:
              draftPlan.afterQuestionIds.map(questionId => {
                const questionPlan =
                  questionPlanByReplacementId.get(
                    questionId,
                  );
                if (questionPlan) {
                  return {
                    id: questionId,
                    exists: true,
                    hash: createContentHash(
                      questionPlan.replacementQuestion,
                    ),
                  };
                }
                const sourceQuestion =
                  auditedManifest.questionById.get(
                    questionId,
                  );
                return {
                  id: questionId,
                  exists: Boolean(
                    sourceQuestion?.exists,
                  ),
                  hash: sourceQuestion?.exists
                    ? createContentHash(
                        sourceQuestion.data(),
                      )
                    : null,
                };
              }),
          };
        }),
      };
      finalManifestHash =
        createContentHash(finalManifest);

      allRunItems.forEach(runItem => {
        const nextModuleId = moduleIdMap.get(
          runItem.moduleId,
        );
        if (!nextModuleId) return;
        transaction.set(
          runRef.collection('items').doc(runItem.id),
          {
            moduleId: nextModuleId,
            sourceModuleId:
              runItem.sourceModuleId ||
              runItem.moduleId,
            updatedAt: new Date(),
          },
          { merge: true },
        );
      });

      preparedWithAssets.forEach(prepared => {
        const modulePlan = modulePlans.find(
          plan =>
            plan.sourceModuleId ===
            prepared.item.moduleId,
        );
        const questionPlan = questionPlanByItemId.get(
          prepared.item.id,
        );
        transaction.set(
          runRef.collection('items').doc(prepared.item.id),
          {
            moduleId: modulePlan.draftRef.id,
            sourceModuleId:
              prepared.item.sourceModuleId ||
              prepared.item.moduleId,
            status: 'repaired',
            repair: {
              status: 'applied',
              approvalId,
              proposalId:
                prepared.proposalId || null,
              before:
                prepared.item.sourceQuestion ||
                (
                  prepared.kind === 'module_metadata'
                    ? {
                        questionCount:
                          modulePlan.sourceModule
                            .questionCount ?? null,
                      }
                    : null
                ),
              beforeQuestionId:
                prepared.item.sourceQuestionId || null,
              after:
                questionPlan?.replacementQuestion ||
                {
                  questionCount:
                    modulePlan.afterQuestionIds.length,
                },
              replacementQuestionId:
                questionPlan?.replacementRef.id || null,
              graphAsset:
                prepared.graphAsset || null,
              verification:
                prepared.kind === 'module_metadata'
                  ? {
                      eligible: true,
                      blockers: [],
                      summary:
                        'Deterministic metadata repair applied in the atomic module swap.',
                    }
                  : {
                      eligible: true,
                      blockers: [],
                      result:
                        prepared.verification.parsed,
                      responseId:
                        prepared.verification.responseId,
                      editorialResult:
                        prepared.editorialReview.parsed,
                      editorialResponseId:
                        prepared.editorialReview.responseId,
                    },
              appliedAt: new Date(),
              applyAttemptId: batchAttemptRef.id,
              sourceModuleId:
                modulePlan.sourceModuleId,
              appliedModuleId:
                modulePlan.draftRef.id,
              moduleVersionId:
                modulePlan.versionRef.id,
            },
            updatedAt: new Date(),
          },
          { merge: true },
        );
      });

      transaction.set(batchAttemptRef, {
        approvalId,
        itemIds: preparedWithAssets.map(
          prepared => prepared.item.id,
        ),
        status: 'applied',
        kind: 'atomic-module-draft-swap',
        moduleIdMap: Object.fromEntries(moduleIdMap),
        contentManifestHash: finalManifestHash,
        createdAt: applyTimestamp,
      });
      transaction.update(examRef, {
        moduleIds: nextExamModuleIds,
        qualityControl: {
          status: 'incomplete',
          runId: runRef.id,
          applyingApprovalId: approvalId,
          checkedAt: new Date(),
        },
        updatedAt: applyTimestamp,
      });
      transaction.set(
        runRef,
        {
          selectedModuleIds: nextSelectedModuleIds,
          appliedModuleMap: Object.fromEntries(
            moduleIdMap,
          ),
          contentManifestHash: finalManifestHash,
          updatedAt: applyTimestamp,
        },
        { merge: true },
      );
    });
  } catch (error) {
    await deleteUploadedGraphAssets(
      firebaseAdmin,
      uploadedAssets,
    );
    throw error;
  }

  for (const prepared of preparedWithAssets) {
    if (!prepared.graphAsset) continue;
    await runRef
      .collection('items')
      .doc(prepared.item.id)
      .collection('artifacts')
      .doc()
      .set({
        ...prepared.graphAsset,
        type: 'question-visual',
        createdAt: new Date(),
      })
      .catch(error => {
        console.error(
          '[ExamQualityControl] Atomic repair applied, but the redundant artifact log failed:',
          error,
        );
      });
  }

  return {
    moduleIdMap: Object.fromEntries(
      modulePlans.map(plan => [
        plan.sourceModuleId,
        plan.draftRef.id,
      ]),
    ),
    itemIds: preparedWithAssets.map(
      prepared => prepared.item.id,
    ),
    contentManifestHash: finalManifestHash,
  };
}

async function processRepairItem({
  db,
  firebaseAdmin,
  runRef,
  run,
  item,
  approvalId,
  openai,
  leaseToken,
}) {
  const itemRef = runRef.collection('items').doc(item.id);
  await setDocumentWithWorkerLease({
    db,
    runRef,
    documentRef: itemRef,
    type: 'repair',
    token: leaseToken,
    data: {
      status: 'repairing',
      approvedAt: new Date(),
      updatedAt: new Date(),
    },
  });

  try {
    if (item.kind === 'module_metadata') {
      await setDocumentWithWorkerLease({
        db,
        runRef,
        documentRef: itemRef,
        type: 'repair',
        token: leaseToken,
        data: {
          status: 'repair_ready',
          repair: {
            status: 'verified',
            approvalId,
            before: {
              questionCount:
                item.sourceQuestionCount ?? null,
            },
            after: {
              questionCount: 'synchronize-to-slot-count',
            },
            verification: {
              eligible: true,
              blockers: [],
              summary:
                'Deterministic metadata-only repair prepared for atomic application.',
            },
          },
          updatedAt: new Date(),
        },
      });
      return {
        eligible: true,
        kind: item.kind,
        item,
      };
    }

    if (
      ![
        'question_quality',
        'missing_question',
        'duplicate_question',
        'malformed_question_reference',
      ].includes(item.kind)
    ) {
      throw new Error(
        'This structural finding requires manual review and cannot be repaired automatically.',
      );
    }

    if (
      item.status === 'repair_ready' &&
      item.repair?.verification?.eligible === true &&
      item.repair?.after
    ) {
      const candidate = item.repair.after;
      const visual = await renderCandidateVisual(candidate);
      return {
        eligible: true,
        kind: item.kind,
        item,
        candidate,
        verification: {
          parsed: item.repair.verification.result,
          responseId:
            item.repair.verification.responseId || null,
          usage: null,
        },
        editorialReview: {
          parsed:
            item.repair.verification.editorialResult,
          responseId:
            item.repair.verification
              .editorialResponseId || null,
          usage: null,
        },
        proposalId: item.repair.proposalId || null,
        visual,
      };
    }

    const moduleProfile = await getCurrentModuleProfile(
      db,
      item.moduleId,
    );
    const hardDeterministicIssues = (
      item.deterministicIssues || []
    ).filter(issue =>
      ['high', 'critical'].includes(issue.severity),
    );
    const isCanonicalKeyOnlyRepair =
      item.kind === 'question_quality' &&
      hardDeterministicIssues.length > 0 &&
      hardDeterministicIssues.every(
        issue => issue.code === 'noncanonical_answer_key',
      );
    const generated = isCanonicalKeyOnlyRepair
      ? {
          parsed: {
            changeSummary:
              'Normalized the independently verified answer key without changing the assessed content.',
            qualityRationale:
              'A canonical zero-based key prevents runtime scoring ambiguity.',
            question: createCanonicalKeyRepairCandidate(
              item.sourceQuestion,
            ),
          },
          model: 'deterministic-key-normalizer',
          responseId: null,
          usage: null,
          referenceEvidence: [],
          referenceEvidenceHash: null,
        }
      : await runRepairGeneration({
          client: openai,
          itemKind: item.kind,
          sourceQuestion: item.sourceQuestion,
          moduleNumber: item.moduleNumber,
          questionNumber: item.questionNumber,
          analysis: item.analysis,
          moduleProfile,
          vectorStoreId: run.referenceVectorStoreId,
          model: run.model,
          reasoningEffort: run.reasoningEffort,
          reasoningMode: run.reasoningMode,
        });
    let candidate =
      item.kind === 'question_quality' &&
      item.analysis?.recommendedAction === 'add_graph' &&
      item.sourceQuestion
        ? createVisualOnlyRepairCandidate(
            item.sourceQuestion,
            generated.parsed.question,
          )
        : generated.parsed.question;
    const visual = await renderCandidateVisual(candidate);
    const verification = await runIndependentVerification({
      client: openai,
      question: candidate,
      moduleNumber: item.moduleNumber,
      questionNumber: item.questionNumber,
      vectorStoreId: run.referenceVectorStoreId,
      renderedVisualDataUrl: visual.dataUrl,
      model: run.model,
      reasoningEffort: run.reasoningEffort,
      reasoningMode: run.reasoningMode,
    });
    candidate = addVerifiedStudentResponseForms(
      candidate,
      verification.parsed.solvedAnswerValue,
    );
    const editorialReview = await runRepairEditorialReview({
      client: openai,
      question: candidate,
      moduleNumber: item.moduleNumber,
      questionNumber: item.questionNumber,
      vectorStoreId: run.referenceVectorStoreId,
      blindVerification: verification.parsed,
      renderedVisualDataUrl: visual.dataUrl,
      model: run.model,
      reasoningEffort: run.reasoningEffort,
      reasoningMode: run.reasoningMode,
    });
    const eligibility = verifyCandidateForApplication(
      candidate,
      verification.parsed,
      {
        moduleNumber: item.moduleNumber,
        editorialReview: editorialReview.parsed,
        repairSpecification:
          item.analysis?.repairSpecification || null,
      },
    );
    const proposalRef = itemRef.collection('repairProposals').doc();
    const proposal = {
      changeSummary: generated.parsed.changeSummary,
      qualityRationale: generated.parsed.qualityRationale,
      candidate,
      model: generated.model || run.model,
      reasoningEffort: run.reasoningEffort,
      generationResponseId: generated.responseId,
      generationUsage: generated.usage,
      generationReferenceEvidence: generated.referenceEvidence,
      generationReferenceEvidenceHash:
        generated.referenceEvidenceHash,
      verification: {
        result: verification.parsed,
        responseId: verification.responseId,
        usage: verification.usage,
        referenceEvidence: verification.referenceEvidence,
        referenceEvidenceHash:
          verification.referenceEvidenceHash,
      },
      editorialReview: {
        result: editorialReview.parsed,
        responseId: editorialReview.responseId,
        usage: editorialReview.usage,
        referenceEvidence:
          editorialReview.referenceEvidence,
        referenceEvidenceHash:
          editorialReview.referenceEvidenceHash,
      },
      eligibility,
      visualContentHash: visual.contentHash,
      createdAt: new Date(),
    };
    await db.runTransaction(async transaction => {
      await assertWorkerLeaseInTransaction(
        transaction,
        runRef,
        'repair',
        leaseToken,
      );
      transaction.set(proposalRef, proposal);
      transaction.set(
        itemRef,
        {
          latestProposalId: proposalRef.id,
          status: eligibility.eligible
            ? 'repair_ready'
            : 'repair_blocked',
          repair: {
            status: eligibility.eligible
              ? 'verified'
              : 'blocked',
            approvalId,
            proposalId: proposalRef.id,
            before: item.sourceQuestion || null,
            after: candidate,
            verification: {
              eligible: eligibility.eligible,
              blockers: eligibility.blockers,
              result: verification.parsed,
              responseId: verification.responseId,
              editorialResult: editorialReview.parsed,
              editorialResponseId:
                editorialReview.responseId,
            },
          },
          updatedAt: new Date(),
        },
        { merge: true },
      );
    });

    if (!eligibility.eligible) {
      return {
        eligible: false,
        kind: item.kind,
        item,
      };
    }

    return {
      eligible: true,
      kind: item.kind,
      item,
      candidate,
      verification,
      editorialReview,
      proposalId: proposalRef.id,
      visual,
    };
  } catch (error) {
    if (error.code === 'WORKER_LEASE_LOST') throw error;
    await setDocumentWithWorkerLease({
      db,
      runRef,
      documentRef: itemRef,
      type: 'repair',
      token: leaseToken,
      data: {
        status: 'repair_blocked',
        repair: {
          status: 'blocked',
          approvalId,
          before: item.sourceQuestion || null,
          after: null,
          verification: {
            eligible: false,
            blockers: [error.message || 'Repair failed'],
          },
          error: error.message || 'Repair failed',
        },
        updatedAt: new Date(),
      },
    });
    return {
      eligible: false,
      kind: item.kind,
      item,
      error,
    };
  }
}

async function runRepairWorker({
  db,
  firebaseAdmin,
  runId,
  itemIds,
  approvalId,
  openai,
}) {
  if (activeJobs.has(runId)) return activeJobs.get(runId);

  const promise = (async () => {
    const lease = await acquireWorkerLease(db, runId, {
      type: 'repair',
      approvalId,
    });
    if (!lease.acquired) return;
    const heartbeat = startWorkerHeartbeat(
      db,
      runId,
      'repair',
      lease.token,
    );

    try {
      const { runRef, run } = await fetchRunOrThrow(db, runId);
      const items = await fetchRunItems(runRef);
      const byId = new Map(items.map(item => [item.id, item]));
      const selectedItems = itemIds
      .map(itemId => byId.get(itemId))
      .sort((left, right) => {
        const moduleDifference =
          Number(left.moduleNumber || 0) -
          Number(right.moduleNumber || 0);
        if (moduleDifference !== 0) return moduleDifference;

        const leftSlot = Number.isInteger(left.slotIndex)
          ? left.slotIndex
          : Number.MAX_SAFE_INTEGER;
        const rightSlot = Number.isInteger(right.slotIndex)
          ? right.slotIndex
          : Number.MAX_SAFE_INTEGER;
        return leftSlot - rightSlot;
      });

    await addRunEvent(runRef, 'repair_started', {
      approvalId,
      itemIds,
    });
    await runRef.set(
      {
        status: 'repairing',
        phase: 'repair',
        progress: {
          total: selectedItems.length,
          completed: 0,
          failed: 0,
        },
        updatedAt: new Date(),
      },
      { merge: true },
    );

    let completed = 0;
    let failed = 0;
    const preparedRepairs = [];
    let appliedModuleMap = {};
    // Intentionally serial: generation -> rendered visual -> independent
    // verification -> transaction must stay ordered within each module.
    for (const item of selectedItems) {
      heartbeat.assertOwned();
      const prepared = await processRepairItem({
        db,
        firebaseAdmin,
        runRef,
        run,
        item,
        approvalId,
        openai,
        leaseToken: lease.token,
      });
      heartbeat.assertOwned();
      if (prepared?.eligible) {
        preparedRepairs.push(prepared);
      } else {
        failed += 1;
      }
      completed += 1;
      await runRef.set(
        {
          progress: {
            total: selectedItems.length,
            completed,
            failed,
          },
          updatedAt: new Date(),
        },
        { merge: true },
      );
    }

    if (failed === 0) {
      try {
        const application = await applyPreparedRepairBatch({
          db,
          firebaseAdmin,
          runRef,
          run,
          approvalId,
          preparedRepairs,
          allRunItems: items,
          leaseToken: lease.token,
        });
        appliedModuleMap = application?.moduleIdMap || {};
      } catch (error) {
        if (error.code === 'WORKER_LEASE_LOST') throw error;
        const resetBatch = db.batch();
        preparedRepairs.forEach(prepared => {
          resetBatch.set(
            runRef
              .collection('items')
              .doc(prepared.item.id),
            {
              status: 'repair_ready',
              repairApplyError:
                error.message ||
                'Atomic repair application failed',
              updatedAt: new Date(),
            },
            { merge: true },
          );
        });
        await resetBatch.commit();
        throw error;
      }
    } else {
      const resetBatch = db.batch();
      preparedRepairs.forEach(prepared => {
        resetBatch.set(
          runRef
            .collection('items')
            .doc(prepared.item.id),
          {
            status: 'repair_ready',
            updatedAt: new Date(),
          },
          { merge: true },
        );
      });
      await resetBatch.commit();
      await addRunEvent(
        runRef,
        'repair_batch_application_blocked',
        {
          approvalId,
          preparedItemIds: preparedRepairs.map(
            prepared => prepared.item.id,
          ),
          failedCount: failed,
          reason:
            'No live exam mutation was made because at least one selected repair failed a publication gate.',
        },
      );
    }

    const final = await finalizeRunSummary(runRef, {
      status:
        failed > 0
          ? 'repair_completed_with_blockers'
          : 'repair_completed',
      phase: 'repair',
      scopeComplete: run.scopeComplete,
    });
    const stamp = await stampExamQualityControl({
      db,
      runRef,
      summary: final.summary,
      workerType: 'repair',
      leaseToken: lease.token,
    });
    await addRunEvent(runRef, 'repair_completed', {
      approvalId,
      summary: stamp.summary,
      finalManifestHash: stamp.manifestHash,
    });
    } finally {
      await heartbeat.stop();
    }
  })()
    .catch(async error => {
      if (error.code === 'WORKER_LEASE_LOST') {
        console.warn(
          '[ExamQualityControl] Repair worker stopped after losing its lease.',
        );
        return;
      }
      try {
        const { runRef } = await fetchRunOrThrow(db, runId);
        await runRef.set(
          {
            status: 'failed',
            lastError: error.message,
            updatedAt: new Date(),
          },
          { merge: true },
        );
        await addRunEvent(runRef, 'repair_failed', {
          error: error.message,
        });
      } catch {}
    })
    .finally(() => {
      activeJobs.delete(runId);
    });

  activeJobs.set(runId, promise);
  return promise;
}

function startAuditInBackground({ db, runId }) {
  setImmediate(async () => {
    try {
      await runAuditWorker({
        db,
        runId,
        openai: createOpenAIClient(),
      });
    } catch (error) {
      console.error(
        '[ExamQualityControl] Could not start audit worker:',
        error,
      );
      try {
        const { runRef } = await fetchRunOrThrow(db, runId);
        await runRef.set(
          {
            status: 'failed',
            lastError: error.message,
            updatedAt: new Date(),
          },
          { merge: true },
        );
      } catch {}
    }
  });
}

function startRepairInBackground({
  db,
  firebaseAdmin,
  runId,
  itemIds,
  approvalId,
}) {
  setImmediate(async () => {
    try {
      await runRepairWorker({
        db,
        firebaseAdmin,
        runId,
        itemIds,
        approvalId,
        openai: createOpenAIClient(),
      });
    } catch (error) {
      console.error(
        '[ExamQualityControl] Could not start repair worker:',
        error,
      );
      try {
        const { runRef } = await fetchRunOrThrow(db, runId);
        await runRef.set(
          {
            status: 'failed',
            lastError: error.message,
            updatedAt: new Date(),
          },
          { merge: true },
        );
      } catch {}
    }
  });
}

router.get('/catalog', verifyAdminAccess, async (req, res) => {
  try {
    if (!req.db) {
      return res.status(500).json({ error: 'Firestore not available' });
    }

    const [examSnapshot, moduleSnapshot, referenceSnapshot, runSnapshot] =
      await Promise.all([
        req.db.collection('practiceExams').get(),
        req.db.collection('examModules').get(),
        getCollectionOrdered(req.db.collection(REFERENCES_COLLECTION), {
          limit: 50,
        }),
        getCollectionOrdered(req.db.collection(RUNS_COLLECTION), {
          limit: 25,
        }),
      ]);
    const moduleById = new Map(
      moduleSnapshot.docs.map(doc => [
        doc.id,
        { id: doc.id, ...doc.data() },
      ]),
    );
    const allQuestionIds = Array.from(
      new Set(
        moduleSnapshot.docs.flatMap(doc =>
          getReferenceEntries(
            doc.data().questionIds,
          )
            .filter(entry => entry.valid)
            .map(entry => entry.id),
        ),
      ),
    );
    const questionSnaps = await getDocumentsByRefs(
      req.db,
      allQuestionIds.map(questionId =>
        req.db.collection('questions').doc(questionId),
      ),
    );
    const existingQuestionIds = new Set(
      questionSnaps
        .filter(snapshot => snapshot.exists)
        .map(snapshot => snapshot.id),
    );
    const exams = examSnapshot.docs
      .map(doc => {
        const exam = doc.data();
        const moduleIds = Array.isArray(exam.moduleIds)
          ? exam.moduleIds.map(String)
          : [];
        return {
          id: doc.id,
          title: exam.title || 'Untitled exam',
          description: exam.description || '',
          isPublic: Boolean(exam.isPublic),
          moduleIds,
          qualityControl: serializeValue(exam.qualityControl || null),
          modules: moduleIds.map(moduleId => {
            const module = moduleById.get(moduleId);
            if (!module) {
              return {
                id: moduleId,
                title: 'Missing module',
                moduleNumber: null,
                questionCount: null,
                expectedQuestionCount: null,
                questionIdsLength: 0,
                resolvedQuestionCount: 0,
                missingQuestionCount: 0,
                exists: false,
              };
            }
            const questionIds = Array.isArray(module.questionIds)
              ? module.questionIds.map(String)
              : [];
            const resolvedQuestionCount = questionIds.filter(id =>
              existingQuestionIds.has(id),
            ).length;
            const expectedQuestionCount =
              getExpectedQuestionCount(module.moduleNumber) ||
              questionIds.length;
            return {
              id: module.id,
              title:
                module.title ||
                `Module ${module.moduleNumber || '?'}`,
              moduleNumber: module.moduleNumber ?? null,
              questionCount: module.questionCount ?? null,
              expectedQuestionCount,
              questionIdsLength: questionIds.length,
              resolvedQuestionCount,
              missingQuestionCount: Math.max(
                0,
                expectedQuestionCount - resolvedQuestionCount,
              ),
              exists: true,
            };
          }),
        };
      })
      .sort((left, right) =>
        left.title.localeCompare(right.title, undefined, {
          numeric: true,
        }),
      );

    res.json({
      model: getModel(),
      reasoningEffort: getReasoningEffort(),
      reasoningMode: getReasoningMode(),
      exams,
      references: referenceSnapshot.docs.map(serializeDoc),
      runs: runSnapshot.docs.map(serializeDoc),
    });
  } catch (error) {
    console.error(
      '[ExamQualityControl] Failed to load catalog:',
      error,
    );
    res.status(500).json({
      error: error.message || 'Failed to load exam quality-control catalog',
    });
  }
});

router.post(
  '/references',
  verifyAdminAccess,
  referenceUpload.single('reference'),
  async (req, res) => {
    let openaiFile = null;
    let vectorStore = null;
    let storageFile = null;
    let referenceRef = null;

    try {
      if (!req.file) {
        return res.status(400).json({
          error: 'Choose a reference file to upload',
        });
      }
      if (!req.db || !req.firebaseAdmin) {
        return res.status(500).json({
          error: 'Firebase Admin is not available',
        });
      }

      const name =
        String(req.body?.name || '').trim() ||
        req.file.originalname;
      const sha256 = crypto
        .createHash('sha256')
        .update(req.file.buffer)
        .digest('hex');
      const duplicateSnapshot = await req.db
        .collection(REFERENCES_COLLECTION)
        .where('sha256', '==', sha256)
        .limit(1)
        .get();
      const readyDuplicate = duplicateSnapshot.docs.find(
        doc => doc.data().status === 'ready',
      );
      if (readyDuplicate) {
        return res.status(200).json({
          reference: serializeDoc(readyDuplicate),
          reused: true,
        });
      }

      referenceRef = req.db.collection(REFERENCES_COLLECTION).doc();
      await referenceRef.set({
        name,
        fileName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        sha256,
        status: 'processing',
        createdBy: req.user.uid,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const bucket = req.firebaseAdmin.storage().bucket();
      const storagePath = `exam-quality-references/${referenceRef.id}/${sha256}-${safeFileName(req.file.originalname)}`;
      storageFile = bucket.file(storagePath);
      await storageFile.save(req.file.buffer, {
        resumable: false,
        contentType: req.file.mimetype,
        metadata: {
          cacheControl: 'private,max-age=0,no-store',
          metadata: {
            referenceId: referenceRef.id,
            sha256,
          },
        },
      });

      const openai = createOpenAIClient();
      openaiFile = await openai.files.create({
        file: await toFile(
          req.file.buffer,
          req.file.originalname,
          { type: req.file.mimetype },
        ),
        purpose: 'assistants',
      });
      vectorStore = await openai.vectorStores.create({
        name: `UltraSAT quality references - ${name}`.slice(0, 256),
        description:
          'Administrator-provided Digital SAT reference questions used only for style and quality calibration.',
        metadata: {
          reference_id: referenceRef.id,
          sha256,
        },
      });
      const vectorFile =
        await openai.vectorStores.files.createAndPoll(
          vectorStore.id,
          {
            file_id: openaiFile.id,
            chunking_strategy: {
              type: 'static',
              static: {
                max_chunk_size_tokens: 1600,
                chunk_overlap_tokens: 400,
              },
            },
          },
          { pollIntervalMs: 1500 },
        );

      if (vectorFile.status !== 'completed') {
        throw new Error(
          `Reference indexing ended with status ${vectorFile.status}`,
        );
      }

      const referenceData = {
        name,
        fileName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        sha256,
        versionHash: sha256,
        status: 'ready',
        storagePath,
        openAiFileId: openaiFile.id,
        vectorStoreId: vectorStore.id,
        vectorStoreFileId: vectorFile.id,
        createdBy: req.user.uid,
        createdAt: new Date(),
        updatedAt: new Date(),
        readyAt: new Date(),
      };
      await referenceRef.set(referenceData, { merge: true });
      res.status(201).json({
        reference: serializeDoc({
          id: referenceRef.id,
          data: () => referenceData,
        }),
      });
    } catch (error) {
      console.error(
        '[ExamQualityControl] Reference upload failed:',
        error,
      );
      if (referenceRef) {
        await referenceRef.set(
          {
            status: 'failed',
            error: error.message,
            updatedAt: new Date(),
          },
          { merge: true },
        ).catch(() => {});
      }
      if (vectorStore) {
        const openai = createOpenAIClient();
        await openai.vectorStores.delete(vectorStore.id).catch(() => {});
      }
      if (openaiFile) {
        const openai = createOpenAIClient();
        await openai.files.delete(openaiFile.id).catch(() => {});
      }
      if (storageFile) {
        await storageFile.delete({ ignoreNotFound: true }).catch(() => {});
      }
      res.status(500).json({
        error: error.message || 'Failed to index reference file',
      });
    }
  },
);

router.post('/runs', verifyAdminAccess, async (req, res) => {
  try {
    if (!req.db) {
      return res.status(500).json({ error: 'Firestore not available' });
    }
    const { examId, moduleIds, referenceId } = req.body || {};
    if (!examId || !referenceId) {
      return res.status(400).json({
        error: 'examId and referenceId are required',
      });
    }

    const referenceRef = req.db
      .collection(REFERENCES_COLLECTION)
      .doc(String(referenceId));
    const referenceSnap = await referenceRef.get();
    if (!referenceSnap.exists || referenceSnap.data().status !== 'ready') {
      return res.status(400).json({
        error: 'Select a ready reference library before starting an audit',
      });
    }

    const preflightOpenAI = createOpenAIClient();
    requireReferenceEvidence(
      await retrieveReferenceExcerpts({
        client: preflightOpenAI,
        vectorStoreId: referenceSnap.data().vectorStoreId,
        query:
          'Digital SAT Reading and Writing Math easy medium hard official-style questions answer choices graphs tables',
        limit: 8,
      }),
      { minimumCount: 4 },
    );

    const inventory = await buildRunInventory(
      req.db,
      String(examId),
      moduleIds,
    );
    const runRef = req.db.collection(RUNS_COLLECTION).doc();
    const now = new Date();
    const runData = {
      examId: inventory.exam.id,
      examTitle: inventory.exam.title || 'Untitled exam',
      selectedModuleIds: inventory.selectedModuleIds,
      moduleSummaries: inventory.moduleSummaries,
      scopeComplete: inventory.scopeComplete,
      referenceId: referenceSnap.id,
      referenceName: referenceSnap.data().name,
      referenceVersionHash:
        referenceSnap.data().versionHash ||
        referenceSnap.data().sha256,
      referenceVectorStoreId:
        referenceSnap.data().vectorStoreId,
      sourceManifestHash: inventory.sourceManifestHash,
      contentManifestHash: inventory.sourceManifestHash,
      model: getModel(),
      reasoningEffort: getReasoningEffort(),
      reasoningMode: getReasoningMode(),
      promptVersion: PROMPT_VERSION,
      policyVersion: POLICY_VERSION,
      status: 'queued',
      phase: 'audit',
      progress: {
        total: inventory.items.length,
        completed: inventory.items.filter(
          item => item.status !== 'queued',
        ).length,
        failed: 0,
      },
      summary: summarizeRunItems(inventory.items),
      createdBy: req.user.uid,
      createdAt: now,
      updatedAt: now,
    };
    const batch = req.db.batch();
    batch.set(runRef, runData);
    inventory.items.forEach(item => {
      batch.set(
        runRef.collection('items').doc(item.id),
        stripUndefined({
          ...item,
          runId: runRef.id,
        }),
      );
    });
    await batch.commit();
    await addRunEvent(runRef, 'run_created', {
      examId: inventory.exam.id,
      selectedModuleIds: inventory.selectedModuleIds,
      sourceManifestHash: inventory.sourceManifestHash,
    });

    const responseRun = serializeDoc({
      id: runRef.id,
      data: () => runData,
    });
    res.status(202).json({ run: responseRun });

    startAuditInBackground({
      db: req.db,
      runId: runRef.id,
    });
  } catch (error) {
    console.error(
      '[ExamQualityControl] Failed to create run:',
      error,
    );
    res.status(error.status || 500).json({
      error: error.message || 'Failed to create exam quality-control run',
    });
  }
});

router.get('/runs/:runId', verifyAdminAccess, async (req, res) => {
  try {
    if (!req.db) {
      return res.status(500).json({ error: 'Firestore not available' });
    }
    const { runRef, runSnap } = await fetchRunOrThrow(
      req.db,
      req.params.runId,
    );
    const items = await fetchRunItems(runRef);
    res.json({
      run: serializeDoc(runSnap),
      items: items.map(serializeValue),
    });
  } catch (error) {
    res.status(error.status || 500).json({
      error: error.message || 'Failed to load exam quality-control run',
    });
  }
});

router.post(
  '/runs/:runId/publish',
  verifyAdminAccess,
  async (req, res) => {
    try {
      if (!req.db) {
        return res.status(500).json({
          error: 'Firestore not available',
        });
      }
      const runRef = req.db
        .collection(RUNS_COLLECTION)
        .doc(String(req.params.runId));
      let publishedExamId = null;
      await req.db.runTransaction(async transaction => {
        const runSnap = await transaction.get(runRef);
        if (!runSnap.exists) {
          const error = new Error(
            'Exam quality-control run not found',
          );
          error.status = 404;
          throw error;
        }
        const run = runSnap.data();
        if (hasActiveWorkerLease(run)) {
          const error = new Error(
            'Wait for the active quality-control worker to finish before publishing.',
          );
          error.status = 409;
          throw error;
        }
        const itemSnapshot = await transaction.get(
          runRef.collection('items'),
        );
        const liveSummary = summarizeRunItems(
          itemSnapshot.docs.map(snapshot => ({
            id: snapshot.id,
            ...snapshot.data(),
          })),
        );
        if (!run.scopeComplete || !liveSummary.publishReady) {
          const error = new Error(
            'Every canonical module and every quality-control item must pass before publication.',
          );
          error.status = 409;
          throw error;
        }
        const currentManifest =
          await readCanonicalContentManifest({
            db: req.db,
            examId: run.examId,
            selectedModuleIds:
              run.selectedModuleIds || [],
            transaction,
          });
        const expectedManifestHash =
          run.finalManifestHash ||
          run.contentManifestHash;
        if (
          !expectedManifestHash ||
          currentManifest.hash !== expectedManifestHash
        ) {
          const error = new Error(
            'The exam changed after quality control. Run a new audit before publishing.',
          );
          error.status = 409;
          throw error;
        }
        const expectedFingerprint = createContentHash({
          contentManifestHash: currentManifest.hash,
          referenceVersionHash:
            run.referenceVersionHash,
          model: run.model,
          reasoningEffort: run.reasoningEffort,
          reasoningMode: run.reasoningMode,
          promptVersion: run.promptVersion,
          policyVersion: run.policyVersion,
        });
        const examData = currentManifest.examSnap.data();
        if (
          run.auditFingerprint !== expectedFingerprint ||
          examData.qualityControl?.auditFingerprint !==
            expectedFingerprint ||
          examData.qualityControl?.status !== 'passed'
        ) {
          const error = new Error(
            'The current exam does not have a matching passed quality-control fingerprint.',
          );
          error.status = 409;
          throw error;
        }
        const now = new Date();
        transaction.set(
          currentManifest.examRef,
          {
            isPublic: true,
            publishedAt: now,
            publishedBy: req.user.uid,
            qualityControl: {
              ...examData.qualityControl,
              status: 'passed',
              publishedAt: now,
              publishedBy: req.user.uid,
            },
            updatedAt: now,
          },
          { merge: true },
        );
        transaction.set(
          runRef,
          {
            publishedAt: now,
            publishedBy: req.user.uid,
            updatedAt: now,
          },
          { merge: true },
        );
        publishedExamId = run.examId;
      });
      await addRunEvent(runRef, 'exam_published', {
        examId: publishedExamId,
        publishedBy: req.user.uid,
      });
      const [runSnap, examSnap] = await Promise.all([
        runRef.get(),
        req.db
          .collection('practiceExams')
          .doc(publishedExamId)
          .get(),
      ]);
      res.json({
        run: serializeDoc(runSnap),
        exam: serializeDoc(examSnap),
      });
    } catch (error) {
      console.error(
        '[ExamQualityControl] Publish failed:',
        error,
      );
      res.status(error.status || 500).json({
        error:
          error.message ||
          'Failed to publish the practice exam',
      });
    }
  },
);

router.post(
  '/runs/:runId/resume',
  verifyAdminAccess,
  async (req, res) => {
    try {
      if (!req.db) {
        return res.status(500).json({
          error: 'Firestore not available',
        });
      }
      const { runRef, runSnap, run } = await fetchRunOrThrow(
        req.db,
        req.params.runId,
      );
      if (activeJobs.has(runRef.id)) {
        return res.status(409).json({
          error: 'This run is already active',
        });
      }
      if (hasActiveWorkerLease(run)) {
        return res.status(409).json({
          error:
            'This run still has an active durable worker lease. Wait for it to finish or for the lease to expire.',
        });
      }
      if (run.phase === 'repair') {
        if (!req.firebaseAdmin) {
          return res.status(500).json({
            error: 'Firebase Admin is not available',
          });
        }
        const approvalId = String(
          run.activeApprovalId || '',
        ).trim();
        if (!approvalId) {
          return res.status(409).json({
            error:
              'This repair run has no persisted approval to resume',
          });
        }
        const approvalSnap = await runRef
          .collection('approvals')
          .doc(approvalId)
          .get();
        if (!approvalSnap.exists) {
          return res.status(409).json({
            error:
              'The persisted repair approval could not be found',
          });
        }
        const approvedItemIds = Array.isArray(
          approvalSnap.data().itemIds,
        )
          ? approvalSnap.data().itemIds.map(String)
          : [];
        const items = await fetchRunItems(runRef);
        const approvedSet = new Set(approvedItemIds);
        const resumableItemIds = items
          .filter(
            item =>
              approvedSet.has(item.id) &&
              !['repaired', 'rolled_back'].includes(
                item.status,
              ),
          )
          .map(item => item.id);

        if (!resumableItemIds.length) {
          const final = await finalizeRunSummary(runRef, {
            status: 'repair_completed',
            phase: 'repair',
            scopeComplete: run.scopeComplete,
          });
          const stamp = await stampExamQualityControl({
            db: req.db,
            runRef,
            summary: final.summary,
          });
          const completedRun = await runRef.get();
          return res.json({
            run: serializeDoc(completedRun),
            summary: stamp.summary,
          });
        }

        const batch = req.db.batch();
        items
          .filter(
            item =>
              approvedSet.has(item.id) &&
              item.status === 'repairing',
          )
          .forEach(item => {
            const verifiedCandidate =
              item.repair?.verification?.eligible === true &&
              item.repair?.after;
            batch.set(
              runRef.collection('items').doc(item.id),
              {
                status: verifiedCandidate
                  ? 'repair_ready'
                  : 'needs_repair',
                updatedAt: new Date(),
              },
              { merge: true },
            );
          });
        batch.set(
          runRef,
          {
            status: 'repair_queued',
            lastError: null,
            updatedAt: new Date(),
          },
          { merge: true },
        );
        await batch.commit();
        await addRunEvent(runRef, 'repair_resumed', {
          approvalId,
          itemIds: resumableItemIds,
          resumedBy: req.user.uid,
        });
        res.status(202).json({
          run: serializeValue({
            id: runRef.id,
            ...run,
            status: 'repair_queued',
          }),
        });
        startRepairInBackground({
          db: req.db,
          firebaseAdmin: req.firebaseAdmin,
          runId: runRef.id,
          itemIds: resumableItemIds,
          approvalId,
        });
        return;
      }

      const items = await fetchRunItems(runRef);
      const batch = req.db.batch();
      items
        .filter(
          item =>
            item.kind === 'question_quality' &&
            ['failed', 'auditing'].includes(item.status),
        )
        .forEach(item => {
          batch.set(
            runRef.collection('items').doc(item.id),
            {
              status: 'queued',
              auditError: null,
              updatedAt: new Date(),
            },
            { merge: true },
          );
        });
      batch.set(
        runRef,
        {
          status: 'queued',
          lastError: null,
          updatedAt: new Date(),
        },
        { merge: true },
      );
      await batch.commit();
      res.status(202).json({
        run: serializeDoc({
          id: runRef.id,
          data: () => ({
            ...runSnap.data(),
            status: 'queued',
          }),
        }),
      });
      startAuditInBackground({
        db: req.db,
        runId: runRef.id,
      });
    } catch (error) {
      res.status(error.status || 500).json({
        error: error.message || 'Failed to resume quality-control run',
      });
    }
  },
);

router.post(
  '/runs/:runId/repairs',
  verifyAdminAccess,
  async (req, res) => {
    try {
      if (!req.db || !req.firebaseAdmin) {
        return res.status(500).json({
          error: 'Firebase Admin is not available',
        });
      }
      const { runRef, run } = await fetchRunOrThrow(
        req.db,
        req.params.runId,
      );
      if (activeJobs.has(runRef.id)) {
        return res.status(409).json({
          error: 'This run is already active',
        });
      }
      if (hasActiveWorkerLease(run)) {
        return res.status(409).json({
          error: 'This run is already active on a worker instance',
        });
      }
      if (
        !(
          [
            'awaiting_approval',
            'repair_completed',
            'repair_completed_with_blockers',
          ].includes(run.status) ||
          (
            run.status === 'failed' &&
            run.phase === 'repair'
          )
        )
      ) {
        return res.status(409).json({
          error:
            'The audit must finish before repairs can be approved',
        });
      }

      const itemIds = Array.isArray(req.body?.itemIds)
        ? Array.from(
            new Set(
              req.body.itemIds
                .map(itemId => String(itemId).trim())
                .filter(Boolean),
            ),
          )
        : [];
      if (!itemIds.length) {
        return res.status(400).json({
          error: 'Select at least one finding to repair',
        });
      }
      if (itemIds.length > 100) {
        return res.status(400).json({
          error: 'No more than 100 findings can be approved at once',
        });
      }

      const items = await fetchRunItems(runRef);
      const unfinishedAuditItem = items.find(
        item =>
          item.kind === 'question_quality' &&
          ['queued', 'auditing', 'failed'].includes(
            item.status,
          ),
      );
      if (unfinishedAuditItem && run.phase !== 'repair') {
        return res.status(409).json({
          error:
            'Every question audit must complete successfully before repairs can be approved',
        });
      }
      const itemById = new Map(items.map(item => [item.id, item]));
      const invalidId = itemIds.find(itemId => !itemById.has(itemId));
      if (invalidId) {
        return res.status(404).json({
          error: `Run item ${invalidId} was not found`,
        });
      }
      const ineligible = itemIds
        .map(itemId => itemById.get(itemId))
        .find(
          item =>
            ![
              'needs_repair',
              'repair_blocked',
              'repair_ready',
            ].includes(
              item.status,
            ),
        );
      if (ineligible) {
        return res.status(409).json({
          error: `Finding ${ineligible.id} is not eligible for an approved repair`,
        });
      }

      const approvalRef = runRef.collection('approvals').doc();
      const approvalData = {
        itemIds,
        sourceManifestHash:
          run.contentManifestHash ||
          run.sourceManifestHash,
        originalAuditManifestHash:
          run.sourceManifestHash,
        approvedBy: req.user.uid,
        createdAt: new Date(),
      };
      await approvalRef.set(approvalData);
      await runRef.set(
        {
          status: 'repair_queued',
          phase: 'repair',
          activeApprovalId: approvalRef.id,
          updatedAt: new Date(),
        },
        { merge: true },
      );
      await addRunEvent(runRef, 'repairs_approved', {
        approvalId: approvalRef.id,
        itemIds,
        approvedBy: req.user.uid,
      });
      res.status(202).json({
        run: serializeValue({
          id: runRef.id,
          ...run,
          status: 'repair_queued',
          phase: 'repair',
          activeApprovalId: approvalRef.id,
        }),
      });

      startRepairInBackground({
        db: req.db,
        firebaseAdmin: req.firebaseAdmin,
        runId: runRef.id,
        itemIds,
        approvalId: approvalRef.id,
      });
    } catch (error) {
      console.error(
        '[ExamQualityControl] Failed to approve repairs:',
        error,
      );
      res.status(error.status || 500).json({
        error: error.message || 'Failed to approve exam repairs',
      });
    }
  },
);

router.post(
  '/runs/:runId/repairs/:itemId/rollback',
  verifyAdminAccess,
  async (req, res) => {
    try {
      if (!req.db) {
        return res.status(500).json({
          error: 'Firestore not available',
        });
      }
      const { runRef, run } = await fetchRunOrThrow(
        req.db,
        req.params.runId,
      );
      if (activeJobs.has(runRef.id)) {
        return res.status(409).json({
          error: 'Wait for the active job to finish before rolling back',
        });
      }
      if (hasActiveWorkerLease(run)) {
        return res.status(409).json({
          error: 'Wait for the active worker lease to finish before rolling back',
        });
      }
      const itemRef = runRef
        .collection('items')
        .doc(String(req.params.itemId));
      const itemSnap = await itemRef.get();
      if (!itemSnap.exists) {
        return res.status(404).json({
          error: 'Repair item not found',
        });
      }
      const item = itemSnap.data();
      if (
        item.status !== 'repaired' ||
        !item.repair?.replacementQuestionId
      ) {
        return res.status(409).json({
          error: 'Only an applied question replacement can be rolled back',
        });
      }

      const currentModuleRef = req.db
        .collection('examModules')
        .doc(item.moduleId);
      const rollbackModuleRef = req.db
        .collection('examModules')
        .doc();
      const replacementRef = req.db
        .collection('questions')
        .doc(item.repair.replacementQuestionId);
      const versionRef = rollbackModuleRef
        .collection('versions')
        .doc();
      const rollbackAttemptRef = runRef
        .collection('applyAttempts')
        .doc();
      const examRef = req.db
        .collection('practiceExams')
        .doc(run.examId);
      const runItems = await fetchRunItems(runRef);

      await req.db.runTransaction(async transaction => {
        const currentManifest =
          await readCanonicalContentManifest({
            db: req.db,
            examId: run.examId,
            selectedModuleIds:
              run.selectedModuleIds || [],
            transaction,
          });
        const expectedManifestHash =
          run.contentManifestHash ||
          run.finalManifestHash ||
          run.sourceManifestHash;
        if (
          expectedManifestHash &&
          currentManifest.hash !== expectedManifestHash
        ) {
          throw new Error(
            'The exam content changed after this repair was applied. Run a new audit before rolling back.',
          );
        }
        const examSnap = await transaction.get(examRef);
        const moduleSnap = await transaction.get(
          currentModuleRef,
        );
        if (!examSnap.exists) {
          throw new Error('Practice exam no longer exists');
        }
        if (!moduleSnap.exists) {
          throw new Error('Module no longer exists');
        }
        const examModuleIds = Array.isArray(
          examSnap.data().moduleIds,
        )
          ? examSnap.data().moduleIds.map(String)
          : [];
        if (!examModuleIds.includes(item.moduleId)) {
          throw new Error(
            'The practice exam no longer references the repaired module',
          );
        }
        const beforeModule = moduleSnap.data();
        const questionIds = Array.isArray(beforeModule.questionIds)
          ? beforeModule.questionIds.map(String)
          : [];
        const auditedSlotIndex = Number(item.slotIndex);
        const currentSlotIndex = questionIds.indexOf(
          item.repair.replacementQuestionId,
        );
        if (currentSlotIndex < 0) {
          throw new Error(
            'The repaired module slot changed; rollback was not applied',
          );
        }
        if (currentSlotIndex !== auditedSlotIndex) {
          throw new Error(
            'The repaired question moved to a different module slot; rollback was not applied.',
          );
        }

        const afterQuestionIds = questionIds.slice();
        if (item.sourceQuestionId) {
          afterQuestionIds[currentSlotIndex] = item.sourceQuestionId;
        } else {
          afterQuestionIds.splice(currentSlotIndex, 1);
        }
        transaction.set(rollbackModuleRef, {
          ...beforeModule,
          questionIds: afterQuestionIds,
          questionCount: afterQuestionIds.length,
          sourceModuleId: item.moduleId,
          qualityControl: {
            runId: runRef.id,
            rollbackOfItemId: itemSnap.id,
            immutableDraftSwap: true,
            createdAt: new Date(),
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        transaction.set(versionRef, {
          runId: runRef.id,
          itemId: itemSnap.id,
          reason: 'exam-quality-control-rollback',
          before: {
            questionIds,
            questionCount: beforeModule.questionCount ?? null,
          },
          after: {
            questionIds: afterQuestionIds,
            questionCount: afterQuestionIds.length,
          },
          createdAt: new Date(),
        });
        transaction.update(examRef, {
          moduleIds: examModuleIds.map(moduleId =>
            moduleId === item.moduleId
              ? rollbackModuleRef.id
              : moduleId,
          ),
          qualityControl: {
            status: 'incomplete',
            runId: runRef.id,
            checkedAt: new Date(),
          },
          updatedAt: new Date(),
        });
        runItems.forEach(runItem => {
          if (runItem.moduleId !== item.moduleId) return;
          transaction.set(
            runRef.collection('items').doc(runItem.id),
            {
              moduleId: rollbackModuleRef.id,
              updatedAt: new Date(),
            },
            { merge: true },
          );
        });
        transaction.set(
          replacementRef,
          {
            status: 'superseded',
            supersededByRollbackRunId: runRef.id,
            updatedAt: new Date(),
          },
          { merge: true },
        );
        transaction.set(rollbackAttemptRef, {
          itemId: itemSnap.id,
          status: 'rolled_back',
          replacementQuestionId:
            item.repair.replacementQuestionId,
          restoredQuestionId: item.sourceQuestionId || null,
          auditedSlotIndex,
          appliedSlotIndex: currentSlotIndex,
          sourceModuleId: item.moduleId,
          rollbackModuleId: rollbackModuleRef.id,
          createdBy: req.user.uid,
          createdAt: new Date(),
        });
        transaction.set(
          itemRef,
          {
            status: 'rolled_back',
            repair: {
              ...item.repair,
              status: 'rolled_back',
              rolledBackAt: new Date(),
              rolledBackBy: req.user.uid,
              rollbackAttemptId: rollbackAttemptRef.id,
              rollbackModuleVersionId: versionRef.id,
              rollbackModuleId: rollbackModuleRef.id,
            },
            updatedAt: new Date(),
          },
          { merge: true },
        );
        transaction.set(
          runRef,
          {
            selectedModuleIds: (
              run.selectedModuleIds || []
            ).map(moduleId =>
              moduleId === item.moduleId
                ? rollbackModuleRef.id
                : moduleId,
            ),
            contentManifestHash: null,
            updatedAt: new Date(),
          },
          { merge: true },
        );
      });

      const final = await finalizeRunSummary(runRef, {
        status: 'repair_completed_with_blockers',
        phase: 'repair',
        scopeComplete: run.scopeComplete,
      });
      await stampExamQualityControl({
        db: req.db,
        runRef,
        summary: {
          ...final.summary,
          publishReady: false,
        },
        adoptCurrentManifest: true,
      });
      await addRunEvent(runRef, 'repair_rolled_back', {
        itemId: itemSnap.id,
        rolledBackBy: req.user.uid,
      });
      const updatedItem = await itemRef.get();
      const updatedRun = await runRef.get();
      res.json({
        run: serializeDoc(updatedRun),
        item: serializeDoc(updatedItem),
      });
    } catch (error) {
      console.error(
        '[ExamQualityControl] Rollback failed:',
        error,
      );
      res.status(error.status || 500).json({
        error: error.message || 'Failed to roll back repair',
      });
    }
  },
);

module.exports = router;
module.exports._test = {
  buildRunInventory,
  enforceAuditGate,
  mapWithConcurrency,
};
