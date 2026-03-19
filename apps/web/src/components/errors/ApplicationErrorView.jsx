import React from 'react';

const containerStyle = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '24px',
  backgroundColor: '#f8fafc',
};

const cardStyle = {
  width: '100%',
  maxWidth: '640px',
  padding: '32px',
  borderRadius: '16px',
  backgroundColor: '#ffffff',
  boxShadow: '0 24px 60px rgba(15, 23, 42, 0.12)',
  border: '1px solid rgba(148, 163, 184, 0.24)',
};

const eyebrowStyle = {
  display: 'inline-block',
  marginBottom: '12px',
  fontSize: '12px',
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: '#b91c1c',
};

const headingStyle = {
  margin: '0 0 12px',
  fontSize: '30px',
  lineHeight: 1.2,
  color: '#0f172a',
};

const copyStyle = {
  margin: '0 0 24px',
  fontSize: '16px',
  lineHeight: 1.6,
  color: '#475569',
};

const actionsStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '12px',
};

const primaryButtonStyle = {
  border: 'none',
  borderRadius: '999px',
  padding: '12px 18px',
  fontSize: '15px',
  fontWeight: 600,
  cursor: 'pointer',
  color: '#ffffff',
  backgroundColor: '#0f172a',
};

const secondaryLinkStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '999px',
  padding: '12px 18px',
  fontSize: '15px',
  fontWeight: 600,
  color: '#0f172a',
  textDecoration: 'none',
  backgroundColor: '#e2e8f0',
};

const detailsStyle = {
  marginTop: '24px',
  padding: '16px',
  borderRadius: '12px',
  overflowX: 'auto',
  fontSize: '13px',
  lineHeight: 1.6,
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  color: '#991b1b',
  backgroundColor: '#fff1f2',
  border: '1px solid rgba(244, 63, 94, 0.2)',
};

function getErrorMessage(error) {
  if (!error) {
    return null;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  if (typeof error === 'object') {
    const routeParts = [error.status, error.statusText].filter(Boolean);
    if (routeParts.length > 0) {
      if (typeof error.data === 'string') {
        routeParts.push(error.data);
      }

      return routeParts.join(' ');
    }

    try {
      return JSON.stringify(error, null, 2);
    } catch (serializationError) {
      return 'Unable to serialize error details.';
    }
  }

  return String(error);
}

function ApplicationErrorView({
  error,
  title = 'Something went wrong',
  message = 'The page hit an unexpected error. Reloading usually recovers, and you can always return to the home page.',
}) {
  const errorMessage = getErrorMessage(error);
  const showDetails = process.env.NODE_ENV !== 'production' && Boolean(errorMessage);

  return (
    <div role="alert" style={containerStyle}>
      <section style={cardStyle}>
        <span style={eyebrowStyle}>Application Error</span>
        <h1 style={headingStyle}>{title}</h1>
        <p style={copyStyle}>{message}</p>
        <div style={actionsStyle}>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={primaryButtonStyle}
          >
            Reload page
          </button>
          <a href="/" style={secondaryLinkStyle}>
            Go to home page
          </a>
        </div>
        {showDetails ? (
          <pre style={detailsStyle}>{errorMessage}</pre>
        ) : null}
      </section>
    </div>
  );
}

export default ApplicationErrorView;
