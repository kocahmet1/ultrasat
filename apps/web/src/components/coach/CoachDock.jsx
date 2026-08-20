/**
 * AI Coach — global dock + panel (Phase 1).
 *
 * Behavior rules (from AI_COACH_DESIGN.md §5):
 *  - present on every authenticated app page
 *  - NEVER auto-opens; unread work shows as a badge only
 *  - completely hidden during timed exam work and for guests
 *  - one thread everywhere; actions are one-tap buttons, coach never navigates itself
 */

import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCoach } from '../../contexts/CoachContext';
import { getDisplayName } from '../../utils/subcategoryTaxonomy';
import './coach.css';

const CoachGlyph = ({ size = 24 }) => (
  <svg viewBox="0 0 24 24" fill="none" width={size} height={size} aria-hidden="true">
    <path d="M12 3l1.8 4.7L18.5 9l-4.7 1.8L12 15.5l-1.8-4.7L5.5 9l4.7-1.3L12 3z" fill="#fff" />
    <circle cx="18.5" cy="17" r="2.2" fill="#fff" opacity=".85" />
  </svg>
);

/** Interactive micro-lesson card (Phase 2). Exported for reuse on /coach. */
export const LessonCard = ({ lesson, onAction }) => {
  const [picked, setPicked] = useState(null);
  if (!lesson) return null;
  return (
    <div className="coach-lesson-card">
      <div className="coach-lesson-title">{lesson.title}</div>
      {lesson.hook && <p className="coach-lesson-hook">{lesson.hook}</p>}
      <p className="coach-lesson-body">{lesson.explanation}</p>
      {lesson.check && (
        <div className="coach-lesson-check">
          <div className="coach-lesson-check-prompt">{lesson.check.prompt}</div>
          {lesson.check.options.map((opt, i) => (
            <button
              key={i}
              className={`coach-lesson-opt ${
                picked === null ? '' : i === lesson.check.correctIndex ? 'right' : picked === i ? 'wrong' : ''
              }`}
              onClick={() => setPicked(i)}
              disabled={picked !== null}
            >
              {opt}
            </button>
          ))}
          {picked !== null && (
            <div className={`coach-lesson-fb ${picked === lesson.check.correctIndex ? 'ok' : 'no'}`}>
              {picked === lesson.check.correctIndex ? lesson.check.feedbackCorrect : lesson.check.feedbackWrong}
            </div>
          )}
        </div>
      )}
      {lesson.cta && (
        <div className="coach-actions">
          <button className="coach-action-btn primary" onClick={() => onAction(lesson.cta)}>
            {lesson.cta.label || 'Practice this now'}
          </button>
        </div>
      )}
    </div>
  );
};

export const ActionButtons = ({ actions, onAction }) => {
  if (!actions || actions.length === 0) return null;
  return (
    <div className="coach-actions">
      {actions.map((a, i) => (
        <button
          key={i}
          className={`coach-action-btn ${i === 0 ? 'primary' : ''}`}
          onClick={() => onAction(a)}
        >
          {a.label ||
            (a.type === 'quiz' ? `Practice ${getDisplayName(a.subcategoryId) || a.subcategoryId}` : 'Open')}
        </button>
      ))}
    </div>
  );
};

/**
 * UI v2 — the peek ticker. When a proactive note lands with the panel closed,
 * ONE line slides out with the note's actions, auto-retracts to the badge
 * after a few seconds, and never opens the panel by itself.
 */
const PEEK_MS = 9000;

const DockPeek = ({ peek, onAction, onOpen, onDismiss }) => {
  useEffect(() => {
    const t = setTimeout(onDismiss, PEEK_MS);
    return () => clearTimeout(t);
  }, [peek.id, onDismiss]);

  // One line only — the full note lives in the panel/thread.
  const line = String(peek.message || '').split(/(?<=[.!?])\s/)[0].slice(0, 160);

  return (
    <div className="cvp-peek" role="status">
      <div style={{ minWidth: 0 }}>
        <p>{line}</p>
        <div className="cvp-acts">
          {(peek.actions || []).slice(0, 1).map((a, i) => (
            <button key={i} className="cvp-btn" onClick={() => onAction(a)}>
              {a.label || 'Open'}
            </button>
          ))}
          <button className="cvp-btn ghost" onClick={onOpen}>
            {peek.actions && peek.actions.length ? 'More' : 'See why'}
          </button>
        </div>
      </div>
      <button className="cvp-close" onClick={onDismiss} aria-label="Dismiss">
        ×
      </button>
    </div>
  );
};

const CoachDock = () => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const coach = useCoach();
  const [draft, setDraft] = useState('');
  const feedRef = useRef(null);

  const isExamPage =
    location.pathname.includes('/practice-exam/') ||
    (location.pathname.startsWith('/exam/') && !location.pathname.startsWith('/exam/results')) ||
    location.pathname === '/intermission';

  useEffect(() => {
    if (feedRef.current) feedRef.current.scrollTop = feedRef.current.scrollHeight;
  }, [coach?.thread, coach?.panelOpen, coach?.sending]);

  if (!coach || !currentUser || !coach.available || isExamPage) return null;

  const handleAction = (action) => {
    if (action.type === 'lesson') {
      // Lesson lands in this panel — keep it open.
      coach.requestMicroLesson({ conceptId: action.conceptId, subcategoryId: action.subcategoryId });
      return;
    }
    coach.closePanel();
    if (action.type === 'quiz' && action.subcategoryId) {
      navigate('/smart-quiz-generator', {
        state: { subcategoryId: action.subcategoryId, ...(action.level ? { forceLevel: action.level } : {}) },
      });
    } else if (action.type === 'link' && action.route) {
      navigate(action.route);
    }
  };

  const handleSend = async () => {
    const text = draft.trim();
    if (!text) return;
    setDraft('');
    await coach.sendMessage(text, { route: location.pathname });
  };

  return (
    <>
      {coach.panelOpen && (
        <div className="coach-panel" role="dialog" aria-label="Coach">
          <div className="coach-panel-header">
            <div className="coach-avatar"><CoachGlyph size={17} /></div>
            <div>
              <div className="coach-panel-title">Coach</div>
              <div className="coach-panel-sub">remembers everything you practice</div>
            </div>
            <button className="coach-panel-close" onClick={coach.closePanel} aria-label="Close">×</button>
          </div>

          <div className="coach-feed" ref={feedRef}>
            {coach.thread.length === 0 ? (
              <div className="coach-empty">
                Hi — I'm your coach. I see your quizzes, exams, lessons, and flashcards as you work.
                <br />
                Finish a quiz and I'll tell you what it means, or ask me anything now.
              </div>
            ) : (
              coach.thread.map((m) => (
                <div key={m.id} className={`coach-msg ${m.role === 'user' ? 'user' : ''}`}>
                  {m.role !== 'user' && (
                    <div className="coach-avatar"><CoachGlyph size={14} /></div>
                  )}
                  <div className="coach-bubble">
                    {m.lesson ? (
                      <LessonCard lesson={m.lesson} onAction={handleAction} />
                    ) : (
                      m.content
                    )}
                    {m.role !== 'user' && !m.lesson && (
                      <ActionButtons actions={m.actions} onAction={handleAction} />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {coach.sending && <div className="coach-typing">Coach is thinking…</div>}

          <div className="coach-input-row">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Ask your coach anything…"
              aria-label="Message your coach"
            />
            <button onClick={handleSend} disabled={coach.sending || !draft.trim()}>➤</button>
          </div>
        </div>
      )}

      <div className="coach-dock" style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
        {coach.peek && !coach.panelOpen && (
          <DockPeek
            peek={coach.peek}
            onAction={(a) => {
              coach.dismissPeek();
              handleAction(a);
            }}
            onOpen={() => {
              coach.dismissPeek();
              coach.openPanel();
            }}
            onDismiss={coach.dismissPeek}
          />
        )}
        <button className="coach-dock-btn" onClick={coach.togglePanel} aria-label="Open Coach" title="Coach">
          <CoachGlyph />
          {coach.unread > 0 && <span className="coach-dock-badge">{coach.unread}</span>}
        </button>
      </div>
    </>
  );
};

export default CoachDock;
