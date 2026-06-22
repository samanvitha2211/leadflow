import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import Papa from "papaparse";
import { classifyLead } from "@/lib/ai";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const text = await file.text();
    const parseResult = Papa.parse(text, { header: true, skipEmptyLines: true });

    const rows = parseResult.data as Record<string, unknown>[];
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    let imported = 0;
    let failed = 0;
    const failedRows: Record<string, unknown>[] = [];

    // Process valid rows
    const validLeads = [];
    for (const row of rows) {
      const name = typeof row.name === 'string' ? row.name.trim() : null;
      const message = typeof row.message === 'string' ? row.message.trim() : null;

      if (!name || !message) {
        failed++;
        failedRows.push({ row, reason: "Missing name or message" });
        continue;
      }

      validLeads.push({
        name,
        raw_text: message,
        source: "csv",
        status: "new",
      });
    }

    if (validLeads.length > 0) {
      // 1. Batch insert valid leads
      const { data: insertedLeads, error: insertError } = await supabaseAdmin
        .from("leads")
        .insert(validLeads)
        .select("id, raw_text");

      if (insertError || !insertedLeads) {
        console.error("[Import Route] Bulk insert failed", insertError);
        return NextResponse.json({ error: "Failed to insert leads into database" }, { status: 500 });
      }

      imported = insertedLeads.length;

      // 2. Batch insert activity logs
      const logs = insertedLeads.map((lead) => ({
        lead_id: lead.id,
        action: "Lead Created",
        details: "Created via CSV bulk import",
      }));
      await supabaseAdmin.from("activity_log").insert(logs);

      // 3. Trigger async AI classification for each directly (runs in parallel)
      Promise.all(insertedLeads.map(async (lead) => {
        try {
          const classification = await classifyLead(lead.raw_text, lead.id);
          const { error: updateError } = await supabaseAdmin
            .from("leads")
            .update({
              ai_category: classification.category,
              ai_priority: classification.priority,
              current_category: classification.category,
              current_priority: classification.priority,
              suggested_reply: classification.suggested_reply,
            })
            .eq("id", lead.id);

          if (!updateError) {
            await supabaseAdmin.from("activity_log").insert({
              lead_id: lead.id,
              action: "AI Classified",
              details: `Bulk AI processed: ${classification.category}, ${classification.priority}`,
            });
          }
        } catch (err) {
          console.error(`AI Classification failed for ${lead.id}`, err);
        }
      })).catch(err => console.error("Bulk AI failure", err));
    }

    return NextResponse.json({
      success: true,
      total: rows.length,
      imported,
      failed,
      failedRows,
    });
  } catch (error) {
    console.error("[Import Route] Unexpected error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
