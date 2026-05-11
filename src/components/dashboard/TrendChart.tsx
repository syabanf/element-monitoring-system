"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface DataPoint {
  label: string;
  value: number;
  value2?: number;
}

interface TrendChartProps {
  data: DataPoint[];
  color?: string;
  color2?: string;
  label?: string;
  label2?: string;
  height?: number;
}

export function TrendChart({ data, color = "#e11d48", color2, label = "Value", label2, height = 200 }: TrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <defs>
          <linearGradient id={`grad-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
          {color2 && (
            <linearGradient id={`grad-${color2.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color2} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color2} stopOpacity={0} />
            </linearGradient>
          )}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
        <XAxis dataKey="label" tick={{ fill: "#888888", fontSize: 11 }} axisLine={{ stroke: "#2a2a2a" }} tickLine={false} />
        <YAxis tick={{ fill: "#888888", fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
        <Tooltip
          contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "8px", color: "#fff" }}
          labelStyle={{ color: "#888888" }}
        />
        <Area type="monotone" dataKey="value" name={label} stroke={color} fill={`url(#grad-${color.replace('#','')})`} strokeWidth={2} dot={false} />
        {color2 && label2 && (
          <Area type="monotone" dataKey="value2" name={label2} stroke={color2} fill={`url(#grad-${color2.replace('#','')})`} strokeWidth={2} dot={false} />
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
}
