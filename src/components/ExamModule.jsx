import React, { useState, useEffect } from 'react';
import { useNavigate, useBlocker } from 'react-router-dom';
import Header from './Header';
import Question from './Question';
import Footer from './Footer';
import QuestionTracker from './QuestionTracker';
import { enrichQuestionsWithNewCategories, ensureQuestionsHaveSubcategoryIds } from '../utils/categoryUtils';
import '../styles/App.css';
import '../styles/Transitions.css';
import FullscreenModal from './FullscreenModal';
import ConfirmationModal from './ConfirmationModal';
import ReportQuestionModal from './ReportQuestionModal';
import { reportQuestion } from '../api/reportClient';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFlag } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import useIsMobile from '../hooks/useIsMobile';

function ExamModule({ 
  moduleNumber, 
  moduleTitle, 
  questions, 
  userAnswers, 
  crossedOut, 
  onModuleComplete,
  calculatorAllowed = false,
  initialQuestionIndex = 0,
  initialTimeRemaining = 32 * 60,
  onSaveProgress
}) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // Always start from question 0 when a module loads
  // Determine whether to show fullscreen modal for this module (only modules 1 and 3)
  const moduleNumForModal = parseInt(moduleNumber, 10);
  const shouldShowFullscreenPrompt = moduleNumForModal === 1 || moduleNumForModal === 3;
  const [currentQuestion, setCurrentQuestion] = useState(initialQuestionIndex || 0);
  const [selectedAnswer, setSelectedAnswer] = useState(Array.isArray(userAnswers) ? userAnswers[0] : (userAnswers[0] || ''));
  const [timeRemaining, setTimeRemaining] = useState(initialTimeRemaining || 32 * 60); // allow resume
  const [isModalOpen, setIsModalOpen] = useState(shouldShowFullscreenPrompt);
  const [timerRunning, setTimerRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [clockVisible, setClockVisible] = useState(true);
  const [showCrossOut, setShowCrossOut] = useState(false);
  const [localCrossedOut, setLocalCrossedOut] = useState(crossedOut || {});
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  // Handle both array and object answer formats
  const [updatedAnswers, setUpdatedAnswers] = useState(
    Array.isArray(userAnswers)
      ? [...userAnswers]
      : (userAnswers && typeof userAnswers === 'object' ? { ...userAnswers } : {})
  );
  const [markedForReview, setMarkedForReview] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);

  // Report modal state
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);

  // Block navigation when exam is in progress
  const blocker = useBlocker(timerRunning);

  useEffect(() => {
    if (blocker.state === 'blocked') {
      setIsExitModalOpen(true);
    }
  }, [blocker]);

  // Sync selectedAnswer with the current question's stored answer
  useEffect(() => {
    const newAnswer = updatedAnswers[currentQuestion] || '';
    setSelectedAnswer(newAnswer);
  }, [currentQuestion, updatedAnswers]);
  
  // Animation states
  const [moduleAnimation, setModuleAnimation] = useState('fade-in');

  // Enrich questions with skill tags based on categories
  const [enrichedQuestions, setEnrichedQuestions] = useState([]);

  // Debug logging, question enrichment, and entrance animation
  useEffect(() => {
    
    // Enrich questions with subcategory IDs based on their categories
    const withCategories = enrichQuestionsWithNewCategories(questions);
    // Ensure all questions have proper subcategory IDs
    const enriched = ensureQuestionsHaveSubcategoryIds(withCategories);
    
    // Ensure IDs are preserved - create new objects with spread to avoid reference issues
    const enrichedWithIds = enriched.map((q, index) => ({
      ...q,
      id: q.id || `temp-${moduleNumber}-q-${index}` // Ensure every question has an ID
    }));
    
    setEnrichedQuestions(enrichedWithIds);
    
    
    // Reset to initial question when module loads (supports resume)
    const initIndex = initialQuestionIndex || 0;
    setCurrentQuestion(initIndex);
    if (userAnswers) {
      const initialAns = Array.isArray(userAnswers)
        ? userAnswers[initIndex]
        : userAnswers[initIndex];
      setSelectedAnswer(initialAns || '');
    } else {
      setSelectedAnswer('');
    }
    
    // Start with entrance animation
    setModuleAnimation('fade-in');
    setTimeout(() => {
      setModuleAnimation('');  // Remove animation class after it completes
    }, 1000);
  }, [moduleNumber, questions]);

  // Ensure modal visibility is recalculated when the module changes
  useEffect(() => {
    setIsModalOpen(shouldShowFullscreenPrompt);
  }, [shouldShowFullscreenPrompt]);

  // Sync updatedAnswers when userAnswers prop changes (e.g., resume from saved progress)
  useEffect(() => {
    if (Array.isArray(userAnswers)) {
      setUpdatedAnswers([...userAnswers]);
    } else if (userAnswers && typeof userAnswers === 'object') {
      setUpdatedAnswers({ ...userAnswers });
    } else {
      setUpdatedAnswers({});
    }
  }, [userAnswers]);

  // Sync crossed-out state when prop changes (e.g., resume from saved progress)
  useEffect(() => {
    setLocalCrossedOut(crossedOut || {});
  }, [crossedOut]);

  // Timer logic
  useEffect(() => {
    let timer;
    if (timerRunning && !isPaused && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            completeModule();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timeRemaining <= 0) {
      completeModule();
    }
    return () => clearInterval(timer);
  }, [timerRunning, isPaused]);

  // Pause timer when modal is open
  useEffect(() => {
    setTimerRunning(!isModalOpen);
  }, [isModalOpen]);

  // Fullscreen logic
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isNowFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isNowFullscreen);
      
      // When entering fullscreen on mobile, lock orientation to landscape
      if (isNowFullscreen && isMobile && window.screen.orientation && window.screen.orientation.lock) {
        window.screen.orientation.lock('landscape').catch((error) => {
          console.log('Orientation lock failed:', error);
        });
      }
      
      // When exiting fullscreen on mobile, unlock orientation
      if (!isNowFullscreen && isMobile && window.screen.orientation && window.screen.orientation.unlock) {
        window.screen.orientation.unlock();
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      // Unlock orientation when component unmounts
      if (isMobile && window.screen.orientation && window.screen.orientation.unlock) {
        window.screen.orientation.unlock();
      }
    };
  }, [isMobile]);

  // Prevent accidental tab closing
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      // This logic should only run when an exam is in progress.
      if (timerRunning) {
        e.preventDefault();
        // Modern browsers require this to be set.
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [timerRunning]);

  // Update selected answer when current question changes
  useEffect(() => {
    if (updatedAnswers) {
      const answer = Array.isArray(updatedAnswers) 
        ? updatedAnswers[currentQuestion] 
        : updatedAnswers[currentQuestion];
      setSelectedAnswer(answer || '');
    } else {
      setSelectedAnswer('');
    }
  }, [currentQuestion, updatedAnswers]);

  // Toggle the clock visibility
  const toggleClock = () => setClockVisible(!clockVisible);

  // Toggle pause functionality
  const togglePause = () => setIsPaused(!isPaused);

  // Toggle cross-out functionality
  const toggleCrossOut = () => setShowCrossOut(!showCrossOut);

  // Toggle tracker
  const toggleTracker = () => {
    setIsTrackerOpen(prevState => !prevState);
  };

  // Toggle mark for review
  const toggleMarkedForReview = () => {
    console.log('Toggle marked for review for question:', currentQuestion);
    setMarkedForReview(prev => {
      if (prev.includes(currentQuestion)) {
        // If already marked, remove it from the array
        return prev.filter(q => q !== currentQuestion);
      } else {
        // Otherwise add it to the array
        return [...prev, currentQuestion];
      }
    });
  };

  // Handle crossing out an option
  const toggleCrossOutOption = (questionIndex, option) => {
    const key = `${questionIndex}-${option}`;
    setLocalCrossedOut(prev => {
      const updated = { ...prev };
      updated[key] = !updated[key];
      return updated;
    });
  };

  // Get crossed out status for current question
  const getCurrentQuestionCrossedOut = () => {
    const result = {};
    ['A', 'B', 'C', 'D'].forEach(letter => {
      const key = `${currentQuestion}-${letter}`;
      result[letter] = localCrossedOut[key] || false;
    });
    return result;
  };

  // Handle moving to the next question or finishing the module
  const nextQuestion = () => {
    // Save current answer
    if (Array.isArray(updatedAnswers)) {
      const newAnswers = [...updatedAnswers];
      newAnswers[currentQuestion] = selectedAnswer;
      setUpdatedAnswers(newAnswers);
    } else {
      // Object format
      setUpdatedAnswers(prev => ({
        ...prev,
        [currentQuestion]: selectedAnswer
      }));
    }
    
    // Move to next question if not at the end
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // If this is the last question and the user clicks Finish, complete the module
      completeModule();
    }
  };

  // Handle moving to the previous question
  const prevQuestion = () => {
    // Save current answer
    if (Array.isArray(updatedAnswers)) {
      const newAnswers = [...updatedAnswers];
      newAnswers[currentQuestion] = selectedAnswer;
      setUpdatedAnswers(newAnswers);
    } else {
      // Object format
      setUpdatedAnswers(prev => ({
        ...prev,
        [currentQuestion]: selectedAnswer
      }));
    }
    
    // Move to previous question if not at the beginning
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  // Jump to a specific question
  const jumpToQuestion = (questionIndex) => {
    // Save current answer
    if (Array.isArray(updatedAnswers)) {
      const newAnswers = [...updatedAnswers];
      newAnswers[currentQuestion] = selectedAnswer;
      setUpdatedAnswers(newAnswers);
    } else {
      // Object format
      setUpdatedAnswers(prev => ({
        ...prev,
        [currentQuestion]: selectedAnswer
      }));
    }
    
    // Jump to specified question
    setCurrentQuestion(questionIndex);
    setIsTrackerOpen(false);
  };

  // Complete the current module
  const completeModule = () => {
    console.log('Completing module:', moduleNumber);
    // Ensure moduleNumber is treated as an integer
    const moduleNum = parseInt(moduleNumber, 10);
    
    // Save current answer
    let finalAnswers;
    if (Array.isArray(updatedAnswers)) {
      const newAnswers = [...updatedAnswers];
      newAnswers[currentQuestion] = selectedAnswer;
      setUpdatedAnswers(newAnswers);
      finalAnswers = newAnswers;
    } else {
      // Object format
      const newAnswers = {
        ...updatedAnswers,
        [currentQuestion]: selectedAnswer
      };
      setUpdatedAnswers(newAnswers);
      finalAnswers = newAnswers;
    }
    
    // Stop the timer
    setTimerRunning(false);
    
    // Animate transition out before completing
    setModuleAnimation('fade-out');
    
    setTimeout(() => {
      // Call the completion handler with updated answers and crossed out options
      console.log('Calling onModuleComplete with data:', {
        moduleNumber: moduleNum,
        answersCount: Array.isArray(finalAnswers) ? finalAnswers.length : Object.keys(finalAnswers).length,
        crossedOutCount: Object.keys(localCrossedOut).length
      });
      
      // Submit the completed module data
      onModuleComplete({
        moduleNumber: moduleNum,
        answers: finalAnswers,
        crossedOut: localCrossedOut,
        questions: enrichedQuestions
      });
    }, 1000);
  };

  // Handle selecting an answer
  const handleSelectAnswer = (answer) => {
    setSelectedAnswer(answer);
    
    // Auto-save the answer
    if (Array.isArray(updatedAnswers)) {
      const newAnswers = [...updatedAnswers];
      newAnswers[currentQuestion] = answer;
      setUpdatedAnswers(newAnswers);
    } else {
      // Object format
      setUpdatedAnswers(prev => ({
        ...prev,
        [currentQuestion]: answer
      }));
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSwitchFullscreen = () => {
    setIsModalOpen(false);
    // Fullscreen is handled inside the modal component
  };

  const handleExitExamClick = () => {
    // Open exit confirmation and pause timer to avoid navigation blocker
    setIsExitModalOpen(true);
    setTimerRunning(false);
  };

  const handleCloseExitModal = () => {
    setIsExitModalOpen(false);
    if (blocker.state === 'blocked') {
      blocker.reset();
    }
    // Resume timer if user cancels exit
    setTimerRunning(true);
  };

  const handleConfirmExit = async () => {
    // Exit fullscreen if currently in fullscreen mode
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen();
    }
    // Ensure blocker is disabled before navigating
    setTimerRunning(false);

    // Persist current progress if handler is provided
    try {
      if (typeof onSaveProgress === 'function') {
        // Snapshot current answers including current selection
        let finalAnswers;
        if (Array.isArray(updatedAnswers)) {
          const newAnswers = [...updatedAnswers];
          newAnswers[currentQuestion] = selectedAnswer;
          finalAnswers = newAnswers;
        } else {
          finalAnswers = {
            ...updatedAnswers,
            [currentQuestion]: selectedAnswer
          };
        }
        await onSaveProgress({
          moduleNumber: parseInt(moduleNumber, 10),
          answers: finalAnswers,
          crossedOut: localCrossedOut,
          currentQuestionIndex: currentQuestion,
          timeRemaining
        });
      }
    } catch (e) {
      console.error('Failed to save progress on exit:', e);
    }
    if (blocker.state === 'blocked') {
      blocker.proceed();
    } else {
      navigate('/practice-exams');
    }
    setIsExitModalOpen(false);
  };

  // Report question handler
  const handleReportQuestion = async (reason) => {
    setReportLoading(true);
    try {
      const currentQuestionData = enrichedQuestions[currentQuestion];
      await reportQuestion(currentQuestionData.id, `exam-${moduleNumber}`, reason);
      toast.success('Question reported successfully. Thank you for your feedback!');
      setIsReportModalOpen(false);
    } catch (error) {
      console.error('Error reporting question:', error);
      toast.error(error.message || 'Failed to report question. Please try again.');
    } finally {
      setReportLoading(false);
    }
  };

  return (
    <div className={`app ${moduleAnimation}`}>
      <FullscreenModal
        isOpen={isModalOpen}
        onSwitch={handleSwitchFullscreen}
        onClose={handleCloseModal}
      />

      <ConfirmationModal
        isOpen={isExitModalOpen}
        onClose={handleCloseExitModal}
        onConfirm={handleConfirmExit}
        title="Exit Exam?"
        message="Are you sure you want to leave the exam? Your progress will be saved and you can resume later."
      />

      <ReportQuestionModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onReport={handleReportQuestion}
        loading={reportLoading}
      />

      <Header
        sectionTitle={moduleTitle}
        timeRemaining={timeRemaining}
        clockVisible={clockVisible}
        toggleClock={toggleClock}
        isPaused={isPaused}
        togglePause={togglePause}
        isFullscreen={isFullscreen}
        toggleFullscreen={toggleFullscreen}
        onReportQuestion={() => setIsReportModalOpen(true)}
      />
      
      <div className="main-content">
        {/* Tools container removed since we're using the button in the Question component */}
        
        <div className="question-wrapper">
          {enrichedQuestions.length > 0 && currentQuestion < enrichedQuestions.length && (
            <Question
              moduleNumber={moduleNumber}
              questionNumber={currentQuestion}
              questionText={enrichedQuestions[currentQuestion].text}
              questionType={(() => {
                const question = enrichedQuestions[currentQuestion];
                let questionType = question.questionType;
                
                // Smart detection if questionType not specified
                if (!questionType) {
                  if (!question.options || !Array.isArray(question.options) || question.options.length === 0) {
                    questionType = 'user-input';
                  } else {
                    questionType = 'multiple-choice';
                  }
                }
                
                return questionType;
              })()}
              options={enrichedQuestions[currentQuestion].options}
              selectedAnswer={selectedAnswer}
              setSelectedAnswer={handleSelectAnswer}
              crossedOut={getCurrentQuestionCrossedOut()}
              toggleCrossOutOption={toggleCrossOutOption}
              showCrossOut={showCrossOut}
              toggleCrossOut={toggleCrossOut}
              markedForReview={markedForReview.includes(currentQuestion)}
              toggleMarkedForReview={toggleMarkedForReview}
              // Pass graph URL if available
              graphUrl={enrichedQuestions[currentQuestion].graphUrl}
              // Pass graph description if available
              graphDescription={enrichedQuestions[currentQuestion].graphDescription}
              // Pass subcategory instead of skill tags
              subcategory={enrichedQuestions[currentQuestion].subcategory}
              // Pass user input question properties
              inputType={enrichedQuestions[currentQuestion].inputType || 'number'}
              answerFormat={enrichedQuestions[currentQuestion].answerFormat}
            />
          )}
        </div>
      </div>
      
      {enrichedQuestions.length > 0 && (
        <Footer
          questionNumber={currentQuestion}
          totalQuestions={enrichedQuestions.length}
          handlePrevious={prevQuestion}
          handleNext={nextQuestion}
          openTrackerPopup={toggleTracker}
          isFirstQuestion={currentQuestion === 0}
          isLastQuestion={currentQuestion === enrichedQuestions.length - 1}
          onExitExam={handleExitExamClick}
        />
      )}
      
      <QuestionTracker
        isOpen={isTrackerOpen}
        closeTracker={toggleTracker}
        questions={enrichedQuestions}
        currentQuestion={currentQuestion}
        userAnswers={updatedAnswers}
        goToQuestion={jumpToQuestion}
        markedForReview={markedForReview}
      />
      
      {calculatorAllowed && (
        <div className="calculator-indicator">
          <span>Calculator Allowed</span>
        </div>
      )}
    </div>
  );
}

export default ExamModule;