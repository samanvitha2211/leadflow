"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Activity,
  ListTodo,
  LogOut,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface SidebarProps {
  userRole?: string;
  userName?: string;
}

export function Sidebar({ userRole, userName }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  let links = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "New Lead", href: "/leads/new", icon: ListTodo },
    { name: "Activity Log", href: "/activity", icon: Activity },
  ];

  if (userRole === "admin") {
    links.push({ name: "Users", href: "/users", icon: Users });
  } else if (userRole === "user") {
    links = [
      { name: "My Inquiries", href: "/user-dashboard", icon: LayoutDashboard },
    ];
  }

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <aside className="w-64 glass-panel border-r border-white/10 hidden md:flex flex-col h-full bg-black/20">
      <div className="p-6">
        <Link href={userRole === "user" ? "/user-dashboard" : "/dashboard"} className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-ai flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <span className="gradient-text font-bold text-xl tracking-tight">LeadFlow</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 py-2 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                isActive
                  ? "bg-primary/20 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] border border-primary/30"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4 transition-colors",
                  isActive ? "text-primary" : "text-slate-500 group-hover:text-slate-300"
                )}
              />
              {link.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto border-t border-white/10">
        <div className="flex items-center gap-3 px-2 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 text-primary font-bold text-xs">
            {userName ? userName.charAt(0).toUpperCase() : "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{userName || "User"}</p>
            <p className="text-xs text-slate-500 capitalize">{userRole || "Manager"}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
