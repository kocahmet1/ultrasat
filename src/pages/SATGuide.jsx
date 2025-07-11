import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/SATGuide.css';

function SATGuide() {
  return (
    <div className="sat-guide-page">
      <div className="sat-guide-container">
        <h1>Complete SAT Guide</h1>
        <p className="hero-subtitle">Everything you need to know about the SAT exam, from structure to strategies for success.</p>
        
        <section className="overview-section">
          <h2>SAT Overview</h2>
          <p>
            The SAT (Scholastic Assessment Test) is a standardized test widely used for college admissions in the United States. 
            The current SAT is scored on a scale of 400-1600 and consists of two main sections: Evidence-Based Reading and Writing (EBRW) 
            and Math, each scored from 200-800 points.
          </p>
          <div className="quick-facts">
            <div className="fact-item">
              <h3>📝 Test Duration</h3>
              <p>3 hours (without essay)</p>
            </div>
            <div className="fact-item">
              <h3>🎯 Score Range</h3>
              <p>400 - 1600 points</p>
            </div>
            <div className="fact-item">
              <h3>📅 Test Dates</h3>
              <p>7 times per year</p>
            </div>
            <div className="fact-item">
              <h3>💰 Test Fee</h3>
              <p>$60 (with fee waivers available)</p>
            </div>
          </div>
        </section>

        <section className="structure-section">
          <h2>Test Structure</h2>
          <div className="section-breakdown">
            <div className="test-section">
              <h3>📖 Reading Test</h3>
              <div className="section-details">
                <p><strong>Time:</strong> 65 minutes</p>
                <p><strong>Questions:</strong> 52 multiple-choice</p>
                <p><strong>Passages:</strong> 5 passages with 10-11 questions each</p>
                <p><strong>Content:</strong> Literature, history/social studies, and science passages</p>
              </div>
            </div>
            
            <div className="test-section">
              <h3>✍️ Writing and Language Test</h3>
              <div className="section-details">
                <p><strong>Time:</strong> 35 minutes</p>
                <p><strong>Questions:</strong> 44 multiple-choice</p>
                <p><strong>Passages:</strong> 4 passages with 11 questions each</p>
                <p><strong>Content:</strong> Grammar, usage, and rhetoric in context</p>
              </div>
            </div>
            
            <div className="test-section">
              <h3>🔢 Math Test</h3>
              <div className="section-details">
                <p><strong>No Calculator:</strong> 25 minutes, 20 questions</p>
                <p><strong>Calculator:</strong> 55 minutes, 38 questions</p>
                <p><strong>Question Types:</strong> Multiple-choice and grid-in</p>
                <p><strong>Content:</strong> Algebra, advanced math, problem-solving, and data analysis</p>
              </div>
            </div>
          </div>
        </section>

        <section className="scoring-section">
          <h2>Scoring System</h2>
          <div className="scoring-breakdown">
            <div className="score-component">
              <h3>Section Scores</h3>
              <ul>
                <li><strong>Evidence-Based Reading and Writing:</strong> 200-800 points</li>
                <li><strong>Math:</strong> 200-800 points</li>
                <li><strong>Total Score:</strong> 400-1600 points</li>
              </ul>
            </div>
            <div className="score-component">
              <h3>Subscores (1-15 scale)</h3>
              <ul>
                <li>Reading Test Score</li>
                <li>Writing and Language Test Score</li>
                <li>Math Test Score</li>
              </ul>
            </div>
            <div className="score-component">
              <h3>Cross-Test Scores (10-40 scale)</h3>
              <ul>
                <li>Analysis in History/Social Studies</li>
                <li>Analysis in Science</li>
              </ul>
            </div>
          </div>
          
          <div className="percentile-info">
            <h3>Score Percentiles (2023)</h3>
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
          <h2>Study Strategies</h2>
          <div className="strategies-grid">
            <div className="strategy-card">
              <h3>🎯 Set Clear Goals</h3>
              <p>Research your target colleges' average SAT scores and set realistic but challenging goals for your preparation.</p>
            </div>
            <div className="strategy-card">
              <h3>📊 Take Diagnostic Tests</h3>
              <p>Start with a full-length practice test to identify your strengths and areas for improvement.</p>
            </div>
            <div className="strategy-card">
              <h3>📅 Create a Study Schedule</h3>
              <p>Plan 3-6 months of consistent study time, allocating more time to your weaker sections.</p>
            </div>
            <div className="strategy-card">
              <h3>📚 Focus on Weak Areas</h3>
              <p>Spend 70% of your time on areas where you struggle most, 30% on maintaining your strengths.</p>
            </div>
            <div className="strategy-card">
              <h3>🔄 Practice Regularly</h3>
              <p>Take full-length practice tests every 2 weeks and review all mistakes thoroughly.</p>
            </div>
            <div className="strategy-card">
              <h3>⏰ Master Time Management</h3>
              <p>Practice with strict timing and develop strategies for managing your pace during the test.</p>
            </div>
          </div>
        </section>

        <section className="tips-section">
          <h2>Test-Taking Tips</h2>
          <div className="tips-categories">
            <div className="tip-category">
              <h3>📖 Reading Tips</h3>
              <ul>
                <li>Read the passage first, then answer questions</li>
                <li>Look for evidence in the text to support your answers</li>
                <li>Pay attention to tone, purpose, and main ideas</li>
                <li>Don't bring outside knowledge to literature questions</li>
                <li>Practice reading different types of texts (science, history, literature)</li>
              </ul>
            </div>
            
            <div className="tip-category">
              <h3>✍️ Writing Tips</h3>
              <ul>
                <li>Read the entire sentence, not just the underlined portion</li>
                <li>Choose the most concise, clear option</li>
                <li>Understand grammar rules: subject-verb agreement, parallelism, modifiers</li>
                <li>Pay attention to transitions and logical flow</li>
                <li>When in doubt, choose the option that sounds most natural</li>
              </ul>
            </div>
            
            <div className="tip-category">
              <h3>🔢 Math Tips</h3>
              <ul>
                <li>Show your work and double-check calculations</li>
                <li>Use your calculator strategically (when allowed)</li>
                <li>Plug in answer choices when appropriate</li>
                <li>Draw diagrams for geometry problems</li>
                <li>Memorize key formulas and practice mental math</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="timeline-section">
          <h2>Preparation Timeline</h2>
          <div className="timeline">
            <div className="timeline-item">
              <h3>3-6 Months Before</h3>
              <ul>
                <li>Take a diagnostic test</li>
                <li>Set target score goals</li>
                <li>Create study schedule</li>
                <li>Begin content review</li>
              </ul>
            </div>
            <div className="timeline-item">
              <h3>2-3 Months Before</h3>
              <ul>
                <li>Focus on weak areas</li>
                <li>Take practice tests every 2 weeks</li>
                <li>Review and analyze mistakes</li>
                <li>Register for test date</li>
              </ul>
            </div>
            <div className="timeline-item">
              <h3>1 Month Before</h3>
              <ul>
                <li>Take final practice tests</li>
                <li>Review test day procedures</li>
                <li>Focus on timing strategies</li>
                <li>Prepare test day materials</li>
              </ul>
            </div>
            <div className="timeline-item">
              <h3>Week of Test</h3>
              <ul>
                <li>Light review only</li>
                <li>Get adequate sleep</li>
                <li>Prepare test day supplies</li>
                <li>Stay calm and confident</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="resources-section">
          <h2>Additional Resources</h2>
          <div className="resources-grid">
            <div className="resource-item">
              <h3>📱 UltraSATPrep Platform</h3>
              <p>Access thousands of practice questions, personalized study plans, and detailed analytics.</p>
            </div>
            <div className="resource-item">
              <h3>📚 Official SAT Practice</h3>
              <p>Use College Board's free practice tests and Khan Academy's personalized practice.</p>
            </div>
            <div className="resource-item">
              <h3>📖 Prep Books</h3>
              <p>Consider official SAT prep books and reputable third-party materials for additional practice.</p>
            </div>
            <div className="resource-item">
              <h3>👥 Study Groups</h3>
              <p>Join study groups or work with tutors for additional motivation and support.</p>
            </div>
          </div>
        </section>

        <section className="cta-section">
          <h2>Ready to Start Your SAT Prep?</h2>
          <p>
            Use our comprehensive platform to create a personalized study plan and track your progress. 
            Start with our diagnostic test to identify your strengths and areas for improvement.
          </p>
          <div className="cta-buttons">
            <Link to="/smart-quiz" className="btn-primary">Take Diagnostic Test</Link>
            <Link to="/score-calculator" className="btn-secondary">Try Score Calculator</Link>
          </div>
        </section>
      </div>
    </div>
  );
}

export default SATGuide; 