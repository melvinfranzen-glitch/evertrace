import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import B2BRegister from './pages/B2BRegister';
import B2BDashboard from './pages/B2BDashboard';
import B2BCases from './pages/B2BCases';
import B2BCaseDetail from './pages/B2BCaseDetail';
import B2BCardWizard from './pages/B2BCardWizard';
import B2BCards from './pages/B2BCards';
import B2BMemorial from './pages/B2BMemorial';
import B2BOrders from './pages/B2BOrders';
import B2BAnalytics from './pages/B2BAnalytics';
import B2BSettings from './pages/B2BSettings';
import B2BPublicMemorial from './pages/B2BPublicMemorial';
import Legal from './pages/Legal';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/" element={
        <LayoutWrapper currentPageName={mainPageKey}>
          <MainPage />
        </LayoutWrapper>
      } />
      {Object.entries(Pages).map(([path, Page]) => (
        <Route
          key={path}
          path={`/${path}`}
          element={
            <LayoutWrapper currentPageName={path}>
              <Page />
            </LayoutWrapper>
          }
        />
      ))}
      <Route path="/B2BRegister" element={<B2BRegister />} />
      <Route path="/B2BDashboard" element={<B2BDashboard />} />
      <Route path="/B2BCases" element={<B2BCases />} />
      <Route path="/B2BCaseDetail" element={<B2BCaseDetail />} />
      <Route path="/B2BCardWizard" element={<B2BCardWizard />} />
      <Route path="/B2BCards" element={<B2BCards />} />
      <Route path="/B2BMemorial" element={<B2BMemorial />} />
      <Route path="/B2BOrders" element={<B2BOrders />} />
      <Route path="/B2BAnalytics" element={<B2BAnalytics />} />
      <Route path="/B2BSettings" element={<B2BSettings />} />
      <Route path="/B2BPublicMemorial" element={<B2BPublicMemorial />} />
      <Route path="/Legal" element={<LayoutWrapper currentPageName="Legal"><Legal /></LayoutWrapper>} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App