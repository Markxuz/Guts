import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  Users,
  CheckCircle2,
  TrendingUp,
  Fuel,
  Wrench,
  Users2,
  Calendar,
  Download,
  RefreshCw,
  Settings,
  Share2,
} from "lucide-react";
import { useReportOverview } from "../hooks/useReportOverview";
import { useWidgetVisibility } from "../hooks/useWidgetVisibility";
import MonthlyEnrollmentCard from "../components/MonthlyEnrollmentCard";
import CustomizeDashboardModal from "../components/CustomizeDashboardModal";
import ExportAndEmailModal from "../components/ExportAndEmailModal";
import TopControls from "../components/TopControls";
import PrintReport from "../components/PrintReport";
import {
  EnrollmentTrendChart,
  EnrollmentAreaChart,
  EnrollmentDistributionChart,
  PerformanceMetricsChart,
  VehicleUsageChart,
  CompletionGaugeChart,
  ComboEnrollmentChart,
} from "../components/AdvancedCharts";
import { downloadOverviewReportPdf } from "../utils/overviewReportPdf";

function currentMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: now.toISOString().slice(0, 10),
  };
}

function KPICard({ label, value, unit = "", icon: Icon, bgColor = "bg-blue-50", borderColor = "border-blue-200", textColor = "text-blue-700" }) {
  return (
    <div className={`rounded-lg border ${borderColor} ${bgColor} p-4 shadow-sm card-light`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className={`text-xs font-semibold uppercase tracking-wide ${textColor}`}>{label}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {value?.toLocaleString?.() ?? value ?? "-"}
            {unit && <span className="ml-1 text-sm font-normal text-slate-600">{unit}</span>}
          </p>
        </div>
        {Icon && (
          <div className={`rounded-lg ${bgColor} p-2.5`}>
            <Icon size={20} className={textColor} />
          </div>
        )}
      </div>
    </div>
  );
}

function formatCourseLabel(activeFilter) {
  return (
    {
      overall: "Overall",
      tdc: "TDC",
      pdc: "PDC (All)",
      pdc_beginner: "PDC - Beginner",
      pdc_experience: "PDC - Experience",
    }[activeFilter] || activeFilter
  );
}

export default function OverviewReportsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState("overall");
  const [search] = useState("");
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [exportEmailOpen, setExportEmailOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [autoRefreshInterval, setAutoRefreshInterval] = useState(0); // 0 = disabled
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
  
  const { widgets, toggleWidget, resetToDefaults, isWidgetVisible } = useWidgetVisibility();
  const { data: summary, isError } = useReportOverview({
    startDate: effectiveDateRange.startDate,
    endDate: effectiveDateRange.endDate,
    course: activeFilter,
  });

  const stats = useMemo(
    () =>
      summary?.stats || {
        totalStudents: 0,
        currentlyEnrolled: 0,
        completed: 0,
        thisMonth: 0,
        pdcBeginner: 0,
        pdcExperience: 0,
        tdc: 0,
      },
    [summary?.stats]
  );

  const maintenanceSummary = useMemo(
    () =>
      summary?.maintenanceSummary || {
        totalRecords: 0,
        totalCost: 0,
        overdueCount: 0,
      },
    [summary?.maintenanceSummary]
  );

  const fuelSummary = useMemo(
    () =>
      summary?.fuelSummary || {
        totalEntries: 0,
        totalLiters: 0,
        totalExpense: 0,
      },
    [summary?.fuelSummary]
  );

  // Auto-refresh functionality
  useEffect(() => {
    if (autoRefreshInterval === 0) return;

    const interval = setInterval(() => {
      setIsRefreshing(true);
      queryClient.refetchQueries({ queryKey: ["reports", "overview"] }).then(() => {
        setLastUpdated(new Date());
        setIsRefreshing(false);
      });
    }, autoRefreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefreshInterval, queryClient]);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    queryClient.refetchQueries({ queryKey: ["reports", "overview"] }).then(() => {
      setLastUpdated(new Date());
      setIsRefreshing(false);
    });
  };

  const completionRate = useMemo(() => {
    if (stats.thisMonth === 0) return 0;
    return Math.round((stats.completed / stats.thisMonth) * 100);
  }, [stats]);

  const enrollmentTrend = useMemo(() => {
    if (stats.thisMonth === 0) return 0;
    return stats.thisMonth;
  }, [stats]);

  const passRate = useMemo(() => {
    if (stats.completed === 0) return 0;
    return Math.round((stats.completed / Math.max(stats.thisMonth, 1)) * 100);
  }, [stats]);

  const usageByVehicle = summary?.usageByVehicle || [];
  const vehiclesInUse = usageByVehicle.length;
  const totalOperatingCost = maintenanceSummary.totalCost + fuelSummary.totalExpense;
  const totalRevenue = Number((summary?.revenueSummary?.totalRevenue || 0).toFixed(2));
  const netProfit = Number((totalRevenue - totalOperatingCost).toFixed(2));

  const handleDownloadReport = () => {
    const courseLabel = formatCourseLabel(activeFilter);
    downloadOverviewReportPdf({
      courseLabel,
      stats,
      completionRate,
      passRate,
      maintenanceSummary,
      fuelSummary,
      generatedAt: new Date().toLocaleString(),
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <section className="space-y-4">
      <div className="hidden print:block">
        <PrintReport
          reportRange={summary?.reportRange || effectiveDateRange}
          courseFilter={activeFilter}
          stats={stats}
          monthlyEnrollment={summary?.monthlyEnrollment || []}
          dailyTransactions={summary?.dailyTransactions || []}
          recentActivities={summary?.recentActivities || []}
          maintenanceSummary={maintenanceSummary}
          fuelSummary={fuelSummary}
          generatedBy="System Admin"
          printedAt={new Date()}
        />
      </div>

      <div className="print:hidden space-y-4">
      {/* Header Controls */}
      <div className="print:hidden">
        <TopControls
          activeFilter={activeFilter}
          onChangeFilter={setActiveFilter}
          search={search}
          onSearchChange={() => {}}
          onEnroll={() => navigate("/enrollments")}
        />
      </div>

      {/* Refresh & Customize Bar */}
      <div className="print:hidden flex items-center justify-between rounded-xl border-t-2 border-t-[#D4AF37] border-slate-200 bg-white p-3 shadow-sm flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
            Refresh
          </button>

          <select
            value={autoRefreshInterval}
            onChange={(e) => setAutoRefreshInterval(Number(e.target.value))}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
          >
            <option value={0}>Auto-refresh: Off</option>
            <option value={30}>Auto-refresh: 30s</option>
            <option value={60}>Auto-refresh: 1m</option>
            <option value={300}>Auto-refresh: 5m</option>
          </select>

          {lastUpdated && (
            <p className="text-xs text-slate-500">
              Updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setExportEmailOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
          >
            <Share2 size={14} />
            Export & Email
          </button>

          <button
            type="button"
            onClick={() => setCustomizeOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-[#D4AF37] bg-[#D4AF37]/10 px-3 py-2 text-xs font-semibold text-[#800000] hover:bg-[#D4AF37]/20"
          >
            <Settings size={14} />
            Customize
          </button>
        </div>
      </div>

      {/* Error State */}
      {isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          Failed to load overview reports data.
        </div>
      ) : null}

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
              <Calendar size={14} />
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
              <button
                type="button"
                onClick={() => {
                  queryClient.refetchQueries({ queryKey: ["reports", "overview"] });
                  setLastUpdated(new Date());
                }}
                className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100"
              >
                <RefreshCw size={14} />
                Apply
              </button>
            </div>
          )}

          <p className="text-xs text-slate-500">
            {effectiveDateRange.startDate} to {effectiveDateRange.endDate}
          </p>
        </div>
      </div>

      {/* Print Header */}
      <div className="hidden print:block mb-4 border-b-2 border-[#D4AF37] pb-4">
        <h1 className="text-xl font-bold text-slate-900">Overview Reports Summary</h1>
        <p className="text-sm text-slate-600">
          Filter: {String(activeFilter || "overall").toUpperCase()} | Period: {effectiveDateRange.startDate} to{" "}
          {effectiveDateRange.endDate}
        </p>
        <p className="text-xs text-slate-500">Generated on {new Date().toLocaleString()}</p>
      </div>

      {/* 1. QUICK STATS DASHBOARD */}
      {isWidgetVisible("quickStats") && (
        <div className="rounded-xl border-t-2 border-t-[#D4AF37] border-slate-200 bg-white p-4 shadow-sm print:break-inside-avoid">
          <h2 className="mb-3 text-sm font-bold text-slate-900">Quick Stats Dashboard</h2>
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
            <KPICard
              label="Active Students"
              value={stats.currentlyEnrolled}
              icon={Users}
              bgColor="bg-blue-50"
              borderColor="border-blue-200"
              textColor="text-blue-700"
            />
            <KPICard
              label="Completed/Passed"
              value={stats.completed}
              icon={CheckCircle2}
              bgColor="bg-green-50"
              borderColor="border-green-200"
              textColor="text-green-700"
            />
            <KPICard
              label="Completion Rate"
              value={completionRate}
              unit="%"
              icon={TrendingUp}
              bgColor="bg-emerald-50"
              borderColor="border-emerald-200"
              textColor="text-emerald-700"
            />
            <KPICard
              label="Total Students"
              value={stats.totalStudents}
              icon={Users2}
              bgColor="bg-purple-50"
              borderColor="border-purple-200"
              textColor="text-purple-700"
            />
            <KPICard
              label="This Month Enrollments"
              value={enrollmentTrend}
              icon={Calendar}
              bgColor="bg-amber-50"
              borderColor="border-amber-200"
              textColor="text-amber-700"
            />
            <KPICard
              label="Instructors Active"
              value={summary?.instructorsActive ?? 0}
              bgColor="bg-slate-50"
              borderColor="border-slate-200"
              textColor="text-slate-700"
            />
          </div>
        </div>
      )}

      {/* 2. FINANCIAL SUMMARY */}
      {isWidgetVisible("financialSummary") && (
        <div className="rounded-xl border-t-2 border-t-[#D4AF37] border-slate-200 bg-white p-4 shadow-sm print:break-inside-avoid">
          <h2 className="mb-3 text-sm font-bold text-slate-900">Financial Summary</h2>
          <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
            <KPICard
              label="Total Revenue"
              value={totalRevenue}
              unit="PHP"
              bgColor="bg-emerald-50"
              borderColor="border-emerald-200"
              textColor="text-emerald-700"
            />
            <KPICard
              label="Pending Collections"
              value={0}
              unit="PHP"
              bgColor="bg-amber-50"
              borderColor="border-amber-200"
              textColor="text-amber-700"
            />
            <KPICard
              label="Operating Expenses"
              value={totalOperatingCost}
              unit="PHP"
              bgColor="bg-red-50"
              borderColor="border-red-200"
              textColor="text-red-700"
            />
            <KPICard
              label="Net Profit/Loss"
              value={netProfit}
              unit="PHP"
              bgColor="bg-slate-50"
              borderColor="border-slate-200"
              textColor="text-slate-700"
            />
          </div>
        </div>
      )}

      {/* 3. PERFORMANCE METRICS */}
      {isWidgetVisible("performanceMetrics") && (
        <div className="rounded-xl border-t-2 border-t-[#D4AF37] border-slate-200 bg-white p-4 shadow-sm print:break-inside-avoid">
          <h2 className="mb-4 text-sm font-bold text-slate-900">Performance Metrics</h2>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="mb-3 text-xs font-semibold uppercase text-slate-600">Completion & Pass Rate</p>
              <PerformanceMetricsChart completionRate={completionRate} passRate={passRate} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <KPICard
                label="Completion Rate %"
                value={completionRate}
                unit="%"
                bgColor="bg-blue-50"
                borderColor="border-blue-200"
                textColor="text-blue-700"
              />
              <KPICard
                label="Pass Rate %"
                value={passRate}
                unit="%"
                bgColor="bg-green-50"
                borderColor="border-green-200"
                textColor="text-green-700"
              />
              <KPICard
                label="Avg Score (TDC)"
                value={"N/A"}
                bgColor="bg-slate-50"
                borderColor="border-slate-200"
                textColor="text-slate-700"
              />
              <KPICard
                label="Dropout Rate %"
                value={0}
                unit="%"
                bgColor="bg-slate-50"
                borderColor="border-slate-200"
                textColor="text-slate-700"
              />
            </div>
          </div>
        </div>
      )}

      {/* 4. VEHICLE OPERATIONS */}
      {isWidgetVisible("vehicleOperations") && (
        <div className="rounded-xl border-t-2 border-t-[#D4AF37] border-slate-200 bg-white p-4 shadow-sm print:break-inside-avoid">
          <h2 className="mb-3 text-sm font-bold text-slate-900">Vehicle Operations</h2>
          <div className="grid gap-3 grid-cols-2 lg:grid-cols-4 mb-4">
            <KPICard
              label="Fleet Utilization"
              value={vehiclesInUse}
              unit="vehicles"
              icon={TrendingUp}
              bgColor="bg-blue-50"
              borderColor="border-blue-200"
              textColor="text-blue-700"
            />
            <KPICard
              label="Maintenance Cost"
              value={maintenanceSummary.totalCost}
              unit="PHP"
              icon={Wrench}
              bgColor="bg-red-50"
              borderColor="border-red-200"
              textColor="text-red-700"
            />
            <KPICard
              label="Fuel Expense"
              value={fuelSummary.totalExpense}
              unit="PHP"
              icon={Fuel}
              bgColor="bg-amber-50"
              borderColor="border-amber-200"
              textColor="text-amber-700"
            />
            <KPICard
              label="Overdue Maintenance"
              value={maintenanceSummary.overdueCount}
              unit="records"
              bgColor="bg-rose-50"
              borderColor="border-rose-200"
              textColor="text-rose-700"
            />
          </div>

          {/* Vehicle Usage Chart */}
          <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="mb-3 text-xs font-semibold uppercase text-slate-600">Vehicle Usage by Sessions & Hours</p>
            <VehicleUsageChart usageByVehicle={usageByVehicle} />
          </div>

          {/* Vehicle Usage & Fuel Efficiency Table */}
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold text-slate-700">Vehicle</th>
                  <th className="px-4 py-2 text-left font-semibold text-slate-700">Type</th>
                  <th className="px-4 py-2 text-right font-semibold text-slate-700">Distance (km)</th>
                  <th className="px-4 py-2 text-right font-semibold text-slate-700">Fuel (L)</th>
                  <th className="px-4 py-2 text-right font-semibold text-slate-700">Fuel Cost (PHP)</th>
                  <th className="px-4 py-2 text-right font-semibold text-slate-700">Avg L/100km</th>
                  <th className="px-4 py-2 text-right font-semibold text-slate-700">Sessions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {usageByVehicle.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-3 text-center text-xs text-slate-500">
                      No vehicle usage data for this period.
                    </td>
                  </tr>
                ) : (
                  usageByVehicle.map((item) => (
                    <tr key={item.vehicleId} className="hover:bg-slate-50">
                      <td className="px-4 py-2 text-slate-800 font-medium">
                        {item.vehicleName} ({item.plateNumber || "No Plate"})
                      </td>
                      <td className="px-4 py-2 text-slate-700">{item.vehicleType}</td>
                      <td className="px-4 py-2 text-right text-slate-700">{item.totalDistance?.toFixed(1) || 0}</td>
                      <td className="px-4 py-2 text-right text-slate-700">{item.totalLiters || 0}</td>
                      <td className="px-4 py-2 text-right text-slate-700">{item.totalFuelCost?.toLocaleString() || 0}</td>
                      <td className="px-4 py-2 text-right font-semibold text-amber-700">
                        {item.avgLitersPer100km?.toFixed(2) || "N/A"}
                      </td>
                      <td className="px-4 py-2 text-right text-slate-700">{item.completedUsages || 0}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. INSTRUCTOR PERFORMANCE */}
      {isWidgetVisible("instructorPerformance") && (
        <div className="rounded-xl border-t-2 border-t-[#D4AF37] border-slate-200 bg-white p-4 shadow-sm print:break-inside-avoid">
          <h2 className="mb-3 text-sm font-bold text-slate-900">Instructor Performance</h2>
          <div className="grid gap-3 grid-cols-1 lg:grid-cols-3 mb-4">
            <KPICard
              label="Students per Instructor"
              value={stats.currentlyEnrolled > 0 ? (stats.currentlyEnrolled / Math.max(1, 1)).toFixed(1) : 0}
              bgColor="bg-blue-50"
              borderColor="border-blue-200"
              textColor="text-blue-700"
            />
            <KPICard
              label="Avg Completion Rate"
              value={completionRate}
              unit="%"
              bgColor="bg-green-50"
              borderColor="border-green-200"
              textColor="text-green-700"
            />
            <KPICard
              label="Scheduled vs Actual"
              value={"In Progress"}
              bgColor="bg-slate-50"
              borderColor="border-slate-200"
              textColor="text-slate-700"
            />
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-600">
            Instructor-level analytics coming soon. View individual instructor performance in the Instructors page.
          </div>
        </div>
      )}

      {/* 6. TRENDS & FORECASTS */}
      {isWidgetVisible("trendsForecasts") && (
        <div className="rounded-xl border-t-2 border-t-[#D4AF37] border-slate-200 bg-white p-4 shadow-sm print:break-inside-avoid">
          <h2 className="mb-4 text-sm font-bold text-slate-900">Trends & Forecasts</h2>
          <div className="grid gap-4 xl:grid-cols-12">
            <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 shadow-sm xl:col-span-7">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-600">Enrollment Trend</p>
              <EnrollmentTrendChart data={summary?.monthlyEnrollment || []} />
            </div>
            <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 shadow-sm xl:col-span-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-600">Enrollment Distribution</p>
              <EnrollmentDistributionChart stats={stats} />
            </div>
          </div>
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
            <MonthlyEnrollmentCard rows={summary?.monthlyEnrollment || []} activeFilter={activeFilter} />
          </div>
        </div>
      )}

      {/* 7. ADVANCED CHARTS */}
      {isWidgetVisible("advancedCharts") && (
        <div className="rounded-xl border-t-2 border-t-[#D4AF37] border-slate-200 bg-white p-4 shadow-sm print:break-inside-avoid">
          <h2 className="mb-4 text-sm font-bold text-slate-900">Advanced Charts</h2>
          <div className="grid gap-4 xl:grid-cols-12">
            <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 shadow-sm xl:col-span-7">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-600">Enrollment Trend Area</p>
              <EnrollmentAreaChart data={summary?.monthlyEnrollment || []} />
            </div>

            <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 shadow-sm xl:col-span-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-600">Completion Gauge</p>
              <CompletionGaugeChart completionRate={completionRate} />
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 shadow-sm">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-600">Enrollment + Pass Rate</p>
            <ComboEnrollmentChart monthlyData={summary?.monthlyEnrollment || []} completionRate={passRate} />
          </div>
        </div>
      )}

      {/* Export/Print Controls */}
      <div className="print:hidden flex gap-2 justify-end sticky bottom-4">
        <button
          type="button"
          onClick={handleDownloadReport}
          className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 shadow-lg"
        >
          <Download size={16} />
          Download Report
        </button>
        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-2 rounded-md border border-[#D4AF37] bg-[#D4AF37] px-4 py-2 text-sm font-semibold text-[#800000] hover:bg-[#C9A623] shadow-lg"
        >
          <Calendar size={16} />
          Print Report
        </button>
      </div>

      {/* Customize Modal */}
      <CustomizeDashboardModal
        isOpen={customizeOpen}
        widgets={widgets}
        onToggleWidget={toggleWidget}
        onResetDefaults={resetToDefaults}
        onClose={() => setCustomizeOpen(false)}
      />

      {/* Export & Email Modal */}
      <ExportAndEmailModal
        isOpen={exportEmailOpen}
        activeFilter={activeFilter}
        stats={stats}
        completionRate={completionRate}
        passRate={passRate}
        maintenanceSummary={maintenanceSummary}
        fuelSummary={fuelSummary}
        onClose={() => setExportEmailOpen(false)}
      />
      </div>
    </section>
  );
}
