import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiBookOpen, FiInfo } from 'react-icons/fi';
// Feather (react-icons/fi) has no calculator or rocket glyph; kept from
// react-icons/fa for these two only (see icon-consolidation notes).
import { FaCalculator, FaRocket } from 'react-icons/fa';
import ProUpgradeModal from '../components/membership/ProUpgradeModal';
import FeatureHelpModal from '../components/FeatureHelpModal';
import SubcategoryProgressSection from '../components/progress/SubcategoryProgressSection';
import { useAuth } from '../contexts/AuthContext';
import { useSubcategories } from '../contexts/SubcategoryContext';
import {
  getConceptsForSubcategories,
  getDetailedProgressForSubcategories,
  getUserConceptMastery,
} from '../firebase/progressDashboardServices';
import {
  buildCategorizedSubcategories,
  getProgressDashboardSummary,
} from '../utils/progressDashboardUtils';
import { estimatedSATFromSkillState } from '../utils/scoring';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import '../styles/ProgressDashboard.new.css';

function ProgressDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, userMembership } = useAuth();
  const {
    loading: subcategoriesLoading,
    allSubcategories,
  } = useSubcategories();

  const [loading, setLoading] = useState(true);
  const [conceptsBySubcategory, setConceptsBySubcategory] = useState({});
  const [userConceptMastery, setUserConceptMastery] = useState({});
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [unmasteredCount, setUnmasteredCount] = useState(0);
  const [detailedProgress, setDetailedProgress] = useState({});
  const [satScoreEstimate, setSatScoreEstimate] = useState(null);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showLearnUpgradeModal, setShowLearnUpgradeModal] = useState(false);

  const handleShowHelp = () => {
    setShowHelpModal(true);
  };

  const handleStartPractice = (subcategoryId) => {
    if (!subcategoryId) {
      console.error('ProgressDashboard: Subcategory ID is missing for Start Practice.');
      return;
    }

    const subcategoryKey = subcategoryId.toString();
    const progress = detailedProgress[subcategoryKey];
    const accuracyRate = progress ? (progress.accuracyLast10 || 0) : 0;

    navigate('/smart-quiz-generator', {
      state: {
        subcategoryId: subcategoryKey,
        accuracyRate,
      },
    });
  };

  const handleLearnClick = (subcategoryId) => {
    if (userMembership?.tier === 'free') {
      setShowLearnUpgradeModal(true);
      return;
    }

    navigate(`/learn/${subcategoryId}`);
  };

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const justFinished = queryParams.get('justFinished');
    if (!justFinished) {
      return undefined;
    }

    setToastMessage('Recommendations updated!');
    setShowToast(true);
    const timer = setTimeout(() => setShowToast(false), 5000);
    return () => clearTimeout(timer);
  }, [location]);

  useEffect(() => {
    let cancelled = false;

    const fetchConceptMastery = async () => {
      if (!currentUser || subcategoriesLoading || !allSubcategories.length) {
        return;
      }

      try {
        const [masteryResult, conceptsResult] = await Promise.all([
          getUserConceptMastery(currentUser.uid),
          getConceptsForSubcategories(allSubcategories),
        ]);

        if (cancelled) {
          return;
        }

        setUserConceptMastery(masteryResult.masteryData);
        setUnmasteredCount(masteryResult.unmasteredCount);
        setConceptsBySubcategory(conceptsResult);
      } catch (error) {
        console.error('Error fetching concept mastery:', error);
      }
    };

    fetchConceptMastery();

    return () => {
      cancelled = true;
    };
  }, [allSubcategories, currentUser, subcategoriesLoading]);

  useEffect(() => {
    let cancelled = false;

    const fetchDetailedProgress = async () => {
      if (!currentUser || subcategoriesLoading || !allSubcategories?.length) {
        if (currentUser && !subcategoriesLoading && allSubcategories?.length === 0) {
          setLoading(false);
        }
        return;
      }

      setLoading(true);

      try {
        const nextDetailedProgress = await getDetailedProgressForSubcategories(
          currentUser.uid,
          allSubcategories,
        );

        if (cancelled) {
          return;
        }

        setDetailedProgress(nextDetailedProgress);

        // Overhaul Phase D: ONE estimate formula (utils/scoring.js), fed by
        // Tier-2 skillState — no more two-formula race where taking an exam
        // silently switched which number you saw.
        try {
          const skillSnap = await getDocs(collection(db, 'users', currentUser.uid, 'skillState'));
          if (cancelled) {
            return;
          }
          const skillStates = skillSnap.docs.map((d) => ({ subcategoryId: d.id, ...d.data() }));
          const est = estimatedSATFromSkillState(skillStates);
          const withData = skillStates.filter((s) => s.attempts > 0).length;
          setSatScoreEstimate({
            estimatedScore: est ? est.total : 0,
            subcategoriesWithData: est ? withData : 0,
            confidence: est ? est.coverage : 0,
            breakdown: est
              ? {
                  readingWriting: { score: est.readingWriting },
                  math: { score: est.math },
                }
              : null,
          });
        } catch (error) {
          console.error('Error calculating SAT score estimate:', error);
        }
      } catch (error) {
        console.error('ProgressDashboard: Error fetching detailed subcategory progress:', error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchDetailedProgress();

    return () => {
      cancelled = true;
    };
  }, [allSubcategories, currentUser, subcategoriesLoading]);

  const categorizedSubcategories = useMemo(
    () => buildCategorizedSubcategories(allSubcategories, detailedProgress, subcategoriesLoading),
    [allSubcategories, detailedProgress, subcategoriesLoading],
  );

  const { totalQuestionsAnswered, overallAccuracy, subcategoriesCovered } = useMemo(
    () => getProgressDashboardSummary(detailedProgress),
    [detailedProgress],
  );

  // Overhaul Phase E: the parallel AI-chat onboarding (/onboarding) is retired.
  // The one onboarding path is signup → Home first-steps → coach; new users who
  // visit Progress just see their (empty) progress page.

  if (loading || subcategoriesLoading) {
    return (
      <div className="ut-page ut-page--wide" role="status" aria-label="Loading progress">
        <div className="ut-skeleton ut-skeleton--text" style={{ width: 110, marginBottom: 12 }} />
        <div className="ut-skeleton ut-skeleton--title" style={{ width: 220, marginBottom: 26 }} />
        <div className="ut-grid ut-grid--4" style={{ marginBottom: 22 }}>
          <div className="ut-skeleton ut-skeleton--stat" />
          <div className="ut-skeleton ut-skeleton--stat" />
          <div className="ut-skeleton ut-skeleton--stat" />
          <div className="ut-skeleton ut-skeleton--stat" />
        </div>
        <div className="ut-skeleton-stack">
          <div className="ut-skeleton ut-skeleton--card" />
          <div className="ut-skeleton ut-skeleton--card" />
        </div>
      </div>
    );
  }

  const totalSkills = allSubcategories?.length || 0;
  const countSkills = (categories) => Object.values(categories || {}).reduce(
    (sum, category) => sum + (category.subcategories?.length || 0),
    0,
  );
  const rwSkillCount = countSkills(categorizedSubcategories['reading-writing'].categories);
  const mathSkillCount = countSkills(categorizedSubcategories.math.categories);
  const hasSkillRows = rwSkillCount + mathSkillCount > 0;
  const hasPracticeData = totalQuestionsAnswered > 0;
  const satReady = Boolean(satScoreEstimate && satScoreEstimate.subcategoriesWithData > 0);

  return (
    <div className="ut-page ut-page--wide">
      <header className="ut-page-head">
        <div className="ut-page-head-main">
          <p className="ut-eyebrow">Analytics</p>
          <h1 className="ut-page-title">Progress</h1>
          <p className="ut-page-sub">Skill-by-skill mastery from your real practice.</p>
        </div>
        <div className="ut-page-head-actions">
          <button
            type="button"
            className="ut-btn ut-btn--ghost ut-btn--sm"
            onClick={handleShowHelp}
            title="Learn how to use performance tracking"
          >
            <FiInfo aria-hidden="true" /> How this works
          </button>
        </div>
      </header>

      <div className="ut-grid ut-grid--4 pg-summary" aria-label="Progress summary">
        <div className="ut-panel-ink pg-sat-panel">
          <div className="ut-stat">
            <span className="ut-stat-value">
              {satReady ? satScoreEstimate.estimatedScore : '—'}
              <small> / 1600</small>
            </span>
            <span className="ut-stat-label">Est. SAT score</span>
          </div>
          {satReady ? (
            <p className="ut-label ut-label--on-ink pg-sat-note">
              RW {satScoreEstimate.breakdown?.readingWriting?.score || 400}
              {' · '}
              Math {satScoreEstimate.breakdown?.math?.score || 400}
              {' · '}
              {satScoreEstimate.confidence}% confidence
            </p>
          ) : (
            <p className="ut-label ut-label--on-ink pg-sat-note">
              Take a <Link to="/practice-exams" className="pg-sat-link">practice test</Link> to unlock
            </p>
          )}
        </div>
        <div className="ut-card">
          <div className="ut-stat">
            <span className="ut-stat-value">
              {overallAccuracy}
              <small>%</small>
            </span>
            <span className="ut-stat-label">Overall accuracy</span>
          </div>
        </div>
        <div className="ut-card">
          <div className="ut-stat">
            <span className="ut-stat-value">{totalQuestionsAnswered}</span>
            <span className="ut-stat-label">Questions answered</span>
          </div>
        </div>
        <div className="ut-card">
          <div className="ut-stat">
            <span className="ut-stat-value">
              {subcategoriesCovered}
              <small> / {totalSkills}</small>
            </span>
            <span className="ut-stat-label">Skills practiced</span>
          </div>
        </div>
      </div>

      {!hasPracticeData && (
        <div className="ut-empty pg-empty">
          <b>No practice yet</b>
          Answer a few questions and every skill below starts tracking coverage and accuracy.
          <div className="pg-empty-actions">
            <Link to="/subject-quizzes" className="ut-btn ut-btn--primary">
              Open the Question Bank
            </Link>
          </div>
        </div>
      )}

      {hasSkillRows && (
        <>
          <SubcategoryProgressSection
            title="Reading & Writing"
            Icon={FiBookOpen}
            categories={categorizedSubcategories['reading-writing'].categories}
            detailedProgress={detailedProgress}
            conceptsBySubcategory={conceptsBySubcategory}
            userConceptMastery={userConceptMastery}
            onOpenSubcategory={(subcategoryId) => navigate(`/subcategory-progress/${subcategoryId}`)}
            onStartPractice={handleStartPractice}
            onLearn={handleLearnClick}
            onPracticeConcept={(conceptId) => navigate(`/concept/${conceptId}`)}
            isFreeTier={userMembership?.tier === 'free'}
          />
          <SubcategoryProgressSection
            title="Math"
            Icon={FaCalculator}
            categories={categorizedSubcategories.math.categories}
            detailedProgress={detailedProgress}
            conceptsBySubcategory={conceptsBySubcategory}
            userConceptMastery={userConceptMastery}
            onOpenSubcategory={(subcategoryId) => navigate(`/subcategory-progress/${subcategoryId}`)}
            onStartPractice={handleStartPractice}
            onLearn={handleLearnClick}
            onPracticeConcept={(conceptId) => navigate(`/concept/${conceptId}`)}
            isFreeTier={userMembership?.tier === 'free'}
          />
        </>
      )}

      <section className="ut-card ut-card--soft pg-path" aria-label="Your learning path">
        <span className="ut-tile">
          <FaRocket aria-hidden="true" />
        </span>
        <div className="pg-path-main">
          <h3 className="ut-card-title">Your learning path</h3>
          <p className="ut-card-sub">
            Our adaptive system flags the concepts you miss and builds a personalized review
            queue. Complete SmartQuizzes to get concept recommendations.
          </p>
        </div>
        {unmasteredCount > 0 && (
          <span
            className="ut-chip ut-chip--accent"
            title={`${unmasteredCount} concept${unmasteredCount !== 1 ? 's' : ''} need practice`}
          >
            {unmasteredCount} concept{unmasteredCount !== 1 ? 's' : ''} to review
          </span>
        )}
      </section>

      {showToast && (
        <div
          className={`pg-toast ${toastMessage.includes('Error') ? 'pg-toast--error' : ''}`}
          role="status"
        >
          <span>{toastMessage}</span>
          <button
            type="button"
            className="pg-toast-close"
            onClick={() => setShowToast(false)}
            aria-label="Dismiss notification"
          >
            ×
          </button>
        </div>
      )}

      <FeatureHelpModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
        feature="progress"
      />

      <ProUpgradeModal
        isOpen={showLearnUpgradeModal}
        onClose={() => setShowLearnUpgradeModal(false)}
        featureName="The lesson library"
        description="In-depth lessons for every SAT skill — walkthroughs, worked examples, and the strategy behind each answer."
      />
    </div>
  );
}

export default ProgressDashboard;
