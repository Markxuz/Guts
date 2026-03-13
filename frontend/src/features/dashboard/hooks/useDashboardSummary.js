import { useQuery } from "@tanstack/react-query";
import { fetchDashboardSummary } from "../services/dashboardApi";

export function useDashboardSummary(courseFilter) {
  return useQuery({
    queryKey: ["dashboard", "summary", courseFilter || "overall"],
    queryFn: () => fetchDashboardSummary(courseFilter || "overall"),
  });
}
