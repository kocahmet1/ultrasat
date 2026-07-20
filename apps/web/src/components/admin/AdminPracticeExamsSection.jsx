import React from 'react';
import PracticeExamManager from '../PracticeExamManager';

function AdminPracticeExamsSection({
  onGoToExamQualityControl,
  onRepairPracticeExamData,
}) {
  return (
    <div className="practice-exams-tab">
      <div className="tab-header">
        <div>
          <h2>Practice Exam Management</h2>
          <p>Create and manage practice exams by combining existing modules</p>
        </div>
        <div className="tab-actions">
          <button
            className="primary-button"
            type="button"
            onClick={onGoToExamQualityControl}
          >
            Open Exam Quality Control
          </button>
          <button
            className="secondary-button"
            type="button"
            onClick={onRepairPracticeExamData}
          >
            Repair Practice Exam Data
          </button>
        </div>
      </div>
      <PracticeExamManager />
    </div>
  );
}

export default AdminPracticeExamsSection;
