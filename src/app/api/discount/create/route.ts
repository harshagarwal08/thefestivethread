import { NextRequest, NextResponse } from "next/server";
import { createDiscount } from "@/lib/discount";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const adminPw = req.headers.get("x-admin-password");
  if (adminPw !== process.env.ADMIN_PASSWORD)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { code, type, value, minOrder, maxUses, active, expiresAt } = body;

  if (!code || !type || typeof value !== "number")
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

  await createDiscount({
    code: code.toUpperCase(),
    type,
    value,
    minOrder: minOrder ?? 0,
    maxUses: maxUses ?? 0,
    active: active ?? true,
    expiresAt,
  });

  return NextResponse.json({ ok: true, code: code.toUpperCase() });
}
