import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getAllPracticeExams, 
  getPracticeExamModules 
} from '../firebase/services';
import '../styles/PracticeExamList.css';

const PracticeExamList = () => {
  const [practiceExams, setPracticeExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [examModules, setExamModules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();

  // Fetch all public practice exams on component mount
  useEffect(() => {
    fetchPracticeExams();
  }, []);

  // Fetch practice exams that are marked as public
  const fetchPracticeExams = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Only fetch exams marked as public for the public listing
      const exams = await getAllPracticeExams(true);
      setPracticeExams(exams);
      setIsLoading(false);
    } catch (err) {
      setError('Failed to load practice exams: ' + err.message);
      setIsLoading(false);
    }
  };

  // Handle exam selection
  const handleSelectExam = async (exam) => {
    try {
      setIsLoading(true);
      setSelectedExam(exam);
      
      // Fetch all modules for the selected exam
      const modules = await getPracticeExamModules(exam.id);
      setExamModules(modules);
      
      setIsLoading(false);
    } catch (err) {
      setError('Failed to load exam details: ' + err.message);
      setIsLoading(false);
    }
  };

  // Handle start practice exam
  const handleStartExam = () => {
    if (!selectedExam) return;
    
    // Store the selected exam ID and modules in session storage for the exam page
    sessionStorage.setItem('currentPracticeExam', JSON.stringify({
      examId: selectedExam.id,
      title: selectedExam.title,
      description: selectedExam.description,
      moduleIds: selectedExam.moduleIds
    }));
    
    // Navigate to the exam page
    navigate('/practice-exam/' + selectedExam.id);
  };

  // Calculate total exam stats
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

  return (
    <div className="practice-exam-list-page">
      <div className="page-container">
        <header className="page-header">
          <h1>SAT Practice Exams</h1>
          <p className="header-subtitle">
            Choose from our collection of carefully crafted practice exams designed to help you prepare for the SAT
          </p>
        </header>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="exam-selection-container">
          <div className="exam-list-section">
            <h2>Available Practice Exams</h2>
            {isLoading && !practiceExams.length ? (
              <div className="loading-spinner">
                <div className="spinner"></div>
                <p>Loading practice exams...</p>
              </div>
            ) : practiceExams.length > 0 ? (
              <div className="exam-cards">
                {practiceExams.map((exam) => (
                  <div 
                    key={exam.id}
                    className={`exam-card ${selectedExam && selectedExam.id === exam.id ? 'selected' : ''}`}
                    onClick={() => handleSelectExam(exam)}
                  >
                    <h3>{exam.title}</h3>
                    <p className="exam-description">{exam.description}</p>
                    <div className="exam-meta">
                      <span className="module-count">{exam.moduleIds?.length || 0} Modules</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-exams-message">
                <p>No practice exams are currently available.</p>
                <p>Please check back later for new content.</p>
              </div>
            )}
          </div>
          
          <div className="exam-details-section">
            {selectedExam ? (
              <>
                <h2>{selectedExam.title}</h2>
                <div className="exam-details-card">
                  <p className="exam-full-description">{selectedExam.description}</p>
                  
                  {isLoading ? (
                    <div className="loading-spinner">
                      <div className="spinner"></div>
                      <p>Loading exam details...</p>
                    </div>
                  ) : examModules.length > 0 ? (
                    <>
                      <div className="exam-stats">
                        {(() => {
                          const { totalQuestions, totalTime } = calculateExamStats(examModules);
                          return (
                            <>
                              <div className="stat-item">
                                <span className="stat-value">{totalQuestions}</span>
                                <span className="stat-label">Questions</span>
                              </div>
                              <div className="stat-divider"></div>
                              <div className="stat-item">
                                <span className="stat-value">{Math.floor(totalTime / 60)}</span>
                                <span className="stat-label">Minutes</span>
                              </div>
                              <div className="stat-divider"></div>
                              <div className="stat-item">
                                <span className="stat-value">{examModules.length}</span>
                                <span className="stat-label">Modules</span>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                      
                      <h3>What's Included</h3>
                      <div className="module-list">
                        {examModules.map((module, index) => (
                          <div key={module.id} className="module-item">
                            <div className="module-icon">
                              <span>{module.moduleNumber}</span>
                            </div>
                            <div className="module-details">
                              <h4>{module.title}</h4>
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
                          </div>
                        ))}
                      </div>
                      
                      <div className="exam-action">
                        <button 
                          className="start-exam-button"
                          onClick={handleStartExam}
                        >
                          Start Practice Exam
                        </button>
                      </div>
                    </>
                  ) : (
                    <p className="no-modules-message">This practice exam has no modules. Please select another exam.</p>
                  )}
                </div>
              </>
            ) : (
              <div className="select-prompt">
                <div className="select-icon">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 14L12 9L17 14" stroke="#90CAF9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3>Select a Practice Exam</h3>
                <p>Choose a practice exam from the list to view details and get started</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PracticeExamList;
