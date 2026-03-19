import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cancelSchedule } from "../services/dashboardApi";

export function useCancelSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelSchedule,
    onSuccess: async (_data, variables) => {
      const dateIso = variables?.scheduleDate;
      const date = dateIso ? new Date(`${dateIso}T00:00:00`) : null;

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["reports", "daily"] }),
        queryClient.invalidateQueries({ queryKey: ["reports", "daily", "schedule-modal"] }),
        queryClient.invalidateQueries({ queryKey: ["reports"] }),
        queryClient.invalidateQueries({ queryKey: ["activity-logs"] }),
        ...(date ? [queryClient.invalidateQueries({ queryKey: ["schedules", "month-status", date.getFullYear(), date.getMonth()] })] : []),
      ]);
    },
  });
}
