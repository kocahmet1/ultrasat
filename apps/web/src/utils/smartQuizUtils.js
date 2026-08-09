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
  getDocs,
  updateDoc,
  query,
  where,
  limit,
  serverTimestamp,
  writeBatch,
  increment,
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
import { quizQueue, monitoredOperation } from './concurrencyUtils';
import { logQuestionAttempts, EVENT_TYPES, ATTEMPT_SOURCES } from '../coach/events';

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
 * Restrict a fetched candidate pool to questions SmartQuiz should serve.
 *
 * - Questions with usageContext 'retired' are never served (they are kept in
 *   Firestore only so past quiz sessions still resolve).
 * - When the general-use pool (usageContext absent or 'general') can fill a
 *   quiz by itself, exam-context questions are excluded so practice-exam
 *   content is not spoiled in SmartQuizzes. Subcategories whose pool is
 *   mostly exam-sourced keep working via the fallback.
 */
function filterServablePool(items, minCount = QUESTIONS_PER_QUIZ) {
  const live = (items || []).filter((q) => q?.usageContext !== 'retired');
  const general = live.filter((q) => !q?.usageContext || q.usageContext === 'general');
  return general.length >= minCount ? general : live;
}

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

  raw = filterServablePool(raw);
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
        pool.push(...filterServablePool(items));
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
      allQuestions = filterServablePool(allQuestions);

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

  // P2-B double-record guard: capture the status BEFORE this function flips it
  // to 'completed' below. recordSmartQuizResult has a single caller
  // (SmartQuiz handleFinish), but that call can fire twice for one quiz
  // (render-path finish + StrictMode double render, or a retry after a partial
  // failure). Peer-stat increments below only run on the first
  // created->completed transition so no completion ever counts twice.
  const wasAlreadyCompleted = quiz.status === 'completed';
  
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
  const conceptIdsByQuestion = {}; // also feeds the coach event stream below
  let qSubcatMap = {};
  try {
    console.log(`[recordSmartQuizResult] Updating concept mastery for quiz ${quizId}`);
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
          conceptIdsByQuestion[questionId] = conceptAssociation.conceptIds;
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

  // === AI Coach event stream (Phase 0): canonical Tier-1 record of this quiz ===
  // Fire-and-forget by design — must never affect the quiz result the student sees.
  try {
    const attemptEvents = questionIds.map((id) => ({
      source: ATTEMPT_SOURCES.SMARTQUIZ,
      questionId: id,
      subcategoryId: isMetaQuiz ? (qSubcatMap[id] || quiz.subcategoryId || null) : quiz.subcategoryId,
      conceptIds: conceptIdsByQuestion[id] || [],
      difficulty: quiz.level,
      correct: !!answers[id]?.isCorrect,
      timeSpentMs: typeof answers[id]?.timeSpent === 'number' ? Math.round(answers[id].timeSpent * 1000) : undefined,
      parentId: quizId,
    })).filter((a) => !!a.subcategoryId);

    const completion = {
      type: EVENT_TYPES.QUIZ_COMPLETED,
      payload: {
        quizId,
        kind: isMetaQuiz ? 'meta' : 'single',
        subcategoryIds: isMetaQuiz
          ? Array.from(new Set(Object.values(qSubcatMap)))
          : [quiz.subcategoryId].filter(Boolean),
        questionCount: questionIds.length,
        correctCount: correct,
        scorePct,
        level: quiz.level,
        passed,
      },
    };

    logQuestionAttempts(attemptEvents, completion).catch((e) =>
      console.error('[recordSmartQuizResult] coach event emission failed:', e)
    );
  } catch (coachEventError) {
    console.error('[recordSmartQuizResult] coach event build failed:', coachEventError);
  }
  // === END coach events ===

  // === P2-B: peer statistics aggregation ==================================
  // One anonymous aggregate doc per question (questionStats/{questionId}):
  //   { attempts, correct, totalTimeMs, optionCounts: { "0".."3" }, updatedAt }
  // Incremented once per NON-OMITTED answer via a single writeBatch, after
  // every existing write above has succeeded. Every real response counts
  // toward attempts / correct / totalTimeMs; optionCounts additionally
  // records the picked index for standard multiple-choice answers only
  // (grid-in answers store a string selectedOption, so they skip the option
  // distribution but still feed "% correct" and average time).
  // answers[id].timeSpent is SECONDS (see the 1s interval in SmartQuiz.jsx);
  // the aggregate stores milliseconds.
  // Guarded by wasAlreadyCompleted (captured at the top, before the status
  // flip) so a duplicate call for one quiz never double-counts, and wrapped
  // in try/catch — a stats failure must never break quiz completion.
  if (!wasAlreadyCompleted) {
    try {
      const statsBatch = writeBatch(db);
      let statsOps = 0;
      questionIds.forEach((questionId) => {
        const answer = answers[questionId];
        if (!answer || answer.omitted === true) return; // omissions are not attempts
        const selected = answer.selectedOption;
        if (selected === null || selected === undefined || selected === '') return; // no real response

        const timeSpentSec = typeof answer.timeSpent === 'number' && Number.isFinite(answer.timeSpent)
          ? Math.max(0, answer.timeSpent)
          : 0;

        const statsUpdate = {
          attempts: increment(1),
          correct: increment(answer.isCorrect ? 1 : 0),
          totalTimeMs: increment(Math.round(timeSpentSec * 1000)),
          updatedAt: serverTimestamp(),
        };
        // Option distribution: standard 4-option multiple choice only. A
        // set-with-merge deep-merges the optionCounts map, so incrementing
        // one key never clobbers the others.
        if (typeof selected === 'number' && Number.isInteger(selected) && selected >= 0 && selected <= 3) {
          statsUpdate.optionCounts = { [selected]: increment(1) };
        }

        statsBatch.set(doc(db, 'questionStats', questionId), statsUpdate, { merge: true });
        statsOps += 1;
      });
      if (statsOps > 0) {
        await statsBatch.commit();
        console.log(`[recordSmartQuizResult] Peer stats updated for ${statsOps} question(s).`);
      }
    } catch (statsError) {
      console.warn('[recordSmartQuizResult] Peer stats update failed (non-critical):', statsError?.message);
    }
  } else {
    console.warn(`[recordSmartQuizResult] Quiz ${quizId} was already completed — skipping peer-stat increments.`);
  }
  // === END P2-B ===

  // Return summary
  return {
    score: scorePct,
    correct,
    passed,
  };
};

// CUSTOM BUILDER API (P1-B) ---------------------------------------------------
// Practice Builder quizzes: user-configured question count, pool, difficulty
// and topic filters. Written as meta quizzes so recordSmartQuizResult updates
// progress per subcategory. CONTRACT fields for SmartQuiz.jsx: `tutorMode`
// (bool), `timerMode` ('untimed'|'timed'), `questionCount` (number),
// `configSource: 'builder'`.

export const BUILDER_MAX_QUESTIONS = 30;
export const BUILDER_POOLS = ['unused', 'incorrect', 'marked', 'all'];
export const BUILDER_DIFFICULTIES = ['easy', 'medium', 'hard'];

const LEVEL_FOR_DIFFICULTY = Object.fromEntries(
  Object.entries(DIFFICULTY_FOR_LEVEL).map(([lvl, diff]) => [diff, Number(lvl)]),
);

/** Questions flagged for exam-only use never enter practice quizzes. */
const isGeneralUseQuestion = (q) => !q?.usageContext || q.usageContext === 'general';

/**
 * Retired questions stay in the collection so that past attempts, `questionStats`, and any
 * `examModules` references remain intact — they are only withheld from new quizzes.
 * See `scripts/retireQuestions.js`.
 */
const isRetiredQuestion = (q) => q?.retired === true;

/** A question is eligible for a new practice quiz only if it is general-use and not retired. */
export const isQuizEligibleQuestion = (q) => isGeneralUseQuestion(q) && !isRetiredQuestion(q);

/** Canonical kebab subcategory of a question doc, tolerating field variants. */
const getQuestionSubcategoryId = (q) =>
  getKebabCaseFromAnyFormat(q?.subcategory || q?.subCategory || q?.subcategoryId || '') || null;

/**
 * Fallback pool exclusion when the caller cannot supply seen-question ids:
 * union of `askedQuestions` across the user's progress docs.
 */
async function getAskedQuestionUnion(userId) {
  const asked = new Set();
  try {
    const snap = await getDocs(collection(db, 'users', userId, 'progress'));
    snap.forEach((d) => {
      ((d.data() || {}).askedQuestions || []).forEach((id) => asked.add(id));
    });
  } catch (e) {
    console.warn('[createCustomSmartQuiz] Could not derive asked questions:', e?.message);
  }
  return asked;
}

/**
 * Create a SmartQuiz from a Practice Builder configuration.
 *
 * @param {string} userId
 * @param {Object} config
 * @param {number}   [config.questionCount=10]      1..BUILDER_MAX_QUESTIONS
 * @param {boolean}  [config.tutorMode=true]        show explanations as you go
 * @param {string}   [config.timerMode='untimed']   'untimed' | 'timed'
 * @param {string}   [config.pool='all']            'unused'|'incorrect'|'marked'|'all'
 * @param {string[]} [config.difficulties=[]]       subset of easy/medium/hard; empty = any
 * @param {string[]} [config.subcategoryIds=[]]     kebab ids; empty = all topics
 * @param {string[]} [config.excludeQuestionIds]    seen ids (pool 'unused'); derived from
 *                                                  progress docs when omitted
 * @param {string[]} [config.restrictToQuestionIds] candidate ids (pools 'incorrect'/'marked')
 * @returns {Promise<{quizId: string, requestedCount: number, createdCount: number}>}
 */
export const createCustomSmartQuiz = async (userId, config = {}) => {
  return quizQueue.add(async () => {
    return monitoredOperation(createCustomSmartQuizInternal, 'createCustomSmartQuiz')(userId, config);
  });
};

const createCustomSmartQuizInternal = async (userId, config = {}) => {
  if (!userId) throw new Error('Custom practice requires a signed-in user');

  const requestedCount = Math.max(
    1,
    Math.min(BUILDER_MAX_QUESTIONS, Math.round(Number(config.questionCount)) || 10),
  );
  const pool = BUILDER_POOLS.includes(config.pool) ? config.pool : 'all';
  const difficulties = (config.difficulties || []).filter((d) => BUILDER_DIFFICULTIES.includes(d));
  const subcategoryIds = Array.from(new Set(
    (config.subcategoryIds || []).map((s) => getKebabCaseFromAnyFormat(s)).filter(Boolean),
  ));
  const difficultySet = new Set(difficulties);
  const subcatSet = new Set(subcategoryIds);

  // Filters are honored exactly — we never silently widen them.
  const matchesFilters = (q) => {
    if (!q?.id || !isQuizEligibleQuestion(q)) return false;
    if (difficultySet.size > 0 && !difficultySet.has(q.difficulty)) return false;
    if (subcatSet.size > 0) {
      const sc = getQuestionSubcategoryId(q);
      if (!sc || !subcatSet.has(sc)) return false;
    }
    return true;
  };

  let candidates = [];

  if (pool === 'incorrect' || pool === 'marked') {
    // Pool IS the candidate list; topic/difficulty filters narrow it.
    const restrictIds = Array.from(new Set(config.restrictToQuestionIds || []));
    if (restrictIds.length === 0) {
      throw new Error(
        pool === 'incorrect'
          ? 'No incorrect questions to practice yet. Complete a few quizzes first.'
          : 'No saved questions yet. Save questions during practice to build this pool.',
      );
    }
    const fetched = await getQuestionsByIds(restrictIds.slice(0, 300));
    candidates = fetched.filter(matchesFilters);
  } else {
    if (subcategoryIds.length > 0 && subcategoryIds.length <= 8) {
      // Narrow topic selection: reuse the resilient per-subcategory fetcher
      // (handles legacy subcategory field variants).
      const diffList = difficulties.length > 0 ? difficulties : [null];
      for (const sc of subcategoryIds) {
        for (const diff of diffList) {
          const items = await getQuestionsBySubcategory(sc, diff, 60);
          candidates.push(...items);
        }
      }
      candidates = candidates.filter(matchesFilters);
    } else {
      // All topics (or a very wide selection): pull bounded windows straight
      // from the questions collection and filter client-side.
      const windows = difficulties.length > 0
        ? difficulties.map((d) => query(collection(db, 'questions'), where('difficulty', '==', d), limit(160)))
        : [query(collection(db, 'questions'), limit(400))];
      for (const w of windows) {
        const snap = await getDocs(w);
        snap.forEach((d) => candidates.push({ id: d.id, ...d.data() }));
      }
      candidates = candidates.filter(matchesFilters);
    }

    if (pool === 'unused') {
      const excluded = Array.isArray(config.excludeQuestionIds)
        ? new Set(config.excludeQuestionIds)
        : await getAskedQuestionUnion(userId);
      candidates = candidates.filter((q) => !excluded.has(q.id));
    }
  }

  // Dedupe (windows and subcategory fetches can overlap).
  const seenIds = new Set();
  const uniqueCandidates = [];
  for (const q of candidates) {
    if (!q?.id || seenIds.has(q.id)) continue;
    seenIds.add(q.id);
    uniqueCandidates.push(q);
  }

  if (uniqueCandidates.length === 0) {
    throw new Error('No questions match these filters. Widen the pool, difficulty, or topics and try again.');
  }

  const selected = sampleN(uniqueCandidates, Math.min(requestedCount, uniqueCandidates.length));
  const metaSubcategoryIds = Array.from(new Set(
    selected.map(getQuestionSubcategoryId).filter(Boolean),
  ));
  const level = difficulties.length === 1 ? (LEVEL_FOR_DIFFICULTY[difficulties[0]] || 2) : 2;

  const quizData = {
    userId,
    meta: true,
    metaSubcategoryIds,
    level,
    questionIds: selected.map((q) => q.id),
    questionCount: selected.length, // CONTRACT
    currentQuestionIndex: 0,
    score: 0,
    status: 'created',
    createdAt: serverTimestamp(),
    // CONTRACT fields (P1-B) — SmartQuiz.jsx reads these to run the session.
    tutorMode: config.tutorMode !== false,
    timerMode: config.timerMode === 'timed' ? 'timed' : 'untimed',
    configSource: 'builder',
    // For history display and re-runs; not part of the session contract.
    builderConfig: {
      pool,
      difficulties,
      subcategoryIds,
      requestedCount,
    },
  };

  const ref = await addDoc(collection(db, SMARTQUIZ_COLLECTION), quizData);
  console.log(
    `Created custom SmartQuiz ${ref.id}: ${selected.length}/${requestedCount} questions, ` +
      `pool=${pool}, difficulties=[${difficulties.join(',')}], topics=${subcategoryIds.length || 'all'}`,
  );
  return { quizId: ref.id, requestedCount, createdCount: selected.length };
};
