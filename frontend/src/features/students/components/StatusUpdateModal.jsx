import { LoaderCircle, X } from "lucide-react";
import { getCourseCode } from "../utils/studentsPageUtils";
import { hasPromoStatusContext } from "../utils/studentsPageUtils";
import { getOutcomeOptionsByCourse } from "../utils/statusUpdateConfig";

export default function StatusUpdateModal({ student, form, onChange, onClose, onSubmit, isPending }) {
  if (!student) return null;

  const modalViewportStyle = {
    left: "var(--app-sidebar-width, 0px)",
    width: "calc(100vw - var(--app-sidebar-width, 0px))",
  };

  const courseCode = getCourseCode(student);
  const supportsPromoSections = courseCode === "PROMO" || hasPromoStatusContext(student);
  const selectedPromoCategory = String(form.promoCategory || "TDC").toUpperCase();
  const outcomeCourseCode = supportsPromoSections && courseCode !== "PROMO" ? selectedPromoCategory : courseCode;
  const outcomeOptions = getOutcomeOptionsByCourse(outcomeCourseCode, selectedPromoCategory);
  const promoTdcOutcome = String(form.promoTdcOutcome || "").trim();
  const promoPdcOutcome = String(form.promoPdcOutcome || "").trim();

  const handlePromoCategoryChange = (category) => {
    onChange((current) => ({
      ...current,
      promoCategory: category,
      courseOutcome: category === "PDC" ? current.promoPdcOutcome || "" : current.promoTdcOutcome || "",
    }));
  };

  const handleOutcomeChange = (outcome) => {
    onChange((current) => {
      const next = {
        ...current,
        enrollmentStatus: "",
        courseOutcome: outcome,
      };
      if (courseCode === "PROMO" || supportsPromoSections) {
        if (selectedPromoCategory === "PDC") {
          next.promoPdcOutcome = outcome;
        } else {
          next.promoTdcOutcome = outcome;
        }
      }
      return next;
    });
  };

  const handleMarkCancelled = () => {
    onChange((current) => ({
      ...current,
      enrollmentStatus: "cancelled",
      courseOutcome: "CANCELLED",
    }));
  };

  return (
    <div style={modalViewportStyle} className="fixed inset-y-0 right-0 z-[120] flex items-start justify-center overflow-y-auto bg-black/50 p-4 sm:items-center">
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
            <label className="mb-1 block text-sm font-semibold text-[#800000]">Course Type</label>
            <p className="mb-3 rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">{courseCode}</p>

            {supportsPromoSections ? (
              <>
                <label className="mb-2 block text-sm font-semibold text-[#800000]">Promo Category</label>
                <div className="mb-3 grid grid-cols-2 gap-2" role="radiogroup" aria-label="Promo category options">
                  {["TDC", "PDC"].map((category) => {
                    const isActive = selectedPromoCategory === category;
                    return (
                      <button
                        key={category}
                        type="button"
                        role="radio"
                        aria-checked={isActive}
                        onClick={() => handlePromoCategoryChange(category)}
                        className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                          isActive
                            ? "border-[#800000] bg-[#800000] text-white"
                            : "border-slate-300 bg-white text-slate-700 hover:border-[#800000]/50"
                        }`}
                      >
                        {category}
                      </button>
                    );
                  })}
                </div>
              </>
            ) : null}

            <label className="mb-2 block text-sm font-semibold text-[#800000]">Result / Outcome</label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3" role="radiogroup" aria-label="Outcome options">
              {outcomeOptions.map((item) => {
                const isActive = (form.courseOutcome || "") === item;
                return (
                  <button
                    key={item}
                    type="button"
                    role="radio"
                    aria-checked={isActive}
                    onClick={() => handleOutcomeChange(item)}
                    className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                      isActive
                        ? "border-[#800000] bg-[#800000] text-white"
                        : "border-slate-300 bg-white text-slate-700 hover:border-[#800000]/50"
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
            {supportsPromoSections ? (
              <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
                <p className="font-semibold text-slate-800">Promo status preview</p>
                <p className="mt-1">TDC: {promoTdcOutcome || "-"}</p>
                <p>PDC: {promoPdcOutcome || "-"}</p>
              </div>
            ) : null}

            {String(form.enrollmentStatus || "").toLowerCase() === "cancelled" ? (
              <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                This enrollment will be marked as cancelled and linked schedules will be released.
              </p>
            ) : null}
          </div>
          <div className="flex justify-between gap-2">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleMarkCancelled}
                disabled={isPending}
                className="rounded-lg border border-rose-300 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Mark Cancelled
              </button>
            </div>
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
