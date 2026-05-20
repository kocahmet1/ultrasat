const express = require('express');
const { requireAdmin } = require('./middleware/auth');
const {
  PROMPT_VERSION,
  canOverridePublish,
  collectRevisionNotices,
  getPublishBlockers,
  getReviewModel,
  isPublishEligible,
  normalizeGeneratedQuestion,
  normalizeTextFingerprint,
  resolveSubcategoryOrThrow,
  reviseDraftQuestion,
  validateDraftQuestion,
  verifyDraftQuestion,
} = require('./questionGenerationService');

const router = express.Router();

const verifyAdminAccess = requireAdmin({
  authLogLabel: '[QuestionAudit] Error verifying token',
  adminLogLabel: '[QuestionAudit] Error checking admin access',
});

const MAX_AUDIT_COUNT = parseInt(process.env.OPENAI_QUESTION_AUDIT_MAX_COUNT || '50', 10);

function timestampToIso(value) {
  if (!value) return null;
  if (typeof value.toDate === 'function') return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'string') return value;
  return null;
}

function serializeRun(doc) {
  const data = doc.data ? doc.data() : doc;
  return {
    id: doc.id || data.id,
    ...data,
    createdAt: timestampToIso(data.createdAt),
    updatedAt: timestampToIso(data.updatedAt),
  };
}

function serializeDraft(doc) {
  const data = doc.data ? doc.data() : doc;
  return {
    id: doc.id || data.id,
    ...data,
    createdAt: timestampToIso(data.createdAt),
    updatedAt: timestampToIso(data.updatedAt),
    verifiedAt: timestampToIso(data.verifiedAt),
    publishedAt: timestampToIso(data.publishedAt),
  };
}

function serializeQuestionCandidate(question) {
  return {
    id: question.id,
    text: question.text || question.question || question.prompt || '',
    options: Array.isArray(question.options) ? question.options : [],
    correctAnswer: question.correctAnswer ?? question.answer ?? question.correct_answer ?? null,
    explanation: normalizeExplanation(question.explanation),
    difficulty: question.difficulty || null,
    subcategory: question.subcategory || question.subCategory || question.subcategoryId || null,
    subcategoryId: question.subcategoryId ?? null,
    source: question.source || null,
    usageContext: question.usageContext || 'general',
    createdAt: timestampToIso(question.createdAt),
    updatedAt: timestampToIso(question.updatedAt),
  };
}

function normalizeLimit(limit) {
  const parsed = Number.parseInt(limit, 10);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error('limit must be a positive integer');
  }
  if (parsed > MAX_AUDIT_COUNT) {
    throw new Error(`limit cannot exceed ${MAX_AUDIT_COUNT}`);
  }
  return parsed;
}

function normalizeExplanation(explanation) {
  if (Array.isArray(explanation)) return explanation.join('\n').trim();
  if (explanation === null || explanation === undefined) return '';
  return String(explanation).trim();
}

function normalizeExistingQuestionForAudit(questionId, rawQuestion, {
  subcategory,
  difficulty,
  index,
}) {
  const normalized = normalizeGeneratedQuestion({
    text: rawQuestion.text || rawQuestion.question || rawQuestion.prompt || '',
    options: rawQuestion.options || rawQuestion.choices || [],
    correctAnswer: rawQuestion.correctAnswer ?? rawQuestion.answer ?? rawQuestion.correct_answer,
    explanation: normalizeExplanation(rawQuestion.explanation),
    difficulty: rawQuestion.difficulty || difficulty,
    subcategory: rawQuestion.subcategory || rawQuestion.subCategory || rawQuestion.subcategoryId || subcategory,
    skillTags: rawQuestion.skillTags || [],
  }, {
    subcategory,
    difficulty,
    index,
  });

  return {
    ...normalized,
    originalQuestionId: questionId,
    originalSource: rawQuestion.source || null,
    originalUsageContext: rawQuestion.usageContext || 'general',
    source: 'existing-question-audit',
    usageContext: rawQuestion.usageContext || 'general',
    graphUrl: rawQuestion.graphUrl || null,
    graphDescription: rawQuestion.graphDescription || null,
    originalQuestionSnapshot: {
      text: rawQuestion.text || '',
      options: Array.isArray(rawQuestion.options) ? rawQuestion.options : [],
      correctAnswer: rawQuestion.correctAnswer ?? null,
      explanation: normalizeExplanation(rawQuestion.explanation),
      difficulty: rawQuestion.difficulty || null,
      subcategory: rawQuestion.subcategory || rawQuestion.subCategory || rawQuestion.subcategoryId || null,
      skillTags: Array.isArray(rawQuestion.skillTags) ? rawQuestion.skillTags : [],
      source: rawQuestion.source || null,
      usageContext: rawQuestion.usageContext || null,
    },
  };
}

async function findDuplicateQuestionByText(db, text, allowedQuestionId = null) {
  const snapshot = await db
    .collection('questions')
    .where('text', '==', text)
    .limit(5)
    .get();

  const duplicate = snapshot.docs.find(doc => doc.id !== allowedQuestionId);
  return duplicate ? duplicate.id : null;
}

async function getRunOr404(db, runId) {
  const runRef = db.collection('questionAuditRuns').doc(runId);
  const runSnap = await runRef.get();
  if (!runSnap.exists) {
    const error = new Error('Audit run not found');
    error.status = 404;
    throw error;
  }
  return { runRef, runSnap, run: runSnap.data() };
}

async function getDraftOr404(runRef, draftId) {
  const draftRef = runRef.collection('draftQuestions').doc(draftId);
  const draftSnap = await draftRef.get();
  if (!draftSnap.exists) {
    const error = new Error('Audit draft not found');
    error.status = 404;
    throw error;
  }
  return { draftRef, draftSnap, draft: draftSnap.data() };
}

async function getSiblingFingerprints(runRef, skipDraftId = null) {
  const draftSnapshot = await runRef.collection('draftQuestions').get();
  return draftSnapshot.docs
    .filter(doc => doc.id !== skipDraftId)
    .map(doc => normalizeTextFingerprint(doc.data().text));
}

async function buildDraftValidation(db, runRef, question, {
  selectedSubcategory,
  requestedDifficulty,
  draftId = null,
}) {
  const existingQuestionId = await findDuplicateQuestionByText(
    db,
    question.text,
    question.originalQuestionId || null,
  );
  const siblingTexts = await getSiblingFingerprints(runRef, draftId);
  siblingTexts.push(normalizeTextFingerprint(question.text));

  return validateDraftQuestion(question, {
    selectedSubcategory,
    requestedDifficulty,
    existingQuestionId,
    allowedDuplicateQuestionId: question.originalQuestionId || null,
    siblingTexts,
  });
}

function getRunStats(drafts) {
  return drafts.reduce((stats, draft) => {
    stats.total += 1;
    stats[draft.status] = (stats[draft.status] || 0) + 1;
    return stats;
  }, { total: 0 });
}

async function updateRunStats(runRef) {
  const draftSnapshot = await runRef.collection('draftQuestions').get();
  const stats = getRunStats(draftSnapshot.docs.map(doc => doc.data()));
  await runRef.set({ stats, updatedAt: new Date() }, { merge: true });
  return stats;
}

async function fetchQuestionsForAudit(db, {
  subcategory,
  difficulty,
  limit,
}) {
  const entry = resolveSubcategoryOrThrow(subcategory);
  const questionsCol = db.collection('questions');
  const queryLimit = Math.max(limit, 10);
  const queries = [
    questionsCol.where('subcategory', '==', entry.kebab).where('difficulty', '==', difficulty).limit(queryLimit).get(),
    questionsCol.where('subCategory', '==', entry.kebab).where('difficulty', '==', difficulty).limit(queryLimit).get(),
    questionsCol.where('subcategoryId', '==', entry.id).where('difficulty', '==', difficulty).limit(queryLimit).get(),
  ];

  const snapshots = await Promise.all(queries);
  const byId = new Map();
  snapshots.forEach(snapshot => {
    snapshot.docs.forEach(doc => {
      if (!byId.has(doc.id)) {
        byId.set(doc.id, { id: doc.id, ...doc.data() });
      }
    });
  });

  return Array.from(byId.values()).slice(0, limit);
}

async function fetchQuestionsByIds(db, questionIds) {
  const uniqueIds = Array.from(new Set(questionIds.map(id => String(id || '').trim()).filter(Boolean)));
  const questions = [];

  for (const questionId of uniqueIds) {
    const doc = await db.collection('questions').doc(questionId).get();
    if (!doc.exists) {
      const error = new Error(`Question not found: ${questionId}`);
      error.status = 404;
      throw error;
    }
    questions.push({ id: doc.id, ...doc.data() });
  }

  return questions;
}

router.get('/questions', verifyAdminAccess, async (req, res) => {
  try {
    if (!req.db) {
      return res.status(500).json({ error: 'Firestore not available' });
    }

    const {
      subcategory,
      difficulty = 'medium',
      limit = 25,
    } = req.query || {};

    if (!['easy', 'medium', 'hard'].includes(String(difficulty).toLowerCase())) {
      return res.status(400).json({ error: 'difficulty must be easy, medium, or hard' });
    }

    const count = normalizeLimit(limit);
    const normalizedDifficulty = String(difficulty).toLowerCase();
    const entry = resolveSubcategoryOrThrow(subcategory);
    const questions = await fetchQuestionsForAudit(req.db, {
      subcategory: entry.kebab,
      difficulty: normalizedDifficulty,
      limit: count,
    });

    res.json({
      questions: questions.map(serializeQuestionCandidate),
      subcategory: entry.kebab,
      subcategoryDisplayName: entry.name,
      difficulty: normalizedDifficulty,
      limit: count,
    });
  } catch (error) {
    console.error('[QuestionAudit] Failed to load candidate questions:', error);
    res.status(error.status || 500).json({ error: error.message || 'Failed to load candidate questions' });
  }
});

router.delete('/questions', verifyAdminAccess, async (req, res) => {
  try {
    if (!req.db) {
      return res.status(500).json({ error: 'Firestore not available' });
    }

    const {
      questionIds,
      auditRunId = '',
      draftIds = [],
    } = req.body || {};
    const ids = Array.isArray(questionIds)
      ? Array.from(new Set(questionIds.map(id => String(id || '').trim()).filter(Boolean)))
      : [];

    if (ids.length === 0) {
      return res.status(400).json({ error: 'questionIds array is required' });
    }
    if (ids.length > MAX_AUDIT_COUNT) {
      return res.status(400).json({ error: `Cannot delete more than ${MAX_AUDIT_COUNT} questions at once` });
    }

    const batch = req.db.batch();
    const results = [];

    for (const questionId of ids) {
      const questionRef = req.db.collection('questions').doc(questionId);
      const questionSnap = await questionRef.get();
      if (!questionSnap.exists) {
        results.push({ questionId, success: false, error: 'Question not found' });
        continue;
      }

      batch.delete(questionRef);
      results.push({ questionId, success: true });
    }

    if (results.some(result => result.success)) {
      await batch.commit();
    }

    const updatedDraftIds = [];
    if (auditRunId && Array.isArray(draftIds) && draftIds.length > 0) {
      const { runRef } = await getRunOr404(req.db, String(auditRunId));
      const successfulIds = new Set(results.filter(result => result.success).map(result => result.questionId));

      for (const draftId of draftIds.map(id => String(id || '').trim()).filter(Boolean)) {
        const draftRef = runRef.collection('draftQuestions').doc(draftId);
        const draftSnap = await draftRef.get();
        if (!draftSnap.exists) continue;
        const draft = draftSnap.data();
        if (!successfulIds.has(draft.originalQuestionId)) continue;

        await draftRef.set({
          status: 'deleted_original',
          originalQuestionDeletedAt: new Date(),
          updatedAt: new Date(),
        }, { merge: true });
        updatedDraftIds.push(draftId);
      }

      if (updatedDraftIds.length > 0) {
        await updateRunStats(runRef);
      }
    }

    const success = results.every(result => result.success);
    res.status(success ? 200 : 207).json({
      success,
      deletedCount: results.filter(result => result.success).length,
      results,
      updatedDraftIds,
    });
  } catch (error) {
    console.error('[QuestionAudit] Failed to delete questions:', error);
    res.status(error.status || 500).json({ error: error.message || 'Failed to delete questions' });
  }
});

router.post('/runs', verifyAdminAccess, async (req, res) => {
  try {
    if (!req.db) {
      return res.status(500).json({ error: 'Firestore not available' });
    }

    const {
      subcategory,
      difficulty = 'medium',
      limit = 10,
      questionIds,
    } = req.body || {};

    if (!['easy', 'medium', 'hard'].includes(String(difficulty).toLowerCase())) {
      return res.status(400).json({ error: 'difficulty must be easy, medium, or hard' });
    }

    const selectedQuestionIds = Array.isArray(questionIds)
      ? Array.from(new Set(questionIds.map(id => String(id || '').trim()).filter(Boolean)))
      : [];
    const count = selectedQuestionIds.length > 0
      ? normalizeLimit(selectedQuestionIds.length)
      : normalizeLimit(limit);
    const normalizedDifficulty = String(difficulty).toLowerCase();
    const entry = resolveSubcategoryOrThrow(subcategory);
    const questions = selectedQuestionIds.length > 0
      ? await fetchQuestionsByIds(req.db, selectedQuestionIds)
      : await fetchQuestionsForAudit(req.db, {
          subcategory: entry.kebab,
          difficulty: normalizedDifficulty,
          limit: count,
        });

    const now = new Date();
    const runRef = req.db.collection('questionAuditRuns').doc();
    const runData = {
      subcategory: entry.kebab,
      subcategoryDisplayName: entry.name,
      subcategoryId: entry.id,
      mainCategory: entry.mainCategory,
      subjectArea: entry.section,
      difficulty: normalizedDifficulty,
      quantity: count,
      sourceQuestionCount: questions.length,
      sourceQuestionIds: questions.map(question => question.id),
      promptVersion: PROMPT_VERSION,
      model: getReviewModel(),
      createdBy: req.user.uid,
      status: 'running',
      stats: { total: 0 },
      createdAt: now,
      updatedAt: now,
    };

    await runRef.set(runData);

    const draftQuestions = questions.map((question, index) => normalizeExistingQuestionForAudit(question.id, question, {
      subcategory: entry.kebab,
      difficulty: normalizedDifficulty,
      index,
    }));
    const fingerprints = draftQuestions.map(question => normalizeTextFingerprint(question.text));
    const drafts = [];

    for (let index = 0; index < draftQuestions.length; index += 1) {
      const draft = draftQuestions[index];
      const draftRef = runRef.collection('draftQuestions').doc();
      const existingQuestionId = await findDuplicateQuestionByText(req.db, draft.text, draft.originalQuestionId);
      const deterministic = validateDraftQuestion(draft, {
        selectedSubcategory: entry.kebab,
        requestedDifficulty: normalizedDifficulty,
        existingQuestionId,
        allowedDuplicateQuestionId: draft.originalQuestionId,
        siblingTexts: fingerprints,
      });

      let validation = { deterministic };
      let status = deterministic.valid ? 'needs_revision' : 'format_failed';

      if (deterministic.valid) {
        try {
          validation = await verifyDraftQuestion(draft, {
            subcategory: entry.kebab,
            requestedDifficulty: normalizedDifficulty,
            deterministic,
          });
          status = validation.status;
        } catch (verifyError) {
          validation.reviewError = verifyError.message;
          status = 'needs_revision';
        }
      }

      const draftData = {
        ...draft,
        runId: runRef.id,
        status,
        validation,
        generatedIndex: index,
        createdAt: new Date(),
        updatedAt: new Date(),
        verifiedAt: validation.solver && validation.review ? new Date() : null,
      };

      if (validation.calibratedDifficulty) {
        draftData.calibratedDifficulty = validation.calibratedDifficulty;
      }

      await draftRef.set(draftData);
      drafts.push(serializeDraft({ id: draftRef.id, data: () => draftData }));
    }

    const stats = getRunStats(drafts);
    await runRef.set({
      status: 'completed',
      stats,
      updatedAt: new Date(),
    }, { merge: true });

    res.status(201).json({
      run: serializeRun({ id: runRef.id, data: () => ({ ...runData, status: 'completed', stats }) }),
      drafts,
    });
  } catch (error) {
    console.error('[QuestionAudit] Failed to create audit run:', error);
    res.status(error.status || 500).json({ error: error.message || 'Failed to audit existing questions' });
  }
});

router.get('/runs', verifyAdminAccess, async (req, res) => {
  try {
    if (!req.db) {
      return res.status(500).json({ error: 'Firestore not available' });
    }

    const limitCount = Math.min(Number.parseInt(req.query.limit || '20', 10), 50);
    const snapshot = await req.db
      .collection('questionAuditRuns')
      .orderBy('createdAt', 'desc')
      .limit(limitCount)
      .get();

    res.json({
      runs: snapshot.docs.map(serializeRun),
    });
  } catch (error) {
    console.error('[QuestionAudit] Failed to list audit runs:', error);
    res.status(500).json({ error: 'Failed to list audit runs' });
  }
});

router.get('/runs/:runId', verifyAdminAccess, async (req, res) => {
  try {
    if (!req.db) {
      return res.status(500).json({ error: 'Firestore not available' });
    }

    const { runRef, runSnap } = await getRunOr404(req.db, req.params.runId);
    const draftSnapshot = await runRef
      .collection('draftQuestions')
      .orderBy('generatedIndex', 'asc')
      .get();

    res.json({
      run: serializeRun(runSnap),
      drafts: draftSnapshot.docs.map(serializeDraft),
    });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || 'Failed to fetch audit run' });
  }
});

router.patch('/runs/:runId/drafts/:draftId', verifyAdminAccess, async (req, res) => {
  try {
    if (!req.db) {
      return res.status(500).json({ error: 'Firestore not available' });
    }

    const { runRef, run } = await getRunOr404(req.db, req.params.runId);
    const { draftRef, draft } = await getDraftOr404(runRef, req.params.draftId);
    const allowedFields = ['text', 'options', 'correctAnswer', 'explanation', 'difficulty', 'skillTags'];
    const updates = {};

    allowedFields.forEach(field => {
      if (Object.prototype.hasOwnProperty.call(req.body || {}, field)) {
        updates[field] = req.body[field];
      }
    });

    const updatedDraft = {
      ...draft,
      ...updates,
      updatedAt: new Date(),
    };

    if (Array.isArray(updatedDraft.options)) {
      updatedDraft.options = updatedDraft.options.map(option => String(option ?? '').trim());
    }
    if (updatedDraft.correctAnswer !== undefined) {
      updatedDraft.correctAnswer = Number.parseInt(updatedDraft.correctAnswer, 10);
    }

    const deterministic = await buildDraftValidation(req.db, runRef, updatedDraft, {
      selectedSubcategory: run.subcategory,
      requestedDifficulty: run.difficulty,
      draftId: req.params.draftId,
    });

    updatedDraft.validation = {
      deterministic,
      editedAfterVerification: true,
    };
    updatedDraft.status = deterministic.valid ? 'needs_revision' : 'format_failed';
    updatedDraft.verifiedAt = null;

    await draftRef.set(updatedDraft, { merge: true });
    await updateRunStats(runRef);

    res.json({
      draft: serializeDraft({ id: draftRef.id, data: () => updatedDraft }),
    });
  } catch (error) {
    console.error('[QuestionAudit] Failed to update draft:', error);
    res.status(error.status || 500).json({ error: error.message || 'Failed to update audit draft' });
  }
});

router.delete('/runs/:runId/drafts/:draftId', verifyAdminAccess, async (req, res) => {
  try {
    if (!req.db) {
      return res.status(500).json({ error: 'Firestore not available' });
    }

    const { runRef } = await getRunOr404(req.db, req.params.runId);
    const { draftRef } = await getDraftOr404(runRef, req.params.draftId);
    await draftRef.delete();
    const stats = await updateRunStats(runRef);

    res.json({ success: true, stats });
  } catch (error) {
    console.error('[QuestionAudit] Failed to remove draft:', error);
    res.status(error.status || 500).json({ error: error.message || 'Failed to remove audit draft' });
  }
});

router.post('/runs/:runId/drafts/:draftId/verify', verifyAdminAccess, async (req, res) => {
  try {
    if (!req.db) {
      return res.status(500).json({ error: 'Firestore not available' });
    }

    const { runRef, run } = await getRunOr404(req.db, req.params.runId);
    const { draftRef, draft } = await getDraftOr404(runRef, req.params.draftId);
    const deterministic = await buildDraftValidation(req.db, runRef, draft, {
      selectedSubcategory: run.subcategory,
      requestedDifficulty: run.difficulty,
      draftId: req.params.draftId,
    });

    let validation = { deterministic };
    let status = deterministic.valid ? 'needs_revision' : 'format_failed';

    if (deterministic.valid) {
      validation = await verifyDraftQuestion(draft, {
        subcategory: run.subcategory,
        requestedDifficulty: run.difficulty,
        deterministic,
      });
      status = validation.status;
    }

    const updates = {
      validation,
      status,
      calibratedDifficulty: validation.calibratedDifficulty || null,
      verifiedAt: new Date(),
      updatedAt: new Date(),
    };

    await draftRef.set(updates, { merge: true });
    await updateRunStats(runRef);

    res.json({
      draft: serializeDraft({ id: draftRef.id, data: () => ({ ...draft, ...updates }) }),
    });
  } catch (error) {
    console.error('[QuestionAudit] Failed to verify draft:', error);
    res.status(error.status || 500).json({ error: error.message || 'Failed to verify audit draft' });
  }
});

router.post('/runs/:runId/drafts/:draftId/revise', verifyAdminAccess, async (req, res) => {
  try {
    if (!req.db) {
      return res.status(500).json({ error: 'Firestore not available' });
    }

    const { customInstruction = '' } = req.body || {};
    const { runRef, run } = await getRunOr404(req.db, req.params.runId);
    const { draftRef, draft } = await getDraftOr404(runRef, req.params.draftId);
    const notices = collectRevisionNotices(draft);
    const revision = await reviseDraftQuestion({
      draft,
      subcategory: run.subcategory,
      requestedDifficulty: run.difficulty,
      notices,
      customInstruction,
    });

    const revisedDraft = {
      ...draft,
      ...revision.question,
      source: 'existing-question-audit',
      originalQuestionId: draft.originalQuestionId,
      originalQuestionSnapshot: draft.originalQuestionSnapshot || null,
      originalSource: draft.originalSource || null,
      originalUsageContext: draft.originalUsageContext || 'general',
      usageContext: draft.usageContext || draft.originalUsageContext || 'general',
      graphUrl: draft.graphUrl || null,
      graphDescription: draft.graphDescription || null,
      runId: runRef.id,
      generatedIndex: draft.generatedIndex,
      revisionCount: (draft.revisionCount || 0) + 1,
    };

    const deterministic = await buildDraftValidation(req.db, runRef, revisedDraft, {
      selectedSubcategory: run.subcategory,
      requestedDifficulty: run.difficulty,
      draftId: req.params.draftId,
    });

    let validation = { deterministic };
    let status = deterministic.valid ? 'needs_revision' : 'format_failed';

    if (deterministic.valid) {
      validation = await verifyDraftQuestion(revisedDraft, {
        subcategory: run.subcategory,
        requestedDifficulty: run.difficulty,
        deterministic,
      });
      status = validation.status;
    }

    const revisionHistoryEntry = {
      revisedAt: new Date(),
      model: revision.model,
      notices,
      previous: {
        text: draft.text,
        options: draft.options,
        correctAnswer: draft.correctAnswer,
        explanation: draft.explanation,
        difficulty: draft.difficulty,
        status: draft.status,
        qualityScore: draft.validation?.review?.qualityScore ?? null,
        styleScore: draft.validation?.review?.collegeBoardStyleScore ?? null,
      },
      usage: revision.usage || null,
    };
    const revisionHistory = [
      revisionHistoryEntry,
      ...(Array.isArray(draft.revisionHistory) ? draft.revisionHistory : []),
    ].slice(0, 8);

    const updates = {
      ...revision.question,
      source: 'existing-question-audit',
      originalQuestionId: draft.originalQuestionId,
      originalQuestionSnapshot: draft.originalQuestionSnapshot || null,
      originalSource: draft.originalSource || null,
      originalUsageContext: draft.originalUsageContext || 'general',
      usageContext: draft.usageContext || draft.originalUsageContext || 'general',
      graphUrl: draft.graphUrl || null,
      graphDescription: draft.graphDescription || null,
      status,
      validation,
      calibratedDifficulty: validation.calibratedDifficulty || null,
      revisionCount: revisedDraft.revisionCount,
      revisionHistory,
      lastRevisionNotices: notices,
      lastRevisionModel: revision.model,
      lastRevisionUsage: revision.usage || null,
      rawRevisionOutput: revision.rawOutput ? revision.rawOutput.slice(0, 12000) : null,
      verifiedAt: validation.solver && validation.review ? new Date() : null,
      updatedAt: new Date(),
    };

    await draftRef.set(updates, { merge: true });
    await updateRunStats(runRef);

    res.json({
      draft: serializeDraft({ id: draftRef.id, data: () => ({ ...draft, ...updates }) }),
    });
  } catch (error) {
    console.error('[QuestionAudit] Failed to revise draft:', error);
    res.status(error.status || 500).json({ error: error.message || 'Failed to revise audit draft' });
  }
});

function buildQuestionUpdateFromDraft(draft, {
  runId,
  draftId,
  override,
  blockers,
}) {
  const update = {
    text: draft.text,
    questionType: 'multiple-choice',
    options: draft.options,
    correctAnswer: draft.correctAnswer,
    explanation: draft.explanation,
    difficulty: draft.requestedDifficulty || draft.difficulty,
    calibratedDifficulty: draft.validation?.calibratedDifficulty || draft.calibratedDifficulty || draft.difficulty,
    subcategory: draft.subcategory,
    subCategory: draft.subCategory || draft.subcategory,
    subcategoryId: draft.subcategoryId,
    categoryPath: draft.categoryPath || null,
    mainCategory: draft.mainCategory || null,
    subjectArea: draft.subjectArea || null,
    usageContext: draft.usageContext || draft.originalUsageContext || 'general',
    skillTags: Array.isArray(draft.skillTags) ? draft.skillTags : [],
    graphUrl: draft.graphUrl || null,
    graphDescription: draft.graphDescription || null,
    latestAudit: {
      runId,
      draftId,
      status: draft.status,
      qualityScore: draft.validation?.review?.qualityScore ?? null,
      styleScore: draft.validation?.review?.collegeBoardStyleScore ?? null,
      calibratedDifficulty: draft.validation?.calibratedDifficulty || null,
      answerKeyMatches: draft.validation?.answerKeyMatches ?? null,
      blockers,
      override,
      publishedAt: new Date(),
    },
    updatedAt: new Date(),
  };

  if (draft.originalSource) {
    update.source = draft.originalSource;
  }

  return update;
}

async function publishAuditDraft(req, runRef, draftRef, draft, {
  override = false,
  overrideReason = '',
} = {}) {
  if (!draft.originalQuestionId) {
    const error = new Error('Audit draft is missing originalQuestionId');
    error.status = 400;
    throw error;
  }

  const draftWithId = { ...draft, id: draftRef.id, runId: runRef.id };
  const eligible = isPublishEligible(draftWithId);
  const blockers = getPublishBlockers(draftWithId);

  if (!eligible) {
    if (!override) {
      const error = new Error('Audit draft is not eligible for publishing. Rerun verification and resolve all flags first.');
      error.status = 400;
      error.blockers = blockers;
      throw error;
    }

    if (!canOverridePublish(draftWithId)) {
      const error = new Error('This audit draft cannot be override-published because format validation or answer-key verification has not passed.');
      error.status = 400;
      error.blockers = blockers;
      throw error;
    }
  }

  const duplicateQuestionId = await findDuplicateQuestionByText(req.db, draft.text, draft.originalQuestionId);
  if (duplicateQuestionId) {
    const error = new Error(`Duplicate question already exists in questions/${duplicateQuestionId}`);
    error.status = 400;
    throw error;
  }

  const publishOverride = !eligible && override
    ? {
      forced: true,
      reason: String(overrideReason || '').trim() || 'Admin override from existing question audit.',
      blockers,
    }
    : null;

  const questionRef = req.db.collection('questions').doc(draft.originalQuestionId);
  const questionSnap = await questionRef.get();
  if (!questionSnap.exists) {
    const error = new Error('Original question no longer exists in the database.');
    error.status = 400;
    throw error;
  }

  const update = buildQuestionUpdateFromDraft(draft, {
    runId: runRef.id,
    draftId: draftRef.id,
    override: Boolean(publishOverride),
    blockers,
  });

  await questionRef.set({
    ...update,
    ...(publishOverride ? { publishOverride } : {}),
  }, { merge: true });

  await draftRef.set({
    status: 'published',
    publishedQuestionId: draft.originalQuestionId,
    publishedAt: new Date(),
    ...(publishOverride ? { publishOverride } : {}),
    updatedAt: new Date(),
  }, { merge: true });

  return {
    questionId: draft.originalQuestionId,
    override: Boolean(publishOverride),
    blockers,
  };
}

router.post('/runs/:runId/drafts/:draftId/publish', verifyAdminAccess, async (req, res) => {
  try {
    if (!req.db) {
      return res.status(500).json({ error: 'Firestore not available' });
    }

    const { runRef } = await getRunOr404(req.db, req.params.runId);
    const { draftRef, draft } = await getDraftOr404(runRef, req.params.draftId);
    const { override = false, overrideReason = '' } = req.body || {};
    const result = await publishAuditDraft(req, runRef, draftRef, draft, { override, overrideReason });
    await updateRunStats(runRef);

    res.json({ success: true, ...result });
  } catch (error) {
    console.error('[QuestionAudit] Failed to publish audit draft:', error);
    res.status(error.status || 400).json({
      error: error.message || 'Failed to publish audit draft',
      blockers: error.blockers || undefined,
    });
  }
});

router.post('/runs/:runId/publish', verifyAdminAccess, async (req, res) => {
  try {
    if (!req.db) {
      return res.status(500).json({ error: 'Firestore not available' });
    }

    const { draftIds, override = false, overrideReason = '' } = req.body || {};
    if (!Array.isArray(draftIds) || draftIds.length === 0) {
      return res.status(400).json({ error: 'draftIds array is required' });
    }

    const { runRef } = await getRunOr404(req.db, req.params.runId);
    const results = [];

    for (const draftId of draftIds) {
      try {
        const { draftRef, draft } = await getDraftOr404(runRef, String(draftId));
        const result = await publishAuditDraft(req, runRef, draftRef, draft, { override, overrideReason });
        results.push({ draftId, success: true, ...result });
      } catch (error) {
        results.push({ draftId, success: false, error: error.message, blockers: error.blockers || [] });
      }
    }

    await updateRunStats(runRef);
    const success = results.every(result => result.success);
    res.status(success ? 200 : 207).json({ success, results });
  } catch (error) {
    console.error('[QuestionAudit] Failed to publish audit drafts:', error);
    res.status(error.status || 500).json({ error: error.message || 'Failed to publish audit drafts' });
  }
});

module.exports = router;
