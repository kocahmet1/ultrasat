import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CountUp from 'react-countup';
import {
  FiArrowRight,
  FiBookOpen,
  FiCheckSquare,
  FiHelpCircle,
  FiCheck,
} from 'react-icons/fi';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { getUserRankings } from '../firebase/rankingServices';
import { getTierInfo, MEMBERSHIP_TIERS } from '../utils/membershipUtils';
import '../styles/Profile.css';

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

  const displayName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Student';
  const userInitial = displayName.trim().charAt(0).toUpperCase() || 'S';
  const tierInfo = getTierInfo(userMembership?.tier || MEMBERSHIP_TIERS.FREE);
  const isFree = (userMembership?.tier || MEMBERSHIP_TIERS.FREE) === MEMBERSHIP_TIERS.FREE;
  const joinDate = formatDate(currentUser?.metadata?.creationTime || userMembership?.startDate);
  const studyGoal = stats.practiceExamsCompleted > 0 || stats.averageAccuracy > 0 ? '1600+ on SAT' : 'Build SAT foundations';

  // Rank footnotes only when real ranking data came back (total > 0) — never
  // fabricated from the empty-state defaults.
  const questionsRankNote = rankingsLoaded && rankings.questionsRanking?.total > 0
    ? `Top ${getTopPercent(rankings.questionsRanking)}% of users`
    : null;
  const accuracyRankNote = rankingsLoaded && rankings.accuracyRanking?.total > 0
    ? `Top ${getTopPercent(rankings.accuracyRanking)}% of users`
    : null;

  const statCards = [
    { label: 'Questions solved', value: stats.totalQuestions, note: questionsRankNote },
    { label: 'Average accuracy', value: stats.averageAccuracy, suffix: '%', note: accuracyRankNote },
    { label: 'Practice exams', value: stats.practiceExamsCompleted, note: null },
    { label: 'Quizzes completed', value: stats.quizzesCompleted, note: null },
  ];

  // Honest totals only — entries appear once the underlying stat is real.
  const recentActivity = [];
  if (stats.practiceExamsCompleted > 0) {
    recentActivity.push({
      icon: <FiCheckSquare />,
      title: `${stats.practiceExamsCompleted} practice ${stats.practiceExamsCompleted === 1 ? 'test' : 'tests'} completed`,
      meta: 'See details in Results',
      time: '',
    });
  }
  if (stats.quizzesCompleted > 0) {
    recentActivity.push({
      icon: <FiHelpCircle />,
      title: `${stats.quizzesCompleted} skill ${stats.quizzesCompleted === 1 ? 'quiz' : 'quizzes'} completed`,
      meta: `Lifetime accuracy: ${stats.averageAccuracy}%`,
      time: '',
    });
  }
  if (stats.topicsMastered > 0) {
    recentActivity.push({
      icon: <FiBookOpen />,
      title: `${stats.topicsMastered} ${stats.topicsMastered === 1 ? 'skill' : 'skills'} mastered`,
      meta: 'Keep leveling up',
      time: '',
    });
  }

  const renderAnimatedValue = (value, suffix = '') => {
    if (!statsLoaded) {
      return <span className="ut-skeleton ut-skeleton--text pf-stat-skeleton" aria-hidden="true" />;
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
      <div className="ut-page" role="status" aria-label="Loading profile">
        <div className="ut-skeleton ut-skeleton--text" style={{ width: 110, marginBottom: 12 }} />
        <div className="ut-skeleton ut-skeleton--title" style={{ width: 220, marginBottom: 26 }} />
        <div className="ut-grid ut-grid--4" style={{ marginBottom: 22 }}>
          <div className="ut-skeleton ut-skeleton--stat" />
          <div className="ut-skeleton ut-skeleton--stat" />
          <div className="ut-skeleton ut-skeleton--stat" />
          <div className="ut-skeleton ut-skeleton--stat" />
        </div>
        <div className="ut-skeleton-stack">
          <div className="ut-skeleton ut-skeleton--card" />
          <div className="ut-skeleton ut-skeleton--card" />
        </div>
      </div>
    );
  }

  return (
    <div className="ut-page">
      <header className="ut-page-head">
        <div className="ut-page-head-main">
          <p className="ut-eyebrow">Account</p>
          <h1 className="ut-page-title">Profile</h1>
          <p className="ut-page-sub">Track your progress, manage your account, and view your plan.</p>
        </div>
      </header>

      <section className="ut-card pf-identity" aria-label="Account overview">
        <div className="pf-identity-main">
          <div className="pf-avatar" aria-hidden="true">
            {currentUser?.photoURL ? (
              <img src={currentUser.photoURL} alt="" />
            ) : (
              <span>{userInitial}</span>
            )}
          </div>
          <div className="pf-identity-info">
            <div className="pf-identity-name-row">
              <h2 className="pf-identity-name">{displayName}</h2>
              <span className="ut-chip ut-chip--accent">{tierInfo.displayName}</span>
            </div>
            <p className="pf-identity-email">{currentUser?.email}</p>
          </div>
        </div>

        <div className="ut-page-head-actions pf-identity-actions">
          <button type="button" className="ut-btn ut-btn--ghost" onClick={handleEditProfile}>
            Edit profile
          </button>
          <button
            type="button"
            className={`ut-btn ${isFree ? 'ut-btn--primary' : 'ut-btn--ghost'}`}
            onClick={() => navigate('/membership/upgrade')}
          >
            Manage plan
          </button>
        </div>
      </section>

      <section className="ut-grid ut-grid--4 pf-stats" aria-label="Learning statistics">
        {statCards.map(card => (
          <article key={card.label} className="ut-card">
            <div className="ut-stat">
              <span className="ut-stat-value">{renderAnimatedValue(card.value, card.suffix)}</span>
              <span className="ut-stat-label">{card.label}</span>
            </div>
            {card.note && <p className="pf-stat-note">{card.note}</p>}
          </article>
        ))}
      </section>

      {authError && (
        <div className="ut-chip ut-chip--hard pf-error" role="alert">
          {authError}
        </div>
      )}

      <div className="ut-grid ut-grid--2 pf-columns">
        <div className="pf-col">
          <section className="ut-panel-ink" aria-label="Current membership">
            <p className="ut-label ut-label--on-ink pf-membership-label">Current membership</p>
            <h2 className="pf-membership-tier">{tierInfo.displayName}</h2>
            <p className="pf-membership-copy">
              {isFree
                ? 'Start with the essentials, then unlock advanced SAT prep when you are ready.'
                : 'Unlimited practice questions, detailed analytics, flashcards, and priority support.'}
            </p>
            <ul className="pf-benefits">
              {membershipBenefits.map(benefit => (
                <li key={benefit}>
                  <FiCheck aria-hidden="true" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
            <button
              type="button"
              className={`ut-btn ${isFree ? 'ut-btn--primary' : 'ut-btn--soft'}`}
              onClick={() => navigate('/membership/upgrade')}
            >
              {isFree ? 'Upgrade Subscription' : 'Manage Subscription'}
            </button>
          </section>

          <section className="ut-card" id="profile-account-details" aria-label="Account details">
            <h2 className="ut-card-title">Account details</h2>
            <dl className="pf-details">
              <div className="pf-detail-row">
                <dt className="ut-label">Full name</dt>
                <dd>{displayName}</dd>
              </div>
              <div className="pf-detail-row">
                <dt className="ut-label">Email</dt>
                <dd>{currentUser?.email}</dd>
              </div>
              <div className="pf-detail-row">
                <dt className="ut-label">Plan</dt>
                <dd>{tierInfo.displayName}</dd>
              </div>
              <div className="pf-detail-row">
                <dt className="ut-label">Join date</dt>
                <dd>{joinDate}</dd>
              </div>
              <div className="pf-detail-row">
                <dt className="ut-label">Study goal</dt>
                <dd>{studyGoal}</dd>
              </div>
            </dl>
            <button type="button" className="ut-btn ut-btn--ghost" onClick={handleEditProfile}>
              Update Information
            </button>
          </section>
        </div>

        <div className="pf-col">
          <section className="ut-card" aria-label="Recent activity">
            <div className="pf-activity-head">
              <h2 className="ut-card-title">Recent activity</h2>
              <Link className="ut-link pf-activity-link" to="/progress">
                View All <FiArrowRight aria-hidden="true" />
              </Link>
            </div>
            {recentActivity.length > 0 ? (
              <div>
                {recentActivity.map(activity => (
                  <div key={activity.title} className="ut-row">
                    <span className="ut-tile">{activity.icon}</span>
                    <div className="pf-activity-text">
                      <strong>{activity.title}</strong>
                      <p>{activity.meta}</p>
                    </div>
                    {activity.time ? <time className="pf-activity-time">{activity.time}</time> : null}
                  </div>
                ))}
              </div>
            ) : (
              <div className="ut-empty">
                <b>No activity yet</b>
                Complete a practice test or a skill quiz and your progress will show up here.
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default Profile;
