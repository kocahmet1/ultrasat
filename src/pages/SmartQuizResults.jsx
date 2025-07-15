// pages/SmartQuizResults.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { DIFFICULTY_FOR_LEVEL } from '../utils/smartQuizUtils';
import { getSubcategoryName } from '../utils/subcategoryConstants';
import { processTextMarkup } from '../utils/textProcessing';
import { FaArrowLeft, FaRedo, FaCheckCircle, FaTimesCircle, FaArrowUp, FaTrophy, FaMedal, FaGraduationCap, FaFlag } from 'react-icons/fa';
import ReportQuestionModal from '../components/ReportQuestionModal';
import { reportQuestion } from '../api/reportClient';
import { toast } from 'react-toastify';
import '../styles/SmartQuizResults.css';

export default function SmartQuizResults() {
  const { quizId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Report modal state
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [selectedQuestionForReport, setSelectedQuestionForReport] = useState(null);

  useEffect(() => {
    const fetchQuizResults = async () => {
      if (!currentUser || !quizId) {
        setError('Missing user or quiz information');
        setLoading(false);
        return;
      }
      
      try {
        const quizRef = doc(db, 'smartQuizzes', quizId);
        const snap = await getDoc(quizRef);
        
        if (!snap.exists()) {
          setError('Quiz not found');
          setLoading(false);
          return;
        }
        
        const data = snap.data();
        if (data.userId !== currentUser.uid) {
          setError('You do not have access to this quiz');
          setLoading(false);
          return;
        }
        
        let questionsData = [];
        if (data.questionIds && data.questionIds.length > 0) {
          const questionPromises = data.questionIds.map(async (questionId) => {
            const questionRef = doc(db, 'questions', questionId);
            const questionSnap = await getDoc(questionRef);
            return questionSnap.exists() ? { id: questionSnap.id, ...questionSnap.data() } : null;
          });
          questionsData = (await Promise.all(questionPromises)).filter(q => q !== null);
        } else if (data.questions) {
          questionsData = data.questions; // Legacy support
        }
        
        setQuiz({ id: snap.id, ...data, questions: questionsData });
        setLoading(false);
      } catch (err) {
        console.error('Error fetching quiz results:', err);
        setError('Failed to load quiz results');
        setLoading(false);
      }
    };
    
    fetchQuizResults();
  }, [currentUser, quizId]);

  const handleNavigation = (path, state = {}) => navigate(path, { state });

  const handlePracticeAgain = (level) => {
    handleNavigation('/smart-quiz-generator', { subcategoryId: quiz.subcategoryId, forceLevel: level });
  };

  // Report question handler
  const handleReportQuestion = async (reason) => {
    if (!selectedQuestionForReport) return;
    
    setReportLoading(true);
    try {
      await reportQuestion(selectedQuestionForReport.id, quizId, reason);
      toast.success('Question reported successfully. Thank you for your feedback!');
      setIsReportModalOpen(false);
      setSelectedQuestionForReport(null);
    } catch (error) {
      console.error('Error reporting question:', error);
      toast.error(error.message || 'Failed to report question. Please try again.');
    } finally {
      setReportLoading(false);
    }
  };

  const openReportModal = (question) => {
    setSelectedQuestionForReport(question);
    setIsReportModalOpen(true);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your results...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>Error: {error}</p>
        <button onClick={() => handleNavigation('/progress')}>Return to Dashboard</button>
      </div>
    );
  }

  if (!quiz) return null;

  const { score, level, passed, subcategoryId, questionCount, userAnswers = {}, questions = [] } = quiz;
  const correctCount = Object.values(userAnswers).filter(a => a.isCorrect).length;
  const levelName = DIFFICULTY_FOR_LEVEL[level] || 'Unknown';
  const wasPromoted = passed && level < 3;
  const hasMastered = passed && level === 3;
  const subcategoryName = getSubcategoryName(subcategoryId) || 'this skill';

  return (
    <div className="results-container">
      <div className="results-content split-view">
        {/* Left Column: Summary Card */}
        <div className="results-card results-summary">
          <h1>{hasMastered ? 'Skill Mastered!' : 'Quiz Results'}</h1>
          
          <div className="score-circle">
            <div className="score-percentage">{score}%</div>
          </div>
          
          <div className="summary-details">
            <div className="score-subtitle">{correctCount} of {questionCount} correct</div>
            <div className="summary-section level-indicator">
              <h3>{subcategoryName}</h3>
              <p>Difficulty Level: <strong>{level} ({levelName})</strong></p>
            </div>
            <div className="summary-section status-indicator">
              {passed ? (
                <div className="status-passed">
                  <FaCheckCircle />
                  <span>Passed!</span>
                </div>
              ) : (
                <div className="status-failed">
                  <FaTimesCircle />
                  <span>Needs Improvement</span>
                </div>
              )}
            </div>
          </div>

          {wasPromoted && (
            <div className="summary-section promotion-banner">
              <FaArrowUp />
              <p>Promoted to Level {level + 1}!</p>
            </div>
          )}
          {hasMastered && (
            <div className="summary-section mastery-banner">
              <FaTrophy />
              <p>You've mastered this skill!</p>
            </div>
          )}

          <hr className="card-divider" />

          <div className="action-buttons-container">
            <button className="primary-button" onClick={() => handlePracticeAgain(wasPromoted ? level + 1 : level)}>
              {wasPromoted ? <><FaArrowUp /> Go to Level {level + 1}</> : <><FaRedo /> Practice Again</>}
            </button>
            <button className="secondary-button" onClick={() => handleNavigation('/progress')}><FaArrowLeft /> Back to Dashboard</button>
          </div>
        </div>

        {/* Right Column: Question Review */}
        <div className="results-card question-review-panel">
          <h2>Question Review</h2>
          <div className="questions-list">
            {questions.map((q, index) => {
              const answer = userAnswers[q.id];
              const isCorrect = answer?.isCorrect;
              return (
                <div key={q.id} className={`question-container-review ${isCorrect ? 'correct' : 'incorrect'}`}>
                  <div className="question-review-header">
                    <div className="question-review-left">
                      <h3>Question {index + 1}</h3>
                    </div>
                    <div className="question-review-center">
                      <button
                        className="report-button-results"
                        onClick={() => openReportModal(q)}
                        title="Report this question"
                      >
                        <FaFlag />
                      </button>
                    </div>
                    <div className="question-review-right">
                      <span className={`status-tag ${isCorrect ? 'status-correct' : 'status-incorrect'}`}>
                        {isCorrect ? <FaCheckCircle /> : <FaTimesCircle />}
                        {isCorrect ? 'Correct' : 'Incorrect'}
                      </span>
                    </div>
                  </div>
                  <p 
                    className="question-text"
                    dangerouslySetInnerHTML={{ __html: processTextMarkup(q.text) }}
                  />
                  
                  <div className="answers-review">
                    <div className="answer-item your-answer">
                      <strong>Your Answer:</strong>
                      <span>{q.options[answer.selectedOption] || 'Not Answered'}</span>
                    </div>
                    {!isCorrect && (
                      <div className="answer-item correct-answer">
                        <strong>Correct Answer:</strong>
                        <span>{q.options[q.correctAnswer]}</span>
                      </div>
                    )}
                  </div>

                  {!isCorrect && q.explanation && (
                    <div className="question-explanation">
                      <h4>Explanation</h4>
                      <p dangerouslySetInnerHTML={{ __html: processTextMarkup(q.explanation) }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Report Question Modal */}
      <ReportQuestionModal
        isOpen={isReportModalOpen}
        onClose={() => {
          setIsReportModalOpen(false);
          setSelectedQuestionForReport(null);
        }}
        onReport={handleReportQuestion}
        loading={reportLoading}
      />
    </div>
  );
}
