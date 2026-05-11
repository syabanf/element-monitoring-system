interface KpiCardProps {
  title: string;
  value: string | number;
  unit?: string;
  trend?: number;
  status?: "ok" | "warning" | "danger" | "info";
  icon?: React.ReactNode;
  subtitle?: string;
}

export function KpiCard({ title, value, unit, trend, status = "ok", icon, subtitle }: KpiCardProps) {
  const statusConfig = {
    ok:      { color: "#166534", bg: "#F0FDF4", dot: "#22C55E", label: "Normal" },
    warning: { color: "#B45309", bg: "#FFFBEB", dot: "#F59E0B", label: "Warning" },
    danger:  { color: "#B91C1C", bg: "#FEF2F2", dot: "#EF4444", label: "Alert" },
    info:    { color: "#1E5FA8", bg: "#EFF6FF", dot: "#3B82F6", label: "Info" },
  }[status];

  const accentBar = {
    ok:      "#22C55E",
    warning: "#F59E0B",
    danger:  "#EF4444",
    info:    "#3B82F6",
  }[status];

  return (
    <div className="bg-white border border-[#E5DDD0] rounded-xl p-5 space-y-3 hover:shadow-md hover:border-[#D4C8B8] transition-all group relative overflow-hidden">
      {/* Gold top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl"
        style={{ backgroundColor: accentBar }}
      />

      <div className="flex items-start justify-between">
        <p className="text-[#9C9285] text-xs font-semibold uppercase tracking-wider leading-tight pr-2">{title}</p>
        {icon && (
          <div className="w-8 h-8 rounded-lg bg-[#FEF7E6] flex items-center justify-center text-[#B8901A] flex-shrink-0">
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-end gap-1.5">
        <span className="text-[#1C1714] text-2xl font-bold leading-none tracking-tight">
          {typeof value === "number" ? value.toLocaleString() : value}
        </span>
        {unit && <span className="text-[#9C9285] text-sm pb-0.5 font-medium">{unit}</span>}
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-[#EDE8E0]">
        {subtitle && <p className="text-[#9C9285] text-xs">{subtitle}</p>}
        <div className="flex items-center gap-2 ml-auto">
          {trend !== undefined && (
            <span
              className="text-xs font-semibold px-1.5 py-0.5 rounded"
              style={{
                color: trend >= 0 ? "#B91C1C" : "#166534",
                backgroundColor: trend >= 0 ? "#FEF2F2" : "#F0FDF4",
              }}
            >
              {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}%
            </span>
          )}
          {status !== "ok" && (
            <span
              className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
              style={{ color: statusConfig.color, backgroundColor: statusConfig.bg }}
            >
              {statusConfig.label}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
