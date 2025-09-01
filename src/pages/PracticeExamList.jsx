import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getAllPracticeExams } from '../firebase/services';
import { useAuth } from '../contexts/AuthContext';
import '../styles/PracticeExamList.css';
import '../styles/Sidebar.css'; // for .pro-badge style
import UpgradeModal from '../components/UpgradeModal';

const PracticeExamList = () => {
  const { currentUser, userMembership, getInProgressExams } = useAuth();
  const [practiceExams, setPracticeExams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [inProgressExams, setInProgressExams] = useState([]);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch all public practice exams on component mount
  useEffect(() => {
    fetchPracticeExams();
  }, []);

  // Fetch in-progress exams for current user
  useEffect(() => {
    const fetchInProgress = async () => {
      if (!currentUser || !getInProgressExams) {
        setInProgressExams([]);
        return;
      }
      try {
        const items = await getInProgressExams();
        setInProgressExams(items || []);
      } catch (e) {
        // Non-blocking
        setInProgressExams([]);
      }
    };
    fetchInProgress();
  }, [currentUser]);

  // Auto-start exam if redirected from authentication
  useEffect(() => {
    if (location.state?.startExamNumber && practiceExams.length > 0) {
      const examNumber = location.state.startExamNumber;
      const examIndex = examNumber - 1; // Convert to 0-based index
      
      if (examIndex >= 0 && examIndex < practiceExams.length) {
        const exam = practiceExams[examIndex];
        // Clear the state to prevent re-triggering
        window.history.replaceState({}, document.title);
        // Start the exam
        handleStartExam(exam, examIndex, false);
      }
    }
  }, [practiceExams, location.state]);

  // Fetch practice exams that are marked as public
  const fetchPracticeExams = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Only fetch exams marked as public for the public listing
      const exams = await getAllPracticeExams(true);
      
      // Sort exams numerically by title
      exams.sort((a, b) => {
        const numA = parseInt(a.title.match(/\d+/)?.[0] || 0, 10);
        const numB = parseInt(b.title.match(/\d+/)?.[0] || 0, 10);
        return numA - numB;
      });
      
      setPracticeExams(exams);
      setIsLoading(false);
    } catch (err) {
      setError('Failed to load practice exams: ' + err.message);
      setIsLoading(false);
    }
  };

  // Handle continue saved exam
  const handleContinueExam = (progress) => {
    if (!progress || !progress.practiceExamId) return;
    navigate('/practice-exam/' + progress.practiceExamId, { state: { resume: true } });
  };

  // Handle start practice exam
  const handleStartExam = (exam, idx, isPro) => {
    if (!exam) return;
    // If this is a pro exam and user is not paid, show modal
    const isFreeOrNotSignedIn = !currentUser || !userMembership || userMembership.tier === 'free';
    if (isPro && isFreeOrNotSignedIn) {
      setShowUpgradeModal(true);
      return;
    }
    // Otherwise, allow navigation
    sessionStorage.setItem('currentPracticeExam', JSON.stringify({
      examId: exam.id,
      title: exam.title,
      moduleIds: exam.moduleIds
    }));
    navigate('/practice-exam/' + exam.id, { state: { startExam: true } });
  };

  return (
    <>
      <div className="practice-exam-list-page">
        <div className="page-container">
          {error && <div className="error-message">{error}</div>}

          <div className="exam-selection-container">
          {currentUser && inProgressExams && inProgressExams.length > 0 && (
            <div className="exam-list-section">
              <h2>Continue Where You Left Off</h2>
              <div className="exam-cards">
                {inProgressExams.map((p) => {
                  const updatedAt = p.updatedAt?.toDate ? p.updatedAt.toDate() : (p.updatedAt?.seconds ? new Date(p.updatedAt.seconds * 1000) : null);
                  const subtitle = `Module ${typeof p.currentModuleIndex === 'number' ? (p.currentModuleIndex + 1) : 1}, Question ${typeof p.currentQuestionIndex === 'number' ? (p.currentQuestionIndex + 1) : 1}`;
                  return (
                    <div 
                      key={p.practiceExamId}
                      className="exam-card"
                      onClick={() => handleContinueExam(p)}
                    >
                      <div className="exam-title-row">
                        <span className="exam-title-text">{p.examTitle || 'Practice Exam'}</span>
                        <span className="exam-duration">Continue</span>
                      </div>
                      <div className="exam-description">
                        <small>{subtitle}{updatedAt ? ` • Saved ${updatedAt.toLocaleString()}` : ''}</small>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
            {/* Predictive/diagnostic exams have been moved to /predictive-exam */}

            {/* Full-Length Exams Section */}
            <div className="exam-list-section">
              <h2>Full-Length Practice Exams</h2>
              <p className="section-description">Complete practice exams with 4 modules (2 R&W + 2 Math) and intermission</p>
              {isLoading && !practiceExams.length ? (
                <div className="loading-spinner">
                  <div className="spinner"></div>
                  <p>Loading practice exams...</p>
                </div>
              ) : practiceExams.length > 0 ? (
                <div className="exam-cards">
                  {practiceExams.filter(exam => !exam.isDiagnostic).map((exam, idx) => {
                    // Show pro badge if NOT one of the first 3 and user is free or not signed in
                    const isProExam = idx > 2;
                    const showPro = isProExam && (!currentUser || !userMembership || userMembership.tier === 'free');
                    return (
                      <div 
                        key={exam.id}
                        className="exam-card"
                        onClick={() => handleStartExam(exam, idx, isProExam)}
                      >
                        <div className="exam-title-row">
                          <span className="exam-title-text">{`SAT Practice ${idx + 1}`}</span>
                          {showPro && (
                            <span className="pro-badge" style={{marginLeft: 8}}>Pro</span>
                          )}
                          <span className="exam-duration">~3 hours</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="no-exams-message">
                  <p>No practice exams are currently available.</p>
                  <p>Please check back later for new content.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <UpgradeModal open={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
    </>
  );
};

export default PracticeExamList;
