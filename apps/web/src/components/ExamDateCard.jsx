/**
 * ExamDateCard — the ONE reachable place a student sets (or changes) their
 * SAT test date and optional target score.
 *
 * Writes `examDate` ('YYYY-MM-DD' string) and `targetScore` (number) onto the
 * users/{uid} ROOT document, because that is exactly what the live readers
 * expect: pages/Dashboard.jsx and pages/CoachPage.jsx call
 * Date.parse(profile.examDate) on that doc, and the coach Observer
 * (apps/api/coach/observer.js via contextAssembler) does the same for the
 * exam_approaching nudge. A Firestore Timestamp would NaN out of Date.parse,
 * so the value is stored as a plain date string on purpose.
 *
 * Exports:
 *   default        — the setup/edit card (shown when no valid future date, or
 *                    when the user asked to change it).
 *   ExamDateInline — tiny on-ink "Test date: … · Change" affordance for the
 *                    hero, next to the countdown Dashboard already renders.
 */

import React, { useState } from 'react';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { FiCalendar } from 'react-icons/fi';
import './ExamDateCard.css';

/** Local calendar date as 'YYYY-MM-DD' (what <input type="date"> speaks). */
const todayISO = () => {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

/** 'YYYY-MM-DD' → 'Mar 14, 2026' (UTC so the calendar day never shifts). */
export const formatExamDate = (value) => {
  if (typeof value !== 'string') return null;
  const ms = Date.parse(value);
  if (Number.isNaN(ms)) return null;
  return new Date(ms).toLocaleDateString('en-US', {
    timeZone: 'UTC',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

/** Small affordance shown under the hero countdown once a date exists. */
export const ExamDateInline = ({ examDate, onChange }) => {
  const formatted = formatExamDate(examDate);
  if (!formatted) return null;
  return (
    <button type="button" className="edc-inline" onClick={onChange}>
      Test date: <b>{formatted}</b>
      <span className="edc-inline-change">&middot; Change</span>
    </button>
  );
};

const ExamDateCard = ({ examDate, targetScore, onSaved, onCancel }) => {
  const { currentUser } = useAuth();

  // Prefill only with values the date input can actually hold.
  const prefillDate =
    typeof examDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(examDate) && examDate >= todayISO()
      ? examDate
      : '';
  const [dateVal, setDateVal] = useState(prefillDate);
  const [scoreVal, setScoreVal] = useState(targetScore ? String(targetScore) : '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser || saving) return;
    setError(null);

    const date = dateVal.trim();
    if (!date || Number.isNaN(Date.parse(date))) {
      setError('Pick a valid test date.');
      return;
    }
    if (date < todayISO()) {
      setError("Your test date can't be in the past.");
      return;
    }

    let score = null;
    if (String(scoreVal).trim() !== '') {
      score = parseInt(scoreVal, 10);
      if (Number.isNaN(score) || score < 400 || score > 1600) {
        setError('Target score must be between 400 and 1600.');
        return;
      }
    }

    setSaving(true);
    try {
      // Same location + field names every reader uses: users/{uid} root doc.
      const updates = { examDate: date, ...(score !== null ? { targetScore: score } : {}) };
      await setDoc(
        doc(db, 'users', currentUser.uid),
        { ...updates, updatedAt: serverTimestamp() },
        { merge: true }
      );
      onSaved?.(updates);
    } catch (err) {
      console.error('[ExamDateCard] save failed:', err);
      setError('Could not save right now. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="ut-card ut-card--accent edc-card">
      <div className="edc-head">
        <span className="ut-tile"><FiCalendar /></span>
        <div>
          <h3 className="ut-card-title edc-title">When is your SAT?</h3>
          <p className="ut-card-sub">Powers your countdown and your coach's pacing.</p>
        </div>
      </div>

      <form className="edc-form" onSubmit={handleSubmit} noValidate>
        <input
          type="date"
          className="ut-input edc-date"
          aria-label="SAT test date"
          min={todayISO()}
          value={dateVal}
          onChange={(e) => setDateVal(e.target.value)}
          required
        />
        <input
          type="number"
          className="ut-input edc-score"
          placeholder="Target score (optional)"
          aria-label="Target score (optional)"
          min={400}
          max={1600}
          step={10}
          inputMode="numeric"
          value={scoreVal}
          onChange={(e) => setScoreVal(e.target.value)}
        />
        <div className="edc-actions">
          <button type="submit" className="ut-btn ut-btn--primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
          {onCancel && (
            <button type="button" className="ut-btn ut-btn--ghost" onClick={onCancel} disabled={saving}>
              Cancel
            </button>
          )}
        </div>
      </form>

      {error && (
        <div className="edc-error" role="alert">
          {error}
        </div>
      )}
    </div>
  );
};

export default ExamDateCard;
