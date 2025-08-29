import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import QuizAuthModal from '../components/QuizAuthModal';
import '../styles/SATGuide.css';

function SATGuide() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [quizAuthOpen, setQuizAuthOpen] = useState(false);
  const [quizPath, setQuizPath] = useState('');
  const [quizLabel, setQuizLabel] = useState('');
  const [quizState, setQuizState] = useState(null);

  const handleStartDiagnostic = (e) => {
    e.preventDefault();
    const navObj = { pathname: '/smart-quiz-generator', state: {} };
    if (currentUser) {
      navigate(navObj.pathname, { state: navObj.state });
    } else {
      setQuizPath('/smart-quiz-generator');
      setQuizLabel('Diagnostic Test');
      setQuizState(navObj);
      setQuizAuthOpen(true);
    }
  };

  return (
    <div className="sat-guide-page">
      <div className="sat-guide-container">
        <h1>Complete Digital SAT Guide</h1>
        <p className="hero-subtitle">Everything you need to know about the new Digital SAT exam, from structure to strategies for success.</p>
        
        <section className="overview-section">
          <h2>Digital SAT Overview</h2>
          <p>
            The Digital SAT is a standardized test widely used for college admissions in the United States. 
            Launched in March 2024, the Digital SAT is scored on a scale of 400-1600 and consists of two main sections: 
            Reading and Writing (combined) and Math. The test is fully digital, adaptive, and significantly shorter than its paper predecessor.
          </p>
          <div className="quick-facts">
            <div className="fact-item">
              <h3>⏱️ Test Duration</h3>
              <p>2 hours 14 minutes (with break)</p>
            </div>
            <div className="fact-item">
              <h3>🎯 Score Range</h3>
              <p>400 - 1600 points</p>
            </div>
            <div className="fact-item">
              <h3>💻 Format</h3>
              <p>Digital & Adaptive</p>
            </div>
            <div className="fact-item">
              <h3>📱 Device</h3>
              <p>Laptop, tablet, or provided device</p>
            </div>
            <div className="fact-item">
              <h3>📊 Questions</h3>
              <p>98 total questions</p>
            </div>
            <div className="fact-item">
              <h3>💰 Test Fee</h3>
              <p>$60 (with fee waivers available)</p>
            </div>
          </div>
        </section>

        <section className="structure-section">
          <h2>Digital SAT Structure</h2>
          <p className="digital-note">
            <strong>🔄 Adaptive Testing:</strong> The Digital SAT uses section-adaptive testing. Your performance on the first module 
            determines the difficulty level of the second module in each section.
          </p>
          
          <div className="section-breakdown">
            <div className="test-section">
              <h3>📖 Reading and Writing Section</h3>
              <div className="section-details">
                <p><strong>Structure:</strong> 2 modules of 32 minutes each</p>
                <p><strong>Total Time:</strong> 64 minutes</p>
                <p><strong>Questions:</strong> 54 questions (27 per module)</p>
                <p><strong>Passages:</strong> Short passages (~100 words) with 1 question each</p>
                <p><strong>Content:</strong> Literature, history, science, grammar, and vocabulary</p>
              </div>
            </div>
            
            <div className="test-section">
              <h3>🔢 Math Section</h3>
              <div className="section-details">
                <p><strong>Structure:</strong> 2 modules of 35 minutes each</p>
                <p><strong>Total Time:</strong> 70 minutes</p>
                <p><strong>Questions:</strong> 44 questions (22 per module)</p>
                <p><strong>Calculator:</strong> Allowed for ALL questions</p>
                <p><strong>Content:</strong> Algebra, advanced math, geometry, trigonometry, data analysis</p>
              </div>
            </div>
          </div>
          
          <div className="adaptive-explanation">
            <h3>🧠 How Adaptive Testing Works</h3>
            <div className="adaptive-steps">
              <div className="adaptive-step">
                <h4>Module 1</h4>
                <p>Mix of easy, medium, and hard questions for all students</p>
              </div>
              <div className="adaptive-arrow">→</div>
              <div className="adaptive-step">
                <h4>Performance Assessment</h4>
                <p>System analyzes your performance</p>
              </div>
              <div className="adaptive-arrow">→</div>
              <div className="adaptive-step">
                <h4>Module 2</h4>
                <p>Higher or lower difficulty based on Module 1 performance</p>
              </div>
            </div>
          </div>
        </section>

        <section className="digital-features-section">
          <h2>Digital Testing Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <h3>🔖 Mark for Review</h3>
              <p>Flag questions to return to later within each module</p>
            </div>
            <div className="feature-card">
              <h3>📝 Highlighting & Notes</h3>
              <p>Highlight text and leave yourself notes on any question</p>
            </div>
            <div className="feature-card">
              <h3>⏰ Digital Timer</h3>
              <p>On-screen countdown with 5-minute warning alerts</p>
            </div>
            <div className="feature-card">
              <h3>🧮 Built-in Calculator</h3>
              <p>Desmos graphing calculator available for all math questions</p>
            </div>
            <div className="feature-card">
              <h3>📋 Reference Sheet</h3>
              <p>Math formulas provided on-screen during the Math section</p>
            </div>
            <div className="feature-card">
              <h3>🔄 Navigation</h3>
              <p>Move freely between questions within each module</p>
            </div>
          </div>
        </section>

        <section className="scoring-section">
          <h2>Scoring System</h2>
          <div className="scoring-breakdown">
            <div className="score-component">
              <h3>Section Scores</h3>
              <ul>
                <li><strong>Reading and Writing:</strong> 200-800 points</li>
                <li><strong>Math:</strong> 200-800 points</li>
                <li><strong>Total Score:</strong> 400-1600 points</li>
              </ul>
            </div>
            <div className="score-component">
              <h3>Digital SAT Benefits</h3>
              <ul>
                <li>Scores available in days, not weeks</li>
                <li>More precise measurement through adaptive testing</li>
                <li>Same score scale as previous SAT</li>
              </ul>
            </div>
            <div className="score-component">
              <h3>Adaptive Scoring</h3>
              <ul>
                <li>Higher difficulty questions worth more points</li>
                <li>Module 1 performance affects Module 2 scoring</li>
                <li>More accurate assessment of ability level</li>
              </ul>
            </div>
          </div>
          
          <div className="percentile-info">
            <h3>Score Percentiles (2024 Digital SAT)</h3>
            <div className="percentile-grid">
              <div className="percentile-item">
                <span className="score">1600</span>
                <span className="percentile">99+%</span>
              </div>
              <div className="percentile-item">
                <span className="score">1500</span>
                <span className="percentile">99%</span>
              </div>
              <div className="percentile-item">
                <span className="score">1400</span>
                <span className="percentile">95%</span>
              </div>
              <div className="percentile-item">
                <span className="score">1300</span>
                <span className="percentile">87%</span>
              </div>
              <div className="percentile-item">
                <span className="score">1200</span>
                <span className="percentile">75%</span>
              </div>
              <div className="percentile-item">
                <span className="score">1060</span>
                <span className="percentile">50%</span>
              </div>
            </div>
          </div>
        </section>

        <section className="strategies-section">
          <h2>Digital SAT Study Strategies</h2>
          <div className="strategies-grid">
            <div className="strategy-card">
              <h3>💻 Master Digital Tools</h3>
              <p>Practice with the Bluebook app and familiarize yourself with all digital features before test day.</p>
            </div>
            <div className="strategy-card">
              <h3>🎯 Excel in Module 1</h3>
              <p>Strong performance on the first module unlocks harder, higher-scoring questions in module 2.</p>
            </div>
            <div className="strategy-card">
              <h3>📊 Take Adaptive Practice Tests</h3>
              <p>Use College Board's Bluebook app for authentic adaptive practice experience.</p>
            </div>
            <div className="strategy-card">
              <h3>📚 Focus on Weak Areas</h3>
              <p>Identify gaps early and spend 70% of study time on areas needing improvement.</p>
            </div>
            <div className="strategy-card">
              <h3>📖 Practice Short Passages</h3>
              <p>Get comfortable with the new format of many short passages instead of few long ones.</p>
            </div>
            <div className="strategy-card">
              <h3>🧮 Use Calculator Strategically</h3>
              <p>Practice with both your own calculator and the built-in Desmos graphing calculator.</p>
            </div>
          </div>
        </section>

        <section className="tips-section">
          <h2>Digital SAT Test-Taking Tips</h2>
          <div className="tips-categories">
            <div className="tip-category">
              <h3>📖 Reading and Writing Tips</h3>
              <ul>
                <li>Read each short passage carefully - only 1 question per passage</li>
                <li>Use highlighting feature to mark key information</li>
                <li>Look for evidence in the text to support your answers</li>
                <li>Pay attention to grammar, transitions, and logical flow</li>
                <li>Build vocabulary - the Digital SAT emphasizes college-level words</li>
                <li>Practice synthesizing information from bullet points</li>
              </ul>
            </div>
            
            <div className="tip-category">
              <h3>🔢 Math Tips</h3>
              <ul>
                <li>Use the built-in calculator strategically for all questions</li>
                <li>Reference the provided formula sheet when needed</li>
                <li>Show work on scratch paper even in digital format</li>
                <li>Practice grid-in responses (now include negatives and decimals)</li>
                <li>Focus on algebra and advanced math - they're heavily weighted</li>
                <li>Use mark for review to flag challenging problems</li>
              </ul>
            </div>
            
            <div className="tip-category">
              <h3>💻 Digital Strategy Tips</h3>
              <ul>
                <li>Mark questions for review and return to them if time permits</li>
                <li>Use annotations to leave yourself helpful notes</li>
                <li>Manage your time with the on-screen timer</li>
                <li>Stay focused - you can't go back to previous modules</li>
                <li>Bring backup calculator and know how to use Desmos</li>
                <li>Practice typing for any written responses</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="timeline-section">
          <h2>Digital SAT Preparation Timeline</h2>
          <div className="timeline">
            <div className="timeline-item">
              <h3>3-6 Months Before</h3>
              <ul>
                <li>Download and practice with Bluebook app</li>
                <li>Take diagnostic test to set baseline</li>
                <li>Set target score goals</li>
                <li>Create digital-focused study schedule</li>
                <li>Practice with digital tools and features</li>
              </ul>
            </div>
            <div className="timeline-item">
              <h3>2-3 Months Before</h3>
              <ul>
                <li>Focus on weak areas identified in practice</li>
                <li>Take adaptive practice tests every 2 weeks</li>
                <li>Build vocabulary for Reading and Writing</li>
                <li>Master calculator use for all math topics</li>
                <li>Register for test date</li>
              </ul>
            </div>
            <div className="timeline-item">
              <h3>1 Month Before</h3>
              <ul>
                <li>Take final adaptive practice tests</li>
                <li>Ensure device compatibility and backup plans</li>
                <li>Review digital testing procedures</li>
                <li>Practice timing strategies for each module</li>
                <li>Prepare test day materials and device</li>
              </ul>
            </div>
            <div className="timeline-item">
              <h3>Week of Test</h3>
              <ul>
                <li>Light review and digital tool practice only</li>
                <li>Ensure device is charged and functional</li>
                <li>Get adequate sleep and eat well</li>
                <li>Prepare approved calculator as backup</li>
                <li>Stay calm and confident in your preparation</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="resources-section">
          <h2>Digital SAT Resources</h2>
          <div className="resources-grid">
            <div className="resource-item">
              <h3>💻 College Board Bluebook App</h3>
              <p>Official adaptive practice tests and digital testing experience. Essential for Digital SAT preparation.</p>
            </div>
            <div className="resource-item">
              <h3>📱 UltraSATPrep Platform</h3>
              <p>Access thousands of Digital SAT practice questions, personalized study plans, and detailed analytics.</p>
            </div>
            <div className="resource-item">
              <h3>🧮 Desmos Calculator Practice</h3>
              <p>Familiarize yourself with the built-in graphing calculator used on the Digital SAT.</p>
            </div>
            <div className="resource-item">
              <h3>📚 Digital SAT Prep Materials</h3>
              <p>Official College Board study guide and reputable third-party materials designed for the digital format.</p>
            </div>
          </div>
        </section>

        <section className="cta-section">
          <h2>Ready to Start Your Digital SAT Prep?</h2>
          <p>
            Use our comprehensive platform to create a personalized study plan and track your progress. 
            Start with our diagnostic test to identify your strengths and areas for improvement on the new Digital SAT.
          </p>
          <div className="cta-buttons">
            <Link to="#" onClick={handleStartDiagnostic} className="btn-primary">Take Diagnostic Test</Link>
            <Link to="/score-calculator" className="btn-secondary">Try Digital SAT Score Calculator</Link>
          </div>
        </section>
      </div>
      {/* Auth Modal for starting diagnostic */}
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

export default SATGuide;