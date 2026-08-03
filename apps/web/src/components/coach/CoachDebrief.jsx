/**
 * AI Coach — inline "Coach's read" block for quiz results pages.
 *
 * Fetches (idempotently) the debrief for a completed quiz and renders it with
 * one-tap actions. Renders nothing when the coach is unavailable — the results
 * page must work perfectly without it.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCoach } from '../../contexts/CoachContext';
import { getDisplayName } from '../../utils/subcategoryTaxonomy';
import './coach.css';

const CoachGlyph = ({ size = 17 }) => (
  <svg viewBox="0 0 24 24" fill="none" width={size} height={size} aria-hidden="true">
    <path d="M12 3l1.8 4.7L18.5 9l-4.7 1.8L12 15.5l-1.8-4.7L5.5 9l4.7-1.3L12 3z" fill="#fff" />
    <circle cx="18.5" cy="17" r="2.2" fill="#fff" opacity=".85" />
  </svg>
);

const CoachDebrief = ({ quizId }) => {
  const coach = useCoach();
  const navigate = useNavigate();
  const [note, setNote] = useState(null);
  const [state, setState] = useState('loading'); // loading | ready | hidden

  useEffect(() => {
    let cancelled = false;
    if (!coach || !coach.available || !quizId) {
      setState('hidden');
      return undefined;
    }
    setState('loading');
    coach
      .getDebrief(quizId)
      .then((n) => {
        if (cancelled) return;
        if (n && n.message) {
          setNote(n);
          setState('ready');
        } else {
          setState('hidden');
        }
      })
      .catch(() => !cancelled && setState('hidden'));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizId, coach?.available]);

  if (state === 'hidden') return null;

  const handleAction = (a) => {
    if (a.type === 'lesson') {
      coach.requestMicroLesson({ conceptId: a.conceptId, subcategoryId: a.subcategoryId });
      return;
    }
    if (a.type === 'quiz' && a.subcategoryId) {
      navigate('/smart-quiz-generator', {
        state: { subcategoryId: a.subcategoryId, ...(a.level ? { forceLevel: a.level } : {}) },
      });
    } else if (a.type === 'link' && a.route) {
      navigate(a.route);
    }
  };

  return (
    <div className="coach-read-block">
      <div className="coach-read-head">
        <div className="coach-avatar"><CoachGlyph /></div>
        <div>
          <div className="coach-read-title">Coach's read</div>
          <div className="coach-read-sub">grounded in this quiz + your history</div>
        </div>
      </div>
      {state === 'loading' ? (
        <div className="coach-read-loading">Looking at what this quiz means for you…</div>
      ) : (
        <>
          <p>{note.message}</p>
          {note.actions && note.actions.length > 0 && (
            <div className="coach-actions">
              {note.actions.map((a, i) => (
                <button
                  key={i}
                  className={`coach-action-btn ${i === 0 ? 'primary' : ''}`}
                  onClick={() => handleAction(a)}
                >
                  {a.label ||
                    (a.type === 'quiz' ? `Practice ${getDisplayName(a.subcategoryId) || a.subcategoryId}` : 'Open')}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CoachDebrief;
