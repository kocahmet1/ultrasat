# UltraSAT — Site Flow & Feature Audit
*Generated 2026-07-26. Scope: site flow, features, discrepancies, redundancies. Code quality excluded by request. Every claim carries a file reference.*

---

## 1. Executive summary

The platform's core loop — **practice exams → skill-based SmartQuizzes → per-subcategory progress** — is real, wired end-to-end, and backed by a serious admin content pipeline (AI question generation, exam QC, PDF ingestion). Around that core, however, the site has accumulated **three layers of problems**:

1. **Data-integrity discrepancies** — two conflicting subcategory ID maps corrupt topic attribution for 9 of 29 skills; exam progress writes silently fail Firestore validation; 4–5 different formulas compute "accuracy" and "estimated SAT score", so the same student sees different numbers on different pages.
2. **Parallel/duplicate systems** — two exam engines (one dead), 7 landing pages, two flashcard dashboards, two concept systems on different ID namespaces, three quiz-results screens, four upgrade modals, and ~9 different navigation menus that disagree with each other.
3. **Fake data & dead ends** — the default post-login Dashboard shows hardcoded fictional scores; the AI Coach page (linked from everywhere) contains zero AI; multiple "Learn"/"Back" buttons navigate to routes that don't exist and silently dump users on the marketing homepage.

The single most valuable structural fact for future work: **the richest AI capability in the codebase (`companionService.aggregateUserContext` — joins all progress, exams, quizzes, attempts, and computes an SAT estimate server-side) is currently spent on one 2-sentence greeting shown on one page.** It is the natural foundation for the system-wide AI monitoring you're planning.

---

## 2. What the system actually is (capability map)

**Stack**: React SPA (`apps/web`, react-router v6 `createBrowserRouter` in `App.jsx`) + Node/Express API (`apps/api`) + Firebase Auth/Firestore + Stripe + OpenAI (several models) + traces of Gemini.

### 2.1 Student-facing pillars

| Pillar | Live surface | State |
|---|---|---|
| Full-length exams | `/practice-exams` → `/practice-exam/:examId` → `/exam/results/:id` | Working. Linear module sequencing, 10-min intermission, save/resume, per-subcategory progress write. **No adaptive Module 2 routing** (real DSAT adaptivity unimplemented). |
| Diagnostic | `/predictive-exam` (filters `isDiagnostic` exams, same controller, skips intermission, free) | Working. Called "Predictive Exam", "Official Exams", and "Diagnostic" in different places. |
| Skill quizzes | SmartQuiz engine: `/smart-quiz-generator` → `-intro` → `/smart-quiz/:id` → `-results`. 5 Qs, level 1–3 ↔ easy/med/hard, 80% pass → level-up. ~11 launchers across the app all feed this one engine | Working; the healthiest subsystem. |
| Mixed quizzes | "Build Mixed Quiz" modal on `/subject-quizzes` (1–30 Qs, multi-subcategory) | Working. Same modal also labeled "Adaptive Quiz Builder (Beta)" — it is not adaptive. |
| Progress tracking | `/progress` (ProgressDashboard) + `/subcategory-progress/:id`; store: `users/{uid}/progress/{kebab-id}` (level, accuracy, last10, askedQuestions, missedQuestions, attemptHistory, conceptMastery) | Working core with the discrepancies in §3. |
| In-quiz AI | "AI Study Coach" rail in SmartQuiz (5 prompt actions + free-chat), vocab/concept helper with shared cache | Working. Sees only the current question — no student context. |
| AI companion | "SAT Coach" floating panel + OpenAI Realtime voice — **mounted only on `/progress`** | Working, hidden. Backed by the full user-context aggregator. |
| Concept drills | `/concept/:conceptId` — LLM-generated drills (o4-mini, cached) | Working but disconnected from progress (§3.4) and from the bank concepts (§5.6). |
| Lessons | `/lectures` → `/learn/:subcategoryId` — text + static PNGs + 6 hardcoded 2D framer-motion infographics + embedded sample quiz | Working for 28/29 subcategories. **No video, no 3D anywhere yet** — your planned 3D lessons have a clean slot here. |
| Vocab/concepts | `/word-bank`, `/concept-bank` (one Firestore collection, `type` filter), `/flashcards`, deck quizzes | Working; heavy duplication (§5.5) and fabricated stats (§6). |
| Guest funnel | `/guest-subject-quizzes` → `/guest-smart-quiz`; guest vocab quiz `/guest-quiz` (unlinked) | Working but conversion-broken (§9). |
| Payments | Stripe checkout, tiers free/plus/max, coupons, admin overrides | Working; gating chaos in §8. |

### 2.2 Admin/content pipeline (strong asset)

AI question generation with independent-solver verification and publish blockers (`questionGenerationRoutes.js`); question audit & quality passes; **exam QC** (4,600-line route file; publish requires `scopeComplete && publishReady`, fingerprint match; editing a module auto-unpublishes the exam); PDF exam ingestion (extract → AI validate → normalize → upload); graph generation (Plotly+Puppeteer, **disabled by default** via `ENABLE_GRAPH_GENERATION=false`); blog, coupons, membership management. Admin dashboard does **not** link `/admin/question-quality` or `/admin/learning-content` (routed but unreachable).

### 2.3 The AI inventory (for your integration planning)

| Feature | Backend | Model | Sees student data? |
|---|---|---|---|
| SmartQuiz coach + chat | `/api/assistant` | gpt-5-mini | No — current question only |
| Vocab/concept helper | `/api/assistant/helper` | gpt-5-mini | No (globally cached) |
| SAT Coach greeting | `/api/companion/greeting` | gpt-5-mini | **Yes — everything** (progress×29, last 10 exams, 20 quizzes, 100 attempts, computed SAT estimate) |
| Voice coach | OpenAI Realtime | gpt-realtime-mini | Yes — same context in session instructions |
| Onboarding chat | `/api/companion/onboarding-chat` | gpt-5-mini | Aggregates full context, **uses only displayName** |
| Concept explanation | `/api/concepts/detailed-explanation` | gpt-5-mini | No |
| Concept drills | `/api/generate-concept-drill` | o4-mini, reasoning=high, 100k max tokens | No |
| **Next-steps recommender** | `/api/companion/next-steps` — **fully built, never called by any UI** | gpt-5-mini | Yes |
| **Quiz wrong-answer analysis** | `/api/analyze-quiz` — **built, never called** | o4-mini | Per-quiz |
| `/ai-coach` page | **none — static mock** | — | — |

Cost/limits: daily token quota exists only on the helper endpoint (chat is unmetered); admin token dashboard reads a `tokenUsage` collection **nothing writes** (renders $0.00 forever); no per-tier rate limiting; concept-drill generation (100k max tokens) is ungated and unmetered — the most expensive call a free student can trigger.

---

## 3. Critical discrepancies (data integrity)

### 3.1 Two conflicting subcategory ID maps — topic attribution corrupted for 9 of 29 skills
`utils/subcategoryConstants.js:94` (`SUBCATEGORY_KEBAB_CASE`) and `utils/subcategoryUtils.js:54` (`NUMERIC_ID_TO_KEBAB_CASE`) disagree:

| Numeric ID | constants says | utils says |
|---|---|---|
| 7 | rhetorical-synthesis | form-structure-sense |
| 8 | transitions | boundaries |
| 9 | boundaries | rhetorical-synthesis |
| 10 | form-structure-sense | transitions |
| 11 | linear-equations-one-variable | linear-functions |
| 12 | linear-functions | linear-equations-one-variable |
| 16 | nonlinear-functions | equivalent-expressions |
| 17 | nonlinear-equations | nonlinear-functions |
| 18 | equivalent-expressions | nonlinear-equations |

The utils map decides **which progress doc gets written** (`normalizeSubcategoryName` → `progressUtils.js`); the constants map decides **display names, SAT-score weighting, and quiz routing**. A question tagged numeric `7` records progress under *form-structure-sense* but is displayed as *Rhetorical Synthesis*. Both numeric and kebab IDs genuinely coexist in the question bank (admin editors write numeric; upload scripts write kebab). There are **5 parallel copies of the taxonomy** overall (constants, utils, categoryUtils, helpers.js, api/companionService.js). This is the first thing to fix before trusting any per-skill analytics.

### 3.2 Practice-exam progress writes silently fail validation
`firestore.rules:63` requires percent fields to be **integers**; `PracticeExamController.jsx:319` sends unrounded floats (e.g. 2/3 → 66.67) as `lastScore` → write rejected, retried 3×, logged, user never told. Rules also cap `totalQuestions` growth at +10/write — one exam module contributing >10 questions to a subcategory is rejected wholesale. **A large share of exam-driven skill progress never persists.** (SmartQuiz rounds, so quizzes are safe.)

### 3.3 Same stat, different formulas on different pages
- **Estimated SAT score**: 5 implementations (save-time linear 200+600·pct in the exam controller; ExamResults recomputes with subcategory weights and *ignores the stored score* — so `/practice-exams` and the results page show different scores for the same exam; progressUtils questionAttempts-based; its `_Legacy` twin; Profile's invented `1120+acc·5+exams·18`).
- **Accuracy**: `/progress` weights last-10 by lifetime counts; Profile uses lifetime Σcorrect/Σtotal; API `computeUserStats` uses a third denominator (drives "Top X%" badges); SubcategoryProgressPage labels *lifetime* accuracy as "Recent Accuracy", so it contradicts the card the user just clicked.
- **ExamResults section split bug**: `ExamResults.jsx:167` keys `SUBCATEGORY_SUBJECTS` by numeric ID; kebab-tagged questions return undefined → bucketed into **Math**, driving R&W toward the 200 floor on the results screen.
- "Inferences" is classified as a Math skill by keyword matching (`progressDashboardUtils.js:238` — `'inferences'.includes('inference')` in MATH_KEYWORDS).

### 3.4 Flows that don't feed the tracking system (inconsistent by design)
- **Concept drills** (`ConceptPractice`) update only `conceptMastery` — never accuracy, level, attemptHistory, SAT estimate, or rankings.
- **Word/deck quizzes** (`components/Quiz.jsx`) persist nothing.
- **Exams never write `attemptHistory`** (only SmartQuiz does) → the trend chart on SubcategoryProgressPage stays empty for exam-only students; conversely the SAT estimate on `/progress` prefers `questionAttempts`, which **only exams** write → quiz-only students silently get a different fallback formula.
- SmartQuiz writes concept mastery to `users/{uid}/conceptMastery/*`; `/progress` reads `progress/*.conceptMastery` — **SmartQuiz concept work never appears on the dashboard**; the only reader of the store it writes (`ConceptAnalytics.jsx`) is unrouted.
- Exams can never level a student up (`passed` hardcoded false); FeatureHelpModal tells users "answer 10+ questions to unlock levels", which is not the actual rule (pass a SmartQuiz at ≥80%).

### 3.5 Historical exam results mutate
`userExamServices.js:30` re-attaches the **current** live modules to past results. Admin edits/QC repairs change what a student sees when reopening an old result; editing a module also auto-unpublishes its exam — it vanishes from the student list, and in-progress `examProgress` docs dead-end on resume.

### 3.6 Progress-save payload risk
The resume snapshot embeds **full question objects** for all answered modules in one Firestore doc — plausibly exceeds the 1 MiB limit late in a 98-question exam, silently breaking save/resume.

---

## 4. Broken flows & dead links (user-visible)

All unknown paths hit the catch-all and silently redirect to the **marketing homepage** — so every dead link below strands a logged-in user on the landing page. No 404 page exists.

| Where | Broken action | File |
|---|---|---|
| `/progress` "Learn" button | navigates `/lessons/:id`; route is `/learn/:id`. Paywall check runs first, so **paying users** hit it | `ProgressDashboard.jsx:102` |
| SubcategoryProgressPage | "Back to My Progress" ×2 → `/my-progress` (no route) | `:181,205` |
| SubcategoryProgressPage | Related-concept rows → `/concept/:subcat/:conceptId` (route is single-segment) | `:353,356` |
| SubcategoryProgressPage | "Learn" passes a *subcategory* ID to ConceptPractice → "Concept not found" | `:164` |
| AI Companion action button | "Start Practice" → `/smart-quiz-generator` with no state → error card "No subcategory specified" (model can also invent routes — no allow-list) | `AICompanionContext.jsx:95`, `companionService.js:322` |
| SmartQuiz in-quiz nav | "Study Plan" → `/smart-quiz-intro` with no state → "Unknown Subcategory", Start fails | `SmartQuiz.jsx:1075` |
| Auth modals (Login path) | sentinel strings `'quiz'/'exam'/'questionBank'` passed as `from` → relative navigate → catch-all → landing page. Signup handles the same intent correctly; login loses it | `Login.jsx:17`, `QuizAuthModal.jsx:60`, `ExamAuthModal.jsx:44` |
| SATGuide / Ads LP exam CTA | `examId='predictive'` → `/practice-exam/predictive` → "exam not found" (email path; Google path works) | `SATGuide.jsx:360`, `ExamAuthModal.jsx:25` |
| Dashboard/AICoach search | deep-link `/subject-quizzes?search=x` — page never reads the param | `Dashboard.jsx:119`, `SubjectQuizzes.jsx:56` |
| ConceptDetail practice list | every question click → toast "Question practice coming soon!" | `ConceptDetail.jsx:145` |
| SubjectQuizzes "AI Coach [Beta]" | links to `/dashboard`, not `/ai-coach` | `SubjectQuizzes.jsx:332` |
| Legacy `/intermission` route | completion navigates `/exam/module/3` — no such route | `IntermissionController.jsx:12` |
| ProgressDashboard SAT-estimate hint | tells users to take a Practice/Predictive test to see the estimate — but the estimate reads `questionAttempts`, which that flow writes only via a different path; misleading loop | `ProgressDashboard.jsx:280` |
| `/skills` ("Study Plan") | **crashes**: placeholder service returns an object, page calls `.find()` on it | `SkillsPractice.jsx:55`, `subcategoryServices.js:58` |
| Profile | if membership hasn't loaded in 2s → **forces full browser reload** | `Profile.jsx:212` |
| Static pages (`/help`, `/about`, `/privacy`…) | render with **zero navigation chrome and no back link** — users are stranded | `LandingPageLayout.jsx` |
| Live `/` footer | Privacy/Terms/Cookies/Accessibility/About/Careers/Press/Help **not linked from the live homepage** (only from retired landing variants) — compliance exposure | `LandingPageV3.jsx:632` |

---

## 5. Redundant / parallel systems

1. **Two exam engines.** Legacy `/exam/:moduleId` (`ExamController.jsx`) is unreachable from UI, assembles modules from *whichever* docs share a moduleNumber (Frankenstein exams), double-counts responses, scores 400/1600 in results, and records zero progress (calls a placeholder). Current: `PracticeExamController`. The legacy chain (`ExamController`, `IntermissionController`, `ExamLandingPage`) should be deleted or fenced.
2. **Three results routes → one component**, two of them dead: `/results/:id` (no references) and `/practice-exam/:id/results` (wrong ID type — always "not found"). Live: `/exam/results/:id`.
3. **7 landing pages**: `/` (V3), `/landing-old`, `/landing-original`, `/landing_page` (ads), `/landingpage2`, plus orphans `pages/HomePage.jsx` (584 lines, never imported) and `components/LandingPage.jsx` + `src/LandingPage.js` (module-scope `createRoot` — hijacks the app if ever imported). All crawlable (robots.txt allows everything; the sitemap it advertises doesn't exist).
4. **Three quiz-results screens**: `SmartQuizResults` (live), `DetailedQuizResults` (guest-only; SmartQuizResults duplicates its markup instead of reusing it), `QuizResults` (routed, unreachable, redirects if visited).
5. **Two flashcard dashboards** over the same decks (WordBank tab vs `/flashcards`) with different gating; **three add-to-deck flows**; **two independent default-deck creators** (client + server).
6. **Two concept systems on different ID namespaces**: bank items (`/concept-detail/:bankItemId`) vs curated concepts (`/concept/:conceptId`). No cross-links; a concept saved from a quiz can never reach the drill engine.
7. **Word Bank and Concept Bank are one collection** (`bankItems` + `type` filter) presented as two products with different UIs.
8. **Two lesson data sources**: `learningContent` (live) vs `lessons` (abandoned AI-generated; rules still exist; its reader pages are orphaned). Plus `studyResources` — a third, Plus-gated surface with no nav link and no writer (permanently empty).
9. **Four upgrade modals** (`UpgradeModal`, `ProFeatureModal`, `WordBankUpgradeModal`, `LearnUpgradeModal`) + `MembershipGate` panel + unused `UpgradePrompt` — different designs, different claimed benefits, all saying "Pro" for tiers named Plus/Max.
10. **~9 navigation definitions** (global Sidebar ×2 modes + guest variant, TopNavBar, and per-page shells on Dashboard/AICoach/PracticeExamList/SmartQuiz/Profile/Lectures). Profile and Lectures render their shell **inside** the global shell → double navigation. Consequences in §7.
11. **Guest quiz stack is a fork** of the logged-in stack (GuestSubjectQuizzes/GuestSmartQuiz/GuestMetaQuizModal duplicate SubjectQuizzes/SmartQuiz/modal) — already drifting (no confidence rating, bookmark, report).
12. **Duplicate API-base conventions**: assistant clients default to `ultrasat.onrender.com`, companion context to `veritas-blue-web.onrender.com` — with `REACT_APP_API_URL` unset, AI features split across two hosts.

---

## 6. Fake/hardcoded data shown as real

- **`/dashboard` (default post-login page)**: returning-user view is almost entirely fiction — "Practice Test 1 — 1550", score trend 1200→1550, "Week 4 of 8", streak 7, weekly goal 12/18, "Continue Last Test 52:18", flashcards "72% Mastery", notification badge "2" (`Dashboard.jsx:55-69,457-511,532-606`).
- **`/ai-coach`**: all numbers literal ("Inference 18%", "+60 pts", sessions dated May 2025); chat input is `preventDefault` — **typing does nothing**; "Generate My Study Plan" flips a local string (`AICoachPage.jsx`).
- **SmartQuiz coach rail**: "Based on your recent performance" card and weekly sparkline `[34,48,46,63,58,68,61,78]` are hardcoded — shown on Math quizzes too (`SmartQuiz.jsx:1416,1539`). Bookmark button only fires a toast.
- **`/lectures`**: completed/in-progress/saved sets are literal; "40+ Hours of Lessons", "Continue Learning: Transitions 70%", bell badge "3"; subtitle promises "structured **video lessons**" — no video exists (`LecturesPage.jsx:26-28,198-248`).
- **`/flashcards`**: mastery % derived from word count + array index; "Due Today" fake; spaced-repetition claim with no scheduler; six fake sample decks shown as real; "Generate with AI" → `/ai-coach` which has no such feature (`Flashcards.jsx:57-165,577,771`).
- **`/subject-quizzes`**: hardcoded completed/popular topic IDs, "Average Accuracy 78%", badge "3" (`SubjectQuizzes.jsx:32-40,346,395`).
- **`/profile`**: invented score projection formula, synthesized 6-point score history, fabricated activity timeline ("2h ago…") (`Profile.jsx:233-311`).
- **Landing claims vs reality**: "Free · no account needed" exam CTA → opens auth modal; guest exam rack lists fictional "Official Practice Test 1–5"; orphan HomePage claims "50K+ questions" vs 8K elsewhere; LandingPage2 testimonial images don't exist; ads LP nav links guests to six login-walled pages.
- **SubcategoryProgressPage level bar**: bound to fields (`questionsAttemptedInLevel`) that nothing writes and rules forbid — permanently 0/10.
- **`/progress` "Your Learning Path"**: promise paragraph + **empty actions div** (`ProgressDashboard.jsx:390-410`).
- **Exam list metadata**: every exam claims "2h 14m · 98 questions" from constants regardless of actual modules; default module time is 32 min (≠ real DSAT math 35 min; 4×32=128 min ≠ advertised 134).

---

## 7. Naming inconsistencies (what users see)

- **Same label → different destinations**: "Dashboard" → `/dashboard` or `/progress` (7 pages); "Study Plan" → `/skills`, `/progress`, or `/smart-quiz-intro`; "Official Exams" → `/predictive-exam`, `/practice-exams`, or `/all-results`; "Analytics" → `/progress` or `/all-results`; sidebar modern set lists "Overview" and "Analytics" both → `/progress`.
- **Label ↔ page-title mismatches**: "Question Bank" → page titled *Subject Quizzes*; "Study Plan" → *Skills Practice*; "Settings" → *Profile*; "Lectures" → URL `/learn/...`; "Predictive Exam" page reached from "Official Exams" links.
- **The AI has six names** (AI Coach / SAT Coach / AI Study Coach / AI Assistant / Study Helper / AI Companion) and three avatar styles. The nav points everyone at the one AI page with **no AI in it**, while the real companion hides behind a floating button on `/progress` only.
- **Tier naming**: checkout sells "Plus"; every gate modal says "Pro"; profile badge says "Plus Tier"; Max exists in code but is filtered off the upgrade page — **Max cannot be purchased** while several features are gated behind it (`MembershipUpgrade.jsx:167`, `membershipUtils.js:116`).
- **Difficulty naming**: Easy/Medium/Hard vs "Level 1–3" vs "Foundation/Standard/Advanced" (QuestionBank) vs drill difficulty (ConceptPractice) — four vocabularies for one 3-level scale.
- "Adaptive" is used for things that aren't (mixed-quiz builder, legacy redirects); "Digital SAT College Finder" links to a score calculator.

---

## 8. Membership gating inconsistencies

- **Link-level gating only**: `/flashcards` and `/concept-bank` are Pro-badged in the sidebar but the routes are ungated — free users get full access by URL. The same free user is blocked from the *identical* deck list inside WordBank's tab.
- **Lessons**: `/lectures` link is gated; `/learn/:id` is open and `/skills` links into it ungated; ProgressDashboard shows a paywall for the same content (then its Learn button 404s).
- **Mobile has no gating at all** (TopNavBar has no Pro checks) — and no Flashcards/Lectures entries either, so the Lectures product is desktop-only by accident.
- **Exams**: paywall exists only in `PracticeExamList` (4th+ exam = Pro); deep-linking `/practice-exam/:id` bypasses it; the post-login auto-start path hardcodes `isPro=false` and **indexes the unfiltered list** — "Start Practice Test 3" from a landing page can launch a different exam than labeled.
- **Zero server-side enforcement**: Firestore rules let any signed-in user read all practice exams; bank/flashcard/concept API routes check auth only. All gating is cosmetic.
- Three gating styles coexist (`hasFeatureAccess('plus')`, `tier === 'free'`, `<MembershipGate>`); `hasFeatureAccess` returns false while membership loads → paying users see Pro badges/blocks on first paint. The declared `FEATURE_ACCESS` matrix is used only in a demo file and contradicts shipped behavior (says exams are FREE).
- Free users get unmetered AI (helper, concept explanations, 100k-token drills) while the cheap chat actions are Pro-gated — the cost/gate mapping is inverted.

---

## 9. Guest & conversion funnel issues

- **Guest quiz results — the highest-intent moment — have no signup CTA** (`GuestSmartQuiz.jsx:274-288`); they even show "Promoted to Level N!" banners though nothing is saved.
- Guests clicking AI buttons get "Upgrade to Pro" → `/membership/upgrade` → PrivateRoute → login form. Wrong ask (they need an account), broken path. Also a typo: "Available to loged-in users."
- Mobile guests get TopNavBar with four login-walled links (desktop gets a curated guest sidebar) — the biggest mobile/desktop divergence.
- Landing V3: "Pricing" → `/signup` for guests; there is **no public pricing page** at all. "All exams →" bounces guests to login with no explanation.
- Desktop guest sidebar routes through `/auth-notice`, which drops the intended destination (its login link carries no state → user lands on `/dashboard`).
- Guest vocab quiz `/guest-quiz` is linked from nowhere.
- Email-verification banner is suppressed on `/dashboard` — the exact page users land on after signup.
- Onboarding: signup lands on `/dashboard` first-steps checklist; the AI chat onboarding at `/onboarding` is reachable **only** if the user happens to visit `/progress` first. Two onboarding systems, different exits (`/dashboard` vs `/progress`); AICoachPage contains a third goal questionnaire stored in local state only (lost on refresh). Diagnostic advertised as ~10 min (onboarding), 30 min (ads LP), 27 Qs/~30 min (actual page).

---

## 10. Orphaned & unreachable (built but not wired)

**Routed, no nav path**: `/skills` (absent from default sidebar & mobile; only in the lectures-mode sidebar and Dashboard/AICoach shells — and it crashes, §4), `/study-resources`, `/exam/landing`, `/smart-quiz-intro` (direct), `/guest-quiz`, `/admin/question-quality`, `/admin/learning-content`. **Mobile users cannot reach `/progress` at all** — the core progress pillar is missing from TopNavBar.

**Not routed/imported at all**: `pages/HomePage.jsx`, `ConceptAnalytics.jsx` (only UI reading SmartQuiz's concept-mastery store), `SkillDrillQuiz.jsx`, `Lesson.jsx`, `LessonModal.jsx`, `components/ReviewTile.jsx`, `SkillReviewChips.jsx`, `ConceptReviewChips.jsx`, `HelperItemsPanel.jsx` (duplicated inline in SmartQuiz), `QuestionGenerator(.Live).jsx` (broken endpoints), `ProgressTracker.jsx` (0 bytes), `utils/mockQuizzes.js`, `mockLessons.js`.

**Built backend, no frontend caller**: `/api/companion/next-steps` (complete progress-aware recommender), `/api/analyze-quiz` (wrong-answer concept mining — the intended feeder of ConceptPractice), assistant chat history read endpoint (history is written twice per turn, never read).

**Inert subsystems**: the whole "repair engine" (ReviewContext is mounted and queries Firestore on every login, but its only writer and its display tile are orphaned — the queue can never fill); `subcategoryServices.js` placeholder functions (return stubs) that break SkillsPractice and empty StudyResources' weak-areas; browser-side OpenAI caller `utils/openaiService.js` with `REACT_APP_OPENAI_API_KEY` (key-in-browser pattern; consumers are all orphaned, but the env example still ships the variable); "Add to study plan" writes `studyPlanItems` that nothing reads.

---

## 11. Read-through to your stated priorities

- **Full-length exams (main strength)**: engine solid, QC pipeline strong. Blockers to "quality": no adaptive Module 2 (the defining DSAT mechanic), naive linear scoring that disagrees between pages, silent progress-write failures, resume-payload risk, and the exam-vanishes-on-edit behavior.
- **Skill quizzes (many)**: healthiest pillar. Main issues are launcher inconsistency (difficulty/promotion rules differ by entry point) and duplicated guest fork.
- **AI system-wide monitor/guide (your plan)**: the aggregation layer already exists (`aggregateUserContext`) and the recommender endpoint is already built and unused. The gap is presentation (companion hidden on one page; six brand names; three separate chat implementations with three histories) and the unmetered/ungated cost surface. Consolidating persona + context + history into one companion service would realize your plan largely from parts already in the repo.
- **Skill/subcategory tracking**: works, but fix §3.1/3.2/3.3 first or the AI guide will reason from corrupted data.
- **3D-animated lessons (planned)**: `SubcategoryLearnPage` already has the slot (6 hardcoded 2D infographics prove the pattern); content exists for 28/29 subcategories (`central-ideas-details` — literally the first topic — is the one with placeholder content). No video/3D pipeline exists yet; the "video lessons" copy currently over-promises.
- **Flashcards/word bank (secondary)**: functional but is the most duplicated area and the biggest source of fabricated stats; fine to deprioritize, but the fake mastery/due data undermines trust in the rest of the product.

---

## 12. Suggested priority order

1. **Unify the subcategory taxonomy** (one module, one map, kebab-case canonical; migrate/re-attribute existing progress docs) — §3.1. Everything else reads through this.
2. **Fix silent progress-write failures** (round percents; lift the +10 cap or batch writes) — §3.2.
3. **Pick one scoring/accuracy formula per stat** and use it everywhere — §3.3.
4. **Kill the dead links** (one-line fixes: `/lessons/`→`/learn/`, `/my-progress`→`/progress`, concept paths, auth-modal sentinels, SubjectQuizzes AI link) and add a 404 page — §4.
5. **Replace fake data with real or remove it** — starting with `/dashboard` (default landing) and `/ai-coach` (either wire it to the companion backend or stop linking the whole nav to it) — §6.
6. **Delete the dead exam system** and orphan pages/routes — §5.1, §10.
7. **Normalize navigation** to one nav definition + consistent labels; add `/progress` and gating to mobile — §7, §8.
8. **Guest conversion**: signup CTA on guest results; public pricing page; fix guest mobile nav — §9.
9. Then build forward: adaptive Module 2, system-wide AI companion (from existing parts), 3D lessons into the existing learn-page slot.

*End of report.*
