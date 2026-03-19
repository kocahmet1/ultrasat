import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from './Modal';
import './AuthPromptModal.css';

const AuthPromptModal = ({ 
  isOpen, 
  onClose, 
  featureName, 
  featureDescription, 
  savedPreferences,
  onAuthSuccess 
}) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Save preferences to sessionStorage when modal opens
    if (isOpen && savedPreferences) {
      sessionStorage.setItem('questionBankPreferences', JSON.stringify(savedPreferences));
    }
  }, [isOpen, savedPreferences]);

  const handleLogin = () => {
    onClose();
    navigate('/login', { state: { from: 'questionBank' } });
  };

  const handleSignup = () => {
    onClose();
    navigate('/signup', { state: { from: 'questionBank' } });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Access ${featureName}`}>
      <div className="auth-prompt-modal-content">
        <p className="auth-description">{featureDescription}</p>
        
        {savedPreferences && (
          <div className="saved-preferences">
            <div className="preference-item">
              <span className="preference-label">Selected Category:</span>
              <span className="preference-value">{savedPreferences.subcategory?.name}</span>
            </div>
            <div className="preference-item">
              <span className="preference-label">Difficulty Level:</span>
              <span className="preference-value">{savedPreferences.difficulty?.name}</span>
            </div>
          </div>
        )}
        
        <div className="auth-buttons">
          <button onClick={handleLogin} className="login-button">
            Log In
          </button>
          <button onClick={handleSignup} className="signup-button">
            Sign Up
          </button>
        </div>
        
        <p className="auth-note">Already have an account? Log in to continue.</p>
      </div>
    </Modal>
  );
};

export default AuthPromptModal;
