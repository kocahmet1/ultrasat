import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-page">
      {/* Hero Section - Practice Exam Promotion */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Master the SAT with UltraSatPrep</h1>
          <p className="hero-subtitle">
            Take comprehensive practice exams and track your progress with our advanced analytics
          </p>
          <div className="hero-cta">
            <Link to="/signup" className="cta-button primary">
              Start Your Free Practice Test
            </Link>
            <Link to="/login" className="cta-button secondary">
              Already have an account? Sign In
            </Link>
          </div>
        </div>
        <div className="hero-visual">
          <img
            src="/images/practice-test.png"
            alt="Digital SAT Practice Test Interface"
            className="practice-exam-preview"
          />
        </div>
      </section>

      {/* Progress Tracking Section */}
      <section className="progress-section">
        <div className="section-content">
          <div className="progress-visual">
            <div className="overlay-content">
              <h2>Track Your Performance</h2>
              <p>
                Take a diagnostic practice test to see where you stand, then move on to smart quizzes 
                for each question subcategory where you will be guided to perfect your skills for all 
                question types.
              </p>
              <Link to="/signup" className="overlay-cta">
                Get Started →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Learning Resources Section */}
      <section className="resources-section">
        <div className="section-content">
          <div className="resources-grid">
            <div className="resource-item">
              <div className="placeholder-image concept-bank-preview">
                <span className="placeholder-text">Concept Bank Preview</span>
              </div>
              <div className="resource-overlay">
                <h3>Master Every Concept</h3>
                <p>
                  Access comprehensive concept explanations and practice problems
                </p>
              </div>
            </div>
            <div className="resource-item">
              <div className="placeholder-image word-bank-preview">
                <span className="placeholder-text">Word Bank Preview</span>
              </div>
              <div className="resource-overlay">
                <h3>Build Your Vocabulary</h3>
                <p>
                  Expand your vocabulary with targeted word lists and practice exercises
                </p>
              </div>
            </div>
          </div>
          <div className="resources-cta">
            <h2>Improve Your Vocabulary and Master Every Concept</h2>
            <p>
              As you progress through our platform, you'll build a strong foundation in both 
              vocabulary and conceptual understanding that will serve you well on test day.
            </p>
            <Link to="/signup" className="cta-button primary">
              Start Learning Today
            </Link>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="features-section">
        <div className="section-content">
          <h2>Why Choose UltraSatPrep?</h2>
          <div className="features-grid">
            <div className="feature-item">
              <h3>📊 Advanced Analytics</h3>
              <p>Track your progress across all SAT categories with detailed performance insights</p>
            </div>
            <div className="feature-item">
              <h3>🎯 Smart Quizzes</h3>
              <p>Adaptive learning technology that focuses on your weakest areas</p>
            </div>
            <div className="feature-item">
              <h3>📚 Comprehensive Resources</h3>
              <p>Access to concept explanations, vocabulary building, and practice materials</p>
            </div>
            <div className="feature-item">
              <h3>🔄 Practice Tests</h3>
              <p>Full-length practice exams that mirror the actual SAT experience</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="footer-cta">
        <div className="section-content">
          <h2>Ready to Boost Your SAT Score?</h2>
          <p>Join thousands of students who have improved their scores with UltraSatPrep</p>
          <div className="final-cta">
            <Link to="/signup" className="cta-button primary large">
              Get Started Free
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
