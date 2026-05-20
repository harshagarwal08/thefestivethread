import { kv } from "@/lib/kv";

export interface DiscountCode {
  code: string;
  type: "percent" | "flat";
  value: number;
  minOrder: number;
  maxUses: number;   // 0 = unlimited
  usedCount: number;
  active: boolean;
  expiresAt?: string;
}

export async function getDiscount(code: string): Promise<DiscountCode | null> {
  return kv.get<DiscountCode>(`discount:${code.toUpperCase()}`);
}

export async function validateDiscount(
  code: string,
  cartTotal: number
): Promise<{ valid: boolean; discount: number; message?: string }> {
  const dc = await getDiscount(code);
  if (!dc) return { valid: false, discount: 0, message: "Invalid discount code" };
  if (!dc.active) return { valid: false, discount: 0, message: "This code is no longer active" };
  if (dc.expiresAt && new Date(dc.expiresAt) < new Date())
    return { valid: false, discount: 0, message: "This code has expired" };
  if (dc.maxUses > 0 && dc.usedCount >= dc.maxUses)
    return { valid: false, discount: 0, message: "This code has reached its usage limit" };
  if (cartTotal < dc.minOrder)
    return { valid: false, discount: 0, message: `Minimum order of ₹${dc.minOrder} required` };

  const discount =
    dc.type === "percent"
      ? Math.round((cartTotal * dc.value) / 100)
      : dc.value;

  return { valid: true, discount };
}

export async function incrementUsage(code: string): Promise<void> {
  const dc = await getDiscount(code);
  if (!dc) return;
  await kv.set(`discount:${code.toUpperCase()}`, { ...dc, usedCount: dc.usedCount + 1 });
}

export async function createDiscount(data: Omit<DiscountCode, "usedCount">): Promise<void> {
  await kv.set(`discount:${data.code.toUpperCase()}`, { ...data, usedCount: 0 });
}

export async function listDiscounts(): Promise<DiscountCode[]> {
  const keys = await kv.keys("discount:*");
  if (!keys.length) return [];
  const values = await Promise.all(keys.map((k) => kv.get<DiscountCode>(k)));
  return values.filter(Boolean) as DiscountCode[];
}
