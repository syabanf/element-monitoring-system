import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { MapPin, Building2, Package, Wifi, Radio } from "lucide-react";

const pillarColors: Record<string, { bg: string; text: string; dot: string }> = {
  ELECTRICITY: { bg: "#FFFBEB", text: "#B45309", dot: "#B45309" },
  WATER:       { bg: "#EFF6FF", text: "#1E5FA8", dot: "#1E5FA8" },
  WASTEWATER:  { bg: "#F5F3FF", text: "#6D28D9", dot: "#6D28D9" },
  GAS_AIR:     { bg: "#F0FDF4", text: "#166534", dot: "#166534" },
  ENVIRONMENT: { bg: "#ECFEFF", text: "#0E7490", dot: "#0E7490" },
  THERMAL_HVAC:{ bg: "#FFF7ED", text: "#C2410C", dot: "#C2410C" },
  COMPRESSED_AIR: { bg: "#ECFEFF", text: "#0E7490", dot: "#0E7490" },
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
        <div className="w-10 h-10 rounded-lg bg-[#FEF7E6] flex items-center justify-center">
          <MapPin className="w-5 h-5 text-[#B8901A]" />
        </div>
        <div>
          <h1 className="text-[#0D1B35] text-2xl font-bold">{site.name}</h1>
          <p className="text-[#6378A0] text-sm">{site.code} · {site.address}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#D9E2F0] rounded-xl p-5 shadow-sm">
          <Building2 className="w-5 h-5 text-[#6378A0] mb-2" />
          <p className="text-[#0D1B35] text-2xl font-bold">{site.buildings.length}</p>
          <p className="text-[#6378A0] text-xs font-semibold uppercase tracking-wider mt-0.5">Buildings</p>
        </div>
        <div className="bg-white border border-[#D9E2F0] rounded-xl p-5 shadow-sm">
          <Package className="w-5 h-5 text-[#6378A0] mb-2" />
          <p className="text-[#0D1B35] text-2xl font-bold">{site.assets.length}</p>
          <p className="text-[#6378A0] text-xs font-semibold uppercase tracking-wider mt-0.5">Assets</p>
        </div>
        <div className="bg-white border border-[#D9E2F0] rounded-xl p-5 shadow-sm">
          <Radio className="w-5 h-5 text-[#6378A0] mb-2" />
          <p className="text-[#0D1B35] text-2xl font-bold">{onlineCount}/{totalSensors}</p>
          <p className="text-[#6378A0] text-xs font-semibold uppercase tracking-wider mt-0.5">Sensors Online</p>
        </div>
        <div className="bg-white border border-[#D9E2F0] rounded-xl p-5 shadow-sm">
          <Wifi className="w-5 h-5 text-[#6378A0] mb-2" />
          <p className="text-[#0D1B35] text-2xl font-bold">{site.gateways.length}</p>
          <p className="text-[#6378A0] text-xs font-semibold uppercase tracking-wider mt-0.5">Gateways</p>
        </div>
      </div>

      {/* Pillar breakdown */}
      <div className="bg-white border border-[#D9E2F0] rounded-xl p-5 shadow-sm">
        <h3 className="text-[#0D1B35] font-bold mb-4">Assets by Utility Pillar</h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(pillarCounts).map(([pillar, count]) => {
            const pc = pillarColors[pillar] ?? { bg: "#F2F5FB", text: "#6378A0", dot: "#6378A0" };
            return (
              <div key={pillar} className="flex items-center gap-2 bg-[#F2F5FB] border border-[#D9E2F0] rounded-lg px-3 py-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: pc.dot }} />
                <span className="text-[#0D1B35] text-sm font-semibold">{count}</span>
                <span className="text-[#6378A0] text-xs">{pillar.replace("_", " ")}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Asset list */}
      <div className="bg-white border border-[#D9E2F0] rounded-xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-[#E4EAF5]">
          <h3 className="text-[#0D1B35] font-bold">Assets</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F2F5FB] border-b border-[#D9E2F0]">
                <th className="text-left px-5 py-3 text-xs font-bold text-[#6378A0] uppercase tracking-wider">Asset</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-[#6378A0] uppercase tracking-wider">Pillar</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-[#6378A0] uppercase tracking-wider">Type</th>
                <th className="text-center px-5 py-3 text-xs font-bold text-[#6378A0] uppercase tracking-wider">Sensors</th>
                <th className="text-center px-5 py-3 text-xs font-bold text-[#6378A0] uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {site.assets.map((asset) => {
                const pc = pillarColors[asset.pillar] ?? { bg: "#F2F5FB", text: "#6378A0", dot: "#6378A0" };
                return (
                  <tr key={asset.id} className="border-b border-[#E4EAF5] hover:bg-[#F2F5FB] transition-colors last:border-0">
                    <td className="px-5 py-4">
                      <p className="text-[#0D1B35] text-sm font-medium">{asset.name}</p>
                      <p className="text-[#6378A0] text-xs">{asset.code}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: pc.bg, color: pc.text }}>
                        {asset.pillar.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-[#3D5280] text-sm">{asset.assetType}</td>
                    <td className="px-5 py-4 text-center text-[#0D1B35] text-sm font-medium">{asset.sensors.length}</td>
                    <td className="px-5 py-4 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${asset.status === "ACTIVE" ? "bg-[#F0FDF4] text-[#166534]" : "bg-[#FFFBEB] text-[#B45309]"}`}>
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
