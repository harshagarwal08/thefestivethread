import Link from "next/link";
import { notFound } from "next/navigation";
import { products, getProductById, getRelated, categoryLabels, placeholderColor } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import ProductActions from "@/components/ProductActions";
import ProductGallery from "@/components/ProductGallery";
import ProductAccordion from "@/components/ProductAccordion";
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

  const discount = product.mrp
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 0;
  const savings = product.mrp ? product.mrp - product.price : 0;

  const accordionItems = [
    {
      title: "Description",
      content: product.description,
      defaultOpen: true,
    },
    {
      title: "Materials & Care",
      content: "Handcrafted with premium threads, natural materials and metal accents. Wipe gently with a dry cloth. Keep away from moisture and direct sunlight to preserve colours and finish.",
    },
    {
      title: "Delivery Info",
      content: "Pan-India delivery in 5–7 business days. Ships from Kolkata. You'll receive a tracking number via email once dispatched.",
    },
    {
      title: "Returns",
      content: "We don't accept returns on rakhi orders as each piece is made-to-order. If your item arrives damaged or incorrect, WhatsApp us at +91 98830 88575 within 48 hours of delivery.",
    },
  ];

  return (
    <div className="pt-16 min-h-dvh">
      {/* Breadcrumb */}
      <div className="max-w-325 mx-auto px-4 md:px-10 py-4 md:py-6 flex items-center gap-2 md:gap-3 text-[0.7rem] text-taupe flex-wrap">
        <Link href="/shop" className="hover:text-terracotta transition-colors">Shop</Link>
        <span>→</span>
        <Link href={`/shop?cat=${product.category}`} className="hover:text-terracotta transition-colors">
          {categoryLabels[product.category]}
        </Link>
        <span>→</span>
        <span className="text-brown-dark truncate max-w-40 md:max-w-none">{product.name}</span>
      </div>

      {/* Main */}
      <div className="max-w-325 mx-auto px-4 md:px-10 pb-16 md:pb-24 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-start">
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
          <h1 className="font-display font-light text-brown-dark mb-3 leading-tight" style={{ fontSize: "clamp(1.8rem, 3vw, 2.75rem)" }}>
            {product.name}
          </h1>

          {/* Price row */}
          <div className="flex items-baseline gap-3 flex-wrap mb-2">
            <p className="font-display text-[1.6rem] md:text-[1.75rem] font-light text-terracotta">₹{product.price}</p>
            {product.mrp && (
              <>
                <p className="text-[#B5A898] text-[1rem] line-through">₹{product.mrp}</p>
                {discount >= 10 && (
                  <span className="bg-[#B5541E] text-white text-[0.6rem] font-bold px-2 py-0.5">{discount}% off</span>
                )}
              </>
            )}
          </div>
          {savings > 0 && (
            <p className="text-[0.72rem] text-emerald-700 font-medium mb-4">You save ₹{savings}</p>
          )}

          {/* Urgency strip */}
          {product.stock !== undefined && product.stock < 5 && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-3 py-2.5 mb-4">
              <span className="text-amber-600 text-sm">🔥</span>
              <p className="text-[0.72rem] text-amber-700 font-medium">Only {product.stock} left — order soon</p>
            </div>
          )}

          {/* Offer strip */}
          <div className="flex items-center gap-2 bg-[#FBF5EE] border border-[#E8D5BA] px-3 py-2.5 mb-5">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0 text-[#B5541E]">
              <path d="M1 7.5L5 11.5L13 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p className="text-[0.7rem] text-[#7A4A20]">
              Use code <strong className="font-semibold text-[#B5541E]">RAKHI10</strong> for an extra 10% off · Min order ₹199
            </p>
          </div>

          <div className="h-px bg-[#EDE5D8] mb-5" />

          {/* Cart + Hamper actions */}
          <div className="mb-6">
            <ProductActions productId={product.id} productName={product.name} variants={product.variants} />
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-2 gap-2 mb-6">
            {[
              { icon: "✦", label: "Handcrafted in India" },
              { icon: "🚚", label: "Free shipping above ₹499" },
              { icon: "📦", label: "Ships in 1–2 days" },
              { icon: "🔒", label: "Secure payments" },
            ].map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-2 bg-[#F9F5EF] px-3 py-2.5">
                <span className="text-sm leading-none">{icon}</span>
                <span className="text-[0.65rem] text-taupe leading-tight">{label}</span>
              </div>
            ))}
          </div>

          {/* Accordions */}
          <ProductAccordion items={accordionItems} />
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="bg-[#EDE5D8] py-14 md:py-20">
          <div className="max-w-325 mx-auto px-4 md:px-10">
            <div className="text-center mb-10 md:mb-12">
              <span className="text-[0.62rem] tracking-[0.22em] uppercase text-[#B5541E] block mb-2">You might also like</span>
              <h2 className="font-display font-light text-brown-dark" style={{ fontSize: "clamp(1.5rem, 3vw, 2.5rem)" }}>
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
