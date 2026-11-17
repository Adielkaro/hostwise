"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function OwnerLeadsPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<any[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<any[]>([]);
  const [propertyId, setPropertyId] = useState("");
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [lang, setLang] = useState("he");

  const t: any = {
    he: { title: "לידים", back: "חזרה", from: "מתאריך", to: "עד תאריך", clear: "נקה", total: "סה\"כ", inProcess: "בתהליך", closed: "נסגרו", rejected: "נדחו", none: "אין לידים בטווח", name: "שם", phone: "טלפון", dates: "תאריכים", guests: "אורחים", price: "מחיר", status: "סטטוס" },
    en: { title: "Leads", back: "Back", from: "From", to: "To", clear: "Clear", total: "Total", inProcess: "In Process", closed: "Closed", rejected: "Rejected", none: "No leads in range", name: "Name", phone: "Phone", dates: "Dates", guests: "Guests", price: "Price", status: "Status" },
  };

  const statusLabels: any = {
    he: { new: "חדש", details_confirmed: "אישר פרטים", price_sent: "נשלח מחיר", pending_owner: "ממתין לאישור", approved: "אושר", rejected: "נדחה" },
    en: { new: "New", details_confirmed: "Confirmed", price_sent: "Price Sent", pending_owner: "Pending", approved: "Approved", rejected: "Rejected" },
  };

  const statusColors: any = { new: "#3b82f6", details_confirmed: "#8b5cf6", price_sent: "#f59e0b", pending_owner: "#f97316", approved: "#10b981", rejected: "#ef4444" };

  useEffect(() => {
    const saved = localStorage.getItem("lang");
    if (saved) setLang(saved);
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data: owner } = await supabase.from("property_owners").select("property_id").eq("id", user.id).single();
      if (owner?.property_id) {
        setPropertyId(owner.property_id);
        const { data: lData } = await supabase.from("conversations").select("*").eq("property_id", owner.property_id).order("created_at", { ascending: false });
        if (lData) { setLeads(lData); setFilteredLeads(lData); }
      }
      setLoading(false);
    }
    load();
  }, [router]);

  useEffect(() => {
    if (!dateFrom && !dateTo) { setFilteredLeads(leads); return; }
    const filtered = leads.filter(lead => {
      const leadDate = new Date(lead.created_at).toISOString().split("T")[0];
      if (dateFrom && leadDate < dateFrom) return false;
      if (dateTo && leadDate > dateTo) return false;
      return true;
    });
    setFilteredLeads(filtered);
  }, [dateFrom, dateTo, leads]);

  const stats = { total: filteredLeads.length, inProcess: filteredLeads.filter(l => ["new", "details_confirmed", "price_sent", "pending_owner"].includes(l.status)).length, closed: filteredLeads.filter(l => l.status === "approved").length, rejected: filteredLeads.filter(l => l.status === "rejected").length };
  const cardStyle = { background: "rgba(30,30,30,0.8)", border: "1px solid #333", backdropFilter: "blur(10px)" };
  const inputStyle = { background: "rgba(50,50,50,0.8)", border: "1px solid #444", color: "#fff" };

  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{ background: "#0f0f0f", color: "#888" }}>{lang === "he" ? "טוען..." : "Loading..."}</div>;

  return (
    <div className="min-h-screen relative" dir={lang === "he" ? "rtl" : "ltr"}>
      <div className="absolute inset-0" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920')", backgroundSize: "cover", backgroundPosition: "center" }} />
      <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(40,40,40,0.75) 0%, rgba(50,50,50,0.7) 100%)" }} />
      <div className="relative z-10 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold" style={{ color: "#fff" }}>{t[lang].title}</h1>
            <a href="/owner" className="px-4 py-2 rounded-lg text-sm" style={{ background: "rgba(50,50,50,0.8)", color: "#aaa" }}>← {t[lang].back}</a>
          </div>
          <div className="rounded-2xl p-4 mb-6 flex flex-wrap items-center gap-4" style={cardStyle}>
            <div className="flex items-center gap-2"><label className="text-sm" style={{ color: "#aaa" }}>{t[lang].from}:</label><input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="px-3 py-2 rounded-lg text-sm" style={inputStyle} /></div>
            <div className="flex items-center gap-2"><label className="text-sm" style={{ color: "#aaa" }}>{t[lang].to}:</label><input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="px-3 py-2 rounded-lg text-sm" style={inputStyle} /></div>
            {(dateFrom || dateTo) && <button onClick={() => { setDateFrom(""); setDateTo(""); }} className="text-sm px-3 py-2 rounded-lg" style={{ color: "#d4af37" }}>{t[lang].clear}</button>}
          </div>
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="rounded-xl p-4 text-center" style={cardStyle}><p className="text-2xl font-bold" style={{ color: "#fff" }}>{stats.total}</p><p className="text-sm" style={{ color: "#888" }}>{t[lang].total}</p></div>
            <div className="rounded-xl p-4 text-center" style={cardStyle}><p className="text-2xl font-bold" style={{ color: "#f59e0b" }}>{stats.inProcess}</p><p className="text-sm" style={{ color: "#888" }}>{t[lang].inProcess}</p></div>
            <div className="rounded-xl p-4 text-center" style={cardStyle}><p className="text-2xl font-bold" style={{ color: "#10b981" }}>{stats.closed}</p><p className="text-sm" style={{ color: "#888" }}>{t[lang].closed}</p></div>
            <div className="rounded-xl p-4 text-center" style={cardStyle}><p className="text-2xl font-bold" style={{ color: "#ef4444" }}>{stats.rejected}</p><p className="text-sm" style={{ color: "#888" }}>{t[lang].rejected}</p></div>
          </div>
          <div className="rounded-2xl overflow-hidden" style={cardStyle}>
            {filteredLeads.length === 0 ? <p className="text-center py-12" style={{ color: "#888" }}>{t[lang].none}</p> : (
              <table className="w-full">
                <thead><tr style={{ borderBottom: "1px solid #333" }}>
                  <th className="text-right px-4 py-3 text-sm" style={{ color: "#888" }}>{t[lang].name}</th>
                  <th className="text-right px-4 py-3 text-sm" style={{ color: "#888" }}>{t[lang].phone}</th>
                  <th className="text-right px-4 py-3 text-sm" style={{ color: "#888" }}>{t[lang].dates}</th>
                  <th className="text-right px-4 py-3 text-sm" style={{ color: "#888" }}>{t[lang].guests}</th>
                  <th className="text-right px-4 py-3 text-sm" style={{ color: "#888" }}>{t[lang].price}</th>
                  <th className="text-right px-4 py-3 text-sm" style={{ color: "#888" }}>{t[lang].status}</th>
                </tr></thead>
                <tbody>{filteredLeads.map((lead) => (
                  <tr key={lead.id} style={{ borderBottom: "1px solid #2a2a2a" }}>
                    <td className="px-4 py-3" style={{ color: "#fff" }}>{lead.name || "-"}</td>
                    <td className="px-4 py-3" style={{ color: "#aaa" }}>{lead.phone}</td>
                    <td className="px-4 py-3" style={{ color: "#aaa" }}>{lead.checkin && lead.checkout ? `${lead.checkin} - ${lead.checkout}` : "-"}</td>
                    <td className="px-4 py-3" style={{ color: "#aaa" }}>{lead.guests || "-"}</td>
                    <td className="px-4 py-3" style={{ color: "#d4af37" }}>{lead.price ? `₪${lead.price}` : "-"}</td>
                    <td className="px-4 py-3"><span className="px-2 py-1 rounded-full text-xs" style={{ background: `${statusColors[lead.status]}20`, color: statusColors[lead.status] }}>{statusLabels[lang][lead.status] || lead.status}</span></td>
                  </tr>
                ))}</tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}