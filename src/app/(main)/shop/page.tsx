import { Suspense } from "react";
import ShopClient from "./ShopClient";
import { getProducts } from "@/lib/products";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop Rakhis — The Festive Thread by Kavita",
  description: "Browse 50+ handcrafted rakhis: single rakhis, bhaiya-bhabhi sets, children's rakhis, and gift hampers.",
};

export default async function ShopPage() {
  const products = await getProducts();
  return (
    <div className="pt-16 min-h-dvh">
      <Suspense fallback={<div className="p-20 text-center text-[#8A7968]">Loading...</div>}>
        <ShopClient products={products} />
      </Suspense>
    </div>
  );
}
