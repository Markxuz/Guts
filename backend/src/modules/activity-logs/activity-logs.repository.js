const { Op } = require("sequelize");
const { ActivityLog, Enrollment, User, Student, DLCode } = require("../../../models");

async function createActivityLog(payload) {
  return ActivityLog.create(payload);
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

async function findRecentActivityLogs(limit = 30) {
  return ActivityLog.findAll({
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

async function findRecentEnrollments(limit = 30) {
  return Enrollment.findAll({
    include: [
      {
        model: Student,
        attributes: ["id", "first_name", "last_name"],
      },
      {
        model: DLCode,
        attributes: ["id", "code"],
      },
    ],
    order: [["created_at", "DESC"], ["id", "DESC"]],
    limit: Number(limit) || 30,
  });
}

module.exports = {
  createActivityLog,
  findActivityLogsByDateRange,
  findRecentActivityLogs,
  findRecentEnrollments,
};
