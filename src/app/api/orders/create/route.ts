import { NextRequest, NextResponse } from "next/server";
import { createPaymentRequest } from "@/lib/instamojo";
import { getProductById } from "@/lib/products";
import { getBox, getChocolate } from "@/lib/hamperOptions";
import { getShippingRate } from "@/lib/shiprocket";
import { kv } from "@/lib/kv";

export const runtime = "nodejs";

const FREE_SHIPPING_THRESHOLD = 499;
const ORDER_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

interface IncomingItem {
  productId: string;
  quantity: number;
  variant?: string;
  hamper?: { boxId: string; chocolateId: string };
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
    const items: IncomingItem[] = body.items;
    const address: Address = body.address;

    if (!items?.length || !address) {
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

    // Compute shipping server-side via Shiprocket — same logic as /api/shipping-rate
    let shipping = 0;
    if (subtotal < FREE_SHIPPING_THRESHOLD) {
      const hasHamper = validatedItems.some((it) => !!it.hamper);
      const weightKg = hasHamper ? 0.75 : 0.15;
      try {
        shipping = await getShippingRate(address.pincode, weightKg);
      } catch {
        return NextResponse.json({ error: "Unable to calculate shipping for this pincode. Please check the pincode and try again." }, { status: 422 });
      }
    }

    const total = subtotal + shipping;
    const orderRef = `TFT-${Date.now()}`;

    // Build full order record
    const orderData = {
      orderRef,
      address,
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

    return NextResponse.json({ paymentUrl, orderRef, total, shipping });
  } catch (err) {
    console.error("[orders/create]", err);
    return NextResponse.json({ error: "Failed to create payment request" }, { status: 500 });
  }
}
