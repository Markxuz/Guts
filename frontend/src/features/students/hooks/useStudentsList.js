import { useQuery } from "@tanstack/react-query";
import { fetchStudents } from "../services/studentsApi";

export function useStudentsList(params = {}) {
  return useQuery({
    queryKey: ["students", params],
    queryFn: () => fetchStudents(params),
  });
}
