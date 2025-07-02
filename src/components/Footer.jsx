import React from 'react';
import '../styles/footer.css';

const Footer = ({ 
  questionNumber, 
  totalQuestions, 
  handlePrevious, 
  handleNext, 
  openTrackerPopup,
  isFirstQuestion,
  isLastQuestion
}) => {
  return (
    <div className="footer">
      {/* Left section - empty spacer for balanced layout */}
      <div className="footer-left"></div>
      
      {/* Center section - tracker button (black) */}
      <div className="footer-center">
        <button 
          className="tracker-button" 
          onClick={() => {
            console.log('Footer tracker button clicked');
            if (typeof openTrackerPopup === 'function') {
              openTrackerPopup();
            } else {
              console.error('openTrackerPopup is not a function:', openTrackerPopup);
            }
          }}
        >
          Question {questionNumber + 1} of {totalQuestions} <span className="dropdown-arrow">▼</span>
        </button>
      </div>

      {/* Right section - navigation buttons (white) */}
      <div className="footer-right">
        <div className="navigation-buttons">
          <button 
            className="nav-button prev-button" 
            onClick={handlePrevious}
            disabled={isFirstQuestion}
          >
            Previous
          </button>

          <button 
            className="nav-button next-button" 
            onClick={handleNext}
          >
            {isLastQuestion ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Footer;
