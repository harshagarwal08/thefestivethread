import type { Metadata } from "next";
import CartClient from "./CartClient";

export const metadata: Metadata = {
  title: "Your Cart — The Festive Thread by Kavita",
  description: "Review your order, add delivery details, and place your rakhi order.",
};

export default function CartPage() {
  return (
    <div className="pt-16 min-h-dvh bg-[#F9F5EF]">
      <div className="bg-[#EDE5D8] py-8 md:py-12 border-b border-[#DDD4C4]">
        <div className="max-w-[1300px] mx-auto px-4 md:px-10">
          <span className="text-[0.62rem] tracking-[0.22em] uppercase text-[#B5541E] block mb-2">Your Order</span>
          <h1 className="font-display font-light text-[#1C1009]" style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}>
            Review &amp; <em className="text-[#B5541E]">Checkout</em>
          </h1>
        </div>
      </div>
      <CartClient />
    </div>
  );
}
