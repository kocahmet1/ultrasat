import React from 'react';
import '../styles/Footer.css';

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
      <div className="user-info">
        Ahmet Koc
      </div>
      
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
  );
};

export default Footer;
