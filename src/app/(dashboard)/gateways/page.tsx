import { prisma } from "@/lib/prisma";
import { Wifi, Radio } from "lucide-react";

export default async function GatewaysPage() {
  const gateways = await prisma.gateway.findMany({
    include: {
      site: { select: { name: true } },
      _count: { select: { sensors: true } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-[#1C1714] text-2xl font-bold">Gateway Registry</h1>
        <p className="text-[#9C9285] text-sm mt-0.5">{gateways.length} gateways registered</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {gateways.map((gw) => (
          <div key={gw.id} className="bg-white border border-[#E5DDD0] rounded-xl p-5 space-y-4 hover:shadow-md hover:border-[#D4C8B8] transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#EFF6FF] flex items-center justify-center">
                  <Wifi className="w-4 h-4 text-[#1E5FA8]" />
                </div>
                <div>
                  <p className="text-[#1C1714] font-semibold">{gw.name}</p>
                  <p className="text-[#9C9285] text-xs">{gw.site.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${gw.status === "online" ? "bg-[#166534]" : "bg-[#B91C1C]"}`} />
                <span className={`text-xs font-medium ${gw.status === "online" ? "text-[#166534]" : "text-[#B91C1C]"}`}>{gw.status.toUpperCase()}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-[#9C9285] text-xs">Serial</p>
                <p className="text-[#1C1714] font-mono text-xs font-medium">{gw.serialNumber}</p>
              </div>
              <div>
                <p className="text-[#9C9285] text-xs">Type</p>
                <p className="text-[#1C1714] text-xs">{gw.connectionType}</p>
              </div>
              <div>
                <p className="text-[#9C9285] text-xs">IP Address</p>
                <p className="text-[#1C1714] font-mono text-xs">{gw.ipAddress ?? "—"}</p>
              </div>
              <div>
                <p className="text-[#9C9285] text-xs">Sensors</p>
                <div className="flex items-center gap-1">
                  <Radio className="w-3 h-3 text-[#9C9285]" />
                  <p className="text-[#1C1714] text-xs font-medium">{gw._count.sensors}</p>
                </div>
              </div>
            </div>
            {gw.lastSeenAt && (
              <p className="text-[#9C9285] text-xs border-t border-[#EDE8E0] pt-3">
                Last seen: {new Date(gw.lastSeenAt).toLocaleString()}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
