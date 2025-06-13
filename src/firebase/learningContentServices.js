/**
 * Learning Content Services
 * Manages research-based learning content for subcategory learning pages
 */

import { db } from './config';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';

/**
 * Gets learning content for a subcategory
 * @param {string} subcategoryId - The subcategory ID (kebab-case)
 * @returns {Promise<Object>} - Learning content object
 */
export const getLearningContent = async (subcategoryId) => {
  try {
    const contentDoc = await getDoc(doc(db, 'learningContent', subcategoryId));
    
    if (contentDoc.exists()) {
      return contentDoc.data();
    } else {
      // Return default content template if none exists
      return getDefaultLearningContent(subcategoryId);
    }
  } catch (error) {
    console.error('Error fetching learning content:', error);
    throw error;
  }
};

/**
 * Saves learning content for a subcategory
 * @param {string} subcategoryId - The subcategory ID
 * @param {Object} content - The learning content object
 * @returns {Promise<void>}
 */
export const saveLearningContent = async (subcategoryId, content) => {
  try {
    const contentRef = doc(db, 'learningContent', subcategoryId);
    
    await setDoc(contentRef, {
      ...content,
      subcategoryId,
      lastUpdated: serverTimestamp()
    });
  } catch (error) {
    console.error('Error saving learning content:', error);
    throw error;
  }
};

/**
 * Gets default learning content template
 * @param {string} subcategoryId - The subcategory ID
 * @returns {Object} - Default content structure
 */
const getDefaultLearningContent = (subcategoryId) => {
  return {
    overview: `
      <h3>About This Question Type</h3>
      <p>This section covers ${subcategoryId.replace(/-/g, ' ')} questions on the Digital SAT.</p>
      <p><em>Comprehensive learning content is being prepared for this subcategory.</em></p>
    `,
    keyStrategies: [
      "Detailed strategies will be added based on research",
      "Proven techniques for this question type",
      "Time-management approaches"
    ],
    commonMistakes: [
      "Common errors students make will be documented",
      "Misconceptions to avoid",
      "Typical pitfalls and how to prevent them"
    ],
    studyTips: [
      "Effective study methods for this topic",
      "Practice recommendations",
      "Connections to other SAT skills"
    ],
    difficulty: "varies",
    estimatedStudyTime: "2-3 hours",
    lastUpdated: new Date()
  };
};

/**
 * Updates specific sections of learning content
 * @param {string} subcategoryId - The subcategory ID
 * @param {Object} updates - Partial content updates
 * @returns {Promise<void>}
 */
export const updateLearningContentSection = async (subcategoryId, updates) => {
  try {
    const contentRef = doc(db, 'learningContent', subcategoryId);
    
    await updateDoc(contentRef, {
      ...updates,
      lastUpdated: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating learning content:', error);
    throw error;
  }
}; 