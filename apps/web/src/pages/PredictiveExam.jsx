import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiChevronRight, FiFileText } from 'react-icons/fi';
import { getAllPracticeExams } from '../firebase/services';
import { useAuth } from '../contexts/AuthContext';
import '../styles/PracticeExamList.css';

const PredictiveExam = () => {
  const { currentUser, getInProgressExams } = useAuth();
  const [exams, setExams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inProgressExams, setInProgressExams] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExams = async () => {
      try {
        setIsLoading(true);
        const all = await getAllPracticeExams(true);
        const diagnostics = (all || []).filter((e) => e.isDiagnostic);
        setExams(diagnostics);
      } catch (e) {
        setError(e?.message || 'Failed to load predictive exams');
      } finally {
        setIsLoading(false);
      }
    };
    fetchExams();
  }, []);

  // Load in-progress and filter to diagnostic exam IDs
  const diagnosticExamIds = useMemo(() => new Set(exams.map((e) => e.id)), [exams]);
  useEffect(() => {
    const fetchInProgress = async () => {
      try {
        if (!currentUser || !getInProgressExams) {
          setInProgressExams([]);
          return;
        }
        const items = await getInProgressExams();
        const filtered = (items || []).filter((p) => diagnosticExamIds.has(p.practiceExamId));
        setInProgressExams(filtered);
      } catch (e) {
        setInProgressExams([]);
      }
    };
    fetchInProgress();
  }, [currentUser, getInProgressExams, diagnosticExamIds]);

  const handleStartExam = (exam) => {
    if (!exam) return;
    // Diagnostics are free for everyone
    sessionStorage.setItem('currentPracticeExam', JSON.stringify({
      examId: exam.id,
      title: exam.title,
      moduleIds: exam.moduleIds,
    }));
    navigate('/practice-exam/' + exam.id, { state: { startExam: true } });
  };

  const handleContinueExam = (progress) => {
    if (!progress || !progress.practiceExamId) return;
    navigate('/practice-exam/' + progress.practiceExamId, { state: { resume: true } });
  };

  return (
    <div className="ut-page ut-page--narrow">
      <header className="ut-page-head">
        <div className="ut-page-head-main">
          <p className="ut-eyebrow">Diagnostic</p>
          <h1 className="ut-page-title">Predictive Exam</h1>
          <p className="ut-page-sub">
            Take a short 27-question diagnostic (15 R&amp;W + 12 Math) to quickly estimate your SAT score and get targeted study recommendations.
          </p>
        </div>
      </header>

      {error && <div className="ut-chip ut-chip--hard pel-error" role="alert">{error}</div>}

      <section className="ut-panel-ink pel-continue" aria-label="Predictive exam overview">
        <div className="pel-continue-main">
          <span className="ut-label ut-label--on-ink">27-question diagnostic</span>
          <h2 className="pel-continue-title">Find your starting score</h2>
          <p className="pel-continue-meta">
            15 Reading &amp; Writing + 12 Math questions &middot; about 30 minutes &middot; free for everyone
          </p>
        </div>
        {!isLoading && exams.length > 0 && (
          <button
            type="button"
            className="ut-btn ut-btn--primary ut-btn--lg"
            onClick={() => handleStartExam(exams[0])}
          >
            Start diagnostic
          </button>
        )}
      </section>

      {currentUser && inProgressExams.length > 0 && (
        <section aria-label="Continue your predictive test">
          <div className="ut-section-head">
            <h2 className="ut-section-title">Continue your predictive test</h2>
          </div>
          <div>
            {inProgressExams.map((p) => {
              const updatedAt = p.updatedAt?.toDate
                ? p.updatedAt.toDate()
                : p.updatedAt?.seconds
                ? new Date(p.updatedAt.seconds * 1000)
                : null;
              const subtitle = `Module ${typeof p.currentModuleIndex === 'number' ? p.currentModuleIndex + 1 : 1}, Question ${typeof p.currentQuestionIndex === 'number' ? p.currentQuestionIndex + 1 : 1}`;
              return (
                <button
                  type="button"
                  key={p.practiceExamId}
                  className="ut-row ut-row--hover pel-exam-row"
                  onClick={() => handleContinueExam(p)}
                  aria-label={`Resume ${p.examTitle || 'Predictive Exam'}`}
                >
                  <span className="ut-tile ut-tile--ink">
                    <FiFileText />
                  </span>
                  <span className="pel-exam-main">
                    <strong className="pel-exam-title">{p.examTitle || 'Predictive Exam'}</strong>
                    <span className="ut-card-sub">
                      {subtitle}
                      {updatedAt ? ` · Saved ${updatedAt.toLocaleString()}` : ''}
                    </span>
                  </span>
                  <span className="pel-exam-side">
                    <span className="ut-chip ut-chip--accent">In progress</span>
                    <FiChevronRight className="pel-exam-arrow" aria-hidden="true" />
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      <section aria-label="Available diagnostic tests">
        <div className="ut-section-head">
          <h2 className="ut-section-title">Available diagnostic tests</h2>
        </div>

        {isLoading ? (
          <div className="ut-empty pel-loading" role="status">
            <span className="pel-spinner" aria-hidden="true" />
            <p>Loading predictive exams...</p>
          </div>
        ) : exams.length > 0 ? (
          <div>
            {exams.map((exam) => (
              <button
                type="button"
                key={exam.id}
                className="ut-row ut-row--hover pel-exam-row"
                onClick={() => handleStartExam(exam)}
                aria-label={`Start ${exam.title}`}
              >
                <span className="ut-tile">
                  <FiFileText />
                </span>
                <span className="pel-exam-main">
                  <strong className="pel-exam-title">{exam.title}</strong>
                  <span className="ut-card-sub">
                    {exam.description || 'Short test to assess your current level.'}
                  </span>
                </span>
                <span className="pel-exam-side">
                  <span className="ut-chip">~30 min</span>
                  <FiChevronRight className="pel-exam-arrow" aria-hidden="true" />
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="ut-empty">
            <b>No predictive exams are currently available.</b>
            Check back soon &mdash; new diagnostic tests are added regularly.
          </div>
        )}
      </section>
    </div>
  );
};

export default PredictiveExam;
