import React, { useState, useEffect } from 'react';
import { processTextMarkup } from '../utils/textProcessing';
import useIsMobile from '../hooks/useIsMobile';
import '../styles/Question.css';

const Question = ({ 
  moduleNumber,
  questionNumber, 
  questionText, 
  questionType = 'multiple-choice',
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
  graphDescription = null,
  inputType = 'number',
  answerFormat = null
}) => {
  const isMobile = useIsMobile();
  const [userInput, setUserInput] = useState('');

  useEffect(() => {
    if (questionType === 'user-input') {
      setUserInput(selectedAnswer || '');
    } else {
      setUserInput('');
    }
  }, [questionNumber, selectedAnswer, questionType]);

  const handleOptionChange = (e) => {
    setSelectedAnswer(e.target.value);
  };

  const handleUserInputChange = (e) => {
    const value = e.target.value;
    setUserInput(value);
    setSelectedAnswer(value);
  };

  const isOptionCrossedOut = (optionLetter) => {
    return crossedOut && crossedOut[optionLetter];
  };

  const getOptionLetter = (index) => {
    return String.fromCharCode(65 + index);
  };

  const isMathModule = moduleNumber >= 3;

  const renderMultipleChoiceOptions = () => (
    <div className="options-container">
      {options && options.map((option, index) => {
        const optionLetter = getOptionLetter(index);
        return (
          <div key={index} className="option-row">
            <div 
              className={`option ${isOptionCrossedOut(optionLetter) ? 'crossed-out' : ''}`}
            >
              <div className="option-header">
                <div className="option-letter">{optionLetter}</div>
                <label className={`option-label ${selectedAnswer === option ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name={`question-${questionNumber}`}
                    value={option}
                    checked={selectedAnswer === option}
                    onChange={handleOptionChange}
                    className="option-radio"
                  />
                  <span className="option-text">{option}</span>
                </label>
              </div>
            </div>
            {showCrossOut && (
              <button 
                className={`cross-out-btn ${isOptionCrossedOut(optionLetter) ? 'active' : ''}`}
                onClick={() => toggleCrossOutOption(questionNumber, optionLetter)}
              >
                {isOptionCrossedOut(optionLetter) ? 'Undo' : 'Cross Out'}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );

  const renderUserInput = () => (
    <div className="user-input-container">
      <div className="question-instructions">
        {answerFormat ? answerFormat : 'Enter your answer in the box below.'}
      </div>
      <div className="input-container">
        <input
          type={inputType === 'number' ? 'text' : 'text'}
          value={userInput}
          onChange={handleUserInputChange}
          className="user-answer-input"
          placeholder={inputType === 'number' ? 'Enter a number' : 'Enter your answer'}
          pattern={inputType === 'number' ? '[0-9]*[.]?[0-9]*' : undefined}
        />
      </div>
      {inputType === 'number' && (
        <div className="input-hint">
          You may enter integers, decimals, or fractions. Do not enter spaces or commas.
        </div>
      )}
    </div>
  );

  const renderQuestionText = () => (
    <div className="question-text" style={{ fontSize: '1.8rem', lineHeight: '1.6' }}>
      {/* Display graph ABOVE the question text if available */}
      {graphUrl && (
        <div className="question-graph-container">
          <img 
            src={graphUrl} 
            alt="Graph for question" 
            className="question-graph mb-4 max-h-72 mx-auto" 
          />
        </div>
      )}
      
      <div dangerouslySetInnerHTML={{ __html: processTextMarkup(questionText) }} />
      
      {/* Graph description removed - no longer displayed */}
    </div>
  );

  const renderControls = () => (
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
        {questionType === 'multiple-choice' && !isMobile && (
          <div className="abc-toggle-container">
            <button 
              className={`cross-out-toggle ${showCrossOut ? 'active' : ''}`}
              onClick={toggleCrossOut}
              style={{
                backgroundColor: showCrossOut ? '#133B8F' : '#1A4AAB',
                color: 'white',
                border: 'none'
              }}
            >
              ABC
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className={`question-container ${isMathModule ? 'math-layout' : ''}`}>
      {isMathModule ? (
        <div className="question-content-math">
          {renderControls()}
          <div className="question-body">
            {renderQuestionText()}
            {questionType === 'multiple-choice' ? renderMultipleChoiceOptions() : renderUserInput()}
          </div>
        </div>
      ) : (
        <div className="question-content">
          <div className="left-column">
            {renderQuestionText()}
          </div>
          <div className="separator-line-container">
            <div className="separator-line"></div>
          </div>
          <div className="right-column">
            {renderControls()}
            {questionType === 'multiple-choice' ? renderMultipleChoiceOptions() : renderUserInput()}
          </div>
        </div>
      )}
    </div>
  );
};

export default Question;
