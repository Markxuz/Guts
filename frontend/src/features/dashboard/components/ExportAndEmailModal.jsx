import { useMemo, useState } from "react";
import { FileText, Mail } from "lucide-react";
import { scheduleOverviewReportEmail, sendOverviewReportEmail, sendTestOverviewReportEmail } from "../services/dashboardApi";
import { downloadOverviewReportPdf } from "../utils/overviewReportPdf";

const BRAND = {
  maroon: [128, 0, 0],
  gold: [212, 175, 55],
  slate: [15, 23, 42],
  blue: [59, 130, 246],
  green: [16, 185, 129],
  amber: [245, 158, 11],
};

function getCourseLabel(activeFilter) {
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

function formatMoney(value) {
  return `PHP ${Number(value || 0).toLocaleString()}`;
}

function formatPlain(value) {
  return Number(value || 0).toLocaleString();
}

function formatPercent(value) {
  return `${Number(value || 0).toLocaleString()}%`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export default function ExportAndEmailModal({
  isOpen,
  activeFilter,
  stats,
  maintenanceSummary,
  fuelSummary,
  completionRate,
  passRate,
  onClose,
}) {
  const [downloadFormat, setDownloadFormat] = useState("csv");
  const [isScheduling, setIsScheduling] = useState(false);
  const [isSendingReport, setIsSendingReport] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [scheduleStatus, setScheduleStatus] = useState("");
  const [statusType, setStatusType] = useState("info");
  const [scheduleForm, setScheduleForm] = useState({
    recipients: "",
    frequency: "weekly",
    fileFormat: "pdf",
  });

  const courseLabel = useMemo(() => getCourseLabel(activeFilter), [activeFilter]);

  if (!isOpen) return null;

  const sections = [
    {
      title: "Quick Stats",
      accent: BRAND.maroon,
      rows: [
        ["Active Students", stats.currentlyEnrolled, "students"],
        ["Completed/Passed", stats.completed, "students"],
        ["Completion Rate", completionRate, "%"],
        ["Total Students", stats.totalStudents, "students"],
        ["This Month Enrollments", stats.thisMonth, "enrollments"],
      ],
    },
    {
      title: "Financial Summary",
      accent: BRAND.gold,
      rows: [
        ["Total Revenue", 0, "PHP"],
        ["Pending Collections", 0, "PHP"],
        ["Operating Expenses", maintenanceSummary.totalCost + fuelSummary.totalExpense, "PHP"],
        ["Net Profit/Loss", 0, "PHP"],
      ],
    },
    {
      title: "Performance Metrics",
      accent: BRAND.green,
      rows: [
        ["Completion Rate", completionRate, "%"],
        ["Pass Rate", passRate, "%"],
        ["Avg Score (TDC)", "N/A", ""],
        ["Dropout Rate", 0, "%"],
      ],
    },
    {
      title: "Vehicle Operations",
      accent: BRAND.blue,
      rows: [
        ["Maintenance Cost", maintenanceSummary.totalCost, "PHP"],
        ["Maintenance Records", maintenanceSummary.totalRecords, "records"],
        ["Overdue Maintenance", maintenanceSummary.overdueCount, "records"],
        ["Fuel Expense", fuelSummary.totalExpense, "PHP"],
        ["Fuel Entries", fuelSummary.totalEntries, "entries"],
        ["Total Liters", fuelSummary.totalLiters, "L"],
      ],
    },
  ];

  const downloadBlob = (blob, extension, mimeType) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `overview-reports-${courseLabel}-${new Date().toISOString().slice(0, 10)}.${extension}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const buildRowsForCsv = () => [
    ["OVERVIEW REPORTS SUMMARY"],
    ["Course Filter", courseLabel],
    ["Generated", new Date().toLocaleString()],
    [],
    ...sections.flatMap((section) => ([
      [section.title],
      ["Metric", "Value", "Unit"],
      ...section.rows,
      [],
    ])),
  ];

  const exportCSV = () => {
    const csv = buildRowsForCsv()
      .map((row) => row.map((val) => `"${String(val ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n");

    downloadBlob(new Blob([csv], { type: "text/csv;charset=utf-8;" }), "csv", "text/csv;charset=utf-8;");
  };

  const exportExcel = () => {
    const htmlRows = sections
      .map((section) => `
        <h3>${escapeHtml(section.title)}</h3>
        <table>
          <thead>
            <tr><th>Metric</th><th>Value</th><th>Unit</th></tr>
          </thead>
          <tbody>
            ${section.rows.map((row) => `
              <tr>
                <td>${escapeHtml(row[0])}</td>
                <td class="value">${escapeHtml(row[1])}</td>
                <td>${escapeHtml(row[2])}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      `)
      .join("");

    const html = `
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            body { font-family: Arial, sans-serif; color: #0f172a; padding: 24px; }
            .banner { background: linear-gradient(135deg, #800000 0%, #b91c1c 100%); color: #fff; padding: 20px 24px; border-radius: 16px; margin-bottom: 18px; }
            .banner h1 { margin: 0 0 6px; font-size: 26px; }
            .meta { color: #fee2e2; font-size: 12px; }
            .cards { display: table; width: 100%; table-layout: fixed; margin: 18px 0 24px; border-spacing: 10px; }
            .card { display: table-cell; width: 25%; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 14px; vertical-align: top; }
            .card .label { font-size: 11px; text-transform: uppercase; letter-spacing: .06em; color: #64748b; margin-bottom: 6px; }
            .card .value { font-size: 22px; font-weight: 700; color: #0f172a; }
            h3 { margin: 24px 0 10px; font-size: 16px; color: #800000; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
            th, td { border: 1px solid #dbe2ea; padding: 9px 10px; font-size: 12px; }
            th { background: #f8fafc; text-align: left; }
            td.value { font-weight: 700; }
            .footnote { margin-top: 16px; font-size: 11px; color: #64748b; }
          </style>
        </head>
        <body>
          <div class="banner">
            <h1>Overview Reports Summary</h1>
            <div>Course Filter: ${escapeHtml(courseLabel)}</div>
            <div class="meta">Generated: ${escapeHtml(new Date().toLocaleString())}</div>
          </div>
          <div class="cards">
            <div class="card"><div class="label">Active Students</div><div class="value">${formatPlain(stats.currentlyEnrolled)}</div></div>
            <div class="card"><div class="label">Completed</div><div class="value">${formatPlain(stats.completed)}</div></div>
            <div class="card"><div class="label">Completion Rate</div><div class="value">${formatPercent(completionRate)}</div></div>
            <div class="card"><div class="label">Operating Expenses</div><div class="value">${formatMoney(maintenanceSummary.totalCost + fuelSummary.totalExpense)}</div></div>
          </div>
          ${htmlRows}
          <div class="footnote">Report generated from the Overview Reports dashboard. Values are derived from the selected course filter.</div>
        </body>
      </html>
    `;

    downloadBlob(new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8;" }), "xls", "application/vnd.ms-excel;charset=utf-8;");
  };

  const exportPdf = () => {
    downloadOverviewReportPdf({
      courseLabel,
      stats,
      completionRate,
      passRate,
      maintenanceSummary,
      fuelSummary,
      sections,
    });
  };

  const handleDownloadReport = () => {
    setScheduleStatus("");
    setStatusType("info");
    if (downloadFormat === "pdf") {
      exportPdf();
      return;
    }
    if (downloadFormat === "excel") {
      exportExcel();
      return;
    }
    exportCSV();
  };

  const handleScheduleEmail = async () => {
    setScheduleStatus("");
    setStatusType("info");
    const recipients = scheduleForm.recipients
      .split(",")
      .map((email) => email.trim())
      .filter(Boolean);

    if (recipients.length === 0) {
      setStatusType("error");
      setScheduleStatus("Maglagay ng at least one email recipient.");
      return;
    }

    try {
      setIsScheduling(true);
      await scheduleOverviewReportEmail({
        recipients,
        frequency: scheduleForm.frequency,
        fileFormat: scheduleForm.fileFormat,
        course: activeFilter,
      });
      setStatusType("success");
      setScheduleStatus("Email report schedule saved successfully.");
    } catch (error) {
      setStatusType("error");
      setScheduleStatus(error?.message || "Failed to save email schedule.");
    } finally {
      setIsScheduling(false);
    }
  };

  const handleSendTestEmail = async () => {
    setScheduleStatus("");
    setStatusType("info");

    const recipients = scheduleForm.recipients
      .split(",")
      .map((email) => email.trim())
      .filter(Boolean);

    if (recipients.length === 0) {
      setStatusType("error");
      setScheduleStatus("Maglagay ng at least one email recipient bago mag test send.");
      return;
    }

    try {
      setIsSendingTest(true);
      const response = await sendTestOverviewReportEmail({
        recipients,
        frequency: scheduleForm.frequency,
        fileFormat: scheduleForm.fileFormat,
        course: activeFilter,
      });

      const transportMode = response?.transportMode || response?.data?.transportMode || "smtp";
      setStatusType("success");
      setScheduleStatus(
        `Test email sent. Delivery mode: ${transportMode === "smtp" ? "SMTP" : "Preview"}. Check inbox/spam in 1-2 minutes.`
      );
    } catch (error) {
      setStatusType("error");
      setScheduleStatus(error?.message || "Failed to send test email.");
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleSendReport = async () => {
    setScheduleStatus("");
    setStatusType("info");

    const recipients = scheduleForm.recipients
      .split(",")
      .map((email) => email.trim())
      .filter(Boolean);

    if (recipients.length === 0) {
      setStatusType("error");
      setScheduleStatus("Maglagay ng at least one email recipient bago mag send report.");
      return;
    }

    try {
      setIsSendingReport(true);
      const response = await sendOverviewReportEmail({
        recipients,
        frequency: scheduleForm.frequency,
        fileFormat: scheduleForm.fileFormat,
        course: activeFilter,
      });

      const transportMode = response?.transportMode || response?.data?.transportMode || "smtp";
      setStatusType("success");
      setScheduleStatus(
        `Report sent successfully. Delivery mode: ${transportMode === "smtp" ? "SMTP" : "Preview"}. Check inbox/spam in 1-2 minutes.`
      );
    } catch (error) {
      setStatusType("error");
      setScheduleStatus(error?.message || "Failed to send report.");
    } finally {
      setIsSendingReport(false);
    }
  };

  return (
    <div
      style={{ left: "var(--app-sidebar-width, 0px)", width: "calc(100vw - var(--app-sidebar-width, 0px))" }}
      className="fixed inset-y-0 right-0 z-[80] flex items-center justify-center bg-black/50 p-4 backdrop-blur-[1px]"
    >
      <div className="w-full max-w-2xl rounded-xl bg-white shadow-2xl">
        <div className="border-b border-slate-200 p-4">
          <h2 className="text-lg font-bold text-slate-900">Export & Email Options</h2>
        </div>

        <div className="space-y-3 p-4">
          <div className="rounded-lg border border-slate-200 p-4">
            <div className="mb-3 flex items-start gap-4">
              <FileText size={24} className="mt-0.5 text-blue-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-slate-900">Download Report</p>
                <p className="text-xs text-slate-600 mt-1">Pumili muna ng file type bago i-download ang report.</p>
                <p className="text-[11px] text-blue-600 mt-2">Includes: Stats, Financial, Performance, Vehicle data</p>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <label className="text-xs font-semibold text-slate-600">
                File type
                <select
                  value={downloadFormat}
                  onChange={(event) => setDownloadFormat(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700"
                >
                  <option value="csv">CSV File (.csv)</option>
                  <option value="excel">Excel File (.xls)</option>
                  <option value="pdf">PDF File (.pdf)</option>
                </select>
              </label>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleDownloadReport}
                  className="w-full rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
                >
                  Download Report
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 p-4">
            <div className="mb-3 flex items-start gap-4">
              <Mail size={24} className="mt-0.5 text-amber-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-slate-900">Schedule Email Reports</p>
                <p className="text-xs text-slate-600 mt-1">Auto-send reports to one or more email addresses.</p>
              </div>
            </div>

            <div className="grid gap-2">
              <label className="text-xs font-semibold text-slate-600">
                Recipients (comma-separated)
                <input
                  type="text"
                  value={scheduleForm.recipients}
                  onChange={(event) => setScheduleForm((prev) => ({ ...prev, recipients: event.target.value }))}
                  placeholder="owner@example.com, admin@example.com"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700"
                />
              </label>

              <div className="grid gap-2 sm:grid-cols-2">
                <label className="text-xs font-semibold text-slate-600">
                  Frequency
                  <select
                    value={scheduleForm.frequency}
                    onChange={(event) => setScheduleForm((prev) => ({ ...prev, frequency: event.target.value }))}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </label>

                <label className="text-xs font-semibold text-slate-600">
                  Attachment format
                  <select
                    value={scheduleForm.fileFormat}
                    onChange={(event) => setScheduleForm((prev) => ({ ...prev, fileFormat: event.target.value }))}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
                  >
                    <option value="pdf">PDF</option>
                    <option value="csv">CSV</option>
                    <option value="excel">Excel</option>
                  </select>
                </label>
              </div>

              <div className="grid gap-2 sm:grid-cols-3">
                <button
                  type="button"
                  disabled={isSendingReport}
                  onClick={handleSendReport}
                  className="mt-1 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-60"
                >
                  {isSendingReport ? "Sending report..." : "Send Report"}
                </button>

                <button
                  type="button"
                  disabled={isSendingTest}
                  onClick={handleSendTestEmail}
                  className="mt-1 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-60"
                >
                  {isSendingTest ? "Sending test..." : "Send Test Email"}
                </button>

                <button
                  type="button"
                  disabled={isScheduling}
                  onClick={handleScheduleEmail}
                  className="mt-1 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-100 disabled:opacity-60"
                >
                  {isScheduling ? "Saving..." : "Save Email Schedule"}
                </button>
              </div>
            </div>
          </div>

          {scheduleStatus ? (
            <p className={`rounded-lg border px-3 py-2 text-xs ${
              statusType === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : statusType === "error"
                ? "border-rose-200 bg-rose-50 text-rose-700"
                : "border-slate-200 bg-slate-50 text-slate-600"
            }`}>{scheduleStatus}</p>
          ) : null}
        </div>

        <div className="border-t border-slate-200 p-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
