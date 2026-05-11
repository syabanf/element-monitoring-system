"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface DataPoint { label: string; value: number; value2?: number }
interface TrendChartProps {
  data: DataPoint[];
  color?: string;
  color2?: string;
  label?: string;
  label2?: string;
  height?: number;
}

export function TrendChart({
  data, color = "#B8901A", color2, label = "Value", label2, height = 200,
}: TrendChartProps) {
  const id1 = color.replace("#", "");
  const id2 = color2?.replace("#", "");
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 5, right: 8, left: -8, bottom: 0 }}>
        <defs>
          <linearGradient id={`g-${id1}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.18} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
          {color2 && id2 && (
            <linearGradient id={`g-${id2}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color2} stopOpacity={0.12} />
              <stop offset="100%" stopColor={color2} stopOpacity={0} />
            </linearGradient>
          )}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#EDE8E0" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: "#9C9285", fontSize: 10 }}
          axisLine={{ stroke: "#E5DDD0" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#9C9285", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          width={36}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E5DDD0",
            borderRadius: "10px",
            color: "#1C1714",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            fontSize: 12,
          }}
          labelStyle={{ color: "#5C5248", fontWeight: 600 }}
          itemStyle={{ color: "#1C1714" }}
        />
        <Area
          type="monotone"
          dataKey="value"
          name={label}
          stroke={color}
          fill={`url(#g-${id1})`}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: color, stroke: "#fff", strokeWidth: 2 }}
        />
        {color2 && label2 && id2 && (
          <Area
            type="monotone"
            dataKey="value2"
            name={label2}
            stroke={color2}
            fill={`url(#g-${id2})`}
            strokeWidth={1.5}
            dot={false}
            strokeDasharray="4 3"
            activeDot={{ r: 3, fill: color2, stroke: "#fff", strokeWidth: 2 }}
          />
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
}
