export const routeLoaders = {
  loginPage: () => import("../../features/auth/pages/LoginPage"),
  dashboardPage: () => import("../../features/dashboard/pages/DashboardPage"),
  enrollmentsPage: () => import("../../features/enrollments/pages/EnrollmentsPage"),
  schedulePdcLaterPage: () => import("../../features/enrollments/pages/SchedulePdcLaterPage"),
  studentsPage: () => import("../../features/students/pages/StudentsPage"),
  reportsPage: () => import("../../features/dashboard/pages/ReportsPage"),
  overviewReportsPage: () => import("../../features/dashboard/pages/OverviewReportsPage"),
  instructorsPage: () => import("../../features/settings/pages/InstructorsPage"),
  vehiclesPage: () => import("../../features/settings/pages/VehiclesPage"),
  manageUsersPage: () => import("../../features/settings/pages/ManageUsersPage"),
  appLayout: () => import("../../shared/layout/AppLayout"),
};

const prefetchedPaths = new Set();

const pathLoaderMap = {
  "/": routeLoaders.dashboardPage,
  "/login": routeLoaders.loginPage,
  "/enrollments": routeLoaders.enrollmentsPage,
  "/enrollments/schedule-pdc-later": routeLoaders.schedulePdcLaterPage,
  "/students": routeLoaders.studentsPage,
  "/reports": routeLoaders.reportsPage,
  "/reports/overview": routeLoaders.overviewReportsPage,
  "/settings": routeLoaders.instructorsPage,
  "/settings/instructors": routeLoaders.instructorsPage,
  "/settings/vehicles": routeLoaders.vehiclesPage,
  "/settings/users": routeLoaders.manageUsersPage,
};

function normalizePath(path) {
  const value = String(path || "").trim();
  if (!value) return "";
  return value.split("?")[0].split("#")[0];
}

export function prefetchRoute(path) {
  const normalizedPath = normalizePath(path);
  if (!normalizedPath || prefetchedPaths.has(normalizedPath)) {
    return;
  }

  const loader = pathLoaderMap[normalizedPath];
  if (!loader) {
    return;
  }

  prefetchedPaths.add(normalizedPath);
  loader().catch(() => {
    prefetchedPaths.delete(normalizedPath);
  });
}

export function prefetchRoutes(paths = []) {
  const uniquePaths = Array.from(new Set((paths || []).map(normalizePath).filter(Boolean)));
  uniquePaths.forEach((path) => prefetchRoute(path));
}

export function prefetchRoutesWhenIdle(paths = []) {
  const run = () => prefetchRoutes(paths);

  if (typeof window !== "undefined" && typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback(run, { timeout: 1200 });
    return;
  }

  setTimeout(run, 250);
}
