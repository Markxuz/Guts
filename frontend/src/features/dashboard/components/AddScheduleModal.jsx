import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarClock, CarFront, UserRound, X } from "lucide-react";
import { useAuth } from "../../auth/hooks/useAuth";
import { resourceServices } from "../../../services/resources";
import { fetchDailyReports } from "../services/dashboardApi";
import { formatDateToISO, formatReadableDate } from "../../../shared/utils/date";

const INITIAL_FORM = {
  enrollment_id: "",
  student_id: "",
  course_type: "",
  instructor_id: "",
  care_of_instructor_id: "",
  vehicle_id: "",
  slot: "morning",
  remarks: "",
};

const COURSE_TYPE_OPTIONS = [
  { value: "tdc", label: "TDC" },
  { value: "pdc_beginner", label: "PDC Beginner" },
  { value: "pdc_experience", label: "PDC Experience" },
];

function createInitialForm(defaultCourseType = "") {
  return {
    ...INITIAL_FORM,
    course_type: defaultCourseType,
  };
}

function addDaysToIsoDate(dateIso, daysToAdd) {
  const date = new Date(`${dateIso}T00:00:00`);
  if (Number.isNaN(date.valueOf())) return dateIso;
  date.setDate(date.getDate() + daysToAdd);
  return date.toISOString().slice(0, 10);
}

function toReadableDateLabel(dateIso) {
  const date = new Date(`${dateIso}T00:00:00`);
  if (Number.isNaN(date.valueOf())) return dateIso;
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function slotName(slot) {
  return slot === "afternoon" ? "Afternoon" : "Morning";
}

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function isSchedulableEnrollmentStatus(status) {
  const normalized = normalizeText(status);
  if (!normalized) return false;
  return ["active", "confirmed"].includes(normalized);
}

function fullStudentName(student) {
  if (!student) return "";
  return [student.first_name, student.last_name].filter(Boolean).join(" ").trim();
}

function inferCourseTypeFromEnrollment(enrollment) {
  const dlCode = String(enrollment?.DLCode?.code || "").toUpperCase();
  const pdcType = normalizeText(enrollment?.pdc_type);

  if (pdcType === "experience") return "pdc_experience";
  if (pdcType === "beginner") return "pdc_beginner";
  if (dlCode.includes("TDC") && !dlCode.includes("PDC") && !dlCode.includes("PROMO")) return "tdc";
  if (dlCode.includes("PDC") || dlCode.includes("PROMO")) return "pdc_beginner";
  return "";
}

function courseLabelFromType(courseType) {
  if (courseType === "tdc") return "TDC";
  if (courseType === "pdc_beginner") return "PDC Beginner";
  if (courseType === "pdc_experience") return "PDC Experience";
  return "Unknown Course";
}

function isMotorcycleVehicleType(vehicleType) {
  const normalized = normalizeText(vehicleType);
  return normalized === "motorcycle" || normalized === "motor";
}

function isCarVehicleType(vehicleType) {
  const normalized = normalizeText(vehicleType);
  return normalized === "car" || normalized === "sedan";
}

function matchesVehicleTarget(vehicleType, targetVehicle) {
  const normalizedTarget = normalizeText(targetVehicle);

  if (!normalizedTarget) {
    return true;
  }

  if (normalizedTarget === "motor" || normalizedTarget === "motorcycle") {
    return isMotorcycleVehicleType(vehicleType);
  }

  if (normalizedTarget === "car") {
    return isCarVehicleType(vehicleType);
  }

  return true;
}

function statusLabel(status) {
  const normalized = normalizeText(status);
  if (normalized === "confirmed") return "Confirmed";
  if (normalized === "active") return "Active";
  return status || "Unknown";
}

function ResourceField({ label, name, value, onChange, options, disabled = false }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] font-bold tracking-wide text-[#6b5b4d]">{label}</span>
      <select
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="h-11 rounded-xl border border-[#d9c9a0] bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-[#800000] disabled:cursor-not-allowed disabled:bg-slate-100"
      >
        <option value="" disabled>Select {label.toLowerCase()}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  );
}

export default function AddScheduleModal({
  isOpen,
  selectedDate,
  defaultCourseType = "",
  availability = [],
  loadingAvailability,
  createScheduleMutation,
  cancelScheduleMutation,
  requestScheduleChangeMutation,
  onScheduleSaved,
  onScheduleCancelled,
  onScheduleChangeRequested,
  onClose,
}) {
  const { role } = useAuth();
  const [form, setForm] = useState(() => createInitialForm(defaultCourseType));
  const [studentSearch, setStudentSearch] = useState("");
  const [activeAvailabilitySlot, setActiveAvailabilitySlot] = useState(null);
  const [changeRequestForm, setChangeRequestForm] = useState(null);
  const selectedDateIso = selectedDate ? formatDateToISO(selectedDate) : "";
  const isTdcCourse = form.course_type === "tdc";
  const isAdmin = role === "admin";

  const { data: resources, isLoading: loadingResources } = useQuery({
    queryKey: ["schedule-modal-resources"],
    queryFn: async () => {
      const [instructors, vehicles, enrollments] = await Promise.all([
        resourceServices.instructors.list(),
        resourceServices.vehicles.list(),
        resourceServices.enrollments.list(),
      ]);

      return { instructors, vehicles, enrollments };
    },
    staleTime: 5 * 60 * 1000,
    enabled: isOpen,
  });

  useEffect(() => {
    if (isOpen) {
      const timer = window.setTimeout(() => {
        setStudentSearch("");
        setChangeRequestForm(null);
        setForm((current) => ({
          ...createInitialForm(defaultCourseType),
          slot: availability.find((item) => !item.full)?.slot || "morning",
          remarks: current.remarks,
        }));
      }, 0);

      return () => window.clearTimeout(timer);
    }

    return undefined;
  }, [isOpen, selectedDate, availability, defaultCourseType]);

  const { data: availabilityByCourse, isLoading: loadingAvailabilityByCourse } = useQuery({
    queryKey: [
      "reports",
      "daily",
      "schedule-modal",
      selectedDateIso,
      form.course_type,
      form.instructor_id,
      form.vehicle_id,
    ],
    queryFn: () => fetchDailyReports({
      mode: "day",
      date: selectedDateIso,
      courseType: form.course_type,
      instructorId: form.instructor_id ? Number(form.instructor_id) : undefined,
      vehicleId: !isTdcCourse && form.vehicle_id ? Number(form.vehicle_id) : undefined,
    }),
    enabled: isOpen && Boolean(selectedDateIso) && Boolean(form.course_type),
    staleTime: 10 * 1000,
  });

  const effectiveAvailability = form.course_type
    ? availabilityByCourse?.availability || []
    : availability;

  const courseOptions = COURSE_TYPE_OPTIONS;
  const enrollmentOptions = useMemo(() => {
    const rows = Array.isArray(resources?.enrollments) ? resources.enrollments : [];
    const search = normalizeText(studentSearch);

    return rows
      .filter((row) => isSchedulableEnrollmentStatus(row?.status))
      .map((row) => {
        const student = row?.Student || null;
        const name = fullStudentName(student);
        const detectedCourse = inferCourseTypeFromEnrollment(row);
        return {
          value: String(row.id),
          label: `${name || `Student #${student?.id || "-"}`} | ${courseLabelFromType(detectedCourse)} | ${statusLabel(row?.status)}`,
          studentId: student?.id ? String(student.id) : "",
          courseType: detectedCourse,
        };
      })
      .filter((item) => !search || normalizeText(item.label).includes(search));
  }, [resources, studentSearch]);

  const selectedEnrollmentRow = useMemo(() => {
    const rows = Array.isArray(resources?.enrollments) ? resources.enrollments : [];
    return rows.find((row) => String(row.id) === form.enrollment_id) || null;
  }, [resources, form.enrollment_id]);
  const detectedCourseLabel = courseOptions.find((item) => item.value === form.course_type)?.label || "";
  const instructorOptions = useMemo(() => {
    const rows = resources?.instructors || [];
    const selectedCourseType = String(form.course_type || "").toLowerCase();

    const isQualified = (item) => {
      const specialization = String(item.specialization || "").toLowerCase();
      const tdcCertified = Boolean(item.tdc_certified) || specialization.includes("tdc");
      const pdcBeginnerCertified = Boolean(item.pdc_beginner_certified) || specialization.includes("pdc");
      const pdcExperienceCertified = Boolean(item.pdc_experience_certified) || specialization.includes("pdc");

      if (selectedCourseType === "tdc") return tdcCertified;
      if (selectedCourseType === "pdc_beginner") return pdcBeginnerCertified;
      if (selectedCourseType === "pdc_experience") return pdcExperienceCertified;
      return true;
    };

    return rows
      .filter((item) => String(item.status || "Active") === "Active")
      .filter((item) => isQualified(item))
      .map((item) => ({ value: String(item.id), label: item.name }));
  }, [resources, form.course_type]);

  const vehicleOptions = useMemo(() => {
    const rows = resources?.vehicles || [];
    const targetVehicle = selectedEnrollmentRow?.target_vehicle || "";
    const filtered = rows.filter((item) => matchesVehicleTarget(item.vehicle_type, targetVehicle));
    return filtered.map((item) => ({
      value: String(item.id),
      label: `${item.vehicle_name || item.plate_number} (${item.vehicle_type || "Vehicle"})`,
    }));
  }, [resources, selectedEnrollmentRow]);

  const selectedDateLabel = selectedDate ? formatReadableDate(selectedDate) : "Selected date";
  const dayRestriction = availabilityByCourse?.dayRestriction || null;
  const beginnerSecondDay = availabilityByCourse?.beginnerSecondDay || null;
  const experiencedWholeDayLock = Boolean(availabilityByCourse?.wholeDayLock);
  const selectedVehicle = useMemo(
    () => (resources?.vehicles || []).find((item) => String(item.id) === String(form.vehicle_id)) || null,
    [resources, form.vehicle_id]
  );
  const isMotorcycleWholeDaySchedule =
    form.course_type === "pdc_experience" && isMotorcycleVehicleType(selectedVehicle?.vehicle_type);

  const activeSlotDetails = effectiveAvailability.find((item) => item.slot === activeAvailabilitySlot) || null;
  const selectedSlotDetails = effectiveAvailability.find((item) => item.slot === (isMotorcycleWholeDaySchedule ? "morning" : form.slot)) || null;
  const hasAvailableSlot = effectiveAvailability.some((item) => !item.full);
  const isFormComplete = Boolean(
    form.enrollment_id &&
    form.course_type &&
    form.instructor_id &&
    form.slot &&
    (isTdcCourse || form.vehicle_id)
  );
  const isSubmitDisabled =
    loadingResources ||
    loadingAvailability ||
    loadingAvailabilityByCourse ||
    createScheduleMutation.isPending ||
    Boolean(dayRestriction && !dayRestriction.operational) ||
    Boolean(form.course_type === "pdc_beginner" && beginnerSecondDay && !beginnerSecondDay.operational) ||
    !hasAvailableSlot ||
    !isFormComplete ||
    selectedSlotDetails?.full;

  useEffect(() => {
    if (!isMotorcycleWholeDaySchedule) return;
    Promise.resolve().then(() => {
      setForm((current) => {
        if (current.slot === "morning") {
          return current;
        }
        return {
          ...current,
          slot: "morning",
        };
      });
    });
  }, [isMotorcycleWholeDaySchedule]);

  useEffect(() => {
    if (isTdcCourse) return;
    const existsInOptions = vehicleOptions.some((item) => item.value === String(form.vehicle_id));
    if (existsInOptions || !form.vehicle_id) return;
    Promise.resolve().then(() => {
      setForm((current) => ({
        ...current,
        vehicle_id: "",
      }));
    });
  }, [vehicleOptions, form.vehicle_id, isTdcCourse]);

  function updateField(event) {
    const { name, value } = event.target;
    if (name === "enrollment_id") {
      const allEnrollments = Array.isArray(resources?.enrollments) ? resources.enrollments : [];
      const selected = allEnrollments.find((row) => String(row.id) === value);
      const detectedCourseType = inferCourseTypeFromEnrollment(selected);
      const selectedStudentId = selected?.Student?.id ? String(selected.Student.id) : "";

      setForm((current) => ({
        ...current,
        enrollment_id: value,
        student_id: selectedStudentId,
        course_type: detectedCourseType,
        instructor_id: "",
        care_of_instructor_id: "",
        vehicle_id: "",
        slot: "morning",
      }));
      return;
    }

    if (name === "course_type") {
      setForm((current) => ({
        ...current,
        course_type: value,
        instructor_id: "",
        care_of_instructor_id: value === "tdc" ? "" : current.care_of_instructor_id,
        vehicle_id: value === "tdc" ? "" : current.vehicle_id,
        slot: "morning",
      }));
      return;
    }

    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!selectedDate) return;

    createScheduleMutation.mutate({
      enrollment_id: form.enrollment_id ? Number(form.enrollment_id) : null,
      student_id: form.student_id ? Number(form.student_id) : null,
      course_type: form.course_type,
      instructor_id: Number(form.instructor_id),
      care_of_instructor_id: !isTdcCourse && form.care_of_instructor_id ? Number(form.care_of_instructor_id) : null,
      vehicle_id: !isTdcCourse && form.vehicle_id ? Number(form.vehicle_id) : null,
      schedule_date: formatDateToISO(selectedDate),
      slot: form.slot,
      remarks: form.remarks,
    }, {
      onSuccess: (data) => {
        const reservedDates = Array.isArray(data?.reservedDates) && data.reservedDates.length > 0
          ? data.reservedDates
          : form.course_type === "pdc_beginner"
            ? [selectedDateIso, addDaysToIsoDate(selectedDateIso, 1)]
            : [selectedDateIso];
        const student = data?.item?.studentName || "Open Slot";
        const baseMessage = form.course_type === "pdc_beginner"
          ? `Success! Schedule reserved for ${student} on ${toReadableDateLabel(reservedDates[0])} and ${toReadableDateLabel(reservedDates[1] || addDaysToIsoDate(reservedDates[0], 1))} (${slotName(form.slot)} slot).`
          : `Success! Schedule reserved for ${student} on ${toReadableDateLabel(reservedDates[0])} (${slotName(form.slot)} slot).`;

        if (typeof onScheduleSaved === "function") {
          onScheduleSaved(baseMessage);
        }
        setForm(createInitialForm(defaultCourseType));
        setStudentSearch("");
        handleClose();
      },
    });
  }

  function handleClose() {
    setActiveAvailabilitySlot(null);
    setChangeRequestForm(null);
    onClose();
  }

  function slotOccupancySummary(slotItem) {
    const schedules = Array.isArray(slotItem?.schedules) ? slotItem.schedules : [];
    if (!schedules.length) {
      return "No bookings yet";
    }
    return schedules
      .slice(0, 3)
      .map((entry) => `${entry.studentName} - ${entry.instructor}`)
      .join(" | ");
  }

  function handleCancelSchedule(entry) {
    if (!entry?.id) {
      return;
    }

    let scope = "single";
    if (form.course_type === "pdc_beginner") {
      const cancelBoth = window.confirm("Do you want to cancel both days (Day 1 and Day 2)? Click OK for both days, or Cancel for this specific day only.");
      scope = cancelBoth ? "both" : "single";
    }

    const confirmText = scope === "both"
      ? "Confirm cancellation for both linked beginner schedule days?"
      : "Confirm cancellation for this schedule day?";

    if (!window.confirm(confirmText)) {
      return;
    }

    cancelScheduleMutation.mutate({
      scheduleId: entry.id,
      scope,
      scheduleDate: selectedDateIso,
    }, {
      onSuccess: (data) => {
        const cancelledCount = Number(data?.cancelledCount || 1);
        const message = cancelledCount > 1
          ? `Schedule cancelled successfully. ${cancelledCount} linked day reservations were released.`
          : "Schedule cancelled successfully. The slot is now available again.";

        if (typeof onScheduleCancelled === "function") {
          onScheduleCancelled(message);
        }

        setActiveAvailabilitySlot(null);
      },
    });
  }

  function handleOpenRequestChange(entry) {
    setChangeRequestForm({
      scheduleId: entry.id,
      requested_schedule_date: selectedDateIso,
      requested_slot: activeSlotDetails?.slot || form.slot || "morning",
      reason: "",
      studentName: entry.studentName,
    });
  }

  function handleSubmitChangeRequest() {
    if (!changeRequestForm?.scheduleId || !changeRequestForm.reason.trim()) {
      return;
    }

    requestScheduleChangeMutation.mutate({
      schedule_id: changeRequestForm.scheduleId,
      requested_schedule_date: changeRequestForm.requested_schedule_date,
      requested_slot: changeRequestForm.requested_slot,
      reason: changeRequestForm.reason.trim(),
    }, {
      onSuccess: () => {
        if (typeof onScheduleChangeRequested === "function") {
          onScheduleChangeRequested(`Change request submitted for ${changeRequestForm.studentName || "the selected student"}.`);
        }
        setChangeRequestForm(null);
        setActiveAvailabilitySlot(null);
      },
    });
  }

  if (!isOpen) {
    return null;
  }

  return (
    <div
      style={{ left: "var(--app-sidebar-width, 0px)", width: "calc(100vw - var(--app-sidebar-width, 0px))" }}
      className="fixed inset-y-0 right-0 z-9999 flex items-center justify-center bg-[#1f1111]/70 p-4 backdrop-blur-sm"
    >
      <div className="flex h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-[28px] border border-[#d4af37]/30 bg-[linear-gradient(180deg,#fffdf7_0%,#f8f2e4_100%)] shadow-[0_32px_80px_rgba(40,8,8,0.45)]">
        {/* Fixed Header */}
        <div className="flex shrink-0 items-start justify-between border-b border-[#e6d7b6] bg-[#800000] px-6 py-5 text-white">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#f0d78a]">Calendar Schedule</p>
            <h2 className="mt-2 text-2xl font-bold">Add Schedule</h2>
            <p className="mt-1 text-sm text-white/80">{selectedDateLabel}</p>
          </div>
          <button type="button" onClick={handleClose} className="rounded-full border border-white/20 p-2 text-white/80 transition hover:bg-white/10 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Two-Column Body */}
        <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[1.1fr_0.9fr]">
          <form onSubmit={handleSubmit} className="overflow-y-auto space-y-5 px-6 py-6">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-1 md:col-span-2">
                <span className="text-[11px] font-bold tracking-wide text-[#6b5b4d]">Date</span>
                <input
                  value={selectedDate ? formatDateToISO(selectedDate) : ""}
                  readOnly
                  className="h-11 rounded-xl border border-[#d9c9a0] bg-slate-50 px-3 text-sm text-slate-800 outline-none"
                />
              </label>
              <label className="flex flex-col gap-1 md:col-span-2">
                <span className="text-[11px] font-bold tracking-wide text-[#6b5b4d]">Search Student</span>
                <input
                  value={studentSearch}
                  onChange={(event) => setStudentSearch(event.target.value)}
                  placeholder="Type student name to filter"
                  className="h-11 rounded-xl border border-[#d9c9a0] bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-[#800000]"
                />
              </label>
              <ResourceField
                label="Student"
                name="enrollment_id"
                value={form.enrollment_id}
                onChange={updateField}
                options={enrollmentOptions}
                disabled={loadingResources}
              />
              <label className="flex flex-col gap-1">
                <span className="text-[11px] font-bold tracking-wide text-[#6b5b4d]">Detected Course</span>
                <input
                  value={detectedCourseLabel || "-"}
                  readOnly
                  className="h-11 rounded-xl border border-[#d9c9a0] bg-slate-50 px-3 text-sm text-slate-800 outline-none"
                />
              </label>
              <div className="flex flex-col gap-0.5">
                <ResourceField
                  label="Instructor"
                  name="instructor_id"
                  value={form.instructor_id}
                  onChange={updateField}
                  options={instructorOptions}
                  disabled={loadingResources || !form.course_type}
                />
                {!isTdcCourse && (
                  <span className="ml-1 mt-1 text-xs text-slate-500 italic">Care of (if applicable) is set below</span>
                )}
              </div>
            </div>
            {selectedEnrollmentRow ? (
              <p className="rounded-2xl border border-[#d9c9a0] bg-white px-4 py-3 text-xs text-slate-600">
                Scheduling student: <span className="font-semibold text-slate-900">{fullStudentName(selectedEnrollmentRow.Student) || `Student #${selectedEnrollmentRow.Student?.id || "-"}`}</span>
                {" "}| {courseLabelFromType(inferCourseTypeFromEnrollment(selectedEnrollmentRow))} | {statusLabel(selectedEnrollmentRow.status)}
              </p>
            ) : (
              <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Select a student enrollment to detect course type and enable scheduling.
              </p>
            )}
            <ResourceField label="Vehicle" name="vehicle_id" value={form.vehicle_id} onChange={updateField} options={vehicleOptions} disabled={loadingResources} />
            {!loadingResources && vehicleOptions.length === 0 ? (
              <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                No vehicles match this enrollment vehicle type.
              </p>
            ) : null}

            <div>
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] font-bold tracking-wide text-[#6b5b4d]">
                  {isMotorcycleWholeDaySchedule ? "Session Type" : "Session Slot"}
                </p>
                <p className="text-[11px] text-slate-500">
                  {isMotorcycleWholeDaySchedule
                    ? selectedSlotDetails?.full
                      ? "Whole-day slot is fully booked"
                      : "Whole-day reservation"
                    : selectedSlotDetails
                    ? selectedSlotDetails.full
                      ? "Selected slot is fully booked"
                      : isTdcCourse
                        ? "High-capacity lecture session"
                        : `${selectedSlotDetails.available} slot${selectedSlotDetails.available === 1 ? "" : "s"} left`
                    : "Choose an available slot"}
                </p>
              </div>
              {isMotorcycleWholeDaySchedule ? (
                <div className={`mt-2 rounded-2xl border px-4 py-4 ${selectedSlotDetails?.full ? "border-red-300 bg-red-50 text-red-700" : "border-[#d9c9a0] bg-white text-slate-800"}`}>
                  <p className="text-sm font-semibold">Whole Day (08:00 AM - 05:00 PM)</p>
                  <p className={`mt-1 text-xs ${selectedSlotDetails?.full ? "text-red-600" : "text-slate-500"}`}>
                    {selectedSlotDetails?.full ? (selectedSlotDetails.fullLabel || "Fully Booked") : "Reserved as whole-day motorcycle session"}
                  </p>
                </div>
              ) : (
                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                  {effectiveAvailability.map((item) => (
                    <button
                      key={item.slot}
                      type="button"
                      disabled={item.full}
                      title={slotOccupancySummary(item)}
                      onClick={() => setForm((current) => ({ ...current, slot: item.slot }))}
                      className={`rounded-2xl border px-4 py-4 text-left transition ${
                        item.full
                          ? "border-red-300 bg-red-50 text-red-700"
                          : form.slot === item.slot
                            ? "border-[#800000] bg-[#800000] text-white shadow-lg"
                            : "border-[#d9c9a0] bg-white text-slate-800 hover:border-[#800000]"
                      }`}
                    >
                      <p className="text-sm font-semibold">{item.slotLabel}</p>
                      <p className={`mt-1 text-xs ${item.full ? "text-red-600" : form.slot === item.slot ? "text-white/80" : "text-slate-500"}`}>
                        {item.full
                          ? (item.fullLabel || "Fully Booked")
                          : isTdcCourse
                            ? "High-capacity lecture session"
                            : `${item.available} slot${item.available === 1 ? "" : "s"} left`}
                      </p>
                    </button>
                  ))}
                </div>
              )}
              {dayRestriction && !dayRestriction.operational ? (
                <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {dayRestriction.message}
                </p>
              ) : null}
              {form.course_type === "pdc_experience" ? (
                <p className="mt-3 rounded-xl border border-[#d9c9a0] bg-[#fff7ea] px-3 py-2 text-sm text-[#800000]">
                  {isMotorcycleWholeDaySchedule
                    ? "Motorcycle experience booking reserves both AM and PM slots for the selected instructor and vehicle."
                    : "Select a session slot for PDC Experience four-wheel scheduling."}
                </p>
              ) : null}

              {form.course_type === "pdc_experience" && experiencedWholeDayLock ? (
                <p className="mt-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  Experienced slot is fully booked for this date (whole day locked).
                </p>
              ) : null}

              {form.course_type === "pdc_beginner" && beginnerSecondDay && !beginnerSecondDay.operational ? (
                <p className="mt-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {beginnerSecondDay.message}
                </p>
              ) : null}

              {!loadingAvailability && !loadingAvailabilityByCourse && !hasAvailableSlot ? (
                <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                  No schedule slots are available for this date. Pick another day from the calendar.
                </p>
              ) : null}
            </div>

            <label className="flex flex-col gap-1">
              <span className="text-[11px] font-bold tracking-wide text-[#6b5b4d]">Remarks</span>
              <textarea
                name="remarks"
                value={form.remarks}
                onChange={updateField}
                rows={4}
                placeholder="Add notes for the session"
                className="rounded-2xl border border-[#d9c9a0] bg-white px-3 py-3 text-sm text-slate-800 outline-none transition focus:border-[#800000]"
              />
            </label>

            {selectedSlotDetails && !selectedSlotDetails.full ? (
              <div className="rounded-2xl border border-[#d9c9a0] bg-white/90 px-4 py-3 text-sm text-slate-700">
                <p className="font-semibold text-slate-900">Ready to schedule</p>
                <p className="mt-1 text-xs text-slate-500">
                  {selectedSlotDetails.slotLabel} on {selectedDateLabel}. Select a course, instructor, and vehicle to enable saving.
                </p>
              </div>
            ) : null}

            {createScheduleMutation.isError ? (
              <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {createScheduleMutation.error.message}
              </p>
            ) : null}

            <div className="flex items-center justify-end gap-3 border-t border-[#e6d7b6] pt-4">
              <button type="button" onClick={handleClose} className="rounded-xl border border-[#c7b28a] px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white">
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitDisabled}
                className="rounded-xl bg-[#800000] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#650000] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {createScheduleMutation.isPending ? "Saving..." : "Save Schedule"}
              </button>
            </div>
          </form>

          <aside className="overflow-y-auto border-l border-[#e6d7b6] bg-[#fff7ea] px-6 py-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#800000]">Availability</p>
            <div className="mt-4 space-y-3">
              {effectiveAvailability.map((item) => (
                <div key={item.slot} className={`rounded-2xl border px-4 py-4 ${item.full ? "border-red-200 bg-red-50" : "border-[#ecd9ac] bg-white"}`}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{item.slotLabel}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {isTdcCourse ? `Lecture sessions booked ${item.booked}` : `Capacity ${item.capacity} | Booked ${item.booked}`}
                      </p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${item.full ? "bg-red-100 text-red-700" : "bg-[#D4AF37]/20 text-[#800000]"}`}>
                      {item.full ? (item.fullLabel || "Fully Booked") : "Available"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>

        {/* Modal inside modal conditionally rendered */}
        {activeAvailabilitySlot && activeSlotDetails ? (
          <div
            style={{ left: "var(--app-sidebar-width, 0px)", width: "calc(100vw - var(--app-sidebar-width, 0px))" }}
            className="fixed inset-y-0 right-0 z-[70] flex items-center justify-center bg-black/45 p-4"
          >
            <div className="w-full max-w-xl rounded-2xl border border-[#d9c9a0] bg-white p-5 shadow-2xl">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#800000]">Schedule Info</p>
                  <h3 className="mt-1 text-lg font-bold text-slate-900">{activeSlotDetails.slotLabel}</h3>
                  <p className="text-xs text-slate-500">{selectedDateLabel}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveAvailabilitySlot(null)}
                  className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
                {(activeSlotDetails.schedules || []).map((entry) => (
                  <div key={entry.id} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                    <p className="text-sm font-semibold text-slate-900">Student: {entry.studentName}</p>
                    <p className="mt-1 text-xs text-slate-600">Instructor: {entry.instructor}</p>
                    <p className="mt-1 text-xs text-slate-600">Course: {entry.course}</p>
                    <p className="mt-1 text-xs text-slate-600">Vehicle: {entry.vehicleType || "-"}</p>
                    <div className="mt-3 flex justify-end">
                      {isAdmin ? (
                        <button
                          type="button"
                          onClick={() => handleCancelSchedule(entry)}
                          disabled={cancelScheduleMutation?.isPending}
                          className="rounded-lg border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {cancelScheduleMutation?.isPending ? "Cancelling..." : "Cancel Schedule"}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleOpenRequestChange(entry)}
                          disabled={requestScheduleChangeMutation?.isPending}
                          className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {requestScheduleChangeMutation?.isPending && changeRequestForm?.scheduleId === entry.id ? "Submitting..." : "Request Change"}
                        </button>
                      )}
                    </div>

                    {!isAdmin && changeRequestForm?.scheduleId === entry.id ? (
                      <div className="mt-3 rounded-xl border border-amber-200 bg-white px-3 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-800">Admin Approval Request</p>
                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                          <label className="flex flex-col gap-1">
                            <span className="text-[11px] font-bold tracking-wide text-[#6b5b4d]">New Date</span>
                            <input
                              type="date"
                              value={changeRequestForm.requested_schedule_date}
                              onChange={(event) => setChangeRequestForm((current) => ({ ...current, requested_schedule_date: event.target.value }))}
                              className="h-11 rounded-xl border border-[#d9c9a0] bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-[#800000]"
                            />
                          </label>
                          <label className="flex flex-col gap-1">
                            <span className="text-[11px] font-bold tracking-wide text-[#6b5b4d]">New Slot</span>
                            <select
                              value={changeRequestForm.requested_slot}
                              onChange={(event) => setChangeRequestForm((current) => ({ ...current, requested_slot: event.target.value }))}
                              className="h-11 rounded-xl border border-[#d9c9a0] bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-[#800000]"
                            >
                              <option value="morning">Morning</option>
                              <option value="afternoon">Afternoon</option>
                            </select>
                          </label>
                        </div>
                        <label className="mt-3 flex flex-col gap-1">
                          <span className="text-[11px] font-bold tracking-wide text-[#6b5b4d]">Reason for change</span>
                          <textarea
                            value={changeRequestForm.reason}
                            onChange={(event) => setChangeRequestForm((current) => ({ ...current, reason: event.target.value }))}
                            rows={3}
                            placeholder="Explain why this schedule needs to change"
                            className="rounded-xl border border-[#d9c9a0] bg-white px-3 py-3 text-sm text-slate-800 outline-none transition focus:border-[#800000]"
                          />
                        </label>
                        <div className="mt-3 flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setChangeRequestForm(null)}
                            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleSubmitChangeRequest}
                            disabled={requestScheduleChangeMutation?.isPending || !changeRequestForm.reason.trim()}
                            className="rounded-lg bg-[#800000] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#680000] disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {requestScheduleChangeMutation?.isPending ? "Submitting..." : "Submit Request"}
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>

              {cancelScheduleMutation?.isError ? (
                <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {cancelScheduleMutation.error?.message || "Failed to cancel schedule."}
                </p>
              ) : null}

              {requestScheduleChangeMutation?.isError ? (
                <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {requestScheduleChangeMutation.error?.message || "Failed to submit schedule change request."}
                </p>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}