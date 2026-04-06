import { api } from "../../../services/api";

function unwrapScheduleResponse(payload) {
  return payload?.data || payload;
}

export async function fetchDashboardSummary(course = "overall") {
  const query = course && course !== "overall" ? `?course=${encodeURIComponent(course)}` : "";
  return api.get(`/dashboard/summary${query}`);
}

export async function fetchDashboardLogs(dateIso) {
  return api.get(`/dashboard/logs?date=${dateIso}`);
}

export async function fetchDailyReports(filter) {
  const params = new URLSearchParams();
  if (filter?.course) {
    params.set("course", filter.course);
  }
  if (filter?.mode === "day" && filter?.date) {
    params.set("date", filter.date);
    if (filter?.courseType) params.set("courseType", filter.courseType);
    if (filter?.instructorId) params.set("instructorId", String(filter.instructorId));
    if (filter?.vehicleId) params.set("vehicleId", String(filter.vehicleId));
  } else {
    if (filter?.startDate) params.set("startDate", filter.startDate);
    if (filter?.endDate) params.set("endDate", filter.endDate);
  }

  return api.get(`/reports/daily?${params.toString()}`);
}

export async function fetchScheduleMonthStatus({ year, month, course = "overall" }) {
  const params = new URLSearchParams({ year, month });
  if (course && course !== "overall") {
    params.set("course", course);
  }
  const payload = await api.get(`/schedules/month-status?${params.toString()}`);
  return unwrapScheduleResponse(payload);
}

export async function fetchScheduleDay(dateIso) {
  const payload = await api.get(`/schedules/day?date=${encodeURIComponent(dateIso)}`);
  const data = unwrapScheduleResponse(payload);
  return Array.isArray(data) ? data : data?.items || [];
}

export async function createSchedule(payload) {
  const response = await api.post("/schedules", payload);
  return unwrapScheduleResponse(response);
}

export async function cancelSchedule({ scheduleId, scope = "single" }) {
  const response = await api.delete(`/schedules/${scheduleId}?scope=${encodeURIComponent(scope)}`);
  return unwrapScheduleResponse(response);
}

export async function createScheduleChangeRequest(payload) {
  const response = await api.post("/schedule-change-requests", payload);
  return unwrapScheduleResponse(response);
}

export async function fetchPendingScheduleChangeRequests() {
  const response = await api.get("/schedule-change-requests/pending");
  return unwrapScheduleResponse(response);
}

export async function approveScheduleChangeRequest(id) {
  const response = await api.post(`/schedule-change-requests/${id}/approve`, {});
  return unwrapScheduleResponse(response);
}

export async function rejectScheduleChangeRequest({ id, reviewer_note = null }) {
  const response = await api.post(`/schedule-change-requests/${id}/reject`, { reviewer_note });
  return unwrapScheduleResponse(response);
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
