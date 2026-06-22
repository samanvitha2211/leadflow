"use client";

import { DashboardMetrics } from "./components/DashboardMetrics";
import { LeadsTable } from "./components/LeadsTable";

export default function DashboardPage() {
  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Dashboard
        </h1>
        <p className="text-slate-400 mt-2 text-lg">
          Overview of your pipeline and leads at a glance.
        </p>
      </div>

      <DashboardMetrics />
      <LeadsTable />
    </div>
  );
}
