import { ChartColumn } from "lucide-react";

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function toHeightClass(value, max) {
  if (max <= 0 || value <= 0) return "h-1";
  const ratio = value / max;
  if (ratio < 0.15) return "h-3";
  if (ratio < 0.3) return "h-5";
  if (ratio < 0.45) return "h-8";
  if (ratio < 0.6) return "h-11";
  if (ratio < 0.75) return "h-14";
  if (ratio < 0.9) return "h-16";
  return "h-20";
}

function MonthlyBarChart({ rows }) {
  const max = Math.max(4, ...rows.flatMap((item) => [item.tdc || 0, item.pdcBeginner || 0, item.pdcExperience || 0]));

  return (
    <div className="space-y-2">
      <div className="h-40 rounded-lg border border-slate-200 p-3">
        <div className="flex h-full items-end justify-between gap-2">
          {rows.map((item) => (
            <div key={item.month} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
              <div className="flex items-end gap-1">
                <div className={`w-1.5 rounded-sm bg-blue-500 ${toHeightClass(item.tdc || 0, max)}`} />
                <div className={`w-1.5 rounded-sm bg-red-400 ${toHeightClass(item.pdcBeginner || 0, max)}`} />
                <div className={`w-1.5 rounded-sm bg-emerald-500 ${toHeightClass(item.pdcExperience || 0, max)}`} />
              </div>
              <span className="text-[10px] text-slate-500">{MONTH_LABELS[item.month]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 text-[11px] text-slate-500">
        <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-blue-500" />TDC</span>
        <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-red-400" />PDC-B</span>
        <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-emerald-500" />PDC-E</span>
      </div>
    </div>
  );
}

export default function MonthlyEnrollmentCard({ rows, activeFilter = "overall" }) {
  const subtitle =
    activeFilter === "overall"
      ? "Students enrolled per month by course type"
      : `Students enrolled per month (${activeFilter.toUpperCase()})`;

  return (
    <div className="min-w-0 overflow-hidden rounded-xl border-t-2 border-t-[#D4AF37] border-slate-200 bg-white p-4 shadow-sm">
      <p className="inline-flex items-center gap-2 text-sm font-bold text-slate-900">
        <ChartColumn size={14} className="text-[#D4AF37]" /> Monthly Enrollment
      </p>
      <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
      <div className="mt-3 overflow-hidden">
        <MonthlyBarChart rows={rows} />
      </div>
    </div>
  );
}
