import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import {
  FaBookOpen,
  FaBookReader,
  FaCalculator,
  FaChartBar,
  FaChartLine,
  FaCheckCircle,
  FaChevronDown,
  FaChevronRight,
  FaClipboardList,
  FaCog,
  FaFileAlt,
  FaHome,
  FaLayerGroup,
  FaMagic,
  FaRegBell,
  FaRegCircle,
  FaRegClock,
  FaSearch,
  FaShieldAlt,
  FaUserCircle,
} from 'react-icons/fa';
import { getAllPracticeExams } from '../firebase/services';
import { db as firestore } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import '../styles/PracticeExamList.css';
import UpgradeModal from '../components/UpgradeModal';

const TOTAL_EXAM_QUESTIONS = 98;
const FULL_EXAM_MINUTES = 134;

const practiceTopNavItems = [
  { label: 'Dashboard', path: '/progress' },
  { label: 'Practice Exams', path: '/practice-exams' },
  { label: 'Question Bank', path: '/subject-quizzes' },
  { label: 'Flashcards', path: '/flashcards' },
];

const practiceTopTrailingNavItems = [
  { label: 'Lectures', path: '/lectures' },
  { label: 'Analytics', path: '/all-results' },
];

const practiceSideNavItems = [
  { label: 'Overview', path: '/progress', icon: <FaHome /> },
  { label: 'Study Plan', path: '/progress', icon: <FaShieldAlt /> },
  { label: 'Practice Tests', path: '/practice-exams', icon: <FaClipboardList /> },
  { label: 'Official Exams', path: '/practice-exams', icon: <FaFileAlt /> },
  { label: 'Question Bank', path: '/subject-quizzes', icon: <FaBookOpen /> },
  { label: 'Flashcards', path: '/flashcards', icon: <FaLayerGroup /> },
];

const practiceSideTrailingNavItems = [
  { label: 'Lectures', path: '/lectures', icon: <FaBookReader /> },
  { label: 'Analytics', path: '/all-results', icon: <FaChartBar /> },
  { label: 'Settings', path: '/profile', icon: <FaCog /> },
];

const getTimestamp = (value) => {
  if (!value) return 0;
  if (value.toDate) return value.toDate().getTime();
  if (value.seconds) return value.seconds * 1000;
  const parsed = new Date(value).getTime();
  return Number.isFinite(parsed) ? parsed : 0;
};

const getSatScore = (result) => {
  const readingWriting = Number(result?.scores?.readingWriting);
  const math = Number(result?.scores?.math);

  if (Number.isFinite(readingWriting) && Number.isFinite(math)) {
    return readingWriting + math;
  }

  const totalScore = Number(result?.totalScore);
  if (Number.isFinite(totalScore) && totalScore >= 400) {
    return totalScore;
  }

  return null;
};

const getProgressPercent = (progress) => {
  if (!progress) return 0;

  const moduleResponses = Object.values(progress.moduleResponses || {});
  const answered = moduleResponses.reduce((sum, module) => (
    sum + Object.keys(module?.answers || {}).length
  ), 0);
  const totalFromResponses = moduleResponses.reduce((sum, module) => (
    sum + (Array.isArray(module?.questions) ? module.questions.length : 0)
  ), 0);

  if (totalFromResponses > 0) {
    return Math.min(99, Math.max(1, Math.round((answered / totalFromResponses) * 100)));
  }

  const moduleCount = Array.isArray(progress.modulesMeta) && progress.modulesMeta.length > 0
    ? progress.modulesMeta.length
    : 4;
  const moduleIndex = typeof progress.currentModuleIndex === 'number' ? progress.currentModuleIndex : 0;
  const questionIndex = typeof progress.currentQuestionIndex === 'number' ? progress.currentQuestionIndex : 0;
  const estimatedQuestionCount = Math.max(moduleCount, moduleCount * 25);
  const estimatedCompleted = (moduleIndex * 25) + questionIndex;

  return Math.min(99, Math.max(1, Math.round((estimatedCompleted / estimatedQuestionCount) * 100)));
};

const getModuleLabel = (progress) => {
  const moduleIndex = typeof progress?.currentModuleIndex === 'number' ? progress.currentModuleIndex : 0;
  return moduleIndex < 2 ? 'Reading & Writing' : 'Math';
};

const PracticeExamList = () => {
  const {
    currentUser,
    userMembership,
    getInProgressExams,
  } = useAuth();
  const [practiceExams, setPracticeExams] = useState([]);
  const [completedExamHistory, setCompletedExamHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [inProgressExams, setInProgressExams] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const startExamNumber = location.state?.startExamNumber;

  const fetchPracticeExams = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const exams = await getAllPracticeExams(true);

      exams.sort((a, b) => {
        const numA = parseInt(a.title?.match(/\d+/)?.[0] || 0, 10);
        const numB = parseInt(b.title?.match(/\d+/)?.[0] || 0, 10);
        return numA - numB;
      });

      setPracticeExams(exams);
    } catch (err) {
      setError('Failed to load practice exams: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchInProgress = useCallback(async () => {
    if (!currentUser || !getInProgressExams) {
      setInProgressExams([]);
      return;
    }
    try {
      const items = await getInProgressExams();
      setInProgressExams(items || []);
    } catch (e) {
      setInProgressExams([]);
    }
  }, [currentUser, getInProgressExams]);

  const fetchCompletedExamHistory = useCallback(async () => {
    if (!currentUser) {
      setCompletedExamHistory([]);
      return;
    }

    try {
      const examsCollectionRef = collection(firestore, `users/${currentUser.uid}/practiceExams`);
      const completedQuery = query(examsCollectionRef, orderBy('completedAt', 'desc'));
      const querySnapshot = await getDocs(completedQuery);
      const history = querySnapshot.docs.map((docSnapshot) => ({
        id: docSnapshot.id,
        ...docSnapshot.data(),
      }));
      setCompletedExamHistory(history);
    } catch (err) {
      console.error('[PracticeExamList] Failed to load completed exams:', err);
      setCompletedExamHistory([]);
    }
  }, [currentUser]);

  const handleContinueExam = useCallback((progress) => {
    if (!progress || !progress.practiceExamId) return;
    navigate('/practice-exam/' + progress.practiceExamId, { state: { resume: true } });
  }, [navigate]);

  const handleStartExam = useCallback((exam, isPro) => {
    if (!exam) return;

    const isFreeOrNotSignedIn = !currentUser || !userMembership || userMembership.tier === 'free';
    if (isPro && isFreeOrNotSignedIn) {
      setShowUpgradeModal(true);
      return;
    }

    sessionStorage.setItem('currentPracticeExam', JSON.stringify({
      examId: exam.id,
      title: exam.title,
      moduleIds: exam.moduleIds,
    }));
    navigate('/practice-exam/' + exam.id, { state: { startExam: true } });
  }, [currentUser, navigate, userMembership]);

  const handleAICoach = useCallback(() => {
    navigate('/ai-coach');
  }, [navigate]);

  useEffect(() => {
    fetchPracticeExams();
  }, [fetchPracticeExams]);

  useEffect(() => {
    fetchInProgress();
    fetchCompletedExamHistory();
  }, [fetchCompletedExamHistory, fetchInProgress]);

  const completedByPracticeExam = useMemo(() => {
    const completedMap = new Map();

    completedExamHistory.forEach((result) => {
      if (!result.practiceExamId) return;

      const satScore = getSatScore(result);
      const existing = completedMap.get(result.practiceExamId);
      const existingScore = getSatScore(existing);

      if (!existing) {
        completedMap.set(result.practiceExamId, result);
        return;
      }

      if (satScore !== null && (existingScore === null || satScore > existingScore)) {
        completedMap.set(result.practiceExamId, result);
        return;
      }

      if (satScore === existingScore && getTimestamp(result.completedAt) > getTimestamp(existing.completedAt)) {
        completedMap.set(result.practiceExamId, result);
      }
    });

    return completedMap;
  }, [completedExamHistory]);

  const inProgressByPracticeExam = useMemo(() => {
    return new Map(inProgressExams.map((progress) => [progress.practiceExamId, progress]));
  }, [inProgressExams]);

  const availableExams = useMemo(() => {
    const isFreeOrNotSignedIn = !currentUser || !userMembership || userMembership.tier === 'free';
    let practiceCounter = 0;

    return practiceExams
      .filter((exam) => !exam.isDiagnostic)
      .map((exam, idx) => {
        const isOfficial = exam.isOfficial === true;
        if (!isOfficial) practiceCounter += 1;

        const progress = inProgressByPracticeExam.get(exam.id);
        const completedResult = completedByPracticeExam.get(exam.id);
        const isProExam = idx > 2;
        const satScore = getSatScore(completedResult);
        const status = progress ? 'in-progress' : completedResult ? 'completed' : 'not-started';

        return {
          exam,
          isOfficial,
          isProExam,
          showPro: isProExam && isFreeOrNotSignedIn,
          progress,
          completedResult,
          satScore,
          status,
          displayTitle: isOfficial ? exam.title : `Practice Test ${practiceCounter}`,
        };
      });
  }, [completedByPracticeExam, currentUser, inProgressByPracticeExam, practiceExams, userMembership]);

  const filteredExams = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    if (!normalizedSearch) return availableExams;

    return availableExams.filter((item) => (
      item.displayTitle.toLowerCase().includes(normalizedSearch)
      || item.status.replace('-', ' ').includes(normalizedSearch)
      || (item.isOfficial ? 'official' : 'practice').includes(normalizedSearch)
    ));
  }, [availableExams, searchTerm]);

  const latestProgress = useMemo(() => {
    return [...inProgressExams].sort((a, b) => getTimestamp(b.updatedAt) - getTimestamp(a.updatedAt))[0] || null;
  }, [inProgressExams]);

  const latestProgressExam = useMemo(() => {
    if (!latestProgress) return null;
    return availableExams.find((item) => item.exam.id === latestProgress.practiceExamId) || null;
  }, [availableExams, latestProgress]);

  const bestScore = useMemo(() => {
    const scores = completedExamHistory
      .map(getSatScore)
      .filter((score) => Number.isFinite(score));

    return scores.length > 0 ? Math.max(...scores) : null;
  }, [completedExamHistory]);

  const completedCount = completedExamHistory.length;
  const officialExamLabel = isLoading && practiceExams.length === 0
    ? '...'
    : practiceExams.filter((exam) => !exam.isDiagnostic).length >= 10
      ? `${practiceExams.filter((exam) => !exam.isDiagnostic).length}+`
      : String(practiceExams.filter((exam) => !exam.isDiagnostic).length);

  useEffect(() => {
    if (startExamNumber && practiceExams.length > 0) {
      const examIndex = startExamNumber - 1;

      if (examIndex >= 0 && examIndex < practiceExams.length) {
        const exam = practiceExams[examIndex];
        window.history.replaceState({}, document.title);
        handleStartExam(exam, false);
      }
    }
  }, [handleStartExam, practiceExams, startExamNumber]);

  const handleExamRowClick = (item) => {
    if (item.status === 'in-progress') {
      handleContinueExam(item.progress);
      return;
    }

    if (item.status === 'completed' && item.completedResult?.id) {
      navigate(`/exam/results/${item.completedResult.id}`);
      return;
    }

    handleStartExam(item.exam, item.isProExam);
  };

  const progressPercent = getProgressPercent(latestProgress);
  const userFirstName = currentUser?.displayName?.split(' ')[0] || currentUser?.email?.split('@')[0] || 'Alex';

  return (
    <>
      <div className="practice-exam-dashboard">
        <aside className="practice-shell-sidebar" aria-label="Practice exams navigation">
          <Link className="practice-brand" to="/progress">
            <span className="practice-brand-mark">SAT</span>
            <span className="practice-brand-text">
              <span>Ultra</span><span>SAT</span><span>Prep</span>
            </span>
          </Link>

          <nav className="practice-side-nav">
            {practiceSideNavItems.map((item) => (
              <Link
                key={`${item.label}-${item.path}`}
                className={`practice-side-link ${item.path === '/practice-exams' && item.label === 'Practice Tests' ? 'active' : ''}`}
                to={item.path}
              >
                <span className="practice-side-icon">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}

            <button type="button" className="practice-side-link practice-side-link-button" onClick={handleAICoach}>
              <span className="practice-side-icon"><FaMagic /></span>
              <span>AI Coach</span>
              <span className="practice-beta-badge">Beta</span>
            </button>
            {practiceSideTrailingNavItems.map((item) => (
              <Link
                key={`${item.label}-${item.path}`}
                className="practice-side-link"
                to={item.path}
              >
                <span className="practice-side-icon">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="practice-ai-card">
            <FaMagic className="practice-ai-card-icon" />
            <p>Unlock your potential with AI Coach</p>
            <button type="button" onClick={handleAICoach}>Try AI Coach</button>
          </div>
        </aside>

        <div className="practice-shell-content">
          <header className="practice-topbar">
            <nav className="practice-top-nav" aria-label="Primary">
              {practiceTopNavItems.map((item) => (
                <Link
                  key={item.path}
                  className={`practice-top-link ${item.path === '/practice-exams' ? 'active' : ''}`}
                  to={item.path}
                >
                  {item.label}
                </Link>
              ))}
              <button type="button" className="practice-top-link practice-top-button" onClick={handleAICoach}>
                AI Coach <span>Beta</span>
              </button>
              {practiceTopTrailingNavItems.map((item) => (
                <Link
                  key={item.path}
                  className="practice-top-link"
                  to={item.path}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="practice-top-actions">
              <label className="practice-search">
                <FaSearch aria-hidden="true" />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search anything..."
                  aria-label="Search practice exams"
                />
                <span>Ctrl K</span>
              </label>

              <button type="button" className="practice-notification" aria-label="Notifications">
                <FaRegBell />
                <span>3</span>
              </button>

              <Link className="practice-profile-chip" to="/profile">
                {currentUser?.photoURL ? (
                  <img src={currentUser.photoURL} alt="" />
                ) : (
                  <FaUserCircle />
                )}
                <span>{userFirstName}</span>
                <FaChevronDown />
              </Link>
            </div>
          </header>

          <main className="practice-dashboard-main">
            {error && <div className="practice-error-message">{error}</div>}

            <section className="practice-hero-row">
              <div className="practice-title-block">
                <div className="practice-title-line">
                  <h1>Practice Exams</h1>
                  <FaMagic aria-hidden="true" />
                </div>
                <p>Take full-length Digital SAT practice exams under realistic test conditions.</p>
              </div>

              <div className="practice-stats-grid" aria-label="Practice exam stats">
                <div className="practice-stat-card">
                  <span className="practice-stat-icon"><FaFileAlt /></span>
                  <div>
                    <p>Official Exams</p>
                    <strong>{officialExamLabel}</strong>
                    <span>Full-length digital SATs</span>
                  </div>
                </div>
                <div className="practice-stat-card">
                  <span className="practice-stat-icon"><FaRegClock /></span>
                  <div>
                    <p>Completed</p>
                    <strong>{completedCount}</strong>
                    <span>Exams finished</span>
                  </div>
                </div>
                <div className="practice-stat-card">
                  <span className="practice-stat-icon"><FaChartLine /></span>
                  <div>
                    <p>Best Score</p>
                    <strong>{bestScore || '-'}</strong>
                    <span>Latest personal best</span>
                  </div>
                </div>
              </div>
            </section>

            {latestProgress && (
              <section className="practice-continue-card" aria-label="Continue your latest test">
                <div className="practice-continue-copy">
                  <h2>Continue your latest test</h2>
                  <div className="practice-continue-exam">
                    <span className="practice-document-icon"><FaFileAlt /></span>
                    <div>
                      <strong>{latestProgressExam?.displayTitle || latestProgress.examTitle || 'Practice Test'}</strong>
                      <p>{getModuleLabel(latestProgress)} - {progressPercent}% complete</p>
                    </div>
                  </div>
                </div>
                <div className="practice-progress-ring" style={{ '--progress': `${progressPercent}%` }}>
                  <span>{progressPercent}%</span>
                </div>
                <button type="button" className="practice-resume-button" onClick={() => handleContinueExam(latestProgress)}>
                  Resume Exam
                </button>
              </section>
            )}

            <section className="practice-list-section">
              <h2>Available Exams</h2>

              {isLoading && !practiceExams.length ? (
                <div className="practice-loading-state">
                  <span className="practice-spinner" />
                  <p>Loading practice exams...</p>
                </div>
              ) : filteredExams.length > 0 ? (
                <div className="practice-exam-table">
                  {filteredExams.map((item) => {
                    const scoreDisplay = item.satScore !== null
                      ? item.satScore
                      : item.completedResult?.overallScore !== undefined
                        ? `${item.completedResult.overallScore}%`
                        : null;
                    return (
                      <button
                        type="button"
                        key={item.exam.id}
                        className={`practice-exam-row status-${item.status}`}
                        onClick={() => handleExamRowClick(item)}
                      >
                        <span className="practice-row-document"><FaFileAlt /></span>
                        <span className="practice-row-main">
                          <span>
                            <strong>{item.displayTitle}</strong>
                            {item.isOfficial && <em>Official</em>}
                            {item.showPro && <em>Pro</em>}
                          </span>
                          <small>Full-length - {Math.floor(FULL_EXAM_MINUTES / 60)}h {FULL_EXAM_MINUTES % 60}m - {TOTAL_EXAM_QUESTIONS} questions</small>
                        </span>

                        <span className="practice-row-meta">
                          {scoreDisplay && <strong>{scoreDisplay}</strong>}
                          <span className="practice-status-pill">
                            {item.status === 'completed' && <FaCheckCircle />}
                            {item.status !== 'completed' && <FaRegCircle />}
                            {item.status === 'completed' ? 'Completed' : item.status === 'in-progress' ? 'In Progress' : 'Not Started'}
                          </span>
                        </span>
                        <FaChevronRight className="practice-row-arrow" />
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="practice-empty-state">
                  <p>{searchTerm ? 'No practice exams match your search.' : 'No practice exams are currently available.'}</p>
                </div>
              )}
            </section>

            <section className="practice-exam-info-bar" aria-label="Practice exam format">
              <strong>How practice exams work</strong>
              <span><FaBookOpen /> 2 Reading & Writing modules</span>
              <span><FaCalculator /> 2 Math modules</span>
              <span><FaRegClock /> Built-in break and scoring insights</span>
            </section>
          </main>
        </div>
      </div>

      <UpgradeModal open={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
    </>
  );
};

export default PracticeExamList;
