import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSubcategories } from '../contexts/SubcategoryContext';
import { getSubcategoryIdFromString, SUBCATEGORY_KEBAB_CASE } from '../utils/subcategoryConstants';
import { getConceptsBySubcategory } from '../firebase/conceptServices'; 
import { getUserSubcategoryAttemptHistory } from '../firebase/subcategoryServices'; 
import { db } from '../firebase/config'; 
import { doc, getDoc } from 'firebase/firestore'; 
import { getFeatureFlags } from '../firebase/config.featureFlags'; 
import { Bar } from 'react-chartjs-2'; 
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import '../styles/SubcategoryProgress.css'; // Import the new CSS
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBrain, faChartLine, faListCheck, faLightbulb, faSpinner, faChevronRight, faGraduationCap, faBullseye, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
); 

const CustomProgressBar = ({ current, total, label, showValues = true }) => {
  const percentage = total > 0 ? Math.min((current / total) * 100, 100) : 0;
  let barColorClass = 'progress-bar-poor';
  if (percentage >= 75) barColorClass = 'progress-bar-good';
  else if (percentage >= 40) barColorClass = 'progress-bar-average';

  return (
    <div className="mb-2 mt-3">
      {label && <p className="text-sm font-semibold text-gray-700 mb-1">{label}</p>}
      <div className="progress-bar-container bg-gray-200/60">
        <div 
          className={`progress-bar ${barColorClass}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      {showValues && <p className="text-xs text-gray-600 mt-1 text-right">{current} of {total} Questions</p>}
    </div>
  );
};

const SubcategoryProgressPage = () => {
  const { subcategoryId: subcategoryIdFromParams } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { getSubcategoryNameById, allSubcategories, loading: subcategoriesLoading } = useSubcategories();

  const [subcategoryName, setSubcategoryName] = useState('');
  const [progressData, setProgressData] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // General loading for page data
  const [featureFlags, setFeatureFlags] = useState(null); 
  const [isLoadingFeatureFlags, setIsLoadingFeatureFlags] = useState(true); // Specific loading for feature flags
  const [relatedConcepts, setRelatedConcepts] = useState([]);
  const [accuracyTrendData, setAccuracyTrendData] = useState(null);

  const normalizedSubcategoryId = useMemo(() => {
    if (subcategoriesLoading || !allSubcategories || allSubcategories.length === 0) return subcategoryIdFromParams;
    const foundKebab = Object.keys(SUBCATEGORY_KEBAB_CASE).find(key => 
        SUBCATEGORY_KEBAB_CASE[key] === subcategoryIdFromParams || key.toLowerCase() === subcategoryIdFromParams.toLowerCase()
    );
    return foundKebab ? SUBCATEGORY_KEBAB_CASE[foundKebab] || foundKebab : subcategoryIdFromParams;
  }, [subcategoryIdFromParams, allSubcategories, subcategoriesLoading]);

  useEffect(() => {
    const loadFeatureFlags = async () => {
      setIsLoadingFeatureFlags(true);
      try {
        console.log('[SubcategoryProgressPage] Attempting to load feature flags using getFeatureFlags...');
        const flags = await getFeatureFlags(); // Use the centralized function
        console.log('[SubcategoryProgressPage] Feature flags loaded via getFeatureFlags:', flags);
        setFeatureFlags(flags);
      } catch (error) {
        console.error('[SubcategoryProgressPage] Error loading feature flags via getFeatureFlags:', error);
        // getFeatureFlags already returns defaults on error, but we can still set local state to an empty object or defaults again if preferred.
        // For now, we trust getFeatureFlags to provide a usable (default) object.
        setFeatureFlags({}); // Ensure it's an object
      }
      setIsLoadingFeatureFlags(false);
    };
    loadFeatureFlags();
  }, []);

  useEffect(() => {
    if (!currentUser || subcategoriesLoading || !normalizedSubcategoryId || !allSubcategories || allSubcategories.length === 0) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const name = getSubcategoryNameById(normalizedSubcategoryId) || normalizedSubcategoryId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        setSubcategoryName(name);

        const userProgressRef = doc(db, 'users', currentUser.uid, 'progress', normalizedSubcategoryId);
        const progressSnap = await getDoc(userProgressRef);

        if (progressSnap.exists()) {
          const data = progressSnap.data();
          setProgressData({
            level: data.level || 1,
            questionsAttemptedInLevel: data.questionsAttemptedInLevel || 0,
            questionsToNextLevel: data.questionsToNextLevel || 10, // Default to 10 questions per level
            accuracyLast10: data.accuracy !== undefined ? data.accuracy : 0, // This is often recent accuracy (e.g. last 10)
            totalQuestionsAnswered: data.totalQuestions || 0,
            totalCorrect: data.correctTotal || 0,
          });
        } else {
          setProgressData({
            level: 1,
            questionsAttemptedInLevel: 0,
            questionsToNextLevel: 10,
            accuracyLast10: 0,
            totalQuestionsAnswered: 0,
            totalCorrect: 0,
          });
        }

        const concepts = await getConceptsBySubcategory(normalizedSubcategoryId);
        setRelatedConcepts(concepts);

        const history = await getUserSubcategoryAttemptHistory(currentUser.uid, normalizedSubcategoryId);
        if (history && history.length > 0) {
          const labels = history.map((_, index) => `Attempt ${index + 1}`);
          const dataPoints = history.map(entry => entry.accuracy);
          const colorPalette = [
            'rgba(75, 192, 192, 0.7)', 'rgba(255, 159, 64, 0.7)', 'rgba(153, 102, 255, 0.7)',
            'rgba(255, 99, 132, 0.7)', 'rgba(54, 162, 235, 0.7)', 'rgba(255, 206, 86, 0.7)',
            'rgba(100, 220, 100, 0.7)', 'rgba(233, 30, 99, 0.7)'
          ];
          const barColors = dataPoints.map((_, i) => colorPalette[i % colorPalette.length]);
          const borderColors = barColors.map(color => color.replace('0.7', '1'));

          setAccuracyTrendData({
            labels,
            datasets: [{
              label: 'Accuracy Per Quiz',
              data: dataPoints,
              backgroundColor: barColors,
              borderColor: borderColors,
              borderWidth: 1.5,
              borderRadius: 6,
              barPercentage: 0.6,
              categoryPercentage: 0.7,
            }],
          });
        } else {
          setAccuracyTrendData(null);
        }
      } catch (error) {
        console.error("[SubcategoryProgressPage] Error fetching subcategory data:", error);
        setAccuracyTrendData(null); // Ensure chart data is cleared on error
        setProgressData(null); // Clear progress data on error too
      }
      setIsLoading(false);
    };

    fetchData();
  }, [currentUser, normalizedSubcategoryId, getSubcategoryNameById, subcategoriesLoading, allSubcategories]);

  const handlePractice = () => {
    console.log('[SubcategoryProgressPage] handlePractice initiated.');
    console.log('[SubcategoryProgressPage] isLoadingFeatureFlags:', isLoadingFeatureFlags);
    console.log('[SubcategoryProgressPage] Feature Flags:', featureFlags);

    if (isLoadingFeatureFlags) {
      alert("Configuration is still loading. Please try again in a moment.");
      console.warn('[SubcategoryProgressPage] Attempted to practice while feature flags are loading.');
      return;
    }

    if (!featureFlags || typeof featureFlags.smartQuizEnabled === 'undefined') {
      alert("Configuration is still loading or the necessary settings (smartQuizEnabled) are missing. Please try again in a moment.");
      console.warn('[SubcategoryProgressPage] Feature flags not fully loaded or smartQuizEnabled is missing. Navigation aborted.', featureFlags);
      return;
    }

    console.log('[SubcategoryProgressPage] Normalized Subcategory ID:', normalizedSubcategoryId);
    console.log('[SubcategoryProgressPage] Progress Data:', progressData);

    const accuracyRate = progressData ? (progressData.accuracyLast10 || 0) : 0;
    const totalAttempted = progressData ? (progressData.totalQuestionsAnswered || 0) : 0;
    console.log(`[SubcategoryProgressPage] Calculated accuracyRate: ${accuracyRate}, totalAttempted: ${totalAttempted}`);

    const destination = featureFlags.smartQuizEnabled ? '/smart-quiz-generator' : '/adaptive-quiz-generator';
    console.log('[SubcategoryProgressPage] Destination URL:', destination);

    const state = featureFlags.smartQuizEnabled 
      ? { subcategoryId: normalizedSubcategoryId, accuracyRate }
      : { subcategoryId: normalizedSubcategoryId, autoDifficultyParams: { accuracyRate, totalAttempted } };
    
    console.log('[SubcategoryProgressPage] State for navigation:', state);
    
    navigate(destination, { state });
  };

  const handleLearn = () => navigate(`/concept/${normalizedSubcategoryId}`);

  if (isLoading || subcategoriesLoading || !featureFlags) {
    return (
      <div className="subcategory-page flex flex-col items-center justify-center p-4 min-h-screen">
        <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-purple-500" />
        <span className="ml-3 mt-4 text-xl text-gray-600">Loading Progress Details...</span>
      </div>
    );
  }

  if (!progressData) {
    return (
      <div className="subcategory-page flex flex-col items-center justify-center p-4 min-h-screen">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Oops!</h2>
        <p className="text-gray-600 text-center mb-6">We couldn't load the progress data for {subcategoryName || 'this subcategory'}.<br/>This might be due to a temporary issue or if no progress has been recorded yet.</p>
        <button 
          onClick={() => navigate('/my-progress')}
          className="action-button bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold py-2 px-5 rounded-lg shadow-md flex items-center"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" /> Back to My Progress
        </button>
      </div>
    );
  }
  
  const overallAccuracy = progressData.totalQuestionsAnswered > 0 
    ? ((progressData.totalCorrect / progressData.totalQuestionsAnswered) * 100)
    : 0;
  
  const getAccuracyColorClass = (acc) => {
    if (acc >= 75) return 'text-green-400';
    if (acc >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="subcategory-page p-0 md:p-4 lg:p-6">
      {/* Smaller Header Section */}
      <div className="page-header-compact mb-6 md:mb-8 md:rounded-xl">
        <button 
          onClick={() => navigate('/my-progress')}
          className="absolute top-2 left-3 text-gray-600 hover:text-gray-800 transition-colors z-10 bg-white/60 hover:bg-white/80 p-2 rounded-full shadow-sm"
          aria-label="Back to My Progress"
        >
          <FontAwesomeIcon icon={faArrowLeft} size="sm"/>
        </button>
        <div className="flex flex-col items-center justify-center text-center pt-2">
          <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-2 drop-shadow-sm">{subcategoryName}</h1>
          <div className="level-badge-centered px-4 py-2 rounded-full text-sm font-semibold mb-3">
            <FontAwesomeIcon icon={faGraduationCap} className="mr-2" /> Level {progressData.level}
          </div>
          <div className="w-full max-w-md">
            <CustomProgressBar 
              current={progressData.questionsAttemptedInLevel}
              total={progressData.questionsToNextLevel}
              showValues={false}
            />
          </div>
        </div>
      </div>

      {/* Main Content Grid - Reorganized Layout */}
      <div className="content-grid px-2 md:px-0">
        {/* Top Row: Redesigned Performance Snapshot and Accuracy Trend */}
        <div className="top-row-grid">
          {/* Performance Snapshot Card with new layout */}
          <div className="performance-snapshot-card stat-card"> 
            {/* Title and Icon at the top */}
            <div className="snapshot-header">
              <h2 className="snapshot-title">
                <FontAwesomeIcon icon={faBullseye} className="snapshot-icon" /> 
                Performance Snapshot
              </h2>
            </div>
            
            {/* Accuracy Stats Side by Side */}
            <div className="accuracy-stats-container">
              <div className="accuracy-stat recent-accuracy">
                <h3 className="accuracy-label">Recent Accuracy</h3>
                <p className={`accuracy-value ${getAccuracyColorClass(progressData.accuracyLast10)}`}>
                  {progressData.accuracyLast10.toFixed(0)}%
                </p>
                <p className="accuracy-subtitle">(Last quiz/set)</p>
              </div>
              <div className="accuracy-stat overall-accuracy">
                <h3 className="accuracy-label">Overall Accuracy</h3>
                <p className={`accuracy-value ${getAccuracyColorClass(overallAccuracy)}`}>
                  {overallAccuracy.toFixed(1)}%
                </p>
                <p className="accuracy-subtitle">({progressData.totalCorrect} of {progressData.totalQuestionsAnswered} correct)</p>
              </div>
            </div>
            
            {/* Buttons at the bottom */}
            <div className="snapshot-actions">
              <button 
                onClick={handlePractice}
                disabled={isLoadingFeatureFlags || !featureFlags || typeof featureFlags.smartQuizEnabled === 'undefined'}
                className={`snapshot-button practice-button ${isLoadingFeatureFlags || !featureFlags || typeof featureFlags.smartQuizEnabled === 'undefined' ? 'disabled' : ''}`}
              >
                <FontAwesomeIcon icon={faBrain} className="button-icon" /> 
                {isLoadingFeatureFlags ? 'Loading...' : 'Practice Now'}
              </button>
              <button 
                onClick={handleLearn}
                disabled={relatedConcepts.length === 0}
                className={`snapshot-button learn-button ${relatedConcepts.length === 0 ? 'disabled' : ''}`}
              >
                <FontAwesomeIcon icon={faLightbulb} className="button-icon" /> Learn Concepts
              </button>
            </div>
          </div>

          {/* Accuracy Trend Card - Moved to top row */}
          <div className="chart-card stat-card p-5 md:p-6">
            {accuracyTrendData && accuracyTrendData.datasets[0].data.length > 0 ? (
              <>
                <div className="stat-card-header pb-3 mb-4">
                  <h2 className="text-xl font-semibold text-gray-700 flex items-center">
                    <FontAwesomeIcon icon={faChartLine} className="mr-3 text-green-500" /> Accuracy Trend
                  </h2>
                </div>
                <div className="chart-wrapper">
                  <div className="chart-container">
                    <Bar 
                      data={accuracyTrendData} 
                      options={{
                        maintainAspectRatio: false,
                        responsive: true,
                        scales: {
                          y: {
                            beginAtZero: true, max: 100,
                            title: { display: true, text: 'Accuracy (%)', font: { weight: '500', size: 12 }, color: '#4b5563' },
                            ticks: { callback: (value) => `${value}%`, color: '#6b7280', font: {size: 10} },
                            grid: { color: 'rgba(200, 200, 200, 0.15)' }
                          },
                          x: {
                            title: { display: true, text: 'Quiz Attempts', font: { weight: '500', size: 12 }, color: '#4b5563' },
                            ticks: { color: '#6b7280', font: {size: 10} },
                            grid: { display: false }
                          }
                        },
                        plugins: {
                          legend: { display: false },
                          tooltip: {
                            enabled: true,
                            backgroundColor: 'rgba(0,0,0,0.75)',
                            titleColor: '#fff',
                            bodyColor: '#fff',
                            titleFont: { size: 13, weight: 'bold' },
                            bodyFont: { size: 12 },
                            padding: 10,
                            cornerRadius: 6,
                            displayColors: false,
                            callbacks: { label: (context) => `Accuracy: ${context.raw.toFixed(1)}%` }
                          }
                        },
                        animation: {
                            duration: 800,
                            easing: 'easeInOutQuart'
                        }
                      }} 
                    />
                  </div>
                </div>
              </>
            ) : (
               <div className="text-center flex flex-col justify-center items-center h-full">
                  <FontAwesomeIcon icon={faChartLine} size="2x" className="text-gray-300 mb-3" />
                  <h3 className="text-lg font-medium text-gray-600 mb-1">Accuracy Trend</h3>
                  <p className="text-gray-500 text-sm">Complete a few quizzes in this subcategory to see your accuracy trend over time!</p>
               </div>
            )}
          </div>
        </div>
        
        {/* Bottom Row: Related Concepts Card */}
        <div className="stat-card p-5 md:p-6 h-full"> 
          <div className="stat-card-header pb-3 mb-4">
            <h2 className="text-xl font-semibold text-gray-700 flex items-center">
              <FontAwesomeIcon icon={faListCheck} className="mr-3 text-sky-500" /> Related Concepts
            </h2>
          </div>
          {relatedConcepts.length > 0 ? (
            <ul className="space-y-2">
              {relatedConcepts.map(concept => (
                <li 
                  key={concept.id} 
                  className="concept-item p-3 rounded-md bg-gray-50 hover:bg-sky-50 text-gray-700 hover:text-sky-700 flex justify-between items-center shadow-sm hover:shadow-md transition-all duration-200 border-l-4 border-transparent hover:border-sky-500"
                  onClick={() => navigate(`/concept/${normalizedSubcategoryId}/${concept.id}`)} 
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => e.key === 'Enter' && navigate(`/concept/${normalizedSubcategoryId}/${concept.id}`)}
                >
                  <span className="font-medium">{concept.name}</span>
                  <FontAwesomeIcon icon={faChevronRight} className="text-gray-400 group-hover:text-sky-600" />
                </li>
              ))} 
            </ul>
          ) : (
            <div className="text-center text-gray-500 py-6">
              <FontAwesomeIcon icon={faLightbulb} size="2x" className="text-gray-300 mb-3" />
              <p className="italic text-sm">No specific concepts listed for this subcategory yet. Check back later or explore other resources!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubcategoryProgressPage;
