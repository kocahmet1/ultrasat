// pages/SmartQuizGenerator.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserLevel, createSmartQuiz } from '../utils/smartQuizUtils';
import { getSubcategoryName } from '../utils/subcategoryConstants';
import { FaBookReader, FaInfoCircle, FaArrowLeft } from 'react-icons/fa';
import '../styles/DynamicQuizGenerator.css';

// Thin wrapper that determines the correct difficulty level for the user and
// spins up a brand-new SmartQuiz (5 questions). Once the quiz document is
// created it immediately redirects the user to the quiz-taking page.
function SmartQuizGenerator() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // `subcategoryId` is mandatory. Optionally we may receive `accuracyRate`
  // from ProgressDashboard to seed the initial level for brand-new users,
  // or forceLevel from SmartQuizResults for promoted users.
  const { subcategoryId, accuracyRate = 0, forceLevel } = location.state || {};

  const [status, setStatus] = useState({
    message: 'Preparing your quiz…',
    error: false
  });

  useEffect(() => {
    const bootstrap = async () => {
      try {
        if (!currentUser) throw new Error('User not authenticated');
        if (!subcategoryId) throw new Error('No subcategory specified');

        setStatus({
          message: 'Determining your level…',
          error: false
        });
        // If forceLevel is provided (from promotion scenario), use it
        // Otherwise get the user's current level
        const level = forceLevel || await getUserLevel(
          currentUser.uid,
          subcategoryId,
          accuracyRate,
        );

        setStatus({
          message: 'Generating quiz questions…',
          error: false
        });
        const quizId = await createSmartQuiz(
          currentUser.uid,
          subcategoryId,
          level,
        );

        // Instead of navigating directly to the quiz, navigate to the intro screen
        // with all the necessary information
        navigate('/smart-quiz-intro', {
          state: {
            quizId,
            subcategoryId,
            level,
            forceLevel,
          },
          replace: true,
        });
      } catch (err) {
        console.error('SmartQuizGenerator error:', err);
        setStatus({
          message: err.message || 'Something went wrong while generating your quiz.',
          error: true
        });
      }
    };
    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGoBack = () => {
    navigate('/progress');
  };

  return (
    <div className="dynamic-quiz-generator__container">
      <h2>SmartQuiz Generator</h2>
      
      {status.error ? (
        <div className="quiz-message-container error">
          <div className="quiz-message-icon">
            <FaInfoCircle />
          </div>
          <div className="quiz-message-content">
            <p>{status.message}</p>
            <button className="back-button" onClick={handleGoBack}>
              <FaArrowLeft /> Back to Dashboard
            </button>
          </div>
        </div>
      ) : (
        <div className="quiz-message-container loading">
          <div className="quiz-message-icon">
            <FaBookReader />
          </div>
          <div className="quiz-message-content">
            <p>{status.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default SmartQuizGenerator;
