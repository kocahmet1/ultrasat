import React from 'react';
import '../styles/ModuleLoadingScreen.css';

const ModuleLoadingScreen = ({ message }) => {
  return (
    <div className="module-loading-container">
      <div className="module-loading-animation">
        <div className="dot"></div>
        <div className="dot"></div>
        <div className="dot"></div>
      </div>
      <div className="module-loading-text">{message || 'Next module loading...'}</div>
    </div>
  );
};

export default ModuleLoadingScreen;
