"use client";
import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Search } from "lucide-react";

type Alert = {
  id: string;
  title: string;
  description: string | null;
  severity: string;
  status: string;
  alertType: string;
  metricName: string | null;
  metricValue: number | null;
  openedAt: string;
  asset: { name: string; pillar: string; site: { name: string } };
  assignee: { name: string } | null;
  workOrder: { id: string; status: string } | null;
};

const severityConfig: Record<string, { bg: string; text: string; border: string }> = {
  CRITICAL: { bg: "#FEF2F2", text: "#B91C1C", border: "#FECACA" },
  HIGH: { bg: "#FFFBEB", text: "#B45309", border: "#FDE68A" },
  MEDIUM: { bg: "#EFF6FF", text: "#1E5FA8", border: "#BFDBFE" },
  LOW: { bg: "#F2F5FB", text: "#6378A0", border: "#D9E2F0" },
  INFO: { bg: "#EFF6FF", text: "#1E5FA8", border: "#BFDBFE" },
};

const statusConfig: Record<string, { bg: string; text: string }> = {
  OPEN: { bg: "#FEF2F2", text: "#B91C1C" },
  ACKNOWLEDGED: { bg: "#FFFBEB", text: "#B45309" },
  INVESTIGATING: { bg: "#EFF6FF", text: "#1E5FA8" },
  RESOLVED: { bg: "#F0FDF4", text: "#166534" },
  CLOSED: { bg: "#F2F5FB", text: "#6378A0" },
  FALSE_POSITIVE: { bg: "#F2F5FB", text: "#6378A0" },
};

const SEVERITIES = ["CRITICAL","HIGH","MEDIUM","LOW","INFO"];
const STATUSES   = ["OPEN","ACKNOWLEDGED","INVESTIGATING","RESOLVED","CLOSED","FALSE_POSITIVE"];
const PILLARS    = ["ELECTRICITY","WATER","WASTEWATER","GAS_AIR","ENVIRONMENT","THERMAL_HVAC","COMPRESSED_AIR"];

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]           = useState("");
  const [severityFilter, setSeverityFilter] = useState("");
  const [statusFilter, setStatusFilter]     = useState("");
  const [pillarFilter, setPillarFilter]     = useState("");

  const load = () => {
    setLoading(true);
    fetch("/api/alerts").then(r => r.json()).then(d => { setAlerts(Array.isArray(d) ? d : []); setLoading(false); });
  };
  useEffect(load, []);

  const statusCounts = STATUSES.reduce((acc, s) => {
    acc[s] = alerts.filter(a => a.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  const filtered = alerts.filter(a => {
    const matchSearch   = a.title.toLowerCase().includes(search.toLowerCase()) || a.asset.name.toLowerCase().includes(search.toLowerCase());
    const matchSeverity = !severityFilter || a.severity === severityFilter;
    const matchStatus   = !statusFilter || a.status === statusFilter;
    const matchPillar   = !pillarFilter || a.asset.pillar === pillarFilter;
    return matchSearch && matchSeverity && matchStatus && matchPillar;
  });

  const anyFilter = search || severityFilter || statusFilter || pillarFilter;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[#0D1B35] text-2xl font-bold">Alert Console</h1>
          <p className="text-[#6378A0] text-sm mt-0.5">{alerts.length} alerts</p>
        </div>
      </div>

      {/* Status summary */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(statusCounts).filter(([, count]) => count > 0).map(([status, count]) => {
          const sc = statusConfig[status] ?? statusConfig.CLOSED;
          return (
            <div key={status} className="flex items-center gap-2 bg-white border border-[#D9E2F0] rounded-lg px-3 py-1.5 shadow-sm">
              <span className="text-sm font-bold" style={{ color: sc.text }}>{count}</span>
              <span className="text-[#6378A0] text-xs">{status.replace("_", " ")}</span>
            </div>
          );
        })}
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3 flex-wrap p-4 rounded-2xl" style={{ background: "#fff", boxShadow: "0 1px 3px rgba(13,27,53,0.05), 0 4px 16px rgba(13,27,53,0.06)", border: "1px solid rgba(13,27,53,0.06)" }}>
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#98A8C0]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search alerts…"
            className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs text-[#0D1B35] outline-none placeholder:text-[#C0CCDE]"
            style={{ border: "1px solid rgba(13,27,53,0.1)", background: "#F8FAFC" }} />
        </div>
        <select value={severityFilter} onChange={e => setSeverityFilter(e.target.value)}
          className="text-xs text-[#0D1B35] outline-none rounded-lg px-2.5 py-1.5 bg-white"
          style={{ border: "1px solid rgba(13,27,53,0.1)" }}>
          <option value="">All severities</option>
          {SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="text-xs text-[#0D1B35] outline-none rounded-lg px-2.5 py-1.5 bg-white"
          style={{ border: "1px solid rgba(13,27,53,0.1)" }}>
          <option value="">All statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s.replace("_"," ")}</option>)}
        </select>
        <select value={pillarFilter} onChange={e => setPillarFilter(e.target.value)}
          className="text-xs text-[#0D1B35] outline-none rounded-lg px-2.5 py-1.5 bg-white"
          style={{ border: "1px solid rgba(13,27,53,0.1)" }}>
          <option value="">All pillars</option>
          {PILLARS.map(p => <option key={p} value={p}>{p.replace(/_/g," ")}</option>)}
        </select>
        {anyFilter && (
          <button onClick={() => { setSearch(""); setSeverityFilter(""); setStatusFilter(""); setPillarFilter(""); }} className="text-xs font-semibold text-[#B8901A] hover:underline whitespace-nowrap">Clear</button>
        )}
        <span className="text-[#6378A0] text-xs ml-auto whitespace-nowrap">{filtered.length} results</span>
      </div>

      {/* Alert list */}
      <div className="bg-white border border-[#D9E2F0] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F2F5FB] border-b border-[#D9E2F0]">
                {["Severity", "Alert", "Asset / Site", "Type", "Metric", "Assigned To", "Opened", "Status", "Action"].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-bold text-[#6378A0] uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="px-5 py-12 text-center text-[#6378A0]">Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={9} className="px-5 py-12 text-center text-[#6378A0]">No alerts found</td></tr>
              ) : filtered.map((alert) => {
                const sev = severityConfig[alert.severity] ?? severityConfig.INFO;
                const st = statusConfig[alert.status] ?? statusConfig.CLOSED;
                return (
                  <tr key={alert.id} className="border-b border-[#E4EAF5] hover:bg-[#F2F5FB] transition-colors last:border-0">
                    <td className="px-5 py-4">
                      <span className="text-xs px-2 py-0.5 rounded-full border font-semibold" style={{ backgroundColor: sev.bg, color: sev.text, borderColor: sev.border }}>
                        {alert.severity}
                      </span>
                    </td>
                    <td className="px-5 py-4 max-w-[200px]">
                      <p className="text-[#0D1B35] text-sm font-medium truncate">{alert.title}</p>
                      {alert.description && <p className="text-[#6378A0] text-xs truncate">{alert.description}</p>}
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-[#0D1B35] text-sm">{alert.asset.name}</p>
                      <p className="text-[#6378A0] text-xs">{alert.asset.site.name}</p>
                    </td>
                    <td className="px-5 py-4 text-[#3D5280] text-sm">{alert.alertType.replace(/_/g, " ")}</td>
                    <td className="px-5 py-4 text-[#3D5280] text-sm">
                      {alert.metricName && (
                        <span>{alert.metricName}: <strong className="text-[#0D1B35]">{alert.metricValue?.toFixed(2)}</strong></span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-[#3D5280] text-sm">{alert.assignee?.name ?? "Unassigned"}</td>
                    <td className="px-5 py-4 text-[#6378A0] text-xs whitespace-nowrap">
                      {formatDistanceToNow(new Date(alert.openedAt), { addSuffix: true })}
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: st.bg, color: st.text }}>
                        {alert.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <a href={`/alerts/${alert.id}`} className="text-[#B8901A] text-sm font-medium hover:text-[#9A7A14] hover:underline">
                        View →
                      </a>
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
