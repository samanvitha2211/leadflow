"use client";

import { useEffect, useState } from "react";
import { LeadContextCard } from "./LeadContextCard";
import { AIAnalysisCard } from "./AIAnalysisCard";
import { HumanOverrideForm } from "./HumanOverrideForm";
import { StatusAssignmentControls } from "./StatusAssignmentControls";
import { ActivityTimeline } from "./ActivityTimeline";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { useCallback } from "react";

export interface LeadData {
  id: string;
  name: string;
  email?: string | null;
  source: string;
  created_at: string;
  raw_text: string;
  status: string;
  ai_category?: string | null;
  ai_priority?: string | null;
  current_category?: string | null;
  current_priority?: string | null;
  suggested_reply?: string | null;
  assigned_to?: string | null;
  assigned_owner?: { name: string; email: string } | null;
}

export function LeadDetailsClient({ id, isAdmin = false }: { id: string; isAdmin?: boolean }) {
  const [lead, setLead] = useState<LeadData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchLead = useCallback(async (isPolling = false) => {
    try {
      if (!isPolling) setLoading(true);
      const res = await fetch(`/api/leads/${id}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setLead(data.lead);
      }
    } catch (err) {
      console.error("Failed to fetch lead", err);
    } finally {
      if (!isPolling) setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    // Initial fetch
    fetchLead();
  }, [fetchLead]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    // If ai_category is null, it means AI classification is pending
    if (lead && lead.ai_category === null) {
      interval = setInterval(() => {
        fetchLead(true); // silent polling
      }, 2000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [lead, fetchLead]);

  if (loading) {
    return (
      <div className="w-full space-y-6">
        <Skeleton className="h-10 w-32 bg-white/10" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Skeleton className="h-[600px] rounded-2xl bg-white/5" />
          <Skeleton className="h-[600px] rounded-2xl bg-white/5" />
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="w-full h-[60vh] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-white mb-4">Lead Not Found</h2>
        <Link href="/dashboard" className="text-primary hover:underline">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors flex items-center gap-1 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
          <ChevronLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Dashboard</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Left Column */}
        <div className="flex flex-col gap-8">
          <LeadContextCard lead={lead} />
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6">
          <AIAnalysisCard lead={lead} />
          <HumanOverrideForm lead={lead} onUpdate={(updated) => setLead({ ...lead, ...updated })} isAdmin={isAdmin} />
          <StatusAssignmentControls lead={lead} onUpdate={fetchLead} />
        </div>
      </div>

      <ActivityTimeline leadId={id} />
    </div>
  );
}
