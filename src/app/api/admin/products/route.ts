import { NextRequest, NextResponse } from "next/server";
import { kv } from "@/lib/kv";
import type { Product } from "@/lib/products";

function auth(req: NextRequest) {
  return req.headers.get("x-admin-password") === process.env.ADMIN_PASSWORD;
}

export async function POST(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const product: Product = await req.json();
  if (!product.id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const overrides = (await kv.get<Record<string, Product>>("product:overrides")) ?? {};
  overrides[product.id] = product;
  await kv.set("product:overrides", overrides);

  // Remove from deleted list if re-adding
  const deleted = (await kv.get<string[]>("product:deleted")) ?? [];
  const filtered = deleted.filter((id) => id !== product.id);
  if (filtered.length !== deleted.length) await kv.set("product:deleted", filtered);

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  // Remove from overrides
  const overrides = (await kv.get<Record<string, Product>>("product:overrides")) ?? {};
  delete overrides[id];
  await kv.set("product:overrides", overrides);

  // Add to deleted list (to hide static products)
  const deleted = (await kv.get<string[]>("product:deleted")) ?? [];
  if (!deleted.includes(id)) deleted.push(id);
  await kv.set("product:deleted", deleted);

  return NextResponse.json({ ok: true });
}
