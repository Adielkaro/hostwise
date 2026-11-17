"use client";

import { useEffect, useState, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useParams } from "next/navigation";

function PropertyContent() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("info");

  const [rules, setRules] = useState<any[]>([]);
  const [newRule, setNewRule] = useState({ name: "", value: "", severity: "hard" });
  const [pricing, setPricing] = useState({ weekday: "", weekend: "", extra: "", finalWeekday: "", finalWeekend: "" });
  const [promotions, setPromotions] = useState<any[]>([]);
  const [newPromo, setNewPromo] = useState({ name: "", start_date: "", end_date: "", price: "" });
  const [questions, setQuestions] = useState<any[]>([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [dateStatus, setDateStatus] = useState<Record<string, string>>({});
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [connections, setConnections] = useState({ owner_phone: "", sheets_url: "" });

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("properties").select("*").eq("id", id).single();
      if (data) setProperty(data);

      const { data: rData } = await supabase.from("property_rules").select("*").eq("property_id", id);
      if (rData) setRules(rData);

      const { data: pData } = await supabase.from("property_pricing").select("*").eq("property_id", id);
      if (pData) { const p: any = {}; pData.forEach((item: any) => { p[item.type] = item.amount; }); setPricing({ weekday: p.weekday || "", weekend: p.weekend || "", extra: p.extra || "", finalWeekday: p.final_weekday || "", finalWeekend: p.final_weekend || "" }); }

      const { data: promoData } = await supabase.from("property_promotions").select("*").eq("property_id", id);
      if (promoData) setPromotions(promoData);

      const { data: qData } = await supabase.from("property_questions").select("*").eq("property_id", id);
      if (qData) setQuestions(qData);

      const { data: cData } = await supabase.from("property_calendar").select("*").eq("property_id", id);
      if (cData) { const statusMap: Record<string, string> = {}; cData.forEach((item: any) => { statusMap[item.date] = item.status; }); setDateStatus(statusMap); }

      const { data: connData } = await supabase.from("property_connections").select("*").eq("property_id", id).maybeSingle();
      if (connData) setConnections(connData);

      setLoading(false);
    }
    load();
  }, [id]);

  const saveProperty = async () => { await supabase.from("properties").update(property).eq("id", id); alert("נשמר"); };

  const copyInviteLink = () => {
    const link = `${window.location.origin}/invite/${id}`;
    navigator.clipboard.writeText(link);
    alert(`הקישור הועתק:\n${link}\n\nשלח אותו לבעל הנכס`);
  };

  const deleteProperty = async () => {
    if (!confirm("בטוח למחוק את הנכס?")) return;
    await supabase.from("properties").delete().eq("id", id);
    router.push("/");
  };

  const addRule = async () => { if (!newRule.name.trim()) return; const { data } = await supabase.from("property_rules").insert([{ property_id: id, ...newRule }]).select(); if (data) { setRules([...rules, data[0]]); setNewRule({ name: "", value: "", severity: "hard" }); } };
  const deleteRule = async (ruleId: string) => { await supabase.from("property_rules").delete().eq("id", ruleId); setRules(rules.filter(r => r.id !== ruleId)); };

  const savePricing = async () => {
    await supabase.from("property_pricing").delete().eq("property_id", id);
    const items = [{ type: "weekday", name: "אמצע שבוע", amount: parseInt(pricing.weekday) || 0 }, { type: "weekend", name: "סוף שבוע", amount: parseInt(pricing.weekend) || 0 }, { type: "extra", name: "תוספת", amount: parseInt(pricing.extra) || 0 }, { type: "final_weekday", name: "סופי אמצע", amount: parseInt(pricing.finalWeekday) || 0 }, { type: "final_weekend", name: "סופי סוף", amount: parseInt(pricing.finalWeekend) || 0 }];
    await supabase.from("property_pricing").insert(items.map(i => ({ ...i, property_id: id })));
    alert("נשמר");
  };

  const addPromo = async () => { if (!newPromo.name || !newPromo.price) return; const { data } = await supabase.from("property_promotions").insert([{ property_id: id, name: newPromo.name, start_date: newPromo.start_date, end_date: newPromo.end_date, price: parseInt(newPromo.price) }]).select(); if (data) { setPromotions([...promotions, data[0]]); setNewPromo({ name: "", start_date: "", end_date: "", price: "" }); } };
  const deletePromo = async (promoId: string) => { await supabase.from("property_promotions").delete().eq("id", promoId); setPromotions(promotions.filter(p => p.id !== promoId)); };

  const addQuestion = async () => { if (!newQuestion.trim()) return; const { data } = await supabase.from("property_questions").insert([{ property_id: id, question: newQuestion }]).select(); if (data) { setQuestions([...questions, data[0]]); setNewQuestion(""); } };
  const deleteQuestion = async (qId: string) => { await supabase.from("property_questions").delete().eq("id", qId); setQuestions(questions.filter(q => q.id !== qId)); };

  const saveConnections = async () => {
    const { data: existing } = await supabase.from("property_connections").select("id").eq("property_id", id).maybeSingle();
    if (existing) {
      await supabase.from("property_connections").update({ owner_phone: connections.owner_phone, sheets_url: connections.sheets_url }).eq("property_id", id);
    } else {
      await supabase.from("property_connections").insert([{ owner_phone: connections.owner_phone, sheets_url: connections.sheets_url, property_id: id }]);
    }
    alert("חיבורים נשמרו!");
  };

  const syncLeads = async () => {
    try {
      const res = await fetch("/api/sync-sheets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ property_id: id }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`סנכרון הושלם! ${data.newLeads} לידים חדשים`);
      } else {
        alert(data.error || "שגיאה בסנכרון");
      }
    } catch (e) {
      alert("שגיאה בסנכרון");
    }
  };

  const toggleDate = async (dateStr: string) => {
    const order = ["available", "booked", "pending", "maintenance"];
    const current = dateStatus[dateStr] || "available";
    const next = order[(order.indexOf(current) + 1) % order.length];
    setDateStatus({ ...dateStatus, [dateStr]: next });
    await supabase.from("property_calendar").upsert({ property_id: id, date: dateStr, status: next }, { onConflict: "property_id,date" });
  };

  const getDaysInMonth = (date: Date) => { const year = date.getFullYear(); const month = date.getMonth(); return { firstDay: new Date(year, month, 1).getDay(), days: new Date(year, month + 1, 0).getDate() }; };
  const monthData = getDaysInMonth(currentMonth);
  const monthName = currentMonth.toLocaleDateString("he-IL", { month: "long", year: "numeric" });
  const calLabels: any = { available: "פנוי", booked: "תפוס", pending: "שמור", maintenance: "תחזוקה" };

  const cardStyle = { background: "rgba(30,30,30,0.8)", border: "1px solid #333", backdropFilter: "blur(10px)" };
  const inputStyle = { background: "rgba(50,50,50,0.8)", border: "1px solid #444", color: "#fff" };

  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{ background: "#0f0f0f", color: "#888" }}>טוען...</div>;
  if (!property) return <div className="min-h-screen flex items-center justify-center" style={{ background: "#0f0f0f", color: "#888" }}>נכס לא נמצא</div>;

  return (
    <div className="min-h-screen relative" dir="rtl">
      <div className="absolute inset-0" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920')", backgroundSize: "cover", backgroundPosition: "center" }} />
      <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(40,40,40,0.75) 0%, rgba(50,50,50,0.7) 100%)" }} />

      <div className="relative z-10 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold" style={{ color: "#fff" }}>{property.name || "נכס חדש"}</h1>
            <a href="/" className="px-4 py-2 rounded-lg text-sm" style={{ background: "rgba(50,50,50,0.8)", color: "#aaa" }}>← חזרה</a>
          </div>

          <div className="flex gap-2 mb-6 flex-wrap">
            {["info", "rules", "pricing", "questions", "calendar", "connections", "messages"].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className="px-4 py-2 rounded-lg text-sm" style={{ background: activeTab === tab ? "linear-gradient(135deg, #d4af37 0%, #f4e4bc 100%)" : "rgba(50,50,50,0.8)", color: activeTab === tab ? "#1a1a1a" : "#aaa" }}>
                {{ info: "פרטים", rules: "חוקים", pricing: "מחירים", questions: "שאלות", calendar: "יומן", connections: "חיבורים", messages: "הודעות" }[tab]}
              </button>
            ))}
          </div>

          {activeTab === "info" && (
            <div className="rounded-2xl p-6" style={cardStyle}>
              <div className="space-y-4">
                <div><label className="block text-sm mb-1" style={{ color: "#aaa" }}>שם הנכס</label><input value={property.name || ""} onChange={(e) => setProperty({ ...property, name: e.target.value })} className="w-full px-4 py-2.5 rounded-lg" style={inputStyle} /></div>
                <div><label className="block text-sm mb-1" style={{ color: "#aaa" }}>אזור</label><input value={property.region || ""} onChange={(e) => setProperty({ ...property, region: e.target.value })} className="w-full px-4 py-2.5 rounded-lg" style={inputStyle} /></div>
                <div><label className="block text-sm mb-1" style={{ color: "#aaa" }}>מקסימום אורחים</label><input type="number" value={property.max_guests || ""} onChange={(e) => setProperty({ ...property, max_guests: parseInt(e.target.value) })} className="w-full px-4 py-2.5 rounded-lg" style={inputStyle} /></div>
                <div><label className="block text-sm mb-1" style={{ color: "#aaa" }}>טלפון בעלים</label><input value={property.owner_phone || ""} onChange={(e) => setProperty({ ...property, owner_phone: e.target.value })} className="w-full px-4 py-2.5 rounded-lg" style={inputStyle} /></div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={saveProperty} className="px-6 py-2.5 rounded-lg font-medium" style={{ background: "linear-gradient(135deg, #d4af37 0%, #f4e4bc 100%)", color: "#1a1a1a" }}>שמור</button>
                <button onClick={copyInviteLink} className="px-5 py-2.5 rounded-lg font-medium" style={{ background: "rgba(50,50,50,0.8)", color: "#d4af37", border: "1px solid #d4af37" }}>העתק קישור לבעל הנכס</button>
                <button onClick={deleteProperty} className="px-5 py-2.5 rounded-lg font-medium" style={{ background: "rgba(239,68,68,0.2)", color: "#ef4444", border: "1px solid #ef4444" }}>מחק נכס</button>
              </div>
            </div>
          )}

          {activeTab === "rules" && (
            <div className="rounded-2xl p-6" style={cardStyle}>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <input value={newRule.name} onChange={(e) => setNewRule({ ...newRule, name: e.target.value })} placeholder="שם הכלל" className="px-4 py-2.5 rounded-lg" style={inputStyle} />
                <input value={newRule.value} onChange={(e) => setNewRule({ ...newRule, value: e.target.value })} placeholder="ערך" className="px-4 py-2.5 rounded-lg" style={inputStyle} />
                <select value={newRule.severity} onChange={(e) => setNewRule({ ...newRule, severity: e.target.value })} className="px-4 py-2.5 rounded-lg" style={inputStyle}><option value="hard">קשיח</option><option value="soft">גמיש</option></select>
              </div>
              <button onClick={addRule} className="px-5 py-2.5 rounded-lg mb-6 font-medium" style={{ background: "linear-gradient(135deg, #d4af37 0%, #f4e4bc 100%)", color: "#1a1a1a" }}>הוסף כלל</button>
              {rules.length === 0 ? <p className="text-center py-8" style={{ color: "#888" }}>אין חוקים</p> : <div className="space-y-3">{rules.map((rule) => (<div key={rule.id} className="flex justify-between items-center p-4 rounded-xl" style={{ background: "rgba(20,20,20,0.5)", border: "1px solid #333" }}><div><p className="font-medium" style={{ color: "#fff" }}>{rule.name}</p><p className="text-sm" style={{ color: "#aaa" }}>ערך: {rule.value}</p></div><div className="flex items-center gap-3"><span className="px-2 py-1 rounded-full text-xs" style={{ background: rule.severity === "hard" ? "rgba(239,68,68,0.2)" : "rgba(245,158,11,0.2)", color: rule.severity === "hard" ? "#ef4444" : "#f59e0b" }}>{rule.severity === "hard" ? "קשיח" : "גמיש"}</span><button onClick={() => deleteRule(rule.id)} className="text-sm" style={{ color: "#ef4444" }}>מחק</button></div></div>))}</div>}
            </div>
          )}

          {activeTab === "pricing" && (
            <div className="rounded-2xl p-6" style={cardStyle}>
              <h3 className="font-semibold mb-4" style={{ color: "#fff" }}>מחירון בסיסי</h3>
              <div className="space-y-4">
                <div><label className="block text-sm mb-1" style={{ color: "#aaa" }}>מחיר ללילה (אמצע שבוע)</label><input type="number" value={pricing.weekday} onChange={(e) => setPricing({ ...pricing, weekday: e.target.value })} className="w-full px-4 py-2.5 rounded-lg" style={inputStyle} /></div>
                <div><label className="block text-sm mb-1" style={{ color: "#aaa" }}>מחיר ללילה (סוף שבוע)</label><input type="number" value={pricing.weekend} onChange={(e) => setPricing({ ...pricing, weekend: e.target.value })} className="w-full px-4 py-2.5 rounded-lg" style={inputStyle} /></div>
                <div><label className="block text-sm mb-1" style={{ color: "#aaa" }}>תוספת לאדם נוסף</label><input type="number" value={pricing.extra} onChange={(e) => setPricing({ ...pricing, extra: e.target.value })} className="w-full px-4 py-2.5 rounded-lg" style={inputStyle} /></div>
              </div>
              <div className="pt-4 mt-4" style={{ borderTop: "1px solid #333" }}>
                <h4 className="font-medium mb-3" style={{ color: "#d4af37" }}>מחירים סופיים</h4>
                <div className="space-y-4">
                  <div><label className="block text-sm mb-1" style={{ color: "#aaa" }}>מחיר סופי (אמצע שבוע)</label><input type="number" value={pricing.finalWeekday} onChange={(e) => setPricing({ ...pricing, finalWeekday: e.target.value })} className="w-full px-4 py-2.5 rounded-lg" style={inputStyle} /></div>
                  <div><label className="block text-sm mb-1" style={{ color: "#aaa" }}>מחיר סופי (סוף שבוע)</label><input type="number" value={pricing.finalWeekend} onChange={(e) => setPricing({ ...pricing, finalWeekend: e.target.value })} className="w-full px-4 py-2.5 rounded-lg" style={inputStyle} /></div>
                </div>
              </div>
              <button onClick={savePricing} className="mt-6 px-6 py-2.5 rounded-lg font-medium" style={{ background: "linear-gradient(135deg, #d4af37 0%, #f4e4bc 100%)", color: "#1a1a1a" }}>שמור מחירים</button>

              <div className="pt-6 mt-6" style={{ borderTop: "1px solid #333" }}>
                <h4 className="font-medium mb-3" style={{ color: "#fff" }}>מבצעים</h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                  <input value={newPromo.name} onChange={(e) => setNewPromo({ ...newPromo, name: e.target.value })} placeholder="שם" className="px-4 py-2.5 rounded-lg" style={inputStyle} />
                  <input type="date" value={newPromo.start_date} onChange={(e) => setNewPromo({ ...newPromo, start_date: e.target.value })} className="px-4 py-2.5 rounded-lg" style={inputStyle} />
                  <input type="date" value={newPromo.end_date} onChange={(e) => setNewPromo({ ...newPromo, end_date: e.target.value })} className="px-4 py-2.5 rounded-lg" style={inputStyle} />
                  <input type="number" value={newPromo.price} onChange={(e) => setNewPromo({ ...newPromo, price: e.target.value })} placeholder="מחיר" className="px-4 py-2.5 rounded-lg" style={inputStyle} />
                  <button onClick={addPromo} className="px-4 py-2.5 rounded-lg font-medium" style={{ background: "#f59e0b", color: "#1a1a1a" }}>הוסף</button>
                </div>
                {promotions.length === 0 ? <p className="text-center py-4" style={{ color: "#888" }}>אין מבצעים</p> : <div className="space-y-3">{promotions.map((promo) => (<div key={promo.id} className="flex items-center justify-between p-4 rounded-xl" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid #f59e0b" }}><div><p className="font-medium" style={{ color: "#fff" }}>{promo.name}</p><p className="text-sm" style={{ color: "#aaa" }}>{promo.start_date} - {promo.end_date}</p></div><div className="flex items-center gap-4"><span className="text-lg font-bold" style={{ color: "#f59e0b" }}>₪{promo.price}</span><button onClick={() => deletePromo(promo.id)} className="text-sm" style={{ color: "#ef4444" }}>מחק</button></div></div>))}</div>}
              </div>
            </div>
          )}

          {activeTab === "questions" && (
            <div className="rounded-2xl p-6" style={cardStyle}>
              <div className="flex gap-3 mb-4">
                <input value={newQuestion} onChange={(e) => setNewQuestion(e.target.value)} placeholder="שאלה חדשה" className="flex-1 px-4 py-2.5 rounded-lg" style={inputStyle} />
                <button onClick={addQuestion} className="px-5 py-2.5 rounded-lg font-medium" style={{ background: "linear-gradient(135deg, #d4af37 0%, #f4e4bc 100%)", color: "#1a1a1a" }}>הוסף</button>
              </div>
              {questions.length === 0 ? <p className="text-center py-8" style={{ color: "#888" }}>אין שאלות</p> : <div className="space-y-3">{questions.map((q) => (<div key={q.id} className="flex justify-between items-center p-4 rounded-xl" style={{ background: "rgba(20,20,20,0.5)", border: "1px solid #333" }}><p style={{ color: "#fff" }}>{q.question}</p><button onClick={() => deleteQuestion(q.id)} className="text-sm" style={{ color: "#ef4444" }}>מחק</button></div>))}</div>}
            </div>
          )}

          {activeTab === "calendar" && (
            <div className="rounded-2xl p-6" style={cardStyle}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold" style={{ color: "#fff" }}>{monthName}</h3>
                <div className="flex gap-2">
                  <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="px-3 py-1 rounded-lg" style={{ background: "rgba(50,50,50,0.8)", color: "#fff", border: "1px solid #444" }}>←</button>
                  <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="px-3 py-1 rounded-lg" style={{ background: "rgba(50,50,50,0.8)", color: "#fff", border: "1px solid #444" }}>→</button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-2 text-center text-sm mb-2">{["א", "ב", "ג", "ד", "ה", "ו", "ש"].map((d, i) => <div key={i} className="font-medium" style={{ color: "#888" }}>{d}</div>)}</div>
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: monthData.firstDay }).map((_, i) => <div key={`e-${i}`} />)}
                {Array.from({ length: monthData.days }).map((_, i) => {
                  const day = i + 1;
                  const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                  const status = dateStatus[dateStr] || "available";
                  const bgColor = status === "available" ? "rgba(16,185,129,0.2)" : status === "booked" ? "rgba(239,68,68,0.3)" : status === "pending" ? "rgba(245,158,11,0.3)" : "rgba(100,100,100,0.3)";
                  const textColor = status === "available" ? "#10b981" : status === "booked" ? "#ef4444" : status === "pending" ? "#f59e0b" : "#888";
                  return (<button key={day} onClick={() => toggleDate(dateStr)} className="h-14 rounded-lg text-sm font-medium flex flex-col items-center justify-center" style={{ background: bgColor, color: textColor, border: `1px solid ${textColor}` }}><span>{day}</span><span className="text-[8px] opacity-80">{calLabels[status]}</span></button>);
                })}
              </div>
              <div className="mt-6 flex gap-4 justify-center text-sm"><span style={{ color: "#10b981" }}>● פנוי</span><span style={{ color: "#ef4444" }}>● תפוס</span><span style={{ color: "#f59e0b" }}>● שמור</span><span style={{ color: "#888" }}>● תחזוקה</span></div>
            </div>
          )}

          {activeTab === "connections" && (
            <div className="rounded-2xl p-6" style={cardStyle}>
              <h3 className="font-semibold mb-4" style={{ color: "#fff" }}>חיבורים</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-1" style={{ color: "#aaa" }}>טלפון בעלים (WhatsApp)</label>
                  <input
                    value={connections.owner_phone || ""}
                    onChange={(e) => setConnections({ ...connections, owner_phone: e.target.value })}
                    placeholder="972501234567"
                    className="w-full px-4 py-2.5 rounded-lg"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1" style={{ color: "#aaa" }}>קישור גוגל שיטס</label>
                  <input
                    value={connections.sheets_url || ""}
                    onChange={(e) => setConnections({ ...connections, sheets_url: e.target.value })}
                    placeholder="https://docs.google.com/spreadsheets/d/..."
                    className="w-full px-4 py-2.5 rounded-lg"
                    style={inputStyle}
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={saveConnections} className="px-6 py-2.5 rounded-lg font-medium" style={{ background: "linear-gradient(135deg, #d4af37 0%, #f4e4bc 100%)", color: "#1a1a1a" }}>
                  שמור חיבורים
                </button>
                <button onClick={syncLeads} className="px-5 py-2.5 rounded-lg font-medium" style={{ background: "rgba(16,185,129,0.2)", color: "#10b981", border: "1px solid #10b981" }}>
                  סנכרן לידים
                </button>
              </div>
            </div>
          )}

          {activeTab === "messages" && (
            <div className="rounded-2xl p-6" style={cardStyle}>
              <p className="text-center py-8" style={{ color: "#888" }}>הודעות יופיעו כאן</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PropertyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ background: "#0f0f0f", color: "#888" }}>טוען...</div>}>
      <PropertyContent />
    </Suspense>
  );
}