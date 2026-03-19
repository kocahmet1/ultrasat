export * from './questionBankServices';
export * from './examModuleServices';
export * from './practiceExamCatalogServices';
export * from './skillTagServices';
export * from './userProgressServices';
export * from './studyResourceServices';
export * from './recommendationServices';

export const createTargetedQuiz = async () => {
  console.warn('createTargetedQuiz is deprecated. Use adaptive quizzes instead.');
  return 'deprecated-targeted-quiz';
};

export const getQuizzesBySkillTag = async () => {
  console.warn('getQuizzesBySkillTag is deprecated. Use adaptive quizzes instead.');
  return [];
};
