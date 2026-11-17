"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function NewPropertyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    region: "",
    max_guests: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from("properties").insert([
      {
        name: form.name,
        region: form.region,
        max_guests: parseInt(form.max_guests) || null,
        description: form.description,
      },
    ]);

    setLoading(false);

    if (error) {
      alert("שגיאה בשמירה: " + error.message);
    } else {
      router.push("/properties");
    }
  };

  return (
    <div className="min-h-screen flex" dir="rtl">
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-2xl font-bold">Hostwise</h1>
          <p className="text-slate-400 text-sm mt-1">ניהול וילות וצימרים</p>
        </div>
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            <li><a href="/" className="block px-4 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition">דשבורד</a></li>
            <li><a href="/properties" className="block px-4 py-2.5 rounded-lg bg-slate-800 text-white font-medium">נכסים</a></li>
            <li><a href="/leads" className="block px-4 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition">לידים</a></li>
            <li><a href="/bookings" className="block px-4 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition">הזמנות</a></li>
            <li><a href="/bot" className="block px-4 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition">בדיקת בוט</a></li>
          </ul>
        </nav>
        <div className="p-4 border-t border-slate-700 text-sm text-slate-400">מנהל מערכת</div>
      </aside>

      <main className="flex-1 p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800">נכס חדש</h2>
          <p className="text-slate-500 mt-1">הוסף וילה או צימר חדש למערכת</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 max-w-2xl">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">שם הנכס</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                placeholder="למשל: וילה הגליל"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">אזור</label>
              <input
                type="text"
                value={form.region}
                onChange={(e) => setForm({ ...form, region: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                placeholder="למשל: צפון"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">קיבולת מקסימלית</label>
              <input
                type="number"
                value={form.max_guests}
                onChange={(e) => setForm({ ...form, max_guests: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                placeholder="12"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">תיאור</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                placeholder="תיאור קצר של הנכס"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <button
              type="submit"
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg font-medium transition disabled:opacity-50"
            >
              {loading ? "שומר..." : "שמור נכס"}
            </button>
            <a href="/properties" className="px-6 py-2.5 rounded-lg font-medium text-slate-600 hover:bg-slate-100 transition">
              ביטול
            </a>
          </div>
        </form>
      </main>
    </div>
  );
}