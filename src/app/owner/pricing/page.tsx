"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function OwnerPricingPage() {
  const router = useRouter();
  const [pricing, setPricing] = useState({ weekday: "", weekend: "", extra: "", finalWeekday: "", finalWeekend: "" });
  const [promotions, setPromotions] = useState<any[]>([]);
  const [newPromo, setNewPromo] = useState({ name: "", start_date: "", end_date: "", price: "" });
  const [propertyId, setPropertyId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lang, setLang] = useState("he");

  const t: any = {
    he: { title: "מחירים", back: "חזרה", basic: "מחירון בסיסי", weekday: "מחיר ללילה (אמצע שבוע)", weekend: "מחיר ללילה (סוף שבוע)", extra: "תוספת לאדם נוסף", final: "מחירים סופיים (למשא ומתן)", finalWeekday: "מחיר סופי (אמצע שבוע)", finalWeekend: "מחיר סופי (סוף שבוע)", save: "שמור מחירים", saving: "שומר...", promos: "מבצעים", name: "שם", price: "מחיר", add: "הוסף", none: "אין מבצעים", saved: "המחירים נשמרו", delete: "מחק" },
    en: { title: "Pricing", back: "Back", basic: "Base Pricing", weekday: "Weekday Price", weekend: "Weekend Price", extra: "Extra Guest", final: "Final Prices (for negotiation)", finalWeekday: "Final Weekday", finalWeekend: "Final Weekend", save: "Save Prices", saving: "Saving...", promos: "Promotions", name: "Name", price: "Price", add: "Add", none: "No promotions", saved: "Prices saved", delete: "Delete" },
  };

  useEffect(() => {
    const saved = localStorage.getItem("lang");
    if (saved) setLang(saved);
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data: owner } = await supabase.from("property_owners").select("property_id").eq("id", user.id).single();
      if (owner?.property_id) {
        setPropertyId(owner.property_id);
        const { data: pData } = await supabase.from("property_pricing").select("*").eq("property_id", owner.property_id);
        if (pData) { const p: any = {}; pData.forEach((item: any) => { p[item.type] = item.amount; }); setPricing({ weekday: p.weekday || "", weekend: p.weekend || "", extra: p.extra || "", finalWeekday: p.final_weekday || "", finalWeekend: p.final_weekend || "" }); }
        const { data: promoData } = await supabase.from("property_promotions").select("*").eq("property_id", owner.property_id).order("start_date");
        if (promoData) setPromotions(promoData);
      }
      setLoading(false);
    }
    load();
  }, [router]);

  const savePricing = async () => {
    setSaving(true);
    await supabase.from("property_pricing").delete().eq("property_id", propertyId);
    const items = [{ type: "weekday", name: "מחיר ללילה (אמצע שבוע)", amount: parseInt(pricing.weekday) || 0 }, { type: "weekend", name: "מחיר ללילה (סוף שבוע)", amount: parseInt(pricing.weekend) || 0 }, { type: "extra", name: "תוספת לאדם נוסף", amount: parseInt(pricing.extra) || 0 }, { type: "final_weekday", name: "מחיר סופי (אמצע שבוע)", amount: parseInt(pricing.finalWeekday) || 0 }, { type: "final_weekend", name: "מחיר סופי (סוף שבוע)", amount: parseInt(pricing.finalWeekend) || 0 }];
    await supabase.from("property_pricing").insert(items.map(i => ({ ...i, property_id: propertyId })));
    setSaving(false);
    alert(t[lang].saved);
  };

  const addPromotion = async () => { if (!newPromo.name || !newPromo.start_date || !newPromo.end_date || !newPromo.price) return; const { data } = await supabase.from("property_promotions").insert([{ property_id: propertyId, name: newPromo.name, start_date: newPromo.start_date, end_date: newPromo.end_date, price: parseInt(newPromo.price) }]).select(); if (data) { setPromotions([...promotions, data[0]]); setNewPromo({ name: "", start_date: "", end_date: "", price: "" }); } };
  const deletePromotion = async (id: string) => { await supabase.from("property_promotions").delete().eq("id", id); setPromotions(promotions.filter(p => p.id !== id)); };

  const cardStyle = { background: "rgba(30,30,30,0.8)", border: "1px solid #333", backdropFilter: "blur(10px)" };
  const inputStyle = { background: "rgba(50,50,50,0.8)", border: "1px solid #444", color: "#fff" };

  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{ background: "#0f0f0f", color: "#888" }}>{lang === "he" ? "טוען..." : "Loading..."}</div>;

  return (
    <div className="min-h-screen relative" dir={lang === "he" ? "rtl" : "ltr"}>
      <div className="absolute inset-0" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920')", backgroundSize: "cover", backgroundPosition: "center" }} />
      <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(40,40,40,0.75) 0%, rgba(50,50,50,0.7) 100%)" }} />
      <div className="relative z-10 p-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold" style={{ color: "#fff" }}>{t[lang].title}</h1>
            <a href="/owner" className="px-4 py-2 rounded-lg text-sm" style={{ background: "rgba(50,50,50,0.8)", color: "#aaa" }}>← {t[lang].back}</a>
          </div>
          <div className="rounded-2xl p-6 mb-6" style={cardStyle}>
            <h3 className="font-semibold mb-4" style={{ color: "#fff" }}>{t[lang].basic}</h3>
            <div className="space-y-4">
              <div><label className="block text-sm mb-1" style={{ color: "#aaa" }}>{t[lang].weekday}</label><input type="number" value={pricing.weekday} onChange={(e) => setPricing({ ...pricing, weekday: e.target.value })} className="w-full px-4 py-2.5 rounded-lg" style={inputStyle} /></div>
              <div><label className="block text-sm mb-1" style={{ color: "#aaa" }}>{t[lang].weekend}</label><input type="number" value={pricing.weekend} onChange={(e) => setPricing({ ...pricing, weekend: e.target.value })} className="w-full px-4 py-2.5 rounded-lg" style={inputStyle} /></div>
              <div><label className="block text-sm mb-1" style={{ color: "#aaa" }}>{t[lang].extra}</label><input type="number" value={pricing.extra} onChange={(e) => setPricing({ ...pricing, extra: e.target.value })} className="w-full px-4 py-2.5 rounded-lg" style={inputStyle} /></div>
            </div>
            <div className="pt-4 mt-4" style={{ borderTop: "1px solid #333" }}>
              <h4 className="font-medium mb-3" style={{ color: "#d4af37" }}>{t[lang].final}</h4>
              <div className="space-y-4">
                <div><label className="block text-sm mb-1" style={{ color: "#aaa" }}>{t[lang].finalWeekday}</label><input type="number" value={pricing.finalWeekday} onChange={(e) => setPricing({ ...pricing, finalWeekday: e.target.value })} className="w-full px-4 py-2.5 rounded-lg" style={inputStyle} /></div>
                <div><label className="block text-sm mb-1" style={{ color: "#aaa" }}>{t[lang].finalWeekend}</label><input type="number" value={pricing.finalWeekend} onChange={(e) => setPricing({ ...pricing, finalWeekend: e.target.value })} className="w-full px-4 py-2.5 rounded-lg" style={inputStyle} /></div>
              </div>
            </div>
            <button onClick={savePricing} disabled={saving} className="mt-6 px-6 py-2.5 rounded-lg font-medium" style={{ background: "linear-gradient(135deg, #d4af37 0%, #f4e4bc 100%)", color: "#1a1a1a" }}>{saving ? t[lang].saving : t[lang].save}</button>
          </div>
          <div className="rounded-2xl p-6" style={cardStyle}>
            <h3 className="font-semibold mb-4" style={{ color: "#fff" }}>{t[lang].promos}</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
              <input value={newPromo.name} onChange={(e) => setNewPromo({ ...newPromo, name: e.target.value })} placeholder={t[lang].name} className="px-4 py-2.5 rounded-lg" style={inputStyle} />
              <input type="date" value={newPromo.start_date} onChange={(e) => setNewPromo({ ...newPromo, start_date: e.target.value })} className="px-4 py-2.5 rounded-lg" style={inputStyle} />
              <input type="date" value={newPromo.end_date} onChange={(e) => setNewPromo({ ...newPromo, end_date: e.target.value })} className="px-4 py-2.5 rounded-lg" style={inputStyle} />
              <input type="number" value={newPromo.price} onChange={(e) => setNewPromo({ ...newPromo, price: e.target.value })} placeholder={t[lang].price} className="px-4 py-2.5 rounded-lg" style={inputStyle} />
              <button onClick={addPromotion} className="px-4 py-2.5 rounded-lg font-medium" style={{ background: "#f59e0b", color: "#1a1a1a" }}>{t[lang].add}</button>
            </div>
            {promotions.length === 0 ? <p className="text-center py-4" style={{ color: "#888" }}>{t[lang].none}</p> : <div className="space-y-3">{promotions.map((promo) => (<div key={promo.id} className="flex items-center justify-between p-4 rounded-xl" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid #f59e0b" }}><div><p className="font-medium" style={{ color: "#fff" }}>{promo.name}</p><p className="text-sm" style={{ color: "#aaa" }}>{promo.start_date} - {promo.end_date}</p></div><div className="flex items-center gap-4"><span className="text-lg font-bold" style={{ color: "#f59e0b" }}>₪{promo.price}</span><button onClick={() => deletePromotion(promo.id)} className="text-sm" style={{ color: "#ef4444" }}>{t[lang].delete}</button></div></div>))}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}