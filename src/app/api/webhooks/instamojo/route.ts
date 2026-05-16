import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookMAC } from "@/lib/instamojo";
import { createShiprocketOrder } from "@/lib/shiprocket";
import { getProductById } from "@/lib/products";
import { getBox, getChocolate } from "@/lib/hamperOptions";
import { kv } from "@/lib/kv";

export const runtime = "nodejs";

interface StoredOrder {
  orderRef: string;
  address: {
    name: string; phone: string; email?: string;
    line1: string; city: string; state: string; pincode: string; notes?: string;
  };
  items: Array<{
    id: string; name: string; quantity: number;
    variant?: string; hamper?: { boxId: string; chocolateId: string };
    lineTotal: number;
  }>;
  subtotal: number;
  shipping: number;
  total: number;
  status: string;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const payload: Record<string, string> = {};
    formData.forEach((v, k) => { payload[k] = String(v); });

    if (!verifyWebhookMAC(payload)) {
      console.error("[webhook/instamojo] MAC verification failed", payload);
      return NextResponse.json({ error: "Invalid MAC" }, { status: 400 });
    }

    const { status, payment_id, purpose: orderRef } = payload;

    if (status !== "Credit") {
      return NextResponse.json({ ok: true });
    }

    // Look up full order from KV
    const order = await kv.get<StoredOrder>(`order:${orderRef}`);
    if (!order) {
      console.error(`[webhook/instamojo] Order not found in KV: ${orderRef}`);
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Idempotency — skip if already processed
    if (order.status === "PAID") {
      console.log(`[webhook/instamojo] Already processed: ${orderRef}`);
      return NextResponse.json({ ok: true });
    }

    const paidAt = new Date().toISOString();

    // Mark as paid immediately so success page can verify
    await kv.set(`order:${orderRef}`, { ...order, status: "PAID", paymentId: payment_id, paidAt }, { ex: 60 * 60 * 24 * 30 });

    // Build Shiprocket line items with full prices
    const srItems = order.items.map((it) => {
      const hamperAdd = it.hamper
        ? getBox(it.hamper.boxId as never).price + getChocolate(it.hamper.chocolateId as never).price
        : 0;
      const product = getProductById(it.id);
      return {
        name: it.name,
        sku: it.id,
        units: it.quantity,
        selling_price: (product?.price ?? 0) + hamperAdd,
      };
    });

    const hasHamper = order.items.some((it) => !!it.hamper);
    const now = new Date();
    const orderDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    let sr;
    try {
      sr = await createShiprocketOrder({
        orderRef,
        orderDate,
        buyerName: order.address.name,
        buyerEmail: order.address.email || "noreply@thefestivethread.com",
        buyerPhone: order.address.phone,
        address: order.address.line1,
        city: order.address.city,
        state: order.address.state,
        pincode: order.address.pincode,
        total: order.total,
        hasHamper,
        items: srItems,
      });
      console.log(`[webhook/instamojo] Shiprocket order created: ${sr.orderId} | AWB: ${sr.awb}`);
      await kv.set(`order:${orderRef}`, {
        ...order,
        status: "PAID",
        paymentId: payment_id,
        paidAt,
        shiprocketOrderId: sr.orderId,
        awb: sr.awb ?? null,
        courierName: sr.courierName ?? null,
      }, { ex: 60 * 60 * 24 * 30 });
    } catch (srErr) {
      // Payment succeeded but shipping creation failed — mark distinctly so we can manually fix
      console.error(`[webhook/instamojo] NEEDS MANUAL DISPATCH — Shiprocket failed for ${orderRef}:`, srErr);
      await kv.set(`order:${orderRef}`, {
        ...order,
        status: "PAID_UNSHIPPED",
        paymentId: payment_id,
        paidAt,
        shiprocketError: String(srErr),
      }, { ex: 60 * 60 * 24 * 30 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[webhook/instamojo]", err);
    return NextResponse.json({ ok: true }); // 200 so Instamojo doesn't retry
  }
}

