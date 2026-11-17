"use client";

import { useEffect, useState, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useParams } from "next/navigation";

function InviteContent() {
  const router = useRouter();
  const params = useParams();
  const propertyId = params.id as string;

  const [property, setProperty] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("properties").select("name").eq("id", propertyId).single();
      if (data) setProperty(data);
      setLoading(false);
    }
    load();
  }, [propertyId]);

  const handleRegister = async () => {
    if (!email || !password) return;
    setSubmitting(true);
    setError("");

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setSubmitting(false);
      return;
    }

    if (authData.user) {
      await supabase.from("property_owners").upsert([{
        id: authData.user.id,
        property_id: propertyId,
      }], { onConflict: "id" });

      router.push("/owner");
    }
  };

  const cardStyle = { background: "rgba(30,30,30,0.8)", border: "1px solid #333", backdropFilter: "blur(10px)" };
  const inputStyle = { background: "rgba(50,50,50,0.8)", border: "1px solid #444", color: "#fff" };

  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{ background: "#0f0f0f", color: "#888" }}>טוען...</div>;

  return (
    <div className="min-h-screen relative flex items-center justify-center" dir="rtl">
      <div className="absolute inset-0" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920')", backgroundSize: "cover", backgroundPosition: "center" }} />
      <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(40,40,40,0.85) 0%, rgba(50,50,50,0.8) 100%)" }} />

      <div className="relative z-10 w-full max-w-md p-6">
        <div className="rounded-2xl p-8" style={cardStyle}>
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: "linear-gradient(135deg, #d4af37 0%, #f4e4bc 50%, #d4af37 100%)" }}>
              <svg viewBox="0 0 50 50" className="w-10 h-10"><path d="M8 24 L25 10 L42 24" fill="none" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/><path d="M14 24 L14 40" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round"/><path d="M36 24 L36 40" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round"/><path d="M14 32 L36 32" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round"/></svg>
            </div>
            <h1 className="text-xl font-bold" style={{ color: "#fff" }}>הצטרפות ל-Hostwise</h1>
            {property && <p className="mt-2" style={{ color: "#aaa" }}>נכס: {property.name}</p>}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-1" style={{ color: "#aaa" }}>אימייל</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" className="w-full px-4 py-2.5 rounded-lg" style={inputStyle} />
            </div>
            <div>
              <label className="block text-sm mb-1" style={{ color: "#aaa" }}>סיסמה</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="סיסמה" className="w-full px-4 py-2.5 rounded-lg" style={inputStyle} />
            </div>
          </div>

          {error && <p className="mt-4 text-sm text-center" style={{ color: "#ef4444" }}>{error}</p>}

          <button onClick={handleRegister} disabled={submitting} className="w-full mt-6 px-4 py-3 rounded-lg font-medium" style={{ background: "linear-gradient(135deg, #d4af37 0%, #f4e4bc 100%)", color: "#1a1a1a" }}>
            {submitting ? "יוצר חשבון..." : "צור חשבון והתחבר"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function InvitePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ background: "#0f0f0f", color: "#888" }}>טוען...</div>}>
      <InviteContent />
    </Suspense>
  );
}