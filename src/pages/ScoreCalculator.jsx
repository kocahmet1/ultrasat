import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/ScoreCalculator.css';

function ScoreCalculator() {
  const [mathScore, setMathScore] = useState(500);
  const [readingScore, setReadingScore] = useState(500);
  const [writingScore, setWritingScore] = useState(25);
  const [totalScore, setTotalScore] = useState(1000);
  const [percentile, setPercentile] = useState(50);

  // Score conversion tables (simplified for demo)
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
    const total = mathScore + readingScore + (writingScore * 10);
    setTotalScore(Math.min(1600, Math.max(400, total)));
    
    // Find closest percentile
    const closest = Object.keys(percentileMap).reduce((prev, curr) => 
      Math.abs(parseInt(curr) - total) < Math.abs(parseInt(prev) - total) ? curr : prev
    );
    setPercentile(percentileMap[closest] || 1);
  }, [mathScore, readingScore, writingScore]);

  const collegeSuggestions = [
    { name: "Harvard University", avgScore: 1520, match: totalScore >= 1500 },
    { name: "Stanford University", avgScore: 1505, match: totalScore >= 1480 },
    { name: "MIT", avgScore: 1540, match: totalScore >= 1520 },
    { name: "UC Berkeley", avgScore: 1415, match: totalScore >= 1350 },
    { name: "UCLA", avgScore: 1405, match: totalScore >= 1340 },
    { name: "University of Michigan", avgScore: 1350, match: totalScore >= 1280 },
    { name: "Georgia Tech", avgScore: 1370, match: totalScore >= 1300 },
    { name: "NYU", avgScore: 1310, match: totalScore >= 1240 }
  ];

  const admissionInfo = getCollegeAdmissionInfo(totalScore);

  return (
    <div className="score-calculator-page">
      <div className="calculator-container">
        <h1>SAT Score Calculator</h1>
        <p className="hero-subtitle">Calculate your SAT score, see percentile rankings, and explore college admission prospects.</p>
        
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
              </div>

              <div className="score-input">
                <label htmlFor="reading-score">Reading Score</label>
                <div className="input-wrapper">
                  <input
                    type="range"
                    id="reading-score"
                    min="200"
                    max="800"
                    value={readingScore}
                    onChange={(e) => setReadingScore(parseInt(e.target.value))}
                    className="score-slider"
                  />
                  <input
                    type="number"
                    min="200"
                    max="800"
                    value={readingScore}
                    onChange={(e) => setReadingScore(Math.max(200, Math.min(800, parseInt(e.target.value) || 200)))}
                    className="score-number"
                  />
                </div>
                <div className="score-range">200 - 800</div>
              </div>

              <div className="score-input">
                <label htmlFor="writing-score">Writing Subscore (Optional)</label>
                <div className="input-wrapper">
                  <input
                    type="range"
                    id="writing-score"
                    min="10"
                    max="40"
                    value={writingScore}
                    onChange={(e) => setWritingScore(parseInt(e.target.value))}
                    className="score-slider"
                  />
                  <input
                    type="number"
                    min="10"
                    max="40"
                    value={writingScore}
                    onChange={(e) => setWritingScore(Math.max(10, Math.min(40, parseInt(e.target.value) || 10)))}
                    className="score-number"
                  />
                </div>
                <div className="score-range">10 - 40</div>
              </div>
            </div>
          </div>

          <div className="results-section">
            <div className="total-score-display">
              <h2>Your SAT Score</h2>
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
                  <span>{readingScore}</span>
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
                  <span className="value">1060</span>
                </div>
                <div className="analysis-item">
                  <span className="label">Your Score:</span>
                  <span className="value">{totalScore}</span>
                </div>
                <div className="analysis-item">
                  <span className="label">Difference:</span>
                  <span className={`value ${totalScore >= 1060 ? 'positive' : 'negative'}`}>
                    {totalScore >= 1060 ? '+' : ''}{totalScore - 1060}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="college-suggestions">
          <h2>College Match Suggestions</h2>
          <p>Based on your score of {totalScore}, here are some colleges where you might be competitive:</p>
          <div className="colleges-grid">
            {collegeSuggestions.map((college, index) => (
              <div 
                key={index} 
                className={`college-card ${college.match ? 'match' : 'reach'}`}
              >
                <h4>{college.name}</h4>
                <div className="college-score">
                  Average SAT: {college.avgScore}
                </div>
                <div className={`match-indicator ${college.match ? 'good-match' : 'reach-school'}`}>
                  {college.match ? 'Good Match' : 'Reach School'}
                </div>
              </div>
            ))}
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
                {mathScore < readingScore ? 
                  'Your math score could use improvement. Focus on algebra, geometry, and data analysis practice.' :
                  readingScore < mathScore ?
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
              <p>Our adaptive practice system identifies your weak areas and provides personalized question recommendations.</p>
            </div>
          </div>
        </section>

        <section className="percentile-chart">
          <h2>SAT Score Percentiles</h2>
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
          <h2>Ready to Improve Your Score?</h2>
          <p>Start your personalized SAT prep journey with UltraSATPrep. Our adaptive platform helps you target your weak areas and maximize your score potential.</p>
          <div className="cta-buttons">
            <Link to="/smart-quiz" className="btn-primary">Start Practice Test</Link>
            <Link to="/sat-guide" className="btn-secondary">SAT Study Guide</Link>
          </div>
        </section>
      </div>
    </div>
  );
}

export default ScoreCalculator; 