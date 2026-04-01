import { BadgeCheck, FileUser, GraduationCap, UserRound } from "lucide-react";
import { createElement } from "react";

function SummaryCard({ icon, label, value, accent }) {
  return (
    <article className="rounded-xl border-t-2 border-t-[#800000] border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <span className={`inline-flex h-9 w-9 items-center justify-center rounded-full ${accent}`}>
          {createElement(icon, { size: 15 })}
        </span>
        <div>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          <p className="text-xs text-slate-500">{label}</p>
        </div>
      </div>
    </article>
  );
}

export default function SummaryCards({ summary, courseFilter }) {
  // Always show these cards
  const baseCards = [
    { key: 'total', icon: UserRound, label: 'Total Students', value: summary.total, accent: 'bg-[#D4AF37]/15 text-[#D4AF37]' },
    { key: 'enrolled', icon: FileUser, label: 'Currently Enrolled', value: summary.currentlyEnrolled ?? 0, accent: 'bg-[#800000]/10 text-[#800000]' },
    { key: 'completed', icon: BadgeCheck, label: 'Completed', value: summary.completed, accent: 'bg-[#D4AF37]/15 text-[#D4AF37]' },
    { key: 'month', icon: GraduationCap, label: 'This Month', value: summary.thisMonth, accent: 'bg-[#800000]/10 text-[#800000]' },
  ];

  // Insert TDC and/or PDC cards in the correct order
  let cards = [...baseCards];
  if (courseFilter === 'all') {
    // Show all cards, TDC between 'This Month' and 'PDC-B'
    cards.splice(4, 0, { key: 'tdc', icon: GraduationCap, label: 'TDC', value: summary.tdc, accent: 'bg-[#D4AF37]/15 text-[#D4AF37]' });
    cards.push({ key: 'pdc_b', icon: FileUser, label: 'PDC-B', value: summary.pdc_b, accent: 'bg-[#D4AF37]/15 text-[#D4AF37]' });
    cards.push({ key: 'pdc_e', icon: FileUser, label: 'PDC-E', value: summary.pdc_e, accent: 'bg-[#800000]/10 text-[#800000]' });
  } else if (courseFilter === 'TDC') {
    // Only show TDC card after 'This Month'
    cards.splice(4, 0, { key: 'tdc', icon: GraduationCap, label: 'TDC', value: summary.tdc, accent: 'bg-[#D4AF37]/15 text-[#D4AF37]' });
  } else if (courseFilter === 'PDC') {
    // Only show PDC-B and PDC-E after 'This Month'
    cards.push({ key: 'pdc_b', icon: FileUser, label: 'PDC-B', value: summary.pdc_b, accent: 'bg-[#D4AF37]/15 text-[#D4AF37]' });
    cards.push({ key: 'pdc_e', icon: FileUser, label: 'PDC-E', value: summary.pdc_e, accent: 'bg-[#800000]/10 text-[#800000]' });
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
        <SummaryCard key={card.key} icon={card.icon} label={card.label} value={card.value} accent={card.accent} />
      ))}
    </div>
  );
}
