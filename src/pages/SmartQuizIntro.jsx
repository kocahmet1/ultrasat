// pages/SmartQuizIntro.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { DIFFICULTY_FOR_LEVEL } from '../utils/smartQuizUtils';
import { getSubcategoryName } from '../utils/subcategoryConstants';
import { getSubcategoryProgress } from '../utils/progressUtils';
import { FaPlay, FaGraduationCap, FaArrowLeft, FaHistory } from 'react-icons/fa';
import '../styles/SmartQuizIntro.css';

export default function SmartQuizIntro() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [previousLevel, setPreviousLevel] = useState(null);
  
  // Get data from navigation state
  const { quizId, subcategoryId, level, forceLevel } = location.state || {};
  
  // Fetch user's previous performance data
  useEffect(() => {
    const fetchUserProgress = async () => {
      if (!currentUser || !subcategoryId) {
        setLoading(false);
        return;
      }
      
      try {
        const progressData = await getSubcategoryProgress(currentUser.uid, subcategoryId);
        if (progressData && progressData.exists) {
          setPreviousLevel(progressData.level);
        } else {
          setPreviousLevel(1); // Default to level 1 if no previous data
        }
      } catch (err) {
        console.error('Error fetching user progress:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProgress();
  }, [currentUser, subcategoryId]);
  
  const subcategoryName = getSubcategoryName(subcategoryId) || "Unknown Subcategory";
  const difficultyLevel = forceLevel || level || 1;
  const difficultyName = DIFFICULTY_FOR_LEVEL[difficultyLevel] || 'easy';
  
  const handleStartQuiz = () => {
    if (!quizId) {
      setError("Quiz information is missing. Please try again.");
      return;
    }
    
    navigate(`/smart-quiz/${quizId}`);
  };
  
  const handleGoBack = () => {
    navigate('/progress');
  };
  
  if (loading) return <div className="smart-quiz-intro__container"><p>Loading...</p></div>;
  if (error) return <div className="smart-quiz-intro__container"><p>Error: {error}</p></div>;
  
  return (
    <div className="smart-quiz-intro__container">
      <div className="intro-card">
        <h1>Ready for Your SmartQuiz?</h1>
        
        <div className="quiz-info-compact">
          <div className="subcategory-info">
            <h2>Subcategory</h2>
            <div className="subcategory-badge">{subcategoryName}</div>
          </div>
          
          <div className="level-info-combined">
            <h2>Level Progress</h2>
            <div className="level-badges">
              <div className="current-level-mini">
                <span className="label">Current:</span>
                <span className="badge-mini current">Level {previousLevel || 1}</span>
              </div>
              <div className="quiz-level-mini">
                <span className="label">This Quiz:</span>
                <span className="badge-mini quiz">Level {difficultyLevel} - {difficultyName}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="quiz-description">
          <h2><FaGraduationCap /> About This Quiz</h2>
          <ul>
            <li>5 questions • Score 80%+ to advance</li>
            <li>3 difficulty levels: easy → medium → hard</li>
            <li>Master level 3 to complete this skill</li>
          </ul>
        </div>
        
        <div className="actions">
          <button className="btn-secondary" onClick={handleGoBack}>
            <FaArrowLeft /> Back to Dashboard
          </button>
          <button className="btn-primary" onClick={handleStartQuiz}>
            <FaPlay /> Start Quiz
          </button>
        </div>
      </div>
    </div>
  );
}
