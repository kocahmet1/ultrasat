import React, { useState } from 'react';
import '../styles/Header.css';
import useIsMobile from '../hooks/useIsMobile';

const Header = ({ sectionTitle, timeRemaining, clockVisible, toggleClock, isPaused, togglePause, isFullscreen, toggleFullscreen, onReportQuestion }) => {
  const isMobile = useIsMobile();
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
              <button className="pause-btn" onClick={togglePause}>
                {isPaused ? 'resume' : 'pause'}
              </button>
            </div>
          )}
          {!isMobile && (
            <button className="timer-toggle-btn" onClick={toggleClock}>
              {clockVisible ? 'Hide' : 'Show'}
            </button>
          )}
        </div>
        <div className="header-controls">
          {isMobile ? (
            // On mobile: Show Hide button instead of Report Question
            <button className="timer-toggle-btn-mobile" onClick={toggleClock}>
              {clockVisible ? 'Hide' : 'Show'}
            </button>
          ) : (
            // On desktop: Show Report Question button
            onReportQuestion && (
              <button className="report-btn" onClick={onReportQuestion}>
                Report Question
              </button>
            )
          )}
          <div className="fullscreen-toggle">
            <button className="fullscreen-btn" onClick={toggleFullscreen}>
              {isFullscreen ? 'Exit Fullscreen' : 'Switch to Fullscreen'}
            </button>
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
