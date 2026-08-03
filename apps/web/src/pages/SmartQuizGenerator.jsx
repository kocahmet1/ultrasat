import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiBookOpen, FiInfo } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { createSmartQuiz, getUserLevel } from '../utils/smartQuizUtils';
import '../styles/DynamicQuizGenerator.css';

const EXPECTED_BOOTSTRAP_ERRORS = new Set([
  'User not authenticated',
  'No subcategory specified',
]);

function SmartQuizGenerator() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { subcategoryId, accuracyRate = 0, forceLevel, userCurrentLevel } = location.state || {};

  const [status, setStatus] = useState({
    message: 'Preparing your quiz...',
    error: false,
  });

  useEffect(() => {
    const bootstrap = async () => {
      try {
        if (!currentUser) {
          throw new Error('User not authenticated');
        }

        if (!subcategoryId) {
          throw new Error('No subcategory specified');
        }

        setStatus({
          message: 'Determining your level...',
          error: false,
        });

        const level = forceLevel || await getUserLevel(
          currentUser.uid,
          subcategoryId,
          accuracyRate,
        );

        setStatus({
          message: 'Generating quiz questions...',
          error: false,
        });

        const quizId = await createSmartQuiz(
          currentUser.uid,
          subcategoryId,
          level,
          userCurrentLevel,
        );

        navigate('/smart-quiz-intro', {
          state: {
            quizId,
            subcategoryId,
            level,
            forceLevel,
            userCurrentLevel,
          },
          replace: true,
        });
      } catch (error) {
        if (!EXPECTED_BOOTSTRAP_ERRORS.has(error?.message)) {
          console.error('SmartQuizGenerator error:', error);
        }

        setStatus({
          message: error.message || 'Something went wrong while generating your quiz.',
          error: true,
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
      <div className="ut-page-head">
        <div className="ut-page-head-main">
          <p className="ut-eyebrow">Practice</p>
          <h1 className="ut-page-title">SmartQuiz Generator</h1>
        </div>
      </div>

      {status.error ? (
        <div className="quiz-message-container error">
          <div className="quiz-message-icon">
            <FiInfo />
          </div>
          <div className="quiz-message-content">
            <p>{status.message}</p>
            <button className="back-button" onClick={handleGoBack} type="button">
              <FiArrowLeft /> Back to Dashboard
            </button>
          </div>
        </div>
      ) : (
        <div className="quiz-message-container loading">
          <div className="quiz-message-icon">
            <FiBookOpen />
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
