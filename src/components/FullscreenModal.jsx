import React from 'react';
import '../styles/FullscreenModal.css';

const FullscreenModal = ({ isOpen, onSwitch, onClose }) => {
  if (!isOpen) {
    return null;
  }

  const handleSwitchToFullscreen = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    }
    onSwitch();
  };

  return (
    <div className="fullscreen-modal-overlay">
      <div className="fullscreen-modal-content">
        <h2>Fullscreen Recommended</h2>
        <p>For the best experience, we recommend taking the exam in fullscreen mode.</p>
        <div className="fullscreen-modal-actions">
          <button className="secondary-button" onClick={onClose}>Maybe Later</button>
          <button className="primary-button" onClick={handleSwitchToFullscreen}>
            Switch to Fullscreen
          </button>
        </div>
      </div>
    </div>
  );
};

export default FullscreenModal;
