/* studyPlanServices.js — P2-A study planner (UWorld-style day-by-day plan).
 *
 * ONE plan per user at users/{uid}/studyPlan/current:
 *   {
 *     createdAt, updatedAt,          // createdAt = reconcile cutoff for quizzes
 *     examDate: 'YYYY-MM-DD',        // snapshot of users/{uid}.examDate at generation
 *     minutesPerDay: number,
 *     restDays: number[],            // JS weekday ints 0(Sun)..6(Sat)
 *     truncated: boolean,            // runway too short — weakest skills kept, rest dropped
 *     tasks: [{
 *       id, date: 'YYYY-MM-DD',
 *       type: 'lesson' | 'practice' | 'review',
 *       subcategoryId,               // canonical kebab id (null for review)
 *       subcategoryIds,              // review only: kebab ids for the mixed set
 *       label, estMinutes,
 *       status: 'pending' | 'completed',
 *       completedAt,                 // ISO datetime string or null (arrays cannot
 *       completedBy,                 //  hold serverTimestamp sentinels);
 *     }],                            // completedBy = quiz id when auto-credited
 *     version: 1,
 *   }
 *
 * generatePlan() is pure (no I/O): the 29 subcategories weakest-first
 * (unattempted count as weak-middle), lesson+practice pairs filled day by day,
 * final two available days reserved for mixed review of the weakest domains.
 * The edge UWorld lacks: reconcilePlan() auto-completes tasks from REAL
 * activity (P1-D lesson completions, P1-B completed quizzes) and replan()
 * redistributes what is left — the plan tracks reality, not checkbox clicks.
 */

import { db } from './config';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import { SMARTQUIZ_COLLECTION } from '../utils/smartQuizUtils';
import {
  DOMAINS,
  SUBCATEGORIES,
  toCanonicalSubcategoryId,
} from '../utils/subcategoryTaxonomy';

export const PLAN_VERSION = 1;
export const LESSON_MINUTES = 20;
export const PRACTICE_MINUTES = 15;
export const REVIEW_MINUTES = 20;
export const PRACTICE_QUESTION_COUNT = 10;
const REVIEW_DAY_COUNT = 2;
const REVIEW_MAX_PER_DAY = 3;
const REVIEW_MAX_SUBCATS = 6; // keeps createCustomSmartQuiz on its per-subcategory fetch path
const UNATTEMPTED_ACCURACY = 50; // unattempted skills rank as "weak-middle"

const planDocRef = (uid) => doc(db, 'users', uid, 'studyPlan', 'current');

// ------------------------------------------------------------- date helpers --
// Calendar-day math runs in UTC so 'YYYY-MM-DD' strings never shift across
// DST; "today" itself comes from the user's local clock (same rule as
// ExamDateCard).

const pad2 = (n) => String(n).padStart(2, '0');

/** Local calendar date as 'YYYY-MM-DD'. */
export const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
};

const isoToUTC = (iso) => {
  const [y, m, d] = String(iso).split('-').map(Number);
  return Date.UTC(y, (m || 1) - 1, d || 1);
};

const utcToISO = (ms) => {
  const d = new Date(ms);
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;
};

/** 'YYYY-MM-DD' plus n calendar days. */
export const addDaysISO = (iso, n) => utcToISO(isoToUTC(iso) + n * 86400000);

/** JS weekday int (0=Sun..6=Sat) of a 'YYYY-MM-DD' calendar date. */
export const weekdayOfISO = (iso) => new Date(isoToUTC(iso)).getUTCDay();

/** Millis from a Firestore Timestamp, Date, number, or date string. */
export const toMillis = (value) => {
  if (!value) return 0;
  if (typeof value.toDate === 'function') return value.toDate().getTime();
  if (typeof value.seconds === 'number') return value.seconds * 1000;
  if (value instanceof Date) return value.getTime();
  const parsed = new Date(value).getTime();
  return Number.isFinite(parsed) ? parsed : 0;
};

/** Non-rest days from startISO (inclusive) through the day BEFORE examDate. */
const availableDays = (startISO, examDate, restDays) => {
  const rest = new Set((restDays || []).map(Number));
  const days = [];
  if (!examDate || Number.isNaN(Date.parse(examDate))) return days;
  for (let d = startISO; d < examDate; d = addDaysISO(d, 1)) {
    if (!rest.has(weekdayOfISO(d))) days.push(d);
  }
  return days;
};

// ------------------------------------------------------------------ get/save --

/** The user's plan doc, or null. One read. */
export const getStudyPlan = async (uid) => {
  if (!uid) return null;
  const snap = await getDoc(planDocRef(uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

/**
 * Full overwrite of users/{uid}/studyPlan/current (tasks is an array, so the
 * whole doc is rewritten). Preserves createdAt when the plan already has one;
 * fresh plans get a client Date so the reconcile cutoff stays stable across
 * later writes. Returns the plan as saved (with resolved timestamps).
 */
export const saveStudyPlan = async (uid, plan) => {
  if (!uid || !plan) throw new Error('saveStudyPlan requires uid and plan');
  const now = new Date();
  const { id: _omit, ...rest } = plan;
  const createdAt = rest.createdAt || now;
  await setDoc(planDocRef(uid), {
    ...rest,
    version: rest.version || PLAN_VERSION,
    createdAt,
    updatedAt: serverTimestamp(),
  });
  return { ...plan, createdAt, updatedAt: now };
};

// ----------------------------------------------------------- plan generation --

/** Accuracy (0-100) from a users/{uid}/progress doc, or null if unattempted. */
const accuracyFromProgress = (data) => {
  if (!data) return null;
  const last10 = Array.isArray(data.last10QuestionResults) ? data.last10QuestionResults : [];
  if (last10.length > 0) {
    return Math.round((last10.filter((r) => r === true).length / last10.length) * 100);
  }
  const attempted = (data.attempts || 0) > 0 || (data.totalQuestions || 0) > 0 || data.lastScore !== undefined;
  if (!attempted) return null;
  if (typeof data.accuracy === 'number') return Math.max(0, Math.min(100, data.accuracy));
  if (typeof data.lastScore === 'number') return Math.max(0, Math.min(100, data.lastScore));
  return null;
};

/**
 * Per-subcategory accuracy signal for generatePlan: canonical kebab id ->
 * 0-100, or null when unattempted. Same recency-first signal the learn pages
 * use (last10QuestionResults, then lifetime accuracy). ONE query on
 * users/{uid}/progress.
 */
export const fetchSubcategoryAccuracy = async (uid) => {
  const out = {};
  if (!uid) return out;
  const snap = await getDocs(collection(db, 'users', uid, 'progress'));
  snap.forEach((d) => {
    const id = toCanonicalSubcategoryId(d.id);
    if (!id) return;
    const a = accuracyFromProgress(d.data());
    if (out[id] === undefined || (a !== null && (out[id] === null || a < out[id]))) out[id] = a;
  });
  return out;
};

let taskSeq = 0;
const makeTaskId = () => `t${Date.now().toString(36)}-${(taskSeq += 1)}-${Math.random().toString(36).slice(2, 7)}`;

/**
 * PURE plan generator — no Firestore access.
 *
 * Ordering: the 29 canonical subcategories ranked weakest-first by accuracy
 * ascending; unattempted skills count as weak-middle (50), and ties keep
 * taxonomy order (sort is stable). Each skill emits a Lesson (~20 min) +
 * paired Practice (~15 min); skills whose lesson is already completed in
 * lessonProgress emit only the practice task.
 *
 * Capacity: available days run from tomorrow through the day before the exam,
 * skipping restDays. The final two available days are reserved for 'review'
 * tasks (mixed practice of the weakest domains); the rest fill greedily in
 * order up to minutesPerDay (a day always takes at least one task so the
 * queue cannot stall). If the runway cannot hold everything, the weakest
 * skills got scheduled first and plan.truncated = true records the cut.
 *
 * @param {Object} args
 * @param {string} args.examDate 'YYYY-MM-DD'
 * @param {number} args.minutesPerDay
 * @param {number[]} [args.restDays] weekday ints 0-6
 * @param {Object} [args.lessonProgress] subcategoryId -> { status, ... } (P1-D)
 * @param {Object} [args.subcategoryAccuracy] subcategoryId -> 0-100 | null
 * @returns plan object WITHOUT createdAt/updatedAt (saveStudyPlan adds them)
 */
export const generatePlan = ({
  examDate,
  minutesPerDay,
  restDays = [],
  lessonProgress = {},
  subcategoryAccuracy = {},
}) => {
  const minutes = Math.max(15, Math.round(Number(minutesPerDay)) || 60);
  const restSet = new Set((restDays || []).map(Number).filter((n) => Number.isInteger(n) && n >= 0 && n <= 6));
  const rest = restSet.size >= 7 ? new Set() : restSet; // all-rest would mean no plan
  const tasks = [];
  const plan = {
    examDate: examDate || null,
    minutesPerDay: minutes,
    restDays: [...rest].sort((a, b) => a - b),
    truncated: false,
    tasks,
    version: PLAN_VERSION,
  };

  const today = todayISO();
  if (!examDate || Number.isNaN(Date.parse(examDate)) || examDate <= today) return plan;

  const available = availableDays(addDaysISO(today, 1), examDate, [...rest]);
  if (available.length === 0) return plan;

  const reviewDays = available.slice(-Math.min(REVIEW_DAY_COUNT, available.length));
  const learningDays = available.slice(0, available.length - reviewDays.length);

  // Canonical accuracy map (null = unattempted).
  const acc = {};
  Object.entries(subcategoryAccuracy || {}).forEach(([key, value]) => {
    const id = toCanonicalSubcategoryId(key);
    if (!id) return;
    const a = typeof value === 'number' && Number.isFinite(value) ? value : null;
    if (acc[id] === undefined || (a !== null && (acc[id] === null || a < acc[id]))) acc[id] = a;
  });
  const scoreOf = (id) => (typeof acc[id] === 'number' ? acc[id] : UNATTEMPTED_ACCURACY);

  const completedLessons = new Set();
  Object.entries(lessonProgress || {}).forEach(([key, data]) => {
    const id = toCanonicalSubcategoryId(key);
    if (id && data?.status === 'completed') completedLessons.add(id);
  });

  // Weakest first; stable sort keeps taxonomy order on ties, so unattempted
  // skills (all at 50) sit between real weaknesses and real strengths.
  const ordered = [...SUBCATEGORIES].sort((a, b) => scoreOf(a.id) - scoreOf(b.id));

  // Lesson + paired practice, kept adjacent in the fill queue.
  const queue = [];
  ordered.forEach((s) => {
    if (!completedLessons.has(s.id)) {
      queue.push({ type: 'lesson', subcategoryId: s.id, label: s.name, estMinutes: LESSON_MINUTES });
    }
    queue.push({ type: 'practice', subcategoryId: s.id, label: s.name, estMinutes: PRACTICE_MINUTES });
  });

  const pushTask = (day, t) => {
    tasks.push({
      id: makeTaskId(),
      date: day,
      type: t.type,
      subcategoryId: t.subcategoryId || null,
      ...(t.type === 'review' ? { subcategoryIds: t.subcategoryIds || [] } : {}),
      label: t.label,
      estMinutes: t.estMinutes,
      status: 'pending',
      completedAt: null,
    });
  };

  let qi = 0;
  for (const day of learningDays) {
    if (qi >= queue.length) break;
    let left = minutes;
    let placed = 0;
    while (qi < queue.length && (queue[qi].estMinutes <= left || placed === 0)) {
      const t = queue[qi];
      qi += 1;
      pushTask(day, t);
      left -= t.estMinutes;
      placed += 1;
    }
  }
  // Runway too short: the weakest (highest-impact) skills were placed first;
  // whatever is left falls off the plan and the flag records it.
  plan.truncated = qi < queue.length;

  // Review buffer: mixed practice of the weakest domains.
  const domainAgg = {};
  ordered.forEach((s) => {
    if (!domainAgg[s.domain]) {
      domainAgg[s.domain] = { id: s.domain, name: s.domainName, subs: [], sum: 0 };
    }
    domainAgg[s.domain].subs.push(s.id); // ordered => weakest-first within each domain
    domainAgg[s.domain].sum += scoreOf(s.id);
  });
  const domainOrder = Object.values(domainAgg).sort(
    (a, b) => a.sum / a.subs.length - b.sum / b.subs.length,
  );

  const reviewPerDay = Math.min(REVIEW_MAX_PER_DAY, Math.max(1, Math.floor(minutes / REVIEW_MINUTES)));
  reviewDays.forEach((day, dayIdx) => {
    for (let k = 0; k < reviewPerDay; k += 1) {
      const domain = domainOrder[(dayIdx * reviewPerDay + k) % domainOrder.length];
      if (!domain) break;
      pushTask(day, {
        type: 'review',
        subcategoryId: null,
        subcategoryIds: domain.subs.slice(0, REVIEW_MAX_SUBCATS),
        label: `Review: ${DOMAINS[domain.id]?.name || domain.name}`,
        estMinutes: REVIEW_MINUTES,
      });
    }
  });

  return plan;
};

/**
 * Carry completed-task credit from an old plan into a freshly generated one
 * ("Edit settings" regeneration must never erase finished work). Matches by
 * type + subcategoryId (review: type + label) and keeps the old createdAt so
 * quiz-reconciliation continuity survives regeneration.
 */
export const carryCompletedCredit = (oldPlan, newPlan) => {
  if (!newPlan) return newPlan;
  const carried = oldPlan?.createdAt ? { ...newPlan, createdAt: oldPlan.createdAt } : { ...newPlan };
  if (!oldPlan?.tasks?.length || !carried.tasks?.length) return carried;
  const tasks = carried.tasks.map((t) => ({ ...t }));
  oldPlan.tasks.forEach((old) => {
    if (old.status !== 'completed') return;
    const match = tasks.find((t) => (
      t.status === 'pending' &&
      t.type === old.type &&
      (t.type === 'review'
        ? t.label === old.label
        : (t.subcategoryId || null) === (old.subcategoryId || null))
    ));
    if (match) {
      match.status = 'completed';
      match.completedAt = old.completedAt || new Date().toISOString();
      // Keep the consumed-quiz marker so reconcile-after-generate cannot
      // spend the same quiz on a second task.
      if (old.completedBy) match.completedBy = old.completedBy;
    }
  });
  return { ...carried, tasks };
};

// -------------------------------------------------------------- task status --

/** Pure: plan with one task's status changed (completedAt stamped/cleared). */
export const applyTaskStatus = (plan, taskId, status) => ({
  ...plan,
  tasks: (plan.tasks || []).map((t) => (
    t.id === taskId
      ? { ...t, status, completedAt: status === 'completed' ? new Date().toISOString() : null }
      : t
  )),
});

/**
 * Toggle a task. Pass the in-memory plan to skip the read (0 reads + 1 write);
 * without it the plan is fetched first (read-modify-write). Returns the saved
 * plan.
 */
export const updateTaskStatus = async (uid, taskId, status, existingPlan = null) => {
  const plan = existingPlan || (await getStudyPlan(uid));
  if (!plan) throw new Error('No study plan to update');
  const updated = applyTaskStatus(plan, taskId, status);
  return saveStudyPlan(uid, updated);
};

// -------------------------------------------------------------------- replan --

/**
 * Redistribute all PENDING tasks over the remaining available days (today
 * .. examDate-1, minus rest days) at the same daily budget. Completed tasks
 * keep their original dates and credit. Pending lesson/practice tasks refill
 * the learning days in their existing (weakest-first) order; pending review
 * tasks move back onto the final (up to) two available days. Overflow stacks
 * on the last usable day rather than dropping work.
 */
export const replan = async (uid, existingPlan = null) => {
  const plan = existingPlan || (await getStudyPlan(uid));
  if (!plan) return null;

  const today = todayISO();
  const minutes = Math.max(15, Number(plan.minutesPerDay) || 60);

  const byDate = (a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0);
  const completed = (plan.tasks || []).filter((t) => t.status === 'completed');
  const pending = (plan.tasks || []).filter((t) => t.status !== 'completed').sort(byDate);
  const pendingLearn = pending.filter((t) => t.type !== 'review');
  const pendingReview = pending.filter((t) => t.type === 'review');

  // "From today": today itself is actionable when it is not a rest day.
  const available = availableDays(today, plan.examDate, plan.restDays);
  if (available.length === 0) return plan; // nothing left to spread over

  const reviewDays = pendingReview.length > 0
    ? available.slice(-Math.min(REVIEW_DAY_COUNT, available.length))
    : [];
  const learningDays = available.slice(0, available.length - reviewDays.length);
  const learnTargets = learningDays.length > 0 ? learningDays : [available[0]];

  const redistributed = [];
  let li = 0;
  for (let di = 0; di < learnTargets.length && li < pendingLearn.length; di += 1) {
    const day = learnTargets[di];
    const isLastDay = di === learnTargets.length - 1;
    let left = minutes;
    let placed = 0;
    while (li < pendingLearn.length && (isLastDay || pendingLearn[li].estMinutes <= left || placed === 0)) {
      redistributed.push({ ...pendingLearn[li], date: day });
      left -= pendingLearn[li].estMinutes;
      li += 1;
      placed += 1;
      if (!isLastDay && left <= 0) break;
    }
  }

  if (reviewDays.length > 0) {
    const reviewPerDay = Math.max(1, Math.ceil(pendingReview.length / reviewDays.length));
    pendingReview.forEach((t, i) => {
      const day = reviewDays[Math.min(Math.floor(i / reviewPerDay), reviewDays.length - 1)];
      redistributed.push({ ...t, date: day });
    });
  }

  const updated = {
    ...plan,
    tasks: [...completed, ...redistributed].sort(byDate),
  };
  return saveStudyPlan(uid, updated);
};

// ------------------------------------------------------------ reconciliation --

/**
 * The user's recently completed quizzes for reconcile: ONE query on
 * smartQuizzes (two equality filters, so no composite index needed),
 * limit 100, sorted client-side by createdAt ascending.
 */
export const getRecentCompletedQuizzes = async (uid) => {
  if (!uid) return [];
  const snap = await getDocs(query(
    collection(db, SMARTQUIZ_COLLECTION),
    where('userId', '==', uid),
    where('status', '==', 'completed'),
    limit(100),
  ));
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => toMillis(a.createdAt) - toMillis(b.createdAt));
};

/**
 * Quiz -> canonical subcategory ids. P1-B builder quizzes carry both what was
 * requested (builderConfig.subcategoryIds) and what was actually served
 * (metaSubcategoryIds); classic single-skill quizzes carry subcategoryId.
 */
const quizSubcategorySet = (quiz) => {
  const subs = new Set();
  const collect = (v) => {
    const id = toCanonicalSubcategoryId(v);
    if (id) subs.add(id);
  };
  (quiz?.builderConfig?.subcategoryIds || []).forEach(collect);
  (quiz?.metaSubcategoryIds || []).forEach(collect);
  collect(quiz?.subcategoryId);
  return subs;
};

/**
 * PURE reconcile: auto-complete tasks the user already did elsewhere.
 *  - pending LESSON tasks whose subcategory is completed in lessonProgress
 *  - pending PRACTICE/REVIEW tasks with a matching completed quiz created
 *    after plan.createdAt (practice: quiz covers the task's subcategory;
 *    review: quiz overlaps the task's mixed set). Each quiz credits at most
 *    ONE task EVER — the credited task records completedBy = quiz.id, and
 *    already-spent quiz ids are skipped on later reconciles (idempotent).
 *    Earliest-dated task claims first, so one session never wipes a week.
 * Returns { plan, changed } without touching Firestore.
 */
export const reconcileTasks = (plan, { lessonProgress = {}, recentQuizzes = [] } = {}) => {
  if (!plan || !Array.isArray(plan.tasks) || plan.tasks.length === 0) {
    return { plan, changed: false };
  }

  const planCreatedMs = toMillis(plan.createdAt);
  const tasks = plan.tasks.map((t) => ({ ...t }));
  let changed = false;

  // Lessons completed in the Lectures catalog (P1-D).
  const lessonDoneAt = {};
  Object.entries(lessonProgress || {}).forEach(([key, data]) => {
    const id = toCanonicalSubcategoryId(key);
    if (id && data?.status === 'completed') {
      lessonDoneAt[id] = toMillis(data.completedAt) || Date.now();
    }
  });
  tasks.forEach((t) => {
    if (t.type === 'lesson' && t.status === 'pending' && t.subcategoryId && lessonDoneAt[t.subcategoryId]) {
      t.status = 'completed';
      t.completedAt = new Date(lessonDoneAt[t.subcategoryId]).toISOString();
      changed = true;
    }
  });

  // Practice/review tasks matched by completed quizzes newer than the plan.
  // Quiz ids already spent on a task (completedBy) never credit again.
  const spentQuizIds = new Set(tasks.map((t) => t.completedBy).filter(Boolean));
  const quizzes = (recentQuizzes || [])
    .filter((q) => (
      (q.status === undefined || q.status === 'completed') &&
      toMillis(q.createdAt) > planCreatedMs &&
      !(q.id && spentQuizIds.has(q.id))
    ))
    .sort((a, b) => toMillis(a.createdAt) - toMillis(b.createdAt));
  const claimable = tasks
    .filter((t) => (t.type === 'practice' || t.type === 'review') && t.status === 'pending')
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  const consumed = new Set();
  quizzes.forEach((q) => {
    const subs = quizSubcategorySet(q);
    if (subs.size === 0) return;
    const match = claimable.find((t) => {
      if (consumed.has(t.id) || t.status !== 'pending') return false;
      if (t.type === 'practice') return subs.has(t.subcategoryId);
      const wanted = (t.subcategoryIds || []).length > 0 ? t.subcategoryIds : [t.subcategoryId];
      return wanted.some((id) => id && subs.has(id));
    });
    if (match) {
      consumed.add(match.id);
      match.status = 'completed';
      const doneMs = toMillis(q.completedAt) || toMillis(q.createdAt) || Date.now();
      match.completedAt = new Date(doneMs).toISOString();
      if (q.id) match.completedBy = q.id;
      changed = true;
    }
  });

  return changed ? { plan: { ...plan, tasks }, changed: true } : { plan, changed: false };
};

/**
 * Reconcile against real activity and persist ONLY when something changed.
 * Returns { plan, changed } with the (possibly saved) plan.
 */
export const reconcilePlan = async (uid, plan, { lessonProgress = {}, recentQuizzes = [] } = {}) => {
  const result = reconcileTasks(plan, { lessonProgress, recentQuizzes });
  if (!uid || !result.changed) return result;
  const saved = await saveStudyPlan(uid, result.plan);
  return { plan: saved, changed: true };
};

// ---------------------------------------------------------- shared helpers --
// Used by BOTH PlannerPage and the Home dashboard widget — one source of
// truth for counts and for how a plan task becomes a real practice session.

/**
 * Plan counts + the next actionable task (earliest pending; overdue first).
 * `remaining` = pending tasks dated today or later (mutually exclusive with
 * `overdue` = pending tasks dated before today).
 */
export const getPlanStats = (plan, today = todayISO()) => {
  const tasks = plan?.tasks || [];
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === 'completed').length;
  const overdue = tasks.filter((t) => t.status === 'pending' && t.date < today).length;
  const remaining = tasks.filter((t) => t.status === 'pending' && t.date >= today).length;
  const pending = tasks
    .map((t, idx) => ({ t, idx }))
    .filter(({ t }) => t.status === 'pending')
    .sort((a, b) => (a.t.date < b.t.date ? -1 : a.t.date > b.t.date ? 1 : a.idx - b.idx));
  return {
    total,
    completed,
    overdue,
    remaining,
    pct: total > 0 ? Math.round((completed / total) * 100) : 0,
    nextTask: pending.length > 0 ? pending[0].t : null,
  };
};

/**
 * The ONE createCustomSmartQuiz (P1-B) config a practice/review task starts
 * with: 10 untimed tutor-mode questions from the task's subcategories.
 */
export const buildPracticeQuizConfig = (task) => ({
  subcategoryIds: ((task?.subcategoryIds?.length ? task.subcategoryIds : [task?.subcategoryId]) || [])
    .filter(Boolean),
  questionCount: PRACTICE_QUESTION_COUNT,
  tutorMode: true,
  timerMode: 'untimed',
  pool: 'all',
});
