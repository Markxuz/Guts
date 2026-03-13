const repository = require("./activity-logs.repository");

async function recordActivity({ userId, action, timestamp = new Date() }) {
  if (!userId || !action) {
    return null;
  }

  return repository.createActivityLog({ userId, action, timestamp });
}

async function listActivityLogs({ isoDate, limit = 30 } = {}) {
  let rows = [];

  if (isoDate) {
    const start = new Date(`${isoDate}T00:00:00.000Z`);
    const end = new Date(`${isoDate}T00:00:00.000Z`);
    end.setUTCDate(end.getUTCDate() + 1);
    rows = await repository.findActivityLogsByDateRange(start, end, limit);
  } else {
    rows = await repository.findRecentActivityLogs(limit);

    if (!rows.length) {
      const enrollments = await repository.findRecentEnrollments(limit);
      return enrollments.map((row) => {
        const name = [row?.Student?.first_name, row?.Student?.last_name].filter(Boolean).join(" ") || "Unknown Student";
        const code = row?.DLCode?.code || "Course";
        return {
          id: `enrollment-${row.id}`,
          userId: row.student_id,
          action: `created an enrollment for ${code}`,
          timestamp: row.created_at,
          userName: name,
        };
      });
    }
  }

  return rows.map((row) => ({
    id: row.id,
    userId: row.userId,
    action: row.action,
    timestamp: row.timestamp,
    userName: row?.User?.name || "Unknown User",
  }));
}

module.exports = {
  recordActivity,
  listActivityLogs,
};
