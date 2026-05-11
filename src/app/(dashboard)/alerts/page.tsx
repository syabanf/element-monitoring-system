import { prisma } from "@/lib/prisma";
import { formatDistanceToNow } from "date-fns";

const severityConfig: Record<string, { bg: string; text: string; border: string }> = {
  CRITICAL: { bg: "#ef444415", text: "#ef4444", border: "#ef444430" },
  HIGH: { bg: "#f59e0b15", text: "#f59e0b", border: "#f59e0b30" },
  MEDIUM: { bg: "#3b82f615", text: "#3b82f6", border: "#3b82f630" },
  LOW: { bg: "#88888815", text: "#888888", border: "#88888830" },
  INFO: { bg: "#6366f115", text: "#6366f1", border: "#6366f130" },
};

const statusConfig: Record<string, { bg: string; text: string }> = {
  OPEN: { bg: "#ef444420", text: "#ef4444" },
  ACKNOWLEDGED: { bg: "#f59e0b20", text: "#f59e0b" },
  INVESTIGATING: { bg: "#3b82f620", text: "#3b82f6" },
  RESOLVED: { bg: "#22c55e20", text: "#22c55e" },
  CLOSED: { bg: "#88888820", text: "#888888" },
  FALSE_POSITIVE: { bg: "#88888820", text: "#888888" },
};

export default async function AlertsPage() {
  const [alerts, counts] = await Promise.all([
    prisma.alert.findMany({
      include: {
        asset: { select: { name: true, pillar: true, site: { select: { name: true } } } },
        assignee: { select: { name: true } },
        workOrder: { select: { id: true, status: true } },
      },
      orderBy: [{ severity: "asc" }, { openedAt: "desc" }],
      take: 100,
    }),
    prisma.alert.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
  ]);

  const statusCounts = counts.reduce((acc, c) => {
    acc[c.status] = c._count._all;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-bold">Alert Console</h1>
          <p className="text-[#888888] text-sm mt-0.5">{alerts.length} alerts</p>
        </div>
      </div>

      {/* Status summary */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(statusCounts).map(([status, count]) => {
          const sc = statusConfig[status] ?? statusConfig.CLOSED;
          return (
            <div key={status} className="flex items-center gap-2 bg-[#111111] border border-[#2a2a2a] rounded-lg px-3 py-1.5">
              <span className="text-sm font-bold" style={{ color: sc.text }}>{count}</span>
              <span className="text-[#888888] text-xs">{status.replace("_", " ")}</span>
            </div>
          );
        })}
      </div>

      {/* Alert list */}
      <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2a2a2a]">
                {["Severity", "Alert", "Asset / Site", "Type", "Metric", "Assigned To", "Opened", "Status", "Action"].map(h => (
                  <th key={h} className="text-left text-[#888888] text-xs uppercase tracking-wider px-4 py-3 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a1a1a]">
              {alerts.map((alert) => {
                const sev = severityConfig[alert.severity] ?? severityConfig.INFO;
                const st = statusConfig[alert.status] ?? statusConfig.CLOSED;
                return (
                  <tr key={alert.id} className="hover:bg-[#1a1a1a] transition-colors">
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 rounded border font-medium" style={{ backgroundColor: sev.bg, color: sev.text, borderColor: sev.border }}>
                        {alert.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-[200px]">
                      <p className="text-white text-xs font-medium truncate">{alert.title}</p>
                      {alert.description && <p className="text-[#888888] text-xs truncate">{alert.description}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-white text-xs">{alert.asset.name}</p>
                      <p className="text-[#888888] text-xs">{alert.asset.site.name}</p>
                    </td>
                    <td className="px-4 py-3 text-[#888888] text-xs">{alert.alertType.replace(/_/g, " ")}</td>
                    <td className="px-4 py-3 text-[#888888] text-xs">
                      {alert.metricName && (
                        <span>{alert.metricName}: <strong className="text-white">{alert.metricValue?.toFixed(2)}</strong></span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[#888888] text-xs">{alert.assignee?.name ?? "Unassigned"}</td>
                    <td className="px-4 py-3 text-[#888888] text-xs whitespace-nowrap">
                      {formatDistanceToNow(new Date(alert.openedAt), { addSuffix: true })}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: st.bg, color: st.text }}>
                        {alert.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <a href={`/alerts/${alert.id}`} className="text-[#e11d48] text-xs hover:underline">
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
