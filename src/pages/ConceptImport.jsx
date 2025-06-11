/**
 * Concept Import Interface
 * Allows admins to upload and import predefined concepts from JSON files
 */

import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUpload, 
  faFileAlt, 
  faCheckCircle, 
  faExclamationTriangle,
  faSpinner,
  faDownload,
  faList,
  faTrash
} from '@fortawesome/free-solid-svg-icons';
import '../styles/ConceptImport.css';

export default function ConceptImport() {
  const { currentUser } = useAuth();
  const fileInputRef = useRef(null);
  
  // State management
  const [selectedFile, setSelectedFile] = useState(null);
  const [subcategoryId, setSubcategoryId] = useState('');
  const [importing, setImporting] = useState(false);
  const [dryRun, setDryRun] = useState(true);
  const [forceOverwrite, setForceOverwrite] = useState(false);
  const [replaceAll, setReplaceAll] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [filePreview, setFilePreview] = useState(null);

  // Available subcategories (could be fetched dynamically)
  const subcategories = [
    // Math subcategories
    { id: 'linear-equations-one-variable', name: 'Linear Equations (One Variable)', section: 'Math' },
    { id: 'linear-functions', name: 'Linear Functions', section: 'Math' },
    { id: 'linear-equations-two-variables', name: 'Linear Equations (Two Variables)', section: 'Math' },
    { id: 'systems-linear-equations', name: 'Systems of Linear Equations', section: 'Math' },
    { id: 'linear-inequalities', name: 'Linear Inequalities', section: 'Math' },
    { id: 'nonlinear-functions', name: 'Nonlinear Functions', section: 'Math' },
    { id: 'nonlinear-equations', name: 'Nonlinear Equations', section: 'Math' },
    { id: 'equivalent-expressions', name: 'Equivalent Expressions', section: 'Math' },
    { id: 'ratios-rates-proportions', name: 'Ratios, Rates & Proportions', section: 'Math' },
    { id: 'percentages', name: 'Percentages', section: 'Math' },
    { id: 'one-variable-data', name: 'One-Variable Data', section: 'Math' },
    { id: 'two-variable-data', name: 'Two-Variable Data', section: 'Math' },
    { id: 'probability', name: 'Probability', section: 'Math' },
    { id: 'inference-statistics', name: 'Inference & Statistics', section: 'Math' },
    { id: 'evaluating-statistical-claims', name: 'Evaluating Statistical Claims', section: 'Math' },
    { id: 'area-volume', name: 'Area & Volume', section: 'Math' },
    { id: 'lines-angles-triangles', name: 'Lines, Angles & Triangles', section: 'Math' },
    { id: 'right-triangles-trigonometry', name: 'Right Triangles & Trigonometry', section: 'Math' },
    { id: 'circles', name: 'Circles', section: 'Math' },
    
    // Reading & Writing subcategories
    { id: 'central-ideas-details', name: 'Central Ideas & Details', section: 'Reading & Writing' },
    { id: 'inferences', name: 'Inferences', section: 'Reading & Writing' },
    { id: 'command-of-evidence', name: 'Command of Evidence', section: 'Reading & Writing' },
    { id: 'words-in-context', name: 'Words in Context', section: 'Reading & Writing' },
    { id: 'text-structure-purpose', name: 'Text Structure & Purpose', section: 'Reading & Writing' },
    { id: 'cross-text-connections', name: 'Cross-Text Connections', section: 'Reading & Writing' },
    { id: 'rhetorical-synthesis', name: 'Rhetorical Synthesis', section: 'Reading & Writing' },
    { id: 'transitions', name: 'Transitions', section: 'Reading & Writing' },
    { id: 'boundaries', name: 'Boundaries', section: 'Reading & Writing' },
    { id: 'form-structure-sense', name: 'Form, Structure & Sense', section: 'Reading & Writing' }
  ];

  // Group subcategories by section
  const groupedSubcategories = subcategories.reduce((acc, sub) => {
    if (!acc[sub.section]) acc[sub.section] = [];
    acc[sub.section].push(sub);
    return acc;
  }, {});

  // Handle file selection
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setResults(null);
      setError(null);
      
      // Read file content for preview
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = JSON.parse(e.target.result);
          setFilePreview(content);
        } catch (err) {
          setError('Invalid JSON file format');
          setFilePreview(null);
        }
      };
      reader.readAsText(file);
    }
  };

  // Handle import
  const handleImport = async () => {
    if (!selectedFile || !subcategoryId) {
      setError('Please select a file and subcategory');
      return;
    }

    setImporting(true);
    setError(null);
    setResults(null);

    try {
      const formData = new FormData();
      formData.append('conceptsFile', selectedFile);
      formData.append('subcategoryId', subcategoryId);
      formData.append('dryRun', dryRun.toString());
      formData.append('forceOverwrite', forceOverwrite.toString());
      formData.append('replaceAll', replaceAll.toString());

      const response = await fetch('/api/concepts/import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await currentUser.getIdToken()}`
        },
        body: formData
      });

      const result = await response.json();

      if (response.ok) {
        setResults(result);
      } else {
        setError(result.error || 'Import failed');
      }
    } catch (err) {
      setError('Import failed: ' + err.message);
    } finally {
      setImporting(false);
    }
  };

  // Clear form
  const clearForm = () => {
    setSelectedFile(null);
    setSubcategoryId('');
    setFilePreview(null);
    setResults(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="concept-import">
      <div className="import-header">
        <h1>
          <FontAwesomeIcon icon={faUpload} className="page-icon" />
          Import Predefined Concepts
        </h1>
        <p className="page-description">
          Upload JSON files containing predefined concepts for specific subcategories
        </p>
      </div>

      <div className="import-container">
        <div className="import-form-card">
          <h2>Upload Concepts</h2>
          
          {/* File Upload */}
          <div className="form-group">
            <label htmlFor="file-input" className="form-label">
              <FontAwesomeIcon icon={faFileAlt} /> Select JSON File
            </label>
            <div className="file-input-wrapper">
              <input
                ref={fileInputRef}
                id="file-input"
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="file-input"
              />
              <div className="file-input-display">
                {selectedFile ? (
                  <div className="file-selected">
                    <FontAwesomeIcon icon={faCheckCircle} className="file-icon" />
                    <span>{selectedFile.name}</span>
                    <span className="file-size">({Math.round(selectedFile.size / 1024)} KB)</span>
                  </div>
                ) : (
                  <div className="file-placeholder">
                    <FontAwesomeIcon icon={faUpload} />
                    <span>Choose a JSON file or drag and drop</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Subcategory Selection */}
          <div className="form-group">
            <label htmlFor="subcategory-select" className="form-label">
              Target Subcategory
            </label>
            <select
              id="subcategory-select"
              value={subcategoryId}
              onChange={(e) => setSubcategoryId(e.target.value)}
              className="form-select"
            >
              <option value="">Select a subcategory...</option>
              {Object.entries(groupedSubcategories).map(([section, subs]) => (
                <optgroup key={section} label={section}>
                  {subs.map(sub => (
                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Import Options */}
          <div className="form-group">
            <label className="form-label">Import Options</label>
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={dryRun}
                  onChange={(e) => setDryRun(e.target.checked)}
                />
                <span className="checkbox-text">
                  Dry Run (preview only, don't save to database)
                </span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={forceOverwrite}
                  onChange={(e) => {
                    setForceOverwrite(e.target.checked);
                    if (e.target.checked) setReplaceAll(false);
                  }}
                />
                <span className="checkbox-text">
                  Force Overwrite (replace existing concepts with same ID)
                </span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={replaceAll}
                  onChange={(e) => {
                    setReplaceAll(e.target.checked);
                    if (e.target.checked) setForceOverwrite(false);
                  }}
                />
                <span className="checkbox-text">
                  Replace All (delete ALL existing concepts in subcategory)
                </span>
              </label>
              {replaceAll && (
                <div className="warning-text">
                  ⚠️ This will permanently delete all existing concepts in the selected subcategory before importing new ones.
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button
              onClick={handleImport}
              disabled={!selectedFile || !subcategoryId || importing}
              className="btn btn-primary"
            >
              {importing ? (
                <FontAwesomeIcon icon={faSpinner} spin />
              ) : (
                <FontAwesomeIcon icon={faUpload} />
              )}
              {importing ? 'Importing...' : (dryRun ? 'Preview Import' : 'Import Concepts')}
            </button>
            <button
              onClick={clearForm}
              disabled={importing}
              className="btn btn-secondary"
            >
              Clear
            </button>
          </div>
        </div>

        {/* File Preview */}
        {filePreview && (
          <div className="preview-card">
            <h3>File Preview</h3>
            <div className="preview-stats">
              <span className="stat">
                <FontAwesomeIcon icon={faList} />
                {filePreview.length} concepts
              </span>
            </div>
            <div className="preview-list">
              {filePreview.slice(0, 5).map((concept, index) => (
                <div key={index} className="preview-item">
                  <div className="preview-item-header">
                    <strong>{concept.name}</strong>
                    <code>{concept.conceptId}</code>
                  </div>
                  <div className="preview-item-description">
                    {concept.description}
                  </div>
                </div>
              ))}
              {filePreview.length > 5 && (
                <div className="preview-more">
                  +{filePreview.length - 5} more concepts...
                </div>
              )}
            </div>
          </div>
        )}

        {/* Results */}
        {results && (
          <div className="results-card">
            <h3>
              {results.dryRun ? 'Import Preview Results' : 'Import Results'}
            </h3>
            <div className="results-summary">
              <div className="result-stat">
                <span className="stat-label">Total Concepts:</span>
                <span className="stat-value">{results.total}</span>
              </div>
              <div className="result-stat">
                <span className="stat-label">Valid:</span>
                <span className="stat-value success">{results.valid}</span>
              </div>
              <div className="result-stat">
                <span className="stat-label">Invalid:</span>
                <span className="stat-value error">{results.invalid}</span>
              </div>
              <div className="result-stat">
                <span className="stat-label">Skipped:</span>
                <span className="stat-value warning">{results.skipped}</span>
              </div>
              {results.replaceAll && (
                <div className="result-stat">
                  <span className="stat-label">{results.dryRun ? 'Would Delete' : 'Deleted'}:</span>
                  <span className="stat-value warning">{results.deleted || 0}</span>
                </div>
              )}
              <div className="result-stat">
                <span className="stat-label">{results.dryRun ? 'Would Import' : 'Imported'}:</span>
                <span className="stat-value success">{results.imported}</span>
              </div>
            </div>

            {results.errors && results.errors.length > 0 && (
              <div className="results-errors">
                <h4>Errors:</h4>
                <ul>
                  {results.errors.map((error, index) => (
                    <li key={index} className="error-item">{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {results.dryRun && results.imported > 0 && (
              <div className="dry-run-notice">
                <FontAwesomeIcon icon={faExclamationTriangle} />
                This was a preview. Uncheck "Dry Run" and import again to save to database.
              </div>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="error-card">
            <FontAwesomeIcon icon={faExclamationTriangle} />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
} 