import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PracticeExamManager from '../components/PracticeExamManager';
import '../styles/AdminPages.css';

const PracticeExamManagerPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Go back to the admin dashboard
  const handleBackToAdmin = () => {
    navigate('/admin');
  };

  return (
    <div className="admin-page practice-exam-manager-page">
      <div className="admin-page-header">
        <div className="header-left">
          <button className="back-button" onClick={handleBackToAdmin}>
            &larr; Back to Admin
          </button>
        </div>
        <h1>Practice Exam Manager</h1>
        <div className="header-right">
          <div className="user-info">
            {currentUser && <span>{currentUser.email}</span>}
          </div>
        </div>
      </div>

      <div className="admin-page-content">
        <div className="page-description">
          <p>Create and manage practice exams by combining existing exam modules. Practice exams can be published for students to access.</p>
        </div>
        
        <PracticeExamManager />
      </div>
    </div>
  );
};

export default PracticeExamManagerPage;
