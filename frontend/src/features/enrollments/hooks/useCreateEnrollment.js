import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createEnrollment } from "../services/enrollmentsApi";

export function useCreateEnrollment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createEnrollment,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["dashboard", "summary"] }),
        queryClient.invalidateQueries({ queryKey: ["reports"] }),
        queryClient.invalidateQueries({ queryKey: ["activity-logs"] }),
        queryClient.invalidateQueries({ queryKey: ["enrollments"] }),
      ]);
    },
  });
}
