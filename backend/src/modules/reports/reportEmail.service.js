const PDFDocument = require("pdfkit");
const { Op } = require("sequelize");
const { ReportSchedule } = require("../../../models");
const { getOverviewReports } = require("./reports.service");
const { sendMail, isSmtpConfigured } = require("../../shared/email/mailer");
const logger = require("../../shared/logging/logger");

const BRAND = {
  maroon: "#7f1d1d",
  gold: "#d4af37",
  navy: "#0f172a",
  slate: "#64748b",
  paper: "#f8fafc",
};

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const CONTENT_START_Y = 98;

function formatDateOnly(date) {
  return date.toISOString().slice(0, 10);
}

function getFrequencyWindow(frequency) {
  const end = new Date();
  const start = new Date(end);

  if (frequency === "daily") {
    start.setDate(start.getDate() - 1);
  } else if (frequency === "monthly") {
    start.setDate(start.getDate() - 30);
  } else {
    start.setDate(start.getDate() - 7);
  }

  return {
    startDate: formatDateOnly(start),
    endDate: formatDateOnly(end),
  };
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function getNextRunAt(baseDate, frequency) {
  if (frequency === "daily") return addDays(baseDate, 1);
  if (frequency === "monthly") return addDays(baseDate, 30);
  return addDays(baseDate, 7);
}

function getCourseLabel(course) {
  const value = String(course || "overall").toLowerCase();
  if (value === "pdc_beginner") return "PDC Beginner";
  if (value === "pdc_experience") return "PDC Experience";
  return value.toUpperCase();
}

function getFrequencyLabel(frequency) {
  return String(frequency || "weekly").toLowerCase();
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString();
}

function formatPercent(value) {
  return `${Number(value || 0).toLocaleString()}%`;
}

function formatMoney(value) {
  return `PHP ${Number(value || 0).toLocaleString()}`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildStatRows(report) {
  const maintenanceCost = Number(report?.maintenanceSummary?.totalCost || 0);
  const fuelExpense = Number(report?.fuelSummary?.totalExpense || 0);
  const operatingExpense = maintenanceCost + fuelExpense;
  const completionRate = report?.stats?.thisMonth
    ? Math.round((Number(report.stats.completed || 0) / Number(report.stats.thisMonth || 1)) * 100)
    : 0;

  return [
    ["Total Students", formatNumber(report.stats.totalStudents), "students"],
    ["Currently Enrolled", formatNumber(report.stats.currentlyEnrolled), "students"],
    ["Completed", formatNumber(report.stats.completed), "students"],
    ["This Month", formatNumber(report.stats.thisMonth), "enrollments"],
    ["PDC Beginner", formatNumber(report.stats.pdcBeginner), "students"],
    ["PDC Experience", formatNumber(report.stats.pdcExperience), "students"],
    ["Completion Rate", formatPercent(completionRate), ""],
    ["Operating Expense", formatMoney(operatingExpense), ""],
  ];
}

function buildVehicleRows(report) {
  return (report.usageByVehicle || []).slice(0, 8).map((row) => [
    row.vehicleName || "-",
    row.vehicleType || "-",
    formatNumber(row.completedSessions),
    `${Number(row.totalTrainingHours || 0).toLocaleString()}h`,
  ]);
}

function buildTransactionRows(report) {
  return (report.dailyTransactions || []).slice(0, 40).map((row) => [
    row.time || "-",
    row.studentName || "-",
    row.transactionType || "-",
    row.course || "-",
    row.instructor || "-",
    row.remarks || "-",
  ]);
}

function buildDashboardSections(report) {
  const maintenanceCost = Number(report?.maintenanceSummary?.totalCost || 0);
  const fuelExpense = Number(report?.fuelSummary?.totalExpense || 0);

  return [
    {
      title: "Quick Stats",
      accent: "#7f1d1d",
      rows: [
        ["Active Students", formatNumber(report?.stats?.currentlyEnrolled || 0), "students"],
        ["Completed/Passed", formatNumber(report?.stats?.completed || 0), "students"],
        [
          "Completion Rate",
          formatNumber(
            report?.stats?.thisMonth
              ? Math.round((Number(report.stats.completed || 0) / Number(report.stats.thisMonth || 1)) * 100)
              : 0
          ),
          "%",
        ],
        ["Total Students", formatNumber(report?.stats?.totalStudents || 0), "students"],
        ["This Month Enrollments", formatNumber(report?.stats?.thisMonth || 0), "enrollments"],
      ],
    },
    {
      title: "Financial Summary",
      accent: "#d4af37",
      rows: [
        ["Total Revenue", 0, "PHP"],
        ["Pending Collections", 0, "PHP"],
        ["Operating Expenses", formatNumber(maintenanceCost + fuelExpense), "PHP"],
        ["Net Profit/Loss", 0, "PHP"],
      ],
    },
    {
      title: "Performance Metrics",
      accent: "#10b981",
      rows: [
        [
          "Completion Rate",
          formatNumber(
            report?.stats?.thisMonth
              ? Math.round((Number(report.stats.completed || 0) / Number(report.stats.thisMonth || 1)) * 100)
              : 0
          ),
          "%",
        ],
        [
          "Pass Rate",
          formatNumber(
            report?.stats?.thisMonth
              ? Math.round((Number(report.stats.completed || 0) / Number(report.stats.thisMonth || 1)) * 100)
              : 0
          ),
          "%",
        ],
        ["Avg Score (TDC)", "N/A", ""],
        ["Dropout Rate", 0, "%"],
      ],
    },
    {
      title: "Vehicle Operations",
      accent: "#3b82f6",
      rows: [
        ["Maintenance Cost", formatNumber(maintenanceCost), "PHP"],
        ["Maintenance Records", formatNumber(report?.maintenanceSummary?.totalRecords || 0), "records"],
        ["Overdue Maintenance", formatNumber(report?.maintenanceSummary?.overdueCount || 0), "records"],
        ["Fuel Expense", formatNumber(fuelExpense), "PHP"],
        ["Fuel Entries", formatNumber(report?.fuelSummary?.totalEntries || 0), "entries"],
        ["Total Liters", formatNumber(report?.fuelSummary?.totalLiters || 0), "L"],
      ],
    },
  ];
}

function escapeCsv(value) {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}

function buildCsvContent(report, meta) {
  const statRows = buildStatRows(report);
  const transactionRows = buildTransactionRows(report);
  const vehicleRows = buildVehicleRows(report);

  const lines = [
    ["GUTS OVERVIEW REPORT"],
    ["Report", meta.title],
    ["Course Filter", meta.courseLabel],
    ["Frequency", meta.frequencyLabel],
    ["Range", `${meta.startDate} to ${meta.endDate}`],
    ["Generated", new Date().toLocaleString()],
    [],
    ["SUMMARY"],
    ["Metric", "Value", "Unit"],
    ...statRows,
    [],
    ["TOP VEHICLE UTILIZATION"],
    ["Vehicle", "Type", "Completed Sessions", "Training Hours"],
    ...(vehicleRows.length ? vehicleRows : [["-", "-", "0", "0h"]]),
    [],
    ["RECENT TRANSACTIONS"],
    ["Time", "Student", "Transaction", "Course", "Instructor", "Remarks"],
    ...(transactionRows.length ? transactionRows : [["-", "No transactions", "-", "-", "-", "-"]]),
  ];

  const csv = lines
    .map((row) => row.map((value) => escapeCsv(value)).join(","))
    .join("\n");

  return `\uFEFF${csv}`;
}

function buildHtmlContent(report, meta) {
  const statRows = buildStatRows(report)
    .map(
      (row) => `
        <tr>
          <td>${escapeHtml(row[0])}</td>
          <td class="value">${escapeHtml(row[1])}</td>
          <td>${escapeHtml(row[2])}</td>
        </tr>`
    )
    .join("");

  const vehicleRows = buildVehicleRows(report)
    .map(
      (row) => `
        <tr>
          <td>${escapeHtml(row[0])}</td>
          <td>${escapeHtml(row[1])}</td>
          <td class="value">${escapeHtml(row[2])}</td>
          <td class="value">${escapeHtml(row[3])}</td>
        </tr>`
    )
    .join("");

  const rows = buildTransactionRows(report)
    .map(
      (row) => `
        <tr>
          <td>${escapeHtml(row[0])}</td>
          <td>${escapeHtml(row[1])}</td>
          <td>${escapeHtml(row[2])}</td>
          <td>${escapeHtml(row[3])}</td>
          <td>${escapeHtml(row[4])}</td>
          <td>${escapeHtml(row[5])}</td>
        </tr>`
    )
    .join("");

  return `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <style>
        body { font-family: "Segoe UI", Tahoma, Arial, sans-serif; color: #0f172a; padding: 20px; background: #eef2f7; }
        .shell { background: #ffffff; border-radius: 18px; padding: 24px; border: 1px solid #dbe3ee; }
        .banner { background: linear-gradient(120deg, ${BRAND.maroon}, #a61b1b 62%, #d4af37); color: #fff; padding: 20px 24px; border-radius: 14px; }
        .banner h1 { margin: 0; font-size: 26px; }
        .banner p { margin: 6px 0 0; opacity: 0.95; font-size: 13px; }
        .cards { display: table; width: 100%; table-layout: fixed; border-spacing: 10px; margin: 16px 0; }
        .card { display: table-cell; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px; }
        .card .label { font-size: 11px; text-transform: uppercase; color: #64748b; letter-spacing: .04em; }
        .card .value { margin-top: 4px; font-size: 20px; font-weight: 700; }
        .section { margin-top: 20px; }
        .section h3 { margin: 0 0 8px; color: ${BRAND.maroon}; }
        table { width: 100%; border-collapse: collapse; background: #fff; }
        th, td { border: 1px solid #dbe2ea; padding: 8px 10px; font-size: 12px; text-align: left; vertical-align: top; }
        th { background: #f1f5f9; font-weight: 700; }
        td.value { font-weight: 700; }
        .foot { margin-top: 14px; font-size: 11px; color: #64748b; }
      </style>
    </head>
    <body>
      <div class="shell">
        <div class="banner">
          <h1>${escapeHtml(meta.title)}</h1>
          <p>${escapeHtml(meta.courseLabel)} | ${escapeHtml(meta.frequencyLabel)} | ${escapeHtml(meta.startDate)} to ${escapeHtml(meta.endDate)}</p>
        </div>

        <div class="cards">
          <div class="card"><div class="label">Students</div><div class="value">${formatNumber(report.stats.totalStudents)}</div></div>
          <div class="card"><div class="label">Completed</div><div class="value">${formatNumber(report.stats.completed)}</div></div>
          <div class="card"><div class="label">Completion Rate</div><div class="value">${formatPercent(report.stats.thisMonth ? Math.round((report.stats.completed / report.stats.thisMonth) * 100) : 0)}</div></div>
          <div class="card"><div class="label">Operating Expense</div><div class="value">${formatMoney((report.maintenanceSummary?.totalCost || 0) + (report.fuelSummary?.totalExpense || 0))}</div></div>
        </div>

        <div class="section">
          <h3>Summary Metrics</h3>
          <table cellpadding="8" cellspacing="0">
            <thead>
              <tr><th>Metric</th><th>Value</th><th>Unit</th></tr>
            </thead>
            <tbody>${statRows}</tbody>
          </table>
        </div>

        <div class="section">
          <h3>Top Vehicle Utilization</h3>
          <table cellpadding="8" cellspacing="0">
            <thead>
              <tr><th>Vehicle</th><th>Type</th><th>Completed Sessions</th><th>Training Hours</th></tr>
            </thead>
            <tbody>${vehicleRows || "<tr><td colspan='4'>No vehicle usage records in this range.</td></tr>"}</tbody>
          </table>
        </div>

        <div class="section">
          <h3>Recent Transactions</h3>
          <table cellpadding="6" cellspacing="0">
            <thead>
              <tr>
                <th>Time</th>
                <th>Student</th>
                <th>Transaction</th>
                <th>Course</th>
                <th>Instructor</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>${rows || "<tr><td colspan='6'>No transactions in this range.</td></tr>"}</tbody>
          </table>
        </div>

        <div class="foot">Generated from GUTS Overview Reports dashboard.</div>
      </div>
    </body>
  </html>`;
}

function buildEmailBodyHtml(report, meta) {
  const completionRate = report.stats.thisMonth
    ? Math.round((Number(report.stats.completed || 0) / Number(report.stats.thisMonth || 1)) * 100)
    : 0;

  const recent = buildTransactionRows(report)
    .slice(0, 8)
    .map(
      (row, index) => `<tr>
        <td style="padding:8px;border-bottom:1px solid #e2e8f0;">${index + 1}</td>
        <td style="padding:8px;border-bottom:1px solid #e2e8f0;">${escapeHtml(row[1])}</td>
        <td style="padding:8px;border-bottom:1px solid #e2e8f0;">${escapeHtml(row[2])}</td>
        <td style="padding:8px;border-bottom:1px solid #e2e8f0;">${escapeHtml(row[0])}</td>
      </tr>`
    )
    .join("");

  return `
    <div style="font-family:Segoe UI,Tahoma,Arial,sans-serif;background:#f1f5f9;padding:22px;">
      <div style="max-width:780px;margin:0 auto;background:#ffffff;border:1px solid #dbe4ef;border-radius:16px;overflow:hidden;">
        <div style="padding:22px 24px;background:linear-gradient(120deg,${BRAND.maroon},#a61b1b 62%,#d4af37);color:#fff;">
          <h2 style="margin:0;font-size:24px;">${escapeHtml(meta.title)}</h2>
          <p style="margin:6px 0 0;font-size:13px;opacity:.96;">${escapeHtml(meta.courseLabel)} | ${escapeHtml(meta.frequencyLabel)} | ${escapeHtml(meta.startDate)} to ${escapeHtml(meta.endDate)}</p>
        </div>
        <div style="padding:18px 24px;">
          <table style="width:100%;border-collapse:separate;border-spacing:8px 8px;">
            <tr>
              <td style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:12px;"><div style="font-size:11px;color:#64748b;">TOTAL STUDENTS</div><div style="font-size:20px;font-weight:700;">${formatNumber(report.stats.totalStudents)}</div></td>
              <td style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:12px;"><div style="font-size:11px;color:#64748b;">COMPLETED</div><div style="font-size:20px;font-weight:700;">${formatNumber(report.stats.completed)}</div></td>
              <td style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:12px;"><div style="font-size:11px;color:#64748b;">COMPLETION RATE</div><div style="font-size:20px;font-weight:700;">${formatPercent(completionRate)}</div></td>
              <td style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:12px;"><div style="font-size:11px;color:#64748b;">OPERATING EXPENSE</div><div style="font-size:20px;font-weight:700;">${formatMoney((report.maintenanceSummary?.totalCost || 0) + (report.fuelSummary?.totalExpense || 0))}</div></td>
            </tr>
          </table>

          <h3 style="margin:18px 0 8px;color:${BRAND.maroon};">Recent Transactions</h3>
          <table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;">
            <thead>
              <tr style="background:#f8fafc;">
                <th style="text-align:left;padding:8px;font-size:12px;">#</th>
                <th style="text-align:left;padding:8px;font-size:12px;">Student</th>
                <th style="text-align:left;padding:8px;font-size:12px;">Transaction</th>
                <th style="text-align:left;padding:8px;font-size:12px;">Time</th>
              </tr>
            </thead>
            <tbody>${recent || "<tr><td colspan='4' style='padding:10px;'>No transactions in this period.</td></tr>"}</tbody>
          </table>

          <p style="margin:14px 0 0;color:#64748b;font-size:12px;">Your detailed report file is attached (${escapeHtml(meta.fileFormat.toUpperCase())}).</p>
        </div>
      </div>
    </div>
  `;
}

function drawHeader(doc, meta) {
  doc.save();
  doc.rect(0, 0, doc.page.width, 84).fill(BRAND.maroon);
  doc.fillColor("#ffffff").fontSize(20).font("Helvetica-Bold").text(meta.title, 42, 26);
  doc
    .font("Helvetica")
    .fontSize(9)
    .text(`${meta.courseLabel} | ${meta.frequencyLabel} | ${meta.startDate} to ${meta.endDate}`, 42, 54);
  doc.restore();
}

function drawStatCards(doc, report) {
  const completionRate = report.stats.thisMonth
    ? Math.round((Number(report.stats.completed || 0) / Number(report.stats.thisMonth || 1)) * 100)
    : 0;
  const cards = [
    ["Total Students", formatNumber(report.stats.totalStudents)],
    ["Completed", formatNumber(report.stats.completed)],
    ["Completion Rate", formatPercent(completionRate)],
    ["Operating Expense", formatMoney((report.maintenanceSummary?.totalCost || 0) + (report.fuelSummary?.totalExpense || 0))],
    ["Active Students", formatNumber(report.stats.currentlyEnrolled)],
    ["Pass Rate", formatPercent(completionRate)],
  ];

  const startX = 42;
  const gap = 10;
  const perRow = 3;
  const cardWidth = (doc.page.width - startX * 2 - gap * (perRow - 1)) / perRow;
  const top = 98;
  const cardHeight = 54;

  cards.forEach((item, index) => {
    const row = Math.floor(index / perRow);
    const col = index % perRow;
    const x = startX + col * (cardWidth + gap);
    const y = top + row * (cardHeight + 10);
    doc.roundedRect(x, y, cardWidth, cardHeight, 8).fillAndStroke(BRAND.paper, "#dbe4ef");
    doc.fillColor(BRAND.slate).fontSize(7).font("Helvetica-Bold").text(item[0].toUpperCase(), x + 9, y + 9, { width: cardWidth - 18 });
    doc.fillColor(BRAND.navy).fontSize(13).font("Helvetica-Bold").text(item[1], x + 9, y + 28, { width: cardWidth - 18 });
  });

  return top + cardHeight * 2 + 24;
}

function ensureSpaceForBlock(doc, y, requiredHeight, headerMeta) {
  if (y + requiredHeight <= doc.page.height - 44) {
    return y;
  }

  doc.addPage();
  drawHeader(doc, headerMeta);
  return 98;
}

function drawMonthlyEnrollmentChart(doc, { report, startY, headerMeta }) {
  let y = ensureSpaceForBlock(doc, startY, 186, headerMeta);
  const left = 42;
  const panelWidth = doc.page.width - 84;
  const panelHeight = 150;
  const chartPadding = 14;
  const chartLeft = left + chartPadding;
  const chartTop = y + 38;
  const chartWidth = panelWidth - chartPadding * 2;
  const chartHeight = panelHeight - 48;

  const seriesRows = Array.isArray(report?.monthlyEnrollment) && report.monthlyEnrollment.length > 0
    ? report.monthlyEnrollment
    : Array.from({ length: 12 }, (_, month) => ({ month, tdc: 0, pdcBeginner: 0, pdcExperience: 0 }));

  const normalizedRows = Array.from({ length: 12 }, (_, month) => {
    const row = seriesRows.find((item) => Number(item?.month) === month) || {};
    return {
      month,
      tdc: Number(row.tdc || 0),
      pdcBeginner: Number(row.pdcBeginner || 0),
      pdcExperience: Number(row.pdcExperience || 0),
    };
  });

  const maxValue = Math.max(
    1,
    ...normalizedRows.flatMap((row) => [row.tdc, row.pdcBeginner, row.pdcExperience])
  );

  doc.fillColor(BRAND.maroon).fontSize(11).font("Helvetica-Bold").text("Enrollment Trend (Monthly)", left, y);
  doc.roundedRect(left, y + 16, panelWidth, panelHeight, 10).fillAndStroke("#ffffff", "#dbe4ef");

  // Axes
  doc.strokeColor("#94a3b8").lineWidth(1);
  doc.moveTo(chartLeft, chartTop + chartHeight).lineTo(chartLeft + chartWidth, chartTop + chartHeight).stroke();
  doc.moveTo(chartLeft, chartTop).lineTo(chartLeft, chartTop + chartHeight).stroke();

  const groupWidth = chartWidth / 12;
  const gapInGroup = 3;
  const barWidth = Math.max(3, (groupWidth - 8) / 3);
  const colors = ["#7f1d1d", "#d4af37", "#10b981"];

  normalizedRows.forEach((row, monthIndex) => {
    const baseX = chartLeft + monthIndex * groupWidth + 4;
    const values = [row.tdc, row.pdcBeginner, row.pdcExperience];

    values.forEach((value, seriesIndex) => {
      const ratio = value / maxValue;
      const barHeight = Math.max(2, ratio * (chartHeight - 14));
      const barX = baseX + seriesIndex * (barWidth + gapInGroup);
      const barY = chartTop + chartHeight - barHeight;
      doc.rect(barX, barY, barWidth, barHeight).fill(colors[seriesIndex]);
    });

    doc.fillColor(BRAND.slate)
      .fontSize(6.5)
      .font("Helvetica")
      .text(MONTH_LABELS[monthIndex], baseX - 1, chartTop + chartHeight + 4, { width: groupWidth, align: "left" });
  });

  // Legend
  const legendY = y + panelHeight - 12;
  const legendItems = [
    { label: "TDC", color: colors[0] },
    { label: "PDC Beginner", color: colors[1] },
    { label: "PDC Experience", color: colors[2] },
  ];
  let legendX = left + 12;
  legendItems.forEach((item) => {
    doc.rect(legendX, legendY, 8, 8).fill(item.color);
    doc.fillColor(BRAND.slate).fontSize(7).font("Helvetica").text(item.label, legendX + 12, legendY - 1);
    legendX += item.label.length * 4.6 + 36;
  });

  return y + panelHeight + 18;
}

function drawCourseDistributionChart(doc, { report, startY, headerMeta }) {
  let y = ensureSpaceForBlock(doc, startY, 118, headerMeta);
  const left = 42;
  const panelWidth = doc.page.width - 84;
  const panelHeight = 88;

  const tdc = Number(report?.stats?.tdc || 0);
  const pdcBeginner = Number(report?.stats?.pdcBeginner || 0);
  const pdcExperience = Number(report?.stats?.pdcExperience || 0);
  const items = [
    { key: "TDC", value: tdc, color: "#7f1d1d" },
    { key: "PDC Beginner", value: pdcBeginner, color: "#d4af37" },
    { key: "PDC Experience", value: pdcExperience, color: "#10b981" },
  ];
  const maxValue = Math.max(1, ...items.map((item) => item.value));

  doc.fillColor(BRAND.maroon).fontSize(11).font("Helvetica-Bold").text("Course Distribution", left, y);
  doc.roundedRect(left, y + 16, panelWidth, panelHeight, 10).fillAndStroke("#ffffff", "#dbe4ef");

  let rowY = y + 28;
  items.forEach((item) => {
    doc.fillColor(BRAND.slate).fontSize(8).font("Helvetica-Bold").text(item.key, left + 12, rowY + 2, { width: 90 });

    const trackX = left + 110;
    const trackW = panelWidth - 186;
    const ratio = item.value / maxValue;
    doc.roundedRect(trackX, rowY + 1, trackW, 10, 3).fillAndStroke("#e2e8f0", "#e2e8f0");
    doc.roundedRect(trackX, rowY + 1, Math.max(5, trackW * ratio), 10, 3).fill(item.color);

    doc.fillColor(BRAND.navy).fontSize(8).font("Helvetica").text(String(item.value), left + panelWidth - 56, rowY + 2, { width: 40, align: "right" });
    rowY += 21;
  });

  return y + panelHeight + 16;
}

function hexToRgb(hex) {
  const clean = String(hex || "").replace("#", "");
  if (clean.length !== 6) return [15, 23, 42];
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
  ];
}

function estimateTableBlockHeight(rowCount) {
  const safeRows = Math.max(1, Number(rowCount || 0));
  const titleHeight = 14;
  const headerHeight = 19;
  const rowHeight = 19;
  const endPadding = 8;
  return titleHeight + headerHeight + (safeRows * rowHeight) + endPadding;
}

function drawTable(doc, { headers, rows, startY, title, widths, headerMeta, accent = "#0f172a", left = 42, allowPageSplit = true }) {
  let y = startY;
  const rowHeight = 24;
  const [r, g, b] = hexToRgb(accent);

  doc.fillColor(accent).fontSize(12).font("Helvetica-Bold").text(title, left, y);
  y += 16;

  const requestedWidths = Array.isArray(widths) && widths.length === headers.length
    ? widths
    : headers.map(() => 100);
  const availableWidth = doc.page.width - left * 2;
  const requestedTableWidth = requestedWidths.reduce((sum, value) => sum + value, 0);
  const scale = requestedTableWidth > availableWidth ? availableWidth / requestedTableWidth : 1;
  const effectiveWidths = requestedWidths.map((value) => Math.max(44, Math.floor(value * scale)));
  const tableWidth = effectiveWidths.reduce((sum, value) => sum + value, 0);

  const renderHeader = () => {
    doc.rect(left, y, tableWidth, rowHeight).fillColor(r, g, b).fill();
    let x = left;
    headers.forEach((header, index) => {
      doc.fillColor("#ffffff").fontSize(9).font("Helvetica-Bold").text(header, x + 6, y + 7, {
        width: effectiveWidths[index] - 12,
      });
      x += effectiveWidths[index];
    });
    y += rowHeight;
  };

  renderHeader();

  const emptyRow = headers.map((_, index) => (index === 0 ? "No records" : "-"));
  const safeRows = rows.length ? rows : [emptyRow];

  safeRows.forEach((row, rowIndex) => {
    if (allowPageSplit && y > doc.page.height - 60) {
      doc.addPage();
      drawHeader(doc, headerMeta);
      y = CONTENT_START_Y;
      renderHeader();
    }

    doc.rect(left, y, tableWidth, rowHeight).fill(rowIndex % 2 === 0 ? "#ffffff" : BRAND.paper);

    let x = left;
    headers.forEach((_, index) => {
      const cell = row[index];
      const columnWidth = effectiveWidths[index] || 80;
      doc.fillColor(BRAND.navy).fontSize(9).font("Helvetica").text(String(cell ?? "-"), x + 6, y + 7, {
        width: columnWidth - 12,
      });
      x += columnWidth;
    });

    y += rowHeight;
  });

  return y + 8;
}

function buildPdfBuffer(report, meta) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 0, size: "A4", layout: "landscape", bufferPages: true });
    const chunks = [];
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    drawHeader(doc, meta);
    let y = drawStatCards(doc, report);

    y = drawMonthlyEnrollmentChart(doc, { report, startY: y, headerMeta: meta });
    y = drawCourseDistributionChart(doc, { report, startY: y, headerMeta: meta });

    const sections = buildDashboardSections(report);
    const leftColumnX = 34;
    const tableWidth = pageWidth - leftColumnX * 2;
    const fullWidths = [
      Math.floor(tableWidth * 0.52),
      Math.floor(tableWidth * 0.24),
      tableWidth - Math.floor(tableWidth * 0.52) - Math.floor(tableWidth * 0.24),
    ];
    const sectionTopMargin = 14;
    let sectionY = y;

    for (const section of sections) {
      const estimated = estimateTableBlockHeight(section?.rows?.length);
      if (sectionY + estimated > pageHeight - 28) {
        doc.addPage();
        drawHeader(doc, meta);
        sectionY = CONTENT_START_Y;
      }

      sectionY = drawTable(doc, {
        title: section.title,
        headers: ["Metric", "Value", "Unit"],
        rows: section.rows,
        startY: sectionY,
        widths: fullWidths,
        headerMeta: meta,
        accent: section.accent,
        left: leftColumnX,
        allowPageSplit: false,
      }) + sectionTopMargin;
    }

    doc.fillColor(BRAND.slate).fontSize(8).font("Helvetica").text(
      "Generated from GUTS Overview Reports dashboard",
      42,
      Math.min(sectionY + 4, doc.page.height - 20)
    );

    doc.end();
  });
}

async function buildAttachment(report, meta) {
  if (meta.fileFormat === "excel") {
    return {
      filename: `${meta.fileBase}.xls`,
      contentType: "application/vnd.ms-excel",
      content: buildHtmlContent(report, meta),
    };
  }

  if (meta.fileFormat === "pdf") {
    return {
      filename: `${meta.fileBase}.pdf`,
      contentType: "application/pdf",
      content: await buildPdfBuffer(report, meta),
    };
  }

  return {
    filename: `${meta.fileBase}.csv`,
    contentType: "text/csv",
    content: buildCsvContent(report, meta),
  };
}

async function sendReportEmailNow({ recipients, frequency, fileFormat, course = "overall", requestedByUserId = null, isTest = false }) {
  const normalizedRecipients = Array.from(new Set((recipients || []).map((recipient) => String(recipient || "").trim()).filter(Boolean)));
  if (normalizedRecipients.length === 0) {
    const error = new Error("At least one valid recipient is required");
    error.status = 400;
    throw error;
  }

  const meta = {
    title: isTest ? "GUTS Report Test Email" : "GUTS Scheduled Report",
    courseLabel: getCourseLabel(course),
    frequencyLabel: getFrequencyLabel(frequency),
    fileFormat: String(fileFormat || "csv").toLowerCase(),
  };
  const { startDate, endDate } = getFrequencyWindow(frequency);
  meta.startDate = startDate;
  meta.endDate = endDate;
  meta.fileBase = `${meta.courseLabel.replace(/\s+/g, "-").toLowerCase()}-${meta.frequencyLabel}-report`;

  const report = await getOverviewReports({ startDate, endDate, courseFilter: course });
  const attachment = await buildAttachment(report, meta);
  const html = buildEmailBodyHtml(report, meta);
  const text = [
    meta.title,
    `${meta.courseLabel} | ${meta.frequencyLabel}`,
    `${meta.startDate} to ${meta.endDate}`,
    `Total Students: ${report.stats.totalStudents}`,
    `Currently Enrolled: ${report.stats.currentlyEnrolled}`,
    `Completed: ${report.stats.completed}`,
  ].join("\n");

  const info = await sendMail({
    to: normalizedRecipients.join(", "),
    subject: `${meta.title} - ${meta.courseLabel}`,
    html,
    text,
    attachments: [attachment],
  });

  if (!isSmtpConfigured()) {
    logger.warn("report_email_preview_sent", {
      requestedByUserId,
      recipients: normalizedRecipients,
      fileFormat: meta.fileFormat,
      course,
    });
  }

  return {
    message: isTest ? "Test report email sent" : "Report email sent",
    recipients: normalizedRecipients,
    course,
    frequency,
    fileFormat: meta.fileFormat,
    reportRange: { startDate, endDate },
    transportMode: isSmtpConfigured() ? "smtp" : "json-preview",
    messageId: info.messageId || null,
  };
}

async function dispatchDueReportSchedules(now = new Date()) {
  const dueSchedules = await ReportSchedule.findAll({
    where: {
      is_active: true,
      status: "scheduled",
      next_run_at: {
        [Op.lte]: now,
      },
    },
    order: [["next_run_at", "ASC"], ["id", "ASC"]],
  });

  let sentCount = 0;
  let failedCount = 0;

  for (const schedule of dueSchedules) {
    try {
      const payload = await sendReportEmailNow({
        recipients: schedule.recipients,
        frequency: schedule.frequency,
        fileFormat: schedule.file_format,
        course: schedule.course,
        requestedByUserId: schedule.created_by_user_id,
        isTest: false,
      });

      const currentRunAt = new Date(schedule.next_run_at || now);
      await schedule.update({
        last_sent_at: now,
        next_run_at: getNextRunAt(currentRunAt, schedule.frequency),
        status: "scheduled",
        is_active: true,
      });

      sentCount += 1;
      logger.info("report_schedule_sent", {
        scheduleId: schedule.id,
        recipients: schedule.recipients,
        course: schedule.course,
        fileFormat: schedule.file_format,
        transportMode: payload.transportMode,
      });
    } catch (error) {
      failedCount += 1;
      logger.error("report_schedule_failed", {
        scheduleId: schedule.id,
        recipients: schedule.recipients,
        course: schedule.course,
        error,
      });
    }
  }

  return {
    scannedCount: dueSchedules.length,
    sentCount,
    failedCount,
  };
}

module.exports = {
  dispatchDueReportSchedules,
  sendReportEmailNow,
};
