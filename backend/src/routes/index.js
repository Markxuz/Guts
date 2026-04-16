const express = require("express");
const {
  Course,
  Package: PackageModel,
  DLCode,
  Instructor,
  Vehicle,
  Certificate,
  MaintenanceLog,
  FuelLog,
} = require("../../models");
const createCrudRouter = require("../../routes/createCrudRouter");
const authRoutes = require("../modules/auth/auth.routes");
const activityLogRoutes = require("../modules/activity-logs/activity-logs.routes");
const reportsRoutes = require("../modules/reports/reports.routes");
const studentRoutes = require("../modules/students/students.routes");
const enrollmentRoutes = require("../modules/enrollments/enrollments.routes");
const attendanceRoutes = require("../modules/attendance/attendance.routes");
const onlineIntakeRoutes = require("../modules/online-intake/online-intake.routes");
const dashboardRoutes = require("../modules/dashboard/dashboard.routes");
const notificationRoutes = require("../modules/notifications/notifications.routes");
const scheduleChangeRequestRoutes = require("../modules/schedule-change-requests/schedule-change-requests.routes");
const usersRoutes = require("../modules/users/users.routes");
const scheduleRoutes = require("../modules/schedules/schedules.routes");
const backupsRoutes = require("../modules/system-backup/system-backup.routes");
const { authenticateToken } = require("../shared/middleware/auth");
const resourceContracts = require("./resourceContracts");

function createApiRouter() {
  const router = express.Router();

  router.use("/auth", authRoutes);
  router.use("/activity-logs", activityLogRoutes);
  router.use("/dashboard", dashboardRoutes);
  router.use("/reports", reportsRoutes);
  router.use("/students", studentRoutes);
  router.use("/enrollments", enrollmentRoutes);
  router.use("/attendance", attendanceRoutes);
  router.use("/online-intake", onlineIntakeRoutes);
  router.use("/notifications", notificationRoutes);
  router.use("/schedule-change-requests", scheduleChangeRequestRoutes);
  router.use("/users", usersRoutes);
  router.use("/backups", backupsRoutes);
  router.use(
    "/courses",
    authenticateToken,
    createCrudRouter(Course, {
      createRequiredFields: ["course_name"],
      createSchema: resourceContracts.courses.createSchema,
      updateSchema: resourceContracts.courses.updateSchema,
    })
  );
  router.use(
    "/packages",
    authenticateToken,
    createCrudRouter(PackageModel, {
      createRequiredFields: ["package_name"],
      createSchema: resourceContracts.packages.createSchema,
      updateSchema: resourceContracts.packages.updateSchema,
    })
  );
  router.use(
    "/dl-codes",
    authenticateToken,
    createCrudRouter(DLCode, {
      createRequiredFields: ["code"],
      createSchema: resourceContracts.dlCodes.createSchema,
      updateSchema: resourceContracts.dlCodes.updateSchema,
    })
  );
  router.use(
    "/instructors",
    authenticateToken,
    createCrudRouter(Instructor, {
      createRequiredFields: ["name", "license_number", "specialization", "status"],
      createSchema: resourceContracts.instructors.createSchema,
      updateSchema: resourceContracts.instructors.updateSchema,
      listInclude: [
        {
          model: Vehicle,
          as: "assignedVehicle",
          attributes: ["id", "vehicle_name", "plate_number", "vehicle_type"],
          required: false,
        },
      ],
      detailInclude: [
        {
          model: Vehicle,
          as: "assignedVehicle",
          attributes: ["id", "vehicle_name", "plate_number", "vehicle_type"],
          required: false,
        },
      ],
    })
  );
  router.use(
    "/vehicles",
    authenticateToken,
    createCrudRouter(Vehicle, {
      createRequiredFields: ["plate_number", "vehicle_type"],
      createSchema: resourceContracts.vehicles.createSchema,
      updateSchema: resourceContracts.vehicles.updateSchema,
    })
  );
  router.use(
    "/maintenance-logs",
    authenticateToken,
    createCrudRouter(MaintenanceLog, {
      createRequiredFields: ["vehicle_id", "service_type", "date_of_service", "next_schedule_date"],
      createSchema: resourceContracts.maintenanceLogs.createSchema,
      updateSchema: resourceContracts.maintenanceLogs.updateSchema,
      listInclude: [
        {
          model: Vehicle,
          as: "vehicle",
          attributes: ["id", "vehicle_name", "plate_number", "vehicle_type"],
          required: false,
        },
      ],
      detailInclude: [
        {
          model: Vehicle,
          as: "vehicle",
          attributes: ["id", "vehicle_name", "plate_number", "vehicle_type"],
          required: false,
        },
      ],
    })
  );
  router.use(
    "/fuel-logs",
    authenticateToken,
    createCrudRouter(FuelLog, {
      createRequiredFields: ["vehicle_id", "liters", "amount_spent", "odometer_reading"],
      createSchema: resourceContracts.fuelLogs.createSchema,
      updateSchema: resourceContracts.fuelLogs.updateSchema,
      listInclude: [
        {
          model: Vehicle,
          as: "vehicle",
          attributes: ["id", "vehicle_name", "plate_number", "vehicle_type"],
          required: false,
        },
      ],
      detailInclude: [
        {
          model: Vehicle,
          as: "vehicle",
          attributes: ["id", "vehicle_name", "plate_number", "vehicle_type"],
          required: false,
        },
      ],
    })
  );
  router.use("/schedules", scheduleRoutes);
  router.use(
    "/certificates",
    authenticateToken,
    createCrudRouter(Certificate, {
      createRequiredFields: ["certificate_number"],
      createSchema: resourceContracts.certificates.createSchema,
      updateSchema: resourceContracts.certificates.updateSchema,
    })
  );

  return router;
}

module.exports = {
  createApiRouter,
};
