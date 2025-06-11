import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBook, FaBrain, FaChevronDown, FaChevronUp, FaRegChartBar } from 'react-icons/fa'; 
import { useSubcategories } from '../contexts/SubcategoryContext';
import { getFeatureFlags } from '../firebase/config.featureFlags';
import '../styles/SkillsPractice.new.css'; 

function SkillsPractice() {
  const navigate = useNavigate();
  const {
    loading,
    subcategoryStats,
    allSubcategories,
    getSubcategoryNameById
  } = useSubcategories();

  const [activeSection, setActiveSection] = useState('reading-writing'); 
  const [expandedCategories, setExpandedCategories] = useState({}); 
  const [flags, setFlags] = useState({});

  useEffect(() => {
    getFeatureFlags().then(setFlags);
  }, []);

  const categorizedSubcategories = useMemo(() => {
    const result = {
      "reading-writing": {
        title: "Reading & Writing",
        categories: {}
      },
      "math": {
        title: "Math",
        categories: {}
      }
    };

    if (!allSubcategories || !Array.isArray(allSubcategories) || allSubcategories.length === 0) {
      return result;
    }

    allSubcategories.forEach(subcategory => {
      if (!subcategory || typeof subcategory.section !== 'string' || !subcategory.section.trim() ||
          typeof subcategory.mainCategory !== 'string' || !subcategory.mainCategory.trim() ||
          !subcategory.id) { 
        console.warn("SkillsPractice: Invalid subcategory structure or missing ID. Skipping.", subcategory);
        return;
      }

      const sectionKey = subcategory.section.toLowerCase().replace(/\s+/g, '-'); 
      const mainCategoryKey = subcategory.mainCategory.toLowerCase().replace(/\s+/g, '-'); 

      if (result.hasOwnProperty(sectionKey)) {
        if (!result[sectionKey].categories.hasOwnProperty(mainCategoryKey)) {
          result[sectionKey].categories[mainCategoryKey] = {
            id: mainCategoryKey, 
            name: formatCategoryName(subcategory.mainCategory), 
            subcategories: []
          };
        }

        const stats = subcategoryStats.find(stat => 
          stat && (stat.subcategoryId === subcategory.id || stat.subcategory === subcategory.id)
        );

        result[sectionKey].categories[mainCategoryKey].subcategories.push({
          ...subcategory,
          stats: stats || { totalAttempts: 0, correctAttempts: 0, accuracyRate: 0 }
        });
      } else {
        console.warn(`SkillsPractice: Encountered subcategory with unknown section '${sectionKey}'. Subcategory ID: ${subcategory.id}. Skipping.`);
      }
    });

    Object.values(result).forEach(sectionData => {
      const sortedCategories = Object.entries(sectionData.categories)
        .sort(([, a], [, b]) => a.name.localeCompare(b.name))
        .reduce((obj, [key, value]) => {
          obj[key] = value;
          return obj;
        }, {});
      sectionData.categories = sortedCategories;
    });

    return result;
  }, [allSubcategories, subcategoryStats]);

  function formatCategoryName(category) {
    if (typeof category !== 'string' || !category.trim()) {
      return "Unnamed Category";
    }
    return category
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  function getAccuracyColor(accuracyRate) {
    if (accuracyRate == null) accuracyRate = 0;
    if (accuracyRate >= 85) return 'var(--accuracy-strong)'; 
    if (accuracyRate >= 70) return 'var(--accuracy-moderate)'; 
    return 'var(--accuracy-weak)'; 
  }

  const handleToggleCategory = (mainCategoryId) => {
    setExpandedCategories(prev => ({ ...prev, [mainCategoryId]: !prev[mainCategoryId] }));
  };

  const handleStartPracticeFlow = (subcategory) => {
    if (!subcategory || !subcategory.id) {
      console.error("SkillsPractice: Subcategory ID is missing.");
      return;
    }

    const stats = subcategory.stats || { accuracyRate: 0, totalAttempts: 0 }; 
    const accuracyRate = stats.accuracyRate || 0;
    const totalAttempted = stats.totalAttempts || 0; 

    const targetPath = flags.smartQuizEnabled ? '/smart-quiz-generator' : '/adaptive-quiz-generator';
    navigate(targetPath, {
      state: {
        subcategoryId: subcategory.id.toString(), 
        autoDifficultyParams: {
          accuracyRate: accuracyRate,
          totalAttempted: totalAttempted
        }
      }
    });
  };

  const goToLesson = (subcategoryId) => {
    alert(`Navigating to lesson for ${getSubcategoryNameById(subcategoryId)} (ID: ${subcategoryId}) - Feature coming soon!`);
  };

  const currentSectionData = categorizedSubcategories[activeSection];

  if (loading) {
    return (
      <div className="skills-practice-page-loading">
        <div className="loading-spinner">Loading skills data...</div>
      </div>
    );
  }

  return (
    <div className="skills-practice-page"> 
      <header className="skills-page-header">
        <h1>Skills Practice</h1>
        <p>Select a section and category to begin sharpening your SAT skills.</p>
      </header>

      <div className="section-tabs">
        <button
          className={`tab-button ${activeSection === 'reading-writing' ? 'active' : ''}`}
          onClick={() => setActiveSection('reading-writing')}
        >
          Reading & Writing
        </button>
        <button
          className={`tab-button ${activeSection === 'math' ? 'active' : ''}`}
          onClick={() => setActiveSection('math')}
        >
          Math
        </button>
      </div>

      <div className="skills-content-area">
        {currentSectionData && Object.keys(currentSectionData.categories).length > 0 ? (
          Object.values(currentSectionData.categories).map((mainCatData) => (
            <div key={mainCatData.id} className="main-category-card">
              <div className="main-category-header" onClick={() => handleToggleCategory(mainCatData.id)}>
                <div className="main-category-title-icon">
                  <FaRegChartBar className="main-category-icon" /> 
                  <h2>{mainCatData.name}</h2>
                </div>
                {expandedCategories[mainCatData.id] ? <FaChevronUp /> : <FaChevronDown />}
              </div>
              {expandedCategories[mainCatData.id] && (
                <div className="subcategory-accordion-content">
                  {mainCatData.subcategories && mainCatData.subcategories.length > 0 ? (
                    mainCatData.subcategories.map(subcategory => (
                      <div key={subcategory.id} className="subcategory-item-new">
                        <div className="subcategory-info">
                          <h3>{getSubcategoryNameById(subcategory.id) || subcategory.name}</h3>
                          <div className="progress-bar-container-new">
                            <div
                              className="progress-bar-fill-new"
                              style={{
                                width: `${subcategory.stats?.accuracyRate || 0}%`,
                                backgroundColor: getAccuracyColor(subcategory.stats?.accuracyRate)
                              }}
                            >
                              <span>{Math.round(subcategory.stats?.accuracyRate || 0)}%</span>
                            </div>
                          </div>
                        </div>
                        <div className="subcategory-actions">
                          <button className="action-button practice" onClick={() => handleStartPracticeFlow(subcategory)}>
                            <FaBrain /> Practice
                          </button>
                          <button className="action-button learn" onClick={() => goToLesson(subcategory.id)}>
                            <FaBook /> Learn
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="no-subcategories-message">No subcategories available for {mainCatData.name}.</p>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="no-categories-message">No categories found for {currentSectionData?.title || activeSection}.</p>
        )}
      </div>
    </div>
  );
}

export default SkillsPractice;
