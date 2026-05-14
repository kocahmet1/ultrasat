import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  createQuestionGenerationRun,
  deleteGeneratedDraft,
  getQuestionGenerationPromptPreview,
  getQuestionGenerationRun,
  getQuestionGenerationRuns,
  publishGeneratedDraft,
  publishGeneratedDrafts,
  updateGeneratedDraft,
  verifyGeneratedDraft,
} from '../api/questionGenerationClient';
import { useSubcategories } from '../contexts/SubcategoryContext';
import {
  getKebabCaseFromAnyFormat,
  getSubcategoriesArray,
} from '../utils/subcategoryConstants';
import '../styles/AdminPages.css';
import '../styles/AdminQuestionCreation.css';

const DIFFICULTIES = ['easy', 'medium', 'hard'];

function formatStatus(status) {
  return String(status || 'unknown').replace(/_/g, ' ');
}

function getDraftFlags(draft) {
  return [
    ...(Array.isArray(draft?.validation?.flags) ? draft.validation.flags : []),
    ...(Array.isArray(draft?.validation?.review?.flags) ? draft.validation.review.flags : []),
  ];
}

function getQualityScore(draft) {
  return draft?.validation?.review?.qualityScore ?? null;
}

function getStyleScore(draft) {
  return draft?.validation?.review?.collegeBoardStyleScore ?? null;
}

function isDraftPublishable(draft) {
  return draft?.status === 'verified';
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

export default function AdminQuestionCreation() {
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
          section: subcategory.section || '',
          category: subcategory.category || '',
        };
      })
      .filter(subcategory => subcategory.value)
      .sort((left, right) => left.label.localeCompare(right.label));
  }, [allSubcategories]);

  const [subcategory, setSubcategory] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [quantity, setQuantity] = useState(5);
  const [promptText, setPromptText] = useState('');
  const [promptDirty, setPromptDirty] = useState(false);
  const [promptModalOpen, setPromptModalOpen] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isPromptLoading, setIsPromptLoading] = useState(false);
  const [actionBusy, setActionBusy] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

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
      const data = await getQuestionGenerationRuns(20);
      setRuns(Array.isArray(data.runs) ? data.runs : []);
    } catch (loadError) {
      setError(loadError.message || 'Failed to load recent runs');
    }
  }, []);

  useEffect(() => {
    loadRuns();
  }, [loadRuns]);

  useEffect(() => {
    setPromptText('');
    setPromptDirty(false);
  }, [subcategory, difficulty, quantity]);

  const loadPromptPreview = async () => {
    if (!subcategory) {
      setError('Select a subcategory first');
      return '';
    }

    try {
      setIsPromptLoading(true);
      setError('');
      const data = await getQuestionGenerationPromptPreview({
        subcategory,
        difficulty,
        quantity,
      });
      setPromptText(data.prompt || '');
      setPromptDirty(false);
      return data.prompt || '';
    } catch (previewError) {
      setError(previewError.message || 'Failed to load prompt preview');
      return '';
    } finally {
      setIsPromptLoading(false);
    }
  };

  const openPromptModal = async () => {
    if (!promptText) {
      await loadPromptPreview();
    }
    setPromptModalOpen(true);
  };

  const resetPrompt = async () => {
    await loadPromptPreview();
  };

  const generateQuestions = async (event) => {
    event.preventDefault();
    if (!subcategory) {
      setError('Select a subcategory');
      return;
    }

    try {
      setIsGenerating(true);
      setError('');
      setNotice('');
      setSelectedDraftIds([]);

      const payload = {
        subcategory,
        difficulty,
        quantity,
      };

      if (promptDirty && promptText.trim()) {
        payload.promptOverride = promptText.trim();
      }

      const data = await createQuestionGenerationRun(payload);
      setCurrentRun(data.run || null);
      setDrafts(Array.isArray(data.drafts) ? data.drafts : []);
      setNotice('Generation completed. Review verified drafts before publishing.');
      await loadRuns();
    } catch (generationError) {
      setError(generationError.message || 'Failed to generate questions');
    } finally {
      setIsGenerating(false);
    }
  };

  const loadRun = async (runId) => {
    try {
      setActionBusy(`load-${runId}`);
      setError('');
      setNotice('');
      setSelectedDraftIds([]);
      const data = await getQuestionGenerationRun(runId);
      setCurrentRun(data.run || null);
      setDrafts(Array.isArray(data.drafts) ? data.drafts : []);
      if (data.run?.subcategory) setSubcategory(data.run.subcategory);
      if (data.run?.difficulty) setDifficulty(data.run.difficulty);
      if (data.run?.quantity) setQuantity(data.run.quantity);
      if (data.run?.prompt) setPromptText(data.run.prompt);
      setPromptDirty(false);
    } catch (loadError) {
      setError(loadError.message || 'Failed to load generation run');
    } finally {
      setActionBusy('');
    }
  };

  const replaceDraft = (updatedDraft) => {
    setDrafts(previousDrafts =>
      previousDrafts.map(draft => (draft.id === updatedDraft.id ? updatedDraft : draft)),
    );
  };

  const removeDraft = async (draftId) => {
    if (!currentRun?.id) return;
    if (!window.confirm('Delete this draft question?')) return;

    try {
      setActionBusy(`delete-${draftId}`);
      setError('');
      await deleteGeneratedDraft(currentRun.id, draftId);
      setDrafts(previousDrafts => previousDrafts.filter(draft => draft.id !== draftId));
      setSelectedDraftIds(previousIds => previousIds.filter(id => id !== draftId));
    } catch (deleteError) {
      setError(deleteError.message || 'Failed to delete draft');
    } finally {
      setActionBusy('');
    }
  };

  const verifyDraft = async (draftId) => {
    if (!currentRun?.id) return;

    try {
      setActionBusy(`verify-${draftId}`);
      setError('');
      setNotice('');
      const data = await verifyGeneratedDraft(currentRun.id, draftId);
      if (data.draft) replaceDraft(data.draft);
    } catch (verifyError) {
      setError(verifyError.message || 'Failed to verify draft');
    } finally {
      setActionBusy('');
    }
  };

  const publishDraft = async (draftId) => {
    if (!currentRun?.id) return;

    try {
      setActionBusy(`publish-${draftId}`);
      setError('');
      setNotice('');
      const data = await publishGeneratedDraft(currentRun.id, draftId);
      setNotice(`Published question ${data.questionId}`);
      await loadRun(currentRun.id);
    } catch (publishError) {
      setError(publishError.message || 'Failed to publish draft');
    } finally {
      setActionBusy('');
    }
  };

  const publishSelected = async () => {
    if (!currentRun?.id || selectedDraftIds.length === 0) return;

    try {
      setActionBusy('publish-selected');
      setError('');
      setNotice('');
      const data = await publishGeneratedDrafts(currentRun.id, selectedDraftIds);
      const successCount = Array.isArray(data.results)
        ? data.results.filter(result => result.success).length
        : 0;
      const failedCount = Array.isArray(data.results)
        ? data.results.filter(result => !result.success).length
        : 0;
      setNotice(`Published ${successCount} draft(s).${failedCount ? ` ${failedCount} failed.` : ''}`);
      await loadRun(currentRun.id);
      setSelectedDraftIds([]);
    } catch (publishError) {
      setError(publishError.message || 'Failed to publish selected drafts');
    } finally {
      setActionBusy('');
    }
  };

  const toggleDraftSelection = (draftId) => {
    setSelectedDraftIds(previousIds => (
      previousIds.includes(draftId)
        ? previousIds.filter(id => id !== draftId)
        : [...previousIds, draftId]
    ));
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
      const data = await updateGeneratedDraft(currentRun.id, editingDraft.id, payload);
      if (data.draft) replaceDraft(data.draft);
      setEditingDraft(null);
    } catch (saveError) {
      setError(saveError.message || 'Failed to save draft edits');
    } finally {
      setActionBusy('');
    }
  };

  const publishableSelectedCount = selectedDraftIds
    .map(id => drafts.find(draft => draft.id === id))
    .filter(isDraftPublishable)
    .length;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div className="header-left">
          <button className="back-button" onClick={() => navigate('/admin')}>
            &larr; Back to Admin
          </button>
        </div>
        <h1>Question Creation</h1>
        <div className="header-right" />
      </div>

      <div className="admin-page-content question-creation-page">
        {error && <div className="error-message">{error}</div>}
        {notice && <div className="success-message">{notice}</div>}

        <section className="creation-panel">
          <form className="generation-form" onSubmit={generateQuestions}>
            <div className="field-group">
              <label htmlFor="subcategory">Subcategory</label>
              <select
                id="subcategory"
                value={subcategory}
                onChange={(event) => setSubcategory(event.target.value)}
                disabled={subcategoriesLoading || isGenerating}
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
                    disabled={isGenerating}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div className="field-group compact-field">
              <label htmlFor="quantity">Questions</label>
              <input
                id="quantity"
                type="number"
                min="1"
                max="20"
                value={quantity}
                onChange={(event) => setQuantity(Number.parseInt(event.target.value, 10) || 1)}
                disabled={isGenerating}
              />
            </div>

            <div className="generation-actions">
              <button
                type="button"
                className="button-secondary"
                onClick={openPromptModal}
                disabled={isGenerating || isPromptLoading}
              >
                {isPromptLoading ? 'Loading Prompt...' : 'View/Edit Prompt'}
              </button>
              <button
                type="submit"
                className="button-primary"
                disabled={isGenerating || !subcategory}
              >
                {isGenerating ? 'Generating...' : 'Generate Drafts'}
              </button>
            </div>
          </form>
        </section>

        <div className="creation-layout">
          <aside className="runs-panel">
            <div className="panel-header">
              <h2>Recent Runs</h2>
              <button className="button-secondary small-button" onClick={loadRuns}>
                Refresh
              </button>
            </div>
            {runs.length === 0 ? (
              <div className="empty-state">No generation runs yet.</div>
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
                      {run.difficulty} / {run.quantity} / {formatStatus(run.status)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </aside>

          <main className="drafts-panel">
            <div className="panel-header drafts-header">
              <div>
                <h2>Draft Review</h2>
                {currentRun && (
                  <div className="run-context">
                    {currentRun.subcategoryDisplayName || currentRun.subcategory} / {currentRun.difficulty} / {currentRun.quantity}
                  </div>
                )}
              </div>
              <div className="draft-actions">
                <button
                  className="button-primary"
                  onClick={publishSelected}
                  disabled={
                    selectedDraftIds.length === 0 ||
                    publishableSelectedCount !== selectedDraftIds.length ||
                    actionBusy === 'publish-selected'
                  }
                >
                  {actionBusy === 'publish-selected' ? 'Publishing...' : `Publish Selected (${selectedDraftIds.length})`}
                </button>
              </div>
            </div>

            {!currentRun ? (
              <div className="empty-state large">Create or open a run to review drafts.</div>
            ) : drafts.length === 0 ? (
              <div className="empty-state large">No drafts in this run.</div>
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

                  return (
                    <article key={draft.id} className={`draft-card status-${draft.status}`}>
                      <div className="draft-card-header">
                        <label className="draft-selector">
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => toggleDraftSelection(draft.id)}
                            disabled={!publishable}
                          />
                          <span className={`status-badge ${draft.status}`}>{formatStatus(draft.status)}</span>
                        </label>
                        <div className="draft-meta">
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

                      {(deterministicErrors.length > 0 || deterministicWarnings.length > 0 || flags.length > 0) && (
                        <div className="draft-issues">
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
                          Delete
                        </button>
                        <button
                          className="button-primary"
                          onClick={() => publishDraft(draft.id)}
                          disabled={!publishable || Boolean(actionBusy)}
                        >
                          {actionBusy === `publish-${draft.id}` ? 'Publishing...' : 'Publish'}
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

      {promptModalOpen && (
        <div className="modal-overlay" onClick={() => setPromptModalOpen(false)}>
          <div className="modal prompt-modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h3>Generation Prompt</h3>
              <button className="icon-button" onClick={() => setPromptModalOpen(false)}>x</button>
            </div>
            <div className="modal-body">
              <textarea
                className="prompt-editor"
                value={promptText}
                onChange={(event) => {
                  setPromptText(event.target.value);
                  setPromptDirty(true);
                }}
              />
            </div>
            <div className="modal-footer">
              <button className="button-secondary" onClick={resetPrompt} disabled={isPromptLoading}>
                Reset
              </button>
              <button className="button-primary" onClick={() => setPromptModalOpen(false)}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {editingDraft && (
        <div className="modal-overlay" onClick={() => setEditingDraft(null)}>
          <div className="modal edit-draft-modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Draft</h3>
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
