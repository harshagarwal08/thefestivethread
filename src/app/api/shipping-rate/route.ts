import { NextRequest, NextResponse } from "next/server";
import { getShippingRate } from "@/lib/shiprocket";

export const runtime = "nodejs";

const FREE_SHIPPING_THRESHOLD = 499;

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const pincode = searchParams.get("pincode") ?? "";
  const subtotal = Number(searchParams.get("subtotal") ?? 0);
  const hasHamper = searchParams.get("hasHamper") === "1";

  if (!/^\d{6}$/.test(pincode)) {
    return NextResponse.json({ error: "Invalid pincode" }, { status: 400 });
  }

  if (subtotal >= FREE_SHIPPING_THRESHOLD) {
    return NextResponse.json({ shipping: 0, free: true });
  }

  try {
    const weightKg = hasHamper ? 0.75 : 0.15;
    const rate = await getShippingRate(pincode, weightKg);
    return NextResponse.json({ shipping: rate, free: false });
  } catch (err) {
    console.error("[shipping-rate]", err);
    return NextResponse.json({ error: "Unable to calculate shipping for this pincode" }, { status: 422 });
  }
}
