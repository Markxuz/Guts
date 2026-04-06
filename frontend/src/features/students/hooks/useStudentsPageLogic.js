import { useMemo, useState } from "react";
import { useToast } from "../../../shared/utils/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useStudentsList } from "./useStudentsList";
import { deleteStudent, updateEnrollmentStatus, updateStudent } from "../services/studentsApi";
import { getCourseCode, getLatestEnrollment, mapStudentToEditForm } from "../utils/studentsPageUtils";

const PAGE_SIZE = 10;

function getCourseMembership(student) {
  const enrollment = getLatestEnrollment(student);
  const code = String(enrollment?.DLCode?.code || "").toUpperCase();
  const enrollmentType = String(enrollment?.enrollment_type || "").toUpperCase();
  const pdcType = String(enrollment?.pdc_type || enrollment?.pdc_category || "").toLowerCase();

  const membership = {
    tdc: false,
    pdcBeginner: false,
    pdcExperience: false,
  };

  const isPromo =
    code.includes("PROMO") ||
    enrollmentType === "PROMO" ||
    (code.includes("TDC") && code.includes("PDC"));

  if (code.includes("TDC") || enrollmentType === "TDC" || isPromo) {
    membership.tdc = true;
  }

  if (code.includes("PDC") || enrollmentType === "PDC" || isPromo) {
    if (pdcType.includes("experience")) {
      membership.pdcExperience = true;
    } else {
      membership.pdcBeginner = true;
    }
  }

  return membership;
}

function matchesCourseFilter(student, filter) {
  if (filter === "all") return true;

  const membership = getCourseMembership(student);
  if (filter === "TDC") {
    return membership.tdc;
  }

  if (filter === "PDC") {
    return membership.pdcBeginner || membership.pdcExperience;
  }

  return getCourseCode(student) === filter;
}

export function useStudentsPageLogic() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name_asc");
  const [page, setPage] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);
  const [editForm, setEditForm] = useState(() => mapStudentToEditForm(null));
  const [deletingStudent, setDeletingStudent] = useState(null);
  const [updatingStatusStudent, setUpdatingStatusStudent] = useState(null);
  const [statusForm, setStatusForm] = useState({ enrollmentStatus: "" });
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [isBulkStatusModalOpen, setIsBulkStatusModalOpen] = useState(false);
  const [bulkStatusForm, setBulkStatusForm] = useState({ enrollmentStatus: "" });
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

  const bulkStatusUpdateMutation = useMutation({
    mutationFn: async ({ ids, enrollmentStatus }) => {
      const results = await Promise.allSettled(
        ids.map((id) => updateEnrollmentStatus(id, { enrollmentStatus }))
      );

      const failed = results
        .map((result, index) => ({ result, id: ids[index] }))
        .filter((item) => item.result.status === "rejected");

      return {
        total: ids.length,
        failed,
      };
    },
    onSuccess: async ({ total, failed }) => {
      if (failed.length === 0) {
        addToast(`Updated status for ${total} student${total === 1 ? "" : "s"}.`, "success");
      } else {
        const successCount = total - failed.length;
        addToast(
          `Updated ${successCount} student${successCount === 1 ? "" : "s"}; ${failed.length} failed.`,
          "error"
        );
      }

      setIsBulkStatusModalOpen(false);
      setBulkStatusForm({ enrollmentStatus: "" });
      setSelectedStudentIds([]);
      await queryClient.invalidateQueries({ queryKey: ["students"] });
    },
    onError: (mutationError) => {
      addToast(mutationError?.message || "Failed to update selected students.", "error");
    },
  });

  // Compute summary based on current filter
  const summary = useMemo(() => {
    const filtered = students.filter((student) => matchesCourseFilter(student, courseFilter));

    const currentlyEnrolled = filtered.filter((student) => {
      const status = String(getLatestEnrollment(student)?.status || "").toLowerCase();
      return status === "pending" || status === "confirmed";
    }).length;

    const tdc = filtered.filter((student) => getCourseMembership(student).tdc).length;
    const pdcBeginner = filtered.filter((student) => getCourseMembership(student).pdcBeginner).length;
    const pdcExperience = filtered.filter((student) => getCourseMembership(student).pdcExperience).length;

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

    const filtered = students.filter((student) => {
      const fullName = [student.first_name, student.middle_name, student.last_name].filter(Boolean).join(" ");
      const matchesSearch =
        !query ||
        [fullName, student.email, student.phone]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query));

      const matchesCourse = matchesCourseFilter(student, courseFilter);
      const enrollmentStatus = String(getLatestEnrollment(student)?.status || "pending").toLowerCase();
      const matchesStatus = statusFilter === "all" || enrollmentStatus === statusFilter;

      return matchesSearch && matchesCourse && matchesStatus;
    });

    const sorted = [...filtered].sort((a, b) => {
      const nameA = [a.first_name, a.middle_name, a.last_name].filter(Boolean).join(" ").trim().toLowerCase();
      const nameB = [b.first_name, b.middle_name, b.last_name].filter(Boolean).join(" ").trim().toLowerCase();
      const statusA = String(getLatestEnrollment(a)?.status || "").toLowerCase();
      const statusB = String(getLatestEnrollment(b)?.status || "").toLowerCase();

      if (sortBy === "name_asc") {
        return nameA.localeCompare(nameB);
      }

      if (sortBy === "name_desc") {
        return nameB.localeCompare(nameA);
      }

      if (sortBy === "id_desc") {
        return Number(b.id) - Number(a.id);
      }

      if (sortBy === "id_asc") {
        return Number(a.id) - Number(b.id);
      }

      if (sortBy === "status") {
        const rank = {
          pending: 1,
          confirmed: 2,
          completed: 3,
        };
        const rankA = rank[statusA] || 99;
        const rankB = rank[statusB] || 99;
        if (rankA !== rankB) {
          return rankA - rankB;
        }

        return nameA.localeCompare(nameB);
      }

      return nameA.localeCompare(nameB);
    });

    return sorted;
  }, [students, search, courseFilter, statusFilter, sortBy]);

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

  const pagedStudentIds = pagedStudents.map((student) => student.id);
  const allVisibleSelected = pagedStudentIds.length > 0 && pagedStudentIds.every((id) => selectedStudentIds.includes(id));

  const toggleSelectStudent = (id) => {
    setSelectedStudentIds((current) => {
      if (current.includes(id)) {
        return current.filter((item) => item !== id);
      }

      return [...current, id];
    });
  };

  const toggleSelectAllVisible = () => {
    setSelectedStudentIds((current) => {
      if (allVisibleSelected) {
        return current.filter((id) => !pagedStudentIds.includes(id));
      }

      const merged = new Set([...current, ...pagedStudentIds]);
      return Array.from(merged);
    });
  };

  const openBulkStatusModal = () => {
    if (selectedStudentIds.length === 0) {
      addToast("Select at least one student for bulk update.", "error");
      return;
    }

    setIsBulkStatusModalOpen(true);
  };

  const closeBulkStatusModal = () => {
    setIsBulkStatusModalOpen(false);
    setBulkStatusForm({ enrollmentStatus: "" });
  };

  const submitBulkStatusUpdate = (event) => {
    event.preventDefault();

    if (!bulkStatusForm.enrollmentStatus) {
      addToast("Please choose a status for selected students.", "error");
      return;
    }

    if (selectedStudentIds.length === 0) {
      addToast("No students selected.", "error");
      return;
    }

    bulkStatusUpdateMutation.mutate({
      ids: selectedStudentIds,
      enrollmentStatus: bulkStatusForm.enrollmentStatus,
    });
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
    sortBy,
    selectedStudent,
    editingStudent,
    editForm,
    deletingStudent,
    updatingStatusStudent,
    statusForm,
    selectedStudentIds,
    isBulkStatusModalOpen,
    bulkStatusForm,
    allVisibleSelected,
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
    isBulkUpdatingStatus: bulkStatusUpdateMutation.isPending,
    setEditForm,
    setStatusForm,
    setBulkStatusForm,
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
      setSelectedStudentIds([]);
    },
    setStatusFilter: (value) => {
      setStatusFilter(value);
      setPage(1);
      setSelectedStudentIds([]);
    },
    setSortBy: (value) => {
      setSortBy(value);
      setPage(1);
    },
    goToPreviousPage: () => setPage((current) => Math.max(1, current - 1)),
    goToNextPage: () => setPage((current) => Math.min(totalPages, current + 1)),
    toggleSelectStudent,
    toggleSelectAllVisible,
    openBulkStatusModal,
    closeBulkStatusModal,
    submitBulkStatusUpdate,
    clearSelection: () => setSelectedStudentIds([]),
    openEditModal,
    closeEditModal,
    submitEdit,
    openStatusUpdateModal,
    closeStatusUpdateModal,
    submitStatusUpdate,
    confirmDelete,
  };
}
