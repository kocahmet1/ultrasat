import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTimes, 
  faArrowLeft, 
  faArrowRight, 
  faCheck, 
  faTimes as faTimesCircle,
  faRotate,
  faHome
} from '@fortawesome/free-solid-svg-icons';
import { getFlashcardDeckWords, updateFlashcardStudyStats } from '../api/helperClient';
import { toast } from 'react-toastify';
import '../styles/FlashcardStudy.css';

/**
 * FlashcardStudy component for studying flashcards with flip animations
 */
const FlashcardStudy = ({ 
  deckId, 
  deckName, 
  onClose 
}) => {
  const [words, setWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [studyStats, setStudyStats] = useState({
    correct: 0,
    incorrect: 0,
    total: 0
  });
  const [showResults, setShowResults] = useState(false);
  const [sessionWords, setSessionWords] = useState([]);

  // Swipe gesture state
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchEndX, setTouchEndX] = useState(null);
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwipeAnimating, setIsSwipeAnimating] = useState(false);
  const minSwipeDistance = 50;

  useEffect(() => {
    loadDeckWords();
  }, [deckId]);

  const loadDeckWords = async () => {
    try {
      setLoading(true);
      const deckWords = await getFlashcardDeckWords(deckId);
      
      if (deckWords.length === 0) {
        toast.info('This deck is empty. Add some words to start studying!');
        onClose();
        return;
      }
      
      // Shuffle the words for study session
      const shuffledWords = [...deckWords].sort(() => Math.random() - 0.5);
      setWords(shuffledWords);
      setSessionWords(shuffledWords.map(word => ({ 
        ...word, 
        studied: false, 
        correct: null 
      })));
      setStudyStats({ correct: 0, incorrect: 0, total: shuffledWords.length });
    } catch (error) {
      console.error('Error loading deck words:', error);
      toast.error('Failed to load flashcards');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleAnswer = async (correct) => {
    if (!words[currentIndex] || isFlipped === false) return;

    const currentWord = words[currentIndex];
    
    try {
      // Update study statistics on server
      await updateFlashcardStudyStats(deckId, currentWord.id, correct);
      
      // Update local session stats
      setStudyStats(prev => ({
        ...prev,
        correct: prev.correct + (correct ? 1 : 0),
        incorrect: prev.incorrect + (correct ? 0 : 1)
      }));

      // Update session words
      setSessionWords(prev => 
        prev.map((word, index) => 
          index === currentIndex 
            ? { ...word, studied: true, correct }
            : word
        )
      );

      // Move to next word or show results
      if (currentIndex < words.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setIsFlipped(false);
      } else {
        setShowResults(true);
      }
    } catch (error) {
      console.error('Error updating study stats:', error);
      toast.error('Failed to save study progress');
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowResults(false);
    setStudyStats({ 
      correct: 0, 
      incorrect: 0, 
      total: words.length 
    });
    setSessionWords(words.map(word => ({ 
      ...word, 
      studied: false, 
      correct: null 
    })));
    
    // Reshuffle words
    const shuffledWords = [...words].sort(() => Math.random() - 0.5);
    setWords(shuffledWords);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handleTouchStart = (e) => {
    if (e.target.closest('.answer-button')) return;
    setTouchEndX(null);
    setTouchStartX(e.changedTouches[0].clientX);
    setSwipeOffset(0);
    setIsSwipeAnimating(false);
    setIsSwiping(false);
  };

  const handleTouchMove = (e) => {
    setTouchEndX(e.changedTouches[0].clientX);
    if (touchStartX !== null) {
      setSwipeOffset(e.changedTouches[0].clientX - touchStartX);
    }
  };

  const handleTouchEnd = () => {
    if (touchStartX === null || touchEndX === null) {
      setSwipeOffset(0);
      return;
    }
    const distance = touchStartX - touchEndX;
    if (Math.abs(distance) > minSwipeDistance) {
      setIsSwiping(true);
      setIsSwipeAnimating(true);
      const direction = distance > 0 ? -1 : 1;
      setSwipeOffset(direction * window.innerWidth);
      setTimeout(() => {
        if (direction === -1) {
          handleNext();
        } else {
          handlePrevious();
        }
        setIsSwipeAnimating(false);
        setSwipeOffset(0);
        setIsSwiping(false);
      }, 300);
    } else {
      setSwipeOffset(0);
    }
    setTouchStartX(null);
    setTouchEndX(null);
  };

  const handleCardClick = () => {
    if (isSwiping) {
      setIsSwiping(false);
      return;
    }
    handleFlip();
  };

  if (loading) {
    return (
      <div className="flashcard-study-container">
        <div className="loading-study">
          <div className="spinner"></div>
          <p>Loading flashcards...</p>
        </div>
      </div>
    );
  }

  if (showResults) {
    const accuracy = studyStats.total > 0 ? Math.round((studyStats.correct / studyStats.total) * 100) : 0;
    
    return (
      <div className="flashcard-study-container">
        <div className="study-results">
          <div className="results-header">
            <h2>Study Session Complete!</h2>
            <p>Deck: {deckName}</p>
          </div>
          
          <div className="results-stats">
            <div className="stat-item correct">
              <div className="stat-number">{studyStats.correct}</div>
              <div className="stat-label">Correct</div>
            </div>
            <div className="stat-item incorrect">
              <div className="stat-number">{studyStats.incorrect}</div>
              <div className="stat-label">Incorrect</div>
            </div>
            <div className="stat-item accuracy">
              <div className="stat-number">{accuracy}%</div>
              <div className="stat-label">Accuracy</div>
            </div>
          </div>

          <div className="results-words">
            <h3>Session Review:</h3>
            <div className="words-review">
              {sessionWords.map((word, index) => (
                <div 
                  key={word.id} 
                  className={`word-result ${word.correct === true ? 'correct' : word.correct === false ? 'incorrect' : 'not-studied'}`}
                >
                  <div className="word-result-term">{word.term}</div>
                  <div className="word-result-status">
                    {word.studied ? (
                      word.correct ? (
                        <FontAwesomeIcon icon={faCheck} className="correct-icon" />
                      ) : (
                        <FontAwesomeIcon icon={faTimesCircle} className="incorrect-icon" />
                      )
                    ) : (
                      <span className="not-studied">-</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="results-actions">
            <button className="restart-button" onClick={handleRestart}>
              <FontAwesomeIcon icon={faRotate} />
              Study Again
            </button>
            <button className="close-button" onClick={onClose}>
              <FontAwesomeIcon icon={faHome} />
              Back to Word Bank
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentWord = words[currentIndex];
  const progress = ((currentIndex + 1) / words.length) * 100;

  return (
    <div className="flashcard-study-container">
      <div className="study-header">
        <button className="close-study-button" onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
        <div className="study-info">
          <h2>{deckName}</h2>
          <div className="progress-info">
            <span>{currentIndex + 1} of {words.length}</span>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
        <div className="study-stats-mini">
          <span className="correct-mini">✓ {studyStats.correct}</span>
          <span className="incorrect-mini">✗ {studyStats.incorrect}</span>
        </div>
      </div>

      <div
        className="flashcard-container"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className={`flashcard ${isFlipped ? 'flipped' : ''}`}
          onClick={handleCardClick}
          style={{
            transform: `${isFlipped ? 'rotateY(180deg) ' : ''}translateX(${swipeOffset}px)`,
            opacity: isSwipeAnimating ? 0 : 1,
            transition: isSwipeAnimating ? 'transform 0.3s ease-out, opacity 0.3s ease-out' : 'transform 0.2s ease-out'
          }}
        >
          <div className="flashcard-inner">
            <div className="flashcard-front">
              <div className="card-content">
                <div className="card-label">Word</div>
                <div className="card-text">{currentWord?.term}</div>
                <div className="flip-hint">Click to reveal definition</div>
              </div>
            </div>
            <div className="flashcard-back">
              <div className="card-content">
                <div className="card-label">Definition</div>
                <div className="card-text">{currentWord?.definition}</div>
                <div className="answer-buttons">
                  <button 
                    className="answer-button incorrect"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAnswer(false);
                    }}
                  >
                    <FontAwesomeIcon icon={faTimesCircle} />
                    Didn't Know
                  </button>
                  <button 
                    className="answer-button correct"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAnswer(true);
                    }}
                  >
                    <FontAwesomeIcon icon={faCheck} />
                    Got It!
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="study-navigation">
        <button 
          className="nav-button"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          Previous
        </button>
        
        <div className="flip-button-container">
          <button className="flip-button" onClick={handleFlip}>
            <FontAwesomeIcon icon={faRotate} />
            {isFlipped ? 'Show Word' : 'Show Definition'}
          </button>
        </div>
        
        <button 
          className="nav-button"
          onClick={handleNext}
          disabled={currentIndex === words.length - 1}
        >
          Next
          <FontAwesomeIcon icon={faArrowRight} />
        </button>
      </div>
    </div>
  );
};

export default FlashcardStudy; 