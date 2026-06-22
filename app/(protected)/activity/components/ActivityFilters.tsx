"use client";

import { useEffect, useState } from "react";
import { format, subDays } from "date-fns";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type ActivityFilterState = {
  action_type: string;
  user_id: string;
  date_from: Date | undefined;
  date_to: Date | undefined;
};

interface ActivityFiltersProps {
  filters: ActivityFilterState;
  onFilterChange: (filters: Partial<ActivityFilterState>) => void;
  onClearFilters: () => void;
}

const ACTION_TYPES = [
  "Lead Created",
  "AI Classified",
  "Priority Changed",
  "Category Changed",
  "Reply Updated",
  "Assigned User Changed",
  "Status Updated",
  "Lead Closed",
  "Lead Reopened",
];

export function ActivityFilters({ filters, onFilterChange, onClearFilters }: ActivityFiltersProps) {
  const [users, setUsers] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch("/api/users");
        const data = await res.json();
        if (data.users) setUsers(data.users);
      } catch (err) {
        console.error("Failed to fetch users", err);
      }
    }
    fetchUsers();
  }, []);

  const hasActiveFilters = filters.action_type || filters.user_id || filters.date_from || filters.date_to;

  const handleDatePreset = (days: number) => {
    onFilterChange({
      date_from: subDays(new Date(), days),
      date_to: new Date(),
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-3 mb-8 bg-[#0B0F19] border border-white/10 rounded-2xl p-4 shadow-xl relative z-20">
      
      <Select 
        value={filters.action_type || "all"} 
        onValueChange={(val: string | null) => onFilterChange({ action_type: val === "all" ? "" : val || "" })}
      >
        <SelectTrigger className="w-[200px] bg-white/5 border-white/10 text-white rounded-xl h-10">
          <SelectValue placeholder="All Actions" />
        </SelectTrigger>
        <SelectContent className="bg-[#0B0F19] border-white/10 text-slate-300">
          <SelectItem value="all">All Actions</SelectItem>
          {ACTION_TYPES.map((action) => (
            <SelectItem key={action} value={action}>{action}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select 
        value={filters.user_id || "all"} 
        onValueChange={(val: string | null) => onFilterChange({ user_id: val === "all" ? "" : val || "" })}
      >
        <SelectTrigger className="w-[200px] bg-white/5 border-white/10 text-white rounded-xl h-10">
          <SelectValue placeholder="All Users" />
        </SelectTrigger>
        <SelectContent className="bg-[#0B0F19] border-white/10 text-slate-300">
          <SelectItem value="all">All Users</SelectItem>
          <SelectItem value="system_ai" className="font-semibold text-cyan-400">System AI</SelectItem>
          {users.map((user) => (
            <SelectItem key={user.id as string} value={user.id as string}>{user.name as string}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Popover>
        <PopoverTrigger
          className={cn(
            "inline-flex items-center justify-start text-left font-normal bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white rounded-xl h-10 px-4 w-[260px] border text-sm transition-colors",
            (!filters.date_from && !filters.date_to) && "text-slate-500"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {filters.date_from ? (
            filters.date_to ? (
              <>
                {format(filters.date_from, "LLL dd, y")} -{" "}
                {format(filters.date_to, "LLL dd, y")}
              </>
            ) : (
              format(filters.date_from, "LLL dd, y")
            )
          ) : (
            <span>Pick a date range</span>
          )}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-[#0B0F19] border-white/10" align="start">
          <div className="flex">
            <div className="flex flex-col border-r border-white/10 p-2 gap-1 w-32">
              <Button variant="ghost" className="justify-start text-xs text-slate-300 hover:bg-white/5" onClick={() => handleDatePreset(0)}>Today</Button>
              <Button variant="ghost" className="justify-start text-xs text-slate-300 hover:bg-white/5" onClick={() => handleDatePreset(7)}>Last 7 Days</Button>
              <Button variant="ghost" className="justify-start text-xs text-slate-300 hover:bg-white/5" onClick={() => handleDatePreset(30)}>Last 30 Days</Button>
              <Button variant="ghost" className="justify-start text-xs text-slate-300 hover:bg-white/5" onClick={() => onFilterChange({ date_from: undefined, date_to: undefined })}>All Time</Button>
            </div>
            <div className="p-2">
              <Calendar
                mode="range"
                defaultMonth={filters.date_from}
                selected={{ from: filters.date_from, to: filters.date_to }}
                onSelect={(range: any) => onFilterChange({ date_from: range?.from, date_to: range?.to })}
                numberOfMonths={2}
                className="text-slate-300"
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {hasActiveFilters && (
        <Button 
          variant="ghost" 
          onClick={onClearFilters}
          className="text-slate-400 hover:text-white rounded-xl h-10 ml-auto"
        >
          <X className="w-4 h-4 mr-2" />
          Clear Filters
        </Button>
      )}

    </div>
  );
}
