import React from 'react';
import { useRouteError } from 'react-router-dom';
import ApplicationErrorView from './ApplicationErrorView';

function RouteErrorBoundary() {
  const error = useRouteError();

  return <ApplicationErrorView error={error} />;
}

export default RouteErrorBoundary;
