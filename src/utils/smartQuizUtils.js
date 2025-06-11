// utils/smartQuizUtils.js
// --------------------------------------------------------------
// SmartQuiz Utility Module
// --------------------------------------------------------------
// This implements all back-end (Firestore) transactions required by the
// new SmartQuiz system.  The API surface is intentionally small so the
// UI can remain thin.  It deliberately does NOT touch any of the legacy
// adaptive-quiz collections.
// --------------------------------------------------------------

import {
  collection,
  doc,
  addDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
  query,
  where,
  limit,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { getQuestionsBySubcategory } from '../firebase/services';
import {
  getSubcategoryProgress,
  updateSubcategoryProgress,
} from './progressUtils';
import { getKebabCaseFromAnyFormat } from './subcategoryConstants';
import { updateUserStatsCache } from '../firebase/rankingServices';
import { 
  getConceptAssociationForQuestion, 
  updateConceptMastery 
} from '../firebase/predefinedConceptsServices';
import { quizQueue, progressQueue, monitoredOperation } from './concurrencyUtils';

// COLLECTION CONSTANTS --------------------------------------------------------
export const SMARTQUIZ_COLLECTION = 'smartQuizzes';

// PUBLIC CONSTANTS -----------------------------------------------------------
export const QUESTIONS_PER_QUIZ = 5;
export const DIFFICULTY_FOR_LEVEL = {
  1: 'easy',
  2: 'medium',
  3: 'hard',
};

// HELPERS --------------------------------------------------------------------
/**
 * Randomly sample `n` items from an array (without replacement).
 */
function sampleN(arr, n) {
  const copy = [...arr];
  const result = [];
  while (copy.length && result.length < n) {
    const idx = Math.floor(Math.random() * copy.length);
    result.push(copy.splice(idx, 1)[0]);
  }
  return result;
}

/** Determine quiz level from accuracy if no prior progress exists. */
export function inferLevelFromAccuracy(accuracyRate = 0) {
  if (accuracyRate >= 80) return 3; // >= 80% is Level 3
  if (accuracyRate >= 50) return 2; // 50% to 79% is Level 2
  return 1; // < 50% is Level 1
}

// CORE API -------------------------------------------------------------------
/**
 * Get the users current SmartQuiz level for a subcategory.
 * Falls back to accuracy-based heuristic when no progress doc exists.
 */
export const getUserLevel = async (
  userId,
  subcategoryId,
  accuracyRate = null,
) => {
  console.log(`[getUserLevel] Called with: userId=${userId}, subcategoryId=${subcategoryId}, accuracyRate=${accuracyRate}`);
  const progress = await getSubcategoryProgress(userId, subcategoryId);
  console.log('[getUserLevel] Result from getSubcategoryProgress:', JSON.stringify(progress, null, 2));

  if (progress && progress.exists) {
    const levelFromProgress = progress.level || 1;
    console.log(`[getUserLevel] Progress exists. Level from progress: ${progress.level}, effective level: ${levelFromProgress}`);
    return levelFromProgress;
  }

  if (accuracyRate !== null && accuracyRate !== undefined) {
    const inferredLevel = inferLevelFromAccuracy(accuracyRate);
    console.log(`[getUserLevel] No existing progress. Using accuracyRate ${accuracyRate}. Inferred level: ${inferredLevel}`);
    return inferredLevel;
  }

  console.log('[getUserLevel] No existing progress and no/invalid accuracyRate. Defaulting to level 1.');
  return 1;
};

/**
 * Fetch a pool of candidate questions then sample `QUESTIONS_PER_QUIZ`.
 */
async function getQuizQuestions(subcategoryId, level, excludeIds = []) {
  const difficulty = DIFFICULTY_FOR_LEVEL[level] || 'easy';
  
  // First try to get questions with the specific difficulty
  let raw = await getQuestionsBySubcategory(subcategoryId, difficulty, 50);
  console.log(`[getQuizQuestions] Found ${raw.length} questions with difficulty '${difficulty}' for subcategory '${subcategoryId}'`);
  
  // If no questions found with specific difficulty, try without difficulty filter
  if (raw.length === 0) {
    console.log(`[getQuizQuestions] No questions found with difficulty '${difficulty}', trying without difficulty filter`);
    raw = await getQuestionsBySubcategory(subcategoryId, null, 50);
    console.log(`[getQuizQuestions] Found ${raw.length} questions without difficulty filter for subcategory '${subcategoryId}'`);
  }
  
  const filtered = raw.filter((q) => !excludeIds.includes(q.id));
  console.log(`[getQuizQuestions] After filtering excludeIds, ${filtered.length} questions remain`);
  
  // Debug: log the first few questions to see their structure
  if (filtered.length > 0) {
    console.log(`[getQuizQuestions] Sample question:`, {
      id: filtered[0].id,
      difficulty: filtered[0].difficulty,
      subcategory: filtered[0].subcategory,
      usageContext: filtered[0].usageContext
    });
  }
  
  if (filtered.length < QUESTIONS_PER_QUIZ) {
    console.warn(
      `Not enough unique questions for ${subcategoryId} level ${level}.` +
        ` Needed ${QUESTIONS_PER_QUIZ}, found ${filtered.length}.`,
    );
  }
  return sampleN(filtered, QUESTIONS_PER_QUIZ);
}

/**
 * Create and persist a SmartQuiz document. Returns the new quizId.
 */
export const createSmartQuiz = async (
  userId,
  subcategoryId,
  level,
) => {
  return quizQueue.add(async () => {
    return monitoredOperation(createSmartQuizInternal, 'createSmartQuiz')(userId, subcategoryId, level);
  });
};

const createSmartQuizInternal = async (
  userId,
  subcategoryId,
  level,
) => {
  const normalized = getKebabCaseFromAnyFormat(subcategoryId);
  if (!normalized) throw new Error('Invalid subcategory identifier');

  // Get user progress data including asked questions and missed questions
  const progress = await getSubcategoryProgress(userId, normalized);
  const asked = progress && progress.askedQuestions ? progress.askedQuestions : [];
  const missed = progress && progress.missedQuestions ? progress.missedQuestions : [];

  // First try to get unique unseen questions (standard behavior)
  const uniqueQuestions = await getQuizQuestions(normalized, level, asked);

  let quizQuestions = [];

  if (uniqueQuestions.length >= QUESTIONS_PER_QUIZ) {
    // We have enough unique questions, use them (standard path)
    quizQuestions = uniqueQuestions;
  } else {
    // Not enough unique questions - implement the "Incorrect-first" re-insertion approach
    console.log(`Not enough unique questions (${uniqueQuestions.length}/${QUESTIONS_PER_QUIZ}) for ${normalized} at level ${level}. Using re-insertion approach.`);
    
    // Step 1: Add all available unseen questions first
    quizQuestions = [...uniqueQuestions];
    const neededQuestions = QUESTIONS_PER_QUIZ - quizQuestions.length;
    
    if (neededQuestions > 0) {
      // Step 2: Get all questions in this subcategory and difficulty level
      const difficulty = DIFFICULTY_FOR_LEVEL[level] || 'easy';
      let allQuestions = await getQuestionsBySubcategory(normalized, difficulty, 50);
      
      // If no questions found with specific difficulty, try without difficulty filter
      if (allQuestions.length === 0) {
        console.log(`[createSmartQuizInternal] No questions found with difficulty '${difficulty}', trying without difficulty filter for re-insertion`);
        allQuestions = await getQuestionsBySubcategory(normalized, null, 50);
        console.log(`[createSmartQuizInternal] Found ${allQuestions.length} questions without difficulty filter for re-insertion`);
      }
      
      // Create a map of question IDs we've already selected to avoid duplicates
      const selectedIds = new Set(quizQuestions.map(q => q.id));
      
      // Step 3: Add previously missed questions (prioritize these)
      if (missed.length > 0) {
        // Filter for questions that match the current level's difficulty and were previously missed
        const missedQuestions = allQuestions.filter(q => 
          missed.includes(q.id) && !selectedIds.has(q.id)
        );
        
        // Shuffle the missed questions for variety
        const shuffledMissed = sampleN(missedQuestions, neededQuestions);
        
        // Add missed questions and update the needed count
        for (const q of shuffledMissed) {
          if (quizQuestions.length < QUESTIONS_PER_QUIZ) {
            quizQuestions.push(q);
            selectedIds.add(q.id);
          } else {
            break;
          }
        }
      }
      
      // Step 4: If we still need more questions, add previously answered questions
      const stillNeeded = QUESTIONS_PER_QUIZ - quizQuestions.length;
      
      if (stillNeeded > 0) {
        // Get previously answered questions that weren't missed (i.e., answered correctly)
        const answeredCorrectly = allQuestions.filter(q => 
          asked.includes(q.id) && 
          !missed.includes(q.id) && 
          !selectedIds.has(q.id)
        );
        
        // Shuffle the correctly answered questions
        const shuffledCorrect = sampleN(answeredCorrectly, stillNeeded);
        
        // Add correct questions and update the count
        for (const q of shuffledCorrect) {
          if (quizQuestions.length < QUESTIONS_PER_QUIZ) {
            quizQuestions.push(q);
            selectedIds.add(q.id);
          } else {
            break;
          }
        }
      }
      
      // If we still don't have enough, we'll use what we have
      if (quizQuestions.length < QUESTIONS_PER_QUIZ) {
        console.warn(`Even with re-insertion, only found ${quizQuestions.length}/${QUESTIONS_PER_QUIZ} questions for ${normalized} at level ${level}.`);
      }
    }
  }
  
  // Check if we have at least one question - we'll use as many as we can get
  if (quizQuestions.length === 0) {
    const levelName = DIFFICULTY_FOR_LEVEL[level] || 'this level';
    const errorMessage = `No questions available for this skill at ${levelName} difficulty. Please try a different skill or difficulty level.`;
    throw new Error(errorMessage);
  }

  const quizData = {
    userId,
    subcategoryId: normalized,
    level,
    questionIds: quizQuestions.map(q => q.id),
    questionCount: quizQuestions.length,
    currentQuestionIndex: 0,
    score: 0,
    status: 'created',
    createdAt: serverTimestamp(),
  };

  const ref = await addDoc(collection(db, SMARTQUIZ_COLLECTION), quizData);
  const newQuizId = ref.id;
  
  // Log the number of questions to help with debugging
  console.log(`Created SmartQuiz with ID ${newQuizId}: ${quizQuestions.length} questions for ${normalized} at level ${level}`);
  
  return newQuizId;
};

/**
 * Finalise a SmartQuiz: store answers, compute score, update progress.
 *
 * @param {string} quizId                Firestore document id
 * @param {Object.<questionId, {selectedOption:number,isCorrect:boolean,timeSpent:number}>} answers
 */
export const recordSmartQuizResult = async (quizId, answers) => {
  const quizRef = doc(db, SMARTQUIZ_COLLECTION, quizId);
  const snap = await getDoc(quizRef);
  if (!snap.exists()) throw new Error('Quiz not found');

  const quiz = snap.data();
  
  // Handle both new format (questionIds) and legacy format (questions)
  let questionIds;
  if (quiz.questionIds) {
    questionIds = quiz.questionIds;
  } else if (quiz.questions) {
    // Legacy format - extract IDs from question objects
    questionIds = quiz.questions.map((q) => q.id);
  } else {
    throw new Error('Quiz has no questions or questionIds');
  }

  let correct = 0;
  // Create a map of question results to track which ones were answered correctly/incorrectly
  const questionResults = {};
  
  questionIds.forEach((id) => {
    const isCorrect = answers[id]?.isCorrect || false;
    questionResults[id] = isCorrect;
    if (isCorrect) correct += 1;
  });

  const scorePct = Math.round((correct / questionIds.length) * 100);
  const passed = scorePct >= 80;

  await updateDoc(quizRef, {
    completedAt: serverTimestamp(),
    userAnswers: answers,
    score: scorePct,
    passed,
    status: 'completed',
  });

  // Persist progress update with question results for tracking missed questions
  await updateSubcategoryProgress(
    quiz.userId,
    quiz.subcategoryId,
    quiz.level,
    scorePct,
    passed,
    questionIds,
    { correct, total: questionIds.length },
    questionResults  // Add the question results to track missed questions
  );

  // === ADDITION: Record this attempt in the history ===
  try {
    // Instead of using a subcollection, we'll add to an array field in the progress document
    // First, let's get the current progress document
    const progressDocRef = doc(db, 'users', quiz.userId, 'progress', quiz.subcategoryId);
    const progressDoc = await getDoc(progressDocRef);
    
    // Get the current attemptHistory array or initialize it
    const currentData = progressDoc.data() || {};
    const attemptHistory = currentData.attemptHistory || [];
    
    // Add the new attempt to the beginning of the array (most recent first)
    const newAttempt = {
      timestamp: new Date().toISOString(), // Use ISO string format for dates (easier to sort)
      accuracy: scorePct, // Percentage accuracy for this quiz
      questionsAttempted: questionIds.length, // Fixed: use questionIds.length instead of quiz.questions.length
      questionsCorrect: correct,
      quizId: quizId,
    };
    
    // Limit array to last 30 attempts to prevent it from growing too large
    const updatedHistory = [newAttempt, ...attemptHistory].slice(0, 30);
    
    // Update the progress document with the new attemptHistory
    await updateDoc(progressDocRef, {
      attemptHistory: updatedHistory
    });
    
    console.log(`[recordSmartQuizResult] Attempt history saved for quiz ${quizId}, user ${quiz.userId}, subcategory ${quiz.subcategoryId}`);
  } catch (historyError) {
    console.error('[recordSmartQuizResult] Error saving attempt history:', historyError);
    // We just log the error but don't propagate it since this is an enhancement
  }
  // === END ADDITION ===

  // Update user stats cache for ranking calculations
  try {
    await updateUserStatsCache(quiz.userId);
    console.log(`[recordSmartQuizResult] Updated stats cache for user ${quiz.userId}`);
  } catch (cacheError) {
    console.error('[recordSmartQuizResult] Error updating stats cache:', cacheError);
    // Non-critical error, don't propagate
  }

  // === ADDITION: Update concept mastery for each question ===
  try {
    console.log(`[recordSmartQuizResult] Updating concept mastery for quiz ${quizId}`);
    
    // Process each question ID to update concept mastery
    for (const questionId of questionIds) {
      try {
        // Get the concept association for this question
        const conceptAssociation = await getConceptAssociationForQuestion(questionId);
        
        if (conceptAssociation && conceptAssociation.conceptIds && conceptAssociation.conceptIds.length > 0) {
          const isCorrect = answers[questionId]?.isCorrect || false;
          
          // Update mastery for each concept associated with this question
          await updateConceptMastery(
            quiz.userId,
            quiz.subcategoryId,
            conceptAssociation.conceptIds,
            isCorrect
          );
          
          console.log(`[recordSmartQuizResult] Updated concept mastery for question ${questionId}, concepts: ${conceptAssociation.conceptIds.join(', ')}, correct: ${isCorrect}`);
        } else {
          console.log(`[recordSmartQuizResult] No concept association found for question ${questionId}`);
        }
      } catch (conceptError) {
        console.error(`[recordSmartQuizResult] Error updating concept mastery for question ${questionId}:`, conceptError);
        // Continue processing other questions even if one fails
      }
    }
    
    console.log(`[recordSmartQuizResult] Concept mastery tracking completed for quiz ${quizId}`);
  } catch (conceptTrackingError) {
    console.error('[recordSmartQuizResult] Error in concept mastery tracking:', conceptTrackingError);
    // Non-critical error, don't propagate
  }
  // === END ADDITION ===

  // Return summary
  return {
    score: scorePct,
    correct,
    passed,
  };
};
