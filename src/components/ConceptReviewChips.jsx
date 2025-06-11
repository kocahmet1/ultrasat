import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ReviewChips.css';

/**
 * ConceptReviewChips Component
 * 
 * Displays a list of concept chips that link to the ConceptPractice page
 * Used in the AdaptiveQuiz results to show concepts that need improvement
 * 
 * @param {Object} props
 * @param {Array} props.concepts - Array of concept objects with id, name, and subcategoryId
 * @param {Array} props.skills - Optional array of skill/subcategory names (fallback if no concepts)
 */
const ConceptReviewChips = ({ concepts = [], skills = [] }) => {
  const navigate = useNavigate();

  // If we have identified concepts, show those
  if (concepts && concepts.length > 0) {
    return (
      <div className="review-chips-container">
        {concepts.map((concept, index) => (
          <div 
            key={concept.id || concept.conceptId || index}
            className="review-chip concept-chip"
            onClick={() => navigate(`/concept/${concept.conceptId || concept.id}`)}
          >
            <span className="chip-icon">📚</span>
            <span className="chip-text">{concept.name}</span>
            {concept.subcategory && (
              <span className="chip-category">{concept.subcategory}</span>
            )}
          </div>
        ))}
      </div>
    );
  }
  
  // Fallback to subcategory-level skills if no concepts are identified
  if (skills && skills.length > 0) {
    // Remove duplicates
    const uniqueSkills = [...new Set(skills)];
    
    return (
      <div className="review-chips-container">
        {uniqueSkills.map((skill, index) => {
          // Format skill name for display (convert kebab-case to Title Case)
          const displayName = skill
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
            
          return (
            <div 
              key={index}
              className="review-chip skill-chip"
              onClick={() => navigate(`/adaptive-quiz/${skill}`)}
            >
              <span className="chip-icon">🔍</span>
              <span className="chip-text">{displayName}</span>
            </div>
          );
        })}
      </div>
    );
  }
  
  // No concepts or skills to show
  return null;
};

export default ConceptReviewChips;
