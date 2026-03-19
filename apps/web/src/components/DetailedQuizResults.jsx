// components/DetailedQuizResults.jsx
import React, { useEffect } from 'react';
import { FaArrowLeft, FaRedo, FaCheckCircle, FaTimesCircle, FaArrowUp, FaTrophy, FaFlag } from 'react-icons/fa';
import { DIFFICULTY_FOR_LEVEL } from '../utils/smartQuizUtils';
import { getSubcategoryName } from '../utils/subcategoryConstants';
import { processTextMarkup } from '../utils/textProcessing';
import '../styles/SmartQuizResults.css';

/**
 * Reusable detailed quiz results component for both authenticated and guest flows.
 *
 * Props:
 * - score: number (0-100)
 * - level: number (1-3)
 * - passed: boolean
 * - subcategoryId: string|number
 * - questionCount: number
 * - userAnswers: { [questionId]: { selectedOption:any, isCorrect:boolean, timeSpent?:number } }
 * - questions: Array<{ id:string, text:string, options?:string[], correctAnswer:any, acceptedAnswers?:string[], explanation?:string, questionType?:string }>
 * - showReport: boolean (default true) -> if false, hides the report button
 * - onRequestReport?: (question) => void -> called when report button is clicked
 * - onPrimaryAction?: () => void
 * - onSecondaryAction?: () => void
 * - primaryButtonContent?: React.ReactNode (default: Practice Again)
 * - secondaryButtonContent?: React.ReactNode (default: Back)
 */
export default function DetailedQuizResults({
  score = 0,
  level = 1,
  passed = false,
  subcategoryId,
  questionCount = 0,
  userAnswers = {},
  questions = [],
  showReport = true,
  onRequestReport,
  onPrimaryAction,
  onSecondaryAction,
  primaryButtonContent,
  secondaryButtonContent,
}) {
  // Scroll to top when results load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const correctCount = Object.values(userAnswers).filter((a) => a?.isCorrect).length;
  const levelName = DIFFICULTY_FOR_LEVEL[level] || 'Unknown';
  const wasPromoted = passed && level < 3;
  const hasMastered = passed && level === 3;
  const subcategoryName = getSubcategoryName(subcategoryId) || 'this skill';

  return (
    <div className="results-container">
      <div className="results-content split-view">
        {/* Left Column: Summary Card */}
        <div className="results-card results-summary">
          <h1>{hasMastered ? 'Skill Mastered!' : 'Quiz Results'}</h1>

          <div className="score-circle" style={{ '--pct': `${score}%` }}>
            <div className="score-percentage">{score}%</div>
          </div>

          <div className="summary-details">
            <div className="score-subtitle">{correctCount} of {questionCount} correct</div>
            <div className="summary-section level-indicator">
              <h3>{subcategoryName}</h3>
              <p>Difficulty Level: <strong>{level} ({levelName})</strong></p>
            </div>
            <div className="summary-section status-indicator">
              {passed ? (
                <div className="status-passed">
                  <FaCheckCircle />
                  <span>Passed!</span>
                </div>
              ) : (
                <div className="status-failed">
                  <FaTimesCircle />
                  <span>Needs Improvement</span>
                </div>
              )}
            </div>
          </div>

          {wasPromoted && (
            <div className="summary-section promotion-banner">
              <FaArrowUp />
              <p>Promoted to Level {level + 1}!</p>
            </div>
          )}
          {hasMastered && (
            <div className="summary-section mastery-banner">
              <FaTrophy />
              <p>You've mastered this skill!</p>
            </div>
          )}

          <hr className="card-divider" />

          <div className="action-buttons-container">
            {onPrimaryAction && (
              <button className="primary-button" onClick={onPrimaryAction}>
                {primaryButtonContent || (<><FaRedo /> Practice Again</>)}
              </button>
            )}
            {onSecondaryAction && (
              <button className="secondary-button" onClick={onSecondaryAction}><FaArrowLeft /> {secondaryButtonContent || 'Back'}</button>
            )}
          </div>
        </div>

        {/* Right Column: Question Review */}
        <div className="results-card question-review-panel">
          <h2>Question Review</h2>
          <div className="questions-list">
            {questions.map((q, index) => {
              const answer = userAnswers[q.id];
              const isCorrect = answer?.isCorrect;

              // Determine question type
              let questionType = q.questionType;
              if (!questionType) {
                if (!q.options || !Array.isArray(q.options) || q.options.length === 0) {
                  questionType = 'user-input';
                } else {
                  questionType = 'multiple-choice';
                }
              }

              return (
                <div key={q.id} className={`question-container-review ${isCorrect ? 'correct' : 'incorrect'}`}>
                  <div className="question-review-header">
                    <div className="question-review-left">
                      <h3>Question {index + 1}</h3>
                    </div>
                    <div className="question-review-center">
                      {showReport && (
                        <button
                          className="report-button-results"
                          onClick={() => onRequestReport && onRequestReport(q)}
                          title="Report this question"
                        >
                          <FaFlag />
                        </button>
                      )}
                    </div>
                    <div className="question-review-right">
                      <span className={`status-tag ${isCorrect ? 'status-correct' : 'status-incorrect'}`}>
                        {isCorrect ? <FaCheckCircle /> : <FaTimesCircle />}
                        {isCorrect ? 'Correct' : 'Incorrect'}
                      </span>
                    </div>
                  </div>

                  <p
                    className="question-text"
                    dangerouslySetInnerHTML={{ __html: processTextMarkup(q.text) }}
                  />

                  <div className="answers-review">
                    {questionType === 'multiple-choice' ? (
                      <>
                        <div className={`answer-item ${isCorrect ? 'correct-answer' : 'your-answer'}`}>
                          <strong>Your Answer:</strong>
                          <span>{q.options?.[answer?.selectedOption] ?? 'Not Answered'}</span>
                        </div>
                        {!isCorrect && (
                          <div className="answer-item correct-answer">
                            <strong>Correct Answer:</strong>
                            <span>{q.options?.[q.correctAnswer]}</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div className={`answer-item ${isCorrect ? 'correct-answer' : 'your-answer'}`}>
                          <strong>Your Answer:</strong>
                          <span>{answer?.selectedOption ?? 'Not Answered'}</span>
                        </div>
                        {!isCorrect && (
                          <div className="answer-item correct-answer">
                            <strong>Correct Answer:</strong>
                            <span>{q.correctAnswer}</span>
                          </div>
                        )}
                        {q.acceptedAnswers && q.acceptedAnswers.length > 0 && (
                          <div className="answer-item accepted-answers">
                            <strong>Also Accepted:</strong>
                            <span>{q.acceptedAnswers.join(', ')}</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {!isCorrect && q.explanation && (
                    <div className="question-explanation">
                      <h4>Explanation</h4>
                      <p dangerouslySetInnerHTML={{ __html: processTextMarkup(q.explanation) }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
