import { prisma } from "@/lib/prisma";
import { FileText, Download, Calendar, User, TrendingUp, CheckCircle, Clock } from "lucide-react";
import { format } from "date-fns";

const REPORT_CATALOG = [
  { type: "wastewater_compliance", category: "Compliance", label: "Wastewater Compliance", description: "pH, COD, TSS, effluent data for BAPEDAL submission", formats: ["PDF", "CSV"], icon: "💧", color: "#8b5cf6", roles: "EHS / Compliance" },
  { type: "iso50001_evidence", category: "Compliance", label: "ISO 50001 Evidence", description: "Energy management evidence pack for audit", formats: ["PDF", "XLSX"], icon: "⚡", color: "#f59e0b", roles: "Energy Manager" },
  { type: "calibration_status", category: "Compliance", label: "Calibration Status Report", description: "Sensor calibration schedule, overdue list, certificates", formats: ["PDF", "XLSX"], icon: "🔧", color: "#6366f1", roles: "Technician" },
  { type: "daily_operations", category: "Operations", label: "Daily Operations Report", description: "Asset status, alerts, consumption summary for shift handover", formats: ["PDF", "CSV"], icon: "📋", color: "#3b82f6", roles: "Operations Supervisor" },
  { type: "weekly_variance", category: "Operations", label: "Weekly Variance Report", description: "Consumption vs baseline, deviations, anomaly summary", formats: ["PDF", "XLSX", "CSV"], icon: "📊", color: "#f59e0b", roles: "Energy Manager" },
  { type: "peak_demand_analysis", category: "Operations", label: "Peak Demand Analysis", description: "Peak demand events, tariff exposure, load shedding opportunities", formats: ["PDF", "XLSX"], icon: "⚡", color: "#ef4444", roles: "Energy Manager" },
  { type: "water_balance", category: "Operations", label: "Water Balance Report", description: "Water input, consumption, discharge, NRW reconciliation", formats: ["PDF", "XLSX"], icon: "💧", color: "#3b82f6", roles: "Operations Supervisor" },
  { type: "monthly_scorecard", category: "Financial", label: "Monthly Executive Scorecard", description: "KPIs, cost, carbon, site rankings for management review", formats: ["PDF", "XLSX"], icon: "🎯", color: "#e11d48", roles: "Executive" },
  { type: "quarterly_board", category: "Financial", label: "Quarterly Board Pack", description: "Executive summary with ROI analysis for board review", formats: ["PDF"], icon: "📑", color: "#6366f1", roles: "Executive" },
  { type: "cost_allocation", category: "Financial", label: "Cost Allocation Report", description: "Energy/water/gas cost split by department and cost center", formats: ["XLSX", "CSV"], icon: "💰", color: "#22c55e", roles: "Finance" },
  { type: "energy_benchmark", category: "Financial", label: "Energy Benchmarking", description: "Site-vs-site energy intensity (kWh/m², kWh/unit)", formats: ["PDF", "XLSX"], icon: "📈", color: "#f59e0b", roles: "Energy Manager" },
  { type: "scope2_emissions", category: "ESG", label: "Scope 2 Emissions Report", description: "CDP-format GHG disclosure with location & market-based methods", formats: ["PDF", "XLSX", "CSV"], icon: "🌿", color: "#22c55e", roles: "EHS / Compliance" },
  { type: "gas_ldar_incident", category: "Incidents", label: "Gas / LDAR Incident Report", description: "Leak detection and repair log, fugitive emissions evidence", formats: ["PDF", "CSV"], icon: "💨", color: "#06b6d4", roles: "EHS / Compliance" },
  { type: "worker_safety", category: "Incidents", label: "Worker Safety Report", description: "Gas exposure events, OSHA 1910.146 confined space log", formats: ["PDF"], icon: "🦺", color: "#ef4444", roles: "EHS / Compliance" },
] as const;

type Category = "All" | "Compliance" | "Operations" | "Financial" | "ESG" | "Incidents";
const CATEGORIES: Category[] = ["All", "Compliance", "Operations", "Financial", "ESG", "Incidents"];

const categoryStyle: Record<string, { bg: string; text: string }> = {
  Compliance: { bg: "#8b5cf620", text: "#8b5cf6" },
  Operations: { bg: "#3b82f620", text: "#3b82f6" },
  Financial:  { bg: "#22c55e20", text: "#22c55e" },
  ESG:        { bg: "#10b98120", text: "#10b981" },
  Incidents:  { bg: "#ef444420", text: "#ef4444" },
};

const formatBadge: Record<string, string> = {
  PDF:  "bg-[#e11d4820] text-[#e11d48]",
  XLSX: "bg-[#22c55e20] text-[#22c55e]",
  CSV:  "bg-[#3b82f620] text-[#3b82f6]",
};

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const activeCategory = (CATEGORIES.includes(category as Category) ? category : "All") as Category;

  const [reports, totalReports, thisMonthCount] = await Promise.all([
    prisma.report.findMany({
      include: { generator: { select: { name: true, email: true, role: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.report.count(),
    prisma.report.count({
      where: {
        createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
      },
    }),
  ]);

  const filteredReports = activeCategory === "All"
    ? reports
    : reports.filter(r => {
        const cat = REPORT_CATALOG.find(c => c.type === r.reportType);
        return cat?.category === activeCategory;
      });

  const filteredCatalog = activeCategory === "All"
    ? REPORT_CATALOG
    : REPORT_CATALOG.filter(c => c.category === activeCategory);

  // Group catalog by category for "All" view
  const catalogByCategory = (CATEGORIES.filter(c => c !== "All") as Exclude<Category, "All">[]).reduce(
    (acc, cat) => {
      acc[cat] = REPORT_CATALOG.filter(r => r.category === cat) as (typeof REPORT_CATALOG)[number][];
      return acc;
    },
    {} as Record<Exclude<Category, "All">, (typeof REPORT_CATALOG)[number][]>,
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-white text-2xl font-bold">Report Center</h1>
        <p className="text-[#888888] text-sm mt-0.5">Generate, schedule, and download compliance and operational reports</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#e11d4810] flex items-center justify-center">
            <FileText className="w-4 h-4 text-[#e11d48]" />
          </div>
          <div>
            <p className="text-white text-xl font-bold">{totalReports}</p>
            <p className="text-[#888888] text-xs">Total Reports</p>
          </div>
        </div>
        <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#3b82f610] flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-[#3b82f6]" />
          </div>
          <div>
            <p className="text-white text-xl font-bold">{thisMonthCount}</p>
            <p className="text-[#888888] text-xs">This Month</p>
          </div>
        </div>
        <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#22c55e10] flex items-center justify-center">
            <CheckCircle className="w-4 h-4 text-[#22c55e]" />
          </div>
          <div>
            <p className="text-white text-xl font-bold">{REPORT_CATALOG.length}</p>
            <p className="text-[#888888] text-xs">Report Types</p>
          </div>
        </div>
        <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#f59e0b10] flex items-center justify-center">
            <Clock className="w-4 h-4 text-[#f59e0b]" />
          </div>
          <div>
            <p className="text-white text-xl font-bold">3</p>
            <p className="text-[#888888] text-xs">Scheduled Reports</p>
          </div>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex items-center gap-1 border-b border-[#2a2a2a]">
        {CATEGORIES.map(cat => (
          <a
            key={cat}
            href={cat === "All" ? "/reports" : `/reports?category=${cat}`}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeCategory === cat
                ? "border-[#e11d48] text-white"
                : "border-transparent text-[#888888] hover:text-white"
            }`}
          >
            {cat}
            {cat !== "All" && (
              <span className="ml-1.5 text-xs text-[#888888]">
                ({REPORT_CATALOG.filter(r => r.category === cat).length})
              </span>
            )}
          </a>
        ))}
      </div>

      {/* Generate section */}
      <div>
        <h2 className="text-white font-semibold mb-4">Generate New Report</h2>

        {activeCategory === "All" ? (
          // Grouped view
          <div className="space-y-6">
            {Object.entries(catalogByCategory).map(([cat, items]) => {
              const cs = categoryStyle[cat] ?? { bg: "#88888820", text: "#888888" };
              return (
                <div key={cat}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs px-2 py-0.5 rounded font-medium" style={{ backgroundColor: cs.bg, color: cs.text }}>{cat}</span>
                    <span className="text-[#888888] text-xs">{items.length} report type{items.length > 1 ? "s" : ""}</span>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                    {items.map(rt => (
                      <ReportTypeCard key={rt.type} rt={rt} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
            {filteredCatalog.map(rt => (
              <ReportTypeCard key={rt.type} rt={rt} />
            ))}
          </div>
        )}
      </div>

      {/* Recent reports */}
      <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl">
        <div className="flex items-center justify-between p-5 border-b border-[#2a2a2a]">
          <div className="flex items-center gap-2">
            <h2 className="text-white font-semibold">Generated Reports</h2>
            <span className="text-[#888888] text-xs bg-[#1a1a1a] border border-[#2a2a2a] rounded px-2 py-0.5">{filteredReports.length}</span>
          </div>
          {activeCategory !== "All" && (
            <span className="text-xs px-2 py-0.5 rounded font-medium" style={{ backgroundColor: categoryStyle[activeCategory]?.bg, color: categoryStyle[activeCategory]?.text }}>
              Filtered: {activeCategory}
            </span>
          )}
        </div>

        {filteredReports.length === 0 ? (
          <div className="py-12 text-center">
            <FileText className="w-10 h-10 text-[#2a2a2a] mx-auto mb-3" />
            <p className="text-[#888888] text-sm">No reports generated yet</p>
            <p className="text-[#888888] text-xs mt-1">Use the cards above to generate your first report</p>
          </div>
        ) : (
          <div className="divide-y divide-[#1a1a1a]">
            {filteredReports.map((report) => {
              const catalogEntry = REPORT_CATALOG.find(c => c.type === report.reportType);
              const cs = categoryStyle[catalogEntry?.category ?? ""] ?? { bg: "#88888820", text: "#888888" };
              return (
                <div key={report.id} className="flex items-center gap-4 p-4 hover:bg-[#1a1a1a] transition-colors">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                    style={{ backgroundColor: `${catalogEntry?.color ?? "#888"}15` }}>
                    {catalogEntry?.icon ?? "📄"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-white font-medium text-sm">{report.title}</p>
                      {catalogEntry && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ backgroundColor: cs.bg, color: cs.text }}>
                          {catalogEntry.category}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      <span className="text-[#888888] text-xs flex items-center gap-1">
                        <Calendar className="w-3 h-3" />{report.period}
                      </span>
                      <span className="text-[#888888] text-xs flex items-center gap-1">
                        <User className="w-3 h-3" />{report.generator.name}
                      </span>
                      <span className="text-[#888888] text-xs">{format(new Date(report.createdAt), "MMM d, yyyy HH:mm")}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded ${report.status === "ready" ? "bg-[#22c55e20] text-[#22c55e]" : "bg-[#f59e0b20] text-[#f59e0b]"}`}>
                      {report.status}
                    </span>
                    {catalogEntry?.formats.map(fmt => (
                      <button key={fmt} className={`flex items-center gap-1 text-xs px-2 py-1 rounded border border-[#2a2a2a] hover:border-[#3a3a3a] transition-colors ${formatBadge[fmt]}`}>
                        <Download className="w-3 h-3" />
                        {fmt}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function ReportTypeCard({ rt }: { rt: (typeof REPORT_CATALOG)[number] }) {
  const cs = categoryStyle[rt.category] ?? { bg: "#88888820", text: "#888888" };
  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 space-y-3 hover:border-[#e11d48] transition-colors cursor-pointer group">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl leading-none">{rt.icon}</span>
          <span className="text-[10px] px-2 py-0.5 rounded font-medium" style={{ backgroundColor: cs.bg, color: cs.text }}>
            {rt.category}
          </span>
        </div>
        <FileText className="w-3.5 h-3.5 text-[#444] group-hover:text-[#e11d48] transition-colors flex-shrink-0 mt-0.5" />
      </div>
      <div>
        <p className="text-white text-sm font-medium leading-tight">{rt.label}</p>
        <p className="text-[#888888] text-xs mt-1 leading-relaxed">{rt.description}</p>
      </div>
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-1">
          {rt.formats.map(fmt => (
            <span key={fmt} className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${formatBadge[fmt]}`}>{fmt}</span>
          ))}
        </div>
        <span className="text-[10px] text-[#888888]">{rt.roles}</span>
      </div>
      <div className="border-t border-[#2a2a2a] pt-2">
        <span className="text-[10px] text-[#e11d48] font-medium group-hover:underline">Generate report →</span>
      </div>
    </div>
  );
}
