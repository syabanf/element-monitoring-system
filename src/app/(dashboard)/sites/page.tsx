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
          <h1 className="text-[#1C1714] text-2xl font-bold">Sites</h1>
          <p className="text-[#9C9285] text-sm mt-0.5">{sites.length} active sites</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {sites.map((site) => (
          <div key={site.id} className="bg-white border border-[#E5DDD0] rounded-xl p-5 space-y-4 hover:shadow-md hover:border-[#D4C8B8] transition-all">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#FEF7E6] flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-[#B8901A]" />
                </div>
                <div>
                  <h3 className="text-[#1C1714] font-semibold">{site.name}</h3>
                  <p className="text-[#9C9285] text-xs">{site.code} · {site.city ?? site.address}</p>
                </div>
              </div>
              <a href={`/sites/${site.id}`} className="text-[#B8901A] hover:text-[#9A7A14] transition-colors">
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[#F5F3EE] rounded-lg p-3 text-center">
                <Building2 className="w-4 h-4 text-[#9C9285] mx-auto mb-1" />
                <p className="text-[#1C1714] font-bold">{site.buildings.length}</p>
                <p className="text-[#9C9285] text-xs">Buildings</p>
              </div>
              <div className="bg-[#F5F3EE] rounded-lg p-3 text-center">
                <Package className="w-4 h-4 text-[#9C9285] mx-auto mb-1" />
                <p className="text-[#1C1714] font-bold">{site._count.assets}</p>
                <p className="text-[#9C9285] text-xs">Assets</p>
              </div>
              <div className="bg-[#F5F3EE] rounded-lg p-3 text-center">
                <Wifi className="w-4 h-4 text-[#9C9285] mx-auto mb-1" />
                <p className="text-[#1C1714] font-bold">{site.gateways.length}</p>
                <p className="text-[#9C9285] text-xs">Gateways</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs border-t border-[#EDE8E0] pt-3">
              <span className="text-[#9C9285]">{site.timezone}</span>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#166534]" />
                <span className="text-[#166534] font-medium">ACTIVE</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
