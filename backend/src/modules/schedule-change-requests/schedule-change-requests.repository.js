const { ScheduleChangeRequest, Schedule, Enrollment, Student, Course, User, DLCode } = require("../../../models");

const requestIncludes = [
  {
    model: Schedule,
    as: "schedule",
    include: [
      { model: Course, attributes: ["id", "course_name"] },
      {
        model: Enrollment,
        as: "selectedEnrollment",
        attributes: ["id", "status", "pdc_type"],
        include: [
          { model: Student, attributes: ["id", "first_name", "last_name"] },
          { model: DLCode, attributes: ["id", "code"] },
        ],
        required: false,
      },
      {
        model: Student,
        as: "scheduledStudent",
        attributes: ["id", "first_name", "last_name"],
        required: false,
      },
    ],
  },
  {
    model: Enrollment,
    as: "enrollment",
    attributes: ["id", "status", "pdc_type"],
    include: [
      { model: Student, attributes: ["id", "first_name", "last_name"] },
      { model: DLCode, attributes: ["id", "code"] },
    ],
    required: false,
  },
  {
    model: User,
    as: "requester",
    attributes: ["id", "name", "role"],
  },
  {
    model: User,
    as: "reviewer",
    attributes: ["id", "name", "role"],
    required: false,
  },
];

async function createRequest(payload, transaction) {
  return ScheduleChangeRequest.create(payload, { transaction });
}

async function findById(id, transaction) {
  return ScheduleChangeRequest.findByPk(id, {
    include: requestIncludes,
    transaction,
  });
}

async function findPendingByScheduleId(scheduleId, transaction) {
  return ScheduleChangeRequest.findOne({
    where: {
      schedule_id: scheduleId,
      status: "pending",
    },
    transaction,
  });
}

async function findAllPending(transaction) {
  return ScheduleChangeRequest.findAll({
    where: { status: "pending" },
    include: requestIncludes,
    transaction,
    order: [["created_at", "ASC"], ["id", "ASC"]],
  });
}

async function updateRequest(record, payload, transaction) {
  return record.update(payload, { transaction });
}

module.exports = {
  createRequest,
  findById,
  findPendingByScheduleId,
  findAllPending,
  updateRequest,
};