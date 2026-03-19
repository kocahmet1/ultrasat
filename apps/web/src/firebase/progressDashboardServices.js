import { collection, getDocs } from 'firebase/firestore';
import { getConceptsBySubcategory } from './conceptServices';
import { db } from './config';
import { getSubcategoryProgress } from '../utils/progressUtils';
import { createEmptyDetailedProgress } from '../utils/progressDashboardUtils';

export const getUserConceptMastery = async (userId) => {
  const progressCollection = collection(db, 'users', userId, 'progress');
  const progressSnapshot = await getDocs(progressCollection);

  const masteryData = {};
  let unmasteredCount = 0;

  progressSnapshot.forEach((progressDoc) => {
    const subcategoryId = progressDoc.id;
    const progressData = progressDoc.data();

    if (!progressData.conceptMastery) {
      return;
    }

    masteryData[subcategoryId] = progressData.conceptMastery;

    Object.values(progressData.conceptMastery).forEach((mastered) => {
      if (!mastered) {
        unmasteredCount += 1;
      }
    });
  });

  return {
    masteryData,
    unmasteredCount,
  };
};

export const getConceptsForSubcategories = async (allSubcategories = []) => {
  const conceptEntries = await Promise.all(
    allSubcategories.map(async (subcategory) => {
      const concepts = await getConceptsBySubcategory(subcategory.id);
      if (!concepts.length) {
        return null;
      }

      return [subcategory.id, concepts];
    }),
  );

  return conceptEntries
    .filter(Boolean)
    .reduce((accumulator, [subcategoryId, concepts]) => {
      accumulator[subcategoryId] = concepts;
      return accumulator;
    }, {});
};

export const getDetailedProgressForSubcategories = async (userId, allSubcategories = []) => {
  const progressEntries = await Promise.all(
    allSubcategories.map(async (subcategory) => {
      const progress = await getSubcategoryProgress(userId, subcategory.id);
      const normalizedProgress = progress?.exists
        ? {
            ...createEmptyDetailedProgress(subcategory.id),
            ...progress,
            id: progress.id || subcategory.id,
          }
        : createEmptyDetailedProgress(subcategory.id);

      return [subcategory.id, normalizedProgress];
    }),
  );

  return Object.fromEntries(progressEntries);
};
