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
  // Get filter from stats or props (for backward compatibility)
  const filter = stats?.activeFilter || stats?.courseFilter || stats?.filter || 'overall';

  // Always show these cards
  const baseCards = [
    {
      key: 'total',
      title: 'Total Students',
      value: loading ? '...' : stats.totalStudents,
      icon: <Users size={15} className="text-[#D4AF37]" />,
      color: 'bg-[#D4AF37]/15',
    },
    {
      key: 'enrolled',
      title: 'Currently Enrolled',
      value: loading ? '...' : stats.currentlyEnrolled,
      icon: <ClipboardList size={15} className="text-[#800000]" />,
      color: 'bg-[#800000]/10',
    },
    {
      key: 'completed',
      title: 'Completed',
      value: loading ? '...' : stats.completed,
      icon: <GraduationCap size={15} className="text-[#D4AF37]" />,
      color: 'bg-[#D4AF37]/15',
    },
    {
      key: 'month',
      title: 'This Month',
      value: loading ? '...' : stats.thisMonth,
      icon: <TrendingUp size={15} className="text-[#800000]" />,
      color: 'bg-[#800000]/10',
    },
  ];

  let cards = [...baseCards];
  if (filter === 'overall') {
    // Show all cards, TDC between 'This Month' and 'PDC-B'
    cards.splice(4, 0, {
      key: 'tdc',
      title: 'TDC',
      value: loading ? '...' : (stats.tdc ?? 0),
      icon: <GraduationCap size={15} className="text-[#D4AF37]" />,
      color: 'bg-[#D4AF37]/15',
    });
    cards.push({
      key: 'pdc_b',
      title: 'PDC-B',
      value: loading ? '...' : (stats.pdcBeginner ?? 0),
      icon: <ClipboardList size={15} className="text-[#D4AF37]" />,
      color: 'bg-[#D4AF37]/15',
    });
    cards.push({
      key: 'pdc_e',
      title: 'PDC-E',
      value: loading ? '...' : (stats.pdcExperience ?? 0),
      icon: <GraduationCap size={15} className="text-[#800000]" />,
      color: 'bg-[#800000]/10',
    });
  } else if (filter === 'tdc') {
    // Only show TDC card after 'This Month'
    cards.splice(4, 0, {
      key: 'tdc',
      title: 'TDC',
      value: loading ? '...' : (stats.tdc ?? 0),
      icon: <GraduationCap size={15} className="text-[#D4AF37]" />,
      color: 'bg-[#D4AF37]/15',
    });
  } else if (filter === 'pdc') {
    // Only show PDC-B and PDC-E after 'This Month'
    cards.push({
      key: 'pdc_b',
      title: 'PDC-B',
      value: loading ? '...' : (stats.pdcBeginner ?? 0),
      icon: <ClipboardList size={15} className="text-[#D4AF37]" />,
      color: 'bg-[#D4AF37]/15',
    });
    cards.push({
      key: 'pdc_e',
      title: 'PDC-E',
      value: loading ? '...' : (stats.pdcExperience ?? 0),
      icon: <GraduationCap size={15} className="text-[#800000]" />,
      color: 'bg-[#800000]/10',
    });
  }

  const xlGridClassByCount = {
    4: "xl:grid-cols-4",
    5: "xl:grid-cols-5",
    6: "xl:grid-cols-6",
    7: "xl:grid-cols-7",
  };
  const xlGridClass = xlGridClassByCount[cards.length] || "xl:grid-cols-4";

  return (
    <div className={`grid gap-3 md:grid-cols-3 ${xlGridClass}`}>
      {cards.map(card => (
        <StatCard key={card.key} title={card.title} value={card.value} icon={card.icon} color={card.color} />
      ))}
    </div>
  );
}