import React, { useState } from 'react';
import Modal from './Modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFlag, faSpinner } from '@fortawesome/free-solid-svg-icons';
import '../styles/ReportQuestionModal.css';

const ReportQuestionModal = ({ isOpen, onClose, onReport, loading = false }) => {
  const [reportReason, setReportReason] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (onReport) {
      await onReport(reportReason.trim());
    }
  };

  const handleClose = () => {
    setReportReason('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Report Question">
      <div className="report-question-modal">
        <div className="report-icon">
          <FontAwesomeIcon icon={faFlag} />
        </div>
        
        <div className="report-description">
          <p>Help us improve by reporting issues with this question.</p>
          <p>Please describe the problem (optional):</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="report-input-section">
            <textarea
              className="report-textarea"
              placeholder="Describe the issue (e.g., incorrect answer, unclear question, typo)..."
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              rows={4}
              maxLength={500}
              disabled={loading}
            />
            <div className="character-count">
              {reportReason.length}/500
            </div>
          </div>

          <div className="report-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="confirm-report-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin />
                  <span>Reporting...</span>
                </>
              ) : (
                'Confirm Report'
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default ReportQuestionModal; 