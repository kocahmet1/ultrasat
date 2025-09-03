import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSubcategoriesArray } from '../utils/subcategoryConstants';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import '../styles/SubjectQuizzes.css';

const GuestSubjectQuizzes = () => {
  const navigate = useNavigate();
  const allSubcategories = getSubcategoriesArray();
  const [expandedSubcategory, setExpandedSubcategory] = useState(null);

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

      <div className="meta-quiz-actions" style={{ opacity: 0.6 }}>
        <button className="meta-quiz-btn" disabled title="Login required to create Meta Quiz">
          Create Meta Quiz (Login Required)
        </button>
      </div>
    </div>
  );
};

export default GuestSubjectQuizzes;
