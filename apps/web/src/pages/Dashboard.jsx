/**
 * HOME (Overhaul Phase B, redesigned in Phase G).
 *
 * Shows ONLY real data: Tier-2 habits + skillState, real in-progress exams,
 * and honest first-steps for new users. Uses the standard app shell and the
 * V3 landing design language (tokens.css + ut-kit.css + Home.css): dark hero
 * panel with the green glow, stat rack, capsule progress bars, mono labels.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, doc, getDoc, getDocs, query, limit } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { getDisplayName } from '../utils/subcategoryTaxonomy';
import ExamDateCard, { ExamDateInline } from '../components/ExamDateCard';
import { getStudyPlan, getPlanStats, buildPracticeQuizConfig } from '../firebase/studyPlanServices';
import { createCustomSmartQuiz } from '../utils/smartQuizUtils';
import {
  FiCheckSquare, FiFlag, FiGrid, FiBookOpen, FiZap, FiArrowRight, FiPlay, FiCalendar,
} from 'react-icons/fi';
import '../styles/Home.css';

const CoachGlyph = () => (
  <svg viewBox="0 0 24 24" fill="none" width="19" height="19" aria-hidden="true">
    <path d="M12 3l1.8 4.7L18.5 9l-4.7 1.8L12 15.5l-1.8-4.7L5.5 9l4.7-1.3L12 3z" fill="var(--ut-accent-bright)" />
    <circle cx="18.5" cy="17" r="2.2" fill="var(--ut-accent-bright)" opacity=".85" />
  </svg>
);

const Dashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [habits, setHabits] = useState(null);
  const [skills, setSkills] = useState([]);
  const [inProgressExams, setInProgressExams] = useState([]);
  const [examCount, setExamCount] = useState(0);
  const [studyPlan, setStudyPlan] = useState(null);
  const [startingPlanTask, setStartingPlanTask] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingExam, setEditingExam] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!currentUser) return;
      try {
        const [userSnap, habitsSnap, skillSnap, progressSnap, examsSnap, planDoc] = await Promise.all([
          getDoc(doc(db, 'users', currentUser.uid)),
          getDoc(doc(db, 'users', currentUser.uid, 'habits', 'summary')),
          getDocs(collection(db, 'users', currentUser.uid, 'skillState')),
          getDocs(collection(db, 'users', currentUser.uid, 'examProgress')),
          getDocs(query(collection(db, 'users', currentUser.uid, 'practiceExams'), limit(50))),
          // P2-A: 1 extra read for the study-plan widget. Reconciliation stays
          // on /planner; a plan-read failure must never break Home.
          getStudyPlan(currentUser.uid).catch((e) => {
            console.warn('[Home] study plan read failed:', e?.message);
            return null;
          }),
        ]);
        if (cancelled) return;
        setProfile(userSnap.exists() ? userSnap.data() : {});
        setHabits(habitsSnap.exists() ? habitsSnap.data() : null);
        setSkills(skillSnap.docs.map((d) => ({ id: d.id, ...d.data() })).filter((s) => s.attempts > 0));
        setInProgressExams(progressSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setExamCount(examsSnap.size);
        setStudyPlan(planDoc && Array.isArray(planDoc.tasks) && planDoc.tasks.length > 0 ? planDoc : null);
      } catch (e) {
        console.error('[Home] load failed:', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [currentUser]);

  const totalAnswered = useMemo(() => skills.reduce((s, x) => s + (x.attempts || 0), 0), [skills]);
  const weakest = useMemo(
    () => [...skills].sort((a, b) => (a.accuracyLast10 ?? 101) - (b.accuracyLast10 ?? 101)).slice(0, 4),
    [skills]
  );
  const isNewUser = !loading && totalAnswered === 0 && examCount === 0;

  const examCountdown = useMemo(() => {
    if (!profile?.examDate) return null;
    const ms = Date.parse(profile.examDate) - Date.now();
    return !Number.isNaN(ms) && ms > 0 ? Math.ceil(ms / 86400000) : null;
  }, [profile]);

  // P2-A study-plan widget: counts + next task via the planner's own helpers.
  const planStats = useMemo(() => (studyPlan ? getPlanStats(studyPlan) : null), [studyPlan]);

  const startPlanTask = async (task) => {
    if (!currentUser || !task || startingPlanTask) return;
    if (task.type === 'lesson' && task.subcategoryId) {
      navigate(`/learn/${task.subcategoryId}`);
      return;
    }
    setStartingPlanTask(true);
    try {
      const { quizId } = await createCustomSmartQuiz(currentUser.uid, buildPracticeQuizConfig(task));
      navigate(`/smart-quiz/${quizId}`);
    } catch (e) {
      console.error('[Home] plan task start failed:', e);
      setStartingPlanTask(false);
    }
  };

  const firstName = (currentUser?.displayName || profile?.displayName || 'there').split(' ')[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const launchers = [
    { label: 'Practice Test', sub: 'Full-length exam', Icon: FiCheckSquare, to: '/practice-exams' },
    { label: 'Question Bank', sub: '5-question skill quizzes', Icon: FiGrid, to: '/subject-quizzes' },
    { label: 'Diagnostic', sub: 'Find your level, free', Icon: FiFlag, to: '/predictive-exam' },
    { label: 'Lectures', sub: 'Learn a skill', Icon: FiBookOpen, to: '/lectures' },
  ];

  const heroSub = examCountdown
    ? <>Your exam is coming up — stay on the plan and it will pay off.</>
    : profile?.targetScore
      ? <>Target score <b>{profile.targetScore}</b>. Every session moves you closer.</>
      : <>Set a target score with your <b>coach</b> to personalize your plan.</>;

  if (loading) {
    return (
      <div className="ut-page" role="status" aria-label="Loading home">
        <div className="ut-skeleton ut-skeleton--card" style={{ height: 280, marginBottom: 22 }} />
        <div className="ut-grid ut-grid--2" style={{ marginBottom: 22 }}>
          <div className="ut-skeleton ut-skeleton--card" />
          <div className="ut-skeleton ut-skeleton--card" />
        </div>
        <div className="ut-grid ut-grid--4">
          <div className="ut-skeleton ut-skeleton--row" />
          <div className="ut-skeleton ut-skeleton--row" />
          <div className="ut-skeleton ut-skeleton--row" />
          <div className="ut-skeleton ut-skeleton--row" />
        </div>
      </div>
    );
  }

  return (
    <div className="ut-page">
      {/* ---------------------------------------------------------- hero -- */}
      <section className="hm-hero">
        <div className="hm-hero-top">
          <div>
            <span className="ut-label ut-label--on-ink">Home</span>
            <h1 className="hm-hero-greeting">{greeting}, {firstName}</h1>
            <p className="hm-hero-sub">{heroSub}</p>
            <div className="hm-hero-cta">
              {inProgressExams.length > 0 ? (
                <button
                  className="ut-btn ut-btn--primary"
                  onClick={() => navigate(`/practice-exam/${inProgressExams[0].practiceExamId || inProgressExams[0].id}`, { state: { resume: true } })}
                >
                  <FiPlay /> Resume your test
                </button>
              ) : (
                <button className="ut-btn ut-btn--primary" onClick={() => navigate(isNewUser ? '/predictive-exam' : '/subject-quizzes')}>
                  {isNewUser ? 'Start the free diagnostic' : 'Practice now'}
                </button>
              )}
              <button
                className="ut-btn ut-btn--ghost"
                style={{ borderColor: 'var(--ut-rule-on-ink)', color: 'var(--ut-on-ink)' }}
                onClick={() => navigate('/coach')}
              >
                <FiZap /> Open Coach
              </button>
            </div>
          </div>

          {examCountdown && (
            <div className="edc-countdown-col">
              <div className="hm-countdown">
                <div className="hm-countdown-num">{examCountdown}</div>
                <div className="hm-countdown-label">days to exam</div>
              </div>
              <ExamDateInline examDate={profile?.examDate} onChange={() => setEditingExam(true)} />
            </div>
          )}
        </div>

        <div className="hm-hero-stats">
          <div className="hm-hero-stat">
            <span className="hm-hero-stat-value"><em>{habits?.streakDays || 0}</em></span>
            <span className="hm-hero-stat-label">Day streak</span>
          </div>
          <div className="hm-hero-stat">
            <span className="hm-hero-stat-value">{totalAnswered}</span>
            <span className="hm-hero-stat-label">Questions practiced</span>
          </div>
          <div className="hm-hero-stat">
            <span className="hm-hero-stat-value">{examCount}</span>
            <span className="hm-hero-stat-label">Exams completed</span>
          </div>
          <div className="hm-hero-stat">
            <span className="hm-hero-stat-value">{skills.length}</span>
            <span className="hm-hero-stat-label">Skills tracked</span>
          </div>
        </div>
      </section>

      {/* ---- exam plan: the one place examDate / targetScore get set ---- */}
      {!loading && (!examCountdown || editingExam) && (
        <ExamDateCard
          examDate={profile?.examDate}
          targetScore={profile?.targetScore}
          onSaved={(updates) => {
            setProfile((prev) => ({ ...(prev || {}), ...updates }));
            setEditingExam(false);
          }}
          onCancel={editingExam ? () => setEditingExam(false) : undefined}
        />
      )}

      {/* ---- Study plan (P2-A): compact status next to the countdown ---- */}
      {planStats ? (
        <div className="ut-card" style={{ marginBottom: 22 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
            <span className="ut-label">Study plan</span>
            <button className="ut-link" onClick={() => navigate('/planner')}>View plan →</button>
          </div>
          <div className="ut-progress" style={{ margin: '12px 0 10px' }}>
            <span
              className="ut-progress-fill"
              style={{ width: `${Math.max(planStats.pct, 2)}%` }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', fontSize: 13, color: 'var(--ut-muted)' }}>
            <span>{planStats.completed}/{planStats.total} tasks</span>
            <span aria-hidden="true">·</span>
            {planStats.overdue > 0 ? (
              <span className="ut-chip ut-chip--hard">{planStats.overdue} overdue</span>
            ) : (
              <span>0 overdue</span>
            )}
          </div>
          {planStats.nextTask ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginTop: 12 }}>
              <span className="ut-card-sub" style={{ flex: 1, minWidth: 200 }}>
                Next: <b style={{ color: 'var(--ut-text)' }}>{planStats.nextTask.label}</b>
                {' '}· {planStats.nextTask.type === 'lesson' ? 'Lesson' : planStats.nextTask.type === 'review' ? 'Review' : 'Practice'}
                {' '}· {planStats.nextTask.estMinutes} min
              </span>
              <button
                className="ut-btn ut-btn--soft ut-btn--sm"
                onClick={() => startPlanTask(planStats.nextTask)}
                disabled={startingPlanTask}
              >
                {startingPlanTask ? 'Building…' : <><FiPlay /> Start</>}
              </button>
            </div>
          ) : (
            <p className="ut-card-sub" style={{ marginTop: 12 }}>
              Plan complete — every task is done.
            </p>
          )}
        </div>
      ) : (
        <div className="ut-card" style={{ marginBottom: 22, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <span className="ut-tile"><FiCalendar /></span>
          <div style={{ flex: 1, minWidth: 220 }}>
            <span className="ut-label">Study plan</span>
            <p className="ut-card-sub" style={{ marginTop: 4 }}>
              Turn your test date into a day-by-day schedule built from your weakest skills.
            </p>
          </div>
          <button className="ut-btn ut-btn--primary" onClick={() => navigate('/planner')}>
            Create your study plan
          </button>
        </div>
      )}

      {isNewUser ? (
        /* -------- first session: honest first steps, no fake numbers -------- */
        <div className="ut-card ut-card--accent" style={{ marginBottom: 22 }}>
          <span className="ut-label ut-label--accent">Your first steps</span>
          <div className="hm-steps" style={{ marginTop: 10 }}>
            {[
              { n: 1, text: 'Take the free diagnostic — it calibrates everything', to: '/predictive-exam', cta: 'Start diagnostic' },
              { n: 2, text: 'Try a 5-question skill quiz from the Question Bank', to: '/subject-quizzes', cta: 'Open Question Bank' },
              { n: 3, text: 'Meet your coach — it remembers everything you practice', to: '/coach', cta: 'Open Coach' },
            ].map((s) => (
              <div key={s.n} className="hm-step">
                <span className="hm-step-num">{s.n}</span>
                <span className="hm-step-text">{s.text}</span>
                <button className="ut-btn ut-btn--soft ut-btn--sm" onClick={() => navigate(s.to)}>
                  {s.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* ---------------- focus skills + coach ---------------- */
        <div className="hm-grid">
          <div className="ut-card">
            <span className="ut-label">Focus skills</span>
            <div style={{ marginTop: 10 }}>
              {weakest.length === 0 ? (
                <div className="ut-empty" style={{ padding: '22px 16px' }}>
                  Take a few quizzes and your weakest skills appear here.
                </div>
              ) : (
                weakest.map((s) => (
                  <button
                    key={s.id}
                    className="hm-focus-row"
                    onClick={() => navigate('/smart-quiz-generator', { state: { subcategoryId: s.id } })}
                    title="Practice this skill"
                  >
                    <span className="hm-focus-name">{getDisplayName(s.id) || s.id}</span>
                    <span className="hm-focus-meter">
                      <span className="ut-progress">
                        <span
                          className="ut-progress-fill"
                          style={{ width: `${Math.max(4, s.accuracyLast10 ?? 0)}%` }}
                        />
                      </span>
                    </span>
                    <span className="hm-focus-acc">{s.accuracyLast10 === null ? '—' : `${s.accuracyLast10}%`}</span>
                    <FiArrowRight className="hm-focus-arrow" />
                  </button>
                ))
              )}
            </div>
            {weakest.length > 0 && (
              <>
                <hr className="ut-divider" />
                <button className="ut-link" onClick={() => navigate('/progress')}>
                  See your full progress analytics →
                </button>
              </>
            )}
          </div>

          <div className="ut-card hm-coach">
            <div className="hm-coach-glyph"><CoachGlyph /></div>
            <h3 className="ut-card-title">Your coach</h3>
            <p className="ut-card-sub" style={{ marginBottom: 14 }}>
              Debriefs after every quiz, micro-lessons on exactly what you miss, and a memory of your whole journey.
            </p>
            <button className="ut-btn ut-btn--soft" onClick={() => navigate('/coach')}>
              <FiZap /> Open Coach
            </button>
          </div>
        </div>
      )}

      {/* -------- launchers -------- */}
      <div className="ut-section-head">
        <h2 className="ut-section-title">Jump in</h2>
      </div>
      <div className="hm-launchers">
        {launchers.map((l) => (
          <button key={l.to} className="hm-launcher" onClick={() => navigate(l.to)}>
            <span className="ut-tile"><l.Icon /></span>
            <span>
              <span className="hm-launcher-label">{l.label}</span>
              <span className="hm-launcher-sub">{l.sub}</span>
            </span>
            <span className="hm-launcher-go">Open <FiArrowRight /></span>
          </button>
        ))}
      </div>

      {isNewUser && (
        <div style={{ marginTop: 22, textAlign: 'center' }}>
          <button className="ut-link" onClick={() => navigate('/progress')}>
            See your full progress analytics →
          </button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
