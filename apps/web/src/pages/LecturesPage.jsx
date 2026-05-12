import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getSubcategoriesArray, getKebabCaseFromAnyFormat } from '../utils/subcategoryConstants';
import { useAuth } from '../contexts/AuthContext';
import { useSidebar } from '../contexts/SidebarContext';
import '../styles/LecturesPage.css';
import {
  FiArrowRight,
  FiBell,
  FiBookOpen,
  FiBookmark,
  FiCheck,
  FiCheckCircle,
  FiChevronDown,
  FiChevronRight,
  FiClock,
  FiFileText,
  FiFlag,
  FiMonitor,
  FiPlayCircle,
  FiSearch,
  FiStar,
} from 'react-icons/fi';
import { FaSquareRootAlt } from 'react-icons/fa';

const COMPLETED_SUBCATEGORY_IDS = new Set([1, 3, 4, 7, 9, 11, 13, 15, 18, 21, 25, 26]);
const IN_PROGRESS_SUBCATEGORY_IDS = new Set([2, 5, 8, 10, 12, 22]);
const SAVED_SUBCATEGORY_IDS = new Set([4, 6, 7, 14, 16, 17, 19, 20, 23, 24, 27, 28, 29]);

const filterOptions = [
  { id: 'all', label: 'All' },
  { id: 'reading', label: 'Reading & Writing' },
  { id: 'math', label: 'Math' },
  { id: 'completed', label: 'Completed', icon: <FiCheckCircle /> },
  { id: 'saved', label: 'Saved', icon: <FiBookmark /> },
];

const topNavItems = [
  { path: '/progress', label: 'Dashboard' },
  { path: '/practice-exams', label: 'Practice Exams' },
  { path: '/subject-quizzes', label: 'Question Bank' },
  { path: '/flashcards', label: 'Flashcards' },
  { path: '/ai-coach', label: 'AI Coach', badge: 'BETA' },
  { path: '/lectures', label: 'Lectures' },
  { path: '/progress', label: 'Analytics' },
];

const LecturesPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { isMobile, setSidebarCollapsed } = useSidebar();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const allSubcategories = getSubcategoriesArray();

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

  const getTopicStatus = (subcategory) => {
    if (COMPLETED_SUBCATEGORY_IDS.has(subcategory.id)) return 'completed';
    if (IN_PROGRESS_SUBCATEGORY_IDS.has(subcategory.id)) return 'progress';
    return 'available';
  };

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
  }, [activeFilter, allSubcategories, searchTerm]);

  const readingWritingSubcategories = filteredSubcategories.filter(sc => sc.section === 'reading');
  const mathSubcategories = filteredSubcategories.filter(sc => sc.section === 'math');
  const userName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Alex';
  const firstInitial = userName.charAt(0).toUpperCase();

  const renderStatusIcon = (subcategory) => {
    const status = getTopicStatus(subcategory);

    if (status === 'completed') {
      return (
        <span className="lecture-status lecture-status-completed" aria-label="Completed">
          <FiCheck />
        </span>
      );
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
        {renderStatusIcon(subcategory)}
      </button>
    );
  };

  return (
    <div className="lectures-page-container lectures-dashboard">
      <header className="lectures-top-nav" aria-label="Lectures navigation">
        <nav className="lectures-top-nav-links">
          {topNavItems.map((item) => (
            <Link
              key={`${item.label}-${item.path}`}
              to={item.path}
              className={`lectures-top-nav-link ${item.path === '/lectures' ? 'active' : ''}`}
            >
              {item.label}
              {item.badge && <span className="lecture-beta-badge">{item.badge}</span>}
            </Link>
          ))}
        </nav>
        <div className="lectures-top-actions">
          <label className="lectures-global-search">
            <FiSearch />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search anything..."
              aria-label="Search lectures"
            />
            <span className="lectures-shortcut">Cmd K</span>
          </label>
          <button type="button" className="lectures-icon-button" aria-label="Notifications">
            <FiBell />
            <span className="lecture-notification-dot">3</span>
          </button>
          <button type="button" className="lectures-user-button" aria-label="Open profile">
            <span className="lectures-user-avatar">{firstInitial}</span>
            <span className="lectures-user-name">{userName}</span>
            <FiChevronDown />
          </button>
        </div>
      </header>

      <main className="lectures-content">
        <section className="lectures-hero-grid" aria-label="Lectures overview">
          <div className="lectures-heading-block">
            <div className="lectures-title-row">
              <h1 className="lectures-page-title">Lectures</h1>
              <FiStar className="lectures-title-spark" aria-hidden="true" />
            </div>
            <p className="lectures-page-subtitle">
              Learn every Digital SAT topic with structured video lessons and concept walkthroughs.
            </p>
          </div>

          <div className="lecture-stat-card">
            <span className="lecture-stat-icon"><FiMonitor /></span>
            <div>
              <span className="lecture-stat-label">Topics Available</span>
              <strong>30+</strong>
              <span className="lecture-stat-note">Across R&W and Math</span>
            </div>
          </div>
          <div className="lecture-stat-card">
            <span className="lecture-stat-icon"><FiClock /></span>
            <div>
              <span className="lecture-stat-label">Hours of Lessons</span>
              <strong>40+</strong>
              <span className="lecture-stat-note">On-demand content</span>
            </div>
          </div>
          <div className="lecture-stat-card">
            <span className="lecture-stat-icon"><FiCheckCircle /></span>
            <div>
              <span className="lecture-stat-label">Completed</span>
              <strong>12</strong>
              <span className="lecture-stat-note">Lectures finished</span>
            </div>
          </div>
        </section>

        <section className="lectures-feature-grid" aria-label="Current lecture and recommendation">
          <article className="lectures-panel lectures-continue-panel">
            <div className="lectures-panel-title">
              <FiStar aria-hidden="true" />
              <h2>Continue Learning</h2>
            </div>
            <div className="lecture-continue-body">
              <div className="lecture-current-icon">
                <FiFileText />
              </div>
              <div className="lecture-current-copy">
                <h3>Transitions</h3>
                <span>Reading & Writing</span>
                <p>7 of 10 lessons completed</p>
                <div className="lecture-mini-progress" aria-hidden="true">
                  <span style={{ width: '70%' }} />
                </div>
              </div>
              <div className="lecture-progress-ring" aria-label="70 percent complete">
                <span>70%</span>
              </div>
              <button
                type="button"
                className="lecture-primary-button"
                onClick={() => handleSubcategoryClick({ id: 8, name: 'Transitions' })}
              >
                Resume Lecture
              </button>
            </div>
          </article>

          <article className="lectures-panel lectures-path-panel">
            <div className="lectures-panel-title">
              <FiStar aria-hidden="true" />
              <h2>Recommended Path</h2>
            </div>
            <div className="lecture-path-card">
              <div className="lecture-path-highlight">
                <span className="lecture-path-icon"><FiFlag /></span>
                <div>
                  <h3>Start with Reading & Writing Fundamentals</h3>
                  <p>Build a strong foundation with key reading and writing skills.</p>
                </div>
              </div>
              <button
                type="button"
                className="lecture-next-button"
                onClick={() => handleSubcategoryClick({ id: 1, name: 'Central Ideas and Details' })}
              >
                <span>Next up: Central Ideas and Details</span>
                <FiChevronRight />
              </button>
            </div>
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
