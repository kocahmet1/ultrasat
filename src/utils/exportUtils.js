import { getSubcategoryIdFromString, getKebabCaseFromAnyFormat } from './subcategoryConstants';

export const exportQuestionsAsJSON = (questions, selectedSubcategoryId) => {
  let questionsToExport = questions;
  if (selectedSubcategoryId !== 'all') {
    questionsToExport = questions.filter(q => {
      if (!q) return false;
      
      // Get question's subcategory in various formats
      const questionSubcategoryId = q.subcategoryId;
      const questionSubcategory = q.subcategory;
      const questionSubCategory = q.subCategory;
      
      // Convert the selected ID to numeric for comparison
      const selectedNumericId = getSubcategoryIdFromString(selectedSubcategoryId);
      
      // Check if question has numeric subcategoryId that matches
      if (questionSubcategoryId !== undefined && questionSubcategoryId !== null) {
        if (String(questionSubcategoryId) === String(selectedSubcategoryId)) {
          return true;
        }
      }
      
      // Check if question has kebab-case subcategory that matches when converted to numeric
      if (questionSubcategory) {
        const questionNumericId = getSubcategoryIdFromString(questionSubcategory);
        if (questionNumericId && selectedNumericId && questionNumericId === selectedNumericId) {
          return true;
        }
      }
      
      // Check legacy subCategory field
      if (questionSubCategory) {
        const questionNumericId = getSubcategoryIdFromString(questionSubCategory);
        if (questionNumericId && selectedNumericId && questionNumericId === selectedNumericId) {
          return true;
        }
      }
      
      return false;
    });
  }

  if (questionsToExport.length === 0) {
    alert('No questions found for the selected subcategory.');
    return false;
  }

  const jsonData = JSON.stringify(questionsToExport, null, 2);
  const blob = new Blob([jsonData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  
  const sanitizedSubcategoryId = selectedSubcategoryId.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
  const fileName = selectedSubcategoryId === 'all' 
    ? 'all_questions.json' 
    : `${sanitizedSubcategoryId}_questions.json`;
  
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  alert(`${questionsToExport.length} questions exported to ${fileName} successfully!`);
  return true;
};