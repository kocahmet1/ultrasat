import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSubcategories } from '../contexts/SubcategoryContext'; // Correct import (plural)
import { getSubcategoryIdFromString, getKebabCaseFromAnyFormat } from '../utils/subcategoryConstants';
import { getFeatureFlags } from '../firebase/config.featureFlags';
import { 
  collection, 
  getDocs, 
  doc,
  getDoc,
  setDoc,
  addDoc,
  deleteDoc,
  updateDoc,
  serverTimestamp,
  writeBatch,
  query,
  where
} from 'firebase/firestore';
import { db } from '../firebase/config';
import ExamModuleManager from '../components/ExamModuleManager';
import PracticeExamManager from '../components/PracticeExamManager';
import QuestionGeneratorLive from '../components/QuestionGeneratorLive';
import SubcategoryMigrationTool from '../components/admin/SubcategoryMigrationTool';
import SubcategorySettings from '../components/admin/SubcategorySettings';
import { exportQuestionsAsJSON } from '../utils/exportUtils.js'; // Added import
import { checkPlotlyEnvironment } from '../utils/apiClient';

import '../styles/AdminDashboard.css';

function AdminDashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { allSubcategories, loading: subcategoriesLoading } = useSubcategories(); // Correct hook (plural)
  
  
  // State for admin access control
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isGraphGenerationAvailable, setIsGraphGenerationAvailable] = useState(false);
  
  // States for different tabs
  const [activeTab, setActiveTab] = useState('questions');
  
  // States for feature flags management
  const [featureFlags, setFeatureFlags] = useState({});
  const [isSavingFlags, setIsSavingFlags] = useState(false);
  
  // States for question management
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [subcategoryFilter, setSubcategoryFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);
  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
  
  // States for quiz management
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [quizQuestions, setQuizQuestions] = useState([]);
  
  // States for subcategories and skill tags
  const [subcategories, setSubcategories] = useState([]);
  const [skillTags, setSkillTags] = useState([]);
  
  // State for batch import usage context
  const [importUsageContext, setImportUsageContext] = useState('general');

  // State for question export
  const [exportSubcategory, setExportSubcategory] = useState('all'); // This will store the ID (value)
  const [uniqueSubcategories, setUniqueSubcategories] = useState([{ value: 'all', display: 'All Subcategories' }]); // Store objects
  
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [questionsPerPage] = useState(100); // Fixed at 100 per page
  
  
  // Check if user has admin access
  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!currentUser) {
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }
      
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists() && userDoc.data().isAdmin) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Error checking admin access:', error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAdminAccess();
  }, [currentUser]);

  useEffect(() => {
    const checkGraphGenAvailability = async () => {
      try {
        const envCheck = await checkPlotlyEnvironment();
        setIsGraphGenerationAvailable(envCheck.plotlyReady);
      } catch (error) {
        console.error('Error checking graph generation availability:', error);
        setIsGraphGenerationAvailable(false);
      }
    };

    if (isAdmin) {
      checkGraphGenAvailability();
    }
  }, [isAdmin]);
  
  // Load feature flags
  useEffect(() => {
    const loadFeatureFlags = async () => {
      if (!isAdmin) return;
      
      try {
        const flags = await getFeatureFlags();
        setFeatureFlags(flags);
      } catch (error) {
        console.error('Error loading feature flags:', error);
      }
    };
    
    loadFeatureFlags();
  }, [isAdmin]);
  
  // Load subcategories and skill tags
  useEffect(() => {
    const loadSubcategoriesAndSkillTags = async () => {
      try {
        // Load skill tags from database
        const skillTagsSnapshot = await getDocs(collection(db, 'skillTags'));
        const skillTagsList = skillTagsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // If no skill tags found, create default skill tags based on subcategories
        if (skillTagsList.length === 0) {
          // Create skill tags here if needed
          // For now, just use an empty array
          setSkillTags([]);
        } else {
          setSkillTags(skillTagsList);
        }
        
        // Use the comprehensive list from the context
        if (allSubcategories && allSubcategories.length > 0) {
           // Make a defensive copy and sort it
           const sortedSubcategories = [...allSubcategories].sort((a, b) => a.name.localeCompare(b.name));
           setSubcategories(sortedSubcategories);
           console.log('Subcategories loaded:', sortedSubcategories.length);
        } else {
           // Handle case where context might still be loading or empty
           setSubcategories([]);
           console.log('No subcategories available from context');
        }
      } catch (error) {
        console.error('Error setting up subcategories:', error);
      }
    };
    
    if (isAdmin) {
      loadSubcategoriesAndSkillTags();
    }
  }, [isAdmin, allSubcategories]);

  // Derive unique subcategories for export dropdown when questions load/change
  useEffect(() => {
    if (subcategoriesLoading || !allSubcategories || allSubcategories.length === 0 || !questions || questions.length === 0) {
      setUniqueSubcategories([{ value: 'all', display: 'All Subcategories' }]);
      return;
    }

    // Create a map from any known ID (from allSubcategories context) to its display name
    const contextIdToDisplayNameMap = new Map();
    allSubcategories.forEach(sc => {
      if (sc && sc.name) {
        // Assuming sc.id is the canonical ID (kebab-case, numeric, etc.) used in the context
        if (sc.id !== undefined && sc.id !== null) {
          contextIdToDisplayNameMap.set(String(sc.id), sc.name);
        }
        // If subcategory names themselves can be IDs in questions, map them too.
        // However, usually, questions would store an ID (kebab or numeric) rather than the full display name.
        // contextIdToDisplayNameMap.set(sc.name, sc.name); 
      }
    });

    const derivedSubcategoryOptions = new Map(); // Use a map to ensure unique 'value' (IDs)

    questions.forEach(q => {
      if (q && q.subcategoryId !== undefined && q.subcategoryId !== null) {
        const questionSubcatId = String(q.subcategoryId); // The ID stored in the question
        
        if (!derivedSubcategoryOptions.has(questionSubcatId)) {
          // Determine the display name: Try mapping from context, otherwise use the ID itself
          const displayName = contextIdToDisplayNameMap.get(questionSubcatId) || questionSubcatId;
          derivedSubcategoryOptions.set(questionSubcatId, { value: questionSubcatId, display: displayName });
        }
      }
    });

    // Convert map values to an array and sort by display name
    const sortedOptions = Array.from(derivedSubcategoryOptions.values())
      .sort((a, b) => a.display.localeCompare(b.display));

    setUniqueSubcategories([{ value: 'all', display: 'All Subcategories' }, ...sortedOptions]);

  }, [questions, allSubcategories, subcategoriesLoading]);

  // Load questions from database
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const questionsSnapshot = await getDocs(collection(db, 'questions'));
        const questionsList = questionsSnapshot.docs.map(doc => {
          const questionData = doc.data();
          
          // Process the question and ensure it has a normalized subcategoryId
          let processedQuestion = {
            id: doc.id,
            ...questionData
          };
          
          // Ensure the question has a normalized subcategoryId
          if (questionData.subCategory) {
            const subcategoryId = normalizeSubcategoryId(questionData.subCategory);
            processedQuestion.subcategoryId = subcategoryId;
          }
          
          // If createdAt is a Firestore timestamp, convert to JS Date
          if (questionData.createdAt && typeof questionData.createdAt.toDate === 'function') {
            processedQuestion.createdAt = questionData.createdAt.toDate();
          }
          
          return processedQuestion;
        });
        
        // Sort questions by creation date (newest first)
        questionsList.sort((a, b) => {
          // If createdAt doesn't exist for either question, use the ID as fallback
          if (!a.createdAt && !b.createdAt) return 0;
          if (!a.createdAt) return 1; // a is older (no date)
          if (!b.createdAt) return -1; // b is older (no date)
          return b.createdAt - a.createdAt; // Sort by date, newest first
        });
        
        setQuestions(questionsList);
        setFilteredQuestions(questionsList);
      } catch (error) {
        console.error('Error loading questions:', error);
      }
    };
    
    if (isAdmin) {
      loadQuestions();
    }
  }, [isAdmin]);
  
  // Load quizzes from database
  useEffect(() => {
    const loadQuizzes = async () => {
      try {
        const quizzesSnapshot = await getDocs(collection(db, 'targetedQuizzes'));
        const quizzesList = quizzesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setQuizzes(quizzesList);
      } catch (error) {
        console.error('Error loading quizzes:', error);
      }
    };
    
    if (isAdmin) {
      loadQuizzes();
    }
  }, [isAdmin]);
  
  // Filter questions based on search term and filters
  useEffect(() => {
    let filtered = [...questions];
    
    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(q => 
        q.text.toLowerCase().includes(search) || 
        (q.id && q.id.toLowerCase().includes(search))
      );
    }
    
    // Apply subcategory filter
    if (subcategoryFilter !== 'all') {
      filtered = filtered.filter(q => {
        // Check if the question's subcategoryId matches the filter
        if (q.subcategoryId && q.subcategoryId === subcategoryFilter) {
          return true;
        }
        
        // If no subcategoryId, check if the normalized subCategory matches
        if (q.subCategory) {
          const normalizedSubcategoryId = normalizeSubcategoryId(q.subCategory);
          return normalizedSubcategoryId === subcategoryFilter;
        }
        
        return false;
      });
    }
    
    // Apply difficulty filter
    if (difficultyFilter !== 'all') {
      filtered = filtered.filter(q => 
        q.difficulty === difficultyFilter
      );
    }
    
    setFilteredQuestions(filtered);
  }, [questions, searchTerm, subcategoryFilter, difficultyFilter]);
  
  // Handle loading quiz details
  const handleSelectQuiz = async (quizId) => {
    try {
      const quizRef = doc(db, 'targetedQuizzes', quizId);
      const quizDoc = await getDoc(quizRef);
      
      if (quizDoc.exists()) {
        const quizData = { id: quizDoc.id, ...quizDoc.data() };
        setSelectedQuiz(quizData);
        
        // Load quiz questions
        if (quizData.questionIds && quizData.questionIds.length > 0) {
          const quizQuestionsData = [];
          
          for (const qId of quizData.questionIds) {
            const questionRef = doc(db, 'questions', qId);
            const questionDoc = await getDoc(questionRef);
            
            if (questionDoc.exists()) {
              quizQuestionsData.push({
                id: questionDoc.id,
                ...questionDoc.data()
              });
            }
          }
          
          setQuizQuestions(quizQuestionsData);
        } else {
          setQuizQuestions([]);
        }
      }
    } catch (error) {
      console.error('Error loading quiz details:', error);
    }
  };
  
  // Handle creating a new quiz
  const handleCreateQuiz = async () => {
    const quizTitle = prompt('Enter a title for the new quiz:');
    if (!quizTitle) return;
    
    try {
      const newQuiz = {
        title: quizTitle,
        description: 'A targeted quiz for skill practice',
        subcategories: [],
        questionIds: [],
        difficulty: 3,
        estimatedTime: 10,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const quizRef = await addDoc(collection(db, 'targetedQuizzes'), newQuiz);
      
      // Add the new quiz to the list and select it
      const quizWithId = { id: quizRef.id, ...newQuiz };
      setQuizzes([...quizzes, quizWithId]);
      setSelectedQuiz(quizWithId);
      setQuizQuestions([]);
      
      alert(`Quiz "${quizTitle}" created successfully!`);
    } catch (error) {
      console.error('Error creating quiz:', error);
      alert('Failed to create quiz. Please try again.');
    }
  };
  
  // Handle saving quiz changes
  const handleSaveQuiz = async () => {
    if (!selectedQuiz) return;
    
    try {
      // Update quiz data
      const updatedQuiz = {
        ...selectedQuiz,
        questionIds: quizQuestions.map(q => q.id),
        updatedAt: new Date()
      };
      
      // If skill tags weren't set, derive them from questions
      // Instead of tracking skillTags, aggregate subcategories for the quiz
      const allSubcategories = new Set();
      quizQuestions.forEach(q => {
        if (q.subcategoryId) {
          allSubcategories.add(q.subcategoryId);
        } else if (q.subCategory) {
          const subcategoryId = normalizeSubcategoryId(q.subCategory);
          allSubcategories.add(subcategoryId);
        }
      });
      updatedQuiz.subcategories = Array.from(allSubcategories);
      
      // Calculate estimated time based on number of questions
      updatedQuiz.estimatedTime = Math.max(5, Math.ceil(quizQuestions.length * 2.5));
      
      // Calculate average difficulty
      const avgDifficulty = quizQuestions.reduce((sum, q) => sum + (q.difficulty || 3), 0) / 
                           (quizQuestions.length || 1);
      updatedQuiz.difficulty = Math.round(avgDifficulty);
      
      await setDoc(doc(db, 'targetedQuizzes', selectedQuiz.id), updatedQuiz);
      
      // Update quizzes list
      setQuizzes(quizzes.map(q => q.id === selectedQuiz.id ? updatedQuiz : q));
      setSelectedQuiz(updatedQuiz);
      
      alert('Quiz saved successfully!');
    } catch (error) {
      console.error('Error saving quiz:', error);
      alert('Failed to save quiz. Please try again.');
    }
  };
  
  // Handle adding a question to the quiz
  const handleAddQuestionToQuiz = (question) => {
    // Check if question is already in the quiz
    if (quizQuestions.some(q => q.id === question.id)) {
      alert('This question is already in the quiz.');
      return;
    }
    
    setQuizQuestions([...quizQuestions, question]);
  };
  
  // Handle removing a question from the quiz
  const handleRemoveQuestionFromQuiz = (questionId) => {
    setQuizQuestions(quizQuestions.filter(q => q.id !== questionId));
  };
  
  // Handle question reordering in quiz
  const handleMoveQuestion = (index, direction) => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === quizQuestions.length - 1)
    ) {
      return;
    }
    
    const newQuestions = [...quizQuestions];
    const question = newQuestions[index];
    
    if (direction === 'up') {
      newQuestions[index] = newQuestions[index - 1];
      newQuestions[index - 1] = question;
    } else {
      newQuestions[index] = newQuestions[index + 1];
      newQuestions[index + 1] = question;
    }
    
    setQuizQuestions(newQuestions);
  };
  
  // Handle creating a new question
  const handleCreateQuestion = () => {
    navigate('/admin/question-editor');
  };
  
  // Handle editing a question
  const handleEditQuestion = (questionId) => {
    navigate(`/admin/question-editor/${questionId}`);
  };

  // Handle deleting a quiz
  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
      return;
    }
    
    try {
      // Delete the quiz from Firestore
      await deleteDoc(doc(db, 'targetedQuizzes', quizId));
      
      // Update quizzes list
      setQuizzes(quizzes.filter(quiz => quiz.id !== quizId));
      
      // If this was the selected quiz, clear the selection
      if (selectedQuiz && selectedQuiz.id === quizId) {
        setSelectedQuiz(null);
        setQuizQuestions([]);
      }
      
      alert('Quiz deleted successfully!');
    } catch (error) {
      console.error('Error deleting quiz:', error);
      alert('Failed to delete quiz. Please try again.');
    }
  };
  
  // Handle deleting a question
  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
      return;
    }
    
    try {
      await deleteDoc(doc(db, 'questions', questionId));
      
      // Remove from questions list and filtered list
      setQuestions(questions.filter(q => q.id !== questionId));
      setFilteredQuestions(filteredQuestions.filter(q => q.id !== questionId));
      // Also remove from selected questions if it was selected
      setSelectedQuestionIds(prev => prev.filter(id => id !== questionId));
      
      // Remove from quiz if it exists there
      if (selectedQuiz && selectedQuiz.questionIds && selectedQuiz.questionIds.includes(questionId)) {
        const updatedQuiz = {
          ...selectedQuiz,
          questionIds: selectedQuiz.questionIds.filter(id => id !== questionId)
        };
        setSelectedQuiz(updatedQuiz);
        setQuizQuestions(quizQuestions.filter(q => q.id !== questionId));
        await setDoc(doc(db, 'targetedQuizzes', selectedQuiz.id), updatedQuiz);
      }
      
      alert('Question deleted successfully!');
    } catch (error) {
      console.error('Error deleting question:', error);
      alert('Failed to delete question. Please try again.');
    }
  };
  
  // Handle mass selection and deletion
  const handleToggleSelectQuestion = (questionId) => {
    setSelectedQuestionIds(prev => {
      if (prev.includes(questionId)) {
        return prev.filter(id => id !== questionId);
      } else {
        return [...prev, questionId];
      }
    });
  };
  
  const handleSelectAll = () => {
    // Calculate current page questions
    const startIndex = (currentPage - 1) * questionsPerPage;
    const endIndex = startIndex + questionsPerPage;
    const currentPageQuestions = filteredQuestions.slice(startIndex, endIndex);
    const currentPageQuestionIds = currentPageQuestions.map(q => q.id);
    
    // Check if all current page questions are selected
    const allCurrentPageSelected = currentPageQuestionIds.every(id => selectedQuestionIds.includes(id));
    
    if (allCurrentPageSelected) {
      // If all current page questions are selected, deselect them
      setSelectedQuestionIds(prev => prev.filter(id => !currentPageQuestionIds.includes(id)));
    } else {
      // Otherwise, select all current page questions (while keeping other pages' selections)
      setSelectedQuestionIds(prev => {
        const newSelection = [...prev];
        currentPageQuestionIds.forEach(id => {
          if (!newSelection.includes(id)) {
            newSelection.push(id);
          }
        });
        return newSelection;
      });
    }
  };

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, subcategoryFilter, difficultyFilter]);

  // Calculate pagination values
  const totalPages = Math.max(1, Math.ceil(filteredQuestions.length / questionsPerPage));
  const startIndex = (currentPage - 1) * questionsPerPage;
  const endIndex = startIndex + questionsPerPage;
  const currentPageQuestions = filteredQuestions.slice(startIndex, endIndex);
  const currentPageQuestionIds = currentPageQuestions.map(q => q.id);
  
  // Check if all current page questions are selected (for checkbox state)
  const allCurrentPageSelected = currentPageQuestionIds.length > 0 && 
    currentPageQuestionIds.every(id => selectedQuestionIds.includes(id));

  // Pagination handlers
  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const handleDeleteSelected = async () => {
    if (selectedQuestionIds.length === 0) {
      alert('No questions selected.');
      return;
    }
    
    setIsConfirmDeleteModalOpen(true);
  };
  
  const handleConvertSelectedToGeneral = async () => {
    if (selectedQuestionIds.length === 0) {
      alert('No questions selected.');
      return;
    }
    
    // Get the selected questions to show context info
    const selectedQuestions = questions.filter(q => selectedQuestionIds.includes(q.id));
    const examQuestions = selectedQuestions.filter(q => q.usageContext === 'exam');
    const generalQuestions = selectedQuestions.filter(q => q.usageContext === 'general' || !q.usageContext);
    
    let confirmMessage = `You have selected ${selectedQuestionIds.length} questions:\n`;
    if (examQuestions.length > 0) {
      confirmMessage += `• ${examQuestions.length} questions with "exam" context (will be converted to "general")\n`;
    }
    if (generalQuestions.length > 0) {
      confirmMessage += `• ${generalQuestions.length} questions already have "general" context (no change needed)\n`;
    }
    
    if (examQuestions.length === 0) {
      alert('None of the selected questions have "exam" context. No conversion needed.');
      return;
    }
    
    confirmMessage += `\nDo you want to convert the ${examQuestions.length} "exam" questions to "general" context?`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }
    
    try {
      setIsLoading(true);
      let successCount = 0;
      let errorCount = 0;
      
      // Only update questions that actually have 'exam' context
      for (const question of examQuestions) {
        try {
          const questionRef = doc(db, 'questions', question.id);
          await updateDoc(questionRef, {
            usageContext: 'general',
            updatedAt: serverTimestamp()
          });
          successCount++;
        } catch (error) {
          console.error(`Error updating question ${question.id}:`, error);
          errorCount++;
        }
      }
      
      // Show results
      let message = `Conversion completed!\n`;
      message += `Successfully converted: ${successCount} questions\n`;
      if (errorCount > 0) {
        message += `Failed to convert: ${errorCount} questions\n`;
      }
      if (generalQuestions.length > 0) {
        message += `Skipped: ${generalQuestions.length} questions (already "general")`;
      }
      
      alert(message);
      
      // Clear selection and reload questions
      setSelectedQuestionIds([]);
      
      // Reload questions to reflect changes
      const questionsSnapshot = await getDocs(collection(db, 'questions'));
      const questionsList = questionsSnapshot.docs.map(doc => {
        const questionData = doc.data();
        
        let processedQuestion = {
          id: doc.id,
          ...questionData
        };
        
        if (questionData.subCategory) {
          const subcategoryId = normalizeSubcategoryId(questionData.subCategory);
          processedQuestion.subcategoryId = subcategoryId;
        }
        
        if (questionData.createdAt && typeof questionData.createdAt.toDate === 'function') {
          processedQuestion.createdAt = questionData.createdAt.toDate();
        }
        
        return processedQuestion;
      });
      
      questionsList.sort((a, b) => {
        if (!a.createdAt && !b.createdAt) return 0;
        if (!a.createdAt) return 1;
        if (!b.createdAt) return -1;
        return b.createdAt - a.createdAt;
      });
      
      setQuestions(questionsList);
      setFilteredQuestions(questionsList);
      
    } catch (error) {
      console.error('Error converting question contexts:', error);
      alert('Failed to convert questions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const confirmDeleteSelected = async () => {
    try {
      setIsLoading(true);
      
      console.log('Starting mass delete operation...');
      console.log('Current user:', currentUser?.uid);
      console.log('Is admin:', isAdmin);
      
      // Test admin access by trying to read the user document first
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);
        console.log('User document exists:', userDoc.exists());
        console.log('User is admin:', userDoc.exists() && userDoc.data()?.isAdmin);
        
        if (!userDoc.exists() || !userDoc.data()?.isAdmin) {
          throw new Error('Admin verification failed - user document indicates insufficient permissions');
        }
      } catch (adminCheckError) {
        console.error('Admin check failed:', adminCheckError);
        throw new Error('Unable to verify admin status. Please refresh the page and try again.');
      }
      
      // Try deleting just the first question as a test
      if (selectedQuestionIds.length > 0) {
        const testQuestionId = selectedQuestionIds[0];
        console.log(`Testing delete permission with question: ${testQuestionId}`);
        
        try {
          // Try to delete the first question as a test
          await deleteDoc(doc(db, 'questions', testQuestionId));
          console.log('Test deletion successful, proceeding with remaining questions...');
          
          // Remove the test question from the list since it's already deleted
          const remainingIds = selectedQuestionIds.slice(1);
          
          // Update UI immediately for the test question
          setQuestions(questions.filter(q => q.id !== testQuestionId));
          setFilteredQuestions(filteredQuestions.filter(q => q.id !== testQuestionId));
          
          let deletedCount = 1; // We already deleted one
          let failedCount = 0;
          const failedIds = [];
          
          // Continue with the remaining questions
          for (const questionId of remainingIds) {
            try {
              await deleteDoc(doc(db, 'questions', questionId));
              deletedCount++;
              console.log(`Successfully deleted question ${questionId} (${deletedCount}/${selectedQuestionIds.length})`);
              
              // Update UI immediately for each successful deletion
              setQuestions(prev => prev.filter(q => q.id !== questionId));
              setFilteredQuestions(prev => prev.filter(q => q.id !== questionId));
              
              // Small delay to be gentle on Firebase
              await new Promise(resolve => setTimeout(resolve, 100));
            } catch (error) {
              console.error(`Failed to delete question ${questionId}:`, error);
              failedIds.push(questionId);
              failedCount++;
            }
          }
          
          // Now handle the reference updates
          console.log('Checking for question references in other collections...');
          
          // Check exam modules
          try {
            const modulesSnapshot = await getDocs(collection(db, 'examModules'));
            const examModules = modulesSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            
            const modulesToUpdate = [];
            for (const module of examModules) {
              if (module.questionIds && Array.isArray(module.questionIds)) {
                const originalLength = module.questionIds.length;
                const filteredIds = module.questionIds.filter(id => !selectedQuestionIds.includes(id));
                
                if (filteredIds.length !== originalLength) {
                  modulesToUpdate.push({
                    id: module.id,
                    questionIds: filteredIds
                  });
                }
              }
            }
            
            // Update modules
            for (const module of modulesToUpdate) {
              try {
                await updateDoc(doc(db, 'examModules', module.id), {
                  questionIds: module.questionIds,
                  updatedAt: serverTimestamp()
                });
              } catch (error) {
                console.error(`Failed to update exam module ${module.id}:`, error);
              }
            }
          } catch (error) {
            console.error('Error updating exam modules:', error);
          }
          
          // Check practice exams
          try {
            const examsSnapshot = await getDocs(collection(db, 'practiceExams'));
            const practiceExams = examsSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            
            const examsToUpdate = [];
            for (const exam of practiceExams) {
              if (exam.questionIds && Array.isArray(exam.questionIds)) {
                const originalLength = exam.questionIds.length;
                const filteredIds = exam.questionIds.filter(id => !selectedQuestionIds.includes(id));
                
                if (filteredIds.length !== originalLength) {
                  examsToUpdate.push({
                    id: exam.id,
                    questionIds: filteredIds
                  });
                }
              }
            }
            
            // Update exams
            for (const exam of examsToUpdate) {
              try {
                await updateDoc(doc(db, 'practiceExams', exam.id), {
                  questionIds: exam.questionIds,
                  updatedAt: serverTimestamp()
                });
              } catch (error) {
                console.error(`Failed to update practice exam ${exam.id}:`, error);
              }
            }
          } catch (error) {
            console.error('Error updating practice exams:', error);
          }
          
          // Check targeted quizzes
          try {
            const quizzesSnapshot = await getDocs(collection(db, 'targetedQuizzes'));
            const quizzesToUpdate = [];
            
            for (const quizDoc of quizzesSnapshot.docs) {
              const quiz = { id: quizDoc.id, ...quizDoc.data() };
              if (quiz.questionIds && Array.isArray(quiz.questionIds)) {
                const originalLength = quiz.questionIds.length;
                const filteredIds = quiz.questionIds.filter(id => !selectedQuestionIds.includes(id));
                
                if (filteredIds.length !== originalLength) {
                  quizzesToUpdate.push({
                    id: quiz.id,
                    questionIds: filteredIds
                  });
                }
              }
            }
            
            // Update quizzes
            for (const quiz of quizzesToUpdate) {
              try {
                await updateDoc(doc(db, 'targetedQuizzes', quiz.id), {
                  questionIds: quiz.questionIds,
                  updatedAt: new Date()
                });
              } catch (error) {
                console.error(`Failed to update targeted quiz ${quiz.id}:`, error);
              }
            }
          } catch (error) {
            console.error('Error updating targeted quizzes:', error);
          }
          
          // Clear selection and close modal
          setSelectedQuestionIds([]);
          setIsConfirmDeleteModalOpen(false);
          setIsLoading(false);
          
          // Show summary
          let summary = `Successfully deleted ${deletedCount} question(s).`;
          if (failedCount > 0) {
            summary += `\nFailed to delete ${failedCount} question(s).`;
          }
          
          alert(summary);
          
        } catch (testError) {
          console.error('Test deletion failed:', testError);
          throw new Error(`Permission denied: ${testError.message}`);
        }
      } else {
        throw new Error('No questions selected for deletion');
      }
      
    } catch (error) {
      console.error('Error during mass delete operation:', error);
      
      // Provide more specific error messages based on the actual error
      let errorMessage = 'An error occurred while deleting questions.';
      if (error.message.includes('Permission denied') || error.code === 'permission-denied') {
        errorMessage = 'Permission denied. This might be a Firebase security rules issue. Please contact support.';
      } else if (error.message.includes('Admin verification failed')) {
        errorMessage = 'Admin verification failed. Please refresh the page and try again.';
      } else if (error.code === 'unavailable') {
        errorMessage = 'Firebase service temporarily unavailable. Please try again in a moment.';
      } else if (error.message.includes('network')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message.includes('quota')) {
        errorMessage = 'Firebase quota exceeded. Please try again later.';
      }
      
      alert(errorMessage);
      setIsConfirmDeleteModalOpen(false);
      setIsLoading(false);
    }
  };
  
  const cancelDeleteSelected = () => {
    setIsConfirmDeleteModalOpen(false);
  };
  
  // Handle repairing practice exam data
  const handleRepairPracticeExamData = async () => {
    try {
      setIsLoading(true);
      
      // First check for existing modules and exams
      console.log('Checking for existing practice exam data...');
      const modulesSnapshot = await getDocs(collection(db, 'examModules'));
      const examsSnapshot = await getDocs(collection(db, 'practiceExams'));
      
      const modulesCount = modulesSnapshot.docs.length;
      const examsCount = examsSnapshot.docs.length;
      
      console.log(`Found ${modulesCount} modules and ${examsCount} exams`);
      
      // Create placeholder data if needed
      if (modulesCount === 0) {
        // Create a placeholder module
        const placeholderModule = {
          title: 'Example Module',
          description: 'This is an example module created by the repair function',
          questionIds: [],
          moduleNumber: 1,
          calculatorAllowed: false,
          timeLimit: 1920, // 32 minutes
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        
        const moduleRef = await addDoc(collection(db, 'examModules'), placeholderModule);
        console.log('Created placeholder module with ID:', moduleRef.id);
        
        // Also create a placeholder exam if needed
        if (examsCount === 0) {
          const placeholderExam = {
            title: 'Example Practice Exam',
            description: 'This is an example practice exam created by the repair function',
            moduleIds: [moduleRef.id],
            isPublic: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          };
          
          const examRef = await addDoc(collection(db, 'practiceExams'), placeholderExam);
          console.log('Created placeholder practice exam with ID:', examRef.id);
          alert('Created placeholder module and practice exam successfully!');
        } else {
          alert('Created placeholder module successfully!');
        }
      } else if (examsCount === 0) {
        // If we have modules but no exams, create a placeholder exam
        const firstModule = modulesSnapshot.docs[0];
        const placeholderExam = {
          title: 'Example Practice Exam',
          description: 'This is an example practice exam created by the repair function',
          moduleIds: [firstModule.id],
          isPublic: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        
        const examRef = await addDoc(collection(db, 'practiceExams'), placeholderExam);
        console.log('Created placeholder practice exam with ID:', examRef.id);
        alert('Created placeholder practice exam successfully!');
      } else {
        alert('Practice exam data already exists. No repair needed.');
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error repairing practice exam data:', error);
      alert(`Error repairing practice exam data: ${error.message}`);
      setIsLoading(false);
    }
  };
  
  // Handle diagnosing question contexts
  const handleDiagnoseQuestionContexts = async () => {
    try {
      setIsLoading(true);
      
      console.log('Starting question context diagnostic...');
      
      // Get all questions directly from the database
      const questionsSnapshot = await getDocs(collection(db, 'questions'));
      const allQuestions = questionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log(`Total questions in database: ${allQuestions.length}`);
      
      // Analyze usage contexts
      const contextAnalysis = {
        general: [],
        exam: [],
        undefined: [],
        null: [],
        empty: [],
        other: []
      };
      
      allQuestions.forEach(q => {
        if (q.usageContext === 'general') {
          contextAnalysis.general.push(q.id);
        } else if (q.usageContext === 'exam') {
          contextAnalysis.exam.push(q.id);
        } else if (q.usageContext === undefined) {
          contextAnalysis.undefined.push(q.id);
        } else if (q.usageContext === null) {
          contextAnalysis.null.push(q.id);
        } else if (q.usageContext === '') {
          contextAnalysis.empty.push(q.id);
        } else {
          contextAnalysis.other.push({ id: q.id, context: q.usageContext });
        }
      });
      
      // Get recently created questions (last 24 hours)
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      
      const recentQuestions = allQuestions.filter(q => {
        if (!q.createdAt) return false;
        const createdDate = q.createdAt.toDate ? q.createdAt.toDate() : new Date(q.createdAt);
        return createdDate > oneDayAgo;
      });
      
      console.log('Context Analysis:', contextAnalysis);
      console.log('Recent Questions:', recentQuestions.map(q => ({
        id: q.id,
        usageContext: q.usageContext,
        createdAt: q.createdAt
      })));
      
      // Create detailed report
      let report = `📊 QUESTION CONTEXT DIAGNOSTIC REPORT\n\n`;
      report += `Total Questions: ${allQuestions.length}\n\n`;
      
      report += `📈 CONTEXT BREAKDOWN:\n`;
      report += `• General: ${contextAnalysis.general.length} questions\n`;
      report += `• Exam: ${contextAnalysis.exam.length} questions\n`;
      report += `• Undefined: ${contextAnalysis.undefined.length} questions\n`;
      report += `• Null: ${contextAnalysis.null.length} questions\n`;
      report += `• Empty string: ${contextAnalysis.empty.length} questions\n`;
      report += `• Other values: ${contextAnalysis.other.length} questions\n\n`;
      
      if (contextAnalysis.other.length > 0) {
        report += `🔍 OTHER VALUES FOUND:\n`;
        contextAnalysis.other.forEach(item => {
          report += `• ${item.id}: "${item.context}"\n`;
        });
        report += `\n`;
      }
      
      report += `🕒 RECENT QUESTIONS (Last 24h): ${recentQuestions.length}\n`;
      if (recentQuestions.length > 0) {
        report += `Recent question contexts:\n`;
        recentQuestions.slice(0, 10).forEach(q => {
          const contextValue = q.usageContext === undefined ? 'undefined' : 
                              q.usageContext === null ? 'null' :
                              q.usageContext === '' ? 'empty string' :
                              `"${q.usageContext}"`;
          report += `• ${q.id}: ${contextValue}\n`;
        });
        if (recentQuestions.length > 10) {
          report += `... and ${recentQuestions.length - 10} more\n`;
        }
      }
      
      // Check what the quiz system would see
      const quizSystemWouldReject = allQuestions.filter(q => 
        !q.usageContext || q.usageContext === 'exam'
      );
      
      report += `\n🚫 QUESTIONS QUIZ SYSTEM WOULD REJECT: ${quizSystemWouldReject.length}\n`;
      report += `(Questions with no usageContext or usageContext === 'exam')\n`;
      
      if (quizSystemWouldReject.length > 0 && quizSystemWouldReject.length <= 20) {
        report += `Rejected question IDs:\n`;
        quizSystemWouldReject.forEach(q => {
          const contextValue = q.usageContext === undefined ? 'undefined' : 
                              q.usageContext === null ? 'null' :
                              q.usageContext === '' ? 'empty string' :
                              `"${q.usageContext}"`;
          report += `• ${q.id}: ${contextValue}\n`;
        });
      }
      
      alert(report);
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error diagnosing question contexts:', error);
      alert(`Error during diagnostic: ${error.message}`);
      setIsLoading(false);
    }
  };

  // Handle repairing exam module data
  const handleRepairExamModuleData = async () => {
    try {
      setIsLoading(true);
      
      // Check for existing modules
      console.log('Checking for existing exam modules...');
      const modulesSnapshot = await getDocs(collection(db, 'examModules'));
      const modulesCount = modulesSnapshot.docs.length;
      
      console.log(`Found ${modulesCount} modules`);
      
      // Create a placeholder module if needed
      if (modulesCount === 0) {
        const placeholderModule = {
          title: 'Example Module',
          description: 'This is an example module created by the repair function',
          questionIds: [],
          moduleNumber: 1,
          calculatorAllowed: false,
          timeLimit: 1920, // 32 minutes
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        
        const moduleRef = await addDoc(collection(db, 'examModules'), placeholderModule);
        console.log('Created placeholder module with ID:', moduleRef.id);
        alert('Created placeholder exam module successfully!');
      } else {
        alert('Exam module data already exists. No repair needed.');
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error repairing exam module data:', error);
      alert(`Error repairing exam module data: ${error.message}`);
      setIsLoading(false);
    }
  };

  // Handle viewing question details
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  
  const handleViewQuestionDetails = (question) => {
    setSelectedQuestion(question);
  };
  
  const closeQuestionDetails = () => {
    setSelectedQuestion(null);
  };
  
  // Convert any subcategory format to our numeric ID system
  const normalizeSubcategoryId = (subcategory) => {
    if (!subcategory) return null;
    
    // If it's already a numeric ID, return as is
    if (!isNaN(parseInt(subcategory, 10))) {
      return parseInt(subcategory, 10);
    }
    
    // Convert from any string format to numeric ID
    return getSubcategoryIdFromString(subcategory);
  };
  
  // Official Digital SAT categories and subcategories for validation
const officialSATCategories = {
  // Math main categories
  'Math': {
    mainCategories: [
      'Algebra',
      'Advanced Math',
      'Problem-Solving and Data Analysis',
      'Geometry and Trigonometry'
    ],
    subcategories: {
      'Algebra': [
        'Linear equations in one variable',
        'Linear functions',
        'Linear equations in two variables',
        'Systems of two linear equations in two variables',
        'Linear inequalities in one or two variables'
      ],
      'Advanced Math': [
        'Nonlinear functions',
        'Nonlinear equations in one variable and systems of equations in two variables',
        'Equivalent expressions'
      ],
      'Problem-Solving and Data Analysis': [
        'Ratios, rates, proportional relationships, and units',
        'Percentages',
        'One-variable data: Distributions and measures of center and spread',
        'Two-variable data: Models and scatterplots',
        'Probability and conditional probability',
        'Inference from sample statistics and margin of error',
        'Evaluating statistical claims: Observational studies and experiments'
      ],
      'Geometry and Trigonometry': [
        'Area and volume',
        'Lines, angles, and triangles',
        'Right triangles and trigonometry',
        'Circles'
      ]
    }
  },
  // Reading and Writing main categories
  'Reading and Writing': {
    mainCategories: [
      'Information and Ideas',
      'Craft and Structure',
      'Expression of Ideas',
      'Standard English Conventions'
    ],
    subcategories: {
      'Information and Ideas': [
        'Central Ideas and Details',
        'Inferences',
        'Command of Evidence'
      ],
      'Craft and Structure': [
        'Words in Context',
        'Text Structure and Purpose',
        'Cross-Text Connections'
      ],
      'Expression of Ideas': [
        'Rhetorical Synthesis',
        'Transitions'
      ],
      'Standard English Conventions': [
        'Boundaries',
        'Form, Structure, and Sense'
      ]
    }
  }
};

// Function to normalize subcategory for comparison (case-insensitive)
const normalizeSubcategoryForComparison = (subcategory) => {
  if (!subcategory) return '';
  return subcategory.toLowerCase().trim();
};

// Function to check if a subcategory matches any in the given list (case-insensitive)
const subcategoryMatchesAny = (subcategory, subcategoryList) => {
  if (!subcategory || !subcategoryList) return false;
  const normalizedSubcategory = normalizeSubcategoryForComparison(subcategory);
  return subcategoryList.some(item => normalizeSubcategoryForComparison(item) === normalizedSubcategory);
};

// Function to validate and correct categories for a question
const validateAndCorrectCategories = (question) => {
  const validationResult = {
    question: { ...question },
    corrected: false,
    warningMessage: null
  };
  
  // ENHANCED: Handle both 'subcategory' (lowercase) and 'subCategory' (uppercase) field names
  // Try to get subcategory from various possible fields
  let subcategoryValue = validationResult.question.subCategory || 
                        validationResult.question.subcategory || 
                        validationResult.question.subcategoryId;
  
  // If we found a subcategory, normalize the field name to 'subCategory' for consistency
  if (subcategoryValue) {
    validationResult.question.subCategory = subcategoryValue;
    // Also keep the lowercase version for compatibility
    validationResult.question.subcategory = subcategoryValue;
  }
  
  // First handle the case where we have subcategory but no category
  if (!validationResult.question.category && validationResult.question.subCategory) {
    // Try to determine main category from subcategory
    let inferredCategory = null;
    let inferredMainCategory = null;
    
    // Check in Math categories
    for (const mainCategory of officialSATCategories['Math'].mainCategories) {
      if (subcategoryMatchesAny(validationResult.question.subCategory, officialSATCategories['Math'].subcategories[mainCategory])) {
        inferredCategory = 'Math';
        inferredMainCategory = mainCategory;
        break;
      }
    }
    
    // If not found in Math, check in Reading and Writing categories
    if (!inferredCategory) {
      for (const mainCategory of officialSATCategories['Reading and Writing'].mainCategories) {
        if (subcategoryMatchesAny(validationResult.question.subCategory, officialSATCategories['Reading and Writing'].subcategories[mainCategory])) {
          inferredCategory = 'Reading and Writing';
          inferredMainCategory = mainCategory;
          break;
        }
      }
    }
    
    // If we found a matching category, update the question
    if (inferredCategory) {
      validationResult.question.category = inferredCategory;
      validationResult.question.section = inferredCategory; // Set section to match
      validationResult.question.mainSkillCategory = inferredMainCategory;
      validationResult.question.subSkillCategory = validationResult.question.subCategory;
      validationResult.corrected = true;
      console.log(`Auto-assigned category '${inferredCategory}' and main category '${inferredMainCategory}' based on subcategory '${validationResult.question.subCategory}'`);
    } else {
      // Handle non-standard subcategories before giving up
      const subcategoryMappings = {
        // Reading and Writing mappings
        'Main Idea': { category: 'Reading and Writing', mainCategory: 'Information and Ideas', mapped: 'Central Ideas and Details' },
        'Detail': { category: 'Reading and Writing', mainCategory: 'Information and Ideas', mapped: 'Central Ideas and Details' },
        'Author\'s Tone': { category: 'Reading and Writing', mainCategory: 'Information and Ideas', mapped: 'Inferences' },
        'Vocabulary in Context': { category: 'Reading and Writing', mainCategory: 'Craft and Structure', mapped: 'Words in Context' },
        'Vocabulary': { category: 'Reading and Writing', mainCategory: 'Craft and Structure', mapped: 'Words in Context' },
        'Purpose': { category: 'Reading and Writing', mainCategory: 'Craft and Structure', mapped: 'Text Structure and Purpose' },
        'Evidence': { category: 'Reading and Writing', mainCategory: 'Information and Ideas', mapped: 'Command of Evidence' },
        'Prediction': { category: 'Reading and Writing', mainCategory: 'Craft and Structure', mapped: 'Cross-Text Connections' },
        'Grammar': { category: 'Reading and Writing', mainCategory: 'Standard English Conventions', mapped: 'Form, Structure, and Sense' },
        'Punctuation': { category: 'Reading and Writing', mainCategory: 'Standard English Conventions', mapped: 'Boundaries' },
        'Sentence Structure': { category: 'Reading and Writing', mainCategory: 'Standard English Conventions', mapped: 'Form, Structure, and Sense' },
        'Organization': { category: 'Reading and Writing', mainCategory: 'Expression of Ideas', mapped: 'Rhetorical Synthesis' },
        
        // Math mappings
        'Functions': { category: 'Math', mainCategory: 'Algebra', mapped: 'Linear functions' },
        'Expressions': { category: 'Math', mainCategory: 'Advanced Math', mapped: 'Equivalent expressions' },
        'Geometry': { category: 'Math', mainCategory: 'Geometry and Trigonometry', mapped: 'Area and volume' },
        'Probability': { category: 'Math', mainCategory: 'Problem-Solving and Data Analysis', mapped: 'Probability and conditional probability' },
        'Data Analysis': { category: 'Math', mainCategory: 'Problem-Solving and Data Analysis', mapped: 'One-variable data: Distributions and measures of center and spread' },
        'Problem Solving': { category: 'Math', mainCategory: 'Problem-Solving and Data Analysis', mapped: 'Ratios, rates, proportional relationships, and units' }
      };
      
      if (subcategoryMappings[validationResult.question.subCategory]) {
        const mapping = subcategoryMappings[validationResult.question.subCategory];
        validationResult.question.category = mapping.category;
        validationResult.question.section = mapping.category; // Set section to match
        validationResult.question.mainSkillCategory = mapping.mainCategory;
        validationResult.question.subSkillCategory = mapping.mapped;
        validationResult.question.subCategory = mapping.mapped; // Update the subCategory too
        validationResult.question.subcategory = mapping.mapped; // Also update lowercase version
        validationResult.corrected = true;
        console.log(`Mapped non-standard subcategory '${subcategoryValue}' to '${mapping.mapped}' in category '${mapping.category}'`);
      } else {
        validationResult.warningMessage = `Could not determine category from subcategory: '${validationResult.question.subCategory}'`;
        return validationResult;
      }
    }
  }
  
  // If we still have no category at this point, we can't proceed
  if (!validationResult.question.category) {
    validationResult.warningMessage = 'Question has no category or valid subcategory';
    return validationResult;
  }
  
  // Normalize section value if it exists but doesn't match category
  if (validationResult.question.section && validationResult.question.section !== validationResult.question.category) {
    validationResult.question.section = validationResult.question.category;
    validationResult.corrected = true;
  }
  
  // Map legacy category names to official categories
  const categoryMapping = {
    'Reading': 'Reading and Writing',
    'Writing': 'Reading and Writing'
  };
  
  // Check and correct main category
  if (categoryMapping[validationResult.question.category]) {
    validationResult.question.category = categoryMapping[validationResult.question.category];
    validationResult.corrected = true;
  }
  
  // Check if the main category is valid
  if (!(validationResult.question.category in officialSATCategories)) {
    validationResult.warningMessage = `Invalid main category: '${validationResult.question.category}'`;
    return validationResult;
  }
  
  // If we don't have a subcategory at this point, we're stuck
  if (!validationResult.question.subCategory) {
    validationResult.warningMessage = 'Question has no subcategory';
    return validationResult;
  }
  
  // Find which main category this subcategory belongs to
  let foundMainCategory = null;
  let subcategoryValid = false;
  
  for (const mainCategory of officialSATCategories[validationResult.question.category].mainCategories) {
    if (subcategoryMatchesAny(validationResult.question.subCategory, officialSATCategories[validationResult.question.category].subcategories[mainCategory])) {
      // Find the official subcategory spelling for consistency
      const officialSubcategories = officialSATCategories[validationResult.question.category].subcategories[mainCategory];
      const normalizedInput = normalizeSubcategoryForComparison(validationResult.question.subCategory);
      
      for (const officialSubcategory of officialSubcategories) {
        if (normalizeSubcategoryForComparison(officialSubcategory) === normalizedInput) {
          // Update to use the official spelling
          validationResult.question.subCategory = officialSubcategory;
          validationResult.question.subcategory = officialSubcategory; // Also update lowercase version
          break;
        }
      }
      
      foundMainCategory = mainCategory;
      subcategoryValid = true;
      break;
    }
  }
  
  // If subcategory is valid, add the main skill category
  if (subcategoryValid) {
    validationResult.question.mainSkillCategory = foundMainCategory;
    validationResult.question.subSkillCategory = validationResult.question.subCategory;
    validationResult.corrected = true;
  } else {
    // Try to map common non-standard subcategories to official ones
    const subcategoryMappings = {
      // Reading and Writing mappings
      'Main Idea': 'Central Ideas and Details',
      'Detail': 'Central Ideas and Details',
      'Author\'s Tone': 'Inferences',
      'Vocabulary in Context': 'Words in Context',
      'Vocabulary': 'Words in Context',
      'Purpose': 'Text Structure and Purpose',
      'Evidence': 'Command of Evidence',
      'Prediction': 'Cross-Text Connections',
      'Grammar': 'Form, Structure, and Sense',
      'Punctuation': 'Boundaries',
      'Sentence Structure': 'Form, Structure, and Sense',
      'Organization': 'Rhetorical Synthesis',
      
      // Math mappings
      'Functions': 'Linear functions',
      'Expressions': 'Equivalent expressions',
      'Geometry': 'Area and volume',
      'Probability': 'Probability and conditional probability',
      'Data Analysis': 'One-variable data: Distributions and measures of center and spread',
      'Problem Solving': 'Ratios, rates, proportional relationships, and units'
    };
    
    if (subcategoryMappings[validationResult.question.subCategory]) {
      const mappedSubcategory = subcategoryMappings[validationResult.question.subCategory];
      
      // Find which main category this mapped subcategory belongs to
      for (const mainCategory of officialSATCategories[validationResult.question.category].mainCategories) {
        if (officialSATCategories[validationResult.question.category].subcategories[mainCategory].includes(mappedSubcategory)) {
          validationResult.question.mainSkillCategory = mainCategory;
          validationResult.question.subSkillCategory = mappedSubcategory;
          validationResult.question.subCategory = mappedSubcategory; // Update the subCategory too
          validationResult.question.subcategory = mappedSubcategory; // Also update lowercase version
          validationResult.corrected = true;
          break;
        }
      }
    }
    
    // If we still couldn't map it, flag it
    if (!validationResult.question.mainSkillCategory) {
      validationResult.warningMessage = `Invalid subcategory '${validationResult.question.subCategory}' for ${validationResult.question.category}`;
    }
  }
  
  return validationResult;
};

// Migration utility for converting existing questions to numeric ID system
const migrateToNumericIds = async () => {
  if (!window.confirm('This will update ALL questions in the database to use the new numeric ID system. Continue?')) {
    return;
  }
  
  setIsLoading(true);
  
  try {
    const questionDocs = await getDocs(collection(db, 'questions'));
    let updated = 0;
    let failed = 0;
    
    for (const doc of questionDocs.docs) {
      const question = doc.data();
      let requiresUpdate = false;
      
      // Check if subcategory needs conversion to numeric ID
      if (question.subCategory || question.subcategory) {
        const subCat = question.subCategory || question.subcategory;
        const numericId = normalizeSubcategoryId(subCat);
        
        if (numericId && (question.subcategoryId !== numericId)) {
          question.subcategoryId = numericId;
          requiresUpdate = true;
        }
      }
      
      if (requiresUpdate) {
        try {
          await updateDoc(doc.ref, { subcategoryId: question.subcategoryId });
          updated++;
        } catch (error) {
          console.error(`Error updating question ${doc.id}:`, error);
          failed++;
        }
      }
    }
    
    alert(`Migration complete! Updated ${updated} questions. Failed: ${failed}`);
  } catch (error) {
    console.error('Error during migration:', error);
    alert(`Error during migration: ${error.message}`);
  } finally {
    setIsLoading(false);
  }
};

// Migration function to fix existing questions
const migrateExistingQuestions = async () => {
  if (!window.confirm('This will update all existing questions to use the standardized kebab-case subcategory format. This may take a while. Continue?')) {
    return;
  }
  
  try {
    const questionsSnapshot = await getDocs(collection(db, 'questions'));
    let updatedCount = 0;
    let errorCount = 0;
    const errors = [];
    
    console.log(`Starting migration of ${questionsSnapshot.docs.length} questions...`);
    
    for (const questionDoc of questionsSnapshot.docs) {
      try {
        const questionData = questionDoc.data();
        const questionId = questionDoc.id;
        
        // Check if question needs migration
        let needsUpdate = false;
        const updates = {};
        
        // Get subcategory from various possible fields
        const subcategorySource = questionData.subcategory || 
                                questionData.subCategory || 
                                questionData.subcategoryId;
        
        if (subcategorySource) {
          // Convert to kebab-case format
          const normalizedSubcategory = getKebabCaseFromAnyFormat(subcategorySource);
          const numericSubcategoryId = getSubcategoryIdFromString(subcategorySource);
          
          if (normalizedSubcategory) {
            // Check if subcategory field needs updating
            if (questionData.subcategory !== normalizedSubcategory) {
              updates.subcategory = normalizedSubcategory;
              needsUpdate = true;
            }
            
            // Ensure numeric ID is also set for backward compatibility
            if (numericSubcategoryId && questionData.subcategoryId !== numericSubcategoryId) {
              updates.subcategoryId = numericSubcategoryId;
              needsUpdate = true;
            }
            
            // Add update timestamp
            if (needsUpdate) {
              updates.updatedAt = serverTimestamp();
            }
          } else {
            errors.push(`Could not normalize subcategory '${subcategorySource}' for question ${questionId}`);
            errorCount++;
            continue;
          }
        } else {
          errors.push(`No subcategory found for question ${questionId}`);
          errorCount++;
          continue;
        }
        
        // Apply updates if needed
        if (needsUpdate) {
          await updateDoc(doc(db, 'questions', questionId), updates);
          updatedCount++;
          console.log(`Updated question ${questionId}: ${JSON.stringify(updates)}`);
        }
        
      } catch (error) {
        console.error(`Error updating question ${questionDoc.id}:`, error);
        errors.push(`Error updating question ${questionDoc.id}: ${error.message}`);
        errorCount++;
      }
    }
    
    // Show results
    let resultMessage = `Migration completed!\n\n`;
    resultMessage += `✅ Updated: ${updatedCount} questions\n`;
    resultMessage += `❌ Errors: ${errorCount} questions\n`;
    
    if (errors.length > 0) {
      resultMessage += `\nFirst 5 errors:\n`;
      resultMessage += errors.slice(0, 5).join('\n');
      if (errors.length > 5) {
        resultMessage += `\n...and ${errors.length - 5} more errors.`;
      }
    }
    
    alert(resultMessage);
    
    // Reload questions to reflect changes
    if (updatedCount > 0) {
      const questionsSnapshot = await getDocs(collection(db, 'questions'));
      const questionsList = questionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setQuestions(questionsList);
      setFilteredQuestions(questionsList);
    }
    
  } catch (error) {
    console.error('Error during migration:', error);
    alert(`Migration failed: ${error.message}`);
  }
};

  // Handle importing questions
  const handleImportQuestions = async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  
  try {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const questions = JSON.parse(e.target.result);
        
        if (!Array.isArray(questions)) {
          alert('Invalid file format. Expected an array of questions.');
          return;
        }
        
        let importCount = 0;
        let correctedCount = 0;
        let warningCount = 0;
        const warnings = [];
        
        for (const question of questions) {
          // Validate question format
          if (!question.text || !question.options || question.correctAnswer == null) { 
            console.warn('Skipping invalid question (missing text, options, or correctAnswer):', question);
            warnings.push(`Question missing required fields (text, options, or correctAnswer): ${question.text ? question.text.substring(0,50) : 'No text provided'}...`); 
            warningCount++;
            continue;
          }
          
          // ENHANCED: Pre-process the question to handle both 'subcategory' and 'subCategory' field names
          // This ensures the validation function can work with either format
          if (question.subcategory && !question.subCategory) {
            question.subCategory = question.subcategory;
          }
          
          // Validate and correct categories
          const validationResult = validateAndCorrectCategories(question);
          const processedQuestion = validationResult.question;
          
          if (validationResult.corrected) {
            correctedCount++;
          }
          
          if (validationResult.warningMessage) {
            warnings.push(`${validationResult.warningMessage}: ${question.text.substring(0,50)}...`);
            warningCount++;
            // Skip questions that couldn't be validated
            continue;
          }
          
          // CRITICAL FIX: Normalize subcategory to kebab-case format
          // This ensures compatibility with the smart quiz system
          let normalizedSubcategory = null;
          let numericSubcategoryId = null;
          
          // Try to get subcategory from various possible fields
          const subcategorySource = processedQuestion.subcategory || 
                                  processedQuestion.subCategory || 
                                  processedQuestion.subcategoryId;
          
          if (subcategorySource) {
            // Convert to kebab-case format (canonical identifier)
            normalizedSubcategory = getKebabCaseFromAnyFormat(subcategorySource);
            
            // Also get the numeric ID for backward compatibility
            numericSubcategoryId = getSubcategoryIdFromString(subcategorySource);
            
            if (normalizedSubcategory) {
              // Set the canonical kebab-case format as the primary identifier
              processedQuestion.subcategory = normalizedSubcategory;
              
              // Keep numeric ID for backward compatibility
              if (numericSubcategoryId) {
                processedQuestion.subcategoryId = numericSubcategoryId;
              }
              
              console.log(`Normalized subcategory: ${subcategorySource} -> ${normalizedSubcategory} (ID: ${numericSubcategoryId})`);
            } else {
              warnings.push(`Could not normalize subcategory '${subcategorySource}' for question: ${question.text.substring(0,50)}...`);
              warningCount++;
            }
          } else {
            warnings.push(`No subcategory found for question: ${question.text.substring(0,50)}...`);
            warningCount++;
          }
          
          // Normalize difficulty
          let originalDifficulty = question.difficulty;
          let normalizedDifficulty = 'medium'; // Default
          
          // ENHANCED: Handle both string and array explanation formats
          if (processedQuestion.explanation) {
            if (Array.isArray(processedQuestion.explanation)) {
              // Convert array explanation to string format for storage compatibility
              processedQuestion.explanation = processedQuestion.explanation.join('\n');
              console.log(`Converted array explanation to string format for question: ${question.text.substring(0,30)}...`);
            }
            // If it's already a string, keep it as is
          }
          
          if (typeof originalDifficulty === 'number') {
            if (originalDifficulty === 1) normalizedDifficulty = 'easy';
            else if (originalDifficulty >= 4) normalizedDifficulty = 'hard';
            // Levels 2 and 3 map to 'medium' (the default)
          } else if (typeof originalDifficulty === 'string') {
            const lowerDifficulty = originalDifficulty.toLowerCase();
            if (['easy', 'level 1'].includes(lowerDifficulty)) normalizedDifficulty = 'easy';
            else if (['medium', 'level 2', 'level 3'].includes(lowerDifficulty)) normalizedDifficulty = 'medium';
            else if (['hard', 'level 4', 'level 5'].includes(lowerDifficulty)) normalizedDifficulty = 'hard';
            // If already 'easy', 'medium', or 'hard', keep it.
            else if (['easy', 'medium', 'hard'].includes(originalDifficulty)) normalizedDifficulty = originalDifficulty; 
            // Else, defaults to 'medium'
          } else if (originalDifficulty == null) {
            // If difficulty is missing, default to medium and warn
            warnings.push(`Missing difficulty, defaulted to 'medium': ${question.text.substring(0,50)}...`);
            warningCount++;
          }
          
          // Add warning if normalization changed the value significantly or was unknown/missing
          if (normalizedDifficulty !== originalDifficulty && 
              !(['medium', 'level 2', 'level 3'].includes(String(originalDifficulty).toLowerCase()) && normalizedDifficulty === 'medium') &&
              !(originalDifficulty == null && normalizedDifficulty === 'medium')) {
            warnings.push(`Normalized difficulty '${originalDifficulty}' to '${normalizedDifficulty}': ${question.text.substring(0, 50)}...`);
            warningCount++;
          }
          processedQuestion.difficulty = normalizedDifficulty;

          // Set usageContext based on the batch setting selected in the UI
          processedQuestion.usageContext = importUsageContext; 
           
          // Add main category as a skill tag if it doesn't exist
          if (processedQuestion.mainSkillCategory) {
            const mainCategoryTag = processedQuestion.mainSkillCategory.toLowerCase().replace(/ /g, '-');
            if (!processedQuestion.skillTags) {
              processedQuestion.skillTags = [];
            }
            if (!processedQuestion.skillTags.includes(mainCategoryTag)) {
              processedQuestion.skillTags.push(mainCategoryTag);
            }
          }
          
          // Add question to database
          await addDoc(collection(db, 'questions'), {
            ...processedQuestion,
            createdAt: serverTimestamp(), // Use serverTimestamp for consistency
            updatedAt: serverTimestamp()
          });
          
          importCount++;
        }
        
        // Generate detailed import report
        let reportMessage = `Successfully imported ${importCount} questions.`;
        if (correctedCount > 0) {
          reportMessage += `\n\n${correctedCount} questions had categories corrected to match official Digital SAT format.`;
        }
        
        // Show report with warnings if any
        if (warningCount > 0) {
          reportMessage += `\n\n${warningCount} questions had warnings:`;
          // Show first 5 warnings to avoid message being too long
          const displayWarnings = warnings.slice(0, 5);
          if (warnings.length > 5) {
            displayWarnings.push(`...and ${warnings.length - 5} more.`);
          }
          reportMessage += '\n- ' + displayWarnings.join('\n- ');
        }
        
        alert(reportMessage);
        
        // Reload questions
        const questionsSnapshot = await getDocs(collection(db, 'questions'));
        const questionsList = questionsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setQuestions(questionsList);
        setFilteredQuestions(questionsList);
      } catch (error) {
        console.error('Error parsing JSON:', error);
        alert('Failed to parse file. Make sure it contains valid JSON.');
      }
    };
    
    reader.readAsText(file);
  } catch (error) {
    console.error('Error importing questions:', error);
    alert('Failed to import questions. Please try again.');
  }
};
  
  // Redirect if not admin or not logged in
  if (isLoading) {
    return <div className="loading">Checking permissions...</div>;
  }
  
  if (!isAdmin) {
    return (
      <div className="admin-dashboard">
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>You do not have permission to access the admin dashboard.</p>
          <button onClick={() => navigate('/')}>Return to Home</button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>Admin Dashboard</h1>
        <div className="admin-tabs">
          <button 
            className={activeTab === 'questions' ? 'active' : ''}
            onClick={() => setActiveTab('questions')}
          >
            Question Management
          </button>
          <button 
            className={activeTab === 'generate' ? 'active' : ''}
            onClick={() => setActiveTab('generate')}
          >
            Generate Questions
          </button>
          <button 
            className={activeTab === 'quizzes' ? 'active' : ''}
            onClick={() => setActiveTab('quizzes')}
          >
            Quiz Management
          </button>
          <button 
            className={activeTab === 'practiceExams' ? 'active' : ''}
            onClick={() => setActiveTab('practiceExams')}
          >
            Practice Exam Management
          </button>
          <button 
            className={activeTab === 'examModules' ? 'active' : ''}
            onClick={() => setActiveTab('examModules')}
          >
            Exam Module Management
          </button>
          <button 
            className={`tab-button ${activeTab === 'skills' ? 'active' : ''}`}
            onClick={() => setActiveTab('skills')}
          >
            Skills
          </button>
          <button 
            className={`tab-button`}
            onClick={() => navigate('/admin/membership-management')}
          >
            Membership Management
          </button>
          <button 
            className={`tab-button ${activeTab === 'subcategorySettings' ? 'active' : ''}`}
            onClick={() => navigate('/admin/subcategory-settings')}
          >
            Subcategory Settings
          </button>
          <button 
            className={`tab-button`}
            onClick={() => navigate('/admin/concept-import')}
          >
            Import Concepts
          </button>
          <button 
            className={`tab-button`}
            onClick={() => navigate('/admin/question-import')}
          >
            Import Questions
          </button>
          {isGraphGenerationAvailable && (
            <button 
              className={`tab-button`}
              onClick={() => navigate('/admin/graph-generation')}
            >
              Generate Graphs
            </button>
          )}
          <button 
            className={`tab-button`}
            onClick={() => navigate('/admin/graph-descriptions')}
          >
            Graph Descriptions
          </button>
          <button 
            className={`tab-button ${activeTab === 'aiContent' ? 'active' : ''}`}
            onClick={() => navigate('/admin/ai-content')}
          >
            AI Content
          </button>
          <button 
            className={`tab-button ${activeTab === 'maintenance' ? 'active' : ''}`}
            onClick={() => setActiveTab('maintenance')}
          >
            Maintenance
          </button>
          <button 
            className={`tab-button ${activeTab === 'featureFlags' ? 'active' : ''}`}
            onClick={() => setActiveTab('featureFlags')}
          >
            Feature Flags
          </button>
        </div>
      </header>
      
      <div className="admin-content">
        {/* Confirm Delete Modal */}
        {isConfirmDeleteModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content confirm-delete-modal">
              <div className="modal-header">
                <h3>Confirm Delete</h3>
                <button className="close-button" onClick={cancelDeleteSelected}>×</button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete {selectedQuestionIds.length} selected question(s)? This action cannot be undone.</p>
              </div>
              <div className="modal-footer">
                <button className="danger-button" onClick={confirmDeleteSelected}>Delete</button>
                <button className="secondary-button" onClick={cancelDeleteSelected}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      
        {/* Question Details Modal */}
        {selectedQuestion && (
          <div className="question-details-modal">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Question Details</h3>
                <button className="close-button" onClick={closeQuestionDetails}>×</button>
              </div>
              <div className="modal-body">
                <div className="question-field">
                  <label>Question ID:</label>
                  <div>{selectedQuestion.id}</div>
                </div>
                
                <div className="question-field">
                  <label>Question Text:</label>
                  <div className="question-text-content">
                    {selectedQuestion.text || "No question text available"}
                  </div>
                </div>
                
                {selectedQuestion.options && selectedQuestion.options.length > 0 ? (
                  <div className="question-field">
                    <label>Answer Options:</label>
                    <div className="answer-options">
                      {selectedQuestion.options.map((option, index) => (
                        <div 
                          key={index} 
                          className={`answer-option ${(selectedQuestion.correctOption === index || 
                                                   selectedQuestion.correctAnswer === option) ? 'correct-answer' : ''}`}
                        >
                          <span className="option-marker">{String.fromCharCode(65 + index)}.</span>
                          <span className="option-text">{option || "[Empty option]"}</span>
                          {(selectedQuestion.correctOption === index || 
                            selectedQuestion.correctAnswer === option) && (
                            <span className="correct-indicator"> (Correct)</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
                
                <div className="question-field">
                  <label>Difficulty:</label>
                  <div>{selectedQuestion.difficulty || 'Not specified'}</div>
                </div>
                
                {/* Graph information section */}
                <div className="question-field">
                  <label>Graph:</label>
                  <div>
                    {selectedQuestion.graphUrl ? (
                      <div className="graph-preview-container">
                        <span className="graph-status has-graph">✓ This question has a graph</span>
                        <img 
                          src={selectedQuestion.graphUrl} 
                          alt="Question Graph" 
                          className="question-graph-preview" 
                        />
                      </div>
                    ) : (
                      <span className="graph-status no-graph">✗ No graph attached</span>
                    )}
                  </div>
                </div>
                
                <div className="question-field">
                  <label>Skills:</label>
                  <div className="skills-list">
                    {selectedQuestion.skillTags && selectedQuestion.skillTags.length > 0 ? (
                      selectedQuestion.skillTags.map(skillId => {
                        const skill = skillTags.find(s => s.id === skillId);
                        return (
                          <span key={skillId} className="skill-tag">
                            {skill ? skill.name : skillId}
                          </span>
                        );
                      })
                    ) : (
                      <span>No skills assigned</span>
                    )}
                  </div>
                </div>
                
                {selectedQuestion.explanation && (
                  <div className="question-field">
                    <label>Explanation:</label>
                    <div className="explanation-content">{selectedQuestion.explanation}</div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button onClick={() => handleEditQuestion(selectedQuestion.id)}>Edit Question</button>
                <button onClick={closeQuestionDetails}>Close</button>
              </div>
            </div>
          </div>
        )}
        
        {/* Question Bank Tab */}
        {activeTab === 'questions' && (
          <div className="questions-tab">
            <div className="tab-header-controls">
              <h2>Manage Questions ({filteredQuestions.length} total, showing {currentPageQuestions.length} on page {currentPage} of {totalPages})</h2>
              <div className="actions">
                <button onClick={handleCreateQuestion} className="button-primary">Create New Question</button>
                {selectedQuestionIds.length > 0 && (
                  <>
                    <button onClick={handleConvertSelectedToGeneral} className="button-secondary">
                      Convert to General ({selectedQuestionIds.length})
                    </button>
                    <button onClick={handleDeleteSelected} className="button-danger">
                      Delete Selected ({selectedQuestionIds.length})
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Bulk Import/Export Section */}
            <div className="bulk-operations admin-card-group" style={{ display: 'flex', gap: '20px', margin: '20px 0' }}>
              {/* Import questions card */}
              <div className="import-questions-section admin-card" style={{ flex: 1, padding: '20px' }}>
                <h3>Import Questions from JSON</h3>
                <div className="form-group" style={{ marginBottom: '15px' }}> 
                  <label htmlFor="import-usage-context" style={{ display: 'block', marginBottom: '5px' }}>Import as:</label>
                  <select 
                    id="import-usage-context"
                    value={importUsageContext} 
                    onChange={(e) => setImportUsageContext(e.target.value)}
                    className="form-control"
                  >
                    <option value="general">General Use</option>
                    <option value="exam">Practice Exam Only</option>
                  </select>
                </div>
                <input 
                  type="file" 
                  id="questionImportInput" 
                  onChange={handleImportQuestions} 
                  accept=".json" 
                  style={{ display: 'none' }} 
                />
                <button onClick={() => document.getElementById('questionImportInput').click()} className="button-secondary" style={{ width: '100%' }}>
                  Choose File & Import
                </button>
              </div>

              {/* Export questions card */}
              <div className="export-questions-section admin-card" style={{ flex: 1, padding: '20px' }}>
                <h3>Export Questions to JSON</h3>
                <div className="form-group" style={{ marginBottom: '15px' }}>
                  <label htmlFor="export-subcategory-select" style={{ display: 'block', marginBottom: '5px' }}>Filter by Subcategory:</label>
                  <select 
                    id="export-subcategory-select"
                    value={exportSubcategory} // This now correctly stores the ID
                    onChange={(e) => setExportSubcategory(e.target.value)}
                    className="form-control"
                  >
                    {uniqueSubcategories.map(subcatOpt => ( // subcatOpt is { value, display }
                      <option key={subcatOpt.value} value={subcatOpt.value}>
                        {subcatOpt.display}
                      </option>
                    ))}
                  </select>
                </div>
                <button 
                  onClick={() => exportQuestionsAsJSON(questions, exportSubcategory)} 
                  className="button-primary" 
                  style={{ width: '100%' }}
                >
                  Export Questions
                </button>
              </div>
            </div>
            
            <div className="filters">
              <div className="search-box">
                <input 
                  type="text" 
                  placeholder="Search questions..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="filter-selects">
                <select 
                  value={subcategoryFilter} 
                  onChange={(e) => setSubcategoryFilter(e.target.value)}
                  disabled={subcategoriesLoading} // Disable while loading
                >
                  <option value="all">All Subcategories</option>
                  {subcategories.map(subcategory => (
                    <option key={subcategory.id} value={subcategory.id}>
                      {subcategory.name}
                    </option>
                  ))}
                </select>
                
                <select 
                  value={difficultyFilter} 
                  onChange={(e) => setDifficultyFilter(e.target.value)}
                >
                  <option value="all">All Difficulties</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>
            
            <div className="questions-list">
              {filteredQuestions.length === 0 ? (
                <div className="no-results">
                  <p>No questions found matching your criteria.</p>
                </div>
              ) : (
                <>
                  <table className="questions-table">
                    <thead>
                      <tr>
                        <th>
                          <input 
                            type="checkbox" 
                            checked={allCurrentPageSelected} 
                            onChange={handleSelectAll}
                            title="Select/Deselect All Questions on This Page"
                          />
                        </th>
                        <th>Question</th>
                        <th>Difficulty</th>
                        <th>Subcategories</th>
                        <th>Context</th>
                        <th>Created</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentPageQuestions.map(question => (
                        <tr key={question.id} className="question-row">
                          <td className="question-checkbox">
                            <input 
                              type="checkbox" 
                              checked={selectedQuestionIds.includes(question.id)} 
                              onChange={() => handleToggleSelectQuestion(question.id)}
                            />
                          </td>
                          <td className="question-text" onClick={() => handleViewQuestionDetails(question)}>
                            <div className="truncated-text">{question.text}</div>
                            <div className="question-id">ID: {question.id}</div>
                          </td>
                          <td className="question-difficulty">
                            {question.difficulty || 'N/A'}
                          </td>
                          <td className="question-subcategories">
                            {question.subCategory || question.subcategoryId ? (
                              <div className="subcategories-container">
                                <span className="subcategory-tag">
                                  {question.subCategory || 
                                   (question.subcategoryId && allSubcategories ? 
                                    allSubcategories.find(sub => sub.id === question.subcategoryId)?.name || 
                                    `Category ID: ${question.subcategoryId}` : 
                                    'Unknown')}
                                </span>
                              </div>
                            ) : (
                              <span className="no-subcategory">No subcategory assigned</span>
                            )}
                          </td>
                          <td className="question-context">
                            <span className={`context-badge ${question.usageContext || 'undefined'}`}>
                              {question.usageContext === undefined ? 'undefined' : 
                               question.usageContext === null ? 'null' :
                               question.usageContext === '' ? 'empty' :
                               question.usageContext || 'undefined'}
                            </span>
                          </td>
                          <td className="question-creation-date">
                            {question.createdAt ? (
                              new Date(question.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            ) : (
                              'Unknown'
                            )}
                          </td>
                          <td className="question-actions">
                            <button 
                              className="action-button view-button" 
                              onClick={() => handleViewQuestionDetails(question)}
                              title="View Details"
                            >
                              View
                            </button>
                            <button 
                              className="action-button edit-button" 
                              onClick={() => handleEditQuestion(question.id)}
                              title="Edit Question"
                            >
                              Edit
                            </button>
                            <button 
                              className="action-button delete-button" 
                              onClick={() => handleDeleteQuestion(question.id)}
                              title="Delete Question"
                            >
                              Delete
                            </button>
                            {activeTab === 'quizzes' && selectedQuiz && (
                              <button 
                                className="action-button add-button" 
                                onClick={() => handleAddQuestionToQuiz(question)}
                                title="Add to Quiz"
                              >
                                Add to Quiz
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="pagination-controls">
                      <div className="pagination-info">
                        Showing {startIndex + 1}-{Math.min(endIndex, filteredQuestions.length)} of {filteredQuestions.length} questions
                      </div>
                      <div className="pagination-buttons">
                        <button 
                          onClick={goToPreviousPage} 
                          disabled={currentPage === 1}
                          className="pagination-button"
                        >
                          Previous
                        </button>
                        
                        {/* Page numbers */}
                        <div className="page-numbers">
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (currentPage <= 3) {
                              pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                            } else {
                              pageNum = currentPage - 2 + i;
                            }
                            
                            return (
                              <button
                                key={pageNum}
                                onClick={() => goToPage(pageNum)}
                                className={`page-button ${currentPage === pageNum ? 'active' : ''}`}
                              >
                                {pageNum}
                              </button>
                            );
                          })}
                        </div>
                        
                        <button 
                          onClick={goToNextPage} 
                          disabled={currentPage === totalPages}
                          className="pagination-button"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
        
        {/* Question Generation Tab */}
        {activeTab === 'subcategorySettings' && (
        <div className="admin-content">
          <h2>Subcategory Settings</h2>
          <SubcategorySettings />
        </div>
      )}
      
      {activeTab === 'generator' && (
        <div className="admin-content">
          <h2>AI Question Generator</h2>
          <QuestionGeneratorLive />
        </div>
      )}
        
        {/* Quiz Builder Tab */}
        {activeTab === 'quizzes' && (
          <div className="quizzes-tab">
            <div className="tab-header">
              <h2>Quiz Builder</h2>
              <button className="primary-button" onClick={handleCreateQuiz}>
                Create New Quiz
              </button>
            </div>
            
            <div className="quiz-builder">
              <div className="quiz-list">
                <h3>Available Quizzes</h3>
                {quizzes.length === 0 ? (
                  <div className="no-results">
                    <p>No quizzes found. Create your first quiz to get started.</p>
                  </div>
                ) : (
                  quizzes.map(quiz => (
                    <div 
                      key={quiz.id} 
                      className={`quiz-item ${selectedQuiz && selectedQuiz.id === quiz.id ? 'selected' : ''}`}
                    >
                      <div className="quiz-item-content" onClick={() => handleSelectQuiz(quiz.id)}>
                        <h4>{quiz.title}</h4>
                        <div className="quiz-item-meta">
                          <span>{quiz.questionIds ? quiz.questionIds.length : 0} questions</span>
                          <span>Difficulty: {quiz.difficulty || 'N/A'}</span>
                        </div>
                      </div>
                      <div className="quiz-item-actions">
                        <button 
                          className="action-button delete-button" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteQuiz(quiz.id);
                          }}
                          title="Delete Quiz"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <div className="quiz-editor">
                {!selectedQuiz ? (
                  <div className="no-quiz-selected">
                    <p>Select a quiz from the list or create a new one to start editing.</p>
                  </div>
                ) : (
                  <>
                    <div className="quiz-editor-header">
                      <h3>{selectedQuiz.title}</h3>
                      <button className="primary-button" onClick={handleSaveQuiz}>
                        Save Quiz
                      </button>
                    </div>
                    
                    <div className="quiz-details">
                      <div className="quiz-detail-item">
                        <label>Title:</label>
                        <input 
                          type="text" 
                          value={selectedQuiz.title || ''} 
                          onChange={(e) => setSelectedQuiz({...selectedQuiz, title: e.target.value})}
                        />
                      </div>
                      
                      <div className="quiz-detail-item">
                        <label>Description:</label>
                        <textarea 
                          value={selectedQuiz.description || ''} 
                          onChange={(e) => setSelectedQuiz({...selectedQuiz, description: e.target.value})}
                        />
                      </div>
                      
                      <div className="quiz-detail-item">
                        <label>Skills:</label>
                        <div className="skill-tag-selector">
                          {skillTags.map(skill => (
                            <div key={skill.id} className="skill-tag-option">
                              <input 
                                type="checkbox" 
                                id={`skill-${skill.id}`} 
                                checked={selectedQuiz.skillTags && selectedQuiz.skillTags.includes(skill.id)} 
                                onChange={(e) => {
                                  const updatedSkillTags = e.target.checked 
                                    ? [...(selectedQuiz.skillTags || []), skill.id]
                                    : (selectedQuiz.skillTags || []).filter(id => id !== skill.id);
                                  
                                  setSelectedQuiz({...selectedQuiz, skillTags: updatedSkillTags});
                                }} 
                              />
                              <label htmlFor={`skill-${skill.id}`}>{skill.name}</label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="quiz-questions">
                      <h4>Quiz Questions ({quizQuestions.length})</h4>
                      {quizQuestions.length === 0 ? (
                        <div className="no-results">
                          <p>No questions added to this quiz yet. Add questions from the Question Bank tab.</p>
                        </div>
                      ) : (
                        <div className="quiz-questions-list">
                          {quizQuestions.map((question, index) => (
                            <div key={question.id} className="quiz-question-item">
                              <div className="question-order">
                                {index + 1}
                              </div>
                              <div className="question-content">
                                <p>{question.text}</p>
                                <div className="question-meta">
                                  <span>Difficulty: {question.difficulty || 'N/A'}</span>
                                </div>
                              </div>
                              <div className="question-actions">
                                <button 
                                  disabled={index === 0} 
                                  onClick={() => handleMoveQuestion(index, 'up')}
                                >
                                  ↑
                                </button>
                                <button 
                                  disabled={index === quizQuestions.length - 1} 
                                  onClick={() => handleMoveQuestion(index, 'down')}
                                >
                                  ↓
                                </button>
                                <button onClick={() => handleRemoveQuestionFromQuiz(question.id)}>
                                  Remove
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Exam Module Management Tab */}
        {activeTab === 'examModules' && (
          <div className="exam-modules-tab">
            <div className="tab-header">
              <h2>Exam Module Management</h2>
              <div className="tab-actions">
                <button 
                  className="secondary-button" 
                  onClick={() => navigate('/admin/practice-exams')}
                >
                  Go to Practice Exam Manager
                </button>
                <button 
                  className="primary-button repair-button" 
                  onClick={handleRepairExamModuleData}
                >
                  Repair Module Data
                </button>
              </div>
            </div>
            <div className="tab-subheader">
              <p>Create individual exam modules first, then combine them into full practice exams using the Practice Exam Manager.</p>
            </div>
            <ExamModuleManager />
          </div>
        )}
        
        {/* Practice Exam Management Tab */}
        {activeTab === 'practiceExams' && (
          <div className="practice-exams-tab">
            <div className="tab-header">
              <h2>Practice Exam Management</h2>
              <p>Create and manage practice exams by combining existing modules</p>
              <div className="repair-section">
                <button 
                  className="primary-button repair-button" 
                  onClick={handleRepairPracticeExamData}
                >
                  Repair Practice Exam Data
                </button>
              </div>
            </div>
            <PracticeExamManager />
          </div>
        )}
        
        {/* AI Content Tab */}
        {activeTab === 'aiContent' && (
          <div className="ai-content-tab">
            <div className="tab-header">
              <h2>AI Content Validation</h2>
              <button className="primary-button" onClick={() => navigate('/admin/ai-content')}>
                Go to AI Content Manager
              </button>
            </div>
            
            <div className="ai-content-overview">
              <div className="info-card">
                <h3>About AI Content Validation</h3>
                <p>Review and approve AI-generated lessons and skill drills before they are shown to students.</p>
                <ul>
                  <li>Validate content accuracy and educational quality</li>
                  <li>Edit AI-generated content as needed</li>
                  <li>Monitor token usage and costs</li>
                  <li>Ensure lessons align with curriculum standards</li>
                </ul>
              </div>
            </div>
          </div>
        )}
        
        {/* Maintenance Tab */}
        {activeTab === 'maintenance' && (
          <div className="maintenance-tab">
            <h2>Database Maintenance</h2>
            
            <div className="maintenance-section">
              <h3>Question Subcategory Migration</h3>
              <p>This tool will update all existing questions to use the standardized kebab-case subcategory format, ensuring compatibility with the smart quiz system.</p>
              <button 
                onClick={migrateExistingQuestions}
                className="button-primary"
                style={{ marginBottom: '20px' }}
              >
                Migrate Question Subcategories
              </button>
            </div>
            
            <div className="maintenance-section">
              <h3>Practice Exam Data Repair</h3>
              <p>This tool will repair any corrupted practice exam data and ensure all exams have proper module references.</p>
              <button 
                onClick={handleRepairPracticeExamData}
                className="button-secondary"
                style={{ marginBottom: '20px' }}
              >
                Repair Practice Exam Data
              </button>
            </div>
            
            <div className="maintenance-section">
              <h3>Exam Module Data Repair</h3>
              <p>This tool will repair any corrupted exam module data and ensure all modules have proper question references.</p>
              <button 
                onClick={handleRepairExamModuleData}
                className="button-secondary"
              >
                Repair Exam Module Data
              </button>
            </div>
            
            <div className="maintenance-section">
              <h3>Question Context Diagnostic</h3>
              <p>This tool will analyze the actual usageContext values in the database and show you what's really stored vs what's displayed.</p>
              <button 
                onClick={handleDiagnoseQuestionContexts}
                className="button-primary"
              >
                Diagnose Question Contexts
              </button>
            </div>
            

          </div>
        )}
        
        {/* Skill Management Tab */}
        {activeTab === 'skills' && (
          <div className="skills-tab">
            <div className="tab-header">
              <h2>Skill Management</h2>
              <button className="primary-button" onClick={() => navigate('/admin/skill-editor')}>
                Create Skill Tag
              </button>
            </div>
            
            <div className="skills-list">
              {skillTags.length === 0 ? (
                <div className="no-results">
                  <p>No skill tags found. Create your first skill tag to get started.</p>
                </div>
              ) : (
                skillTags.map(skill => (
                  <div key={skill.id} className="skill-item">
                    <div className="skill-content">
                      <h3>{skill.name}</h3>
                      <p>{skill.description || 'No description'}</p>
                    </div>
                    <div className="skill-meta">
                      <span>Category: {skill.category || 'Uncategorized'}</span>
                      {/* Add more meta information here */}
                    </div>
                    <div className="skill-actions">
                      <button onClick={() => navigate(`/admin/skill-editor/${skill.id}`)}>
                        Edit
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
