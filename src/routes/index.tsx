import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router';
import { ProtectedRoute } from './protected-route';
import { AdminRoute } from './admin-route';
import { useAuthStore } from '@/lib/stores/auth-store';
import { PageLoader } from '@/components/ui/page-loader';

// Layouts
import { DashboardLayout } from '@/components/layout/dashboard-layout';

// Pages (Lazy Loaded)
const Landing = lazy(() => import('@/pages/landing').then((m) => ({ default: m.Landing })));
const Login = lazy(() => import('@/pages/login').then((m) => ({ default: m.Login })));
const Register = lazy(() => import('@/pages/register').then((m) => ({ default: m.Register })));
const ForgotPassword = lazy(() =>
  import('@/pages/forgot-password').then((m) => ({ default: m.ForgotPassword })),
);
const VerifyEmail = lazy(() =>
  import('@/pages/verify-email').then((m) => ({ default: m.VerifyEmail })),
);
const ResetPassword = lazy(() =>
  import('@/pages/reset-password').then((m) => ({ default: m.ResetPassword })),
);

const Dashboard = lazy(() => import('@/pages/dashboard').then((m) => ({ default: m.Dashboard })));
const Leaderboard = lazy(() =>
  import('@/pages/leaderboard').then((m) => ({ default: m.Leaderboard })),
);
const Teams = lazy(() =>
  import('@/pages/teams-overview').then((m) => ({ default: m.TeamsOverview })),
);
const TeamDetail = lazy(() => import('@/pages/team-hub').then((m) => ({ default: m.TeamHub })));
const Missions = lazy(() =>
  import('@/pages/mission-portal').then((m) => ({ default: m.MissionPortalPage })),
);
const MissionDetail = lazy(() =>
  import('@/pages/mission-detail').then((m) => ({ default: m.MissionDetailPage })),
);
const Challenges = lazy(() =>
  import('@/pages/challenge-arena').then((m) => ({ default: m.ChallengeArenaPage })),
);
const HallOfFame = lazy(() =>
  import('@/pages/hall-of-fame').then((m) => ({ default: m.HallOfFamePage })),
);
const Profile = lazy(() => import('@/pages/profile').then((m) => ({ default: m.Profile })));
const Settings = lazy(() => import('@/pages/settings').then((m) => ({ default: m.Settings })));

const AdminDashboard = lazy(() =>
  import('@/pages/admin/admin-dashboard').then((m) => ({ default: m.AdminDashboardPage })),
);
const AdminUsers = lazy(() =>
  import('@/pages/admin/admin-users').then((m) => ({ default: m.AdminUsersPage })),
);
const AdminTeams = lazy(() =>
  import('@/pages/admin/admin-teams').then((m) => ({ default: m.AdminTeamsPage })),
);
const AdminMissions = lazy(() =>
  import('@/pages/admin/admin-missions').then((m) => ({ default: m.AdminMissionsPage })),
);
const AdminChallenges = lazy(() =>
  import('@/pages/admin/admin-challenges').then((m) => ({ default: m.AdminChallengesPage })),
);
const AdminScores = lazy(() =>
  import('@/pages/admin/admin-scores').then((m) => ({ default: m.AdminScoresPage })),
);
const NotFound = lazy(() => import('@/pages/not-found').then((m) => ({ default: m.NotFound })));

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (isAuthenticated) {
    if (user?.verified === false) return <Navigate to="/verify-email" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

const VerifyRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.verified) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

export const AppRoutes = () => {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-bg">
          <PageLoader />
        </div>
      }
    >
      <Routes>
        {/* Public Routes */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <Landing />
            </PublicRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        <Route
          path="/verify-email"
          element={
            <VerifyRoute>
              <VerifyEmail />
            </VerifyRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          }
        />
        <Route
          path="/reset-password/:token"
          element={
            <PublicRoute>
              <ResetPassword />
            </PublicRoute>
          }
        />

        {/* Protected Routes inside Dashboard Layout */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/teams/:teamId" element={<TeamDetail />} />
          <Route path="/missions" element={<Missions />} />
          <Route path="/missions/:missionId" element={<MissionDetail />} />
          <Route path="/challenges" element={<Challenges />} />
          <Route path="/hall-of-fame" element={<HallOfFame />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <AdminUsers />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/teams"
            element={
              <AdminRoute>
                <AdminTeams />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/missions"
            element={
              <AdminRoute>
                <AdminMissions />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/challenges"
            element={
              <AdminRoute>
                <AdminChallenges />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/scores"
            element={
              <AdminRoute>
                <AdminScores />
              </AdminRoute>
            }
          />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};
