/* lessonProgressServices.js — P1-D lesson completion loop.
 *
 * Per-user lesson progress for the Lectures catalog, stored at
 * users/{uid}/lessonProgress/{subcategoryId} (canonical kebab-case id):
 *   { status: 'in_progress' | 'completed', completedAt, lastViewedAt, updatedAt }
 *
 * Written by SubcategoryLearnPage (view tracking + the end-of-lesson
 * "Mark as Complete" band) and read in one query by LecturesPage
 * (progress summary, Completed filter, resume target).
 */

import { db } from './config';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';

export const LESSON_STATUS = {
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
};

const lessonProgressDoc = (uid, subcategoryId) =>
  doc(db, 'users', uid, 'lessonProgress', String(subcategoryId));

// touchLessonViewed throttle: at most one lastViewedAt write per page visit.
// Keyed per user+lesson so a remount inside the window (React StrictMode's
// dev double-mount, or bouncing straight back to the lesson) reuses the
// earlier write instead of issuing another one.
const TOUCH_THROTTLE_MS = 60 * 1000;
const lastTouchAt = new Map();

/**
 * All lesson progress docs for a user, fetched in a single query.
 *
 * @param {string} uid - User ID
 * @returns {Promise<Object>} map of subcategoryId -> progress doc data
 */
export const getAllLessonProgress = async (uid) => {
  try {
    if (!uid) return {};

    const snapshot = await getDocs(collection(db, 'users', uid, 'lessonProgress'));
    const progressBySubcategory = {};
    snapshot.docs.forEach((docSnapshot) => {
      progressBySubcategory[docSnapshot.id] = {
        id: docSnapshot.id,
        ...docSnapshot.data(),
      };
    });
    return progressBySubcategory;
  } catch (error) {
    console.error('Error getting lesson progress:', error);
    throw error;
  }
};

/**
 * Mark a lesson as completed (the "Have you mastered this lesson?" band).
 *
 * @param {string} uid - User ID
 * @param {string} subcategoryId - Canonical kebab-case subcategory id
 */
export const markLessonComplete = async (uid, subcategoryId) => {
  try {
    if (!uid || !subcategoryId) {
      throw new Error('Missing uid or subcategoryId for markLessonComplete');
    }

    await setDoc(
      lessonProgressDoc(uid, subcategoryId),
      {
        status: LESSON_STATUS.COMPLETED,
        completedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  } catch (error) {
    console.error('Error marking lesson complete:', error);
    throw error;
  }
};

/**
 * Un-mark a completed lesson (drops it back to in_progress).
 *
 * @param {string} uid - User ID
 * @param {string} subcategoryId - Canonical kebab-case subcategory id
 */
export const unmarkLessonComplete = async (uid, subcategoryId) => {
  try {
    if (!uid || !subcategoryId) {
      throw new Error('Missing uid or subcategoryId for unmarkLessonComplete');
    }

    await setDoc(
      lessonProgressDoc(uid, subcategoryId),
      {
        status: LESSON_STATUS.IN_PROGRESS,
        completedAt: null,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  } catch (error) {
    console.error('Error un-marking lesson complete:', error);
    throw error;
  }
};

/**
 * Record that the user opened a lesson: merge lastViewedAt, and set status to
 * in_progress unless the lesson is already completed. The write is throttled
 * to one per page visit; the read always happens so callers get the current
 * doc (e.g. to hydrate the completion band without a second query).
 *
 * Never throws — background view tracking must not break the lesson page.
 *
 * @param {string} uid - User ID
 * @param {string} subcategoryId - Canonical kebab-case subcategory id
 * @returns {Promise<Object|null>} pre-existing doc data (null if none/error)
 */
export const touchLessonViewed = async (uid, subcategoryId) => {
  try {
    if (!uid || !subcategoryId) return null;

    const docRef = lessonProgressDoc(uid, subcategoryId);
    const snapshot = await getDoc(docRef);
    const existing = snapshot.exists() ? snapshot.data() : null;

    const throttleKey = `${uid}_${subcategoryId}`;
    const lastTouch = lastTouchAt.get(throttleKey) || 0;
    if (Date.now() - lastTouch >= TOUCH_THROTTLE_MS) {
      lastTouchAt.set(throttleKey, Date.now());

      const update = {
        lastViewedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      if (!existing || existing.status !== LESSON_STATUS.COMPLETED) {
        update.status = LESSON_STATUS.IN_PROGRESS;
      }
      await setDoc(docRef, update, { merge: true });
    }

    return existing;
  } catch (error) {
    console.error('Error recording lesson view:', error);
    return null;
  }
};
