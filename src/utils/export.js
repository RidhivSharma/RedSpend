import { formatDate, formatMonthKey, toDate } from "./dateHelpers";

const CSV_HEADERS = ["Date", "Type", "Category", "Note", "Amount"];

const PDF_CURRENCY_SYMBOLS = { USD: "$", EUR: "€", GBP: "£", JPY: "¥" };

function localIsoDate(value) {
  const date = toDate(value);
  if (!date) return "";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
}

function todayStamp() {
  return localIsoDate(new Date());
}

function escapeCSVValue(value) {
  const text = value === null || value === undefined ? "" : String(value);
  if (/[",\r\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function exportTransactionsCSV(
  transactions = [],
  filename = `spendwise-transactions-${todayStamp()}.csv`
) {
  const list = Array.isArray(transactions) ? transactions : [];
  const rows = list.map((transaction) => [
    localIsoDate(transaction?.date),
    transaction?.type === "income" ? "Income" : "Expense",
    transaction?.categoryName || "Uncategorized",
    transaction?.note || "",
    Number.isFinite(Number(transaction?.amount))
      ? Number(transaction.amount)
      : 0,
  ]);

  const csv = [CSV_HEADERS, ...rows]
    .map((row) => row.map(escapeCSVValue).join(","))
    .join("\r\n");

  downloadBlob(
    new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" }),
    filename
  );
}

function pdfMoney(amount, currency = "INR") {
  const value = Number(amount);
  const safeValue = Number.isFinite(value) ? value : 0;
  let formatted;
  try {
    formatted = new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(safeValue);
  } catch {
    formatted = safeValue.toFixed(2);
  }

  const code = String(currency || "INR").toUpperCase();
  const symbol = PDF_CURRENCY_SYMBOLS[code];
  return symbol ? `${symbol}${formatted}` : `${code} ${formatted}`;
}

function changeLabel(row) {
  if (row.change === null || row.change === undefined) {
    return row.previous === 0 && row.value > 0 ? "New" : "—";
  }
  const rounded = Math.round(row.change);
  if (rounded === 0) return "0%";
  return `${rounded > 0 ? "+" : ""}${rounded}%`;
}

export async function exportMonthlyReportPDF(
  reportData = {},
  month,
  currency = "INR"
) {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);

  const { summary = {}, categories = [], transactions = [] } =
    reportData || {};
  const money = (amount) => pdfMoney(amount, currency);

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const sortedTransactions = [
    ...(Array.isArray(transactions) ? transactions : []),
  ].sort(
    (a, b) => (toDate(b?.date)?.getTime() ?? 0) - (toDate(a?.date)?.getTime() ?? 0)
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42);
  doc.text("Monthly Report", 14, 20);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(100, 116, 139);
  doc.text(formatMonthKey(month), 14, 27);

  autoTable(doc, {
    startY: 34,
    head: [["Summary", ""]],
    body: [
      ["Income", money(summary.income)],
      ["Expenses", money(summary.expense)],
      ["Net balance", money(summary.net)],
      [
        "Savings rate",
        summary.savingsRate === null || summary.savingsRate === undefined
          ? "—"
          : `${summary.savingsRate}%`,
      ],
    ],
    theme: "grid",
    tableWidth: 110,
    styles: {
      font: "helvetica",
      fontSize: 10,
      cellPadding: 2.5,
      textColor: [15, 23, 42],
    },
    headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: "bold" },
    columnStyles: { 1: { halign: "right" } },
  });

  let cursorY = doc.lastAutoTable.finalY + 12;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text("Category breakdown", 14, cursorY);

  if (categories.length > 0) {
    autoTable(doc, {
      startY: cursorY + 4,
      head: [["Category", "Amount", "% of total", "Change vs last month"]],
      body: categories.map((row) => [
        row.label,
        money(row.value),
        `${Math.round(Number(row.share) || 0)}%`,
        changeLabel(row),
      ]),
      theme: "striped",
      styles: {
        font: "helvetica",
        fontSize: 9.5,
        cellPadding: 2.2,
        textColor: [15, 23, 42],
      },
      headStyles: {
        fillColor: [79, 70, 229],
        textColor: 255,
        fontStyle: "bold",
      },
      columnStyles: {
        1: { halign: "right" },
        2: { halign: "right" },
        3: { halign: "right" },
      },
    });
    cursorY = doc.lastAutoTable.finalY + 12;
  } else {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text("No expenses recorded for this month.", 14, cursorY + 4);
    cursorY += 16;
  }

  if (cursorY > pageHeight - 45) {
    doc.addPage();
    cursorY = 20;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text("Transactions", 14, cursorY);

  if (sortedTransactions.length > 0) {
    autoTable(doc, {
      startY: cursorY + 4,
      head: [["Date", "Type", "Category", "Note", "Amount"]],
      body: sortedTransactions.map((transaction) => [
        formatDate(transaction.date),
        transaction.type === "income" ? "Income" : "Expense",
        transaction.categoryName || "Uncategorized",
        transaction.note || "",
        money(transaction.amount),
      ]),
      theme: "striped",
      styles: {
        font: "helvetica",
        fontSize: 9,
        cellPadding: 2.2,
        textColor: [15, 23, 42],
        overflow: "linebreak",
      },
      headStyles: {
        fillColor: [79, 70, 229],
        textColor: 255,
        fontStyle: "bold",
      },
      columnStyles: {
        0: { cellWidth: 24 },
        1: { cellWidth: 18 },
        2: { cellWidth: 36 },
        4: { cellWidth: 30, halign: "right" },
      },
    });
  } else {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text("No transactions recorded for this month.", 14, cursorY + 4);
  }

  const pageCount = doc.getNumberOfPages();
  for (let index = 1; index <= pageCount; index += 1) {
    doc.setPage(index);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text(`Page ${index} of ${pageCount}`, pageWidth / 2, pageHeight - 8, {
      align: "center",
    });
  }

  doc.save(`spendwise-report-${month}.pdf`);
}
