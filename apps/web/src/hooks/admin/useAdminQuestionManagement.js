import { useEffect, useState } from 'react';
import {
  bulkDeleteQuestions,
  checkAdminAccess,
  deleteQuestionById,
  fetchAdminQuestions,
  importAdminQuestions,
  migrateQuestionSubcategories,
  updateQuestionUsageContexts
} from '../../firebase/adminDashboardServices';
import {
  buildUniqueSubcategoryOptions,
  filterAdminQuestions
} from '../../utils/adminQuestionManagementUtils';

const QUESTIONS_PER_PAGE = 100;

function getDeleteErrorMessage(error) {
  if (
    error.message.includes('Permission denied') ||
    error.code === 'permission-denied'
  ) {
    return 'Permission denied. This might be a Firebase security rules issue. Please contact support.';
  }

  if (error.message.includes('Admin verification failed')) {
    return 'Admin verification failed. Please refresh the page and try again.';
  }

  if (error.code === 'unavailable') {
    return 'Firebase service temporarily unavailable. Please try again in a moment.';
  }

  if (error.message.includes('network')) {
    return 'Network error. Please check your connection and try again.';
  }

  if (error.message.includes('quota')) {
    return 'Firebase quota exceeded. Please try again later.';
  }

  return 'An error occurred while deleting questions.';
}

function buildImportReportMessage({ correctedCount, importCount, warningCount, warnings }) {
  let reportMessage = `Successfully imported ${importCount} questions.`;

  if (correctedCount > 0) {
    reportMessage += `\n\n${correctedCount} questions had categories corrected to match official Digital SAT format.`;
  }

  if (warningCount > 0) {
    reportMessage += `\n\n${warningCount} questions had warnings:`;
    const displayWarnings = warnings.slice(0, 5);

    if (warnings.length > 5) {
      displayWarnings.push(`...and ${warnings.length - 5} more.`);
    }

    reportMessage += `\n- ${displayWarnings.join('\n- ')}`;
  }

  return reportMessage;
}

function buildMigrationReportMessage({ errorCount, errors, updatedCount }) {
  let resultMessage = 'Migration completed!\n\n';
  resultMessage += `Updated: ${updatedCount} questions\n`;
  resultMessage += `Errors: ${errorCount} questions\n`;

  if (errors.length > 0) {
    resultMessage += '\nFirst 5 errors:\n';
    resultMessage += errors.slice(0, 5).join('\n');

    if (errors.length > 5) {
      resultMessage += `\n...and ${errors.length - 5} more errors.`;
    }
  }

  return resultMessage;
}

function useAdminQuestionManagement({
  allSubcategories,
  currentUser,
  isAdmin,
  navigate,
  setIsLoading,
  subcategoriesLoading,
  syncDeletedQuestionsInSelectedQuiz
}) {
  const [questions, setQuestions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [subcategoryFilter, setSubcategoryFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);
  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
  const [importUsageContext, setImportUsageContext] = useState('general');
  const [exportSubcategory, setExportSubcategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  useEffect(() => {
    let isActive = true;

    const loadQuestions = async () => {
      try {
        const loadedQuestions = await fetchAdminQuestions();

        if (isActive) {
          setQuestions(loadedQuestions);
        }
      } catch (error) {
        console.error('Error loading questions:', error);
      }
    };

    if (!isAdmin) {
      setQuestions([]);

      return () => {
        isActive = false;
      };
    }

    loadQuestions();

    return () => {
      isActive = false;
    };
  }, [isAdmin]);

  useEffect(() => {
    setCurrentPage(1);
  }, [difficultyFilter, searchTerm, subcategoryFilter]);

  const filteredQuestions = filterAdminQuestions({
    difficultyFilter,
    questions,
    searchTerm,
    subcategoryFilter
  });
  const uniqueSubcategories = buildUniqueSubcategoryOptions({
    allSubcategories,
    questions,
    subcategoriesLoading
  });
  const totalPages = Math.max(1, Math.ceil(filteredQuestions.length / QUESTIONS_PER_PAGE));
  const startIndex = (currentPage - 1) * QUESTIONS_PER_PAGE;
  const endIndex = startIndex + QUESTIONS_PER_PAGE;
  const currentPageQuestions = filteredQuestions.slice(startIndex, endIndex);
  const currentPageQuestionIds = currentPageQuestions.map(question => question.id);
  const allCurrentPageSelected =
    currentPageQuestionIds.length > 0 &&
    currentPageQuestionIds.every(questionId => selectedQuestionIds.includes(questionId));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const reloadQuestions = async () => {
    const loadedQuestions = await fetchAdminQuestions();
    setQuestions(loadedQuestions);
  };

  const handleCreateQuestion = () => {
    navigate('/admin/question-editor');
  };

  const handleEditQuestion = (questionId) => {
    navigate(`/admin/question-editor/${questionId}`);
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteQuestionById(questionId);
      setQuestions(previousQuestions =>
        previousQuestions.filter(question => question.id !== questionId)
      );
      setSelectedQuestionIds(previousIds =>
        previousIds.filter(selectedId => selectedId !== questionId)
      );

      if (selectedQuestion?.id === questionId) {
        setSelectedQuestion(null);
      }

      await syncDeletedQuestionsInSelectedQuiz([questionId]);
      alert('Question deleted successfully!');
    } catch (error) {
      console.error('Error deleting question:', error);
      alert('Failed to delete question. Please try again.');
    }
  };

  const handleToggleSelectQuestion = (questionId) => {
    setSelectedQuestionIds(previousIds => {
      if (previousIds.includes(questionId)) {
        return previousIds.filter(existingId => existingId !== questionId);
      }

      return [...previousIds, questionId];
    });
  };

  const handleSelectAll = () => {
    if (allCurrentPageSelected) {
      setSelectedQuestionIds(previousIds =>
        previousIds.filter(questionId => !currentPageQuestionIds.includes(questionId))
      );
      return;
    }

    setSelectedQuestionIds(previousIds => {
      const nextSelection = [...previousIds];

      currentPageQuestionIds.forEach(questionId => {
        if (!nextSelection.includes(questionId)) {
          nextSelection.push(questionId);
        }
      });

      return nextSelection;
    });
  };

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedQuestionIds.length === 0) {
      alert('No questions selected.');
      return;
    }

    setIsConfirmDeleteModalOpen(true);
  };

  const handleConvertSelectedToGeneral = async () => {
    if (selectedQuestionIds.length === 0) {
      alert('No questions selected.');
      return;
    }

    const selectedQuestions = questions.filter(question =>
      selectedQuestionIds.includes(question.id)
    );
    const examQuestions = selectedQuestions.filter(
      question => question.usageContext === 'exam'
    );
    const generalQuestions = selectedQuestions.filter(
      question => question.usageContext === 'general' || !question.usageContext
    );

    if (examQuestions.length === 0) {
      alert('None of the selected questions have "exam" context. No conversion needed.');
      return;
    }

    let confirmMessage = `You have selected ${selectedQuestionIds.length} questions:\n`;

    if (examQuestions.length > 0) {
      confirmMessage += `- ${examQuestions.length} questions with "exam" context (will be converted to "general")\n`;
    }

    if (generalQuestions.length > 0) {
      confirmMessage += `- ${generalQuestions.length} questions already have "general" context (no change needed)\n`;
    }

    confirmMessage += `\nDo you want to convert the ${examQuestions.length} "exam" questions to "general" context?`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setIsLoading(true);

      const { failedIds, successCount } = await updateQuestionUsageContexts(
        examQuestions.map(question => question.id),
        'general'
      );
      let message = 'Conversion completed!\n';
      message += `Successfully converted: ${successCount} questions\n`;

      if (failedIds.length > 0) {
        message += `Failed to convert: ${failedIds.length} questions\n`;
      }

      if (generalQuestions.length > 0) {
        message += `Skipped: ${generalQuestions.length} questions (already "general")`;
      }

      alert(message);
      setSelectedQuestionIds([]);
      await reloadQuestions();
    } catch (error) {
      console.error('Error converting question contexts:', error);
      alert('Failed to convert questions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDeleteSelected = async () => {
    try {
      setIsLoading(true);

      const hasAdminAccess = await checkAdminAccess(currentUser?.uid);

      if (!hasAdminAccess) {
        throw new Error('Admin verification failed - user document indicates insufficient permissions');
      }

      const { deletedIds, failedIds } = await bulkDeleteQuestions(selectedQuestionIds);

      if (deletedIds.length > 0) {
        setQuestions(previousQuestions =>
          previousQuestions.filter(question => !deletedIds.includes(question.id))
        );

        if (selectedQuestion?.id && deletedIds.includes(selectedQuestion.id)) {
          setSelectedQuestion(null);
        }

        await syncDeletedQuestionsInSelectedQuiz(deletedIds, { persist: false });
      }

      setSelectedQuestionIds([]);
      setIsConfirmDeleteModalOpen(false);

      let summary = `Successfully deleted ${deletedIds.length} question(s).`;

      if (failedIds.length > 0) {
        summary += `\nFailed to delete ${failedIds.length} question(s).`;
      }

      alert(summary);
    } catch (error) {
      console.error('Error during mass delete operation:', error);
      alert(getDeleteErrorMessage(error));
      setIsConfirmDeleteModalOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const cancelDeleteSelected = () => {
    setIsConfirmDeleteModalOpen(false);
  };

  const handleViewQuestionDetails = (question) => {
    setSelectedQuestion(question);
  };

  const closeQuestionDetails = () => {
    setSelectedQuestion(null);
  };

  const migrateExistingQuestionsHandler = async () => {
    if (!window.confirm('This will update all existing questions to use the standardized kebab-case subcategory format. This may take a while. Continue?')) {
      return;
    }

    try {
      const result = await migrateQuestionSubcategories();
      alert(buildMigrationReportMessage(result));

      if (result.updatedCount > 0) {
        await reloadQuestions();
      }
    } catch (error) {
      console.error('Error during migration:', error);
      alert(`Migration failed: ${error.message}`);
    }
  };

  const handleImportQuestions = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const importedQuestions = JSON.parse(await file.text());
      const result = await importAdminQuestions(importedQuestions, importUsageContext);

      alert(buildImportReportMessage(result));
      await reloadQuestions();
    } catch (error) {
      if (error instanceof SyntaxError) {
        console.error('Error parsing JSON:', error);
        alert('Failed to parse file. Make sure it contains valid JSON.');
      } else {
        console.error('Error importing questions:', error);
        alert(error.message || 'Failed to import questions. Please try again.');
      }
    } finally {
      event.target.value = '';
    }
  };

  return {
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
    migrateExistingQuestions: migrateExistingQuestionsHandler,
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
  };
}

export default useAdminQuestionManagement;
