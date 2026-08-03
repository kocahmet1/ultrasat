import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSubcategoriesArray, getKebabCaseFromAnyFormat } from '../utils/subcategoryConstants';
import { useAuth } from '../contexts/AuthContext';
import { useSidebar } from '../contexts/SidebarContext';
import { getAllLessonProgress } from '../firebase/lessonProgressServices';
import '../styles/LecturesPage.css';
import {
  FiArrowRight,
  FiBookOpen,
  FiBookmark,
  FiCheckCircle,
  FiChevronRight,
  FiFlag,
  FiMonitor,
  FiPlayCircle,
  FiSearch,
  FiStar,
} from 'react-icons/fi';
// Feather has no square-root glyph; kept from FontAwesome for the math icon only.
import { FaSquareRootAlt } from 'react-icons/fa';

// P1-D: completed / in-progress now come from real per-user data
// (users/{uid}/lessonProgress via getAllLessonProgress) — see the component.
// There is no lesson save/bookmark mechanism yet, so the Saved filter stays
// wired but empty-tolerant until one lands.
const SAVED_SUBCATEGORY_IDS = new Set([]);

const filterOptions = [
  { id: 'all', label: 'All' },
  { id: 'reading', label: 'Reading & Writing' },
  { id: 'math', label: 'Math' },
  { id: 'completed', label: 'Completed', icon: <FiCheckCircle /> },
  { id: 'saved', label: 'Saved', icon: <FiBookmark /> },
];

const LecturesPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { isMobile, setSidebarCollapsed } = useSidebar();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  // null = still loading; {} or a map of subcategoryId -> doc once resolved.
  const [lessonProgress, setLessonProgress] = useState(null);
  const allSubcategories = getSubcategoriesArray();

  // P1-D: exactly one Firestore query per page load — every lessonProgress
  // doc for the signed-in user (at most 29). Drives the progress summary,
  // the Completed filter, per-card chips, and the resume target.
  useEffect(() => {
    let cancelled = false;
    if (!currentUser) {
      setLessonProgress({});
      return undefined;
    }
    setLessonProgress(null);
    getAllLessonProgress(currentUser.uid)
      .then((progress) => {
        if (!cancelled) setLessonProgress(progress || {});
      })
      .catch((error) => {
        console.error('Error loading lesson progress:', error);
        if (!cancelled) setLessonProgress({});
      });
    return () => {
      cancelled = true;
    };
  }, [currentUser]);

  const progressLoading = lessonProgress === null;

  const { completedLessonIds, inProgressLessonIds } = useMemo(() => {
    const completed = new Set();
    const inProgress = new Set();
    Object.entries(lessonProgress || {}).forEach(([lessonId, entry]) => {
      if (entry?.status === 'completed') completed.add(lessonId);
      else if (entry?.status === 'in_progress') inProgress.add(lessonId);
    });
    return { completedLessonIds: completed, inProgressLessonIds: inProgress };
  }, [lessonProgress]);

  useEffect(() => {
    const appContainer = document.querySelector('.app-container');
    if (appContainer) {
      appContainer.classList.add('lectures-shell-active');
    }

    if (!isMobile) {
      setSidebarCollapsed(false);
    }

    return () => {
      if (appContainer) {
        appContainer.classList.remove('lectures-shell-active');
      }
    };
  }, [isMobile, setSidebarCollapsed]);

  const handleSubcategoryClick = (subcategory) => {
    const slug = getKebabCaseFromAnyFormat(subcategory.id) || subcategory.name.toLowerCase().replace(/\s+/g, '-');
    navigate(`/learn/${slug}`);
  };

  const getTopicStatus = useCallback((subcategory) => {
    const lessonId = getKebabCaseFromAnyFormat(subcategory.id);
    if (lessonId && completedLessonIds.has(lessonId)) return 'completed';
    if (lessonId && inProgressLessonIds.has(lessonId)) return 'progress';
    return 'available';
  }, [completedLessonIds, inProgressLessonIds]);

  const totalLessons = allSubcategories.length;
  const completedCount = useMemo(
    () => allSubcategories.reduce(
      (count, subcategory) => (getTopicStatus(subcategory) === 'completed' ? count + 1 : count),
      0,
    ),
    [allSubcategories, getTopicStatus],
  );
  const completedPercent = totalLessons > 0
    ? Math.round((completedCount / totalLessons) * 100)
    : 0;

  // Resume target for "Continue where you left off": the not-completed lesson
  // with the most recent lastViewedAt; fallback: the first not-completed
  // lesson in catalog order; when everything is done, a course-complete state.
  const resumeTarget = useMemo(() => {
    if (!lessonProgress) return null;

    const toMillis = (value) => {
      if (!value) return 0;
      if (typeof value.toMillis === 'function') return value.toMillis();
      const parsed = new Date(value).getTime();
      return Number.isNaN(parsed) ? 0 : parsed;
    };

    let mostRecent = null;
    let mostRecentViewedAt = -1;
    allSubcategories.forEach((subcategory) => {
      const lessonId = getKebabCaseFromAnyFormat(subcategory.id);
      const entry = lessonId ? lessonProgress[lessonId] : null;
      if (!entry || entry.status === 'completed') return;
      const viewedAt = toMillis(entry.lastViewedAt);
      if (viewedAt > mostRecentViewedAt) {
        mostRecentViewedAt = viewedAt;
        mostRecent = subcategory;
      }
    });
    if (mostRecent) return { mode: 'resume', subcategory: mostRecent };

    const nextUp = allSubcategories.find(
      (subcategory) => getTopicStatus(subcategory) !== 'completed',
    );
    if (nextUp) return { mode: 'next', subcategory: nextUp };

    return { mode: 'done', subcategory: null };
  }, [lessonProgress, allSubcategories, getTopicStatus]);

  const filteredSubcategories = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return allSubcategories.filter((subcategory) => {
      const status = getTopicStatus(subcategory);
      const matchesSearch = !normalizedSearch || subcategory.name.toLowerCase().includes(normalizedSearch);
      const matchesFilter =
        activeFilter === 'all' ||
        subcategory.section === activeFilter ||
        (activeFilter === 'completed' && status === 'completed') ||
        (activeFilter === 'saved' && SAVED_SUBCATEGORY_IDS.has(subcategory.id));

      return matchesSearch && matchesFilter;
    });
  }, [activeFilter, allSubcategories, searchTerm, getTopicStatus]);

  const readingWritingSubcategories = filteredSubcategories.filter(sc => sc.section === 'reading');
  const mathSubcategories = filteredSubcategories.filter(sc => sc.section === 'math');

  const renderStatusIcon = (subcategory) => {
    const status = getTopicStatus(subcategory);

    // Completed lessons carry the FiCheckCircle chip instead (renderTopicButton).
    if (status === 'completed') {
      return null;
    }

    if (status === 'progress') {
      return (
        <span className="lecture-status lecture-status-progress" aria-label="In progress">
          <FiPlayCircle />
        </span>
      );
    }

    return (
      <span className="lecture-status lecture-status-saved" aria-label={SAVED_SUBCATEGORY_IDS.has(subcategory.id) ? 'Saved' : 'Available'}>
        {SAVED_SUBCATEGORY_IDS.has(subcategory.id) ? <FiBookmark /> : <FiChevronRight />}
      </span>
    );
  };

  const renderTopicButton = (subcategory) => {
    const status = getTopicStatus(subcategory);

    return (
      <button
        type="button"
        className={`lecture-topic-button lecture-topic-${status}`}
        key={subcategory.id}
        onClick={() => handleSubcategoryClick(subcategory)}
      >
        <span className="lecture-topic-icon">
          {subcategory.section === 'math' ? <FaSquareRootAlt /> : <FiBookOpen />}
        </span>
        <span className="lecture-topic-name">{subcategory.name}</span>
        {status === 'progress' && <span className="lecture-topic-progress-label">In Progress</span>}
        {status === 'completed' && (
          <span className="lecture-topic-completed-chip" aria-label="Completed">
            <FiCheckCircle aria-hidden="true" />
            Completed
          </span>
        )}
        {renderStatusIcon(subcategory)}
      </button>
    );
  };

  return (
    <div className="lectures-page-container lectures-dashboard">
      <main className="lectures-content">
        <section className="lectures-hero-grid" aria-label="Lectures overview">
          <div className="lectures-heading-block">
            <p className="ut-eyebrow">Learn</p>
            <h1 className="ut-page-title">Lectures</h1>
            <p className="ut-page-sub">
              Learn every Digital SAT skill with illustrated lessons, worked examples, and embedded practice.
            </p>
          </div>

          <div className="lecture-stat-card">
            <span className="lecture-stat-icon"><FiMonitor /></span>
            <div>
              <span className="lecture-stat-label">Topics Available</span>
              <strong>29</strong>
              <span className="lecture-stat-note">Across R&W and Math</span>
            </div>
          </div>

          {/* P1-D: real course progress (replaces the fake "Completed 12" card
              removed in Phase B) — fed by users/{uid}/lessonProgress. */}
          {progressLoading ? (
            <div className="ut-skeleton lecture-progress-skeleton" aria-hidden="true" />
          ) : (
            <div className="lecture-stat-card lecture-progress-card">
              <span className="lecture-stat-icon"><FiCheckCircle /></span>
              <div className="lecture-progress-body">
                <span className="lecture-stat-label">Course Progress</span>
                <strong>{completedCount} of {totalLessons}</strong>
                <span className="lecture-stat-note">lessons complete</span>
                <div
                  className="ut-progress lecture-progress-bar"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={totalLessons}
                  aria-valuenow={completedCount}
                  aria-label={`${completedCount} of ${totalLessons} lessons complete`}
                >
                  {completedCount > 0 && (
                    <div className="ut-progress-fill" style={{ width: `${completedPercent}%` }} />
                  )}
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="lectures-feature-grid" aria-label="Recommendation">
          {/* P1-D: the fake identical "Continue Learning" card (removed in
              Phase B) is now a real resume card — most recent lastViewedAt on
              a not-completed lesson, else the first not-completed lesson. */}
          <article className="lectures-panel lectures-path-panel">
            <div className="lectures-panel-title">
              {resumeTarget?.mode === 'resume' ? <FiPlayCircle aria-hidden="true" /> : <FiStar aria-hidden="true" />}
              <h2>{resumeTarget?.mode === 'resume' ? 'Continue Learning' : 'Recommended Path'}</h2>
            </div>
            {progressLoading ? (
              <div className="ut-skeleton lecture-path-skeleton" aria-hidden="true" />
            ) : resumeTarget?.mode === 'done' ? (
              <div className="lecture-path-card">
                <div className="lecture-path-highlight">
                  <span className="lecture-path-icon"><FiCheckCircle /></span>
                  <div>
                    <h3>All {totalLessons} lessons complete</h3>
                    <p>You have finished every lesson in the course. Revisit any topic below to review.</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="lecture-path-card">
                <div className="lecture-path-highlight">
                  <span className="lecture-path-icon">
                    {resumeTarget?.mode === 'resume' ? <FiPlayCircle /> : <FiFlag />}
                  </span>
                  <div>
                    <h3>
                      {resumeTarget?.mode === 'resume'
                        ? 'Continue where you left off'
                        : completedCount > 0
                          ? 'Keep your path moving'
                          : 'Start with Reading & Writing Fundamentals'}
                    </h3>
                    <p>
                      {resumeTarget?.mode === 'resume'
                        ? `Pick up ${resumeTarget.subcategory.name} right where you stopped.`
                        : completedCount > 0
                          ? `${completedCount} of ${totalLessons} lessons complete — your next lesson is ready.`
                          : 'Build a strong foundation with key reading and writing skills.'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="lecture-next-button"
                  onClick={() => handleSubcategoryClick(resumeTarget.subcategory)}
                >
                  <span>
                    {resumeTarget?.mode === 'resume'
                      ? `Continue: ${resumeTarget.subcategory.name}`
                      : `Next up: ${resumeTarget.subcategory.name}`}
                  </span>
                  <FiChevronRight />
                </button>
              </div>
            )}
          </article>
        </section>

        <section className="lectures-controls" aria-label="Lecture filters">
          <label className="lectures-topic-search">
            <FiSearch />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search lectures..."
              aria-label="Search lecture topics"
            />
          </label>

          <div className="lectures-filter-group">
            {filterOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                className={`lecture-filter-chip ${activeFilter === option.id ? 'active' : ''}`}
                onClick={() => setActiveFilter(option.id)}
              >
                {option.icon}
                {option.label}
              </button>
            ))}
          </div>
        </section>

        <section className="lecture-selection-container" aria-label="Lecture topic categories">
          <article className="lecture-category-card reading-writing-card-lecture">
            <div className="lecture-category-header">
              <span className="lecture-category-icon">
                <FiBookOpen />
              </span>
              <div>
                <h2>Reading & Writing</h2>
                <p>Concept lessons for every reading and writing skill.</p>
              </div>
            </div>
            <div className="lecture-subcategory-list-inline">
              {readingWritingSubcategories.map(renderTopicButton)}
            </div>
            {readingWritingSubcategories.length === 0 && (
              <p className="lecture-empty-state">No Reading & Writing lectures match this filter.</p>
            )}
            <button
              type="button"
              className="lecture-view-all"
              onClick={() => setActiveFilter('reading')}
            >
              View all Reading & Writing lectures
              <FiArrowRight />
            </button>
          </article>

          <article className="lecture-category-card math-card-lecture">
            <div className="lecture-category-header">
              <span className="lecture-category-icon math">
                <FaSquareRootAlt />
              </span>
              <div>
                <h2>Math</h2>
                <p>Step-by-step lessons across algebra, data, and geometry.</p>
              </div>
            </div>
            <div className="lecture-subcategory-list-inline math-list">
              {mathSubcategories.map(renderTopicButton)}
            </div>
            {mathSubcategories.length === 0 && (
              <p className="lecture-empty-state">No Math lectures match this filter.</p>
            )}
            <button
              type="button"
              className="lecture-view-all"
              onClick={() => setActiveFilter('math')}
            >
              View all Math lectures
              <FiArrowRight />
            </button>
          </article>
        </section>
      </main>
    </div>
  );
};

export default LecturesPage;
