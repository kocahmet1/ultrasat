import {
  getSubcategoryCategory,
  getSubcategoryIdFromString,
  getSubcategorySubject,
} from './subcategoryConstants';

const SUBCATEGORY_WEIGHTS = {
  1: 4.0,
  2: 4.0,
  3: 4.0,
  4: 4.0,
  5: 4.0,
  6: 4.0,
  7: 4.0,
  8: 4.0,
  9: 4.0,
  10: 4.0,
  11: 2.1,
  12: 2.1,
  13: 2.1,
  14: 2.1,
  15: 2.1,
  16: 2.1,
  17: 2.1,
  18: 2.1,
  19: 2.1,
  20: 2.1,
  21: 2.1,
  22: 2.1,
  23: 2.1,
  24: 2.1,
  25: 2.1,
  26: 2.1,
  27: 2.1,
  28: 2.1,
  29: 2.1,
};

const SUBJECT_MAPPING = {
  1: 1,
  2: 1,
  3: 1,
  4: 1,
  5: 1,
  6: 1,
  7: 1,
  8: 1,
  9: 1,
  10: 1,
  11: 2,
  12: 2,
  13: 2,
  14: 2,
  15: 2,
  16: 2,
  17: 2,
  18: 2,
  19: 2,
  20: 2,
  21: 2,
  22: 2,
  23: 2,
  24: 2,
  25: 2,
  26: 2,
  27: 2,
  28: 2,
  29: 2,
};

const MATH_KEYWORDS = [
  'circles',
  'volume',
  'area',
  'triangles',
  'geometry',
  'linear-equations',
  'linear-functions',
  'systems',
  'equations',
  'inequalities',
  'nonlinear',
  'expressions',
  'algebra',
  'ratios',
  'rates',
  'proportions',
  'percentages',
  'statistics',
  'probability',
  'data',
  'inference',
  'claims',
];

const MATH_IDENTIFIERS = [
  'circles',
  'area',
  'volume',
  'linear-equations',
  'linear-functions',
  'linear-inequalities',
  'nonlinear',
  'triangles',
  'angles',
];

export const createEmptyDetailedProgress = (subcategoryId = null) => ({
  id: subcategoryId,
  exists: false,
  level: 1,
  mastered: false,
  askedQuestions: [],
  totalQuestionsAnswered: 0,
  accuracyLast10: 0,
  last10QuestionResultsCount: 0,
  last10QuestionResults: [],
  accuracy: 0,
  totalQuestions: 0,
  attempts: 0,
});

export const getPerformanceCategoryForLast10 = (accuracyLast10, last10QuestionResultsCount) => {
  if (last10QuestionResultsCount === 0) {
    return 'weak';
  }

  if (accuracyLast10 >= 80) {
    return 'strong';
  }

  if (accuracyLast10 >= 50) {
    return 'moderate';
  }

  return 'weak';
};

export const calculateSATScoreFromDetailedProgress = (detailedProgressData = {}) => {
  let totalWeight = 0;
  let readingWritingScore = 0;
  let mathScore = 0;
  let readingWritingWeight = 0;
  let mathWeight = 0;
  let subcategoriesWithData = 0;

  const breakdown = {
    readingWriting: { score: 0, subcategories: 0 },
    math: { score: 0, subcategories: 0 },
  };

  Object.entries(detailedProgressData).forEach(([subcategoryName, data]) => {
    const totalQuestionsAnswered = data?.totalQuestionsAnswered || 0;
    const last10QuestionResultsCount = data?.last10QuestionResultsCount || 0;

    if (totalQuestionsAnswered === 0 && last10QuestionResultsCount === 0) {
      return;
    }

    const subcategoryId = getSubcategoryIdFromString(subcategoryName);
    if (!subcategoryId || !SUBCATEGORY_WEIGHTS[subcategoryId]) {
      return;
    }

    const accuracy = data?.accuracyLast10 || 0;
    const weight = SUBCATEGORY_WEIGHTS[subcategoryId];
    const subject = SUBJECT_MAPPING[subcategoryId];
    const scoreContribution = (accuracy / 100) * weight;

    totalWeight += weight;
    subcategoriesWithData += 1;

    if (subject === 1) {
      readingWritingScore += scoreContribution;
      readingWritingWeight += weight;
      breakdown.readingWriting.subcategories += 1;
      return;
    }

    mathScore += scoreContribution;
    mathWeight += weight;
    breakdown.math.subcategories += 1;
  });

  if (totalWeight === 0) {
    return {
      estimatedScore: 0,
      confidence: 0,
      breakdown,
      subcategoriesWithData: 0,
    };
  }

  const readingWritingEstimate = readingWritingWeight > 0
    ? Math.round(200 + (readingWritingScore / readingWritingWeight) * 600)
    : 200;
  const mathEstimate = mathWeight > 0
    ? Math.round(200 + (mathScore / mathWeight) * 600)
    : 200;
  const estimatedScore = readingWritingEstimate + mathEstimate;

  const totalSubcategories = 29;
  const dataCoverage = subcategoriesWithData / totalSubcategories;
  const higherSectionCount = Math.max(
    breakdown.readingWriting.subcategories,
    breakdown.math.subcategories,
    1,
  );
  const lowerSectionCount = Math.min(
    breakdown.readingWriting.subcategories,
    breakdown.math.subcategories,
  );
  const sectionBalance = lowerSectionCount / higherSectionCount;
  const confidence = Math.min(100, Math.round((dataCoverage * 70) + (sectionBalance * 30)));

  breakdown.readingWriting.score = readingWritingEstimate;
  breakdown.math.score = mathEstimate;

  return {
    estimatedScore: Math.max(400, Math.min(1600, estimatedScore)),
    confidence,
    breakdown,
    subcategoriesWithData,
  };
};

const createEmptyCategorizedSubcategories = () => ({
  'reading-writing': {
    title: 'Reading & Writing',
    categories: {},
  },
  math: {
    title: 'Math',
    categories: {},
  },
});

const isMathSubcategory = (subcategory) => {
  const cleanId = (subcategory?.id || '').toLowerCase().trim();

  if (MATH_IDENTIFIERS.some((term) => cleanId.includes(term))) {
    return true;
  }

  if (MATH_KEYWORDS.some((keyword) => cleanId.includes(keyword))) {
    return true;
  }

  const numericId = parseInt(subcategory?.numericId || subcategory?.id, 10);
  if (!Number.isNaN(numericId) && numericId >= 11) {
    return true;
  }

  const subjectName = getSubcategorySubject(subcategory?.id) || '';
  return subjectName.toLowerCase().includes('math');
};

export const buildCategorizedSubcategories = (
  allSubcategories = [],
  detailedProgress = {},
  subcategoriesLoading = false,
) => {
  if (subcategoriesLoading || !allSubcategories.length || Object.keys(detailedProgress).length === 0) {
    return createEmptyCategorizedSubcategories();
  }

  const result = createEmptyCategorizedSubcategories();

  allSubcategories.forEach((subcategory) => {
    const sectionKey = isMathSubcategory(subcategory) ? 'math' : 'reading-writing';
    const mainCategoryName = getSubcategoryCategory(subcategory.id) || 'Uncategorized';

    if (!result[sectionKey].categories[mainCategoryName]) {
      result[sectionKey].categories[mainCategoryName] = {
        title: mainCategoryName,
        subcategories: [],
      };
    }

    const stats = detailedProgress[subcategory.id] || createEmptyDetailedProgress(subcategory.id);

    result[sectionKey].categories[mainCategoryName].subcategories.push({
      id: subcategory.id,
      name: subcategory.name,
      stats: {
        totalQuestionsAnswered: stats.totalQuestionsAnswered || 0,
        accuracyLast10: stats.accuracyLast10 || 0,
        last10QuestionResultsCount: stats.last10QuestionResultsCount || 0,
      },
    });
  });

  Object.keys(result).forEach((sectionKey) => {
    const sortedCategories = {};

    Object.keys(result[sectionKey].categories)
      .sort()
      .forEach((categoryKey) => {
        sortedCategories[categoryKey] = result[sectionKey].categories[categoryKey];
        sortedCategories[categoryKey].subcategories.sort((a, b) => a.name.localeCompare(b.name));
      });

    result[sectionKey].categories = sortedCategories;
  });

  return result;
};

export const getProgressDashboardSummary = (detailedProgress = {}) => {
  let totalQuestionsAnswered = 0;
  let totalCorrectEstimate = 0;
  const coveredIds = new Set();

  Object.entries(detailedProgress).forEach(([subcategoryId, stat]) => {
    const answeredCount = stat?.totalQuestionsAnswered || 0;
    totalQuestionsAnswered += answeredCount;
    totalCorrectEstimate += answeredCount * ((stat?.accuracyLast10 || 0) / 100);

    if (answeredCount > 0) {
      coveredIds.add(subcategoryId);
    }
  });

  return {
    totalQuestionsAnswered,
    overallAccuracy: totalQuestionsAnswered > 0
      ? Number(((totalCorrectEstimate / totalQuestionsAnswered) * 100).toFixed(0))
      : 0,
    subcategoriesCovered: coveredIds.size,
  };
};
