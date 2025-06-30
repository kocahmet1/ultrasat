import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Pages
import HomePage from './pages/HomePage';
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

// Styles
import './styles/App.css';

function App() {
  const [flags, setFlags] = React.useState({});
  const isMobile = useIsMobile();
  React.useEffect(() => {
    getFeatureFlags().then(setFlags);
  }, []);

  return (
    <AuthProvider>
      <SubcategoryProvider>
        <ReviewProvider>
          <Router>
            <div className="app-container">
              {isMobile ? <TopNavBar /> : <Sidebar />}
              <div className="main-content">
                <Routes>
                  {/* Authentication routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
                  
                  {/* Main site routes */}
                  {/* Redirect root to Progress Dashboard */}
                  <Route path="/" element={<Navigate to="/progress" replace />} />
                  
                  {/* Exam routes */}
                  <Route path="/exam/landing" element={<PrivateRoute><ExamLandingPage /></PrivateRoute>} />
                  <Route path="/exam/results/:examId?" element={<PrivateRoute><ExamResults /></PrivateRoute>} />
                  <Route path="/exam/:moduleId" element={<PrivateRoute><ExamController /></PrivateRoute>} />
                  <Route path="/intermission" element={<PrivateRoute><IntermissionController /></PrivateRoute>} />
                  <Route path="/results/:examId?" element={<PrivateRoute><ExamResults /></PrivateRoute>} />
                  <Route path="/all-results" element={<PrivateRoute><AllExamResults /></PrivateRoute>} />
                  
                  {/* Adaptive Learning routes */}
                  <>
                    <Route path="/smart-quiz-generator" element={<PrivateRoute><SmartQuizGenerator /></PrivateRoute>} />
                    <Route path="/smart-quiz-intro" element={<PrivateRoute><SmartQuizIntro /></PrivateRoute>} />
                    <Route path="/smart-quiz/:quizId" element={<PrivateRoute><SmartQuiz /></PrivateRoute>} />
                    <Route path="/smart-quiz-results/:quizId" element={<PrivateRoute><SmartQuizResults /></PrivateRoute>} />
                  </>
                  <Route path="/quiz-results/:quizId" element={<PrivateRoute><QuizResults /></PrivateRoute>} />
                  <Route path="/study-resources" element={<PrivateRoute><StudyResources /></PrivateRoute>} />
                  <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                  <Route path="/progress" element={<PrivateRoute><ProgressDashboard /></PrivateRoute>} />
                  <Route path="/skills" element={<PrivateRoute><SkillsPractice /></PrivateRoute>} />
                  <Route path="/subcategory-progress/:subcategoryId" element={<PrivateRoute><SubcategoryProgressPage /></PrivateRoute>} />
                  <Route path="/word-bank" element={<PrivateRoute><WordBank /></PrivateRoute>} />
                  <Route path="/concept-bank" element={<PrivateRoute><ConceptBank /></PrivateRoute>} />
                  <Route path="/concept-detail/:conceptId" element={<PrivateRoute><ConceptDetail /></PrivateRoute>} />
                  
                  {/* Unified Learning Track routes */}
                  <Route path="/concept/:conceptId" element={<PrivateRoute><ConceptPractice /></PrivateRoute>} />
                  <Route path="/learn/:subcategoryId" element={<PrivateRoute><SubcategoryLearnPage /></PrivateRoute>} />
                  
                  {/* Legacy routes - redirect to new unified learning track */}
                  <Route path="/lesson/:skillTag" element={<Navigate to="/progress" replace />} />
                  <Route path="/skill-drill/:skillTag" element={<Navigate to="/smart-quiz-generator" replace />} />
                  
                  {/* Practice Exam routes - protected by authentication */}
                  <Route path="/practice-exams" element={<PrivateRoute><PracticeExamList /></PrivateRoute>} />
                  <Route path="/practice-exam/:examId" element={<PrivateRoute><PracticeExamController /></PrivateRoute>} />
                  <Route path="/practice-exam/:examId/results" element={<PrivateRoute><ExamResults /></PrivateRoute>} />
                  
                  {/* Admin routes - protected by authentication and admin check */}
                  <Route path="/admin" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
                  <Route path="/admin/ai-content" element={<PrivateRoute><AdminAiContent /></PrivateRoute>} />
                  <Route path="/admin/practice-exams" element={<PrivateRoute><PracticeExamManagerPage /></PrivateRoute>} />
                  <Route path="/admin/question-editor" element={<PrivateRoute><QuestionEditor /></PrivateRoute>} />
                  <Route path="/admin/question-editor/:questionId" element={<PrivateRoute><QuestionEditor /></PrivateRoute>} />
                  <Route path="/admin/subcategory-settings" element={<PrivateRoute><SubcategorySettings /></PrivateRoute>} />
                  <Route path="/admin/concept-import" element={<PrivateRoute><ConceptImport /></PrivateRoute>} />
                  <Route path="/admin/question-import" element={<PrivateRoute><QuestionImport /></PrivateRoute>} />
                  <Route path="/admin/graph-generation" element={<PrivateRoute><GraphGenerationPage /></PrivateRoute>} />
                  <Route path="/admin/graph-descriptions" element={<PrivateRoute><GraphDescriptionTool /></PrivateRoute>} />
                  <Route path="/admin/learning-content" element={<PrivateRoute><AdminLearningContent /></PrivateRoute>} />
                  
                  {/* Redirect for invalid routes */}
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </div> 
            </div> 
          </Router>
        </ReviewProvider>
      </SubcategoryProvider>
    </AuthProvider>
  );
}

export default App;
