import React from 'react';

function AdminQuestionDeleteModal({ count, onCancel, onConfirm }) {
  return (
    <div className="modal-backdrop">
      <div className="confirm-delete-modal">
        <h3>Delete Selected Questions</h3>
        <p>
          Are you sure you want to delete {count} selected questions? This action cannot be undone.
        </p>
        <div className="modal-actions">
          <button className="button-danger" onClick={onConfirm}>Delete</button>
          <button className="button-secondary" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default AdminQuestionDeleteModal;
