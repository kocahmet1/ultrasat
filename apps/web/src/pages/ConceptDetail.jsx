import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiArrowLeft, FiAlertTriangle, FiHelpCircle, FiBookOpen, FiZap, FiLoader } from 'react-icons/fi';
// Feather has no puzzle-piece glyph; kept from FontAwesome for the concept icon only.
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPuzzlePiece } from '@fortawesome/free-solid-svg-icons';
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

  const loadConceptFromBank = useCallback(async () => {
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
  }, [conceptId, currentUser]);

  const loadDetailedExplanation = useCallback(async (conceptData) => {
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
  }, []);

  const loadAssociatedQuestions = useCallback(async (conceptData) => {
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
  }, []);

  const loadConceptData = useCallback(async () => {
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
  }, [loadAssociatedQuestions, loadConceptFromBank, loadDetailedExplanation]);

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
  }, [conceptId, currentUser, loadConceptData, navigate]);

  const handleQuestionClick = (question) => {
    // Navigate to a practice mode or show question details
    toast.info('Question practice coming soon!');
  };

  if (loading) {
    return (
      <div className="concept-detail-container">
        <div className="concept-detail-loading" role="status" aria-label="Loading concept details">
          <div className="ut-skeleton-stack" style={{ width: '100%', maxWidth: 480 }}>
            <div className="ut-skeleton ut-skeleton--title" style={{ width: 220, margin: '0 auto 16px' }} />
            <div className="ut-skeleton ut-skeleton--card" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="concept-detail-container">
        <div className="concept-detail-error">
          <FiAlertTriangle size="2x" />
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate(-1)} className="back-button">
            <FiArrowLeft /> Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!concept) {
    return (
      <div className="concept-detail-container">
        <div className="concept-detail-error">
          <FiHelpCircle size="2x" />
          <h2>Concept Not Found</h2>
          <p>The requested concept could not be found in your collection.</p>
          <button onClick={() => navigate('/concept-bank')} className="back-button">
            <FiArrowLeft /> Back to Concept Bank
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
          <FiArrowLeft /> Back to Concept Bank
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
          <FiBookOpen />
          Quick Definition
        </h2>
        <div className="concept-basic-definition">
          {concept.definition}
        </div>
      </div>

      {/* Detailed Explanation */}
      <div className="concept-section">
        <h2>
          <FiZap />
          Detailed Explanation
        </h2>
        <div className="concept-detailed-explanation">
          {explanationLoading ? (
            <div className="loading-content">
              <FiLoader />
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
          <FiHelpCircle />
          Practice Questions ({associatedQuestions.length})
        </h2>
        <div className="concept-questions">
          {questionsLoading ? (
            <div className="loading-content">
              <FiLoader />
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
