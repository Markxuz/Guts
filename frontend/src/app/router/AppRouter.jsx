import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "../../features/auth/components/ProtectedRoute";
import LoginPage from "../../features/auth/pages/LoginPage";
import DashboardPage from "../../features/dashboard/pages/DashboardPage";
import EnrollmentsPage from "../../features/enrollments/pages/EnrollmentsPage";
import ReportsPage from "../../features/dashboard/pages/ReportsPage";
import InstructorsPage from "../../features/settings/pages/InstructorsPage";
import ManageUsersPage from "../../features/settings/pages/ManageUsersPage";
import StudentsPage from "../../features/students/pages/StudentsPage";
import VehiclesPage from "../../features/settings/pages/VehiclesPage";
import AppLayout from "../../shared/layout/AppLayout";
import { useAuth } from "../../features/auth/hooks/useAuth";

function RoleRoute({ allowedRoles, children }) {
  const { role } = useAuth();
  if (!allowedRoles.includes(role)) return <Navigate to="/" replace />;
  return children;
}

export default function AppRouter() {
  return (
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
        <Route path="/students" element={<StudentsPage />} />
        <Route
          path="/reports"
          element={
            <RoleRoute allowedRoles={["admin", "sub_admin"]}>
              <ReportsPage />
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
  );
}
