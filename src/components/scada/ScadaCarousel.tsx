"use client";

import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine,
} from "recharts";
import { ChevronLeft, ChevronRight, Activity, AlertTriangle } from "lucide-react";
import { SensorTile, type SensorTileData } from "./SensorTile";

const PILLAR_CFG: Record<string, { color: string; label: string }> = {
  ELECTRICITY:    { color: "#B45309", label: "Electricity"    },
  WATER:          { color: "#1E5FA8", label: "Water"          },
  WASTEWATER:     { color: "#7C3AED", label: "Wastewater"     },
  GAS_AIR:        { color: "#166534", label: "Gas / Air"      },
  ENVIRONMENT:    { color: "#0891B2", label: "Environment"    },
  THERMAL_HVAC:   { color: "#B8901A", label: "Thermal / HVAC" },
  COMPRESSED_AIR: { color: "#0E7490", label: "Compressed Air" },
};

export interface SiteSlide {
  siteId: string;
  siteName: string;
  byPillar: [string, SensorTileData[]][];
}

// Custom tooltip for the overview chart
function OverviewTooltip({ active, payload }: { active?: boolean; payload?: { payload: { name: string; pct: number; value: number; unit: string; status: string; color: string } }[] }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-xl px-3 py-2 text-xs shadow-lg z-50" style={{ background: "#0D1B35", color: "#fff", border: "1px solid rgba(255,255,255,0.08)" }}>
      <p className="text-[#98A8C0] mb-1 truncate max-w-[160px]">{d.name}</p>
      <p className="font-bold">{d.value} <span className="text-[#98A8C0] font-normal">{d.unit}</span></p>
      <p className="text-[10px] mt-0.5" style={{ color: d.pct >= 90 ? "#EF4444" : d.pct >= 75 ? "#F59E0B" : "#22C55E" }}>
        {d.pct}% of range
      </p>
    </div>
  );
}

function SiteOverviewChart({ sensors }: { sensors: SensorTileData[] }) {
  const data = sensors
    .filter((s) => s.lastValue !== null && s.minValue !== null && s.maxValue !== null)
    .map((s) => {
      const pct = Math.min(100, Math.max(0,
        ((s.lastValue! - s.minValue!) / ((s.maxValue! - s.minValue!) || 1)) * 100
      ));
      const color = s.status !== "ONLINE" ? "#D1D5DB"
        : pct >= 90 ? "#EF4444"
        : pct >= 75 ? "#F59E0B"
        : s.pillarColor;
      return {
        name: s.name,
        pct: Math.round(pct),
        value: s.lastValue!,
        unit: s.unit,
        status: s.status,
        color,
      };
    });

  if (data.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height={120}>
      <BarChart data={data} margin={{ top: 4, right: 4, bottom: 24, left: 0 }} barCategoryGap="20%">
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(13,27,53,0.06)" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 8, fill: "#98A8C0" }}
          axisLine={false} tickLine={false}
          interval={0}
          angle={-35}
          textAnchor="end"
          height={40}
        />
        <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: "#98A8C0" }} axisLine={false} tickLine={false} width={28} tickFormatter={(v) => `${v}%`} />
        <ReferenceLine y={75} stroke="#F59E0B44" strokeDasharray="4 4" />
        <ReferenceLine y={90} stroke="#EF444444" strokeDasharray="4 4" />
        <Tooltip content={<OverviewTooltip />} cursor={{ fill: "rgba(13,27,53,0.04)" }} />
        <Bar dataKey="pct" radius={[3, 3, 0, 0]} maxBarSize={32}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} fillOpacity={entry.status === "ONLINE" ? 1 : 0.35} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// Mini trend comparison for top sensors per pillar
function PillarTrendRow({ pillar, sensors }: { pillar: string; sensors: SensorTileData[] }) {
  const pcfg = PILLAR_CFG[pillar] ?? { color: "#6378A0", label: pillar };
  const online = sensors.filter((s) => s.status === "ONLINE");
  if (online.length === 0) return null;

  // Aggregate: sum or average of trend arrays
  const len = Math.max(...online.map((s) => s.trend.length));
  if (len < 2) return null;

  const aggregated = Array.from({ length: len }, (_, i) =>
    online.reduce((sum, s) => sum + (s.trend[i] ?? s.trend[s.trend.length - 1] ?? 0), 0) / online.length
  );

  const min = Math.min(...aggregated);
  const max = Math.max(...aggregated);
  const range = max - min || 1;
  const W = 100; const H = 28;
  const pts = aggregated.map((v, i) => [
    (i / (len - 1)) * W,
    H - ((v - min) / range) * (H - 2) - 1,
  ]);
  const line = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${line} L${W},${H} L0,${H} Z`;
  const lastPct = Math.min(100, Math.max(0,
    sensors[0]?.minValue !== null && sensors[0]?.maxValue !== null
      ? ((online[0]?.lastValue ?? 0) - (sensors[0].minValue ?? 0)) / ((sensors[0].maxValue ?? 1) - (sensors[0].minValue ?? 0)) * 100
      : 50
  ));
  const trendColor = lastPct >= 90 ? "#EF4444" : lastPct >= 75 ? "#F59E0B" : pcfg.color;

  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: `${pcfg.color}08`, border: `1px solid ${pcfg.color}22` }}>
      <div className="flex-shrink-0">
        <div className="w-2 h-2 rounded-sm mb-0.5" style={{ backgroundColor: pcfg.color }} />
        <p className="text-[9px] font-black uppercase tracking-wider" style={{ color: pcfg.color }}>{pcfg.label}</p>
      </div>
      <div className="flex-1 min-w-0">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }} preserveAspectRatio="none">
          <defs>
            <linearGradient id={`pt-${pillar}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={trendColor} stopOpacity="0.25" />
              <stop offset="100%" stopColor={trendColor} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={area} fill={`url(#pt-${pillar})`} />
          <path d={line} fill="none" stroke={trendColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div className="flex-shrink-0 text-right">
        <p className="text-xs font-black" style={{ color: trendColor }}>{Math.round(lastPct)}%</p>
        <p className="text-[9px] text-[#98A8C0]">{online.length}/{sensors.length} on</p>
      </div>
    </div>
  );
}

export function ScadaCarousel({ slides }: { slides: SiteSlide[] }) {
  const [current, setCurrent] = useState(0);
  const [animDir, setAnimDir] = useState<"left" | "right">("right");
  const [animKey, setAnimKey] = useState(0);

  function go(dir: "prev" | "next" | number) {
    if (dir === "prev") { setAnimDir("left");  setCurrent((p) => (p - 1 + slides.length) % slides.length); }
    else if (dir === "next") { setAnimDir("right"); setCurrent((p) => (p + 1) % slides.length); }
    else { setAnimDir(dir > current ? "right" : "left"); setCurrent(dir); }
    setAnimKey((k) => k + 1);
  }

  if (slides.length === 0) return null;
  const slide = slides[current];
  const allSensors = slide.byPillar.flatMap(([, arr]) => arr);
  const totalAll   = slides.reduce((n, s) => n + s.byPillar.reduce((m, [, a]) => m + a.length, 0), 0);
  const onlineCnt  = allSensors.filter((s) => s.status === "ONLINE").length;
  const faultCnt   = allSensors.filter((s) => s.status === "FAULT" || s.status === "OFFLINE").length;

  return (
    <div className="space-y-5">
      {/* Carousel nav bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          <div
            className="flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold"
            style={{ background: "linear-gradient(135deg, #0D1B35, #1E3A6A)", color: "#fff" }}
          >
            <Activity className="w-3 h-3" />
            {slide.siteName}
          </div>
          <span className="text-[#6378A0] text-xs">{onlineCnt}/{allSensors.length} online</span>
          {faultCnt > 0 && (
            <span className="flex items-center gap-1 text-[#B91C1C] text-xs font-semibold">
              <AlertTriangle className="w-3 h-3" />
              {faultCnt} fault
            </span>
          )}
        </div>

        {slides.length > 1 && (
          <div className="flex items-center gap-2">
            {/* Dots */}
            <div className="flex items-center gap-1.5">
              {slides.map((s, i) => (
                <button
                  key={s.siteId}
                  onClick={() => go(i)}
                  className="transition-all duration-200 rounded-full"
                  style={{ width: i === current ? 20 : 7, height: 7, backgroundColor: i === current ? "#B8901A" : "rgba(13,27,53,0.18)" }}
                  title={s.siteName}
                />
              ))}
            </div>
            {/* Arrows */}
            <button onClick={() => go("prev")} className="w-8 h-8 rounded-xl flex items-center justify-center hover:opacity-70 transition-opacity" style={{ background: "rgba(13,27,53,0.08)", color: "#6378A0" }}>
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => go("next")} className="w-8 h-8 rounded-xl flex items-center justify-center hover:opacity-70 transition-opacity" style={{ background: "rgba(13,27,53,0.08)", color: "#6378A0" }}>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Slide content */}
      <div
        key={`slide-${current}-${animKey}`}
        className="space-y-5"
        style={{ animation: `scadaSlide${animDir === "right" ? "InR" : "InL"} 0.3s cubic-bezier(0.25,0.46,0.45,0.94) both` }}
      >
        {/* Two-column overview: bar chart + pillar trend rows */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Overview bar chart */}
          <div className="lg:col-span-3 rounded-xl p-4" style={{ background: "rgba(240,244,250,0.6)", border: "1px solid rgba(13,27,53,0.06)" }}>
            <p className="text-[#0D1B35] text-xs font-bold mb-1">Sensor Overview — {slide.siteName}</p>
            <p className="text-[#98A8C0] text-[10px] mb-3">% of rated range · red line at 90%, amber at 75%</p>
            <SiteOverviewChart sensors={allSensors} />
          </div>

          {/* Pillar trend rows */}
          <div className="lg:col-span-2 space-y-2">
            <p className="text-[#0D1B35] text-xs font-bold mb-1">Pillar Aggregate Trends</p>
            {slide.byPillar.map(([pillar, sensors]) => (
              <PillarTrendRow key={pillar} pillar={pillar} sensors={sensors} />
            ))}
          </div>
        </div>

        {/* Sensor tile grids by pillar */}
        {slide.byPillar.map(([pillar, tileSensors]) => {
          const pcfg = PILLAR_CFG[pillar] ?? { color: "#6378A0", label: pillar };
          const pillarOnline = tileSensors.filter((s) => s.status === "ONLINE").length;
          return (
            <div key={pillar} className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: pcfg.color }} />
                <span className="text-[#0D1B35] text-sm font-bold">{pcfg.label}</span>
                <span className="text-[#98A8C0] text-xs">{pillarOnline}/{tileSensors.length} online</span>
                <div className="h-px flex-1" style={{ backgroundColor: `${pcfg.color}22` }} />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
                {tileSensors.map((sensor) => <SensorTile key={sensor.id} s={sensor} />)}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[#C0CCDE] text-[10px] text-center">
        Site {current + 1} of {slides.length} · {totalAll} total sensors
      </p>

      <style>{`
        @keyframes scadaSlideInR { from { opacity:0; transform:translateX(28px); } to { opacity:1; transform:translateX(0); } }
        @keyframes scadaSlideInL { from { opacity:0; transform:translateX(-28px); } to { opacity:1; transform:translateX(0); } }
      `}</style>
    </div>
  );
}
