"use client";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Shield, Search } from "lucide-react";

type AuditLog = {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  details: unknown;
  timestamp: string;
  actor: { name: string; email: string; role: string } | null;
};

const actionConfig: Record<string, { color: string; bg: string }> = {
  ALERT_ACKNOWLEDGED: { color: "#B45309", bg: "#FFFBEB" },
  ALERT_RESOLVED:     { color: "#166534", bg: "#F0FDF4" },
  REPORT_GENERATED:   { color: "#1E5FA8", bg: "#EFF6FF" },
  USER_LOGIN:         { color: "#6378A0", bg: "#F2F5FB" },
  THRESHOLD_CHANGED:  { color: "#B91C1C", bg: "#FEF2F2" },
  CALIBRATION_UPDATED:{ color: "#6D28D9", bg: "#F5F3FF" },
  SENSOR_MODIFIED:    { color: "#C2410C", bg: "#FFF7ED" },
};

export default function AuditLogPage() {
  const [logs, setLogs]   = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]       = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [dateFrom, setDateFrom]         = useState("");
  const [dateTo, setDateTo]             = useState("");

  const load = () => {
    setLoading(true);
    fetch("/api/audit?limit=200").then(r => r.json()).then(d => { setLogs(Array.isArray(d) ? d : []); setLoading(false); });
  };
  useEffect(load, []);

  const uniqueActions = [...new Set(logs.map(l => l.action))].sort();

  const filtered = logs.filter(log => {
    const matchSearch = (log.actor?.name ?? "System").toLowerCase().includes(search.toLowerCase()) ||
      log.entityType.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase());
    const matchAction = !actionFilter || log.action === actionFilter;
    const ts = new Date(log.timestamp);
    const matchFrom = !dateFrom || ts >= new Date(dateFrom);
    const matchTo   = !dateTo   || ts <= new Date(dateTo + "T23:59:59");
    return matchSearch && matchAction && matchFrom && matchTo;
  });

  const anyFilter = search || actionFilter || dateFrom || dateTo;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-[#FEF7E6] flex items-center justify-center">
          <Shield className="w-5 h-5 text-[#B8901A]" />
        </div>
        <div>
          <h1 className="text-[#0D1B35] text-2xl font-bold">Audit Log</h1>
          <p className="text-[#6378A0] text-sm mt-0.5">Immutable record of all system actions</p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3 flex-wrap p-4 rounded-2xl" style={{ background: "#fff", boxShadow: "0 1px 3px rgba(13,27,53,0.05), 0 4px 16px rgba(13,27,53,0.06)", border: "1px solid rgba(13,27,53,0.06)" }}>
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#98A8C0]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search actor or entity…"
            className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs text-[#0D1B35] outline-none placeholder:text-[#C0CCDE]"
            style={{ border: "1px solid rgba(13,27,53,0.1)", background: "#F8FAFC" }} />
        </div>
        <select value={actionFilter} onChange={e => setActionFilter(e.target.value)}
          className="text-xs text-[#0D1B35] outline-none rounded-lg px-2.5 py-1.5 bg-white"
          style={{ border: "1px solid rgba(13,27,53,0.1)" }}>
          <option value="">All actions</option>
          {uniqueActions.map(a => <option key={a} value={a}>{a.replace(/_/g," ")}</option>)}
        </select>
        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
          className="text-xs text-[#0D1B35] outline-none rounded-lg px-2.5 py-1.5 bg-white"
          style={{ border: "1px solid rgba(13,27,53,0.1)" }} />
        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
          className="text-xs text-[#0D1B35] outline-none rounded-lg px-2.5 py-1.5 bg-white"
          style={{ border: "1px solid rgba(13,27,53,0.1)" }} />
        {anyFilter && (
          <button onClick={() => { setSearch(""); setActionFilter(""); setDateFrom(""); setDateTo(""); }} className="text-xs font-semibold text-[#B8901A] hover:underline whitespace-nowrap">Clear</button>
        )}
        <span className="text-[#6378A0] text-xs ml-auto whitespace-nowrap">{filtered.length} results</span>
      </div>

      <div className="bg-white border border-[#D9E2F0] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F2F5FB] border-b border-[#D9E2F0]">
                {["Timestamp", "Actor", "Role", "Action", "Entity", "Details"].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-bold text-[#6378A0] uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-[#6378A0]">Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-[#6378A0]">No log entries found</td></tr>
              ) : filtered.map((log) => {
                const ac = actionConfig[log.action] ?? { color: "#6378A0", bg: "#F2F5FB" };
                return (
                  <tr key={log.id} className="border-b border-[#E4EAF5] hover:bg-[#F2F5FB] transition-colors last:border-0">
                    <td className="px-5 py-4 text-[#6378A0] text-xs whitespace-nowrap font-mono">
                      {format(new Date(log.timestamp), "yyyy-MM-dd HH:mm:ss")}
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-[#0D1B35] text-sm font-medium">{log.actor?.name ?? "System"}</p>
                      <p className="text-[#6378A0] text-xs">{log.actor?.email ?? "system"}</p>
                    </td>
                    <td className="px-5 py-4 text-[#3D5280] text-sm">{log.actor?.role ?? "SYSTEM"}</td>
                    <td className="px-5 py-4">
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: ac.bg, color: ac.color }}>
                        {log.action.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-[#3D5280] text-sm">
                      <span>{log.entityType}</span>
                      {log.entityId && <span className="text-[#6378A0] ml-1 font-mono text-xs">{log.entityId.substring(0, 8)}…</span>}
                    </td>
                    <td className="px-5 py-4 text-[#6378A0] text-xs max-w-[200px] truncate">
                      {log.details ? JSON.stringify(log.details).substring(0, 80) : "—"}
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
