import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { MapPin, Building2, Package, Wifi, Radio } from "lucide-react";

const pillarColors: Record<string, string> = {
  ELECTRICITY: "#f59e0b", WATER: "#3b82f6", WASTEWATER: "#8b5cf6",
  GAS_AIR: "#22c55e", ENVIRONMENT: "#06b6d4", THERMAL_HVAC: "#f97316", COMPRESSED_AIR: "#06b6d4",
};

export default async function SiteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const site = await prisma.site.findUnique({
    where: { id },
    include: {
      buildings: { include: { zones: true } },
      gateways: true,
      assets: {
        include: { sensors: { select: { id: true, status: true } } },
        orderBy: { name: "asc" },
      },
    },
  });

  if (!site) notFound();

  const onlineCount = site.assets.flatMap(a => a.sensors).filter(s => s.status === "ONLINE").length;
  const totalSensors = site.assets.flatMap(a => a.sensors).length;

  const pillarCounts = site.assets.reduce((acc, a) => {
    acc[a.pillar] = (acc[a.pillar] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-[#e11d4810] flex items-center justify-center">
          <MapPin className="w-5 h-5 text-[#e11d48]" />
        </div>
        <div>
          <h1 className="text-white text-2xl font-bold">{site.name}</h1>
          <p className="text-[#888888] text-sm">{site.code} · {site.address}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-4">
          <Building2 className="w-5 h-5 text-[#888888] mb-2" />
          <p className="text-white text-xl font-bold">{site.buildings.length}</p>
          <p className="text-[#888888] text-xs">Buildings</p>
        </div>
        <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-4">
          <Package className="w-5 h-5 text-[#888888] mb-2" />
          <p className="text-white text-xl font-bold">{site.assets.length}</p>
          <p className="text-[#888888] text-xs">Assets</p>
        </div>
        <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-4">
          <Radio className="w-5 h-5 text-[#888888] mb-2" />
          <p className="text-white text-xl font-bold">{onlineCount}/{totalSensors}</p>
          <p className="text-[#888888] text-xs">Sensors Online</p>
        </div>
        <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-4">
          <Wifi className="w-5 h-5 text-[#888888] mb-2" />
          <p className="text-white text-xl font-bold">{site.gateways.length}</p>
          <p className="text-[#888888] text-xs">Gateways</p>
        </div>
      </div>

      {/* Pillar breakdown */}
      <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-5">
        <h3 className="text-white font-semibold mb-4">Assets by Utility Pillar</h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(pillarCounts).map(([pillar, count]) => (
            <div key={pillar} className="flex items-center gap-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: pillarColors[pillar] ?? "#888888" }} />
              <span className="text-white text-sm font-medium">{count}</span>
              <span className="text-[#888888] text-xs">{pillar.replace("_", " ")}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Asset list */}
      <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl">
        <div className="p-5 border-b border-[#2a2a2a]">
          <h3 className="text-white font-semibold">Assets</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2a2a2a]">
                <th className="text-left text-[#888888] text-xs uppercase tracking-wider px-5 py-3 font-medium">Asset</th>
                <th className="text-left text-[#888888] text-xs uppercase tracking-wider px-4 py-3 font-medium">Pillar</th>
                <th className="text-left text-[#888888] text-xs uppercase tracking-wider px-4 py-3 font-medium">Type</th>
                <th className="text-center text-[#888888] text-xs uppercase tracking-wider px-4 py-3 font-medium">Sensors</th>
                <th className="text-center text-[#888888] text-xs uppercase tracking-wider px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a1a1a]">
              {site.assets.map((asset) => (
                <tr key={asset.id} className="hover:bg-[#1a1a1a] transition-colors">
                  <td className="px-5 py-3">
                    <p className="text-white font-medium">{asset.name}</p>
                    <p className="text-[#888888] text-xs">{asset.code}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: `${pillarColors[asset.pillar] ?? "#888888"}20`, color: pillarColors[asset.pillar] ?? "#888888" }}>
                      {asset.pillar.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#888888]">{asset.assetType}</td>
                  <td className="px-4 py-3 text-center text-white">{asset.sensors.length}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded ${asset.status === "ACTIVE" ? "bg-[#22c55e20] text-[#22c55e]" : "bg-[#f59e0b20] text-[#f59e0b]"}`}>
                      {asset.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
