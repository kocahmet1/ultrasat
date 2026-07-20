import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';
import {
  createExamQualityControlRun,
  getExamQualityControlCatalog,
  getExamQualityControlRun,
  publishExamQualityControlRun,
  repairExamQualityControlItems,
  resumeExamQualityControlRun,
  rollbackExamQualityControlRepair,
  uploadExamQualityControlReference,
} from '../api/examQualityControlClient';
import '../styles/AdminPages.css';
import '../styles/AdminExamQualityControl.css';

const RUN_POLL_INTERVAL_MS = 10000;

const ACTIVE_RUN_STATUSES = new Set([
  'queued',
  'pending',
  'running',
  'processing',
  'auditing',
  'repair_queued',
  'repairing',
  'in_progress',
]);

const LEASE_REQUIRED_ACTIVE_STATUSES = new Set([
  'auditing',
  'repairing',
]);

const RESUMABLE_RUN_STATUSES = new Set([
  'audit_completed_with_failures',
  'failed',
  'partial',
  'paused',
  'interrupted',
  'stopped',
]);

const RESUMABLE_APPROVED_REPAIR_STATUSES = new Set([
  'failed',
  'repair_queued',
  'repairing',
]);

const AUDIT_FAILED_ITEM_STATUSES = new Set([
  'audit_failed',
  'failed',
]);

const NO_ACTION_VALUES = new Set([
  '',
  'accept',
  'keep',
  'none',
  'no_action',
  'no action',
  'pass',
]);

const REPAIR_APPLIED_STATUSES = new Set([
  'applied',
  'repaired',
]);

const REPAIR_BUSY_STATUSES = new Set([
  'queued',
  'pending',
  'running',
  'repairing',
]);

const REPAIR_SELECTABLE_ITEM_STATUSES = new Set([
  'needs_repair',
  'repair_blocked',
  'repair_ready',
]);

function normalizeToken(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function formatLabel(value, fallback = 'Unknown') {
  const normalized = String(value || '').trim();
  if (!normalized) return fallback;
  return normalized
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, letter => letter.toUpperCase());
}

function formatModelName(value) {
  const model = String(value || '').trim();
  if (!model) return 'GPT-5.6 Sol';
  if (normalizeToken(model) === 'gpt_5_6_sol') return 'GPT-5.6 Sol';
  return model;
}

function formatDate(value) {
  if (!value) return 'Date unavailable';

  const rawDate = typeof value?.toDate === 'function'
    ? value.toDate()
    : value?.seconds
      ? new Date(value.seconds * 1000)
      : new Date(value);

  if (Number.isNaN(rawDate.getTime())) return 'Date unavailable';
  return rawDate.toLocaleString();
}

function timestampToMillis(value) {
  if (!value) return 0;
  if (typeof value?.toMillis === 'function') return value.toMillis();
  if (typeof value?.toDate === 'function') return value.toDate().getTime();
  if (value instanceof Date) return value.getTime();

  const seconds = Number(value?.seconds ?? value?._seconds);
  if (Number.isFinite(seconds) && seconds > 0) {
    return seconds * 1000;
  }

  const parsed = Date.parse(String(value));
  return Number.isFinite(parsed) ? parsed : 0;
}

function hasActiveWorkerLease(run, now = Date.now()) {
  return Boolean(run?.workerLease?.ownerId)
    && timestampToMillis(run.workerLease.expiresAt) > now;
}

function isRunActive(run, now = Date.now()) {
  const status = normalizeToken(run?.status);
  if (!ACTIVE_RUN_STATUSES.has(status)) return false;
  if (LEASE_REQUIRED_ACTIVE_STATUSES.has(status)) {
    return hasActiveWorkerLease(run, now);
  }
  return true;
}

function getRunProgress(run) {
  const progress = run?.progress || {};
  const total = Number(progress.total) || 0;
  const completed = Number(progress.completed) || 0;
  const failed = Number(progress.failed) || 0;
  const processed = Math.min(total || completed, completed);
  const percent = total > 0
    ? Math.min(100, Math.round((processed / total) * 100))
    : 0;

  return {
    total,
    completed,
    failed,
    processed,
    percent,
  };
}

function canResumeRun(run) {
  if (!run) return false;

  const status = normalizeToken(run.status);
  const phase = normalizeToken(run.phase);
  const hasLiveLease = hasActiveWorkerLease(run);
  const hasPersistedApproval = Boolean(
    String(run.activeApprovalId || '').trim(),
  );

  if (
    phase === 'repair'
    && hasPersistedApproval
    && RESUMABLE_APPROVED_REPAIR_STATUSES.has(status)
  ) {
    return !hasLiveLease;
  }

  if (isRunActive(run)) return false;
  if (phase === 'repair') return false;
  if (status === 'auditing' && !hasLiveLease) return true;

  const progress = getRunProgress(run);
  const hasUnfinishedWork = progress.total > progress.processed;

  return RESUMABLE_RUN_STATUSES.has(status)
    || hasUnfinishedWork
    || progress.failed > 0;
}

function wasPublishedByRun(run, exam) {
  if (!run?.id) return false;
  if (run.publishedAt) return true;

  return Boolean(exam?.isPublic)
    && String(exam?.qualityControl?.runId || '') === String(run.id);
}

function canPublishRun(run, exam) {
  return Boolean(run?.id)
    && run?.summary?.publishReady === true
    && run.scopeComplete === true
    && !hasActiveWorkerLease(run)
    && !wasPublishedByRun(run, exam);
}

function isReferenceSelectable(reference) {
  return Boolean(reference?.id)
    && normalizeToken(reference.status) === 'ready';
}

function getItemAction(item) {
  const rawAction = item?.analysis?.recommendedAction
    ?? item?.analysis?.action;

  if (typeof rawAction === 'string') return rawAction;
  if (rawAction && typeof rawAction === 'object') {
    return rawAction.type || rawAction.action || rawAction.label || '';
  }
  return '';
}

function itemNeedsAction(item) {
  const action = normalizeToken(getItemAction(item));
  if (action && !NO_ACTION_VALUES.has(action)) return true;

  return [
    'action_required',
    'manual_review',
    'needs_action',
    'needs_repair',
    'repair_blocked',
    'repair_ready',
  ].includes(normalizeToken(item?.status));
}

function isAuditFailure(item) {
  return AUDIT_FAILED_ITEM_STATUSES.has(normalizeToken(item?.status));
}

function isManualReview(item) {
  return normalizeToken(item?.status) === 'manual_review';
}

function isRepairApplied(item) {
  return Boolean(item?.repair?.appliedAt)
    || REPAIR_APPLIED_STATUSES.has(normalizeToken(item?.repair?.status));
}

function isItemSelectable(item) {
  if (!REPAIR_SELECTABLE_ITEM_STATUSES.has(normalizeToken(item?.status))) {
    return false;
  }
  if (isRepairApplied(item)) {
    return false;
  }
  return !REPAIR_BUSY_STATUSES.has(normalizeToken(item?.repair?.status));
}

function getQuestionPreviewText(questionPreview) {
  if (!questionPreview) return 'No question preview is available.';
  if (typeof questionPreview === 'string') return questionPreview;
  return questionPreview.text
    || questionPreview.questionText
    || questionPreview.prompt
    || 'Question preview is available in the item details.';
}

function getQuestionPreviewOptions(questionPreview) {
  if (!questionPreview || typeof questionPreview !== 'object') return [];
  const options = questionPreview.options
    || questionPreview.choices
    || questionPreview.answerChoices;
  return Array.isArray(options) ? options : [];
}

function formatIssue(issue) {
  if (typeof issue === 'string') return issue;
  if (!issue || typeof issue !== 'object') return String(issue || '');
  return issue.evidence
    || issue.message
    || issue.description
    || issue.summary
    || issue.issue
    || JSON.stringify(issue);
}

function formatSnapshot(snapshot) {
  if (snapshot === undefined || snapshot === null || snapshot === '') {
    return 'Not available';
  }
  if (typeof snapshot === 'string') return snapshot;
  return JSON.stringify(snapshot, null, 2);
}

function getVerificationView(verification) {
  if (!verification || typeof verification !== 'object') return null;

  const blockers = Array.isArray(verification.blockers)
    ? verification.blockers
    : [];
  const state = verification.eligible === true
    ? 'eligible'
    : verification.eligible === false || blockers.length > 0
      ? 'blocked'
      : 'pending';
  const result = verification.result;
  const resultText = result === undefined || result === null || result === ''
    ? ''
    : typeof result === 'object'
      ? JSON.stringify(result)
      : String(result);

  return {
    blockers,
    resultText,
    state,
  };
}

function getScopeErrors(run) {
  const possibleErrors = [
    run?.scopeErrors,
    run?.scope?.errors,
    run?.scope?.scopeErrors,
  ];

  return possibleErrors
    .filter(Array.isArray)
    .flat()
    .filter(Boolean);
}

function upsertRun(runList, nextRun) {
  if (!nextRun?.id) return runList;
  return [
    nextRun,
    ...runList.filter(run => run.id !== nextRun.id),
  ];
}

function AdminExamQualityControl() {
  const navigate = useNavigate();
  const referenceFileInputRef = useRef(null);
  const confirmationButtonRef = useRef(null);

  const [exams, setExams] = useState([]);
  const [references, setReferences] = useState([]);
  const [runs, setRuns] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogRefreshing, setCatalogRefreshing] = useState(false);
  const [modelSettings, setModelSettings] = useState({
    model: 'gpt-5.6-sol',
    reasoningEffort: 'max',
    reasoningMode: 'pro',
  });
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [selectedExamId, setSelectedExamId] = useState('');
  const [selectedModuleIds, setSelectedModuleIds] = useState([]);
  const [selectedReferenceId, setSelectedReferenceId] = useState('');
  const [referenceFile, setReferenceFile] = useState(null);
  const [referenceName, setReferenceName] = useState('');

  const [activeRun, setActiveRun] = useState(null);
  const [items, setItems] = useState([]);
  const [runLoading, setRunLoading] = useState(false);
  const [actionBusy, setActionBusy] = useState('');
  const [selectedItemIds, setSelectedItemIds] = useState([]);
  const [expandedItemIds, setExpandedItemIds] = useState([]);

  const [severityFilter, setSeverityFilter] = useState('all');
  const [kindFilter, setKindFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  const [confirmation, setConfirmation] = useState(null);

  const selectedExam = useMemo(
    () => exams.find(exam => exam.id === selectedExamId) || null,
    [exams, selectedExamId],
  );

  const selectedReference = useMemo(
    () => references.find(reference => reference.id === selectedReferenceId) || null,
    [references, selectedReferenceId],
  );

  const severityOptions = useMemo(
    () => Array.from(new Set(items.map(item => normalizeToken(item.severity)).filter(Boolean))),
    [items],
  );

  const kindOptions = useMemo(
    () => Array.from(new Set(items.map(item => normalizeToken(item.kind)).filter(Boolean))),
    [items],
  );

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      if (
        severityFilter !== 'all'
        && normalizeToken(item.severity) !== severityFilter
      ) {
        return false;
      }

      if (kindFilter !== 'all' && normalizeToken(item.kind) !== kindFilter) {
        return false;
      }

      if (actionFilter === 'actionable' && !isItemSelectable(item)) return false;
      if (
        actionFilter === 'clean'
        && (itemNeedsAction(item) || isAuditFailure(item))
      ) {
        return false;
      }
      if (actionFilter === 'failed' && !isAuditFailure(item)) return false;
      if (actionFilter === 'repaired' && !isRepairApplied(item)) return false;
      if (
        actionFilter === 'selected'
        && !selectedItemIds.includes(item.id)
      ) {
        return false;
      }

      return true;
    });
  }, [
    actionFilter,
    items,
    kindFilter,
    selectedItemIds,
    severityFilter,
  ]);

  const selectableFilteredItemIds = useMemo(
    () => filteredItems.filter(isItemSelectable).map(item => item.id),
    [filteredItems],
  );

  const selectedRepairItems = useMemo(
    () => items.filter(
      item => selectedItemIds.includes(item.id) && isItemSelectable(item),
    ),
    [items, selectedItemIds],
  );

  const allVisibleActionableSelected = selectableFilteredItemIds.length > 0
    && selectableFilteredItemIds.every(itemId => selectedItemIds.includes(itemId));
  const activeRunIsActive = isRunActive(activeRun);

  const loadCatalog = useCallback(async ({ refreshing = false } = {}) => {
    try {
      if (refreshing) setCatalogRefreshing(true);
      else setCatalogLoading(true);
      setError('');

      const data = await getExamQualityControlCatalog();
      setExams(Array.isArray(data.exams) ? data.exams : []);
      setReferences(Array.isArray(data.references) ? data.references : []);
      setRuns(Array.isArray(data.runs) ? data.runs : []);
      setModelSettings({
        model: data.model || 'gpt-5.6-sol',
        reasoningEffort: data.reasoningEffort || 'max',
        reasoningMode: data.reasoningMode || 'pro',
      });
    } catch (loadError) {
      setError(loadError.message || 'Failed to load the exam quality control catalog');
    } finally {
      setCatalogLoading(false);
      setCatalogRefreshing(false);
    }
  }, []);

  const loadRun = useCallback(async (runId, { silent = false } = {}) => {
    if (!runId) return;

    try {
      if (!silent) setRunLoading(true);
      const data = await getExamQualityControlRun(runId);
      const nextRun = data.run || null;
      const nextItems = Array.isArray(data.items) ? data.items : [];

      setActiveRun(nextRun);
      setItems(nextItems);
      setRuns(previousRuns => upsertRun(previousRuns, nextRun));
      setSelectedItemIds(previousIds => previousIds.filter(itemId => {
        const matchingItem = nextItems.find(item => item.id === itemId);
        return matchingItem && isItemSelectable(matchingItem);
      }));
    } catch (loadError) {
      if (!silent) {
        setError(loadError.message || 'Failed to load the quality control run');
      }
    } finally {
      if (!silent) setRunLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  useEffect(() => {
    if (!activeRun?.id || !activeRunIsActive) return undefined;

    const pollRun = () => {
      loadRun(activeRun.id, { silent: true });
    };
    const intervalId = window.setInterval(pollRun, RUN_POLL_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [activeRun?.id, activeRun?.status, activeRunIsActive, loadRun]);

  useEffect(() => {
    if (!confirmation) return undefined;

    confirmationButtonRef.current?.focus();
    const handleKeyDown = event => {
      if (event.key === 'Escape' && !actionBusy) {
        setConfirmation(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [actionBusy, confirmation]);

  const handleExamChange = event => {
    const examId = event.target.value;
    const exam = exams.find(candidate => candidate.id === examId);

    setSelectedExamId(examId);
    setSelectedModuleIds(
      Array.isArray(exam?.modules) ? exam.modules.map(module => module.id) : [],
    );
  };

  const toggleModule = moduleId => {
    setSelectedModuleIds(previousIds => (
      previousIds.includes(moduleId)
        ? previousIds.filter(id => id !== moduleId)
        : [...previousIds, moduleId]
    ));
  };

  const selectAllModules = () => {
    setSelectedModuleIds(
      Array.isArray(selectedExam?.modules)
        ? selectedExam.modules.map(module => module.id)
        : [],
    );
  };

  const handleReferenceFileChange = event => {
    const file = event.target.files?.[0] || null;
    setReferenceFile(file);

    if (file && !referenceName.trim()) {
      setReferenceName(file.name.replace(/\.[^.]+$/, ''));
    }
  };

  const handleReferenceUpload = async event => {
    event.preventDefault();
    if (!referenceFile) {
      setError('Choose a College Board reference document first');
      return;
    }

    try {
      setActionBusy('upload-reference');
      setError('');
      setNotice('');
      const data = await uploadExamQualityControlReference(
        referenceFile,
        referenceName,
      );

      if (data.reference) {
        setReferences(previousReferences => [
          data.reference,
          ...previousReferences.filter(reference => reference.id !== data.reference.id),
        ]);
        setSelectedReferenceId(data.reference.id);
      }

      setReferenceFile(null);
      setReferenceName('');
      if (referenceFileInputRef.current) {
        referenceFileInputRef.current.value = '';
      }
      setNotice('Reference uploaded, indexed, and ready for audit selection.');
    } catch (uploadError) {
      setError(uploadError.message || 'Failed to upload the reference document');
    } finally {
      setActionBusy('');
    }
  };

  const handleStartAudit = async event => {
    event.preventDefault();

    if (!selectedExamId) {
      setError('Select an exam to audit');
      return;
    }
    if (selectedModuleIds.length === 0) {
      setError('Select at least one exam module');
      return;
    }
    if (!selectedReferenceId || !isReferenceSelectable(selectedReference)) {
      setError('Select a reference set that is ready');
      return;
    }

    try {
      setActionBusy('start-audit');
      setError('');
      setNotice('');
      setItems([]);
      setSelectedItemIds([]);
      setExpandedItemIds([]);

      const data = await createExamQualityControlRun({
        examId: selectedExamId,
        moduleIds: selectedModuleIds,
        referenceId: selectedReferenceId,
      });
      const nextRun = data.run || null;

      setActiveRun(nextRun);
      setRuns(previousRuns => upsertRun(previousRuns, nextRun));
      setNotice('Audit queued. This page will update as each question is checked.');

      if (nextRun?.id) {
        loadRun(nextRun.id, { silent: true });
      }
    } catch (startError) {
      setError(startError.message || 'Failed to start the exam audit');
    } finally {
      setActionBusy('');
    }
  };

  const handleResumeRun = async () => {
    if (!activeRun?.id) return;

    try {
      setActionBusy('resume-run');
      setError('');
      setNotice('');
      const data = await resumeExamQualityControlRun(activeRun.id);
      const nextRun = data.run || activeRun;
      setActiveRun(nextRun);
      setRuns(previousRuns => upsertRun(previousRuns, nextRun));
      setNotice('Run resumed. Progress will update automatically.');
    } catch (resumeError) {
      setError(resumeError.message || 'Failed to resume the run');
    } finally {
      setActionBusy('');
    }
  };

  const handlePublishRun = async () => {
    if (!activeRun?.id || actionBusy) return;

    const catalogExam = exams.find(exam => exam.id === activeRun.examId);
    if (!canPublishRun(activeRun, catalogExam)) return;

    try {
      setActionBusy('publish-run');
      setError('');
      setNotice('');
      const data = await publishExamQualityControlRun(activeRun.id);
      const nextRun = data.run || activeRun;

      setActiveRun(nextRun);
      setRuns(previousRuns => upsertRun(previousRuns, nextRun));
      if (data.exam?.id) {
        setExams(previousExams => {
          const existingExam = previousExams.find(exam => exam.id === data.exam.id);
          const nextExam = existingExam
            ? {
              ...existingExam,
              ...data.exam,
              modules: existingExam.modules,
            }
            : data.exam;

          return existingExam
            ? previousExams.map(exam => (
              exam.id === data.exam.id ? nextExam : exam
            ))
            : [nextExam, ...previousExams];
        });
      }
      setNotice(
        `${data.exam?.title || activeRun.examTitle || 'Practice exam'} is now published.`,
      );
    } catch (publishError) {
      setError(publishError.message || 'Failed to publish the verified exam');
    } finally {
      setActionBusy('');
    }
  };

  const toggleItemSelection = itemId => {
    const item = items.find(candidate => candidate.id === itemId);
    if (!item || !isItemSelectable(item)) return;

    setSelectedItemIds(previousIds => (
      previousIds.includes(itemId)
        ? previousIds.filter(id => id !== itemId)
        : [...previousIds, itemId]
    ));
  };

  const toggleSelectVisibleActionable = () => {
    setSelectedItemIds(previousIds => {
      if (allVisibleActionableSelected) {
        return previousIds.filter(
          itemId => !selectableFilteredItemIds.includes(itemId),
        );
      }
      return Array.from(new Set([
        ...previousIds,
        ...selectableFilteredItemIds,
      ]));
    });
  };

  const toggleExpandedItem = itemId => {
    setExpandedItemIds(previousIds => (
      previousIds.includes(itemId)
        ? previousIds.filter(id => id !== itemId)
        : [...previousIds, itemId]
    ));
  };

  const confirmRepairs = async () => {
    if (!activeRun?.id || selectedRepairItems.length === 0) return;

    try {
      setActionBusy('repair-selected');
      setError('');
      setNotice('');
      const data = await repairExamQualityControlItems(
        activeRun.id,
        selectedRepairItems.map(item => item.id),
      );
      const nextRun = data.run || activeRun;

      setActiveRun(nextRun);
      setRuns(previousRuns => upsertRun(previousRuns, nextRun));
      setSelectedItemIds([]);
      setConfirmation(null);
      setNotice('Approved repairs queued. Before/after evidence will appear after verification.');
    } catch (repairError) {
      setError(repairError.message || 'Failed to start the approved repairs');
    } finally {
      setActionBusy('');
    }
  };

  const confirmRollback = async item => {
    if (!activeRun?.id || !item?.id) return;

    try {
      setActionBusy(`rollback-${item.id}`);
      setError('');
      setNotice('');
      const data = await rollbackExamQualityControlRepair(activeRun.id, item.id);

      if (data.run) {
        setActiveRun(data.run);
        setRuns(previousRuns => upsertRun(previousRuns, data.run));
      }
      if (data.item) {
        setItems(previousItems => previousItems.map(previousItem => (
          previousItem.id === data.item.id ? data.item : previousItem
        )));
      }

      setConfirmation(null);
      setNotice(`Rolled back the repair for ${item.title || item.questionId || item.id}.`);
    } catch (rollbackError) {
      setError(rollbackError.message || 'Failed to roll back the repair');
    } finally {
      setActionBusy('');
    }
  };

  const handleConfirmation = () => {
    if (confirmation?.type === 'repair') {
      confirmRepairs();
    } else if (confirmation?.type === 'rollback') {
      confirmRollback(confirmation.item);
    }
  };

  const runProgress = getRunProgress(activeRun);
  const activeRunExam = exams.find(exam => exam.id === activeRun?.examId) || null;
  const canPublishActiveRun = canPublishRun(activeRun, activeRunExam);
  const activeScopeErrors = getScopeErrors(activeRun);
  const hasIncompleteScope = activeRun?.scopeComplete === false
    || activeScopeErrors.length > 0;
  const hasAuditFailures = normalizeToken(activeRun?.status) === 'audit_completed_with_failures'
    || items.some(isAuditFailure);
  const runSummary = activeRun?.summary;
  const runSummaryEntries = runSummary && typeof runSummary === 'object'
    ? Object.entries(runSummary)
    : [];
  const isInitialLoading = catalogLoading && exams.length === 0;

  return (
    <div className="admin-page exam-quality-control-page">
      <header className="admin-page-header eqc-page-header">
        <div className="header-left">
          <button
            className="back-button"
            type="button"
            onClick={() => navigate('/admin')}
          >
            &larr; Back to Admin
          </button>
        </div>
        <h1>Exam Quality Control</h1>
        <div className="header-right">
          <span className="eqc-model-badge" aria-label="Quality control model">
            {formatModelName(activeRun?.model || modelSettings.model)}
            {' / '}
            {activeRun?.reasoningEffort || modelSettings.reasoningEffort} reasoning
            {' / '}
            {activeRun?.reasoningMode || modelSettings.reasoningMode || 'standard'} mode
          </span>
        </div>
      </header>

      <main className="admin-page-content eqc-content">
        <section className="eqc-intro" aria-labelledby="eqc-intro-title">
          <div>
            <span className="eqc-eyebrow">Pre-publication safeguard</span>
            <h2 id="eqc-intro-title">Audit first. Repair only after approval.</h2>
            <p>
              Check exam completeness, visuals, answer quality, difficulty, and
              College Board style against your selected reference library.
              Nothing is changed during Stage 1.
            </p>
          </div>
          <button
            className="eqc-button eqc-button--secondary"
            type="button"
            onClick={() => loadCatalog({ refreshing: true })}
            disabled={catalogRefreshing || Boolean(actionBusy)}
          >
            {catalogRefreshing ? 'Refreshing…' : 'Refresh catalog'}
          </button>
        </section>

        <nav className="eqc-stage-nav" aria-label="Quality control stages">
          <div className="eqc-stage eqc-stage--active">
            <span>1</span>
            <div>
              <strong>Check</strong>
              <small>Analyze without changing content</small>
            </div>
          </div>
          <div className={`eqc-stage ${activeRun ? 'eqc-stage--active' : ''}`}>
            <span>2</span>
            <div>
              <strong>Approve & repair</strong>
              <small>Apply only selected corrections</small>
            </div>
          </div>
        </nav>

        {error && (
          <div className="eqc-alert eqc-alert--error" role="alert">
            {error}
          </div>
        )}
        {notice && (
          <div className="eqc-alert eqc-alert--success" role="status">
            {notice}
          </div>
        )}

        {isInitialLoading ? (
          <div className="eqc-loading" role="status">
            <span className="eqc-spinner" aria-hidden="true" />
            Loading exams, references, and recent runs…
          </div>
        ) : (
          <>
            <div className="eqc-setup-grid">
              <div className="eqc-setup-column">
                <section className="eqc-panel" aria-labelledby="eqc-reference-title">
                  <div className="eqc-panel-heading">
                    <div>
                      <span className="eqc-step-label">Reference library</span>
                      <h2 id="eqc-reference-title">College Board style source</h2>
                    </div>
                    <span className="eqc-count-badge">{references.length} sets</span>
                  </div>

                  {references.length > 0 ? (
                    <fieldset className="eqc-reference-list">
                      <legend className="eqc-visually-hidden">
                        Select the reference set for this audit
                      </legend>
                      {references.map(reference => {
                        const selectable = isReferenceSelectable(reference);
                        const selected = selectedReferenceId === reference.id;
                        return (
                          <label
                            className={`eqc-reference-card ${selected ? 'is-selected' : ''} ${!selectable ? 'is-disabled' : ''}`}
                            key={reference.id}
                          >
                            <input
                              type="radio"
                              name="exam-quality-reference"
                              value={reference.id}
                              checked={selected}
                              onChange={() => setSelectedReferenceId(reference.id)}
                              disabled={!selectable || Boolean(actionBusy)}
                            />
                            <span className="eqc-reference-copy">
                              <strong>{reference.name || reference.fileName || reference.id}</strong>
                              <small>
                                {reference.fileName || 'Uploaded reference'}
                                {' · '}
                                {formatDate(reference.createdAt)}
                              </small>
                            </span>
                            <span className={`eqc-status eqc-status--${normalizeToken(reference.status) || 'unknown'}`}>
                              {formatLabel(reference.status)}
                            </span>
                          </label>
                        );
                      })}
                    </fieldset>
                  ) : (
                    <div className="eqc-empty-state">
                      No reference sets have been uploaded yet.
                    </div>
                  )}

                  <form className="eqc-upload-form" onSubmit={handleReferenceUpload}>
                    <div className="eqc-field">
                      <label htmlFor="eqc-reference-name">Reference set name</label>
                      <input
                        id="eqc-reference-name"
                        type="text"
                        value={referenceName}
                        onChange={event => setReferenceName(event.target.value)}
                        placeholder="Official SAT style reference – 2026"
                        disabled={actionBusy === 'upload-reference'}
                      />
                    </div>
                    <div className="eqc-field">
                      <label htmlFor="eqc-reference-file">Reference document</label>
                      <input
                        id="eqc-reference-file"
                        ref={referenceFileInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx,.txt"
                        onChange={handleReferenceFileChange}
                        disabled={actionBusy === 'upload-reference'}
                      />
                      <small>
                        Upload the curated document containing representative
                        easy, medium, and hard questions.
                      </small>
                    </div>
                    <button
                      className="eqc-button eqc-button--secondary"
                      type="submit"
                      disabled={!referenceFile || actionBusy === 'upload-reference'}
                    >
                      {actionBusy === 'upload-reference' ? 'Uploading…' : 'Upload reference'}
                    </button>
                  </form>
                </section>

                <section className="eqc-panel" aria-labelledby="eqc-exam-title">
                  <div className="eqc-panel-heading">
                    <div>
                      <span className="eqc-step-label">Audit scope</span>
                      <h2 id="eqc-exam-title">Exam and modules</h2>
                    </div>
                  </div>

                  <form onSubmit={handleStartAudit}>
                    <div className="eqc-field">
                      <label htmlFor="eqc-exam-select">Practice exam</label>
                      <select
                        id="eqc-exam-select"
                        value={selectedExamId}
                        onChange={handleExamChange}
                        disabled={Boolean(actionBusy)}
                      >
                        <option value="">Select an exam</option>
                        {exams.map(exam => (
                          <option key={exam.id} value={exam.id}>
                            {exam.title || exam.id}
                            {exam.isPublic ? ' · Public' : ' · Private'}
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedExam && (
                      <>
                        {selectedExam.description && (
                          <p className="eqc-exam-description">
                            {selectedExam.description}
                          </p>
                        )}
                        <div className="eqc-module-toolbar">
                          <strong>Modules</strong>
                          <div>
                            <button
                              type="button"
                              onClick={selectAllModules}
                              disabled={Boolean(actionBusy)}
                            >
                              Select all
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedModuleIds([])}
                              disabled={Boolean(actionBusy)}
                            >
                              Clear
                            </button>
                          </div>
                        </div>

                        <fieldset className="eqc-module-grid">
                          <legend className="eqc-visually-hidden">
                            Select modules to audit
                          </legend>
                          {(selectedExam.modules || []).map(module => {
                            const missingCount = Number(module.missingQuestionCount) || 0;
                            return (
                              <label
                                className={`eqc-module-card ${selectedModuleIds.includes(module.id) ? 'is-selected' : ''}`}
                                key={module.id}
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedModuleIds.includes(module.id)}
                                  onChange={() => toggleModule(module.id)}
                                  disabled={Boolean(actionBusy)}
                                />
                                <span className="eqc-module-number">
                                  {module.moduleNumber || '—'}
                                </span>
                                <span className="eqc-module-copy">
                                  <strong>{module.title || `Module ${module.moduleNumber || ''}`}</strong>
                                  <small>
                                    {module.resolvedQuestionCount ?? 0}
                                    {' resolved / '}
                                    {module.questionIdsLength ?? module.questionCount ?? 0}
                                    {' referenced'}
                                  </small>
                                </span>
                                {missingCount > 0 && (
                                  <span className="eqc-missing-badge">
                                    {missingCount} missing
                                  </span>
                                )}
                              </label>
                            );
                          })}
                        </fieldset>
                      </>
                    )}

                    <div className="eqc-start-row">
                      <div>
                        <strong>{selectedModuleIds.length} modules selected</strong>
                        <small>
                          Stage 1 creates findings only. It does not edit questions.
                        </small>
                      </div>
                      <button
                        className="eqc-button eqc-button--primary"
                        type="submit"
                        disabled={
                          !selectedExamId
                          || selectedModuleIds.length === 0
                          || !selectedReference
                          || !isReferenceSelectable(selectedReference)
                          || Boolean(actionBusy)
                        }
                      >
                        {actionBusy === 'start-audit' ? 'Starting audit…' : 'Start quality audit'}
                      </button>
                    </div>
                  </form>
                </section>
              </div>

              <aside className="eqc-panel eqc-runs-panel" aria-labelledby="eqc-runs-title">
                <div className="eqc-panel-heading">
                  <div>
                    <span className="eqc-step-label">Persistent history</span>
                    <h2 id="eqc-runs-title">Recent runs</h2>
                  </div>
                  <span className="eqc-count-badge">{runs.length}</span>
                </div>

                {runs.length > 0 ? (
                  <div className="eqc-runs-list">
                    {runs.map(run => {
                      const progress = getRunProgress(run);
                      const exam = exams.find(candidate => candidate.id === run.examId);
                      return (
                        <button
                          type="button"
                          className={`eqc-run-row ${activeRun?.id === run.id ? 'is-active' : ''}`}
                          key={run.id}
                          onClick={() => loadRun(run.id)}
                          disabled={runLoading}
                          aria-label={`Open ${exam?.title || run.examTitle || 'exam'} quality control run`}
                        >
                          <span className="eqc-run-row-top">
                            <strong>{exam?.title || run.examTitle || 'Exam audit'}</strong>
                            <span className={`eqc-status eqc-status--${normalizeToken(run.status) || 'unknown'}`}>
                              {formatLabel(run.status)}
                            </span>
                          </span>
                          <span className="eqc-run-row-meta">
                            {formatLabel(run.phase, 'Audit')}
                            {' · '}
                            {progress.processed}/{progress.total || '—'} checked
                          </span>
                          <span className="eqc-run-row-date">
                            {formatDate(run.updatedAt || run.createdAt)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="eqc-empty-state">
                    Completed and active runs will appear here.
                  </div>
                )}
              </aside>
            </div>

            {activeRun && (
              <section className="eqc-workspace" aria-labelledby="eqc-workspace-title">
                <div className="eqc-workspace-header">
                  <div>
                    <span className="eqc-step-label">
                      Stage {normalizeToken(activeRun.phase) === 'repair' ? '2' : '1'}
                    </span>
                    <h2 id="eqc-workspace-title">
                      {activeRun.examTitle
                        || exams.find(exam => exam.id === activeRun.examId)?.title
                        || 'Exam quality control run'}
                    </h2>
                    <div className="eqc-run-metadata">
                      <span className={`eqc-status eqc-status--${normalizeToken(activeRun.status) || 'unknown'}`}>
                        {formatLabel(activeRun.status)}
                      </span>
                      <span>{formatLabel(activeRun.phase, 'Audit')} phase</span>
                      <span>{activeRun.model || 'GPT-5.6 Sol'}</span>
                      <span>{activeRun.reasoningEffort || 'max'} reasoning</span>
                      <span>
                        {activeRun.reasoningMode || modelSettings.reasoningMode || 'standard'} mode
                      </span>
                    </div>
                  </div>
                  <div className="eqc-workspace-actions">
                    {canPublishActiveRun && (
                      <button
                        className="eqc-button eqc-button--primary"
                        type="button"
                        onClick={handlePublishRun}
                        disabled={Boolean(actionBusy)}
                      >
                        {actionBusy === 'publish-run'
                          ? 'Publishing…'
                          : 'Publish verified exam'}
                      </button>
                    )}
                    {canResumeRun(activeRun) && (
                      <button
                        className="eqc-button eqc-button--secondary"
                        type="button"
                        onClick={handleResumeRun}
                        disabled={Boolean(actionBusy)}
                      >
                        {actionBusy === 'resume-run' ? 'Resuming…' : 'Resume run'}
                      </button>
                    )}
                    <button
                      className="eqc-button eqc-button--secondary"
                      type="button"
                      onClick={() => loadRun(activeRun.id)}
                      disabled={runLoading || Boolean(actionBusy)}
                    >
                      {runLoading ? 'Loading…' : 'Refresh run'}
                    </button>
                  </div>
                </div>

                {hasIncompleteScope && (
                  <div className="eqc-scope-warning" role="alert">
                    <strong>Canonical full-exam scope is incomplete.</strong>
                    <p>
                      This run cannot establish publication readiness until all
                      four canonical modules and their expected question slots
                      are included and resolved.
                    </p>
                    {activeScopeErrors.length > 0 && (
                      <ul>
                        {activeScopeErrors.map((scopeError, scopeErrorIndex) => (
                          <li key={`scope-error-${scopeErrorIndex}`}>
                            {formatIssue(scopeError)}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {hasAuditFailures && (
                  <div className="eqc-audit-failure-warning" role="alert">
                    <strong>Some questions could not be audited.</strong>
                    <p>
                      Failed audit items remain listed below and are not eligible
                      for repair. Resume this run to retry them.
                    </p>
                  </div>
                )}

                <div className="eqc-progress-card">
                  <div className="eqc-progress-copy">
                    <strong>{runProgress.percent}% processed</strong>
                    <span>
                      {runProgress.processed} processed
                      {' · '}
                      {runProgress.failed} failed
                      {' · '}
                      {runProgress.total || 0} total
                    </span>
                  </div>
                  <div
                    className="eqc-progress-track"
                    role="progressbar"
                    aria-label="Quality control run progress"
                    aria-valuemin="0"
                    aria-valuemax="100"
                    aria-valuenow={runProgress.percent}
                  >
                    <span style={{ width: `${runProgress.percent}%` }} />
                  </div>
                </div>

                {(runSummaryEntries.length > 0 || typeof runSummary === 'string') && (
                  <div className="eqc-summary-grid">
                    {typeof runSummary === 'string' ? (
                      <div className="eqc-summary-wide">{runSummary}</div>
                    ) : runSummaryEntries.map(([key, value]) => (
                      <div className="eqc-summary-item" key={key}>
                        <span>{formatLabel(key)}</span>
                        <strong>
                          {typeof value === 'object'
                            ? JSON.stringify(value)
                            : String(value)}
                        </strong>
                      </div>
                    ))}
                  </div>
                )}

                <div className="eqc-results-toolbar">
                  <div className="eqc-filter-group">
                    <div className="eqc-field eqc-field--compact">
                      <label htmlFor="eqc-action-filter">Result</label>
                      <select
                        id="eqc-action-filter"
                        value={actionFilter}
                        onChange={event => setActionFilter(event.target.value)}
                      >
                        <option value="all">All results</option>
                        <option value="actionable">Needs action</option>
                        <option value="failed">Audit failed</option>
                        <option value="clean">No action</option>
                        <option value="repaired">Repaired</option>
                        <option value="selected">Selected</option>
                      </select>
                    </div>
                    <div className="eqc-field eqc-field--compact">
                      <label htmlFor="eqc-severity-filter">Severity</label>
                      <select
                        id="eqc-severity-filter"
                        value={severityFilter}
                        onChange={event => setSeverityFilter(event.target.value)}
                      >
                        <option value="all">All severities</option>
                        {severityOptions.map(severity => (
                          <option key={severity} value={severity}>
                            {formatLabel(severity)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="eqc-field eqc-field--compact">
                      <label htmlFor="eqc-kind-filter">Issue type</label>
                      <select
                        id="eqc-kind-filter"
                        value={kindFilter}
                        onChange={event => setKindFilter(event.target.value)}
                      >
                        <option value="all">All issue types</option>
                        {kindOptions.map(kind => (
                          <option key={kind} value={kind}>
                            {formatLabel(kind)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="eqc-approval-actions">
                    <button
                      className="eqc-button eqc-button--secondary"
                      type="button"
                      onClick={toggleSelectVisibleActionable}
                      disabled={selectableFilteredItemIds.length === 0 || Boolean(actionBusy)}
                    >
                      {allVisibleActionableSelected
                        ? 'Clear visible selection'
                        : 'Select visible actionable'}
                    </button>
                    <button
                      className="eqc-button eqc-button--danger"
                      type="button"
                      onClick={() => setConfirmation({ type: 'repair' })}
                      disabled={selectedRepairItems.length === 0 || Boolean(actionBusy)}
                    >
                      Approve & repair selected ({selectedRepairItems.length})
                    </button>
                  </div>
                </div>

                <p className="eqc-results-count" role="status">
                  Showing {filteredItems.length} of {items.length} findings.
                  Only findings with a recommended action can be selected.
                </p>

                {runLoading && items.length === 0 ? (
                  <div className="eqc-loading" role="status">
                    <span className="eqc-spinner" aria-hidden="true" />
                    Loading run findings…
                  </div>
                ) : filteredItems.length > 0 ? (
                  <div className="eqc-findings-list">
                    {filteredItems.map(item => {
                      const selectable = isItemSelectable(item);
                      const selected = selectedItemIds.includes(item.id);
                      const expanded = expandedItemIds.includes(item.id);
                      const deterministicIssues = Array.isArray(item.deterministicIssues)
                        ? item.deterministicIssues
                        : [];
                      const analysisIssues = Array.isArray(item.analysis?.issues)
                        ? item.analysis.issues
                        : [];
                      const previewOptions = getQuestionPreviewOptions(item.questionPreview);
                      const scores = item.analysis?.scores
                        && typeof item.analysis.scores === 'object'
                        ? Object.entries(item.analysis.scores)
                        : [];
                      const verification = getVerificationView(item.repair?.verification);
                      const auditFailed = isAuditFailure(item);
                      const manualReview = isManualReview(item);

                      return (
                        <article
                          className={`eqc-finding-card severity-${normalizeToken(item.severity) || 'unknown'} ${selected ? 'is-selected' : ''} ${auditFailed ? 'is-audit-failed' : ''}`}
                          key={item.id}
                        >
                          <div className="eqc-finding-header">
                            <div className="eqc-finding-select">
                              <input
                                type="checkbox"
                                checked={selected}
                                onChange={() => toggleItemSelection(item.id)}
                                disabled={!selectable || Boolean(actionBusy)}
                                aria-label={`Select ${item.title || item.questionId || item.id} for repair`}
                              />
                            </div>
                            <div className="eqc-finding-heading-copy">
                              <div className="eqc-finding-badges">
                                <span className={`eqc-severity eqc-severity--${normalizeToken(item.severity) || 'unknown'}`}>
                                  {formatLabel(item.severity)}
                                </span>
                                <span className="eqc-kind-badge">
                                  {formatLabel(item.kind, 'Quality issue')}
                                </span>
                                {isRepairApplied(item) && (
                                  <span className="eqc-repaired-badge">Repaired</span>
                                )}
                                {auditFailed && (
                                  <span className="eqc-audit-failed-badge">Audit failed</span>
                                )}
                                {manualReview && (
                                  <span className="eqc-manual-review-badge">
                                    Adjudication required
                                  </span>
                                )}
                              </div>
                              <h3>{item.title || 'Quality control finding'}</h3>
                              <p className="eqc-finding-location">
                                Module {item.moduleNumber || '—'}
                                {' · Question '}
                                {item.questionNumber || '—'}
                                {item.questionId ? ` · ${item.questionId}` : ''}
                              </p>
                            </div>
                            <div className="eqc-finding-action">
                              <span>Recommended action</span>
                              <strong>{formatLabel(getItemAction(item), 'Review only')}</strong>
                            </div>
                          </div>

                          <div className="eqc-question-preview">
                            <p>{getQuestionPreviewText(item.questionPreview)}</p>
                            {previewOptions.length > 0 && (
                              <ol type="A">
                                {previewOptions.map((option, optionIndex) => (
                                  <li key={`${item.id}-option-${optionIndex}`}>
                                    {typeof option === 'string'
                                      ? option
                                      : option?.text || option?.value || JSON.stringify(option)}
                                  </li>
                                ))}
                              </ol>
                            )}
                          </div>

                          {scores.length > 0 && (
                            <div className="eqc-score-row" aria-label="Quality scores">
                              {scores.map(([scoreName, scoreValue]) => (
                                <span key={scoreName}>
                                  {formatLabel(scoreName)}
                                  <strong>{String(scoreValue)}</strong>
                                </span>
                              ))}
                            </div>
                          )}

                          {item.analysis?.summary && (
                            <p className="eqc-analysis-summary">
                              {item.analysis.summary}
                            </p>
                          )}

                          {manualReview && (
                            <div className="eqc-manual-review-note">
                              <strong>Manual adjudication required.</strong>
                              <span>
                                This finding cannot be selected for automated
                                repair until an administrator resolves the review.
                              </span>
                            </div>
                          )}

                          {(deterministicIssues.length > 0 || analysisIssues.length > 0) && (
                            <div className="eqc-issue-columns">
                              {deterministicIssues.length > 0 && (
                                <div>
                                  <strong>Structural checks</strong>
                                  <ul>
                                    {deterministicIssues.map((issue, issueIndex) => (
                                      <li key={`${item.id}-deterministic-${issueIndex}`}>
                                        {formatIssue(issue)}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {analysisIssues.length > 0 && (
                                <div>
                                  <strong>Expert review</strong>
                                  <ul>
                                    {analysisIssues.map((issue, issueIndex) => (
                                      <li key={`${item.id}-analysis-${issueIndex}`}>
                                        {formatIssue(issue)}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}

                          {item.repair?.error && (
                            <div className="eqc-inline-error" role="alert">
                              Repair error: {item.repair.error}
                            </div>
                          )}

                          {auditFailed && (
                            <div className="eqc-inline-error" role="alert">
                              Audit error: {item.auditError || 'The model audit did not complete for this question.'}
                            </div>
                          )}

                          {verification && (
                            <div className={`eqc-verification-panel is-${verification.state}`}>
                              <div className="eqc-verification-heading">
                                <strong>Repair verification</strong>
                                <span>{formatLabel(verification.state)}</span>
                              </div>
                              {verification.resultText && (
                                <p>Result: {verification.resultText}</p>
                              )}
                              {verification.blockers.length > 0 && (
                                <ul>
                                  {verification.blockers.map((blocker, blockerIndex) => (
                                    <li key={`${item.id}-verification-blocker-${blockerIndex}`}>
                                      {formatIssue(blocker)}
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          )}

                          <div className="eqc-finding-footer">
                            <div>
                              <span className={`eqc-status eqc-status--${normalizeToken(item.status) || 'unknown'}`}>
                                {formatLabel(item.status)}
                              </span>
                            </div>
                            <div className="eqc-finding-buttons">
                              {(item.repair?.before || item.repair?.after) && (
                                <button
                                  type="button"
                                  onClick={() => toggleExpandedItem(item.id)}
                                  aria-expanded={expanded}
                                >
                                  {expanded ? 'Hide before / after' : 'View before / after'}
                                </button>
                              )}
                              {isRepairApplied(item) && item.repair?.replacementQuestionId && (
                                <button
                                  className="eqc-rollback-button"
                                  type="button"
                                  onClick={() => setConfirmation({ type: 'rollback', item })}
                                  disabled={Boolean(actionBusy)}
                                >
                                  Roll back repair
                                </button>
                              )}
                            </div>
                          </div>

                          {expanded && (
                            <div className="eqc-comparison" aria-label="Repair before and after comparison">
                              <div>
                                <strong>Before</strong>
                                <pre>{formatSnapshot(item.repair?.before)}</pre>
                              </div>
                              <div>
                                <strong>After</strong>
                                <pre>{formatSnapshot(item.repair?.after)}</pre>
                              </div>
                            </div>
                          )}
                        </article>
                      );
                    })}
                  </div>
                ) : (
                  <div className="eqc-empty-state eqc-empty-state--large">
                    {items.length === 0
                      ? activeRunIsActive
                        ? 'The audit is running. Findings will appear here as they are saved.'
                        : 'This run has no findings.'
                      : 'No findings match the selected filters.'}
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </main>

      {confirmation && (
        <div
          className="eqc-dialog-backdrop"
          role="presentation"
          onMouseDown={event => {
            if (event.target === event.currentTarget && !actionBusy) {
              setConfirmation(null);
            }
          }}
        >
          <div
            className="eqc-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="eqc-confirmation-title"
            aria-describedby="eqc-confirmation-description"
          >
            <span className="eqc-dialog-icon" aria-hidden="true">
              {confirmation.type === 'repair' ? '✓' : '↶'}
            </span>
            <h2 id="eqc-confirmation-title">
              {confirmation.type === 'repair'
                ? `Approve ${selectedRepairItems.length} repairs?`
                : 'Roll back this repair?'}
            </h2>
            <p id="eqc-confirmation-description">
              {confirmation.type === 'repair'
                ? 'This begins Stage 2 and allows the server to update only the selected findings. Each repair will retain before/after evidence and verification results.'
                : 'The currently applied question or graph change will be reverted to its saved pre-repair state.'}
            </p>
            {confirmation.type === 'repair' && (
              <ul className="eqc-confirmation-list">
                {selectedRepairItems.slice(0, 6).map(item => (
                  <li key={item.id}>
                    {item.title || item.questionId || item.id}
                    {' — '}
                    {formatLabel(getItemAction(item), 'Repair')}
                  </li>
                ))}
                {selectedRepairItems.length > 6 && (
                  <li>{selectedRepairItems.length - 6} more selected findings</li>
                )}
              </ul>
            )}
            <div className="eqc-dialog-actions">
              <button
                className="eqc-button eqc-button--secondary"
                type="button"
                onClick={() => setConfirmation(null)}
                disabled={Boolean(actionBusy)}
              >
                Cancel
              </button>
              <button
                ref={confirmationButtonRef}
                className={`eqc-button ${confirmation.type === 'repair' ? 'eqc-button--danger' : 'eqc-button--primary'}`}
                type="button"
                onClick={handleConfirmation}
                disabled={Boolean(actionBusy)}
              >
                {actionBusy
                  ? confirmation.type === 'repair'
                    ? 'Queuing repairs…'
                    : 'Rolling back…'
                  : confirmation.type === 'repair'
                    ? 'Approve & begin repairs'
                    : 'Confirm rollback'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminExamQualityControl;
