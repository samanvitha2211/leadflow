import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import * as z from "zod";
import { classifyLead } from "@/lib/ai";

const manualLeadSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = manualLeadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { name, message } = parsed.data;
    const supabase = await createClient(); // for session check if needed
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Insert lead
    const { data: newLead, error: insertError } = await supabaseAdmin
      .from("leads")
      .insert({
        name,
        raw_text: message,
        source: "manual",
        status: "new",
      })
      .select("id")
      .single();

    if (insertError || !newLead) {
      console.error("[Manual Lead Route] Failed to insert lead", insertError);
      return NextResponse.json({ error: "Failed to create lead" }, { status: 500 });
    }

    // 2. Log activity
    await supabaseAdmin.from("activity_log").insert({
      lead_id: newLead.id,
      action: "Lead Created",
      details: "Created manually via form",
    });

    // 3. Trigger AI classification directly
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

    return NextResponse.json({ success: true, leadId: newLead.id }, { status: 201 });
  } catch (error) {
    console.error("[Manual Lead Route] Unexpected error", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const supabase = await createClient();

    // Pagination
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = (page - 1) * limit;

    // Sorting
    const sortBy = searchParams.get("sort_by") || "created_at";
    const sortDir = searchParams.get("sort_dir") || "desc";

    // Filtering
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const category = searchParams.get("category");
    const assignedTo = searchParams.get("assigned_to");
    const source = searchParams.get("source");
    const search = searchParams.get("search");

    let query = supabase
      .from("leads")
      .select(`*, assigned_owner:users(name)`, { count: "exact" });

    if (status) query = query.eq("status", status);
    if (priority) query = query.eq("current_priority", priority);
    if (category) query = query.eq("current_category", category);
    if (assignedTo) query = query.eq("assigned_to", assignedTo);
    if (source) query = query.eq("source", source);
    
    if (search) {
      // Fuzzy search across name, raw_text, current_category
      query = query.or(`name.ilike.%${search}%,raw_text.ilike.%${search}%,current_category.ilike.%${search}%`);
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortDir === "asc" });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;

    if (error) {
      console.error("[GET Leads] Query error:", error);
      return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 });
    }

    return NextResponse.json({
      data,
      total: count || 0,
      page,
      limit,
    });
  } catch (error) {
    console.error("[GET Leads] Unexpected error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
