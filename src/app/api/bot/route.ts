import { NextResponse } from "next/server";

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

export async function POST(req: Request) {
  const { phone, name, dates, guests } = await req.json();

  const message = `היי ${name}, תודה שהתעניינת.\n\nנשמח לוודא את הפרטים:\nתאריכים: ${dates}\nאורחים: ${guests}\n\nהאם הפרטים נכונים?`;

  const res = await fetch(
    `https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: phone,
        type: "text",
        text: { body: message },
      }),
    }
  );

  const data = await res.json();
  console.log("WhatsApp Response:", JSON.stringify(data, null, 2));

  return NextResponse.json({ success: true, data });
}