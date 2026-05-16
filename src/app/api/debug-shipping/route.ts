import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  try {
    const loginRes = await fetch("https://apiv2.shiprocket.in/v1/external/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: process.env.SHIPROCKET_EMAIL,
        password: process.env.SHIPROCKET_PASSWORD,
      }),
    });
    const loginData = await loginRes.json();
    if (!loginRes.ok) return NextResponse.json({ step: "auth", status: loginRes.status, data: loginData });

    const token = loginData.token;
    const params = new URLSearchParams({
      pickup_postcode: process.env.SHIPROCKET_PICKUP_PINCODE!,
      delivery_postcode: "560102",
      weight: "0.15",
      cod: "0",
    });
    const srRes = await fetch(`https://apiv2.shiprocket.in/v1/external/courier/serviceability/?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const srData = await srRes.json();
    const couriers = srData?.data?.available_courier_companies ?? [];
    return NextResponse.json({ step: "serviceability", status: srRes.status, couriers: couriers.length, raw: srData?.message ?? null });
  } catch (err) {
    return NextResponse.json({ step: "exception", error: String(err) });
  }
}
