import { NextRequest, NextResponse } from "next/server";
import { createPaymentRequest } from "@/lib/instamojo";
import { getProductById } from "@/lib/products";
import { getBox, getChocolate } from "@/lib/hamperOptions";
import { validateDiscount, incrementUsage } from "@/lib/discount";
import { kv } from "@/lib/kv";

export const runtime = "nodejs";

const FREE_SHIPPING_THRESHOLD = 1; // TEMP: lowered for testing — revert to 499
const FLAT_SHIPPING_RATE = 99;
const ORDER_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

interface IncomingItem {
  productId: string;
  quantity: number;
  variant?: string;
  hamper?: { boxId: string; chocolateId: string };
}

interface IncomingHamperRakhi {
  productId: string;
  quantity: number;
  variant?: string;
}

interface IncomingHamperItem {
  hamperId: string;
  boxId: string;
  chocolateId: string;
  rakhis: IncomingHamperRakhi[];
}

interface Address {
  name: string;
  phone: string;
  email?: string;
  line1: string;
  city: string;
  state: string;
  pincode: string;
  notes?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const items: IncomingItem[] = body.items ?? [];
    const hamperItems: IncomingHamperItem[] = body.hamperItems ?? [];
    const address: Address = body.address;
    const discountCode: string | undefined = body.discountCode?.trim().toUpperCase() || undefined;

    if ((!items?.length && !hamperItems?.length) || !address) {
      return NextResponse.json({ error: "Missing items or address" }, { status: 400 });
    }

    // Validate address fields
    if (!address.name?.trim() || !address.phone?.trim() || !address.line1?.trim() ||
        !address.city?.trim() || !address.state?.trim() || !/^\d{6}$/.test(address.pincode)) {
      return NextResponse.json({ error: "Invalid address" }, { status: 400 });
    }

    // Re-derive all prices server-side
    let subtotal = 0;
    const validatedItems: IncomingItem[] = [];

    for (const item of items) {
      const product = getProductById(item.productId);
      if (!product) {
        return NextResponse.json({ error: `Unknown product: ${item.productId}` }, { status: 400 });
      }
      if (item.quantity < 1 || item.quantity > 20) {
        return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
      }

      let linePrice = product.price;
      if (item.hamper) {
        linePrice += getBox(item.hamper.boxId as never).price + getChocolate(item.hamper.chocolateId as never).price;
      }

      subtotal += linePrice * item.quantity;
      validatedItems.push(item);
    }

    // Price hamper items server-side
    const validatedHamperItems: IncomingHamperItem[] = [];
    for (const h of hamperItems) {
      const box = getBox(h.boxId as never);
      const choco = getChocolate(h.chocolateId as never);
      let hamperTotal = box.price + choco.price;
      for (const r of h.rakhis) {
        const product = getProductById(r.productId);
        if (!product) return NextResponse.json({ error: `Unknown product: ${r.productId}` }, { status: 400 });
        if (r.quantity < 1 || r.quantity > 20) return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
        hamperTotal += product.price * r.quantity;
      }
      subtotal += hamperTotal;
      validatedHamperItems.push(h);
    }

    const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_RATE;

    // Apply discount
    let discountAmount = 0;
    if (discountCode) {
      const dv = await validateDiscount(discountCode, subtotal);
      if (dv.valid) discountAmount = dv.discount;
    }

    const total = Math.max(9, subtotal + shipping - discountAmount); // min ₹9 (Instamojo)
    const orderRef = `TFT-${Date.now()}`;

    // Build full order record
    const orderData = {
      orderRef,
      address,
      hamperItems: validatedHamperItems.map((h) => {
        const box = getBox(h.boxId as never);
        const choco = getChocolate(h.chocolateId as never);
        const rakhisTotal = h.rakhis.reduce((s, r) => s + (getProductById(r.productId)?.price ?? 0) * r.quantity, 0);
        return {
          hamperId: h.hamperId,
          boxId: h.boxId,
          boxLabel: box.label,
          chocolateId: h.chocolateId,
          chocolateLabel: choco.label,
          rakhis: h.rakhis.map((r) => {
            const p = getProductById(r.productId)!;
            return { productId: r.productId, name: p.name, quantity: r.quantity, variant: r.variant, lineTotal: p.price * r.quantity };
          }),
          lineTotal: box.price + choco.price + rakhisTotal,
        };
      }),
      items: validatedItems.map((it) => {
        const product = getProductById(it.productId)!;
        const hamperAdd = it.hamper
          ? getBox(it.hamper.boxId as never).price + getChocolate(it.hamper.chocolateId as never).price
          : 0;
        return {
          id: it.productId,
          name: product.name,
          quantity: it.quantity,
          variant: it.variant,
          hamper: it.hamper,
          lineTotal: (product.price + hamperAdd) * it.quantity,
        };
      }),
      subtotal,
      shipping,
      discountCode: discountCode ?? null,
      discountAmount,
      total,
      status: "PENDING",
      createdAt: new Date().toISOString(),
    };

    // Save to KV with 30-day TTL — webhook may fire with delay, and we need it for success page
    await kv.set(`order:${orderRef}`, orderData, { ex: ORDER_TTL_SECONDS });

    const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "https://thefestivethread.vercel.app";

    const { paymentUrl } = await createPaymentRequest({
      amount: total,
      buyerName: address.name,
      email: address.email || "",
      phone: address.phone,
      purpose: orderRef,
      remarks: orderRef,
      redirectUrl: `${origin}/order/success?ref=${orderRef}`,
      webhookUrl: `${origin}/api/webhooks/instamojo`,
    });

    if (discountCode && discountAmount > 0) await incrementUsage(discountCode);

    return NextResponse.json({ paymentUrl, orderRef, total, shipping, discountAmount });
  } catch (err) {
    console.error("[orders/create]", err);
    return NextResponse.json({ error: "Failed to create payment request" }, { status: 500 });
  }
}
