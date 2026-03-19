import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faPlus, faLayerGroup, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { getFlashcardDecks, createFlashcardDeck, addWordToFlashcardDeck } from '../api/helperClient';
import { toast } from 'react-toastify';
import '../styles/AddToFlashcardsModal.css';

/**
 * Modal component for adding words to flashcard decks
 */
const AddToFlashcardsModal = ({ 
  isOpen, 
  onClose, 
  word,  // { id, word, definition }
  onWordAdded 
}) => {
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [showCreateNew, setShowCreateNew] = useState(false);
  const [newDeckName, setNewDeckName] = useState('');
  const [newDeckDescription, setNewDeckDescription] = useState('');

  // Load decks when modal opens
  useEffect(() => {
    if (isOpen) {
      loadDecks();
    }
  }, [isOpen]);

  const loadDecks = async () => {
    try {
      setLoading(true);
      const userDecks = await getFlashcardDecks();
      
      // Ensure "Deck 1" exists as default
      let deck1Exists = userDecks.some(deck => deck.name === 'Deck 1');
      
      if (!deck1Exists) {
        // Create default "Deck 1"
        const deck1Id = await createFlashcardDeck('Deck 1', 'Default flashcard deck');
        const newDeck1 = {
          id: deck1Id,
          name: 'Deck 1',
          description: 'Default flashcard deck',
          wordCount: 0,
          createdAt: new Date(),
          lastStudiedAt: null
        };
        userDecks.unshift(newDeck1);
      }
      
      setDecks(userDecks);
    } catch (error) {
      console.error('Error loading flashcard decks:', error);
      toast.error('Failed to load flashcard decks');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToDeck = async (deckId) => {
    if (!word || adding) return;

    try {
      setAdding(true);
      await addWordToFlashcardDeck(deckId, word.id, word.word, word.definition);
      
      // Update deck word count locally
      setDecks(prevDecks => 
        prevDecks.map(deck => 
          deck.id === deckId 
            ? { ...deck, wordCount: deck.wordCount + 1 }
            : deck
        )
      );
      
      toast.success('Word added to flashcard deck!');
      onWordAdded && onWordAdded(deckId);
      onClose();
    } catch (error) {
      console.error('Error adding word to deck:', error);
      if (error.message.includes('already in this deck')) {
        toast.warn('Word is already in this deck');
      } else {
        toast.error('Failed to add word to deck');
      }
    } finally {
      setAdding(false);
    }
  };

  const handleCreateNewDeck = async () => {
    if (!newDeckName.trim() || adding) return;

    try {
      setAdding(true);
      const deckId = await createFlashcardDeck(newDeckName.trim(), newDeckDescription.trim());
      
      // Add the new deck to the list
      const newDeck = {
        id: deckId,
        name: newDeckName.trim(),
        description: newDeckDescription.trim(),
        wordCount: 0,
        createdAt: new Date(),
        lastStudiedAt: null
      };
      setDecks(prevDecks => [newDeck, ...prevDecks]);
      
      // Add word to the new deck
      await addWordToFlashcardDeck(deckId, word.id, word.word, word.definition);
      
      // Update deck word count
      setDecks(prevDecks => 
        prevDecks.map(deck => 
          deck.id === deckId 
            ? { ...deck, wordCount: 1 }
            : deck
        )
      );
      
      toast.success('New deck created and word added!');
      onWordAdded && onWordAdded(deckId);
      onClose();
      setShowCreateNew(false);
      setNewDeckName('');
      setNewDeckDescription('');
    } catch (error) {
      console.error('Error creating new deck:', error);
      toast.error('Failed to create new deck');
    } finally {
      setAdding(false);
    }
  };

  if (!isOpen || !word) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="flashcards-modal" onClick={(e) => e.stopPropagation()}>
        <div className="flashcards-modal-header">
          <h3>Add to Flashcards</h3>
          <button className="close-button" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        
        <div className="flashcards-modal-content">
          <div className="word-preview">
            <div className="word-term">{word.word}</div>
            <div className="word-definition">{word.definition}</div>
          </div>

          {loading ? (
            <div className="loading-state">
              <FontAwesomeIcon icon={faSpinner} spin />
              Loading decks...
            </div>
          ) : (
            <>
              <div className="decks-section">
                <h4>Select a deck:</h4>
                <div className="decks-list">
                  {decks.map((deck) => (
                    <div 
                      key={deck.id} 
                      className="deck-option"
                      onClick={() => handleAddToDeck(deck.id)}
                    >
                      <div className="deck-info">
                        <div className="deck-name">
                          <FontAwesomeIcon icon={faLayerGroup} />
                          {deck.name}
                        </div>
                        <div className="deck-meta">
                          {deck.wordCount} words
                          {deck.description && (
                            <span className="deck-description"> • {deck.description}</span>
                          )}
                        </div>
                      </div>
                      <div className="deck-action">
                        {adding ? (
                          <FontAwesomeIcon icon={faSpinner} spin className="loading-icon" />
                        ) : (
                          <FontAwesomeIcon icon={faPlus} className="add-to-deck-button" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="create-new-section">
                {!showCreateNew ? (
                  <button 
                    className="create-new-button"
                    onClick={() => setShowCreateNew(true)}
                  >
                    <FontAwesomeIcon icon={faPlus} />
                    Create New Deck
                  </button>
                ) : (
                  <div className="create-new-form">
                    <h4>Create New Deck:</h4>
                    <input
                      type="text"
                      placeholder="Deck name (required)"
                      value={newDeckName}
                      onChange={(e) => setNewDeckName(e.target.value)}
                      className="deck-name-input"
                    />
                    <input
                      type="text"
                      placeholder="Description (optional)"
                      value={newDeckDescription}
                      onChange={(e) => setNewDeckDescription(e.target.value)}
                      className="deck-description-input"
                    />
                    <div className="form-buttons">
                      <button 
                        className="create-button"
                        onClick={handleCreateNewDeck}
                        disabled={!newDeckName.trim() || adding}
                      >
                        {adding ? (
                          <>
                            <FontAwesomeIcon icon={faSpinner} spin />
                            Creating...
                          </>
                        ) : (
                          <>
                            <FontAwesomeIcon icon={faPlus} />
                            Create & Add Word
                          </>
                        )}
                      </button>
                      <button 
                        className="cancel-button"
                        onClick={() => setShowCreateNew(false)}
                        disabled={adding}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddToFlashcardsModal; 