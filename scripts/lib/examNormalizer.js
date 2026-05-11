/**
 * Stage 3: Normalize extracted + validated data to match the Firestore schema.
 *
 * Pure code — no LLM calls. Deterministic and fast.
 */

const { resolveSubcategory, SUBCATEGORIES } = require('./subcategoryMap');

/**
 * Module metadata by module number.
 */
const MODULE_DEFAULTS = {
  1: { section: 'Reading and Writing', calculatorAllowed: false, timeLimit: 1920, expectedQuestions: 27 },
  2: { section: 'Reading and Writing', calculatorAllowed: false, timeLimit: 1920, expectedQuestions: 27 },
  3: { section: 'Math',               calculatorAllowed: false, timeLimit: 2100, expectedQuestions: 22 },
  4: { section: 'Math',               calculatorAllowed: true,  timeLimit: 2100, expectedQuestions: 22 },
};

/**
 * Normalize a single question into the Firestore schema.
 *
 * @param {object} rawQuestion - A question from the extracted JSON.
 * @param {number} moduleNumber - The module this question belongs to.
 * @param {string} examSlug - Slug for the source exam (e.g., "official-sat-aug-2024").
 * @returns {{ question: object, warnings: string[] }}
 */
function normalizeQuestion(rawQuestion, moduleNumber, examSlug) {
  const warnings = [];
  const moduleMeta = MODULE_DEFAULTS[moduleNumber] || MODULE_DEFAULTS[1];

  // === Subcategory resolution ===
  let subcategoryEntry = resolveSubcategory(rawQuestion.subcategory);
  let subcategoryKebab = null;
  let subcategoryId = null;
  let subcategoryDisplay = rawQuestion.subcategory || '';
  let mainCategory = '';
  let subjectArea = moduleMeta.section;
  let categoryPath = '';

  if (subcategoryEntry) {
    subcategoryKebab = subcategoryEntry.kebab;
    subcategoryId = subcategoryEntry.id;
    subcategoryDisplay = subcategoryEntry.name;
    mainCategory = subcategoryEntry.mainCategory;
    subjectArea = subcategoryEntry.section;
    categoryPath = `${subjectArea}/${mainCategory}/${subcategoryDisplay}`;
  } else {
    warnings.push(`Could not resolve subcategory "${rawQuestion.subcategory}" — using raw value`);
    // Fallback: convert to kebab-case
    subcategoryKebab = String(rawQuestion.subcategory || 'unknown')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  // === Question type ===
  let questionType = rawQuestion.questionType || 'multiple-choice';
  if (questionType !== 'multiple-choice' && questionType !== 'user-input') {
    warnings.push(`Unknown questionType "${questionType}" — defaulting to multiple-choice`);
    questionType = 'multiple-choice';
  }

  // Auto-detect user-input if no options
  if (!Array.isArray(rawQuestion.options) || rawQuestion.options.length === 0) {
    if (questionType === 'multiple-choice') {
      questionType = 'user-input';
    }
  }

  // === Options cleanup ===
  let options = [];
  if (questionType === 'multiple-choice') {
    const rawOpts = Array.isArray(rawQuestion.options) ? rawQuestion.options : [];
    options = rawOpts.map(opt => {
      if (typeof opt !== 'string') return String(opt);
      return opt.trim();
    });

    if (options.length < 2) {
      warnings.push(`Only ${options.length} options found — expected 4`);
    }
  }

  // === Correct answer ===
  let correctAnswer = rawQuestion.correctAnswer;

  if (questionType === 'multiple-choice' && correctAnswer) {
    // Ensure correctAnswer matches one of the options exactly
    const exactMatch = options.find(opt => opt === correctAnswer);
    if (!exactMatch) {
      // Try matching by letter prefix (e.g., "B" → "B) ...")
      const letterMatch = String(correctAnswer).match(/^([A-D])/i);
      if (letterMatch) {
        const letter = letterMatch[1].toUpperCase();
        const idx = letter.charCodeAt(0) - 65;
        if (idx >= 0 && idx < options.length) {
          correctAnswer = options[idx];
        } else {
          warnings.push(`correctAnswer "${rawQuestion.correctAnswer}" doesn't match any option`);
        }
      } else {
        // Try fuzzy matching
        const fuzzy = options.find(opt => opt.toLowerCase().includes(String(correctAnswer).toLowerCase()));
        if (fuzzy) {
          correctAnswer = fuzzy;
        } else {
          warnings.push(`correctAnswer "${rawQuestion.correctAnswer}" doesn't match any option`);
        }
      }
    }
  }

  // === Accepted answers (user-input) ===
  let acceptedAnswers = null;
  if (questionType === 'user-input') {
    acceptedAnswers = rawQuestion.acceptedAnswers || [];
    if (correctAnswer && !acceptedAnswers.includes(String(correctAnswer))) {
      acceptedAnswers = [String(correctAnswer), ...acceptedAnswers];
    }
    // Convert correctAnswer to string for user-input
    correctAnswer = String(correctAnswer);
  }

  // === Input type detection for user-input ===
  let inputType = 'number';
  if (questionType === 'user-input' && correctAnswer) {
    const ansStr = String(correctAnswer);
    if (ansStr.includes('/')) {
      inputType = 'fraction';
    } else if (isNaN(parseFloat(ansStr))) {
      inputType = 'text';
    }
  }

  // === Passage ===
  const passage = rawQuestion.passage?.trim() || null;

  // === Image / graph ===
  const hasImage = rawQuestion.hasImage === true;
  let graphDescription = null;
  if (hasImage && rawQuestion.imageDescription) {
    graphDescription = rawQuestion.imageDescription.trim();
  }

  // === Difficulty ===
  let difficulty = 'medium';
  if (rawQuestion.difficulty) {
    const d = String(rawQuestion.difficulty).toLowerCase().trim();
    if (['easy', 'medium', 'hard'].includes(d)) {
      difficulty = d;
    }
  }

  // === Build normalized question ===
  const normalized = {
    text: (rawQuestion.text || '').trim(),
    questionType,
    options,
    correctAnswer,
    acceptedAnswers,
    inputType: questionType === 'user-input' ? inputType : 'number',
    answerFormat: null,
    explanation: '', // Official exams don't include explanations
    difficulty,
    subcategory: subcategoryKebab,
    subCategory: subcategoryKebab, // backward compatibility
    subcategoryId,
    categoryPath: categoryPath || null,
    mainCategory: mainCategory || null,
    subjectArea: subjectArea || null,
    source: 'official-sat',
    usageContext: 'exam',
    originalExam: examSlug,
    originalQuestionNumber: rawQuestion.questionNumber,
    originalModuleNumber: moduleNumber,
    hasImage,
    graphUrl: null,
    graphDescription,
    passage,
    skillTags: [],
  };

  return { question: normalized, warnings };
}

/**
 * Normalize the entire extracted exam data.
 *
 * @param {object} extractedData - The full extraction result from Stage 1.
 * @param {string} examSlug - Slug identifier.
 * @param {string} examName - Human-readable exam name.
 * @returns {object} Normalized data ready for upload.
 */
function normalizeExamData(extractedData, examSlug, examName) {
  const allWarnings = [];
  let totalMapped = 0;
  let totalUnmapped = 0;

  const normalizedModules = [];

  for (const mod of extractedData.modules) {
    const moduleNumber = mod.moduleNumber;
    const moduleMeta = MODULE_DEFAULTS[moduleNumber] || MODULE_DEFAULTS[1];

    const normalizedQuestions = [];

    for (const rawQ of mod.questions) {
      const { question, warnings } = normalizeQuestion(rawQ, moduleNumber, examSlug);
      normalizedQuestions.push(question);

      if (question.subcategoryId) {
        totalMapped++;
      } else {
        totalUnmapped++;
      }

      for (const w of warnings) {
        allWarnings.push(`Module ${moduleNumber}, Q${rawQ.questionNumber}: ${w}`);
      }
    }

    normalizedModules.push({
      moduleNumber,
      title: `${examName} - ${moduleMeta.section} Module ${moduleNumber <= 2 ? moduleNumber : moduleNumber - 2}`,
      description: `Official SAT exam - ${moduleMeta.section} Section, Module ${moduleNumber <= 2 ? moduleNumber : moduleNumber - 2}`,
      section: moduleMeta.section,
      calculatorAllowed: moduleMeta.calculatorAllowed,
      timeLimit: moduleMeta.timeLimit,
      questions: normalizedQuestions,
    });
  }

  return {
    examSlug,
    examName,
    modules: normalizedModules,
    stats: {
      totalQuestions: normalizedModules.reduce((sum, m) => sum + m.questions.length, 0),
      subcategoryMapped: totalMapped,
      subcategoryUnmapped: totalUnmapped,
    },
    warnings: allWarnings,
  };
}

module.exports = { normalizeQuestion, normalizeExamData, MODULE_DEFAULTS };
