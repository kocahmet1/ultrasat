import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import '../styles/NewDeckModal.css';

const NewDeckModal = ({ isOpen, onClose, onCreateDeck }) => {
  const [deckName, setDeckName] = useState('');
  const [deckDescription, setDeckDescription] = useState('');

  const handleCreate = () => {
    if (deckName.trim()) {
      onCreateDeck(deckName, deckDescription);
      setDeckName('');
      setDeckDescription('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close-button" onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
        <h2>Create New Flashcard Deck</h2>
        <div className="form-group">
          <label htmlFor="deckName">Deck Name</label>
          <input
            type="text"
            id="deckName"
            value={deckName}
            onChange={(e) => setDeckName(e.target.value)}
            placeholder="Enter deck name"
          />
        </div>
        <div className="form-group">
          <label htmlFor="deckDescription">Description (Optional)</label>
          <textarea
            id="deckDescription"
            value={deckDescription}
            onChange={(e) => setDeckDescription(e.target.value)}
            placeholder="Enter a short description"
            rows="3"
          />
        </div>
        <div className="modal-actions">
          <button className="cancel-button" onClick={onClose}>
            Cancel
          </button>
          <button
            className="create-button"
            onClick={handleCreate}
            disabled={!deckName.trim()}
          >
            Create Deck
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewDeckModal;
