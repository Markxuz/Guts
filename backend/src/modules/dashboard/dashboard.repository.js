const { Op } = require("sequelize");
const { Student, Enrollment, DLCode, Schedule } = require("../../../models");

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

module.exports = {
  countStudents,
  findAllEnrollmentsWithCode,
  findEnrollmentsByDateRange,
};
