import { api } from "../../../services/api";

export const notificationsService = {
  getAll: () => api.get("/notifications"),
  markRead: (id) => api.patch(`/notifications/${id}/read`, {}),
  markAllRead: () => api.patch("/notifications/read-all", {}),
};
