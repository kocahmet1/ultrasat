import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getSubcategoriesArray } from '../utils/subcategoryConstants';
import { getSubcategoryProgress } from '../utils/progressUtils';
import {
  FaBell,
  FaBookOpen,
  FaBookmark,
  FaCalculator,
  FaChartLine,
  FaCheck,
  FaCheckCircle,
  FaChevronRight,
  FaLayerGroup,
  FaMagic,
  FaRegBookmark,
  FaSearch,
  FaSlidersH,
  FaUserCircle,
} from 'react-icons/fa';
import '../styles/SubjectQuizzes.css';
import Modal from '../components/Modal';
import { createMetaSmartQuiz } from '../utils/smartQuizUtils';

const LEVEL_OPTIONS = [
  { value: 1, label: 'Easy', tone: 'easy' },
  { value: 2, label: 'Medium', tone: 'medium' },
  { value: 3, label: 'Hard', tone: 'hard' },
];

const COMPLETED_TOPIC_IDS = new Set([3, 4, 8, 11, 13, 15, 18, 19, 22, 27, 28, 29]);
const POPULAR_TOPIC_IDS = new Set([8, 18, 23]);
const DEFAULT_FAVORITES = [5, 14, 25];

const getDefaultLevel = (subcategoryId) => {
  if ([4, 9, 11, 19, 20, 26].includes(subcategoryId)) return 1;
  if ([7, 17, 25, 28].includes(subcategoryId)) return 3;
  return 2;
};

const getLevelMeta = (level) => {
  return LEVEL_OPTIONS.find((option) => option.value === Number(level)) || LEVEL_OPTIONS[1];
};

const SubjectQuizzes = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const allSubcategories = useMemo(() => getSubcategoriesArray(), []);
  const [userLevels, setUserLevels] = useState({});
  const [loadingLevels, setLoadingLevels] = useState({});
  const [launchingTopicId, setLaunchingTopicId] = useState(null);
  const [topicLevels, setTopicLevels] = useState({});
  const [favoriteTopicIds, setFavoriteTopicIds] = useState(DEFAULT_FAVORITES);
  const [searchTerm, setSearchTerm] = useState('');
  const [sectionFilter, setSectionFilter] = useState('all');
  const [completedOnly, setCompletedOnly] = useState(false);
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  // Meta quiz state
  const [isMetaOpen, setIsMetaOpen] = useState(!!(location.state && location.state.openMeta));
  const [selectedSubcats, setSelectedSubcats] = useState([]);
  const [metaLevel, setMetaLevel] = useState(1);
  const [questionCount, setQuestionCount] = useState(5);
  const [creating, setCreating] = useState(false);
  const [metaError, setMetaError] = useState(null);

  const readingWritingSubcategories = allSubcategories.filter((sc) => sc.section === 'reading');
  const mathSubcategories = allSubcategories.filter((sc) => sc.section === 'math');

  const completedCount = allSubcategories.filter((subcategory) =>
    COMPLETED_TOPIC_IDS.has(subcategory.id) || (userLevels[subcategory.id] || 0) > 1
  ).length;

  const accountLabel = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Student';

  const getSelectedLevel = (subcategoryId) => (
    topicLevels[subcategoryId] || getDefaultLevel(subcategoryId)
  );

  const ensureUserLevel = async (subcategoryId) => {
    if (userLevels[subcategoryId]) {
      return userLevels[subcategoryId];
    }

    if (!currentUser || loadingLevels[subcategoryId]) {
      return 1;
    }

    setLoadingLevels((prev) => ({ ...prev, [subcategoryId]: true }));

    try {
      const progress = await getSubcategoryProgress(currentUser.uid, subcategoryId);
      const level = progress?.level || 1;
      setUserLevels((prev) => ({ ...prev, [subcategoryId]: level }));
      return level;
    } catch (error) {
      console.error(`Error loading level for ${subcategoryId}:`, error);
      setUserLevels((prev) => ({ ...prev, [subcategoryId]: 1 }));
      return 1;
    } finally {
      setLoadingLevels((prev) => ({ ...prev, [subcategoryId]: false }));
    }
  };

  const handleTopicLaunch = async (subcategory) => {
    const selectedLevel = Number(getSelectedLevel(subcategory.id));
    setLaunchingTopicId(subcategory.id);

    try {
      const userCurrentLevel = await ensureUserLevel(subcategory.id);
      navigate('/smart-quiz-generator', {
        state: {
          subcategoryId: subcategory.id,
          forceLevel: selectedLevel,
          userCurrentLevel,
        },
      });
    } finally {
      setLaunchingTopicId(null);
    }
  };

  const handleLevelChange = (subcategoryId, level) => {
    setTopicLevels((prev) => ({
      ...prev,
      [subcategoryId]: Number(level),
    }));
  };

  const toggleFavorite = (subcategoryId) => {
    setFavoriteTopicIds((prev) => (
      prev.includes(subcategoryId)
        ? prev.filter((id) => id !== subcategoryId)
        : [...prev, subcategoryId]
    ));
  };

  const isCompleted = (subcategoryId) => (
    COMPLETED_TOPIC_IDS.has(subcategoryId) || (userLevels[subcategoryId] || 0) > 1
  );

  const filteredTopics = (topics) => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return topics.filter((topic) => {
      const matchesSearch = !normalizedSearch || topic.name.toLowerCase().includes(normalizedSearch);
      const matchesSection = sectionFilter === 'all' || topic.section === sectionFilter;
      const matchesCompleted = !completedOnly || isCompleted(topic.id);
      const matchesFavorite = !favoritesOnly || favoriteTopicIds.includes(topic.id);

      return matchesSearch && matchesSection && matchesCompleted && matchesFavorite;
    });
  };

  const filteredReadingTopics = filteredTopics(readingWritingSubcategories);
  const filteredMathTopics = filteredTopics(mathSubcategories);

  const openMetaModal = () => {
    setMetaError(null);
    setIsMetaOpen(true);
  };

  const closeMetaModal = () => {
    if (creating) return;
    setIsMetaOpen(false);
  };

  const toggleSubcat = (id) => {
    setSelectedSubcats((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleCreateMeta = async () => {
    try {
      setMetaError(null);
      if (!currentUser) {
        setMetaError('You must be logged in to create a mixed quiz.');
        return;
      }
      if (selectedSubcats.length === 0) {
        setMetaError('Please select at least one topic.');
        return;
      }
      if (questionCount < 1) {
        setMetaError('Question count must be at least 1.');
        return;
      }

      setCreating(true);
      const quizId = await createMetaSmartQuiz(
        currentUser.uid,
        selectedSubcats,
        metaLevel,
        questionCount
      );

      navigate('/smart-quiz-intro', {
        state: {
          quizId,
          meta: true,
          metaSubcategoryIds: selectedSubcats,
          level: metaLevel,
        },
      });

      setIsMetaOpen(false);
      setSelectedSubcats([]);
      setMetaLevel(1);
      setQuestionCount(5);
    } catch (e) {
      console.error('Failed to create mixed quiz:', e);
      setMetaError(e?.message || 'Failed to create mixed quiz. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const renderTopicRow = (topic, section) => {
    const selectedLevel = getSelectedLevel(topic.id);
    const levelMeta = getLevelMeta(selectedLevel);
    const favorite = favoriteTopicIds.includes(topic.id);
    const complete = isCompleted(topic.id);
    const launching = launchingTopicId === topic.id;
    const Icon = section === 'math' ? FaCalculator : FaBookOpen;

    return (
      <li key={topic.id} className="quiz-topic-row">
        <div
          className={`quiz-topic-launch ${launching ? 'is-launching' : ''}`}
          role="button"
          tabIndex={0}
          onClick={() => {
            if (!launching) handleTopicLaunch(topic);
          }}
          onKeyDown={(event) => {
            if (!launching && (event.key === 'Enter' || event.key === ' ')) {
              event.preventDefault();
              handleTopicLaunch(topic);
            }
          }}
          aria-label={`Start ${topic.name} quiz`}
          aria-disabled={launching}
        >
          <span className={`quiz-topic-icon quiz-topic-icon--${section}`}>
            <Icon />
          </span>
          <span className="quiz-topic-main">
            <span className="quiz-topic-name">{topic.name}</span>
            <span className="quiz-topic-mobile-meta">{levelMeta.label}</span>
          </span>
          <span className="quiz-topic-actions" onClick={(event) => event.stopPropagation()}>
            <select
              className={`quiz-level-select quiz-level-select--${levelMeta.tone}`}
              value={selectedLevel}
              onChange={(event) => handleLevelChange(topic.id, event.target.value)}
              onClick={(event) => event.stopPropagation()}
              aria-label={`Difficulty for ${topic.name}`}
            >
              {LEVEL_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {POPULAR_TOPIC_IDS.has(topic.id) && (
              <span className="quiz-topic-badge">Popular</span>
            )}
            <span className={`quiz-complete-indicator ${complete ? 'is-complete' : ''}`} aria-label={complete ? 'Completed' : 'Not completed'}>
              {complete && <FaCheck />}
            </span>
            <button
              className={`quiz-favorite-btn ${favorite ? 'is-favorite' : ''}`}
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                toggleFavorite(topic.id);
              }}
              aria-label={favorite ? `Remove ${topic.name} from favorites` : `Add ${topic.name} to favorites`}
            >
              {favorite ? <FaBookmark /> : <FaRegBookmark />}
            </button>
          </span>
          <span className="quiz-topic-row-arrow">
            <FaChevronRight />
          </span>
        </div>
      </li>
    );
  };

  const renderTopicCard = ({ title, subtitle, icon, section, topics }) => (
    <section className={`quiz-category-card quiz-category-card--${section}`}>
      <div className="quiz-card-header">
        <span className={`quiz-card-icon quiz-card-icon--${section}`}>
          {icon}
        </span>
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
      </div>
      {topics.length > 0 ? (
        <ul className="quiz-topic-list">
          {topics.map((topic) => renderTopicRow(topic, section))}
        </ul>
      ) : (
        <div className="quiz-empty-state">
          No topics match the current filters.
        </div>
      )}
      <button
        className="quiz-card-footer-link"
        type="button"
        onClick={() => setSectionFilter(section)}
      >
        View all {title} quizzes <FaChevronRight />
      </button>
    </section>
  );

  return (
    <div className="subject-quizzes-container">
      <header className="quiz-bank-topbar">
        <nav className="quiz-bank-tabs" aria-label="Primary navigation">
          <Link to="/progress">Dashboard</Link>
          <Link to="/practice-exams">Practice Exams</Link>
          <Link to="/subject-quizzes" className="is-active">Question Bank</Link>
          <Link to="/flashcards">Flashcards</Link>
          <Link to="/dashboard">
            AI Coach <span className="quiz-beta-badge">Beta</span>
          </Link>
          <Link to="/lectures">Lectures</Link>
          <Link to="/progress">Analytics</Link>
        </nav>
        <div className="quiz-bank-toolbar">
          <label className="quiz-global-search">
            <FaSearch />
            <input type="search" placeholder="Search anything..." aria-label="Search anything" />
            <span className="quiz-shortcut">Ctrl K</span>
          </label>
          <button className="quiz-icon-button" type="button" aria-label="Notifications">
            <FaBell />
            <span className="quiz-notification-dot">3</span>
          </button>
          <button className="quiz-account-button" type="button">
            <FaUserCircle />
            <span>{accountLabel}</span>
          </button>
        </div>
      </header>

      <main className="quiz-bank-main">
        <section className="quiz-bank-hero">
          <div className="quiz-hero-copy">
            <div className="quiz-title-row">
              <h1 className="subject-quizzes-title">Subject Quizzes</h1>
              <span className="quiz-title-spark">
                <FaMagic />
              </span>
            </div>
            <p>Choose a topic, set the difficulty, and start focused SAT practice.</p>
          </div>

          <div className="quiz-stat-grid">
            <article className="quiz-stat-card">
              <span className="quiz-stat-icon">
                <FaLayerGroup />
              </span>
              <div>
                <span className="quiz-stat-label">Topics Available</span>
                <strong>{allSubcategories.length}</strong>
                <span>Across R&W and Math</span>
              </div>
            </article>
            <article className="quiz-stat-card">
              <span className="quiz-stat-icon">
                <FaCheckCircle />
              </span>
              <div>
                <span className="quiz-stat-label">Completed</span>
                <strong>{completedCount}</strong>
                <span>Quizzes finished</span>
              </div>
            </article>
            <article className="quiz-stat-card">
              <span className="quiz-stat-icon">
                <FaChartLine />
              </span>
              <div>
                <span className="quiz-stat-label">Average Accuracy</span>
                <strong>78%</strong>
                <span>Across completed</span>
              </div>
            </article>
            <article className="quiz-mixed-card">
              <span className="quiz-mixed-icon">
                <FaMagic />
              </span>
              <div>
                <h2>Create Mixed Quiz</h2>
                <p>Combine topics from Reading & Writing and Math.</p>
                <button className="quiz-primary-btn" type="button" onClick={openMetaModal}>
                  Build Mixed Quiz
                </button>
              </div>
            </article>
          </div>
        </section>

        <section className="quiz-filter-bar" aria-label="Quiz filters">
          <label className="quiz-topic-search">
            <FaSearch />
            <input
              type="search"
              placeholder="Search topics..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </label>

          <div className="quiz-filter-chips">
            {[
              { value: 'all', label: 'All' },
              { value: 'reading', label: 'Reading & Writing' },
              { value: 'math', label: 'Math' },
            ].map((filter) => (
              <button
                key={filter.value}
                className={`quiz-filter-chip ${sectionFilter === filter.value ? 'is-active' : ''}`}
                type="button"
                onClick={() => setSectionFilter(filter.value)}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="quiz-secondary-filters">
            <button
              className={`quiz-filter-chip quiz-filter-chip--icon ${completedOnly ? 'is-active' : ''}`}
              type="button"
              onClick={() => setCompletedOnly((value) => !value)}
            >
              <FaCheckCircle /> Completed
            </button>
            <button
              className={`quiz-filter-chip quiz-filter-chip--icon ${favoritesOnly ? 'is-active' : ''}`}
              type="button"
              onClick={() => setFavoritesOnly((value) => !value)}
            >
              <FaRegBookmark /> Favorites
            </button>
          </div>
        </section>

        <div className={`quiz-selection-container ${sectionFilter !== 'all' ? 'is-single-column' : ''}`}>
          {sectionFilter !== 'math' && renderTopicCard({
            title: 'Reading & Writing',
            subtitle: 'Topic quizzes for every reading and writing skill.',
            icon: <FaBookOpen />,
            section: 'reading',
            topics: filteredReadingTopics,
          })}
          {sectionFilter !== 'reading' && renderTopicCard({
            title: 'Math',
            subtitle: 'Skill-based quizzes across algebra, data, and geometry.',
            icon: <FaCalculator />,
            section: 'math',
            topics: filteredMathTopics,
          })}
        </div>

        <section className="quiz-adaptive-strip">
          <span className="quiz-adaptive-icon">
            <FaSlidersH />
          </span>
          <div>
            <h2>Adaptive Quiz Builder <span>Beta</span></h2>
            <p>Build a personalized quiz that adapts to your strengths and weaknesses.</p>
          </div>
          <button className="quiz-strip-action" type="button" onClick={openMetaModal}>
            Launch Adaptive Builder <FaChevronRight />
          </button>
        </section>
      </main>

      <Modal
        isOpen={isMetaOpen}
        onClose={closeMetaModal}
        title="Create Mixed Quiz"
        size="large"
        className="meta-quiz-modal"
      >
        <div className="meta-modal-content">
          <div className="meta-section meta-section--wide">
            <div className="meta-section-header">
              <h3>Select Topics</h3>
              <span>{selectedSubcats.length} selected</span>
            </div>
            <div className="meta-subcat-groups">
              <div className="meta-group">
                <h4>Reading & Writing</h4>
                <div className="meta-subcat-list">
                  {readingWritingSubcategories.map((sc) => (
                    <label key={sc.id} className="meta-subcat-item">
                      <input
                        type="checkbox"
                        checked={selectedSubcats.includes(sc.id)}
                        onChange={() => toggleSubcat(sc.id)}
                      />
                      <span>{sc.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="meta-group">
                <h4>Math</h4>
                <div className="meta-subcat-list">
                  {mathSubcategories.map((sc) => (
                    <label key={sc.id} className="meta-subcat-item">
                      <input
                        type="checkbox"
                        checked={selectedSubcats.includes(sc.id)}
                        onChange={() => toggleSubcat(sc.id)}
                      />
                      <span>{sc.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="meta-builder-panel">
            <div className="meta-section">
              <h3>Difficulty</h3>
              <div className="meta-levels">
                {LEVEL_OPTIONS.map((option) => (
                  <label key={option.value} className={`meta-level-option ${metaLevel === option.value ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="meta-level"
                      value={option.value}
                      checked={metaLevel === option.value}
                      onChange={() => setMetaLevel(option.value)}
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="meta-section">
              <h3>Question Count</h3>
              <input
                className="meta-number-input"
                type="number"
                min={1}
                max={30}
                value={questionCount}
                onChange={(e) => setQuestionCount(parseInt(e.target.value || '1', 10))}
              />
            </div>

            {metaError && <div className="meta-error">{metaError}</div>}
            <div className="meta-actions">
              <button className="btn-secondary" type="button" onClick={closeMetaModal} disabled={creating}>
                Cancel
              </button>
              <button
                className="btn-primary"
                type="button"
                onClick={handleCreateMeta}
                disabled={creating || selectedSubcats.length === 0}
              >
                {creating ? 'Creating...' : 'Create Quiz'}
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SubjectQuizzes;
