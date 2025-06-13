import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTrash, 
  faSearch, 
  faSort, 
  faBook, 
  faLayerGroup, 
  faPlus,
  faPlay,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import { getFlashcardDecks } from '../api/helperClient';
import AddToFlashcardsModal from '../components/AddToFlashcardsModal';
import FlashcardStudy from '../components/FlashcardStudy';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/WordBank.css';

/**
 * WordBank component - displays all saved vocabulary words with flashcard functionality
 */
export default function WordBank() {
  const { currentUser } = useAuth();
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'
  
  // Flashcard states
  const [flashcardDecks, setFlashcardDecks] = useState([]);
  const [decksLoading, setDecksLoading] = useState(false);
  const [showAddToFlashcards, setShowAddToFlashcards] = useState(false);
  const [selectedWord, setSelectedWord] = useState(null);
  const [studyDeck, setStudyDeck] = useState(null);
  const [activeTab, setActiveTab] = useState('words'); // 'words' or 'flashcards'

  // Load words on component mount
  useEffect(() => {
    const loadWords = async () => {
      if (!currentUser) return;

      try {
        setLoading(true);
        
        // Query for items of type 'word' from the bankItems collection (same as ConceptBank)
        const q = query(
          collection(db, 'users', currentUser.uid, 'bankItems'),
          where('type', '==', 'word')
        );
        
        const querySnapshot = await getDocs(q);
        
        const wordList = [];
        querySnapshot.forEach((doc) => {
          const wordData = doc.data();
          wordList.push({
            id: doc.id,
            word: wordData.term, // Map 'term' to 'word' for compatibility
            definition: wordData.definition,
            quizId: wordData.metadata?.quizId || null,
            savedAt: wordData.createdAt?.toDate() || new Date()
          });
        });
        
        setWords(wordList);
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

  // Load flashcard decks
  const loadFlashcardDecks = async () => {
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
  };

  // Load flashcard decks when tab changes to flashcards
  useEffect(() => {
    if (activeTab === 'flashcards') {
      loadFlashcardDecks();
    }
  }, [activeTab, currentUser]);

  // Handle word removal
  const handleRemoveWord = async (wordId) => {
    if (!currentUser) return;

    try {
      // Delete directly from Firebase (same as ConceptBank)
      await deleteDoc(doc(db, 'users', currentUser.uid, 'bankItems', wordId));
      // Update local state by removing the word
      setWords(prevWords => prevWords.filter(word => word.id !== wordId));
      toast.success('Word removed from your bank');
    } catch (error) {
      console.error('Error removing word:', error);
      toast.error('Failed to remove word. Please try again.');
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

  // Handle add to flashcards
  const handleAddToFlashcards = (word) => {
    setSelectedWord(word);
    setShowAddToFlashcards(true);
  };

  // Handle flashcard modal close
  const handleFlashcardModalClose = () => {
    setShowAddToFlashcards(false);
    setSelectedWord(null);
  };

  // Handle word added to flashcard deck
  const handleWordAddedToFlashcards = (deckId) => {
    // Refresh flashcard decks if on flashcards tab
    if (activeTab === 'flashcards') {
      loadFlashcardDecks();
    }
  };

  // Handle study deck
  const handleStudyDeck = (deck) => {
    setStudyDeck(deck);
  };

  // Handle close study
  const handleCloseStudy = () => {
    setStudyDeck(null);
    // Refresh decks to update last studied time
    if (activeTab === 'flashcards') {
      loadFlashcardDecks();
    }
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

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === 'words' ? 'active' : ''}`}
          onClick={() => setActiveTab('words')}
        >
          <FontAwesomeIcon icon={faBook} />
          Word Bank ({words.length})
        </button>
        <button 
          className={`tab-button ${activeTab === 'flashcards' ? 'active' : ''}`}
          onClick={() => setActiveTab('flashcards')}
        >
          <FontAwesomeIcon icon={faLayerGroup} />
          Flashcard Decks ({flashcardDecks.length})
        </button>
      </div>

      {activeTab === 'words' ? (
        <>
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
                    <div className="word-actions">
                      <button 
                        className="add-to-flashcards-button"
                        onClick={() => handleAddToFlashcards(word)}
                        title="Add to flashcards"
                      >
                        <FontAwesomeIcon icon={faLayerGroup} />
                        Add to Flashcards
                      </button>
                      <button 
                        className="remove-word-button"
                        onClick={() => handleRemoveWord(word.id)}
                        title="Remove from word bank"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
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
        </>
      ) : (
        /* Flashcard Decks Tab */
        <div className="flashcards-section">
          {decksLoading ? (
            <div className="word-bank-loading">
              <FontAwesomeIcon icon={faSpinner} spin />
              Loading flashcard decks...
            </div>
          ) : flashcardDecks.length === 0 ? (
            <div className="word-bank-empty">
              <FontAwesomeIcon icon={faLayerGroup} className="empty-icon" />
              <h3>No flashcard decks yet</h3>
              <p>Start by adding words to flashcards from your word bank!</p>
              <button 
                className="switch-tab-button"
                onClick={() => setActiveTab('words')}
              >
                <FontAwesomeIcon icon={faBook} />
                Go to Word Bank
              </button>
            </div>
          ) : (
            <div className="flashcard-decks-grid">
              {flashcardDecks.map((deck) => (
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
                          Last studied: {new Date(deck.lastStudiedAt.toDate()).toLocaleDateString()}
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
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add to Flashcards Modal */}
      {showAddToFlashcards && selectedWord && (
        <AddToFlashcardsModal
          isOpen={showAddToFlashcards}
          onClose={handleFlashcardModalClose}
          word={selectedWord}
          onWordAdded={handleWordAddedToFlashcards}
        />
      )}

      {/* Toast Container for notifications */}
      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
}
