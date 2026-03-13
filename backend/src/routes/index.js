const express = require("express");
const {
  Course,
  Package: PackageModel,
  DLCode,
  Instructor,
  Vehicle,
  Schedule,
  Certificate,
} = require("../../models");
const createCrudRouter = require("../../routes/createCrudRouter");
const authRoutes = require("../modules/auth/auth.routes");
const activityLogRoutes = require("../modules/activity-logs/activity-logs.routes");
const reportsRoutes = require("../modules/reports/reports.routes");
const studentRoutes = require("../modules/students/students.routes");
const enrollmentRoutes = require("../modules/enrollments/enrollments.routes");
const dashboardRoutes = require("../modules/dashboard/dashboard.routes");
const notificationRoutes = require("../modules/notifications/notifications.routes");
const usersRoutes = require("../modules/users/users.routes");
const scheduleRoutes = require("../modules/schedules/schedules.routes");

function createApiRouter() {
  const router = express.Router();

  router.use("/auth", authRoutes);
  router.use("/activity-logs", activityLogRoutes);
  router.use("/dashboard", dashboardRoutes);
  router.use("/reports", reportsRoutes);
  router.use("/students", studentRoutes);
  router.use("/enrollments", enrollmentRoutes);
  router.use("/notifications", notificationRoutes);
  router.use("/users", usersRoutes);
  router.use("/courses", createCrudRouter(Course, { createRequiredFields: ["course_name"] }));
  router.use("/packages", createCrudRouter(PackageModel, { createRequiredFields: ["package_name"] }));
  router.use("/dl-codes", createCrudRouter(DLCode, { createRequiredFields: ["code"] }));
  router.use("/instructors", createCrudRouter(Instructor, { createRequiredFields: ["name"] }));
  router.use(
    "/vehicles",
    createCrudRouter(Vehicle, { createRequiredFields: ["plate_number", "vehicle_type"] })
  );
  router.use("/schedules", scheduleRoutes);
  router.use(
    "/certificates",
    createCrudRouter(Certificate, { createRequiredFields: ["certificate_number"] })
  );

  return router;
}

module.exports = {
  createApiRouter,
};
