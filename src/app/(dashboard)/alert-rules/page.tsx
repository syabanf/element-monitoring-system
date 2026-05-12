"use client";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";

type AlertRule = {
  id: string;
  name: string;
  description: string | null;
  severity: string;
  alertType: string;
  metricName: string;
  operator: string;
  threshold: number;
  isActive: boolean;
  sensor: {
    name: string;
    asset: { name: string; pillar: string; site: { name: string } };
  };
  _count: { alerts: number };
};

const severityColors: Record<string, { bg: string; text: string }> = {
  CRITICAL: { bg: "#FEF2F2", text: "#B91C1C" },
  HIGH: { bg: "#FFFBEB", text: "#B45309" },
  MEDIUM: { bg: "#EFF6FF", text: "#1E5FA8" },
  LOW: { bg: "#F2F5FB", text: "#6378A0" },
  INFO: { bg: "#EFF6FF", text: "#1E5FA8" },
};

const SEVERITIES = ["CRITICAL","HIGH","MEDIUM","LOW","INFO"];
const PILLARS    = ["ELECTRICITY","WATER","WASTEWATER","GAS_AIR","ENVIRONMENT","THERMAL_HVAC","COMPRESSED_AIR"];

export default function AlertRulesPage() {
  const [rules, setRules]   = useState<AlertRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]         = useState("");
  const [severityFilter, setSeverityFilter] = useState("");
  const [activeFilter, setActiveFilter]     = useState("");
  const [pillarFilter, setPillarFilter]     = useState("");

  const load = () => {
    setLoading(true);
    fetch("/api/alert-rules").then(r => r.json()).then(d => { setRules(Array.isArray(d) ? d : []); setLoading(false); });
  };
  useEffect(load, []);

  const activeCount = rules.filter(r => r.isActive).length;

  const filtered = rules.filter(r => {
    const matchSearch   = r.name.toLowerCase().includes(search.toLowerCase()) || r.sensor.name.toLowerCase().includes(search.toLowerCase());
    const matchSeverity = !severityFilter || r.severity === severityFilter;
    const matchActive   = !activeFilter || r.isActive.toString() === activeFilter;
    const matchPillar   = !pillarFilter || r.sensor.asset.pillar === pillarFilter;
    return matchSearch && matchSeverity && matchActive && matchPillar;
  });

  const anyFilter = search || severityFilter || activeFilter || pillarFilter;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[#0D1B35] text-2xl font-bold">Alert Rules</h1>
          <p className="text-[#6378A0] text-sm mt-0.5">{activeCount} active rules of {rules.length} total</p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3 flex-wrap p-4 rounded-2xl" style={{ background: "#fff", boxShadow: "0 1px 3px rgba(13,27,53,0.05), 0 4px 16px rgba(13,27,53,0.06)", border: "1px solid rgba(13,27,53,0.06)" }}>
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#98A8C0]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search rules…"
            className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs text-[#0D1B35] outline-none placeholder:text-[#C0CCDE]"
            style={{ border: "1px solid rgba(13,27,53,0.1)", background: "#F8FAFC" }} />
        </div>
        <select value={severityFilter} onChange={e => setSeverityFilter(e.target.value)}
          className="text-xs text-[#0D1B35] outline-none rounded-lg px-2.5 py-1.5 bg-white"
          style={{ border: "1px solid rgba(13,27,53,0.1)" }}>
          <option value="">All severities</option>
          {SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={pillarFilter} onChange={e => setPillarFilter(e.target.value)}
          className="text-xs text-[#0D1B35] outline-none rounded-lg px-2.5 py-1.5 bg-white"
          style={{ border: "1px solid rgba(13,27,53,0.1)" }}>
          <option value="">All pillars</option>
          {PILLARS.map(p => <option key={p} value={p}>{p.replace(/_/g," ")}</option>)}
        </select>
        <select value={activeFilter} onChange={e => setActiveFilter(e.target.value)}
          className="text-xs text-[#0D1B35] outline-none rounded-lg px-2.5 py-1.5 bg-white"
          style={{ border: "1px solid rgba(13,27,53,0.1)" }}>
          <option value="">Active &amp; inactive</option>
          <option value="true">Active only</option>
          <option value="false">Inactive only</option>
        </select>
        {anyFilter && (
          <button onClick={() => { setSearch(""); setSeverityFilter(""); setActiveFilter(""); setPillarFilter(""); }} className="text-xs font-semibold text-[#B8901A] hover:underline whitespace-nowrap">Clear</button>
        )}
        <span className="text-[#6378A0] text-xs ml-auto whitespace-nowrap">{filtered.length} results</span>
      </div>

      <div className="bg-white border border-[#D9E2F0] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F2F5FB] border-b border-[#D9E2F0]">
                {["Rule Name", "Sensor / Asset", "Metric", "Condition", "Severity", "Type", "Alerts", "Active"].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-bold text-[#6378A0] uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="px-5 py-12 text-center text-[#6378A0]">Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-5 py-12 text-center text-[#6378A0]">No rules found</td></tr>
              ) : filtered.map((rule) => {
                const sc = severityColors[rule.severity] ?? severityColors.INFO;
                return (
                  <tr key={rule.id} className="border-b border-[#E4EAF5] hover:bg-[#F2F5FB] transition-colors last:border-0">
                    <td className="px-5 py-4">
                      <p className="text-[#0D1B35] text-sm font-medium">{rule.name}</p>
                      {rule.description && <p className="text-[#6378A0] text-xs truncate max-w-[180px]">{rule.description}</p>}
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-[#0D1B35] text-sm">{rule.sensor.name}</p>
                      <p className="text-[#6378A0] text-xs">{rule.sensor.asset.name} · {rule.sensor.asset.site.name}</p>
                    </td>
                    <td className="px-5 py-4 text-[#3D5280] text-sm">{rule.metricName}</td>
                    <td className="px-5 py-4 text-[#0D1B35] text-sm font-mono font-medium">
                      {rule.metricName} {rule.operator} {rule.threshold}
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: sc.bg, color: sc.text }}>
                        {rule.severity}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-[#3D5280] text-sm">{rule.alertType.replace(/_/g, " ")}</td>
                    <td className="px-5 py-4 text-center text-[#0D1B35] text-sm font-medium">{rule._count.alerts}</td>
                    <td className="px-5 py-4">
                      <div className={`w-8 h-4 rounded-full transition-colors ${rule.isActive ? "bg-[#B8901A]" : "bg-[#D9E2F0]"}`} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
