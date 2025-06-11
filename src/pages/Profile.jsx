import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaBell, FaBellSlash, FaBook, FaClipboardCheck, FaTrophy, FaBullseye, FaQuestionCircle, FaMedal, FaChartLine, FaSpinner } from 'react-icons/fa';
import '../styles/Auth.css';
import { db } from '../firebase/config';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { getUserRankings } from '../firebase/rankingServices';
import CountUp from 'react-countup';

function Profile() {
  const { currentUser, logout, initializeNotifications, getUserResults } = useAuth();
  const [error, setError] = useState('');
  const [notificationStatus, setNotificationStatus] = useState('unknown');
  const [notificationLoading, setNotificationLoading] = useState(false);
  // Start with loading state but with default values of 0 to enable immediate rendering
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
  
  // Track data loading separately from animations, with separate states for stats and rankings
  const [statsLoaded, setStatsLoaded] = useState(false);
  const [rankingsLoaded, setRankingsLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check notification permission status
    if ("Notification" in window) {
      setNotificationStatus(Notification.permission);
    } else {
      setNotificationStatus('not-supported');
    }

    // Load user statistics
    if (currentUser) {
      fetchUserStatistics();
      fetchUserRankings();
    }
  }, [currentUser]);
  
  const fetchUserRankings = async () => {
    try {
      // Keep rankings.loading as true during the fetch process
      // but the UI will already be showing loading animations
      const rankingData = await getUserRankings(currentUser.uid);
      
      // Update rankings data
      setRankings({
        ...rankingData,
        loading: false
      });
      
      // Mark rankings as loaded immediately with a small delay
      setTimeout(() => setRankingsLoaded(true), 300);
    } catch (err) {
      console.error('Error fetching user rankings:', err);
      setRankings(prev => ({ ...prev, loading: false }));
      
      // Even in case of error, we want to mark rankings as loaded
      setTimeout(() => setRankingsLoaded(true), 300);
    }
  };
  
  const fetchUserStatistics = async () => {
    try {
      // Start animations immediately by showing the loading UI
      // We keep stats.loading as true during the fetch process
      
      // Initialize counters
      let totalQuestions = 0;
      
      // Fetch questions attempted from userProgress collection (mainly practice exam questions)
      const userProgressRef = collection(db, 'userProgress');
      const progressQuery = query(userProgressRef, where('userId', '==', currentUser.uid));
      const progressSnapshot = await getDocs(progressQuery);
      const examQuestionsCount = progressSnapshot.size;
      totalQuestions += examQuestionsCount;
      
      // Fetch practice exams completed from the user's practiceExams subcollection
      const practiceExamsRef = collection(db, `users/${currentUser.uid}/practiceExams`);
      const examsSnapshot = await getDocs(practiceExamsRef);
      
      // Get legacy exam results too
      const legacyResults = await getUserResults();
      const practiceExamsCompleted = examsSnapshot.size + legacyResults.length;

      // For quizzes, check the user's progress collection which stores adaptive quiz history
      let quizzesCompleted = 0;
      let quizQuestionsCount = 0;
      try {
        // Progress subcollection contains documents for each subcategory
        const userProgressColRef = collection(db, `users/${currentUser.uid}/progress`);
        const subcategoriesSnapshot = await getDocs(userProgressColRef);
        
        // Each subcategory progress document has an 'attempts' field that counts quiz attempts
        // and a totalQuestions field that counts the number of questions attempted
        subcategoriesSnapshot.docs.forEach(doc => {
          const data = doc.data();
          if (data.attempts) {
            quizzesCompleted += data.attempts;
          }
          if (data.totalQuestions) {
            quizQuestionsCount += data.totalQuestions;
          }
        });
        
        // Add quiz questions to total questions count
        totalQuestions += quizQuestionsCount;
        
        console.log(`Counting questions: ${examQuestionsCount} exam questions + ${quizQuestionsCount} quiz questions = ${totalQuestions} total`);
      } catch (err) {
        console.error('Error fetching quiz count:', err);
      }
      
      // Fetch subcategories mastered
      const userProgressColRef = collection(db, `users/${currentUser.uid}/progress`);
      let subcategoriesSnapshot;
      
      // We may have already fetched this data for quiz counting
      if (typeof subcategoriesSnapshot === 'undefined') {
        subcategoriesSnapshot = await getDocs(userProgressColRef);
      }
      
      const masteredSubcategories = subcategoriesSnapshot.docs.filter(doc => doc.data().mastered).length;
      
      // Calculate average accuracy
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
      
      // Update the stats object with actual values, but don't set dataLoaded yet
      // We want to ensure both stats and rankings are loaded before triggering animations
      setStats({
        totalQuestions,
        practiceExamsCompleted,
        quizzesCompleted,
        topicsMastered: masteredSubcategories,
        averageAccuracy,
        loading: false
      });
      
      // Mark stats as loaded immediately with a small delay to ensure state update
      setTimeout(() => setStatsLoaded(true), 300);
    } catch (err) {
      console.error('Error fetching user statistics:', err);
      setStats(prev => ({ ...prev, loading: false }));
      
      // Even in case of error, we want to mark stats as loaded
      setTimeout(() => setStatsLoaded(true), 300);
    }
  };

  async function handleLogout() {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      setError('Failed to log out');
      console.error(err);
    }
  }
  
  async function handleEnableNotifications() {
    if (!currentUser) return;
    
    try {
      setNotificationLoading(true);
      // Clear any previous denial records to allow a new request
      localStorage.removeItem('notification_permission_denied_at');
      
      // Initialize notifications with user's explicit permission
      const result = await initializeNotifications(currentUser.uid);
      
      if (result) {
        setNotificationStatus('granted');
      } else {
        // Check what happened with the permission
        if ("Notification" in window) {
          setNotificationStatus(Notification.permission);
        }
      }
    } catch (err) {
      console.error('Error enabling notifications:', err);
    } finally {
      setNotificationLoading(false);
    }
  }



  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>My Profile</h1>
        <div className="profile-actions">
          <Link to="/" className="auth-button">Home</Link>
          <button onClick={handleLogout} className="auth-button">Log Out</button>
        </div>
      </div>

      <div className="user-info">
        <div className="user-info-content">
          <h2>Welcome, {currentUser?.displayName || 'User'}</h2>
          <p className="user-email"><span className="email-label">Email:</span> {currentUser?.email}</p>
        </div>
      </div>
      
      <div className="stats-container">
        <h2>Your Learning Stats</h2>
          <>
            {/* Top row with ranking stats */}
            <div className="ranking-stats-grid">
              <div className="ranking-stat-card">
                <div className="ranking-stat-icon">
                  <FaClipboardCheck size={32} />
                </div>
                <div className="ranking-stat-content">
                  <h3>Questions Solved</h3>
                  <div className="ranking-value-container">
                    <p className="ranking-stat-value">
                      {!statsLoaded ? (
                        <span className="loading-spinner"><FaSpinner /></span>
                      ) : (
                        <CountUp 
                          start={0}
                          end={stats.totalQuestions} 
                          duration={2.5} 
                          separator="," 
                          delay={0.1}
                          redraw={true}
                        />
                      )}
                    </p>
                    <div className="ranking-percentage">
                      <FaMedal size={20} />
                      <span>
                        {!rankingsLoaded ? (
                          <span className="calculating-text">Calculating...</span>
                        ) : (
                          rankings.questionsRanking.position === 1
                            ? "Top 1% of users"
                            : <>Top <CountUp 
                                 start={0}
                                 end={Math.max(1, Math.min(99, 100 - rankings.questionsRanking.percentile))} 
                                 duration={1.5} 
                                 delay={0.2}
                                 redraw={true}
                               />% of users</>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="ranking-stat-card">
                <div className="ranking-stat-icon">
                  <FaBullseye size={32} />
                </div>
                <div className="ranking-stat-content">
                  <h3>Average Accuracy</h3>
                  <div className="ranking-value-container">
                    <p className="ranking-stat-value">
                      {!statsLoaded ? (
                        <span className="loading-spinner"><FaSpinner /></span>
                      ) : (
                        <>
                          <CountUp 
                            start={0}
                            end={stats.averageAccuracy} 
                            duration={2.5} 
                            decimals={0} 
                            delay={0.3}
                            redraw={true}
                          />%
                        </>
                      )}
                    </p>
                    <div className="ranking-percentage">
                      <FaChartLine size={20} />
                      <span>
                        {!rankingsLoaded ? (
                          <span className="calculating-text">Calculating...</span>
                        ) : (
                          rankings.accuracyRanking.position === 1
                            ? "Top 1% of users"
                            : <>Top <CountUp 
                                 start={0}
                                 end={Math.max(1, Math.min(99, 100 - rankings.accuracyRanking.percentile))} 
                                 duration={1.5} 
                                 delay={0.2}
                                 redraw={true}
                               />% of users</>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Bottom row with regular stats */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">
                  <FaBook size={24} />
                </div>
                <div className="stat-content">
                  <h3>Practice Exams</h3>
                  <p className="stat-value">
                    {!statsLoaded ? (
                      <span className="loading-spinner"><FaSpinner /></span>
                    ) : (
                      <CountUp 
                        start={0}
                        end={stats.practiceExamsCompleted} 
                        duration={2} 
                        delay={0.5}
                        redraw={true}
                      />
                    )}
                  </p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">
                  <FaQuestionCircle size={24} />
                </div>
                <div className="stat-content">
                  <h3>Quizzes Completed</h3>
                  <p className="stat-value">
                    {!statsLoaded ? (
                      <span className="loading-spinner"><FaSpinner /></span>
                    ) : (
                      <CountUp 
                        start={0}
                        end={stats.quizzesCompleted} 
                        duration={2} 
                        delay={0.6}
                        redraw={true}
                      />
                    )}
                  </p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">
                  <FaTrophy size={24} />
                </div>
                <div className="stat-content">
                  <h3>Topics Mastered</h3>
                  <p className="stat-value">
                    {!statsLoaded ? (
                      <span className="loading-spinner"><FaSpinner /></span>
                    ) : (
                      <CountUp 
                        start={0}
                        end={stats.topicsMastered} 
                        duration={2} 
                        delay={0.7}
                        redraw={true}
                      />
                    )}
                  </p>
                </div>
              </div>
            </div>
          </>
        <div className="action-buttons">
          <Link to="/progress" className="auth-button primary">My Progress Dashboard</Link>
        </div>
      </div>

      <div className="notification-settings">
        <h3>Notification Settings</h3>
        {notificationStatus === 'not-supported' ? (
          <p>Notifications are not supported in your browser.</p>
        ) : notificationStatus === 'granted' ? (
          <div className="notification-status enabled">
            <FaBell size={20} />
            <span>Notifications are enabled</span>
          </div>
        ) : (
          <div className="notification-actions">
            <div className="notification-status">
              <FaBellSlash size={20} />
              <span>Notifications are {notificationStatus === 'denied' ? 'blocked' : 'disabled'}</span>
            </div>
            {notificationStatus === 'denied' ? (
              <p className="notification-help">
                To enable notifications, you need to allow them in your browser settings.
                Click the lock/info icon in your browser's address bar and change notification settings.
              </p>
            ) : (
              <button 
                onClick={handleEnableNotifications} 
                className="auth-button"
                disabled={notificationLoading}
              >
                {notificationLoading ? 'Enabling...' : 'Enable Notifications'}
              </button>
            )}
          </div>
        )}
      </div>

      {error && <div className="auth-error">{error}</div>}
    </div>
  );
}

export default Profile;
