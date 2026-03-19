import React from 'react';

function getDiagnosticIssueClassName(issue) {
  if (issue.startsWith('\u274C')) {
    return 'error';
  }

  if (issue.startsWith('\u26A0\uFE0F')) {
    return 'warning';
  }

  if (
    issue.startsWith('\u2705') ||
    issue.startsWith('\u2139\uFE0F') ||
    issue.startsWith('\u{1F4CA}') ||
    issue.startsWith('\u{1F464}')
  ) {
    return 'info';
  }

  return 'success';
}

function AdminFeatureFlagsSection({
  diagnosticLoading,
  diagnosticResults,
  diagnosticSubcategory,
  diagnosticUserId,
  onDiagnosticSubcategoryChange,
  onDiagnosticUserIdChange,
  onRunGraphDiagnostic
}) {
  const eligibleGraphQuestions = diagnosticResults?.sampleQuestions?.eligibleWithGraphs || [];

  return (
    <div className="feature-flags-tab">
      <div className="tab-header">
        <h2>Feature Flags & Diagnostics</h2>
      </div>

      <div className="diagnostic-section">
        <h3>Graph Questions in Smart Quizzes Diagnostic</h3>
        <p>
          This tool investigates why graph questions might not be appearing in smart quizzes.
          It compares the database directly with what the smart quiz system sees.
        </p>

        <div className="diagnostic-controls">
          <div className="form-group">
            <label htmlFor="diagnostic-subcategory">Subcategory to diagnose:</label>
            <input
              type="text"
              id="diagnostic-subcategory"
              value={diagnosticSubcategory}
              onChange={(event) => onDiagnosticSubcategoryChange(event.target.value)}
              placeholder="e.g., lines-angles-triangles, two-variable-data"
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label htmlFor="diagnostic-user-id">User ID (optional):</label>
            <input
              type="text"
              id="diagnostic-user-id"
              value={diagnosticUserId}
              onChange={(event) => onDiagnosticUserIdChange(event.target.value)}
              placeholder="Check specific user's progress"
              className="form-control"
            />
          </div>
          <button
            onClick={onRunGraphDiagnostic}
            className="button-primary"
            disabled={diagnosticLoading}
          >
            {diagnosticLoading ? 'Running Diagnostic...' : 'Run Enhanced Diagnostic'}
          </button>
        </div>

        {diagnosticResults && (
          <div className="diagnostic-results">
            <h4>Enhanced Diagnostic Results for: {diagnosticResults.subcategoryId}</h4>

            <div className="results-grid">
              <div className="result-card">
                <strong>Total DB Questions:</strong> {diagnosticResults.totalQuestions}
              </div>
              <div className="result-card">
                <strong>Smart Quiz Eligible:</strong> {diagnosticResults.smartQuizEligibleQuestions}
              </div>
              <div className="result-card">
                <strong>Smart Quiz with Graphs:</strong> {diagnosticResults.smartQuizEligibleWithGraphs}
              </div>
              <div className="result-card">
                <strong>Graph Percentage:</strong> {diagnosticResults.smartQuizEligibleQuestions > 0 ? Math.round((diagnosticResults.smartQuizEligibleWithGraphs / diagnosticResults.smartQuizEligibleQuestions) * 100) : 0}%
              </div>
            </div>

            {diagnosticResults.difficultyTests && (
              <div className="difficulty-section">
                <h4>Difficulty Level Breakdown:</h4>
                <div className="difficulty-grid">
                  {Object.entries(diagnosticResults.difficultyTests).map(([difficulty, test]) => (
                    <div key={difficulty} className="difficulty-card">
                      <h5>{difficulty.toUpperCase()}</h5>
                      <div><strong>Total:</strong> {test.total}</div>
                      <div><strong>With Graphs:</strong> {test.withGraphs}</div>
                      <div><strong>Percentage:</strong> {test.percentage}%</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {diagnosticResults.userProgress && (
              <div className="user-progress-section">
                <h4>User Progress Analysis:</h4>
                <div className="progress-grid">
                  <div className="progress-card">
                    <strong>Current Level:</strong> {diagnosticResults.userProgress.currentLevel}
                  </div>
                  <div className="progress-card">
                    <strong>Questions Seen:</strong> {diagnosticResults.userProgress.totalAsked}
                  </div>
                  <div className="progress-card">
                    <strong>Graph Questions Seen:</strong> {diagnosticResults.userProgress.askedWithGraphs || 0}
                  </div>
                  <div className="progress-card">
                    <strong>Questions Missed:</strong> {diagnosticResults.userProgress.totalMissed}
                  </div>
                </div>
              </div>
            )}

            <div className="issues-section">
              <h4>Analysis:</h4>
              <ul>
                {diagnosticResults.issues.map((issue, index) => (
                  <li key={index} className={getDiagnosticIssueClassName(issue)}>
                    {issue}
                  </li>
                ))}
              </ul>
            </div>

            {eligibleGraphQuestions.length > 0 && (
              <div className="sample-section">
                <h4>Smart Quiz Eligible Questions with Graphs:</h4>
                <div className="sample-questions">
                  {eligibleGraphQuestions.map((question, index) => (
                    <div key={index} className="sample-question">
                      <strong>ID:</strong> {question.id}<br />
                      <strong>Difficulty:</strong> {question.difficulty}<br />
                      <strong>Context:</strong> {question.usageContext || 'undefined'}<br />
                      <strong>Graph URL:</strong> {question.hasGraphUrl ? 'Yes' : 'No'}<br />
                      <strong>Graph Description:</strong> {question.hasGraphDescription ? 'Yes' : 'No'}<br />
                      <strong>Text:</strong> {question.text}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminFeatureFlagsSection;
