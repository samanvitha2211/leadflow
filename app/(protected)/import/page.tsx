"use client";

import { useState } from "react";
import { DropZone } from "./components/DropZone";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { CheckCircle2, XCircle, FileSpreadsheet, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";

export default function ImportPage() {
  const [isUploading, setIsUploading] = useState(false);
  const [importResult, setImportResult] = useState<{
    total: number;
    imported: number;
    failed: number;
    failedRows: Record<string, unknown>[];
  } | null>(null);

  const handleFileSelect = async (file: File) => {
    setIsUploading(true);
    setImportResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/import", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to process CSV");
      }

      setImportResult({
        total: result.total,
        imported: result.imported,
        failed: result.failed,
        failedRows: result.failedRows || [],
      });

      if (result.failed > 0) {
        toast.warning(`Import complete with ${result.failed} failures`);
      } else {
        toast.success("Import successful!", {
          description: "All leads are now being classified by AI.",
        });
      }
    } catch (error: unknown) {
      toast.error("Import failed", {
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Import Leads
        </h1>
        <p className="text-slate-400 mt-2 text-lg">
          Upload a CSV file to bulk import leads. Our AI engine will process them all in the background.
        </p>
      </div>

      {!importResult && !isUploading && (
        <div className="space-y-8">
          <DropZone onFileSelect={handleFileSelect} isUploading={isUploading} />
          
          <div className="glass-panel p-6 rounded-2xl">
            <h3 className="text-lg font-semibold text-white mb-4">CSV Format Requirements</h3>
            <p className="text-slate-400 text-sm mb-4">
              Your CSV file must include the following columns (headers are required). Extra columns will be ignored.
            </p>
            <div className="bg-black/30 rounded-lg p-4 font-mono text-sm text-primary-foreground/80 overflow-x-auto border border-white/5">
              name,message<br/>
              &quot;John Doe&quot;,&quot;I am interested in your enterprise plan...&quot;<br/>
              &quot;Acme Corp&quot;,&quot;We need a custom integration for our CRM.&quot;
            </div>
          </div>
        </div>
      )}

      {isUploading && (
        <div className="glass-panel p-16 rounded-3xl flex flex-col items-center justify-center text-center">
          <LoadingSpinner size={48} className="text-primary mb-6" />
          <h2 className="text-2xl font-semibold text-white mb-2">Importing & Analyzing...</h2>
          <p className="text-slate-400">Please wait while we process your CSV file.</p>
        </div>
      )}

      {importResult && !isUploading && (
        <div className="glass-panel p-8 rounded-3xl relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-[60px] pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="text-center mb-8 relative z-10">
            <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Import Complete!</h2>
            <p className="text-slate-400">
              Your leads have been saved and sent to the AI Classification Engine.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 relative z-10">
            <div className="bg-black/20 border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
              <FileSpreadsheet className="w-8 h-8 text-slate-400 mb-2" />
              <div className="text-3xl font-bold text-white mb-1">{importResult.total}</div>
              <div className="text-sm text-slate-400 uppercase tracking-wider font-medium">Rows Processed</div>
            </div>
            <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
              <CheckCircle2 className="w-8 h-8 text-green-400 mb-2" />
              <div className="text-3xl font-bold text-green-400 mb-1">{importResult.imported}</div>
              <div className="text-sm text-green-400/80 uppercase tracking-wider font-medium">Leads Imported</div>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
              <XCircle className="w-8 h-8 text-red-400 mb-2" />
              <div className="text-3xl font-bold text-red-400 mb-1">{importResult.failed}</div>
              <div className="text-sm text-red-400/80 uppercase tracking-wider font-medium">Failed Rows</div>
            </div>
          </div>

          <div className="flex justify-center gap-4 relative z-10">
            <Button
              variant="outline"
              className="border-white/20 bg-transparent text-white hover:bg-white/10"
              onClick={() => setImportResult(null)}
            >
              Import Another File
            </Button>
            <Link href="/dashboard">
              <Button className="btn-primary">
                Go to Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
