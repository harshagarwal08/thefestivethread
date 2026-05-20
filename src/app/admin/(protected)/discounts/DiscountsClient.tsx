"use client";

import { useState } from "react";
import type { DiscountCode } from "@/lib/discount";

export default function DiscountsClient({ initialCodes }: { initialCodes: DiscountCode[] }) {
  const [codes, setCodes] = useState(initialCodes);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    code: "", type: "percent" as "percent" | "flat", value: "", minOrder: "0", maxUses: "0", expiresAt: "",
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const save = async () => {
    if (!form.code || !form.value) return;
    setSaving(true);
    setMsg("");
    const res = await fetch("/api/discount/create", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-password": getCookie("tft_admin") ?? "" },
      body: JSON.stringify({
        code: form.code.toUpperCase(),
        type: form.type,
        value: Number(form.value),
        minOrder: Number(form.minOrder),
        maxUses: Number(form.maxUses),
        active: true,
        expiresAt: form.expiresAt || undefined,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setMsg(`Code ${data.code} created`);
      setCreating(false);
      setForm({ code: "", type: "percent", value: "", minOrder: "0", maxUses: "0", expiresAt: "" });
      // refresh list
      window.location.reload();
    } else {
      setMsg(data.error ?? "Error creating code");
    }
    setSaving(false);
  };

  const toggleActive = async (dc: DiscountCode) => {
    const updated = { ...dc, active: !dc.active };
    await fetch("/api/discount/create", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-password": getCookie("tft_admin") ?? "" },
      body: JSON.stringify(updated),
    });
    setCodes((prev) => prev.map((c) => c.code === dc.code ? updated : c));
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-[1.4rem] text-[#1C1009]">Discount Codes</h1>
        <button
          onClick={() => setCreating((v) => !v)}
          className="text-[0.65rem] tracking-[0.12em] uppercase px-4 py-2 bg-[#1C1009] text-[#F9F5EF] hover:bg-[#B5541E] transition-colors"
        >
          {creating ? "Cancel" : "+ New Code"}
        </button>
      </div>

      {creating && (
        <div className="bg-white border border-[#DDD4C4] p-5 mb-6">
          <h2 className="text-[0.62rem] tracking-[0.14em] uppercase text-[#B5541E] mb-4">New Discount Code</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[0.6rem] tracking-[0.1em] uppercase text-[#4A2C1A] block mb-1">Code</label>
              <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="e.g. RAKHI10"
                className="w-full border border-[#DDD4C4] px-3 py-2 text-[0.82rem] text-[#1C1009] outline-none focus:border-[#B5541E]" />
            </div>
            <div>
              <label className="text-[0.6rem] tracking-[0.1em] uppercase text-[#4A2C1A] block mb-1">Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as "percent" | "flat" })}
                className="w-full border border-[#DDD4C4] px-3 py-2 text-[0.82rem] text-[#1C1009] outline-none focus:border-[#B5541E] bg-white">
                <option value="percent">Percent (%)</option>
                <option value="flat">Flat (₹)</option>
              </select>
            </div>
            <div>
              <label className="text-[0.6rem] tracking-[0.1em] uppercase text-[#4A2C1A] block mb-1">
                Value ({form.type === "percent" ? "%" : "₹"})
              </label>
              <input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })}
                placeholder={form.type === "percent" ? "10" : "50"}
                className="w-full border border-[#DDD4C4] px-3 py-2 text-[0.82rem] text-[#1C1009] outline-none focus:border-[#B5541E]" />
            </div>
            <div>
              <label className="text-[0.6rem] tracking-[0.1em] uppercase text-[#4A2C1A] block mb-1">Min Order (₹)</label>
              <input type="number" value={form.minOrder} onChange={(e) => setForm({ ...form, minOrder: e.target.value })}
                className="w-full border border-[#DDD4C4] px-3 py-2 text-[0.82rem] text-[#1C1009] outline-none focus:border-[#B5541E]" />
            </div>
            <div>
              <label className="text-[0.6rem] tracking-[0.1em] uppercase text-[#4A2C1A] block mb-1">Max Uses (0 = unlimited)</label>
              <input type="number" value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
                className="w-full border border-[#DDD4C4] px-3 py-2 text-[0.82rem] text-[#1C1009] outline-none focus:border-[#B5541E]" />
            </div>
            <div>
              <label className="text-[0.6rem] tracking-[0.1em] uppercase text-[#4A2C1A] block mb-1">Expires At (optional)</label>
              <input type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                className="w-full border border-[#DDD4C4] px-3 py-2 text-[0.82rem] text-[#1C1009] outline-none focus:border-[#B5541E]" />
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <button onClick={save} disabled={saving}
              className="px-5 py-2.5 bg-[#1C1009] text-[#F9F5EF] text-[0.65rem] tracking-[0.12em] uppercase hover:bg-[#B5541E] transition-colors disabled:opacity-50">
              {saving ? "Creating…" : "Create Code"}
            </button>
            {msg && <p className="text-[0.7rem] text-[#8A7968]">{msg}</p>}
          </div>
        </div>
      )}

      {codes.length === 0 ? (
        <p className="text-[#8A7968] text-sm">No discount codes yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {codes.map((dc) => (
            <div key={dc.code} className={`bg-white border p-4 flex items-center justify-between gap-4 ${dc.active ? "border-[#DDD4C4]" : "border-[#EDE5D8] opacity-60"}`}>
              <div className="flex items-center gap-4 flex-wrap">
                <span className="font-mono font-bold text-[#1C1009] text-[0.9rem]">{dc.code}</span>
                <span className="text-[0.7rem] text-[#8A7968]">
                  {dc.type === "percent" ? `${dc.value}% off` : `₹${dc.value} off`}
                  {dc.minOrder > 0 ? ` · min ₹${dc.minOrder}` : ""}
                  {dc.maxUses > 0 ? ` · ${dc.usedCount}/${dc.maxUses} used` : ` · ${dc.usedCount} used`}
                  {dc.expiresAt ? ` · expires ${new Date(dc.expiresAt).toLocaleDateString("en-IN")}` : ""}
                </span>
              </div>
              <button onClick={() => toggleActive(dc)}
                className={`text-[0.6rem] tracking-[0.1em] uppercase px-3 py-1.5 border transition-colors ${
                  dc.active
                    ? "border-[#DDD4C4] text-[#8A7968] hover:border-red-400 hover:text-red-500"
                    : "border-green-300 text-green-600 hover:bg-green-50"
                }`}>
                {dc.active ? "Pause" : "Activate"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function getCookie(name: string) {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : null;
}
