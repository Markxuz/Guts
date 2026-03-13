import { api } from "./api";

function createCrudService(basePath) {
  return {
    list: () => api.get(basePath),
    create: (payload) => api.post(basePath, payload),
    update: (id, payload) => api.put(`${basePath}/${id}`, payload),
    remove: (id) => api.delete(`${basePath}/${id}`),
  };
}

export const resourceServices = {
  students: createCrudService("/students"),
  courses: createCrudService("/courses"),
  instructors: createCrudService("/instructors"),
  vehicles: createCrudService("/vehicles"),
  maintenanceLogs: createCrudService("/maintenance-logs"),
  fuelLogs: createCrudService("/fuel-logs"),
  schedules: createCrudService("/schedules"),
  packages: createCrudService("/packages"),
  dlCodes: createCrudService("/dl-codes"),
  enrollments: createCrudService("/enrollments"),
};
