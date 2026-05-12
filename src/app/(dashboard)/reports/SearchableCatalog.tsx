"use client";
import { useState } from "react";
import { Search, FileText, Download } from "lucide-react";
import type { LucideProps } from "lucide-react";

type IconComponent = React.FC<LucideProps>;

type CatalogEntry = {
  type: string;
  category: string;
  label: string;
  description: string;
  formats: string[];
  icon: IconComponent;
  color: string;
  roles: string;
};

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

const CATEGORIES = ["Compliance","Operations","Financial","ESG","Incidents"];

function ReportTypeCard({ rt }: { rt: CatalogEntry }) {
  const cs = categoryStyle[rt.category] ?? { bg: "#F2F5FB", text: "#6378A0" };
  const Icon = rt.icon;
  return (
    <div className="bg-white border border-[#D9E2F0] rounded-xl p-4 space-y-3 hover:shadow-md hover:border-[#C6D0E8] transition-all cursor-pointer group">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: cs.bg }}>
            <Icon className="w-4 h-4" style={{ color: rt.color }} />
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: cs.bg, color: cs.text }}>
            {rt.category}
          </span>
        </div>
        <FileText className="w-3.5 h-3.5 text-[#6378A0] group-hover:text-[#B8901A] transition-colors flex-shrink-0 mt-0.5" />
      </div>
      <div>
        <p className="text-[#0D1B35] text-sm font-semibold leading-tight">{rt.label}</p>
        <p className="text-[#6378A0] text-xs mt-1 leading-relaxed">{rt.description}</p>
      </div>
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-1">
          {rt.formats.map(fmt => (
            <span key={fmt} className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${formatBadge[fmt]}`}>{fmt}</span>
          ))}
        </div>
        <span className="text-[10px] text-[#6378A0]">{rt.roles}</span>
      </div>
      <div className="border-t border-[#E4EAF5] pt-2">
        <span className="text-[10px] text-[#B8901A] font-semibold group-hover:underline">Generate report →</span>
      </div>
    </div>
  );
}

export function SearchableCatalog({ catalog }: { catalog: CatalogEntry[] }) {
  const [search, setSearch]           = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const filtered = catalog.filter(rt => {
    const matchSearch   = rt.label.toLowerCase().includes(search.toLowerCase()) || rt.description.toLowerCase().includes(search.toLowerCase());
    const matchCategory = !categoryFilter || rt.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  const anyFilter = search || categoryFilter;

  // Group filtered by category
  const grouped = CATEGORIES.reduce((acc, cat) => {
    const items = filtered.filter(r => r.category === cat);
    if (items.length > 0) acc[cat] = items;
    return acc;
  }, {} as Record<string, CatalogEntry[]>);

  return (
    <div className="space-y-5">
      {/* Filter bar */}
      <div className="flex items-center gap-3 flex-wrap p-4 rounded-2xl" style={{ background: "#fff", boxShadow: "0 1px 3px rgba(13,27,53,0.05), 0 4px 16px rgba(13,27,53,0.06)", border: "1px solid rgba(13,27,53,0.06)" }}>
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#98A8C0]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search report types…"
            className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs text-[#0D1B35] outline-none placeholder:text-[#C0CCDE]"
            style={{ border: "1px solid rgba(13,27,53,0.1)", background: "#F8FAFC" }} />
        </div>
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
          className="text-xs text-[#0D1B35] outline-none rounded-lg px-2.5 py-1.5 bg-white"
          style={{ border: "1px solid rgba(13,27,53,0.1)" }}>
          <option value="">All categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        {anyFilter && (
          <button onClick={() => { setSearch(""); setCategoryFilter(""); }} className="text-xs font-semibold text-[#B8901A] hover:underline whitespace-nowrap">Clear</button>
        )}
        <span className="text-[#6378A0] text-xs ml-auto whitespace-nowrap">{filtered.length} results</span>
      </div>

      {/* Results */}
      {Object.entries(grouped).map(([cat, items]) => {
        const cs = categoryStyle[cat] ?? { bg: "#F2F5FB", text: "#6378A0" };
        return (
          <div key={cat}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: cs.bg, color: cs.text }}>{cat}</span>
              <span className="text-[#6378A0] text-xs">{items.length} report type{items.length > 1 ? "s" : ""}</span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
              {items.map(rt => <ReportTypeCard key={rt.type} rt={rt} />)}
            </div>
          </div>
        );
      })}

      {filtered.length === 0 && (
        <div className="py-12 text-center">
          <FileText className="w-10 h-10 text-[#D9E2F0] mx-auto mb-3" />
          <p className="text-[#6378A0] text-sm">No report types match your filters</p>
        </div>
      )}
    </div>
  );
}

// Also export a SearchableReportList for filtering generated reports
type GeneratedReport = {
  id: string;
  title: string;
  reportType: string;
  period: string;
  status: string;
  createdAt: string;
  generator: { name: string };
};

export function SearchableReportList({
  reports,
  catalog,
  formatBadgeMap,
  categoryStyleMap,
}: {
  reports: GeneratedReport[];
  catalog: CatalogEntry[];
  formatBadgeMap: Record<string, string>;
  categoryStyleMap: Record<string, { bg: string; text: string }>;
}) {
  const [search, setSearch] = useState("");

  const filtered = reports.filter(r =>
    r.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center gap-3 p-4 border-b border-[#E4EAF5]">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#98A8C0]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search generated reports…"
            className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs text-[#0D1B35] outline-none placeholder:text-[#C0CCDE]"
            style={{ border: "1px solid rgba(13,27,53,0.1)", background: "#F8FAFC" }} />
        </div>
        <span className="text-[#6378A0] text-xs whitespace-nowrap">{filtered.length} reports</span>
      </div>

      {filtered.length === 0 ? (
        <div className="py-12 text-center">
          <FileText className="w-10 h-10 text-[#D9E2F0] mx-auto mb-3" />
          <p className="text-[#6378A0] text-sm">No reports found</p>
        </div>
      ) : (
        <div>
          {filtered.map(report => {
            const catalogEntry = catalog.find(c => c.type === report.reportType);
            const cs = categoryStyleMap[catalogEntry?.category ?? ""] ?? { bg: "#F2F5FB", text: "#6378A0" };
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
                    <span className="text-[#6378A0] text-xs">{report.period}</span>
                    <span className="text-[#6378A0] text-xs">{report.generator.name}</span>
                    <span className="text-[#6378A0] text-xs">{new Date(report.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${report.status === "ready" ? "bg-[#F0FDF4] text-[#166534]" : "bg-[#FFFBEB] text-[#B45309]"}`}>
                    {report.status}
                  </span>
                  {catalogEntry?.formats.map(fmt => (
                    <button key={fmt} className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg border border-[#D9E2F0] hover:border-[#C6D0E8] transition-colors font-medium ${formatBadgeMap[fmt]}`}>
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
  );
}
