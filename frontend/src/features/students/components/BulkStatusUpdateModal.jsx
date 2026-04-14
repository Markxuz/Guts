import { LoaderCircle, X } from "lucide-react";
import { PDC_OUTCOME_OPTIONS, TDC_OUTCOME_OPTIONS } from "../utils/statusUpdateConfig";

function OutcomeGroup({ title, options, value, onPick }) {
  return (
    <div className="mb-4">
      <label className="mb-2 block text-sm font-semibold text-[#800000]">{title}</label>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3" role="radiogroup" aria-label={`${title} options`}>
        {options.map((item) => {
          const isActive = value === item;
          return (
            <button
              key={item}
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={() => onPick(item)}
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
    </div>
  );
}

export default function BulkStatusUpdateModal({
  isOpen,
  selectedCount,
  selectionMeta,
  form,
  onChange,
  onClose,
  onSubmit,
  isPending,
}) {
  if (!isOpen) return null;

  const modalViewportStyle = {
    left: "var(--app-sidebar-width, 0px)",
    width: "calc(100vw - var(--app-sidebar-width, 0px))",
  };

  return (
    <div style={modalViewportStyle} className="fixed inset-y-0 right-0 z-[120] flex items-start justify-center overflow-y-auto bg-black/50 p-4 sm:items-center">
      <div className="my-4 w-full max-w-lg rounded-2xl bg-white shadow-2xl sm:my-0">
        <div className="flex items-center justify-between rounded-t-2xl bg-[#800000] px-5 py-4 text-white">
          <div>
            <h3 className="text-lg font-semibold">Bulk Update Status</h3>
            <p className="text-xs text-white/80">Apply outcomes to {selectedCount} selected student{selectedCount === 1 ? "" : "s"}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-white/70 hover:bg-white/10">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="px-5 py-4">
          <div className="mb-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
            <p>Selected counts:</p>
            <p>TDC: {selectionMeta?.tdc || 0}</p>
            <p>PDC: {selectionMeta?.pdc || 0}</p>
            <p>PROMO: {selectionMeta?.promo || 0}</p>
          </div>

          {selectionMeta?.tdc > 0 ? (
            <OutcomeGroup
              title="TDC Outcome"
              options={TDC_OUTCOME_OPTIONS}
              value={form.tdcOutcome || ""}
              onPick={(value) => onChange((current) => ({ ...current, tdcOutcome: value }))}
            />
          ) : null}

          {selectionMeta?.pdc > 0 ? (
            <OutcomeGroup
              title="PDC Outcome"
              options={PDC_OUTCOME_OPTIONS}
              value={form.pdcOutcome || ""}
              onPick={(value) => onChange((current) => ({ ...current, pdcOutcome: value }))}
            />
          ) : null}

          {selectionMeta?.promo > 0 ? (
            <>
              <OutcomeGroup
                title="Promo - TDC Outcome"
                options={TDC_OUTCOME_OPTIONS}
                value={form.promoTdcOutcome || ""}
                onPick={(value) => onChange((current) => ({ ...current, promoTdcOutcome: value }))}
              />
              <OutcomeGroup
                title="Promo - PDC Outcome"
                options={PDC_OUTCOME_OPTIONS}
                value={form.promoPdcOutcome || ""}
                onPick={(value) => onChange((current) => ({ ...current, promoPdcOutcome: value }))}
              />
            </>
          ) : null}

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
              {isPending ? "Updating..." : "Update Selected"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
