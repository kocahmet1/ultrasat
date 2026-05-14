const fetch = require('node-fetch');
const {
  resolveSubcategory,
} = require('../../scripts/lib/subcategoryMap');

const DEFAULT_GENERATION_MODEL = process.env.OPENAI_QUESTION_GENERATION_MODEL || 'gpt-5.5';
const DEFAULT_REVIEW_MODEL =
  process.env.OPENAI_QUESTION_REVIEW_MODEL ||
  process.env.OPENAI_QUESTION_GENERATION_MODEL ||
  'gpt-5.5';

const PROMPT_VERSION = 'sat-question-creation-v1';
const DEFAULT_MAX_OUTPUT_TOKENS = parseInt(process.env.OPENAI_QUESTION_GENERATION_MAX_OUTPUT_TOKENS || '12000', 10);
const DEFAULT_REVIEW_MAX_OUTPUT_TOKENS = parseInt(process.env.OPENAI_QUESTION_REVIEW_MAX_OUTPUT_TOKENS || '5000', 10);

const QUALITY_PASS_SCORE = 85;

const FLAG_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['type', 'severity', 'description', 'fixSuggestion'],
  properties: {
    type: {
      type: 'string',
      enum: [
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
        'weak_distractor',
        'style_mismatch',
        'content_error',
        'other',
      ],
    },
    severity: {
      type: 'string',
      enum: ['low', 'medium', 'high'],
    },
    description: { type: 'string' },
    fixSuggestion: { type: 'string' },
  },
};

const GENERATED_QUESTIONS_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['questions'],
  properties: {
    questions: {
      type: 'array',
      minItems: 1,
      maxItems: 30,
      items: {
        type: 'object',
        additionalProperties: false,
        required: [
          'text',
          'options',
          'correctAnswer',
          'explanation',
          'difficulty',
          'subcategory',
          'skillTags',
        ],
        properties: {
          text: { type: 'string' },
          options: {
            type: 'array',
            minItems: 4,
            maxItems: 4,
            items: { type: 'string' },
          },
          correctAnswer: {
            type: 'integer',
            minimum: 0,
            maximum: 3,
          },
          explanation: { type: 'string' },
          difficulty: {
            type: 'string',
            enum: ['easy', 'medium', 'hard'],
          },
          subcategory: { type: 'string' },
          skillTags: {
            type: 'array',
            items: { type: 'string' },
          },
        },
      },
    },
  },
};

const SOLVER_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: [
    'solvedAnswerIndex',
    'confidence',
    'reasoningSummary',
    'possibleIssue',
    'issueSummary',
  ],
  properties: {
    solvedAnswerIndex: {
      type: 'integer',
      minimum: -1,
      maximum: 3,
      description: '-1 means no single correct answer can be determined.',
    },
    confidence: {
      type: 'string',
      enum: ['low', 'medium', 'high'],
    },
    reasoningSummary: { type: 'string' },
    possibleIssue: { type: 'boolean' },
    issueSummary: { type: 'string' },
  },
};

const REVIEW_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: [
    'summary',
    'qualityScore',
    'collegeBoardStyleScore',
    'calibratedDifficulty',
    'difficultyConfidence',
    'flags',
    'recommendations',
    'requiresHumanReview',
  ],
  properties: {
    summary: { type: 'string' },
    qualityScore: {
      type: 'integer',
      minimum: 0,
      maximum: 100,
    },
    collegeBoardStyleScore: {
      type: 'integer',
      minimum: 0,
      maximum: 100,
    },
    calibratedDifficulty: {
      type: 'string',
      enum: ['easy', 'medium', 'hard'],
    },
    difficultyConfidence: {
      type: 'string',
      enum: ['low', 'medium', 'high'],
    },
    flags: {
      type: 'array',
      items: FLAG_SCHEMA,
    },
    recommendations: {
      type: 'array',
      items: { type: 'string' },
    },
    requiresHumanReview: { type: 'boolean' },
  },
};

function getApiKey() {
  return process.env.OPENAI_API_KEY || '';
}

function getGenerationModel() {
  return process.env.OPENAI_QUESTION_GENERATION_MODEL || DEFAULT_GENERATION_MODEL;
}

function getReviewModel() {
  return process.env.OPENAI_QUESTION_REVIEW_MODEL || DEFAULT_REVIEW_MODEL;
}

function toKebab(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function normalizeDifficulty(value) {
  const lower = String(value || '').trim().toLowerCase();
  if (['easy', 'medium', 'hard'].includes(lower)) return lower;
  return 'medium';
}

function resolveSubcategoryOrThrow(input) {
  const entry = resolveSubcategory(input);
  if (!entry) {
    throw new Error(`Unknown subcategory: ${input}`);
  }
  return entry;
}

function getDifficultyRubric(difficulty) {
  if (difficulty === 'easy') {
    return [
      'Easy: one clear target skill, direct wording, minimal abstraction, and no unnecessary computational or reading burden.',
      'The correct choice should be identifiable by applying one tested idea cleanly.',
      'Distractors should reflect common but simple mistakes, not tricks or near-equivalent interpretations.',
    ].join('\n');
  }

  if (difficulty === 'hard') {
    return [
      'Hard: still fair and unambiguous, but requires multi-step reasoning, a subtler distinction, or synthesis of details.',
      'The challenge should come from SAT-relevant reasoning, not obscure knowledge, excessive arithmetic, or convoluted wording.',
      'Distractors may be tempting because they are partially true, use a common trap, or satisfy only part of the prompt.',
    ].join('\n');
  }

  return [
    'Medium: requires careful reading or a modest multi-step process, but remains direct enough for a prepared SAT student.',
    'The correct answer should require more than recognition but less than extended analysis.',
    'Distractors should be plausible and tied to predictable misconceptions.',
  ].join('\n');
}

function getSectionGuidance(subcategoryEntry) {
  if (subcategoryEntry.section === 'Math') {
    return [
      'Use Digital SAT Math conventions and grade-level scope.',
      'Use multiple-choice format with exactly four answer choices.',
      'Avoid diagrams or external images in this version. If a visual would be needed, choose a different question design.',
      'All quantities, equations, and units must be internally consistent.',
      'The explanation must verify the correct answer and rule out the main trap behind each distractor.',
    ].join('\n');
  }

  return [
    'Use Digital SAT Reading and Writing conventions.',
    'Use concise passages with authentic academic or informational style when the subcategory requires a passage.',
    'Do not quote or closely imitate real College Board passages or questions.',
    'The correct choice must be supported by the text or by standard English conventions, with no outside knowledge required.',
    'The explanation must name the decisive textual, rhetorical, or grammatical reason.',
  ].join('\n');
}

function buildQuestionGenerationPrompt({
  subcategory,
  difficulty = 'medium',
  quantity = 5,
}) {
  const subcategoryEntry = resolveSubcategoryOrThrow(subcategory);
  const normalizedDifficulty = normalizeDifficulty(difficulty);

  return `Create ${quantity} original Digital SAT practice questions.

Target subcategory:
- Section: ${subcategoryEntry.section}
- Main category: ${subcategoryEntry.mainCategory}
- Subcategory display name: ${subcategoryEntry.name}
- Canonical subcategory id: ${subcategoryEntry.kebab}

Requested difficulty tier: ${normalizedDifficulty}

Difficulty rubric:
${getDifficultyRubric(normalizedDifficulty)}

Section and format requirements:
${getSectionGuidance(subcategoryEntry)}

Quality bar:
- Match the clarity, economy, fairness, and precision of official Digital SAT questions.
- Test the selected subcategory directly; do not drift into a neighboring subcategory.
- Use only information present in the question or standard SAT knowledge.
- Make every question original. Do not reuse named entities, scenarios, wording, or structure from official questions.
- Use exactly one objectively correct answer.
- Make the three incorrect choices plausible but definitively wrong.
- Keep answer choices parallel in style, length, and specificity where possible.
- Avoid "all of the above", "none of the above", joke answers, giveaway wording, and artificial trickiness.
- Avoid controversial, graphic, political, medical, or personally sensitive content.
- Do not include markdown fences or commentary.

Return only JSON matching the provided schema.
Each question must include:
- text: full question text including any needed passage or setup
- options: exactly four answer choices as strings
- correctAnswer: zero-based index where 0=A, 1=B, 2=C, 3=D
- explanation: a concise but complete explanation
- difficulty: "${normalizedDifficulty}" unless you have a strong reason to mark it otherwise
- subcategory: exactly "${subcategoryEntry.kebab}"
- skillTags: kebab-case tags relevant to the tested skill`;
}

function extractResponseText(data) {
  if (!data) return '';
  if (Array.isArray(data.output)) {
    const messageOutput = data.output.find(item => item.type === 'message');
    if (messageOutput && Array.isArray(messageOutput.content)) {
      const textContent = messageOutput.content.find(item => item.type === 'output_text');
      if (textContent?.text) return textContent.text;
    }
  }
  if (typeof data.output_text === 'string') return data.output_text;
  if (data.output && typeof data.output.text === 'string') return data.output.text;
  if (data.completion && typeof data.completion.text === 'string') return data.completion.text;
  return '';
}

function parseJsonObject(rawText, label) {
  if (!rawText) {
    throw new Error(`${label} returned an empty response`);
  }

  try {
    return JSON.parse(rawText);
  } catch (error) {
    const startIndex = rawText.indexOf('{');
    const endIndex = rawText.lastIndexOf('}');
    if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
      throw error;
    }
    return JSON.parse(rawText.slice(startIndex, endIndex + 1));
  }
}

async function callOpenAIJson({
  model,
  system,
  user,
  schema,
  schemaName,
  maxOutputTokens,
  reasoningEffort = 'high',
}) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is required for question generation');
  }

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      reasoning: {
        effort: reasoningEffort,
      },
      input: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      text: {
        format: {
          type: 'json_schema',
          name: schemaName,
          strict: true,
          schema,
        },
      },
      store: false,
      max_output_tokens: maxOutputTokens,
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorMessage = data?.error?.message || `OpenAI API returned status ${response.status}`;
    throw new Error(errorMessage);
  }

  const rawText = extractResponseText(data);
  const parsed = parseJsonObject(rawText, schemaName);

  return {
    parsed,
    rawText,
    usage: data?.usage || null,
  };
}

function parseCorrectAnswer(value, options) {
  if (Number.isInteger(value)) return value;

  const stringValue = String(value ?? '').trim();
  if (/^[A-Da-d]$/.test(stringValue)) {
    return stringValue.toUpperCase().charCodeAt(0) - 65;
  }

  const numeric = Number.parseInt(stringValue, 10);
  if (Number.isInteger(numeric) && String(numeric) === stringValue) {
    return numeric;
  }

  const optionIndex = options.findIndex(option => option.trim().toLowerCase() === stringValue.toLowerCase());
  return optionIndex >= 0 ? optionIndex : -1;
}

function normalizeGeneratedQuestion(rawQuestion, {
  subcategory,
  difficulty,
  index = 0,
}) {
  const selectedSubcategory = resolveSubcategoryOrThrow(subcategory);
  const rawOptions = Array.isArray(rawQuestion?.options) ? rawQuestion.options : [];
  const options = rawOptions.map(option => String(option ?? '').trim());
  const correctAnswer = parseCorrectAnswer(rawQuestion?.correctAnswer, options);
  const questionSubcategory = resolveSubcategory(rawQuestion?.subcategory) || selectedSubcategory;
  const normalizedDifficulty = normalizeDifficulty(rawQuestion?.difficulty || difficulty);
  const rawSkillTags = Array.isArray(rawQuestion?.skillTags) ? rawQuestion.skillTags : [];
  const skillTags = Array.from(new Set([
    questionSubcategory.kebab,
    toKebab(questionSubcategory.mainCategory),
    ...rawSkillTags.map(toKebab).filter(Boolean),
  ]));

  return {
    clientKey: `draft-${Date.now()}-${index}`,
    text: String(rawQuestion?.text || '').trim(),
    questionType: 'multiple-choice',
    options,
    correctAnswer,
    explanation: String(rawQuestion?.explanation || '').trim(),
    difficulty: normalizedDifficulty,
    requestedDifficulty: normalizeDifficulty(difficulty),
    calibratedDifficulty: null,
    subcategory: questionSubcategory.kebab,
    subCategory: questionSubcategory.kebab,
    subcategoryId: questionSubcategory.id,
    categoryPath: `${questionSubcategory.section}/${questionSubcategory.mainCategory}/${questionSubcategory.name}`,
    mainCategory: questionSubcategory.mainCategory,
    subjectArea: questionSubcategory.section,
    skillTags,
    source: 'ai-generated',
    usageContext: 'general',
    graphUrl: null,
    graphDescription: null,
    generationVersion: PROMPT_VERSION,
  };
}

function normalizeTextFingerprint(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function validateDraftQuestion(question, {
  selectedSubcategory,
  requestedDifficulty,
  existingQuestionId = null,
  siblingTexts = [],
} = {}) {
  const errors = [];
  const warnings = [];
  const subcategoryEntry = selectedSubcategory ? resolveSubcategory(selectedSubcategory) : null;
  const normalizedRequestedDifficulty = requestedDifficulty ? normalizeDifficulty(requestedDifficulty) : null;

  if (!question?.text || typeof question.text !== 'string' || !question.text.trim()) {
    errors.push('Missing question text');
  }

  if (question?.questionType !== 'multiple-choice') {
    errors.push('Question generation currently supports only multiple-choice drafts');
  }

  if (!Array.isArray(question?.options)) {
    errors.push('Options must be an array');
  } else {
    if (question.options.length !== 4) {
      errors.push(`Expected exactly 4 answer choices, found ${question.options.length}`);
    }

    const normalizedOptions = new Set();
    question.options.forEach((option, optionIndex) => {
      if (typeof option !== 'string' || !option.trim()) {
        errors.push(`Option ${String.fromCharCode(65 + optionIndex)} is empty or invalid`);
      }
      const normalizedOption = normalizeTextFingerprint(option);
      if (normalizedOption) {
        if (normalizedOptions.has(normalizedOption)) {
          errors.push('Answer choices must be unique');
        }
        normalizedOptions.add(normalizedOption);
      }
    });
  }

  if (!Number.isInteger(question?.correctAnswer)) {
    errors.push('correctAnswer must be a zero-based integer index');
  } else if (question.correctAnswer < 0 || question.correctAnswer >= (question.options?.length || 0)) {
    errors.push('correctAnswer is outside the answer choice range');
  }

  if (!question?.explanation || typeof question.explanation !== 'string' || !question.explanation.trim()) {
    errors.push('Missing explanation');
  }

  if (!['easy', 'medium', 'hard'].includes(question?.difficulty)) {
    errors.push('Difficulty must be easy, medium, or hard');
  }

  if (normalizedRequestedDifficulty && question?.difficulty !== normalizedRequestedDifficulty) {
    warnings.push(`Generated difficulty "${question?.difficulty}" differs from requested "${normalizedRequestedDifficulty}"`);
  }

  const draftSubcategory = resolveSubcategory(question?.subcategory || question?.subCategory || question?.subcategoryId);
  if (!draftSubcategory) {
    errors.push('Invalid or missing subcategory');
  } else if (subcategoryEntry && draftSubcategory.kebab !== subcategoryEntry.kebab) {
    errors.push(`Draft subcategory "${draftSubcategory.kebab}" does not match selected subcategory "${subcategoryEntry.kebab}"`);
  }

  if (existingQuestionId) {
    errors.push(`Duplicate question text already exists in questions/${existingQuestionId}`);
  }

  const fingerprint = normalizeTextFingerprint(question?.text);
  const duplicateInRun = fingerprint && siblingTexts.filter(item => item === fingerprint).length > 1;
  if (duplicateInRun) {
    errors.push('Duplicate question text appears within this generation run');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

async function generateQuestionsFromPrompt({
  prompt,
  subcategory,
  difficulty,
  quantity,
}) {
  const model = getGenerationModel();
  const response = await callOpenAIJson({
    model,
    system: 'You are a senior Digital SAT question writer. Return only strict JSON that conforms to the provided schema.',
    user: prompt,
    schema: GENERATED_QUESTIONS_SCHEMA,
    schemaName: 'generated_sat_questions',
    maxOutputTokens: DEFAULT_MAX_OUTPUT_TOKENS,
    reasoningEffort: 'high',
  });

  const rawQuestions = Array.isArray(response.parsed?.questions) ? response.parsed.questions : [];
  const normalizedQuestions = rawQuestions
    .slice(0, quantity)
    .map((rawQuestion, index) => normalizeGeneratedQuestion(rawQuestion, {
      subcategory,
      difficulty,
      index,
    }));

  return {
    questions: normalizedQuestions,
    rawQuestions,
    model,
    usage: response.usage,
    rawOutput: response.rawText,
  };
}

function formatQuestionForSolver(question) {
  return [
    `Question text:\n${question.text}`,
    'Answer choices:',
    ...question.options.map((option, index) => `(${String.fromCharCode(65 + index)}) ${option}`),
  ].join('\n');
}

async function solveQuestionDraft(question) {
  const model = getReviewModel();
  const response = await callOpenAIJson({
    model,
    system: 'You are an expert SAT solver. Solve independently and return strict JSON only.',
    user: `Solve this Digital SAT multiple-choice question. The answer key is intentionally omitted.

If there is not exactly one defensible answer, set solvedAnswerIndex to -1 and explain the issue.

${formatQuestionForSolver(question)}`,
    schema: SOLVER_SCHEMA,
    schemaName: 'sat_question_solver_result',
    maxOutputTokens: DEFAULT_REVIEW_MAX_OUTPUT_TOKENS,
    reasoningEffort: 'high',
  });

  return {
    ...response.parsed,
    model,
    usage: response.usage,
  };
}

async function reviewQuestionDraft(question, {
  subcategory,
  requestedDifficulty,
  solverResult,
}) {
  const selectedSubcategory = resolveSubcategoryOrThrow(subcategory);
  const model = getReviewModel();
  const response = await callOpenAIJson({
    model,
    system: 'You are a strict Digital SAT content quality reviewer. Return strict JSON only.',
    user: `Review this candidate Digital SAT question for official-test quality.

Target:
- Section: ${selectedSubcategory.section}
- Main category: ${selectedSubcategory.mainCategory}
- Subcategory: ${selectedSubcategory.name}
- Requested difficulty: ${normalizeDifficulty(requestedDifficulty)}

Independent solver result:
${JSON.stringify({
  solvedAnswerIndex: solverResult.solvedAnswerIndex,
  confidence: solverResult.confidence,
  reasoningSummary: solverResult.reasoningSummary,
  possibleIssue: solverResult.possibleIssue,
  issueSummary: solverResult.issueSummary,
}, null, 2)}

Candidate answer key and explanation:
- Claimed correct answer index: ${question.correctAnswer} (${String.fromCharCode(65 + question.correctAnswer)})
- Explanation: ${question.explanation}

Question:
${formatQuestionForSolver(question)}

Evaluate:
- whether the answer key is objectively correct
- whether there is more than one defensible answer or no defensible answer
- whether the item matches the selected subcategory
- whether the difficulty label is calibrated relative to official Digital SAT expectations
- whether the wording, passage/setup, answer choices, and explanation meet College Board-level quality

Be severe. A question should require human review if there is any correctness, ambiguity, format, difficulty-calibration, or style concern.`,
    schema: REVIEW_SCHEMA,
    schemaName: 'sat_question_quality_review',
    maxOutputTokens: DEFAULT_REVIEW_MAX_OUTPUT_TOKENS,
    reasoningEffort: 'high',
  });

  return {
    ...response.parsed,
    model,
    usage: response.usage,
  };
}

function buildVerificationResult({
  deterministic,
  solverResult,
  reviewResult,
  requestedDifficulty,
}) {
  const flags = Array.isArray(reviewResult?.flags) ? [...reviewResult.flags] : [];
  const solvedAnswer = Number.isInteger(solverResult?.solvedAnswerIndex)
    ? solverResult.solvedAnswerIndex
    : -1;
  const answerKeyMatches = solvedAnswer >= 0 && reviewResult && solvedAnswer === reviewResult.claimedCorrectAnswer;
  const requested = normalizeDifficulty(requestedDifficulty);
  const calibrated = reviewResult?.calibratedDifficulty || null;

  return {
    deterministic,
    solver: solverResult,
    review: reviewResult,
    answerKeyMatches,
    solvedAnswerIndex: solvedAnswer,
    calibratedDifficulty: calibrated,
    difficultyMatchesRequest: calibrated === requested,
    flags,
  };
}

function getDraftStatusFromValidation(validation) {
  if (!validation?.deterministic?.valid) return 'format_failed';
  if (!validation?.solver || !validation?.review) return 'needs_revision';
  if (!validation.answerKeyMatches) return 'needs_revision';
  if (!validation.difficultyMatchesRequest) return 'needs_revision';

  const review = validation.review;
  const allFlags = [
    ...(Array.isArray(review.flags) ? review.flags : []),
    ...(Array.isArray(validation.flags) ? validation.flags : []),
  ];
  const hasHighSeverityFlag = allFlags.some(flag => flag.severity === 'high');
  if (hasHighSeverityFlag) return 'needs_revision';
  if (validation.solver?.possibleIssue) return 'needs_revision';
  if (review.requiresHumanReview) return 'needs_revision';
  if (review.qualityScore < QUALITY_PASS_SCORE) return 'needs_revision';
  if (review.collegeBoardStyleScore < QUALITY_PASS_SCORE) return 'needs_revision';
  if (review.difficultyConfidence !== 'high') return 'needs_revision';
  if (validation.solver.confidence !== 'high') return 'needs_revision';

  return 'verified';
}

async function verifyDraftQuestion(question, {
  subcategory,
  requestedDifficulty,
  deterministic,
}) {
  const solverResult = await solveQuestionDraft(question);
  const reviewResult = await reviewQuestionDraft(question, {
    subcategory,
    requestedDifficulty,
    solverResult,
  });

  const answerKeyMatches = solverResult.solvedAnswerIndex >= 0 &&
    solverResult.solvedAnswerIndex === question.correctAnswer;

  const verification = buildVerificationResult({
    deterministic,
    solverResult,
    reviewResult: {
      ...reviewResult,
      claimedCorrectAnswer: question.correctAnswer,
    },
    requestedDifficulty,
  });

  verification.answerKeyMatches = answerKeyMatches;
  verification.flags = [
    ...(Array.isArray(reviewResult.flags) ? reviewResult.flags : []),
    ...(!answerKeyMatches ? [{
      type: 'answer_key_mismatch',
      severity: 'high',
      description: `Independent solver selected ${solverResult.solvedAnswerIndex}; draft key is ${question.correctAnswer}.`,
      fixSuggestion: 'Edit the answer key or rewrite the question, then rerun verification.',
    }] : []),
    ...(solverResult.possibleIssue ? [{
      type: 'ambiguous_question',
      severity: solverResult.confidence === 'low' ? 'high' : 'medium',
      description: solverResult.issueSummary || 'Independent solver reported a possible issue.',
      fixSuggestion: 'Review the wording and answer choices, then rerun verification.',
    }] : []),
  ];

  return {
    ...verification,
    status: getDraftStatusFromValidation(verification),
  };
}

function isPublishEligible(draft) {
  const validation = draft?.validation || {};
  const review = validation.review || {};

  return draft?.status === 'verified' &&
    validation?.deterministic?.valid === true &&
    validation.answerKeyMatches === true &&
    validation.difficultyMatchesRequest === true &&
    review.qualityScore >= QUALITY_PASS_SCORE &&
    review.collegeBoardStyleScore >= QUALITY_PASS_SCORE &&
    review.requiresHumanReview === false;
}

function buildQuestionForPublish(draft) {
  return {
    text: draft.text,
    questionType: 'multiple-choice',
    options: draft.options,
    correctAnswer: draft.correctAnswer,
    acceptedAnswers: null,
    inputType: 'number',
    answerFormat: null,
    explanation: draft.explanation,
    difficulty: draft.requestedDifficulty || draft.difficulty,
    calibratedDifficulty: draft.validation?.calibratedDifficulty || draft.calibratedDifficulty || draft.difficulty,
    subcategory: draft.subcategory,
    subCategory: draft.subCategory || draft.subcategory,
    subcategoryId: draft.subcategoryId,
    categoryPath: draft.categoryPath || null,
    mainCategory: draft.mainCategory || null,
    subjectArea: draft.subjectArea || null,
    source: 'ai-generated',
    generationRunId: draft.runId || null,
    generationDraftId: draft.id || null,
    generationVersion: draft.generationVersion || PROMPT_VERSION,
    usageContext: 'general',
    skillTags: Array.isArray(draft.skillTags) ? draft.skillTags : [],
    graphUrl: null,
    graphDescription: null,
  };
}

module.exports = {
  PROMPT_VERSION,
  QUALITY_PASS_SCORE,
  buildQuestionForPublish,
  buildQuestionGenerationPrompt,
  generateQuestionsFromPrompt,
  getDraftStatusFromValidation,
  getGenerationModel,
  getReviewModel,
  isPublishEligible,
  normalizeGeneratedQuestion,
  normalizeTextFingerprint,
  resolveSubcategoryOrThrow,
  validateDraftQuestion,
  verifyDraftQuestion,
};
