import React, { useState } from "react";
import { VehicleProjectReport, FinancialProjections } from "../types";
import { calculateProjections, formatINR } from "../utils/finance";
import { 
  FileText, 
  Download, 
  Printer, 
  Table, 
  Eye, 
  EyeOff, 
  ChevronRight,
  Sparkles,
  TrendingDown,
  Percent,
  Calendar,
  IndianRupee,
  X,
  ExternalLink,
  Check,
  Info
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from "recharts";

interface ReportPreviewProps {
  report: VehicleProjectReport;
  triggerPrintCount?: number;
}

export default function ReportPreview({ report, triggerPrintCount }: ReportPreviewProps) {
  const [showAmortization, setShowAmortization] = useState(false);
  const [activePreviewSection, setActivePreviewSection] = useState<"all" | "narrative" | "financials">("all");
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [isInIframe, setIsInIframe] = useState(false);
  const [printError, setPrintError] = useState<string | null>(null);
  const [docTemplate, setDocTemplate] = useState<"classic" | "modern" | "editorial" | "tech">("classic");

  const getTemplateStyles = () => {
    switch (docTemplate) {
      case "modern":
        return {
          "--doc-font-body": "var(--font-sans)",
          "--doc-font-heading": "var(--font-sans)",
          "--doc-color-primary": "#1d4ed8", // blue-700
          "--doc-color-heading": "#1e3a8a", // blue-900
          "--doc-color-text": "#334155", // slate-700
          "--doc-bg-header": "#eff6ff", // blue-50
          "--doc-border-color": "#cbd5e1", // border slate
          "--doc-border-style": "solid",
          "--doc-border-width": "1px",
          "--doc-cover-border": "none",
          "--doc-cover-decor": "block",
        } as React.CSSProperties;
      case "editorial":
        return {
          "--doc-font-body": "var(--font-serif)",
          "--doc-font-heading": "var(--font-serif)",
          "--doc-color-primary": "#b45309", // amber-700
          "--doc-color-heading": "#451a03", // amber-950
          "--doc-color-text": "#451a03", // amber-950
          "--doc-bg-header": "#fef3c7", // amber-100
          "--doc-border-color": "#fcd34d", // amber-300
          "--doc-border-style": "solid",
          "--doc-border-width": "1px",
          "--doc-cover-border": "2px solid #fcd34d",
          "--doc-cover-decor": "none",
        } as React.CSSProperties;
      case "tech":
        return {
          "--doc-font-body": "var(--font-mono)",
          "--doc-font-heading": "var(--font-mono)",
          "--doc-color-primary": "#047857", // emerald-700
          "--doc-color-heading": "#064e3b", // emerald-950
          "--doc-color-text": "#0f172a", // slate-900
          "--doc-bg-header": "#f1f5f9", // slate-100
          "--doc-border-color": "#0f172a", // slate-900 / dark
          "--doc-border-style": "solid",
          "--doc-border-width": "1.5px",
          "--doc-cover-border": "2px solid #0f172a",
          "--doc-cover-decor": "none",
        } as React.CSSProperties;
      case "classic":
      default:
        return {
          "--doc-font-body": "var(--font-serif)",
          "--doc-font-heading": "var(--font-sans)",
          "--doc-color-primary": "#0f172a", // slate-950
          "--doc-color-heading": "#0f172a",
          "--doc-color-text": "#1e293b",
          "--doc-bg-header": "#f1f5f9",
          "--doc-border-color": "#cbd5e1",
          "--doc-border-style": "solid",
          "--doc-border-width": "1px",
          "--doc-cover-border": "double 4px #475569",
          "--doc-cover-decor": "none",
        } as React.CSSProperties;
    }
  };

  React.useEffect(() => {
    try {
      setIsInIframe(window.self !== window.top);
    } catch (e) {
      setIsInIframe(true);
    }
  }, []);

  React.useEffect(() => {
    if (triggerPrintCount !== undefined && triggerPrintCount > 0) {
      setShowPrintModal(true);
    }
  }, [triggerPrintCount]);

  const projections = calculateProjections(report);
  const {
    fyLabels,
    activeDays,
    hireCharges,
    revenues,
    fuelCosts,
    driverSalaries,
    foodCosts,
    repairsCosts,
    taxCosts,
    otherCosts,
    totalOperatingExpenses,
    surpluses,
    depreciations,
    interests,
    netProfits,
    drawings,
    capitals,
    debtors,
    currLiabilities,
    wdvList,
    cashBalances,
    investments,
    dscrs,
    emiSchedule,
    averageDscr,
    monthlyEmi,
    capitalizedLoan,
  } = projections;

  const reportYears = fyLabels.length;
  const totalCost = report.baseCost + report.bodyBuilding + report.workingCapital;
  const promoterMargin = Math.max(0, totalCost - report.loanAmount - report.subsidy);

  // Trigger browser print dialog (which uses index.css print queries for vector PDF)
  const handlePrint = () => {
    setShowPrintModal(true);
  };

  const triggerBrowserPrint = () => {
    try {
      setPrintError(null);
      window.focus();
      window.print();
      return true;
    } catch (e: any) {
      console.error("Direct browser print triggered with error:", e);
      const errMsg = e instanceof Error ? e.message : String(e);
      setPrintError(errMsg || "Print blocked by browser iframe security.");
      return false;
    }
  };

  // Export to MS Word with identical styling as the active display template
  const handleExportWord = () => {
    const element = document.getElementById("report-document-body")?.cloneNode(true) as HTMLDivElement;
    if (!element) return;

    // Get style properties for the current template
    const getTemplateStyleValues = (template: "classic" | "modern" | "editorial" | "tech") => {
      switch (template) {
        case "modern":
          return {
            fontBody: "Segoe UI, Arial, Helvetica, sans-serif",
            fontHeading: "Segoe UI, Arial, Helvetica, sans-serif",
            colorPrimary: "#1d4ed8", // blue-700
            colorHeading: "#1e3a8a", // blue-900
            colorText: "#334155", // slate-700
            bgHeader: "#eff6ff", // blue-50
            borderColor: "#cbd5e1", // border slate
            borderStyle: "solid",
            borderWidth: "1px",
            coverBorder: "none",
            coverDecor: "block",
          };
        case "editorial":
          return {
            fontBody: "Georgia, 'Times New Roman', serif",
            fontHeading: "Georgia, 'Times New Roman', serif",
            colorPrimary: "#b45309", // amber-700
            colorHeading: "#451a03", // amber-950
            colorText: "#451a03", // amber-950
            bgHeader: "#fef3c7", // amber-100
            borderColor: "#fcd34d", // amber-300
            borderStyle: "solid",
            borderWidth: "1px",
            coverBorder: "2px solid #fcd34d",
            coverDecor: "none",
          };
        case "tech":
          return {
            fontBody: "Consolas, 'Courier New', Courier, monospace",
            fontHeading: "Consolas, 'Courier New', Courier, monospace",
            colorPrimary: "#047857", // emerald-700
            colorHeading: "#064e3b", // emerald-950
            colorText: "#0f172a", // slate-900
            bgHeader: "#f1f5f9", // slate-100
            borderColor: "#0f172a", // slate-900 / dark
            borderStyle: "solid",
            borderWidth: "1.5px",
            coverBorder: "2px solid #0f172a",
            coverDecor: "none",
          };
        case "classic":
        default:
          return {
            fontBody: "Georgia, 'Times New Roman', serif",
            fontHeading: "Arial, Helvetica, sans-serif",
            colorPrimary: "#0f172a", // slate-950
            colorHeading: "#0f172a",
            colorText: "#1e293b",
            bgHeader: "#f1f5f9",
            borderColor: "#cbd5e1",
            borderStyle: "solid",
            borderWidth: "1px",
            coverBorder: "double 4px #475569",
            coverDecor: "none",
          };
      }
    };

    const styleValues = getTemplateStyleValues(docTemplate);

    // Clean any UI helpers before exporting
    const pageBreaks = element.querySelectorAll(".page-break-indicator");
    pageBreaks.forEach((pb) => pb.parentNode?.removeChild(pb));

    const noPrintElements = element.querySelectorAll(".no-print");
    noPrintElements.forEach((el) => el.parentNode?.removeChild(el));

    // Convert Cover Page to premium Word-compatible table layout so it displays exactly like on-screen
    const coverPage = element.querySelector("#cover-page-section");
    if (coverPage) {
      const isClassic = docTemplate === "classic";
      const debtPct = totalCost > 0 ? Math.round((report.loanAmount / totalCost) * 100) : 0;
      const equityPct = Math.max(0, 100 - debtPct);
      const displayBorder = styleValues.coverBorder !== "none" ? styleValues.coverBorder : "none";

      coverPage.outerHTML = `
        <table style="width: 100%; border: ${displayBorder}; border-collapse: collapse; font-family: ${styleValues.fontBody}; margin-bottom: 40px; background-color: #ffffff;">
          <!-- Top Accent Bar if coverDecor is block -->
          ${styleValues.coverDecor === "block" ? `
          <tr style="height: 6px; background-color: ${styleValues.colorPrimary}; font-size: 1px; line-height: 1px;">
            <td colspan="2" style="padding: 0; border: none; background-color: ${styleValues.colorPrimary};">&nbsp;</td>
          </tr>
          ` : ""}
          
          <!-- Spacer/Title Padding Row -->
          <tr style="height: 60px;">
            <td colspan="2" style="border: none;">&nbsp;</td>
          </tr>

          <!-- Title Section -->
          <tr>
            <td colspan="2" style="text-align: center; padding: 20px 40px; border: none;">
              <h1 style="font-family: ${styleValues.fontHeading}; color: ${styleValues.colorHeading}; font-size: 24pt; font-weight: bold; text-transform: uppercase; margin: 0 0 10px 0; border-bottom: ${isClassic ? "4px double " + styleValues.colorPrimary : "2px solid " + styleValues.colorPrimary}; padding-bottom: 12px; display: inline-block; width: 85%;">
                PROJECT REPORT
              </h1>
              <h2 style="font-family: ${styleValues.fontHeading}; color: #64748b; font-size: 12pt; font-style: italic; margin: 15px 0 5px 0; font-weight: normal;">
                For Vehicle Loan and Capital Financing
              </h2>
              <h2 style="font-family: ${styleValues.fontHeading}; color: #475569; font-size: 10pt; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; margin: 5px 0 0 0;">
                Under SaaS Advisory Portal
              </h2>
            </td>
          </tr>

          <!-- Large Spacer Row to push recipient details down -->
          <tr style="height: 120px;">
            <td colspan="2" style="border: none;">&nbsp;</td>
          </tr>

          <!-- Prepared For / Recipient Section -->
          <tr>
            <td colspan="2" style="text-align: center; padding: 20px; border: none;">
              <p style="font-family: ${styleValues.fontHeading}; color: #94a3b8; font-size: 9pt; font-weight: bold; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 5px 0;">
                Prepared For
              </p>
              <p style="font-family: ${styleValues.fontHeading}; color: ${styleValues.colorHeading}; font-size: 20pt; font-weight: bold; text-decoration: underline; margin: 5px 0; text-underline-offset: 6px;">
                ${report.name || "Shri Manjunath Mallappa Patil"}
              </p>
              <p style="font-family: ${styleValues.fontBody}; color: #64748b; font-size: 10pt; font-style: italic; margin: 5px 0 0 0; line-height: 1.4;">
                ${report.address || "Chikkodi Road, Tq Raibag, Dist Belagavi"}
              </p>
            </td>
          </tr>

          <!-- Large Spacer Row to push footer sections to the bottom -->
          <tr style="height: 140px;">
            <td colspan="2" style="border: none;">&nbsp;</td>
          </tr>

          <!-- Divider Line Row -->
          <tr>
            <td colspan="2" style="padding: 0 40px; border: none;">
              <div style="border-top: 1px solid ${styleValues.borderColor}; font-size: 1px; line-height: 1px; height: 1px;">&nbsp;</div>
            </td>
          </tr>

          <!-- Footer Info / Parameters & Consultancy Services (Side-by-Side in Table) -->
          <tr>
            <!-- Left Column: Project Parameters -->
            <td style="width: 50%; padding: 25px 0 25px 40px; vertical-align: bottom; border: none; text-align: left;">
              <p style="font-family: ${styleValues.fontHeading}; color: #94a3b8; font-size: 8.5pt; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px 0;">
                Project Parameters
              </p>
              <table style="width: 100%; border-collapse: collapse; border: none;">
                <tr>
                  <td style="padding: 2px 0; border: none; font-family: ${styleValues.fontBody}; font-size: 9pt; color: ${styleValues.colorText};"><strong>Asset:</strong></td>
                  <td style="padding: 2px 0; border: none; font-family: ${styleValues.fontBody}; font-size: 9pt; color: ${styleValues.colorText};">${report.vehicleName}</td>
                </tr>
                <tr>
                  <td style="padding: 2px 0; border: none; font-family: ${styleValues.fontBody}; font-size: 9pt; color: ${styleValues.colorText};"><strong>Loan Outlay:</strong></td>
                  <td style="padding: 2px 0; border: none; font-family: ${styleValues.fontBody}; font-size: 9pt; color: ${styleValues.colorText};">₹${report.loanAmount.toLocaleString("en-IN")} @ ${report.interestRate}%</td>
                </tr>
                <tr>
                  <td style="padding: 2px 0; border: none; font-family: ${styleValues.fontBody}; font-size: 9pt; color: ${styleValues.colorText};"><strong>Funding Mix:</strong></td>
                  <td style="padding: 2px 0; border: none; font-family: ${styleValues.fontBody}; font-size: 9pt; color: ${styleValues.colorText};">${debtPct}% Debt / ${equityPct}% Own Equity</td>
                </tr>
              </table>
            </td>

            <!-- Right Column: Consultancy Details -->
            <td style="width: 50%; padding: 25px 40px 25px 0; vertical-align: bottom; border: none; text-align: right;">
              <p style="font-family: ${styleValues.fontHeading}; font-weight: bold; color: ${styleValues.colorHeading}; font-size: 9.5pt; margin: 0 0 4px 0; text-transform: uppercase;">
                VIVA CONSULTANCY SERVICES
              </p>
              <p style="font-family: ${styleValues.fontBody}; color: ${styleValues.colorText}; font-size: 8.5pt; margin: 2px 0;">
                Ankale Arcade, Khadharwadi Road,
              </p>
              <p style="font-family: ${styleValues.fontBody}; color: ${styleValues.colorText}; font-size: 8.5pt; margin: 2px 0;">
                Udyambag, Belagavi, Karnataka
              </p>
              <p style="font-family: ${styleValues.fontBody}; color: ${styleValues.colorText}; font-size: 8.5pt; margin: 2px 0;">
                <strong>Ph:</strong> +91 6363585097, 6363020738
              </p>
              <p style="font-family: ${styleValues.fontBody}; color: #94a3b8; font-size: 8pt; margin: 6px 0 0 0; font-weight: bold;">
                Date: ${new Date(report.startDate).toLocaleDateString("en-IN")}
              </p>
            </td>
          </tr>
        </table>
      `;
    }

    // Resolve CSS variables in inline styles to actual hex/string values
    const allElements = element.querySelectorAll("*");
    allElements.forEach((el: any) => {
      const styleAttr = el.getAttribute("style");
      if (styleAttr) {
        let newStyle = styleAttr;
        // Map general CSS variables
        newStyle = newStyle.replace(/var\(--doc-font-body\)/g, styleValues.fontBody);
        newStyle = newStyle.replace(/var\(--doc-font-heading\)/g, styleValues.fontHeading);
        newStyle = newStyle.replace(/var\(--doc-color-primary\)/g, styleValues.colorPrimary);
        newStyle = newStyle.replace(/var\(--doc-color-heading\)/g, styleValues.colorHeading);
        newStyle = newStyle.replace(/var\(--doc-color-text\)/g, styleValues.colorText);
        newStyle = newStyle.replace(/var\(--doc-bg-header\)/g, styleValues.bgHeader);
        newStyle = newStyle.replace(/var\(--doc-border-color\)/g, styleValues.borderColor);
        newStyle = newStyle.replace(/var\(--doc-border-style\)/g, styleValues.borderStyle);
        newStyle = newStyle.replace(/var\(--doc-border-width\)/g, styleValues.borderWidth);
        newStyle = newStyle.replace(/var\(--doc-cover-border\)/g, styleValues.coverBorder);
        
        // Map Tailwind variables if they're used
        newStyle = newStyle.replace(/var\(--font-sans\)/g, "Segoe UI, Arial, sans-serif");
        newStyle = newStyle.replace(/var\(--font-serif\)/g, "Georgia, 'Times New Roman', serif");
        newStyle = newStyle.replace(/var\(--font-mono\)/g, "Consolas, 'Courier New', monospace");
        
        el.setAttribute("style", newStyle);
      }
    });

    // Replace Recharts SVG charts with premium, responsive, fully designed MS Word HTML tables/progress indicators
    const totalInterest = emiSchedule.reduce((sum, r) => sum + r.int, 0);
    const totalRepayment = report.loanAmount + totalInterest;
    const principalPct = Math.round((report.loanAmount / totalRepayment) * 100);
    const interestPct = 100 - principalPct;

    // Find the chart grid wrapper
    const chartWrapper = element.querySelector(".grid.grid-cols-1.md\\:grid-cols-12");
    if (chartWrapper) {
      chartWrapper.innerHTML = `
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px; margin-bottom: 20px; font-family: ${styleValues.fontBody};">
          <tr>
            <!-- Left Side: Distribution Progress Meter -->
            <td style="width: 45%; padding: 15px; background-color: ${styleValues.bgHeader}; border: ${styleValues.borderWidth} ${styleValues.borderStyle} ${styleValues.borderColor}; vertical-align: top; border-radius: 8px;">
              <h4 style="margin: 0 0 10px 0; font-size: 11pt; font-family: ${styleValues.fontHeading}; color: ${styleValues.colorHeading}; text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">Total Repayment Breakup</h4>
              
              <!-- Stacked Horizontal Bar Meter -->
              <div style="margin: 20px 0; background-color: #e2e8f0; height: 24px; border-radius: 4px; overflow: hidden; display: table; width: 100%;">
                <div style="display: table-cell; width: ${principalPct}%; background-color: #2563eb; text-align: center; color: #ffffff; font-size: 9pt; font-family: Arial, sans-serif; font-weight: bold; vertical-align: middle;">
                  ${principalPct}% Principal
                </div>
                <div style="display: table-cell; width: ${interestPct}%; background-color: #dc2626; text-align: center; color: #ffffff; font-size: 9pt; font-family: Arial, sans-serif; font-weight: bold; vertical-align: middle;">
                  ${interestPct}% Interest
                </div>
              </div>

              <!-- Metric Labels -->
              <table style="width: 100%; border-collapse: collapse; font-size: 9.5pt; color: ${styleValues.colorText};">
                <tr>
                  <td style="padding: 4px 0; border: none; color: ${styleValues.colorText};">Principal Loan Amount:</td>
                  <td style="padding: 4px 0; border: none; text-align: right; font-weight: bold; color: ${styleValues.colorHeading};">₹${formatINR(report.loanAmount)}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; border: none; color: ${styleValues.colorText};">Interest Payable:</td>
                  <td style="padding: 4px 0; border: none; text-align: right; font-weight: bold; color: ${styleValues.colorHeading};">₹${formatINR(totalInterest)}</td>
                </tr>
                <tr style="border-top: 1px solid ${styleValues.borderColor};">
                  <td style="padding: 8px 0 0 0; border: none; font-weight: bold; color: ${styleValues.colorHeading};">Total Cost of Borrowing:</td>
                  <td style="padding: 8px 0 0 0; border: none; text-align: right; font-weight: bold; color: ${styleValues.colorHeading};">₹${formatINR(totalRepayment)}</td>
                </tr>
              </table>
            </td>
            
            <td style="width: 5%;"></td>

            <!-- Right Side: Amortization Milestone Progress Table -->
            <td style="width: 50%; padding: 15px; background-color: ${styleValues.bgHeader}; border: ${styleValues.borderWidth} ${styleValues.borderStyle} ${styleValues.borderColor}; vertical-align: top; border-radius: 8px;">
              <h4 style="margin: 0 0 10px 0; font-size: 11pt; font-family: ${styleValues.fontHeading}; color: ${styleValues.colorHeading}; text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">Outstanding Loan Amortization</h4>
              <table style="width: 100%; border-collapse: collapse; font-size: 8.5pt; color: ${styleValues.colorText}; margin-top: 10px;">
                <thead>
                  <tr style="border-bottom: 1.5px solid ${styleValues.borderColor};">
                    <th style="text-align: left; padding: 4px; color: ${styleValues.colorHeading}; font-weight: bold;">Milestone</th>
                    <th style="text-align: right; padding: 4px; color: ${styleValues.colorHeading}; font-weight: bold;">Outstanding Bal</th>
                    <th style="text-align: right; padding: 4px; color: ${styleValues.colorHeading}; font-weight: bold;">Repaid Progress</th>
                  </tr>
                </thead>
                <tbody>
                  ${
                    Array.from({ length: Math.min(6, report.tenureYears + 1) }).map((_, idx) => {
                      const yr = idx;
                      const monthIdx = Math.min(yr * 12, emiSchedule.length - 1);
                      const row = emiSchedule[monthIdx];
                      if (!row) return "";
                      const progressPct = Math.round(((report.loanAmount - row.close) / report.loanAmount) * 100);
                      return `
                        <tr style="border-bottom: 1px solid rgba(0,0,0,0.05);">
                          <td style="padding: 6px 4px; text-align: left;">${yr === 0 ? "Disbursal" : "End of Year " + yr}</td>
                          <td style="padding: 6px 4px; text-align: right; font-weight: bold; font-family: Courier New, monospace;">₹${formatINR(Math.round(row.close))}</td>
                          <td style="padding: 6px 4px; text-align: right;">
                            <span style="font-weight: bold; color: ${styleValues.colorPrimary};">${progressPct}%</span> Repaid
                          </td>
                        </tr>
                      `;
                    }).join("")
                  }
                </tbody>
              </table>
            </td>
          </tr>
        </table>
      `;
    }

    // Force explicit template-aware styling on all tables for MS Word
    const tables = element.querySelectorAll("table");
    tables.forEach((tbl: any) => {
      tbl.setAttribute("border", "1");
      tbl.style.borderCollapse = "collapse";
      tbl.style.width = "100%";
      tbl.style.marginBottom = "20px";
      tbl.style.fontFamily = styleValues.fontBody;

      // Check if it's a financial data table
      const isFinTable = tbl.classList.contains("fin-table") || tbl.className.includes("fin-table");

      if (isFinTable) {
        // Force Word to respect our column widths and wrap text inside cells
        tbl.style.tableLayout = "fixed";

        // Determine max columns in any row
        let maxCols = 0;
        const rows = tbl.querySelectorAll("tr");
        rows.forEach((row: any) => {
          let cols = 0;
          const cells = row.querySelectorAll("th, td");
          cells.forEach((cell: any) => {
            const colspan = parseInt(cell.getAttribute("colspan") || "1", 10);
            cols += colspan;
          });
          if (cols > maxCols) {
            maxCols = cols;
          }
        });

        // Set font size based on density to guarantee everything fits on an A4 page
        if (maxCols >= 9) {
          tbl.style.fontSize = "8pt";
        } else if (maxCols >= 6) {
          tbl.style.fontSize = "8.5pt";
        } else if (maxCols >= 4) {
          tbl.style.fontSize = "9pt";
        } else {
          tbl.style.fontSize = "10pt";
        }

        // Set explicit cell widths across every row for 100% precise alignment
        rows.forEach((row: any) => {
          const cells = row.querySelectorAll("th, td");
          let colIndex = 0;
          cells.forEach((cell: any) => {
            const colspan = parseInt(cell.getAttribute("colspan") || "1", 10);
            
            if (colspan === 1) {
              if (maxCols === 9) {
                // 9 columns: Mo (5%) + Date (12%) + FY (8%) + Open (14%) + EMI (13%) + Int (11%) + Prin (13%) + Close (14%) + Type (10%)
                const widths9 = ["5%", "12%", "8%", "14%", "13%", "11%", "13%", "14%", "10%"];
                cell.style.width = widths9[colIndex] || "11%";
              } else if (maxCols === 6) {
                // 6 columns: Particulars (35%) + 5 Years (13% each)
                if (colIndex === 0) {
                  cell.style.width = "35%";
                } else {
                  cell.style.width = "13%";
                }
              } else if (maxCols === 5) {
                // 5 columns: Route Path/Labels (40%) + metrics (15% each)
                if (colIndex === 0) {
                  cell.style.width = "40%";
                } else {
                  cell.style.width = "15%";
                }
              } else if (maxCols === 2) {
                // 2 columns: Particulars (65%) + Value (35%)
                if (colIndex === 0) {
                  cell.style.width = "65%";
                } else {
                  cell.style.width = "35%";
                }
              }
            }
            colIndex += colspan;
          });
        });
      } else {
        tbl.style.fontSize = "10pt";
      }
    });

    const ths = element.querySelectorAll("th");
    ths.forEach((th: any) => {
      th.style.backgroundColor = styleValues.bgHeader;
      th.style.color = styleValues.colorHeading;
      th.style.padding = "6px 8px";
      th.style.border = `${styleValues.borderWidth} ${styleValues.borderStyle} ${styleValues.borderColor}`;
      th.style.fontFamily = styleValues.fontHeading;
      th.style.textTransform = "uppercase";
      th.style.wordWrap = "break-word";
      th.style.overflowWrap = "break-word";
    });

    const tds = element.querySelectorAll("td");
    tds.forEach((td: any) => {
      td.style.padding = "5px 8px";
      td.style.border = `${styleValues.borderWidth} ${styleValues.borderStyle} ${styleValues.borderColor}`;
      td.style.color = styleValues.colorText;
      td.style.fontFamily = styleValues.fontBody;
      td.style.wordWrap = "break-word";
      td.style.overflowWrap = "break-word";
    });

    const totalRows = element.querySelectorAll(".total-row td, tr.total-row td");
    totalRows.forEach((td: any) => {
      td.style.fontWeight = "bold";
      td.style.backgroundColor = styleValues.bgHeader;
      td.style.borderTop = `1.5px solid ${styleValues.borderColor}`;
      td.style.borderBottom = `3px double ${styleValues.borderColor}`;
      td.style.color = styleValues.colorHeading;
    });

    // Remove any remaining raw SVGs (like icons) to prevent empty space / broken images in MS Word
    const svgs = element.querySelectorAll("svg");
    svgs.forEach((svg) => {
      svg.parentNode?.removeChild(svg);
    });

    const content = element.innerHTML;
    const header = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>Project Report - ${report.vehicleName}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 15mm;
          }
          body {
            font-family: ${styleValues.fontBody};
            font-size: 11pt;
            color: ${styleValues.colorText};
            line-height: 1.5;
            background-color: #ffffff;
          }
          h1 {
            text-align: center;
            font-size: 22pt;
            margin-top: 40px;
            font-family: ${styleValues.fontHeading};
            color: ${styleValues.colorHeading};
            text-transform: uppercase;
            font-weight: bold;
          }
          h2 {
            text-align: center;
            font-size: 14pt;
            margin: 10px 0 20px 0;
            font-family: ${styleValues.fontHeading};
            color: ${styleValues.colorHeading};
            font-weight: normal;
          }
          h3 {
            font-size: 12pt;
            font-weight: bold;
            margin-top: 20px;
            margin-bottom: 10px;
            font-family: ${styleValues.fontHeading};
            color: ${styleValues.colorHeading};
          }
          p {
            text-align: justify;
            margin-bottom: 10px;
            color: ${styleValues.colorText};
          }
          .num {
            text-align: right;
          }
          .bold {
            font-weight: bold;
          }
          .narrative-content {
            font-family: ${styleValues.fontBody};
            color: ${styleValues.colorText};
            line-height: 1.6;
          }
          .narrative-content h1 {
            text-align: left;
            font-size: 16pt;
            border-bottom: 1.5px solid ${styleValues.borderColor};
            padding-bottom: 4px;
            margin-top: 24px;
            margin-bottom: 12px;
            color: ${styleValues.colorHeading};
          }
          .narrative-content h2 {
            text-align: left;
            font-size: 14pt;
            margin-top: 20px;
            margin-bottom: 10px;
            color: ${styleValues.colorHeading};
          }
          .narrative-content h3 {
            text-align: left;
            font-size: 12pt;
            text-decoration: underline;
            margin-top: 16px;
            margin-bottom: 8px;
            color: ${styleValues.colorHeading};
          }
        </style>
      </head>
      <body>
    `;
    const footer = "</body></html>";

    const blob = new Blob(["\ufeff", header + content + footer], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = `${report.name.replace(/\s+/g, "_")}_Project_Report.doc`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
  };

  // Export to Excel / CSV
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,\ufeff";

    // 1. Cost & Means of Finance
    csvContent += "COST OF PROJECT AND MEANS OF FINANCE\n";
    csvContent += "Particulars,Amount (INR)\n";
    csvContent += `Vehicle Base Cost,${report.baseCost}\n`;
    csvContent += `Body Building,${report.bodyBuilding}\n`;
    csvContent += `Working Capital,${report.workingCapital}\n`;
    csvContent += `TOTAL PROJECT COST,${totalCost}\n\n`;

    csvContent += "Means of Finance\n";
    csvContent += `Own Margin Capital,${promoterMargin}\n`;
    csvContent += `Government Subsidy,${report.subsidy}\n`;
    csvContent += `Bank Term Loan,${report.loanAmount}\n`;
    csvContent += `TOTAL CAPITAL STRUCTURE,${totalCost}\n\n\n`;

    // 2. Projected Profitability Table
    csvContent += "PROJECTED PROFITABILITY STATEMENT (5-YEARS)\n";
    csvContent += "Particulars," + fyLabels.join(",") + "\n";
    csvContent += "Revenue," + revenues.map(v => Math.round(v)).join(",") + "\n";
    csvContent += "Fuel Cost," + fuelCosts.map(v => Math.round(v)).join(",") + "\n";
    csvContent += "Driver Salaries," + driverSalaries.map(v => Math.round(v)).join(",") + "\n";
    csvContent += "Food Expenses," + foodCosts.map(v => Math.round(v)).join(",") + "\n";
    csvContent += "Repairs & Maintenance," + repairsCosts.map(v => Math.round(v)).join(",") + "\n";
    csvContent += "Taxes & Insurance," + taxCosts.map(v => Math.round(v)).join(",") + "\n";
    csvContent += "Administrative Expenses," + otherCosts.map(v => Math.round(v)).join(",") + "\n";
    csvContent += "EBITDA (Surplus)," + surpluses.map(v => Math.round(v)).join(",") + "\n";
    csvContent += "Interest Expense," + interests.map(v => Math.round(v)).join(",") + "\n";
    csvContent += "Depreciation (15% WDV)," + depreciations.map(v => Math.round(v)).join(",") + "\n";
    csvContent += "NET PROFIT," + netProfits.map(v => Math.round(v)).join(",") + "\n\n\n";

    // 3. Balance Sheet
    csvContent += "PROJECTED BALANCE SHEET\n";
    csvContent += "LIABILITIES," + fyLabels.join(",") + "\n";
    csvContent += "Capital Account," + capitals.map(v => Math.round(v)).join(",") + "\n";
    csvContent += "Subsidy Reserve," + fyLabels.map(() => report.subsidy).join(",") + "\n";
    csvContent += "Bank Term Loan," + fyLoanClosingBalance().map(v => Math.round(v)).join(",") + "\n";
    csvContent += "Current Liabilities," + currLiabilities.map(v => Math.round(v)).join(",") + "\n";
    csvContent += "ASSETS\n";
    csvContent += "Fixed Asset (WDV)," + wdvList.map(v => Math.round(v)).join(",") + "\n";
    csvContent += "Sundry Debtors," + debtors.map(v => Math.round(v)).join(",") + "\n";
    csvContent += "Investments," + investments.map(v => Math.round(v)).join(",") + "\n";
    csvContent += "Cash & Bank Balance," + cashBalances.map(v => Math.round(v)).join(",") + "\n\n";

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${report.name.replace(/\s+/g, "_")}_Financial_Model.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  function fyLoanClosingBalance() {
    const list: number[] = [];
    fyLabels.forEach((fy) => {
      let close = report.loanAmount;
      emiSchedule.forEach((row) => {
        if (row.fy === fy) {
          close = row.close;
        }
      });
      list.push(close);
    });
    return list;
  }

  // Visual page break element
  const renderPageBreak = (pageNum: number) => (
    <div key={`pb-${pageNum}`} className="page-break-indicator my-10 border-b-2 border-dashed border-slate-300 relative text-center no-print">
      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-200 text-slate-500 text-[10px] uppercase font-bold tracking-widest px-3 py-0.5 rounded-full border border-slate-300">
        Page Break (Page {pageNum})
      </span>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-slate-200">
      
      {/* Top Toolbar */}
      <div className="bg-white border-b border-slate-300 p-4 flex flex-wrap gap-3 items-center justify-between no-print shadow-sm z-10 shrink-0">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-slate-600" />
          <div>
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">CA Document Viewer</h3>
            <p className="text-[10px] text-slate-500">Live preview of audit-style dossier</p>
          </div>
        </div>

        {/* Section selectors */}
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-[11px] font-semibold">
          <button
            onClick={() => setActivePreviewSection("all")}
            className={`px-2.5 py-1 rounded-md transition-all ${activePreviewSection === "all" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            Full Dossier
          </button>
          <button
            onClick={() => setActivePreviewSection("narrative")}
            className={`px-2.5 py-1 rounded-md transition-all ${activePreviewSection === "narrative" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            Narratives Only
          </button>
          <button
            onClick={() => setActivePreviewSection("financials")}
            className={`px-2.5 py-1 rounded-md transition-all ${activePreviewSection === "financials" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            Financials Only
          </button>
        </div>

        {/* Document Theme/Template Selector */}
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-[11px] font-semibold items-center gap-1">
          <span className="text-[9px] uppercase font-extrabold text-slate-400 px-2 tracking-widest">Template:</span>
          <button
            onClick={() => setDocTemplate("classic")}
            className={`px-2 py-1 rounded-md transition-all flex items-center gap-1 ${docTemplate === "classic" ? "bg-white text-slate-900 shadow-sm border border-slate-200/50" : "text-slate-500 hover:text-slate-700"}`}
            title="Times/Georgia serif - standard audit format"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-slate-800"></span>
            Traditional
          </button>
          <button
            onClick={() => setDocTemplate("modern")}
            className={`px-2 py-1 rounded-md transition-all flex items-center gap-1 ${docTemplate === "modern" ? "bg-white text-slate-900 shadow-sm border border-slate-200/50" : "text-slate-500 hover:text-slate-700"}`}
            title="Inter sans-serif - modern blue theme"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
            Modern
          </button>
          <button
            onClick={() => setDocTemplate("editorial")}
            className={`px-2 py-1 rounded-md transition-all flex items-center gap-1 ${docTemplate === "editorial" ? "bg-white text-slate-900 shadow-sm border border-slate-200/50" : "text-slate-500 hover:text-slate-700"}`}
            title="Lora serif - warm academic/executive layout"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
            Editorial
          </button>
          <button
            onClick={() => setDocTemplate("tech")}
            className={`px-2 py-1 rounded-md transition-all flex items-center gap-1 ${docTemplate === "tech" ? "bg-white text-slate-900 shadow-sm border border-slate-200/50" : "text-slate-500 hover:text-slate-700"}`}
            title="JetBrains mono - engineering tech layout"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Minimal Grid
          </button>
        </div>

        {/* Export triggers */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg px-3 py-1.5 text-xs flex items-center gap-1 shadow transition-colors"
            title="Download CSV Financial sheets"
          >
            <Table className="w-3.5 h-3.5" />
            Excel CSV
          </button>
          <button
            onClick={handleExportWord}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg px-3 py-1.5 text-xs flex items-center gap-1 shadow transition-colors"
            title="Download Word Document"
          >
            <Download className="w-3.5 h-3.5" />
            Word Doc
          </button>
          <button
            onClick={handlePrint}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg px-3 py-1.5 text-xs flex items-center gap-1 shadow transition-colors"
            title="Print or Save PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            Print PDF
          </button>
        </div>
      </div>

      {/* Main Preview Pane */}
      <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scroll">
        <div 
          id="report-document-body" 
          className="doc-preview bg-white mx-auto shadow-xl p-12 md:p-16 max-w-[850px] select-text print-only-container transition-all duration-350"
          style={getTemplateStyles()}
        >
          {/* SECTION 1: COVER PAGE */}
          {(activePreviewSection === "all") && (
            <div 
              id="cover-page-section"
              className="flex flex-col justify-between min-h-[750px] pb-8 relative p-8 rounded-lg"
              style={{ border: "var(--doc-cover-border)", borderColor: "var(--doc-border-color)" }}
            >
              {/* Top Accent Bar */}
              <div 
                className="absolute top-0 left-0 right-0 h-1.5" 
                style={{ 
                  display: "var(--doc-cover-decor)", 
                  backgroundColor: "var(--doc-color-primary)" 
                }} 
              />

              <div className="text-center mt-20">
                <h1 
                  className="text-3xl md:text-4xl font-extrabold tracking-wide uppercase pb-4"
                  style={{ 
                    borderBottom: docTemplate === "classic" ? "4px double var(--doc-color-primary)" : "2px solid var(--doc-color-primary)"
                  }}
                >
                  PROJECT REPORT
                </h1>
                <h2 className="text-md italic text-slate-500 mt-4">For Vehicle Loan and Capital Financing</h2>
                <h2 className="text-sm font-semibold tracking-wider uppercase text-slate-600 mt-1">Under SaaS Advisory Portal</h2>
              </div>
 
              <div className="my-24 text-center">
                <p className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-1">Prepared For</p>
                <p 
                  className="text-2xl font-bold underline decoration-1 underline-offset-4"
                  style={{ 
                    color: "var(--doc-color-heading)",
                    textDecorationColor: "var(--doc-border-color)"
                  }}
                >
                  {report.name || "Shri Manjunath Mallappa Patil"}
                </p>
                <p className="text-xs text-slate-500 italic mt-2 max-w-sm mx-auto">
                  {report.address || "Chikkodi Road, Tq Raibag, Dist Belagavi"}
                </p>
              </div>
 
              <div 
                className="flex flex-col md:flex-row justify-between items-end border-t pt-8 mt-auto text-xs"
                style={{ 
                  borderColor: "var(--doc-border-color)",
                  color: "var(--doc-color-text)"
                }}
              >
                <div className="text-left space-y-1">
                  <p className="font-bold uppercase tracking-wider text-[10px] text-slate-400">Project Parameters</p>
                  <p><strong>Asset:</strong> {report.vehicleName}</p>
                  <p><strong>Loan Outlay:</strong> ₹{report.loanAmount.toLocaleString("en-IN")} @ {report.interestRate}%</p>
                  <p><strong>Funding Mix:</strong> {((report.loanAmount / totalCost) * 100).toFixed(0)}% Debt / {((promoterMargin / totalCost) * 100).toFixed(0)}% Own Equity</p>
                </div>
                <div className="text-right mt-6 md:mt-0 space-y-1">
                  <p className="font-bold text-slate-800">VIVA CONSULTANCY SERVICES</p>
                  <p>Ankale Arcade, Khadharwadi Road,</p>
                  <p>Udyambag, Belagavi, Karnataka</p>
                  <p><strong>Ph:</strong> +91 6363585097, 6363020738</p>
                  <p className="text-[10px] text-slate-400">Date: {new Date(report.startDate).toLocaleDateString("en-IN")}</p>
                </div>
              </div>
            </div>
          )}

          {activePreviewSection === "all" && renderPageBreak(1)}

          {/* SECTION 2: PROJECT NARRATIVE (AI TEXT) */}
          {(activePreviewSection === "all" || activePreviewSection === "narrative") && (
            <div className="force-page-break text-slate-950 leading-relaxed text-sm">
              {report.aiNarrative ? (
                <div 
                  className="narrative-content space-y-4"
                  dangerouslySetInnerHTML={{ __html: report.aiNarrative }}
                />
              ) : (
                <div className="text-center py-20 bg-slate-50 rounded-xl border border-slate-200 no-print">
                  <Sparkles className="w-8 h-8 text-purple-500 mx-auto mb-2 animate-bounce" />
                  <h4 className="font-bold text-slate-700">No Narrative Written Yet</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Go to the <strong>AI Writer</strong> tab on the left panel parameters form and click "Draft Narrative" to instantly generate CA-grade sections.
                  </p>
                </div>
              )}

              {/* General Conditions & Assumptions if All is selected */}
              {activePreviewSection === "all" && (
                <div className="mt-8 border-t border-slate-300 pt-6">
                  <h3 style={{ fontSize: "14pt", fontWeight: "bold", textDecoration: "underline" }} className="mb-3">
                    FINANCIAL OUTLAYS & PARAMETERS:
                  </h3>
                  <p>
                    The proprietor intends to initiate operations immediately upon funding approval. The total financing required for the acquisition of the commercial vehicle has been structured as follows:
                  </p>
                  <ul className="list-disc pl-6 space-y-1 mb-4">
                    <li>Asset model proposed for purchase: <strong>{report.vehicleName}</strong></li>
                    <li>Total consolidated project outlay: <strong>₹{totalCost.toLocaleString("en-IN")}</strong></li>
                    <li>Requested Bank Term Loan: <strong>₹{report.loanAmount.toLocaleString("en-IN")}</strong></li>
                    <li>Government/Institutional Subsidy: <strong>₹{report.subsidy.toLocaleString("en-IN")}</strong></li>
                    <li>Promoter's self-equity contribution: <strong>₹{promoterMargin.toLocaleString("en-IN")}</strong> (equivalent to {((promoterMargin / totalCost) * 100).toFixed(1)}% margin)</li>
                  </ul>
                  <p>
                    Repayment of the requested bank loan has been scheduled over <strong>{report.tenureYears} years</strong> (representing {report.tenureYears * 12} monthly cycles) with an annual interest rate computed at <strong>{report.interestRate}%</strong>.
                  </p>
                </div>
              )}
            </div>
          )}

          {activePreviewSection === "all" && renderPageBreak(2)}

          {/* SECTION 3: FINANCIAL SCHEDULING & STATEMENTS */}
          {(activePreviewSection === "all" || activePreviewSection === "financials") && (
            <div className="force-page-break text-slate-900 text-sm space-y-8">
              
              {/* Cover Header for Financials tab */}
              {activePreviewSection === "financials" && (
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold uppercase tracking-wider underline">Financial Schedules & Projections</h2>
                  <p className="text-xs text-slate-500 italic mt-1">Prepared for {report.name} • Asset: {report.vehicleName}</p>
                </div>
              )}

              {/* 3.1: Project Cost & Funding Mix */}
              <div>
                <h3 className="text-center font-bold uppercase text-slate-900 border-b pb-1 mb-4">
                  COST OF PROJECT & MEANS OF FINANCE
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <table className="fin-table">
                    <thead>
                      <tr>
                        <th colSpan={2}>CONSOLIDATED PROJECT COST</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Vehicle Chassis & Accessories</td>
                        <td className="num font-mono">₹{formatINR(report.baseCost)}</td>
                      </tr>
                      {report.bodyBuilding > 0 && (
                        <tr>
                          <td>Body Customization / Fabrication</td>
                          <td className="num font-mono">₹{formatINR(report.bodyBuilding)}</td>
                        </tr>
                      )}
                      {report.workingCapital > 0 && (
                        <tr>
                          <td>Initial Working Capital Reserve</td>
                          <td className="num font-mono">₹{formatINR(report.workingCapital)}</td>
                        </tr>
                      )}
                      <tr className="total-row">
                        <td>TOTAL PROJECT OUTLAY (A)</td>
                        <td className="num font-mono">₹{formatINR(totalCost)}</td>
                      </tr>
                    </tbody>
                  </table>

                  <table className="fin-table">
                    <thead>
                      <tr>
                        <th colSpan={2}>PROPOSED MEANS OF FINANCE</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Promoter's Equity Margin</td>
                        <td className="num font-mono">₹{formatINR(promoterMargin)}</td>
                      </tr>
                      {report.subsidy > 0 && (
                        <tr>
                          <td>Government Subsidy Credit</td>
                          <td className="num font-mono">₹{formatINR(report.subsidy)}</td>
                        </tr>
                      )}
                      <tr>
                        <td>Requested Bank Term Loan</td>
                        <td className="num font-mono">₹{formatINR(report.loanAmount)}</td>
                      </tr>
                      <tr className="total-row">
                        <td>TOTAL CAPITAL STRUCTURE (B)</td>
                        <td className="num font-mono">₹{formatINR(totalCost)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 3.2: Operating Metrics & Fuel Calculations */}
              <div>
                <h3 className="text-center font-bold uppercase text-slate-900 border-b pb-1 mb-4">
                  OPERATIONAL REVENUE & EXPENSE METRICS
                </h3>
                {(() => {
                  const revMode = report.revenueMode || "fixed";
                  const rateType = report.fixedRateType || "per_km";
                  const routes = report.routes || [];

                  let annualDistance = 0;
                  let annualRevenue = 0;

                  if (revMode === "route") {
                    annualDistance = routes.reduce((sum, r) => sum + (r.tripsPerMonth * r.distanceKm * 12), 0);
                    annualRevenue = routes.reduce((sum, r) => sum + (r.tripsPerMonth * r.ratePerTrip * 12), 0);
                  } else {
                    annualDistance = report.workingDays * report.dailyKm;
                    if (rateType === "per_day") {
                      annualRevenue = report.workingDays * report.hireCharge;
                    } else if (rateType === "flat") {
                      annualRevenue = 12 * report.hireCharge;
                    } else {
                      annualRevenue = report.workingDays * report.dailyKm * report.hireCharge;
                    }
                  }

                  if (revMode === "route") {
                    return (
                      <div className="space-y-4">
                        <p className="text-[11px] text-slate-600 mb-2 font-medium">
                          Operating on <strong className="text-blue-700">Route Based Revenue Determination</strong>. The logistics and revenue structures are compiled from individual transit routing agreements listed below:
                        </p>
                        <table className="fin-table text-[10px] md:text-xs">
                          <thead>
                            <tr>
                              <th>Transit Route / Path Destination</th>
                              <th className="text-center">Trips / Mo</th>
                              <th className="text-right">Rate / Trip</th>
                              <th className="text-center">Distance / Trip</th>
                              <th className="text-right">Annual Revenue</th>
                            </tr>
                          </thead>
                          <tbody>
                            {routes.map((route, idx) => (
                              <tr key={route.id || idx}>
                                <td className="font-medium">{route.name}</td>
                                <td className="text-center font-mono">{route.tripsPerMonth}</td>
                                <td className="num font-mono">₹{formatINR(route.ratePerTrip)}</td>
                                <td className="text-center font-mono">{route.distanceKm} KM</td>
                                <td className="num font-mono font-bold text-slate-800">₹{formatINR(route.tripsPerMonth * route.ratePerTrip * 12)}</td>
                              </tr>
                            ))}
                            <tr className="font-bold bg-slate-50 border-t border-slate-300">
                              <td>AGGREGATE PRO-FORMA RUN DETAILS</td>
                              <td className="text-center font-mono text-blue-700">
                                {routes.reduce((sum, r) => sum + r.tripsPerMonth, 0)} / Mo
                              </td>
                              <td colSpan={2} className="text-right font-semibold">Total Base Revenue:</td>
                              <td className="num font-mono font-extrabold text-blue-700">₹{formatINR(annualRevenue)}</td>
                            </tr>
                          </tbody>
                        </table>

                        <table className="fin-table mt-4">
                          <thead>
                            <tr>
                              <th colSpan={2}>Fuel Economy & Performance Parameters</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>Aggregate Annual Running Distance</td>
                              <td className="num font-mono">{annualDistance.toLocaleString()} KM / Year</td>
                            </tr>
                            <tr>
                              <td>Average Vehicle Fuel Mileage Efficiency</td>
                              <td className="num font-mono">{report.mileage} KM / Liter</td>
                            </tr>
                            <tr>
                              <td>Estimated Fuel Price (Base Year)</td>
                              <td className="num font-mono">₹{report.fuelPrice} / Liter</td>
                            </tr>
                            <tr className="font-bold bg-slate-50">
                              <td>Projected Year 1 Fuel Cost</td>
                              <td className="num font-mono">₹{formatINR((annualDistance / report.mileage) * report.fuelPrice)}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    );
                  }

                  return (
                    <table className="fin-table">
                      <thead>
                        <tr>
                          <th>Assumption Metric (Year 1 Base)</th>
                          <th className="text-right">Unit Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Total Scheduled Running Days (Annual)</td>
                          <td className="num font-mono">{report.workingDays} Days</td>
                        </tr>
                        <tr>
                          <td>Standard Daily Run Coverage</td>
                          <td className="num font-mono">{report.dailyKm} KM</td>
                        </tr>
                        <tr>
                          <td>Tariff Calculation Type</td>
                          <td className="num font-bold text-slate-800">
                            {rateType === "per_km" && "Per KM Tariff Basis"}
                            {rateType === "per_day" && "Per Day Fixed Basis"}
                            {rateType === "flat" && "Flat Monthly Contract"}
                          </td>
                        </tr>
                        <tr>
                          <td>Specified Hire Rate / Tariff</td>
                          <td className="num font-mono font-bold text-slate-800">
                            ₹{report.hireCharge} {rateType === "per_km" ? "/ KM" : rateType === "per_day" ? "/ Day" : "/ Month"}
                          </td>
                        </tr>
                        <tr className="font-bold bg-slate-50">
                          <td>Projected Base Revenue (Annualized)</td>
                          <td className="num font-mono text-blue-700">₹{formatINR(annualRevenue)}</td>
                        </tr>
                        <tr>
                          <td>Average Vehicle Fuel Mileage Efficiency</td>
                          <td className="num font-mono">{report.mileage} KM / Liter</td>
                        </tr>
                        <tr>
                          <td>Estimated Fuel Price (Base Year)</td>
                          <td className="num font-mono">₹{report.fuelPrice} / Liter</td>
                        </tr>
                        <tr className="font-bold bg-slate-50">
                          <td>Projected Base Fuel Expense (Annualized)</td>
                          <td className="num font-mono">₹{formatINR((annualDistance / report.mileage) * report.fuelPrice)}</td>
                        </tr>
                      </tbody>
                    </table>
                  );
                })()}
              </div>

              {activePreviewSection === "all" && renderPageBreak(3)}

              {/* 3.3: Working of Operations Surplus summary */}
              <div>
                <h3 className="text-center font-bold uppercase text-slate-900 border-b pb-1 mb-4">
                  SUMMARY OF ANNUAL OPERATIONS & INFLATION
                </h3>
                <div className="overflow-x-auto">
                  <table className="fin-table text-[10px] md:text-xs">
                    <thead>
                      <tr>
                        <th>Operational Item</th>
                        {fyLabels.map((fy) => (
                          <th key={fy} className="text-center">{fy}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Active Working Days</td>
                        {activeDays.map((val, idx) => (
                          <td key={idx} className="num font-mono">{val}</td>
                        ))}
                      </tr>
                      <tr>
                        <td>Blended Tariff Charge (₹/KM)</td>
                        {hireCharges.map((val, idx) => (
                          <td key={idx} className="num font-mono">₹{val.toFixed(2)}</td>
                        ))}
                      </tr>
                      <tr className="font-semibold bg-slate-50">
                        <td>Gross Operating Revenue</td>
                        {revenues.map((val, idx) => (
                          <td key={idx} className="num font-mono font-bold">₹{formatINR(val)}</td>
                        ))}
                      </tr>
                      <tr><td colSpan={reportYears + 1} className="font-bold bg-slate-100 uppercase tracking-wide text-center">Cash Operating Expenses</td></tr>
                      <tr>
                        <td>Fuel Expenditures</td>
                        {fuelCosts.map((val, idx) => (
                          <td key={idx} className="num font-mono">₹{formatINR(val)}</td>
                        ))}
                      </tr>
                      <tr>
                        <td>Driver Remunerations (10% inflation)</td>
                        {driverSalaries.map((val, idx) => (
                          <td key={idx} className="num font-mono">₹{formatINR(val)}</td>
                        ))}
                      </tr>
                      <tr>
                        <td>Helper & Food Allowances</td>
                        {foodCosts.map((val, idx) => (
                          <td key={idx} className="num font-mono">₹{formatINR(val)}</td>
                        ))}
                      </tr>
                      <tr>
                        <td>Repairs, Lubricants & Tyres</td>
                        {repairsCosts.map((val, idx) => (
                          <td key={idx} className="num font-mono">₹{formatINR(val)}</td>
                        ))}
                      </tr>
                      <tr>
                        <td>State Tax, Permits & Commercial Ins.</td>
                        {taxCosts.map((val, idx) => (
                          <td key={idx} className="num font-mono">₹{formatINR(val)}</td>
                        ))}
                      </tr>
                      <tr>
                        <td>Office Admin & Misc. Outlays</td>
                        {otherCosts.map((val, idx) => (
                          <td key={idx} className="num font-mono">₹{formatINR(val)}</td>
                        ))}
                      </tr>
                      <tr className="font-semibold bg-slate-100">
                        <td>TOTAL CASH OPERATING EXPENSES</td>
                        {totalOperatingExpenses.map((val, idx) => (
                          <td key={idx} className="num font-mono font-bold">₹{formatINR(val)}</td>
                        ))}
                      </tr>
                      <tr className="total-row">
                        <td>OPERATING SURPLUS (EBITDA)</td>
                        {surpluses.map((val, idx) => (
                          <td key={idx} className="num font-mono text-blue-800 font-bold">₹{formatINR(val)}</td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {activePreviewSection === "all" && renderPageBreak(4)}

              {/* 3.4: Profitability Statement */}
              <div>
                <h3 className="text-center font-bold uppercase text-slate-900 border-b pb-1 mb-4">
                  PROJECTED PROFITABILITY STATEMENT (P&L)
                </h3>
                <div className="overflow-x-auto">
                  <table className="fin-table text-xs">
                    <thead>
                      <tr>
                        <th>Financial Parameters</th>
                        {fyLabels.map((fy) => (
                          <th key={fy} className="text-center">{fy}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="font-bold bg-slate-100">
                        <td>(A) GROSS INCOME FROM TRANSPORT TARIFFS</td>
                        {revenues.map((val, idx) => (
                          <td key={idx} className="num font-mono font-extrabold">₹{formatINR(val)}</td>
                        ))}
                      </tr>
                      <tr>
                        <td>Less: Operating Expenses (Fuel & Crew)</td>
                        {totalOperatingExpenses.map((val, idx) => (
                          <td key={idx} className="num font-mono">₹{formatINR(val)}</td>
                        ))}
                      </tr>
                      <tr className="font-semibold bg-slate-50">
                        <td>Gross Profit Margin (EBITDA)</td>
                        {surpluses.map((val, idx) => (
                          <td key={idx} className="num font-mono font-bold">₹{formatINR(val)}</td>
                        ))}
                      </tr>
                      <tr>
                        <td>Less: Interest on Bank Term Loan</td>
                        {interests.map((val, idx) => (
                          <td key={idx} className="num font-mono text-red-700">₹{formatINR(val)}</td>
                        ))}
                      </tr>
                      <tr>
                        <td>Less: Depreciation (15% WDV)</td>
                        {depreciations.map((val, idx) => (
                          <td key={idx} className="num font-mono text-amber-700">₹{formatINR(val)}</td>
                        ))}
                      </tr>
                      <tr className="total-row">
                        <td>NET NET PROFIT (EBT / PAT)</td>
                        {netProfits.map((val, idx) => (
                          <td key={idx} className="num font-mono text-green-800 font-extrabold">₹{formatINR(val)}</td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 3.5: Projected Cash Flow Statement */}
              <div>
                <h3 className="text-center font-bold uppercase text-slate-900 border-b pb-1 mb-4">
                  PROJECTED CASH FLOW STATEMENT
                </h3>
                <div className="overflow-x-auto">
                  <table className="fin-table text-[11px] md:text-xs">
                    <thead>
                      <tr>
                        <th>Cash Flow Particulars</th>
                        {fyLabels.map((fy) => (
                          <th key={fy} className="text-center">{fy}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td colSpan={reportYears + 1} className="font-bold bg-slate-50">A. SOURCES OF FUNDS</td></tr>
                      <tr>
                        <td>Opening Cash & Bank Reserves</td>
                        {cashBalances.map((val, idx) => (
                          <td key={idx} className="num font-mono">₹{formatINR(idx === 0 ? 0 : cashBalances[idx - 1])}</td>
                        ))}
                      </tr>
                      <tr>
                        <td>Net Profit for the Period</td>
                        {netProfits.map((val, idx) => (
                          <td key={idx} className="num font-mono">₹{formatINR(val)}</td>
                        ))}
                      </tr>
                      <tr>
                        <td>Add: Depreciation Back (Non-cash)</td>
                        {depreciations.map((val, idx) => (
                          <td key={idx} className="num font-mono">₹{formatINR(val)}</td>
                        ))}
                      </tr>
                      <tr>
                        <td>Promoter's Equity Capital Infused</td>
                        {fyLabels.map((_, idx) => (
                          <td key={idx} className="num font-mono">₹{formatINR(idx === 0 ? promoterMargin : 0)}</td>
                        ))}
                      </tr>
                      {report.subsidy > 0 && (
                        <tr>
                          <td>Capital Subsidy Received</td>
                          {fyLabels.map((_, idx) => (
                            <td key={idx} className="num font-mono">₹{formatINR(idx === 0 ? report.subsidy : 0)}</td>
                          ))}
                        </tr>
                      )}
                      <tr>
                        <td>Bank Term Loan Disbursements</td>
                        {fyLabels.map((_, idx) => (
                          <td key={idx} className="num font-mono">₹{formatINR(idx === 0 ? report.loanAmount : 0)}</td>
                        ))}
                      </tr>
                      <tr>
                        <td>Increase in Current Liabilities (Creditors)</td>
                        {currLiabilities.map((val, idx) => (
                          <td key={idx} className="num font-mono">₹{formatINR(idx === 0 ? val : val - currLiabilities[idx - 1])}</td>
                        ))}
                      </tr>
                      <tr className="font-semibold bg-slate-50">
                        <td>TOTAL SOURCES (A)</td>
                        {fyLabels.map((_, idx) => {
                          const open = idx === 0 ? 0 : cashBalances[idx - 1];
                          const cap = idx === 0 ? promoterMargin : 0;
                          const sub = idx === 0 ? report.subsidy : 0;
                          const loan = idx === 0 ? report.loanAmount : 0;
                          const liab = idx === 0 ? currLiabilities[0] : currLiabilities[idx] - currLiabilities[idx - 1];
                          const tot = open + netProfits[idx] + depreciations[idx] + cap + sub + loan + liab;
                          return <td key={idx} className="num font-mono font-bold">₹{formatINR(tot)}</td>;
                        })}
                      </tr>
                      
                      <tr><td colSpan={reportYears + 1} className="font-bold bg-slate-50">B. APPLICATION OF FUNDS</td></tr>
                      <tr>
                        <td>Fixed Capital Outlays (Vehicle & Body)</td>
                        {fyLabels.map((_, idx) => (
                          <td key={idx} className="num font-mono">₹{formatINR(idx === 0 ? report.baseCost + report.bodyBuilding : 0)}</td>
                        ))}
                      </tr>
                      <tr>
                        <td>Principal Repayment of Term Loan</td>
                        {fyLabels.map((_, idx) => {
                          let prinThisFy = 0;
                          emiSchedule.forEach(row => {
                            if (row.fy === fyLabels[idx]) prinThisFy += row.prin;
                          });
                          return <td key={idx} className="num font-mono">₹{formatINR(prinThisFy)}</td>;
                        })}
                      </tr>
                      <tr>
                        <td>Increase in Sundry Debtors</td>
                        {debtors.map((val, idx) => (
                          <td key={idx} className="num font-mono">
                            ₹{formatINR(idx === 0 ? val : val - debtors[idx - 1])}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td>Swept Cash Surplus into Investments</td>
                        {investments.map((val, idx) => (
                          <td key={idx} className="num font-mono">
                            ₹{formatINR(idx === 0 ? val : Math.max(0, val - investments[idx - 1]))}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td>Proprietor Personal Drawings</td>
                        {drawings.map((val, idx) => (
                          <td key={idx} className="num font-mono">₹{formatINR(val)}</td>
                        ))}
                      </tr>
                      <tr className="font-semibold bg-slate-50">
                        <td>TOTAL APPLICATIONS (B)</td>
                        {fyLabels.map((_, idx) => {
                          const capEx = idx === 0 ? report.baseCost + report.bodyBuilding : 0;
                          let prinThisFy = 0;
                          emiSchedule.forEach(row => {
                            if (row.fy === fyLabels[idx]) prinThisFy += row.prin;
                          });
                          const deb = idx === 0 ? debtors[0] : debtors[idx] - debtors[idx - 1];
                          const inv = idx === 0 ? investments[0] : Math.max(0, investments[idx] - investments[idx - 1]);
                          const tot = capEx + prinThisFy + deb + inv + drawings[idx];
                          return <td key={idx} className="num font-mono font-bold">₹{formatINR(tot)}</td>;
                        })}
                      </tr>
                      <tr className="total-row">
                        <td>CLOSING LIQUID BALANCE (A - B)</td>
                        {cashBalances.map((val, idx) => (
                          <td key={idx} className="num font-mono font-extrabold text-blue-900">₹{formatINR(val)}</td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {activePreviewSection === "all" && renderPageBreak(5)}

              {/* 3.6: Projected Balance Sheet */}
              <div>
                <h3 className="text-center font-bold uppercase text-slate-900 border-b pb-1 mb-4">
                  PROJECTED BALANCE SHEET
                </h3>
                <div className="overflow-x-auto">
                  <table className="fin-table text-[11px] md:text-xs">
                    <thead>
                      <tr>
                        <th>LIABILITIES & CAPITAL</th>
                        {fyLabels.map((fy) => (
                          <th key={fy} className="text-center">{fy}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Proprietor Capital Account</td>
                        {capitals.map((val, idx) => (
                          <td key={idx} className="num font-mono">₹{formatINR(val)}</td>
                        ))}
                      </tr>
                      {report.subsidy > 0 && (
                        <tr>
                          <td>Capital Subsidy Reserves</td>
                          {fyLabels.map((_, idx) => (
                            <td key={idx} className="num font-mono">₹{formatINR(report.subsidy)}</td>
                          ))}
                        </tr>
                      )}
                      <tr>
                        <td>Bank Term Loan (Outstanding)</td>
                        {fyLoanClosingBalance().map((val, idx) => (
                          <td key={idx} className="num font-mono">₹{formatINR(val)}</td>
                        ))}
                      </tr>
                      <tr>
                        <td>Current Liabilities (Sundry Creditors)</td>
                        {currLiabilities.map((val, idx) => (
                          <td key={idx} className="num font-mono">₹{formatINR(val)}</td>
                        ))}
                      </tr>
                      <tr className="total-row">
                        <td>CONSOLIDATED LIABILITIES BALANCE</td>
                        {fyLabels.map((_, idx) => {
                          const sub = report.subsidy;
                          const tot = capitals[idx] + sub + fyLoanClosingBalance()[idx] + currLiabilities[idx];
                          return <td key={idx} className="num font-mono font-extrabold">₹{formatINR(tot)}</td>;
                        })}
                      </tr>

                      <tr><td colSpan={reportYears + 1} className="py-2 bg-slate-50">&nbsp;</td></tr>
                      <tr className="font-bold bg-slate-100">
                        <th>ASSETS & PROPERTIES</th>
                        {fyLabels.map((fy) => (
                          <th key={fy} className="text-center">{fy}</th>
                        ))}
                      </tr>
                      <tr>
                        <td>Fixed Assets (Vehicle Net WDV)</td>
                        {wdvList.map((val, idx) => (
                          <td key={idx} className="num font-mono">₹{formatINR(val)}</td>
                        ))}
                      </tr>
                      <tr>
                        <td>Sundry Debtors (O/S Hire Collections)</td>
                        {debtors.map((val, idx) => (
                          <td key={idx} className="num font-mono">₹{formatINR(val)}</td>
                        ))}
                      </tr>
                      <tr>
                        <td>Short-Term Investment Deposits</td>
                        {investments.map((val, idx) => (
                          <td key={idx} className="num font-mono">₹{formatINR(val)}</td>
                        ))}
                      </tr>
                      <tr>
                        <td>Cash-in-Hand & Operational Bank Reserves</td>
                        {cashBalances.map((val, idx) => (
                          <td key={idx} className="num font-mono">₹{formatINR(val)}</td>
                        ))}
                      </tr>
                      <tr className="total-row">
                        <td>CONSOLIDATED ASSETS BALANCE</td>
                        {fyLabels.map((_, idx) => {
                          const tot = wdvList[idx] + debtors[idx] + investments[idx] + cashBalances[idx];
                          return <td key={idx} className="num font-mono font-extrabold">₹{formatINR(tot)}</td>;
                        })}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {activePreviewSection === "all" && renderPageBreak(6)}

              {/* 3.7: Depreciation Schedule & DSCR */}
              <div className="space-y-8">
                <div>
                  <h3 className="text-center font-bold uppercase text-slate-900 border-b pb-1 mb-4">
                    DEPRECIATION SCHEDULE (WDV @ 15%)
                  </h3>
                  <table className="fin-table text-xs">
                    <thead>
                      <tr>
                        <th>Particulars</th>
                        {fyLabels.map((fy) => (
                          <th key={fy} className="text-center">{fy}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Opening Fixed Assets</td>
                        {fyLabels.map((_, idx) => (
                          <td key={idx} className="num font-mono">
                            ₹{formatINR(idx === 0 ? report.baseCost + report.bodyBuilding : wdvList[idx - 1])}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td>Depreciation Outlay (15%)</td>
                        {depreciations.map((val, idx) => (
                          <td key={idx} className="num font-mono text-red-600">₹{formatINR(val)}</td>
                        ))}
                      </tr>
                      <tr className="total-row">
                        <td>Closing Assets WDV</td>
                        {wdvList.map((val, idx) => (
                          <td key={idx} className="num font-mono font-bold">₹{formatINR(val)}</td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div>
                  <h3 className="text-center font-bold uppercase text-slate-900 border-b pb-1 mb-4">
                    DEBT SERVICE COVERAGE RATIO (DSCR)
                  </h3>
                  <table className="fin-table text-xs">
                    <thead>
                      <tr>
                        <th>Operational Item</th>
                        {fyLabels.map((fy) => (
                          <th key={fy} className="text-center">{fy}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Net Operating Profit (PAT)</td>
                        {netProfits.map((val, idx) => (
                          <td key={idx} className="num font-mono">₹{formatINR(val)}</td>
                        ))}
                      </tr>
                      <tr>
                        <td>Add: Depreciation Back</td>
                        {depreciations.map((val, idx) => (
                          <td key={idx} className="num font-mono">₹{formatINR(val)}</td>
                        ))}
                      </tr>
                      <tr>
                        <td>Add: Loan Interest Expense</td>
                        {interests.map((val, idx) => (
                          <td key={idx} className="num font-mono">₹{formatINR(val)}</td>
                        ))}
                      </tr>
                      <tr className="font-semibold bg-slate-50">
                        <td>Total Accruals Available (A)</td>
                        {fyLabels.map((_, idx) => {
                          const tot = netProfits[idx] + depreciations[idx] + interests[idx];
                          return <td key={idx} className="num font-mono font-bold">₹{formatINR(tot)}</td>;
                        })}
                      </tr>
                      <tr>
                        <td>Principal Loan Repaid</td>
                        {fyLabels.map((_, idx) => {
                          let prinThisFy = 0;
                          emiSchedule.forEach(row => {
                            if (row.fy === fyLabels[idx]) prinThisFy += row.prin;
                          });
                          return <td key={idx} className="num font-mono">₹{formatINR(prinThisFy)}</td>;
                        })}
                      </tr>
                      <tr>
                        <td>Interest Loan Repaid</td>
                        {interests.map((val, idx) => (
                          <td key={idx} className="num font-mono">₹{formatINR(val)}</td>
                        ))}
                      </tr>
                      <tr className="font-semibold bg-slate-50">
                        <td>Total Debt Obligations (B)</td>
                        {fyLabels.map((_, idx) => {
                          let prinThisFy = 0;
                          emiSchedule.forEach(row => {
                            if (row.fy === fyLabels[idx]) prinThisFy += row.prin;
                          });
                          const tot = prinThisFy + interests[idx];
                          return <td key={idx} className="num font-mono font-bold">₹{formatINR(tot)}</td>;
                        })}
                      </tr>
                      <tr className="total-row">
                        <td>DSCR (A / B)</td>
                        {dscrs.map((val, idx) => (
                          <td key={idx} className="num font-mono text-emerald-800 font-extrabold">
                            {val > 0 ? val.toFixed(2) : "-"}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                  <div className="text-center p-2.5 bg-slate-50 rounded border border-slate-200 mt-2 text-xs font-bold text-slate-800">
                    Average DSCR over tenure: <span className="text-blue-700 text-sm font-extrabold">{averageDscr.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {activePreviewSection === "all" && renderPageBreak(7)}

              {/* 3.8: Visual Loan Amortization & EMI Analytics */}
              <div className="force-page-break">
                <h3 className="text-center font-bold uppercase text-slate-900 border-b pb-1 mb-4">
                  DEBT REPAYMENT & EMI CHART ANALYTICS
                </h3>

                {/* KPI Metrics Dashboard Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                    <span className="text-[10px] uppercase font-extrabold text-slate-400 block tracking-wider">Requested Loan</span>
                    <strong className="text-sm font-mono font-bold text-slate-800 mt-1 block">
                      ₹{formatINR(report.loanAmount)}
                    </strong>
                    <span className="text-[9px] text-slate-500 block mt-0.5">Capital Principal</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                    <span className="text-[10px] uppercase font-extrabold text-slate-400 block tracking-wider">Interest Rate</span>
                    <strong className="text-sm font-mono font-bold text-blue-700 mt-1 block">
                      {report.interestRate}% P.A.
                    </strong>
                    <span className="text-[9px] text-slate-500 block mt-0.5">Annual Interest Comp.</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                    <span className="text-[10px] uppercase font-extrabold text-slate-400 block tracking-wider">Monthly EMI</span>
                    <strong className="text-sm font-mono font-bold text-indigo-700 mt-1 block">
                      ₹{formatINR(monthlyEmi)}
                    </strong>
                    <span className="text-[9px] text-slate-500 block mt-0.5">{report.tenureYears * 12} Installments</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                    <span className="text-[10px] uppercase font-extrabold text-slate-400 block tracking-wider">Interest Cost</span>
                    <strong className="text-sm font-mono font-bold text-red-600 mt-1 block">
                      ₹{formatINR(emiSchedule.reduce((sum, r) => sum + r.int, 0))}
                    </strong>
                    <span className="text-[9px] text-slate-500 block mt-0.5">
                      {((emiSchedule.reduce((sum, r) => sum + r.int, 0) / (report.loanAmount + emiSchedule.reduce((sum, r) => sum + r.int, 0))) * 100).toFixed(1)}% of Outlay
                    </span>
                  </div>
                </div>

                {/* Two Column Chart Block */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                  
                  {/* Left: Pie Chart showing Principal vs Interest Breakdown */}
                  <div className="md:col-span-5 bg-slate-50/50 border border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-between min-h-[300px]">
                    <h4 className="text-center font-bold text-xs uppercase tracking-wider text-slate-700 mb-2">
                      Total Repayment Breakup
                    </h4>
                    
                    <div className="w-full h-44 flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: "Principal", value: report.loanAmount },
                              { name: "Interest", value: emiSchedule.reduce((sum, r) => sum + r.int, 0) }
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={70}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            <Cell fill="#2563eb" /> {/* Principal: Blue-600 */}
                            <Cell fill="#dc2626" /> {/* Interest: Red-600 */}
                          </Pie>
                          <Tooltip 
                            formatter={(value: any) => [`₹${formatINR(value)}`, ""]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Chart Legend list */}
                    <div className="w-full space-y-2 mt-2 border-t border-slate-200 pt-3">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded bg-blue-600 block shrink-0" />
                          <span className="text-slate-600">Principal Loan Amount</span>
                        </div>
                        <span className="font-mono font-bold text-slate-800">
                          ₹{formatINR(report.loanAmount)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded bg-red-600 block shrink-0" />
                          <span className="text-slate-600">Interest Payable</span>
                        </div>
                        <span className="font-mono font-bold text-slate-800">
                          ₹{formatINR(emiSchedule.reduce((sum, r) => sum + r.int, 0))}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-200/60 font-bold">
                        <span className="text-slate-700">Total Borrowing Cost</span>
                        <span className="font-mono text-slate-950">
                          ₹{formatINR(report.loanAmount + emiSchedule.reduce((sum, r) => sum + r.int, 0))}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Area Chart showing decreasing outstanding balance */}
                  <div className="md:col-span-7 bg-slate-50/50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between min-h-[300px]">
                    <h4 className="text-center font-bold text-xs uppercase tracking-wider text-slate-700 mb-2">
                      Amortization Curve (Outstanding Balance)
                    </h4>

                    <div className="w-full h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={emiSchedule.filter((_, idx) => idx % (emiSchedule.length > 36 ? 3 : 1) === 0 || idx === emiSchedule.length - 1).map((row) => ({
                            name: `M${row.month}`,
                            Balance: Math.round(row.close),
                            PrincipalPaid: Math.round(row.prin),
                            InterestPaid: Math.round(row.int),
                          }))}
                          margin={{ top: 5, right: 10, left: -5, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient id="colorBal" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis 
                            dataKey="name" 
                            tick={{ fontSize: 9 }}
                            stroke="#94a3b8"
                          />
                          <YAxis 
                            tickFormatter={(v) => `₹${formatINR(v)}`}
                            tick={{ fontSize: 9 }}
                            stroke="#94a3b8"
                          />
                          <Tooltip 
                            formatter={(value: any) => [`₹${formatINR(value)}`, ""]}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="Balance" 
                            stroke="#2563eb" 
                            strokeWidth={2}
                            fillOpacity={1} 
                            fill="url(#colorBal)" 
                            name="Outstanding Principal"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    <p className="text-[10px] text-center text-slate-500 italic mt-2">
                      Amortization progression plotted quarterly. Smooth parabolic descent models standard compound interest reduction.
                    </p>
                  </div>

                </div>
              </div>

              {activePreviewSection === "all" && renderPageBreak(8)}

              {/* 3.9: Month by Month Loan Schedule */}
              <div className="force-page-break">
                <div className="flex justify-between items-center border-b pb-1 mb-4 no-print">
                  <h3 className="font-bold text-slate-900 uppercase">
                    TERM LOAN AMORTIZATION SCHEDULE
                  </h3>
                  <button
                    onClick={() => setShowAmortization(!showAmortization)}
                    className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1 border border-slate-300 rounded font-semibold flex items-center gap-1.5"
                  >
                    {showAmortization ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        Collapse Monthly List
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        Expand {emiSchedule.length} Months
                      </>
                    )}
                  </button>
                </div>

                <div className="print-only-show bg-slate-50 p-3 rounded text-center mb-4 text-xs italic font-semibold border text-slate-600 no-print">
                  Amortization schedule (Page 8) is truncated for layout. Click "Expand" to view all monthly cycles in web-preview.
                </div>

                {(showAmortization || activePreviewSection === "financials") && (
                  <div className="overflow-x-auto transition-all duration-300">
                    <table className="fin-table text-[9px] md:text-xs">
                      <thead>
                        <tr>
                          <th className="text-center">Mo.</th>
                          <th className="text-center">Payment Date</th>
                          <th className="text-center">FY</th>
                          <th>Opening Bal (₹)</th>
                          <th>Equated EMI (₹)</th>
                          <th>Interest (₹)</th>
                          <th>Principal Paid (₹)</th>
                          <th>Closing Bal (₹)</th>
                          <th className="text-center">Type</th>
                        </tr>
                      </thead>
                      <tbody>
                        {emiSchedule.map((row) => (
                          <tr 
                            key={row.month} 
                            className={`hover:bg-slate-50 ${row.isMoratorium ? "bg-amber-50/50" : ""}`}
                          >
                            <td className="text-center font-mono">{row.month}</td>
                            <td className="text-center font-mono">{row.dateStr}</td>
                            <td className="text-center font-mono text-slate-500">{row.fy}</td>
                            <td className="num font-mono">₹{formatINR(row.open)}</td>
                            <td className="num font-mono">₹{formatINR(row.emi)}</td>
                            <td className="num font-mono text-red-600">₹{formatINR(row.int)}</td>
                            <td className="num font-mono text-green-700">₹{formatINR(row.prin)}</td>
                            <td className="num font-mono font-semibold">₹{formatINR(row.close)}</td>
                            <td className="text-center text-[10px] text-slate-500 italic">
                              {row.isMoratorium ? "Moratorium" : "Amortized"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>
      </div>

      {/* PDF Print Instructions Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 no-print">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-blue-600 animate-pulse" />
                <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                  Professional PDF Export Guide
                </h3>
              </div>
              <button 
                onClick={() => setShowPrintModal(false)}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-600 leading-relaxed custom-scroll">
              
              {printError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200/80 rounded-xl text-[11px] text-rose-800">
                  <div className="flex gap-2 items-start">
                    <Info className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold">Iframe Print Blocked by Browser:</strong>
                      <p className="mt-1">
                        Your browser blocked printing from inside this preview. To save as PDF, please click the <strong className="font-bold text-rose-900">"Open in New Tab"</strong> button in the top-right of your screen, then click print there.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {isInIframe && !printError && (
                <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl text-[11px] text-amber-800">
                  <div className="flex gap-2 items-start">
                    <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold">Iframe Preview Mode Detected:</strong>
                      <p className="mt-1">
                        Browsers often block or misalign printing inside sandbox iframes. For a perfect 100% vector-sharp printout, please click the <strong className="font-bold">"Open in New Tab"</strong> button in the top right of your screen, then click print there.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3.5">
                <h4 className="font-bold text-slate-800 uppercase tracking-wide text-[10px]">
                  Required Browser Print Settings:
                </h4>
                
                <div className="space-y-2.5">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 bg-blue-50 border border-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0">1</span>
                    <div>
                      <p className="font-bold text-slate-800">Destination: Save as PDF</p>
                      <p className="text-slate-500 text-[11px]">Select "Save as PDF" or "Microsoft Print to PDF" in your browser print dialog.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 bg-blue-50 border border-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0">2</span>
                    <div>
                      <p className="font-bold text-slate-800">Enable Background Graphics (Crucial)</p>
                      <p className="text-slate-500 text-[11px]">
                        Expand <strong className="font-semibold">"More Settings"</strong>, then check the box next to <strong className="font-bold text-blue-700">"Background graphics"</strong>. This renders the professional gray borders, table headers, and the financial EMI charts.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 bg-blue-50 border border-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0">3</span>
                    <div>
                      <p className="font-bold text-slate-800">Disable Headers & Footers</p>
                      <p className="text-slate-500 text-[11px]">Uncheck "Headers and footers" to remove default browser URL stamps and page numbers from the margins.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 bg-blue-50 border border-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0">4</span>
                    <div>
                      <p className="font-bold text-slate-800">Margins: None or Default</p>
                      <p className="text-slate-500 text-[11px]">Set Margins to "None" or "Default" so the vector layout fits the print area.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-xl space-y-1.5">
                <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-widest">Document Meta</span>
                <p className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  Audit-Grade CA Dossier Structure Included
                </p>
                <p className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  Auto Page-Breaks & Vector Amortization Charts Ready
                </p>
              </div>

            </div>

            {/* Footer buttons */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-3 shrink-0">
              <button
                onClick={() => setShowPrintModal(false)}
                className="w-full sm:w-auto px-4 py-2 border border-slate-200 rounded-xl font-bold text-[11px] text-slate-600 hover:text-slate-800 hover:bg-slate-100 uppercase tracking-wider transition-colors"
              >
                Close
              </button>
              
              <button
                onClick={() => {
                  setPrintError(null);
                  setTimeout(() => {
                    const success = triggerBrowserPrint();
                    if (success) {
                      setShowPrintModal(false);
                    }
                  }, 100);
                }}
                className="w-full sm:flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/10 uppercase tracking-widest transition-all active:scale-[0.98]"
              >
                <Printer className="w-3.5 h-3.5" />
                Proceed to Print
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
