"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { categories, Category } from "@/lib/products";
import type { Product } from "@/lib/products";
import ProductCard from "@/components/ProductCard";

const shopCategories = categories;

export default function ShopClient({ products: shopProducts }: { products: Product[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [sort, setSort] = useState("default");

  const rawCat = searchParams.get("cat") || "all";
  const activeCat = (shopCategories.find((c) => c.id === rawCat)?.id ?? "all") as "all" | Category;

  const setCat = (id: string) => {
    router.push(id === "all" ? "/shop" : `/shop?cat=${id}`, { scroll: false });
  };

  let filtered = activeCat === "all" ? shopProducts : shopProducts.filter((p) => p.category === activeCat);
  if (sort === "asc") filtered = [...filtered].sort((a, b) => a.price - b.price);
  if (sort === "desc") filtered = [...filtered].sort((a, b) => b.price - a.price);

  const activeLabel = shopCategories.find((c) => c.id === activeCat)?.label ?? "All";

  return (
    <div className="max-w-[1300px] mx-auto px-4 md:px-10 py-8 md:py-12">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex flex-wrap gap-2">
          {shopCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCat(cat.id)}
              className={`text-[0.65rem] tracking-[0.1em] uppercase px-3 py-2 border transition-colors ${
                activeCat === cat.id
                  ? "bg-[#1C1009] text-[#F9F5EF] border-[#1C1009]"
                  : "border-[#DDD4C4] text-[#8A7968] hover:border-[#1C1009] hover:text-[#1C1009]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="text-[0.72rem] border border-[#DDD4C4] px-3 py-2 text-[#8A7968] bg-[#F9F5EF] outline-none cursor-pointer self-start sm:self-auto"
        >
          <option value="default">Sort: Featured</option>
          <option value="asc">Price: Low to High</option>
          <option value="desc">Price: High to Low</option>
        </select>
      </div>

      <div className="border-t border-[#EDE5D8] pt-4 pb-6 text-[0.78rem] text-[#8A7968]">
        {filtered.length} designs in <strong className="text-[#1C1009] font-medium">{activeLabel}</strong>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-5 md:gap-y-10">
        {filtered.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
