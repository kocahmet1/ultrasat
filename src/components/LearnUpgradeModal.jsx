import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTimes, FaGraduationCap, FaCheck, FaRocket } from 'react-icons/fa';
import './LearnUpgradeModal.css';

const LearnUpgradeModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleUpgrade = () => {
    navigate('/pricing');
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="learn-upgrade-modal-overlay" onClick={handleOverlayClick}>
      <div className="learn-upgrade-modal">
        <div className="modal-header">
          <button className="modal-close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        
        <div className="modal-content">
          <div className="modal-icon">
            <FaGraduationCap />
          </div>
          
          <h2>Unlock Premium Learning Content</h2>
          
          <p className="modal-description">
            Access in-depth lessons, guided tutorials, and comprehensive learning materials to master every SAT concept.
          </p>
          
          <div className="features-list">
            <div className="feature-item">
              <FaCheck className="check-icon" />
              <span>Interactive video lessons</span>
            </div>
            <div className="feature-item">
              <FaCheck className="check-icon" />
              <span>Step-by-step tutorials</span>
            </div>
            <div className="feature-item">
              <FaCheck className="check-icon" />
              <span>Comprehensive study guides</span>
            </div>
            <div className="feature-item">
              <FaCheck className="check-icon" />
              <span>Expert tips and strategies</span>
            </div>
          </div>
          
          <div className="modal-actions">
            <button className="upgrade-btn" onClick={handleUpgrade}>
              <FaRocket />
              Upgrade to Plus
            </button>
            <button className="cancel-btn" onClick={onClose}>
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearnUpgradeModal; 