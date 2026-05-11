import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReview } from '../contexts/ReviewContext';
import { useSubcategories } from '../contexts/SubcategoryContext';
import LessonModal from '../pages/LessonModal';
import { getKebabCaseFromAnyFormat } from '../utils/subcategoryConstants';
import '../styles/ReviewChips.css';

/**
 * Component to display skill review chips based on wrong answers
 * @param {Array} wrongAnswers - Array of wrong answers with subcategory information
 */
const SkillReviewChips = ({ wrongAnswers = [] }) => {
  const { useRepairEngine, queueSkillForReview } = useReview();
  const { allSubcategories } = useSubcategories();
  const navigate = useNavigate();
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [currentSkillTag, setCurrentSkillTag] = useState('');
  
  // Skip rendering if repair engine is disabled or no wrong answers
  if (!useRepairEngine || wrongAnswers.length === 0) {
    return null;
  }
  
  // Handle review skill click
  const handleReviewSkill = (skillTag) => {
    setCurrentSkillTag(skillTag);
    setShowLessonModal(true);
    
    // Queue this skill for review
    queueSkillForReview(skillTag);
  };
  
  const handleStartDrill = (skillTag) => {
    setShowLessonModal(false);
    navigate('/smart-quiz-generator', {
      state: { subcategoryId: skillTag }
    });
  };
  
  return (
    <>
      <div className="review-section">
        <h2>Review Skills</h2>
        <p>Tap on any skill below to review and practice:</p>
        <div className="review-chips">
          {wrongAnswers.map((wrongAnswer, index) => {
            const subcategory = allSubcategories.find(s => s.id === wrongAnswer.subcategory);
            const skillTag = getKebabCaseFromAnyFormat(wrongAnswer.subcategory) || (subcategory ? subcategory.name.toLowerCase().replace(/\s+/g, '-') : wrongAnswer.subcategory);
            return (
              <button 
                key={index} 
                className="review-chip"
                onClick={() => handleReviewSkill(skillTag)}
              >
                Review {subcategory ? subcategory.name : 'this skill'}
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Lesson Modal */}
      {showLessonModal && (
        <LessonModal
          show={showLessonModal}
          skillTag={currentSkillTag}
          onHide={() => setShowLessonModal(false)}
          onStartDrill={handleStartDrill}
        />
      )}
    </>
  );
};

export default SkillReviewChips;
