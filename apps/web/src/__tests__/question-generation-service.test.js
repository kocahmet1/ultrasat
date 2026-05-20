const {
  buildQuestionGenerationPrompt,
  buildQuestionForPublish,
  canOverridePublish,
  collectRevisionNotices,
  getDraftStatusFromValidation,
  getPublishBlockers,
  isPublishEligible,
  normalizeReviewScore,
  validateDraftQuestion,
} = require('../../../api/questionGenerationService');

describe('question generation service', () => {
  it('builds an editable prompt with the selected SAT subcategory and difficulty', () => {
    const prompt = buildQuestionGenerationPrompt({
      subcategory: 'transitions',
      difficulty: 'hard',
      quantity: 3,
    });

    expect(prompt).toContain('Create 3 original Digital SAT practice questions');
    expect(prompt).toContain('Subcategory display name: Transitions');
    expect(prompt).toContain('Canonical subcategory id: transitions');
    expect(prompt).toContain('Requested difficulty tier: hard');
  });

  it('rejects malformed drafts deterministically before LLM review', () => {
    const result = validateDraftQuestion({
      text: 'Which choice best completes the text?',
      questionType: 'multiple-choice',
      options: ['A', 'A', 'C'],
      correctAnswer: 4,
      explanation: '',
      difficulty: 'medium',
      subcategory: 'transitions',
    }, {
      selectedSubcategory: 'transitions',
      requestedDifficulty: 'medium',
      siblingTexts: [],
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toEqual(expect.arrayContaining([
      'Expected exactly 4 answer choices, found 3',
      'Answer choices must be unique',
      'correctAnswer is outside the answer choice range',
      'Missing explanation',
    ]));
  });

  it('allows an existing question audit draft to match its own original text', () => {
    const result = validateDraftQuestion({
      text: 'Which choice best completes the text?',
      questionType: 'multiple-choice',
      options: ['therefore,', 'however,', 'moreover,', 'for example,'],
      correctAnswer: 1,
      explanation: 'However sets up the contrast.',
      difficulty: 'medium',
      subcategory: 'transitions',
    }, {
      selectedSubcategory: 'transitions',
      requestedDifficulty: 'medium',
      existingQuestionId: 'question-1',
      allowedDuplicateQuestionId: 'question-1',
      siblingTexts: [],
    });

    expect(result.valid).toBe(true);
  });

  it('only publishes verified drafts that pass answer, style, and difficulty checks', () => {
    const draft = {
      status: 'verified',
      text: 'Question text',
      options: ['A', 'B', 'C', 'D'],
      correctAnswer: 1,
      explanation: 'Because B is supported.',
      difficulty: 'easy',
      requestedDifficulty: 'easy',
      subcategory: 'transitions',
      subCategory: 'transitions',
      subcategoryId: 8,
      skillTags: ['transitions'],
      validation: {
        deterministic: { valid: true, errors: [], warnings: [] },
        answerKeyMatches: true,
        difficultyMatchesRequest: true,
        calibratedDifficulty: 'easy',
        review: {
          qualityScore: 90,
          collegeBoardStyleScore: 91,
          requiresHumanReview: false,
        },
      },
    };

    expect(isPublishEligible(draft)).toBe(true);
    expect(buildQuestionForPublish({ ...draft, id: 'draft-1', runId: 'run-1' })).toMatchObject({
      source: 'ai-generated',
      generationRunId: 'run-1',
      generationDraftId: 'draft-1',
      usageContext: 'general',
      difficulty: 'easy',
      calibratedDifficulty: 'easy',
    });

    expect(isPublishEligible({
      ...draft,
      validation: {
        ...draft.validation,
        answerKeyMatches: false,
      },
    })).toBe(false);
  });

  it('normalizes reviewer scores returned on a 1-to-10 scale', () => {
    expect(normalizeReviewScore(9)).toBe(90);
    expect(normalizeReviewScore(88)).toBe(88);

    const validation = {
      deterministic: { valid: true, errors: [], warnings: [] },
      answerKeyMatches: true,
      difficultyMatchesRequest: true,
      calibratedDifficulty: 'easy',
      solver: {
        possibleIssue: false,
        confidence: 'high',
      },
      review: {
        qualityScore: 9,
        collegeBoardStyleScore: 9,
        calibratedDifficulty: 'easy',
        difficultyConfidence: 'high',
        requiresHumanReview: false,
        flags: [],
      },
      flags: [],
    };

    expect(getDraftStatusFromValidation(validation)).toBe('verified');
    expect(getDraftStatusFromValidation({
      ...validation,
      review: {
        ...validation.review,
        collegeBoardStyleScore: 8,
      },
    })).toBe('needs_revision');
  });

  it('allows admin override only after basic format and answer-key checks pass', () => {
    const draft = {
      status: 'needs_revision',
      validation: {
        deterministic: { valid: true, errors: [], warnings: [] },
        answerKeyMatches: true,
        difficultyMatchesRequest: true,
        solver: {
          possibleIssue: false,
          confidence: 'high',
        },
        review: {
          qualityScore: 9,
          collegeBoardStyleScore: 8,
          difficultyConfidence: 'high',
          requiresHumanReview: false,
          flags: [],
        },
        flags: [],
      },
    };

    expect(isPublishEligible(draft)).toBe(false);
    expect(canOverridePublish(draft)).toBe(true);
    expect(getPublishBlockers(draft)).toEqual(expect.arrayContaining([
      'Status is needs revision, not verified.',
      'Style score 80 is below 85.',
    ]));

    expect(canOverridePublish({
      ...draft,
      validation: {
        ...draft.validation,
        answerKeyMatches: false,
      },
    })).toBe(false);
  });

  it('collects revision notices from deterministic, solver, and review results without duplicates', () => {
    const notices = collectRevisionNotices({
      correctAnswer: 2,
      requestedDifficulty: 'easy',
      difficulty: 'easy',
      validation: {
        answerKeyMatches: false,
        solvedAnswerIndex: 1,
        difficultyMatchesRequest: false,
        calibratedDifficulty: 'medium',
        deterministic: {
          errors: ['Expected exactly 4 answer choices, found 3'],
          warnings: ['Generated difficulty differs from requested'],
        },
        solver: {
          possibleIssue: true,
          issueSummary: 'The item may have two defensible answers.',
        },
        flags: [
          {
            type: 'style_mismatch',
            severity: 'medium',
            description: 'Distractors are too obviously wrong.',
            fixSuggestion: 'Make distractors more competitive.',
          },
        ],
        review: {
          summary: 'The idea is valid but weak.',
          recommendations: ['Use a more natural SAT-style sentence.'],
          flags: [
            {
              type: 'style_mismatch',
              severity: 'medium',
              description: 'Distractors are too obviously wrong.',
              fixSuggestion: 'Make distractors more competitive.',
            },
          ],
        },
      },
    });

    expect(notices).toEqual(expect.arrayContaining([
      'Format error: Expected exactly 4 answer choices, found 3',
      'Solver concern: The item may have two defensible answers.',
      'Answer key mismatch: independent solver selected 1; the draft marks 2.',
      'Difficulty mismatch: reviewer calibrated this as medium, but the requested tier is easy.',
      'Recommendation: Use a more natural SAT-style sentence.',
    ]));
    expect(notices.filter(notice => notice.includes('Distractors are too obviously wrong'))).toHaveLength(1);
  });
});
