/* SmartQuizResults — "Quiz Results" (V3 redesign, same system as ExamResults).
 *
 * The exam Score Details language applied to a one-skill smart quiz:
 *   - ink hero: accuracy + skill-level ladder + you-vs-class comparison
 *   - promotion / mastery banners, CoachDebrief kept
 *   - stat tiles + question table (time & class-difficulty columns instead of
 *     section/domain — the quiz is a single skill)
 *   - the same fullscreen review modal (.xrm-): question left, answer +
 *     rationale right, Previous/Next, report flag, study link
 *
 * Explanations: questions with `explanationStructured` render through the
 * shared ExplanationCard (rule / walkthrough / rebuttals / remember); legacy
 * flat `explanation` strings render as parsed verdict blocks (utils/rationale).
 * Peer stats (P2-B) stay: class %-correct and average time per question.
 * Styles live in styles/Results.css (.xr- / .xrm- / .xq-).
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import DOMPurify from 'dompurify';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { DIFFICULTY_FOR_LEVEL } from '../utils/smartQuizUtils';
import { getSubcategoryName, getKebabCaseFromAnyFormat } from '../utils/subcategoryConstants';
import { processTextMarkup } from '../utils/textProcessing';
import { parseRationale } from '../utils/rationale';
import { loadKatexAutoRender, containsMathDelimiters } from '../utils/katexLoader';
import {
  FiArrowDown,
  FiArrowLeft,
  FiArrowRight,
  FiArrowUp,
  FiAward,
  FiBookOpen,
  FiCheck,
  FiCheckCircle,
  FiFlag,
  FiLock,
  FiRefreshCw,
  FiUsers,
  FiX,
  FiXCircle,
  FiAlertCircle,
} from 'react-icons/fi';
import { getStatsForQuestions, formatStats, formatPeerSeconds } from '../firebase/questionStatsServices';
import ExplanationCard from '../components/ExplanationCard';
import ReportQuestionModal from '../components/ReportQuestionModal';
import WordSaver from '../components/WordSaver';
import CoachDebrief from '../components/coach/CoachDebrief';
import { reportQuestion } from '../api/reportClient';
import { toast } from 'react-toastify';
import '../styles/Results.css';

/* ---------------------------------------------------------------- helpers */

const KATEX_DELIMITERS = [
  { left: '$$', right: '$$', display: true },
  { left: '\\[', right: '\\]', display: true },
  { left: '\\(', right: '\\)', display: false },
  { left: '$', right: '$', display: false },
];

const STATUS_RANK = { incorrect: 0, omitted: 1, correct: 2 };

const getSafeMarkup = (value) => DOMPurify.sanitize(processTextMarkup(value) || '');

const capitalize = (value) =>
  typeof value === 'string' && value ? value.charAt(0).toUpperCase() + value.slice(1) : value;

const letterFor = (index) => String.fromCharCode(65 + index);

const clampText = (value, max = 24) => {
  const str = String(value);
  return str.length > max ? `${str.slice(0, max - 1)}…` : str;
};

/** Sanitized HTML for a rationale block, with the verdict lead-in bolded. */
const rationaleBlockHtml = (block) => {
  if (block.leadLength > 0 && block.leadLength < block.text.length) {
    return `<strong>${getSafeMarkup(block.text.slice(0, block.leadLength))}</strong>${getSafeMarkup(
      block.text.slice(block.leadLength)
    )}`;
  }
  return getSafeMarkup(block.text);
};

// Defensive correct-option resolution (numeric, option-text, or numeric-string
// correctAnswer). Mirrors SmartQuiz.jsx / ExplanationCard.
const resolveCorrectOptionIndex = (question) => {
  const options = Array.isArray(question?.options) ? question.options : [];
  if (options.length === 0) return null;
  const { correctAnswer } = question;
  if (typeof correctAnswer === 'number' && options[correctAnswer] !== undefined) return correctAnswer;
  if (typeof correctAnswer === 'string') {
    const idx = options.indexOf(correctAnswer);
    if (idx >= 0) return idx;
    if (/^[0-9]+$/.test(correctAnswer.trim())) {
      const n = parseInt(correctAnswer.trim(), 10);
      if (options[n] !== undefined) return n;
    }
  }
  return null;
};

const hasStructuredExplanation = (question) =>
  !!question?.explanationStructured &&
  typeof question.explanationStructured === 'object' &&
  !Array.isArray(question.explanationStructured);

/* ------------------------------------------------------------- component */

export default function SmartQuizResults() {
  const { quizId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [peerStats, setPeerStats] = useState({});

  const [showAnswers, setShowAnswers] = useState(true);
  const [sort, setSort] = useState({ key: 'number', dir: 1 });
  const [reviewIndex, setReviewIndex] = useState(null);

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [selectedQuestionForReport, setSelectedQuestionForReport] = useState(null);

  const modalBodyRef = useRef(null);

  /* ---------------------------------------------------------- data load */

  useEffect(() => {
    const fetchQuizResults = async () => {
      if (!currentUser || !quizId) {
        setError('Missing user or quiz information');
        setLoading(false);
        return;
      }

      try {
        const quizRef = doc(db, 'smartQuizzes', quizId);
        const snap = await getDoc(quizRef);

        if (!snap.exists()) {
          setError('Quiz not found');
          setLoading(false);
          return;
        }

        const data = snap.data();
        if (data.userId !== currentUser.uid) {
          setError('You do not have access to this quiz');
          setLoading(false);
          return;
        }

        // P2-B peer stats — parallel, fire-and-forget; rows gain stats on resolve.
        const statIds =
          Array.isArray(data.questionIds) && data.questionIds.length > 0
            ? data.questionIds
            : Array.isArray(data.questions)
              ? data.questions.map((q) => q?.id).filter(Boolean)
              : [];
        if (statIds.length > 0) {
          getStatsForQuestions(statIds)
            .then((statsMap) => {
              const derived = {};
              statIds.forEach((id) => {
                derived[id] = formatStats(statsMap[id]);
              });
              setPeerStats(derived);
            })
            .catch((statsError) => {
              console.warn('[SmartQuizResults] Peer stats unavailable (non-critical):', statsError?.message);
            });
        }

        let questionsData = [];
        if (data.questionIds && data.questionIds.length > 0) {
          const questionPromises = data.questionIds.map(async (questionId) => {
            const questionRef = doc(db, 'questions', questionId);
            const questionSnap = await getDoc(questionRef);
            return questionSnap.exists() ? { id: questionSnap.id, ...questionSnap.data() } : null;
          });
          questionsData = (await Promise.all(questionPromises)).filter((q) => q !== null);
        } else if (data.questions) {
          questionsData = data.questions; // Legacy support
        }

        setQuiz({ id: snap.id, ...data, questions: questionsData });
        setLoading(false);
        window.scrollTo(0, 0);
      } catch (err) {
        console.error('Error fetching quiz results:', err);
        setError('Failed to load quiz results');
        setLoading(false);
      }
    };

    fetchQuizResults();
  }, [currentUser, quizId]);

  /* ------------------------------------------------------- derived rows */

  const questions = useMemo(() => quiz?.questions || [], [quiz]);
  const userAnswers = useMemo(() => quiz?.userAnswers || {}, [quiz]);

  const rows = useMemo(
    () =>
      questions.map((question, index) => {
        const answer = userAnswers[question.id];
        // An entry may be missing, flagged { omitted: true }, or hold an empty
        // response — all of those are the neutral "Omitted" state.
        const hasResponse =
          !!answer &&
          answer.selectedOption !== null &&
          answer.selectedOption !== undefined &&
          answer.selectedOption !== '';
        const omitted = !hasResponse || answer?.omitted === true;
        const status = omitted ? 'omitted' : answer?.isCorrect ? 'correct' : 'incorrect';

        const options = Array.isArray(question.options) ? question.options : [];
        const multipleChoice = options.length > 0;
        const keyIndex = multipleChoice ? resolveCorrectOptionIndex(question) : null;
        const userIndex =
          multipleChoice && !omitted && typeof answer?.selectedOption === 'number'
            ? answer.selectedOption
            : null;

        const timeSec =
          !omitted && typeof answer?.timeSpent === 'number' && Number.isFinite(answer.timeSpent)
            ? Math.max(0, Math.round(answer.timeSpent))
            : null;

        return {
          uid: question.id || `q-${index}`,
          number: index + 1,
          question,
          status,
          omitted,
          multipleChoice,
          keyIndex,
          keyDisplay: multipleChoice
            ? keyIndex !== null
              ? letterFor(keyIndex)
              : clampText(question.correctAnswer ?? '—')
            : clampText(question.correctAnswer ?? '—'),
          userIndex,
          userDisplay: omitted
            ? null
            : multipleChoice
              ? userIndex !== null
                ? letterFor(userIndex)
                : clampText(answer.selectedOption)
              : clampText(answer.selectedOption),
          timeSec,
        };
      }),
    [questions, userAnswers]
  );

  const counts = useMemo(() => {
    const c = { all: rows.length, correct: 0, incorrect: 0, omitted: 0 };
    rows.forEach((row) => {
      c[row.status] += 1;
    });
    return c;
  }, [rows]);

  // Class comparison: mean peer %-correct and mean times, when enough data.
  const classAgg = useMemo(() => {
    const pcts = [];
    const classTimes = [];
    rows.forEach((row) => {
      const peer = peerStats[row.question.id];
      if (peer && typeof peer.pctCorrect === 'number') pcts.push(peer.pctCorrect);
      if (peer && typeof peer.avgTimeSec === 'number') classTimes.push(peer.avgTimeSec);
    });
    const yourTimes = rows.map((r) => r.timeSec).filter((t) => t !== null);
    const mean = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null);
    return {
      classPct: pcts.length ? Math.round(mean(pcts)) : null,
      classAvgTime: classTimes.length ? Math.round(mean(classTimes)) : null,
      yourAvgTime: yourTimes.length ? Math.round(mean(yourTimes)) : null,
    };
  }, [rows, peerStats]);

  const sortedRows = useMemo(() => {
    const sorted = [...rows];
    sorted.sort((a, b) => {
      let cmp = 0;
      if (sort.key === 'number') {
        cmp = a.number - b.number;
      } else if (sort.key === 'status') {
        cmp = STATUS_RANK[a.status] - STATUS_RANK[b.status];
        if (cmp === 0) cmp = a.number - b.number;
      } else if (sort.key === 'classPct') {
        const aPct = peerStats[a.question.id]?.pctCorrect;
        const bPct = peerStats[b.question.id]?.pctCorrect;
        cmp = (aPct ?? 999) - (bPct ?? 999); // ascending = hardest first
        if (cmp === 0) cmp = a.number - b.number;
      }
      return cmp * sort.dir;
    });
    return sorted;
  }, [rows, sort, peerStats]);

  const reviewRow = reviewIndex !== null ? sortedRows[reviewIndex] : null;

  /* ------------------------------------------------------------- events */

  const handleSort = (key) => {
    setSort((prev) => (prev.key === key ? { key, dir: -prev.dir } : { key, dir: 1 }));
  };

  const openReview = (row) => {
    const index = sortedRows.findIndex((r) => r.uid === row.uid);
    if (index >= 0) setReviewIndex(index);
  };

  const closeReview = () => setReviewIndex(null);

  const stepReview = (delta) => {
    setReviewIndex((prev) => {
      if (prev === null) return prev;
      const next = prev + delta;
      if (next < 0 || next >= sortedRows.length) return prev;
      return next;
    });
  };

  const handleReportQuestion = async (reason) => {
    if (!selectedQuestionForReport) return;
    setReportLoading(true);
    try {
      await reportQuestion(selectedQuestionForReport.id, quizId, reason);
      toast.success('Question reported successfully. Thank you for your feedback!');
      setIsReportModalOpen(false);
      setSelectedQuestionForReport(null);
    } catch (err) {
      console.error('Error reporting question:', err);
      toast.error(err.message || 'Failed to report question. Please try again.');
    } finally {
      setReportLoading(false);
    }
  };

  /* -- modal: keyboard nav + scroll lock -- */
  useEffect(() => {
    if (reviewIndex === null) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') setReviewIndex(null);
      if (event.key === 'ArrowRight') stepReview(1);
      if (event.key === 'ArrowLeft') stepReview(-1);
    };
    document.addEventListener('keydown', onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reviewIndex]);

  /* -- modal: KaTeX auto-render (lazy, only when math is present) -- */
  useEffect(() => {
    if (!reviewRow || !modalBodyRef.current) return;
    let haystack = '';
    try {
      haystack = JSON.stringify(reviewRow.question);
    } catch (err) {
      haystack = String(reviewRow.question.text || '');
    }
    if (!containsMathDelimiters(haystack)) return;
    loadKatexAutoRender()
      .then((renderMathInElement) => {
        if (!modalBodyRef.current) return;
        try {
          renderMathInElement(modalBodyRef.current, {
            delimiters: KATEX_DELIMITERS,
            throwOnError: false,
          });
        } catch (err) {
          // Malformed TeX — plain text stays visible.
        }
      })
      .catch(() => {
        // CDN unavailable — equations degrade to readable TeX text.
      });
  }, [reviewRow, showAnswers]);

  /* ------------------------------------------------------------- render */

  if (loading) {
    return (
      <div className="xr" role="status" aria-label="Loading results">
        <div className="ut-skeleton ut-skeleton--text" style={{ width: 110, marginBottom: 12 }} />
        <div className="ut-skeleton ut-skeleton--title" style={{ width: 240, marginBottom: 26 }} />
        <div className="ut-skeleton ut-skeleton--card" style={{ height: 170, marginBottom: 26 }} />
        <div className="ut-grid ut-grid--4" style={{ marginBottom: 22 }}>
          <div className="ut-skeleton ut-skeleton--stat" />
          <div className="ut-skeleton ut-skeleton--stat" />
          <div className="ut-skeleton ut-skeleton--stat" />
          <div className="ut-skeleton ut-skeleton--stat" />
        </div>
        <div className="ut-skeleton-stack">
          <div className="ut-skeleton ut-skeleton--row" />
          <div className="ut-skeleton ut-skeleton--row" />
          <div className="ut-skeleton ut-skeleton--row" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>Error: {error}</p>
        <button onClick={() => navigate('/progress')}>Return to Dashboard</button>
      </div>
    );
  }

  if (!quiz) return null;

  const { score, level, passed, subcategoryId, questionCount } = quiz;
  const correctCount = counts.correct;
  const levelName = capitalize(DIFFICULTY_FOR_LEVEL[level]) || 'Unknown';
  const wasPromoted = passed && level < 3;
  const hasMastered = passed && level === 3;
  const subcategoryName = getSubcategoryName(subcategoryId) || 'this skill';
  const lessonCandidate = getKebabCaseFromAnyFormat(subcategoryId);
  const lessonSubcategoryId =
    lessonCandidate && getSubcategoryName(lessonCandidate) !== 'Unknown Subcategory'
      ? lessonCandidate
      : null;

  const ladderState = (n) => {
    if (hasMastered) return 'done';
    if (n < level) return 'done';
    if (n === level) return passed ? 'done' : 'current';
    return wasPromoted && n === level + 1 ? 'current' : 'locked';
  };

  const sortIcon = (key) =>
    sort.key === key ? (
      sort.dir === 1 ? (
        <FiArrowUp aria-hidden="true" />
      ) : (
        <FiArrowDown aria-hidden="true" />
      )
    ) : null;

  const peerFor = (row) => peerStats[row.question.id] || null;

  return (
    <div className="xr">
      <ReportQuestionModal
        isOpen={isReportModalOpen}
        onClose={() => {
          setIsReportModalOpen(false);
          setSelectedQuestionForReport(null);
        }}
        onReport={handleReportQuestion}
        loading={reportLoading}
      />

      {/* ── page head ── */}
      <header className="xr-head">
        <div className="xr-head-main">
          <span className="ut-eyebrow">Results</span>
          <h1 className="ut-page-title">{hasMastered ? 'Skill Mastered!' : 'Quiz Results'}</h1>
          <p className="ut-page-sub">
            {subcategoryName} · Level {level} ({levelName}) · question-by-question review.
          </p>
        </div>
        <div className="xr-head-actions">
          <button
            type="button"
            className="ut-btn ut-btn--ghost ut-btn--sm"
            onClick={() => navigate('/progress')}
          >
            <FiArrowLeft aria-hidden="true" /> Dashboard
          </button>
          <button
            type="button"
            className="ut-btn ut-btn--primary ut-btn--sm"
            onClick={() =>
              navigate('/smart-quiz-generator', {
                state: { subcategoryId, forceLevel: wasPromoted ? level + 1 : level },
              })
            }
          >
            {wasPromoted ? (
              <>
                <FiArrowUp aria-hidden="true" /> Go to Level {level + 1}
              </>
            ) : (
              <>
                <FiRefreshCw aria-hidden="true" /> Practice Again
              </>
            )}
          </button>
        </div>
      </header>

      {/* ── score hero ── */}
      <section className="xr-hero" aria-label="Quiz score">
        <div>
          <p className="xr-hero__label">Accuracy</p>
          <p className="xr-hero__score">
            {score}
            <small>%</small>
          </p>
          <p className="xq-hero-sub">
            {correctCount} of {questionCount} correct
          </p>
          <div className="xr-hero__chips">
            <span className="xr-hero__chip">{subcategoryName}</span>
            <span className="xr-hero__chip">
              Level {level} · {levelName}
            </span>
            {passed ? (
              <span className="xr-hero__chip xq-chip--pass">Passed</span>
            ) : (
              <span className="xr-hero__chip xq-chip--fail">Needs work</span>
            )}
          </div>
        </div>

        <div className="xq-side">
          {/* skill-level ladder */}
          <div>
            <p className="xq-side__label">Skill Level</p>
            <div className="xq-ladder">
              {[1, 2, 3].map((n) => {
                const state = ladderState(n);
                return (
                  <div key={n} className={`xq-ladder__step xq-ladder__step--${state}`}>
                    <span className="xq-ladder__num">
                      {state === 'done' ? <FiCheck aria-hidden="true" /> : n}
                    </span>
                    <span className="xq-ladder__name">{capitalize(DIFFICULTY_FOR_LEVEL[n]) || `Level ${n}`}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* you vs class */}
          {classAgg.classPct !== null && (
            <div>
              <p className="xq-side__label">
                <FiUsers aria-hidden="true" /> vs. class on these questions
              </p>
              <div className="xq-compare">
                <div className="xq-compare__row">
                  <span className="xq-compare__who">You</span>
                  <div className="xr-hero__bar">
                    <div
                      className="xr-hero__bar-fill"
                      style={{ width: `${Math.max(0, Math.min(100, score))}%` }}
                    />
                  </div>
                  <span className="xq-compare__pct">{score}%</span>
                </div>
                <div className="xq-compare__row">
                  <span className="xq-compare__who">Class</span>
                  <div className="xr-hero__bar">
                    <div
                      className="xr-hero__bar-fill xq-compare__fill--class"
                      style={{ width: `${Math.max(0, Math.min(100, classAgg.classPct))}%` }}
                    />
                  </div>
                  <span className="xq-compare__pct">{classAgg.classPct}%</span>
                </div>
              </div>
              {classAgg.yourAvgTime !== null && classAgg.classAvgTime !== null && (
                <p className="xq-time">
                  Avg time per question — you {formatPeerSeconds(classAgg.yourAvgTime)} · class{' '}
                  {formatPeerSeconds(classAgg.classAvgTime)}
                </p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── promotion / mastery ── */}
      {wasPromoted && (
        <div className="xq-banner xq-banner--promo">
          <FiArrowUp aria-hidden="true" />
          <span>
            Promoted — Level {level + 1} ({capitalize(DIFFICULTY_FOR_LEVEL[level + 1])}) is unlocked for{' '}
            {subcategoryName}.
          </span>
        </div>
      )}
      {hasMastered && (
        <div className="xq-banner xq-banner--mastery">
          <FiAward aria-hidden="true" />
          <span>You&apos;ve mastered {subcategoryName} — every level cleared.</span>
        </div>
      )}

      {/* AI Coach (Phase 1): grounded post-quiz debrief with one-tap actions */}
      <CoachDebrief quizId={quizId} />

      {/* ── questions overview ── */}
      <div className="xr-section-head">
        <h2 className="xr-section-title">Questions Overview</h2>
      </div>
      <p className="xr-section-sub">Review your result for each question from this quiz.</p>

      <div className="xr-overview">
        <div className="xr-stat xr-stat--total">
          <span className="xr-stat__value">{counts.all}</span>
          <span className="xr-stat__label">Total Questions</span>
        </div>
        <div className="xr-stat xr-stat--correct">
          <span className="xr-stat__value">{counts.correct}</span>
          <span className="xr-stat__label">Correct</span>
        </div>
        <div className="xr-stat xr-stat--incorrect">
          <span className="xr-stat__value">{counts.incorrect}</span>
          <span className="xr-stat__label">Incorrect</span>
        </div>
        <div className="xr-stat xr-stat--omitted">
          <span className="xr-stat__value">{counts.omitted}</span>
          <span className="xr-stat__label">Omitted</span>
        </div>
      </div>

      {/* ── toolbar ── */}
      <div className="xr-toolbar">
        <button
          type="button"
          className={`xr-switch${showAnswers ? ' xr-switch--on' : ''}`}
          aria-pressed={showAnswers}
          onClick={() => setShowAnswers((prev) => !prev)}
        >
          <span className="xr-switch__track" />
          Show correct answers
        </button>
        {lessonSubcategoryId && (
          <Link className="xrm-study" to={`/learn/${lessonSubcategoryId}`}>
            <FiBookOpen aria-hidden="true" /> Lesson: {subcategoryName}
          </Link>
        )}
      </div>

      {/* ── table ── */}
      <div className="xr-tablewrap">
        <table className="xr-table">
          <thead>
            <tr>
              <th>
                <button
                  type="button"
                  className={`xr-th-sort${sort.key === 'number' ? ' xr-th-sort--active' : ''}`}
                  onClick={() => handleSort('number')}
                >
                  Question {sortIcon('number')}
                </button>
              </th>
              <th>Correct Answer</th>
              <th>
                <button
                  type="button"
                  className={`xr-th-sort${sort.key === 'status' ? ' xr-th-sort--active' : ''}`}
                  onClick={() => handleSort('status')}
                >
                  Your Answer {sortIcon('status')}
                </button>
              </th>
              <th>Time</th>
              <th>
                <button
                  type="button"
                  className={`xr-th-sort${sort.key === 'classPct' ? ' xr-th-sort--active' : ''}`}
                  onClick={() => handleSort('classPct')}
                  title="Percent of all students who answer this question correctly"
                >
                  Class % {sortIcon('classPct')}
                </button>
              </th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row) => {
              const peer = peerFor(row);
              return (
                <tr key={row.uid}>
                  <td className="xr-td-num">{String(row.number).padStart(2, '0')}</td>
                  <td>
                    {showAnswers ? (
                      <span className="xr-ans xr-ans--key">{row.keyDisplay}</span>
                    ) : (
                      <span className="xr-ans--hidden">Hidden</span>
                    )}
                  </td>
                  <td>
                    {row.status === 'correct' && (
                      <span className="xr-ans xr-ans--correct">
                        <FiCheck aria-hidden="true" /> {row.userDisplay}
                      </span>
                    )}
                    {row.status === 'incorrect' && (
                      <span className="xr-ans xr-ans--incorrect">
                        <FiX aria-hidden="true" /> {row.userDisplay}
                      </span>
                    )}
                    {row.status === 'omitted' && (
                      <span className="xr-ans xr-ans--omitted">Omitted</span>
                    )}
                  </td>
                  <td className="xr-td-section">
                    <b>{row.timeSec !== null ? formatPeerSeconds(row.timeSec) : '—'}</b>
                    {peer && peer.avgTimeSec !== null && (
                      <span>class {formatPeerSeconds(peer.avgTimeSec)}</span>
                    )}
                  </td>
                  <td className="xr-td-num">
                    {peer && typeof peer.pctCorrect === 'number' ? `${peer.pctCorrect}%` : '—'}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button type="button" className="xr-review-btn" onClick={() => openReview(row)}>
                      Review <FiArrowRight aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ═══════════ review modal ═══════════ */}
      {reviewRow && (
        <div
          className="xrm-scrim"
          onMouseDown={(e) => e.target === e.currentTarget && closeReview()}
        >
          <div className="xrm" role="dialog" aria-modal="true" aria-label="Question review">
            <WordSaver
              selector=".xrm-pane--question"
              source="quiz-review"
              metadata={{ quizId }}
              showDefinition
            />

            <header className="xrm-head">
              <div className="xrm-head__main">
                <p className="xrm-head__eyebrow">
                  {subcategoryName} · Level {level} ({levelName})
                </p>
                <h2 className="xrm-head__title">Question {reviewRow.number}</h2>
              </div>
              <div className="xrm-head__side">
                <span className="xrm-head__domain">{subcategoryName}</span>
                <button
                  type="button"
                  className="xrm-iconbtn xrm-iconbtn--flag"
                  title="Report this question"
                  onClick={() => {
                    setSelectedQuestionForReport(reviewRow.question);
                    setIsReportModalOpen(true);
                  }}
                >
                  <FiFlag aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="xrm-iconbtn"
                  title="Close"
                  aria-label="Close review"
                  onClick={closeReview}
                >
                  <FiX aria-hidden="true" />
                </button>
              </div>
            </header>

            <div className="xrm-body" ref={modalBodyRef}>
              {/* ── question pane (same order as the quiz runner) ── */}
              <section className="xrm-pane xrm-pane--question">
                <p className="xrm-qlabel">Question {reviewRow.number}</p>

                {reviewRow.question.graphUrl && (
                  <div className="xrm-graph">
                    <img
                      src={reviewRow.question.graphUrl}
                      alt={reviewRow.question.graphDescription || 'Question figure'}
                    />
                  </div>
                )}

                {!reviewRow.question.graphUrl && reviewRow.question.graphDescription && (
                  <div className="xrm-graphdesc">
                    <b>Figure description</b>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: getSafeMarkup(reviewRow.question.graphDescription),
                      }}
                    />
                  </div>
                )}

                {reviewRow.question.passage && String(reviewRow.question.passage).trim() && (
                  <div
                    className="xrm-passage"
                    dangerouslySetInnerHTML={{ __html: getSafeMarkup(reviewRow.question.passage) }}
                  />
                )}

                <div
                  className="xrm-qtext"
                  dangerouslySetInnerHTML={{ __html: getSafeMarkup(reviewRow.question.text) }}
                />

                {reviewRow.multipleChoice && (
                  <ol className="xrm-choices">
                    {reviewRow.question.options.map((optionText, optionIndex) => {
                      const isKey = showAnswers && optionIndex === reviewRow.keyIndex;
                      const isPickedWrong =
                        showAnswers &&
                        optionIndex === reviewRow.userIndex &&
                        optionIndex !== reviewRow.keyIndex;
                      const isPicked = optionIndex === reviewRow.userIndex;
                      let className = 'xrm-choice';
                      if (isKey) className += ' xrm-choice--key';
                      if (isPickedWrong) className += ' xrm-choice--picked-wrong';
                      return (
                        // eslint-disable-next-line react/no-array-index-key
                        <li key={optionIndex} className={className}>
                          {isKey && (
                            <span className="xrm-choice__tag">
                              {isPicked ? 'Your answer' : 'Correct answer'}
                            </span>
                          )}
                          {isPickedWrong && <span className="xrm-choice__tag">Your answer</span>}
                          <span className="xrm-choice__letter">{letterFor(optionIndex)}</span>
                          <span
                            className="xrm-choice__text"
                            dangerouslySetInnerHTML={{ __html: getSafeMarkup(optionText) }}
                          />
                          {isKey && (
                            <span className="xrm-choice__mark">
                              <FiCheck aria-hidden="true" />
                            </span>
                          )}
                          {isPickedWrong && (
                            <span className="xrm-choice__mark">
                              <FiX aria-hidden="true" />
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ol>
                )}
              </section>

              {/* ── answer pane ── */}
              <section className="xrm-pane xrm-pane--answer">
                <p className="xrm-alabel">Answer</p>

                {showAnswers ? (
                  <>
                    {reviewRow.status === 'correct' && (
                      <div className="xrm-banner xrm-banner--correct">
                        <FiCheckCircle aria-hidden="true" />
                        <span>You answered {reviewRow.userDisplay} — correct.</span>
                      </div>
                    )}
                    {reviewRow.status === 'incorrect' && (
                      <div className="xrm-banner xrm-banner--incorrect">
                        <FiXCircle aria-hidden="true" />
                        <span>
                          You answered {reviewRow.userDisplay}. The correct answer is{' '}
                          {reviewRow.keyDisplay}.
                        </span>
                      </div>
                    )}
                    {reviewRow.status === 'omitted' && (
                      <div className="xrm-banner xrm-banner--omitted">
                        <FiAlertCircle aria-hidden="true" />
                        <span>
                          You omitted this question. The correct answer is {reviewRow.keyDisplay}.
                        </span>
                      </div>
                    )}

                    {/* quiet peer-stats line (UWorld-style restraint) */}
                    {(() => {
                      const peer = peerFor(reviewRow);
                      if (!peer) return null;
                      return (
                        <p className="xq-peerline">
                          <FiUsers aria-hidden="true" />
                          <span>{peer.pctCorrect}% of students answer this correctly</span>
                          {reviewRow.timeSec !== null && peer.avgTimeSec !== null && (
                            <span>
                              · your time {formatPeerSeconds(reviewRow.timeSec)} · class{' '}
                              {formatPeerSeconds(peer.avgTimeSec)}
                            </span>
                          )}
                        </p>
                      );
                    })()}

                    {!reviewRow.multipleChoice && (
                      <div className="xrm-answers">
                        <div
                          className={`xrm-answers__row ${
                            reviewRow.status === 'correct'
                              ? 'xrm-answers__row--good'
                              : reviewRow.status === 'incorrect'
                                ? 'xrm-answers__row--bad'
                                : ''
                          }`}
                        >
                          <b>Your answer</b>
                          <span>{reviewRow.userDisplay ?? '—'}</span>
                        </div>
                        <div className="xrm-answers__row xrm-answers__row--good">
                          <b>Correct answer</b>
                          <span>{reviewRow.keyDisplay}</span>
                        </div>
                        {Array.isArray(reviewRow.question.acceptedAnswers) &&
                          reviewRow.question.acceptedAnswers.length > 0 && (
                            <div className="xrm-answers__row xrm-answers__row--accepted">
                              <b>Also accepted</b>
                              <span>{reviewRow.question.acceptedAnswers.join(', ')}</span>
                            </div>
                          )}
                      </div>
                    )}

                    <div className="xrm-rationale">
                      <h3 className="xrm-rationale__title">Rationale</h3>
                      {hasStructuredExplanation(reviewRow.question) ? (
                        /* Rich structured explanation → the shared card
                           (rule, walkthrough, rebuttals, things to remember) */
                        <ExplanationCard
                          question={reviewRow.question}
                          selectedOption={
                            reviewRow.omitted
                              ? null
                              : userAnswers[reviewRow.question.id]?.selectedOption ?? null
                          }
                          isCorrect={reviewRow.omitted ? null : reviewRow.status === 'correct'}
                          omitted={reviewRow.omitted}
                          compact
                        />
                      ) : (
                        /* Legacy flat explanation → parsed verdict blocks */
                        <div className="xrm-rat">
                          {parseRationale(
                            reviewRow.question.explanation ||
                              `The correct answer is "${reviewRow.keyDisplay}". ${
                                reviewRow.question.reasoning || ''
                              }`
                          ).blocks.map((block, blockIndex) => {
                            if (block.kind === 'choice') {
                              return (
                                <div
                                  // eslint-disable-next-line react/no-array-index-key
                                  key={blockIndex}
                                  className={`xrm-rat__choice xrm-rat__choice--${block.verdict}`}
                                >
                                  <span className="xrm-rat__mark">
                                    {block.verdict === 'correct' ? (
                                      <FiCheck aria-hidden="true" />
                                    ) : (
                                      <FiX aria-hidden="true" />
                                    )}
                                  </span>
                                  <div
                                    className="xrm-rat__text"
                                    dangerouslySetInnerHTML={{ __html: rationaleBlockHtml(block) }}
                                  />
                                </div>
                              );
                            }
                            if (block.kind === 'note') {
                              return (
                                <div
                                  // eslint-disable-next-line react/no-array-index-key
                                  key={blockIndex}
                                  className="xrm-rat__note"
                                  dangerouslySetInnerHTML={{ __html: getSafeMarkup(block.text) }}
                                />
                              );
                            }
                            return (
                              <div
                                // eslint-disable-next-line react/no-array-index-key
                                key={blockIndex}
                                className="xrm-rat__p"
                                dangerouslySetInnerHTML={{ __html: rationaleBlockHtml(block) }}
                              />
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {lessonSubcategoryId && (
                      <Link className="xrm-study" to={`/learn/${lessonSubcategoryId}`}>
                        <FiBookOpen aria-hidden="true" />
                        Study this skill: {subcategoryName}
                      </Link>
                    )}
                  </>
                ) : (
                  <div className="xrm-hidden">
                    <FiLock aria-hidden="true" />
                    <b>Answer hidden</b>
                    Try the question again on your own, then turn on “Show correct answer and
                    explanation” below to reveal the key and rationale.
                  </div>
                )}
              </section>
            </div>

            <footer className="xrm-foot">
              <label className="xrm-check">
                <input
                  type="checkbox"
                  checked={showAnswers}
                  onChange={(e) => setShowAnswers(e.target.checked)}
                />
                <span className="xrm-check__box">
                  <FiCheck aria-hidden="true" />
                </span>
                Show correct answer and explanation
              </label>
              <div className="xrm-foot__nav">
                <span className="xrm-foot__count">
                  Question {reviewIndex + 1} of {sortedRows.length}
                </span>
                <button
                  type="button"
                  className="ut-btn ut-btn--ghost"
                  disabled={reviewIndex === 0}
                  onClick={() => stepReview(-1)}
                >
                  Previous
                </button>
                <button
                  type="button"
                  className="ut-btn ut-btn--primary"
                  disabled={reviewIndex >= sortedRows.length - 1}
                  onClick={() => stepReview(1)}
                >
                  Next
                </button>
              </div>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
