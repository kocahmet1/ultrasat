import React from 'react';
import { Navigate, useParams } from 'react-router-dom';

function LegacyStudyResourceRedirect() {
  const { resourceId } = useParams();
  const target = resourceId ? `/study-resources?id=${resourceId}` : '/study-resources';

  return <Navigate to={target} replace />;
}

export default LegacyStudyResourceRedirect;
