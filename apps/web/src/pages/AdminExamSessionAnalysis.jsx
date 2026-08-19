/**
 * AdminExamSessionAnalysis — "who missed what" for a group exam sitting.
 *
 * Built for the tutoring workflow where several students take the same
 * practice test at the same time and the teacher then walks through the
 * missed questions one by one:
 *
 *   1. Pick which exam (or "any exam") and how far back to look.
 *   2. Click Analyze — completed sittings inside the window are fetched
 *      (via the questionAttempts mirror; see firebase/examSessionServices.js)
 *      and grouped per exam.
 *   3. Two views on the selected exam group:
 *        - Missed questions: every question somebody got wrong, sorted by
 *          how many missed it, with the name/email of each student and the
 *          wrong option each of them picked.
 *        - Students: every student with how many and which questions they
 *          missed; chips jump into the question view.
 *
 * Per the requested behavior, unanswered (blank) questions COUNT AS WRONG —
 * they are merged into every "missed" count and list, tagged "no answer" so
 * the teacher still sees the difference.
 *
 * Route: /admin/exam-session-analysis (AdminRoute-gated in App.jsx).
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { useAuth } from '../contexts/AuthContext';
import { fetchExamSessionData } from '../firebase/examSessionServices';
import {
  getAllPracticeExams,
  getPracticeExamModules,
} from '../firebase/practiceExamCatalogServices';
import { resolveMultipleChoiceKey } from '../utils/practiceExamScoring';
import { processTextMarkup } from '../utils/textProcessing';
import { loadKatexAutoRender, containsMathDelimiters } from '../utils/katexLoader';
import '../styles/AdminExamSessionAnalysis.css';

/* ---------------------------------------------------------------- helpers */

const WINDOW_OPTIONS = [
  { value: 1, label: 'Last 1 hour' },
  { value: 2, label: 'Last 2 hours' },
  { value: 3, label: 'Last 3 hours' },
  { value: 6, label: 'Last 6 hours' },
  { value: 12, label: 'Last 12 hours' },
  { value: 24, label: 'Last 24 hours' },
  { value: 72, label: 'Last 3 days' },
  { value: 168, label: 'Last 7 days' },
];

const KATEX_DELIMITERS = [
  { left: '$$', right: '$$', display: true },
  { left: '\\[', right: '\\]', display: true },
  { left: '\\(', right: '\\)', display: false },
  { left: '$', right: '$', display: false },
];

const getSafeMarkup = (value) =>
  DOMPurify.sanitize(processTextMarkup(value) || '');

/** Plain text (no tags) for previews and CSV cells. */
const stripMarkup = (value) => {
  const sanitized = DOMPurify.sanitize(processTextMarkup(value) || '', {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
  return sanitized
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
};

const letterFor = (index) => String.fromCharCode(65 + index);

const isMultipleChoice = (question) => {
  if (question?.questionType) return question.questionType === 'multiple-choice';
  return Array.isArray(question?.options) && question.options.length > 0;
};

/** Letter ("B") for an option-text answer, or null if it isn't an option. */
const answerLetterFor = (question, value) => {
  if (!question || value === null || value === undefined) return null;
  const options = Array.isArray(question.options) ? question.options : [];
  const index = options.findIndex(
    (option) => String(option).trim() === String(value).trim(),
  );
  return index >= 0 ? letterFor(index) : null;
};

/** { letter, text } describing the correct answer of a question. */
const correctAnswerFor = (question) => {
  if (!question) return { letter: null, text: '' };
  const storedKey =
    question.correctAnswer !== undefined ? question.correctAnswer : question.answer;
  if (storedKey === undefined || storedKey === null) return { letter: null, text: '' };
  const resolved = resolveMultipleChoiceKey(storedKey, question.options || []);
  return {
    letter: answerLetterFor(question, resolved),
    text: resolved === null || resolved === undefined ? '' : String(resolved),
  };
};

const formatWhen = (ms) => {
  if (!ms) return '—';
  const date = new Date(ms);
  const today = new Date();
  const sameDay =
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();
  const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return sameDay
    ? time
    : `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })} ${time}`;
};

const percent = (part, whole) =>
  whole > 0 ? Math.round((part / whole) * 100) : 0;

/* ------------------------------------------------------- analysis builders */

/**
 * Group sessions per exam, keeping only the LATEST sitting per student
 * within each exam (a retake inside the window replaces the earlier one).
 */
const buildExamGroups = (sessions, catalogTitleById) => {
  const byExam = new Map();

  sessions.forEach((session) => {
    const examKey = session.practiceExamId || `untracked|${session.examTitle}`;
    if (!byExam.has(examKey)) {
      byExam.set(examKey, {
        examKey,
        practiceExamId: session.practiceExamId,
        title:
          (session.practiceExamId && catalogTitleById[session.practiceExamId]) ||
          session.examTitle.replace(/\s+-\s+\w{3}\s+\d{1,2},\s+\d{4}$/, ''),
        isDiagnostic: session.isDiagnostic,
        sessions: [],
      });
    }
    byExam.get(examKey).sessions.push(session);
  });

  const groups = [...byExam.values()].map((group) => {
    const latestByUser = new Map();
    group.sessions.forEach((session) => {
      const existing = latestByUser.get(session.userId);
      if (!existing || session.completedAtMs > existing.completedAtMs) {
        latestByUser.set(session.userId, session);
      }
    });
    const roster = [...latestByUser.values()].sort((a, b) =>
      a.studentName.localeCompare(b.studentName),
    );
    return {
      ...group,
      roster,
      duplicateCount: group.sessions.length - roster.length,
      latestCompletionMs: Math.max(...roster.map((s) => s.completedAtMs || 0)),
    };
  });

  groups.sort(
    (a, b) =>
      b.roster.length - a.roster.length ||
      b.latestCompletionMs - a.latestCompletionMs,
  );
  return groups;
};

/**
 * One row per question of the selected exam.
 *
 * Rows are seeded from the exam's catalog definition when available (so
 * questions NOBODY answered still appear), then filled from every roster
 * student's attempts. `missed` = wrong + blank, per the chosen behavior.
 */
const buildQuestionRows = (group, catalogModules) => {
  if (!group) return { allRows: [], missedRows: [] };

  const moduleMetaById = new Map();
  group.roster.forEach((session) => {
    (session.modulesMeta || []).forEach((meta) => {
      if (meta && meta.id && !moduleMetaById.has(meta.id)) {
        moduleMetaById.set(meta.id, meta);
      }
    });
  });
  (catalogModules || []).forEach((module) => {
    if (module && module.id) {
      moduleMetaById.set(module.id, {
        id: module.id,
        title: module.title,
        moduleNumber: module.moduleNumber,
      });
    }
  });

  const rows = new Map();
  const ensureRow = (key) => {
    if (!rows.has(key)) {
      rows.set(key, {
        key,
        question: null,
        moduleId: null,
        moduleIndex: null,
        subcategory: '',
        wrong: [],
        correct: [],
        blank: [],
      });
    }
    return rows.get(key);
  };

  // Seed in canonical order from the exam definition (also fixes ordering).
  (catalogModules || []).forEach((module) => {
    (module.questions || []).forEach((question, index) => {
      const key = question.id || `practice-${module.id}-q-${index}`;
      const row = ensureRow(key);
      if (!row.question) row.question = question;
      row.moduleId = module.id;
      row.moduleIndex = index;
      if (!row.subcategory) row.subcategory = question.subcategory || '';
    });
  });

  group.roster.forEach((session) => {
    session.attempts.forEach((attempt) => {
      const key =
        attempt.questionId ||
        (attempt.moduleId !== undefined && attempt.moduleIndex !== undefined
          ? `practice-${attempt.moduleId}-q-${attempt.moduleIndex}`
          : null);
      if (!key) return;
      const row = ensureRow(key);
      if (!row.question && attempt.question) row.question = attempt.question;
      if (row.moduleId === null && attempt.moduleId !== undefined) {
        row.moduleId = attempt.moduleId;
      }
      if (row.moduleIndex === null && typeof attempt.moduleIndex === 'number') {
        row.moduleIndex = attempt.moduleIndex;
      }
      if (!row.subcategory) {
        row.subcategory =
          attempt.subcategory || attempt.question?.subcategory || '';
      }
      const entry = {
        session,
        userAnswer: attempt.userAnswer,
        isBlank: false,
      };
      if (attempt.isCorrect) row.correct.push(entry);
      else row.wrong.push(entry);
    });
  });

  rows.forEach((row) => {
    const answeredUserIds = new Set(
      [...row.wrong, ...row.correct].map((entry) => entry.session.userId),
    );
    row.blank = group.roster
      .filter((session) => !answeredUserIds.has(session.userId))
      .map((session) => ({ session, userAnswer: null, isBlank: true }));

    // Requested behavior: blank counts as wrong (tagged so it's still visible).
    row.missed = [...row.wrong, ...row.blank];

    const meta = row.moduleId ? moduleMetaById.get(row.moduleId) : null;
    row.moduleNumber = meta?.moduleNumber ?? null;
    row.moduleTitle = meta?.title || '';
    row.label = `M${row.moduleNumber ?? '?'} · Q${
      row.moduleIndex !== null && row.moduleIndex !== undefined
        ? row.moduleIndex + 1
        : '?'
    }`;
    row.sortPos =
      (row.moduleNumber ?? 99) * 1000 +
      (typeof row.moduleIndex === 'number' ? row.moduleIndex : 999);
  });

  const allRows = [...rows.values()].sort((a, b) => a.sortPos - b.sortPos);
  const missedRows = allRows.filter((row) => row.missed.length > 0);
  return { allRows, missedRows };
};

/** One row per student: which questions they missed, sorted in test order. */
const buildStudentRows = (group, allRows) => {
  if (!group) return [];
  return group.roster
    .map((session) => {
      const missed = allRows
        .filter((row) =>
          row.missed.some((entry) => entry.session.userId === session.userId),
        )
        .map((row) => ({
          row,
          entry: row.missed.find(
            (entry) => entry.session.userId === session.userId,
          ),
        }));
      const correctCount = allRows.filter((row) =>
        row.correct.some((entry) => entry.session.userId === session.userId),
      ).length;
      return { session, missed, correctCount };
    })
    .sort(
      (a, b) =>
        b.missed.length - a.missed.length ||
        a.session.studentName.localeCompare(b.session.studentName),
    );
};

/** "B ×3 · D ×1 · no answer ×1" summary of what the missers picked. */
const buildAnswerBreakdown = (row) => {
  const counts = new Map();
  row.wrong.forEach((entry) => {
    const letter = answerLetterFor(row.question, entry.userAnswer);
    const display =
      letter ||
      (entry.userAnswer === null || entry.userAnswer === undefined
        ? '—'
        : `"${String(entry.userAnswer)}"`);
    counts.set(display, (counts.get(display) || 0) + 1);
  });
  const parts = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([display, count]) => `${display} ×${count}`);
  if (row.blank.length > 0) parts.push(`no answer ×${row.blank.length}`);
  return parts.join('  ·  ');
};

const csvCell = (value) => {
  const text = value === null || value === undefined ? '' : String(value);
  return /[",\n;]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

const downloadCsv = (filename, headerRow, rows) => {
  const lines = [headerRow, ...rows].map((row) => row.map(csvCell).join(','));
  const blob = new Blob(['\ufeff', lines.join('\n')], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const describeStudent = (session) =>
  session.studentEmail
    ? `${session.studentName} <${session.studentEmail}>`
    : session.studentName;

/* -------------------------------------------------------------- component */

function AdminExamSessionAnalysis() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Controls
  const [catalogExams, setCatalogExams] = useState([]);
  const [examFilter, setExamFilter] = useState('all');
  const [hoursBack, setHoursBack] = useState(3);

  // Fetch state
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);
  const [data, setData] = useState(null);

  // Exam-definition cache: { [practiceExamId]: {status, modules} }
  const [modulesCache, setModulesCache] = useState({});

  // View state
  const [selectedExamKey, setSelectedExamKey] = useState(null);
  const [activeView, setActiveView] = useState('questions');
  const [questionSort, setQuestionSort] = useState('missed');
  const [expandedQuestions, setExpandedQuestions] = useState(() => new Set());
  const [expandedStudents, setExpandedStudents] = useState(() => new Set());
  const [highlightKey, setHighlightKey] = useState(null);

  const questionRefs = useRef({});
  const resultsRef = useRef(null);

  /* ------------------------------------------------ catalog for dropdown */
  useEffect(() => {
    let isActive = true;
    getAllPracticeExams(false)
      .then((exams) => {
        if (!isActive) return;
        const sorted = [...exams].sort((a, b) =>
          String(a.title || '').localeCompare(String(b.title || '')),
        );
        setCatalogExams(sorted);
      })
      .catch((error) => {
        console.error('[ExamSessionAnalysis] Error loading exam catalog:', error);
      });
    return () => {
      isActive = false;
    };
  }, []);

  const catalogTitleById = useMemo(() => {
    const map = {};
    catalogExams.forEach((exam) => {
      map[exam.id] = exam.title || exam.id;
    });
    return map;
  }, [catalogExams]);

  /* --------------------------------------------------------- analyze run */
  const handleAnalyze = useCallback(async () => {
    setAnalyzing(true);
    setAnalysisError(null);
    setExpandedQuestions(new Set());
    setExpandedStudents(new Set());
    try {
      const fetched = await fetchExamSessionData(hoursBack);
      setData(fetched);
      setSelectedExamKey(null); // auto-selected by the effect below
    } catch (error) {
      console.error('[ExamSessionAnalysis] Analyze failed:', error);
      setAnalysisError(
        error?.message || 'Failed to load exam activity. Check the console.',
      );
      setData(null);
    } finally {
      setAnalyzing(false);
    }
  }, [hoursBack]);

  const allGroups = useMemo(
    () => (data ? buildExamGroups(data.sessions, catalogTitleById) : []),
    [data, catalogTitleById],
  );

  const groups = useMemo(
    () =>
      examFilter === 'all'
        ? allGroups
        : allGroups.filter((group) => group.practiceExamId === examFilter),
    [allGroups, examFilter],
  );

  // Keep a valid selection whenever groups change.
  useEffect(() => {
    if (groups.length === 0) {
      if (selectedExamKey !== null) setSelectedExamKey(null);
      return;
    }
    if (!groups.some((group) => group.examKey === selectedExamKey)) {
      setSelectedExamKey(groups[0].examKey);
    }
  }, [groups, selectedExamKey]);

  const selectedGroup = useMemo(
    () => groups.find((group) => group.examKey === selectedExamKey) || null,
    [groups, selectedExamKey],
  );

  /* ------------------------------- lazy-load the exam's full question list */
  useEffect(() => {
    const practiceExamId = selectedGroup?.practiceExamId;
    if (!practiceExamId || modulesCache[practiceExamId]) return;
    setModulesCache((previous) => ({
      ...previous,
      [practiceExamId]: { status: 'loading', modules: null },
    }));
    getPracticeExamModules(practiceExamId)
      .then((modules) => {
        setModulesCache((previous) => ({
          ...previous,
          [practiceExamId]: { status: 'ready', modules },
        }));
      })
      .catch((error) => {
        console.error(
          '[ExamSessionAnalysis] Error loading exam definition:',
          error,
        );
        setModulesCache((previous) => ({
          ...previous,
          [practiceExamId]: { status: 'error', modules: null },
        }));
      });
  }, [selectedGroup, modulesCache]);

  const modulesEntry = selectedGroup?.practiceExamId
    ? modulesCache[selectedGroup.practiceExamId]
    : null;

  /* ------------------------------------------------------ derived analysis */
  const questionAnalysis = useMemo(
    () => buildQuestionRows(selectedGroup, modulesEntry?.modules || null),
    [selectedGroup, modulesEntry],
  );

  const sortedMissedRows = useMemo(() => {
    const rows = [...questionAnalysis.missedRows];
    if (questionSort === 'missed') {
      rows.sort((a, b) => b.missed.length - a.missed.length || a.sortPos - b.sortPos);
    } else {
      rows.sort((a, b) => a.sortPos - b.sortPos);
    }
    return rows;
  }, [questionAnalysis, questionSort]);

  const studentRows = useMemo(
    () => buildStudentRows(selectedGroup, questionAnalysis.allRows),
    [selectedGroup, questionAnalysis],
  );

  const summary = useMemo(() => {
    if (!selectedGroup) return null;
    const rosterSize = selectedGroup.roster.length;
    const totalQuestions = questionAnalysis.allRows.length;
    const missedCount = questionAnalysis.missedRows.length;
    const hardest = [...questionAnalysis.missedRows].sort(
      (a, b) => b.missed.length - a.missed.length || a.sortPos - b.sortPos,
    )[0];
    const averageCorrect =
      rosterSize > 0
        ? Math.round(
            selectedGroup.roster.reduce(
              (sum, session) => sum + (session.correctAnswers || 0),
              0,
            ) / rosterSize,
          )
        : 0;
    return { rosterSize, totalQuestions, missedCount, hardest, averageCorrect };
  }, [selectedGroup, questionAnalysis]);

  /* -------------------------------------------- KaTeX for expanded content */
  useEffect(() => {
    const container = resultsRef.current;
    if (!container) return;
    if (!containsMathDelimiters(container.textContent || '')) return;
    loadKatexAutoRender()
      .then((renderMathInElement) => {
        if (!resultsRef.current) return;
        try {
          renderMathInElement(resultsRef.current, {
            delimiters: KATEX_DELIMITERS,
            throwOnError: false,
          });
        } catch (error) {
          // Malformed TeX — readable source text stays visible.
        }
      })
      .catch(() => {
        // CDN unavailable — equations degrade to readable TeX text.
      });
  }, [questionAnalysis, activeView, expandedQuestions, expandedStudents, sortedMissedRows]);

  /* ------------------------------------------------------------- actions */
  const toggleQuestion = (key) => {
    setExpandedQuestions((previous) => {
      const next = new Set(previous);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleStudent = (userId) => {
    setExpandedStudents((previous) => {
      const next = new Set(previous);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const jumpToQuestion = (key) => {
    setActiveView('questions');
    setExpandedQuestions((previous) => new Set(previous).add(key));
    setHighlightKey(key);
    window.setTimeout(() => {
      questionRefs.current[key]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }, 80);
    window.setTimeout(() => setHighlightKey(null), 2500);
  };

  const exportQuestionsCsv = () => {
    if (!selectedGroup) return;
    downloadCsv(
      'missed-questions.csv',
      [
        'Question',
        'Skill',
        'Missed',
        'Students in session',
        'Missed by',
        'Correct answer',
        'Question text',
      ],
      sortedMissedRows.map((row) => {
        const correct = correctAnswerFor(row.question);
        return [
          row.label,
          row.subcategory,
          row.missed.length,
          selectedGroup.roster.length,
          row.missed
            .map(
              (entry) =>
                `${describeStudent(entry.session)}${entry.isBlank ? ' [no answer]' : ''}`,
            )
            .join('; '),
          correct.letter
            ? `${correct.letter} — ${stripMarkup(correct.text)}`
            : stripMarkup(correct.text),
          stripMarkup(row.question?.text || ''),
        ];
      }),
    );
  };

  const exportStudentsCsv = () => {
    if (!selectedGroup) return;
    downloadCsv(
      'students.csv',
      [
        'Student',
        'Email',
        'Missed',
        'Correct',
        'Reading & Writing',
        'Math',
        'Overall %',
        'Missed questions',
      ],
      studentRows.map(({ session, missed, correctCount }) => [
        session.studentName,
        session.studentEmail,
        missed.length,
        correctCount,
        session.scores?.readingWriting ?? '',
        session.scores?.math ?? '',
        session.overallScore ?? '',
        missed
          .map(
            ({ row, entry }) => `${row.label}${entry.isBlank ? ' (no answer)' : ''}`,
          )
          .join('; '),
      ]),
    );
  };

  /* ------------------------------------------------------------- renders */

  const renderStudentChip = (entry, rowKey) => (
    <span
      key={`${rowKey}-${entry.session.userId}`}
      className={`esa-chip ${entry.isBlank ? 'esa-chip-blank' : 'esa-chip-wrong'}`}
      title={entry.session.studentEmail || entry.session.studentName}
    >
      {entry.session.studentName}
      {entry.session.studentEmail ? (
        <span className="esa-chip-email"> · {entry.session.studentEmail}</span>
      ) : null}
      {entry.isBlank ? <span className="esa-chip-tag">no answer</span> : null}
    </span>
  );

  const renderQuestionDetail = (row) => {
    const question = row.question;
    if (!question) {
      return (
        <div className="esa-qdetail">
          <p className="esa-muted">
            Question content isn&apos;t available for this item (it may have been
            deleted from the question bank). The response data above is still
            accurate.
          </p>
        </div>
      );
    }
    const correct = correctAnswerFor(question);
    const multipleChoice = isMultipleChoice(question);
    return (
      <div className="esa-qdetail">
        {question.graphUrl && (
          <div className="esa-qgraph">
            <img src={question.graphUrl} alt="Question figure" />
          </div>
        )}
        {!question.graphUrl && question.graphDescription && (
          <div
            className="esa-qpassage"
            dangerouslySetInnerHTML={{
              __html: getSafeMarkup(question.graphDescription),
            }}
          />
        )}
        {question.passage && (
          <div
            className="esa-qpassage"
            dangerouslySetInnerHTML={{ __html: getSafeMarkup(question.passage) }}
          />
        )}
        <div
          className="esa-qtext"
          dangerouslySetInnerHTML={{ __html: getSafeMarkup(question.text) }}
        />

        {multipleChoice ? (
          <ul className="esa-options">
            {(question.options || []).map((optionText, optionIndex) => {
              const letter = letterFor(optionIndex);
              const isCorrectOption =
                correct.letter === letter ||
                (!correct.letter &&
                  String(optionText).trim() === correct.text.trim());
              const pickers = row.wrong.filter(
                (entry) =>
                  String(entry.userAnswer).trim() === String(optionText).trim(),
              );
              return (
                <li
                  key={letter}
                  className={`esa-option ${isCorrectOption ? 'esa-option-correct' : ''} ${
                    pickers.length > 0 ? 'esa-option-picked' : ''
                  }`}
                >
                  <span className="esa-option-letter">{letter}</span>
                  <span
                    className="esa-option-text"
                    dangerouslySetInnerHTML={{ __html: getSafeMarkup(optionText) }}
                  />
                  <span className="esa-option-meta">
                    {isCorrectOption && (
                      <span className="esa-option-badge">Correct answer</span>
                    )}
                    {pickers.length > 0 && (
                      <span className="esa-option-pickers">
                        {pickers.map((entry) => (
                          <span
                            key={entry.session.userId}
                            className="esa-chip esa-chip-wrong esa-chip-small"
                            title={entry.session.studentEmail}
                          >
                            {entry.session.studentName}
                          </span>
                        ))}
                      </span>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="esa-gridin">
            <div className="esa-gridin-correct">
              Correct answer: <strong>{stripMarkup(correct.text) || '—'}</strong>
              {Array.isArray(question.acceptedAnswers) &&
                question.acceptedAnswers.length > 0 && (
                  <span className="esa-muted">
                    {' '}
                    (also accepted: {question.acceptedAnswers.join(', ')})
                  </span>
                )}
            </div>
            {row.wrong.length > 0 && (
              <ul className="esa-gridin-answers">
                {row.wrong.map((entry) => (
                  <li key={entry.session.userId}>
                    <span className="esa-chip esa-chip-wrong esa-chip-small">
                      {entry.session.studentName}
                    </span>{' '}
                    answered <strong>{String(entry.userAnswer)}</strong>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {row.blank.length > 0 && (
          <div className="esa-blankline">
            Left blank by:{' '}
            {row.blank.map((entry) => renderStudentChip(entry, `${row.key}-b`))}
          </div>
        )}
        {row.correct.length > 0 && (
          <div className="esa-correctline">
            Answered correctly by:{' '}
            {row.correct.map((entry) => (
              <span
                key={entry.session.userId}
                className="esa-chip esa-chip-correct"
                title={entry.session.studentEmail}
              >
                {entry.session.studentName}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderQuestionsView = () => {
    if (!selectedGroup) return null;
    if (sortedMissedRows.length === 0) {
      return (
        <div className="esa-empty">
          <h3>No missed questions 🎉</h3>
          <p>
            Every student in this session answered every recorded question
            correctly.
          </p>
        </div>
      );
    }
    return (
      <>
        <div className="esa-view-toolbar">
          <div className="esa-sort-toggle">
            <span>Sort:</span>
            <button
              type="button"
              className={questionSort === 'missed' ? 'active' : ''}
              onClick={() => setQuestionSort('missed')}
            >
              Most missed
            </button>
            <button
              type="button"
              className={questionSort === 'order' ? 'active' : ''}
              onClick={() => setQuestionSort('order')}
            >
              Test order
            </button>
          </div>
          <button type="button" className="esa-export" onClick={exportQuestionsCsv}>
            Export CSV
          </button>
        </div>

        <div className="esa-qlist">
          {sortedMissedRows.map((row) => {
            const expanded = expandedQuestions.has(row.key);
            const missPercent = percent(
              row.missed.length,
              selectedGroup.roster.length,
            );
            const preview = stripMarkup(row.question?.text || '');
            return (
              <div
                key={row.key}
                ref={(node) => {
                  questionRefs.current[row.key] = node;
                }}
                className={`esa-qrow ${expanded ? 'esa-qrow-open' : ''} ${
                  highlightKey === row.key ? 'esa-qrow-flash' : ''
                }`}
              >
                <button
                  type="button"
                  className="esa-qrow-head"
                  onClick={() => toggleQuestion(row.key)}
                >
                  <span className="esa-qlabel">{row.label}</span>
                  <span className="esa-misscount">
                    {row.missed.length} of {selectedGroup.roster.length} missed
                  </span>
                  <span className="esa-missbar" aria-hidden="true">
                    <span
                      className="esa-missbar-fill"
                      style={{ width: `${missPercent}%` }}
                    />
                  </span>
                  {row.subcategory && (
                    <span className="esa-qsub">{row.subcategory}</span>
                  )}
                  <span className="esa-qpreview">
                    {preview
                      ? `${preview.slice(0, 110)}${preview.length > 110 ? '…' : ''}`
                      : '(question text unavailable)'}
                  </span>
                  <span className="esa-chevron">{expanded ? '▴' : '▾'}</span>
                </button>

                <div className="esa-qrow-students">
                  <span className="esa-qrow-students-label">Missed by:</span>
                  {row.missed.map((entry) => renderStudentChip(entry, row.key))}
                </div>
                {row.wrong.length > 0 && (
                  <div className="esa-breakdown">
                    Answers picked: {buildAnswerBreakdown(row)}
                  </div>
                )}

                {expanded && renderQuestionDetail(row)}
              </div>
            );
          })}
        </div>
      </>
    );
  };

  const renderStudentsView = () => {
    if (!selectedGroup) return null;
    return (
      <>
        <div className="esa-view-toolbar">
          <span className="esa-muted">
            Sorted by most missed. Click a question chip to open it in the
            Missed questions view.
          </span>
          <button type="button" className="esa-export" onClick={exportStudentsCsv}>
            Export CSV
          </button>
        </div>
        <div className="esa-slist">
          {studentRows.map(({ session, missed, correctCount }) => {
            const expanded = expandedStudents.has(session.userId);
            return (
              <div
                key={session.userId}
                className={`esa-srow ${expanded ? 'esa-srow-open' : ''}`}
              >
                <button
                  type="button"
                  className="esa-srow-head"
                  onClick={() => toggleStudent(session.userId)}
                >
                  <span className="esa-sname">{session.studentName}</span>
                  <span className="esa-semail">{session.studentEmail}</span>
                  <span className="esa-sscores">
                    {session.scores
                      ? `RW ${session.scores.readingWriting ?? '—'} · Math ${
                          session.scores.math ?? '—'
                        }`
                      : ''}
                    {session.overallScore !== null
                      ? ` · ${session.overallScore}%`
                      : ''}
                  </span>
                  <span className="esa-scounts">
                    <span className="esa-scount-missed">{missed.length} missed</span>
                    <span className="esa-scount-correct">
                      {correctCount} correct
                    </span>
                  </span>
                  <span className="esa-chevron">{expanded ? '▴' : '▾'}</span>
                </button>

                <div className="esa-srow-chips">
                  {missed.length === 0 ? (
                    <span className="esa-muted">No missed questions 🎉</span>
                  ) : (
                    missed.map(({ row, entry }) => (
                      <button
                        key={`${session.userId}-${row.key}`}
                        type="button"
                        className={`esa-chip esa-chip-link ${
                          entry.isBlank ? 'esa-chip-blank' : 'esa-chip-wrong'
                        }`}
                        onClick={() => jumpToQuestion(row.key)}
                        title="Open this question"
                      >
                        {row.label}
                        {entry.isBlank ? (
                          <span className="esa-chip-tag">no answer</span>
                        ) : null}
                      </button>
                    ))
                  )}
                </div>

                {expanded && missed.length > 0 && (
                  <table className="esa-stable">
                    <thead>
                      <tr>
                        <th>Question</th>
                        <th>Skill</th>
                        <th>Their answer</th>
                        <th>Correct answer</th>
                      </tr>
                    </thead>
                    <tbody>
                      {missed.map(({ row, entry }) => {
                        const correct = correctAnswerFor(row.question);
                        const theirLetter = answerLetterFor(
                          row.question,
                          entry.userAnswer,
                        );
                        return (
                          <tr key={`${session.userId}-t-${row.key}`}>
                            <td>
                              <button
                                type="button"
                                className="esa-linklike"
                                onClick={() => jumpToQuestion(row.key)}
                              >
                                {row.label}
                              </button>
                            </td>
                            <td>{row.subcategory || '—'}</td>
                            <td className="esa-cell-wrong">
                              {entry.isBlank
                                ? 'No answer'
                                : theirLetter ||
                                  stripMarkup(String(entry.userAnswer))}
                            </td>
                            <td className="esa-cell-correct">
                              {correct.letter ||
                                stripMarkup(correct.text) ||
                                '—'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            );
          })}
        </div>
      </>
    );
  };

  const renderNotices = () => {
    if (!data || !selectedGroup) return null;
    const notices = [];
    if (selectedGroup.duplicateCount > 0) {
      notices.push(
        `${selectedGroup.duplicateCount} earlier retake(s) inside the window were ignored — only each student's latest sitting is analyzed.`,
      );
    }
    if (selectedGroup.practiceExamId && modulesEntry?.status === 'error') {
      notices.push(
        "Couldn't load this exam's full question list — questions that nobody answered may be missing, and question order may be approximate.",
      );
    }
    if (!selectedGroup.practiceExamId) {
      notices.push(
        'This sitting has no linked exam definition — analysis is based only on recorded responses.',
      );
    }
    if (data.orphanedGroups > 0) {
      notices.push(
        `${data.orphanedGroups} sitting(s) in the window were skipped because their result document was deleted.`,
      );
    }
    if (data.truncated) {
      notices.push(
        'There was more activity than could be fetched at once — narrow the time window for complete results.',
      );
    }
    if (notices.length === 0) return null;
    return (
      <div className="esa-notices">
        {notices.map((notice) => (
          <div key={notice} className="esa-notice">
            {notice}
          </div>
        ))}
      </div>
    );
  };

  /* --------------------------------------------------------------- page */
  return (
    <div className="admin-page esa-page">
      <header className="admin-page-header">
        <div className="header-left">
          <button
            type="button"
            className="back-button"
            onClick={() => navigate('/admin')}
          >
            ← Admin Dashboard
          </button>
        </div>
        <h1>Exam Session Analysis</h1>
        <div className="header-right">
          <span className="user-info">{currentUser?.email}</span>
        </div>
      </header>

      <div className="admin-page-content">
        <div className="page-description">
          <p>
            See how a group of students did on the same practice test. Pick the
            test and a time window, then Analyze: you&apos;ll get every missed
            question with who missed it (and what they picked), plus a
            per-student breakdown. Unanswered questions count as missed and are
            tagged “no answer”. Only tests <strong>finished</strong> inside the
            window appear.
          </p>
        </div>

        {/* Controls */}
        <div className="esa-controls">
          <label className="esa-control">
            <span>Practice test</span>
            <select
              value={examFilter}
              onChange={(event) => setExamFilter(event.target.value)}
            >
              <option value="all">Any test taken in the window</option>
              {catalogExams.map((exam) => (
                <option key={exam.id} value={exam.id}>
                  {exam.title || exam.id}
                </option>
              ))}
            </select>
          </label>
          <label className="esa-control">
            <span>Completed within</span>
            <select
              value={hoursBack}
              onChange={(event) => setHoursBack(Number(event.target.value))}
            >
              {WINDOW_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className="esa-analyze"
            onClick={handleAnalyze}
            disabled={analyzing}
          >
            {analyzing ? 'Analyzing…' : data ? 'Re-analyze' : 'Analyze'}
          </button>
          {data && !analyzing && (
            <span className="esa-lastrun">
              Updated {formatWhen(data.fetchedAtMs)}
            </span>
          )}
        </div>

        {analysisError && <div className="esa-error">{analysisError}</div>}

        {analyzing && (
          <div className="esa-loading">Fetching exam activity…</div>
        )}

        {/* Results */}
        {data && !analyzing && (
          <div ref={resultsRef}>
            {groups.length === 0 ? (
              <div className="esa-empty">
                <h3>No completed tests found</h3>
                <p>
                  {examFilter === 'all'
                    ? `No student finished a practice test in the selected window.`
                    : `No student finished “${
                        catalogTitleById[examFilter] || 'this test'
                      }” in the selected window.`}{' '}
                  Results appear only after a student submits the whole exam —
                  if they&apos;re still working, wait for them to finish and
                  re-analyze.
                </p>
              </div>
            ) : (
              <>
                {/* Exam group cards */}
                <div className="esa-groups">
                  {groups.map((group) => (
                    <button
                      key={group.examKey}
                      type="button"
                      className={`esa-groupcard ${
                        group.examKey === selectedExamKey ? 'active' : ''
                      }`}
                      onClick={() => setSelectedExamKey(group.examKey)}
                    >
                      <span className="esa-groupcard-title">
                        {group.title}
                        {group.isDiagnostic ? ' (diagnostic)' : ''}
                      </span>
                      <span className="esa-groupcard-meta">
                        {group.roster.length} student
                        {group.roster.length === 1 ? '' : 's'} · latest{' '}
                        {formatWhen(group.latestCompletionMs)}
                      </span>
                    </button>
                  ))}
                </div>

                {selectedGroup && (
                  <div className="esa-panel">
                    {renderNotices()}

                    {/* Summary stats */}
                    {summary && (
                      <div className="esa-stats">
                        <div className="esa-stat">
                          <span className="esa-stat-value">
                            {summary.rosterSize}
                          </span>
                          <span className="esa-stat-label">Students</span>
                        </div>
                        <div className="esa-stat">
                          <span className="esa-stat-value">
                            {summary.missedCount}
                          </span>
                          <span className="esa-stat-label">
                            Questions missed
                            {summary.totalQuestions
                              ? ` (of ${summary.totalQuestions})`
                              : ''}
                          </span>
                        </div>
                        <div className="esa-stat">
                          <span className="esa-stat-value">
                            {summary.averageCorrect}
                          </span>
                          <span className="esa-stat-label">Avg. correct</span>
                        </div>
                        <div className="esa-stat">
                          <span className="esa-stat-value">
                            {summary.hardest ? summary.hardest.label : '—'}
                          </span>
                          <span className="esa-stat-label">
                            Hardest question
                            {summary.hardest
                              ? ` (${summary.hardest.missed.length} missed)`
                              : ''}
                          </span>
                        </div>
                      </div>
                    )}

                    {modulesEntry?.status === 'loading' && (
                      <div className="esa-loading esa-loading-slim">
                        Loading the exam&apos;s full question list…
                      </div>
                    )}

                    {/* View tabs */}
                    <div className="esa-tabs">
                      <button
                        type="button"
                        className={activeView === 'questions' ? 'active' : ''}
                        onClick={() => setActiveView('questions')}
                      >
                        Missed questions ({questionAnalysis.missedRows.length})
                      </button>
                      <button
                        type="button"
                        className={activeView === 'students' ? 'active' : ''}
                        onClick={() => setActiveView('students')}
                      >
                        Students ({selectedGroup.roster.length})
                      </button>
                    </div>

                    {activeView === 'questions'
                      ? renderQuestionsView()
                      : renderStudentsView()}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {!data && !analyzing && !analysisError && (
          <div className="esa-empty esa-empty-initial">
            <h3>Ready when you are</h3>
            <p>
              Have your students take the same practice test, then choose it
              above (or leave “Any test”), pick how far back to look, and click
              Analyze.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminExamSessionAnalysis;
