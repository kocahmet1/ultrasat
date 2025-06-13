import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faSearch, faSort, faBook } from '@fortawesome/free-solid-svg-icons';
import '../styles/WordBank.css';

// Get the current user's auth token
const getAuthToken = async () => {
  const { getAuth } = await import('firebase/auth');
  const auth = getAuth();
  if (auth.currentUser) {
    return auth.currentUser.getIdToken();
  }
  return null;
};

// Get API URL
const getApiUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.REACT_APP_API_URL || 'https://veritas-blue-web.onrender.com';
  } else {
    return process.env.REACT_APP_API_URL || 'http://localhost:3001';
  }
};

// Function to get words from the new bankItems system
const getWordsFromBank = async (userId) => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${getApiUrl()}/api/bank/items?type=word`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch words: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Transform the data to match the expected format for the WordBank component
    return data.items.map(item => ({
      id: item.id,
      word: item.term, // Map 'term' to 'word' for compatibility
      definition: item.definition,
      quizId: item.metadata?.quizId || null,
      savedAt: item.createdAt || new Date().toISOString()
    }));
  } catch (error) {
    console.error('Error getting word bank:', error);
    throw new Error('Failed to retrieve your word bank');
  }
};

// Function to remove word from the new bankItems system
const removeWordFromBank = async (userId, wordId) => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${getApiUrl()}/api/bank/items/${wordId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to remove word: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`Word with ID ${wordId} removed from word bank for user ${userId}`);
    return data;
  } catch (error) {
    console.error('Error removing word from bank:', error);
    throw new Error('Failed to remove word from your word bank');
  }
};

/**
 * WordBank component - displays all saved vocabulary words
 */
export default function WordBank() {
  const { currentUser } = useAuth();
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'

  // Load words on component mount
  useEffect(() => {
    const loadWords = async () => {
      if (!currentUser) return;

      try {
        setLoading(true);
        const wordBank = await getWordsFromBank(currentUser.uid);
        setWords(wordBank);
        setError(null);
      } catch (error) {
        console.error('Error loading word bank:', error);
        setError('Failed to load your word bank. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadWords();
  }, [currentUser]);

  // Handle word removal
  const handleRemoveWord = async (wordId) => {
    if (!currentUser) return;

    try {
      await removeWordFromBank(currentUser.uid, wordId);
      // Update local state by removing the word
      setWords(prevWords => prevWords.filter(word => word.id !== wordId));
    } catch (error) {
      console.error('Error removing word:', error);
      // Show error message to user
      alert('Failed to remove word. Please try again.');
    }
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Toggle sort order
  const toggleSortOrder = () => {
    setSortOrder(prevOrder => prevOrder === 'asc' ? 'desc' : 'asc');
  };

  // Filter and sort words
  const filteredWords = words
    .filter(word => 
      word.word.toLowerCase().includes(searchTerm.toLowerCase()) || 
      word.definition.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      return sortOrder === 'asc' 
        ? a.word.localeCompare(b.word) 
        : b.word.localeCompare(a.word);
    });

  return (
    <div className="word-bank-container">
      <div className="word-bank-header">
        <div className="word-bank-title">
          <FontAwesomeIcon icon={faBook} className="word-bank-icon" />
          <h1>My Word Bank</h1>
        </div>
        <p className="word-bank-description">
          Your personal collection of saved vocabulary words from SAT practice questions.
        </p>
      </div>

      <div className="word-bank-controls">
        <div className="search-container">
          <FontAwesomeIcon icon={faSearch} className="search-icon" />
          <input
            type="text"
            placeholder="Search words or definitions..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
        </div>
        <button 
          className="sort-button"
          onClick={toggleSortOrder}
          title={sortOrder === 'asc' ? 'Sort Z-A' : 'Sort A-Z'}
        >
          <FontAwesomeIcon icon={faSort} /> {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
        </button>
      </div>

      {loading ? (
        <div className="word-bank-loading">Loading your word bank...</div>
      ) : error ? (
        <div className="word-bank-error">{error}</div>
      ) : filteredWords.length === 0 ? (
        <div className="word-bank-empty">
          {searchTerm 
            ? 'No words match your search.' 
            : 'Your word bank is empty. Save vocabulary words from quizzes to build your collection.'}
        </div>
      ) : (
        <div className="word-list">
          {filteredWords.map((word) => (
            <div key={word.id} className="word-card">
              <div className="word-header">
                <h3 className="word-text">{word.word}</h3>
                <button 
                  className="remove-word-button"
                  onClick={() => handleRemoveWord(word.id)}
                  title="Remove from word bank"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
              <div className="word-definition">{word.definition}</div>
              {word.quizId && (
                <div className="word-source">
                  <small>From quiz: {word.quizId}</small>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
