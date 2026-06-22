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
    const { assigned_to } = await request.json();

    const { data: { user } } = await supabase.auth.getUser();

    // 1. Fetch old assignment to log changes and get names
    const { data: oldLead, error: fetchError } = await supabase
      .from("leads")
      .select("assigned_to, users!leads_assigned_to_fkey(name)")
      .eq("id", id)
      .single();

    if (fetchError || !oldLead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    // 2. Update assignment
    const { error: updateError } = await supabaseAdmin
      .from("leads")
      .update({ assigned_to: assigned_to || null })
      .eq("id", id);

    if (updateError) {
      console.error("[PATCH Lead Assign] Update failed", updateError);
      return NextResponse.json({ error: "Failed to update assignment" }, { status: 500 });
    }

    // 3. Get new assigned user name if assigned
    let newName = "Unassigned";
    if (assigned_to) {
      const { data: newUser } = await supabase.from("users").select("name").eq("id", assigned_to).single();
      if (newUser) newName = newUser.name;
    }

    const oldName = oldLead.users ? (oldLead.users as unknown as Record<string, unknown>).name : "Unassigned";

    if (oldName !== newName) {
      await supabaseAdmin.from("activity_log").insert({
        lead_id: id,
        user_id: user?.id,
        action: "Assigned User Changed",
        details: `${oldName} → ${newName}`
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[PATCH Lead Assign] Unexpected error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
