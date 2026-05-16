"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { products, getProductById, type Product } from "@/lib/products";
import { boxes, chocolates, getBox, getChocolate, type BoxId, type ChocolateId } from "@/lib/hamperOptions";
import { useCart, type HamperRakhi } from "@/lib/cart";
import { cdnUrl } from "@/lib/cloudinary";

const boxBg: Record<BoxId, string> = {
  wooden: "linear-gradient(150deg, #A07248 0%, #7A5230 40%, #4A3018 100%)",
  jute:   "linear-gradient(150deg, #C8A87A 0%, #9E8050 45%, #6A4E28 100%)",
  velvet: "linear-gradient(150deg, #3A1550 0%, #250D38 55%, #130520 100%)",
};

const chocoBg: Record<ChocolateId, string> = {
  none:      "linear-gradient(150deg, #EDE5D8 0%, #D4C8B0 100%)",
  dairymilk: "linear-gradient(150deg, #5C2080 0%, #3D1155 55%, #1E0828 100%)",
  kitkat:    "linear-gradient(150deg, #D82828 0%, #A01818 55%, #620808 100%)",
  ferrero:   "linear-gradient(150deg, #C09020 0%, #8A6010 55%, #483008 100%)",
};

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
      className={`relative shrink-0 w-44 md:w-52 overflow-hidden cursor-pointer text-left transition-shadow duration-300 ${
        selected ? "shadow-[0_16px_40px_rgba(0,0,0,0.18)]" : "shadow-[0_4px_16px_rgba(0,0,0,0.12)] hover:shadow-[0_10px_32px_rgba(0,0,0,0.2)]"
      }`}
      style={{ background: image ? undefined : bg }}
    >
      <div className="relative h-44 md:h-52">
        {image ? (
          <Image src={cdnUrl(image)} alt={label} fill className="object-cover" sizes="208px" />
        ) : (
          <div className="w-full h-full" style={{ background: bg }} />
        )}
      </div>
      <div className="px-4 py-3.5 bg-[#1C1009]/80 border-t border-white/10">
        <p className="font-display text-[0.95rem] text-[#F9F5EF] leading-tight">{label}</p>
        <p className="text-[0.6rem] tracking-[0.06em] text-[#B5A898] mt-0.5 leading-snug">{sublabel}</p>
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

function RakhiPickerCard({ product, qty, onAdd, onRemove, selectedVariant, onVariant }: {
  product: Product;
  qty: number;
  onAdd: (variant?: string) => void;
  onRemove: () => void;
  selectedVariant?: string;
  onVariant: (v: string) => void;
}) {
  const isSelected = qty > 0;
  return (
    <motion.div
      layout
      className={`relative overflow-hidden bg-white transition-shadow duration-300 ${
        isSelected
          ? "shadow-[0_6px_24px_rgba(181,84,30,0.18)] ring-1 ring-[#B5541E]"
          : "shadow-[0_2px_8px_rgba(0,0,0,0.07)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.12)]"
      }`}
    >
      {/* Image */}
      <div className="relative overflow-hidden bg-[#EDE5D8]" style={{ paddingBottom: "100%" }}>
        {product.image && (
          <Image src={cdnUrl(product.image)} alt={product.name} fill className="object-cover transition-transform duration-500 hover:scale-105" sizes="240px" />
        )}
        {/* Selected overlay badge */}
        <AnimatePresence>
          {isSelected && (
            <motion.div
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              className="absolute top-2 right-2 w-7 h-7 bg-[#B5541E] rounded-full flex items-center justify-center shadow-md z-10"
            >
              <span className="text-white text-[0.72rem] font-bold leading-none">{qty}</span>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Tag */}
        {product.tag && !isSelected && (
          <span className="absolute top-2 left-2 text-[0.52rem] tracking-[0.12em] uppercase bg-[#1C1009] text-[#F9F5EF] px-1.5 py-0.5">
            {product.tag}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="font-display text-[0.88rem] text-[#1C1009] leading-tight">{product.name}</p>
        <p className="text-[0.68rem] text-[#8A7968] mt-0.5 font-medium">₹{product.price}</p>

        {/* Variant swatches */}
        {product.variants && product.variants.length > 0 && (
          <div className="flex gap-1.5 mt-2">
            {product.variants.map((v) => (
              <button
                key={v.value}
                onClick={() => onVariant(v.value)}
                className={`w-4.5 h-4.5 rounded-full border-[1.5px] transition-all duration-150 ${
                  selectedVariant === v.value ? "border-[#B5541E] scale-115 ring-1 ring-[#B5541E]/30" : "border-[#DDD4C4] hover:border-[#B5A898]"
                }`}
                style={{ backgroundColor: v.color, width: 18, height: 18 }}
                title={v.label}
              />
            ))}
          </div>
        )}

        {/* Controls */}
        <div className="mt-3">
          {qty === 0 ? (
            <button
              onClick={() => onAdd(selectedVariant ?? product.variants?.[0]?.value)}
              className="w-full text-[0.6rem] tracking-[0.12em] uppercase py-2 border border-[#1C1009] text-[#1C1009] hover:bg-[#1C1009] hover:text-[#F9F5EF] transition-colors duration-200"
            >
              + Add
            </button>
          ) : (
            <div className="flex items-center border border-[#B5541E] overflow-hidden">
              <button
                onClick={onRemove}
                className="flex-1 py-2 text-[#8A7968] hover:bg-[#FBF7F2] transition-colors text-base leading-none flex items-center justify-center"
              >
                −
              </button>
              <span className="w-8 text-center text-[0.85rem] font-medium text-[#1C1009] border-x border-[#B5541E]/40">{qty}</span>
              <button
                onClick={() => onAdd(selectedVariant)}
                className="flex-1 py-2 text-[#8A7968] hover:bg-[#FBF7F2] transition-colors text-base leading-none flex items-center justify-center"
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

const Rule = () => <div className="h-px bg-[#EDE5D8] w-full" />;

function HamperBuilderInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addHamper } = useCart();

  const [boxId, setBoxId] = useState<BoxId>("wooden");
  const [chocoId, setChocoId] = useState<ChocolateId>("dairymilk");
  const [rakhis, setRakhis] = useState<HamperRakhi[]>([]);
  const [variantMap, setVariantMap] = useState<Record<string, string>>({});
  const [catFilter, setCatFilter] = useState<"all" | "single" | "combo" | "kids">("all");
  const [search, setSearch] = useState("");
  const [added, setAdded] = useState(false);

  // Pre-select rakhi if navigated from product detail page
  useEffect(() => {
    const preselect = searchParams.get("rakhi");
    if (!preselect) return;
    const product = getProductById(preselect);
    if (!product) return;
    const variant = product.variants?.[0]?.value;
    setRakhis([{ productId: preselect, quantity: 1, variant }]);
    if (variant) setVariantMap({ [preselect]: variant });
    // Scroll to rakhi section after a brief delay
    setTimeout(() => {
      document.getElementById("rakhi-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 400);
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
    // If product already in hamper, update its variant
    setRakhis((prev) => prev.map((r) => r.productId === productId ? { ...r, variant } : r));
  };

  const rakhiTotal = rakhis.reduce((s, r) => {
    const product = getProductById(r.productId);
    return s + (product?.price ?? 0) * r.quantity;
  }, 0);
  const total = box.price + choco.price + rakhiTotal;
  const totalRakhiCount = rakhis.reduce((s, r) => s + r.quantity, 0);

  const filteredProducts = products.filter((p) => {
    const matchesCat = catFilter === "all" || p.category === catFilter;
    const q = search.trim().toLowerCase();
    const matchesSearch = !q || p.name.toLowerCase().includes(q) || p.category.includes(q);
    return matchesCat && matchesSearch;
  });

  const STARTERS: { label: string; desc: string; ids: string[] }[] = [
    { label: "Two Brothers", desc: "A classic duo", ids: ["sr-07", "sr-12"] },
    { label: "Bhaiya & Bhabhi", desc: "With lumba set", ids: ["cb-01"] },
    { label: "Family Pack", desc: "Bhai + kids", ids: ["sr-12", "kd-01", "kd-02"] },
  ];

  const applyStarter = (ids: string[]) => {
    const newRakhis: HamperRakhi[] = ids.map((id) => {
      const p = getProductById(id)!;
      const variant = p.variants?.[0]?.value;
      return { productId: id, quantity: 1, variant };
    });
    const newVariantMap: Record<string, string> = {};
    newRakhis.forEach((r) => { if (r.variant) newVariantMap[r.productId] = r.variant; });
    setRakhis(newRakhis);
    setVariantMap(newVariantMap);
  };

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
    <div className="max-w-[1300px] mx-auto px-4 md:px-10 py-8 md:py-14">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-10 md:gap-16 items-start">

        {/* ── Left ── */}
        <div className="flex flex-col gap-14">

          {/* 01 — Box */}
          <section>
            <div className="flex items-baseline gap-3 mb-6">
              <span className="font-display text-[3rem] font-light text-[#EDE5D8] leading-none select-none">01</span>
              <div>
                <h2 className="font-display text-[1.2rem] text-[#1C1009] leading-tight">Choose your box</h2>
                <p className="text-[0.68rem] text-[#8A7968] mt-0.5">The first thing they&apos;ll unwrap</p>
              </div>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4" style={{ scrollbarWidth: "none" }}>
              {boxes.map((b) => (
                <PickerCard key={b.id} selected={boxId === b.id} onClick={() => setBoxId(b.id)}
                  bg={boxBg[b.id]} image={b.image} label={b.label} sublabel={b.desc} price={b.price} />
              ))}
            </div>
            <div className="mt-3 pl-4 py-3 border-l-2 border-[#B5541E] bg-[#F9F5EF]">
              <p className="text-[0.8rem] text-[#4A2C1A]"><strong className="font-medium">{box.label}</strong> — {box.desc}</p>
            </div>
          </section>

          <Rule />

          {/* 02 — Chocolate */}
          <section>
            <div className="flex items-baseline gap-3 mb-6">
              <span className="font-display text-[3rem] font-light text-[#EDE5D8] leading-none select-none">02</span>
              <div>
                <h2 className="font-display text-[1.2rem] text-[#1C1009] leading-tight">Add a chocolate</h2>
                <p className="text-[0.68rem] text-[#8A7968] mt-0.5">Every great gift has a sweet moment</p>
              </div>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4" style={{ scrollbarWidth: "none" }}>
              {chocolates.map((c) => (
                <PickerCard key={c.id} selected={chocoId === c.id} onClick={() => setChocoId(c.id)}
                  bg={chocoBg[c.id]} image={c.image} label={c.label} sublabel={c.desc} price={c.price} />
              ))}
            </div>
            <div className="mt-3 pl-4 py-3 border-l-2 border-[#B5541E] bg-[#F9F5EF]">
              <p className="text-[0.8rem] text-[#4A2C1A]"><strong className="font-medium">{choco.label}</strong> — {choco.desc}</p>
            </div>
          </section>

          <Rule />

          {/* 03 — Rakhis */}
          <section id="rakhi-section">
            <div className="flex items-baseline gap-3 mb-6">
              <span className="font-display text-[3rem] font-light text-[#EDE5D8] leading-none select-none">03</span>
              <div>
                <h2 className="font-display text-[1.2rem] text-[#1C1009] leading-tight">Add rakhis</h2>
                <p className="text-[0.68rem] text-[#8A7968] mt-0.5">Mix and match — add as many as you like</p>
              </div>
            </div>

            {/* Starter combos */}
            <div className="mb-6">
              <p className="text-[0.58rem] tracking-[0.18em] uppercase text-[#8A7968] mb-3">Quick start</p>
              <div className="flex gap-2 flex-wrap">
                {STARTERS.map((s) => (
                  <button
                    key={s.label}
                    onClick={() => applyStarter(s.ids)}
                    className="group flex flex-col items-start px-4 py-2.5 border border-[#DDD4C4] bg-white hover:border-[#B5541E] hover:bg-[#FBF7F2] transition-colors text-left"
                  >
                    <span className="text-[0.72rem] font-medium text-[#1C1009] group-hover:text-[#B5541E] transition-colors">{s.label}</span>
                    <span className="text-[0.6rem] text-[#8A7968] mt-0.5">{s.desc}</span>
                  </button>
                ))}
                {rakhis.length > 0 && (
                  <button
                    onClick={() => { setRakhis([]); setVariantMap({}); }}
                    className="flex flex-col items-start px-4 py-2.5 border border-[#EDE5D8] text-left hover:border-[#1C1009] transition-colors"
                  >
                    <span className="text-[0.72rem] font-medium text-[#8A7968]">Clear all</span>
                    <span className="text-[0.6rem] text-[#B5A898] mt-0.5">Start fresh</span>
                  </button>
                )}
              </div>
            </div>

            {/* Search + filter row */}
            <div className="flex gap-2 mb-4 flex-wrap sm:flex-nowrap">
              <div className="relative flex-1 min-w-[180px]">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#B5A898]" width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.4"/>
                  <path d="M9.5 9.5l2.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
                <input
                  type="text"
                  placeholder="Search rakhis…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border border-[#DDD4C4] bg-white text-[0.82rem] text-[#1C1009] placeholder:text-[#B5A898] outline-none focus:border-[#B5541E] transition-colors"
                />
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {(["all", "single", "combo", "kids"] as const).map((cat) => (
                  <button key={cat} onClick={() => setCatFilter(cat)}
                    className={`text-[0.6rem] tracking-[0.08em] uppercase px-3 py-2 border transition-colors whitespace-nowrap ${
                      catFilter === cat ? "border-[#1C1009] bg-[#1C1009] text-[#F9F5EF]" : "border-[#DDD4C4] text-[#8A7968] hover:border-[#1C1009]"
                    }`}>
                    {cat === "all" ? "All" : cat === "single" ? "Single" : cat === "combo" ? "Sets" : "Kids"}
                  </button>
                ))}
              </div>
            </div>

            {/* Compact list */}
            <div className="border border-[#DDD4C4] divide-y divide-[#EDE5D8] bg-white">
              {filteredProducts.length === 0 && (
                <p className="py-10 text-center text-[0.8rem] text-[#B5A898]">No rakhis found</p>
              )}
              {filteredProducts.map((product) => {
                const activeVariant = variantMap[product.id] ?? product.variants?.[0]?.value;
                const qty = getRakhiQty(product.id, product.variants ? activeVariant : undefined);
                const isSelected = qty > 0;
                return (
                  <motion.div
                    key={product.id}
                    layout
                    className={`flex items-center gap-3 px-3 py-2.5 transition-colors ${isSelected ? "bg-[#FBF7F2]" : "hover:bg-[#FDFAF7]"}`}
                  >
                    {/* Thumb */}
                    <div className="relative w-12 h-12 shrink-0 overflow-hidden bg-[#EDE5D8]">
                      {product.image && (
                        <Image src={cdnUrl(product.image)} alt={product.name} fill className="object-cover" sizes="48px" />
                      )}
                    </div>

                    {/* Name + meta */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={`text-[0.82rem] font-medium leading-tight ${isSelected ? "text-[#B5541E]" : "text-[#1C1009]"}`}>
                          {product.name}
                        </p>
                        {product.tag && (
                          <span className="text-[0.5rem] tracking-[0.1em] uppercase bg-[#1C1009] text-[#F9F5EF] px-1.5 py-0.5 leading-none">
                            {product.tag}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[0.65rem] text-[#8A7968]">₹{product.price}</span>
                        <span className="text-[#DDD4C4]">·</span>
                        <span className="text-[0.58rem] tracking-[0.06em] uppercase text-[#B5A898]">
                          {product.category === "single" ? "Single" : product.category === "combo" ? "Set" : "Kids"}
                        </span>
                        {/* Variant swatches inline */}
                        {product.variants && product.variants.length > 0 && (
                          <>
                            <span className="text-[#DDD4C4]">·</span>
                            <div className="flex gap-1">
                              {product.variants.map((v) => (
                                <button
                                  key={v.value}
                                  onClick={() => setVariant(product.id, v.value)}
                                  title={v.label}
                                  className={`rounded-full border transition-all ${activeVariant === v.value ? "border-[#B5541E] scale-110" : "border-[#DDD4C4]"}`}
                                  style={{ backgroundColor: v.color, width: 12, height: 12 }}
                                />
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="shrink-0">
                      {qty === 0 ? (
                        <button
                          onClick={() => addRakhi(product.id, product.variants ? (activeVariant) : undefined)}
                          className="text-[0.6rem] tracking-[0.1em] uppercase px-4 py-2 border border-[#1C1009] text-[#1C1009] hover:bg-[#1C1009] hover:text-[#F9F5EF] transition-colors"
                        >
                          + Add
                        </button>
                      ) : (
                        <div className="flex items-center border border-[#B5541E]">
                          <button
                            onClick={() => removeRakhi(product.id, product.variants ? activeVariant : undefined)}
                            className="w-8 h-8 flex items-center justify-center text-[#8A7968] hover:bg-[#FBF7F2] transition-colors"
                          >−</button>
                          <span className="w-6 text-center text-[0.82rem] font-medium text-[#1C1009]">{qty}</span>
                          <button
                            onClick={() => addRakhi(product.id, product.variants ? activeVariant : undefined)}
                            className="w-8 h-8 flex items-center justify-center text-[#8A7968] hover:bg-[#FBF7F2] transition-colors"
                          >+</button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
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
  );
}

export default function HamperClient() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center"><p className="text-[#8A7968] text-sm animate-pulse">Loading…</p></div>}>
      <HamperBuilderInner />
    </Suspense>
  );
}
