"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface SensorHealthRingProps {
  online: number;
  offline: number;
  fault: number;
  calibrationDue: number;
}

const SEGMENTS = [
  { key: "online",        label: "Online",          color: "#22C55E" },
  { key: "offline",       label: "Offline",         color: "#EF4444" },
  { key: "fault",         label: "Fault",           color: "#F59E0B" },
  { key: "calibrationDue",label: "Calibration Due", color: "#3B82F6" },
];

export function SensorHealthRing({ online, offline, fault, calibrationDue }: SensorHealthRingProps) {
  const total = online + offline + fault + calibrationDue;
  const data = [
    { name: "Online",          value: online,          color: "#22C55E" },
    { name: "Offline",         value: offline,         color: "#EF4444" },
    { name: "Fault",           value: fault,           color: "#F59E0B" },
    { name: "Calibration Due", value: calibrationDue,  color: "#3B82F6" },
  ].filter(d => d.value > 0);

  const uptimePct = total > 0 ? Math.round((online / total) * 100) : 0;

  return (
    <div className="flex items-center gap-6">
      <div className="relative w-36 h-36 flex-shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={44}
              outerRadius={62}
              paddingAngle={2}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #E5DDD0",
                borderRadius: "8px",
                fontSize: 12,
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
              formatter={(val, name) => [`${val ?? 0} sensors`, name as string]}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-bold text-[#1C1714]">{uptimePct}%</span>
          <span className="text-[10px] text-[#9C9285] font-medium">uptime</span>
        </div>
      </div>

      <div className="flex-1 space-y-2.5">
        {SEGMENTS.map(seg => {
          const val = { online, offline, fault, calibrationDue }[seg.key as keyof SensorHealthRingProps];
          const pct = total > 0 ? Math.round((val / total) * 100) : 0;
          return (
            <div key={seg.key} className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: seg.color }} />
                  <span className="text-xs text-[#5C5248]">{seg.label}</span>
                </div>
                <span className="text-xs font-bold text-[#1C1714]">{val}</span>
              </div>
              <div className="w-full h-1.5 bg-[#EDE8E0] rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: seg.color }} />
              </div>
            </div>
          );
        })}
        <p className="text-[#9C9285] text-[10px] pt-1">{total} sensors total</p>
      </div>
    </div>
  );
}
