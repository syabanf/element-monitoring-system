interface KpiCardProps {
  title: string;
  value: string | number;
  unit?: string;
  trend?: number;
  status?: "ok" | "warning" | "danger" | "info";
  icon?: React.ReactNode;
  subtitle?: string;
}

const STATUS = {
  ok:      { text: "#16A34A", bg: "rgba(22,163,74,0.10)",  dot: "#22C55E", label: "Normal",  bar: "#22C55E" },
  warning: { text: "#D97706", bg: "rgba(217,119,6,0.10)",  dot: "#F59E0B", label: "Warning", bar: "#F59E0B" },
  danger:  { text: "#DC2626", bg: "rgba(220,38,38,0.10)",  dot: "#EF4444", label: "Alert",   bar: "#EF4444" },
  info:    { text: "#2563EB", bg: "rgba(37,99,235,0.10)",  dot: "#3B82F6", label: "Info",    bar: "#3B82F6" },
};

export function KpiCard({ title, value, unit, trend, status = "ok", icon, subtitle }: KpiCardProps) {
  const s = STATUS[status];

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5 transition-all duration-200 cursor-default"
      style={{
        background: "#FFFFFF",
        boxShadow: "0 1px 3px rgba(13,27,53,0.05), 0 4px 16px rgba(13,27,53,0.06)",
        border: "1px solid rgba(13,27,53,0.06)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px rgba(13,27,53,0.08), 0 8px 28px rgba(13,27,53,0.10)";
        (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 3px rgba(13,27,53,0.05), 0 4px 16px rgba(13,27,53,0.06)";
        (e.currentTarget as HTMLElement).style.transform = "";
      }}
    >
      {/* Top color bar */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl"
        style={{ background: `linear-gradient(90deg, ${s.bar} 0%, ${s.bar}66 100%)` }}
      />

      <div className="flex items-start justify-between mb-3">
        <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "#98A8C0" }}>
          {title}
        </p>
        {icon && (
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: s.bg, color: s.text }}
          >
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-end gap-1.5 mb-3">
        <span className="text-3xl font-black tracking-tight" style={{ color: "#0D1B35", lineHeight: 1 }}>
          {typeof value === "number" ? value.toLocaleString() : value}
        </span>
        {unit && <span className="text-sm font-semibold pb-0.5" style={{ color: "#6378A0" }}>{unit}</span>}
      </div>

      <div
        className="flex items-center justify-between pt-2.5"
        style={{ borderTop: "1px solid rgba(13,27,53,0.06)" }}
      >
        {subtitle && <p className="text-xs" style={{ color: "#98A8C0" }}>{subtitle}</p>}
        <div className="flex items-center gap-2 ml-auto">
          {trend !== undefined && (
            <span
              className="text-[11px] font-bold px-2 py-0.5 rounded-lg"
              style={
                trend >= 0
                  ? { color: "#DC2626", backgroundColor: "rgba(220,38,38,0.08)" }
                  : { color: "#16A34A", backgroundColor: "rgba(22,163,74,0.08)" }
              }
            >
              {trend >= 0 ? "+" : ""}{trend}%
            </span>
          )}
          {status !== "ok" && (
            <span
              className="text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest"
              style={{ color: s.text, backgroundColor: s.bg }}
            >
              {s.label}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
