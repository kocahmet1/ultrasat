import React, { useState, useEffect } from 'react';
import '../styles/IntermissionScreen.css';

const IntermissionScreen = ({ onIntermissionComplete }) => {
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes in seconds

  useEffect(() => {
    if (timeRemaining <= 0) {
      onIntermissionComplete();
      return;
    }

    const timerId = setInterval(() => {
      setTimeRemaining(time => time - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeRemaining, onIntermissionComplete]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="intermission-container">
      <div className="intermission-left">
        <div className="timer-box">
          <p className="timer-label">Remaining Break Time:</p>
          <p className="timer-display">{formatTime(timeRemaining)}</p>
        </div>
        <button className="resume-button" onClick={onIntermissionComplete}>
          Resume Testing
        </button>
      </div>
      <div className="intermission-right">
        <div className="intermission-rules">
            <h2>Practice Test Break</h2>
            <p>You can resume this practice test as soon as you're ready to move on. On test day, you'll wait until the clock counts down. Read below to see how breaks work on test day.</p>
            <hr />
            <h3>Take a Break: Do Not Close Your Device</h3>
            <p>After the break, a Resume Testing Now button will appear and you'll start the next section.</p>
            <h4>Follow these rules during the break:</h4>
            <ol>
                <li>Do not disturb students who are still testing.</li>
                <li>Do not exit the app or close your laptop.</li>
                <li>Do not access phones, smartwatches, textbooks, notes, or the internet.</li>
                <li>Do not eat or drink near any testing device.</li>
                <li>Do not speak in the testing room; outside the room, do not discuss the exam with anyone.</li>
            </ol>
        </div>
      </div>
    </div>
  );
};

export default IntermissionScreen;
