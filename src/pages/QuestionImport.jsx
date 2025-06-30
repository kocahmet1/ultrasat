/**
 * Question Import Interface
 * Allows admins to upload and import questions from JSON files with validation and preview
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
  faTrash,
  faEye,
  faQuestionCircle
} from '@fortawesome/free-solid-svg-icons';
import { getSubcategoriesArray, getKebabCaseFromAnyFormat, getSubcategoryIdFromString } from '../utils/subcategoryConstants';
import '../styles/QuestionImport.css';

export default function QuestionImport() {
  const { currentUser } = useAuth();
  const fileInputRef = useRef(null);
  
  // State management
  const [selectedFile, setSelectedFile] = useState(null);
  const [usageContext, setUsageContext] = useState('general');
  const [importing, setImporting] = useState(false);
  const [dryRun, setDryRun] = useState(true);
  const [forceOverwrite, setForceOverwrite] = useState(false);
  const [skipInvalid, setSkipInvalid] = useState(true);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [filePreview, setFilePreview] = useState(null);

  // Available subcategories for validation
  const subcategories = getSubcategoriesArray();

  // Enhanced JSON validation helper
  const validateJsonSyntax = (jsonString) => {
    const errors = [];
    
    // Check for common JSON syntax issues
    const lines = jsonString.split('\n');
    
    lines.forEach((line, lineIndex) => {
      const trimmedLine = line.trim();
      
      // Check for trailing commas
      if (trimmedLine.match(/,\s*[}\]]/)) {
        errors.push({
          line: lineIndex + 1,
          issue: 'Trailing comma before closing bracket/brace',
          suggestion: 'Remove the comma before } or ]'
        });
      }
      
      // Check for unescaped quotes in strings
      const stringMatches = line.match(/"[^"]*"/g);
      if (stringMatches) {
        stringMatches.forEach(match => {
          if (match.includes('\n') || match.includes('\r')) {
            errors.push({
              line: lineIndex + 1,
              issue: 'String contains unescaped newline characters',
              suggestion: 'Use \\n for newlines within strings'
            });
          }
        });
      }
      
      // Check for missing quotes around object keys
      if (trimmedLine.match(/^\s*[a-zA-Z_]\w*\s*:/)) {
        errors.push({
          line: lineIndex + 1,
          issue: 'Object key is not quoted',
          suggestion: 'Object keys must be enclosed in double quotes'
        });
      }
    });
    
    return errors;
  };

  // Handle file selection
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    setResults(null);
    setError(null);

    // Parse and preview the file
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const fileContent = e.target.result;
        
        // First, check for common syntax issues
        const syntaxIssues = validateJsonSyntax(fileContent);
        if (syntaxIssues.length > 0) {
          let errorMessage = 'JSON syntax issues detected:\n\n';
          syntaxIssues.slice(0, 5).forEach(issue => {
            errorMessage += `Line ${issue.line}: ${issue.issue}\n`;
            errorMessage += `  Suggestion: ${issue.suggestion}\n\n`;
          });
          
          if (syntaxIssues.length > 5) {
            errorMessage += `... and ${syntaxIssues.length - 5} more issues\n\n`;
          }
          
          errorMessage += 'Please fix these issues and try again.';
          setError(errorMessage);
          setFilePreview(null);
          return;
        }
        
        const questions = JSON.parse(fileContent);
        
        if (!Array.isArray(questions)) {
          setError('Invalid file format. Expected an array of questions.');
          setFilePreview(null);
          return;
        }

        setFilePreview(questions);
      } catch (parseError) {
        // Enhanced error reporting for JSON syntax errors
        let errorMessage = 'Invalid JSON file. ';
        
        if (parseError.message.includes('position')) {
          // Extract position info from error message
          const positionMatch = parseError.message.match(/position (\d+)/);
          if (positionMatch) {
            const position = parseInt(positionMatch[1]);
            const fileContent = e.target.result;
            const lines = fileContent.substring(0, position).split('\n');
            const lineNumber = lines.length;
            const columnNumber = lines[lines.length - 1].length + 1;
            
            // Get context around the error
            const allLines = fileContent.split('\n');
            const contextStart = Math.max(0, lineNumber - 3);
            const contextEnd = Math.min(allLines.length, lineNumber + 2);
            const contextLines = allLines.slice(contextStart, contextEnd);
            
            errorMessage += `Syntax error at line ${lineNumber}, column ${columnNumber}.\n\n`;
            errorMessage += `Context around the error:\n`;
            
            contextLines.forEach((line, index) => {
              const actualLineNum = contextStart + index + 1;
              const isErrorLine = actualLineNum === lineNumber;
              const prefix = isErrorLine ? '→ ' : '  ';
              errorMessage += `${prefix}${actualLineNum}: ${line}\n`;
              
              if (isErrorLine) {
                errorMessage += `  ${' '.repeat(String(actualLineNum).length + columnNumber)}}^\n`;
              }
            });
            
            errorMessage += `\nError details: ${parseError.message}`;
            
            // Add common fix suggestions
            if (parseError.message.includes('Unexpected token')) {
              errorMessage += '\n\nCommon fixes:\n';
              errorMessage += '• Check for missing commas between array/object elements\n';
              errorMessage += '• Ensure all strings are enclosed in double quotes\n';
              errorMessage += '• Remove trailing commas before closing brackets\n';
              errorMessage += '• Escape special characters in strings (\\n, \\", \\\\)';
            }
          } else {
            errorMessage += `Parse error: ${parseError.message}`;
          }
        } else {
          errorMessage += `Parse error: ${parseError.message}`;
        }
        
        setError(errorMessage);
        setFilePreview(null);
      }
    };
    
    reader.readAsText(file);
  };

  // Handle import
  const handleImport = async () => {
    if (!selectedFile) {
      setError('Please select a file');
      return;
    }

    setImporting(true);
    setError(null);
    setResults(null);

    try {
      const formData = new FormData();
      formData.append('questionsFile', selectedFile);
      formData.append('usageContext', usageContext);
      formData.append('dryRun', dryRun.toString());
      formData.append('forceOverwrite', forceOverwrite.toString());
      formData.append('skipInvalid', skipInvalid.toString());

      const response = await fetch('/api/questions/import', {
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
    setFilePreview(null);
    setResults(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Get validation summary for preview
  const getValidationSummary = () => {
    if (!filePreview) return null;

    let valid = 0;
    let invalid = 0;
    const issues = [];

    filePreview.forEach((question, index) => {
      const questionIssues = [];
      
      // Check required fields
      if (!question.text || typeof question.text !== 'string') {
        questionIssues.push('Missing or invalid question text');
      }
      
      // Determine question type - be smarter about detection
      let questionType = question.questionType;
      
      // If questionType not specified, try to infer from structure
      if (!questionType) {
        if (!question.options || !Array.isArray(question.options) || question.options.length === 0) {
          // No options array suggests user-input question
          questionType = 'user-input';
        } else {
          // Has options array suggests multiple-choice question
          questionType = 'multiple-choice';
        }
      }
      
      // Validate based on question type
      if (questionType === 'multiple-choice') {
        // Multiple choice questions need options
        if (!question.options || !Array.isArray(question.options)) {
          questionIssues.push('Missing or invalid options array');
        } else if (question.options.length < 2) {
          questionIssues.push('Must have at least 2 options');
        } else {
          // Validate individual options
          question.options.forEach((option, optIndex) => {
            if (!option || typeof option !== 'string' || option.trim() === '') {
              questionIssues.push(`Option ${optIndex + 1} is missing or invalid (must be a non-empty string)`);
            }
          });
          
          // Validate correct answer for multiple choice
          if (question.correctAnswer != null) {
            const correctAnswer = question.correctAnswer;
            if (typeof correctAnswer === 'number') {
              if (correctAnswer < 0 || correctAnswer >= question.options.length) {
                questionIssues.push(`Correct answer index ${correctAnswer} is out of range`);
              }
            } else if (typeof correctAnswer === 'string') {
              if (!question.options.includes(correctAnswer)) {
                questionIssues.push(`Correct answer "${correctAnswer}" does not match any option`);
              }
            } else {
              questionIssues.push(`Correct answer must be a number (index) or string (text)`);
            }
          }
        }
      } else if (questionType === 'user-input') {
        // User input questions validation
        if (question.inputType && !['number', 'text', 'fraction'].includes(question.inputType)) {
          questionIssues.push('Invalid inputType (must be number, text, or fraction)');
        }
        
        // Validate acceptedAnswers if present
        if (question.acceptedAnswers && !Array.isArray(question.acceptedAnswers)) {
          questionIssues.push('acceptedAnswers must be an array if provided');
        }
      } else {
        questionIssues.push('Invalid questionType (must be multiple-choice or user-input)');
      }
      
      // All questions need a correct answer
      if (question.correctAnswer == null) {
        questionIssues.push('Missing correct answer');
      }
      
      // Validate difficulty if present
      if (question.difficulty && !['easy', 'medium', 'hard'].includes(question.difficulty)) {
        if (typeof question.difficulty !== 'number') {
          questionIssues.push('Invalid difficulty (must be easy, medium, or hard)');
        }
      }

      // Check subcategory
      const subcategorySource = question.subcategory || question.subCategory || question.subcategoryId;
      if (!subcategorySource) {
        questionIssues.push('Missing subcategory');
      } else {
        // Validate subcategory normalization (like server-side does)
        try {
          const normalizedSubcategory = getKebabCaseFromAnyFormat(subcategorySource);
          if (!normalizedSubcategory) {
            questionIssues.push(`Could not normalize subcategory '${subcategorySource}'`);
          }
        } catch (error) {
          questionIssues.push(`Invalid subcategory '${subcategorySource}': ${error.message}`);
        }
      }

      if (questionIssues.length === 0) {
        valid++;
      } else {
        invalid++;
        issues.push({
          index: index + 1,
          text: question.text ? question.text.substring(0, 50) + '...' : 'No text',
          issues: questionIssues
        });
      }
    });

    return { valid, invalid, issues };
  };

  const validationSummary = getValidationSummary();

  return (
    <div className="question-import">
      <div className="import-header">
        <h1>
          <FontAwesomeIcon icon={faUpload} className="page-icon" />
          Import Questions
        </h1>
        <p className="page-description">
          Upload JSON files containing questions with validation and preview
        </p>
      </div>

      <div className="import-container">
        <div className="import-form-card">
          <h2>Upload Questions</h2>
          
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

          {/* Usage Context Selection */}
          <div className="form-group">
            <label htmlFor="usage-context" className="form-label">
              <FontAwesomeIcon icon={faQuestionCircle} /> Usage Context
            </label>
            <select
              id="usage-context"
              value={usageContext}
              onChange={(e) => setUsageContext(e.target.value)}
              className="form-select"
            >
              <option value="general">General Use</option>
              <option value="exam">Practice Exam Only</option>
            </select>
            <div className="form-help">
              Choose how these questions will be used in the system
            </div>
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
                  onChange={(e) => setForceOverwrite(e.target.checked)}
                />
                <span className="checkbox-text">
                  Force Overwrite (replace existing questions with same ID)
                </span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={skipInvalid}
                  onChange={(e) => setSkipInvalid(e.target.checked)}
                />
                <span className="checkbox-text">
                  Skip Invalid (continue import even if some questions are invalid)
                </span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button
              onClick={handleImport}
              disabled={!selectedFile || importing}
              className="btn btn-primary"
            >
              {importing ? (
                <FontAwesomeIcon icon={faSpinner} spin />
              ) : (
                <FontAwesomeIcon icon={faUpload} />
              )}
              {importing ? 'Importing...' : (dryRun ? 'Preview Import' : 'Import Questions')}
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
            <h3>
              <FontAwesomeIcon icon={faEye} /> File Preview
            </h3>
            <div className="preview-stats">
              <span className="stat">
                <FontAwesomeIcon icon={faList} />
                {filePreview.length} questions
              </span>
              {validationSummary && (
                <>
                  <span className="stat success">
                    <FontAwesomeIcon icon={faCheckCircle} />
                    {validationSummary.valid} valid
                  </span>
                  <span className="stat error">
                    <FontAwesomeIcon icon={faExclamationTriangle} />
                    {validationSummary.invalid} invalid
                  </span>
                </>
              )}
            </div>
            
            {validationSummary && validationSummary.invalid > 0 && (
              <div className="validation-issues">
                <h4>Validation Issues:</h4>
                <div className="issues-list">
                  {validationSummary.issues.slice(0, 5).map((issue, index) => (
                    <div key={index} className="issue-item">
                      <div className="issue-header">
                        <strong>Question {issue.index}:</strong> {issue.text}
                      </div>
                      <ul className="issue-details">
                        {issue.issues.map((detail, i) => (
                          <li key={i}>{detail}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  {validationSummary.issues.length > 5 && (
                    <div className="more-issues">
                      +{validationSummary.issues.length - 5} more issues...
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="preview-list">
              {filePreview.slice(0, 3).map((question, index) => (
                <div key={index} className="preview-item">
                  <div className="preview-item-header">
                    <strong>Question {index + 1}</strong>
                    <span className="difficulty-badge">{question.difficulty || 'medium'}</span>
                  </div>
                  <div className="preview-item-text">
                    {question.text ? question.text.substring(0, 100) + '...' : 'No text'}
                  </div>
                  <div className="preview-item-meta">
                    <span>Options: {question.options ? question.options.length : 0}</span>
                    <span>Subcategory: {question.subcategory || question.subCategory || 'None'}</span>
                  </div>
                </div>
              ))}
              {filePreview.length > 3 && (
                <div className="preview-more">
                  +{filePreview.length - 3} more questions...
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
                <span className="stat-label">Total Questions:</span>
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

            {results.warnings && results.warnings.length > 0 && (
              <div className="results-warnings">
                <h4>Warnings:</h4>
                <ul>
                  {results.warnings.map((warning, index) => (
                    <li key={index} className="warning-item">{warning}</li>
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
            <div className="error-content">
              <div className="error-title">Import Error</div>
              <pre className="error-message">{error}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 