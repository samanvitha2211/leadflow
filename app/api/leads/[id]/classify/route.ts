import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { classifyLead } from "@/lib/ai";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // 1. Fetch the lead to get raw_text
    const { data: lead, error: fetchError } = await supabase
      .from("leads")
      .select("id, raw_text")
      .eq("id", id)
      .single();

    if (fetchError || !lead) {
      console.error("[Classify Route] Failed to fetch lead", fetchError);
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    if (!lead.raw_text) {
      return NextResponse.json({ error: "No message to classify" }, { status: 400 });
    }

    // 2. Classify via AI Engine
    const classification = await classifyLead(lead.raw_text, lead.id);

    // 3. Update the lead record
    const { error: updateError } = await supabase
      .from("leads")
      .update({
        ai_category: classification.category,
        ai_priority: classification.priority,
        current_category: classification.category,
        current_priority: classification.priority,
        suggested_reply: classification.suggested_reply,
      })
      .eq("id", lead.id);

    if (updateError) {
      console.error("[Classify Route] Failed to update lead", updateError);
      return NextResponse.json({ error: "Failed to update lead" }, { status: 500 });
    }

    // 4. Insert activity log
    await supabase.from("activity_log").insert({
      lead_id: lead.id,
      action: "AI Classified",
      details: `Category: ${classification.category}, Priority: ${classification.priority}`,
    });

    return NextResponse.json({ success: true, classification });
  } catch (error) {
    console.error("[Classify Route] Unexpected error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
