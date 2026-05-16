import Link from "next/link";
import { notFound } from "next/navigation";
import { products, getProductById, getRelated, categoryLabels, placeholderColor } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import ProductActions from "@/components/ProductActions";
import ProductGallery from "@/components/ProductGallery";
import type { Metadata } from "next";

export function generateStaticParams() {
  return products.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const product = getProductById(id);
  if (!product) return {};
  return {
    title: `${product.name} — The Festive Thread by Kavita`,
    description: product.description,
    openGraph: { images: product.image ? [product.image] : [] },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = getProductById(id);
  if (!product) notFound();

  const bg = placeholderColor(product.id);
  const related = getRelated(product);
  const images = [product.image, product.image2].filter(Boolean) as string[];

  return (
    <div className="pt-16 min-h-dvh">
      {/* Breadcrumb */}
      <div className="max-w-[1300px] mx-auto px-4 md:px-10 py-4 md:py-6 flex items-center gap-2 md:gap-3 text-[0.7rem] text-[#8A7968] flex-wrap">
        <Link href="/shop" className="hover:text-[#B5541E] transition-colors">Shop</Link>
        <span>→</span>
        <Link href={`/shop?cat=${product.category}`} className="hover:text-[#B5541E] transition-colors">
          {categoryLabels[product.category]}
        </Link>
        <span>→</span>
        <span className="text-[#1C1009] truncate max-w-[160px] md:max-w-none">{product.name}</span>
      </div>

      {/* Main */}
      <div className="max-w-[1300px] mx-auto px-4 md:px-10 pb-16 md:pb-24 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-start">
        {/* Gallery */}
        <ProductGallery
          images={images}
          productName={product.name}
          tag={product.tag}
          fallbackBg={bg}
        />

        {/* Details */}
        <div className="flex flex-col">
          <span className="text-[0.6rem] tracking-[0.2em] uppercase text-[#B5541E] block mb-2">
            {categoryLabels[product.category]}
          </span>
          <h1 className="font-display font-light text-[#1C1009] mb-2 leading-tight" style={{ fontSize: "clamp(1.8rem, 3vw, 2.75rem)" }}>
            {product.name}
          </h1>
          <div className="flex items-baseline gap-3 mb-5">
            <p className="font-display text-[1.6rem] md:text-[1.75rem] font-light text-terracotta">₹{product.price}</p>
            <span className="text-[0.6rem] tracking-[0.14em] uppercase text-taupe-light">{product.id.toUpperCase()}</span>
          </div>

          <div className="h-px bg-[#EDE5D8] mb-5" />
          <p className="text-[#8A7968] leading-[1.8] text-[0.88rem] md:text-[0.92rem] mb-7">{product.description}</p>

          {/* Info */}
          <div className="bg-[#F3EDE4] p-4 md:p-5 flex flex-col gap-3 mb-7">
            {[
              ["Material", "Handcrafted, premium threads & natural materials"],
              ["Packaging", "Gift-wrapped with tissue paper & ribbon"],
              ["Shipping", "Pan-India delivery within 5–7 business days"],
            ].map(([label, val]) => (
              <div key={label} className="flex gap-3 md:gap-4 text-[0.8rem]">
                <span className="min-w-[72px] md:min-w-[80px] text-[0.6rem] tracking-[0.1em] uppercase font-medium text-[#4A2C1A] pt-0.5">{label}</span>
                <span className="text-[#8A7968]">{val}</span>
              </div>
            ))}
          </div>

          {/* ── Cart + Hamper actions ── */}
          <div className="mb-6">
            <ProductActions productId={product.id} productName={product.name} variants={product.variants} />
          </div>

          <div className="flex flex-col gap-2">
            {["Handcrafted with love in India", "Each piece is unique", "Secure payments"].map((t) => (
              <span key={t} className="text-[0.66rem] tracking-[0.08em] text-[#8A7968]">{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="bg-[#EDE5D8] py-14 md:py-20">
          <div className="max-w-[1300px] mx-auto px-4 md:px-10">
            <div className="text-center mb-10 md:mb-12">
              <span className="text-[0.62rem] tracking-[0.22em] uppercase text-[#B5541E] block mb-2">You might also like</span>
              <h2 className="font-display font-light text-[#1C1009]" style={{ fontSize: "clamp(1.5rem, 3vw, 2.5rem)" }}>
                More from {categoryLabels[product.category]}
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
