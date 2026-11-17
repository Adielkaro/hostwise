"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
  const [stats, setStats] = useState({ properties: 0, leads: 0, pending: 0, approved: 0 });

  useEffect(() => {
    async function load() {
      const { count: propCount } = await supabase.from("properties").select("*", { count: "exact", head: true });
      const { count: leadCount } = await supabase.from("conversations").select("*", { count: "exact", head: true });
      const { count: pendingCount } = await supabase.from("conversations").select("*", { count: "exact", head: true }).eq("status", "pending_owner");
      const { count: approvedCount } = await supabase.from("conversations").select("*", { count: "exact", head: true }).eq("status", "approved");
      setStats({ properties: propCount || 0, leads: leadCount || 0, pending: pendingCount || 0, approved: approvedCount || 0 });
    }
    load();
  }, []);

  return (
    <div className="min-h-screen flex relative" dir="rtl">
      <div className="absolute inset-0" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1920')", backgroundSize: "cover", backgroundPosition: "center" }} />
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
              <li><a href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: "rgba(212,175,55,0.2)", color: "#d4af37" }}>דשבורד</a></li>
              <li><a href="/properties" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition" style={{ color: "#aaa" }}>נכסים</a></li>
              <li><a href="/leads" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition" style={{ color: "#aaa" }}>לידים</a></li>
            </ul>
          </nav>
          <div className="p-4" style={{ borderTop: "1px solid #2a2a2a" }}>
            <p className="text-sm" style={{ color: "#666" }}>מנהל מערכת</p>
          </div>
        </aside>

        <main className="flex-1 p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold" style={{ color: "#fff" }}>שלום</h2>
            <p className="mt-1" style={{ color: "#aaa" }}>הנה סיכום המערכת שלך</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
            <div className="rounded-2xl p-6" style={{ background: "rgba(30,30,30,0.8)", border: "1px solid #333", backdropFilter: "blur(10px)" }}>
              <p className="text-3xl font-bold" style={{ color: "#d4af37" }}>{stats.properties}</p>
              <p className="text-sm mt-1" style={{ color: "#888" }}>נכסים</p>
            </div>
            <div className="rounded-2xl p-6" style={{ background: "rgba(30,30,30,0.8)", border: "1px solid #333", backdropFilter: "blur(10px)" }}>
              <p className="text-3xl font-bold" style={{ color: "#fff" }}>{stats.leads}</p>
              <p className="text-sm mt-1" style={{ color: "#888" }}>לידים</p>
            </div>
            <div className="rounded-2xl p-6" style={{ background: "rgba(30,30,30,0.8)", border: "1px solid #333", backdropFilter: "blur(10px)" }}>
              <p className="text-3xl font-bold" style={{ color: "#f59e0b" }}>{stats.pending}</p>
              <p className="text-sm mt-1" style={{ color: "#888" }}>ממתינים</p>
            </div>
            <div className="rounded-2xl p-6" style={{ background: "rgba(30,30,30,0.8)", border: "1px solid #333", backdropFilter: "blur(10px)" }}>
              <p className="text-3xl font-bold" style={{ color: "#10b981" }}>{stats.approved}</p>
              <p className="text-sm mt-1" style={{ color: "#888" }}>אושרו</p>
            </div>
          </div>

          <div className="rounded-2xl p-6" style={{ background: "rgba(30,30,30,0.8)", border: "1px solid #333", backdropFilter: "blur(10px)" }}>
            <h3 className="font-semibold mb-4" style={{ color: "#fff" }}>פעולות מהירות</h3>
            <div className="flex gap-3">
              <a href="/properties" className="px-5 py-2.5 rounded-xl font-medium" style={{ background: "linear-gradient(135deg, #d4af37 0%, #f4e4bc 100%)", color: "#1a1a1a" }}>נכסים</a>
              <a href="/leads" className="px-5 py-2.5 rounded-xl font-medium" style={{ background: "rgba(50,50,50,0.8)", color: "#fff", border: "1px solid #444" }}>לידים</a>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}