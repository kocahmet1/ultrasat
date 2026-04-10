import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { reload } from 'firebase/auth';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../firebase/config';
import '../styles/EmailVerificationBanner.css';

const DISMISS_KEY = 'emailVerifyBannerDismissedAt';
const DISMISS_COOLDOWN_MS = 24 * 60 * 60 * 1000; // re-show after 24 hours

function EmailVerificationBanner() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [minimized, setMinimized] = useState(false);

  // Determine if this user needs the banner
  const needsVerification = useCallback(() => {
    if (!currentUser) return false;
    // Only email/password users need verification
    const isPasswordProvider = (currentUser.providerData || []).some(
      (p) => p.providerId === 'password'
    );
    if (!isPasswordProvider) return false;
    if (currentUser.emailVerified) return false;
    return true;
  }, [currentUser]);

  useEffect(() => {
    if (!needsVerification()) {
      setVisible(false);
      return;
    }

    // Check if user recently dismissed
    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    if (dismissedAt) {
      const elapsed = Date.now() - parseInt(dismissedAt, 10);
      if (elapsed < DISMISS_COOLDOWN_MS) {
        // Still within cooldown — show minimized dot instead
        setVisible(true);
        setMinimized(true);
        // Set timer to re-expand when cooldown expires
        const remaining = DISMISS_COOLDOWN_MS - elapsed;
        const timer = setTimeout(() => {
          setMinimized(false);
        }, remaining);
        return () => clearTimeout(timer);
      }
    }

    // Show the full banner
    setVisible(true);
    setMinimized(false);
  }, [needsVerification]);

  // Periodically re-check in case the user verified in another tab
  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(async () => {
      try {
        if (auth.currentUser) {
          await reload(auth.currentUser);
          if (auth.currentUser.emailVerified) {
            setVisible(false);
            localStorage.removeItem(DISMISS_KEY);
          }
        }
      } catch {
        // ignore reload errors
      }
    }, 30000); // check every 30s

    return () => clearInterval(interval);
  }, [visible]);

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setMinimized(true);
  };

  const handleExpand = () => {
    setMinimized(false);
  };

  const handleVerifyNow = () => {
    navigate('/verify-email');
  };

  if (!visible) return null;

  // Minimized state — subtle floating badge
  if (minimized) {
    return (
      <button
        className="email-verify-badge"
        onClick={handleExpand}
        title="Verify your email"
        aria-label="Email verification reminder"
        type="button"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
          <polyline points="22,6 12,13 2,6"/>
        </svg>
        <span className="email-verify-badge-dot" />
      </button>
    );
  }

  // Full banner
  return (
    <div className="email-verify-banner" role="alert">
      <div className="email-verify-banner-content">
        <svg className="email-verify-banner-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
          <polyline points="22,6 12,13 2,6"/>
        </svg>
        <span className="email-verify-banner-text">
          <strong>Please verify your email</strong> — Check your inbox for a verification link to secure your account.
        </span>
        <div className="email-verify-banner-actions">
          <button
            className="email-verify-banner-btn email-verify-banner-btn-primary"
            onClick={handleVerifyNow}
            type="button"
          >
            Verify Now
          </button>
          <button
            className="email-verify-banner-btn email-verify-banner-btn-dismiss"
            onClick={handleDismiss}
            type="button"
            aria-label="Dismiss for now"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
}

export default EmailVerificationBanner;
