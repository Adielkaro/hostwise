"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function PropertiesPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("properties").select("*").order("created_at", { ascending: false });
      if (data) setProperties(data);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="min-h-screen flex relative" dir="rtl">
      <div className="absolute inset-0" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920')", backgroundSize: "cover", backgroundPosition: "center" }} />
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
              <h2 className="text-2xl font-bold" style={{ color: "#fff" }}>נכסים</h2>
              <p className="mt-1" style={{ color: "#aaa" }}>{properties.length} נכסים</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex rounded-lg p-1" style={{ background: "rgba(50,50,50,0.8)" }}>
                <button onClick={() => setViewMode("grid")} className="px-3 py-1.5 rounded text-sm" style={{ background: viewMode === "grid" ? "#d4af37" : "transparent", color: viewMode === "grid" ? "#1a1a1a" : "#888" }}>קוביות</button>
                <button onClick={() => setViewMode("list")} className="px-3 py-1.5 rounded text-sm" style={{ background: viewMode === "list" ? "#d4af37" : "transparent", color: viewMode === "list" ? "#1a1a1a" : "#888" }}>רשימה</button>
              </div>
              <a href="/properties/new" className="px-4 py-2 rounded-xl font-medium" style={{ background: "linear-gradient(135deg, #d4af37 0%, #f4e4bc 100%)", color: "#1a1a1a" }}>+ נכס חדש</a>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12" style={{ color: "#888" }}>טוען...</div>
          ) : properties.length === 0 ? (
            <div className="rounded-2xl p-12 text-center" style={{ background: "rgba(30,30,30,0.8)", border: "1px solid #333" }}>
              <p style={{ color: "#888" }}>אין נכסים עדיין</p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {properties.map((prop) => (
                <a key={prop.id} href={`/properties/${prop.id}`} className="rounded-2xl p-6 transition-all hover:scale-[1.02]" style={{ background: "rgba(30,30,30,0.8)", border: "1px solid #333", backdropFilter: "blur(10px)" }}>
                  <h3 className="font-semibold text-lg" style={{ color: "#fff" }}>{prop.name}</h3>
                  <p className="text-sm mt-1" style={{ color: "#888" }}>{prop.region || "-"}</p>
                  <p className="text-sm mt-2" style={{ color: "#d4af37" }}>עד {prop.max_guests} אנשים</p>
                </a>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(30,30,30,0.8)", border: "1px solid #333" }}>
              <table className="w-full">
                <thead style={{ background: "rgba(20,20,20,0.5)" }}>
                  <tr>
                    <th className="text-right px-6 py-4 text-sm font-semibold" style={{ color: "#aaa" }}>שם</th>
                    <th className="text-right px-6 py-4 text-sm font-semibold" style={{ color: "#aaa" }}>אזור</th>
                    <th className="text-right px-6 py-4 text-sm font-semibold" style={{ color: "#aaa" }}>קיבולת</th>
                  </tr>
                </thead>
                <tbody>
                  {properties.map((prop) => (
                    <tr key={prop.id} className="hover:bg-white/5" style={{ borderTop: "1px solid #333" }}>
                      <td className="px-6 py-4"><a href={`/properties/${prop.id}`} className="font-medium" style={{ color: "#fff" }}>{prop.name}</a></td>
                      <td className="px-6 py-4" style={{ color: "#aaa" }}>{prop.region || "-"}</td>
                      <td className="px-6 py-4" style={{ color: "#d4af37" }}>{prop.max_guests}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}