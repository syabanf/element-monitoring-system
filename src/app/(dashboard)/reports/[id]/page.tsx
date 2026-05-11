import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { FileText, Download, Calendar, User, ArrowLeft, CheckCircle } from "lucide-react";

const REPORT_CATALOG = [
  { type: "wastewater_compliance", category: "Compliance", label: "Wastewater Compliance", icon: "💧", color: "#6D28D9" },
  { type: "iso50001_evidence", category: "Compliance", label: "ISO 50001 Evidence", icon: "⚡", color: "#B45309" },
  { type: "calibration_status", category: "Compliance", label: "Calibration Status", icon: "🔧", color: "#1E5FA8" },
  { type: "daily_operations", category: "Operations", label: "Daily Operations", icon: "📋", color: "#1E5FA8" },
  { type: "weekly_variance", category: "Operations", label: "Weekly Variance", icon: "📊", color: "#B45309" },
  { type: "peak_demand_analysis", category: "Operations", label: "Peak Demand Analysis", icon: "⚡", color: "#B91C1C" },
  { type: "water_balance", category: "Operations", label: "Water Balance", icon: "💧", color: "#1E5FA8" },
  { type: "monthly_scorecard", category: "Financial", label: "Monthly Scorecard", icon: "🎯", color: "#B8901A" },
  { type: "quarterly_board", category: "Financial", label: "Quarterly Board Pack", icon: "📑", color: "#6D28D9" },
  { type: "cost_allocation", category: "Financial", label: "Cost Allocation", icon: "💰", color: "#166534" },
  { type: "energy_benchmark", category: "Financial", label: "Energy Benchmarking", icon: "📈", color: "#B45309" },
  { type: "scope2_emissions", category: "ESG", label: "Scope 2 Emissions", icon: "🌿", color: "#166534" },
  { type: "gas_ldar_incident", category: "Incidents", label: "Gas / LDAR Incident", icon: "💨", color: "#0E7490" },
  { type: "worker_safety", category: "Incidents", label: "Worker Safety", icon: "🦺", color: "#B91C1C" },
];

const categoryStyle: Record<string, { bg: string; text: string }> = {
  Compliance: { bg: "#F5F3FF", text: "#6D28D9" },
  Operations: { bg: "#EFF6FF", text: "#1E5FA8" },
  Financial:  { bg: "#FEF7E6", text: "#B8901A" },
  ESG:        { bg: "#F0FDF4", text: "#166534" },
  Incidents:  { bg: "#FEF2F2", text: "#B91C1C" },
};

// Simulated preview data per report type
const REPORT_PREVIEW: Record<string, { headers: string[]; rows: string[][] }> = {
  wastewater_compliance: {
    headers: ["Date", "pH", "COD (mg/L)", "TSS (mg/L)", "Flow (m³/h)", "Status"],
    rows: [
      ["2026-05-11", "7.8", "180", "42", "48.2", "⚠ NEAR LIMIT"],
      ["2026-05-10", "7.6", "172", "38", "46.1", "✓ COMPLIANT"],
      ["2026-05-09", "7.4", "165", "35", "45.8", "✓ COMPLIANT"],
      ["2026-05-08", "7.9", "188", "40", "47.3", "⚠ NEAR LIMIT"],
      ["2026-05-07", "7.3", "158", "32", "44.9", "✓ COMPLIANT"],
    ],
  },
  daily_operations: {
    headers: ["Site", "Assets", "Online Sensors", "Open Alerts", "kWh Today", "Status"],
    rows: [
      ["Jakarta Industrial Park", "24", "48/50", "2", "52,840", "✓ OK"],
      ["Surabaya Plant", "20", "38/40", "1", "41,200", "✓ OK"],
      ["Bandung Factory", "18", "35/36", "0", "28,460", "✓ OK"],
      ["Semarang Facility", "18", "36/36", "2", "20,000", "⚠ ALERTS"],
    ],
  },
  scope2_emissions: {
    headers: ["Site", "kWh (MTD)", "Emission Factor", "tCO₂e (MTD)", "Market-based", "YTD tCO₂e"],
    rows: [
      ["Jakarta Industrial Park", "1,245,000", "0.734 kg/kWh", "913.8", "892.1", "4,012"],
      ["Surabaya Plant", "984,000", "0.734 kg/kWh", "722.3", "708.4", "3,180"],
      ["Bandung Factory", "682,000", "0.734 kg/kWh", "500.6", "490.2", "2,204"],
      ["Semarang Facility", "423,000", "0.734 kg/kWh", "310.4", "304.1", "1,368"],
    ],
  },
  monthly_scorecard: {
    headers: ["KPI", "Target", "Actual", "Variance", "Status"],
    rows: [
      ["Energy Cost", "IDR 720M", "IDR 694M", "−3.6%", "✓ BETTER"],
      ["Water Consumption", "240,000 m³", "252,000 m³", "+5.0%", "⚠ OVER"],
      ["Carbon tCO₂e", "1,760 t", "1,842 t", "+4.7%", "⚠ OVER"],
      ["Open Alerts MTD", "< 50", "38", "−24%", "✓ BETTER"],
      ["Sensor Uptime", "> 95%", "97.2%", "+2.2%", "✓ BETTER"],
    ],
  },
};

function getPreviewData(reportType: string) {
  return REPORT_PREVIEW[reportType] ?? {
    headers: ["Parameter", "Value", "Period", "Status"],
    rows: [
      ["Data available after generation", "—", "—", "—"],
      ["Download CSV for full dataset", "—", "—", "—"],
    ],
  };
}

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const report = await prisma.report.findUnique({
    where: { id },
    include: { generator: { select: { name: true, email: true, role: true } } },
  });

  if (!report) notFound();

  const catalogEntry = REPORT_CATALOG.find(c => c.type === report.reportType);
  const preview = getPreviewData(report.reportType);
  const cs = categoryStyle[catalogEntry?.category ?? ""] ?? { bg: "#F5F3EE", text: "#9C9285" };

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      {/* Back */}
      <a href="/reports" className="inline-flex items-center gap-1.5 text-[#9C9285] hover:text-[#1C1714] text-sm transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Report Center
      </a>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 bg-[#F5F3EE]">
            {catalogEntry?.icon ?? "📄"}
          </div>
          <div>
            <h1 className="text-[#1C1714] text-xl font-bold">{report.title}</h1>
            <div className="flex items-center gap-3 mt-1 text-xs text-[#9C9285] flex-wrap">
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{report.period}</span>
              <span className="flex items-center gap-1"><User className="w-3 h-3" />{report.generator.name} ({report.generator.role})</span>
              <span>{format(new Date(report.createdAt), "MMM d, yyyy HH:mm")}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${report.status === "ready" ? "bg-[#F0FDF4] text-[#166534]" : "bg-[#FFFBEB] text-[#B45309]"}`}>
            {report.status}
          </span>
          <button className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg bg-[#B8901A] hover:bg-[#9A7A14] text-white transition-colors font-medium">
            <Download className="w-3.5 h-3.5" />
            Download CSV
          </button>
          <button className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg bg-white border border-[#E5DDD0] hover:border-[#D4C8B8] text-[#1C1714] transition-colors">
            <FileText className="w-3.5 h-3.5" />
            Download PDF
          </button>
        </div>
      </div>

      {/* Metadata cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Report Type", value: catalogEntry?.label ?? report.reportType },
          { label: "Category", value: catalogEntry?.category ?? "—" },
          { label: "Period", value: report.period },
          { label: "Generated By", value: report.generator.name },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white border border-[#E5DDD0] rounded-xl p-4 shadow-sm">
            <p className="text-[#9C9285] text-xs font-semibold uppercase tracking-wider mb-1">{label}</p>
            <p className="text-[#1C1714] font-medium text-sm">{value}</p>
          </div>
        ))}
      </div>

      {/* Data preview */}
      <div className="bg-white border border-[#E5DDD0] rounded-xl overflow-hidden shadow-sm">
        <div className="flex items-center justify-between p-5 border-b border-[#EDE8E0]">
          <div className="flex items-center gap-2">
            <h3 className="text-[#1C1714] font-bold">Data Preview</h3>
            <span className="text-[#9C9285] text-xs">Showing sample rows</span>
          </div>
          <div className="flex items-center gap-1 text-[#166534] text-xs">
            <CheckCircle className="w-3 h-3" />
            <span>Ready to export</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F5F3EE] border-b border-[#E5DDD0]">
                {preview.headers.map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-bold text-[#9C9285] uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {preview.rows.map((row, i) => (
                <tr key={i} className="border-b border-[#EDE8E0] hover:bg-[#F5F3EE] transition-colors last:border-0">
                  {row.map((cell, j) => (
                    <td key={j} className={`px-5 py-3 text-sm ${j === 0 ? "text-[#1C1714] font-medium" : "text-[#5C5248]"} ${cell.includes("✓") ? "text-[#166534] font-medium" : cell.includes("⚠") ? "text-[#B45309] font-medium" : ""}`}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-[#EDE8E0] bg-[#F5F3EE]">
          <p className="text-[#9C9285] text-xs">Full dataset available in CSV / PDF export. Preview shows representative rows only.</p>
        </div>
      </div>

      {/* Parameters used */}
      {report.parameters && (
        <div className="bg-white border border-[#E5DDD0] rounded-xl p-5 shadow-sm">
          <h3 className="text-[#1C1714] font-bold mb-3">Report Parameters</h3>
          <pre className="text-[#5C5248] text-xs font-mono bg-[#F5F3EE] border border-[#EDE8E0] rounded-lg p-4 overflow-x-auto">
            {JSON.stringify(report.parameters, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
