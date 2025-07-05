import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  getPracticeExamById, 
  getPracticeExamModules 
} from '../firebase/services';
import { useAuth } from '../contexts/AuthContext';
import { useSidebar } from '../contexts/SidebarContext';
import ExamModule from '../components/ExamModule';
import '../styles/PracticeExamController.css';
import { getSubcategoryProgress, updateSubcategoryProgress } from '../utils/progressUtils';
import { inferLevelFromAccuracy } from '../utils/smartQuizUtils';
import IntermissionScreen from '../components/IntermissionScreen';
import ModuleLoadingScreen from '../components/ModuleLoadingScreen';

const PracticeExamController = () => {
  // ...existing hooks...
  const [moduleTransitionLoading, setModuleTransitionLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const { examId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, saveComprehensiveExamResult } = useAuth();
  const { setForceSidebarCollapsed, setSidebarHidden } = useSidebar();
  
  const [exam, setExam] = useState(null);
  const [modules, setModules] = useState([]);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [moduleResponses, setModuleResponses] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Track if the exam is in progress or completed
  const [examStatus, setExamStatus] = useState('loading'); // loading, intro, in-progress, intermission, completed
  
  // Load the practice exam and its modules
  useEffect(() => {
    const loadExam = async () => {
      try {
        setIsLoading(true);
        
        // Try to get cached exam data from session storage first
        const cachedExam = sessionStorage.getItem('currentPracticeExam');
        let examData;
        
        if (cachedExam) {
          const parsed = JSON.parse(cachedExam);
          if (parsed.examId === examId) {
            examData = parsed;
          }
        }
        
        // If no cached data, fetch from Firebase
        if (!examData) {
          const fetchedExam = await getPracticeExamById(examId);
          examData = fetchedExam;
        }
        
        setExam(examData);
        
        // Fetch the modules for this exam
        const examModules = await getPracticeExamModules(examId);

        // Sort modules by moduleNumber
        const sortedModules = [...examModules].sort((a, b) => {
          const numA = a.moduleNumber || Infinity; // Assign a large number if moduleNumber is missing
          const numB = b.moduleNumber || Infinity;
          return numA - numB;
        });

        setModules(sortedModules);
        
        // Initialize module responses using sorted modules
        const initialResponses = {};
        sortedModules.forEach(module => {
          initialResponses[module.id] = {
            answers: {},
            crossedOut: {},
            completionTime: 0,
            moduleId: module.id
          };
        });
        setModuleResponses(initialResponses);
        
        setIsLoading(false);
        if (location.state?.startExam) {
          handleStartExam();
        } else {
          setExamStatus('intro');
        }
      } catch (err) {
        setError('Failed to load practice exam: ' + err.message);
        setIsLoading(false);
      }
    };
    
    loadExam();
  }, [examId]);
  
  // Force sidebar to collapse when practice exam loads
  useEffect(() => {
    // Force sidebar to collapse when entering practice exam
    setForceSidebarCollapsed(true);
    
    // Restore sidebar state when leaving practice exam
    return () => {
      setForceSidebarCollapsed(false);
    };
  }, [setForceSidebarCollapsed]);
  
  // Handle starting the exam
  const handleStartExam = () => {
    setExamStatus('in-progress');
    setCurrentModuleIndex(0);
    // Hide sidebar completely during exam
    setSidebarHidden(true);
  };
  
  const handleIntermissionComplete = () => {
    if (currentModuleIndex < modules.length - 1) {
      setCurrentModuleIndex(currentModuleIndex + 1);
      setExamStatus('in-progress');
    } else {
      setExamStatus('completed');
      setSidebarHidden(false);
    }
  };

  // Handle module completion
  const handleModuleComplete = async (moduleResults) => {
    setModuleTransitionLoading(true);
    const currentModule = modules[currentModuleIndex];
    const moduleId = currentModule.id;
    
    console.log('PracticeExamController: Module complete:', moduleId, 'Results summary:', {
      moduleNumber: moduleResults.moduleNumber,
      answersCount: Array.isArray(moduleResults.answers) ? moduleResults.answers.length : Object.keys(moduleResults.answers).length,
      questionsCount: moduleResults.questions ? moduleResults.questions.length : 0
    });
    
    // Save module results
    setModuleResponses(prev => ({
      ...prev,
      [moduleId]: moduleResults
    }));

    // Record progress for each question in the completed module
    if (currentUser && currentUser.uid && moduleResults.questions && moduleResults.answers) {
      try {
        const { questions: moduleQuestions, answers: userAnswersFromModule } = moduleResults;
        
        console.log('PracticeExamController: Processing progress for', moduleQuestions.length, 'questions');
        
        // Aggregate results by subcategory
        const subcategoryResultsMap = {};

        moduleQuestions.forEach((question, index) => {
          const userAnswer = Array.isArray(userAnswersFromModule) ? userAnswersFromModule[index] : userAnswersFromModule[index];
          if (userAnswer === undefined || userAnswer === null) {
            console.log(`PracticeExamController: Question ${index} skipped - no answer provided`);
            return; // Skip unanswered or questions without subcategory
          }
          
          if (!question.subcategoryId) {
            console.log(`PracticeExamController: Question ${index} skipped - no subcategoryId`);
            return;
          }

          const subId = question.subcategoryId;
          if (!subcategoryResultsMap[subId]) {
            subcategoryResultsMap[subId] = {
              newAskedQuestions: [],
              questionResults: {},
              correctCount: 0,
              totalCount: 0
            };
          }

          // Determine correctness based on question type
          let isCorrect = false;
          let questionType = question.questionType;
          
          // Smart detection if questionType not specified
          if (!questionType) {
            if (!question.options || !Array.isArray(question.options) || question.options.length === 0) {
              questionType = 'user-input';
            } else {
              questionType = 'multiple-choice';
            }
          }
          
          if (questionType === 'multiple-choice') {
            // Multiple choice question handling
            if (question.options && question.correctAnswer !== undefined) {
              // Check if correctAnswer is an index or direct value match if options are simple values
              if (typeof question.correctAnswer === 'number' || !isNaN(parseInt(question.correctAnswer))) {
                   isCorrect = userAnswer === question.options[parseInt(question.correctAnswer)];
              } else if (typeof question.correctAnswer === 'string' && question.correctAnswer.length === 1 && /[A-D]/i.test(question.correctAnswer)){
                   const letterIndex = question.correctAnswer.toUpperCase().charCodeAt(0) - 65;
                   isCorrect = userAnswer === question.options[letterIndex];
              } else {
                  // Fallback for direct value match if correctAnswer isn't a typical index/letter
                  isCorrect = userAnswer === question.correctAnswer;
              }
            } else if (question.answer !== undefined) { // Fallback if structure is different, e.g., direct answer field
              isCorrect = userAnswer === question.answer;
            }
          } else if (questionType === 'user-input') {
            // User input question handling
            if (question.correctAnswer !== undefined) {
              // Direct comparison with correct answer
              isCorrect = userAnswer === question.correctAnswer;
              
              // Also check against accepted answers if available
              if (!isCorrect && question.acceptedAnswers && Array.isArray(question.acceptedAnswers)) {
                isCorrect = question.acceptedAnswers.includes(userAnswer);
              }
              
              // For number inputs, handle different formats
              if (!isCorrect && question.inputType === 'number') {
                const userNum = parseFloat(userAnswer);
                const correctNum = parseFloat(question.correctAnswer);
                if (!isNaN(userNum) && !isNaN(correctNum)) {
                  isCorrect = Math.abs(userNum - correctNum) < 0.0001;
                }
                
                // Check accepted answers as numbers too
                if (!isCorrect && question.acceptedAnswers) {
                  isCorrect = question.acceptedAnswers.some(accepted => {
                    const acceptedNum = parseFloat(accepted);
                    return !isNaN(acceptedNum) && Math.abs(userNum - acceptedNum) < 0.0001;
                  });
                }
              }
            }
          }
          
          console.log(`PracticeExamController: Question ${index}, SubID: ${subId}, Correct: ${isCorrect}`);
          
          subcategoryResultsMap[subId].newAskedQuestions.push(question.id);
          subcategoryResultsMap[subId].questionResults[question.id] = isCorrect;
          subcategoryResultsMap[subId].totalCount++;
          if (isCorrect) {
            subcategoryResultsMap[subId].correctCount++;
          }
        });

        console.log(`PracticeExamController: Processed results for ${Object.keys(subcategoryResultsMap).length} subcategories`);

        // Call updateSubcategoryProgress for each affected subcategory
        for (const [subcategoryId, data] of Object.entries(subcategoryResultsMap)) {
          if (data.totalCount > 0) {
            try {
              const currentProgress = await getSubcategoryProgress(currentUser.uid, subcategoryId);
              const scoreForThisBatch = (data.correctCount / data.totalCount) * 100;
              
              let levelToStore;
              if (currentProgress && currentProgress.exists) {
                levelToStore = currentProgress.level;
              } else {
                // No existing progress, so infer initial level from this exam's score
                levelToStore = inferLevelFromAccuracy(scoreForThisBatch);
              }

              console.log(`PracticeExamController: Updating progress for subcategory ${subcategoryId}`, {
                level: levelToStore,
                score: scoreForThisBatch,
                passed: false,
                newAskedQuestions: data.newAskedQuestions.length,
                quizStats: { correct: data.correctCount, total: data.totalCount },
                questionResultsCount: Object.keys(data.questionResults).length
              });

              await updateSubcategoryProgress(
                currentUser.uid,
                subcategoryId,
                levelToStore,
                scoreForThisBatch,
                false,
                data.newAskedQuestions,
                { correct: data.correctCount, total: data.totalCount },
                data.questionResults
              );
              
              console.log(`PracticeExamController: Successfully updated progress for subcategory ${subcategoryId}`);
            } catch (subcategoryError) {
              console.error(`PracticeExamController: Error updating progress for subcategory ${subcategoryId}:`, subcategoryError);
              // Continue with other subcategories even if one fails
            }
          }
        }

      } catch (error) {
        console.error('PracticeExamController: Error processing module results for subcategory progress update:', error);
        // Don't let progress tracking errors block the exam flow
      }
    }

    // Move to the next module, show intermission, or complete the exam
    const moduleNumber = currentModule.moduleNumber;
    if (moduleNumber === 2 && currentModuleIndex < modules.length - 1) {
      setExamStatus('intermission');
      setModuleTransitionLoading(false);
    } else if (currentModuleIndex < modules.length - 1) {
      setCurrentModuleIndex(currentModuleIndex + 1);
      setModuleTransitionLoading(false);
    } else {
      // All modules are completed
      setLoadingMessage('Computing the results...');
      setExamStatus('completed');
      // Show sidebar again when exam is finished
      setSidebarHidden(false);
      
      // Save the comprehensive result
      await handleViewResults();
      setModuleTransitionLoading(false);
    }
  };
  
  // Handle exam completion and navigate to results
  const handleViewResults = async () => {
    console.log('Processing results for Practice Exam:', examId);
    
    // Process exam results to calculate overall score
    let totalCorrect = 0;
    let totalQuestions = 0;
    let allResponses = [];
    let readingWritingCorrect = 0;
    let readingWritingTotal = 0;
    let mathCorrect = 0; 
    let mathTotal = 0;
    
    // Process each module's responses
    Object.entries(moduleResponses).forEach(([moduleId, moduleData]) => {
      const module = modules.find(m => m.id === moduleId);
      if (!module || !module.questions) return;
      
      // Determine if this is a reading/writing or math module
      // Usually modules 1-2 are Reading/Writing, 3-4 are Math
      const isReadingWritingModule = 
        (module.moduleNumber && module.moduleNumber <= 2) || 
        (module.title && module.title.toLowerCase().includes('reading'));
      
      // Count correct answers
      module.questions.forEach((question, index) => {
        const userAnswer = moduleData.answers[index];
        if (userAnswer === undefined || userAnswer === null) return; // Skip unanswered questions
        
        // Check if answer is correct based on question type
        const correctAnswer = question.correctAnswer !== undefined ? question.correctAnswer : question.answer;
        let questionType = question.questionType;
        
        // Smart detection if questionType not specified
        if (!questionType) {
          if (!question.options || !Array.isArray(question.options) || question.options.length === 0) {
            questionType = 'user-input';
          } else {
            questionType = 'multiple-choice';
          }
        }
        
        let isCorrect = false;
        
        if (questionType === 'multiple-choice') {
          // Multiple choice question handling
          if (question.options && question.correctAnswer !== undefined) {
            // Check if correctAnswer is an index or direct value match if options are simple values
            if (typeof question.correctAnswer === 'number' || !isNaN(parseInt(question.correctAnswer))) {
                 isCorrect = userAnswer === question.options[parseInt(question.correctAnswer)];
            } else if (typeof question.correctAnswer === 'string' && question.correctAnswer.length === 1 && /[A-D]/i.test(question.correctAnswer)){
                 const letterIndex = question.correctAnswer.toUpperCase().charCodeAt(0) - 65;
                 isCorrect = userAnswer === question.options[letterIndex];
            } else {
                // Fallback for direct value match if correctAnswer isn't a typical index/letter
                isCorrect = userAnswer === question.correctAnswer;
            }
          } else if (question.answer !== undefined) { // Fallback if structure is different, e.g., direct answer field
            isCorrect = userAnswer === question.answer;
          }
        } else if (questionType === 'user-input') {
          // User input question handling
          if (question.correctAnswer !== undefined) {
            // Direct comparison with correct answer
            isCorrect = userAnswer === question.correctAnswer;
            
            // Also check against accepted answers if available
            if (!isCorrect && question.acceptedAnswers && Array.isArray(question.acceptedAnswers)) {
              isCorrect = question.acceptedAnswers.includes(userAnswer);
            }
            
            // For number inputs, handle different formats
            if (!isCorrect && question.inputType === 'number') {
              const userNum = parseFloat(userAnswer);
              const correctNum = parseFloat(question.correctAnswer);
              if (!isNaN(userNum) && !isNaN(correctNum)) {
                isCorrect = Math.abs(userNum - correctNum) < 0.0001;
              }
              
              // Check accepted answers as numbers too
              if (!isCorrect && question.acceptedAnswers) {
                isCorrect = question.acceptedAnswers.some(accepted => {
                  const acceptedNum = parseFloat(accepted);
                  return !isNaN(acceptedNum) && Math.abs(userNum - acceptedNum) < 0.0001;
                });
              }
            }
          }
        }
        
        // Count correct answers by section
        if (isCorrect) {
          totalCorrect++;
          if (isReadingWritingModule) {
            readingWritingCorrect++;
          } else {
            mathCorrect++;
          }
        }
        
        // Count total questions by section
        totalQuestions++;
        if (isReadingWritingModule) {
          readingWritingTotal++; 
        } else {
          mathTotal++;
        }
        
        // Create detailed response object for question review in the format expected by our new system
        const subcategory = question.subcategory || '';
        const subcategoryId = question.subcategoryId || null;
        const category = question.category || (isReadingWritingModule ? 'reading-writing' : 'math');
        const mainCategory = question.mainCategory || category;
        
        allResponses.push({
          question: {
            ...question,
            id: question.id || `practice-${moduleId}-q-${index}`
          },
          questionId: question.id || `practice-${moduleId}-q-${index}`,
          userAnswer, // User's answer
          correctAnswer, // The correct answer
          isCorrect, // Whether user got it correct
          moduleId, // Which module this belongs to
          timeSpent: 60 + Math.floor(Math.random() * 60), // Default time spent
          subcategory,
          subcategoryId,
          category,
          mainCategory,
          timestamp: new Date().toISOString()
        });
      });
    });
    
    // Calculate score as percentage
    const percentageScore = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
    
    // Calculate scaled section scores (for SAT-like 800 scale per section)
    const readingWritingScore = Math.round((200 + (readingWritingCorrect / (readingWritingTotal || 1)) * 600) / 10) * 10;
    const mathScore = Math.round((200 + (mathCorrect / (mathTotal || 1)) * 600) / 10) * 10;
    
    console.log('Calculated scores:', {
      percentageScore, 
      totalCorrect, 
      totalQuestions,
      readingWritingScore,
      mathScore
    });
    
    // Save to localStorage for backward compatibility
    localStorage.setItem('examScore', percentageScore);
    localStorage.setItem('examAnswered', totalCorrect);
    localStorage.setItem('examTotal', totalQuestions);
    localStorage.setItem('examResponses', JSON.stringify(allResponses));
    localStorage.setItem('examModules', JSON.stringify(modules));
    
    // Create a timestamp for the current date
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
    
    // Create the summary object for the exam in the new format
    const examSummary = {
      examTitle: exam && exam.title ? `${exam.title} - ${dateStr}` : `Practice Exam - ${dateStr}`,
      overallScore: percentageScore,
      scores: {
        readingWriting: readingWritingScore,
        math: mathScore
      },
      totalQuestions,
      correctAnswers: totalCorrect,
      practiceExamId: examId,
      modules: modules.map(module => ({
        id: module.id,
        title: module.title,
        moduleNumber: module.moduleNumber,
        calculatorAllowed: module.calculatorAllowed
      }))
    };
    
    // Save to Firestore if user is logged in
    if (currentUser && saveComprehensiveExamResult) {
      try {
        console.log('Saving practice exam result to Firestore');
        const savedExam = await saveComprehensiveExamResult(examSummary, allResponses);
        console.log('Practice exam saved with ID:', savedExam.id);
        
        // Navigate to results with the new exam ID
        navigate(`/exam/results/${savedExam.id}`, {
          state: { examId: savedExam.id, fromExam: true }
        });
        return;
      } catch (error) {
        console.error('Error saving exam to Firestore:', error);
        // Fall back to localStorage method if save fails
      }
    }
    
    // Fallback: Navigate to generic results page (old method)
    navigate('/exam/results');
  };
  
  // Handle going back to exam list
  const handleBackToList = () => {
    // Restore sidebar when leaving exam
    setSidebarHidden(false);
    navigate('/practice-exams');
  };
  
  // Calculate total exam stats
  const calculateExamStats = () => {
    return modules.reduce((acc, module) => {
      const questionCount = module.questionCount || (module.questionIds ? module.questionIds.length : 0);
      const timeLimit = module.timeLimit || 1920; // Default to 32 minutes if not specified
      
      return {
        totalQuestions: acc.totalQuestions + questionCount,
        totalTime: acc.totalTime + timeLimit
      };
    }, { totalQuestions: 0, totalTime: 0 });
  };

  // Format time in minutes
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} minutes`;
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <div className="practice-exam-controller loading-state">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading practice exam...</p>
        </div>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div className="practice-exam-controller error-state">
        <div className="error-container">
          <h1>Error</h1>
          <p className="error-message">{error}</p>
          <button 
            className="primary-button"
            onClick={handleBackToList}
          >
            Back to Exam List
          </button>
        </div>
      </div>
    );
  }
  
  // Render exam intro
  if (examStatus === 'intro' && exam) {
    const { totalQuestions, totalTime } = calculateExamStats();
    
    return (
      <div className="practice-exam-controller intro-state">
        <div className="intro-container">
          <h1>{exam.title}</h1>
          <div className="exam-description">{exam.description}</div>
          
          <div className="exam-overview">
            <div className="overview-stats">
              <div className="stat-item">
                <span className="stat-value">{modules.length}</span>
                <span className="stat-label">Modules</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{totalQuestions}</span>
                <span className="stat-label">Questions</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{Math.floor(totalTime / 60)}</span>
                <span className="stat-label">Minutes</span>
              </div>
            </div>
          </div>
          
          <div className="modules-preview">
            <h2>Exam Modules</h2>
            <div className="module-list">
              {modules.map((module, index) => (
                <div key={module.id} className="module-preview-item">
                  <div className="module-number">{module.moduleNumber}</div>
                  <div className="module-info">
                    <h3>{module.title}</h3>
                    <div className="module-details">
                      <span>{module.questionCount || (module.questionIds ? module.questionIds.length : 0)} questions</span>
                      <span>{formatTime(module.timeLimit || 1920)}</span>
                      <span>{module.calculatorAllowed ? 'Calculator allowed' : 'No calculator'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="exam-instructions">
            <h2>Exam Instructions</h2>
            <ul>
              <li>This practice exam consists of {modules.length} modules that must be completed in order.</li>
              <li>Once you start a module, the timer will begin and you must complete it before moving to the next module.</li>
              <li>You will see your results after completing all modules.</li>
              <li>The entire exam will take approximately {Math.floor(totalTime / 60)} minutes to complete.</li>
            </ul>
          </div>
          
          <div className="intro-actions">
            <button 
              className="secondary-button"
              onClick={handleBackToList}
            >
              Back to Exam List
            </button>
            <button 
              className="primary-button"
              onClick={handleStartExam}
            >
              Start Exam
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Render intermission screen
  if (examStatus === 'intermission') {
    return (
      <IntermissionScreen 
        onIntermissionComplete={handleIntermissionComplete} 
      />
    );
  }

  // Render loading screen between modules
  if (moduleTransitionLoading) {
    return <ModuleLoadingScreen message={loadingMessage} />;
  }

  // Render exam in progress (current module)
  if (examStatus === 'in-progress' && modules.length > 0) {
    const currentModule = modules[currentModuleIndex];
    
    return (
      <div className="practice-exam-controller module-state">
        <ExamModule
          moduleNumber={currentModule.moduleNumber}
          moduleTitle={currentModule.title}
          questions={currentModule.questions || []}
          userAnswers={moduleResponses[currentModule.id]?.answers || {}}
          crossedOut={moduleResponses[currentModule.id]?.crossedOut || {}}
          onModuleComplete={handleModuleComplete}
          calculatorAllowed={currentModule.calculatorAllowed}
        />
      </div>
    );
  }
  
  // Render exam completed
  if (examStatus === 'completed') {
    return (
      <div className="practice-exam-controller completed-state">
        <div className="completion-container">
          <div className="completion-header">
            <div className="completion-icon">✓</div>
            <h1>Practice Exam Completed!</h1>
            <p>You have completed all modules in this practice exam.</p>
          </div>
          
          <div className="completion-summary">
            <div className="summary-stats">
              <div className="stat-item">
                <span className="stat-value">{modules.length}</span>
                <span className="stat-label">Modules Completed</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{calculateExamStats().totalQuestions}</span>
                <span className="stat-label">Questions Answered</span>
              </div>
            </div>
          </div>
          
          <div className="completion-actions">
            <button 
              className="secondary-button"
              onClick={handleBackToList}
            >
              Back to Exam List
            </button>
            <button 
              className="primary-button"
              onClick={handleViewResults}
            >
              View Results
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Fallback
  return null;
};

export default PracticeExamController;
