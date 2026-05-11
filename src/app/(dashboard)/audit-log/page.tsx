import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { Shield } from "lucide-react";

const actionConfig: Record<string, { color: string; bg: string }> = {
  ALERT_ACKNOWLEDGED: { color: "#B45309", bg: "#FFFBEB" },
  ALERT_RESOLVED: { color: "#166534", bg: "#F0FDF4" },
  REPORT_GENERATED: { color: "#1E5FA8", bg: "#EFF6FF" },
  USER_LOGIN: { color: "#6378A0", bg: "#F2F5FB" },
  THRESHOLD_CHANGED: { color: "#B91C1C", bg: "#FEF2F2" },
  CALIBRATION_UPDATED: { color: "#6D28D9", bg: "#F5F3FF" },
  SENSOR_MODIFIED: { color: "#C2410C", bg: "#FFF7ED" },
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
        <div className="w-10 h-10 rounded-lg bg-[#FEF7E6] flex items-center justify-center">
          <Shield className="w-5 h-5 text-[#B8901A]" />
        </div>
        <div>
          <h1 className="text-[#0D1B35] text-2xl font-bold">Audit Log</h1>
          <p className="text-[#6378A0] text-sm mt-0.5">Immutable record of all system actions</p>
        </div>
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
              {logs.map((log) => {
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
