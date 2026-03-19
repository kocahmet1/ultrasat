import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import {
  FaBookOpen,
  FaCalculator,
  FaGraduationCap,
  FaInfoCircle,
  FaRocket,
} from 'react-icons/fa';
import LearnUpgradeModal from '../components/LearnUpgradeModal';
import FeatureHelpModal from '../components/FeatureHelpModal';
import SubcategoryProgressSection from '../components/progress/SubcategoryProgressSection';
import { useAuth } from '../contexts/AuthContext';
import { useAICompanion } from '../contexts/AICompanionContext';
import { useSubcategories } from '../contexts/SubcategoryContext';
import {
  getConceptsForSubcategories,
  getDetailedProgressForSubcategories,
  getUserConceptMastery,
} from '../firebase/progressDashboardServices';
import {
  buildCategorizedSubcategories,
  calculateSATScoreFromDetailedProgress,
  getProgressDashboardSummary,
} from '../utils/progressDashboardUtils';
import { calculateEstimatedSATScore } from '../utils/progressUtils';
import '../styles/ProgressDashboard.new.css';
import '../styles/ConceptMastery.css';
import '../styles/LevelIndicator.css';

function ProgressDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, userMembership } = useAuth();
  const { isFirstTimeUser } = useAICompanion();
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
  const [isSatCardExpanded, setIsSatCardExpanded] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [noticeClosed, setNoticeClosed] = useState(false);
  const [showLearnUpgradeModal, setShowLearnUpgradeModal] = useState(false);
  const satCardHoverTimeoutRef = useRef(null);

  const clearSatCardHoverTimeout = () => {
    if (satCardHoverTimeoutRef.current) {
      clearTimeout(satCardHoverTimeoutRef.current);
      satCardHoverTimeoutRef.current = null;
    }
  };

  const handleSatCardMouseEnter = () => {
    clearSatCardHoverTimeout();
    satCardHoverTimeoutRef.current = setTimeout(() => {
      setIsSatCardExpanded(true);
    }, 1000);
  };

  const handleSatCardMouseLeave = () => {
    clearSatCardHoverTimeout();
    setIsSatCardExpanded(false);
  };

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

    navigate(`/lessons/${subcategoryId}`);
  };

  useEffect(() => () => clearSatCardHoverTimeout(), []);

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

        try {
          const scoreEstimate = await calculateEstimatedSATScore(currentUser.uid);
          if (cancelled) {
            return;
          }

          if (scoreEstimate.subcategoriesWithData === 0) {
            const fallbackEstimate = calculateSATScoreFromDetailedProgress(nextDetailedProgress);
            setSatScoreEstimate(
              fallbackEstimate.subcategoriesWithData > 0 ? fallbackEstimate : scoreEstimate,
            );
          } else {
            setSatScoreEstimate(scoreEstimate);
          }
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

  if (isFirstTimeUser === true) {
    return <Navigate to="/onboarding" replace />;
  }

  if (loading || subcategoriesLoading) {
    return <div className="pd-loading-placeholder">Loading your progress dashboard...</div>;
  }

  return (
    <div className="progress-dashboard-page">
      <div className="pd-header">
        <h1>
          Your Performance Progress
          <button
            className="help-icon-button"
            onClick={handleShowHelp}
            title="Learn how to use performance tracking"
            type="button"
          >
            <FaInfoCircle />
          </button>
        </h1>
      </div>

      {satScoreEstimate && (
        <div
          className={`pd-card sat-score-estimate-card ${isSatCardExpanded ? 'expanded' : 'collapsed'}`}
          onMouseEnter={handleSatCardMouseEnter}
          onMouseLeave={handleSatCardMouseLeave}
        >
          <div className="sat-score-header">
            <div className="sat-score-title">
              <FaGraduationCap className="sat-icon" />
              <h2>Estimated Digital SAT Score</h2>
            </div>
            <div className="confidence-badge">{satScoreEstimate.confidence}% confidence</div>
          </div>

          <div className="sat-score-collapsed-view">
            <span className="collapsed-title">Estimated Digital SAT Score</span>
            <span className="collapsed-score">
              {satScoreEstimate.subcategoriesWithData > 0 ? satScoreEstimate.estimatedScore : '---'}
              <span className="collapsed-max">/1600</span>
            </span>
            {satScoreEstimate.subcategoriesWithData > 0 && (
              <span className="collapsed-notice">
                (Based on {satScoreEstimate.subcategoriesWithData} subcategories with practice data)
              </span>
            )}
            <span className="collapsed-confidence">{satScoreEstimate.confidence}% confidence</span>
          </div>

          {!satScoreEstimate.subcategoriesWithData && !noticeClosed && (
            <div className="sat-score-horizontal-notice always-visible">
              <button
                className="sat-notice-close-btn"
                onClick={() => setNoticeClosed(true)}
                title="Close"
                type="button"
              >
                x
              </button>
              Complete an{' '}
              <Link to="/practice-exams" className="notice-link">
                SAT Practice test
              </Link>{' '}
              or a{' '}
              <Link to="/practice-exams" className="notice-link">
                Predictive Test
              </Link>{' '}
              to see your estimated digital SAT score below
            </div>
          )}

          <div className="sat-score-display">
            <div className="score-value">
              {satScoreEstimate.subcategoriesWithData > 0 ? satScoreEstimate.estimatedScore : '---'}
            </div>
            <div className="score-max">/ 1600</div>
          </div>

          <div className="sat-progress-bar">
            <div
              className="sat-progress-fill"
              style={{
                width: satScoreEstimate.subcategoriesWithData > 0
                  ? `${((satScoreEstimate.estimatedScore - 400) / 1200) * 100}%`
                  : '0%',
                backgroundColor: satScoreEstimate.estimatedScore >= 1200
                  ? '#34A853'
                  : satScoreEstimate.estimatedScore >= 1000
                    ? '#FBBC05'
                    : '#EA4335',
              }}
            ></div>
          </div>

          <div className="sat-breakdown">
            <div className="section-score">
              <span className="section-name">Reading & Writing:</span>
              <span className="section-value">
                {satScoreEstimate.breakdown?.readingWriting?.score || 400}
              </span>
            </div>
            <div className="section-score">
              <span className="section-name">Math:</span>
              <span className="section-value">{satScoreEstimate.breakdown?.math?.score || 400}</span>
            </div>
          </div>

          <div className="sat-stats-integrated">
            <div className="sat-stat-item">
              <div className="sat-stat-value">{totalQuestionsAnswered}</div>
              <div className="sat-stat-label">Total Questions Answered</div>
            </div>
            <div className="sat-stat-item">
              <div className="sat-stat-value">{overallAccuracy}%</div>
              <div className="sat-stat-label">Overall Accuracy</div>
            </div>
            <div className="sat-stat-item">
              <div className="sat-stat-value">
                {subcategoriesCovered} / {allSubcategories?.length || 0}
              </div>
              <div className="sat-stat-label">Subcategories Covered</div>
            </div>
          </div>

          <div className="sat-footer">
            <small>
              {satScoreEstimate.subcategoriesWithData > 0
                ? `Based on ${satScoreEstimate.subcategoriesWithData} subcategories with practice data`
                : 'Complete some practice questions to see your estimated SAT score!'}
            </small>
          </div>
        </div>
      )}

      <p className="pd-page-subtitle">Track your development and identify areas for improvement.</p>

      <div className="pd-split-view">
        <SubcategoryProgressSection
          title="Reading & Writing"
          Icon={FaBookOpen}
          buttonClassName="rw-subcategory-btn"
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
          buttonClassName="math-subcategory-btn"
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
      </div>

      <div className="pd-card pd-practice-hub">
        <h3>
          <FaRocket /> Your Learning Path
          {unmasteredCount > 0 && (
            <span
              className="unmastered-badge"
              title={`${unmasteredCount} concept${unmasteredCount !== 1 ? 's' : ''} need practice`}
            >
              {unmasteredCount}
            </span>
          )}
        </h3>
        <div className="unified-track-info">
          <p>
            <FaGraduationCap className="info-icon" /> Our adaptive learning system identifies concepts
            you need to improve and creates a personalized learning path for you. Complete
            SmartQuizzes to get concept recommendations.
          </p>
        </div>
        <div className="actions"></div>
      </div>

      {showToast && (
        <div className={`toast-notification ${toastMessage.includes('Error') ? 'error' : 'success'}`}>
          <div className="toast-content">
            <span>{toastMessage}</span>
            <button className="toast-close" onClick={() => setShowToast(false)} type="button">
              x
            </button>
          </div>
        </div>
      )}

      <FeatureHelpModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
        feature="progress"
      />

      <LearnUpgradeModal
        isOpen={showLearnUpgradeModal}
        onClose={() => setShowLearnUpgradeModal(false)}
      />
    </div>
  );
}

export default ProgressDashboard;
