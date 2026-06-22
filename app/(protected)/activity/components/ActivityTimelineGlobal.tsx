"use client";

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
  Clock,
  RotateCcw
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

interface ActivityTimelineGlobalProps {
  activities: Record<string, unknown>[];
}

const getActionIcon = (action: string) => {
  switch (action) {
    case "Lead Created": return <Plus className="w-4 h-4 text-emerald-400" />;
    case "AI Classified": return <Bot className="w-4 h-4 text-cyan-400" />;
    case "Priority Changed": return <TrendingUp className="w-4 h-4 text-[#F59E0B]" />;
    case "Category Changed": return <Tag className="w-4 h-4 text-[#8B5CF6]" />;
    case "Reply Updated": return <MessageSquare className="w-4 h-4 text-slate-400" />;
    case "Assigned User Changed": return <UserCheck className="w-4 h-4 text-purple-400" />;
    case "Status Updated": return <RefreshCw className="w-4 h-4 text-[#F59E0B]" />;
    case "Lead Closed": return <CheckCircle className="w-4 h-4 text-emerald-400" />;
    case "Lead Reopened": return <RotateCcw className="w-4 h-4 text-rose-400" />;
    default: return <Clock className="w-4 h-4 text-slate-400" />;
  }
};

const getIconBg = (action: string) => {
  switch (action) {
    case "Lead Created": return "bg-emerald-500/10";
    case "AI Classified": return "bg-cyan-500/10";
    case "Priority Changed": return "bg-[#F59E0B]/10";
    case "Category Changed": return "bg-[#8B5CF6]/10";
    case "Reply Updated": return "bg-slate-500/10";
    case "Assigned User Changed": return "bg-purple-500/10";
    case "Status Updated": return "bg-[#F59E0B]/10";
    case "Lead Closed": return "bg-emerald-500/10";
    case "Lead Reopened": return "bg-rose-500/10";
    default: return "bg-white/10";
  }
};

export function ActivityTimelineGlobal({ activities }: ActivityTimelineGlobalProps) {
  if (activities.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-slate-500 glass-panel rounded-2xl">
        <Clock className="w-12 h-12 mb-4 opacity-20" />
        <p>No activity logged yet, or no activity matches your filters.</p>
      </div>
    );
  }

  return (
    <div className="w-full relative">
      {/* The main vertical line */}
      <div className="absolute left-[39px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-purple-500 via-cyan-500 to-purple-500 opacity-50 rounded-full" />

      <div className="space-y-6 relative z-10">
        {activities.map((activity, index) => {
          const isAI = activity.action === "AI Classified";
          
          return (
            <motion.div 
              key={activity.id as string}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: (index % 10) * 0.05 }}
              className="relative pl-24 pr-4"
            >
              {/* Node Icon */}
              <div className={`absolute left-6 top-1 w-10 h-10 rounded-full border-4 border-[#0B0F19] ${getIconBg(activity.action as string)} flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.5)]`}>
                {getActionIcon(activity.action as string)}
              </div>

              {/* Node Card */}
              <div className="bg-white/5 border border-white/5 rounded-2xl p-5 hover:bg-white/10 transition-colors shadow-lg backdrop-blur-sm">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {isAI ? (
                        <div className="flex items-center gap-1.5 text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded-full text-xs">
                          <Bot className="w-3 h-3" />
                          System AI
                        </div>
                      ) : (
                        <span className="font-semibold text-white">{activity.user_name as string}</span>
                      )}
                      
                      <span className="text-slate-400 text-sm">performed</span>
                      <span className="text-sm font-bold text-slate-200">{activity.action as string}</span>
                      <span className="text-slate-400 text-sm">on</span>
                      
                      <Link 
                        href={`/leads/${activity.lead_id}`}
                        className="text-primary hover:text-primary/80 font-semibold text-sm transition-colors hover:underline"
                      >
                        Lead: {activity.lead_name as string}
                      </Link>
                    </div>

                    {Boolean(activity.details) && (
                      <div className="mt-3 text-sm text-slate-300 font-mono bg-black/30 p-2.5 rounded-xl inline-block border border-white/5">
                        {activity.details as string}
                      </div>
                    )}
                  </div>

                  <div 
                    className="text-xs font-medium text-slate-500 shrink-0 mt-1 sm:mt-0" 
                    title={new Date(activity.created_at as string).toLocaleString()}
                  >
                    {formatDistanceToNow(new Date(activity.created_at as string), { addSuffix: true })}
                  </div>

                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
