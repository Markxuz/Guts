const { Op } = require("sequelize");
const { Enrollment, Student, DLCode, ActivityLog, User } = require("../../../models");

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
    },
    include: [
      { model: Student, attributes: ["id", "first_name", "last_name"] },
      { model: DLCode, attributes: ["id", "code", "description"] },
    ],
    order: [["created_at", "DESC"], ["id", "DESC"]],
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

module.exports = {
  findStudentsByDateRange,
  findEnrollmentsByDateRange,
  findActivityLogsByDateRange,
};
