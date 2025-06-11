import React from 'react';
import '../styles/QuestionPreview.css';

const QuestionPreview = ({ question, graphUrl, onClose }) => {
  // Create a simplified version of the option display
  const renderOptions = () => {
    return question.options.map((option, index) => {
      const isCorrect = index === question.correctAnswer;
      const optionLetter = String.fromCharCode(65 + index); // A, B, C, D...
      
      return (
        <div key={index} className={`preview-option ${isCorrect ? 'correct-answer' : ''}`}>
          <span className="preview-option-letter">{optionLetter}</span>
          <span className="preview-option-text">{option}</span>
          {isCorrect && <span className="preview-correct-indicator">✓</span>}
        </div>
      );
    });
  };
  
  return (
    <div className="question-preview-overlay">
      <div className="question-preview-modal">
        <div className="question-preview-header">
          <h2>Question Preview</h2>
          <button 
            type="button" 
            className="close-preview-btn" 
            onClick={onClose}
          >
            ×
          </button>
        </div>
        
        <div className="question-preview-content">
          <div className="preview-question-text">
            {question.text}
          </div>
          
          {question.graphDescription && (
            <div className="preview-graph-description">
              <h4>Graph Description:</h4>
              <div className="graph-description-text">
                {question.graphDescription}
              </div>
            </div>
          )}
          
          {graphUrl && (
            <div className="preview-graph-container">
              <img 
                src={graphUrl} 
                alt="Graph for question" 
                className="preview-graph-image" 
              />
            </div>
          )}
          
          <div className="preview-options-container">
            <h3>Options:</h3>
            {renderOptions()}
          </div>
          
          {question.explanation && (
            <div className="preview-explanation">
              <h3>Explanation:</h3>
              <p>{question.explanation}</p>
            </div>
          )}
          
          <div className="preview-metadata">
            <div className="preview-metadata-item">
              <strong>Subcategory:</strong> {question.subcategory || '(Not set)'}
            </div>
            <div className="preview-metadata-item">
              <strong>Difficulty:</strong> {question.difficulty || 'medium'}
            </div>
          </div>
        </div>
        
        <div className="question-preview-footer">
          <button 
            type="button" 
            className="close-preview-btn-text" 
            onClick={onClose}
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionPreview;
