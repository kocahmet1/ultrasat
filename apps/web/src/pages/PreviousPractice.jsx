import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import {
  FiBookOpen,
  FiBookmark,
  FiClock,
  FiMessageCircle,
  FiPlay,
  FiPlus,
  FiTrash2,
  FiZap,
} from 'react-icons/fi';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { SMARTQUIZ_COLLECTION } from '../utils/smartQuizUtils';
import { KEBAB_TO_NAME, toCanonicalSubcategoryId } from '../utils/subcategoryTaxonomy';
import './PreviousPractice.css';

const HISTORY_LIMIT = 50;

const toMillis = (value) => {
  if (!value) return 0;
  if (typeof value.toDate === 'function') return value.toDate().getTime();
  if (value.seconds) return value.seconds * 1000;
  const parsed = new Date(value).getTime();
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatDate = (value) => {
  const millis = toMillis(value);
  if (!millis) return 'Unknown date';
  return new Date(millis).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const subcategoryName = (value) => {
  const canonical = toCanonicalSubcategoryId(value);
  return canonical ? KEBAB_TO_NAME[canonical] : null;
};

/** Human topic label for a quiz doc, tolerating every historical shape. */
const topicLabel = (quiz) => {
  let ids = [];
  if (Array.isArray(quiz.builderConfig?.subcategoryIds) && quiz.builderConfig.subcategoryIds.length > 0) {
    ids = quiz.builderConfig.subcategoryIds;
  } else if (Array.isArray(quiz.metaSubcategoryIds) && quiz.metaSubcategoryIds.length > 0) {
    ids = quiz.metaSubcategoryIds;
  } else if (quiz.subcategoryId) {
    ids = [quiz.subcategoryId];
  }
  const names = ids.map(subcategoryName).filter(Boolean);
  if (names.length === 0) return 'Mixed practice';
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} + ${names[1]}`;
  return `${names[0]} +${names.length - 1} more`;
};

const savedItemText = (item) => {
  const raw = item.questionText || item.prompt || item.passage || item.title;
  const text = typeof raw === 'string' && raw.trim() ? raw.trim() : 'Saved question';
  return text.length > 160 ? `${text.slice(0, 157)}...` : text;
};

function PreviousPractice() {
  const { currentUser } = useAuth();

  const [historyLoading, setHistoryLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [historyError, setHistoryError] = useState('');
  const [sortedLocally, setSortedLocally] = useState(false);

  const [savedLoading, setSavedLoading] = useState(true);
  const [savedItems, setSavedItems] = useState([]);
  const [savedError, setSavedError] = useState('');
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => {
    if (!currentUser) return undefined;
    let cancelled = false;

    const loadHistory = async () => {
      setHistoryLoading(true);
      setHistoryError('');
      const quizzesRef = collection(db, SMARTQUIZ_COLLECTION);
      let docs = null;
      try {
        const snap = await getDocs(query(
          quizzesRef,
          where('userId', '==', currentUser.uid),
          orderBy('createdAt', 'desc'),
          limit(HISTORY_LIMIT),
        ));
        docs = snap.docs;
      } catch (indexError) {
        // Likely a missing composite index (userId + createdAt) — fall back to
        // an unordered query and sort on the client.
        console.warn('[PreviousPractice] Ordered history query failed, sorting locally:', indexError?.message);
        try {
          const snap = await getDocs(query(
            quizzesRef,
            where('userId', '==', currentUser.uid),
            limit(200),
          ));
          docs = snap.docs;
          if (!cancelled) setSortedLocally(true);
        } catch (fallbackError) {
          console.error('[PreviousPractice] History query failed:', fallbackError);
          if (!cancelled) setHistoryError('Could not load your practice history. Please try again later.');
        }
      }

      if (cancelled) return;
      if (docs) {
        const rows = docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => toMillis(b.createdAt || b.completedAt) - toMillis(a.createdAt || a.completedAt))
          .slice(0, HISTORY_LIMIT);
        setHistory(rows);
      }
      setHistoryLoading(false);
    };

    const loadSaved = async () => {
      setSavedLoading(true);
      setSavedError('');
      try {
        const snap = await getDocs(collection(db, 'users', currentUser.uid, 'studyPlanItems'));
        if (cancelled) return;
        const items = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));
        setSavedItems(items);
      } catch (error) {
        console.error('[PreviousPractice] Saved questions query failed:', error);
        if (!cancelled) setSavedError('Could not load your saved questions.');
      } finally {
        if (!cancelled) setSavedLoading(false);
      }
    };

    loadHistory();
    loadSaved();
    return () => { cancelled = true; };
  }, [currentUser]);

  const handleRemoveSaved = useCallback(async (itemId) => {
    if (!currentUser || removingId) return;
    setRemovingId(itemId);
    try {
      await deleteDoc(doc(db, 'users', currentUser.uid, 'studyPlanItems', itemId));
      setSavedItems((prev) => prev.filter((item) => item.id !== itemId));
    } catch (error) {
      console.error('[PreviousPractice] Failed to remove saved question:', error);
      setSavedError('Could not remove that question. Please try again.');
    } finally {
      setRemovingId(null);
    }
  }, [currentUser, removingId]);

  const completedCount = useMemo(
    () => history.filter((quiz) => quiz.status === 'completed').length,
    [history],
  );

  return (
    <div className="ut-page pp-page">
      <header className="ut-page-head">
        <div className="ut-page-head-main">
          <p className="ut-eyebrow">Practice</p>
          <h1 className="ut-page-title">My Practice</h1>
          <p className="ut-page-sub">
            Every practice set you have created - resume unfinished sets, revisit
            results, and review the questions you saved.
          </p>
        </div>
        <div className="ut-page-head-actions">
          <Link to="/practice" className="ut-btn ut-btn--primary">
            <FiPlus aria-hidden="true" /> New practice
          </Link>
        </div>
      </header>

      {/* -------------------------------------------------- practice history */}
      <section aria-label="Practice history">
        <div className="ut-section-head">
          <h2 className="ut-section-title">Practice history</h2>
          {!historyLoading && history.length > 0 && (
            <span className="ut-chip">{completedCount}/{history.length} completed</span>
          )}
          {sortedLocally && <span className="ut-chip">Sorted locally</span>}
        </div>

        {historyLoading ? (
          <div className="ut-skeleton-stack" role="status" aria-label="Loading practice history">
            <div className="ut-skeleton ut-skeleton--row" />
            <div className="ut-skeleton ut-skeleton--row" />
            <div className="ut-skeleton ut-skeleton--row" />
          </div>
        ) : historyError ? (
          <div className="ut-empty" role="alert">
            <b>Something went wrong</b>
            {historyError}
          </div>
        ) : history.length === 0 ? (
          <div className="ut-empty">
            <b>No practice yet</b>
            Build your first custom set and it will show up here.
            <div className="pp-empty-action">
              <Link to="/practice" className="ut-btn ut-btn--soft">
                <FiZap aria-hidden="true" /> Open Practice Builder
              </Link>
            </div>
          </div>
        ) : (
          <div className="pp-history-list">
            {history.map((quiz) => {
              const completed = quiz.status === 'completed';
              const questionTotal = quiz.questionCount
                || (Array.isArray(quiz.questionIds) ? quiz.questionIds.length : null);
              return (
                <div key={quiz.id} className="ut-row pp-row">
                  <span className={`ut-tile ${completed ? '' : 'ut-tile--neutral'}`}>
                    <FiZap aria-hidden="true" />
                  </span>
                  <div className="pp-row-main">
                    <strong className="pp-row-title">{topicLabel(quiz)}</strong>
                    <span className="ut-card-sub">
                      {formatDate(quiz.createdAt || quiz.completedAt)}
                      {questionTotal ? ` - ${questionTotal} question${questionTotal === 1 ? '' : 's'}` : ''}
                    </span>
                  </div>
                  <div className="pp-row-side">
                    {quiz.tutorMode === true && (
                      <span className="ut-chip"><FiMessageCircle aria-hidden="true" /> Tutor</span>
                    )}
                    {quiz.timerMode === 'timed' && (
                      <span className="ut-chip"><FiClock aria-hidden="true" /> Timed</span>
                    )}
                    {completed ? (
                      <span className="ut-chip ut-chip--easy">
                        Completed{typeof quiz.score === 'number' ? ` - ${quiz.score}%` : ''}
                      </span>
                    ) : (
                      <span className="ut-chip ut-chip--accent">In progress</span>
                    )}
                    {completed ? (
                      <Link to={`/smart-quiz-results/${quiz.id}`} className="ut-btn ut-btn--ghost ut-btn--sm">
                        Results
                      </Link>
                    ) : (
                      <Link to={`/smart-quiz/${quiz.id}`} className="ut-btn ut-btn--soft ut-btn--sm">
                        <FiPlay aria-hidden="true" /> Resume
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ---------------------------------------------------- saved questions */}
      <section aria-label="Saved questions">
        <div className="ut-section-head">
          <h2 className="ut-section-title">Saved questions</h2>
          {!savedLoading && savedItems.length > 0 && (
            <span className="ut-chip"><FiBookmark aria-hidden="true" /> {savedItems.length}</span>
          )}
        </div>

        {savedError && <p className="pp-saved-error" role="alert">{savedError}</p>}

        {savedLoading ? (
          <div className="ut-skeleton-stack" role="status" aria-label="Loading saved questions">
            <div className="ut-skeleton ut-skeleton--row" />
            <div className="ut-skeleton ut-skeleton--row" />
          </div>
        ) : savedItems.length === 0 ? (
          <div className="ut-empty">
            <b>No saved questions yet</b>
            Save questions during practice and they will be waiting here for review.
          </div>
        ) : (
          <div className="pp-saved-list">
            {savedItems.slice(0, 100).map((item) => {
              const subValue = item.subcategory || item.subcategoryId || '';
              const canonical = toCanonicalSubcategoryId(subValue);
              const subName = canonical
                ? KEBAB_TO_NAME[canonical]
                : (typeof subValue === 'string' && subValue ? subValue : null);
              return (
                <div key={item.id} className="ut-row pp-saved-row">
                  <span className="ut-tile ut-tile--neutral">
                    <FiBookmark aria-hidden="true" />
                  </span>
                  <div className="pp-row-main">
                    <p className="pp-saved-text">{savedItemText(item)}</p>
                    <span className="ut-card-sub">
                      {item.skill || subName || 'Practice question'}
                      {item.createdAt ? ` - saved ${formatDate(item.createdAt)}` : ''}
                    </span>
                  </div>
                  <div className="pp-row-side">
                    {subName && <span className="ut-chip">{subName}</span>}
                    {canonical && (
                      <Link to={`/learn/${canonical}`} className="ut-btn ut-btn--ghost ut-btn--sm">
                        <FiBookOpen aria-hidden="true" /> Review lesson
                      </Link>
                    )}
                    <button
                      type="button"
                      className="pp-remove-btn"
                      onClick={() => handleRemoveSaved(item.id)}
                      disabled={removingId === item.id}
                      aria-label="Remove saved question"
                      title="Remove saved question"
                    >
                      <FiTrash2 aria-hidden="true" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default PreviousPractice;
