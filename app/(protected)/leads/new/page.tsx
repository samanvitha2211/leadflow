"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Sparkles, ArrowLeft } from "lucide-react";
import Link from "next/link";

const leadSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type LeadValues = z.infer<typeof leadSchema>;

export default function NewLeadPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LeadValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      name: "",
      message: "",
    },
  });

  const onSubmit = async (data: LeadValues) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create lead");
      }

      toast.success("Lead created!", {
        description: "AI is now classifying the lead...",
      });
      
      // The prompt says: "On success: Redirect to the new lead's detail page /leads/[id]."
      // But we haven't built Phase 5 (/leads/[id]) yet, so we'll redirect to dashboard for now 
      // or to the leads page. Let's redirect to dashboard since it exists.
      router.push("/dashboard");
      router.refresh();
    } catch (error: unknown) {
      toast.error("Error creating lead", {
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto w-full">
      <div className="mb-8">
        <Link 
          href="/dashboard" 
          className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          Create New Lead
        </h1>
        <p className="text-slate-400 mt-2">
          Manually enter a lead. Our AI engine will automatically classify it in the background.
        </p>
      </div>

      <div className="glass-panel p-8 rounded-2xl relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[60px] pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 relative z-10">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Lead Name / Company
            </label>
            <input
              type="text"
              {...register("name")}
              placeholder="e.g. Acme Corp"
              className="w-full px-4 py-3 rounded-xl input-glass text-base"
              disabled={isLoading}
            />
            {errors.name && (
              <p className="mt-1.5 text-sm text-red-400">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Lead Message / Inquiry
            </label>
            <textarea
              {...register("message")}
              rows={5}
              placeholder="Paste the email, form submission, or raw text here..."
              className="w-full px-4 py-3 rounded-xl input-glass text-base resize-none"
              disabled={isLoading}
            />
            {errors.message && (
              <p className="mt-1.5 text-sm text-red-400">
                {errors.message.message}
              </p>
            )}
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              className="w-full h-12 text-base font-medium btn-primary rounded-xl"
              disabled={isLoading}
            >
              {isLoading ? (
                <LoadingSpinner size={20} className="mr-2" />
              ) : (
                <Sparkles className="w-5 h-5 mr-2" />
              )}
              {isLoading ? "Creating & Analyzing..." : "Create Lead"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
