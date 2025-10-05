import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase/config';
import { sendEmailVerification, reload } from 'firebase/auth';
import '../styles/Auth.css';

function VerifyEmail() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error | checking
  const [message, setMessage] = useState('');
  const user = auth.currentUser;

  useEffect(() => {
    // If already verified, go to app
    if (user && user.emailVerified) {
      navigate('/progress', { replace: true });
    }
  }, [user, navigate]);

  const handleResend = async () => {
    if (!user) {
      setMessage('Please log in to resend the verification email.');
      return;
    }
    try {
      setStatus('sending');
      setMessage('');
      
      // Try custom email service first
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_URL}/api/email/send-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          name: user.displayName || 'Student'
        })
      });

      if (response.ok) {
        console.log('✅ Custom verification email sent via SendGrid');
        setStatus('sent');
        setMessage('Verification email sent. Please check your inbox (and spam).');
      } else {
        // Fallback to Firebase default
        console.warn('Custom email failed, using Firebase default');
        auth.languageCode = 'en';
        const actionCodeSettings = {
          url: `${window.location.origin}/verify-email`,
          handleCodeInApp: false,
        };
        await sendEmailVerification(user, actionCodeSettings);
        setStatus('sent');
        setMessage('Verification email sent. Please check your inbox (and spam).');
      }
    } catch (err) {
      console.error('Resend verification failed:', err);
      setStatus('error');
      setMessage(err?.message || 'Failed to send verification email.');
    }
  };

  const handleIHaveVerified = async () => {
    if (!user) {
      setMessage('Please log in first.');
      return;
    }
    try {
      setStatus('checking');
      await reload(user);
      if (auth.currentUser?.emailVerified) {
        navigate('/progress', { replace: true });
      } else {
        setStatus('idle');
        setMessage('Still not verified. Please click the link in your email, then try again.');
      }
    } catch (err) {
      console.error('Reload failed:', err);
      setStatus('error');
      setMessage('Could not verify status. Please try again.');
    }
  };

  const goLogin = () => navigate('/login');

  return (
    <div className="verify-email-container">
      <div className="verify-email-card">
        {/* Email Icon */}
        <div className="verify-email-icon">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
        </div>

        {/* Title */}
        <h1 className="verify-email-title">Verify your email</h1>
        
        {/* Description */}
        <p className="verify-email-description">
          {user?.email
            ? (
              <>
                We sent a verification email to<br />
                <strong>{user.email}</strong>
              </>
            )
            : 'You need to be logged in to verify your email.'}
        </p>

        {/* Status Message */}
        {message && (
          <div className={`verify-message ${status === 'error' ? 'verify-message-error' : 'verify-message-success'}`}>
            {message}
          </div>
        )}

        {/* Action Buttons */}
        <div className="verify-actions">
          {!user && (
            <button className="verify-button verify-button-primary" onClick={goLogin} type="button">
              Log In
            </button>
          )}

          {user && !user.emailVerified && (
            <>
              <button
                className="verify-button verify-button-secondary"
                onClick={handleResend}
                type="button"
                disabled={status === 'sending'}
              >
                {status === 'sending' ? (
                  <>
                    <span className="button-spinner"></span>
                    Sending…
                  </>
                ) : 'Resend email'}
              </button>
              <button
                className="verify-button verify-button-primary"
                onClick={handleIHaveVerified}
                type="button"
                disabled={status === 'checking'}
              >
                {status === 'checking' ? (
                  <>
                    <span className="button-spinner"></span>
                    Checking…
                  </>
                ) : "I've verified"}
              </button>
            </>
          )}

          {user && user.emailVerified && (
            <button className="verify-button verify-button-primary" onClick={() => navigate('/progress')} type="button">
              Continue to Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default VerifyEmail;
