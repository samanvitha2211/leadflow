import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Verify Admin role
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: currentUser } = await supabase
      .from("users")
      .select("id, name, role")
      .eq("id", user.id)
      .single();

    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ error: "Forbidden. Admin access required." }, { status: 403 });
    }

    const { role } = await request.json();

    if (!role || (role !== "admin" && role !== "manager")) {
      return NextResponse.json({ error: "Invalid role specified" }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Update user role
    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from("users")
      .update({ role })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("[PATCH User Role] Error:", updateError);
      return NextResponse.json({ error: "Failed to update user role" }, { status: 500 });
    }

    // Log the activity
    await supabaseAdmin.from("activity_log").insert({
      user_id: currentUser.id,
      action: "User Role Changed",
      details: `Changed role of ${updatedUser.name} to ${role}`,
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("[PATCH User Role] Unexpected error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
