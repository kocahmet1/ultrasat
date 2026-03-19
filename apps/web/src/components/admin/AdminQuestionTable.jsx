import React from 'react';

function getQuestionSubcategoryName(question, allSubcategories) {
  if (question.subCategory) {
    return question.subCategory;
  }

  if (!question.subcategoryId || !allSubcategories) {
    return null;
  }

  const matchingSubcategory = allSubcategories.find(subcategory => subcategory.id === question.subcategoryId);
  return matchingSubcategory ? matchingSubcategory.name : `Category ID: ${question.subcategoryId}`;
}

function getUsageContextLabel(question) {
  if (question.usageContext === undefined) {
    return 'undefined';
  }

  if (question.usageContext === null) {
    return 'null';
  }

  if (question.usageContext === '') {
    return 'empty';
  }

  return question.usageContext || 'undefined';
}

function formatCreatedAt(createdAt) {
  if (!createdAt) {
    return 'Unknown';
  }

  return new Date(createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function AdminQuestionTable({
  allCurrentPageSelected,
  allSubcategories,
  currentPage,
  currentPageQuestions,
  endIndex,
  filteredQuestions,
  goToNextPage,
  goToPage,
  goToPreviousPage,
  onDeleteQuestion,
  onEditQuestion,
  onSelectAll,
  onToggleSelectQuestion,
  onViewQuestionDetails,
  selectedQuestionIds,
  startIndex,
  totalPages
}) {
  if (filteredQuestions.length === 0) {
    return (
      <div className="questions-list">
        <div className="no-results">
          <p>No questions found matching your criteria.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="questions-list">
      <table className="questions-table">
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={allCurrentPageSelected}
                onChange={onSelectAll}
                title="Select/Deselect All Questions on This Page"
              />
            </th>
            <th>Question</th>
            <th>Difficulty</th>
            <th>Subcategories</th>
            <th>Context</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentPageQuestions.map(question => {
            const subcategoryName = getQuestionSubcategoryName(question, allSubcategories);
            const usageContextLabel = getUsageContextLabel(question);

            return (
              <tr key={question.id} className="question-row">
                <td className="question-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedQuestionIds.includes(question.id)}
                    onChange={() => onToggleSelectQuestion(question.id)}
                  />
                </td>
                <td className="question-text" onClick={() => onViewQuestionDetails(question)}>
                  <div className="truncated-text">{question.text}</div>
                  <div className="question-id">ID: {question.id}</div>
                </td>
                <td className="question-difficulty">
                  {question.difficulty || 'N/A'}
                </td>
                <td className="question-subcategories">
                  {subcategoryName ? (
                    <div className="subcategories-container">
                      <span className="subcategory-tag">{subcategoryName}</span>
                    </div>
                  ) : (
                    <span className="no-subcategory">No subcategory assigned</span>
                  )}
                </td>
                <td className="question-context">
                  <span className={`context-badge ${question.usageContext || 'undefined'}`}>
                    {usageContextLabel}
                  </span>
                </td>
                <td className="question-creation-date">
                  {formatCreatedAt(question.createdAt)}
                </td>
                <td className="question-actions">
                  <button
                    className="action-button view-button"
                    onClick={() => onViewQuestionDetails(question)}
                    title="View Details"
                  >
                    View
                  </button>
                  <button
                    className="action-button edit-button"
                    onClick={() => onEditQuestion(question.id)}
                    title="Edit Question"
                  >
                    Edit
                  </button>
                  <button
                    className="action-button delete-button"
                    onClick={() => onDeleteQuestion(question.id)}
                    title="Delete Question"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="pagination-controls">
          <div className="pagination-info">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredQuestions.length)} of {filteredQuestions.length} questions
          </div>
          <div className="pagination-buttons">
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className="pagination-button"
            >
              Previous
            </button>

            <div className="page-numbers">
              {Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
                let pageNumber;

                if (totalPages <= 5) {
                  pageNumber = index + 1;
                } else if (currentPage <= 3) {
                  pageNumber = index + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNumber = totalPages - 4 + index;
                } else {
                  pageNumber = currentPage - 2 + index;
                }

                return (
                  <button
                    key={pageNumber}
                    onClick={() => goToPage(pageNumber)}
                    className={`page-button ${currentPage === pageNumber ? 'active' : ''}`}
                  >
                    {pageNumber}
                  </button>
                );
              })}
            </div>

            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="pagination-button"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminQuestionTable;
