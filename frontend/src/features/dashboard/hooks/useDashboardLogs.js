import { useQuery } from "@tanstack/react-query";
import { fetchDashboardLogs } from "../services/dashboardApi";

export function useDashboardLogs(dateIso) {
  return useQuery({
    queryKey: ["dashboard", "logs", dateIso],
    queryFn: () => fetchDashboardLogs(dateIso),
    enabled: Boolean(dateIso),
  });
}
