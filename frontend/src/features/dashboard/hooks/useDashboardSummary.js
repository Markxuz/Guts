import { useQuery } from "@tanstack/react-query";
import { fetchDashboardSummary } from "../services/dashboardApi";

export function useDashboardSummary(courseFilter) {
  return useQuery({
    queryKey: ["dashboard", "summary", courseFilter || "overall"],
    queryFn: () => fetchDashboardSummary(courseFilter || "overall"),
    retry: (failureCount, error) => {
      const message = String(error?.message || "").toLowerCase();
      if (message.includes("unauthorized") || message.includes("invalid token")) {
        return false;
      }

      // Self-heal for transient backend restarts or brief DB hiccups.
      return failureCount < 4;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 8000),
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
  });
}
