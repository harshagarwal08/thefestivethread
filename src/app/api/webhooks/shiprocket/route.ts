import { NextRequest, NextResponse } from "next/server";
import { kv } from "@/lib/kv";
import { Resend } from "resend";

export const runtime = "nodejs";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM ?? "The Festive Thread <onboarding@resend.dev>";

interface StoredOrder {
  orderRef: string;
  address: {
    name: string; phone: string; email?: string;
    line1: string; city: string; state: string; pincode: string;
  };
  total: number;
  status: string;
}

function shippedEmail(order: StoredOrder, awb: string, courierName: string): string {
  const trackingUrl = `https://shiprocket.co/tracking/${awb}`;
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#F9F5EF;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F9F5EF;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border:1px solid #DDD4C4;">
        <tr><td style="padding:32px 40px 24px;border-bottom:1px solid #EDE5D8;text-align:center;">
          <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#8A7968;">The Festive Thread</p>
          <h1 style="margin:0;font-size:26px;font-weight:400;color:#1C1009;">Your Order is on its Way!</h1>
          <p style="margin:8px 0 0;font-size:12px;color:#8A7968;letter-spacing:0.1em;">${order.orderRef}</p>
        </td></tr>
        <tr><td style="padding:24px 40px;border-bottom:1px solid #EDE5D8;">
          <p style="margin:0;font-size:15px;color:#4A2C1A;line-height:1.7;">
            Dear ${order.address.name},<br/><br/>
            Great news! Your rakhi hamper has been dispatched and is on its way to you.
          </p>
        </td></tr>
        <tr><td style="padding:24px 40px;border-bottom:1px solid #EDE5D8;background:#FBF7F2;">
          <p style="margin:0 0 12px;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:#B5541E;">Tracking Details</p>
          <p style="margin:0 0 4px;font-size:13px;color:#8A7968;">Courier: <strong style="color:#1C1009;">${courierName}</strong></p>
          <p style="margin:0 0 16px;font-size:13px;color:#8A7968;">AWB: <strong style="color:#1C1009;">${awb}</strong></p>
          <a href="${trackingUrl}" style="display:inline-block;padding:12px 28px;background:#B5541E;color:#fff;text-decoration:none;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;">
            Track Your Order →
          </a>
        </td></tr>
        <tr><td style="padding:24px 40px;border-bottom:1px solid #EDE5D8;">
          <p style="margin:0 0 10px;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:#B5541E;">Delivery Address</p>
          <p style="margin:0;font-size:13px;color:#4A2C1A;line-height:1.8;">
            ${order.address.name}<br/>
            ${order.address.line1}<br/>
            ${order.address.city}, ${order.address.state} — ${order.address.pincode}<br/>
            ${order.address.phone}
          </p>
        </td></tr>
        <tr><td style="padding:24px 40px;text-align:center;">
          <p style="margin:0;font-size:13px;color:#8A7968;line-height:1.8;">
            Questions? WhatsApp us at <a href="https://wa.me/919883088575" style="color:#B5541E;">+91 98830 88575</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("[webhook/shiprocket] payload", JSON.stringify(body));

    // Shiprocket sends different payload shapes — normalise
    const awb: string = body.awb ?? body.AWB ?? "";
    const courierName: string = body.courier_name ?? body.CourierName ?? "";
    const orderRef: string = body.order_id ?? body.OrderID ?? "";
    const status: string = body.current_status ?? body.Status ?? "";

    // Only act on shipped/dispatched events
    const SHIPPED_STATUSES = ["Shipped", "Dispatched", "In Transit", "Pickup Scheduled", "Picked Up"];
    if (!SHIPPED_STATUSES.some(s => status.toLowerCase().includes(s.toLowerCase()))) {
      return NextResponse.json({ ok: true });
    }

    if (!orderRef || !awb) {
      console.warn("[webhook/shiprocket] missing orderRef or awb", { orderRef, awb });
      return NextResponse.json({ ok: true });
    }

    const order = await kv.get<StoredOrder>(`order:${orderRef}`);
    if (!order) {
      console.warn(`[webhook/shiprocket] order not found: ${orderRef}`);
      return NextResponse.json({ ok: true });
    }

    // Update order with AWB
    await kv.set(`order:${orderRef}`, { ...order, status: "SHIPPED", awb, courierName }, { ex: 60 * 60 * 24 * 30 });

    // Email customer
    if (order.address.email) {
      await resend.emails.send({
        from: FROM,
        to: order.address.email,
        subject: `Your order is on its way! — ${orderRef} · The Festive Thread`,
        html: shippedEmail(order, awb, courierName),
      });
      console.log(`[webhook/shiprocket] tracking email sent to ${order.address.email}`);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[webhook/shiprocket]", err);
    return NextResponse.json({ ok: true });
  }
}
