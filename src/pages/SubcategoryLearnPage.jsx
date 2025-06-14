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
  faChevronUp,
  faCheckCircle,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import { getConceptsBySubcategory } from '../firebase/conceptServices';
import { getLearningContent } from '../firebase/learningContentServices';
import { getDiverseSampleQuestions } from '../firebase/questionServices';
import { getSubcategoryName } from '../utils/subcategoryConstants';
import { toast, ToastContainer } from 'react-toastify';
import '../styles/SubcategoryLearnPage.css';

// Sample placeholder questions for demo
const SAMPLE_PLACEHOLDER_QUESTIONS = [
  {
    id: 'demo-1',
    text: 'The following text is adapted from a 2019 article about urban planning. Which choice best describes the main purpose of the passage?',
    options: [
      'To analyze the economic benefits of green infrastructure in cities',
      'To compare traditional urban planning with modern sustainable approaches',
      'To argue for increased funding for environmental urban projects', 
      'To explain how cities can integrate nature-based solutions into development'
    ],
    correctAnswer: 'To explain how cities can integrate nature-based solutions into development',
    explanation: 'The passage focuses on describing methods and benefits of incorporating natural elements into urban planning, making option D the best summary of the main purpose.',
    difficulty: 2
  },
  {
    id: 'demo-2', 
    text: 'Based on the research mentioned in the passage, what can be concluded about green roofs in urban environments?',
    options: [
      'They are too expensive for most cities to implement effectively',
      'They provide multiple environmental and economic benefits',
      'They work better in smaller cities than in major metropolitan areas',
      'They require more maintenance than traditional roofing systems'
    ],
    correctAnswer: 'They provide multiple environmental and economic benefits',
    explanation: 'The passage cites research showing green roofs reduce energy costs, manage stormwater, and improve air quality, supporting the conclusion about multiple benefits.',
    difficulty: 3
  }
];

// Sample Questions Component
const SampleQuestionsSection = ({ subcategoryId, questions, onPracticeClick }) => {
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  // Use placeholder questions if none provided
  const displayQuestions = questions.length > 0 ? questions : SAMPLE_PLACEHOLDER_QUESTIONS;

  if (displayQuestions.length === 0) {
    return (
      <div className="sample-questions-empty">
        <FontAwesomeIcon icon={faQuestion} />
        <p>Sample questions will be available soon for this subcategory.</p>
      </div>
    );
  }

  const currentQuestion = displayQuestions[selectedQuestionIndex];

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    setShowAnswer(true);
  };

  const resetQuestion = () => {
    setShowAnswer(false);
    setSelectedOption(null);
  };

  const nextQuestion = () => {
    setSelectedQuestionIndex(Math.min(displayQuestions.length - 1, selectedQuestionIndex + 1));
    resetQuestion();
  };

  const prevQuestion = () => {
    setSelectedQuestionIndex(Math.max(0, selectedQuestionIndex - 1));
    resetQuestion();
  };

  return (
    <div className="sample-questions-section">
      <div className="question-navigator">
        <span className="question-counter">
          Question {selectedQuestionIndex + 1} of {displayQuestions.length}
          {questions.length === 0 && <span className="demo-badge">DEMO</span>}
        </span>
        <div className="question-nav-buttons">
          <button onClick={prevQuestion} disabled={selectedQuestionIndex === 0}>
            Previous
          </button>
          <button onClick={nextQuestion} disabled={selectedQuestionIndex === displayQuestions.length - 1}>
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
              className={`option ${selectedOption ? (
                option === currentQuestion.correctAnswer ? 'correct' : 
                option === selectedOption && option !== currentQuestion.correctAnswer ? 'incorrect' : ''
              ) : ''} ${!showAnswer ? 'clickable' : ''}`}
              onClick={() => !showAnswer && handleOptionSelect(option)}
            >
              <span className="option-letter">{String.fromCharCode(65 + index)}</span>
              <span className="option-text">{option}</span>
              {showAnswer && option === currentQuestion.correctAnswer && (
                <FontAwesomeIcon icon={faCheckCircle} className="correct-icon" />
              )}
            </div>
          ))}
        </div>

        <div className="question-actions">
          {!showAnswer ? (
            <p className="instruction-text">Click on an answer choice to see the explanation</p>
          ) : (
            <div className="answer-explanation">
              <p><strong>Correct Answer:</strong> {currentQuestion.correctAnswer}</p>
              {currentQuestion.explanation && (
                <p><strong>Explanation:</strong> {currentQuestion.explanation}</p>
              )}
              <button className="try-again-btn" onClick={resetQuestion}>
                Try Again
              </button>
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

// Concept Card Component
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

// Main Component
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

  const subcategoryName = getSubcategoryName(subcategoryId) || subcategoryId?.replace(/-/g, ' ');

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
      try {
        const conceptsData = await getConceptsBySubcategory(subcategoryId);
        setConcepts(conceptsData);
      } catch (conceptError) {
        console.log('No concepts found, using placeholder');
        setConcepts([]);
      }

      // Load learning content
      try {
        const content = await getLearningContent(subcategoryId);  
        setLearningContent(content);
      } catch (contentError) {
        console.log('No learning content found, using placeholder');
        setLearningContent(getPlaceholderContent(subcategoryName));
      }

      // Load sample questions
      try {
        const questions = await getDiverseSampleQuestions(subcategoryId);
        setSampleQuestions(questions);
      } catch (questionError) {
        console.log('No questions found, will use placeholder');
        setSampleQuestions([]);
      }

    } catch (error) {
      console.error('Error loading learning data:', error);
      setError('Failed to load learning content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Placeholder content generator
  const getPlaceholderContent = (categoryName) => ({
    overview: `
      <h3>Understanding ${categoryName} Questions</h3>
      <p>This comprehensive guide will help you master <strong>${categoryName}</strong> questions on the Digital SAT.</p>
      
      <h4>What You'll Learn</h4>
      <ul>
        <li>How to identify ${categoryName} question patterns</li>
        <li>Step-by-step solving strategies</li>
        <li>Common mistakes and how to avoid them</li>
        <li>Time-saving techniques for test day</li>
      </ul>
      
      <h4>On the Digital SAT</h4>
      <p>These questions typically appear 2-4 times per section and test your ability to analyze, interpret, and apply knowledge effectively. Mastering this question type can significantly boost your overall score.</p>
      
      <div class="highlight-box">
        <strong>💡 Pro Tip:</strong> The digital format allows you to flag questions and return to them, making strategic time management even more important.
      </div>
    `,
    keyStrategies: [
      "Read the question stem carefully before examining the passage or problem - this helps you focus on what's being asked",
      "Look for signal words and phrases that indicate the question type and required approach",
      "Use the process of elimination to narrow down answer choices systematically", 
      "Double-check your work by ensuring your answer directly addresses what the question is asking",
      "Practice time management - spend no more than 60-90 seconds per question in this category"
    ],
    commonMistakes: [
      "Rushing through the question without fully understanding what's being asked",
      "Choosing answers that are factually correct but don't address the specific question",
      "Getting distracted by irrelevant details in passages or complex problem setups",
      "Second-guessing correct answers due to overthinking",
      "Not managing time effectively and spending too long on difficult questions"
    ],
    studyTips: [
      "Practice with official SAT questions daily, focusing on accuracy before speed",
      "Review both correct and incorrect answers to understand the reasoning behind each choice",
      "Create a systematic approach you can apply consistently to all questions of this type",
      "Time yourself regularly to build comfort with the pacing required on test day",
      "Study related question types to build comprehensive understanding of the broader skills being tested",
      "Use active reading strategies like annotation and summarization to improve comprehension"
    ],
    difficulty: 'Varies by specific question',
    estimatedStudyTime: '2-3 hours for initial mastery, ongoing practice recommended'
  });

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
        <FontAwesomeIcon icon={faSpinner} spin className="loading-icon" />
        <div className="loading-text">Loading learning content...</div>
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
                <FontAwesomeIcon icon={faLightbulb} className="empty-icon" />
                <h3>Concepts Coming Soon</h3>
                <p>Detailed concept breakdowns for this subcategory will be available soon. In the meantime, you can practice with sample questions below.</p>
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
                  <h4>🚀 Key Strategies</h4>
                  <ul>
                    {learningContent.keyStrategies?.map((strategy, index) => (
                      <li key={index}>{strategy}</li>
                    ))}
                  </ul>
                </div>

                <div className="strategy-group">
                  <h4>⚠️ Common Mistakes to Avoid</h4>
                  <ul>
                    {learningContent.commonMistakes?.map((mistake, index) => (
                      <li key={index}>{mistake}</li>
                    ))}
                  </ul>
                </div>

                <div className="strategy-group">
                  <h4>💪 Study Tips</h4>
                  <ul>
                    {learningContent.studyTips?.map((tip, index) => (
                      <li key={index}>{tip}</li>
                    ))}
                  </ul>
                </div>

                <div className="study-metadata">
                  <div className="meta-item">
                    <strong>📊 Difficulty Level:</strong> {learningContent.difficulty}
                  </div>
                  <div className="meta-item">
                    <strong>⏱️ Estimated Study Time:</strong> {learningContent.estimatedStudyTime}
                  </div>
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