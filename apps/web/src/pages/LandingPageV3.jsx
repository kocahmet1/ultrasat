import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ExamAuthModal from '../components/ExamAuthModal';
import SiteFooter from '../components/SiteFooter';
import { getAllPracticeExams } from '../firebase/services';
import { SUBCATEGORY_NAMES } from '../utils/subcategoryConstants';
import '../styles/LandingPageV3.css';

/**
 * Landing page (v3) — official exams first, skill-map engine second.
 * Reuses the existing auth + exam-start flow from the legacy landing page.
 */

// Shorter labels for the skill map, so 29 names fit three columns cleanly.
const SHORT_NAMES = {
  1: 'Central Ideas and Details',
  5: 'Text Structure and Purpose',
  10: 'Form, Structure, and Sense',
  11: 'Linear Equations, One Var.',
  13: 'Linear Equations, Two Var.',
  19: 'Ratios, Rates, Proportions',
  24: 'Inference from Statistics',
  25: 'Evaluating Stat. Claims',
  27: 'Lines, Angles, Triangles',
  28: 'Right Triangles and Trig.',
};

// Illustrative mastery readout — labelled as a sample student in the UI.
const SAMPLE_MASTERY = {
  1: 82, 2: 58, 3: 74, 4: 88, 5: 44, 6: 46, 7: 71, 8: 54, 9: 92, 10: 66,
  11: 90, 12: 78, 13: 72, 14: 64, 15: 58, 16: 34, 17: 41, 18: 69, 19: 86,
  20: 80, 21: 76, 22: 52, 23: 63, 24: 44, 25: 39, 26: 57, 27: 70, 28: 48, 29: 31,
};

const READING_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const MATH_IDS = [11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29];

const FALLBACK_EXAM_COUNT = 5;

// The page is a fixed 1440px design canvas. On wider viewports the whole canvas
// is scaled up (see the --lp3-canvas-zoom effect below) so the hero keeps its
// proportions and still reaches the viewport edges instead of sitting in a
// 1280px column with dead gutters either side.
const DESIGN_WIDTH = 1440;
const MAX_CANVAS_SCALE = 1.5;

// Node positions for the hero wireframe lattice (viewBox 1440x820).
const LATTICE_NODES = [
  [60, 120], [215, 60], [355, 175], [500, 95], [150, 285], [300, 360],
  [60, 455], [430, 300], [610, 210], [720, 110], [560, 420], [700, 340],
  [960, 140], [200, 560], [380, 520], [520, 620], [90, 690], [260, 760],
  [1080, 300], [1210, 200], [1340, 320], [1150, 450], [1320, 540],
  [680, 540], [980, 600], [1120, 700], [450, 720],
  // denser cluster on the right, behind the panels
  [1030, 180], [1240, 90], [1400, 140], [1370, 420], [1290, 620],
  [1420, 700], [900, 700], [1230, 760], [1050, 540], [940, 380],
  // bands above and below the panels
  [640, 45], [820, 55], [1100, 40], [1310, 45], [890, 165], [1170, 145],
  [760, 650], [640, 760], [880, 590], [1010, 780], [1390, 590], [1150, 560],
];

const ROUTING = [
  { id: 'Q12', correct: true, skill: 'Text structure' },
  { id: 'Q13', correct: false, skill: 'Inferences' },
  { id: 'Q14', correct: true, skill: 'Boundaries' },
  { id: 'Q15', correct: false, skill: 'Nonlinear fns' },
];

const UPDATING = [
  { name: 'Text structure', from: 0.34, to: 0.44, val: 44, delay: '0s' },
  { name: 'Inferences', from: 0.66, to: 0.58, val: 58, delay: '0.55s' },
  { name: 'Nonlinear fns', from: 0.38, to: 0.31, val: 31, delay: '1.65s' },
];

const PROGRESS_CELLS = [
  'done', 'done', 'done', 'done', 'flag', 'done', 'done', 'done', 'flag', 'done',
  'done', 'current', 'todo', 'todo', 'todo', 'todo', 'todo', 'todo', 'todo', 'todo',
  'todo', 'todo', 'todo', 'todo', 'todo', 'todo', 'todo',
];

const SURFACES = [
  {
    title: 'Question bank',
    copy: '8,000+ questions, filterable by skill and difficulty, with a worked explanation on every one.',
    tag: 'Filter by skill',
  },
  {
    title: 'Adaptive quizzes',
    copy: 'Short sets assembled from your weakest skills, timed or untimed, ten minutes at a time.',
    tag: 'Built from your map',
  },
  {
    title: 'Flashcards & word bank',
    copy: 'Vocabulary and rules pulled from questions you missed, returned to you on a spaced schedule.',
    tag: 'Spaced review',
  },
  {
    title: 'SAT guide',
    copy: 'How the adaptive test is scored, how to pace each module, and what to do in the last two weeks.',
    tag: 'Free to read',
  },
];

const STEPS = [
  { n: '01', title: 'Sit a full test', copy: 'Official past exam or full-length practice, real interface, real timing.' },
  { n: '02', title: 'Answers route to skills', copy: 'Each response scores against its tagged skill, with time-per-question read alongside accuracy.' },
  { n: '03', title: 'A set is built for you', copy: 'Targeted questions, worked explanations and flashcards drawn from your weakest skills first.' },
  { n: '04', title: 'Retest and compare', copy: "Mastery moves on the map, or it doesn't. Either way you know before test day." },
];

const masteryTone = (value) => {
  if (value >= 65) return 'strong';
  if (value >= 45) return 'mid';
  return 'low';
};

const LandingPageV3 = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [practiceExams, setPracticeExams] = useState([]);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [modalExamId, setModalExamId] = useState(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Signed-out visitors get the guest route where one exists, and sign-up where
  // the destination is behind PrivateRoute.
  const questionBankHref = currentUser ? '/subject-quizzes' : '/guest-subject-quizzes';
  const flashcardsHref = currentUser ? '/flashcards' : '/signup';
  const practiceExamsHref = currentUser ? '/practice-exams' : '/signup';
  const aiCoachHref = currentUser ? '/ai-coach' : '/signup';

  const closeMobileNav = () => setMobileNavOpen(false);

  const rootRef = useRef(null);

  // Scale the design canvas to the viewport. zoom (not transform) so layout,
  // the sticky nav and the hero's 3D perspective all scale together.
  useEffect(() => {
    const node = rootRef.current;
    if (!node) return undefined;

    const applyCanvasScale = () => {
      const width = document.documentElement.clientWidth;
      const scale = Math.min(Math.max(width / DESIGN_WIDTH, 1), MAX_CANVAS_SCALE);
      node.style.setProperty('--lp3-canvas-zoom', String(Math.round(scale * 1000) / 1000));
    };

    applyCanvasScale();
    window.addEventListener('resize', applyCanvasScale);
    return () => window.removeEventListener('resize', applyCanvasScale);
  }, []);

  useEffect(() => {
    const fetchPracticeExams = async () => {
      if (!currentUser) {
        setPracticeExams([]);
        return;
      }

      try {
        const exams = await getAllPracticeExams(true);
        exams.sort((a, b) => {
          const numA = parseInt(a.title.match(/\d+/)?.[0] || 0, 10);
          const numB = parseInt(b.title.match(/\d+/)?.[0] || 0, 10);
          return numA - numB;
        });
        setPracticeExams(exams);
      } catch (error) {
        console.error('Error fetching practice exams:', error);
        setPracticeExams([]);
      }
    };

    fetchPracticeExams();
  }, [currentUser]);

  const examRows = useMemo(() => {
    if (practiceExams.length) {
      return practiceExams.slice(0, 6).map((exam, index) => ({
        key: exam.id,
        num: String(index + 1).padStart(2, '0'),
        name: exam.title,
        meta: 'Full length \u00b7 2h 14m \u00b7 98 questions',
        action: index === 0 ? 'Start' : 'Ready',
      }));
    }

    return Array.from({ length: FALLBACK_EXAM_COUNT }).map((_, index) => ({
      key: `fallback-${index}`,
      num: String(index + 1).padStart(2, '0'),
      name: `Official Practice Test ${index + 1}`,
      meta: 'Full length \u00b7 2h 14m \u00b7 98 questions',
      action: index === 0 ? 'Start free' : 'Ready',
    }));
  }, [practiceExams]);

  const skills = useMemo(() => {
    const build = (id) => {
      const value = SAMPLE_MASTERY[id] ?? 50;
      return {
        id,
        name: SHORT_NAMES[id] || SUBCATEGORY_NAMES[id],
        value,
        tone: masteryTone(value),
      };
    };
    return [...READING_IDS.map(build), ...MATH_IDS.map(build)];
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
      const exam = practiceExams[examIndex];
      if (exam) {
        navigate(`/practice-exam/${exam.id}`, { state: { startExam: true } });
      } else {
        navigate('/practice-exams');
      }
    } else {
      setModalExamId(examIndex + 1);
      setAuthModalOpen(true);
    }
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
    setModalExamId(null);
  };

  return (
    <div className="lp3" ref={rootRef}>
      {/* the scaled design canvas; the auth modal stays outside it */}
      <div className="lp3-canvas">
        <header className="lp3-nav">
          <div className="lp3-shell lp3-nav-inner">
            <Link to="/" className="lp3-brand" aria-label="UltraSATPrep home">
              <span className="lp3-brand-mark" aria-hidden="true"></span>
              <span className="lp3-brand-word">UltraSATPrep</span>
            </Link>

            <button
              type="button"
              className="lp3-nav-toggle"
              aria-expanded={mobileNavOpen}
              aria-label="Toggle navigation"
              onClick={() => setMobileNavOpen((open) => !open)}
            >
              <span aria-hidden="true"></span>
              <span aria-hidden="true"></span>
            </button>

            <nav className={`lp3-nav-links${mobileNavOpen ? ' lp3-nav-open' : ''}`} aria-label="Main navigation">
              {currentUser && (
                <Link to="/progress" onClick={closeMobileNav}>Dashboard</Link>
              )}
              <Link to={practiceExamsHref} onClick={closeMobileNav}>Practice Exams</Link>
              <Link to={questionBankHref} onClick={closeMobileNav}>Question Bank</Link>
              <Link to={flashcardsHref} onClick={closeMobileNav}>Flashcards</Link>
              <Link to={aiCoachHref} onClick={closeMobileNav}>AI Coach</Link>
              <a href="#pricing" onClick={closeMobileNav}>Pricing</a>
              <span className="lp3-nav-rule" aria-hidden="true"></span>
              {currentUser ? (
                <>
                  <Link to="/profile" onClick={closeMobileNav}>Profile</Link>
                  <button type="button" className="lp3-nav-ghost" onClick={handleLogout}>Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={closeMobileNav}>Login</Link>
                  <Link to="/signup" className="lp3-nav-cta" onClick={closeMobileNav}>Sign Up</Link>
                </>
              )}
            </nav>
          </div>
        </header>

        <section className="lp3-hero">
          <svg className="lp3-lattice" viewBox="0 0 1440 820" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
            <path className="lp3-lattice-base" d="M60 120 L215 60 L355 175 L500 95 M60 120 L150 285 L355 175 M150 285 L300 360 L355 175 M300 360 L430 300 M500 95 L610 210 L720 110 M430 300 L610 210 M150 285 L60 455 L200 560 M300 360 L380 520 L200 560 M380 520 L520 620 M200 560 L90 690 L260 760 L450 720 L520 620 M430 300 L560 420 L700 340 L610 210 M700 340 L860 250 L960 140 L720 110 M560 420 L680 540 L520 620 M680 540 L840 470 L860 250 M840 470 L980 600 L1120 700 M860 250 L1080 300 L1210 200 L1340 320 M1080 300 L1150 450 L1340 320 M1150 450 L1320 540 L1120 700 M980 600 L1150 450 M960 140 L1210 200 M500 95 L720 110 M960 140 L1030 180 L1080 300 M1030 180 L1240 90 L1400 140 L1340 320 M1240 90 L1210 200 M1340 320 L1370 420 L1320 540 L1290 620 L1420 700 M1290 620 L1120 700 L1230 760 M980 600 L900 700 L1120 700 M1150 450 L1050 540 L980 600 M1050 540 L840 470 M860 250 L940 380 L1080 300 M940 380 L840 470 M500 95 L640 45 L820 55 L720 110 M820 55 L1100 40 L1240 90 M1100 40 L960 140 M1240 90 L1310 45 L1400 140 M890 165 L960 140 M890 165 L720 110 M1170 145 L1030 180 M1170 145 L1240 90 M680 540 L760 650 L900 700 M760 650 L640 760 M880 590 L980 600 M880 590 L760 650 M1120 700 L1010 780 L900 700 M1290 620 L1390 590 L1420 700 M1390 590 L1320 540 M1150 560 L1050 540 M1150 560 L1290 620 M1150 560 L980 600" />
            <path className="lp3-lattice-live" d="M60 120 L150 285 L300 360 L430 300 L610 210 L720 110" />
            <path className="lp3-lattice-live" style={{ animationDelay: '1.8s' }} d="M200 560 L380 520 L520 620 L680 540 L840 470 L860 250" />
            <path className="lp3-lattice-live" style={{ animationDelay: '3.4s' }} d="M1340 320 L1150 450 L980 600 L1120 700" />
            <path className="lp3-lattice-live" style={{ animationDelay: '5.1s' }} d="M960 140 L1210 200 L1080 300 L860 250" />
            <path className="lp3-lattice-live" style={{ animationDelay: '2.6s' }} d="M1400 140 L1340 320 L1370 420 L1320 540 L1290 620" />
            <path className="lp3-lattice-live" style={{ animationDelay: '4.2s' }} d="M640 45 L820 55 L1100 40 L1240 90 L1310 45 L1400 140" />
            <path className="lp3-lattice-live" style={{ animationDelay: '6.3s' }} d="M680 540 L760 650 L900 700 L1120 700 L1290 620 L1390 590" />
            <g className="lp3-lattice-nodes">
              {LATTICE_NODES.map(([cx, cy]) => (
                <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="2.4" />
              ))}
            </g>
            <g className="lp3-lattice-hot">
              <circle cx="860" cy="250" r="3" />
              <circle cx="840" cy="470" r="3" style={{ animationDelay: '1.5s' }} />
              <circle cx="150" cy="285" r="3" style={{ animationDelay: '2.9s' }} />
            </g>
          </svg>

          <div className="lp3-shell lp3-hero-grid">
            <div className="lp3-hero-copy">
              <p className="lp3-eyebrow-pill">
                <span className="lp3-dot" aria-hidden="true"></span>
                10 official past exams &middot; free to start
              </p>

              <h1 className="lp3-h1">
                Practice on the<br />real past Digital<br />SAT exams.
              </h1>

              <p className="lp3-lede">
                Full length, real timing, real adaptive second module. Then every answer you gave is filed
                under one of the 29 skills the test measures &mdash; so you finish with a map, not a number.
              </p>

              <div className="lp3-hero-actions">
                <button type="button" className="lp3-btn-primary" onClick={() => handleExamStart(0)}>
                  <span>Start a full practice test</span>
                  <span className="lp3-arrow" aria-hidden="true">&rarr;</span>
                </button>
                <a href="#inside" className="lp3-btn-ghost">See what&rsquo;s inside</a>
              </div>

              <p className="lp3-micro">Free full-length diagnostic &middot; 2h 14m</p>
            </div>

            <div className="lp3-rack-stage">
              <div className="lp3-rack-shot">
                <img
                  src="/images/bluebook-question.png"
                  alt="A Digital SAT rhetorical synthesis question shown in the exam interface"
                />
              </div>
              <div className="lp3-rack" aria-label="Official Digital SAT exams">
              <div className="lp3-rack-edge" aria-hidden="true"></div>
              <div className="lp3-rack-head">
                <span className="lp3-rack-badge">Official &middot; College Board released</span>
                <span className="lp3-rack-state">Ready now</span>
              </div>

              {examRows.map((exam, index) => (
                <button
                  type="button"
                  className="lp3-rack-row"
                  key={exam.key}
                  onClick={() => handleExamStart(index)}
                >
                  <span className="lp3-rack-num">{exam.num}</span>
                  <span className="lp3-rack-body">
                    <span className="lp3-rack-name">{exam.name}</span>
                    <span className="lp3-rack-meta">{exam.meta}</span>
                  </span>
                  <span className={`lp3-rack-action${index === 0 ? ' lp3-rack-action-lead' : ''}`}>
                    {exam.action}
                  </span>
                </button>
              ))}

              <div className="lp3-rack-foot">
                <span>+ 20 full-length tests, blueprint matched</span>
                <Link to="/practice-exams">All exams &rarr;</Link>
              </div>
              </div>
            </div>
          </div>

          <div className="lp3-shell">
            <div className="lp3-stats">
              <div className="lp3-stat">
                <span className="lp3-stat-num">10+</span>
                <span className="lp3-stat-label">Official past exams</span>
              </div>
              <div className="lp3-stat">
                <span className="lp3-stat-num">20</span>
                <span className="lp3-stat-label">Full-length practice tests</span>
              </div>
              <div className="lp3-stat">
                <span className="lp3-stat-num">8,000+</span>
                <span className="lp3-stat-label">Questions in the bank</span>
              </div>
              <div className="lp3-stat">
                <span className="lp3-stat-num lp3-stat-accent">29</span>
                <span className="lp3-stat-label">Skills tracked per answer</span>
              </div>
            </div>
          </div>
        </section>

        <section className="lp3-inside" id="inside">
          <div className="lp3-shell lp3-inside-grid">
            <div>
              <p className="lp3-eyebrow"><span className="lp3-eyebrow-num">01</span>Inside a full test</p>
              <h2 className="lp3-h2">Not a lookalike. The actual past exams, in the actual format.</h2>
              <p className="lp3-body">
                Two modules per section, the same 2h 14m clock, and a second module that gets harder or
                easier based on how the first one went &mdash; exactly like test day.
              </p>

              <dl className="lp3-facts">
                <div>
                  <dt>Structure</dt>
                  <dd>Reading &amp; Writing, then Math &mdash; two modules each, 98 questions total.</dd>
                </div>
                <div>
                  <dt>Adaptive</dt>
                  <dd>Module 2 difficulty responds to your Module 1 performance.</dd>
                </div>
                <div>
                  <dt>Review</dt>
                  <dd>Every question keeps its worked explanation and its skill tag afterwards.</dd>
                </div>
              </dl>
            </div>

            <div className="lp3-exam-panel" aria-label="Practice test preview">
              <div className="lp3-exam-top">
                <span>Practice test 3 &middot; module 1</span>
                <span className="lp3-exam-top-right">
                  <span>Reading &amp; writing</span>
                  <strong>32:00</strong>
                </span>
              </div>

              <div className="lp3-exam-progress" aria-hidden="true">
                {PROGRESS_CELLS.map((state, index) => (
                  <span key={index} className={`lp3-cell lp3-cell-${state}`}></span>
                ))}
              </div>

              <div className="lp3-exam-body">
                <div className="lp3-exam-qhead">
                  <span className="lp3-exam-qnum">12</span>
                  <span className="lp3-exam-qmark">Mark for review</span>
                </div>

                <p className="lp3-passage">
                  The stranger still stood in the exact middle of the cottage, where he had first planted
                  himself. <span className="lp3-underlined">His immovable posture suggested a person deciding whether to proceed or pause.</span>
                </p>

                <p className="lp3-stem">Which choice best states the function of the underlined sentence?</p>

                <div className="lp3-choices">
                  <div className="lp3-choice">
                    <span className="lp3-choice-letter">A</span>
                    <span>It elaborates on the previous sentence.</span>
                  </div>
                  <div className="lp3-choice lp3-choice-selected">
                    <span className="lp3-choice-letter">B</span>
                    <span>It introduces the setting described later.</span>
                  </div>
                  <div className="lp3-choice">
                    <span className="lp3-choice-letter">C</span>
                    <span>It establishes a contrast in the description.</span>
                  </div>
                  <div className="lp3-choice">
                    <span className="lp3-choice-letter">D</span>
                    <span>It sets up the character description that follows.</span>
                  </div>
                </div>
              </div>

              <div className="lp3-exam-foot">
                <span>Tagged &middot; <strong>Text structure and purpose</strong></span>
                <span>12 / 27</span>
              </div>
            </div>
          </div>
        </section>

        <section className="lp3-engine" id="skills">
          <div className="lp3-shell">
            <div className="lp3-engine-top">
              <div>
                <p className="lp3-eyebrow lp3-eyebrow-dark"><span className="lp3-eyebrow-num-dark">02</span>The scoring engine</p>
                <h2 className="lp3-h2 lp3-h2-dark">Every answer routes to a skill. That&rsquo;s what you study from.</h2>
                <p className="lp3-body lp3-body-dark">
                  A score out of 1600 tells you nothing you can act on. Ours resolves each response
                  &mdash; right, wrong, and how long you took &mdash; into mastery per skill, then builds
                  your next set from the bottom of the list.
                </p>
              </div>

              <div className="lp3-routing" aria-label="How answers are scored">
                <div className="lp3-routing-head">
                  <span>Live routing</span>
                  <span className="lp3-routing-state">
                    <span className="lp3-dot lp3-dot-fast" aria-hidden="true"></span>
                    Scoring
                  </span>
                </div>

                <div className="lp3-routing-rows">
                  {ROUTING.map((row, index) => (
                    <React.Fragment key={row.id}>
                      <span className="lp3-routing-q">
                        {row.id} {row.correct ? '\u2713' : '\u2717'}
                      </span>
                      <span className="lp3-routing-wire">
                        <span className="lp3-wire-line" aria-hidden="true"></span>
                        <span
                          className="lp3-wire-dot"
                          aria-hidden="true"
                          style={{ animationDelay: `${index * 0.55}s` }}
                        ></span>
                        <span className="lp3-wire-target">{row.skill}</span>
                      </span>
                    </React.Fragment>
                  ))}
                </div>

                <div className="lp3-updating">
                  <p className="lp3-updating-title">Mastery updating</p>
                  {UPDATING.map((row) => (
                    <div className="lp3-updating-row" key={row.name}>
                      <span className="lp3-updating-name">{row.name}</span>
                      <span className="lp3-updating-track">
                        <span
                          className="lp3-updating-fill"
                          style={{
                            '--lp3-a': row.from,
                            '--lp3-b': row.to,
                            animationDelay: row.delay,
                          }}
                        ></span>
                      </span>
                      <span className="lp3-updating-val">{row.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lp3-map" aria-label="Skill mastery map">
              <span className="lp3-map-scan" aria-hidden="true"></span>

              <div className="lp3-map-head">
                <span>Skill map &middot; sample student, two full tests in</span>
                <span className="lp3-legend">
                  <span><i className="lp3-key lp3-key-strong" aria-hidden="true"></i>Strong</span>
                  <span><i className="lp3-key lp3-key-low" aria-hidden="true"></i>Needs work</span>
                </span>
              </div>

              <div className="lp3-map-grid">
                {skills.map((skill, index) => (
                  <div className="lp3-map-row" key={skill.id}>
                    <span className="lp3-map-name">{skill.name}</span>
                    <span className="lp3-map-track">
                      <span
                        className={`lp3-map-fill lp3-map-fill-${skill.tone}`}
                        style={{ width: `${skill.value}%`, animationDelay: `${(0.25 + index * 0.018).toFixed(3)}s` }}
                      ></span>
                    </span>
                    <span className="lp3-map-val">{skill.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="lp3-loop">
          <div className="lp3-shell">
            <p className="lp3-eyebrow"><span className="lp3-eyebrow-num">03</span>How the loop runs</p>
            <h2 className="lp3-h2 lp3-h2-wide">Four steps, repeated until the weak column is empty.</h2>

            <div className="lp3-steps">
              {STEPS.map((step) => (
                <div className="lp3-step" key={step.n}>
                  <span className="lp3-step-num">{step.n}</span>
                  <h3>{step.title}</h3>
                  <p>{step.copy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="lp3-surfaces" id="platform">
          <div className="lp3-shell">
            <p className="lp3-eyebrow"><span className="lp3-eyebrow-num">04</span>Between the tests</p>
            <h2 className="lp3-h2 lp3-h2-wide">Four ways to work on one skill at a time.</h2>

            <div className="lp3-surface-list">
              {SURFACES.map((item) => (
                <div className="lp3-surface" key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.copy}</p>
                  <span className="lp3-surface-tag">{item.tag}</span>
                </div>
              ))}
            </div>

            <div className="lp3-surface-links">
              <Link to={questionBankHref}>Open question bank &rarr;</Link>
              <Link to={flashcardsHref}>Open flashcards &rarr;</Link>
              <Link to="/sat-guide">Read the SAT guide &rarr;</Link>
            </div>
          </div>
        </section>

        <section className="lp3-pricing" id="pricing">
          <div className="lp3-shell">
            <p className="lp3-eyebrow"><span className="lp3-eyebrow-num">05</span>Pricing</p>
            <h2 className="lp3-h2 lp3-h2-wide">Free to start. One plan for everything else.</h2>
            <p className="lp3-body lp3-pricing-lede">
              The diagnostic, three full-length tests and the question bank cost nothing.
              Pro unlocks the rest. Cancel anytime.
            </p>

            <div className="lp3-pricing-grid">
              <div className="lp3-price-card">
                <div className="lp3-price-head">
                  <h3>Free</h3>
                  <p className="lp3-price-num">$0</p>
                  <p className="lp3-price-sub">No card required</p>
                </div>
                <ul className="lp3-price-list">
                  <li>Diagnostic test with score estimate</li>
                  <li>3 full-length practice tests</li>
                  <li>8,000+ question bank, worked explanations</li>
                  <li>Skill-by-skill progress tracking</li>
                  <li>Word bank</li>
                </ul>
                {!currentUser && (
                  <Link to="/signup" className="lp3-btn-ghost lp3-price-btn">
                    <span>Create free account</span>
                  </Link>
                )}
              </div>

              <div className="lp3-price-card lp3-price-card-pro">
                <div className="lp3-price-head">
                  <h3>Pro</h3>
                  <p className="lp3-price-num">$9.99<span className="lp3-price-period"> / month</span></p>
                  <p className="lp3-price-sub">or $99.99 / year &mdash; 2 months free</p>
                </div>
                <ul className="lp3-price-list">
                  <li>Everything in Free</li>
                  <li>Unlimited full-length practice tests</li>
                  <li>Lectures for all 29 skills</li>
                  <li>Flashcards with spaced review</li>
                  <li>Concept bank</li>
                  <li>Priority email support</li>
                </ul>
                <Link
                  to={currentUser ? '/membership/upgrade' : '/signup'}
                  className="lp3-btn-primary lp3-price-btn"
                >
                  <span>{currentUser ? 'Upgrade to Pro' : 'Start with Pro'}</span>
                  <span className="lp3-arrow" aria-hidden="true">&rarr;</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="lp3-final">
          <div className="lp3-shell lp3-final-grid">
            <div>
              <h2 className="lp3-h2-final">Start with one real exam. Everything else follows from it.</h2>
              <p className="lp3-body lp3-body-dark">
                Two hours fourteen, free &mdash; a free account saves your results. You finish with a skill map instead of a guess.
              </p>
            </div>
            <div className="lp3-final-actions">
              <button type="button" className="lp3-btn-primary lp3-btn-wide" onClick={() => handleExamStart(0)}>
                <span>Start a full practice test</span>
                <span className="lp3-arrow" aria-hidden="true">&rarr;</span>
              </button>
              <Link to="/practice-exams" className="lp3-btn-ghost lp3-btn-wide">
                <span>See the official exams</span>
                <span className="lp3-arrow lp3-arrow-muted" aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>
        </section>

        <SiteFooter />
      </div>

      <ExamAuthModal
        isOpen={authModalOpen}
        onClose={closeAuthModal}
        examId={modalExamId}
        actionType="start"
      />
    </div>
  );
};

export default LandingPageV3;
