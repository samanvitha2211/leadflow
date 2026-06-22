"use client";

import { Badge } from "@/components/ui/badge";
import { Bot, Copy, Check, Send, Mail } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";

import { LeadData } from "./LeadDetailsClient";

interface AIAnalysisCardProps {
  lead: LeadData;
}

export function AIAnalysisCard({ lead }: AIAnalysisCardProps) {
  const [copied, setCopied] = useState(false);
  const [isSending, setIsSending] = useState(false);

  if (!lead) return null;

  const isPending = lead.ai_category === null && lead.status === "new";

  const handleCopy = async () => {
    if (lead.suggested_reply) {
      await navigator.clipboard.writeText(lead.suggested_reply);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePostReply = async () => {
    setIsSending(true);
    try {
      const res = await fetch(`/api/leads/${lead.id}/send-reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply_text: lead.suggested_reply }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to post reply");
      
      toast.success("Reply Posted", { description: "The reply is now visible on the user's tracking page." });
    } catch (err: unknown) {
      toast.error("Error", { description: err instanceof Error ? err.message : "Failed to post reply." });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="relative rounded-2xl p-[2px] overflow-hidden group h-full flex flex-col">
      {/* Iridescent Animated Border */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-cyan-500 to-purple-500 bg-[length:200%_auto] animate-pulse-glow z-0" />
      
      {/* Inner Card */}
      <div className="relative bg-[#0B0F19] rounded-2xl p-6 h-full flex flex-col z-10 w-full flex-1">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center">
            <Bot className="w-5 h-5 text-cyan-400" />
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight">AI Analysis</h3>
        </div>

        <div className="flex flex-col gap-5 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
              <span className="text-xs text-slate-400 uppercase tracking-wider block mb-2">Original AI Category</span>
              {isPending ? (
                <div className="h-6 w-24 bg-white/10 animate-pulse rounded-md" />
              ) : (
                <Badge variant={(lead.ai_category || "other") as React.ComponentProps<typeof Badge>["variant"]}>{lead.ai_category || "Unclassified"}</Badge>
              )}
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
              <span className="text-xs text-slate-400 uppercase tracking-wider block mb-2">Original AI Priority</span>
              {isPending ? (
                <div className="h-6 w-20 bg-white/10 animate-pulse rounded-md" />
              ) : (
                <Badge variant={(lead.ai_priority || "cold") as React.ComponentProps<typeof Badge>["variant"]} className="font-bold">
                  {lead.ai_priority === 'hot' && '🔴 '}
                  {lead.ai_priority === 'warm' && '🟡 '}
                  {lead.ai_priority === 'cold' && '🔵 '}
                  {lead.ai_priority ? lead.ai_priority.toUpperCase() : "N/A"}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-slate-400 uppercase tracking-wider">Suggested Reply</span>
            {!isPending && (
              <div className="flex items-center gap-2">
                <button 
                  onClick={handlePostReply}
                  disabled={isSending}
                  className="text-xs flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 transition-colors p-1.5 rounded-md hover:bg-cyan-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Post this reply to the tracking page"
                >
                  {isSending ? <Send className="w-4 h-4 animate-pulse" /> : <Send className="w-4 h-4" />}
                  <span>{isSending ? "Posting..." : "Post Reply"}</span>
                </button>
                <div className="w-px h-4 bg-white/10 mx-1" />
                <button 
                  onClick={handleCopy}
                  className="text-xs flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors p-1.5 rounded-md hover:bg-white/5"
                >
                  {copied ? (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                      <Check className="w-4 h-4 text-green-400" />
                    </motion.div>
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  {copied ? <span className="text-green-400">Copied!</span> : <span>Copy</span>}
                </button>
              </div>
            )}
          </div>
          
          <div className="flex-1 bg-[#1A2235] border border-white/10 rounded-xl p-4 relative">
            <div className="absolute top-4 left-4 w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center">
              <Bot className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            {isPending ? (
              <div className="pl-10 space-y-2">
                <div className="h-4 w-3/4 bg-white/10 animate-pulse rounded" />
                <div className="h-4 w-full bg-white/10 animate-pulse rounded" />
                <div className="h-4 w-5/6 bg-white/10 animate-pulse rounded" />
                <p className="text-xs text-cyan-400 mt-4 animate-pulse">AI is analyzing this lead...</p>
              </div>
            ) : (
              <p className="text-sm text-slate-300 whitespace-pre-wrap pl-10 leading-relaxed">
                {lead.suggested_reply || "No reply generated."}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
