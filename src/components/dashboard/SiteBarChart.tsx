"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface SiteData {
  name: string;
  assets: number;
  sensors: number;
  alerts: number;
}

interface SiteBarChartProps {
  data: SiteData[];
}

const SITE_COLORS = ["#B8901A", "#1E5FA8", "#166534", "#7C3AED"];

export function SiteBarChart({ data }: SiteBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }} barGap={4}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E4EAF5" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fill: "#6378A0", fontSize: 10 }}
          axisLine={{ stroke: "#D9E2F0" }}
          tickLine={false}
          tickFormatter={(v: string) => v.length > 10 ? v.slice(0, 10) + "…" : v}
        />
        <YAxis
          tick={{ fill: "#6378A0", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          width={28}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #D9E2F0",
            borderRadius: "10px",
            fontSize: 12,
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          }}
          labelStyle={{ color: "#3D5280", fontWeight: 600 }}
          cursor={{ fill: "#F2F5FB" }}
        />
        <Bar dataKey="assets" name="Assets" radius={[4, 4, 0, 0]} maxBarSize={32}>
          {data.map((_, i) => (
            <Cell key={i} fill={SITE_COLORS[i % SITE_COLORS.length]} fillOpacity={0.85} />
          ))}
        </Bar>
        <Bar dataKey="sensors" name="Sensors" radius={[4, 4, 0, 0]} maxBarSize={32} fill="#D9E2F0" />
      </BarChart>
    </ResponsiveContainer>
  );
}
