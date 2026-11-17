"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function OwnerRulesPage() {
  const router = useRouter();
  const [rules, setRules] = useState<any[]>([]);
  const [newRule, setNewRule] = useState({ name: "", value: "", severity: "hard" });
  const [propertyId, setPropertyId] = useState("");
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState("he");

  const t: any = {
    he: { title: "מדיניות וחוקים", back: "חזרה", name: "שם הכלל", value: "ערך", hard: "קשיח", soft: "גמיש", add: "הוסף כלל", none: "אין חוקים", delete: "מחק", valueLabel: "ערך:" },
    en: { title: "Policies & Rules", back: "Back", name: "Rule Name", value: "Value", hard: "Hard", soft: "Soft", add: "Add Rule", none: "No rules", delete: "Delete", valueLabel: "Value:" },
  };

  useEffect(() => {
    const saved = localStorage.getItem("lang");
    if (saved) setLang(saved);
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data: owner } = await supabase.from("property_owners").select("property_id").eq("id", user.id).single();
      if (owner?.property_id) { setPropertyId(owner.property_id); const { data: rData } = await supabase.from("property_rules").select("*").eq("property_id", owner.property_id); if (rData) setRules(rData); }
      setLoading(false);
    }
    load();
  }, [router]);

  const addRule = async () => { if (!newRule.name.trim()) return; const { data } = await supabase.from("property_rules").insert([{ property_id: propertyId, name: newRule.name, value: newRule.value, severity: newRule.severity }]).select(); if (data) { setRules([...rules, data[0]]); setNewRule({ name: "", value: "", severity: "hard" }); } };
  const deleteRule = async (id: string) => { await supabase.from("property_rules").delete().eq("id", id); setRules(rules.filter(r => r.id !== id)); };

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
          <div className="rounded-2xl p-6" style={cardStyle}>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <input value={newRule.name} onChange={(e) => setNewRule({ ...newRule, name: e.target.value })} placeholder={t[lang].name} className="px-4 py-2.5 rounded-lg" style={inputStyle} />
              <input value={newRule.value} onChange={(e) => setNewRule({ ...newRule, value: e.target.value })} placeholder={t[lang].value} className="px-4 py-2.5 rounded-lg" style={inputStyle} />
              <select value={newRule.severity} onChange={(e) => setNewRule({ ...newRule, severity: e.target.value })} className="px-4 py-2.5 rounded-lg" style={inputStyle}><option value="hard">{t[lang].hard}</option><option value="soft">{t[lang].soft}</option></select>
            </div>
            <button onClick={addRule} className="px-5 py-2.5 rounded-lg mb-6 font-medium" style={{ background: "linear-gradient(135deg, #d4af37 0%, #f4e4bc 100%)", color: "#1a1a1a" }}>{t[lang].add}</button>
            {rules.length === 0 ? <p className="text-center py-8" style={{ color: "#888" }}>{t[lang].none}</p> : <div className="space-y-3">{rules.map((rule) => (<div key={rule.id} className="flex justify-between items-center p-4 rounded-xl" style={{ background: "rgba(20,20,20,0.5)", border: "1px solid #333" }}><div><p className="font-medium" style={{ color: "#fff" }}>{rule.name}</p><p className="text-sm" style={{ color: "#aaa" }}>{t[lang].valueLabel} {rule.value}</p></div><div className="flex items-center gap-3"><span className="px-2 py-1 rounded-full text-xs" style={{ background: rule.severity === "hard" ? "rgba(239,68,68,0.2)" : "rgba(245,158,11,0.2)", color: rule.severity === "hard" ? "#ef4444" : "#f59e0b" }}>{rule.severity === "hard" ? t[lang].hard : t[lang].soft}</span><button onClick={() => deleteRule(rule.id)} className="text-sm" style={{ color: "#ef4444" }}>{t[lang].delete}</button></div></div>))}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}