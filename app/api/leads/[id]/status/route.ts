import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { id } = await params;
    const { status } = await request.json();

    const { data: { user } } = await supabase.auth.getUser();

    if (!status || !["new", "in_progress", "closed"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // 1. Fetch old lead
    const { data: oldLead, error: fetchError } = await supabase
      .from("leads")
      .select("status")
      .eq("id", id)
      .single();

    if (fetchError || !oldLead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    if (oldLead.status === status) {
      return NextResponse.json({ success: true }); // No change needed
    }

    // 2. Update status
    const { error: updateError } = await supabaseAdmin
      .from("leads")
      .update({ status })
      .eq("id", id);

    if (updateError) {
      console.error("[PATCH Lead Status] Update failed", updateError);
      return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
    }

    // 3. Log activity
    let actionLabel = "Status Updated";
    if (status === "closed") actionLabel = "Lead Closed";
    if (oldLead.status === "closed" && status === "in_progress") actionLabel = "Lead Reopened";

    await supabaseAdmin.from("activity_log").insert({
      lead_id: id,
      user_id: user?.id,
      action: actionLabel,
      details: `${oldLead.status} → ${status}`
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[PATCH Lead Status] Unexpected error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
