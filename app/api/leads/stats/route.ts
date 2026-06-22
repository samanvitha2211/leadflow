import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // Fetch up to the last 10,000 leads for aggregation
    // In a production app with millions of leads, you'd use a Supabase RPC / SQL View.
    const { data: leads, error } = await supabase
      .from("leads")
      .select("id, created_at, current_category, current_priority, status")
      .order("created_at", { ascending: false })
      .limit(10000);

    if (error) {
      console.error("[GET Stats] Error fetching leads:", error);
      return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
    }

    if (!leads) {
      return NextResponse.json({ totalLeads: [], byPriority: [], byCategory: [] });
    }

    // --- Aggregation Logic ---

    // 1. Leads by Priority
    const priorityCounts: Record<string, number> = { hot: 0, warm: 0, cold: 0 };
    
    // 2. Leads by Category
    const categoryCounts: Record<string, number> = { 
      sales: 0, support: 0, billing: 0, partnership: 0, other: 0 
    };

    // 3. Leads over time (Last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const timeSeriesMap: Record<string, number> = {};

    leads.forEach((lead) => {
      // Priority
      if (lead.current_priority) {
        priorityCounts[lead.current_priority] = (priorityCounts[lead.current_priority] || 0) + 1;
      }
      
      // Category
      if (lead.current_category) {
        categoryCounts[lead.current_category] = (categoryCounts[lead.current_category] || 0) + 1;
      }

      // Time Series
      const createdAt = new Date(lead.created_at);
      if (createdAt >= thirtyDaysAgo) {
        // Use YYYY-MM-DD for grouping
        const dateStr = createdAt.toISOString().split("T")[0];
        timeSeriesMap[dateStr] = (timeSeriesMap[dateStr] || 0) + 1;
      }
    });

    // Format for Recharts
    const byPriority = Object.keys(priorityCounts).map((key) => ({
      name: key,
      value: priorityCounts[key],
    }));

    const byCategory = Object.keys(categoryCounts).map((key) => ({
      name: key,
      value: categoryCounts[key],
    }));

    // Fill in missing days for the last 30 days so the line chart is continuous
    const totalLeadsOverTime = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      // Format as "MMM DD" (e.g. Jan 15)
      const displayDate = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      
      totalLeadsOverTime.push({
        date: displayDate,
        fullDate: dateStr,
        leads: timeSeriesMap[dateStr] || 0,
      });
    }

    return NextResponse.json({
      totalCount: leads.length,
      overTime: totalLeadsOverTime,
      byPriority,
      byCategory,
    });
  } catch (error) {
    console.error("[GET Stats] Unexpected error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
