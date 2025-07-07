
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import './AuthNoticePage.css';

const pageInfo = {
  '/progress': {
    title: 'Track Your Progress',
    message: 'Please log in to see your progress dashboard. Your performance on quizzes and practice exams will be available here.',
  },
  '/practice-exams': {
    title: 'Access Practice Exams',
    message: 'Please log in to access a wide range of practice exams. Sharpen your skills and get ready for the test.',
  },
  '/subject-quizzes': {
    title: 'Test Your Knowledge with Quizzes',
    message: 'Please log in to take quizzes on various subjects. Challenge yourself and improve your understanding.',
  },
  '/word-bank': {
    title: 'Manage Your Word Bank',
    message: 'Please log in to see your Word Bank. Your personal collection of saved vocabulary words will be available here.',
  },
  '/all-results': {
    title: 'View Your Exam Results',
    message: 'Please log in to see your exam results. Analyze your performance and identify areas for improvement.',
  },
};

const AuthNoticePage = () => {
  const location = useLocation();
  const { from } = location.state || { from: { pathname: '/' } };
  const info = pageInfo[from.pathname] || {
    title: 'Authentication Required',
    message: 'Please log in to access this page.',
  };

  return (
    <div className="auth-notice-container">
      <div className="auth-notice-card">
        <h2>{info.title}</h2>
        <p>{info.message}</p>
        <Link to="/login" className="login-button">
          Log In
        </Link>
      </div>
    </div>
  );
};

export default AuthNoticePage;
