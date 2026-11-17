import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const { data: connections } = await supabase
    .from("property_connections")
    .select("property_id")
    .not("sheets_url", "is", null);

  if (!connections || connections.length === 0) {
    return NextResponse.json({ synced: 0, message: "אין נכסים עם גוגל שיטס" });
  }

  let totalNewLeads = 0;
  const results = [];

  for (const conn of connections) {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
      const res = await fetch(`${baseUrl}/api/sync-sheets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ property_id: conn.property_id }),
      });
      const data = await res.json();
      totalNewLeads += data.newLeads || 0;
      results.push({ property_id: conn.property_id, newLeads: data.newLeads || 0 });
    } catch (e) {
      console.error(`Error syncing ${conn.property_id}:`, e);
    }
  }

  return NextResponse.json({ 
    synced: totalNewLeads, 
    properties: results.length,
    results 
  });
}