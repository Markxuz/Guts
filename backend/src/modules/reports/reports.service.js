const repository = require("./reports.repository");
const { listSchedulesByDate, listSchedulesByRange } = require("../schedules/schedules.service");

function classifyCourseType(row) {
  const code = String(row?.DLCode?.code || "").toLowerCase();
  const pdcType = String(row?.pdc_type || "").toLowerCase();

  if (code.includes("tdc") && code.includes("pdc")) {
    return pdcType === "experience" ? "pdc_experience" : "pdc_beginner";
  }
  if (code.includes("tdc")) return "tdc";
  if (code.includes("pdc")) {
    return pdcType === "experience" ? "pdc_experience" : "pdc_beginner";
  }
  return "pdc_experience";
}

function isPromoEnrollment(row) {
  const code = String(row?.DLCode?.code || "").toLowerCase();
  return code.includes("promo") || (code.includes("tdc") && code.includes("pdc"));
}

function getCourseMembership(row) {
  const courseType = classifyCourseType(row);
  const membership = new Set();

  if (isPromoEnrollment(row)) {
    membership.add("tdc");
    membership.add(courseType);
    return membership;
  }

  if (courseType === "tdc") {
    membership.add("tdc");
    return membership;
  }

  membership.add(courseType);
  return membership;
}

function courseDisplayLabel(row) {
  const type = classifyCourseType(row);
  if (type === "tdc") return "TDC";
  if (type === "pdc_beginner") return "PDC-Beginner";
  if (type === "pdc_experience") return "PDC-Experience";
  return "Course";
}

function studentName(student) {
  if (!student) return "Unknown Student";
  return [student.first_name, student.last_name].filter(Boolean).join(" ") || `Student #${student.id}`;
}

function formatTime(dateInput) {
  const date = new Date(dateInput);
  if (Number.isNaN(date.valueOf())) return "--:--";
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function mapEnrollmentReport(row) {
  const code = row?.DLCode?.code || courseDisplayLabel(row);
  const name = studentName(row.Student);
  const courseType = classifyCourseType(row);
  const courseLabel = courseDisplayLabel(row);
  return {
    id: `enrollment-${row.id}`,
    time: formatTime(row.created_at),
    studentName: name,
    transactionType: `${courseLabel} Enrollment`,
    course: courseLabel,
    vehicleType: "-",
    instructor: "-",
    remarks: `${name} enrolled in ${code}`,
    courseType,
    description: `${name} enrolled in ${code}`,
    createdAt: row.created_at,
  };
}

function mapScheduleReport(row, index) {
  return {
    id: row.id || `schedule-${index}`,
    time: row.slotLabel || "Scheduled",
    reportDate: row.scheduleDate,
    studentName: row.studentName || "Open Slot",
    transactionType: "Schedule",
    course: row.course || "Course",
    vehicleType: row.vehicleType || "-",
    instructor: row.instructor || "-",
    remarks: row.remarks || row.slotLabel || "Scheduled session",
    courseType: "schedule",
    description: `${row.course || "Course"} with ${row.instructor || "Instructor"}`,
    createdAt: `${row.scheduleDate}T00:00:00.000Z`,
  };
}

function mapEnrollmentReportWithDate(row) {
  return {
    ...mapEnrollmentReport(row),
    reportDate: String(row.created_at || row.createdAt || "").slice(0, 10),
  };
}

function mapActivityLog(row) {
  const timestamp = row.timestamp || row.createdAt;
  return {
    id: row.id,
    userName: row?.User?.name || "System",
    action: row.action,
    timestamp,
    time: formatTime(timestamp),
  };
}

function buildMonthlySeries(rows) {
  const buckets = Array.from({ length: 12 }, (_, month) => ({
    month,
    tdc: 0,
    pdcBeginner: 0,
    pdcExperience: 0,
  }));

  rows.forEach((row) => {
    const date = new Date(row.created_at || row.createdAt || 0);
    if (Number.isNaN(date.valueOf())) return;

    const month = date.getMonth();
    const membership = getCourseMembership(row);
    if (membership.has("tdc")) buckets[month].tdc += 1;
    if (membership.has("pdc_beginner")) buckets[month].pdcBeginner += 1;
    if (membership.has("pdc_experience")) buckets[month].pdcExperience += 1;
  });

  return buckets;
}

function toNumber(value) {
  const numeric = Number(value || 0);
  if (Number.isNaN(numeric)) return 0;
  return numeric;
}

function durationHours(startTime, endTime) {
  if (!startTime || !endTime) return 0;

  const [startHour = 0, startMinute = 0] = String(startTime).split(":").map((value) => Number(value));
  const [endHour = 0, endMinute = 0] = String(endTime).split(":").map((value) => Number(value));

  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;

  if (endMinutes <= startMinutes) return 0;
  return (endMinutes - startMinutes) / 60;
}

function buildUsageByVehicle(rows) {
  const bucket = new Map();

  rows.forEach((row) => {
    const membership = getCourseMembership(row);
    const isPdcRecord = membership.has("pdc_beginner") || membership.has("pdc_experience");
    if (!isPdcRecord) return;

    const vehicle = row?.Schedule?.Vehicle;
    const vehicleId = vehicle?.id;
    if (!vehicleId) return;

    const key = String(vehicleId);
    if (!bucket.has(key)) {
      bucket.set(key, {
        vehicleId,
        vehicleName: vehicle.vehicle_name || `Vehicle #${vehicleId}`,
        vehicleType: vehicle.vehicle_type || "Vehicle",
        plateNumber: vehicle.plate_number || "",
        completedSessions: 0,
        totalTrainingHours: 0,
      });
    }

    const current = bucket.get(key);
    current.completedSessions += 1;
    current.totalTrainingHours += durationHours(row?.Schedule?.start_time, row?.Schedule?.end_time);
  });

  return Array.from(bucket.values())
    .map((item) => ({
      ...item,
      totalTrainingHours: Number(item.totalTrainingHours.toFixed(2)),
    }))
    .sort((a, b) => b.totalTrainingHours - a.totalTrainingHours);
}

async function getDailyReports({ date, startDate, endDate }) {
  const effectiveStartDate = date || startDate;
  const effectiveEndDate = date || endDate;
  const start = new Date(`${effectiveStartDate}T00:00:00.000Z`);
  const end = new Date(`${effectiveEndDate}T00:00:00.000Z`);
  end.setUTCDate(end.getUTCDate() + 1);

  const [enrollments, schedules] = await Promise.all([
    repository.findEnrollmentsByDateRange(start, end),
    date ? listSchedulesByDate(date) : listSchedulesByRange(effectiveStartDate, effectiveEndDate),
  ]);

  const items = [
    ...(date ? schedules?.items || [] : schedules || []).map(mapScheduleReport),
    ...enrollments.map(mapEnrollmentReportWithDate),
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return {
    date: date || null,
    startDate: effectiveStartDate,
    endDate: effectiveEndDate,
    isRange: !date,
    total: items.length,
    availability: date ? schedules?.slots || [] : [],
    dayFull: date ? schedules?.dayFull || false : false,
    items,
  };
}

async function getOverviewReports({ startDate, endDate, courseFilter = "overall" }) {
  const start = new Date(`${startDate}T00:00:00.000Z`);
  const end = new Date(`${endDate}T00:00:00.000Z`);
  end.setUTCDate(end.getUTCDate() + 1);

  const [enrollments, activityLogs, maintenanceLogs, fuelLogs, completedWithVehicle] = await Promise.all([
    repository.findEnrollmentsByDateRange(start, end),
    repository.findActivityLogsByDateRange(start, end, 30),
    repository.findMaintenanceLogsByDateRange(start, end),
    repository.findFuelLogsByDateRange(start, end),
    repository.findCompletedEnrollmentsWithVehicleByDateRange(start, end),
  ]);

  const normalizedFilter = String(courseFilter || "overall").toLowerCase();
  const includeByCourse = (row) => {
    const membership = getCourseMembership(row);

    if (normalizedFilter === "overall") return true;
    if (normalizedFilter === "pdc") return membership.has("pdc_beginner") || membership.has("pdc_experience");
    return membership.has(normalizedFilter);
  };

  const filteredEnrollments = enrollments.filter((row) => includeByCourse(row));

  const transactions = [
    ...filteredEnrollments.map(mapEnrollmentReport),
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const activities = activityLogs
    .map(mapActivityLog)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 30);

  const currentlyEnrolled = filteredEnrollments.filter(
    (item) => item.status === "pending" || item.status === "confirmed"
  ).length;
  const completed = filteredEnrollments.filter((item) => item.status === "completed").length;
  const pdcBeginner = filteredEnrollments.filter((item) => classifyCourseType(item) === "pdc_beginner").length;
  const pdcExperience = filteredEnrollments.filter((item) => classifyCourseType(item) === "pdc_experience").length;

  const totalStudentsForFilter = new Set(filteredEnrollments.map((row) => row.student_id).filter(Boolean)).size;
  const todayIso = new Date().toISOString().slice(0, 10);

  const maintenanceSummary = {
    totalRecords: maintenanceLogs.length,
    totalCost: Number(
      maintenanceLogs.reduce((sum, log) => sum + toNumber(log.maintenance_cost), 0).toFixed(2)
    ),
    overdueCount: maintenanceLogs.filter((log) => {
      const nextDate = String(log.next_schedule_date || "");
      return Boolean(nextDate) && nextDate < todayIso;
    }).length,
  };

  const fuelSummary = {
    totalEntries: fuelLogs.length,
    totalLiters: Number(fuelLogs.reduce((sum, log) => sum + toNumber(log.liters), 0).toFixed(2)),
    totalExpense: Number(fuelLogs.reduce((sum, log) => sum + toNumber(log.amount_spent), 0).toFixed(2)),
  };

  const usageByVehicle = buildUsageByVehicle(completedWithVehicle);

  return {
    reportRange: {
      startDate,
      endDate,
    },
    stats: {
      totalStudents: totalStudentsForFilter,
      currentlyEnrolled,
      completed,
      thisMonth: filteredEnrollments.length,
      pdcBeginner,
      pdcExperience,
    },
    monthlyEnrollment: buildMonthlySeries(filteredEnrollments),
    activityDates: filteredEnrollments
      .map((item) => item.created_at || item.createdAt)
      .filter(Boolean),
    dailyTransactions: transactions,
    recentActivities: activities,
    maintenanceSummary,
    fuelSummary,
    usageByVehicle,
  };
}

module.exports = {
  getDailyReports,
  getOverviewReports,
};
