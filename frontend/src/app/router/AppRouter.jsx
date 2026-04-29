import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "../../features/auth/components/ProtectedRoute";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { routeLoaders } from "./routeLoaders";

const LoginPage = lazy(routeLoaders.loginPage);
const DashboardPage = lazy(routeLoaders.dashboardPage);
const EnrollmentsPage = lazy(routeLoaders.enrollmentsPage);
const SchedulePdcLaterPage = lazy(routeLoaders.schedulePdcLaterPage);
const PendingEnrollmentsPage = lazy(routeLoaders.pendingEnrollmentsPage);
const ReportsPage = lazy(routeLoaders.reportsPage);
const OverviewReportsPage = lazy(routeLoaders.overviewReportsPage);
const InstructorsPage = lazy(routeLoaders.instructorsPage);
const PromoOffersPage = lazy(routeLoaders.promoOffersPage);
const ManageUsersPage = lazy(routeLoaders.manageUsersPage);
const StudentsPage = lazy(routeLoaders.studentsPage);
const PaymentLedgerPage = lazy(routeLoaders.paymentLedgerPage);
const VehiclesPage = lazy(routeLoaders.vehiclesPage);
const AppLayout = lazy(routeLoaders.appLayout);

function RouteLoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 text-sm text-slate-600">
      Loading page...
    </div>
  );
}

function RoleRoute({ allowedRoles, children }) {
  const { role } = useAuth();
  if (!allowedRoles.includes(role)) return <Navigate to="/" replace />;
  return children;
}

export default function AppRouter() {
  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          element={
            <ProtectedRoute roles={["admin", "sub_admin", "staff"]}>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<DashboardPage />} />
          <Route path="/enrollments" element={<EnrollmentsPage />} />
          <Route path="/enrollments/pending" element={<PendingEnrollmentsPage />} />
          <Route path="/enrollments/schedule-pdc-later" element={<SchedulePdcLaterPage />} />
          <Route path="/students" element={<StudentsPage />} />
          <Route
            path="/payments"
            element={
              <RoleRoute allowedRoles={["admin", "sub_admin"]}>
                <PaymentLedgerPage />
              </RoleRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <RoleRoute allowedRoles={["admin", "sub_admin"]}>
                <ReportsPage />
              </RoleRoute>
            }
          />
          <Route
            path="/reports/overview"
            element={
              <RoleRoute allowedRoles={["admin", "sub_admin"]}>
                <OverviewReportsPage />
              </RoleRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <RoleRoute allowedRoles={["admin", "sub_admin"]}>
                <Navigate to="/settings/instructors" replace />
              </RoleRoute>
            }
          />
          <Route
            path="/settings/instructors"
            element={
              <RoleRoute allowedRoles={["admin", "sub_admin"]}>
                <InstructorsPage />
              </RoleRoute>
            }
          />
          <Route
            path="/settings/promo-offers"
            element={
              <RoleRoute allowedRoles={["admin"]}>
                <PromoOffersPage />
              </RoleRoute>
            }
          />
          <Route
            path="/settings/vehicles"
            element={
              <RoleRoute allowedRoles={["admin", "sub_admin"]}>
                <VehiclesPage />
              </RoleRoute>
            }
          />
          <Route
            path="/settings/users"
            element={
              <RoleRoute allowedRoles={["admin"]}>
                <ManageUsersPage />
              </RoleRoute>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
