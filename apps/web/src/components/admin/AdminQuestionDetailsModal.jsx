import React from 'react';

function AdminQuestionDetailsModal({
  onClose,
  onEditQuestion,
  question,
  skillTags
}) {
  return (
    <div className="modal-backdrop">
      <div className="question-details-modal">
        <div className="modal-header">
          <h3>Question Details</h3>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-content">
          <div className="question-field">
            <label>Question Text:</label>
            <div>{question.text}</div>
          </div>

          {question.options && question.options.length > 0 ? (
            <div className="question-field">
              <label>Options:</label>
              <div>
                {question.options.map((option, index) => (
                  <div key={index} className={question.correctAnswer === option ? 'correct-option' : ''}>
                    {String.fromCharCode(65 + index)}. {option}
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="question-field">
            <label>Correct Answer:</label>
            <div>{question.correctAnswer}</div>
          </div>

          <div className="question-field">
            <label>Category:</label>
            <div>{question.category || 'Not specified'}</div>
          </div>

          <div className="question-field">
            <label>Main Skill Category:</label>
            <div>{question.mainSkillCategory || 'Not specified'}</div>
          </div>

          <div className="question-field">
            <label>Subcategory:</label>
            <div>{question.subCategory || question.subcategory || question.subcategoryId || 'Not specified'}</div>
          </div>

          <div className="question-field">
            <label>Difficulty:</label>
            <div>{question.difficulty || 'Not specified'}</div>
          </div>

          <div className="question-field">
            <label>Graph:</label>
            <div>
              {question.graphUrl ? (
                <div className="graph-preview-container">
                  <span className="graph-status has-graph">Question has a graph</span>
                  <img
                    src={question.graphUrl}
                    alt="Question Graph"
                    className="question-graph-preview"
                  />
                </div>
              ) : (
                <span className="graph-status no-graph">No graph attached</span>
              )}
            </div>
          </div>

          <div className="question-field">
            <label>Skills:</label>
            <div className="skills-list">
              {question.skillTags && question.skillTags.length > 0 ? (
                question.skillTags.map(skillId => {
                  const skill = skillTags.find(tag => tag.id === skillId);

                  return (
                    <span key={skillId} className="skill-tag">
                      {skill ? skill.name : skillId}
                    </span>
                  );
                })
              ) : (
                <span>No skills assigned</span>
              )}
            </div>
          </div>

          {question.explanation && (
            <div className="question-field">
              <label>Explanation:</label>
              <div className="explanation-content">{question.explanation}</div>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button onClick={() => onEditQuestion(question.id)}>Edit Question</button>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default AdminQuestionDetailsModal;
