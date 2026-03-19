const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function toReadableDate(dateInput) {
  const date = new Date(dateInput);
  if (Number.isNaN(date.valueOf())) return "-";
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function toPeriodLabel(startDate, endDate) {
  if (!startDate || !endDate) return "-";

  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();

  if (sameMonth) {
    return `${start.toLocaleDateString("en-US", { month: "long" })} ${start.getDate()} - ${end.getDate()}, ${end.getFullYear()}`;
  }

  return `${toReadableDate(startDate)} - ${toReadableDate(endDate)}`;
}

function buildCalendarCells(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  return [...Array(firstDay).fill(null), ...Array.from({ length: totalDays }, (_, index) => index + 1)];
}

function PrintCalendarOverview({ reportRange, activityDates = [] }) {
  const end = new Date(`${reportRange.endDate}T00:00:00`);
  const viewYear = Number.isNaN(end.valueOf()) ? new Date().getFullYear() : end.getFullYear();
  const viewMonth = Number.isNaN(end.valueOf()) ? new Date().getMonth() : end.getMonth();
  const cells = buildCalendarCells(viewYear, viewMonth);

  const activeSet = new Set(
    activityDates.map((value) => {
      const date = new Date(value);
      if (Number.isNaN(date.valueOf())) return "";
      return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    })
  );

  return (
    <div className="break-inside-avoid rounded-lg border border-[#800000]/30 bg-white p-3">
      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[#800000]">Calendar Overview</p>
      <div className="grid grid-cols-7 gap-1 text-center text-[9pt]">
        {WEEK_DAYS.map((day) => (
          <span key={day} className="font-semibold text-slate-600">{day}</span>
        ))}
        {cells.map((day, index) => {
          if (!day) {
            return <span key={`blank-${index}`} className="h-6 rounded" />;
          }

          const key = `${viewYear}-${viewMonth}-${day}`;
          const isActive = activeSet.has(key);

          return (
            <span
              key={`${viewMonth}-${day}`}
              className={`flex h-6 items-center justify-center rounded ${
                isActive ? "bg-[#D4AF37]/40 font-semibold text-[#800000]" : "text-slate-700"
              }`}
            >
              {day}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function PrintMonthlyChart({ rows }) {
  const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const max = Math.max(1, ...rows.flatMap((row) => [row.tdc || 0, row.pdcBeginner || 0, row.pdcExperience || 0]));

  return (
    <div className="break-inside-avoid min-w-0 overflow-hidden rounded-lg border border-[#800000]/30 bg-white p-3">
      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[#800000]">Monthly Enrollment Chart</p>
      <div className="print-chart-boundary h-40 min-w-0 rounded border border-slate-200 px-2 py-1">
        <div className="flex h-full min-w-0 items-end justify-between gap-2 overflow-hidden">
          {rows.map((row) => (
            <div key={row.month} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1">
              <div className="flex items-end gap-1">
                <span className="w-1.5 rounded-sm bg-cyan-500" style={{ height: `${((row.tdc || 0) / max) * 70 + 2}px` }} />
                <span className="w-1.5 rounded-sm bg-red-500" style={{ height: `${((row.pdcBeginner || 0) / max) * 70 + 2}px` }} />
                <span className="w-1.5 rounded-sm bg-blue-500" style={{ height: `${((row.pdcExperience || 0) / max) * 70 + 2}px` }} />
              </div>
              <span className="text-[8pt] text-slate-600">{monthLabels[row.month]}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-2 flex items-center gap-3 text-[8pt] text-slate-500">
        <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-cyan-500" />TDC</span>
        <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-red-500" />PDC-Beginner</span>
        <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-blue-500" />PDC-Experience</span>
      </div>
    </div>
  );
}

function SummaryCard({ label, value }) {
  return (
    <div className="break-inside-avoid rounded-lg border border-[#800000]/30 bg-[#800000]/5 p-2.5">
      <p className="text-[8pt] uppercase tracking-wide text-slate-600">{label}</p>
      <p className="text-lg font-bold text-slate-900">{value}</p>
    </div>
  );
}

export default function PrintReport({
  reportRange,
  stats,
  monthlyEnrollment,
  dailyTransactions,
  recentActivities,
  maintenanceSummary,
  fuelSummary,
  generatedBy,
  printedAt,
  className = "",
}) {
  const reportDate = printedAt || new Date();
  const reportDateLabel = toReadableDate(reportDate);
  const periodLabel = toPeriodLabel(reportRange.startDate, reportRange.endDate);

  return (
    <section className={`print-report-root ${className}`.trim()}>
      <div className="mx-auto w-[210mm] min-h-[297mm] bg-white px-4 py-3 text-[10pt] print:text-[10pt] text-slate-900 [-webkit-print-color-adjust:exact] [print-color-adjust:exact]">
        <header className="mb-3 border-y border-[#D4AF37] py-2">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src="/Guts%20Icon.png" alt="Guardians Technical School" className="h-12 w-12 object-contain" />
              <div>
                <p className="text-xl font-bold leading-tight text-slate-900">Guardians Technical School</p>
                <p className="text-[10pt] font-semibold uppercase tracking-wide text-[#800000]">Administration Reports</p>
              </div>
            </div>
            <div className="text-right text-[9pt] text-slate-700">
              <p><span className="font-semibold">Report Date:</span> {reportDateLabel}</p>
              <p><span className="font-semibold">Report Period:</span> {periodLabel}</p>
              <p><span className="font-semibold">Generated By:</span> {generatedBy}</p>
            </div>
          </div>
        </header>

        <section className="mb-3 break-inside-avoid">
          <p className="mb-1.5 text-sm font-bold uppercase tracking-wide text-[#800000]">Monthly Performance Summary</p>
          <div className="grid grid-cols-6 gap-3">
            <SummaryCard label="Total Students" value={stats.totalStudents} />
            <SummaryCard label="Currently Enrolled" value={stats.currentlyEnrolled} />
            <SummaryCard label="Completed" value={stats.completed} />
            <SummaryCard label="This Month Enrollments" value={stats.thisMonth} />
            <SummaryCard label="PDC-B" value={stats.pdcBeginner || 0} />
            <SummaryCard label="PDC-E" value={stats.pdcExperience || 0} />
          </div>
        </section>

        <section className="mb-3 break-inside-avoid">
          <p className="mb-1.5 text-sm font-bold uppercase tracking-wide text-[#800000]">Vehicle Operations Cost Summary</p>
          <div className="grid grid-cols-4 gap-3">
            <SummaryCard label="Maintenance Records" value={maintenanceSummary?.totalRecords || 0} />
            <SummaryCard label="Maintenance Cost" value={`PHP ${Number(maintenanceSummary?.totalCost || 0).toFixed(2)}`} />
            <SummaryCard label="Fuel Entries" value={fuelSummary?.totalEntries || 0} />
            <SummaryCard label="Fuel Expense" value={`PHP ${Number(fuelSummary?.totalExpense || 0).toFixed(2)}`} />
          </div>
        </section>

        <section className="mb-3 grid grid-cols-1 gap-3 print:grid print:grid-cols-2 print:gap-6">
          <PrintCalendarOverview reportRange={reportRange} activityDates={dailyTransactions.map((row) => row.createdAt)} />
          <PrintMonthlyChart rows={monthlyEnrollment} />
        </section>

        <section className="print-daily-enrollment-section mb-3 break-inside-avoid rounded-lg border border-[#800000]/30 bg-white p-3">
          <div className="mb-1 flex items-center justify-between">
            <p className="text-sm font-bold uppercase tracking-wide text-[#800000]">Daily Enrollment and Schedule Report</p>
            <span className="rounded-full bg-[#D4AF37]/20 px-2 py-0.5 text-[8pt] font-semibold text-[#800000]">{dailyTransactions.length} entries</span>
          </div>
          {dailyTransactions.length === 0 ? (
            <p className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-[9pt] text-slate-600">No enrollment or schedule records found for this period.</p>
          ) : (
            <div className="overflow-hidden rounded-md border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-[9pt]">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="px-2 py-1.5 text-left">Time</th>
                    <th className="px-2 py-1.5 text-left">Student</th>
                    <th className="px-2 py-1.5 text-left">Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {dailyTransactions.map((row) => (
                    <tr key={row.id} className="break-inside-avoid">
                      <td className="px-2 py-1.5">{row.time}</td>
                      <td className="px-2 py-1.5">{row.studentName}</td>
                      <td className="px-2 py-1.5">{row.transactionType}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="print-recent-activities-section mb-6 break-inside-avoid rounded-lg border border-[#800000]/30 bg-white p-3">
          <p className="mb-2 text-sm font-bold uppercase tracking-wide text-[#800000]">Recent System Activities Log</p>
          <div className="space-y-1.5">
            {recentActivities.length === 0 ? (
              <p className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-[9pt] text-slate-600">No activity logs recorded for this period.</p>
            ) : (
              recentActivities.map((row) => (
                <div key={row.id} className="break-inside-avoid flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-[9pt]">
                  <p>
                    <span className="font-semibold">{row.userName}</span> {row.action}
                  </p>
                  <span className="text-slate-500">[Time: {row.time}]</span>
                </div>
              ))
            )}
          </div>
        </section>

        <footer className="print-footer fixed bottom-0 left-0 right-0 border-t border-[#D4AF37] bg-white/95 px-4 py-1.5 text-[8.5pt] text-slate-700">
          <div className="mx-auto flex w-[210mm] items-center justify-between">
            <span>Confidential - For Internal Use Only - Contact Admin for inquiries</span>
            <span className="print-page-number" />
          </div>
        </footer>
      </div>
    </section>
  );
}
