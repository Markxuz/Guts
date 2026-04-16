import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const BRAND = {
  maroon: [128, 0, 0],
  gold: [212, 175, 55],
  slate: [15, 23, 42],
  blue: [59, 130, 246],
  green: [16, 185, 129],
  amber: [245, 158, 11],
};

function formatMoney(value) {
  return `PHP ${Number(value || 0).toLocaleString()}`;
}

function formatPlain(value) {
  return Number(value || 0).toLocaleString();
}

function formatPercent(value) {
  return `${Number(value || 0).toLocaleString()}%`;
}

function buildDefaultSections({ stats, completionRate, passRate, maintenanceSummary, fuelSummary }) {
  return [
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
}

function drawPdfCard(doc, x, y, width, height, label, value, unit, fillColor) {
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(x, y, width, height, 8, 8, "F");
  doc.setDrawColor(fillColor[0], fillColor[1], fillColor[2]);
  doc.setLineWidth(1);
  doc.roundedRect(x, y, width, height, 8, 8, "S");
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8);
  doc.text(label.toUpperCase(), x + 10, y + 13);
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(15);
  doc.text(String(value), x + 10, y + 31);
  if (unit) {
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(unit, x + 10, y + 45);
  }
}

export function downloadOverviewReportPdf({
  courseLabel,
  stats,
  completionRate,
  passRate,
  maintenanceSummary,
  fuelSummary,
  sections,
  generatedAt,
}) {
  const doc = new jsPDF({ unit: "pt", format: "a4", orientation: "landscape" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const nowLabel = generatedAt || new Date().toLocaleString();

  const safeStats = stats || {
    currentlyEnrolled: 0,
    completed: 0,
    totalStudents: 0,
    thisMonth: 0,
  };
  const safeMaintenanceSummary = maintenanceSummary || {
    totalCost: 0,
    totalRecords: 0,
    overdueCount: 0,
  };
  const safeFuelSummary = fuelSummary || {
    totalExpense: 0,
    totalEntries: 0,
    totalLiters: 0,
  };
  const safeSections = sections || buildDefaultSections({
    stats: safeStats,
    completionRate,
    passRate,
    maintenanceSummary: safeMaintenanceSummary,
    fuelSummary: safeFuelSummary,
  });

  doc.setFillColor(BRAND.maroon[0], BRAND.maroon[1], BRAND.maroon[2]);
  doc.rect(0, 0, pageWidth, 70, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(19);
  doc.text("Overview Reports Summary", 34, 30);
  doc.setFontSize(10);
  doc.text(`Course Filter: ${courseLabel}`, 34, 47);
  doc.text(`Generated: ${nowLabel}`, 34, 61);

  doc.setTextColor(15, 23, 42);
  const cardY = 84;
  const cardH = 52;
  const gap = 10;
  const cardW = (pageWidth - 34 * 2 - gap * 2) / 3;

  drawPdfCard(doc, 34, cardY, cardW, cardH, "Active Students", formatPlain(safeStats.currentlyEnrolled), "students", BRAND.maroon);
  drawPdfCard(doc, 34 + cardW + gap, cardY, cardW, cardH, "Completed", formatPlain(safeStats.completed), "students", BRAND.gold);
  drawPdfCard(doc, 34 + (cardW + gap) * 2, cardY, cardW, cardH, "Completion Rate", formatPercent(completionRate), "", BRAND.green);
  drawPdfCard(doc, 34, cardY + cardH + 10, cardW, cardH, "Total Students", formatPlain(safeStats.totalStudents), "students", BRAND.blue);
  drawPdfCard(doc, 34 + cardW + gap, cardY + cardH + 10, cardW, cardH, "Operating Expenses", formatMoney(safeMaintenanceSummary.totalCost + safeFuelSummary.totalExpense), "PHP", BRAND.amber);
  drawPdfCard(doc, 34 + (cardW + gap) * 2, cardY + cardH + 10, cardW, cardH, "Pass Rate", formatPercent(passRate), "", BRAND.slate);

  let currentY = cardY + cardH * 2 + 20;
  safeSections.forEach((section, index) => {
    doc.setFontSize(11);
    doc.setTextColor(section.accent[0], section.accent[1], section.accent[2]);
    doc.text(section.title, 34, currentY);

    autoTable(doc, {
      startY: currentY + 8,
      head: [["Metric", "Value", "Unit"]],
      body: section.rows.map((row) => [row[0], row[1], row[2] || ""]),
      styles: {
        fontSize: 8,
        cellPadding: 5,
        textColor: [15, 23, 42],
      },
      headStyles: {
        fillColor: section.accent,
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: 34, right: 34 },
      tableWidth: pageWidth - 68,
      didDrawPage: (hookData) => {
        if (hookData.pageNumber > 1) {
          doc.setFontSize(9);
          doc.setTextColor(100, 116, 139);
          doc.text(`Overview Reports Summary - ${courseLabel}`, 34, 24);
        }
      },
    });

    currentY = doc.lastAutoTable.finalY + 12;
    if (index < safeSections.length - 1 && currentY > pageHeight - 92) {
      doc.addPage();
      currentY = 34;
    }
  });

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("Generated from the Overview Reports dashboard.", 34, doc.internal.pageSize.getHeight() - 18);
  doc.save(`overview-reports-${courseLabel}-${new Date().toISOString().slice(0, 10)}.pdf`);
}
