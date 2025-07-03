import React, { useState } from 'react';
import '../styles/Header.css';

const Header = ({ sectionTitle, timeRemaining, clockVisible, toggleClock, isFullscreen, toggleFullscreen }) => {
  // Format time as mm:ss
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const [directionsOpen, setDirectionsOpen] = useState(false);

  const toggleDirections = () => {
    setDirectionsOpen(!directionsOpen);
  };

  return (
    <>
      <div className="header">
        <div className="left-section">
        <div className="section-title">
          {sectionTitle}
        </div>
      </div>
        <div className="timer-container">
          {clockVisible && (
            <div className="timer">
              {formatTime(timeRemaining)}
            </div>
          )}
          <button className="timer-toggle-btn" onClick={toggleClock}>
            {clockVisible ? 'Hide' : 'Show'}
          </button>
        </div>
        <div className="header-controls">
          <div className="fullscreen-toggle">
            <button className="fullscreen-btn" onClick={toggleFullscreen}>
              {isFullscreen ? 'Exit Fullscreen' : 'Switch to Fullscreen'}
            </button>
          </div>
          <div className="more-options">
            <button className="more-btn">More</button>
          </div>
        </div>
      </div>

      <div className="practice-test-banner">
        THIS IS A PRACTICE TEST
      </div>
    </>
  );
};

export default Header;
