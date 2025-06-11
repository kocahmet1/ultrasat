import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getFirestore } from 'firebase/firestore';
import { FaArrowRight } from 'react-icons/fa';
import '../styles/Results.css';

function ExamResults() {
  const navigate = useNavigate();
  const location = useLocation();
  const { examId } = useParams();
  const { currentUser, getExamResultById, getLatestExamResult } = useAuth();
  const db = getFirestore();
  
  const [examDetails, setExamDetails] = useState(null);
  const [score, setScore] = useState(0);
  const [readingWritingScore, setReadingWritingScore] = useState(0);
  const [mathScore, setMathScore] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [total, setTotal] = useState(0);
  const [moduleData, setModuleData] = useState([]);
  const [savedToFirebase, setSavedToFirebase] = useState(false);
  const [savingError, setSavingError] = useState('');
  const [activeReviewModule, setActiveReviewModule] = useState(null);
  const [showExplanation, setShowExplanation] = useState({});
  const [splitView, setSplitView] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState(null);
  const [weakSubcats, setWeakSubcats] = useState([]);

  // Helper function to identify the weakest subcategories based on exam performance
  const getWeakSubcategories = (modules) => {
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
  };

  const processModuleData = (modules, responses) => { // modules here is examModules
    console.log('[ExamResults] processModuleData - Initial examModules (raw):', modules);
    if (!modules || modules.length === 0) { 
      console.warn('[ExamResults] processModuleData - examModules is null or empty.');
      return [];
    }
    
    const moduleResponses = {}; 
    
    modules.forEach((module, index) => { 
      console.log(`[ExamResults] processModuleData - Processing module ${index} (raw object):`, module);
      console.log(`[ExamResults] processModuleData - Does module ${index} have 'questions'?`, module && module.hasOwnProperty('questions') ? 'Yes, length: ' + (module.questions ? module.questions.length : 'undefined') : 'No');
      moduleResponses[module.id] = {
        ...module, 
        responses: []
      };
    });
    
    responses.forEach(response => {
      if (response.moduleId && moduleResponses[response.moduleId]) {
        moduleResponses[response.moduleId].responses.push(response);
      }
    });
    
    const resultModuleData = Object.values(moduleResponses);
    console.log('[ExamResults] processModuleData - Resulting moduleData (raw object):', resultModuleData);
    return resultModuleData;
  };

  const processAndSetExamData = (data) => {
    console.log('[ExamResults] processAndSetExamData - Input data (raw):', data);
    console.log('[ExamResults] processAndSetExamData - Input data.modules (examModules) (raw):', data.modules);
    const { 
        overallScore, 
        scores, 
        responses: examResponses, 
        modules: examModules, 
        totalQuestions, 
        correctAnswers 
    } = data;

    const currentTotalCorrect = correctAnswers !== undefined ? correctAnswers : (parseInt(localStorage.getItem('examAnswered') || '0'));
    const currentTotalQuestions = totalQuestions !== undefined ? totalQuestions : (parseInt(localStorage.getItem('examTotal') || '0'));

    setScore(currentTotalCorrect);
    setAnswered(currentTotalCorrect);
    setTotal(currentTotalQuestions);

    let rwScore = 0;
    let mScore = 0;

    if (scores && scores.readingWriting !== undefined && scores.math !== undefined) {
        rwScore = scores.readingWriting;
        mScore = scores.math;
    } else if (examModules && examResponses) {
        // Improved module identification for Reading/Writing vs Math
        const rwModules = examModules.filter(m => {
            const title = (m.title || '').toLowerCase();
            return title.includes('reading') || title.includes('writing') || m.moduleNumber <= 2;
        });
        const mathModules = examModules.filter(m => {
            const title = (m.title || '').toLowerCase();
            return title.includes('math') || m.moduleNumber > 2;
        });

        const rwCorrect = examResponses
            .filter(r => rwModules.some(m => m.id === r.moduleId))
            .reduce((sum, r) => sum + (r.isCorrect ? 1 : 0), 0);
        
        const mathCorrect = examResponses
            .filter(r => mathModules.some(m => m.id === r.moduleId))
            .reduce((sum, r) => sum + (r.isCorrect ? 1 : 0), 0);
        
        // Ensure we don't divide by zero by using a minimum of 1 question per section
        const rwTotalQuestions = Math.max(examResponses.filter(r => rwModules.some(m => m.id === r.moduleId)).length, 1);
        const mathTotalQuestions = Math.max(examResponses.filter(r => mathModules.some(m => m.id === r.moduleId)).length, 1);
        
        console.log('[ExamResults] Section score calculation:', {
            rwModules: rwModules.map(m => ({ id: m.id, title: m.title, number: m.moduleNumber })),
            mathModules: mathModules.map(m => ({ id: m.id, title: m.title, number: m.moduleNumber })),
            rwCorrect,
            mathCorrect,
            rwTotalQuestions,
            mathTotalQuestions
        });
        
        rwScore = Math.round((rwCorrect / rwTotalQuestions) * 800);
        mScore = Math.round((mathCorrect / mathTotalQuestions) * 800);
    }
    setReadingWritingScore(rwScore);
    setMathScore(mScore);

    if (examModules && examResponses) {
        console.log('[ExamResults] processAndSetExamData - examModules:', JSON.stringify(examModules, null, 2));
        console.log('[ExamResults] processAndSetExamData - examResponses:', JSON.stringify(examResponses, null, 2));
      const processedModules = processModuleData(examModules, examResponses);
      console.log('[ExamResults] processAndSetExamData - processedModules for review:', JSON.stringify(processedModules, null, 2));
      setModuleData(processedModules);
      
      // Identify weakest subcategories to recommend for adaptive quizzes
      const weakAreas = getWeakSubcategories(processedModules);
      console.log('[ExamResults] processAndSetExamData - Identified weak subcategories:', weakAreas);
      setWeakSubcats(weakAreas);
    } else {
        console.warn('[ExamResults] processAndSetExamData - Missing examModules or examResponses. Setting moduleData to empty array.');
        setModuleData([]);
    }
    setIsLoading(false);
  };
  
  useEffect(() => {
    setIsLoading(true);
    setPageError(null);
    
    const fetchExamData = async () => {
      try {
        let examData;
        
        // Case 1: URL includes an examId parameter - fetch that specific exam
        if (examId) {
          console.log(`[ExamResults] Fetching specific exam with ID: ${examId}`);
          examData = await getExamResultById(examId, true);  // true = include responses
          console.log('[ExamResults] Received exam data by ID:', JSON.stringify({
            hasData: !!examData,
            id: examId,
            overallScore: examData?.overallScore,
            totalQuestions: examData?.totalQuestions,
            correctAnswers: examData?.correctAnswers,
            responseCount: examData?.responses?.length,
            moduleCount: examData?.modules?.length
          }, null, 2));
          
          if (!examData) {
            setPageError("Exam result not found. The exam may have been deleted or you may not have permission to view it.");
            setIsLoading(false);
            return;
          }
        } 
        // Case 2: Check location state for an examId (e.g., passed from ExamController)
        else if (location?.state?.examId) {
          console.log(`[ExamResults] Fetching exam from location state: ${location.state.examId}`);
          examData = await getExamResultById(location.state.examId, true);
          
          if (!examData) {
            setPageError("Could not load the exam you just completed. Trying to load the latest exam instead.");
            // Fall through to Case 3
          } else {
            // Successfully loaded from location state
            console.log('Successfully loaded exam from location state');
          }
        }
        
        // Case 3: No examId specified - try to get latest exam from Firestore
        if (!examData && currentUser) {
          console.log('Attempting to fetch latest exam from Firestore');
          examData = await getLatestExamResult();
        }
        
        // Case 4: Fallback to localStorage (for backward compatibility)
        if (!examData) {
          console.log('No exam found in Firestore, falling back to localStorage');
          const savedAnswered = localStorage.getItem('examAnswered');
          const savedTotal = localStorage.getItem('examTotal');
          const responsesFromStorage = JSON.parse(localStorage.getItem('examResponses') || '[]');
          const allModulesFromStorage = JSON.parse(localStorage.getItem('examModules') || '[]');

          if (!savedAnswered || !savedTotal || responsesFromStorage.length === 0) {
            setPageError("No exam data found. Please complete an exam first.");
            setIsLoading(false);
            return;
          }
          
          const totalCorrect = parseInt(savedAnswered);
          const totalQuestions = parseInt(savedTotal);
          const rwResponses = responsesFromStorage.filter(r => r.moduleId <= 2);
          const mathResponses = responsesFromStorage.filter(r => r.moduleId > 2);
          
          // Calculate reading/writing and math scores
          const rwCorrect = rwResponses.filter(r => r.isCorrect).length;
          const mathCorrect = mathResponses.filter(r => r.isCorrect).length;
          const rwTotal = rwResponses.length || 1;
          const mathTotal = mathResponses.length || 1;
          
          const readingWritingScore = Math.round((rwCorrect / rwTotal) * 800);
          const mathScore = Math.round((mathCorrect / mathTotal) * 800);
          
          examData = {
            overallScore: Math.round((totalCorrect / totalQuestions) * 100),
            scores: { readingWriting: readingWritingScore, math: mathScore },
            correctAnswers: totalCorrect,
            totalQuestions: totalQuestions,
            responses: responsesFromStorage,
            modules: allModulesFromStorage,
            completedAt: new Date() // Current date as fallback
          };
        }
        
        // Process the exam data (from any source) and update state
        setExamDetails(examData);
        console.log('[ExamResults] Final examData before processing:', JSON.stringify({
          source: examId ? 'examId' : location?.state?.examId ? 'locationState' : currentUser ? 'latestFirestore' : 'localStorage',
          overallScore: examData.overallScore || 0,
          correctAnswers: examData.correctAnswers || 0,
          totalQuestions: examData.totalQuestions || 0,
          readingWritingScore: examData.scores?.readingWriting || 0,
          mathScore: examData.scores?.math || 0,
          hasResponses: !!examData.responses,
          responseCount: examData.responses?.length || 0,
          hasModules: !!examData.modules,
          moduleCount: examData.modules?.length || 0,
          // For brevity, not logging full modules/responses here again if they are large
          firstModuleTitle: examData.modules && examData.modules.length > 0 ? examData.modules[0].title : 'N/A',
          firstResponseQuestionId: examData.responses && examData.responses.length > 0 ? examData.responses[0].questionId : 'N/A'
        }, null, 2));
        
        // Set exam data into state variables
        const overallScore = examData.overallScore || 0;
        const correctAnswers = examData.correctAnswers || 0;
        const totalQuestions = examData.totalQuestions || 0;
        
        setScore(correctAnswers);
        setAnswered(correctAnswers);
        setTotal(totalQuestions);
        
        // Set section scores
        if (examData.scores) {
          setReadingWritingScore(examData.scores.readingWriting || 0);
          setMathScore(examData.scores.math || 0);
        }
        
        // Process module data for review
        if (examData.responses && examData.modules) {
          const responses = examData.responses;
          const modules = examData.modules;
          
          console.log('[ExamResults] Processing module data - modules:', modules);
          console.log('[ExamResults] Processing module data - responses:', responses);
          
          // Need to reformat the data for review panel
          const processedModules = processModuleData(modules, responses);
          console.log('[ExamResults] Processed modules result:', processedModules);
          setModuleData(processedModules);
        } else {
          console.warn('[ExamResults] Missing modules or responses data, setting empty moduleData');
          console.log('[ExamResults] examData.modules:', examData.modules);
          console.log('[ExamResults] examData.responses:', examData.responses);
          setModuleData([]);
        }
        
        // No need to call saveResultToFirebase if we just loaded from Firestore
        setSavedToFirebase(true);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading exam data:', error);
        setPageError('An error occurred while loading exam data. Please try again later.');
        setIsLoading(false);
      }
    };
    
    fetchExamData();
  }, [examId, location, currentUser, getExamResultById, getLatestExamResult]);

  const createDemoData = () => {
    console.log('Creating demo data as fallback...');
  }

  // This function is deprecated - exam results are now saved through AuthContext's saveComprehensiveExamResult
  const saveResultToFirebase = async (moduleId, score, total, responses) => {
    console.warn('saveResultToFirebase is deprecated - results should be saved through AuthContext');
    if (!currentUser || savedToFirebase) {
      return;
    }
    
    setSavingError('');
    console.warn('Legacy exam saving bypassed - this function should no longer be used');
    setSavedToFirebase(true);
    return;
  };

  const returnHome = () => {
    navigate('/');
  };

  const startNewExam = () => {
    navigate('/practice-exams');
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

  if (isLoading) {
    return <div className="loading-container"><div className="spinner"></div><p>Loading results...</p></div>;
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
      <div className={`results-content ${splitView ? 'split-view' : ''}`}>
        {savingError ? (
          <div className="error-message">
            <p>Error saving results: {savingError}</p>
            <p>Your results have not been saved to your account.</p>
          </div>
        ) : (
          <>
            <div className={`results-card ${splitView ? 'results-summary' : ''}`}>
              <h1>Exam Completed!</h1>
              
              <div className="score-circle">
                <div className="score-percentage">
                  <span className="percentage-value">
                    {readingWritingScore + mathScore}
                  </span>
                </div>
              </div>
              
              <div className="sat-score-summary">
                <h2>Your SAT Score: <span className="total-sat-score">{readingWritingScore + mathScore}</span>/1600</h2>
              </div>
              
              {/* Section Breakdown */}
              <div className="section-breakdown">
                <h2>Scores by Section</h2>
                <div className="section-columns">
                  <div className="section-column">
                    <h3>Reading & Writing</h3>
                    <div className="section-score">{readingWritingScore}/800</div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${(readingWritingScore/800)*100}%` }}></div>
                    </div>
                  </div>
                  
                  <div className="section-column">
                    <h3>Math</h3>
                    <div className="section-score">{mathScore}/800</div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${(mathScore/800)*100}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Module Review Section - Always show buttons */}
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
                  <p style={{ color: '#6c757d', fontStyle: 'italic', marginTop: '1rem' }}>
                    Module review is not available for this exam. This may be due to missing question data.
                  </p>
                )}
              </div>
              
              {!splitView && (
                <>
                  {/* Focus Areas section */}
                  {weakSubcats && weakSubcats.length > 0 && (
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
                  )}
                  
                  {/* Consolidated Action Buttons Section */}
                  <div className="action-buttons-container">
                    <div className="primary-actions">
                      <button className="primary-button" onClick={startNewExam}>
                        START A NEW EXAM
                      </button>
                    </div>
                    <div className="secondary-actions">
                      <button className="secondary-button" onClick={() => navigate('/all-results')}>
                        VIEW ALL EXAM RESULTS
                      </button>
                      <button className="secondary-button" onClick={returnHome}>
                        BACK TO HOME
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            {splitView && activeReviewModule !== null && (
              <button 
                className="back-arrow-button inter-panel-back-arrow"
                onClick={closeReviewPanel} 
                title="Back to Results Summary"
              >
                &lsaquo; 
              </button>
            )}
            
            {splitView && activeReviewModule !== null && (
              <div className="module-review-panel">
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
                    const response = activeReviewModule.responses?.find(
                      resp => resp.questionId === question.id
                    );

                    console.log(`[ExamResults] Reviewing Question ${questionIndex + 1} (ID: ${question.id}):`, question);
                    if (response) {
                        console.log(`[ExamResults] Found response for Question ${question.id}:`, response);
                    } else {
                        console.log(`[ExamResults] No response found for Question ${question.id} (Skipped).`);
                    }
                    
                    // Determine if the question was answered and if it was correct
                    const isAnswered = !!response;
                    const isCorrect = response?.isCorrect || false;

                    // Guard against undefined question or options
                    if (!question || !question.options) {
                      console.error(`[ExamResults] Invalid question object or missing options at index ${questionIndex}:`, question);
                      return (
                        <div key={`error-q-${questionIndex}`} className="question-container-review error">
                          <p>Error: Question data is incomplete for this item.</p>
                        </div>
                      );
                    }
                    
                    return (
                      <div key={question.id || questionIndex} className="question-container-review">
                        <div className="question-review-header">
                          <span className="question-number">Question {questionIndex + 1}</span>
                          <span className={`question-status ${!isAnswered ? 'not-answered' : isCorrect ? 'correct' : 'incorrect'}`}>
                            {!isAnswered ? 'Not Answered' : isCorrect ? 'Correct' : 'Incorrect'}
                          </span>
                        </div>
                        
                        <div className="question-text">{question.text}</div>
                        
                        {question.graphDescription && (
                          <div className="question-graph-description">
                            <h4>Graph Description:</h4>
                            <div className="graph-description-text">
                              {question.graphDescription}
                            </div>
                          </div>
                        )}
                        
                        {question.graphUrl && (
                          <div className="question-graph">
                            <img src={question.graphUrl} alt="Question Graph" />
                          </div>
                        )}
                        
                        <div className="question-options">
                          {question.options.map((optionText, optionIndex) => {
                            const userAnswer = response?.userAnswer;
                            // Check if the current option was the user's answer.
                            // This assumes userAnswer stores the text of the option or its index. Adjust if necessary.
                            // For this example, let's assume userAnswer is the option *text* if answered, or could be option *index*.
                            // We need to be careful here. The 'response' object has 'userAnswer' (string) and 'question.correctAnswer' (number/index).
                            // 'question.options' is an array of strings.

                            let isUserSelectedOption = false;
                            if (isAnswered) {
                                // If userAnswer is stored as the option text itself:
                                isUserSelectedOption = userAnswer === optionText;
                                // If userAnswer is stored as an index, it would be:
                                // isUserSelectedOption = parseInt(userAnswer) === optionIndex; 
                                // Or if it's the char 'A', 'B', etc.
                                // isUserSelectedOption = userAnswer === String.fromCharCode(65 + optionIndex);
                            }

                            const isCorrectOption = optionIndex === parseInt(question.correctAnswer);
                            
                            let backgroundColor = '#f9f9f9'; // Default for unselected options

                            if (isCorrectOption) {
                              // Highlight the correct answer regardless of user selection
                              backgroundColor = '#e0ffe0'; // Light green for correct option
                            }
                            
                            if (isUserSelectedOption) {
                              if (isCorrectOption) {
                                // User selected the correct answer (already light green)
                              } else {
                                // User selected an incorrect answer
                                backgroundColor = '#ffdddd'; // Light red for user's incorrect selection
                              }
                            } else if (!isCorrectOption && isAnswered) {
                                // If this option is not the correct one, and the user answered (meaning they picked *something* else)
                                // keep it default or slightly muted, unless it was picked by user (handled above).
                                // Default #f9f9f9 is fine.
                            }
                            
                            const optionStyle = {
                              padding: '10px 15px',
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              marginBottom: '8px',
                              backgroundColor: backgroundColor,
                              border: '1px solid #ddd'
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
                            <p>{question.explanation || `The correct answer is "${question.correctAnswer}". ${question.reasoning || ''}`}</p>
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
