"use client";

import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

import { LeadData } from "./LeadDetailsClient";

interface LeadContextCardProps {
  lead: LeadData;
}

export function LeadContextCard({ lead }: LeadContextCardProps) {
  if (!lead) return null;

  const dateStr = lead.created_at ? format(new Date(lead.created_at), "MMM d, yyyy h:mm a") : "";

  return (
    <div className="glass-panel p-6 rounded-2xl flex flex-col h-full">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">{lead.name}</h2>
          <div className="text-sm text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
            <span>Created on {dateStr}</span>
            <span>•</span>
            <span className="capitalize">{lead.source} Entry</span>
            {lead.email && (
              <>
                <span>•</span>
                <span className="text-cyan-400 font-medium">{lead.email}</span>
              </>
            )}
          </div>
        </div>
        <Badge variant={lead.source as React.ComponentProps<typeof Badge>["variant"]}>{lead.source}</Badge>
      </div>

      <div className="flex-1 mt-4">
        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">Raw Message</h3>
        <div className="bg-[#0B0F19] rounded-xl p-5 border border-white/5 h-full min-h-[250px]">
          <p className="text-slate-300 font-mono text-sm leading-relaxed whitespace-pre-wrap">
            {lead.raw_text}
          </p>
        </div>
      </div>
    </div>
  );
}
