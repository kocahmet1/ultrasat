import React, { useState } from 'react';
import { useReview } from '../contexts/ReviewContext';
import { useSubcategories } from '../contexts/SubcategoryContext';
import LessonModal from '../pages/LessonModal';
import '../styles/ReviewChips.css';

/**
 * Component to display skill review chips based on wrong answers
 * @param {Array} wrongAnswers - Array of wrong answers with subcategory information
 */
const SkillReviewChips = ({ wrongAnswers = [] }) => {
  const { useRepairEngine, queueSkillForReview } = useReview();
  const { allSubcategories } = useSubcategories();
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
  
  // Handle drill start after viewing lesson
  const handleStartDrill = (skillTag) => {
    // This will be implemented in Sprint 2
    console.log('Starting drill for skill:', skillTag);
    setShowLessonModal(false);
    // Will navigate to skill-focused mini-quiz in Sprint 2
  };
  
  return (
    <>
      <div className="review-section">
        <h2>Review Skills</h2>
        <p>Tap on any skill below to review and practice:</p>
        <div className="review-chips">
          {wrongAnswers.map((wrongAnswer, index) => {
            const subcategory = allSubcategories.find(s => s.id === wrongAnswer.subcategory);
            const skillTag = subcategory ? subcategory.name.toLowerCase().replace(/\s+/g, '-') : wrongAnswer.subcategory;
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
