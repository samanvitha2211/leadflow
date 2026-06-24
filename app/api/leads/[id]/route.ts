import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    const { data: lead, error } = await supabase
      .from("leads")
      .select("*, assigned_owner:users!leads_assigned_to_fkey(name, email)")
      .eq("id", id)
      .single();

    if (error || !lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    return NextResponse.json({ lead });
  } catch (error) {
    console.error("[GET Lead] Unexpected error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

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
    const body = await request.json();

    const { current_category, current_priority, suggested_reply, force_ai_override, ai_category, ai_priority } = body;

    // ... authentication and authorization check ...
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!current_category || !current_priority) {
      return NextResponse.json({ error: "Category and Priority are required" }, { status: 400 });
    }

    // 1. Fetch old lead to log changes (using standard client for read is fine, but we have it)
    const { data: oldLead, error: fetchError } = await supabase
      .from("leads")
      .select("current_category, current_priority, suggested_reply")
      .eq("id", id)
      .single();

    if (fetchError || !oldLead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const updatePayload: any = {
      current_category,
      current_priority,
      suggested_reply: suggested_reply || null,
    };

    if (force_ai_override) {
      // Verify Admin
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: currentUser } = await supabase.from("users").select("role").eq("id", user.id).single();
        if (currentUser && currentUser.role === "admin") {
          updatePayload.ai_category = ai_category;
          updatePayload.ai_priority = ai_priority;
        }
      }
    }

    // 2. Perform update using Admin client to bypass RLS
    const { data: updatedLead, error: updateError } = await supabaseAdmin
      .from("leads")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("[PATCH Lead] Update failed", updateError);
      return NextResponse.json({ error: "Failed to update lead" }, { status: 500 });
    }

    // 3. Log differences
    const activities = [];
    
    if (oldLead.current_category !== current_category) {
      activities.push({
        lead_id: id,
        user_id: user.id,
        action: "Category Changed",
        details: `${oldLead.current_category || 'none'} → ${current_category}`
      });
    }

    if (oldLead.current_priority !== current_priority) {
      activities.push({
        lead_id: id,
        user_id: user.id,
        action: "Priority Changed",
        details: `${oldLead.current_priority || 'none'} → ${current_priority}`
      });
    }

    if (oldLead.suggested_reply !== suggested_reply) {
      activities.push({
        lead_id: id,
        user_id: user.id,
        action: "Reply Updated",
        details: "Human override applied to suggested reply."
      });
    }

    if (force_ai_override && updatePayload.ai_category) {
      activities.push({
        lead_id: id,
        user_id: user.id,
        action: "Category Changed",
        details: "Admin force-overwrote permanent AI classification."
      });
    }

    if (activities.length > 0) {
      await supabaseAdmin.from("activity_log").insert(activities);
    }

    return NextResponse.json({ success: true, lead: updatedLead });
  } catch (error) {
    console.error("[PATCH Lead] Unexpected error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
