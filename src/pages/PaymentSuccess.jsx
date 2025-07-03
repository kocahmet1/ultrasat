import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './PaymentSuccess.css';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentUser, getUserMembership } = useAuth();
  const [verificationStatus, setVerificationStatus] = useState('verifying');
  const [sessionData, setSessionData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (sessionId) {
      verifyPayment(sessionId);
    } else {
      setError('No session ID provided');
      setVerificationStatus('error');
    }
  }, [searchParams]);

  const verifyPayment = async (sessionId) => {
    try {
      const response = await fetch(`/api/stripe/verify-session/${sessionId}`);
      const data = await response.json();
      
      if (data.success) {
        setSessionData(data);
        setVerificationStatus('success');
        
        // Refresh user membership data
        if (currentUser) {
          await getUserMembership(currentUser);
        }
      } else {
        setError('Payment verification failed');
        setVerificationStatus('error');
      }
    } catch (err) {
      console.error('Error verifying payment:', err);
      setError('Failed to verify payment');
      setVerificationStatus('error');
    }
  };

  const handleContinue = () => {
    navigate('/dashboard');
  };

  const getTierDisplayName = (tier) => {
    const displayNames = {
      'plus': 'Plus',
      'max': 'Max'
    };
    return displayNames[tier] || tier;
  };

  if (verificationStatus === 'verifying') {
    return (
      <div className="payment-success">
        <div className="success-container">
          <div className="loading-spinner"></div>
          <h2>Verifying your payment...</h2>
          <p>Please wait while we confirm your subscription.</p>
        </div>
      </div>
    );
  }

  if (verificationStatus === 'error') {
    return (
      <div className="payment-success">
        <div className="success-container error">
          <div className="error-icon">❌</div>
          <h2>Payment Verification Failed</h2>
          <p>{error || 'There was an issue verifying your payment.'}</p>
          <div className="action-buttons">
            <button onClick={() => navigate('/membership')} className="retry-button">
              Try Again
            </button>
            <button onClick={() => navigate('/dashboard')} className="continue-button">
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-success">
      <div className="success-container">
        <div className="success-icon">🎉</div>
        <h1>Payment Successful!</h1>
        <p className="success-message">
          Welcome to UltraSAT {getTierDisplayName(sessionData?.session?.metadata?.tier)}!
        </p>
        
        <div className="payment-details">
          <h3>Subscription Details</h3>
          <div className="detail-item">
            <span className="label">Plan:</span>
            <span className="value">
              {getTierDisplayName(sessionData?.session?.metadata?.tier)} - {sessionData?.session?.metadata?.billing}
            </span>
          </div>
          <div className="detail-item">
            <span className="label">Status:</span>
            <span className="value status-active">Active</span>
          </div>
          <div className="detail-item">
            <span className="label">Next Billing:</span>
            <span className="value">
              {new Date(sessionData?.subscription?.current_period_end * 1000).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="next-steps">
          <h3>What's Next?</h3>
          <ul>
            <li>✅ Your account has been upgraded automatically</li>
            <li>✅ You now have access to all premium features</li>
            <li>✅ Start taking unlimited practice exams</li>
            <li>✅ Access advanced analytics and study tools</li>
          </ul>
        </div>

        <div className="action-buttons">
          <button onClick={handleContinue} className="continue-button">
            Start Using Premium Features
          </button>
          <button onClick={() => navigate('/membership')} className="manage-button">
            Manage Subscription
          </button>
        </div>

        <div className="support-info">
          <p>
            Need help? Contact our support team at{' '}
            <a href="mailto:support@ultrasat.com">support@ultrasat.com</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
