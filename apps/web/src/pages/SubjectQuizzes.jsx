import React, { useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getSubcategoriesArray } from '../utils/subcategoryConstants';
import { getSubcategoryProgress } from '../utils/progressUtils';
import { FiBookOpen, FiBookmark, FiCheck, FiCheckCircle, FiChevronRight, FiSearch } from 'react-icons/fi';
// Feather has no calculator / magic-wand glyphs; kept from FontAwesome for these icons only.
import { FaCalculator, FaMagic } from 'react-icons/fa';
import '../styles/SubjectQuizzes.css';
import Modal from '../components/Modal';
import { createMetaSmartQuiz } from '../utils/smartQuizUtils';

const LEVEL_OPTIONS = [
  { value: 1, label: 'Easy', tone: 'easy' },
  { value: 2, label: 'Medium', tone: 'medium' },
  { value: 3, label: 'Hard', tone: 'hard' },
];

// Overhaul Phase B: these were hardcoded fake sets shown to every user as
// their own progress. Now empty — real completion comes from live level data.
const COMPLETED_TOPIC_IDS = new Set([]);
const POPULAR_TOPIC_IDS = new Set([]);
const DEFAULT_FAVORITES = [];

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
    const Icon = section === 'math' ? FaCalculator : FiBookOpen;

    return (
      <li key={topic.id}>
        <div
          className={`ut-row ut-row--hover qb-topic-row ${launching ? 'is-launching' : ''}`}
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
          <span className="ut-tile ut-tile--neutral qb-topic-tile">
            <Icon />
          </span>
          <span className="qb-topic-main">
            <span className="qb-topic-name">{topic.name}</span>
            <span className={`ut-chip ut-chip--${levelMeta.tone} qb-topic-mobile-chip`}>
              {levelMeta.label}
            </span>
          </span>
          <span className="qb-topic-actions" onClick={(event) => event.stopPropagation()}>
            {POPULAR_TOPIC_IDS.has(topic.id) && (
              <span className="ut-chip ut-chip--accent">Popular</span>
            )}
            <select
              className="ut-select qb-level-select"
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
            <span className={`qb-complete ${complete ? 'is-complete' : ''}`} aria-label={complete ? 'Completed' : 'Not completed'}>
              {complete && <FiCheck />}
            </span>
            <button
              className={`qb-fav ${favorite ? 'is-favorite' : ''}`}
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                toggleFavorite(topic.id);
              }}
              aria-label={favorite ? `Remove ${topic.name} from favorites` : `Add ${topic.name} to favorites`}
            >
              <FiBookmark />
            </button>
          </span>
          <span className="qb-topic-arrow" aria-hidden="true">
            <FiChevronRight />
          </span>
        </div>
      </li>
    );
  };

  const renderTopicSection = ({ title, section, topics }) => (
    <section className="qb-column">
      <div className="ut-section-head">
        <h2 className="ut-section-title">{title}</h2>
      </div>
      {topics.length > 0 ? (
        <ul className="qb-topic-list">
          {topics.map((topic) => renderTopicRow(topic, section))}
        </ul>
      ) : (
        <div className="ut-empty">
          <b>No matching topics</b>
          No topics match the current filters.
        </div>
      )}
      <button
        className="ut-link qb-view-all"
        type="button"
        onClick={() => setSectionFilter(section)}
      >
        View all {title} quizzes <FiChevronRight />
      </button>
    </section>
  );

  const showBothSections = sectionFilter !== 'math' && sectionFilter !== 'reading';

  return (
    <div className="ut-page ut-page--wide qb-page">
      <header className="ut-page-head">
        <div className="ut-page-head-main">
          <p className="ut-eyebrow">Practice</p>
          <h1 className="ut-page-title">Question Bank</h1>
          <p className="ut-page-sub">
            Choose a topic, set the difficulty, and start a focused quiz.
          </p>
        </div>
        <div className="ut-page-head-actions">
          <button className="ut-btn ut-btn--primary" type="button" onClick={openMetaModal}>
            <FaMagic /> Build mixed quiz
          </button>
        </div>
      </header>

      <div className="ut-grid ut-grid--3 qb-stats">
        <div className="ut-card qb-stat-card">
          <div className="ut-stat">
            <span className="ut-stat-value">{allSubcategories.length}</span>
            <span className="ut-stat-label">Topics available</span>
          </div>
        </div>
        <div className="ut-card qb-stat-card">
          <div className="ut-stat">
            <span className="ut-stat-value">{completedCount}</span>
            <span className="ut-stat-label">Quizzes finished</span>
          </div>
        </div>
        <div className="ut-card ut-card--accent qb-mixed-card">
          <div>
            <h2 className="ut-card-title">Create a mixed quiz</h2>
            <p className="ut-card-sub">Combine topics from Reading &amp; Writing and Math in one session.</p>
          </div>
          <button className="ut-btn ut-btn--soft ut-btn--sm" type="button" onClick={openMetaModal}>
            Build mixed quiz
          </button>
        </div>
      </div>

      <section className="qb-controls" aria-label="Quiz filters">
        <div className="ut-search qb-search">
          <FiSearch />
          <input
            className="ut-input"
            type="search"
            placeholder="Search topics…"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            aria-label="Search topics"
          />
        </div>

        <div className="qb-chip-row">
          {[
            { value: 'all', label: 'All' },
            { value: 'reading', label: 'Reading & Writing' },
            { value: 'math', label: 'Math' },
          ].map((filter) => (
            <button
              key={filter.value}
              className={`ut-chip qb-chip ${sectionFilter === filter.value ? 'is-active' : ''}`}
              type="button"
              onClick={() => setSectionFilter(filter.value)}
            >
              {filter.label}
            </button>
          ))}
          <span className="qb-chip-divider" aria-hidden="true" />
          <button
            className={`ut-chip qb-chip ${completedOnly ? 'is-active' : ''}`}
            type="button"
            onClick={() => setCompletedOnly((value) => !value)}
          >
            <FiCheckCircle /> Completed
          </button>
          <button
            className={`ut-chip qb-chip ${favoritesOnly ? 'is-active' : ''}`}
            type="button"
            onClick={() => setFavoritesOnly((value) => !value)}
          >
            <FiBookmark /> Favorites
          </button>
        </div>
      </section>

      <div className={`qb-columns ${showBothSections ? 'ut-grid ut-grid--2' : ''}`}>
        {sectionFilter !== 'math' && renderTopicSection({
          title: 'Reading & Writing',
          section: 'reading',
          topics: filteredReadingTopics,
        })}
        {sectionFilter !== 'reading' && renderTopicSection({
          title: 'Math',
          section: 'math',
          topics: filteredMathTopics,
        })}
      </div>

      <Modal
        isOpen={isMetaOpen}
        onClose={closeMetaModal}
        title="Create Mixed Quiz"
        size="large"
        className="qb-meta-modal"
      >
        <div className="qb-meta-layout">
          <div className="qb-meta-section qb-meta-section--wide">
            <div className="qb-meta-section-head">
              <h3>Select Topics</h3>
              <span className="ut-chip ut-chip--accent">{selectedSubcats.length} selected</span>
            </div>
            <div className="qb-meta-groups">
              <div className="qb-meta-group">
                <h4 className="ut-label">Reading &amp; Writing</h4>
                <div className="qb-meta-list">
                  {readingWritingSubcategories.map((sc) => (
                    <label key={sc.id} className="qb-meta-item">
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
              <div className="qb-meta-group">
                <h4 className="ut-label">Math</h4>
                <div className="qb-meta-list">
                  {mathSubcategories.map((sc) => (
                    <label key={sc.id} className="qb-meta-item">
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

          <div className="qb-meta-panel">
            <div className="qb-meta-section">
              <h3>Difficulty</h3>
              <div className="qb-meta-levels">
                {LEVEL_OPTIONS.map((option) => (
                  <label key={option.value} className={`qb-meta-level ${metaLevel === option.value ? 'is-active' : ''}`}>
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

            <div className="qb-meta-section">
              <h3>Question Count</h3>
              <input
                className="ut-input qb-meta-count"
                type="number"
                min={1}
                max={30}
                value={questionCount}
                onChange={(e) => setQuestionCount(parseInt(e.target.value || '1', 10))}
              />
            </div>

            {metaError && <div className="ut-chip ut-chip--hard qb-meta-error">{metaError}</div>}
            <div className="qb-meta-actions">
              <button className="ut-btn ut-btn--ghost" type="button" onClick={closeMetaModal} disabled={creating}>
                Cancel
              </button>
              <button
                className="ut-btn ut-btn--primary"
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
