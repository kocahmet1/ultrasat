import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSubcategories } from '../contexts/SubcategoryContext';
import { useReview } from '../contexts/ReviewContext';
import ReviewTile from '../components/ReviewTile';
import { 
  getSubcategoryName,
  getSubcategoryCategory,
  getSubcategorySubject
} from '../utils/subcategoryConstants';
import '../styles/Dashboard.css';
import { FaHome, FaBook, FaPencilAlt, FaChartPie } from 'react-icons/fa';

function Dashboard() {
  const { currentUser, logout } = useAuth();
  const { 
    loading, 
    subcategoryStats, 
    recommendations, 
    allSubcategories, 
    lastUpdated,
    getCategorizedSubcategories,
    getSubcategoryNameById
  } = useSubcategories();
  const { useRepairEngine } = useReview();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // If still loading data, show a loading indicator
  if (loading) {
    return (
      <div className="dashboard-container modern-loading-container">
        <h1>Your Learning Dashboard</h1>
        <div className="loading-spinner-container">
          <div className="modern-loading-spinner"></div>
          <p>Loading your personalized data...</p>
        </div>
      </div>
    );
  }

  // Get categorized subcategories for display
  const { weak, moderate, strong } = getCategorizedSubcategories ? getCategorizedSubcategories() : { weak: [], moderate: [], strong: [] }; // Defensive check
  
  // Sort subcategories within each performance level by main category
  const sortByMainCategory = (skills) => {
    return [...skills].sort((a, b) => {
      // Get subcategory IDs - could be either the numeric ID directly or in subcategoryId field
      const subcategoryIdA = a.subcategoryId || a.subcategory;
      const subcategoryIdB = b.subcategoryId || b.subcategory;
      
      // Get subject areas (1 = reading-writing, 2 = math)
      const subjectA = getSubcategorySubject(subcategoryIdA);
      const subjectB = getSubcategorySubject(subcategoryIdB);
      
      // Sort first by subject area
      if (subjectA !== subjectB) {
        return subjectA - subjectB; // Reading-writing (1) comes before Math (2)
      }
      
      // Then sort by category path
      const categoryA = getSubcategoryCategory(subcategoryIdA);
      const categoryB = getSubcategoryCategory(subcategoryIdB);
      if (categoryA !== categoryB) {
        return categoryA.localeCompare(categoryB);
      }
      
      // Finally sort by name
      return getSubcategoryName(subcategoryIdA).localeCompare(getSubcategoryName(subcategoryIdB));
    });
  };
  
  // Apply sorting
  const sortedWeak = sortByMainCategory(weak);
  const sortedModerate = sortByMainCategory(moderate);
  const sortedStrong = sortByMainCategory(strong);

  // Helper function to calculate overall score
  const calculateOverallScore = () => {
    if (!subcategoryStats || subcategoryStats.length === 0) return 0;
    
    const totalAccuracy = subcategoryStats.reduce((sum, stat) => sum + stat.accuracyRate, 0);
    return Math.round(totalAccuracy / subcategoryStats.length);
  };

  // Helper function to get estimated SAT score
  const getEstimatedSatScore = () => {
    // This is a simplified calculation that could be improved with a more sophisticated algorithm
    const baseScore = 400;
    const maxScore = 1600;
    const accuracyScore = calculateOverallScore();
    
    return Math.min(maxScore, baseScore + Math.round(accuracyScore * 12));
  };

  return (
    <div className="app-container">
      <div className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-circle">SAT</div>
        </div>
        <ul className="sidebar-menu">
          <li onClick={() => navigate('/dashboard')}><FaHome className="nav-icon" /> My Dashboard</li>
          <li onClick={() => navigate('/progress')}><FaChartPie className="nav-icon" /> Progress Reports</li>
          <li onClick={() => navigate('/practice-exams')}><FaBook className="nav-icon" /> Practice Exams</li>
          <li onClick={() => navigate('/skills')}><FaPencilAlt className="nav-icon" /> Skills Practice</li>
        </ul>
        <button className="modern-button logout-button" onClick={() => logout()}>Logout</button>
      </div>

      <div className="main-content dashboard-main-content"> {/* Added dashboard-main-content for specific styling */}
        <header className="dashboard-header">
          <h1>Your Learning Dashboard</h1>
          <div className="user-info">
            Welcome back, {currentUser?.email || 'Student'}!
            {currentUser?.isAdmin && (
              <button 
                className="modern-button secondary-button admin-dashboard-button"
                onClick={() => navigate('/admin/dashboard')}
              >
                Admin Dashboard
              </button>
            )}
          </div>
        </header>

        <div className="dashboard-tabs">
          <button 
            className={`tab-button ${activeTab === 'overview' ? 'active' : ''} modern-button`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`tab-button ${activeTab === 'skills' ? 'active' : ''} modern-button`}
            onClick={() => setActiveTab('skills')}
          >
            Skills Breakdown
          </button>
          <button 
            className={`tab-button ${activeTab === 'recommendations' ? 'active' : ''} modern-button`}
            onClick={() => setActiveTab('recommendations')}
          >
            Recommendations
          </button>
        </div>

        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="overview-grid">
              <div className="overview-column-main">
                {/* Skills to Review -  Can be styled further or kept as is if ReviewTile handles its own modern styling */}
                <div className="skills-to-review-section card-style-container">
                  <h2 className="section-title">Skills to Review</h2>
                  <ReviewTile /> 
                </div>

                {/* Estimated SAT Score */}
                <div className="estimated-score-section card-style-container text-center">
                  <h2 className="section-title">Estimated SAT Score</h2>
                  <p className="estimated-score-value">{getEstimatedSatScore()}</p>
                  <p className="score-range-text">Range: 400-1600</p>
                </div>
              </div>

              <div className="overview-column-side">
                {/* Overall Accuracy */}
                <div className="overall-accuracy-section">
                  <div className="accuracy-card reading-writing-accuracy card-style-container">
                    <h3 className="accuracy-title">Reading and Writing</h3>
                    <p className="accuracy-value">{(() => {
                      if (!Array.isArray(subcategoryStats) || subcategoryStats.length === 0) return 0;
                      const filtered = subcategoryStats.filter(stat => ['reading', 'writing'].includes(stat.section));
                      if (filtered.length === 0) return 0;
                      return Math.round(filtered.reduce((sum, stat) => sum + (stat.accuracyRate || 0), 0) / filtered.length);
                    })()}%</p>
                    <span className="accuracy-label">Accuracy</span>
                  </div>
                  <div className="accuracy-card math-accuracy card-style-container">
                    <h3 className="accuracy-title">Math</h3>
                    <p className="accuracy-value">{(() => {
                      if (!Array.isArray(subcategoryStats) || subcategoryStats.length === 0) return 0;
                      const filtered = subcategoryStats.filter(stat => ['math-calc', 'math-no-calc'].includes(stat.section));
                      if (filtered.length === 0) return 0;
                      return Math.round(filtered.reduce((sum, stat) => sum + (stat.accuracyRate || 0), 0) / filtered.length);
                    })()}%</p>
                    <span className="accuracy-label">Accuracy</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="subcategory-performance-section">
              <h2 className="section-title">Your Subcategory Performance</h2>
              
              {(!weak || weak.length === 0) && (!moderate || moderate.length === 0) && (!strong || strong.length === 0) && (
                <div className="no-data-message card-style-container">
                  <p>No subcategory performance data available yet. Complete some practice activities to see your progress here!</p>
                </div>
              )}

              {weak && weak.length > 0 && (
                <div className="performance-level-group needs-improvement">
                  <h3 className="performance-level-title">Needs Improvement (Below 70%)</h3>
                  <div className="subcategory-cards-grid">
                    {sortedWeak.map(subcat => {
                      const subcatId = subcat.subcategoryId || subcat.id;
                      const subcatName = getSubcategoryNameById(subcatId) || 'Unknown Subcategory';
                      return (
                        <div key={subcatId} className="subcategory-card performance-weak">
                          <div className="subcategory-card-content">
                            <h4 className="subcategory-card-title">{subcatName}</h4>
                            <p className="subcategory-card-metric">
                              Accuracy: {subcat.accuracyRate !== undefined ? subcat.accuracyRate.toFixed(0) + '%' : 'N/A'}
                            </p>
                          </div>
                          <div className="subcategory-card-actions">
                            <button 
                              className="modern-button primary-button view-details-button"
                              onClick={() => navigate(`/skills/${subcatId}`)}
                            >
                              View Details
                            </button>
                            {/* Add Quick Drill functionality if desired, similar to ProgressDashboard */}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {moderate && moderate.length > 0 && (
                <div className="performance-level-group moderate-performance">
                  <h3 className="performance-level-title">Moderate (70-85%)</h3>
                  <div className="subcategory-cards-grid">
                    {sortedModerate.map(subcat => {
                      const subcatId = subcat.subcategoryId || subcat.id;
                      const subcatName = getSubcategoryNameById(subcatId) || 'Unknown Subcategory';
                      return (
                        <div key={subcatId} className="subcategory-card performance-moderate">
                          <div className="subcategory-card-content">
                            <h4 className="subcategory-card-title">{subcatName}</h4>
                            <p className="subcategory-card-metric">
                              Accuracy: {subcat.accuracyRate !== undefined ? subcat.accuracyRate.toFixed(0) + '%' : 'N/A'}
                            </p>
                          </div>
                          <div className="subcategory-card-actions">
                            <button 
                              className="modern-button primary-button view-details-button"
                              onClick={() => navigate(`/skills/${subcatId}`)}
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {strong && strong.length > 0 && (
                <div className="performance-level-group strong-performance">
                  <h3 className="performance-level-title">Strong (Above 85%)</h3>
                  <div className="subcategory-cards-grid">
                    {sortedStrong.map(subcat => {
                      const subcatId = subcat.subcategoryId || subcat.id;
                      const subcatName = getSubcategoryNameById(subcatId) || 'Unknown Subcategory';
                      return (
                        <div key={subcatId} className="subcategory-card performance-strong">
                          <div className="subcategory-card-content">
                            <h4 className="subcategory-card-title">{subcatName}</h4>
                            <p className="subcategory-card-metric">
                              Accuracy: {subcat.accuracyRate !== undefined ? subcat.accuracyRate.toFixed(0) + '%' : 'N/A'}
                            </p>
                          </div>
                          <div className="subcategory-card-actions">
                            <button 
                              className="modern-button primary-button view-details-button"
                              onClick={() => navigate(`/skills/${subcatId}`)}
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'skills' && (
          <div className="skills-breakdown-tab">
            <h2 className="section-title">Detailed Skills Breakdown</h2>
            {/* This section will also need the card-based display logic for all subcategories */}
            {/* Placeholder for now */}
            <div className="no-data-message card-style-container">
                <p>Detailed skills breakdown will show all your subcategories with their performance. This will be updated to the new card style soon.</p>
            </div>
             {/* TODO: Iterate over allSubcategories or a combined list and display them as cards, perhaps grouped by section/category */}
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div className="recommendations-tab">
            <h2 className="section-title">Personalized Recommendations</h2>
            
            {(!recommendations || (!recommendations.weakSkills?.length && !recommendations.recommendedQuizzes?.length && !recommendations.recommendedResources?.length)) && (!subcategoryStats || subcategoryStats.length === 0) ? (
              <div className="no-data-message card-style-container">
                <p>We don't have enough data to make personalized recommendations yet.</p>
                <p>Complete a full exam or some practice drills to get started.</p>
                <button 
                  className="modern-button primary-button"
                  onClick={() => navigate('/practice-exams')}
                >
                  Explore Practice Exams
                </button>
              </div>
            ) : (
              <>
                {recommendations?.feedback && (
                  <div className="feedback-message card-style-container">
                    <p>{recommendations.feedback}</p>
                  </div>
                )}

                {recommendations?.weakSkills && recommendations.weakSkills.length > 0 && (
                  <div className="recommendation-section">
                    <h3 className="recommendation-section-title">Recommended Focus Areas</h3>
                    <div className="recommendation-cards-grid">
                      {recommendations.weakSkills.map(skillId => (
                        <div className="subcategory-card recommendation-card" key={`rec-skill-${skillId}`}>
                          <div className="subcategory-card-content">
                            <h4 className="subcategory-card-title">{getSubcategoryNameById(skillId)}</h4>
                            <p className="recommendation-text">This subcategory needs attention based on your performance.</p>
                          </div>
                          <div className="subcategory-card-actions">
                            <button 
                              className="modern-button primary-button"
                              onClick={() => navigate(`/skills/${skillId}`)}
                            >
                              View Details
                            </button>
                            {/* <button className="modern-button secondary-button">Practice</button> */}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {recommendations?.recommendedQuizzes && recommendations.recommendedQuizzes.length > 0 && (
                  <div className="recommendation-section">
                    <h3 className="recommendation-section-title">Recommended Practice Quizzes</h3>
                    <div className="recommendation-cards-grid">
                      {recommendations.recommendedQuizzes.map(quiz => ( // Assuming quiz is an object with id and title
                        <div className="subcategory-card recommendation-card" key={`rec-quiz-${quiz.id || quiz}`}>
                          <div className="subcategory-card-content">
                             <h4 className="subcategory-card-title">{quiz.title || getSubcategoryNameById(quiz.subcategoryId) + " Quiz" || "Targeted Quiz"}</h4>
                            <p className="recommendation-text">A focused practice set to improve your skills.</p>
                          </div>
                          <div className="subcategory-card-actions">
                            <button 
                              className="modern-button primary-button"
                              onClick={() => navigate(`/adaptive-quiz/${quiz.id || quiz}`)} // quiz might be ID or object
                            >
                              Start Quiz
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {recommendations?.recommendedResources && recommendations.recommendedResources.length > 0 && (
                  <div className="recommendation-section">
                    <h3 className="recommendation-section-title">Recommended Study Resources</h3>
                    <div className="recommendation-cards-grid">
                      {recommendations.recommendedResources.map(resource => ( // Assuming resource is an object
                        <div className="subcategory-card recommendation-card" key={`rec-res-${resource.id}`}>
                           <div className="subcategory-card-content">
                            <h4 className="subcategory-card-title">{resource.title || "Study Material"}</h4>
                            <p className="recommendation-text">Review this material to strengthen your understanding.</p>
                          </div>
                          <div className="subcategory-card-actions">
                            <button 
                              className="modern-button primary-button"
                              onClick={() => navigate(`/resources/${resource.id}`)}
                            >
                              View Resource
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      
        <div className="dashboard-footer">
          <p>Last updated: {lastUpdated ? new Date(lastUpdated.seconds * 1000).toLocaleString() : 'Never'}</p>
          <div className="dashboard-actions">
            <button className="modern-button primary-button" onClick={() => navigate('/practice-exams')}>Start Full Exam</button>
            <button className="modern-button secondary-button" onClick={() => navigate('/skills')}>Practice Weak Areas</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
