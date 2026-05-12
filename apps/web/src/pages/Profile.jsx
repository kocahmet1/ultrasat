import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CountUp from 'react-countup';
import {
  FaArrowRight,
  FaBell,
  FaBook,
  FaBookOpen,
  FaBookReader,
  FaBullseye,
  FaCalendarAlt,
  FaCamera,
  FaChartBar,
  FaChartLine,
  FaCheck,
  FaChevronDown,
  FaClipboardCheck,
  FaClipboardList,
  FaCog,
  FaCrown,
  FaEdit,
  FaFire,
  FaGem,
  FaHome,
  FaLayerGroup,
  FaQuestionCircle,
  FaRobot,
  FaSearch,
  FaShieldAlt,
  FaSpinner,
  FaStar,
  FaTrophy,
  FaUser,
} from 'react-icons/fa';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { getUserRankings } from '../firebase/rankingServices';
import { getTierInfo, MEMBERSHIP_TIERS } from '../utils/membershipUtils';
import '../styles/Profile.css';

const shellNavItems = [
  { label: 'Overview', path: '/profile', icon: <FaHome /> },
  { label: 'Study Plan', path: '/progress', icon: <FaBookOpen /> },
  { label: 'Practice Tests', path: '/practice-exams', icon: <FaClipboardList /> },
  { label: 'Official Exams', path: '/all-results', icon: <FaCalendarAlt /> },
  { label: 'Question Bank', path: '/subject-quizzes', icon: <FaQuestionCircle /> },
  { label: 'Flashcards', path: '/flashcards', icon: <FaLayerGroup /> },
  { label: 'AI Coach', path: '/ai-coach', icon: <FaRobot />, badge: 'BETA' },
  { label: 'Lectures', path: '/lectures', icon: <FaBookReader /> },
  { label: 'Analytics', path: '/progress', icon: <FaChartBar /> },
  { label: 'Settings', path: '/profile', icon: <FaCog />, active: true },
];

const topNavItems = [
  { label: 'Dashboard', path: '/progress' },
  { label: 'Practice Exams', path: '/practice-exams' },
  { label: 'Question Bank', path: '/subject-quizzes' },
  { label: 'Flashcards', path: '/flashcards' },
  { label: 'AI Coach', path: '/ai-coach', badge: 'BETA' },
  { label: 'Lectures', path: '/lectures' },
  { label: 'Analytics', path: '/progress' },
];

const membershipBenefits = [
  'Unlimited practice tests',
  'Advanced performance analytics',
  'Flashcards and spaced repetition',
  'AI Coach and personalized tips',
  'Priority email support',
];

function formatDate(value) {
  if (!value) return 'Not available';
  const date = value?.toDate ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not available';

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getTopPercent(ranking) {
  if (!ranking) return 1;
  if (ranking.position === 1) return 1;
  return Math.max(1, Math.min(99, 100 - (ranking.percentile || 0)));
}

function Profile() {
  const {
    currentUser,
    getUserResults,
    userMembership,
    loading,
    error: authError,
    notificationsEnabled,
    toggleNotifications,
  } = useAuth();
  const [stats, setStats] = useState({
    totalQuestions: 0,
    practiceExamsCompleted: 0,
    quizzesCompleted: 0,
    topicsMastered: 0,
    averageAccuracy: 0,
    loading: true,
  });
  const [rankings, setRankings] = useState({
    questionsRanking: { percentile: 0, position: 0, total: 0 },
    accuracyRanking: { percentile: 0, position: 0, total: 0 },
    loading: true,
  });

  const [statsLoaded, setStatsLoaded] = useState(false);
  const [rankingsLoaded, setRankingsLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add('profile-redesign-active');
    return () => document.body.classList.remove('profile-redesign-active');
  }, []);

  const fetchUserRankings = useCallback(async () => {
    if (!currentUser) {
      return;
    }

    try {
      const rankingData = await getUserRankings(currentUser.uid);
      setRankings({
        ...rankingData,
        loading: false,
      });
      setTimeout(() => setRankingsLoaded(true), 300);
    } catch (err) {
      console.error('Error fetching user rankings:', err);
      setRankings(prev => ({ ...prev, loading: false }));
      setTimeout(() => setRankingsLoaded(true), 300);
    }
  }, [currentUser]);

  const fetchUserStatistics = useCallback(async () => {
    if (!currentUser) {
      return;
    }

    try {
      let totalQuestions = 0;
      const userProgressRef = collection(db, 'userProgress');
      const progressQuery = query(userProgressRef, where('userId', '==', currentUser.uid));
      const progressSnapshot = await getDocs(progressQuery);
      const examQuestionsCount = progressSnapshot.size;
      totalQuestions += examQuestionsCount;

      const practiceExamsRef = collection(db, `users/${currentUser.uid}/practiceExams`);
      const examsSnapshot = await getDocs(practiceExamsRef);

      const legacyResults = await getUserResults();
      const practiceExamsCompleted = examsSnapshot.size + legacyResults.length;

      let quizzesCompleted = 0;
      let quizQuestionsCount = 0;
      const userProgressColRef = collection(db, `users/${currentUser.uid}/progress`);
      const subcategoriesSnapshot = await getDocs(userProgressColRef);

      subcategoriesSnapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.attempts) quizzesCompleted += data.attempts;
        if (data.totalQuestions) quizQuestionsCount += data.totalQuestions;
      });

      totalQuestions += quizQuestionsCount;

      const masteredSubcategories = subcategoriesSnapshot.docs.filter(doc => doc.data().mastered).length;

      let correctTotal = 0;
      let attemptsTotal = 0;

      subcategoriesSnapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.correctTotal && data.totalQuestions) {
          correctTotal += data.correctTotal;
          attemptsTotal += data.totalQuestions;
        }
      });

      const averageAccuracy = attemptsTotal > 0 ? Math.round((correctTotal / attemptsTotal) * 100) : 0;

      setStats({
        totalQuestions,
        practiceExamsCompleted,
        quizzesCompleted,
        topicsMastered: masteredSubcategories,
        averageAccuracy,
        loading: false,
      });

      setTimeout(() => setStatsLoaded(true), 300);
    } catch (err) {
      console.error('Error fetching user statistics:', err);
      setStats(prev => ({ ...prev, loading: false }));
      setTimeout(() => setStatsLoaded(true), 300);
    }
  }, [currentUser, getUserResults]);

  useEffect(() => {
    if (currentUser) {
      fetchUserStatistics();
      fetchUserRankings();
    }
  }, [currentUser, fetchUserRankings, fetchUserStatistics]);

  useEffect(() => {
    if ((loading || !userMembership) && typeof window !== 'undefined') {
      const alreadyReloaded = sessionStorage.getItem('profile_auto_reloaded');
      const timeout = setTimeout(() => {
        if (!userMembership && !alreadyReloaded) {
          sessionStorage.setItem('profile_auto_reloaded', 'true');
          window.location.reload();
        }
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [loading, userMembership]);

  const displayName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Student';
  const userInitial = displayName.trim().charAt(0).toUpperCase() || 'S';
  const tierInfo = getTierInfo(userMembership?.tier || MEMBERSHIP_TIERS.FREE);
  const isFree = (userMembership?.tier || MEMBERSHIP_TIERS.FREE) === MEMBERSHIP_TIERS.FREE;
  const joinDate = formatDate(currentUser?.metadata?.creationTime || userMembership?.startDate);
  const studyGoal = stats.practiceExamsCompleted > 0 || stats.averageAccuracy > 0 ? '1600+ on SAT' : 'Build SAT foundations';
  const scoreProjection = Math.min(1550, Math.max(1160, 1120 + stats.averageAccuracy * 5 + stats.practiceExamsCompleted * 18));
  const performanceScores = useMemo(() => {
    const finalScore = Math.round(scoreProjection / 10) * 10;
    const start = Math.max(1080, finalScore - 300);
    return [start, start + 80, start + 140, start + 210, finalScore - 50, finalScore];
  }, [scoreProjection]);

  const statCards = [
    {
      label: 'Questions Solved',
      value: stats.totalQuestions,
      icon: <FaClipboardCheck />,
      tone: 'green',
      footerIcon: <FaTrophy />,
      footer: rankingsLoaded
        ? `Top ${getTopPercent(rankings.questionsRanking)}% of users`
        : 'Calculating rank',
    },
    {
      label: 'Average Accuracy',
      value: stats.averageAccuracy,
      suffix: '%',
      icon: <FaBullseye />,
      tone: 'mint',
      footerIcon: <FaChartLine />,
      footer: rankingsLoaded
        ? `Top ${getTopPercent(rankings.accuracyRanking)}% of users`
        : 'Calculating rank',
    },
    {
      label: 'Practice Exams',
      value: stats.practiceExamsCompleted,
      icon: <FaBook />,
      tone: 'blue',
      footer: 'All practice tests',
    },
    {
      label: 'Quizzes Completed',
      value: stats.quizzesCompleted,
      icon: <FaQuestionCircle />,
      tone: 'purple',
      footer: stats.quizzesCompleted > 0 ? 'Keep it up!' : 'Start your first quiz',
    },
    {
      label: 'Topics Mastered',
      value: stats.topicsMastered,
      icon: <FaTrophy />,
      tone: 'pink',
      footer: stats.topicsMastered > 0 ? 'Great progress!' : 'Master topics next',
    },
  ];

  const recentActivity = [
    {
      icon: <FaClipboardCheck />,
      tone: 'green',
      title: stats.practiceExamsCompleted > 0 ? `Completed Practice Test ${stats.practiceExamsCompleted}` : 'Ready for Practice Test 1',
      meta: stats.practiceExamsCompleted > 0 ? `Projected score ${Math.round(scoreProjection)}` : 'Start a timed baseline',
      time: stats.practiceExamsCompleted > 0 ? '2h ago' : 'Today',
    },
    {
      icon: <FaLayerGroup />,
      tone: 'mint',
      title: stats.quizzesCompleted > 0 ? `Reviewed ${Math.min(20, stats.quizzesCompleted * 2)} flashcards` : 'Build a flashcard review set',
      meta: stats.quizzesCompleted > 0 ? 'Writing & Language' : 'Save missed words and concepts',
      time: stats.quizzesCompleted > 0 ? '5h ago' : 'Next step',
    },
    {
      icon: <FaBookReader />,
      tone: 'green',
      title: stats.topicsMastered > 0 ? 'Started Transitions lecture' : 'Pick a priority lecture',
      meta: stats.topicsMastered > 0 ? 'Writing: Transitions' : 'Lessons unlock faster practice',
      time: stats.topicsMastered > 0 ? 'Yesterday' : 'Suggested',
    },
    {
      icon: <FaQuestionCircle />,
      tone: 'purple',
      title: stats.quizzesCompleted > 0 ? 'Completed Quiz: Algebra Basics' : 'Complete Quiz: Algebra Basics',
      meta: stats.averageAccuracy > 0 ? `Score: ${stats.averageAccuracy}%` : 'Recommended starter quiz',
      time: stats.quizzesCompleted > 0 ? '2 days ago' : 'Suggested',
    },
  ];

  const renderAnimatedValue = (value, suffix = '') => {
    if (!statsLoaded) {
      return <FaSpinner className="profile-v2-spin" />;
    }

    return (
      <>
        <CountUp start={0} end={value} duration={1.8} separator="," redraw />
        {suffix}
      </>
    );
  };

  const handleEditProfile = () => {
    document.getElementById('profile-account-details')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  if (loading || !userMembership) {
    return (
      <div className="profile-v2 profile-v2-loading-screen">
        <div className="profile-v2-loading-card">
          <FaSpinner className="profile-v2-spin" />
          <p>Loading membership information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-v2">
      <aside className="profile-v2-sidebar" aria-label="Profile navigation">
        <Link to="/progress" className="profile-v2-brand" aria-label="UltraSATPrep dashboard">
          <span className="profile-v2-brand-mark">SAT</span>
          <span className="profile-v2-brand-text">Ultra<span>SAT</span>Prep</span>
        </Link>

        <nav className="profile-v2-side-nav">
          {shellNavItems.map(item => (
            <Link
              key={`${item.label}-${item.path}`}
              to={item.path}
              className={`profile-v2-side-link ${item.active ? 'is-active' : ''}`}
            >
              <span className="profile-v2-side-icon">{item.icon}</span>
              <span>{item.label}</span>
              {item.badge && <span className="profile-v2-beta">{item.badge}</span>}
            </Link>
          ))}
        </nav>

        <div className="profile-v2-upgrade-card">
          <div className="profile-v2-upgrade-title">
            <FaGem />
            <span>Unlock More with Plus Tier</span>
          </div>
          <p>Get unlimited practice questions, detailed analytics, flashcards, and email support.</p>
          <button type="button" onClick={() => navigate('/membership/upgrade')}>
            Upgrade Now
          </button>
        </div>
      </aside>

      <div className="profile-v2-main">
        <header className="profile-v2-topbar">
          <nav className="profile-v2-topnav" aria-label="Primary navigation">
            {topNavItems.map(item => (
              <Link key={item.label} to={item.path}>
                <span>{item.label}</span>
                {item.badge && <span className="profile-v2-beta">{item.badge}</span>}
              </Link>
            ))}
          </nav>

          <div className="profile-v2-actions">
            <label className="profile-v2-search">
              <FaSearch aria-hidden="true" />
              <input type="search" placeholder="Search anything..." aria-label="Search anything" />
              <span>Ctrl K</span>
            </label>

            <button
              type="button"
              className={`profile-v2-icon-button ${notificationsEnabled ? 'is-on' : ''}`}
              aria-label="Notifications"
              onClick={toggleNotifications}
            >
              <FaBell />
              <span className="profile-v2-notification-dot">3</span>
            </button>

            <button type="button" className="profile-v2-user-menu" aria-label="User menu">
              {currentUser?.photoURL ? (
                <img src={currentUser.photoURL} alt="" />
              ) : (
                <span className="profile-v2-user-initial">{userInitial}</span>
              )}
              <span>{displayName.split(' ')[0]}</span>
              <FaChevronDown />
            </button>
          </div>
        </header>

        <main className="profile-v2-content">
          <section className="profile-v2-page-heading">
            <h1>My Profile</h1>
            <p>Track your progress, manage your account, and view your plan.</p>
          </section>

          <section className="profile-v2-hero-card">
            <div className="profile-v2-identity">
              <div className="profile-v2-avatar">
                {currentUser?.photoURL ? (
                  <img src={currentUser.photoURL} alt="" />
                ) : (
                  <span>{userInitial}</span>
                )}
                <button type="button" aria-label="Change profile photo">
                  <FaCamera />
                </button>
              </div>
              <div>
                <div className="profile-v2-name-row">
                  <h2>{displayName}</h2>
                  <span className={`profile-v2-tier-pill profile-v2-tier-${userMembership.tier}`}>
                    <FaGem />
                    {tierInfo.displayName}
                  </span>
                </div>
                <p className="profile-v2-email">{currentUser?.email}</p>
                <p className="profile-v2-hero-copy">Track your progress, manage your account, and view your plan.</p>
              </div>
            </div>

            <div className="profile-v2-hero-actions">
              <button type="button" className="profile-v2-button profile-v2-button-secondary" onClick={handleEditProfile}>
                <FaEdit />
                Edit Profile
              </button>
              <button type="button" className="profile-v2-button profile-v2-button-primary" onClick={() => navigate('/membership/upgrade')}>
                <FaCrown />
                Manage Plan
              </button>
            </div>
          </section>

          <section className="profile-v2-stat-grid" aria-label="Learning statistics">
            {statCards.map(card => (
              <article key={card.label} className={`profile-v2-stat-card profile-v2-tone-${card.tone}`}>
                <div className="profile-v2-stat-top">
                  <span className="profile-v2-stat-icon">{card.icon}</span>
                  <div>
                    <p>{card.label}</p>
                    <strong>{renderAnimatedValue(card.value, card.suffix)}</strong>
                  </div>
                </div>
                <div className="profile-v2-stat-footer">
                  {card.footerIcon && card.footerIcon}
                  <span>{card.footer}</span>
                </div>
              </article>
            ))}
          </section>

          {authError && <div className="profile-v2-error">{authError}</div>}

          <section className="profile-v2-panel-grid">
            <article className="profile-v2-panel profile-v2-membership-panel">
              <span className="profile-v2-panel-eyebrow">Current Membership</span>
              <h2><FaGem /> {tierInfo.displayName}</h2>
              <p>{isFree ? 'Start with the essentials, then unlock advanced SAT prep when you are ready.' : 'Unlimited practice questions, detailed analytics, flashcards, and priority support.'}</p>
              <ul>
                {membershipBenefits.map(benefit => (
                  <li key={benefit}>
                    <FaCheck />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
              <button type="button" onClick={() => navigate('/membership/upgrade')}>
                {isFree ? 'Upgrade Subscription' : 'Manage Subscription'}
              </button>
              <div className="profile-v2-gem-illustration" aria-hidden="true">
                <FaGem />
              </div>
            </article>

            <article className="profile-v2-panel" id="profile-account-details">
              <div className="profile-v2-panel-title">
                <FaUser />
                <h2>Account Details</h2>
              </div>
              <dl className="profile-v2-detail-list">
                <div>
                  <dt>Full Name</dt>
                  <dd>{displayName}</dd>
                </div>
                <div>
                  <dt>Email</dt>
                  <dd>{currentUser?.email}</dd>
                </div>
                <div>
                  <dt>Plan</dt>
                  <dd className="profile-v2-detail-tier"><FaGem /> {tierInfo.displayName}</dd>
                </div>
                <div>
                  <dt>Join Date</dt>
                  <dd>{joinDate}</dd>
                </div>
                <div>
                  <dt>Study Goal</dt>
                  <dd>{studyGoal}</dd>
                </div>
              </dl>
              <button type="button" onClick={handleEditProfile}>Update Information</button>
            </article>

            <article className="profile-v2-panel">
              <div className="profile-v2-panel-title profile-v2-panel-title-spread">
                <span>
                  <FaCalendarAlt />
                  <h2>Recent Activity</h2>
                </span>
                <Link to="/progress">View All <FaArrowRight /></Link>
              </div>
              <div className="profile-v2-activity-list">
                {recentActivity.map(activity => (
                  <div key={activity.title} className="profile-v2-activity-item">
                    <span className={`profile-v2-activity-icon profile-v2-tone-${activity.tone}`}>{activity.icon}</span>
                    <div>
                      <strong>{activity.title}</strong>
                      <p>{activity.meta}</p>
                    </div>
                    <time>{activity.time}</time>
                  </div>
                ))}
              </div>
              <Link className="profile-v2-panel-link" to="/progress">
                View All Activity <FaArrowRight />
              </Link>
            </article>
          </section>

          <section className="profile-v2-bottom-grid">
            <article className="profile-v2-panel profile-v2-performance-card">
              <div className="profile-v2-panel-title profile-v2-panel-title-spread">
                <span>
                  <FaChartLine />
                  <h2>Performance Snapshot</h2>
                </span>
                <button type="button">
                  Last 6 Tests <FaChevronDown />
                </button>
              </div>
              <div className="profile-v2-chart" aria-label="Performance scores over six tests">
                <div className="profile-v2-chart-y">
                  <span>1600</span>
                  <span>1500</span>
                  <span>1400</span>
                  <span>1300</span>
                  <span>1200</span>
                  <span>1100</span>
                </div>
                <svg viewBox="0 0 720 220" role="img" aria-hidden="true">
                  <defs>
                    <linearGradient id="profileChartFill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#0aa35f" stopOpacity="0.22" />
                      <stop offset="100%" stopColor="#0aa35f" stopOpacity="0.02" />
                    </linearGradient>
                  </defs>
                  <path d="M35 150 L165 132 L295 112 L425 92 L555 72 L685 58 L685 195 L35 195 Z" fill="url(#profileChartFill)" />
                  <polyline points="35,150 165,132 295,112 425,92 555,72 685,58" fill="none" stroke="#0aa35f" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                  {performanceScores.map((score, index) => {
                    const x = 35 + index * 130;
                    const y = [150, 132, 112, 92, 72, 58][index];
                    return (
                      <g key={`score-${index}`}>
                        <circle cx={x} cy={y} r="8" fill="#ffffff" stroke="#0aa35f" strokeWidth="4" />
                        <text x={x} y={y - 18} textAnchor="middle">{score}</text>
                      </g>
                    );
                  })}
                  <rect x="660" y="26" width="48" height="22" rx="7" fill="#0aa35f" />
                  <text x="684" y="42" textAnchor="middle" fill="#ffffff">{performanceScores[5]}</text>
                </svg>
                <div className="profile-v2-chart-x">
                  {performanceScores.map((_, index) => <span key={`test-${index}`}>Test {index + 1}</span>)}
                </div>
              </div>
            </article>

            <article className="profile-v2-panel profile-v2-achievements-card">
              <div className="profile-v2-panel-title">
                <FaTrophy />
                <h2>Achievements</h2>
              </div>
              <div className="profile-v2-achievements">
                <div>
                  <span className="profile-v2-achievement-icon profile-v2-tone-green"><FaFire /></span>
                  <strong>7</strong>
                  <p>Day Streak</p>
                  <small>Keep it going!</small>
                </div>
                <div>
                  <span className="profile-v2-achievement-icon profile-v2-tone-purple"><FaStar /></span>
                  <strong>{stats.averageAccuracy >= 50 ? 'Math' : 'Reading'}</strong>
                  <p>Favorite Subject</p>
                  <small>You excel here!</small>
                </div>
                <div>
                  <span className="profile-v2-achievement-icon profile-v2-tone-orange"><FaShieldAlt /></span>
                  <strong>Top {rankingsLoaded ? getTopPercent(rankings.questionsRanking) : 25}%</strong>
                  <p>Among All Users</p>
                  <small>Great job!</small>
                </div>
              </div>
              <Link className="profile-v2-panel-link" to="/progress">
                View All Achievements <FaArrowRight />
              </Link>
            </article>
          </section>
        </main>
      </div>
    </div>
  );
}

export default Profile;
