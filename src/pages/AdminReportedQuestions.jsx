import React, { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faEdit, faEye, faCheck, faTimes, faFlag, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { getReportedQuestions, deleteReportedQuestion, dismissReport, updateReportedQuestion } from '../api/reportClient';
import { toast } from 'react-toastify';
import Modal from '../components/Modal';
import ConfirmationModal from '../components/ConfirmationModal';
import '../styles/AdminReportedQuestions.css';

const AdminReportedQuestions = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedReport, setSelectedReport] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [editedQuestion, setEditedQuestion] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalReports, setTotalReports] = useState(0);

  const REPORTS_PER_PAGE = 25; // Reduced from default 50 for faster loading

  const fetchReports = useCallback(async (page = 0, append = false) => {
    try {
      if (!append) setLoading(true);
      
      const offset = page * REPORTS_PER_PAGE;
      const response = await getReportedQuestions(statusFilter, REPORTS_PER_PAGE, offset);
      
      if (append) {
        setReports(prev => [...prev, ...response.reports]);
      } else {
        setReports(response.reports);
      }
      
      setHasMore(response.hasMore);
      setTotalReports(response.total || response.reports.length);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to fetch reported questions');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    setCurrentPage(0);
    fetchReports(0, false);
  }, [statusFilter, fetchReports]);

  const loadMoreReports = () => {
    if (hasMore && !loading) {
      fetchReports(currentPage + 1, true);
    }
  };

  const handleViewReport = (report) => {
    setSelectedReport(report);
    setIsViewModalOpen(true);
  };

  const handleDeleteQuestion = async () => {
    if (!selectedReport) return;

    try {
      setActionLoading(true);
      await deleteReportedQuestion(selectedReport.questionId, selectedReport.id);
      toast.success('Question deleted successfully');
      setIsDeleteModalOpen(false);
      setSelectedReport(null);
      // Optimistically remove from UI instead of refetching all
      setReports(prev => prev.filter(r => r.id !== selectedReport.id));
    } catch (error) {
      console.error('Error deleting question:', error);
      toast.error(error.message || 'Failed to delete question');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditQuestion = (report) => {
    setSelectedReport(report);
    setEditedQuestion({
      text: report.question.text,
      options: report.question.options,
      correctAnswer: report.question.correctAnswer,
      explanation: report.question.explanation || ''
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedReport || !editedQuestion) return;

    try {
      setActionLoading(true);
      await updateReportedQuestion(selectedReport.questionId, editedQuestion, selectedReport.id);
      toast.success('Question updated successfully');
      setIsEditModalOpen(false);
      setSelectedReport(null);
      setEditedQuestion(null);
      // Optimistically update the report status
      setReports(prev => prev.map(r => 
        r.id === selectedReport.id 
          ? { ...r, status: 'resolved', question: { ...r.question, ...editedQuestion } }
          : r
      ));
    } catch (error) {
      console.error('Error updating question:', error);
      toast.error(error.message || 'Failed to update question');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDismissReport = async (reportId) => {
    try {
      setActionLoading(true);
      await dismissReport(reportId, 'No action needed');
      toast.success('Report dismissed');
      // Optimistically update the report status
      setReports(prev => prev.map(r => 
        r.id === reportId ? { ...r, status: 'dismissed' } : r
      ));
    } catch (error) {
      console.error('Error dismissing report:', error);
      toast.error(error.message || 'Failed to dismiss report');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: '#ffc107', text: 'Pending' },
      resolved: { color: '#28a745', text: 'Resolved' },
      dismissed: { color: '#6c757d', text: 'Dismissed' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span 
        className="status-badge"
        style={{ backgroundColor: config.color }}
      >
        {config.text}
      </span>
    );
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    let date;
    try {
      // Handle Firebase Timestamp objects
      if (timestamp && typeof timestamp.toDate === 'function') {
        date = timestamp.toDate();
      } 
      // Handle Firebase Timestamp objects with seconds/nanoseconds (with or without underscores)
      else if (timestamp && (timestamp.seconds || timestamp._seconds)) {
        const seconds = timestamp.seconds || timestamp._seconds;
        date = new Date(seconds * 1000);
      }
      // Handle regular Date objects
      else if (timestamp instanceof Date) {
        date = timestamp;
      }
      // Handle timestamp numbers or ISO strings
      else {
        date = new Date(timestamp);
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid date timestamp:', timestamp);
        return 'Invalid Date';
      }
      
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    } catch (error) {
      console.error('Error formatting date:', error, timestamp);
      return 'Invalid Date';
    }
  };

  return (
    <div className="admin-reported-questions">
      <div className="page-header">
        <h1>
          <FontAwesomeIcon icon={faFlag} className="page-icon" />
          Reported Questions
        </h1>
        <div className="filter-section">
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="status-filter"
          >
            <option value="all">All Reports</option>
            <option value="pending">Pending</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <FontAwesomeIcon icon={faSpinner} spin size="2x" />
          <p>Loading reported questions...</p>
        </div>
      ) : (
        <div className="reports-container">
          {reports.length === 0 ? (
            <div className="empty-state">
              <FontAwesomeIcon icon={faFlag} size="3x" />
              <h3>No reported questions</h3>
              <p>There are no reported questions matching your current filter.</p>
            </div>
          ) : (
            <div className="reports-grid">
              {reports.map((report) => (
                <div key={report.id} className="report-card">
                  <div className="report-header">
                    <div className="report-info">
                      <span className="report-id">#{report.id.substring(0, 8)}</span>
                      {getStatusBadge(report.status)}
                    </div>
                    <div className="report-date">
                      {formatDate(report.reportedAt)}
                    </div>
                  </div>

                  <div className="report-content">
                    <div className="question-preview">
                      <h4>Question:</h4>
                      <p className="question-text">
                        {report.question?.text?.substring(0, 150)}
                        {report.question?.text?.length > 150 ? '...' : ''}
                      </p>
                    </div>

                    {report.reason && (
                      <div className="report-reason">
                        <h4>Reason:</h4>
                        <p>{report.reason}</p>
                      </div>
                    )}

                    <div className="reporter-info">
                      <strong>Reported by:</strong> {report.reporter?.displayName || 'Unknown'}
                    </div>
                  </div>

                  <div className="report-actions">
                    <button
                      className="action-button view-button"
                      onClick={() => handleViewReport(report)}
                      title="View details"
                    >
                      <FontAwesomeIcon icon={faEye} />
                    </button>
                    
                    {report.status === 'pending' && (
                      <>
                        <button
                          className="action-button edit-button"
                          onClick={() => handleEditQuestion(report)}
                          title="Edit question"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        
                        <button
                          className="action-button dismiss-button"
                          onClick={() => handleDismissReport(report.id)}
                          title="Dismiss report"
                        >
                          <FontAwesomeIcon icon={faTimes} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Load More Button */}
          {hasMore && !loading && (
            <div className="load-more-container">
              <button 
                className="load-more-button"
                onClick={loadMoreReports}
                disabled={loading}
              >
                Load More Reports
              </button>
            </div>
          )}
        </div>
      )}

      {/* View Report Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Report Details"
      >
        {selectedReport && (
          <div className="report-details">
            <div className="detail-section">
              <h3>Question</h3>
              <p className="question-text">{selectedReport.question?.text}</p>
              
              {selectedReport.question?.options && (
                <div className="options-list">
                  <h4>Options:</h4>
                  {selectedReport.question.options.map((option, index) => (
                    <div 
                      key={index} 
                      className={`option-item ${index === selectedReport.question.correctAnswer ? 'correct' : ''}`}
                    >
                      {String.fromCharCode(65 + index)}. {option}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="detail-section">
              <h3>Report Information</h3>
              <p><strong>Status:</strong> {getStatusBadge(selectedReport.status)}</p>
              <p><strong>Reported by:</strong> {selectedReport.reporter?.displayName}</p>
              <p><strong>Reported at:</strong> {formatDate(selectedReport.reportedAt)}</p>
              {selectedReport.reason && (
                <p><strong>Reason:</strong> {selectedReport.reason}</p>
              )}
            </div>

            {selectedReport.reviewer && (
              <div className="detail-section">
                <h3>Review Information</h3>
                <p><strong>Reviewed by:</strong> {selectedReport.reviewer.displayName}</p>
                <p><strong>Reviewed at:</strong> {formatDate(selectedReport.reviewedAt)}</p>
                <p><strong>Resolution:</strong> {selectedReport.resolution}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteQuestion}
        title="Delete Question"
        message="Are you sure you want to delete this question? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        loading={actionLoading}
        dangerous={true}
      />

      {/* Edit Question Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Question"
      >
        {editedQuestion && (
          <div className="edit-question-form">
            <div className="form-group">
              <label>Question Text:</label>
              <textarea
                value={editedQuestion.text}
                onChange={(e) => setEditedQuestion({...editedQuestion, text: e.target.value})}
                rows={4}
                className="form-textarea"
              />
            </div>

            <div className="form-group">
              <label>Options:</label>
              {editedQuestion.options.map((option, index) => (
                <div key={index} className="option-input">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...editedQuestion.options];
                      newOptions[index] = e.target.value;
                      setEditedQuestion({...editedQuestion, options: newOptions});
                    }}
                    className="form-input"
                  />
                </div>
              ))}
            </div>

            <div className="form-group">
              <label>Correct Answer:</label>
              <select
                value={editedQuestion.correctAnswer}
                onChange={(e) => setEditedQuestion({...editedQuestion, correctAnswer: parseInt(e.target.value)})}
                className="form-select"
              >
                {editedQuestion.options.map((_, index) => (
                  <option key={index} value={index}>
                    {String.fromCharCode(65 + index)}. {editedQuestion.options[index]}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-actions">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="cancel-button"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="save-button"
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminReportedQuestions; 