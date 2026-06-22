import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import * as z from "zod";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;

    // 1. Use Admin client to securely create the user and bypass email rate limits
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: adminAuthData, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Bypass email sending & rate limit
      user_metadata: {
        name,
      },
    });

    if (signUpError) {
      console.error("[Register] Admin Auth Error:", signUpError);
      return NextResponse.json({ error: signUpError.message }, { status: 400 });
    }

    if (!adminAuthData.user) {
      return NextResponse.json({ error: "Failed to create user." }, { status: 500 });
    }

    // 2. Insert into public.users table (bypassing RLS)

    const { error: insertError } = await supabaseAdmin
      .from("users")
      .insert({
        id: adminAuthData.user.id,
        email,
        name,
        role: "user", // Default role for public signups
      });

    if (insertError) {
      // If insertion fails, it's safe to delete the auth user so they aren't orphaned
      await supabaseAdmin.auth.admin.deleteUser(adminAuthData.user.id);
      console.error("[Register] Insert Error:", insertError);
      return NextResponse.json({ error: "Failed to create profile. Please try again." }, { status: 500 });
    }

    // 3. Now that the user exists and is confirmed, use the standard client to sign them in and set cookies!
    const supabase = await createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      console.error("[Register] Auto-login Error:", signInError);
      // We don't fail the request since they are registered, but they will need to log in manually
    }

    // Success - the user is signed up, their session is set in cookies, and they have a profile!
    return NextResponse.json({ success: true, role: "user" });
  } catch (error) {
    console.error("[Register] Unexpected error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
