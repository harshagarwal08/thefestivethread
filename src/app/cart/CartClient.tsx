"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart, itemKey, type HamperOptions } from "@/lib/cart";
import { getProductById, type ProductVariant } from "@/lib/products";
import { boxes, chocolates, getBox, getChocolate, type BoxId, type ChocolateId } from "@/lib/hamperOptions";

const INSTAMOJO_URL = process.env.NEXT_PUBLIC_INSTAMOJO_URL ?? "https://www.instamojo.com/@thefestivethread";

interface Address {
  name: string;
  phone: string;
  email: string;
  line1: string;
  city: string;
  state: string;
  pincode: string;
  notes: string;
}

const emptyAddress: Address = { name: "", phone: "", email: "", line1: "", city: "", state: "", pincode: "", notes: "" };

function HamperPicker({ current, onSave, onRemove }: {
  current?: HamperOptions;
  onSave: (h: HamperOptions) => void;
  onRemove: () => void;
}) {
  const [boxId, setBoxId] = useState<BoxId>(current?.boxId ?? "wooden");
  const [chocoId, setChocoId] = useState<ChocolateId>(current?.chocolateId ?? "none");

  return (
    <div className="mt-3 p-4 bg-[#FBF7F2] border border-[#DDD4C4]">
      <p className="text-[0.6rem] tracking-[0.16em] uppercase font-medium text-[#B5541E] mb-3">Hamper Options</p>

      <p className="text-[0.65rem] tracking-[0.1em] uppercase text-[#8A7968] mb-1.5">Box</p>
      <div className="flex flex-wrap gap-2 mb-3">
        {boxes.map((b) => (
          <button
            key={b.id}
            onClick={() => setBoxId(b.id)}
            className={`text-[0.68rem] px-3 py-1.5 border transition-colors ${
              boxId === b.id ? "border-[#B5541E] bg-[#B5541E] text-[#F9F5EF]" : "border-[#DDD4C4] text-[#4A2C1A] hover:border-[#B5541E]"
            }`}
          >
            {b.label} +₹{b.price}
          </button>
        ))}
      </div>

      <p className="text-[0.65rem] tracking-[0.1em] uppercase text-[#8A7968] mb-1.5">Chocolate</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {chocolates.map((c) => (
          <button
            key={c.id}
            onClick={() => setChocoId(c.id)}
            className={`text-[0.68rem] px-3 py-1.5 border transition-colors ${
              chocoId === c.id ? "border-[#B5541E] bg-[#B5541E] text-[#F9F5EF]" : "border-[#DDD4C4] text-[#4A2C1A] hover:border-[#B5541E]"
            }`}
          >
            {c.label} {c.price > 0 ? `+₹${c.price}` : "Free"}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onSave({ boxId, chocolateId: chocoId })}
          className="text-[0.65rem] tracking-[0.1em] uppercase px-4 py-2 bg-[#1C1009] text-[#F9F5EF] hover:bg-[#B5541E] transition-colors"
        >
          Save
        </button>
        {current && (
          <button
            onClick={onRemove}
            className="text-[0.65rem] tracking-[0.1em] uppercase px-4 py-2 border border-[#DDD4C4] text-[#8A7968] hover:border-[#1C1009] hover:text-[#1C1009] transition-colors"
          >
            Remove Hamper
          </button>
        )}
      </div>
    </div>
  );
}

export default function CartClient() {
  const { items, count, updateQty, removeItem, setHamper, clearCart, getKey } = useCart();
  const [expandedHamper, setExpandedHamper] = useState<string | null>(null);
  const [address, setAddress] = useState<Address>(emptyAddress);
  const [errors, setErrors] = useState<Partial<Address>>({});
  const [placed, setPlaced] = useState(false);
  const [orderSummary, setOrderSummary] = useState<string>("");

  const setAddr = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setAddress((a) => ({ ...a, [e.target.name]: e.target.value }));

  const itemsWithProducts = items.map((item) => ({
    item,
    product: getProductById(item.productId),
    key: getKey(item),
  })).filter((x) => x.product != null);

  const lineTotal = (item: typeof itemsWithProducts[0]) => {
    const base = item.product!.price;
    const hamperAdd = item.item.hamper
      ? getBox(item.item.hamper.boxId).price + getChocolate(item.item.hamper.chocolateId).price
      : 0;
    return (base + hamperAdd) * item.item.quantity;
  };

  const subtotal = itemsWithProducts.reduce((s, x) => s + lineTotal(x), 0);
  const shipping = subtotal > 0 ? 0 : 0; // free shipping shown, can add logic
  const total = subtotal + shipping;

  const validate = () => {
    const e: Partial<Address> = {};
    if (!address.name.trim()) e.name = "Required";
    if (!address.phone.trim() || !/^\d{10}$/.test(address.phone.replace(/\s/g, ""))) e.phone = "Valid 10-digit number required";
    if (!address.line1.trim()) e.line1 = "Required";
    if (!address.city.trim()) e.city = "Required";
    if (!address.state.trim()) e.state = "Required";
    if (!address.pincode.trim() || !/^\d{6}$/.test(address.pincode)) e.pincode = "Valid 6-digit pincode required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const placeOrder = () => {
    if (!validate()) return;

    const lines: string[] = ["New Order — The Festive Thread\n"];

    lines.push("ITEMS:");
    itemsWithProducts.forEach(({ item, product, key }) => {
      const variantLabel = item.variant
        ? ` [${product!.variants?.find((v: ProductVariant) => v.value === item.variant)?.label ?? item.variant}]`
        : "";
      const hamperLine = item.hamper
        ? ` (Hamper: ${getBox(item.hamper.boxId).label} + ${getChocolate(item.hamper.chocolateId).label} + Roli Chawal + Card)`
        : "";
      lines.push(`• ${product!.name}${variantLabel}${hamperLine} × ${item.quantity} — ₹${lineTotal({ item, product, key })}`);
    });

    lines.push(`\nORDER TOTAL: ₹${total}`);
    lines.push(`\nDELIVERY ADDRESS:`);
    lines.push(`Name: ${address.name}`);
    lines.push(`Phone: ${address.phone}`);
    if (address.email) lines.push(`Email: ${address.email}`);
    lines.push(`Address: ${address.line1}`);
    lines.push(`${address.city}, ${address.state} — ${address.pincode}`);
    if (address.notes) lines.push(`Notes: ${address.notes}`);

    const summary = lines.join("\n");
    setOrderSummary(summary);
    window.open(INSTAMOJO_URL, "_blank");
    setPlaced(true);
  };

  const waLink = orderSummary
    ? `https://wa.me/919883088575?text=${encodeURIComponent(orderSummary)}`
    : null;

  if (placed) {
    return (
      <div className="max-w-[560px] mx-auto px-4 md:px-10 py-20 text-center flex flex-col items-center gap-5">
        <div className="w-6 h-px bg-[#C9972C]/60 mx-auto" />

        {/* Step 1 */}
        <div className="w-8 h-8 rounded-full bg-[#1C1009] text-[#F9F5EF] flex items-center justify-center text-[0.7rem] font-medium">1</div>
        <h2 className="font-display text-[1.8rem] text-[#1C1009] leading-tight">Complete payment<br />on Instamojo</h2>
        <p className="text-[#8A7968] leading-[1.8] text-[0.88rem] max-w-[340px]">
          A new tab has opened with the payment link. Finish the payment there, then come back here.
        </p>
        <a
          href={INSTAMOJO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[0.68rem] tracking-[0.1em] uppercase text-[#B5541E] hover:text-[#1C1009] transition-colors"
        >
          Reopen payment link →
        </a>

        <div className="w-full h-px bg-[#EDE5D8] my-2" />

        {/* Step 2 */}
        <div className="w-8 h-8 rounded-full bg-[#1C1009] text-[#F9F5EF] flex items-center justify-center text-[0.7rem] font-medium">2</div>
        <h2 className="font-display text-[1.8rem] text-[#1C1009] leading-tight">Send us your<br />order details</h2>
        <p className="text-[#8A7968] leading-[1.8] text-[0.88rem] max-w-[360px]">
          Once payment is done, tap below to WhatsApp us your order and delivery address. We&apos;ll confirm and dispatch within 1–2 days.
        </p>

        {waLink && (
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full max-w-xs text-center text-[0.72rem] font-medium tracking-[0.12em] uppercase py-4 bg-[#25D366] text-white hover:bg-[#1ebe5d] transition-colors"
          >
            Send Order on WhatsApp
          </a>
        )}

        <p className="text-[0.65rem] text-[#B5A898] max-w-[300px] leading-[1.7]">
          Your order summary and address will be pre-filled in the message.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <Link href="/shop" className="text-[0.7rem] tracking-[0.12em] uppercase px-7 py-3.5 bg-[#1C1009] text-[#F9F5EF] hover:bg-[#B5541E] transition-colors">
            Continue Shopping
          </Link>
          <button
            onClick={() => { clearCart(); setPlaced(false); setAddress(emptyAddress); setOrderSummary(""); }}
            className="text-[0.7rem] tracking-[0.12em] uppercase px-7 py-3.5 border border-[#DDD4C4] text-[#8A7968] hover:border-[#1C1009] hover:text-[#1C1009] transition-colors"
          >
            Clear Cart
          </button>
        </div>
      </div>
    );
  }

  if (count === 0) {
    return (
      <div className="max-w-[600px] mx-auto px-4 md:px-10 py-20 text-center flex flex-col items-center gap-5">
        <div className="w-6 h-px bg-[#C9972C]/60 mx-auto" />
        <h2 className="font-display text-[1.75rem] text-[#1C1009]">Your cart is empty</h2>
        <p className="text-[#8A7968] text-[0.88rem]">Browse the collection and add something beautiful.</p>
        <Link href="/shop" className="text-[0.7rem] tracking-[0.12em] uppercase px-8 py-4 bg-[#1C1009] text-[#F9F5EF] hover:bg-[#B5541E] transition-colors mt-2">
          Shop Rakhis
        </Link>
      </div>
    );
  }

  const inputCls = "border border-[#DDD4C4] px-4 py-3 text-[0.88rem] text-[#1C1009] bg-[#F9F5EF] outline-none focus:border-[#B5541E] transition-colors placeholder:text-[#B5A898] font-light w-full";
  const labelCls = "text-[0.6rem] tracking-[0.16em] uppercase font-medium text-[#4A2C1A]";
  const errCls = "text-[0.65rem] text-red-500 mt-1";

  const states = ["Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Andaman and Nicobar Islands","Chandigarh","Dadra and Nagar Haveli and Daman and Diu","Delhi","Jammu and Kashmir","Ladakh","Lakshadweep","Puducherry"];

  return (
    <div className="max-w-[1300px] mx-auto px-4 md:px-10 py-8 md:py-14 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 md:gap-12 items-start">

      {/* ── Left: Items ── */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-[1.2rem] text-[#1C1009]">{count} item{count !== 1 ? "s" : ""}</h2>
          <button onClick={clearCart} className="text-[0.65rem] tracking-[0.1em] uppercase text-[#8A7968] hover:text-[#B5541E] transition-colors">
            Clear all
          </button>
        </div>

        {itemsWithProducts.map(({ item, product, key }) => {
          const hamperExpanded = expandedHamper === key;
          const box = item.hamper ? getBox(item.hamper.boxId) : null;
          const choco = item.hamper ? getChocolate(item.hamper.chocolateId) : null;

          return (
            <div key={key} className="border border-[#DDD4C4] bg-white p-4 md:p-5">
              <div className="flex gap-4">
                {/* Image */}
                <div className="shrink-0 w-20 h-24 md:w-24 md:h-28 relative overflow-hidden bg-[#EDE5D8]">
                  {product!.image ? (
                    <Image src={product!.image} alt={product!.name} fill className="object-cover" sizes="96px" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#8A7968] text-xs">No photo</div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 flex flex-col gap-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link href={`/shop/${product!.id}`} className="font-display text-[1.05rem] text-[#1C1009] hover:text-[#B5541E] transition-colors leading-tight block">
                        {product!.name}
                      </Link>
                      {(item.variant || item.hamper) && (
                        <p className="text-[0.7rem] text-[#8A7968] mt-0.5">
                          {item.variant && (() => {
                            const v = product!.variants?.find((vv: ProductVariant) => vv.value === item.variant);
                            return v ? <span className="inline-flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: v.color }} />{v.label}</span> : null;
                          })()}
                          {item.variant && item.hamper && " · "}
                          {item.hamper && `${box!.label} · ${choco!.label} · Roli Chawal · Card`}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => removeItem(key)}
                      className="shrink-0 text-[#B5A898] hover:text-[#B5541E] transition-colors text-lg leading-none"
                      aria-label="Remove"
                    >
                      ×
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-auto pt-2">
                    {/* Qty */}
                    <div className="flex items-center border border-[#DDD4C4]">
                      <button
                        onClick={() => updateQty(key, -1)}
                        className="w-8 h-8 flex items-center justify-center text-[#8A7968] hover:text-[#1C1009] hover:bg-[#EDE5D8] transition-colors text-lg"
                      >−</button>
                      <span className="w-8 h-8 flex items-center justify-center text-[0.85rem] text-[#1C1009] border-x border-[#DDD4C4]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQty(key, 1)}
                        className="w-8 h-8 flex items-center justify-center text-[#8A7968] hover:text-[#1C1009] hover:bg-[#EDE5D8] transition-colors text-lg"
                      >+</button>
                    </div>
                    <span className="font-display text-[1.1rem] text-[#1C1009]">₹{lineTotal({ item, product, key })}</span>
                  </div>
                </div>
              </div>

              {/* Hamper toggle */}
              <div className="mt-3 pt-3 border-t border-[#EDE5D8]">
                {!item.hamper ? (
                  <button
                    onClick={() => setExpandedHamper(hamperExpanded ? null : key)}
                    className="text-[0.65rem] tracking-[0.1em] uppercase text-[#B5541E] hover:text-[#1C1009] transition-colors flex items-center gap-1.5"
                  >
                    <span className="block w-3 h-px bg-[#B5541E]" />
                    {hamperExpanded ? "Cancel" : "Make it a Hamper — Add box, chocolate & more"}
                  </button>
                ) : (
                  <button
                    onClick={() => setExpandedHamper(hamperExpanded ? null : key)}
                    className="text-[0.65rem] tracking-[0.1em] uppercase text-[#8A7968] hover:text-[#B5541E] transition-colors"
                  >
                    {hamperExpanded ? "Cancel" : "Edit Hamper Options"}
                  </button>
                )}

                {hamperExpanded && (
                  <HamperPicker
                    current={item.hamper}
                    onSave={(h) => {
                      setHamper(key, h);
                      // key changes after hamper is set — compute new key and track it
                      const newKey = itemKey({ productId: item.productId, quantity: item.quantity, hamper: h });
                      setExpandedHamper(newKey);
                      setTimeout(() => setExpandedHamper(null), 0);
                    }}
                    onRemove={() => { setHamper(key, undefined); setExpandedHamper(null); }}
                  />
                )}
              </div>
            </div>
          );
        })}

        {/* Address Form */}
        <div className="border border-[#DDD4C4] bg-white p-5 md:p-6 mt-2">
          <h3 className="font-display text-[1.2rem] text-[#1C1009] mb-5">Delivery Address</h3>

          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Full Name *</label>
                <input name="name" value={address.name} onChange={setAddr} placeholder="Your full name" className={`${inputCls} mt-1.5`} />
                {errors.name && <p className={errCls}>{errors.name}</p>}
              </div>
              <div>
                <label className={labelCls}>Phone Number *</label>
                <input name="phone" value={address.phone} onChange={setAddr} placeholder="10-digit mobile number" className={`${inputCls} mt-1.5`} />
                {errors.phone && <p className={errCls}>{errors.phone}</p>}
              </div>
            </div>

            <div>
              <label className={labelCls}>Email Address (optional)</label>
              <input name="email" type="email" value={address.email} onChange={setAddr} placeholder="For order confirmation" className={`${inputCls} mt-1.5`} />
            </div>

            <div>
              <label className={labelCls}>Address *</label>
              <input name="line1" value={address.line1} onChange={setAddr} placeholder="House/flat no., street, area" className={`${inputCls} mt-1.5`} />
              {errors.line1 && <p className={errCls}>{errors.line1}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>City *</label>
                <input name="city" value={address.city} onChange={setAddr} placeholder="City" className={`${inputCls} mt-1.5`} />
                {errors.city && <p className={errCls}>{errors.city}</p>}
              </div>
              <div>
                <label className={labelCls}>State *</label>
                <select name="state" value={address.state} onChange={setAddr} className={`${inputCls} mt-1.5 cursor-pointer`}>
                  <option value="">Select state</option>
                  {states.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                {errors.state && <p className={errCls}>{errors.state}</p>}
              </div>
              <div>
                <label className={labelCls}>Pincode *</label>
                <input name="pincode" value={address.pincode} onChange={setAddr} placeholder="6-digit pincode" maxLength={6} className={`${inputCls} mt-1.5`} />
                {errors.pincode && <p className={errCls}>{errors.pincode}</p>}
              </div>
            </div>

            <div>
              <label className={labelCls}>Order Notes (optional)</label>
              <textarea name="notes" value={address.notes} onChange={setAddr} rows={2}
                placeholder="Custom message, gift note, special instructions…"
                className={`${inputCls} mt-1.5 resize-none`} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Right: Summary ── */}
      <div className="lg:sticky lg:top-24 flex flex-col gap-4">
        <div className="border border-[#DDD4C4] bg-white">
          <div className="px-5 py-4 border-b border-[#EDE5D8]">
            <p className="text-[0.6rem] tracking-[0.18em] uppercase text-[#B5541E]">Summary</p>
            <p className="font-display text-xl text-[#1C1009] mt-0.5">Order Total</p>
          </div>
          <div className="px-5 py-5 flex flex-col gap-3">
            {itemsWithProducts.map(({ item, product, key }) => (
              <div key={key} className="flex justify-between gap-3 text-[0.8rem]">
                <span className="text-[#8A7968] truncate">
                  {product!.name} {item.hamper && "(Hamper)"} × {item.quantity}
                </span>
                <span className="text-[#1C1009] font-medium shrink-0">₹{lineTotal({ item, product, key })}</span>
              </div>
            ))}
            <div className="border-t border-[#EDE5D8] pt-3 flex justify-between text-[0.8rem]">
              <span className="text-[#8A7968]">Shipping</span>
              <span className="text-[#4A2C1A] font-medium">Free</span>
            </div>
            <div className="border-t border-[#EDE5D8] pt-3 flex justify-between items-baseline">
              <span className="text-[0.68rem] tracking-[0.1em] uppercase font-medium text-[#4A2C1A]">Total</span>
              <span className="font-display text-[1.5rem] text-[#B5541E]">₹{total}</span>
            </div>
          </div>
          <div className="px-5 pb-5 flex flex-col gap-3">
            <button
              onClick={placeOrder}
              className="w-full text-[0.7rem] font-medium tracking-[0.12em] uppercase py-4 bg-[#1C1009] text-[#F9F5EF] hover:bg-[#B5541E] transition-colors"
            >
              Proceed to Payment
            </button>
            <p className="text-[0.63rem] text-[#8A7968] text-center leading-[1.6]">
              Secure checkout via Instamojo. You&apos;ll receive an order confirmation by email.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {["Handcrafted with love in India", "Ships within 5–7 business days", "Confirm address before ordering"].map((t) => (
            <span key={t} className="text-[0.66rem] tracking-[0.08em] text-[#8A7968]">{t}</span>
          ))}
        </div>

        <Link href="/shop" className="text-[0.65rem] tracking-[0.1em] uppercase text-[#8A7968] hover:text-[#B5541E] transition-colors text-center">
          ← Continue Shopping
        </Link>
      </div>
    </div>
  );
}
