import React from 'react';

function AdminMaintenanceSection({
  onDiagnoseQuestionContexts,
  onMigrateQuestions,
  onRepairExamModules,
  onRepairPracticeExams
}) {
  return (
    <div className="maintenance-tab">
      <h2>Database Maintenance</h2>

      <div className="maintenance-section">
        <h3>Question Subcategory Migration</h3>
        <p>This tool will update all existing questions to use the standardized kebab-case subcategory format, ensuring compatibility with the smart quiz system.</p>
        <button
          onClick={onMigrateQuestions}
          className="button-primary"
          style={{ marginBottom: '20px' }}
        >
          Migrate Question Subcategories
        </button>
      </div>

      <div className="maintenance-section">
        <h3>Practice Exam Data Repair</h3>
        <p>This tool will repair any corrupted practice exam data and ensure all exams have proper module references.</p>
        <button
          onClick={onRepairPracticeExams}
          className="button-secondary"
          style={{ marginBottom: '20px' }}
        >
          Repair Practice Exam Data
        </button>
      </div>

      <div className="maintenance-section">
        <h3>Exam Module Data Repair</h3>
        <p>This tool will repair any corrupted exam module data and ensure all modules have proper question references.</p>
        <button
          onClick={onRepairExamModules}
          className="button-secondary"
        >
          Repair Exam Module Data
        </button>
      </div>

      <div className="maintenance-section">
        <h3>Question Context Diagnostic</h3>
        <p>This tool will analyze the actual usageContext values in the database and show you what's really stored vs what's displayed.</p>
        <button
          onClick={onDiagnoseQuestionContexts}
          className="button-primary"
        >
          Diagnose Question Contexts
        </button>
      </div>
    </div>
  );
}

export default AdminMaintenanceSection;
