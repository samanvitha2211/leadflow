"use client";

import { useEffect, useState, useCallback } from "react";
import { format } from "date-fns";
import { Shield, User } from "lucide-react";
import { InviteUserModal } from "./InviteUserModal";
import { ChangeRolePopover } from "./ChangeRolePopover";
import { Skeleton } from "@/components/ui/skeleton";

interface UsersClientProps {
  currentUserId: string;
}

export function UsersClient({ currentUserId }: UsersClientProps) {
  const [users, setUsers] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      if (data.users) {
        setUsers(data.users);
      }
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <div className="w-full max-w-6xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">User Management</h1>
          <p className="text-slate-400">Manage your team's access and roles across the platform.</p>
        </div>
        <InviteUserModal onSuccess={fetchUsers} />
      </div>

      <div className="bg-[#0B0F19] border border-white/10 rounded-2xl overflow-hidden glass-panel">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-white/5 text-slate-400 font-medium border-b border-white/10">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-32 bg-white/5" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-48 bg-white/5" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-6 w-20 rounded-full bg-white/5" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-24 bg-white/5" /></td>
                    <td className="px-6 py-4 flex justify-end"><Skeleton className="h-8 w-24 bg-white/5" /></td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isSelf = u.id === currentUserId;
                  const isAdmin = u.role === "admin";
                  
                  return (
                    <tr key={u.id as string} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${isAdmin ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'}`}>
                            {(u.name as string)?.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-white">
                            {u.name as string}
                            {isSelf && <span className="ml-2 text-xs bg-white/10 text-slate-300 px-2 py-0.5 rounded-full">You</span>}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-300">
                        {u.email as string}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${isAdmin ? 'bg-primary/10 text-primary border-primary/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                          {isAdmin ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                          <span className="capitalize">{u.role as string}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-400">
                        {u.created_at ? format(new Date(u.created_at as string), "MMM d, yyyy") : "Unknown"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <ChangeRolePopover 
                          userId={u.id as string}
                          currentRole={u.role as string}
                          userName={u.name as string}
                          isSelf={isSelf}
                          onSuccess={fetchUsers}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
