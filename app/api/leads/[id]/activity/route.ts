import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    const { data: activities, error } = await supabase
      .from("activity_log")
      .select("*, users(name)")
      .eq("lead_id", id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[GET Lead Activity] Error:", error);
      return NextResponse.json({ error: "Failed to fetch activity" }, { status: 500 });
    }

    return NextResponse.json({ activities });
  } catch (error) {
    console.error("[GET Lead Activity] Unexpected error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
