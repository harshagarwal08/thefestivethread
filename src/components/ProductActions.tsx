"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import type { ProductVariant } from "@/lib/products";

interface ProductActionsProps {
  productId: string;
  productName: string;
  variants?: ProductVariant[];
}

export default function ProductActions({ productId, productName, variants }: ProductActionsProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<string | undefined>(
    variants ? variants[0].value : undefined
  );

  const handleAddToCart = () => {
    addItem(productId, undefined, selectedVariant);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="flex flex-col gap-3">
      {variants && variants.length > 0 && (
        <div>
          <p className="text-[0.6rem] tracking-[0.16em] uppercase font-medium text-[#4A2C1A] mb-2">
            Colour — <span className="font-normal text-[#8A7968]">{variants.find(v => v.value === selectedVariant)?.label}</span>
          </p>
          <div className="flex gap-2">
            {variants.map((v) => (
              <button
                key={v.value}
                onClick={() => setSelectedVariant(v.value)}
                title={v.label}
                className="relative w-8 h-8 rounded-full transition-transform hover:scale-110"
                style={{ backgroundColor: v.color }}
              >
                {selectedVariant === v.value && (
                  <span className="absolute inset-0 rounded-full ring-2 ring-[#1C1009] ring-offset-2" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={handleAddToCart}
        className="w-full text-center text-[0.7rem] font-medium tracking-[0.12em] uppercase py-4 bg-[#1C1009] text-[#F9F5EF] hover:bg-[#4A2C1A] transition-colors"
      >
        {added ? "Added to Cart" : "Add to Cart"}
      </button>

      <Link
        href={`/hamper?rakhi=${productId}`}
        className="group relative w-full flex items-center justify-between gap-4 bg-[#B5541E] hover:bg-[#9A4118] transition-colors duration-300 px-5 py-4 overflow-hidden"
      >
        {/* subtle shimmer line */}
        <div className="absolute inset-y-0 left-0 w-px bg-white/20" />
        <div>
          <p className="text-[0.6rem] tracking-[0.16em] uppercase text-[#F9C89A]/80 mb-0.5">
            Make it a gift
          </p>
          <p className="font-display text-lg text-[#F9F5EF] leading-tight">
            Build a Hamper
          </p>
          <p className="text-[0.72rem] text-[#F9C89A]/75 mt-1">
            Add box, chocolate &amp; roli chawal from ₹149
          </p>
        </div>
        <div className="shrink-0 w-10 h-10 border border-white/25 group-hover:border-white/50 flex items-center justify-center text-[#F9F5EF] transition-colors text-lg">
          →
        </div>
      </Link>

      {added && (
        <Link
          href="/cart"
          className="w-full text-center text-[0.68rem] tracking-[0.1em] uppercase py-2.5 border border-[#1C1009] text-[#1C1009] hover:bg-[#1C1009] hover:text-[#F9F5EF] transition-colors"
        >
          View Cart →
        </Link>
      )}
    </div>
  );
}
