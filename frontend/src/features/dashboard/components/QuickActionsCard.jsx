import { ChartColumn, CheckCircle2, Users, Zap } from "lucide-react";

export default function QuickActionsCard({
  reportFilter,
  onPeriodPresetChange,
  onStartDateChange,
  onEndDateChange,
  onPrintReports,
  onNewEnrollment,
  onViewReports,
}) {
  return (
    <div className="rounded-xl border-t-2 border-t-[#D4AF37] border-slate-200 bg-white p-4 shadow-sm">
      <p className="mb-3 inline-flex items-center gap-2 text-sm font-bold text-slate-900">
        <Zap size={14} className="text-[#D4AF37]" /> Quick Actions
      </p>
      <div className="mb-3 space-y-2 rounded-lg border border-[#800000]/20 bg-[#800000]/5 p-2.5">
        <p className="text-[11px] font-bold uppercase tracking-wide text-[#800000]">Report Range</p>
        <select
          value={reportFilter.preset}
          onChange={(event) => onPeriodPresetChange(event.target.value)}
          className="h-9 w-full rounded-lg border border-[#D4AF37]/60 bg-[#800000] px-3 text-xs font-semibold text-[#D4AF37] outline-none transition hover:bg-[#600000]"
        >
          <option value="today">Today</option>
          <option value="thisWeek">This Week</option>
          <option value="thisMonth">This Month</option>
          <option value="custom">Custom Range</option>
        </select>

        {reportFilter.preset === "custom" ? (
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={reportFilter.startDate}
              onChange={(event) => onStartDateChange(event.target.value)}
              className="h-9 rounded-lg border border-[#D4AF37]/60 bg-[#800000] px-2 text-xs text-white outline-none transition hover:bg-[#600000]"
            />
            <input
              type="date"
              value={reportFilter.endDate}
              onChange={(event) => onEndDateChange(event.target.value)}
              className="h-9 rounded-lg border border-[#D4AF37]/60 bg-[#800000] px-2 text-xs text-white outline-none transition hover:bg-[#600000]"
            />
          </div>
        ) : null}
      </div>
      <div className="space-y-2">
        <button
          type="button"
          onClick={onPrintReports}
          className="flex w-full items-center gap-2 rounded-lg border border-[#D4AF37]/50 bg-[#D4AF37]/10 px-3 py-2 text-sm font-semibold text-[#800000]"
        >
          <CheckCircle2 size={14} className="text-[#D4AF37]" /> Print Reports
        </button>
        <button
          type="button"
          onClick={onNewEnrollment}
          className="flex w-full items-center gap-2 rounded-lg border border-[#800000]/30 bg-[#800000]/10 px-3 py-2 text-sm font-semibold text-[#800000]"
        >
          <Users size={14} className="text-[#D4AF37]" /> New Enrollment
        </button>
        <button
          type="button"
          onClick={onViewReports}
          className="flex w-full items-center gap-2 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700"
        >
          <ChartColumn size={14} className="text-[#D4AF37]" /> View Reports
        </button>
      </div>
    </div>
  );
}
