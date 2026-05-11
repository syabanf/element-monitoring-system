import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { Shield } from "lucide-react";

const actionConfig: Record<string, { color: string; bg: string }> = {
  ALERT_ACKNOWLEDGED: { color: "#f59e0b", bg: "#f59e0b20" },
  ALERT_RESOLVED: { color: "#22c55e", bg: "#22c55e20" },
  REPORT_GENERATED: { color: "#3b82f6", bg: "#3b82f620" },
  USER_LOGIN: { color: "#888888", bg: "#88888820" },
  THRESHOLD_CHANGED: { color: "#e11d48", bg: "#e11d4820" },
  CALIBRATION_UPDATED: { color: "#6366f1", bg: "#6366f120" },
  SENSOR_MODIFIED: { color: "#f97316", bg: "#f9731620" },
};

export default async function AuditLogPage() {
  const logs = await prisma.auditLog.findMany({
    include: { actor: { select: { name: true, email: true, role: true } } },
    orderBy: { timestamp: "desc" },
    take: 200,
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-[#e11d4810] flex items-center justify-center">
          <Shield className="w-5 h-5 text-[#e11d48]" />
        </div>
        <div>
          <h1 className="text-white text-2xl font-bold">Audit Log</h1>
          <p className="text-[#888888] text-sm mt-0.5">Immutable record of all system actions</p>
        </div>
      </div>

      <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2a2a2a]">
                {["Timestamp", "Actor", "Role", "Action", "Entity", "Details"].map(h => (
                  <th key={h} className="text-left text-[#888888] text-xs uppercase tracking-wider px-4 py-3 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a1a1a]">
              {logs.map((log) => {
                const ac = actionConfig[log.action] ?? { color: "#888888", bg: "#88888820" };
                return (
                  <tr key={log.id} className="hover:bg-[#1a1a1a] transition-colors">
                    <td className="px-4 py-3 text-[#888888] text-xs whitespace-nowrap font-mono">
                      {format(new Date(log.timestamp), "yyyy-MM-dd HH:mm:ss")}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-white text-xs font-medium">{log.actor?.name ?? "System"}</p>
                      <p className="text-[#888888] text-xs">{log.actor?.email ?? "system"}</p>
                    </td>
                    <td className="px-4 py-3 text-[#888888] text-xs">{log.actor?.role ?? "SYSTEM"}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 rounded font-medium" style={{ backgroundColor: ac.bg, color: ac.color }}>
                        {log.action.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#888888] text-xs">
                      <span>{log.entityType}</span>
                      {log.entityId && <span className="text-[#444] ml-1 font-mono">{log.entityId.substring(0, 8)}…</span>}
                    </td>
                    <td className="px-4 py-3 text-[#888888] text-xs max-w-[200px] truncate">
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
