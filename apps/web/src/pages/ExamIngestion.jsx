import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import '../styles/ExamIngestion.css';

const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? process.env.REACT_APP_API_URL || 'https://ultrasat.onrender.com/api'
  : 'http://localhost:3001/api';

const STAGE_META = {
  extract:   { label: 'Extract',   icon: '📄', desc: 'Extracting questions from PDF via Gemini AI' },
  validate:  { label: 'Validate',  icon: '🔍', desc: 'Cross-verifying extraction against original PDF' },
  normalize: { label: 'Normalize', icon: '🔧', desc: 'Mapping to Firestore schema & subcategories' },
  upload:    { label: 'Upload',    icon: '🔥', desc: 'Writing questions, modules, and exam to Firestore' },
};

const ExamIngestion = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Form state
  const [selectedFile, setSelectedFile] = useState(null);
  const [examName, setExamName] = useState('');
  const [dryRun, setDryRun] = useState(true);
  const [skipValidation, setSkipValidation] = useState(false);

  // Pipeline state
  const [jobId, setJobId] = useState(null);
  const [pipelineState, setPipelineState] = useState(null);
  const [logs, setLogs] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const logsEndRef = useRef(null);
  const eventSourceRef = useRef(null);

  // Check admin access
  useEffect(() => {
    const checkAdmin = async () => {
      if (!currentUser) { setIsAdmin(false); setIsLoading(false); return; }
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        setIsAdmin(userDoc.exists() && userDoc.data().isAdmin === true);
      } catch { setIsAdmin(false); }
      setIsLoading(false);
    };
    checkAdmin();
  }, [currentUser]);

  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Clean up SSE on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const connectSSE = useCallback((jId) => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const es = new EventSource(`${API_BASE_URL}/ingest/status/${jId}`);
    eventSourceRef.current = es;

    es.addEventListener('state', (e) => {
      const state = JSON.parse(e.data);
      setPipelineState(state);
    });

    es.addEventListener('log', (e) => {
      const log = JSON.parse(e.data);
      setLogs(prev => [...prev, log]);
    });

    es.addEventListener('done', (e) => {
      const result = JSON.parse(e.data);
      setIsRunning(false);
      setIsDone(true);
      es.close();
      eventSourceRef.current = null;
      if (result.status === 'failed') {
        setPipelineState(prev => ({ ...prev, status: 'failed', error: result.error }));
      }
    });

    es.onerror = () => {
      // SSE connection lost — check one more time via REST
      es.close();
      eventSourceRef.current = null;
    };
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
    } else {
      setSelectedFile(null);
      if (file) alert('Please select a PDF file.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile || !examName.trim()) {
      alert('Please select a PDF and enter an exam name.');
      return;
    }

    setIsRunning(true);
    setIsDone(false);
    setLogs([]);
    setPipelineState(null);

    try {
      const token = await auth.currentUser.getIdToken();

      const formData = new FormData();
      formData.append('pdf', selectedFile);
      formData.append('examName', examName.trim());
      formData.append('dryRun', dryRun.toString());
      formData.append('skipValidation', skipValidation.toString());

      const response = await fetch(`${API_BASE_URL}/ingest/run`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `Upload failed: ${response.status}`);
      }

      const { jobId: jId } = await response.json();
      setJobId(jId);

      // Connect SSE for progress
      connectSSE(jId);

    } catch (err) {
      setIsRunning(false);
      setLogs(prev => [...prev, { level: 'error', message: `❌ ${err.message}`, timestamp: new Date().toISOString() }]);
    }
  };

  const getStageStatus = (stageName) => {
    if (!pipelineState?.stages) return 'pending';
    return pipelineState.stages[stageName]?.status || 'pending';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return '✅';
      case 'running':   return '⏳';
      case 'failed':    return '❌';
      case 'skipped':   return '⏭️';
      default:          return '⬜';
    }
  };

  const getLogClass = (level) => {
    switch (level) {
      case 'error':   return 'log-error';
      case 'warning': return 'log-warning';
      case 'success': return 'log-success';
      default:        return 'log-info';
    }
  };

  // Loading / access denied states
  if (isLoading) return <div className="ingest-page"><div className="ingest-loading">Checking permissions...</div></div>;
  if (!isAdmin) return (
    <div className="ingest-page">
      <div className="ingest-denied">
        <h2>Access Denied</h2>
        <p>Admin access required.</p>
        <button onClick={() => navigate('/')}>Return Home</button>
      </div>
    </div>
  );

  return (
    <div className="ingest-page">
      <div className="ingest-container">
        {/* Header */}
        <div className="ingest-header">
          <button className="ingest-back-btn" onClick={() => navigate('/admin')}>← Back to Admin</button>
          <h1>📄 Exam PDF Ingestion</h1>
          <p className="ingest-subtitle">Upload an official SAT exam PDF to automatically extract, validate, and import all questions.</p>
        </div>

        {/* Form */}
        <form className="ingest-form" onSubmit={handleSubmit}>
          <div className="ingest-form-row">
            <div className="ingest-field">
              <label htmlFor="pdf-upload">PDF File</label>
              <div className="ingest-file-input">
                <input
                  id="pdf-upload"
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  disabled={isRunning}
                />
                {selectedFile && (
                  <span className="ingest-file-name">
                    {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(1)} MB)
                  </span>
                )}
              </div>
            </div>
            <div className="ingest-field">
              <label htmlFor="exam-name">Exam Name</label>
              <input
                id="exam-name"
                type="text"
                value={examName}
                onChange={(e) => setExamName(e.target.value)}
                placeholder='e.g. "Official SAT March 2026"'
                disabled={isRunning}
              />
            </div>
          </div>

          <div className="ingest-options-row">
            <label className="ingest-checkbox">
              <input
                type="checkbox"
                checked={dryRun}
                onChange={(e) => setDryRun(e.target.checked)}
                disabled={isRunning}
              />
              <span>Dry Run</span>
              <span className="ingest-option-hint">(extract & validate only, no Firestore writes)</span>
            </label>
            <label className="ingest-checkbox">
              <input
                type="checkbox"
                checked={skipValidation}
                onChange={(e) => setSkipValidation(e.target.checked)}
                disabled={isRunning}
              />
              <span>Skip Validation</span>
              <span className="ingest-option-hint">(faster, but no AI cross-check)</span>
            </label>
          </div>

          <button
            type="submit"
            className="ingest-submit-btn"
            disabled={isRunning || !selectedFile || !examName.trim()}
          >
            {isRunning ? '⏳ Pipeline Running...' : '🚀 Start Ingestion'}
          </button>
        </form>

        {/* Stage Progress */}
        {(isRunning || isDone) && (
          <div className="ingest-stages">
            <h2>Pipeline Progress</h2>
            <div className="ingest-stage-grid">
              {Object.entries(STAGE_META).map(([key, meta]) => {
                const status = getStageStatus(key);
                return (
                  <div key={key} className={`ingest-stage-card stage-${status}`}>
                    <div className="stage-icon">{meta.icon}</div>
                    <div className="stage-content">
                      <div className="stage-header">
                        <span className="stage-label">{meta.label}</span>
                        <span className="stage-status-icon">{getStatusIcon(status)}</span>
                      </div>
                      <div className="stage-desc">{meta.desc}</div>
                      <div className={`stage-status-text status-${status}`}>
                        {status === 'running' && <span className="stage-spinner" />}
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Logs */}
        {logs.length > 0 && (
          <div className="ingest-logs">
            <h2>Live Output</h2>
            <div className="ingest-log-window">
              {logs.map((log, i) => (
                <div key={i} className={`ingest-log-line ${getLogClass(log.level)}`}>
                  <span className="log-time">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  <span className="log-msg">{log.message}</span>
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
          </div>
        )}

        {/* Done summary */}
        {isDone && pipelineState && (
          <div className={`ingest-summary ${pipelineState.status === 'completed' ? 'summary-success' : 'summary-error'}`}>
            <h2>{pipelineState.status === 'completed' ? '🎉 Ingestion Complete!' : '❌ Ingestion Failed'}</h2>
            {pipelineState.status === 'completed' && pipelineState.dryRun && (
              <p className="summary-note">This was a <strong>dry run</strong>. No data was written to Firestore. Uncheck "Dry Run" and run again to import for real.</p>
            )}
            {pipelineState.error && (
              <p className="summary-error-msg">{pipelineState.error}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamIngestion;
