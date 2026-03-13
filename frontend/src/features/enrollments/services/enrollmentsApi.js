import { api } from "../../../services/api";

export function createEnrollment(payload) {
  return api.post("/enrollments", payload);
}
