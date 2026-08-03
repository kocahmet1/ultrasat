import React from 'react';
import SubcategoryProgressCard from './SubcategoryProgressCard';

function SubcategoryProgressSection({
  title,
  Icon,
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
  const categoryEntries = Object.entries(categories || {});
  const skillCount = categoryEntries.reduce(
    (sum, [, category]) => sum + (category.subcategories?.length || 0),
    0,
  );

  return (
    <section className="pg-section" aria-label={`${title} progress`}>
      <div className="ut-section-head">
        <h2 className="ut-section-title pg-section-title">
          {Icon ? <Icon aria-hidden="true" /> : null}
          {title}
        </h2>
        <span className="ut-chip">{skillCount} skills</span>
      </div>

      {categoryEntries.map(([categoryKey, category]) => (
        <div className="pg-group" key={categoryKey}>
          <p className="ut-label pg-group-label">{category.title}</p>
          <div className="ut-grid ut-grid--2">
            {(category.subcategories || []).map((subcategory) => (
              <SubcategoryProgressCard
                key={subcategory.id}
                subcategory={subcategory}
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
      ))}
    </section>
  );
}

export default SubcategoryProgressSection;
