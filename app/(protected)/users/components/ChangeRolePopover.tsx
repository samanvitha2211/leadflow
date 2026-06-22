"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
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

interface ChangeRolePopoverProps {
  userId: string;
  currentRole: string;
  userName: string;
  isSelf: boolean;
  onSuccess: () => void;
}

export function ChangeRolePopover({ userId, currentRole, userName, isSelf, onSuccess }: ChangeRolePopoverProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newRole, setNewRole] = useState(currentRole);

  const handleUpdate = async () => {
    if (newRole === currentRole) {
      setOpen(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update role");
      }

      toast.success(`Updated ${userName}'s role to ${newRole}`);
      setOpen(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
          disabled={isSelf}
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium border h-8 px-3 text-slate-300 hover:text-white hover:bg-white/10 bg-white/5 border-white/10 data-disabled:pointer-events-none data-disabled:opacity-50"
      >
        Change Role
      </PopoverTrigger>
      <PopoverContent className="w-72 bg-[#0B0F19] border-white/10 p-4 shadow-2xl glass-panel" align="end">
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-white">Change Role</h4>
            <p className="text-sm text-slate-400">Update role for {userName}</p>
          </div>
          
          <Select value={newRole} onValueChange={(val: string | null) => val && setNewRole(val)}>
            <SelectTrigger className="bg-white/5 border-white/10 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#0B0F19] border-white/10 text-slate-300">
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>

          {newRole === "admin" && newRole !== currentRole && (
            <div className="flex items-start gap-2 text-amber-400 bg-amber-400/10 p-2.5 rounded-lg border border-amber-400/20 text-xs">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <p>Admins have full access to User Management and platform settings.</p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setOpen(false)}
              className="text-slate-400 hover:text-white"
            >
              Cancel
            </Button>
            <Button 
              size="sm" 
              disabled={loading || newRole === currentRole}
              onClick={handleUpdate}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              {loading ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : "Save"}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
