import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import UltraSATLogo from '../components/UltraSATLogo';
import '../styles/LandingPage2.css';
import heroBackground from '../assets/bckrnd.jpg';

const LandingPage2 = () => {
  const { currentUser } = useAuth();

  const practiceCtaHref = currentUser ? '/practice-exams' : '/guest-smart-quiz';
  const questionBankHref = currentUser ? '/subject-quizzes' : '/guest-subject-quizzes';
  const loginHref = currentUser ? '/progress' : '/login';

  return (
    <div className="lp2">
      {/* Top Navigation */}
      <header className="lp2-header">
        <div className="lp2-container lp2-nav">
          <div className="lp2-brand">
            <UltraSATLogo size="small" />
          </div>
          <nav className="lp2-menu">
            <Link to="/progress">Dashboard</Link>
            <Link to="/practice-exams">Practice Exams</Link>
            <Link to="/subject-quizzes">Question Bank</Link>
            <Link to="/word-bank">Word Bank</Link>
            <Link to="/flashcards">Flashcards</Link>
            <Link to="/all-results">Results</Link>
          </nav>
          <div className="lp2-actions">
            <Link to={loginHref} className="lp2-btn lp2-btn--ghost">{currentUser ? 'Open App' : 'Login'}</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="lp2-hero" style={{ backgroundImage: `url(${heroBackground})` }}>
        <div className="lp2-container lp2-hero-inner">
          <h1 className="lp2-hero-title">Master Your SAT. Own Your Future</h1>
          <p className="lp2-hero-sub">UltraSATPrep delivers personalized learning, expert strategies, and proven results for ambitious students.</p>

          <div className="lp2-ctas">
            <Link to={practiceCtaHref} className="lp2-btn lp2-btn--primary">Start Your First Free Practice</Link>
            <Link to={questionBankHref} className="lp2-btn lp2-btn--outline">Explore Our Question Bank</Link>
            <Link
              to="/guest-subject-quizzes"
              state={!currentUser ? { openMeta: true } : undefined}
              className="lp2-btn lp2-btn--ghost"
            >
              Create a Mini Test
            </Link>
          </div>

          <div className="lp2-hero-stats">
            <span>8,000+ Students</span>
            <span>94% Success Rate</span>
            <span>Avg. 200+ Point Increase</span>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="lp2-how">
        <div className="lp2-container">
          <h2 className="lp2-section-title">How it Works</h2>
          <div className="lp2-cards">
            <div className="lp2-card">
              <div className="lp2-card-icon">🧭</div>
              <h3>Personalized Learning Path</h3>
              <p>Adaptive planning tailored to your goals and schedule.</p>
            </div>
            <div className="lp2-card">
              <div className="lp2-card-icon">📚</div>
              <h3>Comprehensive Content</h3>
              <p>Full coverage of Reading & Writing and Math with explanations.</p>
            </div>
            <div className="lp2-card">
              <div className="lp2-card-icon">⏱️</div>
              <h3>Realistic Practice</h3>
              <p>Bluebook-style tests and quizzes that mirror the real exam.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Dive In */}
      <section className="lp2-divein">
        <div className="lp2-container">
          <h2 className="lp2-section-title">Dive In: Start Practicing Now</h2>
          <div className="lp2-dive-grid">
            <div className="lp2-dive-card">
              <div className="lp2-card-header lp2-card-header--green">Take a Full-Length Practice Test</div>
              <h3 className="lp2-card-title">SAT Practice Test 1 (<span className="lp2-free-text">Free</span>)</h3>
              <p className="lp2-card-details">~3 hours | Full-Length | Modules: R&W, Math</p>
              <Link to={practiceCtaHref} className="lp2-cta-btn lp2-cta-btn--green">START TEST</Link>
            </div>

            <div className="lp2-dive-card">
              <div className="lp2-card-header lp2-card-header--blue">Quick Skill Builder Quiz</div>
              <h3 className="lp2-card-title">Build Your Vocab</h3>
              <p className="lp2-card-details">15 min | Adaptive | Focus on Vocabulary</p>
              <Link to={questionBankHref} className="lp2-cta-btn lp2-cta-btn--blue">START QUIZ</Link>
            </div>
          </div>

          <div className="lp2-testimonials">
            <div className="lp2-quote">
              <img src="/images/optimized/person1.jpg" alt="Student" />
              <p>“My score went from 1300 to 1520! UltraSATPrep made the difference.”</p>
            </div>
            <div className="lp2-quote">
              <img src="/images/optimized/person2.jpg" alt="Student" />
              <p>“The realistic practice and clear explanations boosted my confidence.”</p>
            </div>
            <div className="lp2-quote">
              <img src="/images/optimized/person3.jpg" alt="Student" />
              <p>“I loved the adaptive quizzes — always the right challenge.”</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage2;
