import { prisma } from "@/lib/prisma";

const severityColors: Record<string, { bg: string; text: string }> = {
  CRITICAL: { bg: "#FEF2F2", text: "#B91C1C" },
  HIGH: { bg: "#FFFBEB", text: "#B45309" },
  MEDIUM: { bg: "#EFF6FF", text: "#1E5FA8" },
  LOW: { bg: "#F2F5FB", text: "#6378A0" },
  INFO: { bg: "#EFF6FF", text: "#1E5FA8" },
};

export default async function AlertRulesPage() {
  const rules = await prisma.alertRule.findMany({
    include: {
      sensor: {
        include: {
          asset: { select: { name: true, pillar: true, site: { select: { name: true } } } },
        },
      },
      _count: { select: { alerts: true } },
    },
    orderBy: [{ severity: "asc" }, { name: "asc" }],
  });

  const activeCount = rules.filter(r => r.isActive).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[#0D1B35] text-2xl font-bold">Alert Rules</h1>
          <p className="text-[#6378A0] text-sm mt-0.5">{activeCount} active rules of {rules.length} total</p>
        </div>
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
              {rules.map((rule) => {
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
