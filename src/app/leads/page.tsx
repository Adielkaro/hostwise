"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("conversations").select("*, properties(name)").order("created_at", { ascending: false });
      if (data) setLeads(data);
      setLoading(false);
    }
    load();
  }, []);

  const statusLabels: any = { new: "חדש", verifying: "באימות", details_confirmed: "פרטים אושרו", price_sent: "מחיר נשלח", pending_owner: "ממתין לאישור", approved: "אושר", rejected: "נדחה" };
  const statusColors: any = { new: "#3b82f6", verifying: "#f59e0b", details_confirmed: "#8b5cf6", price_sent: "#6366f1", pending_owner: "#f97316", approved: "#10b981", rejected: "#ef4444" };

  const filteredLeads = leads.filter(l => {
    const leadDate = l.created_at?.split("T")[0];
    if (dateFrom && leadDate < dateFrom) return false;
    if (dateTo && leadDate > dateTo) return false;
    return true;
  });

  return (
    <div className="min-h-screen flex relative" dir="rtl">
      <div className="absolute inset-0" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=1920')", backgroundSize: "cover", backgroundPosition: "center" }} />
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
              <li><a href="/properties" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition" style={{ color: "#aaa" }}>נכסים</a></li>
              <li><a href="/leads" className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: "rgba(212,175,55,0.2)", color: "#d4af37" }}>לידים</a></li>
              <li><a href="/bookings" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition" style={{ color: "#aaa" }}>הזמנות</a></li>
            </ul>
          </nav>
          <div className="p-4" style={{ borderTop: "1px solid #2a2a2a" }}>
            <p className="text-sm" style={{ color: "#666" }}>מנהל מערכת</p>
          </div>
        </aside>

        <main className="flex-1 p-8">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div>
              <h2 className="text-2xl font-bold" style={{ color: "#fff" }}>כל הלידים</h2>
              <p className="mt-1" style={{ color: "#aaa" }}>{filteredLeads.length} לידים</p>
            </div>
            <div className="flex items-center gap-3">
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="px-3 py-2 rounded-lg text-sm" style={{ background: "rgba(50,50,50,0.8)", border: "1px solid #444", color: "#fff" }} />
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="px-3 py-2 rounded-lg text-sm" style={{ background: "rgba(50,50,50,0.8)", border: "1px solid #444", color: "#fff" }} />
              {(dateFrom || dateTo) && <button onClick={() => { setDateFrom(""); setDateTo(""); }} className="text-sm" style={{ color: "#888" }}>נקה</button>}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="rounded-xl p-4 text-center" style={{ background: "rgba(30,30,30,0.8)", border: "1px solid #333" }}>
              <p className="text-2xl font-bold" style={{ color: "#fff" }}>{filteredLeads.length}</p>
              <p className="text-sm" style={{ color: "#888" }}>סה"כ</p>
            </div>
            <div className="rounded-xl p-4 text-center" style={{ background: "rgba(30,30,30,0.8)", border: "1px solid #333" }}>
              <p className="text-2xl font-bold" style={{ color: "#f59e0b" }}>{filteredLeads.filter(l => ["new", "verifying", "details_confirmed", "price_sent", "pending_owner"].includes(l.status)).length}</p>
              <p className="text-sm" style={{ color: "#888" }}>בתהליך</p>
            </div>
            <div className="rounded-xl p-4 text-center" style={{ background: "rgba(30,30,30,0.8)", border: "1px solid #333" }}>
              <p className="text-2xl font-bold" style={{ color: "#10b981" }}>{filteredLeads.filter(l => l.status === "approved").length}</p>
              <p className="text-sm" style={{ color: "#888" }}>נסגרו</p>
            </div>
            <div className="rounded-xl p-4 text-center" style={{ background: "rgba(30,30,30,0.8)", border: "1px solid #333" }}>
              <p className="text-2xl font-bold" style={{ color: "#ef4444" }}>{filteredLeads.filter(l => l.status === "rejected").length}</p>
              <p className="text-sm" style={{ color: "#888" }}>לא רלוונטיים</p>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(30,30,30,0.8)", border: "1px solid #333" }}>
            {loading ? (
              <div className="p-12 text-center" style={{ color: "#888" }}>טוען...</div>
            ) : filteredLeads.length === 0 ? (
              <div className="p-12 text-center" style={{ color: "#888" }}>אין לידים</div>
            ) : (
              <table className="w-full">
                <thead style={{ background: "rgba(20,20,20,0.5)" }}>
                  <tr>
                    <th className="text-right px-6 py-4 text-sm font-semibold" style={{ color: "#aaa" }}>שם</th>
                    <th className="text-right px-6 py-4 text-sm font-semibold" style={{ color: "#aaa" }}>טלפון</th>
                    <th className="text-right px-6 py-4 text-sm font-semibold" style={{ color: "#aaa" }}>נכס</th>
                    <th className="text-right px-6 py-4 text-sm font-semibold" style={{ color: "#aaa" }}>תאריכים</th>
                    <th className="text-right px-6 py-4 text-sm font-semibold" style={{ color: "#aaa" }}>סטטוס</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-white/5" style={{ borderTop: "1px solid #333" }}>
                      <td className="px-6 py-4 font-medium" style={{ color: "#fff" }}>{lead.name || "-"}</td>
                      <td className="px-6 py-4" style={{ color: "#aaa" }}>{lead.phone}</td>
                      <td className="px-6 py-4" style={{ color: "#aaa" }}>{lead.properties?.name || "-"}</td>
                      <td className="px-6 py-4" style={{ color: "#aaa" }}>{lead.dates || "-"}</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: `${statusColors[lead.status]}20`, color: statusColors[lead.status] }}>
                          {statusLabels[lead.status] || lead.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}