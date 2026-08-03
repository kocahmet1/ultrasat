/**
 * AI Coach — the dedicated coach page (replaces the old static AICoachPage).
 *
 * Left: the one conversation thread (same thread as the dock panel).
 * Right: "What I know about you" — goals, weakest skills from Tier-2, and the
 * coach's notebook (full transparency into the coach's memory).
 */

import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSend } from 'react-icons/fi';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { useCoach } from '../contexts/CoachContext';
import { LessonCard, ActionButtons } from '../components/coach/CoachDock';
import { fetchNotebook } from '../api/coachClient';
import { getDisplayName } from '../utils/subcategoryTaxonomy';
import '../components/coach/coach.css';

const CoachGlyph = ({ size = 17 }) => (
  <svg viewBox="0 0 24 24" fill="none" width={size} height={size} aria-hidden="true">
    <path d="M12 3l1.8 4.7L18.5 9l-4.7 1.8L12 15.5l-1.8-4.7L5.5 9l4.7-1.3L12 3z" fill="#fff" />
    <circle cx="18.5" cy="17" r="2.2" fill="#fff" opacity=".85" />
  </svg>
);

const TREND_LABEL = { improving: '▲ improving', declining: '▼ slipping', stable: '· steady', insufficient: '· new' };

const CoachPage = () => {
  const { currentUser } = useAuth();
  const coach = useCoach();
  const navigate = useNavigate();
  const [draft, setDraft] = useState('');
  const [profile, setProfile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [notebook, setNotebook] = useState(null);
  const [showNotebook, setShowNotebook] = useState(false);

  useEffect(() => {
    if (coach && !coach.panelOpen) coach.loadThread();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!currentUser) return;
      try {
        const [userSnap, skillSnap] = await Promise.all([
          getDoc(doc(db, 'users', currentUser.uid)),
          getDocs(collection(db, 'users', currentUser.uid, 'skillState')),
        ]);
        if (cancelled) return;
        setProfile(userSnap.exists() ? userSnap.data() : {});
        setSkills(skillSnap.docs.map((d) => ({ id: d.id, ...d.data() })).filter((s) => s.attempts > 0));
      } catch (e) {
        // page still works without the sidebar data
      }
      try {
        const nb = await fetchNotebook();
        if (!cancelled) setNotebook(nb);
      } catch (e) {
        if (!cancelled) setNotebook(null);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [currentUser]);

  const focusSkills = useMemo(
    () =>
      [...skills]
        .sort((a, b) => (a.accuracyLast10 ?? 101) - (b.accuracyLast10 ?? 101))
        .slice(0, 6),
    [skills]
  );

  const examCountdown = useMemo(() => {
    if (!profile?.examDate) return null;
    const ms = Date.parse(profile.examDate) - Date.now();
    if (Number.isNaN(ms)) return null;
    return ms > 0 ? Math.ceil(ms / 86400000) : null;
  }, [profile]);

  if (!coach) return null;

  const handleAction = (action) => {
    if (action.type === 'lesson') {
      coach.requestMicroLesson({ conceptId: action.conceptId, subcategoryId: action.subcategoryId });
      return;
    }
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
    await coach.sendMessage(text, { route: '/coach' });
  };

  const suggestions = [
    'What should I work on today?',
    'Where am I losing the most points?',
    'Make me a plan for this week',
  ];

  return (
    <div className="coach-page">
      <div className="ut-page-head">
        <div className="ut-page-head-main">
          <span className="ut-eyebrow">Coach</span>
          <h1 className="ut-page-title">Your coach</h1>
          <p className="ut-page-sub">
            One conversation across the whole app — it debriefs your quizzes, teaches micro-lessons, and remembers your journey.
          </p>
        </div>
      </div>
      <div className="coach-page-grid">
        {/* Conversation */}
        <div className="coach-page-thread">
          <div className="coach-panel-header" style={{ paddingLeft: 0 }}>
            <div className="coach-avatar"><CoachGlyph /></div>
            <div>
              <div className="coach-panel-title">Coach</div>
              <div className="coach-panel-sub">
                {coach.available ? 'one conversation, every page' : 'coach is not available right now'}
              </div>
            </div>
          </div>

          <div className="coach-page-feed">
            {coach.thread.length === 0 ? (
              <div className="coach-empty">
                No conversation yet. Finish a quiz and I'll tell you what it means — or ask me anything below.
                <div className="coach-suggestions">
                  {suggestions.map((text) => (
                    <button
                      key={text}
                      className="coach-suggestion"
                      disabled={!coach.available || coach.sending}
                      onClick={() => coach.sendMessage(text, { route: '/coach' })}
                    >
                      {text}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              coach.thread.map((m) => (
                <div key={m.id} className={`coach-msg ${m.role === 'user' ? 'user' : ''}`}>
                  {m.role !== 'user' && <div className="coach-avatar"><CoachGlyph size={14} /></div>}
                  <div className="coach-bubble">
                    {m.lesson ? <LessonCard lesson={m.lesson} onAction={handleAction} /> : m.content}
                    {m.role !== 'user' && !m.lesson && <ActionButtons actions={m.actions} onAction={handleAction} />}
                  </div>
                </div>
              ))
            )}
            {coach.sending && <div className="coach-typing">Coach is thinking…</div>}
          </div>

          <div className="coach-input-row" style={{ paddingLeft: 0, paddingRight: 0 }}>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Ask your coach anything…"
              disabled={!coach.available}
            />
            <button onClick={handleSend} disabled={!coach.available || coach.sending || !draft.trim()}><FiSend /></button>
          </div>
        </div>

        {/* What I know about you */}
        <div className="coach-page-side">
          <div className="coach-side-card">
            <h3>Your goal</h3>
            <div className="coach-goal-row"><span>Target score</span><b>{profile?.targetScore || 'not set'}</b></div>
            <div className="coach-goal-row">
              <span>Exam date</span>
              <b>{profile?.examDate ? `${profile.examDate}${examCountdown ? ` · ${examCountdown}d` : ''}` : 'not set'}</b>
            </div>
          </div>

          <div className="coach-side-card">
            <h3>Current focus <span className="coach-side-hint">weakest first, from your real practice</span></h3>
            {focusSkills.length === 0 ? (
              <div className="coach-side-empty">No tracked practice yet — take a quiz to give me something to work with.</div>
            ) : (
              focusSkills.map((s) => (
                <button
                  key={s.id}
                  className="coach-skill-row"
                  onClick={() => handleAction({ type: 'quiz', subcategoryId: s.id })}
                  title="Practice this skill"
                >
                  <span className="coach-skill-name">{getDisplayName(s.id) || s.id}</span>
                  <span className={`coach-skill-trend ${s.trend}`}>{TREND_LABEL[s.trend] || s.trend}</span>
                  <span className="coach-skill-acc">{s.accuracyLast10 === null ? '—' : `${s.accuracyLast10}%`}</span>
                </button>
              ))
            )}
          </div>

          <div className="coach-side-card">
            <h3>
              What I know about you
              <button className="coach-notebook-toggle" onClick={() => setShowNotebook((v) => !v)}>
                {showNotebook ? 'hide' : 'show'}
              </button>
            </h3>
            {showNotebook ? (
              notebook?.text ? (
                <pre className="coach-notebook-text">{notebook.text}</pre>
              ) : (
                <div className="coach-side-empty">Nothing yet — my notes build up as you practice.</div>
              )
            ) : (
              <div className="coach-side-empty">
                My working notes about your goals, progress, and patterns. Everything here comes from your actual
                activity — nothing is invented.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoachPage;
