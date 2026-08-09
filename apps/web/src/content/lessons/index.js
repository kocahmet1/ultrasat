/* content/lessons — Lesson v2 registry.
 *
 * Lesson v2 ("study guide") content lives as versioned JSON files in this
 * folder, one per canonical kebab-case subcategoryId. This registry is the
 * single switch that decides whether /learn/:subcategoryId serves the new
 * two-panel LessonPage (v2) or the legacy SubcategoryLearnPage.
 *
 * To migrate a lesson:
 *   1. Author <subcategory-id>.lesson.json (schema: docs/lesson-v2-authoring.md)
 *   2. Add one entry to LESSON_V2_LOADERS below.
 * Nothing else — routing, planner, and progress tracking key off the same
 * canonical subcategoryId and pick the new page up automatically.
 *
 * The import map is intentionally static (no template-string dynamic import)
 * so Vite code-splits each lesson into its own lazy chunk.
 */

const LESSON_V2_LOADERS = {
  'central-ideas-details': () => import('./central-ideas-details.lesson.json'),
  inferences: () => import('./inferences.lesson.json'),
  'command-of-evidence': () => import('./command-of-evidence.lesson.json'),
  'text-structure-purpose': () => import('./text-structure-purpose.lesson.json'),
  'cross-text-connections': () => import('./cross-text-connections.lesson.json'),
  'rhetorical-synthesis': () => import('./rhetorical-synthesis.lesson.json'),
  transitions: () => import('./transitions.lesson.json'),
  boundaries: () => import('./boundaries.lesson.json'),
  'form-structure-sense': () => import('./form-structure-sense.lesson.json'),
  'words-in-context': () => import('./words-in-context.lesson.json'),
  // Math
  'linear-equations-one-variable': () => import('./linear-equations-one-variable.lesson.json'),
  'linear-functions': () => import('./linear-functions.lesson.json'),
  'linear-equations-two-variables': () => import('./linear-equations-two-variables.lesson.json'),
  'systems-linear-equations': () => import('./systems-linear-equations.lesson.json'),
  'linear-inequalities': () => import('./linear-inequalities.lesson.json'),
  'nonlinear-functions': () => import('./nonlinear-functions.lesson.json'),
  'nonlinear-equations': () => import('./nonlinear-equations.lesson.json'),
  'equivalent-expressions': () => import('./equivalent-expressions.lesson.json'),
  'ratios-rates-proportions': () => import('./ratios-rates-proportions.lesson.json'),
  percentages: () => import('./percentages.lesson.json'),
  'one-variable-data': () => import('./one-variable-data.lesson.json'),
  'two-variable-data': () => import('./two-variable-data.lesson.json'),
  probability: () => import('./probability.lesson.json'),
  'inference-statistics': () => import('./inference-statistics.lesson.json'),
  'evaluating-statistical-claims': () => import('./evaluating-statistical-claims.lesson.json'),
  // Geometry & Trigonometry
  'area-volume': () => import('./area-volume.lesson.json'),
  'lines-angles-triangles': () => import('./lines-angles-triangles.lesson.json'),
  'right-triangles-trigonometry': () => import('./right-triangles-trigonometry.lesson.json'),
  circles: () => import('./circles.lesson.json'),
};

/** True if this subcategory has redesigned (v2) lesson content. */
export function hasLessonV2(subcategoryId) {
  return Object.prototype.hasOwnProperty.call(LESSON_V2_LOADERS, subcategoryId);
}

/**
 * Load the v2 lesson JSON for a subcategory.
 * @returns {Promise<Object|null>} the lesson document, or null if none exists
 */
export async function loadLessonV2(subcategoryId) {
  const loader = LESSON_V2_LOADERS[subcategoryId];
  if (!loader) return null;
  const mod = await loader();
  return mod?.default ?? mod ?? null;
}

export const LESSON_V2_IDS = Object.keys(LESSON_V2_LOADERS);
