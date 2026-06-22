"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12 min-h-[400px]">
      <div className="glass-panel p-8 rounded-2xl flex flex-col items-center text-center max-w-md w-full border border-amber-500/20 bg-amber-500/5">
        <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
          <AlertTriangle className="w-6 h-6 text-amber-500" />
        </div>
        
        <h2 className="text-xl font-bold text-white mb-2">Something went wrong!</h2>
        <p className="text-slate-400 text-sm mb-6">
          An error occurred while loading this section.
        </p>
        
        <Button 
          className="bg-amber-500 hover:bg-amber-600 text-white w-full rounded-xl"
          onClick={() => reset()}
        >
          Try Again
        </Button>
      </div>
    </div>
  );
}
