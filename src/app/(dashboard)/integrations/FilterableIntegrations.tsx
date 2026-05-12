"use client";
import { useState } from "react";
import { Search, CheckCircle, XCircle, Plug } from "lucide-react";
import type { LucideProps } from "lucide-react";

type IconComponent = React.FC<LucideProps>;

type IntegrationItem = {
  type: string;
  name: string;
  category: string;
  description: string;
};

type IntegrationConfig = {
  type: string;
  isEnabled: boolean;
};

const CATEGORIES = ["Notifications", "CMMS / ERP", "Analytics", "On-call", "Developer"];

export function FilterableIntegrations({
  catalog,
  configs,
  icons,
}: {
  catalog: IntegrationItem[];
  configs: IntegrationConfig[];
  icons: Record<string, IconComponent>;
}) {
  const [search, setSearch]         = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter]     = useState("");

  const configMap = new Map(configs.map(c => [c.type, c]));

  const filtered = catalog.filter(item => {
    const isEnabled = configMap.get(item.type)?.isEnabled ?? false;
    const matchSearch   = item.name.toLowerCase().includes(search.toLowerCase()) || item.description.toLowerCase().includes(search.toLowerCase());
    const matchCategory = !categoryFilter || item.category === categoryFilter;
    const matchStatus   = !statusFilter || (statusFilter === "connected" ? isEnabled : !isEnabled);
    return matchSearch && matchCategory && matchStatus;
  });

  const anyFilter = search || categoryFilter || statusFilter;

  // Group filtered by category
  const grouped = CATEGORIES.reduce((acc, cat) => {
    const items = filtered.filter(i => i.category === cat);
    if (items.length > 0) acc[cat] = items;
    return acc;
  }, {} as Record<string, IntegrationItem[]>);

  return (
    <div className="space-y-5">
      {/* Filter bar */}
      <div className="flex items-center gap-3 flex-wrap p-4 rounded-2xl" style={{ background: "#fff", boxShadow: "0 1px 3px rgba(13,27,53,0.05), 0 4px 16px rgba(13,27,53,0.06)", border: "1px solid rgba(13,27,53,0.06)" }}>
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#98A8C0]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search integrations…"
            className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs text-[#0D1B35] outline-none placeholder:text-[#C0CCDE]"
            style={{ border: "1px solid rgba(13,27,53,0.1)", background: "#F8FAFC" }} />
        </div>
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
          className="text-xs text-[#0D1B35] outline-none rounded-lg px-2.5 py-1.5 bg-white"
          style={{ border: "1px solid rgba(13,27,53,0.1)" }}>
          <option value="">All categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="text-xs text-[#0D1B35] outline-none rounded-lg px-2.5 py-1.5 bg-white"
          style={{ border: "1px solid rgba(13,27,53,0.1)" }}>
          <option value="">All statuses</option>
          <option value="connected">Connected</option>
          <option value="not_configured">Not configured</option>
        </select>
        {anyFilter && (
          <button onClick={() => { setSearch(""); setCategoryFilter(""); setStatusFilter(""); }} className="text-xs font-semibold text-[#B8901A] hover:underline whitespace-nowrap">Clear</button>
        )}
        <span className="text-[#6378A0] text-xs ml-auto whitespace-nowrap">{filtered.length} results</span>
      </div>

      {/* Grouped items */}
      {Object.entries(grouped).map(([category, items]) => (
        <div key={category}>
          <h2 className="text-[#0D1B35] font-bold mb-3">{category}</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
            {items.map((item) => {
              const config = configMap.get(item.type);
              const isEnabled = config?.isEnabled ?? false;
              const Icon = icons[item.type] ?? Plug;
              return (
                <div key={item.type} className="bg-white border border-[#D9E2F0] rounded-xl p-4 space-y-3 hover:shadow-md hover:border-[#C6D0E8] transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Icon className="w-6 h-6 text-[#3D5280]" />
                      <div>
                        <p className="text-[#0D1B35] font-semibold text-sm">{item.name}</p>
                        <p className="text-[#6378A0] text-xs">{item.description}</p>
                      </div>
                    </div>
                    {isEnabled ? (
                      <CheckCircle className="w-4 h-4 text-[#166534] flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-[#D9E2F0] flex-shrink-0 mt-0.5" />
                    )}
                  </div>
                  <div className="flex items-center justify-between border-t border-[#E4EAF5] pt-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isEnabled ? "bg-[#F0FDF4] text-[#166534]" : "bg-[#F2F5FB] text-[#6378A0]"}`}>
                      {isEnabled ? "Connected" : "Not configured"}
                    </span>
                    <button className="text-xs text-[#B8901A] hover:text-[#9A7A14] font-semibold hover:underline transition-colors">
                      {isEnabled ? "Edit" : "Configure"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {filtered.length === 0 && (
        <div className="py-12 text-center">
          <Plug className="w-10 h-10 text-[#D9E2F0] mx-auto mb-3" />
          <p className="text-[#6378A0] text-sm">No integrations match your filters</p>
        </div>
      )}
    </div>
  );
}
