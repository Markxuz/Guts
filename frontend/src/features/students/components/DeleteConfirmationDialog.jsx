import { AlertTriangle, LoaderCircle } from "lucide-react";

export default function DeleteConfirmationDialog({ student, onCancel, onConfirm, isPending }) {
  if (!student) return null;

  const modalViewportStyle = {
    left: "var(--app-sidebar-width, 0px)",
    width: "calc(100vw - var(--app-sidebar-width, 0px))",
  };

  return (
    <div style={modalViewportStyle} className="fixed inset-y-0 right-0 z-[120] flex items-center justify-center bg-black/45 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="rounded-t-2xl bg-[#800000] px-5 py-4 text-white">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-[#D4AF37]" />
            <h3 className="text-lg font-semibold">Delete Student</h3>
          </div>
        </div>

        <div className="px-5 py-4">
          <p className="text-sm text-slate-700">
            Are you sure you want to delete this student? This action cannot be undone.
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-900">
            {[student.first_name, student.middle_name, student.last_name].filter(Boolean).join(" ")}
          </p>
          <p className="text-xs text-slate-500">ID #{student.id}</p>

          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-[#800000] px-4 py-2 text-sm font-semibold text-white hover:bg-[#690000] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isPending ? <LoaderCircle size={16} className="animate-spin" /> : null}
              {isPending ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
