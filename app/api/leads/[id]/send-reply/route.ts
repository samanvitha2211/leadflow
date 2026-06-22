import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { reply_text } = await request.json();

    if (!reply_text) {
      return NextResponse.json({ error: "Reply text is required" }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Fetch the lead's email
    const { data: lead, error: leadError } = await supabaseAdmin
      .from("leads")
      .select("email, name, status")
      .eq("id", id)
      .single();

    if (leadError || !lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    if (!lead.email) {
      return NextResponse.json({ error: "Lead has no email address on file" }, { status: 400 });
    }

    // Save the reply to the database
    const { error: updateError } = await supabaseAdmin
      .from("leads")
      .update({ 
        manager_reply: reply_text,
        status: "in_progress" 
      })
      .eq("id", id);

    if (updateError) {
      console.error("[Reply Post Error]", updateError);
      return NextResponse.json({ error: "Failed to post reply to database" }, { status: 500 });
    }

    // Log the activity
    await supabaseAdmin.from("activity_log").insert({
      lead_id: id,
      user_id: user.id,
      action: "Reply Posted",
      details: `Posted reply to tracking page.`,
    });

    // Optionally auto-update status to in_progress if it was new
    // Optionally log the auto-status update if it was new
    if (lead.status === "new") {
      await supabaseAdmin.from("activity_log").insert({
        lead_id: id,
        user_id: user.id,
        action: "Status Changed",
        details: "new → in_progress (auto-updated after posting reply)",
      });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("[POST Send Reply] Unexpected error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
