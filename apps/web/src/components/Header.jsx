import React from 'react';
import { FaCalculator } from 'react-icons/fa';
import '../styles/Header.css';
import useIsMobile from '../hooks/useIsMobile';

const Header = ({
  sectionTitle,
  timeRemaining,
  clockVisible,
  toggleClock,
  isPaused,
  togglePause,
  isFullscreen,
  toggleFullscreen,
  onReportQuestion,
  // Math-module tools (Bluebook-style Calculator + Reference buttons)
  mathTools = false,
  calculatorOpen = false,
  referenceOpen = false,
  onToggleCalculator,
  onToggleReference
}) => {
  const isMobile = useIsMobile();
  // Format time as mm:ss
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
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
          {mathTools && (
            <div className="math-tool-buttons">
              <button
                className={`math-tool-btn ${calculatorOpen ? 'active' : ''}`}
                onClick={onToggleCalculator}
                aria-pressed={calculatorOpen}
                aria-label={calculatorOpen ? 'Close calculator' : 'Open calculator'}
              >
                <span className="math-tool-btn-icon"><FaCalculator aria-hidden="true" /></span>
                <span className="math-tool-btn-label">Calculator</span>
              </button>
              <button
                className={`math-tool-btn ${referenceOpen ? 'active' : ''}`}
                onClick={onToggleReference}
                aria-pressed={referenceOpen}
                aria-label={referenceOpen ? 'Close reference sheet' : 'Open reference sheet'}
              >
                <span className="math-tool-btn-icon icon-x2" aria-hidden="true">x<sup>2</sup></span>
                <span className="math-tool-btn-label">Reference</span>
              </button>
            </div>
          )}
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
