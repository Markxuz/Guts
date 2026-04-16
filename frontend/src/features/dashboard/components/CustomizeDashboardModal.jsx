import { X, RotateCcw } from "lucide-react";

export default function CustomizeDashboardModal({ isOpen, widgets, onToggleWidget, onResetDefaults, onClose }) {
  if (!isOpen) return null;

  const widgetLabels = {
    quickStats: "Quick Stats Dashboard",
    financialSummary: "Financial Summary",
    performanceMetrics: "Performance Metrics",
    vehicleOperations: "Vehicle Operations",
    instructorPerformance: "Instructor Performance",
    trendsForecasts: "Trends & Forecasts",
    advancedCharts: "Advanced Charts",
  };

  return (
    <div
      style={{ left: "var(--app-sidebar-width, 0px)", width: "calc(100vw - var(--app-sidebar-width, 0px))" }}
      className="fixed inset-y-0 right-0 z-50 flex items-center justify-center bg-black/40 p-4"
    >
      <div className="w-full max-w-md rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 p-4">
          <h2 className="text-lg font-bold text-slate-900">Customize Dashboard</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-300 bg-white p-1 text-slate-600 hover:bg-slate-50"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-2 p-4">
          {Object.entries(widgetLabels).map(([key, label]) => (
            <label key={key} className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-3 hover:bg-slate-50">
              <input
                type="checkbox"
                checked={widgets[key] !== false}
                onChange={() => onToggleWidget(key)}
                className="h-4 w-4 cursor-pointer rounded border-slate-300 text-[#800000]"
              />
              <span className="flex-1 text-sm font-medium text-slate-700">{label}</span>
            </label>
          ))}
        </div>

        <div className="border-t border-slate-200 p-4">
          <button
            type="button"
            onClick={onResetDefaults}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-100"
          >
            <RotateCcw size={14} />
            Reset to Defaults
          </button>
        </div>

        <div className="border-t border-slate-200 p-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
