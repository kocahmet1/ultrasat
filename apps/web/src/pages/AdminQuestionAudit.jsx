import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  createQuestionAuditRun,
  deleteQuestionAuditDraft,
  deleteQuestionAuditQuestions,
  getQuestionAuditCandidates,
  getQuestionAuditRun,
  getQuestionAuditRuns,
  publishQuestionAuditDraft,
  publishQuestionAuditDrafts,
  reviseQuestionAuditDraft,
  updateQuestionAuditDraft,
  verifyQuestionAuditDraft,
} from '../api/questionAuditClient';
import { useSubcategories } from '../contexts/SubcategoryContext';
import {
  getKebabCaseFromAnyFormat,
  getSubcategoriesArray,
} from '../utils/subcategoryConstants';
import '../styles/AdminPages.css';
import '../styles/AdminQuestionCreation.css';

const DIFFICULTIES = ['easy', 'medium', 'hard'];
const QUALITY_PASS_SCORE = 85;

function formatStatus(status) {
  return String(status || 'unknown').replace(/_/g, ' ');
}

function normalizeReviewScore(value) {
  if (value === null || value === undefined || value === '') return null;
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return null;
  const normalized = numeric > 0 && numeric <= 10 ? numeric * 10 : numeric;
  return Math.max(0, Math.min(100, Math.round(normalized)));
}

function getDraftFlags(draft) {
  const flags = [
    ...(Array.isArray(draft?.validation?.flags) ? draft.validation.flags : []),
    ...(Array.isArray(draft?.validation?.review?.flags) ? draft.validation.review.flags : []),
  ];

  const seen = new Set();
  return flags.filter(flag => {
    const key = `${flag.type}|${flag.severity}|${flag.description}|${flag.fixSuggestion}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function getQualityScore(draft) {
  return normalizeReviewScore(draft?.validation?.review?.qualityScore);
}

function getStyleScore(draft) {
  return normalizeReviewScore(draft?.validation?.review?.collegeBoardStyleScore);
}

function getCorrectAnswerIndex(question) {
  if (Number.isInteger(question?.correctAnswer)) return question.correctAnswer;
  const value = String(question?.correctAnswer ?? '').trim();
  if (/^[A-Da-d]$/.test(value)) return value.toUpperCase().charCodeAt(0) - 65;
  const numeric = Number.parseInt(value, 10);
  return Number.isInteger(numeric) ? numeric : -1;
}

function isDraftPublishable(draft) {
  return draft?.status === 'verified';
}

function isOriginalDeleted(draft) {
  return draft?.status === 'deleted_original';
}

function getDraftPublishBlockers(draft) {
  if (!draft) return ['Draft could not be found.'];
  if (draft.status === 'published') return ['This draft has already been published.'];
  if (isOriginalDeleted(draft)) return ['The original question has been deleted from the database.'];

  const validation = draft.validation || {};
  const review = validation.review || {};
  const blockers = [];

  if (draft.status !== 'verified') {
    blockers.push(`Status is ${formatStatus(draft.status)}, not verified.`);
  }
  if (validation.deterministic?.valid === false) {
    blockers.push('Format validation failed.');
  }
  if (!validation.deterministic) {
    blockers.push('Format validation has not run.');
  }
  if (validation.answerKeyMatches === false) {
    blockers.push('The independent solver did not match the answer key.');
  }
  if (validation.answerKeyMatches !== true) {
    blockers.push('Answer key verification has not passed.');
  }
  if (validation.difficultyMatchesRequest === false) {
    blockers.push(`Reviewer calibrated this as ${validation.calibratedDifficulty || 'a different tier'}.`);
  }
  if (validation.solver?.possibleIssue) {
    blockers.push(validation.solver.issueSummary || 'The independent solver reported a possible issue.');
  }
  if (validation.solver?.confidence && validation.solver.confidence !== 'high') {
    blockers.push(`Solver confidence is ${validation.solver.confidence}.`);
  }
  if (review.difficultyConfidence && review.difficultyConfidence !== 'high') {
    blockers.push(`Difficulty confidence is ${review.difficultyConfidence}.`);
  }
  if (review.requiresHumanReview) {
    blockers.push('Reviewer requires human review.');
  }

  const qualityScore = getQualityScore(draft);
  if (qualityScore !== null && qualityScore < QUALITY_PASS_SCORE) {
    blockers.push(`Quality score ${qualityScore} is below ${QUALITY_PASS_SCORE}.`);
  }

  const styleScore = getStyleScore(draft);
  if (styleScore !== null && styleScore < QUALITY_PASS_SCORE) {
    blockers.push(`Style score ${styleScore} is below ${QUALITY_PASS_SCORE}.`);
  }

  if (getDraftFlags(draft).some(flag => flag.severity === 'high')) {
    blockers.push('High-severity review flags must be fixed.');
  }

  return blockers.length > 0
    ? Array.from(new Set(blockers))
    : ['Only verified drafts can be published.'];
}

function buildPublishOverrideWarning(blockers, draftCount = 1) {
  const uniqueBlockers = Array.from(new Set(blockers)).filter(Boolean);
  return [
    draftCount === 1
      ? 'This existing-question draft is not verified for normal publishing.'
      : `${draftCount} selected existing-question drafts include at least one draft that is not verified for normal publishing.`,
    '',
    ...uniqueBlockers.slice(0, 8).map(blocker => `- ${blocker}`),
    uniqueBlockers.length > 8 ? `- ${uniqueBlockers.length - 8} more blocker(s)` : '',
    '',
    'Update the original question anyway with an admin override?',
  ].filter(line => line !== '').join('\n');
}

function buildEditableDraft(draft) {
  return {
    id: draft.id,
    text: draft.text || '',
    options: Array.isArray(draft.options) && draft.options.length === 4
      ? [...draft.options]
      : ['', '', '', ''],
    correctAnswer: Number.isInteger(draft.correctAnswer) ? draft.correctAnswer : 0,
    explanation: draft.explanation || '',
    difficulty: draft.difficulty || 'medium',
    skillTags: Array.isArray(draft.skillTags) ? draft.skillTags.join(', ') : '',
  };
}

function buildDeleteWarning(questionIds, context = 'database') {
  const count = questionIds.length;
  return [
    `Delete ${count} question${count === 1 ? '' : 's'} from the ${context}?`,
    '',
    'This deletes the original question document from Firestore. This cannot be undone from this panel.',
  ].join('\n');
}

export default function AdminQuestionAudit() {
  const navigate = useNavigate();
  const { allSubcategories, loading: subcategoriesLoading } = useSubcategories();

  const subcategoryOptions = useMemo(() => {
    const source = allSubcategories?.length ? allSubcategories : getSubcategoriesArray();
    return source
      .map(subcategory => {
        const idSource = subcategory.id ?? subcategory.value ?? subcategory.name;
        const value = getKebabCaseFromAnyFormat(idSource) || getKebabCaseFromAnyFormat(subcategory.name);
        return {
          ...subcategory,
          value,
          label: subcategory.name || subcategory.label || value,
        };
      })
      .filter(subcategory => subcategory.value)
      .sort((left, right) => left.label.localeCompare(right.label));
  }, [allSubcategories]);

  const [subcategory, setSubcategory] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [quantity, setQuantity] = useState(10);
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  const [actionBusy, setActionBusy] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [candidateQuestions, setCandidateQuestions] = useState([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);
  const [runs, setRuns] = useState([]);
  const [currentRun, setCurrentRun] = useState(null);
  const [drafts, setDrafts] = useState([]);
  const [selectedDraftIds, setSelectedDraftIds] = useState([]);
  const [editingDraft, setEditingDraft] = useState(null);

  useEffect(() => {
    if (!subcategory && subcategoryOptions.length > 0) {
      setSubcategory(subcategoryOptions[0].value);
    }
  }, [subcategory, subcategoryOptions]);

  const loadRuns = useCallback(async () => {
    try {
      const data = await getQuestionAuditRuns(20);
      setRuns(Array.isArray(data.runs) ? data.runs : []);
    } catch (loadError) {
      setError(loadError.message || 'Failed to load recent audit runs');
    }
  }, []);

  useEffect(() => {
    loadRuns();
  }, [loadRuns]);

  useEffect(() => {
    setCandidateQuestions([]);
    setSelectedQuestionIds([]);
  }, [subcategory, difficulty, quantity]);

  const loadCandidateQuestions = async (event) => {
    event.preventDefault();
    if (!subcategory) {
      setError('Select a subcategory');
      return;
    }

    try {
      setIsLoadingCandidates(true);
      setError('');
      setNotice('');
      setSelectedQuestionIds([]);
      const data = await getQuestionAuditCandidates({
        subcategory,
        difficulty,
        limit: quantity,
      });
      const questions = Array.isArray(data.questions) ? data.questions : [];
      setCandidateQuestions(questions);
      setNotice(`Loaded ${questions.length} matching question(s). Select the ones you want to audit.`);
    } catch (loadError) {
      setError(loadError.message || 'Failed to load matching questions');
    } finally {
      setIsLoadingCandidates(false);
    }
  };

  const toggleQuestionSelection = (questionId) => {
    setSelectedQuestionIds(previousIds => (
      previousIds.includes(questionId)
        ? previousIds.filter(id => id !== questionId)
        : [...previousIds, questionId]
    ));
  };

  const toggleAllCandidateQuestions = () => {
    setSelectedQuestionIds(previousIds => (
      previousIds.length === candidateQuestions.length
        ? []
        : candidateQuestions.map(question => question.id)
    ));
  };

  const deleteCandidateQuestions = async (questionIds) => {
    const ids = Array.from(new Set(questionIds.filter(Boolean)));
    if (ids.length === 0) {
      setError('Select at least one question to delete');
      return;
    }
    if (!window.confirm(buildDeleteWarning(ids, 'question database'))) return;

    try {
      setActionBusy('delete-candidates');
      setError('');
      setNotice('');
      const data = await deleteQuestionAuditQuestions(ids);
      const deletedIds = Array.isArray(data.results)
        ? data.results.filter(result => result.success).map(result => result.questionId)
        : ids;
      setCandidateQuestions(previousQuestions =>
        previousQuestions.filter(question => !deletedIds.includes(question.id)),
      );
      setSelectedQuestionIds(previousIds => previousIds.filter(id => !deletedIds.includes(id)));
      setNotice(`Deleted ${deletedIds.length} question(s) from the database.`);
    } catch (deleteError) {
      setError(deleteError.message || 'Failed to delete questions');
    } finally {
      setActionBusy('');
    }
  };

  const startAudit = async () => {
    if (!subcategory) {
      setError('Select a subcategory');
      return;
    }
    if (selectedQuestionIds.length === 0) {
      setError('Select at least one question to audit');
      return;
    }

    try {
      setIsAuditing(true);
      setError('');
      setNotice('');
      setSelectedDraftIds([]);
      const data = await createQuestionAuditRun({
        subcategory,
        difficulty,
        questionIds: selectedQuestionIds,
      });
      setCurrentRun(data.run || null);
      setDrafts(Array.isArray(data.drafts) ? data.drafts : []);
      setNotice(`Audit completed for ${selectedQuestionIds.length} selected question(s). Review drafts before updating originals.`);
      await loadRuns();
    } catch (auditError) {
      setError(auditError.message || 'Failed to audit existing questions');
    } finally {
      setIsAuditing(false);
    }
  };

  const loadRun = async (runId) => {
    try {
      setActionBusy(`load-${runId}`);
      setError('');
      setNotice('');
      setSelectedDraftIds([]);
      const data = await getQuestionAuditRun(runId);
      setCurrentRun(data.run || null);
      setDrafts(Array.isArray(data.drafts) ? data.drafts : []);
      if (data.run?.subcategory) setSubcategory(data.run.subcategory);
      if (data.run?.difficulty) setDifficulty(data.run.difficulty);
      if (data.run?.quantity) setQuantity(data.run.quantity);
    } catch (loadError) {
      setError(loadError.message || 'Failed to load audit run');
    } finally {
      setActionBusy('');
    }
  };

  const replaceDraft = (updatedDraft) => {
    setDrafts(previousDrafts =>
      previousDrafts.map(draft => (draft.id === updatedDraft.id ? updatedDraft : draft)),
    );
  };

  const toggleDraftSelection = (draftId) => {
    setSelectedDraftIds(previousIds => (
      previousIds.includes(draftId)
        ? previousIds.filter(id => id !== draftId)
        : [...previousIds, draftId]
    ));
  };

  const verifyDraft = async (draftId) => {
    if (!currentRun?.id) return;

    try {
      setActionBusy(`verify-${draftId}`);
      setError('');
      setNotice('');
      const data = await verifyQuestionAuditDraft(currentRun.id, draftId);
      if (data.draft) replaceDraft(data.draft);
    } catch (verifyError) {
      setError(verifyError.message || 'Failed to verify audit draft');
    } finally {
      setActionBusy('');
    }
  };

  const reviseDraft = async (draftId) => {
    if (!currentRun?.id) return;

    try {
      setActionBusy(`revise-${draftId}`);
      setError('');
      setNotice('');
      const data = await reviseQuestionAuditDraft(currentRun.id, draftId);
      if (data.draft) replaceDraft(data.draft);
      setNotice('Audit draft revised with the review notices and rechecked.');
    } catch (reviseError) {
      setError(reviseError.message || 'Failed to revise audit draft');
    } finally {
      setActionBusy('');
    }
  };

  const removeDraft = async (draftId) => {
    if (!currentRun?.id) return;
    if (!window.confirm('Remove this question from the audit run? This will not delete the original question.')) return;

    try {
      setActionBusy(`delete-${draftId}`);
      setError('');
      await deleteQuestionAuditDraft(currentRun.id, draftId);
      setDrafts(previousDrafts => previousDrafts.filter(draft => draft.id !== draftId));
      setSelectedDraftIds(previousIds => previousIds.filter(id => id !== draftId));
    } catch (deleteError) {
      setError(deleteError.message || 'Failed to remove audit draft');
    } finally {
      setActionBusy('');
    }
  };

  const deleteOriginalQuestionsFromDrafts = async (draftIds) => {
    if (!currentRun?.id) return;
    const selectedDraftsForDelete = draftIds
      .map(draftId => drafts.find(draft => draft.id === draftId))
      .filter(draft => draft?.originalQuestionId && !isOriginalDeleted(draft));
    const questionIds = Array.from(new Set(selectedDraftsForDelete.map(draft => draft.originalQuestionId)));

    if (questionIds.length === 0) {
      setError('No selected audit drafts have an original question to delete');
      return;
    }
    if (!window.confirm(buildDeleteWarning(questionIds, 'question database'))) return;

    try {
      setActionBusy('delete-originals');
      setError('');
      setNotice('');
      const data = await deleteQuestionAuditQuestions(questionIds, {
        auditRunId: currentRun.id,
        draftIds,
      });
      const deletedIds = Array.isArray(data.results)
        ? data.results.filter(result => result.success).map(result => result.questionId)
        : questionIds;
      setDrafts(previousDrafts => previousDrafts.map(draft => (
        deletedIds.includes(draft.originalQuestionId)
          ? {
            ...draft,
            status: 'deleted_original',
            originalQuestionDeletedAt: new Date().toISOString(),
          }
          : draft
      )));
      setSelectedDraftIds(previousIds => previousIds.filter(id => !draftIds.includes(id)));
      setNotice(`Deleted ${deletedIds.length} original question(s) from the database.`);
    } catch (deleteError) {
      setError(deleteError.message || 'Failed to delete original questions');
    } finally {
      setActionBusy('');
    }
  };

  const saveDraftEdits = async () => {
    if (!currentRun?.id || !editingDraft) return;

    try {
      setActionBusy(`edit-${editingDraft.id}`);
      setError('');
      const payload = {
        text: editingDraft.text,
        options: editingDraft.options,
        correctAnswer: editingDraft.correctAnswer,
        explanation: editingDraft.explanation,
        difficulty: editingDraft.difficulty,
        skillTags: editingDraft.skillTags
          .split(',')
          .map(tag => tag.trim())
          .filter(Boolean),
      };
      const data = await updateQuestionAuditDraft(currentRun.id, editingDraft.id, payload);
      if (data.draft) replaceDraft(data.draft);
      setEditingDraft(null);
    } catch (saveError) {
      setError(saveError.message || 'Failed to save audit draft edits');
    } finally {
      setActionBusy('');
    }
  };

  const publishDraft = async (draftId) => {
    if (!currentRun?.id) return;
    const draft = drafts.find(candidate => candidate.id === draftId);
    if (isOriginalDeleted(draft)) {
      setError('This original question has already been deleted from the database.');
      return;
    }
    const override = !isDraftPublishable(draft);
    const blockers = override ? getDraftPublishBlockers(draft) : [];

    if (override && !window.confirm(buildPublishOverrideWarning(blockers, 1))) {
      return;
    }

    try {
      setActionBusy(`publish-${draftId}`);
      setError('');
      setNotice('');
      const data = await publishQuestionAuditDraft(
        currentRun.id,
        draftId,
        override
          ? {
            override: true,
            overrideReason: blockers.join(' '),
          }
          : {},
      );
      setNotice(data.override
        ? `Updated original question ${data.questionId} with admin override.`
        : `Updated original question ${data.questionId}`);
      await loadRun(currentRun.id);
    } catch (publishError) {
      const apiBlockers = Array.isArray(publishError.blockers) && publishError.blockers.length
        ? ` ${publishError.blockers.join(' ')}`
        : '';
      setError(`${publishError.message || 'Failed to publish audit draft'}${apiBlockers}`);
    } finally {
      setActionBusy('');
    }
  };

  const selectedDrafts = selectedDraftIds
    .map(id => drafts.find(draft => draft.id === id))
    .filter(Boolean);
  const selectedRequiresOverride = selectedDrafts.some(draft => !isDraftPublishable(draft));

  const publishSelected = async () => {
    if (!currentRun?.id || selectedDraftIds.length === 0) return;

    const deletedSelectedCount = selectedDrafts.filter(isOriginalDeleted).length;
    if (deletedSelectedCount > 0) {
      setError('One or more selected drafts point to original questions that were already deleted. Clear those selections before publishing.');
      return;
    }

    const overrideBlockers = selectedRequiresOverride
      ? selectedDrafts.flatMap(draft => (isDraftPublishable(draft) ? [] : getDraftPublishBlockers(draft)))
      : [];

    if (selectedRequiresOverride && !window.confirm(buildPublishOverrideWarning(overrideBlockers, selectedDraftIds.length))) {
      return;
    }

    try {
      setActionBusy('publish-selected');
      setError('');
      setNotice('');
      const data = await publishQuestionAuditDrafts(
        currentRun.id,
        selectedDraftIds,
        selectedRequiresOverride
          ? {
            override: true,
            overrideReason: Array.from(new Set(overrideBlockers)).join(' '),
          }
          : {},
      );
      const successCount = Array.isArray(data.results)
        ? data.results.filter(result => result.success).length
        : 0;
      const failedCount = Array.isArray(data.results)
        ? data.results.filter(result => !result.success).length
        : 0;
      const overrideCount = Array.isArray(data.results)
        ? data.results.filter(result => result.success && result.override).length
        : 0;
      setNotice(
        `Updated ${successCount} original question(s).`
          + `${overrideCount ? ` ${overrideCount} used admin override.` : ''}`
          + `${failedCount ? ` ${failedCount} failed.` : ''}`,
      );
      await loadRun(currentRun.id);
      setSelectedDraftIds([]);
    } catch (publishError) {
      setError(publishError.message || 'Failed to publish selected audit drafts');
    } finally {
      setActionBusy('');
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div className="header-left">
          <button className="back-button" onClick={() => navigate('/admin')}>
            &larr; Back to Admin
          </button>
        </div>
        <h1>Existing Question Audit</h1>
        <div className="header-right" />
      </div>

      <div className="admin-page-content question-creation-page">
        {error && <div className="error-message">{error}</div>}
        {notice && <div className="success-message">{notice}</div>}

        <section className="creation-panel">
          <form className="generation-form" onSubmit={loadCandidateQuestions}>
            <div className="field-group">
              <label htmlFor="audit-subcategory">Subcategory</label>
              <select
                id="audit-subcategory"
                value={subcategory}
                onChange={(event) => setSubcategory(event.target.value)}
                disabled={subcategoriesLoading || isAuditing || isLoadingCandidates}
              >
                {subcategoryOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="field-group">
              <label>Difficulty</label>
              <div className="segmented-control" role="group" aria-label="Difficulty">
                {DIFFICULTIES.map(level => (
                  <button
                    key={level}
                    type="button"
                    className={difficulty === level ? 'active' : ''}
                    onClick={() => setDifficulty(level)}
                    disabled={isAuditing || isLoadingCandidates}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div className="field-group compact-field">
              <label htmlFor="audit-quantity">Questions</label>
              <input
                id="audit-quantity"
                type="number"
                min="1"
                max="50"
                value={quantity}
                onChange={(event) => setQuantity(Number.parseInt(event.target.value, 10) || 1)}
                disabled={isAuditing || isLoadingCandidates}
              />
            </div>

            <div className="generation-actions">
              <button
                type="submit"
                className="button-secondary"
                disabled={isAuditing || isLoadingCandidates || !subcategory}
              >
                {isLoadingCandidates ? 'Loading...' : 'Load Questions'}
              </button>
              <button
                type="button"
                className="button-primary"
                onClick={startAudit}
                disabled={isAuditing || selectedQuestionIds.length === 0}
              >
                {isAuditing ? 'Auditing...' : `Audit Selected (${selectedQuestionIds.length})`}
              </button>
            </div>
          </form>
        </section>

        {candidateQuestions.length > 0 && (
          <section className="drafts-panel candidate-panel">
            <div className="panel-header drafts-header">
              <div>
                <h2>Matching Questions</h2>
                <div className="run-context">
                  {candidateQuestions.length} loaded / {selectedQuestionIds.length} selected
                </div>
              </div>
              <div className="draft-actions">
                <button
                  className="button-secondary"
                  onClick={toggleAllCandidateQuestions}
                  disabled={isAuditing}
                >
                  {selectedQuestionIds.length === candidateQuestions.length ? 'Clear Selection' : 'Select All'}
                </button>
                <button
                  className="button-danger"
                  onClick={() => deleteCandidateQuestions(selectedQuestionIds)}
                  disabled={selectedQuestionIds.length === 0 || Boolean(actionBusy)}
                >
                  Delete Selected ({selectedQuestionIds.length})
                </button>
                <button
                  className="button-primary"
                  onClick={startAudit}
                  disabled={isAuditing || selectedQuestionIds.length === 0}
                >
                  {isAuditing ? 'Auditing...' : `Audit Selected (${selectedQuestionIds.length})`}
                </button>
              </div>
            </div>

            <div className="draft-list">
              {candidateQuestions.map(question => {
                const selected = selectedQuestionIds.includes(question.id);
                const correctAnswerIndex = getCorrectAnswerIndex(question);
                return (
                  <article key={question.id} className="draft-card candidate-card">
                    <div className="draft-card-header">
                      <label className="draft-selector" title="Select this existing question for audit">
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => toggleQuestionSelection(question.id)}
                          aria-label="Select existing question for audit"
                        />
                        <span className="status-badge">Existing</span>
                      </label>
                      <div className="draft-meta">
                        <span>ID: {question.id}</span>
                        <span>Difficulty: {question.difficulty || '-'}</span>
                        <span>Usage: {question.usageContext || '-'}</span>
                        <span>Source: {question.source || '-'}</span>
                      </div>
                    </div>

                    <div className="draft-question-text">{question.text}</div>

                    <ol className="draft-options" type="A">
                      {(question.options || []).map((option, index) => (
                        <li
                          key={`${question.id}-${index}`}
                          className={index === correctAnswerIndex ? 'correct-option' : ''}
                        >
                          {option}
                        </li>
                      ))}
                    </ol>

                    {question.explanation && (
                      <div className="draft-explanation">
                        <strong>Explanation:</strong> {question.explanation}
                      </div>
                    )}

                    <div className="draft-card-actions">
                      <button
                        className="button-danger"
                        onClick={() => deleteCandidateQuestions([question.id])}
                        disabled={Boolean(actionBusy)}
                      >
                        Delete Question
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        <div className="creation-layout">
          <aside className="runs-panel">
            <div className="panel-header">
              <h2>Recent Audits</h2>
              <button className="button-secondary small-button" onClick={loadRuns}>
                Refresh
              </button>
            </div>
            {runs.length === 0 ? (
              <div className="empty-state">No audit runs yet.</div>
            ) : (
              <div className="runs-list">
                {runs.map(run => (
                  <button
                    key={run.id}
                    className={`run-row ${currentRun?.id === run.id ? 'active' : ''}`}
                    onClick={() => loadRun(run.id)}
                    disabled={actionBusy === `load-${run.id}`}
                  >
                    <span className="run-title">{run.subcategoryDisplayName || run.subcategory}</span>
                    <span className="run-meta">
                      {run.difficulty} / {run.sourceQuestionCount ?? run.quantity} / {formatStatus(run.status)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </aside>

          <main className="drafts-panel">
            <div className="panel-header drafts-header">
              <div>
                <h2>Audit Review</h2>
                {currentRun && (
                  <div className="run-context">
                    {currentRun.subcategoryDisplayName || currentRun.subcategory} / {currentRun.difficulty} / {currentRun.sourceQuestionCount ?? currentRun.quantity}
                  </div>
                )}
              </div>
              <div className="draft-actions">
                <button
                  className="button-danger"
                  onClick={() => deleteOriginalQuestionsFromDrafts(selectedDraftIds)}
                  disabled={selectedDraftIds.length === 0 || Boolean(actionBusy)}
                >
                  Delete Selected Originals ({selectedDraftIds.length})
                </button>
                <button
                  className="button-primary"
                  onClick={publishSelected}
                  disabled={selectedDraftIds.length === 0 || actionBusy === 'publish-selected'}
                >
                  {actionBusy === 'publish-selected'
                    ? 'Publishing...'
                    : `${selectedRequiresOverride ? 'Publish Anyway Selected' : 'Publish Selected'} (${selectedDraftIds.length})`}
                </button>
              </div>
            </div>

            {!currentRun ? (
              <div className="empty-state large">Start or open an audit run to review existing questions.</div>
            ) : drafts.length === 0 ? (
              <div className="empty-state large">No existing questions matched this audit.</div>
            ) : (
              <div className="draft-list">
                {drafts.map(draft => {
                  const flags = getDraftFlags(draft);
                  const deterministicErrors = draft.validation?.deterministic?.errors || [];
                  const deterministicWarnings = draft.validation?.deterministic?.warnings || [];
                  const qualityScore = getQualityScore(draft);
                  const styleScore = getStyleScore(draft);
                  const selected = selectedDraftIds.includes(draft.id);
                  const publishable = isDraftPublishable(draft);
                  const originalDeleted = isOriginalDeleted(draft);
                  const publishBlockers = publishable ? [] : getDraftPublishBlockers(draft);
                  const publishBlockerText = publishBlockers.slice(0, 3).join(' ');

                  return (
                    <article key={draft.id} className={`draft-card status-${draft.status}`}>
                      <div className="draft-card-header">
                        <label
                          className="draft-selector"
                          title={publishable ? 'Select this verified audit draft' : 'Select this audit draft. Publishing will require confirmation.'}
                        >
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => toggleDraftSelection(draft.id)}
                            aria-label={`Select ${formatStatus(draft.status)} audit draft`}
                          />
                          <span className={`status-badge ${draft.status}`}>{formatStatus(draft.status)}</span>
                        </label>
                        <div className="draft-meta">
                          <span>Original: {draft.originalQuestionId || '-'}</span>
                          <span>Quality: {qualityScore ?? '-'}</span>
                          <span>Style: {styleScore ?? '-'}</span>
                          <span>Calibrated: {draft.validation?.calibratedDifficulty || draft.calibratedDifficulty || '-'}</span>
                          <span>Answer Match: {draft.validation?.answerKeyMatches === true ? 'yes' : 'no'}</span>
                        </div>
                      </div>

                      <div className="draft-question-text">{draft.text}</div>

                      <ol className="draft-options" type="A">
                        {(draft.options || []).map((option, index) => (
                          <li
                            key={`${draft.id}-${index}`}
                            className={index === draft.correctAnswer ? 'correct-option' : ''}
                          >
                            {option}
                          </li>
                        ))}
                      </ol>

                      {draft.explanation && (
                        <div className="draft-explanation">
                          <strong>Explanation:</strong> {draft.explanation}
                        </div>
                      )}

                      {(deterministicErrors.length > 0 || deterministicWarnings.length > 0 || flags.length > 0 || publishBlockerText) && (
                        <div className="draft-issues">
                          {publishBlockerText && (
                            <div className="issue-line publish-blocker">Publish blocked: {publishBlockerText}</div>
                          )}
                          {deterministicErrors.map((issue, index) => (
                            <div key={`err-${index}`} className="issue-line error">Error: {issue}</div>
                          ))}
                          {deterministicWarnings.map((issue, index) => (
                            <div key={`warn-${index}`} className="issue-line warning">Warning: {issue}</div>
                          ))}
                          {flags.map((flag, index) => (
                            <div key={`flag-${index}`} className={`issue-line ${flag.severity || 'medium'}`}>
                              {flag.type}: {flag.description}
                              {flag.fixSuggestion ? ` Fix: ${flag.fixSuggestion}` : ''}
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="draft-card-actions">
                        <button
                          className="button-secondary"
                          onClick={() => setEditingDraft(buildEditableDraft(draft))}
                          disabled={Boolean(actionBusy)}
                        >
                          Edit
                        </button>
                        <button
                          className="button-secondary"
                          onClick={() => reviseDraft(draft.id)}
                          disabled={Boolean(actionBusy) || draft.status === 'published'}
                        >
                          {actionBusy === `revise-${draft.id}` ? 'Revising...' : 'Revise with AI'}
                        </button>
                        <button
                          className="button-secondary"
                          onClick={() => verifyDraft(draft.id)}
                          disabled={Boolean(actionBusy)}
                        >
                          {actionBusy === `verify-${draft.id}` ? 'Verifying...' : 'Rerun Verification'}
                        </button>
                        <button
                          className="button-danger"
                          onClick={() => removeDraft(draft.id)}
                          disabled={Boolean(actionBusy)}
                        >
                          Remove
                        </button>
                        <button
                          className="button-danger"
                          onClick={() => deleteOriginalQuestionsFromDrafts([draft.id])}
                          disabled={Boolean(actionBusy) || originalDeleted}
                        >
                          Delete Original
                        </button>
                        <button
                          className="button-primary"
                          onClick={() => publishDraft(draft.id)}
                          title={publishable ? 'Update the original question' : getDraftPublishBlockers(draft).join(' ')}
                          disabled={draft.status === 'published' || originalDeleted || Boolean(actionBusy)}
                        >
                          {actionBusy === `publish-${draft.id}` ? 'Publishing...' : publishable ? 'Publish' : 'Publish Anyway'}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>

      {editingDraft && (
        <div className="modal-overlay" onClick={() => setEditingDraft(null)}>
          <div className="modal edit-draft-modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Audit Draft</h3>
              <button className="icon-button" onClick={() => setEditingDraft(null)}>x</button>
            </div>
            <div className="modal-body edit-draft-form">
              <label>
                Question Text
                <textarea
                  value={editingDraft.text}
                  onChange={(event) => setEditingDraft(previous => ({ ...previous, text: event.target.value }))}
                  rows={8}
                />
              </label>

              <div className="edit-options">
                {editingDraft.options.map((option, index) => (
                  <label key={index} className="edit-option-row">
                    <input
                      type="radio"
                      checked={editingDraft.correctAnswer === index}
                      onChange={() => setEditingDraft(previous => ({ ...previous, correctAnswer: index }))}
                    />
                    <span>{String.fromCharCode(65 + index)}</span>
                    <textarea
                      value={option}
                      onChange={(event) => {
                        const nextOptions = [...editingDraft.options];
                        nextOptions[index] = event.target.value;
                        setEditingDraft(previous => ({ ...previous, options: nextOptions }));
                      }}
                      rows={2}
                    />
                  </label>
                ))}
              </div>

              <label>
                Explanation
                <textarea
                  value={editingDraft.explanation}
                  onChange={(event) => setEditingDraft(previous => ({ ...previous, explanation: event.target.value }))}
                  rows={5}
                />
              </label>

              <div className="edit-row">
                <label>
                  Difficulty
                  <select
                    value={editingDraft.difficulty}
                    onChange={(event) => setEditingDraft(previous => ({ ...previous, difficulty: event.target.value }))}
                  >
                    {DIFFICULTIES.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Skill Tags
                  <input
                    type="text"
                    value={editingDraft.skillTags}
                    onChange={(event) => setEditingDraft(previous => ({ ...previous, skillTags: event.target.value }))}
                  />
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <button className="button-secondary" onClick={() => setEditingDraft(null)}>
                Cancel
              </button>
              <button className="button-primary" onClick={saveDraftEdits} disabled={Boolean(actionBusy)}>
                {actionBusy === `edit-${editingDraft.id}` ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
