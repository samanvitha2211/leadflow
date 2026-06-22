import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import * as z from "zod";
import { classifyLead } from "@/lib/ai";

const publicLeadSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = publicLeadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { name, email, message } = parsed.data;

    // Use Admin Client since this is an unauthenticated route and we need to bypass RLS to insert
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Insert lead
    const { data: newLead, error: insertError } = await supabaseAdmin
      .from("leads")
      .insert({
        name,
        email,
        raw_text: message,
        source: "manual", // or "public_form" if we update the schema check
        status: "new",
      })
      .select("id")
      .single();

    if (insertError || !newLead) {
      console.error("[Public Lead Route] Failed to insert lead", insertError);
      return NextResponse.json({ error: "Failed to create lead" }, { status: 500 });
    }

    // 2. Log activity
    await supabaseAdmin.from("activity_log").insert({
      lead_id: newLead.id,
      action: "Lead Created",
      details: "Created via public contact form",
    });

    // 3. Trigger AI classification asynchronously in the background
    (async () => {
      try {
        const classification = await classifyLead(message, newLead.id);
        
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
      } catch (err) {
        console.error("AI Classification failed", err);
      }
    })();

    return NextResponse.json({ success: true, leadId: newLead.id }, { status: 201 });
  } catch (error) {
    console.error("[Public Lead Route] Unexpected error", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
