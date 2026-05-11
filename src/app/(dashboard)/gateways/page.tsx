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
        <h1 className="text-white text-2xl font-bold">Gateway Registry</h1>
        <p className="text-[#888888] text-sm mt-0.5">{gateways.length} gateways registered</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {gateways.map((gw) => (
          <div key={gw.id} className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#3b82f610] flex items-center justify-center">
                  <Wifi className="w-4 h-4 text-[#3b82f6]" />
                </div>
                <div>
                  <p className="text-white font-semibold">{gw.name}</p>
                  <p className="text-[#888888] text-xs">{gw.site.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${gw.status === "online" ? "bg-[#22c55e]" : "bg-[#ef4444]"}`} />
                <span className={`text-xs ${gw.status === "online" ? "text-[#22c55e]" : "text-[#ef4444]"}`}>{gw.status.toUpperCase()}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-[#888888] text-xs">Serial</p>
                <p className="text-white font-mono text-xs">{gw.serialNumber}</p>
              </div>
              <div>
                <p className="text-[#888888] text-xs">Type</p>
                <p className="text-white text-xs">{gw.connectionType}</p>
              </div>
              <div>
                <p className="text-[#888888] text-xs">IP Address</p>
                <p className="text-white font-mono text-xs">{gw.ipAddress ?? "—"}</p>
              </div>
              <div>
                <p className="text-[#888888] text-xs">Sensors</p>
                <div className="flex items-center gap-1">
                  <Radio className="w-3 h-3 text-[#888888]" />
                  <p className="text-white text-xs">{gw._count.sensors}</p>
                </div>
              </div>
            </div>
            {gw.lastSeenAt && (
              <p className="text-[#888888] text-xs border-t border-[#2a2a2a] pt-3">
                Last seen: {new Date(gw.lastSeenAt).toLocaleString()}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
