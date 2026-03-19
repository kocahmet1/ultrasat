import React, { useMemo, useState, useEffect } from 'react';
import Modal from './Modal';
import '../styles/GuestMetaQuizModal.css';

/**
 * GuestMetaQuizModal
 * A polished, modern builder for creating a mini test (meta quiz) for guests.
 */
const TABS = [
  { key: 'all', label: 'All' },
  { key: 'reading', label: 'Reading & Writing' },
  { key: 'math', label: 'Math' },
];

const LEVELS = [
  { value: 1, label: 'Easy' },
  { value: 2, label: 'Medium' },
  { value: 3, label: 'Hard' },
];

const GuestMetaQuizModal = ({
  isOpen,
  onClose,
  readingSubcategories = [],
  mathSubcategories = [],
  selectedSubcats = [],
  setSelectedSubcats,
  onToggleSubcat, // optional convenience; if provided we'll use it for toggling single items
  metaLevel,
  setMetaLevel,
  questionCount,
  setQuestionCount,
  onCreate,
  creating = false,
  error,
}) => {
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');

  // Reset internal UI state when opening/closing
  useEffect(() => {
    if (isOpen) {
      setActiveTab('all');
      setSearch('');
    }
  }, [isOpen]);

  const allSubcategories = useMemo(() => (
    [
      ...readingSubcategories.map(s => ({ ...s, section: 'reading' })),
      ...mathSubcategories.map(s => ({ ...s, section: 'math' })),
    ]
  ), [readingSubcategories, mathSubcategories]);

  const filteredSubcategories = useMemo(() => {
    const base = activeTab === 'reading' ? readingSubcategories
      : activeTab === 'math' ? mathSubcategories
      : allSubcategories;

    if (!search.trim()) return base;
    const s = search.trim().toLowerCase();
    return base.filter(x => String(x.name || '').toLowerCase().includes(s));
  }, [activeTab, search, readingSubcategories, mathSubcategories, allSubcategories]);

  // Lookup maps and selected items detail
  const byId = useMemo(() => {
    const map = new Map();
    allSubcategories.forEach(s => map.set(s.id, s));
    return map;
  }, [allSubcategories]);

  const selectedItems = useMemo(() => {
    return (selectedSubcats || []).map(id => byId.get(id)).filter(Boolean);
  }, [selectedSubcats, byId]);

  const handleToggle = (id) => {
    if (onToggleSubcat) return onToggleSubcat(id);
    if (!setSelectedSubcats) return;
    setSelectedSubcats(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const selectAllReading = () => {
    if (!setSelectedSubcats) return;
    const ids = Array.from(new Set([ ...selectedSubcats, ...readingSubcategories.map(s => s.id) ]));
    setSelectedSubcats(ids);
    setActiveTab('reading');
  };

  const selectAllMath = () => {
    if (!setSelectedSubcats) return;
    const ids = Array.from(new Set([ ...selectedSubcats, ...mathSubcategories.map(s => s.id) ]));
    setSelectedSubcats(ids);
    setActiveTab('math');
  };

  const clearAll = () => {
    if (!setSelectedSubcats) return;
    setSelectedSubcats([]);
  };

  // Presets
  const applyPreset = (preset) => {
    if (!setSelectedSubcats) return;
    switch (preset) {
      case 'balanced10': {
        const r = readingSubcategories.slice(0, 4).map(s => s.id);
        const m = mathSubcategories.slice(0, 4).map(s => s.id);
        setSelectedSubcats(Array.from(new Set([...r, ...m])));
        setMetaLevel?.(2);
        setQuestionCount?.(10);
        setActiveTab('all');
        break;
      }
      case 'reading10': {
        const r = readingSubcategories.slice(0, 8).map(s => s.id);
        setSelectedSubcats(Array.from(new Set(r)));
        setMetaLevel?.(2);
        setQuestionCount?.(10);
        setActiveTab('reading');
        break;
      }
      case 'math10': {
        const m = mathSubcategories.slice(0, 8).map(s => s.id);
        setSelectedSubcats(Array.from(new Set(m)));
        setMetaLevel?.(2);
        setQuestionCount?.(10);
        setActiveTab('math');
        break;
      }
      default:
        break;
    }
  };

  const estimatedMinutes = useMemo(() => {
    const q = Number.isFinite(questionCount) ? questionCount : 5;
    // Roughly 75 seconds per question average across sections
    const mins = Math.max(1, Math.round(q * 1.25));
    return mins;
  }, [questionCount]);

  const canCreate = !creating && selectedSubcats.length > 0 && questionCount >= 1;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Mini Test" size="large" className="guest-meta-modal">
      <div className="gmm-layout">
        <div className="gmm-left">
          <div className="gmm-left-header">
            <h4 className="gmm-section-title">Select Subcategories</h4>
            <div className="gmm-controls-row">
              <div className="gmm-tabs" role="tablist">
                {TABS.map(t => (
                  <button
                    key={t.key}
                    role="tab"
                    aria-selected={activeTab === t.key}
                    className={activeTab === t.key ? 'tab active' : 'tab'}
                    onClick={() => setActiveTab(t.key)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <div className="gmm-search">
                <input
                  type="text"
                  placeholder="Search topics..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  aria-label="Search subcategories"
                />
              </div>
            </div>
          </div>

          <div className="gmm-chip-grid">
            {filteredSubcategories.map(sc => {
              const checked = selectedSubcats.includes(sc.id);
              const sectionClass = sc.section === 'math' ? 'chip--math' : 'chip--reading';
              return (
                <label key={sc.id} className={`${checked ? 'chip chip--selected' : 'chip'} ${sectionClass}`}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleToggle(sc.id)}
                    aria-label={sc.name}
                  />
                  <span className="chip-label">{sc.name}</span>
                </label>
              );
            })}
            {filteredSubcategories.length === 0 && (
              <div className="gmm-empty">No topics match your search.</div>
            )}
          </div>

          <div className="gmm-selection-bar">
            <div className="gmm-selection-info">
              <span className="bullet" />
              {selectedSubcats.length} selected
            </div>
            <div className="gmm-selection-actions">
              <button className="link" onClick={selectAllReading}>Select all R&W</button>
              <button className="link" onClick={selectAllMath}>Select all Math</button>
              <button className="link danger" onClick={clearAll}>Clear all</button>
            </div>
          </div>
        </div>

        <div className="gmm-right">
          <div className="gmm-card">
            <h4 className="gmm-section-title">Your selection</h4>
            {selectedItems.length > 0 ? (
              <div className="gmm-selected-chips">
                {selectedItems.map(item => (
                  <span key={item.id} className={`sel-chip ${item.section === 'math' ? 'sel-chip--math' : 'sel-chip--reading'}`}>
                    {item.name}
                    <button aria-label={`Remove ${item.name}`} className="remove" onClick={() => handleToggle(item.id)}>×</button>
                  </span>
                ))}
              </div>
            ) : (
              <div className="gmm-empty">No topics selected yet.</div>
            )}
          </div>

          <div className="gmm-card">
            <h4 className="gmm-section-title">Quick presets</h4>
            <div className="gmm-presets">
              <button className="preset" onClick={() => applyPreset('balanced10')}>Balanced (10)</button>
              <button className="preset" onClick={() => applyPreset('reading10')}>R&W Focus (10)</button>
              <button className="preset" onClick={() => applyPreset('math10')}>Math Focus (10)</button>
            </div>
          </div>

          <div className="gmm-card">
            <h4 className="gmm-section-title">Difficulty</h4>
            <div className="gmm-segmented">
              {LEVELS.map(l => (
                <button
                  key={l.value}
                  className={metaLevel === l.value ? 'seg active' : 'seg'}
                  onClick={() => setMetaLevel(l.value)}
                  aria-pressed={metaLevel === l.value}
                >
                  <span className="seg-dot" />
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          <div className="gmm-card">
            <h4 className="gmm-section-title">Number of Questions</h4>
            <div className="gmm-slider-row">
              <input
                type="range"
                min={1}
                max={30}
                value={Number.isFinite(questionCount) ? questionCount : 5}
                onChange={e => setQuestionCount(parseInt(e.target.value, 10))}
              />
              <input
                className="gmm-number"
                type="number"
                min={1}
                max={30}
                value={Number.isFinite(questionCount) ? questionCount : 5}
                onChange={e => {
                  const val = Math.max(1, Math.min(30, parseInt(e.target.value || '1', 10)));
                  setQuestionCount(val);
                }}
              />
            </div>
            <div className="gmm-hint">Approx {estimatedMinutes} min • up to 30 questions</div>
          </div>

          {!!error && <div className="gmm-error" role="alert">{error}</div>}

          <div className="gmm-actions">
            <button className="btn btn--ghost" onClick={onClose} disabled={creating}>Cancel</button>
            <button className="btn btn--primary" onClick={onCreate} disabled={!canCreate}>
              {creating ? 'Creating…' : `Create Test (${Math.max(1, Number(questionCount || 0))})`}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default GuestMetaQuizModal;
