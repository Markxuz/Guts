import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/hooks/useAuth";
import AddScheduleModal from "../components/AddScheduleModal";
import CalendarWidget from "../components/CalendarWidget";
import DashboardGrid from "../components/DashboardGrid";
import DailyReportsCard from "../components/DailyReportsCard";
import MonthlyEnrollmentCard from "../components/MonthlyEnrollmentCard";
import PendingApprovalsCard from "../components/PendingApprovalsCard";
import PrintReport from "../components/PrintReport";
import QuickActionsCard from "../components/QuickActionsCard";
import RecentActivitiesCard from "../components/RecentActivitiesCard";
import StatsGrid from "../components/StatsGrid";
import TopControls from "../components/TopControls";
import { useCreateSchedule } from "../hooks/useCreateSchedule";
import { useCancelSchedule } from "../hooks/useCancelSchedule";
import {
  useApproveScheduleChangeRequest,
  useCreateScheduleChangeRequest,
  usePendingScheduleChangeRequests,
  useRejectScheduleChangeRequest,
} from "../hooks/useScheduleChangeRequests";
import { useDailyReports } from "../hooks/useDailyReports";
import { useReportOverview } from "../hooks/useReportOverview";
import { useScheduleMonthStatus } from "../hooks/useScheduleMonthStatus";
import { formatDateToISO, parseDateValue } from "../../../shared/utils/date";
import ToastStack from "../../students/components/ToastStack";

function getDateRangeFromPreset(preset, customStartDate, customEndDate) {
  const now = new Date();

  if (preset === "today") {
    const today = formatDateToISO(now);
    return {
      startDate: today,
      endDate: today,
    };
  }

  if (preset === "thisWeek") {
    const start = new Date(now);
    const day = start.getDay();
    const diffToMonday = (day + 6) % 7;
    start.setDate(start.getDate() - diffToMonday);

    return {
      startDate: formatDateToISO(start),
      endDate: formatDateToISO(now),
    };
  }

  if (preset === "custom") {
    const fallback = formatDateToISO(now);
    const safeStart = customStartDate || fallback;
    const safeEnd = customEndDate || safeStart;
    if (safeStart <= safeEnd) {
      return {
        startDate: safeStart,
        endDate: safeEnd,
      };
    }

    return {
      startDate: safeEnd,
      endDate: safeStart,
    };
  }

  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  return {
    startDate: formatDateToISO(firstOfMonth),
    endDate: formatDateToISO(now),
  };
}

function buildReportFilter(preset, customStartDate, customEndDate) {
  const { startDate, endDate } = getDateRangeFromPreset(preset, customStartDate, customEndDate);
  const isSingleDay = startDate === endDate;

  return {
    mode: isSingleDay ? "day" : "range",
    preset,
    date: isSingleDay ? startDate : null,
    startDate,
    endDate,
  };
}

function toReportHeading(filter) {
  const start = new Date(`${filter.startDate}T00:00:00`);
  const end = new Date(`${filter.endDate}T00:00:00`);

  if (filter.mode === "day") {
    return {
      title: `Daily Report: ${start.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`,
      subtitle: "Schedules and transactions for the selected day",
      emptyMessage: "No schedules or transactions recorded for this date.",
    };
  }

  const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
  const periodLabel = sameMonth
    ? `${start.toLocaleDateString("en-US", { month: "long" })} ${start.getDate()} - ${end.getDate()}, ${end.getFullYear()}`
    : `${start.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} - ${end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;

  return {
    title: `Report Period: ${periodLabel}`,
    subtitle: "Schedules and transactions for the selected range",
    emptyMessage: "No schedules or transactions recorded for this period.",
  };
}

function filterDailyReports(rows, activeFilter, search) {
  return rows.filter((row) => {
    const filter = String(activeFilter || "overall").toLowerCase();
    const courseType = String(row.courseType || "").toLowerCase();
    const promoText = [row.course, row.description, row.remarks].filter(Boolean).join(" ").toLowerCase();
    const isPromo = promoText.includes("promo");

    const matchesFilter =
      filter === "overall"
        ? true
        : filter === "tdc"
          ? courseType === "tdc" || isPromo
          : filter === "pdc"
            ? courseType === "pdc_beginner" || courseType === "pdc_experience" || isPromo
            : filter === "pdc_beginner"
              ? courseType === "pdc_beginner"
              : filter === "pdc_experience"
                ? courseType === "pdc_experience"
                : true;

    if (!matchesFilter) return false;

    const text = search.trim().toLowerCase();
    if (text) {
      return [row.studentName, row.course, row.vehicleType, row.instructor, row.remarks, row.description]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(text));
    }
    return true;
  });
}

function filterRecentActivities(rows, search) {
  const text = search.trim().toLowerCase();
  if (!text) return rows;

  return rows.filter((row) =>
    [row.userName, row.action]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(text))
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const [activeFilter, setActiveFilter] = useState("overall");
  const [scheduleCourseType, setScheduleCourseType] = useState("tdc");
  const [search, setSearch] = useState("");
  const [toasts, setToasts] = useState([]);
  const [printedAt, setPrintedAt] = useState(new Date());
  const initialFilter = useMemo(() => buildReportFilter("thisMonth", "", ""), []);
  const [reportFilter, setReportFilter] = useState(initialFilter);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [calendarView, setCalendarView] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
  });

  const dailyReportHeading = useMemo(() => toReportHeading(reportFilter), [reportFilter]);
  const selectedDate = useMemo(
    () => parseDateValue(reportFilter.mode === "day" ? reportFilter.date : reportFilter.endDate),
    [reportFilter]
  );

  const { data: reportOverview, isLoading: summaryLoading, isError: summaryError } = useReportOverview({
    startDate: reportFilter.startDate,
    endDate: reportFilter.endDate,
    course: activeFilter,
  });
  const { data: dailyReportData, isLoading: dailyLoading, isError: dailyError } = useDailyReports(reportFilter);
  const { data: monthStatusData } = useScheduleMonthStatus(calendarView);
  const createScheduleMutation = useCreateSchedule();
  const cancelScheduleMutation = useCancelSchedule();
  const requestScheduleChangeMutation = useCreateScheduleChangeRequest();
  const approveScheduleChangeMutation = useApproveScheduleChangeRequest();
  const rejectScheduleChangeMutation = useRejectScheduleChangeRequest();
  const { data: pendingRequestsData, isLoading: pendingRequestsLoading } = usePendingScheduleChangeRequests(auth?.user?.role === "admin");

  function addToast(message, type = "success") {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((current) => [...current, { id, message, type }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 4500);
  }

  const unfilteredDailyReports = dailyReportData?.items || [];
  const unfilteredRecentActivities = reportOverview?.recentActivities || [];

  const dailyReports = filterDailyReports(unfilteredDailyReports, activeFilter, search);
  const recentActivities = filterRecentActivities(unfilteredRecentActivities, search).slice(0, 30);

  const handlePrintReports = () => {
    setPrintedAt(new Date());
    setTimeout(() => {
      window.print();
    }, 50);
  };

  const allActivityDates = [
    ...(reportOverview?.activityDates || []),
    ...((monthStatusData?.items || []).map((item) => item.date)),
  ].map((dateValue) => parseDateValue(dateValue));

  const summary = reportOverview?.stats || {
    totalStudents: 0,
    currentlyEnrolled: 0,
    completed: 0,
    thisMonth: 0,
    pdcBeginner: 0,
    pdcExperience: 0,
  };

  const generatedBy = `${auth?.user?.name || "System Admin"}${auth?.user?.id ? ` (Admin ID: ${auth.user.id})` : ""}`;

  return (
    <>
      <section className="space-y-4 print:hidden">
        <TopControls
          activeFilter={activeFilter}
          onChangeFilter={setActiveFilter}
          search={search}
          onSearchChange={setSearch}
          onEnroll={() => navigate("/enrollments")}
        />

        {summaryError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            Failed to load dashboard summary.
          </div>
        ) : null}

        <StatsGrid loading={summaryLoading} stats={summary} />

        <DashboardGrid
          left={(
            <>
              <CalendarWidget
                view={calendarView}
                courseFilter={scheduleCourseType}
                onCourseFilterChange={setScheduleCourseType}
                reportFilter={reportFilter}
                onSelectDate={(date) => {
                  const dateIso = formatDateToISO(date);
                  setReportFilter({
                    mode: "day",
                    preset: "today",
                    date: dateIso,
                    startDate: dateIso,
                    endDate: dateIso,
                  });
                }}
                onOpenSchedule={(date) => {
                  setReportFilter({
                    mode: "day",
                    preset: "today",
                    date: formatDateToISO(date),
                    startDate: formatDateToISO(date),
                    endDate: formatDateToISO(date),
                  });
                  setScheduleModalOpen(true);
                }}
                activityDates={allActivityDates}
                monthStatus={monthStatusData?.items || []}
                onPrevMonth={() =>
                  setCalendarView((prev) =>
                    prev.month === 0 ? { year: prev.year - 1, month: 11 } : { ...prev, month: prev.month - 1 }
                  )
                }
                onNextMonth={() =>
                  setCalendarView((prev) =>
                    prev.month === 11 ? { year: prev.year + 1, month: 0 } : { ...prev, month: prev.month + 1 }
                  )
                }
              />

              <DailyReportsCard
                rows={dailyReports}
                total={dailyReportData?.total || dailyReports.length}
                loading={dailyLoading}
                error={dailyError}
                title={dailyReportHeading.title}
                subtitle={dailyReportHeading.subtitle}
                emptyMessage={dailyReportHeading.emptyMessage}
              />

              <RecentActivitiesCard
                rows={recentActivities}
                loading={summaryLoading}
                error={summaryError}
              />
            </>
          )}
          right={(
            <>
              <MonthlyEnrollmentCard rows={reportOverview?.monthlyEnrollment || []} activeFilter={activeFilter} />
              <QuickActionsCard
                reportFilter={reportFilter}
                onPeriodPresetChange={(preset) => {
                  setReportFilter((current) => buildReportFilter(preset, current.startDate, current.endDate));
                }}
                onStartDateChange={(value) => {
                  setReportFilter((current) => buildReportFilter("custom", value, current.endDate));
                }}
                onEndDateChange={(value) => {
                  setReportFilter((current) => buildReportFilter("custom", current.startDate, value));
                }}
                onPrintReports={handlePrintReports}
                onNewEnrollment={() => navigate("/enrollments")}
                onViewReports={() => navigate("/reports")}
              />
              {auth?.user?.role === "admin" ? (
                <PendingApprovalsCard
                  rows={pendingRequestsData?.items || []}
                  loading={pendingRequestsLoading}
                  approveMutation={approveScheduleChangeMutation}
                  rejectMutation={rejectScheduleChangeMutation}
                  onApproved={(row) => addToast(`Approved schedule change for ${row.currentSchedule?.studentName || "student"}.`, "success")}
                  onRejected={(row) => addToast(`Rejected schedule change for ${row.currentSchedule?.studentName || "student"}.`, "success")}
                />
              ) : null}
            </>
          )}
        />
      </section>

      <PrintReport
        className="hidden print:block"
        reportRange={{ startDate: reportFilter.startDate, endDate: reportFilter.endDate }}
        stats={summary}
        monthlyEnrollment={reportOverview?.monthlyEnrollment || []}
        dailyTransactions={unfilteredDailyReports}
        recentActivities={unfilteredRecentActivities}
        maintenanceSummary={reportOverview?.maintenanceSummary}
        fuelSummary={reportOverview?.fuelSummary}
        generatedBy={generatedBy}
        printedAt={printedAt}
      />

      <AddScheduleModal
        isOpen={scheduleModalOpen}
        selectedDate={selectedDate}
        defaultCourseType={scheduleCourseType}
        availability={dailyReportData?.availability || []}
        loadingAvailability={dailyLoading}
        createScheduleMutation={createScheduleMutation}
        cancelScheduleMutation={cancelScheduleMutation}
        requestScheduleChangeMutation={requestScheduleChangeMutation}
        onScheduleSaved={(message) => addToast(message, "success")}
        onScheduleCancelled={(message) => addToast(message, "success")}
        onScheduleChangeRequested={(message) => addToast(message, "success")}
        onClose={() => {
          createScheduleMutation.reset();
          cancelScheduleMutation.reset();
          requestScheduleChangeMutation.reset();
          setScheduleModalOpen(false);
        }}
      />

      <ToastStack
        toasts={toasts}
        onDismiss={(id) => setToasts((current) => current.filter((toast) => toast.id !== id))}
      />
    </>
  );
}
