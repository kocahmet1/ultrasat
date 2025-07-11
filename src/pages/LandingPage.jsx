import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import QuestionBank from '../components/QuestionBank';
import '../styles/LandingPage.css';

const LandingPage = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const particlesRef = useRef(null);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [animatedSuccessRate, setAnimatedSuccessRate] = useState(0);
  const [animatedQuestions, setAnimatedQuestions] = useState(0);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  
  useEffect(() => {
    // Create subtle particle effect
    if (particlesRef.current) {
      const container = particlesRef.current;
      const particleCount = 20; // Fewer particles for cleaner look
      
      container.innerHTML = '';
      
      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        const left = Math.random() * 100;
        const top = Math.random() * 100;
        particle.style.left = `${left}%`;
        particle.style.top = `${top}%`;
        
        const duration = Math.random() * 20 + 10;
        particle.style.animationDuration = `${duration}s`;
        
        const delay = Math.random() * 10;
        particle.style.animationDelay = `${delay}s`;
        
        container.appendChild(particle);
      }
    }

    // Animate score counter
    let scoreStart = 0;
    const scoreEnd = 1580;
    const scoreDuration = 2000;
    const scoreIncrement = scoreEnd / (scoreDuration / 50);
    
    const scoreTimer = setInterval(() => {
      scoreStart += scoreIncrement;
      if (scoreStart >= scoreEnd) {
        setAnimatedScore(scoreEnd);
        clearInterval(scoreTimer);
      } else {
        setAnimatedScore(Math.floor(scoreStart));
      }
    }, 50);

    // Animate success rate counter
    let successStart = 0;
    const successEnd = 94;
    const successDuration = 2200;
    const successIncrement = successEnd / (successDuration / 50);
    
    const successTimer = setInterval(() => {
      successStart += successIncrement;
      if (successStart >= successEnd) {
        setAnimatedSuccessRate(successEnd);
        clearInterval(successTimer);
      } else {
        setAnimatedSuccessRate(Math.floor(successStart));
      }
    }, 50);

    // Animate questions counter
    let questionsStart = 0;
    const questionsEnd = 50;
    const questionsDuration = 2400;
    const questionsIncrement = questionsEnd / (questionsDuration / 50);
    
    const questionsTimer = setInterval(() => {
      questionsStart += questionsIncrement;
      if (questionsStart >= questionsEnd) {
        setAnimatedQuestions(questionsEnd);
        clearInterval(questionsTimer);
      } else {
        setAnimatedQuestions(Math.floor(questionsStart));
      }
    }, 50);

    return () => {
      clearInterval(scoreTimer);
      clearInterval(successTimer);
      clearInterval(questionsTimer);
    };
  }, []);
  
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <div className="landing-page">
      <div className="particles-bg" ref={particlesRef}></div>
      
      {/* Header */}
      <header className="landing-header">
        <div className="container">
          <div className="logo-container">
            <div className="logo-icon">SAT</div>
            <h1>Ultra<span>SAT</span>Prep</h1>
          </div>
          <nav className="main-nav">
            <button 
              className="mobile-nav-toggle"
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
            >
              ☰
            </button>
            <ul className={mobileNavOpen ? 'mobile-nav-open' : ''}>
              {currentUser ? (
                <>
                  <li><Link to="/progress" onClick={() => setMobileNavOpen(false)}>Dashboard</Link></li>
                  <li><Link to="/practice-exams" onClick={() => setMobileNavOpen(false)}>Practice Exams</Link></li>
                  <li><Link to="/subject-quizzes" onClick={() => setMobileNavOpen(false)}>Quizzes</Link></li>
                  <li><Link to="/word-bank" onClick={() => setMobileNavOpen(false)}>Word Bank</Link></li>
                  <li><Link to="/concept-bank" onClick={() => setMobileNavOpen(false)}>Concepts</Link></li>
                  <li><Link to="/flashcards" onClick={() => setMobileNavOpen(false)}>Flashcards</Link></li>
                  <li><Link to="/all-results" onClick={() => setMobileNavOpen(false)}>Results</Link></li>
                  <li><Link to="/profile" onClick={() => setMobileNavOpen(false)}>Profile</Link></li>
                  <li><button className="nav-button" onClick={handleLogout}>Logout</button></li>
                </>
              ) : (
                <>
                  <li><Link to="/practice-exams" onClick={() => setMobileNavOpen(false)}>Practice Exams</Link></li>
                  <li><Link to="/subject-quizzes" onClick={() => setMobileNavOpen(false)}>Quizzes</Link></li>
                  <li><Link to="/word-bank" onClick={() => setMobileNavOpen(false)}>Word Bank</Link></li>
                  <li><Link to="/help" onClick={() => setMobileNavOpen(false)}>Help</Link></li>
                  <li><Link to="/login" onClick={() => setMobileNavOpen(false)}>Login</Link></li>
                  <li><Link to="/signup" className="signup-nav-btn" onClick={() => setMobileNavOpen(false)}>Get Started</Link></li>
                </>
              )}
            </ul>
          </nav>
        </div>
      </header>

      {/* Hero Section - Completely Redesigned */}
      <section className="hero-section-new">
        <div className="container">
          <div className="hero-content-center">
            <div className="hero-badge">
              🎯 AI-Powered SAT Prep
            </div>
            <h1 className="hero-title-center">
              Boost Your SAT Score by <span className="score-highlight">200+ Points</span>
            </h1>

            <div className="hero-stats-grid">
              <div className="stat-card">
                <div className="stat-number">{animatedScore}</div>
                <div className="stat-label">Average Score</div>
              </div>
              <div className="stat-card featured">
                <div className="stat-number">{animatedSuccessRate}%</div>
                <div className="stat-label">Success Rate</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{animatedQuestions}K+</div>
                <div className="stat-label">Questions</div>
              </div>
            </div>
    </div>
  </div>
</section>

      {/* Practice Banner Section - Symmetric Design */}
      <section className="practice-banner-section">
        <div className="container">
          <div className="section-header-center">
            <h2>Experience the Real Digital SAT</h2>
          </div>
          
          <div className="practice-content-grid">
            <div className="practice-exams-list">
              <div className="exam-list-container">
                <div className="exam-item">
                  <button 
                    className="exam-start-button"
                    onClick={() => navigate('/practice-exams')}
                  >
                    <span className="pulse-ring"></span>
                    <span className="button-text">START</span>
                  </button>
                  <div className="exam-details">
                    <h3>SAT Practice Test 1</h3>
                    <p>Full-length adaptive test • 2 hours 14 minutes</p>
                  </div>
                  <div className="exam-badge">Free</div>
                </div>
                
                <div className="exam-item">
                  <button 
                    className="exam-start-button"
                    onClick={() => navigate('/practice-exams')}
                  >
                    <span className="pulse-ring"></span>
                    <span className="button-text">START</span>
                  </button>
                  <div className="exam-details">
                    <h3>SAT Practice Test 2</h3>
                    <p>Full-length adaptive test • 2 hours 14 minutes</p>
                  </div>
                  <div className="exam-badge">Free</div>
                </div>
                
                <div className="exam-item">
                  <button 
                    className="exam-start-button"
                    onClick={() => navigate('/practice-exams')}
                  >
                    <span className="pulse-ring"></span>
                    <span className="button-text">START</span>
                  </button>
                  <div className="exam-details">
                    <h3>SAT Practice Test 3</h3>
                    <p>Full-length adaptive test • 2 hours 14 minutes</p>
                  </div>
                  <div className="exam-badge">Free</div>
                </div>
                
                <div className="exam-item view-all-item">
                  <button 
                    className="exam-start-button view-all-button"
                    onClick={() => navigate('/practice-exams')}
                  >
                    <span className="pulse-ring"></span>
                    <span className="button-text">VIEW</span>
                  </button>
                  <div className="exam-details">
                    <h3>View All 10 Practice Tests</h3>
                    <p>Access our complete collection of SAT practice exams</p>
                  </div>
                  <div className="exam-badge all-tests-badge">10 Tests</div>
                </div>
              </div>
            </div>
            
            <div className="practice-features-grid">
              <div className="practice-feature">
                <div className="feature-icon-box">⏱️</div>
                <h4>Timed Like Real SAT</h4>
                <p>Adaptive timing matches the actual test</p>
              </div>
              <div className="practice-feature">
                <div className="feature-icon-box">📊</div>
                <h4>Instant Score Reports</h4>
                <p>Get detailed analysis immediately</p>
              </div>
              <div className="practice-feature">
                <div className="feature-icon-box">🎯</div>
                <h4>Targeted Practice</h4>
                <p>AI identifies your weak areas</p>
              </div>
              <div className="practice-feature">
                <div className="feature-icon-box">📈</div>
                <h4>Track Progress</h4>
                <p>See your improvement over time</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Question Bank Section */}
      <QuestionBank />

      {/* Core Features Section - Symmetric Grid */}
      <section className="core-features-section">
        <div className="container">
          <div className="section-header-center">
            <h2>Everything You Need to Succeed</h2>
            <p>Comprehensive tools designed to maximize your SAT score</p>
              </div>
          
          <div className="features-grid-symmetric">
            <div className="feature-card">
              <div className="feature-icon-large">📚</div>
              <h3>Smart Vocabulary Builder</h3>
              <p>Learn 10,000+ SAT words with AI-powered flashcards that adapt to your pace</p>
              <ul className="feature-points">
                <li>Spaced repetition algorithm</li>
                <li>Context-based learning</li>
                <li>Progress tracking</li>
              </ul>
              <Link to={currentUser ? "/word-bank" : "/signup"} className="feature-link">
                Build Vocabulary →
              </Link>
            </div>

            <div className="feature-card featured-card">
              <div className="featured-badge">Most Popular</div>
              <div className="feature-icon-large">🧠</div>
              <h3>Adaptive Practice Quizzes</h3>
              <p>Questions that adjust difficulty based on your performance in real-time</p>
              <ul className="feature-points">
                <li>Personalized difficulty</li>
                <li>Instant explanations</li>
                <li>Unlimited practice</li>
              </ul>
              <Link to={currentUser ? "/subject-quizzes" : "/signup"} className="feature-link">
                Start Practicing →
              </Link>
                </div>

            <div className="feature-card">
              <div className="feature-icon-large">📊</div>
              <h3>Performance Analytics</h3>
              <p>Deep insights into your strengths and weaknesses with actionable recommendations</p>
              <ul className="feature-points">
                <li>Skill-level analysis</li>
                <li>Time management stats</li>
                <li>Improvement tracking</li>
              </ul>
              <Link to={currentUser ? "/progress" : "/signup"} className="feature-link">
                View Analytics →
              </Link>
                </div>
              </div>
            </div>
      </section>

      {/* How It Works Section - Symmetric Timeline */}
      <section className="how-it-works-section">
        <div className="container">
          <div className="section-header-center">
            <h2>Your Path to SAT Success</h2>
            <p>A proven 4-step process to achieve your target score</p>
          </div>

          <div className="process-timeline">
            <div className="timeline-connector"></div>
            
            <div className="process-step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h4>Take Diagnostic Test</h4>
                <p>Identify your baseline score and areas for improvement</p>
              </div>
            </div>
            
            <div className="process-step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h4>Get Personalized Plan</h4>
                <p>AI creates a custom study schedule based on your goals</p>
                </div>
                  </div>
            
            <div className="process-step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h4>Practice & Learn</h4>
                <p>Work through adaptive quizzes and targeted lessons</p>
                </div>
                </div>
            
            <div className="process-step">
              <div className="step-number">4</div>
              <div className="step-content">
                <h4>Track Progress</h4>
                <p>Monitor improvements and adjust your strategy</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section - Symmetric Stats */}
      <section className="results-showcase-section">
        <div className="container">
          <div className="section-header-center">
            <h2>Proven Results</h2>
            <p>Real improvements from real students</p>
          </div>
          
          <div className="results-grid">
            <div className="result-stat">
              <div className="result-number">+216</div>
              <div className="result-label">Average Score Increase</div>
              <div className="result-context">Points gained after 3 months</div>
            </div>
            
            <div className="result-stat featured-stat">
              <div className="result-number">87%</div>
              <div className="result-label">Reach Target Score</div>
              <div className="result-context">Students who achieve their goal</div>
                  </div>
            
            <div className="result-stat">
              <div className="result-number">4.8/5</div>
              <div className="result-label">Student Rating</div>
              <div className="result-context">Based on 10,000+ reviews</div>
                  </div>
                </div>

          <div className="testimonials-carousel">
            <div className="testimonial-card">
              <div className="stars">⭐⭐⭐⭐⭐</div>
              <div className="testimonial-quote">
                "The adaptive quizzes knew exactly what I needed to practice. My math score improved by 130 points!"
              </div>
              <div className="testimonial-author">
                <strong>Sarah Chen</strong>
                <span>Stanford '28</span>
                  </div>
            </div>
            
            <div className="testimonial-card">
              <div className="stars">⭐⭐⭐⭐⭐</div>
              <div className="testimonial-quote">
                "Best SAT prep I've used. The instant feedback helped me understand my mistakes immediately."
              </div>
              <div className="testimonial-author">
                <strong>Marcus Johnson</strong>
                <span>MIT '27</span>
            </div>
            </div>
            
            <div className="testimonial-card">
              <div className="stars">⭐⭐⭐⭐⭐</div>
              <div className="testimonial-quote">
                "Went from 1320 to 1540 in just 2 months. The personalized study plan made all the difference."
              </div>
              <div className="testimonial-author">
                <strong>Emma Rodriguez</strong>
                <span>Yale '28</span>
            </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section - Symmetric Cards */}
      <section className="pricing-section">
        <div className="container">
          <div className="section-header-center">
            <h2>Choose Your Plan</h2>
            <p>Start free, upgrade when you're ready</p>
          </div>
          
          <div className="pricing-grid">
            <div className="pricing-card">
              <div className="plan-name">Free</div>
              <div className="plan-price">
                <span className="price-number">$0</span>
                <span className="price-period">forever</span>
              </div>
              <ul className="plan-features">
                <li>✓ 3 full practice tests</li>
                <li>✓ 1,000 practice questions</li>
                <li>✓ Basic vocabulary builder</li>
                <li>✓ Score reports</li>
                <li>✓ Progress tracking</li>
              </ul>
              <Link to="/signup" className="plan-cta secondary">
                Start Free
              </Link>
            </div>
            
            <div className="pricing-card featured-pricing">
              <div className="popular-badge">Most Popular</div>
              <div className="plan-name">Premium</div>
              <div className="plan-price">
                <span className="price-number">$49</span>
                <span className="price-period">/month</span>
              </div>
              <ul className="plan-features">
                <li>✓ Everything in Free</li>
                <li>✓ Unlimited practice tests</li>
                <li>✓ 50,000+ questions</li>
                <li>✓ AI study planner</li>
                <li>✓ Video explanations</li>
                <li>✓ Priority support</li>
              </ul>
              <Link to="/signup" className="plan-cta primary">
                Start 7-Day Trial
              </Link>
            </div>
            
            <div className="pricing-card">
              <div className="plan-name">Ultimate</div>
              <div className="plan-price">
                <span className="price-number">$99</span>
                <span className="price-period">/month</span>
              </div>
              <ul className="plan-features">
                <li>✓ Everything in Premium</li>
                <li>✓ 1-on-1 tutoring sessions</li>
                <li>✓ Essay grading</li>
                <li>✓ College counseling</li>
                <li>✓ Score guarantee</li>
              </ul>
              <Link to="/signup" className="plan-cta secondary">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="final-cta-section-new">
        <div className="container">
          <div className="final-cta-content-center">
            <h2>Ready to Ace the SAT?</h2>
            <p>Join 100,000+ students who've improved their scores with UltraSATPrep</p>
            
            {!currentUser ? (
              <div className="final-cta-buttons-center">
            <Link to="/signup" className="cta-button primary large">
              Get Started Free
            </Link>
                <div className="cta-subtext">
                  No credit card required • Results in 10 minutes
                </div>
              </div>
            ) : (
              <div className="final-cta-buttons-center">
                <Link to="/practice-exams" className="cta-button primary large">
                  Continue Practicing
                </Link>
                <Link to="/progress" className="cta-button secondary large">
                  View Progress
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer - Symmetric Layout */}
      <footer className="landing-footer-new">
        <div className="container">
          <div className="footer-content-grid">
            <div className="footer-brand">
              <div className="footer-logo">
                <div className="logo-icon">SAT</div>
                <h3>Ultra<span>SAT</span>Prep</h3>
              </div>
              <p>Your AI-powered path to SAT success</p>
              <div className="social-links">
                <a href="https://twitter.com/ultrasatprep" aria-label="Twitter">𝕏</a>
                <a href="https://facebook.com/ultrasatprep" aria-label="Facebook">f</a>
                <a href="https://instagram.com/ultrasatprep" aria-label="Instagram">📷</a>
                <a href="https://youtube.com/ultrasatprep" aria-label="YouTube">▶</a>
              </div>
            </div>
            
            <div className="footer-links-grid">
              <div className="footer-column">
            <h4>Features</h4>
            <Link to="/practice-exams">Practice Tests</Link>
            <Link to="/subject-quizzes">Smart Quizzes</Link>
            <Link to="/word-bank">Vocabulary Builder</Link>
            <Link to="/concept-bank">Concept Bank</Link>
          </div>
              
              <div className="footer-column">
                <h4>Resources</h4>
            <Link to="/help">Help Center</Link>
                <Link to="/blog">Blog</Link>
                <Link to="/sat-guide">SAT Guide</Link>
                <Link to="/score-calculator">Score Calculator</Link>
          </div>
              
              <div className="footer-column">
            <h4>Company</h4>
            <Link to="/about">About Us</Link>
                <Link to="/contact">Contact</Link>
                <Link to="/careers">Careers</Link>
                <Link to="/press">Press</Link>
              </div>
              
              <div className="footer-column">
                <h4>Legal</h4>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
                <Link to="/cookies">Cookie Policy</Link>
                <Link to="/accessibility">Accessibility</Link>
              </div>
            </div>
          </div>
          
          <div className="footer-bottom-new">
            <p>&copy; 2025 UltraSATPrep. All rights reserved.</p>
            <div className="footer-badges">
              <span>🔒 SSL Secured</span>
              <span>✓ COPPA Compliant</span>
              <span>🏆 College Board Partner</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
