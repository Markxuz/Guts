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
  const where =
    start && end
      ? {
          created_at: {
            [Op.gte]: start,
            [Op.lt]: end,
          },
        }
      : undefined;

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
      created_at: {
        [Op.gte]: start,
        [Op.lt]: end,
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
  countOnlineIntakeByStatus,
  findOnlineIntakeByStatus,
};
