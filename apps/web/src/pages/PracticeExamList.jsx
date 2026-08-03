import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { FiChevronRight, FiFileText, FiSearch } from 'react-icons/fi';
import { getAllPracticeExams } from '../firebase/services';
import { db as firestore } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import '../styles/PracticeExamList.css';
import ProUpgradeModal from '../components/membership/ProUpgradeModal';

const TOTAL_EXAM_QUESTIONS = 98;
const FULL_EXAM_MINUTES = 134;

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
    // Overhaul Phase C: index into the DISPLAYED (non-diagnostic, sorted) list —
    // the old code indexed the unfiltered list, so "Start Practice Test 3" could
    // launch a different exam — and respect the Pro gate instead of hardcoding
    // isPro=false (which let free users bypass the paywall via login redirects).
    if (startExamNumber && practiceExams.length > 0) {
      const visibleExams = practiceExams.filter((exam) => !exam.isDiagnostic);
      const examIndex = startExamNumber - 1;

      if (examIndex >= 0 && examIndex < visibleExams.length) {
        const exam = visibleExams[examIndex];
        window.history.replaceState({}, document.title);
        handleStartExam(exam, examIndex > 2);
      }
    }
  }, [handleStartExam, practiceExams, startExamNumber]);

  const handleExamRowClick = (item) => {
    if (item.status === 'in-progress') {
      handleContinueExam(item.progress);
      return;
    }

    handleStartExam(item.exam, item.isProExam);
  };

  const getExamActionLabel = (item) => {
    if (item.status === 'in-progress') return `Resume ${item.displayTitle}`;
    if (item.status === 'completed') return `Retake ${item.displayTitle}`;
    return `Start ${item.displayTitle}`;
  };

  const progressPercent = getProgressPercent(latestProgress);

  return (
    <>
      <div className="ut-page">
        <header className="ut-page-head">
          <div className="ut-page-head-main">
            <p className="ut-eyebrow">Practice</p>
            <h1 className="ut-page-title">Practice Tests</h1>
            <p className="ut-page-sub">
              Full-length Digital SAT practice exams under realistic test conditions.
            </p>
          </div>
          <div className="ut-page-head-actions">
            <span className="ut-chip ut-chip--accent">{officialExamLabel} exams</span>
            <span className="ut-chip">{TOTAL_EXAM_QUESTIONS} questions &middot; {FULL_EXAM_MINUTES} min</span>
          </div>
        </header>

        {error && <div className="ut-chip ut-chip--hard pel-error" role="alert">{error}</div>}

        {latestProgress && (
          <section className="ut-panel-ink pel-continue" aria-label="Continue your latest test">
            <div className="pel-continue-main">
              <span className="ut-label ut-label--on-ink">Continue where you left off</span>
              <h2 className="pel-continue-title">
                {latestProgressExam?.displayTitle || latestProgress.examTitle || 'Practice Test'}
              </h2>
              <p className="pel-continue-meta">
                {getModuleLabel(latestProgress)} &middot; {progressPercent}% complete
              </p>
              <div
                className="ut-progress ut-progress--lg ut-progress--on-ink pel-continue-progress"
                role="progressbar"
                aria-valuenow={progressPercent}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <span className="ut-progress-fill" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>
            <button
              type="button"
              className="ut-btn ut-btn--primary ut-btn--lg"
              onClick={() => handleContinueExam(latestProgress)}
            >
              Resume test
            </button>
          </section>
        )}

        <div className="ut-grid ut-grid--3" aria-label="Practice exam stats">
          <div className="ut-card">
            <div className="ut-stat">
              <span className="ut-stat-value">{officialExamLabel}</span>
              <span className="ut-stat-label">Official exams available</span>
            </div>
          </div>
          <div className="ut-card">
            <div className="ut-stat">
              <span className="ut-stat-value">{completedCount}</span>
              <span className="ut-stat-label">Completed</span>
            </div>
          </div>
          <div className="ut-card">
            <div className="ut-stat">
              <span className="ut-stat-value">{bestScore || '-'}</span>
              <span className="ut-stat-label">Best score</span>
            </div>
          </div>
        </div>

        <section aria-label="Available exams">
          <div className="ut-section-head">
            <h2 className="ut-section-title">Available exams</h2>
          </div>

          <div className="ut-search pel-search">
            <FiSearch aria-hidden="true" />
            <input
              type="search"
              className="ut-input"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search exams..."
              aria-label="Search practice exams"
            />
          </div>

          {isLoading && !practiceExams.length ? (
            <div className="ut-skeleton-stack" role="status" aria-label="Loading practice exams">
              <div className="ut-skeleton ut-skeleton--row" />
              <div className="ut-skeleton ut-skeleton--row" />
              <div className="ut-skeleton ut-skeleton--row" />
              <div className="ut-skeleton ut-skeleton--row" />
            </div>
          ) : filteredExams.length > 0 ? (
            <div>
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
                    className="ut-row ut-row--hover pel-exam-row"
                    onClick={() => handleExamRowClick(item)}
                    aria-label={getExamActionLabel(item)}
                  >
                    <span className={item.isOfficial ? 'ut-tile ut-tile--ink' : 'ut-tile'}>
                      <FiFileText />
                    </span>
                    <span className="pel-exam-main">
                      <strong className="pel-exam-title">{item.displayTitle}</strong>
                      <span className="ut-card-sub">
                        {item.isOfficial ? 'Official exam' : 'Full-length practice test'} &middot; 4 modules with break
                      </span>
                    </span>
                    <span className="pel-exam-side">
                      {item.showPro && <span className="ut-pro">Pro</span>}
                      {item.status === 'in-progress' && (
                        <span className="ut-chip ut-chip--accent">In progress</span>
                      )}
                      {item.status === 'completed' && (
                        <span className="ut-chip ut-chip--easy">
                          Completed{scoreDisplay !== null ? ` · ${scoreDisplay}` : ''}
                        </span>
                      )}
                      {item.status === 'not-started' && (
                        <span className="ut-chip">Not started</span>
                      )}
                      <FiChevronRight className="pel-exam-arrow" aria-hidden="true" />
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="ut-empty">
              <b>{searchTerm ? 'No matching exams' : 'No exams available'}</b>
              {searchTerm
                ? 'No practice exams match your search.'
                : 'No practice exams are currently available.'}
            </div>
          )}
        </section>
      </div>

      <ProUpgradeModal
        open={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        featureName="This exam"
        description="Free accounts get a taste of the exam library — Pro unlocks every full-length practice exam."
      />
    </>
  );
};

export default PracticeExamList;
