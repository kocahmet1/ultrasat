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
        
        // After entering fullscreen, try to lock orientation to landscape on mobile
        if (window.innerWidth <= 768 && window.screen.orientation && window.screen.orientation.lock) {
          // Try landscape-primary first, fallback to landscape
          window.screen.orientation.lock('landscape-primary')
            .catch(() => {
              return window.screen.orientation.lock('landscape');
            })
            .catch((error) => {
              console.log('Orientation lock failed:', error.message);
            });
        }
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
