// pages/SmartQuizResults.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { DIFFICULTY_FOR_LEVEL } from '../utils/smartQuizUtils';
import { getSubcategoryName, getKebabCaseFromAnyFormat } from '../utils/subcategoryConstants';
import { processTextMarkup } from '../utils/textProcessing';
import { FiArrowLeft, FiRefreshCw, FiCheckCircle, FiXCircle, FiArrowUp, FiAward, FiFlag } from 'react-icons/fi';
import { FiChevronDown, FiChevronUp, FiMinusCircle, FiBookOpen, FiUsers } from 'react-icons/fi';
import { getStatsForQuestions, formatStats, formatPeerSeconds } from '../firebase/questionStatsServices';
import ExplanationCard from '../components/ExplanationCard';
import ReportQuestionModal from '../components/ReportQuestionModal';
import CoachDebrief from '../components/coach/CoachDebrief';
import { reportQuestion } from '../api/reportClient';
import { toast } from 'react-toastify';
import '../styles/SmartQuizResults.css';

// P2-B: defensive correct-option resolution for peer-stat chips (numeric,
// option-text, or numeric-string correctAnswer). Mirrors SmartQuiz.jsx.
const resolveCorrectOptionIndex = (question) => {
  const options = Array.isArray(question?.options) ? question.options : [];
  if (options.length === 0) return null;
  const { correctAnswer } = question;
  if (typeof correctAnswer === 'number' && options[correctAnswer] !== undefined) return correctAnswer;
  if (typeof correctAnswer === 'string') {
    const idx = options.indexOf(correctAnswer);
    if (idx >= 0) return idx;
    if (/^[0-9]+$/.test(correctAnswer.trim())) {
      const n = parseInt(correctAnswer.trim(), 10);
      if (options[n] !== undefined) return n;
    }
  }
  return null;
};

export default function SmartQuizResults() {
  const { quizId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Report modal state
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [selectedQuestionForReport, setSelectedQuestionForReport] = useState(null);

  // P2-B peer statistics: questionId -> formatStats() output (null while the
  // sample is below MIN_SAMPLE). Fetched once per quiz, in parallel with the
  // question fetches; empty until resolved, and null rows render nothing.
  const [peerStats, setPeerStats] = useState({});

  // Per-question explanation visibility. Keyed by question id; when a key is
  // absent the default applies (expanded for wrong/omitted, collapsed for
  // correct — see explanationDefaultOpen below).
  const [explanationOpen, setExplanationOpen] = useState({});
  const toggleExplanation = (questionId, defaultOpen) => {
    setExplanationOpen((prev) => ({
      ...prev,
      [questionId]: !(prev[questionId] ?? defaultOpen),
    }));
  };

  useEffect(() => {
    const fetchQuizResults = async () => {
      if (!currentUser || !quizId) {
        setError('Missing user or quiz information');
        setLoading(false);
        return;
      }
      
      try {
        const quizRef = doc(db, 'smartQuizzes', quizId);
        const snap = await getDoc(quizRef);
        
        if (!snap.exists()) {
          setError('Quiz not found');
          setLoading(false);
          return;
        }
        
        const data = snap.data();
        if (data.userId !== currentUser.uid) {
          setError('You do not have access to this quiz');
          setLoading(false);
          return;
        }
        
        // P2-B: kick off the peer-stats read here so it runs in parallel with
        // the question fetches below. Fire-and-forget — it never blocks or
        // fails the results render; rows simply gain their stats on resolve.
        const statIds = (Array.isArray(data.questionIds) && data.questionIds.length > 0)
          ? data.questionIds
          : (Array.isArray(data.questions) ? data.questions.map((q) => q?.id).filter(Boolean) : []);
        if (statIds.length > 0) {
          getStatsForQuestions(statIds)
            .then((statsMap) => {
              const derived = {};
              statIds.forEach((id) => { derived[id] = formatStats(statsMap[id]); });
              setPeerStats(derived);
            })
            .catch((statsError) => {
              console.warn('[SmartQuizResults] Peer stats unavailable (non-critical):', statsError?.message);
            });
        }

        let questionsData = [];
        if (data.questionIds && data.questionIds.length > 0) {
          const questionPromises = data.questionIds.map(async (questionId) => {
            const questionRef = doc(db, 'questions', questionId);
            const questionSnap = await getDoc(questionRef);
            return questionSnap.exists() ? { id: questionSnap.id, ...questionSnap.data() } : null;
          });
          questionsData = (await Promise.all(questionPromises)).filter(q => q !== null);
        } else if (data.questions) {
          questionsData = data.questions; // Legacy support
        }
        
        setQuiz({ id: snap.id, ...data, questions: questionsData });
        setLoading(false);
        // Scroll to top when results are loaded
        window.scrollTo(0, 0);
        // (Old companion greeting refresh removed — the CoachDebrief block below
        // is the coach's post-quiz moment now.)
      } catch (err) {
        console.error('Error fetching quiz results:', err);
        setError('Failed to load quiz results');
        setLoading(false);
      }
    };
    
    fetchQuizResults();
  }, [currentUser, quizId]);

  const handleNavigation = (path, state = {}) => navigate(path, { state });

  const handlePracticeAgain = (level) => {
    handleNavigation('/smart-quiz-generator', { subcategoryId: quiz.subcategoryId, forceLevel: level });
  };

  // Report question handler
  const handleReportQuestion = async (reason) => {
    if (!selectedQuestionForReport) return;
    
    setReportLoading(true);
    try {
      await reportQuestion(selectedQuestionForReport.id, quizId, reason);
      toast.success('Question reported successfully. Thank you for your feedback!');
      setIsReportModalOpen(false);
      setSelectedQuestionForReport(null);
    } catch (error) {
      console.error('Error reporting question:', error);
      toast.error(error.message || 'Failed to report question. Please try again.');
    } finally {
      setReportLoading(false);
    }
  };

  const openReportModal = (question) => {
    setSelectedQuestionForReport(question);
    setIsReportModalOpen(true);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your results...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>Error: {error}</p>
        <button onClick={() => handleNavigation('/progress')}>Return to Dashboard</button>
      </div>
    );
  }

  if (!quiz) return null;

  const { score, level, passed, subcategoryId, questionCount, userAnswers = {}, questions = [] } = quiz;
  const correctCount = Object.values(userAnswers).filter(a => a && a.isCorrect).length;
  const levelName = DIFFICULTY_FOR_LEVEL[level] || 'Unknown';
  const wasPromoted = passed && level < 3;
  const hasMastered = passed && level === 3;
  const subcategoryName = getSubcategoryName(subcategoryId) || 'this skill';

  return (
    <div className="results-container">
      <div className="results-content split-view">
        {/* Left Column: Summary Card */}
        <div className="results-card results-summary">
          <p className="ut-eyebrow">Results</p>
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
                  <FiCheckCircle />
  <span>Passed!</span>
                </div>
              ) : (
                <div className="status-failed">
                  <FiXCircle />
  <span>Needs Improvement</span>
                </div>
              )}
            </div>
          </div>

          {wasPromoted && (
            <div className="summary-section promotion-banner">
              <FiArrowUp />
              <p>Promoted to Level {level + 1}!</p>
            </div>
          )}
          {hasMastered && (
            <div className="summary-section mastery-banner">
              <FiAward />
              <p>You've mastered this skill!</p>
            </div>
          )}

          {/* AI Coach (Phase 1): grounded post-quiz debrief with one-tap actions */}
          <CoachDebrief quizId={quizId} />

          <hr className="card-divider" />

          <div className="action-buttons-container">
            <button className="primary-button" onClick={() => handlePracticeAgain(wasPromoted ? level + 1 : level)}>
              {wasPromoted ? <><FiArrowUp /> Go to Level {level + 1}</> : <><FiRefreshCw /> Practice Again</>}
            </button>
            <button className="secondary-button" onClick={() => handleNavigation('/progress')}><FiArrowLeft /> Back to Dashboard</button>
          </div>
        </div>

        {/* Right Column: Question Review */}
        <div className="results-card question-review-panel">
          <h2>Question Review</h2>
          <div className="questions-list">
            {questions.map((q, index) => {
              const answer = userAnswers[q.id];
              // Defensive: an entry may be missing entirely, flagged
              // { omitted: true }, or hold an empty response — all of those
              // are the neutral "Omitted" state, not an incorrect answer.
              const hasResponse = !!answer
                && answer.selectedOption !== null
                && answer.selectedOption !== undefined
                && answer.selectedOption !== '';
              const omitted = !hasResponse || answer?.omitted === true;
              const isCorrect = !omitted && !!answer?.isCorrect;
              const statusKey = omitted ? 'omitted' : (isCorrect ? 'correct' : 'incorrect');
              const explanationDefaultOpen = !isCorrect; // wrong + omitted start expanded
              const isExplanationOpen = explanationOpen[q.id] ?? explanationDefaultOpen;
              // Kebab-case lesson id, same normalization the rest of the app
              // uses; chip is skipped when the id is not a known subcategory.
              const lessonCandidate = getKebabCaseFromAnyFormat(
                q.subcategory || q.subCategory || q.subcategoryId || subcategoryId
              );
              const lessonSubcategoryId =
                lessonCandidate && getSubcategoryName(lessonCandidate) !== 'Unknown Subcategory'
                  ? lessonCandidate
                  : null;
              // P2-B peer statistics for this question. formatStats() already
              // returned null below the MIN_SAMPLE floor, so a truthy entry
              // means "enough attempts to show" — everything below is hidden
              // otherwise (no placeholder).
              const qPeer = peerStats[q.id];
              const showPeer = !!qPeer;
              const peerCorrectIdx = showPeer ? resolveCorrectOptionIndex(q) : null;
              const peerSelectedIdx = showPeer && hasResponse && typeof answer?.selectedOption === 'number'
                ? answer.selectedOption
                : null;
              const peerSelectedPct = peerSelectedIdx !== null && typeof qPeer.optionPcts[peerSelectedIdx] === 'number'
                ? qPeer.optionPcts[peerSelectedIdx]
                : null;
              const peerCorrectPct = peerCorrectIdx !== null && typeof qPeer?.optionPcts[peerCorrectIdx] === 'number'
                ? qPeer.optionPcts[peerCorrectIdx]
                : null;
              const yourTimeSec = !omitted && typeof answer?.timeSpent === 'number' && Number.isFinite(answer.timeSpent)
                ? Math.max(0, Math.round(answer.timeSpent))
                : null;
              return (
                <div key={q.id} className={`question-container-review ${statusKey}`}>
                  <div className="question-review-header">
                    <div className="question-review-left">
                      <h3>Question {index + 1}</h3>
                    </div>
                    <div className="question-review-center">
                      <button
                        className="report-button-results"
                        onClick={() => openReportModal(q)}
                        title="Report this question"
                      >
                        <FiFlag />
                      </button>
                    </div>
                    <div className="question-review-right">
                      <span className={`status-tag status-${statusKey}`}>
                        {statusKey === 'correct' && <><FiCheckCircle /> Correct</>}
                        {statusKey === 'incorrect' && <><FiXCircle /> Incorrect</>}
                        {statusKey === 'omitted' && <><FiMinusCircle /> Omitted</>}
                      </span>
                    </div>
                  </div>
                  {/* P2-B: quiet peer-stats line (UWorld-style restraint). */}
                  {showPeer && (
                    <p className="peer-stats-line">
                      <FiUsers aria-hidden="true" />
                      <span>{qPeer.pctCorrect}% of students answer this correctly</span>
                      {yourTimeSec !== null && qPeer.avgTimeSec !== null && (
                        <span className="peer-stats-time">
                          Your time: {formatPeerSeconds(yourTimeSec)} &middot; class average: {formatPeerSeconds(qPeer.avgTimeSec)}
                        </span>
                      )}
                    </p>
                  )}
                  <p
                    className="question-text"
                    dangerouslySetInnerHTML={{ __html: processTextMarkup(q.text) }}
                  />
                  
                  <div className="answers-review">
                    {/* Detect question type and display answers accordingly */}
                    {(() => {
                      // Determine question type using same logic as SmartQuiz
                      let questionType = q.questionType;
                      if (!questionType) {
                        if (!q.options || !Array.isArray(q.options) || q.options.length === 0) {
                          questionType = 'user-input';
                        } else {
                          questionType = 'multiple-choice';
                        }
                      }

                      if (questionType === 'multiple-choice') {
                        // Multiple choice question display
                        return (
                          <>
                            <div className={`answer-item ${isCorrect ? 'correct-answer' : (omitted ? 'omitted-answer' : 'your-answer')}`}>
                              <strong>Your Answer:</strong>
                              <span>{hasResponse ? (q.options?.[answer.selectedOption] ?? 'Not Answered') : 'Omitted'}</span>
                              {peerSelectedPct !== null && (
                                <span className="peer-choice-note" title={`${peerSelectedPct}% of students chose this option`}>
                                  {peerSelectedPct}% chose this
                                </span>
                              )}
                            </div>
                            {!isCorrect && (
                              <div className="answer-item correct-answer">
                                <strong>Correct Answer:</strong>
                                <span>{q.options?.[q.correctAnswer]}</span>
                                {peerCorrectPct !== null && (
                                  <span className="peer-choice-note" title={`${peerCorrectPct}% of students chose this option`}>
                                    {peerCorrectPct}% chose this
                                  </span>
                                )}
                              </div>
                            )}
                          </>
                        );
                      } else {
                        // User input question display
                        return (
                          <>
                            <div className={`answer-item ${isCorrect ? 'correct-answer' : (omitted ? 'omitted-answer' : 'your-answer')}`}>
                              <strong>Your Answer:</strong>
                              <span>{hasResponse ? answer.selectedOption : 'Omitted'}</span>
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
                        );
                      }
                    })()}
                  </div>

                  {/* Explanation for EVERY question (correct answers included),
                      collapsed behind a toggle — expanded by default for
                      wrong/omitted, collapsed for correct. */}
                  <div className="explanation-controls">
                    <button
                      type="button"
                      className="explanation-toggle"
                      onClick={() => toggleExplanation(q.id, explanationDefaultOpen)}
                      aria-expanded={isExplanationOpen}
                    >
                      {isExplanationOpen ? <FiChevronUp /> : <FiChevronDown />}
                      {isExplanationOpen ? 'Hide explanation' : 'Show explanation'}
                    </button>
                    {lessonSubcategoryId && (
                      <button
                        type="button"
                        className="review-lesson-chip"
                        onClick={() => handleNavigation(`/learn/${lessonSubcategoryId}`)}
                        title="Open the lesson for this skill"
                      >
                        <FiBookOpen /> Review lesson
                      </button>
                    )}
                  </div>
                  {isExplanationOpen && (
                    <ExplanationCard
                      question={q}
                      selectedOption={hasResponse ? answer.selectedOption : null}
                      isCorrect={omitted ? null : isCorrect}
                      omitted={omitted}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Report Question Modal */}
      <ReportQuestionModal
        isOpen={isReportModalOpen}
        onClose={() => {
          setIsReportModalOpen(false);
          setSelectedQuestionForReport(null);
        }}
        onReport={handleReportQuestion}
        loading={reportLoading}
      />
    </div>
  );
}
