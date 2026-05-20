"use client";

import { useState, Suspense, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { products, getProductById, type Product } from "@/lib/products";
import { boxes, chocolates, getBox, getChocolate, type BoxId, type ChocolateId } from "@/lib/hamperOptions";
import { useCart, type HamperRakhi } from "@/lib/cart";
import { cdnUrl } from "@/lib/cloudinary";

// ─── gradients for picker cards ───────────────────────────────────────────────
const boxBg: Record<BoxId, string> = {
  wooden: "linear-gradient(150deg, #A07248 0%, #7A5230 40%, #4A3018 100%)",
  jute:   "linear-gradient(150deg, #C8A87A 0%, #9E8050 45%, #6A4E28 100%)",
  velvet: "linear-gradient(150deg, #3A1550 0%, #250D38 55%, #130520 100%)",
};
const chocoBg: Record<ChocolateId, string> = {
  none:       "linear-gradient(150deg, #EDE5D8 0%, #D4C8B0 100%)",
  "silk-60":  "linear-gradient(150deg, #5C2080 0%, #3D1155 55%, #1E0828 100%)",
  "silk-144": "linear-gradient(150deg, #4A1870 0%, #2E0C48 55%, #160624 100%)",
  "fn-51":    "linear-gradient(150deg, #7B3A10 0%, #5A2608 55%, #2E1204 100%)",
  "fn-129":   "linear-gradient(150deg, #6A2E08 0%, #4A1E04 55%, #260E02 100%)",
  "oreo-124": "linear-gradient(150deg, #1A1A2E 0%, #10101E 55%, #08080E 100%)",
  "ferrero-50": "linear-gradient(150deg, #C09020 0%, #8A6010 55%, #483008 100%)",
  "kitkat-4":  "linear-gradient(150deg, #D82828 0%, #A01818 55%, #620808 100%)",
  "kisses-36": "linear-gradient(150deg, #8B1A2C 0%, #6A1020 55%, #3A0810 100%)",
};

// ─── PickerCard (box / chocolate) ─────────────────────────────────────────────
function PickerCard({ selected, onClick, bg, image, label, sublabel, price }: {
  selected: boolean; onClick: () => void; bg: string;
  image?: string; label: string; sublabel: string; price: number;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className={`relative shrink-0 w-44 overflow-hidden cursor-pointer text-left transition-shadow duration-300 ${
        selected ? "shadow-[0_16px_40px_rgba(0,0,0,0.18)]" : "shadow-[0_4px_16px_rgba(0,0,0,0.12)] hover:shadow-[0_10px_32px_rgba(0,0,0,0.2)]"
      }`}
      style={{ background: image ? undefined : bg }}
    >
      <div className="relative h-44">
        {image ? (
          <Image src={cdnUrl(image)} alt={label} fill className="object-cover" sizes="208px" />
        ) : (
          <div className="w-full h-full" style={{ background: bg }} />
        )}
      </div>
      <div className="px-4 py-3.5 bg-[#1C1009]/80 border-t border-white/10 h-21 flex flex-col justify-center">
        <p className="font-display text-[0.95rem] text-[#F9F5EF] leading-tight line-clamp-1">{label}</p>
        <p className="text-[0.6rem] tracking-[0.06em] text-[#B5A898] mt-0.5 leading-snug line-clamp-1">{sublabel}</p>
        <p className="text-[0.7rem] font-medium text-[#E8B84B] mt-1.5">{price === 0 ? "Free" : `+₹${price}`}</p>
      </div>
      <AnimatePresence>
        {selected && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 border-2 border-[#B5541E] pointer-events-none z-20" />
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
              className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-[#B5541E] flex items-center justify-center z-20">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

// ─── Rakhi Drawer ─────────────────────────────────────────────────────────────
const CATS = [
  { id: "single" as const, label: "Single" },
  { id: "combo" as const,  label: "Sets" },
  { id: "kids" as const,   label: "Kids" },
];

function RakhiDrawer({
  open, onClose, rakhis, variantMap, onAdd, onRemove, onVariant,
}: {
  open: boolean;
  onClose: () => void;
  rakhis: HamperRakhi[];
  variantMap: Record<string, string>;
  onAdd: (productId: string, variant?: string) => void;
  onRemove: (productId: string, variant?: string) => void;
  onVariant: (productId: string, variant: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState<"single" | "combo" | "kids" | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => searchRef.current?.focus(), 120);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setSearch("");
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const filtered = products.filter((p) => {
    const matchCat = !cat || p.category === cat;
    const q = search.trim().toLowerCase();
    const matchSearch = !q || p.name.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  const getRakhiQty = (p: Product) => {
    const activeVariant = variantMap[p.id] ?? p.variants?.[0]?.value;
    const key = p.variants ? `${p.id}::${activeVariant}` : p.id;
    return rakhis.find((r) => (r.variant ? `${r.productId}::${r.variant}` : r.productId) === key)?.quantity ?? 0;
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#1C1009]/50 z-40"
          />

          {/* Sheet — bottom on mobile, right side panel on md+ */}
          <motion.div
            key="sheet"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
            className="fixed bottom-0 left-0 right-0 md:left-auto md:top-0 md:right-0 md:bottom-0 md:w-[440px] z-50 flex flex-col bg-[#FAF7F2] shadow-2xl"
            style={{ maxHeight: "92dvh" }}
          >
            {/* Handle (mobile only) */}
            <div className="md:hidden flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 rounded-full bg-[#DDD4C4]" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#EDE5D8] shrink-0">
              <div>
                <h3 className="font-display text-[1.1rem] text-[#1C1009]">Pick rakhis</h3>
                <p className="text-[0.62rem] text-[#8A7968] mt-0.5">Tap to add · tap again to remove</p>
              </div>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-[#8A7968] hover:text-[#1C1009] transition-colors text-xl leading-none">×</button>
            </div>

            {/* Search + filter */}
            <div className="px-5 pt-4 pb-3 space-y-3 shrink-0">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#B5A898]" width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.4"/>
                  <path d="M9.5 9.5l2.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Search rakhis…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border border-[#DDD4C4] bg-white text-[0.82rem] text-[#1C1009] placeholder:text-[#B5A898] outline-none focus:border-[#B5541E] transition-colors"
                />
              </div>
              <div className="flex gap-2">
                {CATS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setCat(cat === c.id ? null : c.id)}
                    className={`text-[0.6rem] tracking-[0.1em] uppercase px-3.5 py-1.5 border transition-colors ${
                      cat === c.id ? "bg-[#1C1009] border-[#1C1009] text-[#F9F5EF]" : "border-[#DDD4C4] text-[#8A7968] hover:border-[#1C1009]"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
                {cat && (
                  <button onClick={() => setCat(null)} className="text-[0.6rem] tracking-[0.1em] uppercase px-2 py-1.5 text-[#B5A898] hover:text-[#8A7968] transition-colors">
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Product grid */}
            <div className="flex-1 overflow-y-auto px-5 pb-6">
              {filtered.length === 0 ? (
                <p className="py-12 text-center text-[0.8rem] text-[#B5A898]">No rakhis match</p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {filtered.map((product) => {
                    const activeVariant = variantMap[product.id] ?? product.variants?.[0]?.value;
                    const qty = getRakhiQty(product);
                    const selected = qty > 0;
                    return (
                      <button
                        key={product.id}
                        onClick={() => {
                          if (qty === 0) onAdd(product.id, product.variants ? activeVariant : undefined);
                          else onRemove(product.id, product.variants ? activeVariant : undefined);
                        }}
                        className={`group relative flex flex-col overflow-hidden border text-left transition-all ${
                          selected ? "border-[#B5541E]" : "border-[#DDD4C4] hover:border-[#B5A898]"
                        }`}
                      >
                        <div className="relative aspect-square bg-[#EDE5D8] w-full">
                          {product.image && (
                            <Image src={cdnUrl(product.image)} alt={product.name} fill
                              className="object-cover transition-transform duration-300 group-hover:scale-[1.04]" sizes="160px" />
                          )}
                          {selected && (
                            <div className="absolute top-0 right-0 w-6 h-6 bg-[#B5541E] flex items-center justify-center">
                              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="px-2 py-1.5 bg-white">
                          <p className="text-[0.64rem] font-medium text-[#1C1009] leading-tight line-clamp-2">{product.name}</p>
                          <p className="text-[0.58rem] text-[#B5541E] mt-0.5">₹{product.price}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer: done */}
            <div className="px-5 py-4 border-t border-[#EDE5D8] shrink-0 bg-[#FAF7F2]">
              <button
                onClick={onClose}
                className="w-full py-3.5 bg-[#1C1009] text-[#F9F5EF] text-[0.68rem] tracking-[0.14em] uppercase hover:bg-[#B5541E] transition-colors"
              >
                Done{rakhis.length > 0 ? ` · ${rakhis.reduce((s, r) => s + r.quantity, 0)} selected` : ""}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Section rule ─────────────────────────────────────────────────────────────
const Rule = () => <div className="h-px bg-[#EDE5D8] w-full" />;

// ─── Main builder ─────────────────────────────────────────────────────────────
function HamperBuilderInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addHamper } = useCart();

  const [boxId, setBoxId] = useState<BoxId>("wooden");
  const [chocoId, setChocoId] = useState<ChocolateId>("silk-60");
  const [rakhis, setRakhis] = useState<HamperRakhi[]>([]);
  const [variantMap, setVariantMap] = useState<Record<string, string>>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [added, setAdded] = useState(false);

  // Pre-select rakhi from ?rakhi= URL param
  useEffect(() => {
    const preselect = searchParams.get("rakhi");
    if (!preselect) return;
    const product = getProductById(preselect);
    if (!product) return;
    const variant = product.variants?.[0]?.value;
    setRakhis([{ productId: preselect, quantity: 1, variant }]);
    if (variant) setVariantMap({ [preselect]: variant });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const box = getBox(boxId);
  const choco = getChocolate(chocoId);

  const getRakhiQty = (productId: string, variant?: string) => {
    const key = variant ? `${productId}::${variant}` : productId;
    return rakhis.find((r) => (r.variant ? `${r.productId}::${r.variant}` : r.productId) === key)?.quantity ?? 0;
  };

  const addRakhi = (productId: string, variant?: string) => {
    setRakhis((prev) => {
      const key = variant ? `${productId}::${variant}` : productId;
      const existing = prev.find((r) => (r.variant ? `${r.productId}::${r.variant}` : r.productId) === key);
      if (existing) return prev.map((r) => (r.variant ? `${r.productId}::${r.variant}` : r.productId) === key ? { ...r, quantity: r.quantity + 1 } : r);
      return [...prev, { productId, quantity: 1, variant }];
    });
  };

  const removeRakhi = (productId: string, variant?: string) => {
    setRakhis((prev) => {
      const key = variant ? `${productId}::${variant}` : productId;
      return prev
        .map((r) => (r.variant ? `${r.productId}::${r.variant}` : r.productId) === key ? { ...r, quantity: r.quantity - 1 } : r)
        .filter((r) => r.quantity > 0);
    });
  };

  const setVariant = (productId: string, variant: string) => {
    setVariantMap((prev) => ({ ...prev, [productId]: variant }));
    setRakhis((prev) => prev.map((r) => r.productId === productId ? { ...r, variant } : r));
  };

  const rakhiTotal = rakhis.reduce((s, r) => s + (getProductById(r.productId)?.price ?? 0) * r.quantity, 0);
  const total = box.price + choco.price + rakhiTotal;
  const totalRakhiCount = rakhis.reduce((s, r) => s + r.quantity, 0);

  const handleAdd = () => {
    if (rakhis.length === 0) return;
    addHamper(boxId, chocoId, rakhis);
    setAdded(true);
  };

  if (added) {
    return (
      <div className="max-w-[520px] mx-auto px-4 md:px-10 py-20 text-center flex flex-col items-center gap-5">
        <div className="w-8 h-px bg-[#C9972C]/60 mx-auto" />
        <h2 className="font-display text-[1.8rem] text-[#1C1009]">Hamper added to cart</h2>
        <p className="text-[#8A7968] text-[0.88rem] max-w-[300px] leading-[1.8]">
          {box.label} · {choco.id !== "none" ? choco.label : "No chocolate"} · {totalRakhiCount} rakhi{totalRakhiCount !== 1 ? "s" : ""}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 mt-2">
          <button onClick={() => router.push("/cart")}
            className="text-[0.7rem] tracking-[0.12em] uppercase px-7 py-3.5 bg-[#1C1009] text-[#F9F5EF] hover:bg-[#B5541E] transition-colors">
            View Cart & Checkout
          </button>
          <button onClick={() => { setRakhis([]); setAdded(false); }}
            className="text-[0.7rem] tracking-[0.12em] uppercase px-7 py-3.5 border border-[#DDD4C4] text-[#8A7968] hover:border-[#1C1009] hover:text-[#1C1009] transition-colors">
            Build Another Hamper
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <RakhiDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        rakhis={rakhis}
        variantMap={variantMap}
        onAdd={addRakhi}
        onRemove={removeRakhi}
        onVariant={setVariant}
      />

      <div className="max-w-[1300px] mx-auto px-4 md:px-10 py-8 md:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-10 md:gap-16 items-start">

          {/* ── Left ── */}
          <div className="flex flex-col gap-14 min-w-0">

            {/* 01 — Rakhis */}
            <section>
              <div className="flex items-baseline gap-3 mb-6">
                <span className="font-display text-[3rem] font-light text-[#EDE5D8] leading-none select-none">01</span>
                <div>
                  <h2 className="font-display text-[1.2rem] text-[#1C1009] leading-tight">Choose your rakhis</h2>
                  <p className="text-[0.68rem] text-[#8A7968] mt-0.5">Mix and match — add as many as you like</p>
                </div>
              </div>

              {/* Selected rakhis list */}
              {rakhis.length > 0 ? (
                <div className="flex flex-col divide-y divide-[#EDE5D8] border border-[#DDD4C4] mb-4">
                  {rakhis.map((r, i) => {
                    const product = getProductById(r.productId);
                    if (!product) return null;
                    const activeVariant = variantMap[product.id] ?? product.variants?.[0]?.value;
                    return (
                      <div key={i} className="flex items-center gap-3.5 px-4 py-3 bg-white">
                        {/* Image */}
                        <div className="relative w-12 h-14 shrink-0 bg-[#EDE5D8] overflow-hidden">
                          {product.image && (
                            <Image src={cdnUrl(product.image)} alt={product.name} fill className="object-cover" sizes="48px" />
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-[0.82rem] font-medium text-[#1C1009] leading-tight truncate">{product.name}</p>
                          {product.variants && product.variants.length > 0 && (
                            <div className="flex gap-1.5 mt-1.5 items-center">
                              {product.variants.map((v) => (
                                <button
                                  key={v.value}
                                  onClick={() => setVariant(product.id, v.value)}
                                  title={v.label}
                                  className={`rounded-full transition-all duration-150 ${
                                    activeVariant === v.value
                                      ? "ring-2 ring-[#B5541E] ring-offset-1"
                                      : "ring-1 ring-[#DDD4C4] hover:ring-[#B5A898]"
                                  }`}
                                  style={{ backgroundColor: v.color, width: 14, height: 14 }}
                                />
                              ))}
                              <span className="text-[0.58rem] text-[#8A7968]">
                                {product.variants.find(v => v.value === activeVariant)?.label}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Qty stepper */}
                        <div className="flex items-center border border-[#DDD4C4] shrink-0">
                          <button
                            onClick={() => removeRakhi(product.id, product.variants ? activeVariant : undefined)}
                            className="w-7 h-7 flex items-center justify-center text-[#8A7968] hover:bg-[#FBF7F2] transition-colors text-sm"
                          >−</button>
                          <span className="w-6 text-center text-[0.78rem] font-medium text-[#1C1009] border-x border-[#DDD4C4]">{r.quantity}</span>
                          <button
                            onClick={() => addRakhi(product.id, product.variants ? activeVariant : undefined)}
                            className="w-7 h-7 flex items-center justify-center text-[#8A7968] hover:bg-[#FBF7F2] transition-colors text-sm"
                          >+</button>
                        </div>

                        {/* Price */}
                        <p className="text-[0.72rem] font-medium text-[#4A2C1A] w-12 text-right shrink-0">₹{product.price * r.quantity}</p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="border border-dashed border-[#DDD4C4] py-8 flex flex-col items-center gap-2 mb-4 bg-[#FDFBF8]">
                  <p className="text-[0.8rem] text-[#B5A898]">No rakhis added yet</p>
                  <p className="text-[0.64rem] text-[#C8BFB2]">Tap below to browse</p>
                </div>
              )}

              {/* Add rakhi button */}
              <button
                onClick={() => setDrawerOpen(true)}
                className="flex items-center gap-2.5 px-5 py-3 border border-[#1C1009] text-[#1C1009] hover:bg-[#1C1009] hover:text-[#F9F5EF] transition-colors group"
              >
                <span className="text-lg leading-none group-hover:rotate-0 transition-transform">+</span>
                <span className="text-[0.68rem] tracking-[0.12em] uppercase font-medium">
                  {rakhis.length === 0 ? "Add rakhis" : "Add more rakhis"}
                </span>
              </button>
            </section>

            <Rule />

            {/* 02 — Box */}
            <section>
              <div className="flex items-baseline gap-3 mb-6">
                <span className="font-display text-[3rem] font-light text-[#EDE5D8] leading-none select-none">02</span>
                <div>
                  <h2 className="font-display text-[1.2rem] text-[#1C1009] leading-tight">Choose your box</h2>
                  <p className="text-[0.68rem] text-[#8A7968] mt-0.5">The first thing they&apos;ll unwrap</p>
                </div>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 w-full" style={{ scrollbarWidth: "none", scrollSnapType: "x mandatory" }}>
                {boxes.map((b) => (
                  <div key={b.id} style={{ scrollSnapAlign: "start" }}>
                    <PickerCard selected={boxId === b.id} onClick={() => setBoxId(b.id)}
                      bg={boxBg[b.id]} image={b.image} label={b.label} sublabel={b.desc} price={b.price} />
                  </div>
                ))}
              </div>
              <div className="mt-3 pl-4 py-3 border-l-2 border-[#B5541E] bg-[#F9F5EF]">
                <p className="text-[0.8rem] text-[#4A2C1A]"><strong className="font-medium">{box.label}</strong> — {box.desc}</p>
              </div>
            </section>

            <Rule />

            {/* 03 — Chocolate */}
            <section>
              <div className="flex items-baseline gap-3 mb-6">
                <span className="font-display text-[3rem] font-light text-[#EDE5D8] leading-none select-none">03</span>
                <div>
                  <h2 className="font-display text-[1.2rem] text-[#1C1009] leading-tight">Add a chocolate</h2>
                  <p className="text-[0.68rem] text-[#8A7968] mt-0.5">Every great gift has a sweet moment</p>
                </div>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 w-full" style={{ scrollbarWidth: "none", scrollSnapType: "x mandatory" }}>
                {chocolates.map((c) => (
                  <div key={c.id} className="shrink-0" style={{ scrollSnapAlign: "start" }}>
                    <PickerCard selected={chocoId === c.id} onClick={() => setChocoId(c.id)}
                      bg={chocoBg[c.id]} image={c.image} label={c.label} sublabel={c.desc} price={c.price} />
                  </div>
                ))}
              </div>
              <div className="mt-3 pl-4 py-3 border-l-2 border-[#B5541E] bg-[#F9F5EF]">
                <p className="text-[0.8rem] text-[#4A2C1A]"><strong className="font-medium">{choco.label}</strong> — {choco.desc}</p>
              </div>
            </section>

            <Rule />

            {/* 04 — Always included */}
            <section>
              <div className="flex items-baseline gap-3 mb-6">
                <span className="font-display text-[3rem] font-light text-[#EDE5D8] leading-none select-none">04</span>
                <div>
                  <h2 className="font-display text-[1.2rem] text-[#1C1009] leading-tight">Always included</h2>
                  <p className="text-[0.68rem] text-[#8A7968] mt-0.5">In every hamper, no extra charge</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 border border-[#DDD4C4] divide-y sm:divide-y-0 sm:divide-x divide-[#DDD4C4]">
                {[
                  { title: "Roli Chawal", desc: "Traditional ceremonial roli & chawal — because no Raksha Bandhan is complete without it." },
                  { title: "Rakhi Card", desc: "A beautiful printed card with rakhi motifs. Included with every hamper, no customisation needed." },
                ].map(({ title, desc }) => (
                  <div key={title} className="p-5 bg-[#F9F5EF]">
                    <div className="w-5 h-px bg-[#B5541E] mb-4" />
                    <p className="font-display text-[1.05rem] text-[#1C1009] mb-2">{title}</p>
                    <p className="text-[0.76rem] text-[#8A7968] leading-[1.75]">{desc}</p>
                    <p className="text-[0.62rem] tracking-[0.1em] uppercase text-[#B5541E] mt-4 font-medium">Included free</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Mobile CTA */}
            <div className="lg:hidden pt-2 border-t border-[#EDE5D8] flex items-center gap-4">
              <div>
                <p className="text-[0.55rem] tracking-[0.14em] uppercase text-[#8A7968]">Total</p>
                <p className="font-display text-[1.6rem] text-[#B5541E] leading-none">₹{total}</p>
              </div>
              <button onClick={handleAdd} disabled={rakhis.length === 0}
                className="flex-1 text-[0.7rem] font-medium tracking-[0.12em] uppercase py-4 bg-[#1C1009] text-[#F9F5EF] hover:bg-[#B5541E] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                {rakhis.length === 0 ? "Add at least one rakhi" : "Add Hamper to Cart"}
              </button>
            </div>
          </div>

          {/* ── Right: sticky summary ── */}
          <div className="hidden lg:flex lg:flex-col lg:sticky lg:top-24 border border-[#DDD4C4] overflow-hidden">

            {/* Box banner */}
            <AnimatePresence mode="wait">
              <motion.div key={boxId} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }} className="relative h-36 overflow-hidden shrink-0">
                {box.image ? (
                  <Image src={cdnUrl(box.image)} alt={box.label} fill className="object-cover object-center" sizes="340px" priority />
                ) : (
                  <div className="absolute inset-0" style={{ background: boxBg[boxId] }} />
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[#F9F5EF]" />
                <div className="absolute top-3 left-4">
                  <span className="text-[0.52rem] tracking-[0.22em] uppercase text-white/80 bg-[#1C1009]/40 px-2 py-0.5">{box.label}</span>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="bg-[#F9F5EF] px-5 pb-0 flex flex-col flex-1 overflow-hidden">
              {/* Chocolate row */}
              <div className="flex items-center gap-3 py-3 border-b border-[#EDE5D8]">
                <div className="relative w-10 h-10 shrink-0 overflow-hidden bg-[#EDE5D8]">
                  {choco.image ? (
                    <Image src={cdnUrl(choco.image)} alt={choco.label} fill className="object-cover" sizes="40px" />
                  ) : (
                    <div className="w-full h-full" style={{ background: chocoBg[chocoId] }} />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[0.6rem] tracking-[0.1em] uppercase text-[#8A7968]">Chocolate</p>
                  <p className="text-[0.82rem] text-[#1C1009] font-medium truncate">{choco.label}</p>
                </div>
                <p className="text-[0.72rem] text-[#4A2C1A] shrink-0">{choco.price > 0 ? `₹${choco.price}` : "Free"}</p>
              </div>

              {/* Rakhis list */}
              <div className="flex-1 overflow-y-auto py-3" style={{ maxHeight: 220 }}>
                {rakhis.length === 0 ? (
                  <p className="text-[0.72rem] text-[#B5A898] italic text-center py-4">No rakhis added yet</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {rakhis.map((r, i) => {
                      const product = getProductById(r.productId);
                      if (!product) return null;
                      return (
                        <div key={i} className="flex items-center gap-2">
                          <div className="relative w-8 h-9 shrink-0 overflow-hidden bg-[#EDE5D8]">
                            {product.image && <Image src={cdnUrl(product.image)} alt={product.name} fill className="object-cover" sizes="32px" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[0.72rem] text-[#1C1009] truncate leading-tight">{product.name}</p>
                            {r.variant && <p className="text-[0.6rem] text-[#8A7968]">{r.variant}</p>}
                          </div>
                          <p className="text-[0.65rem] text-[#8A7968] shrink-0">×{r.quantity}</p>
                          <p className="text-[0.72rem] text-[#4A2C1A] font-medium shrink-0">₹{product.price * r.quantity}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Always included */}
              <div className="flex gap-3 py-3 border-t border-[#EDE5D8]">
                {["/images/rolichawal.jpg", "/images/card.jpg"].map((img, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <div className="relative w-8 h-8 shrink-0 overflow-hidden bg-[#EDE5D8]">
                      <Image src={cdnUrl(img)} alt="" fill className="object-cover" sizes="32px" />
                    </div>
                    <p className="text-[0.58rem] text-[#B5A898]">{i === 0 ? "Roli Chawal" : "Card"}</p>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="py-4 border-t border-[#EDE5D8] flex items-baseline justify-between">
                <span className="text-[0.58rem] tracking-[0.14em] uppercase text-[#8A7968]">Total</span>
                <span className="font-display text-[1.6rem] text-[#B5541E] leading-none">₹{total}</span>
              </div>
            </div>

            {/* CTA */}
            <button onClick={handleAdd} disabled={rakhis.length === 0}
              className="w-full text-[0.68rem] font-medium tracking-[0.14em] uppercase py-4 bg-[#1C1009] text-[#F9F5EF] hover:bg-[#B5541E] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              {rakhis.length === 0 ? "Add at least one rakhi" : `Add Hamper to Cart — ₹${total}`}
            </button>

            <Link href="/shop"
              className="flex items-center justify-center bg-[#F3EDE4] py-2.5 text-[0.64rem] tracking-[0.1em] uppercase text-[#B5541E] hover:bg-[#EDE5D8] transition-colors border border-t-0 border-[#DDD4C4]">
              Browse all rakhis
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default function HamperClient() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center"><p className="text-[#8A7968] text-sm animate-pulse">Loading…</p></div>}>
      <HamperBuilderInner />
    </Suspense>
  );
}
