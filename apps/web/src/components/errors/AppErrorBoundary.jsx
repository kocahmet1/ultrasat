import React from 'react';
import ApplicationErrorView from './ApplicationErrorView';

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled application error', error, errorInfo);
  }

  render() {
    const { error } = this.state;

    if (error) {
      return <ApplicationErrorView error={error} />;
    }

    return this.props.children;
  }
}

export default AppErrorBoundary;
