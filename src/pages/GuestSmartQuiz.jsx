import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getPublicQuestionsBySubcategory } from '../api/questionsClient';
import { DIFFICULTY_FOR_LEVEL, QUESTIONS_PER_QUIZ } from '../utils/smartQuizUtils';
import { getPublicHelperCache } from '../api/assistantClient';
import '../styles/SmartQuiz.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment, faLightbulb, faFileAlt, faBook } from '@fortawesome/free-solid-svg-icons';
import ProFeatureModal from '../components/ProFeatureModal';
import './SmartQuizProBadge.css';
import DetailedQuizResults from '../components/DetailedQuizResults';

function sampleN(arr, n) {
  const copy = [...arr];
  const out = [];
  while (copy.length && out.length < n) {
    const idx = Math.floor(Math.random() * copy.length);
    out.push(copy.splice(idx, 1)[0]);
  }
  return out;
}

function GuestSmartQuiz() {
  const navigate = useNavigate();
  const location = useLocation();
  const { subcategoryId, forceLevel } = location.state || {};

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [finished, setFinished] = useState(false);
  const timerRef = useRef(0);
  // UI/AI mode & layout state (guest)
  const [aiEnabled, setAiEnabled] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileVocab, setShowMobileVocab] = useState(false);
  const [showProModal, setShowProModal] = useState(false);
  // Cached vocabulary items per question for guests
  const [vocabCache, setVocabCache] = useState({}); // { [questionId]: Array<{term, definition}> }
  const [vocabLoading, setVocabLoading] = useState(false);

  const difficulty = useMemo(() => DIFFICULTY_FOR_LEVEL[forceLevel] || 'easy', [forceLevel]);

  useEffect(() => {
    if (!subcategoryId || !forceLevel) {
      navigate('/guest-subject-quizzes', { replace: true });
      return;
    }

    let isMounted = true;
    (async () => {
      try {
        setLoading(true);
        setError('');

        // First, try with difficulty
        let pool = await getPublicQuestionsBySubcategory(subcategoryId, difficulty, 60);
        if (!Array.isArray(pool)) pool = [];

        // Fallback without difficulty filter
        if (pool.length === 0) {
          pool = await getPublicQuestionsBySubcategory(subcategoryId, null, 60);
          if (!Array.isArray(pool)) pool = [];
        }

        // If still empty, show error
        if (pool.length === 0) {
          throw new Error('No questions available for this skill. Please try another difficulty or subcategory.');
        }

        const selected = sampleN(pool, Math.min(QUESTIONS_PER_QUIZ, pool.length));
        if (isMounted) {
          setQuestions(selected);
          setCurrentIdx(0);
        }
      } catch (e) {
        if (isMounted) setError(e?.message || 'Failed to load questions');
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => { isMounted = false; };
  }, [subcategoryId, difficulty, forceLevel, navigate]);

  // Track viewport for responsive layout
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const iv = setInterval(() => {
      timerRef.current = (timerRef.current || 0) + 1;
    }, 1000);
    return () => clearInterval(iv);
  }, []);

  const currentQuestion = questions[currentIdx];
  const currentQuestionId = currentQuestion?.id;

  const getQuestionType = (q) => {
    if (!q) return 'multiple-choice';
    if (q.questionType) return q.questionType;
    if (!Array.isArray(q.options) || q.options.length === 0) return 'user-input';
    return 'multiple-choice';
  };

  // Fetch cached vocabulary for the current question (public, no auth)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!aiEnabled || !currentQuestionId) return;
      // Avoid refetch if we already have cache for this question
      if (vocabCache[currentQuestionId] !== undefined) return;
      try {
        setVocabLoading(true);
        const { items } = await getPublicHelperCache(currentQuestionId, 'vocabulary');
        if (!cancelled) {
          setVocabCache((prev) => ({ ...prev, [currentQuestionId]: Array.isArray(items) ? items : [] }));
        }
      } catch (e) {
        if (!cancelled) {
          setVocabCache((prev) => ({ ...prev, [currentQuestionId]: [] }));
        }
      } finally {
        if (!cancelled) setVocabLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [aiEnabled, currentQuestionId, vocabCache]);

  const handleSelect = (optionIdx) => {
    if (!currentQuestion) return;
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
    if (!currentQuestion) return;
    let isCorrect = false;

    if (currentQuestion.correctAnswer !== undefined) {
      // String compare first
      isCorrect = String(value).trim() === String(currentQuestion.correctAnswer).trim();
      // Try as number if applicable
      if (!isCorrect) {
        const userNum = parseFloat(value);
        const correctNum = parseFloat(currentQuestion.correctAnswer);
        if (!isNaN(userNum) && !isNaN(correctNum)) {
          isCorrect = Math.abs(userNum - correctNum) < 0.0001;
        }
      }
      // Accepted answers
      if (!isCorrect && Array.isArray(currentQuestion.acceptedAnswers)) {
        isCorrect = currentQuestion.acceptedAnswers.some((ans) => String(ans).trim() === String(value).trim());
      }
    }

    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        selectedOption: value,
        isCorrect,
        timeSpent: timerRef.current ?? 0,
      },
    }));
  };

  const handleNav = (dir) => {
    if (!currentQuestion) return;
    if (dir === 'next') {
      if (!answers[currentQuestion.id]) return; // require answer to proceed
      if (currentIdx + 1 < questions.length) {
        setCurrentIdx((i) => i + 1);
        timerRef.current = 0;
      } else {
        setFinished(true);
      }
    } else if (dir === 'prev' && currentIdx > 0) {
      setCurrentIdx((i) => i - 1);
    }
  };

  const { correctCount, scorePct } = useMemo(() => {
    const ids = questions.map((q) => q.id);
    const correct = ids.filter((id) => answers[id]?.isCorrect).length;
    const pct = ids.length ? Math.round((correct / ids.length) * 100) : 0;
    return { correctCount: correct, scorePct: pct };
  }, [answers, questions]);

  if (loading) return <div style={{ padding: '24px' }}><p>Loading questions…</p></div>;
  if (error) return (
    <div className="smart-quiz__container">
      <div className="quiz-complete">
        <h2>Unable to start quiz</h2>
        <p style={{ color: '#b00020' }}>{error}</p>
        <button onClick={() => navigate('/guest-subject-quizzes')}>Back</button>
      </div>
    </div>
  );

  if (!currentQuestion && !finished) return null;

  if (finished) {
    const passed = scorePct >= 80;
    return (
      <DetailedQuizResults
        score={scorePct}
        level={forceLevel}
        passed={passed}
        subcategoryId={subcategoryId}
        questionCount={questions.length}
        userAnswers={answers}
        questions={questions}
        showReport={false}
        onPrimaryAction={() => navigate('/guest-subject-quizzes')}
        onSecondaryAction={() => navigate(-1)}
        primaryButtonContent="Try Another Quiz"
        secondaryButtonContent="Back"
      />
    );
  }

  const type = getQuestionType(currentQuestion);

  return (
    <div className="smart-quiz__container">
      {/* AI Features Toggle - pill style */}
      <div className="ai-toggle-container" style={{ display: 'flex', justifyContent: 'center', margin: '1rem auto', alignItems: 'center' }}>
        <div style={{ display: 'flex', position: 'relative', backgroundColor: '#f0f4f8', borderRadius: '30px', padding: '4px', width: '200px', boxShadow: '0 1px 5px rgba(0,0,0,0.15)' }}>
          <div
            onClick={() => setAiEnabled(false)}
            style={{ flex: 1, textAlign: 'center', padding: '6px 8px', borderRadius: '25px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', color: !aiEnabled ? '#333' : 'rgba(0, 0, 0, 0.6)', backgroundColor: !aiEnabled ? '#d1eaff' : 'transparent', transition: 'all 0.3s ease', zIndex: 1 }}
          >
            Basic Mode
          </div>
          <div
            onClick={() => setAiEnabled(true)}
            style={{ flex: 1, textAlign: 'center', padding: '6px 8px', borderRadius: '25px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', color: aiEnabled ? '#333' : 'rgba(0, 0, 0, 0.6)', backgroundColor: aiEnabled ? '#c9f0e1' : 'transparent', transition: 'all 0.3s ease', zIndex: 1 }}
          >
            AI Mode
          </div>
        </div>
      </div>

      {aiEnabled && (
        <>
          {/* Mobile quick AI bar */}
          <div className="mobile-ai-bar" style={{ display: isMobile ? 'flex' : 'none', gap: '8px', justifyContent: 'space-around', padding: '8px 12px' }}>
            <button onClick={() => setShowProModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <FontAwesomeIcon icon={faComment} />
              <span>AI</span>
            </button>
            <button onClick={() => setShowProModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <FontAwesomeIcon icon={faLightbulb} />
              <span>Tip</span>
            </button>
            <button onClick={() => setShowProModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <FontAwesomeIcon icon={faFileAlt} />
              <span>Summary</span>
            </button>
            <button onClick={() => setShowMobileVocab((v) => !v)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <FontAwesomeIcon icon={faBook} />
              <span>Words</span>
            </button>
          </div>
          {isMobile && showMobileVocab && (
            <div className="mobile-vocab-dropdown" style={{ padding: '8px 12px' }}>
              {vocabLoading ? (
                <p style={{ color: '#6c757d', margin: 0 }}>Loading vocabulary…</p>
              ) : (Array.isArray(vocabCache[currentQuestionId]) && vocabCache[currentQuestionId].length > 0 ? (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {vocabCache[currentQuestionId].map((it, idx) => {
                    const term = it.term || it.word || it.phrase || 'Term';
                    const def = it.definition || it.meaning || '';
                    return (
                      <li key={idx} style={{ marginBottom: '8px' }}>
                        <div style={{ fontWeight: 600 }}>{term}</div>
                        <div style={{ color: '#555' }}>{def}</div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p style={{ color: '#6c757d', fontStyle: 'italic', margin: 0 }}>Available to loged-in users. Create a free account.</p>
              ))}
            </div>
          )}
        </>
      )}

      <div className="quiz-main-area" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start', gap: '20px', padding: '0 20px', maxWidth: '1400px', margin: '20px auto' }}>
        {/* Left: Vocabulary (placeholder for guests) */}
        {aiEnabled && !isMobile && (
          <div className="vocabulary-column" style={{ width: '200px', flexShrink: 0, backgroundColor: '#f8f9fa', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', marginTop: '60px', maxHeight: '500px', overflowY: 'auto' }}>
            <div className="vocabulary-header" style={{ marginBottom: '16px', paddingBottom: '8px', borderBottom: '2px solid #4e73df' }}>
              <h3 style={{ margin: 0, fontSize: '16px', color: '#4e73df', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FontAwesomeIcon icon={faBook} />
                Key Vocabulary
              </h3>
            </div>
            <div className="vocabulary-content">
              {vocabLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60px', fontSize: '14px', color: '#6c757d' }}>
                  <p>Loading vocabulary…</p>
                </div>
              ) : (Array.isArray(vocabCache[currentQuestionId]) && vocabCache[currentQuestionId].length > 0 ? (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {vocabCache[currentQuestionId].map((it, idx) => {
                    const term = it.term || it.word || it.phrase || 'Term';
                    const def = it.definition || it.meaning || '';
                    return (
                      <li key={idx} style={{ marginBottom: '12px' }}>
                        <div style={{ fontWeight: 600, color: '#333' }}>{term}</div>
                        <div style={{ color: '#555', fontSize: '0.9rem' }}>{def}</div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60px', fontSize: '14px', color: '#6c757d', fontStyle: 'italic' }}>
                  <p>Available to loged-in users. Create a free account.</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Middle: Question panel */}
        <div className="question-panel" style={{ flexGrow: 1, maxWidth: '700px', backgroundColor: '#ffffff', borderRadius: '12px', padding: '25px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', position: 'relative' }}>
          <div className="quiz-header">
            <div className="quiz-header-left">
              <div className="quiz-title">SmartQuiz – Question {currentIdx + 1} / {questions.length}</div>
            </div>
            <div className="quiz-header-right">
              <div className="level-indicator">Level: {forceLevel} ({difficulty})</div>
            </div>
          </div>

          <div className="question-text-content">
            <div className="question-text" style={{ whiteSpace: 'pre-wrap' }}>{currentQuestion.text}</div>
          </div>

          {type === 'multiple-choice' ? (
            <ul className="options-list">
              {currentQuestion.options?.map((opt, idx) => (
                <li key={idx}>
                  <button
                    className={`option-button ${answers[currentQuestion.id]?.selectedOption === idx ? 'selected' : ''}`}
                    onClick={() => handleSelect(idx)}
                  >
                    {opt}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="user-input-container">
              <div className="input-container">
                <input
                  type="text"
                  className="user-answer-input"
                  placeholder="Type your answer"
                  value={answers[currentQuestion.id]?.selectedOption || ''}
                  onChange={(e) => handleUserInput(e.target.value)}
                />
                <div className="input-hint">Enter your answer and click Next</div>
              </div>
            </div>
          )}

          <div className="quiz-navigation">
            <button
              className="nav-button prev"
              onClick={() => handleNav('prev')}
              disabled={currentIdx === 0}
            >
              Previous
            </button>
            <button
              className="nav-button next"
              onClick={() => handleNav('next')}
            >
              {currentIdx + 1 < questions.length ? 'Next' : 'Finish'}
            </button>
          </div>
        </div>

        {/* Right: AI actions (open Pro modal for guests) */}
        {aiEnabled && !isMobile && (
          <div className="ai-tools-column" style={{ width: '150px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '60px' }}>
            <button
              className="assistant-action-button assistant-button"
              onClick={() => setShowProModal(true)}
              style={{ backgroundColor: '#e0f2f7', color: '#333', padding: '15px 10px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, fontSize: '0.9rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', position: 'relative' }}
            >
              <span className="sq-pro-badge">PRO</span>
              <FontAwesomeIcon icon={faComment} style={{ fontSize: '1.5rem', marginBottom: '8px' }} />
              <span>AI Assistant</span>
            </button>

            <button
              className="assistant-action-button tip-button"
              onClick={() => setShowProModal(true)}
              style={{ backgroundColor: '#e0f7f7', color: '#333', padding: '15px 10px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, fontSize: '0.9rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', position: 'relative' }}
            >
              <span className="sq-pro-badge">PRO</span>
              <FontAwesomeIcon icon={faLightbulb} style={{ fontSize: '1.5rem', marginBottom: '8px' }} />
              <span>Get a Tip</span>
            </button>

            <button
              className="assistant-action-button summarise-button"
              onClick={() => setShowProModal(true)}
              style={{ backgroundColor: '#f0e6f7', color: '#333', padding: '15px 10px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, fontSize: '0.9rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', position: 'relative' }}
            >
              <span className="sq-pro-badge">PRO</span>
              <FontAwesomeIcon icon={faFileAlt} style={{ fontSize: '1.5rem', marginBottom: '8px' }} />
              <span>Summarize</span>
            </button>
          </div>
        )}
      </div>

      {/* Upgrade modal */}
      <ProFeatureModal
        isOpen={showProModal}
        onClose={() => setShowProModal(false)}
        position={{ x: window.innerWidth / 2 - 200, y: window.innerHeight / 2 - 150 }}
      />
    </div>
  );
}

export default GuestSmartQuiz;
