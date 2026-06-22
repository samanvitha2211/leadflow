"use client";

import { BarChart, Bar, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Cell } from "recharts";

interface CategoryChartProps {
  data: { name: string; value: number }[];
}

// Our AI/Brand gradient colors mapped to distinct hexes for the bars
const COLORS = [
  "#8B5CF6", // Electric Violet
  "#6366F1", // Indigo
  "#3B82F6", // Blue
  "#0EA5E9", // Light Blue
  "#22D3EE", // Cyan
];

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Record<string, unknown>[] }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0B0F19]/90 border border-white/10 rounded-lg shadow-xl px-3 py-2 text-sm">
        <span className="capitalize text-slate-300 mr-2">{(payload[0] as any).payload.name}:</span>
        <span className="font-bold text-white">{(payload[0] as any).value}</span>
      </div>
    );
  }
  return null;
};

export function CategoryChart({ data }: CategoryChartProps) {
  if (!data || data.length === 0) {
    return <div className="h-full flex items-center justify-center text-slate-500">No data available</div>;
  }

  // Sort data by value descending for better presentation
  const sortedData = [...data].sort((a, b) => b.value - a.value);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={sortedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis 
          dataKey="name" 
          stroke="rgba(255,255,255,0.3)" 
          fontSize={11} 
          tickLine={false} 
          axisLine={false}
          tickFormatter={(val) => val.substring(0, 3).toUpperCase()}
        />
        <YAxis 
          stroke="rgba(255,255,255,0.3)" 
          fontSize={12} 
          tickLine={false} 
          axisLine={false} 
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
        <Bar 
          dataKey="value" 
          radius={[4, 4, 0, 0]} 
          animationDuration={1500}
          animationBegin={400}
        >
          {sortedData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
