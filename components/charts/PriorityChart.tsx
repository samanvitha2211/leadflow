"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface PriorityChartProps {
  data: { name: string; value: number }[];
}

const COLORS: Record<string, string> = {
  hot: "#FF4D4D",  // Neon Coral
  warm: "#F59E0B", // Amber Gold
  cold: "#38BDF8", // Ice Blue
};

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Record<string, unknown>[] }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0B0F19]/90 border border-white/10 rounded-lg shadow-xl px-3 py-2 text-sm">
        <span className="capitalize text-slate-300 mr-2">{(payload[0] as any).name}:</span>
        <span className="font-bold" style={{ color: (payload[0] as any).payload.fill }}>{(payload[0] as any).value}</span>
      </div>
    );
  }
  return null;
};

export function PriorityChart({ data }: PriorityChartProps) {
  if (!data || data.length === 0) {
    return <div className="h-full flex items-center justify-center text-slate-500">No data available</div>;
  }

  // Calculate total for center label
  const total = data.reduce((sum, item) => sum + item.value, 0);

  // Map colors
  const mappedData = data.map(item => ({
    ...item,
    fill: COLORS[item.name.toLowerCase()] || "#6B7280"
  }));

  return (
    <div className="relative w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={mappedData}
            cx="50%"
            cy="45%"
            innerRadius="65%"
            outerRadius="85%"
            paddingAngle={4}
            dataKey="value"
            stroke="none"
            animationDuration={1500}
            animationBegin={200}
          >
            {mappedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            iconType="circle"
            formatter={(value) => <span className="text-slate-300 capitalize text-xs">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
      {/* Center Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-6">
        <span className="text-3xl font-bold text-white">{total}</span>
        <span className="text-xs text-slate-400 uppercase tracking-widest">Leads</span>
      </div>
    </div>
  );
}
