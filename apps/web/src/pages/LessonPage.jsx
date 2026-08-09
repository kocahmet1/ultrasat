/* LessonPage — Lesson v2: the redesigned UWorld-style study guide.
 *
 * Two-panel layout: sticky left panel (video lesson + page navigator +
 * lesson meta + practice CTA) and a right panel of stacked white "sheets",
 * one per content page, rendered from the JSON block schema
 * (docs/lesson-v2-authoring.md) by components/lesson2/LessonBlocks2.
 *
 * Served at /learn/:subcategoryId through LearnRouteSwitch for every
 * subcategory registered in content/lessons/index.js; other subcategories
 * keep the legacy SubcategoryLearnPage until their content is rebuilt.
 *
 * Integrations preserved from the legacy page (same contracts):
 *   - users/{uid}/lessonProgress/{id} via touchLessonViewed +
 *     mark/unmarkLessonComplete → LecturesPage progress + planner
 *     reconcileTasks auto-completion.
 *   - Coach event stream: one LESSON_VIEWED event with dwellSeconds.
 *   - Practice CTA → /smart-quiz-generator with { subcategoryId, accuracyRate }.
 *   - ?from=planner → "Back to Planner" affordance after completion.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  FiArrowLeft,
  FiCheckCircle,
  FiChevronRight,
  FiClock,
  FiLoader,
  FiPlay,
  FiPlayCircle,
  FiVideo,
} from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import {
  markLessonComplete,
  touchLessonViewed,
  unmarkLessonComplete,
} from '../firebase/lessonProgressServices';
import { getSubcategoryProgress } from '../utils/progressUtils';
import { logEvent, EVENT_TYPES } from '../coach/events';
import {
  DOMAINS,
  getSubcategoryMeta,
  toCanonicalSubcategoryId,
} from '../utils/subcategoryTaxonomy';
import { loadLessonV2 } from '../content/lessons';
import LessonBlockList from '../components/lesson2/LessonBlocks2';
import { loadKatexAutoRender } from '../utils/katexLoader';
import '../styles/LessonPage.css';

/* ---------- KaTeX (math lessons) ----------
 * Math in lesson JSON is TeX inside $...$ (inline) / $$...$$ (display).
 * KaTeX is lazy-loaded from CDN (same katexLoader the rest of the app
 * uses) only when the lesson actually contains math. Color shorthands
 * (\blue{...} etc.) are expanded to \textcolor by the lesson2 renderer
 * BEFORE reaching the DOM — they must not be KaTeX macros, because "#"
 * in a macro body is a parameter marker and breaks the expression. */

const KATEX_DELIMITERS = [
  { left: '$$', right: '$$', display: true },
  { left: '\\[', right: '\\]', display: true },
  { left: '\\(', right: '\\)', display: false },
  { left: '$', right: '$', display: false },
];

/* ---------- reading progress bar ---------- */

function ReadingProgressBar() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let ticking = false;
    const update = () => {
      const doc = document.documentElement;
      const total = doc.scrollHeight - window.innerHeight;
      setProgress(total > 0 ? Math.min(100, (window.scrollY / total) * 100) : 0);
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <div className="lp2-progressbar" aria-hidden="true">
      <div className="lp2-progressbar__fill" style={{ width: `${progress}%` }} />
    </div>
  );
}

/* ---------- video panel ---------- */

function getEmbedUrl(url) {
  if (!url) return null;
  const yt = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/
  );
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?rel=0`;
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return null;
}

function VideoPanel({ video, title }) {
  const url = video?.url || null;
  const embedUrl = getEmbedUrl(url);

  if (!url) {
    return (
      <div className="lp2-video lp2-video--placeholder">
        {video?.poster && <img src={video.poster} alt="" className="lp2-video__poster" />}
        <div className="lp2-video__overlay">
          <span className="lp2-video__playring" aria-hidden="true">
            <FiPlay />
          </span>
          <span className="lp2-video__coming">
            <FiVideo aria-hidden="true" /> Video lesson coming soon
          </span>
        </div>
      </div>
    );
  }

  if (embedUrl) {
    return (
      <div className="lp2-video">
        <iframe
          src={embedUrl}
          title={`${title} — video lesson`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div className="lp2-video">
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video controls preload="metadata" src={url} poster={video?.poster || undefined} />
    </div>
  );
}

/* ---------- page ---------- */

export default function LessonPage() {
  const { subcategoryId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const fromPlanner = searchParams.get('from') === 'planner';

  const canonicalId = toCanonicalSubcategoryId(subcategoryId) || subcategoryId;
  const meta = getSubcategoryMeta(canonicalId);
  const domainName = (meta && DOMAINS[meta.domain]?.name) || '';
  const sectionLabel =
    meta?.section === 'reading-writing' ? 'Reading & Writing' : meta?.section === 'math' ? 'Math' : '';

  const [lesson, setLesson] = useState(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [lessonCompleted, setLessonCompleted] = useState(false);
  const [completionSaving, setCompletionSaving] = useState(false);

  const pages = useMemo(() => lesson?.pages || [], [lesson]);
  const guideRef = useRef(null);

  /* -- KaTeX auto-render over the study guide (math lessons only) -- */
  const lessonHasMath = useMemo(
    () => (lesson ? JSON.stringify(lesson.pages).includes('$') : false),
    [lesson]
  );
  useEffect(() => {
    if (!lessonHasMath || !guideRef.current) return undefined;
    let disposed = false;
    let observer = null;
    let timer = null;
    loadKatexAutoRender()
      .then((renderMathInElement) => {
        if (disposed || !guideRef.current) return;
        const render = () => {
          if (!guideRef.current) return;
          try {
            renderMathInElement(guideRef.current, {
              delimiters: KATEX_DELIMITERS,
              throwOnError: false,
            });
          } catch (err) {
            // Malformed TeX — plain text stays visible.
          }
        };
        render();
        // Re-typeset content that mounts later (expandable Answers). After a
        // pass no delimiters remain, so re-runs on KaTeX's own mutations are
        // no-ops and the loop settles immediately.
        observer = new MutationObserver((mutations) => {
          if (mutations.some((m) => m.addedNodes.length > 0)) {
            clearTimeout(timer);
            timer = setTimeout(render, 30);
          }
        });
        observer.observe(guideRef.current, { childList: true, subtree: true });
      })
      .catch(() => {
        // CDN unavailable — equations degrade to readable TeX text.
      });
    return () => {
      disposed = true;
      if (observer) observer.disconnect();
      clearTimeout(timer);
    };
  }, [lessonHasMath, canonicalId]);

  /* -- content load -- */
  useEffect(() => {
    let cancelled = false;
    setLesson(null);
    setLoadFailed(false);
    setActivePageIndex(0);
    loadLessonV2(canonicalId)
      .then((doc) => {
        if (cancelled) return;
        if (doc && Array.isArray(doc.pages) && doc.pages.length > 0) {
          setLesson(doc);
        } else {
          setLoadFailed(true);
        }
      })
      .catch(() => {
        if (!cancelled) setLoadFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [canonicalId]);

  /* -- lesson progress: record the visit, hydrate the completion band -- */
  useEffect(() => {
    let cancelled = false;
    setLessonCompleted(false);
    if (!currentUser || !canonicalId) return undefined;
    touchLessonViewed(currentUser.uid, canonicalId).then((existing) => {
      if (!cancelled && existing?.status === 'completed') {
        setLessonCompleted(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [currentUser, canonicalId]);

  /* -- coach event stream: one LESSON_VIEWED with dwell time on leave -- */
  const dwellRef = useRef({ start: Date.now(), accumulated: 0, sent: false, maxPage: '' });
  useEffect(() => {
    dwellRef.current.maxPage = pages[activePageIndex]?.id || '';
  }, [pages, activePageIndex]);
  useEffect(() => {
    const d = dwellRef.current;
    d.start = Date.now();
    d.accumulated = 0;
    d.sent = false;
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        d.accumulated += Date.now() - d.start;
      } else {
        d.start = Date.now();
      }
    };
    const send = () => {
      if (d.sent) return;
      const dwellSeconds = Math.round(
        (d.accumulated + (document.visibilityState === 'hidden' ? 0 : Date.now() - d.start)) / 1000
      );
      if (dwellSeconds < 5) return; // ignore bounces
      d.sent = true;
      logEvent(EVENT_TYPES.LESSON_VIEWED, {
        subcategoryId: canonicalId,
        dwellSeconds,
        sectionsViewed: [d.maxPage || 'overview'],
      }).catch(() => {});
    };
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', send);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', send);
      send(); // SPA navigation away
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canonicalId]);

  /* -- active sheet tracking for the page navigator -- */
  useEffect(() => {
    if (pages.length === 0) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute('data-page-index'));
            if (!Number.isNaN(idx)) setActivePageIndex(idx);
          }
        });
      },
      { rootMargin: '-20% 0px -65% 0px', threshold: 0 }
    );
    document
      .querySelectorAll('.lp2-sheet[data-page-index]')
      .forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [pages]);

  const scrollToPage = useCallback((pageId) => {
    const el = document.getElementById(`lesson-page-${pageId}`);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 84;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }, []);

  /* -- completion band -- */
  const handleToggleLessonComplete = async () => {
    if (!currentUser || completionSaving) return;
    const nextCompleted = !lessonCompleted;
    setCompletionSaving(true);
    try {
      if (nextCompleted) {
        await markLessonComplete(currentUser.uid, canonicalId);
      } else {
        await unmarkLessonComplete(currentUser.uid, canonicalId);
      }
      setLessonCompleted(nextCompleted);
    } catch (err) {
      console.error('Error updating lesson completion:', err);
    } finally {
      setCompletionSaving(false);
    }
  };

  /* -- practice CTA (same contract as the legacy page) -- */
  const handlePractice = async () => {
    let accuracyRate = 0;
    if (currentUser) {
      try {
        const progressData = await getSubcategoryProgress(currentUser.uid, canonicalId);
        accuracyRate = progressData ? progressData.accuracyLast10 || 0 : 0;
      } catch (err) {
        console.error('Error loading subcategory accuracy:', err);
      }
    }
    navigate('/smart-quiz-generator', {
      state: { subcategoryId: canonicalId, accuracyRate },
    });
  };

  /* ---------- render states ---------- */

  if (loadFailed) {
    return (
      <div className="lp2 lp2--message">
        <div className="ut-card lp2-message-card">
          <h2>We couldn't load this lesson</h2>
          <p>Please try again, or head back to the Lectures page.</p>
          <Link className="ut-btn ut-btn--primary" to="/lectures">
            Back to Lectures
          </Link>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="lp2 lp2--loading" aria-busy="true">
        <FiLoader className="lp2-loading-icon" />
        <div>Loading lesson…</div>
      </div>
    );
  }

  const title = lesson.title || meta?.name || canonicalId;

  return (
    <div className="lp2">
      <ReadingProgressBar />

      {/* ── top bar: breadcrumb + meta ── */}
      <header className="lp2-topbar">
        <nav className="lp2-crumbs" aria-label="Breadcrumb">
          <Link to="/lectures" className="lp2-crumbs__link">
            <FiArrowLeft aria-hidden="true" /> Lectures
          </Link>
          <FiChevronRight className="lp2-crumbs__sep" aria-hidden="true" />
          <span className="lp2-crumbs__domain">{domainName}</span>
          <FiChevronRight className="lp2-crumbs__sep" aria-hidden="true" />
          <span className="lp2-crumbs__current">{title}</span>
        </nav>
        <div className="lp2-topbar__meta">
          {lesson.estimatedMinutes && (
            <span className="lp2-chip">
              <FiClock aria-hidden="true" /> ~{lesson.estimatedMinutes} min
            </span>
          )}
          {lessonCompleted && (
            <span className="lp2-chip lp2-chip--done">
              <FiCheckCircle aria-hidden="true" /> Completed
            </span>
          )}
        </div>
      </header>

      <div className="lp2-body">
        {/* ── left panel ── */}
        <aside className="lp2-left">
          <VideoPanel video={lesson.video} title={title} />

          <div className="lp2-left-card">
            <div className="lp2-left-card__eyebrow">
              {sectionLabel}
              {sectionLabel && domainName ? ' · ' : ''}
              {domainName}
            </div>
            <h2 className="lp2-left-card__title">{title}</h2>
            {lesson.difficulty && <div className="lp2-left-card__difficulty">{lesson.difficulty}</div>}

            <nav className="lp2-pagenav" aria-label="Lesson pages">
              <div className="lp2-pagenav__label">In this lesson</div>
              <ol>
                {pages.map((page, i) => (
                  <li key={page.id}>
                    <button
                      type="button"
                      className={`lp2-pagenav__item${i === activePageIndex ? ' lp2-pagenav__item--active' : ''}`}
                      onClick={() => scrollToPage(page.id)}
                    >
                      <span className="lp2-pagenav__num">{i + 1}</span>
                      <span className="lp2-pagenav__title">{page.navTitle || page.title}</span>
                    </button>
                  </li>
                ))}
              </ol>
            </nav>

            <button type="button" className="ut-btn ut-btn--primary lp2-practice-cta" onClick={handlePractice}>
              <FiPlayCircle aria-hidden="true" /> Practice this skill
            </button>
            {fromPlanner && (
              <Link to="/planner" className="lp2-planner-return">
                <FiArrowLeft aria-hidden="true" /> Back to Planner
              </Link>
            )}
          </div>
        </aside>

        {/* ── study guide sheets ── */}
        <main className="lp2-guide" ref={guideRef}>
          {pages.map((page, i) => (
            <article
              key={page.id}
              id={`lesson-page-${page.id}`}
              data-page-index={i}
              className="lp2-sheet"
            >
              <div className="lp2-sheet__corner">
                <span>{domainName}</span>
                <span>{i === 0 ? title : `${title}: ${page.title}`}</span>
              </div>
              {i === 0 ? (
                <h1 className="lp2-sheet__h1">{page.title}</h1>
              ) : (
                <h2 className="lp2-sheet__h2">{page.title}</h2>
              )}
              <LessonBlockList blocks={page.blocks} />
            </article>
          ))}

          {/* ── completion band ── */}
          {currentUser && (
            <section className="lp2-mastery" aria-label="Lesson completion">
              <div className="lp2-mastery__copy">
                <h3>Have you mastered this lesson?</h3>
                <p>
                  {lessonCompleted
                    ? 'This lesson counts toward your course progress and your study plan.'
                    : 'Mark this lesson as complete to update your course progress and study plan.'}
                </p>
              </div>
              <div className="lp2-mastery__actions">
                {lessonCompleted ? (
                  <>
                    <span className="lp2-mastery__done">
                      <FiCheckCircle aria-hidden="true" /> Completed
                    </span>
                    {fromPlanner && (
                      <Link to="/planner" className="ut-btn ut-btn--primary">
                        Back to Planner
                      </Link>
                    )}
                    <button
                      type="button"
                      className="lp2-mastery__unmark"
                      onClick={handleToggleLessonComplete}
                      disabled={completionSaving}
                    >
                      Mark as not complete
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="ut-btn ut-btn--primary lp2-mastery__mark"
                    onClick={handleToggleLessonComplete}
                    disabled={completionSaving}
                  >
                    <FiCheckCircle aria-hidden="true" /> Mark as Complete
                  </button>
                )}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
