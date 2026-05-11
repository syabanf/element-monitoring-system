import { formatDistanceToNow } from "date-fns";

interface Alert {
  id: string;
  title: string;
  severity: string;
  status: string;
  openedAt: string | Date;
  asset: { name: string; pillar: string; site: { name: string } };
}

const severityConfig = {
  CRITICAL: { color: "#B91C1C", bg: "#FEF2F2", border: "#FECACA", dot: "#EF4444" },
  HIGH:     { color: "#B45309", bg: "#FFFBEB", border: "#FDE68A", dot: "#F59E0B" },
  MEDIUM:   { color: "#1E5FA8", bg: "#EFF6FF", border: "#BFDBFE", dot: "#3B82F6" },
  LOW:      { color: "#5C5248", bg: "#F5F3EE", border: "#E5DDD0", dot: "#9C9285" },
  INFO:     { color: "#5C5248", bg: "#F5F3EE", border: "#E5DDD0", dot: "#9C9285" },
};

export function AlertSummaryRow({ alert }: { alert: Alert }) {
  const cfg = severityConfig[alert.severity as keyof typeof severityConfig] ?? severityConfig.INFO;
  return (
    <a href={`/alerts/${alert.id}`} className="flex items-center gap-3 py-3 border-b border-[#EDE8E0] last:border-0 hover:bg-[#F5F3EE] -mx-3 px-3 rounded-lg transition-colors">
      <div className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-lg" style={{ backgroundColor: cfg.bg }}>
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cfg.dot }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[#1C1714] text-sm font-semibold truncate">{alert.title}</p>
        <p className="text-[#9C9285] text-xs mt-0.5">{alert.asset?.site?.name} · {alert.asset?.name}</p>
      </div>
      <div className="text-right flex-shrink-0 space-y-1">
        <span
          className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider block"
          style={{ color: cfg.color, backgroundColor: cfg.bg, border: `1px solid ${cfg.border}` }}
        >
          {alert.severity}
        </span>
        <p className="text-[#9C9285] text-[10px]">
          {formatDistanceToNow(new Date(alert.openedAt), { addSuffix: true })}
        </p>
      </div>
    </a>
  );
}
