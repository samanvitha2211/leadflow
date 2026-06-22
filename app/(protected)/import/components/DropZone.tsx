"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { Upload, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface DropZoneProps {
  onFileSelect: (file: File) => void;
  isUploading: boolean;
}

export function DropZone({ onFileSelect, isUploading }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      validateAndSetFile(file);
    }
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    // Check if it's a CSV
    if (file.type === "text/csv" || file.name.endsWith(".csv")) {
      setSelectedFile(file);
    } else {
      alert("Please upload a valid .csv file.");
    }
  };

  const handleUploadClick = () => {
    if (selectedFile) {
      onFileSelect(selectedFile);
    }
  };

  return (
    <div className="w-full">
      <div
        className={cn(
          "relative w-full rounded-3xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center p-12 text-center",
          isDragging
            ? "border-primary bg-primary/10 shadow-[0_0_30px_rgba(139,92,246,0.3)] scale-[1.02]"
            : "border-white/20 hover:border-primary/50 hover:bg-white/5 glass-panel",
          isUploading ? "opacity-50 pointer-events-none" : ""
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !selectedFile && fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".csv,text/csv"
          onChange={handleFileInput}
        />

        {!selectedFile ? (
          <>
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <Upload
                className={cn(
                  "w-10 h-10 transition-colors",
                  isDragging ? "text-primary animate-bounce" : "text-slate-400"
                )}
              />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-3">
              Upload your Leads CSV
            </h3>
            <p className="text-slate-400 max-w-md mx-auto text-lg">
              Drag & drop your file here, or{" "}
              <span className="text-primary hover:underline cursor-pointer">
                click to browse
              </span>
              .
            </p>
          </>
        ) : (
          <div className="flex flex-col items-center w-full max-w-md mx-auto">
            <div className="w-20 h-20 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(139,92,246,0.2)]">
              <FileText className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2 truncate w-full px-4">
              {selectedFile.name}
            </h3>
            <p className="text-slate-400 mb-8">
              {(selectedFile.size / 1024).toFixed(2)} KB
            </p>
            
            <div className="flex gap-4 w-full">
              <Button
                variant="outline"
                className="flex-1 bg-transparent border-white/20 hover:bg-white/10 text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 btn-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  handleUploadClick();
                }}
              >
                Import Leads
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
