const express = require('express');
const fetch = require('node-fetch');

const router = express.Router();

const DEFAULT_QC_MODEL = process.env.OPENAI_QC_MODEL || process.env.OPENAI_MODEL || 'o4-mini';
const OPENAI_QC_MAX_OUTPUT_TOKENS = parseInt(process.env.OPENAI_QC_MAX_OUTPUT_TOKENS || '6000', 10);

const KNOWN_FLAG_TYPES = [
  'missing_information',
  'ambiguous_question',
  'multiple_correct_answers',
  'no_correct_answer',
  'answer_key_mismatch',
  'calculation_error',
  'typo_or_grammar',
  'formatting_issue',
  'off_syllabus',
  'too_easy',
  'too_hard',
  'content_error',
  'other'
];

const DEFAULT_FLAG_TYPE = 'other';

// --- Middleware helpers --------------------------------------------------

const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized - No token provided' });
    }

    const idToken = authHeader.split('Bearer ')[1];
    if (!idToken) {
      return res.status(401).json({ error: 'Unauthorized - Invalid token format' });
    }

    if (!req.admin) {
      return res.status(500).json({ error: 'Firebase Admin not available' });
    }

    const decodedToken = await req.admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('[QuestionQuality] Error verifying token:', error);
    return res.status(401).json({ error: 'Unauthorized - Invalid token' });
  }
};

// --- Answer choice rewriting helpers --------------------------------------

const extractOptionsFromQuestion = (questionData) => {
  // Try fields in order of preference
  const candidateFields = ['options', 'choices', 'answerChoices', 'answers'];
  let fieldUsed = null;
  let raw = null;

  for (const f of candidateFields) {
    if (questionData && questionData[f] !== undefined) {
      fieldUsed = f;
      raw = questionData[f];
      break;
    }
  }

  if (!fieldUsed) return { field: null, kind: 'none', options: [], objects: false };

  // Normalize to array of strings for modeling and UI
  if (Array.isArray(raw)) {
    if (raw.length > 0 && typeof raw[0] === 'object' && raw[0] !== null) {
      // Object array with possible text/value/option
      const arr = raw.map((obj) => {
        if (typeof obj.text === 'string') return obj.text;
        if (typeof obj.value === 'string') return obj.value;
        if (typeof obj.option === 'string') return obj.option;
        // Fallback to JSON string of object
        return JSON.stringify(obj);
      });
      return { field: fieldUsed, kind: 'array-object', options: arr, objects: true };
    }
    // Array of strings (or other primitives)
    const arr = raw.map((v) => (typeof v === 'string' ? v : String(v)));
    return { field: fieldUsed, kind: 'array-string', options: arr, objects: false };
  }

  if (raw && typeof raw === 'object') {
    // Object keyed by A/B/C or indices
    const keys = Object.keys(raw).sort();
    const arr = keys.map((k) => (typeof raw[k] === 'string' ? raw[k] : String(raw[k])));
    return { field: fieldUsed, kind: 'object', options: arr, objects: false };
  }

  return { field: fieldUsed, kind: 'unknown', options: [], objects: false };
};

const getCorrectIndex = (questionData, options) => {
  const correct = questionData.correctAnswer ?? questionData.answer ?? null;
  if (correct == null) return -1;
  if (typeof correct === 'number' && correct >= 0 && correct < options.length) return correct;
  if (typeof correct === 'string') {
    const trimmed = correct.trim();
    const letterMatch = trimmed.match(/^[A-Da-d]$/);
    if (letterMatch) return trimmed.toUpperCase().charCodeAt(0) - 65;
    // Try match by text
    const idx = options.findIndex((t) => t && t.toLowerCase() === trimmed.toLowerCase());
    if (idx >= 0) return idx;
  }
  return -1;
};

const applyRewrittenChoice = async (db, questionId, field, kind, index, newText) => {
  // Get the fresh document
  const ref = db.collection('questions').doc(questionId);
  const snap = await ref.get();
  if (!snap.exists) throw new Error('Question not found for apply');
  const data = snap.data();
  const current = data[field];

  if (Array.isArray(current)) {
    const updated = [...current];
    if (kind === 'array-object' && typeof updated[index] === 'object' && updated[index] !== null) {
      if (typeof updated[index].text === 'string') updated[index] = { ...updated[index], text: newText };
      else if (typeof updated[index].value === 'string') updated[index] = { ...updated[index], value: newText };
      else if (typeof updated[index].option === 'string') updated[index] = { ...updated[index], option: newText };
      else updated[index] = newText; // fallback replace with string
    } else {
      updated[index] = newText;
    }
    await ref.set({ [field]: updated, updatedAt: new Date().toISOString() }, { merge: true });
    return true;
  }

  if (current && typeof current === 'object') {
    // Map index to letter key if looks like A/B/C...
    const letter = String.fromCharCode(65 + index);
    if (current.hasOwnProperty(letter)) {
      await ref.set({ [field]: { ...current, [letter]: newText }, updatedAt: new Date().toISOString() }, { merge: true });
      return true;
    }
    // Otherwise try numeric keys as strings
    const key = String(index);
    if (current.hasOwnProperty(key)) {
      await ref.set({ [field]: { ...current, [key]: newText }, updatedAt: new Date().toISOString() }, { merge: true });
      return true;
    }
  }

  throw new Error('Unsupported options structure for apply');
};

const rewriteAnswerChoice = async (questionId, questionData, choiceIndex, isCorrect) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is required for answer rewriting');

  const model = DEFAULT_QC_MODEL;
  const { options } = extractOptionsFromQuestion(questionData);
  const questionText = questionData.text || questionData.questionText || questionData.prompt || '';

  const label = String.fromCharCode(65 + choiceIndex);
  const role = isCorrect ? 'the correct answer' : 'an incorrect distractor';

  const prompt = `You will rewrite one answer choice for a SAT-style multiple choice question.
Question text:\n"""\n${questionText}\n"""
Choices:\n${options.map((t, i) => `(${String.fromCharCode(65 + i)}) ${t}`).join('\n')}

Rewrite only choice (${label}), which is ${role}.
Guidelines:
- Maintain the question's validity; do NOT change which choice is correct overall.
- If the choice is correct, make it less obviously correct (more subtle) while remaining fully correct.
- If the choice is incorrect, make it more plausible and less obviously wrong, but still incorrect.
- Keep similar difficulty and length; avoid giveaway wording.
- No new external facts beyond what typical SAT knowledge allows.

Output strictly JSON with this schema:
{ "rewritten": "<new text>", "notes": "<short rationale>" }
No extra commentary.`;

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      input: [
        { role: 'system', content: 'You are an expert SAT item writer. Always output strict JSON with keys rewritten and notes.' },
        { role: 'user', content: prompt }
      ],
      max_output_tokens: 1200
    })
  });

  const data = await response.json();
  if (!response.ok) {
    const errorMessage = data?.error?.message || `OpenAI API returned status ${response.status}`;
    throw new Error(errorMessage);
  }

  const rawText = extractResponseText(data);
  const parsed = parseJsonResponse(rawText);
  if (!parsed || typeof parsed.rewritten !== 'string') {
    throw new Error('Model did not return a valid rewritten choice');
  }
  return {
    rewritten: parsed.rewritten.trim(),
    notes: typeof parsed.notes === 'string' ? parsed.notes.trim() : ''
  };
};

const verifyAdminAccess = async (req, res, next) => {
  try {
    if (!req.db || !req.user?.uid) {
      return res.status(500).json({ error: 'Firestore not available for admin verification' });
    }

    const userDoc = await req.db.collection('users').doc(req.user.uid).get();
    if (!userDoc.exists || !userDoc.data().isAdmin) {
      return res.status(403).json({ error: 'Unauthorized: Admin access required' });
    }

    next();
  } catch (error) {
    console.error('[QuestionQuality] Error checking admin access:', error);
    return res.status(500).json({ error: 'Server error during admin verification' });
  }
};

// --- Utility helpers -----------------------------------------------------

const timestampToIso = (timestamp) => {
  if (!timestamp) return null;
  if (typeof timestamp.toDate === 'function') {
    return timestamp.toDate().toISOString();
  }
  if (timestamp instanceof Date) {
    return timestamp.toISOString();
  }
  return null;
};

const normaliseFlagType = (value) => {
  if (!value || typeof value !== 'string') return DEFAULT_FLAG_TYPE;
  const slug = value.trim().toLowerCase().replace(/[^a-z0-9_]+/g, '_');
  if (KNOWN_FLAG_TYPES.includes(slug)) {
    return slug;
  }
  return DEFAULT_FLAG_TYPE;
};

const formatQuestionForPrompt = (questionId, questionData) => {
  const pieces = [];
  pieces.push(`Question ID: ${questionId}`);

  if (questionData.subcategory || questionData.subCategory || questionData.subcategoryId) {
    const subcategory = questionData.subcategory || questionData.subCategory || questionData.subcategoryId;
    pieces.push(`Subcategory: ${subcategory}`);
  }

  if (questionData.module || questionData.moduleId) {
    pieces.push(`Module: ${questionData.module || questionData.moduleId}`);
  }

  if (questionData.difficulty) {
    pieces.push(`Recorded difficulty: ${questionData.difficulty}`);
  }

  if (questionData.questionType) {
    pieces.push(`Question type: ${questionData.questionType}`);
  }

  const text = questionData.text || questionData.questionText || questionData.prompt || 'No question text provided';
  pieces.push('\nQuestion text:\n"""\n' + text + '\n"""');

  const optionsValue = questionData.options || questionData.choices || questionData.answerChoices || questionData.answers;
  if (Array.isArray(optionsValue)) {
    const formattedOptions = optionsValue.map((opt, index) => {
      if (typeof opt === 'string') {
        return `(${String.fromCharCode(65 + index)}) ${opt}`;
      }
      if (opt && typeof opt === 'object') {
        const label = opt.label || opt.key || String.fromCharCode(65 + index);
        const value = opt.text || opt.value || opt.option || JSON.stringify(opt);
        return `(${label}) ${value}`;
      }
      return `(${String.fromCharCode(65 + index)}) ${String(opt)}`;
    }).join('\n');
    pieces.push('\nAnswer choices:\n' + formattedOptions);
  } else if (optionsValue && typeof optionsValue === 'object') {
    const formattedOptions = Object.entries(optionsValue).map(([key, value]) => `(${key}) ${value}`).join('\n');
    pieces.push('\nAnswer choices:\n' + formattedOptions);
  } else {
    pieces.push('\nAnswer choices: Not available');
  }

  if (questionData.correctAnswer !== undefined || questionData.answer !== undefined) {
    const recorded = (questionData.correctAnswer !== undefined) ? questionData.correctAnswer : questionData.answer;
    let extra = '';
    let asNumber = null;
    if (typeof recorded === 'number') {
      asNumber = recorded;
    } else if (typeof recorded === 'string' && /^\d+$/.test(recorded.trim())) {
      asNumber = parseInt(recorded.trim(), 10);
    }
    if (asNumber !== null && !Number.isNaN(asNumber)) {
      const letter = (asNumber >= 0 && asNumber < 26) ? String.fromCharCode(65 + asNumber) : '?';
      extra = ` (zero-based index; ${asNumber} => ${letter})`;
    } else if (typeof recorded === 'string' && /^[A-Da-d]$/.test(recorded.trim())) {
      extra = ' (letter label)';
    }
    pieces.push(`\nRecorded correct answer: ${recorded}${extra}`);
    pieces.push(`Index mapping note: numeric answer indices are ZERO-BASED; 0=A, 1=B, 2=C, 3=D.`);
  }

  if (questionData.acceptedAnswers && Array.isArray(questionData.acceptedAnswers)) {
    pieces.push(`Accepted answer variations: ${questionData.acceptedAnswers.join(', ')}`);
  }

  if (questionData.explanation) {
    pieces.push('\nAuthor explanation:\n' + questionData.explanation);
  }

  if (questionData.source) {
    pieces.push(`Source: ${questionData.source}`);
  }

  return pieces.join('\n');
};

const extractResponseText = (data) => {
  if (!data) return '';
  if (data.output && Array.isArray(data.output)) {
    const messageOutput = data.output.find((item) => item.type === 'message');
    if (messageOutput && Array.isArray(messageOutput.content)) {
      const textContent = messageOutput.content.find((item) => item.type === 'output_text');
      if (textContent?.text) {
        return textContent.text;
      }
    }
  }
  if (typeof data.output_text === 'string') return data.output_text;
  if (data.output && typeof data.output.text === 'string') return data.output.text;
  if (data.completion && typeof data.completion.text === 'string') return data.completion.text;
  return '';
};

const parseJsonResponse = (rawText) => {
  if (!rawText) {
    throw new Error('Empty response from OpenAI quality check');
  }

  const startIndex = rawText.indexOf('{');
  const endIndex = rawText.lastIndexOf('}');
  if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
    throw new Error('OpenAI quality check did not return valid JSON');
  }

  const jsonSlice = rawText.slice(startIndex, endIndex + 1);
  return JSON.parse(jsonSlice);
};

const mapAnalysisResult = (questionId, questionData, analysisJson, rawText, usage, modelUsed) => {
  const now = new Date();
  const flags = Array.isArray(analysisJson.flags) ? analysisJson.flags.map((flag) => ({
    type: normaliseFlagType(flag?.type),
    severity: (flag?.severity || 'medium').toLowerCase(),
    description: flag?.description || '',
    fixSuggestion: flag?.fixSuggestion || flag?.fix || null
  })) : [];

  const qualityScore = typeof analysisJson.qualityScore === 'number'
    ? Math.max(0, Math.min(100, analysisJson.qualityScore))
    : null;

  return {
    questionId,
    questionPreview: (questionData.text || questionData.questionText || '').slice(0, 400),
    summary: analysisJson.summary || '',
    qualityScore,
    difficultyRating: analysisJson.difficultyRating || null,
    requiresHumanReview: typeof analysisJson.requiresHumanReview === 'boolean'
      ? analysisJson.requiresHumanReview
      : flags.length > 0,
    recommendations: Array.isArray(analysisJson.recommendations) ? analysisJson.recommendations : [],
    flags,
    confidence: analysisJson.confidence || 'medium',
    model: modelUsed,
    provider: 'openai',
    usage: usage || null,
    rawOutput: rawText ? rawText.trim().slice(0, 12000) : null,
    createdAt: now,
    version: 'v1'
  };
};

const runQualityAnalysis = async (questionId, questionData) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI API key (OPENAI_API_KEY) is required for question quality analysis');
  }

  const model = DEFAULT_QC_MODEL;
  const prompt = `You are an expert SAT content quality reviewer. Evaluate the following SAT-style multiple choice question for correctness, clarity, fairness, and alignment with the US Digital SAT exam. Identify any issues and recommend fixes. Return ONLY valid JSON with the schema described.

Quality dimensions to inspect:
- Clarity & completeness of the prompt
- Alignment with SAT blueprint & grade level
- Answer choice quality (distractors, uniqueness, correctness)
- Difficulty appropriateness (indicate overly easy or hard items)
- Mathematical/grammatical accuracy
- Any missing information required to solve the question
- Consistency between correct answer and explanation

JSON schema:
{
  "summary": "Short 1-2 sentence overview of the question quality.",
  "qualityScore": number between 0 and 100,
  "difficultyRating": "too_easy" | "appropriate" | "too_hard",
  "flags": [
    {
      "type": "missing_information" | "ambiguous_question" | "multiple_correct_answers" | "no_correct_answer" | "answer_key_mismatch" | "calculation_error" | "typo_or_grammar" | "formatting_issue" | "off_syllabus" | "too_easy" | "too_hard" | "content_error" | "other",
      "severity": "low" | "medium" | "high",
      "description": "Explain the issue in detail.",
      "fixSuggestion": "Concrete steps to fix the issue."
    }
  ],
  "recommendations": ["Additional follow-up actions or edits"],
  "requiresHumanReview": true | false,
  "confidence": "low" | "medium" | "high"
}

Guidelines:
- If no issues are found, return an empty array for flags, qualityScore >= 85, difficultyRating "appropriate", and requiresHumanReview false.
- If the answer key is incorrect or ambiguous, set requiresHumanReview true and include a high severity flag.
- Be candid and specific; reference option letters where relevant.
- Indexing note: When the recorded correct answer is given as a number, it is ZERO-BASED (0=A, 1=B, 2=C, 3=D). Do not assume 1-based indexing.
- Never include code fences or commentary outside the JSON.

Review the question:
${formatQuestionForPrompt(questionId, questionData)}
`;

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      reasoning: {
        effort: 'medium'
      },
      input: [
        {
          role: 'system',
          content: 'You are an expert reviewer for SAT Digital exam content. You must output valid JSON only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_output_tokens: OPENAI_QC_MAX_OUTPUT_TOKENS
    })
  });

  const data = await response.json();
  if (!response.ok) {
    const errorMessage = data?.error?.message || `OpenAI API returned status ${response.status}`;
    throw new Error(errorMessage);
  }

  const rawText = extractResponseText(data);
  const analysisJson = parseJsonResponse(rawText);
  const usage = data?.usage || null;

  return mapAnalysisResult(questionId, questionData, analysisJson, rawText, usage, model);
};

const saveQualityResult = async (db, result, questionRefPath) => {
  const docRef = db.collection('questionQualityChecks').doc(result.questionId);
  const existingDoc = await docRef.get();
  const timestamp = result.createdAt instanceof Date
    ? result.createdAt
    : new Date();

  const existingHistory = existingDoc.exists && Array.isArray(existingDoc.data().history)
    ? existingDoc.data().history
    : [];

  const newHistoryEntry = {
    summary: result.summary,
    qualityScore: result.qualityScore,
    difficultyRating: result.difficultyRating || null,
    flags: result.flags,
    recommendations: result.recommendations,
    requiresHumanReview: result.requiresHumanReview,
    confidence: result.confidence,
    model: result.model,
    provider: result.provider,
    usage: result.usage || null,
    createdAt: timestamp
  };

  const updatedHistory = [newHistoryEntry, ...existingHistory].slice(0, 10);
  const runCount = (existingDoc.exists ? (existingDoc.data().runCount || 0) : 0) + 1;

  await docRef.set({
    questionId: result.questionId,
    questionPreview: result.questionPreview,
    questionRef: questionRefPath,
    latest: newHistoryEntry,
    history: updatedHistory,
    updatedAt: timestamp,
    provider: result.provider,
    model: result.model,
    runCount,
    usage: result.usage || null
  }, { merge: true });

  return {
    ...result,
    createdAt: timestamp
  };
};

// --- Routes ---------------------------------------------------------------

router.post('/run', verifyFirebaseToken, verifyAdminAccess, async (req, res) => {
  try {
    const { questionId, questionIds } = req.body || {};

    if (!questionId && (!Array.isArray(questionIds) || questionIds.length === 0)) {
      return res.status(400).json({ error: 'questionId or questionIds is required' });
    }

    const idsToProcess = Array.isArray(questionIds) && questionIds.length > 0
      ? questionIds
      : [questionId];

    const results = [];
    for (const id of idsToProcess) {
      if (!id) continue;
      const trimmedId = String(id).trim();
      const docRef = req.db.collection('questions').doc(trimmedId);
      const snapshot = await docRef.get();
      if (!snapshot.exists) {
        results.push({ questionId: trimmedId, success: false, error: 'Question not found' });
        continue;
      }

      try {
        const questionData = snapshot.data();
        const analysisResult = await runQualityAnalysis(trimmedId, questionData);
        const persisted = await saveQualityResult(req.db, analysisResult, docRef.path);
        results.push({ questionId: trimmedId, success: true, result: persisted });
      } catch (innerError) {
        console.error(`[QuestionQuality] Error analysing question ${trimmedId}:`, innerError);
        results.push({ questionId: trimmedId, success: false, error: innerError.message || 'Analysis failed' });
      }
    }

    const overallSuccess = results.every((item) => item.success);
    res.status(overallSuccess ? 200 : 207).json({
      success: overallSuccess,
      results
    });
  } catch (error) {
    console.error('[QuestionQuality] Unexpected error during quality run:', error);
    res.status(500).json({ error: error.message || 'Failed to run question quality analysis' });
  }
});

// Rewrite a single answer choice using OpenAI and optionally apply to Firestore
router.post('/rewrite-choice', verifyFirebaseToken, verifyAdminAccess, async (req, res) => {
  try {
    const { questionId, choiceIndex, apply } = req.body || {};
    if (!questionId || (typeof choiceIndex !== 'number')) {
      return res.status(400).json({ error: 'questionId and numeric choiceIndex are required' });
    }

    // Load question
    const ref = req.db.collection('questions').doc(String(questionId));
    const snap = await ref.get();
    if (!snap.exists) {
      return res.status(404).json({ error: 'Question not found' });
    }
    const q = snap.data();

    // Extract choices and determine correctness
    const extracted = extractOptionsFromQuestion(q);
    if (!extracted.field || !Array.isArray(extracted.options) || extracted.options.length === 0) {
      return res.status(400).json({ error: 'Question has no recognizable answer choices' });
    }
    if (choiceIndex < 0 || choiceIndex >= extracted.options.length) {
      return res.status(400).json({ error: 'choiceIndex out of range' });
    }
    const correctIndex = getCorrectIndex(q, extracted.options);
    const isCorrect = choiceIndex === correctIndex;

    // Generate rewrite
    const { rewritten, notes } = await rewriteAnswerChoice(String(questionId), q, choiceIndex, isCorrect);

    // Build a preview of updated options
    const optionsAfter = [...extracted.options];
    optionsAfter[choiceIndex] = rewritten;

    // Optionally apply to Firestore
    let applied = false;
    if (apply) {
      try {
        await applyRewrittenChoice(req.db, String(questionId), extracted.field, extracted.kind, choiceIndex, rewritten);
        applied = true;
      } catch (applyErr) {
        console.error('[QuestionQuality] Failed to apply rewritten choice:', applyErr);
        // Don't fail the whole request; return preview along with error info
      }
    }

    res.json({
      questionId: String(questionId),
      choiceIndex,
      isCorrect,
      correctIndex,
      rewritten,
      notes,
      applied,
      optionsBefore: extracted.options,
      optionsAfter
    });
  } catch (error) {
    console.error('[QuestionQuality] Error rewriting choice:', error);
    res.status(500).json({ error: error.message || 'Failed to rewrite answer choice' });
  }
});

router.get('/latest', verifyFirebaseToken, verifyAdminAccess, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || '25', 10), 100);
    const snapshot = await req.db
      .collection('questionQualityChecks')
      .orderBy('updatedAt', 'desc')
      .limit(limit)
      .get();

    const items = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        questionId: doc.id,
        questionPreview: data.questionPreview || null,
        updatedAt: timestampToIso(data.updatedAt),
        runCount: data.runCount || 0,
        latest: data.latest ? {
          ...data.latest,
          createdAt: timestampToIso(data.latest.createdAt)
        } : null,
        model: data.model || null,
        provider: data.provider || null,
        usage: data.usage || null
      };
    });

    res.json({ results: items });
  } catch (error) {
    console.error('[QuestionQuality] Error fetching latest results:', error);
    res.status(500).json({ error: 'Failed to retrieve quality check results' });
  }
});

router.get('/:questionId', verifyFirebaseToken, verifyAdminAccess, async (req, res) => {
  try {
    const { questionId } = req.params;
    if (!questionId) {
      return res.status(400).json({ error: 'questionId parameter is required' });
    }

    const docRef = req.db.collection('questionQualityChecks').doc(questionId);
    const snapshot = await docRef.get();
    if (!snapshot.exists) {
      return res.status(404).json({ error: 'No quality report found for this question' });
    }

    const data = snapshot.data();
    res.json({
      questionId: snapshot.id,
      questionPreview: data.questionPreview || null,
      updatedAt: timestampToIso(data.updatedAt),
      runCount: data.runCount || 0,
      latest: data.latest ? {
        ...data.latest,
        createdAt: timestampToIso(data.latest.createdAt)
      } : null,
      history: Array.isArray(data.history)
        ? data.history.map((entry) => ({
            ...entry,
            createdAt: timestampToIso(entry.createdAt)
          }))
        : [],
      model: data.model || null,
      provider: data.provider || null,
      usage: data.usage || null
    });
  } catch (error) {
    console.error('[QuestionQuality] Error fetching report:', error);
    res.status(500).json({ error: 'Failed to retrieve quality report' });
  }
});

module.exports = router;
