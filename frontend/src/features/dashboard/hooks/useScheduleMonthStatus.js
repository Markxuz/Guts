import { useQuery } from "@tanstack/react-query";
import { fetchScheduleMonthStatus } from "../services/dashboardApi";

export function useScheduleMonthStatus({ year, month, course = "overall" }) {
  return useQuery({
    queryKey: ["schedules", "month-status", year, month, course],
    queryFn: () => fetchScheduleMonthStatus({ year, month: month + 1, course }),
    enabled: Number.isInteger(year) && Number.isInteger(month),
  });
}
