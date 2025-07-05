import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSpinner, faSearch } from '@fortawesome/free-solid-svg-icons';
import { getAllWords, addWordToFlashcardDeck } from '../api/helperClient';
import { toast } from 'react-toastify';
import '../styles/AddWordsToDeck.css';

const AddWordsToDeck = ({ deck, existingWordIds, onWordAdded }) => {
  const [allWords, setAllWords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addingWordIds, setAddingWordIds] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadAllWords();
  }, []);

  const loadAllWords = async () => {
    try {
      setLoading(true);
      const words = await getAllWords();
      setAllWords(words);
    } catch (error) {
      console.error('Error loading all words:', error);
      toast.error('Failed to load words from your word bank.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddWord = async (word) => {
    try {
      setAddingWordIds(prev => new Set(prev).add(word.id));
      await addWordToFlashcardDeck(deck.id, word.id);
      toast.success(`"${word.term || word.word}" added to deck`);
      if (onWordAdded) {
        onWordAdded(word);
      }
    } catch (error) {
      console.error('Error adding word to deck:', error);
      toast.error('Failed to add word to deck');
    } finally {
      setAddingWordIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(word.id);
        return newSet;
      });
    }
  };

  const filteredWords = allWords
    .filter(word => !existingWordIds.has(word.id))
    .filter(word => {
      const term = (word.term || word.word).toLowerCase();
      const definition = word.definition.toLowerCase();
      const search = searchTerm.toLowerCase();
      return term.includes(search) || definition.includes(search);
    });

  return (
    <div className="add-words-to-deck">
      <div className="add-words-header">
        <h3>Add Words to "{deck.name}"</h3>
        <div className="search-bar">
          <FontAwesomeIcon icon={faSearch} />
          <input
            type="text"
            placeholder="Search your word bank..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="loading-words">
          <FontAwesomeIcon icon={faSpinner} className="spinner" />
          <p>Loading your word bank...</p>
        </div>
      ) : (
        <div className="available-words-list">
          {filteredWords.length === 0 ? (
            <p>No new words to add.</p>
          ) : (
            filteredWords.map(word => (
              <div key={word.id} className="available-word-item">
                <div className="word-info">
                  <div className="word-term">{word.term || word.word}</div>
                  <div className="word-definition">{word.definition}</div>
                </div>
                <button
                  className="add-word-btn"
                  onClick={() => handleAddWord(word)}
                  disabled={addingWordIds.has(word.id)}
                >
                  {addingWordIds.has(word.id) ? (
                    <FontAwesomeIcon icon={faSpinner} className="spinner" />
                  ) : (
                    <FontAwesomeIcon icon={faPlus} />
                  )}
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AddWordsToDeck;
