/**
 * AI Coach — the Home briefing hero (UI v2).
 *
 * The dark hero stops being a static greeting: it renders the coach's current
 * briefing note as typed blocks (verdict → mission rail → pace), and its tone
 * visibly changes the surface (a regression day looks different from a win).
 *
 * FALLBACK CHAIN (never blank, never fake):
 *   fresh briefing note (≤ 36h, from CoachContext)
 *   → mechanical brief assembled HERE from the same Tier-2 skillState the page
 *     already loaded — zero model calls, honestly labeled "auto-brief".
 *
 * Layout classes come from Home.css (hm-hero*); block styles from coach.css.
 */

import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCoach } from '../../contexts/CoachContext';
import CoachBlocks, { ensureBlocks } from './CoachBlocks';
import { estimatedSATFromSkillState } from '../../utils/scoring';
import { getDisplayName } from '../../utils/subcategoryTaxonomy';
import './coach.css';

const CoachGlyph = ({ size = 14 }) => (
  <svg viewBox="0 0 24 24" fill="none" width={size} height={size} aria-hidden="true">
    <path d="M12 3l1.8 4.7L18.5 9l-4.7 1.8L12 15.5l-1.8-4.7L5.5 9l4.7-1.3L12 3z" fill="#fff" />
    <circle cx="18.5" cy="17" r="2.2" fill="#fff" opacity=".85" />
  </svg>
);

const BRIEFING_FRESH_MS = 36 * 3600 * 1000;
const DAY_MS = 86400000;

/**
 * The no-LLM brief: rank the student's weakest/stalest skills into a 2-3 item
 * plan with real numbers in the subtitles. Mirrors the coach's own ranking
 * rules (declining beats stale beats merely-weak) so quiet days feel coherent
 * with coached days.
 */
export function buildMechanicalPlan(skills) {
  const now = Date.now();
  const rank = (s) => {
    const idleDays = s.lastPracticedTs ? (now - s.lastPracticedTs) / DAY_MS : null;
    if (s.trend === 'declining') return 0;
    if (idleDays !== null && idleDays >= 7 && s.attempts >= 5) return 1;
    return 2;
  };
  const items = [...skills]
    .filter((s) => s.attempts > 0)
    .sort((a, b) => rank(a) - rank(b) || (a.accuracyLast10 ?? 101) - (b.accuracyLast10 ?? 101))
    .slice(0, 3)
    .map((s, i) => {
      const idleDays = s.lastPracticedTs ? Math.round((now - s.lastPracticedTs) / DAY_MS) : null;
      const why = s.trend === 'declining' ? 'slipping' : idleDays !== null && idleDays >= 7 ? 'stale' : 'new';
      const sub =
        why === 'slipping'
          ? `last 10 at ${s.accuracyLast10 ?? '—'}% — trending down`
          : why === 'stale'
            ? `${idleDays} days idle · last 10 at ${s.accuracyLast10 ?? '—'}%`
            : `weakest right now — last 10 at ${s.accuracyLast10 ?? '—'}%`;
      return {
        id: `m${i + 1}`,
        label: `${getDisplayName(s.subcategoryId || s.id) || s.id} · 5 questions`,
        sub,
        why,
        minutes: 10,
        action: { type: 'quiz', subcategoryId: s.subcategoryId || s.id },
      };
    });
  if (!items.length) return null;
  return { type: 'plan', title: 'Auto-picked from your skill state', minutes: items.reduce((s, it) => s + it.minutes, 0), items };
}

const BriefingHero = ({
  firstName,
  profile,
  habits,
  skills,
  examCount,
  totalAnswered,
  ctaButtons, // React node — Resume/Practice + Open Coach (owner: Dashboard)
  examDateEditor, // React node — ExamDateInline (owner: Dashboard)
}) => {
  const coach = useCoach();
  const navigate = useNavigate();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const examCountdown = useMemo(() => {
    if (!profile?.examDate) return null;
    const ms = Date.parse(profile.examDate) - Date.now();
    return !Number.isNaN(ms) && ms > 0 ? Math.ceil(ms / DAY_MS) : null;
  }, [profile]);

  // Fresh coach briefing, or null → mechanical.
  const briefing = useMemo(() => {
    const note = coach?.latestBriefing;
    if (!note) return null;
    const age = Date.now() - (note.createdAt || 0);
    if (!note.createdAt || age > BRIEFING_FRESH_MS) return null;
    const blocks = ensureBlocks(note);
    return blocks.length ? { note, blocks } : null;
  }, [coach?.latestBriefing]);

  const mechanicalPlan = useMemo(() => (briefing ? null : buildMechanicalPlan(skills || [])), [briefing, skills]);
  const clientEstimate = useMemo(() => estimatedSATFromSkillState(skills || []), [skills]);

  const verdict = briefing?.blocks.find((b) => b.type === 'verdict');
  const plan = briefing?.blocks.find((b) => b.type === 'plan') || mechanicalPlan;
  const stat = briefing?.blocks.find((b) => b.type === 'stat');
  const tone = verdict?.tone || 'steady';

  // Mission ticks: coached briefings key by note id; the mechanical brief keys
  // by day, so ticks survive a reload but reset each morning.
  const missionNoteId = briefing ? briefing.note.id : `mech-${new Date().toISOString().slice(0, 10)}`;
  const done = coach?.missionsFor ? coach.missionsFor(missionNoteId) : {};

  const handleAction = (action) => {
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
  };

  const briefTime = briefing?.note.createdAt
    ? new Date(briefing.note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <section className={`hm-hero cvh-tone-${tone}`}>
      <div className="hm-hero-top">
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="cvh-kicker">
            <span
              className="coach-avatar"
              style={{ width: 26, height: 26, borderRadius: 8 }}
              aria-hidden="true"
            >
              <CoachGlyph />
            </span>
            {briefing ? (
              <>
                <span className="cvh-src live">
                  {briefing.note.kind === 'exam-note' ? 'coach · after your exam' : `coach briefing${briefTime ? ` · ${briefTime}` : ''}`}
                </span>
                {(briefing.note.reasons || []).slice(0, 2).map((r) => (
                  <span key={r} className="cvh-src">
                    {String(r).replace(/_/g, ' ')}
                  </span>
                ))}
              </>
            ) : (
              <span className="cvh-src">auto-brief · no coach call</span>
            )}
          </div>

          <h1 className="hm-hero-greeting">
            {greeting}, {firstName}
          </h1>

          {briefing && verdict ? (
            <div className="cv2-ink">
              <CoachBlocks blocks={[verdict]} variant="ink" />
            </div>
          ) : (
            <p className="cvh-quiet">
              {skills && skills.length > 0
                ? 'Nothing significant since your last session — no new slips, no follow-ups due. This brief comes straight from your skill state; when the coach speaks, it means something.'
                : 'Take the free diagnostic or a first quiz and your coach starts reading your practice — every brief here is built from what you actually do.'}
            </p>
          )}

          <div className="hm-hero-cta">{ctaButtons}</div>
        </div>

        <div className="edc-countdown-col" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          {examCountdown && (
            <div className="hm-countdown">
              <div className="hm-countdown-num">{examCountdown}</div>
              <div className="hm-countdown-label">days to exam</div>
            </div>
          )}
          {examDateEditor}
          {(stat || clientEstimate) && (
            <div className="cvh-pace">
              {stat?.estimate != null && (
                <>
                  last exam <b>{stat.estimate}</b>
                  {stat.target != null && <> → target <b>{stat.target}</b></>}
                  <br />
                </>
              )}
              {stat?.estimate == null && clientEstimate && (
                <>
                  practice est. <b>{clientEstimate.total}</b>
                  {profile?.targetScore && <> → target <b>{profile.targetScore}</b></>}
                  <br />
                </>
              )}
              {stat?.note || ''}
            </div>
          )}
        </div>
      </div>

      {plan && plan.items && plan.items.length > 0 && (
        <div className="cvh-missions cv2-ink">
          <CoachBlocks
            blocks={[plan]}
            variant="ink"
            done={done}
            onAction={(action) => handleAction(action)}
            onToggle={(item, isDone) => coach?.markMission?.(missionNoteId, item, isDone)}
          />
        </div>
      )}

      <div className="hm-hero-stats">
        <div className="hm-hero-stat">
          <span className="hm-hero-stat-value">
            <em>{habits?.streakDays || 0}</em>
          </span>
          <span className="hm-hero-stat-label">Day streak</span>
        </div>
        <div className="hm-hero-stat">
          <span className="hm-hero-stat-value">{totalAnswered}</span>
          <span className="hm-hero-stat-label">Questions practiced</span>
        </div>
        <div className="hm-hero-stat">
          <span className="hm-hero-stat-value">{examCount}</span>
          <span className="hm-hero-stat-label">Exams completed</span>
        </div>
        <div className="hm-hero-stat">
          <span className="hm-hero-stat-value">{(skills || []).length}</span>
          <span className="hm-hero-stat-label">Skills tracked</span>
        </div>
      </div>
    </section>
  );
};

export default BriefingHero;
