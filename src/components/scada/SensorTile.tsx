"use client";

import { formatDistanceToNow } from "date-fns";
import { Wifi, WifiOff, AlertTriangle, Clock, Wrench } from "lucide-react";

export interface SensorTileData {
  id: string;
  name: string;
  sensorType: string;
  metricName: string;
  unit: string;
  status: string;
  lastValue: number | null;
  lastReadingAt: string | Date | null;
  minValue: number | null;
  maxValue: number | null;
  assetName: string;
  assetCode: string;
  pillar: string;
  pillarColor: string;
  siteName: string;
  trend: number[];
}

const STATUS_CFG = {
  ONLINE:          { dot: "#22C55E", glow: "rgba(34,197,94,0.20)",  label: "ONLINE",   icon: Wifi,          pulse: true  },
  OFFLINE:         { dot: "#EF4444", glow: "rgba(239,68,68,0.16)",  label: "OFFLINE",  icon: WifiOff,       pulse: false },
  FAULT:           { dot: "#F59E0B", glow: "rgba(245,158,11,0.18)", label: "FAULT",    icon: AlertTriangle, pulse: false },
  CALIBRATION_DUE: { dot: "#3B82F6", glow: "rgba(59,130,246,0.16)", label: "CAL DUE",  icon: Clock,         pulse: false },
  MAINTENANCE:     { dot: "#8B5CF6", glow: "rgba(139,92,246,0.16)", label: "MAINT.",   icon: Wrench,        pulse: false },
} as const;

function formatValue(val: number | null): string {
  if (val === null) return "—";
  if (Math.abs(val) >= 10000) return val.toLocaleString("id-ID", { maximumFractionDigits: 0 });
  if (Math.abs(val) >= 1000) return val.toLocaleString("id-ID", { maximumFractionDigits: 1 });
  if (Number.isInteger(val)) return val.toString();
  return val.toFixed(val < 10 ? 2 : 1);
}

function gaugePercent(val: number | null, min: number | null, max: number | null): number {
  if (val === null || min === null || max === null || max === min) return 0;
  return Math.min(100, Math.max(0, ((val - min) / (max - min)) * 100));
}

function gaugeColor(pct: number, base: string): string {
  if (pct >= 90) return "#EF4444";
  if (pct >= 75) return "#F59E0B";
  return base;
}

// Lightweight SVG sparkline — no Recharts overhead
function Sparkline({ data, color, isOnline }: { data: number[]; color: string; isOnline: boolean }) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const W = 100; const H = 28;
  const pts = data.map((v, i) => [
    (i / (data.length - 1)) * W,
    H - ((v - min) / range) * (H - 2) - 1,
  ]);
  const line = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${line} L${W},${H} L0,${H} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`sg-${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={isOnline ? 0.25 : 0.08} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#sg-${color.replace("#","")})`} />
      <path d={line} fill="none" stroke={isOnline ? color : "#D1D5DB"} strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SensorTile({ s }: { s: SensorTileData }) {
  const cfg = STATUS_CFG[s.status as keyof typeof STATUS_CFG] ?? STATUS_CFG.OFFLINE;
  const StatusIcon = cfg.icon;
  const pct      = gaugePercent(s.lastValue, s.minValue, s.maxValue);
  const barColor = s.status === "ONLINE" ? gaugeColor(pct, s.pillarColor) : "#D1D5DB";
  const isOnline = s.status === "ONLINE";

  const lastSeenText = s.lastReadingAt
    ? formatDistanceToNow(new Date(s.lastReadingAt), { addSuffix: true })
    : "no data";

  return (
    <div
      className="relative flex flex-col rounded-2xl overflow-hidden transition-all duration-200 cursor-default select-none"
      style={{
        background: "#FFFFFF",
        border: "1px solid rgba(13,27,53,0.07)",
        boxShadow: isOnline
          ? `0 1px 3px rgba(13,27,53,0.05), 0 4px 16px rgba(13,27,53,0.06), inset 0 0 18px ${cfg.glow}`
          : "0 1px 3px rgba(13,27,53,0.04), 0 2px 8px rgba(13,27,53,0.04)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
        (e.currentTarget as HTMLElement).style.boxShadow =
          `0 4px 16px rgba(13,27,53,0.10), 0 12px 32px rgba(13,27,53,0.08), 0 0 0 1px ${s.pillarColor}33, inset 0 0 24px ${cfg.glow}`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "";
        (e.currentTarget as HTMLElement).style.boxShadow = isOnline
          ? `0 1px 3px rgba(13,27,53,0.05), 0 4px 16px rgba(13,27,53,0.06), inset 0 0 18px ${cfg.glow}`
          : "0 1px 3px rgba(13,27,53,0.04), 0 2px 8px rgba(13,27,53,0.04)";
      }}
    >
      {/* Pillar color top strip */}
      <div className="h-[3px] w-full flex-shrink-0"
        style={{ background: `linear-gradient(90deg, ${s.pillarColor} 0%, ${s.pillarColor}44 100%)` }} />

      <div className="flex flex-col flex-1 p-3.5 gap-2.5">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-[#0D1B35] text-[12px] font-bold leading-tight truncate">{s.name}</p>
            <p className="text-[#98A8C0] text-[10px] mt-0.5 truncate">{s.assetCode} · {s.sensorType}</p>
          </div>
          {/* Status badge */}
          <div
            className="flex items-center gap-1 px-1.5 py-0.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: `${cfg.dot}18`, border: `1px solid ${cfg.dot}44` }}
          >
            {cfg.pulse ? (
              <span className="relative flex h-1.5 w-1.5 flex-shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: cfg.dot }} />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ backgroundColor: cfg.dot }} />
              </span>
            ) : (
              <StatusIcon className="w-2.5 h-2.5 flex-shrink-0" style={{ color: cfg.dot }} />
            )}
            <span className="text-[8px] font-black uppercase tracking-widest" style={{ color: cfg.dot }}>{cfg.label}</span>
          </div>
        </div>

        {/* Value */}
        <div className="flex items-end gap-1.5">
          <span
            className="font-black tracking-tight leading-none"
            style={{ fontSize: "clamp(1.4rem,3.5vw,1.9rem)", color: isOnline ? "#0D1B35" : "#98A8C0" }}
          >
            {formatValue(s.lastValue)}
          </span>
          {s.unit && (
            <span className="text-xs font-semibold pb-0.5" style={{ color: isOnline ? "#6378A0" : "#C0CCDE" }}>
              {s.unit}
            </span>
          )}
        </div>

        {/* Sparkline trend */}
        {s.trend.length >= 2 && (
          <div className="-mx-1">
            <Sparkline data={s.trend} color={barColor} isOnline={isOnline} />
          </div>
        )}

        {/* Gauge bar */}
        {s.minValue !== null && s.maxValue !== null && (
          <div className="space-y-1">
            <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(13,27,53,0.07)" }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${pct}%`,
                  backgroundColor: barColor,
                  boxShadow: isOnline ? `0 0 6px ${barColor}88` : "none",
                }}
              />
            </div>
            <div className="flex justify-between">
              <span className="text-[9px] text-[#C0CCDE]">{s.minValue}</span>
              <span className="text-[9px] font-semibold" style={{ color: pct >= 75 ? barColor : "#C0CCDE" }}>
                {isOnline ? `${Math.round(pct)}%` : "—"}
              </span>
              <span className="text-[9px] text-[#C0CCDE]">{s.maxValue}</span>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 mt-auto" style={{ borderTop: "1px solid rgba(13,27,53,0.06)" }}>
          <span
            className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider truncate max-w-[60%]"
            style={{ backgroundColor: `${s.pillarColor}14`, color: s.pillarColor }}
          >
            {s.assetName}
          </span>
          <span className="text-[9px] text-[#C0CCDE] flex-shrink-0">{lastSeenText}</span>
        </div>
      </div>
    </div>
  );
}
