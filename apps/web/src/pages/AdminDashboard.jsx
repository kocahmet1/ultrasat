import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminAiContentSection from '../components/admin/AdminAiContentSection';
import AdminExamModulesSection from '../components/admin/AdminExamModulesSection';
import AdminFeatureFlagsSection from '../components/admin/AdminFeatureFlagsSection';
import AdminMaintenanceSection from '../components/admin/AdminMaintenanceSection';
import AdminPracticeExamsSection from '../components/admin/AdminPracticeExamsSection';
import AdminQuestionManagementSection from '../components/admin/AdminQuestionManagementSection';
import AdminSkillManagementSection from '../components/admin/AdminSkillManagementSection';
import AdminSmartQuizActivitySection from '../components/admin/AdminSmartQuizActivitySection';
import SubcategorySettings from '../components/admin/SubcategorySettings';
import UserActivityTracker from '../components/UserActivityTracker';
import { useAuth } from '../contexts/AuthContext';
import { useSubcategories } from '../contexts/SubcategoryContext';
import useAdminDashboardData from '../hooks/admin/useAdminDashboardData';
import useAdminDiagnostics from '../hooks/admin/useAdminDiagnostics';
import useAdminQuestionManagement from '../hooks/admin/useAdminQuestionManagement';
import useAdminSmartQuizActivity from '../hooks/admin/useAdminSmartQuizActivity';

import '../styles/AdminDashboard.css';

function AdminDashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { allSubcategories, loading: subcategoriesLoading } = useSubcategories();
  const [activeTab, setActiveTab] = useState('questions');

  const {
    isAdmin,
    isGraphGenerationAvailable,
    isLoading,
    setIsLoading,
    skillTags,
    subcategories
  } = useAdminDashboardData({
    allSubcategories,
    currentUser
  });
  const {
    handleMoveQuestion,
    handleRemoveQuestionFromQuiz,
    handleSelectQuiz,
    quizQuestions,
    quizzes,
    selectedQuiz,
    syncDeletedQuestionsInSelectedQuiz
  } = useAdminSmartQuizActivity({ isAdmin });
  const {
    allCurrentPageSelected,
    cancelDeleteSelected,
    closeQuestionDetails,
    confirmDeleteSelected,
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
    migrateExistingQuestions,
    questions,
    searchTerm,
    selectedQuestion,
    selectedQuestionIds,
    setDifficultyFilter,
    setExportSubcategory,
    setImportUsageContext,
    setSearchTerm,
    setSubcategoryFilter,
    startIndex,
    subcategoryFilter,
    totalPages,
    uniqueSubcategories
  } = useAdminQuestionManagement({
    allSubcategories,
    currentUser,
    isAdmin,
    navigate,
    setIsLoading,
    subcategoriesLoading,
    syncDeletedQuestionsInSelectedQuiz
  });
  const {
    diagnosticLoading,
    diagnosticResults,
    diagnosticSubcategory,
    diagnosticUserId,
    handleDiagnoseQuestionContexts,
    handleRepairExamModuleData,
    handleRepairPracticeExamData,
    handleRunGraphDiagnostic,
    setDiagnosticSubcategory,
    setDiagnosticUserId
  } = useAdminDiagnostics({ setIsLoading });

  if (isLoading) {
    return <div className="loading">Checking permissions...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="admin-dashboard">
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>You do not have permission to access the admin dashboard.</p>
          <button onClick={() => navigate('/')}>Return to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>Admin Dashboard</h1>
        <div className="admin-tabs">
          <button
            className={activeTab === 'questions' ? 'active' : ''}
            onClick={() => setActiveTab('questions')}
          >
            Question Management
          </button>
          <button
            className="tab-button"
            onClick={() => navigate('/admin/question-creation')}
          >
            Question Creation
          </button>
          <button
            className={activeTab === 'quizzes' ? 'active' : ''}
            onClick={() => setActiveTab('quizzes')}
          >
            Smart Quiz Activity
          </button>
          <button
            className={activeTab === 'practiceExams' ? 'active' : ''}
            onClick={() => setActiveTab('practiceExams')}
          >
            Practice Exam Management
          </button>
          <button
            className={activeTab === 'examModules' ? 'active' : ''}
            onClick={() => setActiveTab('examModules')}
          >
            Exam Module Management
          </button>
          <button
            className={`tab-button ${activeTab === 'skills' ? 'active' : ''}`}
            onClick={() => setActiveTab('skills')}
          >
            Skills
          </button>
          <button
            className={`tab-button ${activeTab === 'userActivity' ? 'active' : ''}`}
            onClick={() => setActiveTab('userActivity')}
          >
            User Activity
          </button>
          <button
            className="tab-button"
            onClick={() => navigate('/admin/membership-management')}
          >
            Membership Management
          </button>
          <button
            className="tab-button"
            onClick={() => navigate('/admin/coupon-management')}
          >
            Coupon Management
          </button>
          <button
            className={`tab-button ${activeTab === 'subcategorySettings' ? 'active' : ''}`}
            onClick={() => navigate('/admin/subcategory-settings')}
          >
            Subcategory Settings
          </button>
          <button
            className="tab-button"
            onClick={() => navigate('/admin/concept-import')}
          >
            Import Concepts
          </button>
          <button
            className="tab-button"
            onClick={() => navigate('/admin/question-import')}
          >
            Import Questions
          </button>
          <button
            className="tab-button"
            onClick={() => navigate('/admin/exam-ingestion')}
            style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white' }}
          >
            📄 PDF Exam Ingestion
          </button>
          {isGraphGenerationAvailable && (
            <button
              className="tab-button"
              onClick={() => navigate('/admin/graph-generation')}
            >
              Generate Graphs
            </button>
          )}
          <button
            className="tab-button"
            onClick={() => navigate('/admin/graph-descriptions')}
          >
            Graph Descriptions
          </button>
          <button
            className={`tab-button ${activeTab === 'aiContent' ? 'active' : ''}`}
            onClick={() => navigate('/admin/ai-content')}
          >
            AI Content
          </button>
          <button
            className="tab-button"
            onClick={() => navigate('/admin/blog-management')}
          >
            Blog Management
          </button>
          <button
            className="tab-button"
            onClick={() => navigate('/admin/reported-questions')}
          >
            Reported Questions
          </button>
          <button
            className={`tab-button ${activeTab === 'maintenance' ? 'active' : ''}`}
            onClick={() => setActiveTab('maintenance')}
          >
            Maintenance
          </button>
          <button
            className={`tab-button ${activeTab === 'featureFlags' ? 'active' : ''}`}
            onClick={() => setActiveTab('featureFlags')}
          >
            Feature Flags
          </button>
        </div>
      </header>

      <div className="admin-content">
        {activeTab === 'questions' && (
          <AdminQuestionManagementSection
            allCurrentPageSelected={allCurrentPageSelected}
            allSubcategories={allSubcategories}
            closeQuestionDetails={closeQuestionDetails}
            currentPage={currentPage}
            currentPageQuestions={currentPageQuestions}
            difficultyFilter={difficultyFilter}
            endIndex={endIndex}
            exportSubcategory={exportSubcategory}
            filteredQuestions={filteredQuestions}
            goToNextPage={goToNextPage}
            goToPage={goToPage}
            goToPreviousPage={goToPreviousPage}
            handleConvertSelectedToGeneral={handleConvertSelectedToGeneral}
            handleCreateQuestion={handleCreateQuestion}
            handleDeleteQuestion={handleDeleteQuestion}
            handleDeleteSelected={handleDeleteSelected}
            handleEditQuestion={handleEditQuestion}
            handleImportQuestions={handleImportQuestions}
            handleSelectAll={handleSelectAll}
            handleToggleSelectQuestion={handleToggleSelectQuestion}
            handleViewQuestionDetails={handleViewQuestionDetails}
            importUsageContext={importUsageContext}
            isConfirmDeleteModalOpen={isConfirmDeleteModalOpen}
            onCancelDeleteSelected={cancelDeleteSelected}
            onConfirmDeleteSelected={confirmDeleteSelected}
            questions={questions}
            searchTerm={searchTerm}
            selectedQuestion={selectedQuestion}
            selectedQuestionIds={selectedQuestionIds}
            setDifficultyFilter={setDifficultyFilter}
            setExportSubcategory={setExportSubcategory}
            setImportUsageContext={setImportUsageContext}
            setSearchTerm={setSearchTerm}
            setSubcategoryFilter={setSubcategoryFilter}
            skillTags={skillTags}
            startIndex={startIndex}
            subcategoryFilter={subcategoryFilter}
            subcategories={subcategories}
            subcategoriesLoading={subcategoriesLoading}
            totalPages={totalPages}
            uniqueSubcategories={uniqueSubcategories}
          />
        )}
        {activeTab === 'subcategorySettings' && (
          <div className="admin-content">
            <h2>Subcategory Settings</h2>
            <SubcategorySettings />
          </div>
        )}

        {/* Smart Quiz Activity Tab */}
        {activeTab === 'quizzes' && (
          <AdminSmartQuizActivitySection
            allSubcategories={allSubcategories}
            handleMoveQuestion={handleMoveQuestion}
            handleRemoveQuestionFromQuiz={handleRemoveQuestionFromQuiz}
            handleSelectQuiz={handleSelectQuiz}
            quizQuestions={quizQuestions}
            quizzes={quizzes}
            selectedQuiz={selectedQuiz}
          />
        )}

        {/* Exam Module Management Tab */}
        {activeTab === 'examModules' && (
          <AdminExamModulesSection
            onGoToPracticeExamManager={() => navigate('/admin/practice-exams')}
            onRepairModuleData={handleRepairExamModuleData}
          />
        )}

        {/* Practice Exam Management Tab */}
        {activeTab === 'practiceExams' && (
          <AdminPracticeExamsSection
            onRepairPracticeExamData={handleRepairPracticeExamData}
          />
        )}

        {/* AI Content Tab */}
        {activeTab === 'aiContent' && (
          <AdminAiContentSection
            onGoToAiContentManager={() => navigate('/admin/ai-content')}
          />
        )}

        {/* Maintenance Tab */}
        {activeTab === 'maintenance' && (
          <AdminMaintenanceSection
            onDiagnoseQuestionContexts={handleDiagnoseQuestionContexts}
            onMigrateQuestions={migrateExistingQuestions}
            onRepairExamModules={handleRepairExamModuleData}
            onRepairPracticeExams={handleRepairPracticeExamData}
          />
        )}

        {/* Feature Flags Tab */}
        {activeTab === 'featureFlags' && (
          <AdminFeatureFlagsSection
            diagnosticLoading={diagnosticLoading}
            diagnosticResults={diagnosticResults}
            diagnosticSubcategory={diagnosticSubcategory}
            diagnosticUserId={diagnosticUserId}
            onDiagnosticSubcategoryChange={setDiagnosticSubcategory}
            onDiagnosticUserIdChange={setDiagnosticUserId}
            onRunGraphDiagnostic={handleRunGraphDiagnostic}
          />
        )}

        {/* Skill Management Tab */}
        {activeTab === 'skills' && (
          <AdminSkillManagementSection
            onCreateSkill={() => navigate('/admin/skill-editor')}
            onEditSkill={(skillId) => navigate(`/admin/skill-editor/${skillId}`)}
            skillTags={skillTags}
          />
        )}

        {/* User Activity Tracker Tab */}
        {activeTab === 'userActivity' && (
          <div className="user-activity-tab">
            <UserActivityTracker />
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
