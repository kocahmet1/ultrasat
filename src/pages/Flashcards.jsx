import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faLayerGroup, 
  faPlay,
  faSpinner,
  faEdit,
  faTrash
} from '@fortawesome/free-solid-svg-icons';
import { getFlashcardDecks, deleteFlashcardDeck } from '../api/helperClient';
import FlashcardStudy from '../components/FlashcardStudy';
import EditDeckModal from '../components/EditDeckModal';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/Flashcards.css';

/**
 * Standalone Flashcards component - displays flashcard decks with study functionality
 */
export default function Flashcards() {
  const { currentUser } = useAuth();
  
  // Flashcard states
  const [flashcardDecks, setFlashcardDecks] = useState([]);
  const [decksLoading, setDecksLoading] = useState(false);
  const [studyDeck, setStudyDeck] = useState(null);
  const [showEditDeckModal, setShowEditDeckModal] = useState(false);
  const [deckToEdit, setDeckToEdit] = useState(null);

  // Load flashcard decks
  const loadFlashcardDecks = useCallback(async () => {
    if (!currentUser) return;

    try {
      setDecksLoading(true);
      const decks = await getFlashcardDecks();
      setFlashcardDecks(decks);
    } catch (error) {
      console.error('Error loading flashcard decks:', error);
      toast.error('Failed to load flashcard decks');
    } finally {
      setDecksLoading(false);
    }
  }, [currentUser]);

  // Load flashcard decks on mount
  useEffect(() => {
    if (currentUser) {
      loadFlashcardDecks();
    }
  }, [currentUser, loadFlashcardDecks]);

  // Handle study deck
  const handleStudyDeck = (deck) => {
    setStudyDeck(deck);
  };

  // Handle close study
  const handleCloseStudy = () => {
    setStudyDeck(null);
    // Refresh decks to update last studied time
    loadFlashcardDecks();
  };

  // Handle delete deck
  const handleDeleteDeck = async (deck) => {
    if (!window.confirm(`Are you sure you want to delete "${deck.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteFlashcardDeck(deck.id);
      toast.success(`Deck "${deck.name}" deleted successfully`);
      // Refresh the decks list
      loadFlashcardDecks();
    } catch (error) {
      console.error('Error deleting deck:', error);
      toast.error('Failed to delete deck');
    }
  };

  // Handle edit deck
  const handleEditDeck = (deck) => {
    setDeckToEdit(deck);
    setShowEditDeckModal(true);
  };

  // Handle edit deck modal close
  const handleEditDeckModalClose = () => {
    setShowEditDeckModal(false);
    setDeckToEdit(null);
  };

  // Handle deck update
  const handleDeckUpdate = () => {
    // Refresh the decks list after update
    loadFlashcardDecks();
    handleEditDeckModalClose();
  };

  // If studying a deck, show the study interface
  if (studyDeck) {
    return (
      <FlashcardStudy
        deckId={studyDeck.id}
        deckName={studyDeck.name}
        onClose={handleCloseStudy}
      />
    );
  }

  return (
    <div className="flashcards-container">
      <div className="flashcards-header">
        <div className="flashcards-title">
          <FontAwesomeIcon icon={faLayerGroup} className="flashcards-icon" />
          <h1>📚 My Flashcards</h1>
        </div>
        <p className="flashcards-description">
          Your personal collection of saved vocabulary words from SAT practice questions.
        </p>
      </div>

      {/* Flashcard Decks Section */}
      <div className="flashcards-section">
        {decksLoading ? (
          <div className="flashcards-loading">
            <FontAwesomeIcon icon={faSpinner} spin />
            Loading flashcard decks...
          </div>
        ) : flashcardDecks.length === 0 ? (
          <div className="flashcards-empty">
            <FontAwesomeIcon icon={faLayerGroup} className="empty-icon" />
            <h3>No flashcard decks yet</h3>
            <p>Start by adding words to flashcards from your word bank!</p>
            <a href="/word-bank" className="switch-tab-button">
              <FontAwesomeIcon icon={faLayerGroup} />
              Go to Word Bank
            </a>
          </div>
        ) : (
          <div className="flashcard-decks-grid">
            {flashcardDecks
              .filter(deck => deck && deck.id) // Filter out undefined/invalid decks
              .map((deck) => (
              <div key={deck.id} className="flashcard-deck-card">
                <div className="deck-header">
                  <div className="deck-icon">
                    <FontAwesomeIcon icon={faLayerGroup} />
                  </div>
                  <div className="deck-info">
                    <h3 className="deck-name">{deck.name}</h3>
                    {deck.description && (
                      <p className="deck-description">{deck.description}</p>
                    )}
                  </div>
                </div>
                
                <div className="deck-stats">
                  <div className="stat">
                    <span className="stat-number">{deck.wordCount}</span>
                    <span className="stat-label">Words</span>
                  </div>
                  {deck.lastStudiedAt && (
                    <div className="stat">
                      <span className="stat-text">
                        Last studied: {new Date(deck.lastStudiedAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="deck-actions">
                  <button 
                    className="study-button"
                    onClick={() => handleStudyDeck(deck)}
                    disabled={deck.wordCount === 0}
                  >
                    <FontAwesomeIcon icon={faPlay} />
                    {deck.wordCount === 0 ? 'No Words' : 'Study'}
                  </button>
                  {deck.name !== 'Deck 1' && (
                    <button 
                      className="edit-deck-button"
                      onClick={() => handleEditDeck(deck)}
                      title="Edit deck"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                      Edit
                    </button>
                  )}
                  {deck.name !== 'Deck 1' && (
                    <button 
                      className="delete-deck-button"
                      onClick={() => handleDeleteDeck(deck)}
                      title="Delete deck"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Deck Modal */}
      {showEditDeckModal && deckToEdit && (
        <EditDeckModal
          isOpen={showEditDeckModal}
          onClose={handleEditDeckModalClose}
          deck={deckToEdit}
          onDeckUpdated={handleDeckUpdate}
        />
      )}

      {/* Toast Container for notifications */}
      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
}
