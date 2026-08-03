const CANONICAL_NONNEGATIVE_INTEGER = /^(?:0|[1-9]\d*)$/;
const DECIMAL_VALUE = /^([+-]?)(?:(\d+)(?:\.(\d*))?|\.(\d+))$/;
const SAT_STUDENT_RESPONSE = /^-?(?:\d+\/\d+|\d+(?:\.\d*)?|\.\d+)$/;

const greatestCommonDivisor = (left, right) => {
  let a = left < 0n ? -left : left;
  let b = right < 0n ? -right : right;

  while (b !== 0n) {
    const remainder = a % b;
    a = b;
    b = remainder;
  }

  return a;
};

const reduceRational = (numerator, denominator) => {
  if (denominator === 0n) return null;

  let normalizedNumerator = numerator;
  let normalizedDenominator = denominator;

  if (normalizedDenominator < 0n) {
    normalizedNumerator = -normalizedNumerator;
    normalizedDenominator = -normalizedDenominator;
  }

  if (normalizedNumerator === 0n) {
    return { numerator: 0n, denominator: 1n };
  }

  const divisor = greatestCommonDivisor(normalizedNumerator, normalizedDenominator);
  return {
    numerator: normalizedNumerator / divisor,
    denominator: normalizedDenominator / divisor,
  };
};

const toAnswerText = (value) => {
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : null;
  if (typeof value === 'bigint') return String(value);
  return null;
};

const parseExactDecimal = (value) => {
  const answerText = toAnswerText(value);
  if (answerText === null || answerText === '') return null;

  const normalizedText = answerText.replace(/\u2212/g, '-');
  const match = normalizedText.match(DECIMAL_VALUE);
  if (!match) return null;

  const [, sign, integerDigits = '', trailingFractionDigits, leadingFractionDigits] = match;
  const fractionDigits = trailingFractionDigits ?? leadingFractionDigits ?? '';
  const wholeDigits = integerDigits || '0';
  const combinedDigits = `${wholeDigits}${fractionDigits}`.replace(/^0+(?=\d)/, '');

  let numerator = BigInt(combinedDigits || '0');
  if (sign === '-') numerator = -numerator;

  const denominator = 10n ** BigInt(fractionDigits.length);
  return reduceRational(numerator, denominator);
};

/**
 * Parses a finite integer, decimal, or fraction into a reduced rational value.
 * No floating-point conversion is used. Invalid or zero-denominator values
 * return null.
 */
export const parseExactRational = (value) => {
  const answerText = toAnswerText(value);
  if (answerText === null || answerText === '') return null;

  const fractionParts = answerText.split('/');
  if (fractionParts.length === 1) {
    return parseExactDecimal(fractionParts[0]);
  }

  if (fractionParts.length !== 2) return null;

  const numeratorValue = parseExactDecimal(fractionParts[0]);
  const denominatorValue = parseExactDecimal(fractionParts[1]);
  if (!numeratorValue || !denominatorValue || denominatorValue.numerator === 0n) {
    return null;
  }

  return reduceRational(
    numeratorValue.numerator * denominatorValue.denominator,
    numeratorValue.denominator * denominatorValue.numerator,
  );
};

/**
 * Resolves a stored multiple-choice key to the actual option value.
 *
 * Numeric strings are treated as indices only when the entire string is a
 * canonical nonnegative integer and that index exists. Values such as "01",
 * "1.0", "1/2", "1st", and out-of-range integers remain direct option text.
 */
export const resolveMultipleChoiceKey = (correctAnswer, options = []) => {
  if (!Array.isArray(options)) return correctAnswer;

  if (
    typeof correctAnswer === 'number'
    && Number.isInteger(correctAnswer)
    && correctAnswer >= 0
    && correctAnswer < options.length
  ) {
    return options[correctAnswer];
  }

  if (
    typeof correctAnswer === 'string'
    && CANONICAL_NONNEGATIVE_INTEGER.test(correctAnswer)
  ) {
    const index = Number(correctAnswer);
    if (Number.isSafeInteger(index) && index < options.length) {
      return options[index];
    }
  }

  if (typeof correctAnswer === 'string' && /^[A-Z]$/i.test(correctAnswer)) {
    const index = correctAnswer.toUpperCase().charCodeAt(0) - 65;
    if (index < options.length) {
      return options[index];
    }
  }

  return correctAnswer;
};

export const areStudentResponsesEquivalent = (studentAnswer, acceptedAnswer) => {
  const studentText = toAnswerText(studentAnswer);
  const acceptedText = toAnswerText(acceptedAnswer);

  if (studentText === null || acceptedText === null) return false;
  if (studentText === acceptedText) return true;

  const studentRational = parseExactRational(studentText);
  const acceptedRational = parseExactRational(acceptedText);

  return Boolean(
    studentRational
    && acceptedRational
    && studentRational.numerator === acceptedRational.numerator
    && studentRational.denominator === acceptedRational.denominator,
  );
};

export const isValidSatStudentResponse = (value) => {
  const text = toAnswerText(value);
  if (text === null || text === '') return false;
  const maximumLength = text.startsWith('-') ? 6 : 5;
  return (
    text.length <= maximumLength
    && SAT_STUDENT_RESPONSE.test(text)
    && parseExactRational(text) !== null
  );
};

const inferQuestionType = (question) => {
  if (question?.questionType) return question.questionType;
  return Array.isArray(question?.options) && question.options.length > 0
    ? 'multiple-choice'
    : 'user-input';
};

/**
 * Scores one practice-exam response using the question's canonical key and,
 * for student-produced responses, any explicit acceptedAnswers.
 */
export const isPracticeExamAnswerCorrect = (question, studentAnswer) => {
  if (!question || studentAnswer === undefined || studentAnswer === null) return false;

  const studentText = toAnswerText(studentAnswer);
  if (studentText === null || studentText === '') return false;

  if (inferQuestionType(question) === 'multiple-choice') {
    const storedKey = question.correctAnswer !== undefined
      ? question.correctAnswer
      : question.answer;

    if (storedKey === undefined || storedKey === null) return false;

    const correctOption = resolveMultipleChoiceKey(storedKey, question.options);
    const correctOptionText = toAnswerText(correctOption);
    return correctOptionText !== null && studentText === correctOptionText;
  }

  if (
    ['number', 'fraction'].includes(question.inputType)
    && !isValidSatStudentResponse(studentText)
  ) {
    return false;
  }

  const acceptedAnswers = [];
  if (question.correctAnswer !== undefined && question.correctAnswer !== null) {
    acceptedAnswers.push(question.correctAnswer);
  } else if (question.answer !== undefined && question.answer !== null) {
    acceptedAnswers.push(question.answer);
  }

  if (Array.isArray(question.acceptedAnswers)) {
    acceptedAnswers.push(...question.acceptedAnswers);
  }

  return acceptedAnswers.some((acceptedAnswer) => (
    areStudentResponsesEquivalent(studentAnswer, acceptedAnswer)
  ));
};
