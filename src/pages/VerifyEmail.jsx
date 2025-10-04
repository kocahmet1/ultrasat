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
    <div className="auth-container">
      <div className="auth-card">
        <h2>Verify your email</h2>
        <p>
          {user?.email
            ? `We sent a verification email to ${user.email}.`
            : 'You need to be logged in to verify your email.'}
        </p>
        {user?.email && (
          <div className="auth-info" style={{ marginTop: '12px', marginBottom: '12px' }}>
            <strong>⚠️ Check your spam/junk folder!</strong>
            <br />
            Our verification emails sometimes end up in spam. If you don't see it in your inbox, please check your spam folder and mark it as "Not Spam".
          </div>
        )}
        {message && <div className={status === 'error' ? 'auth-error' : 'auth-info'}>{message}</div>}

        <div className="auth-actions">
          {!user && (
            <button className="auth-button" onClick={goLogin} type="button">
              Log In
            </button>
          )}

          {user && !user.emailVerified && (
            <>
              <button
                className="auth-button"
                onClick={handleResend}
                type="button"
                disabled={status === 'sending'}
              >
                {status === 'sending' ? 'Sending…' : 'Resend email'}
              </button>
              <button
                className="auth-button secondary"
                onClick={handleIHaveVerified}
                type="button"
                disabled={status === 'checking'}
              >
                {status === 'checking' ? 'Checking…' : "I've verified"}
              </button>
            </>
          )}

          {user && user.emailVerified && (
            <button className="auth-button" onClick={() => navigate('/progress')} type="button">
              Continue
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default VerifyEmail;
