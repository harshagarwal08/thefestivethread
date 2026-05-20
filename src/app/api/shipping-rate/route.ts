import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const FREE_SHIPPING_THRESHOLD = 0;
const FLAT_SHIPPING_RATE = 0;

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const pincode = searchParams.get("pincode") ?? "";
  const subtotal = Number(searchParams.get("subtotal") ?? 0);

  if (!/^\d{6}$/.test(pincode)) {
    return NextResponse.json({ error: "Invalid pincode" }, { status: 400 });
  }

  if (subtotal >= FREE_SHIPPING_THRESHOLD) {
    return NextResponse.json({ shipping: 0, free: true });
  }

  return NextResponse.json({ shipping: FLAT_SHIPPING_RATE, free: false });
}
