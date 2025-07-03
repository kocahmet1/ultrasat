import React from 'react';
import { useNavigate } from 'react-router-dom';
import './PaymentCancel.css';

const PaymentCancel = () => {
  const navigate = useNavigate();

  const handleRetry = () => {
    navigate('/membership');
  };

  const handleContinue = () => {
    navigate('/dashboard');
  };

  return (
    <div className="payment-cancel">
      <div className="cancel-container">
        <div className="cancel-icon">❌</div>
        <h1>Payment Cancelled</h1>
        <p className="cancel-message">
          Your payment was cancelled and no charges were made to your account.
        </p>
        
        <div className="cancel-info">
          <h3>What happened?</h3>
          <p>
            You cancelled the payment process before it was completed. 
            Your current membership plan remains unchanged.
          </p>
        </div>

        <div className="benefits-reminder">
          <h3>Don't miss out on premium features:</h3>
          <ul>
            <li>🚀 Unlimited practice exams</li>
            <li>📊 Detailed progress analytics</li>
            <li>🎯 AI-powered study recommendations</li>
            <li>💬 Priority support</li>
            <li>🏆 Score guarantee (Max tier)</li>
          </ul>
        </div>

        <div className="action-buttons">
          <button onClick={handleRetry} className="retry-button">
            Try Again
          </button>
          <button onClick={handleContinue} className="continue-button">
            Continue with Free Plan
          </button>
        </div>

        <div className="support-info">
          <p>
            Questions about our plans? Contact us at{' '}
            <a href="mailto:support@ultrasat.com">support@ultrasat.com</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancel;
