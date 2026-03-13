import { useQuery } from "@tanstack/react-query";
import { fetchScheduleMonthStatus } from "../services/dashboardApi";

export function useScheduleMonthStatus({ year, month }) {
  return useQuery({
    queryKey: ["schedules", "month-status", year, month],
    queryFn: () => fetchScheduleMonthStatus({ year, month: month + 1 }),
    enabled: Number.isInteger(year) && Number.isInteger(month),
  });
}
