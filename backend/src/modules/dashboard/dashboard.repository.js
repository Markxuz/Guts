const { Op } = require("sequelize");
const { Student, Enrollment, DLCode } = require("../../../models");

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
    ],
    order: [["created_at", "DESC"], ["id", "DESC"]],
  });
}

module.exports = {
  countStudents,
  findAllEnrollmentsWithCode,
  findEnrollmentsByDateRange,
};
