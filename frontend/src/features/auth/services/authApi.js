import { api } from "../../../services/api";

export async function login(payload) {
  return api.post("/auth/login", payload);
}

export async function getCurrentUser() {
  return api.get("/auth/me");
}
