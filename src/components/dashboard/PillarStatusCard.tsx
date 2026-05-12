"use client";

interface PillarStatusCardProps {
  pillar: string;
  icon: React.ReactNode;
  status: "NORMAL" | "WARNING" | "CRITICAL" | "OFFLINE";
  primaryMetric: string;
  primaryValue: string;
  secondaryMetrics?: { label: string; value: string }[];
  color: string;
  href?: string;
}

const STATUS_CFG = {
  NORMAL:   { text: "#16A34A", bg: "rgba(22,163,74,0.10)",   dot: "#22C55E", label: "Normal" },
  WARNING:  { text: "#D97706", bg: "rgba(217,119,6,0.10)",   dot: "#F59E0B", label: "Warning" },
  CRITICAL: { text: "#DC2626", bg: "rgba(220,38,38,0.10)",   dot: "#EF4444", label: "Critical" },
  OFFLINE:  { text: "#6B7280", bg: "rgba(107,114,128,0.10)", dot: "#9CA3AF", label: "Offline" },
};

export function PillarStatusCard({
  pillar, icon, status, primaryMetric, primaryValue, secondaryMetrics, color, href,
}: PillarStatusCardProps) {
  const s = STATUS_CFG[status];

  const inner = (
    <div
      className="relative overflow-hidden rounded-2xl p-4 h-full transition-all duration-200 group"
      style={{
        background: "#FFFFFF",
        boxShadow: "0 1px 3px rgba(13,27,53,0.05), 0 4px 16px rgba(13,27,53,0.06)",
        border: "1px solid rgba(13,27,53,0.06)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = `0 2px 8px rgba(13,27,53,0.08), 0 8px 28px rgba(13,27,53,0.10)`;
        (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 3px rgba(13,27,53,0.05), 0 4px 16px rgba(13,27,53,0.06)";
        (e.currentTarget as HTMLElement).style.transform = "";
      }}
    >
      {/* Left accent strip */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl"
        style={{ background: `linear-gradient(180deg, ${color} 0%, ${color}66 100%)` }}
      />

      <div className="pl-3">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${color}18`, color }}
            >
              {icon}
            </div>
            <span className="text-[#0D1B35] font-bold text-sm">{pillar}</span>
          </div>
          <span
            className="text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest flex items-center gap-1"
            style={{ backgroundColor: s.bg, color: s.text }}
          >
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.dot }} />
            {s.label}
          </span>
        </div>

        {/* Primary metric */}
        <div className="mb-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: "#98A8C0" }}>
            {primaryMetric}
          </p>
          <p className="text-[#0D1B35] text-xl font-black tracking-tight">{primaryValue}</p>
        </div>

        {/* Secondary metrics */}
        {secondaryMetrics && (
          <div
            className="grid grid-cols-2 gap-2 pt-2.5"
            style={{ borderTop: "1px solid rgba(13,27,53,0.06)" }}
          >
            {secondaryMetrics.map((m) => (
              <div key={m.label}>
                <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: "#98A8C0" }}>{m.label}</p>
                <p className="text-[#0D1B35] text-sm font-bold mt-0.5">{m.value}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  if (href) return <a href={href} className="block h-full">{inner}</a>;
  return inner;
}
