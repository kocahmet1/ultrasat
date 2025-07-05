import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getSubcategoriesArray } from '../utils/subcategoryConstants';
import '../styles/LecturesPage.css';

const LecturesPage = () => {
  const navigate = useNavigate();
  const allSubcategories = getSubcategoriesArray();

  const readingWritingSubcategories = allSubcategories.filter(sc => sc.section === 'reading');
  const mathSubcategories = allSubcategories.filter(sc => sc.section === 'math');

  const handleSubcategoryClick = (subcategory) => {
    const slug = subcategory.name.toLowerCase().replace(/\s+/g, '-');
    navigate(`/learn/${slug}`);
  };

  return (
    <div className="lectures-page-container">
        <h1 className="lectures-page-title">Lectures</h1>

      <div className="lecture-selection-container">
        <div className="lecture-category-card reading-writing-card-lecture">
          <h2>Reading & Writing</h2>
          <ul className="lecture-subcategory-list-inline">
            {readingWritingSubcategories.map(sub => (
              <li key={sub.id} onClick={() => handleSubcategoryClick(sub)}>
                {sub.name}
              </li>
            ))}
          </ul>
        </div>
        <div className="lecture-category-card math-card-lecture">
          <h2>Math</h2>
          <ul className="lecture-subcategory-list-inline">
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

export default LecturesPage;
