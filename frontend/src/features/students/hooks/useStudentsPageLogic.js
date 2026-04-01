import { useMemo, useState } from "react";
import { useToast } from "../../../shared/utils/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useStudentsList } from "./useStudentsList";
import { deleteStudent, updateEnrollmentStatus, updateStudent } from "../services/studentsApi";
import { getCourseCode, getLatestEnrollment, mapStudentToEditForm } from "../utils/studentsPageUtils";

const PAGE_SIZE = 10;

export function useStudentsPageLogic() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);
  const [editForm, setEditForm] = useState(() => mapStudentToEditForm(null));
  const [deletingStudent, setDeletingStudent] = useState(null);
  const [updatingStatusStudent, setUpdatingStatusStudent] = useState(null);
  const [statusForm, setStatusForm] = useState({ enrollmentStatus: "" });
  const [toasts, addToast, removeToast] = useToast();

  const { data, isLoading, isError, error } = useStudentsList();
  const students = useMemo(() => data || [], [data]);



  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updateStudent(id, payload),
    onSuccess: async () => {
      addToast("Student updated successfully.", "success");
      setEditingStudent(null);
      await queryClient.invalidateQueries({ queryKey: ["students"] });
    },
    onError: (mutationError) => {
      addToast(mutationError?.message || "Failed to update student.", "error");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteStudent(id),
    onSuccess: async () => {
      addToast("Student deleted successfully.", "success");
      setDeletingStudent(null);
      await queryClient.invalidateQueries({ queryKey: ["students"] });
    },
    onError: (mutationError) => {
      addToast(mutationError?.message || "Failed to delete student.", "error");
    },
  });

  const statusUpdateMutation = useMutation({
    mutationFn: ({ id, enrollmentStatus }) => updateEnrollmentStatus(id, { enrollmentStatus }),
    onSuccess: async () => {
      addToast("Status updated successfully.", "success");
      setUpdatingStatusStudent(null);
      setStatusForm({ enrollmentStatus: "" });
      await queryClient.invalidateQueries({ queryKey: ["students"] });
    },
    onError: (mutationError) => {
      addToast(mutationError?.message || "Failed to update status.", "error");
    },
  });

  // Compute summary based on current filter
  const summary = useMemo(() => {
    const getMembership = (student) => {
      const enrollment = getLatestEnrollment(student);
      const code = String(enrollment?.DLCode?.code || "").toUpperCase();
      const pdcType = String(enrollment?.pdc_type || "").toLowerCase();

      const membership = {
        tdc: false,
        pdcBeginner: false,
        pdcExperience: false,
      };

      const isPromo = code.includes("PROMO") || (code.includes("TDC") && code.includes("PDC"));
      if (code.includes("TDC")) {
        membership.tdc = true;
      }
      if (code.includes("PDC") || isPromo) {
        if (pdcType === "experience") {
          membership.pdcExperience = true;
        } else {
          membership.pdcBeginner = true;
        }
      }

      return membership;
    };

    let filtered = students;
    if (courseFilter === "TDC") {
      filtered = students.filter((student) => getCourseCode(student) === "TDC");
    } else if (courseFilter === "PDC") {
      filtered = students.filter((student) => getCourseCode(student) === "PDC");
    }

    const currentlyEnrolled = filtered.filter((student) => {
      const status = String(getLatestEnrollment(student)?.status || "").toLowerCase();
      return status === "pending" || status === "confirmed";
    }).length;

    const tdc = filtered.filter((student) => getMembership(student).tdc).length;
    const pdcBeginner = filtered.filter((student) => getMembership(student).pdcBeginner).length;
    const pdcExperience = filtered.filter((student) => getMembership(student).pdcExperience).length;

    return {
      total: filtered.length,
      currentlyEnrolled,
      tdc,
      pdc: pdcBeginner + pdcExperience,
      completed: filtered.filter((student) => getLatestEnrollment(student)?.status === "completed").length,
      thisMonth: filtered.filter((student) => {
        const enrollment = getLatestEnrollment(student);
        const createdAt = enrollment?.createdAt || enrollment?.created_at;
        if (!createdAt) return false;
        const now = new Date();
        const created = new Date(createdAt);
        return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
      }).length,
      pdc_b: pdcBeginner,
      pdc_e: pdcExperience,
    };
  }, [students, courseFilter]);

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return students.filter((student) => {
      const fullName = [student.first_name, student.middle_name, student.last_name].filter(Boolean).join(" ");
      const matchesSearch =
        !query ||
        [fullName, student.email, student.phone]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query));

      const courseCode = getCourseCode(student);
      const matchesCourse = courseFilter === "all" || courseCode === courseFilter;
      const enrollmentStatus = String(getLatestEnrollment(student)?.status || "pending").toLowerCase();
      const matchesStatus = statusFilter === "all" || enrollmentStatus === statusFilter;

      return matchesSearch && matchesCourse && matchesStatus;
    });
  }, [students, search, courseFilter, statusFilter]);

  const totalEntries = filteredStudents.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const pagedStudents = filteredStudents.slice(startIndex, startIndex + PAGE_SIZE);

  const pagination = {
    fromEntry: totalEntries ? startIndex + 1 : 0,
    toEntry: totalEntries ? Math.min(startIndex + PAGE_SIZE, totalEntries) : 0,
    totalEntries,
    currentPage,
    totalPages,
  };

  const openEditModal = (student) => {
    setEditingStudent(student);
    setEditForm(mapStudentToEditForm(student));
  };

  const closeEditModal = () => {
    setEditingStudent(null);
  };

  const submitEdit = (event) => {
    event.preventDefault();
    if (!editingStudent) return;

    updateMutation.mutate({
      id: editingStudent.id,
      payload: {
        student: editForm.student,
        profile: editForm.profile,
      },
    });
  };

  const openStatusUpdateModal = (student) => {
    setUpdatingStatusStudent(student);
    const latestEnrollment = getLatestEnrollment(student);
    setStatusForm({
      enrollmentStatus: latestEnrollment?.status || "",
    });
  };

  const closeStatusUpdateModal = () => {
    setUpdatingStatusStudent(null);
    setStatusForm({ enrollmentStatus: "" });
  };

  const submitStatusUpdate = (event) => {
    event.preventDefault();
    if (!updatingStatusStudent?.id) return;
    if (!statusForm.enrollmentStatus) return;

    statusUpdateMutation.mutate({
      id: updatingStatusStudent.id,
      enrollmentStatus: statusForm.enrollmentStatus,
    });
  };

  const confirmDelete = () => {
    if (deletingStudent?.id) {
      deleteMutation.mutate(deletingStudent.id);
    }
  };

  return {
    search,
    courseFilter,
    statusFilter,
    selectedStudent,
    editingStudent,
    editForm,
    deletingStudent,
    updatingStatusStudent,
    statusForm,
    toasts,
    students: pagedStudents,
    summary,
    pagination,
    isLoading,
    isError,
    error,
    isUpdatingStudent: updateMutation.isPending,
    isDeletingStudent: deleteMutation.isPending,
    isUpdatingStatus: statusUpdateMutation.isPending,
    setEditForm,
    setStatusForm,
    setSelectedStudent,
    setDeletingStudent,
    removeToast,
    setSearch: (value) => {
      setSearch(value);
      setPage(1);
    },
    setCourseFilter: (value) => {
      setCourseFilter(value);
      setPage(1);
    },
    setStatusFilter: (value) => {
      setStatusFilter(value);
      setPage(1);
    },
    goToPreviousPage: () => setPage((current) => Math.max(1, current - 1)),
    goToNextPage: () => setPage((current) => Math.min(totalPages, current + 1)),
    openEditModal,
    closeEditModal,
    submitEdit,
    openStatusUpdateModal,
    closeStatusUpdateModal,
    submitStatusUpdate,
    confirmDelete,
  };
}
