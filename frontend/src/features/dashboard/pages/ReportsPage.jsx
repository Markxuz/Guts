import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock3, Fuel, Printer, Wrench } from "lucide-react";
import MonthlyEnrollmentCard from "../components/MonthlyEnrollmentCard";
import StatsGrid from "../components/StatsGrid";
import TopControls from "../components/TopControls";
import { useReportOverview } from "../hooks/useReportOverview";

function currentMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: now.toISOString().slice(0, 10),
  };
}

export default function ReportsPage() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("overall");
  const [search, setSearch] = useState("");
  const [useCustomDateRange, setUseCustomDateRange] = useState(false);
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  
  const monthRange = useMemo(() => currentMonthRange(), []);
  
  // Determine effective date range
  const effectiveDateRange = useMemo(() => {
    if (useCustomDateRange && customStartDate && customEndDate) {
      return {
        startDate: customStartDate,
        endDate: customEndDate,
      };
    }
    return monthRange;
  }, [useCustomDateRange, customStartDate, customEndDate, monthRange]);
  
  const { data: summary, isLoading, isError, refetch } = useReportOverview({
    startDate: effectiveDateRange.startDate,
    endDate: effectiveDateRange.endDate,
    course: activeFilter,
  });

  const stats = summary?.stats || {
    totalStudents: 0,
    currentlyEnrolled: 0,
    completed: 0,
    thisMonth: 0,
    pdcBeginner: 0,
    pdcExperience: 0,
  };

  const yearlyTotal = useMemo(
    () =>
      (summary?.monthlyEnrollment || []).reduce(
        (acc, item) => acc + (item.tdc || 0) + (item.pdcBeginner || 0) + (item.pdcExperience || 0),
        0
      ),
    [summary?.monthlyEnrollment]
  );

  const filteredUsageRows = useMemo(() => {
    const text = search.trim().toLowerCase();
    const rows = summary?.usageByVehicle || [];
    if (!text) return rows;

    return rows.filter((item) =>
      [item.vehicleName, item.vehicleType, item.plateNumber]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(text))
    );
  }, [summary?.usageByVehicle, search]);

  const handlePrintSummary = () => {
    window.print();
  };

  return (
    <section className="space-y-4">
      <div className="print:hidden">
        <TopControls
          activeFilter={activeFilter}
          onChangeFilter={setActiveFilter}
          search={search}
          onSearchChange={setSearch}
          onEnroll={() => navigate("/enrollments")}
        />
      </div>

      {/* Date Range Filter for Vehicle Usage / Fuel Reports */}
      <div className="print:hidden rounded-xl border-t-2 border-t-[#D4AF37] border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-700 uppercase">Date Range:</label>
            <button
              type="button"
              onClick={() => {
                setUseCustomDateRange(false);
                setCustomStartDate("");
                setCustomEndDate("");
              }}
              className={`inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                !useCustomDateRange
                  ? "border-[#D4AF37] bg-[#D4AF37]/10 text-[#800000]"
                  : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Calendar size={14} />
              This Month
            </button>
            <button
              type="button"
              onClick={() => setUseCustomDateRange(!useCustomDateRange)}
              className={`inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                useCustomDateRange
                  ? "border-[#D4AF37] bg-[#D4AF37]/10 text-[#800000]"
                  : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Clock3 size={14} />
              Custom Range
            </button>
          </div>

          {useCustomDateRange && (
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-slate-600">Start:</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-slate-600">End:</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700"
                />
              </div>
            </div>
          )}

          <p className="text-xs text-slate-500">
            {effectiveDateRange.startDate} to {effectiveDateRange.endDate}
          </p>
        </div>
      </div>

          {isError ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
              <div className="w-full max-w-md rounded-xl border border-red-200 bg-white p-6 shadow-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-lg font-bold text-red-700">Failed to load reports</p>
                    <p className="mt-2 text-sm text-slate-600">There was a problem fetching the reports data. Please check your connection and try again.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { refetch(); }}
                    className="rounded-md bg-[#800000] px-3 py-1.5 text-xs font-semibold text-white"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>
          ) : null}

      <div className="print:hidden">
        <StatsGrid stats={stats} loading={isLoading} />
      </div>

      <div className="hidden print:block">
        <h1 className="text-xl font-bold text-slate-900">Operations Reports</h1>
        <p className="text-sm text-slate-600">
          Filter: {String(activeFilter || "overall").toUpperCase()} | Printed on {new Date().toLocaleString()}
        </p>
      </div>

      <div className="rounded-xl border-t-2 border-t-[#D4AF37] border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-bold text-slate-900">Operations Reports</p>
          <button
            type="button"
            onClick={handlePrintSummary}
            className="inline-flex items-center gap-2 rounded-md border border-[#800000]/20 bg-[#800000] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#670000] print:hidden"
          >
            <Printer size={13} />
            Print Summary
          </button>
        </div>
        <p className="mt-1 text-xs text-slate-500">Enrollment totals for the selected course filter.</p>
        <p className="mt-3 text-2xl font-bold text-[#800000]">{isLoading ? "..." : yearlyTotal}</p>
        <p className="text-xs text-slate-500">Total enrollments this year</p>
      </div>

      <MonthlyEnrollmentCard rows={summary?.monthlyEnrollment || []} activeFilter={activeFilter} />

      <div className="rounded-xl border-t-2 border-t-[#D4AF37] border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-sm font-bold text-slate-900">Vehicle Operations Summary (Monthly Performance)</p>
        <p className="mt-1 text-xs text-slate-500">
          {effectiveDateRange.startDate} to {effectiveDateRange.endDate}
        </p>

        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border border-[#800000]/20 bg-[#800000]/5 p-3">
            <p className="inline-flex items-center gap-2 text-xs font-semibold text-[#800000]">
              <Wrench size={13} /> Maintenance Cost
            </p>
            <p className="mt-1 text-xl font-bold text-slate-900">PHP {(summary?.maintenanceSummary?.totalCost || 0).toFixed(2)}</p>
            <p className="mt-1 text-xs text-slate-500">Records: {summary?.maintenanceSummary?.totalRecords || 0}</p>
          </div>

          <div className="rounded-lg border border-[#D4AF37]/40 bg-[#D4AF37]/10 p-3">
            <p className="inline-flex items-center gap-2 text-xs font-semibold text-[#7A5B00]">
              <Fuel size={13} /> Fuel Expense
            </p>
            <p className="mt-1 text-xl font-bold text-slate-900">PHP {(summary?.fuelSummary?.totalExpense || 0).toFixed(2)}</p>
            <p className="mt-1 text-xs text-slate-500">Liters: {(summary?.fuelSummary?.totalLiters || 0).toFixed(2)}</p>
          </div>

          <div className="rounded-lg border border-slate-300 bg-slate-50 p-3">
            <p className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700">
              <Clock3 size={13} /> PDC Vehicle Usage
            </p>
            <p className="mt-1 text-xl font-bold text-slate-900">{summary?.usageByVehicle?.length || 0}</p>
            <p className="mt-1 text-xs text-slate-500">Vehicles with completed sessions</p>
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left">
              <tr>
                <th className="px-3 py-2 font-semibold text-slate-700">Vehicle</th>
                <th className="px-3 py-2 font-semibold text-slate-700">Type</th>
                <th className="px-3 py-2 font-semibold text-slate-700">Completed Sessions</th>
                <th className="px-3 py-2 font-semibold text-slate-700">Training Hours</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredUsageRows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-3 py-4 text-center text-xs text-slate-500">
                    No vehicle usage records found for this period.
                  </td>
                </tr>
              ) : (
                filteredUsageRows.map((item) => (
                  <tr key={item.vehicleId}>
                    <td className="px-3 py-2 text-slate-800">{item.vehicleName} ({item.plateNumber || "No Plate"})</td>
                    <td className="px-3 py-2 text-slate-700">{item.vehicleType}</td>
                    <td className="px-3 py-2 text-slate-700">{item.completedSessions}</td>
                    <td className="px-3 py-2 font-semibold text-[#800000]">{item.totalTrainingHours}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
