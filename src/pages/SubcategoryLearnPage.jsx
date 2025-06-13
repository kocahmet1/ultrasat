import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBook, 
  faArrowLeft, 
  faLightbulb, 
  faQuestion,
  faPlayCircle,
  faBrain,
  faChevronDown,
  faChevronUp
} from '@fortawesome/free-solid-svg-icons';
import { getConceptsBySubcategory } from '../firebase/conceptServices';
import { getLearningContent } from '../firebase/learningContentServices';
import { getDiverseSampleQuestions } from '../firebase/questionServices';
import { getSubcategoryName } from '../utils/subcategoryConstants';
import { toast, ToastContainer } from 'react-toastify';
import '../styles/SubcategoryLearnPage.css';

// Sample questions component
const SampleQuestionsSection = ({ subcategoryId, questions, onPracticeClick }) => {
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  if (!questions || questions.length === 0) {
    return (
      <div className="sample-questions-empty">
        <FontAwesomeIcon icon={faQuestion} />
        <p>Sample questions will be available soon for this subcategory.</p>
      </div>
    );
  }

  const currentQuestion = questions[selectedQuestionIndex];

  return (
    <div className="sample-questions-section">
      <div className="question-navigator">
        <span className="question-counter">
          Question {selectedQuestionIndex + 1} of {questions.length}
        </span>
        <div className="question-nav-buttons">
          <button 
            onClick={() => setSelectedQuestionIndex(Math.max(0, selectedQuestionIndex - 1))}
            disabled={selectedQuestionIndex === 0}
          >
            Previous
          </button>
          <button 
            onClick={() => setSelectedQuestionIndex(Math.min(questions.length - 1, selectedQuestionIndex + 1))}
            disabled={selectedQuestionIndex === questions.length - 1}
          >
            Next
          </button>
        </div>
      </div>

      <div className="question-display">
        <div className="question-text">{currentQuestion.text}</div>
        
        <div className="question-options">
          {currentQuestion.options?.map((option, index) => (
            <div 
              key={index} 
              className={`option ${showAnswer ? (
                option === currentQuestion.correctAnswer ? 'correct' : 
                option !== currentQuestion.correctAnswer ? 'incorrect' : ''
              ) : ''}`}
            >
              <span className="option-letter">{String.fromCharCode(65 + index)}</span>
              <span className="option-text">{option}</span>
            </div>
          ))}
        </div>

        <div className="question-actions">
          <button 
            className="show-answer-btn"
            onClick={() => setShowAnswer(!showAnswer)}
          >
            {showAnswer ? 'Hide Answer' : 'Show Answer'}
          </button>
          {showAnswer && (
            <div className="answer-explanation">
              <p><strong>Correct Answer:</strong> {currentQuestion.correctAnswer}</p>
              {currentQuestion.explanation && (
                <p><strong>Explanation:</strong> {currentQuestion.explanation}</p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="practice-prompt">
        <button className="practice-more-btn" onClick={onPracticeClick}>
          <FontAwesomeIcon icon={faPlayCircle} />
          Practice More Questions Like This
        </button>
      </div>
    </div>
  );
};

// Concept card component
const ConceptCard = ({ concept, onStudyConcept }) => (
  <div className="concept-card">
    <h4 className="concept-name">{concept.name}</h4>
    <div 
      className="concept-explanation" 
      dangerouslySetInnerHTML={{ __html: concept.explanationHTML }}
    />
    <button 
      className="study-concept-btn"
      onClick={() => onStudyConcept(concept.id)}
    >
      <FontAwesomeIcon icon={faBrain} />
      Practice This Concept
    </button>
  </div>
);

// Main component
export default function SubcategoryLearnPage() {
  const { subcategoryId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [concepts, setConcepts] = useState([]);
  const [sampleQuestions, setSampleQuestions] = useState([]);
  const [learningContent, setLearningContent] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    overview: true,
    concepts: true,
    questions: true,
    strategies: false
  });

  const subcategoryName = getSubcategoryName(subcategoryId) || subcategoryId;

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    loadLearningData();
  }, [currentUser, subcategoryId, navigate]);

  const loadLearningData = async () => {
    try {
      setLoading(true);
      
      // Load concepts for this subcategory
      const conceptsData = await getConceptsBySubcategory(subcategoryId);
      setConcepts(conceptsData);

      // Load learning content (you'll populate this with your research)
      const content = await loadLearningContent(subcategoryId);
      setLearningContent(content);

      // Load sample questions (you'll implement this)
      const questions = await loadSampleQuestions(subcategoryId);
      setSampleQuestions(questions);

    } catch (error) {
      console.error('Error loading learning data:', error);
      setError('Failed to load learning content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load learning content from the database
  const loadLearningContent = async (subcategoryId) => {
    try {
      return await getLearningContent(subcategoryId);
    } catch (error) {
      console.error('Error loading learning content:', error);
      throw error;
    }
  };

  // Load sample questions from the database
  const loadSampleQuestions = async (subcategoryId) => {
    try {
      return await getDiverseSampleQuestions(subcategoryId);
    } catch (error) {
      console.error('Error loading sample questions:', error);
      // Return empty array if no questions found
      return [];
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleStudyConcept = (conceptId) => {
    navigate(`/concept/${conceptId}`);
  };

  const handlePracticeQuestions = () => {
    navigate('/smart-quiz-generator', {
      state: {
        subcategoryId: subcategoryId,
        autoDifficultyParams: { accuracyRate: 0, totalAttempted: 0 }
      }
    });
  };

  if (loading) {
    return (
      <div className="subcategory-learn-loading">
        <div className="loading-spinner">Loading learning content...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="subcategory-learn-error">
        <h2>Error Loading Content</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/progress')}>Back to Progress</button>
      </div>
    );
  }

  return (
    <div className="subcategory-learn-container">
      <ToastContainer position="bottom-right" autoClose={3000} />
      
      {/* Header */}
      <div className="learn-header">
        <button className="back-button" onClick={() => navigate('/progress')}>
          <FontAwesomeIcon icon={faArrowLeft} />
          Back to Progress
        </button>
        <div className="learn-title">
          <FontAwesomeIcon icon={faBook} className="learn-icon" />
          <h1>Learn: {subcategoryName}</h1>
        </div>
      </div>

      {/* Overview Section */}
      <div className="learn-section">
        <div 
          className="section-header"
          onClick={() => toggleSection('overview')}
        >
          <h2>📚 Overview & Key Concepts</h2>
          <FontAwesomeIcon 
            icon={expandedSections.overview ? faChevronUp : faChevronDown} 
          />
        </div>
        {expandedSections.overview && (
          <div className="section-content">
            {learningContent?.overview && (
              <div 
                className="overview-content"
                dangerouslySetInnerHTML={{ __html: learningContent.overview }}
              />
            )}
          </div>
        )}
      </div>

      {/* Concepts from Database */}
      <div className="learn-section">
        <div 
          className="section-header"
          onClick={() => toggleSection('concepts')}
        >
          <h2>💡 Master These Concepts ({concepts.length})</h2>
          <FontAwesomeIcon 
            icon={expandedSections.concepts ? faChevronUp : faChevronDown} 
          />
        </div>
        {expandedSections.concepts && (
          <div className="section-content">
            {concepts.length > 0 ? (
              <div className="concepts-grid">
                {concepts.map(concept => (
                  <ConceptCard 
                    key={concept.id}
                    concept={concept}
                    onStudyConcept={handleStudyConcept}
                  />
                ))}
              </div>
            ) : (
              <div className="no-concepts">
                <p>Concepts for this subcategory will be available soon.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sample Questions */}
      <div className="learn-section">
        <div 
          className="section-header"
          onClick={() => toggleSection('questions')}
        >
          <h2>📝 Sample Questions</h2>
          <FontAwesomeIcon 
            icon={expandedSections.questions ? faChevronUp : faChevronDown} 
          />
        </div>
        {expandedSections.questions && (
          <div className="section-content">
            <SampleQuestionsSection 
              subcategoryId={subcategoryId}
              questions={sampleQuestions}
              onPracticeClick={handlePracticeQuestions}
            />
          </div>
        )}
      </div>

      {/* Study Strategies */}
      <div className="learn-section">
        <div 
          className="section-header"
          onClick={() => toggleSection('strategies')}
        >
          <h2>🎯 Study Strategies & Tips</h2>
          <FontAwesomeIcon 
            icon={expandedSections.strategies ? faChevronUp : faChevronDown} 
          />
        </div>
        {expandedSections.strategies && (
          <div className="section-content">
            {learningContent && (
              <div className="strategies-content">
                <div className="strategy-group">
                  <h4>Key Strategies</h4>
                  <ul>
                    {learningContent.keyStrategies?.map((strategy, index) => (
                      <li key={index}>{strategy}</li>
                    ))}
                  </ul>
                </div>

                <div className="strategy-group">
                  <h4>Common Mistakes to Avoid</h4>
                  <ul>
                    {learningContent.commonMistakes?.map((mistake, index) => (
                      <li key={index}>{mistake}</li>
                    ))}
                  </ul>
                </div>

                <div className="strategy-group">
                  <h4>Study Tips</h4>
                  <ul>
                    {learningContent.studyTips?.map((tip, index) => (
                      <li key={index}>{tip}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="learn-actions">
        <button 
          className="primary-action-btn"
          onClick={handlePracticeQuestions}
        >
          <FontAwesomeIcon icon={faPlayCircle} />
          Start Practicing Questions
        </button>
      </div>
    </div>
  );
} 