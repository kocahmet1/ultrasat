import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ReviewChips.css';

/**
 * Displays concept or skill chips that route into the current concept/quiz flow.
 */
const ConceptReviewChips = ({ concepts = [], skills = [] }) => {
  const navigate = useNavigate();

  if (concepts && concepts.length > 0) {
    return (
      <div className="review-chips-container">
        {concepts.map((concept, index) => (
          <div
            key={concept.id || concept.conceptId || index}
            className="review-chip concept-chip"
            onClick={() => navigate(`/concept/${concept.conceptId || concept.id}`)}
          >
            <span className="chip-icon">DOC</span>
            <span className="chip-text">{concept.name}</span>
            {concept.subcategory && (
              <span className="chip-category">{concept.subcategory}</span>
            )}
          </div>
        ))}
      </div>
    );
  }

  if (skills && skills.length > 0) {
    const uniqueSkills = [...new Set(skills)];

    return (
      <div className="review-chips-container">
        {uniqueSkills.map((skill, index) => {
          const displayName = skill
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

          return (
            <div
              key={index}
              className="review-chip skill-chip"
              onClick={() => navigate('/smart-quiz-generator', {
                state: { subcategoryId: skill }
              })}
            >
              <span className="chip-icon">GO</span>
              <span className="chip-text">{displayName}</span>
            </div>
          );
        })}
      </div>
    );
  }

  return null;
};

export default ConceptReviewChips;
