import {
  findResponseForQuestion,
  sortResponsesIntoQuestionOrder,
} from '../utils/examResponseMatching';

// The exact repeated stem that triggered the "tinctoria but" Score Details
// bug: it appears verbatim on ~15 questions per SAT, so it must never be
// used to attribute one question's response to another.
const SHARED_STEM =
  'Which choice completes the text so that it conforms to the conventions of Standard English?';

const secQuestion = (id, options) => ({
  id,
  text: SHARED_STEM,
  options,
  questionType: 'multiple-choice',
});

describe('exam response matching (Score Details)', () => {
  describe('priority of exact ids over shared question text', () => {
    // Simulates Firestore doc-id order: the foreign same-stem response comes
    // FIRST in the array, the question's own response comes later.
    const module = {
      id: 'mod-rw-2',
      questions: [
        secQuestion('q-15', ['tinctoria but', 'tinctoria, but', 'tinctoria; but', 'tinctoria. But']),
        secQuestion('q-17', ['grew,', 'grew', 'grew;', 'grew.']),
      ],
      responses: [
        {
          questionId: 'q-15',
          moduleIndex: 0,
          userAnswer: 'tinctoria but',
          isCorrect: false,
          question: { id: 'q-15', text: SHARED_STEM },
        },
        {
          questionId: 'q-17',
          moduleIndex: 1,
          userAnswer: 'grew,',
          isCorrect: false,
          question: { id: 'q-17', text: SHARED_STEM },
        },
      ],
    };

    it('matches each answered question to its own response, not the first same-stem one', () => {
      expect(findResponseForQuestion(module, module.questions[0], 0).userAnswer).toBe(
        'tinctoria but'
      );
      expect(findResponseForQuestion(module, module.questions[1], 1).userAnswer).toBe('grew,');
    });

    it('regression: an omitted same-stem question gets NO response, not a foreign one', () => {
      const omitted = secQuestion('q-19', ['were', 'was', 'is', 'are']);
      const moduleWithOmitted = {
        ...module,
        questions: [...module.questions, omitted],
      };
      expect(findResponseForQuestion(moduleWithOmitted, omitted, 2)).toBeUndefined();
    });
  });

  it('matches by the id carried on the embedded question snapshot', () => {
    const question = { id: 'q-3', text: 'Unique stem', options: ['a', 'b'] };
    const module = {
      id: 'mod-1',
      questions: [question],
      responses: [{ userAnswer: 'b', question: { id: 'q-3', text: 'Unique stem' } }],
    };
    expect(findResponseForQuestion(module, question, 0).userAnswer).toBe('b');
  });

  it('matches legacy index-based ids (practice-<moduleId>-q-<index>)', () => {
    const question = { text: 'Stem without id', options: ['a', 'b'] };
    const module = {
      id: 'mod-1',
      questions: [question],
      responses: [{ questionId: 'practice-mod-1-q-4', userAnswer: 'a' }],
    };
    expect(findResponseForQuestion(module, question, 4).userAnswer).toBe('a');
  });

  it('matches by recorded moduleIndex when ids are absent', () => {
    const question = { text: 'Stem without id', options: ['a', 'b'] };
    const module = {
      id: 'mod-1',
      questions: [question],
      responses: [
        { moduleIndex: 2, userAnswer: 'other' },
        { moduleIndex: 5, userAnswer: 'a' },
      ],
    };
    expect(findResponseForQuestion(module, question, 5).userAnswer).toBe('a');
  });

  it('does not treat a question at index 0 as matching a response missing moduleIndex', () => {
    const question = { text: 'Unique stem A', options: ['a', 'b'] };
    const module = {
      id: 'mod-1',
      questions: [question, { text: 'Unique stem B' }],
      responses: [{ userAnswer: 'a', question: { text: 'Unique stem B' } }],
    };
    expect(findResponseForQuestion(module, question, 0)).toBeUndefined();
  });

  describe('text matching as a guarded last resort', () => {
    it('matches by text only when the text is unique among questions and responses', () => {
      const question = { text: 'One-of-a-kind stem', options: ['a', 'b'] };
      const module = {
        id: 'mod-1',
        questions: [question, { text: 'Different stem' }],
        responses: [{ userAnswer: 'b', question: { text: 'One-of-a-kind stem' } }],
      };
      expect(findResponseForQuestion(module, question, 0).userAnswer).toBe('b');
    });

    it('refuses to match by text when two questions in the module share it', () => {
      const first = { text: SHARED_STEM, options: ['a', 'b'] };
      const second = { text: SHARED_STEM, options: ['c', 'd'] };
      const module = {
        id: 'mod-1',
        questions: [first, second],
        responses: [{ userAnswer: 'a', question: { text: SHARED_STEM } }],
      };
      expect(findResponseForQuestion(module, first, 0)).toBeUndefined();
      expect(findResponseForQuestion(module, second, 1)).toBeUndefined();
    });

    it('refuses to match by text when two responses share it', () => {
      const question = { text: SHARED_STEM, options: ['a', 'b'] };
      const module = {
        id: 'mod-1',
        questions: [question],
        responses: [
          { userAnswer: 'a', question: { text: SHARED_STEM } },
          { userAnswer: 'b', question: { text: SHARED_STEM } },
        ],
      };
      expect(findResponseForQuestion(module, question, 3)).toBeUndefined();
    });
  });

  it('returns undefined for empty or missing responses', () => {
    expect(findResponseForQuestion({ id: 'm', responses: [] }, { id: 'q' }, 0)).toBeUndefined();
    expect(findResponseForQuestion({ id: 'm' }, { id: 'q' }, 0)).toBeUndefined();
  });

  describe('sortResponsesIntoQuestionOrder', () => {
    it('restores question order from Firestore doc-id order', () => {
      const responses = [
        { moduleIndex: 7, userAnswer: 'late' },
        { moduleIndex: 0, userAnswer: 'first' },
        { userAnswer: 'no-index' },
        { moduleIndex: 3, userAnswer: 'middle' },
      ];
      sortResponsesIntoQuestionOrder(responses);
      expect(responses.map((r) => r.userAnswer)).toEqual([
        'first',
        'middle',
        'late',
        'no-index',
      ]);
    });

    it('passes through non-array input', () => {
      expect(sortResponsesIntoQuestionOrder(null)).toBeNull();
      expect(sortResponsesIntoQuestionOrder(undefined)).toBeUndefined();
    });
  });
});
