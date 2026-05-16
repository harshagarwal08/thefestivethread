import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookMAC } from "@/lib/instamojo";
import { createShiprocketOrder } from "@/lib/shiprocket";
import { getProductById } from "@/lib/products";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const payload: Record<string, string> = {};
    formData.forEach((v, k) => { payload[k] = String(v); });

    // Verify MAC — reject tampered payloads
    if (!verifyWebhookMAC(payload)) {
      console.error("[webhook/instamojo] MAC verification failed", payload);
      return NextResponse.json({ error: "Invalid MAC" }, { status: 400 });
    }

    const { status, payment_id, purpose: orderRef, remarks } = payload;

    if (status !== "Credit") {
      // Payment failed / pending — nothing to do
      return NextResponse.json({ ok: true });
    }

    // Decode order data from remarks
    let order: Record<string, unknown>;
    try {
      order = JSON.parse(remarks);
    } catch {
      console.error("[webhook/instamojo] Failed to parse remarks", remarks);
      return NextResponse.json({ error: "Invalid remarks" }, { status: 400 });
    }

    console.log(`[webhook/instamojo] Payment confirmed: ${payment_id} | Order: ${orderRef}`, order);

    const items = order.i as Array<{ id: string; q: number; v?: string; h?: string }>;
    const hasHamper = items.some((it) => !!it.h);

    const srItems = items.map((it) => {
      const product = getProductById(it.id);
      return {
        name: product?.name ?? it.id,
        sku: it.id,
        units: it.q,
        selling_price: product?.price ?? 0,
      };
    });

    const now = new Date();
    const orderDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    try {
      const sr = await createShiprocketOrder({
        orderRef,
        orderDate,
        buyerName: order.n as string,
        buyerEmail: order.e as string,
        buyerPhone: order.ph as string,
        address: order.a as string,
        city: order.c as string,
        state: order.s as string,
        pincode: order.p as string,
        total: order.tot as number,
        hasHamper,
        items: srItems,
      });
      console.log(`[webhook/instamojo] Shiprocket order created: ${sr.orderId} | AWB: ${sr.awb}`);
    } catch (srErr) {
      // Don't fail the webhook — Kavita can create the shipment manually from Shiprocket dashboard
      console.error("[webhook/instamojo] Shiprocket failed:", srErr);
    }

    // Send confirmation email if Resend is configured
    if (process.env.RESEND_API_KEY && order.e) {
      await sendConfirmationEmail(order, orderRef, payment_id);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[webhook/instamojo]", err);
    // Return 200 so Instamojo doesn't retry indefinitely
    return NextResponse.json({ ok: true });
  }
}

async function sendConfirmationEmail(order: Record<string, unknown>, orderRef: string, paymentId: string) {
  const items = order.i as Array<{ id: string; q: number; v?: string; h?: string }>;

  const itemLines = items.map((it) => {
    const hamper = it.h ? ` + Hamper (${it.h.replace("::", " · ")})` : "";
    const variant = it.v ? ` [${it.v}]` : "";
    return `• ${it.id}${variant}${hamper} × ${it.q}`;
  }).join("\n");

  const body = `
Hi ${order.n},

Your order has been confirmed! 🎉

Order Ref: ${orderRef}
Payment ID: ${paymentId}

ITEMS:
${itemLines}

Subtotal: ₹${order.sub}
Shipping: ${Number(order.sh) === 0 ? "Free" : `₹${order.sh}`}
Total: ₹${order.tot}

DELIVERY TO:
${order.a}, ${order.c}, ${order.s} — ${order.p}
${order.nt ? `\nNote: ${order.nt}` : ""}

We'll dispatch within 1–2 business days and share tracking details soon.

With love,
The Festive Thread
  `.trim();

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM ?? "The Festive Thread <orders@resend.dev>",
      to: order.e as string,
      subject: `Order Confirmed — ${orderRef} | The Festive Thread`,
      text: body,
    }),
  });
}
