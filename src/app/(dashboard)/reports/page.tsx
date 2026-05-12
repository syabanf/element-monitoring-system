import { prisma } from "@/lib/prisma";
import type { LucideProps } from "lucide-react";
import {
  FileText, Download, Calendar, User, TrendingUp, CheckCircle, Clock,
  Droplets, Zap, Wrench, ClipboardList, BarChart2, Target,
  BookOpen, DollarSign, Leaf, Wind, ShieldCheck,
} from "lucide-react";
import { SearchableCatalog } from "./SearchableCatalog";

type IconComponent = React.FC<LucideProps>;
import { format } from "date-fns";

const REPORT_CATALOG: Array<{
  type: string; category: string; label: string; description: string;
  formats: string[]; icon: IconComponent; color: string; roles: string;
}> = [
  { type: "wastewater_compliance", category: "Compliance", label: "Wastewater Compliance",     description: "pH, COD, TSS, effluent data for BAPEDAL submission",            formats: ["PDF", "CSV"],        icon: Droplets,    color: "#6D28D9", roles: "EHS / Compliance" },
  { type: "iso50001_evidence",     category: "Compliance", label: "ISO 50001 Evidence",         description: "Energy management evidence pack for audit",                     formats: ["PDF", "XLSX"],       icon: Zap,         color: "#B45309", roles: "Energy Manager" },
  { type: "calibration_status",    category: "Compliance", label: "Calibration Status Report",  description: "Sensor calibration schedule, overdue list, certificates",       formats: ["PDF", "XLSX"],       icon: Wrench,      color: "#1E5FA8", roles: "Technician" },
  { type: "daily_operations",      category: "Operations", label: "Daily Operations Report",    description: "Asset status, alerts, consumption summary for shift handover", formats: ["PDF", "CSV"],        icon: ClipboardList, color: "#1E5FA8", roles: "Operations Supervisor" },
  { type: "weekly_variance",       category: "Operations", label: "Weekly Variance Report",     description: "Consumption vs baseline, deviations, anomaly summary",          formats: ["PDF", "XLSX", "CSV"], icon: BarChart2,  color: "#B45309", roles: "Energy Manager" },
  { type: "peak_demand_analysis",  category: "Operations", label: "Peak Demand Analysis",       description: "Peak demand events, tariff exposure, load shedding opportunities", formats: ["PDF", "XLSX"],    icon: Zap,         color: "#B91C1C", roles: "Energy Manager" },
  { type: "water_balance",         category: "Operations", label: "Water Balance Report",       description: "Water input, consumption, discharge, NRW reconciliation",       formats: ["PDF", "XLSX"],       icon: Droplets,    color: "#1E5FA8", roles: "Operations Supervisor" },
  { type: "monthly_scorecard",     category: "Financial",  label: "Monthly Executive Scorecard",description: "KPIs, cost, carbon, site rankings for management review",       formats: ["PDF", "XLSX"],       icon: Target,      color: "#B8901A", roles: "Executive" },
  { type: "quarterly_board",       category: "Financial",  label: "Quarterly Board Pack",       description: "Executive summary with ROI analysis for board review",          formats: ["PDF"],               icon: BookOpen,    color: "#6D28D9", roles: "Executive" },
  { type: "cost_allocation",       category: "Financial",  label: "Cost Allocation Report",     description: "Energy/water/gas cost split by department and cost center",     formats: ["XLSX", "CSV"],       icon: DollarSign,  color: "#166534", roles: "Finance" },
  { type: "energy_benchmark",      category: "Financial",  label: "Energy Benchmarking",        description: "Site-vs-site energy intensity (kWh/m², kWh/unit)",              formats: ["PDF", "XLSX"],       icon: TrendingUp,  color: "#B45309", roles: "Energy Manager" },
  { type: "scope2_emissions",      category: "ESG",        label: "Scope 2 Emissions Report",   description: "CDP-format GHG disclosure with location & market-based methods",formats: ["PDF", "XLSX", "CSV"], icon: Leaf,       color: "#166534", roles: "EHS / Compliance" },
  { type: "gas_ldar_incident",     category: "Incidents",  label: "Gas / LDAR Incident Report", description: "Leak detection and repair log, fugitive emissions evidence",    formats: ["PDF", "CSV"],        icon: Wind,        color: "#0E7490", roles: "EHS / Compliance" },
  { type: "worker_safety",         category: "Incidents",  label: "Worker Safety Report",       description: "Gas exposure events, OSHA 1910.146 confined space log",         formats: ["PDF"],               icon: ShieldCheck, color: "#B91C1C", roles: "EHS / Compliance" },
];

type Category = "All" | "Compliance" | "Operations" | "Financial" | "ESG" | "Incidents";
const CATEGORIES: Category[] = ["All", "Compliance", "Operations", "Financial", "ESG", "Incidents"];

const categoryStyle: Record<string, { bg: string; text: string }> = {
  Compliance: { bg: "#F5F3FF", text: "#6D28D9" },
  Operations: { bg: "#EFF6FF", text: "#1E5FA8" },
  Financial:  { bg: "#FEF7E6", text: "#B8901A" },
  ESG:        { bg: "#F0FDF4", text: "#166534" },
  Incidents:  { bg: "#FEF2F2", text: "#B91C1C" },
};

const formatBadge: Record<string, string> = {
  PDF:  "bg-[#FEF2F2] text-[#B91C1C]",
  XLSX: "bg-[#F0FDF4] text-[#166534]",
  CSV:  "bg-[#EFF6FF] text-[#1E5FA8]",
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[#0D1B35] text-2xl font-bold">Report Center</h1>
        <p className="text-[#6378A0] text-sm mt-0.5">Generate, schedule, and download compliance and operational reports</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#D9E2F0] rounded-xl p-5 shadow-sm flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#FEF7E6] flex items-center justify-center">
            <FileText className="w-4 h-4 text-[#B8901A]" />
          </div>
          <div>
            <p className="text-[#0D1B35] text-xl font-bold">{totalReports}</p>
            <p className="text-[#6378A0] text-xs">Total Reports</p>
          </div>
        </div>
        <div className="bg-white border border-[#D9E2F0] rounded-xl p-5 shadow-sm flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#EFF6FF] flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-[#1E5FA8]" />
          </div>
          <div>
            <p className="text-[#0D1B35] text-xl font-bold">{thisMonthCount}</p>
            <p className="text-[#6378A0] text-xs">This Month</p>
          </div>
        </div>
        <div className="bg-white border border-[#D9E2F0] rounded-xl p-5 shadow-sm flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#F0FDF4] flex items-center justify-center">
            <CheckCircle className="w-4 h-4 text-[#166534]" />
          </div>
          <div>
            <p className="text-[#0D1B35] text-xl font-bold">{REPORT_CATALOG.length}</p>
            <p className="text-[#6378A0] text-xs">Report Types</p>
          </div>
        </div>
        <div className="bg-white border border-[#D9E2F0] rounded-xl p-5 shadow-sm flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#FFFBEB] flex items-center justify-center">
            <Clock className="w-4 h-4 text-[#B45309]" />
          </div>
          <div>
            <p className="text-[#0D1B35] text-xl font-bold">3</p>
            <p className="text-[#6378A0] text-xs">Scheduled Reports</p>
          </div>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex items-center gap-1 border-b border-[#D9E2F0]">
        {CATEGORIES.map(cat => (
          <a
            key={cat}
            href={cat === "All" ? "/reports" : `/reports?category=${cat}`}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeCategory === cat
                ? "border-[#B8901A] text-[#B8901A]"
                : "border-transparent text-[#6378A0] hover:text-[#0D1B35]"
            }`}
          >
            {cat}
            {cat !== "All" && (
              <span className="ml-1.5 text-xs text-[#6378A0]">
                ({REPORT_CATALOG.filter(r => r.category === cat).length})
              </span>
            )}
          </a>
        ))}
      </div>

      {/* Generate section */}
      <div>
        <h2 className="text-[#0D1B35] font-bold mb-4">Generate New Report</h2>
        <SearchableCatalog catalog={filteredCatalog} />
      </div>

      {/* Recent reports */}
      <div className="bg-white border border-[#D9E2F0] rounded-xl overflow-hidden shadow-sm">
        <div className="flex items-center justify-between p-5 border-b border-[#E4EAF5]">
          <div className="flex items-center gap-2">
            <h2 className="text-[#0D1B35] font-bold">Generated Reports</h2>
            <span className="text-[#6378A0] text-xs bg-[#F2F5FB] border border-[#D9E2F0] rounded px-2 py-0.5">{filteredReports.length}</span>
          </div>
          {activeCategory !== "All" && (
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: categoryStyle[activeCategory]?.bg, color: categoryStyle[activeCategory]?.text }}>
              Filtered: {activeCategory}
            </span>
          )}
        </div>

        {filteredReports.length === 0 ? (
          <div className="py-12 text-center">
            <FileText className="w-10 h-10 text-[#D9E2F0] mx-auto mb-3" />
            <p className="text-[#6378A0] text-sm">No reports generated yet</p>
            <p className="text-[#6378A0] text-xs mt-1">Use the cards above to generate your first report</p>
          </div>
        ) : (
          <div>
            {filteredReports.map((report) => {
              const catalogEntry = REPORT_CATALOG.find(c => c.type === report.reportType);
              const cs = categoryStyle[catalogEntry?.category ?? ""] ?? { bg: "#F2F5FB", text: "#6378A0" };
              return (
                <div key={report.id} className="flex items-center gap-4 p-4 border-b border-[#E4EAF5] last:border-0 hover:bg-[#F2F5FB] transition-colors">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-[#F2F5FB]">
                    {(() => { const Icon = catalogEntry?.icon ?? FileText; return <Icon className="w-5 h-5 text-[#6378A0]" />; })()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-[#0D1B35] font-medium text-sm">{report.title}</p>
                      {catalogEntry && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold" style={{ backgroundColor: cs.bg, color: cs.text }}>
                          {catalogEntry.category}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      <span className="text-[#6378A0] text-xs flex items-center gap-1">
                        <Calendar className="w-3 h-3" />{report.period}
                      </span>
                      <span className="text-[#6378A0] text-xs flex items-center gap-1">
                        <User className="w-3 h-3" />{report.generator.name}
                      </span>
                      <span className="text-[#6378A0] text-xs">{format(new Date(report.createdAt), "MMM d, yyyy HH:mm")}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${report.status === "ready" ? "bg-[#F0FDF4] text-[#166534]" : "bg-[#FFFBEB] text-[#B45309]"}`}>
                      {report.status}
                    </span>
                    {catalogEntry?.formats.map(fmt => (
                      <button key={fmt} className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg border border-[#D9E2F0] hover:border-[#C6D0E8] transition-colors font-medium ${formatBadge[fmt]}`}>
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
