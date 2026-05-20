"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import type { Product } from "@/lib/products";
import { cdnUrl, blurDataUrl } from "@/lib/cloudinary";

function getCookie(name: string) {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : null;
}

type EditState = Omit<Product, "variants"> & { variants: string };

const EMPTY: EditState = {
  id: "", category: "single", name: "", price: 0, mrp: undefined,
  stock: undefined, image: null, image2: null, tag: "", description: "", variants: "",
};

function toEditState(p: Product): EditState {
  return { ...p, variants: p.variants ? JSON.stringify(p.variants, null, 2) : "" };
}

export default function ProductsClient({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [editing, setEditing] = useState<EditState | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [uploadingField, setUploadingField] = useState<"image" | "image2" | null>(null);
  const img1Ref = useRef<HTMLInputElement>(null);
  const img2Ref = useRef<HTMLInputElement>(null);

  const pw = () => getCookie("tft_admin") ?? "";

  const uploadImage = async (file: File, field: "image" | "image2") => {
    setUploadingField(field);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", {
      method: "POST",
      headers: { "x-admin-password": pw() },
      body: fd,
    });
    const data = await res.json();
    setUploadingField(null);
    if (res.ok) {
      setEditing((p) => p ? { ...p, [field]: data.url } : p);
    } else {
      setMsg(data.error ?? "Upload failed");
    }
  };

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    setMsg("");
    let variantsParsed = undefined;
    if (editing.variants?.trim()) {
      try { variantsParsed = JSON.parse(editing.variants); }
      catch { setMsg("Invalid variants JSON"); setSaving(false); return; }
    }
    const payload = { ...editing, variants: variantsParsed };
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-password": pw() },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (res.ok) {
      setEditing(null);
      window.location.reload();
    } else {
      setMsg(data.error ?? "Error saving");
    }
    setSaving(false);
  };

  const del = async (id: string) => {
    if (!confirm(`Delete ${id}?`)) return;
    await fetch("/api/admin/products", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", "x-admin-password": pw() },
      body: JSON.stringify({ id }),
    });
    setProducts((p) => p.filter((x) => x.id !== id));
  };

  const discount = (p: Product) => p.mrp ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 0;

  const ImageUploadField = ({ field, label }: { field: "image" | "image2"; label: string }) => {
    const ref = field === "image" ? img1Ref : img2Ref;
    const currentUrl = editing?.[field];
    const isUploading = uploadingField === field;
    return (
      <div>
        <label className="text-[0.6rem] tracking-[0.1em] uppercase text-[#4A2C1A] block mb-1">{label}</label>
        {currentUrl && (
          <div className="relative w-full aspect-3/4 mb-2 bg-[#F5F1EB] overflow-hidden">
            <Image src={cdnUrl(currentUrl)} alt="" fill className="object-cover" sizes="300px" placeholder="blur" blurDataURL={blurDataUrl} />
            <button
              onClick={() => setEditing((p) => p ? { ...p, [field]: null } : p)}
              className="absolute top-2 right-2 bg-white/90 text-red-500 text-[0.65rem] px-2 py-1 hover:bg-red-50 transition-colors"
            >✕ Remove</button>
          </div>
        )}
        <div
          onClick={() => ref.current?.click()}
          className={`border-2 border-dashed border-[#DDD4C4] hover:border-[#B5541E] transition-colors cursor-pointer px-4 py-4 text-center ${isUploading ? "opacity-50 pointer-events-none" : ""}`}
        >
          <p className="text-[0.72rem] text-[#8A7968]">
            {isUploading ? "Uploading…" : currentUrl ? "Click to replace image" : "Click to upload image"}
          </p>
          <p className="text-[0.62rem] text-[#B5A898] mt-1">JPG, PNG, WEBP</p>
        </div>
        <input ref={ref} type="file" accept="image/*" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage(f, field); e.target.value = ""; }}
        />
        {!currentUrl && (
          <input
            type="text"
            value={(editing?.[field] as string) ?? ""}
            onChange={(e) => setEditing((p) => p ? { ...p, [field]: e.target.value || null } : p)}
            placeholder="Or paste URL / path"
            className="mt-1 w-full border border-[#DDD4C4] px-3 py-2 text-[0.78rem] text-[#1C1009] outline-none focus:border-[#B5541E]"
          />
        )}
      </div>
    );
  };

  const Field = ({ k, label, type = "text", placeholder }: { k: keyof EditState; label: string; type?: string; placeholder?: string }) => (
    <div>
      <label className="text-[0.6rem] tracking-[0.1em] uppercase text-[#4A2C1A] block mb-1">{label}</label>
      <input
        type={type}
        value={(editing?.[k] as string | number) ?? ""}
        onChange={(e) => setEditing((p) => p ? { ...p, [k]: type === "number" ? (e.target.value === "" ? undefined : Number(e.target.value)) : e.target.value } : p)}
        placeholder={placeholder}
        className="w-full border border-[#DDD4C4] px-3 py-2 text-[0.82rem] text-[#1C1009] outline-none focus:border-[#B5541E]"
      />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-[1.4rem] text-[#1C1009]">Products ({products.length})</h1>
        <button onClick={() => { setEditing({ ...EMPTY }); setIsNew(true); setMsg(""); }}
          className="text-[0.65rem] tracking-[0.12em] uppercase px-4 py-2 bg-[#1C1009] text-[#F9F5EF] hover:bg-[#B5541E] transition-colors">
          + New Product
        </button>
      </div>

      {/* Edit / Create Panel */}
      {editing && (
        <div className="bg-white border border-[#DDD4C4] p-6 mb-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[0.62rem] tracking-[0.14em] uppercase text-[#B5541E]">
              {isNew ? "New Product" : `Editing: ${editing.id}`}
            </h2>
            <button onClick={() => setEditing(null)} className="text-[0.6rem] tracking-[0.1em] uppercase text-[#8A7968] hover:text-[#B5541E]">✕ Close</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Images column */}
            <div className="flex flex-col gap-4">
              <ImageUploadField field="image" label="Main Image" />
              <ImageUploadField field="image2" label="Alternate Image (optional)" />
            </div>

            {/* Fields */}
            <div className="md:col-span-2 grid grid-cols-2 gap-4">
              <Field k="id" label="Product ID" placeholder="sr-01" />
              <div>
                <label className="text-[0.6rem] tracking-[0.1em] uppercase text-[#4A2C1A] block mb-1">Category</label>
                <select value={editing.category}
                  onChange={(e) => setEditing((p) => p ? { ...p, category: e.target.value as Product["category"] } : p)}
                  className="w-full border border-[#DDD4C4] px-3 py-2 text-[0.82rem] text-[#1C1009] outline-none focus:border-[#B5541E] bg-white">
                  <option value="single">Single Rakhis</option>
                  <option value="combo">Rakhi + Lumba</option>
                  <option value="kids">Kid's Rakhis</option>
                </select>
              </div>
              <div className="col-span-2"><Field k="name" label="Name" /></div>
              <Field k="price" label="Price (₹)" type="number" />
              <Field k="mrp" label="MRP / Strikethrough (₹)" type="number" />
              <Field k="stock" label="Stock (blank = unlimited)" type="number" />
              <Field k="tag" label="Tag" placeholder="Bestseller" />
              <div className="col-span-2">
                <label className="text-[0.6rem] tracking-[0.1em] uppercase text-[#4A2C1A] block mb-1">Description</label>
                <textarea value={editing.description ?? ""}
                  onChange={(e) => setEditing((p) => p ? { ...p, description: e.target.value } : p)}
                  rows={3}
                  className="w-full border border-[#DDD4C4] px-3 py-2 text-[0.82rem] text-[#1C1009] outline-none focus:border-[#B5541E]"
                />
              </div>
              <div className="col-span-2">
                <label className="text-[0.6rem] tracking-[0.1em] uppercase text-[#4A2C1A] block mb-1">Variants JSON (optional)</label>
                <textarea value={editing.variants ?? ""}
                  onChange={(e) => setEditing((p) => p ? { ...p, variants: e.target.value } : p)}
                  rows={2} placeholder={'[{"label":"Red","value":"red","color":"#FF0000"}]'}
                  className="w-full border border-[#DDD4C4] px-3 py-2 text-[0.78rem] font-mono text-[#1C1009] outline-none focus:border-[#B5541E]"
                />
              </div>
              <div className="col-span-2 flex items-center gap-3 pt-2">
                <button onClick={save} disabled={saving}
                  className="px-6 py-2.5 bg-[#1C1009] text-[#F9F5EF] text-[0.65rem] tracking-[0.12em] uppercase hover:bg-[#B5541E] transition-colors disabled:opacity-50">
                  {saving ? "Saving…" : "Save Product"}
                </button>
                {msg && <p className="text-[0.7rem] text-red-500">{msg}</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product grid — same layout as shop */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
        {products.map((p) => {
          const disc = discount(p);
          const imgSrc = p.image ? cdnUrl(p.image) : null;
          return (
            <div key={p.id} className="group relative">
              {/* Image */}
              <div className="relative aspect-3/4 overflow-hidden mb-3 bg-[#F5F1EB]">
                {imgSrc ? (
                  <Image src={imgSrc} alt={p.name} fill className="object-cover" sizes="(max-width: 640px) 50vw, 25vw" placeholder="blur" blurDataURL={blurDataUrl} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#B5A898] text-[0.6rem] tracking-widest uppercase">No image</div>
                )}
                {p.tag && (
                  <span className="absolute top-2 left-2 bg-[#1C1009] text-[#F9F5EF] text-[0.58rem] tracking-[0.12em] uppercase px-2 py-0.5">{p.tag}</span>
                )}
                {disc >= 10 && (
                  <span className="absolute top-2 right-2 bg-[#B5541E] text-white text-[0.58rem] font-bold px-2 py-0.5">{disc}% off</span>
                )}
                {p.stock !== undefined && p.stock < 5 && (
                  <span className="absolute bottom-2 left-2 bg-amber-500/90 text-white text-[0.58rem] uppercase px-2 py-0.5">Only {p.stock} left</span>
                )}
                {/* Action overlay */}
                <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-200 flex">
                  <button onClick={() => { setEditing(toEditState(p)); setIsNew(false); setMsg(""); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    className="flex-1 py-2.5 bg-[#1C1009] text-[#F9F5EF] text-[0.6rem] tracking-[0.1em] uppercase hover:bg-[#B5541E] transition-colors">
                    Edit
                  </button>
                  <button onClick={() => del(p.id)}
                    className="px-3 py-2.5 bg-red-600 text-white text-[0.6rem] hover:bg-red-700 transition-colors">
                    ✕
                  </button>
                </div>
              </div>
              {/* Info */}
              <p className="font-mono text-[0.6rem] text-[#B5A898] mb-0.5">{p.id}</p>
              <h3 className="font-display text-[1.05rem] text-[#1C1009] leading-snug mb-1">{p.name}</h3>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[#B5541E] text-sm font-medium">₹{p.price}</span>
                {p.mrp && <span className="text-[#B5A898] text-[0.75rem] line-through">₹{p.mrp}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
