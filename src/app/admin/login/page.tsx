"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pw }),
    });
    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      setError("Incorrect password");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-[#1C1009] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-[#F9F5EF] p-8">
        <p className="font-display text-[0.65rem] tracking-[0.2em] uppercase text-[#B5541E] mb-1">The Festive Thread</p>
        <h1 className="font-display text-[1.5rem] text-[#1C1009] mb-6">Admin Login</h1>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="Password"
            className="border border-[#DDD4C4] px-4 py-3 text-[0.88rem] text-[#1C1009] bg-white outline-none focus:border-[#B5541E] transition-colors"
          />
          {error && <p className="text-[0.7rem] text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={loading || !pw}
            className="py-3 bg-[#1C1009] text-[#F9F5EF] text-[0.7rem] tracking-[0.14em] uppercase hover:bg-[#B5541E] transition-colors disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
