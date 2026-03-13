import { useQuery } from "@tanstack/react-query";
import { fetchReportOverview } from "../services/dashboardApi";

export function useReportOverview({ startDate, endDate, course }) {
  return useQuery({
    queryKey: ["reports", "overview", startDate, endDate, course || "overall"],
    queryFn: () => fetchReportOverview({ startDate, endDate, course: course || "overall" }),
    enabled: Boolean(startDate && endDate),
  });
}
