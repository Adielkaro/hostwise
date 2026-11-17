import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  const body = await req.json();
  
  const { name, phone, dates, guests, property_id } = body;

  if (!phone) {
    return NextResponse.json({ error: "Phone is required" }, { status: 400 });
  }

  const { data, error } = await supabase.from("conversations").insert([{
    name: name || null,
    phone,
    dates: dates || null,
    guests: guests || null,
    property_id: property_id || null,
    status: "new",
  }]).select();

  if (error) {
    console.error("Error inserting lead:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  console.log("New lead received:", data);
  return NextResponse.json({ success: true, lead: data });
}