"use client";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  FileText, Download, Calendar, User, TrendingUp, CheckCircle, Clock,
  Droplets, Zap, Wrench, ClipboardList, BarChart2, Target,
  BookOpen, DollarSign, Leaf, Wind, ShieldCheck, Search, X, Plus,
} from "lucide-react";
import type { LucideProps } from "lucide-react";

type IconComponent = React.FC<LucideProps>;

type CatalogEntry = {
  type: string; category: string; label: string; description: string;
  formats: string[]; icon: IconComponent; color: string; roles: string;
};

type GeneratedReport = {
  id: string; title: string; reportType: string; period: string;
  status: string; createdAt: string;
  generator: { name: string; email: string; role: string };
};

const REPORT_CATALOG: CatalogEntry[] = [
  { type: "wastewater_compliance", category: "Compliance", label: "Wastewater Compliance",      description: "pH, COD, TSS, effluent data for BAPEDAL submission",                 formats: ["PDF", "CSV"],         icon: Droplets,      color: "#6D28D9", roles: "EHS / Compliance" },
  { type: "iso50001_evidence",     category: "Compliance", label: "ISO 50001 Evidence",          description: "Energy management evidence pack for audit",                          formats: ["PDF", "XLSX"],        icon: Zap,           color: "#B45309", roles: "Energy Manager" },
  { type: "calibration_status",    category: "Compliance", label: "Calibration Status Report",   description: "Sensor calibration schedule, overdue list, certificates",            formats: ["PDF", "XLSX"],        icon: Wrench,        color: "#1E5FA8", roles: "Technician" },
  { type: "daily_operations",      category: "Operations", label: "Daily Operations Report",     description: "Asset status, alerts, consumption summary for shift handover",       formats: ["PDF", "CSV"],         icon: ClipboardList, color: "#1E5FA8", roles: "Operations Supervisor" },
  { type: "weekly_variance",       category: "Operations", label: "Weekly Variance Report",      description: "Consumption vs baseline, deviations, anomaly summary",               formats: ["PDF", "XLSX", "CSV"], icon: BarChart2,     color: "#B45309", roles: "Energy Manager" },
  { type: "peak_demand_analysis",  category: "Operations", label: "Peak Demand Analysis",        description: "Peak demand events, tariff exposure, load shedding opportunities",   formats: ["PDF", "XLSX"],        icon: Zap,           color: "#B91C1C", roles: "Energy Manager" },
  { type: "water_balance",         category: "Operations", label: "Water Balance Report",        description: "Water input, consumption, discharge, NRW reconciliation",            formats: ["PDF", "XLSX"],        icon: Droplets,      color: "#1E5FA8", roles: "Operations Supervisor" },
  { type: "monthly_scorecard",     category: "Financial",  label: "Monthly Executive Scorecard", description: "KPIs, cost, carbon, site rankings for management review",            formats: ["PDF", "XLSX"],        icon: Target,        color: "#B8901A", roles: "Executive" },
  { type: "quarterly_board",       category: "Financial",  label: "Quarterly Board Pack",        description: "Executive summary with ROI analysis for board review",               formats: ["PDF"],                icon: BookOpen,      color: "#6D28D9", roles: "Executive" },
  { type: "cost_allocation",       category: "Financial",  label: "Cost Allocation Report",      description: "Energy/water/gas cost split by department and cost center",          formats: ["XLSX", "CSV"],        icon: DollarSign,    color: "#166534", roles: "Finance" },
  { type: "energy_benchmark",      category: "Financial",  label: "Energy Benchmarking",         description: "Site-vs-site energy intensity (kWh/m², kWh/unit)",                  formats: ["PDF", "XLSX"],        icon: TrendingUp,    color: "#B45309", roles: "Energy Manager" },
  { type: "scope2_emissions",      category: "ESG",        label: "Scope 2 Emissions Report",    description: "CDP-format GHG disclosure with location & market-based methods",     formats: ["PDF", "XLSX", "CSV"], icon: Leaf,          color: "#166534", roles: "EHS / Compliance" },
  { type: "gas_ldar_incident",     category: "Incidents",  label: "Gas / LDAR Incident Report",  description: "Leak detection and repair log, fugitive emissions evidence",         formats: ["PDF", "CSV"],         icon: Wind,          color: "#0E7490", roles: "EHS / Compliance" },
  { type: "worker_safety",         category: "Incidents",  label: "Worker Safety Report",        description: "Gas exposure events, OSHA 1910.146 confined space log",              formats: ["PDF"],                icon: ShieldCheck,   color: "#B91C1C", roles: "EHS / Compliance" },
];

const CATEGORIES = ["All", "Compliance", "Operations", "Financial", "ESG", "Incidents"] as const;
type Category = typeof CATEGORIES[number];

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

function GenerateModal({ entry, onClose, onGenerated }: { entry: CatalogEntry; onClose: () => void; onGenerated: () => void }) {
  const [period, setPeriod] = useState("");
  const [loading, setLoading] = useState(false);
  const Icon = entry.icon;
  const cs = categoryStyle[entry.category] ?? { bg: "#F2F5FB", text: "#6378A0" };

  const submit = async () => {
    if (!period.trim()) return;
    setLoading(true);
    await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportType: entry.type, title: `${entry.label} – ${period}`, period, parameters: {} }),
    });
    setLoading(false);
    onGenerated();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(13,27,53,0.45)", backdropFilter: "blur(4px)" }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: cs.bg }}>
              <Icon className="w-5 h-5" style={{ color: entry.color }} />
            </div>
            <div>
              <p className="text-[#0D1B35] font-bold text-sm">{entry.label}</p>
              <p className="text-[#6378A0] text-xs">{entry.category} · {entry.roles}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[#F2F5FB] transition-colors">
            <X className="w-4 h-4 text-[#6378A0]" />
          </button>
        </div>
        <p className="text-[#6378A0] text-sm">{entry.description}</p>
        <div>
          <label className="text-xs font-semibold text-[#3D5280] block mb-1.5">Period / Date Range</label>
          <input
            value={period} onChange={e => setPeriod(e.target.value)}
            placeholder="e.g. April 2026, Q1 2026, 2026-01-01 to 2026-03-31"
            className="w-full px-3 py-2 rounded-lg text-sm text-[#0D1B35] outline-none"
            style={{ border: "1px solid rgba(13,27,53,0.15)", background: "#F8FAFC" }}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#6378A0]">Output formats:</span>
          {entry.formats.map(fmt => (
            <span key={fmt} className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${formatBadge[fmt]}`}>{fmt}</span>
          ))}
        </div>
        <div className="flex gap-2 pt-1">
          <button onClick={onClose} className="flex-1 py-2 rounded-xl text-sm font-semibold text-[#6378A0] border border-[#D9E2F0] hover:bg-[#F2F5FB] transition-colors">
            Cancel
          </button>
          <button
            onClick={submit} disabled={!period.trim() || loading}
            className="flex-1 py-2 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-50"
            style={{ background: loading || !period.trim() ? "#D9E2F0" : "linear-gradient(90deg, #B8901A, #D4A82A)", color: !period.trim() ? "#6378A0" : "white" }}
          >
            {loading ? "Generating…" : "Generate Report"}
          </button>
        </div>
      </div>
    </div>
  );
}

function CatalogCard({ entry, onGenerate }: { entry: CatalogEntry; onGenerate: () => void }) {
  const cs = categoryStyle[entry.category] ?? { bg: "#F2F5FB", text: "#6378A0" };
  const Icon = entry.icon;
  return (
    <div
      onClick={onGenerate}
      className="bg-white border border-[#D9E2F0] rounded-xl p-4 space-y-3 hover:shadow-md hover:border-[#C6D0E8] transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: cs.bg }}>
            <Icon className="w-4 h-4" style={{ color: entry.color }} />
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: cs.bg, color: cs.text }}>
            {entry.category}
          </span>
        </div>
        <Plus className="w-3.5 h-3.5 text-[#6378A0] group-hover:text-[#B8901A] transition-colors flex-shrink-0 mt-0.5" />
      </div>
      <div>
        <p className="text-[#0D1B35] text-sm font-semibold leading-tight">{entry.label}</p>
        <p className="text-[#6378A0] text-xs mt-1 leading-relaxed">{entry.description}</p>
      </div>
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-1">
          {entry.formats.map(fmt => (
            <span key={fmt} className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${formatBadge[fmt]}`}>{fmt}</span>
          ))}
        </div>
        <span className="text-[10px] text-[#6378A0]">{entry.roles}</span>
      </div>
      <div className="border-t border-[#E4EAF5] pt-2">
        <span className="text-[10px] text-[#B8901A] font-semibold group-hover:underline">Generate report →</span>
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const [reports, setReports] = useState<GeneratedReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [search, setSearch] = useState("");
  const [reportSearch, setReportSearch] = useState("");
  const [generating, setGenerating] = useState<CatalogEntry | null>(null);

  const load = () => {
    setLoading(true);
    fetch("/api/reports").then(r => r.json()).then(d => { setReports(Array.isArray(d) ? d : []); setLoading(false); });
  };
  useEffect(load, []);

  const filteredCatalog = REPORT_CATALOG.filter(rt => {
    const matchCat  = activeCategory === "All" || rt.category === activeCategory;
    const matchSrch = !search || rt.label.toLowerCase().includes(search.toLowerCase()) || rt.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSrch;
  });

  const filteredReports = reports.filter(r =>
    !reportSearch || r.title.toLowerCase().includes(reportSearch.toLowerCase())
  );

  // Group catalog by category
  const grouped = (["Compliance","Operations","Financial","ESG","Incidents"] as const).reduce((acc, cat) => {
    const items = filteredCatalog.filter(r => r.category === cat);
    if (items.length > 0) acc[cat] = items;
    return acc;
  }, {} as Record<string, CatalogEntry[]>);

  const thisMonthCount = reports.filter(r => {
    const d = new Date(r.createdAt);
    const now = new Date();
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }).length;

  return (
    <div className="p-6 space-y-6">
      {generating && (
        <GenerateModal entry={generating} onClose={() => setGenerating(null)} onGenerated={load} />
      )}

      {/* Header */}
      <div>
        <h1 className="text-[#0D1B35] text-2xl font-bold">Report Center</h1>
        <p className="text-[#6378A0] text-sm mt-0.5">Generate, schedule, and download compliance and operational reports</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Reports",   value: reports.length,     icon: FileText,    bg: "#FEF7E6", ic: "#B8901A" },
          { label: "This Month",      value: thisMonthCount,     icon: TrendingUp,  bg: "#EFF6FF", ic: "#1E5FA8" },
          { label: "Report Types",    value: REPORT_CATALOG.length, icon: CheckCircle, bg: "#F0FDF4", ic: "#166534" },
          { label: "Scheduled",       value: 3,                  icon: Clock,       bg: "#FFFBEB", ic: "#B45309" },
        ].map(({ label, value, icon: Icon, bg, ic }) => (
          <div key={label} className="bg-white border border-[#D9E2F0] rounded-xl p-5 shadow-sm flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: bg }}>
              <Icon className="w-4 h-4" style={{ color: ic }} />
            </div>
            <div>
              <p className="text-[#0D1B35] text-xl font-bold">{loading && label !== "Report Types" && label !== "Scheduled" ? "—" : value}</p>
              <p className="text-[#6378A0] text-xs">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Generate section */}
      <div className="space-y-4">
        <h2 className="text-[#0D1B35] font-bold">Generate New Report</h2>

        {/* Filter bar */}
        <div className="flex items-center gap-3 flex-wrap p-4 rounded-2xl" style={{ background: "#fff", boxShadow: "0 1px 3px rgba(13,27,53,0.05), 0 4px 16px rgba(13,27,53,0.06)", border: "1px solid rgba(13,27,53,0.06)" }}>
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#98A8C0]" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search report types…"
              className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs text-[#0D1B35] outline-none placeholder:text-[#C0CCDE]"
              style={{ border: "1px solid rgba(13,27,53,0.1)", background: "#F8FAFC" }} />
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors"
                style={activeCategory === cat
                  ? { background: "#0D1B35", color: "#fff" }
                  : { background: "#F2F5FB", color: "#6378A0" }}
              >
                {cat}
                {cat !== "All" && (
                  <span className="ml-1 opacity-60">({REPORT_CATALOG.filter(r => r.category === cat).length})</span>
                )}
              </button>
            ))}
          </div>
          <span className="text-[#6378A0] text-xs ml-auto whitespace-nowrap">{filteredCatalog.length} types</span>
        </div>

        {/* Catalog grid grouped by category */}
        {filteredCatalog.length === 0 ? (
          <div className="py-12 text-center">
            <FileText className="w-10 h-10 text-[#D9E2F0] mx-auto mb-3" />
            <p className="text-[#6378A0] text-sm">No report types match your filters</p>
          </div>
        ) : (
          <div className="space-y-5">
            {Object.entries(grouped).map(([cat, items]) => {
              const cs = categoryStyle[cat] ?? { bg: "#F2F5FB", text: "#6378A0" };
              return (
                <div key={cat}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: cs.bg, color: cs.text }}>{cat}</span>
                    <span className="text-[#6378A0] text-xs">{items.length} type{items.length !== 1 ? "s" : ""}</span>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                    {items.map(rt => (
                      <CatalogCard key={rt.type} entry={rt} onGenerate={() => setGenerating(rt)} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Generated reports list */}
      <div className="bg-white border border-[#D9E2F0] rounded-xl overflow-hidden shadow-sm">
        <div className="flex items-center gap-3 p-5 border-b border-[#E4EAF5] flex-wrap">
          <h2 className="text-[#0D1B35] font-bold">Generated Reports</h2>
          <span className="text-[#6378A0] text-xs bg-[#F2F5FB] border border-[#D9E2F0] rounded px-2 py-0.5">{filteredReports.length}</span>
          <div className="relative ml-auto min-w-[200px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#98A8C0]" />
            <input value={reportSearch} onChange={e => setReportSearch(e.target.value)} placeholder="Search reports…"
              className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs text-[#0D1B35] outline-none placeholder:text-[#C0CCDE]"
              style={{ border: "1px solid rgba(13,27,53,0.1)", background: "#F8FAFC" }} />
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-[#6378A0] text-sm">Loading…</div>
        ) : filteredReports.length === 0 ? (
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
              const Icon = catalogEntry?.icon ?? FileText;
              return (
                <div key={report.id} className="flex items-center gap-4 p-4 border-b border-[#E4EAF5] last:border-0 hover:bg-[#F2F5FB] transition-colors">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-[#F2F5FB]">
                    <Icon className="w-5 h-5 text-[#6378A0]" />
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
                        <User className="w-3 h-3" />{report.generator?.name ?? "System"}
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
                    <a href={`/reports/${report.id}`} className="text-[#B8901A] text-sm font-medium hover:text-[#9A7A14] hover:underline whitespace-nowrap">
                      View →
                    </a>
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
