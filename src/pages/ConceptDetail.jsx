import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, 
  faPuzzlePiece, 
  faSpinner, 
  faExclamationTriangle,
  faQuestionCircle,
  faBook,
  faLightbulb
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { getConceptDetailedExplanation, getQuestionsByConceptId } from '../api/conceptClient';
import '../styles/ConceptDetail.css';

const ConceptDetail = () => {
  const { conceptId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [concept, setConcept] = useState(null);
  const [detailedExplanation, setDetailedExplanation] = useState('');
  const [associatedQuestions, setAssociatedQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [explanationLoading, setExplanationLoading] = useState(false);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    if (!conceptId) {
      setError('Concept ID is required');
      setLoading(false);
      return;
    }
    
    loadConceptData();
  }, [currentUser, conceptId, navigate]);

  const loadConceptData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load concept from user's bank
      const conceptData = await loadConceptFromBank();
      if (!conceptData) {
        setError('Concept not found in your bank');
        setLoading(false);
        return;
      }
      
      setConcept(conceptData);
      setLoading(false);
      
      // Load detailed explanation and questions in parallel
      await Promise.all([
        loadDetailedExplanation(conceptData),
        loadAssociatedQuestions(conceptData)
      ]);
      
    } catch (error) {
      console.error('Error loading concept data:', error);
      setError('Failed to load concept details');
      setLoading(false);
      toast.error('Failed to load concept details');
    }
  };

  const loadConceptFromBank = async () => {
    try {
      const { collection, query, where, getDocs } = await import('firebase/firestore');
      const { db } = await import('../firebase/config');
      
      const bankQuery = query(
        collection(db, 'users', currentUser.uid, 'bankItems'),
        where('type', '==', 'concept')
      );
      
      const snapshot = await getDocs(bankQuery);
      if (!snapshot.empty) {
        // Find the concept with matching ID
        const conceptDoc = snapshot.docs.find(doc => doc.id === conceptId);
        if (conceptDoc) {
          return {
            id: conceptDoc.id,
            ...conceptDoc.data()
          };
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error loading concept from bank:', error);
      throw error;
    }
  };

  const loadDetailedExplanation = async (conceptData) => {
    try {
      setExplanationLoading(true);
      
      const explanation = await getConceptDetailedExplanation({
        conceptName: conceptData.term,
        basicDefinition: conceptData.definition,
        subcategory: conceptData.metadata?.subcategory || 'general'
      });
      
      setDetailedExplanation(explanation);
    } catch (error) {
      console.error('Error loading detailed explanation:', error);
      toast.error('Failed to load detailed explanation');
    } finally {
      setExplanationLoading(false);
    }
  };

  const loadAssociatedQuestions = async (conceptData) => {
    try {
      setQuestionsLoading(true);
      
      const questions = await getQuestionsByConceptId({
        conceptName: conceptData.term,
        subcategory: conceptData.metadata?.subcategory || 'general',
        limit: 5
      });
      
      setAssociatedQuestions(questions);
    } catch (error) {
      console.error('Error loading associated questions:', error);
      toast.error('Failed to load practice questions');
    } finally {
      setQuestionsLoading(false);
    }
  };

  const handleQuestionClick = (question) => {
    // Navigate to a practice mode or show question details
    toast.info('Question practice coming soon!');
  };

  if (loading) {
    return (
      <div className="concept-detail-container">
        <div className="concept-detail-loading">
          <FontAwesomeIcon icon={faSpinner} spin size="2x" />
          <p>Loading concept details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="concept-detail-container">
        <div className="concept-detail-error">
          <FontAwesomeIcon icon={faExclamationTriangle} size="2x" />
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate(-1)} className="back-button">
            <FontAwesomeIcon icon={faArrowLeft} /> Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!concept) {
    return (
      <div className="concept-detail-container">
        <div className="concept-detail-error">
          <FontAwesomeIcon icon={faQuestionCircle} size="2x" />
          <h2>Concept Not Found</h2>
          <p>The requested concept could not be found in your collection.</p>
          <button onClick={() => navigate('/concept-bank')} className="back-button">
            <FontAwesomeIcon icon={faArrowLeft} /> Back to Concept Bank
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="concept-detail-container">
      {/* Header */}
      <div className="concept-detail-header">
        <button onClick={() => navigate('/concept-bank')} className="back-button">
          <FontAwesomeIcon icon={faArrowLeft} /> Back to Concept Bank
        </button>
        
        <div className="concept-header-info">
          <h1>
            <FontAwesomeIcon icon={faPuzzlePiece} />
            {concept.term}
          </h1>
          {concept.metadata?.subcategory && (
            <span className="concept-subcategory">
              {concept.metadata.subcategory}
            </span>
          )}
        </div>
      </div>

      {/* Basic Definition */}
      <div className="concept-section">
        <h2>
          <FontAwesomeIcon icon={faBook} />
          Quick Definition
        </h2>
        <div className="concept-basic-definition">
          {concept.definition}
        </div>
      </div>

      {/* Detailed Explanation */}
      <div className="concept-section">
        <h2>
          <FontAwesomeIcon icon={faLightbulb} />
          Detailed Explanation
        </h2>
        <div className="concept-detailed-explanation">
          {explanationLoading ? (
            <div className="loading-content">
              <FontAwesomeIcon icon={faSpinner} spin />
              <span>Generating detailed explanation...</span>
            </div>
          ) : detailedExplanation ? (
            <div 
              className="explanation-content"
              dangerouslySetInnerHTML={{ __html: detailedExplanation }}
            />
          ) : (
            <div className="no-content">
              <p>Detailed explanation not available.</p>
              <button 
                onClick={() => loadDetailedExplanation(concept)}
                className="retry-button"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Associated Questions */}
      <div className="concept-section">
        <h2>
          <FontAwesomeIcon icon={faQuestionCircle} />
          Practice Questions ({associatedQuestions.length})
        </h2>
        <div className="concept-questions">
          {questionsLoading ? (
            <div className="loading-content">
              <FontAwesomeIcon icon={faSpinner} spin />
              <span>Finding related questions...</span>
            </div>
          ) : associatedQuestions.length > 0 ? (
            <div className="questions-list">
              {associatedQuestions.map((question, index) => (
                <div 
                  key={question.id || index} 
                  className="question-card"
                  onClick={() => handleQuestionClick(question)}
                >
                  <div className="question-number">Q{index + 1}</div>
                  <div className="question-content">
                    <p className="question-text">
                      {question.text?.length > 150 
                        ? `${question.text.substring(0, 150)}...` 
                        : question.text}
                    </p>
                    <div className="question-meta">
                      <span className="question-difficulty">
                        Level {question.difficulty || 'Unknown'}
                      </span>
                      {question.subcategory && (
                        <span className="question-subcategory">
                          {question.subcategory}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-content">
              <p>No practice questions found for this concept.</p>
              {!questionsLoading && (
                <button 
                  onClick={() => loadAssociatedQuestions(concept)}
                  className="retry-button"
                >
                  Search Again
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConceptDetail; 