import { NextRequest, NextResponse } from "next/server";
import { kv } from "@/lib/kv";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ ref: string }> }
) {
  const { ref } = await params;

  if (!ref || !/^TFT-\d+$/.test(ref)) {
    return NextResponse.json({ error: "Invalid order ref" }, { status: 400 });
  }

  const order = await kv.get<Record<string, unknown>>(`order:${ref}`);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // Return only what the success page needs — no internal fields
  return NextResponse.json({
    orderRef: order.orderRef,
    status: order.status,
    items: order.items,
    address: order.address,
    subtotal: order.subtotal,
    shipping: order.shipping,
    total: order.total,
    awb: order.awb ?? null,
    courierName: order.courierName ?? null,
  });
}
