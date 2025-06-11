import React from 'react';
import '../styles/Question.css';

const Question = ({ 
  questionNumber, 
  questionText, 
  options, 
  selectedAnswer, 
  setSelectedAnswer,
  crossedOut,
  toggleCrossOutOption,
  showCrossOut,
  toggleCrossOut,
  markedForReview = false,
  toggleMarkedForReview = () => {},
  graphUrl = null,
  graphDescription = null
}) => {
  // Handle radio button change
  const handleOptionChange = (e) => {
    setSelectedAnswer(e.target.value);
  };

  // Check if an option is crossed out
  const isOptionCrossedOut = (optionLetter) => {
    return crossedOut[optionLetter];
  };

  // Get the option letter (A, B, C, D) based on index
  const getOptionLetter = (index) => {
    return String.fromCharCode(65 + index); // 65 is ASCII for 'A'
  };

  return (
    <div className="question-container">
      <div className="question-content">
        <div className="left-column">
          <div className="question-text">
            {questionText}
            
            {/* Display graph description if available */}
            {graphDescription && (
              <div className="question-graph-description">
                <div className="graph-description-label">Graph Description:</div>
                <div className="graph-description-content">
                  {graphDescription}
                </div>
              </div>
            )}
            
            {/* Display graph if available */}
            {graphUrl && (
              <div className="question-graph-container">
                <img 
                  src={graphUrl} 
                  alt="Graph for question" 
                  className="question-graph mb-4 max-h-72 mx-auto" 
                />
              </div>
            )}
          </div>
        </div>
        <div className="separator-line-container">
          <div className="separator-line"></div>
        </div>
        <div className="right-column">
          <div className="question-number-container">
            <div className="left-controls">
              <div className="question-number">{questionNumber + 1}</div>
              <div className="mark-review-container">
                <button 
                  className={`mark-review-btn ${markedForReview ? 'marked' : ''}`}
                  onClick={toggleMarkedForReview}
                >
                  <span className="bookmark-icon">{markedForReview ? '★' : '☆'}</span>
                  Mark for Review
                </button>
              </div>
            </div>
            <div className="right-controls">
              <div className="abc-toggle-container">
                <button 
                  className={`cross-out-toggle ${showCrossOut ? 'active' : ''}`}
                  onClick={toggleCrossOut}
                >
                  ABC
                </button>
              </div>
            </div>
          </div>
          <div className="question-instructions">
            Which choice completes the text with the most logical and precise word or phrase?
          </div>
          <div className="options-container">
            {options.map((option, index) => {
              const optionLetter = getOptionLetter(index);
              return (
                <div 
                  key={index} 
                  className={`option ${isOptionCrossedOut(optionLetter) ? 'crossed-out' : ''}`}
                >
                  <div className="option-header">
                    <div className="option-letter">{optionLetter}</div>
                    <label className={`option-label ${selectedAnswer === option ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="option"
                        value={option}
                        checked={selectedAnswer === option}
                        onChange={handleOptionChange}
                        className="option-radio"
                      />
                      <span className="option-text">{option}</span>
                    </label>
                    {showCrossOut && (
                      <button 
                        className={`cross-out-btn ${isOptionCrossedOut(optionLetter) ? 'active' : ''}`}
                        onClick={() => toggleCrossOutOption(questionNumber, optionLetter)}
                      >
                        {isOptionCrossedOut(optionLetter) ? 'undo' : optionLetter}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Question;
