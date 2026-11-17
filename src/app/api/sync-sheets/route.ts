import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_ID;

async function sendWhatsApp(to: string, text: string) {
  if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID) return;
  await fetch(`https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${WHATSAPP_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: text },
    }),
  });
}

export async function POST(req: Request) {
  try {
    const { property_id } = await req.json();

    const { data: connections } = await supabase
      .from("property_connections")
      .select("*")
      .eq("property_id", property_id)
      .single();

    if (!connections?.sheets_url) {
      return NextResponse.json({ error: "אין קישור לגוגל שיטס" }, { status: 400 });
    }

    const sheetId = connections.sheets_url.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1];
    if (!sheetId) {
      return NextResponse.json({ error: "קישור לא תקין" }, { status: 400 });
    }

    const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
    const res = await fetch(csvUrl);
    const csv = await res.text();
    const lines = csv.split("\n").filter(l => l.trim());
    
    if (lines.length < 2) {
      return NextResponse.json({ error: "הגיליון ריק" }, { status: 400 });
    }

    const headers = lines[0].split(",").map(h => h.trim());

    const { data: property } = await supabase
      .from("properties")
      .select("name")
      .eq("id", property_id)
      .single();

    let newLeads = 0;

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",").map(c => c.trim());
      
      const source = cols[0] || "";
      const leadDate = cols[1] || "";
      const name = cols[2] || "";
      const phone = (cols[3] || "").replace(/\D/g, "");
      const email = cols[4] || "";
      const dates = cols[5] || "";
      const guests = cols[6] || "";

      const questions: string[] = [];
      for (let j = 7; j < cols.length; j++) {
        if (cols[j] && headers[j]) {
          questions.push(`${headers[j]}: ${cols[j]}`);
        }
      }

      if (!phone || phone.length < 9) continue;

      const fullPhone = phone.startsWith("972") ? phone : `972${phone.replace(/^0/, "")}`;

      const { data: existing } = await supabase
        .from("conversations")
        .select("id")
        .eq("phone", fullPhone)
        .eq("property_id", property_id)
        .single();

      if (existing) continue;

      const { data: newConv } = await supabase
        .from("conversations")
        .insert([{
          property_id,
          phone: fullPhone,
          name,
          dates,
          guests,
          questions: questions.join("\n"),
          status: "new"
        }])
        .select()
        .single();

      if (newConv) {
        let message = `שלום ${name}! 👋\n\n`;
        message += `תודה שהתעניינת ב${property?.name || "הנכס"}.\n\n`;
        message += `📋 הפרטים שקיבלנו:\n`;
        if (dates) message += `📅 תאריכים: ${dates}\n`;
        if (guests) message += `👥 נפשות: ${guests}\n`;
        if (questions.length > 0) {
          message += `\n📝 תשובות לשאלות:\n`;
          questions.forEach(q => { message += `• ${q}\n`; });
        }
        message += `\nהאם הפרטים נכונים?\nענה *כן* או *לא*`;

        await sendWhatsApp(fullPhone, message);
        newLeads++;
      }
    }

    return NextResponse.json({ success: true, newLeads });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "שגיאה בסנכרון" }, { status: 500 });
  }
}