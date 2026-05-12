import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import QuestionBank from '../components/QuestionBank';
import ExamAuthModal from '../components/ExamAuthModal';
import QuizAuthModal from '../components/QuizAuthModal';
import OptimizedImage from '../components/OptimizedImage';
import UltraSATLogo from '../components/UltraSATLogo';
import {
  FaArrowRight,
  FaAward,
  FaBookOpen,
  FaBullseye,
  FaChartBar,
  FaChartLine,
  FaCheck,
  FaClipboardList,
  FaExternalLinkAlt,
  FaHome,
  FaMobileAlt,
  FaQuestionCircle,
  FaRegClone,
  FaRobot,
  FaShieldAlt,
  FaStar,
  FaSyncAlt,
  FaTrophy,
} from 'react-icons/fa';
import { getAllPracticeExams } from '../firebase/services';
import { getRecentBlogPosts } from '../firebase/blogServices';
import '../styles/LandingPage.css';
import { getKebabCaseFromAnyFormat } from '../utils/subcategoryConstants';
 

const LandingPage = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const particlesRef = useRef(null);
  const navRef = useRef(null);
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
  const [quizPath] = useState('');
  const [quizLabel] = useState('');
  const [quizState] = useState(null);
  const questionBankHref = currentUser ? '/subject-quizzes' : '/guest-subject-quizzes';
  const aiCoachHref = currentUser ? '/ai-coach' : '/signup';
  const flashcardsHref = currentUser ? '/flashcards' : '/signup';
  const pricingHref = currentUser ? '/membership/upgrade' : '/signup';
  
  // Map landing keys to canonical kebab-case subcategories used by guest quizzes
  const mapLandingKeyToCanonical = (key) => {
    const lower = String(key || '').toLowerCase();
    const explicitMap = {
      vocabulary: 'words-in-context',
      'linear-equations': 'linear-equations-one-variable',
    };
    return explicitMap[lower] || getKebabCaseFromAnyFormat(lower) || lower;
  };
  
  // Close mobile nav when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target) && mobileNavOpen) {
        setMobileNavOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [mobileNavOpen]);
  
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

  // Lightweight tilt interaction for quiz cards (desktop only)
  useEffect(() => {
    if (!(window && window.matchMedia && window.matchMedia('(pointer: fine)').matches)) return;
    const cards = document.querySelectorAll('.landing-quiz-card.tilt-card');
    if (!cards.length) return;

    const maxTiltDeg = 10;

    const handleMove = (e) => {
      const card = e.currentTarget;
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width; // 0..1
      const py = (e.clientY - rect.top) / rect.height; // 0..1
      const rotateX = (0.5 - py) * maxTiltDeg;
      const rotateY = (px - 0.5) * maxTiltDeg;
      card.style.transform = `perspective(700px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    };

    const handleLeave = (e) => {
      const card = e.currentTarget;
      card.style.transform = '';
    };

    cards.forEach((card) => {
      card.addEventListener('mousemove', handleMove);
      card.addEventListener('mouseleave', handleLeave);
    });

    return () => {
      cards.forEach((card) => {
        card.removeEventListener('mousemove', handleMove);
        card.removeEventListener('mouseleave', handleLeave);
      });
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
          <nav className="main-nav" ref={navRef}>
            <div className="mobile-quick-links">
              {!currentUser && (
                <Link to="/signup" className="signup-nav-btn" onClick={() => setMobileNavOpen(false)}>Sign Up</Link>
              )}
              {currentUser && (
                <Link to="/progress" className="signup-nav-btn" onClick={() => setMobileNavOpen(false)}>Dashboard</Link>
              )}
              <Link to="/practice-exams" onClick={() => setMobileNavOpen(false)}>Practice</Link>
              <Link to={questionBankHref} onClick={() => setMobileNavOpen(false)}>Questions</Link>
              <button 
                className="mobile-more-button"
                onClick={() => setMobileNavOpen(!mobileNavOpen)}
                aria-expanded={mobileNavOpen}
                aria-controls="landing-mobile-menu"
              >
                More ▾
              </button>
            </div>
            <ul className={mobileNavOpen ? 'mobile-nav-open' : ''}>
              {currentUser ? (
                <>
                  <li><Link to="/progress" onClick={() => setMobileNavOpen(false)}>Dashboard</Link></li>
                  <li><Link to="/practice-exams" onClick={() => setMobileNavOpen(false)}>Practice Exams</Link></li>
                  <li><Link to={questionBankHref} onClick={() => setMobileNavOpen(false)}>Question Bank</Link></li>
                  <li><Link to="/flashcards" onClick={() => setMobileNavOpen(false)}>Flashcards</Link></li>
                  <li><Link to={aiCoachHref} onClick={() => setMobileNavOpen(false)}>AI Coach</Link></li>
                  <li><Link to={pricingHref} onClick={() => setMobileNavOpen(false)}>Pricing</Link></li>
                  <li><Link to="/profile" onClick={() => setMobileNavOpen(false)}>Profile</Link></li>
                  <li><button className="nav-button" onClick={handleLogout}>Logout</button></li>
                </>
              ) : (
                <>
                  <li><Link to="/practice-exams" onClick={() => setMobileNavOpen(false)}>Practice Exams</Link></li>
                  <li><Link to={questionBankHref} onClick={() => setMobileNavOpen(false)}>Question Bank</Link></li>
                  <li><Link to={flashcardsHref} onClick={() => setMobileNavOpen(false)}>Flashcards</Link></li>
                  <li><Link to={aiCoachHref} onClick={() => setMobileNavOpen(false)}>AI Coach</Link></li>
                  <li><Link to={pricingHref} onClick={() => setMobileNavOpen(false)}>Pricing</Link></li>
                  <li><Link to="/login" onClick={() => setMobileNavOpen(false)}>Login</Link></li>
                  <li><Link to="/signup" className="signup-nav-btn" onClick={() => setMobileNavOpen(false)}>Sign Up</Link></li>
                </>
              )}
            </ul>
          </nav>
        </div>
      </header>

      {/* Mobile nav overlay */}
      {mobileNavOpen && (
        <div 
          className="mobile-nav-overlay" 
          onClick={() => setMobileNavOpen(false)}
        ></div>
      )}

      <section className="sat-hero-reference">
        <div className="sat-hero-shell">
          <div className="sat-hero-copy">
            <div className="sat-hero-badge">
              <FaCheck aria-hidden="true" />
              <span>Official past Digital SAT exams included</span>
            </div>

            <h1 className="sat-hero-statement">
              <span>Prepare for the</span>
              <span>Digital SAT</span>
              <span>the <strong>Smart Way</strong></span>
            </h1>

            <div className="sat-hero-actions">
              <button type="button" className="sat-primary-action" onClick={() => handleExamStart(0)}>
                Start Free Practice Test
                <FaArrowRight aria-hidden="true" />
              </button>
              <Link to="/practice-exams" className="sat-secondary-action">
                See Official Exams
              </Link>
            </div>

            <div className="sat-hero-stats" aria-label="UltraSATPrep results and content">
              <div>
                <strong>{animatedQuestions}K+</strong>
                <span>Practice Questions</span>
              </div>
              <div>
                <strong>10+</strong>
                <span>Official Exams</span>
              </div>
              <div>
                <strong>20</strong>
                <span>Bluebook Style Exams</span>
              </div>
            </div>
          </div>

          <div className="sat-hero-visual" aria-label="Digital SAT practice interface preview">
            <div className="sat-bluebook-window">
              <div className="sat-bluebook-titlebar">
                <span>Bluebook</span>
                <span aria-hidden="true">x</span>
              </div>

              <div className="sat-bluebook-header">
                <div>
                  <strong>Section 1: Reading and Writing</strong>
                  <button type="button">Directions</button>
                </div>
                <div className="sat-bluebook-timer">
                  <strong>0:00</strong>
                  <button type="button">Hide</button>
                </div>
                <div className="sat-bluebook-tools">
                  <span>Annotate</span>
                  <span>Notes</span>
                </div>
              </div>

              <div className="sat-question-progress" aria-hidden="true">
                {Array.from({ length: 30 }).map((_, index) => (
                  <span key={index} className={index % 6 === 0 ? 'marked' : index % 4 === 0 ? 'answered' : ''}></span>
                ))}
              </div>

              <div className="sat-bluebook-body">
                <div className="sat-passage-panel">
                  <p className="sat-passage-kicker">
                    The following text is from Herman Melville's 1854 novel <em>The Lightning-rod Man.</em>
                  </p>
                  <p>
                    The stranger still stood in the exact middle of the cottage, where he had first
                    planted himself. His immovable posture suggested a person deciding whether to
                    proceed or pause.
                  </p>
                  <p>
                    A calm, deliberate expression crossed his face as he surveyed the room and noticed
                    the details that the others had missed.
                  </p>
                </div>

                <div className="sat-question-panel">
                  <div className="sat-question-head">
                    <span>2</span>
                    <label>
                      <input type="checkbox" readOnly />
                      Mark for Review
                    </label>
                  </div>
                  <h3>Which choice best states the function of the underlined sentence?</h3>
                  <div className="sat-answer-options">
                    {[
                      'It elaborates on the previous sentence.',
                      'It introduces the setting described later.',
                      'It establishes a contrast in the description.',
                      'It sets up the character description that follows.',
                    ].map((answer, index) => (
                      <div className="sat-answer-option" key={answer}>
                        <span>{String.fromCharCode(65 + index)}</span>
                        <p>{answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="sat-bluebook-footer">
                <button type="button">Back</button>
                <button type="button">Next</button>
              </div>
            </div>

            <div className="sat-floating-card sat-official-card">
              <div className="sat-floating-title">
                <span className="sat-feature-icon official"><FaClipboardList aria-hidden="true" /></span>
                <div>
                  <span>Official</span>
                  <h3>Official Digital SAT Exams</h3>
                  <p>Past official exams from the College Board.</p>
                </div>
              </div>
              <div className="sat-exam-list">
                {['Practice Test 1', 'Practice Test 2', 'Practice Test 3', 'Practice Test 4'].map((exam, index) => (
                  <div className="sat-exam-row" key={exam}>
                    <FaBookOpen aria-hidden="true" />
                    <div>
                      <strong>{exam}</strong>
                      <span>Full length - 2h 14m - 98 Questions</span>
                    </div>
                    <span className={index === 0 ? 'completed' : index === 2 ? 'active' : ''}>
                      {index === 0 ? 'Completed' : index === 2 ? 'In Progress' : 'Not Started'}
                    </span>
                  </div>
                ))}
                <div className="sat-exam-row compact">
                  <FaRegClone aria-hidden="true" />
                  <div>
                    <strong>Question Sets</strong>
                    <span>Adaptive sets - Timed or Untimed</span>
                  </div>
                  <span>Explore</span>
                </div>
              </div>
              <Link to="/practice-exams" className="sat-floating-action">
                See All Official Exams
                <FaArrowRight aria-hidden="true" />
              </Link>
            </div>

            <div className="sat-floating-card sat-bank-card">
              <div className="sat-floating-title">
                <span className="sat-feature-icon bank"><FaRegClone aria-hidden="true" /></span>
                <div>
                  <h3>Question Bank</h3>
                  <p>Targeted practice from thousands of SAT questions.</p>
                </div>
              </div>
              <ul>
                <li><FaCheck aria-hidden="true" />8K+ Questions</li>
                <li><FaCheck aria-hidden="true" />By topic</li>
                <li><FaCheck aria-hidden="true" />Instant feedback</li>
              </ul>
              <Link to={questionBankHref} className="sat-floating-action">
                Explore Question Bank
                <FaArrowRight aria-hidden="true" />
              </Link>
            </div>

            <div className="sat-floating-card sat-ai-card">
              <div>
                <h3>AI Coach <span>Beta</span></h3>
                <p>Personalized guidance tailored to your weak areas.</p>
                <Link to={aiCoachHref}>Ask AI Coach</Link>
              </div>
              <div className="sat-coach-robot" aria-hidden="true">
                <div>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="sat-hero-feature-strip" aria-label="Landing page feature summary">
          <div className="sat-feature-item">
            <span><FaClipboardList aria-hidden="true" /></span>
            <div>
              <h3>Official Exams</h3>
              <p>Practice with real past Digital SAT exams from the College Board.</p>
            </div>
          </div>
          <div className="sat-feature-item">
            <span><FaRobot aria-hidden="true" /></span>
            <div>
              <h3>AI Coach</h3>
              <p>Get personalized study plans and instant feedback.</p>
            </div>
          </div>
          <div className="sat-feature-item">
            <span><FaChartBar aria-hidden="true" /></span>
            <div>
              <h3>Adaptive Practice</h3>
              <p>Smart practice that focuses on weak areas to help you improve faster.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="hero-section-new">
        <div className="hero-shell">
          <div className="hero-content-center">
            <div className="hero-badge-prominent">
              <FaShieldAlt aria-hidden="true" />
              <span>Includes official past Digital SAT exams</span>
            </div>

            <h1 className="hero-title-center">
              <span className="hero-title-copy">Practice for the Digital SAT with a</span>
              <span className="score-highlight">smarter study system</span>
            </h1>
            <p className="hero-subtitle-center">
              Master the Digital SAT with official past digital exams and official questions,
              full-length practice tests, a powerful question bank, flashcards, and an AI
              study coach that builds your perfect plan.
            </p>

            <div className="hero-cta-center">
              <button type="button" className="cta-button primary" onClick={() => handleExamStart(0)}>
                Start Free Practice Test
                <FaArrowRight aria-hidden="true" />
              </button>
              <Link to={questionBankHref} className="cta-button secondary">
                Explore Question Bank
                <FaExternalLinkAlt aria-hidden="true" />
              </Link>
            </div>

            <div className="hero-stats-grid">
              <div className="stat-card">
                <span className="stat-icon stat-icon-gold"><FaTrophy aria-hidden="true" /></span>
                <div className="stat-number">{animatedScore}+</div>
                <div className="stat-label">Top Score Achieved</div>
              </div>
              <div className="stat-card featured">
                <span className="stat-icon stat-icon-blue"><FaQuestionCircle aria-hidden="true" /></span>
                <div className="stat-number">{animatedQuestions}K+</div>
                <div className="stat-label">Practice Questions</div>
              </div>
              <div className="stat-card">
                <span className="stat-icon stat-icon-green"><FaChartLine aria-hidden="true" /></span>
                <div className="stat-number">{animatedSuccessRate}%</div>
                <div className="stat-label">Success Rate</div>
              </div>
              <div className="stat-card">
                <span className="stat-icon stat-icon-shield"><FaShieldAlt aria-hidden="true" /></span>
                <div className="stat-number">10+</div>
                <div className="stat-label">Official Exams</div>
              </div>
            </div>

            <div className="hero-social-proof" aria-label="Student rating">
              <div className="student-avatars" aria-hidden="true">
                <span>A</span>
                <span>M</span>
                <span>S</span>
                <span>D</span>
              </div>
              <div>
                <div className="rating-stars" aria-hidden="true">
                  <FaStar />
                  <FaStar />
                  <FaStar />
                  <FaStar />
                  <FaStar />
                </div>
                <p>Loved by students nationwide</p>
              </div>
            </div>
          </div>

          <div className="hero-visual-stage" aria-label="UltraSATPrep dashboard preview">
            <div className="dashboard-card dashboard-main-card">
              <aside className="dashboard-sidebar" aria-hidden="true">
                <div className="dashboard-brand">
                  <FaShieldAlt />
                  <span>Ultra<span>SAT</span>Prep</span>
                </div>
                <div className="dashboard-nav-item active"><FaHome /> Dashboard</div>
                <div className="dashboard-nav-item"><FaClipboardList /> Practice Tests</div>
                <div className="dashboard-nav-item"><FaRegClone /> Question Bank</div>
                <div className="dashboard-nav-item"><FaBookOpen /> Flashcards</div>
                <div className="dashboard-nav-item"><FaRobot /> AI Coach</div>
                <div className="dashboard-nav-item"><FaChartBar /> Performance</div>
              </aside>

              <div className="dashboard-workspace">
                <div className="dashboard-topline">
                  <div>
                    <h3>Welcome back, Alex</h3>
                    <p>Keep the momentum going. Your dream score is within reach.</p>
                  </div>
                  <div className="goal-chip">
                    <span>Current Goal</span>
                    <strong>1550+</strong>
                    <FaBullseye aria-hidden="true" />
                  </div>
                </div>

                <div className="dashboard-metrics-grid">
                  <div className="dashboard-panel progress-panel">
                    <div className="panel-title-row">
                      <span>Your Progress</span>
                      <small>This Week</small>
                    </div>
                    <div className="progress-content">
                      <div className="progress-ring" style={{ '--progress': `${animatedSuccessRate}%` }}>
                        <div>
                          <strong>{animatedSuccessRate}%</strong>
                          <span>Complete</span>
                        </div>
                      </div>
                      <div className="progress-list">
                        <span><FaCheck /> 3 Full-Length Tests</span>
                        <span><FaCheck /> 230 Questions Reviewed</span>
                        <span><FaCheck /> Vocabulary Review</span>
                        <span><FaCheck /> AI Coach Sessions</span>
                      </div>
                    </div>
                  </div>

                  <div className="dashboard-panel trend-panel">
                    <div className="panel-title-row">
                      <span>Score Trend</span>
                    </div>
                    <svg className="score-chart" viewBox="0 0 220 116" aria-hidden="true">
                      <defs>
                        <linearGradient id="scoreArea" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0%" stopColor="#22e7d5" stopOpacity="0.45" />
                          <stop offset="100%" stopColor="#22e7d5" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path d="M14 88 C35 86 38 94 58 84 C77 74 81 48 106 54 C126 58 126 76 145 71 C159 68 159 42 177 44 C191 46 195 54 207 46 L207 108 L14 108 Z" fill="url(#scoreArea)" />
                      <path d="M14 88 C35 86 38 94 58 84 C77 74 81 48 106 54 C126 58 126 76 145 71 C159 68 159 42 177 44 C191 46 195 54 207 46" fill="none" stroke="#22e7d5" strokeWidth="4" strokeLinecap="round" />
                      <circle cx="177" cy="44" r="5" fill="#26ffd4" />
                      <circle cx="207" cy="46" r="5" fill="#26ffd4" />
                      <text x="172" y="27">1430</text>
                    </svg>
                  </div>
                </div>

                <div className="dashboard-panel strengths-panel">
                  <div className="panel-title-row">
                    <span>Strengths & Weaknesses</span>
                  </div>
                  <svg className="radar-chart" viewBox="0 0 260 190" aria-hidden="true">
                    <polygon points="130,22 212,70 194,158 66,158 48,70" className="radar-grid" />
                    <polygon points="130,48 184,80 172,138 88,138 76,80" className="radar-grid muted" />
                    <polygon points="130,70 158,88 152,118 108,118 102,88" className="radar-grid muted" />
                    <polygon points="130,44 182,78 166,142 84,132 76,84" className="radar-you" />
                    <polygon points="130,62 166,88 154,126 104,122 90,91" className="radar-peer" />
                    <text x="130" y="14">Reading</text>
                    <text x="218" y="74">Writing</text>
                    <text x="184" y="180">Math No Calc</text>
                    <text x="43" y="180">Math Calc</text>
                    <text x="8" y="75">Data Analysis</text>
                  </svg>
                </div>
              </div>
            </div>

            <div className="dashboard-card ai-coach-card">
              <div className="mini-card-header">
                <strong>AI Study Coach</strong>
                <span className="online-dot">Online</span>
              </div>
              <div className="coach-message">
                <div className="coach-avatar"><FaRobot aria-hidden="true" /></div>
                <p>I've analyzed your performance. Focus on standard English conventions and data interpretation to improve your score.</p>
              </div>
              <button type="button">View Study Plan <FaArrowRight aria-hidden="true" /></button>
            </div>

            <div className="dashboard-card official-exams-card">
              <div>
                <div className="mini-card-title">
                  <FaAward aria-hidden="true" />
                  <div>
                    <h4>Official Digital SAT Exams</h4>
                    <p>Bluebook-style official sets</p>
                  </div>
                </div>
                <div className="official-stamp">Official<br />Questions</div>
              </div>
              <div className="official-exam-list">
                {['Official Exam 1', 'Official Exam 2', 'Official Exam 3'].map((exam) => (
                  <div className="official-exam-row" key={exam}>
                    <div>
                      <strong>{exam}</strong>
                      <span>4 Modules</span>
                    </div>
                    <span>Available</span>
                  </div>
                ))}
              </div>
              <div className="official-included"><strong>10+</strong> official exams included</div>
            </div>

            <div className="dashboard-card mini-test-card">
              <h4>Full-Length SAT Practice Test 1</h4>
              <span>4th Ed. Official Question Style</span>
              <div className="test-card-body">
                <div className="mini-progress">65%</div>
                <div>
                  <p>Math & Evidence-Based</p>
                  <button type="button">Continue Test</button>
                </div>
              </div>
            </div>

            <div className="dashboard-card vocab-card">
              <div className="mini-card-title">
                <FaShieldAlt aria-hidden="true" />
                <div>
                  <h4>Vocabulary Mastery</h4>
                  <p>Word Strength</p>
                </div>
                <span>+42</span>
              </div>
              <div className="word-chip-row">
                <span>Ubiquitous</span>
                <span>Pragmatic</span>
                <span>Big word</span>
              </div>
            </div>

            <div className="dashboard-card rw-card">
              <h4>Reading and Writing</h4>
              <p>Module 1, Question 12</p>
              <div className="answer-list">
                <span>A Viability</span>
                <span className="selected">B resilience</span>
                <span>C novelty</span>
                <span>D scarcity</span>
              </div>
            </div>
          </div>
        </div>

        <div className="hero-feature-strip" aria-label="Landing page feature summary">
          <div className="hero-feature-item">
            <span><FaClipboardList aria-hidden="true" /></span>
            <div>
              <h3>Practice Exams</h3>
              <p>Full-length Digital SAT tests that mirror the real exam experience.</p>
            </div>
          </div>
          <div className="hero-feature-item">
            <span><FaRobot aria-hidden="true" /></span>
            <div>
              <h3>AI Study Coach</h3>
              <p>Personalized study plans, smart insights, and real-time guidance.</p>
            </div>
          </div>
          <div className="hero-feature-item">
            <span><FaChartBar aria-hidden="true" /></span>
            <div>
              <h3>Performance Analytics</h3>
              <p>Deep performance insights to focus on weak areas and improve faster.</p>
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
              <h3>Practice Exams</h3>
              <p>Start with free full-length SAT practice or a shorter predictive test.</p>
            </div>
            <div className="exam-list-container">
              <div className="exam-item">
                <div className="exam-badge">Free</div>
                <div className="exam-details">
                  <h3>SAT Practice Test 1</h3>
                  <p>Full-length - 4 Modules - 98 Questions</p>
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
                  <p>Full-length - 4 Modules - 98 Questions</p>
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
                  <p>Full-length - 4 Modules - 98 Questions</p>
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
            <div className="right-column-inner official-format-panel">
              <div className="column-header">
                <h3>Official-Format Exams</h3>
                <p>Separate official-format exam listings are coming soon.</p>
              </div>
              <div className="exam-list-container official-format-list">
                <div className="exam-item official-exam-item">
                  <div className="exam-badge official-format-badge">Soon</div>
                  <div className="exam-details">
                    <h3>Official-Format SAT 1</h3>
                    <p>Bluebook-style modules and timing</p>
                  </div>
                  <button type="button" className="exam-start-button passive-button" disabled>
                    <span className="button-text">SOON</span>
                  </button>
                </div>

                <div className="exam-item official-exam-item">
                  <div className="exam-badge official-format-badge">Soon</div>
                  <div className="exam-details">
                    <h3>Official-Format SAT 2</h3>
                    <p>Digital SAT flow with section-level pacing</p>
                  </div>
                  <button type="button" className="exam-start-button passive-button" disabled>
                    <span className="button-text">SOON</span>
                  </button>
                </div>

                <div className="exam-item official-exam-item">
                  <div className="exam-badge official-format-badge">Soon</div>
                  <div className="exam-details">
                    <h3>Official-Format SAT 3</h3>
                    <p>Full-length practice built for official exam rhythm</p>
                  </div>
                  <button type="button" className="exam-start-button passive-button" disabled>
                    <span className="button-text">SOON</span>
                  </button>
                </div>

                <div className="exam-item official-exam-item official-view-all-item">
                  <div className="exam-badge official-format-badge">New</div>
                  <div className="exam-details">
                    <h3>View official-format exams</h3>
                    <p>A dedicated page will be available soon.</p>
                  </div>
                  <button type="button" className="exam-start-button passive-button" disabled>
                    <span className="button-text">SOON</span>
                  </button>
                </div>
              </div>
              <div className="landing-quiz-grid">
                <Link
                  to="#"
                  onClick={(e) => handleQuizTileClick(e, 'vocabulary', 'Vocabulary')}
                  className="landing-quiz-card tilt-card landing-quiz-card--small pos-tl theme-blue"
                >
                  <div className="card-count">400 questions</div>
                  <div className="card-header">Vocabulary</div>
                  <div className="card-body">
                    <span className="card-meta">Reading and writing</span>
                  </div>
                  <span className="card-cta small">Start Mini Quiz</span>
                </Link>
                
                <Link
                  to="#"
                  onClick={(e) => handleQuizTileClick(e, 'circles', 'Circles')}
                  className="landing-quiz-card tilt-card landing-quiz-card--small pos-tr theme-purple"
                >
                  <div className="card-count">300 questions</div>
                  <div className="card-header">Circles</div>
                  <div className="card-body">
                    <span className="card-meta">Math</span>
                  </div>
                  <span className="card-cta small">Start Mini Quiz</span>
                </Link>
                
                <Link
                  to="#"
                  onClick={(e) => { e.preventDefault(); handlePredictiveTest(); }}
                  className="landing-quiz-card tilt-card landing-quiz-card--large pos-center first-test-pulsate theme-green"
                  aria-label="Create a mini test"
                >
                  <div className="card-header">Create a mini test</div>
                  <div className="card-body">
                    <span className="card-meta">Choose question topics</span>
                    <span className="card-meta">Choose difficulty level and number of questions</span>
                  </div>
                  <span className="card-cta">START</span>
                </Link>
                
                <Link
                  to="#"
                  onClick={(e) => handleQuizTileClick(e, 'boundaries', 'Boundaries')}
                  className="landing-quiz-card tilt-card landing-quiz-card--small pos-ml theme-orange"
                >
                  <div className="card-count">320 questions</div>
                  <div className="card-header">Boundaries</div>
                  <div className="card-body">
                    <span className="card-meta">Reading and writing</span>
                  </div>
                  <span className="card-cta small">Start Mini Quiz</span>
                </Link>
                
                <Link
                  to="#"
                  onClick={(e) => handleQuizTileClick(e, 'linear-equations', 'Linear Equations')}
                  className="landing-quiz-card tilt-card landing-quiz-card--small pos-mr theme-teal"
                >
                  <div className="card-count">300 questions</div>
                  <div className="card-header">Linear Equations</div>
                  <div className="card-body">
                    <span className="card-meta">Math</span>
                  </div>
                  <span className="card-cta small">Start Mini Quiz</span>
                </Link>

                {/* New bottom-left CTA: Ten more quizzes */}
                <Link
                  to="/guest-subject-quizzes"
                  className="landing-quiz-card tilt-card landing-quiz-card--small pos-bl theme-gray"
                >
                  <div className="card-body">
                    <span className="card-title">8 more Reading and Writing quiz topics</span>
                  </div>
                  <span className="card-cta">VIEW ALL</span>
                </Link>

                {/* New bottom-right CTA: Ten more quizzes */}
                <Link
                  to="/guest-subject-quizzes"
                  className="landing-quiz-card tilt-card landing-quiz-card--small pos-br theme-gray"
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

      {/* Bluebook on Phone Section - moved above Question Bank */}
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
                lazy={false}
              />
            </div>
            
            <div className="phone-features-container">
              <div className="phone-feature-item">
                <div className="phone-feature-icon"><FaMobileAlt aria-hidden="true" /></div>
                <div className="phone-feature-content">
                  <h4>Mobile Comfort</h4>
                  <p>Enjoy the comfort of taking bluebook tests on your phone</p>
                </div>
              </div>
              
              <div className="phone-feature-item">
                <div className="phone-feature-icon"><FaSyncAlt aria-hidden="true" /></div>
                <div className="phone-feature-content">
                  <h4>Feature Coming Soon</h4>
                  <p>More exciting mobile features are on the way</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Question Bank Section */}
      <QuestionBank />

      {/* AI Companion Showcase Section */}
      <section className="ai-companion-showcase-section">
        <div className="container">
          <div className="section-header-center">
            <h2>AI Companion that turns practice into a plan</h2>
            <p>After quizzes and exams, SAT Coach helps students understand what to do next.</p>
          </div>

          <div className="ai-companion-showcase-grid">
            <div className="ai-companion-copy">
              <div className="showcase-kicker">Personal SAT Coach</div>
              <h3>Know the next best move after every session.</h3>
              <p>
                The companion reads recent practice activity, highlights weak areas, and recommends targeted review instead of leaving students with a raw score.
              </p>
              <div className="showcase-feature-list">
                <div className="showcase-feature-row">
                  <span className="showcase-dot"></span>
                  <span>Personal greetings based on latest progress</span>
                </div>
                <div className="showcase-feature-row">
                  <span className="showcase-dot"></span>
                  <span>Next-step recommendations for quizzes, concepts, and exams</span>
                </div>
                <div className="showcase-feature-row">
                  <span className="showcase-dot"></span>
                  <span>Voice-ready coaching for quick study check-ins</span>
                </div>
              </div>
              <Link to={currentUser ? "/progress" : "/signup"} className="showcase-link-button">
                Meet SAT Coach
              </Link>
            </div>

            <div className="ai-chat-preview" aria-label="AI Companion preview">
              <div className="ai-chat-header">
                <div className="ai-avatar">AI</div>
                <div>
                  <h4>SAT Coach</h4>
                  <span>Ready with your next step</span>
                </div>
              </div>
              <div className="ai-message ai-message-coach">
                You improved on linear equations, but words in context still needs review. Start with a 12-question medium quiz.
              </div>
              <div className="ai-action-preview">
                <span>Recommended action</span>
                <strong>Words in Context Mini Quiz</strong>
              </div>
              <div className="ai-message ai-message-user">
                Can I review vocabulary first?
              </div>
              <div className="ai-message ai-message-coach compact">
                Yes. I saved the key terms to your Word Bank and will bring them back for review.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Concept Bank and Word Bank Showcase */}
      <section className="study-banks-showcase-section">
        <div className="container">
          <div className="section-header-center">
            <h2>Save what matters, then review it on purpose</h2>
            <p>Concept Bank and Word Bank turn missed questions into organized study material.</p>
          </div>

          <div className="study-banks-grid">
            <div className="study-bank-card concept-bank-card">
              <div className="study-bank-topline">Concept Bank</div>
              <h3>Build a personal map of weak concepts.</h3>
              <p>Save concepts from math and reading practice, revisit explanations, and drill the topics that keep costing points.</p>
              <div className="bank-preview-list">
                <span>Linear equations</span>
                <span>Text structure</span>
                <span>Circle theorems</span>
              </div>
              <Link to={currentUser ? "/concept-bank" : "/signup"} className="showcase-link-button secondary">
                Open Concept Bank
              </Link>
            </div>

            <div className="study-bank-card word-bank-card">
              <div className="study-bank-topline">Word Bank</div>
              <h3>Turn vocabulary gaps into repeatable review.</h3>
              <p>Collect important SAT words, move them into flashcard decks, and review them before they show up again in practice.</p>
              <div className="bank-preview-list">
                <span>Infer</span>
                <span>Ambivalent</span>
                <span>Substantiate</span>
              </div>
              <Link to={currentUser ? "/word-bank" : "/signup"} className="showcase-link-button secondary">
                Open Word Bank
              </Link>
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
              <div className="feature-icon-large"><FaBookOpen aria-hidden="true" /></div>
              <h3>Smart Vocabulary Builder</h3>
              <p>Improve your SAT Vocabulary with AI-powered flashcards that adapt to your pace</p>
              <ul className="feature-points">
                <li>Spaced repetition algorithm</li>
                <li>Context-based learning</li>
                <li>Progress tracking</li>
              </ul>
              <Link to={currentUser ? "/word-bank" : "/signup"} className="feature-link">
                Build Vocabulary &rarr;
              </Link>
            </div>

            <div className="feature-card featured-card">
              <div className="featured-badge">Most Popular</div>
              <div className="feature-icon-large"><FaRobot aria-hidden="true" /></div>
              <h3>Adaptive Practice Quizzes</h3>
              <p>Questions that adjust difficulty based on your performance in real-time</p>
              <ul className="feature-points">
                <li>Personalized difficulty</li>
                <li>Instant explanations</li>
                <li>Unlimited practice</li>
              </ul>
              <Link to={currentUser ? "/subject-quizzes" : "/signup"} className="feature-link">
                Start Practicing &rarr;
              </Link>
                </div>

            <div className="feature-card">
              <div className="feature-icon-large"><FaChartBar aria-hidden="true" /></div>
              <h3>Performance Analytics</h3>
              <p>Deep insights into your strengths and weaknesses with actionable recommendations</p>
              <ul className="feature-points">
                <li>Skill-level analysis</li>
                <li>Time management stats</li>
                <li>Improvement tracking</li>
              </ul>
              <Link to={currentUser ? "/progress" : "/signup"} className="feature-link">
                View Analytics &rarr;
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
                        <div className="blog-icon"><FaBookOpen aria-hidden="true" /></div>
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
                        Read More &rarr;
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="blog-placeholder">
              <div className="placeholder-icon"><FaBookOpen aria-hidden="true" /></div>
              <h3>Coming Soon!</h3>
              <p>We're working on some amazing SAT prep content for you. Check back soon!</p>
              <Link to="/blog" className="blog-read-more">
                Visit Our Blog &rarr;
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
              <span>SSL Secured</span>
              <span>COPPA Compliant</span>
              <span>Official Practice Focus</span>
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
