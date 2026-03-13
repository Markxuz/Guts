import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarClock, CarFront, UserRound, X } from "lucide-react";
import { resourceServices } from "../../../services/resources";
import { formatDateToISO, formatReadableDate } from "../../../shared/utils/date";

const INITIAL_FORM = {
  course_id: "",
  instructor_id: "",
  vehicle_id: "",
  slot: "morning",
  remarks: "",
};

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
  availability = [],
  loadingAvailability,
  createScheduleMutation,
  onClose,
}) {
  const [form, setForm] = useState(INITIAL_FORM);

  const { data: resources, isLoading: loadingResources } = useQuery({
    queryKey: ["schedule-modal-resources"],
    queryFn: async () => {
      const [courses, instructors, vehicles] = await Promise.all([
        resourceServices.courses.list(),
        resourceServices.instructors.list(),
        resourceServices.vehicles.list(),
      ]);

      return { courses, instructors, vehicles };
    },
    staleTime: 5 * 60 * 1000,
    enabled: isOpen,
  });

  useEffect(() => {
    if (isOpen) {
      setForm((current) => ({
        ...INITIAL_FORM,
        slot: availability.find((item) => !item.full)?.slot || "morning",
        remarks: current.remarks,
      }));
    }
  }, [isOpen, selectedDate, availability]);

  const courseOptions = useMemo(
    () => (resources?.courses || []).map((item) => ({ value: String(item.id), label: item.course_name })),
    [resources]
  );
  const instructorOptions = useMemo(
    () => (resources?.instructors || []).map((item) => ({ value: String(item.id), label: item.name })),
    [resources]
  );
  const vehicleOptions = useMemo(
    () => (resources?.vehicles || []).map((item) => ({
      value: String(item.id),
      label: `${item.vehicle_name || item.plate_number} (${item.vehicle_type || "Vehicle"})`,
    })),
    [resources]
  );

  const selectedDateLabel = selectedDate ? formatReadableDate(selectedDate) : "Selected date";

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!selectedDate) return;

    createScheduleMutation.mutate({
      course_id: Number(form.course_id),
      instructor_id: Number(form.instructor_id),
      vehicle_id: Number(form.vehicle_id),
      schedule_date: formatDateToISO(selectedDate),
      slot: form.slot,
      remarks: form.remarks,
    }, {
      onSuccess: () => {
        setForm(INITIAL_FORM);
        onClose();
      },
    });
  }

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1f1111]/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-[28px] border border-[#d4af37]/30 bg-[linear-gradient(180deg,#fffdf7_0%,#f8f2e4_100%)] shadow-[0_32px_80px_rgba(40,8,8,0.45)]">
        <div className="flex items-start justify-between border-b border-[#e6d7b6] bg-[#800000] px-6 py-5 text-white">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#f0d78a]">Calendar Schedule</p>
            <h2 className="mt-2 text-2xl font-bold">Add Schedule</h2>
            <p className="mt-1 text-sm text-white/80">{selectedDateLabel}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full border border-white/20 p-2 text-white/80 transition hover:bg-white/10 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="grid gap-0 md:grid-cols-[1.1fr_0.9fr]">
          <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-1 md:col-span-2">
                <span className="text-[11px] font-bold tracking-wide text-[#6b5b4d]">Date</span>
                <input
                  value={selectedDate ? formatDateToISO(selectedDate) : ""}
                  readOnly
                  className="h-11 rounded-xl border border-[#d9c9a0] bg-slate-50 px-3 text-sm text-slate-800 outline-none"
                />
              </label>
              <ResourceField label="Course" name="course_id" value={form.course_id} onChange={updateField} options={courseOptions} disabled={loadingResources} />
              <ResourceField label="Instructor" name="instructor_id" value={form.instructor_id} onChange={updateField} options={instructorOptions} disabled={loadingResources} />
            </div>
            <ResourceField label="Vehicle" name="vehicle_id" value={form.vehicle_id} onChange={updateField} options={vehicleOptions} disabled={loadingResources} />

            <div>
              <p className="text-[11px] font-bold tracking-wide text-[#6b5b4d]">Session Slot</p>
              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                {availability.map((item) => (
                  <button
                    key={item.slot}
                    type="button"
                    disabled={item.full}
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
                      {item.full ? "Full" : `${item.available} slot${item.available === 1 ? "" : "s"} available`}
                    </p>
                  </button>
                ))}
              </div>
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

            {createScheduleMutation.isError ? (
              <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {createScheduleMutation.error.message}
              </p>
            ) : null}

            <div className="flex items-center justify-end gap-3 border-t border-[#e6d7b6] pt-4">
              <button type="button" onClick={onClose} className="rounded-xl border border-[#c7b28a] px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white">
                Cancel
              </button>
              <button
                type="submit"
                disabled={loadingResources || loadingAvailability || createScheduleMutation.isPending || availability.every((item) => item.full)}
                className="rounded-xl bg-[#800000] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#650000] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {createScheduleMutation.isPending ? "Saving..." : "Save Schedule"}
              </button>
            </div>
          </form>

          <aside className="border-l border-[#e6d7b6] bg-[#fff7ea] px-6 py-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#800000]">Availability</p>
            <div className="mt-4 space-y-3">
              {availability.map((item) => (
                <div key={item.slot} className={`rounded-2xl border px-4 py-4 ${item.full ? "border-red-200 bg-red-50" : "border-[#ecd9ac] bg-white"}`}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{item.slotLabel}</p>
                      <p className="mt-1 text-xs text-slate-500">Capacity {item.capacity} | Booked {item.booked}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${item.full ? "bg-red-100 text-red-700" : "bg-[#D4AF37]/20 text-[#800000]"}`}>
                      {item.full ? "Full" : "Available"}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-3 rounded-3xl bg-[#2d1512] px-5 py-5 text-[#f7ead0] shadow-inner">
              <div className="flex items-center gap-3 text-sm font-semibold">
                <CalendarClock size={16} className="text-[#D4AF37]" /> Fixed sessions: 08:00 AM - 12:00 PM and 01:00 PM - 05:00 PM
              </div>
              <div className="flex items-center gap-3 text-sm font-semibold">
                <UserRound size={16} className="text-[#D4AF37]" /> Instructor conflicts are blocked per slot
              </div>
              <div className="flex items-center gap-3 text-sm font-semibold">
                <CarFront size={16} className="text-[#D4AF37]" /> Vehicle conflicts are blocked per slot
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
