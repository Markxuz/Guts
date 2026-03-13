const { sequelize } = require("../../../models");
const repository = require("./schedules.repository");

const SLOT_MAP = {
  morning: {
    startTime: "08:00:00",
    endTime: "12:00:00",
    label: "08:00 AM - 12:00 PM",
  },
  afternoon: {
    startTime: "13:00:00",
    endTime: "17:00:00",
    label: "01:00 PM - 05:00 PM",
  },
};

function capacityFromResources(instructorCount, vehicleCount) {
  return Math.max(0, Math.min(instructorCount, vehicleCount));
}

function studentName(student) {
  if (!student) return null;
  return [student.first_name, student.last_name].filter(Boolean).join(" ") || `Student #${student.id}`;
}

function mapSchedule(row) {
  const firstEnrollment = row?.Enrollments?.[0];
  return {
    id: row.id,
    scheduleDate: row.schedule_date,
    slot: row.start_time === SLOT_MAP.morning.startTime ? "morning" : "afternoon",
    slotLabel: row.start_time === SLOT_MAP.morning.startTime ? SLOT_MAP.morning.label : SLOT_MAP.afternoon.label,
    course: row?.Course?.course_name || firstEnrollment?.DLCode?.code || "Course",
    vehicleType: row?.Vehicle?.vehicle_type || row?.Vehicle?.vehicle_name || "-",
    instructor: row?.Instructor?.name || "-",
    studentName: studentName(firstEnrollment?.Student) || "Open Slot",
    remarks: row.remarks || "Available schedule slot",
  };
}

async function getSlotAvailability(date, slot) {
  const slotConfig = SLOT_MAP[slot];
  const [schedules, instructorCount, vehicleCount] = await Promise.all([
    repository.findSchedulesByDateAndTime(date, slotConfig.startTime, slotConfig.endTime),
    repository.countInstructors(),
    repository.countVehicles(),
  ]);

  const capacity = capacityFromResources(instructorCount, vehicleCount);
  const full = capacity > 0 && schedules.length >= capacity;

  return {
    slot,
    slotLabel: slotConfig.label,
    capacity,
    booked: schedules.length,
    available: Math.max(0, capacity - schedules.length),
    full,
    schedules: schedules.map(mapSchedule),
  };
}

async function listSchedulesByDate(date) {
  const [morning, afternoon] = await Promise.all([
    getSlotAvailability(date, "morning"),
    getSlotAvailability(date, "afternoon"),
  ]);

  return {
    date,
    slots: [morning, afternoon],
    dayFull: morning.full && afternoon.full,
    items: [...morning.schedules, ...afternoon.schedules],
  };
}

async function listSchedulesByRange(startDate, endDate) {
  const rows = await repository.findSchedulesByDateRange(startDate, endDate);
  return rows.map(mapSchedule);
}

async function listMonthStatus(year, month) {
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const end = new Date(year, month, 0);
  const endDate = `${year}-${String(month).padStart(2, "0")}-${String(end.getDate()).padStart(2, "0")}`;

  const [rows, instructorCount, vehicleCount] = await Promise.all([
    repository.findSchedulesByDateRange(startDate, endDate),
    repository.countInstructors(),
    repository.countVehicles(),
  ]);

  const capacity = capacityFromResources(instructorCount, vehicleCount);
  const grouped = new Map();

  rows.forEach((row) => {
    const key = row.schedule_date;
    const slot = row.start_time === SLOT_MAP.morning.startTime ? "morning" : "afternoon";
    if (!grouped.has(key)) {
      grouped.set(key, { morning: 0, afternoon: 0 });
    }
    grouped.get(key)[slot] += 1;
  });

  return Array.from(grouped.entries()).map(([date, counts]) => ({
    date,
    morningFull: capacity > 0 && counts.morning >= capacity,
    afternoonFull: capacity > 0 && counts.afternoon >= capacity,
    dayFull: capacity > 0 && counts.morning >= capacity && counts.afternoon >= capacity,
  }));
}

async function addSchedule(payload) {
  const slotConfig = SLOT_MAP[payload.slot];
  const transaction = await sequelize.transaction();

  try {
    const [existing, instructorCount, vehicleCount] = await Promise.all([
      repository.findSchedulesByDateAndTime(payload.schedule_date, slotConfig.startTime, slotConfig.endTime),
      repository.countInstructors(),
      repository.countVehicles(),
    ]);

    const capacity = capacityFromResources(instructorCount, vehicleCount);
    if (!capacity) {
      const error = new Error("No instructors or vehicles available for scheduling");
      error.status = 400;
      throw error;
    }

    if (existing.length >= capacity) {
      const error = new Error(`${slotConfig.label} is already full for ${payload.schedule_date}`);
      error.status = 400;
      throw error;
    }

    if (existing.some((row) => row.instructor_id === payload.instructor_id)) {
      const error = new Error("Selected instructor is already assigned to this slot");
      error.status = 400;
      throw error;
    }

    if (existing.some((row) => row.vehicle_id === payload.vehicle_id)) {
      const error = new Error("Selected vehicle is already assigned to this slot");
      error.status = 400;
      throw error;
    }

    const created = await repository.createSchedule({
      course_id: payload.course_id,
      instructor_id: payload.instructor_id,
      vehicle_id: payload.vehicle_id,
      schedule_date: payload.schedule_date,
      start_time: slotConfig.startTime,
      end_time: slotConfig.endTime,
      slots: capacity,
      remarks: payload.remarks || null,
    }, transaction);

    await transaction.commit();
    const fresh = await repository.findSchedulesByDate(payload.schedule_date);
    const createdRow = fresh.find((item) => item.id === created.id);

    if (!createdRow) {
      const error = new Error("Created schedule could not be reloaded");
      error.status = 500;
      throw error;
    }

    return mapSchedule(createdRow);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

module.exports = {
  SLOT_MAP,
  listSchedulesByDate,
  listSchedulesByRange,
  listMonthStatus,
  addSchedule,
};
