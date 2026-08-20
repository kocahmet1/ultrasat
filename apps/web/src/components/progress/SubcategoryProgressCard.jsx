import React from 'react';
import { FiZap, FiBookOpen, FiCheck } from 'react-icons/fi';
import { getPerformanceCategoryForLast10 } from '../../utils/progressDashboardUtils';

const PERFORMANCE_CHIP_CLASS = {
  strong: 'ut-chip--easy',
  moderate: 'ut-chip--medium',
  weak: 'ut-chip--hard',
};

function SubcategoryProgressCard({
  subcategory,
  detailedProgress,
  concepts = [],
  conceptMastery = {},
  onOpenSubcategory,
  onStartPractice,
  onLearn,
  onPracticeConcept,
  isFreeTier,
}) {
  const stats = subcategory.stats || {};
  const level = detailedProgress?.level || 1;
  const answeredCount = Math.min(10, stats.totalQuestionsAnswered || 0);
  const performanceClass = getPerformanceCategoryForLast10(
    stats.accuracyLast10 || 0,
    stats.last10QuestionResultsCount || 0,
  );
  const hasAttempts = (stats.totalQuestionsAnswered || 0) > 0 || (stats.last10QuestionResultsCount || 0) > 0;
  const coveragePercent = Math.min(100, (answeredCount / 10) * 100);
  const accuracyLabel = stats.accuracyLast10 !== undefined
    ? `${stats.accuracyLast10.toFixed(0)}%`
    : 'N/A';

  return (
    <article className="ut-card pg-skill">
      <div className="pg-skill-top">
        <button
          type="button"
          className="pg-skill-name"
          onClick={() => onOpenSubcategory(subcategory.id)}
          title={`Open ${subcategory.name} progress details`}
        >
          {subcategory.name}
        </button>
        <div className="pg-skill-chips">
          <span className="ut-chip">Lvl {level}</span>
          {hasAttempts ? (
            <span className={`ut-chip ${PERFORMANCE_CHIP_CLASS[performanceClass] || ''}`}>
              {accuracyLabel} last 10
            </span>
          ) : (
            <span className="ut-chip">No attempts</span>
          )}
        </div>
      </div>

      <div className="pg-skill-bar">
        <div
          className="ut-progress"
          role="progressbar"
          aria-valuenow={answeredCount}
          aria-valuemin={0}
          aria-valuemax={10}
          aria-label={`${subcategory.name}: ${answeredCount} of the last 10 questions covered`}
        >
          {/* Fill color = the same accuracy tier as the chip (≥80 green,
              50–79 amber, <50 red) so a wall of skills scans at a glance.
              No attempts yet → neutral brand blue. */}
          <span
            className={`ut-progress-fill ${hasAttempts ? `pg-fill--${performanceClass}` : ''}`}
            style={{ width: `${coveragePercent}%` }}
          />
        </div>
        <span className="ut-label pg-skill-count">{answeredCount}/10</span>
      </div>

      <div className="pg-skill-foot">
        <span className="ut-label pg-skill-total">
          {stats.totalQuestionsAnswered || 0} answered
        </span>
        <div className="pg-skill-actions">
          <button
            type="button"
            className="ut-btn ut-btn--soft ut-btn--sm"
            onClick={() => onStartPractice(subcategory.id)}
            disabled={!subcategory.id}
          >
            <FiZap aria-hidden="true" /> Practice
          </button>
          <button
            type="button"
            className="ut-btn ut-btn--ghost ut-btn--sm"
            onClick={() => onLearn(subcategory.id)}
          >
            <FiBookOpen aria-hidden="true" /> Learn
            {isFreeTier && <span className="ut-pro">Pro</span>}
          </button>
        </div>
      </div>

      {concepts.length > 0 && (
        <div className="pg-skill-concepts">
          <p className="ut-label pg-concepts-label">Concept mastery</p>
          <div className="pg-concepts-list">
            {concepts.map((concept) => {
              const isMastered = conceptMastery[concept.id] === true;

              if (isMastered) {
                return (
                  <span key={concept.id} className="ut-chip ut-chip--easy">
                    <FiCheck aria-hidden="true" /> {concept.name}
                  </span>
                );
              }

              return (
                <button
                  key={concept.id}
                  type="button"
                  className="ut-chip pg-concept-btn"
                  onClick={() => onPracticeConcept(concept.id)}
                  title={`Practice ${concept.name}`}
                >
                  {concept.name}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </article>
  );
}

export default SubcategoryProgressCard;
