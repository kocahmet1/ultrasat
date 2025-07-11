import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getSubcategoriesArray } from '../utils/subcategoryConstants';
import AuthPromptModal from './AuthPromptModal';
import '../styles/QuestionBank.css';

const QuestionBank = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const allSubcategories = getSubcategoriesArray();
  
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const readingWritingSubcategories = allSubcategories.filter(sc => sc.section === 'reading');
  const mathSubcategories = allSubcategories.filter(sc => sc.section === 'math');

  const topicCategories = [
    { id: 'reading', name: 'Reading & Writing', subcategories: readingWritingSubcategories },
    { id: 'math', name: 'Math', subcategories: mathSubcategories }
  ];

  const difficulties = [
    { level: 1, name: 'Easy', description: 'Foundation level' },
    { level: 2, name: 'Medium', description: 'Standard level' },
    { level: 3, name: 'Hard', description: 'Advanced level' }
  ];

  const handleCategoryClick = (categoryId) => {
    if (expandedCategory === categoryId) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(categoryId);
    }
  };

  const handleTopicSelect = (category, subcategory) => {
    setSelectedTopic({ category, subcategory });
    setExpandedCategory(null);
    setSelectedDifficulty(null);
  };

  const handleDifficultySelect = (difficulty) => {
    setSelectedDifficulty(difficulty);
    
    if (!currentUser) {
      setShowAuthModal(true);
    } else {
      navigateToQuiz();
    }
  };

  const navigateToQuiz = () => {
    if (selectedTopic && selectedDifficulty) {
      navigate('/smart-quiz-generator', {
        state: {
          subcategoryId: selectedTopic.subcategory.id,
          forceLevel: selectedDifficulty.level,
          fromQuestionBank: true
        }
      });
    }
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    navigateToQuiz();
  };

  const getTopicButtonText = () => {
    if (selectedTopic) {
      return selectedTopic.subcategory.name;
    }
    return 'Choose question topic';
  };

  const getDifficultyButtonText = () => {
    if (selectedDifficulty) {
      return selectedDifficulty.name;
    }
    return 'Choose difficulty level';
  };

  return (
    <section className="question-bank-section">
      <div className="container">
        <div className="section-header-center">
          <h2>Question Bank: Take a mini test <span className="yellow-underline">Now</span></h2>
        </div>
        
        <div className="minitest-creator">
          <div className="creator-left">
            <span className="creator-label">Create a minitest:</span>
          </div>
          
          <div className="creator-controls">
            {/* Topic Dropdown */}
            <div className="dropdown-container">
              <button 
                className={`dropdown-button topic-button ${selectedTopic ? 'selected' : ''}`}
                disabled
              >
                <span>{getTopicButtonText()}</span>
                <span className="dropdown-arrow">▼</span>
              </button>
              
              <div className="dropdown-menu topic-menu always-open">
                {topicCategories.map(category => (
                  <div key={category.id} className="category-group">
                    <button
                      className={`category-header-button ${expandedCategory === category.id ? 'expanded' : ''}`}
                      onClick={() => handleCategoryClick(category.id)}
                    >
                      <span>{category.name}</span>
                      <span className="category-arrow">
                        {expandedCategory === category.id ? '▲' : '▼'}
                      </span>
                    </button>
                    
                    {expandedCategory === category.id && (
                      <div className="subcategory-list expanded">
                        {category.subcategories.map(subcategory => (
                          <button
                            key={subcategory.id}
                            className="subcategory-option"
                            onClick={() => handleTopicSelect(category, subcategory)}
                          >
                            {subcategory.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Difficulty Dropdown */}
            <div className="dropdown-container">
              <button 
                className={`dropdown-button difficulty-button ${selectedDifficulty ? 'selected' : ''}`}
                disabled
              >
                <span>{getDifficultyButtonText()}</span>
                <span className="dropdown-arrow">▼</span>
              </button>
              
              <div className="dropdown-menu difficulty-menu always-open">
                {difficulties.map(difficulty => (
                  <button
                    key={difficulty.level}
                    className={`difficulty-option level-${difficulty.level} ${!selectedTopic ? 'disabled' : ''}`}
                    onClick={() => selectedTopic && handleDifficultySelect(difficulty)}
                    disabled={!selectedTopic}
                  >
                    <div className="difficulty-name">{difficulty.name}</div>
                    <div className="difficulty-desc">{difficulty.description}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="creator-info">
            <div className="info-card">
              <div className="info-icon">📚</div>
              <div className="info-content">
                <div className="info-title">4000+ Free Questions</div>
                <div className="info-desc">Access thousands of practice questions</div>
              </div>
            </div>
            
            <div className="info-card">
              <div className="info-icon">🤖</div>
              <div className="info-content">
                <div className="info-title">AI Assistant</div>
                <div className="info-desc">Get smart hints and explanations</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <AuthPromptModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        featureName="Question Bank"
        featureDescription="Your preferences are saved. Your quiz will start after you log in or sign up."
        savedPreferences={{
          subcategory: selectedTopic?.subcategory,
          difficulty: selectedDifficulty
        }}
        onAuthSuccess={handleAuthSuccess}
      />
    </section>
  );
};

export default QuestionBank; 