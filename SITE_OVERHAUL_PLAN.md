# UltraSAT — Holistic Overhaul Plan
*The single reference for making the site one coherent system. Derived from `SITE_AUDIT_REPORT.md`. 2026-07-28.*

**Owner decisions locked**: all retired landing variants deleted (URLs redirect to `/`) · Dashboard rebuilt as the one real **Home** · keep (in some form): exam interface, quizzes, progress dashboard (secondary ok), profile, flashcards, lectures, concept bank, word bank, exam results, predictive exam · design language follows the current landing page (V3) · paid tier is called **"Pro"** everywhere user-facing (internal id `plus` unchanged; Max removed from UI — it was unbuyable anyway).

---

## 1. Target sitemap (the whole site, after)

**Public**: `/` (V3 landing) · `/login` · `/signup` · `/guest-subject-quizzes` → `/guest-smart-quiz` (the one guest funnel) · `/blog` · `/sat-guide` · `/score-calculator` · legal/info pages · **404 page** (new).

**App (auth)**:
| Nav label | Path | Notes |
|---|---|---|
| Home | `/dashboard` | REBUILT: real stats (Tier-2), coach briefing, launchers |
| Practice Tests | `/practice-exams` → `/practice-exam/:id` → `/exam/results/:id` | the kept exam interface |
| Diagnostic | `/predictive-exam` | one name everywhere (no more "Official Exams"/"Predictive") |
| Question Bank | `/subject-quizzes` (+ SmartQuiz flow) | page retitled to match nav |
| Progress | `/progress` (+ `/subcategory-progress/:id`) | kept as the analytics feature |
| Coach | `/coach` | already live |
| Lectures | `/lectures` → `/learn/:id` | Pro |
| Flashcards | `/flashcards` | Pro |
| Word Bank / Concept Bank | `/word-bank` · `/concept-bank` | bank tabs Pro, banks free |
| Results | `/all-results` | one results history |
| Profile | `/profile` (+ `/membership/upgrade`) | Settings lives here |

Everything else: deleted or redirected. One nav config drives desktop + mobile; guests see the guest variant of the same config.

## 2. Kill list (verified orphans — nothing imports them; audit-confirmed)

**Pages**: HomePage · LandingPage (pages/) · LandingPage2 · LandingPageAds · LegacyLandingPage · AICoachPage (replaced by CoachPage) · ExamController · IntermissionController · ExamLandingPage (dead exam system) · QuizResults (unreachable) · SkillDrillQuiz · Lesson · LessonModal · ConceptAnalytics · StudyResources (unlinked, empty collection) · GuestQuiz (unlinked vocab quiz).
**Components**: components/LandingPage · src/LandingPage.js (module-scope createRoot hazard) · ReviewTile · SkillReviewChips · ConceptReviewChips · HelperItemsPanel · QuestionGenerator · QuestionGeneratorLive · ProgressTracker (0 bytes) · AICompanionPanel (unmounted) · Intermission (legacy; IntermissionScreen stays — it's the live one).
**Utils/data**: mockQuizzes · mockLessons · utils/openaiService.js (browser-side API key pattern; all consumers die with it) · data/guestDecks.
**Route deletions + redirects** (old URLs never 404): 4 landing URLs → `/` · `/exam/landing`, `/exam/:moduleId`, `/intermission` → `/practice-exams` · `/results/:id?`, `/practice-exam/:id/results` → `/all-results` · `/study-resources` → `/lectures` · `/quiz-results/:id` removed · `/guest-quiz*` removed. Legacy shims (`/adaptive-quiz`, `/skill-drill`, `/lesson/:tag`, `/resources/:id`) stay — they serve old bookmarks.
**Execution**: routes/imports removed in code (Phase A); physical files deleted by `scripts/cleanup-dead-code.js` (git-recoverable).

## 3. Naming standard (kills the label chaos)
One label per destination, used by every nav, button, and page title: **Home** (never Dashboard/Overview) · **Progress** (never Analytics/Review/Study Plan) · **Question Bank** (never Subject Quizzes/Practice) · **Practice Tests** · **Diagnostic** · **Coach** (never AI Coach/SAT Coach/Assistant/Helper — one persona) · **Lectures** · **Results** · **Pro** (the paid tier). `/skills` (Skills Practice) is ABSORBED: its browse function belongs to Question Bank; route redirects there; crashing page dies. Difficulty is always "Level 1/2/3 (Easy/Medium/Hard)".

## 4. Phases

- **A. Structure (this session)** — route purge + redirects + 404 page + one `config/navigation.js` consumed by Sidebar & TopNavBar (labels per §3, mobile gains Progress + Coach, guest variant unified, Pro badges consistent) + cleanup script.
- **B. Real Home + fake-data purge** — rebuild Dashboard: greeting, coach briefing note, real streak (habits), real estimated score (one formula, see D), continue-exam from real `examProgress`, weakest-skills chips (Tier-2), launchers. Delete every fabricated number the audit flagged (SubjectQuizzes fake stats/badges, Lectures fake progress/"video" copy, Flashcards fake decks/mastery/due, Profile fake activity/projection, SmartQuiz fake sparkline/focus card, hardcoded "98 questions · 2h14m" exam metadata → computed).
- **C. Naming + gating coherence** — retitle pages to §3; "Pro" everywhere; ONE upgrade modal; route-level `MembershipGate` on `/flashcards`, `/concept-bank`, `/lectures`, `/learn/:id`; mobile gating parity; exam paywall moved into `PracticeExamController` (deep links can't bypass); remove Max tier from UI.
- **D. One number per stat** — new `utils/scoring.js`: single scaled-score + single accuracy definition; used by exam save, ExamResults (fix its numeric-only section split via taxonomy `getSection`), PracticeExamList, Progress, Profile, ranking API. Retires 5 SAT-score formulas + 4 accuracy formulas.
- **E. Funnel & flow repairs** — signup CTA on guest quiz results; public pricing section (landing anchor) so "Pricing" ≠ signup; Login auth-modal sentinel bug ('quiz'/'exam' strings); auth-notice preserves destination; onboarding single path (signup → Home first-steps → coach); email-verification banner on Home.
- **F. Design pass** — `styles/tokens.css` extracted from V3's language (palette, radius, shadows, type scale); applied to app shell + highest-traffic pages; deep page-by-page restyles only where cheap.

Remaining audit items tracked but deliberately deferred: server-side rules hardening for exam reads, historical-results module-mutation fix, exam resume payload slimming, adaptive Module 2 (feature work, needs owner spec).

## Session log

**Phase A — DONE (session of 2026-07-28):**
- App.jsx: 4 landing variants, dead exam system (`/exam/landing`, `/exam/:moduleId`, `/intermission`), dead result routes, `/study-resources`, `/skills`, `/quiz-results`, `/guest-quiz*` — removed or redirected per §2. Real **404 page** (`pages/NotFound.jsx`) replaces the silent homepage dump.
- **`config/navigation.js`** created — the single nav source. `Sidebar.jsx` (dual-menu system deleted, guest + Pro handling driven by config) and `TopNavBar.jsx` (rewritten: **Progress finally on mobile**, guest variant with guest question bank + signup upsell on Pro items, Pro labels) both consume it.
- Dead-link quick fixes: ProgressDashboard Learn → `/learn/:id`; SubcategoryProgressPage back-links → `/progress`, Learn → `/learn/:id`, concept rows → `/concept/:conceptId`.
- **`scripts/cleanup-dead-code.js`** — deletes the 33 verified-orphan files (list-only by default). Cross-import check confirmed: kill-list files import only each other.

**Phase A ship order:** 1) `npm run build` in apps/web (compile gate — names any missed import), 2) `node scripts/cleanup-dead-code.js --apply`, 3) build again (should stay green), 4) deploy web.

**Phase B — DONE (same day):**
- **Home rebuilt** (`pages/Dashboard.jsx`, full rewrite): greeting + exam countdown, real streak (habits), questions practiced / exams completed / skills tracked (Tier-2 + real collections), real continue-exam from `examProgress`, weakest-skill quick-practice chips, coach card, launchers, honest first-steps for brand-new accounts. Uses the standard shell (removed from custom-shell list) — the parallel fake navigation died with the old page.
- **Fake-data purge**: SmartQuiz rail (hardcoded "Focus for you" card + fake weekly sparkline removed; per-quiz numbers kept), SubjectQuizzes (fake completed/popular/favorite sets → empty, "78% Average Accuracy" card + fake badge removed), PracticeExamList (fabricated "2h 14m · 98 questions" claim → neutral copy), Flashcards (sample decks no longer shown as the user's own), Lectures (fake completed/in-progress/saved sets → empty, "40+ hours"/"Completed 12" cards + fake "Continue: Transitions 70%" card + fake badge removed, "video lessons" copy corrected, honest 29 topics), Profile (synthesized 6-test performance chart removed, invented score-projection formula removed, fabricated "2h ago" activity timeline → real totals, fake "7 day streak" → real quiz count, forced page reload removed).
- Same ship gate as Phase A: `npm run build`, then deploy. (Cleanup script from Phase A still pending your `--apply` run.)

**Phase C — DONE (same day):**
- **Real route-level gates**: new `ProSuspenseRoute` (PrivateRoute + MembershipGate) on `/flashcards`, `/concept-bank`, `/lectures`, `/learn/:id` — deep links can no longer bypass the link-level checks.
- **Exam paywall enforced in the controller**: first 3 full-length tests free, rest Pro, checked inside `PracticeExamController` (deep-link-proof, with a late-membership re-check that never interrupts an exam in progress; diagnostics always free). Paywall screen offers Upgrade or free tests.
- **Auto-start bug fixed** in PracticeExamList: post-login "Start Practice Test N" now indexes the displayed (non-diagnostic) list — no more launching the wrong exam — and respects the Pro gate instead of hardcoding it off.
- **"Pro" everywhere user-facing** (internal tier id `plus` unchanged, no billing changes): membershipUtils display info, AuthContext tier names, checkout plan card, Profile upsell, PaymentSuccess, LearnUpgradeModal (whose "Interactive video lessons" promise is also now honest copy).
- **Titles match nav**: "Question Bank" (was Subject Quizzes), "Results" (was All Exam Results), "Progress" (was Your Performance Progress).

**Phase D — DONE (same day):**
- **`utils/scoring.js`** — THE scoring module: `scaledSectionScore` (canonical 200+pct·600→/10, matching how history was saved), `examScores` (section split via canonical taxonomy — kebab/numeric/name all resolve; the old numeric-only lookup dumped kebab questions into Math), `accuracyPct`, and `estimatedSATFromSkillState` (ONE estimate, fed by event-driven Tier-2, practice-weighted per section with coverage%).
- **ExamResults** now displays the scores the exam was SAVED with (can never disagree with the exam list again); canonical recompute only for legacy results without stored scores. Weighted display-time formula retired.
- **PracticeExamController** save-time scaling → `scaledSectionScore` (identical numbers, single source).
- **ProgressDashboard** estimate → `estimatedSATFromSkillState` from Tier-2 skillState. The two-formula race (exam data silently switching which number you saw) is gone; confidence = skill coverage.
- Retired: display-time weighted formula, `calculateEstimatedSATScore` + `_Legacy` usage here, dashboard fallback formula (Profile's invented projection died in Phase B). Deferred: server `computeUserStats` accuracy (rankings) — align when next touching the API.

**Phase E — DONE (same day):**
- **Login sentinel bug fixed** (`Login.jsx`): the generic `from` check swallowed the auth-modal intent sentinels (`'quiz'`/`'exam'`/`'questionBank'`) as a relative navigate → 404. Now only real paths (`/...`) take that branch; the sentinel handlers below are finally reachable, so post-login lands on the intended quiz/exam. `Signup.jsx` gained the same path-`from` handling (it previously dropped real paths entirely).
- **Auth-notice preserves destination** (`AuthNoticePage.jsx`): Log In link now carries `state.from`; added a "Create a free account" link with the same state. Combined with the Login/Signup fix, guest sidebar clicks resume at the page they wanted, not `/dashboard`.
- **Signup CTA on guest quiz results** (the highest-intent moment): `DetailedQuizResults` gained `ctaSlot` + `showProgressionBanners` props; `GuestSmartQuiz` passes an honest "This result isn't saved" card (create-account button + log-in link) and suppresses the fake "Promoted to Level N!" banner (nothing is saved for guests). Typo "loged-in" fixed ×2.
- **ProFeatureModal is auth-aware**: guests now get "Create a free account" → `/signup` instead of "Upgrade to Pro" → `/membership/upgrade` → login wall (the wrong ask on a broken path).
- **Public pricing on the landing page**: new `#pricing` section on V3 (section 05, in the V3 design language) — Free vs Pro cards with real prices ($9.99/mo, $99.99/yr) and honest feature lists matching actual gating (3 free full-length tests, diagnostic free; Pro = unlimited tests, lectures, flashcards, concept bank). Nav + footer "Pricing" links are now in-page anchors instead of `/signup`; card CTAs are auth-aware (guest → signup, member → upgrade).
- **One onboarding path** (signup → Home first-steps → coach): `/onboarding` AI-chat flow retired — route redirects to `/dashboard`, ProgressDashboard's first-time redirect removed (new users see their empty Progress page instead of being teleported). `OnboardingPage.jsx/.css` + `AIOnboardingSidePanel.jsx/.css` added to the cleanup script.
- **Email-verification banner on Home**: verified already resolved — Phase B moved Dashboard onto the standard shell, and `RootLayout` renders the banner on all standard-shell pages, so `/dashboard` shows it post-signup. No change needed.
- Ship gate: changed files parse-verified; run `npm run build` in apps/web on the dev machine (the sandbox can't run vite's native binding), then deploy. Cleanup `--apply` still pending (now includes the onboarding files).

**Phase F — DONE (same day):**
- **`styles/tokens.css`** — THE design tokens, extracted 1:1 from V3 (`--ut-*`): full palette (ink/panel/light/card/text/muted/rules + the green accent family incl. new derived `--ut-accent-soft`/`--ut-accent-rule` tints), fonts (Space Grotesk display · Schibsted Grotesk body · JetBrains Mono labels), radius scale (6/10/12), shadows. Loaded first in `index.jsx`; fonts share V3's Google Fonts URL (already cached for anyone who saw the landing).
- **Global base**: Times New Roman is dead — body/`*` → Schibsted Grotesk, headings → Space Grotesk, buttons inherit; page background → V3 light (`#EDF0F1`); the dashed-black `main-content` border hack removed. (Pages with intentional typography — exam interface's serif passages, PracticeExamList's own shell — set their own fonts and are untouched.)
- **App shell repainted**: Sidebar → V3 ink (`#0D1216`) with green-tint active state + accent left border + green mono Pro badges (blue pulse → green; collapsed-state tooltip fixed for the new translucent hover); TopNavBar inherits the same vars, active items in accent; ProfileDropdown trigger de-clashed (orange-on-blue → token neutrals). Legacy `--primary-color` left untouched — other pages still consume it.
- **Home (Dashboard)** fully on tokens: display-font greeting + stat numbers, mono uppercase card labels, green primary CTAs (`--ut-accent` bg + `--ut-on-accent` text), green-tint secondary buttons/chips, token text/rules throughout.
- **Auth pages** (every user funnels through): container/card/inputs/buttons/links on tokens, primary button → the V3 green, focus rings green (Google buttons keep their own styling).
- Verification: changed JSX parse-checked, all touched CSS brace-balanced; sidebar var blast-radius confirmed confined to Sidebar/TopNavBar. Ship gate: `npm run build` in apps/web on the dev machine → deploy.

**All phases A–F complete.** Outstanding: `scripts/cleanup-dead-code.js --apply` (33 + 4 onboarding files), server-side deferred items listed above (§4 tail), and any deep per-page restyles beyond the token base — cosmetic, at leisure.

## 5. Invariants
Every destination has exactly one label · every route either works or redirects · no hardcoded stats anywhere · one scoring module · one upgrade surface · nav config is the only place navigation is defined.
