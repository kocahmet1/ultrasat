/**
 * Concept Analytics Dashboard
 * Displays concept mastery insights and struggling concepts for the user
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserStrugglingConcepts } from '../firebase/predefinedConceptsServices';
import { CONCEPT_MASTERY_LEVELS } from '../firebase/predefinedConceptsSchema';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChartLine, 
  faExclamationTriangle, 
  faCheckCircle, 
  faClock,
  faLightbulb,
  faTrendingUp,
  faBook
} from '@fortawesome/free-solid-svg-icons';
import '../styles/ConceptAnalytics.css';

export default function ConceptAnalytics() {
  const { currentUser } = useAuth();
  const [strugglingConcepts, setStrugglingConcepts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadAnalytics = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        
        // Get struggling concepts
        const struggling = await getUserStrugglingConcepts(currentUser.uid, 15);
        setStrugglingConcepts(struggling);
        
      } catch (err) {
        console.error('Error loading concept analytics:', err);
        setError('Failed to load concept analytics. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [currentUser]);

  const getMasteryLevelText = (level) => {
    switch (level) {
      case CONCEPT_MASTERY_LEVELS.NOT_ATTEMPTED:
        return 'Not Attempted';
      case CONCEPT_MASTERY_LEVELS.STRUGGLING:
        return 'Struggling';
      case CONCEPT_MASTERY_LEVELS.UNDERSTANDING:
        return 'Understanding';
      case CONCEPT_MASTERY_LEVELS.MASTERED:
        return 'Mastered';
      default:
        return 'Unknown';
    }
  };

  const getMasteryLevelColor = (level) => {
    switch (level) {
      case CONCEPT_MASTERY_LEVELS.NOT_ATTEMPTED:
        return '#6c757d';
      case CONCEPT_MASTERY_LEVELS.STRUGGLING:
        return '#dc3545';
      case CONCEPT_MASTERY_LEVELS.UNDERSTANDING:
        return '#ffc107';
      case CONCEPT_MASTERY_LEVELS.MASTERED:
        return '#28a745';
      default:
        return '#6c757d';
    }
  };

  const formatSubcategoryName = (subcategoryId) => {
    return subcategoryId
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (loading) {
    return (
      <div className="concept-analytics">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading concept analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="concept-analytics">
        <div className="error-container">
          <FontAwesomeIcon icon={faExclamationTriangle} className="error-icon" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="concept-analytics">
      <div className="analytics-header">
        <h1>
          <FontAwesomeIcon icon={faChartLine} className="page-icon" />
          Concept Mastery Analytics
        </h1>
        <p className="page-description">
          Track your understanding of key concepts and identify areas for improvement
        </p>
      </div>

      <div className="analytics-grid">
        {/* Struggling Concepts Section */}
        <div className="analytics-card struggling-concepts-card">
          <div className="card-header">
            <h2>
              <FontAwesomeIcon icon={faExclamationTriangle} className="section-icon struggling" />
              Concepts to Review
            </h2>
            <span className="concept-count">{strugglingConcepts.length}</span>
          </div>
          
          {strugglingConcepts.length === 0 ? (
            <div className="empty-state">
              <FontAwesomeIcon icon={faCheckCircle} className="empty-icon" />
              <h3>Great job!</h3>
              <p>You don't have any struggling concepts right now. Keep up the excellent work!</p>
            </div>
          ) : (
            <div className="concepts-list">
              {strugglingConcepts.map((concept, index) => (
                <div key={concept.documentId || index} className="concept-item">
                  <div className="concept-header">
                    <h3 className="concept-name">{concept.conceptDetails.name}</h3>
                    <div className="concept-stats">
                      <span className="accuracy-badge struggling">
                        {Math.round(concept.accuracy * 100)}% accuracy
                      </span>
                      <span className="subcategory-badge">
                        {formatSubcategoryName(concept.subcategoryId)}
                      </span>
                    </div>
                  </div>
                  
                  <p className="concept-description">
                    {concept.conceptDetails.description}
                  </p>
                  
                  <div className="concept-metrics">
                    <div className="metric">
                      <FontAwesomeIcon icon={faClock} className="metric-icon" />
                      <span>{concept.questionsAttempted} questions attempted</span>
                    </div>
                    <div className="metric">
                      <FontAwesomeIcon icon={faCheckCircle} className="metric-icon" />
                      <span>{concept.questionsCorrect} correct answers</span>
                    </div>
                    {concept.strugglingStreak > 0 && (
                      <div className="metric struggling-streak">
                        <FontAwesomeIcon icon={faExclamationTriangle} className="metric-icon" />
                        <span>{concept.strugglingStreak} consecutive incorrect</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="concept-actions">
                    <button 
                      className="action-button practice-button"
                      onClick={() => {
                        // Navigate to practice for this subcategory
                        window.location.href = `/smart-quiz-intro/${concept.subcategoryId}`;
                      }}
                    >
                      <FontAwesomeIcon icon={faBook} />
                      Practice This Concept
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recommendations Section */}
        <div className="analytics-card recommendations-card">
          <div className="card-header">
            <h2>
              <FontAwesomeIcon icon={faLightbulb} className="section-icon recommendations" />
              Recommendations
            </h2>
          </div>
          
          <div className="recommendations-list">
            {strugglingConcepts.length > 0 ? (
              <>
                <div className="recommendation-item">
                  <div className="recommendation-icon">
                    <FontAwesomeIcon icon={faBook} />
                  </div>
                  <div className="recommendation-content">
                    <h3>Focus on Core Concepts</h3>
                    <p>
                      You have {strugglingConcepts.length} concept{strugglingConcepts.length !== 1 ? 's' : ''} that need attention. 
                      Consider reviewing the fundamentals before attempting more practice questions.
                    </p>
                  </div>
                </div>
                
                <div className="recommendation-item">
                  <div className="recommendation-icon">
                    <FontAwesomeIcon icon={faTrendingUp} />
                  </div>
                  <div className="recommendation-content">
                    <h3>Practice Consistently</h3>
                    <p>
                      Regular practice helps improve concept mastery. Try to complete at least one quiz per day 
                      in areas where you're struggling.
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="recommendation-item">
                <div className="recommendation-icon">
                  <FontAwesomeIcon icon={faCheckCircle} />
                </div>
                <div className="recommendation-content">
                  <h3>Excellent Progress!</h3>
                  <p>
                    You're not struggling with any concepts right now. Keep practicing to maintain your mastery 
                    and consider exploring more advanced topics.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Study Plan Section */}
        <div className="analytics-card study-plan-card">
          <div className="card-header">
            <h2>
              <FontAwesomeIcon icon={faBook} className="section-icon study-plan" />
              Suggested Study Plan
            </h2>
          </div>
          
          <div className="study-plan-content">
            {strugglingConcepts.length > 0 ? (
              <div className="study-steps">
                <div className="study-step">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <h3>Review Fundamentals</h3>
                    <p>Start with the concept that has the lowest accuracy rate</p>
                    {strugglingConcepts.length > 0 && (
                      <p className="highlighted-concept">
                        Focus on: <strong>{strugglingConcepts[0].conceptDetails.name}</strong>
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="study-step">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <h3>Practice Questions</h3>
                    <p>Complete 2-3 quizzes focusing on your struggling concepts</p>
                  </div>
                </div>
                
                <div className="study-step">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <h3>Track Progress</h3>
                    <p>Monitor your accuracy improvement over time</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="study-plan-success">
                <FontAwesomeIcon icon={faCheckCircle} className="success-icon" />
                <h3>Continue Your Excellent Work!</h3>
                <p>
                  Since you're not struggling with any concepts, focus on:
                </p>
                <ul>
                  <li>Maintaining your current mastery levels</li>
                  <li>Exploring new topics and subcategories</li>
                  <li>Increasing difficulty levels where possible</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 