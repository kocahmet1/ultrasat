import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Container, Button, Card, Alert, Spinner } from 'react-bootstrap';
import { doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { normalizeSubcategoryName } from '../utils/subcategoryUtils';
import { getConceptById, updateConceptMastery } from '../firebase/conceptServices';
import { getConceptDrill, generateConceptDrill } from '../utils/apiClient';
import '../styles/ConceptPractice.css';

/**
 * ConceptPractice Component
 * Shows a detailed explanation of a concept the student is struggling with,
 * followed by focused practice questions specifically targeting that concept
 */
const ConceptPractice = () => {
  const { conceptId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  // State for practice data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [concept, setConcept] = useState(null);
  const [drill, setDrill] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [practiceStarted, setPracticeStarted] = useState(false);
  const [practiceCompleted, setPracticeCompleted] = useState(false);
  const [results, setResults] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [difficulty, setDifficulty] = useState(1);
  
  // Timer reference
  const questionStartTimeRef = useRef(null);
  
  useEffect(() => {
    const loadConceptData = async () => {
      if (!currentUser || !conceptId) {
        navigate('/progress');
        return;
      }
      
      try {
        setLoading(true);
        
        // Fetch concept details
        const conceptData = await getConceptById(conceptId);
        
        if (!conceptData) {
          setError(`Concept not found. Please go back to the dashboard.`);
          setLoading(false);
          return;
        }
        
        setConcept(conceptData);
        
        // Fetch or generate a drill for this concept
        await fetchOrGenerateDrill(conceptId, difficulty);
        
      } catch (error) {
        console.error('Error loading concept data:', error);
        setError('Error loading concept: ' + error.message);
        setLoading(false);
      }
    };
    
    loadConceptData();
  }, [currentUser, conceptId, navigate, difficulty]);
  
  const fetchOrGenerateDrill = async (conceptId, difficulty) => {
    try {
      setIsGenerating(true);
      
      try {
        // First check if we already have a drill cached
        const data = await getConceptDrill(conceptId, difficulty);
        
        setDrill(data);
        setQuestions(data.questions || []);
        setLoading(false);
        setIsGenerating(false);
        return;
      } catch (notFoundError) {
        // Drill not found, continue to generation
        console.log('No existing drill found, generating new one');
      }
      
      // Generate a new drill
      const drillData = await generateConceptDrill(conceptId, difficulty);
      
      setDrill(drillData);
      setQuestions(drillData.questions || []);
      setLoading(false);
      setIsGenerating(false);
      
    } catch (error) {
      console.error('Error fetching or generating drill:', error);
      setError('Error loading practice: ' + error.message);
      setLoading(false);
      setIsGenerating(false);
    }
  };
  
  // Handle starting the practice
  const handleStartPractice = () => {
    setPracticeStarted(true);
    questionStartTimeRef.current = Date.now();
  };
  
  // Handle user selecting an answer
  const handleAnswerSelected = (selectedOption) => {
    if (practiceCompleted) return;
    
    const currentQuestion = questions[currentQuestionIndex];
    const questionId = currentQuestion.id || `q-${currentQuestionIndex}`;
    const isCorrect = selectedOption === currentQuestion.correctAnswer;
    
    // Calculate time spent on this question
    const timeSpent = Math.floor((Date.now() - questionStartTimeRef.current) / 1000);
    
    // Record answer
    const updatedAnswers = {
      ...userAnswers,
      [questionId]: {
        selectedOption,
        isCorrect,
        timeSpent
      }
    };
    
    setUserAnswers(updatedAnswers);
    
    // If this was the last question, complete the practice
    if (currentQuestionIndex === questions.length - 1) {
      completePractice(updatedAnswers);
    } else {
      // Move to the next question
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      // Reset timer for the next question
      questionStartTimeRef.current = Date.now();
    }
  };
  
  // Complete the practice and calculate results
  const completePractice = async (finalAnswers) => {
    try {
      // Calculate score
      const correctCount = Object.values(finalAnswers).filter(a => a.isCorrect).length;
      const totalQuestions = questions.length;
      const score = Math.round((correctCount / totalQuestions) * 100);
      const passed = score >= 80; // Pass threshold is 80%
      
      // Update user's concept mastery if they passed
      if (concept && passed) {
        // First update the concept mastery
        await updateConceptMastery(
          currentUser.uid, 
          concept.subcategoryId, 
          conceptId, 
          true
        );
        
        // Also update the subcategory progress
        // This keeps track of overall progress in this subcategory
        // by updating the progress document as concepts get mastered
        try {
          const { updateConceptProgress } = await import('../utils/progressUtils');
          await updateConceptProgress(
            currentUser.uid,
            concept.subcategoryId,
            conceptId,
            true
          );
        } catch (progressError) {
          console.error('Error updating unified progress:', progressError);
          // Continue even if this fails - the updateConceptMastery already worked
        }
        
        // Show success message
        setResults({
          score,
          correctCount,
          totalQuestions,
          passed,
          mastered: true
        });
      } else {
        // Not mastered yet - still track the attempt
        try {
          const { updateConceptProgress } = await import('../utils/progressUtils');
          await updateConceptProgress(
            currentUser.uid,
            concept.subcategoryId,
            conceptId,
            false // Not mastered
          );
        } catch (progressError) {
          console.error('Error updating unified progress:', progressError);
        }
        
        setResults({
          score,
          correctCount,
          totalQuestions,
          passed,
          mastered: false
        });
      }
      
      setPracticeCompleted(true);
    } catch (error) {
      console.error('Error completing practice:', error);
      setError('Error saving results: ' + error.message);
    }
  };
  
  // Handle returning to progress dashboard
  const handleBackToProgress = () => {
    navigate('/progress');
  };
  
  // Handle changing difficulty
  const handleChangeDifficulty = (newDifficulty) => {
    if (newDifficulty !== difficulty) {
      setDifficulty(newDifficulty);
      setUserAnswers({});
      setCurrentQuestionIndex(0);
      setPracticeStarted(false);
      setPracticeCompleted(false);
      setResults(null);
    }
  };
  
  // Loading state
  if (loading || !concept) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">
          {isGenerating ? 'Preparing your personalized practice...' : 'Loading concept...'}
        </p>
      </Container>
    );
  }
  
  // Error state
  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">
          <Alert.Heading>Error</Alert.Heading>
          <p>{error}</p>
          <Button variant="primary" onClick={handleBackToProgress}>
            Back to Dashboard
          </Button>
        </Alert>
      </Container>
    );
  }
  
  // Practice completed state
  if (practiceCompleted) {
    return (
      <div className="concept-practice-container">
        <div className="concept-practice-header">
          <h1>Practice Complete</h1>
        </div>
        
        <div className="results-container">
          <div className="results-score">
            <h2>Your Score</h2>
            <div className="score-display">
              <div className="score-circle">
                <div className="score-number">{results.score}%</div>
              </div>
              <div className="score-text">
                <p>You answered <strong>{results.correctAnswers}</strong> out of <strong>{results.totalQuestions}</strong> questions correctly.</p>
                {results.passed ? (
                  <div className="success-message">
                    <p className="concept-mastered">
                      <span className="success-icon">✓</span> Concept Mastered!
                    </p>
                    <p>Great job! You've demonstrated a solid understanding of this concept.</p>
                  </div>
                ) : (
                  <p className="try-again-message">Keep practicing! You need 80% to master this concept.</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="review-container">
            <h3>Question Review</h3>
            {questions.map((question, index) => {
              const questionId = question.id || `q-${index}`;
              const userAnswer = userAnswers[questionId];
              const isCorrect = userAnswer && userAnswer.isCorrect;
              
              return (
                <div key={index} className={`question-review ${isCorrect ? 'correct' : 'incorrect'}`}>
                  <div className="question-header">
                    <div className="question-number">Question {index + 1}</div>
                    {isCorrect ? 
                      <span className="correct-label">Correct</span> : 
                      <span className="incorrect-label">Incorrect</span>
                    }
                  </div>
                  <div className="question-text">{question.text}</div>
                  <div className="options-review">
                    {question.options.map((option, optIndex) => (
                      <div 
                        key={optIndex} 
                        className={`option ${option === question.correctAnswer ? 'correct-option' : ''} ${(userAnswer && userAnswer.selectedOption === option && !isCorrect) ? 'incorrect-option' : ''}`}
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                  <div className="explanation">
                    <h4>Explanation</h4>
                    <p>{question.explanation}</p>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="navigation-buttons">
            <Button variant="primary" onClick={() => handleChangeDifficulty(difficulty)}>
              Try Again
            </Button>
            {!results.passed && difficulty > 1 && (
              <Button variant="outline-primary" onClick={() => handleChangeDifficulty(difficulty - 1)}>
                Try Easier Level
              </Button>
            )}
            {results.passed && difficulty < 3 && (
              <Button variant="outline-primary" onClick={() => handleChangeDifficulty(difficulty + 1)}>
                Try Harder Level
              </Button>
            )}
            <Button variant="secondary" onClick={handleBackToProgress}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  // Practice active state (started but not completed)
  if (practiceStarted && !practiceCompleted) {
    const currentQuestion = questions[currentQuestionIndex];
    
    return (
      <div className="concept-practice-container">
        <div className="concept-practice-header">
          <h1>
            Practicing: {concept.name}
          </h1>
          <div className="progress-tracker">
            Question {currentQuestionIndex + 1} of {questions.length}
          </div>
        </div>
        
        <div className="question-container">
          <div className="question-text">
            {currentQuestion.text}
          </div>
          
          <div className="options-container">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                className="option-button"
                onClick={() => handleAnswerSelected(option)}
              >
                <span className="option-text">{option}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  // Practice intro state (not started yet)
  return (
    <div className="concept-practice-container">
      <div className="concept-practice-header">
        <h1>Understanding {concept.name}</h1>
        <div className="difficulty-selector">
          <span>Difficulty: </span>
          <div className="difficulty-buttons">
            <button 
              className={`difficulty-button ${difficulty === 1 ? 'active' : ''}`} 
              onClick={() => handleChangeDifficulty(1)}
            >
              Easy
            </button>
            <button 
              className={`difficulty-button ${difficulty === 2 ? 'active' : ''}`} 
              onClick={() => handleChangeDifficulty(2)}
            >
              Medium
            </button>
            <button 
              className={`difficulty-button ${difficulty === 3 ? 'active' : ''}`} 
              onClick={() => handleChangeDifficulty(3)}
            >
              Hard
            </button>
          </div>
        </div>
      </div>
      
      <div className="concept-content">
        <div className="concept-explanation">
          <div dangerouslySetInnerHTML={{ __html: concept.explanationHTML }} />
        </div>
        
        <div className="practice-instructions">
          <h3>Practice Instructions</h3>
          <p>This practice set contains {questions.length} questions focused specifically on {concept.name}.</p>
          <p>Each question is designed to help you master this particular concept. After the practice, you'll receive detailed explanations for each question.</p>
          <p>You need to score at least 80% to master this concept.</p>
        </div>
        
        <div className="practice-actions">
          <Button variant="primary" onClick={handleStartPractice} className="start-button">
            Start Practice
          </Button>
          <Button variant="link" onClick={handleBackToProgress}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConceptPractice;
