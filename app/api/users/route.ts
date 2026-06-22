import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: users, error } = await supabase
      .from("users")
      .select("id, name, email, role, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[GET Users] Error fetching users:", error);
      return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }

    return NextResponse.json({ users });
  } catch (error) {
    console.error("[GET Users] Unexpected error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // Verify Admin role
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: currentUser } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ error: "Forbidden. Admin access required." }, { status: 403 });
    }

    const { email, name, role } = await request.json();

    if (!email || !name || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Initialize Supabase Admin Client to bypass RLS and create Auth user
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Create Auth user atomically
    const { data: authData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: { name },
      password: Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8) + "A1!", // Random secure password
    });

    if (createError) {
      console.error("[POST Users] Auth Creation Error:", createError);
      return NextResponse.json({ error: createError.message }, { status: 400 });
    }

    const newUserId = authData.user.id;

    // 2. Insert into custom `users` table
    const { error: insertError } = await supabaseAdmin
      .from("users")
      .insert({
        id: newUserId,
        email,
        name,
        role,
      });

    if (insertError) {
      // Rollback: delete the Auth user
      await supabaseAdmin.auth.admin.deleteUser(newUserId);
      console.error("[POST Users] DB Insert Error (Rolled back):", insertError);
      return NextResponse.json({ error: "Failed to create user record. Rolled back." }, { status: 500 });
    }

    // Fetch the newly created user
    const { data: newUser } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("id", newUserId)
      .single();

    return NextResponse.json({ user: newUser });
  } catch (error) {
    console.error("[POST Users] Unexpected error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
