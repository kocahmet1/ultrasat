import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getSubcategoriesArray } from '../utils/subcategoryConstants';
import '../styles/SubjectQuizzes.css';

const SubjectQuizzes = () => {
  const navigate = useNavigate();
  const allSubcategories = getSubcategoriesArray();

  const readingWritingSubcategories = allSubcategories.filter(sc => sc.section === 'reading');
  const mathSubcategories = allSubcategories.filter(sc => sc.section === 'math');

  const handleSubcategoryClick = (subcategory) => {
    navigate('/smart-quiz-generator', { state: { subcategoryId: subcategory.id } });
  };

  return (
    <div className="subject-quizzes-container">
        <h1 className="subject-quizzes-title">Subject Quizzes</h1>

      <div className="quiz-selection-container">
        <div className="quiz-category-card reading-writing-card">
          <h2>Reading & Writing</h2>
          <ul className="subcategory-list-inline">
            {readingWritingSubcategories.map(sub => (
              <li key={sub.id} onClick={() => handleSubcategoryClick(sub)}>
                {sub.name}
              </li>
            ))}
          </ul>
        </div>
        <div className="quiz-category-card math-card">
          <h2>Math</h2>
          <ul className="subcategory-list-inline">
            {mathSubcategories.map(sub => (
              <li key={sub.id} onClick={() => handleSubcategoryClick(sub)}>
                {sub.name}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SubjectQuizzes;
