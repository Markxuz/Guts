import { LoaderCircle, X } from "lucide-react";

export default function StatusUpdateModal({ student, form, onChange, onClose, onSubmit, isPending }) {
  if (!student) return null;

  const handleStatusChange = (field, value) => {
    onChange((current) => ({
      ...current,
      [field]: value,
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
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
            <select
              value={form.enrollmentStatus || ""}
              onChange={(event) => handleStatusChange("enrollmentStatus", event.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#800000] focus:ring-2 focus:ring-[#800000]/15"
            >
              <option value="">Select Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Active</option>
              <option value="completed">Completed</option>
            </select>
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
