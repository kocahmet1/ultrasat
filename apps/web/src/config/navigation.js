/**
 * THE navigation config (Overhaul Phase A).
 *
 * Single source of truth for app navigation. Desktop Sidebar and mobile
 * TopNavBar both consume this — never define nav items anywhere else.
 * Labels follow the naming standard in SITE_OVERHAUL_PLAN.md §3
 * (one label per destination, everywhere).
 */

import {
  FiHome,
  FiCheckSquare,
  FiFlag,
  FiGrid,
  FiBarChart2,
  FiZap,
  FiBookOpen,
  FiLayers,
  FiBook,
  FiPocket,
  FiAward,
  FiSliders,
  FiClock,
  FiCalendar,
} from 'react-icons/fi';

/**
 * Ordered app navigation.
 *  pro: link-level Pro gate (route-level gates arrive in Phase C)
 *  mobilePrimary: appears in the mobile bar directly (rest go under "More")
 *  guestPath: what guests get instead (null = hidden for guests)
 */
export const APP_NAV = [
  { path: '/dashboard', label: 'Home', Icon: FiHome, mobilePrimary: true, guestPath: null },
  { path: '/practice-exams', label: 'Practice Tests', Icon: FiCheckSquare, mobilePrimary: true, guestPath: null },
  { path: '/subject-quizzes', label: 'Question Bank', Icon: FiGrid, mobilePrimary: true, guestPath: '/guest-subject-quizzes' },
  // Practice Builder + history (P1-B). Free with Pro teasing inside the pages,
  // so neither is pro-flagged here. `end`: exact-match active state, so
  // /practice does not light up on /practice/history or /practice-exams.
  { path: '/practice', label: 'Practice Builder', Icon: FiSliders, end: true, guestPath: null },
  { path: '/practice/history', label: 'My Practice', Icon: FiClock, guestPath: null },
  // Study Planner (P2-A): day-by-day plan generated from the test date.
  { path: '/planner', label: 'Study Planner', Icon: FiCalendar, guestPath: null },
  { path: '/progress', label: 'Progress', Icon: FiBarChart2, mobilePrimary: true, guestPath: null },
  { path: '/coach', label: 'Coach', Icon: FiZap, guestPath: null }, // mobile: reachable via the coach dock + More menu
  { path: '/predictive-exam', label: 'Diagnostic', Icon: FiFlag, guestPath: null },
  { path: '/lectures', label: 'Lectures', Icon: FiBookOpen, pro: true, guestPath: null },
  { path: '/flashcards', label: 'Flashcards', Icon: FiLayers, pro: true, guestPath: null },
  { path: '/word-bank', label: 'Word Bank', Icon: FiBook, guestPath: null },
  { path: '/concept-bank', label: 'Concept Bank', Icon: FiPocket, pro: true, guestPath: null },
  { path: '/all-results', label: 'Results', Icon: FiAward, guestPath: null },
];

/** Nav for the current auth state. Guests: mapped/filtered + login entry. */
export function getNavItems(isAuthenticated) {
  if (isAuthenticated) return APP_NAV;
  return APP_NAV
    .filter((item) => item.guestPath !== null || item.pro) // pro items stay visible as upsell
    .map((item) => (item.guestPath ? { ...item, path: item.guestPath } : item));
}

export const PRO_PATHS = APP_NAV.filter((i) => i.pro).map((i) => i.path);

/** Public paths guests may open directly from nav. */
export const GUEST_PUBLIC_PATHS = ['/login', '/signup', '/', '/guest-subject-quizzes', '/guest-smart-quiz'];
