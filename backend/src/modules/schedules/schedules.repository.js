const { Op } = require("sequelize");
const { sequelize, Schedule, Course, Instructor, Vehicle, Enrollment, Student, StudentProfile, DLCode, MaintenanceLog } = require("../../../models");

let remarksColumnAvailable;
let studentRemarksColumnAvailable;
let instructorRemarksColumnAvailable;
let careOfColumnAvailable;
let enrollmentColumnAvailable;
let studentColumnAvailable;

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

async function hasStudentRemarksColumn() {
  if (typeof studentRemarksColumnAvailable === "boolean") {
    return studentRemarksColumnAvailable;
  }

  try {
    const definition = await sequelize.getQueryInterface().describeTable("schedules");
    studentRemarksColumnAvailable = Object.prototype.hasOwnProperty.call(definition, "student_remarks");
  } catch {
    studentRemarksColumnAvailable = false;
  }

  return studentRemarksColumnAvailable;
}

async function hasInstructorRemarksColumn() {
  if (typeof instructorRemarksColumnAvailable === "boolean") {
    return instructorRemarksColumnAvailable;
  }

  try {
    const definition = await sequelize.getQueryInterface().describeTable("schedules");
    instructorRemarksColumnAvailable = Object.prototype.hasOwnProperty.call(definition, "instructor_remarks");
  } catch {
    instructorRemarksColumnAvailable = false;
  }

  return instructorRemarksColumnAvailable;
}

async function hasCareOfColumn() {
  if (typeof careOfColumnAvailable === "boolean") {
    return careOfColumnAvailable;
  }

  try {
    const definition = await sequelize.getQueryInterface().describeTable("schedules");
    careOfColumnAvailable = Object.prototype.hasOwnProperty.call(definition, "care_of_instructor_id");
  } catch {
    careOfColumnAvailable = false;
  }

  return careOfColumnAvailable;
}

async function hasEnrollmentColumn() {
  if (typeof enrollmentColumnAvailable === "boolean") {
    return enrollmentColumnAvailable;
  }

  try {
    const definition = await sequelize.getQueryInterface().describeTable("schedules");
    enrollmentColumnAvailable = Object.prototype.hasOwnProperty.call(definition, "enrollment_id");
  } catch {
    enrollmentColumnAvailable = false;
  }

  return enrollmentColumnAvailable;
}

async function hasStudentColumn() {
  if (typeof studentColumnAvailable === "boolean") {
    return studentColumnAvailable;
  }

  try {
    const definition = await sequelize.getQueryInterface().describeTable("schedules");
    studentColumnAvailable = Object.prototype.hasOwnProperty.call(definition, "student_id");
  } catch {
    studentColumnAvailable = false;
  }

  return studentColumnAvailable;
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

  if (await hasCareOfColumn()) {
    baseAttributes.push("care_of_instructor_id");
  }

  if (await hasEnrollmentColumn()) {
    baseAttributes.push("enrollment_id");
  }

  if (await hasStudentColumn()) {
    baseAttributes.push("student_id");
  }

  if (await hasRemarksColumn()) {
    baseAttributes.push("remarks");
  }

  if (await hasStudentRemarksColumn()) {
    baseAttributes.push("student_remarks");
  }

  if (await hasInstructorRemarksColumn()) {
    baseAttributes.push("instructor_remarks");
  }

  return baseAttributes;
}

async function getScheduleIncludes() {
  const includes = [
    { model: Course, attributes: ["id", "course_name", "description"] },
    { model: Instructor, attributes: ["id", "name", "phone"] },
    { model: Vehicle, attributes: ["id", "vehicle_name", "vehicle_type", "plate_number", "transmission_type"] },
    {
      model: Enrollment,
      attributes: ["id", "status", "pdc_type", "is_already_driver", "target_vehicle", "transmission_type"],
      include: [
        {
          model: Student,
          attributes: ["id", "first_name", "middle_name", "last_name", "email", "phone"],
          include: [
            {
              model: StudentProfile,
              attributes: ["lto_portal_account"],
              required: false,
            },
          ],
        },
        { model: DLCode, attributes: ["id", "code"] },
      ],
    },
  ];

  if (await hasCareOfColumn()) {
    includes.splice(2, 0, {
      model: Instructor,
      as: "careOfInstructor",
      attributes: ["id", "name", "phone"],
      required: false,
    });
  }

  if (await hasEnrollmentColumn()) {
    includes.push({
      model: Enrollment,
      as: "selectedEnrollment",
      attributes: ["id", "status", "pdc_type", "is_already_driver", "target_vehicle", "transmission_type"],
      include: [
        {
          model: Student,
          attributes: ["id", "first_name", "middle_name", "last_name", "email", "phone"],
          include: [
            {
              model: StudentProfile,
              attributes: ["lto_portal_account"],
              required: false,
            },
          ],
        },
        { model: DLCode, attributes: ["id", "code"] },
      ],
      required: false,
    });
  }

  if (await hasStudentColumn()) {
    includes.push({
      model: Student,
      as: "scheduledStudent",
      attributes: ["id", "first_name", "middle_name", "last_name", "email", "phone"],
      include: [
        {
          model: StudentProfile,
          attributes: ["lto_portal_account"],
          required: false,
        },
      ],
      required: false,
    });
  }

  return includes;
}

async function createSchedule(payload, transaction) {
  const nextPayload = { ...payload };
  if (!(await hasRemarksColumn())) {
    delete nextPayload.remarks;
  }
  if (!(await hasStudentRemarksColumn())) {
    delete nextPayload.student_remarks;
  }
  if (!(await hasInstructorRemarksColumn())) {
    delete nextPayload.instructor_remarks;
  }
  if (!(await hasCareOfColumn())) {
    delete nextPayload.care_of_instructor_id;
  }
  if (!(await hasEnrollmentColumn())) {
    delete nextPayload.enrollment_id;
  }
  if (!(await hasStudentColumn())) {
    delete nextPayload.student_id;
  }

  return Schedule.create(nextPayload, { transaction });
}

async function findEnrollmentByIdForScheduling(id, transaction) {
  return Enrollment.findByPk(id, {
    include: [
      { model: Student, attributes: ["id", "first_name", "last_name"] },
      { model: DLCode, attributes: ["id", "code"] },
    ],
    transaction,
  });
}

async function updateEnrollmentSchedule(enrollment, scheduleId, transaction) {
  if (!enrollment) {
    return null;
  }

  return enrollment.update(
    { schedule_id: scheduleId || null },
    { transaction }
  );
}

async function findSchedulesByDate(date, transaction) {
  const attributes = await scheduleAttributes();
  const include = await getScheduleIncludes();
  return Schedule.findAll({
    where: { schedule_date: date },
    attributes,
    include,
    transaction,
    order: [["start_time", "ASC"], ["id", "ASC"]],
  });
}

async function findScheduleById(id, transaction) {
  const attributes = await scheduleAttributes();
  const include = await getScheduleIncludes();
  return Schedule.findByPk(id, {
    attributes,
    include,
    transaction,
  });
}

async function updateSchedule(schedule, payload, transaction) {
  if (!schedule) {
    return null;
  }

  const nextPayload = { ...payload };
  if (!(await hasRemarksColumn())) {
    delete nextPayload.remarks;
  }
  if (!(await hasStudentRemarksColumn())) {
    delete nextPayload.student_remarks;
  }
  if (!(await hasInstructorRemarksColumn())) {
    delete nextPayload.instructor_remarks;
  }

  return schedule.update(nextPayload, { transaction });
}

async function findSchedulesByDateRange(startDate, endDate, transaction) {
  const attributes = await scheduleAttributes();
  const include = await getScheduleIncludes();
  return Schedule.findAll({
    where: {
      schedule_date: {
        [Op.gte]: startDate,
        [Op.lte]: endDate,
      },
    },
    attributes,
    include,
    transaction,
    order: [["schedule_date", "ASC"], ["start_time", "ASC"], ["id", "ASC"]],
  });
}

async function findSchedulesByDateAndTime(date, startTime, endTime, transaction) {
  const attributes = await scheduleAttributes();
  const include = await getScheduleIncludes();
  return Schedule.findAll({
    where: {
      schedule_date: date,
      start_time: startTime,
      end_time: endTime,
    },
    attributes,
    include,
    transaction,
    order: [["id", "ASC"]],
  });
}

async function findSchedulesByIds(ids, transaction) {
  if (!Array.isArray(ids) || ids.length === 0) {
    return [];
  }

  const attributes = await scheduleAttributes();
  const include = await getScheduleIncludes();
  return Schedule.findAll({
    where: {
      id: {
        [Op.in]: ids,
      },
    },
    attributes,
    include,
    transaction,
    order: [["schedule_date", "ASC"], ["start_time", "ASC"], ["id", "ASC"]],
  });
}

async function countInstructors() {
  return Instructor.count();
}

async function countQualifiedInstructors(courseType) {
  const normalized = String(courseType || "").trim().toLowerCase();
  const where = {
    status: "Active",
  };

  if (normalized === "tdc") {
    where.tdc_certified = true;
  } else if (normalized === "pdc_beginner") {
    where.pdc_beginner_certified = true;
  } else if (normalized === "pdc_experience") {
    where.pdc_experience_certified = true;
  }

  return Instructor.count({ where });
}

async function findInstructorById(id, transaction) {
  return Instructor.findByPk(id, { transaction });
}

async function findMaintenanceLogsForVehicleRange(vehicleId, startDate, endDate, transaction) {
  return MaintenanceLog.findAll({
    where: {
      vehicle_id: vehicleId,
      date_of_service: {
        [Op.lte]: endDate,
      },
      next_schedule_date: {
        [Op.gte]: startDate,
      },
    },
    transaction,
    order: [["date_of_service", "ASC"], ["id", "ASC"]],
  });
}

async function findSchedulesByRemarksToken(token, transaction) {
  if (!token || !(await hasRemarksColumn())) {
    return [];
  }

  const attributes = await scheduleAttributes();
  const include = await getScheduleIncludes();
  return Schedule.findAll({
    where: {
      [Op.or]: [
        { remarks: { [Op.like]: `%${token}%` } },
        ...(await hasStudentRemarksColumn() ? [{ student_remarks: { [Op.like]: `%${token}%` } }] : []),
        ...(await hasInstructorRemarksColumn() ? [{ instructor_remarks: { [Op.like]: `%${token}%` } }] : []),
      ],
    },
    attributes,
    include,
    transaction,
    order: [["schedule_date", "ASC"], ["start_time", "ASC"], ["id", "ASC"]],
  });
}

async function deleteSchedulesByIds(ids, transaction) {
  if (!Array.isArray(ids) || ids.length === 0) {
    return 0;
  }

  return Schedule.destroy({
    where: {
      id: {
        [Op.in]: ids,
      },
    },
    transaction,
  });
}

async function countVehicles() {
  return Vehicle.count();
}

module.exports = {
  createSchedule,
  findSchedulesByDate,
  findScheduleById,
  updateSchedule,
  findSchedulesByDateRange,
  findSchedulesByDateAndTime,
  findSchedulesByIds,
  countInstructors,
  countQualifiedInstructors,
  countVehicles,
  findInstructorById,
  findEnrollmentByIdForScheduling,
  updateEnrollmentSchedule,
  findMaintenanceLogsForVehicleRange,
  findSchedulesByRemarksToken,
  deleteSchedulesByIds,
  hasRemarksColumn,
  hasStudentRemarksColumn,
  hasInstructorRemarksColumn,
  hasCareOfColumn,
  hasEnrollmentColumn,
  hasStudentColumn,
};
