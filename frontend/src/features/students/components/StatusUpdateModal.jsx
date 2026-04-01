import { LoaderCircle, X } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Active" },
  { value: "completed", label: "Completed" },
];

export default function StatusUpdateModal({ student, form, onChange, onClose, onSubmit, isPending }) {
  if (!student) return null;

  const handleStatusChange = (field, value) => {
    onChange((current) => ({
      ...current,
      [field]: value,
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 sm:items-center">
      <div className="my-4 w-full max-w-md rounded-2xl bg-white shadow-2xl sm:my-0">
        <div className="flex items-center justify-between rounded-t-2xl bg-[#800000] px-5 py-4 text-white">
          <div>
            <h3 className="text-lg font-semibold">Update Status</h3>
            <p className="text-xs text-white/80">Update enrollment status</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-white/70 hover:bg-white/10">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="px-5 py-4">
          <div className="mb-4">
            <label className="mb-2 block text-sm font-semibold text-[#800000]">Enrollment Status</label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3" role="radiogroup" aria-label="Enrollment status options">
              {STATUS_OPTIONS.map((item) => {
                const isActive = (form.enrollmentStatus || "") === item.value;
                return (
                  <button
                    key={item.value}
                    type="button"
                    role="radio"
                    aria-checked={isActive}
                    onClick={() => handleStatusChange("enrollmentStatus", item.value)}
                    className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                      isActive
                        ? "border-[#800000] bg-[#800000] text-white"
                        : "border-slate-300 bg-white text-slate-700 hover:border-[#800000]/50"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-[#800000] px-4 py-2 text-sm font-semibold text-white hover:bg-[#690000] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isPending ? <LoaderCircle size={16} className="animate-spin" /> : null}
              {isPending ? "Updating..." : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
