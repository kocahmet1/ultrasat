import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { createMetaSmartQuiz, createSmartQuiz } from '../utils/smartQuizUtils';

const DIFFICULTY_LEVELS = {
  easy: 1,
  medium: 2,
  hard: 3
};

function resolveLegacyLevel(legacyQuiz) {
  if (typeof legacyQuiz?.level === 'number') {
    return Math.max(1, Math.min(3, legacyQuiz.level));
  }

  if (typeof legacyQuiz?.difficulty === 'number') {
    return Math.max(1, Math.min(3, Math.round(legacyQuiz.difficulty)));
  }

  if (typeof legacyQuiz?.difficulty === 'string') {
    return DIFFICULTY_LEVELS[legacyQuiz.difficulty.toLowerCase()] || 2;
  }

  return 2;
}

function LegacyAdaptiveQuizRedirect() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const migrateLegacyQuiz = async () => {
      if (!currentUser || !quizId) {
        setError('Missing quiz information.');
        return;
      }

      try {
        const adaptiveRef = doc(db, 'adaptiveQuizzes', quizId);
        const adaptiveSnap = await getDoc(adaptiveRef);

        if (adaptiveSnap.exists()) {
          const legacyQuiz = adaptiveSnap.data();
          const level = resolveLegacyLevel(legacyQuiz);
          const subcategoryId = legacyQuiz.subcategory;

          if (!subcategoryId) {
            throw new Error('Legacy adaptive quiz is missing its subcategory.');
          }

          const smartQuizId = await createSmartQuiz(currentUser.uid, subcategoryId, level);

          if (!cancelled) {
            navigate('/smart-quiz-intro', {
              state: {
                quizId: smartQuizId,
                subcategoryId,
                level,
                forceLevel: level
              },
              replace: true
            });
          }
          return;
        }

        const targetedRef = doc(db, 'targetedQuizzes', quizId);
        const targetedSnap = await getDoc(targetedRef);

        if (!targetedSnap.exists()) {
          throw new Error('This legacy quiz could not be found.');
        }

        const legacyQuiz = targetedSnap.data();
        const level = resolveLegacyLevel(legacyQuiz);
        const subcategories = Array.isArray(legacyQuiz.subcategories)
          ? legacyQuiz.subcategories.filter(Boolean)
          : (legacyQuiz.subcategory ? [legacyQuiz.subcategory] : []);

        if (subcategories.length === 0) {
          throw new Error('Legacy quiz is missing its subcategory configuration.');
        }

        if (subcategories.length === 1) {
          const smartQuizId = await createSmartQuiz(currentUser.uid, subcategories[0], level);

          if (!cancelled) {
            navigate('/smart-quiz-intro', {
              state: {
                quizId: smartQuizId,
                subcategoryId: subcategories[0],
                level,
                forceLevel: level
              },
              replace: true
            });
          }
          return;
        }

        const questionCount = legacyQuiz.questionIds?.length || legacyQuiz.questionCount || 5;
        const smartQuizId = await createMetaSmartQuiz(currentUser.uid, subcategories, level, questionCount);

        if (!cancelled) {
          navigate('/smart-quiz-intro', {
            state: {
              quizId: smartQuizId,
              level,
              forceLevel: level,
              meta: true,
              metaSubcategoryIds: subcategories
            },
            replace: true
          });
        }
      } catch (err) {
        console.error('Legacy adaptive quiz redirect failed:', err);
        if (!cancelled) {
          setError(err.message || 'Unable to open this quiz.');
        }
      }
    };

    migrateLegacyQuiz();

    return () => {
      cancelled = true;
    };
  }, [currentUser, navigate, quizId]);

  if (error) {
    return (
      <div className="membership-gate-loading">
        <p>{error}</p>
        <button onClick={() => navigate('/smart-quiz-generator')}>Start a New Smart Quiz</button>
      </div>
    );
  }

  return (
    <div className="membership-gate-loading">
      Migrating your quiz to the current Smart Quiz flow...
    </div>
  );
}

export default LegacyAdaptiveQuizRedirect;
