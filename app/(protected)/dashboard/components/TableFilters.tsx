"use client";

import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type FilterState = {
  search: string;
  status: string;
  priority: string;
  category: string;
  source: string;
};

interface TableFiltersProps {
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: string) => void;
  onClearFilters: () => void;
}

export function TableFilters({ filters, onFilterChange, onClearFilters }: TableFiltersProps) {
  const hasActiveFilters = Object.values(filters).some(val => val !== "");

  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Global Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <Input
            placeholder="Search leads by name or content..."
            value={filters.search}
            onChange={(e) => onFilterChange("search", e.target.value)}
            className="pl-10 pr-10 h-11 bg-white/5 border-white/10 text-white rounded-xl focus-visible:ring-primary w-full"
          />
          {filters.search && (
            <button 
              onClick={() => onFilterChange("search", "")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Select value={filters.status} onValueChange={(val: string | null) => onFilterChange("status", val === "all" ? "" : val || "")}>
          <SelectTrigger className="w-[140px] bg-white/5 border-white/10 text-white rounded-lg h-9">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-[#0B0F19] border-white/10 text-slate-300">
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.priority} onValueChange={(val: string | null) => onFilterChange("priority", val === "all" ? "" : val || "")}>
          <SelectTrigger className="w-[140px] bg-white/5 border-white/10 text-white rounded-lg h-9">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent className="bg-[#0B0F19] border-white/10 text-slate-300">
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="hot">Hot</SelectItem>
            <SelectItem value="warm">Warm</SelectItem>
            <SelectItem value="cold">Cold</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.category} onValueChange={(val: string | null) => onFilterChange("category", val === "all" ? "" : val || "")}>
          <SelectTrigger className="w-[150px] bg-white/5 border-white/10 text-white rounded-lg h-9">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent className="bg-[#0B0F19] border-white/10 text-slate-300">
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="sales">Sales</SelectItem>
            <SelectItem value="support">Support</SelectItem>
            <SelectItem value="billing">Billing</SelectItem>
            <SelectItem value="partnership">Partnership</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.source} onValueChange={(val: string | null) => onFilterChange("source", val === "all" ? "" : val || "")}>
          <SelectTrigger className="w-[130px] bg-white/5 border-white/10 text-white rounded-lg h-9">
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent className="bg-[#0B0F19] border-white/10 text-slate-300">
            <SelectItem value="all">All Sources</SelectItem>
            <SelectItem value="manual">Manual</SelectItem>
            <SelectItem value="csv">CSV</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClearFilters}
            className="text-slate-400 hover:text-white h-9 px-3"
          >
            Clear Filters
          </Button>
        )}
      </div>
    </div>
  );
}
