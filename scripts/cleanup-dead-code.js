#!/usr/bin/env node
/**
 * Overhaul Phase A — dead-code removal.
 *
 * Deletes files verified as orphans (nothing imports them; routes removed in
 * App.jsx). Everything is git-recoverable. See SITE_OVERHAUL_PLAN.md §2.
 *
 *   node scripts/cleanup-dead-code.js         # list what would be deleted
 *   node scripts/cleanup-dead-code.js --apply # delete
 */

const fs = require('fs');
const path = require('path');

const WEB = path.join(__dirname, '..', 'apps', 'web', 'src');

const DEAD_FILES = [
  // Retired landing pages (routes now redirect to /)
  'pages/HomePage.jsx',
  'pages/LandingPage.jsx',
  'pages/LandingPage2.jsx',
  'pages/LandingPageAds.jsx',
  'pages/LegacyLandingPage.jsx',
  'components/LandingPage.jsx',
  'LandingPage.js', // module-scope createRoot hazard at src root

  // Dead legacy exam system
  'pages/ExamController.jsx',
  'pages/IntermissionController.jsx',
  'pages/ExamLandingPage.jsx',
  'components/Intermission.jsx', // legacy twin; IntermissionScreen.jsx is the live one

  // Replaced / unreachable pages
  'pages/AICoachPage.jsx', // replaced by CoachPage
  'pages/QuizResults.jsx',
  'pages/SkillsPractice.jsx', // absorbed into Question Bank (route redirects)
  'pages/StudyResources.jsx', // unlinked + empty collection (route redirects to /lectures)
  'pages/GuestQuiz.jsx',
  'pages/SkillDrillQuiz.jsx',
  'pages/Lesson.jsx',
  'pages/LessonModal.jsx',
  'pages/ConceptAnalytics.jsx',

  // Orphaned components
  'components/ReviewTile.jsx',
  'components/SkillReviewChips.jsx',
  'components/ConceptReviewChips.jsx',
  'components/HelperItemsPanel.jsx',
  'components/QuestionGenerator.jsx',
  'components/QuestionGeneratorLive.jsx',
  'components/ProgressTracker.jsx', // empty file
  'components/AICompanionPanel.jsx', // unmounted; coach dock replaced it
  'components/AICompanionPanel.css',

  // Orphaned utils/data
  'utils/mockQuizzes.js',
  'utils/mockLessons.js',
  'utils/openaiService.js', // browser-side API key pattern; consumers all deleted above
  'data/guestDecks.js',

  // Retired AI-chat onboarding (Phase E: /onboarding now redirects to /dashboard)
  'pages/OnboardingPage.jsx',
  'pages/OnboardingPage.css',
  'components/AIOnboardingSidePanel.jsx',
  'components/AIOnboardingSidePanel.css',
];

const APPLY = process.argv.includes('--apply');
let deleted = 0;
let missing = 0;

console.log(`\n=== Dead-code cleanup ${APPLY ? '*** DELETING ***' : '(list only — use --apply)'} ===\n`);
for (const rel of DEAD_FILES) {
  const full = path.join(WEB, rel);
  if (!fs.existsSync(full)) {
    console.log(`  (already gone) ${rel}`);
    missing += 1;
    continue;
  }
  if (APPLY) {
    fs.unlinkSync(full);
    console.log(`  deleted        ${rel}`);
  } else {
    console.log(`  would delete   ${rel}`);
  }
  deleted += 1;
}
console.log(`\n${APPLY ? 'Deleted' : 'Would delete'}: ${deleted} · already gone: ${missing}`);
console.log('After --apply: run `npm run build` in apps/web — if anything unexpectedly imported one of these, the build names it. All recoverable via git.');
