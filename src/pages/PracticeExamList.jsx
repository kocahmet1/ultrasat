import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllPracticeExams } from '../firebase/services';
import { useAuth } from '../contexts/AuthContext';
import '../styles/PracticeExamList.css';
import '../styles/Sidebar.css'; // for .pro-badge style
import UpgradeModal from '../components/UpgradeModal';

const PracticeExamList = () => {
  const { currentUser, userMembership } = useAuth();
  const [practiceExams, setPracticeExams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  const navigate = useNavigate();

  // Fetch all public practice exams on component mount
  useEffect(() => {
    fetchPracticeExams();
  }, []);

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
            <div className="exam-list-section">
              <h2>Choose a Full-Length Practice</h2>
              {isLoading && !practiceExams.length ? (
                <div className="loading-spinner">
                  <div className="spinner"></div>
                  <p>Loading practice exams...</p>
                </div>
              ) : practiceExams.length > 0 ? (
                <div className="exam-cards">
                  {practiceExams.map((exam, idx) => {
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
