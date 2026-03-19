import { useState } from 'react';
import {
  fetchAllQuestionsRaw,
  repairExamModuleData,
  repairPracticeExamData
} from '../../firebase/adminDashboardServices';
import { buildQuestionContextDiagnosticReport } from '../../utils/adminQuestionManagementUtils';
import { diagnoseGraphQuestionsDetailed } from '../../utils/diagnosticUtils';

function useAdminDiagnostics({ setIsLoading }) {
  const [diagnosticResults, setDiagnosticResults] = useState(null);
  const [diagnosticLoading, setDiagnosticLoading] = useState(false);
  const [diagnosticSubcategory, setDiagnosticSubcategory] = useState('');
  const [diagnosticUserId, setDiagnosticUserId] = useState('');

  const handleRunGraphDiagnostic = async () => {
    if (!diagnosticSubcategory.trim()) {
      alert('Please enter a subcategory to diagnose');
      return;
    }

    setDiagnosticLoading(true);
    setDiagnosticResults(null);

    try {
      const userId = diagnosticUserId.trim() || null;
      const results = await diagnoseGraphQuestionsDetailed(
        diagnosticSubcategory.trim(),
        userId
      );
      setDiagnosticResults(results);
    } catch (error) {
      console.error('Error running graph diagnostic:', error);
      alert(`Error running diagnostic: ${error.message}`);
    } finally {
      setDiagnosticLoading(false);
    }
  };

  const handleDiagnoseQuestionContexts = async () => {
    try {
      setIsLoading(true);
      const allQuestions = await fetchAllQuestionsRaw();
      const report = buildQuestionContextDiagnosticReport(allQuestions);
      alert(report);
    } catch (error) {
      console.error('Error diagnosing question contexts:', error);
      alert(`Error during diagnostic: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRepairPracticeExamData = async () => {
    try {
      setIsLoading(true);
      const result = await repairPracticeExamData();

      if (result.action === 'created_module_and_exam') {
        alert('Created placeholder module and practice exam successfully!');
      } else if (result.action === 'created_module_only') {
        alert('Created placeholder module successfully!');
      } else if (result.action === 'created_exam_only') {
        alert('Created placeholder practice exam successfully!');
      } else {
        alert('Practice exam data already exists. No repair needed.');
      }
    } catch (error) {
      console.error('Error repairing practice exam data:', error);
      alert(`Error repairing practice exam data: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRepairExamModuleData = async () => {
    try {
      setIsLoading(true);
      const result = await repairExamModuleData();

      if (result.action === 'created_module') {
        alert('Created placeholder exam module successfully!');
      } else {
        alert('Exam module data already exists. No repair needed.');
      }
    } catch (error) {
      console.error('Error repairing exam module data:', error);
      alert(`Error repairing exam module data: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return {
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
  };
}

export default useAdminDiagnostics;
