/**
 * AI Coach — client state (Phase 1).
 *
 * One coach, one thread, everywhere:
 *  - panel open/closed + unread badge
 *  - conversation thread (server-persisted, shared across all surfaces)
 *  - debrief retrieval (idempotent server-side; results land in the thread too)
 *
 * Replaces the old AICompanion* stack (being decommissioned).
 */

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import {
  getCoachStatus,
  fetchDebrief,
  sendCoachChat,
  fetchCoachThread,
  observeCoach,
  requestMicroLessonApi,
  fetchLatestBriefing,
} from '../api/coachClient';
import { logEvent, EVENT_TYPES } from '../coach/events';

/* ---------------------------------------------------------------------------
 * Mission ticks (UI v2) — which briefing plan-items the student completed.
 * Kept client-side (localStorage) keyed noteId:itemId; the durable record is
 * the coach_interaction event each tick emits, which is what the coach itself
 * reads back ("did they take the advice?").
 * ------------------------------------------------------------------------- */
const MISSIONS_LS_KEY = 'ultrasat.coachMissions.v1';

function readMissionStore() {
  try {
    const raw = window.localStorage.getItem(MISSIONS_LS_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (e) {
    return {};
  }
}

function writeMissionStore(store) {
  try {
    // Prune to the newest ~60 ticks so the key can't grow forever.
    const entries = Object.entries(store)
      .sort((a, b) => (b[1] || 0) - (a[1] || 0))
      .slice(0, 60);
    window.localStorage.setItem(MISSIONS_LS_KEY, JSON.stringify(Object.fromEntries(entries)));
  } catch (e) {
    // storage unavailable — ticks survive in memory for this session only
  }
}

const CoachContext = createContext(null);
export const useCoach = () => useContext(CoachContext);

// Rendered by ActionButtons in CoachDock/CoachPage as a one-tap button.
const UPGRADE_ACTION = { type: 'link', route: '/membership/upgrade', label: 'Upgrade to Pro' };

export const CoachProvider = ({ children }) => {
  const { currentUser, userMembership } = useAuth();
  // Quotas are tiered (free: 3 chats/day, Pro: 60) — only pitch the upgrade
  // to users an upgrade would actually help.
  const isFreeTier = (userMembership?.tier || 'free') === 'free';

  const [available, setAvailable] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [thread, setThread] = useState([]);
  const [threadLoaded, setThreadLoaded] = useState(false);
  const [sending, setSending] = useState(false);
  // UI v2: the newest proactive note (blocks) + the dock's one-line peek +
  // which briefing missions are ticked.
  const [latestBriefing, setLatestBriefing] = useState(null);
  const [peek, setPeek] = useState(null); // { id, message, actions, surface }
  const [missionDone, setMissionDone] = useState(() =>
    typeof window === 'undefined' ? {} : readMissionStore()
  );
  const debriefCache = useRef({}); // quizId -> note
  const sessionObservedRef = useRef(false);

  // Availability check once per login
  useEffect(() => {
    let cancelled = false;
    if (!currentUser) {
      setAvailable(false);
      setThread([]);
      setThreadLoaded(false);
      setUnread(0);
      setLatestBriefing(null);
      setPeek(null);
      debriefCache.current = {};
      return undefined;
    }
    getCoachStatus()
      .then((s) => !cancelled && setAvailable(!!s.available))
      .catch(() => !cancelled && setAvailable(false));
    return () => {
      cancelled = true;
    };
  }, [currentUser]);

  // The newest proactive note (briefing / exam-note) with its blocks — the
  // Home hero and HQ "Today's brief" render from this. Read-only endpoint;
  // when it's empty or stale the surfaces build their mechanical fallback.
  useEffect(() => {
    let cancelled = false;
    if (!currentUser || !available) return undefined;
    fetchLatestBriefing()
      .then(({ note }) => !cancelled && note && setLatestBriefing(note))
      .catch(() => {}); // fallback surfaces handle absence
    return () => {
      cancelled = true;
    };
  }, [currentUser, available]);

  const loadThread = useCallback(async () => {
    if (!currentUser) return;
    try {
      const { messages } = await fetchCoachThread(30);
      setThread(messages || []);
      setThreadLoaded(true);
    } catch (e) {
      // thread stays empty; panel shows a friendly empty state
    }
  }, [currentUser]);

  const openPanel = useCallback(() => {
    setPanelOpen(true);
    setUnread(0);
    if (!threadLoaded) loadThread();
  }, [threadLoaded, loadThread]);

  const closePanel = useCallback(() => setPanelOpen(false), []);
  const togglePanel = useCallback(() => {
    if (panelOpen) setPanelOpen(false);
    else openPanel();
  }, [panelOpen, openPanel]);

  /** Append an assistant note/message into the local thread + badge.
      With the panel closed the note also becomes the dock's one-line PEEK
      (UI v2) — the dock still never auto-opens; the peek slides out once,
      then retracts to the badge. */
  const receiveNote = useCallback((entry) => {
    setThread((t) => [...t, { id: `note-${Date.now()}`, role: 'assistant', actions: [], ...entry, at: Date.now() }]);
    setPanelOpen((open) => {
      if (!open) {
        setUnread((u) => u + 1);
        if (!entry.error) {
          setPeek({ id: `peek-${Date.now()}`, message: entry.content, actions: entry.actions || [], surface: entry.surface || null });
        }
      }
      return open;
    });
  }, []);

  const dismissPeek = useCallback(() => setPeek(null), []);

  /**
   * Ping the Observer at a boundary. The server's significance rules decide
   * whether the coach actually speaks — most pings return nothing (free).
   */
  const observe = useCallback(
    async (trigger, refId) => {
      if (!currentUser || !available) return null;
      try {
        const { note } = await observeCoach(trigger, refId);
        if (note && note.message) {
          receiveNote({ content: note.message, actions: note.actions || [], surface: note.surfaceHint });
          if (['briefing', 'exam-note'].includes(note.kind)) {
            setLatestBriefing({ ...note, createdAt: note.createdAt || Date.now() });
          }
        }
        return note || null;
      } catch (e) {
        return null; // observer failures are always silent
      }
    },
    [currentUser, available, receiveNote]
  );

  // Session-start boundary: one Observer ping per app session.
  useEffect(() => {
    if (!currentUser || !available || sessionObservedRef.current) return;
    sessionObservedRef.current = true;
    observe('session_start');
  }, [currentUser, available, observe]);

  /**
   * Tick a briefing plan item (manual tick or auto-detected completion).
   * Emits coach_interaction — the closed loop: the coach can later see which
   * of its suggestions were actually taken.
   */
  const markMission = useCallback(
    (noteId, item, done, how = 'manual') => {
      if (!noteId || !item) return;
      const key = `${noteId}:${item.id}`;
      setMissionDone((prev) => {
        if (!!prev[key] === done) return prev;
        const next = { ...prev };
        if (done) next[key] = Date.now();
        else delete next[key];
        writeMissionStore(next);
        return next;
      });
      logEvent(EVENT_TYPES.COACH_INTERACTION, {
        kind: done ? 'mission_done' : 'mission_undone',
        noteId,
        adviceSummary: String(item.label || '').slice(0, 120),
        actionOffered: item.action ? item.action.type : 'none',
        actionTaken: done,
        how, // 'manual' tick vs 'auto' (matching quiz completed)
      });
    },
    []
  );

  /** Done-map for one note: { itemId: true } — what PlanBlock consumes. */
  const missionsFor = useCallback(
    (noteId) => {
      const out = {};
      if (!noteId) return out;
      const prefix = `${noteId}:`;
      for (const key of Object.keys(missionDone)) {
        if (key.startsWith(prefix)) out[key.slice(prefix.length)] = true;
      }
      return out;
    },
    [missionDone]
  );

  // Auto-tick: when a quiz completes for a subcategory the current briefing's
  // plan recommended, the mission marks itself done. events.js broadcasts every
  // logged activity event on window as 'ultrasat:activity'.
  useEffect(() => {
    if (typeof window === 'undefined' || !latestBriefing) return undefined;
    const plan = (latestBriefing.blocks || []).find((b) => b.type === 'plan');
    if (!plan) return undefined;
    const handler = (e) => {
      const ev = e.detail;
      if (!ev || ev.type !== 'quiz_completed') return;
      const subs = (ev.payload && ev.payload.subcategoryIds) || [];
      for (const item of plan.items) {
        if (
          item.action &&
          item.action.type === 'quiz' &&
          subs.includes(item.action.subcategoryId) &&
          !missionDone[`${latestBriefing.id}:${item.id}`]
        ) {
          markMission(latestBriefing.id, item, true, 'auto');
        }
      }
    };
    window.addEventListener('ultrasat:activity', handler);
    return () => window.removeEventListener('ultrasat:activity', handler);
  }, [latestBriefing, missionDone, markMission]);
  useEffect(() => {
    if (!currentUser) sessionObservedRef.current = false;
  }, [currentUser]);

  /** Generate a micro-lesson; the lesson card lands in the thread and the panel opens. */
  const requestMicroLesson = useCallback(
    async ({ conceptId, subcategoryId }) => {
      if (!currentUser || !available) return null;
      try {
        const { lesson } = await requestMicroLessonApi({ conceptId, subcategoryId });
        if (lesson) {
          setThread((t) => [
            ...t,
            { id: `lesson-${Date.now()}`, role: 'assistant', content: lesson.title, lesson, actions: [], at: Date.now() },
          ]);
          setPanelOpen(true);
          setUnread(0);
          if (!threadLoaded) setThreadLoaded(true); // thread now has local content worth showing
        }
        return lesson || null;
      } catch (e) {
        const quotaHit = e.status === 429;
        receiveNote({
          content: quotaHit
            ? isFreeTier
              ? "You've used today's free coach allowance, so the lesson has to wait — Pro gives us a lot more time together every day."
              : "You've hit today's coach limit — the lesson will have to wait until tomorrow."
            : "I couldn't write that lesson just now — try again in a moment.",
          actions: quotaHit && isFreeTier ? [UPGRADE_ACTION] : [],
          error: true,
        });
        return null;
      }
    },
    [currentUser, available, threadLoaded, receiveNote, isFreeTier]
  );

  /**
   * Get the Coach's read for a completed quiz (idempotent server-side).
   * Also refreshes the thread and lights the badge if the panel is closed.
   */
  const getDebrief = useCallback(
    async (quizId) => {
      if (!currentUser || !available || !quizId) return null;
      if (debriefCache.current[quizId]) return debriefCache.current[quizId];
      const { note, cached } = await fetchDebrief(quizId);
      debriefCache.current[quizId] = note;
      if (!cached) {
        setUnread((u) => (panelOpen ? 0 : u + 1));
        if (threadLoaded) loadThread();
      }
      return note;
    },
    [currentUser, available, panelOpen, threadLoaded, loadThread]
  );

  /** Send a chat message from any surface; optimistic append. */
  const sendMessage = useCallback(
    async (text, surface = {}) => {
      if (!currentUser || !available || !text.trim() || sending) return null;
      setSending(true);
      const optimistic = { id: `local-${Date.now()}`, role: 'user', content: text, actions: [], at: Date.now() };
      setThread((t) => [...t, optimistic]);
      try {
        const reply = await sendCoachChat(text, surface);
        setThread((t) => [
          ...t,
          { id: `local-${Date.now()}-a`, role: 'assistant', content: reply.message, actions: reply.actions || [], at: Date.now() },
        ]);
        return reply;
      } catch (e) {
        const quotaHit = e.status === 429;
        const friendly = quotaHit
          ? isFreeTier
            ? "That's the last of today's free coach messages — Pro gets you 60 a day, or catch me again tomorrow."
            : "You've hit today's coach limit — back tomorrow!"
          : "I couldn't reach the coach service just now. Try again in a moment.";
        setThread((t) => [
          ...t,
          {
            id: `local-${Date.now()}-e`,
            role: 'assistant',
            content: friendly,
            actions: quotaHit && isFreeTier ? [UPGRADE_ACTION] : [],
            at: Date.now(),
            error: true,
          },
        ]);
        return null;
      } finally {
        setSending(false);
      }
    },
    [currentUser, available, sending, isFreeTier]
  );

  const value = {
    available,
    panelOpen,
    unread,
    thread,
    sending,
    openPanel,
    closePanel,
    togglePanel,
    loadThread,
    getDebrief,
    sendMessage,
    observe,
    requestMicroLesson,
    // UI v2
    latestBriefing,
    peek,
    dismissPeek,
    markMission,
    missionsFor,
  };

  return <CoachContext.Provider value={value}>{children}</CoachContext.Provider>;
};

export default CoachContext;
