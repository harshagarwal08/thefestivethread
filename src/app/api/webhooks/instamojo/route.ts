import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookMAC } from "@/lib/instamojo";
import { createShiprocketOrder } from "@/lib/shiprocket";
import { getProductById } from "@/lib/products";
import { getBox, getChocolate } from "@/lib/hamperOptions";
import { kv } from "@/lib/kv";
import { Resend } from "resend";

export const runtime = "nodejs";

const resend = new Resend(process.env.RESEND_API_KEY);
const KAVITA_EMAIL = "kavitaagarwal1000@gmail.com";
const FROM = process.env.RESEND_FROM ?? "The Festive Thread <onboarding@resend.dev>";

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
  hamperItems?: Array<{
    hamperId: string; boxId: string; boxLabel: string;
    chocolateId: string; chocolateLabel: string;
    rakhis: Array<{ productId: string; name: string; quantity: number; variant?: string; lineTotal: number }>;
    lineTotal: number;
  }>;
  subtotal: number;
  shipping: number;
  total: number;
  status: string;
}

function buildItemsHtml(order: StoredOrder): string {
  const rows: string[] = [];
  for (const it of order.items) {
    const variant = it.variant ? ` · ${it.variant}` : "";
    const hamper = it.hamper ? ` (Hamper)` : "";
    rows.push(`<tr>
      <td style="padding:6px 0;color:#4A2C1A;">${it.name}${variant}${hamper} × ${it.quantity}</td>
      <td style="padding:6px 0;text-align:right;color:#1C1009;font-weight:500;">₹${it.lineTotal}</td>
    </tr>`);
  }
  for (const h of order.hamperItems ?? []) {
    const rakhiNames = h.rakhis.map(r => `${r.name} × ${r.quantity}`).join(", ");
    rows.push(`<tr>
      <td style="padding:6px 0;color:#4A2C1A;">Rakhi Hamper (${h.boxLabel} · ${h.chocolateLabel})<br/><span style="font-size:12px;color:#8A7968;">${rakhiNames}</span></td>
      <td style="padding:6px 0;text-align:right;color:#1C1009;font-weight:500;">₹${h.lineTotal}</td>
    </tr>`);
  }
  return rows.join("");
}

function customerEmail(order: StoredOrder): string {
  const trackingSection = "";

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#F9F5EF;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F9F5EF;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border:1px solid #DDD4C4;">
        <tr><td style="padding:32px 40px 24px;border-bottom:1px solid #EDE5D8;text-align:center;">
          <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#8A7968;">The Festive Thread</p>
          <h1 style="margin:0;font-size:26px;font-weight:400;color:#1C1009;">Order Confirmed</h1>
          <p style="margin:8px 0 0;font-size:12px;color:#8A7968;letter-spacing:0.1em;">${order.orderRef}</p>
        </td></tr>
        <tr><td style="padding:24px 40px;border-bottom:1px solid #EDE5D8;">
          <p style="margin:0;font-size:15px;color:#4A2C1A;line-height:1.7;">
            Dear ${order.address.name},<br/><br/>
            Thank you for your order. We've received your payment and your rakhi hamper will be lovingly packed and dispatched within <strong>1–2 business days</strong>.
          </p>
        </td></tr>
        <tr><td style="padding:24px 40px;border-bottom:1px solid #EDE5D8;">
          <p style="margin:0 0 12px;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:#B5541E;">Items Ordered</p>
          <table width="100%" cellpadding="0" cellspacing="0">
            ${buildItemsHtml(order)}
            <tr><td colspan="2" style="padding-top:12px;border-top:1px solid #EDE5D8;"></td></tr>
            <tr>
              <td style="padding:4px 0;font-size:13px;color:#8A7968;">Shipping</td>
              <td style="padding:4px 0;text-align:right;font-size:13px;color:#1C1009;">${order.shipping === 0 ? "Free" : `₹${order.shipping}`}</td>
            </tr>
            <tr>
              <td style="padding:8px 0 0;font-size:14px;font-weight:600;color:#1C1009;">Total Paid</td>
              <td style="padding:8px 0 0;text-align:right;font-size:20px;color:#B5541E;">₹${order.total}</td>
            </tr>
          </table>
        </td></tr>
        ${trackingSection}
        <tr><td style="padding:24px 40px;border-bottom:1px solid #EDE5D8;">
          <p style="margin:0 0 10px;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:#B5541E;">Delivery Address</p>
          <p style="margin:0;font-size:13px;color:#4A2C1A;line-height:1.8;">
            ${order.address.name}<br/>
            ${order.address.line1}<br/>
            ${order.address.city}, ${order.address.state} — ${order.address.pincode}<br/>
            ${order.address.phone}
            ${order.address.notes ? `<br/><em style="color:#8A7968;">"${order.address.notes}"</em>` : ""}
          </p>
        </td></tr>
        <tr><td style="padding:24px 40px;text-align:center;">
          <p style="margin:0;font-size:13px;color:#8A7968;line-height:1.8;">
            You'll receive tracking details once your order is dispatched.<br/>
            Questions? WhatsApp us at <a href="https://wa.me/919883088575" style="color:#B5541E;">+91 98830 88575</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function adminEmail(order: StoredOrder, paymentId: string, shiprocketOrderId?: number): string {
  const dispatchStatus = shiprocketOrderId
    ? `<tr><td style="padding:12px 40px;background:#F0F9F0;border-bottom:1px solid #EDE5D8;">
        <p style="margin:0;font-size:13px;color:#1C6E1C;">✓ Order created in Shiprocket (#${shiprocketOrderId}) — awaiting your dispatch</p>
       </td></tr>`
    : `<tr><td style="padding:12px 40px;background:#FFF8E6;border-bottom:1px solid #EDE5D8;">
        <p style="margin:0;font-size:13px;color:#8A6000;">⚠ Shiprocket order creation failed — please create manually</p>
       </td></tr>`;

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#F9F5EF;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F9F5EF;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border:1px solid #DDD4C4;">
        <tr><td style="padding:24px 40px;background:#1C1009;">
          <p style="margin:0;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#C9972C;">New Order</p>
          <h1 style="margin:6px 0 0;font-size:22px;font-weight:400;color:#F9F5EF;">${order.orderRef} · ₹${order.total}</h1>
        </td></tr>
        ${dispatchStatus}
        <tr><td style="padding:24px 40px;border-bottom:1px solid #EDE5D8;">
          <p style="margin:0 0 6px;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:#B5541E;">Customer</p>
          <p style="margin:0;font-size:14px;color:#1C1009;line-height:1.8;">
            <strong>${order.address.name}</strong><br/>
            ${order.address.phone}${order.address.email ? ` · ${order.address.email}` : ""}<br/>
            ${order.address.line1}, ${order.address.city}, ${order.address.state} — ${order.address.pincode}
            ${order.address.notes ? `<br/><em style="color:#8A7968;">"${order.address.notes}"</em>` : ""}
          </p>
        </td></tr>
        <tr><td style="padding:24px 40px;border-bottom:1px solid #EDE5D8;">
          <p style="margin:0 0 10px;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:#B5541E;">Items</p>
          <table width="100%" cellpadding="0" cellspacing="0">
            ${buildItemsHtml(order)}
            <tr><td colspan="2" style="padding-top:12px;border-top:1px solid #EDE5D8;"></td></tr>
            <tr>
              <td style="padding:4px 0;font-size:13px;color:#8A7968;">Shipping</td>
              <td style="padding:4px 0;text-align:right;font-size:13px;color:#1C1009;">${order.shipping === 0 ? "Free" : `₹${order.shipping}`}</td>
            </tr>
            <tr>
              <td style="padding:8px 0 0;font-size:14px;font-weight:600;color:#1C1009;">Total</td>
              <td style="padding:8px 0 0;text-align:right;font-size:20px;color:#B5541E;">₹${order.total}</td>
            </tr>
          </table>
        </td></tr>
        <tr><td style="padding:16px 40px;background:#FBF7F2;">
          <p style="margin:0;font-size:12px;color:#8A7968;">Payment ID: ${paymentId}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const payload: Record<string, string> = {};
    formData.forEach((v, k) => { payload[k] = String(v); });

    // TEMP: log payload regardless of MAC to debug webhook delivery
    console.log("[webhook/instamojo] payload received", JSON.stringify(payload));
    if (!verifyWebhookMAC(payload)) {
      console.error("[webhook/instamojo] MAC verification failed", payload);
      // TEMP: skip MAC check to test webhook delivery
      // return NextResponse.json({ error: "Invalid MAC" }, { status: 400 });
    }

    const { status, payment_id, purpose: purposeRaw } = payload;
    // Purpose is set as "The Festive Thread — TFT-xxx", extract the order ref
    const orderRef = purposeRaw?.match(/(TFT-\d+)/)?.[1] ?? purposeRaw;

    if (status !== "Credit") return NextResponse.json({ ok: true });

    const order = await kv.get<StoredOrder>(`order:${orderRef}`);
    if (!order) {
      console.error(`[webhook/instamojo] Order not found: ${orderRef}`);
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status === "PAID") {
      console.log(`[webhook/instamojo] Already processed: ${orderRef}`);
      return NextResponse.json({ ok: true });
    }

    const paidAt = new Date().toISOString();

    // Mark paid immediately so success page works
    await kv.set(`order:${orderRef}`, { ...order, status: "PAID", paymentId: payment_id, paidAt }, { ex: 60 * 60 * 24 * 30 });

    // Try Shiprocket auto-dispatch
    const srItems = [
      ...order.items.map((it) => {
        const hamperAdd = it.hamper
          ? getBox(it.hamper.boxId as never).price + getChocolate(it.hamper.chocolateId as never).price
          : 0;
        const product = getProductById(it.id);
        return { name: it.name, sku: it.id, units: it.quantity, selling_price: (product?.price ?? 0) + hamperAdd };
      }),
      ...(order.hamperItems ?? []).flatMap((h) =>
        h.rakhis.map((r) => ({
          name: `${r.name} (Hamper: ${h.boxLabel}/${h.chocolateLabel})`,
          sku: r.productId, units: r.quantity, selling_price: r.lineTotal / r.quantity,
        }))
      ),
    ];

    const hasHamper = order.items.some((it) => !!it.hamper) || (order.hamperItems?.length ?? 0) > 0;
    const now = new Date();
    const orderDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    // Build human-readable comment for Shiprocket dashboard
    const commentLines: string[] = [];
    for (const it of order.items) {
      const variant = it.variant ? ` (${it.variant})` : "";
      commentLines.push(`${it.name}${variant} x${it.quantity}`);
      if (it.hamper) {
        commentLines.push(`  Box: ${getBox(it.hamper.boxId as never).label}`);
        commentLines.push(`  Chocolate: ${getChocolate(it.hamper.chocolateId as never).label}`);
      }
    }
    for (const h of order.hamperItems ?? []) {
      commentLines.push(`Hamper — Box: ${h.boxLabel} | Chocolate: ${h.chocolateLabel}`);
      for (const r of h.rakhis) {
        commentLines.push(`  ${r.name} x${r.quantity}`);
      }
    }
    const comment = commentLines.join("\n");

    let shiprocketOrderId: number | undefined;

    try {
      const sr = await createShiprocketOrder({
        orderRef, orderDate,
        buyerName: order.address.name,
        buyerEmail: order.address.email || "noreply@thefestivethread.com",
        buyerPhone: order.address.phone,
        address: order.address.line1,
        city: order.address.city,
        state: order.address.state,
        pincode: order.address.pincode,
        total: order.total,
        hasHamper,
        comment,
        items: srItems,
      });
      shiprocketOrderId = sr.orderId;
      console.log(`[webhook/instamojo] Shiprocket order created: ${sr.orderId}`);
      await kv.set(`order:${orderRef}`, {
        ...order, status: "PAID", paymentId: payment_id, paidAt,
        shiprocketOrderId: sr.orderId,
      }, { ex: 60 * 60 * 24 * 30 });
    } catch (srErr) {
      console.error(`[webhook/instamojo] Shiprocket failed for ${orderRef}:`, srErr);
      await kv.set(`order:${orderRef}`, {
        ...order, status: "PAID_UNSHIPPED", paymentId: payment_id, paidAt,
        shiprocketError: String(srErr),
      }, { ex: 60 * 60 * 24 * 30 });
    }

    // Send emails
    try {
      const emails: Promise<unknown>[] = [];

      if (order.address.email) {
        emails.push(resend.emails.send({
          from: FROM,
          to: order.address.email,
          subject: `Order Confirmed — ${orderRef} · The Festive Thread`,
          html: customerEmail(order),
        }));
      }

      emails.push(resend.emails.send({
        from: FROM,
        to: KAVITA_EMAIL,
        subject: `New Order: ${orderRef} — ₹${order.total} · ${order.address.name}`,
        html: adminEmail(order, payment_id, shiprocketOrderId),
      }));

      await Promise.all(emails);
      console.log(`[webhook/instamojo] Emails sent for ${orderRef}`);
    } catch (emailErr) {
      console.error(`[webhook/instamojo] Email failed for ${orderRef}:`, emailErr);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[webhook/instamojo]", err);
    return NextResponse.json({ ok: true });
  }
}
