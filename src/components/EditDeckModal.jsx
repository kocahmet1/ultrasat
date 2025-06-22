import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTimes, 
  faTrash, 
  faLayerGroup, 
  faSpinner,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import { getFlashcardDeckWords, removeWordFromFlashcardDeck } from '../api/helperClient';
import { toast } from 'react-toastify';
import '../styles/EditDeckModal.css';

/**
 * EditDeckModal component - allows editing words in a flashcard deck
 */
const EditDeckModal = ({ deck, isOpen, onClose, onDeckUpdated }) => {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [removingWordIds, setRemovingWordIds] = useState(new Set());

  // Load deck words when modal opens
  useEffect(() => {
    if (isOpen && deck) {
      loadDeckWords();
    }
  }, [isOpen, deck]);

  const loadDeckWords = async () => {
    if (!deck) return;
    
    try {
      setLoading(true);
      const deckWords = await getFlashcardDeckWords(deck.id);
      setWords(deckWords);
    } catch (error) {
      console.error('Error loading deck words:', error);
      toast.error('Failed to load deck words');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveWord = async (wordId) => {
    const wordToRemove = words.find(word => word.id === wordId);
    const wordName = wordToRemove ? (wordToRemove.term || wordToRemove.word) : 'this word';

    // Confirmation dialog
    const confirmDelete = window.confirm(
      `Are you sure you want to remove "${wordName}" from "${deck.name}"?\n\n` +
      `This will only remove it from this flashcard deck, not from your Word Bank.`
    );

    if (!confirmDelete) return;

    try {
      // Add to removing set to show loading state
      setRemovingWordIds(prev => new Set(prev).add(wordId));

      // Remove from deck via API
      await removeWordFromFlashcardDeck(deck.id, wordId);

      // Update local state
      setWords(prevWords => prevWords.filter(word => word.id !== wordId));

      // Notify parent component to refresh deck data
      if (onDeckUpdated) {
        onDeckUpdated();
      }

      toast.success(`"${wordName}" removed from deck`);
    } catch (error) {
      console.error('Error removing word from deck:', error);
      toast.error('Failed to remove word from deck');
    } finally {
      // Remove from removing set
      setRemovingWordIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(wordId);
        return newSet;
      });
    }
  };

  const handleClose = () => {
    setWords([]);
    setRemovingWordIds(new Set());
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="edit-deck-modal-overlay" onClick={handleClose}>
      <div className="edit-deck-modal" onClick={e => e.stopPropagation()}>
        <div className="edit-deck-modal-header">
          <div className="modal-title-section">
            <FontAwesomeIcon icon={faLayerGroup} className="modal-title-icon" />
            <h2>Edit Deck: {deck?.name}</h2>
          </div>
          <button className="modal-close-btn" onClick={handleClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className="edit-deck-modal-content">
          {loading ? (
            <div className="modal-loading">
              <FontAwesomeIcon icon={faSpinner} className="spinner" />
              <p>Loading deck words...</p>
            </div>
          ) : words.length === 0 ? (
            <div className="empty-deck-message">
              <FontAwesomeIcon icon={faExclamationTriangle} className="empty-icon" />
              <h3>This deck is empty</h3>
              <p>Add some words to this deck to start studying!</p>
            </div>
          ) : (
            <>
              <div className="deck-info">
                <p className="word-count">{words.length} word{words.length !== 1 ? 's' : ''} in this deck</p>
                <p className="deck-description">{deck?.description}</p>
              </div>

              <div className="words-list">
                {words.map((word) => (
                  <div key={word.id} className="word-item">
                    <div className="word-content">
                      <div className="word-term">
                        {word.term || word.word}
                      </div>
                      <div className="word-definition">
                        {word.definition}
                      </div>
                    </div>
                    <button
                      className={`remove-word-btn ${removingWordIds.has(word.id) ? 'removing' : ''}`}
                      onClick={() => handleRemoveWord(word.id)}
                      disabled={removingWordIds.has(word.id)}
                      title="Remove from deck"
                    >
                      {removingWordIds.has(word.id) ? (
                        <FontAwesomeIcon icon={faSpinner} className="spinner" />
                      ) : (
                        <FontAwesomeIcon icon={faTrash} />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="edit-deck-modal-footer">
          <button className="close-modal-btn" onClick={handleClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditDeckModal;
