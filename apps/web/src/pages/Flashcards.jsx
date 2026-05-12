import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Papa from 'papaparse';
import { useAuth } from '../contexts/AuthContext';
import { useSidebar } from '../contexts/SidebarContext';
import {
  addWordToFlashcardDeck,
  createFlashcardDeck,
  deleteFlashcardDeck,
  getFlashcardDecks,
  saveBankItem,
} from '../api/helperClient';
import FlashcardStudy from '../components/FlashcardStudy';
import EditDeckModal from '../components/EditDeckModal';
import NewDeckModal from '../components/NewDeckModal';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/Flashcards.css';
import {
  FiBell,
  FiBookOpen,
  FiCalendar,
  FiChevronDown,
  FiClock,
  FiEdit3,
  FiExternalLink,
  FiFileText,
  FiGrid,
  FiLayers,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiStar,
  FiTrash2,
  FiTrendingUp,
  FiUpload,
  FiZap,
} from 'react-icons/fi';

const topNavItems = [
  { path: '/progress', label: 'Dashboard' },
  { path: '/practice-exams', label: 'Practice Exams' },
  { path: '/subject-quizzes', label: 'Question Bank' },
  { path: '/flashcards', label: 'Flashcards' },
  { path: '/ai-coach', label: 'AI Coach', badge: 'BETA' },
  { path: '/progress', label: 'Analytics' },
];

const topicFilters = ['Vocabulary', 'Reading', 'Writing', 'Math', 'Favorites'];
const sortOptions = [
  { value: 'recent', label: 'Recently Studied' },
  { value: 'cards', label: 'Most Cards' },
  { value: 'name', label: 'Deck Name' },
  { value: 'due', label: 'Due Soon' },
];

const fallbackDecks = [
  {
    id: 'sample-vocab-1',
    name: 'SAT 1000 Words - Deck 1',
    description: 'Vocabulary',
    wordCount: 50,
    lastStudiedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    sample: true,
  },
  {
    id: 'sample-vocab-2',
    name: 'SAT 1000 Words - Deck 2',
    description: 'Vocabulary',
    wordCount: 50,
    lastStudiedAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    sample: true,
  },
  {
    id: 'sample-reading-1',
    name: 'Transitions & Rhetorical Moves',
    description: 'Reading & Writing',
    wordCount: 40,
    lastStudiedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    sample: true,
  },
  {
    id: 'sample-reading-2',
    name: 'Inference Practice Terms',
    description: 'Reading',
    wordCount: 50,
    lastStudiedAt: null,
    sample: true,
  },
  {
    id: 'sample-math-1',
    name: 'Heart of Algebra Essentials',
    description: 'Math',
    wordCount: 60,
    lastStudiedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    sample: true,
  },
  {
    id: 'sample-math-2',
    name: 'Geometry & Formula Recall',
    description: 'Math',
    wordCount: 35,
    lastStudiedAt: null,
    sample: true,
  },
];

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const getDeckTopic = (deck) => {
  const text = `${deck.name || ''} ${deck.description || ''}`.toLowerCase();

  if (/math|algebra|geometry|formula|equation|linear|circle|triangle/.test(text)) {
    return 'Math';
  }

  if (/writing|grammar|punctuation|boundaries|rhetorical|transition/.test(text)) {
    return 'Writing';
  }

  if (/reading|inference|evidence|central idea|cross-text|text structure/.test(text)) {
    return 'Reading';
  }

  return 'Vocabulary';
};

const getDeckIcon = (topic, index) => {
  if (topic === 'Math') return index % 2 === 0 ? 'Ax' : 'Geo';
  if (topic === 'Reading') return 'Rd';
  if (topic === 'Writing') return 'Wr';
  return 'Abc';
};

const getMastery = (deck, index) => {
  const wordCount = Number(deck.wordCount || 0);
  if (wordCount <= 0) return 0;

  const studiedBoost = deck.lastStudiedAt ? 14 : 0;
  const countBoost = clamp(Math.round(wordCount / 5), 4, 14);
  const stagger = (index % 5) * 5;

  return clamp(44 + countBoost + studiedBoost + stagger, 35, 92);
};

const getDueScore = (deck) => {
  if (!deck.lastStudiedAt) return Number.MAX_SAFE_INTEGER;
  return Date.now() - new Date(deck.lastStudiedAt).getTime();
};

const formatRelativeStudy = (lastStudiedAt) => {
  if (!lastStudiedAt) return 'Not studied yet';

  const diffMs = Date.now() - new Date(lastStudiedAt).getTime();
  const minutes = Math.max(1, Math.round(diffMs / 60000));
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);

  if (minutes < 60) return `Studied ${minutes}m ago`;
  if (hours < 24) return `Studied ${hours}h ago`;
  if (days <= 1) return 'Studied 1d ago';
  return `Studied ${days}d ago`;
};

const getDueLabel = (lastStudiedAt) => {
  if (!lastStudiedAt) return { text: 'Due today', urgent: true };

  const diffDays = Math.floor((Date.now() - new Date(lastStudiedAt).getTime()) / 86400000);
  if (diffDays >= 5) return { text: 'Due today', urgent: true };

  const remaining = Math.max(1, 5 - diffDays);
  return { text: `Due in ${remaining} day${remaining === 1 ? '' : 's'}`, urgent: false };
};

const normalizeCsvRows = (rows) => {
  return rows
    .map((row) => {
      const values = Array.isArray(row) ? row : Object.values(row);
      const term =
        row.term ||
        row.word ||
        row.vocabulary ||
        row.front ||
        row.question ||
        values[0];
      const definition =
        row.definition ||
        row.meaning ||
        row.back ||
        row.answer ||
        values[1];

      return {
        term: String(term || '').trim(),
        definition: String(definition || '').trim(),
      };
    })
    .filter((row) => row.term && row.definition)
    .slice(0, 100);
};

const parseCsvFile = (file) =>
  new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => resolve(result.data || []),
      error: reject,
    });
  });

export default function Flashcards() {
  const { currentUser } = useAuth();
  const { isMobile, setSidebarCollapsed } = useSidebar();
  const navigate = useNavigate();
  const csvInputRef = useRef(null);

  const [flashcardDecks, setFlashcardDecks] = useState([]);
  const [decksLoading, setDecksLoading] = useState(false);
  const [studyDeck, setStudyDeck] = useState(null);
  const [showEditDeckModal, setShowEditDeckModal] = useState(false);
  const [deckToEdit, setDeckToEdit] = useState(null);
  const [showNewDeckModal, setShowNewDeckModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTopic, setActiveTopic] = useState('Vocabulary');
  const [topicSelect, setTopicSelect] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [csvImporting, setCsvImporting] = useState(false);

  const loadFlashcardDecks = useCallback(async () => {
    if (!currentUser) return;

    try {
      setDecksLoading(true);
      const decks = await getFlashcardDecks();
      setFlashcardDecks(Array.isArray(decks) ? decks : []);
    } catch (error) {
      console.error('Error loading flashcard decks:', error);
      toast.error('Failed to load flashcard decks');
    } finally {
      setDecksLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    const appContainer = document.querySelector('.app-container');
    if (appContainer) {
      appContainer.classList.add('flashcards-shell-active');
    }

    if (!isMobile) {
      setSidebarCollapsed(false);
    }

    return () => {
      if (appContainer) {
        appContainer.classList.remove('flashcards-shell-active');
      }
    };
  }, [isMobile, setSidebarCollapsed]);

  useEffect(() => {
    if (currentUser) {
      loadFlashcardDecks();
    }
  }, [currentUser, loadFlashcardDecks]);

  const validDecks = useMemo(
    () => flashcardDecks.filter((deck) => deck && deck.id),
    [flashcardDecks]
  );

  const displayDecks = validDecks.length > 0 ? validDecks : fallbackDecks;
  const usingSamples = validDecks.length === 0 && !decksLoading;

  const deckCards = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return displayDecks
      .map((deck, index) => ({
        ...deck,
        topic: getDeckTopic(deck),
        mastery: getMastery(deck, index),
        orderIndex: index,
      }))
      .filter((deck) => {
        const matchesSearch =
          !normalizedSearch ||
          `${deck.name || ''} ${deck.description || ''}`.toLowerCase().includes(normalizedSearch);
        const matchesTopicSelect = topicSelect === 'all' || deck.topic === topicSelect;
        const matchesChip = activeTopic === 'Favorites' ? deck.mastery >= 78 : deck.topic === activeTopic;

        return matchesSearch && matchesTopicSelect && matchesChip;
      })
      .sort((a, b) => {
        if (sortBy === 'cards') return Number(b.wordCount || 0) - Number(a.wordCount || 0);
        if (sortBy === 'name') return String(a.name || '').localeCompare(String(b.name || ''));
        if (sortBy === 'due') return getDueScore(b) - getDueScore(a);
        return getDueScore(a) - getDueScore(b);
      });
  }, [activeTopic, displayDecks, searchTerm, sortBy, topicSelect]);

  const featuredDeck = useMemo(() => {
    return (
      displayDecks.find((deck) => Number(deck.wordCount || 0) > 0 && deck.lastStudiedAt) ||
      displayDecks.find((deck) => Number(deck.wordCount || 0) > 0) ||
      displayDecks[0]
    );
  }, [displayDecks]);

  const featuredIndex = Math.max(0, displayDecks.findIndex((deck) => deck.id === featuredDeck?.id));
  const featuredMastery = featuredDeck ? getMastery(featuredDeck, featuredIndex) : 0;
  const featuredMasteredCards = featuredDeck
    ? Math.round(Number(featuredDeck.wordCount || 0) * (featuredMastery / 100))
    : 0;

  const totals = useMemo(() => {
    const cards = displayDecks.reduce((sum, deck) => sum + Number(deck.wordCount || 0), 0);
    const studied = displayDecks
      .filter((deck) => deck.lastStudiedAt)
      .reduce((sum, deck) => sum + Number(deck.wordCount || 0), 0);
    const dueCards = displayDecks
      .filter((deck) => getDueLabel(deck.lastStudiedAt).urgent)
      .reduce((sum, deck) => sum + Number(deck.wordCount || 0), 0);
    const masteryAverage = displayDecks.length
      ? Math.round(displayDecks.reduce((sum, deck, index) => sum + getMastery(deck, index), 0) / displayDecks.length)
      : 0;

    return {
      cards,
      studied,
      dueCards,
      masteryAverage,
    };
  }, [displayDecks]);

  const userName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Alex';
  const firstInitial = userName.charAt(0).toUpperCase();

  const handleStudyDeck = (deck) => {
    if (deck.sample) {
      toast.info('Create or import a deck to start a real review session.');
      return;
    }

    setStudyDeck(deck);
  };

  const handleCloseStudy = () => {
    setStudyDeck(null);
    loadFlashcardDecks();
  };

  const handleDeleteDeck = async (deck) => {
    if (!window.confirm(`Are you sure you want to delete "${deck.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteFlashcardDeck(deck.id);
      toast.success(`Deck "${deck.name}" deleted successfully`);
      loadFlashcardDecks();
    } catch (error) {
      console.error('Error deleting deck:', error);
      toast.error('Failed to delete deck');
    }
  };

  const handleEditDeck = (deck) => {
    setDeckToEdit(deck);
    setShowEditDeckModal(true);
  };

  const handleEditDeckModalClose = () => {
    setShowEditDeckModal(false);
    setDeckToEdit(null);
  };

  const handleDeckUpdate = () => {
    loadFlashcardDecks();
    handleEditDeckModalClose();
  };

  const handleCreateNewDeck = async (deckName, deckDescription) => {
    try {
      await createFlashcardDeck(deckName, deckDescription);
      toast.success(`Deck "${deckName}" created`);
      setShowNewDeckModal(false);
      loadFlashcardDecks();
    } catch (error) {
      console.error('Error creating flashcard deck:', error);
      toast.error('Failed to create deck');
    }
  };

  const handleImportCsv = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setCsvImporting(true);
      const parsedRows = await parseCsvFile(file);
      const rows = normalizeCsvRows(parsedRows);

      if (rows.length === 0) {
        toast.error('CSV needs term and definition columns.');
        return;
      }

      const deckName = file.name.replace(/\.[^/.]+$/, '') || 'Imported Flashcards';
      const deckId = await createFlashcardDeck(deckName, `Imported from ${file.name}`);

      for (const row of rows) {
        const wordId = await saveBankItem(row.term, row.definition, 'word', 'csv', {
          importedFrom: file.name,
        });
        await addWordToFlashcardDeck(deckId, wordId);
      }

      toast.success(`Imported ${rows.length} cards into "${deckName}"`);
      loadFlashcardDecks();
    } catch (error) {
      console.error('Error importing CSV:', error);
      toast.error('Failed to import CSV');
    } finally {
      setCsvImporting(false);
      event.target.value = '';
    }
  };

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
    <div className="flashcards-page">
      <header className="flashcards-top-nav" aria-label="Flashcards navigation">
        <nav className="flashcards-top-nav-links">
          {topNavItems.map((item) => (
            <Link
              key={`${item.label}-${item.path}`}
              to={item.path}
              className={`flashcards-top-nav-link ${item.path === '/flashcards' ? 'active' : ''}`}
            >
              {item.label}
              {item.badge && <span className="flashcards-beta-badge">{item.badge}</span>}
            </Link>
          ))}
        </nav>
        <div className="flashcards-top-actions">
          <label className="flashcards-global-search">
            <FiSearch aria-hidden="true" />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search anything..."
              aria-label="Search flashcards"
            />
            <span className="flashcards-shortcut">Cmd K</span>
          </label>
          <button type="button" className="flashcards-icon-button" aria-label="Notifications">
            <FiBell />
            <span className="flashcards-notification-dot">3</span>
          </button>
          <button type="button" className="flashcards-user-button" aria-label="Open profile">
            <span className="flashcards-user-avatar">{firstInitial}</span>
            <span className="flashcards-user-name">{userName}</span>
            <FiChevronDown />
          </button>
        </div>
      </header>

      <main className="flashcards-content">
        <section className="flashcards-hero-grid" aria-label="Flashcards overview">
          <div className="flashcards-heading-block">
            <div className="flashcards-title-row">
              <h1 className="flashcards-page-title">Flashcards</h1>
              <FiStar className="flashcards-title-spark" aria-hidden="true" />
            </div>
            <p className="flashcards-page-subtitle">
              Review your decks, track mastery, and create new flashcard sets.
            </p>
          </div>

          <article className="flashcards-stat-card">
            <span className="flashcards-stat-icon"><FiFileText /></span>
            <div>
              <span className="flashcards-stat-label">Cards Studied</span>
              <strong>{totals.studied || totals.cards}</strong>
            </div>
          </article>

          <article className="flashcards-stat-card">
            <span
              className="flashcards-stat-ring"
              style={{ '--progress': `${totals.masteryAverage * 3.6}deg` }}
              aria-hidden="true"
            />
            <div>
              <span className="flashcards-stat-label">Overall Mastery</span>
              <strong>{totals.masteryAverage}%</strong>
            </div>
          </article>

          <article className="flashcards-stat-card">
            <span className="flashcards-stat-icon"><FiCalendar /></span>
            <div>
              <span className="flashcards-stat-label">Due Today</span>
              <strong>{totals.dueCards}</strong>
            </div>
          </article>
        </section>

        <section className="flashcards-feature-grid" aria-label="Review and deck creation">
          <article className="flashcards-panel flashcards-continue-panel">
            <div className="flashcards-panel-title">
              <FiRefreshCw aria-hidden="true" />
              <h2>Continue Reviewing</h2>
            </div>
            {featuredDeck ? (
              <div className="flashcards-continue-body">
                <span className={`flashcards-deck-glyph topic-${getDeckTopic(featuredDeck).toLowerCase()}`}>
                  {getDeckIcon(getDeckTopic(featuredDeck), featuredIndex)}
                </span>
                <div className="flashcards-current-copy">
                  <h3>{featuredDeck.name}</h3>
                  <div className="flashcards-mini-meta">
                    <span>{Number(featuredDeck.wordCount || 0)} cards</span>
                    <span>{featuredMasteredCards} mastered</span>
                  </div>
                  <div className="flashcards-mini-progress" aria-hidden="true">
                    <span style={{ width: `${featuredMastery}%` }} />
                  </div>
                  <p>{featuredMasteredCards} of {Number(featuredDeck.wordCount || 0)} cards mastered</p>
                </div>
                <div
                  className="flashcards-progress-ring"
                  style={{ '--progress': `${featuredMastery * 3.6}deg` }}
                  aria-label={`${featuredMastery} percent mastery`}
                >
                  <span>{featuredMastery}%</span>
                </div>
                <button
                  type="button"
                  className="flashcards-primary-button"
                  onClick={() => handleStudyDeck(featuredDeck)}
                  disabled={Number(featuredDeck.wordCount || 0) === 0}
                >
                  Resume Review
                </button>
              </div>
            ) : (
              <div className="flashcards-empty-inline">Create your first deck to start reviewing.</div>
            )}
          </article>

          <article className="flashcards-panel flashcards-create-panel">
            <div className="flashcards-panel-title">
              <FiZap aria-hidden="true" />
              <div>
                <h2>Create New Deck</h2>
                <p>Build your own deck or let AI do the work.</p>
              </div>
            </div>
            <div className="flashcards-create-options">
              <button type="button" onClick={() => setShowNewDeckModal(true)}>
                <FiPlus />
                <span>Create Empty Deck</span>
              </button>
              <button type="button" onClick={() => navigate('/ai-coach')}>
                <FiZap />
                <span>Generate with AI</span>
              </button>
              <button type="button" onClick={() => csvInputRef.current?.click()} disabled={csvImporting}>
                <FiUpload />
                <span>{csvImporting ? 'Importing...' : 'Import CSV'}</span>
              </button>
            </div>
            <button
              type="button"
              className="flashcards-wide-create"
              onClick={() => setShowNewDeckModal(true)}
            >
              <FiPlus />
              Create New Flashcard Deck
            </button>
            <input
              ref={csvInputRef}
              type="file"
              accept=".csv,text/csv"
              className="flashcards-hidden-input"
              onChange={handleImportCsv}
            />
          </article>
        </section>

        <section className="flashcards-controls" aria-label="Deck filters">
          <label className="flashcards-deck-search">
            <FiSearch />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search decks..."
              aria-label="Search decks"
            />
          </label>

          <label className="flashcards-select-control">
            <select
              value={topicSelect}
              onChange={(event) => setTopicSelect(event.target.value)}
              aria-label="Filter by topic"
            >
              <option value="all">All Topics</option>
              <option value="Vocabulary">Vocabulary</option>
              <option value="Reading">Reading</option>
              <option value="Writing">Writing</option>
              <option value="Math">Math</option>
            </select>
            <FiChevronDown aria-hidden="true" />
          </label>

          <label className="flashcards-select-control">
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              aria-label="Sort decks"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <FiChevronDown aria-hidden="true" />
          </label>

          <div className="flashcards-filter-group">
            {topicFilters.map((topic) => (
              <button
                key={topic}
                type="button"
                className={`flashcards-filter-chip ${activeTopic === topic ? 'active' : ''}`}
                onClick={() => setActiveTopic(topic)}
              >
                {topic === 'Favorites' && <FiStar />}
                {topic}
              </button>
            ))}
          </div>
        </section>

        <section className="flashcards-deck-grid" aria-label="Flashcard decks">
          {decksLoading ? (
            <div className="flashcards-loading">
              <FiRefreshCw />
              Loading flashcard decks...
            </div>
          ) : deckCards.length === 0 ? (
            <div className="flashcards-empty">
              <FiLayers />
              <h3>No decks match these filters</h3>
              <p>Try another topic, or create a new flashcard deck.</p>
              <button type="button" onClick={() => setShowNewDeckModal(true)}>
                <FiPlus />
                Create Deck
              </button>
            </div>
          ) : (
            deckCards.map((deck) => {
              const due = getDueLabel(deck.lastStudiedAt);
              const canModify = !deck.sample && deck.name !== 'Deck 1';
              const topic = deck.topic;
              const icon = getDeckIcon(topic, deck.orderIndex);

              return (
                <article className="flashcards-deck-card" key={deck.id}>
                  <div className="flashcards-deck-header">
                    <span className={`flashcards-deck-glyph topic-${topic.toLowerCase()}`}>{icon}</span>
                    <div className="flashcards-deck-title">
                      <div className="flashcards-deck-name-row">
                        <h3>{deck.name}</h3>
                        <span className={`flashcards-status-pill ${deck.mastery >= 78 ? 'new' : ''}`}>
                          {deck.mastery >= 78 ? 'Strong' : 'In Progress'}
                        </span>
                      </div>
                      <p>{deck.description || topic}</p>
                    </div>
                    <div className="flashcards-card-actions">
                      {canModify && (
                        <>
                          <button type="button" onClick={() => handleEditDeck(deck)} aria-label={`Edit ${deck.name}`}>
                            <FiEdit3 />
                          </button>
                          <button type="button" onClick={() => handleDeleteDeck(deck)} aria-label={`Delete ${deck.name}`}>
                            <FiTrash2 />
                          </button>
                        </>
                      )}
                      {!canModify && <FiStar className="flashcards-card-star" aria-hidden="true" />}
                    </div>
                  </div>

                  <div className="flashcards-deck-meta">
                    <span>{Number(deck.wordCount || 0)} cards</span>
                    <span>{deck.mastery}% mastery</span>
                  </div>

                  <div className="flashcards-card-progress" aria-hidden="true">
                    <span style={{ width: `${deck.mastery}%` }} />
                  </div>

                  <div className="flashcards-card-footer">
                    <span className={due.urgent ? 'urgent' : ''}>
                      {due.urgent ? <FiCalendar /> : <FiClock />}
                      {due.urgent ? due.text : formatRelativeStudy(deck.lastStudiedAt)}
                    </span>
                    <div className="flashcards-card-right">
                      <div
                        className="flashcards-small-ring"
                        style={{ '--progress': `${deck.mastery * 3.6}deg` }}
                        aria-hidden="true"
                      >
                        <span>{deck.mastery}%</span>
                      </div>
                      <button
                        type="button"
                        className="flashcards-card-button"
                        onClick={() => handleStudyDeck(deck)}
                        disabled={Number(deck.wordCount || 0) === 0}
                      >
                        {Number(deck.wordCount || 0) === 0 ? 'No Cards' : 'Review Deck'}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </section>

        {usingSamples && (
          <p className="flashcards-sample-note">
            Sample decks are shown until your account has flashcard decks. Create or import a deck to replace them.
          </p>
        )}

        <section className="flashcards-insight-grid" aria-label="Flashcard resources">
          <article className="flashcards-insight-card">
            <span className="flashcards-insight-icon"><FiGrid /></span>
            <div>
              <h2>AI-Generated Decks</h2>
              <p>Turn any SAT topic into flashcards in seconds.</p>
              <button type="button" onClick={() => navigate('/ai-coach')}>
                Generate a Deck
                <FiExternalLink />
              </button>
            </div>
          </article>

          <article className="flashcards-insight-card">
            <span className="flashcards-insight-icon"><FiTrendingUp /></span>
            <div>
              <h2>Study Tips</h2>
              <p>Spaced repetition works best with daily review.</p>
              <button type="button" onClick={() => navigate('/help')}>
                View Tips
                <FiExternalLink />
              </button>
            </div>
          </article>
        </section>
      </main>

      {showEditDeckModal && deckToEdit && (
        <EditDeckModal
          isOpen={showEditDeckModal}
          onClose={handleEditDeckModalClose}
          deck={deckToEdit}
          onDeckUpdated={handleDeckUpdate}
        />
      )}

      {showNewDeckModal && (
        <NewDeckModal
          isOpen={showNewDeckModal}
          onClose={() => setShowNewDeckModal(false)}
          onCreateDeck={handleCreateNewDeck}
        />
      )}

      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
}
