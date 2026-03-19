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
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });

      const previous = queryClient.getQueryData(["notifications"]);
      queryClient.setQueryData(["notifications"], (current) => {
        if (!current) return current;

        const items = Array.isArray(current.items)
          ? current.items.map((item) =>
              item.id === id
                ? {
                    ...item,
                    is_read: true,
                  }
                : item
            )
          : [];

        const unreadCount = items.reduce((count, item) => count + (item.is_read ? 0 : 1), 0);
        return {
          ...current,
          items,
          unreadCount,
        };
      });

      return { previous };
    },
    onError: (_error, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["notifications"], context.previous);
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const { mutate: markAllRead } = useMutation({
    mutationFn: notificationsService.markAllRead,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });

      const previous = queryClient.getQueryData(["notifications"]);
      queryClient.setQueryData(["notifications"], (current) => {
        if (!current) return current;

        const items = Array.isArray(current.items)
          ? current.items.map((item) => ({ ...item, is_read: true }))
          : [];

        return {
          ...current,
          items,
          unreadCount: 0,
        };
      });

      return { previous };
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["notifications"], context.previous);
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  return { markRead, markAllRead };
}
