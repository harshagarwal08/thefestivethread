import { NextRequest, NextResponse } from "next/server";
import { validateDiscount } from "@/lib/discount";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { code, cartTotal } = await req.json();
  if (!code || typeof cartTotal !== "number")
    return NextResponse.json({ valid: false, discount: 0, message: "Missing code or cartTotal" }, { status: 400 });

  const result = await validateDiscount(code, cartTotal);
  return NextResponse.json(result);
}
