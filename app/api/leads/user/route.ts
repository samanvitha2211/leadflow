import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import * as z from "zod";
import { classifyLead } from "@/lib/ai";

const userContactSchema = z.object({
  phone_number: z.string().optional(),
  company_name: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // Authenticate the user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's profile details for the lead name
    const { data: profile } = await supabase
      .from("users")
      .select("name, email")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = userContactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { phone_number, company_name, message } = parsed.data;
    
    // We use the admin client to bypass RLS for inserting and updating AI columns
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Insert lead linked to the submitter
    const { data: newLead, error: insertError } = await supabaseAdmin
      .from("leads")
      .insert({
        name: profile.name,
        email: profile.email,
        phone_number: phone_number || null,
        company_name: company_name || null,
        raw_text: message,
        source: "manual",
        status: "new",
        submitter_id: user.id // Link this lead to the logged-in user
      })
      .select("id")
      .single();

    if (insertError || !newLead) {
      console.error("[User Lead Route] Failed to insert lead", insertError);
      return NextResponse.json({ error: "Failed to create lead" }, { status: 500 });
    }

    // 2. Log activity
    await supabaseAdmin.from("activity_log").insert({
      lead_id: newLead.id,
      user_id: user.id, // Action performed by the user
      action: "Inquiry Submitted",
      details: "User submitted a new inquiry via dashboard",
    });

    // 3. Trigger AI classification directly without waiting
    // Fire and forget
    classifyLead(message, newLead.id, company_name)
      .then(async (classification) => {
        const { error: updateError } = await supabaseAdmin
          .from("leads")
          .update({
            ai_category: classification.category,
            ai_priority: classification.priority,
            current_category: classification.category,
            current_priority: classification.priority,
            suggested_reply: classification.suggested_reply,
          })
          .eq("id", newLead.id);

        if (!updateError) {
          await supabaseAdmin.from("activity_log").insert({
            lead_id: newLead.id,
            action: "AI Classified",
            details: `Category: ${classification.category}, Priority: ${classification.priority}`,
          });
        }
      })
      .catch((err) => {
        console.error("AI Classification failed", err);
      });

    return NextResponse.json({ success: true, leadId: newLead.id }, { status: 201 });
  } catch (error) {
    console.error("[User Lead Route] Unexpected error", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
