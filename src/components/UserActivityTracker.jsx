import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  getUsersSignedUpOnDate, 
  getCompleteUserActivity,
  getRecentSignups 
} from '../firebase/userActivityServices';
import '../styles/UserActivityTracker.css';

const UserActivityTracker = () => {
  const { currentUser } = useAuth();
  
  // State for user list and selection
  const [todaySignups, setTodaySignups] = useState([]);
  const [recentSignups, setRecentSignups] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userActivity, setUserActivity] = useState(null);
  
  // State for UI control
  const [loading, setLoading] = useState(true);
  const [loadingUserDetails, setLoadingUserDetails] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('today'); // 'today' or 'recent'
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Load data on component mount
  useEffect(() => {
    loadTodaySignups();
    loadRecentSignups();
  }, []);

  // Load signups for today
  const loadTodaySignups = async () => {
    try {
      setLoading(true);
      setError(null);
      const users = await getUsersSignedUpOnDate(new Date());
      setTodaySignups(users);
    } catch (err) {
      console.error('Error loading today signups:', err);
      setError('Failed to load today\'s signups: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Load recent signups (last 7 days)
  const loadRecentSignups = async () => {
    try {
      const users = await getRecentSignups(7, 50); // Last 7 days, max 50 users
      setRecentSignups(users);
    } catch (err) {
      console.error('Error loading recent signups:', err);
    }
  };

  // Load signups for a specific date
  const loadSignupsForDate = async (date) => {
    try {
      setLoading(true);
      setError(null);
      const users = await getUsersSignedUpOnDate(new Date(date));
      setTodaySignups(users);
    } catch (err) {
      console.error('Error loading signups for date:', err);
      setError('Failed to load signups for selected date: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle user selection
  const handleUserClick = async (user) => {
    try {
      setSelectedUser(user);
      setLoadingUserDetails(true);
      
      const activity = await getCompleteUserActivity(user.id);
      setUserActivity(activity);
    } catch (err) {
      console.error('Error loading user activity:', err);
      setError('Failed to load user activity: ' + err.message);
    } finally {
      setLoadingUserDetails(false);
    }
  };

  // Clear user selection
  const clearUserSelection = () => {
    setSelectedUser(null);
    setUserActivity(null);
  };

  // Handle date change
  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    loadSignupsForDate(newDate);
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format timestamp for display
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    let date;
    if (timestamp.toDate) {
      // Firestore timestamp
      date = timestamp.toDate();
    } else {
      // ISO string or other format
      date = new Date(timestamp);
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format time duration in seconds to human readable format
  const formatDuration = (seconds) => {
    if (!seconds || seconds <= 0) return 'N/A';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  };

  // Render user list
  const renderUserList = (users, title) => (
    <div className="user-list-section">
      <h3>{title} ({users.length})</h3>
      {users.length === 0 ? (
        <p className="no-users">No users found</p>
      ) : (
        <div className="user-list">
          {users.map((user) => (
            <div 
              key={user.id} 
              className={`user-item ${selectedUser?.id === user.id ? 'selected' : ''}`}
              onClick={() => handleUserClick(user)}
            >
              <div className="user-info">
                <div className="user-email">{user.email}</div>
                <div className="user-name">{user.name || 'No name'}</div>
                <div className="user-signup-date">{formatDate(user.createdAt)}</div>
                <div className="user-tier">{user.membershipTier}</div>
              </div>
              <div className="user-arrow">→</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Render user activity details
  const renderUserActivity = () => {
    if (!selectedUser || !userActivity) return null;

    const { practiceExams, quizzes, progressSummary, wordBankCount, conceptBankCount } = userActivity;

    return (
      <div className="user-activity-details">
        <div className="activity-header">
          <div className="user-details">
            <h3>{selectedUser.email}</h3>
            <p>{selectedUser.name || 'No name'}</p>
            <p>Signed up: {formatDate(selectedUser.createdAt)}</p>
            <p>Membership: {selectedUser.membershipTier}</p>
          </div>
          <button 
            className="close-button"
            onClick={clearUserSelection}
          >
            ✕
          </button>
        </div>

        {/* Progress Summary */}
        <div className="progress-summary">
          <h4>Overall Progress</h4>
          <div className="progress-stats">
            <div className="stat">
              <span className="stat-label">Overall Accuracy:</span>
              <span className="stat-value">{progressSummary.overallAccuracy}%</span>
            </div>
            <div className="stat">
              <span className="stat-label">Total Questions:</span>
              <span className="stat-value">{progressSummary.totalQuestions}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Subcategories Practiced:</span>
              <span className="stat-value">{progressSummary.totalSubcategories}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Mastered:</span>
              <span className="stat-value">{progressSummary.masteredSubcategories}</span>
            </div>
          </div>
        </div>

        {/* Banks Summary */}
        <div className="banks-summary">
          <h4>User Banks</h4>
          <div className="bank-stats">
            <div className="bank-stat">
              <span className="bank-icon">📚</span>
              <span className="bank-label">Word Bank:</span>
              <span className="bank-count">{wordBankCount || 0} words</span>
            </div>
            <div className="bank-stat">
              <span className="bank-icon">🧠</span>
              <span className="bank-label">Concept Bank:</span>
              <span className="bank-count">{conceptBankCount || 0} concepts</span>
            </div>
          </div>
        </div>

        {/* Practice Exams */}
        <div className="practice-exams-section">
          <h4>Practice Exams ({practiceExams.length})</h4>
          {practiceExams.length === 0 ? (
            <p className="no-activity">No practice exams completed</p>
          ) : (
            <div className="activity-list">
              {practiceExams.map((exam) => (
                <div key={exam.id} className="activity-item">
                  <div className="activity-info">
                    <div className="activity-title">{exam.examTitle}</div>
                    <div className="activity-score">
                      Score: {exam.overallScore}% ({exam.correctAnswers}/{exam.totalQuestions})
                    </div>
                    {exam.scores && (
                      <div className="section-scores">
                        {exam.scores.readingWriting && (
                          <span>R&W: {exam.scores.readingWriting}</span>
                        )}
                        {exam.scores.math && (
                          <span>Math: {exam.scores.math}</span>
                        )}
                      </div>
                    )}
                    <div className="activity-date">{formatTimestamp(exam.completedAt)}</div>
                  </div>
                  {exam.isDiagnostic && (
                    <div className="diagnostic-badge">Diagnostic</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Smart Quizzes */}
        <div className="quizzes-section">
          <h4>Smart Quizzes ({quizzes.length})</h4>
          {quizzes.length === 0 ? (
            <p className="no-activity">No smart quizzes completed</p>
          ) : (
            <div className="activity-list">
              {quizzes.map((quiz) => (
                <div key={quiz.id} className="activity-item">
                  <div className="activity-info">
                    <div className="activity-title">
                      {quiz.subcategoryId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </div>
                    <div className="activity-score">
                      Score: {quiz.score}% | Level: {quiz.level} | Questions: {quiz.questionCount}
                    </div>
                    {quiz.totalTimeSpent && (
                      <div className="activity-timing">
                        Time spent: {formatDuration(quiz.totalTimeSpent)}
                      </div>
                    )}
                    <div className="activity-date">{formatTimestamp(quiz.completedAt)}</div>
                  </div>
                  <div className={`quiz-status ${quiz.passed ? 'passed' : 'failed'}`}>
                    {quiz.passed ? 'Passed' : 'Failed'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="user-activity-tracker">
      <div className="tracker-header">
        <h2>User Activity Tracker</h2>
        <p>Track user signups and their learning activity</p>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="tracker-content">
        {/* Left Panel - User Lists */}
        <div className="user-lists-panel">
          <div className="panel-tabs">
            <button 
              className={`tab-button ${activeTab === 'today' ? 'active' : ''}`}
              onClick={() => setActiveTab('today')}
            >
              Today's Signups
            </button>
            <button 
              className={`tab-button ${activeTab === 'recent' ? 'active' : ''}`}
              onClick={() => setActiveTab('recent')}
            >
              Recent Signups
            </button>
          </div>

          {activeTab === 'today' && (
            <div className="today-signups">
              <div className="date-selector">
                <label htmlFor="signup-date">Select Date:</label>
                <input 
                  type="date" 
                  id="signup-date"
                  value={selectedDate}
                  onChange={handleDateChange}
                />
              </div>
              
              {loading ? (
                <div className="loading">Loading signups...</div>
              ) : (
                renderUserList(todaySignups, `Signups for ${new Date(selectedDate).toDateString()}`)
              )}
            </div>
          )}

          {activeTab === 'recent' && (
            <div className="recent-signups">
              {renderUserList(recentSignups, 'Recent Signups (Last 7 days)')}
            </div>
          )}
        </div>

        {/* Right Panel - User Activity Details */}
        <div className="user-details-panel">
          {!selectedUser ? (
            <div className="no-selection">
              <h3>Select a User</h3>
              <p>Click on a user from the left to view their activity details</p>
            </div>
          ) : loadingUserDetails ? (
            <div className="loading">Loading user activity...</div>
          ) : (
            renderUserActivity()
          )}
        </div>
      </div>
    </div>
  );
};

export default UserActivityTracker; 