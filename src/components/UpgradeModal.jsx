import React from 'react';
import { useNavigate } from 'react-router-dom';
import './UpgradeModal.css';

const UpgradeModal = ({ open, onClose }) => {
  const navigate = useNavigate();
  if (!open) return null;

  const handleUpgrade = () => {
    onClose();
    navigate('/membership/upgrade');
  };

  return (
    <div className="upgrade-modal-overlay">
      <div className="upgrade-modal">
        <button className="upgrade-modal-close" onClick={onClose}>&times;</button>
        <div className="upgrade-modal-content">
          <h2 className="upgrade-modal-title">Upgrade to Pro</h2>
          <p className="upgrade-modal-message">
            This exam is available only for <span className="pro-badge">Pro</span> members.<br />
            Upgrade now to unlock all practice exams and premium features!
          </p>
          <button className="upgrade-modal-btn" onClick={handleUpgrade}>
            Upgrade to Pro
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;
