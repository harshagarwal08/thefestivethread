"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { getProductById } from "@/lib/products";
import { boxes, chocolates, getBox, getChocolate, type BoxId, type ChocolateId } from "@/lib/hamperOptions";
import { useCart } from "@/lib/cart";
import { cdnUrl } from "@/lib/cloudinary";

/* ─── Box visual backgrounds ─── */
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

/* ─── SVG illustrations for cards ─── */
const BoxIllustration = ({ id }: { id: BoxId }) => {
  if (id === "wooden") return (
    <svg viewBox="0 0 100 100" fill="none" className="w-20 h-20">
      <rect x="15" y="42" width="70" height="46" rx="2" stroke="#E8C87A" strokeWidth="2.5"/>
      <path d="M15 55h70M15 68h70" stroke="#E8C87A" strokeWidth="1.5" strokeOpacity="0.5"/>
      <path d="M15 42C15 32 28 20 50 20C72 20 85 32 85 42" stroke="#E8C87A" strokeWidth="2.5"/>
      <path d="M30 20L36 42M70 20L64 42" stroke="#E8C87A" strokeWidth="1.5" strokeOpacity="0.5"/>
      <circle cx="50" cy="49" r="5" stroke="#E8D4A0" strokeWidth="2"/>
      <path d="M46 49h8M50 45v8" stroke="#E8D4A0" strokeWidth="2"/>
    </svg>
  );
  if (id === "jute") return (
    <svg viewBox="0 0 100 100" fill="none" className="w-20 h-20">
      <path d="M30 24Q30 12 50 12Q70 12 70 24L76 82Q76 88 70 88H30Q24 88 24 82Z" stroke="#E8D5A8" strokeWidth="2.5"/>
      <path d="M30 24Q40 36 50 36Q60 36 70 24" stroke="#E8D5A8" strokeWidth="2"/>
      <line x1="38" y1="36" x2="35" y2="82" stroke="#E8D5A8" strokeWidth="1.5" strokeOpacity="0.5"/>
      <line x1="50" y1="36" x2="50" y2="82" stroke="#E8D5A8" strokeWidth="1.5" strokeOpacity="0.5"/>
      <line x1="62" y1="36" x2="65" y2="82" stroke="#E8D5A8" strokeWidth="1.5" strokeOpacity="0.5"/>
      <path d="M34 58h32M33 70h34" stroke="#E8D5A8" strokeWidth="1.5" strokeOpacity="0.4"/>
    </svg>
  );
  return (
    <svg viewBox="0 0 100 100" fill="none" className="w-20 h-20">
      <rect x="14" y="42" width="72" height="46" rx="2" stroke="#D0A0F8" strokeWidth="2.5"/>
      <path d="M14 42L32 20H68L86 42" stroke="#D0A0F8" strokeWidth="2.5"/>
      <path d="M32 20L40 42M68 20L60 42" stroke="#D0A0F8" strokeWidth="1.5" strokeOpacity="0.6"/>
      <rect x="40" y="42" width="20" height="12" rx="1.5" stroke="#E8C8FF" strokeWidth="2"/>
      <path d="M14 56h72" stroke="#D0A0F8" strokeWidth="1" strokeOpacity="0.3"/>
    </svg>
  );
};

const ChocoIllustration = ({ id }: { id: ChocolateId }) => {
  if (id === "none") return (
    <svg viewBox="0 0 100 100" fill="none" className="w-16 h-16">
      <circle cx="50" cy="50" r="28" stroke="#8A7968" strokeWidth="1.5" strokeDasharray="5 4"/>
      <path d="M36 50h28M50 36v28" stroke="#8A7968" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.6"/>
    </svg>
  );
  if (id === "dairymilk") return (
    <svg viewBox="0 0 100 100" fill="none" className="w-20 h-20">
      <rect x="18" y="28" width="64" height="44" rx="4" stroke="#C890F0" strokeWidth="2.5"/>
      <path d="M18 48h64M40 28v44M60 28v44" stroke="#C890F0" strokeWidth="1.5" strokeOpacity="0.5"/>
      <text x="50" y="22" fill="#C890F0" fontSize="7" textAnchor="middle" fontFamily="Georgia, serif" letterSpacing="1" opacity="0.9">DAIRY MILK</text>
    </svg>
  );
  if (id === "kitkat") return (
    <svg viewBox="0 0 100 100" fill="none" className="w-20 h-20">
      <rect x="14" y="30" width="18" height="40" rx="3" stroke="#FFB0B0" strokeWidth="2.5"/>
      <rect x="36" y="30" width="18" height="40" rx="3" stroke="#FFB0B0" strokeWidth="2.5"/>
      <rect x="58" y="30" width="18" height="40" rx="3" stroke="#FFB0B0" strokeWidth="2.5"/>
      <text x="50" y="22" fill="#FFB0B0" fontSize="9" textAnchor="middle" fontFamily="Georgia, serif" letterSpacing="4" opacity="0.9">KIT KAT</text>
    </svg>
  );
  return (
    <svg viewBox="0 0 100 100" fill="none" className="w-20 h-20">
      <circle cx="30" cy="58" r="18" stroke="#E8C040" strokeWidth="2.5"/>
      <circle cx="30" cy="58" r="11" stroke="#E8C040" strokeWidth="1.5" strokeOpacity="0.5"/>
      <circle cx="70" cy="58" r="18" stroke="#E8C040" strokeWidth="2.5"/>
      <circle cx="70" cy="58" r="11" stroke="#E8C040" strokeWidth="1.5" strokeOpacity="0.5"/>
      <circle cx="50" cy="34" r="18" stroke="#E8C040" strokeWidth="2.5"/>
      <circle cx="50" cy="34" r="11" stroke="#E8C040" strokeWidth="1.5" strokeOpacity="0.5"/>
    </svg>
  );
};

/* ─── Picker carousel card ─── */
function PickerCard({
  selected, onClick, bg, illustration, image, label, sublabel, price,
}: {
  selected: boolean; onClick: () => void; bg: string;
  illustration: React.ReactNode; image?: string; label: string; sublabel: string; price: number;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className={`relative shrink-0 w-44 md:w-52 overflow-hidden cursor-pointer text-left transition-shadow duration-300 ${
        selected
          ? "shadow-[0_16px_40px_rgba(0,0,0,0.18)]"
          : "shadow-[0_4px_16px_rgba(0,0,0,0.12)] hover:shadow-[0_10px_32px_rgba(0,0,0,0.2)]"
      }`}
      style={{ background: image ? undefined : bg }}
    >
      <div className="relative h-44 md:h-52">
        {image ? (
          <Image src={cdnUrl(image)} alt={label} fill className="object-cover" sizes="208px" />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: bg }}>
            {illustration}
          </div>
        )}
      </div>
      <div className="px-4 py-3.5 bg-[#1C1009]/80 border-t border-white/10">
        <p className="font-display text-[0.95rem] text-[#F9F5EF] leading-tight">{label}</p>
        <p className="text-[0.6rem] tracking-[0.06em] text-[#B5A898] mt-0.5 leading-snug">{sublabel}</p>
        <p className="text-[0.7rem] font-medium text-[#E8B84B] mt-1.5">{price === 0 ? "Free" : `+₹${price}`}</p>
      </div>
      {/* Inner border overlay — never clipped by parent overflow */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 border-2 border-[#B5541E] pointer-events-none z-20"
          />
        )}
      </AnimatePresence>
      {/* Checkmark badge */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
            className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-[#B5541E] flex items-center justify-center z-20"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

/* ─── Thin rule divider ─── */
const Rule = () => <div className="h-px bg-[#EDE5D8] w-full" />;

/* ─── Main ─── */
export default function HamperClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addItem } = useCart();

  const rakhiId = searchParams.get("rakhi") ?? "";
  const rakhi = rakhiId ? (getProductById(rakhiId) ?? null) : null;
  const invalidRakhi = rakhiId !== "" && rakhi === null;

  const [boxId, setBoxId] = useState<BoxId>("wooden");
  const [chocoId, setChocoId] = useState<ChocolateId>("dairymilk");
  const [added, setAdded] = useState(false);

  const box = getBox(boxId);
  const choco = getChocolate(chocoId);
  const total = (rakhi?.price ?? 0) + box.price + choco.price;

  const handleAdd = () => {
    if (!rakhi) return;
    addItem(rakhi.id, { boxId, chocolateId: chocoId });
    setAdded(true);
  };

  if (invalidRakhi) {
    return (
      <div className="max-w-[520px] mx-auto px-4 md:px-10 py-20 text-center flex flex-col items-center gap-5">
        <div className="w-8 h-px bg-[#C9972C]/60 mx-auto" />
        <h2 className="font-display text-[1.8rem] text-[#1C1009]">Rakhi not found</h2>
        <p className="text-[#8A7968] text-[0.88rem] max-w-[300px] leading-[1.8]">
          The rakhi you selected is no longer available. Browse our collection to pick one.
        </p>
        <Link href="/shop"
          className="text-[0.7rem] tracking-[0.12em] uppercase px-7 py-3.5 bg-[#1C1009] text-[#F9F5EF] hover:bg-[#B5541E] transition-colors">
          Browse Rakhis
        </Link>
      </div>
    );
  }

  if (added) {
    return (
      <div className="max-w-[520px] mx-auto px-4 md:px-10 py-20 text-center flex flex-col items-center gap-5">
        <div className="w-8 h-px bg-[#C9972C]/60 mx-auto" />
        <h2 className="font-display text-[1.8rem] text-[#1C1009]">Added to cart</h2>
        <p className="text-[#8A7968] text-[0.88rem] max-w-[300px] leading-[1.8]">
          {rakhi?.name} with {box.label}{choco.id !== "none" ? ` and ${choco.label}` : ""} is in your cart.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 mt-2">
          <button onClick={() => router.push("/cart")}
            className="text-[0.7rem] tracking-[0.12em] uppercase px-7 py-3.5 bg-[#1C1009] text-[#F9F5EF] hover:bg-[#B5541E] transition-colors">
            View Cart & Checkout
          </button>
          <Link href="/shop"
            className="text-[0.7rem] tracking-[0.12em] uppercase px-7 py-3.5 border border-[#DDD4C4] text-[#8A7968] hover:border-[#1C1009] hover:text-[#1C1009] transition-colors text-center">
            Add More Rakhis
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1300px] mx-auto px-4 md:px-10 py-8 md:py-14">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-10 md:gap-16 items-start">

        {/* ── Left: Config sections ── */}
        <div className="flex flex-col gap-14">

          {/* Rakhi row */}
          {rakhi && (
            <div className="flex items-center gap-4 pb-6 border-b border-[#EDE5D8]">
              <div className="relative w-12 h-14 shrink-0 overflow-hidden bg-[#EDE5D8]">
                {rakhi.image && <Image src={cdnUrl(rakhi.image)} alt={rakhi.name} fill className="object-cover" sizes="48px" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[0.55rem] tracking-[0.16em] uppercase text-[#B5541E] mb-0.5">Your rakhi</p>
                <p className="font-display text-[1.05rem] text-[#1C1009] truncate leading-tight">{rakhi.name}</p>
                <p className="text-[0.75rem] text-[#8A7968] mt-0.5">₹{rakhi.price}</p>
              </div>
              <Link href="/shop"
                className="shrink-0 text-[0.58rem] tracking-[0.1em] uppercase text-[#8A7968] hover:text-[#B5541E] border border-[#DDD4C4] hover:border-[#B5541E] px-3 py-1.5 transition-colors">
                Change
              </Link>
            </div>
          )}

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
                <PickerCard
                  key={b.id} selected={boxId === b.id} onClick={() => setBoxId(b.id)}
                  bg={boxBg[b.id]} illustration={<BoxIllustration id={b.id} />} image={b.image}
                  label={b.label} sublabel={b.desc} price={b.price}
                />
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
                <PickerCard
                  key={c.id} selected={chocoId === c.id} onClick={() => setChocoId(c.id)}
                  bg={chocoBg[c.id]} illustration={<ChocoIllustration id={c.id} />} image={c.image}
                  label={c.label} sublabel={c.desc} price={c.price}
                />
              ))}
            </div>
            <div className="mt-3 pl-4 py-3 border-l-2 border-[#B5541E] bg-[#F9F5EF]">
              <p className="text-[0.8rem] text-[#4A2C1A]"><strong className="font-medium">{choco.label}</strong> — {choco.desc}</p>
            </div>
          </section>

          <Rule />

          {/* 03 — Always included */}
          <section>
            <div className="flex items-baseline gap-3 mb-6">
              <span className="font-display text-[3rem] font-light text-[#EDE5D8] leading-none select-none">03</span>
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
            <button
              onClick={handleAdd}
              disabled={!rakhi}
              className="flex-1 text-[0.7rem] font-medium tracking-[0.12em] uppercase py-4 bg-[#1C1009] text-[#F9F5EF] hover:bg-[#B5541E] transition-colors disabled:opacity-40">
              Add Hamper to Cart
            </button>
          </div>
        </div>

        {/* ── Right: sticky summary ── */}
        <div className="hidden lg:block lg:sticky lg:top-24 border border-[#DDD4C4] overflow-hidden">

          {/* ── Box banner ── */}
          <AnimatePresence mode="wait">
            <motion.div
              key={boxId}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="relative h-40 overflow-hidden"
            >
              {box.image ? (
                <Image src={cdnUrl(box.image)} alt={box.label} fill className="object-cover object-center" sizes="340px" priority />
              ) : (
                <div className="absolute inset-0" style={{ background: boxBg[boxId] }}>
                  <div className="absolute inset-0 flex items-center justify-center opacity-10 scale-[2.5] pointer-events-none">
                    <BoxIllustration id={boxId} />
                  </div>
                </div>
              )}
              {/* gradient fade to cream at bottom so rakhi card bleeds in */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[#F9F5EF]" />
              {/* Box label */}
              <div className="absolute top-3 left-4">
                <span className="text-[0.52rem] tracking-[0.22em] uppercase text-white/80 font-medium bg-[#1C1009]/40 px-2 py-0.5">
                  {box.label}
                </span>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* ── Rakhi card — floats up, overlapping the box banner ── */}
          <div className="bg-[#F9F5EF] px-5 -mt-10 relative z-10">
            <div className="flex gap-4 items-start">
              {/* Rakhi photo */}
              <div className="relative w-20 h-24 shrink-0 overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.18)] ring-1 ring-[#DDD4C4]">
                {rakhi?.image ? (
                  <Image src={cdnUrl(rakhi.image)} alt={rakhi.name} fill className="object-cover" sizes="80px" />
                ) : (
                  <div className="w-full h-full bg-[#EDE5D8] flex flex-col items-center justify-center gap-1.5">
                    <div className="w-4 h-px bg-[#C9972C]/50" />
                    <p className="text-[0.5rem] tracking-widest italic text-[#8A7968] text-center px-1">Select rakhi</p>
                  </div>
                )}
              </div>
              {/* Rakhi info */}
              <div className="pt-12 min-w-0 flex-1">
                <p className="text-[0.52rem] tracking-[0.16em] uppercase text-[#B5541E] mb-0.5">Your rakhi</p>
                <p className="font-display text-[1rem] text-[#1C1009] leading-tight truncate">
                  {rakhi?.name ?? <span className="text-[#B5A898] italic text-[0.85rem]">None selected</span>}
                </p>
                {rakhi && <p className="text-[0.72rem] text-[#8A7968] mt-0.5">₹{rakhi.price}</p>}
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-[#EDE5D8] mt-4 mb-4" />

            {/* ── Accessories row ── */}
            <div className="flex gap-3">
              {/* Chocolate */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={chocoId}
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 flex flex-col gap-1.5"
                >
                  <div className="relative h-14 overflow-hidden bg-[#EDE5D8]">
                    {choco.image ? (
                      <Image src={cdnUrl(choco.image)} alt={choco.label} fill className="object-cover" sizes="90px" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ background: chocoBg[chocoId] }}>
                        <ChocoIllustration id={chocoId} />
                      </div>
                    )}
                  </div>
                  <p className="text-[0.52rem] tracking-[0.1em] uppercase text-[#8A7968] truncate">
                    {chocoId === "none" ? "No chocolate" : choco.label}
                  </p>
                  <p className="text-[0.6rem] font-medium text-[#4A2C1A] -mt-0.5">
                    {choco.price > 0 ? `+₹${choco.price}` : "—"}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Roli Chawal */}
              <div className="flex-1 flex flex-col gap-1.5">
                <div className="relative h-14 overflow-hidden bg-[#EDE5D8]">
                  <Image src={cdnUrl("/images/rolichawal.jpg")} alt="Roli Chawal" fill className="object-cover" sizes="90px" />
                </div>
                <p className="text-[0.52rem] tracking-[0.1em] uppercase text-[#8A7968]">Roli Chawal</p>
                <p className="text-[0.6rem] font-medium text-[#B5A898] -mt-0.5">Included</p>
              </div>

              {/* Card */}
              <div className="flex-1 flex flex-col gap-1.5">
                <div className="relative h-14 overflow-hidden bg-[#EDE5D8]">
                  <Image src={cdnUrl("/images/card.jpg")} alt="Rakhi Card" fill className="object-cover" sizes="90px" />
                </div>
                <p className="text-[0.52rem] tracking-[0.1em] uppercase text-[#8A7968]">Rakhi Card</p>
                <p className="text-[0.6rem] font-medium text-[#B5A898] -mt-0.5">Included</p>
              </div>
            </div>

            {/* ── Total ── */}
            <div className="mt-5 pt-4 pb-5 border-t border-[#EDE5D8] flex items-baseline justify-between">
              <span className="text-[0.58rem] tracking-[0.14em] uppercase text-[#8A7968]">Total</span>
              <span className="font-display text-[1.6rem] text-[#B5541E] leading-none">₹{total}</span>
            </div>
          </div>

          {/* ── CTA ── */}
          <button
            onClick={handleAdd}
            disabled={!rakhi}
            className="w-full text-[0.68rem] font-medium tracking-[0.14em] uppercase py-4 bg-[#1C1009] text-[#F9F5EF] hover:bg-[#B5541E] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {rakhi ? "Add Hamper to Cart" : "Select a Rakhi First"}
          </button>

          {!rakhi && (
            <Link href="/shop"
              className="flex items-center justify-center bg-[#F3EDE4] py-2.5 text-[0.64rem] tracking-[0.1em] uppercase text-[#B5541E] hover:bg-[#EDE5D8] transition-colors border border-t-0 border-[#DDD4C4]">
              Browse rakhis
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
