import { prisma } from "@/lib/prisma";

const severityColors: Record<string, { bg: string; text: string }> = {
  CRITICAL: { bg: "#ef444415", text: "#ef4444" },
  HIGH: { bg: "#f59e0b15", text: "#f59e0b" },
  MEDIUM: { bg: "#3b82f615", text: "#3b82f6" },
  LOW: { bg: "#88888815", text: "#888888" },
  INFO: { bg: "#6366f115", text: "#6366f1" },
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
          <h1 className="text-white text-2xl font-bold">Alert Rules</h1>
          <p className="text-[#888888] text-sm mt-0.5">{activeCount} active rules of {rules.length} total</p>
        </div>
      </div>

      <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2a2a2a]">
                {["Rule Name", "Sensor / Asset", "Metric", "Condition", "Severity", "Type", "Alerts", "Active"].map(h => (
                  <th key={h} className="text-left text-[#888888] text-xs uppercase tracking-wider px-4 py-3 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a1a1a]">
              {rules.map((rule) => {
                const sc = severityColors[rule.severity] ?? severityColors.INFO;
                return (
                  <tr key={rule.id} className="hover:bg-[#1a1a1a] transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-white font-medium text-xs">{rule.name}</p>
                      {rule.description && <p className="text-[#888888] text-xs truncate max-w-[180px]">{rule.description}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-white text-xs">{rule.sensor.name}</p>
                      <p className="text-[#888888] text-xs">{rule.sensor.asset.name} · {rule.sensor.asset.site.name}</p>
                    </td>
                    <td className="px-4 py-3 text-[#888888] text-xs">{rule.metricName}</td>
                    <td className="px-4 py-3 text-white text-xs font-mono">
                      {rule.metricName} {rule.operator} {rule.threshold}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: sc.bg, color: sc.text }}>
                        {rule.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#888888] text-xs">{rule.alertType.replace(/_/g, " ")}</td>
                    <td className="px-4 py-3 text-center text-white">{rule._count.alerts}</td>
                    <td className="px-4 py-3">
                      <div className={`w-8 h-4 rounded-full ${rule.isActive ? "bg-[#22c55e]" : "bg-[#2a2a2a]"} transition-colors`} />
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
