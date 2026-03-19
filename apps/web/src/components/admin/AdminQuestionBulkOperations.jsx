import React, { useRef } from 'react';
import { exportQuestionsAsJSON } from '../../utils/exportUtils';

function AdminQuestionBulkOperations({
  exportSubcategory,
  importUsageContext,
  onExportSubcategoryChange,
  onImportQuestions,
  onImportUsageContextChange,
  questions,
  uniqueSubcategories
}) {
  const importInputRef = useRef(null);

  return (
    <div className="bulk-operations admin-card-group" style={{ display: 'flex', gap: '20px', margin: '20px 0' }}>
      <div className="import-questions-section admin-card" style={{ flex: 1, padding: '20px' }}>
        <h3>Import Questions from JSON</h3>
        <div className="form-group" style={{ marginBottom: '15px' }}>
          <label htmlFor="import-usage-context" style={{ display: 'block', marginBottom: '5px' }}>Import as:</label>
          <select
            id="import-usage-context"
            value={importUsageContext}
            onChange={(event) => onImportUsageContextChange(event.target.value)}
            className="form-control"
          >
            <option value="general">General Use</option>
            <option value="exam">Practice Exam Only</option>
          </select>
        </div>
        <input
          ref={importInputRef}
          type="file"
          onChange={onImportQuestions}
          accept=".json"
          style={{ display: 'none' }}
        />
        <button
          onClick={() => importInputRef.current?.click()}
          className="button-secondary"
          style={{ width: '100%' }}
        >
          Choose File & Import
        </button>
      </div>

      <div className="export-questions-section admin-card" style={{ flex: 1, padding: '20px' }}>
        <h3>Export Questions to JSON</h3>
        <div className="form-group" style={{ marginBottom: '15px' }}>
          <label htmlFor="export-subcategory-select" style={{ display: 'block', marginBottom: '5px' }}>Filter by Subcategory:</label>
          <select
            id="export-subcategory-select"
            value={exportSubcategory}
            onChange={(event) => onExportSubcategoryChange(event.target.value)}
            className="form-control"
          >
            {uniqueSubcategories.map(subcategoryOption => (
              <option key={subcategoryOption.value} value={subcategoryOption.value}>
                {subcategoryOption.display}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={() => exportQuestionsAsJSON(questions, exportSubcategory)}
          className="button-primary"
          style={{ width: '100%' }}
        >
          Export Questions
        </button>
      </div>
    </div>
  );
}

export default AdminQuestionBulkOperations;
