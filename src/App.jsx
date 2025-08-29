import React, { Suspense } from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
} from 'react-router-dom';

// Only import critical components that are needed immediately
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import VerifyEmail from './pages/VerifyEmail';
import PrivateRoute from './components/auth/PrivateRoute';
import { AuthProvider } from './contexts/AuthContext';
import { SubcategoryProvider } from './contexts/SubcategoryContext';
import { ReviewProvider } from './contexts/ReviewContext';
import { getFeatureFlags } from './firebase/config.featureFlags';

// Components that are needed for layout
import Sidebar from './components/Sidebar';
import TopNavBar from './components/TopNavBar';
import ProfileDropdown from './components/ProfileDropdown';
import LandingPageLayout from './components/LandingPageLayout';
import { MembershipGate } from './components/membership';
import useIsMobile from './hooks/useIsMobile';
import { SidebarProvider } from './contexts/SidebarContext';
import SidebarVisibility from './contexts/SidebarVisibility';
import AnalyticsTracker from './components/AnalyticsTracker';
import CriticalCSS from './components/CriticalCSS';

// Styles
import './styles/App.css';

// Loading component for Suspense fallback
const PageLoadingSpinner = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '50vh',
    fontSize: '18px',
    color: '#666'
  }}>
    <div className="loading-spinner">Loading...</div>
  </div>
);

// Lazy load all pages for code splitting
const HomePage = React.lazy(() => import('./pages/HomePage'));
const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const LandingPageAds = React.lazy(() => import('./pages/LandingPageAds'));
const ExamLandingPage = React.lazy(() => import('./pages/ExamLandingPage'));
const ExamController = React.lazy(() => import('./pages/ExamController'));
const IntermissionController = React.lazy(() => import('./pages/IntermissionController'));
const ExamResults = React.lazy(() => import('./pages/ExamResults'));
const Profile = React.lazy(() => import('./pages/Profile'));
const WordBank = React.lazy(() => import('./pages/WordBank'));
const Flashcards = React.lazy(() => import('./pages/Flashcards'));
const ConceptBank = React.lazy(() => import('./pages/ConceptBank'));
const ConceptDetail = React.lazy(() => import('./pages/ConceptDetail'));

// Practice Exam Pages
const PracticeExamList = React.lazy(() => import('./pages/PracticeExamList'));
const PracticeExamController = React.lazy(() => import('./pages/PracticeExamController'));

// Adaptive Learning Pages
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const QuizResults = React.lazy(() => import('./pages/QuizResults'));
const StudyResources = React.lazy(() => import('./pages/StudyResources'));
const ProgressDashboard = React.lazy(() => import('./pages/ProgressDashboard'));
const SkillsPractice = React.lazy(() => import('./pages/SkillsPractice'));

// Admin Pages (heavy components that should definitely be code split)
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const AdminAiContent = React.lazy(() => import('./pages/AdminAiContent'));
const AdminReportedQuestions = React.lazy(() => import('./pages/AdminReportedQuestions'));
const PracticeExamManagerPage = React.lazy(() => import('./pages/PracticeExamManagerPage'));
const QuestionEditor = React.lazy(() => import('./pages/QuestionEditor'));
const AdminBlogManagement = React.lazy(() => import('./pages/AdminBlogManagement'));
const AdminLearningContent = React.lazy(() => import('./pages/AdminLearningContent'));
const MembershipManagement = React.lazy(() => import('./components/admin/MembershipManagement'));
const SubcategorySettings = React.lazy(() => import('./components/admin/SubcategorySettings'));
const ConceptImport = React.lazy(() => import('./pages/ConceptImport'));
const QuestionImport = React.lazy(() => import('./pages/QuestionImport'));

// Quiz and Learning Pages
const AllExamResults = React.lazy(() => import('./pages/AllExamResults'));
const SmartQuiz = React.lazy(() => import('./pages/SmartQuiz'));
const SmartQuizGenerator = React.lazy(() => import('./pages/SmartQuizGenerator'));
const SmartQuizResults = React.lazy(() => import('./pages/SmartQuizResults'));
const SubjectQuizzes = React.lazy(() => import('./pages/SubjectQuizzes'));
const LecturesPage = React.lazy(() => import('./pages/LecturesPage'));
const SmartQuizIntro = React.lazy(() => import('./pages/SmartQuizIntro'));
const SubcategoryProgressPage = React.lazy(() => import('./pages/SubcategoryProgressPage'));

// Blog Pages
const Blog = React.lazy(() => import('./pages/Blog'));
const BlogPost = React.lazy(() => import('./pages/BlogPost'));

// Graph Generation Pages
const GraphGenerationPage = React.lazy(() => import('./pages/GraphGenerationPage'));
const GraphDescriptionTool = React.lazy(() => import('./pages/GraphDescriptionTool'));

// Static/Info Pages
const HelpPage = React.lazy(() => import('./pages/HelpPage'));
const AuthNoticePage = React.lazy(() => import('./pages/AuthNoticePage'));
const PrivacyPage = React.lazy(() => import('./pages/PrivacyPage'));
const TermsOfService = React.lazy(() => import('./pages/TermsOfService'));
const CookiePolicy = React.lazy(() => import('./pages/CookiePolicy'));
const Accessibility = React.lazy(() => import('./pages/Accessibility'));
const AboutUs = React.lazy(() => import('./pages/AboutUs'));
const Contact = React.lazy(() => import('./pages/Contact'));
const Careers = React.lazy(() => import('./pages/Careers'));
const Press = React.lazy(() => import('./pages/Press'));
const SATGuide = React.lazy(() => import('./pages/SATGuide'));
const ScoreCalculator = React.lazy(() => import('./pages/ScoreCalculator'));

// Payment Pages
const MembershipUpgrade = React.lazy(() => import('./components/MembershipUpgrade'));
const PaymentSuccess = React.lazy(() => import('./pages/PaymentSuccess'));
const PaymentCancel = React.lazy(() => import('./pages/PaymentCancel'));

// Repair Engine Pages
const Lesson = React.lazy(() => import('./pages/Lesson'));
const SkillDrillQuiz = React.lazy(() => import('./pages/SkillDrillQuiz'));
const ConceptPractice = React.lazy(() => import('./pages/ConceptPractice'));
const SubcategoryLearnPage = React.lazy(() => import('./pages/SubcategoryLearnPage'));

// Helper function to create suspense-wrapped routes
const SuspenseRoute = ({ children }) => (
  <Suspense fallback={<PageLoadingSpinner />}>
    {children}
  </Suspense>
);

// Helper function to create private suspense routes
const PrivateSuspenseRoute = ({ children }) => (
  <PrivateRoute>
    <Suspense fallback={<PageLoadingSpinner />}>
      {children}
    </Suspense>
  </PrivateRoute>
);

// Define a RootLayout component that includes the common UI structure
const RootLayout = () => {
  const isMobile = useIsMobile();
  return (
    <SidebarVisibility>
      <AnalyticsTracker />
      <div className="app-container">
        {isMobile ? <TopNavBar /> : <Sidebar />}
        <div className="main-content">
          <div className="top-bar">
             <ProfileDropdown />
          </div>
          <Outlet />
        </div>
      </div>
    </SidebarVisibility>
  );
};

// Create the router configuration using the modern createBrowserRouter API
const router = createBrowserRouter([
  // Landing page with special layout (no sidebar)
  {
    path: '/',
    element: <LandingPageLayout />,
    children: [
      { path: '/', element: <Suspense fallback={<PageLoadingSpinner />}><LandingPage /></Suspense> },
      { path: '/landing_page', element: <Suspense fallback={<PageLoadingSpinner />}><LandingPageAds /></Suspense> },
      { path: '/login', element: <Login /> },
      { path: '/signup', element: <Signup /> },
      { path: '/verify-email', element: <VerifyEmail /> },
      { path: '/help', element: <Suspense fallback={<PageLoadingSpinner />}><HelpPage /></Suspense> },
      { path: '/auth-notice', element: <Suspense fallback={<PageLoadingSpinner />}><AuthNoticePage /></Suspense> },
      { path: '/privacy', element: <Suspense fallback={<PageLoadingSpinner />}><PrivacyPage /></Suspense> },
      { path: '/terms', element: <Suspense fallback={<PageLoadingSpinner />}><TermsOfService /></Suspense> },
      { path: '/cookies', element: <Suspense fallback={<PageLoadingSpinner />}><CookiePolicy /></Suspense> },
      { path: '/accessibility', element: <Suspense fallback={<PageLoadingSpinner />}><Accessibility /></Suspense> },
      { path: '/about', element: <Suspense fallback={<PageLoadingSpinner />}><AboutUs /></Suspense> },
      { path: '/contact', element: <Suspense fallback={<PageLoadingSpinner />}><Contact /></Suspense> },
      { path: '/careers', element: <Suspense fallback={<PageLoadingSpinner />}><Careers /></Suspense> },
      { path: '/press', element: <Suspense fallback={<PageLoadingSpinner />}><Press /></Suspense> },
      { path: '/sat-guide', element: <Suspense fallback={<PageLoadingSpinner />}><SATGuide /></Suspense> },
      { path: '/score-calculator', element: <Suspense fallback={<PageLoadingSpinner />}><ScoreCalculator /></Suspense> },
      { path: '/blog', element: <Suspense fallback={<PageLoadingSpinner />}><Blog /></Suspense> },
      { path: '/blog/:id', element: <Suspense fallback={<PageLoadingSpinner />}><BlogPost /></Suspense> },
    ],
  },
  // All other routes with standard layout (with sidebar)
  {
    element: <RootLayout />,
    children: [
      { path: '/profile', element: <PrivateSuspenseRoute><Profile /></PrivateSuspenseRoute> },
      { path: '/exam/landing', element: <PrivateSuspenseRoute><ExamLandingPage /></PrivateSuspenseRoute> },
      { path: '/exam/results/:examId?', element: <PrivateSuspenseRoute><ExamResults /></PrivateSuspenseRoute> },
      { path: '/exam/:moduleId', element: <PrivateSuspenseRoute><ExamController /></PrivateSuspenseRoute> },
      { path: '/intermission', element: <PrivateSuspenseRoute><IntermissionController /></PrivateSuspenseRoute> },
      { path: '/results/:examId?', element: <PrivateSuspenseRoute><ExamResults /></PrivateSuspenseRoute> },
      { path: '/all-results', element: <PrivateSuspenseRoute><AllExamResults /></PrivateSuspenseRoute> },
      { path: '/smart-quiz-generator', element: <PrivateSuspenseRoute><SmartQuizGenerator /></PrivateSuspenseRoute> },
      { path: '/smart-quiz-intro', element: <PrivateSuspenseRoute><SmartQuizIntro /></PrivateSuspenseRoute> },
      { path: '/smart-quiz/:quizId', element: <PrivateSuspenseRoute><SmartQuiz /></PrivateSuspenseRoute> },
      { path: '/smart-quiz-results/:quizId', element: <PrivateSuspenseRoute><SmartQuizResults /></PrivateSuspenseRoute> },
      { path: '/subject-quizzes', element: <PrivateSuspenseRoute><SubjectQuizzes /></PrivateSuspenseRoute> },
      { path: '/lectures', element: <PrivateSuspenseRoute><LecturesPage /></PrivateSuspenseRoute> },
      { path: '/quiz-results/:quizId', element: <PrivateSuspenseRoute><QuizResults /></PrivateSuspenseRoute> },
            { path: '/study-resources', element: <PrivateRoute><MembershipGate requiredTier="plus"><Suspense fallback={<PageLoadingSpinner />}><StudyResources /></Suspense></MembershipGate></PrivateRoute> },
      { path: '/dashboard', element: <PrivateSuspenseRoute><Dashboard /></PrivateSuspenseRoute> },
      { path: '/progress', element: <PrivateSuspenseRoute><ProgressDashboard /></PrivateSuspenseRoute> },
      { path: '/skills', element: <PrivateSuspenseRoute><SkillsPractice /></PrivateSuspenseRoute> },
      { path: '/subcategory-progress/:subcategoryId', element: <PrivateSuspenseRoute><SubcategoryProgressPage /></PrivateSuspenseRoute> },
      { path: '/word-bank', element: <PrivateSuspenseRoute><WordBank /></PrivateSuspenseRoute> },
      { path: '/flashcards', element: <PrivateSuspenseRoute><Flashcards /></PrivateSuspenseRoute> },
      { path: '/concept-bank', element: <PrivateSuspenseRoute><ConceptBank /></PrivateSuspenseRoute> },
      { path: '/concept-detail/:conceptId', element: <PrivateSuspenseRoute><ConceptDetail /></PrivateSuspenseRoute> },
      { path: '/concept/:conceptId', element: <PrivateSuspenseRoute><ConceptPractice /></PrivateSuspenseRoute> },
      { path: '/learn/:subcategoryId', element: <PrivateSuspenseRoute><SubcategoryLearnPage /></PrivateSuspenseRoute> },
      { path: '/lesson/:skillTag', element: <Navigate to="/progress" replace /> },
      { path: '/skill-drill/:skillTag', element: <Navigate to="/smart-quiz-generator" replace /> },
      { path: '/practice-exams', element: <PrivateSuspenseRoute><PracticeExamList /></PrivateSuspenseRoute> },
      { path: '/practice-exam/:examId', element: <PrivateSuspenseRoute><PracticeExamController /></PrivateSuspenseRoute> },
      { path: '/practice-exam/:examId/results', element: <PrivateSuspenseRoute><ExamResults /></PrivateSuspenseRoute> },
      { path: '/admin', element: <PrivateSuspenseRoute><AdminDashboard /></PrivateSuspenseRoute> },
      { path: '/admin/ai-content', element: <PrivateSuspenseRoute><AdminAiContent /></PrivateSuspenseRoute> },
      { path: '/admin/reported-questions', element: <PrivateSuspenseRoute><AdminReportedQuestions /></PrivateSuspenseRoute> },
      { path: '/admin/practice-exams', element: <PrivateSuspenseRoute><PracticeExamManagerPage /></PrivateSuspenseRoute> },
      { path: '/admin/question-editor', element: <PrivateSuspenseRoute><QuestionEditor /></PrivateSuspenseRoute> },
      { path: '/admin/question-editor/:questionId', element: <PrivateSuspenseRoute><QuestionEditor /></PrivateSuspenseRoute> },
      { path: '/admin/subcategory-settings', element: <PrivateSuspenseRoute><SubcategorySettings /></PrivateSuspenseRoute> },
      { path: '/admin/concept-import', element: <PrivateSuspenseRoute><ConceptImport /></PrivateSuspenseRoute> },
      { path: '/admin/question-import', element: <PrivateSuspenseRoute><QuestionImport /></PrivateSuspenseRoute> },
      { path: '/admin/graph-generation', element: <PrivateSuspenseRoute><GraphGenerationPage /></PrivateSuspenseRoute> },
      { path: '/admin/graph-descriptions', element: <PrivateSuspenseRoute><GraphDescriptionTool /></PrivateSuspenseRoute> },
      { path: '/admin/learning-content', element: <PrivateSuspenseRoute><AdminLearningContent /></PrivateSuspenseRoute> },
      { path: '/admin/blog-management', element: <PrivateSuspenseRoute><AdminBlogManagement /></PrivateSuspenseRoute> },
      { path: '/admin/membership-management', element: <PrivateSuspenseRoute><MembershipManagement /></PrivateSuspenseRoute> },
      { path: '/membership/upgrade', element: <PrivateSuspenseRoute><MembershipUpgrade /></PrivateSuspenseRoute> },
      { path: '/payment/success', element: <PrivateSuspenseRoute><PaymentSuccess /></PrivateSuspenseRoute> },
      { path: '/payment/cancel', element: <PrivateSuspenseRoute><PaymentCancel /></PrivateSuspenseRoute> },
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
            <CriticalCSS />
            <RouterProvider router={router} />
          </SidebarProvider>
        </ReviewProvider>
      </SubcategoryProvider>
    </AuthProvider>
  );
}

export default App;
