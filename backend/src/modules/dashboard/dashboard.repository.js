const { Op } = require("sequelize");
const {
  Student,
  Enrollment,
  DLCode,
  Schedule,
  PromoPackage,
  PromoEntitlement,
  SessionAttendance,
  OnlineImportQueue,
} = require("../../../models");

async function countStudents() {
  return Student.count();
}

async function findAllEnrollmentsWithCode(start, end) {
  const where = {
    student_id: {
      [Op.ne]: null,
    },
  };

  if (start && end) {
    where.created_at = {
      [Op.gte]: start,
      [Op.lt]: end,
    };
  }

  // Exclude rejected/cancelled/deleted enrollments from dashboard queries
  where.status = {
    [Op.notIn]: ["rejected", "cancelled", "deleted"],
  };

  return Enrollment.findAll({
    where,
    include: [
      {
        model: DLCode,
        attributes: ["id", "code", "description"],
      },
      {
        model: Schedule,
        as: "scheduledSessions",
        attributes: ["id", "start_time", "end_time", "schedule_date"],
      },
      {
        model: Student,
        attributes: ["id", "first_name", "last_name"],
      },
    ],
    order: [["created_at", "DESC"], ["id", "DESC"]],
  });
}

async function findEnrollmentsByDateRange(start, end) {
  return Enrollment.findAll({
    where: {
      student_id: {
        [Op.ne]: null,
      },
      created_at: {
        [Op.gte]: start,
        [Op.lt]: end,
      },
      // Exclude rejected/cancelled/deleted enrollments from dashboard reports
      status: {
        [Op.notIn]: ["rejected", "cancelled", "deleted"],
      },
    },
    include: [
      {
        model: DLCode,
        attributes: ["id", "code", "description"],
      },
      {
        model: Schedule,
        as: "scheduledSessions",
        attributes: ["id", "start_time", "end_time", "schedule_date"],
      },
      {
        model: Student,
        attributes: ["id", "first_name", "last_name"],
      },
    ],
    order: [["created_at", "DESC"], ["id", "DESC"]],
  });
}

async function findOperationalEnrollments(limit = 500) {
  return Enrollment.findAll({
    where: {
      student_id: {
        [Op.ne]: null,
      },
    },
    include: [
      {
        model: Student,
        attributes: ["id", "first_name", "middle_name", "last_name", "email", "phone"],
      },
      {
        model: DLCode,
        attributes: ["id", "code", "description"],
      },
      {
        model: PromoPackage,
        as: "promoPackage",
        required: false,
        include: [
          {
            model: PromoEntitlement,
            as: "entitlements",
            required: false,
          },
        ],
      },
      {
        model: SessionAttendance,
        as: "sessionAttendance",
        required: false,
      },
    ],
    order: [["created_at", "DESC"], ["id", "DESC"]],
    limit,
  });
}

async function findPendingEnrollmentApprovals(limit = 100) {
  return Enrollment.findAll({
    where: {
      student_id: {
        [Op.ne]: null,
      },
      status: "pending",
    },
    include: [
      {
        model: Student,
        attributes: ["id", "first_name", "middle_name", "last_name", "email", "phone", "source_channel", "external_source"],
      },
      {
        model: DLCode,
        attributes: ["id", "code", "description"],
      },
      {
        model: PromoPackage,
        as: "promoPackage",
        required: false,
      },
      {
        model: Schedule,
        as: "scheduledSessions",
        attributes: ["id", "start_time", "end_time", "schedule_date"],
        required: false,
      },
    ],
    order: [["created_at", "DESC"], ["id", "DESC"]],
    limit,
  });
}

async function countOnlineIntakeByStatus(status) {
  const where = status ? { import_status: status } : undefined;
  return OnlineImportQueue.count({ where });
}

async function findOnlineIntakeByStatus(status, limit = 100) {
  return OnlineImportQueue.findAll({
    where: { import_status: status },
    order: [["id", "DESC"]],
    limit,
  });
}

module.exports = {
  countStudents,
  findAllEnrollmentsWithCode,
  findEnrollmentsByDateRange,
  findOperationalEnrollments,
  findPendingEnrollmentApprovals,
  countOnlineIntakeByStatus,
  findOnlineIntakeByStatus,
};
