import { BadgeCheck, FileUser, GraduationCap, UserRound } from "lucide-react";
import { createElement } from "react";

function SummaryCard({ icon, label, value, accent }) {
  return (
    <article className="rounded-xl border border-slate-300 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
        <span className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${accent}`}>
          {createElement(icon, { size: 16 })}
        </span>
      </div>
      <p className="mt-3 text-2xl font-bold text-slate-900">{value}</p>
    </article>
  );
}

export default function SummaryCards({ summary }) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      <SummaryCard icon={UserRound} label="Total" value={summary.total} accent="bg-[#800000]/10 text-[#800000]" />
      <SummaryCard icon={GraduationCap} label="TDC" value={summary.tdc} accent="bg-[#D4AF37]/20 text-[#8d6f12]" />
      <SummaryCard icon={FileUser} label="PDC" value={summary.pdc} accent="bg-[#D4AF37]/20 text-[#8d6f12]" />
      <SummaryCard icon={BadgeCheck} label="Completed" value={summary.completed} accent="bg-emerald-100 text-emerald-700" />
    </div>
  );
}
