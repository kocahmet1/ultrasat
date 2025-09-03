import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import QuestionBank from '../components/QuestionBank';
import ExamAuthModal from '../components/ExamAuthModal';
import QuizAuthModal from '../components/QuizAuthModal';
import OptimizedImage from '../components/OptimizedImage';
import UltraSATLogo from '../components/UltraSATLogo';
import { getAllPracticeExams } from '../firebase/services';
import { getRecentBlogPosts } from '../firebase/blogServices';
import '../styles/LandingPage.css';
import { getKebabCaseFromAnyFormat } from '../utils/subcategoryConstants';
 

const LandingPage = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const particlesRef = useRef(null);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [animatedSuccessRate, setAnimatedSuccessRate] = useState(0);
  const [animatedQuestions, setAnimatedQuestions] = useState(0);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [modalExamId, setModalExamId] = useState(null);
  const [modalActionType, setModalActionType] = useState('start');
  const [practiceExams, setPracticeExams] = useState([]);
  const [recentBlogs, setRecentBlogs] = useState([]);
  const [quizAuthOpen, setQuizAuthOpen] = useState(false);
  const [quizPath, setQuizPath] = useState('');
  const [quizLabel, setQuizLabel] = useState('');
  const [quizState, setQuizState] = useState(null);
  
  // Map landing keys to canonical kebab-case subcategories used by guest quizzes
  const mapLandingKeyToCanonical = (key) => {
    const lower = String(key || '').toLowerCase();
    const explicitMap = {
      vocabulary: 'words-in-context',
      'linear-equations': 'linear-equations-one-variable',
    };
    return explicitMap[lower] || getKebabCaseFromAnyFormat(lower) || lower;
  };
  
  // Fetch practice exams on component mount (only if user is authenticated)
  useEffect(() => {
    const fetchPracticeExams = async () => {
      // Only fetch if user is authenticated to avoid permissions error
      if (!currentUser) {
        // For unauthenticated users, we'll handle exam selection when they try to start
        setPracticeExams([]);
        return;
      }
      
      try {
        const exams = await getAllPracticeExams(true); // Only public exams
        
        // Sort exams numerically by title to match the display order
        exams.sort((a, b) => {
          const numA = parseInt(a.title.match(/\d+/)?.[0] || 0, 10);
          const numB = parseInt(b.title.match(/\d+/)?.[0] || 0, 10);
          return numA - numB;
        });
        
        setPracticeExams(exams);
      } catch (error) {
        console.error('Error fetching practice exams:', error);
        // Silently fail for unauthenticated users
        setPracticeExams([]);
      }
    };
    
    fetchPracticeExams();
  }, [currentUser]); // Re-fetch when currentUser changes

  // Fetch recent blog posts
  useEffect(() => {
    const fetchRecentBlogs = async () => {
      try {
        const blogs = await getRecentBlogPosts(2); // Get latest 2 blogs
        setRecentBlogs(blogs);
      } catch (error) {
        console.error('Error fetching recent blogs:', error);
        setRecentBlogs([]);
      }
    };
    
    fetchRecentBlogs();
  }, []);
  
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
    const scoreEnd = 1550;
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
    const questionsEnd = 8;
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

  const handleExamStart = (examIndex) => {
    if (currentUser) {
      // User is logged in, navigate directly to the specific exam
      const exam = practiceExams[examIndex];
      if (exam) {
        navigate(`/practice-exam/${exam.id}`, { 
          state: { startExam: true } 
        });
      } else {
        // Fallback: navigate to practice exams list
        navigate('/practice-exams');
      }
    } else {
      // User not logged in, show auth modal with exam number
      setModalExamId(examIndex + 1); // Store exam number (1, 2, 3) for display
      setModalActionType('start');
      setAuthModalOpen(true);
    }
  };

  const handleViewAllExams = () => {
    if (currentUser) {
      // User is logged in, navigate directly
      navigate('/practice-exams');
    } else {
      // User not logged in, show auth modal
      setModalExamId(null);
      setModalActionType('view');
      setAuthModalOpen(true);
    }
  };

  const handlePredictiveTest = () => {
    if (currentUser) {
      // User is logged in, navigate to the dedicated Predictive Exam page
      navigate('/predictive-exam');
    } else {
      // Guest: open the guest meta quiz builder on the guest subject quizzes page
      navigate('/guest-subject-quizzes', { state: { openMeta: true } });
    }
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
    setModalExamId(null);
    setModalActionType('start');
  };

  // Gated navigation for quiz tiles with navigation state
  const handleQuizTileClick = (e, subcategoryId, label) => {
    e.preventDefault();
    if (currentUser) {
      // Preserve existing behavior for logged-in users
      const navObj = { pathname: '/smart-quiz-generator', state: { subcategoryId } };
      navigate(navObj.pathname, { state: navObj.state });
    } else {
      // Guest users: go straight to guest-smart-quiz with medium difficulty
      const canonicalSub = mapLandingKeyToCanonical(subcategoryId);
      navigate('/guest-smart-quiz', {
        state: {
          subcategoryId: canonicalSub,
          forceLevel: 2, // Medium
        },
      });
    }
  };

  return (
    <div className="landing-page">
      <div className="particles-bg" ref={particlesRef}></div>
      
      {/* Header */}
      <header className="landing-header">
        <div className="container">
          <div className="logo-container">
            <UltraSATLogo 
              size="medium" 
              variant="landing" 
              className="landing-logo"
            />
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
                  <li><Link to="/subject-quizzes" onClick={() => setMobileNavOpen(false)}>Question Bank</Link></li>
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
                  <li><Link to="/subject-quizzes" onClick={() => setMobileNavOpen(false)}>Question Bank</Link></li>
                  <li><Link to="/word-bank" onClick={() => setMobileNavOpen(false)}>Word Bank</Link></li>
                  <li><Link to="/concept-bank" onClick={() => setMobileNavOpen(false)}>Concept Bank</Link></li>
                  <li><Link to="/flashcards" onClick={() => setMobileNavOpen(false)}>Flashcards</Link></li>
                  <li><Link to="/lectures" onClick={() => setMobileNavOpen(false)}>Lectures</Link></li>
                  <li><Link to="/blog" onClick={() => setMobileNavOpen(false)}>Blog</Link></li>
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
            <h1 className="hero-title-center">
              Boost Your SAT Score by <span className="score-highlight">200+ Points</span>
            </h1>

            <div className="hero-stats-grid">
              <div className="stat-card">
                <div className="stat-achieve">Achieve</div>
                <div className="stat-number">{animatedScore}+</div>
                <div className="stat-label"></div>
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
        {/* Removed central header; adding individual column headers below */}
        
        <div className="practice-content-grid">
          <div className="practice-exams-list">
            <div className="column-header">
              <h3>Take a Practice Test Now</h3>
            </div>
            <div className="exam-list-container">
              <div className="exam-item">
                <div className="exam-badge">Free</div>
                <div className="exam-details">
                  <h3>SAT Practice Test 1</h3>
                  <p>Full-length • 4 Modules • 98 Questions</p>
                </div>
                <button 
                  className="exam-start-button first-test-pulsate"
                  onClick={() => handleExamStart(0)}
                >
                  <span className="pulse-ring"></span>
                  <span className="button-text">START</span>
                </button>
              </div>
              
              <div className="exam-item">
                <div className="exam-badge">Free</div>
                <div className="exam-details">
                  <h3>SAT Practice Test 2</h3>
                  <p>Full-length • 4 Modules • 98 Questions</p>
                </div>
                <button 
                  className="exam-start-button"
                  onClick={() => handleExamStart(1)}
                >
                  <span className="pulse-ring"></span>
                  <span className="button-text">START</span>
                </button>
              </div>
              
              <div className="exam-item">
                <div className="exam-badge">Free</div>
                <div className="exam-details">
                  <h3>SAT Practice Test 3</h3>
                  <p>Full-length • 4 Modules • 98 Questions</p>
                </div>
                <button 
                  className="exam-start-button"
                  onClick={() => handleExamStart(2)}
                >
                  <span className="pulse-ring"></span>
                  <span className="button-text">START</span>
                </button>
              </div>
              
              <div className="exam-item view-all-item">
                <div className="exam-badge all-tests-badge">FREE</div>
                <div className="exam-details">
                  <h3>Predictive Test</h3>
                  <p>Estimate your current SAT score in <span className="highlight-green">30 minutes</span></p>
                </div>
                <button 
                  className="exam-start-button view-all-button"
                  onClick={handlePredictiveTest}
                >
                  <span className="pulse-ring"></span>
                  <span className="button-text">START</span>
                </button>
              </div>
            </div>
          </div>
          <div className="practice-features-image">
            <div className="right-column-inner">
              <div className="column-header">
                <h3>Question Bank</h3>
              </div>
              <div className="landing-quiz-grid">
                <Link
                  to="#"
                  onClick={(e) => handleQuizTileClick(e, 'vocabulary', 'Vocabulary')}
                  className="landing-quiz-card landing-quiz-card--small pos-tl theme-blue"
                >
                  <div className="card-header">Vocabulary</div>
                  <div className="card-body">
                    <span className="card-meta">Reading and writing. 5 questions</span>
                  </div>
                  <span className="card-cta small">Start Quiz</span>
                </Link>
                
                <Link
                  to="#"
                  onClick={(e) => handleQuizTileClick(e, 'circles', 'Circles')}
                  className="landing-quiz-card landing-quiz-card--small pos-tr theme-purple"
                >
                  <div className="card-header">Circles</div>
                  <div className="card-body">
                    <span className="card-meta">Math. 5 questions</span>
                  </div>
                  <span className="card-cta small">Start Quiz</span>
                </Link>
                
                <Link
                  to="#"
                  onClick={(e) => { e.preventDefault(); handlePredictiveTest(); }}
                  className="landing-quiz-card landing-quiz-card--large pos-center first-test-pulsate theme-green"
                  aria-label="Create a mini test"
                >
                  <div className="card-header">Create a mini test</div>
                  <div className="card-body">
                    <span className="card-title">Choose question topics</span>
                    <span className="card-meta">Choose difficulty level and number of questions</span>
                  </div>
                  <span className="card-cta">START</span>
                </Link>
                
                <Link
                  to="#"
                  onClick={(e) => handleQuizTileClick(e, 'boundaries', 'Boundaries')}
                  className="landing-quiz-card landing-quiz-card--small pos-ml theme-orange"
                >
                  <div className="card-header">Boundaries</div>
                  <div className="card-body">
                    <span className="card-meta">Reading and writing. 5 questions</span>
                  </div>
                  <span className="card-cta small">Start Quiz</span>
                </Link>
                
                <Link
                  to="#"
                  onClick={(e) => handleQuizTileClick(e, 'linear-equations', 'Linear Equations')}
                  className="landing-quiz-card landing-quiz-card--small pos-mr theme-teal"
                >
                  <div className="card-header">Linear Equations</div>
                  <div className="card-body">
                    <span className="card-meta">Math. 5 questions</span>
                  </div>
                  <span className="card-cta small">Start Quiz</span>
                </Link>

                {/* New bottom-left CTA: Ten more quizzes */}
                <Link
                  to="/guest-subject-quizzes"
                  className="landing-quiz-card landing-quiz-card--small pos-bl theme-gray"
                >
                  <div className="card-body">
                    <span className="card-title">8 more Reading and Writing quiz topics</span>
                  </div>
                  <span className="card-cta">VIEW ALL</span>
                </Link>

                {/* New bottom-right CTA: Ten more quizzes */}
                <Link
                  to="/guest-subject-quizzes"
                  className="landing-quiz-card landing-quiz-card--small pos-br theme-gray"
                >
                  <div className="card-body">
                    <span className="card-title">17 more Math quiz topics</span>
                  </div>
                  <span className="card-cta">VIEW ALL</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      </section>

      {/* Question Bank Section */}
      <QuestionBank />

      {/* Bluebook on Phone Section */}
      <section className="bluebook-phone-section">
        <div className="container">
          <div className="section-header-center">
            <h2>Bluebook on Your Phone!</h2>
          </div>
          
          <div className="bluebook-content-grid">
            <div className="phone-image-container">
              <OptimizedImage 
                src="/images/phonescreen.webp" 
                mobileSrc="/images/phonescreen-mobile.webp"
                alt="Bluebook Digital SAT on Mobile" 
                className="phone-screen-image"
              />
            </div>
            
            <div className="phone-features-container">
              <div className="phone-feature-item">
                <div className="phone-feature-icon">📱</div>
                <div className="phone-feature-content">
                  <h4>Mobile Comfort</h4>
                  <p>Enjoy the comfort of taking bluebook tests on your phone</p>
                </div>
              </div>
              
              <div className="phone-feature-item">
                <div className="phone-feature-icon">🔄</div>
                <div className="phone-feature-content">
                  <h4>Feature Coming Soon</h4>
                  <p>More exciting mobile features are on the way</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

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
              <p>Improve your SAT Vocabulary with AI-powered flashcards that adapt to your pace</p>
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

      {/* Recent Blog Posts Section */}
      <section className="recent-blogs-section">
        <div className="container">
          <div className="section-header-center">
            <h2>Latest from Our Blog</h2>
            <p>Stay updated with the latest SAT tips, strategies, and insights</p>
          </div>
          
          {recentBlogs.length > 0 ? (
            <div className="blog-posts-grid">
              {recentBlogs.map((blog, index) => (
                <div key={blog.id} className="blog-post-card">
                  <div className="blog-image-container">
                    {blog.imageUrl ? (
                      <img 
                        src={blog.imageUrl} 
                        alt={blog.title}
                        className="blog-image"
                      />
                    ) : (
                      <div className="blog-image-placeholder">
                        <div className="blog-icon">📚</div>
                      </div>
                    )}
                    <div className="blog-category-badge">{blog.category || 'SAT Tips'}</div>
                  </div>
                  
                  <div className="blog-content">
                    <h3 className="blog-title">{blog.title}</h3>
                    <p className="blog-excerpt">{blog.excerpt}</p>
                    
                    <div className="blog-meta">
                      <span className="blog-read-time">{blog.readTime || 5} min read</span>
                      <Link to={`/blog/${blog.id}`} className="blog-read-more">
                        Read More →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="blog-placeholder">
              <div className="placeholder-icon">📝</div>
              <h3>Coming Soon!</h3>
              <p>We're working on some amazing SAT prep content for you. Check back soon!</p>
              <Link to="/blog" className="blog-read-more">
                Visit Our Blog →
              </Link>
            </div>
          )}
          
          <div className="blog-section-cta">
            <Link to="/blog" className="cta-button secondary">
              View All Articles
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="final-cta-section-new">
        <div className="container">
          <div className="final-cta-content-center">
            <h2>Ready to Ace the SAT?</h2>

            
            {!currentUser ? (
              <div className="final-cta-buttons-center">
            <Link to="/signup" className="cta-button primary large">
              Get Started Free
            </Link>

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
                <Link to="/score-calculator">Digital SAT College Finder</Link>
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

      {/* Auth Modals */}
      <ExamAuthModal
        isOpen={authModalOpen}
        onClose={closeAuthModal}
        examId={modalExamId}
        actionType={modalActionType}
      />

      <QuizAuthModal
        isOpen={quizAuthOpen}
        onClose={() => setQuizAuthOpen(false)}
        quizPath={quizPath}
        quizLabel={quizLabel}
        quizState={quizState}
      />
    </div>
  );
};

export default LandingPage;
