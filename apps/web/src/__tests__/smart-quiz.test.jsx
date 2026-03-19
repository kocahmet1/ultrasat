import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { doc, getDoc } from 'firebase/firestore';
import SmartQuizGenerator from '../pages/SmartQuizGenerator';
import SmartQuizResults from '../pages/SmartQuizResults';
import { reportQuestion } from '../api/reportClient';
import { useAuth } from '../contexts/AuthContext';
import { createSmartQuiz, getUserLevel } from '../utils/smartQuizUtils';
import { toast } from 'react-toastify';
import {
  createMockUser,
  renderWithRoute,
  RouteStateViewer,
} from '../test/testUtils';

jest.mock('../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../utils/smartQuizUtils', () => ({
  getUserLevel: jest.fn(),
  createSmartQuiz: jest.fn(),
  DIFFICULTY_FOR_LEVEL: {
    1: 'easy',
    2: 'medium',
    3: 'hard',
  },
}));

jest.mock('../utils/subcategoryConstants', () => ({
  getSubcategoryName: jest.fn(() => 'Geometry'),
}));

jest.mock('../firebase/config', () => ({
  db: {},
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn((database, ...segments) => ({
    path: segments.join('/'),
    id: segments[segments.length - 1],
  })),
  getDoc: jest.fn(),
}));

jest.mock('../api/reportClient', () => ({
  reportQuestion: jest.fn(),
}));

jest.mock('../components/ReportQuestionModal', () => (
  function MockReportQuestionModal({ isOpen, onClose, onReport, loading }) {
    if (!isOpen) {
      return null;
    }

    return (
      <div>
        <p>Report Question</p>
        <button onClick={() => onReport('Typo in prompt')} disabled={loading}>
          Submit report
        </button>
        <button onClick={onClose}>Close report</button>
      </div>
    );
  }
));

jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

function createDocSnapshot(id, data) {
  return {
    id,
    exists: () => true,
    data: () => data,
  };
}

describe('smart quiz flows', () => {
  beforeEach(() => {
    useAuth.mockReset();
    getUserLevel.mockReset();
    createSmartQuiz.mockReset();
    doc.mockClear();
    getDoc.mockReset();
    reportQuestion.mockReset();
    toast.success.mockReset();
    toast.error.mockReset();
  });

  it('creates a quiz from the current user level and redirects to the intro screen', async () => {
    useAuth.mockReturnValue({
      currentUser: createMockUser(),
    });
    getUserLevel.mockResolvedValue(2);
    createSmartQuiz.mockResolvedValue('quiz-42');

    renderWithRoute(<SmartQuizGenerator />, {
      path: '/smart-quiz-generator',
      initialEntries: [
        {
          pathname: '/smart-quiz-generator',
          state: {
            subcategoryId: 'lines-angles-triangles',
            accuracyRate: 82,
            userCurrentLevel: 2,
          },
        },
      ],
      routes: [
        { path: '/smart-quiz-intro', element: <RouteStateViewer testId="intro" /> },
      ],
    });

    await waitFor(() => {
      expect(getUserLevel).toHaveBeenCalledWith('user-123', 'lines-angles-triangles', 82);
    });

    await waitFor(() => {
      expect(createSmartQuiz).toHaveBeenCalledWith(
        'user-123',
        'lines-angles-triangles',
        2,
        2,
      );
    });

    expect(await screen.findByTestId('intro-pathname')).toHaveTextContent(
      '/smart-quiz-intro',
    );
    expect(screen.getByTestId('intro')).toHaveTextContent('"quizId":"quiz-42"');
    expect(screen.getByTestId('intro')).toHaveTextContent('"level":2');
  });

  it('shows a useful error when SmartQuiz generation is missing a subcategory', async () => {
    useAuth.mockReturnValue({
      currentUser: createMockUser(),
    });

    renderWithRoute(<SmartQuizGenerator />, {
      path: '/smart-quiz-generator',
      initialEntries: ['/smart-quiz-generator'],
      routes: [{ path: '/progress', element: <div>Progress Page</div> }],
    });

    expect(
      await screen.findByText(/no subcategory specified/i),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /back to dashboard/i }));

    expect(screen.getByText('Progress Page')).toBeInTheDocument();
  });

  it('renders quiz results, supports reporting, and starts the next smart quiz level', async () => {
    useAuth.mockReturnValue({
      currentUser: createMockUser(),
    });
    reportQuestion.mockResolvedValue({});

    getDoc
      .mockResolvedValueOnce(createDocSnapshot('quiz-123', {
        userId: 'user-123',
        subcategoryId: 'lines-angles-triangles',
        level: 1,
        questionIds: ['q1', 'q2'],
        questionCount: 2,
        score: 100,
        passed: true,
        userAnswers: {
          q1: { isCorrect: true, selectedOption: 1 },
          q2: { isCorrect: true, selectedOption: 'triangle' },
        },
      }))
      .mockResolvedValueOnce(createDocSnapshot('q1', {
        text: 'What is 2 + 2?',
        questionType: 'multiple-choice',
        options: ['3', '4'],
        correctAnswer: 1,
      }))
      .mockResolvedValueOnce(createDocSnapshot('q2', {
        text: 'Name this polygon.',
        correctAnswer: 'triangle',
        acceptedAnswers: ['triangles'],
      }));

    renderWithRoute(<SmartQuizResults />, {
      path: '/smart-quiz-results/:quizId',
      initialEntries: ['/smart-quiz-results/quiz-123'],
      routes: [
        {
          path: '/smart-quiz-generator',
          element: <RouteStateViewer testId="generator" />,
        },
        { path: '/progress', element: <div>Progress Page</div> },
      ],
    });

    expect(await screen.findByText(/quiz results/i)).toBeInTheDocument();
    expect(screen.getByText(/2 of 2 correct/i)).toBeInTheDocument();
    expect(screen.getByText(/promoted to level 2!/i)).toBeInTheDocument();

    fireEvent.click(screen.getAllByTitle(/report this question/i)[0]);
    fireEvent.click(await screen.findByRole('button', { name: /submit report/i }));

    await waitFor(() => {
      expect(reportQuestion).toHaveBeenCalledWith(
        'q1',
        'quiz-123',
        'Typo in prompt',
      );
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        expect.stringMatching(/question reported successfully/i),
      );
    });

    fireEvent.click(screen.getByRole('button', { name: /go to level 2/i }));

    expect(await screen.findByTestId('generator-pathname')).toHaveTextContent(
      '/smart-quiz-generator',
    );
    expect(screen.getByTestId('generator')).toHaveTextContent(
      '"subcategoryId":"lines-angles-triangles"',
    );
    expect(screen.getByTestId('generator')).toHaveTextContent('"forceLevel":2');
  });
});
