/* LearnRouteSwitch — progressive lesson redesign swap.
 *
 * /learn/:subcategoryId serves the new UWorld-style LessonPage (v2) for
 * every subcategory registered in content/lessons/index.js, and the legacy
 * SubcategoryLearnPage for everything not yet rebuilt. As each lesson's v2
 * content lands, it replaces the old page here automatically; the old page
 * stays reachable for admins at /admin/legacy-learn/:subcategoryId.
 */

import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { usePostHog } from '@posthog/react';
import { toCanonicalSubcategoryId } from '../utils/subcategoryTaxonomy';
import { hasLessonV2 } from '../content/lessons';

const LessonPage = React.lazy(() => import('./LessonPage'));
const SubcategoryLearnPage = React.lazy(() => import('./SubcategoryLearnPage'));

export default function LearnRouteSwitch() {
  const { subcategoryId } = useParams();
  const posthog = usePostHog();
  const canonicalId = toCanonicalSubcategoryId(subcategoryId) || subcategoryId;
  const usesV2 = hasLessonV2(canonicalId);

  useEffect(() => {
    // lesson_viewed is a genuine page-load side effect — syncing with the
    // external analytics system — which is the legitimate useEffect use case.
    posthog?.capture('lesson_viewed', {
      subcategory_id: canonicalId,
      lesson_version: usesV2 ? 'v2' : 'v1',
    });
    // Capture once when the lesson route mounts or the subcategory changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canonicalId]);

  return usesV2 ? <LessonPage /> : <SubcategoryLearnPage />;
}
