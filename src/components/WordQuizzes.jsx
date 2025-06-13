import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle, faLayerGroup, faPlay, faTrophy } from '@fortawesome/free-solid-svg-icons';
import '../styles/WordQuizzes.css';

/**
 * WordQuizzes component - displays available quizzes for each flashcard deck
 */
export default function WordQuizzes({ flashcardDecks, loading, onStartQuiz }) {
  if (loading) {
    return (
      <div className="word-quizzes-loading">
        <FontAwesomeIcon icon={faQuestionCircle} spin />
        Loading word quizzes...
      </div>
    );
  }

  if (flashcardDecks.length === 0) {
    return (
      <div className="word-quizzes-empty">
        <FontAwesomeIcon icon={faQuestionCircle} className="empty-icon" />
        <h3>No quizzes available</h3>
        <p>Create flashcard decks with words to enable quizzes!</p>
      </div>
    );
  }

  // Filter decks that have enough words for a quiz (at least 4 for multiple choice)
  const availableQuizzes = flashcardDecks.filter(deck => deck.wordCount >= 4);
  const unavailableDecks = flashcardDecks.filter(deck => deck.wordCount < 4);

  return (
    <div className="word-quizzes-container">
      <div className="quiz-section">
        <h2 className="quiz-section-title">
          <FontAwesomeIcon icon={faTrophy} />
          Available Quizzes
        </h2>
        
        {availableQuizzes.length === 0 ? (
          <div className="no-quizzes-message">
            <p>No decks have enough words for quizzes yet. You need at least 4 words per deck to generate a quiz.</p>
          </div>
        ) : (
          <div className="quiz-decks-grid">
            {availableQuizzes.map((deck) => (
              <div key={deck.id} className="quiz-deck-card">
                <div className="quiz-deck-header">
                  <div className="quiz-deck-icon">
                    <FontAwesomeIcon icon={faQuestionCircle} />
                  </div>
                  <div className="quiz-deck-info">
                    <h3 className="quiz-deck-name">{deck.name} Quiz</h3>
                    <p className="quiz-deck-description">
                      Test your knowledge of words from this deck
                    </p>
                  </div>
                </div>
                
                <div className="quiz-deck-stats">
                  <div className="quiz-stat">
                    <span className="quiz-stat-number">{Math.min(10, deck.wordCount)}</span>
                    <span className="quiz-stat-label">Questions</span>
                  </div>
                  <div className="quiz-stat">
                    <span className="quiz-stat-number">{deck.wordCount}</span>
                    <span className="quiz-stat-label">Words Available</span>
                  </div>
                </div>
                
                <div className="quiz-deck-actions">
                  <button 
                    className="start-quiz-button"
                    onClick={() => onStartQuiz(deck)}
                  >
                    <FontAwesomeIcon icon={faPlay} />
                    Start Quiz
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {unavailableDecks.length > 0 && (
        <div className="quiz-section">
          <h2 className="quiz-section-title unavailable">
            <FontAwesomeIcon icon={faLayerGroup} />
            Decks Need More Words
          </h2>
          <div className="unavailable-decks">
            {unavailableDecks.map((deck) => (
              <div key={deck.id} className="unavailable-deck-card">
                <div className="unavailable-deck-info">
                  <h4>{deck.name}</h4>
                  <p>{deck.wordCount} word{deck.wordCount !== 1 ? 's' : ''} (need {4 - deck.wordCount} more)</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 