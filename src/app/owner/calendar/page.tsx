"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function OwnerCalendarPage() {
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = useState<Date | null>(null);
  const [dateStatus, setDateStatus] = useState<Record<string, string>>({});
  const [propertyId, setPropertyId] = useState("");
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState("he");

  const t: any = {
    he: { title: "יומן זמינות", back: "חזרה", available: "פנוי", booked: "תפוס", pending: "שמור", maintenance: "תחזוקה" },
    en: { title: "Availability Calendar", back: "Back", available: "Available", booked: "Booked", pending: "Pending", maintenance: "Maintenance" },
  };

  useEffect(() => {
    const saved = localStorage.getItem("lang");
    if (saved) setLang(saved);
    setCurrentMonth(new Date());
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data: owner } = await supabase.from("property_owners").select("property_id").eq("id", user.id).single();
      if (owner?.property_id) {
        setPropertyId(owner.property_id);
        const { data: cData } = await supabase.from("property_calendar").select("*").eq("property_id", owner.property_id);
        if (cData) {
          const statusMap: Record<string, string> = {};
          cData.forEach((item: any) => {
            statusMap[item.date] = item.status;
            if (item.guest_name) statusMap[item.date + "_name"] = item.guest_name;
          });
          setDateStatus(statusMap);
        }
      }
      setLoading(false);
    }
    load();
  }, [router]);

  const toggleDate = async (dateStr: string) => {
    const order = ["available", "booked", "pending", "maintenance"];
    const current = dateStatus[dateStr] || "available";
    const next = order[(order.indexOf(current) + 1) % order.length];
    setDateStatus({ ...dateStatus, [dateStr]: next });
    await supabase.from("property_calendar").upsert({ property_id: propertyId, date: dateStr, status: next }, { onConflict: "property_id,date" });
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const days = new Date(year, month + 1, 0).getDate();
    return { firstDay, days };
  };

  const monthData = currentMonth ? getDaysInMonth(currentMonth) : { firstDay: 0, days: 0 };
  const monthName = currentMonth ? currentMonth.toLocaleDateString(lang === "he" ? "he-IL" : "en-US", { month: "long", year: "numeric" }) : "";
  const calLabels: any = { available: t[lang].available, booked: t[lang].booked, pending: t[lang].pending, maintenance: t[lang].maintenance };
  const cardStyle = { background: "rgba(30,30,30,0.8)", border: "1px solid #333", backdropFilter: "blur(10px)" };

  if (loading || !currentMonth) return <div className="min-h-screen flex items-center justify-center" style={{ background: "#0f0f0f", color: "#888" }}>{lang === "he" ? "טוען..." : "Loading..."}</div>;

  return (
    <div className="min-h-screen relative" dir={lang === "he" ? "rtl" : "ltr"}>
      <div className="absolute inset-0" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920')", backgroundSize: "cover", backgroundPosition: "center" }} />
      <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(40,40,40,0.75) 0%, rgba(50,50,50,0.7) 100%)" }} />
      <div className="relative z-10 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold" style={{ color: "#fff" }}>{t[lang].title}</h1>
            <a href="/owner" className="px-4 py-2 rounded-lg text-sm" style={{ background: "rgba(50,50,50,0.8)", color: "#aaa" }}>← {t[lang].back}</a>
          </div>
          <div className="rounded-2xl p-6" style={cardStyle}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold" style={{ color: "#fff" }}>{monthName}</h3>
              <div className="flex gap-2">
                <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="px-3 py-1 rounded-lg" style={{ background: "rgba(50,50,50,0.8)", color: "#fff", border: "1px solid #444" }}>←</button>
                <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="px-3 py-1 rounded-lg" style={{ background: "rgba(50,50,50,0.8)", color: "#fff", border: "1px solid #444" }}>→</button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-2 text-center text-sm mb-2">
              {(lang === "he" ? ["א", "ב", "ג", "ד", "ה", "ו", "ש"] : ["S", "M", "T", "W", "T", "F", "S"]).map((d, i) => <div key={i} className="font-medium" style={{ color: "#888" }}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: monthData.firstDay }).map((_, i) => <div key={`e-${i}`} />)}
              {Array.from({ length: monthData.days }).map((_, i) => {
                const day = i + 1;
                const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const status = dateStatus[dateStr] || "available";
                const guestName = dateStatus[dateStr + "_name"] || "";
                const bgColor = status === "available" ? "rgba(16,185,129,0.2)" : status === "booked" ? "rgba(239,68,68,0.3)" : status === "pending" ? "rgba(245,158,11,0.3)" : "rgba(100,100,100,0.3)";
                const textColor = status === "available" ? "#10b981" : status === "booked" ? "#ef4444" : status === "pending" ? "#f59e0b" : "#888";
                return (
                  <button key={day} onClick={() => toggleDate(dateStr)} className="h-14 rounded-lg text-sm font-medium flex flex-col items-center justify-center overflow-hidden" style={{ background: bgColor, color: textColor, border: `1px solid ${textColor}` }}>
                    <span>{day}</span>
                    <span className="text-[8px] opacity-80 truncate max-w-full px-1">{guestName || calLabels[status]}</span>
                  </button>
                );
              })}
            </div>
            <div className="mt-6 flex gap-4 justify-center text-sm">
              <span style={{ color: "#10b981" }}>● {t[lang].available}</span>
              <span style={{ color: "#ef4444" }}>● {t[lang].booked}</span>
              <span style={{ color: "#f59e0b" }}>● {t[lang].pending}</span>
              <span style={{ color: "#888" }}>● {t[lang].maintenance}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}