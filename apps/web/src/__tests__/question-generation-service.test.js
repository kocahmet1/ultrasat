const {
  buildQuestionGenerationPrompt,
  buildQuestionForPublish,
  isPublishEligible,
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
});
