import Link from "next/link";
import Image from "next/image";
import { Product, placeholderColor } from "@/lib/products";
import { cdnUrl } from "@/lib/cloudinary";

export default function ProductCard({ product }: { product: Product }) {
  const bg = placeholderColor(product.id);
  const hasSecond = Boolean(product.image2);

  return (
    <Link href={`/shop/${product.id}`} className="group block">
      <div
        className="relative aspect-[3/4] overflow-hidden mb-3"
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
            />
            {hasSecond && (
              <Image
                src={cdnUrl(product.image2!)}
                alt={`${product.name} — alternate view`}
                fill
                className="object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
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

        {product.tag && (
          <span className="absolute top-3 left-3 bg-[#1C1009] text-[#F9F5EF] text-[0.6rem] tracking-[0.14em] uppercase px-2.5 py-1 font-medium z-10">
            {product.tag}
          </span>
        )}

        {/* Overlay only when there's a second image (hover effect active) */}
        {hasSecond && (
          <div className="absolute inset-0 bg-[#1C1009]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-5 z-10">
            <span className="border border-[#F9F5EF]/70 text-[#F9F5EF] text-[0.65rem] tracking-[0.14em] uppercase px-5 py-2">
              View Details
            </span>
          </div>
        )}
      </div>

      <h3 className="font-display text-lg text-[#1C1009] mb-1 leading-snug group-hover:text-[#B5541E] transition-colors">
        {product.name}
      </h3>
      <p className="text-[#B5541E] text-sm">₹{product.price}</p>
    </Link>
  );
}
