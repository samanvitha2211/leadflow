"use client";

import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export function TopNavbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Simple title generation from pathname
  const getPageTitle = () => {
    if (pathname.startsWith("/dashboard")) return "Dashboard";
    if (pathname.startsWith("/leads/new")) return "New Lead";
    if (pathname.startsWith("/leads/")) return "Lead Details";
    if (pathname.startsWith("/leads")) return "Leads";
    if (pathname.startsWith("/import")) return "Import CSV";
    if (pathname.startsWith("/activity")) return "Activity Log";
    if (pathname.startsWith("/users")) return "User Management";
    if (pathname.startsWith("/settings")) return "Settings";
    return "LeadFlow";
  };

  return (
    <header className="h-16 glass-panel border-b border-white/10 flex items-center justify-between px-6 bg-black/10 backdrop-blur-md sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold text-white tracking-tight">
          {getPageTitle()}
        </h1>
      </div>
      
      <div className="flex items-center gap-4">
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        )}
      </div>
    </header>
  );
}
