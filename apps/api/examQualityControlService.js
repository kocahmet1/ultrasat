const crypto = require('crypto');
const OpenAI = require('openai');
const {
  resolveSubcategory,
} = require('../../scripts/lib/subcategoryMap');
const {
  resolveModel,
  resolveReasoningEffort,
} = require('./config/aiModel');

const DEFAULT_MODEL = resolveModel('OPENAI_EXAM_QUALITY_MODEL');
const DEFAULT_REASONING_EFFORT = resolveReasoningEffort(
  'OPENAI_EXAM_QUALITY_REASONING_EFFORT'
);
// `pro` reasoning mode is a gpt-5.6-sol capability; gpt-5.6-luna does not accept
// it. Leave it unset unless an operator explicitly re-enables it for a sol run.
const DEFAULT_REASONING_MODE =
  process.env.OPENAI_EXAM_QUALITY_REASONING_MODE || '';
const parsedMaxOutputTokens = Number.parseInt(
  process.env.OPENAI_EXAM_QUALITY_MAX_OUTPUT_TOKENS || '',
  10,
);
const DEFAULT_MAX_OUTPUT_TOKENS =
  Number.isFinite(parsedMaxOutputTokens) && parsedMaxOutputTokens >= 1000
    ? Math.min(parsedMaxOutputTokens, 128000)
    : 24000;

const PROMPT_VERSION = 'exam-quality-control-v1';
const POLICY_VERSION = 'digital-sat-quality-policy-v1';

const EXPECTED_QUESTION_COUNTS = Object.freeze({
  1: 27,
  2: 27,
  3: 22,
  4: 22,
});

const SEVERITY_RANK = Object.freeze({
  info: 0,
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
});

const ISSUE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['code', 'severity', 'evidence', 'repairInstruction'],
  properties: {
    code: { type: 'string' },
    severity: {
      type: 'string',
      enum: ['info', 'low', 'medium', 'high', 'critical'],
    },
    evidence: { type: 'string' },
    repairInstruction: { type: 'string' },
  },
};

const SCORES_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: [
    'contentAccuracy',
    'answerDeterminacy',
    'officialStyle',
    'stemQuality',
    'distractorQuality',
    'difficultyCalibration',
    'visualIntegrity',
    'overall',
  ],
  properties: {
    contentAccuracy: { type: 'integer', minimum: 0, maximum: 100 },
    answerDeterminacy: { type: 'integer', minimum: 0, maximum: 100 },
    officialStyle: { type: 'integer', minimum: 0, maximum: 100 },
    stemQuality: { type: 'integer', minimum: 0, maximum: 100 },
    distractorQuality: { type: 'integer', minimum: 0, maximum: 100 },
    difficultyCalibration: { type: 'integer', minimum: 0, maximum: 100 },
    visualIntegrity: { type: 'integer', minimum: 0, maximum: 100 },
    overall: { type: 'integer', minimum: 0, maximum: 100 },
  },
};

const AUDIT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: [
    'outcome',
    'recommendedAction',
    'severity',
    'summary',
    'scores',
    'calibratedDifficulty',
    'answerValidation',
    'issues',
    'repairSpecification',
    'referenceUseSummary',
    'confidence',
  ],
  properties: {
    outcome: {
      type: 'string',
      enum: ['pass', 'needs_repair', 'manual_review'],
    },
    recommendedAction: {
      type: 'string',
      enum: ['none', 'add_graph', 'edit', 'rewrite', 'replace'],
    },
    severity: {
      type: 'string',
      enum: ['info', 'low', 'medium', 'high', 'critical'],
    },
    summary: { type: 'string' },
    scores: SCORES_SCHEMA,
    calibratedDifficulty: {
      type: 'string',
      enum: ['easy', 'medium', 'hard'],
    },
    answerValidation: {
      type: 'object',
      additionalProperties: false,
      required: [
        'singleCorrectAnswer',
        'solvedAnswer',
        'matchesStoredKey',
        'explanation',
      ],
      properties: {
        singleCorrectAnswer: { type: 'boolean' },
        solvedAnswer: { type: 'string' },
        matchesStoredKey: { type: 'boolean' },
        explanation: { type: 'string' },
      },
    },
    issues: {
      type: 'array',
      items: ISSUE_SCHEMA,
    },
    repairSpecification: {
      type: 'object',
      additionalProperties: false,
      required: [
        'preserve',
        'change',
        'targetSkill',
        'targetDifficulty',
        'visualRequired',
        'visualRequirements',
      ],
      properties: {
        preserve: {
          type: 'array',
          items: { type: 'string' },
        },
        change: {
          type: 'array',
          items: { type: 'string' },
        },
        targetSkill: { type: 'string' },
        targetDifficulty: {
          type: 'string',
          enum: ['easy', 'medium', 'hard'],
        },
        visualRequired: { type: 'boolean' },
        visualRequirements: { type: 'string' },
      },
    },
    referenceUseSummary: { type: 'string' },
    confidence: {
      type: 'string',
      enum: ['low', 'medium', 'high'],
    },
  },
};

const VISUAL_SERIES_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['name', 'values', 'xValues', 'renderAs', 'showPoints'],
  properties: {
    name: { type: 'string' },
    values: {
      type: 'array',
      items: { type: 'number' },
    },
    xValues: {
      type: 'array',
      items: { type: 'number' },
    },
    renderAs: {
      type: 'string',
      enum: ['line', 'scatter', 'bar'],
    },
    showPoints: { type: 'boolean' },
  },
};

const VISUAL_POINT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['x', 'y'],
  properties: {
    x: { type: 'number' },
    y: { type: 'number' },
  },
};

const VISUAL_ANNOTATION_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['x', 'y', 'label', 'position'],
  properties: {
    x: { type: 'number' },
    y: { type: 'number' },
    label: { type: 'string' },
    position: {
      type: 'string',
      enum: ['above', 'below', 'left', 'right'],
    },
  },
};

const VISUAL_SHAPE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: [
    'type',
    'points',
    'centerX',
    'centerY',
    'radius',
    'label',
    'dashed',
    'fill',
  ],
  properties: {
    type: {
      type: 'string',
      enum: ['line', 'polyline', 'polygon', 'circle'],
    },
    points: {
      type: 'array',
      items: VISUAL_POINT_SCHEMA,
    },
    centerX: { type: 'number' },
    centerY: { type: 'number' },
    radius: { type: 'number', minimum: 0 },
    label: { type: 'string' },
    dashed: { type: 'boolean' },
    fill: { type: 'boolean' },
  },
};

const VISUAL_SPEC_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: [
    'type',
    'title',
    'xLabel',
    'yLabel',
    'categories',
    'xValues',
    'series',
    'tableHeaders',
    'tableRows',
    'xMin',
    'xMax',
    'yMin',
    'yMax',
    'equalScale',
    'showGrid',
    'annotations',
    'shapes',
    'accessibilityText',
  ],
  properties: {
    type: {
      type: 'string',
      enum: [
        'none',
        'table',
        'bar',
        'histogram',
        'line',
        'scatter',
        'coordinate-plane',
        'geometry',
      ],
    },
    title: { type: 'string' },
    xLabel: { type: 'string' },
    yLabel: { type: 'string' },
    categories: {
      type: 'array',
      items: { type: 'string' },
    },
    xValues: {
      type: 'array',
      items: { type: 'number' },
    },
    series: {
      type: 'array',
      items: VISUAL_SERIES_SCHEMA,
    },
    tableHeaders: {
      type: 'array',
      items: { type: 'string' },
    },
    tableRows: {
      type: 'array',
      items: {
        type: 'array',
        items: { type: 'string' },
      },
    },
    xMin: { type: 'number' },
    xMax: { type: 'number' },
    yMin: { type: 'number' },
    yMax: { type: 'number' },
    equalScale: { type: 'boolean' },
    showGrid: { type: 'boolean' },
    annotations: {
      type: 'array',
      items: VISUAL_ANNOTATION_SCHEMA,
    },
    shapes: {
      type: 'array',
      items: VISUAL_SHAPE_SCHEMA,
    },
    accessibilityText: { type: 'string' },
  },
};

const REPAIRED_QUESTION_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: [
    'passage',
    'text',
    'questionType',
    'options',
    'correctAnswerIndex',
    'correctAnswerValue',
    'acceptedAnswers',
    'inputType',
    'answerFormat',
    'explanation',
    'difficulty',
    'subcategory',
    'skillTags',
    'subjectArea',
    'mainCategory',
    'graphDescription',
    'visualSpec',
  ],
  properties: {
    passage: { type: 'string' },
    text: { type: 'string' },
    questionType: {
      type: 'string',
      enum: ['multiple-choice', 'user-input'],
    },
    options: {
      type: 'array',
      minItems: 0,
      maxItems: 4,
      items: { type: 'string' },
    },
    correctAnswerIndex: {
      type: 'integer',
      minimum: -1,
      maximum: 3,
    },
    correctAnswerValue: { type: 'string' },
    acceptedAnswers: {
      type: 'array',
      items: { type: 'string' },
    },
    inputType: {
      type: 'string',
      enum: ['number', 'text', 'fraction'],
    },
    answerFormat: { type: 'string' },
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
    subjectArea: {
      type: 'string',
      enum: ['Reading and Writing', 'Math'],
    },
    mainCategory: { type: 'string' },
    graphDescription: { type: 'string' },
    visualSpec: VISUAL_SPEC_SCHEMA,
  },
};

const REPAIR_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: [
    'changeSummary',
    'qualityRationale',
    'question',
  ],
  properties: {
    changeSummary: { type: 'string' },
    qualityRationale: { type: 'string' },
    question: REPAIRED_QUESTION_SCHEMA,
  },
};

const VERIFICATION_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: [
    'acceptable',
    'questionType',
    'solvedAnswerIndex',
    'solvedAnswerValue',
    'singleCorrectAnswer',
    'contentAccurate',
    'officialStyleScore',
    'stemQualityScore',
    'distractorQualityScore',
    'difficultyCalibrationScore',
    'visualMatchesQuestion',
    'graphSpecSufficient',
    'criticalIssues',
    'summary',
  ],
  properties: {
    acceptable: { type: 'boolean' },
    questionType: {
      type: 'string',
      enum: ['multiple-choice', 'user-input'],
    },
    solvedAnswerIndex: {
      type: 'integer',
      minimum: -1,
      maximum: 3,
    },
    solvedAnswerValue: { type: 'string' },
    singleCorrectAnswer: { type: 'boolean' },
    contentAccurate: { type: 'boolean' },
    officialStyleScore: { type: 'integer', minimum: 0, maximum: 100 },
    stemQualityScore: { type: 'integer', minimum: 0, maximum: 100 },
    distractorQualityScore: { type: 'integer', minimum: 0, maximum: 100 },
    difficultyCalibrationScore: { type: 'integer', minimum: 0, maximum: 100 },
    visualMatchesQuestion: { type: 'boolean' },
    graphSpecSufficient: { type: 'boolean' },
    criticalIssues: {
      type: 'array',
      items: { type: 'string' },
    },
    summary: { type: 'string' },
  },
};

function getModel() {
  return process.env.OPENAI_EXAM_QUALITY_MODEL || DEFAULT_MODEL;
}

function getReasoningEffort() {
  // gpt-5.6-luna accepts minimal | low | medium | high. The sol-era values
  // ('xhigh', 'max') are folded down to 'high' by resolveReasoningEffort.
  return resolveReasoningEffort('OPENAI_EXAM_QUALITY_REASONING_EFFORT');
}

function getReasoningMode() {
  const configured = (
    process.env.OPENAI_EXAM_QUALITY_REASONING_MODE ||
    DEFAULT_REASONING_MODE
  ).toLowerCase();
  return configured === 'pro' ? 'pro' : null;
}

function createOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'OPENAI_API_KEY is required for exam quality control',
    );
  }
  return new OpenAI({ apiKey });
}

function normalizeForHash(value) {
  if (value === undefined) return null;
  if (value === null || typeof value !== 'object') return value;
  if (typeof value.toDate === 'function') {
    return value.toDate().toISOString();
  }
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) {
    return value.map(normalizeForHash);
  }

  return Object.keys(value)
    .sort()
    .reduce((result, key) => {
      result[key] = normalizeForHash(value[key]);
      return result;
    }, {});
}

function stableStringify(value) {
  return JSON.stringify(normalizeForHash(value));
}

function createContentHash(value) {
  return crypto
    .createHash('sha256')
    .update(stableStringify(value))
    .digest('hex');
}

function stripUndefined(value) {
  if (Array.isArray(value)) {
    return value.map(stripUndefined);
  }
  if (!value || typeof value !== 'object') return value;
  if (typeof value.toDate === 'function' || value instanceof Date) {
    return value;
  }

  return Object.entries(value).reduce((result, [key, nestedValue]) => {
    if (nestedValue !== undefined) {
      result[key] = stripUndefined(nestedValue);
    }
    return result;
  }, {});
}

function normalizeDifficulty(value) {
  const normalized = String(value || '').trim().toLowerCase();
  return ['easy', 'medium', 'hard'].includes(normalized)
    ? normalized
    : 'medium';
}

function inferQuestionType(question = {}) {
  if (question.questionType === 'user-input') {
    return 'user-input';
  }

  if (question.questionType === 'multiple-choice') {
    return 'multiple-choice';
  }

  if (Array.isArray(question.options) && question.options.length > 0) {
    return 'multiple-choice';
  }

  if (
    question.inputType ||
    (Array.isArray(question.options) && question.options.length === 0)
  ) {
    return 'user-input';
  }

  return 'multiple-choice';
}

function normalizeOption(value) {
  return String(value ?? '')
    .replace(/^\s*[A-D][).:-]\s*/i, '')
    .trim();
}

function resolveCorrectAnswerIndex(question = {}) {
  const options = Array.isArray(question.options)
    ? question.options.map(normalizeOption)
    : [];
  const value = question.correctAnswer;

  if (Number.isInteger(value) && value >= 0 && value < options.length) {
    return value;
  }

  const text = String(value ?? '').trim();
  if (/^[A-Da-d]$/.test(text)) {
    return text.toUpperCase().charCodeAt(0) - 65;
  }

  const numeric = Number.parseInt(text, 10);
  if (
    Number.isInteger(numeric) &&
    String(numeric) === text &&
    numeric >= 0 &&
    numeric < options.length
  ) {
    return numeric;
  }

  const normalizedAnswer = normalizeOption(text).toLowerCase();
  return options.findIndex(
    option => option.toLowerCase() === normalizedAnswer,
  );
}

function createIssue(code, severity, evidence, repairInstruction) {
  return {
    code,
    severity,
    evidence,
    // Keep the legacy field while callers and previously persisted runs migrate.
    message: evidence,
    repairInstruction,
  };
}

function containsUnsafeMarkup(value) {
  const text = String(value || '');
  return (
    /<\s*\/?\s*(?:script|iframe|object|embed|img|svg|style|link|meta|form|input|button|video|audio)\b/i.test(
      text,
    ) ||
    /\bon[a-z]+\s*=/i.test(text) ||
    /\b(?:javascript|data)\s*:/i.test(text)
  );
}

function inspectQuestionDeterministically(
  question = {},
  { moduleNumber } = {},
) {
  const issues = [];
  const questionType = inferQuestionType(question);
  const text = String(question.text || question.question || '').trim();
  const passage = String(question.passage || '').trim();
  const options = Array.isArray(question.options)
    ? question.options.map(option => String(option ?? '').trim())
    : [];

  if (!text) {
    issues.push(
      createIssue(
        'missing_question_text',
        'critical',
        'Question text is missing.',
        'Replace the question with a complete question.',
      ),
    );
  }

  if (
    containsUnsafeMarkup(text) ||
    containsUnsafeMarkup(passage) ||
    options.some(containsUnsafeMarkup) ||
    containsUnsafeMarkup(question.explanation) ||
    containsUnsafeMarkup(question.graphDescription) ||
    containsUnsafeMarkup(question.answerFormat)
  ) {
    issues.push(
      createIssue(
        'unsafe_question_markup',
        'critical',
        'The question contains unsafe or unsupported active HTML markup.',
        'Replace active HTML with plain text or the application’s supported inert text formatting.',
      ),
    );
  }

  if (
    Number(moduleNumber) <= 2 &&
    !passage &&
    text.length < 180
  ) {
    issues.push(
      createIssue(
        'possible_missing_passage',
        'medium',
        'A Reading and Writing question has no separate passage and the stored text is too short to contain a complete stimulus.',
        'Recover or replace the complete stimulus and question stem.',
      ),
    );
  }

  if (questionType === 'multiple-choice') {
    if (options.length !== 4) {
      issues.push(
        createIssue(
          'invalid_option_count',
          'critical',
          `Multiple-choice question has ${options.length} options; exactly four are required.`,
          'Repair or replace the question with four complete choices.',
        ),
      );
    }

    const nonEmptyOptions = options.filter(Boolean);
    if (nonEmptyOptions.length !== options.length) {
      issues.push(
        createIssue(
          'empty_answer_choice',
          'critical',
          'One or more answer choices are empty.',
          'Replace every empty choice with a relevant, plausible answer choice.',
        ),
      );
    }

    const uniqueOptions = new Set(
      nonEmptyOptions.map(option => normalizeOption(option).toLowerCase()),
    );
    if (uniqueOptions.size !== nonEmptyOptions.length) {
      issues.push(
        createIssue(
          'duplicate_answer_choice',
          'critical',
          'Two or more answer choices are duplicates.',
          'Create four distinct, mutually exclusive answer choices.',
        ),
      );
    }

    if (resolveCorrectAnswerIndex(question) < 0) {
      issues.push(
        createIssue(
          'invalid_answer_key',
          'critical',
          'The stored correct answer does not resolve to one of the choices.',
          'Solve the question independently and store the verified zero-based answer index.',
        ),
      );
    }

    if (!Number.isInteger(question.correctAnswer)) {
      issues.push(
        createIssue(
          'noncanonical_answer_key',
          'high',
          'The multiple-choice answer key is not stored as a zero-based integer index.',
          'Preserve the assessed content and normalize the verified key to an integer from 0 through 3.',
        ),
      );
    }
  } else {
    const acceptedAnswers = Array.isArray(question.acceptedAnswers)
      ? question.acceptedAnswers.filter(
          answer => String(answer ?? '').trim().length > 0,
        )
      : [];
    const hasCorrectAnswer =
      question.correctAnswer !== undefined &&
      question.correctAnswer !== null &&
      String(question.correctAnswer).trim().length > 0;

    if (!hasCorrectAnswer && acceptedAnswers.length === 0) {
      issues.push(
        createIssue(
          'missing_student_response_key',
          'critical',
          'Student-produced response question has no answer key.',
          'Solve the question and store the primary and accepted answers.',
        ),
      );
    }
  }

  if (!String(question.explanation || '').trim()) {
    issues.push(
      createIssue(
        'missing_explanation',
        'high',
        'The question has no explanation.',
        'Add a concise, complete explanation that verifies the answer.',
      ),
    );
  }

  const graphDescription = String(
    question.graphDescription || question.imageDescription || '',
  ).trim();
  const graphUrl = String(question.graphUrl || '').trim();
  if ((graphDescription || question.hasImage === true) && !graphUrl) {
    issues.push(
      createIssue(
        'missing_required_visual',
        'critical',
        'The question indicates that a visual is required, but no graph asset is attached.',
        'Generate, independently verify, and attach the required visual.',
      ),
    );
  }

  if (graphUrl && !graphDescription) {
    issues.push(
      createIssue(
        'missing_visual_description',
        'high',
        'A visual is attached without a graph description.',
        'Add an exact data/visual description for accessibility and future verification.',
      ),
    );
  }

  return {
    valid: !issues.some(
      issue => SEVERITY_RANK[issue.severity] >= SEVERITY_RANK.high,
    ),
    questionType,
    resolvedCorrectAnswerIndex:
      questionType === 'multiple-choice'
        ? resolveCorrectAnswerIndex(question)
        : -1,
    issues,
  };
}

function getExpectedQuestionCount(moduleNumber) {
  return EXPECTED_QUESTION_COUNTS[Number(moduleNumber)] || null;
}

function inspectModuleStructure(module = {}, resolvedQuestionIds = []) {
  const questionIds = Array.isArray(module.questionIds)
    ? module.questionIds.map(id => String(id))
    : [];
  const expectedCount = getExpectedQuestionCount(module.moduleNumber);
  const resolvedSet = new Set(resolvedQuestionIds.map(String));
  const missingQuestionIds = questionIds.filter(id => !resolvedSet.has(id));
  const duplicateCount = questionIds.length - new Set(questionIds).size;
  const issues = [];

  if (expectedCount && questionIds.length !== expectedCount) {
    issues.push(
      createIssue(
        'module_question_count_mismatch',
        questionIds.length < expectedCount ? 'critical' : 'high',
        `Module ${module.moduleNumber} has ${questionIds.length} question references; the Digital SAT blueprint requires ${expectedCount}.`,
        questionIds.length < expectedCount
          ? `Create ${expectedCount - questionIds.length} verified replacement question(s) in the missing slots.`
          : 'Review the module blueprint and remove no content automatically.',
      ),
    );
  }

  if (
    Number.isInteger(module.questionCount) &&
    module.questionCount !== questionIds.length
  ) {
    issues.push(
      createIssue(
        'declared_count_mismatch',
        'medium',
        `The module declares ${module.questionCount} questions but references ${questionIds.length}.`,
        'After content repairs, synchronize the declared count to the verified slot count.',
      ),
    );
  }

  if (missingQuestionIds.length > 0) {
    issues.push(
      createIssue(
        'dead_question_references',
        'critical',
        `${missingQuestionIds.length} module reference(s) point to missing question documents.`,
        'Create verified exam-scoped replacements at the exact affected slots.',
      ),
    );
  }

  if (duplicateCount > 0) {
    issues.push(
      createIssue(
        'duplicate_question_references',
        'high',
        `${duplicateCount} duplicate question reference(s) appear in this module.`,
        'Replace later duplicate slots with original, verified questions.',
      ),
    );
  }

  return {
    expectedCount,
    questionIdsLength: questionIds.length,
    resolvedQuestionCount: questionIds.length - missingQuestionIds.length,
    missingQuestionIds,
    duplicateCount,
    issues,
  };
}

function highestSeverity(items = []) {
  return items.reduce((highest, item) => {
    const severity = item?.severity || 'info';
    return SEVERITY_RANK[severity] > SEVERITY_RANK[highest]
      ? severity
      : highest;
  }, 'info');
}

function sanitizeQuestionForPrompt(question = {}) {
  return stripUndefined({
    passage: question.passage || '',
    text: question.text || question.question || '',
    questionType: inferQuestionType(question),
    options: Array.isArray(question.options) ? question.options : [],
    correctAnswer: question.correctAnswer ?? '',
    acceptedAnswers: Array.isArray(question.acceptedAnswers)
      ? question.acceptedAnswers
      : [],
    inputType: question.inputType || '',
    answerFormat: question.answerFormat || '',
    explanation: question.explanation || '',
    difficulty: normalizeDifficulty(question.difficulty),
    subcategory:
      question.subcategory ||
      question.subCategory ||
      question.subcategoryId ||
      '',
    subjectArea: question.subjectArea || '',
    mainCategory: question.mainCategory || '',
    graphDescription:
      question.graphDescription || question.imageDescription || '',
    graphUrl: question.graphUrl || '',
    hasImage: Boolean(question.hasImage),
    visualSpec: question.visualSpec || null,
    skillTags: Array.isArray(question.skillTags)
      ? question.skillTags
      : [],
  });
}

function formatReferenceExcerpts(excerpts = []) {
  if (!excerpts.length) {
    return 'No reference excerpts were available. Do not infer that this lowers the required quality bar.';
  }

  return excerpts
    .map(
      (excerpt, index) =>
        `REFERENCE EXCERPT ${index + 1} (retrieval score ${Number(
          excerpt.score || 0,
        ).toFixed(3)}):\n${excerpt.text}`,
    )
    .join('\n\n---\n\n');
}

function buildAuditPrompt({
  question,
  moduleNumber,
  questionNumber,
  deterministicIssues = [],
  referenceExcerpts = [],
}) {
  const section =
    Number(moduleNumber) <= 2 ? 'Reading and Writing' : 'Math';
  const difficulty = normalizeDifficulty(question.difficulty);
  const subcategory =
    question.subcategory ||
    question.subCategory ||
    question.subcategoryId ||
    'unknown';

  return `Audit one Digital SAT practice question. This is the checking stage only:
do not rewrite the question and do not create replacement content.

TARGET
- Section: ${section}
- Module: ${moduleNumber}
- Question position: ${questionNumber}
- Stored difficulty: ${difficulty}
- Stored subcategory: ${subcategory}

QUESTION RECORD
${JSON.stringify(sanitizeQuestionForPrompt(question), null, 2)}

DETERMINISTIC CHECKS
${JSON.stringify(deterministicIssues, null, 2)}

RETRIEVED OFFICIAL-STYLE REFERENCES
Use the excerpts only to calibrate format, rigor, economy, difficulty, and
distractor construction. Never copy or closely paraphrase their wording,
scenario, values, named entities, or answer pattern.

${formatReferenceExcerpts(referenceExcerpts)}

EVALUATION CONTRACT
1. Solve the question independently before considering the stored key.
2. Check content accuracy, sufficiency of the stimulus, uniqueness of the
   answer, answer-key alignment, and explanation accuracy.
3. Judge whether all choices answer the actual question and whether each
   distractor is plausible, distinct, parallel, and definitively wrong.
4. Compare style at a nuanced level: tested skill, passage/stem economy,
   cognitive demand, College Board conventions, fairness, and avoidance of
   giveaway wording or artificial trickiness.
5. Inspect the attached visual when one is supplied. Decide whether a visual is
   required, present, legible, complete, and numerically consistent.
6. A stylistically acceptable question can still fail for a weak distractor,
   missing passage, easy giveaway, unrelated choice, incorrect key, or visual.
7. Reserve "pass" for publication-ready content. Scores of 90+ mean genuinely
   strong, not merely adequate. If evidence is insufficient, request manual
   review rather than guessing.
8. Produce a precise repair specification, but no replacement wording.

Return only the strict structured result.`;
}

function buildRepairPrompt({
  itemKind,
  sourceQuestion,
  moduleNumber,
  questionNumber,
  analysis,
  moduleProfile = {},
  referenceExcerpts = [],
}) {
  const section =
    Number(moduleNumber) <= 2 ? 'Reading and Writing' : 'Math';
  const isMissing =
    itemKind === 'missing_question' ||
    itemKind === 'duplicate_question';

  return `Create one publication-grade, original Digital SAT question as an
exam-scoped repair. This request is authorized by an administrator after a
completed audit. The candidate will still be independently solved and verified
before it can be applied.

TARGET
- Section: ${section}
- Module: ${moduleNumber}
- Question position: ${questionNumber}
- Repair type: ${itemKind}

${isMissing ? 'There is no usable source question for this slot.' : `SOURCE QUESTION\n${JSON.stringify(sanitizeQuestionForPrompt(sourceQuestion), null, 2)}`}

AUDIT FINDING AND REPAIR SPECIFICATION
${JSON.stringify(analysis || {}, null, 2)}

MODULE PROFILE
Use this only to avoid accidental duplication and preserve a balanced module.
${JSON.stringify(moduleProfile, null, 2)}

RETRIEVED OFFICIAL-STYLE REFERENCES
Use these to calibrate quality and convention only. The output must be fully
original and must not copy or closely paraphrase any reference's wording,
scenario, values, named entities, or distractor pattern.

${formatReferenceExcerpts(referenceExcerpts)}

AUTHORING REQUIREMENTS
- Test exactly one clear Digital SAT skill at the requested difficulty.
- Include every passage, note set, equation, table value, unit, definition, and
  constraint needed to answer the question.
- Use multiple-choice or student-produced response format as appropriate for
  the official section and skill.
- Multiple-choice questions must have exactly four distinct choices and one
  objectively correct answer. Set correctAnswerIndex to 0-3 and leave
  correctAnswerValue empty.
- Student-produced response questions must have no choices, use
  correctAnswerIndex -1, and provide the primary answer plus every accepted
  equivalent answer.
- Make incorrect choices plausible consequences of recognizable reasoning
  errors; never use irrelevant, joke, obviously malformed, or giveaway choices.
- Keep choices parallel in grammar, scope, units, and precision.
- The explanation must independently establish the answer and address the
  decisive traps without claiming unsupported facts.
- If a visual is required, encode every value needed to render it in visualSpec.
  Use table, bar, histogram, line, scatter, coordinate-plane, or geometry.
  Use per-series xValues for functions and data sets, shapes plus annotations
  for geometric diagrams, and explicit bounds when the axes matter. Set
  equalScale true for geometric figures and coordinate plots where lengths,
  slopes, circles, or angles must not be distorted. All values, labels, and
  relationships must be exact; do not invent decorative data.
- graphDescription and accessibilityText must be exact and complete. If no
  visual is required, visualSpec.type must be "none", all visual arrays must be
  empty, and the bounds may all be zero.
- Do not reproduce copyrighted reference wording. Create new content.

Return only the strict structured result.`;
}

function buildVerificationPrompt({
  question,
  moduleNumber,
  questionNumber,
  referenceExcerpts = [],
}) {
  const candidate = sanitizeQuestionForPrompt(question);
  delete candidate.correctAnswer;
  delete candidate.acceptedAnswers;
  delete candidate.explanation;

  return `Independently solve and quality-control this proposed Digital SAT
question. You are the final gate before an approved repair can reach a public
exam. Do not assume the author's key or explanation is correct; they are not
shown.

TARGET
- Module: ${moduleNumber}
- Question position: ${questionNumber}
- Section: ${Number(moduleNumber) <= 2 ? 'Reading and Writing' : 'Math'}

CANDIDATE WITHOUT KEY OR EXPLANATION
${JSON.stringify(candidate, null, 2)}

REFERENCE CALIBRATION
Use these only for the expected style, rigor, format, and difficulty. Never
penalize originality and never reward copied wording.

${formatReferenceExcerpts(referenceExcerpts)}

VERIFICATION CONTRACT
- Solve from scratch and report the answer.
- Require a single objectively correct answer for multiple-choice.
- Check factual and mathematical accuracy, stimulus sufficiency, official
  conventions, answer-choice parallelism, distractor quality, and target
  difficulty.
- If a rendered visual is attached, verify that it is legible and that every
  value, label, and relationship matches the candidate.
- Mark acceptable only when the content is publication-ready. A score below 90
  in official style or stem quality, below 85 in distractor quality, any
  ambiguity, any incorrect value, any answer mismatch, or any insufficient
  visual must block application.

Return only the strict structured result.`;
}

function extractResponseText(response) {
  if (typeof response?.output_text === 'string') {
    return response.output_text;
  }
  if (Array.isArray(response?.output)) {
    for (const outputItem of response.output) {
      if (outputItem?.type !== 'message' || !Array.isArray(outputItem.content)) {
        continue;
      }
      const textItem = outputItem.content.find(
        contentItem => contentItem?.type === 'output_text',
      );
      if (textItem?.text) return textItem.text;
    }
  }
  return '';
}

async function callStructuredResponse({
  client,
  schema,
  schemaName,
  system,
  userContent,
  maxOutputTokens = DEFAULT_MAX_OUTPUT_TOKENS,
  model = getModel(),
  reasoningEffort = getReasoningEffort(),
  reasoningMode = getReasoningMode(),
}) {
  const openai = client || createOpenAIClient();
  let lastError;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await openai.responses.create({
        model,
        reasoning: stripUndefined({
          effort: reasoningEffort,
          mode: reasoningMode || undefined,
        }),
        input: [
          {
            role: 'system',
            content: [
              {
                type: 'input_text',
                text: system,
              },
            ],
          },
          {
            role: 'user',
            content: userContent,
          },
        ],
        text: {
          verbosity: 'medium',
          format: {
            type: 'json_schema',
            name: schemaName,
            strict: true,
            schema,
          },
        },
        store: false,
        max_output_tokens: maxOutputTokens,
      });

      const rawText = extractResponseText(response);
      if (!rawText) {
        throw new Error(`${schemaName} returned no structured output`);
      }

      return {
        parsed: JSON.parse(rawText),
        rawText,
        responseId: response.id || null,
        usage: response.usage || null,
        model: response.model || model,
      };
    } catch (error) {
      lastError = error;
      const status = Number(error?.status || error?.statusCode || 0);
      const retryable =
        attempt < 3 &&
        (status === 408 ||
          status === 409 ||
          status === 429 ||
          status >= 500 ||
          /timeout|temporar|rate limit|connection/i.test(error.message || ''));

      if (!retryable) throw error;
      await new Promise(resolve => setTimeout(resolve, 500 * attempt));
    }
  }

  throw lastError;
}

async function retrieveReferenceExcerpts({
  client,
  vectorStoreId,
  query,
  limit = 8,
}) {
  if (!vectorStoreId) return [];
  const openai = client || createOpenAIClient();
  const page = await openai.vectorStores.search(vectorStoreId, {
    query,
    max_num_results: Math.max(1, Math.min(limit, 12)),
    rewrite_query: true,
    ranking_options: {
      ranker: 'auto',
      score_threshold: 0.18,
    },
  });

  const results = Array.isArray(page?.data) ? page.data : [];
  return results.map(result => ({
    fileId: result.file_id || '',
    fileName: result.filename || '',
    score: result.score || 0,
    text: Array.isArray(result.content)
      ? result.content
          .filter(content => content?.type === 'text')
          .map(content => content.text)
          .join('\n')
      : '',
  })).filter(result => result.text);
}

function requireReferenceEvidence(
  excerpts,
  { minimumCount = 2, minimumScore = 0.18 } = {},
) {
  const qualifying = (excerpts || []).filter(
    excerpt =>
      excerpt.text &&
      Number(excerpt.score || 0) >= minimumScore,
  );
  if (qualifying.length < minimumCount) {
    const error = new Error(
      `The reference library returned ${qualifying.length} qualifying exemplar(s); at least ${minimumCount} are required for this skill and difficulty.`,
    );
    error.code = 'REFERENCE_COVERAGE_INSUFFICIENT';
    error.status = 422;
    throw error;
  }
  return qualifying;
}

function getReferenceQuery(question = {}, moduleNumber, purpose) {
  const section =
    Number(moduleNumber) <= 2 ? 'Reading and Writing' : 'Math';
  const subcategory =
    question.subcategory ||
    question.subCategory ||
    question.subcategoryId ||
    'mixed Digital SAT skills';
  const difficulty = normalizeDifficulty(question.difficulty);

  return `${purpose} Digital SAT ${section} ${subcategory} ${difficulty} official question passage stem answer choices distractors`;
}

function compareBlindAnswerToStoredKey(question, verification) {
  const questionType = inferQuestionType(question);
  if (questionType === 'multiple-choice') {
    const storedIndex = resolveCorrectAnswerIndex(question);
    return {
      questionType,
      storedAnswer: storedIndex,
      solvedAnswer: Number(verification.solvedAnswerIndex),
      matchesStoredKey:
        storedIndex >= 0 &&
        Number(verification.solvedAnswerIndex) === storedIndex,
    };
  }

  const storedAnswers = [
    question.correctAnswer,
    ...(Array.isArray(question.acceptedAnswers)
      ? question.acceptedAnswers
      : []),
  ].filter(
    answer =>
      answer !== undefined &&
      answer !== null &&
      String(answer).trim(),
  );
  const invalidStoredAnswers = storedAnswers.filter(
    answer =>
      !isValidSatStudentResponse(answer) ||
      !isSatAnswerEquivalent(
        answer,
        verification.solvedAnswerValue,
      ),
  );
  const missingOfficialForms = Array.from(
    getOfficialApproximationForms(
      verification.solvedAnswerValue,
    ),
  ).filter(
    required =>
      !storedAnswers.some(
        answer =>
          normalizeAnswerValue(answer) ===
          normalizeAnswerValue(required),
      ),
  );
  return {
    questionType,
    storedAnswer: storedAnswers,
    solvedAnswer: verification.solvedAnswerValue,
    invalidStoredAnswers,
    missingOfficialForms,
    matchesStoredKey:
      storedAnswers.length > 0 &&
      invalidStoredAnswers.length === 0,
  };
}

function mergeBlindVerificationIntoAudit(
  audit,
  verification,
  question,
) {
  const comparison = compareBlindAnswerToStoredKey(
    question,
    verification,
  );
  const merged = {
    ...audit,
    scores: { ...audit.scores },
    answerValidation: {
      ...audit.answerValidation,
      singleCorrectAnswer:
        Boolean(audit.answerValidation?.singleCorrectAnswer) &&
        Boolean(verification.singleCorrectAnswer),
      solvedAnswer: String(comparison.solvedAnswer ?? ''),
      matchesStoredKey:
        Boolean(audit.answerValidation?.matchesStoredKey) &&
        comparison.matchesStoredKey,
      explanation: verification.summary,
    },
    issues: Array.isArray(audit.issues)
      ? audit.issues.slice()
      : [],
  };

  merged.scores.contentAccuracy = verification.contentAccurate
    ? Math.min(
        Number(merged.scores.contentAccuracy || 0),
        100,
      )
    : 0;
  merged.scores.answerDeterminacy =
    verification.singleCorrectAnswer &&
    comparison.matchesStoredKey
      ? Number(merged.scores.answerDeterminacy || 0)
      : 0;
  merged.scores.officialStyle = Math.min(
    Number(merged.scores.officialStyle || 0),
    Number(verification.officialStyleScore || 0),
  );
  merged.scores.stemQuality = Math.min(
    Number(merged.scores.stemQuality || 0),
    Number(verification.stemQualityScore || 0),
  );
  if (comparison.questionType === 'multiple-choice') {
    merged.scores.distractorQuality = Math.min(
      Number(merged.scores.distractorQuality || 0),
      Number(verification.distractorQualityScore || 0),
    );
  }
  merged.scores.difficultyCalibration = Math.min(
    Number(merged.scores.difficultyCalibration || 0),
    Number(verification.difficultyCalibrationScore || 0),
  );
  if (
    (question.graphUrl || question.hasImage || question.graphDescription) &&
    (
      !verification.visualMatchesQuestion ||
      !verification.graphSpecSufficient
    )
  ) {
    merged.scores.visualIntegrity = 0;
  }
  merged.scores.overall = Math.min(
    Number(merged.scores.overall || 0),
    merged.scores.contentAccuracy,
    merged.scores.answerDeterminacy,
    merged.scores.officialStyle,
    merged.scores.stemQuality,
    merged.scores.difficultyCalibration,
    comparison.questionType === 'multiple-choice'
      ? merged.scores.distractorQuality
      : 100,
  );

  const blockingIssues = [];
  if (!verification.singleCorrectAnswer) {
    blockingIssues.push(
      createIssue(
        'blind_solver_ambiguity',
        'critical',
        'The key-hidden independent solver did not find one determinate answer.',
        'Rewrite the question so exactly one response is objectively correct.',
      ),
    );
  }
  if (!comparison.matchesStoredKey) {
    blockingIssues.push(
      createIssue(
        'blind_answer_key_mismatch',
        'critical',
        `The key-hidden independent solution (${comparison.solvedAnswer}) does not match the stored key.`,
        'Correct the key only after reconciling the full solution, or replace the question if the stem or choices caused the mismatch.',
      ),
    );
  }
  if (comparison.invalidStoredAnswers?.length) {
    blockingIssues.push(
      createIssue(
        'invalid_student_response_key',
        'critical',
        'At least one stored accepted response is invalid or does not represent the independently solved value.',
        'Remove every invalid accepted response and retain only exact or officially rounded/truncated SAT response forms.',
      ),
    );
  }
  if (comparison.missingOfficialForms?.length) {
    blockingIssues.push(
      createIssue(
        'incomplete_student_response_keys',
        'high',
        `The stored key omits official rounded or truncated response form(s): ${comparison.missingOfficialForms.join(', ')}.`,
        'Add every official response form derived from the independently solved exact value.',
      ),
    );
  }
  if (!verification.contentAccurate) {
    blockingIssues.push(
      createIssue(
        'blind_content_accuracy_failure',
        'critical',
        'The key-hidden independent review found a content-accuracy problem.',
        'Correct or replace the question and independently solve it again.',
      ),
    );
  }
  (verification.criticalIssues || []).forEach(issue => {
    blockingIssues.push(
      createIssue(
        'blind_verifier_issue',
        'high',
        String(issue),
        'Address the independent verifier concern before publication.',
      ),
    );
  });
  merged.issues.push(...blockingIssues);

  if (
    blockingIssues.length > 0 ||
    !verification.acceptable
  ) {
    merged.outcome = 'needs_repair';
    if (merged.recommendedAction === 'none') {
      merged.recommendedAction = 'rewrite';
    }
    merged.severity = highestSeverity([
      { severity: merged.severity },
      ...blockingIssues,
      {
        severity: verification.acceptable
          ? 'info'
          : 'high',
      },
    ]);
    merged.summary = `${merged.summary} A separate key-hidden solver blocked publication or identified a mismatch.`;
  }

  return {
    audit: merged,
    comparison,
  };
}

async function runQuestionAudit({
  client,
  question,
  moduleNumber,
  questionNumber,
  deterministicIssues,
  vectorStoreId,
  model = getModel(),
  reasoningEffort = getReasoningEffort(),
  reasoningMode = getReasoningMode(),
}) {
  const blindVerification = await runIndependentVerification({
    client,
    question,
    moduleNumber,
    questionNumber,
    vectorStoreId,
    renderedVisualDataUrl: null,
    model,
    reasoningEffort,
    reasoningMode,
  });
  const referenceExcerpts = requireReferenceEvidence(
    await retrieveReferenceExcerpts({
      client,
      vectorStoreId,
      query: getReferenceQuery(question, moduleNumber, 'quality calibration'),
    }),
  );
  const content = [
    {
      type: 'input_text',
      text: `${buildAuditPrompt({
        question,
        moduleNumber,
        questionNumber,
        deterministicIssues,
        referenceExcerpts,
      })}

KEY-HIDDEN INDEPENDENT SOLVER RESULT
The following result came from a separate call that did not receive the stored
key or explanation. Reconcile it with the stored key and explicitly verify that
the stored explanation is accurate, complete, and consistent with this solution.
${JSON.stringify(blindVerification.parsed, null, 2)}`,
    },
  ];

  if (question.graphUrl) {
    content.push({
      type: 'input_image',
      image_url: question.graphUrl,
      detail: 'high',
    });
  }

  const response = await callStructuredResponse({
    client,
    schema: AUDIT_SCHEMA,
    schemaName: 'digital_sat_exam_question_audit',
    system:
      'You are a meticulous independent Digital SAT assessment editor. Audit only; never rewrite during this stage. Apply the strict output schema.',
    userContent: content,
    model,
    reasoningEffort,
    reasoningMode,
  });

  const merged = mergeBlindVerificationIntoAudit(
    response.parsed,
    blindVerification.parsed,
    question,
  );

  return {
    ...response,
    parsed: merged.audit,
    blindVerification: {
      result: blindVerification.parsed,
      comparison: merged.comparison,
      responseId: blindVerification.responseId,
      usage: blindVerification.usage,
      referenceEvidence:
        blindVerification.referenceEvidence,
      referenceEvidenceHash:
        blindVerification.referenceEvidenceHash,
    },
    referenceEvidence: referenceExcerpts.map(excerpt => ({
      fileId: excerpt.fileId,
      fileName: excerpt.fileName,
      score: excerpt.score,
      contentHash: createContentHash(excerpt.text),
    })),
    referenceEvidenceHash: createContentHash(referenceExcerpts),
  };
}

function normalizeRepairQuestion(rawQuestion = {}, sourceQuestion = {}) {
  const questionType =
    rawQuestion.questionType === 'user-input'
      ? 'user-input'
      : 'multiple-choice';
  const options =
    questionType === 'multiple-choice'
      ? (rawQuestion.options || []).map(option => String(option).trim())
      : [];
  const correctAnswerIndex =
    questionType === 'multiple-choice'
      ? Number(rawQuestion.correctAnswerIndex)
      : -1;
  const requestedCorrectAnswerValue = String(
    rawQuestion.correctAnswerValue || '',
  ).trim();
  const acceptedAnswers = Array.isArray(rawQuestion.acceptedAnswers)
    ? rawQuestion.acceptedAnswers.map(answer => String(answer).trim()).filter(Boolean)
    : [];
  const correctAnswerValue =
    requestedCorrectAnswerValue || acceptedAnswers[0] || '';
  const officialApproximationForms =
    questionType === 'user-input'
      ? Array.from(
          getOfficialApproximationForms(correctAnswerValue),
        )
      : [];
  const subcategory =
    String(rawQuestion.subcategory || '').trim() ||
    sourceQuestion.subcategory ||
    sourceQuestion.subCategory ||
    sourceQuestion.subcategoryId ||
    '';
  const canonicalSubcategory = resolveSubcategory(subcategory);
  const subjectArea =
    rawQuestion.subjectArea ||
    sourceQuestion.subjectArea ||
    '';
  const mainCategory =
    rawQuestion.mainCategory ||
    sourceQuestion.mainCategory ||
    '';

  return stripUndefined({
    ...sourceQuestion,
    passage: String(rawQuestion.passage || '').trim() || null,
    text: String(rawQuestion.text || '').trim(),
    questionType,
    options,
    correctAnswer:
      questionType === 'multiple-choice'
        ? correctAnswerIndex
        : correctAnswerValue,
    acceptedAnswers:
      questionType === 'user-input'
        ? Array.from(
            new Set(
              [
                correctAnswerValue,
                ...acceptedAnswers,
                ...officialApproximationForms,
              ].filter(Boolean),
            ),
          )
        : [],
    inputType: rawQuestion.inputType || 'number',
    answerFormat: String(rawQuestion.answerFormat || '').trim(),
    explanation: String(rawQuestion.explanation || '').trim(),
    difficulty: normalizeDifficulty(rawQuestion.difficulty),
    subcategory: canonicalSubcategory?.kebab || subcategory,
    subCategory: canonicalSubcategory?.kebab || subcategory,
    subcategoryId:
      canonicalSubcategory?.id ||
      sourceQuestion.subcategoryId ||
      null,
    subjectArea:
      canonicalSubcategory?.section || subjectArea,
    mainCategory:
      canonicalSubcategory?.mainCategory || mainCategory,
    categoryPath: [
      canonicalSubcategory?.section || subjectArea,
      canonicalSubcategory?.mainCategory || mainCategory,
      canonicalSubcategory?.kebab || subcategory,
    ].filter(Boolean).join('/'),
    skillTags: Array.from(
      new Set(
        (rawQuestion.skillTags || [])
          .map(tag => String(tag).trim())
          .filter(Boolean),
      ),
    ),
    graphDescription:
      String(rawQuestion.graphDescription || '').trim() || null,
    graphUrl: null,
    hasImage: rawQuestion.visualSpec?.type !== 'none',
    visualSpec: rawQuestion.visualSpec || null,
  });
}

function createVisualOnlyRepairCandidate(sourceQuestion = {}, authoredQuestion = {}) {
  const questionType = inferQuestionType(sourceQuestion);
  const sourceOptions = Array.isArray(sourceQuestion.options)
    ? sourceQuestion.options.map(option => String(option))
    : [];
  const resolvedCorrectAnswerIndex =
    questionType === 'multiple-choice'
      ? resolveCorrectAnswerIndex(sourceQuestion)
      : -1;

  return stripUndefined({
    ...sourceQuestion,
    passage: sourceQuestion.passage || null,
    text: String(sourceQuestion.text || sourceQuestion.question || '').trim(),
    questionType,
    options: questionType === 'multiple-choice' ? sourceOptions : [],
    correctAnswer:
      questionType === 'multiple-choice'
        ? resolvedCorrectAnswerIndex
        : sourceQuestion.correctAnswer,
    acceptedAnswers:
      questionType === 'user-input' &&
      Array.isArray(sourceQuestion.acceptedAnswers)
        ? sourceQuestion.acceptedAnswers
        : [],
    graphDescription:
      String(authoredQuestion.graphDescription || '').trim() ||
      String(sourceQuestion.graphDescription || '').trim() ||
      null,
    graphUrl: null,
    hasImage: true,
    visualSpec: authoredQuestion.visualSpec || null,
  });
}

function createCanonicalKeyRepairCandidate(sourceQuestion = {}) {
  return stripUndefined({
    ...sourceQuestion,
    text: String(sourceQuestion.text || sourceQuestion.question || '').trim(),
    questionType: 'multiple-choice',
    options: Array.isArray(sourceQuestion.options)
      ? sourceQuestion.options.map(option => String(option))
      : [],
    correctAnswer: resolveCorrectAnswerIndex(sourceQuestion),
  });
}

async function runRepairGeneration({
  client,
  itemKind,
  sourceQuestion,
  moduleNumber,
  questionNumber,
  analysis,
  moduleProfile,
  vectorStoreId,
  model = getModel(),
  reasoningEffort = getReasoningEffort(),
  reasoningMode = getReasoningMode(),
}) {
  const queryQuestion = sourceQuestion || {
    difficulty: analysis?.repairSpecification?.targetDifficulty || 'medium',
    subcategory: analysis?.repairSpecification?.targetSkill || 'mixed',
  };
  const referenceExcerpts = requireReferenceEvidence(
    await retrieveReferenceExcerpts({
      client,
      vectorStoreId,
      query: getReferenceQuery(
        queryQuestion,
        moduleNumber,
        'original question authoring calibration',
      ),
    }),
  );
  const content = [
    {
      type: 'input_text',
      text: buildRepairPrompt({
        itemKind,
        sourceQuestion,
        moduleNumber,
        questionNumber,
        analysis,
        moduleProfile,
        referenceExcerpts,
      }),
    },
  ];

  if (sourceQuestion?.graphUrl) {
    content.push({
      type: 'input_image',
      image_url: sourceQuestion.graphUrl,
      detail: 'high',
    });
  }

  const response = await callStructuredResponse({
    client,
    schema: REPAIR_SCHEMA,
    schemaName: 'digital_sat_exam_question_repair',
    system:
      'You are a senior Digital SAT assessment author. Produce original, publication-grade content only. Follow the authorized audit repair specification and strict output schema.',
    userContent: content,
    model,
    reasoningEffort,
    reasoningMode,
  });
  const normalizedQuestion = normalizeRepairQuestion(
    response.parsed.question,
    sourceQuestion || {},
  );

  return {
    ...response,
    parsed: {
      ...response.parsed,
      question: normalizedQuestion,
    },
    referenceEvidence: referenceExcerpts.map(excerpt => ({
      fileId: excerpt.fileId,
      fileName: excerpt.fileName,
      score: excerpt.score,
      contentHash: createContentHash(excerpt.text),
    })),
    referenceEvidenceHash: createContentHash(referenceExcerpts),
  };
}

async function runIndependentVerification({
  client,
  question,
  moduleNumber,
  questionNumber,
  vectorStoreId,
  renderedVisualDataUrl,
  model = getModel(),
  reasoningEffort = getReasoningEffort(),
  reasoningMode = getReasoningMode(),
}) {
  const referenceExcerpts = requireReferenceEvidence(
    await retrieveReferenceExcerpts({
      client,
      vectorStoreId,
      query: getReferenceQuery(
        question,
        moduleNumber,
        'independent solver and publication review',
      ),
      limit: 6,
    }),
  );
  const content = [
    {
      type: 'input_text',
      text: buildVerificationPrompt({
        question,
        moduleNumber,
        questionNumber,
        referenceExcerpts,
      }),
    },
  ];

  const verificationImage =
    renderedVisualDataUrl || question.graphUrl || null;
  if (verificationImage) {
    content.push({
      type: 'input_image',
      image_url: verificationImage,
      detail: 'high',
    });
  }

  const response = await callStructuredResponse({
    client,
    schema: VERIFICATION_SCHEMA,
    schemaName: 'digital_sat_repair_independent_verification',
    system:
      'You are an independent Digital SAT solver and publication gate. The author key is hidden. Reject any ambiguity or quality shortfall and follow the strict output schema.',
    userContent: content,
    model,
    reasoningEffort,
    reasoningMode,
  });

  return {
    ...response,
    referenceEvidence: referenceExcerpts.map(excerpt => ({
      fileId: excerpt.fileId,
      fileName: excerpt.fileName,
      score: excerpt.score,
      contentHash: createContentHash(excerpt.text),
    })),
    referenceEvidenceHash: createContentHash(referenceExcerpts),
  };
}

async function runRepairEditorialReview({
  client,
  question,
  moduleNumber,
  questionNumber,
  vectorStoreId,
  blindVerification,
  renderedVisualDataUrl,
  model = getModel(),
  reasoningEffort = getReasoningEffort(),
  reasoningMode = getReasoningMode(),
}) {
  const deterministicQuestion =
    question.visualSpec?.type &&
    question.visualSpec.type !== 'none'
      ? {
          ...question,
          graphUrl:
            question.graphUrl || 'staged://verified-visual',
        }
      : question;
  const deterministic = inspectQuestionDeterministically(
    deterministicQuestion,
    { moduleNumber },
  );
  const referenceExcerpts = requireReferenceEvidence(
    await retrieveReferenceExcerpts({
      client,
      vectorStoreId,
      query: getReferenceQuery(
        question,
        moduleNumber,
        'final editorial explanation and publication review',
      ),
      limit: 6,
    }),
  );
  const content = [
    {
      type: 'input_text',
      text: `${buildAuditPrompt({
        question,
        moduleNumber,
        questionNumber,
        deterministicIssues: deterministic.issues,
        referenceExcerpts,
      })}

KEY-HIDDEN INDEPENDENT SOLVER RESULT
This result came from a separate call that did not receive the candidate key or
explanation. Reconcile it with the candidate. Verify every claim in the stored
explanation, every accepted student-produced response, and every visual value.
Any explanation error, unsupported shortcut, invalid accepted response, or
disagreement with the blind solution must produce needs_repair.
${JSON.stringify(blindVerification, null, 2)}`,
    },
  ];
  const image =
    renderedVisualDataUrl || question.graphUrl || null;
  if (image) {
    content.push({
      type: 'input_image',
      image_url: image,
      detail: 'high',
    });
  }

  const response = await callStructuredResponse({
    client,
    schema: AUDIT_SCHEMA,
    schemaName: 'digital_sat_repair_editorial_verification',
    system:
      'You are the final independent Digital SAT assessment editor. Validate the full candidate, including its key and explanation, against a separate blind solution. Never repair content in this call.',
    userContent: content,
    model,
    reasoningEffort,
    reasoningMode,
  });
  const merged = mergeBlindVerificationIntoAudit(
    response.parsed,
    blindVerification,
    question,
  );

  return {
    ...response,
    parsed: merged.audit,
    comparison: merged.comparison,
    referenceEvidence: referenceExcerpts.map(excerpt => ({
      fileId: excerpt.fileId,
      fileName: excerpt.fileName,
      score: excerpt.score,
      contentHash: createContentHash(excerpt.text),
    })),
    referenceEvidenceHash: createContentHash(referenceExcerpts),
  };
}

function normalizeAnswerValue(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

function greatestCommonDivisor(left, right) {
  let a = left < 0n ? -left : left;
  let b = right < 0n ? -right : right;
  while (b !== 0n) {
    const remainder = a % b;
    a = b;
    b = remainder;
  }
  return a || 1n;
}

function normalizeRational(numerator, denominator) {
  if (denominator === 0n) return null;
  const sign = denominator < 0n ? -1n : 1n;
  const signedNumerator = numerator * sign;
  const positiveDenominator = denominator * sign;
  const divisor = greatestCommonDivisor(
    signedNumerator,
    positiveDenominator,
  );
  return {
    numerator: signedNumerator / divisor,
    denominator: positiveDenominator / divisor,
  };
}

function parseDecimalRational(value) {
  const match = String(value).match(
    /^([+-]?)(?:(\d+)(?:\.(\d*))?|\.(\d+))(?:e([+-]?\d+))?$/i,
  );
  if (!match) return null;
  const sign = match[1] === '-' ? -1n : 1n;
  const integerPart = match[2] || '0';
  const fractionalPart =
    match[3] !== undefined ? match[3] : match[4] || '';
  const exponent = Number(match[5] || 0);
  if (
    !Number.isSafeInteger(exponent) ||
    Math.abs(exponent) > 100 ||
    integerPart.length + fractionalPart.length > 120
  ) {
    return null;
  }

  let numerator =
    sign * BigInt(`${integerPart}${fractionalPart}` || '0');
  let denominator = 10n ** BigInt(fractionalPart.length);
  if (exponent > 0) {
    numerator *= 10n ** BigInt(exponent);
  } else if (exponent < 0) {
    denominator *= 10n ** BigInt(-exponent);
  }
  return normalizeRational(numerator, denominator);
}

function parseRationalAnswer(value) {
  const normalized = normalizeAnswerValue(value)
    .replace(/[\u2212\u2013\u2014]/g, '-')
    .replace(/,/g, '');
  if (!normalized || normalized.length > 240) return null;

  const slashIndex = normalized.indexOf('/');
  if (slashIndex >= 0) {
    if (
      slashIndex !== normalized.lastIndexOf('/') ||
      slashIndex === 0 ||
      slashIndex === normalized.length - 1
    ) {
      return null;
    }
    const numerator = parseDecimalRational(
      normalized.slice(0, slashIndex).trim(),
    );
    const denominator = parseDecimalRational(
      normalized.slice(slashIndex + 1).trim(),
    );
    if (
      !numerator ||
      !denominator ||
      denominator.numerator === 0n
    ) {
      return null;
    }
    return normalizeRational(
      numerator.numerator * denominator.denominator,
      numerator.denominator * denominator.numerator,
    );
  }

  return parseDecimalRational(normalized);
}

function parseNumericAnswer(value) {
  const rational = parseRationalAnswer(value);
  return rational
    ? Number(rational.numerator) / Number(rational.denominator)
    : null;
}

function answersEquivalent(left, right) {
  if (normalizeAnswerValue(left) === normalizeAnswerValue(right)) {
    return true;
  }

  const leftRational = parseRationalAnswer(left);
  const rightRational = parseRationalAnswer(right);
  if (!leftRational || !rightRational) return false;
  return (
    leftRational.numerator * rightRational.denominator ===
    rightRational.numerator * leftRational.denominator
  );
}

function hasTerminatingDecimal(rational) {
  let denominator = rational.denominator;
  while (denominator % 2n === 0n) denominator /= 2n;
  while (denominator % 5n === 0n) denominator /= 5n;
  return denominator === 1n;
}

function formatScaledDecimal(scaledValue, decimalPlaces, negative) {
  const digits = scaledValue
    .toString()
    .padStart(decimalPlaces + 1, '0');
  const integerPart =
    digits.slice(0, -decimalPlaces) || '0';
  const fractionalPart = digits.slice(-decimalPlaces);
  const decimal =
    integerPart === '0'
      ? `.${fractionalPart}`
      : `${integerPart}.${fractionalPart}`;
  return `${negative ? '-' : ''}${decimal}`;
}

function getOfficialApproximationForms(exactValue) {
  const rational = parseRationalAnswer(exactValue);
  if (!rational || hasTerminatingDecimal(rational)) {
    return new Set();
  }

  const negative = rational.numerator < 0n;
  const absoluteNumerator = negative
    ? -rational.numerator
    : rational.numerator;
  const integerPart =
    absoluteNumerator / rational.denominator;
  const maximumLength = negative ? 6 : 5;
  const signLength = negative ? 1 : 0;
  const integerLength =
    integerPart === 0n
      ? 0
      : integerPart.toString().length;
  const decimalPlaces =
    maximumLength - signLength - integerLength - 1;
  if (decimalPlaces <= 0) return new Set();

  const createForms = places => {
    const scale = 10n ** BigInt(places);
    const scaledNumerator = absoluteNumerator * scale;
    const truncated =
      scaledNumerator / rational.denominator;
    const remainder =
      scaledNumerator % rational.denominator;
    const rounded =
      truncated +
      (
        remainder * 2n >= rational.denominator
          ? 1n
          : 0n
      );
    return [truncated, rounded]
      .map(value =>
        formatScaledDecimal(value, places, negative),
      )
      .filter(value => value.length <= maximumLength);
  };

  return new Set(createForms(decimalPlaces));
}

function isSatAnswerEquivalent(response, exactValue) {
  if (answersEquivalent(response, exactValue)) return true;
  return getOfficialApproximationForms(exactValue).has(
    normalizeAnswerValue(response),
  );
}

function addVerifiedStudentResponseForms(question, exactValue) {
  if (inferQuestionType(question) !== 'user-input') {
    return question;
  }
  const existing = [
    question.correctAnswer,
    ...(Array.isArray(question.acceptedAnswers)
      ? question.acceptedAnswers
      : []),
  ].filter(
    answer =>
      answer !== undefined &&
      answer !== null &&
      String(answer).trim(),
  );
  const officialForms = Array.from(
    getOfficialApproximationForms(exactValue),
  );
  return {
    ...question,
    acceptedAnswers: Array.from(
      new Set([...existing, ...officialForms].map(String)),
    ),
  };
}

function isValidSatStudentResponse(value) {
  const text = String(value ?? '').trim();
  const maximumLength = text.startsWith('-') ? 6 : 5;
  return (
    text.length > 0 &&
    text.length <= maximumLength &&
    /^-?(?:\d+\/\d+|\d+(?:\.\d*)?|\.\d+)$/.test(text) &&
    parseRationalAnswer(text) !== null
  );
}

function verifyCandidateForApplication(
  question,
  verification,
  {
    moduleNumber,
    editorialReview,
    repairSpecification,
  } = {},
) {
  const deterministicQuestion =
    question.visualSpec?.type && question.visualSpec.type !== 'none'
      ? { ...question, graphUrl: question.graphUrl || 'staged://verified-visual' }
      : question;
  const deterministic = inspectQuestionDeterministically(
    deterministicQuestion,
    {
      moduleNumber,
    },
  );
  const blockers = deterministic.issues
    .filter(issue => SEVERITY_RANK[issue.severity] >= SEVERITY_RANK.high)
    .map(issue => issue.message);
  const questionType = inferQuestionType(question);
  const canonicalSubcategory = resolveSubcategory(
    question.subcategory ||
      question.subCategory ||
      question.subcategoryId,
  );
  const expectedSection =
    Number(moduleNumber) <= 2 ? 'Reading and Writing' : 'Math';

  if (!canonicalSubcategory) {
    blockers.push(
      'The generated subcategory does not resolve to the canonical SAT taxonomy.',
    );
  } else if (canonicalSubcategory.section !== expectedSection) {
    blockers.push(
      `The generated subcategory belongs to ${canonicalSubcategory.section}, not ${expectedSection}.`,
    );
  }
  const targetSubcategory = resolveSubcategory(
    repairSpecification?.targetSkill,
  );
  if (
    targetSubcategory &&
    canonicalSubcategory &&
    targetSubcategory.id !== canonicalSubcategory.id
  ) {
    blockers.push(
      `The generated subcategory does not match the approved target skill ${targetSubcategory.kebab}.`,
    );
  }
  const targetDifficulty = String(
    repairSpecification?.targetDifficulty || '',
  ).toLowerCase();
  if (
    ['easy', 'medium', 'hard'].includes(targetDifficulty) &&
    normalizeDifficulty(question.difficulty) !== targetDifficulty
  ) {
    blockers.push(
      `The generated difficulty does not match the approved ${targetDifficulty} target.`,
    );
  }

  if (!verification.acceptable) {
    blockers.push('Independent verifier did not mark the candidate acceptable.');
  }
  if (!verification.singleCorrectAnswer) {
    blockers.push('Independent verifier did not find one determinate answer.');
  }
  if (!verification.contentAccurate) {
    blockers.push('Independent verifier found a content-accuracy issue.');
  }
  if (verification.officialStyleScore < 90) {
    blockers.push('Official-style score is below the 90-point publication gate.');
  }
  if (verification.stemQualityScore < 90) {
    blockers.push('Stem-quality score is below the 90-point publication gate.');
  }
  if (
    questionType === 'multiple-choice' &&
    verification.distractorQualityScore < 85
  ) {
    blockers.push('Distractor-quality score is below the 85-point publication gate.');
  }
  if (verification.difficultyCalibrationScore < 80) {
    blockers.push('Difficulty calibration is below the 80-point publication gate.');
  }

  if (questionType === 'multiple-choice') {
    if (
      Number(verification.solvedAnswerIndex) !==
      Number(question.correctAnswer)
    ) {
      blockers.push('Independent solution does not match the candidate answer key.');
    }
  } else {
    const accepted = [
      question.correctAnswer,
      ...(Array.isArray(question.acceptedAnswers)
        ? question.acceptedAnswers
        : []),
    ];
    if (
      !accepted.some(answer =>
        isSatAnswerEquivalent(
          answer,
          verification.solvedAnswerValue,
        ),
      )
    ) {
      blockers.push('Independent solution is not present in the accepted answers.');
    }
    if (
      accepted.some(
        answer => !isValidSatStudentResponse(answer),
      )
    ) {
      blockers.push(
        'One or more accepted responses violate Digital SAT response-entry rules.',
      );
    }
    if (
      accepted.some(
        answer =>
          !isSatAnswerEquivalent(
            answer,
            verification.solvedAnswerValue,
          ),
      )
    ) {
      blockers.push(
        'One or more accepted responses are not equivalent to the independently solved answer.',
      );
    }
  }

  if (question.visualSpec?.type !== 'none') {
    if (!verification.visualMatchesQuestion) {
      blockers.push('Independent verifier found that the visual does not match the question.');
    }
    if (!verification.graphSpecSufficient) {
      blockers.push('The visual specification is insufficient to render the required graph.');
    }
  }

  if (Array.isArray(verification.criticalIssues)) {
    blockers.push(
      ...verification.criticalIssues
        .map(issue => String(issue || '').trim())
        .filter(Boolean),
    );
  }

  if (!editorialReview) {
    blockers.push('The candidate has no independent full editorial review.');
  } else {
    if (editorialReview.outcome !== 'pass') {
      blockers.push(
        'The independent full editorial review did not mark the candidate publication-ready.',
      );
    }
    if (
      !editorialReview.answerValidation?.singleCorrectAnswer ||
      !editorialReview.answerValidation?.matchesStoredKey
    ) {
      blockers.push(
        'The full editorial review did not confirm the candidate answer key.',
      );
    }
    if (editorialReview.confidence !== 'high') {
      blockers.push(
        'The full editorial review confidence is below the required high level.',
      );
    }
    if (
      Number(editorialReview.scores?.contentAccuracy || 0) < 95 ||
      Number(editorialReview.scores?.answerDeterminacy || 0) < 95 ||
      Number(editorialReview.scores?.officialStyle || 0) < 90 ||
      Number(editorialReview.scores?.stemQuality || 0) < 90 ||
      Number(editorialReview.scores?.visualIntegrity || 0) < 90 ||
      (
        questionType === 'multiple-choice' &&
        Number(editorialReview.scores?.distractorQuality || 0) < 85
      )
    ) {
      blockers.push(
        'The full editorial review missed one or more publication score gates.',
      );
    }
    const editorialBlockingIssues = (
      editorialReview.issues || []
    ).filter(issue =>
      ['high', 'critical'].includes(issue.severity),
    );
    if (editorialBlockingIssues.length) {
      blockers.push(
        ...editorialBlockingIssues.map(
          issue =>
            `Editorial review: ${issue.evidence || issue.code}`,
        ),
      );
    }
  }

  return {
    eligible: blockers.length === 0,
    blockers: Array.from(new Set(blockers)),
    deterministic,
  };
}

function escapeXml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function renderTableSvg(spec) {
  const headers = spec.tableHeaders || [];
  const rows = spec.tableRows || [];
  if (!headers.length || !rows.length) {
    throw new Error('Table visual requires headers and rows');
  }
  if (rows.some(row => row.length !== headers.length)) {
    throw new Error('Every table row must match the header count');
  }

  const width = 900;
  const columnWidth = width / headers.length;
  const rowHeight = 52;
  const titleHeight = spec.title ? 70 : 30;
  const height = titleHeight + rowHeight * (rows.length + 1) + 30;
  const cells = [];

  if (spec.title) {
    cells.push(
      `<text x="${width / 2}" y="38" text-anchor="middle" class="title">${escapeXml(spec.title)}</text>`,
    );
  }

  headers.forEach((header, columnIndex) => {
    const x = columnIndex * columnWidth;
    cells.push(
      `<rect x="${x}" y="${titleHeight}" width="${columnWidth}" height="${rowHeight}" class="header"/>`,
      `<text x="${x + columnWidth / 2}" y="${titleHeight + 33}" text-anchor="middle" class="header-text">${escapeXml(header)}</text>`,
    );
  });

  rows.forEach((row, rowIndex) => {
    row.forEach((cell, columnIndex) => {
      const x = columnIndex * columnWidth;
      const y = titleHeight + rowHeight * (rowIndex + 1);
      cells.push(
        `<rect x="${x}" y="${y}" width="${columnWidth}" height="${rowHeight}" class="${rowIndex % 2 ? 'cell alt' : 'cell'}"/>`,
        `<text x="${x + columnWidth / 2}" y="${y + 33}" text-anchor="middle" class="cell-text">${escapeXml(cell)}</text>`,
      );
    });
  });

  return { width, height, body: cells.join('') };
}

function getNumericDomain(values, { includeZero = false } = {}) {
  const finite = values.filter(Number.isFinite);
  if (!finite.length) return { min: 0, max: 1 };
  let min = includeZero
    ? Math.min(0, ...finite)
    : Math.min(...finite);
  let max = includeZero
    ? Math.max(0, ...finite)
    : Math.max(...finite);
  if (min === max) {
    min -= 1;
    max += 1;
  }
  const padding = (max - min) * 0.08;
  return { min: min - padding, max: max + padding };
}

function getSeriesXValues(item, spec) {
  if (Array.isArray(item.xValues) && item.xValues.length) {
    return item.xValues;
  }
  if (Array.isArray(spec.xValues) && spec.xValues.length) {
    return spec.xValues;
  }
  return (item.values || []).map((_, index) => index + 1);
}

function getExplicitDomain(spec, axis) {
  const min = Number(spec[`${axis}Min`]);
  const max = Number(spec[`${axis}Max`]);
  return Number.isFinite(min) && Number.isFinite(max) && max > min
    ? { min, max }
    : null;
}

function expandDomainsForEqualScale(xDomain, yDomain, plotWidth, plotHeight) {
  const xRange = xDomain.max - xDomain.min;
  const yRange = yDomain.max - yDomain.min;
  const unitsPerPixel = Math.max(xRange / plotWidth, yRange / plotHeight);
  const targetXRange = unitsPerPixel * plotWidth;
  const targetYRange = unitsPerPixel * plotHeight;
  const xCenter = (xDomain.min + xDomain.max) / 2;
  const yCenter = (yDomain.min + yDomain.max) / 2;

  return {
    xDomain: {
      min: xCenter - targetXRange / 2,
      max: xCenter + targetXRange / 2,
    },
    yDomain: {
      min: yCenter - targetYRange / 2,
      max: yCenter + targetYRange / 2,
    },
  };
}

function formatTick(value) {
  const rounded = Number(value.toFixed(4));
  return Object.is(rounded, -0) ? '0' : String(rounded);
}

function renderChartSvg(spec) {
  const width = 900;
  const height = 660;
  const plot = { left: 100, top: 105, right: 835, bottom: 555 };
  const plotWidth = plot.right - plot.left;
  const plotHeight = plot.bottom - plot.top;
  const palette = ['#0f5f73', '#c65f10', '#6d4bb3', '#2f855a'];
  const series = Array.isArray(spec.series) ? spec.series : [];
  const shapes = Array.isArray(spec.shapes) ? spec.shapes : [];
  const annotations = Array.isArray(spec.annotations)
    ? spec.annotations
    : [];
  const isCategorical =
    spec.type === 'bar' || spec.type === 'histogram';
  const isGeometry = spec.type === 'geometry';

  if (!series.length && !shapes.length) {
    throw new Error('Visual requires at least one data series or shape');
  }

  if (isCategorical) {
    const categories = Array.isArray(spec.categories)
      ? spec.categories
      : [];
    if (!categories.length || !series.length) {
      throw new Error('Bar and histogram visuals require categories and series');
    }
    if (series.some(item => item.values.length !== categories.length)) {
      throw new Error('Bar series lengths must match category count');
    }
  }

  const allX = [];
  const allY = [];
  series.forEach(item => {
    const xValues = getSeriesXValues(item, spec);
    if (!isCategorical && xValues.length !== item.values.length) {
      throw new Error('Every plotted series must have one x value per y value');
    }
    if (!isCategorical) allX.push(...xValues);
    allY.push(...(item.values || []));
  });
  shapes.forEach(shape => {
    (shape.points || []).forEach(point => {
      allX.push(point.x);
      allY.push(point.y);
    });
    if (shape.type === 'circle') {
      allX.push(shape.centerX - shape.radius, shape.centerX + shape.radius);
      allY.push(shape.centerY - shape.radius, shape.centerY + shape.radius);
    }
  });
  annotations.forEach(annotation => {
    allX.push(annotation.x);
    allY.push(annotation.y);
  });

  let xDomain =
    getExplicitDomain(spec, 'x') ||
    getNumericDomain(allX, {
      includeZero: spec.type === 'coordinate-plane',
    });
  let yDomain =
    getExplicitDomain(spec, 'y') ||
    getNumericDomain(allY, {
      includeZero:
        isCategorical || spec.type === 'coordinate-plane',
    });

  if (spec.equalScale) {
    ({ xDomain, yDomain } = expandDomainsForEqualScale(
      xDomain,
      yDomain,
      plotWidth,
      plotHeight,
    ));
  }

  const xScale = value =>
    plot.left +
    ((value - xDomain.min) / (xDomain.max - xDomain.min)) *
      plotWidth;
  const yScale = value =>
    plot.bottom -
    ((value - yDomain.min) / (yDomain.max - yDomain.min)) *
      plotHeight;
  const parts = [];

  if (spec.title) {
    parts.push(
      `<text x="${width / 2}" y="38" text-anchor="middle" class="title">${escapeXml(spec.title)}</text>`,
    );
  }

  if (!isGeometry) {
    for (let tick = 0; tick <= 5; tick += 1) {
      const yValue =
        yDomain.min + ((yDomain.max - yDomain.min) * tick) / 5;
      const y = yScale(yValue);
      if (spec.showGrid !== false) {
        parts.push(
          `<line x1="${plot.left}" y1="${y}" x2="${plot.right}" y2="${y}" class="grid"/>`,
        );
      }
      parts.push(
        `<text x="${plot.left - 12}" y="${y + 5}" text-anchor="end" class="tick">${escapeXml(formatTick(yValue))}</text>`,
      );
    }

    if (!isCategorical) {
      for (let tick = 0; tick <= 5; tick += 1) {
        const xValue =
          xDomain.min + ((xDomain.max - xDomain.min) * tick) / 5;
        const x = xScale(xValue);
        if (spec.showGrid !== false) {
          parts.push(
            `<line x1="${x}" y1="${plot.top}" x2="${x}" y2="${plot.bottom}" class="grid"/>`,
          );
        }
        parts.push(
          `<text x="${x}" y="${plot.bottom + 27}" text-anchor="middle" class="tick">${escapeXml(formatTick(xValue))}</text>`,
        );
      }
    }

    const verticalAxisX =
      xDomain.min <= 0 && xDomain.max >= 0
        ? xScale(0)
        : plot.left;
    const horizontalAxisY =
      yDomain.min <= 0 && yDomain.max >= 0
        ? yScale(0)
        : plot.bottom;
    parts.push(
      `<line x1="${verticalAxisX}" y1="${plot.top}" x2="${verticalAxisX}" y2="${plot.bottom}" class="axis"/>`,
      `<line x1="${plot.left}" y1="${horizontalAxisY}" x2="${plot.right}" y2="${horizontalAxisY}" class="axis"/>`,
    );
  }

  if (isCategorical) {
    const categories = spec.categories;
    const groupWidth = plotWidth / categories.length;
    const histogramFactor = spec.type === 'histogram' ? 0.98 : 0.76;
    const barWidth = Math.max(
      8,
      Math.min(
        78,
        (groupWidth * histogramFactor) / Math.max(1, series.length),
      ),
    );

    categories.forEach((category, categoryIndex) => {
      const groupCenter =
        plot.left + groupWidth * (categoryIndex + 0.5);
      parts.push(
        `<text x="${groupCenter}" y="${plot.bottom + 27}" text-anchor="middle" class="tick">${escapeXml(category)}</text>`,
      );
      series.forEach((item, seriesIndex) => {
        const value = item.values[categoryIndex];
        const baseline = yScale(0);
        const valueY = yScale(value);
        const x =
          groupCenter -
          (barWidth * series.length) / 2 +
          seriesIndex * barWidth;
        const gap = spec.type === 'histogram' ? 0 : 4;
        parts.push(
          `<rect x="${x}" y="${Math.min(baseline, valueY)}" width="${Math.max(1, barWidth - gap)}" height="${Math.max(1, Math.abs(baseline - valueY))}" fill="${palette[seriesIndex % palette.length]}" class="data-mark"/>`,
        );
      });
    });
  } else {
    series.forEach((item, seriesIndex) => {
      const xValues = getSeriesXValues(item, spec);
      const points = item.values.map((value, index) => ({
        x: xScale(xValues[index]),
        y: yScale(value),
      }));
      const renderAs =
        item.renderAs ||
        (spec.type === 'scatter' ? 'scatter' : 'line');
      const color = palette[seriesIndex % palette.length];

      if (renderAs === 'line' && points.length >= 2) {
        parts.push(
          `<polyline points="${points
            .map(point => `${point.x},${point.y}`)
            .join(' ')}" fill="none" stroke="${color}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>`,
        );
      }
      if (item.showPoints || renderAs === 'scatter') {
        points.forEach(point => {
          parts.push(
            `<circle cx="${point.x}" cy="${point.y}" r="5" fill="${color}" stroke="#ffffff" stroke-width="1.5" class="data-mark"/>`,
          );
        });
      }
    });
  }

  shapes.forEach((shape, shapeIndex) => {
    const color = palette[shapeIndex % palette.length];
    const dash = shape.dashed ? ' stroke-dasharray="9 7"' : '';
    const points = (shape.points || []).map(point => ({
      x: xScale(point.x),
      y: yScale(point.y),
    }));

    if (shape.type === 'circle') {
      if (!(Number(shape.radius) > 0)) {
        throw new Error('Circle shapes require a positive radius');
      }
      const radiusX = Math.abs(
        xScale(shape.centerX + shape.radius) - xScale(shape.centerX),
      );
      const radiusY = Math.abs(
        yScale(shape.centerY + shape.radius) - yScale(shape.centerY),
      );
      parts.push(
        `<ellipse cx="${xScale(shape.centerX)}" cy="${yScale(shape.centerY)}" rx="${radiusX}" ry="${radiusY}" fill="${shape.fill ? '#e8f1f4' : 'none'}" stroke="${color}" stroke-width="3"${dash}/>`,
      );
    } else {
      const minimumPointCount =
        shape.type === 'polygon' ? 3 : 2;
      if (points.length < minimumPointCount) {
        throw new Error(
          `${shape.type} shapes require at least ${minimumPointCount} points`,
        );
      }
      const tag = shape.type === 'line' ? 'polyline' : shape.type;
      const pointText = points
        .map(point => `${point.x},${point.y}`)
        .join(' ');
      parts.push(
        `<${tag} points="${pointText}" fill="${shape.fill ? '#e8f1f4' : 'none'}" stroke="${color}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"${dash}/>`,
      );
    }

    if (shape.label) {
      const labelPoint =
        shape.type === 'circle'
          ? {
              x: xScale(shape.centerX),
              y: yScale(shape.centerY) - 10,
            }
          : points[0];
      if (labelPoint) {
        parts.push(
          `<text x="${labelPoint.x}" y="${labelPoint.y}" text-anchor="middle" class="annotation">${escapeXml(shape.label)}</text>`,
        );
      }
    }
  });

  const annotationOffsets = {
    above: { x: 0, y: -12, anchor: 'middle' },
    below: { x: 0, y: 22, anchor: 'middle' },
    left: { x: -12, y: 5, anchor: 'end' },
    right: { x: 12, y: 5, anchor: 'start' },
  };
  annotations.forEach(annotation => {
    const offset =
      annotationOffsets[annotation.position] ||
      annotationOffsets.above;
    const x = xScale(annotation.x);
    const y = yScale(annotation.y);
    parts.push(
      `<circle cx="${x}" cy="${y}" r="4" class="annotation-point"/>`,
      `<text x="${x + offset.x}" y="${y + offset.y}" text-anchor="${offset.anchor}" class="annotation">${escapeXml(annotation.label)}</text>`,
    );
  });

  if (!isGeometry) {
    if (spec.xLabel) {
      parts.push(
        `<text x="${(plot.left + plot.right) / 2}" y="${height - 28}" text-anchor="middle" class="label">${escapeXml(spec.xLabel)}</text>`,
      );
    }
    if (spec.yLabel) {
      parts.push(
        `<text x="24" y="${(plot.top + plot.bottom) / 2}" text-anchor="middle" transform="rotate(-90 24 ${(plot.top + plot.bottom) / 2})" class="label">${escapeXml(spec.yLabel)}</text>`,
      );
    }
  }

  const namedSeries = series.filter(item => item.name);
  if (namedSeries.length > 1) {
    namedSeries.forEach((item, index) => {
      const x = plot.left + index * 190;
      parts.push(
        `<rect x="${x}" y="66" width="16" height="16" fill="${palette[index % palette.length]}"/>`,
        `<text x="${x + 23}" y="79" class="tick">${escapeXml(item.name)}</text>`,
      );
    });
  }

  return { width, height, body: parts.join('') };
}

function renderVisualSpecToSvg(spec = {}) {
  if (!spec || spec.type === 'none') return null;
  const rendered =
    spec.type === 'table'
      ? renderTableSvg(spec)
      : renderChartSvg(spec);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${rendered.width}" height="${rendered.height}" viewBox="0 0 ${rendered.width} ${rendered.height}" role="img" aria-label="${escapeXml(spec.accessibilityText)}">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <style>
    text { font-family: Arial, Helvetica, sans-serif; fill: #17202a; }
    .title { font-size: 24px; font-weight: 700; }
    .label { font-size: 17px; font-weight: 600; }
    .tick { font-size: 14px; }
    .axis { stroke: #17202a; stroke-width: 2; }
    .grid { stroke: #d9e2e8; stroke-width: 1; }
    .data-mark { stroke: #17202a; stroke-width: 0.5; }
    .annotation { font-size: 15px; font-weight: 600; }
    .annotation-point { fill: #17202a; }
    .header { fill: #153f52; stroke: #17202a; stroke-width: 1; }
    .header-text { fill: #ffffff; font-size: 15px; font-weight: 700; }
    .cell { fill: #ffffff; stroke: #596a73; stroke-width: 1; }
    .cell.alt { fill: #eef4f6; }
    .cell-text { font-size: 15px; }
  </style>
  ${rendered.body}
</svg>`;
}

function summarizeRunItems(items = []) {
  const summary = {
    total: items.length,
    passed: 0,
    needsRepair: 0,
    manualReview: 0,
    failed: 0,
    repaired: 0,
    repairReady: 0,
    repairBlocked: 0,
    rolledBack: 0,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    info: 0,
    publishReady: false,
  };

  items.forEach(item => {
    if (item.status === 'passed') summary.passed += 1;
    if (item.status === 'needs_repair') summary.needsRepair += 1;
    if (item.status === 'manual_review') summary.manualReview += 1;
    if (item.status === 'failed') summary.failed += 1;
    if (item.status === 'repaired') summary.repaired += 1;
    if (item.status === 'repair_ready') summary.repairReady += 1;
    if (item.status === 'repair_blocked') summary.repairBlocked += 1;
    if (item.status === 'rolled_back') summary.rolledBack += 1;
    if (Object.prototype.hasOwnProperty.call(summary, item.severity)) {
      summary[item.severity] += 1;
    }
  });

  const safeTerminalStatuses = new Set([
    'passed',
    'repaired',
    'accepted_after_review',
  ]);
  summary.publishReady =
    summary.total > 0 &&
    items.every(item => safeTerminalStatuses.has(item.status));

  return summary;
}

module.exports = {
  AUDIT_SCHEMA,
  EXPECTED_QUESTION_COUNTS,
  POLICY_VERSION,
  PROMPT_VERSION,
  REPAIR_SCHEMA,
  SEVERITY_RANK,
  VERIFICATION_SCHEMA,
  VISUAL_SPEC_SCHEMA,
  buildAuditPrompt,
  buildRepairPrompt,
  buildVerificationPrompt,
  answersEquivalent,
  addVerifiedStudentResponseForms,
  callStructuredResponse,
  createCanonicalKeyRepairCandidate,
  createVisualOnlyRepairCandidate,
  createContentHash,
  createOpenAIClient,
  compareBlindAnswerToStoredKey,
  getExpectedQuestionCount,
  getModel,
  getReasoningEffort,
  getReasoningMode,
  highestSeverity,
  inferQuestionType,
  isSatAnswerEquivalent,
  isValidSatStudentResponse,
  inspectModuleStructure,
  inspectQuestionDeterministically,
  normalizeRepairQuestion,
  mergeBlindVerificationIntoAudit,
  renderVisualSpecToSvg,
  requireReferenceEvidence,
  resolveCorrectAnswerIndex,
  retrieveReferenceExcerpts,
  runIndependentVerification,
  runQuestionAudit,
  runRepairEditorialReview,
  runRepairGeneration,
  sanitizeQuestionForPrompt,
  stableStringify,
  stripUndefined,
  summarizeRunItems,
  verifyCandidateForApplication,
};
