import { api } from "../../../services/api";

export const usersService = {
  getAll: () => api.get("/users"),
  create: (data) => api.post("/users", data),
  updateRole: (id, role) => api.patch(`/users/${id}/role`, { role }),
  remove: (id) => api.delete(`/users/${id}`),
};
