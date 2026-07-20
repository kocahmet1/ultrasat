const {
  answersEquivalent,
  createContentHash,
  createVisualOnlyRepairCandidate,
  getExpectedQuestionCount,
  inferQuestionType,
  inspectModuleStructure,
  inspectQuestionDeterministically,
  normalizeRepairQuestion,
  renderVisualSpecToSvg,
  resolveCorrectAnswerIndex,
  summarizeRunItems,
  verifyCandidateForApplication,
} = require('../../../api/examQualityControlService');
const {
  resolveSubcategory,
} = require('../../../../scripts/lib/subcategoryMap');

function createValidMultipleChoice(overrides = {}) {
  return {
    text: 'If 3x + 4 = 19, what is the value of x?',
    questionType: 'multiple-choice',
    options: ['3', '4', '5', '6'],
    correctAnswer: 2,
    explanation: 'Subtracting 4 and dividing by 3 gives x = 5.',
    difficulty: 'easy',
    subcategory: 'linear-equations-one-variable',
    ...overrides,
  };
}

function createPassingVerification(overrides = {}) {
  return {
    acceptable: true,
    questionType: 'multiple-choice',
    solvedAnswerIndex: 2,
    solvedAnswerValue: '',
    singleCorrectAnswer: true,
    contentAccurate: true,
    officialStyleScore: 95,
    stemQualityScore: 95,
    distractorQualityScore: 90,
    difficultyCalibrationScore: 90,
    visualMatchesQuestion: true,
    graphSpecSufficient: true,
    criticalIssues: [],
    summary: 'Publication ready.',
    ...overrides,
  };
}

function createPassingEditorialReview(overrides = {}) {
  const review = {
    outcome: 'pass',
    recommendedAction: 'none',
    severity: 'info',
    summary: 'The candidate is publication ready.',
    scores: {
      contentAccuracy: 98,
      answerDeterminacy: 98,
      officialStyle: 95,
      stemQuality: 95,
      distractorQuality: 90,
      difficultyCalibration: 95,
      visualIntegrity: 95,
      overall: 96,
    },
    calibratedDifficulty: 'easy',
    answerValidation: {
      singleCorrectAnswer: true,
      solvedAnswer: 'C',
      matchesStoredKey: true,
      explanation: 'The independently solved answer matches the stored key.',
    },
    issues: [],
    confidence: 'high',
  };

  return {
    ...review,
    ...overrides,
    scores: {
      ...review.scores,
      ...(overrides.scores || {}),
    },
    answerValidation: {
      ...review.answerValidation,
      ...(overrides.answerValidation || {}),
    },
  };
}

describe('exam quality-control service', () => {
  it('resolves only unambiguous canonical SAT subcategories', () => {
    expect(resolveSubcategory('')).toBeNull();
    expect(resolveSubcategory('a')).toBeNull();
    expect(resolveSubcategory('1-variable data')).toBeNull();
    expect(resolveSubcategory('boundaries')).toMatchObject({
      id: 9,
      mainCategory: 'Standard English Conventions',
    });
    expect(resolveSubcategory('form-structure-sense')).toMatchObject({
      id: 10,
      mainCategory: 'Standard English Conventions',
    });
  });
  it('uses the official Digital SAT module question counts', () => {
    expect(getExpectedQuestionCount(1)).toBe(27);
    expect(getExpectedQuestionCount(2)).toBe(27);
    expect(getExpectedQuestionCount(3)).toBe(22);
    expect(getExpectedQuestionCount(4)).toBe(22);
    expect(getExpectedQuestionCount(5)).toBeNull();
  });

  it('does not misclassify imported multiple-choice questions that carry inputType', () => {
    const importedQuestion = createValidMultipleChoice({
      inputType: 'number',
    });

    expect(inferQuestionType(importedQuestion)).toBe('multiple-choice');
    expect(
      inspectQuestionDeterministically(importedQuestion, {
        moduleNumber: 3,
      }).questionType,
    ).toBe('multiple-choice');
  });

  it('recognizes legacy numeric, letter, and direct-text answer keys', () => {
    const question = createValidMultipleChoice();

    expect(resolveCorrectAnswerIndex(question)).toBe(2);
    expect(resolveCorrectAnswerIndex({
      ...question,
      correctAnswer: 'C',
    })).toBe(2);
    expect(resolveCorrectAnswerIndex({
      ...question,
      correctAnswer: '5',
    })).toBe(2);
  });

  it('flags a resolvable legacy answer key for canonical normalization', () => {
    const result = inspectQuestionDeterministically(
      createValidMultipleChoice({
        correctAnswer: 'C',
      }),
      { moduleNumber: 3 },
    );
    const canonicalKeyIssue = result.issues.find(
      issue => issue.code === 'noncanonical_answer_key',
    );

    expect(result.resolvedCorrectAnswerIndex).toBe(2);
    expect(result.valid).toBe(false);
    expect(canonicalKeyIssue).toEqual(expect.objectContaining({
      severity: 'high',
    }));
  });

  it('detects missing visuals and malformed choices deterministically', () => {
    const result = inspectQuestionDeterministically(
      createValidMultipleChoice({
        options: ['3', '3', '', '6'],
        correctAnswer: 'Z',
        hasImage: true,
        graphDescription: 'A coordinate plane with a line.',
      }),
      { moduleNumber: 3 },
    );
    const codes = result.issues.map(issue => issue.code);

    expect(result.valid).toBe(false);
    expect(codes).toEqual(expect.arrayContaining([
      'empty_answer_choice',
      'duplicate_answer_choice',
      'invalid_answer_key',
      'missing_required_visual',
    ]));
  });

  it('reports underfilled, dead-reference, and duplicate module structure', () => {
    const result = inspectModuleStructure(
      {
        moduleNumber: 3,
        questionCount: 4,
        questionIds: ['q1', 'q2', 'q2', 'missing'],
      },
      ['q1', 'q2'],
    );
    const codes = result.issues.map(issue => issue.code);

    expect(result.expectedCount).toBe(22);
    expect(result.duplicateCount).toBe(1);
    expect(result.missingQuestionIds).toEqual(['missing']);
    expect(codes).toEqual(expect.arrayContaining([
      'module_question_count_mismatch',
      'dead_question_references',
      'duplicate_question_references',
    ]));
  });

  it('produces stable content hashes regardless of object key order', () => {
    expect(createContentHash({
      b: 2,
      a: { d: 4, c: 3 },
    })).toBe(createContentHash({
      a: { c: 3, d: 4 },
      b: 2,
    }));
  });

  it('keeps graph-only repairs byte-for-byte equivalent in assessed content', () => {
    const source = createValidMultipleChoice({
      passage: 'A complete source passage.',
      correctAnswer: 'C',
      inputType: 'number',
      graphDescription: 'The required graph is missing.',
    });
    const visualSpec = {
      type: 'line',
      title: 'Values of y by x',
      xLabel: 'x',
      yLabel: 'y',
      categories: [],
      xValues: [0, 1, 2],
      series: [{ name: 'y', values: [1, 3, 5] }],
      tableHeaders: [],
      tableRows: [],
      accessibilityText: 'A line through (0, 1), (1, 3), and (2, 5).',
    };
    const candidate = createVisualOnlyRepairCandidate(source, {
      text: 'An attempted rewrite that must not be used.',
      options: ['wrong'],
      correctAnswer: 0,
      graphDescription: 'A line through the three specified points.',
      visualSpec,
    });

    expect(candidate.text).toBe(source.text);
    expect(candidate.passage).toBe(source.passage);
    expect(candidate.options).toEqual(source.options);
    expect(candidate.correctAnswer).toBe(2);
    expect(candidate.visualSpec).toEqual(visualSpec);
    expect(candidate.graphUrl).toBeNull();
  });

  it('normalizes a student-produced response with a primary accepted answer', () => {
    const question = normalizeRepairQuestion({
      passage: '',
      text: 'What is the value of x?',
      questionType: 'user-input',
      options: [],
      correctAnswerIndex: -1,
      correctAnswerValue: '',
      acceptedAnswers: ['1/2', '0.5'],
      inputType: 'fraction',
      answerFormat: 'Enter a fraction or decimal.',
      explanation: 'The value is one-half.',
      difficulty: 'easy',
      subcategory: 'linear-equations-one-variable',
      skillTags: ['linear equations'],
      subjectArea: 'Math',
      mainCategory: 'Algebra',
      graphDescription: '',
      visualSpec: {
        type: 'none',
        title: '',
        xLabel: '',
        yLabel: '',
        categories: [],
        xValues: [],
        series: [],
        tableHeaders: [],
        tableRows: [],
        accessibilityText: '',
      },
    });

    expect(question.correctAnswer).toBe('1/2');
    expect(question.acceptedAnswers).toEqual(['1/2', '0.5']);
    expect(answersEquivalent('1/2', '0.5')).toBe(true);
  });

  it('blocks publication when independent verification misses a quality gate', () => {
    const question = createValidMultipleChoice();
    const eligibilityContext = {
      moduleNumber: 3,
      editorialReview: createPassingEditorialReview(),
      repairSpecification: {
        targetSkill: 'linear-equations-one-variable',
        targetDifficulty: 'easy',
      },
    };
    const passing = verifyCandidateForApplication(
      question,
      createPassingVerification(),
      eligibilityContext,
    );
    const weakDistractors = verifyCandidateForApplication(
      question,
      createPassingVerification({ distractorQualityScore: 84 }),
      eligibilityContext,
    );
    const wrongKey = verifyCandidateForApplication(
      question,
      createPassingVerification({ solvedAnswerIndex: 1 }),
      eligibilityContext,
    );

    expect(passing.eligible).toBe(true);
    expect(weakDistractors.eligible).toBe(false);
    expect(weakDistractors.blockers.join(' ')).toMatch(/Distractor-quality/);
    expect(wrongKey.eligible).toBe(false);
    expect(wrongKey.blockers.join(' ')).toMatch(/answer key/);
  });

  it('blocks candidates outside the canonical taxonomy or selected module section', () => {
    const editorialReview = createPassingEditorialReview();
    const unknownTaxonomy = verifyCandidateForApplication(
      createValidMultipleChoice({
        subcategory: 'invented-sat-skill',
      }),
      createPassingVerification(),
      { moduleNumber: 3, editorialReview },
    );
    const wrongSection = verifyCandidateForApplication(
      createValidMultipleChoice({
        subcategory: 'central-ideas-details',
      }),
      createPassingVerification(),
      { moduleNumber: 3, editorialReview },
    );

    expect(unknownTaxonomy.eligible).toBe(false);
    expect(unknownTaxonomy.blockers.join(' ')).toMatch(/canonical SAT taxonomy/);
    expect(wrongSection.eligible).toBe(false);
    expect(wrongSection.blockers.join(' ')).toMatch(
      /Reading and Writing, not Math/,
    );
  });

  it('blocks candidates that miss the approved repair skill target', () => {
    const wrongSkill = verifyCandidateForApplication(
      createValidMultipleChoice(),
      createPassingVerification(),
      {
        moduleNumber: 3,
        editorialReview: createPassingEditorialReview(),
        repairSpecification: {
          targetSkill: 'linear-functions',
          targetDifficulty: 'easy',
        },
      },
    );

    expect(wrongSkill.eligible).toBe(false);
    expect(wrongSkill.blockers.join(' ')).toMatch(/subcategory|skill/i);
  });

  it('blocks candidates that miss the approved repair difficulty target', () => {
    const wrongDifficulty = verifyCandidateForApplication(
      createValidMultipleChoice(),
      createPassingVerification(),
      {
        moduleNumber: 3,
        editorialReview: createPassingEditorialReview(),
        repairSpecification: {
          targetSkill: 'linear-equations-one-variable',
          targetDifficulty: 'hard',
        },
      },
    );

    expect(wrongDifficulty.eligible).toBe(false);
    expect(wrongDifficulty.blockers.join(' ')).toMatch(/difficulty/i);
  });

  it('blocks invalid or non-equivalent SAT student-response answers', () => {
    const question = {
      text: 'What is the value of x if 2x = 1?',
      questionType: 'user-input',
      options: [],
      correctAnswer: '1/2',
      acceptedAnswers: ['0.5', '50%'],
      inputType: 'fraction',
      answerFormat: 'Enter a fraction or decimal.',
      explanation: 'Dividing both sides by 2 gives x = 1/2.',
      difficulty: 'easy',
      subcategory: 'linear-equations-one-variable',
    };
    const verification = createPassingVerification({
      questionType: 'user-input',
      solvedAnswerIndex: -1,
      solvedAnswerValue: '0.5',
    });
    const eligibility = verifyCandidateForApplication(
      question,
      verification,
      {
        moduleNumber: 3,
        editorialReview: createPassingEditorialReview({
          answerValidation: {
            solvedAnswer: '0.5',
          },
        }),
        repairSpecification: {
          targetSkill: 'linear-equations-one-variable',
          targetDifficulty: 'easy',
        },
      },
    );

    expect(eligibility.eligible).toBe(false);
    expect(eligibility.blockers.join(' ')).toMatch(
      /violate Digital SAT response-entry rules/,
    );
    expect(eligibility.blockers.join(' ')).toMatch(
      /not equivalent to the independently solved answer/,
    );
  });

  it('renders deterministic, escaped SVG visuals', () => {
    const svg = renderVisualSpecToSvg({
      type: 'table',
      title: 'Revenue < Cost',
      xLabel: '',
      yLabel: '',
      categories: [],
      xValues: [],
      series: [],
      tableHeaders: ['Year', 'Amount'],
      tableRows: [['2025', '$4 & rising']],
      accessibilityText: 'A two-column data table.',
    });

    expect(svg).toContain('Revenue &lt; Cost');
    expect(svg).toContain('$4 &amp; rising');
    expect(svg).not.toContain('<script');
  });

  it('renders coordinate-plane series, axes, points, and annotations', () => {
    const svg = renderVisualSpecToSvg({
      type: 'coordinate-plane',
      title: 'Line y = 2x + 1',
      xLabel: 'x',
      yLabel: 'y',
      xMin: -3,
      xMax: 3,
      yMin: -5,
      yMax: 7,
      equalScale: false,
      showGrid: true,
      categories: [],
      xValues: [-2, 0, 2],
      series: [{
        name: 'y = 2x + 1',
        values: [-3, 1, 5],
        xValues: [-2, 0, 2],
        renderAs: 'line',
        showPoints: true,
      }],
      tableHeaders: [],
      tableRows: [],
      annotations: [{
        x: 0,
        y: 1,
        label: 'y-intercept < 2',
        position: 'right',
      }],
      shapes: [],
      accessibilityText: 'A coordinate plane showing y equals 2x plus 1.',
    });

    expect(svg).toContain('<polyline');
    expect(svg).toContain('class="axis"');
    expect(svg).toContain('class="grid"');
    expect(svg).toContain('class="annotation-point"');
    expect(svg).toContain('y-intercept &lt; 2');
  });

  it('renders geometry polygons and circles without coordinate axes', () => {
    const svg = renderVisualSpecToSvg({
      type: 'geometry',
      title: 'Triangle and inscribed circle',
      xLabel: '',
      yLabel: '',
      xMin: -1,
      xMax: 7,
      yMin: -1,
      yMax: 6,
      equalScale: true,
      showGrid: false,
      categories: [],
      xValues: [],
      series: [],
      tableHeaders: [],
      tableRows: [],
      annotations: [{
        x: 3,
        y: 4,
        label: 'vertex A',
        position: 'above',
      }],
      shapes: [
        {
          type: 'polygon',
          points: [
            { x: 0, y: 0 },
            { x: 6, y: 0 },
            { x: 3, y: 4 },
          ],
          centerX: 0,
          centerY: 0,
          radius: 0,
          label: '△ABC',
          dashed: false,
          fill: false,
        },
        {
          type: 'circle',
          points: [],
          centerX: 3,
          centerY: 1.5,
          radius: 1,
          label: 'r = 1',
          dashed: true,
          fill: false,
        },
      ],
      accessibilityText: 'A triangle containing a dashed circle.',
    });

    expect(svg).toContain('<polygon');
    expect(svg).toContain('<ellipse');
    expect(svg).toContain('stroke-dasharray="9 7"');
    expect(svg).toContain('△ABC');
    expect(svg).not.toContain('class="axis"');
  });

  it('marks a run publish-ready only when every item is resolved', () => {
    expect(summarizeRunItems([
      { status: 'passed', severity: 'info' },
      { status: 'repaired', severity: 'critical' },
    ]).publishReady).toBe(true);

    expect(summarizeRunItems([
      { status: 'passed', severity: 'info' },
      { status: 'needs_repair', severity: 'critical' },
    ]).publishReady).toBe(false);

    expect(summarizeRunItems([
      { status: 'passed', severity: 'info' },
      { status: 'queued', severity: 'info' },
    ]).publishReady).toBe(false);
  });
});
