import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const action_type = searchParams.get("action_type");
    const user_id = searchParams.get("user_id");
    const date_from = searchParams.get("date_from");
    const date_to = searchParams.get("date_to");

    const offset = (page - 1) * limit;

    let query = supabase
      .from("activity_log")
      .select(`
        *,
        leads ( name ),
        users ( name )
      `, { count: "exact" });

    if (action_type && action_type !== "all") {
      query = query.eq("action", action_type);
    }
    
    if (user_id && user_id !== "all") {
      if (user_id === "system_ai") {
        query = query.is("user_id", null);
      } else {
        query = query.eq("user_id", user_id);
      }
    }

    if (date_from) {
      query = query.gte("created_at", `${date_from}T00:00:00Z`);
    }

    if (date_to) {
      query = query.lte("created_at", `${date_to}T23:59:59Z`);
    }

    const { data: activities, error, count } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("[GET Activity Log] Error:", error);
      return NextResponse.json({ error: "Failed to fetch activity log" }, { status: 500 });
    }

    // Map to a flatter structure
    const data = activities.map((act) => ({
      ...act,
      lead_name: act.leads ? (act.leads as unknown as Record<string, string>).name : "Unknown Lead",
      user_name: act.users ? (act.users as unknown as Record<string, string>).name : "System AI",
    }));

    return NextResponse.json({
      data,
      total: count || 0,
      page,
      totalPages: count ? Math.ceil(count / limit) : 0,
    });
  } catch (error) {
    console.error("[GET Activity Log] Unexpected error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
