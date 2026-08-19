/* ExamResults — "Score Details" (V3 redesign).
 *
 * College-Board-style score report in the app's design language:
 *   - ink hero: total + section scores
 *   - section tabs (All / Reading & Writing / Math)
 *   - Knowledge & Skills: correctness across the 8 content domains
 *   - Questions Overview: stat tiles + sortable, paginated question table
 *     with a "Show correct answers" toggle (answers hidden by default so
 *     students can re-attempt before peeking)
 *   - fullscreen review modal: question left (serif, choice verdicts),
 *     answer banner + rationale right, Previous/Next navigation,
 *     "Study this skill" lesson cross-link, report-question flag
 *
 * Data contract is unchanged: getExamResultById / getLatestExamResult /
 * localStorage fallback, canonical scoring via utils/scoring.js, stored
 * scores preferred so this page never disagrees with the exam list.
 * Styles live in styles/Results.css (.xr- page / .xrm- modal).
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import DOMPurify from 'dompurify';
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom';
import {
  FiAlertCircle,
  FiArrowDown,
  FiArrowRight,
  FiArrowUp,
  FiBookOpen,
  FiCheck,
  FiCheckCircle,
  FiChevronDown,
  FiFlag,
  FiLock,
  FiX,
  FiXCircle,
} from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { useCoach } from '../contexts/CoachContext';
import { examScores } from '../utils/scoring';
import { processTextMarkup } from '../utils/textProcessing';
import { resolveMultipleChoiceKey } from '../utils/practiceExamScoring';
import {
  findResponseForQuestion,
  sortResponsesIntoQuestionOrder,
} from '../utils/examResponseMatching';
import { DOMAINS, SUBCATEGORIES, getSubcategoryMeta } from '../utils/subcategoryTaxonomy';
import { parseRationale } from '../utils/rationale';
import { loadKatexAutoRender, containsMathDelimiters } from '../utils/katexLoader';
import ReportQuestionModal from '../components/ReportQuestionModal';
import WordSaver from '../components/WordSaver';
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

const SECTION_LABELS = {
  'reading-writing': 'Reading & Writing',
  math: 'Math',
};

const STATUS_RANK = { incorrect: 0, omitted: 1, correct: 2 };

const getSafeMarkup = (value) => DOMPurify.sanitize(processTextMarkup(value) || '');

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

const isMultipleChoice = (question) => {
  if (question?.questionType) return question.questionType === 'multiple-choice';
  return Array.isArray(question?.options) && question.options.length > 0;
};

/** Firestore Timestamp | ISO string | Date -> "Aug 12, 2026" (or null). */
const formatExamDate = (value) => {
  if (!value) return null;
  let date = null;
  if (typeof value?.toDate === 'function') date = value.toDate();
  else if (value instanceof Date) date = value;
  else if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) date = parsed;
  }
  if (!date) return null;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

/** Ordered domain lists per section, from the canonical taxonomy. */
const DOMAIN_GROUPS = (() => {
  const groups = { 'reading-writing': [], math: [] };
  Object.entries(DOMAINS).forEach(([id, domain]) => {
    if (groups[domain.section]) groups[domain.section].push({ id, name: domain.name });
  });
  return groups;
})();

/** Ordered subcategory (skill) lists per domain. */
const DOMAIN_SKILLS = (() => {
  const map = {};
  SUBCATEGORIES.forEach((sub) => {
    if (!map[sub.domain]) map[sub.domain] = [];
    map[sub.domain].push({ id: sub.id, name: sub.name });
  });
  return map;
})();

const accuracyTier = (pct) => (pct < 50 ? 'weak' : pct < 75 ? 'moderate' : 'strong');

/** Windowed pager model: [1, '…', 4, 5, 6, '…', 12] */
const buildPageItems = (totalPages, page) => {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const items = [1];
  if (page > 3) items.push('…');
  for (let p = Math.max(2, page - 1); p <= Math.min(totalPages - 1, page + 1); p += 1) items.push(p);
  if (page < totalPages - 2) items.push('…');
  items.push(totalPages);
  return items;
};

/* ------------------------------------------------------------- component */

function ExamResults() {
  const navigate = useNavigate();
  const location = useLocation();
  const { examId } = useParams();
  const { currentUser, getExamResultById, getLatestExamResult } = useAuth();
  const coach = useCoach();

  const [examDetails, setExamDetails] = useState(null);
  const [moduleData, setModuleData] = useState([]);
  const [readingWritingScore, setReadingWritingScore] = useState(0);
  const [mathScore, setMathScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState(null);

  const [activeTab, setActiveTab] = useState('all');
  const [openDomains, setOpenDomains] = useState(() => new Set());
  const [showAnswers, setShowAnswers] = useState(false);
  const [sort, setSort] = useState({ key: 'number', dir: 1 });
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [reviewIndex, setReviewIndex] = useState(null);

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [selectedQuestionForReport, setSelectedQuestionForReport] = useState(null);

  const modalBodyRef = useRef(null);

  /* ---------------------------------------------------------- data load */

  const processModuleData = useCallback((modules, responses) => {
    if (!modules || modules.length === 0) return [];
    const byId = {};
    modules.forEach((module) => {
      byId[module.id] = { ...module, responses: [] };
    });
    responses.forEach((response) => {
      if (response.moduleId && byId[response.moduleId]) {
        byId[response.moduleId].responses.push(response);
      }
    });
    // Firestore returns the responses subcollection in document-id order —
    // effectively random relative to question order. Restore question order
    // so response matching stays deterministic (utils/examResponseMatching).
    Object.values(byId).forEach((module) => {
      sortResponsesIntoQuestionOrder(module.responses);
    });
    // A partial sitting saves no responses for modules the student never sat —
    // rendering those as empty groups would imply they were taken and bombed.
    // Fallback guard: if NOTHING matched (legacy results whose responses carry
    // no moduleId), keep every module rather than rendering a blank page.
    const groups = Object.values(byId);
    const answered = groups.filter((g) => g.responses.length > 0);
    const visible = answered.length > 0 ? answered : groups;

    // Reading & Writing modules first, then Math, each by module number.
    return visible.sort((a, b) => {
      const aIsRW = a.moduleNumber <= 2;
      const bIsRW = b.moduleNumber <= 2;
      if (aIsRW !== bIsRW) return aIsRW ? -1 : 1;
      return a.moduleNumber - b.moduleNumber;
    });
  }, []);

  // ONE scoring implementation (utils/scoring.js). Prefer the scores the exam
  // was SAVED with; recompute only for legacy results without stored scores.
  const calculateScores = useCallback((modules, storedScores) => {
    if (storedScores && (storedScores.readingWriting || storedScores.math)) {
      // null is meaningful here: the section had no attempted module. Keep it
      // distinct from a legacy 0/undefined, which still floors to 200.
      return {
        rw: storedScores.readingWriting === null ? null : storedScores.readingWriting || 200,
        m: storedScores.math === null ? null : storedScores.math || 200,
      };
    }
    const scores = examScores(modules.flatMap((mod) => mod.responses || []));
    return { rw: scores.readingWriting, m: scores.math };
  }, []);

  const processAndSetExamData = useCallback(
    (data) => {
      if (!data || !data.modules || !data.responses) {
        setPageError('Failed to process exam data because it was incomplete.');
        setIsLoading(false);
        return;
      }

      const processed = processModuleData(data.modules, data.responses);
      setModuleData(processed);

      const { rw, m } = calculateScores(processed, data.scores || data.examSummary?.scores);
      setReadingWritingScore(rw);
      setMathScore(m);

      setExamDetails({
        title: data.examTitle || data.exam?.title || 'Practice Exam',
        isDiagnostic: Boolean(data.isDiagnostic || data.exam?.isDiagnostic),
        dateLabel: formatExamDate(data.completedAt || data.examDate || data.exam?.completedAt),
        isPartial: Boolean(data.isPartial),
        attemptedModuleCount: data.attemptedModuleCount ?? null,
        totalModuleCount: data.totalModuleCount ?? null,
      });
    },
    [calculateScores, processModuleData]
  );

  useEffect(() => {
    setIsLoading(true);
    setPageError(null);

    const fetchExamData = async () => {
      try {
        let examData;

        if (examId) {
          examData = await getExamResultById(examId, true);
          if (!examData) {
            setPageError('Exam result not found.');
            setIsLoading(false);
            return;
          }
        } else if (location?.state?.examId) {
          examData = await getExamResultById(location.state.examId, true);
        }

        if (!examData && currentUser) {
          examData = await getLatestExamResult();
        }

        if (!examData) {
          const responsesFromStorage = JSON.parse(localStorage.getItem('examResponses') || '[]');
          const modulesFromStorage = JSON.parse(localStorage.getItem('examModules') || '[]');
          if (responsesFromStorage.length > 0 && modulesFromStorage.length > 0) {
            examData = {
              responses: responsesFromStorage,
              modules: modulesFromStorage,
              completedAt: new Date(),
            };
          }
        }

        if (examData) {
          processAndSetExamData(examData);
          window.scrollTo(0, 0);
          // AI Coach (Phase 2): exam-completed boundary — the Observer decides
          // whether to speak; the note lands in the coach panel with a badge.
          //
          // Never for a result the student hid from the coach. Its activity is
          // already filtered out of the coach's context, so waking the Observer
          // here would only spend quota to write a note about a sitting the
          // student explicitly asked it to ignore.
          if (coach?.observe && !examData.excludedFromCoach) {
            coach.observe('exam_completed', examId || null);
          }
        } else {
          setPageError('No exam data found to display.');
        }
      } catch (error) {
        console.error('Error loading exam data:', error);
        setPageError('An error occurred while loading exam data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchExamData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examId, location, currentUser, getExamResultById, getLatestExamResult, processAndSetExamData]);

  /* ------------------------------------------------------- derived rows */

  const rows = useMemo(() => {
    // `number` restarts at 1 inside each module (matching the numbering the
    // student saw during the exam); `order` is the global exam order used for
    // sorting so modules never interleave.
    let order = 0;
    const result = [];
    moduleData.forEach((module) => {
      const sectionId = module.moduleNumber <= 2 ? 'reading-writing' : 'math';
      const moduleLabel = `Module ${((module.moduleNumber - 1) % 2) + 1}`;
      (module.questions || []).forEach((question, questionIndex) => {
        if (!question || !question.text) return;
        order += 1;
        const response = findResponseForQuestion(module, question, questionIndex);
        // A blank recorded answer is an omission, not a wrong answer — some
        // legacy controllers stored '' for questions left unanswered.
        const rawAnswer = response?.userAnswer;
        const hasAnswer =
          response != null && rawAnswer != null && String(rawAnswer).trim() !== '';
        const status = !hasAnswer ? 'omitted' : response.isCorrect ? 'correct' : 'incorrect';
        // First candidate the canonical taxonomy recognizes wins (any format).
        const subMeta = [
          question.subcategoryId,
          question.subcategory,
          response?.subcategoryId,
          response?.subcategory,
        ].reduce((acc, candidate) => acc || getSubcategoryMeta(candidate), null);

        const multipleChoice = isMultipleChoice(question);
        const options = multipleChoice ? question.options : null;
        const keyText = multipleChoice
          ? resolveMultipleChoiceKey(question.correctAnswer ?? question.answer, options)
          : question.correctAnswer ?? question.answer;
        const keyIndex = multipleChoice ? options.findIndex((opt) => opt === keyText) : -1;
        // Exact option-text match first (answers are stored as option text).
        // Legacy letter/index-stored answers resolve through the same
        // canonical resolver used for keys — but only AFTER the exact-text
        // check, so literal numeric option text ("2") is never re-read as an
        // index.
        let userIndex = -1;
        if (multipleChoice && hasAnswer) {
          userIndex = options.findIndex((opt) => opt === rawAnswer);
          if (userIndex === -1) {
            const resolvedUserAnswer = resolveMultipleChoiceKey(rawAnswer, options);
            if (resolvedUserAnswer !== rawAnswer) {
              userIndex = options.findIndex((opt) => opt === resolvedUserAnswer);
            }
          }
        }

        result.push({
          uid: `${module.id}-${question.id || questionIndex}`,
          number: questionIndex + 1,
          order,
          sectionId,
          sectionLabel: SECTION_LABELS[sectionId],
          moduleLabel,
          domainId: subMeta?.domain || null,
          domainName: subMeta?.domainName || null,
          skillId: subMeta?.id || null,
          skillName: subMeta?.name || null,
          question,
          response,
          status,
          multipleChoice,
          keyIndex,
          keyDisplay: multipleChoice
            ? keyIndex >= 0
              ? letterFor(keyIndex)
              : String(keyText ?? '—')
            : String(keyText ?? '—'),
          userIndex,
          userDisplay: hasAnswer
            ? multipleChoice && userIndex >= 0
              ? letterFor(userIndex)
              : clampText(rawAnswer)
            : null,
        });
      });
    });
    return result;
  }, [moduleData]);

  const counts = useMemo(() => {
    const c = {
      all: rows.length,
      'reading-writing': 0,
      math: 0,
      correct: 0,
      incorrect: 0,
      omitted: 0,
    };
    rows.forEach((row) => {
      c[row.sectionId] += 1;
      c[row.status] += 1;
    });
    return c;
  }, [rows]);

  const domainStats = useMemo(() => {
    const stats = {};
    rows.forEach((row) => {
      if (!row.domainId) return;
      if (!stats[row.domainId]) stats[row.domainId] = { correct: 0, total: 0 };
      stats[row.domainId].total += 1;
      if (row.status === 'correct') stats[row.domainId].correct += 1;
    });
    return stats;
  }, [rows]);

  const skillStats = useMemo(() => {
    const stats = {};
    rows.forEach((row) => {
      if (!row.skillId) return;
      if (!stats[row.skillId]) stats[row.skillId] = { correct: 0, total: 0 };
      stats[row.skillId].total += 1;
      if (row.status === 'correct') stats[row.skillId].correct += 1;
    });
    return stats;
  }, [rows]);

  const toggleDomain = (domainId) => {
    setOpenDomains((prev) => {
      const next = new Set(prev);
      if (next.has(domainId)) next.delete(domainId);
      else next.add(domainId);
      return next;
    });
  };

  const sortedRows = useMemo(() => {
    const filtered = activeTab === 'all' ? rows : rows.filter((row) => row.sectionId === activeTab);
    const sorted = [...filtered];
    sorted.sort((a, b) => {
      let cmp = 0;
      if (sort.key === 'number') {
        cmp = a.order - b.order;
      } else if (sort.key === 'domain') {
        cmp = (a.domainName || '\uffff').localeCompare(b.domainName || '\uffff');
        if (cmp === 0) cmp = a.order - b.order;
      } else if (sort.key === 'status') {
        cmp = STATUS_RANK[a.status] - STATUS_RANK[b.status];
        if (cmp === 0) cmp = a.order - b.order;
      }
      return cmp * sort.dir;
    });
    return sorted;
  }, [rows, activeTab, sort]);

  const totalPages = pageSize === 'all' ? 1 : Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedRows = useMemo(
    () =>
      pageSize === 'all'
        ? sortedRows
        : sortedRows.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [sortedRows, currentPage, pageSize]
  );

  const reviewRow = reviewIndex !== null ? sortedRows[reviewIndex] : null;

  /* ------------------------------------------------------------- events */

  const handleSort = (key) => {
    setSort((prev) => (prev.key === key ? { key, dir: -prev.dir } : { key, dir: 1 }));
    setPage(1);
  };

  const handleTab = (tab) => {
    setActiveTab(tab);
    setPage(1);
    setReviewIndex(null);
  };

  const handlePageSize = (size) => {
    setPageSize(size);
    setPage(1);
  };

  const openReview = (row) => {
    const index = sortedRows.findIndex((r) => r.uid === row.uid);
    if (index >= 0) setReviewIndex(index);
  };

  const closeReview = useCallback(() => setReviewIndex(null), []);

  const stepReview = useCallback(
    (delta) => {
      setReviewIndex((prev) => {
        if (prev === null) return prev;
        const next = prev + delta;
        if (next < 0 || next >= sortedRows.length) return prev;
        return next;
      });
    },
    [sortedRows.length]
  );

  const handleReportQuestion = async (reason) => {
    if (!selectedQuestionForReport) return;
    setReportLoading(true);
    try {
      await reportQuestion(selectedQuestionForReport.id, examId, reason);
      toast.success('Question reported successfully. Thank you for your feedback!');
      setIsReportModalOpen(false);
      setSelectedQuestionForReport(null);
    } catch (error) {
      console.error('Error reporting question:', error);
      toast.error(error.message || 'Failed to report question. Please try again.');
    } finally {
      setReportLoading(false);
    }
  };

  /* -- modal: keyboard nav + scroll lock -- */
  useEffect(() => {
    if (reviewIndex === null) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') closeReview();
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
  }, [reviewIndex, closeReview, stepReview]);

  /* -- modal: KaTeX auto-render (lazy CDN load, only when math is present) -- */
  useEffect(() => {
    if (!reviewRow || !modalBodyRef.current) return;
    const { question } = reviewRow;
    const haystack = [
      question.text,
      question.passage,
      question.explanation,
      question.reasoning,
      question.graphDescription,
      ...(question.options || []),
    ]
      .filter(Boolean)
      .join(' ');
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

  if (isLoading) {
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
          <div className="ut-skeleton ut-skeleton--row" />
        </div>
      </div>
    );
  }

  if (pageError) {
    return (
      <div className="error-container">
        <p>{pageError}</p>
        <button onClick={() => navigate('/progress')}>Go Home</button>
      </div>
    );
  }

  // Sections the student never sat carry a null score. They contribute neither
  // points nor 800 to the denominator — a one-module sitting reads "620 / 800",
  // not "620 / 1600", which would look like a catastrophic full test.
  const sectionScores = [
    { label: 'Reading & Writing', score: readingWritingScore },
    { label: 'Math', score: mathScore },
  ];
  const attemptedSections = sectionScores.filter((s) => typeof s.score === 'number');
  const totalScore = attemptedSections.reduce((sum, s) => sum + s.score, 0);
  const totalScoreMax = attemptedSections.length > 0 ? attemptedSections.length * 800 : 1600;

  // Rationale, split into verdict blocks at render time (content untouched —
  // the parser only decides where to cut; unrecognized voices fall back to
  // one well-set paragraph). See utils/rationale.js.
  const rationaleBlocks = reviewRow
    ? parseRationale(
        reviewRow.question.explanation ||
          `The correct answer is "${reviewRow.keyDisplay}". ${reviewRow.question.reasoning || ''}`
      ).blocks
    : [];

  const heroChips = [
    examDetails?.dateLabel,
    counts.all > 0 ? `${counts.all} questions` : null,
    examDetails?.isPartial
      ? `Partial · ${examDetails.attemptedModuleCount ?? '?'} of ${
          examDetails.totalModuleCount ?? '?'
        } modules attempted`
      : null,
  ].filter(Boolean);

  const tabs = [
    { id: 'all', label: 'All Questions', count: counts.all },
    { id: 'reading-writing', label: 'Reading & Writing', count: counts['reading-writing'] },
    { id: 'math', label: 'Math', count: counts.math },
  ];

  const visibleGroups =
    activeTab === 'all' ? ['reading-writing', 'math'] : [activeTab];

  const sortIcon = (key) =>
    sort.key === key ? (
      sort.dir === 1 ? (
        <FiArrowUp aria-hidden="true" />
      ) : (
        <FiArrowDown aria-hidden="true" />
      )
    ) : null;

  return (
    <div className="xr">
      <ReportQuestionModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onReport={handleReportQuestion}
        loading={reportLoading}
      />

      {/* ── page head ── */}
      <header className="xr-head">
        <div className="xr-head-main">
          <span className="ut-eyebrow">Results</span>
          <h1 className="ut-page-title">Score Details</h1>
          <p className="ut-page-sub">
            {examDetails?.title ? `${examDetails.title} · ` : ''}
            question-by-question review of every module.
          </p>
        </div>
        <div className="xr-head-actions">
          <button
            type="button"
            className="ut-btn ut-btn--ghost ut-btn--sm"
            onClick={() => navigate('/all-results')}
          >
            All exam results
          </button>
          <button
            type="button"
            className="ut-btn ut-btn--ghost ut-btn--sm"
            onClick={() => navigate('/progress')}
          >
            Back to home
          </button>
        </div>
      </header>

      {/* ── score hero ── */}
      <section className="xr-hero" aria-label="Scores">
        <div>
          <p className="xr-hero__label">Total Score</p>
          <p className="xr-hero__score">
            {totalScore}
            <small>/ {totalScoreMax}</small>
          </p>
          {(heroChips.length > 0 || examDetails?.isDiagnostic) && (
            <div className="xr-hero__chips">
              {examDetails?.isDiagnostic && <span className="xr-hero__chip">Diagnostic Test</span>}
              {heroChips.map((chip) => (
                <span key={chip} className="xr-hero__chip">
                  {chip}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="xr-hero__sections">
          {sectionScores.map(({ label, score }) => {
            const attempted = typeof score === 'number';
            return (
              <div key={label} className="xr-hero__section">
                <span className="xr-hero__section-name">{label}</span>
                <span className="xr-hero__section-score">
                  {attempted ? (
                    <>
                      {score} <small>/ 800</small>
                    </>
                  ) : (
                    <small>Not attempted</small>
                  )}
                </span>
                <div className="xr-hero__bar">
                  <div
                    className="xr-hero__bar-fill"
                    style={{
                      width: attempted
                        ? `${Math.max(0, Math.min(100, ((score - 200) / 600) * 100))}%`
                        : '0%',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── section tabs ── */}
      <nav className="xr-tabs" aria-label="Filter by section">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`xr-tab${activeTab === tab.id ? ' xr-tab--active' : ''}`}
            onClick={() => handleTab(tab.id)}
          >
            {tab.label} <span className="xr-tab__count">{tab.count}</span>
          </button>
        ))}
      </nav>

      {rows.length === 0 ? (
        <div className="xr-empty">
          <b>Question review isn't available for this exam</b>
          The question data for this attempt is missing, so the module-by-module review can't be
          shown. Your section scores above are still saved.
        </div>
      ) : (
        <>
          {/* ── knowledge & skills ── */}
          <div className="xr-section-head">
            <h2 className="xr-section-title">Knowledge &amp; Skills</h2>
          </div>
          <p className="xr-section-sub">
            Your performance across the content domains measured on the SAT.
          </p>

          {visibleGroups.map((sectionId) => (
            <div key={sectionId} className="xr-skills-group">
              <div className="xr-skills-group__name">{SECTION_LABELS[sectionId]}</div>
              <div className="xr-domains">
                {DOMAIN_GROUPS[sectionId].map((domain) => {
                  const stat = domainStats[domain.id];
                  if (!stat || stat.total === 0) {
                    return (
                      <div key={domain.id} className="xr-domain xr-domain--empty">
                        <div className="xr-domain__top">
                          <h3 className="xr-domain__name">{domain.name}</h3>
                          <span className="xr-domain__pct">—</span>
                        </div>
                        <p className="xr-domain__meta">No questions in this exam</p>
                        <div className="xr-segbar">
                          {Array.from({ length: 8 }, (_, i) => (
                            <span key={i} className="xr-segbar__seg" />
                          ))}
                        </div>
                      </div>
                    );
                  }
                  const pct = Math.round((stat.correct / stat.total) * 100);
                  const tier = accuracyTier(pct);
                  const litSegments = Math.round((pct / 100) * 8);
                  const isOpen = openDomains.has(domain.id);
                  const skills = DOMAIN_SKILLS[domain.id] || [];
                  return (
                    <div
                      key={domain.id}
                      className={`xr-domain xr-domain--expandable${isOpen ? ' xr-domain--open' : ''}`}
                    >
                      <button
                        type="button"
                        className="xr-domain__toggle"
                        aria-expanded={isOpen}
                        onClick={() => toggleDomain(domain.id)}
                      >
                        <div className="xr-domain__top">
                          <h3 className="xr-domain__name">{domain.name}</h3>
                          <span className="xr-domain__pct">
                            {pct}%
                            <FiChevronDown className="xr-domain__chev" aria-hidden="true" />
                          </span>
                        </div>
                        <p className="xr-domain__meta">
                          {stat.correct} of {stat.total} correct
                        </p>
                        <div className={`xr-segbar xr-segbar--${tier}`}>
                          {Array.from({ length: 8 }, (_, i) => (
                            <span
                              key={i}
                              className={`xr-segbar__seg${i < litSegments ? ' xr-segbar__seg--on' : ''}`}
                            />
                          ))}
                        </div>
                      </button>

                      {isOpen && (
                        <div className="xr-domain__skills">
                          {skills.map((skill) => {
                            const sStat = skillStats[skill.id];
                            if (!sStat || sStat.total === 0) {
                              return (
                                <div key={skill.id} className="xr-skill xr-skill--empty">
                                  <div className="xr-skill__head">
                                    <span className="xr-skill__name">{skill.name}</span>
                                    <span className="xr-skill__stat">No questions</span>
                                  </div>
                                </div>
                              );
                            }
                            const sPct = Math.round((sStat.correct / sStat.total) * 100);
                            const sTier = accuracyTier(sPct);
                            return (
                              <div key={skill.id} className="xr-skill">
                                <div className="xr-skill__head">
                                  <Link
                                    className="xr-skill__name xr-skill__name--link"
                                    to={`/learn/${skill.id}`}
                                    title={`Study ${skill.name}`}
                                  >
                                    {skill.name}
                                  </Link>
                                  <span className="xr-skill__stat">
                                    {sStat.correct}/{sStat.total}
                                    <b>{sPct}%</b>
                                  </span>
                                </div>
                                <div className="xr-skill__bar">
                                  <div
                                    className={`xr-skill__fill xr-skill__fill--${sTier}`}
                                    style={{ width: `${Math.max(sPct, 4)}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* ── questions overview ── */}
          <div className="xr-section-head">
            <h2 className="xr-section-title">Questions Overview</h2>
          </div>
          <p className="xr-section-sub">Review your result for each question from this exam.</p>

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
            <div className="xr-view">
              <span className="xr-view__label">View</span>
              {[10, 30, 'all'].map((size) => (
                <button
                  key={size}
                  type="button"
                  className={`xr-view__opt${pageSize === size ? ' xr-view__opt--active' : ''}`}
                  onClick={() => handlePageSize(size)}
                >
                  {size === 'all' ? 'All' : size}
                </button>
              ))}
            </div>
          </div>

          {/* ── table ── */}
          {sortedRows.length === 0 ? (
            <div className="xr-empty">
              <b>No questions in this section</b>
              This exam has no {activeTab === 'math' ? 'Math' : 'Reading & Writing'} questions to
              review.
            </div>
          ) : (
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
                  <th>Section</th>
                  <th>
                    <button
                      type="button"
                      className={`xr-th-sort${sort.key === 'domain' ? ' xr-th-sort--active' : ''}`}
                      onClick={() => handleSort('domain')}
                    >
                      Domain {sortIcon('domain')}
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
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {pagedRows.map((row) => (
                  <tr key={row.uid}>
                    <td className="xr-td-num">{String(row.number).padStart(2, '0')}</td>
                    <td className="xr-td-section">
                      <b>{row.sectionLabel}</b>
                      <span>{row.moduleLabel}</span>
                    </td>
                    <td className="xr-td-domain">{row.domainName || '—'}</td>
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
                    <td style={{ textAlign: 'right' }}>
                      <button type="button" className="xr-review-btn" onClick={() => openReview(row)}>
                        Review <FiArrowRight aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}

          {/* ── pager ── */}
          {totalPages > 1 && (
            <div className="xr-pager">
              <button
                type="button"
                className="xr-pager__btn"
                disabled={currentPage === 1}
                onClick={() => setPage(currentPage - 1)}
                aria-label="Previous page"
              >
                ‹
              </button>
              {buildPageItems(totalPages, currentPage).map((item, index) =>
                item === '…' ? (
                  // eslint-disable-next-line react/no-array-index-key
                  <span key={`gap-${index}`} className="xr-pager__gap">
                    …
                  </span>
                ) : (
                  <button
                    key={item}
                    type="button"
                    className={`xr-pager__btn${item === currentPage ? ' xr-pager__btn--active' : ''}`}
                    onClick={() => setPage(item)}
                  >
                    {item}
                  </button>
                )
              )}
              <button
                type="button"
                className="xr-pager__btn"
                disabled={currentPage === totalPages}
                onClick={() => setPage(currentPage + 1)}
                aria-label="Next page"
              >
                ›
              </button>
            </div>
          )}
        </>
      )}

      {/* ═══════════ review modal ═══════════ */}
      {reviewRow && (
        <div className="xrm-scrim" onMouseDown={(e) => e.target === e.currentTarget && closeReview()}>
          <div className="xrm" role="dialog" aria-modal="true" aria-label="Question review">
            <WordSaver
              selector=".xrm-pane--question"
              source="exam-review"
              metadata={{ examId }}
              showDefinition
            />

            <header className="xrm-head">
              <div className="xrm-head__main">
                <p className="xrm-head__eyebrow">
                  {examDetails?.title || 'Practice Exam'}
                  {examDetails?.dateLabel ? ` · ${examDetails.dateLabel}` : ''}
                </p>
                <h2 className="xrm-head__title">
                  {reviewRow.sectionLabel} · {reviewRow.moduleLabel} — Question {reviewRow.number}
                </h2>
              </div>
              <div className="xrm-head__side">
                {reviewRow.domainName && (
                  <span className="xrm-head__domain">{reviewRow.domainName}</span>
                )}
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
              {/* ── question pane ──
                  Same content order as the exam itself (components/Question.jsx):
                  figure → passage → stem → choices. graphDescription is the
                  figure's alt text when an image exists and is shown as a
                  described-figure box only when there is no image. Legacy
                  questions that store passage+stem combined in `text` render
                  unchanged through the stem slot. */}
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
                      <div className="xrm-rat">
                        {rationaleBlocks.map((block, blockIndex) => {
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
                    </div>

                    {reviewRow.skillId && reviewRow.skillName && (
                      <Link className="xrm-study" to={`/learn/${reviewRow.skillId}`}>
                        <FiBookOpen aria-hidden="true" />
                        Study this skill: {reviewRow.skillName}
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

export default ExamResults;
