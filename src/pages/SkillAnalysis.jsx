import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSubcategories } from '../contexts/SubcategoryContext';
import { 
  getQuestionsBySkillTag, 
  getQuizzesBySkillTag, 
  getResourcesBySkillTag 
} from '../firebase/services';
import '../styles/SkillAnalysis.css';

function SkillAnalysis() {
  const { skillId } = useParams();
  const navigate = useNavigate();
  const { getSubcategoryNameById, subcategoryStats, loading: subcategoriesLoading } = useSubcategories();
  
  const [loading, setLoading] = useState(true);
  const [skillName, setSkillName] = useState('');
  const [skillStat, setSkillStat] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [resources, setResources] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const loadSkillData = async () => {
      if (subcategoriesLoading) return;
      
      setLoading(true);
      try {
        // Get subcategory name
        const name = getSubcategoryNameById(skillId);
        setSkillName(name);
        
        // Find subcategory stats
        const stat = subcategoryStats.find(s => s.subcategory === skillId);
        setSkillStat(stat || null);
        
        // Load related questions, quizzes and resources
        const [questionsData, quizzesData, resourcesData] = await Promise.all([
          getQuestionsBySkillTag(skillId),
          getQuizzesBySkillTag(skillId),
          getResourcesBySkillTag(skillId)
        ]);
        
        setQuestions(questionsData);
        setQuizzes(quizzesData);
        setResources(resourcesData);
      } catch (error) {
        console.error("Error loading skill data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSkillData();
  }, [skillId, subcategoriesLoading, getSubcategoryNameById, subcategoryStats]);

  // Helper to get skill status
  const getSubcategoryStatus = () => {
    if (!skillStat) return 'unknown';
    
    const { accuracyRate } = skillStat;
    if (accuracyRate < 70) return 'weak';
    if (accuracyRate <= 85) return 'moderate';
    return 'strong';
  };

  // Helper to get status text
  const getStatusText = () => {
    const status = getSubcategoryStatus();
    switch (status) {
      case 'weak':
        return 'Needs Improvement';
      case 'moderate':
        return 'Moderate';
      case 'strong':
        return 'Strong';
      default:
        return 'Not Assessed';
    }
  };

  // Helper to get sample questions (limiting to 3 for display)
  const getSampleQuestions = () => {
    return questions.slice(0, 3);
  };

  if (loading || subcategoriesLoading) {
    return (
      <div className="skill-analysis-container">
        <div className="loading-container">
          <p>Loading skill information...</p>
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="skill-analysis-container">
      <div className="back-navigation">
        <button onClick={() => navigate('/progress')}>
          ← Back to My Progress
        </button>
      </div>

      <header className="skill-header">
        <h1>{skillName}</h1>
        <div className={`skill-status ${getSubcategoryStatus()}`}>
          {getStatusText()}
        </div>
      </header>

      <div className="skill-tabs">
        <button 
          className={activeTab === 'overview' ? 'active' : ''} 
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={activeTab === 'practice' ? 'active' : ''} 
          onClick={() => setActiveTab('practice')}
        >
          Practice
        </button>
        <button 
          className={activeTab === 'resources' ? 'active' : ''} 
          onClick={() => setActiveTab('resources')}
        >
          Resources
        </button>
      </div>

      <div className="skill-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="performance-stats">
              <h2>Your Performance</h2>
              
              {!skillStat ? (
                <div className="no-data-message">
                  <p>You haven't answered any questions in this subcategory area yet.</p>
                  <p>Take a quiz to start tracking your progress.</p>
                </div>
              ) : (
                <div className="stats-grid">
                  <div className="stat-card">
                    <h3>Accuracy</h3>
                    <div className="stat-value">{Math.round(skillStat.accuracyRate)}%</div>
                    <div className="progress-bar">
                      <div 
                        className="progress-bar-fill" 
                        style={{ width: `${skillStat.accuracyRate}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="stat-card">
                    <h3>Questions Attempted</h3>
                    <div className="stat-value">{skillStat.totalAttempts}</div>
                  </div>
                  
                  <div className="stat-card">
                    <h3>Average Time</h3>
                    <div className="stat-value">
                      {Math.round(skillStat.averageTimeSpent)} sec
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="skill-description">
              <h2>About This Skill</h2>
              <p>
                This skill area focuses on {skillName.toLowerCase()} concepts and techniques that 
                appear on the SAT. Mastering this skill can significantly improve your overall score.
              </p>
              <div className="improvement-tips">
                <h3>Tips for Improvement</h3>
                <ul>
                  <li>Practice regularly with targeted exercises</li>
                  <li>Review explanations carefully for any questions you miss</li>
                  <li>Use the provided study resources to strengthen your understanding</li>
                  <li>Focus on understanding the core concepts rather than just memorizing answers</li>
                </ul>
              </div>
            </div>

            {questions.length > 0 && (
              <div className="sample-questions">
                <h2>Sample Questions</h2>
                <div className="question-preview">
                  {getSampleQuestions().map((question, index) => (
                    <div className="question-card" key={question.id}>
                      <h3>Question {index + 1}</h3>
                      <p className="question-text">{question.text}</p>
                      <div className="question-difficulty">
                        Difficulty: {question.difficulty}/3
                      </div>
                    </div>
                  ))}
                </div>
                <div className="view-more">
                  <button 
                    className="secondary-button"
                    onClick={() => setActiveTab('practice')}
                  >
                    Practice These Questions
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'practice' && (
          <div className="practice-tab">
            <h2>Practice Opportunities</h2>
            
            <div className="quiz-section">
              {/* First show the adaptive quiz generator */}
              <div className="adaptive-quiz-section">
                <h3>SmartQuiz Practice</h3>
                <p>
                  Challenge yourself with our smart quiz system that adjusts to your skill level.
                  Start practicing now to improve your skills in this area!
                </p>
                <button 
                  className="start-practice-button"
                  onClick={() => navigate(`/smart-quiz-generator`, {
                    state: { subcategoryId: skillId }
                  })}
                >
                  Start SmartQuiz Practice
                </button>
              </div>
              
              <div className="divider"></div>
              
              {/* Then show pre-made quizzes if available */}
              {quizzes.length > 0 && (
                <div className="premade-quiz-section">
                  <h3>Pre-made Quizzes</h3>
                  <div className="quiz-list">
                    {quizzes.map(quiz => (
                      <div className="quiz-card" key={quiz.id}>
                        <h3>{quiz.title}</h3>
                        <p>{quiz.description}</p>
                        <div className="quiz-details">
                          <span>Questions: {quiz.questionIds?.length || 0}</span>
                          <span>Difficulty: {quiz.difficulty}/3</span>
                          <span>Est. Time: {quiz.estimatedTime} min</span>
                        </div>
                        <div className="quiz-actions">
                          <Link to={`/adaptive-quiz/${quiz.id}`} className="primary-button">
                            Start Quiz
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="create-custom-practice">
              <h3>Custom Practice</h3>
              <p>
                Don't see what you're looking for? Create a custom practice set 
                focusing on specific aspects of this skill.
              </p>
              <button className="secondary-button">
                Create Custom Practice
              </button>
            </div>
          </div>
        )}

        {activeTab === 'resources' && (
          <div className="resources-tab">
            <h2>Study Resources</h2>
            
            {resources.length === 0 ? (
              <div className="no-data-message">
                <p>No specific resources available for this skill yet.</p>
                <p>Check back later as our content library grows.</p>
              </div>
            ) : (
              <div className="resource-list">
                {resources.map(resource => (
                  <div className="resource-card" key={resource.id}>
                    <h3>{resource.title}</h3>
                    <p>{resource.description}</p>
                    <div className="resource-meta">
                      <span className="resource-type">{resource.resourceType}</span>
                      <span className="resource-difficulty">Level: {resource.difficulty}/5</span>
                    </div>
                    <div className="resource-actions">
                      <a 
                        href={resource.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="primary-button"
                      >
                        Open Resource
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="general-resources">
              <h3>General Resources for {skillName}</h3>
              <div className="general-resource-list">
                <div className="general-resource-item">
                  <h4>Khan Academy</h4>
                  <p>Free SAT practice materials and videos</p>
                  <a 
                    href="https://www.khanacademy.org/sat" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    Visit Khan Academy
                  </a>
                </div>
                <div className="general-resource-item">
                  <h4>College Board</h4>
                  <p>Official SAT practice questions and tips</p>
                  <a 
                    href="https://www.collegeboard.org/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    Visit College Board
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SkillAnalysis;
