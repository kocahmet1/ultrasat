/**
 * 404 page (Overhaul Phase A). Previously unknown URLs silently redirected to
 * the marketing homepage, stranding logged-in users mid-task.
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const NotFound = () => {
  const { currentUser } = useAuth();
  const location = useLocation();

  return (
    <div style={{ maxWidth: 560, margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
      <div style={{ fontSize: 64, fontWeight: 800, color: 'var(--ut-accent-rule)', lineHeight: 1 }}>404</div>
      <h1 style={{ fontSize: 22, margin: '14px 0 8px', color: 'var(--ut-text)' }}>That page doesn't exist</h1>
      <p style={{ color: 'var(--ut-muted)', marginBottom: 24 }}>
        <code style={{ background: 'var(--ut-bg-alt)', padding: '2px 8px', borderRadius: 6 }}>{location.pathname}</code>{' '}
        isn't a page on UltraSAT — it may be an old link.
      </p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link
          to={currentUser ? '/dashboard' : '/'}
          style={{
            background: 'var(--ut-accent)', color: 'var(--ut-on-accent)', padding: '10px 20px', borderRadius: 10,
            textDecoration: 'none', fontWeight: 600, fontSize: 14,
          }}
        >
          {currentUser ? 'Go to Home' : 'Go to UltraSAT'}
        </Link>
        {currentUser && (
          <Link
            to="/practice-exams"
            style={{
              background: 'var(--ut-accent-soft)', color: 'var(--ut-accent-dark)', padding: '10px 20px', borderRadius: 10,
              textDecoration: 'none', fontWeight: 600, fontSize: 14,
            }}
          >
            Practice Tests
          </Link>
        )}
      </div>
    </div>
  );
};

export default NotFound;
