import React from 'react';
import '../styles/FullscreenModal.css';

const FullscreenModal = ({ isOpen, onSwitch, onClose }) => {
  if (!isOpen) {
    return null;
  }

  const handleSwitchToFullscreen = async () => {
    if (document.documentElement.requestFullscreen) {
      try {
        await document.documentElement.requestFullscreen();
        // Orientation lock will be handled by ExamModule's fullscreenchange listener
      } catch (error) {
        console.log('Fullscreen request failed:', error);
      }
    }
    onSwitch();
  };

  return (
    <div className="fullscreen-modal-overlay">
      <div className="fullscreen-modal-content">
        <h2>Fullscreen Recommended</h2>
        <p>For the best experience, we recommend taking the exam in fullscreen mode. For mobile devices, landscape orientation is recommended for optimal viewing.</p>
        <div className="fullscreen-modal-actions">
          <button className="primary-button" onClick={handleSwitchToFullscreen}>
            Switch to Fullscreen
          </button>
          <button className="secondary-button" onClick={onClose}>Maybe Later</button>
        </div>
      </div>
    </div>
  );
};

export default FullscreenModal;
