/**
 * examSessionServices — data layer for the "Exam Session Analysis" admin tool.
 *
 * Answers: "who completed which practice exam in the last N hours, and what
 * did each of them answer?" without needing any new Firestore indexes or
 * security-rule changes.
 *
 * How it works: saveComprehensiveExamResult (userExamServices.js) mirrors every
 * exam response into the top-level `questionAttempts` collection with
 * { ...response, userId, examId (the user's result-doc id), attemptedAt }.
 * All of an exam's attempts are written at submission time, so a single
 * range query on `attemptedAt` finds every response of every exam finished
 * inside the window. Attempts are then grouped into one "session" per
 * (userId, resultId) and joined with:
 *   - users/{userId}/practiceExams/{resultId}  → which exam, scores, when
 *   - users/{userId}                           → student name + email
 *
 * Admin-only: firestore.rules already allow admins to read questionAttempts,
 * user profiles, and every user's practiceExams subcollection.
 */

import { db } from './config';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  Timestamp,
  where,
} from 'firebase/firestore';

// ~200 full-length sittings; far above anything a tutoring session produces.
// The query is ordered newest-first, so if the cap is ever hit we keep the
// newest attempts and report `truncated` so the UI can say so.
const ATTEMPT_FETCH_LIMIT = 20000;

/** Firestore Timestamp | Date | ISO string | millis -> millis (or null). */
const toMillis = (value) => {
  if (value === null || value === undefined) return null;
  if (typeof value.toMillis === 'function') return value.toMillis();
  if (typeof value.toDate === 'function') return value.toDate().getTime();
  if (value instanceof Date) return value.getTime();
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? null : parsed;
};

/**
 * Fetch every practice-exam sitting completed within the last `hoursBack`
 * hours, one session per (student, result document).
 *
 * @param {number} hoursBack - Size of the lookback window in hours.
 * @returns {Promise<{
 *   sessions: Array<Object>,
 *   truncated: boolean,
 *   orphanedGroups: number,
 *   fetchedAtMs: number,
 *   cutoffMs: number,
 * }>}
 */
export const fetchExamSessionData = async (hoursBack) => {
  const safeHours = Number.isFinite(Number(hoursBack)) && Number(hoursBack) > 0
    ? Number(hoursBack)
    : 1;
  const cutoffMs = Date.now() - safeHours * 60 * 60 * 1000;

  const attemptsQuery = query(
    collection(db, 'questionAttempts'),
    where('attemptedAt', '>=', Timestamp.fromMillis(cutoffMs)),
    orderBy('attemptedAt', 'desc'),
    limit(ATTEMPT_FETCH_LIMIT),
  );

  const attemptsSnapshot = await getDocs(attemptsQuery);
  const truncated = attemptsSnapshot.size >= ATTEMPT_FETCH_LIMIT;

  // Group raw attempts into one bucket per (userId, resultDocId).
  const attemptGroups = new Map();
  attemptsSnapshot.docs.forEach((attemptDoc) => {
    const attempt = attemptDoc.data();
    if (!attempt.userId || !attempt.examId) return;
    const key = `${attempt.userId}|${attempt.examId}`;
    if (!attemptGroups.has(key)) {
      attemptGroups.set(key, []);
    }
    attemptGroups.get(key).push(attempt);
  });

  const groupKeys = [...attemptGroups.keys()];
  const userIds = [...new Set(groupKeys.map((key) => key.split('|')[0]))];

  // Join with result docs and student profiles (small: one read per sitting
  // plus one per distinct student).
  const [resultSnapshots, userSnapshots] = await Promise.all([
    Promise.all(
      groupKeys.map((key) => {
        const [userId, resultId] = key.split('|');
        return getDoc(doc(db, `users/${userId}/practiceExams`, resultId));
      }),
    ),
    Promise.all(userIds.map((userId) => getDoc(doc(db, 'users', userId)))),
  ]);

  const usersById = new Map();
  userSnapshots.forEach((snapshot, index) => {
    usersById.set(userIds[index], snapshot.exists() ? snapshot.data() : null);
  });

  const sessions = [];
  let orphanedGroups = 0;

  groupKeys.forEach((key, index) => {
    const [userId, resultId] = key.split('|');
    const resultSnapshot = resultSnapshots[index];

    // Attempts whose result doc is gone (deleted result) can't be attributed
    // to an exam — count them so the UI can mention it, but don't fabricate.
    if (!resultSnapshot.exists()) {
      orphanedGroups += 1;
      return;
    }

    const result = resultSnapshot.data();
    const profile = usersById.get(userId) || {};

    sessions.push({
      key,
      userId,
      resultId,
      practiceExamId: result.practiceExamId || null,
      examTitle: result.examTitle || 'Untitled exam',
      isDiagnostic: Boolean(result.isDiagnostic),
      completedAtMs:
        toMillis(result.completedAt) ?? toMillis(result.examDate) ?? 0,
      scores: result.scores || null,
      overallScore:
        typeof result.overallScore === 'number' ? result.overallScore : null,
      totalAnswered:
        typeof result.totalQuestions === 'number'
          ? result.totalQuestions
          : attemptGroups.get(key).length,
      correctAnswers:
        typeof result.correctAnswers === 'number' ? result.correctAnswers : null,
      modulesMeta: Array.isArray(result.modules) ? result.modules : [],
      studentName:
        profile?.name || profile?.displayName || '(unknown student)',
      studentEmail: profile?.email || '',
      attempts: attemptGroups.get(key),
    });
  });

  return {
    sessions,
    truncated,
    orphanedGroups,
    fetchedAtMs: Date.now(),
    cutoffMs,
  };
};

export default fetchExamSessionData;
