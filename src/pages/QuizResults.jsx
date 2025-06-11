import React from 'react';
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

  if (!location.state) {
    // Redirect if no state is passed, maybe to dashboard or an error page
    return <Navigate to="/progress" replace />;
  }

  const handlePracticeAgain = () => {
    // Navigate back to AdaptiveQuizGenerator or directly to a new quiz
    // If progressSaveFailed, we should use 'level', otherwise 'nextLevel'
    const levelForNextQuiz = progressSaveFailed ? level : nextLevel;
    navigate('/adaptive-quiz-generator', {
      state: {
        subcategoryId: normalizeSubcategoryName(subcategory, true), // Ensure this returns ID if needed by generator
        difficulty: levelForNextQuiz, // Or map levelForNextQuiz to easy/medium/hard
        autoDifficulty: false // Or manage autoDifficulty as needed
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
