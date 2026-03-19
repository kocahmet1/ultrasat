import React from 'react';
import { Navigate, useParams } from 'react-router-dom';

function LegacySkillDrillRedirect() {
  const { skillTag } = useParams();

  return (
    <Navigate
      to="/smart-quiz-generator"
      state={skillTag ? { subcategoryId: skillTag } : undefined}
      replace
    />
  );
}

export default LegacySkillDrillRedirect;
