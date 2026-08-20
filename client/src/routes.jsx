import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '@store/authStore';
import { Spinner } from '@components/ui/Primitives';
import Navbar from '@components/layout/Navbar';
import Footer from '@components/layout/Footer';

// ── Lazy page imports ───────────────────────
const Home = lazy(() => import('@pages/Home'));
const Builder = lazy(() => import('@pages/Builder'));
const Catalog = lazy(() => import('@pages/Catalog'));
const Packages = lazy(() => import('@pages/Packages'));
const Industries = lazy(() => import('@pages/Industries'));
const Portfolio = lazy(() => import('@pages/Portfolio'));
const Pricing = lazy(() => import('@pages/Pricing'));
const About = lazy(() => import('@pages/About'));
const Careers = lazy(() => import('@pages/Careers'));
const HiringWall = lazy(() => import('@pages/HiringWall'));
const ProjectWall = lazy(() => import('@pages/ProjectWall'));
const Resources = lazy(() => import('@pages/Resources'));
const BlogPost = lazy(() => import('@pages/BlogPost'));
const Contact = lazy(() => import('@pages/Contact'));
const Legal = lazy(() => import('@pages/Legal'));

// Auth
const Login = lazy(() => import('@pages/auth/Login'));
const Signup = lazy(() => import('@pages/auth/Signup'));
const ForgotPassword = lazy(() => import('@pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('@pages/auth/ResetPassword'));
const VerifyEmail = lazy(() => import('@pages/auth/VerifyEmail'));

// Client dashboard
const ClientLayout = lazy(() => import('@app/client/ClientLayout'));
const ClientOverview = lazy(() => import('@app/client/Overview'));
const ClientProjects = lazy(() => import('@app/client/Projects'));
const ClientQuotes = lazy(() => import('@app/client/Quotes'));
const ClientInvoices = lazy(() => import('@app/client/Invoices'));
const ClientFiles = lazy(() => import('@app/client/Files'));
const ClientMessages = lazy(() => import('@app/client/Messages'));
const ClientProfile = lazy(() => import('@app/client/Profile'));
const ClientSupport = lazy(() => import('@app/client/Support'));
const ClientCart = lazy(() => import('@app/client/Cart'));
const ClientEngagements = lazy(() => import('@app/client/Engagements'));
const ClientContracts = lazy(() => import('@app/client/Contracts'));
const ClientTimesheets = lazy(() => import('@app/client/Timesheets'));
const ClientNotifications = lazy(() => import('@app/client/Notifications'));

// Team dashboard
const TeamLayout = lazy(() => import('@app/team/TeamLayout'));
const TeamDashboard = lazy(() => import('@app/team/Dashboard'));
const TeamTasks = lazy(() => import('@app/team/Tasks'));
const TeamProjects = lazy(() => import('@app/team/Projects'));
const TeamProfile = lazy(() => import('@app/team/Profile'));
const TeamTimesheets = lazy(() => import('@app/team/Timesheets'));

// Admin dashboard
const AdminLayout = lazy(() => import('@app/admin/AdminLayout'));
const AdminOverview = lazy(() => import('@app/admin/Overview'));
const AdminCatalog = lazy(() => import('@app/admin/Catalog'));
const AdminHiring = lazy(() => import('@app/admin/Hiring'));
const AdminOrders = lazy(() => import('@app/admin/Orders'));
const AdminProjects = lazy(() => import('@app/admin/Projects'));
const AdminUsers = lazy(() => import('@app/admin/Users'));
const AdminProjectWall = lazy(() => import('@app/admin/ProjectWall'));
const AdminContent = lazy(() => import('@app/admin/Content'));
const AdminAnalytics = lazy(() => import('@app/admin/Analytics'));
const AdminSettings = lazy(() => import('@app/admin/Settings'));
const AdminFinance = lazy(() => import('@app/admin/Finance'));
const AdminEngagements = lazy(() => import('@app/admin/Engagements'));
const AdminNotifications = lazy(() => import('@app/admin/Notifications'));

// ── Layout wrappers ─────────────────────────

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <Spinner size="lg" />
  </div>
);

const PublicLayout = () => (
  <>
    <Navbar />
    <main className="flex-1 pt-16">
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
    </main>
    <Footer />
  </>
);

const ProtectedRoute = ({ roles }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user?.role?.toLowerCase();
  if (roles && !roles.includes(userRole) && !roles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <Outlet />
    </Suspense>
  );
};

const AuthLayout = () => {
  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) return <Navigate to="/" replace />;

  return (
    <Suspense fallback={<PageLoader />}>
      <Outlet />
    </Suspense>
  );
};

// ── Route config ────────────────────────────

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public pages */}
      <Route element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="builder" element={<Builder />} />
        <Route path="catalog" element={<Catalog />} />
        <Route path="packages" element={<Packages />} />
        <Route path="industries" element={<Industries />} />
        <Route path="portfolio" element={<Portfolio />} />
        <Route path="pricing" element={<Pricing />} />
        <Route path="about" element={<About />} />
        <Route path="careers" element={<Careers />} />
        <Route path="hiring-wall" element={<HiringWall />} />
        <Route path="project-wall" element={<ProjectWall />} />
        <Route path="resources" element={<Resources />} />
        <Route path="resources/:id" element={<BlogPost />} />
        <Route path="contact" element={<Contact />} />
        <Route path="legal/*" element={<Legal />} />
      </Route>

      {/* Auth pages (no navbar/footer) */}
      <Route element={<AuthLayout />}>
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password" element={<ResetPassword />} />
        <Route path="verify-email" element={<VerifyEmail />} />
      </Route>

      {/* Client dashboard */}
      <Route path="app/client" element={<ProtectedRoute roles={['client', 'admin', 'CLIENT', 'CLIENT_ADMIN', 'CLIENT_PM', 'CLIENT_VIEWER', 'ADMIN']} />}>
        <Route element={<ClientLayout />}>
          <Route index element={<ClientOverview />} />
          <Route path="projects" element={<ClientProjects />} />
          <Route path="projects/:id" element={<ClientProjects />} />
          <Route path="quotes" element={<ClientQuotes />} />
          <Route path="invoices" element={<ClientInvoices />} />
          <Route path="invoices/:id" element={<ClientInvoices />} />
          <Route path="files" element={<ClientFiles />} />
          <Route path="messages" element={<ClientMessages />} />
          <Route path="messages/:id" element={<ClientMessages />} />
          <Route path="profile" element={<ClientProfile />} />
          <Route path="support" element={<ClientSupport />} />
          <Route path="cart" element={<ClientCart />} />
          <Route path="engagements" element={<ClientEngagements />} />
          <Route path="engagements/:id" element={<ClientEngagements />} />
          <Route path="contracts" element={<ClientContracts />} />
          <Route path="contracts/:id" element={<ClientContracts />} />
          <Route path="timesheets" element={<ClientTimesheets />} />
          <Route path="notifications" element={<ClientNotifications />} />
        </Route>
      </Route>

      {/* Team dashboard */}
      <Route path="app/team" element={<ProtectedRoute roles={['team', 'admin', 'SE', 'SENIOR_PM', 'PM', 'DEVELOPER', 'QA', 'DESIGNER', 'DEVOPS', 'ADMIN']} />}>
        <Route element={<TeamLayout />}>
          <Route index element={<TeamDashboard />} />
          <Route path="tasks" element={<TeamTasks />} />
          <Route path="projects" element={<TeamProjects />} />
          <Route path="projects/:id" element={<TeamProjects />} />
          <Route path="timesheets" element={<TeamTimesheets />} />
          <Route path="profile" element={<TeamProfile />} />
        </Route>
      </Route>

      {/* Admin dashboard */}
      <Route path="app/admin" element={<ProtectedRoute roles={['admin', 'ADMIN']} />}>
        <Route element={<AdminLayout />}>
          <Route index element={<AdminOverview />} />
          <Route path="catalog" element={<AdminCatalog />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="projects" element={<AdminProjects />} />
          <Route path="projects/:id" element={<AdminProjects />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="hiring" element={<AdminHiring />} />
          <Route path="project-wall" element={<AdminProjectWall />} />
          <Route path="content" element={<AdminContent />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="finance" element={<AdminFinance />} />
          <Route path="engagements" element={<AdminEngagements />} />
          <Route path="notifications" element={<AdminNotifications />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
