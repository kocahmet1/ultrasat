import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faQuestionCircle, 
  faArrowLeft, 
  faArrowRight, 
  faTimes,
  faTrophy,
  faCheck,
  faXmark
} from '@fortawesome/free-solid-svg-icons';
import { getFlashcardDeckWords } from '../api/helperClient';
import '../styles/Quiz.css';

/**
 * Quiz component - displays a 10-question multiple choice quiz for a flashcard deck
 */
export default function Quiz({ deckId, deckName, onClose, allWords = [] }) {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [userAnswers, setUserAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);
  const [answerChecked, setAnswerChecked] = useState(false);

  useEffect(() => {
    generateQuiz();
  }, [deckId]);

  const generateQuiz = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get words from the specific deck
      const deckWords = await getFlashcardDeckWords(deckId);
      
      if (deckWords.length < 4) {
        setError('This deck needs at least 4 words to generate a quiz.');
        return;
      }

      // Get random words for incorrect answers (all saved words)
      const allAvailableWords = allWords.length > 0 ? allWords : deckWords;

      // Create 10 questions (or however many words are available)
      const numQuestions = Math.min(10, deckWords.length);
      const shuffledDeckWords = [...deckWords].sort(() => 0.5 - Math.random());
      const selectedWords = shuffledDeckWords.slice(0, numQuestions);

      const generatedQuestions = selectedWords.map((word, index) => {
        // Get all available definitions except the correct one
        const otherWords = allAvailableWords.filter(w => 
          w.id !== word.id && 
          w.definition !== word.definition // Also exclude words with identical definitions
        );
        
        const incorrectAnswers = [];
        const usedDefinitions = new Set([word.definition]); // Track used definitions
        
        // Shuffle other words for random selection
        const shuffledOthers = [...otherWords].sort(() => 0.5 - Math.random());
        
        // Pick unique incorrect definitions from other words
        for (const otherWord of shuffledOthers) {
          if (incorrectAnswers.length >= 3) break;
          if (!usedDefinitions.has(otherWord.definition)) {
            incorrectAnswers.push(otherWord.definition);
            usedDefinitions.add(otherWord.definition);
          }
        }

        // If we still don't have enough, add unique generic answers
        if (incorrectAnswers.length < 3) {
          const genericAnswers = [
            'A type of mathematical equation',
            'A geographical location',
            'A scientific measurement',
            'An artistic technique',
            'A literary device',
            'A historical period',
            'A chemical compound',
            'A biological process',
            'A method of communication',
            'A form of government',
            'A musical instrument',
            'A cooking technique',
            'A weather phenomenon',
            'A medical condition',
            'A transportation method',
            'An architectural style'
          ];
          
          // Shuffle generic answers and add unique ones
          const shuffledGeneric = [...genericAnswers].sort(() => 0.5 - Math.random());
          for (const generic of shuffledGeneric) {
            if (incorrectAnswers.length >= 3) break;
            if (!usedDefinitions.has(generic)) {
              incorrectAnswers.push(generic);
              usedDefinitions.add(generic);
            }
          }
        }

        // Combine correct and incorrect answers and shuffle
        const allAnswers = [word.definition, ...incorrectAnswers.slice(0, 3)];
        const shuffledAnswers = allAnswers.sort(() => 0.5 - Math.random());

        return {
          id: index + 1,
          word: word.term || word.word || 'Unknown Word', // Use 'term' first (flashcard structure), then 'word' (bank structure)
          correctAnswer: word.definition,
          options: shuffledAnswers,
          correctIndex: shuffledAnswers.indexOf(word.definition)
        };
      });

      setQuestions(generatedQuestions);
      setUserAnswers(new Array(generatedQuestions.length).fill(null));
    } catch (error) {
      console.error('Error generating quiz:', error);
      setError('Failed to generate quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answerIndex) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer === null || !answerChecked) return;

    // Save the answer
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = selectedAnswer;
    setUserAnswers(newAnswers);

    // Move to next question or complete quiz
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setAnswerChecked(false);
    } else {
      // Quiz complete
      setQuizComplete(true);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedAnswer(userAnswers[currentQuestionIndex - 1]);
      setShowResult(false);
      setAnswerChecked(false);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    userAnswers.forEach((answer, index) => {
      if (answer === questions[index]?.correctIndex) {
        correct++;
      }
    });
    return correct;
  };

  if (loading) {
    return (
      <div className="quiz-container">
        <div className="quiz-loading">
          <FontAwesomeIcon icon={faQuestionCircle} spin />
          <p>Generating your quiz...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="quiz-container">
        <div className="quiz-error">
          <FontAwesomeIcon icon={faTimes} />
          <h3>Quiz Error</h3>
          <p>{error}</p>
          <button className="back-button" onClick={onClose}>
            <FontAwesomeIcon icon={faArrowLeft} />
            Back to Quizzes
          </button>
        </div>
      </div>
    );
  }

  if (quizComplete) {
    const score = calculateScore();
    const percentage = Math.round((score / questions.length) * 100);
    
    return (
      <div className="quiz-container">
        <div className="quiz-results">
          <div className="results-header">
            <FontAwesomeIcon icon={faTrophy} className="trophy-icon" />
            <h2>Quiz Complete!</h2>
          </div>
          
          <div className="score-display">
            <div className="score-circle">
              <span className="score-number">{score}</span>
              <span className="score-total">/ {questions.length}</span>
            </div>
            <div className="score-percentage">{percentage}%</div>
          </div>
          
          <div className="results-summary">
            <h3>{deckName} Quiz Results</h3>
            <p>
              {percentage >= 80 ? 'Excellent work!' : 
               percentage >= 60 ? 'Good job!' : 
               'Keep practicing to improve!'}
            </p>
          </div>
          
          <div className="results-actions">
            <button className="retake-button" onClick={() => window.location.reload()}>
              <FontAwesomeIcon icon={faQuestionCircle} />
              Retake Quiz
            </button>
            <button className="back-button" onClick={onClose}>
              <FontAwesomeIcon icon={faArrowLeft} />
              Back to Quizzes
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isCorrect = showResult && selectedAnswer === currentQuestion.correctIndex;
  const isIncorrect = showResult && selectedAnswer !== currentQuestion.correctIndex;

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <button className="quiz-close-button" onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
        <div className="quiz-title">
          <h2>{deckName} Quiz</h2>
        </div>
        <div className="quiz-progress">
          Question {currentQuestionIndex + 1} of {questions.length}
        </div>
      </div>

      <div className="quiz-progress-bar">
        <div 
          className="progress-fill"
          style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      <div className="quiz-content">
        <div className="quiz-question-container">
          <div className="question-container">
            <div className="question-number">
              Question {currentQuestionIndex + 1}
            </div>
            <div className="question-text">
              What does "<strong>{currentQuestion.word}</strong>" mean?
            </div>
          </div>

          <div className="answers-container">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                className={`answer-option ${
                  selectedAnswer === index ? 'selected' : ''
                } ${
                  showResult && index === currentQuestion.correctIndex ? 'correct' : ''
                } ${
                  showResult && selectedAnswer === index && index !== currentQuestion.correctIndex ? 'incorrect' : ''
                }`}
                onClick={() => !showResult && handleAnswerSelect(index)}
                disabled={showResult}
              >
                <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                <span className="option-text">{option}</span>
                {showResult && index === currentQuestion.correctIndex && (
                  <FontAwesomeIcon icon={faCheck} className="correct-icon" />
                )}
                {showResult && selectedAnswer === index && index !== currentQuestion.correctIndex && (
                  <FontAwesomeIcon icon={faXmark} className="incorrect-icon" />
                )}
              </button>
            ))}
          </div>
        </div>

        {showResult && (
          <div className={`result-feedback ${isCorrect ? 'correct' : 'incorrect'}`}>
            {isCorrect ? (
              <div className="feedback-content">
                <FontAwesomeIcon icon={faCheck} />
                <span>Correct!</span>
              </div>
            ) : (
              <div className="feedback-content">
                <FontAwesomeIcon icon={faXmark} />
                <span>Incorrect. The correct answer is: {currentQuestion.correctAnswer}</span>
              </div>
            )}
          </div>
        )}

        <div className="quiz-navigation">
          <button 
            className="nav-button prev"
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0 || showResult}
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            Previous
          </button>
          
          {answerChecked ? (
            <button 
              className="nav-button next"
              onClick={handleNextQuestion}
              disabled={selectedAnswer === null || !answerChecked}
            >
              {currentQuestionIndex === questions.length - 1 ? 'Finish Quiz' : 'Next'}
              <FontAwesomeIcon icon={faArrowRight} />
            </button>
          ) : (
            <button 
              className="nav-button check"
              onClick={() => {
                setShowResult(true);
                setAnswerChecked(true);
              }}
              disabled={selectedAnswer === null}
            >
              Check
              <FontAwesomeIcon icon={faCheck} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 