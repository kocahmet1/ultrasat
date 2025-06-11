import React, { useState, useEffect } from 'react';
import { 
  getAllExamModules, 
  getExamModuleQuestions, 
  createExamModule, 
  updateExamModule,
  deleteExamModule,
  bulkImportQuestions,
  removeQuestion,
  getRecentQuestions,
  getQuestionsByCategory,
  getQuestionsBySubcategory,
  generateExamModule
} from '../firebase/services';
import { getAuth } from 'firebase/auth';
import { enrichQuestionWithSubcategory } from '../utils/subcategoryUtils';
import { 
  getSubcategoryIdFromString, 
  getSubcategoryName,
  getSubcategoryCategory,
  getSubcategorySubject,
  SUBCATEGORY_KEBAB_CASE 
} from '../utils/subcategoryConstants';
import '../styles/ExamModuleManager.css';
import Papa from 'papaparse';

// Subcategory normalization functions to handle format mismatches
const toKebabCase = (str) => {
  return str
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '');
};

// Helper function to format subcategory to display format
const toReadableFormat = (str) => {
  if (!str) return '';
  
  // Check if it's a numeric ID
  const numId = parseInt(str, 10);
  if (!isNaN(numId)) {
    return getSubcategoryName(numId);
  }
  
  // Otherwise use the legacy formatter
  if (str.includes('-')) {
    return str.split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  return str; // Already in readable format
};

// Convert any subcategory format to our numeric ID system
const normalizeSubcategory = (subcategory, toFormat = 'id') => {
  if (!subcategory) return null;
  
  // If it's already a number, return as is or convert to appropriate format
  if (!isNaN(parseInt(subcategory, 10))) {
    const numId = parseInt(subcategory, 10);
    
    if (toFormat === 'id') {
      return numId;
    } else if (toFormat === 'readable') {
      return getSubcategoryName(numId);
    } else if (toFormat === 'kebab') {
      // For backward compatibility
      return SUBCATEGORY_KEBAB_CASE[numId] || '';
    }
    return numId;
  }
  
  // Get the numeric ID from string (kebab-case or human-readable)
  const subcategoryId = getSubcategoryIdFromString(subcategory);
  
  // Return in requested format
  if (toFormat === 'id') {
    return subcategoryId;
  } else if (toFormat === 'readable') {
    return subcategoryId ? getSubcategoryName(subcategoryId) : toReadableFormat(subcategory);
  } else if (toFormat === 'kebab') {
    // For backward compatibility
    return toKebabCase(subcategory);
  }
  
  return subcategoryId;
};

const ExamModuleManager = () => {
  // Tab management state
  const [activeTab, setActiveTab] = useState('list'); // 'list', 'create', 'generate'
  
  // State for managing exam modules
  const [examModules, setExamModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  // State for delete confirmation
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [moduleToDelete, setModuleToDelete] = useState(null);
  
  // State for questions display
  const [moduleQuestions, setModuleQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [questionModalOpen, setQuestionModalOpen] = useState(false);
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
  const [draggedQuestion, setDraggedQuestion] = useState(null);
  const [dropTargetIndex, setDropTargetIndex] = useState(null);
  const [isReordering, setIsReordering] = useState(false);
  const [isReversing, setIsReversing] = useState(false); // New state for reverse loading

  // Available subcategories by subject area
  const availableSubcategories = {
    'Math': [
      'Linear equations in one variable',
      'Linear functions',
      'Linear equations in two variables',
      'Systems of two linear equations in two variables',
      'Linear inequalities in one or two variables',
      'Nonlinear functions',
      'Nonlinear equations in one variable and systems of equations in two variables',
      'Equivalent expressions',
      'Ratios, rates, proportional relationships, and units',
      'Percentages',
      'One-variable data: Distributions and measures of center and spread',
      'Two-variable data: Models and scatterplots',
      'Probability and conditional probability',
      'Inference from sample statistics and margin of error',
      'Evaluating statistical claims: Observational studies and experiments',
      'Area and volume',
      'Lines, angles, and triangles',
      'Right triangles and trigonometry',
      'Circles'
    ],
    'Reading and Writing': [
      'Central Ideas and Details',
      'Inferences',
      'Command of Evidence',
      'Words in Context',
      'Text Structure and Purpose',
      'Cross-Text Connections',
      'Rhetorical Synthesis',
      'Transitions',
      'Boundaries',
      'Form, Structure, and Sense'
    ]
  };

  // State for module creation form
  const [newModule, setNewModule] = useState({
    title: '',
    moduleNumber: 1,
    description: '',
    calculatorAllowed: false,
    timeLimit: 1920, // 32 minutes in seconds
    questionCount: 27, // Default question count
    categoryPaths: [],
    difficultyRange: { min: 1, max: 5 },
    questionIds: []
  });

  // State for module generation
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationCriteria, setGenerationCriteria] = useState({
    moduleNumber: 1,
    calculatorAllowed: false,
    categoryPaths: [],
    questionCount: 27,
    difficultyRange: { min: 1, max: 5 },
    timeLimit: 1920
  });

  // State for question selection
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubjectArea, setSelectedSubjectArea] = useState('Math');
  const [categoryQuestions, setCategoryQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [questionSelectionOpen, setQuestionSelectionOpen] = useState(false);
  const [selectionMode, setSelectionMode] = useState('date'); // 'date' or 'subcategory'

  // Fetch all exam modules when component mounts
  useEffect(() => {
    fetchExamModules();
  }, []);

  // Clear success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Fetch all exam modules
  const fetchExamModules = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const modules = await getAllExamModules();
      setExamModules(modules);
      setIsLoading(false);
    } catch (err) {
      setError('Failed to load exam modules: ' + err.message);
      setIsLoading(false);
    }
  };

  // Fetch questions for a selected module
  const fetchModuleQuestions = async (moduleId) => {
    try {
      setIsLoading(true);
      const questions = await getExamModuleQuestions(moduleId);
      setModuleQuestions(questions);
      setIsLoading(false);
    } catch (err) {
      setError('Failed to load module questions: ' + err.message);
      setIsLoading(false);
    }
  };
  
  // Handle viewing full question content
  const handleViewFullQuestion = (question, event) => {
    // Calculate position near the click
    const rect = event.currentTarget.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Position modal relative to the click but ensure it's visible
    const newPosition = {
      top: rect.top + scrollTop - 100, // Offset above the click point
      left: Math.max(50, window.innerWidth / 2 - 500) // Center horizontally but keep margin
    };
    
    setModalPosition(newPosition);
    setSelectedQuestion(question);
    setQuestionModalOpen(true);
  };
  
  // Handle removing a question from the module
  const handleRemoveQuestionFromModule = async (questionId) => {
    if (!selectedModule) return;
    
    try {
      setIsLoading(true);
      
      // Create a copy of the module with the question removed
      const updatedQuestionIds = selectedModule.questionIds.filter(id => id !== questionId);
      
      // Update the module in Firebase
      await updateExamModule(selectedModule.id, {
        questionIds: updatedQuestionIds,
        questionCount: updatedQuestionIds.length,
        updatedAt: new Date()
      });
      
      // Update the selected module in state
      setSelectedModule(prev => ({
        ...prev,
        questionIds: updatedQuestionIds,
        questionCount: updatedQuestionIds.length
      }));
      
      // Update the questions list
      setModuleQuestions(prev => prev.filter(q => q.id !== questionId));
      
      setSuccessMessage('Question removed from module successfully!');
      setIsLoading(false);
    } catch (err) {
      setError('Failed to remove question from module: ' + err.message);
      setIsLoading(false);
    }
  };
  
  // Toggle reordering mode
  const toggleReorderingMode = () => {
    setIsReordering(!isReordering);
    setDraggedQuestion(null);
    setDropTargetIndex(null);
  };
  
  // Handle drag start
  const handleDragStart = (e, question, index) => {
    if (!isReordering) return;
    
    setDraggedQuestion({ question, index });
    // Add some visual feedback for the dragged item
    e.currentTarget.style.opacity = '0.4';
    e.dataTransfer.effectAllowed = 'move';
    // Store the question index to use during drag operations
    e.dataTransfer.setData('text/plain', index);
  };
  
  // Handle drag over
  const handleDragOver = (e, index) => {
    if (!isReordering || !draggedQuestion) return;
    
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (index !== dropTargetIndex) {
      setDropTargetIndex(index);
    }
  };
  
  // Handle drag end
  const handleDragEnd = (e) => {
    if (!isReordering) return;
    
    e.currentTarget.style.opacity = '1';
    setDropTargetIndex(null);
  };
  
  // Handle drop
  const handleDrop = async (e, targetIndex) => {
    if (!isReordering || !draggedQuestion) return;
    
    e.preventDefault();
    
    const sourceIndex = draggedQuestion.index;
    if (sourceIndex === targetIndex) {
      setDraggedQuestion(null);
      setDropTargetIndex(null);
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Create a copy of questions and reorder them
      const reorderedQuestions = [...moduleQuestions];
      const [movedQuestion] = reorderedQuestions.splice(sourceIndex, 1);
      reorderedQuestions.splice(targetIndex, 0, movedQuestion);
      
      // Update question IDs in the selected module
      const reorderedQuestionIds = reorderedQuestions.map(q => q.id);
      
      // Update the module in Firebase
      await updateExamModule(selectedModule.id, {
        questionIds: reorderedQuestionIds,
        updatedAt: new Date()
      });
      
      // Update the selected module in state
      setSelectedModule(prev => ({
        ...prev,
        questionIds: reorderedQuestionIds
      }));
      
      // Update the questions list with new order
      setModuleQuestions(reorderedQuestions);
      
      setSuccessMessage('Question order updated successfully!');
      setIsLoading(false);
    } catch (err) {
      setError('Failed to reorder questions: ' + err.message);
      setIsLoading(false);
    } finally {
      setDraggedQuestion(null);
      setDropTargetIndex(null);
    }
  };

  // Handle module selection
  const handleSelectModule = async (module) => {
    setSelectedModule(module);
    setActiveTab('list'); // Ensure we're on the list tab
    await fetchModuleQuestions(module.id);
  };
  
  // Prepare module for deletion (opens confirmation)
  const prepareDeleteModule = (e, module) => {
    e.stopPropagation(); // Prevent triggering the module selection
    setModuleToDelete(module);
    setDeleteConfirmOpen(true);
  };
  
  // Handle module deletion after confirmation
  const handleDeleteModule = async () => {
    if (!moduleToDelete) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Call the delete module service
      await deleteExamModule(moduleToDelete.id);
      
      // Close confirmation dialog and clear module to delete
      setDeleteConfirmOpen(false);
      setModuleToDelete(null);
      
      // If deleted module was selected, clear selection
      if (selectedModule && selectedModule.id === moduleToDelete.id) {
        setSelectedModule(null);
        setModuleQuestions([]);
      }
      
      // Show success message
      setSuccessMessage(`Module "${moduleToDelete.title}" deleted successfully!`);
      
      // Refresh the modules list
      await fetchExamModules();
      setIsLoading(false);
    } catch (err) {
      setError('Failed to delete module: ' + err.message);
      setIsLoading(false);
    }
  };
  
  // Cancel module deletion
  const cancelDeleteModule = () => {
    setDeleteConfirmOpen(false);
    setModuleToDelete(null);
  };

  // Handle changes in new module form
  const handleNewModuleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setNewModule((prev) => ({
        ...prev,
        [name]: checked
      }));
    } else if (name.startsWith('difficultyRange.')) {
      const key = name.split('.')[1];
      setNewModule((prev) => ({
        ...prev,
        difficultyRange: {
          ...prev.difficultyRange,
          [key]: parseInt(value, 10)
        }
      }));
    } else if (name === 'moduleNumber' || name === 'questionCount' || name === 'timeLimit') {
      setNewModule((prev) => ({
        ...prev,
        [name]: parseInt(value, 10)
      }));
    } else {
      setNewModule((prev) => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Fetch recent questions by date
  const fetchRecentQuestions = async () => {
    try {
      setIsLoadingQuestions(true);
      setSelectedQuestions([]);
      
      // Get questions sorted by creation date
      const questions = await getRecentQuestions(100); // Limit to 100 most recent questions
      
      // Set the questions in state
      setCategoryQuestions(questions);
      setIsLoadingQuestions(false);
    } catch (err) {
      setError('Failed to load recent questions: ' + err.message);
      setIsLoadingQuestions(false);
    }
  };

  // Handle subcategory selection for question browsing
  const handleSelectCategory = async (subcategory) => {
    if (!subcategory) return;

    try {
      setIsLoadingQuestions(true);
      setSelectedCategory(subcategory);
      setSelectedQuestions([]);
      
      // Get both kebab and readable formats to search for questions in either format
      const kebabSubcategory = normalizeSubcategory(subcategory, 'kebab');
      const readableSubcategory = normalizeSubcategory(subcategory, 'readable');
      
      // Form the category path based on subject area and subcategory
      const categoryPath = `${selectedSubjectArea}/${kebabSubcategory}`;
      
      // Get questions by subcategory - first try with original format
      let questions = await getQuestionsBySubcategory(subcategory);
      
      // If no questions found and we're using the readable format, try with kebab format
      if (questions.length === 0 && subcategory === readableSubcategory) {
        questions = await getQuestionsBySubcategory(kebabSubcategory);
      }
      
      // If no questions found and we're using the kebab format, try with readable format
      if (questions.length === 0 && subcategory === kebabSubcategory) {
        questions = await getQuestionsBySubcategory(readableSubcategory);
      }
      
      setCategoryQuestions(questions);
      setIsLoadingQuestions(false);
    } catch (err) {
      setError('Failed to load questions: ' + err.message);
      setIsLoadingQuestions(false);
    }
  };

  // Handle question selection
  const handleQuestionSelect = (questionId) => {
    setSelectedQuestions((prev) => {
      if (prev.includes(questionId)) {
        return prev.filter(id => id !== questionId);
      } else {
        return [...prev, questionId];
      }
    });
  };

  // Handle adding selected questions to module
  const handleAddSelectedQuestions = async () => {
    if (selectedQuestions.length === 0) {
      setError('Please select at least one question.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage('');

    try {
      if (selectedModule) {
        // Adding questions to an existing module
        const currentQuestionIds = selectedModule.questionIds || [];
        // Merge and remove duplicates
        const combinedQuestionIds = [...new Set([...currentQuestionIds, ...selectedQuestions])]; 

        // Prepare data for update, ensuring no undefined values are sent
        const updateData = {
          questionIds: combinedQuestionIds,
          name: selectedModule.name,
          description: selectedModule.description,
          subject: selectedModule.subject,
          difficulty: selectedModule.difficulty,
          moduleType: selectedModule.moduleType
        };

        // Remove undefined fields before sending to Firestore
        const cleanUpdateData = Object.entries(updateData).reduce((acc, [key, value]) => {
          if (value !== undefined) {
            acc[key] = value;
          }
          return acc;
        }, {});

        // Ensure there's something to update (at least questionIds should have changed)
        if (Object.keys(cleanUpdateData).length > 0 && cleanUpdateData.questionIds) {
          await updateExamModule(selectedModule.id, cleanUpdateData);
        } else {
          // If only undefined fields were present besides questionIds (unlikely)
          // or if questionIds somehow became undefined (error case)
          console.warn("Skipping Firestore update as cleaned data is insufficient.", cleanUpdateData);
          // Optionally, update only questions if that's guaranteed?
          // await updateExamModule(selectedModule.id, { questionIds: combinedQuestionIds });
        }
        
        // Refresh the questions list for the currently selected module
        await fetchModuleQuestions(selectedModule.id);
        
        // Update local state to reflect the change immediately
        setSelectedModule(prev => ({ ...prev, questionIds: combinedQuestionIds }));

        setSuccessMessage(`Successfully added ${selectedQuestions.length} question(s) to module "${selectedModule.name}".`);
        
      } else {
        // This logic branch handles adding selected questions during NEW module creation
        // It assumes we are in the 'create' tab context
        if (activeTab === 'create') {
          setNewModule(prev => ({
            ...prev,
            questionIds: [...new Set([...(prev.questionIds || []), ...selectedQuestions])] 
          }));
          setSuccessMessage(`Added ${selectedQuestions.length} questions to the new module draft.`);
        } else {
          // This state should ideally not be reachable if the UI is designed correctly
          setError("Cannot add questions: No module selected or being created.");
        }
      }

      // Reset selection state after adding
      setSelectedQuestions([]); 
      setQuestionSelectionOpen(false); // Close the selector modal/view

    } catch (err) {
      console.error("Error adding questions:", err);
      setError(`Failed to add questions. ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle opening question selection modal
  const handleOpenQuestionSelection = () => {
    setQuestionSelectionOpen(true);
    // Start with date-based selection by default and load questions
    setSelectionMode('date');
    fetchRecentQuestions();
  };

  // Handle removing a question from the module
  const handleRemoveQuestion = (questionId) => {
    setNewModule((prev) => ({
      ...prev,
      questionIds: prev.questionIds.filter(id => id !== questionId)
    }));
  };

  // Handle create module
  const handleCreateModule = async (e) => {
    e.preventDefault();
    
    if (newModule.questionIds.length === 0) {
      setError('Please add at least one question to create a module');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Call the module creation service
      await createExamModule({
        ...newModule,
        // Convert time limit from minutes to seconds if needed
        timeLimit: typeof newModule.timeLimit === 'string' 
          ? parseInt(newModule.timeLimit, 10) * 60 
          : newModule.timeLimit
      });
      
      // Show success message
      setSuccessMessage('Module created successfully!');
      
      // Reset form and refresh modules list
      setNewModule({
        title: '',
        moduleNumber: 1,
        description: '',
        calculatorAllowed: false,
        timeLimit: 1920,
        questionCount: 27,
        categoryPaths: [],
        difficultyRange: { min: 1, max: 5 },
        questionIds: []
      });
      
      await fetchExamModules();
      setActiveTab('list'); // Switch back to list view
      setIsLoading(false);
    } catch (err) {
      setError('Failed to create module: ' + err.message);
      setIsLoading(false);
    }
  };

  // Handle generation criteria change
  const handleGenerationCriteriaChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setGenerationCriteria((prev) => ({
        ...prev,
        [name]: checked
      }));
    } else if (name.startsWith('difficultyRange.')) {
      const key = name.split('.')[1];
      setGenerationCriteria((prev) => ({
        ...prev,
        difficultyRange: {
          ...prev.difficultyRange,
          [key]: parseInt(value, 10)
        }
      }));
    } else if (name === 'moduleNumber' || name === 'questionCount' || name === 'timeLimit') {
      setGenerationCriteria((prev) => ({
        ...prev,
        [name]: parseInt(value, 10)
      }));
    } else if (name === 'categoryPaths') {
      const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
      setGenerationCriteria((prev) => ({
        ...prev,
        categoryPaths: selectedOptions
      }));
    } else {
      setGenerationCriteria((prev) => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle generate module
  const handleGenerateModule = async (e) => {
    e.preventDefault();
    try {
      setIsGenerating(true);
      setError(null);

      const title = `Generated Module ${generationCriteria.moduleNumber}`;
      const description = `Automatically generated exam module with ${generationCriteria.questionCount} questions`;
      
      // Convert subcategory selections to category paths for the service
      const categoryPaths = generationCriteria.categoryPaths.map(subcategory => {
        // Normalize the subcategory to kebab case to ensure consistency
        const normalizedSubcategory = normalizeSubcategory(subcategory, 'kebab');
        const readableSubcategory = normalizeSubcategory(subcategory, 'readable');
        
        // Determine if the subcategory is in Math or Reading and Writing
        let subject = '';
        if (availableSubcategories['Math'].includes(subcategory) || 
            availableSubcategories['Math'].includes(readableSubcategory)) {
          subject = 'Math';
        } else if (availableSubcategories['Reading and Writing'].includes(subcategory) || 
                   availableSubcategories['Reading and Writing'].includes(readableSubcategory)) {
          subject = 'Reading and Writing';
        }
        
        // Return as a path format if we found the subject, using normalized subcategory
        return subject ? `${subject}/${normalizedSubcategory}` : normalizedSubcategory;
      });
      
      // Call the module generation service
      await generateExamModule({
        ...generationCriteria,
        categoryPaths,
        title,
        description
      });
      
      // Show success message
      setSuccessMessage('Module generated successfully!');
      
      await fetchExamModules();
      setActiveTab('list'); // Switch to list view to see the new module
      setIsGenerating(false);
    } catch (err) {
      setError('Failed to generate module: ' + err.message);
      setIsGenerating(false);
    }
  };

  // Handle reversing the order of questions in the module
  const handleReverseOrder = async () => {
    if (!selectedModule || !moduleQuestions || moduleQuestions.length < 2) return; // Need at least 2 questions to reverse

    setIsReversing(true);
    setError(null);
    setSuccessMessage('');

    try {
      // 1. Get current question IDs in order
      const currentQuestionIds = moduleQuestions.map(q => q.id);
      
      // 2. Reverse the order
      const reversedQuestionIds = [...currentQuestionIds].reverse(); // Create a reversed copy

      // 3. Update Firestore
      await updateExamModule(selectedModule.id, { questionIds: reversedQuestionIds });

      // 4. Update local state to reflect the change immediately
      const reversedQuestions = reversedQuestionIds.map(id => moduleQuestions.find(q => q.id === id));
      setModuleQuestions(reversedQuestions);

      setSuccessMessage('Question order reversed successfully.');

    } catch (err) {
      console.error("Error reversing question order:", err);
      setError(`Failed to reverse question order: ${err.message}`);
    } finally {
      setIsReversing(false);
    }
  };

  return (
    <div className="exam-module-manager">
      <div className="exam-manager-header">
        <h2>Exam Module Manager</h2>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}
      
      <div className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === 'list' ? 'active' : ''}`}
          onClick={() => setActiveTab('list')}
        >
          Module List
        </button>
        <button 
          className={`tab-button ${activeTab === 'create' ? 'active' : ''}`}
          onClick={() => setActiveTab('create')}
        >
          Create Module
        </button>
        <button 
          className={`tab-button ${activeTab === 'generate' ? 'active' : ''}`}
          onClick={() => setActiveTab('generate')}
        >
          Generate Module
        </button>
      </div>
      
      {/* Module List Tab */}
      {activeTab === 'list' && (
        <div className="module-list-tab">
          <div className="modules-grid">
            {isLoading && !selectedModule ? (
              <div className="loading">Loading modules...</div>
            ) : examModules.length > 0 ? (
              examModules.map((module) => (
                <div 
                  key={module.id} 
                  className={`module-card ${selectedModule && selectedModule.id === module.id ? 'selected' : ''}`}
                  onClick={() => handleSelectModule(module)}
                >
                  <div className="module-card-header">
                    <h3>{module.title}</h3>
                    <span className="module-number">Module {module.moduleNumber}</span>
                    <button 
                      className="btn-delete"
                      onClick={(e) => prepareDeleteModule(e, module)}
                      title="Delete module"
                    >
                      ×
                    </button>
                  </div>
                  <div className="module-type">
                    {module.moduleNumber <= 2 
                      ? 'Reading & Writing' 
                      : module.moduleNumber === 3 
                        ? 'Math (No Calculator)' 
                        : 'Math (Calculator)'}
                  </div>
                  <p>{module.description || 'No description provided.'}</p>
                  <div className="module-meta">
                    <div className="module-meta-item">
                      <span>{module.questionCount || (module.questionIds && module.questionIds.length) || 0} questions</span>
                    </div>
                    <div className="module-meta-item">
                      <span>{Math.floor(module.timeLimit / 60)} min</span>
                    </div>
                    {module.calculatorAllowed !== undefined && (
                      <div className="module-meta-item">
                        <span>{module.calculatorAllowed ? 'Calculator' : 'No calculator'}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="no-modules">No exam modules found. Switch to the Create Module tab to add one.</div>
            )}
          </div>
        </div>
      )}
      
      {/* Module Details Section (shows when a module is selected) */}
      {activeTab === 'list' && selectedModule && (
        <div className="module-details">
          <div className="module-details-header">
            <h3 className="module-details-title">Module Details: {selectedModule.title}</h3>
            <div className="module-details-actions">
              <button 
                className={`btn ${isReordering ? 'btn-primary' : 'btn-secondary'}`} 
                onClick={toggleReorderingMode}
                disabled={isReversing} // Disable while reversing
              >
                {isReordering ? 'Done Reordering' : 'Reorder Questions'}
              </button>
              <button
                className="btn btn-secondary"
                onClick={handleReverseOrder}
                disabled={isReordering || isReversing || moduleQuestions.length < 2} // Disable if reordering, already reversing, or less than 2 questions
                style={{ marginLeft: '10px' }} // Add some space
              >
                {isReversing ? 'Reversing...' : 'Reverse Order'}
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={() => setSelectedModule(null)}
                style={{ marginLeft: '10px' }} // Add some space
                disabled={isReversing} // Disable while reversing
              >
                Close Details
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleOpenQuestionSelection}
                disabled={isLoading} // Disable while loading
                title="Add More Questions to this Module"
               >
                 Add Questions
               </button>
            </div>
          </div>
          
          <div className="module-info">
            <div className="module-metadata">
              <div className="metadata-item">
                <strong>Module Number:</strong> {selectedModule.moduleNumber}
              </div>
              <div className="metadata-item">
                <strong>Question Count:</strong> {moduleQuestions.length}
              </div>
              <div className="metadata-item">
                <strong>Time Limit:</strong> {Math.floor(selectedModule.timeLimit / 60)} minutes
              </div>
              <div className="metadata-item">
                <strong>Calculator:</strong> {selectedModule.calculatorAllowed ? 'Allowed' : 'Not allowed'}
              </div>
              {selectedModule.difficultyRange && (
                <div className="metadata-item">
                  <strong>Difficulty Range:</strong> {selectedModule.difficultyRange.min} - {selectedModule.difficultyRange.max}
                </div>
              )}
            </div>
          </div>
          
          {isLoading ? (
            <div className="loading">Loading questions...</div>
          ) : moduleQuestions.length > 0 ? (
            <div className="module-questions">
              <h4>Questions in this Module</h4>
              <div className="module-questions-header">
                {isReordering && (
                  <div className="reordering-instructions">
                    <p>Drag and drop questions to reorder them. Click "Done Reordering" when finished.</p>
                    {isLoading && <div className="loading-indicator">Saving new order...</div>}
                  </div>
                )}
              </div>
              <table className="questions-table">
                <thead>
                  <tr>
                    <th className="question-number-cell">#</th>
                    <th className="question-text-cell">Question</th>
                    <th>Subcategory</th>
                    <th>Details</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {moduleQuestions.map((question, index) => (
                    <tr 
                      key={question.id}
                      draggable={isReordering}
                      onDragStart={(e) => handleDragStart(e, question, index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                      onDrop={(e) => handleDrop(e, index)}
                      className={`question-row ${isReordering ? 'draggable' : ''} ${dropTargetIndex === index ? 'drop-target' : ''} ${draggedQuestion && draggedQuestion.question.id === question.id ? 'dragged' : ''}`}
                    >
                      <td className="question-number-cell">
                        <div className="question-number-badge">
                          {isReordering ? <span className="drag-handle">⋮⋮</span> : index + 1}
                        </div>
                      </td>
                      <td className="question-text-cell">
                        <div 
                          className="question-text" 
                          onClick={(event) => !isReordering && handleViewFullQuestion(question, event)}
                          style={{ cursor: isReordering ? 'move' : 'pointer' }}
                        >
                          {question.text}
                          {!isReordering && <div className="question-view-hint">(Click to view full question)</div>}
                        </div>
                      </td>
                      <td className="subcategory-cell">
                        {(() => {
                          // Determine subcategory display text and subject area
                          let subcategoryText = '';
                          let subjectArea = '';
                          
                          // Direct access to subcategory fields stored in different formats
                          if (question.subcategoryId) {
                            // If numeric ID available directly, use it (most reliable)
                            subcategoryText = getSubcategoryName(question.subcategoryId);
                            const subject = getSubcategorySubject(question.subcategoryId);
                            subjectArea = subject === 1 ? 'reading-writing' : 'math';
                            console.log(`Using subcategoryId ${question.subcategoryId} -> ${subcategoryText}`);
                          } else if (question.subcategoryName) {
                            // If human-readable name available directly
                            subcategoryText = question.subcategoryName;
                            // Try to get the ID to determine subject area
                            const subcategoryId = getSubcategoryIdFromString(question.subcategoryName);
                            if (subcategoryId) {
                              const subject = getSubcategorySubject(subcategoryId);
                              subjectArea = subject === 1 ? 'reading-writing' : 'math';
                            }
                            console.log(`Using subcategoryName ${question.subcategoryName}`);
                          } else if (question.subcategory || question.subCategory) {
                            // If kebab-case or other format available
                            const subcategoryId = getSubcategoryIdFromString(question.subcategory || question.subCategory);
                            if (subcategoryId) {
                              subcategoryText = getSubcategoryName(subcategoryId);
                              const subject = getSubcategorySubject(subcategoryId);
                              subjectArea = subject === 1 ? 'reading-writing' : 'math';
                              console.log(`Using subcategory/subCategory ${question.subcategory || question.subCategory} -> ${subcategoryText}`);
                            } else {
                              // Try to use the raw value
                              subcategoryText = question.subcategory || question.subCategory;
                              console.log(`Using raw subcategory ${subcategoryText}`);
                            }
                          } else if (question.categoryPath && typeof question.categoryPath === 'string') {
                            // Extract subcategory from categoryPath
                            const pathParts = question.categoryPath.split('/');
                            subcategoryText = pathParts.length > 1 ? 
                              normalizeSubcategory(pathParts[1], 'readable') : 
                              pathParts[0];
                            
                            // Determine subject area from categoryPath
                            if (pathParts[0] === 'Math') {
                              subjectArea = 'math';
                            } else if (pathParts[0] === 'Reading and Writing' || pathParts[0] === 'Reading & Writing') {
                              subjectArea = 'reading-writing';
                            }
                            console.log(`Derived from categoryPath ${question.categoryPath} -> ${subcategoryText}`);
                          } else {
                            // If no subcategory info found at all
                            console.log(`No subcategory info found in question:`, JSON.stringify(question, null, 2));
                            subcategoryText = 'Unknown';
                          }
                          
                          return (
                            <div className={`subcategory-badge ${subjectArea || ''} ${subcategoryText === 'Unknown' ? 'unknown' : ''}`}>
                              {subcategoryText}
                            </div>
                          );
                        })()} 
                      </td>
                      <td>
                        <div className="question-meta-tags">
                          <span className={`question-meta-tag difficulty-tag-${question.difficulty}`}>
                            Difficulty: {question.difficulty}
                          </span>
                          {question.categoryPath && typeof question.categoryPath === 'string' && (
                            <span className="question-meta-tag">
                              {question.categoryPath.split('/')[0]}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        {!isReordering && (
                          <button 
                            className="btn btn-danger btn-sm" 
                            onClick={() => handleRemoveQuestionFromModule(question.id)}
                            title="Remove question from module"
                          >
                            Remove
                          </button>
                        )}
                        {isReordering && (
                          <div className="reorder-position">{index + 1}</div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="no-questions">No questions in this module.</div>
          )}
        </div>
      )}

      {/* Create Module Tab */}
      {activeTab === 'create' && (
        <div className="form-container">
          <form onSubmit={handleCreateModule}>
            <div className="form-section">
              <h3 className="form-section-title">Basic Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="title">Module Title</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={newModule.title}
                    onChange={handleNewModuleChange}
                    placeholder="Enter a descriptive title"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="moduleNumber">Module Type</label>
                  <select
                    id="moduleNumber"
                    name="moduleNumber"
                    value={newModule.moduleNumber}
                    onChange={handleNewModuleChange}
                    required
                  >
                    <option value="1">Module 1 (Reading & Writing)</option>
                    <option value="2">Module 2 (Reading & Writing)</option>
                    <option value="3">Module 3 (Math - No Calculator)</option>
                    <option value="4">Module 4 (Math - Calculator)</option>
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={newModule.description}
                  onChange={handleNewModuleChange}
                  placeholder="Describe the purpose and content of this module"
                  rows="3"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="questionCount">Question Count</label>
                  <input
                    type="number"
                    id="questionCount"
                    name="questionCount"
                    min="1"
                    value={newModule.questionCount}
                    onChange={handleNewModuleChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="timeLimit">Time Limit (minutes)</label>
                  <input
                    type="number"
                    id="timeLimit"
                    name="timeLimit"
                    min="1"
                    value={Math.floor(newModule.timeLimit / 60)}
                    onChange={(e) => handleNewModuleChange({
                      ...e,
                      target: {
                        ...e.target,
                        name: 'timeLimit',
                        value: parseInt(e.target.value, 10) * 60
                      }
                    })}
                    required
                  />
                </div>
              </div>
            </div>
            
            <div className="form-section">
              <h3 className="form-section-title">Difficulty Settings</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="difficultyRange.min">Minimum Difficulty (1-5)</label>
                  <input
                    type="number"
                    id="difficultyRange.min"
                    name="difficultyRange.min"
                    min="1"
                    max="5"
                    value={newModule.difficultyRange.min}
                    onChange={handleNewModuleChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="difficultyRange.max">Maximum Difficulty (1-5)</label>
                  <input
                    type="number"
                    id="difficultyRange.max"
                    name="difficultyRange.max"
                    min="1"
                    max="5"
                    value={newModule.difficultyRange.max}
                    onChange={handleNewModuleChange}
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <div className="checkbox-wrapper">
                  <input
                    type="checkbox"
                    id="calculatorAllowed"
                    name="calculatorAllowed"
                    checked={newModule.calculatorAllowed}
                    onChange={handleNewModuleChange}
                  />
                  <label htmlFor="calculatorAllowed">Calculator Allowed</label>
                </div>
              </div>
            </div>
            
            <div className="form-section">
              <h3 className="form-section-title">Questions</h3>
              <div className="selected-questions-summary">
                <p><strong>{newModule.questionIds.length}</strong> questions selected</p>
                {newModule.questionIds.length > 0 ? (
                  <div className="selected-questions-list">
                    {newModule.questionIds.map((questionId, index) => (
                      <div key={questionId} className="selected-question-item">
                        <span className="question-index">{index + 1}</span>
                        <span className="question-id">{questionId}</span>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm btn-action"
                          onClick={() => handleRemoveQuestion(questionId)}
                          title="Remove question"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-questions">No questions selected yet. Use the button below to browse and add questions.</div>
                )}
              </div>
              
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleOpenQuestionSelection}
              >
                Browse and Add Questions
              </button>
            </div>
            
            <div className="actions-group">
              <button type="submit" className="btn btn-primary" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Module'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setActiveTab('list')}>
                Cancel
              </button>
            </div>
            
            {newModule.questionIds.length === 0 && (
              <div className="warning-message">Please add at least one question to create a module.</div>
            )}
          </form>
        </div>
      )}
      
      {/* Generate Module Tab */}
      {activeTab === 'generate' && (
        <div className="form-container">
          <form onSubmit={handleGenerateModule}>
            <div className="form-section">
              <h3 className="form-section-title">Generate Module Automatically</h3>
              <p>Create a new module by automatically selecting questions that match your criteria.</p>
            </div>
            
            <div className="form-section">
              <h3 className="form-section-title">Module Settings</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="gen-moduleNumber">Module Type</label>
                  <select
                    id="gen-moduleNumber"
                    name="moduleNumber"
                    value={generationCriteria.moduleNumber}
                    onChange={handleGenerationCriteriaChange}
                    required
                  >
                    <option value="1">Module 1 (Reading & Writing)</option>
                    <option value="2">Module 2 (Reading & Writing)</option>
                    <option value="3">Module 3 (Math - No Calculator)</option>
                    <option value="4">Module 4 (Math - Calculator)</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="gen-questionCount">Question Count</label>
                  <input
                    type="number"
                    id="gen-questionCount"
                    name="questionCount"
                    min="1"
                    value={generationCriteria.questionCount}
                    onChange={handleGenerationCriteriaChange}
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="gen-timeLimit">Time Limit (minutes)</label>
                  <input
                    type="number"
                    id="gen-timeLimit"
                    name="timeLimit"
                    min="1"
                    value={Math.floor(generationCriteria.timeLimit / 60)}
                    onChange={(e) => handleGenerationCriteriaChange({
                      ...e,
                      target: {
                        ...e.target,
                        name: 'timeLimit',
                        value: parseInt(e.target.value, 10) * 60
                      }
                    })}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <div className="checkbox-wrapper">
                    <input
                      type="checkbox"
                      id="gen-calculatorAllowed"
                      name="calculatorAllowed"
                      checked={generationCriteria.calculatorAllowed}
                      onChange={handleGenerationCriteriaChange}
                    />
                    <label htmlFor="gen-calculatorAllowed">Calculator Allowed</label>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="form-section">
              <h3 className="form-section-title">Question Selection Criteria</h3>
              
              <div className="form-group">
                <label htmlFor="gen-categoryPaths">Categories (select multiple)</label>
                <select
                  id="gen-categoryPaths"
                  name="categoryPaths"
                  multiple
                  value={generationCriteria.categoryPaths}
                  onChange={handleGenerationCriteriaChange}
                  className="category-select"
                >
                  {Object.entries(availableSubcategories).map(([subject, subcategories]) => (
                    <optgroup key={subject} label={subject}>
                      {subcategories.map(subcategory => (
                        <option key={`${subject}-${subcategory}`} value={subcategory}>
                          {subcategory}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <small className="form-help-text">Hold Ctrl (or Cmd) to select multiple categories</small>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="gen-difficultyRange.min">Minimum Difficulty (1-5)</label>
                  <input
                    type="number"
                    id="gen-difficultyRange.min"
                    name="difficultyRange.min"
                    min="1"
                    max="5"
                    value={generationCriteria.difficultyRange.min}
                    onChange={handleGenerationCriteriaChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="gen-difficultyRange.max">Maximum Difficulty (1-5)</label>
                  <input
                    type="number"
                    id="gen-difficultyRange.max"
                    name="difficultyRange.max"
                    min="1"
                    max="5"
                    value={generationCriteria.difficultyRange.max}
                    onChange={handleGenerationCriteriaChange}
                    required
                  />
                </div>
              </div>
            </div>
            
            <div className="actions-group">
              <button type="submit" className="btn btn-primary" disabled={isGenerating}>
                {isGenerating ? 'Generating...' : 'Generate Module'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setActiveTab('list')}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Question Selection Modal */}
      {questionSelectionOpen && (
        <div className="question-selection-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Select Questions</h3>
              <button 
                type="button" 
                className="btn btn-action close-modal"
                onClick={() => setQuestionSelectionOpen(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              {/* Selection Mode Tabs */}
              <div className="selection-mode-tabs">
                <button 
                  className={`mode-tab ${selectionMode === 'date' ? 'active' : ''}`}
                  onClick={() => {
                    setSelectionMode('date');
                    fetchRecentQuestions();
                  }}
                >
                  By Date
                </button>
                <button 
                  className={`mode-tab ${selectionMode === 'subcategory' ? 'active' : ''}`}
                  onClick={() => {
                    setSelectionMode('subcategory');
                    setSelectedCategory(''); // Reset selected category
                    setCategoryQuestions([]); // Clear questions
                  }}
                >
                  By Subcategory
                </button>
              </div>
              
              {/* Date-based Selection View */}
              {selectionMode === 'date' && (
                <div className="date-selection">
                  <div className="date-selection-header">
                    <h4>Most Recent Questions</h4>
                    {isLoadingQuestions ? (
                      <div className="loading-indicator">Loading questions...</div>
                    ) : (
                      <div className="question-count">{categoryQuestions.length} questions found</div>
                    )}
                  </div>
                  
                  <div className="bulk-selection-actions">
                    <button 
                      className="btn btn-secondary"
                      onClick={() => {
                        // Select all questions if not all are selected, otherwise deselect all
                        if (selectedQuestions.length < categoryQuestions.length) {
                          setSelectedQuestions(categoryQuestions.map(q => q.id));
                        } else {
                          setSelectedQuestions([]);
                        }
                      }}
                    >
                      {selectedQuestions.length < categoryQuestions.length ? 'Select All' : 'Deselect All'}
                    </button>
                    
                    {categoryQuestions.length > 0 && (
                      <div className="select-recent">
                        <button 
                          className="btn btn-secondary"
                          onClick={() => {
                            // Select the 27 most recent questions (or all if less than 27)
                            const count = Math.min(27, categoryQuestions.length);
                            setSelectedQuestions(categoryQuestions.slice(0, count).map(q => q.id));
                          }}
                        >
                          Select Latest 27
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Subcategory-based Selection View */}
              {selectionMode === 'subcategory' && (
                <>
                  <div className="subject-tabs">
                    <button 
                      className={`subject-tab ${selectedSubjectArea === 'Math' ? 'active' : ''}`}
                      onClick={() => setSelectedSubjectArea('Math')}
                    >
                      Math
                    </button>
                    <button 
                      className={`subject-tab ${selectedSubjectArea === 'Reading and Writing' ? 'active' : ''}`}
                      onClick={() => setSelectedSubjectArea('Reading and Writing')}
                    >
                      Reading & Writing
                    </button>
                  </div>
                  
                  <div className="category-selection">
                    <h4>Select a Subcategory</h4>
                    <div className="category-buttons">
                      {availableSubcategories[selectedSubjectArea].map((subcategory) => (
                        <button
                          key={subcategory}
                          type="button"
                          className={`category-button ${selectedCategory === subcategory ? 'active' : ''}`}
                          onClick={() => handleSelectCategory(subcategory)}
                        >
                          {subcategory}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
              
              {/* Question Browser (common for both modes) */}
              <div className="question-browser">
                <div className="question-browser-header">
                  <h4>
                    {selectionMode === 'date' 
                      ? 'Questions by Date (Newest First)' 
                      : `Questions for ${selectedCategory || 'selected category'}`}
                  </h4>
                  {isLoadingQuestions && <div className="loading-indicator">Loading...</div>}
                </div>
                
                {categoryQuestions.length > 0 ? (
                  <div style={{
                    marginTop: '15px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '6px',
                    maxHeight: '700px',
                    width: '100%'
                  }}>
                    <div style={{
                      overflowX: 'auto',
                      overflowY: 'auto',
                      maxHeight: '700px',
                      width: '100%'
                    }}>
                      <table style={{
                        width: 'auto',
                        minWidth: '1400px',
                        borderCollapse: 'collapse',
                        fontSize: '14px'
                      }}>
                        <thead>
                          <tr>
                            <th style={{width: '50px'}}><input 
                              type="checkbox" 
                              onChange={() => {
                                if (selectedQuestions.length < categoryQuestions.length) {
                                  setSelectedQuestions(categoryQuestions.map(q => q.id));
                                } else {
                                  setSelectedQuestions([]);
                                }
                              }}
                              checked={selectedQuestions.length === categoryQuestions.length && categoryQuestions.length > 0}
                            /></th>
                            <th style={{minWidth: '500px', width: '500px', maxWidth: '500px'}}>Question Text</th>
                            <th style={{minWidth: '250px', width: '250px'}}>Subcategory</th>
                            <th style={{minWidth: '120px', width: '120px', textAlign: 'center'}}>Difficulty</th>
                            <th style={{minWidth: '200px', width: '200px'}}>Created</th>
                            <th style={{minWidth: '120px', width: '120px'}}>Status</th>
                          </tr>
                        </thead>
                      <tbody>
                        {categoryQuestions.map((question, index) => (
                          <tr key={question.id} style={{
                            backgroundColor: selectedQuestions.includes(question.id) ? '#e6f7ff' : 
                                             index % 2 === 0 ? '#ffffff' : '#f9f9f9',
                            ':hover': {backgroundColor: '#f0f0f0'},
                            border: '1px solid #eee'
                          }}>
                            <td style={{textAlign: 'center', padding: '10px'}}>
                              <input
                                type="checkbox"
                                checked={selectedQuestions.includes(question.id)}
                                onChange={() => handleQuestionSelect(question.id)}
                                style={{width: '16px', height: '16px'}}
                              />
                            </td>
                            <td style={{padding: '10px', maxWidth: '500px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                              {question.text}
                            </td>
                            <td style={{padding: '10px', maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                              {question.subcategory || 
                               (question.categoryPath && typeof question.categoryPath === 'string' ? question.categoryPath : 
                               (question.categoryPath && Array.isArray(question.categoryPath) && question.categoryPath.length > 0 ? 
                                 question.categoryPath[question.categoryPath.length - 1] : 
                                 (question.subCategory || 'Unknown')))
                              }
                            </td>
                            <td style={{textAlign: 'center', padding: '10px'}}>
                              <span style={{
                                display: 'inline-block',
                                padding: '4px 8px',
                                borderRadius: '12px',
                                fontWeight: '500',
                                fontSize: '13px',
                                backgroundColor: question.difficulty <= 2 ? '#e3f2fd' : 
                                               question.difficulty === 3 ? '#fff8e1' : 
                                               question.difficulty >= 4 ? '#ffebee' : '#f5f5f5',
                                color: question.difficulty <= 2 ? '#1565c0' : 
                                       question.difficulty === 3 ? '#ff8f00' : 
                                       question.difficulty >= 4 ? '#c62828' : '#333'
                              }}>{question.difficulty}</span>
                            </td>
                            <td style={{padding: '10px', fontSize: '15px'}}>
                              {question.createdAt ? (
                                question.createdAt.toDate ? 
                                  question.createdAt.toDate().toLocaleDateString() : 
                                  'Unknown'
                              ) : 'Unknown'}
                            </td>
                            <td style={{padding: '10px', textAlign: 'center'}}>
                              {newModule.questionIds.includes(question.id) ? (
                                <span style={{
                                  display: 'inline-block',
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  fontSize: '12px',
                                  fontWeight: '500',
                                  backgroundColor: '#e8f5e9',
                                  color: '#2e7d32'
                                }}>Already Added</span>
                              ) : null}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      </table>
                    </div>
                  </div>
                ) : selectionMode === 'subcategory' && selectedCategory ? (
                  <div className="no-questions-found">
                    No questions found for this subcategory. Select another subcategory or add new questions.
                  </div>
                ) : selectionMode === 'subcategory' ? (
                  <div className="select-category-prompt">
                    Select a subcategory to view questions.
                  </div>
                ) : (
                  <div className="loading-indicator">Loading questions...</div>
                )}
              </div>
            </div>
            
            <div className="modal-footer">
              <div className="selected-count">
                Selected: <strong>{selectedQuestions.length}</strong> questions
              </div>
              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setQuestionSelectionOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={handleAddSelectedQuestions}
                  disabled={selectedQuestions.length === 0}
                >
                  Add Selected Questions
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Question Selection Modal closing tags */}

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Confirm Deletion</h3>
              <button 
                className="btn-close" 
                onClick={cancelDeleteModule}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete the module <strong>{moduleToDelete?.title}</strong>?</p>
              <p>This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-danger" 
                onClick={handleDeleteModule}
                disabled={isLoading}
              >
                {isLoading ? 'Deleting...' : 'Delete Module'}
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={cancelDeleteModule}
                disabled={isLoading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Question Detail Modal */}
      {questionModalOpen && selectedQuestion && (
        <div 
          className="modal question-detail-modal"
          style={{
            position: 'absolute',
            top: `${modalPosition.top}px`,
            left: `${modalPosition.left}px`,
            zIndex: 1050,
            maxHeight: '80vh',
            overflowY: 'auto'
          }}
        >
          <div className="modal-content large-modal">
            <div className="modal-header">
              <h3>Question Details</h3>
              <button 
                className="btn-close" 
                onClick={() => {
                  setQuestionModalOpen(false);
                  setSelectedQuestion(null);
                }}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="question-full-content">
                <div className="question-metadata">
                  <div className="metadata-item">
                    <strong>ID:</strong> {selectedQuestion.id}
                  </div>
                  <div className="metadata-item">
                    <strong>Difficulty:</strong> 
                    <span className={`difficulty-tag-${selectedQuestion.difficulty}`}>
                      {selectedQuestion.difficulty}
                    </span>
                  </div>
                  {selectedQuestion.subcategory && (
                    <div className="metadata-item">
                      <strong>Subcategory:</strong> {selectedQuestion.subcategory}
                    </div>
                  )}
                  {selectedQuestion.categoryPath && (
                    <div className="metadata-item">
                      <strong>Category Path:</strong> {selectedQuestion.categoryPath}
                    </div>
                  )}
                </div>
                
                <div className="question-content">
                  <h4>Question Text</h4>
                  <div className="question-text-full">{selectedQuestion.text}</div>
                  
                  {selectedQuestion.passageText && (
                    <div className="question-passage">
                      <h4>Passage</h4>
                      <div className="passage-text">{selectedQuestion.passageText}</div>
                    </div>
                  )}
                  
                  <h4>Answer Choices</h4>
                  <div className="answer-choices">
                    {selectedQuestion.options && selectedQuestion.options.map((option, index) => (
                      <div 
                        key={index} 
                        className={`answer-choice ${selectedQuestion.correctAnswer === option ? 'correct-answer' : ''}`}
                      >
                        <div className="option-letter">{String.fromCharCode(65 + index)}</div>
                        <div className="option-text">{option}</div>
                        {selectedQuestion.correctAnswer === option && (
                          <div className="correct-indicator">✓ Correct Answer</div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {selectedQuestion.explanation && (
                    <div className="explanation">
                      <h4>Explanation</h4>
                      <div className="explanation-text">{selectedQuestion.explanation}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-secondary" 
                onClick={() => {
                  setQuestionModalOpen(false);
                  setSelectedQuestion(null);
                }}
              >
                Close
              </button>
              <button 
                className="btn btn-danger" 
                onClick={() => {
                  handleRemoveQuestionFromModule(selectedQuestion.id);
                  setQuestionModalOpen(false);
                  setSelectedQuestion(null);
                }}
              >
                Remove from Module
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamModuleManager;
