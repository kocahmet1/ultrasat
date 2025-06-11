import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './styles/LandingPage.css';
import App from './App';

const LandingPage = () => {
  const startExam = () => {
    // Remove the landing page and mount the main App
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(
      <React.StrictMode>
        <App startWithExam={true} />
      </React.StrictMode>
    );
  };

  return (
    <div className="landing-container">
      <div className="landing-content">
        <h1>Digital SAT Mock Exam</h1>
        <div className="exam-info">
          <h2>Exam Structure</h2>
          <div className="module-info">
            <div className="module">
              <h3>Module 1</h3>
              <p>Reading and Writing</p>
              <p>32 minutes</p>
            </div>
            <div className="module">
              <h3>Module 2</h3>
              <p>Reading and Writing</p>
              <p>32 minutes</p>
            </div>
            <div className="module intermission">
              <h3>Break</h3>
              <p>10 minutes</p>
            </div>
            <div className="module">
              <h3>Module 3</h3>
              <p>Math - No Calculator</p>
              <p>32 minutes</p>
            </div>
            <div className="module">
              <h3>Module 4</h3>
              <p>Math - Calculator Allowed</p>
              <p>32 minutes</p>
            </div>
          </div>
        </div>
        
        <div className="instructions">
          <h2>Instructions</h2>
          <ul>
            <li>Each module is timed separately.</li>
            <li>You can mark questions for review and return to them within the same module.</li>
            <li>You can use the cross-out feature to eliminate answer choices.</li>
            <li>You must complete each module in order.</li>
            <li>Once a module is completed, you cannot return to it.</li>
          </ul>
        </div>
        
        <button className="start-exam-button" onClick={startExam}>
          Start Exam
        </button>
      </div>
    </div>
  );
};

// Initial render shows the landing page
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <LandingPage />
  </React.StrictMode>
);

export default LandingPage;
