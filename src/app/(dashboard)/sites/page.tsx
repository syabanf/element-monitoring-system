import { prisma } from "@/lib/prisma";
import { MapPin, Building2, Package, Wifi, ExternalLink } from "lucide-react";

export default async function SitesPage() {
  const sites = await prisma.site.findMany({
    where: { isActive: true },
    include: {
      buildings: { include: { _count: { select: { zones: true } } } },
      gateways: { select: { id: true, name: true, status: true } },
      _count: { select: { assets: true } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-bold">Sites</h1>
          <p className="text-[#888888] text-sm mt-0.5">{sites.length} active sites</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {sites.map((site) => (
          <div key={site.id} className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-5 space-y-4 hover:border-[#3a3a3a] transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#e11d4810] flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-[#e11d48]" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">{site.name}</h3>
                  <p className="text-[#888888] text-xs">{site.code} · {site.city ?? site.address}</p>
                </div>
              </div>
              <a href={`/sites/${site.id}`} className="text-[#e11d48] hover:text-[#be123c] transition-colors">
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[#1a1a1a] rounded-lg p-3 text-center">
                <Building2 className="w-4 h-4 text-[#888888] mx-auto mb-1" />
                <p className="text-white font-bold">{site.buildings.length}</p>
                <p className="text-[#888888] text-xs">Buildings</p>
              </div>
              <div className="bg-[#1a1a1a] rounded-lg p-3 text-center">
                <Package className="w-4 h-4 text-[#888888] mx-auto mb-1" />
                <p className="text-white font-bold">{site._count.assets}</p>
                <p className="text-[#888888] text-xs">Assets</p>
              </div>
              <div className="bg-[#1a1a1a] rounded-lg p-3 text-center">
                <Wifi className="w-4 h-4 text-[#888888] mx-auto mb-1" />
                <p className="text-white font-bold">{site.gateways.length}</p>
                <p className="text-[#888888] text-xs">Gateways</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs border-t border-[#2a2a2a] pt-3">
              <span className="text-[#888888]">{site.timezone}</span>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#22c55e]" />
                <span className="text-[#22c55e]">ACTIVE</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
