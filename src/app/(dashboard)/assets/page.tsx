import { prisma } from "@/lib/prisma";

const pillarColors: Record<string, string> = {
  ELECTRICITY: "#f59e0b", WATER: "#3b82f6", WASTEWATER: "#8b5cf6",
  GAS_AIR: "#22c55e", ENVIRONMENT: "#06b6d4", THERMAL_HVAC: "#f97316", COMPRESSED_AIR: "#0891b2",
};

const statusConfig: Record<string, { bg: string; text: string }> = {
  ACTIVE: { bg: "#22c55e20", text: "#22c55e" },
  INACTIVE: { bg: "#88888820", text: "#888888" },
  MAINTENANCE: { bg: "#f59e0b20", text: "#f59e0b" },
  DECOMMISSIONED: { bg: "#ef444420", text: "#ef4444" },
};

export default async function AssetsPage() {
  const assets = await prisma.asset.findMany({
    include: {
      site: { select: { name: true, code: true } },
      zone: { select: { name: true } },
      _count: { select: { sensors: true, alerts: true } },
    },
    orderBy: [{ site: { name: "asc" } }, { pillar: "asc" }, { name: "asc" }],
  });

  // Group by pillar for summary
  const pillarCount = assets.reduce((acc, a) => {
    acc[a.pillar] = (acc[a.pillar] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-bold">Asset Registry</h1>
          <p className="text-[#888888] text-sm mt-0.5">{assets.length} total assets</p>
        </div>
      </div>

      {/* Pillar summary chips */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(pillarCount).map(([pillar, count]) => (
          <div key={pillar} className="flex items-center gap-2 bg-[#111111] border border-[#2a2a2a] rounded-lg px-3 py-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: pillarColors[pillar] ?? "#888" }} />
            <span className="text-white text-sm font-medium">{count}</span>
            <span className="text-[#888888] text-xs">{pillar.replace(/_/g, " ")}</span>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2a2a2a]">
                {["Asset", "Site", "Pillar", "Type", "Zone", "Sensors", "Open Alerts", "Status"].map(h => (
                  <th key={h} className="text-left text-[#888888] text-xs uppercase tracking-wider px-4 py-3 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a1a1a]">
              {assets.map((asset) => {
                const sc = statusConfig[asset.status] ?? statusConfig.INACTIVE;
                return (
                  <tr key={asset.id} className="hover:bg-[#1a1a1a] transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-white font-medium">{asset.name}</p>
                      <p className="text-[#888888] text-xs">{asset.code}</p>
                    </td>
                    <td className="px-4 py-3 text-[#888888]">{asset.site.name}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: `${pillarColors[asset.pillar] ?? "#888"}20`, color: pillarColors[asset.pillar] ?? "#888" }}>
                        {asset.pillar.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#888888] text-xs">{asset.assetType}</td>
                    <td className="px-4 py-3 text-[#888888] text-xs">{asset.zone?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-center text-white">{asset._count.sensors}</td>
                    <td className="px-4 py-3 text-center">
                      {asset._count.alerts > 0 ? (
                        <span className="text-[#ef4444] font-medium">{asset._count.alerts}</span>
                      ) : <span className="text-[#888888]">0</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: sc.bg, color: sc.text }}>
                        {asset.status}
                      </span>
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
