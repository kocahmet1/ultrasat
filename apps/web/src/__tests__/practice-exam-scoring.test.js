import {
  areStudentResponsesEquivalent,
  isPracticeExamAnswerCorrect,
  isValidSatStudentResponse,
  parseExactRational,
  resolveMultipleChoiceKey,
} from '../utils/practiceExamScoring';

describe('practice exam scoring', () => {
  describe('multiple-choice key resolution', () => {
    const options = ['zero', 'one', 'two', '4'];

    it('resolves bounded integer numbers and canonical integer strings as indices', () => {
      expect(resolveMultipleChoiceKey(2, options)).toBe('two');
      expect(resolveMultipleChoiceKey('2', options)).toBe('two');
      expect(resolveMultipleChoiceKey('A', options)).toBe('zero');
      expect(resolveMultipleChoiceKey('d', options)).toBe('4');
    });

    it('keeps noncanonical or out-of-range numeric strings as direct option text', () => {
      expect(resolveMultipleChoiceKey('01', options)).toBe('01');
      expect(resolveMultipleChoiceKey('1.0', options)).toBe('1.0');
      expect(resolveMultipleChoiceKey('1/2', options)).toBe('1/2');
      expect(resolveMultipleChoiceKey('1st', options)).toBe('1st');
      expect(resolveMultipleChoiceKey('4', options)).toBe('4');
      expect(resolveMultipleChoiceKey(' 1 ', options)).toBe(' 1 ');
    });

    it('scores both indexed and direct-text multiple-choice keys', () => {
      expect(isPracticeExamAnswerCorrect({
        questionType: 'multiple-choice',
        options,
        correctAnswer: '2',
      }, 'two')).toBe(true);

      expect(isPracticeExamAnswerCorrect({
        questionType: 'multiple-choice',
        options,
        correctAnswer: '4',
      }, '4')).toBe(true);

      expect(isPracticeExamAnswerCorrect({
        questionType: 'multiple-choice',
        options: ['1/3', '1/2', '2/3', '1'],
        correctAnswer: '1/2',
      }, '1/2')).toBe(true);
    });
  });

  describe('exact rational parsing', () => {
    it.each([
      ['0.5', 1n, 2n],
      ['.5000', 1n, 2n],
      ['2/4', 1n, 2n],
      ['1.5/3', 1n, 2n],
      ['-3/-6', 1n, 2n],
      ['−0.75', -3n, 4n],
      ['5.', 5n, 1n],
      [0.125, 1n, 8n],
    ])('parses %p without floating-point conversion', (value, numerator, denominator) => {
      expect(parseExactRational(value)).toEqual({ numerator, denominator });
    });

    it.each([
      '',
      '1/0',
      '1/2/3',
      '0.5xyz',
      '1e-3',
      'NaN',
      Infinity,
      null,
    ])('rejects invalid value %p rather than accepting a parseable prefix', (value) => {
      expect(parseExactRational(value)).toBeNull();
    });
  });

  describe('student-produced response comparison', () => {
    it('accepts exactly equivalent fractions and decimals', () => {
      expect(areStudentResponsesEquivalent('3/6', '.5')).toBe(true);
      expect(areStudentResponsesEquivalent('-1/4', '−0.25')).toBe(true);
      expect(areStudentResponsesEquivalent('0.500', '1/2')).toBe(true);
    });

    it('does not use a blanket approximation tolerance', () => {
      expect(areStudentResponsesEquivalent('0.3333', '1/3')).toBe(false);
      expect(areStudentResponsesEquivalent('0.50001', '0.5')).toBe(false);
      expect(areStudentResponsesEquivalent('1/2 extra', '0.5')).toBe(false);
    });

    it('accepts an official rounded or truncated form only when explicitly listed', () => {
      const question = {
        questionType: 'user-input',
        inputType: 'number',
        correctAnswer: '1/3',
        acceptedAnswers: ['.333', '.334'],
      };

      expect(isPracticeExamAnswerCorrect(question, '2/6')).toBe(true);
      expect(isPracticeExamAnswerCorrect(question, '.333')).toBe(true);
      expect(isPracticeExamAnswerCorrect(question, '0.3330')).toBe(false);
      expect(isPracticeExamAnswerCorrect(question, '.334')).toBe(true);
      expect(isPracticeExamAnswerCorrect(question, '0.3333')).toBe(false);
    });

    it('checks acceptedAnswers for fraction and inferred user-input questions', () => {
      expect(isPracticeExamAnswerCorrect({
        questionType: 'user-input',
        inputType: 'fraction',
        correctAnswer: '3/4',
        acceptedAnswers: ['.75'],
      }, '6/8')).toBe(true);

      expect(isPracticeExamAnswerCorrect({
        answer: '2.5',
        acceptedAnswers: ['5/2'],
      }, '10/4')).toBe(true);
    });

    it('rejects response syntax that Bluebook does not permit', () => {
      expect(isValidSatStudentResponse('+2')).toBe(false);
      expect(isValidSatStudentResponse('1.5/3')).toBe(false);
      expect(isValidSatStudentResponse('-3/-6')).toBe(false);
      expect(isValidSatStudentResponse('2/3')).toBe(true);
      expect(isPracticeExamAnswerCorrect({
        questionType: 'user-input',
        inputType: 'number',
        correctAnswer: '2',
      }, '+2')).toBe(false);
    });

    it('keeps nonnumeric accepted answers exact and case-sensitive', () => {
      const question = {
        questionType: 'user-input',
        correctAnswer: 'triangle',
        acceptedAnswers: ['triangles'],
      };

      expect(isPracticeExamAnswerCorrect(question, ' triangles ')).toBe(true);
      expect(isPracticeExamAnswerCorrect(question, 'Triangle')).toBe(false);
      expect(isPracticeExamAnswerCorrect(question, '')).toBe(false);
    });
  });
});
