/**
 * Question Services for Learning Pages
 * Provides functions for fetching sample questions to display in subcategory learning pages
 */

import { db } from './config';
import {
  collection,
  query,
  where,
  getDocs,
  limit,
  orderBy
} from 'firebase/firestore';

/**
 * Gets sample questions for a subcategory learning page
 * @param {string} subcategoryId - The subcategory ID (kebab-case)
 * @param {number} maxQuestions - Maximum number of questions to return (default: 5)
 * @returns {Promise<Array>} - Array of sample question objects
 */
export const getSampleQuestionsForSubcategory = async (subcategoryId, maxQuestions = 5) => {
  try {
    const questionsRef = collection(db, 'questions');
    const q = query(
      questionsRef,
      where('subcategory', '==', subcategoryId),
      limit(maxQuestions)
    );
    
    const questionsSnapshot = await getDocs(q);
    const questions = [];
    
    questionsSnapshot.forEach(doc => {
      const questionData = doc.data();
      questions.push({
        id: doc.id,
        text: questionData.text,
        options: questionData.options,
        correctAnswer: questionData.correctAnswer,
        explanation: questionData.explanation,
        difficulty: questionData.difficulty,
        source: questionData.source
      });
    });
    
    return questions;
  } catch (error) {
    console.error('Error fetching sample questions:', error);
    throw error;
  }
};

/**
 * Gets questions by difficulty for a subcategory
 * @param {string} subcategoryId - The subcategory ID
 * @param {number} difficulty - Difficulty level (1-3)
 * @param {number} maxQuestions - Maximum number of questions to return
 * @returns {Promise<Array>} - Array of questions
 */
export const getQuestionsByDifficulty = async (subcategoryId, difficulty, maxQuestions = 3) => {
  try {
    const questionsRef = collection(db, 'questions');
    const q = query(
      questionsRef,
      where('subcategory', '==', subcategoryId),
      where('difficulty', '==', difficulty),
      limit(maxQuestions)
    );
    
    const questionsSnapshot = await getDocs(q);
    const questions = [];
    
    questionsSnapshot.forEach(doc => {
      const questionData = doc.data();
      questions.push({
        id: doc.id,
        text: questionData.text,
        options: questionData.options,
        correctAnswer: questionData.correctAnswer,
        explanation: questionData.explanation,
        difficulty: questionData.difficulty
      });
    });
    
    return questions;
  } catch (error) {
    console.error('Error fetching questions by difficulty:', error);
    throw error;
  }
};

/**
 * Gets a diverse set of sample questions (easy, medium, hard) for learning
 * @param {string} subcategoryId - The subcategory ID
 * @returns {Promise<Array>} - Array of questions with mixed difficulties
 */
export const getDiverseSampleQuestions = async (subcategoryId) => {
  try {
    const allQuestions = [];
    
    // Get 2 easy, 2 medium, 1 hard question
    const easyQuestions = await getQuestionsByDifficulty(subcategoryId, 1, 2);
    const mediumQuestions = await getQuestionsByDifficulty(subcategoryId, 2, 2);
    const hardQuestions = await getQuestionsByDifficulty(subcategoryId, 3, 1);
    
    allQuestions.push(...easyQuestions, ...mediumQuestions, ...hardQuestions);
    
    return allQuestions;
  } catch (error) {
    console.error('Error fetching diverse sample questions:', error);
    throw error;
  }
}; 