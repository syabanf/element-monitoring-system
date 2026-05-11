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

export function PillarStatusCard({
  pillar, icon, status, primaryMetric, primaryValue, secondaryMetrics, color, href,
}: PillarStatusCardProps) {
  const statusConfig = {
    NORMAL:   { color: "#166534", bg: "#F0FDF4", border: "#BBF7D0", dot: "#22C55E", label: "Normal" },
    WARNING:  { color: "#B45309", bg: "#FFFBEB", border: "#FDE68A", dot: "#F59E0B", label: "Warning" },
    CRITICAL: { color: "#B91C1C", bg: "#FEF2F2", border: "#FECACA", dot: "#EF4444", label: "Critical" },
    OFFLINE:  { color: "#6B7280", bg: "#F9FAFB", border: "#E5E7EB", dot: "#9CA3AF", label: "Offline" },
  }[status];

  const inner = (
    <div className="bg-white border border-[#D9E2F0] rounded-xl p-5 space-y-4 hover:shadow-md hover:border-[#C6D0E8] transition-all h-full relative overflow-hidden">
      {/* Left accent strip */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
        style={{ backgroundColor: color }}
      />

      <div className="pl-2">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${color}18`, color }}
            >
              {icon}
            </div>
            <span className="text-[#0D1B35] font-semibold text-sm">{pillar}</span>
          </div>
          <span
            className="text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider flex items-center gap-1"
            style={{ backgroundColor: statusConfig.bg, color: statusConfig.color, border: `1px solid ${statusConfig.border}` }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full inline-block"
              style={{ backgroundColor: statusConfig.dot }}
            />
            {statusConfig.label}
          </span>
        </div>

        {/* Primary metric */}
        <div className="mt-4">
          <p className="text-[#6378A0] text-xs font-medium mb-1">{primaryMetric}</p>
          <p className="text-[#0D1B35] text-xl font-bold tracking-tight">{primaryValue}</p>
        </div>

        {/* Secondary metrics */}
        {secondaryMetrics && (
          <div className="grid grid-cols-2 gap-3 pt-3 mt-3 border-t border-[#E4EAF5]">
            {secondaryMetrics.map((m) => (
              <div key={m.label}>
                <p className="text-[#6378A0] text-[10px] font-medium uppercase tracking-wider">{m.label}</p>
                <p className="text-[#0D1B35] text-sm font-semibold mt-0.5">{m.value}</p>
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
