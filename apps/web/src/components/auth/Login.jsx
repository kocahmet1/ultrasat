import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/Auth.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handlePostLogin = () => {
    // Check if coming from a protected route (PrivateRoute redirect)
    if (location.state?.from && location.state.from !== '/login') {
      navigate(location.state.from);
      return;
    }

    // Check if coming from Quiz gating
    if (location.state?.from === 'quiz') {
      // Prefer a navigation object if provided
      const quizNavFromLocation = location.state?.quizNav;
      let storedNavObj = null;
      if (!quizNavFromLocation) {
        const navStr = sessionStorage.getItem('intendedQuizNav');
        if (navStr) {
          try { storedNavObj = JSON.parse(navStr); } catch (e) { console.error('Failed to parse intendedQuizNav:', e); }
        }
      }

      const navObj = quizNavFromLocation || storedNavObj;
      if (navObj && navObj.pathname) {
        sessionStorage.removeItem('intendedQuizNav');
        sessionStorage.removeItem('intendedQuizPath');
        navigate(navObj.pathname, { state: navObj.state });
        return;
      }

      const quizPath = location.state?.quizPath || sessionStorage.getItem('intendedQuizPath');
      if (quizPath) {
        sessionStorage.removeItem('intendedQuizPath');
        navigate(quizPath);
        return;
      }
    }

    // Check if coming from Question Bank
    if (location.state?.from === 'questionBank') {
      const savedPreferences = sessionStorage.getItem('questionBankPreferences');
      if (savedPreferences) {
        const preferences = JSON.parse(savedPreferences);
        sessionStorage.removeItem('questionBankPreferences');
        
        // Navigate to smart quiz generator with saved preferences
        navigate('/smart-quiz-generator', {
          state: {
            subcategoryId: preferences.subcategory.id,
            forceLevel: preferences.difficulty.level,
            fromQuestionBank: true
          }
        });
        return;
      }
    }

    // Check if coming from exam landing page
    if (location.state?.from === 'exam') {
      const { examId, actionType } = location.state;
      
      if (actionType === 'view') {
        navigate('/practice-exams');
      } else if (actionType === 'start' && examId) {
        // Check if examId is a number (1, 2, 3) or actual ID
        if (typeof examId === 'number' || (typeof examId === 'string' && /^\d+$/.test(examId))) {
          // It's an exam number, redirect to practice exams with the exam number
          navigate('/practice-exams', { 
            state: { startExamNumber: parseInt(examId) } 
          });
        } else {
          // It's an actual exam ID, navigate directly
          navigate(`/practice-exam/${examId}`, { 
            state: { startExam: true } 
          });
        }
      } else {
        navigate('/practice-exams');
      }
      return;
    }
    
    // Default navigation
    navigate('/progress');
  };

  async function handleSubmit(e) {
    e.preventDefault();
    
    try {
      setError('');
      setLoading(true);
      await login(email, password);
      handlePostLogin();
    } catch (err) {
      setError('Failed to sign in. Please check your credentials.');
      console.error(err);
    }
    
    setLoading(false);
  }

  async function handleGoogleSignIn() {
    try {
      setError('');
      setLoading(true);
      await signInWithGoogle();
      handlePostLogin();
    } catch (err) {
      setError('Failed to sign in with Google.');
      console.error(err);
    }
    setLoading(false);
  }

  return (
    <div className="auth-container">
      <button 
        className="back-button-global"
        onClick={() => navigate('/')}
        type="button"
      >
        ← Back to Home
      </button>
      <div className="auth-card">
        <h2>Log In</h2>
        {error && <div className="auth-error">{error}</div>}
        <div className="google-signin-container">
          <button
            type="button"
            className="auth-button google-signin full-width"
            onClick={handleGoogleSignIn}
            disabled={loading}
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
            <span className="google-btn-text">Sign in with Google</span>
          </button>
          <div className="divider"><span>or</span></div>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
        <div className="auth-links auth-signup-prompt">
          Need an account?{' '}
          <Link to="/signup"><strong>Sign up for a free account.</strong></Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
