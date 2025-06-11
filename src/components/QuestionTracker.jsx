import React, { useRef, useEffect } from 'react';
import '../styles/QuestionTracker.css';

const QuestionTracker = ({ 
  isOpen, 
  closeTracker, 
  questions, 
  currentQuestion, 
  userAnswers, 
  markedForReview = [],
  goToQuestion 
}) => {
  const trackerRef = useRef(null);
  
  console.log('QuestionTracker rendered with isOpen:', isOpen);
  console.log('Questions:', questions);
  console.log('Current Question:', currentQuestion);

  useEffect(() => {
    // Handle clicking outside the tracker popup to close it
    const handleClickOutside = (event) => {
      if (trackerRef.current && !trackerRef.current.contains(event.target)) {
        closeTracker();
      }
    };

    if (isOpen) {
      console.log('Adding click outside listener');
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, closeTracker]);

  if (!isOpen) {
    console.log('QuestionTracker not showing because isOpen is false');
    return null;
  }

  const getQuestionStatus = (index) => {
    if (index === currentQuestion) return 'current';
    if (markedForReview.includes(index)) return 'marked';
    if (userAnswers[index]) return 'answered';
    return 'unanswered';
  };

  return (
    <div className="tracker-overlay">
      <div className="tracker-popup" ref={trackerRef}>
        <div className="tracker-header">
          <h2>Question Navigator</h2>
          <button className="close-button" onClick={closeTracker}>×</button>
        </div>
        <div className="tracker-content">
          <div className="question-grid">
            {questions.map((_, index) => (
              <button
                key={index}
                className={`question-button ${getQuestionStatus(index)}`}
                onClick={() => {
                  goToQuestion(index);
                  closeTracker();
                }}
              >
                {index + 1}
                {markedForReview.includes(index) && (
                  <span className="marked-indicator">★</span>
                )}
              </button>
            ))}
          </div>
        </div>
        <div className="tracker-footer">
          <div className="tracker-legend">
            <div className="legend-item">
              <div className="legend-color current"></div>
              <span>Current Question</span>
            </div>
            <div className="legend-item">
              <div className="legend-color answered"></div>
              <span>Answered</span>
            </div>
            <div className="legend-item">
              <div className="legend-color unanswered"></div>
              <span>Unanswered</span>
            </div>
            <div className="legend-item">
              <div className="legend-color marked"></div>
              <span>Marked for Review</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionTracker;
