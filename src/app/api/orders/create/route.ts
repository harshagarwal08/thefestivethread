import { NextRequest, NextResponse } from "next/server";
import { createPaymentRequest } from "@/lib/instamojo";
import { getProductById } from "@/lib/products";
import { getBox, getChocolate } from "@/lib/hamperOptions";

export const runtime = "nodejs";

const FREE_SHIPPING_THRESHOLD = 499;
const SHIPPING_COST = 60;

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

    // Re-derive all prices server-side — never trust client-sent prices
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
        const box = getBox(item.hamper.boxId as never);
        const choco = getChocolate(item.hamper.chocolateId as never);
        linePrice += box.price + choco.price;
      }

      subtotal += linePrice * item.quantity;
      validatedItems.push(item);
    }

    const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
    const total = subtotal + shipping;

    // Encode order data into remarks — returned verbatim in webhook
    const orderData = {
      n: address.name,
      ph: address.phone,
      e: address.email || "",
      a: address.line1,
      c: address.city,
      s: address.state,
      p: address.pincode,
      nt: address.notes || "",
      i: validatedItems.map((it) => ({
        id: it.productId,
        q: it.quantity,
        ...(it.variant ? { v: it.variant } : {}),
        ...(it.hamper ? { h: `${it.hamper.boxId}::${it.hamper.chocolateId}` } : {}),
      })),
      sub: subtotal,
      sh: shipping,
      tot: total,
    };

    const remarks = JSON.stringify(orderData);
    const orderRef = `TFT-${Date.now()}`;
    const origin = req.headers.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "https://thefestivethread.com";

    const { paymentUrl } = await createPaymentRequest({
      amount: total,
      buyerName: address.name,
      email: address.email || "",
      phone: address.phone,
      purpose: orderRef,
      remarks,
      redirectUrl: `${origin}/order/success`,
      webhookUrl: `${origin}/api/webhooks/instamojo`,
    });

    return NextResponse.json({ paymentUrl, orderRef, total, shipping });
  } catch (err) {
    console.error("[orders/create]", err);
    return NextResponse.json({ error: "Failed to create payment request" }, { status: 500 });
  }
}
