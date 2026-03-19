import { db } from './config';
import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import { getKebabCaseFromAnyFormat } from '../utils/subcategoryConstants';
import { getResourcesByMainCategory, getResourcesBySubcategory } from './studyResourceServices';
import { getUserSkillStats } from './userProgressServices';

const buildPracticeRecommendations = (
  subCategoryStats,
  weakMainCategories,
  moderateMainCategories,
  limitCount = 5,
) => {
  const rankedSubcategories = Object.values(subCategoryStats)
    .filter((stat) => stat && stat.category)
    .sort((a, b) => a.accuracyRate - b.accuracyRate);

  const recommendations = [];
  const seen = new Set();

  const addRecommendation = (stat, priority, reason) => {
    const subcategoryId = getKebabCaseFromAnyFormat(stat.category);
    if (!subcategoryId || seen.has(subcategoryId)) return;

    recommendations.push({
      subcategoryId,
      priority,
      reason,
      accuracyRate: Math.round(stat.accuracyRate || 0),
      mainCategory: stat.mainCategory || null,
    });
    seen.add(subcategoryId);
  };

  rankedSubcategories
    .filter((stat) => stat.accuracyRate < 70)
    .forEach((stat) => {
      const reason = weakMainCategories.includes(stat.mainCategory)
        ? `Weak ${stat.mainCategory} performance makes this a high-priority SmartQuiz target.`
        : 'This subcategory has the lowest recent accuracy and should be practiced first.';
      addRecommendation(stat, 'high', reason);
    });

  rankedSubcategories
    .filter((stat) => stat.accuracyRate >= 70 && stat.accuracyRate <= 85)
    .forEach((stat) => {
      const reason = moderateMainCategories.includes(stat.mainCategory)
        ? `You are close to mastery in ${stat.mainCategory}; another SmartQuiz here can push it into the strong range.`
        : 'This subcategory is close to strong performance and is a good SmartQuiz follow-up.';
      addRecommendation(stat, 'medium', reason);
    });

  return recommendations.slice(0, limitCount);
};

export const getUserAttemptHistory = async (userId) => {
  try {
    const q = query(
      collection(db, 'questionAttempts'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(100),
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((snapshot) => ({
      id: snapshot.id,
      ...snapshot.data(),
    }));
  } catch (error) {
    console.error('Error getting user attempt history:', error);
    return [];
  }
};

export const generateUserRecommendations = async (userId) => {
  try {
    const userSkillStats = await getUserSkillStats(userId);
    const attemptHistory = await getUserAttemptHistory(userId);

    const categoryAttemptCounts = {};
    const subcategoryAttemptCounts = {};
    const mainCategoryStats = {};
    const subCategoryStats = {};

    attemptHistory.forEach((attempt) => {
      if (attempt.mainSkillCategory) {
        categoryAttemptCounts[attempt.mainSkillCategory] =
          (categoryAttemptCounts[attempt.mainSkillCategory] || 0) + 1;
      }

      if (attempt.subSkillCategory) {
        subcategoryAttemptCounts[attempt.subSkillCategory] =
          (subcategoryAttemptCounts[attempt.subSkillCategory] || 0) + 1;
      }
    });

    userSkillStats.forEach((stat) => {
      if (stat.mainSkillCategory) {
        if (!mainCategoryStats[stat.mainSkillCategory]) {
          mainCategoryStats[stat.mainSkillCategory] = {
            category: stat.mainSkillCategory,
            totalQuestions: 0,
            correctAnswers: 0,
            accuracyRate: 0,
          };
        }

        mainCategoryStats[stat.mainSkillCategory].totalQuestions += stat.totalQuestions;
        mainCategoryStats[stat.mainSkillCategory].correctAnswers += stat.correctAnswers;
      }

      if (stat.subSkillCategory) {
        if (!subCategoryStats[stat.subSkillCategory]) {
          subCategoryStats[stat.subSkillCategory] = {
            category: stat.subSkillCategory,
            totalQuestions: 0,
            correctAnswers: 0,
            accuracyRate: 0,
            mainCategory: stat.mainSkillCategory,
          };
        }

        subCategoryStats[stat.subSkillCategory].totalQuestions += stat.totalQuestions;
        subCategoryStats[stat.subSkillCategory].correctAnswers += stat.correctAnswers;
      }
    });

    Object.values(mainCategoryStats).forEach((stat) => {
      stat.accuracyRate = stat.totalQuestions > 0
        ? (stat.correctAnswers / stat.totalQuestions) * 100
        : 0;
    });

    Object.values(subCategoryStats).forEach((stat) => {
      stat.accuracyRate = stat.totalQuestions > 0
        ? (stat.correctAnswers / stat.totalQuestions) * 100
        : 0;
    });

    const weakMainCategories = Object.values(mainCategoryStats)
      .filter((stat) => stat.accuracyRate < 70 && stat.totalQuestions >= 3)
      .map((stat) => stat.category);

    const moderateMainCategories = Object.values(mainCategoryStats)
      .filter((stat) => stat.accuracyRate >= 70 && stat.accuracyRate <= 85 && stat.totalQuestions >= 3)
      .map((stat) => stat.category);

    const weakSubcategories = Object.values(subCategoryStats)
      .filter((stat) => stat.accuracyRate < 70 && stat.totalQuestions >= 2)
      .map((stat) => stat.category);

    const moderateSubcategories = Object.values(subCategoryStats)
      .filter((stat) => stat.accuracyRate >= 70 && stat.accuracyRate <= 85 && stat.totalQuestions >= 2)
      .map((stat) => stat.category);

    const hasEnoughMainCategoryData = Object.values(mainCategoryStats).some(
      (stat) => stat.totalQuestions >= 3,
    );
    const hasEnoughSubCategoryData = Object.values(subCategoryStats).some(
      (stat) => stat.totalQuestions >= 2,
    );

    const recommendedPracticeSubcategories = buildPracticeRecommendations(
      subCategoryStats,
      weakMainCategories,
      moderateMainCategories,
    );

    const recommendedResources = [];

    if (hasEnoughSubCategoryData && weakSubcategories.length > 0) {
      for (const subcategory of weakSubcategories) {
        const resources = await getResourcesBySubcategory(subcategory);
        recommendedResources.push(...resources.slice(0, 1).map((resource) => resource.id));
      }
    }

    if (recommendedResources.length < 3 && hasEnoughMainCategoryData && weakMainCategories.length > 0) {
      for (const category of weakMainCategories) {
        const resources = await getResourcesByMainCategory(category);
        recommendedResources.push(...resources.slice(0, 1).map((resource) => resource.id));
      }
    }

    const finalRecommendedResources = [...new Set(recommendedResources)].slice(0, 5);

    let feedback = 'Based on your performance, ';

    if (hasEnoughSubCategoryData && weakSubcategories.length > 0) {
      feedback += `we recommend focusing on improving your skills in these specific areas: ${weakSubcategories.join(', ')}. `;
    } else if (hasEnoughMainCategoryData && weakMainCategories.length > 0) {
      feedback += `we recommend focusing on improving your skills in these areas: ${weakMainCategories.join(', ')}. `;
    } else if (hasEnoughSubCategoryData && moderateSubcategories.length > 0) {
      feedback += `you're doing well but could improve in these specific areas: ${moderateSubcategories.join(', ')}. `;
    } else if (hasEnoughMainCategoryData && moderateMainCategories.length > 0) {
      feedback += `you're doing well but could improve in these areas: ${moderateMainCategories.join(', ')}. `;
    } else {
      feedback += `you're performing very well across all skills! Consider challenging yourself with more advanced material. `;
    }

    if (!hasEnoughMainCategoryData && !hasEnoughSubCategoryData) {
      feedback =
        'Complete more practice questions to receive personalized recommendations based on your performance patterns.';
    }

    const recommendationsData = {
      userId,
      weakMainCategories,
      moderateMainCategories,
      weakSubcategories,
      moderateSubcategories,
      recommendedPracticeSubcategories,
      recommendedResources: finalRecommendedResources,
      hasEnoughMainCategoryData,
      hasEnoughSubCategoryData,
      feedback,
      generatedAt: serverTimestamp(),
    };

    let recommendationId = null;

    try {
      const recommendationsRef = await addDoc(collection(db, 'userRecommendations'), recommendationsData);
      recommendationId = recommendationsRef.id;
    } catch (persistError) {
      console.warn(
        'Persisting user recommendations from the client is disabled; returning an ephemeral result instead.',
        persistError,
      );
    }

    return {
      id: recommendationId,
      ...recommendationsData,
    };
  } catch (error) {
    console.error('Error generating user recommendations:', error);
    throw error;
  }
};

export const getLatestUserRecommendations = async (userId) => {
  try {
    const q = query(
      collection(db, 'userRecommendations'),
      where('userId', '==', userId),
      orderBy('generatedAt', 'desc'),
      limit(1),
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    return {
      id: querySnapshot.docs[0].id,
      ...querySnapshot.docs[0].data(),
    };
  } catch (error) {
    console.error('Error getting latest user recommendations:', error);
    throw error;
  }
};
