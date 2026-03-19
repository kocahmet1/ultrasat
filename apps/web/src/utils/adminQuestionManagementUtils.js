import {
  getKebabCaseFromAnyFormat,
  getSubcategoryIdFromString
} from './subcategoryConstants';

export function normalizeAdminQuestion(questionId, questionData) {
  const normalizedQuestion = {
    id: questionId,
    ...questionData
  };

  if (questionData.subCategory) {
    normalizedQuestion.subcategoryId = getSubcategoryIdFromString(questionData.subCategory);
  }

  if (questionData.createdAt && typeof questionData.createdAt.toDate === 'function') {
    normalizedQuestion.createdAt = questionData.createdAt.toDate();
  }

  return normalizedQuestion;
}

export function sortQuestionsByCreatedAt(questions) {
  return [...questions].sort((leftQuestion, rightQuestion) => {
    if (!leftQuestion.createdAt && !rightQuestion.createdAt) {
      return 0;
    }

    if (!leftQuestion.createdAt) {
      return 1;
    }

    if (!rightQuestion.createdAt) {
      return -1;
    }

    return rightQuestion.createdAt - leftQuestion.createdAt;
  });
}

export function buildUniqueSubcategoryOptions({
  allSubcategories,
  questions,
  subcategoriesLoading
}) {
  if (subcategoriesLoading || !allSubcategories?.length || !questions?.length) {
    return [{ value: 'all', display: 'All Subcategories' }];
  }

  const kebabToDisplayNameMap = new Map();
  const numericToDisplayNameMap = new Map();

  allSubcategories.forEach(subcategory => {
    if (!subcategory?.name) {
      return;
    }

    if (subcategory.id !== undefined && subcategory.id !== null) {
      kebabToDisplayNameMap.set(String(subcategory.id), subcategory.name);
    }

    const numericId = getSubcategoryIdFromString(subcategory.id);
    if (numericId !== null) {
      numericToDisplayNameMap.set(String(numericId), subcategory.name);
    }
  });

  const derivedOptions = new Map();

  questions.forEach(question => {
    if (!question) {
      return;
    }

    let subcategoryIdentifier = null;
    let displayName = null;

    if (question.subcategoryId !== undefined && question.subcategoryId !== null) {
      subcategoryIdentifier = String(question.subcategoryId);
      displayName = numericToDisplayNameMap.get(subcategoryIdentifier);
    }

    if (!displayName && question.subcategory) {
      subcategoryIdentifier = String(question.subcategory);
      displayName = kebabToDisplayNameMap.get(subcategoryIdentifier);
    }

    if (!displayName && question.subCategory) {
      const numericId = getSubcategoryIdFromString(question.subCategory);
      if (numericId !== null) {
        subcategoryIdentifier = String(numericId);
        displayName = numericToDisplayNameMap.get(subcategoryIdentifier);
      }
    }

    if (subcategoryIdentifier && displayName && !derivedOptions.has(subcategoryIdentifier)) {
      derivedOptions.set(subcategoryIdentifier, {
        value: subcategoryIdentifier,
        display: displayName
      });
    }
  });

  const sortedOptions = Array.from(derivedOptions.values()).sort((leftOption, rightOption) =>
    leftOption.display.localeCompare(rightOption.display)
  );

  return [{ value: 'all', display: 'All Subcategories' }, ...sortedOptions];
}

export function filterAdminQuestions({
  difficultyFilter,
  questions,
  searchTerm,
  subcategoryFilter
}) {
  let filteredQuestions = [...questions];

  if (searchTerm) {
    const normalizedSearch = searchTerm.toLowerCase();
    filteredQuestions = filteredQuestions.filter(question =>
      question.text.toLowerCase().includes(normalizedSearch) ||
      (question.id && question.id.toLowerCase().includes(normalizedSearch))
    );
  }

  if (subcategoryFilter !== 'all') {
    filteredQuestions = filteredQuestions.filter(question => {
      const filterNumericId = getSubcategoryIdFromString(subcategoryFilter);

      if (
        question.subcategoryId &&
        filterNumericId &&
        question.subcategoryId === filterNumericId
      ) {
        return true;
      }

      if (question.subcategory && question.subcategory === subcategoryFilter) {
        return true;
      }

      if (question.subCategory) {
        const normalizedQuestionId = getSubcategoryIdFromString(question.subCategory);
        if (normalizedQuestionId && filterNumericId && normalizedQuestionId === filterNumericId) {
          return true;
        }
      }

      if (question.subcategory) {
        const normalizedKebabCase = getKebabCaseFromAnyFormat(question.subcategory);
        if (normalizedKebabCase === subcategoryFilter) {
          return true;
        }
      }

      return false;
    });
  }

  if (difficultyFilter !== 'all') {
    filteredQuestions = filteredQuestions.filter(
      question => question.difficulty === difficultyFilter
    );
  }

  return filteredQuestions;
}

function formatUsageContextValue(usageContext) {
  if (usageContext === undefined) {
    return 'undefined';
  }

  if (usageContext === null) {
    return 'null';
  }

  if (usageContext === '') {
    return 'empty string';
  }

  return `"${usageContext}"`;
}

function getQuestionCreatedAtDate(question) {
  if (!question.createdAt) {
    return null;
  }

  return question.createdAt.toDate ? question.createdAt.toDate() : new Date(question.createdAt);
}

export function buildQuestionContextDiagnosticReport(allQuestions) {
  const contextAnalysis = {
    general: [],
    exam: [],
    undefined: [],
    null: [],
    empty: [],
    other: []
  };

  allQuestions.forEach(question => {
    if (question.usageContext === 'general') {
      contextAnalysis.general.push(question.id);
    } else if (question.usageContext === 'exam') {
      contextAnalysis.exam.push(question.id);
    } else if (question.usageContext === undefined) {
      contextAnalysis.undefined.push(question.id);
    } else if (question.usageContext === null) {
      contextAnalysis.null.push(question.id);
    } else if (question.usageContext === '') {
      contextAnalysis.empty.push(question.id);
    } else {
      contextAnalysis.other.push({ id: question.id, context: question.usageContext });
    }
  });

  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);

  const recentQuestions = allQuestions.filter(question => {
    const createdAtDate = getQuestionCreatedAtDate(question);
    return createdAtDate ? createdAtDate > oneDayAgo : false;
  });

  const quizSystemWouldReject = allQuestions.filter(
    question => !question.usageContext || question.usageContext === 'exam'
  );

  let report = 'QUESTION CONTEXT DIAGNOSTIC REPORT\n\n';
  report += `Total Questions: ${allQuestions.length}\n\n`;
  report += 'CONTEXT BREAKDOWN:\n';
  report += `- General: ${contextAnalysis.general.length} questions\n`;
  report += `- Exam: ${contextAnalysis.exam.length} questions\n`;
  report += `- Undefined: ${contextAnalysis.undefined.length} questions\n`;
  report += `- Null: ${contextAnalysis.null.length} questions\n`;
  report += `- Empty string: ${contextAnalysis.empty.length} questions\n`;
  report += `- Other values: ${contextAnalysis.other.length} questions\n\n`;

  if (contextAnalysis.other.length > 0) {
    report += 'OTHER VALUES FOUND:\n';
    contextAnalysis.other.forEach(item => {
      report += `- ${item.id}: "${item.context}"\n`;
    });
    report += '\n';
  }

  report += `RECENT QUESTIONS (Last 24h): ${recentQuestions.length}\n`;
  if (recentQuestions.length > 0) {
    report += 'Recent question contexts:\n';
    recentQuestions.slice(0, 10).forEach(question => {
      report += `- ${question.id}: ${formatUsageContextValue(question.usageContext)}\n`;
    });

    if (recentQuestions.length > 10) {
      report += `... and ${recentQuestions.length - 10} more\n`;
    }
  }

  report += `\nQUESTIONS QUIZ SYSTEM WOULD REJECT: ${quizSystemWouldReject.length}\n`;
  report += "(Questions with no usageContext or usageContext === 'exam')\n";

  if (quizSystemWouldReject.length > 0 && quizSystemWouldReject.length <= 20) {
    report += 'Rejected question IDs:\n';
    quizSystemWouldReject.forEach(question => {
      report += `- ${question.id}: ${formatUsageContextValue(question.usageContext)}\n`;
    });
  }

  return report;
}
