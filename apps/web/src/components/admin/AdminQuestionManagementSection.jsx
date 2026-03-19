import React from 'react';
import AdminQuestionBulkOperations from './AdminQuestionBulkOperations';
import AdminQuestionDeleteModal from './AdminQuestionDeleteModal';
import AdminQuestionDetailsModal from './AdminQuestionDetailsModal';
import AdminQuestionFilters from './AdminQuestionFilters';
import AdminQuestionTable from './AdminQuestionTable';

function AdminQuestionManagementSection({
  allCurrentPageSelected,
  allSubcategories,
  closeQuestionDetails,
  currentPage,
  currentPageQuestions,
  difficultyFilter,
  endIndex,
  exportSubcategory,
  filteredQuestions,
  goToNextPage,
  goToPage,
  goToPreviousPage,
  handleConvertSelectedToGeneral,
  handleCreateQuestion,
  handleDeleteQuestion,
  handleDeleteSelected,
  handleEditQuestion,
  handleImportQuestions,
  handleSelectAll,
  handleToggleSelectQuestion,
  handleViewQuestionDetails,
  importUsageContext,
  isConfirmDeleteModalOpen,
  onCancelDeleteSelected,
  onConfirmDeleteSelected,
  questions,
  searchTerm,
  selectedQuestion,
  selectedQuestionIds,
  setDifficultyFilter,
  setExportSubcategory,
  setImportUsageContext,
  setSearchTerm,
  setSubcategoryFilter,
  skillTags,
  startIndex,
  subcategoryFilter,
  subcategories,
  subcategoriesLoading,
  totalPages,
  uniqueSubcategories
}) {
  return (
    <>
      {isConfirmDeleteModalOpen && (
        <AdminQuestionDeleteModal
          count={selectedQuestionIds.length}
          onCancel={onCancelDeleteSelected}
          onConfirm={onConfirmDeleteSelected}
        />
      )}

      {selectedQuestion && (
        <AdminQuestionDetailsModal
          onClose={closeQuestionDetails}
          onEditQuestion={handleEditQuestion}
          question={selectedQuestion}
          skillTags={skillTags}
        />
      )}

      <div className="questions-tab">
        <div className="tab-header-controls">
          <h2>Manage Questions ({filteredQuestions.length} total, showing {currentPageQuestions.length} on page {currentPage} of {totalPages})</h2>
          <div className="actions">
            <button onClick={handleCreateQuestion} className="button-primary">Create New Question</button>
            {selectedQuestionIds.length > 0 && (
              <>
                <button onClick={handleConvertSelectedToGeneral} className="button-secondary">
                  Convert to General ({selectedQuestionIds.length})
                </button>
                <button onClick={handleDeleteSelected} className="button-danger">
                  Delete Selected ({selectedQuestionIds.length})
                </button>
              </>
            )}
          </div>
        </div>

        <AdminQuestionBulkOperations
          exportSubcategory={exportSubcategory}
          importUsageContext={importUsageContext}
          onExportSubcategoryChange={setExportSubcategory}
          onImportQuestions={handleImportQuestions}
          onImportUsageContextChange={setImportUsageContext}
          questions={questions}
          uniqueSubcategories={uniqueSubcategories}
        />

        <AdminQuestionFilters
          difficultyFilter={difficultyFilter}
          onDifficultyFilterChange={setDifficultyFilter}
          onSearchTermChange={setSearchTerm}
          onSubcategoryFilterChange={setSubcategoryFilter}
          searchTerm={searchTerm}
          subcategories={subcategories}
          subcategoriesLoading={subcategoriesLoading}
          subcategoryFilter={subcategoryFilter}
        />

        <AdminQuestionTable
          allCurrentPageSelected={allCurrentPageSelected}
          allSubcategories={allSubcategories}
          currentPage={currentPage}
          currentPageQuestions={currentPageQuestions}
          endIndex={endIndex}
          filteredQuestions={filteredQuestions}
          goToNextPage={goToNextPage}
          goToPage={goToPage}
          goToPreviousPage={goToPreviousPage}
          onDeleteQuestion={handleDeleteQuestion}
          onEditQuestion={handleEditQuestion}
          onSelectAll={handleSelectAll}
          onToggleSelectQuestion={handleToggleSelectQuestion}
          onViewQuestionDetails={handleViewQuestionDetails}
          selectedQuestionIds={selectedQuestionIds}
          startIndex={startIndex}
          totalPages={totalPages}
        />
      </div>
    </>
  );
}

export default AdminQuestionManagementSection;
