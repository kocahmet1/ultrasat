import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import QuizAuthModal from '../components/QuizAuthModal';
import '../styles/ScoreCalculator.css';
import collegeScorecard from '../api/collegeScorecard';

function ScoreCalculator() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [quizAuthOpen, setQuizAuthOpen] = useState(false);
  const [quizPath, setQuizPath] = useState('');
  const [quizLabel, setQuizLabel] = useState('');
  const [quizState, setQuizState] = useState(null);

  const handleStartPractice = (e) => {
    e.preventDefault();
    const navObj = { pathname: '/smart-quiz-generator', state: {} };
    if (currentUser) {
      navigate(navObj.pathname, { state: navObj.state });
    } else {
      setQuizPath('/smart-quiz-generator');
      setQuizLabel('Practice Test');
      setQuizState(navObj);
      setQuizAuthOpen(true);
    }
  };

  const [mathScore, setMathScore] = useState(500);
  const [readingWritingScore, setReadingWritingScore] = useState(500);
  const [totalScore, setTotalScore] = useState(1000);
  const [percentile, setPercentile] = useState(50);
  
  // College finder states
  const [colleges, setColleges] = useState([]);
  const [isLoadingColleges, setIsLoadingColleges] = useState(false);
  const [filters, setFilters] = useState({
    state: '',
    schoolSize: '',
    schoolType: '',
    maxAdmissionRate: ''
  });

  // Updated percentile map for Digital SAT (2024+)
  const percentileMap = {
    1600: 99, 1590: 99, 1580: 99, 1570: 99, 1560: 99, 1550: 99, 1540: 99, 1530: 99, 1520: 99, 1510: 99,
    1500: 99, 1490: 98, 1480: 98, 1470: 97, 1460: 97, 1450: 96, 1440: 96, 1430: 95, 1420: 95, 1410: 94,
    1400: 94, 1390: 93, 1380: 92, 1370: 91, 1360: 90, 1350: 89, 1340: 88, 1330: 87, 1320: 86, 1310: 85,
    1300: 87, 1290: 84, 1280: 83, 1270: 82, 1260: 81, 1250: 80, 1240: 78, 1230: 77, 1220: 76, 1210: 75,
    1200: 75, 1190: 73, 1180: 72, 1170: 71, 1160: 69, 1150: 68, 1140: 67, 1130: 65, 1120: 64, 1110: 63,
    1100: 61, 1090: 60, 1080: 58, 1070: 57, 1060: 55, 1050: 54, 1040: 52, 1030: 51, 1020: 49, 1010: 48,
    1000: 46, 990: 45, 980: 43, 970: 42, 960: 40, 950: 39, 940: 37, 930: 36, 920: 34, 910: 33,
    900: 31, 890: 30, 880: 28, 870: 27, 860: 25, 850: 24, 840: 22, 830: 21, 820: 19, 810: 18,
    800: 16, 790: 15, 780: 13, 770: 12, 760: 10, 750: 9, 740: 7, 730: 6, 720: 4, 710: 3,
    700: 2, 690: 1, 680: 1, 670: 1, 660: 1, 650: 1, 640: 1, 630: 1, 620: 1, 610: 1,
    600: 1, 590: 1, 580: 1, 570: 1, 560: 1, 550: 1, 540: 1, 530: 1, 520: 1, 510: 1,
    500: 1, 490: 1, 480: 1, 470: 1, 460: 1, 450: 1, 440: 1, 430: 1, 420: 1, 410: 1, 400: 1
  };

  const getCollegeAdmissionInfo = (score) => {
    if (score >= 1500) return { level: 'Elite', color: '#059669', description: 'Ivy League and top-tier universities' };
    if (score >= 1400) return { level: 'Highly Competitive', color: '#2563eb', description: 'Top state schools and competitive private colleges' };
    if (score >= 1300) return { level: 'Competitive', color: '#7c3aed', description: 'Good state schools and many private colleges' };
    if (score >= 1200) return { level: 'Moderately Competitive', color: '#ea580c', description: 'State schools and regional universities' };
    if (score >= 1000) return { level: 'Less Competitive', color: '#dc2626', description: 'Community colleges and less selective institutions' };
    return { level: 'Below Average', color: '#6b7280', description: 'May need additional preparation' };
  };

  useEffect(() => {
    const total = mathScore + readingWritingScore;
    setTotalScore(Math.min(1600, Math.max(400, total)));
    
    // Find closest percentile
    const closest = Object.keys(percentileMap).reduce((prev, curr) => 
      Math.abs(parseInt(curr) - total) < Math.abs(parseInt(prev) - total) ? curr : prev
    );
    setPercentile(percentileMap[closest] || 1);
  }, [mathScore, readingWritingScore]);

  // Fetch college recommendations when score or filters change
  useEffect(() => {
    const fetchColleges = async () => {
      if (totalScore < 400) return;
      
      setIsLoadingColleges(true);
      try {
        const apiFilters = {
          satScore: totalScore,
          ...filters,
          // Convert UI filters to API format
          minSize: filters.schoolSize === 'small' ? 0 : filters.schoolSize === 'medium' ? 2000 : filters.schoolSize === 'large' ? 10000 : undefined,
          maxSize: filters.schoolSize === 'small' ? 2000 : filters.schoolSize === 'medium' ? 10000 : undefined,
          maxAdmissionRate: filters.maxAdmissionRate ? parseFloat(filters.maxAdmissionRate) : undefined
        };
        
        const recommendations = await collegeScorecard.getCollegeRecommendations(totalScore, apiFilters);
        setColleges(recommendations.slice(0, 20)); // Limit to top 20 results
      } catch (error) {
        console.error('Error fetching colleges:', error);
        setColleges([]);
      } finally {
        setIsLoadingColleges(false);
      }
    };

    const timeoutId = setTimeout(fetchColleges, 500); // Debounce API calls
    return () => clearTimeout(timeoutId);
  }, [totalScore, filters]);

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const getMatchColorClass = (matchLevel) => {
    switch (matchLevel) {
      case 'Safety': return 'match-safety';
      case 'Match': return 'match-good';
      case 'Reach': return 'match-reach';
      default: return 'match-unknown';
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (rate) => {
    if (!rate) return 'N/A';
    return `${Math.round(rate * 100)}%`;
  };

  const admissionInfo = getCollegeAdmissionInfo(totalScore);

  return (
    <div className="score-calculator-page">
      <div className="calculator-container">
        <h1>Digital SAT College Finder</h1>
        <p className="hero-subtitle">Calculate your Digital SAT score, see percentile rankings, and explore college admission prospects with the new 2024+ format.</p>
        
        <div className="digital-sat-info">
          <div className="info-badge">
            <span className="badge-icon">🔄</span>
            <div className="badge-text">
              <h4>New Digital SAT Format</h4>
              <p>Adaptive testing • Shorter format • Calculator allowed for all Math</p>
            </div>
          </div>
        </div>
        
        <div className="calculator-layout">
          <div className="input-section">
            <h2>Enter Your Scores</h2>
            
            <div className="score-input-group">
              <div className="score-input">
                <label htmlFor="math-score">Math Score</label>
                <div className="input-wrapper">
                  <input
                    type="range"
                    id="math-score"
                    min="200"
                    max="800"
                    value={mathScore}
                    onChange={(e) => setMathScore(parseInt(e.target.value))}
                    className="score-slider"
                  />
                  <input
                    type="number"
                    min="200"
                    max="800"
                    value={mathScore}
                    onChange={(e) => setMathScore(Math.max(200, Math.min(800, parseInt(e.target.value) || 200)))}
                    className="score-number"
                  />
                </div>
                <div className="score-range">200 - 800</div>
                <div className="score-description">Includes Algebra, Advanced Math, Problem-Solving, Geometry & Trigonometry</div>
              </div>

              <div className="score-input">
                <label htmlFor="reading-writing-score">Reading and Writing Score</label>
                <div className="input-wrapper">
                  <input
                    type="range"
                    id="reading-writing-score"
                    min="200"
                    max="800"
                    value={readingWritingScore}
                    onChange={(e) => setReadingWritingScore(parseInt(e.target.value))}
                    className="score-slider"
                  />
                  <input
                    type="number"
                    min="200"
                    max="800"
                    value={readingWritingScore}
                    onChange={(e) => setReadingWritingScore(Math.max(200, Math.min(800, parseInt(e.target.value) || 200)))}
                    className="score-number"
                  />
                </div>
                <div className="score-range">200 - 800</div>
                <div className="score-description">Combined section: Reading Comprehension, Vocabulary, Grammar & Writing Skills</div>
              </div>
            </div>
          </div>

          <div className="results-section">
            <div className="total-score-display">
              <h2>Your Digital SAT Score</h2>
              <div className="total-score">{totalScore}</div>
              <div className="percentile">
                <span className="percentile-label">Percentile:</span>
                <span className="percentile-value">{percentile}%</span>
              </div>
              <div className="score-breakdown">
                <div className="breakdown-item">
                  <span>Math:</span>
                  <span>{mathScore}</span>
                </div>
                <div className="breakdown-item">
                  <span>Reading & Writing:</span>
                  <span>{readingWritingScore}</span>
                </div>
              </div>
            </div>

            <div className="admission-level">
              <h3>College Admission Level</h3>
              <div 
                className="admission-badge"
                style={{ backgroundColor: admissionInfo.color }}
              >
                {admissionInfo.level}
              </div>
              <p className="admission-description">{admissionInfo.description}</p>
            </div>

            <div className="score-analysis">
              <h3>Score Analysis</h3>
              <div className="analysis-grid">
                <div className="analysis-item">
                  <span className="label">National Average:</span>
                  <span className="value">1050</span>
                </div>
                <div className="analysis-item">
                  <span className="label">Your Score:</span>
                  <span className="value">{totalScore}</span>
                </div>
                <div className="analysis-item">
                  <span className="label">Difference:</span>
                  <span className={`value ${totalScore >= 1050 ? 'positive' : 'negative'}`}>
                    {totalScore >= 1050 ? '+' : ''}{totalScore - 1050}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="digital-sat-features">
          <h2>Digital SAT Key Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Adaptive Testing</h3>
              <p>Module 2 difficulty adapts based on your Module 1 performance, providing a more accurate assessment of your abilities.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⏱️</div>
              <h3>Shorter Format</h3>
              <p>Just 2 hours 24 minutes total (including break) compared to 3+ hours for the old paper SAT.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🧮</div>
              <h3>Calculator Allowed</h3>
              <p>Use a calculator for ALL math questions, including the built-in Desmos graphing calculator.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📖</div>
              <h3>Shorter Passages</h3>
              <p>Reading passages are 25-150 words with just 1 question each, making them more manageable.</p>
            </div>
          </div>
        </section>

        <section className="college-finder">
          <h2>Find Your Perfect College Match</h2>
          <p>Based on your Digital SAT score of {totalScore}, discover personalized college recommendations with real admission data:</p>
          
          <div className="finder-filters">
            <h3>Refine Your Search</h3>
            <div className="filters-grid">
              <div className="filter-group">
                <label htmlFor="state-filter">State</label>
                <select 
                  id="state-filter"
                  value={filters.state}
                  onChange={(e) => handleFilterChange('state', e.target.value)}
                  className="filter-select"
                >
                  <option value="">Any State</option>
                  <option value="CA">California</option>
                  <option value="NY">New York</option>
                  <option value="TX">Texas</option>
                  <option value="FL">Florida</option>
                  <option value="IL">Illinois</option>
                  <option value="PA">Pennsylvania</option>
                  <option value="OH">Ohio</option>
                  <option value="GA">Georgia</option>
                  <option value="NC">North Carolina</option>
                  <option value="MI">Michigan</option>
                </select>
              </div>
              
              <div className="filter-group">
                <label htmlFor="size-filter">School Size</label>
                <select 
                  id="size-filter"
                  value={filters.schoolSize}
                  onChange={(e) => handleFilterChange('schoolSize', e.target.value)}
                  className="filter-select"
                >
                  <option value="">Any Size</option>
                  <option value="small">Small (&lt; 2,000)</option>
                  <option value="medium">Medium (2,000 - 10,000)</option>
                  <option value="large">Large (&gt; 10,000)</option>
                </select>
              </div>
              
              <div className="filter-group">
                <label htmlFor="admission-filter">Max Admission Rate</label>
                <select 
                  id="admission-filter"
                  value={filters.maxAdmissionRate}
                  onChange={(e) => handleFilterChange('maxAdmissionRate', e.target.value)}
                  className="filter-select"
                >
                  <option value="">Any Rate</option>
                  <option value="0.1">Very Selective (&lt; 10%)</option>
                  <option value="0.25">Highly Selective (&lt; 25%)</option>
                  <option value="0.5">Moderately Selective (&lt; 50%)</option>
                  <option value="0.75">Less Selective (&lt; 75%)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="college-results">
            {isLoadingColleges ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Finding your perfect college matches...</p>
              </div>
            ) : colleges.length > 0 ? (
              <>
                <div className="results-header">
                  <h3>Your College Matches ({colleges.length} found)</h3>
                  <div className="match-legend">
                    <span className="legend-item safety">🟢 Safety</span>
                    <span className="legend-item match">🟡 Match</span>
                    <span className="legend-item reach">🔴 Reach</span>
                  </div>
                </div>
                <div className="colleges-grid">
                  {colleges.map((college) => (
                    <div 
                      key={college.id} 
                      className={`college-card enhanced ${getMatchColorClass(college.matchLevel)}`}
                    >
                      <div className="college-header">
                        <h4>{college.name}</h4>
                        <span className={`match-badge ${college.matchLevel.toLowerCase()}`}>
                          {college.matchLevel}
                        </span>
                      </div>
                      
                      <div className="college-location">
                        📍 {college.city}, {college.state}
                      </div>
                      
                      <div className="college-stats">
                        <div className="stat-row">
                          <span className="stat-label">SAT Range:</span>
                          <span className="stat-value">
                            {college.satReading25 + college.satMath25} - {college.satReading75 + college.satMath75}
                          </span>
                        </div>
                        
                        <div className="stat-row">
                          <span className="stat-label">Admission Rate:</span>
                          <span className="stat-value">{formatPercentage(college.admissionRate)}</span>
                        </div>
                        
                        <div className="stat-row">
                          <span className="stat-label">Students:</span>
                          <span className="stat-value">{college.size?.toLocaleString() || 'N/A'}</span>
                        </div>
                        
                        <div className="stat-row">
                          <span className="stat-label">Type:</span>
                          <span className="stat-value">{college.type}</span>
                        </div>
                        
                        {college.tuitionInState && (
                          <div className="stat-row">
                            <span className="stat-label">Tuition:</span>
                            <span className="stat-value">{formatCurrency(college.tuitionInState)}</span>
                          </div>
                        )}
                      </div>
                      
                      {college.website && (
                        <a 
                          href={college.website.startsWith('http') ? college.website : `https://${college.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="college-website-link"
                        >
                          Visit Website →
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="no-results">
                <p>No colleges found matching your criteria. Try adjusting your filters or SAT scores.</p>
              </div>
            )}
          </div>
        </section>

        <section className="improvement-tips">
          <h2>Score Improvement Tips</h2>
          <div className="tips-grid">
            <div className="tip-card">
              <h3>🎯 Set Target Scores</h3>
              <p>Aim for section scores that align with your target colleges' averages. A 50-100 point increase is achievable with focused practice.</p>
            </div>
            <div className="tip-card">
              <h3>📊 Focus on Weaker Section</h3>
              <p>
                {mathScore < readingWritingScore ? 
                  'Your math score could use improvement. Focus on algebra, geometry, and data analysis practice.' :
                  readingWritingScore < mathScore ?
                  'Your reading score has room for growth. Practice reading comprehension and evidence-based questions.' :
                  'Your scores are balanced. Work on both sections equally or focus on your target schools\' preferences.'
                }
              </p>
            </div>
            <div className="tip-card">
              <h3>⏰ Time Management</h3>
              <p>Practice with official timing. Most students can improve scores by 50-100 points through better pacing and strategy.</p>
            </div>
            <div className="tip-card">
              <h3>📚 Use UltraSATPrep</h3>
              <p>Our adaptive practice system mirrors the Digital SAT format and identifies your weak areas with personalized recommendations.</p>
            </div>
          </div>
        </section>

        <section className="percentile-chart">
          <h2>Digital SAT Score Percentiles</h2>
          <div className="chart-container">
            <div className="percentile-bars">
              {[
                { score: '1600', percentile: 99, width: 100 },
                { score: '1500', percentile: 99, width: 98 },
                { score: '1400', percentile: 94, width: 85 },
                { score: '1300', percentile: 87, width: 72 },
                { score: '1200', percentile: 75, width: 60 },
                { score: '1100', percentile: 61, width: 45 },
                { score: '1000', percentile: 46, width: 30 },
                { score: '900', percentile: 31, width: 18 },
                { score: '800', percentile: 16, width: 10 }
              ].map((item, index) => (
                <div key={index} className="percentile-bar-item">
                  <div className="bar-info">
                    <span className="bar-score">{item.score}</span>
                    <span className="bar-percentile">{item.percentile}%</span>
                  </div>
                  <div className="bar-container">
                    <div 
                      className={`percentile-bar ${parseInt(item.score) <= totalScore ? 'active' : ''}`}
                      style={{ width: `${item.width}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="cta-section">
          <h2>Ready to Improve Your Digital SAT Score?</h2>
          <p>Start your personalized Digital SAT prep journey with UltraSATPrep. Our adaptive platform mirrors the new test format and helps you master both sections efficiently.</p>
          <div className="cta-buttons">
            <Link to="#" onClick={handleStartPractice} className="btn-primary">Start Practice Test</Link>
            <Link to="/sat-guide" className="btn-secondary">SAT Study Guide</Link>
          </div>
        </section>
      </div>
      {/* Auth Modal for starting practice */}
      <QuizAuthModal
        isOpen={quizAuthOpen}
        onClose={() => setQuizAuthOpen(false)}
        quizPath={quizPath}
        quizLabel={quizLabel}
        quizState={quizState}
      />
    </div>
  );
}

export default ScoreCalculator;