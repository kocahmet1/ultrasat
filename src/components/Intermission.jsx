import React, { useEffect, useState } from 'react';
import '../styles/Intermission.css';
import '../styles/Transitions.css';

const Intermission = ({ onProceed, timeRemaining, setTimeRemaining }) => {
  const [isPaused, setIsPaused] = useState(false);
  const [animationClass, setAnimationClass] = useState('fade-in');

  // Animation entrance effect
  useEffect(() => {
    // Start entrance animation
    setAnimationClass('fade-in');
    setTimeout(() => {
      setAnimationClass('');
    }, 1000);
  }, []);

  // Timer effect
  useEffect(() => {
    let timer = null;
    if (!isPaused && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining(prevTime => {
          if (prevTime <= 1) {
            clearInterval(timer);
            handleProceed();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPaused, timeRemaining, setTimeRemaining]);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle proceed with animation
  const handleProceed = () => {
    setAnimationClass('fade-out');
    setTimeout(() => {
      onProceed();
    }, 1000);
  };

  return (
    <div className="intermission-container">
      <div className={`intermission-content ${animationClass}`}>
          <h1>Break Time</h1>
          <p>You have completed Modules 1 and 2 of the test.</p>
          <p>Take a 10-minute break before continuing to Modules 3 and 4.</p>
          
          <div className="intermission-timer">
            <div className="timer-display">{formatTime(timeRemaining)}</div>
            <button 
              className="timer-control"
              onClick={() => setIsPaused(!isPaused)}
            >
              {isPaused ? 'Resume Timer' : 'Pause Timer'}
            </button>
          </div>
          
          <button 
            className="proceed-button"
            onClick={handleProceed}
          >
            Proceed to Module 3
          </button>
          
          <div className="instructions">
            <h2>Instructions for Modules 3 & 4</h2>
            <ul>
              <li>Module 3: Math - No Calculator (32 minutes)</li>
              <li>Module 4: Math - Calculator Allowed (32 minutes)</li>
            </ul>
          </div>
        </div>
    </div>
  );
};

export default Intermission;
