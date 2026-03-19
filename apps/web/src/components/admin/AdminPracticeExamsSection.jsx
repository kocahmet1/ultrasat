import React from 'react';
import PracticeExamManager from '../PracticeExamManager';

function AdminPracticeExamsSection({ onRepairPracticeExamData }) {
  return (
    <div className="practice-exams-tab">
      <div className="tab-header">
        <h2>Practice Exam Management</h2>
        <p>Create and manage practice exams by combining existing modules</p>
        <div className="repair-section">
          <button
            className="primary-button repair-button"
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
