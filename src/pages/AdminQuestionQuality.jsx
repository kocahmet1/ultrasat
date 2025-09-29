import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { getAllPracticeExams, getPracticeExamModules } from '../firebase/services';
import { runQualityForQuestionsSequential, getLatestQualityReports, getQualityReport, rewriteAnswerChoice } from '../api/questionQualityClient';
import '../styles/AdminPages.css';
import { useAuth } from '../contexts/AuthContext';

const AdminQuestionQuality = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Admin gate (soft - backend also enforces)
  const [isAdmin, setIsAdmin] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // Data
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [modules, setModules] = useState([]);
  const [selectedModuleIds, setSelectedModuleIds] = useState(new Set());

  // Progress & results
  const [isLoadingExams, setIsLoadingExams] = useState(false);
  const [isLoadingModules, setIsLoadingModules] = useState(false);
  const [error, setError] = useState('');

  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [log, setLog] = useState([]);
  const [results, setResults] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);
  const [stopRequested, setStopRequested] = useState(false);

  // Modal state for detailed view and rewriting
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');
  const [modalQuestion, setModalQuestion] = useState(null); // { id, text, options: [], correctIndex }
  const [modalReport, setModalReport] = useState(null); // quality report payload
  const [rewriteBusyIndex, setRewriteBusyIndex] = useState(-1);
  const [rewriteNotes, setRewriteNotes] = useState({});

  // Derived
  const selectedQuestions = useMemo(() => {
    if (!modules || selectedModuleIds.size === 0) return [];
    const ids = [];
    modules.forEach((m) => {
      if (selectedModuleIds.has(m.id) && Array.isArray(m.questions)) {
        m.questions.forEach((q) => {
          if (q && q.id) ids.push(q.id);
        });
      }
    });
    // de-duplicate
    return Array.from(new Set(ids));
  }, [modules, selectedModuleIds]);

  const progressPct = useMemo(() => {
    if (!progress.total || progress.total === 0) return 0;
    return Math.round((progress.current / progress.total) * 100);
  }, [progress]);

  // Soft admin check (UI guard)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!currentUser) {
          if (!cancelled) {
            setIsAdmin(false);
            setAuthChecked(true);
          }
          return;
        }
        const userRef = doc(db, 'users', currentUser.uid);
        const snap = await getDoc(userRef);
        const adminFlag = snap.exists() && !!snap.data().isAdmin;
        if (!cancelled) setIsAdmin(adminFlag);
      } catch (e) {
        if (!cancelled) setIsAdmin(false);
      } finally {
        if (!cancelled) setAuthChecked(true);
      }
    })();
    return () => { cancelled = true; };
  }, [currentUser]);

  // Load practice exams
  useEffect(() => {
    if (!authChecked || !isAdmin) return;
    (async () => {
      try {
        setIsLoadingExams(true);
        setError('');
        const list = await getAllPracticeExams(false);
        // Sort by numeric in title
        list.sort((a, b) => {
          const na = parseInt(String(a.title || '').match(/\d+/)?.[0] || '0', 10);
          const nb = parseInt(String(b.title || '').match(/\d+/)?.[0] || '0', 10);
          return na - nb;
        });
        setExams(list);
      } catch (e) {
        setError(e.message || 'Failed to load practice exams');
      } finally {
        setIsLoadingExams(false);
      }
    })();
  }, [authChecked, isAdmin]);

  // When exam changes, load modules
  useEffect(() => {
    if (!selectedExamId) {
      setModules([]);
      setSelectedModuleIds(new Set());
      return;
    }
    (async () => {
      try {
        setIsLoadingModules(true);
        setError('');
        const mods = await getPracticeExamModules(selectedExamId);
        // Ensure each has id, title, moduleNumber, questions
        setModules(mods || []);
        setSelectedModuleIds(new Set(mods.map((m) => m.id))); // default select all
      } catch (e) {
        setError(e.message || 'Failed to load modules for exam');
      } finally {
        setIsLoadingModules(false);
      }
    })();
  }, [selectedExamId]);

  const toggleModule = (moduleId) => {
    setSelectedModuleIds((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  };

  const selectAllModules = () => {
    setSelectedModuleIds(new Set(modules.map((m) => m.id)));
  };
  const clearModules = () => setSelectedModuleIds(new Set());

  const stopRef = useRef(false);

  const startRun = async () => {
    try {
      if (!selectedExamId) {
        setError('Please select an exam');
        return;
      }
      if (selectedQuestions.length === 0) {
        setError('No questions found in selected modules');
        return;
      }
      setError('');
      setIsRunning(true);
      setStopRequested(false);
      stopRef.current = false;
      setResults([]);
      setLog([]);
      setProgress({ current: 0, total: selectedQuestions.length });

      // Sequential processing; support stop flag by chunking 1-by-1
      const collected = [];
      for (let i = 0; i < selectedQuestions.length; i++) {
        if (stopRef.current) break;
        const qid = selectedQuestions[i];
        try {
          const item = await runQualityForQuestionsSequential([qid], (evt) => {
            const line = evt.status === 'ok'
              ? `✓ Analyzed ${evt.item.questionId}`
              : `✗ Failed ${qid}: ${evt.item?.error || 'Unknown error'}`;
            setLog((prev) => [...prev, line]);
          });
          const resItem = Array.isArray(item) ? item[0] : item;
          collected.push(resItem);
        } catch (e) {
          collected.push({ questionId: qid, success: false, error: e.message });
          setLog((prev) => [...prev, `✗ Failed ${qid}: ${e.message}`]);
        }
        setProgress({ current: i + 1, total: selectedQuestions.length });
      }
      setResults(collected);
      setIsRunning(false);
    } catch (e) {
      setError(e.message || 'Run failed');
      setIsRunning(false);
    }
  };

  const stopRun = () => { setStopRequested(true); stopRef.current = true; };

  const refreshLatest = async () => {
    try {
      const latest = await getLatestQualityReports(25);
      // Merge into results view (simple append)
      setResults((prev) => {
        const map = new Map();
        prev.forEach((p) => map.set(p.questionId, p));
        latest.forEach((l) => map.set(l.questionId, { questionId: l.questionId, success: true, result: { latest: l.latest } }));
        return Array.from(map.values());
      });
    } catch (e) {
      setError(e.message || 'Failed to fetch latest reports');
    }
  };

  // Helper: normalize question options and correct index
  const normalizeOptionsAndCorrect = (q) => {
    let raw = q.options || q.choices || q.answerChoices || q.answers;
    let options = [];
    if (Array.isArray(raw)) {
      options = raw.map((o) => (typeof o === 'string' ? o : (o?.text || o?.value || o?.option || String(o))));
    } else if (raw && typeof raw === 'object') {
      const keys = Object.keys(raw).sort();
      options = keys.map((k) => (typeof raw[k] === 'string' ? raw[k] : String(raw[k])));
    }
    const text = q.text || q.questionText || q.prompt || '';
    const correct = q.correctAnswer ?? q.answer ?? null;
    let correctIndex = -1;
    if (typeof correct === 'number') {
      correctIndex = correct;
    } else if (typeof correct === 'string') {
      const trimmed = correct.trim();
      const letterMatch = trimmed.match(/^[A-Da-d]$/);
      if (letterMatch) {
        correctIndex = trimmed.toUpperCase().charCodeAt(0) - 65;
      } else {
        const idx = options.findIndex((t) => t && t.toLowerCase() === trimmed.toLowerCase());
        if (idx >= 0) correctIndex = idx;
      }
    }
    if (correctIndex < 0 || correctIndex >= options.length) correctIndex = -1;
    return { options, correctIndex, text };
  };

  const viewReport = async (qid) => {
    try {
      setModalOpen(true);
      setModalLoading(true);
      setModalError('');
      setRewriteNotes({});
      const data = await getQualityReport(qid);
      const snap = await getDoc(doc(db, 'questions', qid));
      if (!snap.exists()) throw new Error('Question not found');
      const q = snap.data();
      const norm = normalizeOptionsAndCorrect(q);
      setModalQuestion({ id: qid, ...norm });
      setModalReport(data);
    } catch (e) {
      setModalError(e.message || 'Failed to fetch report');
    } finally {
      setModalLoading(false);
    }
  };

  const handleRewriteChoice = async (index) => {
    if (!modalQuestion) return;
    try {
      setRewriteBusyIndex(index);
      setModalError('');
      const resp = await rewriteAnswerChoice(modalQuestion.id, index, true); // apply directly
      if (Array.isArray(resp.optionsAfter) && resp.optionsAfter.length) {
        setModalQuestion((prev) => ({ ...prev, options: resp.optionsAfter }));
      } else if (resp.rewritten) {
        const updated = [...modalQuestion.options];
        updated[index] = resp.rewritten;
        setModalQuestion((prev) => ({ ...prev, options: updated }));
      }
      if (resp.notes) setRewriteNotes((prev) => ({ ...prev, [index]: resp.notes }));
    } catch (e) {
      setModalError(e.message || 'Failed to rewrite choice');
    } finally {
      setRewriteBusyIndex(-1);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalError('');
    setModalQuestion(null);
    setModalReport(null);
    setRewriteNotes({});
  };

  if (!authChecked) {
    return (
      <div className="admin-page">
        <div className="admin-page-header"><h1>Question Quality Checks</h1></div>
        <div className="admin-page-content">Checking access...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="admin-page">
        <div className="admin-page-header">
          <button className="back-button" onClick={() => navigate('/admin')}>&larr; Back to Admin</button>
          <h1>Question Quality Checks</h1>
        </div>
        <div className="admin-page-content">
          <div className="error-message">You must be an admin to access this page.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div className="header-left">
          <button className="back-button" onClick={() => navigate('/admin')}>
            &larr; Back to Admin
          </button>
        </div>
        <h1>Question Quality Checks</h1>
        <div className="header-right"></div>
      </div>

      <div className="admin-page-content">
        {error && <div className="error-message" style={{ marginBottom: 12 }}>{error}</div>}

        <div className="card">
          <h3>Select Exam and Modules</h3>
          <div className="form-group">
            <label>Practice Exam</label>
            {isLoadingExams ? (
              <div>Loading exams...</div>
            ) : (
              <select value={selectedExamId} onChange={(e) => setSelectedExamId(e.target.value)}>
                <option value="">-- Select practice exam --</option>
                {exams.map((ex) => (
                  <option key={ex.id} value={ex.id}>{ex.title || ex.id}</option>
                ))}
              </select>
            )}
          </div>

          {selectedExamId && (
            <div className="form-group">
              <label>Modules</label>
              {isLoadingModules ? (
                <div>Loading modules...</div>
              ) : modules.length === 0 ? (
                <div>No modules found for this exam.</div>
              ) : (
                <div>
                  <div style={{ marginBottom: 8 }}>
                    <button className="secondary-button" onClick={selectAllModules} disabled={isRunning}>Select All</button>
                    <button className="secondary-button" onClick={clearModules} style={{ marginLeft: 8 }} disabled={isRunning}>Clear</button>
                  </div>
                  <div className="modules-grid">
                    {modules.map((m) => (
                      <label key={m.id} className="checkbox-item">
                        <input
                          type="checkbox"
                          checked={selectedModuleIds.has(m.id)}
                          onChange={() => toggleModule(m.id)}
                          disabled={isRunning}
                        />
                        <span>
                          Module {m.moduleNumber || '?'} — {m.title}
                          {Array.isArray(m.questions) && (<em style={{ marginLeft: 6, color: '#666' }}>({m.questions.length} questions)</em>)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="form-group">
            <div>
              <strong>Selected questions:</strong> {selectedQuestions.length}
            </div>
            <div style={{ marginTop: 8 }}>
              {!isRunning ? (
                <button className="primary-button" onClick={startRun} disabled={selectedQuestions.length === 0}>Start Quality Check</button>
              ) : (
                <>
                  <button className="secondary-button" onClick={stopRun}>Stop</button>
                </>
              )}
              <button className="secondary-button" onClick={refreshLatest} style={{ marginLeft: 8 }} disabled={isRunning}>Refresh Latest</button>
            </div>
          </div>

          {(isRunning || progress.total > 0) && (
            <div className="progress-area">
              <div className="progress-bar" style={{ background: '#eee', height: 10, borderRadius: 6 }}>
                <div style={{ width: `${progressPct}%`, height: '100%', background: '#1c7ed6', borderRadius: 6 }} />
              </div>
              <div style={{ marginTop: 6, fontSize: 12, color: '#555' }}>{progress.current} / {progress.total} ({progressPct}%)</div>
            </div>
          )}
        </div>

        <div className="card" style={{ marginTop: 16 }}>
          <h3>Run Log</h3>
          {log.length === 0 ? (
            <div>No activity yet.</div>
          ) : (
            <div className="log-box" style={{ maxHeight: 180, overflowY: 'auto', background: '#f9f9f9', padding: 8, borderRadius: 6 }}>
              {log.map((line, idx) => (
                <div key={idx} style={{ fontFamily: 'monospace' }}>{line}</div>
              ))}
            </div>
          )}
        </div>

        <div className="card" style={{ marginTop: 16 }}>
          <h3>Results</h3>
          {results.length === 0 ? (
            <div>No results yet.</div>
          ) : (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Question ID</th>
                    <th>Status</th>
                    <th>Quality</th>
                    <th>Flags</th>
                    <th>Needs Review</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r) => {
                    const latest = r?.result?.latest || r?.result; // handle direct
                    const qualityScore = latest?.qualityScore ?? null;
                    const flags = Array.isArray(latest?.flags) ? latest.flags : (Array.isArray(latest?.result?.flags) ? latest.result.flags : []);
                    const requires = typeof latest?.requiresHumanReview === 'boolean' ? latest.requiresHumanReview : (flags && flags.length > 0);
                    const ok = r.success !== false;
                    return (
                      <React.Fragment key={r.questionId}>
                        <tr>
                          <td style={{ fontFamily: 'monospace' }}>{r.questionId}</td>
                          <td>{ok ? 'OK' : 'Error'}</td>
                          <td>{qualityScore == null ? '-' : qualityScore}</td>
                          <td>{flags ? flags.length : '-'}</td>
                          <td>{requires ? 'Yes' : 'No'}</td>
                          <td>
                            <button className="secondary-button" onClick={() => viewReport(r.questionId)}>View</button>
                          </td>
                        </tr>
                        
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card" style={{ marginTop: 16 }}>
          <h4>Notes</h4>
          <ul>
            <li>Ensure the environment variable <code>OPENAI_API_KEY</code> is set on the API server. You can optionally override the model via <code>OPENAI_QC_MODEL</code>.</li>
            <li>Backend validates admin permissions. This page is an extra guard for UI only.</li>
            <li>Processing is sequential to avoid rate limits. You can stop mid-run; already completed items will be kept.</li>
          </ul>
        </div>
      </div>

      {/* Modal for detailed report and answer rewrite */}
      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Question Analysis — {modalQuestion?.id}</h3>
              <button className="icon-button" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              {modalLoading ? (
                <div>Loading...</div>
              ) : (
                <>
                  {modalError && <div className="error-message" style={{ marginBottom: 8 }}>{modalError}</div>}
                  <div className="modal-columns">
                    <div className="modal-col">
                      <h4>Question</h4>
                      <div className="question-text">{modalQuestion?.text || '—'}</div>
                      <h4 style={{ marginTop: 12 }}>Answers</h4>
                      <ul className="answers-list">
                        {(modalQuestion?.options || []).map((opt, idx) => {
                          const isCorrect = idx === modalQuestion?.correctIndex;
                          return (
                            <li key={idx} className={`answer-choice ${isCorrect ? 'answer-correct' : ''}`}>
                              <div className="answer-left">
                                <span className="answer-letter">{String.fromCharCode(65 + idx)}.</span>
                                <span className="answer-text">{opt}</span>
                              </div>
                              <div className="answer-actions">
                                <button
                                  className="secondary-button"
                                  onClick={() => handleRewriteChoice(idx)}
                                  disabled={rewriteBusyIndex === idx}
                                >
                                  {rewriteBusyIndex === idx ? 'Rewriting...' : 'Rewrite & Apply'}
                                </button>
                              </div>
                              {rewriteNotes[idx] && (
                                <div className="rewrite-notes">Note: {rewriteNotes[idx]}</div>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                    <div className="modal-col">
                      <h4>Quality Analysis</h4>
                      {modalReport?.latest ? (
                        <div className="analysis-panel">
                          <div><strong>Summary:</strong> {modalReport.latest.summary || '—'}</div>
                          <div className="analysis-meta">
                            <span><strong>Quality:</strong> {modalReport.latest.qualityScore ?? '—'}</span>
                            <span><strong>Difficulty:</strong> {modalReport.latest.difficultyRating || '—'}</span>
                            <span><strong>Requires Review:</strong> {String(modalReport.latest.requiresHumanReview ?? false)}</span>
                          </div>
                          <div style={{ marginTop: 8 }}>
                            <strong>Flags</strong>
                            {Array.isArray(modalReport.latest.flags) && modalReport.latest.flags.length > 0 ? (
                              <ul className="flags-list">
                                {modalReport.latest.flags.map((f, i) => (
                                  <li key={i}>
                                    <div><strong>Type:</strong> {f.type} <em>({f.severity})</em></div>
                                    <div><strong>Description:</strong> {f.description || '—'}</div>
                                    {f.fixSuggestion && <div><strong>Fix:</strong> {f.fixSuggestion}</div>}
                                  </li>
                                ))}
                              </ul>
                            ) : (<div>No flags.</div>)}
                          </div>
                        </div>
                      ) : (
                        <div>No analysis found.</div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="modal-footer">
              <button className="secondary-button" onClick={closeModal}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminQuestionQuality;
