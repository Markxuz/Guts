function resolveApiBaseUrl() {
  const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL;
  if (configuredBaseUrl && configuredBaseUrl !== "/api") {
    return configuredBaseUrl;
  }

  if (typeof window !== "undefined") {
    const host = window.location.hostname || "localhost";
    if (host === "localhost" || host === "127.0.0.1") {
      return `http://${host}:5000/api`;
    }
  }

  return configuredBaseUrl || "/api";
}

const API_BASE_URL = resolveApiBaseUrl();
const AUTH_KEY = "guts_auth";
const UNAUTHORIZED_EVENT = "guts:unauthorized";

function getAuthToken() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed?.token || null;
  } catch {
    return null;
  }
}

async function request(path, options = {}) {
  const token = getAuthToken();
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  if (!isFormData && options.body !== undefined && options.body !== null && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers,
    ...options,
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem(AUTH_KEY);
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    }

    const message = payload?.message || `Request failed: ${response.status}`;
    const err = new Error(message);
    if (Array.isArray(payload?.details) && payload.details.length > 0) {
      err.details = payload.details;
    }
    throw err;
  }

  return payload;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: "POST", body: JSON.stringify(body) }),
  postForm: (path, formData) => request(path, { method: "POST", body: formData }),
  patch: (path, body) => request(path, { method: "PATCH", body: JSON.stringify(body ?? {}) }),
  put: (path, body) => request(path, { method: "PUT", body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: "DELETE" }),
};

export { API_BASE_URL };
