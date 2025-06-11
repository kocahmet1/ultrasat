export const exportQuestionsAsJSON = (questions, selectedSubcategoryId) => {
  let questionsToExport = questions;
  if (selectedSubcategoryId !== 'all') {
    questionsToExport = questions.filter(q => 
      q.subcategoryId !== undefined && 
      q.subcategoryId !== null && 
      String(q.subcategoryId) === String(selectedSubcategoryId)
    );
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