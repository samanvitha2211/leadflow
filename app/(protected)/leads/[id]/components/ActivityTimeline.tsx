"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { 
  Bot, 
  Plus, 
  TrendingUp, 
  Tag, 
  MessageSquare, 
  UserCheck, 
  RefreshCw, 
  CheckCircle,
  Clock
} from "lucide-react";
import { motion } from "framer-motion";

interface ActivityTimelineProps {
  leadId: string;
}

const getActionIcon = (action: string) => {
  switch (action) {
    case "Lead Created": return <Plus className="w-4 h-4 text-emerald-400" />;
    case "AI Classified": return <Bot className="w-4 h-4 text-cyan-400" />;
    case "Priority Changed": return <TrendingUp className="w-4 h-4 text-[#F59E0B]" />;
    case "Category Changed": return <Tag className="w-4 h-4 text-[#8B5CF6]" />;
    case "Reply Updated": return <MessageSquare className="w-4 h-4 text-blue-400" />;
    case "Assigned User Changed": return <UserCheck className="w-4 h-4 text-indigo-400" />;
    case "Status Updated": return <RefreshCw className="w-4 h-4 text-blue-400" />;
    case "Lead Closed": return <CheckCircle className="w-4 h-4 text-emerald-400" />;
    case "Lead Reopened": return <RefreshCw className="w-4 h-4 text-orange-400" />;
    default: return <Clock className="w-4 h-4 text-slate-400" />;
  }
};

const getIconBg = (action: string) => {
  switch (action) {
    case "Lead Created": return "bg-emerald-500/10";
    case "AI Classified": return "bg-cyan-500/10";
    case "Priority Changed": return "bg-[#F59E0B]/10";
    case "Category Changed": return "bg-[#8B5CF6]/10";
    case "Reply Updated": return "bg-blue-500/10";
    case "Assigned User Changed": return "bg-indigo-500/10";
    case "Status Updated": return "bg-blue-500/10";
    case "Lead Closed": return "bg-emerald-500/10";
    case "Lead Reopened": return "bg-orange-500/10";
    default: return "bg-white/10";
  }
};

export function ActivityTimeline({ leadId }: ActivityTimelineProps) {
  const [activities, setActivities] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivity = async () => {
    try {
      const res = await fetch(`/api/leads/${leadId}/activity`);
      const data = await res.json();
      if (data.activities) {
        setActivities(data.activities);
      }
    } catch (err) {
      console.error("Failed to fetch activity", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchActivity();
    const interval = setInterval(fetchActivity, 5000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leadId]);

  if (loading) {
    return <div className="h-32 flex items-center justify-center text-slate-500">Loading timeline...</div>;
  }

  if (activities.length === 0) {
    return <div className="h-32 flex items-center justify-center text-slate-500">No activity recorded yet.</div>;
  }

  return (
    <div className="glass-panel p-8 rounded-2xl w-full">
      <h3 className="text-xl font-bold text-white mb-8 tracking-tight">Activity Timeline</h3>
      
      <div className="relative border-l-2 border-white/10 ml-4 space-y-8 pb-4">
        {activities.map((activity, index) => {
          const isAI = activity.action === "AI Classified";
          const actorName = isAI ? "System AI" : ((activity.users as { name?: string })?.name || "System");

          return (
            <motion.div 
              key={activity.id as string}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="relative pl-8"
            >
              {/* Node Icon */}
              <div className={`absolute -left-[17px] top-1 w-8 h-8 rounded-full border-4 border-[#0B0F19] ${getIconBg(activity.action as string)} flex items-center justify-center`}>
                {getActionIcon(activity.action as string)}
              </div>

              {/* Node Content */}
              <div className="bg-white/5 border border-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{actorName as string}</span>
                    <span className="text-slate-400 text-sm">performed</span>
                    <span className="text-sm font-bold text-slate-200">{activity.action as string}</span>
                  </div>
                  <div 
                    className="text-xs text-slate-500 mt-1 sm:mt-0" 
                    title={new Date(activity.created_at as string).toLocaleString()}
                  >
                    {formatDistanceToNow(new Date(activity.created_at as string), { addSuffix: true })}
                  </div>
                </div>
                
                {Boolean(activity.details) && (
                  <div className="mt-2 text-sm text-slate-300 font-mono bg-black/20 p-2 rounded-lg inline-block">
                    {activity.details as string}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
