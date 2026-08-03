import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getSubcategoriesArray } from '../utils/subcategoryConstants';
import { FiBookOpen, FiChevronDown, FiChevronUp } from 'react-icons/fi';
// Feather has no calculator glyph; kept from FontAwesome for the math topic icon only.
import { FaCalculator } from 'react-icons/fa';
import '../styles/SubjectQuizzes.css';
import GuestMetaQuizModal from '../components/GuestMetaQuizModal';

const GuestSubjectQuizzes = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const allSubcategories = getSubcategoriesArray();
  const [expandedSubcategory, setExpandedSubcategory] = useState(null);
  // Meta quiz state for guests
  const [isMetaOpen, setIsMetaOpen] = useState(!!(location.state && location.state.openMeta));
  const [selectedSubcats, setSelectedSubcats] = useState([]);
  const [metaLevel, setMetaLevel] = useState(1);
  const [questionCount, setQuestionCount] = useState(5);
  const [creating, setCreating] = useState(false);
  const [metaError, setMetaError] = useState(null);

  const readingWritingSubcategories = allSubcategories.filter(sc => sc.section === 'reading');
  const mathSubcategories = allSubcategories.filter(sc => sc.section === 'math');

  const handleSubcategoryClick = (subcategory) => {
    if (expandedSubcategory === subcategory.id) {
      setExpandedSubcategory(null);
    } else {
      setExpandedSubcategory(subcategory.id);
    }
  };

  const handleLevelClick = (subcategory, level, e) => {
    e.stopPropagation();
    navigate('/guest-smart-quiz', {
      state: {
        subcategoryId: subcategory.id,
        forceLevel: level,
      }
    });
  };

  const getCurrentLevelText = () => 'Choose difficulty level';

  // Meta modal helpers (guest)
  const openMetaModal = () => {
    setMetaError(null);
    setIsMetaOpen(true);
  };
  const closeMetaModal = () => {
    if (creating) return;
    setIsMetaOpen(false);
  };
  const handleCreateMeta = async () => {
    try {
      setMetaError(null);
      if (selectedSubcats.length === 0) {
        setMetaError('Please select at least one subcategory.');
        return;
      }
      if (questionCount < 1) {
        setMetaError('Question count must be at least 1.');
        return;
      }
      setCreating(true);
      // For guests, navigate directly to guest-smart-quiz with meta payload
      navigate('/guest-smart-quiz', {
        state: {
          meta: true,
          metaSubcategoryIds: selectedSubcats,
          forceLevel: metaLevel,
          questionCount,
        },
      });
      // Reset modal state
      setIsMetaOpen(false);
      setSelectedSubcats([]);
      setMetaLevel(1);
      setQuestionCount(5);
    } catch (e) {
      setMetaError('Failed to start meta quiz. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const renderGuestRow = (sub, section) => {
    const expanded = expandedSubcategory === sub.id;
    const Icon = section === 'math' ? FaCalculator : FiBookOpen;

    return (
      <li key={sub.id} className={`qb-guest-row ${expanded ? 'is-open' : ''}`}>
        <div className="qb-guest-row-head" onClick={() => handleSubcategoryClick(sub)}>
          <span className="ut-tile ut-tile--neutral qb-topic-tile">
            <Icon />
          </span>
          <span className="qb-topic-name">{sub.name}</span>
          <span className="qb-guest-row-meta">
            <span className="ut-label">{getCurrentLevelText()}</span>
            {expanded ? <FiChevronUp /> : <FiChevronDown />}
          </span>
        </div>
        {expanded && (
          <div className="qb-guest-levels">
            <button
              className="ut-btn ut-btn--soft ut-btn--sm"
              type="button"
              onClick={(e) => handleLevelClick(sub, 1, e)}
            >
              Level 1 - Easy
            </button>
            <button
              className="ut-btn ut-btn--soft ut-btn--sm"
              type="button"
              onClick={(e) => handleLevelClick(sub, 2, e)}
            >
              Level 2 - Medium
            </button>
            <button
              className="ut-btn ut-btn--soft ut-btn--sm"
              type="button"
              onClick={(e) => handleLevelClick(sub, 3, e)}
            >
              Level 3 - Hard
            </button>
          </div>
        )}
      </li>
    );
  };

  return (
    <div className="ut-page ut-page--wide qb-page">
      <header className="ut-page-head">
        <div className="ut-page-head-main">
          <p className="ut-eyebrow">Practice</p>
          <h1 className="ut-page-title">Question Bank</h1>
          <p className="ut-page-sub">
            Pick a topic and a difficulty to try a sample quiz as a guest.
          </p>
        </div>
        <div className="ut-page-head-actions">
          <button className="ut-btn ut-btn--primary" type="button" onClick={openMetaModal}>
            Create Mini Test
          </button>
        </div>
      </header>

      <div className="qb-columns ut-grid ut-grid--2">
        <section className="qb-column">
          <div className="ut-section-head">
            <h2 className="ut-section-title">Reading &amp; Writing</h2>
          </div>
          <ul className="qb-guest-list">
            {readingWritingSubcategories.map(sub => renderGuestRow(sub, 'reading'))}
          </ul>
        </section>

        <section className="qb-column">
          <div className="ut-section-head">
            <h2 className="ut-section-title">Math</h2>
          </div>
          <ul className="qb-guest-list">
            {mathSubcategories.map(sub => renderGuestRow(sub, 'math'))}
          </ul>
        </section>
      </div>

      <div className="ut-card ut-card--accent qb-mixed-card qb-guest-cta">
        <div>
          <h2 className="ut-card-title">Create a mixed mini test</h2>
          <p className="ut-card-sub">Combine topics from both sections into one short quiz.</p>
        </div>
        <button className="ut-btn ut-btn--soft ut-btn--sm" type="button" onClick={openMetaModal}>
          Create Mini Test
        </button>
      </div>

      {/* Meta Quiz Modal (Guest) - Overhauled UI */}
      <GuestMetaQuizModal
        isOpen={isMetaOpen}
        onClose={closeMetaModal}
        readingSubcategories={readingWritingSubcategories}
        mathSubcategories={mathSubcategories}
        selectedSubcats={selectedSubcats}
        setSelectedSubcats={setSelectedSubcats}
        metaLevel={metaLevel}
        setMetaLevel={setMetaLevel}
        questionCount={questionCount}
        setQuestionCount={setQuestionCount}
        onCreate={handleCreateMeta}
        creating={creating}
        error={metaError}
      />
    </div>
  );
};

export default GuestSubjectQuizzes;
