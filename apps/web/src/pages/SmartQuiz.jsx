// pages/SmartQuiz.jsx
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { normalizeSubcategoryName } from '../utils/subcategoryUtils';
import { processTextMarkup } from '../utils/textProcessing';
import { db } from '../firebase/config';
import { recordSmartQuizResult, DIFFICULTY_FOR_LEVEL } from '../utils/smartQuizUtils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faArrowRight,
  faLightbulb,
  faFileAlt,
  faBook,
  faComment,
  faSave,
  faCheck,
  faFlag,
  faBookmark,
  faBullseye,
  faList,
  faStar,
  faTrophy,
  faBell,
  faChartBar,
  faClipboardList,
  faBookOpen,
  faChevronDown,
  faClock,
  faSignal,
  faWandMagicSparkles,
  faFileLines,
} from '@fortawesome/free-solid-svg-icons';
import SmartQuizAssistant from '../components/SmartQuizAssistant';
import Modal from '../components/Modal';
import ReportQuestionModal from '../components/ReportQuestionModal';
import { askAssistant } from '../api/assistantClient';
import { getHelperData } from '../api/helperClient';
import { checkMultipleBankItems } from '../utils/wordBankUtils';
import { saveBankItem } from '../api/helperClient';
import { reportQuestion } from '../api/reportClient';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/SmartQuiz.css';
import '../styles/SmartQuizAssistant.css';
import '../styles/Modal.css';
import './SmartQuizProBadge.css';
import ProFeatureModal from '../components/ProFeatureModal';

const formatElapsedTime = (seconds = 0) => {
  const safeSeconds = Math.max(0, Number(seconds) || 0);
  const minutes = Math.floor(safeSeconds / 60);
  const remainder = safeSeconds % 60;
  return `${minutes}:${String(remainder).padStart(2, '0')}`;
};

const getDefinitionPreview = (definition = '') => {
  if (!definition) return 'Tap to review this term in context.';
  const [firstClause] = definition.split(/[.;]/);
  return firstClause.length > 90 ? `${firstClause.slice(0, 87)}...` : firstClause;
};

const getQuestionSkill = (question, quiz) => {
  const rawSkill = question?.subcategory || question?.subcategoryId || quiz?.subcategoryId || 'Reading & Writing';
  return String(rawSkill)
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

export default function SmartQuiz() {
  const { quizId } = useParams();
  const { currentUser, userMembership } = useAuth();
  const navigate = useNavigate();

  // Local state
  const [quiz, setQuiz] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [confidenceLevels, setConfidenceLevels] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef(null);
  
  // User input state for grid-in questions
  const [userInput, setUserInput] = useState('');
  
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
  const [, setAssistantError] = useState(null);
  
  // Helper items state (vocabulary or concepts)
  const [helperItems, setHelperItems] = useState([]);
  const [helperType, setHelperType] = useState('vocabulary'); // Default to vocabulary
  const [helperLoading, setHelperLoading] = useState(false);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle] = useState('');
  const [modalContent] = useState('');
  const [isAssistantModalOpen, setIsAssistantModalOpen] = useState(false);
  
  // Vocabulary modal state
  const [isVocabularyModalOpen, setIsVocabularyModalOpen] = useState(false);
  const [selectedVocabularyItem, setSelectedVocabularyItem] = useState(null);
  const [savingVocabularyItem, setSavingVocabularyItem] = useState(false);
  const [savedVocabularyItems, setSavedVocabularyItems] = useState([]);
  const [showMobileVocab, setShowMobileVocab] = useState(false);
  
  // Add state for ProFeatureModal
  const [showProModal, setShowProModal] = useState(false);
  
  // Report modal state
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);

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
  }, [currentUser, quiz, currentQuestion, quizId]);

  // Detect question type based on available options
  const getQuestionType = (question) => {
    if (!question) return 'multiple-choice';
    
    // If questionType is explicitly set, use it
    if (question.questionType) {
      return question.questionType;
    }
    
    // Smart detection: if no options or empty options array, it's user-input
    if (!question.options || !Array.isArray(question.options) || question.options.length === 0) {
      return 'user-input';
    }
    
    return 'multiple-choice';
  };

  const handleSelect = (optionIdx) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        selectedOption: optionIdx,
        isCorrect: optionIdx === currentQuestion.correctAnswer,
        timeSpent: timerRef.current ?? 0,
        confidence: confidenceLevels[currentQuestion.id] ?? 3,
      },
    }));
    // No longer automatically advancing to next question
  };

  const handleUserInput = (value) => {
    setUserInput(value);
    
    // For user input questions, check correctness
    let isCorrect = false;
    
    if (currentQuestion.correctAnswer !== undefined) {
      // Direct comparison with correct answer
      isCorrect = value === currentQuestion.correctAnswer;
      
      // Also check against accepted answers if available
      if (!isCorrect && currentQuestion.acceptedAnswers && Array.isArray(currentQuestion.acceptedAnswers)) {
        isCorrect = currentQuestion.acceptedAnswers.includes(value);
      }
      
      // For number inputs, handle different formats
      if (!isCorrect && (currentQuestion.inputType === 'number' || !currentQuestion.inputType)) {
        const userNum = parseFloat(value);
        const correctNum = parseFloat(currentQuestion.correctAnswer);
        if (!isNaN(userNum) && !isNaN(correctNum)) {
          isCorrect = Math.abs(userNum - correctNum) < 0.0001;
        }
        
        // Check accepted answers as numbers too
        if (!isCorrect && currentQuestion.acceptedAnswers) {
          isCorrect = currentQuestion.acceptedAnswers.some(accepted => {
            const acceptedNum = parseFloat(accepted);
            return !isNaN(acceptedNum) && Math.abs(userNum - acceptedNum) < 0.0001;
          });
        }
      }
    }

    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        selectedOption: value, // Store the user's input as selectedOption for compatibility
        isCorrect: isCorrect,
        timeSpent: timerRef.current ?? 0,
        confidence: confidenceLevels[currentQuestion.id] ?? 3,
      },
    }));
  };

  const handleConfidenceSelect = (level) => {
    if (!currentQuestion) return;

    setConfidenceLevels((prev) => ({
      ...prev,
      [currentQuestion.id]: level,
    }));

    setAnswers((prev) => {
      const existingAnswer = prev[currentQuestion.id];
      if (!existingAnswer) return prev;

      return {
        ...prev,
        [currentQuestion.id]: {
          ...existingAnswer,
          confidence: level,
          timeSpent: timerRef.current ?? 0,
        },
      };
    });
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
      setElapsedSeconds(0);
    }
  };

  // Sync userInput with current question's answer when navigating
  useEffect(() => {
    if (currentQuestion) {
      const questionType = getQuestionType(currentQuestion);
      if (questionType === 'user-input') {
        const existingAnswer = answers[currentQuestion.id];
        setUserInput(existingAnswer?.selectedOption || '');
      } else {
        setUserInput(''); // Clear for multiple choice questions
      }
    }
  }, [currentIdx, currentQuestion, answers]);

  // Simple timer per question
  useEffect(() => {
    const interval = setInterval(() => {
      timerRef.current = (timerRef.current || 0) + 1;
      setElapsedSeconds(timerRef.current);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleFinish = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await recordSmartQuizResult(quizId, answers);
      // Navigate to results page instead of progress page
      navigate(`/smart-quiz-results/${quizId}`, { replace: true });
    } catch (err) {
      console.error(err);
      setSubmitting(false);
    }
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
  }, [quiz, currentQuestion, quizId, aiEnabled, loadHelperItems]);

  if (!quiz) return <p>Loading quiz…</p>;

  const loadedQuestionTotal = quiz.questions?.length || quiz.questionCount || 0;

  // Completed?
  if (currentIdx >= loadedQuestionTotal) {
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

  // Update AI button handlers to gate for free/guest users
  const handleProFeatureClick = () => {
    setShowProModal(true);
  };

  // Report question handler
  const handleReportQuestion = async (reason) => {
    setReportLoading(true);
    try {
      await reportQuestion(currentQuestion.id, quizId, reason);
      toast.success('Question reported successfully. Thank you for your feedback!');
      setIsReportModalOpen(false);
    } catch (error) {
      console.error('Error reporting question:', error);
      toast.error(error.message || 'Failed to report question. Please try again.');
    } finally {
      setReportLoading(false);
    }
  };

  const handleCoachMessage = async (message) => {
    if (isFreeOrGuest) {
      handleProFeatureClick();
      return;
    }

    setIsAssistantModalOpen(true);
    await handleSendMessage(message);
  };

  const handleStudyPlanClick = () => {
    toast.success('Added to your study plan.');
  };

  const questionTotal = loadedQuestionTotal;
  const progressPct = questionTotal > 0 ? ((currentIdx + 1) / questionTotal) * 100 : 0;
  const selectedAnswer = currentQuestion ? answers[currentQuestion.id] : null;
  const selectedConfidence = currentQuestion ? (confidenceLevels[currentQuestion.id] ?? selectedAnswer?.confidence ?? 3) : 3;
  const difficultyLabel = DIFFICULTY_FOR_LEVEL[quiz.level] || currentQuestion?.difficulty || 'medium';
  const skillLabel = getQuestionSkill(currentQuestion, quiz);
  const completedCount = Object.keys(answers).length;
  const weeklyAccuracy = questionTotal > 0 ? Math.round((completedCount / questionTotal) * 100) : 0;

  if (currentQuestion) {
    return (
      <div className="smart-quiz__container">
        <header className="sq-top-nav">
          <button className="sq-brand" onClick={() => navigate('/dashboard')}>
            <span className="sq-brand-mark">U</span>
            <span className="sq-brand-name">UltraSAT <strong>Prep</strong></span>
          </button>

          <nav className="sq-primary-nav" aria-label="Smart quiz navigation">
            <button className="active" onClick={() => navigate('/subject-quizzes')}>
              <FontAwesomeIcon icon={faWandMagicSparkles} />
              Practice
            </button>
            <button onClick={() => navigate('/progress')}>
              <FontAwesomeIcon icon={faClipboardList} />
              Review
            </button>
            <button onClick={() => navigate('/smart-quiz-intro')}>
              <FontAwesomeIcon icon={faBookOpen} />
              Study Plan
            </button>
            <button onClick={() => navigate('/progress')}>
              <FontAwesomeIcon icon={faChartBar} />
              Analytics
            </button>
          </nav>

          <div className="sq-top-actions">
            <button
              className={`sq-ai-mode ${aiEnabled ? 'enabled' : ''}`}
              onClick={() => setAiEnabled((enabled) => !enabled)}
              aria-pressed={aiEnabled}
            >
              <FontAwesomeIcon icon={faWandMagicSparkles} />
              {aiEnabled ? 'AI Mode' : 'Basic Mode'}
            </button>
            <span className="sq-top-divider" />
            <button className="sq-icon-button" title="Notifications">
              <FontAwesomeIcon icon={faBell} />
            </button>
            <button className="sq-user-menu" title="Profile">
              <span>{currentUser?.displayName?.[0] || currentUser?.email?.[0] || 'A'}</span>
              <FontAwesomeIcon icon={faChevronDown} />
            </button>
          </div>
        </header>

        <main className="sq-page">
          <section className="sq-session-bar" aria-label="Quiz progress">
            <button className="sq-skill-select">
              {skillLabel}
              <FontAwesomeIcon icon={faChevronDown} />
            </button>
            <div className="sq-progress-wrap" aria-label={`Question ${currentIdx + 1} of ${questionTotal}`}>
              <div className="sq-progress-track">
                <div className="sq-progress-fill" style={{ width: `${progressPct}%` }} />
              </div>
              <span>{currentIdx + 1} of {questionTotal}</span>
            </div>
            <div className="sq-timer">
              <span>Time Elapsed</span>
              <FontAwesomeIcon icon={faClock} />
              <strong>{formatElapsedTime(elapsedSeconds)}</strong>
            </div>
          </section>

          {aiEnabled && (
            <>
              <div className="mobile-ai-bar">
                <button onClick={isFreeOrGuest ? handleProFeatureClick : () => setIsAssistantModalOpen(true)}>
                  <FontAwesomeIcon icon={faComment} />
                  <span>AI</span>
                </button>
                <button onClick={isFreeOrGuest ? handleProFeatureClick : handleDirectTipRequest} disabled={assistantLoading}>
                  <FontAwesomeIcon icon={faLightbulb} />
                  <span>Hint</span>
                </button>
                <button onClick={isFreeOrGuest ? handleProFeatureClick : handleDirectSummariseText} disabled={assistantLoading}>
                  <FontAwesomeIcon icon={faFileAlt} />
                  <span>Summary</span>
                </button>
                <button onClick={() => setShowMobileVocab(!showMobileVocab)}>
                  <FontAwesomeIcon icon={faBook} />
                  <span>{helperType === 'concept' ? 'Concepts' : 'Words'}</span>
                </button>
              </div>

              {showMobileVocab && (
                <div className="mobile-vocab-dropdown">
                  {helperLoading ? (
                    <p>Loading {helperType === 'concept' ? 'concepts' : 'vocabulary'}...</p>
                  ) : helperItems.length === 0 ? (
                    <p>No {helperType === 'concept' ? 'concepts' : 'vocabulary terms'} found.</p>
                  ) : (
                    <div className="vocabulary-items">
                      {helperItems.map((item, index) => (
                        <button
                          key={index}
                          className="vocabulary-item"
                          onClick={() => handleVocabularyItemClick(item)}
                        >
                          <span>{item.term}</span>
                          {savedVocabularyItems.includes(item.term) && (
                            <FontAwesomeIcon icon={faCheck} />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title={modalTitle}
          >
            <div className="modal-response-content">
              {modalContent}
            </div>
          </Modal>

          <ReportQuestionModal
            isOpen={isReportModalOpen}
            onClose={() => setIsReportModalOpen(false)}
            onReport={handleReportQuestion}
            loading={reportLoading}
          />

          <div className={`sq-workspace ${!aiEnabled ? 'sq-workspace--basic' : ''}`}>
            {aiEnabled && !isMobile && (
              <aside className="sq-vocab-panel">
                <div className="sq-panel-title">
                  <span className="sq-panel-icon blue">
                    <FontAwesomeIcon icon={faBook} />
                  </span>
                  <div>
                    <h2>{helperType === 'concept' ? 'Key Concepts' : 'Key Vocabulary'}</h2>
                    <p>Tap a {helperType === 'concept' ? 'concept' : 'word'} to review meaning and usage.</p>
                  </div>
                  <FontAwesomeIcon className="sq-panel-spark" icon={faWandMagicSparkles} />
                </div>

                <div className="sq-vocab-list">
                  {helperLoading ? (
                    <div className="sq-panel-state">Loading {helperType === 'concept' ? 'concepts' : 'vocabulary'}...</div>
                  ) : helperItems.length === 0 ? (
                    <div className="sq-panel-state">No {helperType === 'concept' ? 'concepts' : 'vocabulary terms'} found.</div>
                  ) : (
                    helperItems.slice(0, 6).map((item, index) => {
                      const isSaved = savedVocabularyItems.includes(item.term);
                      return (
                        <div
                          key={`${item.term}-${index}`}
                          className={`sq-vocab-card ${isSaved ? 'saved' : ''}`}
                          onClick={() => handleVocabularyItemClick(item)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault();
                              handleVocabularyItemClick(item);
                            }
                          }}
                          role="button"
                          tabIndex={0}
                        >
                          <span className="sq-vocab-term">{item.term}</span>
                          <span className="sq-vocab-definition">
                            <strong>{helperType === 'concept' ? 'concept' : 'adj.'}</strong>
                            {getDefinitionPreview(item.definition)}
                          </span>
                          <button
                            className="sq-vocab-save"
                            onClick={(event) => {
                              event.stopPropagation();
                              if (!isSaved) handleSaveVocabularyItem(item);
                            }}
                            onKeyDown={(event) => {
                              if ((event.key === 'Enter' || event.key === ' ') && !isSaved) {
                                event.preventDefault();
                                event.stopPropagation();
                                handleSaveVocabularyItem(item);
                              }
                            }}
                            aria-label={isSaved ? `${item.term} saved` : `Save ${item.term}`}
                          >
                            <FontAwesomeIcon icon={isSaved ? faCheck : faSave} />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>

                {helperItems.length > 6 && (
                  <button className="sq-view-all" onClick={() => setShowMobileVocab(true)}>
                    View all {helperType === 'concept' ? 'concepts' : 'words'}
                    <FontAwesomeIcon icon={faArrowRight} />
                  </button>
                )}
              </aside>
            )}

            <section className="sq-question-card">
              <div className="sq-question-header">
                <div>
                  <h1>Question {currentIdx + 1} of {questionTotal}</h1>
                  <p>Read the following passage carefully and answer the question that follows.</p>
                </div>
                <div className="sq-question-tools">
                  <button
                    className="sq-icon-button"
                    onClick={() => toast.success('Question bookmarked.')}
                    title="Bookmark this question"
                  >
                    <FontAwesomeIcon icon={faBookmark} />
                  </button>
                  <button
                    className="sq-icon-button"
                    onClick={() => setIsReportModalOpen(true)}
                    title="Report this question"
                  >
                    <FontAwesomeIcon icon={faFlag} />
                  </button>
                  <span className={`sq-difficulty ${String(difficultyLabel).toLowerCase()}`}>
                    {difficultyLabel}
                    <FontAwesomeIcon icon={faSignal} />
                  </span>
                </div>
              </div>

              <div className="sq-question-body">
                {currentQuestion.passage && (
                  <div
                    className="question-passage"
                    dangerouslySetInnerHTML={{ __html: processTextMarkup(currentQuestion.passage) }}
                  />
                )}

                {currentQuestion.graphUrl && (
                  <div className="question-graph-container">
                    <img
                      src={currentQuestion.graphUrl}
                      alt="Graph for question"
                      className="question-graph"
                    />
                  </div>
                )}

                <div
                  className="question-text-content"
                  dangerouslySetInnerHTML={{ __html: processTextMarkup(currentQuestion.text) }}
                />
              </div>

              {getQuestionType(currentQuestion) === 'multiple-choice' ? (
                <ul className="options-list">
                  {currentQuestion.options.map((opt, idx) => {
                    const isSelected = selectedAnswer?.selectedOption === idx;
                    return (
                      <li key={idx}>
                        <button
                          onClick={() => handleSelect(idx)}
                          className={`option-button ${isSelected ? 'selected' : ''}`}
                        >
                          <span className="sq-option-letter">{String.fromCharCode(65 + idx)}</span>
                          <span className="sq-option-copy">{opt}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="user-input-container">
                  <div className="question-instructions">
                    {currentQuestion.answerFormat ? currentQuestion.answerFormat : 'Enter your answer in the box below.'}
                  </div>
                  <div className="input-container">
                    <input
                      type="text"
                      value={userInput}
                      onChange={(e) => handleUserInput(e.target.value)}
                      className="user-answer-input"
                      placeholder={currentQuestion.inputType === 'number' || !currentQuestion.inputType ? 'Enter a number' : 'Enter your answer'}
                      pattern={currentQuestion.inputType === 'number' || !currentQuestion.inputType ? '[0-9]*[.]?[0-9]*' : undefined}
                    />
                  </div>
                  {(currentQuestion.inputType === 'number' || !currentQuestion.inputType) && (
                    <div className="input-hint">
                      You may enter integers, decimals, or fractions. Do not enter spaces or commas.
                    </div>
                  )}
                </div>
              )}

              <div className="quiz-navigation">
                <button
                  className="nav-button prev"
                  onClick={() => handleNavigation('prev')}
                  disabled={currentIdx === 0}
                >
                  <FontAwesomeIcon icon={faArrowLeft} />
                  Previous
                </button>

                <div className="sq-confidence">
                  <span>How confident are you?</span>
                  <div className="sq-confidence-scale" aria-label="Confidence">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <button
                        key={level}
                        className={selectedConfidence === level ? 'selected' : ''}
                        onClick={() => handleConfidenceSelect(level)}
                        aria-label={`Confidence ${level}`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                  <div className="sq-confidence-labels">
                    <span>Not at all</span>
                    <span>Extremely</span>
                  </div>
                </div>

                <button
                  className="nav-button next"
                  onClick={() => handleNavigation('next')}
                  disabled={!selectedAnswer}
                >
                  {currentIdx + 1 >= questionTotal ? 'Finish' : 'Next'}
                  <FontAwesomeIcon icon={faArrowRight} />
                </button>
              </div>
            </section>

            {aiEnabled && !isMobile && (
              <aside className="sq-coach-panel">
                <div className="sq-coach-header">
                  <div>
                    <span className="sq-panel-icon sparkle">
                      <FontAwesomeIcon icon={faWandMagicSparkles} />
                    </span>
                    <h2>AI Study Coach</h2>
                  </div>
                  <span className="sq-beta">BETA</span>
                </div>
                <p className="sq-coach-subtitle">Personalized, step-by-step support.</p>

                <div className="sq-focus-card">
                  <FontAwesomeIcon icon={faBullseye} />
                  <div>
                    <span>Focus for you</span>
                    <strong>Main idea & central claim</strong>
                    <small>Based on your recent performance</small>
                  </div>
                </div>

                <div className="sq-coach-actions">
                  <button onClick={isFreeOrGuest ? handleProFeatureClick : handleDirectSummariseText} disabled={assistantLoading}>
                    <span className="sq-action-icon violet"><FontAwesomeIcon icon={faFileLines} /></span>
                    <span>
                      <strong>Main idea in one sentence</strong>
                      <small>See the passage's central claim</small>
                    </span>
                    <FontAwesomeIcon icon={faArrowRight} />
                    {isFreeOrGuest && <span className="sq-pro-badge">PRO</span>}
                  </button>

                  <button
                    onClick={() => handleCoachMessage('Break down this passage line by line and explain how each sentence contributes to the answer.')}
                    disabled={assistantLoading}
                  >
                    <span className="sq-action-icon blue"><FontAwesomeIcon icon={faList} /></span>
                    <span>
                      <strong>Line-by-line explanation</strong>
                      <small>Break down the passage</small>
                    </span>
                    <FontAwesomeIcon icon={faArrowRight} />
                    {isFreeOrGuest && <span className="sq-pro-badge">PRO</span>}
                  </button>

                  <button
                    className="featured"
                    onClick={() => handleCoachMessage('Analyze every answer choice and explain why each option is right or wrong.')}
                    disabled={assistantLoading}
                  >
                    <span className="sq-action-icon amber"><FontAwesomeIcon icon={faStar} /></span>
                    <span>
                      <strong>Choice-by-choice analysis</strong>
                      <small>See why each option is right or wrong</small>
                      <span className="sq-choice-chips">
                        {['A', 'B', 'C', 'D'].map((choice) => <em key={choice}>{choice}</em>)}
                      </span>
                    </span>
                    <FontAwesomeIcon icon={faArrowRight} />
                    <b>Top pick</b>
                    {isFreeOrGuest && <span className="sq-pro-badge">PRO</span>}
                  </button>

                  <button onClick={isFreeOrGuest ? handleProFeatureClick : handleDirectTipRequest} disabled={assistantLoading}>
                    <span className="sq-action-icon gold"><FontAwesomeIcon icon={faLightbulb} /></span>
                    <span>
                      <strong>Hint, not answer</strong>
                      <small>Get a strategic clue without spoilers</small>
                    </span>
                    <FontAwesomeIcon icon={faArrowRight} />
                    {isFreeOrGuest && <span className="sq-pro-badge">PRO</span>}
                  </button>

                  <button
                    onClick={() => handleCoachMessage('Explain why the best answer is stronger than the other answer choices.')}
                    disabled={assistantLoading}
                  >
                    <span className="sq-action-icon green"><FontAwesomeIcon icon={faTrophy} /></span>
                    <span>
                      <strong>Why this answer wins</strong>
                      <small>Understand the strongest choice</small>
                    </span>
                    <FontAwesomeIcon icon={faArrowRight} />
                    {isFreeOrGuest && <span className="sq-pro-badge">PRO</span>}
                  </button>

                  <button onClick={handleStudyPlanClick}>
                    <span className="sq-action-icon pink"><FontAwesomeIcon icon={faBookmark} /></span>
                    <span>
                      <strong>Add to study plan</strong>
                      <small>Save this question type to strengthen your skills</small>
                    </span>
                    <FontAwesomeIcon icon={faArrowRight} />
                  </button>
                </div>

                <div className="sq-weekly-card">
                  <div>
                    <h3>Your progress this week</h3>
                    <FontAwesomeIcon icon={faClock} />
                  </div>
                  <div className="sq-weekly-grid">
                    <span>
                      <small>Questions answered</small>
                      <strong>{completedCount}</strong>
                    </span>
                    <span>
                      <small>Completion</small>
                      <strong>{weeklyAccuracy}%</strong>
                    </span>
                  </div>
                  <div className="sq-sparkline" aria-hidden="true">
                    {[34, 48, 46, 63, 58, 68, 61, 78].map((height, index) => (
                      <i key={index} style={{ height: `${height}%` }} />
                    ))}
                  </div>
                </div>
              </aside>
            )}
          </div>

          <p className="sq-bottom-tip">
            <FontAwesomeIcon icon={faLightbulb} />
            Tip: Main idea questions ask for the overall point. Look for the sentence that best represents the whole paragraph.
          </p>
        </main>

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

        <Modal
          isOpen={isVocabularyModalOpen}
          onClose={() => setIsVocabularyModalOpen(false)}
          title={selectedVocabularyItem ? selectedVocabularyItem.term : 'Vocabulary'}
        >
          <div className="modal-response-content">
            {selectedVocabularyItem && (
              <div className="vocabulary-definition">
                <p>{selectedVocabularyItem.definition}</p>
                <button
                  className="sq-modal-save"
                  onClick={() => handleSaveVocabularyItem(selectedVocabularyItem)}
                  disabled={savingVocabularyItem || savedVocabularyItems.includes(selectedVocabularyItem.term)}
                >
                  <FontAwesomeIcon icon={savedVocabularyItems.includes(selectedVocabularyItem.term) ? faCheck : faSave} />
                  {savedVocabularyItems.includes(selectedVocabularyItem.term)
                    ? (helperType === 'concept' ? 'Saved to My Concepts' : 'Saved to My Words')
                    : (savingVocabularyItem
                        ? 'Saving...'
                        : (helperType === 'concept' ? 'Save to My Concepts' : 'Save to My Words'))}
                </button>
              </div>
            )}
          </div>
        </Modal>

        <ToastContainer position="bottom-right" autoClose={3000} />

        <ProFeatureModal
          isOpen={showProModal}
          onClose={() => setShowProModal(false)}
          position={{ x: window.innerWidth / 2 - 200, y: window.innerHeight / 2 - 150 }}
        />
      </div>
    );
  }

  return null;
}
