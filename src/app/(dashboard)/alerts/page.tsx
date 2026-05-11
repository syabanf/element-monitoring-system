import { prisma } from "@/lib/prisma";
import { formatDistanceToNow } from "date-fns";

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
          <h1 className="text-[#0D1B35] text-2xl font-bold">Alert Console</h1>
          <p className="text-[#6378A0] text-sm mt-0.5">{alerts.length} alerts</p>
        </div>
      </div>

      {/* Status summary */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(statusCounts).map(([status, count]) => {
          const sc = statusConfig[status] ?? statusConfig.CLOSED;
          return (
            <div key={status} className="flex items-center gap-2 bg-white border border-[#D9E2F0] rounded-lg px-3 py-1.5 shadow-sm">
              <span className="text-sm font-bold" style={{ color: sc.text }}>{count}</span>
              <span className="text-[#6378A0] text-xs">{status.replace("_", " ")}</span>
            </div>
          );
        })}
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
              {alerts.map((alert) => {
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
