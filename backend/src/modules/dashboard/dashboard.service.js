const repository = require("./dashboard.repository");

function getCreatedDate(row) {
  return new Date(row.created_at || row.createdAt || 0);
}

function classifyCourseType(row) {
  const code = String(row?.DLCode?.code || "").toLowerCase();
  const pdcType = String(row?.pdc_type || "").toLowerCase();

  if (code.includes("promo") || (code.includes("tdc") && code.includes("pdc"))) {
    return pdcType === "experience" ? "pdc_experience" : "pdc_beginner";
  }
  if (code.includes("tdc")) return "tdc";
  if (code.includes("pdc")) return pdcType === "experience" ? "pdc_experience" : "pdc_beginner";
  return "pdc_experience";
}

function getCourseMembership(row) {
  const code = String(row?.DLCode?.code || "").toLowerCase();
  const courseType = classifyCourseType(row);
  const membership = new Set();

  if (code.includes("promo") || (code.includes("tdc") && code.includes("pdc"))) {
    membership.add("tdc");
    membership.add(courseType);
    return membership;
  }

  membership.add(courseType);
  return membership;
}

function mapLog(row) {
  const date = getCreatedDate(row);
  return {
    id: row.id,
    student_id: row.student_id,
    schedule_id: row.schedule_id,
    package_id: row.package_id,
    dl_code_id: row.dl_code_id,
    status: row.status,
    created_at: row.created_at || row.createdAt,
    course_type: classifyCourseType(row),
    course_code: row?.DLCode?.code || null,
    date_label: Number.isNaN(date.valueOf()) ? null : date.toISOString(),
  };
}

function buildMonthlySeries(rows) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const buckets = Array.from({ length: 12 }, (_, month) => ({
    month,
    tdc: 0,
    pdcBeginner: 0,
    pdcExperience: 0,
  }));

  rows.forEach((row) => {
    const date = getCreatedDate(row);
    if (Number.isNaN(date.valueOf())) return;

    if (date.getFullYear() !== currentYear) return;

    const month = date.getMonth();
    if (month > currentMonth) return;

    const membership = getCourseMembership(row);
    if (membership.has("tdc")) buckets[month].tdc += 1;
    if (membership.has("pdc_beginner")) buckets[month].pdcBeginner += 1;
    if (membership.has("pdc_experience")) buckets[month].pdcExperience += 1;
  });

  return buckets;
}

async function getSummary(courseFilter = "overall") {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const yearStart = new Date(currentYear, 0, 1);
  const yearEnd = new Date(currentYear + 1, 0, 1);

  const enrollments = await repository.findAllEnrollmentsWithCode(yearStart, yearEnd);

  const normalizedFilter = String(courseFilter || "overall").toLowerCase();
  const filteredEnrollments =
    normalizedFilter === "overall"
      ? enrollments
      : enrollments.filter((item) => {
          const membership = getCourseMembership(item);
          if (normalizedFilter === "pdc") {
            return membership.has("pdc_beginner") || membership.has("pdc_experience");
          }
          return membership.has(normalizedFilter);
        });

  const currentlyEnrolled = filteredEnrollments.filter(
    (item) => item.status === "pending" || item.status === "confirmed"
  ).length;
  const completed = filteredEnrollments.filter((item) => item.status === "completed").length;

  const thisMonth = filteredEnrollments.filter((item) => {
    const date = getCreatedDate(item);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  }).length;

  const pdcBeginner = filteredEnrollments.filter((item) => classifyCourseType(item) === "pdc_beginner").length;
  const pdcExperience = filteredEnrollments.filter((item) => classifyCourseType(item) === "pdc_experience").length;

  const totalStudentsForFilter = new Set(filteredEnrollments.map((item) => item.student_id).filter(Boolean)).size;

  return {
    stats: {
      totalStudents: totalStudentsForFilter,
      currentlyEnrolled,
      completed,
      thisMonth,
      pdcBeginner,
      pdcExperience,
    },
    monthlyEnrollment: buildMonthlySeries(filteredEnrollments),
    activityDates: enrollments
      .map((item) => item.created_at || item.createdAt)
      .filter(Boolean),
  };
}

async function getLogsByDate(isoDate) {
  const start = new Date(`${isoDate}T00:00:00.000Z`);
  const end = new Date(`${isoDate}T00:00:00.000Z`);
  end.setUTCDate(end.getUTCDate() + 1);

  const rows = await repository.findEnrollmentsByDateRange(start, end);
  const logs = rows.map(mapLog);

  return {
    date: isoDate,
    total: logs.length,
    dailyReports: logs,
    recentActivities: logs.slice(0, 10),
  };
}

module.exports = {
  getSummary,
  getLogsByDate,
};
