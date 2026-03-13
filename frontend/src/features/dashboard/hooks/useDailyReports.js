import { useQuery } from "@tanstack/react-query";
import { fetchDailyReports } from "../services/dashboardApi";

export function useDailyReports(filter) {
  return useQuery({
    queryKey: ["reports", "daily", filter],
    queryFn: () => fetchDailyReports(filter),
    enabled: Boolean(filter?.date || (filter?.startDate && filter?.endDate)),
    staleTime: 30 * 1000,
  });
}
