"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function PropertyProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const [propertyId, setPropertyId] = useState<string>("");
  const [activeTab, setActiveTab] = useState("general");
  const [property, setProperty] = useState<any>(null);
  const [leads, setLeads] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [rules, setRules] = useState<any[]>([]);
  const [newRule, setNewRule] = useState({ name: "", value: "", severity: "hard" });
  const [pricing, setPricing] = useState({ weekday: "", weekend: "", extra: "" });
  const [promotions, setPromotions] = useState<any[]>([]);
  const [newPromo, setNewPromo] = useState({ name: "", start_date: "", end_date: "", price: "" });
  const [sheetsUrl, setSheetsUrl] = useState("");
  const [currentMonth, setCurrentMonth] = useState<Date | null>(null);
  const [dateStatus, setDateStatus] = useState<Record<string, string>>({});
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    params.then((p) => setPropertyId(p.id));
    setCurrentMonth(new Date());
  }, [params]);

  useEffect(() => {
    async function loadData() {
      if (!propertyId) return;
      const { data: prop } = await supabase.from("properties").select("*").eq("id", propertyId).single();
      if (prop) {
        setProperty(prop);
        if (prop.sheets_url) setSheetsUrl(prop.sheets_url);
      }
      const { data: qData } = await supabase.from("property_questions").select("*").eq("property_id", propertyId).order("order_index");
      if (qData) setQuestions(qData);
      const { data: rData } = await supabase.from("property_rules").select("*").eq("property_id", propertyId);
      if (rData) setRules(rData);
      const { data: pData } = await supabase.from("property_pricing").select("*").eq("property_id", propertyId);
      if (pData) {
        const p: any = {};
        pData.forEach((item: any) => { p[item.type] = item.amount; });
        setPricing({ weekday: p.weekday || "", weekend: p.weekend || "", extra: p.extra || "" });
      }
      const { data: cData } = await supabase.from("property_calendar").select("*").eq("property_id", propertyId);
      if (cData) {
        const statusMap: Record<string, string> = {};
        cData.forEach((item: any) => { statusMap[item.date] = item.status; });
        setDateStatus(statusMap);
      }
      const { data: lData } = await supabase.from("conversations").select("*").eq("property_id", propertyId).order("created_at", { ascending: false });
      if (lData) setLeads(lData);
      const { data: promoData } = await supabase.from("property_promotions").select("*").eq("property_id", propertyId).order("start_date");
      if (promoData) setPromotions(promoData);
    }
    loadData();
  }, [propertyId]);

  const addQuestion = async () => {
    if (!newQuestion.trim() || !propertyId) return;
    const { data } = await supabase.from("property_questions").insert([{ property_id: propertyId, question: newQuestion, required: true, order_index: questions.length + 1 }]).select();
    if (data) { setQuestions([...questions, data[0]]); setNewQuestion(""); }
  };

  const addRule = async () => {
    if (!newRule.name.trim() || !propertyId) return;
    const { data } = await supabase.from("property_rules").insert([{ property_id: propertyId, name: newRule.name, value: newRule.value, severity: newRule.severity }]).select();
    if (data) { setRules([...rules, data[0]]); setNewRule({ name: "", value: "", severity: "hard" }); }
  };

  const savePricing = async () => {
    if (!propertyId) return;
    await supabase.from("property_pricing").delete().eq("property_id", propertyId);
    const items = [
      { type: "weekday", name: "מחיר ללילה (אמצע שבוע)", amount: parseInt(pricing.weekday) || 0 },
      { type: "weekend", name: "מחיר ללילה (סוף שבוע)", amount: parseInt(pricing.weekend) || 0 },
      { type: "extra", name: "תוספת לאדם נוסף", amount: parseInt(pricing.extra) || 0 },
    ];
    await supabase.from("property_pricing").insert(items.map(i => ({ ...i, property_id: propertyId })));
    alert("המחירים נשמרו");
  };

  const saveSheetsUrl = async () => {
    if (!propertyId) return;
    await supabase.from("properties").update({ sheets_url: sheetsUrl }).eq("id", propertyId);
    setProperty({ ...property, sheets_url: sheetsUrl });
    alert("הקישור נשמר");
  };

  const addPromotion = async () => {
    if (!newPromo.name || !newPromo.start_date || !newPromo.end_date || !newPromo.price || !propertyId) return;
    const { data } = await supabase.from("property_promotions").insert([{ property_id: propertyId, name: newPromo.name, start_date: newPromo.start_date, end_date: newPromo.end_date, price: parseInt(newPromo.price) }]).select();
    if (data) { setPromotions([...promotions, data[0]]); setNewPromo({ name: "", start_date: "", end_date: "", price: "" }); }
  };

  const deletePromotion = async (id: string) => {
    await supabase.from("property_promotions").delete().eq("id", id);
    setPromotions(promotions.filter(p => p.id !== id));
  };

  const toggleDate = async (dateStr: string) => {
    const order = ["available", "booked", "pending", "maintenance"];
    const current = dateStatus[dateStr] || "available";
    const next = order[(order.indexOf(current) + 1) % order.length];
    setDateStatus({ ...dateStatus, [dateStr]: next });
    await supabase.from("property_calendar").upsert({ property_id: propertyId, date: dateStr, status: next }, { onConflict: "property_id,date" });
  };

  const copyOwnerLink = () => {
    const link = `${window.location.origin}/login`;
    navigator.clipboard.writeText(link);
    alert("הקישור הועתק!\n\nשלח אותו לבעל הנכס:\n" + link);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const days = new Date(year, month + 1, 0).getDate();
    return { firstDay, days };
  };

  const monthData = currentMonth ? getDaysInMonth(currentMonth) : { firstDay: 0, days: 0 };
  const monthName = currentMonth ? currentMonth.toLocaleDateString("he-IL", { month: "long", year: "numeric" }) : "";

  const statusLabels: any = { new: "חדש", verifying: "באימות", details_confirmed: "פרטים אושרו", price_sent: "מחיר נשלח", pending_owner: "ממתין לאישור", approved: "אושר", rejected: "נדחה" };
  const statusColors: any = { new: "#3b82f6", verifying: "#f59e0b", details_confirmed: "#8b5cf6", price_sent: "#6366f1", pending_owner: "#f97316", approved: "#10b981", rejected: "#ef4444" };
  const calLabels: any = { available: "פנוי", booked: "תפוס", pending: "שמור", maintenance: "תחזוקה" };

  const filteredLeads = leads.filter(l => {
    const leadDate = l.created_at?.split("T")[0];
    if (dateFrom && leadDate < dateFrom) return false;
    if (dateTo && leadDate > dateTo) return false;
    return true;
  });

  const tabs = [
    { id: "general", label: "כללי" },
    { id: "leads", label: `לידים (${leads.length})` },
    { id: "rules", label: "מדיניות" },
    { id: "pricing", label: "תמחור" },
    { id: "questions", label: "שאלות" },
    { id: "calendar", label: "יומן" },
    { id: "connections", label: "חיבורים" },
  ];

  const inputStyle = { background: "rgba(50,50,50,0.8)", border: "1px solid #444", color: "#fff" };
  const cardStyle = { background: "rgba(30,30,30,0.8)", border: "1px solid #333", backdropFilter: "blur(10px)" };

  return (
    <div className="min-h-screen flex relative" dir="rtl">
      <div className="absolute inset-0" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1920')", backgroundSize: "cover", backgroundPosition: "center" }} />
      <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(40,40,40,0.75) 0%, rgba(50,50,50,0.7) 100%)" }} />
      
      <div className="relative z-10 flex w-full">
        <aside className="w-64 flex flex-col" style={{ background: "rgba(15,15,15,0.8)", borderLeft: "1px solid #2a2a2a" }}>
          <div className="p-6" style={{ borderBottom: "1px solid #2a2a2a" }}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #d4af37 0%, #f4e4bc 50%, #d4af37 100%)" }}>
                <svg viewBox="0 0 50 50" className="w-8 h-8">
                  <path d="M8 24 L25 10 L42 24" fill="none" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M14 24 L14 40" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round"/>
                  <path d="M36 24 L36 40" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round"/>
                  <path d="M14 32 L36 32" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold" style={{ color: "#d4af37" }}>Hostwise</h1>
                <p className="text-xs" style={{ color: "#888" }}>ניהול נכסי אירוח</p>
              </div>
            </div>
          </div>
          <nav className="flex-1 p-4">
            <ul className="space-y-1">
              <li><a href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition" style={{ color: "#aaa" }}>דשבורד</a></li>
              <li><a href="/properties" className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: "rgba(212,175,55,0.2)", color: "#d4af37" }}>נכסים</a></li>
              <li><a href="/leads" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition" style={{ color: "#aaa" }}>לידים</a></li>
              <li><a href="/bookings" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition" style={{ color: "#aaa" }}>הזמנות</a></li>
            </ul>
          </nav>
          <div className="p-4" style={{ borderTop: "1px solid #2a2a2a" }}>
            <p className="text-sm" style={{ color: "#666" }}>מנהל מערכת</p>
          </div>
        </aside>

        <main className="flex-1 p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold" style={{ color: "#fff" }}>{property?.name || "נכס"}</h2>
              <p className="mt-1" style={{ color: "#aaa" }}>{property?.region} · עד {property?.max_guests} אנשים</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={copyOwnerLink} className="px-4 py-2 rounded-lg text-sm font-medium" style={{ background: "#3b82f6", color: "#fff" }}>העתק קישור לבעל הנכס</button>
              <a href="/properties" style={{ color: "#aaa" }}>← חזרה</a>
            </div>
          </div>

          <div className="mb-6" style={{ borderBottom: "1px solid #333" }}>
            <nav className="flex gap-4 flex-wrap">
              {tabs.map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className="pb-3 font-medium text-sm" style={{ borderBottom: activeTab === tab.id ? "2px solid #d4af37" : "2px solid transparent", color: activeTab === tab.id ? "#d4af37" : "#888" }}>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {activeTab === "connections" && (
            <div className="rounded-2xl p-6" style={cardStyle}>
              <h3 className="font-semibold mb-4" style={{ color: "#fff" }}>חיבור Google Sheets</h3>
              <p className="text-sm mb-4" style={{ color: "#aaa" }}>הכנס את הקישור לגיליון הלידים של הנכס. הגיליון צריך להיות ציבורי (Anyone with the link can view).</p>
              <div className="flex gap-3">
                <input value={sheetsUrl} onChange={(e) => setSheetsUrl(e.target.value)} placeholder="https://docs.google.com/spreadsheets/d/..." className="flex-1 px-4 py-2.5 rounded-lg" style={inputStyle} />
                <button onClick={saveSheetsUrl} className="px-5 py-2.5 rounded-lg" style={{ background: "linear-gradient(135deg, #d4af37 0%, #f4e4bc 100%)", color: "#1a1a1a" }}>שמור</button>
              </div>
              {property?.sheets_url && (
                <p className="text-sm mt-4" style={{ color: "#10b981" }}>✓ מחובר</p>
              )}
              <div className="mt-6 p-4 rounded-xl" style={{ background: "rgba(20,20,20,0.5)", border: "1px solid #333" }}>
                <p className="text-sm font-medium mb-2" style={{ color: "#fff" }}>מבנה הגיליון הנדרש:</p>
                <p className="text-sm" style={{ color: "#aaa" }}>עמודות: שם | טלפון | תאריכים | אורחים</p>
              </div>
            </div>
          )}

          {activeTab === "leads" && (
            <div className="rounded-2xl p-6" style={cardStyle}>
              <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <h3 className="font-semibold" style={{ color: "#fff" }}>לידים</h3>
                <div className="flex items-center gap-3">
                  <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="px-3 py-2 rounded-lg text-sm" style={inputStyle} />
                  <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="px-3 py-2 rounded-lg text-sm" style={inputStyle} />
                  {(dateFrom || dateTo) && <button onClick={() => { setDateFrom(""); setDateTo(""); }} className="text-sm" style={{ color: "#888" }}>נקה</button>}
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="rounded-xl p-4 text-center" style={{ background: "rgba(20,20,20,0.5)" }}><p className="text-2xl font-bold" style={{ color: "#fff" }}>{filteredLeads.length}</p><p className="text-sm" style={{ color: "#888" }}>סה"כ</p></div>
                <div className="rounded-xl p-4 text-center" style={{ background: "rgba(20,20,20,0.5)" }}><p className="text-2xl font-bold" style={{ color: "#f59e0b" }}>{filteredLeads.filter(l => ["new", "verifying", "details_confirmed", "price_sent", "pending_owner"].includes(l.status)).length}</p><p className="text-sm" style={{ color: "#888" }}>בתהליך</p></div>
                <div className="rounded-xl p-4 text-center" style={{ background: "rgba(20,20,20,0.5)" }}><p className="text-2xl font-bold" style={{ color: "#10b981" }}>{filteredLeads.filter(l => l.status === "approved").length}</p><p className="text-sm" style={{ color: "#888" }}>נסגרו</p></div>
                <div className="rounded-xl p-4 text-center" style={{ background: "rgba(20,20,20,0.5)" }}><p className="text-2xl font-bold" style={{ color: "#ef4444" }}>{filteredLeads.filter(l => l.status === "rejected").length}</p><p className="text-sm" style={{ color: "#888" }}>לא רלוונטיים</p></div>
              </div>
              {filteredLeads.length === 0 ? (
                <p className="text-center py-8" style={{ color: "#888" }}>אין לידים</p>
              ) : (
                <div className="space-y-3">
                  {filteredLeads.map((lead) => (
                    <div key={lead.id} className="p-4 rounded-xl" style={{ background: "rgba(20,20,20,0.5)", border: "1px solid #333" }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium" style={{ color: "#fff" }}>{lead.name || "ללא שם"}</span>
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: `${statusColors[lead.status]}20`, color: statusColors[lead.status] }}>{statusLabels[lead.status] || lead.status}</span>
                      </div>
                      <div className="text-sm space-y-1" style={{ color: "#aaa" }}>
                        <p>טלפון: {lead.phone}</p>
                        <p>תאריכים: {lead.dates || "-"}</p>
                        <p>אורחים: {lead.guests || "-"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "general" && (
            <div className="rounded-2xl p-6" style={cardStyle}>
              <h3 className="font-semibold mb-4" style={{ color: "#fff" }}>פרטים כלליים</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p style={{ color: "#888" }}>שם</p><p className="font-medium" style={{ color: "#fff" }}>{property?.name}</p></div>
                <div><p style={{ color: "#888" }}>אזור</p><p className="font-medium" style={{ color: "#fff" }}>{property?.region || "-"}</p></div>
                <div><p style={{ color: "#888" }}>קיבולת</p><p className="font-medium" style={{ color: "#fff" }}>{property?.max_guests || "-"} אנשים</p></div>
              </div>
            </div>
          )}

          {activeTab === "pricing" && (
            <div className="space-y-6">
              <div className="rounded-2xl p-6 max-w-lg" style={cardStyle}>
                <h3 className="font-semibold mb-4" style={{ color: "#fff" }}>מחירון בסיסי</h3>
                <div className="space-y-4">
                  <div><label className="block text-sm mb-1" style={{ color: "#aaa" }}>מחיר ללילה (אמצע שבוע)</label><input type="number" value={pricing.weekday} onChange={(e) => setPricing({ ...pricing, weekday: e.target.value })} className="w-full px-4 py-2.5 rounded-lg" style={inputStyle} /></div>
                  <div><label className="block text-sm mb-1" style={{ color: "#aaa" }}>מחיר ללילה (סוף שבוע)</label><input type="number" value={pricing.weekend} onChange={(e) => setPricing({ ...pricing, weekend: e.target.value })} className="w-full px-4 py-2.5 rounded-lg" style={inputStyle} /></div>
                  <div><label className="block text-sm mb-1" style={{ color: "#aaa" }}>תוספת לאדם נוסף</label><input type="number" value={pricing.extra} onChange={(e) => setPricing({ ...pricing, extra: e.target.value })} className="w-full px-4 py-2.5 rounded-lg" style={inputStyle} /></div>
                </div>
                <button onClick={savePricing} className="mt-6 px-6 py-2.5 rounded-lg" style={{ background: "linear-gradient(135deg, #d4af37 0%, #f4e4bc 100%)", color: "#1a1a1a" }}>שמור מחירים</button>
              </div>
              <div className="rounded-2xl p-6" style={cardStyle}>
                <h3 className="font-semibold mb-4" style={{ color: "#fff" }}>מבצעים</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                  <input value={newPromo.name} onChange={(e) => setNewPromo({ ...newPromo, name: e.target.value })} placeholder="שם המבצע" className="px-4 py-2.5 rounded-lg" style={inputStyle} />
                  <input type="date" value={newPromo.start_date} onChange={(e) => setNewPromo({ ...newPromo, start_date: e.target.value })} className="px-4 py-2.5 rounded-lg" style={inputStyle} />
                  <input type="date" value={newPromo.end_date} onChange={(e) => setNewPromo({ ...newPromo, end_date: e.target.value })} className="px-4 py-2.5 rounded-lg" style={inputStyle} />
                  <input type="number" value={newPromo.price} onChange={(e) => setNewPromo({ ...newPromo, price: e.target.value })} placeholder="מחיר" className="px-4 py-2.5 rounded-lg" style={inputStyle} />
                  <button onClick={addPromotion} className="px-4 py-2.5 rounded-lg font-medium" style={{ background: "#f59e0b", color: "#1a1a1a" }}>הוסף מבצע</button>
                </div>
                {promotions.length === 0 ? (
                  <p className="text-center py-4" style={{ color: "#888" }}>אין מבצעים פעילים</p>
                ) : (
                  <div className="space-y-3">
                    {promotions.map((promo) => (
                      <div key={promo.id} className="flex items-center justify-between p-4 rounded-xl" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid #f59e0b" }}>
                        <div><p className="font-medium" style={{ color: "#fff" }}>{promo.name}</p><p className="text-sm" style={{ color: "#aaa" }}>{promo.start_date} עד {promo.end_date}</p></div>
                        <div className="flex items-center gap-4"><span className="text-lg font-bold" style={{ color: "#f59e0b" }}>₪{promo.price}</span><button onClick={() => deletePromotion(promo.id)} className="text-sm" style={{ color: "#ef4444" }}>מחק</button></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "rules" && (
            <div className="rounded-2xl p-6" style={cardStyle}>
              <h3 className="font-semibold mb-4" style={{ color: "#fff" }}>מדיניות וחוקים</h3>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <input value={newRule.name} onChange={(e) => setNewRule({ ...newRule, name: e.target.value })} placeholder="שם הכלל" className="px-4 py-2.5 rounded-lg" style={inputStyle} />
                <input value={newRule.value} onChange={(e) => setNewRule({ ...newRule, value: e.target.value })} placeholder="ערך" className="px-4 py-2.5 rounded-lg" style={inputStyle} />
                <select value={newRule.severity} onChange={(e) => setNewRule({ ...newRule, severity: e.target.value })} className="px-4 py-2.5 rounded-lg" style={inputStyle}><option value="hard">קשיח</option><option value="soft">גמיש</option></select>
              </div>
              <button onClick={addRule} className="px-5 py-2.5 rounded-lg mb-6" style={{ background: "linear-gradient(135deg, #d4af37 0%, #f4e4bc 100%)", color: "#1a1a1a" }}>הוסף כלל</button>
              <div className="space-y-3">
                {rules.map((rule) => (
                  <div key={rule.id} className="flex justify-between p-4 rounded-xl" style={{ background: "rgba(20,20,20,0.5)", border: "1px solid #333" }}>
                    <div><p className="font-medium" style={{ color: "#fff" }}>{rule.name}</p><p className="text-sm" style={{ color: "#aaa" }}>ערך: {rule.value}</p></div>
                    <span className="px-2 py-1 rounded-full text-xs" style={{ background: rule.severity === "hard" ? "rgba(239,68,68,0.2)" : "rgba(245,158,11,0.2)", color: rule.severity === "hard" ? "#ef4444" : "#f59e0b" }}>{rule.severity === "hard" ? "קשיח" : "גמיש"}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "questions" && (
            <div className="rounded-2xl p-6" style={cardStyle}>
              <h3 className="font-semibold mb-4" style={{ color: "#fff" }}>שאלות לבוט</h3>
              <div className="flex gap-3 mb-6">
                <input value={newQuestion} onChange={(e) => setNewQuestion(e.target.value)} placeholder="הוסף שאלה..." className="flex-1 px-4 py-2.5 rounded-lg" style={inputStyle} />
                <button onClick={addQuestion} className="px-5 py-2.5 rounded-lg" style={{ background: "linear-gradient(135deg, #d4af37 0%, #f4e4bc 100%)", color: "#1a1a1a" }}>הוסף</button>
              </div>
              <div className="space-y-3">
                {questions.map((q, i) => (
                  <div key={q.id} className="flex items-center gap-4 p-4 rounded-xl" style={{ background: "rgba(20,20,20,0.5)", border: "1px solid #333" }}>
                    <span className="w-8 h-8 rounded-full flex items-center justify-center text-sm" style={{ background: "#d4af37", color: "#1a1a1a" }}>{i + 1}</span>
                    <p style={{ color: "#fff" }}>{q.question}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "calendar" && currentMonth && (
            <div className="rounded-2xl p-6" style={cardStyle}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold" style={{ color: "#fff" }}>{monthName}</h3>
                <div className="flex gap-2">
                  <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="px-3 py-1 rounded-lg" style={{ background: "rgba(50,50,50,0.8)", color: "#fff", border: "1px solid #444" }}>←</button>
                  <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="px-3 py-1 rounded-lg" style={{ background: "rgba(50,50,50,0.8)", color: "#fff", border: "1px solid #444" }}>→</button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-2 text-center text-sm mb-2">{["א", "ב", "ג", "ד", "ה", "ו", "ש"].map(d => <div key={d} className="font-medium" style={{ color: "#888" }}>{d}</div>)}</div>
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: monthData.firstDay }).map((_, i) => <div key={`e-${i}`} />)}
                {Array.from({ length: monthData.days }).map((_, i) => {
                  const day = i + 1;
                  const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                  const status = dateStatus[dateStr] || "available";
                  const bgColor = status === "available" ? "rgba(16,185,129,0.2)" : status === "booked" ? "rgba(239,68,68,0.3)" : status === "pending" ? "rgba(245,158,11,0.3)" : "rgba(100,100,100,0.3)";
                  const textColor = status === "available" ? "#10b981" : status === "booked" ? "#ef4444" : status === "pending" ? "#f59e0b" : "#888";
                  return (<button key={day} onClick={() => toggleDate(dateStr)} className="h-14 rounded-lg text-sm font-medium flex flex-col items-center justify-center" style={{ background: bgColor, color: textColor, border: `1px solid ${textColor}` }}><span>{day}</span><span className="text-[10px] opacity-70">{calLabels[status]}</span></button>);
                })}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}