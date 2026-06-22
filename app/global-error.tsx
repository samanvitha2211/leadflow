"use client";

import { AlertOctagon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-4">
          <div className="glass-panel max-w-md w-full p-8 rounded-2xl flex flex-col items-center text-center border border-red-500/20 bg-red-500/5">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
              <AlertOctagon className="w-8 h-8 text-red-500" />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2">Something went wrong</h2>
            <p className="text-slate-400 mb-8">
              A critical error occurred in the application. Our team has been notified.
            </p>
            
            <div className="flex gap-4 w-full">
              <Button 
                variant="outline" 
                className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10"
                onClick={() => window.location.href = '/dashboard'}
              >
                Go Home
              </Button>
              <Button 
                className="w-full bg-red-500 hover:bg-red-600 text-white"
                onClick={() => reset()}
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
