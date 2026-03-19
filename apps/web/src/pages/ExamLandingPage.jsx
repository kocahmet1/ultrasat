import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/LandingPage.css';
import { getAllPracticeExams, getPracticeExamModules } from '../firebase/services';

function ExamLandingPage() {
  const navigate = useNavigate();
  const [practiceExams, setPracticeExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState(null);
  const [examDetails, setExamDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch available practice exams
  useEffect(() => {
    const fetchPracticeExams = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Get only public exams for students (true parameter)
        const exams = await getAllPracticeExams(true);
        setPracticeExams(exams);
        
        // If there are exams, select the first one by default
        if (exams.length > 0) {
          setSelectedExamId(exams[0].id);
          // Load the first exam details
          await loadExamDetails(exams[0].id);
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading practice exams:', err);
        setError('Failed to load practice exams. Please try again later.');
        setIsLoading(false);
      }
    };
    
    fetchPracticeExams();
  }, []);
  
  // Load exam details when a different exam is selected
  const loadExamDetails = async (examId) => {
    try {
      setIsLoading(true);
      
      // Get the modules for this exam
      const modules = await getPracticeExamModules(examId);
      
      // Sort modules by moduleNumber
      const sortedModules = [...modules].sort((a, b) => {
        const numA = a.moduleNumber || Infinity; // Assign a large number if moduleNumber is missing
        const numB = b.moduleNumber || Infinity;
        return numA - numB;
      });

      // Calculate the total questions and time using sorted modules
      const examStats = sortedModules.reduce((acc, module) => {
        const questionCount = module.questionCount || (module.questionIds ? module.questionIds.length : 0);
        const timeLimit = module.timeLimit || 1920; // Default to 32 minutes if not specified
        
        return {
          totalQuestions: acc.totalQuestions + questionCount,
          totalTime: acc.totalTime + timeLimit,
        };
      }, { totalQuestions: 0, totalTime: 0 });
      
      setExamDetails({
        ...examStats,
        modules: sortedModules
      });
      
      setIsLoading(false);
    } catch (err) {
      console.error('Error loading exam details:', err);
      setError('Failed to load exam details. Please try again later.');
      setIsLoading(false);
    }
  };
  
  // Handle exam selection change
  const handleExamChange = async (e) => {
    const examId = e.target.value;
    setSelectedExamId(examId);
    await loadExamDetails(examId);
  };
  
  // Start the selected practice exam
  const startExam = () => {
    if (selectedExamId) {
      navigate(`/practice-exam/${selectedExamId}`);
    } else {
      setError('Please select a practice exam first.');
    }
  };

  return (
    <div className="landing-container">
      <div className="landing-content">
        <h1>Digital SAT Practice Exam</h1>
        
        {isLoading ? (
          <div className="loading">Loading practice exams...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : practiceExams.length === 0 ? (
          <div className="no-exams-message">
            <p>No practice exams are currently available.</p>
            <p>Please check back later or contact your instructor.</p>
          </div>
        ) : (
          <>
            <div className="exam-selection">
              <h2>Select a Practice Exam</h2>
              <select 
                value={selectedExamId} 
                onChange={handleExamChange}
                className="exam-select"
              >
                {practiceExams.map(exam => (
                  <option key={exam.id} value={exam.id}>
                    {exam.title}
                  </option>
                ))}
              </select>
              
              {examDetails && (
                <div className="selected-exam-details">
                  <p className="exam-description">{practiceExams.find(e => e.id === selectedExamId)?.description}</p>
                  <div className="exam-stats">
                    <div className="stat">
                      <span className="stat-value">{examDetails.modules.length}</span>
                      <span className="stat-label">Modules</span>
                    </div>
                    <div className="stat">
                      <span className="stat-value">{examDetails.totalQuestions}</span>
                      <span className="stat-label">Questions</span>
                    </div>
                    <div className="stat">
                      <span className="stat-value">{Math.floor(examDetails.totalTime / 60)}</span>
                      <span className="stat-label">Minutes</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {examDetails && (
              <div className="exam-info">
                <h2>Exam Structure</h2>
                <div className="module-info">
                  {examDetails.modules.map((module, index) => (
                    <div key={module.id} className="module">
                      <h3>Module {module.moduleNumber || index + 1}</h3>
                      <p>{module.title}</p>
                      <p>{Math.floor((module.timeLimit || 1920) / 60)} minutes</p>
                    </div>
                  ))}
                  {examDetails.modules.length > 0 && examDetails.modules.length < 4 && (
                    <div className="module intermission">
                      <h3>Break</h3>
                      <p>10 minutes</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div className="instructions">
              <h2>Instructions</h2>
              <ul>
                <li>Each module is timed separately.</li>
                <li>You can mark questions for review and return to them within the same module.</li>
                <li>You can use the cross-out feature to eliminate answer choices.</li>
                <li>You must complete each module in order.</li>
                <li>Once a module is completed, you cannot return to it.</li>
              </ul>
            </div>
          </>
        )}
        
        <div className="button-container">
          <button 
            className="start-exam-button" 
            onClick={startExam}
            disabled={!selectedExamId || isLoading}
          >
            Start Exam
          </button>
          <button className="back-button" onClick={() => navigate('/')}>
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExamLandingPage;
