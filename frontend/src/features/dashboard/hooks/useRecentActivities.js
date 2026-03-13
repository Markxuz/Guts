import { useQuery } from "@tanstack/react-query";
import { fetchActivityLogs } from "../services/dashboardApi";

export function useRecentActivities(options = {}) {
  const { dateIso, limit = 10 } = options;

  return useQuery({
    queryKey: ["activity-logs", dateIso || "latest", limit],
    queryFn: () => fetchActivityLogs({ dateIso, limit }),
  });
}
