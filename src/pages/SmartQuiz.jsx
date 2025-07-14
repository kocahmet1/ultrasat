// pages/SmartQuiz.jsx
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { normalizeSubcategoryName } from '../utils/subcategoryUtils';
import { processTextMarkup } from '../utils/textProcessing';
import { db } from '../firebase/config';
import { recordSmartQuizResult, QUESTIONS_PER_QUIZ, DIFFICULTY_FOR_LEVEL } from '../utils/smartQuizUtils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight, faLightbulb, faFileAlt, faBook, faToggleOn, faToggleOff, faComment, faSave, faCheck } from '@fortawesome/free-solid-svg-icons';
import SmartQuizAssistant from '../components/SmartQuizAssistant';
import Modal from '../components/Modal';
import { askAssistant, getChatHistory } from '../api/assistantClient';
import { getHelperData } from '../api/helperClient';
import { checkMultipleBankItems } from '../utils/wordBankUtils';
import { saveBankItem } from '../api/helperClient';
import HelperItemsPanel from '../components/HelperItemsPanel';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/SmartQuiz.css';
import '../styles/SmartQuizAssistant.css';
import '../styles/Modal.css';
import './SmartQuizProBadge.css';

export default function SmartQuiz() {
  const { quizId } = useParams();
  const { currentUser, userMembership } = useAuth();
  const navigate = useNavigate();

  // Local state
  const [quiz, setQuiz] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const timerRef = useRef(null);
  
  // AI features toggle state
  const [aiEnabled, setAiEnabled] = useState(true);

  // Track if we are on a mobile viewport to hide desktop-only elements
  const [isMobile, setIsMobile] = useState(false);

  const isFreeOrGuest = !currentUser || !userMembership || userMembership.tier === 'free';

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Assistant state
  const [assistantHistory, setAssistantHistory] = useState([]);
  const [assistantLoading, setAssistantLoading] = useState(false);
  const [assistantExpanded, setAssistantExpanded] = useState(false);
  const [assistantError, setAssistantError] = useState(null);
  
  // Helper items state (vocabulary or concepts)
  const [helperItems, setHelperItems] = useState([]);
  const [helperType, setHelperType] = useState('vocabulary'); // Default to vocabulary
  const [helperLoading, setHelperLoading] = useState(false);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalContent, setModalContent] = useState('');
  const [isAssistantModalOpen, setIsAssistantModalOpen] = useState(false);
  
  // Vocabulary modal state
  const [isVocabularyModalOpen, setIsVocabularyModalOpen] = useState(false);
  const [selectedVocabularyItem, setSelectedVocabularyItem] = useState(null);
  const [savingVocabularyItem, setSavingVocabularyItem] = useState(false);
  const [savedVocabularyItems, setSavedVocabularyItems] = useState([]);
  const [showMobileVocab, setShowMobileVocab] = useState(false);
  
  // Load quiz document
  useEffect(() => {
    const fetchQuiz = async () => {
      if (!currentUser || !quizId) return;
      const ref = doc(db, 'smartQuizzes', quizId);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        navigate('/progress');
        return;
      }
      const data = snap.data();
      if (data.userId !== currentUser.uid) {
        navigate('/progress');
        return;
      }
      
      // Fetch questions separately by IDs
      let questionsData = [];
      if (data.questionIds && data.questionIds.length > 0) {
        // Fetch questions from the questions collection
        const questionPromises = data.questionIds.map(async (questionId) => {
          const questionRef = doc(db, 'questions', questionId);
          const questionSnap = await getDoc(questionRef);
          if (questionSnap.exists()) {
            return { id: questionSnap.id, ...questionSnap.data() };
          }
          return null;
        });
        
        const fetchedQuestions = await Promise.all(questionPromises);
        questionsData = fetchedQuestions.filter(q => q !== null);
      } else if (data.questions) {
        // Fallback for legacy quiz format
        questionsData = data.questions;
      }
      
      setQuiz({ 
        id: snap.id, 
        ...data, 
        questions: questionsData 
      });

      // Mark start time (first load counts as quiz start)
      if (!data.startedAt) await updateDoc(ref, { startedAt: serverTimestamp() });
    };
    fetchQuiz();
  }, [currentUser, quizId, navigate]);

  const currentQuestion = quiz?.questions?.[currentIdx];

  // Load helper items (vocabulary or concepts) based on the current question
  // Memoize function to prevent infinite loops
  const loadHelperItems = useCallback(async () => {
    if (!currentUser || !quiz || !currentQuestion) return;
    
    setHelperLoading(true);
    
    // Default to vocabulary
    let selectedHelperType = 'vocabulary';
    
    try {
      
      // Get the subcategory ID from the question
      const rawSubcategoryId = currentQuestion.subcategory || '';
      console.log(`[SmartQuiz Helper] Raw subcategory ID: "${rawSubcategoryId}"`);
      
      // Make sure we have a subcategoryId to work with
      if (!rawSubcategoryId) {
        console.log('[SmartQuiz Helper] No subcategory ID found in question, defaulting to vocabulary');
        setHelperType('vocabulary');
      } else {
        // Normalize the subcategory ID to ensure consistency
        const normalizedSubcategoryId = normalizeSubcategoryName(rawSubcategoryId);
        console.log(`[SmartQuiz Helper] Normalized subcategory ID: "${normalizedSubcategoryId}"`);
        
        // Try multiple formats for the subcategory ID
        const possibleIds = [
          normalizedSubcategoryId,
          rawSubcategoryId,
          rawSubcategoryId.toLowerCase(),
          rawSubcategoryId.replace(/\s+/g, '-').toLowerCase() // Convert spaces to hyphens
        ];
        
        // Get helper settings from global configuration
        try {
          console.log('[SmartQuiz Helper] Fetching global helper settings');
          const globalSettingsRef = doc(db, 'globalConfig', 'subcategoryHelperSettings');
          const globalDoc = await getDoc(globalSettingsRef);
          
          console.log('[SmartQuiz Helper] Global document exists:', globalDoc.exists());
          if (globalDoc.exists()) {
            const globalData = globalDoc.data();
            console.log('[SmartQuiz Helper] Global data keys:', Object.keys(globalData));
            console.log('[SmartQuiz Helper] Has settings:', !!globalData.settings);
            if (globalData.settings) {
              console.log('[SmartQuiz Helper] Helper settings keys:', Object.keys(globalData.settings));
            }
          }
          
          if (globalDoc.exists() && globalDoc.data().settings) {
            const globalSettings = globalDoc.data().settings;
            console.log('[SmartQuiz Helper] Global settings:', globalSettings);
            console.log('[SmartQuiz Helper] Trying possible IDs:', possibleIds);
            
            // Try each possible ID format
            for (const id of possibleIds) {
              console.log(`[SmartQuiz Helper] Checking ID "${id}": ${globalSettings[id]}`);
              if (globalSettings[id]) {
                selectedHelperType = globalSettings[id];
                console.log(`[SmartQuiz Helper] Found helper type "${selectedHelperType}" for ID "${id}"`);
                break;
              }
            }
          } else {
            console.log('[SmartQuiz Helper] No global settings found');
          }
        } catch (err) {
          console.error('[SmartQuiz Helper] Error loading global settings:', err);
          console.log('[SmartQuiz Helper] Falling back to defaults due to error');
          
          // Smart defaults based on subcategory type
          if (normalizedSubcategoryId.includes('equation') || 
              normalizedSubcategoryId.includes('function') || 
              normalizedSubcategoryId.includes('algebra') ||
              normalizedSubcategoryId.includes('geometry') ||
              normalizedSubcategoryId.includes('trigonometry') ||
              normalizedSubcategoryId.includes('calculus') ||
              normalizedSubcategoryId.includes('statistics') ||
              normalizedSubcategoryId.includes('probability')) {
            selectedHelperType = 'concept';
            console.log(`[SmartQuiz Helper] Auto-detected math subcategory, using concepts`);
          }
        }
      }
      
      // Set the helper type for the UI
      console.log(`[SmartQuiz Helper] Setting helper type to: ${selectedHelperType}`);
      setHelperType(selectedHelperType);
      
      // Get the helper items from the API
      const questionContent = {
        text: currentQuestion.text,
        options: currentQuestion.options
      };
      
      // Log what type we're requesting from the API
      console.log(`[SmartQuiz Helper] Requesting ${selectedHelperType} data for question ${currentQuestion.id}`);
      
      const items = await getHelperData(
        quizId, 
        currentQuestion.id, 
        questionContent, 
        selectedHelperType, // Use the determined helper type
        rawSubcategoryId // Use the original subcategory ID for compatibility
      );
      
      setHelperItems(items);
      
      // Check which vocabulary words are already saved - OPTIMIZED for performance
      if (items.length > 0 && currentUser) {
        console.log(`[SmartQuiz Bank] Checking ${items.length} vocabulary items for saved status`);
        try {
          const wordsToCheck = items.map(item => item.term);
          console.log(`[SmartQuiz Bank] Words to check:`, wordsToCheck);
          
          // Use only the new bank items system for maximum efficiency
          const savedWords = await checkMultipleBankItems(
            currentUser.uid, 
            wordsToCheck, 
            selectedHelperType === 'vocabulary' ? 'word' : 'concept'
          );
          
          console.log(`[SmartQuiz Bank] Found ${savedWords.length} saved words:`, savedWords);
          setSavedVocabularyItems(savedWords);
        } catch (error) {
          console.error('Error checking saved vocabulary items:', error);
          // Continue without saved word indicators if check fails
          setSavedVocabularyItems([]);
        }
      } else {
        console.log(`[SmartQuiz Bank] Skipping bank check - items: ${items.length}, user: ${!!currentUser}`);
      }
    } catch (error) {
      console.error(`Error loading ${selectedHelperType} data:`, error);
      toast.error(`Failed to load ${selectedHelperType === 'vocabulary' ? 'vocabulary' : 'concepts'}. Please try again.`);
    } finally {
      setHelperLoading(false);
    }
  }, [currentUser, quiz, currentQuestion, quizId, normalizeSubcategoryName, db, toast, setHelperItems, setHelperType, setHelperLoading]);

  const handleSelect = (optionIdx) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        selectedOption: optionIdx,
        isCorrect: optionIdx === currentQuestion.correctAnswer,
        timeSpent: timerRef.current ?? 0,
      },
    }));
    // No longer automatically advancing to next question
  };

  const handleNavigation = (direction) => {
    // Only allow next if an answer is selected for current question
    if (direction === 'next' && !answers[currentQuestion?.id]) {
      return;
    }
    
    // Move to previous or next question
    if (direction === 'prev' && currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1);
    } else if (direction === 'next') {
      setCurrentIdx((prev) => prev + 1);
      timerRef.current = 0;
    }
  };

  // Simple timer per question
  useEffect(() => {
    const interval = setInterval(() => {
      timerRef.current = (timerRef.current || 0) + 1;
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleFinish = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const result = await recordSmartQuizResult(quizId, answers);
      // Navigate to results page instead of progress page
      navigate(`/smart-quiz-results/${quizId}`, { replace: true });
    } catch (err) {
      console.error(err);
      setSubmitting(false);
    }
  };
  
  // AI Assistant Toggle Function
  const toggleAssistant = () => {
    setAssistantExpanded(!assistantExpanded);
  };
  
  // Direct AI Request Handlers
  const handleDirectTipRequest = async () => {
    if (assistantLoading || !currentQuestion) return;
    setAssistantLoading(true);
    try {
      // Create the question object with the correct properties
      const questionObj = {
        text: currentQuestion.text,
        options: currentQuestion.options
      };
      
      // Call askAssistant with the correct parameter object format
      const response = await askAssistant({
        quizId: quizId,
        questionId: currentQuestion.id,
        question: questionObj,
        history: assistantHistory,
        tipRequested: true
      });
      
      // The response should now be properly structured
      if (response.message) {
        // Add the assistant response to history
        const updatedHistory = [...assistantHistory, {
          role: 'assistant',
          content: response.message
        }];
        setAssistantHistory(updatedHistory);
        setIsAssistantModalOpen(true);
      }
    } catch (error) {
      console.error('Error getting hint:', error);
      setAssistantError('Failed to get a hint. Please try again.');
    } finally {
      setAssistantLoading(false);
    }
  };
  
  const handleDirectSummariseText = async () => {
    if (assistantLoading || !currentQuestion) return;
    setAssistantLoading(true);
    try {
      // Create the question object with the correct properties
      const questionObj = {
        text: currentQuestion.text,
        options: currentQuestion.options
      };
      
      // Call askAssistant with the correct parameter object format
      const response = await askAssistant({
        quizId: quizId,
        questionId: currentQuestion.id,
        question: questionObj,
        history: assistantHistory,
        summariseRequested: true
      });
      
      // The response should now be properly structured
      if (response.message) {
        // Add the assistant response to history
        const updatedHistory = [...assistantHistory, {
          role: 'assistant',
          content: response.message
        }];
        setAssistantHistory(updatedHistory);
        setIsAssistantModalOpen(true);
      }
    } catch (error) {
      console.error('Error getting summary:', error);
      setAssistantError('Failed to get a summary. Please try again.');
    } finally {
      setAssistantLoading(false);
    }
  };
  
  // Modal AI Assistant Handlers
  const handleSendMessage = async (message) => {
    if (assistantLoading || !currentQuestion) return;
    setAssistantLoading(true);
    try {
      // Create the question object with the correct properties
      const questionObj = {
        text: currentQuestion.text,
        options: currentQuestion.options
      };
      
      // Extract the actual message content from the message object
      const messageContent = typeof message === 'string' ? message : message.content;
      
      // Add the user message to history first
      const updatedHistoryWithUserMessage = [...assistantHistory, {
        role: 'user',
        content: messageContent
      }];
      
      // Call askAssistant with the correct parameter object format
      const response = await askAssistant({
        quizId: quizId,
        questionId: currentQuestion.id,
        question: questionObj,
        history: updatedHistoryWithUserMessage
      });
      
      // The response should now be properly structured
      if (response.message) {
        // Add the assistant response to updated history
        const finalHistory = [...updatedHistoryWithUserMessage, {
          role: 'assistant',
          content: response.message
        }];
        setAssistantHistory(finalHistory);
      }
    } catch (error) {
      console.error('Error sending message to assistant:', error);
      setAssistantError('Failed to communicate with the assistant. Please try again.');
    } finally {
      setAssistantLoading(false);
    }
  };
  
  const handleRequestTip = async () => {
    await handleSendMessage('I need a hint for this question.');
  };
  
  const handleSummariseText = async () => {
    await handleSendMessage('Can you summarize the key points of this question?');
  };
  
  // Handle vocabulary item click
  const handleVocabularyItemClick = (item) => {
    setSelectedVocabularyItem(item);
    setIsVocabularyModalOpen(true);
  };
  
  // Handle saving vocabulary item to word bank
  const handleSaveVocabularyItem = async (item) => {
    if (savingVocabularyItem) return;
    
    console.log(`[SmartQuiz Save] Attempting to save vocabulary item:`, item);
    
    try {
      setSavingVocabularyItem(true);
      
      const saveData = {
        term: item.term,
        definition: item.definition,
        type: helperType === 'vocabulary' ? 'word' : 'concept',
        source: 'quiz',
        metadata: {
          quizId: quizId,
          questionId: currentQuestion?.id,
          subcategory: currentQuestion?.subcategory || ''
        }
      };
      
      console.log(`[SmartQuiz Save] Calling saveBankItem with:`, saveData);
      
      await saveBankItem(
        item.term,
        item.definition,
        helperType === 'vocabulary' ? 'word' : 'concept',
        'quiz',
        {
          quizId: quizId,
          questionId: currentQuestion?.id,
          subcategory: currentQuestion?.subcategory || ''
        }
      );
      
      console.log(`[SmartQuiz Save] Successfully saved item: ${item.term}`);
      
      // Add to local saved items list
      setSavedVocabularyItems(prev => [...prev, item.term]);
      
      // Show success message
      toast.success(`${helperType === 'vocabulary' ? 'Word' : 'Concept'} saved to your bank!`);
      
    } catch (error) {
      console.error('Error saving vocabulary item:', error);
      toast.error(`Failed to save ${helperType === 'vocabulary' ? 'word' : 'concept'}. Please try again.`);
    } finally {
      setSavingVocabularyItem(false);
    }
  };
  
  // Load chat history and vocabulary assistance when question changes
  useEffect(() => {
    const loadQuestionData = async () => {
      if (!quiz || !currentQuestion || !aiEnabled) return;
      
      try {
        // Reset assistant state for new question
        setAssistantHistory([]);
        setAssistantError(null);
        
        // Reset helper items state for new question
        setHelperItems([]);
        setHelperLoading(true);
        setSavedVocabularyItems([]); // Reset saved vocabulary items for new question
        
        // Prepare question object
        const question = {
          id: currentQuestion.id,
          text: currentQuestion.text,
          options: currentQuestion.options,
          correctAnswer: currentQuestion.correctAnswer,
          explanation: currentQuestion.explanation
        };

        console.log(`[SmartQuiz] Priming assistant for Q: ${currentQuestion.id}`);
        // Prime the assistant with the current question (non-blocking)
        // This is optional - if it fails, the quiz still works
        askAssistant({
          quizId: quizId,
          questionId: currentQuestion.id,
          question: {
            text: currentQuestion.text,
            options: currentQuestion.options
          },
          history: [],
          priming: true
        }).then(() => {
          console.log('[SmartQuiz] Assistant priming completed successfully');
        }).catch((error) => {
          // Non-critical error, just log - don't block the quiz
          console.warn('[SmartQuiz] Assistant priming failed (non-critical):', error.message);
        });
        
        // Load helper items based on subcategory settings
        console.log(`[SmartQuiz] Requesting helper data for Q: ${currentQuestion.id} (subcategory: ${currentQuestion.subcategory || 'unknown'})`);
        await loadHelperItems(currentQuestion.subcategory); // Pass the subcategory to loadHelperItems
        
      } catch (error) {
        console.error('Error loading question data:', error);
        setAssistantError('Failed to load question data. Please try again.');
        setHelperLoading(false);
      }
    };
    
    loadQuestionData();
  }, [quiz, currentQuestion, quizId, aiEnabled]);
  // Note: loadHelperItems is now memoized, so we don't need it in the dependency array

  if (!quiz) return <p>Loading quiz…</p>;

  // Completed?
  if (currentIdx >= quiz.questionCount) {
    if (!submitting) {
      handleFinish();
    }
    return (
      <div className="quiz-completion-loading">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <h2>Calculating your results...</h2>
          <p>Please wait while we process your answers</p>
        </div>
      </div>
    );
  }

  return (
    <div className="smart-quiz__container">
      {/* AI Features Toggle Switch - Pill style */}
      <div className="ai-toggle-container" style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        margin: '1rem auto', 
        alignItems: 'center'
      }}>
        <div style={{ 
          display: 'flex',
          position: 'relative',
          backgroundColor: '#f0f4f8', 
          borderRadius: '30px',
          padding: '4px', 
          width: '200px', 
          boxShadow: '0 1px 5px rgba(0,0,0,0.15)' 
        }}>
          <div 
            onClick={() => setAiEnabled(false)}
            style={{ 
              flex: 1,
              textAlign: 'center',
              padding: '6px 8px', 
              borderRadius: '25px',
              cursor: 'pointer',
              fontWeight: '600', 
              fontSize: '0.85rem', 
              color: !aiEnabled ? '#333' : 'rgba(0, 0, 0, 0.6)', 
              backgroundColor: !aiEnabled ? '#d1eaff' : 'transparent', 
              transition: 'all 0.3s ease',
              zIndex: 1
            }}
          >
            Basic Mode
          </div>
          <div 
            onClick={() => setAiEnabled(true)}
            style={{ 
              flex: 1,
              textAlign: 'center',
              padding: '6px 8px', 
              borderRadius: '25px',
              cursor: 'pointer',
              fontWeight: '600', 
              fontSize: '0.85rem', 
              color: aiEnabled ? '#333' : 'rgba(0, 0, 0, 0.6)', 
              backgroundColor: aiEnabled ? '#c9f0e1' : 'transparent', 
              transition: 'all 0.3s ease',
              zIndex: 1
            }}
          >
            AI Mode
          </div>
        </div>
      </div>

      {aiEnabled && (
        <>
          <div className="mobile-ai-bar">
            <button onClick={() => setIsAssistantModalOpen(true)}>
              <FontAwesomeIcon icon={faComment} />
              <span>AI</span>
            </button>
            <button onClick={handleDirectTipRequest} disabled={assistantLoading}>
              <FontAwesomeIcon icon={faLightbulb} />
              <span>Tip</span>
            </button>
            <button onClick={handleDirectSummariseText} disabled={assistantLoading}>
              <FontAwesomeIcon icon={faFileAlt} />
              <span>Summary</span>
            </button>
            <button onClick={() => setShowMobileVocab(!showMobileVocab)}>
              <FontAwesomeIcon icon={faBook} />
              <span>Words</span>
            </button>
          </div>
          {showMobileVocab && (
            <div className="mobile-vocab-dropdown">
              {helperLoading ? (
                <p>Loading vocabulary...</p>
              ) : helperItems.length === 0 ? (
                <p>No vocabulary terms found.</p>
              ) : (
                <div className="vocabulary-items" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {helperItems.map((item, index) => (
                    <div
                      key={index}
                      className="vocabulary-item"
                      onClick={() => handleVocabularyItemClick(item)}
                    >
                      <span>{item.term}</span>
                      {savedVocabularyItems.includes(item.term) && (
                        <FontAwesomeIcon icon={faCheck} style={{ color: '#28a745', fontSize: '12px' }} />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Modal for displaying tip or summary */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={modalTitle}
      >
        <div className="modal-response-content">
          {modalContent}
        </div>
      </Modal>
      
      {/* Main Content Area: Four-column layout with vocabulary on the left */}
      <div className="quiz-main-area" style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-start',
        gap: '20px',
        padding: '0 20px',
        maxWidth: '1400px', // Increased to accommodate four columns
        margin: '20px auto'
      }}>
        
        {/* Left Column: Key Vocabulary (only when AI is enabled and not mobile) */}
        {aiEnabled && !isMobile && (
          <div className="vocabulary-column" style={{
            width: '200px',
            flexShrink: 0,
            backgroundColor: '#f8f9fa',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            marginTop: '60px', // Align with question content
            maxHeight: '500px',
            overflowY: 'auto'
          }}>
            <div className="vocabulary-header" style={{
              marginBottom: '16px',
              paddingBottom: '8px',
              borderBottom: '2px solid #4e73df'
            }}>
              <h3 style={{
                margin: 0,
                fontSize: '16px',
                color: '#4e73df',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <FontAwesomeIcon icon={faBook} />
                {helperType === 'concept' ? 'Key Concepts' : 'Key Vocabulary'}
              </h3>
            </div>
            
            <div className="vocabulary-content">
              {helperLoading ? (
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  minHeight: '60px',
                  fontSize: '14px',
                  color: '#6c757d',
                  fontStyle: 'italic'
                }}>
                  <p>Loading vocabulary...</p>
                </div>
              ) : helperItems.length === 0 ? (
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  minHeight: '60px',
                  fontSize: '14px',
                  color: '#6c757d',
                  fontStyle: 'italic'
                }}>
                  <p>No vocabulary terms found.</p>
                </div>
              ) : (
                <div className="vocabulary-items" style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  {helperItems.map((item, index) => (
                    <div 
                      key={index} 
                      className="vocabulary-item"
                      onClick={() => handleVocabularyItemClick(item)}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: savedVocabularyItems.includes(item.term) ? '#e2f0d9' : '#ffffff',
                        borderRadius: '6px',
                        borderLeft: '3px solid #4e73df',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#495057',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                      onMouseEnter={(e) => {
                        if (!savedVocabularyItems.includes(item.term)) {
                          e.target.style.backgroundColor = '#e9ecef';
                        }
                        e.target.style.transform = 'translateX(2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = savedVocabularyItems.includes(item.term) ? '#e2f0d9' : '#ffffff';
                        e.target.style.transform = 'translateX(0)';
                      }}
                    >
                      <span>{item.term}</span>
                      {savedVocabularyItems.includes(item.term) && (
                        <FontAwesomeIcon icon={faCheck} style={{ color: '#28a745', fontSize: '12px' }} />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Middle Column: Main Question Box */}
        <div className="question-panel" style={{
          flexGrow: 1,
          maxWidth: '700px',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '25px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
        }}>
          <div className="quiz-header">
            <div className="quiz-title">SmartQuiz – Question {currentIdx + 1} / {quiz.questions.length}</div>
            <div className="level-indicator">
              Level: {DIFFICULTY_FOR_LEVEL[quiz.difficulty]} ({quiz.difficulty})
            </div>
          </div>

          {currentQuestion.passage && (
            <div 
              className="question-passage"
              dangerouslySetInnerHTML={{ __html: processTextMarkup(currentQuestion.passage) }}
            />
          )}
          <div 
            className="question-text-content"
            dangerouslySetInnerHTML={{ __html: processTextMarkup(currentQuestion.text) }}
          />

          <ul className="options-list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {currentQuestion.options.map((opt, idx) => {
              const isSelected = answers[currentQuestion.id]?.selectedOption === idx;
              return (
                <li key={idx} style={{ marginBottom: '12px' }}>
                  <button
                    onClick={() => handleSelect(idx)}
                    className={`option-button ${isSelected ? 'selected' : ''}`}
                  >
                    {opt}
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="quiz-navigation">
            <button
              className="nav-button prev"
              onClick={() => handleNavigation('prev')}
              disabled={currentIdx === 0}
            >
              <FontAwesomeIcon icon={faArrowLeft} /> Previous
            </button>
            <button
              className="nav-button next"
              onClick={() => handleNavigation('next')}
              disabled={!answers[currentQuestion?.id]}
            >
              Next <FontAwesomeIcon icon={faArrowRight} />
            </button>
          </div>
        </div>

        {/* Right Column: AI Buttons - hidden on mobile */}
        {aiEnabled && !isMobile && (
          <div className="ai-tools-column" style={{
            width: '150px',
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            marginTop: '60px' // Align with question content
          }}>
            <button 
              className="assistant-action-button assistant-button"
              onClick={() => setIsAssistantModalOpen(true)}
              style={{
                backgroundColor: '#e0f2f7', // Light blue
                color: '#333',
                padding: '15px 10px',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '500',
                fontSize: '0.9rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                position: 'relative'
              }}
            >
              {isFreeOrGuest && (
                <span className="sq-pro-badge">PRO</span>
              )}
              <FontAwesomeIcon icon={faComment} style={{ fontSize: '1.5rem', marginBottom: '8px' }} />
              <span>AI Assistant</span>
            </button>
            
            <button 
              className="assistant-action-button tip-button"
              onClick={handleDirectTipRequest}
              disabled={assistantLoading}
              style={{
                backgroundColor: '#e0f7f7', // Light teal
                color: '#333',
                padding: '15px 10px',
                border: 'none',
                borderRadius: '8px',
                cursor: assistantLoading ? 'not-allowed' : 'pointer',
                fontWeight: '500',
                fontSize: '0.9rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                opacity: assistantLoading ? 0.7 : 1,
                position: 'relative'
              }}
            >
              {isFreeOrGuest && (
                <span className="sq-pro-badge">PRO</span>
              )}
              <FontAwesomeIcon icon={faLightbulb} style={{ fontSize: '1.5rem', marginBottom: '8px' }} />
              <span>Get a Tip</span>
            </button>
            
            <button 
              className="assistant-action-button summarise-button"
              onClick={handleDirectSummariseText}
              disabled={assistantLoading}
              style={{
                backgroundColor: '#f0e6f7', // Light purple
                color: '#333',
                padding: '15px 10px',
                border: 'none',
                borderRadius: '8px',
                cursor: assistantLoading ? 'not-allowed' : 'pointer',
                fontWeight: '500',
                fontSize: '0.9rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                opacity: assistantLoading ? 0.7 : 1,
                position: 'relative'
              }}
            >
              {isFreeOrGuest && (
                <span className="sq-pro-badge">PRO</span>
              )}
              <FontAwesomeIcon icon={faFileAlt} style={{ fontSize: '1.5rem', marginBottom: '8px' }} />
              <span>Summarize</span>
            </button>
          </div>
        )}
      </div> {/* End of quiz-main-area */}
      
      {/* Modal for AI Assistant */}
      <Modal 
        isOpen={isAssistantModalOpen} 
        onClose={() => setIsAssistantModalOpen(false)}
        title="AI Assistant"
      >
        <div className="modal-assistant-container">
          <SmartQuizAssistant
            question={{
              id: currentQuestion?.id,
              text: currentQuestion?.text,
              options: currentQuestion?.options,
              correctAnswer: currentQuestion?.correctAnswer,
              explanation: currentQuestion?.explanation
            }}
            onMessage={handleSendMessage}
            onTip={handleRequestTip}
            onSummarise={handleSummariseText}
            initialHistory={assistantHistory}
            loading={assistantLoading}
            expanded={true}
          />
        </div>
      </Modal>
      
      {/* Modal for Vocabulary Definition */}
      <Modal 
        isOpen={isVocabularyModalOpen} 
        onClose={() => setIsVocabularyModalOpen(false)}
        title={selectedVocabularyItem ? selectedVocabularyItem.term : 'Vocabulary'}
      >
        <div className="modal-response-content">
          {selectedVocabularyItem && (
            <div className="vocabulary-definition">
              <p style={{ fontSize: '16px', lineHeight: '1.6', marginBottom: '16px' }}>
                {selectedVocabularyItem.definition}
              </p>
              <button 
                onClick={() => handleSaveVocabularyItem(selectedVocabularyItem)} 
                disabled={savingVocabularyItem || savedVocabularyItems.includes(selectedVocabularyItem.term)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  backgroundColor: savedVocabularyItems.includes(selectedVocabularyItem.term) ? '#e9ecef' : '#f8f9fa',
                  border: '1px solid #ced4da',
                  borderRadius: '6px',
                  color: savedVocabularyItems.includes(selectedVocabularyItem.term) ? '#6c757d' : '#495057',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: savedVocabularyItems.includes(selectedVocabularyItem.term) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  ...((!savingVocabularyItem && !savedVocabularyItems.includes(selectedVocabularyItem.term)) ? {
                    ':hover': {
                      backgroundColor: '#4e73df',
                      borderColor: '#4e73df',
                      color: '#fff'
                    }
                  } : {})
                }}
                onMouseEnter={(e) => {
                  if (!savingVocabularyItem && !savedVocabularyItems.includes(selectedVocabularyItem.term)) {
                    e.target.style.backgroundColor = '#4e73df';
                    e.target.style.borderColor = '#4e73df';
                    e.target.style.color = '#fff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!savingVocabularyItem && !savedVocabularyItems.includes(selectedVocabularyItem.term)) {
                    e.target.style.backgroundColor = '#f8f9fa';
                    e.target.style.borderColor = '#ced4da';
                    e.target.style.color = '#495057';
                  }
                }}
              >
                <FontAwesomeIcon icon={savedVocabularyItems.includes(selectedVocabularyItem.term) ? faCheck : faSave} />
                {savedVocabularyItems.includes(selectedVocabularyItem.term) 
                  ? 'Saved to My Words' 
                  : (savingVocabularyItem ? 'Saving...' : 'Save to My Words')}
              </button>
            </div>
          )}
        </div>
      </Modal>
      
      {/* Toast container for notifications */}
      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
}
