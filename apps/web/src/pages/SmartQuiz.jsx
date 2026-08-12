// pages/SmartQuiz.jsx — Khan-Academy-style focused runner (redesign v1).
//
// Layout: dark top bar → single centered column (skill title, passage, prompt,
// hairline option rows) → fixed footer (Previous | progress dots | Skip/Check).
// After "Check", options become verdict boxes with per-choice notes, a quiet
// peer-stats line renders, and a bottom-right popover offers the full
// explanation (ExplanationCard).
//
// Removed from the UI in this redesign (backend/services intentionally kept):
//   - AI coach panel / assistant modal / mobile AI bar / AI mode toggle
//     (apps/api assistant endpoints + api/assistantClient.js are untouched)
//   - vocab/concept side panel (api/helperClient.js untouched; planned to
//     return in a later pass in a lighter form)
//   - the 1–5 confidence scale (the `confidence` field was consumed nowhere)
//
// GuestSmartQuiz.jsx still uses the legacy styles/SmartQuiz.css — this page
// now uses styles/SmartQuizRunner.css (all `sqr-*` classes) exclusively.

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import { processTextMarkup } from '../utils/textProcessing';
import { db } from '../firebase/config';
import { recordSmartQuizResult, DIFFICULTY_FOR_LEVEL } from '../utils/smartQuizUtils';
import { getQuestionStats, formatStats, formatPeerSeconds } from '../firebase/questionStatsServices';
import {
  FiArrowLeft,
  FiBookmark,
  FiCheck,
  FiCheckCircle,
  FiChevronDown,
  FiClock,
  FiMinusCircle,
  FiUsers,
  FiX,
  FiXCircle,
} from 'react-icons/fi';
import ExplanationCard from '../components/ExplanationCard';
import MathText from '../components/MathText';
import ReportQuestionModal from '../components/ReportQuestionModal';
import { reportQuestion } from '../api/reportClient';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/SmartQuizRunner.css';

const formatElapsedTime = (seconds = 0) => {
  const safeSeconds = Math.max(0, Number(seconds) || 0);
  const minutes = Math.floor(safeSeconds / 60);
  const remainder = safeSeconds % 60;
  return `${minutes}:${String(remainder).padStart(2, '0')}`;
};

const getQuestionSkill = (question, quiz) => {
  const rawSkill = question?.subcategory || question?.subcategoryId || quiz?.subcategoryId || 'Reading & Writing';
  return String(rawSkill)
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const getChoiceLabel = (index) => String.fromCharCode(65 + index);

// Tutor-mode reveal: resolve the correct option index defensively (numeric,
// option-text, or numeric-string correctAnswer). Mirrors ExplanationCard.
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

// Khan-style per-choice notes: normalize explanationStructured.choiceRebuttals
// (keys may be letters or indices) into { A: '...', B: '...' }.
const getChoiceNotes = (question) => {
  const raw = question?.explanationStructured?.choiceRebuttals;
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const notes = {};
  Object.keys(raw).forEach((key) => {
    const text = raw[key];
    if (typeof text !== 'string' || !text.trim()) return;
    const str = String(key).trim();
    let letter = null;
    if (/^[A-Fa-f]$/.test(str)) letter = str.toUpperCase();
    else if (/^[0-5]$/.test(str)) letter = getChoiceLabel(parseInt(str, 10));
    if (letter) notes[letter] = text.trim();
  });
  return notes;
};

// Seconds allotted per question in timed mode (UWorld-style budget).
const TIMED_SECONDS_PER_QUESTION = 95;

export default function SmartQuiz() {
  const { quizId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Local state
  const [quiz, setQuiz] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const timerRef = useRef(null);

  // User input state for grid-in questions
  const [userInput, setUserInput] = useState('');

  // Report modal state
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [savedStudyPlanItems, setSavedStudyPlanItems] = useState({});
  const [bookmarkSaving, setBookmarkSaving] = useState(false);

  // P1-C tutor/timed session state.
  // checkedQuestions: questionId -> true once the answer is locked (tutor mode).
  const [checkedQuestions, setCheckedQuestions] = useState({});
  // Countdown seconds for timed mode; null until the quiz doc loads (or untimed).
  const [timedRemaining, setTimedRemaining] = useState(null);
  // Mirrors "current question is locked" for the 1s interval (freezes timeSpent).
  const currentLockedRef = useRef(false);
  // Guards the timed-expiry auto-finish so it fires exactly once.
  const timeExpiredRef = useRef(false);

  // Redesign UI state: questionId -> true once the user expands the full
  // explanation / dismisses the feedback popover (so revisits stay quiet).
  const [expandedExplanations, setExpandedExplanations] = useState({});
  const [dismissedPopovers, setDismissedPopovers] = useState({});
  const explainRef = useRef(null);

  // P2-B peer statistics: questionId -> formatStats() output (null when the
  // sample is below MIN_SAMPLE), fetched lazily when a question is first
  // revealed (tutor mode). The ref is the once-per-question guard so a
  // revisit never re-reads Firestore.
  const [peerStats, setPeerStats] = useState({});
  const peerStatsRequestedRef = useRef({});

  // Load quiz document
  useEffect(() => {
    const fetchQuiz = async () => {
      if (!currentUser || !quizId) return;
      const ref = doc(db, 'smartQuizzes', quizId);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        navigate('/progress');
        return;
      }
      const data = snap.data();
      if (data.userId !== currentUser.uid) {
        navigate('/progress');
        return;
      }

      // Fetch questions separately by IDs
      let questionsData = [];
      if (data.questionIds && data.questionIds.length > 0) {
        const questionPromises = data.questionIds.map(async (questionId) => {
          const questionRef = doc(db, 'questions', questionId);
          const questionSnap = await getDoc(questionRef);
          if (questionSnap.exists()) {
            return { id: questionSnap.id, ...questionSnap.data() };
          }
          return null;
        });

        const fetchedQuestions = await Promise.all(questionPromises);
        questionsData = fetchedQuestions.filter(q => q !== null);
      } else if (data.questions) {
        // Fallback for legacy quiz format
        questionsData = data.questions;
      }

      setQuiz({
        id: snap.id,
        ...data,
        questions: questionsData
      });

      // Mark start time (first load counts as quiz start)
      if (!data.startedAt) await updateDoc(ref, { startedAt: serverTimestamp() });
    };
    fetchQuiz();
  }, [currentUser, quizId, navigate]);

  const currentQuestion = quiz?.questions?.[currentIdx];

  // Detect question type based on available options
  const getQuestionType = (question) => {
    if (!question) return 'multiple-choice';
    if (question.questionType) {
      return question.questionType;
    }
    // Smart detection: if no options or empty options array, it's user-input
    if (!question.options || !Array.isArray(question.options) || question.options.length === 0) {
      return 'user-input';
    }
    return 'multiple-choice';
  };

  const handleSelect = (event, optionIdx) => {
    event?.preventDefault();
    event?.stopPropagation();

    // Tutor mode: once checked, the answer is locked.
    if (quiz?.tutorMode !== false && checkedQuestions[currentQuestion?.id]) return;

    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        selectedOption: optionIdx,
        isCorrect: optionIdx === currentQuestion.correctAnswer,
        timeSpent: timerRef.current ?? 0,
      },
    }));
  };

  const handleUserInput = (value) => {
    // Tutor mode: once checked, the answer is locked.
    if (quiz?.tutorMode !== false && checkedQuestions[currentQuestion?.id]) return;

    setUserInput(value);

    // For user input questions, check correctness
    let isCorrect = false;

    if (currentQuestion.correctAnswer !== undefined) {
      // Direct comparison with correct answer
      isCorrect = value === currentQuestion.correctAnswer;

      // Also check against accepted answers if available
      if (!isCorrect && currentQuestion.acceptedAnswers && Array.isArray(currentQuestion.acceptedAnswers)) {
        isCorrect = currentQuestion.acceptedAnswers.includes(value);
      }

      // For number inputs, handle different formats
      if (!isCorrect && (currentQuestion.inputType === 'number' || !currentQuestion.inputType)) {
        const userNum = parseFloat(value);
        const correctNum = parseFloat(currentQuestion.correctAnswer);
        if (!isNaN(userNum) && !isNaN(correctNum)) {
          isCorrect = Math.abs(userNum - correctNum) < 0.0001;
        }

        // Check accepted answers as numbers too
        if (!isCorrect && currentQuestion.acceptedAnswers) {
          isCorrect = currentQuestion.acceptedAnswers.some(accepted => {
            const acceptedNum = parseFloat(accepted);
            return !isNaN(acceptedNum) && Math.abs(userNum - acceptedNum) < 0.0001;
          });
        }
      }
    }

    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        selectedOption: value, // Store the user's input as selectedOption for compatibility
        isCorrect: isCorrect,
        timeSpent: timerRef.current ?? 0,
      },
    }));
  };

  const handleNavigation = (direction) => {
    // Only allow next if an answer is selected for current question
    if (direction === 'next' && !answers[currentQuestion?.id]) {
      return;
    }

    if (direction === 'prev' && currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1);
    } else if (direction === 'next') {
      setCurrentIdx((prev) => prev + 1);
      timerRef.current = 0;
    }
  };

  // ---- P1-C tutor mode / omit flow -----------------------------------------
  // "Response" means a real selection: null/undefined/'' (cleared grid-in) are
  // all no-response — the same predicate SmartQuizResults uses for "Omitted".
  const questionHasResponse = (questionId) => {
    const record = answers[questionId];
    return !!record
      && record.selectedOption !== null
      && record.selectedOption !== undefined
      && record.selectedOption !== '';
  };

  // Canonical omitted answer shape — SmartQuizResults keys off omitted:true and
  // recordSmartQuizResult scores isCorrect:false. Keep the fields in lockstep.
  const buildOmittedAnswer = () => ({
    omitted: true,
    selectedOption: null,
    isCorrect: false,
    timeSpent: timerRef.current ?? 0,
  });

  const advanceToNext = () => {
    setCurrentIdx((prev) => prev + 1);
    timerRef.current = 0;
  };

  // Tutor mode "Check": freeze timeSpent at the lock moment and reveal.
  const handleCheck = () => {
    if (!currentQuestion || checkedQuestions[currentQuestion.id]) return;
    if (!questionHasResponse(currentQuestion.id)) return;
    const frozenTime = timerRef.current ?? 0;
    setAnswers((prev) => {
      const existing = prev[currentQuestion.id];
      if (!existing) return prev;
      return {
        ...prev,
        [currentQuestion.id]: { ...existing, timeSpent: frozenTime },
      };
    });
    setCheckedQuestions((prev) => ({ ...prev, [currentQuestion.id]: true }));
  };

  // Tutor mode "Skip": record the omission, then reveal the explanation
  // (UWorld shows omitted questions' explanations too).
  const handleSkipOmit = () => {
    if (!currentQuestion || checkedQuestions[currentQuestion.id]) return;
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: buildOmittedAnswer() }));
    setCheckedQuestions((prev) => ({ ...prev, [currentQuestion.id]: true }));
  };

  // The single primary control: Check -> Next question (tutor) or Next (classic,
  // where advancing without a selection is a silent omit).
  const handlePrimaryAction = () => {
    if (!currentQuestion) return;
    const tutorActive = quiz?.tutorMode !== false;
    if (tutorActive) {
      if (!checkedQuestions[currentQuestion.id]) {
        handleCheck();
        return;
      }
      advanceToNext();
      return;
    }
    if (!questionHasResponse(currentQuestion.id)) {
      setAnswers((prev) => ({ ...prev, [currentQuestion.id]: buildOmittedAnswer() }));
    }
    advanceToNext();
  };

  // Sync userInput with current question's answer when navigating
  useEffect(() => {
    if (currentQuestion) {
      const questionType = getQuestionType(currentQuestion);
      if (questionType === 'user-input') {
        const existingAnswer = answers[currentQuestion.id];
        setUserInput(existingAnswer?.selectedOption || '');
      } else {
        setUserInput(''); // Clear for multiple choice questions
      }
    }
  }, [currentIdx, currentQuestion, answers]);

  // Per-question stopwatch (ref only — feeds timeSpent; no visible ticking UI
  // in the redesign). Frozen while the current question is locked (tutor mode
  // post-check) so reading the explanation never inflates timeSpent.
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentLockedRef.current) return;
      timerRef.current = (timerRef.current || 0) + 1;
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Keep the lock mirror in sync for the interval above (covers every
  // navigation path, including revisiting an already-checked question).
  useEffect(() => {
    const tutorActive = !!quiz && quiz.tutorMode !== false;
    currentLockedRef.current = tutorActive && !!(currentQuestion && checkedQuestions[currentQuestion.id]);
  }, [quiz, currentQuestion, checkedQuestions]);

  // P2-B: fetch peer stats the first time a question is revealed. Non-blocking
  // (the reveal renders immediately; the line appears when the read resolves)
  // and at most one Firestore read per question per session.
  useEffect(() => {
    const questionId = currentQuestion?.id;
    if (!questionId || !checkedQuestions[questionId]) return;
    if (peerStatsRequestedRef.current[questionId]) return;
    peerStatsRequestedRef.current[questionId] = true;
    getQuestionStats(questionId)
      .then((raw) => {
        setPeerStats((prev) => ({ ...prev, [questionId]: formatStats(raw) }));
      })
      .catch((error) => {
        console.warn('[SmartQuiz] Peer stats unavailable (non-critical):', error?.message);
      });
  }, [checkedQuestions, currentQuestion]);

  const handleFinish = async (finalAnswers = answers) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await recordSmartQuizResult(quizId, finalAnswers);
      navigate(`/smart-quiz-results/${quizId}`, { replace: true });
    } catch (err) {
      console.error(err);
      setSubmitting(false);
    }
  };

  // ---- P1-C timed mode ------------------------------------------------------
  // Total budget = 95s per question; starts once the quiz doc (with questions)
  // has loaded. Untimed quizzes never touch this state.
  useEffect(() => {
    if (!quiz || quiz.timerMode !== 'timed') return;
    const total = (quiz.questions?.length || quiz.questionCount || 0) * TIMED_SECONDS_PER_QUESTION;
    if (total > 0) {
      setTimedRemaining((prev) => (prev === null ? total : prev));
    }
  }, [quiz]);

  // Countdown tick (independent of the per-question timer, which can freeze).
  useEffect(() => {
    if (!quiz || quiz.timerMode !== 'timed') return undefined;
    const interval = setInterval(() => {
      setTimedRemaining((prev) => {
        if (prev === null) return prev;
        return prev > 0 ? prev - 1 : 0;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [quiz]);

  // Expiry: record every unanswered question as omitted, then finish through
  // the normal completion path so results/progress work exactly as usual.
  useEffect(() => {
    if (!quiz || quiz.timerMode !== 'timed') return;
    if (timedRemaining !== 0 || timeExpiredRef.current) return;
    if (!Array.isArray(quiz.questions) || quiz.questions.length === 0) return;
    timeExpiredRef.current = true;

    const merged = { ...answers };
    quiz.questions.forEach((q) => {
      const record = merged[q.id];
      const hasResponse = !!record
        && record.selectedOption !== null
        && record.selectedOption !== undefined
        && record.selectedOption !== '';
      if (!hasResponse) {
        merged[q.id] = {
          omitted: true,
          selectedOption: null,
          isCorrect: false,
          timeSpent: q.id === currentQuestion?.id ? (timerRef.current ?? 0) : (record?.timeSpent ?? 0),
        };
      }
    });

    setAnswers(merged);
    toast.info('Time is up. Submitting your quiz...');
    handleFinish(merged);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quiz, timedRemaining, answers, currentQuestion]);

  // ---- P1-C bookmark hydration ---------------------------------------------
  // One fetch per quiz: which of this quiz's questions are already saved to
  // users/{uid}/studyPlanItems (doc ids are `${quizId}_${questionId}`).
  useEffect(() => {
    if (!currentUser || !quiz || !quizId) return undefined;
    let cancelled = false;
    const loadSavedItems = async () => {
      try {
        const snap = await getDocs(query(
          collection(db, 'users', currentUser.uid, 'studyPlanItems'),
          where('quizId', '==', quizId),
        ));
        if (cancelled) return;
        const saved = {};
        snap.forEach((d) => { saved[d.id] = true; });
        if (Object.keys(saved).length > 0) {
          setSavedStudyPlanItems((prev) => ({ ...prev, ...saved }));
        }
      } catch (error) {
        console.warn('[SmartQuiz] Could not load saved-question bookmarks:', error?.message);
      }
    };
    loadSavedItems();
    return () => { cancelled = true; };
  }, [currentUser, quiz, quizId]);

  // Focus-mode header exit: answers only persist on finish (recordSmartQuizResult),
  // so confirm before leaving mid-quiz instead of dropping progress silently.
  const handleExit = (destination) => {
    if (submitting) return;
    const hasUnsavedProgress = Object.keys(answers).length > 0;
    if (
      hasUnsavedProgress &&
      !window.confirm('Leave this quiz? Your answers from this session will not be saved.')
    ) {
      return;
    }
    navigate(destination);
  };

  if (!quiz) {
    return (
      <div className="sqr-loading">
        <div className="sqr-spinner" aria-hidden="true" />
        <h2>Loading your quiz...</h2>
      </div>
    );
  }

  const loadedQuestionTotal = quiz.questions?.length || quiz.questionCount || 0;

  // Completed?
  if (currentIdx >= loadedQuestionTotal) {
    if (!submitting) {
      handleFinish();
    }
    return (
      <div className="sqr-loading">
        <div className="sqr-spinner" aria-hidden="true" />
        <h2>Calculating your results...</h2>
        <p>Please wait while we process your answers</p>
      </div>
    );
  }

  // Report question handler
  const handleReportQuestion = async (reason) => {
    setReportLoading(true);
    try {
      await reportQuestion(currentQuestion.id, quizId, reason);
      toast.success('Question reported successfully. Thank you for your feedback!');
      setIsReportModalOpen(false);
    } catch (error) {
      console.error('Error reporting question:', error);
      toast.error(error.message || 'Failed to report question. Please try again.');
    } finally {
      setReportLoading(false);
    }
  };

  // Real bookmark toggle. Shares the studyPlanItems collection (and the
  // `${quizId}_${questionId}` doc id) with the coach "Add to study plan"
  // surface, so one saved item is reflected everywhere — no duplicates.
  const handleBookmarkToggle = async () => {
    if (!currentUser) {
      toast.info('Sign in to save questions to your practice list.');
      return;
    }
    if (!currentQuestion || bookmarkSaving) return;

    const itemId = `${quizId}_${currentQuestion.id}`;
    const alreadySaved = !!savedStudyPlanItems[itemId];
    setBookmarkSaving(true);
    try {
      const itemRef = doc(db, 'users', currentUser.uid, 'studyPlanItems', itemId);
      if (alreadySaved) {
        await deleteDoc(itemRef);
        setSavedStudyPlanItems((prev) => {
          const next = { ...prev };
          delete next[itemId];
          return next;
        });
        toast.success('Removed from your practice list.');
      } else {
        const rawText = currentQuestion.text || '';
        await setDoc(itemRef, {
          source: 'bookmark',
          quizId,
          questionId: currentQuestion.id,
          subcategory: currentQuestion.subcategory || quiz?.subcategoryId || '',
          skill: getQuestionSkill(currentQuestion, quiz),
          questionText: rawText.length > 280 ? `${rawText.slice(0, 277)}...` : rawText,
          status: 'active',
          savedAt: serverTimestamp(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }, { merge: true });
        setSavedStudyPlanItems((prev) => ({ ...prev, [itemId]: true }));
        toast.success('Saved to your practice list.');
      }
    } catch (error) {
      console.error('Error toggling question bookmark:', error);
      toast.error('Could not update your practice list. Please try again.');
    } finally {
      setBookmarkSaving(false);
    }
  };

  const questionTotal = loadedQuestionTotal;
  const selectedAnswer = currentQuestion ? answers[currentQuestion.id] : null;
  const difficultyLabel = DIFFICULTY_FOR_LEVEL[quiz.level] || currentQuestion?.difficulty || 'medium';
  const skillLabel = getQuestionSkill(currentQuestion, quiz);
  const studyPlanItemId = currentQuestion ? `${quizId}_${currentQuestion.id}` : '';
  const isSavedToStudyPlan = Boolean(studyPlanItemId && savedStudyPlanItems[studyPlanItemId]);

  // P1-C session config. tutorMode defaults TRUE when absent, so legacy quiz
  // docs get the tutor experience; timerMode defaults 'untimed'.
  const tutorModeActive = quiz.tutorMode !== false;
  const isTimed = quiz.timerMode === 'timed';
  const isCurrentChecked = tutorModeActive && !!(currentQuestion && checkedQuestions[currentQuestion.id]);
  const hasCurrentResponse = currentQuestion ? questionHasResponse(currentQuestion.id) : false;
  const revealCorrectIndex = isCurrentChecked ? resolveCorrectOptionIndex(currentQuestion) : null;
  // P2-B: peer stats render only post-check and only with enough attempts —
  // formatStats() returns null below MIN_SAMPLE, so a small sample renders
  // nothing at all (no "not enough data" placeholder).
  const currentPeerStats = currentQuestion ? peerStats[currentQuestion.id] : null;
  const showPeerStats = isCurrentChecked && !!currentPeerStats;
  const isLastQuestion = currentIdx + 1 >= questionTotal;
  const primaryActionLabel = tutorModeActive
    ? (!isCurrentChecked ? 'Check' : (isLastQuestion ? 'Show summary' : 'Next question'))
    : (isLastQuestion ? 'Show summary' : 'Next');
  const primaryActionDisabled = tutorModeActive && !isCurrentChecked && !hasCurrentResponse;
  const timedTotalSeconds = (quiz.questions?.length || quiz.questionCount || 0) * TIMED_SECONDS_PER_QUESTION;
  const timedLow = isTimed && timedRemaining !== null && timedRemaining < 60;

  // ---- redesign: per-choice notes + explanation visibility -----------------
  const questionIsMC = getQuestionType(currentQuestion) === 'multiple-choice';
  const choiceNotes = questionIsMC ? getChoiceNotes(currentQuestion) : {};
  const ruleText = typeof currentQuestion?.explanationStructured?.rule === 'string'
    ? currentQuestion.explanationStructured.rule.trim()
    : '';
  const correctIndexAlways = questionIsMC ? resolveCorrectOptionIndex(currentQuestion) : null;
  // Any note to show inline under the options? (Rebuttals, or at least the
  // rule under the correct choice.) Without any, the full ExplanationCard
  // renders directly instead of hiding behind a toggle.
  const hasInlineNotes = questionIsMC && (
    Object.keys(choiceNotes).length > 0 || (!!ruleText && correctIndexAlways !== null)
  );
  const currentQuestionId = currentQuestion?.id;
  const isExplanationOpen = isCurrentChecked
    && (!hasInlineNotes || !!expandedExplanations[currentQuestionId]);
  const isPopoverVisible = isCurrentChecked && !dismissedPopovers[currentQuestionId];
  const popoverState = selectedAnswer?.omitted
    ? 'omitted'
    : (selectedAnswer?.isCorrect ? 'correct' : 'incorrect');

  const dismissPopover = () => {
    setDismissedPopovers((prev) => ({ ...prev, [currentQuestionId]: true }));
  };

  const toggleExplanation = () => {
    setExpandedExplanations((prev) => ({ ...prev, [currentQuestionId]: !prev[currentQuestionId] }));
  };

  const handleSeeExplanation = () => {
    setExpandedExplanations((prev) => ({ ...prev, [currentQuestionId]: true }));
    dismissPopover();
    setTimeout(() => {
      explainRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  // Footer progress dots: verdicts only ever show in tutor mode (checked
  // questions); classic mode just marks answered — no correctness leaks.
  const getDotStatus = (question, idx) => {
    const record = answers[question.id];
    if (tutorModeActive && checkedQuestions[question.id]) {
      if (record?.omitted) return 'omitted';
      return record?.isCorrect ? 'correct' : 'incorrect';
    }
    if (idx === currentIdx) return 'current';
    return record ? 'answered' : 'idle';
  };

  if (currentQuestion) {
    return (
      <div className="sqr-root">
        <header className="sqr-top">
          <button className="sqr-brand" onClick={() => handleExit('/dashboard')} title="Back to dashboard">
            <span className="sqr-brand-mark" aria-hidden="true" />
            <span className="sqr-brand-name">SATPractice</span>
          </button>

          <span className="sqr-top-skill">{skillLabel}</span>

          <div className="sqr-top-right">
            {isTimed && (
              <span
                className={`sqr-timer ${timedLow ? 'sqr-timer--low' : ''}`}
                title="Time remaining"
                role="timer"
                aria-live="off"
              >
                <FiClock aria-hidden="true" />
                {formatElapsedTime(timedRemaining ?? timedTotalSeconds)}
              </span>
            )}
            <button className="sqr-exit" onClick={() => handleExit('/subject-quizzes')}>
              Exit
            </button>
          </div>
        </header>

        <main className="sqr-main">
          <div className="sqr-column">
            <h1 className="sqr-skill-title">{skillLabel}</h1>

            <div className="sqr-meta">
              <span className={`sqr-difficulty ${String(difficultyLabel).toLowerCase()}`}>
                {difficultyLabel}
              </span>
              <button
                className={`sqr-bookmark ${isSavedToStudyPlan ? 'is-saved' : ''}`}
                onClick={handleBookmarkToggle}
                disabled={bookmarkSaving}
                aria-pressed={isSavedToStudyPlan}
                title={isSavedToStudyPlan
                  ? 'Saved to your practice list. Click to remove.'
                  : 'Save this question to your practice list'}
              >
                <FiBookmark aria-hidden="true" />
                {isSavedToStudyPlan ? 'Saved' : 'Save'}
              </button>
            </div>

            <hr className="sqr-rule" />

            {currentQuestion.passage && (
              <div
                className="sqr-passage"
                dangerouslySetInnerHTML={{ __html: processTextMarkup(currentQuestion.passage) }}
              />
            )}

            {currentQuestion.graphUrl && (
              <div className="sqr-graph">
                <img src={currentQuestion.graphUrl} alt="Graph for question" />
              </div>
            )}

            <div
              className="sqr-prompt"
              dangerouslySetInnerHTML={{ __html: processTextMarkup(currentQuestion.text) }}
            />

            {questionIsMC ? (
              <>
                <p className="sqr-choose">Choose 1 answer:</p>
                <div className="sqr-options" role="radiogroup" aria-label="Answer choices">
                  {currentQuestion.options.map((opt, idx) => {
                    const letter = getChoiceLabel(idx);
                    const isSelected = selectedAnswer?.selectedOption === idx;
                    const isRevealedCorrect = isCurrentChecked && idx === revealCorrectIndex;
                    const isRevealedWrongPick = isCurrentChecked && isSelected && !isRevealedCorrect;
                    const stateClass = isCurrentChecked
                      ? `is-revealed ${isRevealedCorrect ? 'is-correct' : (isRevealedWrongPick ? 'is-wrong-pick' : 'is-muted')}`
                      : (isSelected ? 'is-selected' : '');
                    // P2-B: "% of students chose this" mini-label, post-check only.
                    const peerPct = showPeerStats && typeof currentPeerStats.optionPcts[idx] === 'number'
                      ? currentPeerStats.optionPcts[idx]
                      : null;
                    // Khan-style: the choice's own explanation, directly under it.
                    const note = isCurrentChecked
                      ? (isRevealedCorrect ? (choiceNotes[letter] || ruleText || null) : (choiceNotes[letter] || null))
                      : null;
                    return (
                      <div key={idx} className={`sqr-option ${stateClass}`}>
                        <button
                          type="button"
                          className="sqr-option-btn"
                          onPointerDown={(event) => event.stopPropagation()}
                          onClick={(event) => handleSelect(event, idx)}
                          disabled={isCurrentChecked}
                          role="radio"
                          aria-checked={isSelected}
                        >
                          <span className="sqr-option-letter">{letter}</span>
                          <span className="sqr-option-text">{opt}</span>
                          {peerPct !== null && (
                            <span
                              className="sqr-option-peer"
                              title={`${peerPct}% of students chose this option`}
                            >
                              {peerPct}%
                            </span>
                          )}
                          {isRevealedCorrect && (
                            <span className="sqr-option-verdict" aria-hidden="true"><FiCheckCircle /></span>
                          )}
                          {isRevealedWrongPick && (
                            <span className="sqr-option-verdict" aria-hidden="true"><FiXCircle /></span>
                          )}
                        </button>
                        {note && (
                          <div className="sqr-option-note">
                            {/* the CSS kicker ("Why it's correct" / "Why it's
                                wrong") labels the note; no inline prefix needed */}
                            <MathText text={note} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="sqr-input-wrap">
                <div className="sqr-input-instructions">
                  {currentQuestion.answerFormat ? currentQuestion.answerFormat : 'Enter your answer in the box below.'}
                </div>
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => handleUserInput(e.target.value)}
                  className={`sqr-input ${isCurrentChecked
                    ? (selectedAnswer?.omitted
                      ? ''
                      : (selectedAnswer?.isCorrect ? 'sqr-input--correct' : 'sqr-input--incorrect'))
                    : ''}`}
                  disabled={isCurrentChecked}
                  placeholder={currentQuestion.inputType === 'number' || !currentQuestion.inputType ? 'Enter a number' : 'Enter your answer'}
                  pattern={currentQuestion.inputType === 'number' || !currentQuestion.inputType ? '[0-9]*[.]?[0-9]*' : undefined}
                />
                {(currentQuestion.inputType === 'number' || !currentQuestion.inputType) && (
                  <div className="sqr-input-hint">
                    You may enter integers, decimals, or fractions. Do not enter spaces or commas.
                  </div>
                )}
              </div>
            )}

            {/* Tutor mode reveal: quiet peer line, then the full explanation —
                inline notes live under each option for quick scanning, and the
                toggled card repeats the rebuttals so "See the full explanation"
                is genuinely complete on its own (product decision, 2026-08). */}
            {isCurrentChecked && (
              <div className="sqr-reveal">
                {showPeerStats && (
                  <div className="sqr-peerline">
                    <FiUsers aria-hidden="true" />
                    <span>{currentPeerStats.pctCorrect}% of students answer this correctly</span>
                    {currentPeerStats.avgTimeSec !== null && (
                      <span className="sqr-peerline-time">
                        {selectedAnswer?.omitted !== true && typeof selectedAnswer?.timeSpent === 'number' ? (
                          <>
                            &middot; your time: {formatPeerSeconds(selectedAnswer.timeSpent)}
                            {' '}&middot; average: {formatPeerSeconds(currentPeerStats.avgTimeSec)}
                          </>
                        ) : (
                          <>&middot; average time: {formatPeerSeconds(currentPeerStats.avgTimeSec)}</>
                        )}
                      </span>
                    )}
                  </div>
                )}

                {hasInlineNotes && (
                  <button
                    type="button"
                    className={`sqr-explain-toggle ${isExplanationOpen ? 'is-open' : ''}`}
                    onClick={toggleExplanation}
                    aria-expanded={isExplanationOpen}
                  >
                    {isExplanationOpen ? 'Hide the full explanation' : 'See the full explanation'}
                    <FiChevronDown aria-hidden="true" />
                  </button>
                )}

                {isExplanationOpen && (
                  <div className="sqr-explain" ref={explainRef}>
                    <ExplanationCard
                      compact
                      hideRebuttals={false}
                      question={currentQuestion}
                      selectedOption={selectedAnswer?.omitted ? null : (selectedAnswer?.selectedOption ?? null)}
                      isCorrect={selectedAnswer?.omitted ? null : !!selectedAnswer?.isCorrect}
                      omitted={selectedAnswer?.omitted === true}
                    />
                  </div>
                )}
              </div>
            )}

            <div className="sqr-under-row">
              <button
                type="button"
                className="sqr-report-link"
                onClick={() => setIsReportModalOpen(true)}
              >
                Report a problem
              </button>
            </div>
          </div>
        </main>

        {/* Khan-style feedback popover, bottom-right above the footer. */}
        {isPopoverVisible && (
          <div className="sqr-popover" role="status">
            <div className="sqr-popover-head">
              <span className={`sqr-popover-icon ${popoverState}`} aria-hidden="true">
                {popoverState === 'correct' && <FiCheck />}
                {popoverState === 'incorrect' && <FiX />}
                {popoverState === 'omitted' && <FiMinusCircle />}
              </span>
              <span className="sqr-popover-title">
                {popoverState === 'correct' && 'Nice work!'}
                {popoverState === 'incorrect' && 'Not quite'}
                {popoverState === 'omitted' && 'Skipped'}
              </span>
              <button className="sqr-popover-close" onClick={dismissPopover} aria-label="Dismiss">
                <FiX />
              </button>
            </div>
            {popoverState === 'correct' && <p className="sqr-popover-sub">Keep going.</p>}
            {(hasInlineNotes || !isExplanationOpen) ? (
              <button type="button" className="sqr-popover-link" onClick={handleSeeExplanation}>
                See the full explanation.
              </button>
            ) : (
              <button type="button" className="sqr-popover-link" onClick={handleSeeExplanation}>
                Review the explanation below.
              </button>
            )}
          </div>
        )}

        <footer className="sqr-footer">
          <div className="sqr-footer-left">
            <button
              className="sqr-prev"
              onClick={() => handleNavigation('prev')}
              disabled={currentIdx === 0}
              title="Previous question"
            >
              <FiArrowLeft aria-hidden="true" />
              <span>Previous</span>
            </button>
          </div>

          <div className="sqr-progress" aria-label={`Question ${currentIdx + 1} of ${questionTotal}`}>
            <span className="sqr-progress-count">{currentIdx + 1} of {questionTotal}</span>
            <div className="sqr-dots" aria-hidden="true">
              {quiz.questions.map((question, idx) => {
                const status = getDotStatus(question, idx);
                const isCurrentDot = idx === currentIdx;
                if (status === 'correct' || status === 'incorrect' || status === 'omitted') {
                  return (
                    <span
                      key={question.id || idx}
                      className={`sqr-dot is-${status} ${isCurrentDot ? 'is-current' : ''}`}
                    >
                      {status === 'correct' && <FiCheckCircle />}
                      {status === 'incorrect' && <FiXCircle />}
                      {status === 'omitted' && <FiMinusCircle />}
                    </span>
                  );
                }
                return (
                  <span
                    key={question.id || idx}
                    className={`sqr-dot ${isCurrentDot ? 'is-current' : ''} ${status === 'answered' ? 'is-answered' : ''}`}
                  />
                );
              })}
            </div>
          </div>

          <div className="sqr-footer-right">
            {tutorModeActive && !isCurrentChecked && !hasCurrentResponse && (
              <button type="button" className="sqr-skip" onClick={handleSkipOmit}>
                Skip
              </button>
            )}
            <button
              type="button"
              className="sqr-primary"
              onClick={handlePrimaryAction}
              disabled={primaryActionDisabled}
            >
              {primaryActionLabel}
            </button>
          </div>
        </footer>

        <ReportQuestionModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          onReport={handleReportQuestion}
          loading={reportLoading}
        />

        <ToastContainer position="bottom-left" autoClose={3000} />
      </div>
    );
  }

  return null;
}
