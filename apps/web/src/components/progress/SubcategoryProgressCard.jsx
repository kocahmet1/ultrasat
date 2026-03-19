import React from 'react';
import {
  FaBook,
  FaBolt,
  FaBullseye,
  FaCheck,
  FaExclamationTriangle,
} from 'react-icons/fa';
import { getPerformanceCategoryForLast10 } from '../../utils/progressDashboardUtils';

function SubcategoryProgressCard({
  subcategory,
  buttonClassName,
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

  return (
    <div className="pd-subcategory-item">
      <div className="pd-subcategory-info">
        <div className="pd-minimal-view">
          <div className="pd-title-row">
            <div className="pd-subcategory-header">
              <button
                className={`subcategory-name-btn ${buttonClassName}`}
                onClick={() => onOpenSubcategory(subcategory.id)}
                type="button"
              >
                {subcategory.name}
              </button>
            </div>
            <div className="single-level-indicator">
              <div className="current-level-box">Level {level}</div>
            </div>
          </div>

          <div className="subcategory-progress-container">
            <div className="progress-bar-container">
              <div className="progress-bar-background">
                <div
                  className={`progress-bar-fill ${performanceClass}`}
                  style={{ width: `${Math.min(100, (answeredCount / 10) * 100)}%` }}
                ></div>
              </div>
              <div className="progress-status">
                <span>{answeredCount}/10</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pd-expanded-view">
          <div className="level-up-message">
            {10 - answeredCount} more questions left to cover this topic. Take a{' '}
            <span className="emphasis">SmartQuiz</span> to level up and fully master the topic.
          </div>

          <div className="level-indicator-container">
            <div className={`level-box ${level === 1 ? 'active' : ''}`}>Level 1</div>
            <div className={`level-box ${level === 2 ? 'active' : ''}`}>Level 2</div>
            <div className={`level-box ${level === 3 ? 'active' : ''}`}>Level 3</div>
          </div>

          {hasAttempts ? (
            <div className="pd-subcategory-stats">
              <p className={`accuracy-display ${performanceClass}`}>
                <FaBullseye />
                {' '}
                Accuracy (Last 10 questions):{' '}
                {stats.accuracyLast10 !== undefined ? `${stats.accuracyLast10.toFixed(0)}%` : 'N/A'}
              </p>
              <p className="total-answered-display">
                Total # of questions answered: {stats.totalQuestionsAnswered || 0}
              </p>
            </div>
          ) : (
            <p className="accuracy-display">No attempts yet</p>
          )}
        </div>

        {concepts.length > 0 && (
          <div className="concept-mastery-container">
            <h5>Concept Mastery</h5>
            <div className="concept-list">
              {concepts.map((concept) => {
                const isMastered = conceptMastery[concept.id] === true;

                return (
                  <div key={concept.id} className="concept-item">
                    <div className="concept-name">{concept.name}</div>
                    <div className={`concept-status ${isMastered ? 'mastered' : 'not-mastered'}`}>
                      {isMastered ? (
                        <>
                          <FaCheck /> Mastered
                        </>
                      ) : (
                        <>
                          <FaExclamationTriangle /> Practice Needed
                        </>
                      )}
                    </div>
                    {!isMastered && (
                      <button
                        className="concept-practice-btn"
                        onClick={() => onPracticeConcept(concept.id)}
                        type="button"
                      >
                        Practice This Concept
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      <div className="pd-subcategory-actions">
        <button
          className="action-button practice minimal-action"
          onClick={() => onStartPractice(subcategory.id)}
          disabled={!subcategory.id}
          type="button"
        >
          <FaBolt /> Practice
        </button>

        <button
          className="action-button learn expanded-action"
          onClick={() => onLearn(subcategory.id)}
          type="button"
        >
          <FaBook /> Learn
          {isFreeTier && <span className="pd-learn-pro-badge">PRO</span>}
        </button>
      </div>
    </div>
  );
}

export default SubcategoryProgressCard;
