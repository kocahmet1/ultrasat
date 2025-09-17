import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getSubcategoriesArray } from '../utils/subcategoryConstants';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
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
  const toggleSubcat = (id) => {
    setSelectedSubcats((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
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

  return (
    <div className="subject-quizzes-container">
      <h1 className="subject-quizzes-title">Subject Quizzes (Guest)</h1>

      <div className="quiz-selection-container">
        <div className="quiz-category-card reading-writing-card">
          <h2>Reading & Writing</h2>
          <ul className="subcategory-list-inline">
            {readingWritingSubcategories.map(sub => (
              <li key={sub.id} className={`subcategory-item ${expandedSubcategory === sub.id ? 'expanded' : ''}`}>
                <div className="subcategory-header" onClick={() => handleSubcategoryClick(sub)}>
                  <span className="subcategory-name">{sub.name}</span>
                  <div className="subcategory-controls">
                    <span className="current-level">
                      {getCurrentLevelText()}
                    </span>
                    {expandedSubcategory === sub.id ? <FaChevronUp /> : <FaChevronDown />}
                  </div>
                </div>
                {expandedSubcategory === sub.id && (
                  <div className="level-selection-menu">
                    <div className="level-buttons">
                      <button 
                        className={`level-btn available`}
                        onClick={(e) => handleLevelClick(sub, 1, e)}
                        disabled={false}
                      >
                        Level 1 - Easy
                      </button>
                      <button 
                        className={`level-btn available`}
                        onClick={(e) => handleLevelClick(sub, 2, e)}
                        disabled={false}
                      >
                        Level 2 - Medium
                      </button>
                      <button 
                        className={`level-btn available`}
                        onClick={(e) => handleLevelClick(sub, 3, e)}
                        disabled={false}
                      >
                        Level 3 - Hard
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="quiz-category-card math-card">
          <h2>Math</h2>
          <ul className="subcategory-list-inline">
            {mathSubcategories.map(sub => (
              <li key={sub.id} className={`subcategory-item ${expandedSubcategory === sub.id ? 'expanded' : ''}`}>
                <div className="subcategory-header" onClick={() => handleSubcategoryClick(sub)}>
                  <span className="subcategory-name">{sub.name}</span>
                  <div className="subcategory-controls">
                    <span className="current-level">
                      {getCurrentLevelText()}
                    </span>
                    {expandedSubcategory === sub.id ? <FaChevronUp /> : <FaChevronDown />}
                  </div>
                </div>
                {expandedSubcategory === sub.id && (
                  <div className="level-selection-menu">
                    <div className="level-buttons">
                      <button 
                        className={`level-btn available`}
                        onClick={(e) => handleLevelClick(sub, 1, e)}
                        disabled={false}
                      >
                        Level 1 - Easy
                      </button>
                      <button 
                        className={`level-btn available`}
                        onClick={(e) => handleLevelClick(sub, 2, e)}
                        disabled={false}
                      >
                        Level 2 - Medium
                      </button>
                      <button 
                        className={`level-btn available`}
                        onClick={(e) => handleLevelClick(sub, 3, e)}
                        disabled={false}
                      >
                        Level 3 - Hard
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="meta-quiz-actions">
        <button className="meta-quiz-btn" onClick={openMetaModal}>
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
