import React, { useState, useEffect, useCallback } from 'react';
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
  faPlay,
  faSpinner,
  faQuestionCircle,
  faEdit,
  faPlus
} from '@fortawesome/free-solid-svg-icons';
import { getFlashcardDecks, deleteFlashcardDeck, removeWordFromFlashcardDeck, getFlashcardDeckWords, createFlashcardDeck } from '../api/helperClient';
import AddToFlashcardsModal from '../components/AddToFlashcardsModal';
import FlashcardStudy from '../components/FlashcardStudy';
import WordQuizzes from '../components/WordQuizzes';
import Quiz from '../components/Quiz';
import EditDeckModal from '../components/EditDeckModal';
import NewDeckModal from '../components/NewDeckModal';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/WordBank.css';
import WordBankUpgradeModal from '../components/WordBankUpgradeModal';
import '../components/WordBankUpgradeModal.css';

/**
 * WordBank component - displays all saved vocabulary words with flashcard functionality
 */
export default function WordBank() {
  const { currentUser, isProMember } = useAuth();
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
  const [activeTab, setActiveTab] = useState('words'); // 'words', 'flashcards', or 'quizzes'
  const [showEditDeckModal, setShowEditDeckModal] = useState(false);
  const [deckToEdit, setDeckToEdit] = useState(null);
  const [showNewDeckModal, setShowNewDeckModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [featureName, setFeatureName] = useState('');

  // Quiz states
  const [activeQuiz, setActiveQuiz] = useState(null);

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

  // Load flashcard decks on mount (for tab header count)
  useEffect(() => {
    if (currentUser) {
      loadFlashcardDecks();
    }
  }, [currentUser, loadFlashcardDecks]);

  // Refresh flashcard decks when tab changes to flashcards or quizzes
  useEffect(() => {
    if ((activeTab === 'flashcards' || activeTab === 'quizzes') && currentUser) {
      loadFlashcardDecks();
    }
  }, [activeTab, currentUser, loadFlashcardDecks]);

  // Handle word removal
  const handleRemoveWord = async (wordId) => {
    if (!currentUser) return;

    // Find the word to get its name for the confirmation dialog
    const wordToDelete = words.find(word => word.id === wordId);
    const wordName = wordToDelete ? wordToDelete.word : 'this word';

    // Show confirmation dialog with warning about flashcard removal
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${wordName}"?`
    );
    
    if (!confirmDelete) return;

    try {
      console.log(`Starting cascading delete for word ID: ${wordId}, word: ${wordName}`);
      
      // First, get all flashcard decks to check if this word exists in any of them
      const allDecks = await getFlashcardDecks();
      console.log(`Found ${allDecks.length} flashcard decks to check:`, allDecks);
      
      // Debug: Log the full structure of the first deck to understand the schema
      if (allDecks.length > 0) {
        console.log('Full structure of first deck:', JSON.stringify(allDecks[0], null, 2));
        console.log('Available properties:', Object.keys(allDecks[0]));
      }
      
      // Optimize: Only check decks that have words (wordCount > 0)
      const decksWithWords = allDecks.filter(deck => deck.wordCount > 0);
      console.log(`Checking ${decksWithWords.length} decks with words`);
      
      // Fetch words for all decks in parallel for better performance
      const deckWordsPromises = decksWithWords.map(async (deck) => {
        try {
          const deckWords = await getFlashcardDeckWords(deck.id);
          return { deck, words: deckWords };
        } catch (error) {
          console.warn(`Failed to fetch words for deck "${deck.name}":`, error);
          return { deck, words: [] };
        }
      });
      
      const deckWordsResults = await Promise.allSettled(deckWordsPromises);
      
      // Find decks that contain this word and remove it from them
      const removalPromises = [];
      
      for (const result of deckWordsResults) {
        if (result.status === 'fulfilled') {
          const { deck, words: deckWords } = result.value;
          console.log(`Checking deck "${deck.name}" (ID: ${deck.id}):`, deckWords);
          
          if (deckWords && deckWords.length > 0) {
            // Check if this word exists in the deck
            const wordInDeck = deckWords.find(word => word.id === wordId);
            console.log(`Word ${wordId} in deck ${deck.name}:`, wordInDeck);
            
            if (wordInDeck) {
              console.log(`Word found in deck "${deck.name}", removing...`);
              // This deck contains the word, so remove it
              removalPromises.push(
                removeWordFromFlashcardDeck(deck.id, wordId).then(() => {
                  console.log(`Successfully removed word from deck ${deck.name}`);
                }).catch(error => {
                  console.warn(`Failed to remove word from deck ${deck.name}:`, error);
                  // Don't throw here - we want to continue with the main deletion
                })
              );
            }
          }
        }
      }
      
      console.log(`Found ${removalPromises.length} decks containing the word`);
      
      // Wait for all flashcard removals to complete (or fail)
      if (removalPromises.length > 0) {
        await Promise.allSettled(removalPromises);
        console.log(`Word removed from ${removalPromises.length} flashcard deck(s)`);
      }

      // Delete from Firebase Word Bank (same as ConceptBank)
      await deleteDoc(doc(db, 'users', currentUser.uid, 'bankItems', wordId));
      
      // Update local state by removing the word
      setWords(prevWords => prevWords.filter(word => word.id !== wordId));
      
      // Refresh flashcard decks if we're on those tabs to reflect the changes
      if (activeTab === 'flashcards' || activeTab === 'quizzes') {
        loadFlashcardDecks();
      }
      
      toast.success('Word removed from your bank and all flashcard decks');
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
    // Refresh flashcard decks if on flashcards or quizzes tab
    if (activeTab === 'flashcards' || activeTab === 'quizzes') {
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
    if (activeTab === 'flashcards' || activeTab === 'quizzes') {
      loadFlashcardDecks();
    }
  };

  // Handle start quiz
  const handleStartQuiz = (deck) => {
    setActiveQuiz(deck);
  };

  // Handle close quiz
  const handleCloseQuiz = () => {
    setActiveQuiz(null);
  };

  // Handle delete deck
  const handleDeleteDeck = async (deck) => {
    if (deck.name === 'Deck 1') {
      toast.error('Cannot delete the default deck');
      return;
    }

    const confirmDelete = window.confirm(`Are you sure you want to delete "${deck.name}"? This will permanently remove the deck and all its words.`);
    if (!confirmDelete) return;

    try {
      await deleteFlashcardDeck(deck.id);
      toast.success(`Deck "${deck.name}" deleted successfully`);
      // Refresh the decks list
      loadFlashcardDecks();
    } catch (error) {
      console.error('Error deleting deck:', error);
      toast.error('Failed to delete deck. Please try again.');
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
  const handleDeckUpdate = async () => {
    try {
      // Simply refresh the decks list to get updated data
      await loadFlashcardDecks();
    } catch (error) {
      console.error('Error updating deck:', error);
      toast.error('Failed to update deck. Please try again.');
    }
  };

  const handleCreateNewDeck = async (deckName, deckDescription) => {
    try {
      await createFlashcardDeck(deckName, deckDescription);
      toast.success(`Deck "${deckName}" created successfully`);
      setShowNewDeckModal(false);
      loadFlashcardDecks();
    } catch (error) {
      console.error('Error creating deck:', error);
      toast.error('Failed to create deck. Please try again.');
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

  const handleTabClick = (tab, feature) => {
    if (!isProMember && (tab === 'flashcards' || tab === 'quizzes')) {
      setFeatureName(feature);
      setShowUpgradeModal(true);
    } else {
      setActiveTab(tab);
    }
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

  // If taking a quiz, show the quiz interface
  if (activeQuiz) {
    return (
      <Quiz
        deckId={activeQuiz.id}
        deckName={activeQuiz.name}
        onClose={handleCloseQuiz}
        allWords={words}
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
          onClick={() => handleTabClick('words')}
        >
          <FontAwesomeIcon icon={faBook} />
          Word Bank ({words.length})
        </button>
        <button 
          className={`tab-button ${activeTab === 'flashcards' ? 'active' : ''}`}
          onClick={() => handleTabClick('flashcards', 'Flashcard Decks')}
        >
          <FontAwesomeIcon icon={faLayerGroup} />
          Flashcard Decks ({flashcardDecks.length})
          <span className="pro-badge">PRO</span>
        </button>
        {activeTab === 'flashcards' && (
          <button className="new-deck-button" onClick={() => setShowNewDeckModal(true)}>
            <FontAwesomeIcon icon={faPlus} /> New Deck
          </button>
        )}
        <button 
          className={`tab-button ${activeTab === 'quizzes' ? 'active' : ''}`}
          onClick={() => handleTabClick('quizzes', 'Word Quizzes')}
        >
          <FontAwesomeIcon icon={faQuestionCircle} />
          Word Quizzes ({flashcardDecks.filter(deck => deck.wordCount >= 4).length})
          <span className="pro-badge">PRO</span>
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
      ) : activeTab === 'flashcards' ? (
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
      ) : activeTab === 'quizzes' ? (
        /* Word Quizzes Tab */
        <WordQuizzes
          flashcardDecks={flashcardDecks}
          loading={decksLoading}
          onStartQuiz={handleStartQuiz}
          onDeleteDeck={handleDeleteDeck}
        />
      ) : null}

      {/* Add to Flashcards Modal */}
      {showAddToFlashcards && selectedWord && (
        <AddToFlashcardsModal
          isOpen={showAddToFlashcards}
          onClose={handleFlashcardModalClose}
          word={selectedWord}
          onWordAdded={handleWordAddedToFlashcards}
        />
      )}

      {/* Edit Deck Modal */}
      {showEditDeckModal && deckToEdit && (
        <EditDeckModal
          isOpen={showEditDeckModal}
          onClose={handleEditDeckModalClose}
          deck={deckToEdit}
          onDeckUpdated={handleDeckUpdate}
        />
      )}

      {/* New Deck Modal */}
      {showNewDeckModal && (
        <NewDeckModal
          isOpen={showNewDeckModal}
          onClose={() => setShowNewDeckModal(false)}
          onCreateDeck={handleCreateNewDeck}
        />
      )}

      {/* Toast Container for notifications */}
      <ToastContainer position="bottom-right" autoClose={3000} />

      {/* Upgrade Modal */}
      <WordBankUpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        featureName={featureName}
      />
    </div>
  );
}
