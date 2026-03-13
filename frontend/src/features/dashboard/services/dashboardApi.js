import { api } from "../../../services/api";

export async function fetchDashboardSummary(course = "overall") {
  const query = course && course !== "overall" ? `?course=${encodeURIComponent(course)}` : "";
  return api.get(`/dashboard/summary${query}`);
}

export async function fetchDashboardLogs(dateIso) {
  return api.get(`/dashboard/logs?date=${dateIso}`);
}

export async function fetchDailyReports(filter) {
  const params = new URLSearchParams();
  if (filter?.mode === "day" && filter?.date) {
    params.set("date", filter.date);
  } else {
    if (filter?.startDate) params.set("startDate", filter.startDate);
    if (filter?.endDate) params.set("endDate", filter.endDate);
  }

  return api.get(`/reports/daily?${params.toString()}`);
}

export async function fetchScheduleMonthStatus({ year, month }) {
  return api.get(`/schedules/month-status?year=${year}&month=${month}`);
}

export async function createSchedule(payload) {
  return api.post("/schedules", payload);
}

export async function fetchActivityLogs({ dateIso, limit = 10 } = {}) {
  const params = new URLSearchParams();
  if (dateIso) params.set("date", dateIso);
  if (limit) params.set("limit", String(limit));
  const query = params.toString();
  return api.get(`/activity-logs${query ? `?${query}` : ""}`);
}

export async function fetchReportOverview({ startDate, endDate, course = "overall" }) {
  const query = new URLSearchParams({ startDate, endDate, course }).toString();
  return api.get(`/reports/overview?${query}`);
}
