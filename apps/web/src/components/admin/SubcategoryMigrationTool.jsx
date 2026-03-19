import React, { useState } from 'react';
import { migrateNumericToKebabCase } from '../../scripts/migrateSubcategoryStats';
import { Card, Button, Alert, Spinner, Badge } from 'react-bootstrap';

/**
 * Component for admin users to run the subcategory migration script
 * Converts numeric ID-based subcategory stats to kebab-case format
 */
function SubcategoryMigrationTool() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const runMigration = async () => {
    if (isRunning) return;
    
    setIsRunning(true);
    setError(null);
    setResults(null);
    
    try {
      const migrationResults = await migrateNumericToKebabCase();
      setResults(migrationResults);
    } catch (err) {
      console.error('Migration failed:', err);
      setError(err.message);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Card className="mb-4">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Subcategory ID Migration Tool</h5>
        <Badge bg="info">Admin Only</Badge>
      </Card.Header>
      <Card.Body>
        <p>
          This tool migrates numeric subcategory IDs in the userSubcategoryStats collection to use 
          kebab-case IDs (e.g., "1" → "central-ideas-details"), which is now the canonical identifier throughout the app.
        </p>
        
        <div className="alert alert-info">
          <i className="fas fa-info-circle me-2"></i>
          <strong>Note:</strong> This migration is a one-time operation to standardize on kebab-case as the canonical identifier.
          The app has been updated to use kebab-case for all new documents.
        </div>
        
        {error && (
          <Alert variant="danger" className="my-3">
            <i className="fas fa-exclamation-triangle me-2"></i>
            <strong>Error:</strong> {error}
          </Alert>
        )}
        
        {results && (
          <div className="mt-3">
            <h6>Migration Results:</h6>
            <ul className="list-group">
              <li className="list-group-item d-flex justify-content-between align-items-center">
                Total documents scanned
                <Badge bg="secondary">{results.totalDocs}</Badge>
              </li>
              <li className="list-group-item d-flex justify-content-between align-items-center">
                Documents with numeric IDs
                <Badge bg="primary">{results.numericIdDocs}</Badge>
              </li>
              <li className="list-group-item d-flex justify-content-between align-items-center">
                Successfully migrated
                <Badge bg="success">{results.migratedDocs}</Badge>
              </li>
              <li className="list-group-item d-flex justify-content-between align-items-center">
                Errors
                <Badge bg={results.errorDocs > 0 ? "danger" : "secondary"}>{results.errorDocs}</Badge>
              </li>
            </ul>
          </div>
        )}
        
        <div className="d-grid gap-2 mt-3">
          <Button 
            variant="primary" 
            onClick={runMigration} 
            disabled={isRunning}
          >
            {isRunning ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Running Migration...
              </>
            ) : 'Run Migration'}
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}

export default SubcategoryMigrationTool;
