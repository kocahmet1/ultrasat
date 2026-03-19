import React from 'react';
import useIsMobile from '../hooks/useIsMobile';
import '../styles/FullscreenModal.css';

const FullscreenModal = ({ isOpen, onSwitch, onClose }) => {
  const isMobile = useIsMobile();
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
        <p>For the best experience, we recommend taking the exam in fullscreen mode. The exam will be displayed in landscape orientation.</p>
        {isMobile && (
          <p className="mobile-tip">Tip: Rotate your phone to landscape for a better exam experience.</p>
        )}
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
