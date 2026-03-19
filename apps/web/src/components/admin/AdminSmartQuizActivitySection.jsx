import React from 'react';

const AdminSmartQuizActivitySection = ({
  allSubcategories,
  handleMoveQuestion,
  handleRemoveQuestionFromQuiz,
  handleSelectQuiz,
  quizQuestions,
  quizzes,
  selectedQuiz
}) => {
  const getSmartQuizSubcategoryName = (subcategoryId) => {
    const subcategory = allSubcategories.find((item) => item.id === subcategoryId);
    return subcategory?.name || subcategoryId || 'Unknown Subcategory';
  };

  const getSmartQuizTitle = (quiz) => {
    if (!quiz) return 'SmartQuiz';
    if (quiz.meta || (Array.isArray(quiz.metaSubcategoryIds) && quiz.metaSubcategoryIds.length > 0)) {
      const names = (quiz.metaSubcategoryIds || [])
        .slice(0, 2)
        .map((subcategoryId) => getSmartQuizSubcategoryName(subcategoryId));
      const suffix = (quiz.metaSubcategoryIds || []).length > 2 ? ' +' : '';
      return `Meta SmartQuiz: ${names.join(', ')}${suffix}`;
    }

    return `${getSmartQuizSubcategoryName(quiz.subcategoryId)} SmartQuiz`;
  };

  const formatFirestoreDate = (value) => {
    const date = value && typeof value.toDate === 'function'
      ? value.toDate()
      : (value ? new Date(value) : null);

    return date && !Number.isNaN(date.getTime())
      ? date.toLocaleString()
      : 'N/A';
  };

  return (
    <div className="quizzes-tab">
      <div className="tab-header">
        <h2>Smart Quiz Activity</h2>
        <p>SmartQuizzes are generated dynamically from the question bank. This tab is read-only and shows recent quiz sessions.</p>
      </div>

      <div className="quiz-builder">
        <div className="quiz-list">
          <h3>Recent SmartQuizzes</h3>
          {quizzes.length === 0 ? (
            <div className="no-results">
              <p>No SmartQuizzes found yet.</p>
            </div>
          ) : (
            quizzes.map(quiz => (
              <div
                key={quiz.id}
                className={`quiz-item ${selectedQuiz && selectedQuiz.id === quiz.id ? 'selected' : ''}`}
              >
                <div className="quiz-item-content" onClick={() => handleSelectQuiz(quiz.id)}>
                  <h4>{getSmartQuizTitle(quiz)}</h4>
                  <div className="quiz-item-meta">
                    <span>{quiz.questionCount || (quiz.questionIds ? quiz.questionIds.length : 0)} questions</span>
                    <span>Level {quiz.level || 'N/A'}</span>
                    <span>Status: {quiz.status || 'created'}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="quiz-editor">
          {!selectedQuiz ? (
            <div className="no-quiz-selected">
              <p>Select a SmartQuiz from the list to inspect its generated questions and metadata.</p>
            </div>
          ) : (
            <>
              <div className="quiz-editor-header">
                <h3>{getSmartQuizTitle(selectedQuiz)}</h3>
              </div>

              <div className="quiz-details">
                <div className="quiz-detail-item">
                  <label>Type:</label>
                  <div>{selectedQuiz.meta ? 'Meta SmartQuiz' : 'Single-subcategory SmartQuiz'}</div>
                </div>

                <div className="quiz-detail-item">
                  <label>User ID:</label>
                  <div>{selectedQuiz.userId || 'N/A'}</div>
                </div>

                <div className="quiz-detail-item">
                  <label>Subcategories:</label>
                  <div className="skill-tag-selector">
                    {(selectedQuiz.metaSubcategoryIds && selectedQuiz.metaSubcategoryIds.length > 0
                      ? selectedQuiz.metaSubcategoryIds
                      : [selectedQuiz.subcategoryId]
                    ).filter(Boolean).map((subcategoryId) => (
                      <span key={subcategoryId} className="skill-tag">
                        {getSmartQuizSubcategoryName(subcategoryId)}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="quiz-detail-item">
                  <label>Level:</label>
                  <div>{selectedQuiz.level || 'N/A'}</div>
                </div>

                <div className="quiz-detail-item">
                  <label>Status:</label>
                  <div>{selectedQuiz.status || 'created'}</div>
                </div>

                <div className="quiz-detail-item">
                  <label>Score:</label>
                  <div>{selectedQuiz.score ?? 'N/A'}</div>
                </div>

                <div className="quiz-detail-item">
                  <label>Created:</label>
                  <div>{formatFirestoreDate(selectedQuiz.createdAt)}</div>
                </div>

                <div className="quiz-detail-item">
                  <label>Completed:</label>
                  <div>{formatFirestoreDate(selectedQuiz.completedAt)}</div>
                </div>
              </div>

              <div className="quiz-questions">
                <h4>Generated Questions ({quizQuestions.length})</h4>
                {quizQuestions.length === 0 ? (
                  <div className="no-results">
                    <p>This SmartQuiz does not currently reference any available question documents.</p>
                  </div>
                ) : (
                  <div className="quiz-questions-list">
                    {quizQuestions.map((question, index) => (
                      <div key={question.id} className="quiz-question-item">
                        <div className="question-order">
                          {index + 1}
                        </div>
                        <div className="question-content">
                          <p>{question.text}</p>
                          <div className="question-meta">
                            <span>Difficulty: {question.difficulty || 'N/A'}</span>
                          </div>
                        </div>
                        <div className="question-actions">
                          <button
                            disabled={index === 0}
                            onClick={() => handleMoveQuestion(index, 'up')}
                          >
                            ↑
                          </button>
                          <button
                            disabled={index === quizQuestions.length - 1}
                            onClick={() => handleMoveQuestion(index, 'down')}
                          >
                            ↓
                          </button>
                          <button onClick={() => handleRemoveQuestionFromQuiz(question.id)}>
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSmartQuizActivitySection;
