import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Intermission from '../components/Intermission';

function IntermissionController() {
  const navigate = useNavigate();
  const [intermissionTime, setIntermissionTime] = useState(10 * 60); // 10 minutes

  // Handle intermission completion
  const handleIntermissionComplete = () => {
    console.log('Intermission complete, navigating to Module 3');
    navigate('/exam/module/3');
  };

  return (
    <Intermission 
      onProceed={handleIntermissionComplete}
      timeRemaining={intermissionTime}
      setTimeRemaining={setIntermissionTime}
    />
  );
}

export default IntermissionController;
