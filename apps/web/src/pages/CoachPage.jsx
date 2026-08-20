/**
 * AI Coach — /coach, rebuilt as HQ (UI v2).
 *
 * Not a chat log: a control room rendered from state the engine already keeps.
 *   left  — trajectory (real practice-exam sittings → projection vs target),
 *           the coach-ranked focus queue, the journey timeline
 *   right — today's brief (latest note blocks), commitments (structured
 *           follow-ups from the notebook), wins/watchlist, memory drawer
 *   bottom — the ask bar; the full conversation lives in a slide-over drawer.
 *
 * Every number here is Tier-2 / authoritative-store data the student can
 * already see elsewhere; the model's judgment arrives only inside note blocks.
 * The page must work fully (queue, trajectory, journey) when the coach
 * service is down — only the brief card and ask bar degrade.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSend } from 'react-icons/fi';
import { doc, getDoc, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { useCoach } from '../contexts/CoachContext';
import { LessonCard, ActionButtons } from '../components/coach/CoachDock';
import CoachBlocks, { ensureBlocks, Spark } from '../components/coach/CoachBlocks';
import { fetchNotebook, fetchStrategy } from '../api/coachClient';
import { estimatedSATFromSkillState } from '../utils/scoring';
import { getDisplayName } from '../utils/subcategoryTaxonomy';
import { describeSignalReasons } from '../coach/signalQuality';
import '../components/coach/coach.css';

const CoachGlyph = ({ size = 20 }) => (
  <svg viewBox="0 0 24 24" fill="none" width={size} height={size} aria-hidden="true">
    <path d="M12 3l1.8 4.7L18.5 9l-4.7 1.8L12 15.5l-1.8-4.7L5.5 9l4.7-1.3L12 3z" fill="#fff" />
    <circle cx="18.5" cy="17" r="2.2" fill="#fff" opacity=".85" />
  </svg>
);

const DAY_MS = 86400000;
const BRIEFING_FRESH_MS = 36 * 3600 * 1000;

const toMs = (v) => {
  if (!v) return null;
  if (typeof v.toMillis === 'function') return v.toMillis();
  if (v instanceof Date) return v.getTime();
  if (typeof v === 'number') return v;
  const ms = Date.parse(v);
  return Number.isNaN(ms) ? null : ms;
};

const fmtDay = (ms) =>
  ms ? new Date(ms).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';

const humanizeConcept = (id) => String(id || '').replace(/[-_]/g, ' ');

/* ─────────────────────────────────────────────── trajectory chart ──────── */
/**
 * Practice-exam sittings (authoritative users/{uid}/practiceExams scores) as a
 * single-hue line, today's practice estimate as a hollow point, a dashed
 * linear projection to exam day, and the target as a labeled rule. One axis,
 * direct labels, hairline grid; hover via native <title> on ≥24px hit areas.
 */
export const TrajectoryChart = ({ sittings, estimate, target, examDateMs }) => {
  const now = Date.now();
  if (!sittings.length) {
    return (
      <div className="ut-empty" style={{ padding: '26px 18px' }}>
        <b>No full practice exams yet</b>
        Your score trajectory starts with the first completed exam — the diagnostic counts.
      </div>
    );
  }

  const W = 640, H = 230, L = 46, R = 78, T = 16, B = 28;

  // Projection: least-squares slope over the last ≤5 sittings, to exam day.
  let proj = null;
  if (sittings.length >= 2 && examDateMs && examDateMs > now) {
    const pts = sittings.slice(-5);
    const n = pts.length;
    const mx = pts.reduce((s, p) => s + p.ms, 0) / n;
    const my = pts.reduce((s, p) => s + p.total, 0) / n;
    const denom = pts.reduce((s, p) => s + (p.ms - mx) * (p.ms - mx), 0);
    if (denom > 0) {
      const slope = pts.reduce((s, p) => s + (p.ms - mx) * (p.total - my), 0) / denom;
      const value = Math.round((my + slope * (examDateMs - mx)) / 10) * 10;
      proj = { ms: examDateMs, total: Math.max(400, Math.min(1600, value)) };
    }
  }

  const estPoint = estimate ? { ms: now, total: estimate } : null;

  const x0 = sittings[0].ms - 5 * DAY_MS;
  const x1 = Math.max(examDateMs || 0, now + 7 * DAY_MS, sittings[sittings.length - 1].ms + 7 * DAY_MS) + 4 * DAY_MS;
  const values = [
    ...sittings.map((p) => p.total),
    ...(estPoint ? [estPoint.total] : []),
    ...(proj ? [proj.total] : []),
    ...(target ? [target] : []),
  ];
  let y0 = Math.max(400, Math.floor((Math.min(...values) - 80) / 50) * 50);
  let y1 = Math.min(1600, Math.ceil((Math.max(...values) + 80) / 50) * 50);
  if (y1 - y0 < 200) y1 = Math.min(1600, y0 + 200);

  const X = (ms) => L + ((ms - x0) / (x1 - x0)) * (W - L - R);
  const Y = (v) => T + (1 - (v - y0) / (y1 - y0)) * (H - T - B);

  const step = y1 - y0 > 500 ? 200 : 100;
  const gridVals = [];
  for (let v = Math.ceil(y0 / step) * step; v <= y1; v += step) gridVals.push(v);

  const months = [];
  const mCursor = new Date(x0);
  mCursor.setDate(1);
  mCursor.setMonth(mCursor.getMonth() + 1);
  while (mCursor.getTime() < x1) {
    months.push({ ms: mCursor.getTime(), label: mCursor.toLocaleDateString('en-US', { month: 'short' }) });
    mCursor.setMonth(mCursor.getMonth() + 1);
  }

  const linePath = sittings.map((p, i) => `${i ? 'L' : 'M'}${X(p.ms).toFixed(1)},${Y(p.total).toFixed(1)}`).join(' ');
  const last = sittings[sittings.length - 1];
  const maxSit = sittings.reduce((a, b) => (b.total > a.total ? b : a), sittings[0]);

  const hoverPts = [
    ...sittings.map((p) => ({ ...p, title: `${p.total} · ${p.label}` })),
    ...(estPoint ? [{ ...estPoint, hollow: true, title: `${estPoint.total} · practice estimate (today)` }] : []),
    ...(proj ? [{ ...proj, hollow: true, dashed: true, title: `~${proj.total} · projected at current pace` }] : []),
  ];

  return (
    <>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: '100%', height: 'auto', display: 'block' }}
        role="img"
        aria-label={`Score trajectory: ${sittings.map((p) => p.total).join(', ')}${
          estimate ? `; practice estimate ${estimate}` : ''
        }${proj ? `; projected ${proj.total}` : ''}${target ? `; target ${target}` : ''}`}
      >
        {gridVals.map((v) => (
          <g key={v}>
            <line x1={L} x2={W - R + 44} y1={Y(v)} y2={Y(v)} stroke="var(--ut-rule)" strokeWidth="1" />
            <text x={L - 8} y={Y(v) + 3.5} textAnchor="end" fontFamily="var(--ut-font-mono)" fontSize="9.5" fill="var(--ut-mono-muted)">
              {v}
            </text>
          </g>
        ))}
        {months.map((m) => (
          <text key={m.ms} x={X(m.ms)} y={H - 8} fontFamily="var(--ut-font-mono)" fontSize="9.5" fill="var(--ut-mono-muted)">
            {m.label}
          </text>
        ))}

        {target && (
          <g>
            <line x1={L} x2={W - R + 44} y1={Y(target)} y2={Y(target)} stroke="#98A3B5" strokeWidth="1.5" strokeDasharray="5 4" />
            <text x={L + 4} y={Y(target) - 5} fontFamily="var(--ut-font-mono)" fontSize="9" fill="var(--ut-mono-muted)">
              TARGET {target}
            </text>
          </g>
        )}
        {examDateMs && examDateMs > x0 && examDateMs < x1 && (
          <g>
            <line x1={X(examDateMs)} x2={X(examDateMs)} y1={T} y2={H - B} stroke="var(--ut-rule-strong)" strokeWidth="1" strokeDasharray="2 3" />
            <text x={X(examDateMs)} y={T - 4} textAnchor="middle" fontFamily="var(--ut-font-mono)" fontSize="8.5" fill="var(--ut-mono-muted)">
              EXAM
            </text>
          </g>
        )}

        <path d={linePath} fill="none" stroke="var(--ut-accent)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {estPoint && (
          <path
            d={`M${X(last.ms)},${Y(last.total)} L${X(estPoint.ms)},${Y(estPoint.total)}`}
            fill="none" stroke="var(--ut-accent)" strokeWidth="2" strokeDasharray="1.5 4" strokeLinecap="round"
          />
        )}
        {proj && (
          <path
            d={`M${X((estPoint || last).ms)},${Y((estPoint || last).total)} L${X(proj.ms)},${Y(proj.total)}`}
            fill="none" stroke="var(--ut-accent)" strokeWidth="2" strokeDasharray="6 5" strokeLinecap="round" opacity="0.8"
          />
        )}

        {proj && target && Math.abs(target - proj.total) >= 30 && (
          <g>
            <line x1={X(proj.ms) + 12} x2={X(proj.ms) + 12} y1={Y(target)} y2={Y(proj.total)} stroke="var(--ut-danger)" strokeWidth="1.5" />
            <text
              x={X(proj.ms) + 17}
              y={(Y(target) + Y(proj.total)) / 2 + 3}
              fontFamily="var(--ut-font-mono)" fontSize="9.5"
              fill={proj.total >= target ? 'var(--ut-success-dark)' : 'var(--ut-danger-dark)'}
            >
              {proj.total >= target ? '+' : '−'}{Math.abs(proj.total - target)}
            </text>
          </g>
        )}

        {/* direct labels: first, best, today, projection */}
        <text x={X(sittings[0].ms)} y={Y(sittings[0].total) + 18} textAnchor="middle" fontFamily="var(--ut-font-mono)" fontSize="9.5" fill="var(--ut-mono-muted)">
          {sittings[0].total}
        </text>
        {maxSit !== sittings[0] && (
          <text x={X(maxSit.ms)} y={Y(maxSit.total) - 10} textAnchor="middle" fontFamily="var(--ut-font-mono)" fontSize="9.5" fill="var(--ut-mono-muted)">
            {maxSit.total}
          </text>
        )}
        {estPoint && (
          <text x={X(estPoint.ms)} y={Y(estPoint.total) - 11} textAnchor="middle" fontFamily="var(--ut-font-mono)" fontSize="9.5" fill="var(--ut-accent-dark)">
            {estPoint.total} · today
          </text>
        )}
        {proj && (
          <text x={X(proj.ms) - 6} y={Y(proj.total) + 16} textAnchor="end" fontFamily="var(--ut-font-mono)" fontSize="9.5" fill="var(--ut-accent-dark)">
            ~{proj.total}
          </text>
        )}

        {hoverPts.map((p, i) => (
          <g key={i}>
            <circle
              cx={X(p.ms)} cy={Y(p.total)} r="4.5"
              fill={p.hollow ? 'var(--ut-card)' : 'var(--ut-accent)'}
              stroke="var(--ut-accent)" strokeWidth="2"
              strokeDasharray={p.dashed ? '2 2' : undefined}
            />
            <circle cx={X(p.ms)} cy={Y(p.total)} r="12" fill="transparent" style={{ cursor: 'pointer' }}>
              <title>{p.title}</title>
            </circle>
          </g>
        ))}
      </svg>
      <div className="cvq-traj-legend">
        <span className="cvq-traj-key"><i />Sittings</span>
        {proj && <span className="cvq-traj-key"><i className="proj" />Projection at current pace</span>}
        {target && <span className="cvq-traj-key"><i className="tgt" />Target {target}</span>}
      </div>
    </>
  );
};

/* ──────────────────────────────────────────────────── the HQ page ──────── */

const CoachPage = () => {
  const { currentUser } = useAuth();
  const coach = useCoach();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [concepts, setConcepts] = useState([]);
  const [exams, setExams] = useState([]);
  const [notebook, setNotebook] = useState(null); // { text, commitments }
  const [strategy, setStrategy] = useState(null); // { current, run } — the deep pass
  const [showNotebook, setShowNotebook] = useState(false);
  const [draft, setDraft] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!currentUser) return;
      try {
        const [userSnap, skillSnap, conceptSnap, examSnap] = await Promise.all([
          getDoc(doc(db, 'users', currentUser.uid)),
          getDocs(collection(db, 'users', currentUser.uid, 'skillState')),
          getDocs(collection(db, 'users', currentUser.uid, 'conceptState')),
          getDocs(
            query(collection(db, 'users', currentUser.uid, 'practiceExams'), orderBy('completedAt', 'desc'), limit(24))
          ).catch(() => ({ docs: [] })), // legacy docs without completedAt: trajectory just starts later
        ]);
        if (cancelled) return;
        setProfile(userSnap.exists() ? userSnap.data() : {});
        setSkills(skillSnap.docs.map((d) => ({ id: d.id, ...d.data() })).filter((s) => s.attempts > 0));
        setConcepts(conceptSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setExams(examSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (e) {
        // page still renders; sections show their empty states
      }
      try {
        const nb = await fetchNotebook();
        if (!cancelled) setNotebook(nb);
      } catch (e) {
        if (!cancelled) setNotebook(null);
      }
      try {
        const st = await fetchStrategy();
        if (!cancelled) setStrategy(st);
      } catch (e) {
        if (!cancelled) setStrategy(null);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [currentUser]);

  useEffect(() => {
    if (coach && drawerOpen) coach.loadThread();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawerOpen]);

  /* ---- derived ---- */

  const examDateMs = profile?.examDate ? Date.parse(profile.examDate) : null;
  const examCountdown =
    examDateMs && !Number.isNaN(examDateMs) && examDateMs > Date.now()
      ? Math.ceil((examDateMs - Date.now()) / DAY_MS)
      : null;
  const target = Number.isFinite(profile?.targetScore)
    ? profile.targetScore
    : parseInt(profile?.targetScore, 10) || null;

  // Real sittings, the coach's view of them (excluded results stay excluded;
  // low-signal sittings — blank/rushed, coachSignal.lowSignal — are evidence
  // for nothing, so they stay off the trajectory and only appear in the
  // journey as "logged, overlooked").
  const sittings = useMemo(
    () =>
      exams
        .filter((e) => e.excludedFromCoach !== true && !e.isPartial && !e.coachSignal?.lowSignal)
        .map((e) => {
          const rw = Number.isFinite(e.scores?.readingWriting) ? e.scores.readingWriting : null;
          const math = Number.isFinite(e.scores?.math) ? e.scores.math : null;
          const total = Number.isFinite(e.scores?.total) ? e.scores.total : rw !== null && math !== null ? rw + math : null;
          const ms = toMs(e.completedAt);
          if (total === null || !ms) return null;
          return { ms, total, label: e.isDiagnostic ? 'Diagnostic' : e.examTitle || 'Practice exam' };
        })
        .filter(Boolean)
        .sort((a, b) => a.ms - b.ms)
        .slice(-10),
    [exams]
  );

  const clientEstimate = useMemo(() => estimatedSATFromSkillState(skills), [skills]);

  // The coach-ranked focus queue — same ranking rules the observer's prompts
  // describe: regression > repeat-missing concept > slipping skill > stale >
  // merely weakest. Fully mechanical, so it renders with the service down.
  const queue = useMemo(() => {
    const now = Date.now();
    const items = [];
    const seen = new Set();
    const push = (item) => {
      if (items.length >= 4 || seen.has(item.key)) return;
      seen.add(item.key);
      items.push({ ...item, rank: items.length + 1 });
    };

    [...concepts]
      .filter((c) => c.regressionFlag)
      .sort((a, b) => (toMs(b.lastMissedTs) || 0) - (toMs(a.lastMissedTs) || 0))
      .forEach((c) => {
        const patterns = Object.entries(c.errorPatterns || {}).sort((a, b) => b[1] - a[1]);
        push({
          key: `c:${c.conceptId || c.id}`,
          flag: 'bad',
          name: humanizeConcept(c.conceptId || c.id),
          detail: c.subcategoryId ? getDisplayName(c.subcategoryId) : null,
          acc: c.accuracy != null ? `${c.accuracy}% lifetime` : '',
          spark: (c.lastResults || []).slice(-10),
          why: (
            <>
              <b>Regressed</b> — recovered {fmtDay(toMs(c.recoveredTs))}, missing again since {fmtDay(toMs(c.lastMissedTs))}.
              {patterns.length > 0 && <> Dominant error: <b>{patterns[0][0]}</b>.</>} The cheapest points on the board.
            </>
          ),
          actions: [
            c.subcategoryId && { type: 'quiz', subcategoryId: c.subcategoryId, label: 'Fix-it drill' },
            { type: 'lesson', conceptId: c.conceptId || c.id, subcategoryId: c.subcategoryId || undefined, label: '60-second lesson' },
          ].filter(Boolean),
        });
      });

    [...concepts]
      .filter((c) => !c.regressionFlag && (c.missStreak || 0) >= 2)
      .sort((a, b) => (b.missStreak || 0) - (a.missStreak || 0))
      .forEach((c) => {
        push({
          key: `c:${c.conceptId || c.id}`,
          flag: 'warn',
          name: humanizeConcept(c.conceptId || c.id),
          detail: c.subcategoryId ? getDisplayName(c.subcategoryId) : null,
          acc: `miss streak ${c.missStreak}`,
          spark: (c.lastResults || []).slice(-10),
          why: (
            <>
              Missed <b>{c.missStreak} in a row</b>, last on {fmtDay(toMs(c.lastMissedTs))} — one focused drill before it settles in.
            </>
          ),
          actions: [
            c.subcategoryId && { type: 'quiz', subcategoryId: c.subcategoryId, label: 'Drill it now' },
            { type: 'lesson', conceptId: c.conceptId || c.id, subcategoryId: c.subcategoryId || undefined, label: '60-second lesson' },
          ].filter(Boolean),
        });
      });

    [...skills]
      .filter((s) => s.trend === 'declining')
      .sort((a, b) => (a.accuracyLast10 ?? 101) - (b.accuracyLast10 ?? 101))
      .forEach((s) => {
        const sub = s.subcategoryId || s.id;
        push({
          key: `s:${sub}`,
          flag: 'warn',
          name: getDisplayName(sub) || sub,
          acc: `${s.accuracyLast10 ?? '—'}% last 10`,
          spark: (s.lastResults || []).slice(-10),
          why: (
            <>
              <b>Slipping</b> — last 10 at {s.accuracyLast10 ?? '—'}% against {s.accuracy}% lifetime over {s.attempts} questions.
            </>
          ),
          actions: [{ type: 'quiz', subcategoryId: sub, label: 'Steady it: 5 questions' }],
        });
      });

    const now8 = now - 8 * DAY_MS;
    [...skills]
      .filter((s) => s.attempts >= 5 && s.lastPracticedTs && toMs(s.lastPracticedTs) < now8 && s.trend !== 'declining')
      .sort((a, b) => toMs(a.lastPracticedTs) - toMs(b.lastPracticedTs))
      .forEach((s) => {
        const sub = s.subcategoryId || s.id;
        const idle = Math.round((now - toMs(s.lastPracticedTs)) / DAY_MS);
        push({
          key: `s:${sub}`,
          flag: '',
          name: getDisplayName(sub) || sub,
          acc: `${s.accuracyLast10 ?? '—'}% · ${idle}d idle`,
          spark: (s.lastResults || []).slice(-10),
          why: (
            <>
              Nothing wrong — just fading. <b>{idle} days untouched</b>; a 5-question wake-up holds it.
            </>
          ),
          actions: [{ type: 'quiz', subcategoryId: sub, label: 'Wake-up set' }],
        });
      });

    [...skills]
      .sort((a, b) => (a.accuracyLast10 ?? 101) - (b.accuracyLast10 ?? 101))
      .forEach((s) => {
        const sub = s.subcategoryId || s.id;
        push({
          key: `s:${sub}`,
          flag: '',
          name: getDisplayName(sub) || sub,
          acc: `${s.accuracyLast10 ?? '—'}% last 10`,
          spark: (s.lastResults || []).slice(-10),
          why: (
            <>
              Your weakest skill right now — {s.accuracyLast10 ?? '—'}% over the last 10, {s.accuracy}% lifetime.
            </>
          ),
          actions: [{ type: 'quiz', subcategoryId: sub, label: 'Practice now' }],
        });
      });

    return items;
  }, [skills, concepts]);

  const wins = useMemo(
    () =>
      [...skills]
        .filter((s) => s.trend === 'improving')
        .sort((a, b) => (b.accuracyLast10 ?? 0) - (a.accuracyLast10 ?? 0))
        .slice(0, 3),
    [skills]
  );

  const watchlist = useMemo(
    () => queue.filter((q) => q.flag).slice(0, 3),
    [queue]
  );

  const journey = useMemo(() => {
    const ev = [];
    const asc = [...sittings];
    asc.forEach((s, i) => {
      const delta = i > 0 ? s.total - asc[i - 1].total : null;
      ev.push({
        ms: s.ms,
        cls: 'exam',
        node: (
          <>
            <b>{s.label}: {s.total}</b>
            {delta !== null && <> ({delta >= 0 ? '+' : '−'}{Math.abs(delta)})</>}
          </>
        ),
      });
    });
    concepts.forEach((c) => {
      const rec = toMs(c.recoveredTs);
      const miss = toMs(c.lastMissedTs);
      if (rec) {
        ev.push({ ms: rec, cls: 'good', node: <><b>{humanizeConcept(c.conceptId || c.id)}</b> recovered — the fix stuck</> });
      }
      if (c.regressionFlag && miss) {
        ev.push({ ms: miss, cls: 'bad', node: <><b>{humanizeConcept(c.conceptId || c.id)}</b> regression flagged — was fixed, slipping again</> });
      }
    });
    // Overlooked sittings: acknowledged, never analyzed.
    exams
      .filter((e) => e.excludedFromCoach !== true && e.coachSignal?.lowSignal)
      .forEach((e) => {
        const ms = toMs(e.completedAt);
        if (!ms) return;
        ev.push({
          ms,
          cls: '',
          node: (
            <>
              <b>{e.isDiagnostic ? 'Diagnostic' : 'Practice exam'} sitting logged</b> — overlooked (
              {describeSignalReasons(e.coachSignal.reasons)})
            </>
          ),
        });
      });
    return ev
      .filter((e) => e.ms)
      .sort((a, b) => b.ms - a.ms)
      .slice(0, 8);
  }, [sittings, concepts, exams]);

  const commitments = useMemo(() => {
    const list = notebook?.commitments || [];
    const today = new Date().toISOString().slice(0, 10);
    return list
      .map((c) => {
        const ms = Date.parse(c.dueDate);
        return {
          ...c,
          due: c.dueDate <= today,
          dayNum: Number.isNaN(ms) ? '' : new Date(ms).getDate(),
          weekday: Number.isNaN(ms) ? '' : new Date(ms).toLocaleDateString('en-US', { weekday: 'short' }),
        };
      })
      .sort((a, b) => (a.dueDate < b.dueDate ? -1 : 1));
  }, [notebook]);

  const briefing = useMemo(() => {
    const note = coach?.latestBriefing;
    if (!note || !note.createdAt || Date.now() - note.createdAt > BRIEFING_FRESH_MS) return null;
    const blocks = ensureBlocks(note);
    return blocks.length ? { note, blocks } : null;
  }, [coach?.latestBriefing]);

  /* ---- actions ---- */

  const handleAction = useCallback(
    (action) => {
      if (!action) return;
      if (action.type === 'lesson') {
        coach?.requestMicroLesson?.({ conceptId: action.conceptId, subcategoryId: action.subcategoryId });
        return;
      }
      if (action.type === 'quiz' && action.subcategoryId) {
        navigate('/smart-quiz-generator', {
          state: { subcategoryId: action.subcategoryId, ...(action.level ? { forceLevel: action.level } : {}) },
        });
      } else if (action.type === 'link' && action.route) {
        navigate(action.route);
      }
    },
    [coach, navigate]
  );

  const handleAsk = async (text) => {
    const msg = (text || '').trim();
    if (!msg || !coach?.available) return;
    setDraft('');
    setDrawerOpen(true);
    await coach.sendMessage(msg, { route: '/coach' });
  };

  if (!coach) return null;

  const headline =
    examCountdown && target
      ? `${examCountdown} days to a ${target}. Here's the state of it.`
      : target
        ? `Chasing ${target}. Here's the state of it.`
        : "Here's the state of your prep.";

  return (
    <div className="coach-page">
      {/* ── head ── */}
      <div className="cvq-head">
        <div className="cvq-headline">
          <span className="cvq-glyph"><CoachGlyph /></span>
          <div>
            <span className="ut-eyebrow" style={{ marginBottom: 4 }}>Coach · HQ</span>
            <h1 className="ut-page-title" style={{ fontSize: 23 }}>{headline}</h1>
          </div>
        </div>
        {!coach.available && (
          <span className="cv2-label">coach service offline — live data only</span>
        )}
      </div>

      <div className="cvq-grid">
        {/* ─────────── left column ─────────── */}
        <div className="cvq-col">
          <div className="coach-side-card">
            <div className="cvq-sec-label">
              <span className="cv2-label">Trajectory</span>
              <span className="cv2-label" style={{ fontSize: 9 }}>real practice-exam scores · hover the points</span>
            </div>
            <TrajectoryChart
              sittings={sittings}
              estimate={clientEstimate?.total || null}
              target={target}
              examDateMs={examDateMs && !Number.isNaN(examDateMs) ? examDateMs : null}
            />
          </div>

          <div>
            <div className="cvq-sec-label"><span className="cv2-label">Focus queue — ranked like the coach ranks it</span></div>
            {queue.length === 0 ? (
              <div className="ut-empty" style={{ padding: '26px 18px' }}>
                <b>No tracked practice yet</b>
                Take a quiz or the diagnostic and the queue builds itself from your real misses.
              </div>
            ) : (
              queue.map((q) => (
                <div key={q.key} className={`cvq-queue-card ${q.flag ? `flag-${q.flag}` : ''}`}>
                  <div className="cvq-queue-top">
                    <span className="cvq-rank">{q.rank}</span>
                    <span className="cvq-queue-name">
                      {q.name}
                      {q.detail && <span style={{ color: 'var(--ut-mono-muted)', fontWeight: 500 }}> · {q.detail}</span>}
                    </span>
                    <span className="cvq-queue-nums">
                      {q.spark && q.spark.length > 0 && <Spark results={q.spark} />}
                      <span className="cvq-queue-acc">{q.acc}</span>
                    </span>
                  </div>
                  <p className="cvq-queue-why">{q.why}</p>
                  <div className="cvq-queue-actions">
                    {q.actions.map((a, i) => (
                      <button
                        key={i}
                        className={`coach-action-btn ${i === 0 ? 'primary' : ''}`}
                        onClick={() => handleAction(a)}
                      >
                        {a.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          {journey.length > 0 && (
            <div className="coach-side-card">
              <div className="cvq-sec-label">
                <span className="cv2-label">Journey</span>
                <span className="cv2-label" style={{ fontSize: 9 }}>milestones, not scrollback</span>
              </div>
              <div className="cvq-jn">
                {journey.map((e, i) => (
                  <div key={i} className={`cvq-jn-item ${e.cls}`}>
                    <span className="cvq-jn-date">{fmtDay(e.ms)}</span>
                    {e.node}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ─────────── right column ─────────── */}
        <div className="cvq-col">
          <div className="coach-side-card" style={{ borderColor: 'var(--ut-accent-rule)' }}>
            <div className="cvq-sec-label">
              <span className="cv2-label" style={{ color: 'var(--ut-accent-dark)' }}>Today's brief</span>
              {briefing && (
                <span className="cv2-label" style={{ fontSize: 9 }}>
                  coach · {new Date(briefing.note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
            {briefing ? (
              <>
                <CoachBlocks blocks={briefing.blocks} variant="light" only={['verdict', 'stat']} />
                <ActionButtons actions={briefing.note.actions} onAction={handleAction} />
              </>
            ) : (
              <p className="coach-side-empty">
                {coach.available
                  ? 'No note today — nothing crossed the significance rules. Silence is deliberate: everything on this page is live data, and the queue is ranked exactly how I rank it.'
                  : 'The coach service is unreachable right now — this page runs on your live practice data in the meantime.'}
              </p>
            )}
          </div>

          {(strategy?.current || strategy?.run) && (
            <div className="coach-side-card">
              <div className="cvq-sec-label">
                <span className="cv2-label">The plan behind your plan</span>
                {strategy?.run?.status === 'running' ? (
                  <span className="cvq-strat-status running">deep analysis running…</span>
                ) : strategy?.current?.generatedAt ? (
                  <span className="cvq-strat-status">
                    {new Date(strategy.current.generatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    {strategy.current.effort ? ` · ${strategy.current.effort}` : ''}
                  </span>
                ) : null}
              </div>

              {strategy?.current ? (
                <>
                  {strategy.current.headline && <p className="cvq-strat-headline">{strategy.current.headline}</p>}
                  {strategy.current.assessment && <p className="cvq-strat-assess">{strategy.current.assessment}</p>}

                  {(strategy.current.priorities || []).length > 0 && (
                    <div className="cvq-strat-prios">
                      {strategy.current.priorities.map((p, i) => (
                        <div key={i} className="cvq-strat-prio">
                          <span className="cvq-rank">{i + 1}</span>
                          <div className="cvq-strat-prio-body">
                            <span className="cvq-strat-prio-title">
                              {p.title}
                              {p.subcategoryName && <span className="cvq-strat-prio-sub"> · {p.subcategoryName}</span>}
                              <span className={`cvq-strat-urgency ${p.urgency}`}>{p.urgency.replace('-', ' ')}</span>
                            </span>
                            {p.why && <span className="cvq-strat-prio-why">{p.why}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {(strategy.current.stance?.tone ||
                    (strategy.current.stance?.do || []).length > 0 ||
                    (strategy.current.stance?.dont || []).length > 0) && (
                    <div className="cvq-strat-stance">
                      {strategy.current.stance.tone && <p className="cvq-strat-tone">{strategy.current.stance.tone}</p>}
                      <div className="cvq-strat-dodont">
                        {(strategy.current.stance.do || []).map((d, i) => (
                          <span key={`d${i}`} className="cvq-strat-chip do">{d}</span>
                        ))}
                        {(strategy.current.stance.dont || []).map((d, i) => (
                          <span key={`n${i}`} className="cvq-strat-chip dont">{d}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {strategy.current.pacing && (
                    <p className="cvq-strat-pacing">
                      <span className="cv2-label" style={{ fontSize: 9 }}>Pacing</span> {strategy.current.pacing}
                    </p>
                  )}
                </>
              ) : (
                <p className="coach-side-empty">
                  First deep analysis is running — it lands in a few minutes and every coach surface starts following it.
                </p>
              )}
            </div>
          )}

          {commitments.length > 0 && (
            <div className="coach-side-card">
              <div className="cvq-sec-label">
                <span className="cv2-label">Commitments</span>
                <span className="cv2-label" style={{ fontSize: 9 }}>the coach follows up — that's the memory</span>
              </div>
              {commitments.map((c, i) => (
                <div key={i} className={`cvq-cmt ${c.due ? 'due' : ''}`}>
                  <div className="cvq-cmt-date">
                    <b>{c.dayNum}</b>
                    <span>{c.due ? 'due' : c.weekday}</span>
                  </div>
                  <div className="cvq-cmt-body">
                    {c.label}
                    <span className="cvq-cmt-src">{c.source}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="coach-side-card">
            <div className="cvq-sec-label"><span className="cv2-label" style={{ color: 'var(--ut-success-dark)' }}>Wins</span></div>
            {wins.length === 0 && habitsWinsFallback(skills)}
            {wins.map((s) => {
              const sub = s.subcategoryId || s.id;
              return (
                <div key={sub} className="cvq-ww-item">
                  <span className="cvq-ww-mark good">▲</span>
                  <span><b>{getDisplayName(sub) || sub}</b> — {s.accuracyLast10 ?? '—'}% last 10, climbing</span>
                </div>
              );
            })}
            <div className="cvq-sec-label" style={{ marginTop: 14 }}>
              <span className="cv2-label" style={{ color: 'var(--ut-danger-dark)' }}>Watchlist</span>
            </div>
            {watchlist.length === 0 ? (
              <p className="coach-side-empty">Nothing flagged right now — keep it that way.</p>
            ) : (
              watchlist.map((q) => (
                <div key={q.key} className="cvq-ww-item">
                  <span className={`cvq-ww-mark ${q.flag}`}>{q.flag === 'bad' ? '↩' : '▼'}</span>
                  <span><b>{q.name}</b> — {q.acc}</span>
                </div>
              ))
            )}
          </div>

          <div className="coach-side-card">
            <div className="cvq-sec-label">
              <span className="cv2-label">What I know about you</span>
              <button className="coach-notebook-toggle" onClick={() => setShowNotebook((v) => !v)}>
                {showNotebook ? 'hide' : 'show'}
              </button>
            </div>
            <div className="coach-goal-row"><span>Target score</span><b>{target || 'not set'}</b></div>
            <div className="coach-goal-row">
              <span>Exam date</span>
              <b>{profile?.examDate ? `${profile.examDate}${examCountdown ? ` · ${examCountdown}d` : ''}` : 'not set'}</b>
            </div>
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

      {/* ── ask bar ── */}
      <div className="cvq-askbar">
        <span className="coach-avatar" style={{ width: 30, height: 30, borderRadius: 9 }}><CoachGlyph size={15} /></span>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleAsk(draft)}
          placeholder={coach.available ? 'Ask your coach anything…' : 'Coach is offline right now'}
          disabled={!coach.available}
          aria-label="Ask your coach"
        />
        <span className="cvq-ask-hints">
          {['What should I work on today?', 'Where am I losing points?'].map((s) => (
            <button key={s} className="cvq-ask-hint" disabled={!coach.available || coach.sending} onClick={() => handleAsk(s)}>
              {s}
            </button>
          ))}
        </span>
        <button className="cvq-ask-send" onClick={() => handleAsk(draft)} disabled={!coach.available || coach.sending || !draft.trim()} aria-label="Send">
          <FiSend />
        </button>
        <button className="cvq-ask-thread" onClick={() => setDrawerOpen(true)}>Thread</button>
      </div>

      {/* ── thread drawer ── */}
      {drawerOpen && (
        <>
          <div className="cvq-drawer-scrim" onClick={() => setDrawerOpen(false)} />
          <aside className="cvq-drawer" role="dialog" aria-label="Coach conversation">
            <div className="cvq-drawer-head">
              <span className="coach-avatar" style={{ width: 28, height: 28, borderRadius: 9 }}><CoachGlyph size={14} /></span>
              <div>
                <div className="coach-panel-title">Thread</div>
                <div className="coach-panel-sub">one conversation, every page</div>
              </div>
              <button className="coach-panel-close" onClick={() => setDrawerOpen(false)} aria-label="Close">×</button>
            </div>
            <div className="cvq-drawer-feed">
              {coach.thread.length === 0 ? (
                <div className="coach-empty">
                  No conversation yet — ask me anything below, or finish a quiz and I'll tell you what it means.
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
            <div className="coach-input-row">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleAsk(draft)}
                placeholder="Message your coach…"
                disabled={!coach.available}
              />
              <button onClick={() => handleAsk(draft)} disabled={!coach.available || coach.sending || !draft.trim()}>
                <FiSend />
              </button>
            </div>
          </aside>
        </>
      )}
    </div>
  );
};

/** Wins fallback: with no improving skill yet, at least honor the streak. */
function habitsWinsFallback() {
  return <p className="coach-side-empty">First wins land here as soon as a skill trends up.</p>;
}

export default CoachPage;
