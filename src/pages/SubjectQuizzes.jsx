import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getSubcategoriesArray } from '../utils/subcategoryConstants';
import { getSubcategoryProgress } from '../utils/progressUtils';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import '../styles/SubjectQuizzes.css';
import Modal from '../components/Modal';
import { createMetaSmartQuiz } from '../utils/smartQuizUtils';

const SubjectQuizzes = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const allSubcategories = getSubcategoriesArray();
  const [expandedSubcategory, setExpandedSubcategory] = useState(null);
  const [userLevels, setUserLevels] = useState({});
  const [loadingLevels, setLoadingLevels] = useState({});
  // Meta quiz state
  const [isMetaOpen, setIsMetaOpen] = useState(!!(location.state && location.state.openMeta));
  const [selectedSubcats, setSelectedSubcats] = useState([]);
  const [metaLevel, setMetaLevel] = useState(1);
  const [questionCount, setQuestionCount] = useState(5);
  const [creating, setCreating] = useState(false);
  const [metaError, setMetaError] = useState(null);

  const readingWritingSubcategories = allSubcategories.filter(sc => sc.section === 'reading');
  const mathSubcategories = allSubcategories.filter(sc => sc.section === 'math');

  const handleSubcategoryClick = async (subcategory) => {
    if (expandedSubcategory === subcategory.id) {
      // If clicking on already expanded subcategory, collapse it
      setExpandedSubcategory(null);
    } else {
      // Expand this subcategory
      setExpandedSubcategory(subcategory.id);
      
      // Load level for this subcategory if not already loaded
      if (!userLevels[subcategory.id] && currentUser && !loadingLevels[subcategory.id]) {
        setLoadingLevels(prev => ({ ...prev, [subcategory.id]: true }));
        
        try {
          const progress = await getSubcategoryProgress(currentUser.uid, subcategory.id);
          setUserLevels(prev => ({
            ...prev,
            [subcategory.id]: progress?.level || 1
          }));
        } catch (error) {
          console.error(`Error loading level for ${subcategory.id}:`, error);
          setUserLevels(prev => ({
            ...prev,
            [subcategory.id]: 1
          }));
        } finally {
          setLoadingLevels(prev => ({ ...prev, [subcategory.id]: false }));
        }
      }
    }
  };

  const handleLevelClick = (subcategory, level, e) => {
    e.stopPropagation(); // Prevent triggering the subcategory click
    navigate('/smart-quiz-generator', { 
      state: { 
        subcategoryId: subcategory.id, 
        forceLevel: level,
        userCurrentLevel: userLevels[subcategory.id] || 1 // Pass user's current level for progression logic
      } 
    });
  };

  // Meta modal helpers
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
        setMetaError('You must be logged in to create a meta quiz.');
        return;
      }
      if (selectedSubcats.length === 0) {
        setMetaError('Please select at least one subcategory.');
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
      // Navigate to intro with meta data
      navigate('/smart-quiz-intro', {
        state: {
          quizId,
          meta: true,
          metaSubcategoryIds: selectedSubcats,
          level: metaLevel,
        },
      });
      // Reset modal state
      setIsMetaOpen(false);
      setSelectedSubcats([]);
      setMetaLevel(1);
      setQuestionCount(5);
    } catch (e) {
      console.error('Failed to create meta quiz:', e);
      setMetaError(e?.message || 'Failed to create meta quiz. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const getCurrentLevelText = (subcategoryId) => {
    if (loadingLevels[subcategoryId]) {
      return 'Loading...';
    }
    if (userLevels[subcategoryId]) {
      return `Current: Level ${userLevels[subcategoryId]}`;
    }
    return 'Choose difficulty level';
  };

  return (
    <div className="subject-quizzes-container">
        <h1 className="subject-quizzes-title">Subject Quizzes</h1>
        <div className="meta-quiz-actions">
          <button className="meta-quiz-btn" onClick={openMetaModal}>
            Create Meta Quiz
          </button>
        </div>

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
                      {getCurrentLevelText(sub.id)}
                    </span>
                    {expandedSubcategory === sub.id ? <FaChevronUp /> : <FaChevronDown />}
                  </div>
                </div>
                {expandedSubcategory === sub.id && (
                  <div className="level-selection-menu">
                    <div className="level-buttons">
                      <button 
                        className={`level-btn ${(userLevels[sub.id] || 1) >= 1 ? 'available' : 'locked'}`}
                        onClick={(e) => handleLevelClick(sub, 1, e)}
                        disabled={false}
                      >
                        Level 1 - Easy
                      </button>
                      <button 
                        className={`level-btn ${(userLevels[sub.id] || 1) >= 2 ? 'available' : 'preview'}`}
                        onClick={(e) => handleLevelClick(sub, 2, e)}
                        disabled={false}
                      >
                        Level 2 - Medium
                      </button>
                      <button 
                        className={`level-btn ${(userLevels[sub.id] || 1) >= 3 ? 'available' : 'preview'}`}
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
                      {getCurrentLevelText(sub.id)}
                    </span>
                    {expandedSubcategory === sub.id ? <FaChevronUp /> : <FaChevronDown />}
                  </div>
                </div>
                {expandedSubcategory === sub.id && (
                  <div className="level-selection-menu">
                    <div className="level-buttons">
                      <button 
                        className={`level-btn ${(userLevels[sub.id] || 1) >= 1 ? 'available' : 'locked'}`}
                        onClick={(e) => handleLevelClick(sub, 1, e)}
                        disabled={false}
                      >
                        Level 1 - Easy
                      </button>
                      <button 
                        className={`level-btn ${(userLevels[sub.id] || 1) >= 2 ? 'available' : 'preview'}`}
                        onClick={(e) => handleLevelClick(sub, 2, e)}
                        disabled={false}
                      >
                        Level 2 - Medium
                      </button>
                      <button 
                        className={`level-btn ${(userLevels[sub.id] || 1) >= 3 ? 'available' : 'preview'}`}
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

      {/* Meta Quiz Modal */}
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

export default SubjectQuizzes;