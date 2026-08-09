import React, { Suspense } from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
  useLocation,
} from 'react-router-dom';

// Only import critical components that are needed immediately
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import VerifyEmail from './pages/VerifyEmail';
import PrivateRoute from './components/auth/PrivateRoute';
import AdminRoute from './components/auth/AdminRoute';
import { AuthProvider } from './contexts/AuthContext';
import { SubcategoryProvider } from './contexts/SubcategoryContext';
import { ReviewProvider } from './contexts/ReviewContext';
import { AICompanionProvider } from './contexts/AICompanionContext';

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
import { CoachProvider } from './contexts/CoachContext';
import CoachDock from './components/coach/CoachDock';
import RouteErrorBoundary from './components/errors/RouteErrorBoundary';
import EmailVerificationBanner from './components/EmailVerificationBanner';
import PageSkeleton from './components/PageSkeleton';

// Styles
import './styles/App.css';

// Loading component for Suspense fallback (P0-D: page-shaped skeleton)
const PageLoadingSpinner = () => <PageSkeleton />;

// Lazy load all pages for code splitting
// (Overhaul Phase A: retired landing variants + the dead legacy exam system
//  are deleted; their URLs redirect. See SITE_OVERHAUL_PLAN.md.)
const LandingPageV3 = React.lazy(() => import('./pages/LandingPageV3'));
const ExamResults = React.lazy(() => import('./pages/ExamResults'));
const NotFound = React.lazy(() => import('./pages/NotFound'));
const Profile = React.lazy(() => import('./pages/Profile'));
const WordBank = React.lazy(() => import('./pages/WordBank'));
const Flashcards = React.lazy(() => import('./pages/Flashcards'));
const ConceptBank = React.lazy(() => import('./pages/ConceptBank'));
const ConceptDetail = React.lazy(() => import('./pages/ConceptDetail'));

// Practice Exam Pages
const PracticeExamList = React.lazy(() => import('./pages/PracticeExamList'));
const PracticeExamController = React.lazy(() => import('./pages/PracticeExamController'));
const PredictiveExam = React.lazy(() => import('./pages/PredictiveExam'));

// Adaptive Learning Pages
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const CoachPage = React.lazy(() => import('./pages/CoachPage'));
const ProgressDashboard = React.lazy(() => import('./pages/ProgressDashboard'));

// Admin Pages (heavy components that should definitely be code split)
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const AdminAiContent = React.lazy(() => import('./pages/AdminAiContent'));
const AdminReportedQuestions = React.lazy(() => import('./pages/AdminReportedQuestions'));
const PracticeExamManagerPage = React.lazy(() => import('./pages/PracticeExamManagerPage'));
const QuestionEditor = React.lazy(() => import('./pages/QuestionEditor'));
const AdminQuestionCreation = React.lazy(() => import('./pages/AdminQuestionCreation'));
const AdminQuestionAudit = React.lazy(() => import('./pages/AdminQuestionAudit'));
const AdminExamQualityControl = React.lazy(() => import('./pages/AdminExamQualityControl'));
const AdminBlogManagement = React.lazy(() => import('./pages/AdminBlogManagement'));
const AdminLearningContent = React.lazy(() => import('./pages/AdminLearningContent'));
const MembershipManagement = React.lazy(() => import('./components/admin/MembershipManagement'));
const CouponManagement = React.lazy(() => import('./components/admin/CouponManagement'));
const SubcategorySettings = React.lazy(() => import('./components/admin/SubcategorySettings'));
const ConceptImport = React.lazy(() => import('./pages/ConceptImport'));
const QuestionImport = React.lazy(() => import('./pages/QuestionImport'));
const AdminQuestionQuality = React.lazy(() => import('./pages/AdminQuestionQuality'));
const ExamIngestion = React.lazy(() => import('./pages/ExamIngestion'));

// Quiz and Learning Pages
const AllExamResults = React.lazy(() => import('./pages/AllExamResults'));
const SmartQuiz = React.lazy(() => import('./pages/SmartQuiz'));
const SmartQuizGenerator = React.lazy(() => import('./pages/SmartQuizGenerator'));
const SmartQuizResults = React.lazy(() => import('./pages/SmartQuizResults'));
const PracticeBuilder = React.lazy(() => import('./pages/PracticeBuilder'));
const PreviousPractice = React.lazy(() => import('./pages/PreviousPractice'));
const PlannerPage = React.lazy(() => import('./pages/PlannerPage'));
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
const LegacyAdaptiveQuizRedirect = React.lazy(() => import('./pages/LegacyAdaptiveQuizRedirect'));
const LegacyLessonRedirect = React.lazy(() => import('./pages/LegacyLessonRedirect'));
const LegacySkillDrillRedirect = React.lazy(() => import('./pages/LegacySkillDrillRedirect'));
const LegacyStudyResourceRedirect = React.lazy(() => import('./pages/LegacyStudyResourceRedirect'));

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
const GuestSubjectQuizzes = React.lazy(() => import('./pages/GuestSubjectQuizzes'));
const GuestSmartQuiz = React.lazy(() => import('./pages/GuestSmartQuiz'));

// Payment Pages
const MembershipUpgrade = React.lazy(() => import('./components/MembershipUpgrade'));
const PaymentSuccess = React.lazy(() => import('./pages/PaymentSuccess'));
const PaymentCancel = React.lazy(() => import('./pages/PaymentCancel'));

// Repair Engine Pages
const ConceptPractice = React.lazy(() => import('./pages/ConceptPractice'));
const SubcategoryLearnPage = React.lazy(() => import('./pages/SubcategoryLearnPage'));
// Lesson v2 rollout: serves the redesigned LessonPage where v2 content
// exists, the legacy SubcategoryLearnPage otherwise (see LearnRouteSwitch).
const LearnRouteSwitch = React.lazy(() => import('./pages/LearnRouteSwitch'));

// Helper function to create private suspense routes
const PrivateSuspenseRoute = ({ children }) => (
  <PrivateRoute>
    <Suspense fallback={<PageLoadingSpinner />}>
      {children}
    </Suspense>
  </PrivateRoute>
);

// Pro-gated route (Overhaul Phase C): real route-level enforcement — deep links
// can no longer bypass the link-level gates.
const ProSuspenseRoute = ({ children }) => (
  <PrivateRoute>
    <MembershipGate requiredTier="plus">
      <Suspense fallback={<PageLoadingSpinner />}>
        {children}
      </Suspense>
    </MembershipGate>
  </PrivateRoute>
);

const AdminSuspenseRoute = ({ children }) => (
  <AdminRoute>
    <Suspense fallback={<PageLoadingSpinner />}>
      {children}
    </Suspense>
  </AdminRoute>
);

// Define a RootLayout component that includes the common UI structure
const RootLayout = () => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const isExamPage = location.pathname.includes('/practice-exam/') || location.pathname.includes('/exam/');
  // Only active quiz/exam experiences run without the app shell (focus mode).
  // Everything else — including /practice-exams — uses the ONE shell.
  const isSmartQuizPage = location.pathname.startsWith('/smart-quiz/');
  const isCustomShellPage = isSmartQuizPage;
  const showProfileDropdown = !isCustomShellPage && (!isMobile || !isExamPage);

  return (
    <SidebarVisibility>
      <AnalyticsTracker />
      <div className={`app-container ${isCustomShellPage ? 'custom-page-shell' : ''}`}>
        {!isCustomShellPage && (isMobile ? <TopNavBar /> : <Sidebar />)}
        <div className="main-content">
          {!isCustomShellPage && <EmailVerificationBanner />}
          {showProfileDropdown && (
            <div className="top-bar">
              <ProfileDropdown />
            </div>
          )}
          <Outlet />
        </div>
      </div>
      {/* AI Coach (Phase 1) — global presence; hides itself during exams and for guests */}
      <CoachDock />
    </SidebarVisibility>
  );
};

// Create the router configuration using the modern createBrowserRouter API
const router = createBrowserRouter([
  // Landing page with special layout (no sidebar)
  {
    path: '/',
    element: <LandingPageLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { path: '/', element: <Suspense fallback={<PageLoadingSpinner />}><LandingPageV3 /></Suspense> },
      // Retired landing variants — URLs redirect so old links/ads still land
      { path: '/landing-old', element: <Navigate to="/" replace /> },
      { path: '/landing-original', element: <Navigate to="/" replace /> },
      { path: '/landing_page', element: <Navigate to="/" replace /> },
      { path: '/landingpage2', element: <Navigate to="/" replace /> },
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
  // Retired AI-chat onboarding (Overhaul Phase E): one onboarding path only —
  // signup → Home first-steps → coach.
  {
    path: '/onboarding',
    element: <Navigate to="/dashboard" replace />,
    errorElement: <RouteErrorBoundary />,
  },
  // All other routes with standard layout (with sidebar)
  {
    element: <RootLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { path: '/profile', element: <PrivateSuspenseRoute><Profile /></PrivateSuspenseRoute> },
      // Dead legacy exam system removed (Overhaul Phase A) — URLs redirect
      { path: '/exam/landing', element: <Navigate to="/practice-exams" replace /> },
      { path: '/exam/results/:examId?', element: <PrivateSuspenseRoute><ExamResults /></PrivateSuspenseRoute> },
      { path: '/exam/:moduleId', element: <Navigate to="/practice-exams" replace /> },
      { path: '/intermission', element: <Navigate to="/practice-exams" replace /> },
      { path: '/results/:examId?', element: <Navigate to="/all-results" replace /> },
      { path: '/all-results', element: <PrivateSuspenseRoute><AllExamResults /></PrivateSuspenseRoute> },
      { path: '/smart-quiz-generator', element: <PrivateSuspenseRoute><SmartQuizGenerator /></PrivateSuspenseRoute> },
      { path: '/smart-quiz-intro', element: <PrivateSuspenseRoute><SmartQuizIntro /></PrivateSuspenseRoute> },
      { path: '/smart-quiz/:quizId', element: <PrivateSuspenseRoute><SmartQuiz /></PrivateSuspenseRoute> },
      { path: '/smart-quiz-results/:quizId', element: <PrivateSuspenseRoute><SmartQuizResults /></PrivateSuspenseRoute> },
      { path: '/subject-quizzes', element: <PrivateSuspenseRoute><SubjectQuizzes /></PrivateSuspenseRoute> },
      { path: '/practice', element: <PrivateSuspenseRoute><PracticeBuilder /></PrivateSuspenseRoute> },
      { path: '/practice/history', element: <PrivateSuspenseRoute><PreviousPractice /></PrivateSuspenseRoute> },
      { path: '/planner', element: <PrivateSuspenseRoute><PlannerPage /></PrivateSuspenseRoute> },
      { path: '/lectures', element: <ProSuspenseRoute><LecturesPage /></ProSuspenseRoute> },
      { path: '/adaptive-quiz/:quizId', element: <PrivateSuspenseRoute><LegacyAdaptiveQuizRedirect /></PrivateSuspenseRoute> },
      { path: '/resources/:resourceId', element: <PrivateSuspenseRoute><LegacyStudyResourceRedirect /></PrivateSuspenseRoute> },
      { path: '/study-resources', element: <Navigate to="/lectures" replace /> },
      { path: '/dashboard', element: <PrivateSuspenseRoute><Dashboard /></PrivateSuspenseRoute> },
      { path: '/ai-coach', element: <PrivateSuspenseRoute><CoachPage /></PrivateSuspenseRoute> },
      { path: '/coach', element: <PrivateSuspenseRoute><CoachPage /></PrivateSuspenseRoute> },
      { path: '/progress', element: <PrivateSuspenseRoute><ProgressDashboard /></PrivateSuspenseRoute> },
      // Skills Practice absorbed into Question Bank (it also crashed — audit §4)
      { path: '/skills', element: <Navigate to="/subject-quizzes" replace /> },
      { path: '/subcategory-progress/:subcategoryId', element: <PrivateSuspenseRoute><SubcategoryProgressPage /></PrivateSuspenseRoute> },
      { path: '/word-bank', element: <PrivateSuspenseRoute><WordBank /></PrivateSuspenseRoute> },
      { path: '/flashcards', element: <ProSuspenseRoute><Flashcards /></ProSuspenseRoute> },
      { path: '/concept-bank', element: <ProSuspenseRoute><ConceptBank /></ProSuspenseRoute> },
      { path: '/concept-detail/:conceptId', element: <PrivateSuspenseRoute><ConceptDetail /></PrivateSuspenseRoute> },
      { path: '/concept/:conceptId', element: <PrivateSuspenseRoute><ConceptPractice /></PrivateSuspenseRoute> },
      { path: '/learn/:subcategoryId', element: <ProSuspenseRoute><LearnRouteSwitch /></ProSuspenseRoute> },
      // Retired lesson pages stay reachable for admins during the redesign
      { path: '/admin/legacy-learn/:subcategoryId', element: <AdminSuspenseRoute><SubcategoryLearnPage /></AdminSuspenseRoute> },
      { path: '/lesson/:skillTag', element: <PrivateSuspenseRoute><LegacyLessonRedirect /></PrivateSuspenseRoute> },
      { path: '/skill-drill/:skillTag', element: <PrivateSuspenseRoute><LegacySkillDrillRedirect /></PrivateSuspenseRoute> },
      { path: '/practice-exams', element: <PrivateSuspenseRoute><PracticeExamList /></PrivateSuspenseRoute> },
      { path: '/predictive-exam', element: <PrivateSuspenseRoute><PredictiveExam /></PrivateSuspenseRoute> },
      { path: '/practice-exam/:examId', element: <PrivateSuspenseRoute><PracticeExamController /></PrivateSuspenseRoute> },
      { path: '/practice-exam/:examId/results', element: <Navigate to="/all-results" replace /> },
      { path: '/guest-subject-quizzes', element: <Suspense fallback={<PageLoadingSpinner />}><GuestSubjectQuizzes /></Suspense> },
      { path: '/guest-smart-quiz', element: <Suspense fallback={<PageLoadingSpinner />}><GuestSmartQuiz /></Suspense> },
      { path: '/admin', element: <AdminSuspenseRoute><AdminDashboard /></AdminSuspenseRoute> },
      { path: '/admin/ai-content', element: <AdminSuspenseRoute><AdminAiContent /></AdminSuspenseRoute> },
      { path: '/admin/reported-questions', element: <AdminSuspenseRoute><AdminReportedQuestions /></AdminSuspenseRoute> },
      { path: '/admin/practice-exams', element: <AdminSuspenseRoute><PracticeExamManagerPage /></AdminSuspenseRoute> },
      { path: '/admin/question-creation', element: <AdminSuspenseRoute><AdminQuestionCreation /></AdminSuspenseRoute> },
      { path: '/admin/question-audit', element: <AdminSuspenseRoute><AdminQuestionAudit /></AdminSuspenseRoute> },
      { path: '/admin/exam-quality-control', element: <AdminSuspenseRoute><AdminExamQualityControl /></AdminSuspenseRoute> },
      { path: '/admin/question-editor', element: <AdminSuspenseRoute><QuestionEditor /></AdminSuspenseRoute> },
      { path: '/admin/question-editor/:questionId', element: <AdminSuspenseRoute><QuestionEditor /></AdminSuspenseRoute> },
      { path: '/admin/subcategory-settings', element: <AdminSuspenseRoute><SubcategorySettings /></AdminSuspenseRoute> },
      { path: '/admin/concept-import', element: <AdminSuspenseRoute><ConceptImport /></AdminSuspenseRoute> },
      { path: '/admin/question-import', element: <AdminSuspenseRoute><QuestionImport /></AdminSuspenseRoute> },
      { path: '/admin/graph-generation', element: <AdminSuspenseRoute><GraphGenerationPage /></AdminSuspenseRoute> },
      { path: '/admin/graph-descriptions', element: <AdminSuspenseRoute><GraphDescriptionTool /></AdminSuspenseRoute> },
      { path: '/admin/learning-content', element: <AdminSuspenseRoute><AdminLearningContent /></AdminSuspenseRoute> },
      { path: '/admin/blog-management', element: <AdminSuspenseRoute><AdminBlogManagement /></AdminSuspenseRoute> },
      { path: '/admin/question-quality', element: <AdminSuspenseRoute><AdminQuestionQuality /></AdminSuspenseRoute> },
      { path: '/admin/membership-management', element: <AdminSuspenseRoute><MembershipManagement /></AdminSuspenseRoute> },
      { path: '/admin/coupon-management', element: <AdminSuspenseRoute><CouponManagement /></AdminSuspenseRoute> },
      { path: '/admin/exam-ingestion', element: <AdminSuspenseRoute><ExamIngestion /></AdminSuspenseRoute> },
      { path: '/membership/upgrade', element: <PrivateSuspenseRoute><MembershipUpgrade /></PrivateSuspenseRoute> },
      { path: '/payment/success', element: <PrivateSuspenseRoute><PaymentSuccess /></PrivateSuspenseRoute> },
      { path: '/payment/cancel', element: <PrivateSuspenseRoute><PaymentCancel /></PrivateSuspenseRoute> },
      // Real 404 instead of a silent dump onto the marketing page
      { path: '*', element: <Suspense fallback={<PageLoadingSpinner />}><NotFound /></Suspense> },
    ],
  },
]);

function App() {
  return (
    <AuthProvider>
      <AICompanionProvider>
        <CoachProvider>
        <SubcategoryProvider>
          <ReviewProvider>
            <SidebarProvider>
              <CriticalCSS />
              <RouterProvider router={router} />
            </SidebarProvider>
          </ReviewProvider>
        </SubcategoryProvider>
        </CoachProvider>
      </AICompanionProvider>
    </AuthProvider>
  );
}

export default App;
