const { Op } = require("sequelize");
const {
  Enrollment,
  Student,
  DLCode,
  ActivityLog,
  User,
  Schedule,
  Vehicle,
  Instructor,
  MaintenanceLog,
  FuelLog,
} = require("../../../models");

async function findStudentsByDateRange(start, end) {
  return Student.findAll({
    where: {
      createdAt: {
        [Op.gte]: start,
        [Op.lt]: end,
      },
    },
    attributes: ["id", "first_name", "last_name", "createdAt"],
    order: [["createdAt", "DESC"], ["id", "DESC"]],
  });
}

async function findEnrollmentsByDateRange(start, end) {
  return Enrollment.findAll({
    where: {
      created_at: {
        [Op.gte]: start,
        [Op.lt]: end,
      },
      // Exclude rejected/cancelled/deleted enrollments from reports
      status: {
        [Op.notIn]: ["rejected", "cancelled", "deleted"],
      },
    },
    include: [
      { model: Student, attributes: ["id", "first_name", "last_name"] },
      { model: DLCode, attributes: ["id", "code", "description"] },
      {
        model: Schedule,
        as: "scheduledSessions",
        attributes: ["id", "schedule_date", "start_time", "end_time", "vehicle_id", "instructor_id", "care_of_instructor_id"],
        required: false,
        include: [
          {
            model: Vehicle,
            attributes: ["id", "vehicle_name", "vehicle_type", "plate_number", "transmission_type"],
            required: false,
          },
          {
            model: Instructor,
            attributes: ["id", "name"],
            required: false,
          },
          {
            model: Instructor,
            as: "careOfInstructor",
            attributes: ["id", "name"],
            required: false,
          },
        ],
      },
    ],
    order: [["id", "DESC"]],
  });
}

async function findActivityLogsByDateRange(start, end, limit = 30) {
  return ActivityLog.findAll({
    where: {
      timestamp: {
        [Op.gte]: start,
        [Op.lt]: end,
      },
    },
    include: [
      {
        model: User,
        attributes: ["id", "name", "email", "role"],
      },
    ],
    order: [["timestamp", "DESC"], ["id", "DESC"]],
    limit: Number(limit) || 30,
  });
}

async function findMaintenanceLogsByDateRange(start, end) {
  return MaintenanceLog.findAll({
    where: {
      date_of_service: {
        [Op.gte]: start,
        [Op.lt]: end,
      },
    },
    include: [
      {
        model: Vehicle,
        as: "vehicle",
        attributes: ["id", "vehicle_name", "vehicle_type", "plate_number"],
        required: false,
      },
    ],
    order: [["date_of_service", "DESC"], ["id", "DESC"]],
  });
}

async function findFuelLogsByDateRange(start, end) {
  return FuelLog.findAll({
    where: {
      logged_at: {
        [Op.gte]: start,
        [Op.lt]: end,
      },
    },
    include: [
      {
        model: Vehicle,
        as: "vehicle",
        attributes: ["id", "vehicle_name", "vehicle_type", "plate_number"],
        required: false,
      },
    ],
    order: [["logged_at", "DESC"], ["id", "DESC"]],
  });
}

async function findCompletedEnrollmentsWithVehicleByDateRange(start, end) {
  return Enrollment.findAll({
    where: {
      status: "completed",
      created_at: {
        [Op.gte]: start,
        [Op.lt]: end,
      },
      schedule_id: {
        [Op.not]: null,
      },
    },
    include: [
      { model: DLCode, attributes: ["id", "code", "description"] },
      {
        model: Schedule,
        attributes: ["id", "schedule_date", "start_time", "end_time", "vehicle_id"],
        required: true,
        include: [
          {
            model: Vehicle,
            attributes: ["id", "vehicle_name", "vehicle_type", "plate_number"],
            required: false,
          },
        ],
      },
    ],
    order: [["id", "DESC"]],
  });
}

module.exports = {
  findStudentsByDateRange,
  findEnrollmentsByDateRange,
  findActivityLogsByDateRange,
  findMaintenanceLogsByDateRange,
  findFuelLogsByDateRange,
  findCompletedEnrollmentsWithVehicleByDateRange,
};
