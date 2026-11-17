"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function OwnerPage() {
  const router = useRouter();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState("he");

  useEffect(() => {
    const saved = localStorage.getItem("lang");
    if (saved) setLang(saved);
  }, []);

  const changeLang = (newLang: string) => {
    setLang(newLang);
    localStorage.setItem("lang", newLang);
  };

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data: owner } = await supabase.from("property_owners").select("*").eq("id", user.id).single();
      if (owner?.property_id) {
        const { data: prop } = await supabase.from("properties").select("*").eq("id", owner.property_id).single();
        if (prop) setProperty(prop);
      }
      setLoading(false);
    }
    load();
  }, [router]);

  const handleLogout = async () => { await supabase.auth.signOut(); router.push("/login"); };

  const t: any = {
    he: { title: "ניהול נכס", logout: "התנתק", calendar: "יומן", calendarDesc: "צפה ועדכן זמינות", pricing: "מחירים", pricingDesc: "עדכן מחירון", rules: "מדיניות", rulesDesc: "עדכן חוקים", leads: "לידים", leadsDesc: "צפה בלידים", noProperty: "לא נמצא נכס משויך" },
    en: { title: "Property Management", logout: "Logout", calendar: "Calendar", calendarDesc: "View and update availability", pricing: "Pricing", pricingDesc: "Update prices", rules: "Policies", rulesDesc: "Update rules", leads: "Leads", leadsDesc: "View leads", noProperty: "No property found" },
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{ background: "#0f0f0f" }}><div style={{ color: "#888" }}>{lang === "he" ? "טוען..." : "Loading..."}</div></div>;

  const cardStyle = { background: "rgba(30,30,30,0.8)", border: "1px solid #333", backdropFilter: "blur(10px)" };

  return (
    <div className="min-h-screen relative" dir={lang === "he" ? "rtl" : "ltr"}>
      <div className="absolute inset-0" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920')", backgroundSize: "cover", backgroundPosition: "center" }} />
      <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(40,40,40,0.75) 0%, rgba(50,50,50,0.7) 100%)" }} />
      
      <div className="relative z-10">
        <header className="px-6 py-4" style={{ background: "rgba(15,15,15,0.8)", borderBottom: "1px solid #2a2a2a" }}>
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #d4af37 0%, #f4e4bc 50%, #d4af37 100%)" }}>
                <svg viewBox="0 0 50 50" className="w-8 h-8"><path d="M8 24 L25 10 L42 24" fill="none" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/><path d="M14 24 L14 40" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round"/><path d="M36 24 L36 40" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round"/><path d="M14 32 L36 32" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round"/></svg>
              </div>
              <div><span className="font-semibold" style={{ color: "#d4af37" }}>Hostwise</span><p className="text-xs" style={{ color: "#888" }}>{t[lang].title}</p></div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => changeLang(lang === "he" ? "en" : "he")} className="px-3 py-1.5 rounded-lg text-sm" style={{ background: "rgba(50,50,50,0.8)", color: "#fff", border: "1px solid #444" }}>{lang === "he" ? "EN" : "עב"}</button>
              <button onClick={handleLogout} className="text-sm px-4 py-2 rounded-lg" style={{ color: "#888", background: "rgba(50,50,50,0.5)" }}>{t[lang].logout}</button>
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto p-6">
          {property ? (
            <div>
              <div className="mb-8">
                <h1 className="text-3xl font-bold" style={{ color: "#fff" }}>{property.name}</h1>
                <p className="mt-1" style={{ color: "#aaa" }}>{property.region} · {property.max_guests} {lang === "he" ? "אנשים" : "guests"}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <a href="/owner/calendar" className="p-6 rounded-2xl transition-all hover:scale-[1.02]" style={cardStyle}>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: "linear-gradient(135deg, #d4af37 0%, #f4e4bc 100%)" }}>
                    <svg className="w-7 h-7" style={{ color: "#1a1a1a" }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </div>
                  <h3 className="font-semibold text-lg" style={{ color: "#fff" }}>{t[lang].calendar}</h3>
                  <p className="text-sm mt-1" style={{ color: "#888" }}>{t[lang].calendarDesc}</p>
                </a>

                <a href="/owner/pricing" className="p-6 rounded-2xl transition-all hover:scale-[1.02]" style={cardStyle}>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: "linear-gradient(135deg, #d4af37 0%, #f4e4bc 100%)" }}>
                    <svg className="w-7 h-7" style={{ color: "#1a1a1a" }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <h3 className="font-semibold text-lg" style={{ color: "#fff" }}>{t[lang].pricing}</h3>
                  <p className="text-sm mt-1" style={{ color: "#888" }}>{t[lang].pricingDesc}</p>
                </a>

                <a href="/owner/rules" className="p-6 rounded-2xl transition-all hover:scale-[1.02]" style={cardStyle}>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: "linear-gradient(135deg, #d4af37 0%, #f4e4bc 100%)" }}>
                    <svg className="w-7 h-7" style={{ color: "#1a1a1a" }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  </div>
                  <h3 className="font-semibold text-lg" style={{ color: "#fff" }}>{t[lang].rules}</h3>
                  <p className="text-sm mt-1" style={{ color: "#888" }}>{t[lang].rulesDesc}</p>
                </a>

                <a href="/owner/leads" className="p-6 rounded-2xl transition-all hover:scale-[1.02]" style={cardStyle}>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: "linear-gradient(135deg, #d4af37 0%, #f4e4bc 100%)" }}>
                    <svg className="w-7 h-7" style={{ color: "#1a1a1a" }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </div>
                  <h3 className="font-semibold text-lg" style={{ color: "#fff" }}>{t[lang].leads}</h3>
                  <p className="text-sm mt-1" style={{ color: "#888" }}>{t[lang].leadsDesc}</p>
                </a>
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-2xl text-center" style={cardStyle}><p style={{ color: "#888" }}>{t[lang].noProperty}</p></div>
          )}
        </main>
      </div>
    </div>
  );
}