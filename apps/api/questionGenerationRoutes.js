const express = require('express');
const { requireAdmin } = require('./middleware/auth');
const {
  PROMPT_VERSION,
  buildQuestionForPublish,
  buildQuestionGenerationPrompt,
  generateQuestionsFromPrompt,
  getGenerationModel,
  isPublishEligible,
  normalizeTextFingerprint,
  resolveSubcategoryOrThrow,
  validateDraftQuestion,
  verifyDraftQuestion,
} = require('./questionGenerationService');

const router = express.Router();

const verifyAdminAccess = requireAdmin({
  authLogLabel: '[QuestionGeneration] Error verifying token',
  adminLogLabel: '[QuestionGeneration] Error checking admin access',
});

const MAX_GENERATION_COUNT = parseInt(process.env.OPENAI_QUESTION_GENERATION_MAX_COUNT || '20', 10);

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

function normalizeQuantity(quantity) {
  const parsed = Number.parseInt(quantity, 10);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error('quantity must be a positive integer');
  }
  if (parsed > MAX_GENERATION_COUNT) {
    throw new Error(`quantity cannot exceed ${MAX_GENERATION_COUNT}`);
  }
  return parsed;
}

async function findExistingQuestionByText(db, text) {
  const snapshot = await db
    .collection('questions')
    .where('text', '==', text)
    .limit(1)
    .get();

  return snapshot.empty ? null : snapshot.docs[0].id;
}

async function getRunOr404(db, runId) {
  const runRef = db.collection('questionGenerationRuns').doc(runId);
  const runSnap = await runRef.get();
  if (!runSnap.exists) {
    const error = new Error('Generation run not found');
    error.status = 404;
    throw error;
  }
  return { runRef, runSnap, run: runSnap.data() };
}

async function getDraftOr404(runRef, draftId) {
  const draftRef = runRef.collection('draftQuestions').doc(draftId);
  const draftSnap = await draftRef.get();
  if (!draftSnap.exists) {
    const error = new Error('Draft question not found');
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
  const existingQuestionId = await findExistingQuestionByText(db, question.text);
  const siblingTexts = await getSiblingFingerprints(runRef, draftId);
  siblingTexts.push(normalizeTextFingerprint(question.text));

  return validateDraftQuestion(question, {
    selectedSubcategory,
    requestedDifficulty,
    existingQuestionId,
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
  const drafts = draftSnapshot.docs.map(doc => doc.data());
  const stats = getRunStats(drafts);
  await runRef.set({
    stats,
    updatedAt: new Date(),
  }, { merge: true });
  return stats;
}

router.post('/prompt-preview', verifyAdminAccess, async (req, res) => {
  try {
    const { subcategory, difficulty = 'medium', quantity = 5 } = req.body || {};
    const count = normalizeQuantity(quantity);
    const entry = resolveSubcategoryOrThrow(subcategory);
    const prompt = buildQuestionGenerationPrompt({
      subcategory: entry.kebab,
      difficulty,
      quantity: count,
    });

    res.json({
      prompt,
      promptVersion: PROMPT_VERSION,
      model: getGenerationModel(),
      subcategory: entry,
      quantity: count,
      difficulty,
    });
  } catch (error) {
    res.status(error.status || 400).json({ error: error.message || 'Failed to build prompt preview' });
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
      quantity = 5,
      promptOverride,
    } = req.body || {};

    const count = normalizeQuantity(quantity);
    const entry = resolveSubcategoryOrThrow(subcategory);
    const prompt = typeof promptOverride === 'string' && promptOverride.trim()
      ? promptOverride.trim()
      : buildQuestionGenerationPrompt({
          subcategory: entry.kebab,
          difficulty,
          quantity: count,
        });

    const now = new Date();
    const runRef = req.db.collection('questionGenerationRuns').doc();
    const runData = {
      subcategory: entry.kebab,
      subcategoryDisplayName: entry.name,
      subcategoryId: entry.id,
      mainCategory: entry.mainCategory,
      subjectArea: entry.section,
      difficulty,
      quantity: count,
      prompt,
      promptVersion: PROMPT_VERSION,
      model: getGenerationModel(),
      createdBy: req.user.uid,
      status: 'generating',
      stats: { total: 0 },
      createdAt: now,
      updatedAt: now,
    };

    await runRef.set(runData);

    let generated;
    try {
      generated = await generateQuestionsFromPrompt({
        prompt,
        subcategory: entry.kebab,
        difficulty,
        quantity: count,
      });
    } catch (error) {
      await runRef.set({
        status: 'failed',
        error: error.message,
        updatedAt: new Date(),
      }, { merge: true });
      throw error;
    }

    const fingerprints = generated.questions.map(question => normalizeTextFingerprint(question.text));
    const drafts = [];

    for (let index = 0; index < generated.questions.length; index += 1) {
      const draft = generated.questions[index];
      const draftRef = runRef.collection('draftQuestions').doc();
      const existingQuestionId = await findExistingQuestionByText(req.db, draft.text);
      const deterministic = validateDraftQuestion(draft, {
        selectedSubcategory: entry.kebab,
        requestedDifficulty: difficulty,
        existingQuestionId,
        siblingTexts: fingerprints,
      });

      let validation = { deterministic };
      let status = deterministic.valid ? 'generated' : 'format_failed';

      if (deterministic.valid) {
        try {
          validation = await verifyDraftQuestion(draft, {
            subcategory: entry.kebab,
            requestedDifficulty: difficulty,
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
        model: generated.model,
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
      usage: generated.usage || null,
      rawOutput: generated.rawOutput ? generated.rawOutput.slice(0, 12000) : null,
      updatedAt: new Date(),
    }, { merge: true });

    res.status(201).json({
      run: serializeRun({ id: runRef.id, data: () => ({ ...runData, status: 'completed', stats }) }),
      drafts,
    });
  } catch (error) {
    console.error('[QuestionGeneration] Failed to create run:', error);
    res.status(error.status || 500).json({ error: error.message || 'Failed to generate questions' });
  }
});

router.get('/runs', verifyAdminAccess, async (req, res) => {
  try {
    if (!req.db) {
      return res.status(500).json({ error: 'Firestore not available' });
    }

    const limitCount = Math.min(Number.parseInt(req.query.limit || '20', 10), 50);
    const snapshot = await req.db
      .collection('questionGenerationRuns')
      .orderBy('createdAt', 'desc')
      .limit(limitCount)
      .get();

    res.json({
      runs: snapshot.docs.map(serializeRun),
    });
  } catch (error) {
    console.error('[QuestionGeneration] Failed to list runs:', error);
    res.status(500).json({ error: 'Failed to list generation runs' });
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
    res.status(error.status || 500).json({ error: error.message || 'Failed to fetch generation run' });
  }
});

router.patch('/runs/:runId/drafts/:draftId', verifyAdminAccess, async (req, res) => {
  try {
    if (!req.db) {
      return res.status(500).json({ error: 'Firestore not available' });
    }

    const { runRef, run } = await getRunOr404(req.db, req.params.runId);
    const { draftRef, draft } = await getDraftOr404(runRef, req.params.draftId);

    const allowedFields = [
      'text',
      'options',
      'correctAnswer',
      'explanation',
      'difficulty',
      'skillTags',
    ];
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
    console.error('[QuestionGeneration] Failed to update draft:', error);
    res.status(error.status || 500).json({ error: error.message || 'Failed to update draft' });
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

    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('[QuestionGeneration] Failed to delete draft:', error);
    res.status(error.status || 500).json({ error: error.message || 'Failed to delete draft' });
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
      draft: serializeDraft({
        id: draftRef.id,
        data: () => ({ ...draft, ...updates }),
      }),
    });
  } catch (error) {
    console.error('[QuestionGeneration] Failed to verify draft:', error);
    res.status(error.status || 500).json({ error: error.message || 'Failed to verify draft' });
  }
});

async function publishDraft(req, runRef, draftRef, draft) {
  const draftWithId = { ...draft, id: draftRef.id, runId: runRef.id };
  if (!isPublishEligible(draftWithId)) {
    throw new Error('Draft is not eligible for publishing. Rerun verification and resolve all flags first.');
  }

  const existingQuestionId = await findExistingQuestionByText(req.db, draft.text);
  if (existingQuestionId) {
    throw new Error(`Duplicate question already exists in questions/${existingQuestionId}`);
  }

  const questionData = buildQuestionForPublish(draftWithId);
  const questionRef = await req.db.collection('questions').add({
    ...questionData,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  await draftRef.set({
    status: 'published',
    publishedQuestionId: questionRef.id,
    publishedAt: new Date(),
    updatedAt: new Date(),
  }, { merge: true });

  return questionRef.id;
}

router.post('/runs/:runId/drafts/:draftId/publish', verifyAdminAccess, async (req, res) => {
  try {
    if (!req.db) {
      return res.status(500).json({ error: 'Firestore not available' });
    }

    const { runRef } = await getRunOr404(req.db, req.params.runId);
    const { draftRef, draft } = await getDraftOr404(runRef, req.params.draftId);
    const questionId = await publishDraft(req, runRef, draftRef, draft);
    await updateRunStats(runRef);

    res.json({
      success: true,
      questionId,
    });
  } catch (error) {
    console.error('[QuestionGeneration] Failed to publish draft:', error);
    res.status(error.status || 400).json({ error: error.message || 'Failed to publish draft' });
  }
});

router.post('/runs/:runId/publish', verifyAdminAccess, async (req, res) => {
  try {
    if (!req.db) {
      return res.status(500).json({ error: 'Firestore not available' });
    }

    const { draftIds } = req.body || {};
    if (!Array.isArray(draftIds) || draftIds.length === 0) {
      return res.status(400).json({ error: 'draftIds array is required' });
    }

    const { runRef } = await getRunOr404(req.db, req.params.runId);
    const results = [];

    for (const draftId of draftIds) {
      try {
        const { draftRef, draft } = await getDraftOr404(runRef, String(draftId));
        const questionId = await publishDraft(req, runRef, draftRef, draft);
        results.push({ draftId, success: true, questionId });
      } catch (error) {
        results.push({ draftId, success: false, error: error.message });
      }
    }

    await updateRunStats(runRef);
    const success = results.every(result => result.success);
    res.status(success ? 200 : 207).json({
      success,
      results,
    });
  } catch (error) {
    console.error('[QuestionGeneration] Failed to publish drafts:', error);
    res.status(error.status || 500).json({ error: error.message || 'Failed to publish drafts' });
  }
});

module.exports = router;
