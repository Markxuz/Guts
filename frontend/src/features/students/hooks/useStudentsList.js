import { useQuery } from "@tanstack/react-query";
import { fetchStudents } from "../services/studentsApi";

export function useStudentsList() {
  return useQuery({
    queryKey: ["students"],
    queryFn: fetchStudents,
  });
}
