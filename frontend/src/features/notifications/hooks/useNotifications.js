import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsService } from "../services/notificationsService";
import { useAuth } from "../../auth/hooks/useAuth";

export function useNotifications() {
  const { role } = useAuth();
  const canReceive = role === "admin" || role === "sub_admin";

  return useQuery({
    queryKey: ["notifications"],
    queryFn: notificationsService.getAll,
    refetchInterval: 30000,
    enabled: canReceive,
    select: (data) => data,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  const { mutate: markRead } = useMutation({
    mutationFn: (id) => notificationsService.markRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const { mutate: markAllRead } = useMutation({
    mutationFn: notificationsService.markAllRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  return { markRead, markAllRead };
}
