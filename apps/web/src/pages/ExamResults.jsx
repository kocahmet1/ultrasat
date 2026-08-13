import React, { useCallback, useEffect, useState } from 'react';
import DOMPurify from 'dompurify';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCoach } from '../contexts/CoachContext';
import { FiFlag } from 'react-icons/fi';
import { examScores } from '../utils/scoring';
import { processTextMarkup } from '../utils/textProcessing';
import { resolveMultipleChoiceKey } from '../utils/practiceExamScoring';
import ReportQuestionModal from '../components/ReportQuestionModal';
import WordSaver from '../components/WordSaver';
import { reportQuestion } from '../api/reportClient';
import { toast } from 'react-toastify';
import '../styles/Results.css';

const getSafeProcessedMarkup = (value) => (
  DOMPurify.sanitize(processTextMarkup(value) || '')
);

function ExamResults() {
  const navigate = useNavigate();
  const location = useLocation();
  const { examId } = useParams();
  const { currentUser, getExamResultById, getLatestExamResult } = useAuth();
  const coach = useCoach();
  
  const [examDetails, setExamDetails] = useState(null);
  const [, setScore] = useState(0);
  const [readingWritingScore, setReadingWritingScore] = useState(0);
  const [mathScore, setMathScore] = useState(0);
  const [, setAnswered] = useState(0);
  const [, setTotal] = useState(0);
  const [moduleData, setModuleData] = useState([]);
  const [, setSavedToFirebase] = useState(false);
  const [savingError] = useState('');
  const [activeReviewModule, setActiveReviewModule] = useState(null);
  const [showExplanation, setShowExplanation] = useState({});
  const [splitView, setSplitView] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState(null);
  const [, setWeakSubcats] = useState([]);

  // Report modal state
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [selectedQuestionForReport, setSelectedQuestionForReport] = useState(null);

  // Helper function to identify the weakest subcategories based on exam performance
  const getWeakSubcategories = useCallback((modules) => {
    const scores = {};
    
    // Gather all subcategory performance data
    modules.forEach(module => {
      if (module.responses) {
        module.responses.forEach(response => {
          // Get the subcategory from the question or response
          const subcategoryId = response.subcategoryId || 
            (response.question && response.question.subcategoryId);
          const subcategory = response.subcategory || 
            (response.question && response.question.subcategory);
          
          if (subcategoryId && subcategory) {
            if (!scores[subcategoryId]) {
              scores[subcategoryId] = { 
                correct: 0, 
                total: 0, 
                name: subcategory 
              };
            }
            
            if (response.isCorrect) {
              scores[subcategoryId].correct++;
            }
            scores[subcategoryId].total++;
          }
        });
      }
    });
    
    // Convert to array, calculate accuracy rates, and sort by lowest accuracy
    return Object.entries(scores)
      .map(([id, s]) => ({
        id, 
        name: s.name, 
        rate: s.correct / s.total,
        correct: s.correct,
        total: s.total
      }))
      .sort((a, b) => a.rate - b.rate)
      .slice(0, 3); // Return the 3 weakest subcategories
  }, []);

  const processModuleData = useCallback((modules, responses) => { // modules here is examModules
    console.log('[ExamResults] processModuleData - Initial examModules (raw):', modules);
    if (!modules || modules.length === 0) { 
      console.warn('[ExamResults] processModuleData - examModules is null or empty.');
      return [];
    }
    
    const moduleResponses = {}; 
    
    modules.forEach((module, index) => { 
      console.log(`[ExamResults] processModuleData - Processing module ${index} (raw object):`, module);
      console.log(`[ExamResults] processModuleData - Module ${index} ID: ${module.id}, Title: ${module.title}`);
      console.log(`[ExamResults] processModuleData - Does module ${index} have 'questions'?`, module && module.hasOwnProperty('questions') ? 'Yes, length: ' + (module.questions ? module.questions.length : 'undefined') : 'No');
      moduleResponses[module.id] = {
        ...module, 
        responses: []
      };
    });
    
    // Log unique moduleIds from responses
    const uniqueModuleIds = [...new Set(responses.map(r => r.moduleId))];
    console.log('[ExamResults] processModuleData - Unique moduleIds in responses:', uniqueModuleIds);
    console.log('[ExamResults] processModuleData - Module IDs from modules:', modules.map(m => m.id));
    
    responses.forEach(response => {
      if (response.moduleId && moduleResponses[response.moduleId]) {
        moduleResponses[response.moduleId].responses.push(response);
      } else if (response.moduleId) {
        console.warn(`[ExamResults] processModuleData - Response with moduleId ${response.moduleId} doesn't match any module`);
      }
    });
    
    const resultModuleData = Object.values(moduleResponses);
    console.log('[ExamResults] processModuleData - Resulting moduleData (raw object):', resultModuleData);
    // Log response counts per module
    resultModuleData.forEach((module, index) => {
      console.log(`[ExamResults] processModuleData - Module ${index} (${module.title}) has ${module.responses.length} responses`);
    });
    return resultModuleData;
  }, []);

  // Overhaul Phase D: ONE scoring implementation (utils/scoring.js).
  // Prefer the scores the exam was SAVED with (so this page can never disagree
  // with the exam list); recompute through the canonical module only when a
  // legacy result has no stored scores. The old weighted recompute also broke
  // kebab-tagged questions into the wrong section — the module fixes that.
  const calculateScoresFromExamData = useCallback((modules, storedScores) => {
    if (storedScores && (storedScores.readingWriting || storedScores.math)) {
      return {
        readingWritingScore: storedScores.readingWriting || 200,
        mathScore: storedScores.math || 200,
        totalScore: (storedScores.readingWriting || 200) + (storedScores.math || 200),
      };
    }
    const allResponses = modules.flatMap((m) => m.responses || []);
    const scores = examScores(allResponses);
    return {
      readingWritingScore: scores.readingWriting,
      mathScore: scores.math,
      totalScore: scores.total,
    };
  }, []);

  const processAndSetExamData = useCallback((data) => {
    if (!data || !data.modules || !data.responses) {
      setPageError("Failed to process exam data because it was incomplete.");
      setIsLoading(false);
      return;
    }

    const { exam, modules: examModules, responses: examResponses } = data;

    setExamDetails(exam);

    const processedModuleData = processModuleData(examModules, examResponses);
    setModuleData(processedModuleData);

    const { readingWritingScore, mathScore, totalScore } = calculateScoresFromExamData(processedModuleData, data.scores || data.examSummary?.scores);
    setReadingWritingScore(readingWritingScore);
    setMathScore(mathScore);
    setScore(totalScore);

    const totalAnswered = examResponses.length;
    const totalQuestions = examModules.reduce((acc, module) => acc + (module.questions ? module.questions.length : 0), 0);
    setAnswered(totalAnswered);
    setTotal(totalQuestions);

    const weakAreas = getWeakSubcategories(processedModuleData);
    setWeakSubcats(weakAreas);
  }, [calculateScoresFromExamData, getWeakSubcategories, processModuleData]);
  
  useEffect(() => {
    setIsLoading(true);
    setPageError(null);
    
    const fetchExamData = async () => {
      try {
        let examData;
        
        if (examId) {
          examData = await getExamResultById(examId, true);
          if (!examData) {
            setPageError("Exam result not found.");
            setIsLoading(false);
            return;
          }
        } else if (location?.state?.examId) {
          examData = await getExamResultById(location.state.examId, true);
        }
        
        if (!examData && currentUser) {
          examData = await getLatestExamResult();
        }
        
        if (!examData) {
          const responsesFromStorage = JSON.parse(localStorage.getItem('examResponses') || '[]');
          const allModulesFromStorage = JSON.parse(localStorage.getItem('examModules') || '[]');

          if (responsesFromStorage.length > 0 && allModulesFromStorage.length > 0) {
            examData = {
              responses: responsesFromStorage,
              modules: allModulesFromStorage,
              completedAt: new Date()
            };
          }
        }
        
        if (examData) {
            processAndSetExamData(examData);
            setSavedToFirebase(true);
            // Scroll to top when results are loaded
            window.scrollTo(0, 0);
            // AI Coach (Phase 2): exam-completed boundary — the Observer decides
            // whether to speak; the note lands in the coach panel with a badge.
            if (coach?.observe) coach.observe('exam_completed', examId || null);
        } else {
            setPageError("No exam data found to display.");
        }

      } catch (error) {
        console.error('Error loading exam data:', error);
        setPageError('An error occurred while loading exam data.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchExamData();
  }, [examId, location, currentUser, getExamResultById, getLatestExamResult, processAndSetExamData]);

  const returnHome = () => {
    navigate('/progress');
  };

  const handleReviewModule = (moduleIndex) => {
    if (!moduleData || moduleIndex < 0 || moduleIndex >= moduleData.length) {
      console.error('[ExamResults] handleReviewModule - Invalid moduleIndex or moduleData is not populated correctly.');
      setActiveReviewModule(null);
      setSplitView(false);
      return;
    }
    const moduleToReview = moduleData[moduleIndex];
    console.log('[ExamResults] handleReviewModule - Selected moduleData[moduleIndex] for review (raw object):', moduleToReview);
    console.log(`[ExamResults] handleReviewModule - Does moduleToReview have 'questions'?`, moduleToReview && moduleToReview.hasOwnProperty('questions') ? 'Yes, length: ' + (moduleToReview.questions ? moduleToReview.questions.length : 'undefined') : 'No');
    console.log('[ExamResults] handleReviewModule - Selected moduleData[moduleIndex] for review (JSON):', JSON.stringify(moduleToReview, null, 2));
    setActiveReviewModule(moduleToReview);
    setSplitView(true); 
    setShowExplanation({}); 
  };

  const closeReviewPanel = () => {
    setActiveReviewModule(null);
    setSplitView(false); 
    setShowExplanation({}); 
  };

  const toggleExplanation = (questionId) => {
    setShowExplanation(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  // Report question handlers
  const handleReportQuestion = async (reason) => {
    if (!selectedQuestionForReport) return;
    
    setReportLoading(true);
    try {
      await reportQuestion(selectedQuestionForReport.id, examId, reason);
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

  if (isLoading) {
    return (
      <div className="ut-page" role="status" aria-label="Loading results">
        <div className="ut-skeleton ut-skeleton--text" style={{ width: 110, marginBottom: 12 }} />
        <div className="ut-skeleton ut-skeleton--title" style={{ width: 240, marginBottom: 26 }} />
        <div className="ut-grid ut-grid--4" style={{ marginBottom: 22 }}>
          <div className="ut-skeleton ut-skeleton--stat" />
          <div className="ut-skeleton ut-skeleton--stat" />
          <div className="ut-skeleton ut-skeleton--stat" />
          <div className="ut-skeleton ut-skeleton--stat" />
        </div>
        <div className="ut-skeleton-stack">
          <div className="ut-skeleton ut-skeleton--card" />
          <div className="ut-skeleton ut-skeleton--card" />
          <div className="ut-skeleton ut-skeleton--card" />
        </div>
      </div>
    );
  }

  if (pageError) {
    return <div className="error-container"><p>{pageError}</p><button onClick={returnHome}>Go Home</button></div>;
  }

  // Debug log for moduleData at render time
  console.log('[ExamResults] Rendering with moduleData:', moduleData);
  console.log('[ExamResults] moduleData length:', moduleData?.length);
  console.log('[ExamResults] moduleData type:', typeof moduleData);

  return (
    <div className="results-container">
      <ReportQuestionModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onReport={handleReportQuestion}
        loading={reportLoading}
      />

      <header className="results-page-head">
        <span className="ut-eyebrow">Results</span>
        <h1 className="ut-page-title">Exam Results</h1>
        <p className="ut-page-sub">Section scores plus a question-by-question review of every module.</p>
      </header>

      <div className={`results-content ${splitView ? 'split-view' : ''}`}>
        {savingError ? (
          <div className="error-message">
            <p>Error saving results: {savingError}</p>
            <p>Your results have not been saved to your account.</p>
          </div>
        ) : (
          <>
            <div className={`results-card ${splitView ? 'results-summary' : ''}`}>
              <div className="total-score-container">
                <h2>Total Score</h2>
                {examDetails?.isDiagnostic && (
                  <div className="diagnostic-indicator">
                    <span className="diagnostic-badge">Diagnostic Test</span>
                  </div>
                )}
                <p>{readingWritingScore + mathScore} / 1600</p>
              </div>
              <div className="scores-row">
                <div className="score-card reading-writing">
                  <h2>Reading & Writing</h2>
                  <p>{readingWritingScore}/800</p>
                </div>
                <div className="score-card math">
                  <h2>Math</h2>
                  <p>{mathScore}/800</p>
                </div>
              </div>
              <div className="review-modules-section">
                <h2>Review Questions by Module</h2>
                <div className="module-review-buttons">
                  {moduleData && moduleData.length > 0 ? (
                    // Sort modules: Reading & Writing first (moduleNumber <= 2), then Math (moduleNumber > 2)
                    moduleData
                      .map((module, originalIndex) => ({ ...module, originalIndex }))
                      .sort((a, b) => {
                        // First sort by subject (Reading & Writing vs Math)
                        const aIsRW = a.moduleNumber <= 2;
                        const bIsRW = b.moduleNumber <= 2;
                        if (aIsRW && !bIsRW) return -1; // Reading & Writing comes first
                        if (!aIsRW && bIsRW) return 1;  // Math comes second
                        // If same subject, sort by module number
                        return a.moduleNumber - b.moduleNumber;
                      })
                      .map((module, index) => (
                        <button 
                          key={module.originalIndex} 
                          className={`module-review-button ${activeReviewModule === moduleData[module.originalIndex] ? 'active' : ''}`}
                          onClick={() => handleReviewModule(module.originalIndex)}
                        >
                          Review {module.moduleNumber <= 2 ? 'Reading & Writing' : 'Math'} Module {((module.moduleNumber - 1) % 2) + 1}
                        </button>
                      ))
                  ) : (
                    // Fallback buttons when moduleData is empty - ordered correctly
                    <>
                      <button 
                        className="module-review-button"
                        onClick={() => alert('Module review data is not available for this exam.')}
                      >
                        Review Reading & Writing Module 1
                      </button>
                      <button 
                        className="module-review-button"
                        onClick={() => alert('Module review data is not available for this exam.')}
                      >
                        Review Reading & Writing Module 2
                      </button>
                      <button 
                        className="module-review-button"
                        onClick={() => alert('Module review data is not available for this exam.')}
                      >
                        Review Math Module 1
                      </button>
                      <button 
                        className="module-review-button"
                        onClick={() => alert('Module review data is not available for this exam.')}
                      >
                        Review Math Module 2
                      </button>
                    </>
                  )}
                </div>
                {moduleData && moduleData.length === 0 && (
                  <p style={{ color: 'var(--ut-muted)', fontStyle: 'italic', marginTop: '1rem' }}>
                    Module review is not available for this exam. This may be due to missing question data.
                  </p>
                )}
              </div>
              {!splitView && (
                <>
                  {/* Focus Areas section */}
                  {/* {weakSubcats && weakSubcats.length > 0 && (
                    <div className="focus-areas-container">
                      <h2>Your Focus Areas</h2>
                      <p>We've identified these subcategories as needing improvement based on your performance.</p>
                      <div className="focus-areas-list">
                        {weakSubcats.map(subcategory => (
                          <div key={subcategory.id} className="focus-area-card">
                            <div className="focus-area-content">
                              <h3>{subcategory.name}</h3>
                              <div className="subcategory-stats">
                                <div className="score-pill">
                                  {Math.round(subcategory.rate * 100)}%
                                </div>
                                <span className="score-details">
                                  {subcategory.correct} / {subcategory.total} correct
                                </span>
                              </div>
                            </div>
                            <button 
                              className="start-adaptive-quiz-button"
                              onClick={() => navigate(`/adaptive-quiz?subcategory=${subcategory.id}&level=easy`)}
                            >
                              Start Adaptive Quiz <FaArrowRight />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )} */}
                </>
              )}

              {/* Consolidated Action Buttons Section */}
              <div className="action-buttons-container">
                <div className="secondary-actions">
                  <button className="secondary-button" onClick={() => navigate('/all-results')}>
                    VIEW ALL EXAM RESULTS
                  </button>
                  <button className="secondary-button" onClick={returnHome}>
                    BACK TO HOME
                  </button>
                </div>
              </div>
            </div>
            
            {splitView && activeReviewModule !== null && (
              <div className="module-review-panel">
                {/* Select any word in the reviewed questions to save it to the Word Bank */}
                <WordSaver
                  selector=".question-container-review"
                  source="exam-review"
                  metadata={{ examId }}
                  showDefinition
                />
                <div className="module-review-header">
                  <h2>Review: {activeReviewModule?.title || 'Module'}</h2>
                  <button 
                    className="close-review-button"
                    onClick={closeReviewPanel}
                  >
                    Close
                  </button>
                </div>
                
                <div className="module-questions-review">
                  {activeReviewModule?.questions?.map((question, questionIndex) => {
                    // Find the response for the current question from the original module definition
                    // Try multiple ways to match the response to handle different ID formats
                    const response = activeReviewModule.responses?.find(resp => {
                      // First try exact ID match
                      if (resp.questionId === question.id) return true;
                      
                      // Then try matching by question content if both have it
                      if (resp.question && resp.question.id === question.id) return true;
                      
                      // Try matching by index-based ID pattern
                      const indexBasedId = `practice-${activeReviewModule.id}-q-${questionIndex}`;
                      if (resp.questionId === indexBasedId) return true;
                      
                      // Try matching by moduleIndex if available
                      if (resp.moduleIndex === questionIndex) return true;
                      
                      // Last resort: match by question text (for questions without proper IDs)
                      if (resp.question && resp.question.text === question.text) return true;
                      
                      return false;
                    });

                    console.log(`[ExamResults] Reviewing Question ${questionIndex + 1} (ID: ${question.id}):`, question);
                    if (response) {
                        console.log(`[ExamResults] Found response for Question ${question.id}:`, response);
                    } else {
                        console.log(`[ExamResults] No response found for Question ${question.id} (Skipped).`);
                        // Debug: Log all response questionIds for this module
                        if (questionIndex === 0 && activeReviewModule.responses) {
                          console.log(`[ExamResults] Module ${activeReviewModule.title} - All response questionIds:`, 
                            activeReviewModule.responses.map(r => r.questionId));
                          console.log(`[ExamResults] Module ${activeReviewModule.title} - All question ids:`, 
                            activeReviewModule.questions.map(q => q.id));
                        }
                    }
                    
                    // Determine if the question was answered and if it was correct
                    const isAnswered = !!response;
                    const isCorrect = response?.isCorrect || false;

                    // Guard against undefined question (but allow questions without options)
                    if (!question || !question.text) {
                      console.error(`[ExamResults] Invalid question object or missing text at index ${questionIndex}:`, question);
                      return (
                        <div key={`error-q-${questionIndex}`} className="question-container-review error">
                          <p>Error: Question data is incomplete for this item.</p>
                        </div>
                      );
                    }
                    
                    // Determine question type using smart detection
                    let questionType = question.questionType;
                    if (!questionType) {
                      if (!question.options || !Array.isArray(question.options) || question.options.length === 0) {
                        questionType = 'user-input';
                      } else {
                        questionType = 'multiple-choice';
                      }
                    }
                    
                    return (
                      <div key={question.id || questionIndex} className="question-container-review">
                        <div className="question-review-header">
                          <div className="question-review-left">
                            <span className="question-number">Question {questionIndex + 1}</span>
                          </div>
                          <div className="question-review-center">
                            <button
                              className="report-button-results"
                              onClick={() => openReportModal(question)}
                              title="Report this question"
                            >
                              <FiFlag />
                            </button>
                          </div>
                          <div className="question-review-right">
                            <span className={`question-status ${!isAnswered ? 'not-answered' : isCorrect ? 'correct' : 'incorrect'}`}>
                              {!isAnswered ? 'Not Answered' : isCorrect ? 'Correct' : 'Incorrect'}
                            </span>
                          </div>
                        </div>
                        
                        <div 
                          className="question-text"
                          dangerouslySetInnerHTML={{ __html: getSafeProcessedMarkup(question.text) }}
                        />
                        
                        {question.graphDescription && (
                          <div className="question-graph-description">
                            <h4>Graph Description:</h4>
                            <div 
                              className="graph-description-text"
                              dangerouslySetInnerHTML={{ __html: getSafeProcessedMarkup(question.graphDescription) }}
                            />
                          </div>
                        )}
                        
                        {question.graphUrl && (
                          <div className="question-graph">
                            <img
                              src={question.graphUrl}
                              alt={question.graphDescription || 'Question graph'}
                            />
                          </div>
                        )}
                        
                        {/* Conditional rendering based on question type */}
                        {questionType === 'multiple-choice' ? (
                          // Multiple choice questions display
                          <div className="question-options">
                            {question.options.map((optionText, optionIndex) => {
                              const userAnswer = response?.userAnswer;
                              
                              let isUserSelectedOption = false;
                              if (isAnswered) {
                                  // If userAnswer is stored as the option text itself:
                                  isUserSelectedOption = userAnswer === optionText;
                              }

                              const correctOption = resolveMultipleChoiceKey(
                                question.correctAnswer,
                                question.options,
                              );
                              const isCorrectOption = optionText === correctOption;
                              
                              let backgroundColor = 'var(--ut-card-soft)'; // Default for unselected options

                              if (isCorrectOption) {
                                // Highlight the correct answer regardless of user selection
                                backgroundColor = 'var(--ut-accent-soft)'; // Green tint for correct option
                              }
                              
                              if (isUserSelectedOption) {
                                if (isCorrectOption) {
                                  // User selected the correct answer (already light green)
                                } else {
                                  // User selected an incorrect answer
                                  backgroundColor = 'var(--ut-danger-soft)'; // Danger tint for user's incorrect selection
                                }
                              }
                              
                              const optionStyle = {
                                padding: '10px 15px',
                                borderRadius: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                marginBottom: '8px',
                                backgroundColor: backgroundColor,
                                border: '1px solid var(--ut-rule)'
                              };
                              
                              return (
                                <div key={optionIndex} style={optionStyle}>
                                  <span style={{fontWeight: 'bold', marginRight: '10px', width: '20px'}}>
                                    {String.fromCharCode(65 + optionIndex)}.
                                  </span>
                                  <span style={{flex: 1}}>{optionText}</span>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          // User input questions display
                          <div className="user-input-review">
                            <div style={{marginBottom: '15px'}}>
                              <div style={{
                                padding: '10px 15px',
                                borderRadius: '4px',
                                backgroundColor: isAnswered ? (isCorrect ? 'var(--ut-accent-soft)' : 'var(--ut-danger-soft)') : 'var(--ut-card-soft)',
                                border: '1px solid var(--ut-rule)',
                                marginBottom: '8px'
                              }}>
                                <div style={{fontWeight: 'bold', marginBottom: '5px'}}>Your Answer:</div>
                                <div style={{fontSize: '16px'}}>
                                  {isAnswered ? response.userAnswer : 'Not answered'}
                                </div>
                              </div>
                              
                              <div style={{
                                padding: '10px 15px',
                                borderRadius: '4px',
                                backgroundColor: 'var(--ut-accent-soft)', // Always green for correct answer
                                border: '1px solid var(--ut-rule)'
                              }}>
                                <div style={{fontWeight: 'bold', marginBottom: '5px'}}>Correct Answer:</div>
                                <div style={{fontSize: '16px'}}>
                                  {question.correctAnswer}
                                </div>
                              </div>
                              
                              {question.acceptedAnswers && question.acceptedAnswers.length > 0 && (
                                <div style={{
                                  padding: '10px 15px',
                                  borderRadius: '4px',
                                  backgroundColor: 'var(--ut-card-soft)',
                                  border: '1px solid var(--ut-accent-rule)',
                                  marginTop: '8px'
                                }}>
                                  <div style={{fontWeight: 'bold', marginBottom: '5px'}}>Also Accepted:</div>
                                  <div style={{fontSize: '14px', color: 'var(--ut-muted)'}}>
                                    {question.acceptedAnswers.join(', ')}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {isAnswered && (
                          <div className="question-footer">
                            <button 
                              className="explanation-button"
                              onClick={() => toggleExplanation(question.id)}
                            >
                              {showExplanation[question.id] ? 'Hide Explanation' : 'Show Explanation'}
                            </button>
                          </div>
                        )}
                        
                        {isAnswered && showExplanation[question.id] && (
                          <div className="question-explanation">
                            <h4>Explanation</h4>
                            <p dangerouslySetInnerHTML={{ __html: getSafeProcessedMarkup(question.explanation || `The correct answer is "${question.correctAnswer}". ${question.reasoning || ''}`) }} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default ExamResults;
