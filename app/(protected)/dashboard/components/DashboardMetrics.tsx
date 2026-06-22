"use client";

import { useEffect, useState } from "react";
import { motion, Variants } from "framer-motion";
import { TotalLeadsChart } from "@/components/charts/TotalLeadsChart";
import { PriorityChart } from "@/components/charts/PriorityChart";
import { CategoryChart } from "@/components/charts/CategoryChart";
import { TrendingUp, Activity, PieChart as PieChartIcon } from "lucide-react";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

interface StatsData {
  totalCount: number;
  overTime: { date: string; fullDate: string; leads: number }[];
  byPriority: { name: string; value: number }[];
  byCategory: { name: string; value: number }[];
}

export function DashboardMetrics() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/leads/stats");
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error("Failed to fetch stats", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-panel h-64 rounded-2xl animate-pulse bg-white/5" />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
    >
      {/* Card 1: Total Leads Over Time */}
      <motion.div variants={cardVariants} className="glass-panel p-6 rounded-2xl flex flex-col h-64">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Total Leads (30d)</h3>
            <div className="text-2xl font-bold text-white mt-1">{stats.totalCount}</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
        </div>
        <div className="flex-1 -ml-4">
          <TotalLeadsChart data={stats.overTime} />
        </div>
      </motion.div>

      {/* Card 2: Priority Distribution */}
      <motion.div variants={cardVariants} className="glass-panel p-6 rounded-2xl flex flex-col h-64">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Priority Distribution</h3>
          <div className="w-10 h-10 rounded-full bg-[#F59E0B]/10 flex items-center justify-center">
            <Activity className="w-5 h-5 text-[#F59E0B]" />
          </div>
        </div>
        <div className="flex-1">
          <PriorityChart data={stats.byPriority} />
        </div>
      </motion.div>

      {/* Card 3: Category Distribution */}
      <motion.div variants={cardVariants} className="glass-panel p-6 rounded-2xl flex flex-col h-64">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Leads by Category</h3>
          <div className="w-10 h-10 rounded-full bg-[#22D3EE]/10 flex items-center justify-center">
            <PieChartIcon className="w-5 h-5 text-[#22D3EE]" />
          </div>
        </div>
        <div className="flex-1 -ml-4">
          <CategoryChart data={stats.byCategory} />
        </div>
      </motion.div>
    </motion.div>
  );
}
