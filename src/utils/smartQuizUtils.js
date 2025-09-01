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
import { getQuestionsBySubcategory, getQuestionsByIds } from '../firebase/services';
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
 * Create a Meta SmartQuiz that mixes questions from multiple subcategories.
 *
 * @param {string} userId
 * @param {string[]} subcategoryIds - Array of subcategory identifiers (any format)
 * @param {number} level - 1,2,3 (maps to easy/medium/hard)
 * @param {number} questionCount - desired number of questions
 * @returns {Promise<string>} quizId
 */
export const createMetaSmartQuiz = async (
  userId,
  subcategoryIds,
  level,
  questionCount = QUESTIONS_PER_QUIZ,
) => {
  return quizQueue.add(async () => {
    return monitoredOperation(async (uid, subcats, lvl, qCount) => {
      const normalizedSubcats = (subcats || [])
        .map((s) => getKebabCaseFromAnyFormat(s))
        .filter(Boolean);
      if (!uid || normalizedSubcats.length === 0) {
        throw new Error('Meta quiz requires a user and at least one subcategory');
      }

      const difficulty = DIFFICULTY_FOR_LEVEL[lvl] || 'easy';

      // Collect asked questions across all selected subcategories to avoid repeats
      const askedUnion = new Set();
      for (const sc of normalizedSubcats) {
        try {
          const prog = await getSubcategoryProgress(uid, sc);
          (prog?.askedQuestions || []).forEach((id) => askedUnion.add(id));
        } catch (e) {
          console.warn(`[createMetaSmartQuiz] Failed to get progress for ${sc}:`, e?.message);
        }
      }

      // Fetch candidate questions from each subcategory, respecting difficulty with fallback
      let pool = [];
      for (const sc of normalizedSubcats) {
        let items = await getQuestionsBySubcategory(sc, difficulty, 60);
        if (items.length === 0) {
          items = await getQuestionsBySubcategory(sc, null, 60);
        }
        pool.push(...items);
      }

      // Deduplicate and filter out already asked
      const seen = new Set();
      const filteredPool = [];
      for (const q of pool) {
        if (!q?.id) continue;
        if (seen.has(q.id)) continue;
        seen.add(q.id);
        if (!askedUnion.has(q.id)) filteredPool.push(q);
      }

      // If not enough, allow asked ones (still unique)
      let finalPool = filteredPool;
      if (finalPool.length < qCount) {
        // Add back some asked ones to reach desired count
        const askedBack = pool.filter((q) => q?.id && askedUnion.has(q.id) && !seen.has(`${q.id}-readd`));
        // Avoid duplicates with finalPool
        const existing = new Set(finalPool.map((x) => x.id));
        for (const q of askedBack) {
          if (!existing.has(q.id)) finalPool.push(q);
          if (finalPool.length >= qCount) break;
        }
      }

      const countToUse = Math.max(1, Math.min(qCount, finalPool.length));
      const selected = sampleN(finalPool, countToUse);

      if (selected.length === 0) {
        const levelName = DIFFICULTY_FOR_LEVEL[lvl] || 'this level';
        throw new Error(`No questions available for the selected skills at ${levelName} difficulty.`);
      }

      const quizData = {
        userId: uid,
        meta: true,
        metaSubcategoryIds: normalizedSubcats,
        level: lvl,
        questionIds: selected.map((q) => q.id),
        questionCount: selected.length,
        currentQuestionIndex: 0,
        score: 0,
        status: 'created',
        createdAt: serverTimestamp(),
      };

      const ref = await addDoc(collection(db, SMARTQUIZ_COLLECTION), quizData);
      const newQuizId = ref.id;
      console.log(`Created Meta SmartQuiz ${newQuizId}: ${selected.length} questions across ${normalizedSubcats.length} subcategories.`);
      return newQuizId;
    }, 'createMetaSmartQuiz')(userId, subcategoryIds, level, questionCount);
  });
};

/**
 * Create and persist a SmartQuiz document. Returns the new quizId.
 */
export const createSmartQuiz = async (
  userId,
  subcategoryId,
  level,
  userCurrentLevel = null,
) => {
  return quizQueue.add(async () => {
    return monitoredOperation(createSmartQuizInternal, 'createSmartQuiz')(userId, subcategoryId, level, userCurrentLevel);
  });
};

const createSmartQuizInternal = async (
  userId,
  subcategoryId,
  level,
  userCurrentLevel = null,
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
    userCurrentLevel: userCurrentLevel, // Store user's current level for progression logic
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
  const isMetaQuiz = !!quiz.meta || (Array.isArray(quiz.metaSubcategoryIds) && quiz.metaSubcategoryIds.length > 0);
  
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

  // Implement special progression logic for level selection from SubjectQuizzes page
  let progressionLevel = quiz.level;
  let progressionPassed = passed;
  
  if (quiz.userCurrentLevel !== null && quiz.userCurrentLevel !== undefined) {
    // This quiz was taken from SubjectQuizzes page with level selection
    const userCurrentLevel = quiz.userCurrentLevel;
    const quizLevel = quiz.level;
    
    console.log(`[recordSmartQuizResult] Special progression logic: User current level: ${userCurrentLevel}, Quiz level: ${quizLevel}, Passed: ${passed}`);
    
    if (quizLevel < userCurrentLevel && passed) {
      // Case 1: User took a quiz below their current level and passed
      // No level change - they stay at their current level
      progressionLevel = userCurrentLevel;
      progressionPassed = false; // Don't promote them since they took a lower level quiz
      console.log(`[recordSmartQuizResult] User took lower level quiz (${quizLevel} < ${userCurrentLevel}). No promotion.`);
    } else if (quizLevel >= userCurrentLevel && passed) {
      // Case 2: User took a quiz at or above their current level and passed
      // Promote to the level they just completed (or higher if they skip levels)
      progressionLevel = Math.max(quizLevel, userCurrentLevel);
      progressionPassed = true; // Allow promotion
      console.log(`[recordSmartQuizResult] User took higher/equal level quiz (${quizLevel} >= ${userCurrentLevel}). Promoting to level ${progressionLevel + 1}.`);
    } else {
      // Case 3: User failed the quiz
      // Use the user's current level, no promotion
      progressionLevel = userCurrentLevel;
      progressionPassed = false;
      console.log(`[recordSmartQuizResult] User failed quiz. Staying at current level ${userCurrentLevel}.`);
    }
  }

  // Persist progress update(s) with question results for tracking missed questions
  if (!isMetaQuiz) {
    await updateSubcategoryProgress(
      quiz.userId,
      quiz.subcategoryId,
      progressionLevel,
      scorePct,
      progressionPassed,
      questionIds,
      { correct, total: questionIds.length },
      questionResults
    );
  } else {
    // For meta quizzes, update progress per subcategory based on the questions asked
    try {
      const details = await getQuestionsByIds(questionIds);
      const subcatMap = {}; // id -> normalized subcategory
      details.forEach((q) => {
        const sc = getKebabCaseFromAnyFormat(q?.subcategory || q?.subcategoryId || '');
        if (q?.id && sc) subcatMap[q.id] = sc;
      });

      // Group question IDs by subcategory
      const group = {};
      questionIds.forEach((id) => {
        const sc = subcatMap[id];
        if (!sc) return;
        if (!group[sc]) group[sc] = [];
        group[sc].push(id);
      });

      for (const [sc, ids] of Object.entries(group)) {
        const correctCount = ids.filter((id) => answers[id]?.isCorrect).length;
        const pct = Math.round((correctCount / ids.length) * 100);
        const passedSC = pct >= 80;
        const resultsSC = {};
        ids.forEach((id) => { resultsSC[id] = questionResults[id]; });

        await updateSubcategoryProgress(
          quiz.userId,
          sc,
          quiz.level,
          pct,
          passedSC,
          ids,
          { correct: correctCount, total: ids.length },
          resultsSC
        );
      }
    } catch (metaUpdateErr) {
      console.error('[recordSmartQuizResult] Meta progress update failed:', metaUpdateErr);
    }
  }

  // === ADDITION: Record this attempt in the history ===
  try {
    const baseAttempt = {
      timestamp: new Date().toISOString(),
      accuracy: scorePct,
      questionsAttempted: questionIds.length,
      questionsCorrect: correct,
      quizId: quizId,
    };

    if (!isMetaQuiz) {
      const progressDocRef = doc(db, 'users', quiz.userId, 'progress', quiz.subcategoryId);
      const progressDoc = await getDoc(progressDocRef);
      const currentData = progressDoc.data() || {};
      const attemptHistory = currentData.attemptHistory || [];
      const updatedHistory = [baseAttempt, ...attemptHistory].slice(0, 30);
      await updateDoc(progressDocRef, { attemptHistory: updatedHistory });
      console.log(`[recordSmartQuizResult] Attempt history saved for quiz ${quizId}, user ${quiz.userId}, subcategory ${quiz.subcategoryId}`);
    } else {
      // Save a scoped attempt entry per subcategory for meta quizzes
      const details = await getQuestionsByIds(questionIds);
      const subcatMap = {};
      details.forEach((q) => {
        const sc = getKebabCaseFromAnyFormat(q?.subcategory || q?.subcategoryId || '');
        if (q?.id && sc) subcatMap[q.id] = sc;
      });
      const group = {};
      questionIds.forEach((id) => {
        const sc = subcatMap[id];
        if (!sc) return;
        if (!group[sc]) group[sc] = [];
        group[sc].push(id);
      });
      for (const [sc, ids] of Object.entries(group)) {
        const correctCount = ids.filter((id) => answers[id]?.isCorrect).length;
        const pct = Math.round((correctCount / ids.length) * 100);
        const attempt = { ...baseAttempt, accuracy: pct, questionsAttempted: ids.length, questionsCorrect: correctCount };
        const progressDocRef = doc(db, 'users', quiz.userId, 'progress', sc);
        const progressDoc = await getDoc(progressDocRef);
        const currentData = progressDoc.data() || {};
        const attemptHistory = currentData.attemptHistory || [];
        const updatedHistory = [attempt, ...attemptHistory].slice(0, 30);
        await updateDoc(progressDocRef, { attemptHistory: updatedHistory });
      }
      console.log(`[recordSmartQuizResult] Attempt history saved for meta quiz ${quizId} across ${Object.keys(group).length} subcategories.`);
    }
  } catch (historyError) {
    console.error('[recordSmartQuizResult] Error saving attempt history:', historyError);
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
    let qSubcatMap = {};
    if (isMetaQuiz) {
      try {
        const details = await getQuestionsByIds(questionIds);
        details.forEach((q) => {
          const sc = getKebabCaseFromAnyFormat(q?.subcategory || q?.subcategoryId || '');
          if (q?.id && sc) qSubcatMap[q.id] = sc;
        });
      } catch (e) {
        console.warn('[recordSmartQuizResult] Failed to fetch question details for concept mastery subcategories:', e?.message);
      }
    }

    // Process each question ID to update concept mastery
    for (const questionId of questionIds) {
      try {
        // Get the concept association for this question
        const conceptAssociation = await getConceptAssociationForQuestion(questionId);
        
        if (conceptAssociation && conceptAssociation.conceptIds && conceptAssociation.conceptIds.length > 0) {
          const isCorrect = answers[questionId]?.isCorrect || false;
          
          // Update mastery for each concept associated with this question
          const subcatForQuestion = isMetaQuiz ? (qSubcatMap[questionId] || quiz.subcategoryId) : quiz.subcategoryId;
          await updateConceptMastery(
            quiz.userId,
            subcatForQuestion,
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
