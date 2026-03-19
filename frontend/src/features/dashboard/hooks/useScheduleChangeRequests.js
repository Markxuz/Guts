import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  approveScheduleChangeRequest,
  createScheduleChangeRequest,
  fetchPendingScheduleChangeRequests,
  rejectScheduleChangeRequest,
} from "../services/dashboardApi";

export function usePendingScheduleChangeRequests(enabled = true) {
  return useQuery({
    queryKey: ["schedule-change-requests", "pending"],
    queryFn: fetchPendingScheduleChangeRequests,
    enabled,
  });
}

export function useCreateScheduleChangeRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createScheduleChangeRequest,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["schedule-change-requests"] }),
        queryClient.invalidateQueries({ queryKey: ["notifications"] }),
      ]);
    },
  });
}

export function useApproveScheduleChangeRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: approveScheduleChangeRequest,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["schedule-change-requests"] }),
        queryClient.invalidateQueries({ queryKey: ["reports", "daily"] }),
        queryClient.invalidateQueries({ queryKey: ["reports", "daily", "schedule-modal"] }),
        queryClient.invalidateQueries({ queryKey: ["reports"] }),
        queryClient.invalidateQueries({ queryKey: ["notifications"] }),
        queryClient.invalidateQueries({ queryKey: ["activity-logs"] }),
        queryClient.invalidateQueries({ queryKey: ["schedules", "month-status"] }),
      ]);
    },
  });
}

export function useRejectScheduleChangeRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rejectScheduleChangeRequest,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["schedule-change-requests"] }),
        queryClient.invalidateQueries({ queryKey: ["notifications"] }),
      ]);
    },
  });
}