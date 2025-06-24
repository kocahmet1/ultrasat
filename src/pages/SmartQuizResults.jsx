// pages/SmartQuizResults.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { DIFFICULTY_FOR_LEVEL } from '../utils/smartQuizUtils';
import { getSubcategoryName } from '../utils/subcategoryConstants';
import { FaArrowLeft, FaRedo, FaCheckCircle, FaTimesCircle, FaArrowUp, FaTrophy, FaMedal, FaGraduationCap, FaChartLine } from 'react-icons/fa';
import '../styles/SmartQuizResults.css';

export default function SmartQuizResults() {
  const { quizId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        
        // Fetch questions separately by IDs (same logic as SmartQuiz.jsx)
        let questionsData = [];
        if (data.questionIds && data.questionIds.length > 0) {
          // New format: fetch questions from the questions collection
          const questionPromises = data.questionIds.map(async (questionId) => {
            const questionRef = doc(db, 'questions', questionId);
            const questionSnap = await getDoc(questionRef);
            if (questionSnap.exists()) {
              return { id: questionSnap.id, ...questionSnap.data() };
            }
            return null;
          });
          
          const fetchedQuestions = await Promise.all(questionPromises);
          questionsData = fetchedQuestions.filter(q => q !== null);
        } else if (data.questions) {
          // Legacy format: questions are embedded in the quiz document
          questionsData = data.questions;
        }
        
        setQuiz({ 
          id: snap.id, 
          ...data, 
          questions: questionsData 
        });
        setLoading(false);
      } catch (err) {
        console.error('Error fetching quiz results:', err);
        setError('Failed to load quiz results');
        setLoading(false);
      }
    };
    
    fetchQuizResults();
  }, [currentUser, quizId]);

  const handleReturnToDashboard = () => {
    navigate('/progress');
  };
  
  const handleTakeAnotherQuizAtSameLevel = () => {
    if (quiz) {
      // Start a new quiz at the same difficulty level
      navigate('/smart-quiz-generator', {
        state: {
          subcategoryId: quiz.subcategoryId,
          // Force the current level (Level 3 for mastery)
          forceLevel: quiz.level
        }
      });
    }
  };

  const handlePracticeAgain = () => {
    if (quiz) {
      // If user was promoted, we want to practice at the new level
      // If not promoted, practice at the same level
      navigate('/smart-quiz-generator', {
        state: {
          subcategoryId: quiz.subcategoryId,
          // Force the next level if promoted
          forceLevel: wasPromoted ? quiz.level + 1 : undefined,
        }
      });
    }
  };

  if (loading) return <div className="smart-quiz-results__container"><p>Loading results...</p></div>;
  if (error) return <div className="smart-quiz-results__container"><p>Error: {error}</p></div>;
  if (!quiz) return <div className="smart-quiz-results__container"><p>No quiz data available</p></div>;
  
  // Calculate metrics
  const correctCount = Object.values(quiz.userAnswers || {}).filter(a => a.isCorrect).length;
  const totalQuestions = quiz.questionCount;
  const percentCorrect = quiz.score;
  const levelName = DIFFICULTY_FOR_LEVEL[quiz.level] || 'Unknown';
  const wasPromoted = quiz.passed && quiz.level < 3;
  const hasMastered = quiz.passed && quiz.level === 3;
  const subcategoryName = getSubcategoryName(quiz.subcategoryId) || 'this skill';
  
  return (
    <div className={`smart-quiz-results__container ${hasMastered ? 'mastery-achieved' : ''}`}>
      {hasMastered ? (
        <div className="mastery-banner">
          <FaTrophy className="mastery-icon" />
          <h1>Mastery Achieved!</h1>
        </div>
      ) : (
        <h1>Quiz Results</h1>
      )}
      
      <div className="results-summary">
        <h2>Summary</h2>
        {hasMastered ? (
          <div className="mastery-message">
            <FaMedal className="summary-icon" />
            <p>You have completed all levels of <strong>{subcategoryName}</strong>!</p>
          </div>
        ) : (
          <div className="level-indicator">
            <p>Current Level: <span className="level">{quiz.level} ({levelName})</span></p>
          </div>
        )}
        
        <div className="score-container">
          <div className="score">
            <h3>Score</h3>
            <p className="score-value">{percentCorrect}%</p>
            <p>{correctCount} of {totalQuestions} correct</p>
          </div>
          
          <div className="pass-indicator">
            {quiz.passed ? (
              <div className="passed">
                <FaCheckCircle />
                <p>Passed!</p>
              </div>
            ) : (
              <div className="failed">
                <FaTimesCircle />
                <p>Try again to advance</p>
              </div>
            )}
          </div>
        </div>
        
        {wasPromoted && (
          <div className="promotion">
            <FaArrowUp />
            <p>Congratulations! You've been promoted to Level {quiz.level + 1}!</p>
          </div>
        )}
        
        {quiz.level === 3 && quiz.passed && (
          <div className="mastery">
            <FaCheckCircle />
            <p>Congratulations! You've achieved mastery of this skill!</p>
          </div>
        )}
      </div>
      
      <div className="question-breakdown">
        <h2>Question Breakdown</h2>
        <div className="questions-list">
          {quiz.questions.map((question, index) => {
            const answer = quiz.userAnswers[question.id];
            const isCorrect = answer?.isCorrect;
            
            return (
              <div key={question.id} className={`question-card ${isCorrect ? 'correct' : 'incorrect'}`}>
                {/* Question Header */}
                <div className="question-header">
                  <div className="question-number-badge">
                    <span className="question-number">{index + 1}</span>
                  </div>
                  <div className="question-status">
                    {isCorrect ? (
                      <div className="status-correct">
                        <FaCheckCircle className="status-icon" />
                        <span>Correct</span>
                      </div>
                    ) : (
                      <div className="status-incorrect">
                        <FaTimesCircle className="status-icon" />
                        <span>Incorrect</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Question Content */}
                <div className="question-content">
                  <div className="question-text">
                    <h3>{question.text}</h3>
                  </div>
                  
                  <ul className="results-options-list">
                    {question.options.map((opt, optIdx) => {
                      const isSelected = answer.selectedOption === optIdx;
                      const isCorrectOption = question.correctAnswer === optIdx;
                      return (
                        <li
                          key={optIdx}
                          className={`${isSelected ? 'selected' : ''} ${isCorrectOption ? 'correct' : ''}`}
                        >
                          {opt}
                          {isSelected && (
                            <span className="badge your-answer">Your answer</span>
                          )}
                          {isCorrectOption && (
                            <span className="badge correct-answer">Correct</span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                  <div className="answer-meta">
                    <span className="time-spent">⏱️ {answer.timeSpent}s</span>
                  </div>
                </div>

                {/* Explanation Section */}
                {question.explanation && (
                  <div className="explanation-section">
                    <div className="explanation-header">
                      <h4>💡 Explanation</h4>
                    </div>
                    <div className="explanation-content">
                      <p>{question.explanation}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="actions">
        {hasMastered ? (
          <>
            <button className="btn-secondary" onClick={handleTakeAnotherQuizAtSameLevel}>
              <FaRedo /> Take Another Quiz at This Difficulty Level
            </button>
            <button className="btn-primary" onClick={handleReturnToDashboard}>
              <FaChartLine /> Review Your Overall Progress
            </button>
          </>
        ) : (
          <>
            <button className="btn-secondary" onClick={handleReturnToDashboard}>
              <FaArrowLeft /> Return to Dashboard
            </button>
            <button className="btn-primary" onClick={handlePracticeAgain}>
              {wasPromoted ? (
                <>
                  <FaArrowUp /> Proceed to Level {quiz.level + 1}
                </>
              ) : (
                <>
                  <FaRedo /> Practice Again
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
