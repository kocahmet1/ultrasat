import React from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
} from 'react-router-dom';

// Pages
import HomePage from './pages/HomePage';
import LandingPage from './pages/LandingPage';
import ExamLandingPage from './pages/ExamLandingPage';
import ExamController from './pages/ExamController';
import IntermissionController from './pages/IntermissionController';
import ExamResults from './pages/ExamResults';
import Profile from './pages/Profile';
import WordBank from './pages/WordBank';
import ConceptBank from './pages/ConceptBank';
import ConceptDetail from './pages/ConceptDetail';

// Practice Exam Pages
import PracticeExamList from './pages/PracticeExamList';
import PracticeExamController from './pages/PracticeExamController';

// New Adaptive Learning Pages
import Dashboard from './pages/Dashboard';
import QuizResults from './pages/QuizResults';
import StudyResources from './pages/StudyResources';
import ProgressDashboard from './pages/ProgressDashboard';
import SkillsPractice from './pages/SkillsPractice';
import AdminDashboard from './pages/AdminDashboard';
import AdminAiContent from './pages/AdminAiContent';
import PracticeExamManagerPage from './pages/PracticeExamManagerPage';
import QuestionEditor from './pages/QuestionEditor';
import AllExamResults from './pages/AllExamResults';
import SmartQuiz from './pages/SmartQuiz';
import SmartQuizGenerator from './pages/SmartQuizGenerator';
import SmartQuizResults from './pages/SmartQuizResults';
import SmartQuizIntro from './pages/SmartQuizIntro';
import SubcategoryProgressPage from './pages/SubcategoryProgressPage';
import SubcategorySettings from './components/admin/SubcategorySettings';
import ConceptImport from './pages/ConceptImport';
import QuestionImport from './pages/QuestionImport';
import GraphGenerationPage from './pages/GraphGenerationPage';
import GraphDescriptionTool from './pages/GraphDescriptionTool';
import AdminLearningContent from './pages/AdminLearningContent';

// Repair Engine Pages
import Lesson from './pages/Lesson';
import SkillDrillQuiz from './pages/SkillDrillQuiz';
import ConceptPractice from './pages/ConceptPractice';
import SubcategoryLearnPage from './pages/SubcategoryLearnPage';

// Auth Components
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import PrivateRoute from './components/auth/PrivateRoute';
import { AuthProvider } from './contexts/AuthContext';
import { SubcategoryProvider } from './contexts/SubcategoryContext';
import { ReviewProvider } from './contexts/ReviewContext';
import { getFeatureFlags } from './firebase/config.featureFlags';

// Components
import Sidebar from './components/Sidebar';
import TopNavBar from './components/TopNavBar';
import useIsMobile from './hooks/useIsMobile';
import { SidebarProvider } from './contexts/SidebarContext';
import SidebarVisibility from './contexts/SidebarVisibility';

// Styles
import './styles/App.css';

// Define a RootLayout component that includes the common UI structure
const RootLayout = () => {
  const isMobile = useIsMobile();
  return (
    <SidebarVisibility>
      <div className="app-container">
        {isMobile ? <TopNavBar /> : <Sidebar />}
        <div className="main-content">
          <Outlet />
        </div>
      </div>
    </SidebarVisibility>
  );
};

// Create the router configuration using the modern createBrowserRouter API
const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/login', element: <Login /> },
      { path: '/signup', element: <Signup /> },
      { path: '/profile', element: <PrivateRoute><Profile /></PrivateRoute> },
      { path: '/', element: <LandingPage /> },
      { path: '/exam/landing', element: <PrivateRoute><ExamLandingPage /></PrivateRoute> },
      { path: '/exam/results/:examId?', element: <PrivateRoute><ExamResults /></PrivateRoute> },
      { path: '/exam/:moduleId', element: <PrivateRoute><ExamController /></PrivateRoute> },
      { path: '/intermission', element: <PrivateRoute><IntermissionController /></PrivateRoute> },
      { path: '/results/:examId?', element: <PrivateRoute><ExamResults /></PrivateRoute> },
      { path: '/all-results', element: <PrivateRoute><AllExamResults /></PrivateRoute> },
      { path: '/smart-quiz-generator', element: <PrivateRoute><SmartQuizGenerator /></PrivateRoute> },
      { path: '/smart-quiz-intro', element: <PrivateRoute><SmartQuizIntro /></PrivateRoute> },
      { path: '/smart-quiz/:quizId', element: <PrivateRoute><SmartQuiz /></PrivateRoute> },
      { path: '/smart-quiz-results/:quizId', element: <PrivateRoute><SmartQuizResults /></PrivateRoute> },
      { path: '/quiz-results/:quizId', element: <PrivateRoute><QuizResults /></PrivateRoute> },
      { path: '/study-resources', element: <PrivateRoute><StudyResources /></PrivateRoute> },
      { path: '/dashboard', element: <PrivateRoute><Dashboard /></PrivateRoute> },
      { path: '/progress', element: <PrivateRoute><ProgressDashboard /></PrivateRoute> },
      { path: '/skills', element: <PrivateRoute><SkillsPractice /></PrivateRoute> },
      { path: '/subcategory-progress/:subcategoryId', element: <PrivateRoute><SubcategoryProgressPage /></PrivateRoute> },
      { path: '/word-bank', element: <PrivateRoute><WordBank /></PrivateRoute> },
      { path: '/concept-bank', element: <PrivateRoute><ConceptBank /></PrivateRoute> },
      { path: '/concept-detail/:conceptId', element: <PrivateRoute><ConceptDetail /></PrivateRoute> },
      { path: '/concept/:conceptId', element: <PrivateRoute><ConceptPractice /></PrivateRoute> },
      { path: '/learn/:subcategoryId', element: <PrivateRoute><SubcategoryLearnPage /></PrivateRoute> },
      { path: '/lesson/:skillTag', element: <Navigate to="/progress" replace /> },
      { path: '/skill-drill/:skillTag', element: <Navigate to="/smart-quiz-generator" replace /> },
      { path: '/practice-exams', element: <PrivateRoute><PracticeExamList /></PrivateRoute> },
      { path: '/practice-exam/:examId', element: <PrivateRoute><PracticeExamController /></PrivateRoute> },
      { path: '/practice-exam/:examId/results', element: <PrivateRoute><ExamResults /></PrivateRoute> },
      { path: '/admin', element: <PrivateRoute><AdminDashboard /></PrivateRoute> },
      { path: '/admin/ai-content', element: <PrivateRoute><AdminAiContent /></PrivateRoute> },
      { path: '/admin/practice-exams', element: <PrivateRoute><PracticeExamManagerPage /></PrivateRoute> },
      { path: '/admin/question-editor', element: <PrivateRoute><QuestionEditor /></PrivateRoute> },
      { path: '/admin/question-editor/:questionId', element: <PrivateRoute><QuestionEditor /></PrivateRoute> },
      { path: '/admin/subcategory-settings', element: <PrivateRoute><SubcategorySettings /></PrivateRoute> },
      { path: '/admin/concept-import', element: <PrivateRoute><ConceptImport /></PrivateRoute> },
      { path: '/admin/question-import', element: <PrivateRoute><QuestionImport /></PrivateRoute> },
      { path: '/admin/graph-generation', element: <PrivateRoute><GraphGenerationPage /></PrivateRoute> },
      { path: '/admin/graph-descriptions', element: <PrivateRoute><GraphDescriptionTool /></PrivateRoute> },
      { path: '/admin/learning-content', element: <PrivateRoute><AdminLearningContent /></PrivateRoute> },
      { path: '*', element: <Navigate to="/" /> },
    ],
  },
]);

function App() {
  const [flags, setFlags] = React.useState({});
  React.useEffect(() => {
    getFeatureFlags().then(setFlags);
  }, []);

  return (
    <AuthProvider>
      <SubcategoryProvider>
        <ReviewProvider>
          <SidebarProvider>
            <RouterProvider router={router} />
          </SidebarProvider>
        </ReviewProvider>
      </SubcategoryProvider>
    </AuthProvider>
  );
}

export default App;
