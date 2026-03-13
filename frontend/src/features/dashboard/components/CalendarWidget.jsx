import { CalendarDays } from "lucide-react";
import { isSameDay, parseDateValue } from "../../../shared/utils/date";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function buildCalendar(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  return [...Array(firstDay).fill(null), ...Array.from({ length: totalDays }, (_, i) => i + 1)];
}

export default function CalendarWidget({
  view,
  onPrevMonth,
  onNextMonth,
  reportFilter,
  onSelectDate,
  onOpenSchedule,
  activityDates,
  monthStatus = [],
}) {
  const cells = buildCalendar(view.year, view.month);
  const monthStatusMap = new Map(monthStatus.map((item) => [item.date, item]));
  const selectedDate = reportFilter.mode === "day" && reportFilter.date ? parseDateValue(reportFilter.date) : null;
  const rangeStart = reportFilter.startDate ? parseDateValue(reportFilter.startDate) : null;
  const rangeEnd = reportFilter.endDate ? parseDateValue(reportFilter.endDate) : null;

  function isInActiveRange(date) {
    if (reportFilter.mode !== "range" || !rangeStart || !rangeEnd) return false;
    return date >= rangeStart && date <= rangeEnd;
  }

  return (
    <div className="rounded-xl border-t-2 border-t-[#D4AF37] border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <p className="inline-flex items-center gap-2 text-sm font-bold text-slate-900">
          <CalendarDays size={15} className="text-[#D4AF37]" /> Calendar
        </p>
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <button type="button" onClick={onPrevMonth} className="rounded-md border border-slate-300 px-2">
            &lt;
          </button>
          <span>{MONTHS[view.month]} {view.year}</span>
          <button type="button" onClick={onNextMonth} className="rounded-md border border-slate-300 px-2">
            &gt;
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-500">
        {DAYS.map((day) => (
          <span key={day}>{day}</span>
        ))}
        {cells.map((day, index) => {
          if (!day) {
            return <span key={`blank-${index}`} className="h-9" />;
          }

          const current = new Date(view.year, view.month, day);
          const hasActivity = activityDates.some((date) => isSameDay(date, current));
          const isSelected = selectedDate ? isSameDay(current, selectedDate) : false;
          const isInRange = isInActiveRange(current);
          const isoDate = `${view.year}-${String(view.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const dayStatus = monthStatusMap.get(isoDate);
          const isFull = Boolean(dayStatus?.dayFull);

          return (
            <button
              key={`${view.month}-${day}`}
              type="button"
              onClick={() => onSelectDate(current)}
              onDoubleClick={() => {
                onSelectDate(current);
                onOpenSchedule(current);
              }}
              className={`relative h-9 rounded-md text-sm font-semibold ${
                isSelected
                  ? "bg-[#800000] text-white"
                  : isInRange
                    ? "cursor-pointer bg-[#D4AF37]/20 text-[#800000] hover:bg-[#D4AF37]/30"
                  : isFull
                    ? "cursor-pointer border border-red-300 bg-red-50 text-red-700 hover:bg-red-100"
                    : "cursor-pointer text-slate-700 hover:bg-slate-100"
              }`}
            >
              {day}
              {isFull ? (
                <span className="absolute right-0.5 top-0.5 rounded-full bg-red-600 px-1 py-0.5 text-[8px] font-bold uppercase tracking-[0.16em] text-white">
                  Full
                </span>
              ) : null}
              {hasActivity ? (
                <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-amber-500" />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
