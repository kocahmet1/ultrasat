import { useEffect, useState } from 'react';
import {
  fetchRecentSmartQuizzes,
  fetchSmartQuizDetails,
  updateSmartQuizQuestionIds
} from '../../firebase/adminDashboardServices';

function useAdminSmartQuizActivity({ isAdmin }) {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [quizQuestions, setQuizQuestions] = useState([]);

  useEffect(() => {
    let isActive = true;

    const loadQuizzes = async () => {
      try {
        const loadedQuizzes = await fetchRecentSmartQuizzes();

        if (isActive) {
          setQuizzes(loadedQuizzes);
        }
      } catch (error) {
        console.error('Error loading quizzes:', error);

        if (isActive) {
          setQuizzes([]);
        }
      }
    };

    if (!isAdmin) {
      setQuizzes([]);
      setSelectedQuiz(null);
      setQuizQuestions([]);

      return () => {
        isActive = false;
      };
    }

    loadQuizzes();

    return () => {
      isActive = false;
    };
  }, [isAdmin]);

  const handleSelectQuiz = async (quizId) => {
    try {
      const { quiz, questions } = await fetchSmartQuizDetails(quizId);
      setSelectedQuiz(quiz);
      setQuizQuestions(questions);
    } catch (error) {
      console.error('Error loading SmartQuiz details:', error);
    }
  };

  const syncDeletedQuestionsInSelectedQuiz = async (
    questionIds,
    options = { persist: true }
  ) => {
    if (!selectedQuiz?.questionIds?.some(questionId => questionIds.includes(questionId))) {
      return;
    }

    const updatedQuestionIds = selectedQuiz.questionIds.filter(
      questionId => !questionIds.includes(questionId)
    );
    const updatedQuiz = {
      ...selectedQuiz,
      questionCount: updatedQuestionIds.length,
      questionIds: updatedQuestionIds
    };

    setSelectedQuiz(updatedQuiz);
    setQuizQuestions(previousQuestions =>
      previousQuestions.filter(question => !questionIds.includes(question.id))
    );

    if (options.persist) {
      await updateSmartQuizQuestionIds(selectedQuiz.id, updatedQuestionIds);
    }
  };

  const handleMoveQuestion = () => {
    alert('SmartQuiz sessions are read-only. Update question ordering in the question bank instead.');
  };

  const handleRemoveQuestionFromQuiz = () => {
    alert('SmartQuiz sessions are read-only. Remove or edit the underlying question from the question bank instead.');
  };

  return {
    handleMoveQuestion,
    handleRemoveQuestionFromQuiz,
    handleSelectQuiz,
    quizQuestions,
    quizzes,
    selectedQuiz,
    syncDeletedQuestionsInSelectedQuiz
  };
}

export default useAdminSmartQuizActivity;
