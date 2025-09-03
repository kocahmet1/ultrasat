import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getSubcategoriesArray } from '../utils/subcategoryConstants';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import '../styles/SubjectQuizzes.css';
import Modal from '../components/Modal';

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
          Create Meta Quiz
        </button>
      </div>

      {/* Meta Quiz Modal (Guest) */}
      <Modal isOpen={isMetaOpen} onClose={closeMetaModal} title="Create Meta Quiz">
        <div className="meta-modal-content">
          <div className="meta-section">
            <h3>Select Subcategories</h3>
            <div className="meta-subcat-groups">
              <div className="meta-group">
                <h4>Reading & Writing</h4>
                <div className="meta-subcat-list">
                  {readingWritingSubcategories.map(sc => (
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
                  {mathSubcategories.map(sc => (
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
            <div className="meta-selected-count">Selected: {selectedSubcats.length}</div>
          </div>

          <div className="meta-section">
            <h3>Difficulty</h3>
            <div className="meta-levels">
              {[1,2,3].map(l => (
                <label key={l} className={`meta-level-option ${metaLevel === l ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="meta-level"
                    value={l}
                    checked={metaLevel === l}
                    onChange={() => setMetaLevel(l)}
                  />
                  Level {l}
                </label>
              ))}
            </div>
          </div>

          <div className="meta-section">
            <h3>Question Count</h3>
            <input
              type="number"
              min={1}
              max={30}
              value={questionCount}
              onChange={(e) => setQuestionCount(parseInt(e.target.value || '1', 10))}
              style={{ width: '100%', padding: '8px' }}
            />
          </div>

          {metaError && <div className="meta-error">{metaError}</div>}
          <div className="meta-actions">
            <button className="btn-secondary" onClick={closeMetaModal} disabled={creating}>Cancel</button>
            <button
              className="btn-primary"
              onClick={handleCreateMeta}
              disabled={creating || selectedSubcats.length === 0}
            >
              {creating ? 'Creating...' : 'Create Quiz'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default GuestSubjectQuizzes;
