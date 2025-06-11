import React, { useState } from 'react';
import '../styles/Header.css';

const Header = ({ sectionTitle, timeRemaining, clockVisible, toggleClock }) => {
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
          <div className="directions-dropdown">
            <button onClick={toggleDirections} className="directions-btn">
              Directions {directionsOpen ? '▲' : '▼'}
            </button>
            {directionsOpen && (
              <div className="directions-content">
                <p>Each question in this section is based on a separate passage or pair of passages. Read the passage(s) and the question carefully and choose the best answer.</p>
              </div>
            )}
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
          <div className="highlights-notes">
            <button className="highlights-btn">Highlights & Notes</button>
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
