"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, PenLine, ShieldAlert } from "lucide-react";

const overrideSchema = z.object({
  current_category: z.string().min(1, "Category is required"),
  current_priority: z.string().min(1, "Priority is required"),
  suggested_reply: z.string().optional(),
  force_ai_override: z.boolean().optional(),
  ai_category: z.string().optional(),
  ai_priority: z.string().optional(),
});

type OverrideValues = z.infer<typeof overrideSchema>;

import { LeadData } from "./LeadDetailsClient";

interface HumanOverrideFormProps {
  lead: LeadData;
  onUpdate: (lead: LeadData) => void;
  isAdmin?: boolean;
}

export function HumanOverrideForm({ lead, onUpdate, isAdmin = false }: HumanOverrideFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<OverrideValues>({
    resolver: zodResolver(overrideSchema),
    defaultValues: {
      current_category: lead.current_category || lead.ai_category || "",
      current_priority: lead.current_priority || lead.ai_priority || "",
      suggested_reply: lead.suggested_reply || "",
      force_ai_override: false,
      ai_category: lead.ai_category || "",
      ai_priority: lead.ai_priority || "",
    },
  });

  const forceAI = form.watch("force_ai_override");

  const hasCategoryOverride = lead.current_category && lead.current_category !== lead.ai_category;
  const hasPriorityOverride = lead.current_priority && lead.current_priority !== lead.ai_priority;

  const onSubmit = async (data: OverrideValues) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to update");

      const result = await res.json();
      toast.success("Overrides saved successfully");
      onUpdate(result.lead);
    } catch (err) {
      toast.error("Failed to save overrides");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-panel p-6 rounded-2xl mt-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <PenLine className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight">Human Override</h3>
          <p className="text-xs text-slate-400">Modify the AI&apos;s classification if needed</p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {isAdmin && (
          <div className="flex flex-row items-center justify-between rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 mb-4">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-500" />
                <h4 className="text-sm font-semibold text-white">Force Override AI Values</h4>
              </div>
              <p className="text-xs text-amber-500/80">
                Danger: This permanently rewrites the AI's original classification record.
              </p>
            </div>
            <Switch
              checked={forceAI}
              onCheckedChange={(checked) => form.setValue("force_ai_override", checked)}
            />
          </div>
        )}

        {forceAI ? (
          <div className="grid grid-cols-2 gap-4 border border-amber-500/30 p-4 rounded-xl bg-black/20">
            <div className="space-y-2">
              <label className="text-sm font-medium text-amber-400">AI Category (Permanent)</label>
              <Select 
                value={form.watch("ai_category")} 
                onValueChange={(val: string | null) => form.setValue("ai_category", val || "")}
              >
                <SelectTrigger className="bg-white/5 border-amber-500/30 text-white h-11">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent className="bg-[#0B0F19] border-white/10 text-slate-300">
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                  <SelectItem value="billing">Billing</SelectItem>
                  <SelectItem value="partnership">Partnership</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-amber-400">AI Priority (Permanent)</label>
              <Select 
                value={form.watch("ai_priority")} 
                onValueChange={(val: string | null) => form.setValue("ai_priority", val || "")}
              >
                <SelectTrigger className="bg-white/5 border-amber-500/30 text-white h-11">
                  <SelectValue placeholder="Select Priority" />
                </SelectTrigger>
                <SelectContent className="bg-[#0B0F19] border-white/10 text-slate-300">
                  <SelectItem value="hot">Hot</SelectItem>
                  <SelectItem value="warm">Warm</SelectItem>
                  <SelectItem value="cold">Cold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex justify-between">
                <span>Current Category</span>
                {hasCategoryOverride && <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">AI: {lead.ai_category}</span>}
              </label>
              <Select 
                value={form.watch("current_category")} 
                onValueChange={(val: string | null) => form.setValue("current_category", val || "")}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white h-11">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent className="bg-[#0B0F19] border-white/10 text-slate-300">
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                  <SelectItem value="billing">Billing</SelectItem>
                  <SelectItem value="partnership">Partnership</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex justify-between">
                <span>Current Priority</span>
                {hasPriorityOverride && <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">AI: {lead.ai_priority}</span>}
              </label>
              <Select 
                value={form.watch("current_priority")} 
                onValueChange={(val: string | null) => form.setValue("current_priority", val || "")}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white h-11">
                  <SelectValue placeholder="Select Priority" />
                </SelectTrigger>
                <SelectContent className="bg-[#0B0F19] border-white/10 text-slate-300">
                  <SelectItem value="hot">Hot</SelectItem>
                  <SelectItem value="warm">Warm</SelectItem>
                  <SelectItem value="cold">Cold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300 flex justify-between">
            <span>Edit Suggested Reply</span>
          </label>
          <Textarea 
            {...form.register("suggested_reply")}
            className="bg-white/5 border-white/10 text-slate-200 min-h-[120px] resize-y rounded-xl p-4"
            placeholder="Edit the AI&apos;s reply here..."
          />
        </div>

        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full btn-primary h-11 text-base font-semibold"
        >
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
          Save Overrides
        </Button>
      </form>
    </div>
  );
}
