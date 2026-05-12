import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Activity, Wifi, WifiOff, AlertTriangle, Clock, MonitorDot } from "lucide-react";
import { ScadaCarousel, type SiteSlide } from "@/components/scada/ScadaCarousel";
import type { SensorTileData } from "@/components/scada/SensorTile";

const PILLAR_CFG: Record<string, { color: string; label: string }> = {
  ELECTRICITY:    { color: "#B45309", label: "Electricity"    },
  WATER:          { color: "#1E5FA8", label: "Water"          },
  WASTEWATER:     { color: "#7C3AED", label: "Wastewater"     },
  GAS_AIR:        { color: "#166534", label: "Gas / Air"      },
  ENVIRONMENT:    { color: "#0891B2", label: "Environment"    },
  THERMAL_HVAC:   { color: "#B8901A", label: "Thermal / HVAC" },
  COMPRESSED_AIR: { color: "#0E7490", label: "Compressed Air" },
};

// Seeded deterministic trend — 16 points around lastValue
function makeTrend(sensorId: string, lastValue: number | null, minVal: number | null, maxVal: number | null): number[] {
  if (lastValue === null) return [];
  const spread = ((maxVal ?? lastValue * 2) - (minVal ?? 0)) * 0.15 || Math.abs(lastValue) * 0.1 || 1;
  const seed = sensorId.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return Array.from({ length: 16 }, (_, i) => {
    const x = Math.sin(seed * 0.3 + i * 1.7) * 0.5 + Math.sin(seed * 0.7 + i * 0.9) * 0.5;
    return +(lastValue + x * spread).toFixed(3);
  });
}

export default async function ScadaPage() {
  await auth();

  const [sensors, openAlerts] = await Promise.all([
    prisma.sensor.findMany({
      include: {
        asset: { select: { name: true, code: true, pillar: true, site: { select: { id: true, name: true } } } },
      },
      orderBy: [{ asset: { pillar: "asc" } }, { name: "asc" }],
    }),
    prisma.alert.count({ where: { status: { in: ["OPEN", "ACKNOWLEDGED", "INVESTIGATING"] } } }),
  ]);

  const online = sensors.filter((s) => s.status === "ONLINE").length;
  const offline = sensors.filter((s) => s.status === "OFFLINE").length;
  const fault   = sensors.filter((s) => s.status === "FAULT").length;
  const calDue  = sensors.filter((s) => s.status === "CALIBRATION_DUE").length;

  // Build slides: site → pillar → sensors
  const bySite = new Map<string, { siteName: string; byPillar: Map<string, SensorTileData[]> }>();

  for (const s of sensors) {
    const siteId      = s.asset.site.id;
    const siteName    = s.asset.site.name;
    const pillar      = s.asset.pillar as string;
    const pillarColor = PILLAR_CFG[pillar]?.color ?? "#6378A0";

    if (!bySite.has(siteId)) bySite.set(siteId, { siteName, byPillar: new Map() });
    const siteEntry = bySite.get(siteId)!;
    if (!siteEntry.byPillar.has(pillar)) siteEntry.byPillar.set(pillar, []);

    siteEntry.byPillar.get(pillar)!.push({
      id: s.id, name: s.name, sensorType: s.sensorType,
      metricName: s.metricName, unit: s.unit,
      status: s.status as string,
      lastValue: s.lastValue,
      lastReadingAt: s.lastReadingAt ? s.lastReadingAt.toISOString() : null,
      minValue: s.minValue, maxValue: s.maxValue,
      assetName: s.asset.name, assetCode: s.asset.code,
      pillar, pillarColor, siteName,
      trend: makeTrend(s.id, s.lastValue, s.minValue, s.maxValue),
    });
  }

  const slides: SiteSlide[] = [...bySite.entries()].map(([siteId, { siteName, byPillar }]) => ({
    siteId,
    siteName,
    byPillar: [...byPillar.entries()],
  }));

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #0D1B35 0%, #1E3A6A 100%)" }}
          >
            <MonitorDot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-[#0D1B35] text-2xl font-bold">SCADA Monitor</h1>
            <p className="text-[#6378A0] text-sm mt-0.5">
              {sensors.length} sensors across {slides.length} site{slides.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-[#F0FDF4] border border-[#BBF7D0] rounded-full px-4 py-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22C55E]" />
            </span>
            <span className="text-[#166534] text-xs font-semibold">Live</span>
          </div>
          {openAlerts > 0 && (
            <a
              href="/alerts"
              className="flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold border transition-opacity hover:opacity-80"
              style={{ backgroundColor: "#FEF2F2", borderColor: "#FECACA", color: "#B91C1C" }}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              {openAlerts} open alert{openAlerts > 1 ? "s" : ""}
            </a>
          )}
        </div>
      </div>

      {/* Stat strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Online",   value: online,  icon: Wifi,          color: "#166534", bg: "#F0FDF4", border: "#BBF7D0" },
          { label: "Offline",  value: offline, icon: WifiOff,       color: "#B91C1C", bg: "#FEF2F2", border: "#FECACA" },
          { label: "Fault",    value: fault,   icon: AlertTriangle, color: "#B45309", bg: "#FFFBEB", border: "#FDE68A" },
          { label: "Cal. Due", value: calDue,  icon: Clock,         color: "#1D4ED8", bg: "#EFF6FF", border: "#BFDBFE" },
        ].map(({ label, value, icon: Icon, color, bg, border }) => (
          <div
            key={label}
            className="flex items-center gap-3 rounded-xl px-4 py-3"
            style={{ backgroundColor: bg, border: `1px solid ${border}` }}
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}18` }}>
              <Icon className="w-4 h-4" style={{ color }} />
            </div>
            <div>
              <p className="text-2xl font-black leading-none" style={{ color: "#0D1B35" }}>{value}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider mt-0.5" style={{ color }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Carousel */}
      <div
        className="rounded-2xl p-5"
        style={{ background: "#fff", boxShadow: "0 1px 3px rgba(13,27,53,0.05), 0 4px 16px rgba(13,27,53,0.06)", border: "1px solid rgba(13,27,53,0.06)" }}
      >
        {slides.length === 0 ? (
          <div className="flex flex-col items-center py-20">
            <MonitorDot className="w-12 h-12 text-[#D9E2F0] mb-3" />
            <p className="text-[#0D1B35] font-semibold">No sensors found</p>
            <p className="text-[#6378A0] text-sm mt-1">Add sensors and assets to see them here</p>
          </div>
        ) : (
          <ScadaCarousel slides={slides} />
        )}
      </div>
    </div>
  );
}
