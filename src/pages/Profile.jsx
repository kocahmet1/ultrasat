import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaBell, FaBellSlash, FaBook, FaClipboardCheck, FaTrophy, FaBullseye, FaQuestionCircle, FaMedal, FaChartLine, FaSpinner } from 'react-icons/fa';
import '../styles/Profile.css';
import { getTierInfo, getAvailableUpgrades, MEMBERSHIP_TIERS } from '../utils/membershipUtils';
import MembershipCard from '../components/membership/MembershipCard';
import MembershipBadge from '../components/membership/MembershipBadge';
import { db } from '../firebase/config';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { getUserRankings } from '../firebase/rankingServices';
import CountUp from 'react-countup';

function Profile() {
  const { currentUser, logout, initializeNotifications, getUserResults, userMembership, updateMembershipTier, loading } = useAuth();
  const [error, setError] = useState('');
  const [notificationStatus, setNotificationStatus] = useState('unknown');
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [stats, setStats] = useState({
    totalQuestions: 0,
    practiceExamsCompleted: 0,
    quizzesCompleted: 0,
    topicsMastered: 0,
    averageAccuracy: 0,
    loading: true
  });
  const [rankings, setRankings] = useState({
    questionsRanking: { percentile: 0, position: 0, total: 0 },
    accuracyRanking: { percentile: 0, position: 0, total: 0 },
    loading: true
  });
  
  const [statsLoaded, setStatsLoaded] = useState(false);
  const [rankingsLoaded, setRankingsLoaded] = useState(false);
  const navigate = useNavigate();
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    if ("Notification" in window) {
      setNotificationStatus(Notification.permission);
    } else {
      setNotificationStatus('not-supported');
    }

    if (currentUser) {
      fetchUserStatistics();
      fetchUserRankings();
    }
  }, [currentUser]);
  
  const fetchUserRankings = async () => {
    try {
      const rankingData = await getUserRankings(currentUser.uid);
      setRankings({
        ...rankingData,
        loading: false
      });
      setTimeout(() => setRankingsLoaded(true), 300);
    } catch (err) {
      console.error('Error fetching user rankings:', err);
      setRankings(prev => ({ ...prev, loading: false }));
      setTimeout(() => setRankingsLoaded(true), 300);
    }
  };
  
  const fetchUserStatistics = async () => {
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
        loading: false
      });
      
      setTimeout(() => setStatsLoaded(true), 300);
    } catch (err) {
      console.error('Error fetching user statistics:', err);
      setStats(prev => ({ ...prev, loading: false }));
      setTimeout(() => setStatsLoaded(true), 300);
    }
  };

  async function handleLogout() {
    try {
      await logout();
    } catch (err) {
      setError('Failed to log out');
      console.error(err);
    }
  }
  
  async function handleEnableNotifications() {
    if (!currentUser) return;
    
    try {
      setNotificationLoading(true);
      localStorage.removeItem('notification_permission_denied_at');
      const result = await initializeNotifications(currentUser.uid);
      setNotificationStatus(result ? 'granted' : Notification.permission);
    } catch (err) {
      console.error('Error enabling notifications:', err);
    } finally {
      setNotificationLoading(false);
    }
  }

  const handleUpgrade = async (newTier) => {
    setIsUpgrading(true);
    setSelectedPlan(newTier);
    try {
      console.log(`Upgrading to ${newTier}...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      const success = await updateMembershipTier(newTier, 12);
      if (success) {
        alert(`Successfully upgraded to ${getTierInfo(newTier).displayName}!`);
      } else {
        alert('Upgrade failed. Please try again.');
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      alert('Upgrade failed. Please try again.');
    } finally {
      setIsUpgrading(false);
      setSelectedPlan(null);
    }
  };

  // Auto-reload logic if stuck loading for too long (only once per session)
  React.useEffect(() => {
    if ((loading || !userMembership) && typeof window !== 'undefined') {
      const alreadyReloaded = sessionStorage.getItem('profile_auto_reloaded');
      const timeout = setTimeout(() => {
        if (!(userMembership) && !alreadyReloaded) {
          sessionStorage.setItem('profile_auto_reloaded', 'true');
          window.location.reload();
        }
      }, 2000); // 2 seconds
      return () => clearTimeout(timeout);
    }
  }, [loading, userMembership]);

  if (loading || !userMembership) {
    return (
      <div className="membership-page">
        <div className="membership-loading">
          <div className="loading-spinner"></div>
          <p>Loading membership information...</p>
        </div>
      </div>
    );
  }

  const availableUpgrades = getAvailableUpgrades(userMembership.tier);
  // Hide Max tier from the plans grid
  const allTiers = [
    { tier: MEMBERSHIP_TIERS.FREE, ...getTierInfo(MEMBERSHIP_TIERS.FREE) },
    { tier: MEMBERSHIP_TIERS.PLUS, ...getTierInfo(MEMBERSHIP_TIERS.PLUS) }
    // { tier: MEMBERSHIP_TIERS.MAX, ...getTierInfo(MEMBERSHIP_TIERS.MAX) } // Hidden for now
  ];

  return (
    <div className="profile-container">


      <div className="user-info">
        <div className="user-info-content">
          <h2>Welcome, {currentUser?.displayName || 'User'}</h2>
          <p className="user-email"><span className="email-label">Email:</span> {currentUser?.email}</p>
        </div>
      </div>
      
      <div className="stats-container">
        <h2>Your Learning Stats</h2>
          <>
            <div className="ranking-stats-grid">
              <div className="ranking-stat-card">
                <div className="ranking-stat-icon"><FaClipboardCheck size={32} /></div>
                <div className="ranking-stat-content">
                  <h3>Questions Solved</h3>
                  <div className="ranking-value-container">
                    <p className="ranking-stat-value">
                      {!statsLoaded ? <span className="loading-spinner"><FaSpinner /></span> : <CountUp start={0} end={stats.totalQuestions} duration={2.5} separator="," delay={0.1} redraw={true} />}
                    </p>
                    <div className="ranking-percentage">
                      <FaMedal size={20} />
                      <span>
                        {!rankingsLoaded ? <span className="calculating-text">Calculating...</span> : (rankings.questionsRanking.position === 1 ? "Top 1% of users" : <>Top <CountUp start={0} end={Math.max(1, Math.min(99, 100 - rankings.questionsRanking.percentile))} duration={1.5} delay={0.2} redraw={true} />% of users</>)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="ranking-stat-card">
                <div className="ranking-stat-icon"><FaBullseye size={32} /></div>
                <div className="ranking-stat-content">
                  <h3>Average Accuracy</h3>
                  <div className="ranking-value-container">
                    <p className="ranking-stat-value">
                      {!statsLoaded ? <span className="loading-spinner"><FaSpinner /></span> : <><CountUp start={0} end={stats.averageAccuracy} duration={2.5} decimals={0} delay={0.3} redraw={true} />%</>}
                    </p>
                    <div className="ranking-percentage">
                      <FaChartLine size={20} />
                      <span>
                        {!rankingsLoaded ? <span className="calculating-text">Calculating...</span> : (rankings.accuracyRanking.position === 1 ? "Top 1% of users" : <>Top <CountUp start={0} end={Math.max(1, Math.min(99, 100 - rankings.accuracyRanking.percentile))} duration={1.5} delay={0.2} redraw={true} />% of users</>)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon"><FaBook size={24} /></div>
                <div className="stat-content">
                  <h3>Practice Exams</h3>
                  <p className="stat-value">
                    {!statsLoaded ? <span className="loading-spinner"><FaSpinner /></span> : <CountUp start={0} end={stats.practiceExamsCompleted} duration={2} delay={0.5} redraw={true} />}
                  </p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon"><FaQuestionCircle size={24} /></div>
                <div className="stat-content">
                  <h3>Quizzes Completed</h3>
                  <p className="stat-value">
                    {!statsLoaded ? <span className="loading-spinner"><FaSpinner /></span> : <CountUp start={0} end={stats.quizzesCompleted} duration={2} delay={0.6} redraw={true} />}
                  </p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon"><FaTrophy size={24} /></div>
                <div className="stat-content">
                  <h3>Topics Mastered</h3>
                  <p className="stat-value">
                    {!statsLoaded ? <span className="loading-spinner"><FaSpinner /></span> : <CountUp start={0} end={stats.topicsMastered} duration={2} delay={0.7} redraw={true} />}
                  </p>
                </div>
              </div>
            </div>
          </>
        <div className="action-buttons">
          <Link to="/progress" className="auth-button primary">My Progress Dashboard</Link>
        </div>
      </div>

      {error && <div className="auth-error">{error}</div>}

      <div className="membership-section">
        <div className="current-membership">
          <h2>Your current membership tier: <span className="tier-name">{getTierInfo(userMembership.tier).displayName}</span></h2>
        </div>

        {userMembership.tier === MEMBERSHIP_TIERS.FREE && (
          <div className="missing-features-section">
            <h3>Features you're missing with Plus:</h3>
            <ul className="missing-features-list">
              <li>10 full length SAT exams</li>
              <li>AI Coach</li>
              <li>Detailed progress analysis</li>
              <li>Word Bank Quizzes</li>
              <li>Lectures</li>
              <li>Flashcard system</li>
              <li>Priority support</li>
            </ul>
            <div className="upgrade-action">
              <button 
                className="upgrade-btn"
                onClick={() => navigate('/pricing')}
              >
                Upgrade to Plus
                      </button>
            </div>
          </div>
        )}

        {userMembership.tier === MEMBERSHIP_TIERS.PLUS && (
          <div className="membership-status">
            <p>You have access to all Plus features! Enjoy unlimited practice questions, detailed analytics, flashcards, and email support.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
