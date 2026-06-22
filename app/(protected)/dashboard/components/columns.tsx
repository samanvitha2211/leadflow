"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { MoreHorizontal, ArrowRight, UserCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState } from "react";

export interface Lead {
  id: string;
  name: string;
  email?: string | null;
  source: string;
  current_category: string | null;
  current_priority: string | null;
  status: string;
  created_at: string;
  assigned_owner?: { name: string } | null;
  ai_category?: string | null;
};

export type UserOption = { id: string; name: string };

export const getColumns = ({ isAdmin, users, onUpdate }: { isAdmin: boolean; users: UserOption[]; onUpdate: () => void }): ColumnDef<Lead>[] => [
  {
    accessorKey: "id",
    header: "Lead ID",
    cell: ({ row }) => <div className="font-mono text-xs text-slate-400">{row.original.id.substring(0, 8)}</div>,
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const isPendingAI = row.original.status === 'new' && !row.original.ai_category;
      return (
        <div className="flex items-center gap-2">
          {isPendingAI && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
          )}
          <div className="font-medium text-white">{row.getValue("name")}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "source",
    header: "Source",
    cell: ({ row }) => {
      const source = row.getValue("source") as string;
      return <Badge variant={source as React.ComponentProps<typeof Badge>["variant"]}>{source}</Badge>;
    },
  },
  {
    accessorKey: "current_category",
    header: "Category",
    cell: ({ row }) => {
      const category = row.original.current_category;
      return category ? <Badge variant={category as React.ComponentProps<typeof Badge>["variant"]}>{category}</Badge> : <span className="text-slate-500">-</span>;
    },
  },
  {
    accessorKey: "current_priority",
    header: "Priority",
    cell: ({ row }) => {
      const priority = row.original.current_priority;
      return priority ? (
        <Badge variant={priority as React.ComponentProps<typeof Badge>["variant"]} className="font-bold border-2">
          {priority === 'hot' && '🔴 '}
          {priority === 'warm' && '🟡 '}
          {priority === 'cold' && '🔵 '}
          {priority.toUpperCase()}
        </Badge>
      ) : <span className="text-slate-500">-</span>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const formattedStatus = status.replace("_", " ");
      return <Badge variant={status as React.ComponentProps<typeof Badge>["variant"]} className="capitalize">{formattedStatus}</Badge>;
    },
  },
  {
    accessorKey: "assigned_to",
    header: "Assigned Owner",
    cell: ({ row }) => {
      const owner = row.original.assigned_owner;
      return owner ? (
        <div className="flex items-center gap-2">
          <UserCircle2 className="w-5 h-5 text-slate-400" />
          <span className="text-sm text-slate-300">{owner.name}</span>
        </div>
      ) : (
        <span className="text-sm text-slate-500 italic">Unassigned</span>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: "Created Date",
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"));
      return <div className="text-sm text-slate-400">{format(date, "MMM d, yyyy h:mm a")}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const lead = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-md p-0 text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[160px] bg-[#0B0F19]/95 backdrop-blur-md border-white/10 text-slate-300">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />
              <Link href={`/leads/${lead.id}`} className="w-full">
                <DropdownMenuItem className="hover:bg-white/10 cursor-pointer text-white flex items-center w-full">
                  View Details
                  <ArrowRight className="ml-auto w-4 h-4" />
                </DropdownMenuItem>
              </Link>
              <StatusChangeAction lead={lead} onUpdate={onUpdate} />
            </DropdownMenuGroup>
            
            {isAdmin && (
              <DropdownMenuGroup>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuLabel className="text-xs text-slate-500">Admin Actions</DropdownMenuLabel>
                <AdminAssignAction lead={lead} users={users} onUpdate={onUpdate} />
              </DropdownMenuGroup>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

function AdminAssignAction({ lead, users, onUpdate }: { lead: Lead; users: UserOption[]; onUpdate: () => void }) {
  const [loading, setLoading] = useState(false);

  const handleAssign = async (userId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/leads/${lead.id}/assign`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assigned_to: userId }),
      });
      if (!res.ok) throw new Error("Failed to assign");
      toast.success("Lead reassigned successfully");
      onUpdate();
    } catch (err) {
      toast.error("Failed to reassign lead");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger className="hover:bg-white/10 cursor-pointer text-amber-400 focus:text-amber-400 focus:bg-amber-400/10">
        Reassign Owner
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent className="w-[200px] bg-[#0B0F19] border-white/10 p-2 glass-panel">
        <h4 className="text-xs font-semibold text-slate-400 mb-2 px-2">Select User</h4>
        <div className="space-y-1">
          {users.map(user => (
            <DropdownMenuItem
              key={user.id}
              className="w-full justify-start text-sm text-slate-300 hover:text-white hover:bg-white/5 h-8 cursor-pointer"
              onClick={() => handleAssign(user.id)}
              disabled={loading}
            >
              {user.name}
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}

function StatusChangeAction({ lead, onUpdate }: { lead: Lead; onUpdate: () => void }) {
  const [loading, setLoading] = useState(false);

  const handleStatus = async (status: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/leads/${lead.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      toast.success("Status updated successfully");
      onUpdate();
    } catch (err) {
      toast.error("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger className="hover:bg-white/10 cursor-pointer">
        Change Status
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent className="w-[160px] bg-[#0B0F19] border-white/10 p-2 glass-panel">
        <h4 className="text-xs font-semibold text-slate-400 mb-2 px-2">Set Status</h4>
        <div className="space-y-1">
          <DropdownMenuItem
            className="w-full justify-start text-sm text-slate-300 hover:text-white hover:bg-white/5 h-8 cursor-pointer"
            onClick={() => handleStatus("new")}
            disabled={loading || lead.status === "new"}
          >
            New
          </DropdownMenuItem>
          <DropdownMenuItem
            className="w-full justify-start text-sm text-slate-300 hover:text-white hover:bg-white/5 h-8 cursor-pointer"
            onClick={() => handleStatus("in_progress")}
            disabled={loading || lead.status === "in_progress"}
          >
            In Progress
          </DropdownMenuItem>
          <DropdownMenuItem
            className="w-full justify-start text-sm text-slate-300 hover:text-white hover:bg-white/5 h-8 cursor-pointer text-green-400 focus:text-green-300"
            onClick={() => handleStatus("closed")}
            disabled={loading || lead.status === "closed"}
          >
            Closed
          </DropdownMenuItem>
        </div>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}
