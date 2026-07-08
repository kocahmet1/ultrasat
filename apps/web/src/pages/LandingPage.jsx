import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowRight, FaCheck, FaGoogle } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import '../styles/MinimalLandingPage.css';

const initialForm = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
};

const practiceNotes = [
  'Start with realistic practice tests.',
  'Review missed questions while they are still fresh.',
  'Repeat the pacing until test day feels ordinary.',
];

const LandingPage = () => {
  const { currentUser, login, signup, signInWithGoogle, logout } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isSignup = mode === 'signup';

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setError('');
  };

  const finishAuth = () => {
    navigate('/dashboard');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSignup) {
      if (form.password !== form.confirmPassword) {
        setError('Passwords do not match.');
        return;
      }

      if (form.password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
    }

    try {
      setError('');
      setLoading(true);

      if (isSignup) {
        await signup(form.email, form.password, form.name);
      } else {
        await login(form.email, form.password);
      }

      finishAuth();
    } catch (authError) {
      console.error(authError);
      setError(isSignup ? 'Could not create that account. Please try again.' : 'Could not sign in. Please check your email and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      await signInWithGoogle();
      finishAuth();
    } catch (authError) {
      console.error(authError);
      setError('Google sign-in did not complete. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (logoutError) {
      console.error(logoutError);
      setError('Could not log out. Please try again.');
    }
  };

  return (
    <div className="minimal-landing">
      <header className="minimal-nav" aria-label="Main navigation">
        <Link to="/" className="minimal-brand">UltraSAT</Link>
        <nav className="minimal-nav-links" aria-label="Public links">
          <Link to="/sat-guide">SAT guide</Link>
          <Link to="/score-calculator">Score calculator</Link>
          <Link to="/landing-original">Classic page</Link>
        </nav>
      </header>

      <main className="minimal-hero">
        <section className="minimal-copy" aria-labelledby="landing-title">
          <p className="minimal-kicker">SAT practice, without the clutter.</p>
          <h1 id="landing-title">Prepare by taking the next practice test.</h1>
          <p className="minimal-lede">
            A simple routine is enough to start: sit for focused questions, review what you missed,
            and come back with a sharper sense of timing.
          </p>

          <ul className="minimal-note-list" aria-label="Practice routine">
            {practiceNotes.map((note) => (
              <li key={note}>
                <FaCheck aria-hidden="true" />
                <span>{note}</span>
              </li>
            ))}
          </ul>

          <div className="minimal-proof-strip" aria-label="Preparation rhythm">
            <div>
              <span>01</span>
              <strong>Take</strong>
            </div>
            <div>
              <span>02</span>
              <strong>Review</strong>
            </div>
            <div>
              <span>03</span>
              <strong>Repeat</strong>
            </div>
          </div>

          <figure className="minimal-preview">
            <img src="/images/optimized/practice-test.webp" alt="UltraSAT practice test preview" />
          </figure>
        </section>

        <section className="minimal-auth-panel" aria-label="Account access">
          {currentUser ? (
            <div className="minimal-signed-in">
              <span className="minimal-panel-eyebrow">Signed in</span>
              <h2>Welcome back.</h2>
              <p>{currentUser.email || 'Your account is ready.'}</p>
              <button
                type="button"
                className="minimal-primary-button"
                onClick={() => navigate('/dashboard')}
              >
                Open dashboard
                <FaArrowRight aria-hidden="true" />
              </button>
              <button
                type="button"
                className="minimal-secondary-button"
                onClick={handleLogout}
              >
                Log out
              </button>
            </div>
          ) : (
            <>
              <span className="minimal-panel-eyebrow">Start here</span>
              <h2>{isSignup ? 'Create your account.' : 'Log in to practice.'}</h2>
              <p className="minimal-panel-copy">
                Your practice history, review work, and next test stay with your account.
              </p>

              <div className="minimal-auth-tabs" role="tablist" aria-label="Choose login or signup">
                <button
                  type="button"
                  className={mode === 'login' ? 'active' : ''}
                  onClick={() => switchMode('login')}
                  aria-selected={mode === 'login'}
                  role="tab"
                >
                  Log in
                </button>
                <button
                  type="button"
                  className={mode === 'signup' ? 'active' : ''}
                  onClick={() => switchMode('signup')}
                  aria-selected={mode === 'signup'}
                  role="tab"
                >
                  Sign up
                </button>
              </div>

              {error && <div className="minimal-auth-error" role="alert">{error}</div>}

              <button
                type="button"
                className="minimal-google-button"
                onClick={handleGoogleSignIn}
                disabled={loading}
              >
                <FaGoogle aria-hidden="true" />
                Continue with Google
              </button>

              <div className="minimal-divider"><span>or</span></div>

              <form className="minimal-auth-form" onSubmit={handleSubmit}>
                {isSignup && (
                  <label>
                    <span>Name</span>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(event) => updateField('name', event.target.value)}
                      autoComplete="name"
                      required
                    />
                  </label>
                )}

                <label>
                  <span>Email</span>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) => updateField('email', event.target.value)}
                    autoComplete="email"
                    required
                  />
                </label>

                <label>
                  <span>Password</span>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(event) => updateField('password', event.target.value)}
                    autoComplete={isSignup ? 'new-password' : 'current-password'}
                    required
                  />
                </label>

                {isSignup && (
                  <label>
                    <span>Confirm password</span>
                    <input
                      type="password"
                      value={form.confirmPassword}
                      onChange={(event) => updateField('confirmPassword', event.target.value)}
                      autoComplete="new-password"
                      required
                    />
                  </label>
                )}

                <button type="submit" className="minimal-primary-button" disabled={loading}>
                  {loading ? 'Working...' : isSignup ? 'Create account' : 'Log in'}
                  <FaArrowRight aria-hidden="true" />
                </button>
              </form>
            </>
          )}
        </section>
      </main>

      <footer className="minimal-footer">
        <span>Practice tests first. Everything else after.</span>
        <div>
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
