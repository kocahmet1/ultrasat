import React from 'react';
import { Navigate, useParams } from 'react-router-dom';

function LegacyLessonRedirect() {
  const { skillTag } = useParams();
  const target = skillTag ? `/learn/${skillTag}` : '/progress';

  return <Navigate to={target} replace />;
}

export default LegacyLessonRedirect;
