import { prisma } from "@/lib/prisma";

const pillarColors: Record<string, { bg: string; text: string; dot: string }> = {
  ELECTRICITY: { bg: "#FFFBEB", text: "#B45309", dot: "#B45309" },
  WATER:       { bg: "#EFF6FF", text: "#1E5FA8", dot: "#1E5FA8" },
  WASTEWATER:  { bg: "#F5F3FF", text: "#6D28D9", dot: "#6D28D9" },
  GAS_AIR:     { bg: "#F0FDF4", text: "#166534", dot: "#166534" },
  ENVIRONMENT: { bg: "#ECFEFF", text: "#0E7490", dot: "#0E7490" },
  THERMAL_HVAC:{ bg: "#FFF7ED", text: "#C2410C", dot: "#C2410C" },
  COMPRESSED_AIR: { bg: "#ECFEFF", text: "#0E7490", dot: "#0E7490" },
};

const statusConfig: Record<string, { bg: string; text: string }> = {
  ACTIVE: { bg: "#F0FDF4", text: "#166534" },
  INACTIVE: { bg: "#F5F3EE", text: "#9C9285" },
  MAINTENANCE: { bg: "#FFFBEB", text: "#B45309" },
  DECOMMISSIONED: { bg: "#FEF2F2", text: "#B91C1C" },
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
          <h1 className="text-[#1C1714] text-2xl font-bold">Asset Registry</h1>
          <p className="text-[#9C9285] text-sm mt-0.5">{assets.length} total assets</p>
        </div>
      </div>

      {/* Pillar summary chips */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(pillarCount).map(([pillar, count]) => {
          const pc = pillarColors[pillar] ?? { bg: "#F5F3EE", text: "#9C9285", dot: "#9C9285" };
          return (
            <div key={pillar} className="flex items-center gap-2 bg-white border border-[#E5DDD0] rounded-lg px-3 py-1.5 shadow-sm">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: pc.dot }} />
              <span className="text-[#1C1714] text-sm font-semibold">{count}</span>
              <span className="text-[#9C9285] text-xs">{pillar.replace(/_/g, " ")}</span>
            </div>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-white border border-[#E5DDD0] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F5F3EE] border-b border-[#E5DDD0]">
                {["Asset", "Site", "Pillar", "Type", "Zone", "Sensors", "Open Alerts", "Status"].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-bold text-[#9C9285] uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {assets.map((asset) => {
                const sc = statusConfig[asset.status] ?? statusConfig.INACTIVE;
                const pc = pillarColors[asset.pillar] ?? { bg: "#F5F3EE", text: "#9C9285", dot: "#9C9285" };
                return (
                  <tr key={asset.id} className="border-b border-[#EDE8E0] hover:bg-[#F5F3EE] transition-colors last:border-0">
                    <td className="px-5 py-4">
                      <p className="text-[#1C1714] text-sm font-medium">{asset.name}</p>
                      <p className="text-[#9C9285] text-xs">{asset.code}</p>
                    </td>
                    <td className="px-5 py-4 text-[#5C5248] text-sm">{asset.site.name}</td>
                    <td className="px-5 py-4">
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: pc.bg, color: pc.text }}>
                        {asset.pillar.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-[#5C5248] text-sm">{asset.assetType}</td>
                    <td className="px-5 py-4 text-[#5C5248] text-sm">{asset.zone?.name ?? "—"}</td>
                    <td className="px-5 py-4 text-center text-[#1C1714] text-sm font-medium">{asset._count.sensors}</td>
                    <td className="px-5 py-4 text-center">
                      {asset._count.alerts > 0 ? (
                        <span className="text-[#B91C1C] font-semibold text-sm">{asset._count.alerts}</span>
                      ) : <span className="text-[#9C9285] text-sm">0</span>}
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: sc.bg, color: sc.text }}>
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
