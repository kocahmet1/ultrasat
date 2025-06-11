import React, { useState, useEffect } from 'react';
import { 
  getAllExamModules,
  createPracticeExam,
  getAllPracticeExams,
  updatePracticeExam,
  deletePracticeExam,
  getPracticeExamModules
} from '../firebase/services';
import '../styles/PracticeExamManager.css';

const PracticeExamManager = () => {
  // State for managing practice exams
  const [practiceExams, setPracticeExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [examModules, setExamModules] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // State for exam creation form
  const [availableModules, setAvailableModules] = useState([]);
  const [newExam, setNewExam] = useState({
    title: '',
    description: '',
    moduleIds: [],
    isPublic: true
  });
  
  // State for edit mode
  const [isEditMode, setIsEditMode] = useState(false);

  // Fetch practice exams and available modules when component mounts
  useEffect(() => {
    fetchPracticeExams();
    fetchAvailableModules();
  }, []);

  // Fetch all practice exams
  const fetchPracticeExams = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Fetching practice exams...');
      const exams = await getAllPracticeExams();
      console.log('Practice exams fetched:', exams);
      setPracticeExams(exams);
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching practice exams:', err);
      setError('Failed to load practice exams: ' + err.message);
      setIsLoading(false);
    }
  };

  // Fetch all available exam modules
  const fetchAvailableModules = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching available modules...');
      const modules = await getAllExamModules();
      console.log('Available modules fetched:', modules);
      setAvailableModules(modules);
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching available modules:', err);
      setError('Failed to load exam modules: ' + err.message);
      setIsLoading(false);
    }
  };

  // Handle practice exam selection
  const handleSelectExam = async (exam) => {
    try {
      setIsLoading(true);
      setSelectedExam(exam);
      
      // Fetch the modules for this exam
      const modules = await getPracticeExamModules(exam.id);
      setExamModules(modules);
      
      setIsLoading(false);
    } catch (err) {
      setError('Failed to load exam details: ' + err.message);
      setIsLoading(false);
    }
  };

  // Handle new exam form changes
  const handleNewExamChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setNewExam((prev) => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setNewExam((prev) => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle module selection for the new exam
  const handleModuleSelection = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setNewExam((prev) => ({
      ...prev,
      moduleIds: selectedOptions
    }));
  };

  // Handle create practice exam
  const handleCreateExam = async (e) => {
    e.preventDefault();
    
    if (newExam.moduleIds.length === 0) {
      setError('Please select at least one module for the practice exam');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      if (isEditMode && selectedExam) {
        // Update existing exam
        await updatePracticeExam(selectedExam.id, newExam);
        setIsEditMode(false);
      } else {
        // Create new exam
        await createPracticeExam(newExam);
      }
      
      // Reset form and refresh
      setNewExam({
        title: '',
        description: '',
        moduleIds: [],
        isPublic: true
      });
      
      await fetchPracticeExams();
      setIsLoading(false);
    } catch (err) {
      setError('Failed to create practice exam: ' + err.message);
      setIsLoading(false);
    }
  };

  // Handle edit exam
  const handleEditExam = (exam) => {
    setNewExam({
      title: exam.title,
      description: exam.description,
      moduleIds: exam.moduleIds || [],
      isPublic: exam.isPublic
    });
    setSelectedExam(exam);
    setIsEditMode(true);
  };

  // Handle delete exam
  const handleDeleteExam = async (examId) => {
    if (!window.confirm('Are you sure you want to delete this practice exam?')) {
      return;
    }
    
    try {
      setIsLoading(true);
      await deletePracticeExam(examId);
      
      // Reset selected exam if it was deleted
      if (selectedExam && selectedExam.id === examId) {
        setSelectedExam(null);
        setExamModules([]);
      }
      
      await fetchPracticeExams();
      setIsLoading(false);
    } catch (err) {
      setError('Failed to delete practice exam: ' + err.message);
      setIsLoading(false);
    }
  };

  // Cancel edit mode
  const handleCancelEdit = () => {
    setIsEditMode(false);
    setNewExam({
      title: '',
      description: '',
      moduleIds: [],
      isPublic: true
    });
  };
  
  // Calculate total questions and time for a practice exam
  const calculateExamStats = (modules) => {
    return modules.reduce((acc, module) => {
      const questionCount = module.questionCount || (module.questionIds ? module.questionIds.length : 0);
      const timeLimit = module.timeLimit || 1920; // Default to 32 minutes if not specified
      
      return {
        totalQuestions: acc.totalQuestions + questionCount,
        totalTime: acc.totalTime + timeLimit
      };
    }, { totalQuestions: 0, totalTime: 0 });
  };

  // Format time in minutes and seconds
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="practice-exam-manager">
      <h2>Practice Exam Manager</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="manager-container">
        <div className="exam-list-section">
          <h3>Existing Practice Exams</h3>
          {isLoading && !practiceExams.length ? (
            <div className="loading">Loading practice exams...</div>
          ) : practiceExams.length > 0 ? (
            <div className="exam-list">
              {practiceExams.map((exam) => (
                <div 
                  key={exam.id}
                  className={`exam-card ${selectedExam && selectedExam.id === exam.id ? 'selected' : ''}`}
                >
                  <div className="exam-card-header">
                    <h4 onClick={() => handleSelectExam(exam)}>{exam.title}</h4>
                    <div className="exam-actions">
                      <button 
                        type="button" 
                        className="edit-button"
                        onClick={() => handleEditExam(exam)}
                        title="Edit Exam"
                      >
                        ✏️
                      </button>
                      <button 
                        type="button" 
                        className="delete-button"
                        onClick={() => handleDeleteExam(exam.id)}
                        title="Delete Exam"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  <p className="exam-description">{exam.description}</p>
                  <div className="exam-meta">
                    <span>{exam.moduleIds?.length || 0} modules</span>
                    <span className={exam.isPublic ? 'status-public' : 'status-private'}>
                      {exam.isPublic ? 'Public' : 'Private'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-exams">No practice exams found. Create one below.</div>
          )}
        </div>
        
        <div className="exam-details-section">
          {selectedExam ? (
            <>
              <h3>Practice Exam Details: {selectedExam.title}</h3>
              {isLoading ? (
                <div className="loading">Loading modules...</div>
              ) : (
                <>
                  <div className="exam-info">
                    <p><strong>Description:</strong> {selectedExam.description}</p>
                    <p>
                      <strong>Status:</strong> 
                      <span className={selectedExam.isPublic ? 'status-public' : 'status-private'}>
                        {selectedExam.isPublic ? 'Public' : 'Private'}
                      </span>
                    </p>
                    
                    {examModules.length > 0 && (
                      <>
                        <div className="exam-stats">
                          {(() => {
                            const { totalQuestions, totalTime } = calculateExamStats(examModules);
                            return (
                              <>
                                <div className="stat-item">
                                  <span className="stat-label">Total Questions</span>
                                  <span className="stat-value">{totalQuestions}</span>
                                </div>
                                <div className="stat-item">
                                  <span className="stat-label">Total Time</span>
                                  <span className="stat-value">{Math.floor(totalTime / 60)} minutes</span>
                                </div>
                              </>
                            );
                          })()}
                        </div>
                        
                        <h4>Included Modules ({examModules.length})</h4>
                        <div className="module-list">
                          {examModules.map((module, index) => (
                            <div key={module.id} className="module-card">
                              <div className="module-header">
                                <h5>{module.title}</h5>
                                <span className="module-number">Module {module.moduleNumber}</span>
                              </div>
                              <p>{module.description}</p>
                              <div className="module-meta">
                                <span>
                                  {module.questionCount || (module.questionIds ? module.questionIds.length : 0)} questions
                                </span>
                                <span>
                                  {Math.floor((module.timeLimit || 1920) / 60)} minutes
                                </span>
                                <span>
                                  {module.calculatorAllowed ? 'Calculator allowed' : 'No calculator'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="no-exam-selected">
              Select a practice exam from the list to view details
            </div>
          )}
        </div>
      </div>
      
      <div className="exam-creation-section">
        <h3>{isEditMode ? 'Edit Practice Exam' : 'Create New Practice Exam'}</h3>
        
        <form onSubmit={handleCreateExam} className="exam-form">
          <div className="form-group">
            <label htmlFor="title">Exam Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={newExam.title}
              onChange={handleNewExamChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={newExam.description}
              onChange={handleNewExamChange}
              rows="3"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="moduleIds">Select Modules</label>
            <select
              id="moduleIds"
              name="moduleIds"
              multiple
              value={newExam.moduleIds}
              onChange={handleModuleSelection}
              required
              size="6"
            >
              {availableModules.map((module) => (
                <option key={module.id} value={module.id}>
                  Module {module.moduleNumber}: {module.title} ({module.questionCount || (module.questionIds ? module.questionIds.length : 0)} questions)
                </option>
              ))}
            </select>
            <small>Hold Ctrl (or Cmd) to select multiple modules</small>
          </div>
          
          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="isPublic"
                checked={newExam.isPublic}
                onChange={handleNewExamChange}
              />
              Make this exam public
            </label>
          </div>
          
          <div className="form-actions">
            {isEditMode && (
              <button 
                type="button" 
                className="secondary-button"
                onClick={handleCancelEdit}
              >
                Cancel
              </button>
            )}
            
            <button 
              type="submit" 
              className="primary-button"
              disabled={isLoading}
            >
              {isLoading 
                ? (isEditMode ? 'Updating...' : 'Creating...') 
                : (isEditMode ? 'Update Exam' : 'Create Exam')}
            </button>
          </div>
          
          {newExam.moduleIds.length === 0 && (
            <div className="warning-message">Please select at least one module for the practice exam.</div>
          )}
        </form>
      </div>
    </div>
  );
};

export default PracticeExamManager;
