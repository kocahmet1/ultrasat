import React from 'react';
import '../styles/UltraSATLogo.css';

const UltraSATLogo = ({ 
  size = 'medium', 
  variant = 'default',
  className = '',
  onClick = null 
}) => {
  const logoClasses = `ultrasat-logo ultrasat-logo--${size} ultrasat-logo--${variant} ${className}`.trim();
  
  return (
    <div className={logoClasses} onClick={onClick}>
      <div className="logo-icon">
        <span className="logo-text">SAT</span>
      </div>
      {/* Displayed brand is SATPractice for now; the component/file names keep
          UltraSAT until the full repo-wide rename. Old markup:
          <span className="logo-prefix">Ultra</span><span className="logo-highlight">SAT</span><span className="logo-suffix">Prep</span> */}
      <div className="logo-text-container">
        <span className="logo-highlight">SAT</span>
        <span className="logo-suffix">Practice</span>
      </div>
    </div>
  );
};

export default UltraSATLogo; 