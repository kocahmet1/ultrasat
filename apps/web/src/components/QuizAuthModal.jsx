import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Modal.css';

const QuizAuthModal = ({ isOpen, onClose, quizPath, quizLabel, quizState }) => {
  const navigate = useNavigate();
  const { signInWithGoogle } = useAuth();

  useEffect(() => {
    if (!isOpen) return;
    // Prefer storing full navigation object if provided
    if (quizState && typeof quizState === 'object') {
      try {
        sessionStorage.setItem('intendedQuizNav', JSON.stringify(quizState));
      } catch (e) {
        console.warn('Failed to store intendedQuizNav, falling back to path:', e);
      }
    } else if (quizPath) {
      sessionStorage.setItem('intendedQuizPath', quizPath);
    }
  }, [isOpen, quizState, quizPath]);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      // Prefer object-based navigation if available
      const navStr = sessionStorage.getItem('intendedQuizNav');
      if (navStr) {
        let navObj;
        try {
          navObj = JSON.parse(navStr);
        } catch (e) {
          console.error('Failed to parse intendedQuizNav:', e);
        }
        sessionStorage.removeItem('intendedQuizNav');
        sessionStorage.removeItem('intendedQuizPath');
        onClose();
        if (navObj && navObj.pathname) {
          navigate(navObj.pathname, { state: navObj.state });
          return;
        }
      }

      const path = quizPath || sessionStorage.getItem('intendedQuizPath') || '/subject-quizzes';
      sessionStorage.removeItem('intendedQuizPath');
      onClose();
      navigate(path);
    } catch (error) {
      console.error('Failed to sign in with Google:', error);
    }
  };

  const handleLogin = () => {
    onClose();
    // Pass along nav object if available
    const navObj = quizState && typeof quizState === 'object' 
      ? quizState 
      : (quizPath ? { pathname: quizPath } : undefined);
    navigate('/login', { state: { from: 'quiz', quizPath, quizNav: navObj } });
  };

  const handleSignup = () => {
    onClose();
    const navObj = quizState && typeof quizState === 'object' 
      ? quizState 
      : (quizPath ? { pathname: quizPath } : undefined);
    navigate('/signup', { state: { from: 'quiz', quizPath, quizNav: navObj } });
  };

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-container" style={{ maxWidth: '450px' }}>
        <div className="modal-header">
          <h3>Login to Start Quiz</h3>
          <button className="modal-close-button" onClick={onClose}>×</button>
        </div>
        <div className="modal-content">
          <div className="exam-auth-modal-content">
            <p className="exam-auth-description">
              {quizLabel ? `${quizLabel} quiz` : 'The quiz'} will start as soon as you login.
            </p>

            <div className="google-signin-container" style={{ marginBottom: '20px' }}>
              <button
                type="button"
                className="auth-button google-signin full-width"
                onClick={handleGoogleSignIn}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  padding: '12px 20px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  backgroundColor: 'white',
                  color: '#333',
                  fontSize: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <span className="google-icon-wrapper">
                  <svg className="google-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 48 48">
                    <g>
                      <path fill="#4285F4" d="M24 9.5c3.54 0 6.36 1.53 7.82 2.81l5.77-5.77C34.64 3.36 29.74 1 24 1 14.82 1 6.73 6.98 3.09 15.09l6.91 5.36C12.13 14.13 17.62 9.5 24 9.5z"/>
                      <path fill="#34A853" d="M46.1 24.5c0-1.64-.15-3.22-.42-4.74H24v9.01h12.42c-.54 2.9-2.18 5.36-4.66 7.01l7.19 5.6C43.91 37.36 46.1 31.36 46.1 24.5z"/>
                      <path fill="#FBBC05" d="M10 28.09c-1.09-3.27-1.09-6.82 0-10.09l-6.91-5.36C.99 16.36 0 20.05 0 24c0 3.95.99 7.64 3.09 11.36l6.91-5.36z"/>
                      <path fill="#EA4335" d="M24 46c6.48 0 11.92-2.14 15.89-5.84l-7.19-5.6c-2.01 1.35-4.6 2.14-8.7 2.14-6.38 0-11.87-4.63-13.99-10.95l-6.91 5.36C6.73 41.02 14.82 46 24 46z"/>
                      <path fill="none" d="M0 0h48v48H0z"/>
                    </g>
                  </svg>
                </span>
                <span className="google-btn-text">Continue with Google</span>
              </button>
            </div>

            <div className="divider" style={{ 
              textAlign: 'center', 
              margin: '20px 0',
              position: 'relative',
              color: '#666'
            }}>
              <span style={{
                backgroundColor: 'white',
                padding: '0 15px',
                position: 'relative',
                zIndex: 1
              }}>or</span>
              <div style={{
                position: 'absolute',
                top: '50%',
                left: 0,
                right: 0,
                height: '1px',
                backgroundColor: '#ddd',
                zIndex: 0
              }}></div>
            </div>
            
            <div className="auth-buttons" style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={handleLogin} 
                className="login-button"
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  backgroundColor: '#4a90e2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
              >
                Login
              </button>
              <button 
                onClick={handleSignup} 
                className="signup-button"
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  backgroundColor: '#2ecc71',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizAuthModal;
