const { Op } = require("sequelize");
const { sequelize, Schedule, Course, Instructor, Vehicle, Enrollment, Student, DLCode } = require("../../../models");

let remarksColumnAvailable;

async function hasRemarksColumn() {
  if (typeof remarksColumnAvailable === "boolean") {
    return remarksColumnAvailable;
  }

  try {
    const definition = await sequelize.getQueryInterface().describeTable("schedules");
    remarksColumnAvailable = Object.prototype.hasOwnProperty.call(definition, "remarks");
  } catch {
    remarksColumnAvailable = false;
  }

  return remarksColumnAvailable;
}

async function scheduleAttributes() {
  const baseAttributes = [
    "id",
    "course_id",
    "instructor_id",
    "vehicle_id",
    "schedule_date",
    "start_time",
    "end_time",
    "slots",
  ];

  if (await hasRemarksColumn()) {
    baseAttributes.push("remarks");
  }

  return baseAttributes;
}

const scheduleIncludes = [
  { model: Course, attributes: ["id", "course_name", "description"] },
  { model: Instructor, attributes: ["id", "name", "phone"] },
  { model: Vehicle, attributes: ["id", "vehicle_name", "vehicle_type", "plate_number"] },
  {
    model: Enrollment,
    include: [
      { model: Student, attributes: ["id", "first_name", "last_name"] },
      { model: DLCode, attributes: ["id", "code"] },
    ],
  },
];

async function createSchedule(payload, transaction) {
  const nextPayload = { ...payload };
  if (!(await hasRemarksColumn())) {
    delete nextPayload.remarks;
  }

  return Schedule.create(nextPayload, { transaction });
}

async function findSchedulesByDate(date) {
  const attributes = await scheduleAttributes();
  return Schedule.findAll({
    where: { schedule_date: date },
    attributes,
    include: scheduleIncludes,
    order: [["start_time", "ASC"], ["id", "ASC"]],
  });
}

async function findSchedulesByDateRange(startDate, endDate) {
  const attributes = await scheduleAttributes();
  return Schedule.findAll({
    where: {
      schedule_date: {
        [Op.gte]: startDate,
        [Op.lte]: endDate,
      },
    },
    attributes,
    include: scheduleIncludes,
    order: [["schedule_date", "ASC"], ["start_time", "ASC"], ["id", "ASC"]],
  });
}

async function findSchedulesByDateAndTime(date, startTime, endTime) {
  const attributes = await scheduleAttributes();
  return Schedule.findAll({
    where: {
      schedule_date: date,
      start_time: startTime,
      end_time: endTime,
    },
    attributes,
    include: scheduleIncludes,
    order: [["id", "ASC"]],
  });
}

async function countInstructors() {
  return Instructor.count();
}

async function countVehicles() {
  return Vehicle.count();
}

module.exports = {
  createSchedule,
  findSchedulesByDate,
  findSchedulesByDateRange,
  findSchedulesByDateAndTime,
  countInstructors,
  countVehicles,
  hasRemarksColumn,
};
