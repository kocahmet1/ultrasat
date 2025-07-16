import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AdminAccessButton from '../components/AdminAccessButton';
import UltraSATLogo from '../components/UltraSATLogo';
import '../styles/HomePage.css';

function HomePage() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const particlesRef = useRef(null);
  const [animatedScore, setAnimatedScore] = useState(0);
  
  useEffect(() => {
    // Create particle effect
    if (particlesRef.current) {
      const container = particlesRef.current;
      const particleCount = window.innerWidth > 768 ? 50 : 30;
      
      // Clear any existing particles
      container.innerHTML = '';
      
      // Create the particles
      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random size between 3px and 10px
        const size = Math.random() * 7 + 3;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        
        // Random position
        const left = Math.random() * 100;
        const top = Math.random() * 100;
        particle.style.left = `${left}%`;
        particle.style.top = `${top}%`;
        
        // Random opacity
        particle.style.opacity = Math.random() * 0.5 + 0.1;
        
        // Random animation duration
        const duration = Math.random() * 10 + 5;
        particle.style.animationDuration = `${duration}s`;
        
        // Random animation delay
        const delay = Math.random() * 5;
        particle.style.animationDelay = `${delay}s`;
        
        container.appendChild(particle);
      }
    }

    // Animate score counter
    let start = 0;
    const end = 1580;
    const duration = 2000; // 2 seconds
    const increment = end / (duration / 50);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setAnimatedScore(end);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.floor(start));
      }
    }, 50);

    return () => clearInterval(timer);
  }, []);
  
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <div className="home-container">
      <div className="particles-bg" ref={particlesRef}></div>
      
      <header className="home-header">
        <div className="logo-container">
          <UltraSATLogo 
            size="medium" 
            variant="landing" 
            className="home-logo"
          />
        </div>
        <nav className="main-nav">
          <ul>
            {currentUser ? (
              <>
                <li><Link to="/progress">Dashboard</Link></li>
                <li><Link to="/practice-exams">Practice</Link></li>
                <li><Link to="/profile">Profile</Link></li>
                <li><button className="nav-button" onClick={handleLogout}>Logout</button></li>
              </>
            ) : (
              <>
                <li><Link to="/help">Help</Link></li>
                <li><Link to="/login">Login</Link></li>
                <li><Link to="/signup" className="signup-nav-btn">Sign Up Free</Link></li>
              </>
            )}
          </ul>
        </nav>
      </header>
      
      <main className="home-main">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <div className="hero-badge">
              <span>🎯 AI-Powered SAT Prep</span>
            </div>
            <h1 className="hero-title">
              Increase Your SAT Score by <span className="score-highlight">200+ Points</span>
            </h1>
            <p className="hero-subtitle">
              Take a free diagnostic test in 10 minutes and discover exactly which concepts you need to master. 
              Our AI creates a personalized study plan just for you.
            </p>
            
            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-number">{animatedScore}</div>
                <div className="stat-label">Average Score</div>
              </div>
              <div className="stat-divider">•</div>
              <div className="stat-item">
                <div className="stat-number">94%</div>
                <div className="stat-label">Students Improve</div>
              </div>
              <div className="stat-divider">•</div>
              <div className="stat-item">
                <div className="stat-number">50K+</div>
                <div className="stat-label">Practice Questions</div>
              </div>
            </div>

            <div className="hero-cta">
              {currentUser ? (
                <Link to="/practice-exams" className="cta-button primary">
                  Continue Your Prep Journey
                </Link>
              ) : (
                <>
                  <Link to="/signup" className="cta-button primary">
                    Start Free Diagnostic Test
                  </Link>
                  <Link to="/login" className="cta-button secondary">
                    I have an account
            </Link>
                </>
              )}
            </div>

            <div className="trust-indicators">
              <span>✅ No credit card required</span>
              <span>✅ 3 full practice tests free</span>
              <span>✅ Instant score report</span>
            </div>
          </div>
          
          <div className="hero-visual">
            <div className="demo-interface">
              <div className="demo-header">
                <div className="demo-tabs">
                  <div className="demo-tab active">Reading & Writing</div>
                  <div className="demo-tab">Math</div>
                </div>
                <div className="demo-timer">⏱️ 32:00</div>
              </div>
              <div className="demo-question">
                <div className="question-text">
                  Which choice completes the text with the most logical and precise word or phrase?
                </div>
                <div className="demo-options">
                  <div className="demo-option">A) comprehensive</div>
                  <div className="demo-option selected">B) meticulous</div>
                  <div className="demo-option">C) superficial</div>
                  <div className="demo-option">D) haphazard</div>
                </div>
              </div>
              <div className="demo-tools">
                <button className="demo-tool">📝 Cross Out</button>
                <button className="demo-tool">🔖 Mark for Review</button>
              </div>
            </div>
          </div>
        </section>
        
        {/* Instant Value Section */}
        <section className="instant-value-section">
          <div className="instant-value-header">
            <h2>See Your Potential in Minutes</h2>
            <p>Take a quick diagnostic and get immediate insights into your SAT readiness</p>
          </div>
          
          <div className="value-cards">
            <div className="value-card">
              <div className="value-icon">📊</div>
              <h3>Instant Score Prediction</h3>
              <p>Get your estimated SAT score in real-time as you complete questions</p>
              <div className="value-highlight">See results immediately</div>
            </div>
            
            <div className="value-card featured">
              <div className="value-icon">🎯</div>
              <h3>Smart Weakness Detection</h3>
              <p>Our AI identifies exactly which topics are holding you back</p>
              <div className="value-highlight">Personalized insights</div>
            </div>
            
            <div className="value-card">
              <div className="value-icon">🚀</div>
              <h3>Adaptive Learning Path</h3>
              <p>Get a custom study plan that adapts as you improve</p>
              <div className="value-highlight">Tailored to you</div>
            </div>
          </div>

          <div className="instant-cta">
            {!currentUser && (
              <Link to="/signup" className="cta-button large">
                Start Your Free Diagnostic Now →
              </Link>
            )}
          </div>
        </section>

        {/* Feature Showcase */}
        <section className="features-showcase">
          <div className="feature-showcase-item">
            <div className="feature-content">
              <div className="feature-badge">FREE FOREVER</div>
              <h3>Smart Vocabulary Builder</h3>
              <p>
                As you practice, our AI automatically identifies challenging words and builds 
                your personal vocabulary bank. Study with flashcards and track your progress.
              </p>
              <div className="feature-stats">
                <span>📚 10,000+ SAT words</span>
                <span>🧠 AI-powered recommendations</span>
              </div>
              {!currentUser ? (
                <Link to="/signup" className="feature-cta">Try Vocabulary Builder</Link>
              ) : (
                <Link to="/word-bank" className="feature-cta">Open Word Bank</Link>
              )}
            </div>
            <div className="feature-visual">
              <div className="vocab-demo">
                <div className="vocab-card">
                  <div className="vocab-word">Meticulous</div>
                  <div className="vocab-definition">Showing great attention to detail; very careful and precise</div>
                  <div className="vocab-example">"Her meticulous research led to groundbreaking discoveries."</div>
                </div>
                <div className="vocab-progress">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{width: '73%'}}></div>
                  </div>
                  <span>73% mastered</span>
                </div>
              </div>
            </div>
          </div>

          <div className="feature-showcase-item reverse">
            <div className="feature-content">
              <div className="feature-badge">FREE TRIAL</div>
              <h3>Adaptive Smart Quizzes</h3>
              <p>
                Take quizzes that get smarter as you do. Questions adapt to your skill level, 
                focusing on areas where you need the most improvement.
              </p>
              <div className="feature-stats">
                <span>🎯 Questions adapt to your level</span>
                <span>📈 Immediate feedback</span>
              </div>
              {!currentUser ? (
                <Link to="/signup" className="feature-cta">Try Smart Quiz</Link>
              ) : (
                <Link to="/subject-quizzes" className="feature-cta">Take Quiz</Link>
              )}
            </div>
            <div className="feature-visual">
              <div className="quiz-demo">
                <div className="quiz-header">
                  <span className="quiz-subject">Algebra</span>
                  <span className="quiz-level">Level: Intermediate</span>
                </div>
                <div className="quiz-progress">
                  <div className="progress-dots">
                    <div className="dot completed"></div>
                    <div className="dot completed"></div>
                    <div className="dot current"></div>
                    <div className="dot"></div>
                    <div className="dot"></div>
                  </div>
                  <span>Question 3 of 5</span>
                </div>
                <div className="quiz-feedback">
                  <div className="feedback-positive">✅ Correct! Moving to harder questions...</div>
                </div>
              </div>
            </div>
          </div>

          <div className="feature-showcase-item">
            <div className="feature-content">
              <div className="feature-badge">FREE ACCESS</div>
              <h3>Real Practice Tests</h3>
              <p>
                Take full-length practice tests that mirror the actual Digital SAT. 
                Get detailed score breakdowns and see exactly where to focus your study time.
              </p>
              <div className="feature-stats">
                <span>📝 3 full tests free</span>
                <span>⏱️ Real timing conditions</span>
              </div>
              {!currentUser ? (
                <Link to="/signup" className="feature-cta">Take Practice Test</Link>
              ) : (
                <Link to="/practice-exams" className="feature-cta">Start Practice</Link>
              )}
            </div>
            <div className="feature-visual">
              <div className="test-demo">
                <div className="test-modules">
                  <div className="test-module">
                    <span className="module-name">Reading & Writing 1</span>
                    <span className="module-time">32 min</span>
                  </div>
                  <div className="test-module">
                    <span className="module-name">Reading & Writing 2</span>
                    <span className="module-time">32 min</span>
                  </div>
                  <div className="test-break">10 min break</div>
                  <div className="test-module">
                    <span className="module-name">Math 1</span>
                    <span className="module-time">35 min</span>
                  </div>
                  <div className="test-module">
                    <span className="module-name">Math 2</span>
                    <span className="module-time">35 min</span>
                  </div>
                </div>
                <div className="score-preview">
                  <div className="score-total">Total Score: 1420</div>
                  <div className="score-breakdown">
                    <span>Math: 730</span>
                    <span>Reading & Writing: 690</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Social Proof & CTA */}
        <section className="final-cta-section">
          <div className="social-proof">
            <div className="testimonial-grid">
              <div className="testimonial">
                <div className="quote">"Increased my score by 240 points in just 6 weeks!"</div>
                <div className="author">- Sarah M., Cornell '28</div>
              </div>
              <div className="testimonial">
                <div className="quote">"The AI quizzes knew exactly what I needed to practice."</div>
                <div className="author">- Marcus T., MIT '27</div>
              </div>
              <div className="testimonial">
                <div className="quote">"Best SAT prep platform I've ever used. Actually fun!"</div>
                <div className="author">- Emma L., Stanford '28</div>
              </div>
            </div>
          </div>

          <div className="final-cta-content">
            <h2>Ready to Boost Your SAT Score?</h2>
            <p>Join thousands of students who have transformed their scores with UltraSATPrep</p>
            
            {!currentUser ? (
              <div className="final-cta-buttons">
                <Link to="/signup" className="cta-button primary large">
                  Start Free Diagnostic Test
                </Link>
                <div className="cta-subtext">
                  No credit card required • Get results in 10 minutes
                </div>
              </div>
            ) : (
              <div className="final-cta-buttons">
                <Link to="/practice-exams" className="cta-button primary large">
                  Continue Your Prep
                </Link>
                <Link to="/progress" className="cta-button secondary">
                  View Your Progress
          </Link>
            </div>
          )}
          </div>
        </section>
      </main>
      
      {/* Admin Access Utility - only visible when logged in */}
      {currentUser && <AdminAccessButton />}
      
      <footer className="home-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>Product</h4>
            <Link to="/practice-exams">Practice Tests</Link>
            <Link to="/subject-quizzes">Smart Quizzes</Link>
            <Link to="/word-bank">Vocabulary</Link>
          </div>
          <div className="footer-section">
            <h4>Support</h4>
            <Link to="/help">Help Center</Link>
            <Link to="/contact">Contact Us</Link>
          </div>
          <div className="footer-section">
            <h4>Company</h4>
            <Link to="/about">About</Link>
            <Link to="/privacy">Privacy</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 UltraSATPrep | Transform Your SAT Score</p>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
