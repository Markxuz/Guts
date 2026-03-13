import { ClipboardList, GraduationCap, TrendingUp, Users } from "lucide-react";

function StatCard({ title, value, icon, color }) {
  return (
    <div className="rounded-xl border-t-2 border-t-[#800000] border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <span className={`inline-flex h-9 w-9 items-center justify-center rounded-full ${color}`}>{icon}</span>
        <div>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          <p className="text-xs text-slate-500">{title}</p>
        </div>
      </div>
    </div>
  );
}

export default function StatsGrid({ stats, loading }) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-6">
      <StatCard
        title="Total Students"
        value={loading ? "..." : stats.totalStudents}
        icon={<Users size={15} className="text-[#D4AF37]" />}
        color="bg-[#D4AF37]/15"
      />
      <StatCard
        title="Currently Enrolled"
        value={loading ? "..." : stats.currentlyEnrolled}
        icon={<ClipboardList size={15} className="text-[#800000]" />}
        color="bg-[#800000]/10"
      />
      <StatCard
        title="Completed"
        value={loading ? "..." : stats.completed}
        icon={<GraduationCap size={15} className="text-[#D4AF37]" />}
        color="bg-[#D4AF37]/15"
      />
      <StatCard
        title="This Month"
        value={loading ? "..." : stats.thisMonth}
        icon={<TrendingUp size={15} className="text-[#800000]" />}
        color="bg-[#800000]/10"
      />
      <StatCard
        title="PDC-B"
        value={loading ? "..." : (stats.pdcBeginner ?? 0)}
        icon={<ClipboardList size={15} className="text-[#D4AF37]" />}
        color="bg-[#D4AF37]/15"
      />
      <StatCard
        title="PDC-E"
        value={loading ? "..." : (stats.pdcExperience ?? 0)}
        icon={<GraduationCap size={15} className="text-[#800000]" />}
        color="bg-[#800000]/10"
      />
    </div>
  );
}
