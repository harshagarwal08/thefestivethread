import { kv } from "@/lib/kv";
import { products as staticProducts } from "@/lib/products";
import type { Product } from "@/lib/products";
import ProductsClient from "./ProductsClient";

export default async function ProductsPage() {
  const overrides = (await kv.get<Record<string, Product>>("product:overrides")) ?? {};
  const deletedIds = (await kv.get<string[]>("product:deleted")) ?? [];

  const merged: Product[] = [
    ...staticProducts
      .filter((p) => !deletedIds.includes(p.id))
      .map((p) => overrides[p.id] ? { ...p, ...overrides[p.id] } : p),
    ...Object.values(overrides).filter((p) => !staticProducts.find((s) => s.id === p.id)),
  ];

  return <ProductsClient initialProducts={merged} />;
}
