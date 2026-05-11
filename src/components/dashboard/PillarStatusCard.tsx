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

export function PillarStatusCard({ pillar, icon, status, primaryMetric, primaryValue, secondaryMetrics, color, href }: PillarStatusCardProps) {
  const statusConfig = {
    NORMAL: { color: "#22c55e", bg: "#22c55e15", label: "NORMAL" },
    WARNING: { color: "#f59e0b", bg: "#f59e0b15", label: "WARNING" },
    CRITICAL: { color: "#ef4444", bg: "#ef444415", label: "CRITICAL" },
    OFFLINE: { color: "#888888", bg: "#88888815", label: "OFFLINE" },
  }[status];

  const inner = (
    <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-5 space-y-4 hover:border-[#3a3a3a] transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}20`, color }}>
            {icon}
          </div>
          <span className="text-white font-medium text-sm">{pillar}</span>
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: statusConfig.bg, color: statusConfig.color }}>
          {statusConfig.label}
        </span>
      </div>
      <div>
        <p className="text-[#888888] text-xs">{primaryMetric}</p>
        <p className="text-white text-xl font-bold">{primaryValue}</p>
      </div>
      {secondaryMetrics && (
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#2a2a2a]">
          {secondaryMetrics.map((m) => (
            <div key={m.label}>
              <p className="text-[#888888] text-xs">{m.label}</p>
              <p className="text-white text-sm font-medium">{m.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (href) {
    return <a href={href} className="block">{inner}</a>;
  }

  return inner;
}
