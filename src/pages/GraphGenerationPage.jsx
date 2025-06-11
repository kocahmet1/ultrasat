import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/config';
import { 
  generateQuestionGraphPlotly, 
  generateQuestionGraph, 
  checkPlotlyEnvironment, 
  checkPythonEnvironment 
} from '../utils/apiClient';
import { toast } from 'react-toastify';
import '../styles/GraphGeneration.css';

const GraphGenerationPage = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState({});
  const [plotlyStatus, setPlotlyStatus] = useState(null);
  const [pythonStatus, setPythonStatus] = useState(null);
  const [preferredMethod, setPreferredMethod] = useState('plotly'); // plotly or python
  const [filter, setFilter] = useState('all'); // all, with-description, without-graph

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadQuestions();
    checkEnvironments();
  }, [filter]);

  const checkEnvironments = async () => {
    try {
      // Check Plotly.js environment (preferred)
      const plotlyResult = await checkPlotlyEnvironment();
      setPlotlyStatus(plotlyResult);
      
      // Check Python environment (fallback)
      const pythonResult = await checkPythonEnvironment();
      setPythonStatus(pythonResult);
      
      // Set preferred method based on availability
      if (plotlyResult.plotlyReady) {
        setPreferredMethod('plotly');
      } else if (pythonResult.pythonInstalled) {
        setPreferredMethod('python');
      }
    } catch (error) {
      console.error('Error checking environments:', error);
      setPlotlyStatus({ plotlyReady: false, error: error.message });
      setPythonStatus({ pythonInstalled: false, error: error.message });
    }
  };

  const loadQuestions = async () => {
    setLoading(true);
    try {
      let questionsQuery;
      
      if (filter === 'with-description') {
        questionsQuery = query(
          collection(db, 'questions'),
          where('graphDescription', '!=', ''),
          orderBy('graphDescription'),
          orderBy('createdAt', 'desc'),
          limit(100)
        );
      } else if (filter === 'without-graph') {
        questionsQuery = query(
          collection(db, 'questions'),
          where('graphDescription', '!=', ''),
          where('graphUrl', '==', null),
          orderBy('graphDescription'),
          orderBy('createdAt', 'desc'),
          limit(100)
        );
      } else {
        questionsQuery = query(
          collection(db, 'questions'),
          where('graphDescription', '!=', ''),
          orderBy('graphDescription'),
          orderBy('createdAt', 'desc'),
          limit(100)
        );
      }

      const snapshot = await getDocs(questionsQuery);
      
      // Filter out questions with null or empty graphDescription on the client side
      const questionsData = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(question => 
          question.graphDescription && 
          question.graphDescription.trim() !== ''
        );

      setQuestions(questionsData);
    } catch (error) {
      console.error('Error loading questions:', error);
      toast.error('Failed to load questions: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateGraph = async (question, method = preferredMethod) => {
    if (!question.graphDescription || !question.text) {
      toast.error('Question must have both text and graph description');
      return;
    }

    setGenerating(prev => ({ ...prev, [question.id]: true }));

    try {
      let result;
      
      if (method === 'plotly' && plotlyStatus?.plotlyReady) {
        console.log('Using Plotly.js method');
        result = await generateQuestionGraphPlotly(
          question.id,
          question.text,
          question.graphDescription
        );
      } else if (method === 'python' && pythonStatus?.pythonInstalled) {
        console.log('Using Python/matplotlib method');
        result = await generateQuestionGraph(
          question.id,
          question.text,
          question.graphDescription
        );
      } else {
        throw new Error('No graph generation method available');
      }

      if (result.success) {
        toast.success(`Graph generated successfully using ${method === 'plotly' ? 'Plotly.js' : 'Python/matplotlib'}!`);
        
        // Update the question in our local state
        setQuestions(prev => prev.map(q => 
          q.id === question.id 
            ? { 
                ...q, 
                graphUrl: result.graphUrl, 
                generatedGraph: true,
                graphGenerationType: method
              }
            : q
        ));
      } else {
        toast.error('Failed to generate graph: ' + result.message);
      }
    } catch (error) {
      console.error('Error generating graph:', error);
      toast.error('Failed to generate graph: ' + error.message);
    } finally {
      setGenerating(prev => ({ ...prev, [question.id]: false }));
    }
  };

  const getStatusIcon = (question) => {
    if (generating[question.id]) {
      return <span className="status-generating">🔄 Generating...</span>;
    }
    if (question.graphUrl) {
      if (question.generatedGraph) {
        const method = question.graphGenerationType || 'unknown';
        return <span className="status-generated">
          🤖 AI Generated ({method === 'plotly' ? 'Plotly.js' : method})
        </span>;
      } else {
        return <span className="status-manual">📁 Manual Upload</span>;
      }
    }
    return <span className="status-none">❌ No Graph</span>;
  };

  const getEnvironmentStatus = () => {
    if (plotlyStatus?.plotlyReady) {
      return (
        <div className="status-card success">
          <span className="status-icon">✅</span>
          <span>Plotly.js Environment Ready (Recommended)</span>
          <small>Pure JavaScript - No Python dependencies required!</small>
        </div>
      );
    } else if (pythonStatus?.pythonInstalled) {
      return (
        <div className="status-card success">
          <span className="status-icon">⚠️</span>
          <span>Python Environment Ready (Fallback)</span>
          <small>{pythonStatus.version} - Consider switching to Plotly.js for better performance</small>
          {/* Debug info */}
          <div style={{fontSize: '11px', marginTop: '5px', color: '#666'}}>
            Debug: plotlyReady={String(plotlyStatus?.plotlyReady)}, pythonInstalled={String(pythonStatus?.pythonInstalled)}, 
            isReady={String(isEnvironmentReady())}
          </div>
        </div>
      );
    } else {
      return (
        <div className="status-card error">
          <span className="status-icon">❌</span>
          <span>No Graph Generation Environment Ready</span>
          <small>Install Puppeteer: npm install puppeteer</small>
          {/* Debug info */}
          <div style={{fontSize: '11px', marginTop: '5px', color: '#666'}}>
            Debug: plotlyReady={String(plotlyStatus?.plotlyReady)}, pythonInstalled={String(pythonStatus?.pythonInstalled)}, 
            plotlyError={plotlyStatus?.error}, pythonError={pythonStatus?.error}
          </div>
        </div>
      );
    }
  };

  const isEnvironmentReady = () => {
    return plotlyStatus?.plotlyReady || pythonStatus?.pythonInstalled;
  };

  const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  if (loading) {
    return (
      <div className="graph-generation-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading questions with graph descriptions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="graph-generation-page">
      <div className="page-header">
        <h1>Graph Generation</h1>
        <p>Generate graphs from text descriptions using AI</p>
      </div>

      {/* Environment Status */}
      <div className="environment-status">
        <h3>Environment Status</h3>
        {getEnvironmentStatus()}
        
        {/* Method Selection */}
        {plotlyStatus?.plotlyReady && pythonStatus?.pythonInstalled && (
          <div className="method-selection">
            <h4>Generation Method:</h4>
            <div className="method-buttons">
              <button 
                className={preferredMethod === 'plotly' ? 'active' : ''}
                onClick={() => setPreferredMethod('plotly')}
              >
                📊 Plotly.js (Recommended)
              </button>
              <button 
                className={preferredMethod === 'python' ? 'active' : ''}
                onClick={() => setPreferredMethod('python')}
              >
                🐍 Python/matplotlib
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Filter Controls */}
      <div className="filter-controls">
        <h3>Filter Questions</h3>
        <div className="filter-buttons">
          <button 
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            All with Descriptions ({questions.length})
          </button>
          <button 
            className={filter === 'without-graph' ? 'active' : ''}
            onClick={() => setFilter('without-graph')}
          >
            Need Graphs
          </button>
          <button 
            className={filter === 'with-description' ? 'active' : ''}
            onClick={() => setFilter('with-description')}
          >
            With Descriptions
          </button>
        </div>
      </div>

      {/* Questions List */}
      <div className="questions-section">
        <h3>Questions ({questions.length})</h3>
        
        {questions.length === 0 ? (
          <div className="no-questions">
            <p>No questions found with graph descriptions.</p>
            <p>Add graph descriptions to questions in the Question Editor to see them here.</p>
          </div>
        ) : (
          <div className="questions-grid">
            {questions.map(question => (
              <div key={question.id} className="question-card">
                <div className="question-header">
                  <div className="question-id">
                    ID: {question.id.substring(0, 8)}...
                  </div>
                  <div className="header-actions">
                    <div className="question-status">
                      {getStatusIcon(question)}
                    </div>
                    <button
                      className="header-generate-btn"
                      onClick={() => handleGenerateGraph(question)}
                      disabled={generating[question.id] || !isEnvironmentReady()}
                    >
                      {generating[question.id] ? (
                        <>
                          <span className="spinner-small"></span>
                          Generating...
                        </>
                      ) : (
                        <>
                          🎨 Generate Graph
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="question-content">
                  <div className="question-text">
                    <h4>Question Text:</h4>
                    <p>{truncateText(question.text, 150)}</p>
                  </div>

                  <div className="graph-description">
                    <h4>Graph Description:</h4>
                    <p>{truncateText(question.graphDescription, 200)}</p>
                  </div>

                  {question.subcategory && (
                    <div className="question-metadata">
                      <span className="subcategory">📚 {question.subcategory}</span>
                      <span className="difficulty">⭐ {question.difficulty || 'medium'}</span>
                    </div>
                  )}

                  {question.graphUrl && (
                    <div className="current-graph">
                      <h4>Current Graph:</h4>
                      <img 
                        src={question.graphUrl} 
                        alt="Question Graph" 
                        className="graph-preview"
                      />
                      <button
                        className="regenerate-btn-inline"
                        onClick={() => handleGenerateGraph(question)}
                        disabled={generating[question.id] || !isEnvironmentReady()}
                      >
                        🔄 Regenerate Graph
                      </button>
                    </div>
                  )}

                  {/* Debug info */}
                  <div style={{fontSize: '10px', color: '#666', marginTop: '10px', padding: '5px', backgroundColor: '#f0f0f0'}}>
                    Environment Ready: {String(isEnvironmentReady())} | 
                    Plotly: {String(plotlyStatus?.plotlyReady)} | 
                    Python: {String(pythonStatus?.pythonInstalled)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      <div className="bulk-actions">
        <h3>Bulk Actions</h3>
        <div className="bulk-buttons">
          <button
            className="bulk-generate-button"
            onClick={() => {
              const questionsWithoutGraphs = questions.filter(q => !q.graphUrl);
              if (questionsWithoutGraphs.length === 0) {
                toast.info('No questions need graphs');
                return;
              }
              
              if (window.confirm(`Generate graphs for ${questionsWithoutGraphs.length} questions using ${preferredMethod === 'plotly' ? 'Plotly.js' : 'Python/matplotlib'}? This may take several minutes.`)) {
                questionsWithoutGraphs.forEach((question, index) => {
                  setTimeout(() => {
                    handleGenerateGraph(question);
                  }, index * 5000); // Stagger requests by 5 seconds
                });
              }
            }}
            disabled={!isEnvironmentReady() || Object.keys(generating).some(id => generating[id])}
          >
            🚀 Generate All Missing Graphs ({preferredMethod === 'plotly' ? 'Plotly.js' : 'Python'})
          </button>
        </div>
      </div>
    </div>
  );
};

export default GraphGenerationPage; 