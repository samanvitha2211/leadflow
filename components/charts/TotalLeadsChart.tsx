"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";

interface TotalLeadsChartProps {
  data: { date: string; fullDate: string; leads: number }[];
}

export function TotalLeadsChart({ data }: TotalLeadsChartProps) {
  if (!data || data.length === 0) {
    return <div className="h-full flex items-center justify-center text-slate-500">No data available</div>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis 
          dataKey="date" 
          stroke="rgba(255,255,255,0.3)" 
          fontSize={12} 
          tickLine={false} 
          axisLine={false} 
          minTickGap={30}
        />
        <YAxis 
          stroke="rgba(255,255,255,0.3)" 
          fontSize={12} 
          tickLine={false} 
          axisLine={false} 
          allowDecimals={false}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: "rgba(11, 15, 25, 0.9)", 
            borderColor: "rgba(255,255,255,0.1)",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.5)"
          }} 
          itemStyle={{ color: "#8B5CF6" }}
          labelStyle={{ color: "#9CA3AF", marginBottom: "4px" }}
        />
        <Line 
          type="monotone" 
          dataKey="leads" 
          stroke="#8B5CF6" 
          strokeWidth={3} 
          dot={false} 
          activeDot={{ r: 6, fill: "#8B5CF6", stroke: "#0B0F19", strokeWidth: 2 }}
          animationDuration={1500}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
