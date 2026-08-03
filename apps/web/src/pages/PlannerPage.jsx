/**
 * PlannerPage — P2-A Study Planner (/planner).
 *
 * UWorld-style day-by-day plan in our design language. States:
 *  1. No test date  -> intro + ExamDateCard (the P0 card writes examDate to
 *     users/{uid}, same field every reader uses).
 *  2. Date, no plan (or "Edit settings") -> availability setup (minutes/day
 *     chips + rest-day toggles) and Generate. Regenerating keeps completed
 *     task credit (carryCompletedCredit + reconcile-after-generate).
 *  3. Plan view -> countdown, progress bar with Completed/Overdue/Remaining
 *     chips, Replan (inline confirm) + Edit settings, Upcoming/Overdue tabs,
 *     day-grouped task rows with checkbox + Start actions.
 *
 * Load cost: plan path = 1 read + up to 2 reconcile queries (fetched only
 * when matching pending task types exist), so <= 3 queries; the reconcile
 * write happens only when something changed. Setup path = 2 reads (plan miss
 * + profile).
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import ExamDateCard, { formatExamDate } from '../components/ExamDateCard';
import { getAllLessonProgress } from '../firebase/lessonProgressServices';
import {
  addDaysISO,
  buildPracticeQuizConfig,
  carryCompletedCredit,
  fetchSubcategoryAccuracy,
  generatePlan,
  getPlanStats,
  getRecentCompletedQuizzes,
  getStudyPlan,
  reconcilePlan,
  reconcileTasks,
  replan,
  saveStudyPlan,
  todayISO,
  updateTaskStatus,
} from '../firebase/studyPlanServices';
import { createCustomSmartQuiz } from '../utils/smartQuizUtils';
import {
  FiAlertCircle,
  FiBookOpen,
  FiCalendar,
  FiCheckCircle,
  FiChevronDown,
  FiChevronUp,
  FiClock,
  FiEdit3,
  FiPlay,
  FiRefreshCw,
  FiSliders,
  FiZap,
} from 'react-icons/fi';
import './PlannerPage.css';

const MINUTE_OPTIONS = [30, 45, 60, 90];
const WEEKDAYS = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
];
const VISIBLE_DAYS = 7; // days shown before "Show full plan"

const TYPE_CHIP = {
  lesson: { label: 'Lesson', className: 'ut-chip ut-chip--accent pl-type' },
  practice: { label: 'Practice', className: 'ut-chip pl-chip--practice pl-type' },
  review: { label: 'Review', className: 'ut-chip pl-type' },
};

/** 'YYYY-MM-DD' -> 'Mon, Aug 3' (UTC so the calendar day never shifts). */
const shortDate = (iso) => {
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) return iso;
  return new Date(ms).toLocaleDateString('en-US', {
    timeZone: 'UTC', weekday: 'short', month: 'short', day: 'numeric',
  });
};

const completedDateText = (isoDateTime) => {
  const ms = Date.parse(isoDateTime || '');
  if (Number.isNaN(ms)) return '';
  return new Date(ms).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const isValidFutureDate = (value) =>
  typeof value === 'string' && !Number.isNaN(Date.parse(value)) && value > todayISO();

const PlannerPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null); // fetched only on the no-plan path
  const [plan, setPlan] = useState(null);

  // Availability controls (setup + Edit settings share these).
  const [minutesPerDay, setMinutesPerDay] = useState(60);
  const [restDays, setRestDays] = useState(() => new Set());

  const [editingSettings, setEditingSettings] = useState(false);
  const [changingDate, setChangingDate] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState('');
  const [tab, setTab] = useState('upcoming');
  const [showFullPlan, setShowFullPlan] = useState(false);
  const [confirmReplan, setConfirmReplan] = useState(false);
  const [replanning, setReplanning] = useState(false);
  const [startingTaskId, setStartingTaskId] = useState(null);
  const [actionError, setActionError] = useState('');

  // Reconcile inputs cached from load so Edit-settings regeneration can keep
  // quiz credit without refetching.
  const quizzesRef = useRef(null);

  const today = todayISO();

  // ------------------------------------------------------------------ load --
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!currentUser) return;
      try {
        const existingPlan = await getStudyPlan(currentUser.uid);
        if (cancelled) return;

        if (!existingPlan) {
          // Setup path: need the profile's examDate (2 reads total).
          const userSnap = await getDoc(doc(db, 'users', currentUser.uid));
          if (!cancelled) setProfile(userSnap.exists() ? userSnap.data() : {});
          return;
        }

        setMinutesPerDay(existingPlan.minutesPerDay || 60);
        setRestDays(new Set(existingPlan.restDays || []));

        // Reconcile inputs are fetched only when a matching pending task type
        // exists, keeping the plan-path load at <= 3 queries.
        const tasks = existingPlan.tasks || [];
        const needsLessons = tasks.some((t) => t.type === 'lesson' && t.status === 'pending');
        const needsQuizzes = tasks.some(
          (t) => (t.type === 'practice' || t.type === 'review') && t.status === 'pending',
        );
        const [lessonProgress, recentQuizzes] = await Promise.all([
          needsLessons ? getAllLessonProgress(currentUser.uid) : Promise.resolve({}),
          needsQuizzes ? getRecentCompletedQuizzes(currentUser.uid) : Promise.resolve([]),
        ]);
        quizzesRef.current = needsQuizzes ? recentQuizzes : null;
        const { plan: reconciled } = await reconcilePlan(currentUser.uid, existingPlan, {
          lessonProgress,
          recentQuizzes,
        });
        if (!cancelled) setPlan(reconciled);
      } catch (e) {
        console.error('[Planner] load failed:', e);
        if (!cancelled) setActionError('Could not load your plan. Refresh to try again.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [currentUser]);

  // -------------------------------------------------------------- generate --
  // Fresh setup AND Edit-settings regeneration. Regeneration carries credit:
  // completed tasks from the old plan transfer (carryCompletedCredit), then a
  // reconcile pass against cached quizzes runs BEFORE the single save.
  const handleGenerate = async () => {
    if (!currentUser || generating) return;
    const examDate = profile?.examDate || plan?.examDate;
    if (!isValidFutureDate(examDate)) {
      setGenError('Set a future test date first.');
      setChangingDate(true);
      return;
    }
    setGenerating(true);
    setGenError('');
    setActionError('');
    try {
      const [subcategoryAccuracy, lessonProgress] = await Promise.all([
        fetchSubcategoryAccuracy(currentUser.uid),
        getAllLessonProgress(currentUser.uid),
      ]);

      let fresh = generatePlan({
        examDate,
        minutesPerDay,
        restDays: [...restDays],
        lessonProgress,
        subcategoryAccuracy,
      });
      if (!fresh.tasks.length) {
        setGenError('There is not enough time before your test date to schedule work. Pick a later date or fewer rest days.');
        return;
      }

      if (plan) {
        fresh = carryCompletedCredit(plan, fresh);
        if (!quizzesRef.current) {
          quizzesRef.current = await getRecentCompletedQuizzes(currentUser.uid);
        }
        fresh = reconcileTasks(fresh, {
          lessonProgress,
          recentQuizzes: quizzesRef.current,
        }).plan;
      }

      const saved = await saveStudyPlan(currentUser.uid, fresh);
      setPlan(saved);
      setEditingSettings(false);
      setChangingDate(false);
      setTab('upcoming');
      setShowFullPlan(false);
    } catch (e) {
      console.error('[Planner] generate failed:', e);
      setGenError('Could not build your plan right now. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  // ---------------------------------------------------------------- replan --
  const handleReplan = async () => {
    if (!currentUser || replanning || !plan) return;
    setReplanning(true);
    setActionError('');
    try {
      const updated = await replan(currentUser.uid, plan);
      if (updated) setPlan(updated);
      setConfirmReplan(false);
    } catch (e) {
      console.error('[Planner] replan failed:', e);
      setActionError('Could not replan right now. Please try again.');
    } finally {
      setReplanning(false);
    }
  };

  // ---------------------------------------------------------- task actions --
  const toggleTask = async (task) => {
    if (!currentUser || !plan) return;
    const nextStatus = task.status === 'completed' ? 'pending' : 'completed';
    const prev = plan;
    // Optimistic flip; updateTaskStatus persists (0 extra reads: plan passed in).
    setPlan((p) => ({
      ...p,
      tasks: p.tasks.map((t) => (
        t.id === task.id
          ? { ...t, status: nextStatus, completedAt: nextStatus === 'completed' ? new Date().toISOString() : null }
          : t
      )),
    }));
    try {
      const saved = await updateTaskStatus(currentUser.uid, task.id, nextStatus, prev);
      setPlan(saved);
    } catch (e) {
      console.error('[Planner] toggle failed:', e);
      setPlan(prev);
      setActionError('Could not save that change. Please try again.');
    }
  };

  const startTask = async (task) => {
    if (!currentUser || startingTaskId) return;
    setActionError('');
    if (task.type === 'lesson' && task.subcategoryId) {
      navigate(`/learn/${task.subcategoryId}`);
      return;
    }
    setStartingTaskId(task.id);
    try {
      const { quizId } = await createCustomSmartQuiz(
        currentUser.uid,
        buildPracticeQuizConfig(task),
      );
      navigate(`/smart-quiz/${quizId}`);
    } catch (e) {
      console.error('[Planner] start failed:', e);
      setActionError(e?.message || 'Could not build that practice set. Please try again.');
      setStartingTaskId(null);
    }
  };

  // --------------------------------------------------------------- derived --
  const effectiveExamDate = profile?.examDate || plan?.examDate || null;
  const daysToExam = useMemo(() => {
    if (!effectiveExamDate) return null;
    const ms = Date.parse(effectiveExamDate) - Date.now();
    return !Number.isNaN(ms) && ms > 0 ? Math.ceil(ms / 86400000) : null;
  }, [effectiveExamDate]);

  const stats = useMemo(() => getPlanStats(plan, today), [plan, today]);
  const allDone = stats.total > 0 && stats.completed === stats.total;

  const upcomingGroups = useMemo(() => {
    const tasks = (plan?.tasks || [])
      .filter((t) => t.date >= today)
      .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
    const groups = [];
    tasks.forEach((t) => {
      const last = groups[groups.length - 1];
      if (last && last.date === t.date) last.tasks.push(t);
      else groups.push({ date: t.date, tasks: [t] });
    });
    return groups;
  }, [plan, today]);

  const horizonDate = addDaysISO(today, VISIBLE_DAYS);
  const visibleGroups = showFullPlan ? upcomingGroups : upcomingGroups.filter((g) => g.date < horizonDate);
  const hiddenDayCount = upcomingGroups.length - visibleGroups.length;

  const overdueTasks = useMemo(() => (
    (plan?.tasks || [])
      .filter((t) => t.status === 'pending' && t.date < today)
      .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
  ), [plan, today]);

  const planDatePassed = !!plan && !isValidFutureDate(plan.examDate) && !isValidFutureDate(profile?.examDate);

  const dayLabel = (iso) => {
    if (iso === today) return 'Today';
    if (iso === addDaysISO(today, 1)) return 'Tomorrow';
    return shortDate(iso);
  };

  // -------------------------------------------------------------- renderers --
  const renderTaskRow = (task, { showDate = false } = {}) => {
    const chip = TYPE_CHIP[task.type] || TYPE_CHIP.practice;
    const done = task.status === 'completed';
    return (
      <div key={task.id} className={`pl-task ${done ? 'pl-task--done' : ''}`}>
        <input
          type="checkbox"
          className="pl-task-check"
          checked={done}
          onChange={() => toggleTask(task)}
          aria-label={done ? `Mark "${task.label}" as not done` : `Mark "${task.label}" as done`}
        />
        <span className={chip.className}>{chip.label}</span>
        <span className="pl-task-label">
          {done && <FiCheckCircle className="pl-task-done-icon" aria-hidden="true" />}
          <span className={done ? 'pl-task-strike' : ''}>{task.label}</span>
        </span>
        <span className="pl-task-min"><FiClock aria-hidden="true" /> {task.estMinutes} min</span>
        {showDate && !done && <span className="pl-task-date">{shortDate(task.date)}</span>}
        {done ? (
          <span className="pl-task-date">{completedDateText(task.completedAt)}</span>
        ) : (
          <button
            type="button"
            className="ut-btn ut-btn--soft ut-btn--sm pl-task-start"
            onClick={() => startTask(task)}
            disabled={!!startingTaskId}
          >
            {startingTaskId === task.id
              ? <><span className="pl-spinner" aria-hidden="true" /> Building...</>
              : <>{task.type === 'lesson' ? <FiBookOpen aria-hidden="true" /> : <FiPlay aria-hidden="true" />} Start</>}
          </button>
        )}
      </div>
    );
  };

  const renderAvailabilityControls = () => (
    <>
      <div className="pl-field">
        <span className="ut-label">Minutes per day</span>
        <div className="pl-options" role="group" aria-label="Minutes per day">
          {MINUTE_OPTIONS.map((m) => (
            <button
              key={m}
              type="button"
              className={`pl-opt ${minutesPerDay === m ? 'pl-opt--on' : ''}`}
              onClick={() => setMinutesPerDay(m)}
              aria-pressed={minutesPerDay === m}
            >
              {m} min
            </button>
          ))}
        </div>
      </div>
      <div className="pl-field">
        <span className="ut-label">Rest days</span>
        <div className="pl-options" role="group" aria-label="Rest days (no work scheduled)">
          {WEEKDAYS.map((d) => (
            <button
              key={d.value}
              type="button"
              className={`pl-opt pl-opt--day ${restDays.has(d.value) ? 'pl-opt--on' : ''}`}
              onClick={() => setRestDays((prev) => {
                const next = new Set(prev);
                if (next.has(d.value)) next.delete(d.value); else next.add(d.value);
                return next;
              })}
              aria-pressed={restDays.has(d.value)}
            >
              {d.label}
            </button>
          ))}
        </div>
        <p className="pl-hint">We will not schedule any work on rest days.</p>
      </div>
    </>
  );

  const renderSetupCard = ({ editing }) => (
    <div className="ut-card ut-card--accent pl-setup-card">
      <div className="pl-setup-head">
        <span className="ut-tile"><FiCalendar aria-hidden="true" /></span>
        <div>
          <h2 className="ut-card-title">{editing ? 'Edit your plan settings' : 'Build your plan'}</h2>
          <p className="ut-card-sub">
            {isValidFutureDate(effectiveExamDate) ? (
              <>
                Test day: <b>{formatExamDate(effectiveExamDate)}</b>
                {daysToExam ? <> — {daysToExam} days out.</> : null}{' '}
                <button type="button" className="ut-link pl-change-date" onClick={() => setChangingDate((v) => !v)}>
                  Change date
                </button>
              </>
            ) : (
              <>Your saved test date has passed — set a new one below to rebuild.</>
            )}
          </p>
        </div>
      </div>

      {(changingDate || !isValidFutureDate(effectiveExamDate)) && (
        <div className="pl-setup-date">
          <ExamDateCard
            examDate={isValidFutureDate(effectiveExamDate) ? effectiveExamDate : undefined}
            targetScore={profile?.targetScore}
            onSaved={(updates) => {
              setProfile((prev) => ({ ...(prev || {}), ...updates }));
              setChangingDate(false);
            }}
            onCancel={isValidFutureDate(effectiveExamDate) ? () => setChangingDate(false) : undefined}
          />
        </div>
      )}

      {renderAvailabilityControls()}
      {editing && (
        <p className="pl-hint">
          Regenerating rebuilds your schedule from today. Anything you already
          completed stays completed.
        </p>
      )}
      {genError && <p className="pl-error" role="alert">{genError}</p>}
      <div className="pl-setup-actions">
        <button
          type="button"
          className="ut-btn ut-btn--primary ut-btn--lg"
          onClick={handleGenerate}
          disabled={generating || !isValidFutureDate(effectiveExamDate)}
        >
          <FiZap aria-hidden="true" /> {editing ? 'Regenerate my plan' : 'Generate my plan'}
        </button>
        {editing && (
          <button
            type="button"
            className="ut-btn ut-btn--ghost"
            onClick={() => { setEditingSettings(false); setChangingDate(false); setGenError(''); }}
            disabled={generating}
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );

  // ---------------------------------------------------------------- states --
  if (loading) {
    return (
      <div className="ut-page pl-page" role="status" aria-label="Loading study plan">
        <div className="ut-skeleton ut-skeleton--title" style={{ marginBottom: 18 }} />
        <div className="ut-grid ut-grid--3" style={{ marginBottom: 18 }}>
          <div className="ut-skeleton ut-skeleton--stat" />
          <div className="ut-skeleton ut-skeleton--stat" />
          <div className="ut-skeleton ut-skeleton--stat" />
        </div>
        <div className="ut-skeleton-stack">
          <div className="ut-skeleton ut-skeleton--row" />
          <div className="ut-skeleton ut-skeleton--row" />
          <div className="ut-skeleton ut-skeleton--row" />
          <div className="ut-skeleton ut-skeleton--row" />
        </div>
      </div>
    );
  }

  const header = (
    <header className="ut-page-head">
      <div className="ut-page-head-main">
        <p className="ut-eyebrow">Plan</p>
        <h1 className="ut-page-title">Study Planner</h1>
        <p className="ut-page-sub">
          A day-by-day schedule built from your test date, your availability, and your
          weakest skills — with the final two days reserved for review.
        </p>
      </div>
    </header>
  );

  // State 1: no usable test date and no plan yet.
  if (!plan && !isValidFutureDate(profile?.examDate)) {
    return (
      <div className="ut-page pl-page">
        {header}
        <div className="pl-setup-col">
          <div className="ut-card pl-intro">
            <span className="ut-tile"><FiCalendar aria-hidden="true" /></span>
            <div>
              <h2 className="ut-card-title">First, when is your SAT?</h2>
              <p className="ut-card-sub">
                Your plan counts backward from test day. Set the date below and we will
                lay out exactly what to do each day between now and then.
              </p>
            </div>
          </div>
          <ExamDateCard
            examDate={profile?.examDate}
            targetScore={profile?.targetScore}
            onSaved={(updates) => setProfile((prev) => ({ ...(prev || {}), ...updates }))}
          />
        </div>
      </div>
    );
  }

  // State 2: setup (no plan yet) or Edit settings (plan exists).
  if (!plan || editingSettings) {
    return (
      <div className="ut-page pl-page">
        {header}
        {generating ? (
          <div className="ut-skeleton-stack" role="status" aria-label="Building your plan">
            <div className="ut-skeleton ut-skeleton--card" />
            <div className="ut-skeleton ut-skeleton--row" />
            <div className="ut-skeleton ut-skeleton--row" />
            <div className="ut-skeleton ut-skeleton--row" />
          </div>
        ) : renderSetupCard({ editing: !!plan })}
      </div>
    );
  }

  // State 3: plan view.
  return (
    <div className="ut-page pl-page">
      {header}

      {planDatePassed && (
        <div className="pl-banner" role="alert">
          <FiAlertCircle aria-hidden="true" />
          <span className="pl-banner-text">
            Your test date has passed — set a new date to rebuild your plan.
          </span>
          <button
            type="button"
            className="ut-btn ut-btn--primary ut-btn--sm"
            onClick={() => { setEditingSettings(true); setChangingDate(true); }}
          >
            <FiEdit3 aria-hidden="true" /> Set a new test date
          </button>
        </div>
      )}

      {/* ------------------------------------------------------- header row -- */}
      <div className="pl-header-grid">
        <div className="ut-card pl-head-card">
          <div className="ut-stat">
            <span className="ut-stat-value">{daysToExam ?? 0} <small>days</small></span>
            <span className="ut-stat-label">Until your SAT</span>
          </div>
          <p className="pl-head-sub">
            <FiCalendar aria-hidden="true" /> {formatExamDate(plan.examDate) || 'No date set'}
          </p>
        </div>

        <div className="ut-card pl-head-card">
          <div className="pl-progress-top">
            <span className="ut-label">Plan progress</span>
            <span className="pl-progress-pct">{stats.pct}%</span>
          </div>
          <div className="ut-progress ut-progress--lg" aria-label={`${stats.completed} of ${stats.total} tasks completed`}>
            <span className="ut-progress-fill" style={{ width: `${Math.max(stats.pct, 2)}%` }} />
          </div>
          <div className="pl-legend">
            <span className="ut-chip ut-chip--accent">Completed {stats.completed}</span>
            <span className={`ut-chip ${stats.overdue > 0 ? 'ut-chip--hard' : ''}`}>
              Overdue {stats.overdue}
            </span>
            <span className="ut-chip">Remaining {stats.remaining}</span>
          </div>
          {plan.truncated && (
            <p className="pl-note">
              Short runway: your weakest skills were scheduled first; the rest
              did not fit before test day.
            </p>
          )}
        </div>

        <div className="ut-card pl-head-card">
          {confirmReplan ? (
            <div className="pl-replan-confirm">
              <p className="ut-card-sub">
                Redistributes your remaining tasks from today — completed work is kept.
              </p>
              <div className="pl-replan-actions">
                <button
                  type="button"
                  className="ut-btn ut-btn--primary ut-btn--sm"
                  onClick={handleReplan}
                  disabled={replanning}
                >
                  {replanning ? 'Replanning...' : 'Yes, replan'}
                </button>
                <button
                  type="button"
                  className="ut-btn ut-btn--ghost ut-btn--sm"
                  onClick={() => setConfirmReplan(false)}
                  disabled={replanning}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <h3 className="ut-card-title">Adjust your plan</h3>
              <p className="ut-card-sub">Fallen behind, or has your schedule changed?</p>
              <div className="pl-replan-actions">
                <button
                  type="button"
                  className="ut-btn ut-btn--ghost ut-btn--sm"
                  onClick={() => setConfirmReplan(true)}
                >
                  <FiRefreshCw aria-hidden="true" /> Replan
                </button>
                <button
                  type="button"
                  className="ut-btn ut-btn--ghost ut-btn--sm"
                  onClick={() => { setEditingSettings(true); setGenError(''); }}
                >
                  <FiSliders aria-hidden="true" /> Edit settings
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {actionError && <p className="pl-error" role="alert">{actionError}</p>}

      {allDone ? (
        <div className="ut-card ut-card--accent pl-alldone">
          <FiCheckCircle className="pl-alldone-icon" aria-hidden="true" />
          <div>
            <h2 className="ut-card-title">Plan complete</h2>
            <p className="ut-card-sub">
              Every task is done. Keep your edge with mixed practice, or rebuild
              a fresh plan from your latest results.
            </p>
          </div>
          <div className="pl-alldone-actions">
            <button type="button" className="ut-btn ut-btn--primary" onClick={() => navigate('/practice')}>
              <FiPlay aria-hidden="true" /> Keep practicing
            </button>
            <button
              type="button"
              className="ut-btn ut-btn--ghost"
              onClick={() => { setEditingSettings(true); setGenError(''); }}
            >
              <FiSliders aria-hidden="true" /> Rebuild plan
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* ----------------------------------------------------------- tabs -- */}
          <div className="pl-tabs" role="tablist" aria-label="Plan tasks">
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'upcoming'}
              className={`pl-tab ${tab === 'upcoming' ? 'pl-tab--on' : ''}`}
              onClick={() => setTab('upcoming')}
            >
              Upcoming
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'overdue'}
              className={`pl-tab ${tab === 'overdue' ? 'pl-tab--on' : ''}`}
              onClick={() => setTab('overdue')}
            >
              Overdue
              {stats.overdue > 0 && (
                <span className="ut-chip ut-chip--hard pl-tab-badge">{stats.overdue}</span>
              )}
            </button>
          </div>

          {tab === 'upcoming' ? (
            visibleGroups.length === 0 ? (
              <div className="ut-empty">
                <b>Nothing scheduled ahead</b>
                {stats.overdue > 0
                  ? 'Everything left is overdue — open the Overdue tab or hit Replan to spread it out.'
                  : 'No upcoming tasks on the calendar.'}
              </div>
            ) : (
              <>
                {visibleGroups.map((group) => (
                  <section key={group.date} className="pl-day">
                    <div className="pl-day-head">
                      <span className="pl-day-name">{dayLabel(group.date)}</span>
                      <span className="pl-day-line" aria-hidden="true" />
                      <span className="pl-day-total">
                        {group.tasks.reduce((s, t) => s + (t.estMinutes || 0), 0)} min
                      </span>
                    </div>
                    <div className="pl-day-tasks">
                      {group.tasks.map((task) => renderTaskRow(task))}
                    </div>
                  </section>
                ))}
                {(hiddenDayCount > 0 || showFullPlan) && (
                  <button
                    type="button"
                    className="pl-showall"
                    onClick={() => setShowFullPlan((v) => !v)}
                  >
                    {showFullPlan
                      ? <><FiChevronUp aria-hidden="true" /> Show the next {VISIBLE_DAYS} days only</>
                      : <><FiChevronDown aria-hidden="true" /> Show full plan ({hiddenDayCount} more {hiddenDayCount === 1 ? 'day' : 'days'})</>}
                  </button>
                )}
              </>
            )
          ) : (
            overdueTasks.length === 0 ? (
              <div className="ut-empty">
                <b>All caught up</b>
                Nothing overdue — nice.
              </div>
            ) : (
              <div className="pl-day-tasks">
                {overdueTasks.map((task) => renderTaskRow(task, { showDate: true }))}
              </div>
            )
          )}
        </>
      )}
    </div>
  );
};

export default PlannerPage;
