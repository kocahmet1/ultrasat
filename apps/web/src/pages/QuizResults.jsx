import React, { useEffect } from 'react';
import { useLocation, useNavigate, Navigate, Link } from 'react-router-dom';
import { normalizeSubcategoryName } from '../utils/subcategoryUtils'; // Assuming this utility exists and is useful

function QuizResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    score,
    correctAnswers,
    totalQuestions,
    timeTaken,
    passed,
    subcategory,
    level, // Original level of the quiz
    nextLevel, // Potentially advanced level
    quizId,
    isAdaptive,
    progressSaveFailed 
  } = location.state || {};

  // Scroll to top when results load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!location.state) {
    // Redirect if no state is passed, maybe to dashboard or an error page
    return <Navigate to="/progress" replace />;
  }

  const handlePracticeAgain = () => {
    const subcategoryId = normalizeSubcategoryName(subcategory);
    const levelForNextQuiz = progressSaveFailed ? level : nextLevel;
    const targetLevel = levelForNextQuiz || level || 1;

    if (!subcategoryId) {
      navigate('/progress');
      return;
    }

    navigate('/smart-quiz-generator', {
      state: {
        subcategoryId,
        forceLevel: targetLevel,
        userCurrentLevel: targetLevel,
      }
    });
  };

  return (
    <div className="quiz-results-container">
      <h1>Quiz Results</h1>
      {isAdaptive && <h2>Adaptive Quiz: {normalizeSubcategoryName(subcategory)}</h2>}
      <p><strong>Quiz ID:</strong> {quizId}</p>
      
      {progressSaveFailed && (
        <p style={{ color: 'red', fontWeight: 'bold' }}>
          Warning: Your progress for this quiz could not be saved. Please try again later. Your level has not been updated.
        </p>
      )}

      <p><strong>Score:</strong> {score}% ({correctAnswers}/{totalQuestions})</p>
      <p><strong>Status:</strong> {passed ? 'Passed' : 'Failed'}</p>
      <p><strong>Level Attempted:</strong> {level}</p>
      {!progressSaveFailed && passed && <p><strong>New Level:</strong> {nextLevel}</p>}
      {progressSaveFailed && <p><strong>Current Level (Save Failed):</strong> {level}</p>}
      <p><strong>Time Taken:</strong> {timeTaken} seconds</p>

      <div className="navigation-buttons">
        <button onClick={handlePracticeAgain}>Practice Same Subcategory Again</button>
        <Link to="/progress">
          <button>Back to Progress Dashboard</button>
        </Link>
        {/* Add more navigation options as needed, e.g., back to skills practice */}
      </div>
    </div>
  );
}

export default QuizResults;
