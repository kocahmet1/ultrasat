import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getSubcategoriesArray } from '../utils/subcategoryConstants';
import { getSubcategoryProgress } from '../utils/progressUtils';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import '../styles/SubjectQuizzes.css';

const SubjectQuizzes = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const allSubcategories = getSubcategoriesArray();
  const [expandedSubcategory, setExpandedSubcategory] = useState(null);
  const [userLevels, setUserLevels] = useState({});
  const [loadingLevels, setLoadingLevels] = useState({});

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
    </div>
  );
};

export default SubjectQuizzes;