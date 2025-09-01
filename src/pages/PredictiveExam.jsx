import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllPracticeExams } from '../firebase/services';
import { useAuth } from '../contexts/AuthContext';
import '../styles/PracticeExamList.css';

const PredictiveExam = () => {
  const { currentUser, userMembership, getInProgressExams } = useAuth();
  const [exams, setExams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inProgressExams, setInProgressExams] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExams = async () => {
      try {
        setIsLoading(true);
        const all = await getAllPracticeExams(true);
        const diagnostics = (all || []).filter((e) => e.isDiagnostic);
        setExams(diagnostics);
      } catch (e) {
        setError(e?.message || 'Failed to load predictive exams');
      } finally {
        setIsLoading(false);
      }
    };
    fetchExams();
  }, []);

  // Load in-progress and filter to diagnostic exam IDs
  const diagnosticExamIds = useMemo(() => new Set(exams.map((e) => e.id)), [exams]);
  useEffect(() => {
    const fetchInProgress = async () => {
      try {
        if (!currentUser || !getInProgressExams) {
          setInProgressExams([]);
          return;
        }
        const items = await getInProgressExams();
        const filtered = (items || []).filter((p) => diagnosticExamIds.has(p.practiceExamId));
        setInProgressExams(filtered);
      } catch (e) {
        setInProgressExams([]);
      }
    };
    fetchInProgress();
  }, [currentUser, getInProgressExams, diagnosticExamIds]);

  const handleStartExam = (exam) => {
    if (!exam) return;
    // Diagnostics are free for everyone
    sessionStorage.setItem('currentPracticeExam', JSON.stringify({
      examId: exam.id,
      title: exam.title,
      moduleIds: exam.moduleIds,
    }));
    navigate('/practice-exam/' + exam.id, { state: { startExam: true } });
  };

  const handleContinueExam = (progress) => {
    if (!progress || !progress.practiceExamId) return;
    navigate('/practice-exam/' + progress.practiceExamId, { state: { resume: true } });
  };

  return (
    <div className="practice-exam-list-page">
      <div className="page-container">
        {error && <div className="error-message">{error}</div>}

        <div className="exam-selection-container">
          <div className="exam-list-section">
            <h1>Predictive Exam</h1>
            <p className="section-description">
              Take a short 27-question diagnostic (15 R&W + 12 Math) to quickly estimate your SAT score and get targeted study recommendations.
            </p>
          </div>

          {currentUser && inProgressExams.length > 0 && (
            <div className="exam-list-section">
              <h2>Continue Your Predictive Test</h2>
              <div className="exam-cards">
                {inProgressExams.map((p) => {
                  const updatedAt = p.updatedAt?.toDate
                    ? p.updatedAt.toDate()
                    : p.updatedAt?.seconds
                    ? new Date(p.updatedAt.seconds * 1000)
                    : null;
                  const subtitle = `Module ${typeof p.currentModuleIndex === 'number' ? p.currentModuleIndex + 1 : 1}, Question ${typeof p.currentQuestionIndex === 'number' ? p.currentQuestionIndex + 1 : 1}`;
                  return (
                    <div
                      key={p.practiceExamId}
                      className="exam-card"
                      onClick={() => handleContinueExam(p)}
                    >
                      <div className="exam-title-row">
                        <span className="exam-title-text">{p.examTitle || 'Predictive Exam'}</span>
                        <span className="exam-duration">Continue</span>
                      </div>
                      <div className="exam-description">
                        <small>
                          {subtitle}
                          {updatedAt ? ` • Saved ${updatedAt.toLocaleString()}` : ''}
                        </small>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="exam-list-section">
            <h2>Available Diagnostic Tests</h2>
            {isLoading ? (
              <div className="loading-spinner">
                <div className="spinner"></div>
                <p>Loading predictive exams...</p>
              </div>
            ) : exams.length > 0 ? (
              <div className="exam-cards">
                {exams.map((exam) => (
                  <div
                    key={exam.id}
                    className="exam-card diagnostic-exam-card"
                    onClick={() => handleStartExam(exam)}
                  >
                    <div className="exam-title-row">
                      <span className="exam-title-text">{exam.title}</span>
                      <span className="exam-duration">~30 min</span>
                    </div>
                    <div className="exam-description">
                      <small>{exam.description || 'Short test to assess your current level.'}</small>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-exams-message">
                <p>No predictive exams are currently available.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictiveExam;
