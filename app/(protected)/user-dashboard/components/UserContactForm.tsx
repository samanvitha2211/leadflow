"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { Send, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const contactSchema = z.object({
  phone_number: z.string().optional(),
  company_name: z.string().optional(),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }),
});

type ContactValues = z.infer<typeof contactSchema>;

export function UserContactForm({ onSuccess }: { onSuccess: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactValues) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/leads/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to submit inquiry");
      }

      setIsSuccess(true);
      toast.success("Inquiry submitted successfully!");
      reset();
      
      // Notify parent to refresh the table
      onSuccess();
      
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (error) {
      toast.error("Failed to submit inquiry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-panel p-8 rounded-2xl border border-white/10 mb-8 relative overflow-hidden">
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-cyan-500/10 rounded-full blur-[50px] -z-10 pointer-events-none"></div>
      
      <h2 className="text-xl font-bold text-white mb-6">Submit a New Inquiry</h2>
      
      {isSuccess ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4 border border-green-500/30">
            <CheckCircle2 className="w-8 h-8 text-green-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Inquiry Received!</h3>
          <p className="text-slate-400 max-w-md">
            Our AI has processed your request and our team will get back to you shortly. You can track its status below.
          </p>
          <Button 
            variant="outline" 
            className="mt-6 border-white/10 text-white"
            onClick={() => setIsSuccess(false)}
          >
            Submit Another Inquiry
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Phone Number (Optional)</label>
              <input
                type="tel"
                {...register("phone_number")}
                placeholder="+1 (555) 000-0000"
                className="w-full px-4 py-3 rounded-xl input-glass border border-white/10 focus:border-cyan-500/50 bg-[#0B0F19]/50 text-white placeholder:text-slate-500 transition-colors"
                disabled={isSubmitting}
              />
              {errors.phone_number && (
                <p className="mt-1.5 text-sm text-red-400 font-medium">{errors.phone_number.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Company Name (Optional)</label>
              <input
                type="text"
                {...register("company_name")}
                placeholder="Acme Corp"
                className="w-full px-4 py-3 rounded-xl input-glass border border-white/10 focus:border-cyan-500/50 bg-[#0B0F19]/50 text-white placeholder:text-slate-500 transition-colors"
                disabled={isSubmitting}
              />
              {errors.company_name && (
                <p className="mt-1.5 text-sm text-red-400 font-medium">{errors.company_name.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">How can we help you? *</label>
            <textarea
              {...register("message")}
              rows={4}
              placeholder="Please describe your needs or ask a question..."
              className="w-full px-4 py-3 rounded-xl input-glass border border-white/10 focus:border-cyan-500/50 bg-[#0B0F19]/50 text-white placeholder:text-slate-500 transition-colors resize-none"
              disabled={isSubmitting}
            />
            {errors.message && (
              <p className="mt-1.5 text-sm text-red-400 font-medium">{errors.message.message}</p>
            )}
          </div>

          <div className="flex justify-end">
            <Button 
              type="submit" 
              className="h-12 px-8 text-base font-semibold btn-primary rounded-xl shadow-lg shadow-cyan-500/20" 
              disabled={isSubmitting}
            >
              {isSubmitting ? <LoadingSpinner size={20} className="mr-3" /> : <Send className="w-4 h-4 mr-2" />}
              {isSubmitting ? "Submitting..." : "Send Inquiry"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
