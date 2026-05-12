import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import UltraSATLogo from '../components/UltraSATLogo';
import '../styles/AICoachPage.css';
import {
  FiArrowRight,
  FiBarChart2,
  FiBell,
  FiBookmark,
  FiBookOpen,
  FiCalendar,
  FiCheck,
  FiCheckCircle,
  FiCheckSquare,
  FiChevronDown,
  FiClock,
  FiFileText,
  FiFlag,
  FiHelpCircle,
  FiHome,
  FiLayers,
  FiList,
  FiMessageCircle,
  FiSend,
  FiRefreshCw,
  FiSearch,
  FiSettings,
  FiShield,
  FiTarget,
  FiTrendingUp,
  FiZap,
} from 'react-icons/fi';

const sidebarItems = [
  { label: 'Overview', path: '/dashboard', icon: FiHome },
  { label: 'Study Plan', path: '/skills', icon: FiFileText },
  { label: 'Practice Tests', path: '/practice-exams', icon: FiCheckSquare },
  { label: 'Official Exams', path: '/predictive-exam', icon: FiFlag },
  { label: 'Question Bank', path: '/subject-quizzes', icon: FiHelpCircle },
  { label: 'Flashcards', path: '/flashcards', icon: FiLayers },
  { label: 'AI Coach', path: '/ai-coach', icon: FiZap, badge: 'BETA' },
  { label: 'Analytics', path: '/progress', icon: FiBarChart2 },
  { label: 'Settings', path: '/profile', icon: FiSettings },
];

const topNavItems = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Practice Exams', path: '/practice-exams' },
  { label: 'Question Bank', path: '/subject-quizzes' },
  { label: 'Flashcards', path: '/flashcards' },
  { label: 'AI Coach', path: '/ai-coach', badge: 'BETA' },
  { label: 'Analytics', path: '/progress' },
];

const goalQuestions = [
  {
    id: 'targetScore',
    label: 'What is your target score?',
    options: ['1500+', '1450+', '1400+', '1350+', '1300+'],
  },
  {
    id: 'timeline',
    label: 'When is your exam?',
    options: ['In 8 weeks', 'In 6 weeks', 'In 10 weeks', 'In 12 weeks', 'I am not sure'],
  },
  {
    id: 'studyTime',
    label: 'How much can you study per day?',
    options: ['1.5 hours', '45 minutes', '1 hour', '2 hours', '3 hours'],
  },
  {
    id: 'focus',
    label: 'What do you want the most help with?',
    options: ['Reading & Writing', 'Math', 'Mixed SAT Review', 'Timing', 'Weak Areas'],
  },
];

const focusPlans = {
  'Reading & Writing': {
    monday: 'Question Bank Drills - Reading & Writing',
    thursday: 'Timed Practice Set - Transitions & Inference',
    saturday: 'Full Practice Test + Review',
    chips: ['Inference', 'Transitions', 'Words in Context'],
  },
  Math: {
    monday: 'Question Bank Drills - Algebra',
    thursday: 'Timed Practice Set - Functions & Data',
    saturday: 'Full Practice Test + Review',
    chips: ['Heart of Algebra', 'Functions', 'Data Analysis'],
  },
  'Mixed SAT Review': {
    monday: 'Question Bank Drills - Mixed Skills',
    thursday: 'Timed Practice Set - Math + Reading',
    saturday: 'Full Practice Test + Review',
    chips: ['Inference', 'Heart of Algebra', 'Transitions'],
  },
  Timing: {
    monday: 'Pacing Drills - Short Timed Sets',
    thursday: 'Timed Practice Set - Accuracy Under Time',
    saturday: 'Full Practice Test + Review',
    chips: ['Pacing', 'Transitions', 'Algebra'],
  },
  'Weak Areas': {
    monday: 'Adaptive Drills - Lowest Confidence Skills',
    thursday: 'Timed Practice Set - Mistake Patterns',
    saturday: 'Full Practice Test + Review',
    chips: ['Weak Areas', 'Review', 'Accuracy'],
  },
};

const weeklyPlanRows = [
  { day: 'Monday', task: 'Question Bank Drills - Reading & Writing', status: 'Completed', complete: true },
  { day: 'Tuesday', task: 'Timed Reading Set - Inference Focus', status: 'Completed', complete: true },
  { day: 'Thursday', task: 'Math Review - Heart of Algebra', status: 'Upcoming' },
  { day: 'Saturday', task: 'Full Practice Test - Test 4', status: 'Planned' },
];

const returningFocusAreas = [
  { label: 'Inference', status: 'Needs attention', value: 18, tone: 'red' },
  { label: 'Transitions', status: 'Improving', value: 78, tone: 'green' },
  { label: 'Heart of Algebra', status: 'Strong', value: 82, tone: 'green' },
  { label: 'Vocabulary in Context', status: 'Needs practice', value: 22, tone: 'orange' },
];

const performanceInsights = [
  { icon: FiTrendingUp, lead: '+60 pts', detail: 'in the last 3 weeks' },
  { icon: FiTarget, lead: 'Accuracy on Transitions', detail: 'up to 82%' },
  { icon: FiClock, lead: 'Average test completion pace', detail: 'improved' },
];

const recommendedSteps = [
  { icon: FiBookOpen, label: 'Finish Reading Inference Set' },
  { icon: FiList, label: 'Review mistakes from Practice Test 3' },
  { icon: FiFileText, label: 'Take a timed Math mini-set' },
];

const recentSessions = [
  { label: 'Study plan for 8-week goal', date: 'Today, 9:15 AM' },
  { label: 'Review of Practice Test 2 mistakes', date: 'May 3, 2025' },
  { label: 'How to improve on inference questions', date: 'May 1, 2025' },
];

function getFirstName(user) {
  if (user?.displayName) {
    return user.displayName.split(' ')[0];
  }

  if (user?.email) {
    const emailName = user.email.split('@')[0].replace(/[._-]+/g, ' ');
    const name = emailName
      .split(' ')
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');

    return name || 'Alex';
  }

  return 'Alex';
}

function AICoachPage() {
  const { currentUser, getUserResults, getInProgressExams } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [activityLoaded, setActivityLoaded] = useState(false);
  const [hasPreviousActivity, setHasPreviousActivity] = useState(false);
  const [answers, setAnswers] = useState({
    targetScore: '1500+',
    timeline: 'In 8 weeks',
    studyTime: '1.5 hours',
    focus: 'Reading & Writing',
  });
  const [planStatus, setPlanStatus] = useState('preview');

  const firstName = useMemo(() => getFirstName(currentUser), [currentUser]);
  const initials = firstName.slice(0, 1).toUpperCase();
  const activePlan = focusPlans[answers.focus] || focusPlans['Mixed SAT Review'];
  const showReturningCoach = activityLoaded && hasPreviousActivity;

  const isActive = (path) => {
    if (path === '/ai-coach') return location.pathname === '/ai-coach';
    if (path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const query = searchValue.trim();
    navigate(query ? `/subject-quizzes?search=${encodeURIComponent(query)}` : '/subject-quizzes');
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers((current) => ({ ...current, [questionId]: value }));
    setPlanStatus('preview');
  };

  const handleGeneratePlan = () => {
    setPlanStatus('generated');
  };

  const handleSkip = () => {
    setAnswers({
      targetScore: '1450+',
      timeline: 'In 10 weeks',
      studyTime: '1 hour',
      focus: 'Mixed SAT Review',
    });
    setPlanStatus('generated');
  };

  useEffect(() => {
    let cancelled = false;

    const loadActivity = async () => {
      setActivityLoaded(false);

      if (!currentUser) {
        setHasPreviousActivity(false);
        setActivityLoaded(true);
        return;
      }

      try {
        const [results, inProgress] = await Promise.all([
          getUserResults?.().catch(() => []),
          getInProgressExams?.().catch(() => []),
        ]);

        if (!cancelled) {
          setHasPreviousActivity(
            (Array.isArray(results) && results.length > 0)
            || (Array.isArray(inProgress) && inProgress.length > 0)
          );
        }
      } finally {
        if (!cancelled) {
          setActivityLoaded(true);
        }
      }
    };

    loadActivity();

    return () => {
      cancelled = true;
    };
  }, [currentUser, getInProgressExams, getUserResults]);

  return (
    <div className="ai-coach-page">
      <aside className="ai-coach-sidebar" aria-label="Primary">
        <Link className="ai-coach-logo" to="/dashboard" aria-label="UltraSATPrep dashboard">
          <UltraSATLogo size="medium" variant="sidebar" />
        </Link>

        <nav className="ai-coach-side-nav">
          {sidebarItems.map(({ label, path, icon: Icon, badge }) => (
            <Link
              key={label}
              className={`ai-coach-side-link ${isActive(path) ? 'active' : ''}`}
              to={path}
            >
              <Icon aria-hidden="true" />
              <span>{label}</span>
              {badge && <span className="ai-coach-beta">{badge}</span>}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="ai-coach-main-shell">
        <header className="ai-coach-topbar">
          <nav className="ai-coach-top-nav" aria-label="Primary sections">
            {topNavItems.map((item) => (
              <Link
                key={item.label}
                className={`ai-coach-top-link ${isActive(item.path) ? 'active' : ''}`}
                to={item.path}
              >
                <span>{item.label}</span>
                {item.badge && <span className="ai-coach-top-beta">{item.badge}</span>}
              </Link>
            ))}
          </nav>

          <div className="ai-coach-top-actions">
            <form className="ai-coach-search" onSubmit={handleSearchSubmit}>
              <FiSearch aria-hidden="true" />
              <input
                aria-label="Search practice content"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Search anything..."
              />
              <kbd>Ctrl K</kbd>
            </form>

            <button className="ai-coach-icon-button" type="button" aria-label="Notifications">
              <FiBell aria-hidden="true" />
              <span>2</span>
            </button>

            <button className="ai-coach-user-chip" type="button" onClick={() => navigate('/profile')}>
              {currentUser?.photoURL ? (
                <img src={currentUser.photoURL} alt="" />
              ) : (
                <span className="ai-coach-avatar">{initials}</span>
              )}
              <span>{firstName}</span>
              <FiChevronDown aria-hidden="true" />
            </button>
          </div>
        </header>

        <main className={`ai-coach-content ${showReturningCoach ? 'returning' : ''}`}>
          {showReturningCoach ? (
            <>
              <section className="ai-coach-returning-hero">
                <div className="ai-coach-title-block returning">
                  <h1>
                    Your AI Coach <FiZap aria-hidden="true" />
                  </h1>
                  <p>Here's your updated study guidance based on your recent activity, scores, and goals.</p>
                </div>

                <div className="ai-coach-stat-strip" aria-label="Study plan summary">
                  <div>
                    <span><FiTarget aria-hidden="true" /></span>
                    <p>Target Score</p>
                    <strong>1500+</strong>
                  </div>
                  <div>
                    <span><FiCalendar aria-hidden="true" /></span>
                    <p>Exam in</p>
                    <strong>7 weeks</strong>
                  </div>
                  <div>
                    <span className="orange"><FiZap aria-hidden="true" /></span>
                    <p>Study Streak</p>
                    <strong>12 days</strong>
                  </div>
                </div>
              </section>

              <section className="ai-coach-returning-main-grid" aria-label="AI coach activity guidance">
                <article className="ai-coach-chat-card">
                  <div className="ai-coach-robot-scene returning" aria-hidden="true">
                    <span className="ai-coach-star star-one" />
                    <span className="ai-coach-star star-two" />
                    <span className="ai-coach-dot dot-one" />
                    <span className="ai-coach-dot dot-two" />
                    <div className="ai-coach-robot">
                      <div className="ai-coach-robot-ear left" />
                      <div className="ai-coach-robot-ear right" />
                      <div className="ai-coach-robot-head">
                        <span />
                        <span />
                      </div>
                      <div className="ai-coach-robot-neck" />
                      <div className="ai-coach-robot-body">
                        <FiZap />
                      </div>
                    </div>
                  </div>

                  <div className="ai-coach-message-stack" aria-label="AI coach messages">
                    <p>Welcome back, {firstName} - I reviewed your recent work.</p>
                    <p>You're improving in <strong>Transitions</strong> and <strong>Heart of Algebra</strong>.</p>
                    <p>Your biggest opportunity right now is <strong>Inference</strong> questions.</p>
                    <p>I adjusted your plan for this week.</p>
                  </div>

                  <form className="ai-coach-chat-input" onSubmit={(event) => event.preventDefault()}>
                    <input aria-label="Ask AI Coach" placeholder="Ask AI Coach anything about your prep..." />
                    <button type="submit" aria-label="Send message">
                      <FiSend aria-hidden="true" />
                    </button>
                  </form>

                  <div className="ai-coach-chat-actions">
                    <button type="button" onClick={() => navigate('/skills')}>
                      <FiCalendar aria-hidden="true" />
                      Update my study plan
                    </button>
                    <button type="button" onClick={() => navigate('/progress')}>
                      <FiBarChart2 aria-hidden="true" />
                      Explain my weak areas
                    </button>
                    <button type="button" onClick={() => navigate('/skills')}>
                      <FiCheckCircle aria-hidden="true" />
                      Build today's tasks
                    </button>
                  </div>
                </article>

                <article className="ai-coach-week-card">
                  <div className="ai-coach-section-heading">
                    <span><FiCalendar aria-hidden="true" /></span>
                    <div>
                      <h2>This Week's Plan <em>Updated</em></h2>
                      <p>Personalized plan based on your progress</p>
                    </div>
                  </div>

                  <div className="ai-coach-returning-plan-list">
                    {weeklyPlanRows.map((item) => (
                      <div key={item.day}>
                        <span className={`ai-coach-plan-check ${item.complete ? 'complete' : ''}`}>
                          {item.complete && <FiCheck aria-hidden="true" />}
                        </span>
                        <strong>{item.day}</strong>
                        <p>{item.task}</p>
                        <em className={`status-${item.status.toLowerCase()}`}>{item.status}</em>
                      </div>
                    ))}
                  </div>

                  <button className="ai-coach-primary-action compact" type="button" onClick={() => navigate('/skills')}>
                    Apply This Plan <FiArrowRight aria-hidden="true" />
                  </button>
                </article>
              </section>

              <section className="ai-coach-returning-insight-grid" aria-label="Study insights">
                <article className="ai-coach-returning-card">
                  <div className="ai-coach-card-title">
                    <FiTarget aria-hidden="true" />
                    <h2>Focus Areas</h2>
                  </div>

                  <div className="ai-coach-focus-bars">
                    {returningFocusAreas.map((area) => (
                      <div key={area.label}>
                        <strong>{area.label}</strong>
                        <span className="ai-coach-bar-track">
                          <span className={area.tone} style={{ width: `${area.value}%` }} />
                        </span>
                        <em className={area.tone}>{area.status}</em>
                      </div>
                    ))}
                  </div>
                </article>

                <article className="ai-coach-returning-card">
                  <div className="ai-coach-card-title">
                    <FiTrendingUp aria-hidden="true" />
                    <h2>Performance Insights</h2>
                  </div>

                  <div className="ai-coach-insight-list">
                    {performanceInsights.map(({ icon: Icon, lead, detail }) => (
                      <div key={`${lead}-${detail}`}>
                        <span><Icon aria-hidden="true" /></span>
                        <p><strong>{lead}</strong> <em>{detail}</em></p>
                      </div>
                    ))}
                  </div>
                </article>

                <article className="ai-coach-returning-card">
                  <div className="ai-coach-card-title">
                    <FiZap aria-hidden="true" />
                    <h2>Recommended Next Steps</h2>
                  </div>

                  <div className="ai-coach-next-step-list">
                    {recommendedSteps.map(({ icon: Icon, label }) => (
                      <button key={label} type="button" onClick={() => navigate('/subject-quizzes')}>
                        <Icon aria-hidden="true" />
                        <span>{label}</span>
                        <FiArrowRight aria-hidden="true" />
                      </button>
                    ))}
                  </div>

                  <button className="ai-coach-primary-action compact" type="button" onClick={() => navigate('/subject-quizzes')}>
                    Start Next Task <FiArrowRight aria-hidden="true" />
                  </button>
                </article>
              </section>

              <section className="ai-coach-returning-bottom-grid" aria-label="Recent AI sessions and saved plan">
                <article className="ai-coach-returning-card">
                  <div className="ai-coach-card-title">
                    <FiMessageCircle aria-hidden="true" />
                    <h2>Recent AI Sessions</h2>
                  </div>

                  <div className="ai-coach-session-list">
                    {recentSessions.map((session) => (
                      <button key={session.label} type="button">
                        <span>{session.label}</span>
                        <em>{session.date}</em>
                        <FiArrowRight aria-hidden="true" />
                      </button>
                    ))}
                  </div>
                </article>

                <article className="ai-coach-returning-card saved-plan">
                  <div className="ai-coach-card-title">
                    <FiBookmark aria-hidden="true" />
                    <h2>Saved Plan</h2>
                  </div>

                  <div className="ai-coach-saved-plan-copy">
                    <strong>Your path to 1500+</strong>
                    <span>7 weeks remaining</span>
                  </div>

                  <div className="ai-coach-saved-path">
                    <div>
                      <span>Current Level</span>
                      <strong>1320</strong>
                    </div>
                    <div className="ai-coach-path-line saved" aria-hidden="true">
                      <span />
                      <span className="current" />
                      <span />
                      <span />
                      <span />
                      <FiFlag />
                    </div>
                    <div>
                      <span>Target Score</span>
                      <strong>1500+</strong>
                    </div>
                  </div>

                  <p className="ai-coach-you-are-here">You are here</p>

                  <button className="ai-coach-primary-action compact" type="button" onClick={() => navigate('/skills')}>
                    View Full Plan <FiArrowRight aria-hidden="true" />
                  </button>
                </article>
              </section>
            </>
          ) : (
            <>
              <section className="ai-coach-title-block">
            <h1>
              Meet Your AI Coach <FiZap aria-hidden="true" />
            </h1>
            <p>Let's build a personalized SAT study plan based on your goals, schedule, and starting point.</p>
          </section>

          <section className="ai-coach-intro-grid" aria-label="AI coach introduction">
            <article className="ai-coach-welcome-panel">
              <div className="ai-coach-robot-scene" aria-hidden="true">
                <span className="ai-coach-star star-one" />
                <span className="ai-coach-star star-two" />
                <span className="ai-coach-dot dot-one" />
                <span className="ai-coach-dot dot-two" />
                <div className="ai-coach-robot">
                  <div className="ai-coach-robot-ear left" />
                  <div className="ai-coach-robot-ear right" />
                  <div className="ai-coach-robot-head">
                    <span />
                    <span />
                  </div>
                  <div className="ai-coach-robot-neck" />
                  <div className="ai-coach-robot-body">
                    <FiZap />
                  </div>
                </div>
              </div>

              <div className="ai-coach-speech">
                <p>Hi {firstName} - I can create a study plan tailored to your target score, timeline, and strengths.</p>
                <p>Answer a few quick questions to get started.</p>
              </div>
            </article>

            <article className="ai-coach-benefits-card">
              <h2>What you'll get</h2>
              <ul>
                <li><FiCalendar aria-hidden="true" /> Personalized weekly plan</li>
                <li><FiClipboardIcon aria-hidden="true" /> Recommended practice tests</li>
                <li><FiTarget aria-hidden="true" /> Targeted question-bank drills</li>
                <li><FiZap aria-hidden="true" /> Daily study guidance</li>
              </ul>
            </article>
          </section>

          <section className="ai-coach-workspace" aria-label="Study plan builder">
            <article className="ai-coach-goals-card">
              <div className="ai-coach-card-heading">
                <span className="ai-coach-heading-icon"><FiMessageCircle aria-hidden="true" /></span>
                <h2>Let's get to know your goals</h2>
              </div>

              <div className="ai-coach-question-list">
                {goalQuestions.map((question, index) => (
                  <label className="ai-coach-question-row" key={question.id}>
                    <span className="ai-coach-question-number">{index + 1}</span>
                    <span className="ai-coach-question-label">{question.label}</span>
                    <span className="ai-coach-select-wrap">
                      <select
                        value={answers[question.id]}
                        onChange={(event) => handleAnswerChange(question.id, event.target.value)}
                      >
                        {question.options.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                      <FiCheck aria-hidden="true" />
                    </span>
                  </label>
                ))}
              </div>

              <button className="ai-coach-primary-action" type="button" onClick={handleGeneratePlan}>
                Generate My Study Plan <FiArrowRight aria-hidden="true" />
              </button>

              <button className="ai-coach-text-action" type="button" onClick={handleSkip}>
                Skip and let AI recommend for me <FiArrowRight aria-hidden="true" />
              </button>
            </article>

            <article className="ai-coach-plan-card">
              <div className="ai-coach-preview-heading">
                <FiZap aria-hidden="true" />
                <div>
                  <h2>Your AI Study Plan Preview</h2>
                  <p>{planStatus === 'generated' ? 'Updated from your answers' : 'Based on your answers'}</p>
                </div>
              </div>

              <div className="ai-coach-plan-section">
                <h3>Weekly Structure (Sample)</h3>
                <div className="ai-coach-week-table">
                  <div>
                    <span><FiCalendar aria-hidden="true" /></span>
                    <strong>Monday-Wednesday</strong>
                    <p>{activePlan.monday}</p>
                  </div>
                  <div>
                    <span><FiCalendar aria-hidden="true" /></span>
                    <strong>Thursday</strong>
                    <p>{activePlan.thursday}</p>
                  </div>
                  <div>
                    <span><FiCalendar aria-hidden="true" /></span>
                    <strong>Saturday</strong>
                    <p>{activePlan.saturday}</p>
                  </div>
                </div>
              </div>

              <div className="ai-coach-plan-section">
                <h3>Focus areas</h3>
                <div className="ai-coach-focus-chips">
                  {activePlan.chips.map((chip) => (
                    <span key={chip}>
                      {chip === 'Heart of Algebra' ? <FiRefreshCw aria-hidden="true" /> : <FiTarget aria-hidden="true" />}
                      {chip}
                    </span>
                  ))}
                </div>
              </div>

              <div className="ai-coach-score-path">
                <h3>Estimated path to goal</h3>
                <div className="ai-coach-path-row">
                  <div>
                    <span>Current Level</span>
                    <strong>1250</strong>
                  </div>
                  <div className="ai-coach-path-line" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                    <FiFlag />
                  </div>
                  <div>
                    <span>Target Score</span>
                    <strong>{answers.targetScore}</strong>
                  </div>
                </div>
                <p>{answers.timeline} of focused study at {answers.studyTime} per day</p>
              </div>

              <button className="ai-coach-primary-action" type="button" onClick={() => navigate('/skills')}>
                Start With This Plan <FiArrowRight aria-hidden="true" />
              </button>
            </article>
          </section>

          <section className="ai-coach-resource-row" aria-label="Recommended next actions">
            <button className="ai-coach-resource-card" type="button" onClick={() => navigate('/predictive-exam')}>
              <span className="ai-coach-resource-icon shield"><FiShield aria-hidden="true" /></span>
              <span>
                <strong>Official Exams</strong>
                <em>Practice with real digital SATs from the College Board.</em>
              </span>
              <FiArrowRight aria-hidden="true" />
            </button>

            <button className="ai-coach-resource-card" type="button" onClick={() => navigate('/subject-quizzes')}>
              <span className="ai-coach-resource-icon book"><FiBookOpen aria-hidden="true" /></span>
              <span>
                <strong>Question Bank</strong>
                <em>Thousands of official-style questions with detailed explanations.</em>
              </span>
              <FiArrowRight aria-hidden="true" />
            </button>

            <button className="ai-coach-resource-card" type="button" onClick={handleGeneratePlan}>
              <span className="ai-coach-resource-icon zap"><FiZap aria-hidden="true" /></span>
              <span>
                <strong>AI Guidance</strong>
                <em>Get personalized recommendations as you learn.</em>
              </span>
              <FiArrowRight aria-hidden="true" />
            </button>
          </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

function FiClipboardIcon(props) {
  return <FiFileText {...props} />;
}

export default AICoachPage;
