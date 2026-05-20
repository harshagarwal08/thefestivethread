"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Product, placeholderColor } from "@/lib/products";
import { cdnUrl, blurDataUrl } from "@/lib/cloudinary";
import { useCart } from "@/lib/cart";

export default function ProductCard({ product }: { product: Product }) {
  const bg = placeholderColor(product.id);
  const hasSecond = Boolean(product.image2);
  const { addItem } = useCart();
  const router = useRouter();

  const discount = product.mrp
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (product.variants?.length) {
      router.push(`/shop/${product.id}`);
      return;
    }
    addItem(product.id);
  };

  return (
    <Link href={`/shop/${product.id}`} className="group block">
      {/* Image */}
      <div
        className="relative aspect-3/4 overflow-hidden mb-3"
        style={{ background: product.image ? undefined : bg }}
      >
        {product.image ? (
          <>
            <Image
              src={cdnUrl(product.image)}
              alt={product.name}
              fill
              className={`object-cover transition-all duration-700 ${hasSecond ? "group-hover:opacity-0" : ""}`}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              placeholder="blur"
              blurDataURL={blurDataUrl}
            />
            {hasSecond && (
              <Image
                src={cdnUrl(product.image2!)}
                alt={`${product.name} — alternate view`}
                fill
                className="object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                placeholder="blur"
                blurDataURL={blurDataUrl}
              />
            )}
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-[#8A7968]">
            <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="16" r="10" stroke="currentColor" strokeWidth="1.5" />
              <path d="M8 36c0-8.837 7.163-16 16-16s16 7.163 16 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span className="text-[0.6rem] tracking-widest uppercase">Photo coming</span>
          </div>
        )}

        {/* Tag chip */}
        {product.tag && (
          <span className="absolute top-3 left-3 bg-brown-dark text-cream text-[0.6rem] tracking-[0.14em] uppercase px-2.5 py-1 font-medium z-10">
            {product.tag}
          </span>
        )}

        {/* Discount chip */}
        {discount >= 10 && (
          <span className="absolute top-3 right-3 bg-terracotta text-white text-[0.58rem] font-bold px-2 py-1 z-10">
            {discount}% off
          </span>
        )}

        {/* Low stock badge */}
        {product.stock !== undefined && product.stock < 5 && (
          <span className="absolute bottom-3 left-3 bg-amber-500/90 text-white text-[0.58rem] tracking-[0.06em] uppercase px-2 py-1 z-10">
            Only {product.stock} left
          </span>
        )}

        {/* Quick add overlay */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-200 z-20">
          <button
            onClick={handleQuickAdd}
            className="w-full py-2.5 bg-brown-dark text-cream text-[0.62rem] tracking-[0.14em] uppercase hover:bg-terracotta transition-colors"
          >
            {product.variants?.length ? "Choose Options" : "Add to Cart"}
          </button>
        </div>
      </div>

      {/* Info */}
      <h3 className="font-display text-lg text-brown-dark mb-1 leading-snug group-hover:text-terracotta transition-colors">
        {product.name}
      </h3>
      <div className="flex items-center gap-2 flex-wrap">
        <p className="text-terracotta text-sm font-medium">₹{product.price}</p>
        {product.mrp && (
          <p className="text-taupe-light text-[0.75rem] line-through">₹{product.mrp}</p>
        )}
        {discount >= 10 && (
          <p className="text-terracotta text-[0.62rem] font-medium">{discount}% off</p>
        )}
      </div>
    </Link>
  );
}
