"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RefreshCw } from "lucide-react";

import { LeadData } from "./LeadDetailsClient";

interface StatusAssignmentControlsProps {
  lead: LeadData;
  onUpdate: () => void;
}

interface User {
  id: string;
  name: string;
  role: string;
}

export function StatusAssignmentControls({ lead, onUpdate }: StatusAssignmentControlsProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch("/api/users");
        const data = await res.json();
        if (data.users) {
          setUsers(data.users);
        }
      } catch (err) {
        console.error("Failed to fetch users", err);
      }
    }
    fetchUsers();
  }, []);

  const handleStatusChange = async (newStatus: string | null) => {
    if (!newStatus || newStatus === lead.status) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/leads/${lead.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      toast.success("Status updated");
      onUpdate();
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const handleAssignChange = async (userId: string | null) => {
    const newAssignedTo = userId === "unassign" || !userId ? null : userId;
    if (newAssignedTo === lead.assigned_to) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/leads/${lead.id}/assign`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assigned_to: newAssignedTo }),
      });
      if (!res.ok) throw new Error("Failed to assign user");
      toast.success(newAssignedTo ? "Lead assigned" : "Lead unassigned");
      onUpdate();
    } catch {
      toast.error("Failed to assign user");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="glass-panel p-6 rounded-2xl mt-6 space-y-5">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
          <RefreshCw className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight">Workflow Controls</h3>
          <p className="text-xs text-slate-400">Manage status and assignment</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Lead Status</label>
          <Select value={lead.status} onValueChange={handleStatusChange} disabled={updating}>
            <SelectTrigger className="bg-white/5 border-white/10 text-white h-11 capitalize">
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent className="bg-[#0B0F19] border-white/10 text-slate-300">
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300 flex justify-between">
            <span>Assigned Owner</span>
            {lead.assigned_owner && <span className="text-xs text-blue-400">{lead.assigned_owner.name}</span>}
          </label>
          <Select 
            value={lead.assigned_to || "unassign"} 
            onValueChange={handleAssignChange} 
            disabled={updating}
          >
            <SelectTrigger className="bg-white/5 border-white/10 text-white h-11">
              <SelectValue placeholder="Select User" />
            </SelectTrigger>
            <SelectContent className="bg-[#0B0F19] border-white/10 text-slate-300">
              <SelectItem value="unassign" className="text-slate-500 italic">Unassigned</SelectItem>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name} ({user.role})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
