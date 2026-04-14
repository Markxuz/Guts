import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { resourceServices } from "../../../services/resources";
import { createSchedule, fetchDailyReports } from "../../dashboard/services/dashboardApi";

const ENROLLING_FOR_OPTIONS = [
  { value: "PDC Experienced", label: "PDC Experienced" },
  { value: "PDC Beginner", label: "PDC Beginner" },
  { value: "PDC Additional Restriction / DL Codes - Experienced", label: "PDC Additional Restriction / DL Codes - Experienced" },
  { value: "PDC Additional Restriction / DL Codes- Beginner", label: "PDC Additional Restriction / DL Codes- Beginner" },
  { value: "DRIVING LESSON ( w/ license already)", label: "DRIVING LESSON ( w/ license already)" },
  { value: "Other", label: "Other" },
];

const PDC_CLASSIFICATION_OPTIONS = [
  { value: "Beginner", label: "Beginner" },
  { value: "Experience", label: "Experience" },
];

const TRAINING_MODE_OPTIONS = [
  {
    value: "Experienced (w/ experience in driving/Applicable para sa marunong na talaga magdrive)",
    label: "Experienced (w/ experience in driving/Applicable para sa marunong na talaga magdrive)",
  },
  {
    value: "BEGINNER ( w/out Experience in Driving / Driving Enhancement/ Magpapaturo pa magdrive)",
    label: "BEGINNER ( w/out Experience in Driving / Driving Enhancement/ Magpapaturo pa magdrive)",
  },
  {
    value: "ADD RC/DL Codes -EXPERIENCED ( Para sa mga magpapadagdag ng DL Codes na marunong na talaga magdrive)",
    label: "ADD RC/DL Codes -EXPERIENCED ( Para sa mga magpapadagdag ng DL Codes na marunong na talaga magdrive)",
  },
  {
    value: "ADD RC/DL Codes -BEGINNER ( Para sa mga magpapadagdag ng DL Codes na Magpapaturo pa mag drive)",
    label: "ADD RC/DL Codes -BEGINNER ( Para sa mga magpapadagdag ng DL Codes na Magpapaturo pa mag drive)",
  },
  {
    value: "DRIVING LESSON ( Para sa mga may lisensya na at may DLCodes na B/B1 na Magpapaturo pa magdrive)",
    label: "DRIVING LESSON ( Para sa mga may lisensya na at may DLCodes na B/B1 na Magpapaturo pa magdrive)",
  },
  { value: "Other", label: "Other" },
];

const TARGET_VEHICLE_OPTIONS = [
  { value: "DL Codes A - Motorcycle (2 wheels)", label: "DL Codes A - Motorcycle (2 wheels)" },
  { value: "DL Codes A1 - Tricycle (3 wheels)", label: "DL Codes A1 - Tricycle (3 wheels)" },
  { value: "DL Codes B - Car/Sedan (4 wheels - 8 seaters below)", label: "DL Codes B - Car/Sedan (4 wheels - 8 seaters below)" },
  { value: "DL Codes B1 - L300/Van (4 wheels - 9 seaters above)", label: "DL Codes B1 - L300/Van (4 wheels - 9 seaters above)" },
  { value: "Other", label: "Other" },
];

const TRANSMISSION_OPTIONS = [
  { value: "AUTOMATIC TRANSMISSION (A/T) not allowed to drive M/T", label: "AUTOMATIC TRANSMISSION (A/T) not allowed to drive M/T" },
  { value: "MANUAL TRANSMISSION (M/T) allowed to drive A/T", label: "MANUAL TRANSMISSION (M/T) allowed to drive A/T" },
  { value: "Other", label: "Other" },
];

const DRIVING_SCHOOL_OPTIONS = [
  { value: "GUTS Driving School", label: "GUTS Driving School" },
  { value: "Other", label: "Other" },
];

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function courseTypeFromClassification(classification) {
  return classification === "Experience" ? "pdc_experience" : "pdc_beginner";
}

function scheduleCourseLabel(classification) {
  if (classification === "Experience") return "PDC Experience";
  if (classification === "Beginner") return "PDC Beginner";
  return "Select course details above";
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

  if (!normalizedTarget) return true;

  const wantsMotorcycle =
    normalizedTarget === "motor" ||
    normalizedTarget === "motorcycle" ||
    normalizedTarget.includes("motorcycle") ||
    normalizedTarget.includes("tricycle") ||
    normalizedTarget.includes("dl codes a");

  if (wantsMotorcycle) return isMotorcycleVehicleType(vehicleType);

  const wantsCar =
    normalizedTarget === "car" ||
    normalizedTarget.includes("car") ||
    normalizedTarget.includes("sedan") ||
    normalizedTarget.includes("l300") ||
    normalizedTarget.includes("van") ||
    normalizedTarget.includes("dl codes b");

  if (wantsCar) return isCarVehicleType(vehicleType);

  return true;
}

function matchesTransmissionType(vehicleTransmission, selectedTransmission) {
  const normalizedSelected = normalizeText(selectedTransmission);
  if (!normalizedSelected) return true;
  if (normalizedSelected === "other") return true;
  if (normalizedSelected.includes("manual")) return normalizeText(vehicleTransmission) === "manual";
  if (normalizedSelected.includes("automatic")) return normalizeText(vehicleTransmission) === "automatic";
  return normalizeText(vehicleTransmission) === normalizedSelected;
}

function initialForm(enrollment) {
  const profile = enrollment?.Student?.StudentProfile || {};
  const pdcType = String(enrollment?.pdc_type || "").toLowerCase();
  const classification = pdcType === "experience" ? "Experience" : "Beginner";

  return {
    enrolling_for: enrollment?.enrolling_for || "",
    pdc_classification: classification,
    training_method: enrollment?.training_method || "",
    target_vehicle: enrollment?.target_vehicle || "",
    transmission_type: enrollment?.transmission_type || "",
    driving_school_tdc: profile?.driving_school_tdc || "",
    year_completed_tdc: profile?.year_completed_tdc || "",
    schedule_date: "",
    care_of_instructor_id: "",
    instructor_id: "",
    vehicle_id: "",
    slot: "morning",
  };
}

export default function SchedulePdcLaterModal({ isOpen, enrollment, onClose, onScheduleAdded }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(() => initialForm(enrollment));
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      setForm(initialForm(enrollment));
      setErrorMessage("");
    });
    return () => {
      cancelled = true;
    };
  }, [isOpen, enrollment]);

  const { data: resources, isLoading: loadingResources } = useQuery({
    queryKey: ["schedule-pdc-later-modal-resources"],
    queryFn: async () => {
      const [instructors, vehicles] = await Promise.all([
        resourceServices.instructors.list(),
        resourceServices.vehicles.list(),
      ]);
      return { instructors, vehicles };
    },
    enabled: isOpen,
    staleTime: 5 * 60 * 1000,
  });

  const courseType = courseTypeFromClassification(form.pdc_classification);

  const instructorOptions = useMemo(() => {
    const rows = resources?.instructors || [];

    const isQualified = (item) => {
      const specialization = String(item.specialization || "").toLowerCase();
      const pdcBeginnerCertified = Boolean(item.pdc_beginner_certified) || specialization.includes("pdc");
      const pdcExperienceCertified = Boolean(item.pdc_experience_certified) || specialization.includes("pdc");

      if (courseType === "pdc_beginner") return pdcBeginnerCertified;
      if (courseType === "pdc_experience") return pdcExperienceCertified;
      return true;
    };

    return rows
      .filter((item) => String(item.status || "Active") === "Active")
      .filter((item) => isQualified(item))
      .map((item) => ({ value: String(item.id), label: item.name }));
  }, [resources, courseType]);

  const vehicleOptions = useMemo(() => {
    const rows = resources?.vehicles || [];
    const filtered = rows
      .filter((item) => matchesVehicleTarget(item.vehicle_type, form.target_vehicle))
      .filter((item) => matchesTransmissionType(item.transmission_type, form.transmission_type));

    return filtered.map((item) => ({
      value: String(item.id),
      label: `${item.vehicle_name || item.plate_number} (${item.vehicle_type || "Vehicle"} | ${item.transmission_type || "Transmission N/A"})`,
      vehicleType: item.vehicle_type,
    }));
  }, [resources, form.target_vehicle, form.transmission_type]);

  const selectedVehicle = useMemo(
    () => (resources?.vehicles || []).find((item) => String(item.id) === String(form.vehicle_id)) || null,
    [resources, form.vehicle_id]
  );

  const isWholeDayExperience =
    courseType === "pdc_experience" && isMotorcycleVehicleType(selectedVehicle?.vehicle_type);

  const activeSlot = isWholeDayExperience ? "morning" : form.slot;

  const { data: scheduleAvailability, isLoading: loadingAvailability } = useQuery({
    queryKey: [
      "schedule-pdc-later-availability",
      form.schedule_date,
      courseType,
      form.instructor_id,
      form.vehicle_id,
    ],
    queryFn: () => fetchDailyReports({
      mode: "day",
      date: form.schedule_date,
      courseType,
      instructorId: form.instructor_id ? Number(form.instructor_id) : undefined,
      vehicleId: form.vehicle_id ? Number(form.vehicle_id) : undefined,
    }),
    enabled: isOpen && Boolean(form.schedule_date) && Boolean(courseType),
    staleTime: 10 * 1000,
  });

  const slots = scheduleAvailability?.availability || [];
  const selectedSlotDetails = slots.find((item) => item.slot === activeSlot) || null;
  const fallbackSlots = [
    { slot: "morning", slotLabel: "08:00 AM - 12:00 PM", full: false, available: 0 },
    { slot: "afternoon", slotLabel: "01:00 PM - 05:00 PM", full: false, available: 0 },
  ];

  const submitMutation = useMutation({
    mutationFn: async () => {
      const enrollmentId = Number(enrollment?.id || 0);
      const studentId = Number(enrollment?.Student?.id || enrollment?.student_id || 0);
      const pdcType = form.pdc_classification === "Experience" ? "experience" : "beginner";

      await resourceServices.enrollments.update(enrollmentId, {
        enrolling_for: form.enrolling_for,
        pdc_type: pdcType,
        training_method: form.training_method,
        target_vehicle: form.target_vehicle,
        transmission_type: form.transmission_type,
        pdc_start_mode: "now",
        enrollment_state: "pdc_in_progress",
        status: "confirmed",
      });

      if (studentId) {
        await resourceServices.students.update(studentId, {
          profile: {
            driving_school_tdc: form.driving_school_tdc,
            year_completed_tdc: form.year_completed_tdc,
          },
        });
      }

      return createSchedule({
        enrollment_id: enrollmentId,
        student_id: studentId || null,
        course_type: courseType,
        instructor_id: Number(form.instructor_id),
        care_of_instructor_id: form.care_of_instructor_id ? Number(form.care_of_instructor_id) : null,
        vehicle_id: form.vehicle_id ? Number(form.vehicle_id) : null,
        schedule_date: form.schedule_date,
        slot: activeSlot,
        remarks: "PDC scheduled via Schedule PDC Later",
      });
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["enrollments", "schedule-pdc-later"] }),
        queryClient.invalidateQueries({ queryKey: ["enrollments"] }),
        queryClient.invalidateQueries({ queryKey: ["students"] }),
        queryClient.invalidateQueries({ queryKey: ["reports", "daily"] }),
      ]);

      if (typeof onScheduleAdded === "function") {
        onScheduleAdded("PDC schedule added successfully.");
      }

      onClose();
    },
    onError: (error) => {
      setErrorMessage(error?.message || "Failed to schedule PDC. Please review the form.");
    },
  });

  function handleFieldChange(event) {
    const { name, value } = event.target;
    setErrorMessage("");

    setForm((current) => {
      if (name === "pdc_classification") {
        return {
          ...current,
          pdc_classification: value,
          instructor_id: "",
          care_of_instructor_id: "",
          vehicle_id: "",
          slot: "morning",
        };
      }

      if (name === "target_vehicle" || name === "transmission_type") {
        return {
          ...current,
          [name]: value,
          vehicle_id: "",
        };
      }

      if (name === "vehicle_id") {
        return {
          ...current,
          vehicle_id: value,
          slot: "morning",
        };
      }

      return { ...current, [name]: value };
    });
  }

  function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");

    if (!form.enrolling_for || !form.pdc_classification || !form.training_method) {
      setErrorMessage("Complete the PDC course information fields.");
      return;
    }

    if (!form.target_vehicle || !form.transmission_type) {
      setErrorMessage("Target vehicle and transmission are required.");
      return;
    }

    if (!form.driving_school_tdc || !form.year_completed_tdc) {
      setErrorMessage("Driving school and TDC completion year are required.");
      return;
    }

    if (!form.schedule_date || !form.instructor_id || !form.vehicle_id) {
      setErrorMessage("Complete the PDC schedule session details.");
      return;
    }

    if (!isWholeDayExperience && !form.slot) {
      setErrorMessage("Select a time slot.");
      return;
    }

    if (selectedSlotDetails?.full) {
      setErrorMessage(selectedSlotDetails.fullLabel || "Selected slot is fully booked.");
      return;
    }

    submitMutation.mutate();
  }

  if (!isOpen || !enrollment) {
    return null;
  }

  return (
    <div
      style={{ left: "var(--app-sidebar-width, 0px)", width: "calc(100vw - var(--app-sidebar-width, 0px))" }}
      className="fixed inset-y-0 right-0 z-9999 flex items-center justify-center bg-slate-950/40 p-4"
    >
      <div className="flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-[#d9c9a0] bg-[#fff9ef] shadow-2xl">
        <div className="flex items-start justify-between border-b border-[#e6d7b6] bg-[#800000] px-6 py-5 text-white">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#f0d78a]">PDC</p>
            <h2 className="mt-2 text-2xl font-bold">COURSE INFORMATION</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-full border border-white/20 p-2 text-white/80 transition hover:bg-white/10 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="thin-scrollbar flex-1 overflow-y-auto px-6 py-5">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-1">
              <span className="text-[11px] font-bold tracking-wide text-[#6b5b4d]">ENROLLING FOR *</span>
              <select name="enrolling_for" value={form.enrolling_for} onChange={handleFieldChange} className="h-11 rounded-xl border border-[#d9c9a0] bg-white px-3 text-sm text-slate-800 outline-none">
                <option value="" disabled>Select enrollment purpose</option>
                {ENROLLING_FOR_OPTIONS.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-[11px] font-bold tracking-wide text-[#6b5b4d]">PDC CLASSIFICATION *</span>
              <select name="pdc_classification" value={form.pdc_classification} onChange={handleFieldChange} className="h-11 rounded-xl border border-[#d9c9a0] bg-white px-3 text-sm text-slate-800 outline-none">
                <option value="" disabled>Select Beginner or Experience</option>
                {PDC_CLASSIFICATION_OPTIONS.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 md:col-span-2">
              <span className="text-[11px] font-bold tracking-wide text-[#6b5b4d]">MODE OF TRAINING *</span>
              <select name="training_method" value={form.training_method} onChange={handleFieldChange} className="h-11 rounded-xl border border-[#d9c9a0] bg-white px-3 text-sm text-slate-800 outline-none">
                <option value="" disabled>Select mode of training</option>
                {TRAINING_MODE_OPTIONS.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
            </label>
          </div>

          <p className="mt-4 rounded-xl border border-[#d9c9a0] bg-white px-4 py-3 text-sm text-slate-700">
            IMPORTANT REMINDERS FOR PDC STUDENTS: PER DL CODES PO ANG ATING PDC. EVERY DL CODES MAGKAKAIBA ANG RATES AND SCHEDULE.
          </p>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-1">
              <span className="text-[11px] font-bold tracking-wide text-[#6b5b4d]">ANONG SASAKYAN ANG IMAMANEHO? *</span>
              <select name="target_vehicle" value={form.target_vehicle} onChange={handleFieldChange} className="h-11 rounded-xl border border-[#d9c9a0] bg-white px-3 text-sm text-slate-800 outline-none">
                <option value="" disabled>Select vehicle</option>
                {TARGET_VEHICLE_OPTIONS.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-[11px] font-bold tracking-wide text-[#6b5b4d]">ANONG KLASE NG TRANSMISSION? *</span>
              <select name="transmission_type" value={form.transmission_type} onChange={handleFieldChange} className="h-11 rounded-xl border border-[#d9c9a0] bg-white px-3 text-sm text-slate-800 outline-none">
                <option value="" disabled>Select transmission</option>
                {TRANSMISSION_OPTIONS.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-[11px] font-bold tracking-wide text-[#6b5b4d]">Driving School where you have taken your TDC *</span>
              <select name="driving_school_tdc" value={form.driving_school_tdc} onChange={handleFieldChange} className="h-11 rounded-xl border border-[#d9c9a0] bg-white px-3 text-sm text-slate-800 outline-none">
                <option value="" disabled>Select driving school</option>
                {DRIVING_SCHOOL_OPTIONS.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-[11px] font-bold tracking-wide text-[#6b5b4d]">Year you completed your TDC *</span>
              <input
                name="year_completed_tdc"
                value={form.year_completed_tdc}
                onChange={handleFieldChange}
                placeholder="Enter year completed"
                maxLength={4}
                className="h-11 rounded-xl border border-[#d9c9a0] bg-white px-3 text-sm text-slate-800 outline-none"
              />
            </label>
          </div>

          <section className="mt-6 rounded-2xl border border-[#d9c9a0] bg-white p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-base font-semibold text-slate-900">PDC Schedule Session</h3>
                <p className="mt-1 text-sm text-slate-500">Set the PDC schedule for promo enrollment.</p>
              </div>
              <span className="rounded-full bg-[#D4AF37]/20 px-3 py-1 text-xs font-semibold text-[#800000]">
                {scheduleCourseLabel(form.pdc_classification)}
              </span>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-1">
                <span className="text-[11px] font-bold tracking-wide text-[#6b5b4d]">Start Date</span>
                <input type="date" name="schedule_date" value={form.schedule_date} onChange={handleFieldChange} className="h-11 rounded-xl border border-[#d9c9a0] bg-white px-3 text-sm text-slate-800 outline-none" />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-[11px] font-bold tracking-wide text-[#6b5b4d]">Care of</span>
                <select name="care_of_instructor_id" value={form.care_of_instructor_id} onChange={handleFieldChange} disabled={loadingResources} className="h-11 rounded-xl border border-[#d9c9a0] bg-white px-3 text-sm text-slate-800 outline-none disabled:bg-slate-100">
                  <option value="">Select care of instructor</option>
                  {instructorOptions.map((item) => (
                    <option key={item.value} value={item.value}>{item.label}</option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-[11px] font-bold tracking-wide text-[#6b5b4d]">Instructor</span>
                <select name="instructor_id" value={form.instructor_id} onChange={handleFieldChange} disabled={loadingResources} className="h-11 rounded-xl border border-[#d9c9a0] bg-white px-3 text-sm text-slate-800 outline-none disabled:bg-slate-100">
                  <option value="">Select instructor</option>
                  {instructorOptions.map((item) => (
                    <option key={item.value} value={item.value}>{item.label}</option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-[11px] font-bold tracking-wide text-[#6b5b4d]">Vehicle</span>
                <select name="vehicle_id" value={form.vehicle_id} onChange={handleFieldChange} disabled={loadingResources} className="h-11 rounded-xl border border-[#d9c9a0] bg-white px-3 text-sm text-slate-800 outline-none disabled:bg-slate-100">
                  <option value="">Select vehicle</option>
                  {vehicleOptions.map((item) => (
                    <option key={item.value} value={item.value}>{item.label}</option>
                  ))}
                </select>
                {!loadingResources && vehicleOptions.length === 0 ? (
                  <span className="text-xs text-red-600">No vehicles match your selected target vehicle/transmission.</span>
                ) : null}
              </label>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] font-bold tracking-wide text-[#6b5b4d]">Time Slot</p>
                <p className="text-[11px] text-slate-500">
                  {selectedSlotDetails
                    ? selectedSlotDetails.full
                      ? "Fully booked"
                      : `${selectedSlotDetails.available} slot${selectedSlotDetails.available === 1 ? "" : "s"} left`
                    : "Select a date to view availability"}
                </p>
              </div>

              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                {(slots.length ? slots : fallbackSlots).map((item) => {
                  const selected = activeSlot === item.slot;
                  return (
                    <button
                      key={item.slot}
                      type="button"
                      disabled={Boolean(item.full) || isWholeDayExperience}
                      onClick={() => setForm((current) => ({ ...current, slot: item.slot }))}
                      className={`rounded-2xl border px-4 py-4 text-left transition ${
                        item.full
                          ? "border-red-300 bg-red-50 text-red-700"
                          : selected
                            ? "border-[#800000] bg-[#800000] text-white"
                            : "border-[#d9c9a0] bg-white text-slate-800 hover:border-[#800000]"
                      }`}
                    >
                      <p className="text-sm font-semibold">{item.slotLabel || (item.slot === "morning" ? "08:00 AM - 12:00 PM" : "01:00 PM - 05:00 PM")}</p>
                      <p className={`mt-1 text-xs ${item.full ? "text-red-600" : selected ? "text-white/80" : "text-slate-500"}`}>
                        {item.full ? (item.fullLabel || "Fully Booked") : `${item.available || 0} slots left`}
                      </p>
                    </button>
                  );
                })}
              </div>

              {isWholeDayExperience ? (
                <p className="mt-3 rounded-xl border border-[#d9c9a0] bg-[#fff9ef] px-3 py-2 text-sm text-slate-700">
                  Motorcycle experience session is reserved as whole-day schedule.
                </p>
              ) : null}

              {loadingAvailability ? (
                <p className="mt-3 text-sm text-slate-500">Checking schedule availability...</p>
              ) : null}
            </div>
          </section>

          {errorMessage ? (
            <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{errorMessage}</p>
          ) : null}

          <div className="mt-6 flex items-center justify-end gap-2 border-t border-[#e6d7b6] pt-4">
            <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitMutation.isPending}
              className="rounded-lg bg-[#800000] px-4 py-2 text-sm font-semibold text-white hover:bg-[#6a0000] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitMutation.isPending ? "Submitting..." : "Submit Enrollment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
