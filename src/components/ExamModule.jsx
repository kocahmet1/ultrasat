import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Question from './Question';
import Footer from './Footer';
import QuestionTracker from './QuestionTracker';
import { enrichQuestionsWithNewCategories, ensureQuestionsHaveSubcategoryIds } from '../utils/categoryUtils';
import '../styles/App.css';
import '../styles/Transitions.css';

function ExamModule({ 
  moduleNumber, 
  moduleTitle, 
  questions, 
  userAnswers, 
  crossedOut, 
  onModuleComplete,
  calculatorAllowed = false
}) {
  const navigate = useNavigate();
  // Always start from question 0 when a module loads
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(Array.isArray(userAnswers) ? userAnswers[0] : (userAnswers[0] || ''));
  const [timeRemaining, setTimeRemaining] = useState(32 * 60); // 32 minutes
  const [timerRunning, setTimerRunning] = useState(true);
  const [clockVisible, setClockVisible] = useState(true);
  const [showCrossOut, setShowCrossOut] = useState(false);
  const [localCrossedOut, setLocalCrossedOut] = useState(crossedOut || {});
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  // Handle both array and object answer formats
  const [updatedAnswers, setUpdatedAnswers] = useState(Array.isArray(userAnswers) ? [...userAnswers] : {});
  const [markedForReview, setMarkedForReview] = useState([]);
  
  // Animation states
  const [moduleAnimation, setModuleAnimation] = useState('fade-in');

  // Enrich questions with skill tags based on categories
  const [enrichedQuestions, setEnrichedQuestions] = useState([]);

  // Debug logging, question enrichment, and entrance animation
  useEffect(() => {
    console.log(`Module ${moduleNumber} initialized`);
    
    // Enrich questions with subcategory IDs based on their categories
    const withCategories = enrichQuestionsWithNewCategories(questions);
    // Ensure all questions have proper subcategory IDs
    const enriched = ensureQuestionsHaveSubcategoryIds(withCategories);
    setEnrichedQuestions(enriched);
    
    console.log('Enriched Questions:', enriched);
    console.log('Initial answers:', updatedAnswers);
    
    // Reset to first question when module loads
    setCurrentQuestion(0);
    if (userAnswers && userAnswers[0]) {
      setSelectedAnswer(userAnswers[0]);
    } else {
      setSelectedAnswer('');
    }
    
    // Start with entrance animation
    setModuleAnimation('fade-in');
    setTimeout(() => {
      setModuleAnimation('');  // Remove animation class after it completes
    }, 1000);
  }, [moduleNumber, questions]);

  // Timer logic
  useEffect(() => {
    let timer;
    if (timerRunning && timeRemaining > 0) {
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

  // Toggle cross-out functionality
  const toggleCrossOut = () => setShowCrossOut(!showCrossOut);

  // Toggle tracker
  const toggleTracker = () => {
    console.log('Toggle tracker clicked, current state:', isTrackerOpen);
    const newState = !isTrackerOpen;
    console.log('Setting isTrackerOpen to:', newState);
    setIsTrackerOpen(newState);
    // Log after state update attempt
    setTimeout(() => {
      console.log('Tracker state after update attempt:', isTrackerOpen);
      // This will show the actual updated state in the next render cycle
      setTimeout(() => {
        console.log('Final tracker state in next render cycle:', isTrackerOpen);
      }, 100);
    }, 0);
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

  return (
    <div className={`app ${moduleAnimation}`}>
      <Header
        sectionTitle={moduleTitle}
        timeRemaining={timeRemaining}
        clockVisible={clockVisible}
        toggleClock={toggleClock}
      />
      
      <div className="main-content">
        {/* Tools container removed since we're using the button in the Question component */}
        
        <div className="question-wrapper">
          {enrichedQuestions.length > 0 && currentQuestion < enrichedQuestions.length && (
            <Question
              questionNumber={currentQuestion}
              questionText={enrichedQuestions[currentQuestion].text}
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
