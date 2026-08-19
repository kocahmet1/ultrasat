import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiEye, FiEyeOff, FiTrash2 } from 'react-icons/fi';
import { db as firestore } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { deleteExamResult, setExamResultCoachExclusion } from '../api/examResultsClient';
import styles from '../styles/AllExamResults.module.css';

/**
 * All Exam Results.
 *
 * Beyond listing history, this page owns the two escape hatches a student needs
 * when a sitting does not represent them (an exam abandoned after one module,
 * a test taken on someone else's account, a misfire):
 *
 *   Hide from coach — reversible. The result stays in history; its activity
 *                     events are flagged and the coach's derived state is
 *                     rebuilt without them.
 *   Delete          — permanent. The result, its per-question responses, its
 *                     attempt records, its coach events and the coach's notes
 *                     about it are all removed, then derived state is rebuilt.
 *
 * Both run server-side (api/examResultsClient) because the records that feed
 * the coach are append-only to clients by design.
 */

const formatExamDate = (exam) => {
  const ts = exam.completedAt;
  const date = ts?.toDate ? ts.toDate() : exam.examDate ? new Date(exam.examDate) : null;
  return date && !Number.isNaN(date.getTime()) ? date.toLocaleDateString() : 'N/A';
};

const formatScore = (exam) => {
  if (exam.overallScore !== undefined) return `${exam.overallScore}%`;
  if (exam.scores?.overall !== undefined) return `${exam.scores.overall}%`;
  return 'N/A';
};

const AllExamResults = () => {
    const [examHistory, setExamHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [busyId, setBusyId] = useState(null);       // result currently being mutated
    const [confirmingId, setConfirmingId] = useState(null); // inline delete confirmation
    const [actionError, setActionError] = useState(null);
    const { currentUser } = useAuth();

    useEffect(() => {
        if (!currentUser) {
            setLoading(false);
            return;
        }

        let cancelled = false;

        const fetchExamHistory = async () => {
            setLoading(true);
            setError(null);
            try {
                const examsCollectionRef = collection(firestore, `users/${currentUser.uid}/practiceExams`);
                const q = query(examsCollectionRef, orderBy('completedAt', 'desc'));
                const querySnapshot = await getDocs(q);

                const history = querySnapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
                if (!cancelled) setExamHistory(history);
            } catch (err) {
                console.error('[AllExamResults] Error fetching exam history:', err);
                if (!cancelled) {
                    setError('Failed to load exam history. Please try again later.');
                    setExamHistory([]);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchExamHistory();
        return () => { cancelled = true; };
    }, [currentUser]);

    const handleToggleCoach = useCallback(async (exam) => {
        const next = !exam.excludedFromCoach;
        setActionError(null);
        setBusyId(exam.id);
        try {
            await setExamResultCoachExclusion(exam.id, next);
            setExamHistory((prev) =>
                prev.map((e) => (e.id === exam.id ? { ...e, excludedFromCoach: next } : e))
            );
        } catch (err) {
            console.error('[AllExamResults] Coach exclusion failed:', err);
            setActionError(
                next
                    ? 'Could not hide this result from the coach. Please try again.'
                    : 'Could not restore this result for the coach. Please try again.'
            );
        } finally {
            setBusyId(null);
        }
    }, []);

    const handleDelete = useCallback(async (exam) => {
        setActionError(null);
        setBusyId(exam.id);
        try {
            await deleteExamResult(exam.id);
            setExamHistory((prev) => prev.filter((e) => e.id !== exam.id));
            setConfirmingId(null);
        } catch (err) {
            console.error('[AllExamResults] Delete failed:', err);
            setActionError('Could not delete this result. Please try again.');
        } finally {
            setBusyId(null);
        }
    }, []);

    if (loading) {
        return <div className={styles.loading}>Loading exam history...</div>;
    }

    if (error) {
        return <div className={styles.error}>{error}</div>;
    }

    if (!currentUser) {
        return <div className={styles.container}><p className={styles.noResults}>Please log in to view your exam history.</p></div>;
    }

    const header = (
        <div className="ut-page-head">
            <div className="ut-page-head-main">
                <p className="ut-eyebrow">Results</p>
                <h1 className="ut-page-title">All Exam Results</h1>
            </div>
        </div>
    );

    if (examHistory.length === 0) {
        return (
            <div className={styles.container}>
                {header}
                <p className={styles.noResults}>You haven't completed any exams yet.</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {header}
            <p className={styles.hint}>
                Hidden results stay in your history but are left out of everything the AI coach
                sees. Deleting removes a result and its answers for good.
            </p>
            {actionError && <div className={styles.error}>{actionError}</div>}
            <ul className={styles.examList}>
                {examHistory.map((exam) => {
                    const busy = busyId === exam.id;
                    const excluded = !!exam.excludedFromCoach;
                    const confirming = confirmingId === exam.id;

                    return (
                        <li
                            key={exam.id}
                            className={`${styles.examItem} ${excluded ? styles.examItemExcluded : ''}`}
                        >
                            <div className={styles.examRow}>
                                <Link to={`/exam/results/${exam.id}`} className={styles.examLink}>
                                    <div className={styles.examInfo}>
                                        <span className={styles.examName}>
                                            {exam.examTitle || `Practice Exam ${exam.id.substring(0, 6)}...`}
                                        </span>
                                        <span className={styles.examDate}>Date: {formatExamDate(exam)}</span>
                                        <span className={styles.badgeRow}>
                                            {exam.isPartial && (
                                                <span className={styles.badgePartial}>
                                                    Partial · {exam.attemptedModuleCount ?? '?'}/{exam.totalModuleCount ?? '?'} modules
                                                </span>
                                            )}
                                            {excluded && <span className={styles.badgeHidden}>Hidden from coach</span>}
                                        </span>
                                    </div>
                                    <div className={styles.examScore}>Score: {formatScore(exam)}</div>
                                </Link>

                                <div className={styles.examActions}>
                                    <button
                                        type="button"
                                        className={styles.actionButton}
                                        onClick={() => handleToggleCoach(exam)}
                                        disabled={busy}
                                        aria-pressed={excluded}
                                        title={
                                            excluded
                                                ? 'Let the AI coach use this result again'
                                                : 'Keep this result but hide it from the AI coach'
                                        }
                                    >
                                        {excluded ? <FiEye aria-hidden /> : <FiEyeOff aria-hidden />}
                                        <span>{excluded ? 'Show to coach' : 'Hide from coach'}</span>
                                    </button>

                                    <button
                                        type="button"
                                        className={`${styles.actionButton} ${styles.actionDanger}`}
                                        onClick={() => setConfirmingId(confirming ? null : exam.id)}
                                        disabled={busy}
                                        title="Delete this result permanently"
                                    >
                                        <FiTrash2 aria-hidden />
                                        <span>Delete</span>
                                    </button>
                                </div>
                            </div>

                            {confirming && (
                                <div className={styles.confirmBar}>
                                    <span className={styles.confirmText}>
                                        Delete this result, its answers and everything the coach learned
                                        from it? This can't be undone.
                                    </span>
                                    <div className={styles.confirmActions}>
                                        <button
                                            type="button"
                                            className={styles.confirmCancel}
                                            onClick={() => setConfirmingId(null)}
                                            disabled={busy}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            className={styles.confirmDelete}
                                            onClick={() => handleDelete(exam)}
                                            disabled={busy}
                                        >
                                            {busy ? 'Deleting…' : 'Delete permanently'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default AllExamResults;
