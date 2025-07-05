import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import '../styles/ProFeatureModal.css';

const ProFeatureModal = ({ isOpen, onClose, position }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const modalStyle = {
    top: `${position.y}px`,
    left: `${position.x}px`,
  };

  return (
    <div className="pro-feature-modal-overlay" onClick={onClose}>
      <div
        ref={modalRef}
        className="pro-feature-modal"
        style={modalStyle}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pro-feature-modal-header">
          <h2 className="pro-feature-modal-title">Upgrade to Pro</h2>
          <button className="pro-feature-modal-close" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="pro-feature-modal-body">
          <p>This feature is available exclusively for our Pro members.</p>
          <p>Upgrade now to unlock this and many other premium features!</p>
          <Link to="/membership/upgrade" className="pro-feature-modal-upgrade-btn">
            Upgrade Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProFeatureModal;
