"use client";

import { useEffect, useState, useCallback, use } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, MessageSquare, Bot } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { motion } from "framer-motion";

interface UserLeadDetail {
  id: string;
  name: string;
  created_at: string;
  status: string;
  raw_text: string;
  suggested_reply?: string | null;
}

export default function UserDashboardDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [lead, setLead] = useState<UserLeadDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchLead = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/leads/${id}`);
      if (res.ok) {
        const data = await res.json();
        setLead(data.lead);
      }
    } catch (err) {
      console.error("Failed to fetch lead", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchLead();
  }, [fetchLead]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto w-full space-y-6">
        <Skeleton className="h-10 w-32 bg-white/10" />
        <Skeleton className="h-[400px] rounded-2xl bg-white/5" />
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="max-w-4xl mx-auto w-full h-[60vh] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-white mb-4">Inquiry Not Found</h2>
        <Link href="/user-dashboard" className="text-primary hover:underline">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto w-full">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/user-dashboard" className="text-slate-400 hover:text-white transition-colors flex items-center gap-1 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
          <ChevronLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to My Inquiries</span>
        </Link>
      </div>

      <div className="glass-panel p-8 rounded-3xl border border-white/10 relative overflow-hidden">
        {/* Decorative backgrounds */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[60px] pointer-events-none -translate-y-1/2 translate-x-1/2" />
        
        <div className="flex justify-between items-start mb-8 border-b border-white/10 pb-6">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight mb-2">Inquiry Details</h1>
            <p className="text-slate-400 text-sm">
              Submitted on {format(new Date(lead.created_at), "MMMM d, yyyy 'at' h:mm a")}
            </p>
          </div>
          <Badge variant="outline" className="px-3 py-1 text-sm bg-black/40">
            {lead.status === "new" ? "Under Review" : lead.status === "in_progress" ? "In Progress" : "Resolved"}
          </Badge>
        </div>

        <div className="space-y-8">
          {/* Original Message */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="w-5 h-5 text-slate-400" />
              <h3 className="text-lg font-semibold text-white">Your Message</h3>
            </div>
            <div className="bg-[#0B0F19] rounded-2xl p-6 border border-white/5">
              <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">
                {lead.raw_text}
              </p>
            </div>
          </div>

          {/* Reply */}
          {lead.suggested_reply && (lead.status === "in_progress" || lead.status === "closed") && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                  <Bot className="w-3.5 h-3.5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-white">Response from LeadFlow Team</h3>
              </div>
              <div className="bg-primary/5 rounded-2xl p-6 border border-primary/20 relative">
                <p className="text-slate-200 whitespace-pre-wrap leading-relaxed relative z-10">
                  {lead.suggested_reply}
                </p>
              </div>
            </motion.div>
          )}

          {lead.status === "new" && (
            <div className="bg-white/5 rounded-2xl p-6 border border-white/5 text-center">
              <p className="text-slate-400">Our team is currently reviewing your inquiry. We will get back to you shortly.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
