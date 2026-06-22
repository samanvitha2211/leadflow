import { createClient as createAdminClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, MailOpen, Activity } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ticket Status | LeadFlow",
};

export default async function StatusPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;

  // We use the admin client because leads table has RLS restricting to authenticated users.
  // This tracking page acts as a secure unguessable URL to view public status.
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: lead, error } = await supabaseAdmin
    .from("leads")
    .select("name, raw_text, status, manager_reply, created_at, updated_at")
    .eq("id", id)
    .single();

  if (error || !lead) {
    return notFound();
  }

  const isClosed = lead.status === "closed";
  const hasReply = !!lead.manager_reply;

  return (
    <div className="flex min-h-screen w-full bg-background overflow-hidden relative">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[40rem] h-[40rem] bg-cyan-500/10 rounded-full mix-blend-screen filter blur-[100px] animate-pulse-glow" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[35rem] h-[35rem] bg-purple-500/10 rounded-full mix-blend-screen filter blur-[100px]" style={{ animation: "pulseGlow 5s ease-in-out infinite alternate-reverse" }} />
      </div>

      <div className="w-full max-w-3xl mx-auto flex flex-col justify-center px-6 py-20 relative z-10">
        
        <div className="mb-10 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 text-cyan-400 mx-auto flex items-center justify-center mb-6 shadow-lg">
            <Activity className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight mb-4">
            Support Ticket Tracker
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Use this page to check the status of your inquiry and read replies from our team.
          </p>
        </div>

        <div className="glass-panel rounded-3xl overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="p-8 border-b border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Ticket #{id.split("-")[0]}</h2>
              <div className="text-sm text-slate-400">
                Submitted by <span className="text-white font-medium">{lead.name}</span> on {new Date(lead.created_at).toLocaleDateString()}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-slate-400 uppercase tracking-wider">Status:</span>
              <Badge variant={lead.status as React.ComponentProps<typeof Badge>["variant"]} className="px-3 py-1 text-sm">
                {lead.status.replace("_", " ").toUpperCase()}
              </Badge>
            </div>
          </div>

          {/* Body */}
          <div className="p-8 space-y-10">
            {/* Original Message */}
            <div className="relative pl-8">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-700 rounded-full" />
              <div className="absolute -left-2 top-0 w-5 h-5 bg-slate-800 border-2 border-slate-500 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-slate-400 rounded-full" />
              </div>
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">Your Message</h3>
              <div className="bg-[#0B0F19] rounded-xl p-5 border border-white/5">
                <p className="text-slate-300 font-mono text-sm leading-relaxed whitespace-pre-wrap">
                  {lead.raw_text}
                </p>
              </div>
            </div>

            {/* Manager Reply */}
            <div className="relative pl-8">
              <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-full ${hasReply ? "bg-cyan-500" : "bg-slate-700/50"}`} />
              <div className={`absolute -left-2 top-0 w-5 h-5 rounded-full flex items-center justify-center border-2 ${hasReply ? "bg-cyan-900 border-cyan-400" : "bg-slate-800 border-slate-600"}`}>
                {hasReply ? (
                  <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                ) : (
                  <Clock className="w-3 h-3 text-slate-400" />
                )}
              </div>
              
              <h3 className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className={hasReply ? "text-cyan-400" : "text-slate-400"}>Our Reply</span>
              </h3>
              
              {hasReply ? (
                <div className="bg-cyan-500/10 rounded-xl p-6 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
                      <MailOpen className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">LeadFlow Support Team</div>
                      <div className="text-xs text-slate-400">{new Date(lead.updated_at).toLocaleDateString()} at {new Date(lead.updated_at).toLocaleTimeString()}</div>
                    </div>
                  </div>
                  <p className="text-white text-base leading-relaxed whitespace-pre-wrap">
                    {lead.manager_reply}
                  </p>
                </div>
              ) : (
                <div className="bg-[#0B0F19]/50 rounded-xl p-8 border border-white/5 flex flex-col items-center justify-center text-center">
                  <Clock className="w-10 h-10 text-slate-500 mb-4" />
                  <h4 className="text-lg font-medium text-white mb-2">Awaiting Reply</h4>
                  <p className="text-slate-400 max-w-sm">
                    Our team is reviewing your message. Please check back later using this link.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
