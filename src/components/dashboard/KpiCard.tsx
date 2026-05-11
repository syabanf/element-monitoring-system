interface KpiCardProps {
  title: string;
  value: string | number;
  unit?: string;
  trend?: number; // % change
  status?: "ok" | "warning" | "danger" | "info";
  icon?: React.ReactNode;
  subtitle?: string;
}

export function KpiCard({ title, value, unit, trend, status = "ok", icon, subtitle }: KpiCardProps) {
  const statusColor = {
    ok: "#22c55e",
    warning: "#f59e0b",
    danger: "#ef4444",
    info: "#3b82f6",
  }[status];

  return (
    <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-5 space-y-3 hover:border-[#3a3a3a] transition-colors">
      <div className="flex items-center justify-between">
        <p className="text-[#888888] text-xs font-medium uppercase tracking-wider">{title}</p>
        {icon && <div className="text-[#888888]">{icon}</div>}
      </div>
      <div className="flex items-end gap-2">
        <span className="text-white text-2xl font-bold leading-none">{typeof value === 'number' ? value.toLocaleString() : value}</span>
        {unit && <span className="text-[#888888] text-sm pb-0.5">{unit}</span>}
      </div>
      <div className="flex items-center justify-between">
        {subtitle && <p className="text-[#888888] text-xs">{subtitle}</p>}
        {trend !== undefined && (
          <span className={`text-xs font-medium ${trend >= 0 ? 'text-[#ef4444]' : 'text-[#22c55e]'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
        {status !== "ok" && (
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: statusColor }} />
            <span className="text-xs" style={{ color: statusColor }}>{status.toUpperCase()}</span>
          </div>
        )}
      </div>
    </div>
  );
}
