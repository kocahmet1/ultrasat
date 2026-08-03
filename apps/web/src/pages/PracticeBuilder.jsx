import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  collection,
  getCountFromServer,
  getDocs,
  limit,
  query,
  where,
} from 'firebase/firestore';
import {
  FiBookmark,
  FiCheck,
  FiChevronDown,
  FiChevronRight,
  FiClock,
  FiFileText,
  FiLayers,
  FiLock,
  FiMessageCircle,
  FiMinus,
  FiPlus,
  FiXCircle,
  FiZap,
} from 'react-icons/fi';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import {
  BUILDER_MAX_QUESTIONS,
  SMARTQUIZ_COLLECTION,
  createCustomSmartQuiz,
} from '../utils/smartQuizUtils';
import { DOMAINS, KEBAB_TO_NAME, getContentStructure } from '../utils/subcategoryTaxonomy';
import ProUpgradeModal from '../components/membership/ProUpgradeModal';
import './PracticeBuilder.css';

const FREE_MAX_QUESTIONS = 10;
const DEFAULT_COUNT = 10;

const SECTION_LABELS = {
  'reading-writing': 'Reading & Writing',
  math: 'Math',
};

const POOL_OPTIONS = [
  { id: 'unused', label: 'Unused', Icon: FiFileText, hint: 'Questions you have not seen yet', locked: false },
  { id: 'incorrect', label: 'Incorrect', Icon: FiXCircle, hint: 'Questions you last answered wrong', locked: true },
  { id: 'marked', label: 'Marked', Icon: FiBookmark, hint: 'Questions you saved for review', locked: true },
  { id: 'all', label: 'All', Icon: FiLayers, hint: 'The full question bank', locked: false },
];

const DIFFICULTY_OPTIONS = [
  { id: 'easy', label: 'Easy', chipClass: 'ut-chip--easy' },
  { id: 'medium', label: 'Medium', chipClass: 'ut-chip--medium' },
  { id: 'hard', label: 'Hard', chipClass: 'ut-chip--hard' },
];

const toMillis = (value) => {
  if (!value) return 0;
  if (typeof value.toDate === 'function') return value.toDate().getTime();
  if (value.seconds) return value.seconds * 1000;
  const parsed = new Date(value).getTime();
  return Number.isFinite(parsed) ? parsed : 0;
};

const clampCount = (value, isFree) => {
  const n = Math.round(Number(value));
  if (!Number.isFinite(n)) return DEFAULT_COUNT;
  const max = isFree ? FREE_MAX_QUESTIONS : BUILDER_MAX_QUESTIONS;
  return Math.max(1, Math.min(max, n));
};

const titleCaseFromKebab = (kebab) =>
  kebab.split('-').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

function PracticeBuilder() {
  const { currentUser, userMembership } = useAuth();
  const navigate = useNavigate();
  const isFree = !userMembership || userMembership.tier === 'free';

  // Practice config
  const [countRaw, setCountRaw] = useState(String(DEFAULT_COUNT));
  const [tutorMode, setTutorMode] = useState(true);
  const [timedMode, setTimedMode] = useState(false);
  const [pool, setPool] = useState('unused');
  const [difficulties, setDifficulties] = useState(() => new Set());
  const [topics, setTopics] = useState(() => new Set());
  const [expandedDomains, setExpandedDomains] = useState(() => new Set());

  // Derived pool data (one-time fetch, cached in state)
  const [poolLoading, setPoolLoading] = useState(true);
  const [poolData, setPoolData] = useState(null);
  const [subcatCounts, setSubcatCounts] = useState({});
  const [countingDomains, setCountingDomains] = useState(() => new Set());

  // Creation state
  const [creating, setCreating] = useState(null); // 'quick' | 'custom' | null
  const [createError, setCreateError] = useState('');
  const [errorSource, setErrorSource] = useState(null); // 'quick' | 'custom'
  const [createNote, setCreateNote] = useState('');

  // Pro gating
  const [showProModal, setShowProModal] = useState(false);
  const [proFeatureName, setProFeatureName] = useState('Custom practice pools');

  const structure = useMemo(() => getContentStructure(), []);
  const count = clampCount(countRaw, isFree);

  const openLock = useCallback((featureName) => {
    setProFeatureName(featureName);
    setShowProModal(true);
  }, []);

  // ---------------------------------------------------------------- counts --
  // Initial load: 2 document queries (the user's smartQuizzes + saved items)
  // and 4 aggregate count queries (bank total + one per difficulty).
  // Per-subcategory counts are fetched lazily when a domain is expanded.
  useEffect(() => {
    if (!currentUser) return undefined;
    let cancelled = false;

    const load = async () => {
      setPoolLoading(true);
      try {
        const questionsRef = collection(db, 'questions');
        const [quizSnap, savedSnap, totalSnap, easySnap, mediumSnap, hardSnap] = await Promise.all([
          getDocs(query(
            collection(db, SMARTQUIZ_COLLECTION),
            where('userId', '==', currentUser.uid),
            limit(300),
          )),
          getDocs(collection(db, 'users', currentUser.uid, 'studyPlanItems')),
          getCountFromServer(query(questionsRef)),
          getCountFromServer(query(questionsRef, where('difficulty', '==', 'easy'))),
          getCountFromServer(query(questionsRef, where('difficulty', '==', 'medium'))),
          getCountFromServer(query(questionsRef, where('difficulty', '==', 'hard'))),
        ]);

        // Replay stored answers oldest-first so the latest result wins.
        const quizzes = quizSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        quizzes.sort((a, b) =>
          toMillis(a.completedAt || a.createdAt) - toMillis(b.completedAt || b.createdAt));

        const seen = new Set();
        const lastResult = new Map();
        quizzes.forEach((quizDoc) => {
          const ids = quizDoc.questionIds
            || (Array.isArray(quizDoc.questions) ? quizDoc.questions.map((q) => q?.id) : []);
          (ids || []).forEach((id) => { if (id) seen.add(id); });
          Object.entries(quizDoc.userAnswers || {}).forEach(([qid, answer]) => {
            seen.add(qid);
            lastResult.set(qid, !!answer?.isCorrect);
          });
        });

        const incorrectIds = Array.from(lastResult.entries())
          .filter(([, wasCorrect]) => !wasCorrect)
          .map(([qid]) => qid);

        const markedIds = Array.from(new Set(
          savedSnap.docs
            .map((d) => d.data()?.questionId || d.id.split('_').slice(1).join('_'))
            .filter(Boolean),
        ));

        const totalQuestions = totalSnap.data().count;

        if (cancelled) return;
        setPoolData({
          seenIds: Array.from(seen),
          incorrectIds,
          markedIds,
          totalQuestions,
          unusedCount: Math.max(0, totalQuestions - seen.size),
          difficultyCounts: {
            easy: easySnap.data().count,
            medium: mediumSnap.data().count,
            hard: hardSnap.data().count,
          },
        });
      } catch (error) {
        console.error('[PracticeBuilder] Failed to derive question pools:', error);
        if (!cancelled) setPoolData(null);
      } finally {
        if (!cancelled) setPoolLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [currentUser]);

  // Lazy per-subcategory counts, one aggregate query per subcategory in the
  // expanded domain (plus a title-case retry only when the kebab count is 0).
  const loadDomainCounts = useCallback(async (domainId, subcategoryIds) => {
    const missing = subcategoryIds.filter((sc) => subcatCounts[sc] === undefined);
    if (missing.length === 0) return;
    setCountingDomains((prev) => new Set(prev).add(domainId));
    try {
      const entries = await Promise.all(missing.map(async (sc) => {
        try {
          const questionsRef = collection(db, 'questions');
          const base = await getCountFromServer(query(questionsRef, where('subcategory', '==', sc)));
          let total = base.data().count;
          if (total === 0) {
            const alt = await getCountFromServer(
              query(questionsRef, where('subcategory', '==', titleCaseFromKebab(sc))),
            );
            total = alt.data().count;
          }
          return [sc, total];
        } catch (error) {
          console.warn(`[PracticeBuilder] Count failed for ${sc}:`, error?.message);
          return [sc, null];
        }
      }));
      setSubcatCounts((prev) => ({ ...prev, ...Object.fromEntries(entries) }));
    } finally {
      setCountingDomains((prev) => {
        const next = new Set(prev);
        next.delete(domainId);
        return next;
      });
    }
  }, [subcatCounts]);

  const toggleDomainExpanded = (domainId, subcategoryIds) => {
    const willExpand = !expandedDomains.has(domainId);
    setExpandedDomains((prev) => {
      const next = new Set(prev);
      if (willExpand) next.add(domainId); else next.delete(domainId);
      return next;
    });
    if (willExpand) loadDomainCounts(domainId, subcategoryIds);
  };

  // --------------------------------------------------------------- config ---
  const commitCount = (value) => {
    const n = Math.round(Number(value));
    if (Number.isFinite(n) && isFree && n > FREE_MAX_QUESTIONS) {
      openLock('Larger practice sets');
      setCountRaw(String(FREE_MAX_QUESTIONS));
      return;
    }
    setCountRaw(String(clampCount(value, isFree)));
  };

  const stepCount = (delta) => commitCount(count + delta);

  const handlePoolSelect = (option) => {
    if (option.locked && isFree) {
      openLock('Custom practice pools');
      return;
    }
    setPool(option.id);
    setCreateError('');
  };

  const toggleDifficulty = (id) => {
    setDifficulties((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
    setCreateError('');
  };

  const toggleTopic = (id) => {
    setTopics((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
    setCreateError('');
  };

  const toggleDomainTopics = (subcategoryIds) => {
    setTopics((prev) => {
      const next = new Set(prev);
      const allSelected = subcategoryIds.every((sc) => next.has(sc));
      subcategoryIds.forEach((sc) => {
        if (allSelected) next.delete(sc); else next.add(sc);
      });
      return next;
    });
    setCreateError('');
  };

  // ------------------------------------------------------------- creation ---
  const startQuiz = (quizId, requestedCount, createdCount) => {
    if (createdCount < requestedCount) {
      setCreateNote(`Only ${createdCount} of ${requestedCount} requested questions matched - starting with those.`);
      setTimeout(() => navigate(`/smart-quiz/${quizId}`), 1600);
    } else {
      navigate(`/smart-quiz/${quizId}`);
    }
  };

  const baseConfig = () => ({
    questionCount: count,
    tutorMode,
    timerMode: timedMode ? 'timed' : 'untimed',
  });

  const handleQuickStart = async () => {
    if (!currentUser || creating) return;
    setCreating('quick');
    setCreateError('');
    setErrorSource(null);
    setCreateNote('');
    try {
      // Aim at the user's weakest skills; fall back to the whole bank.
      let weakest = [];
      try {
        const progressSnap = await getDocs(collection(db, 'users', currentUser.uid, 'progress'));
        weakest = progressSnap.docs
          .map((d) => {
            const data = d.data() || {};
            const results = data.last10QuestionResults || [];
            if (results.length === 0) return null;
            const accuracy = results.filter(Boolean).length / results.length;
            return { id: d.id, accuracy, level: data.level || 1 };
          })
          .filter(Boolean)
          .sort((a, b) => (a.accuracy - b.accuracy) || (a.level - b.level))
          .slice(0, 5)
          .map((p) => p.id);
      } catch (progressError) {
        console.warn('[PracticeBuilder] Could not rank weak skills:', progressError?.message);
      }

      const quickConfig = {
        ...baseConfig(),
        pool: 'unused',
        subcategoryIds: weakest,
        excludeQuestionIds: poolData?.seenIds,
      };

      let result;
      try {
        result = await createCustomSmartQuiz(currentUser.uid, quickConfig);
      } catch (firstError) {
        // Quick start has no user-set pool filter, so retrying with the full
        // bank (repeats allowed) is fair game here.
        result = await createCustomSmartQuiz(currentUser.uid, { ...baseConfig(), pool: 'all', subcategoryIds: weakest });
      }
      startQuiz(result.quizId, result.requestedCount, result.createdCount);
    } catch (error) {
      console.error('[PracticeBuilder] Quick start failed:', error);
      setCreateError(error?.message || 'Could not create a practice set. Please try again.');
      setErrorSource('quick');
      setCreating(null);
    }
  };

  const disabledReason = useMemo(() => {
    if (creating) return 'Building your practice set...';
    if (pool === 'incorrect') {
      if (poolLoading) return 'Counting your question pools...';
      if (!poolData || poolData.incorrectIds.length === 0) {
        return 'No incorrect questions yet - finish some practice first.';
      }
    }
    if (pool === 'marked') {
      if (poolLoading) return 'Counting your question pools...';
      if (!poolData || poolData.markedIds.length === 0) {
        return 'No saved questions yet - save questions while practicing.';
      }
    }
    if (pool === 'unused' && poolData && poolData.unusedCount === 0) {
      return 'You have seen every question - switch the pool to All or Incorrect.';
    }
    return null;
  }, [creating, pool, poolLoading, poolData]);

  const handleGenerate = async () => {
    if (!currentUser || disabledReason) return;
    setCreating('custom');
    setCreateError('');
    setErrorSource(null);
    setCreateNote('');
    try {
      const config = {
        ...baseConfig(),
        pool,
        difficulties: Array.from(difficulties),
        subcategoryIds: Array.from(topics),
      };
      if (pool === 'unused') config.excludeQuestionIds = poolData?.seenIds;
      if (pool === 'incorrect') config.restrictToQuestionIds = poolData?.incorrectIds || [];
      if (pool === 'marked') config.restrictToQuestionIds = poolData?.markedIds || [];

      const result = await createCustomSmartQuiz(currentUser.uid, config);
      startQuiz(result.quizId, result.requestedCount, result.createdCount);
    } catch (error) {
      console.error('[PracticeBuilder] Generate failed:', error);
      setCreateError(error?.message || 'Could not create a practice set. Please try again.');
      setErrorSource('custom');
      setCreating(null);
    }
  };

  // -------------------------------------------------------------- display ---
  const poolCountFor = (id) => {
    if (!poolData) return null;
    if (id === 'unused') return poolData.unusedCount;
    if (id === 'incorrect') return poolData.incorrectIds.length;
    if (id === 'marked') return poolData.markedIds.length;
    return poolData.totalQuestions;
  };

  const summaryLine = useMemo(() => {
    const poolLabel = POOL_OPTIONS.find((p) => p.id === pool)?.label || 'All';
    const difficultyLabel = difficulties.size === 0
      ? 'Any difficulty'
      : DIFFICULTY_OPTIONS.filter((d) => difficulties.has(d.id)).map((d) => d.label).join(' + ');
    const topicLabel = topics.size === 0 ? 'All topics' : `${topics.size} topic${topics.size === 1 ? '' : 's'}`;
    const modeLabel = [tutorMode ? 'Tutor' : null, timedMode ? 'Timed' : null].filter(Boolean).join(' + ') || 'Standard';
    return `${count} question${count === 1 ? '' : 's'} - ${poolLabel} pool - ${difficultyLabel} - ${topicLabel} - ${modeLabel}`;
  }, [count, pool, difficulties, topics, tutorMode, timedMode]);

  const renderPoolCount = (id) => {
    if (poolLoading) return <span className="ut-skeleton pb-count-skeleton" aria-hidden="true" />;
    const value = poolCountFor(id);
    if (value === null) return <span className="pb-count-unknown">-</span>;
    return <span className="pb-pick-count">{value.toLocaleString()}</span>;
  };

  return (
    <div className="ut-page pb-page">
      <header className="ut-page-head">
        <div className="ut-page-head-main">
          <p className="ut-eyebrow">Practice</p>
          <h1 className="ut-page-title">Practice Builder</h1>
          <p className="ut-page-sub">
            Build a custom practice set: choose how many questions, which pool they come
            from, and the difficulty and topics you want to drill.
          </p>
        </div>
        <div className="ut-page-head-actions">
          <Link to="/practice/history" className="ut-btn ut-btn--ghost">
            <FiClock aria-hidden="true" /> My practice
          </Link>
        </div>
      </header>

      {/* ------------------------------------------------------ quick start */}
      <section className="ut-panel-ink pb-quickstart" aria-label="Quick start">
        <div className="pb-quickstart-main">
          <span className="ut-label ut-label--on-ink">Quick start</span>
          <h2 className="pb-quickstart-title">Jump straight into a set</h2>
          <p className="pb-quickstart-sub">
            We target your weakest skills with questions you have not seen yet.
          </p>
        </div>
        <div className="pb-quickstart-controls">
          <div className="pb-counter" role="group" aria-label="Number of questions">
            <button
              type="button"
              className="pb-counter-btn"
              onClick={() => stepCount(-1)}
              disabled={count <= 1}
              aria-label="Fewer questions"
            >
              <FiMinus />
            </button>
            <input
              type="number"
              className="pb-counter-input"
              min={1}
              max={BUILDER_MAX_QUESTIONS}
              value={countRaw}
              onChange={(event) => setCountRaw(event.target.value)}
              onBlur={(event) => commitCount(event.target.value)}
              aria-label={`Number of questions (1 to ${BUILDER_MAX_QUESTIONS})`}
            />
            <button
              type="button"
              className="pb-counter-btn"
              onClick={() => stepCount(1)}
              disabled={count >= BUILDER_MAX_QUESTIONS}
              aria-label="More questions"
            >
              <FiPlus />
            </button>
          </div>
          {isFree && (
            <button type="button" className="pb-lock-hint" onClick={() => openLock('Larger practice sets')}>
              <FiLock aria-hidden="true" /> 11-{BUILDER_MAX_QUESTIONS} with Pro
            </button>
          )}
          <button
            type="button"
            className="ut-btn ut-btn--primary ut-btn--lg"
            onClick={handleQuickStart}
            disabled={!!creating}
          >
            <FiZap aria-hidden="true" />
            {creating === 'quick' ? 'Building...' : 'Start practice'}
          </button>
        </div>
      </section>

      {createError && errorSource === 'quick' && (
        <p className="pb-error pb-error--banner" role="alert">{createError}</p>
      )}

      <div className="ut-grid ut-grid--2 pb-config-row">
        {/* --------------------------------------------------- practice mode */}
        <section className="ut-card" aria-label="Practice mode">
          <h2 className="ut-card-title">Practice mode</h2>
          <p className="ut-card-sub">Tutor shows explanations as you answer. Timed adds a per-question clock. Both can be on.</p>
          <div className="pb-mode-chips">
            <button
              type="button"
              className={`pb-toggle ${tutorMode ? 'pb-toggle--on' : ''}`}
              onClick={() => setTutorMode((v) => !v)}
              aria-pressed={tutorMode}
            >
              <FiMessageCircle aria-hidden="true" />
              Tutor
              {tutorMode && <FiCheck className="pb-toggle-check" aria-hidden="true" />}
            </button>
            <button
              type="button"
              className={`pb-toggle ${timedMode ? 'pb-toggle--on' : ''}`}
              onClick={() => setTimedMode((v) => !v)}
              aria-pressed={timedMode}
            >
              <FiClock aria-hidden="true" />
              Timed
              {timedMode && <FiCheck className="pb-toggle-check" aria-hidden="true" />}
            </button>
          </div>
        </section>

        {/* ------------------------------------------------------ difficulty */}
        <section className="ut-card" aria-label="Difficulty">
          <h2 className="ut-card-title">Difficulty</h2>
          <p className="ut-card-sub">Leave everything unchecked to mix all levels.</p>
          <div className="pb-difficulty-list">
            {DIFFICULTY_OPTIONS.map((option) => (
              <label key={option.id} className="pb-check">
                <input
                  type="checkbox"
                  checked={difficulties.has(option.id)}
                  onChange={() => toggleDifficulty(option.id)}
                />
                <span className={`ut-chip ${option.chipClass}`}>{option.label}</span>
                {poolLoading ? (
                  <span className="ut-skeleton pb-count-skeleton" aria-hidden="true" />
                ) : (
                  <span className="pb-check-count">
                    {poolData ? poolData.difficultyCounts[option.id].toLocaleString() : '-'}
                  </span>
                )}
              </label>
            ))}
          </div>
        </section>
      </div>

      {/* --------------------------------------------------- question pool */}
      <section className="ut-card pb-pool-card" aria-label="Question pool">
        <h2 className="ut-card-title">Question pool</h2>
        <p className="ut-card-sub">Where should your questions come from?</p>
        <div className="pb-pool-grid">
          {POOL_OPTIONS.map((option) => {
            const locked = option.locked && isFree;
            const selected = pool === option.id;
            return (
              <button
                key={option.id}
                type="button"
                className={`pb-pick ${selected ? 'pb-pick--selected' : ''} ${locked ? 'pb-pick--locked' : ''}`}
                onClick={() => handlePoolSelect(option)}
                aria-pressed={selected}
                aria-label={`${option.label} pool${locked ? ' (Pro feature)' : ''}`}
              >
                <span className="pb-pick-top">
                  <option.Icon aria-hidden="true" />
                  <span className="pb-pick-label">{option.label}</span>
                  {locked ? <FiLock className="pb-pick-lock" aria-hidden="true" /> : renderPoolCount(option.id)}
                </span>
                <span className="pb-pick-hint">{option.hint}</span>
              </button>
            );
          })}
        </div>
        {isFree && (
          <p className="pb-pool-note">
            <FiLock aria-hidden="true" /> Incorrect and Marked pools are part of Pro.
          </p>
        )}
      </section>

      {/* ----------------------------------------------------------- topics */}
      <section className="ut-card pb-topics-card" aria-label="Topics">
        <div className="pb-topics-head">
          <div>
            <h2 className="ut-card-title">Topics</h2>
            <p className="ut-card-sub">
              {topics.size === 0
                ? 'No topics selected - the set draws from all 29 skills.'
                : `${topics.size} skill${topics.size === 1 ? '' : 's'} selected.`}
            </p>
          </div>
          {topics.size > 0 && (
            <button type="button" className="ut-link" onClick={() => { setTopics(new Set()); setCreateError(''); }}>
              Clear selection
            </button>
          )}
        </div>

        <div className="pb-topics-columns">
          {Object.keys(SECTION_LABELS).map((sectionId) => (
            <div key={sectionId} className="pb-topic-section">
              <span className="ut-label">{SECTION_LABELS[sectionId]}</span>
              {Object.entries(structure[sectionId] || {}).map(([domainId, subcategoryIds]) => {
                const expanded = expandedDomains.has(domainId);
                const selectedInDomain = subcategoryIds.filter((sc) => topics.has(sc)).length;
                const allSelected = selectedInDomain === subcategoryIds.length;
                const counting = countingDomains.has(domainId);
                return (
                  <div key={domainId} className="pb-domain">
                    <div className="pb-domain-head">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        ref={(el) => {
                          if (el) el.indeterminate = selectedInDomain > 0 && !allSelected;
                        }}
                        onChange={() => toggleDomainTopics(subcategoryIds)}
                        aria-label={`Select all ${DOMAINS[domainId]?.name || domainId} skills`}
                      />
                      <button
                        type="button"
                        className="pb-domain-toggle"
                        onClick={() => toggleDomainExpanded(domainId, subcategoryIds)}
                        aria-expanded={expanded}
                      >
                        {expanded ? <FiChevronDown aria-hidden="true" /> : <FiChevronRight aria-hidden="true" />}
                        <span className="pb-domain-name">{DOMAINS[domainId]?.name || domainId}</span>
                        {selectedInDomain > 0 && (
                          <span className="ut-chip ut-chip--accent pb-domain-chip">{selectedInDomain}</span>
                        )}
                      </button>
                    </div>
                    {expanded && (
                      <div className="pb-subcat-list">
                        {subcategoryIds.map((sc) => (
                          <label key={sc} className="pb-check pb-check--subcat">
                            <input
                              type="checkbox"
                              checked={topics.has(sc)}
                              onChange={() => toggleTopic(sc)}
                            />
                            <span className="pb-check-label">{KEBAB_TO_NAME[sc] || sc}</span>
                            {counting && subcatCounts[sc] === undefined ? (
                              <span className="ut-skeleton pb-count-skeleton" aria-hidden="true" />
                            ) : (
                              <span className="pb-check-count">
                                {subcatCounts[sc] === undefined || subcatCounts[sc] === null
                                  ? ''
                                  : subcatCounts[sc].toLocaleString()}
                              </span>
                            )}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </section>

      {/* --------------------------------------------------------- generate */}
      <section className="ut-card ut-card--accent pb-generate" aria-label="Generate practice">
        <div className="pb-generate-main">
          <h2 className="ut-card-title">Your practice set</h2>
          <p className="pb-summary">{summaryLine}</p>
          {disabledReason && !creating && <p className="pb-reason">{disabledReason}</p>}
          {createNote && <p className="pb-note">{createNote}</p>}
          {createError && errorSource === 'custom' && <p className="pb-error" role="alert">{createError}</p>}
        </div>
        <button
          type="button"
          className="ut-btn ut-btn--primary ut-btn--lg"
          onClick={handleGenerate}
          disabled={!!disabledReason}
        >
          <FiZap aria-hidden="true" />
          {creating === 'custom' ? 'Building...' : 'Generate practice'}
        </button>
      </section>

      <ProUpgradeModal
        open={showProModal}
        onClose={() => setShowProModal(false)}
        featureName={proFeatureName}
        description="Pro unlocks the Incorrect and Marked pools and practice sets of up to 30 questions."
      />
    </div>
  );
}

export default PracticeBuilder;
