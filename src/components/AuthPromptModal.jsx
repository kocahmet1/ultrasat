import React from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from './Modal';
import './AuthPromptModal.css';

const AuthPromptModal = ({ isOpen, onClose, featureName, featureDescription }) => {
  const navigate = useNavigate();

  const handleLogin = () => {
    onClose();
    navigate('/login');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Log in to access ${featureName}`}>
      <div className="auth-prompt-modal-content">
        <p>{featureDescription}</p>
        <button onClick={handleLogin} className="login-button">
          Log In
        </button>
      </div>
    </Modal>
  );
};

export default AuthPromptModal;
