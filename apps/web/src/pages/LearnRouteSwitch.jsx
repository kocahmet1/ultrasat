/* LearnRouteSwitch — progressive lesson redesign swap.
 *
 * /learn/:subcategoryId serves the new UWorld-style LessonPage (v2) for
 * every subcategory registered in content/lessons/index.js, and the legacy
 * SubcategoryLearnPage for everything not yet rebuilt. As each lesson's v2
 * content lands, it replaces the old page here automatically; the old page
 * stays reachable for admins at /admin/legacy-learn/:subcategoryId.
 */

import React from 'react';
import { useParams } from 'react-router-dom';
import { toCanonicalSubcategoryId } from '../utils/subcategoryTaxonomy';
import { hasLessonV2 } from '../content/lessons';

const LessonPage = React.lazy(() => import('./LessonPage'));
const SubcategoryLearnPage = React.lazy(() => import('./SubcategoryLearnPage'));

export default function LearnRouteSwitch() {
  const { subcategoryId } = useParams();
  const canonicalId = toCanonicalSubcategoryId(subcategoryId) || subcategoryId;
  return hasLessonV2(canonicalId) ? <LessonPage /> : <SubcategoryLearnPage />;
}
