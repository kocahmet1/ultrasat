import React from 'react';
import SubcategoryProgressCard from './SubcategoryProgressCard';

function SubcategoryProgressSection({
  title,
  Icon,
  buttonClassName,
  categories,
  detailedProgress,
  conceptsBySubcategory,
  userConceptMastery,
  onOpenSubcategory,
  onStartPractice,
  onLearn,
  onPracticeConcept,
  isFreeTier,
}) {
  const subcategories = Object.values(categories || {}).flatMap(
    (category) => category.subcategories || [],
  );

  return (
    <div className="pd-split-column">
      <div className="pd-section-title">
        <Icon /> {title}
      </div>

      <div className="pd-subcategories-list">
        {subcategories.map((subcategory) => (
          <SubcategoryProgressCard
            key={subcategory.id}
            subcategory={subcategory}
            buttonClassName={buttonClassName}
            detailedProgress={detailedProgress[subcategory.id]}
            concepts={conceptsBySubcategory[subcategory.id] || []}
            conceptMastery={userConceptMastery[subcategory.id] || {}}
            onOpenSubcategory={onOpenSubcategory}
            onStartPractice={onStartPractice}
            onLearn={onLearn}
            onPracticeConcept={onPracticeConcept}
            isFreeTier={isFreeTier}
          />
        ))}
      </div>
    </div>
  );
}

export default SubcategoryProgressSection;
