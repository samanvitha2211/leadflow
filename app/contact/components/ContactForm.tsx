"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Send, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactValues = z.infer<typeof contactSchema>;

export function ContactForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [submittedLeadId, setSubmittedLeadId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  const onSubmit = async (data: ContactValues) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/leads/public", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to submit message");
      }

      setSubmittedLeadId(result.leadId);
      reset();
    } catch (error: unknown) {
      toast.error("Error submitting message", {
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (submittedLeadId) {
    const trackingUrl = typeof window !== "undefined" ? `${window.location.origin}/status/${submittedLeadId}` : `/status/${submittedLeadId}`;
    
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center text-center py-10"
      >
        <div className="w-16 h-16 bg-cyan-500/20 text-cyan-400 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-3">Message Sent!</h3>
        <p className="text-slate-400 mb-6 max-w-md">
          We have received your message. Please bookmark your unique tracking link to view our reply:
        </p>
        
        <div className="bg-[#0B0F19] border border-white/10 rounded-xl p-4 w-full max-w-md mb-8 flex items-center justify-between">
          <span className="text-sm text-cyan-400 truncate mr-4">{trackingUrl}</span>
          <button 
            onClick={() => {
              navigator.clipboard.writeText(trackingUrl);
              toast.success("Link copied!");
            }}
            className="text-xs font-medium text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
          >
            Copy Link
          </button>
        </div>

        <Button 
          variant="outline" 
          className="border-white/10 text-white"
          onClick={() => setSubmittedLeadId(null)}
        >
          Send another message
        </Button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 relative z-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Your Name
          </label>
          <input
            type="text"
            {...register("name")}
            placeholder="John Doe"
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
            Email Address
          </label>
          <input
            type="email"
            {...register("email")}
            placeholder="john@example.com"
            className="w-full px-4 py-3 rounded-xl input-glass text-base"
            disabled={isLoading}
          />
          {errors.email && (
            <p className="mt-1.5 text-sm text-red-400">
              {errors.email.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          How can we help?
        </label>
        <textarea
          {...register("message")}
          rows={6}
          placeholder="Tell us about your project, needs, or questions..."
          className="w-full px-4 py-3 rounded-xl input-glass text-base resize-none"
          disabled={isLoading}
        />
        {errors.message && (
          <p className="mt-1.5 text-sm text-red-400">
            {errors.message.message}
          </p>
        )}
      </div>

      <div className="pt-4">
        <Button
          type="submit"
          className="w-full h-14 text-lg font-medium btn-primary rounded-xl transition-all"
          disabled={isLoading}
        >
          {isLoading ? (
            <LoadingSpinner size={24} className="mr-3" />
          ) : (
            <Send className="w-5 h-5 mr-3" />
          )}
          {isLoading ? "Sending..." : "Send Message"}
        </Button>
      </div>
    </form>
  );
}
