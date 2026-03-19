import React from 'react';
import ExamModuleManager from '../ExamModuleManager';

function AdminExamModulesSection({
  onGoToPracticeExamManager,
  onRepairModuleData
}) {
  return (
    <div className="exam-modules-tab">
      <div className="tab-header">
        <h2>Exam Module Management</h2>
        <div className="tab-actions">
          <button
            className="secondary-button"
            onClick={onGoToPracticeExamManager}
          >
            Go to Practice Exam Manager
          </button>
          <button
            className="primary-button repair-button"
            onClick={onRepairModuleData}
          >
            Repair Module Data
          </button>
        </div>
      </div>
      <div className="tab-subheader">
        <p>Create individual exam modules first, then combine them into full practice exams using the Practice Exam Manager.</p>
      </div>
      <ExamModuleManager />
    </div>
  );
}

export default AdminExamModulesSection;
