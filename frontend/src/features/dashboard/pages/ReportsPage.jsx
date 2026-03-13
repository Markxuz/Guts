import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Printer } from "lucide-react";
import MonthlyEnrollmentCard from "../components/MonthlyEnrollmentCard";
import StatsGrid from "../components/StatsGrid";
import TopControls from "../components/TopControls";
import { useDashboardSummary } from "../hooks/useDashboardSummary";

export default function ReportsPage() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("overall");
  const [search, setSearch] = useState("");
  const { data: summary, isLoading, isError } = useDashboardSummary(activeFilter);

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

      {isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          Failed to load reports data.
        </div>
      ) : null}

      <div className="print:hidden">
        <StatsGrid stats={stats} loading={isLoading} />
      </div>

      <div className="hidden print:block">
        <h1 className="text-xl font-bold text-slate-900">Reports Summary</h1>
        <p className="text-sm text-slate-600">
          Filter: {String(activeFilter || "overall").toUpperCase()} | Printed on {new Date().toLocaleString()}
        </p>
      </div>

      <div className="rounded-xl border-t-2 border-t-[#D4AF37] border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-bold text-slate-900">Reports Summary</p>
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
    </section>
  );
}
