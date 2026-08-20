/**
 * AI Coach — the post-quiz debrief, UI v2: a staged TAKEOVER of the results
 * page, not a comment in a box.
 *
 * The note's typed blocks reveal in sequence (verdict → the concept's
 * missed/recovered/regressed timeline → actions), and the 60-second micro-
 * lesson renders INLINE here instead of bouncing the student to the dock
 * panel. The debrief request is idempotent server-side; the results page must
 * keep working perfectly when the coach is unavailable (renders nothing).
 */

import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCoach } from '../../contexts/CoachContext';
import { requestMicroLessonApi } from '../../api/coachClient';
import { getDisplayName } from '../../utils/subcategoryTaxonomy';
import CoachBlocks, { ensureBlocks } from './CoachBlocks';
import { LessonCard } from './CoachDock';
import './coach.css';

const CoachGlyph = ({ size = 17 }) => (
  <svg viewBox="0 0 24 24" fill="none" width={size} height={size} aria-hidden="true">
    <path d="M12 3l1.8 4.7L18.5 9l-4.7 1.8L12 15.5l-1.8-4.7L5.5 9l4.7-1.3L12 3z" fill="#fff" />
    <circle cx="18.5" cy="17" r="2.2" fill="#fff" opacity=".85" />
  </svg>
);

/** Stagger children in: each `cvt-reveal` gets `.in` a beat after the last. */
const useReveal = (ready, count) => {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (!ready) return undefined;
    setShown(0);
    const timers = [];
    for (let i = 1; i <= count; i += 1) {
      timers.push(setTimeout(() => setShown(i), 250 + i * 420));
    }
    return () => timers.forEach(clearTimeout);
  }, [ready, count]);
  return shown;
};

const CoachDebrief = ({ quizId }) => {
  const coach = useCoach();
  const navigate = useNavigate();
  const [note, setNote] = useState(null);
  const [state, setState] = useState('loading'); // loading | ready | hidden
  const [lesson, setLesson] = useState(null); // inline micro-lesson
  const [lessonState, setLessonState] = useState('idle'); // idle | loading | ready | error
  const lessonRef = useRef(null);

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
        if (n && (n.message || (n.blocks && n.blocks.length))) {
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

  const blocks = ensureBlocks(note);
  const hasHistory = blocks.some((b) => b.type === 'history');
  const revealCount = 2 + (hasHistory ? 1 : 0); // verdict, [history], actions
  const shown = useReveal(state === 'ready', revealCount);

  if (state === 'hidden') return null;

  const handleAction = (a) => {
    if (a.type === 'lesson') {
      // UI v2: the lesson lands INLINE on the results page.
      if (lessonState === 'loading') return;
      setLessonState('loading');
      requestMicroLessonApi({ conceptId: a.conceptId, subcategoryId: a.subcategoryId })
        .then(({ lesson: l }) => {
          if (l) {
            setLesson(l);
            setLessonState('ready');
            setTimeout(() => lessonRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 80);
          } else {
            setLessonState('error');
          }
        })
        .catch(() => setLessonState('error'));
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

  const historyIdx = hasHistory ? 2 : -1;
  const actionsIdx = hasHistory ? 3 : 2;

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
          <div className={`cvt-reveal ${shown >= 1 ? 'in' : ''}`}>
            <CoachBlocks blocks={blocks} variant="light" only={['verdict']} />
          </div>

          {hasHistory && (
            <div className={`cvt-reveal ${shown >= historyIdx ? 'in' : ''}`} style={{ marginTop: 12 }}>
              <CoachBlocks blocks={blocks} variant="light" only={['history']} />
            </div>
          )}

          {note.actions && note.actions.length > 0 && (
            <div className={`cvt-reveal cvt-actions ${shown >= actionsIdx ? 'in' : ''}`}>
              {note.actions.map((a, i) => (
                <button
                  key={i}
                  className={`coach-action-btn ${i === 0 ? 'primary' : ''}`}
                  onClick={() => handleAction(a)}
                  disabled={a.type === 'lesson' && lessonState === 'loading'}
                >
                  {a.type === 'lesson' && lessonState === 'loading'
                    ? 'Writing your lesson…'
                    : a.label ||
                      (a.type === 'quiz' ? `Practice ${getDisplayName(a.subcategoryId) || a.subcategoryId}` : 'Open')}
                </button>
              ))}
            </div>
          )}

          {lessonState === 'error' && (
            <p className="coach-read-sub" style={{ marginTop: 8 }}>
              Couldn't write the lesson just now — try again in a moment.
            </p>
          )}

          {lesson && (
            <div className="cvt-lesson" ref={lessonRef}>
              <LessonCard lesson={lesson} onAction={handleAction} />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CoachDebrief;
