import { resourceServices } from "../../../services/resources";
import { api } from "../../../services/api";

export function fetchStudents() {
  return resourceServices.students.list();
}

export function updateStudent(id, payload) {
  return resourceServices.students.update(id, payload);
}

export function deleteStudent(id) {
  return resourceServices.students.remove(id);
}

export function updateEnrollmentStatus(id, { enrollmentStatus }) {
  return api.put(`/students/${id}/enrollment-status`, {
    enrollmentStatus,
  });
}
