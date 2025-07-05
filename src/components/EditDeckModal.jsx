import React, { useState, useEffect, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTimes, 
  faTrash, 
  faLayerGroup, 
  faSpinner,
  faExclamationTriangle,
  faPlus
} from '@fortawesome/free-solid-svg-icons';
import { getFlashcardDeckWords, removeWordFromFlashcardDeck } from '../api/helperClient';
import { toast } from 'react-toastify';
import AddWordsToDeck from './AddWordsToDeck';
import '../styles/EditDeckModal.css';

const EditDeckModal = ({ deck, isOpen, onClose, onDeckUpdated }) => {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [removingWordIds, setRemovingWordIds] = useState(new Set());
  const [isAddingWords, setIsAddingWords] = useState(false);

  useEffect(() => {
    if (isOpen && deck) {
      loadDeckWords();
    } else {
      // Reset state when modal is closed or deck is not provided
      setWords([]);
      setRemovingWordIds(new Set());
      setIsAddingWords(false);
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

    const confirmDelete = window.confirm(
      `Are you sure you want to remove "${wordName}" from "${deck.name}"? This will not delete it from your Word Bank.`
    );

    if (!confirmDelete) return;

    try {
      setRemovingWordIds(prev => new Set(prev).add(wordId));
      await removeWordFromFlashcardDeck(deck.id, wordId);
      setWords(prevWords => prevWords.filter(word => word.id !== wordId));
      if (onDeckUpdated) {
        onDeckUpdated();
      }
      toast.success(`"${wordName}" removed from deck`);
    } catch (error) {
      console.error('Error removing word from deck:', error);
      toast.error('Failed to remove word from deck');
    } finally {
      setRemovingWordIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(wordId);
        return newSet;
      });
    }
  };

  const handleWordAdded = (newWord) => {
    setWords(prevWords => [...prevWords, newWord]);
    if (onDeckUpdated) {
      onDeckUpdated();
    }
  };

  const handleClose = () => {
    onClose();
  };

  const existingWordIds = useMemo(() => new Set(words.map(w => w.id)), [words]);

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
          ) : (
            <>
              <div className="deck-info">
                <p className="word-count">{words.length} word{words.length !== 1 ? 's' : ''} in this deck</p>
                <p className="deck-description">{deck?.description}</p>
              </div>

              {words.length === 0 && !isAddingWords ? (
                <div className="empty-deck-message">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="empty-icon" />
                  <h3>This deck is empty</h3>
                  <p>Add some words to this deck to start studying!</p>
                </div>
              ) : (
                <div className="words-list">
                  {words.map((word) => (
                    <div key={word.id} className="word-item">
                      <div className="word-content">
                        <div className="word-term">{word.term || word.word}</div>
                        <div className="word-definition">{word.definition}</div>
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
              )}

              <div className="add-words-section">
                <button 
                  className="toggle-add-words-btn"
                  onClick={() => setIsAddingWords(!isAddingWords)}
                >
                  <FontAwesomeIcon icon={faPlus} />
                  {isAddingWords ? 'Cancel Adding' : 'Add Words to Deck'}
                </button>

                {isAddingWords && (
                  <AddWordsToDeck 
                    deck={deck}
                    existingWordIds={existingWordIds}
                    onWordAdded={handleWordAdded}
                  />
                )}
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
