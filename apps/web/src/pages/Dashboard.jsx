import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useAICompanion } from '../contexts/AICompanionContext';
import { db } from '../firebase/config';
import UltraSATLogo from '../components/UltraSATLogo';
import TargetScoreModal from '../components/TargetScoreModal';
import '../styles/Dashboard.css';
import {
  FiArrowRight,
  FiBarChart2,
  FiBell,
  FiCalendar,
  FiCheckCircle,
  FiChevronDown,
  FiClipboard,
  FiClock,
  FiFileText,
  FiFlag,
  FiHome,
  FiMap,
  FiInfo,
  FiLayers,
  FiPenTool,
  FiSearch,
  FiSettings,
  FiShield,
  FiTarget,
  FiTrendingUp,
  FiZap,
} from 'react-icons/fi';

const sidebarItems = [
  { label: 'Overview', path: '/dashboard', icon: FiHome },
  { label: 'Study Plan', path: '/skills', icon: FiCalendar },
  { label: 'Practice Tests', path: '/practice-exams', icon: FiClipboard },
  { label: 'Official Exams', path: '/predictive-exam', icon: FiFileText },
  { label: 'Question Bank', path: '/subject-quizzes', icon: FiHelpQuestion },
  { label: 'Flashcards', path: '/flashcards', icon: FiLayers },
  { label: 'AI Coach', path: '/ai-coach', icon: FiZap, badge: 'BETA' },
  { label: 'Progress', path: '/progress', icon: FiTrendingUp },
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

const officialExams = [
  { label: 'Practice Test 1', score: '1550', status: 'Completed', complete: true },
  { label: 'Practice Test 2', score: '1480', status: 'Completed', complete: true },
  { label: 'Practice Test 3', status: 'In Progress', inProgress: true },
  { label: 'Practice Test 4', status: 'Not Started' },
];

const trendPoints = [
  { x: 58, y: 130, label: '1200', test: 'Test 1' },
  { x: 176, y: 112, label: '1280', test: 'Test 2' },
  { x: 294, y: 94, label: '1340', test: 'Test 3' },
  { x: 412, y: 76, label: '1410', test: 'Test 4' },
  { x: 530, y: 58, label: '1480', test: 'Test 5' },
  { x: 648, y: 40, label: '1550', test: 'Test 6' },
];

function FiHelpQuestion(props) {
  return <FiFileText {...props} />;
}

function getFirstName(user) {
  if (user?.displayName) {
    return user.displayName.split(' ')[0];
  }

  if (user?.email) {
    const emailName = user.email.split('@')[0].replace(/[._-]+/g, ' ');
    return emailName
      .split(' ')
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ') || 'Alex';
  }

  return 'Alex';
}

function Dashboard() {
  const {
    currentUser,
    logout,
    userMembership,
    getUserResults,
    getInProgressExams,
  } = useAuth();
  const { isFirstTimeUser } = useAICompanion();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [hasPracticeActivity, setHasPracticeActivity] = useState(false);
  const [activityLoaded, setActivityLoaded] = useState(false);
  const [targetScore, setTargetScore] = useState(null);
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);

  const firstName = useMemo(() => getFirstName(currentUser), [currentUser]);
  const initials = firstName.slice(0, 1).toUpperCase();
  const showFirstTimeDashboard = !activityLoaded
    ? isFirstTimeUser !== false
    : !hasPracticeActivity;
  const setupCompletedCount = targetScore ? 1 : 0;

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const query = searchValue.trim();
    navigate(query ? `/subject-quizzes?search=${encodeURIComponent(query)}` : '/subject-quizzes');
  };

  const isActive = (path) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  useEffect(() => {
    let cancelled = false;

    const loadPracticeActivity = async () => {
      setActivityLoaded(false);

      if (!currentUser) {
        setActivityLoaded(true);
        setHasPracticeActivity(false);
        return;
      }

      try {
        const [results, inProgress] = await Promise.all([
          getUserResults?.().catch(() => []),
          getInProgressExams?.().catch(() => []),
        ]);

        if (!cancelled) {
          setHasPracticeActivity(
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

    loadPracticeActivity();

    return () => {
      cancelled = true;
    };
  }, [currentUser, getInProgressExams, getUserResults]);

  useEffect(() => {
    let cancelled = false;

    const loadTargetScore = async () => {
      if (!currentUser) return;

      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        const storedTargetScore = userDoc.exists() ? userDoc.data()?.targetScore : null;

        if (!cancelled && storedTargetScore) {
          setTargetScore(storedTargetScore);
        }
      } catch (error) {
        console.warn('Unable to load dashboard target score:', error);
      }
    };

    loadTargetScore();

    return () => {
      cancelled = true;
    };
  }, [currentUser]);

  return (
    <div className="sat-dashboard-page">
      <aside className="sat-dashboard-sidebar" aria-label="Primary">
        <Link className="sat-dashboard-logo" to="/dashboard" aria-label="UltraSATPrep dashboard">
          <UltraSATLogo size="medium" variant="sidebar" />
        </Link>

        <nav className="sat-dashboard-side-nav">
          {sidebarItems.map(({ label, path, icon: Icon, badge }) => (
            <Link
              key={label}
              className={`sat-dashboard-side-link ${isActive(path) ? 'active' : ''}`}
              to={path}
            >
              <Icon aria-hidden="true" />
              <span>{label}</span>
              {badge && <span className="sat-dashboard-beta">{badge}</span>}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="sat-dashboard-main-shell">
        <header className="sat-dashboard-topbar">
          <nav className="sat-dashboard-top-nav" aria-label="Dashboard sections">
            {topNavItems.map((item) => (
              <Link
                key={item.label}
                className={`sat-dashboard-top-link ${isActive(item.path) ? 'active' : ''}`}
                to={item.path}
              >
                <span>{item.label}</span>
                {item.badge && <span className="sat-dashboard-top-beta">{item.badge}</span>}
              </Link>
            ))}
          </nav>

          <div className="sat-dashboard-top-actions">
            <form className="sat-dashboard-search" onSubmit={handleSearchSubmit}>
              <FiSearch aria-hidden="true" />
              <input
                aria-label="Search practice content"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Search anything..."
              />
              <kbd>⌘K</kbd>
            </form>

            <button className="sat-dashboard-icon-button" type="button" aria-label="Notifications">
              <FiBell aria-hidden="true" />
              <span className="sat-dashboard-notification-count">2</span>
            </button>

            <button className="sat-dashboard-user-chip" type="button" onClick={() => navigate('/profile')}>
              <span className="sat-dashboard-avatar">{initials}</span>
              <span>{firstName}</span>
              <FiChevronDown aria-hidden="true" />
            </button>
          </div>
        </header>

        <main className="sat-dashboard-content">
          <section className={`sat-dashboard-hero ${showFirstTimeDashboard ? 'first-time' : ''}`}>
            <div>
              <h1>
                {showFirstTimeDashboard ? 'Welcome to UltraSATPrep' : 'Welcome back'}, {firstName}{' '}
                <span aria-hidden="true">👋</span>
              </h1>
              <p>
                {showFirstTimeDashboard
                  ? "Let's get your study setup ready so you can start improving right away."
                  : "Here's your study snapshot for this week."}
              </p>
            </div>

            {showFirstTimeDashboard ? (
              <article className="sat-card sat-first-goal-card">
                <span className="sat-icon-box green large"><FiTarget aria-hidden="true" /></span>
                <div>
                  <h2>Your Goal</h2>
                  <span>Target Score</span>
                  <strong>{targetScore ? targetScore : 'Not set yet'}</strong>
                </div>
                <button type="button" className="sat-primary-action" onClick={() => setIsTargetModalOpen(true)}>
                  Set Target Score
                </button>
              </article>
            ) : (
              <div className="sat-dashboard-target-score">
                <div>
                  <span>Target Score</span>
                  <FiInfo aria-hidden="true" />
                </div>
                <strong>{targetScore ? `${targetScore}+` : '1550+'}</strong>
                <FiTrendingUp aria-hidden="true" />
              </div>
            )}
          </section>

          {userMembership?.isAdmin && (
            <section className="sat-dashboard-admin-strip">
              <span>Admin tools are available for this account.</span>
              <button type="button" onClick={() => navigate('/admin')}>Open Admin Dashboard</button>
            </section>
          )}

          {showFirstTimeDashboard ? (
            <>
              <section className="sat-first-grid" aria-label="Getting started">
                <article className="sat-card sat-first-steps-card">
                  <div className="sat-first-card-top">
                    <span className="sat-icon-box green large"><FiFlag aria-hidden="true" /></span>
                    <div>
                      <h2>Your First Steps</h2>
                      <div className="sat-first-progress-line">
                        <span>{setupCompletedCount} of 4 completed</span>
                        <div className="sat-mini-progress" aria-hidden="true">
                          <span style={{ width: `${setupCompletedCount * 25}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="sat-setup-body">
                    <ol className="sat-setup-list">
                      {[
                        'Set your target score',
                        'Take your diagnostic test',
                        'Explore official exams',
                        'Ask AI Coach for a study plan',
                      ].map((step, index) => (
                        <li key={step} className={index < setupCompletedCount ? 'complete' : ''}>
                          <span>{index < setupCompletedCount ? <FiCheckCircle aria-hidden="true" /> : null}</span>
                          {step}
                        </li>
                      ))}
                    </ol>
                    <div className="sat-mountain-illustration" aria-hidden="true">
                      <FiFlag />
                      <span className="cloud" />
                      <span className="route route-one" />
                      <span className="route route-two" />
                      <span className="dot dot-one" />
                      <span className="dot dot-two" />
                      <span className="dot dot-three" />
                    </div>
                  </div>

                  <button className="sat-primary-action" type="button" onClick={() => setIsTargetModalOpen(true)}>
                    Start Setup
                  </button>
                </article>

                <article className="sat-card sat-first-test-card">
                  <div className="sat-first-card-top">
                    <span className="sat-icon-box blue large"><FiPenTool aria-hidden="true" /></span>
                    <div>
                      <h2>Take Your First Practice Test</h2>
                      <p>Start with a baseline test so we can personalize your study plan.</p>
                    </div>
                  </div>

                  <div className="sat-diagnostic-preview">
                    <div>
                      <strong>Reading &amp; Writing</strong>
                      <span>27 Questions</span>
                    </div>
                    <div>
                      <strong>Math</strong>
                      <span>27 Questions</span>
                    </div>
                    <div>
                      <FiClock aria-hidden="true" />
                      <span>2h 14m</span>
                    </div>
                    <div>
                      <FiBarChart2 aria-hidden="true" />
                      <span>Digital SAT</span>
                    </div>
                  </div>

                  <button className="sat-primary-action" type="button" onClick={() => navigate('/practice-exams')}>
                    Start Diagnostic Test
                  </button>
                </article>
              </section>

              <section className="sat-first-feature-grid" aria-label="Explore UltraSATPrep">
                <article className="sat-card sat-first-feature-card official">
                  <span className="sat-icon-box green large"><FiShield aria-hidden="true" /></span>
                  <div>
                    <h2>Official Digital SAT Exams</h2>
                    <p>Practice with real past digital SAT exams from the College Board.</p>
                    <button className="sat-secondary-action" type="button" onClick={() => navigate('/predictive-exam')}>
                      Browse Official Exams
                    </button>
                  </div>
                  <div className="sat-clipboard-art" aria-hidden="true">
                    <span>SAT</span>
                    <FiCheckCircle />
                  </div>
                </article>

                <article className="sat-card sat-first-feature-card question-bank">
                  <span className="sat-icon-box green large"><FiMap aria-hidden="true" /></span>
                  <div>
                    <h2>Question Bank</h2>
                    <p>Targeted practice to build skills and strengthen your weak areas.</p>
                    <button className="sat-secondary-action" type="button" onClick={() => navigate('/subject-quizzes')}>
                      Explore Question Bank
                    </button>
                  </div>
                  <ul className="sat-feature-benefits">
                    <li><FiShield aria-hidden="true" />By topic</li>
                    <li><FiCheckCircle aria-hidden="true" />Instant feedback</li>
                    <li><FiTarget aria-hidden="true" />8K+ questions</li>
                  </ul>
                </article>
              </section>

              <section className="sat-dashboard-bottom-grid first-time" aria-label="Coach and progress">
                <article className="sat-card sat-ai-card first-time">
                  <div className="sat-ai-orb" aria-hidden="true">
                    <div className="sat-ai-head">
                      <span />
                      <span />
                    </div>
                  </div>
                  <div className="sat-ai-copy">
                    <div className="sat-title-group">
                      <h2>Meet Your AI Coach <span className="sat-dashboard-top-beta">BETA</span></h2>
                    </div>
                    <p>Get instant explanations, personalized guidance, and a study plan built around your goals.</p>
                  </div>
                  <button className="sat-primary-action" type="button" onClick={() => navigate('/ai-coach')}>
                    Ask AI Coach
                  </button>
                </article>

                <article className="sat-card sat-progress-empty-card">
                  <div className="sat-title-group">
                    <span className="sat-icon-box green"><FiTrendingUp aria-hidden="true" /></span>
                    <div>
                      <h2>Your Progress</h2>
                      <p>Once you complete your first test, your progress and recommendations will appear here.</p>
                    </div>
                  </div>
                  <div className="sat-empty-chart" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                    <span />
                  </div>
                </article>
              </section>
            </>
          ) : (
            <>
              <section className="sat-dashboard-top-grid" aria-label="Study overview">
                <article className="sat-card sat-study-plan-card">
                  <div className="sat-card-heading">
                    <div className="sat-title-group">
                      <span className="sat-icon-box green"><FiCalendar aria-hidden="true" /></span>
                      <h2>Your Study Plan</h2>
                    </div>
                    <button className="sat-pill-control" type="button">
                      Week 4 of 8 <FiChevronDown aria-hidden="true" />
                    </button>
                  </div>

                  <div className="sat-study-progress-copy">
                    <span>You're on track! Keep up the consistency.</span>
                    <strong>62%</strong>
                  </div>
                  <div className="sat-progress-track" aria-label="Study plan progress">
                    <span style={{ width: '62%' }} />
                  </div>

                  <div className="sat-study-stats">
                    <div>
                      <FiZap className="green" aria-hidden="true" />
                      <span>Study Streak</span>
                      <strong>7 days</strong>
                    </div>
                    <div>
                      <FiTarget className="teal" aria-hidden="true" />
                      <span>Weekly Goal</span>
                      <strong>12 / 18</strong>
                      <small>Tasks completed</small>
                    </div>
                    <div>
                      <FiTrendingUp className="blue" aria-hidden="true" />
                      <span>Avg. Score</span>
                      <strong>1360</strong>
                      <small className="positive">+ 80 pts vs last week</small>
                    </div>
                  </div>
                </article>

                <article className="sat-card sat-continue-card">
                  <div className="sat-card-heading">
                    <div className="sat-title-group">
                      <span className="sat-icon-box blue"><FiFileText aria-hidden="true" /></span>
                      <h2>Continue Last Test</h2>
                    </div>
                    <span className="sat-status-pill">In Progress</span>
                  </div>

                  <h3>Practice Test 3</h3>
                  <p>Reading &amp; Writing</p>

                  <div className="sat-test-progress">
                    <div className="sat-ring large" style={{ '--value': '65%' }}>
                      <span>65%</span>
                    </div>
                    <div className="sat-test-meta">
                      <span>Score So Far</span>
                      <strong>640</strong>
                      <span>Time Elapsed</span>
                      <strong>52:18 / 1:45:00</strong>
                    </div>
                  </div>

                  <button className="sat-primary-action" type="button" onClick={() => navigate('/practice-exams')}>
                    Resume Test
                  </button>
                  <button className="sat-text-action" type="button" onClick={() => navigate('/all-results')}>
                    View Test Details <FiArrowRight aria-hidden="true" />
                  </button>
                </article>

                <article className="sat-card sat-official-card">
                  <div className="sat-card-heading">
                    <div className="sat-title-group">
                      <span className="sat-icon-box green"><FiShield aria-hidden="true" /></span>
                      <h2>Official Digital SAT Exams</h2>
                    </div>
                    <button className="sat-link-button" type="button" onClick={() => navigate('/predictive-exam')}>
                      View All <FiArrowRight aria-hidden="true" />
                    </button>
                  </div>

                  <div className="sat-exam-list">
                    {officialExams.map((exam) => (
                      <div className="sat-exam-row" key={exam.label}>
                        <div>
                          <strong>{exam.label}</strong>
                          <span>Full Length · 2h 14m</span>
                        </div>
                        {exam.score && <strong className="sat-exam-score">{exam.score}</strong>}
                        <span className={`sat-exam-state ${exam.inProgress ? 'in-progress' : ''}`}>
                          {exam.status}
                        </span>
                        {exam.complete ? (
                          <FiCheckCircle className="sat-complete-icon" aria-label="Completed" />
                        ) : (
                          <span className="sat-empty-circle" aria-hidden="true" />
                        )}
                      </div>
                    ))}
                  </div>
                </article>
              </section>

              <section className="sat-dashboard-mid-grid" aria-label="Practice and trends">
                <article className="sat-card sat-question-card">
                  <div className="sat-title-group">
                    <span className="sat-icon-box green"><FiFileText aria-hidden="true" /></span>
                    <div>
                      <h2>Question Bank</h2>
                      <p>Build skills and master concepts.</p>
                    </div>
                  </div>

                  <div className="sat-question-metrics">
                    <div>
                      <strong>8K+</strong>
                      <span>Questions</span>
                    </div>
                    <div>
                      <strong>35+</strong>
                      <span>Topics</span>
                    </div>
                  </div>

                  <button className="sat-primary-action" type="button" onClick={() => navigate('/subject-quizzes')}>
                    Start Practice
                  </button>
                  <button className="sat-text-action green" type="button" onClick={() => navigate('/subject-quizzes')}>
                    View Question Bank <FiArrowRight aria-hidden="true" />
                  </button>
                </article>

                <article className="sat-card sat-trends-card">
                  <div className="sat-card-heading">
                    <div className="sat-title-group">
                      <span className="sat-icon-box blue"><FiBarChart2 aria-hidden="true" /></span>
                      <div>
                        <h2>Performance Trends</h2>
                        <p>Your total score improvement over time.</p>
                      </div>
                    </div>
                    <button className="sat-pill-control" type="button">
                      Last 6 Tests <FiChevronDown aria-hidden="true" />
                    </button>
                  </div>

                  <div className="sat-chart-wrap">
                    <svg className="sat-trend-chart" viewBox="0 0 710 190" role="img" aria-label="Score trend from 1200 to 1550">
                      <g className="sat-chart-grid">
                        {[20, 54, 88, 122, 156].map((y) => (
                          <line key={y} x1="34" x2="684" y1={y} y2={y} />
                        ))}
                      </g>
                      <g className="sat-chart-axis">
                        {['1600', '1500', '1400', '1300', '1200'].map((label, index) => (
                          <text key={label} x="0" y={26 + index * 34}>{label}</text>
                        ))}
                      </g>
                      <polyline
                        className="sat-chart-line"
                        points={trendPoints.map((point) => `${point.x},${point.y}`).join(' ')}
                      />
                      {trendPoints.map((point) => (
                        <g key={point.test} className="sat-chart-point">
                          <text x={point.x - 20} y={point.y - 16}>{point.label}</text>
                          <circle cx={point.x} cy={point.y} r="5" />
                          <text className="sat-test-label" x={point.x - 18} y="182">{point.test}</text>
                        </g>
                      ))}
                      <text className="sat-chart-badge" x="634" y="24">1550</text>
                    </svg>
                  </div>
                </article>
              </section>

              <section className="sat-dashboard-bottom-grid" aria-label="Retention and coaching">
                <article className="sat-card sat-flashcard-card">
                  <div className="sat-title-group">
                    <span className="sat-icon-box blue"><FiLayers aria-hidden="true" /></span>
                    <div>
                      <h2>Flashcards</h2>
                      <p>Review key concepts and boost retention.</p>
                    </div>
                  </div>

                  <div className="sat-flashcard-body">
                    <div className="sat-ring small" style={{ '--value': '72%' }}>
                      <span>72%</span>
                      <small>Mastery</small>
                    </div>
                    <button className="sat-secondary-action" type="button" onClick={() => navigate('/flashcards')}>
                      Review Flashcards <FiArrowRight aria-hidden="true" />
                    </button>
                  </div>
                </article>

                <article className="sat-card sat-ai-card">
                  <div className="sat-ai-copy">
                    <div className="sat-title-group">
                      <span className="sat-icon-box blue"><FiZap aria-hidden="true" /></span>
                      <h2>AI Coach <span className="sat-dashboard-top-beta">BETA</span></h2>
                    </div>
                    <p>Get personalized insights, study tips, and instant feedback to stay on track.</p>
                    <button className="sat-primary-action" type="button" onClick={() => navigate('/ai-coach')}>
                      Ask AI Coach
                    </button>
                  </div>

                  <div className="sat-ai-orb" aria-hidden="true">
                    <div className="sat-ai-head">
                      <span />
                      <span />
                    </div>
                  </div>
                </article>
              </section>
            </>
          )}

          <button className="sat-dashboard-logout" type="button" onClick={logout}>
            Sign out
          </button>

          <TargetScoreModal
            isOpen={isTargetModalOpen}
            onClose={() => setIsTargetModalOpen(false)}
            onComplete={({ targetScore: nextTargetScore }) => {
              setTargetScore(nextTargetScore);
            }}
          />
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
