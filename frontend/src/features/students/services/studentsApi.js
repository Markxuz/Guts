import { resourceServices } from "../../../services/resources";
import { API_BASE_URL, api } from "../../../services/api";

function buildStudentsQuery(params = {}) {
  const searchParams = new URLSearchParams();

  if (params.includeExternal) {
    searchParams.set("includeExternal", "true");
  }

  if (params.source) {
    searchParams.set("source", String(params.source));
  }

  if (params.startDate) {
    searchParams.set("startDate", String(params.startDate));
  }

  if (params.endDate) {
    searchParams.set("endDate", String(params.endDate));
  }

  return searchParams;
}

export function fetchStudents(params = {}) {
  const query = buildStudentsQuery(params).toString();
  return resourceServices.students.list(query ? `?${query}` : "");
}

export function updateStudent(id, payload) {
  return resourceServices.students.update(id, payload);
}

export function deleteStudent(id) {
  return resourceServices.students.remove(id);
}

export function updateEnrollmentStatus(id, payload) {
  return api.put(`/students/${id}/enrollment-status`, {
    ...payload,
  });
}

export async function importOnlineTdcStudents(formData) {
  return api.postForm("/students/online-tdc/import", formData);
}

export async function exportStudents(format = "csv", range) {
  let token = null;
  try {
    const raw = localStorage.getItem("guts_auth");
    const parsed = raw ? JSON.parse(raw) : null;
    token = parsed?.token || null;
  } catch {
    token = null;
  }

  const params = new URLSearchParams();
  params.set("format", String(format || "csv"));
  if (range) params.set("range", String(range));

  const response = await fetch(`${API_BASE_URL}/students/export?${params.toString()}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    let message = `Request failed: ${response.status}`;
    try {
      const payload = await response.json();
      message = payload?.message || message;
    } catch {
      message = `Request failed: ${response.status}`;
    }
    throw new Error(message);
  }

  return response.blob();
}
