import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getAllPracticeExams
} from '../firebase/services';
import '../styles/PracticeExamList.css';

const PracticeExamList = () => {
  const [practiceExams, setPracticeExams] = useState([]);
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

  // Handle start practice exam
  const handleStartExam = (exam) => {
    if (!exam) return;
    
    // Store the selected exam ID and modules in session storage for the exam page
    sessionStorage.setItem('currentPracticeExam', JSON.stringify({
      examId: exam.id,
      title: exam.title,
      moduleIds: exam.moduleIds
    }));
    
    // Navigate to the exam page
    navigate('/practice-exam/' + exam.id);
  };

  return (
    <div className="practice-exam-list-page">
      <div className="page-container">
        
        
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
                    className="exam-card"
                    onClick={() => handleStartExam(exam)}
                  >
                    <h3>{exam.title}</h3>
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
        </div>
      </div>
    </div>
  );
};

export default PracticeExamList;
