import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { getKebabCaseFromAnyFormat } from '../utils/subcategoryConstants';

function LegacyLessonRedirect() {
  const { skillTag } = useParams();
  const target = skillTag ? `/learn/${getKebabCaseFromAnyFormat(skillTag) || skillTag}` : '/progress';

  return <Navigate to={target} replace />;
}

export default LegacyLessonRedirect;
